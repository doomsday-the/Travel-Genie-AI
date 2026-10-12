#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../../.env"
OUT="$(dirname "$0")/travelgenie_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" \
  --routines --triggers --single-transaction "${DB_NAME}" > "$OUT"
echo "Backup written to $OUT"
