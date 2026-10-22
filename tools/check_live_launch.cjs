const { chromium } = require('/Users/czhang/.workbuddy/binaries/node/workspace/node_modules/playwright-core');
const CHROME = '/Users/czhang/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const BASE = 'https://dopa-drill-27679.app.workbuddy.host';
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.goto(BASE + '/?sharecode=LQBUVCP62H', { waitUntil: 'networkidle', timeout: 45000 });
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForTimeout(2000);

  // 模拟「加到主屏后从 start_url 启动」：不带 sharecode 直接访问根路径
  const res = await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('bare "/" status =', res && res.status(), 'title =', await p.title());
  const state = await p.evaluate(async () => ({
    bg: getComputedStyle(document.body).backgroundColor,
    fonts: [...document.fonts].filter((f) => f.status === 'loaded').length,
    hasLogo: !!document.querySelector('#logo'),
    controlled: !!navigator.serviceWorker.controller,
  }));
  console.log('bare state:', JSON.stringify(state));

  // 再模拟完全断网 + 带 sharecode 打开（离线可玩）
  await c.setOffline(true);
  const r2 = await p.goto(BASE + '/?sharecode=LQBUVCP62H', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch((e) => 'ERR ' + e.message);
  await p.waitForTimeout(2000);
  console.log('offline status =', r2 && r2.status ? r2.status() : r2, '| title =', await p.title().catch(() => '?'));
  await p.screenshot({ path: '/tmp/shots/live-offline.png' });
  await b.close();
})();
