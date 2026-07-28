#!/usr/bin/env bash
# Billy local wrapper (Groq → Gemini → Ollama cascade)
# © 2026 Keith Soyka / GestaltView

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-${BILLY_MODE:-synthesis}}"

exec bash "$REPO_ROOT/scripts/gv.sh" --billy --mode "$MODE"
