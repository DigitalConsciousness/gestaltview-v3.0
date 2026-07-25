#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?DATABASE_URL must be set}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seed.sql
if [[ -n "${FOUNDER_EMAIL:-}" ]]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v founder_email="$FOUNDER_EMAIL" -f seeds/seed_founder_admin_psql.sql
fi
