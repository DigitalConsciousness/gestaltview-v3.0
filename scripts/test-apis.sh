#!/usr/bin/env bash
# =============================================================================
# GestaltView v2 — API Connectivity Test
# © 2026 Keith Soyka / GestaltView
#
# Usage:  bash scripts/test-apis.sh
#
# Tests live connectivity to: Gemini Flash 2.0, Supabase, OpenAI (optional)
# Requires curl. Reads from client/.env automatically.
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; DIM='\033[0;90m'; BOLD='\033[1m'; NC='\033[0m'

PASS="${GREEN}✓${NC}"; FAIL="${RED}✗${NC}"; WARN="${YELLOW}⚠${NC}"
ERRORS=0

check_pass() { echo -e "  ${PASS} $1"; }
check_fail() { echo -e "  ${FAIL} $1"; ((ERRORS++)) || true; }
check_warn() { echo -e "  ${WARN} $1"; }

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     GESTALTVIEW v2 — API CONNECTIVITY TEST       ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Load .env
if [[ -f "client/.env" ]]; then
  set -a
  source client/.env
  set +a
else
  echo -e "  ${FAIL} client/.env not found — cannot run API tests"
  exit 1
fi

if ! command -v curl &>/dev/null; then
  echo -e "  ${FAIL} curl not found — install curl to run API tests"
  exit 1
fi

# ── Test 1: Gemini Flash 2.0 (Billy's brain) ─────────────────────────────────
echo -e "${BOLD}[1/3] Gemini Flash 2.0 (Billy's brain)${NC}"

if [[ -z "${VITE_GEMINI_API_KEY:-}" ]]; then
  check_fail "VITE_GEMINI_API_KEY not set — skipping"
else
  GEMINI_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${VITE_GEMINI_API_KEY}"
  GEMINI_PAYLOAD='{"contents":[{"role":"user","parts":[{"text":"Say OK"}]}],"generationConfig":{"maxOutputTokens":5}}'

  HTTP_STATUS=$(curl -s -o /tmp/gv_gemini_resp.json -w "%{http_code}" \
    -X POST "$GEMINI_URL" \
    -H "Content-Type: application/json" \
    -d "$GEMINI_PAYLOAD" 2>/dev/null || echo "000")

  if [[ "$HTTP_STATUS" == "200" ]]; then
    REPLY=$(python3 -c "import json; d=json.load(open('/tmp/gv_gemini_resp.json')); print(d.get('candidates',[{}])[0].get('content',{}).get('parts',[{}])[0].get('text','?'))" 2>/dev/null || echo "(parsed ok)")
    check_pass "Gemini Flash 2.0 responded HTTP 200 → \"$REPLY\""
  elif [[ "$HTTP_STATUS" == "400" ]]; then
    check_fail "Gemini returned 400 — check VITE_GEMINI_API_KEY or request format"
    cat /tmp/gv_gemini_resp.json | python3 -m json.tool 2>/dev/null | head -10 || cat /tmp/gv_gemini_resp.json
  elif [[ "$HTTP_STATUS" == "403" ]]; then
    check_fail "Gemini returned 403 — API key invalid or quota policy denied"
  elif [[ "$HTTP_STATUS" == "429" ]]; then
    check_fail "Gemini returned 429 — quota exhausted or free-tier requests unavailable"
    cat /tmp/gv_gemini_resp.json | python3 -m json.tool 2>/dev/null | head -12 || cat /tmp/gv_gemini_resp.json
  else
    check_fail "Gemini returned HTTP $HTTP_STATUS — unexpected response"
    cat /tmp/gv_gemini_resp.json 2>/dev/null | head -5 || true
  fi
fi

echo ""

# ── Test 2: Supabase ─────────────────────────────────────────────────────────
echo -e "${BOLD}[2/3] Supabase${NC}"

if [[ -z "${VITE_SUPABASE_URL:-}" || -z "${VITE_SUPABASE_ANON_KEY:-}" ]]; then
  check_fail "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — skipping"
else
  SUPA_URL="${VITE_SUPABASE_URL%/}/rest/v1/knowledge_fragments?select=id&limit=1"
  HTTP_STATUS=$(curl -s -o /tmp/gv_supabase_resp.json -w "%{http_code}" \
    -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
    "$SUPA_URL" 2>/dev/null || echo "000")

  if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "206" || "$HTTP_STATUS" == "416" ]]; then
    check_pass "Supabase knowledge_fragments endpoint reachable (HTTP $HTTP_STATUS)"
  elif [[ "$HTTP_STATUS" == "401" ]]; then
    check_fail "Supabase returned 401 — check VITE_SUPABASE_ANON_KEY"
  elif [[ "$HTTP_STATUS" == "404" ]]; then
    check_fail "Supabase returned 404 — knowledge_fragments table or REST path missing"
  else
    check_fail "Supabase returned HTTP $HTTP_STATUS"
    cat /tmp/gv_supabase_resp.json 2>/dev/null | head -10 || true
  fi
fi

echo ""

# ── Test 3: OpenAI (optional fallback) ───────────────────────────────────────
echo -e "${BOLD}[3/3] OpenAI (optional fallback)${NC}"

if [[ -z "${VITE_OPENAI_API_KEY:-}" ]]; then
  check_warn "VITE_OPENAI_API_KEY not set — OpenAI fallback disabled (OK if using Gemini only)"
else
  HTTP_STATUS=$(curl -s -o /tmp/gv_oai_resp.json -w "%{http_code}" \
    -H "Authorization: Bearer ${VITE_OPENAI_API_KEY}" \
    "https://api.openai.com/v1/models" 2>/dev/null || echo "000")

  if [[ "$HTTP_STATUS" == "200" ]]; then
    check_pass "OpenAI API reachable (HTTP 200)"
  elif [[ "$HTTP_STATUS" == "401" ]]; then
    check_fail "OpenAI returned 401 — check VITE_OPENAI_API_KEY"
  else
    check_fail "OpenAI returned HTTP $HTTP_STATUS"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════${NC}"
if [[ $ERRORS -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}ALL API TESTS PASSED${NC} — the Loom is connected ✓"
else
  echo -e "  ${RED}${BOLD}$ERRORS TEST(S) FAILED${NC} — fix API keys before going live"
fi
echo -e "  ${DIM}GESTALTVIEW v2 · SERVE CONSCIOUSNESS, NOT CONVENIENCE${NC}"
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════${NC}"
echo ""

[[ $ERRORS -eq 0 ]]
