const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');

const { readFileSync } = require('node:fs');
const { setTimeout: delay } = require('node:timers/promises');
const mode = process.argv[2] || 'preview';
assert.ok(['preview', 'before', 'published'].includes(mode), 'Unknown test mode');
const preview = new URL(mode === 'preview' ? process.env.PREVIEW_URL : 'https://thetwokings.de/');
if (mode === 'preview') assert.match(preview.origin, /^https:\/\/[0-9a-f]+\.wuesten-bogen-app\.pages\.dev$/);
const rootHTML = readFileSync(join(__dirname, '../index.html'), 'utf8');
const release = rootHTML.match(/<meta name="ttk-release" content="([^"]+)"/)?.[1];
assert.ok(release, 'Missing release marker in index.html');
const games = [
  ['de', 'Wüstenbogen spielen', 'Piratenjagd spielen'],
  ['en', 'Play Desert Archery', 'Play Pirate Hunt'],
  ['zh', '玩沙漠射箭', '玩海盗冒险'],
];

async function openStudy(page, query) {
  const url = new URL('/erstklick', preview);
  url.search = new URLSearchParams(query);
  const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200, url.href);
  assert.equal(new URL(page.url()).origin, preview.origin);
}

async function startStudy(page) {
  await page.locator('#start').click();
  await page.frameLocator('#site').locator('#projekte').waitFor();
  await page.locator('#loading').waitFor({ state: 'hidden' });
}

async function reportLines(page) {
  const report = page.locator('#report');
  await report.waitFor();
  return (await report.inputValue()).split('\n');
}

async function testStudy(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const paths = [
    ['A', 'en', ['#dino-probe summary', '[data-trial-net="3"]'], 'Goal reached · Yes'],
    ['A', 'de', ['#navigation a[href="#spiele"]', '#wuestenbogen-play'], 'Ziel erreicht · Ja'],
    ['A', 'zh', ['a[data-game="inselpfad"]'], '是否达成目标 · 是'],
    ['A', 'zh', ['#piratenjagd-play'], '是否达成目标 · 是'],
    ['A', 'en', ['.earlier-games', '#card-bogen'], 'Goal reached · Yes'],
    ['B', 'en', ['#comics .archive-entry', 'a[href*="monster-saga"].button'], 'Goal reached · Yes'],
    ['B', 'zh', ['#comics .project-link'], '是否达成目标 · 是'],
    ['C', 'en', ['#projekte a[data-link-language="home-only"]'], 'Goal reached · Yes'],
    ['D', 'de', ['#werkstatt [data-copy="pcOpen"]'], 'Ziel erreicht · Ja'],
    ['D', 'en', ['#piratenjagd-play'], 'Goal reached · No'],
  ];
  for (const [task, lang, selectors, outcome] of paths) {
    await openStudy(page, { runde: '2', aufgabe: task, lang });
    await startStudy(page);
    for (const selector of selectors) await page.frameLocator('#site').locator(selector).click();
    const lines = await reportLines(page);
    assert.equal(lines[0], 'TheTwoKings · T2 · ' + task + ' · ' + lang.toUpperCase());
    assert.ok(lines.includes(outcome), lines.join('\n'));
  }

  // A randomly assigned task must survive an intro language change. Stopping does not mark a wrong goal.
  await openStudy(page, { runde: '2', lang: 'de' });
  const languageLink = page.locator('#intro nav a[lang="en"]');
  const assigned = new URL(await languageLink.getAttribute('href'), page.url()).searchParams.get('aufgabe');
  assert.match(assigned || '', /^[A-D]$/);
  await languageLink.click();
  await startStudy(page);
  await page.locator('#stop').click();
  const stopped = await reportLines(page);
  assert.equal(stopped[0], 'TheTwoKings · T2 · ' + assigned + ' · EN');
  assert.ok(stopped.includes('Goal reached · Undetermined'), stopped.join('\n'));
  await page.locator('#retry').click();
  await page.locator('#start').waitFor();

  await openStudy(page, { lang: 'de' });
  await startStudy(page);
  await page.frameLocator('#site').locator('#projekte a[data-link-language="home-only"]').click();
  const legacy = await reportLines(page);
  assert.equal(legacy[0], 'TheTwoKings · T1 · DE');
  assert.ok(legacy.some(line => /^Geöffnet · Wilson/.test(line)), legacy.join('\n'));
  await page.close();
  console.log('Verified all four first-click tasks, both current games, a classic, wrong goal, stop, language change and legacy study.');
}

