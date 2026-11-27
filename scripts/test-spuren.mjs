import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = readFileSync(new URL('../spuren-store.js', import.meta.url), 'utf8');
const key = 'ttk-spuren-preview-v1';
const pirateSignal = { category: 'spiele', project: 'piratenjagd', kind: 'controls' };

function page(storage) {
  return vm.runInNewContext(source + '\npreviewSpuren', {
    localStorage: storage, navigator: {}, crypto: { randomUUID }
  });
}

test('game and homepage share local traces and preserve older entries', async () => {
  const old = { id: 'earlier', category: 'spiele', kind: 'presence', note: '', parentId: null };
  const values = new Map([[key, JSON.stringify([old])]]);
  const storage = { getItem: k => values.get(k), setItem: (k, v) => values.set(k, v) };
  const game = page(storage);
  const home = page(storage);
  assert.equal(home.read()[0].id, old.id);
  assert.equal(await game.add(pirateSignal), 'saved');
  assert.equal(await home.add(pirateSignal), 'duplicate');
  const signal = home.read().find(entry => entry.kind === 'controls');
  assert.equal(await home.add({ category: 'spiele', kind: 'idea', note: 'Larger net buttons', parentId: signal.id }), 'saved');
  assert.equal(game.read()[0].project, 'piratenjagd');
  assert.equal(await game.remove(signal.id), 'deleted');
  assert.equal(home.read().some(entry => entry.id === signal.id), false);
  assert.equal(await game.add(pirateSignal), 'saved');
  assert.ok(home.read().some(entry => entry.id === old.id));
});

test('a full store preserves all entries until one is removed', async () => {
  let value = '[]';
  const store = page({ getItem: () => value, setItem: (_, saved) => { value = saved; } });
  for (let i = 0; i < 36; i++) await store.add({ category: 'spiele', kind: 'idea', note: String(i) });
  assert.equal(await store.add(pirateSignal), 'full');
  assert.equal(store.read().length, 36);
  await store.remove(store.read()[0].id);
  assert.equal(await store.add(pirateSignal), 'saved');
});

test('blocked storage keeps the signal available only on the current page', async () => {
  const blocked = () => { throw new Error('Storage unavailable'); };
  const store = page({ getItem: blocked, setItem: blocked });
  assert.equal(await store.add(pirateSignal), 'temporary');
  assert.equal(await store.add(pirateSignal), 'duplicate');
  assert.equal(store.read().length, 1);
  assert.equal(page({ getItem: blocked }).read().length, 0);
});
