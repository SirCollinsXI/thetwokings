/* The simulation owns the clock, the switch and both nets. This scene only draws its snapshot. */
(function () {
  'use strict';

  const WIDTH = 960;
  const HEIGHT = 540;
  const FORK = { x: 480, y: 391 };
  const TRAPS = { left: { x: 196, y: 308 }, right: { x: 764, y: 308 } };
  const DARK = 0x302217;
  const ROPE = 0xe5b66e;
  const GOLD = 0xffcf66;
  const MINT = 0x8affda;

  function line(g, x1, y1, x2, y2, width, color, alpha) {
    g.lineStyle(width, color, alpha === undefined ? 1 : alpha);
    g.lineBetween(x1, y1, x2, y2);
  }

  function ring(g, x, y, width, height, stroke, color, alpha) {
    g.lineStyle(stroke, color, alpha === undefined ? 1 : alpha);
    g.strokeEllipse(x, y, width, height);
  }

  function curve(from, control, to, t) {
    const s = 1 - t;
    return { x: s*s*from.x + 2*s*t*control.x + t*t*to.x,
      y: s*s*from.y + 2*s*t*control.y + t*t*to.y };
  }

  function startPoint(side) {
    return { x: side === 'left' ? 278 : 682, y: 505 };
  }

  function approach(side, t) {
    return curve(startPoint(side), { x: side === 'left' ? 450 : 510, y: 478 }, FORK, t);
  }

  function branch(side, t) {
    return curve(FORK, { x: side === 'left' ? 418 : 542, y: 338 }, TRAPS[side], t);
  }

  function positionOf(state) {
    const p = state.progress;
    const side = state.lane || state.gate;
    if (p <= state.fork) return approach(state.approachingFrom, p / state.fork);
    if (p <= state.catchAt) return branch(side, (p-state.fork)/(state.catchAt-state.fork));
    const exit = { x: side === 'left' ? 50 : WIDTH-50, y: 277 };
    return curve(TRAPS[side], { x: side === 'left' ? 96 : WIDTH-96, y: 291 }, exit,
      Math.min(1, (p-state.catchAt)/(1-state.catchAt)));
  }

  function addDeck(scene) {
    // Keep the original horizon and rail. Give the short strip of walkable planks
    // enough depth for a fork, two traps and a foreground entrance on a phone.
    const texture = scene.textures.get('deck');
    const source = texture.getSourceImage();
    const a = Math.round(source.height * 0.738);
    const b = Math.round(source.height * 0.863);
    const strips = [
      ['horizon', 0, a, 0, 236],
      ['boards', a, b-a, 236, 275],
      ['edge', b, source.height-b, 511, 29]
    ];
    for (const [key, top, height, y, displayHeight] of strips) {
      texture.add(key, 0, 0, top, source.width, height);
      scene.add.image(0, y, 'deck', key).setOrigin(0).setDisplaySize(WIDTH, displayHeight);
    }
    scene.add.rectangle(WIDTH/2, 374, WIDTH, 274, 0x281808, 0.16);
  }

  function paintPath(g, pointAt, selected) {
    const count = 14;
    const points = Array.from({ length: count+1 }, (_, i) => pointAt(i/count));
    for (const [width, color, alpha] of [[12, DARK, 0.78], [6, selected ? GOLD : 0xe1ceb0, selected ? 1 : 0.66]]) {
      g.lineStyle(width, color, alpha);
      g.beginPath();
      g.moveTo(points[0].x, points[0].y);
      for (const p of points.slice(1)) g.lineTo(p.x, p.y);
      g.strokePath();
    }
    for (const f of [0.28, 0.62]) {
      const a = pointAt(f), b = pointAt(f+0.02);
      const angle = Math.atan2(b.y-a.y, b.x-a.x);
      const dx = Math.cos(angle), dy = Math.sin(angle);
      const color = selected ? GOLD : 0xe1ceb0;
      for (const [width, ink] of [[9, DARK], [5, color]]) {
        line(g, a.x-8*dx+8*dy, a.y-8*dy-8*dx, a.x+5*dx, a.y+5*dy, width, ink);
        line(g, a.x-8*dx-8*dy, a.y-8*dy+8*dx, a.x+5*dx, a.y+5*dy, width, ink);
      }
    }
  }

  function paintSwitch(g, side) {
    // The hinged boom crosses the CLOSED track. The brass pointer faces the open one.
    const direction = side === 'left' ? -1 : 1;
    const x = FORK.x, y = FORK.y;
    const endX = x - direction*67, endY = y-55;
    g.fillStyle(DARK, 0.74).fillEllipse(x, y+6, 84, 35);
    g.fillStyle(0x453321).fillEllipse(x, y, 72, 32);
    ring(g, x, y, 72, 32, 5, ROPE);
    line(g, x, y-4, endX, endY, 20, DARK);
    line(g, x, y-5, endX, endY, 12, 0xb66c38);
    for (const t of [0.38, 0.68, 0.96]) {
      const bx = x+(endX-x)*t, by = y+(endY-y)*t;
      line(g, bx-4, by+4*direction, bx+4, by-4*direction, 5, 0xffe2a2);
    }
    g.fillStyle(GOLD).fillTriangle(x+direction*29, y-11, x+direction*5, y-17, x+direction*9, y);
    g.fillStyle(DARK).fillCircle(x, y-5, 10);
    g.fillStyle(ROPE).fillCircle(x, y-6, 6);
  }

  function paintTarget(g, side, cue) {
    const p = TRAPS[side];
    g.fillStyle(DARK, 0.40).fillEllipse(p.x, p.y+4, 154, 50);
    ring(g, p.x, p.y, 145, 46, 8, DARK);
    ring(g, p.x, p.y, 145, 46, cue ? 6 : 4, cue ? MINT : ROPE);
    if (!cue) return;
    for (const sign of [-1, 1]) {
      const x = p.x + sign*93;
      line(g, x+sign*9, p.y-10, x, p.y, 6, MINT);
      line(g, x+sign*9, p.y+10, x, p.y, 6, MINT);
    }
  }

  function paintNet(g, side, drop, cue) {
    const x = TRAPS[side].x;
    const bottom = 181 + 130*drop;
    const height = 38 + 36*drop;
    const top = bottom-height, halfTop = 45, halfBottom = 71;
    // Double-stroked cables keep the shape readable against both sky and timber.
    for (const sign of [-1, 1]) {
      for (const [width, ink] of [[7, DARK], [3, ROPE]]) {
        line(g, x+sign*91, -2, x+sign*halfTop, top, width, ink);
      }
    }
    g.fillStyle(0x23473e, 0.43);
    g.fillTriangle(x-halfTop, top, x+halfTop, top, x+halfBottom, bottom);
    g.fillTriangle(x-halfTop, top, x+halfBottom, bottom, x-halfBottom, bottom);
    const cols = 7, rows = 3;
    function point(c, r) {
      const t = r/rows, half = halfTop+(halfBottom-halfTop)*t;
      return { x: x+(2*c/cols-1)*half, y: top+t*height };
    }
    for (const [thick, ink] of [[5, DARK], [2.5, cue ? MINT : ROPE]]) {
      for (let row=0; row<rows; row++) {
        for (let col=0; col<=cols; col++) {
          const a=point(col,row);
          for (const next of [col-1,col+1]) {
            if (next<0 || next>cols) continue;
            const b=point(next,row+1);
            line(g, a.x,a.y,b.x,b.y,thick,ink);
          }
        }
      }
      line(g, x-halfTop,top,x-halfBottom,bottom,thick+2,ink);
      line(g, x+halfTop,top,x+halfBottom,bottom,thick+2,ink);
      line(g, x-halfTop,top,x+halfTop,top,thick+2,ink);
    }
    ring(g, x, bottom, halfBottom*2, 17, 7, DARK);
    ring(g, x, bottom, halfBottom*2, 17, 3.5, cue ? MINT : ROPE);
  }

  window.createDeckScene = function createDeckScene(host, hooks) {
    let game;
    let failed = false;
    let disposed = false;
    let canvas = null;
    let paintedRoute = '';
    let paintedCue, paintedNet, paintedDrop;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

    function destroy() {
      if (disposed) return;
      disposed = true;
      if (canvas) canvas.removeEventListener('webglcontextlost', contextLost);
      if (game) game.destroy(true);
    }

    function fail(reason) {
      if (failed || disposed) return;
      failed = true;
      try { hooks.fail(reason); }
      finally { setTimeout(destroy, 0); }
    }

    function contextLost(event) {
      event.preventDefault();
      fail(new Error('Die Grafikverbindung wurde unterbrochen.'));
    }

    function preload() {
      this.load.on('loaderror', file => fail(new Error('Spielgrafik fehlt: ' + file.key)));
      this.load.image('deck', 'game-assets/deck-frei/deck.webp');
      this.load.spritesheet('dino', 'game-assets/deck-frei/rex.webp', { frameWidth: 384, frameHeight: 256 });
    }

    function create() {
      if (failed || disposed) return;
      try {
        addDeck(this);
        this.paths = this.add.graphics();
        this.targets = this.add.graphics();
        this.shadow = this.add.ellipse(0, 0, 124, 24, DARK, 0.55);
        this.dino = this.add.sprite(0, 0, 'dino', 0).setOrigin(0.5, 0.89);
        this.nets = this.add.graphics();
        for (const side of ['left', 'right']) {
          const netX = TRAPS[side].x;
          const labelX = netX + (side === 'left' ? -81 : 81);
          this.add.circle(labelX, 166, 21, DARK, 0.96).setStrokeStyle(3, ROPE);
          this.add.text(labelX, 166, side === 'left' ? 'L' : 'R',
            { fontFamily: 'Georgia, serif', fontSize: '27px', fontStyle: 'bold', color: '#ffe4a4' }).setOrigin(0.5);
        }
        canvas = this.game.canvas;
        canvas.setAttribute('aria-hidden', 'true');
        canvas.addEventListener('webglcontextlost', contextLost);
        hooks.ready();
      } catch (error) { fail(error); }
    }

    function update(time, delta) {
      if (failed || disposed || !this.dino) return;
      try {
        const state = hooks.tick(delta);
        if (!state || disposed) return;
        const lane = state.lane || state.gate;
        const route = state.approachingFrom + '/' + lane;
        if (route !== paintedRoute) {
          this.paths.clear();
          paintPath(this.paths, t => approach(state.approachingFrom, t), true);
          for (const side of ['left', 'right']) paintPath(this.paths, t => branch(side, t), side === lane);
          paintSwitch(this.paths, lane);
          paintedRoute = route;
        }
        const cueLane = state.phase === 'run' && state.inWindow && !state.armed ? lane : null;
        const fallingLane = state.armed ? state.armed.lane : null;
        const fallProgress = state.armed ? state.armed.progress : 0;
        if (cueLane !== paintedCue || fallingLane !== paintedNet || fallProgress !== paintedDrop) {
          this.nets.clear();
          this.targets.clear();
          for (const side of ['left', 'right']) {
            paintTarget(this.targets, side, side === cueLane);
            paintNet(this.nets, side, side === fallingLane ? fallProgress : 0, side === cueLane);
          }
          paintedCue = cueLane;
          paintedNet = fallingLane;
          paintedDrop = fallProgress;
        }
        const resting = state.phase === 'won';
        const pos = resting ? TRAPS[lane] : positionOf(state);
        const direction = state.progress < state.fork ? state.approachingFrom === 'right' : lane === 'left';
        const active = state.phase === 'run' && !(reduced && reduced.matches);
        const frame = active ? Math.floor(state.progress*66)%4 : 0;
        const size = 218 - (505-pos.y)*0.25;
        this.shadow.setPosition(pos.x, pos.y+2).setDisplaySize(size*0.68, size*0.1);
        this.dino.setFrame(frame).setFlipX(direction).setPosition(pos.x, pos.y+(resting ? 3 : 0))
          .setDisplaySize(size, size*(resting ? 0.53 : 2/3));
      } catch (error) { fail(error); }
    }

    try {
      if (!window.Phaser) throw new Error('Phaser konnte nicht geladen werden.');
      game = new window.Phaser.Game({
        type: window.Phaser.AUTO, parent: host, width: WIDTH, height: HEIGHT,
        backgroundColor: '#33251a', audio: { noAudio: true },
        scale: { mode: window.Phaser.Scale.FIT, autoCenter: window.Phaser.Scale.CENTER_BOTH },
        scene: { preload, create, update }
      });
    } catch (error) { fail(error); }
    return { destroy };
  };
})();