const wilsonLabels = {
  de: /Wilsons Lernecke/,
  en: /Wilson’s Learning Corner/,
  zh: /Wilson 的学习角/,
};

async function checkWilson(page, lang, redesigned, source, label = wilsonLabels[lang]) {
  const selectors = redesigned
    ? ['#navigation', '#projekte', '#lernen', 'footer'].map(area => area + ' a[data-link-language="home-only"]')
    : ['header nav a[data-wilson-entry]', '#lernen[data-wilson-entry]', 'footer a[data-wilson-entry]'];
  for (const selector of selectors) {
    const entry = page.locator(selector);
    await entry.waitFor();
    const target = new URL(await entry.getAttribute('href'), page.url());
    assert.equal(target.origin, preview.origin);
    assert.match(target.pathname, /^\/wilson(?:\.html)?$/, selector);
    assert.equal(target.searchParams.get('lang'), lang, selector);
    if (source && redesigned) assert.equal(target.searchParams.get('from'), source, selector);
    if (redesigned) assert.equal(target.searchParams.get('homeLang'), lang, selector);
    if (selector.startsWith('#lernen ')) {
      assert.match(await page.locator('#lernen h2').innerText(), label);
    } else {
      assert.match(await entry.innerText(), label, selector);
    }
  }
  if (redesigned) {
    assert(await page.locator('#lernen').evaluate(el =>
      Boolean(el.compareDocumentPosition(document.getElementById('spiele')) & Node.DOCUMENT_POSITION_FOLLOWING)));
  }
}

async function testPublicWall(page) {
  const response = await page.request.get(new URL('/api/spuren', preview).href);
  assert.match(response.headers()['content-type'], /application\/json/);
  const state = await response.json();
  assert([200, 503].includes(response.status()));
  await page.locator('.wall-invite').click();
  const wall = page.locator('#grusswand');
  await wall.locator('[data-wall-refresh]').waitFor();
  const active = response.status() === 200;
  assert.equal(await wall.locator('.wall-board').isVisible(), active);
  if (active) {
    assert.match(state.day, /^\d{4}-\d{2}-\d{2}$/);
    for (const key of ['wave', 'star', 'crown']) assert(Number.isSafeInteger(state.counts[key]));
  } else {
    assert.equal(state.error, 'unavailable');
    assert.equal(await wall.locator('[data-mark]:visible').count(), 0);
  }
  console.log('Cloudflare public wall HTTP', response.status(), active ? 'connected' : 'unavailable');
}

async function testWorkshop(page, lang) {
  const url = new URL('/werkstatt', preview);
  url.searchParams.set('lang', lang);
  const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200);
  await page.locator('#symptom').selectOption('fps');
  await page.locator('#use').selectOption('gaming');
  await page.locator('#upgrade-form [type="submit"]').click();
  const title = page.locator('#upgrade-title');
  await title.waitFor();
  assert((await title.innerText()).trim().length > 0);
  assert.equal(await page.locator('#system-file').inputValue(), '');
  await page.locator('#symptom').selectOption('none');
  await page.locator('#upgrade-form [type="submit"]').click();
  assert.equal(await title.evaluate(el => el === document.activeElement), true);
}

async function testTraces(page) {
  await page.locator('[data-trace-context="lernen"]').click();
  assert.equal(await page.locator('#trace-context').inputValue(), 'lernen');
  const localNote = 'Homepage preview browser test';
  await page.locator('#trace-note').fill(localNote);
  await page.locator('#trace-form [type="submit"]').click();
  await page.locator('#trace-list').getByText(localNote, { exact: true }).waitFor();
  await page.locator('[data-trace-context="spiele"]').click();
  assert.equal(await page.locator('#trace-context').inputValue(), 'spiele');
  assert.equal(await page.locator('#trace-list').getByText(localNote, { exact: true }).count(), 0);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('[data-trace-context="lernen"]').click();
  await page.locator('#trace-list').getByText(localNote, { exact: true }).waitFor();
}

