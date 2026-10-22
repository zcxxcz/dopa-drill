const { chromium } = require('/Users/czhang/.workbuddy/binaries/node/workspace/node_modules/playwright-core');
const path = require('path');
const CHROME = '/Users/czhang/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = '/tmp/shots';
const URL = 'http://127.0.0.1:8765/';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });
  const clear = async () => {
    for (let i = 0; i < 4; i++) {
      const did = await page.evaluate(() => {
        if (!document.querySelector('#bonus')?.hidden) { document.querySelector('#bonus-ok')?.click(); return 'bonus'; }
        if (!document.querySelector('#trophy-got')?.hidden) { document.querySelector('#tg-ok')?.click(); return 'trophy'; }
        return null;
      });
      if (!did) break;
      await page.waitForTimeout(700);
    }
  };
  const shot = async (n) => { await clear(); await page.waitForTimeout(450); await page.screenshot({ path: path.join(OUT, n + '.png') }); console.log('shot', n); };

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelector('#guide-skip')?.click());
  await page.waitForTimeout(500);
  await clear();

  await shot('b1-title');

  await page.evaluate(() => document.querySelector('#open-guide').click());
  await page.waitForTimeout(500);
  for (let i = 1; i <= 5; i++) { await shot(`b2-guide-${i}`); await page.evaluate(() => document.querySelector('#guide-next')?.click()); await page.waitForTimeout(600); }
  await page.evaluate(() => document.querySelector('#guide-skip')?.click());
  await page.waitForTimeout(400);

  await page.evaluate(() => document.querySelector('#open-tree').click());
  await shot('b3-tree');
  await page.evaluate(() => { document.querySelector('.tree .tk, .tree button, .tree [data-id]')?.click(); });
  await page.waitForTimeout(700);
  await shot('b4-skillinfo');
  await page.evaluate(() => document.querySelector('#si-close')?.click());
  await page.evaluate(() => document.querySelector('#tree-back').click());

  await page.evaluate(() => document.querySelector('#open-trophy').click());
  await shot('b5-trophy');
  await page.evaluate(() => document.querySelector('#trophy-back').click());

  await page.evaluate(() => document.querySelector('#open-collect').click());
  await shot('b6-collect');
  await page.evaluate(() => document.querySelector('#collect-back').click());

  await page.evaluate(() => document.querySelector('#open-settings').click());
  await shot('b7-settings');
  await page.evaluate(() => document.querySelector('#close-settings').click());

  // 一局（我的水平）：先答错看提示
  await clear();
  await page.evaluate(() => document.querySelector('#start').click());
  await page.waitForTimeout(1500);
  await clear();
  await shot('b8-play');
  for (const k of ['1', '2']) { await page.click(`.pad button[data-key="${k}"]`); await page.waitForTimeout(700); }
  await shot('b9-play-feedback');
  await browser.close();
})();
