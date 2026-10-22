# 多巴口算（ドパドリル 中文化版）

把日本作者 grmchn 的浏览器口算练习游戏「**ドパドリル / Dopa Drill**」整体翻译成了简体中文。
每做对一题，画面上的演出和音乐就更热闹一点；答错也不中断节奏，没有 Game Over。

- 上游仓库：<https://github.com/grmchn/dopa-drill>
- 纯前端、零依赖、零后端：一个静态目录，`app/` 直接托管就能玩
- 58 个计算技能（小学 1～6 年级）：加减、乘法口诀、乘除竖式、小数、分数、近似数、因数倍数、百分率、比、求未知数
- 记录只存 localStorage，不外传；有「每日任务 / 306 项奖杯 / 47 件收藏 / 连续天数 / 时间胶囊」等养成层
- 音乐音效全部由 Web Audio API 实时合成，没有音频文件

## 本地运行

```bash
# 在仓库根目录
python3 -m http.server 8000 -d app
# 打开 http://localhost:8000/
```

必须走 HTTP：代码用 ES Modules，`file://` 直接打开会白屏。

也可以一键起服务：`./start.sh`（默认 8765，仅本机）；`./start.sh 8765 lan` 绑 0.0.0.0，同 Wi-Fi 手机可访问。

## 在线版与离线安装（PWA）

线上地址（GitHub Pages，由 `.github/workflows/pages.yml` 发布 `app/`）：

**<https://zcxxcz.github.io/dopa-drill/>**

门户索引在 <https://zcxxcz.github.io/>：本站通过 `catalog.json` 报到，
门户侧对应 `sites/dopa-drill.json`（`{id, repository, catalog}`）。

已经做成可安装的 PWA，`app/` 下多了 `manifest.webmanifest`、`sw.js`、`icons/`：

- **iPhone**：Safari 打开链接 → 分享 → 添加到主屏幕，之后像 App 一样全屏启动（`display: standalone`）
- **安卓**：Chrome 打开链接 → 菜单 → 安装应用 / 添加到主屏幕
- **电脑**：Chrome/Edge 地址栏右侧的安装图标
- **离线可玩**：Service Worker 预缓存了全部 30 个资源（HTML/CSS/JS/字体/图标），断网也能做题；进度照旧存 localStorage

| 文件 | 作用 |
| --- | --- |
| `pwa/icon-template.svg` | 方形图标模板（吉祥物脸 + 品牌蓝底，`__RADIUS__` / `__SCALE__` 占位） |
| `tools/build_icons.mjs` | 生成 192/512/maskable 512/apple-touch 180 四个 PNG |
| `pwa/manifest.webmanifest` | 名称、竖屏、主题色、图标声明 |
| `pwa/sw.js` | 页面 network-first（保证拿到最新 HTML）、静态资源 cache-first |
| `tools/pwa_patch.py` | 把上面这些复制进 `app/` 并往 `index.html` 注入 meta 与注册脚本（幂等） |
| `tools/site_meta.py` | 生成 `app/robots.txt`、`sitemap.xml`、`catalog.json`（门户聚合用） |
| `.github/workflows/pages.yml` | CI：跑 59 项测试 → 把 `app/` 作为 Pages 产物发布 |
| `tools/check_pwa.cjs` / `check_live.cjs` | 无头浏览器自查：SW 是否 activated、缓存条数、断网重载是否正常 |

⚠️ **改过 `app/js`、`app/style.css` 后重新发布**：把 `pwa/sw.js` 顶部的 `VERSION` 递增一位，
否则老访客会一直读到缓存里的旧脚本（HTML 走 network-first 不受影响）。

## 测试

```bash
node --test tests/*.test.mjs   # 59 项全部通过
```

## 中文化是怎么做的

不是改一两处字符串，而是把 UI 文案、题库标签、奖杯/收藏目录、说明页全部落成词表再统一替换：

