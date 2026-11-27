const assert = require('node:assert/strict');

const copy = {
  de: ['Nur für das Team.', 'Mein Vorschlag darf nach Prüfung ohne meinen Namen veröffentlicht werden.'],
  en: ['For the team only.', 'After review, my suggestion may be published without my name.'],
  zh: ['仅供团队阅读。', '经审核后，可以不署我的名字公开这条建议。'],
};
const privateNote = 'Privater Merkzettel, nur in Browser A';
const draftText = 'Mehr Kontrast & größere Bilder #2 · 图片';

// Exercise the published UI in clean browser profiles. Intercept the mail link
// before the browser can open an external app. No message is sent.
async function makeProfile(browser, fixture) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => {
    window.draftLinks = [];
    window.draftCopies = [];
    document.addEventListener('click', event => {
      const link = event.target.closest?.('a[href^="mailto:"]');
      if (!link) return;
      event.preventDefault();
      window.draftLinks.push(link.href);
    }, true);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async text => { window.draftCopies.push(text); },
    } });
  });
  if (fixture) {
    await context.route(url => url.pathname === '/feedback-freigaben.js', route => route.fulfill({
      contentType: 'application/javascript; charset=utf-8',
      body: 'globalThis.freigegebeneEntwicklungsideen = ' + JSON.stringify(fixture),
    }));
  }
  const writes = [];
  await context.route('**/*', route => {
    const request = route.request();
    if (['HEAD', 'GET'].includes(request.method())) return route.fallback();
    writes.push(request.url());
    return route.abort();
  });
  return { context, page: await context.newPage(), writes };
}

async function readDraft(page, permission, expected, category) {
  const consent = page.locator('#feedback-permission');
  await consent.setChecked(permission);
  const count = await page.evaluate(() => window.draftLinks.length);
  const compose = page.locator('#feedback-compose');
  await compose.focus();
  await compose.press('Enter');
  await page.waitForFunction(n => window.draftLinks.length === n + 1, count);
  const link = new URL(await page.evaluate(() => window.draftLinks.at(-1)));
  assert.equal(link.protocol, 'mailto:');
  assert.equal(link.pathname, 'kontakt@thetwokings.de');
  const subject = link.searchParams.get('subject') || '';
  const body = link.searchParams.get('body') || '';
  assert.ok(subject.trim());
  assert.ok((subject + '\n' + body).includes(category), 'Draft identifies the chosen project');
  assert.ok(body.includes(draftText), 'The idea survives mailto encoding');
  assert.ok(body.includes(expected[Number(permission)]), 'Draft records the explicit visibility choice');
  assert.ok(!body.includes(privateNote));
  assert.equal(await page.locator('#feedback-published').getByText(draftText, { exact: true }).count(), 0);
}

module.exports = async function testEntwicklungsideen(browser, origin) {
  const writer = await makeProfile(browser);
  try {
    const page = writer.page;
    for (const [lang, expected] of Object.entries(copy)) {
      const url = new URL('/?lang=' + lang + '&section=werkstatt#mitgestalten', origin);
      assert.equal((await page.goto(url.href)).status(), 200);
      const note = page.locator('#feedback-note');
      await note.waitFor();
      assert.equal(await page.locator('#feedback-permission').isChecked(), false);
      assert.equal(await note.inputValue(), '');
      assert.equal(await note.getAttribute('maxlength'), '600');
      const privacy = new URL(await page.locator('#feedback-privacy').getAttribute('href'), page.url());
      assert.equal(privacy.origin, url.origin);
      assert.match(privacy.pathname, /^\/datenschutz(?:\.html)?$/);
      assert.equal(privacy.hash, lang === 'de' ? '#entwicklungsideen' : '#entwicklungsideen-' + lang);
      const text = await (await page.request.get(privacy.href)).text();
      assert.ok(privacy.hash && text.includes('id="' + privacy.hash.slice(1) + '"'), 'Privacy details are linked');

      if (lang === 'de') {
        assert.equal(await page.evaluate(text => previewSpuren.add({ kind: 'idea', category: 'comics', note: text }), privateNote), 'saved');
        await page.reload();
        await note.waitFor();
        assert.ok(await page.evaluate(text => previewSpuren.read().some(entry => entry.note === text), privateNote));
        assert.equal(await note.inputValue(), '');
        await page.locator('#feedback-compose').click();
        assert.equal(await page.evaluate(() => window.draftLinks.length), 0, 'Empty ideas open no mail');
      }
      const category = page.locator('#feedback-category');
      assert.equal(await category.inputValue(), 'werkstatt', 'Linked project should already be selected');
      await category.selectOption('comics');
      const label = (await category.locator('option:checked').innerText()).trim();
      await note.fill(draftText);
      await readDraft(page, false, expected, label);
      await readDraft(page, true, expected, label);
      await page.locator('#feedback-copy').click();
      await page.waitForFunction(() => window.draftCopies.length > 0);
      const copied = await page.evaluate(() => window.draftCopies.at(-1));
      assert.ok(copied.includes('kontakt@thetwokings.de') && copied.includes(draftText) && copied.includes(expected[1]));
      assert.ok(!copied.includes(privateNote));
      if (lang === 'zh') {
        await page.evaluate(() => {
          navigator.clipboard.writeText = async () => { throw new Error('Clipboard unavailable'); };
        });
        await page.locator('#feedback-copy').click();
        const manual = page.locator('#feedback-manual');
        await manual.waitFor();
        assert.equal(await manual.inputValue(), copied.replaceAll('\r\n', '\n'));
        assert.equal(await manual.evaluate(el => document.activeElement === el), true);
      }
      console.log('Team-only and optional public review drafts verified in', lang);
    }
    assert.deepEqual(writer.writes, [], 'Ideas must stay local until a visitor sends the draft outside the site');
  } finally {
    await writer.context.close();
  }

  const fixture = [{ day: '2026-11-25', category: 'comics', text: {
    de: 'Mehr Platz für <b>Comics</b>', en: 'More space for <b>comics</b>', zh: '给<b>漫画</b>更多空间',
  } }];
  const first = await makeProfile(browser, fixture);
  const second = await makeProfile(browser, fixture);
  try {
    for (const [profile, lang] of [[first, 'de'], [second, 'zh']]) {
      const response = await profile.page.goto(new URL('/?lang=' + lang + '#ideenwand', origin).href);
      assert.equal(response.status(), 200);
      const list = profile.page.locator('#feedback-published');
      await list.getByText(fixture[0].text[lang], { exact: true }).waitFor();
      assert.equal(await list.locator('b').getByText('Comics', { exact: true }).count(), 0, 'Guest markup is displayed as text');
      assert.ok(!(await list.innerText()).includes(privateNote));
      assert.ok(await profile.page.locator('#feedback-empty').isHidden());
      assert.deepEqual(profile.writes, []);
    }
    await first.page.route(url => url.pathname === '/feedback-freigaben.js', route => route.fulfill({
      contentType: 'application/javascript; charset=utf-8', body: 'globalThis.freigegebeneEntwicklungsideen = [];',
    }));
    await first.page.reload();
    await first.page.locator('#feedback-empty').waitFor();
    assert.equal(await first.page.locator('#feedback-published li').count(), 0, 'No fabricated public entries');
  } finally {
    await Promise.all([first.context.close(), second.context.close()]);
  }
  console.log('Moderated sample visible in two isolated browser profiles; no mail or public write performed.');
};
