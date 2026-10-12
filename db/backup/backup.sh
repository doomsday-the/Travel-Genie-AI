#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../../.env"
OUT="$(dirname "$0")/travelgenie_$(date +%Y%m%d_%H%M%S).sql"
export PGPASSWORD="${DB_PASSWORD:-travelgenie_secret}"

pg_dump -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-travelgenie}" -d "${DB_NAME:-travelgenie}" --clean --if-exists > "$OUT"
echo "PostgreSQL backup successfully written to $OUT"
