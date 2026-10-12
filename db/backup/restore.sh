#!/usr/bin/env bash
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: restore.sh <dump.sql>"; exit 1; }
source "$(dirname "$0")/../../.env"
export PGPASSWORD="${DB_PASSWORD:-travelgenie_secret}"

psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-travelgenie}" -d "${DB_NAME:-travelgenie}" < "$1"
echo "PostgreSQL database successfully restored from $1"
