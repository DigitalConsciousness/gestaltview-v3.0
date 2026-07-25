#!/usr/bin/env bash
# GestaltView Agent Trainer workflow helper
# Keeps the common setup, verification, and trainer commands in one place.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

CYAN='\033[96m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

log() { echo -e "${CYAN}✦ $*${RESET}"; }
ok() { echo -e "${GREEN}✓ $*${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $*${RESET}"; }
fail() { echo -e "${RED}✗ $*${RESET}"; }

show_help() {
  cat <<'HELP'
GestaltView Agent Trainer helper

Usage:
  bash agent_trainer.sh <command> [args]

Commands:
  setup       Install Python requirements and JS dependencies
  py          Install Python requirements only
  js          Install package.json dependencies only
  status      Show environment, git, and trainer surface status
  dev         Start the Vite dev server
  build       Run the production build
  test        Run focused Agent Trainer/Billy/dashboard tests
  worker      Start the trainer worker
  ingest      Run agent-trainer corpus ingestion; extra args are passed through
  health      Run repo health check
  manifest    Regenerate repo manifest
  help        Show this help

Examples:
  bash agent_trainer.sh setup
  bash agent_trainer.sh test
  bash agent_trainer.sh ingest -- --no-embed
  bash agent_trainer.sh worker
HELP
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
    exit 1
  fi
}

show_status() {
  log "Agent Trainer environment"
  echo "Repo: $ROOT_DIR"
  echo "Node: $(node --version 2>/dev/null || echo 'missing')"
  echo "npm: $(npm --version 2>/dev/null || echo 'missing')"
  echo "pnpm: $(pnpm --version 2>/dev/null || echo 'missing')"
  echo "Python: $(python3 --version 2>/dev/null || echo 'missing')"
  echo ""

  log "Git"
  git status --short || true
  echo ""

  log "Key files"
  for file in package.json requirements.txt agent_trainer.sh client/src/features/agent-trainer/AgentTrainerPage.tsx docs/CurrentState.md Tuesday.md; do
    if [[ -f "$file" ]]; then
      ok "$file"
    else
      warn "$file missing"
    fi
  done
}

install_python() {
  require_cmd python3
  log "Installing Python requirements"
  python3 -m pip install -r requirements.txt
  ok "Python requirements installed"
}

install_js() {
  require_cmd npm
  log "Installing package.json dependencies"
  npm install
  ok "JS dependencies installed"
}

run_tests() {
  log "Running focused trainer/Billy/dashboard tests"
  pnpm exec vitest run --config vitest.api.config.ts \
    api/__tests__/billy-runtime.test.ts \
    api/__tests__/billy.test.ts \
    api/__tests__/dashboard.test.ts \
    api/__tests__/trainer-study-sources-recommendations-route.test.ts \
    api/__tests__/trainer-study-sources.test.ts
}

command="${1:-help}"
shift || true

case "$command" in
  setup)
    install_python
    install_js
    ;;
  py|python)
    install_python
    ;;
  js|node)
    install_js
    ;;
  status)
    show_status
    ;;
  dev)
    exec npm run dev -- "$@"
    ;;
  build)
    exec npm run build
    ;;
  test)
    run_tests
    ;;
  worker)
    exec npm run trainer:worker
    ;;
  ingest)
    exec npm run ingest:agent-trainer -- "$@"
    ;;
  health)
    exec npm run health
    ;;
  manifest)
    exec npm run manifest
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    fail "Unknown command: $command"
    echo ""
    show_help
    exit 1
    ;;
esac
