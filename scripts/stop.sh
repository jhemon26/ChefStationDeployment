#!/usr/bin/env bash
# ChefStation — stop the running stack
#
# Usage:
#   ./scripts/stop.sh            stop, keep database and uploads
#   ./scripts/stop.sh --volumes  stop AND delete all data (full reset)
#
# Works for both Docker and native modes — auto-detects which is running.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

VOLUMES="${1:-}"

log() { echo "[chefstation] $*"; }

# ── Docker stop ───────────────────────────────────────────────────────────────

stop_docker() {
  if [[ "$VOLUMES" == "--volumes" ]]; then
    log "Stopping stack and removing all volumes (database + uploads)"
    docker compose down -v
    log "Done. Database and uploads have been fully reset."
  else
    log "Stopping stack (data volumes kept)"
    docker compose down
    log "Done. Run ./scripts/start.sh to bring it back up."
    log "Use --volumes to also wipe the database and uploads."
  fi
}

# ── Native stop ───────────────────────────────────────────────────────────────

stop_native() {
  local api_pid_file="$ROOT_DIR/.run/api.pid"
  local client_pid_file="$ROOT_DIR/.run/client.pid"
  local killed=0

  if [[ -f "$api_pid_file" ]]; then
    local pid
    pid="$(cat "$api_pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      log "Stopping API (pid $pid)"
      kill "$pid" 2>/dev/null || true
      killed=$((killed + 1))
    fi
    rm -f "$api_pid_file"
  fi

  if [[ -f "$client_pid_file" ]]; then
    local pid
    pid="$(cat "$client_pid_file")"
    if kill -0 "$pid" 2>/dev/null; then
      log "Stopping client (pid $pid)"
      kill "$pid" 2>/dev/null || true
      killed=$((killed + 1))
    fi
    rm -f "$client_pid_file"
  fi

  if [[ $killed -eq 0 ]]; then
    log "No native processes found (PID files missing)."
    log "If processes are still running, kill them manually:"
    echo "  lsof -ti:5000 | xargs kill   # API"
    echo "  lsof -ti:3000 | xargs kill   # Client"
  else
    log "Native processes stopped."
  fi

  if [[ "$VOLUMES" == "--volumes" ]]; then
    local dbname="${POSTGRES_DB:-chefstation}"
    log "Dropping local database: $dbname"
    dropdb --if-exists "$dbname" 2>/dev/null || true
    log "Database dropped. Next start will recreate it from scratch."
  fi
}

# ── auto-detect ───────────────────────────────────────────────────────────────

# Check if Docker Compose containers are running
DOCKER_RUNNING=false
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if docker compose ps --services --filter status=running 2>/dev/null | grep -q .; then
    DOCKER_RUNNING=true
  fi
fi

# Check if native PID files exist
NATIVE_RUNNING=false
if [[ -f "$ROOT_DIR/.run/api.pid" ]] || [[ -f "$ROOT_DIR/.run/client.pid" ]]; then
  NATIVE_RUNNING=true
fi

if $DOCKER_RUNNING; then
  stop_docker
elif $NATIVE_RUNNING; then
  stop_native
else
  # Try both gracefully — nothing will error if nothing is running
  log "No running stack detected — attempting cleanup of both modes."
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    docker compose down 2>/dev/null || true
  fi
  stop_native
fi
