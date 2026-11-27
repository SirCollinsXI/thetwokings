'use strict';
const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright-core');

const base = process.env.DECK_TEST_BASE || 'http://127.0.0.1:8765';
const output = process.env.DECK_SCREENSHOTS || 'deck-screenshots';
async function run(){
  const browser = await chromium.launch({ executablePath:process.env.CHROME, headless:true,
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:1 });
    const errors=[];
    page.on('pageerror', error => errors.push(error.message));
    const images=new Set();
    page.on('response', response=>{
      const u=new URL(response.url());
      if(u.pathname.includes('/game-assets/deck-frei/') && response.ok()) images.add(path.basename(u.pathname));
    });
    await mkdir(output,{recursive:true});
    const url = new URL('/deck-frei.html?lang=de',base).href;
    await page.goto(url);
    const cue = key=>page.waitForFunction(v=>document.getElementById('message').dataset.cue===v,key,{timeout:18000});
    const button = id=>page.locator('#'+id);
    await cue('ready'); assert(await button('go').isEnabled());
    assert.equal(await page.locator('#deck-view canvas').count(),1);
    assert.deepEqual([...images].sort(),['deck.webp','rex.webp']);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
    await page.screenshot({path:path.join(output,'deck-start.png')});

    await button('go').tap(); await page.locator('[data-gate=left]').tap(); await cue('openLeft');
    await button('pause').tap(); await cue('paused');
    await page.waitForTimeout(600);
    assert(await page.locator('[data-gate=right]').isDisabled());
    await page.keyboard.press('p'); await cue('openLeft');
    await cue('lockedLeft');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[data-gate=left]').getAttribute('aria-pressed'),'true');
    await page.keyboard.press('2');
    await cue('wrong');
    await cue('openLeft');
    await page.keyboard.press('ArrowRight'); await cue('openRight');
    await cue('nowRight');
    await page.locator('[data-net=right]').tap();
    await cue('catch');
    await page.screenshot({path:path.join(output,'deck-fang.png')});

    await button('go').tap(); await cue('openLeft');
    await page.keyboard.press('p'); await cue('paused');
    await page.locator('[data-language=en]').tap();
    assert.equal(await button('pause').textContent(),'Resume');
    assert.equal(new URL(await button('back').getAttribute('href'),base).searchParams.get('lang'),'en');
    await page.locator('[data-language=zh]').tap();
    assert.equal(await button('pause').textContent(),'继续');
    assert.equal(await page.evaluate(()=>document.documentElement.lang),'zh-CN');
    assert.deepEqual(errors,[]);
    const oldGame=await page.request.get(new URL('/piratenjagd.html',base).href);
    assert(oldGame.ok()); assert((await oldGame.text()).includes('href="deck-frei.html"'));
    console.log('Deck frei passed: 390px touch, two mobile WebPs, lane lock, pause, failed net, retry, catch, mirrored replay, keyboard, DE/EN/zh, existing pirate-game entry.');
  } finally { await browser.close(); }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
