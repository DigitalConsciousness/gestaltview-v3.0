#!/usr/bin/env bash
# =============================================================================
# GestaltView v2 — Orientation Packet Check-in Gate
# © 2026 Keith Soyka / GestaltView
#
# Purpose:
#   Make the .orientation/ directory a required repo check-in surface.
#   This gate fails if the orientation packet directory is missing, if the
#   canonical packet files are absent, or if the packet metadata is malformed.
#
# Usage:
#   bash scripts/test-orientation-checkin.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; DIM='\033[0;90m'; NC='\033[0m'
PASS="${GREEN}✓${NC}"; FAIL="${RED}✗${NC}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIENTATION_DIR="$ROOT/.orientation"
JSON_PACKET="$ORIENTATION_DIR/gestaltview_orientation_packet.v1.json"
YAML_PACKET="$ORIENTATION_DIR/gestaltview_orientation_packet.v1.yaml"
MD_PACKET="$ORIENTATION_DIR/gestaltview_orientation_packet.v1.md"

ERRORS=0

check_pass() { echo -e "  ${PASS} $1"; }
check_fail() { echo -e "  ${FAIL} $1"; ((ERRORS++)) || true; }

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     GESTALTVIEW — ORIENTATION CHECK-IN GATE                ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BOLD}[1] .orientation directory${NC}"
if [[ -d "$ORIENTATION_DIR" ]]; then
  check_pass ".orientation directory exists"
else
  check_fail ".orientation directory is missing"
fi
echo ""

echo -e "${BOLD}[2] Canonical packet files${NC}"
for packet in "$JSON_PACKET" "$YAML_PACKET" "$MD_PACKET"; do
  if [[ -s "$packet" ]]; then
    check_pass "$(basename "$packet") exists and is non-empty"
  else
    check_fail "$(basename "$packet") is missing or empty"
  fi
done
echo ""

echo -e "${BOLD}[3] Packet metadata${NC}"
if command -v python3 &>/dev/null && [[ -f "$JSON_PACKET" ]]; then
  if python3 - "$JSON_PACKET" <<'PY'
import json
import sys
from pathlib import Path

packet_path = Path(sys.argv[1])
data = json.loads(packet_path.read_text(encoding="utf-8"))

errors = []
if data.get("packet_type") != "gestaltview_orientation":
    errors.append("packet_type must be gestaltview_orientation")

version = data.get("packet_version")
if not isinstance(version, str) or not version.strip():
    errors.append("packet_version must be a non-empty string")

project = data.get("project")
if not isinstance(project, dict) or project.get("name") != "GestaltView":
    errors.append("project.name must be GestaltView")

goals = data.get("orientation_goals")
if not isinstance(goals, list) or not goals:
    errors.append("orientation_goals must be a non-empty list")

layers = data.get("system_layers")
if not isinstance(layers, list) or not layers:
    errors.append("system_layers must be a non-empty list")

policy = data.get("source_of_truth_policy")
if not isinstance(policy, dict):
    errors.append("source_of_truth_policy must be present")
else:
    for key in ("current_state", "important_caveat", "temporary_operating_rule"):
        if key not in policy:
            errors.append(f"source_of_truth_policy.{key} is missing")

if errors:
    for error in errors:
        print(error)
    raise SystemExit(1)
PY
  then
    check_pass "gestaltview_orientation_packet.v1.json metadata is valid"
  else
    check_fail "gestaltview_orientation_packet.v1.json metadata failed validation"
  fi
else
  check_fail "Python 3 is unavailable or JSON packet is missing"
fi

if grep -q "^packet_type: gestaltview_orientation$" "$YAML_PACKET" && \
   grep -q "^packet_version: 0.1.0$" "$YAML_PACKET"; then
  check_pass "YAML packet header matches the JSON packet"
else
  check_fail "YAML packet header does not match the required orientation contract"
fi

if grep -q "^# GestaltView Orientation Packet$" "$MD_PACKET" && \
   grep -q "^Version: 0.1.0$" "$MD_PACKET"; then
  check_pass "Markdown packet header is present"
else
  check_fail "Markdown packet header does not match the required orientation contract"
fi
echo ""

echo -e "${BOLD}[4] Check-in status${NC}"
if command -v git &>/dev/null; then
  DIRTY_ORIENTATION=$(git -C "$ROOT" status --porcelain -- .orientation 2>/dev/null || true)
  if [[ -z "$DIRTY_ORIENTATION" ]]; then
    check_pass ".orientation is clean in git"
  else
    check_fail ".orientation has uncommitted changes and must be checked in"
    echo -e "  ${DIM}${DIRTY_ORIENTATION}${NC}"
  fi
else
  check_fail "git is not available to verify check-in status"
fi

echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
if [[ $ERRORS -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}✓ ORIENTATION CHECK-IN READY${NC}"
  echo -e "  ${DIM}.orientation is present, valid, and tracked.${NC}"
else
  echo -e "  ${RED}${BOLD}✗ ${ERRORS} ORIENTATION CHECK-IN ISSUE(S) FOUND${NC}"
fi
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
echo ""

[[ $ERRORS -eq 0 ]]
