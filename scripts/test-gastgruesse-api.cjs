const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { Miniflare } = require('miniflare');

// Only the isolated test worker accepts a simulated clock or an unbound route.
const source = readFileSync(path.join(__dirname, '../functions/api/gastgruesse.js'), 'utf8') + `
  export default { fetch(request, env) {
    const path = new URL(request.url).pathname;
    return serveGuestCards(request, path === '/unbound' ? undefined : env.PUBLIC_TRACES_DB,
      Number(request.headers.get('x-test-clock')));
  } };
`;

async function run() {
  const worker = new Miniflare({modules: true, script: source, host: '127.0.0.1', port: 0,
    compatibilityDate: '2025-04-01', d1Databases: {PUBLIC_TRACES_DB: 'cfb2c84d-781c-4d0c-a003-9d83d59aed88'}});
  try {
    const url = await worker.ready;
    const db = await worker.getD1Database('PUBLIC_TRACES_DB');
    const day = 86400000;
    let now = Date.UTC(2031, 0, 11, 23, 10);
    const request = (endpoint, options = {}) => worker.dispatchFetch(new URL(endpoint, url).href, {
      ...options, headers: {'x-test-clock': String(now), ...options.headers}
    });
    const endpoint = '/api/gastgruesse';
    const get = () => request(endpoint);
    function post(data, headers = {}) {
      return request(endpoint, {method: 'POST', headers: {Origin: url.origin, 'Content-Type': 'application/json', ...headers},
        body: typeof data === 'string' ? data : JSON.stringify(data)});
    }
    const card = (changes = {}) => ({
      mark: 'wave', nick: '', region: '', kind: '', consent: true, requestId: randomUUID(), ...changes
    });
    assert.equal((await request('/unbound')).status, 503);
    assert.equal((await request(endpoint, {method: 'DELETE'})).status, 405);
    assert.equal((await post(card(), {Origin: 'https://example.org'})).status, 403);
    assert.equal((await post(card(), {'Sec-Fetch-Site': 'cross-site'})).status, 403);
    assert.equal((await post(card(), {'Content-Type': 'text/plain'})).status, 415);
    for (const data of [card({consent: false}), card({day: '2031-01-01'}), card({requestId: 'short'}),
      card({status: 'approved'}), card({nick: 'x'.repeat(41)}), card({nick: 'Name\u202e'}),
      card({nick: 'a@example.org'}), card({nick: 'example.com'}), card({nick: 'a＠example.org'}),
      card({kind: 'verified'}), card({region: 'ZZ'}), card({region: null}), card({mark: 'sun'}), 'x'.repeat(1800)]) {
      assert.equal((await post(data)).status, 400);
    }
    const starts = await Promise.all([get(), get()]);
    for (const response of starts) {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.deepEqual(await response.json(), {cards: []});
    }
    const first = card({nick: '星光', region: 'CN', kind: 'ai', mark: 'crown'});
    const retries = await Promise.all([post(first), post(first), post(first)]);
    for (const response of retries) {
      assert.equal(response.status, 202);
      assert.deepEqual(await response.json(), {status: 'pending'});
    }
    assert.equal((await post({...first, nick: 'other'})).status, 409);
    assert.equal((await post(card())).status, 202, 'all optional fields may be empty');
    assert.equal(await db.prepare('SELECT COUNT(*) FROM guest_greetings').first('COUNT(*)'), 2);
    assert.deepEqual(await (await get()).json(), {cards: []}, 'pending cards stay private');
    const burst = await Promise.all(Array.from({length: 12}, () => post(card())));
    assert.equal(burst.filter(r => r.status === 202).length, 8);
    assert.equal(burst.filter(r => r.status === 429).length, 4);
    assert.equal((await post(first)).status, 202, 'retry also works at capacity');

    // Same operator action as in the protected D1 console, on the disposable DB.
    now += 2 * day;
    await db.prepare('UPDATE guest_greetings SET published_at=? WHERE request_key=? AND published_at IS NULL')
      .bind(Math.floor(now / 1000), first.requestId).run();
    const expected = {cards: [{day: '2031-01-14', mark: 'crown', nick: '星光', region: 'CN', kind: 'ai'}]};
    assert.deepEqual(await (await get()).json(), expected, 'no private key, consent record or submission time in public output');
    now += 31 * day;
    assert.deepEqual(await (await get()).json(), expected, 'expiry preserves a published card');
    assert.equal(await db.prepare('SELECT COUNT(*) FROM guest_greetings').first('COUNT(*)'), 1);
    await db.prepare('DELETE FROM guest_greetings WHERE request_key=?').bind(first.requestId).run();
    assert.deepEqual(await (await get()).json(), {cards: []});
    console.log('Isolated D1 guest cards passed: fresh setup, optional fields, consent, retry, moderation, quotas, expiry and removal.');
  } finally {
    await worker.dispose();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
