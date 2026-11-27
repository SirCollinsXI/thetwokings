const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { setTimeout: pause } = require('node:timers/promises');
const { chromium } = require('playwright-core');

const siteRoot = process.cwd();
const titles = { de: 'Die Gezeitenpost', en: 'The Tide Post', zh: '潮汐邮局' };
const languages = Object.keys(titles);
const entry = '#spiele a[data-game="inselpfad"]';
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.avif': 'image/avif', '.json': 'application/json', '.woff2': 'font/woff2',
};

// Pages exposes static HTML under extensionless paths. Keep the PR test on loopback.
async function startLocalSite() {
  const server = http.createServer(async (req, res) => {
    try {
      const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const relative = route.endsWith('/') ? route + 'index.html' : route;
      let file = path.resolve(siteRoot, '.' + relative);
      if (!file.startsWith(siteRoot + path.sep)) throw new Error('Outside site');
      if (!path.extname(file)) file += '.html';
      const body = await fs.readFile(file);
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  return { origin: 'http://127.0.0.1:' + server.address().port, close: () => server.close() };
}

async function waitForProduction(origin) {
  const files = ['inselpfad.css', 'inselpfad.js', 'inselpfad-kern.js', 'inselpfad-szene.js', 'spiele-texte.js'];
  const normalize = source => source.replace(/\r\n/g, '\n');
  const expected = new Map(await Promise.all(files.map(async file => [
    file, normalize(await fs.readFile(path.join(siteRoot, file), 'utf8')),
  ])));
  const revision = process.env.GITHUB_SHA || 'verify';
  let lastError;
  for (let attempt = 1; attempt <= 36; attempt++) {
    try {
      await Promise.all(['', ...files].map(async file => {
        const url = new URL('/' + file, origin);
        url.searchParams.set('_release', revision + '-' + attempt);
        const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
        assert.equal(response.status, 200, url.pathname);
        const text = await response.text();
        if (file) {
          assert.ok(normalize(text) === expected.get(file), 'Release pending at /' + file);
        } else {
          assert.match(text, /data-game\s*=\s*["']inselpfad["']/, 'Homepage entry pending');
          assert.ok(text.includes('game-assets/thumbs/inselpfad.jpg'), 'Homepage artwork pending');
        }
      }));
      console.log('Homepage and current Inselpfad assets have reached ' + origin);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 36) await pause(8000);
    }
  }
  throw new Error('Timed out waiting for the production deployment: ' + lastError.message);
}

async function tabTo(page, target) {
  await target.waitFor();
  const visited = new Set();
  for (let count = 0; count < 180; count++) {
    if (await target.evaluate(el => el === document.activeElement || el.contains(document.activeElement))) return;
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      return Array.prototype.indexOf.call(elements, document.activeElement);
    });
    if (visited.has(focus)) break;
    visited.add(focus);
  }
  throw new Error('Keyboard focus cannot reach ' + target);
}

async function checkRound(page, touch) {
  const board = page.locator('#board');
  const signal = page.locator('#signal[role="status"]');
  const turn = page.locator('#turn');
  const attr = name => board.getAttribute('data-' + name);
  const event = () => signal.getAttribute('data-event');
  const assertTurn = async n => assert.equal((await turn.innerText()).trim(), String(n));
  async function activate(button) {
    if (touch) return button.tap();
    await tabTo(page, button);
    await page.keyboard.press('Enter');
  }
  async function move(direction) {
    if (touch) return page.locator('#direction-pad button[data-dir="' + direction + '"]').tap();
    await tabTo(page, board);
    const key = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[direction];
    await page.keyboard.press(key);
  }
  async function assertStart() {
    assert.equal(await attr('status'), 'playing');
    assert.equal(await attr('x'), '0');
    assert.equal(await attr('y'), '3');
    assert.equal(await attr('carrying'), 'false');
    await assertTurn(0);
  }
  await board.waitFor();
  await board.locator('canvas.map-art').waitFor();
  assert.equal(await attr('painted'), 'true');
  await assertStart();
  await move('left');
  assert.equal(await event(), 'edge');
  await assertTurn(0);
  if (touch) {
    await board.locator('button.tile[data-x="0"][data-y="2"]').tap();
  } else {
    await move('up');
  }
  await move('up');
  assert.equal(await attr('carrying'), 'true');
  assert.equal(await event(), 'parcel');
  await move('down');
  await move('right');
  assert.equal(await event(), 'tide');
  assert.equal(await attr('tide'), 'high');
  await assertTurn(3);
  await activate(page.locator('#wait'));
  await assertTurn(4);
  for (let i = 0; i < 4; i++) await move('right');
  assert.equal(await attr('status'), 'won');
  assert.equal(await event(), 'won');
  assert.ok((await signal.innerText()).trim());
  await assertTurn(8);
  await activate(page.locator('#reset'));
  await assertStart();
}

async function testGame(browser, origin, lang, touch) {
  const viewport = touch ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await browser.newContext({
    viewport,
    isMobile: touch, hasTouch: touch, locale: lang === 'zh' ? 'zh-CN' : lang,
  });
  try {
    const page = await ctx.newPage();
    page.setDefaultTimeout(8000);
    const response = await page.goto(origin + '/?lang=' + lang + '#spiele', { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    const link = page.locator(entry);
    await link.waitFor();
    const artwork = link.locator('img.tide-map');
    await artwork.scrollIntoViewIfNeeded();
    await artwork.waitFor();
    const picture = await artwork.evaluate(async image => {
      await image.decode();
      return { url: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight };
    });
    assert.equal(new URL(picture.url).pathname, '/game-assets/thumbs/inselpfad.jpg');
    assert.ok(picture.width > 0 && picture.height > 0, 'Missing decoded game artwork');
    const target = new URL(await link.getAttribute('href'), page.url());
    assert.equal(target.origin, origin);
    assert.match(target.pathname, /^\/inselpfad(?:\.html)?$/);
    assert.equal(target.searchParams.get('lang'), lang);
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    if (touch) {
      await link.tap();
    } else {
      await tabTo(page, link);
      await page.keyboard.press('Enter');
    }
    await page.waitForURL(url => /^\/inselpfad(?:\.html)?$/.test(url.pathname));
    assert.equal(new URL(page.url()).origin, origin);
    assert.equal(new URL(page.url()).searchParams.get('lang'), lang);
    await page.locator('#board').waitFor();
    const documentLang = () => page.locator('html').getAttribute('lang');
    assert.equal((await documentLang()).split('-')[0], lang);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(width <= viewport.width + 1, 'Horizontal overflow: ' + width + ' at ' + viewport.width);
    await checkRound(page, touch);
    const heading = (await page.locator('h1').innerText()).trim();
    assert.equal(heading, titles[lang]);
    const nextLang = languages[(languages.indexOf(lang) + 1) % languages.length];
    const switcher = page.locator('[data-lang="' + nextLang + '"]');
    if (touch) {
      await switcher.tap();
    } else {
      await tabTo(page, switcher);
      await page.keyboard.press('Enter');
    }
    await page.waitForFunction(code => document.documentElement.lang.split('-')[0] === code, nextLang);
    assert.equal((await page.locator('h1').innerText()).trim(), titles[nextLang]);
    const back = new URL(await page.locator('#home').getAttribute('href'), page.url());
    assert.equal(back.origin, origin);
    assert.equal(back.pathname, '/');
    assert.equal(back.hash, '#spiele');
    assert.equal(back.searchParams.get('lang'), nextLang);
    assert.deepEqual(errors, []);
    console.log([touch ? '390px touch' : '1440px keyboard', lang, heading, 'win/reset/language OK'].join(' | '));
  } finally {
    await ctx.close();
  }
}

async function main() {
  const live = process.env.INSELPFAD_PRODUCTION === '1';
  const site = live ? { origin: 'https://thetwokings.de', close() {} } : await startLocalSite();
  let browser;
  try {
    if (live) await waitForProduction(site.origin);
    browser = await chromium.launch({ executablePath: process.env.CHROME });
    const direct = await browser.newPage();
    const response = await direct.goto(site.origin + '/inselpfad', { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    await direct.locator('#board').waitFor();
    await direct.close();
    for (const touch of [false, true]) {
      for (const lang of languages) await testGame(browser, site.origin, lang, touch);
    }
  } finally {
    if (browser) await browser.close();
    site.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
