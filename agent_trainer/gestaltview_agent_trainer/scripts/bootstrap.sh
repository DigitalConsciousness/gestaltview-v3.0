#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [[ ! -f ".env.local" ]]; then
  cp "setup/env.example" ".env.local"
  echo "Created .env.local from setup/env.example"
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to continue."
  exit 1
fi

echo "Installing package dependencies..."
npm install

echo "Running setup verification..."
npm run verify-setup || true

cat <<'EOF'

Bootstrap finished.

Next steps:
1. Fill in .env.local
2. Re-run: npm run verify-setup
3. Apply: supabase/seed.sql
4. Review: setup/setup-wizard.html
5. Package: npm run package
EOF
