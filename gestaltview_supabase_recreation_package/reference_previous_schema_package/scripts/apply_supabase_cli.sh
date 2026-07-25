#!/usr/bin/env bash
set -euo pipefail

TARGET_REPO="${1:-}"
if [[ -z "$TARGET_REPO" ]]; then
  echo "Usage: ./scripts/apply_supabase_cli.sh /path/to/target/repo" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "$TARGET_REPO/supabase/migrations"
cp "$ROOT"/supabase/migrations/*.sql "$TARGET_REPO/supabase/migrations/"

echo "Copied migrations into $TARGET_REPO/supabase/migrations"
echo "Next: cd $TARGET_REPO && supabase db push"
