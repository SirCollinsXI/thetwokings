'use strict';
// Local end-to-end check: gallery -> selected word -> answer, plus offline images.
// Run a local server on 8765, then CHROME=/usr/bin/chromium node this-file.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright-core');

const root = path.resolve(__dirname, '..');
const origin = process.env.WILSON_ORIGIN || 'http://127.0.0.1:8765';
const bundle = ['wilson-lexicon.js', 'wilson-image-candidates.js', 'wilson-vocabulary.js']
  .map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const all = vm.runInNewContext(bundle + ';WILSON_VOCABULARY.inputWords');
const groups = [
 {filter: 'auto-fahrrad-09', ids: ['v319', 'v467', 'v516', 'v876', 'v913']},
 {filter: 'frische-lebensmittel-09', ids: ['v33', 'v152', 'v822', 'v653', 'v1066']}
];
const ids = groups.flatMap(group => group.ids);
const words = ids.map(id => all.find(word => word.id === id));
const output = process.env.WILSON_SCREENSHOTS;
if (output) fs.mkdirSync(output, {recursive: true});

async function run() {
 const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME || '/usr/bin/chromium', args: ['--no-sandbox']});
 try {
  for (const width of [390, 1280]) {
   const ctx = await browser.newContext({viewport: {width, height: 900}, reducedMotion: 'reduce'});
   const page = await ctx.newPage();
   const errors = [];
   page.on('pageerror', error => errors.push(error.message));
   await page.goto(origin + '/wilson-image-review.html');
   assert.match(await page.locator('#summary').innerText(), new RegExp('^' + all.length + ' aktive Wörter'));
   for (const group of groups) {
    await page.locator('#filter').selectOption(group.filter);
    assert.equal(await page.locator('#cards article').count(), 5);
    assert.match(await page.locator('#count').innerText(), /^5 Treffer/);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'gallery overflows at ' + width);
    for (const id of group.ids) {
     const link = page.locator('#cards a.practice[href="wilson-input.html?word=' + id + '"]');
     assert.equal(await link.count(), 1, id + ' gallery link');
    }
    if (output) await page.screenshot({path: path.join(output, 'gallery-' + group.filter + '-' + width + '.png'), fullPage: true});
   }
   // Follow an actual gallery link before exercising all selected word URLs.
   await page.locator('#cards a.practice[href="wilson-input.html?word=v33"]').click();
   await page.waitForFunction(() => !document.getElementById('typed').disabled);
   assert((await page.locator('#word-image').getAttribute('src')).endsWith('/v33-aprikose.svg'));
   assert.equal(await page.evaluate(() => typeof navigator.locks?.request), 'function', 'native Web Locks expected on localhost');
   for (const lang of ['de', 'en', 'zh']) {
    for (const word of words) {
     await page.goto(origin + '/wilson-input.html?word=' + word.id + '&lang=' + lang);
     await page.waitForFunction(() => !document.getElementById('typed').disabled);
     assert.equal(await page.locator('#word-image').getAttribute('src'), word.imagePath);
     await page.locator('#word-image').evaluate(img => img.decode());
     assert.equal(await page.locator('#picture-note').innerText(), word.context[lang]);
     assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), word.id + ' trainer overflow');
     const answer = word.numberMode === 'singular' ? word.de : word.de + ', ' + word.plural.replace(/^die /, '');
     await page.locator('#typed').fill(answer);
     await page.locator('#typed').press('Enter');
     await page.waitForFunction(() => !document.getElementById('solution').hidden);
     assert.equal(await page.locator('#correct-answer').innerText(), answer);
     assert.equal(await page.locator('#english').innerText(), word.en);
     assert.equal(await page.locator('#chinese').innerText(), word.zh + ' · ' + word.pinyin);
     assert(await page.locator('#declension').isHidden());
     if (output && ['v319', 'v1066'].includes(word.id) && lang === 'zh') await page.screenshot({path: path.join(output, 'trainer-' + word.id + '-' + width + '.png'), fullPage: true});
    }
   }
   assert.deepEqual(errors, []);
   await ctx.close();
  }
  const page = await browser.newPage();
  const offlineErrors = [], externalResources = [];
  page.on('pageerror', error => offlineErrors.push(error.message));
  page.on('request', request => {
   if (/^https?:/.test(request.url()) && ['script', 'stylesheet', 'image', 'font'].includes(request.resourceType())) externalResources.push(request.url());
  });
  await page.route(/^https?:/, route => route.abort());
  await page.goto(pathToFileURL(path.join(root, 'wilson-offline.html')).href);
  assert.equal(await page.locator('script[src], link[rel="stylesheet"]').count(), 0, 'offline file must embed all required scripts and styles');
  const offline = await page.evaluate(() => OFFLINE_IMAGES);
  assert.equal(Object.keys(offline).length, all.length);
  for (const word of words) {
   const source = offline[word.imagePath];
   assert(source?.startsWith('data:image/svg+xml;base64,'));
   assert(Buffer.from(source.split(',')[1], 'base64').equals(fs.readFileSync(path.join(root, word.imagePath))), word.id + ' offline differs');
   const size = await page.evaluate(async src => {const img = new Image(); img.src = src; await img.decode(); return [img.naturalWidth, img.naturalHeight];}, source);
   assert.deepEqual(size, [212, 150]);
  }
  for (const lang of ['de', 'en', 'zh']) {
   await page.locator('#ui').selectOption(lang);
   for (const [selector, target] of [['[data-wilson-progress]', 'wilson-progress'], ['[data-wilson-backup]', 'wilson-backup'], ['.wilson-challenge-link', 'wilson-input']]) {
    assert.equal(await page.locator(selector).getAttribute('href'), 'https://thetwokings.de/' + target + '.html?lang=' + lang, 'offline navigation must preserve the selected language');
   }
  }
  assert.deepEqual(offlineErrors, [], 'offline JavaScript errors');
  assert.deepEqual(externalResources, [], 'offline resources need network access');
  console.log('Paket 09 browser: ten gallery links; 60 DE/EN/ZH answers at 390/1280px with native Web Locks; ' + all.length + ' offline images, ten SVGs decoded and byte-identical; standalone scripts and localized online links verified.');
 } finally {await browser.close();}
}
run().catch(error => {console.error(error); process.exitCode = 1;});
