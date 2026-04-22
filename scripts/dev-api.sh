#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  echo "[chefstation-api] .env not found. Copying from .env.example"
  cp ".env.example" ".env"
fi

set -a
source ".env"
set +a

APP_PORT="${PORT:-5000}"

if [[ ! -d "server/node_modules" ]]; then
  echo "[chefstation-api] Installing server dependencies"
  cd server
  npm install
  cd "$ROOT_DIR"
fi

echo "[chefstation-api] Starting API on http://localhost:${APP_PORT}"
echo "[chefstation-api] Make sure PostgreSQL is running locally on port 5432"
cd server
npm run dev
