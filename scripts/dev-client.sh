#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f ".env" ]]; then
  set -a
  source ".env"
  set +a
fi

if [[ ! -d "client/node_modules" ]]; then
  echo "[chefstation-client] Installing client dependencies"
  cd client
  npm install
  cd "$ROOT_DIR"
fi

echo "[chefstation-client] Starting Vite on http://localhost:3000"
if [[ -n "${VITE_API_URL:-}" ]]; then
  echo "[chefstation-client] Browser API target: ${VITE_API_URL}"
fi
cd client
npm run dev -- --host 0.0.0.0