async function testCounter(page) {
  const panel = page.locator('#stats-panel');
  const delivered = await panel.evaluate(el => ({ ...el.dataset }));
  if (delivered.views === undefined || !delivered.start || !delivered.day) {
    assert(await panel.isHidden(), 'Missing measurements must keep the whole counter hidden');
  }
  // Exercise client rendering without writing any analytics data on the server.
  await panel.evaluate(el => {
    delete el.dataset.views; delete el.dataset.start; delete el.dataset.day;
  });
  await page.locator('button[data-lang="en"]').click();
  assert(await panel.isHidden());
  await panel.evaluate(el => Object.assign(el.dataset, { views: '0', start: '2026-11-25', day: '2026-11-27' }));
  await page.locator('button[data-lang="zh"]').click();
  assert(await panel.isVisible(), 'A measured zero is a real reading');
  assert.equal(await page.locator('#stats-views').innerText(), '0');
  assert.equal(await page.locator('#stats-start').getAttribute('datetime'), '2026-11-25');
  assert.equal(await page.locator('#stats-day').getAttribute('datetime'), '2026-11-27');
  await panel.evaluate(el => { el.dataset.views = 'unavailable'; });
  await page.locator('button[data-lang="de"]').click();
  assert(await panel.isHidden(), 'A stale number must disappear when measurements are invalid');
}

async function testTrials(page, lang) {
  await page.locator('#bogen-probe summary').click();
  const aim = page.locator('#trial-aim');
  await aim.focus();
  await aim.press('ArrowLeft');
  await page.locator('#trial-shoot').click();
  const bow = { de: 'Volltreffer', en: 'Bullseye', zh: '正中靶心' };
  assert((await page.locator('#bow-result').innerText()).includes(bow[lang]));
  await page.locator('#dino-probe summary').click();
  await page.locator('[data-trial-net="3"]').click();
  const dino = { de: 'Gefangen auf Feld 3', en: 'Caught in lane 3', zh: '第 3 格' };
  assert((await page.locator('#dino-result').innerText()).includes(dino[lang]));
}

async function screenshotHomepage(page, lang) {
  const dir = process.env.HOMEPAGE_SCREENSHOTS;
  if (!dir) return;
  await mkdir(dir, { recursive: true });
  const suffix = lang + '-' + page.viewportSize().width + '.png';
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: join(dir, 'homepage-' + suffix), animations: 'disabled' });
  for (const [name, selector] of [['intro', '.intro'], ['comics', '#comics']]) {
    await page.locator(selector).screenshot({ path: join(dir, name + '-' + suffix), animations: 'disabled' });
  }
}

async function checkHomepageArt(page, lang, source) {
  const original = page.viewportSize();
  const widths = new Set([original.width, 390, 1440]);
  if (source === 'homepage' && lang === 'de') widths.add(320);
  const hero = page.locator('img.intro-art');
  const comic = page.locator('#comics .comic-scene img[alt]');
  const scene = page.locator('#comics .comic-scene');
  const description = await comic.getAttribute('alt');
  const language = {
    de: /Planke|Pirat|Schiff|Meer|Seeungeheuer|Welle|Seil|Junge|Deck|Mütze|Kapitän|springt/i,
    en: /plank|pirate|ship|sea|wave|rope|boy|deck|captain|jump/i,
    zh: /\p{Script=Han}/u,
  };
  assert.ok(description && description.trim().length >= 6, 'Sam’s artwork needs a descriptive alternative');
  assert.match(description, language[lang], 'Comic description in ' + lang);
  for (const width of widths) {
    await page.setViewportSize({ width, height: original.height });
    for (const [image, expected] of [
      [hero, /^\/assets\/zwei-kronen-(640|1200)\.webp$/],
      [comic, /^\/assets\/sam-piet-planke-(540|900)\.webp$/],
    ]) {
      await image.scrollIntoViewIfNeeded();
      assert.ok(await image.isVisible(), 'Artwork must be visible at ' + width + 'px');
      const path = await image.evaluate(async element => {
        await element.decode();
        if (!element.naturalWidth || !element.naturalHeight) throw new Error('Artwork did not decode');
        return new URL(element.currentSrc).pathname;
      });
      assert.match(path, expected);
    }
    const [picture, frame] = await Promise.all([comic.boundingBox(), scene.boundingBox()]);
    assert.ok(frame.width > 0 && frame.height > 0);
    assert.equal(await comic.evaluate(el => getComputedStyle(el).objectFit), 'cover');
    assert.ok(picture.x <= frame.x + 3 && picture.y <= frame.y + 3
      && picture.x + picture.width >= frame.x + frame.width - 3
      && picture.y + picture.height >= frame.y + frame.height - 3, 'Comic image should fill its frame at ' + width + 'px');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow at ' + width);
  }
  await page.setViewportSize(original);
  console.log('Verified visible crowns and full-frame comic with localized description at ' + [...widths].join('/') + 'px (' + lang + ')');
}

