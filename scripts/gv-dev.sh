#!/usr/bin/env bash
# =============================================================================
# gv-dev.sh — GestaltView CLI Dev Wrapper
# © 2026 Keith Soyka / GestaltView
#
# Developer-friendly launcher for gv.sh:
#   • Optional --debug for verbose bash tracing
#   • Quick env + provider sanity checks
#   • Mirrors SymbioCoder / CSI Nexus health patterns
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GV_SCRIPT="$SCRIPT_DIR/scripts/gv.sh"

NEON_CYAN='\033[96m'
NEON_PINK='\033[95m'
NEON_TEAL='\033[38;5;51m'
NEON_GOLD='\033[38;5;220m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

DEBUG_MODE=false
PASSTHRU_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --debug)
      DEBUG_MODE=true
      shift
      ;;
    *)
      PASSTHRU_ARGS+=("$1")
      shift
      ;;
  esac
done

if [[ ! -x "$GV_SCRIPT" ]]; then
  echo -e "${RED}✗ gv.sh not found or not executable at:${RESET} $GV_SCRIPT"
  echo -e "${DIM}  Make sure you're inside gestaltview-v2 and run: chmod +x scripts/gv.sh${RESET}"
  exit 1
fi

echo -e "${NEON_TEAL}${BOLD}GestaltView Dev Wrapper — Consciousness Engine${RESET}"
echo -e "${DIM}Repo: gestaltview-v2 | Script: scripts/gv.sh${RESET}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Quick Env Snapshot
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}Env snapshot:${RESET}"
[[ -n "${GROQ_API_KEY:-}" ]]     && echo -e "  ${GREEN}✓${RESET} GROQ_API_KEY set"     || echo -e "  ${YELLOW}•${RESET} GROQ_API_KEY missing (Groq disabled)"
[[ -n "${GOOGLE_API_KEY:-${GEMINI_API_KEY:-${VITE_GEMINI_API_KEY:-}}}" ]] && echo -e "  ${GREEN}✓${RESET} Gemini key present" || echo -e "  ${YELLOW}•${RESET} Gemini key missing (Gemini disabled)"
[[ -n "${OPENAI_API_KEY:-}" ]]   && echo -e "  ${GREEN}✓${RESET} OPENAI_API_KEY set"   || echo -e "  ${YELLOW}•${RESET} OPENAI_API_KEY missing (paid fallback off)"
[[ -n "${HUGGINGFACE_API_KEY:-${VITE_HUGGINGFACE_API_KEY:-}}" ]] && echo -e "  ${GREEN}✓${RESET} HuggingFace key present" || echo -e "  ${YELLOW}•${RESET} HF key missing (HF adapters off)"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Quick Provider Health
# ─────────────────────────────────────────────────────────────────────────────
OLLAMA_HOST="${OLLAMA_BASE_URL:-${OLLAMA_HOST:-http://localhost:11434}}"

echo -e "${BOLD}Provider quick health:${RESET}"

if command -v curl &>/dev/null; then
  if curl -sf "$OLLAMA_HOST/api/tags" >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${RESET} Ollama reachable at ${DIM}$OLLAMA_HOST${RESET}"
  else
    echo -e "  ${YELLOW}•${RESET} Ollama not responding at ${DIM}$OLLAMA_HOST${RESET}"
    echo -e "    ${DIM}Run: ollama serve${RESET}"
  fi
else
  echo -e "  ${YELLOW}•${RESET} curl missing — provider checks limited"
fi

if command -v git &>/dev/null; then
  last_commit="$(git -C "$SCRIPT_DIR" log --oneline -1 2>/dev/null || echo 'no git history')"
  echo -e "  ${DIM}Last commit:${RESET} $last_commit"
fi

echo ""
if [[ "$DEBUG_MODE" == true ]]; then
  echo -e "${NEON_GOLD}${BOLD}Debug mode ENABLED — bash tracing on.${RESET}"
  echo -e "${DIM}This will echo internal commands from gv.sh for troubleshooting.${RESET}"
  echo ""
  set -x
fi

exec "$GV_SCRIPT" "${PASSTHRU_ARGS[@]}"
