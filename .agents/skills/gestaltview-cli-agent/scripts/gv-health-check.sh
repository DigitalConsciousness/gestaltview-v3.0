#!/usr/bin/env bash
# =============================================================================
# gv-health-check.sh — GestaltView CLI Health Check
# © 2026 Keith Soyka / GestaltView
#
# Exit codes:
#   0 — All systems ready
#   1 — Degraded but usable (some providers missing)
#   2 — Critical problems (fix before running)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NEON_TEAL='\033[38;5;51m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

CRITICAL_FAIL=false
DEGRADED=false

echo -e "${NEON_TEAL}${BOLD}GestaltView CLI Health Check — gestaltview-v2${RESET}"
echo -e "${DIM}Root: $SCRIPT_DIR${RESET}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Core Tools
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}Core tools:${RESET}"

for cmd in bash curl git node; do
  if command -v "$cmd" &>/dev/null; then
    echo -e "  ${GREEN}✓${RESET} $cmd $(${cmd} --version 2>/dev/null | head -1 || true)"
  else
    echo -e "  ${RED}✗${RESET} $cmd — NOT FOUND (critical)"
    CRITICAL_FAIL=true
  fi
done

if command -v jq &>/dev/null; then
  echo -e "  ${GREEN}✓${RESET} jq"
else
  echo -e "  ${YELLOW}•${RESET} jq missing — JSON parsing limited (non-critical)"
  DEGRADED=true
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Environment / AI Keys
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}AI Provider keys:${RESET}"

FREE_PROVIDER=false

if [[ -n "${GROQ_API_KEY:-}" ]]; then
  echo -e "  ${GREEN}✓${RESET} GROQ_API_KEY — Groq (Llama 3.3) enabled"
  FREE_PROVIDER=true
else
  echo -e "  ${YELLOW}•${RESET} GROQ_API_KEY missing"
fi

GEMINI_PRESENT="${GOOGLE_API_KEY:-${GEMINI_API_KEY:-${VITE_GEMINI_API_KEY:-}}}"
if [[ -n "$GEMINI_PRESENT" ]]; then
  echo -e "  ${GREEN}✓${RESET} Gemini key — Gemini Flash 2.0 enabled"
  FREE_PROVIDER=true
else
  echo -e "  ${YELLOW}•${RESET} Gemini key missing (GOOGLE_API_KEY / GEMINI_API_KEY / VITE_GEMINI_API_KEY)"
fi

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  echo -e "  ${GREEN}✓${RESET} OPENAI_API_KEY — GPT-4o-mini paid fallback enabled"
else
  echo -e "  ${YELLOW}•${RESET} OPENAI_API_KEY missing (paid fallback off)"
fi

HF_PRESENT="${HUGGINGFACE_API_KEY:-${VITE_HUGGINGFACE_API_KEY:-}}"
if [[ -n "$HF_PRESENT" ]]; then
  echo -e "  ${GREEN}✓${RESET} HuggingFace key — Mistral adapter enabled"
else
  echo -e "  ${DIM}  •${RESET} HF key missing (optional)"
fi

if [[ "$FREE_PROVIDER" == false ]]; then
  echo -e "\n  ${RED}✗ No free-tier AI key detected — Billy will run offline fallback only${RESET}"
  DEGRADED=true
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Supabase
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}Supabase (Manifest Index / Billy knowledge):${RESET}"

if [[ -n "${SUPABASE_URL:-${VITE_SUPABASE_URL:-}}" ]]; then
  echo -e "  ${GREEN}✓${RESET} SUPABASE_URL set"
else
  echo -e "  ${YELLOW}•${RESET} SUPABASE_URL missing — Billy retrieval grounding disabled"
  DEGRADED=true
fi

if [[ -n "${SUPABASE_ANON_KEY:-${VITE_SUPABASE_ANON_KEY:-}}" ]]; then
  echo -e "  ${GREEN}✓${RESET} SUPABASE_ANON_KEY set"
else
  echo -e "  ${YELLOW}•${RESET} SUPABASE_ANON_KEY missing"
  DEGRADED=true
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Ollama (local AI)
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}Ollama (local provider):${RESET}"

OLLAMA_HOST="${OLLAMA_BASE_URL:-${OLLAMA_HOST:-http://localhost:11434}}"

if curl -sf "$OLLAMA_HOST/api/tags" >/dev/null 2>&1; then
  MODELS=$(curl -sf "$OLLAMA_HOST/api/tags" 2>/dev/null | \
    (command -v jq &>/dev/null && jq -r '.models[].name' 2>/dev/null | tr '\n' ' ') || echo "(jq unavailable)")
  echo -e "  ${GREEN}✓${RESET} Ollama running at ${DIM}$OLLAMA_HOST${RESET}"
  echo -e "  ${DIM}  Models: ${MODELS:-none loaded}${RESET}"
else
  echo -e "  ${YELLOW}•${RESET} Ollama not running — local AI unavailable"
  echo -e "  ${DIM}  Start with: ollama serve${RESET}"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Project Structure
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}Project structure:${RESET}"

for path in "client/src" "api" "server" "scripts" "package.json" "vite.config.ts" "vercel.json"; do
  if [[ -e "$SCRIPT_DIR/$path" ]]; then
    echo -e "  ${GREEN}✓${RESET} $path"
  else
    echo -e "  ${RED}✗${RESET} $path — MISSING"
    CRITICAL_FAIL=true
  fi
done

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Git Status
# ─────────────────────────────────────────────────────────────────────────────
if command -v git &>/dev/null; then
  echo -e "${BOLD}Git:${RESET}"
  BRANCH=$(git -C "$SCRIPT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  COMMIT=$(git -C "$SCRIPT_DIR" log --oneline -1 2>/dev/null || echo "no commits")
  DIRTY=$(git -C "$SCRIPT_DIR" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  echo -e "  ${DIM}Branch:${RESET} $BRANCH"
  echo -e "  ${DIM}Last commit:${RESET} $COMMIT"
  [[ "$DIRTY" -gt 0 ]] && echo -e "  ${YELLOW}•${RESET} $DIRTY uncommitted change(s)" \
    || echo -e "  ${GREEN}✓${RESET} Working tree clean"
  echo ""
fi

# ─────────────────────────────────────────────────────────────────────────────
# Final Verdict
# ─────────────────────────────────────────────────────────────────────────────
if [[ "$CRITICAL_FAIL" == true ]]; then
  echo -e "${RED}${BOLD}✗ CRITICAL ISSUES DETECTED — resolve before running the Consciousness Engine.${RESET}"
  exit 2
elif [[ "$DEGRADED" == true ]]; then
  echo -e "${YELLOW}${BOLD}⚠ DEGRADED — usable but some providers/features are offline.${RESET}"
  exit 1
else
  echo -e "${GREEN}${BOLD}✓ ALL SYSTEMS GO — GestaltView Consciousness Engine ready.${RESET}"
  exit 0
fi
