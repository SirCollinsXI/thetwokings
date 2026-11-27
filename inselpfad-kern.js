'use strict';

const GezeitenKern = (() => {
  const rows = ['lllll', 'psssl', 'lrlrb', 'dllss'];
  const names = { l: 'island', p: 'post', s: 'sea', r: 'reef', b: 'beacon', d: 'dock' };
  const directions = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const width = rows[0].length;
  const height = rows.length;
  function start() {
    return { x: 0, y: 3, turn: 0, carrying: false, won: false };
  }
  function terrain(x, y) {
    return names[rows[y]?.[x]] || null;
  }
  function tide(state) {
    return state.turn % 2 === 0 ? 'low' : 'high';
  }
  function blocked(state, x, y) {
    const tile = terrain(x, y);
    if (!tile) return 'edge';
    if (Math.abs(x - state.x) + Math.abs(y - state.y) !== 1) return 'far';
    if (tile === 'sea') return 'sea';
    if (tile === 'reef' && tide(state) === 'high') return 'tide';
    return null;
  }
  function step(state, action) {
    if (state.won) return { state, event: 'won' };
    if (action === 'wait') {
      return { state: { ...state, turn: state.turn + 1 }, event: 'waited' };
    }
    const delta = directions[action];
    if (!Array.isArray(delta)) return { state, event: 'far' };
    const x = state.x + delta[0];
    const y = state.y + delta[1];
    const obstruction = blocked(state, x, y);
    if (obstruction) return { state, event: obstruction };
    const tile = terrain(x, y);
    const carrying = state.carrying || tile === 'post';
    const won = carrying && tile === 'beacon';
    let event = 'walked';
    if (tile === 'post' && !state.carrying) event = 'parcel';
    if (tile === 'beacon') event = won ? 'won' : 'empty';
    return { state: { x, y, carrying, won, turn: state.turn + 1 }, event };
  }
  return Object.freeze({ width, height, start, terrain, tide, blocked, step });
})();

if (typeof module === 'object' && module.exports) module.exports = GezeitenKern;
