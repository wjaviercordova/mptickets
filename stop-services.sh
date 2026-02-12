#!/usr/bin/env bash
set -euo pipefail

if lsof -ti tcp:3000 >/dev/null 2>&1; then
  echo "🧹 Cerrando procesos restantes en puerto 3000..."
  lsof -ti tcp:3000 | xargs -r kill -9
  sleep 1
fi

echo "✅ Servicios detenidos y puerto 3000 liberado."
