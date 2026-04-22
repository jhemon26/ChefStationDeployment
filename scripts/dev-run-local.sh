#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[chefstation] Step 1/3: checking local PostgreSQL setup"
"$ROOT_DIR/scripts/dev-db-setup.sh"

echo
echo "[chefstation] Step 2/3: start API in one terminal"
echo "  ./scripts/dev-api.sh"
echo
echo "[chefstation] Step 3/3: start client in another terminal"
echo "  ./scripts/dev-client.sh"
echo
echo "[chefstation] Then open http://localhost:3000"
