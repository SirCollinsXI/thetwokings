'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const core = require('../inselpfad-kern.js');

function route(actions, state = core.start()) {
  return actions.reduce((current, action) => core.step(current, action).state, state);
}

test('the complete, dry route collects the letter and delivers in nine turns', () => {
  const result = route(['up', 'up', 'up', 'right', 'right', 'right', 'right', 'down', 'down']);
  assert.deepEqual(result, { x: 4, y: 2, turn: 9, carrying: true, won: true });
  assert.strictEqual(core.step(result, 'wait').state, result);
  assert.strictEqual(core.step(result, 'left').state, result);
});

test('the faster route requires reading the tide and waiting', () => {
  const post = route(['up', 'up']);
  assert.equal(post.carrying, true);
  const shore = core.step(post, 'down').state;
  assert.equal(core.tide(shore), 'high');
  const blocked = core.step(shore, 'right');
  assert.equal(blocked.event, 'tide');
  assert.strictEqual(blocked.state, shore);
  const reef = route(['wait', 'right'], shore);
  assert.equal(core.terrain(reef.x, reef.y), 'reef');
  assert.equal(core.tide(reef), 'high');
  const result = route(['right', 'right', 'right'], reef);
  assert.deepEqual(result, { x: 4, y: 2, turn: 8, carrying: true, won: true });
});

test('the courier may stay on a reef as the tide changes', () => {
  const reef = route(['up', 'up', 'down', 'wait', 'right']);
  const next = core.step(reef, 'wait').state;
  assert.equal(reef.x, next.x);
  assert.equal(reef.y, next.y);
  assert.equal(core.tide(next), 'low');
  assert.equal(next.won, false);
});

test('edges and deep water do not consume turns or mutate the state', () => {
  const start = Object.freeze(core.start());
  assert.deepEqual(core.step(start, 'left'), { state: start, event: 'edge' });
  const shore = Object.freeze(route(['right', 'right']));
  assert.deepEqual(core.step(shore, 'right'), { state: shore, event: 'sea' });
  assert.equal(core.blocked(shore, 4, 2), 'far');
});

test('the lighthouse only accepts deliveries after the post-office pickup', () => {
  const atReef = route(['right', 'right', 'up', 'wait', 'right']);
  const early = core.step(atReef, 'right');
  assert.equal(early.event, 'empty');
  assert.equal(early.state.won, false);
  assert.equal(early.state.carrying, false);
});

test('a fresh round resets location, tide and parcel', () => {
  const initial = core.start();
  const exploring = route(['up', 'up'], initial);
  assert.deepEqual(core.start(), { x: 0, y: 3, turn: 0, carrying: false, won: false });
  assert.equal(core.tide(initial), 'low');
  assert.notDeepEqual(exploring, initial);
});
