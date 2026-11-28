'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

// The native menu is drawn into WebGL. Read the checkpoint written by the
// normal campaign start/pause actions for evidence that touch reached the game.
async function readSlot() {
  const request = req => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  for (const entry of await indexedDB.databases()) {
    if (entry.name !== '/userfs') continue;
    const db = await request(indexedDB.open(entry.name));
    try {
      for (const name of db.objectStoreNames) {
        const store = () => db.transaction(name).objectStore(name);
        const key = (await request(store().getAllKeys())).find(k => String(k).endsWith('/dino-expedition.save'));
        if (key) return Array.from(new Uint8Array((await request(store().get(key))).contents));
      }
    } finally { db.close(); }
  }
  return null;
}

function checkpoint(data) {
  if (!data) return null;
  const bytes = Buffer.from(data);
  // Godot Variant dictionaries store UTF-8 keys before four-byte-aligned values.
  function valueOffset(name, type) {
    const key = bytes.indexOf(name, 32);
    assert.ok(key >= 0, 'checkpoint field ' + name);
    const tag = (key + name.length + 3) & ~3;
    assert.equal(bytes[tag], type, 'checkpoint field type ' + name);
    return tag + 4;
  }
  const pos = valueOffset('resume', 9);
  const yaw = valueOffset('yaw', 3);
  return { x: bytes.readFloatLE(pos), z: bytes.readFloatLE(pos + 8), yaw: (bytes.readUInt32LE(yaw - 4) & 65536) ? bytes.readDoubleLE(yaw) : bytes.readFloatLE(yaw) };
}

async function waitForSlot(page, passes) {
  const deadline = Date.now() + 25000;
  let value = null;
  do {
    value = checkpoint(await page.evaluate(readSlot));
    if (value && passes(value)) return value;
    await delay(400);
  } while (Date.now() < deadline);
  throw new Error('Touch action did not persist the expected campaign checkpoint: ' + JSON.stringify(value));
}

