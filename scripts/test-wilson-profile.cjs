'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

const origin = new URL(process.env.WILSON_ORIGIN || 'http://127.0.0.1:8765');
const href = (page, lang) => new URL(page + (origin.protocol === 'https:' ? '' : '.html') + '?lang=' + lang, origin).href;
const titles = { de: 'Mein Lernstand', en: 'My progress', zh: '我的学习进度' };
const profileKey = 'ttk-wilson-profile-v1';

async function run(browser, lang, width) {
  const context = await browser.newContext({ viewport: { width, height: 850 } });
  try {
    const page = await context.newPage();
    await page.goto(href('/wilson-input', lang));
    const entry = page.locator('[data-wilson-progress]');
    assert.equal(await entry.innerText(), titles[lang]);
    await page.evaluate(() => {
      const [card] = WILSON_VOCABULARY.inputWords;
      const progress = {
        pictures: { version: 1, tested: 6, firstCorrect: 4,
          items: { [card.id]: { seen: 6, streak: 1, due: 1, last: 1 } } },
        kids: { version: 1, rounds: 7 },
        course: { version: 1, ui: 'de', target: 'de', records: {}, days: { '2026-11-27': 3, '2026-11-26': 0 } }
      };
      for (const [key, value] of Object.entries({
        'ttk-wilson-picture-input-v1': progress.pictures,
        'ttk-wilson-child-v1': progress.kids,
        'ttk-wilson-path-v1': 'simple',
        'ttk-wilson-v1': progress.course
      })) localStorage.setItem(key, JSON.stringify(value));
    });
    await Promise.all([page.waitForURL(href('/wilson-progress', lang), { waitUntil: 'load' }), entry.click()]);
    assert.equal(await page.locator('h1').innerText(), titles[lang]);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const stored = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), profileKey);
    const progress = () => page.evaluate(() => WilsonStorage.snapshot());
    assert.equal(await stored(), null, 'Viewing the overview does not create a profile');
    const original = await progress();
    for (const [stat, count] of Object.entries({ cards: '1', attempts: '6', first: '67%', due: '1', days: '1', kids: '7' })) {
      assert.equal(await page.locator('#stat-' + stat).innerText(), count, 'Wrong summary for ' + stat);
    }
    const edit = page.locator('#profile-edit');
    await edit.click();
    assert.equal(await page.locator('#nickname').evaluate(el => el === document.activeElement), true);
    await page.locator('#nickname').fill('   ');
    await page.locator('#profile-save').click();
    assert.equal(await stored(), null);
    const customName = '章鱼哥 <Wilson>';
    await page.locator('#nickname').fill(customName);
    await page.locator('#avatar').selectOption('octopus');
    await page.locator('#profile-save').click();
    await page.locator('#learner').waitFor();
    assert.equal(await page.locator('#learner-name').textContent(), customName);
    assert.equal(await page.locator('#learner-name *').count(), 0);
    assert.equal(await page.locator('#learner-avatar').textContent(), '🐙');
    const saved = await stored();
    assert.match(saved.id, /^[0-9a-f-]{36}$/);
    assert.deepEqual(await progress(), original, 'Taking over progress must not rewrite statistics');
    await page.reload();
    assert.equal(await page.locator('#learner-name').textContent(), customName);

    const corner = await context.newPage();
    await corner.goto(href('/wilson', lang));
    const continueLink = corner.locator('[data-wilson-continue]');
    assert.match(await continueLink.innerText(), /章鱼哥 <Wilson>/);
    assert.equal(new URL(await continueLink.getAttribute('href'), corner.url()).searchParams.get('lang'), lang);

    await edit.click();
    await page.locator('#nickname').fill('Wilson');
    await page.locator('#avatar').selectOption('panda');
    await page.locator('#profile-save').click();
    assert.deepEqual(await stored(), { ...saved, nickname: 'Wilson', avatar: 'panda' });
    await corner.waitForFunction(() => document.querySelector('[data-wilson-continue]').textContent.includes('🐼'));
    await edit.click();
    await page.locator('#profile-remove').click();
    assert.equal(await stored(), null);
    assert.deepEqual(await progress(), original);
    await continueLink.waitFor({ state: 'hidden' });
    assert.ok(await page.locator('#continue-training').isVisible(), 'Guest must be able to continue practising');
    console.log('Wilson profile: guest, adoption, stable nickname/avatar, existing statistics and removal', lang, width, origin.origin);
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  try {
    for (const [lang, width] of [['de', 390], ['en', 1440], ['zh', 390]]) await run(browser, lang, width);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
