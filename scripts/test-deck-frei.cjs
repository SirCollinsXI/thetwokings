'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { create } = require('../deck-frei-model.js');

function advance(game, total, frames) {
  let remaining = total;
  for (let i = 0; remaining > 0; i++) {
    const dt = Math.min(remaining, frames[i % frames.length]);
    game.step(dt);
    remaining -= dt;
  }
}

function shoot(ms, lane = 'right', frames = [8000]) {
  const game = create();
  game.start();
  advance(game, ms, frames);
  game.drop(lane);
  advance(game, 560, frames);
  return game;
}

test('fork commits the chosen gate on time and ignores later directions', () => {
  const game = create();
  game.step(4000);
  game.setGate('left');
  game.drop('left');
  game.togglePause();
  assert.equal(game.state.phase, 'ready');
  assert.equal(game.state.armed, null);
  assert.equal(game.state.gate, 'right');
  game.start();
  game.step(3199);
  game.setGate('left');
  game.setGate('starboard');
  assert.equal(game.state.lane, null);
  game.step(1);
  game.setGate('right');
  assert.equal(game.state.lane, 'left');
  assert.equal(game.state.gate, 'left');
  game.step(2880);
  assert.equal(game.state.inWindow, true);
  game.drop('port');
  assert.equal(game.state.armed, null);
  game.drop('left');
  game.drop('right');
  assert.deepEqual(game.state.armed, { lane: 'left', progress: 0 });
  game.step(280);
  assert.equal(game.state.armed.progress, 0.5);
  game.step(280);
  assert.equal(game.state.phase, 'won');
  assert.equal(game.state.result, 'catch');
  assert.equal(game.state.progress, game.state.catchAt);
});

test('on-time, grazing, mistimed and opposite-lane nets produce distinct outcomes', () => {
  for (const [ms, lane, kind, feedback] of [
    [0, 'right', 'miss', 'early'],
    [4900, 'right', 'miss', 'early'],
    [5200, 'right', 'graze', 'early'],
    [5500, 'right', 'catch', 'caught'],
    [6650, 'right', 'catch', 'caught'],
    [6800, 'right', 'graze', 'late'],
    [7650, 'right', 'miss', 'late'],
    [6080, 'left', 'miss', 'wrong-lane']
  ]) {
    const state = shoot(ms, lane).state;
    assert.equal(state.result, kind, String(ms));
    assert.equal(state.feedback, feedback, String(ms));
    assert.equal(state.phase, kind === 'catch' ? 'won' : 'retry');
  }
});

test('the cue predicts the collision outcome across the whole run', () => {
  for (let ms = 0; ms < 8000; ms += 37) {
    const game = create();
    game.start();
    game.step(ms);
    const cue = game.state.inWindow;
    game.drop('right');
    game.step(560);
    assert.equal(cue, game.state.result === 'catch', String(ms));
  }
});

test('pause freezes fork, net and retry timers; stale actions cannot queue a shot', () => {
  const game = create();
  game.start();
  game.step(2000);
  game.togglePause();
  const paused = game.state;
  game.setGate('left');
  game.drop('right');
  game.start();
  game.step(10000);
  assert.deepEqual(game.state, paused);
  game.togglePause();
  game.step(4080);
  game.drop('left');
  game.step(280);
  game.togglePause();
  game.step(10000);
  assert.equal(game.state.armed.progress, 0.5);
  game.togglePause();
  game.step(280);
  game.step(500);
  game.togglePause();
  const failed = game.state;
  game.drop('right');
  game.setGate('left');
  game.step(3000);
  assert.deepEqual(game.state, failed);
  game.togglePause();
  game.step(1699);
  assert.equal(game.state.phase, 'retry');
  game.step(1);
  assert.equal(game.state.phase, 'run');
  assert.equal(game.state.attempt, 2);
  assert.equal(game.state.progress, 0);
  assert.equal(game.state.armed, null);
  assert.equal(game.state.result, null);
});

test('empty pass shows a miss before retry; unattended passes consume excess time', () => {
  const game = create();
  game.start();
  game.step(8000);
  assert.equal(game.state.phase, 'retry');
  assert.equal(game.state.feedback, 'no-drop');
  assert.equal(game.state.result, 'miss');
  game.step(2200 + 10200 * 12 + 6080);
  assert.equal(game.state.phase, 'run');
  assert.equal(game.state.attempt, 14);
  assert.equal(game.state.inWindow, true);
});

test('victory remains until replay, which swaps starting sides and clears the catch', () => {
  const game = shoot(6080);
  const won = game.state;
  game.drop('left');
  game.togglePause();
  game.step(50000);
  game.start();
  assert.deepEqual(game.state, won);
  game.reset();
  assert.equal(game.state.phase, 'run');
  assert.equal(game.state.attempt, 1);
  assert.equal(game.state.mirrored, true);
  assert.equal(game.state.gate, 'left');
  assert.equal(game.state.approachingFrom, 'right');
  assert.equal(game.state.result, null);
  game.step(6080);
  game.drop('left');
  game.step(560);
  assert.equal(game.state.result, 'catch');
  game.replay();
  assert.equal(game.state.mirrored, false);
  assert.equal(game.state.approachingFrom, 'left');
});

test('short, variable and long frames agree at collisions and across retry boundaries', () => {
  const patterns = [[16], [4, 93, 17, 27, 190, 7], [1000 / 60], [65535]];
  for (const frames of patterns) {
    assert.deepEqual(shoot(6080, 'right', frames).state, shoot(6080).state);
    const game = create();
    game.start();
    advance(game, 10200 * 3 + 4000, frames);
    assert.equal(game.state.phase, 'run');
    assert.equal(game.state.attempt, 4);
    assert.equal(game.state.lane, 'right');
    assert.ok(Math.abs(game.state.progress - 0.5) < 1e-9);
    const previous = game.state;
    for (const dt of [-1, NaN, Infinity, 0]) game.step(dt);
    assert.deepEqual(game.state, previous);
  }
});
