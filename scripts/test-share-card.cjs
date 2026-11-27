const assert = require('node:assert/strict');

module.exports = async function testShareCard(browser, preview) {
  const senderContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const readerContext = await browser.newContext();
  try {
    const url = new URL('/homepage-preview', preview);
    url.searchParams.set('lang', 'zh');
    url.searchParams.set('test-extra', 'omit-from-link');
    let writes = 0;
    for (const context of [senderContext, readerContext]) {
      await context.route('**/api/spuren', route => {
        if (route.request().method() !== 'GET') writes++;
        return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' });
      });
    }
    const sender = await senderContext.newPage();
    await sender.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async () => { throw new Error('Clipboard disabled by user'); }
      } });
    });
    await sender.goto(url.href, { waitUntil: 'domcontentloaded' });
    await sender.locator('#grusskarte summary').focus();
    await sender.keyboard.press('Enter');
    await sender.locator('#card-mark').selectOption('star');
    await sender.locator('#card-create').focus();
    await sender.keyboard.press('Enter');
    await sender.locator('#card-view').waitFor();
    const result = new URL(await sender.locator('#card-link').inputValue());
    assert.equal(result.origin, preview.origin);
    assert.equal(result.pathname, '/homepage-preview');
    assert.equal(result.search, '?lang=zh', 'Share URLs omit extraneous query parameters');
    assert.match(result.hash, /^#gruss-\d{4}-\d{2}-\d{2}-star$/);
    assert.equal(await sender.locator('#card-icon').textContent(), '★');
    await sender.locator('#card-copy').click();
    await sender.getByText('链接已选中，你可以复制并分享给想问候的人。', { exact: true }).waitFor();
    assert(await sender.locator('#card-link').evaluate(el => el.selectionStart === 0 && el.selectionEnd === el.value.length));

    const reader = await readerContext.newPage();
    await reader.goto(result.href, { waitUntil: 'domcontentloaded' });
    await reader.locator('#card-view').waitFor();
    assert.equal(await reader.locator('#card-icon').textContent(), '★');
    assert.equal(await reader.locator('#card-view').evaluate(el => el === document.activeElement), true);
    assert.match(await reader.locator('#card-description').innerText(), /^星星/);
    await reader.locator('button[data-lang="en"]').click();
    await reader.waitForFunction(() => document.querySelector('#card-description').textContent.startsWith('Star'));
    assert.equal(new URL(await reader.locator('#card-link').inputValue()).search, '?lang=en');
    await reader.evaluate(() => { location.hash = 'gruss-2024-02-30-wave'; });
    await reader.getByText('This greeting link is invalid. You can create a new card here.', { exact: true }).waitFor();
    assert(await reader.locator('#card-view').isHidden());
    await reader.goBack();
    await reader.locator('#card-view').waitFor();
    assert.equal(await reader.locator('#card-icon').textContent(), '★');
    for (const hash of ['gruss-9999-12-31-wave', 'gruss-2023-02-28-unrecognised']) {
      await reader.evaluate(hash => { location.hash = hash; }, hash);
      await reader.locator('#card-view').waitFor({ state: 'hidden' });
    }
    await reader.evaluate(() => { location.hash = 'gruss-2024-02-29-crown'; });
    await reader.locator('#card-view').waitFor();
    assert.match(await reader.locator('#card-description').innerText(), /2024/);
    assert.equal(await reader.locator('#card-icon').textContent(), '♛');
    await reader.evaluate(() => { location.hash = 'spiele'; });
    await reader.locator('#card-view').waitFor({ state: 'hidden' });
    assert.equal(writes, 0, 'Creating and opening greeting cards must never post to the shared wall');
    console.log('Shareable card passed in two isolated browser contexts, including 503 wall, keyboard, language, copy fallback and fragment validation.');
  } finally {
    await Promise.all([senderContext.close(), readerContext.close()]);
  }
};