async function run(browser, origin) {
  const context = await browser.newContext({
    viewport: {width: 844, height: 390}, screen: {width: 844, height: 390},
    isMobile: true, hasTouch: true, deviceScaleFactor: 1,
    locale: 'de-DE', userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36'
  });
  const artifacts = process.env.HOMEPAGE_SCREENSHOTS;
  if (artifacts) await fs.mkdir(artifacts, {recursive: true});
  let page;
  let session;
  const gameUrl = new URL('/das-wehr/?lang=de', origin).href;

  async function boot() {
    page = await context.newPage();
    await page.bringToFront();
    session = await context.newCDPSession(page);
    page.on('pageerror', error => console.error('Dino-Insel:', error.message));
    const messages = new Set();
    page.on('console', message => {
      const line = message.text().slice(0, 350);
      if ((['warning','error'].includes(message.type()) || /Godot Engine|OpenGL|WebGL/.test(line)) && !messages.has(line) && messages.size < 30) {
        messages.add(line);
        console.log('Dino-Insel browser:', line);
      }
    });
    const response = await page.goto(gameUrl, {waitUntil: 'domcontentloaded'});
    assert.equal(response.status(), 200);
    assert.equal(await page.locator('html').getAttribute('lang'), 'de');
    await page.locator('#play').tap();
    await page.waitForSelector('#launch[hidden]', {state: 'attached', timeout: 120000});
    console.log('Dino-Insel: engine started', await page.evaluate(() => {
      const canvas = document.getElementById('canvas');
      const rect = canvas.getBoundingClientRect();
      window.dinoTestTouches = [];
      for (const type of ['touchstart','touchmove','touchend','touchcancel']) {
        document.addEventListener(type, event => {
          const changed = Array.from(event.changedTouches, point => [point.identifier,Math.round(point.clientX),Math.round(point.clientY)]);
          window.dinoTestTouches.push([type,event.target.id,changed]);
          if (window.dinoTestTouches.length > 24) window.dinoTestTouches.shift();
        }, {capture:true,passive:true});
      }
      window.dinoTestMouse = [];
      canvas.addEventListener('mousemove', event => {
        window.dinoTestMouse.push([event.movementX,event.movementY,event.sourceCapabilities?.firesTouchEvents]);
        if (window.dinoTestMouse.length > 12) window.dinoTestMouse.shift();
      }, {capture:true,passive:true});
      return {view: [innerWidth, innerHeight], canvas: [canvas.width, canvas.height], css: [rect.x, rect.y, rect.width, rect.height], focused:document.hasFocus(), active:document.activeElement.id, visibility:document.visibilityState};
    }));
    return page;
  }
  async function screenshot(name) {
    const {data} = await session.send('Page.captureScreenshot', {format: 'png', fromSurface: true, captureBeyondViewport: false});
    const bytes = Buffer.from(data, 'base64');
    if (artifacts) await fs.writeFile(path.join(artifacts, name + '.png'), bytes);
    return bytes;
  }

  // The first save precedes both the physics tick that closes the menu and
  // the render tick that lays out the joystick. Read its coloured thumb from
  // a composited frame before touching it. SwiftShader can take seconds/frame.
  async function waitForThumb(y, name) {
    const until = Date.now() + 60000;
    let colors;
    do {
      const png = (await screenshot(name)).toString('base64');
      colors = await page.evaluate(async ({png,y}) => {
        const bytes = Uint8Array.from(atob(png), c => c.charCodeAt(0));
        const bitmap = await createImageBitmap(new Blob([bytes], {type:'image/png'}));
        const ctx = new OffscreenCanvas(bitmap.width, bitmap.height).getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        return [65,72,79].map(x => Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0,3));
      }, {png,y});
      // The translucent #a7d5cc thumb sits over the dark pad.
      if (colors.every(([r,g,b]) => r >= 135 && r <= 184 && g >= 175 && g <= 220 && b >= 165 && b <= 218 && g-r >= 27 && g > b)) {
        console.log('Dino-Insel: visible stick thumb', {y, colors});
        return;
      }
      await delay(300);
    } while (Date.now() < until);
    throw Error('Touch stick missing at y=' + y + ': ' + JSON.stringify(colors));
  }
  async function frames(count) {
    await page.evaluate(n => new Promise(resolve => {
      function tick() { if (--n <= 0) resolve(); else requestAnimationFrame(tick); }
      requestAnimationFrame(tick);
    }), count);
  }

  function verifySwipe(from, to, cssPixels) {
    // The 1440×900 design canvas expands to this landscape viewport. The
    // walker rotates 0.0022 radians per design unit. Yaw wraps at +/- pi.
    const viewport = page.viewportSize();
    const designUnits = Math.max(1440 / viewport.width, 900 / viewport.height);
    const expected = -cssPixels * designUnits * .0022;
    const actual = Math.atan2(Math.sin(to-from), Math.cos(to-from));
    console.log('Dino-Insel: swipe angle in radians', {cssPixels, expected, actual});
    assert.ok(Math.abs(expected-actual) < .015, 'camera turns only by right finger travel, with correct direction');
  }

  // Locate the solid panels of the native menu in the actual screenshot. Their
  // height varies with font metrics, while the fixed design colour is shared
  // by Start and Load. Headers, settings and background have different colours.
  async function menuRows() {
    const until = Date.now() + 60000;
    let sample;
    do {
      const pixels = (await screenshot('dino-handymenue')).toString('base64');
      sample = await page.evaluate(async png => {
        const bytes = Uint8Array.from(atob(png), character => character.charCodeAt(0));
        const img = await createImageBitmap(new Blob([bytes], {type: 'image/png'}));
        const ctx = new OffscreenCanvas(img.width, img.height).getContext('2d');
        ctx.drawImage(img, 0, 0);
        const {data} = ctx.getImageData(Math.round(img.width * .31), 0, 1, img.height);
        const centers = [];
        let first = -1;
        for (let y = 0; y < img.height; y++) {
          const i = y * 4;
          const matches = Math.abs(data[i] - 32) < 7 && Math.abs(data[i+1] - 66) < 7 && Math.abs(data[i+2] - 76) < 7;
          if (matches && first < 0) first = y;
          if (!matches && first >= 0) {
            if (y-first > 26 && y-first < 66) centers.push(Math.round((y+first)/2));
            first = -1;
          }
        }
        const colors = [.25,.35,.4,.5,.65,.8].map(f => Array.from(data.slice(Math.floor(img.height*f)*4,Math.floor(img.height*f)*4+3)).join(','));
        return {centers, width: img.width, height: img.height, colors};
      }, pixels);
      if (sample.centers.length >= 2) {
        console.log('Dino-Insel: native menu rows', sample.centers);
        return sample.centers;
      }
      await delay(500);
    } while (Date.now() < until);
    throw Error('Native menu panels not found: ' + JSON.stringify(sample));
  }

  try {
    await boot();
    const rows = await menuRows();
    assert.equal(await page.evaluate(readSlot), null);
    await page.touchscreen.tap(422, rows[0]);
    const before = await waitForSlot(page, () => true);
    console.log('Dino-Insel: campaign start saved', before);
    await waitForThumb(318, 'dino-handy-spiel');
    const finger = (id,x,y) => ({id,x,y,radiusX:5,radiusY:5,force:.8});
    const dispatch = (type, points) => session.send('Input.dispatchTouchEvent', {type,touchPoints:points});
    await dispatch('touchStart', [finger(0,72,318)]);
    await frames(1);
    await dispatch('touchStart', [finger(0,72,318), finger(1,495,152)]);
    await frames(2);
    // Moving one finger while the other stays still changes the order and
    // length of DOM changedTouches; the game's camera must keep the same owner.
    for (let i=1; i<=4; i++) {
      await dispatch('touchMove', [finger(0,72,318-i*13), finger(1,495+(i-1)*22,152+(i-1)*2)]);
      await frames(1);
      await dispatch('touchMove', [finger(0,72,318-i*13), finger(1,495+i*22,152+i*2)]);
      await frames(1);
    }
    await waitForThumb(285, 'dino-handy-laufen');
    await dispatch('touchEnd', []);
    await frames(2);
    await page.touchscreen.tap(808,35);
    await menuRows();
    const moved = await waitForSlot(page, slot => Math.hypot(slot.x-before.x, slot.z-before.z) > .12 && Math.abs(slot.yaw-before.yaw) > .02);
    console.log('Dino-Insel: multi-touch motion saved', moved);
    console.log('Dino-Insel: native touch changes', await page.evaluate(() => JSON.stringify(window.dinoTestTouches)));
    verifySwipe(before.yaw, moved.yaw, 88);
    await page.close();
    await boot();
    const loadRows = await menuRows();
    assert.ok(loadRows.length >= 3, 'saved campaign must offer Load');
    const reopened = await waitForSlot(page, () => true);
    assert.deepEqual(reopened, moved, 'saved position and look persist across tabs');
    await page.touchscreen.tap(422, loadRows[1]);
    await waitForThumb(318, 'dino-handy-geladen');
    await dispatch('touchStart',[finger(0,520,150)]);
    await frames(2);
    await dispatch('touchMove',[finger(0,602,150)]);
    await frames(2);
    await dispatch('touchEnd',[]);
    await frames(2);
    await page.touchscreen.tap(808, 35);
    await menuRows();
    const after = await waitForSlot(page, slot => Math.abs(slot.yaw-moved.yaw) > .02);
    verifySwipe(moved.yaw, after.yaw, 82);
    assert.ok(Math.hypot(after.x-moved.x, after.z-moved.z) < .1, 'restored character looks around from the saved location');
    console.log('Dino-Insel: mobile Godot menu rendered, campaign started by touch, simultaneous walk/look and persisted checkpoint verified.');
  } catch (error) {
    if (page && !page.isClosed()) console.error('Dino-Insel input diagnostics', await page.evaluate(() => JSON.stringify({focused:document.hasFocus(), active:document.activeElement?.id, visibility:document.visibilityState, touches:window.dinoTestTouches, mouse:window.dinoTestMouse})).catch(() => null));
    if (artifacts && session && page && !page.isClosed()) await screenshot('dino-handy-fehler').catch(() => {});
    throw error;
  } finally { await context.close(); }
}

module.exports = run;
if (require.main === module) (async () => {
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({executablePath: process.env.CHROME, args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try { await run(browser, process.env.PREVIEW_URL || 'https://thetwokings.de'); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
