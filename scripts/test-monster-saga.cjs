'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

const url = new URL('/monster-saga.html', process.env.COMIC_TEST_URL || 'http://127.0.0.1:8765');
const catalogueUrl = new URL('/comics.html', url);
const view = { width: 390, height: 844 };

async function loaded(page, number) {
  const suffix = '/comic/monster-saga/' + String(number).padStart(2, '0') + '.webp';
  await page.waitForFunction(end => {
    const img = document.getElementById('comic-page');
    return img.complete && img.naturalWidth > 0 && img.currentSrc.endsWith(end);
  }, suffix);
  const dimensions = await page.locator('#comic-page').evaluate(async img => {
    await img.decode();
    return [img.naturalWidth, img.naturalHeight];
  });
  assert.deepEqual(dimensions, [1024, 1536], 'Dimensions on page ' + number);
  assert.equal(await page.locator('#saga-number').textContent(), number + ' / 32');
}

async function run() {
  const browser = await chromium.launch({ executablePath: process.env.CHROME, headless: true });
  try {
    const context = await browser.newContext({ viewport: view, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const requested = new Set();
    page.on('request', req => {
      const path = new URL(req.url()).pathname;
      if (/\/comic\/monster-saga\/\d\d\.webp$/.test(path)) requested.add(path);
    });
    await page.goto(catalogueUrl.href + '?lang=en');
    const volume = page.locator('#monster-volume').locator('..');
    assert.equal(await volume.locator('h2').innerText(), 'The Great Monster Saga');
    assert.equal(await volume.locator('a.button').innerText(), 'Read the compendium →');
    await volume.locator('a.button').tap();
    await loaded(page, 1);
    assert.equal(await page.locator('#saga-prev').isDisabled(), true);
    assert.equal(requested.size, 1, 'Initial render must fetch exactly one full page');
    await page.goto(url.href + '?lang=de#seite-24');
    await loaded(page, 24);
    assert.equal(requested.size, 2, 'Direct links must fetch the selected page only');
    assert.equal(await page.locator('#saga-title').innerText(), 'Die Titanenprüfung');
    const zoom = page.locator('#saga-zoom');
    const fit = (await zoom.boundingBox()).width;
    await zoom.tap();
    assert.equal(await zoom.getAttribute('aria-pressed'), 'true');
    assert.ok((await zoom.boundingBox()).width > fit * 1.5);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    assert.ok(await page.locator('#saga-viewport').evaluate(el => {
      el.scrollLeft = el.scrollWidth;
      return el.scrollLeft > 0;
    }));
    await page.locator('#saga-next').tap();
    await loaded(page, 25);
    assert.equal(new URL(page.url()).hash, '#seite-25');
    assert.equal(await zoom.getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('#saga-viewport').evaluate(el => el.scrollLeft), 0);
    await page.goBack();
    await loaded(page, 24);
    await zoom.focus();
    await page.keyboard.press('ArrowLeft');
    await loaded(page, 23);
    await page.locator('[data-set-language=zh]').tap();
    await page.waitForFunction(() => document.documentElement.lang === 'zh-CN');
    assert.equal(await page.locator('#saga-next').getAttribute('aria-label'), '下一页');
    assert.equal(await page.locator('#saga-title').innerText(), '熔岩形态的陨落');
    assert.equal(await page.locator('#saga-select option:checked').innerText(), '23 · 熔岩形态的陨落');
    await page.locator('#saga-select').selectOption('1');
    await loaded(page, 1);
    for (let number = 2; number <= 32; number++) {
      await page.locator('#saga-next').tap();
      await loaded(page, number);
    }
    assert.equal(requested.size, 32);
    assert.equal(await page.locator('#saga-next').isDisabled(), true);
    assert.equal(await page.locator('#saga-caption').innerText(), '32 / 32 · 封底');
    const plain = await browser.newContext({ javaScriptEnabled: false, viewport: view });
    const staticPage = await plain.newPage();
    await staticPage.goto(url.href);
    const links = staticPage.locator('.saga-contents ol a');
    assert.equal(await links.count(), 32);
    assert.equal(await staticPage.locator('#saga-reader').isVisible(), false);
    assert.equal(await links.last().getAttribute('href'), 'comic/monster-saga/32.webp');
    await links.last().click();
    assert.ok(new URL(staticPage.url()).pathname.endsWith('/comic/monster-saga/32.webp'));
    console.log('Monster-Saga: 32 unique pages decoded; mobile deep link, single-image load, touch zoom, keyboard, back, language switch and JavaScript-free index passed.');
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
