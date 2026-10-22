#!/usr/bin/env python3
"""生成上线用的站点元数据，写进 app/：robots.txt、sitemap.xml、catalog.json。

catalog.json 是 zcxxcz.github.io 门户聚合用的格式（与 word-builder2 / zhuanpan 一致）：
门户读 sites/<id>.json 里的 catalog 地址，再抓这份文件做卡片与全文搜索。
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / 'app'

SITE_URL = 'https://zcxxcz.github.io/dopa-drill/'
UPDATED = '2026-10-22'

SUMMARY = '把日本「ドパドリル」中文化的口算练习游戏：58 个技能关卡，答对越多画面越热闹，答错不中断。'

TEXT = """多巴口算 玩法说明
目标：小学 1～6 年级的计算熟练度，共 58 个技能点，按掌握度逐级解锁，不按年级硬推。
第一次进入先做能力检测，定出「我的水平」起点，之后每次从当前档位出题。
作答：手机竖屏用屏幕数字键盘，电脑直接用键盘敲数字，回车提交；竖式题按步骤逐格填。
计分：全对 100 分。首次正确率不低于 80% 会解锁加时赛 90 秒，可以冲到 100 分以上。
反馈：答对会让多巴值上涨、连击加算、画面元素逐级变热闹；答错只提示不扣分、不中断，没有 Game Over。
复习：错题进入复习队列，可以在首页「复习」里重做。
技能树：每个技能有掌握度与 1～5 星，练久了会精通，长期不练会生锈。
养成：每日任务、306 项奖杯、47 件收藏、连续天数、补签锤、时间胶囊（拿早期题回访比速度）。
设置：可以降低动画强度（reduced motion）、静音、查看日历与记录。
数据：全部记录只存在浏览器 localStorage，不上传服务器；换设备或清缓存会重新开始。
离线：已经做成 PWA，加到手机主屏后可全屏启动、断网也能做题。
来源：非官方简体中文版，原作 grmchn 的 ドパドリル（https://github.com/grmchn/dopa-drill），代码 MIT，角色与名称不在 MIT 范围内。"""


def main() -> None:
    robots = f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n"
    (APP / 'robots.txt').write_text(robots, encoding='utf-8')

    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f'  <url><loc>{SITE_URL}</loc><lastmod>{UPDATED}</lastmod></url>\n'
        '</urlset>\n'
    )
    (APP / 'sitemap.xml').write_text(sitemap, encoding='utf-8')

    catalog = {
        'version': 1,
        'records': [
            {
                'id': 'dopa-drill',
                'title': '多巴口算',
                'type': '游戏',
                'summary': SUMMARY,
                'tags': ['小学', '数学', '口算'],
                'url': SITE_URL,
                'updated': UPDATED,
                'featured': True,
                'text': TEXT,
            }
        ],
    }
    (APP / 'catalog.json').write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
    )
    print('站点元数据已写入：robots.txt / sitemap.xml / catalog.json')


if __name__ == '__main__':
    main()
