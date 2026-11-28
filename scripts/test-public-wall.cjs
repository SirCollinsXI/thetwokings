const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Miniflare } = require('miniflare');
const { chromium } = require('playwright-core');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// Exercise specific D1 failure paths and keep the lazy bootstrap identical to
// the manual migration. Persistent failures must return 503 without looping.
async function verifyBootstrapErrors() {
  const source = Buffer.from(read('functions/api/spuren.js')).toString('base64');
  const { serveWall } = await import('data:text/javascript;base64,' + source);
  const migration = read('migrations/0002_public_trace_day.sql').split(';').map(sql => sql.trim()).filter(Boolean);
  for (const [error, missing] of [
    [new Error('D1_ERROR: no such table: public_trace_day: SQLITE_ERROR'), true],
    [new Error('D1 batch failed', { cause: new Error('no such table: main.public_trace_day') }), true],
    [new Error('D1_ERROR: no such table: public_trace_day_archive'), false],
    [new Error('D1_ERROR: quota exceeded'), false],
    [new Error('D1_ERROR: no such column: wave'), false],
  ]) {
    const batches = [];
    let reads = 0;
    const db = {
      prepare(sql) {
        return { sql, first: async () => { reads++; throw error; } };
      },
      async batch(statements) { batches.push(statements.map(statement => statement.sql)); },
    };
    const response = await serveWall(new Request('https://wall.example/api/spuren'), db);
    assert.equal(response.status, 503);
    assert.equal(reads, missing ? 2 : 1);
    assert.deepEqual(batches, missing ? [migration] : []);
  }
}

async function run() {
  await verifyBootstrapErrors();
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
      if (path === '/first-post') return serveWall(request, env.WRITE_FIRST_DB);
      if (path === '/clock') return serveWall(request, env.PUBLIC_TRACES_DB, Date.UTC(2031, 0, 11, 23, 0, 1));
      if (path === '/unbound') return onRequest({ request, env: {} });
      const asset = assets[path];
      return asset ? new Response(asset[0], { headers: { 'Content-Type': asset[1] } }) : new Response('', { status: 404 });
    } };`;
  const worker = new Miniflare({ modules: true, script, host: '127.0.0.1', port: 0,
    compatibilityDate: '2025-04-01', d1Databases: {
      PUBLIC_TRACES_DB: 'b3aed964-bb9e-40e8-a8d2-8dc4e8138931',
      WRITE_FIRST_DB: '2539f32b-0900-4add-9cfe-e1dc462ca1a8'
    } });
  let browser;
  try {
    const url = await worker.ready;
    const db = await worker.getD1Database('PUBLIC_TRACES_DB');
    const request = (path, options) => worker.dispatchFetch(new URL(path, url).href, options);
    assert.equal((await request('/unbound')).status, 503);
    const start = await request('/api/spuren');
    assert.equal(start.status, 200, 'first read initializes a fresh binding');
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
    const cold = await Promise.all([post(payload, {}, '/first-post'), post(payload, {}, '/first-post')]);
    assert.deepEqual(cold.map(response => response.status).sort(), [200, 409], 'concurrent first writes initialize exactly once');
    assert.equal((await (await request('/first-post')).json()).counts.star, 1);

    // A pre-existing table with its sentinel missing takes the same bounded recovery path.
    await db.prepare('DELETE FROM public_trace_day WHERE id = 1').run();
    const simultaneous = await Promise.all([post(payload), post(payload)]);
    assert.deepEqual(simultaneous.map(r => r.status).sort(), [200, 409]);

    for (const sql of read('migrations/0002_public_trace_day.sql').split(';').filter(sql => sql.trim())) {
      await db.prepare(sql.trim()).run();
    }
    assert.equal((await (await request('/api/spuren')).json()).counts.star, 1, 'manual migration preserves existing totals');
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
    await reader.getByRole('button', { name: 'Heutige Zahlen abrufen' }).click();
    await tally(reader, 'wave', 1);
    // Language and new browser identity do not fork the shared tally.
    await reader.evaluate(() => { document.documentElement.lang = 'zh-CN'; });
    await reader.getByRole('button', { name: '王冠', exact: true }).click();
    await tally(reader, 'crown', 1);
    await sender.getByRole('button', { name: 'Heutige Zahlen abrufen' }).click();
    await tally(sender, 'crown', 1);
    for (const context of [first, second]) {
      assert.deepEqual(await context.storageState(), { cookies: [], origins: [] });
    }
    await reader.route('**/api/spuren', route => route.fulfill({
      status: 503, contentType: 'application/json', body: '{"error":"unavailable"}'
    }));
    await reader.getByRole('button', { name: '刷新今日计数' }).click();
    await reader.getByText('今日计数暂时无法使用。', { exact: true }).waitFor();
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
