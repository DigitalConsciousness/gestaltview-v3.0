#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DATABASE_URL:?DATABASE_URL must be set}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f verify_after_deploy.sql
