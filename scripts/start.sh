#!/usr/bin/env bash
# ChefStation — start the full stack
#
# Usage:
#   ./scripts/start.sh            auto-detect (Docker preferred)
#   ./scripts/start.sh --docker   force Docker Compose mode
#   ./scripts/start.sh --native   force native mode (needs local PostgreSQL)
#
# Two modes:
#   Docker  — builds and starts db + api + client containers. Zero extra deps.
#             App at http://localhost:3000. Stop with ./scripts/stop.sh
#   Native  — sets up local Postgres, installs npm deps, starts API + Vite.
#             Hot-reload on file changes. Stop with ./scripts/stop.sh or Ctrl+C.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PID_FILE="$ROOT_DIR/.run/pids"

# ── helpers ──────────────────────────────────────────────────────────────────

log() { echo "[chefstation] $*"; }

ensure_env() {
  if [[ ! -f "$ROOT_DIR/.env" ]]; then
    log ".env not found — copying from .env.example"
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    log "Review .env and set your JWT_SECRET and admin password, then re-run."
  fi
}

get_host_ip() {
  # macOS
  local iface
  iface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}' | head -n 1)"
  if [[ -n "${iface:-}" ]]; then
    ipconfig getifaddr "$iface" 2>/dev/null && return
  fi
  ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true

  # Linux fallback
  hostname -I 2>/dev/null | awk '{print $1}' || true
}

# ── Docker mode ───────────────────────────────────────────────────────────────

start_docker() {
  ensure_env
  log "Mode: Docker Compose"

  log "Building containers…"
  docker compose build

  log "Starting db, api, and client…"
  docker compose up -d

  local url="http://localhost:5000/api/health"
  log "Waiting for API health check at $url"
  local attempts=0
  until curl -fsS "$url" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [[ $attempts -ge 60 ]]; then
      log "API did not become healthy in time. Recent logs:"
      docker compose logs --tail=80 api || true
      exit 1
    fi
    sleep 2
  done

  echo
  log "Stack is up"
  echo "  Client:      http://localhost:3000"
  echo "  API health:  http://localhost:5000/api/health"
  echo
  echo "  Default super admin:"
  echo "    username: adminemon@gmail.com  (or SEED_SUPER_ADMIN_USERNAME in .env)"
  echo "    password: (SEED_SUPER_ADMIN_PASSWORD in .env, default: change-this-in-your-real-env)"
  echo
  echo "  Demo owner:  demo_owner / owner12345"
  echo "  Demo staff:  demo_staff / staff12345"
  echo "  Invite code: CHEF-DEMO"
  echo
  echo "  Logs:  docker compose logs -f api"
  echo "  Stop:  ./scripts/stop.sh"
  echo "  Reset: ./scripts/stop.sh --volumes"
}

# ── Native mode ───────────────────────────────────────────────────────────────

setup_local_db() {
  local role="${POSTGRES_USER:-chefstation}"
  local password="${POSTGRES_PASSWORD:-chefstation_pw}"
  local dbname="${POSTGRES_DB:-chefstation}"
  local pgdb="${POSTGRES_MAINTENANCE_DB:-postgres}"

  if ! command -v psql >/dev/null 2>&1; then
    echo
    echo "  ERROR: psql not found."
    echo "  Install PostgreSQL first (brew install postgresql@16 on Mac),"
    echo "  then run: brew services start postgresql@16"
    echo
    exit 1
  fi

  local role_exists
  role_exists="$(psql -d "$pgdb" -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$role'" 2>/dev/null || echo '')"
  if [[ "$role_exists" != "1" ]]; then
    log "Creating PostgreSQL role: $role"
    psql -d "$pgdb" -c "CREATE ROLE $role WITH LOGIN PASSWORD '$password';"
  else
    log "PostgreSQL role already exists: $role"
  fi

  local db_exists
  db_exists="$(psql -d "$pgdb" -tAc "SELECT 1 FROM pg_database WHERE datname = '$dbname'" 2>/dev/null || echo '')"
  if [[ "$db_exists" != "1" ]]; then
    log "Creating database: $dbname"
    createdb -O "$role" "$dbname"
  else
    log "Database already exists: $dbname"
  fi

  psql -d "$pgdb" -c "GRANT ALL PRIVILEGES ON DATABASE $dbname TO $role;" >/dev/null
  log "Database ready: $dbname"
}

