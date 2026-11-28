const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');

const draftNick = 'TestgastQ8';
const privateMarker = 'ttkPrivateMarkerR4';
const approvedNick = 'Nordlicht Test';
const receiver = 'kontakt@thetwokings.de';
const countries = { de: 'China', en: 'China', zh: '中国' };
const retryLabels = { de: 'Verbindung zur Tageszählung prüfen', en: 'Check the tally connection', zh: '检查计数连接' };
const refreshLabels = { de: 'Heutige Zahlen abrufen', en: 'Refresh today’s counts', zh: '刷新今日计数' };

function validatePublicFile() {
  const data = {};
  runInNewContext(readFileSync(join(__dirname, '..', 'guest-freigaben.js'), 'utf8'), data);
  const records = data.freigegebeneGastgruesse;
  assert.ok(Array.isArray(records), 'Public greetings must be an editorial list');
  const publicKeys = new Set(['day', 'mark', 'nick', 'region', 'kind']);
  for (const record of records) {
    assert.ok(record && typeof record === 'object');
    assert.ok(Object.keys(record).every(key => publicKeys.has(key)), 'Only public card fields may be committed');
    assert.match(record.day, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(record.day + 'T00:00:00Z').toISOString().slice(0, 10), record.day);
    assert.ok(['wave', 'star', 'crown'].includes(record.mark));
    if (record.kind) assert.ok(['human', 'ai'].includes(record.kind));
    if (record.region) assert.match(record.region, /^[A-Z]{2}$/);
    if (record.nick) {
      assert.ok(typeof record.nick === 'string' && [...record.nick].length <= 40);
      assert.doesNotMatch(record.nick, /[^\s@]+@[^\s@]+\.[^\s@]+/, 'Sender emails stay private');
    }
  }
}

async function startProfile(browser, origin, approvals, viewport, nativeCards = null) {
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
  const unexpected = [];
  let healthy = false;
  let reads = 0;
  const submissions = [];
  await context.addInitScript(() => {
    window.testGuestMail = [];
    window.testGuestCopy = [];
    window.testGuestGeo = 0;
    document.addEventListener('click', event => {
      const link = event.target.closest?.('a[href^="mailto:"]');
      if (link) {
        event.preventDefault();
        window.testGuestMail.push(link.href);
      }
    }, true);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async text => { window.testGuestCopy.push(text); },
    } });
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
      getCurrentPosition() { window.testGuestGeo++; }, watchPosition() { window.testGuestGeo++; },
    } });
  });
  await context.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin.origin && url.pathname === '/api/gastgruesse') {
      if (request.method() === 'GET') {
        return route.fulfill({ status: nativeCards ? 200 : 503, json: nativeCards ? { cards: nativeCards } : { error: 'unavailable' } });
      }
      if (request.method() === 'POST' && nativeCards) {
        submissions.push(request.postDataJSON());
        return route.fulfill({ status: 202, json: { status: 'pending' } });
      }
      unexpected.push(request.method() + ' ' + url.pathname);
      return route.abort();
    }
    const payload = [url.href, JSON.stringify(request.headers()), request.postData()].join('\n');
    if ([draftNick, privateMarker].some(marker => payload.includes(marker))) {
      unexpected.push('Private field in ' + request.method() + ' ' + url.pathname);
      return route.abort();
    }
    if (!['GET', 'HEAD'].includes(request.method())) {
      const timing = request.method() === 'POST' && url.origin === origin.origin && url.pathname === '/cdn-cgi/rum';
      if (!timing) unexpected.push(request.method() + ' ' + url.pathname);
      return route.abort(); // Even the test's performance measurements stay out of production.
    }
    if (url.origin === origin.origin && url.pathname === '/guest-freigaben.js') {
      return route.fulfill({ contentType: 'application/javascript; charset=utf-8',
        body: 'globalThis.freigegebeneGastgruesse = ' + JSON.stringify(approvals) + ';' });
    }
    if (url.origin === origin.origin && url.pathname === '/api/spuren') {
      reads++;
      return route.fulfill({ status: healthy ? 200 : 503, contentType: 'application/json',
        body: JSON.stringify(healthy ? { day: '2026-11-27', counts: { wave: 2, star: 3, crown: 1 } } : { error: 'unavailable' }) });
    }
    return route.continue();
  });
  return { context, page: await context.newPage(), unexpected, submissions,
    enableTally: () => { healthy = true; }, reads: () => reads };
}

