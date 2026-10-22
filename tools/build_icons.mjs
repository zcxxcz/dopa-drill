// 由 pwa/icon-template.svg 生成 PWA 图标 PNG
// 用法：NODE_PATH=<...> node tools/build_icons.mjs
// 需要 playwright-core + Chromium（本机路径见 CHROME）
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire('/Users/czhang/.workbuddy/binaries/node/workspace/node_modules/');
const { chromium } = require('playwright-core');
const CHROME = '/Users/czhang/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'pwa', 'icons');
const tpl = readFileSync(path.join(ROOT, 'pwa', 'icon-template.svg'), 'utf8');

// radius: 圆角半径；scale: 吉祥物缩放（1.0 基准）；bleed: 不透明铺满（iOS 自己圆角，不能透明）
const CONFIGS = [
  { file: 'icon-192', size: 192, radius: 44, scale: 2.02, bleed: false },
  { file: 'icon-512', size: 512, radius: 116, scale: 2.02, bleed: false },
  { file: 'icon-maskable-512', size: 512, radius: 0, scale: 1.58, bleed: true }, // 安卓会按圆形裁 80% 安全区
  { file: 'apple-touch-icon-180', size: 180, radius: 0, scale: 2.02, bleed: true },
];

const browser = await chromium.launch({ executablePath: CHROME });
for (const { file, size, radius, scale, bleed } of CONFIGS) {
  const svg = tpl
    .replace('__RADIUS__', String(radius))
    .replace('__SCALE__', String(scale))
    .replace('width="512" height="512"', `width="${size}" height="${size}"`);
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:${bleed ? '#2a4fd6' : 'transparent'}">${svg}</body></html>`);
  await page.screenshot({ path: path.join(OUT, `${file}.png`), omitBackground: !bleed });
  await page.close();
  console.log(`✓ ${file}.png  ${size}×${size}`);
}
await browser.close();
