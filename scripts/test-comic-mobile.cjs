'use strict';

const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright-core');

const base = process.env.COMIC_TEST_URL || 'http://127.0.0.1:8765/comic.html';
const output = process.env.COMIC_SCREENSHOTS || 'comic-screenshots';
const dialogue = {
  de: ['Endstation Sandstrand!', 'Das Floß sitzt fest.', 'Ich auch!'],
  en: ['Last stop, Sandy Beach!', 'The raft’s all tied up.', 'So am I!'],
  zh: ['终点站，沙滩！', '这下木筏动不了了。', '我也动不了了！']
};

async function waitForImage(page, file) {
  await page.waitForFunction(name => {
    const image = document.getElementById('comic-page');
    return image.complete && image.naturalWidth > 0 && new URL(image.currentSrc).pathname.endsWith('/' + name);
  }, file);
}

async function readSize(page) {
  return page.locator('#comic-page').evaluate(image => ({
    width: image.getBoundingClientRect().width,
    pageWidth: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    natural: [image.naturalWidth, image.naturalHeight]
  }));
}

async function run() {
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME, headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1
    });
    const page = await context.newPage();
    await page.goto(base + '?lang=de#10');
    await waitForImage(page, 'page-11.webp');
    await page.locator('#next').tap();
    await waitForImage(page, 'page-11-ankunft.webp');
    assert.equal(new URL(page.url()).hash, '#11');
    assert.equal(await page.locator('#position').textContent(), '12 / 16');
    const fit = await readSize(page);
    assert.equal(fit.viewport, 390);
    assert.equal(fit.pageWidth, fit.viewport);
    assert.ok(fit.width <= fit.viewport);
    assert.deepEqual(fit.natural, [1086, 1448]);

    const image = page.locator('#comic-page');
    await image.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await page.screenshot({ path: path.join(output, 'comic-seite-11.png') });
    await image.tap();
    const zoom = await readSize(page);
    assert.ok(zoom.width >= fit.width * 1.5, 'Tap must enlarge the image on a phone');
    assert.equal(zoom.pageWidth, zoom.viewport, 'Zoom must stay inside the reader');
    assert.equal(await page.locator('#page-zoom').getAttribute('aria-pressed'), 'true');
    const pan = await image.evaluate(img => {
      let container = img.parentElement;
      while (container && container !== document.body) {
        if (container.scrollWidth > container.clientWidth && /auto|scroll/.test(getComputedStyle(container).overflowX)) {
          container.scrollLeft = container.scrollWidth;
          return container.scrollLeft;
        }
        container = container.parentElement;
      }
      return 0;
    });
    assert.ok(pan > 0, 'The enlarged comic must pan horizontally');
    await page.screenshot({ path: path.join(output, 'comic-seite-11-zoom.png') });
    await page.locator('#next').tap();
    await waitForImage(page, 'page-12.webp');
    assert.equal((await readSize(page)).width, fit.width, 'Turning a page must reset zoom');
    assert.equal(await page.locator('#page-zoom').getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('#page-viewport').evaluate(el => el.scrollLeft), 0);
    await page.locator('#prev').tap();
    await waitForImage(page, 'page-11-ankunft.webp');
    await image.tap();
    await image.tap();
    assert.equal((await readSize(page)).width, fit.width, 'A second tap must fit the whole page');

    for (const [lang, expected] of Object.entries(dialogue)) {
      await page.locator('#dd-tab-' + lang).tap();
      await page.waitForFunction(text => document.querySelector('.dd-line-text')?.textContent === text, expected[0]);
      assert.deepEqual(await page.locator('.dd-line-text').allTextContents(), expected);
      const size = await readSize(page);
      assert.equal(size.pageWidth, size.viewport, 'Reader overflow in ' + lang);
    }
    console.log('390 × 844: fitted ' + fit.width + 'px, enlarged ' + zoom.width + 'px, pan ' + pan + 'px. Navigation, zoom reset and DE/EN/zh dialogues passed.');
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
