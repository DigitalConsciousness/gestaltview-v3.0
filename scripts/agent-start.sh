#!/bin/bash
# ╔═════════════════════════════════════════════════════════════╗
# ║  GestaltView ✦ Full Agent Suite Launcher                ║
# ║  Starts: Ollama Scout + Claude Code + Billy health       ║
# ║  Usage: bash scripts/agent-start.sh [--claude] [--scout] ║
# ╚═════════════════════════════════════════════════════════════╝

NEON_CYAN="\033[96m"
NEON_PINK="\033[95m"
GOLD="\033[93m"
GREEN="\033[92m"
RED="\033[91m"
DIM="\033[2m"
BOLD="\033[1m"
RESET="\033[0m"

log()  { echo -e "${NEON_CYAN}✦ $1${RESET}"; }
ok()   { echo -e "${GREEN}✅ $1${RESET}"; }
warn() { echo -e "${GOLD}⚠️  $1${RESET}"; }
fail() { echo -e "${RED}❌ $1${RESET}"; }

clear
echo -e "${NEON_PINK}"
echo "  ████████████████████████████████████████████"
echo "  ██                                          ██"
echo "  ██   GestaltView ✦ Agent Consciousness Suite  ██"
echo "  ██   Billy · Ollama Scout · Claude Code       ██"
echo "  ██                                          ██"
echo "  ████████████████████████████████████████████"
echo -e "${RESET}\n"

PROJECT_ROOT="/workspaces/gestaltview-v2"
cd "$PROJECT_ROOT" || { fail "Not in Codespace. Run from repo root."; exit 1; }

# ─── Parse flags ──────────────────────────────────────────────────────────────────
LAUNCH_CLAUDE=true
LAUNCH_SCOUT=true
for arg in "$@"; do
  case $arg in
    --claude-only) LAUNCH_SCOUT=false ;;
    --scout-only)  LAUNCH_CLAUDE=false ;;
    --no-claude)   LAUNCH_CLAUDE=false ;;
    --no-scout)    LAUNCH_SCOUT=false ;;
  esac
done

# ─── 1. Disk space check ───────────────────────────────────────────────────────────────
log "System health check..."
DISK_PCT=$(df / | awk 'NR==2 {gsub("%","",$5); print $5}')
RAM_FREE=$(free -m | awk 'NR==2 {print $7}')
echo -e "  ${DIM}Disk used: ${DISK_PCT}% · RAM free: ${RAM_FREE}MB${RESET}"

if [ "$DISK_PCT" -gt 92 ]; then
  warn "Disk >92% full. Auto-cleaning..."
  sudo apt-get clean -y 2>/dev/null || true
  npm cache clean --force 2>/dev/null || true
  pip cache purge 2>/dev/null || true
  rm -rf /tmp/* 2>/dev/null || true
  ok "Cleanup done"
fi

# ─── 2. Billy health check ───────────────────────────────────────────────────────────
log "Checking Billy API health..."
BILLY_URL="https://gestaltview-v2.vercel.app/api/billy"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BILLY_URL" \
  -H "Content-Type: application/json" \
  -d '{"message":"ping","mode":"synthesis"}' \
  --max-time 10 2>/dev/null || echo "000")

case $HTTP_STATUS in
  200) ok "Billy API: ✨ Live (200)" ;;
  401|403) warn "Billy API: Auth/Key issue (${HTTP_STATUS}) — check Vercel env vars" ;;
  500) warn "Billy API: Server error (500) — check Vercel logs" ;;
  000) warn "Billy API: No response — network or URL issue" ;;
  *)   warn "Billy API: Unexpected status ${HTTP_STATUS}" ;;
esac

# ─── 3. Ollama Scout ──────────────────────────────────────────────────────────────────
if [ "$LAUNCH_SCOUT" = true ]; then
  log "Starting Ollama Scout..."
  if ! command -v ollama &>/dev/null; then
    warn "Ollama not installed. Running setup first..."
    bash "$PROJECT_ROOT/scripts/ollama-setup.sh"
  fi

  if ! pgrep -x ollama &>/dev/null; then
    nohup ollama serve > "$PROJECT_ROOT/ollama.log" 2>&1 &
    sleep 2
  fi

  MODEL="qwen2.5-coder:7b"
  if ollama list 2>/dev/null | grep -q "$MODEL"; then
    ok "Scout ready: ${MODEL}"
    echo -e "  ${DIM}Chat: ollama run ${MODEL}${RESET}"
    echo -e "  ${DIM}Or use the HTTP API: curl http://localhost:11434/api/generate${RESET}"
  else
    warn "Model not pulled yet. Run: bash scripts/ollama-setup.sh"
  fi
fi

# ─── 4. Claude Code ──────────────────────────────────────────────────────────────────
if [ "$LAUNCH_CLAUDE" = true ]; then
  log "Launching Claude Code (Architect)..."
  if ! command -v claude &>/dev/null; then
    warn "Claude Code not found. Installing..."
    npm install -g @anthropic-ai/claude-code --quiet
  fi
  echo -e "\n${GOLD}╔═════════════════════════════════════════════╗${RESET}"
  echo -e "${GOLD}║  Handing off to Claude Code ✔                ║${RESET}"
  echo -e "${GOLD}║  CLAUDE.md context loaded automatically      ║${RESET}"
  echo -e "${GOLD}║  Ollama Scout running on :11434 in background ║${RESET}"
  echo -e "${GOLD}╚═════════════════════════════════════════════╝${RESET}\n"
  exec claude
fi

echo -e "\n${NEON_CYAN}✦ All agents standing by. Scars become code.${RESET}\n"
