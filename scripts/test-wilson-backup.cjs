'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { text } = require('node:stream/consumers');

const origin = new URL(process.env.WILSON_ORIGIN || 'http://127.0.0.1:8765');
const href = (page, lang) => new URL(page + (origin.protocol === 'https:' ? '' : '.html') + '?lang=' + lang, origin).href;
const keys = {
  course: 'ttk-wilson-v1',
  learning: 'ttk-wilson-learning-v2',
  pictures: 'ttk-wilson-picture-input-v1',
  pictureLanguage: 'ttk-wilson-picture-input-v1-lang',
  kids: 'ttk-wilson-child-v1',
  path: 'ttk-wilson-path-v1'
};
const fixture = {
  course: { version: 1, ui: 'de', target: 'de',
    records: { 'cup:de': { attempts: 3, correct: 2, streak: 1, due: 2_000_000_000_000 } },
    days: { '2026-11-27': 3 } },
  learning: { version: 2, goal: 4, notes: { cup: 'Üben: die Tasse 茶杯' },
    evidence: { 'cup:de': { seen: 1, recalled: 2, delayed: 1, last: 1_800_000_000_000 } },
    sessions: [{ day: '2026-11-27', answers: 3 }], missions: { 'breakfast:de': 1_800_000_000_000 } },
  pictures: { version: 1, tested: 6, firstCorrect: 4, items: { cup: { seen: 6, streak: 1, due: 2_000_000_000_000, last: 1_800_000_000_000 } } },
  pictureLanguage: 'zh', kids: { version: 1, rounds: 7 }, path: 'kids'
};
const labels = { de: 'Lernstand sichern', en: 'Back up learning progress', zh: '学习进度备份' };

async function run(browser, lang, width) {
  const context = await browser.newContext({ viewport: { width, height: 860 } });
  try {
    const original = await context.newPage();
    await original.goto(href('/wilson-backup', lang));
    await original.evaluate(({ keys, fixture }) => {
      for (const [part, value] of Object.entries(fixture)) {
        localStorage.setItem(keys[part], part === 'pictureLanguage' ? value : JSON.stringify(value));
      }
    }, { keys, fixture });
    await original.reload();
    assert.equal(await original.locator('h1').innerText(), labels[lang]);
    assert.equal(await original.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const download = original.waitForEvent('download');
    await original.locator('#download').click();
    const backup = await text(await (await download).createReadStream());
    assert.deepEqual(JSON.parse(backup), { format: 'thetwokings-wilson', version: 1, parts: fixture });

    const fresh = await browser.newContext({ viewport: { width, height: 860 } });
    try {
      const target = await fresh.newPage();
      await target.goto(href('/wilson', lang));
      const link = target.locator('[data-wilson-backup]');
      assert.equal(new URL(await link.getAttribute('href'), target.url()).searchParams.get('lang'), lang);
      await link.click();
      const choose = blob => target.locator('#backup-file').setInputFiles({ name: 'test.json', mimeType: 'application/json', buffer: Buffer.from(blob) });
      const read = () => target.evaluate(() => WilsonStorage.snapshot());
      const initial = await read();
      assert.deepEqual(initial, { path: '' }, 'Only the default mode setting exists on a fresh trainer');
      await choose('{ damaged');
      await target.waitForFunction(() => document.querySelector('#backup-status').textContent.length);
      assert.equal(await target.locator('#preview').isVisible(), false);
      await choose(JSON.stringify({ format: 'thetwokings-wilson', version: 1, parts: { kids: { version: 1, rounds: -1 } } }));
      await target.waitForFunction(() => document.querySelector('#backup-status').textContent.length);
      assert.equal(await target.locator('#preview').isVisible(), false);
      assert.deepEqual(await read(), initial);
      await choose(backup);
      await target.locator('#preview').waitFor();
      assert.equal(await target.locator('#preview-title').evaluate(el => el === document.activeElement), true);
      assert.deepEqual(await read(), initial);
      await target.locator('#cancel').click();
      assert.deepEqual(await read(), initial);
      await choose(backup);
      await target.locator('#apply').focus();
      await target.locator('#apply').press('Enter');
      await target.locator('#swap').waitFor();
      assert.deepEqual(await read(), fixture);

      const trainer = await fresh.newPage();
      await trainer.goto(href('/wilson-input', lang));
      await trainer.waitForFunction(() => document.querySelector('#attempts').textContent === '6');
      assert.equal(await trainer.locator('#accuracy').innerText(), '67%');
      const corner = await fresh.newPage();
      await corner.goto(href('/wilson', lang));
      assert.equal(await corner.evaluate(() => WilsonStorage.getItem('ttk-wilson-path-v1')), '"kids"');
      await corner.locator('.parent-notes summary').click();
      assert.match(await corner.locator('.parent-notes').innerText(), /7/);

      const newer = { ...fixture.pictures, tested: 8, firstCorrect: 5 };
      await choose(JSON.stringify(newer));
      await target.locator('#apply').click();
      await target.waitForFunction(() => WilsonStorage.snapshot().pictures.tested === 8);
      assert.deepEqual(await read(), { ...fixture, pictures: newer });
      await trainer.locator('#wilson-backup-changed').waitFor();
      assert.equal(await trainer.evaluate(() => {
        try { WilsonStorage.setItem('ttk-wilson-picture-input-v1', '{}'); return false; } catch { return true; }
      }), true, 'An already-open trainer cannot overwrite the newly restored progress');

      const course = { ...fixture.course, days: { '2026-11-26': 4 } };
      await choose(JSON.stringify({ ...course, learning: fixture.learning }));
      await target.locator('#apply').click();
      await target.waitForFunction(() => Object.hasOwn(WilsonStorage.snapshot().course.days, '2026-11-26'));
      assert.deepEqual(await read(), { ...fixture, pictures: newer, course });
      await target.locator('#swap').click();
      await target.waitForFunction(() => Object.hasOwn(WilsonStorage.snapshot().course.days, '2026-11-27'));
      assert.deepEqual(await read(), { ...fixture, pictures: newer });
    } finally { await fresh.close(); }
    console.log('Wilson backup: complete restore, cancel, malformed file, both legacy formats and rollback', lang, width, origin.origin);
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  try {
    for (const [lang, width] of [['de', 390], ['en', 1440], ['zh', 390]]) await run(browser, lang, width);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
