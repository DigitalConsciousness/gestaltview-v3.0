#!/usr/bin/env bash
# =============================================================================
# GestaltView v2 — GitHub Codespaces Cleanup Utility
# © 2026 Keith Soyka / GestaltView
#
# Purpose:
#   Reclaim disk space in GitHub Codespaces (or similar dev containers) when
#   storage runs low.
#
# Usage:
#   bash scripts/codespace-cleanup.sh
#   bash scripts/codespace-cleanup.sh --aggressive
#   bash scripts/codespace-cleanup.sh --target-usage 75
#   bash scripts/codespace-cleanup.sh --no-dry-run
#   bash scripts/codespace-cleanup.sh --help
#
# Notes:
#   - Default mode is DRY RUN for safety.
#   - Use --no-dry-run to apply deletions.
#   - Aggressive mode includes larger cache purges and Docker pruning.
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
DIM='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

PASS="${GREEN}✓${NC}"
WARN="${YELLOW}⚠${NC}"
INFO="${CYAN}→${NC}"

DRY_RUN=true
AGGRESSIVE=false
TARGET_USAGE=80

print_usage() {
  cat <<'USAGE'
GestaltView Codespace Cleanup

Options:
  --no-dry-run         Apply cleanup actions (default is dry-run)
  --aggressive         Include deeper cleanup (Docker/system caches)
  --target-usage <n>   Exit early if current usage is <= n percent (default: 80)
  --help               Show this help message
USAGE
}

log_info() { echo -e "${INFO} ${DIM}$1${NC}"; }
log_pass() { echo -e "  ${PASS} $1"; }
log_warn() { echo -e "  ${WARN} $1"; }

run_action() {
  local description="$1"
  local command="$2"

  if [[ "$DRY_RUN" == true ]]; then
    log_info "[dry-run] ${description}"
    echo "      $command"
    return 0
  fi

  if eval "$command"; then
    log_pass "$description"
  else
    log_warn "${description} (skipped or failed safely)"
  fi
}

remove_if_present() {
  local description="$1"
  shift

  local targets=("$@")
  local existing=()
  for target in "${targets[@]}"; do
    if [[ -e "$target" ]]; then
      existing+=("$target")
    fi
  done

  if [[ "${#existing[@]}" -eq 0 ]]; then
    log_info "Skipping ${description} (nothing found)"
    return 0
  fi

  local joined
  joined="$(printf '%q ' "${existing[@]}")"
  run_action "$description" "rm -rf ${joined}"
}

show_top_consumers() {
  echo -e "${BOLD}Top local space consumers (home + workspace):${NC}"

  if [[ -d "$HOME" ]]; then
    du -h --max-depth=1 "$HOME" 2>/dev/null | sort -hr | head -n 12 || true
  fi

  local workspace_root="${CODESPACE_VSCODE_FOLDER:-/workspaces}"
  if [[ -d "$workspace_root" ]]; then
    echo ""
    du -h --max-depth=2 "$workspace_root" 2>/dev/null | sort -hr | head -n 16 || true
  fi
}

percent_used() {
  df -P / | awk 'NR==2 {gsub("%", "", $5); print $5}'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-dry-run)
      DRY_RUN=false
      shift
      ;;
    --aggressive)
      AGGRESSIVE=true
      shift
      ;;
    --target-usage)
      if [[ $# -lt 2 ]]; then
        echo "Error: --target-usage requires a numeric value."
        exit 1
      fi
      TARGET_USAGE="$2"
      shift 2
      ;;
    --help)
      print_usage
      exit 0
      ;;
    *)
      echo "Error: Unknown option '$1'"
      print_usage
      exit 1
      ;;
  esac
done

if ! [[ "$TARGET_USAGE" =~ ^[0-9]+$ ]] || [[ "$TARGET_USAGE" -lt 1 || "$TARGET_USAGE" -gt 99 ]]; then
  echo "Error: --target-usage must be an integer between 1 and 99."
  exit 1
fi

echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║     GESTALTVIEW — CODESPACE CLEANUP              ║${NC}"
echo -e "${CYAN}${BOLD}║     © 2026 Keith Soyka / GestaltView             ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

log_info "Mode: $([[ "$DRY_RUN" == true ]] && echo "DRY RUN" || echo "APPLY CHANGES")"
log_info "Aggressive cleanup: $AGGRESSIVE"
log_info "Target usage threshold: ${TARGET_USAGE}%"

echo ""
echo -e "${BOLD}[1/5] Disk Snapshot Before Cleanup${NC}"
BEFORE_DF="$(df -h / | tail -n 1)"
BEFORE_PCT="$(percent_used)"
echo "$BEFORE_DF"
show_top_consumers

