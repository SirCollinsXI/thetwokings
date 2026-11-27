'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const site = 'https://thetwokings.de';
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROME,headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    for (const [lang,name] of Object.entries({de:'Wilsons Deutsch-Lernecke',en:'Wilson’s German Learning Corner',zh:'Wilson 的德语学习角'})) {
      const response = await page.goto(site + '/?lang='+lang); assert(response.ok());
      const tile=page.locator('#lernen[data-category="learn"]');
      await tile.waitFor({state:'visible'});
      assert.equal((await page.locator('#wilson-card-name').textContent()).trim(),name);
      for(const loc of [page.locator('header nav [data-wilson-entry]').first(),tile,page.locator('footer [data-wilson-entry]').first()]) {
        assert(await loc.count());
        const href=new URL(await loc.getAttribute('href'),site);
        assert.equal(href.pathname,'/wilson'); assert.equal(href.searchParams.get('lang'),lang);
      }
      console.log('Live homepage: Wilson tile, menu and footer in ' + lang);
    }
    await page.goto(site+'/?lang=de#spiele');
    const aim=page.locator('#trial-aim'); await aim.waitFor();
    await aim.evaluate(input=>{input.value='-1';input.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.locator('#trial-shoot').click();
    await page.waitForFunction(()=>document.getElementById('bow-result').textContent.includes('Volltreffer'));
    await page.locator('[data-trial-net="3"]').click();
    await page.waitForFunction(()=>document.getElementById('dino-result').textContent.includes('Gefangen auf Feld 3'));
    const launch=await page.locator('.trial-launch').evaluateAll(anchors=>anchors.map(a=>new URL(a.href).pathname));
    assert(launch.some(h=>/wuestenbogen/.test(h))&&launch.some(h=>/piratenjagd/.test(h)));
    console.log('Live game trials: target hit and dinosaur caught; both full-game links present.');
    await page.goto(site+'/wilson?lang=de');
    const title=page.locator('h1[data-t="cornerTitle"]');await title.waitFor();
    assert((await title.innerText()).includes('Wilson'));
    assert.equal(await page.locator('.language-labels b').first().evaluate(el=>getComputedStyle(el).color),'rgb(246, 216, 136)');
    await page.goto(site+'/wilson-input?lang=de&word=v74');
    const picture=page.locator('.picture').first();await picture.waitFor();
    assert.equal(await picture.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(233, 240, 235)');
    assert(await page.locator('#solution').isHidden());
    const typed=page.locator('#typed');
    await typed.fill('Testwort');
    await typed.press('Enter');
    await page.locator('#status.warn').waitFor();
    assert((await page.locator('#status').textContent()).trim().length>0);
    await typed.fill('Testwort'); await typed.press('Enter');
    await page.locator('#solution').waitFor();
    assert.equal(await page.locator('#correct-answer').evaluate(el=>getComputedStyle(el).color),'rgb(246, 216, 136)');
    console.log('Live /wilson and /wilson-input: neutral picture, hidden solution, retry text, highlighted answer.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
