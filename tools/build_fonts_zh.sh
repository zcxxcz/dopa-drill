#!/usr/bin/env bash
# 重建中文化后的字体子集。
#  - 日文字体（Dela Gothic One / Zen Maru Gothic）：只保留 ASCII 与数学符号，负责数字与算符的造型
#  - 汉字与全角标点：Noto Sans SC 的 700 / 900 两个静态字重
#    （900 另外以 "Noto SC Black" 的名义注册，供标题/按钮这类只写 font-weight:400 的"粗标题"字体栈使用）
# 依赖：curl、python（fonttools + brotli）
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
GAME="$(cd "$HERE/../app" && pwd)"
WORK="$(mktemp -d)"
PY="${PY:-/Users/czhang/.workbuddy/binaries/python/envs/default/bin/python}"
BASE=https://raw.githubusercontent.com/google/fonts/main/ofl
trap 'rm -rf "$WORK"' EXIT

curl -sSfo "$WORK/dela.ttf"      "$BASE/delagothicone/DelaGothicOne-Regular.ttf"
curl -sSfo "$WORK/zen-bold.ttf"  "$BASE/zenmarugothic/ZenMaruGothic-Bold.ttf"
curl -sSfo "$WORK/zen-black.ttf" "$BASE/zenmarugothic/ZenMaruGothic-Black.ttf"
curl -sSfo "$WORK/noto.ttf"      "$BASE/notosanssc/NotoSansSC%5Bwght%5D.ttf"
curl -sSfo "$GAME/fonts/OFL-NotoSansSC.txt" "$BASE/notosanssc/OFL.txt"

# 按「拉丁+算符」/「汉字+全角标点」切分字符
"$PY" - "$GAME" "$WORK" <<'PY'
import sys, pathlib
game, work = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
chars = {chr(c) for c in range(0x20, 0x7f)}
for f in [*game.glob('*.html'), *game.glob('*.css'), *game.glob('js/*.js')]:
    chars |= set(f.read_text(encoding='utf-8'))
lat = {c for c in chars if ord(c) < 0x7f} | set('＋−×÷＝')
cjk = {c for c in chars if ord(c) >= 0x20 and c not in lat}
(work / 'lat.txt').write_text(''.join(sorted(lat)), encoding='utf-8')
(work / 'cjk.txt').write_text(''.join(sorted(cjk)), encoding='utf-8')
print(f'chars: latin {len(lat)} / cjk {len(cjk)}')
PY

sub() { "$PY" -m fontTools.subset "$1" --text-file="$2" --flavor=woff2 --layout-features='*' --output-file="$3"; }
inst() { "$PY" -m fontTools.varLib.instancer "$1" "wght=$2" -o "$3" >/dev/null; }

sub "$WORK/dela.ttf"      "$WORK/lat.txt" "$GAME/fonts/dela-gothic-one.woff2"
sub "$WORK/zen-bold.ttf"  "$WORK/lat.txt" "$GAME/fonts/zen-maru-gothic-bold.woff2"
sub "$WORK/zen-black.ttf" "$WORK/lat.txt" "$GAME/fonts/zen-maru-gothic-black.woff2"

inst "$WORK/noto.ttf" 700 "$WORK/noto700.ttf"
inst "$WORK/noto.ttf" 900 "$WORK/noto900.ttf"
sub "$WORK/noto700.ttf" "$WORK/cjk.txt" "$GAME/fonts/noto-sans-sc-700.woff2"
sub "$WORK/noto900.ttf" "$WORK/cjk.txt" "$GAME/fonts/noto-sans-sc-900.woff2"
rm -f "$GAME/fonts/zcool-qingke.woff2" "$GAME/fonts/noto-sans-sc.woff2" "$GAME/fonts/OFL-ZCOOLQingKeHuangYou.txt"

ls -l "$GAME/fonts"/*.woff2
echo "fonts rebuilt in $GAME/fonts"
