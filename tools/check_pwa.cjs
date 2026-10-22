const { chromium } = require('/Users/czhang/.workbuddy/binaries/node/workspace/node_modules/playwright-core');
const CHROME = '/Users/czhang/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('EXC ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('ERR ' + m.text()); });
  await p.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  const info = await p.evaluate(async () => {
    const r = await navigator.serviceWorker.ready;
    await new Promise((res) => setTimeout(res, 2000));
    const names = await caches.keys();
    let n = 0;
    for (const name of names) n += (await (await caches.open(name)).keys()).length;
    return { scope: r.scope, active: !!r.active, state: r.active && r.active.state, names, n };
  });
  console.log('SW:', JSON.stringify(info));

  await c.setOffline(true);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  const off = await p.evaluate(() => ({
    title: document.title,
    loadedFonts: [...document.fonts].filter((f) => f.status === 'loaded').length,
    hasLogo: !!document.querySelector('#logo'),
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  console.log('OFFLINE:', JSON.stringify(off));
  await p.screenshot({ path: '/tmp/shots/offline-title.png' });
  await c.setOffline(false);
  console.log('ERRORS:', errs.length ? errs.slice(0, 5) : 'none');
  await b.close();
})();
