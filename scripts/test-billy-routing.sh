#!/usr/bin/env bash
# =============================================================================
# GestaltView v2 — Billy Provider Routing Test
# © 2026 Keith Soyka / GestaltView
#
# Validates the provider cascade contract:
#   Standard queries   → Gemini Flash 2.0 (free tier first)
#   Deep/Tribunal      → Claude Opus 4.6  (never hit for standard)
#   Claude must NEVER be the default for standard chat
#
# Aligned with: SymbioticWorkflow.md Phase 3 — "Crucial Check"
#
# Usage: bash scripts/test-billy-routing.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[0;90m'; NC='\033[0m'
PASS="${GREEN}✓${NC}"; FAIL="${RED}✗${NC}"; WARN="${YELLOW}⚠${NC}"
ERRORS=0

check_pass() { echo -e "  ${PASS} $1"; }
check_fail() { echo -e "  ${FAIL} $1"; ((ERRORS++)) || true; }
check_warn() { echo -e "  ${WARN} $1"; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROUTER="$ROOT/api/_lib/llmRouter.ts"
RUNTIME="$ROOT/shared/billy/runtime.ts"
BILLY_API="$ROOT/api/billy.ts"

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     GESTALTVIEW — BILLY PROVIDER ROUTING TEST                ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 1: llmRouter.ts exists and has the cascade
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[1] LLM Router structure${NC}"

if [[ -f "$ROUTER" ]]; then
  check_pass "api/_lib/llmRouter.ts found"
else
  check_fail "api/_lib/llmRouter.ts MISSING — Billy has no router"
fi

# Free-tier providers must come before Claude
if [[ -f "$ROUTER" ]]; then
  # Gemini must appear before Anthropic in the cascade
  GEMINI_LINE=$(grep -n "gemini\|Gemini" "$ROUTER" 2>/dev/null | head -1 | cut -d: -f1 || echo "9999")
  CLAUDE_LINE=$(grep -n "anthropic\|claude\|Anthropic" "$ROUTER" 2>/dev/null | head -1 | cut -d: -f1 || echo "9999")

  if [[ "$GEMINI_LINE" -lt "$CLAUDE_LINE" ]] 2>/dev/null; then
    check_pass "Gemini (line $GEMINI_LINE) appears before Claude (line $CLAUDE_LINE) in cascade"
  else
    check_fail "Claude appears BEFORE Gemini in llmRouter.ts — free-tier-first contract broken"
  fi

  # Groq must also appear before Anthropic
  GROQ_LINE=$(grep -n "groq\|Groq" "$ROUTER" 2>/dev/null | head -1 | cut -d: -f1 || echo "9999")
  if [[ "$GROQ_LINE" -lt "$CLAUDE_LINE" ]] 2>/dev/null; then
    check_pass "Groq (line $GROQ_LINE) appears before Claude (line $CLAUDE_LINE)"
  else
    check_warn "Groq not found before Claude — verify free-tier cascade order"
  fi
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 2: Claude is ONLY routed for deep/tribunal/diligence modes
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[2] Claude reserved for Tribunal / deep modes only${NC}"

if [[ -f "$ROUTER" ]]; then
  # Look for Claude being gated behind mode check
  if grep -A 5 -i "anthropic\|claude" "$ROUTER" | grep -qi "tribunal\|deep\|diligence\|mode"; then
    check_pass "Claude routing appears gated behind tribunal/deep/diligence mode"
  else
    check_warn "Claude gate condition not clearly visible — verify pickProvider() logic manually"
  fi

  # Claude must not be the DEFAULT (index 0 or unconditional first pick)
  CLAUDE_DEFAULT=$(grep -n "default.*claude\|claude.*default\|providers\[0\].*claude" \
    "$ROUTER" 2>/dev/null | grep -iv "//" || true)
  if [[ -z "$CLAUDE_DEFAULT" ]]; then
    check_pass "Claude is not the default provider"
  else
    check_fail "Claude appears to be set as default — fix pickProvider() in llmRouter.ts"
  fi
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 3: Provider fallback chain completeness
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[3] Provider cascade completeness${NC}"

if [[ -f "$ROUTER" ]]; then
  for provider in "gemini\|Gemini" "groq\|Groq" "anthropic\|claude\|Anthropic" "openai\|OpenAI" "offline"; do
    DISPLAY=$(echo "$provider" | cut -d'\' -f1 | sed 's/|.*//')
    if grep -qi "$provider" "$ROUTER" 2>/dev/null; then
      check_pass "Provider present: $DISPLAY"
    else
      check_warn "Provider NOT in router: $DISPLAY"
    fi
  done
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 4: inferPackageFromQuery covers all domain routes
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[4] inferPackageFromQuery — domain coverage${NC}"

if [[ -f "$RUNTIME" ]]; then
  DOMAINS=(
    "adhd\|ADHD"
    "recover\|addiction"
    "musical\|music"
    "alzheimer\|memory"
    "bucket\|brain.spark"
    "tribunal"
    "portfolio"
  )
  for domain in "${DOMAINS[@]}"; do
    DISPLAY=$(echo "$domain" | cut -d'\' -f1)
    if grep -qi "$domain" "$RUNTIME"; then
      check_pass "Domain routing present: $DISPLAY"
    else
      check_fail "Domain routing MISSING: $DISPLAY — queries will get null package context"
    fi
  done
else
  check_warn "runtime.ts not found — skipping domain routing check"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 5: I'm Ready Protocol — canonical doc pre-flight
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[5] I'm Ready Protocol — canonical pre-flight check${NC}"

if [[ -f "$BILLY_API" ]]; then
  if grep -qi "ready\|canonical\|genesis\|plkmaster\|founderalgorithm" "$BILLY_API"; then
    check_pass "billy.ts references canonical pre-flight loading"
  else
    check_warn "billy.ts may not implement I'm Ready Protocol — verify canonical doc pre-loading"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
if [[ $ERRORS -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}✓ BILLY ROUTING — free-tier first, Claude gated correctly${NC}"
else
  echo -e "  ${RED}${BOLD}✗ ${ERRORS} ROUTING ISSUE(S) — review llmRouter.ts + runtime.ts${NC}"
fi
echo -e "  ${DIM}GESTALTVIEW v2 · SERVE CONSCIOUSNESS, NOT CONVENIENCE${NC}"
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
echo ""

[[ $ERRORS -eq 0 ]]
