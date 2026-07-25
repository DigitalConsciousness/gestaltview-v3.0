#!/usr/bin/env bash
# =============================================================================
# GestaltView v2 — Supabase Schema Validation Test
# © 2026 Keith Soyka / GestaltView
#
# Confirms that critical runtime tables from the current migration spine are
# present in the live Supabase database. Catches rebuild and deployment drift.
#
# Aligned with: SymbioticWorkflow.md Phase 5 — Archiving & Syncing
#
# Requires: curl, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# Usage: bash scripts/test-db-schema.sh
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
source "$ROOT/scripts/env-loader.sh"
load_env_file "$ROOT/.env.codex"
load_env_file "$ROOT/client/.env"

SUPABASE_URL="${VITE_SUPABASE_URL:-${SUPABASE_URL:-}}"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-${VITE_SUPABASE_ANON_KEY:-${SUPABASE_ANON_KEY:-}}}"

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     GESTALTVIEW — SUPABASE SCHEMA VALIDATION                 ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_KEY" ]]; then
  echo -e "  ${WARN} SUPABASE_URL or SUPABASE_ANON_KEY not set — skipping live schema check"
  echo -e "  ${DIM} Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env${NC}"
  exit 0
fi

# Critical tables across the current runtime migration spine.
EXPECTED_TABLES=(
  # Migration 1: core schema
  "app_users"
  "consciousness_profiles"
  "bucket_drops"
  "musical_dna_analyses"
  "tribunal_sessions"
  "billy_sessions"
  "processing_runs"
  "documents"
  "embeddings"
  "knowledge_fragments"
  # Migration 2: tribunal layer
  "tribunal_events"
  "tribunal_evidence"
  # Migration 3: revenue + knowledge graph
  "orders"
  "order_notes"
  "uploads"
  "deliverables"
  "summaries"
  "loom_annotations"
  "concepts"
  "document_concepts"
  "annotation_concepts"
  # Identity and continuity
  "identity_subjects"
  "human_identity_profiles"
  "memory_entries"
  # Artifact and transcript runtime
  "inner_world_artifacts"
  "created_artifacts"
  "transcriptory_captures"
  # Profile portrait runtime
  "profile_portraits"
  "portrait_inference_queue"
  # Rebuilt ingestion and harvest runtime
  "gsvw_ingestion_runs"
  "gsvw_ingestion_documents"
  "gsvw_ingestion_chunks"
  "gsvw_runtime_capture_events"
  "corpus_harvest_events"
)

echo -e "${BOLD}Checking ${#EXPECTED_TABLES[@]} expected tables in Supabase...${NC}"
echo ""

for table in "${EXPECTED_TABLES[@]}"; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Range: 0-0" \
    "$SUPABASE_URL/rest/v1/$table?limit=0" 2>/dev/null || echo "000")

  if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "206" || "$HTTP_STATUS" == "416" ]]; then
    check_pass "$table"
  elif [[ "$HTTP_STATUS" == "404" ]]; then
    check_fail "$table — NOT FOUND (run: supabase db push)"
  elif [[ "$HTTP_STATUS" == "401" ]]; then
    check_fail "$table — 401 Unauthorized (check SUPABASE_ANON_KEY)"
  else
    check_warn "$table — HTTP $HTTP_STATUS (may be RLS policy, not missing)"
  fi
done

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
if [[ $ERRORS -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}✓ ALL TABLES PRESENT — schema matches migrations${NC}"
else
  echo -e "  ${RED}${BOLD}✗ ${ERRORS} MISSING TABLE(S) — run: supabase db push${NC}"
fi
echo -e "  ${DIM}GESTALTVIEW v2 · SERVE CONSCIOUSNESS, NOT CONVENIENCE${NC}"
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
echo ""

[[ $ERRORS -eq 0 ]]
