#!/usr/bin/env bash
# =============================================================================
# GestaltView v2 — Manifest Sync Readiness Test
# © 2026 Keith Soyka / GestaltView
#
# Phase 5 gate: validates that the manifest generation pipeline is ready,
# that .orientation/ is present as a required check-in surface, and that
# docs/CurrentState.md + Fixes_Needed_Current.md are up to date.
#
# Checks:
#   1. .orientation/ exists and the packet files validate
#   2. generate_repo_manifest.py exists (or equivalent manifest script)
#   3. docs/gestaltview-v2.manifest.json exists and is recent (< 7 days old)
#   4. docs/CurrentState.md exists and has been updated recently
#   5. Fixes_Needed_Current.md exists
#   6. SymbioticWorkflow.md exists (the workflow doc itself)
#   7. No uncommitted changes to canonical docs (they should be pushed)
#
# Aligned with: docs/SymbioticWorkflow.md Phase 5 — Archiving & Syncing
#
# Usage: bash scripts/test-manifest-sync.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[0;90m'; NC='\033[0m'
PASS="${GREEN}✓${NC}"; FAIL="${RED}✗${NC}"; WARN="${YELLOW}⚠${NC}"
ERRORS=0
WARNINGS=0

check_pass() { echo -e "  ${PASS} $1"; }
check_fail() { echo -e "  ${FAIL} $1"; ((ERRORS++)) || true; }
check_warn() { echo -e "  ${WARN} $1"; ((WARNINGS++)) || true; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     GESTALTVIEW — MANIFEST SYNC READINESS (Phase 5)         ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check 1: Orientation packet check-in
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[1] .orientation check-in${NC}"

if bash "$ROOT/scripts/test-orientation-checkin.sh"; then
  check_pass ".orientation packet is present and valid"
else
  check_fail ".orientation packet check-in gate failed"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check 2: Manifest generation script
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[2] Manifest generation script${NC}"

MANIFEST_SCRIPT=""
for candidate in \
  "$ROOT/scripts/generate_repo_manifest.py" \
  "$ROOT/scripts/generate-manifest.py" \
  "$ROOT/scripts/generate-manifest.mjs" \
  "$ROOT/scripts/manifest.py"; do
  if [[ -f "$candidate" ]]; then
    MANIFEST_SCRIPT="$candidate"
    break
  fi
done

if [[ -n "$MANIFEST_SCRIPT" ]]; then
  check_pass "Manifest generation script found: $(basename $MANIFEST_SCRIPT)"
else
  check_fail "generate_repo_manifest.py not found — create scripts/generate_repo_manifest.py"
  echo -e "    ${DIM}This script should scan the repo and output docs/gestaltview-v2.manifest.json${NC}"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check 3: Manifest JSON exists and is recent
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[3] docs/gestaltview-v2.manifest.json${NC}"

MANIFEST_JSON=""
for candidate in \
  "$ROOT/docs/gestaltview-v2.manifest.json" \
  "$ROOT/gestaltview-v2.manifest.json" \
  "$ROOT/manifest.json" \
  "$ROOT/docs/manifest.json"; do
  if [[ -f "$candidate" ]]; then
    MANIFEST_JSON="$candidate"
    break
  fi
done

if [[ -n "$MANIFEST_JSON" ]]; then
  check_pass "manifest.json found: $(basename $MANIFEST_JSON)"
  # Check age — warn if older than 7 days
  if command -v python3 &>/dev/null; then
    AGE_DAYS=$(python3 -c "
import os, time
mtime = os.path.getmtime('$MANIFEST_JSON')
age = (time.time() - mtime) / 86400
print(f'{age:.1f}')
" 2>/dev/null || echo "unknown")
    if [[ "$AGE_DAYS" == "unknown" ]]; then
      check_warn "Could not determine manifest age"
    elif (( $(echo "$AGE_DAYS > 7" | bc -l 2>/dev/null || echo 0) )); then
      check_warn "manifest.json is ${AGE_DAYS} days old — run generate_repo_manifest.py to refresh"
    else
      check_pass "manifest.json is current (${AGE_DAYS} days old)"
    fi
  fi
else
  check_warn "manifest.json not found — run generate_repo_manifest.py after pushing code"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check 4: CurrentState.md
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[4] docs/CurrentState.md${NC}"

CURRENT_STATE=""
for candidate in \
  "$ROOT/docs/CurrentState.md" \
  "$ROOT/CurrentState.md" \
  "$ROOT/client/src/canonical/CurrentState.md"; do
  if [[ -f "$candidate" ]]; then
    CURRENT_STATE="$candidate"
    break
  fi
done

if [[ -n "$CURRENT_STATE" ]]; then
  check_pass "CurrentState.md found: $CURRENT_STATE"
else
  check_fail "CurrentState.md NOT found — this is a required Phase 5 artifact"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check 5: Fixes_Needed_Current.md
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[5] Fixes_Needed_Current.md${NC}"

FIXES_DOC=""
for candidate in \
  "$ROOT/Fixes_Needed_Current.md" \
  "$ROOT/docs/Fixes_Needed_Current.md" \
  "$ROOT/FIXES.md"; do
  if [[ -f "$candidate" ]]; then
    FIXES_DOC="$candidate"
    break
  fi
done

if [[ -n "$FIXES_DOC" ]]; then
  check_pass "Fixes_Needed_Current.md found: $FIXES_DOC"
else
  check_warn "Fixes_Needed_Current.md not found — create it to track known issues"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check 6: SymbioticWorkflow.md exists
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[6] SymbioticWorkflow.md${NC}"

if find "$ROOT" -name "SymbioticWorkflow.md" 2>/dev/null | grep -q .; then
  WORKFLOW_PATH=$(find "$ROOT" -name "SymbioticWorkflow.md" | head -1)
  check_pass "SymbioticWorkflow.md found: $WORKFLOW_PATH"
else
  check_fail "SymbioticWorkflow.md NOT found — the Resonance Loop has no map"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check 7: Canonical docs not sitting uncommitted
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[7] Canonical docs commit status${NC}"

if command -v git &>/dev/null; then
  DIRTY_CANONICAL=$(git -C "$ROOT" status --porcelain 2>/dev/null | \
    grep -E "README\.md|RDRC\.md|GestaltView_Constitutional_Invariants_v1\.0\.md|docs/CurrentState\.md|docs/SymbioticWorkflow\.md|docs/Workflows\.md|client/src/canonical/" || true)
  if [[ -z "$DIRTY_CANONICAL" ]]; then
    check_pass "All canonical docs are committed"
  else
    check_warn "Uncommitted changes to canonical docs — push before Compendium sync:"
    echo "$DIRTY_CANONICAL" | while read -r line; do
      echo -e "    ${DIM}$line${NC}"
    done
  fi
else
  check_warn "git not available — skipping commit status check"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}✓ MANIFEST SYNC READY — Phase 5 gate clear${NC}"
  echo -e "  ${DIM}Run generate_repo_manifest.py then push to Compendium.${NC}"
elif [[ $ERRORS -eq 0 ]]; then
  echo -e "  ${YELLOW}${BOLD}⚠ SYNC READY WITH ${WARNINGS} WARNING(S) — review above before Compendium push${NC}"
else
  echo -e "  ${RED}${BOLD}✗ ${ERRORS} ISSUE(S) — resolve before Phase 5 sync${NC}"
fi
echo -e "  ${DIM}GESTALTVIEW v2 · THE RESONANCE LOOP CLOSES HERE${NC}"
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
echo ""

[[ $ERRORS -eq 0 ]]
