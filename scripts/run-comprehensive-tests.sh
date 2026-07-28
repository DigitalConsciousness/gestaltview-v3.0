#!/usr/bin/env bash
# =============================================================================
# GestaltView v2 — Comprehensive Test Suite Runner
# © 2026 Keith Soyka / GestaltView
#
# Runs the broad repo health gate and writes a durable markdown report.
#
# Outputs:
#   - Console (colour)
#   - docs/TEST_RESULTS.md
#   - logs/test-run-YYYY-MM-DD_HH-MM-SS.log (when logging is enabled)
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[0;90m'
YELLOW='\033[1;33m'
NC='\033[0m'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT/logs"
TEST_RESULTS_MD="$ROOT/docs/TEST_RESULTS.md"
RUN_TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
RUN_DATE=$(date +"%Y-%m-%d %H:%M:%S %Z")

NO_LOG=false
NEXT_SLICE_OVERRIDE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-log)
      NO_LOG=true
      shift
      ;;
    --next-slice)
      NEXT_SLICE_OVERRIDE="${2:-}"
      shift 2
      ;;
    --help|-h)
      cat <<EOF
Usage: bash scripts/run-comprehensive-tests.sh [--no-log] [--next-slice "text"]

Runs the broad GestaltView test and validation chain, then writes
docs/TEST_RESULTS.md and, unless --no-log is used, a persistent log under logs/.
EOF
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if [[ "$NO_LOG" == false ]]; then
  mkdir -p "$LOG_DIR"
  LOG_FILE="$LOG_DIR/test-run-${RUN_TIMESTAMP}.log"
  exec > >(tee -a "$LOG_FILE") 2>&1
else
  LOG_FILE=""
fi

declare -a STEP_NAMES=()
declare -a STEP_COMMANDS=()
declare -a STEP_STATUSES=()
declare -a STEP_NOTES=()
declare -a STEP_EXIT_CODES=()
declare -a STEP_DURATIONS=()

TOTAL=0
PASSED=0
FAILED=0
WARNED=0

step() {
  TOTAL=$((TOTAL + 1))
  echo ""
  echo -e "${CYAN}${BOLD}[${TOTAL}] $1${NC}"
}

format_command() {
  printf '%q ' "$@"
}

record_step_result() {
  STEP_NAMES+=("$1")
  STEP_COMMANDS+=("$2")
  STEP_STATUSES+=("$3")
  STEP_NOTES+=("$4")
  STEP_EXIT_CODES+=("$5")
  STEP_DURATIONS+=("$6")
}

collect_vitest_files() {
  find \
    "$ROOT/tests" \
    "$ROOT/api/__tests__" \
    "$ROOT/client/src/tests" \
    "$ROOT/server/__tests__" \
    "$ROOT/shared" \
    -path '*/node_modules/*' -prune -o \
    \( -name '*.test.ts' -o -name '*.spec.ts' \) \
    -type f -print 2>/dev/null | sort
}

run_step() {
  local mode="strict"
  if [[ "${1:-}" == "--degraded-ok" ]]; then
    mode="degraded-ok"
    shift
  fi

  local name="$1"
  shift
  local -a cmd=("$@")
  local command_display
  local start_ts
  local end_ts
  local elapsed
  local exit_code=0

  step "$name"
  command_display="$(format_command "${cmd[@]}")"
  start_ts=$(date +%s)

  if "${cmd[@]}"; then
    exit_code=0
  else
    exit_code=$?
  fi

  end_ts=$(date +%s)
  elapsed=$((end_ts - start_ts))

  if [[ $exit_code -eq 0 ]]; then
    PASSED=$((PASSED + 1))
    echo -e "  ${GREEN}✓${NC} Passed"
    record_step_result "$name" "$command_display" "PASS" "Passed" "$exit_code" "${elapsed}s"
    return 0
  fi

  if [[ "$mode" == "degraded-ok" && $exit_code -eq 1 ]]; then
    WARNED=$((WARNED + 1))
    echo -e "  ${YELLOW}⚠${NC} Degraded / warnings (exit 1)"
    record_step_result "$name" "$command_display" "WARN" "Degraded / warnings (exit 1)" "$exit_code" "${elapsed}s"
    return 0
  fi

  FAILED=$((FAILED + 1))
  echo -e "  ${RED}✗${NC} Failed (exit ${exit_code})"
  record_step_result "$name" "$command_display" "FAIL" "Failed (exit ${exit_code})" "$exit_code" "${elapsed}s"
  return 0
}

