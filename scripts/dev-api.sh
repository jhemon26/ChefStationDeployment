#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

get_host_ip() {
  local default_iface
  default_iface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}' | head -n 1)"

  if [[ -n "${default_iface}" ]]; then
    ipconfig getifaddr "${default_iface}" 2>/dev/null || true
    return
  fi

  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true
}

if [[ ! -f ".env" ]]; then
  echo "[chefstation-api] .env not found. Copying from .env.example"
  cp ".env.example" ".env"
fi

set -a
source ".env"
set +a

HOST_IP="$(get_host_ip)"
APP_PORT="${PORT:-5000}"

if [[ -n "${HOST_IP}" ]]; then
  export CORS_ORIGIN="http://localhost:3000,http://${HOST_IP}:3000"
fi

if [[ ! -d "server/node_modules" ]]; then
  echo "[chefstation-api] Installing server dependencies"
  cd server
  npm install
  cd "$ROOT_DIR"
fi

echo "[chefstation-api] Starting API on http://localhost:${APP_PORT}"
if [[ -n "${HOST_IP}" ]]; then
  echo "[chefstation-api] Phone API URL: http://${HOST_IP}:${APP_PORT}"
  echo "[chefstation-api] Allowed CORS origins: ${CORS_ORIGIN}"
fi
echo "[chefstation-api] Make sure PostgreSQL is running locally on port 5432"
cd server
npm run dev
