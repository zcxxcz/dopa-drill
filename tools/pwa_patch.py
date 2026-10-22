#!/usr/bin/env python3
"""把 PWA 能力注入 app/：manifest、service worker、图标、iOS 主屏 meta。

放在 i18n_apply.py 之后、build_fonts_zh.sh 之前执行：
字体子集是按 app/ 里的实际字符生成的，注入的文案要先落盘。
"""
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
PWA = ROOT / 'pwa'
APP = ROOT / 'app'

HEAD_ANCHOR = '  <link rel="icon" href="icon.svg" type="image/svg+xml">\n'
HEAD_EXTRA = (
    '  <link rel="manifest" href="manifest.webmanifest">\n'
    '  <link rel="apple-touch-icon" href="icons/apple-touch-icon-180.png">\n'
    '  <meta name="apple-mobile-web-app-capable" content="yes">\n'
    '  <meta name="mobile-web-app-capable" content="yes">\n'
    '  <meta name="apple-mobile-web-app-title" content="多巴口算">\n'
    '  <meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
)

SW_SNIPPET = """  <script>
    // 注册 Service Worker：加到主屏后可离线玩（file:// 下会被跳过）
    if ('serviceWorker' in navigator) {
      addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  </script>
</body>
"""


def main() -> None:
    # 1. 静态资源
    for name in ('manifest.webmanifest', 'sw.js'):
        shutil.copy2(PWA / name, APP / name)

    dst_icons = APP / 'icons'
    if dst_icons.exists():
        shutil.rmtree(dst_icons)
    shutil.copytree(PWA / 'icons', dst_icons)

    # 2. index.html 注入
    index = APP / 'index.html'
    html = index.read_text(encoding='utf-8')
    changed = []

    if 'rel="manifest"' not in html:
        if HEAD_ANCHOR not in html:
            raise SystemExit('!! index.html 里找不到 <link rel="icon"> 锚点，PWA 注入中止')
        html = html.replace(HEAD_ANCHOR, HEAD_ANCHOR + HEAD_EXTRA, 1)
        changed.append('head')

    if 'serviceWorker' not in html:
        if '</body>' not in html:
            raise SystemExit('!! index.html 里找不到 </body>')
        html = html.replace('</body>', SW_SNIPPET, 1)
        changed.append('sw-register')

    index.write_text(html, encoding='utf-8')
    print(f'PWA 注入完成：{", ".join(changed) if changed else "已是最新，无需改动"}')
    print(f'  manifest + sw.js + {len(list(dst_icons.glob("*.png")))} 个图标已复制到 {APP}')


if __name__ == '__main__':
    main()
