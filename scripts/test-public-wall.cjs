const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Miniflare } = require('miniflare');
const { chromium } = require('playwright-core');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

async function run() {
  const markup = read('homepage-preview.html').match(/<section\b[^>]*\bid="grusswand"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert(markup, 'The homepage must contain the public wall');
  const page = '<!doctype html><html lang="de"><meta charset="utf-8"><link rel="stylesheet" href="/public-wall.css">' +
    '<main>' + markup + '</main><script src="/public-wall.js"></script></html>';
  const assets = {
    '/': [page, 'text/html; charset=utf-8'], '/public-wall.js': [read('public-wall.js'), 'text/javascript; charset=utf-8'],
    '/public-wall.css': [read('public-wall.css'), 'text/css; charset=utf-8']
  };
  // Only this isolated test worker serves the fixture and the deterministic clock.
  const script = read('functions/api/spuren.js') + '\nconst assets = ' + JSON.stringify(assets) + `;
    export default { fetch(request, env) {
      const path = new URL(request.url).pathname;
      if (path === '/api/spuren') return onRequest({ request, env });
      if (path === '/clock') return serveWall(request, env.PUBLIC_TRACES_DB, Date.UTC(2031, 0, 11, 23, 0, 1));
      if (path === '/unbound') return onRequest({ request, env: {} });
      const asset = assets[path];
      return asset ? new Response(asset[0], { headers: { 'Content-Type': asset[1] } }) : new Response('', { status: 404 });
    } };`;
  const worker = new Miniflare({ modules: true, script, host: '127.0.0.1', port: 0,
    compatibilityDate: '2025-04-01', d1Databases: { PUBLIC_TRACES_DB: 'b3aed964-bb9e-40e8-a8d2-8dc4e8138931' } });
  let browser;
  try {
    const url = await worker.ready;
    const db = await worker.getD1Database('PUBLIC_TRACES_DB');
    const request = (path, options) => worker.dispatchFetch(new URL(path, url).href, options);
    assert.equal((await request('/unbound')).status, 503);
    assert.equal((await request('/api/spuren')).status, 503, 'missing migration fails closed');
    for (const sql of read('migrations/0002_public_trace_day.sql').split(';').filter(sql => sql.trim())) {
      await db.prepare(sql.trim()).run();
    }
    const start = await request('/api/spuren');
    assert.equal(start.status, 200);
    assert.equal(start.headers.get('Cache-Control'), 'no-store');
    const { day, counts } = await start.json();
    assert.deepEqual(counts, { wave: 0, star: 0, crown: 0 });
    const payload = { day, mark: 'star', seen: 0 };
    const post = (data, other = {}, endpoint = '/api/spuren') => request(endpoint, {
      method: 'POST', headers: { Origin: url.origin, 'Content-Type': 'application/json', ...other },
      body: typeof data === 'string' ? data : JSON.stringify(data)
    });
    assert.equal((await request('/api/spuren', { method: 'DELETE' })).status, 405);
    assert.equal((await post(payload, { Origin: 'https://another.example' })).status, 403);
    assert.equal((await post(payload, { 'Content-Type': 'text/plain' })).status, 415);
    for (const invalid of [{ ...payload, name: 'example' }, { ...payload, mark: 'custom' }, 'x'.repeat(500), '{}']) {
      assert.equal((await post(invalid)).status, 400);
    }
    const simultaneous = await Promise.all([post(payload), post(payload)]);
    assert.deepEqual(simultaneous.map(r => r.status).sort(), [200, 409]);

    browser = await chromium.launch({ executablePath: process.env.CHROME });
    const first = await browser.newContext();
    const second = await browser.newContext();
    const sender = await first.newPage();
    const reader = await second.newPage();
    await sender.goto(url.href);
    await reader.goto(url.href);
    const tally = (page, mark, n) => page.waitForFunction(({ mark, n }) =>
      document.querySelector('[data-count="' + mark + '"]').value === String(n), { mark, n });
    await tally(reader, 'star', 1);
    await sender.getByRole('button', { name: 'Winken', exact: true }).click();
    await tally(sender, 'wave', 1);
    await reader.getByRole('button', { name: 'Stand neu laden' }).click();
    await tally(reader, 'wave', 1);
    // Language and new browser identity do not fork the shared tally.
    await reader.evaluate(() => { document.documentElement.lang = 'zh-CN'; });
    await reader.getByRole('button', { name: '王冠', exact: true }).click();
    await tally(reader, 'crown', 1);
    await sender.getByRole('button', { name: 'Stand neu laden' }).click();
    await tally(sender, 'crown', 1);
    for (const context of [first, second]) {
      assert.deepEqual(await context.storageState(), { cookies: [], origins: [] });
    }
    await reader.route('**/api/spuren', route => route.fulfill({
      status: 503, contentType: 'application/json', body: '{"error":"unavailable"}'
    }));
    await reader.getByRole('button', { name: '刷新总数' }).click();
    await reader.getByText('公共印记墙暂时无法使用。', { exact: true }).waitFor();
    assert(await reader.locator('.wall-board').isHidden(), 'Unreachable boards do not show invented zeros');

    const rolled = await (await request('/clock')).json();
    assert.deepEqual(rolled, { day: '2031-01-12', counts: { wave: 0, star: 0, crown: 0 } });
    assert.equal((await post(payload, {}, '/clock')).status, 409, 'stale tab across Berlin midnight');
    const next = { day: rolled.day, mark: 'crown', seen: 0 };
    assert.equal((await post(next, {}, '/clock')).status, 200);
    const count = await db.prepare('SELECT count(*) AS n FROM public_trace_day').first();
    assert.equal(count.n, 1, 'only one aggregate day is retained');
    await db.prepare('UPDATE public_trace_day SET window_count = 60 WHERE id = 1').run();
    const limited = await post({ ...next, seen: 1 }, {}, '/clock');
    assert.equal(limited.status, 429);
    assert.equal((await limited.json()).counts.crown, 1);
    console.log('Public wall verified with local D1 and two independent Chromium contexts.');
  } finally {
    try { await browser?.close(); } finally { await worker.dispose(); }
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
