#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if lsof -ti tcp:3000 >/dev/null 2>&1; then
  echo "🔄 Liberando puerto 3000..."
  lsof -ti tcp:3000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

echo "🚀 Iniciando Next.js en puerto 3000 (foreground)..."
cd "$ROOT_DIR"
exec npm run dev -- --port 3000
