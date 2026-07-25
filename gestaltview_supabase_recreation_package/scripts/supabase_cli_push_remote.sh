#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
supabase link
supabase db push
# Optional after schema is proven safe:
# supabase db push --include-seed
