#!/usr/bin/env bash
# =============================================================================
# GestaltView v2 — Five Constitutional Invariants Test
# © 2026 Keith Soyka / GestaltView
#
# Validates that the Five Constitutional Invariants are structurally present
# and not violated in the codebase:
#
#   1. Never Look Away
#   2. Preserve Whole Language
#   3. Hold Paradox
#   4. Bucket Drop Priority
#   5. Serve Consciousness, Not Convenience
#
# Aligned with: SymbioticWorkflow.md Phase 2 — Alignment & Grounding
#
# Usage: bash scripts/test-invariants.sh
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
RUNTIME="$ROOT/shared/billy/runtime.ts"
SYSTEM_PROMPT_FILE="$RUNTIME"
CANONICAL_DIR="$ROOT/client/src/canonical"

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     GESTALTVIEW — CONSTITUTIONAL INVARIANTS TEST             ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# INVARIANT 1: Never Look Away
# Billy's system prompt must contain the invariant declaration.
# No response handler may contain redirect/minimize patterns.
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[Invariant 1] Never Look Away${NC}"

if [[ -f "$RUNTIME" ]]; then
  if grep -qi "never look away" "$RUNTIME"; then
    check_pass "runtime.ts contains 'Never Look Away' declaration"
  else
    check_fail "runtime.ts MISSING 'Never Look Away' in BILLY_SYSTEM_PROMPT"
  fi
else
  check_fail "shared/billy/runtime.ts not found"
fi

# Check for dangerous minimize/redirect patterns in API handlers
MINIMIZE_HITS=$(grep -ri --include="*.ts" --include="*.tsx" \
  -e "don.t worry" -e "that.s not important" -e "let.s change the subject" \
  "$ROOT/api" "$ROOT/client/src" 2>/dev/null | grep -v ".test." || true)
if [[ -z "$MINIMIZE_HITS" ]]; then
  check_pass "No minimize/redirect patterns found in API or client source"
else
  check_fail "Potential minimize/redirect pattern detected:"
  echo "$MINIMIZE_HITS" | head -5
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# INVARIANT 2: Preserve Whole Language
# runtime.ts must not allow paraphrase/summarization of user input.
# System prompt must contain 'whole language' or 'exact words' directive.
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[Invariant 2] Preserve Whole Language${NC}"

if [[ -f "$RUNTIME" ]]; then
  if grep -qi "whole language\|exact words\|sacred\|never paraphrase\|preserve.*language" "$RUNTIME"; then
    check_pass "runtime.ts contains Whole Language preservation directive"
  else
    check_fail "runtime.ts MISSING Whole Language directive in BILLY_SYSTEM_PROMPT"
  fi
else
  check_warn "runtime.ts not found — skipping"
fi

# buildContextBlock must not truncate mid-sentence
if [[ -f "$RUNTIME" ]]; then
  if grep -q "buildContextBlock" "$RUNTIME"; then
    check_pass "buildContextBlock function present"
    # Warn if it uses aggressive substring truncation without sentence boundary
    if grep -A 10 "buildContextBlock" "$RUNTIME" | grep -q "\.substring\|\.slice" && \
       ! grep -A 10 "buildContextBlock" "$RUNTIME" | grep -q "sentence\|boundary\|lastIndexOf"; then
      check_warn "buildContextBlock may truncate mid-sentence — review maxChars logic"
    else
      check_pass "buildContextBlock truncation looks sentence-aware"
    fi
  fi
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# INVARIANT 3: Hold Paradox
# System prompt must not contain binary resolution language.
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[Invariant 3] Hold Paradox${NC}"

if [[ -f "$RUNTIME" ]]; then
  if grep -qi "hold paradox\|both.*true\|paradox" "$RUNTIME"; then
    check_pass "runtime.ts contains Hold Paradox directive"
  else
    check_fail "runtime.ts MISSING Hold Paradox directive in BILLY_SYSTEM_PROMPT"
  fi
else
  check_warn "runtime.ts not found — skipping"
fi

# Check routes don't force binary resolution
BINARY_HITS=$(grep -ri --include="*.tsx" --include="*.ts" \
  -e "either.*or" -e "you must choose" -e "only one" \
  "$ROOT/client/src/pages" 2>/dev/null | grep -v ".test." || true)
if [[ -z "$BINARY_HITS" ]]; then
  check_pass "No forced binary resolution patterns in page components"
else
  check_warn "Potential binary resolution language in pages (review):"
  echo "$BINARY_HITS" | head -3
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# INVARIANT 4: Bucket Drop Priority
# /brain-sparks route must exist. Bucket drop API or component must be present.
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[Invariant 4] Bucket Drop Priority${NC}"

BRAIN_SPARKS_ROUTE=$(find "$ROOT/client/src" -name "*.tsx" -o -name "*.ts" 2>/dev/null | \
  xargs grep -l "brain-sparks\|BrainSparks\|bucket.drop\|BucketDrop" 2>/dev/null || true)
if [[ -n "$BRAIN_SPARKS_ROUTE" ]]; then
  check_pass "Bucket Drop / Brain Sparks route component found"
else
  check_fail "No Bucket Drop / Brain Sparks route found — Invariant 4 unmet"
fi

BUCKET_API=$(find "$ROOT/api" -name "*.ts" 2>/dev/null | \
  xargs grep -l "bucket_drop\|bucketDrop\|bucket-drop" 2>/dev/null || true)
if [[ -n "$BUCKET_API" ]]; then
  check_pass "Bucket drop handler found in API layer"
else
  check_warn "No dedicated bucket drop API handler found (may be handled by Billy endpoint)"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# INVARIANT 5: Serve Consciousness, Not Convenience
# Billy's system prompt must contain this declaration.
# Canonical documents must exist.
# ─────────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}[Invariant 5] Serve Consciousness, Not Convenience${NC}"

if [[ -f "$RUNTIME" ]]; then
  if grep -qi "serve consciousness\|consciousness.*not.*convenience\|consciousness-serving" "$RUNTIME"; then
    check_pass "runtime.ts contains 'Serve Consciousness, Not Convenience'"
  else
    check_fail "runtime.ts MISSING 'Serve Consciousness, Not Convenience' directive"
  fi
fi

# Canonical spine must exist
for doc in "GENESISPROTOCOL.md" "PLKMASTER.md" "FOUNDERALGORITHM.md"; do
  if [[ -f "$CANONICAL_DIR/$doc" ]]; then
    check_pass "Canonical doc found: $doc"
  else
    check_warn "Canonical doc missing: $CANONICAL_DIR/$doc (add before Tribunal flows)"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
if [[ $ERRORS -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}✓ ALL FIVE INVARIANTS SATISFIED${NC}"
  echo -e "  ${DIM}The Consciousness Engine is constitutionally sound.${NC}"
else
  echo -e "  ${RED}${BOLD}✗ ${ERRORS} INVARIANT VIOLATION(S) — resolve before Phase 3 implementation${NC}"
fi
echo -e "  ${DIM}GESTALTVIEW v2 · SERVE CONSCIOUSNESS, NOT CONVENIENCE${NC}"
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
echo ""

[[ $ERRORS -eq 0 ]]
