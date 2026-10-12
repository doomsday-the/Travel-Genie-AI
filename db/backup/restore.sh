#!/usr/bin/env bash
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: restore.sh <dump.sql>"; exit 1; }
source "$(dirname "$0")/../../.env"
mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < "$1"
echo "Restored from $1"
