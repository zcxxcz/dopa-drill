#!/usr/bin/env bash
# 多巴口算 —— 本地一键启动
# 用法：
#   ./start.sh            默认端口 8765，只允许本机访问
#   ./start.sh 8080       指定端口
#   ./start.sh 8765 lan   绑定 0.0.0.0，同一 Wi-Fi 下手机可访问
set -euo pipefail
cd "$(dirname "$0")"

PORT="${1:-8765}"
MODE="${2:-local}"

if [ "$MODE" = "lan" ]; then
  BIND="0.0.0.0"
  IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
  echo "局域网模式：手机连同一个 Wi-Fi，打开 http://${IP:-<本机IP>}:${PORT}/"
else
  BIND="127.0.0.1"
fi

echo "多巴口算 → http://127.0.0.1:${PORT}/    (Ctrl+C 停止)"
exec /Users/czhang/.workbuddy/binaries/python/versions/3.13.12/bin/python3 -m http.server "$PORT" --bind "$BIND" --directory app
