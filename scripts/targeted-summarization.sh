#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$ROOT_DIR/scripts"

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

load_env_file "$ROOT_DIR/.env.local"
load_env_file "$ROOT_DIR/.env"

SPEC="${1:-}"

usage() {
  cat <<'EOF'
Usage:
  scripts/targeted-summarization.sh [core-docs|agent-trainer|mixed|all]

Profiles:
  core-docs      Run targeted docs-only summarization windows
  agent-trainer   Run targeted agent_trainer summarization windows
  mixed           Run mixed corpus windows
  all             Run all three profiles in sequence
EOF
}

run_spec() {
  local spec_path="$1"
  echo "Running ${spec_path}"
  python3 "$SCRIPT_DIR/synthesize_corpus.py" --run-spec "$spec_path"
}

case "$SPEC" in
  "")
    usage
    exit 0
    ;;
  core-docs)
    run_spec "$ROOT_DIR/gil/targeted-summarization-core-docs.yml"
    ;;
  agent-trainer)
    run_spec "$ROOT_DIR/gil/targeted-summarization-agent-trainer.yml"
    ;;
  mixed)
    run_spec "$ROOT_DIR/gil/targeted-summarization-mixed.yml"
    ;;
  all)
    run_spec "$ROOT_DIR/gil/targeted-summarization-core-docs.yml"
    run_spec "$ROOT_DIR/gil/targeted-summarization-agent-trainer.yml"
    run_spec "$ROOT_DIR/gil/targeted-summarization-mixed.yml"
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    echo "Unknown profile: $SPEC" >&2
    usage >&2
    exit 1
    ;;
esac
