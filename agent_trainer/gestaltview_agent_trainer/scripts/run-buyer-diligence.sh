#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RUN_ROOT="${RUN_ROOT:-/tmp/gsvw-agent-trainer-diligence}"

say() {
  printf '\n== %s ==\n' "$1"
}

cd "$PROJECT_ROOT"

say "Typecheck"
npm run typecheck

say "Focused onboarding tests"
npm exec --yes vitest run \
  tests/setup/onboarding-graph.test.ts \
  tests/setup/import-template.test.ts \
  tests/setup/corpus-container.test.ts \
  tests/setup/verify-setup.test.ts

say "CLI end-to-end onboarding smoke"
RUN_ROOT="$RUN_ROOT" bash "$PROJECT_ROOT/scripts/demo-onboarding.sh" \
  solo \
  diligence/demo-repo \
  main \
  "Diligence Workspace" \
  "Diligence Agent"

printf '\nBuyer diligence artifacts:\n'
printf -- '- run root: %s\n' "$RUN_ROOT"
printf -- '- onboarding session: %s\n' "$RUN_ROOT/.gsvw/onboarding-session.json"
printf -- '- support bundle: %s\n' "$RUN_ROOT/support-bundle.json"