| 文件 | 作用 |
| --- | --- |
| `i18n/dict_a.json` | 首页（index.html）、主流程（main.js）、新手引导（guide.js） |
| `i18n/dict_b.json` | 题目文本（problems.js）、任务、技能名、计数单位、星级说明、奖杯、收藏、曲名 |
| `i18n/dict_c.json` | 残留修正与全局小词（题/分/次/年级） |
| `i18n/dict_d.json` | 字体栈与 logo 描边微调 |
| `tools/i18n_apply.py` | 单遍、长键优先替换（避免「点→分」这类全局键二次污染已有中文） |
| `tools/build_fonts_zh.sh` | 重建字体子集 |
| `rebuild_zh.sh` | 从上游 `app/` 还原 → 套词表 → 重建字体，一键可重复 |

**字体**是这次的关键坑：上游把 Dela Gothic One / Zen Maru Gothic 做成了**只含用到的日文字形**的子集，
中文字符根本不在里面（会掉回系统字体，甚至豆腐块）。所以整条字体链重做了一遍：

- 日文字体子集只保留 ASCII 与 `＋−×÷＝`——数字和算符仍用原来的粗圆造型
- 汉字与全角标点交给 **Noto Sans SC 700 / 900** 子集；900 另以 `Noto SC Black` 这个名字注册，
  供标题/按钮这类只写 `font-weight:400` 的「粗标题」字体栈直接用
- 全部子集化后 5 个 woff2 合计约 190 KB

**顺手修的两处观感问题**：logo「多巴」的 8 方向描边在 82px 下会把汉字内白挤死，
把 offset 从 3px 收到 2px、蓝色叠印带从 62% 收到 80%，笔画才散得开。

## 名称与术语表

| 日文 | 中文 | 说明 |
| --- | --- | --- |
| ドパドリル | 多巴口算 | 品牌名（保留「多巴」谐音） |
| ドパキチ | 多巴奇 | 吉祥物 |
| ドパ | 多巴值 | 爽感计量表，随连击指数增长（万/亿/兆…） |
| コンボ | 连击 | |
| エクストラ | 加时赛 | 首答正确率 ≥80% 解锁的限时加赛 |
| じぶんレベル | 我的水平 | 先做能力检测再定起点 |
| じつりょくチェック | 能力检测 | |
| ふくしゅう | 复习 | 错题重做 |
| スキルツリー | 技能树 | 掌握度 → ☆1-5 → 精通/生锈 |
| ノーカンハンマー | 补签锤 | 把漏掉的一天「不算」，续上连续天数 |
| タイムカプセル | 时间胶囊 | 拿早期做过的题回访，比较是否更快 |
| あまり | 余 | 余数，如 `9 ÷ 5 = 1 余 4` |
| 一の位 / 十の位 | 个位 / 十位 | 竖式的步骤提示 |
| がい数 / 約分 / 最大公約数 | 近似数 / 约分 / 最大公因数 | 用大陆教材术语 |

题库里的日式记法也改了：`Aは Bと C` 型的分成题现在写「10 是 3 和 □」，
带分数写「6 又 1/7」，`先に` 提示改成「先算」，`の 10こぶん` 改成「的 10 倍」。

## 与上游的差异

- `app/` 全部 UI 文案中文化，`lang="zh-CN"`，删掉了指向上游站点的 canonical
- 新增 PWA 层（manifest / service worker / 四套图标），上游没有
- 字体方案见上（新增 `fonts/noto-sans-sc-700/900.woff2`）
- 测试里 4 处断言跟着改（`あまり`→`余`、`億`→`亿`、`あと 5日`→`还要等 5 天`、带分数正则）
- `docs/SPEC.md`、`docs/curriculum.md` 仍是日文原文，未翻译（设计文档，不影响运行）
- 原 README 留在 `README.ja.md`

## 许可证与二创（重要）

- **源代码**：MIT License（见 `LICENSE`），中文化改动同样以 MIT 提供
- **角色「ドパキチ」、名称「ドパドリル」及 logo 不在 MIT 范围内**：
  非商业二创（同人、非营利 fork、直播录播含广告分成）自由；卖货、付费产品或广告中使用、
  或当作其他产品品牌使用，需要原作者授权
- **字体**：Dela Gothic One、Zen Maru Gothic、Noto Sans SC 均为 SIL Open Font License 1.1，
  许可证文本在 `app/fonts/OFL-*.txt`
- 公开发布时请标明「非官方中文版，基于 grmchn 的 ドパドリル」
