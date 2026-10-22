#!/usr/bin/env bash
# 从原始仓库的 app/ 还原 → 套用全部词表 → 注入 PWA → 重建字体子集
set -euo pipefail
cd "$(dirname "$0")"
rm -rf app && cp -R ../dopa-drill/app app
/Users/czhang/.workbuddy/binaries/python/versions/3.13.12/bin/python3 tools/i18n_apply.py
/Users/czhang/.workbuddy/binaries/python/versions/3.13.12/bin/python3 tools/pwa_patch.py
/Users/czhang/.workbuddy/binaries/python/versions/3.13.12/bin/python3 tools/site_meta.py
bash tools/build_fonts_zh.sh | tail -3