extract_next_slice_from_current_state() {
  local current_state_file="$ROOT/docs/CurrentState.md"
  [[ -f "$current_state_file" ]] || return 0

  awk '
    BEGIN { saw_latest_header=0; in_followup=0 }
    /^# CurrentState / && !saw_latest_header { saw_latest_header=1; next }
    saw_latest_header && /^### Remaining follow-up/ { in_followup=1; next }
    saw_latest_header && /^# CurrentState / && in_followup { exit }
    in_followup {
      if ($0 ~ /^### / && $0 !~ /^### Remaining follow-up/) { exit }
      if ($0 ~ /^([0-9]+\.-?|[-*]) /) print
    }
  ' "$current_state_file"
}

write_test_report() {
  local branch
  local commit
  local verdict
  local next_slice_content=""

  branch=$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  commit=$(git -C "$ROOT" log --oneline -1 2>/dev/null || echo "unknown")

  if [[ -n "$NEXT_SLICE_OVERRIDE" ]]; then
    next_slice_content="$NEXT_SLICE_OVERRIDE"
  else
    next_slice_content="$(extract_next_slice_from_current_state || true)"
  fi

  if [[ $FAILED -eq 0 && $WARNED -eq 0 ]]; then
    verdict="ALL CLEAR"
  elif [[ $FAILED -eq 0 ]]; then
    verdict="PASSED WITH WARNINGS"
  else
    verdict="FAILED"
  fi

  {
    echo "# GestaltView v2 - Test Results"
    echo ""
    echo "> **Last run:** $RUN_DATE"
    echo "> **Verdict:** $verdict"
    echo "> **Branch:** \`$branch\`"
    echo "> **Commit:** \`$commit\`"
    if [[ -n "$LOG_FILE" ]]; then
      echo "> **Log file:** \`$LOG_FILE\`"
    else
      echo "> **Log file:** not enabled for this run"
    fi
    echo ""
    echo "## Summary"
    echo ""
    echo "- ${PASSED} passed"
    echo "- ${WARNED} warned"
    echo "- ${FAILED} failed"
    echo "- ${TOTAL} total"
    echo ""
    echo "## Results"
    echo ""
    echo "| # | Step | Command | Status | Exit | Duration | Notes |"
    echo "|---|---|---|---|---|---|---|"

    for i in "${!STEP_NAMES[@]}"; do
      echo "| $((i + 1)) | ${STEP_NAMES[$i]} | \`${STEP_COMMANDS[$i]}\` | ${STEP_STATUSES[$i]} | ${STEP_EXIT_CODES[$i]} | ${STEP_DURATIONS[$i]} | ${STEP_NOTES[$i]} |"
    done

    echo ""
    echo "## Next Slice"
    echo ""
    if [[ -n "$next_slice_content" ]]; then
      printf '%s\n' "$next_slice_content" | sed 's/^/- /'
    else
      echo "- No next-slice note was found in docs/CurrentState.md"
      echo "- Pass --next-slice \"...\" if you want to record a manual follow-up"
    fi

    echo ""
    echo "## Log History"
    echo ""
    if [[ -d "$LOG_DIR" ]]; then
      mapfile -t LOG_FILES < <(ls -1t "$LOG_DIR"/*.log 2>/dev/null | head -10 || true)
      if [[ ${#LOG_FILES[@]} -gt 0 ]]; then
        for logf in "${LOG_FILES[@]}"; do
          echo "- \`$(basename "$logf")\`"
        done
      else
        echo "- No log files recorded yet"
      fi
    else
      echo "- Log directory not created for this run"
    fi
    echo ""
  } > "$TEST_RESULTS_MD"

  echo ""
  echo -e "${GREEN}✓${NC} docs/TEST_RESULTS.md written -> $TEST_RESULTS_MD"
  if [[ -n "$LOG_FILE" ]]; then
    echo -e "${DIM}Log saved -> $LOG_FILE${NC}"
  fi
}

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     GESTALTVIEW v2 - COMPREHENSIVE TEST SUITE               ║${NC}"
echo -e "${CYAN}${BOLD}║     Serve Consciousness, Not Convenience                    ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo -e "  ${DIM}Run: $RUN_DATE${NC}"
if [[ -n "$LOG_FILE" ]]; then
  echo -e "  ${DIM}Log: $LOG_FILE${NC}"
fi
echo ""

mapfile -t VITEST_TEST_FILES < <(collect_vitest_files)
if [[ ${#VITEST_TEST_FILES[@]} -eq 0 ]]; then
  run_step "API / unit tests (Vitest)" bash -lc 'echo "No repository-owned Vitest files were found." >&2; exit 1'
else
  run_step "API / unit tests (Vitest)" ./node_modules/.bin/vitest run "${VITEST_TEST_FILES[@]}"
fi
run_step "TypeScript type check" ./node_modules/.bin/tsc --noEmit --pretty false
run_step "Five Constitutional Invariants (Phase 2)" bash "$ROOT/scripts/test-invariants.sh"
run_step "Never Look Away - consciousness safety" bash "$ROOT/scripts/test-never-look-away.sh"
run_step "Billy provider routing" bash "$ROOT/scripts/test-billy-routing.sh"
run_step "Production build" npm run build --silent
run_step "Infrastructure health check" bash "$ROOT/scripts/gv-health-check.sh"
run_step --degraded-ok "API connectivity (Gemini, Supabase, Groq, Anthropic, Diligence)" bash "$ROOT/scripts/test-apis.sh"
run_step --degraded-ok "Supabase schema validation" bash "$ROOT/scripts/test-db-schema.sh"
run_step "Manifest sync readiness (Phase 5)" bash "$ROOT/scripts/test-manifest-sync.sh"
run_step "Git diff check" git diff --check

echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
echo -e "  Results: ${GREEN}${BOLD}${PASSED} passed${NC}  ${RED}${BOLD}${FAILED} failed${NC}  ${YELLOW}${BOLD}${WARNED} warned${NC}  of ${TOTAL} total"
echo ""

if [[ $FAILED -eq 0 && $WARNED -eq 0 ]]; then
  VERDICT="ALL CLEAR"
  echo -e "  ${GREEN}${BOLD}✓ ALL TESTS PASSED — GestaltView Resonance Loop is live${NC}"
elif [[ $FAILED -eq 0 ]]; then
  VERDICT="PASSED WITH WARNINGS"
  echo -e "  ${YELLOW}${BOLD}⚠ PASSED WITH ${WARNED} WARNING(S) — review before deploy${NC}"
else
  VERDICT="FAILED"
  echo -e "  ${RED}${BOLD}✗ ${FAILED} TEST(S) FAILED — resolve before deploy${NC}"
fi

echo -e "  ${DIM}GESTALTVIEW v2 · SERVE CONSCIOUSNESS, NOT CONVENIENCE${NC}"
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"

write_test_report

echo ""
[[ $FAILED -eq 0 ]]