if [[ "$BEFORE_PCT" -le "$TARGET_USAGE" ]]; then
  echo ""
  log_pass "Disk usage is already ${BEFORE_PCT}% (<= ${TARGET_USAGE}%). No cleanup required."
  exit 0
fi

echo ""
echo -e "${BOLD}[2/5] Safe Cache Cleanup${NC}"
run_action "Clear npm cache" "command -v npm >/dev/null 2>&1 && npm cache clean --force >/dev/null 2>&1"
run_action "Clear pnpm store" "command -v pnpm >/dev/null 2>&1 && pnpm store prune >/dev/null 2>&1"
run_action "Clear yarn cache" "command -v yarn >/dev/null 2>&1 && yarn cache clean >/dev/null 2>&1"
run_action "Remove pip cache" "rm -rf \"$HOME/.cache/pip\""
run_action "Remove temporary files in /tmp" "find /tmp -mindepth 1 -maxdepth 1 -mtime +1 -exec rm -rf {} + >/dev/null 2>&1"

if [[ -d "$HOME/.cache" ]]; then
  run_action "Trim generic cache files older than 14 days" "find \"$HOME/.cache\" -mindepth 1 -maxdepth 3 -type f -mtime +14 -delete >/dev/null 2>&1"
fi

echo ""
echo -e "${BOLD}[3/5] Workspace/Repo Cleanup${NC}"
if command -v git >/dev/null 2>&1; then
  run_action "Git garbage collection for current repo" "git gc --prune=now >/dev/null 2>&1"
  run_action "Expire reflog entries" "git reflog expire --expire=now --all >/dev/null 2>&1"
else
  log_warn "git not available; skipping git cleanup"
fi

run_action "Remove Vite cache" "rm -rf ./client/node_modules/.vite"
run_action "Remove coverage artifacts" "find . -type d -name coverage -prune -exec rm -rf {} + >/dev/null 2>&1"
run_action "Remove TypeScript build info" "find . -type f -name '*.tsbuildinfo' -delete >/dev/null 2>&1"

if [[ "$AGGRESSIVE" == true ]]; then
  echo ""
  echo -e "${BOLD}[4/5] Aggressive Cleanup${NC}"
  run_action "Remove global npm cache directory" "rm -rf \"$HOME/.npm\""
  remove_if_present "Remove VS Code remote cache" \
    "$HOME/.vscode-remote/extensionsCache" \
    "$HOME/.vscode-remote/data/CachedData" \
    "$HOME/.vscode-remote/data/logs"
  remove_if_present "Remove Copilot cache" "$HOME/.cache/copilot"
  remove_if_present "Remove pnpm cache" "$HOME/.cache/pnpm"
  remove_if_present "Remove npm npx cache" "$HOME/.npm/_npx"
  remove_if_present "Remove npm content cache" "$HOME/.npm/_cacache"
  remove_if_present "Remove TypeScript cache" "$HOME/.cache/typescript"
  remove_if_present "Remove Prisma cache" "$HOME/.cache/prisma"
  run_action "Remove Cargo package cache" "rm -rf \"$HOME/.cargo/registry/cache\""
  run_action "Remove Cargo git cache" "rm -rf \"$HOME/.cargo/git\""

  if command -v docker >/dev/null 2>&1; then
    run_action "Docker system prune" "docker system prune -af --volumes >/dev/null 2>&1"
  else
    log_warn "docker not available; skipping Docker cleanup"
  fi
else
  echo ""
  echo -e "${BOLD}[4/5] Aggressive Cleanup${NC}"
  log_info "Skipped (enable with --aggressive)"
fi

echo ""
echo -e "${BOLD}[5/5] Disk Snapshot After Cleanup${NC}"
AFTER_DF="$(df -h / | tail -n 1)"
AFTER_PCT="$(percent_used)"
echo "$AFTER_DF"

echo ""
if [[ "$DRY_RUN" == true ]]; then
  log_warn "Dry-run complete. Re-run with --no-dry-run to apply cleanup."
else
  if [[ "$AFTER_PCT" -lt "$BEFORE_PCT" ]]; then
    log_pass "Disk usage improved: ${BEFORE_PCT}% → ${AFTER_PCT}%"
  elif [[ "$AFTER_PCT" -eq "$BEFORE_PCT" ]]; then
    log_warn "Disk usage unchanged at ${AFTER_PCT}%. Consider --aggressive mode."
  else
    log_warn "Disk usage increased (${BEFORE_PCT}% → ${AFTER_PCT}%). Check running processes/log growth."
  fi
fi

log_info "Quick targets to inspect manually:"
log_info "  ~/.cache   ~/.vscode-server   /tmp   /workspaces"
