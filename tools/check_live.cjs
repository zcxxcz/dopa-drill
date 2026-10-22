const { chromium } = require('/Users/czhang/.workbuddy/binaries/node/workspace/node_modules/playwright-core');
const CHROME = '/Users/czhang/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const URL = process.argv[2] || 'https://zcxxcz.github.io/dopa-drill/';
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  const bad = [];
  p.on('pageerror', (e) => bad.push('EXC ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') bad.push('ERR ' + m.text().slice(0, 120)); });
  p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url().replace(URL.split('?')[0], '')}`); });
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2500);
  const info = await p.evaluate(async () => {
    const r = await navigator.serviceWorker.ready.catch(() => null);
    const names = await caches.keys();
    let n = 0;
    for (const name of names) n += (await (await caches.open(name)).keys()).length;
    return {
      title: document.title,
      bg: getComputedStyle(document.body).backgroundColor,
      fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').length,
      sw: r ? r.active && r.active.state : 'none',
      cacheNames: names,
      cacheEntries: n,
      cookies: document.cookie,
    };
  });
  console.log(JSON.stringify(info, null, 1));
  console.log('BAD:', bad.length ? bad.slice(0, 8) : 'none');
  await p.screenshot({ path: '/tmp/shots/live-title.png' });
  await b.close();
})();
