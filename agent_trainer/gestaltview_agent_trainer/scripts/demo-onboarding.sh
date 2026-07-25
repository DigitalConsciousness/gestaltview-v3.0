#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$(cd "$PROJECT_ROOT/../.." && pwd)"
RUN_ROOT="${RUN_ROOT:-/tmp/gsvw-agent-trainer-demo}"
SEGMENT="${1:-solo}"
REPO_REF="${2:-gestaltview/demo-repo}"
DEFAULT_BRANCH="${3:-main}"
WORKSPACE_NAME="${4:-Demo Workspace}"
AGENT_NAME="${5:-Demo Agent}"
PROVIDER="${6:-groq}"
MODEL="${7:-llama-3.3-70b-versatile}"
TSX_LOADER="$WORKSPACE_ROOT/node_modules/tsx/dist/loader.mjs"

slugify() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's#https?://github\.com/##; s#\.git$##; s#[^a-z0-9]+#-#g; s#^-+##; s#-+$##'
}

run_cli() {
  (
    cd "$RUN_ROOT"
    node --import "$TSX_LOADER" "$PROJECT_ROOT/scripts/operator-cli.ts" "$@"
  )
}

say() {
  printf '\n== %s ==\n' "$1"
}

REPO_SLUG="$(slugify "$REPO_REF")"
MANIFEST_PATH="$RUN_ROOT/repo-corpus/$REPO_SLUG/manifests/import-manifest.template.json"
SUPPORT_BUNDLE_PATH="$RUN_ROOT/support-bundle.json"

mkdir -p "$RUN_ROOT"
rm -rf "$RUN_ROOT/.gsvw" "$RUN_ROOT/repo-corpus" "$SUPPORT_BUNDLE_PATH"

say "Initialize onboarding session"
run_cli init "$SEGMENT"

say "Create workspace"
run_cli workspace create "$WORKSPACE_NAME" "$AGENT_NAME" "demo@example.com"

say "Stage repo corpus container"
run_cli repo stage "$REPO_REF" "$DEFAULT_BRANCH" "$RUN_ROOT"

say "Select provider"
run_cli provider select "$PROVIDER" "$MODEL"

say "Review first batch"
run_cli import review "$MANIFEST_PATH" "operator-guided" 1

say "Import reviewed manifest"
run_cli import manifest "$MANIFEST_PATH"

say "Choose lane focus"
run_cli lane focus knowledge

say "Select theme"
run_cli theme select lagoon-glass

say "Run evaluations"
run_cli eval run 72 5

say "Publish demo target"
run_cli publish demo-walkthrough 72

say "Write support bundle"
run_cli handoff "$SUPPORT_BUNDLE_PATH"

printf '\nDemo artifacts:\n'
printf -- '- run root: %s\n' "$RUN_ROOT"
printf -- '- manifest: %s\n' "$MANIFEST_PATH"
printf -- '- support bundle: %s\n' "$SUPPORT_BUNDLE_PATH"
