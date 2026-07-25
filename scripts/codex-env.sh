#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/scripts/env-loader.sh"
load_repo_env "$REPO_ROOT"

if [[ $# -eq 0 ]]; then
  echo "usage: bash scripts/codex-env.sh <command> [args...]" >&2
  exit 1
fi

exec "$@"