async function checkReleasePage(page, lang, source) {
  assert.equal(await page.locator('meta[name="ttk-release"]').getAttribute('content'), release);
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  assert.equal(robots.split(/[,\s]+/).includes('noindex'), source === 'homepage-preview');
  assert.equal(await page.locator('html').getAttribute('lang'), lang === 'zh' ? 'zh-CN' : lang);
  const names = {
    de: ['Sams Comic-Werkstatt', 'Phils PC-Werkstatt', 'Prototyp'],
    en: ['Sam’s Comic Workshop', 'Phil’s PC Workshop', 'Prototype'],
    zh: ['Sam 的漫画工坊', 'Phil 的电脑工坊', '原型'],
  };
  for (const [selector, label] of [['#comics-title', 0], ['#pc-title', 1], ['#werkstatt [data-copy="prototype"]', 2]]) {
    assert.equal((await page.locator(selector).first().innerText()).trim(), names[lang][label]);
  }
  for (const [selector, path] of [['#comics .archive-entry', '/comics'], ['#comics .project-link', '/comic'], ['#werkstatt [data-copy="pcOpen"]', '/werkstatt']]) {
    const link = new URL(await page.locator(selector).getAttribute('href'), page.url());
    assert.equal(link.origin, preview.origin);
    assert.equal(link.pathname.replace(/\.html$/, ''), path);
    assert.equal(link.searchParams.get('from'), source);
    assert.equal(link.searchParams.get('lang'), lang);
  }
  for (const [selector, hash] of [['[data-wall-word="privacy"]', lang === 'de' ? '#spuren' : '#spuren-' + lang],
    ['footer [data-copy="privacy"]', ''], ['footer [data-copy="imprint"]', '']]) {
    const link = new URL(await page.locator(selector).getAttribute('href'), page.url());
    const path = selector.includes('imprint') ? 'impressum' : 'datenschutz';
    assert.equal(link.origin, preview.origin);
    assert.equal(link.pathname.replace(/\.html$/, ''), '/' + path);
    assert.equal(link.hash, hash);
    if (hash) {
      const info = await page.request.get(link.href);
      assert.equal(info.status(), 200);
      assert((await info.text()).includes('id="' + hash.slice(1) + '"'), link.href);
    }
  }
  await checkHomepageArt(page, lang, source);
  assert.ok(await page.locator('#lernen img').first().evaluate(async img => {
    await img.decode();
    return img.naturalWidth > 0;
  }));
  const [main, sidebar] = await Promise.all([page.locator('main').boundingBox(), page.locator('aside.rail').boundingBox()]);
  assert(page.viewportSize().width >= 1088 ? sidebar.x >= main.x + main.width - 1 : sidebar.y >= main.y + main.height - 1,
    'Guestbook must sit beside desktop content and below mobile content');
  const focus = page.locator('#lernen .project-link');
  await page.keyboard.press('Tab');
  await focus.focus();
  assert(await focus.evaluate(el => el === document.activeElement && getComputedStyle(el).outlineStyle !== 'none'),
    'Wilson card needs a visible keyboard focus');
  const panel = page.locator('#stats-panel');
  if (!await panel.getAttribute('data-start') || !await panel.getAttribute('data-day') || await panel.getAttribute('data-views') === null) {
    assert(await panel.isHidden(), 'Hide the counter when measurements are missing');
  }
}

