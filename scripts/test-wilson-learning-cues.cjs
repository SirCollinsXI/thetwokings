'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { setTimeout: wait } = require('node:timers/promises');
const { chromium } = require('playwright-core');

const root = new URL(process.env.WILSON_ORIGIN || 'http://127.0.0.1:8765');
const remote = root.protocol === 'https:';
const href = (page, lang) => new URL(page + (remote ? '' : '.html') + '?lang=' + lang, root).href;

async function waitForRelease() {
  const content = await Promise.all(['wilson.html', 'wilson-input.html', 'wilson-learning.css', 'wilson-input.js']
    .map(async f => [f, (await fs.readFile(path.join(__dirname, '..', f), 'utf8')).replaceAll('\r\n', '\n')]));
  for (let attempt = 0; attempt < 25; attempt++) {
    try {
      for (const [file, expected] of content) {
        const route = file.endsWith('.html') ? file.slice(0, -5) : file + '?v=20261128-signals';
        const res = await fetch(new URL(route, root), { signal: AbortSignal.timeout(6000) });
        assert.equal(res.status, 200);
        const body = (await res.text()).replaceAll('\r\n', '\n');
        // The custom domain may add hosting scripts to HTML, so compare the
        // release-specific markup there and the complete trainer JS and CSS.
        if (file.endsWith('.html')) {
          assert(body.includes('wilson-learning.css?v=20261128-signals'));
          assert(body.includes(file === 'wilson.html' ? 'id="preview-prompt"' : 'id="exercise"'));
        } else {
          assert(body === expected, file + ' has not reached the domain yet');
        }
      }
      return;
    } catch (e) {
      if (attempt === 24) throw e;
      await wait(4000);
    }
  }
}

async function colors(locator) {
  return locator.evaluate(el => {
    const s = getComputedStyle(el);
    return { ink: s.color, background: s.backgroundColor };
  });
}
function contrast({ ink, background }) {
  function luminance(color) {
    const rgb = color.match(/[\d.]+/g).slice(0, 3).map(v => Number(v) / 255)
      .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  }
  const [high, low] = [luminance(ink), luminance(background)].sort((a, b) => b - a);
  return (high + .05) / (low + .05);
}

async function runCase(browser, lang, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // All practice records belong to this fresh, disposable browser profile.
  await ctx.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  try {
    await page.goto(href('/wilson', lang));
    const preview = page.locator('.picture-preview');
    const prompt = preview.locator('summary');
    await prompt.waitFor();
    assert((await prompt.innerText()).includes({ de: 'Deutsch', en: 'German', zh: '德语' }[lang]));
    const example = preview.locator('b[lang="de"]');
    assert.equal(await example.isVisible(), false);
    await prompt.focus();
    await prompt.press('Enter');
    assert.equal(await example.isVisible(), true);
    assert.equal(await example.innerText(), 'die Tasse');
    assert(contrast(await colors(example)) >= 4.5);
    await prompt.press('Enter');
    assert.equal(await example.isVisible(), false);
    const challenge = page.locator('.wilson-challenge-link');
    assert.equal(new URL(await challenge.getAttribute('href'), page.url()).searchParams.get('lang'), lang);
    await challenge.click();
    const exercise = page.locator('#exercise');
    const phase = expected => page.waitForFunction(val => document.querySelector('#exercise')?.dataset.phase === val, expected);
    await phase('recall');
    const typed = page.locator('#typed'), solution = page.locator('#solution'), feedback = page.locator('#status');
    const picture = page.locator('.picture');
    const neutral = (await colors(picture)).background;
    const field = await page.locator('#format').innerText();
    assert(!/der Apfel|das Wasser|die Arbeitsbedingungen/.test(field));
    assert.equal(await solution.isVisible(), false);
    const tries = () => page.locator('#attempts').innerText().then(Number);
    assert.equal(await tries(), 0);

    async function submit(answer) {
      await typed.fill(answer);
      await typed.press('Enter');
    }
    async function checkMessage(state) {
      await phase(state);
      assert((await feedback.innerText()).trim().length > 3);
      assert(contrast(await colors(feedback)) >= 4.5, 'Unclear feedback contrast in ' + state);
      return (await colors(feedback)).background;
    }
    await submit('xxx');
    const retry = await checkMessage('retry');
    assert.equal(await typed.getAttribute('aria-invalid'), 'true');
    assert.equal(await solution.isVisible(), false);
    assert.equal(await tries(), 0);
    assert.equal((await colors(picture)).background, neutral);
    const language = page.locator('#lang');
    const original = await feedback.innerText();
    const alternate = lang === 'zh' ? 'de' : 'zh';
    await language.focus();
    await language.selectOption(alternate);
    assert.notEqual(await feedback.innerText(), original, 'A second chance should follow the interface language');
    assert.equal(await language.evaluate(el => el === document.activeElement), true);
    await language.selectOption(lang);
    await submit('xxx');
    const review = await checkMessage('review');
    assert.equal(await solution.isVisible(), true);
    assert.equal(await page.locator('#correct-answer').textContent(), 'die Tasse, Tassen');
    assert(contrast(await colors(page.locator('#correct-answer'))) >= 4.5);
    assert.equal(await tries(), 1);

    await page.locator('#submit').click();
    await phase('recall');
    assert.equal(await solution.isVisible(), false);
    assert.equal(await typed.getAttribute('aria-invalid'), 'false');
    assert.equal(await page.locator('#correct-answer').innerText(), '');
    await submit('der Apfel, Äpfel');
    const correct = await checkMessage('correct');
    assert.equal(new Set([retry, review, correct]).size, 3);
    assert.equal(await tries(), 2);
    await page.reload();
    await phase('recall');
    assert.equal(await tries(), 2, 'Progress must survive reload');
    assert(await exercise.isVisible());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log('Wilson: recall, retry, review, success and saved progress verified', lang, width, root.origin);
  } finally { await ctx.close(); }
}
(async () => {
  if (remote) await waitForRelease();
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  try {
    for (const lang of ['de', 'en', 'zh']) {
      for (const width of [390, 1440]) await runCase(browser, lang, width);
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
