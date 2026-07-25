#!/usr/bin/env bash
# Claude Code via Ollama wrapper
# © 2026 Keith Soyka / GestaltView

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODEL="${1:-${OLLAMA_MODEL:-qwen2.5-coder:7b}}"

exec bash "$REPO_ROOT/scripts/gv.sh" --claude --model "$MODEL"
