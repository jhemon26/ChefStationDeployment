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

if [[ -f ".env" ]]; then
  set -a
  source ".env"
  set +a
fi

HOST_IP="$(get_host_ip)"
API_PORT="${PORT:-5000}"

if [[ -n "${HOST_IP}" ]]; then
  export VITE_API_URL="http://${HOST_IP}:${API_PORT}/api"
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
if [[ -n "${HOST_IP}" ]]; then
  echo "[chefstation-client] Phone app URL: http://${HOST_IP}:3000"
fi
cd client
npm run dev -- --host 0.0.0.0
