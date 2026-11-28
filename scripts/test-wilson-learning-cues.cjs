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
  const content = await Promise.all(['wilson.html', 'wilson-input.html', 'wilson-learning.css', 'wilson-input.js', 'wilson-paths.js']
    .map(async f => [f, (await fs.readFile(path.join(__dirname, '..', f), 'utf8')).replaceAll('\r\n', '\n')]));
  const trainer = content.find(([file]) => file === 'wilson-input.html')[1];
  const corner = content.find(([file]) => file === 'wilson.html')[1];
  const pathScript = corner.match(/src="(wilson-paths\.js\?v=[^"]+)"/)[1];
  const inputScript = trainer.match(/src="(wilson-input\.js\?v=[^"]+)"/)[1];
  for (let attempt = 0; attempt < 25; attempt++) {
    try {
      for (const [file, expected] of content) {
        const route = file.endsWith('.html') ? file.slice(0, -5) : file === 'wilson-input.js' ? inputScript : file === 'wilson-paths.js' ? pathScript : file + '?v=20261128-signals';
        const res = await fetch(new URL(route, root), { signal: AbortSignal.timeout(6000) });
        assert.equal(res.status, 200);
        const body = (await res.text()).replaceAll('\r\n', '\n');
        // The custom domain may add hosting scripts to HTML, so compare the
        // release-specific markup there and the complete trainer JS and CSS.
        if (file.endsWith('.html')) {
          assert(body.includes('wilson-learning.css?v=20261128-signals'));
          if (file === 'wilson.html') assert(body.includes('id="preview-prompt"'));
          else assert(body.includes(inputScript) && body.includes('data-phase="loading"'));
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
  const resources = [];
  page.on('response', response => {
    const req = response.request();
    if (req.resourceType() === 'script' || req.isNavigationRequest())
      resources.push([new URL(req.url()).pathname, response.status(), response.headers()['content-type']]);
  });
  page.on('requestfailed', req => resources.push([new URL(req.url()).pathname, req.failure()?.errorText]));
  await page.addInitScript(() => {
    window.wilsonTestEvents = { enter: 0, submit: 0, invalid: 0 };
    document.addEventListener('keydown', e => { if (e.target.id === 'typed' && e.key === 'Enter') window.wilsonTestEvents.enter++; }, true);
    document.addEventListener('submit', e => { if (e.target.id === 'entry') window.wilsonTestEvents.submit++; }, true);
    document.addEventListener('invalid', e => { if (e.target.id === 'typed') window.wilsonTestEvents.invalid++; }, true);
  });
  // All practice records belong to this fresh, disposable browser profile.
  await ctx.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
  try {
    if (lang === 'zh' && width === 390) {
      await page.goto(href('/wilson', lang));
      await page.locator('button[data-path="simple"]').click();
    }
    await page.goto(href('/wilson', lang) + '#preview-card');
    // Assigning the same fragment would only scroll the currently open page.
    // Reload this one returning profile as it would open the link from outside.
    if (lang === 'zh' && width === 390) {
      await page.reload();
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ttk-wilson-path-v1'))), 'simple');
    }
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
    if (lang === 'de' && width === 390) {
      // Delay only the trainer engine. The parsed form must stay inert until its handlers and first word are ready.
      let permit;
      const gate = new Promise(resolve => { permit = resolve; });
      await page.route('**/wilson-input.js*', async route => { await gate; await route.continue(); }, { times: 1 });
      const clicked = challenge.click({ noWaitAfter: true });
      try {
        await page.locator('#exercise[data-phase="loading"]').waitFor();
        assert.equal(await page.locator('#typed').isDisabled(), true);
        assert.equal(await page.locator('#submit').isDisabled(), true);
        assert.equal(await page.locator('#typed').getAttribute('name'), null);
      } finally { permit(); await clicked; }
    } else await challenge.click();
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
  } catch (error) {
    const state = await page.evaluate(() => {
      const el = id => document.getElementById(id);
      const field = el('typed'), url = new URL(location.href);
      return {
        path: url.pathname, parameters: [...url.searchParams.keys()], ready: document.readyState,
        phase: el('exercise')?.dataset.phase, language: document.documentElement.lang,
        question: el('question')?.textContent, round: el('round-note')?.textContent,
        words: typeof WILSON_VOCABULARY === 'undefined' ? null : WILSON_VOCABULARY.inputWords?.length,
        inputDisabled: field?.disabled, inputReadOnly: field?.readOnly, inputInvalid: field?.getAttribute('aria-invalid'),
        submitted: window.wilsonTestEvents, webLocks: typeof navigator.locks?.request,
        feedback: el('status')?.textContent, warning: el('warning')?.textContent,
        trainer: [...document.scripts].map(s => s.src).find(src => src.includes('wilson-input.js'))
      };
    }).catch(e => ({ diagnosticError: e.message }));
    console.error('Wilson browser failure', JSON.stringify({ lang, width, state, resources, errors }));
    throw error;
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