async function checkFormerBookmarks(browser) {
  const page = await browser.newPage();
  try {
    for (const [hash, section] of [['arbeiten', '#projekte'], ['pc', '#werkstatt'], ['wilson-card-name', '#lernen']]) {
      await page.goto(new URL('/?lang=zh#' + hash, preview).href);
      assert(await page.locator(section + ' #' + hash).isVisible(), 'Legacy bookmark #' + hash);
    }
    for (const hash of ['budget', 'compare', 'parts']) {
      await page.goto(new URL('/?lang=zh#' + hash, preview).href, { waitUntil: 'commit' });
      await page.waitForURL(url => /^\/klassische-startseite(?:\.html)?$/.test(url.pathname)
        && url.hash === '#' + hash && url.searchParams.get('lang') === 'zh');
      await page.locator('#' + hash).waitFor();
    }
  } finally {
    await page.close();
  }
}

function mainMarkup(html) {
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0];
  assert.ok(main, 'Missing main element');
  return main.replaceAll('\r\n', '\n');
}

function scriptSources(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)].map(match => match[1])
    .filter(src => ['homepage-preview.js', 'spiele-texte.js', 'guest-freigaben.js', 'guest-wall.js', 'public-wall.js'].includes(new URL(src, preview).pathname.slice(1)));
}

// Pages can briefly serve different homepage versions for each cached language URL.
async function awaitRelease(browser) {
  const main = mainMarkup(rootHTML);
  const sources = scriptSources(rootHTML);
  assert.deepEqual(sources.map(src => new URL(src, preview).pathname).sort(),
    ['/guest-freigaben.js', '/guest-wall.js', '/homepage-preview.js', '/public-wall.js', '/spiele-texte.js']);
  const scripts = sources.map(src => {
    const url = new URL(src, preview);
    return { url, content: readFileSync(join(__dirname, '..', url.pathname.slice(1)), 'utf8').replaceAll('\r\n', '\n') };
  });
  const page = await browser.newPage();
  async function delivered(url) {
    const response = await page.request.get(url.href, { timeout: 10000 });
    assert.equal(response.status(), 200, url.href);
    assert.equal(response.url(), url.href);
    return (await response.text()).replaceAll('\r\n', '\n');
  }
  try {
    for (let attempt = 1; attempt <= 18; attempt++) {
      try {
        const languageQueries = games.map(([lang]) => '?lang=' + lang);
        for (const query of ['', ...languageQueries, ...languageQueries.map(value => value + '&section=werkstatt')]) {
          const url = new URL('/' + query, preview);
          const html = await delivered(url);
          assert.ok(html.includes('id="feedback-note"') && html.includes('src="feedback-ideen.js"'),
            'Waiting for the feedback form on ' + url.href);
          assert.ok(html.includes('id="guest-form"') && html.includes('id="gastgruesse"'),
            'Waiting for the moderated guest form and public list on ' + url.href);
          assert.ok(mainMarkup(html) === main, 'Waiting for current homepage markup on ' + url.href);
          assert.deepEqual(scriptSources(html), sources, 'Waiting for current translation script URLs on ' + url.href);
        }
        for (const { url, content } of scripts) {
          assert.ok(await delivered(url) === content, 'Waiting for the committed script contents on ' + url.href);
        }
        return;
      } catch (error) {
        if (attempt === 18) throw error;
        console.log('Release attempt ' + attempt + '/18:', error.message);
        await delay(10000);
      }
    }
  } finally {
    await page.close();
  }
}

async function testMissingGameTranslation(browser) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let intercepted = false;
  try {
    await page.route(url => url.pathname === '/spiele-texte.js', async route => {
      const response = await route.fetch();
      const body = await response.text();
      intercepted = true;
      await route.fulfill({ response, body: body + '\ndelete homepageGamesCopy.tideName;\n' });
    });
    await page.goto(new URL('/?lang=zh', preview).href, { waitUntil: 'domcontentloaded' });
    assert.ok(intercepted, 'The test must exercise the incomplete game dictionary');
    for (const [lang, bow] of [games[2], games[1], games[0]]) {
      await page.locator('button[data-lang="' + lang + '"]').click();
      await checkWilson(page, lang, true, 'homepage');
      assert.equal(new URL(page.url()).searchParams.get('lang'), lang);
      assert.equal(await page.locator('#wuestenbogen-play').innerText(), bow);
      const game = new URL(await page.locator('[data-game="inselpfad"]').getAttribute('href'), page.url());
      assert.equal(game.searchParams.get('lang'), lang);
      assert.ok((await page.locator('#tide-name').innerText()).trim());
    }
    assert.deepEqual(errors, [], 'A missing game translation must leave the rest of the homepage interactive');
  } finally {
    await page.close();
  }
}

