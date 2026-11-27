'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

async function run() {
  const base = new URL(process.env.COMIC_TEST_URL || 'http://127.0.0.1:8765/comic.html');
  const browser = await chromium.launch({ executablePath: process.env.CHROME, headless: true });
  try {
    const page = await browser.newPage({ viewport: {width: 390, height: 844}, isMobile:true, hasTouch:true });
    const catalogue = new URL('/comics.html?lang=de#werkstatt', base).href;
    await page.goto(catalogue);
    await page.locator('#werkstatt-title').waitFor();
    const links = await page.locator('.workshop-links a').evaluateAll(items => items.map(a => a.href));
    assert(new Set(links).size === links.length && links.length >= 9);
    assert(await page.locator('#werkstatt').innerText().then(s => s.includes('der KI')));
    const total = [];
    for (const href of links) {
      await page.goto(href);
      const plates = page.locator('.archive-plate img');
      const count = await plates.count();
      assert(count > 0, href);
      assert.equal(await page.locator('main h1').count(), 1);
      const sources = await plates.evaluateAll(list => list.map(img => img.src));
      assert.equal(new Set(sources).size, count);
      assert.equal(await page.locator('.archive-plate a').count(), count);
      const dims = await page.evaluate(async urls => {
        const sizes = [];
        for (const url of urls) {
          const img = new Image(); img.src = url; await img.decode();
          sizes.push([img.naturalWidth, img.naturalHeight]);
        }
        return sizes;
      }, sources);
      const expectedSizes = await plates.evaluateAll(list => list.map(img => [Number(img.getAttribute('width')), Number(img.getAttribute('height'))]));
      assert.deepEqual(dims, expectedSizes, href);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
      total.push(count);
    }
    await page.goto(catalogue);
    for (const [lang, title] of [['en','Sam’s first comic ideas'],['zh','Sam 最早的漫画构想']]) {
      await page.locator('[data-set-language=' + lang + ']').tap();
      assert.equal(await page.locator('#werkstatt-title').textContent(), title);
      assert.equal(new URL(await page.locator('.workshop-links a').first().getAttribute('href'),base).searchParams.get('lang'),lang);
    }
    console.log('Workshop verified: ' + links.length + ' editions, ' + total.reduce((a,b)=>a+b,0) + ' decoded pages at 390px. Language links passed.');
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode=1; });
