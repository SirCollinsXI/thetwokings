const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

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
    ['A', 'de', ['#navigation a[href="#spiele"]', '#wuestenbogen-play'], 'Ziel erreicht · Ja'],
    ['A', 'zh', ['#piratenjagd-play'], '已到达目标 · 是'],
    ['A', 'en', ['.earlier-games', '#card-bogen'], 'Goal reached · Yes'],
    ['B', 'zh', ['#comics .project-link'], '已到达目标 · 是'],
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
  assert.ok(legacy.includes('Geöffnet · Wilsons Trainingsecke'), legacy.join('\n'));
  await page.close();
  console.log('Verified all four first-click tasks, both current games, a classic, wrong goal, stop, language change and legacy study.');
}

async function run() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  try {
    for (const [path, source] of [['/', 'homepage'], ['/homepage-preview', 'homepage-preview']]) {
      for (const [lang, bow, pirate] of games) {
        const page = await browser.newPage({ viewport: { width: lang === 'en' ? 1440 : 390, height: 844 } });
        const url = new URL(path, preview);
        url.searchParams.set('lang', lang);
        url.hash = 'spiele';
        const response = await page.goto(url.href, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 200, url.href);
        assert.equal(new URL(page.url()).origin, preview.origin);
        const section = page.locator('#spiele');
        for (const [label, file] of [[bow, 'wuestenbogen'], [pirate, 'piratenjagd']]) {
          const link = section.getByRole('link', { name: label, exact: true });
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
        console.log('HTTP 200, both localized game cards and prototype verified:', url.href);
        await page.close();
      }
    }
    await testStudy(browser);
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
