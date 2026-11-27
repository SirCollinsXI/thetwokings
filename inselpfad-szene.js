/* Original artwork for the tide map. World units span 100 × 100 per tile. */
(function () {
  'use strict';

  const ink = '#203f3d';

  function paint(ctx, outline, fill, stroke, width = 1.6) {
    const path = new Path2D(outline);
    if (fill) { ctx.fillStyle = fill; ctx.fill(path); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(path); }
  }

  function oval(ctx, x, y, rx, ry, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function transform(ctx, x, y, scale, draw) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    draw(ctx);
    ctx.restore();
  }

  function water(ctx, high) {
    const sea = ctx.createLinearGradient(25, 0, 460, 400);
    sea.addColorStop(0, high ? '#85d0c7' : '#b4e0cd');
    sea.addColorStop(0.48, high ? '#50aeb0' : '#74c3bc');
    sea.addColorStop(1, high ? '#347d8b' : '#4a98a2');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 0, 500, 400);
    const shelves = [
      'M-20 64 C50 94 117 33 164 34 S264 82 317 53 S466 -16 530 17',
      'M-20 278 C56 258 83 317 153 297 S242 190 319 213 S449 291 520 239',
      'M-20 370 C77 362 106 400 162 373 S220 316 270 326 S382 385 458 345 S502 316 526 321'
    ];
    for (const d of shelves) {
      ctx.save();
      paint(ctx, d, null, 'rgba(232,254,225,.19)', 11);
      ctx.translate(0, 11);
      paint(ctx, d, null, 'rgba(232,254,225,.22)', 1);
      ctx.restore();
    }
    for (let n = 0; n < 100; n++) {
      const x = (n * 79 + 19) % 510;
      const y = (n * 53 + (n % 4) * 29) % 410;
      const length = 3 + n % 12;
      ctx.strokeStyle = n % 4 ? 'rgba(245,255,226,.47)' : 'rgba(17,97,105,.22)';
      ctx.lineWidth = n % 3 ? 1 : 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + length * 0.5, y + 1.8, x + length, y - 0.4);
      ctx.stroke();
    }
  }

  const islet = 'M-42 5 Q-40 -2 -30 -5 L-26 -13 Q-16 -18 -1 -18 L12 -20 Q23 -20 27 -14 L38 -9 Q43 -5 41 1 L45 7 Q44 14 34 16 L27 20 Q17 22 9 20 L-6 23 Q-20 22 -24 18 L-36 16 Q-43 12 -42 5 Z';

  function island(ctx, seed) {
    ctx.save();
    ctx.translate(50, 56);
    if (seed % 2) ctx.scale(-1, 1);
    ctx.save();
    ctx.translate(0, 7);
    ctx.scale(1.10, 1.1);
    paint(ctx, islet, '#9fdcc8', '#d5e9cd', 1.2);
    ctx.restore();
    ctx.save();
    ctx.translate(0, 5);
    paint(ctx, islet, '#ac8868', ink, 1.1);
    ctx.restore();
    paint(ctx, islet, '#e4c98d', '#587d65', 1);
    ctx.save();
    ctx.translate(0, -1.7);
    ctx.scale(0.90, 0.79);
    paint(ctx, islet, '#a0b978');
    ctx.restore();
    paint(ctx, 'M-37 11 q6 4 11 4 M18 17 l7 -2 M-15 -13 q9 -3 16 -3',
      null, '#f2dda9', 1.5);
    for (let i = 0; i < 3; i++) {
      const x = (i * 17 + seed * 5) % 52 - 26;
      const y = ((i + seed) * 7) % 17 - 8;
      ctx.save();
      ctx.translate(x, y);
      paint(ctx, 'M-3 1 l2 -1 m2 0 l2 -1', null, '#799c70', 1.3);
      ctx.restore();
    }
    ctx.restore();
  }

  function grass(ctx) {
    paint(ctx, 'M-8 3 l-3 -6 7 3 1 -9 3 8 7 -5 -3 8 Z', '#67916c');
    paint(ctx, 'M-2 2 l0 -5 m4 5 l3 -3', null, '#c0cf8c', 1);
  }

  function pine(ctx) {
    oval(ctx, 2, 3, 10, 3.5, 'rgba(36,77,57,.22)');
    paint(ctx, 'M-2 3 l0 -12 4 0 0 12 Z', '#8c6c4c', ink, 1);
    paint(ctx, 'M0 -33 Q3 -23 8 -19 L5 -18 11 -11 6 -11 12 -5 Q3 -1 -10 -5 L-6 -11 -10 -11 -4 -19 -6 -19 Z', '#407d6a', ink, 1.1);
    paint(ctx, 'M0 -29 l-2 10 2 -1 -3 8 3 -1 -4 7 -5 0 4 -7 -3 0 5 -8 -2 1 Z', '#75a47c');
    paint(ctx, 'M6 -8 l3 3 -5 1 M2 -15 l4 -1', null, '#36645b', 1);
  }

  function boulder(ctx) {
    paint(ctx, 'M-8 2 l2 -5 6 -4 7 4 2 5 -9 2 Z', '#9b9f86', '#586f65', 1.2);
    paint(ctx, 'M-6 -2 l6 -4 5 2 -6 2 Z', '#c8c4a4');
  }

  function dryGround(ctx, seed) {
    const side = seed % 2 ? 67 : 30;
    const other = 100 - side;
    switch (seed % 5) {
      case 0:
        transform(ctx, side, 49, .9, pine);
        transform(ctx, side + 10, 52, .54, pine);
        break;
      case 1:
        transform(ctx, side, 49, .89, boulder);
        transform(ctx, side - 3, 44, .65, boulder);
        transform(ctx, side - 2, 40, .41, boulder);
        break;
      case 2:
        transform(ctx, side, 49, .9, pine);
        transform(ctx, other, 61, .65, boulder);
        break;
      case 3:
        transform(ctx, side, 49, .77, grass);
        transform(ctx, side + 9, 52, .57, grass);
        transform(ctx, other, 61, .67, boulder);
        break;
      default:
        transform(ctx, side, 51, .62, pine);
        transform(ctx, side + 8, 49, .8, boulder);
    }
    transform(ctx, other + 2, 58, .55, grass);
  }

  function crossings(ctx, tiles, high) {
    const terrain = new Map(tiles.map(tile => [tile.dataset.x + ',' + tile.dataset.y, tile.dataset.terrain]));
    for (const tile of tiles) {
      const { terrain: from } = tile.dataset;
      if (from === 'sea') continue;
      const x = Number(tile.dataset.x);
      const y = Number(tile.dataset.y);
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        const to = terrain.get((x + dx) + ',' + (y + dy));
        if (!to || to === 'sea') continue;
        const tidal = from === 'reef' || to === 'reef';
        ctx.save();
        ctx.translate(x * 100 + 50, y * 100 + 56);
        if (dy) ctx.rotate(Math.PI / 2);
        const start = dy ? 15 : 34;
        const end = dy ? 86 : 68;
        if (tidal) {
          for (let i = start; i < end; i += 9) {
            const drift = (i % 4) - 2;
            if (high) oval(ctx, i, drift, 2.5, 2, 'rgba(44,117,116,.48)');
            else {
              oval(ctx, i, drift + 1, 3.9, 2.7, '#658e80');
              oval(ctx, i, drift, 3.6, 2.5, '#d5cf9d');
            }
          }
        } else {
          ctx.fillStyle = '#6b7461';
          ctx.fillRect(start, -2, end - start, 5);
          for (let i = start; i < end; i += 4) {
            ctx.fillStyle = i % 3 ? '#c4a777' : '#ddbc82';
            ctx.fillRect(i, -3, 3.5, 7);
          }
          ctx.beginPath();
          ctx.moveTo(start, -4); ctx.quadraticCurveTo(50, -1, end, -4);
          ctx.lineWidth = .95; ctx.strokeStyle = '#755e4b'; ctx.stroke();
          for (const p of [start + 3, end - 3]) {
            ctx.fillStyle = '#605c45';
            ctx.fillRect(p, -6, 1.8, 9);
          }
        }
        ctx.restore();
      }
    }
  }

  function dock(ctx) {
    paint(ctx, 'M8 48 l31 -7 27 2 -6 6 -21 2 -27 4 Z', '#8a7156', ink, 1.4);
    for (let i = 0; i < 7; i++) {
      const x = 12 + i * 4;
      const y = 47 - i * .9;
      ctx.save();
      ctx.translate(x, y);
      paint(ctx, 'M0 0 L2 4', null, '#ead291', 1);
      ctx.restore();
    }
    paint(ctx, 'M13 57 l0 -14 m24 8 l0 -13', null, '#65523e', 2.8);
    oval(ctx, 13, 43, 2, 1.1, '#dfc291');
    oval(ctx, 37, 38, 2, 1.1, '#dfc291');
    paint(ctx, 'M26 44 L26 20', null, ink, 2);
    paint(ctx, 'M27 20 Q32 16 40 20 L35 23 39 25 Q32 23 27 26 Z', '#f5ac5c', ink, 1.2);
    transform(ctx, 73, 60, .54, grass);
  }

  function post(ctx) {
    oval(ctx, 56, 62, 20, 5, 'rgba(36,77,57,.24)');
    paint(ctx, 'M37 45 L54 38 70 43 70 58 54 64 37 58 Z', '#e8ce98', ink, 1.6);
    paint(ctx, 'M54 45 L70 42 70 58 54 64 Z', '#b09c6f', ink, 1.1);
    paint(ctx, 'M33 45 L44 28 58 24 74 40 54 48 Z', '#bd6045', ink, 1.8);
    paint(ctx, 'M44 28 l14 -4 16 16 -15 3 Z', '#d8794c', ink, 1.2);
    paint(ctx, 'M35 44 l10 -13 10 15 Z', '#efcd91', ink, 1.1);
    paint(ctx, 'M42 57 l0 -8 6 -1 0 11 Z', '#527c6e', ink, 1);
    paint(ctx, 'M59 50 l7 -2 0 5 -7 2 Z', '#f8e5a5', ink, 1);
    paint(ctx, 'M59 50 l3 2 4 -4', null, '#916744', .9);
    paint(ctx, 'M68 38 L70 20 M70 20 l12 -2 -4 4 4 2 -12 2 Z', '#e6a44f', ink, 1.3);
    transform(ctx, 27, 59, .55, grass);
  }

  function beacon(ctx) {
    oval(ctx, 56, 62, 18, 4.5, 'rgba(36,77,57,.24)');
    paint(ctx, 'M38 63 L42 58 62 56 69 61 62 65 46 66 Z', '#b6a789', ink, 1.2);
    paint(ctx, 'M42 59 L47 29 57 29 62 58 Q52 63 42 59 Z', '#f3e8c3', ink, 1.5);
    paint(ctx, 'M45 43 Q52 46 59 41 L60 48 Q52 53 44 49 Z', '#c56a4d');
    paint(ctx, 'M51 60 l0 -8 q3 -3 5 -1 l0 8 Z', '#456861');
    paint(ctx, 'M44 31 l0 -9 16 0 0 9 Q51 34 44 31 Z', '#ffcf63', ink, 1.4);
    paint(ctx, 'M48 23 l0 7 m7 -7 l0 7 M42 32 q10 3 20 -1', null, ink, 1.5);
    paint(ctx, 'M41 22 L51 14 54 14 63 22 Q52 25 41 22 Z', '#b85b48', ink, 1.4);
    paint(ctx, 'M52 15 l0 -5', null, ink, 1.2);
    paint(ctx, 'M37 26 l-5 1 m34 -2 l5 -1', null, '#fff2bf', 1.8);
    transform(ctx, 75, 60, .55, boulder);
  }

  function reef(ctx, high, seed) {
    ctx.save();
    ctx.translate(50, 56);
    if (seed % 2) ctx.scale(-1, 1);
    oval(ctx, 0, 2, 39, 14, high ? '#72c1be' : '#a7d5b8');
    if (!high) {
      paint(ctx, 'M-34 3 Q-32 -4 -22 -3 L-13 -8 -5 -6 6 -11 16 -9 19 -4 29 -5 35 0 Q36 5 26 6 L16 11 9 8 -5 12 -16 10 -19 7 -30 8 Z', '#d3c28f', '#719d88', 1.1);
    }
    const points = [[-22, 2, .65], [-6, -3, .78], [12, -6, .76], [23, 2, .50]];
    for (const [x, y, scale] of points) {
      transform(ctx, x, y + (high ? 2 : 0), high ? scale * .75 : scale, boulder);
    }
    paint(ctx, high ? 'M-31 2 q6 6 13 3 m7 -5 q7 6 14 2 m3 -6 q7 7 15 4 m-11 8 q9 3 17 -1'
      : 'M-35 9 q7 4 15 3 m24 3 q11 0 17 -4', null, '#e2f3d9', high ? 2 : 1.3);
    ctx.restore();
  }

  function dino(ctx, carrying) {
    oval(ctx, 0, 4, 15, 4, 'rgba(22,58,49,.27)');
    paint(ctx, 'M-9 -9 Q-18 -9 -22 -18 Q-24 -17 -22 -10 Q-18 0 -8 0 L4 0 Z', '#367c73', ink, 1.5);
    paint(ctx, 'M-6 -18 l0 -6 4 3 1 -5 4 6', '#e7aa5d', ink, 1.5);
    paint(ctx, 'M-7 2 L-10 2 Q-11 5 -14 3 L-12 -3 Q-11 -15 -3 -18 L0 -22 Q-1 -31 6 -34 Q12 -36 16 -30 L21 -29 Q25 -28 23 -23 Q21 -18 13 -18 L10 -9 Q8 -5 4 -2 L7 1 Q8 4 4 4 L0 3 -2 -1 -7 0 Z', '#488e73', ink, 1.8);
    paint(ctx, 'M14 -21 Q19 -20 22 -24 Q21 -20 17 -19 L12 -18 8 -8 5 -7 Z', '#a3b77b');
    paint(ctx, 'M-8 -15 q5 -4 7 -9 L1 -25 M-11 -7 l2 -4', null, '#75ad88', 1.6);
    paint(ctx, 'M7 -26 q2 -2 5 -1', null, '#c5ce91', 1);
    oval(ctx, 12, -28, 1.6, 2.4, ink);
    oval(ctx, 12.2, -29, .5, .7, '#fff0d0');
    oval(ctx, 20, -26, .65, .55, ink);
    paint(ctx, 'M4 -21 L-6 -6', null, '#493f34', 2.5);
    paint(ctx, 'M4 -21 L-6 -6', null, '#edc77e', 1.3);
    paint(ctx, 'M-10 -11 L-2 -13 0 -5 -9 -3 Z', '#dd9759', ink, 1.4);
    paint(ctx, 'M-10 -11 L-5 -8 -2 -13', null, '#845738', 1.3);
    if (carrying) oval(ctx, -5, -8, 1.6, 1.6, '#fff2a3');
  }

  function draw(board) {
    if (!board) return;
    let canvas = board.querySelector('canvas.map-art');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'map-art';
      canvas.setAttribute('aria-hidden', 'true');
      canvas.width = 1500;
      canvas.height = 1200;
      board.prepend(canvas);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(3, 0, 0, 3, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const high = board.dataset.tide === 'high';
    water(ctx, high);
    const tiles = Array.from(board.querySelectorAll('.tile'));
    const previousLocation = canvas.dataset.location;
    const location = board.dataset.x + ',' + board.dataset.y;
    if (location !== previousLocation) {
      tiles.forEach(tile => tile.classList.toggle('arrived', Boolean(previousLocation) && tile.classList.contains('current')));
      canvas.dataset.location = location;
    }
    crossings(ctx, tiles, high);
    for (const tile of tiles) {
      const x = Number(tile.dataset.x);
      const y = Number(tile.dataset.y);
      const kind = tile.dataset.terrain;
      const seed = x * 7 + y * 13;
      ctx.save();
      ctx.translate(x * 100, y * 100);
      if (kind === 'reef') reef(ctx, high, seed);
      else if (kind !== 'sea') {
        island(ctx, seed);
        if (kind === 'dock') dock(ctx);
        if (kind === 'post') post(ctx);
        if (kind === 'beacon') beacon(ctx);
        if (kind === 'island') dryGround(ctx, seed);
      }
      if (tile.classList.contains('current')) {
        transform(ctx, kind === 'beacon' || kind === 'post' ? 32 : 51, 69, 1.10, actor => {
          dino(actor, board.dataset.carrying === 'true');
        });
      }
      ctx.restore();
    }
    board.dataset.painted = 'true';
  }

  window.GezeitenBild = { draw };
}());