async function run() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  try {
    if (mode === 'before') {
      const page = await browser.newPage();
      const response = await page.goto(new URL('/?lang=de', preview).href, { waitUntil: 'domcontentloaded' });
      assert.equal(response.status(), 200);
      assert.equal(new URL(page.url()).origin, preview.origin);
      const redesigned = await page.locator('meta[name="ttk-release"]').count() > 0;
      // A pre-merge baseline may still have the former published German project name.
      const label = redesigned ? wilsonLabels.de : /Wilsons (?:Deutsch-Lernecke|Lernecke)/;
      await checkWilson(page, 'de', redesigned, undefined, label);
      console.log('Public homepage before merge:', page.url(), redesigned ? 'redesigned homepage' : 'classic homepage', await page.title());
      return;
    }
    if (mode === 'published') await awaitRelease(browser);
    const routes = [['/', 'homepage']];
    if (mode === 'preview') routes.push(['/homepage-preview', 'homepage-preview'], ['/klassische-startseite', 'klassische-startseite']);
    for (const [path, source] of routes) {
      for (const [lang, bow, pirate] of games) {
        const page = await browser.newPage({ viewport: { width: lang === 'en' ? 1440 : 390, height: 844 } });
        const url = new URL(path, preview);
        url.searchParams.set('lang', lang);
        const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 200, url.href);
        assert.equal(new URL(page.url()).origin, preview.origin);
        const redesigned = source !== 'klassische-startseite';
        await checkWilson(page, lang, redesigned, source);
        if (redesigned) await checkReleasePage(page, lang, source);
        if (source === 'homepage') await screenshotHomepage(page, lang);
        const section = page.locator('#spiele');
        for (const [label, file] of [[bow, 'wuestenbogen'], [pirate, 'piratenjagd']]) {
          const link = section.locator('.playable-games').getByRole('link', { name: label, exact: true });
          await link.waitFor();
          const target = new URL(await link.getAttribute('href'), page.url());
          assert.equal(target.origin, preview.origin);
          assert.match(target.pathname, new RegExp('/' + file + '(?:\\.html)?$'));
          assert.equal(target.searchParams.get('from'), source);
          assert.equal(target.searchParams.get('lang'), lang);
          const img = link.locator('img');
          await img.scrollIntoViewIfNeeded();
          assert.equal(new URL(await img.getAttribute('src'), page.url()).pathname, '/game-assets/thumbs/' + file + '.webp');
          assert.ok(await img.evaluate(async element => {
            await element.decode();
            return element.naturalWidth > 0 && element.naturalHeight > 0;
          }));
        }
        assert.match(await section.locator('#wehr').innerText(), /Windows/);
        assert.equal(await section.locator('#wehr a').count(), 0);
        if (source === 'homepage') {
          await testTrials(page, lang);
          if (lang === 'de') {
            await testPublicWall(page);
            if (mode === 'preview') {
              await testTraces(page);
              await testCounter(page);
            }
          }
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), url.href);
        console.log('HTTP 200; localized Wilson and games entries, prototype and layout verified:', url.href);
        if (mode === 'preview' && source === 'homepage') await testWorkshop(page, lang);
        await page.close();
      }
    }
    await require('./test-entwicklungsideen.cjs')(browser, preview);
    await require('./test-gastgruesse.cjs')(browser, preview);
    await checkFormerBookmarks(browser);
    await require('./test-share-card.cjs')(browser, preview, '/');
    if (mode === 'preview') {
      await testMissingGameTranslation(browser);
      await testStudy(browser);
      await require('./test-share-card.cjs')(browser, preview, '/homepage-preview');
    }
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
