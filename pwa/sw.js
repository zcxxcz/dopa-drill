/* 多巴口算 —— Service Worker
 * 目标：加到手机主屏后可离线玩；在线时总是优先取最新页面。
 *
 * ⚠️ 改动 app/ 里的 js 或 css 后要发布新版本时，把下面的 VERSION 递增一位，
 *    否则老用户会一直读到缓存里的旧脚本（HTML 是 network-first，不会过期）。
 */
const VERSION = 'v1';
const CACHE = `dopa-zh-${VERSION}`;

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'style.css',
  'icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon-180.png',
  'js/audio.js',
  'js/bg.js',
  'js/core.js',
  'js/dopakichi.js',
  'js/fx.js',
  'js/growth.js',
  'js/guide.js',
  'js/main.js',
  'js/problems.js',
  'js/quests.js',
  'js/scoring.js',
  'js/session.js',
  'js/skills.js',
  'js/store.js',
  'js/trophies.js',
  'js/unlocks.js',
  'fonts/dela-gothic-one.woff2',
  'fonts/noto-sans-sc-700.woff2',
  'fonts/noto-sans-sc-900.woff2',
  'fonts/zen-maru-gothic-black.woff2',
  'fonts/zen-maru-gothic-bold.woff2',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // 单个资源 404 不该让整次安装失败，逐个加
      await Promise.all(
        PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => {})),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 页面导航：先走网络拿最新 HTML，断网再回缓存
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = (await caches.match(req)) || (await caches.match('index.html'));
          return cached || new Response('离线且没有缓存', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
        }
      })(),
    );
    return;
  }

  // 静态资源：缓存优先，缺失时补网络并写入缓存
  e.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        if (fresh.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        return new Response('', { status: 504 });
      }
    })(),
  );
});