async function typeGuests(profile, origin, lang) {
  const { page } = profile;
  const link = new URL('/?lang=' + lang + '#grusswand', origin);
  assert.equal((await page.goto(link.href)).status(), 200);
  const editor = page.locator('#guest-editor');
  const summary = editor.locator('summary').first();
  if (!await editor.evaluate(el => el.open)) {
    await summary.focus();
    await summary.press('Enter');
  }
  const nick = page.locator('#guest-nick');
  const country = page.locator('#guest-region');
  const kind = page.locator('#guest-kind');
  const consent = page.locator('#guest-consent');
  const compose = page.locator('#guest-compose');
  assert.equal(await nick.inputValue(), '');
  assert.equal(await country.inputValue(), '');
  assert.equal(await kind.inputValue(), '');
  assert.equal(await consent.isChecked(), false);
  for (const optional of [nick, country, kind]) assert.equal(await optional.evaluate(el => el.required), false);
  if (await compose.isEnabled()) await compose.click();
  assert.equal(await page.evaluate(() => window.testGuestMail.length), 0, 'Consent is required even for an anonymous card');
  await consent.check();
  await compose.focus();
  await compose.press('Enter');
  await page.waitForFunction(() => window.testGuestMail.length === 1);
  const anonymous = new URL(await page.evaluate(() => window.testGuestMail[0]));
  assert.equal(anonymous.pathname, receiver);
  assert.equal(anonymous.protocol, 'mailto:');
  assert.ok(anonymous.searchParams.get('body')?.trim(), 'Symbol-only draft is possible');

  await nick.fill(draftNick);
  await country.selectOption('CN');
  assert.ok((await country.locator('option:checked').innerText()).includes(countries[lang]));
  await kind.selectOption('ai');
  const kindLabel = (await kind.locator('option:checked').innerText()).trim();
  await page.locator('#guest-mark').selectOption('star');
  await consent.check();
  await compose.click();
  await page.waitForFunction(() => window.testGuestMail.length === 2);
  const draft = new URL(await page.evaluate(() => window.testGuestMail.at(-1)));
  const body = draft.searchParams.get('body');
  assert.equal(draft.protocol, 'mailto:');
  assert.equal(draft.pathname, receiver);
  assert.ok(body.includes(draftNick) && body.includes(countries[lang]) && body.includes(kindLabel), 'Draft contains chosen public fields');
  assert.ok(!body.includes(privateMarker));
  await page.locator('#guest-copy').click();
  await page.waitForFunction(() => window.testGuestCopy.length > 0);
  const copied = await page.evaluate(() => window.testGuestCopy.at(-1));
  assert.ok(copied.includes(receiver) && copied.includes(draftNick));
  assert.ok(!copied.includes(privateMarker));
  assert.equal(await page.locator('#guest-list').getByText(draftNick, { exact: false }).count(), 0);
  assert.equal(await page.evaluate(() => window.testGuestGeo), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const privacy = new URL(await page.locator('#guest-privacy').getAttribute('href'), page.url());
  assert.equal(privacy.origin, origin.origin);
  assert.equal(privacy.hash, lang === 'de' ? '#gastgruesse' : '#gastgruesse-' + lang);
  const details = await page.request.get(privacy.href);
  assert.equal(details.status(), 200);
  assert.ok((await details.text()).includes('id="' + privacy.hash.slice(1) + '"'));
}

async function checkDirectSubmission(browser, origin) {
  const nativeCards = [{ day: '2026-11-27', mark: 'star', nick: approvedNick, region: 'CN', kind: 'ai' }];
  const native = await startProfile(browser, origin, [], { width: 390, height: 844 }, nativeCards);
  try {
    const { page } = native;
    await page.goto(new URL('/?lang=zh#grusswand', origin).href);
    const editor = page.locator('#guest-editor');
    if (!await editor.evaluate(el => el.open)) await editor.locator('summary').click();
    const submit = page.locator('#guest-submit');
    await submit.waitFor();
    const list = page.locator('#guest-list');
    await list.getByText(approvedNick, { exact: false }).first().waitFor();
    await page.locator('#guest-nick').fill(draftNick);
    await page.locator('#guest-region').selectOption('DE');
    await page.locator('#guest-kind').selectOption('human');
    await page.locator('#guest-mark').selectOption('crown');
    const consent = page.locator('#guest-consent');
    assert.equal(await consent.isChecked(), false);
    if (await submit.isEnabled()) await submit.click();
    assert.equal(native.submissions.length, 0);
    await consent.check();
    const received = page.waitForResponse(response => new URL(response.url()).pathname === '/api/gastgruesse'
      && response.request().method() === 'POST' && response.status() === 202);
    await submit.focus();
    await submit.press('Enter');
    await received;
    assert.equal(native.submissions.length, 1);
    const { requestId, ...publicChoices } = native.submissions[0];
    assert.match(requestId, /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i);
    assert.deepEqual(publicChoices, { nick: draftNick, region: 'DE', kind: 'human', mark: 'crown', consent: true });
    await page.waitForFunction(() => /审|待/.test(document.querySelector('#guest-status').textContent));
    assert.equal((await list.innerText()).includes(draftNick), false, 'A pending response cannot add a public card');
    assert.ok((await list.innerText()).includes(approvedNick));
    // Simulate a later editorial approval in the private browser fixture.
    nativeCards.unshift({ day: '2026-11-28', nick: draftNick, region: 'DE', kind: 'human', mark: 'crown' });
    await page.locator('#guest-refresh').click();
    await list.getByText(draftNick, { exact: false }).first().waitFor();
    assert.equal(native.submissions.length, 1, 'Refreshing approved entries must never resubmit the greeting');
    assert.equal(await page.evaluate(() => window.testGuestGeo), 0);
    assert.deepEqual(native.unexpected, []);
  } finally {
    await native.context.close();
  }
}

module.exports = async function testGuestWall(browser, origin) {
  validatePublicFile();
  // The deployed endpoint may be unbound. Never submit data to the deployed API.
  const probe = await browser.newContext();
  try {
    const response = await probe.request.get(new URL('/api/gastgruesse', origin).href);
    assert.ok([200, 503].includes(response.status()), 'Guest API must return its board or an explicit offline response');
    const result = await response.json();
    if (response.status() === 200) {
      assert.ok(Array.isArray(result.cards));
      const fields = new Set(['day', 'mark', 'nick', 'region', 'kind']);
      for (const card of result.cards) assert.ok(Object.keys(card).every(key => fields.has(key)));
    } else {
      assert.equal(result.error, 'unavailable');
    }
    console.log('Read-only native guest board HTTP', response.status());
  } finally {
    await probe.close();
  }
  await checkDirectSubmission(browser, origin);
  const empty = await startProfile(browser, origin, [], { width: 390, height: 844 });
  try {
    await empty.page.goto(new URL('/?lang=de', origin).href);
    await empty.page.evaluate(marker => previewSpuren.add({ kind: 'idea', category: 'comics', note: marker }), privateMarker);
    for (const lang of Object.keys(countries)) {
      await typeGuests(empty, origin, lang);
      await empty.page.locator('#guest-empty').waitFor();
      assert.equal(await empty.page.locator('#guest-list li').count(), 0);
      const retry = empty.page.getByRole('button', { name: retryLabels[lang], exact: true });
      await retry.waitFor();
      if (lang === 'zh') {
        const previous = empty.reads();
        empty.enableTally();
        await retry.click();
        await empty.page.getByRole('button', { name: refreshLabels[lang], exact: true }).waitFor();
        assert.ok(empty.reads() > previous);
        assert.equal(await empty.page.locator('[data-count="star"]').evaluate(el => el.value), '3');
        await empty.page.locator('#guest-empty').waitFor();
      }
      console.log('Guest form, optional fields, publication choice and counter state verified in', lang);
    }
    assert.deepEqual(empty.unexpected, []);
  } finally {
    await empty.context.close();
  }

  // Only intercepted browser-local JS receives these fake approved cards.
  const fixture = [
    { day: '2026-11-27', mark: 'star', nick: approvedNick, region: 'CN', kind: 'human' },
    { day: '2026-11-26', mark: 'wave' },
  ];
  for (const [lang, width] of [['de', 1440], ['zh', 390]]) {
    const visitor = await startProfile(browser, origin, fixture, { width, height: 844 });
    try {
      const page = visitor.page;
      await page.goto(new URL('/?lang=' + lang + '#gastgruesse', origin).href);
      const list = page.locator('#guest-list');
      await list.waitFor();
      assert.equal(await list.locator('li').count(), 2, 'The reviewed public list is shared irrespective of browser profile');
      const first = list.locator('li').filter({ hasText: approvedNick });
      assert.equal(await first.count(), 1);
      assert.ok((await first.innerText()).includes(countries[lang]));
      assert.equal(await list.locator('time[datetime="2026-11-27"]').count(), 1);
      assert.equal(await page.locator('#guest-empty').isVisible(), false);
      assert.ok(!(await list.innerText()).includes(receiver) && !(await list.innerText()).includes(draftNick));
      assert.deepEqual(visitor.unexpected, []);
    } finally {
      await visitor.context.close();
    }
  }
  console.log('Two independent profiles rendered the approved fixture, including a symbol-only greeting. No email or database writes.');
};
