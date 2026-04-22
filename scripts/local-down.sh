#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${1:-}" == "--volumes" ]]; then
  echo "[chefstation] Stopping stack and removing volumes"
  docker compose down -v
  echo "[chefstation] Volumes removed. Database and uploads have been reset."
else
  echo "[chefstation] Stopping stack"
  docker compose down
  echo "[chefstation] Stack stopped. Data volumes were kept."
  echo "[chefstation] Use ./scripts/local-down.sh --volumes for a full reset."
fi
