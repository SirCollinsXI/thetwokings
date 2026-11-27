const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

const preview = new URL(process.env.PREVIEW_URL);
assert.match(preview.origin, /^https:\/\/[0-9a-f]+\.wuesten-bogen-app\.pages\.dev$/);
const games = [
  ['de', 'Wüstenbogen spielen', 'Piratenjagd spielen'],
  ['en', 'Play Desert Archery', 'Play Pirate Hunt'],
  ['zh', '玩沙漠射箭', '玩海盗冒险'],
];

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
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
