#!/usr/bin/env bash
set -euo pipefail

DB_ROLE="${DB_ROLE:-chefstation}"
DB_PASSWORD="${DB_PASSWORD:-chefstation_pw}"
DB_NAME="${DB_NAME:-chefstation}"
POSTGRES_DB="${POSTGRES_DB:-postgres}"

if ! command -v psql >/dev/null 2>&1; then
  echo "[chefstation-db] psql not found."
  echo "[chefstation-db] Install PostgreSQL first, then rerun this script."
  exit 1
fi

echo "[chefstation-db] Using postgres database: $POSTGRES_DB"

ROLE_EXISTS="$(psql -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$DB_ROLE'")"
if [[ "$ROLE_EXISTS" != "1" ]]; then
  echo "[chefstation-db] Creating role: $DB_ROLE"
  psql -d "$POSTGRES_DB" -c "CREATE ROLE $DB_ROLE WITH LOGIN PASSWORD '$DB_PASSWORD';"
else
  echo "[chefstation-db] Role already exists: $DB_ROLE"
fi

DB_EXISTS="$(psql -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'")"
if [[ "$DB_EXISTS" != "1" ]]; then
  echo "[chefstation-db] Creating database: $DB_NAME"
  createdb -O "$DB_ROLE" "$DB_NAME"
else
  echo "[chefstation-db] Database already exists: $DB_NAME"
fi

echo "[chefstation-db] Granting privileges"
psql -d "$POSTGRES_DB" -c "ALTER ROLE $DB_ROLE WITH LOGIN;"
psql -d "$POSTGRES_DB" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_ROLE;"

echo
echo "[chefstation-db] Local database setup complete"
echo "Role:      $DB_ROLE"
echo "Database:  $DB_NAME"
echo "Password:  $DB_PASSWORD"