install_deps() {
  if [[ ! -d "$ROOT_DIR/server/node_modules" ]]; then
    log "Installing server dependencies…"
    ( cd "$ROOT_DIR/server" && npm install )
  fi
  if [[ ! -d "$ROOT_DIR/client/node_modules" ]]; then
    log "Installing client dependencies…"
    ( cd "$ROOT_DIR/client" && npm install )
  fi
}

start_native() {
  ensure_env

  set -a
  # shellcheck source=/dev/null
  source "$ROOT_DIR/.env"
  set +a

  log "Mode: Native (local PostgreSQL)"

  # ── dev environment cleanup ──────────────────────────────────────────────
  # Kill ALL leftover node/nodemon/vite processes from any project, not just
  # this one, so stale dev servers from other projects never block a fresh start.
  log "Cleaning up stale dev processes…"
  pkill -f "nodemon" 2>/dev/null || true
  pkill -f "vite"    2>/dev/null || true
  # Give processes a moment to exit gracefully before force-clearing ports
  sleep 0.5

  # Kill anything still holding the dev ports and wait until they are actually free.
  # Skips ports owned by macOS system processes (ControlCenter/AirPlay on 5000).
  local api_port="${PORT:-5001}"
  for port in "$api_port" 3000 8080 8000; do
    if lsof -ti:"$port" >/dev/null 2>&1; then
      local owner_comm
      owner_comm="$(lsof -ti:"$port" | xargs -I{} ps -p {} -o comm= 2>/dev/null | head -1 || true)"
      if [[ "$owner_comm" == *"ControlCenter"* ]] || [[ "$owner_comm" == *"rapportd"* ]]; then
        log "Port $port is held by macOS ($owner_comm) — skipping (change port in .env if needed)"
        continue
      fi
      log "Clearing port $port (held by: ${owner_comm:-unknown})"
      lsof -ti:"$port" | xargs kill -9 2>/dev/null || true
      local attempts=0
      while lsof -ti:"$port" >/dev/null 2>&1 && [[ $attempts -lt 10 ]]; do
        sleep 0.5
        attempts=$((attempts + 1))
      done
    fi
  done
  # ─────────────────────────────────────────────────────────────────────────

  setup_local_db
  install_deps

  # Derive host IP for LAN (phone) access
  local host_ip
  host_ip="$(get_host_ip)"
  local api_port="${PORT:-5000}"

  if [[ -n "${host_ip:-}" ]]; then
    export CORS_ORIGIN="http://localhost:3000,http://${host_ip}:3000"
    export VITE_API_URL="http://${host_ip}:${api_port}/api"
  fi

  # Create PID directory
  mkdir -p "$ROOT_DIR/.run"

  # Start API in background
  log "Starting API on http://localhost:${api_port}"
  ( cd "$ROOT_DIR/server" && npm run dev ) &
  echo $! > "$ROOT_DIR/.run/api.pid"

  # Give the API a moment to bind before printing client info
  sleep 1

  log "Starting Vite client on http://localhost:3000"
  if [[ -n "${host_ip:-}" ]]; then
    log "LAN access (phones): http://${host_ip}:3000"
    log "LAN API target:      http://${host_ip}:${api_port}/api"
  fi

  # Save both PIDs for stop.sh
  ( cd "$ROOT_DIR/client" && npm run dev -- --host 0.0.0.0 ) &
  echo $! > "$ROOT_DIR/.run/client.pid"

  echo
  echo "  Client:      http://localhost:3000"
  echo "  API health:  http://localhost:${api_port}/api/health"
  echo
  echo "  Demo owner:  demo_owner / owner12345"
  echo "  Demo staff:  demo_staff / staff12345"
  echo "  Invite code: CHEF-DEMO"
  echo
  echo "  Stop: ./scripts/stop.sh  (or press Ctrl+C here)"

  # Trap Ctrl+C to clean up background processes
  trap 'log "Shutting down…"; kill "$(cat "$ROOT_DIR/.run/api.pid" 2>/dev/null)" "$(cat "$ROOT_DIR/.run/client.pid" 2>/dev/null)" 2>/dev/null; rm -f "$ROOT_DIR/.run/"*.pid; exit 0' INT TERM

  # Keep the script alive until both children exit
  wait
}

# ── mode selection ────────────────────────────────────────────────────────────

MODE="${1:-}"

if [[ "$MODE" == "--docker" ]]; then
  start_docker
elif [[ "$MODE" == "--native" ]]; then
  start_native
else
  # Auto-detect: prefer Docker if available
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    start_docker
  else
    log "Docker not found or not running — falling back to native mode"
    start_native
  fi
fi
