const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');

const preview = new URL(process.env.PREVIEW_URL);
assert.match(preview.origin, /^https:\/\/[0-9a-f]+\.wuesten-bogen-app\.pages\.dev$/);
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
  de: /Wilsons Deutsch-Lernecke/,
  en: /Wilson’s German Learning Corner/,
  zh: /Wilson.*德语/,
};

async function checkWilson(page, lang, redesigned) {
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
    if (redesigned) assert.equal(target.searchParams.get('homeLang'), lang, selector);
    if (selector.startsWith('#lernen ')) {
      assert.match(await page.locator('#lernen h2').innerText(), wilsonLabels[lang]);
    } else {
      assert.match(await entry.innerText(), wilsonLabels[lang], selector);
    }
  }
  if (redesigned) {
    assert(await page.locator('#lernen').evaluate(el =>
      Boolean(el.compareDocumentPosition(document.getElementById('spiele')) & Node.DOCUMENT_POSITION_FOLLOWING)));
  }
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
  if (!dir || lang === 'de') return;
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: join(dir, 'homepage-' + lang + '-' + page.viewportSize().width + '.png'), animations: 'disabled' });
}

async function run() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  try {
    for (const [path, source] of [['/', 'homepage'], ['/homepage-preview', 'homepage-preview']]) {
      for (const [lang, bow, pirate] of games) {
        const page = await browser.newPage({ viewport: { width: lang === 'en' ? 1440 : 390, height: 844 } });
        const url = new URL(path, preview);
        url.searchParams.set('lang', lang);
        const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 200, url.href);
        assert.equal(new URL(page.url()).origin, preview.origin);
        const redesigned = source === 'homepage-preview';
        await checkWilson(page, lang, redesigned);
        if (redesigned) await screenshotHomepage(page, lang);
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
        if (redesigned) {
          await testTrials(page, lang);
          if (lang === 'de') {
            await testTraces(page);
            await testCounter(page);
          }
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), url.href);
        console.log('HTTP 200; localized Wilson and games entries, prototype and layout verified:', url.href);
        await page.close();
      }
    }
    await testStudy(browser);
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
