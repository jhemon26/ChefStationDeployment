#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  echo "[chefstation] .env not found. Copying from .env.example"
  cp ".env.example" ".env"
fi

echo "[chefstation] Building containers"
docker compose build

echo "[chefstation] Starting db, api, and client"
docker compose up -d

HEALTH_URL="http://localhost:5000/api/health"
MAX_ATTEMPTS=60
ATTEMPT=1

echo "[chefstation] Waiting for API health check at $HEALTH_URL"
until curl -fsS "$HEALTH_URL" >/dev/null 2>&1; do
  if [[ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]]; then
    echo "[chefstation] API did not become healthy in time"
    echo "[chefstation] Recent API logs:"
    docker compose logs --tail=80 api || true
    exit 1
  fi

  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
done

echo
echo "[chefstation] Stack is up"
echo "Client: http://localhost:3000"
echo "API:    http://localhost:5000/api/health"
echo
echo "Default super admin:"
echo "  username: admin"
echo "  password: changeme123"
echo
echo "Useful commands:"
echo "  docker compose logs -f api"
echo "  docker compose logs -f client"
echo "  ./scripts/local-down.sh"
