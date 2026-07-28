#!/bin/bash
# ╔═════════════════════════════════════════════════════════════╗
# ║  GestaltView ✦ Ollama Setup Script                       ║
# ║  Installs Ollama + qwen2.5-coder:7b on Codespaces        ║
# ║  Handles zstd, apt issues, fallback to raw binary         ║
# ╚═════════════════════════════════════════════════════════════╝
set -e

NEON_CYAN="\033[96m"
NEON_PINK="\033[95m"
GOLD="\033[93m"
GREEN="\033[92m"
RED="\033[91m"
DIM="\033[2m"
RESET="\033[0m"

log()  { echo -e "${NEON_CYAN}✦ $1${RESET}"; }
ok()   { echo -e "${GREEN}✅ $1${RESET}"; }
warn() { echo -e "${GOLD}⚠️  $1${RESET}"; }
fail() { echo -e "${RED}❌ $1${RESET}"; }

echo -e "\n${NEON_PINK}╔══════════════════════════════════════════════╗${RESET}"
echo -e "${NEON_PINK}║  GestaltView ✦ Ollama Installer              ║${RESET}"
echo -e "${NEON_PINK}╚══════════════════════════════════════════════╝${RESET}\n"

# ─── Step 1: Disk space check ───────────────────────────────────────────────────────
log "Checking disk space..."
DISK_FREE=$(df / | awk 'NR==2 {print $4}')
DISK_FREE_GB=$((DISK_FREE / 1024 / 1024))
echo -e "  ${DIM}Available: ~${DISK_FREE_GB}GB${RESET}"

if [ "$DISK_FREE_GB" -lt 6 ]; then
  warn "Low disk space detected. Running cleanup first..."
  sudo apt-get clean -y 2>/dev/null || true
  npm cache clean --force 2>/dev/null || true
  pip cache purge 2>/dev/null || true
  rm -rf /tmp/* 2>/dev/null || true
  ok "Cleanup complete."
  DISK_FREE=$(df / | awk 'NR==2 {print $4}')
  DISK_FREE_GB=$((DISK_FREE / 1024 / 1024))
  echo -e "  ${DIM}Available after cleanup: ~${DISK_FREE_GB}GB${RESET}"
fi

if [ "$DISK_FREE_GB" -lt 5 ]; then
  fail "Still <5GB free. Cannot safely pull a 4.7GB model."
  echo -e "  ${DIM}Free space manually, then re-run this script.${RESET}"
  exit 1
fi
ok "Disk space OK"

# ─── Step 2: Check if Ollama already installed ────────────────────────────────────────
if command -v ollama &>/dev/null; then
  ok "Ollama already installed: $(ollama --version)"
else
  log "Installing Ollama..."

  # Try Method 1: apt-get update + zstd + official installer
  INSTALLED=false
  log "Method 1: apt-get update + zstd + official installer"
  if sudo apt-get update -qq 2>/dev/null && sudo apt-get install -y zstd 2>/dev/null; then
    if curl -fsSL https://ollama.com/install.sh | sh; then
      INSTALLED=true
      ok "Installed via official installer"
    fi
  fi

  # Try Method 2: Direct static binary (no zstd needed)
  if [ "$INSTALLED" = false ]; then
    warn "Method 1 failed. Trying direct binary download..."
    if sudo curl -fsSL https://ollama.com/download/ollama-linux-amd64 \
        -o /usr/local/bin/ollama && sudo chmod +x /usr/local/bin/ollama; then
      INSTALLED=true
      ok "Installed via direct binary"
    fi
  fi

  # Try Method 3: Manual tar.zst with bundled zstd
  if [ "$INSTALLED" = false ]; then
    warn "Method 2 failed. Trying manual tar.zst extraction..."
    TMP_DIR=$(mktemp -d)
    curl -fsSL https://github.com/facebook/zstd/releases/download/v1.5.6/zstd-v1.5.6-linux64.tar.gz \
      | tar xz -C "$TMP_DIR" --strip-components=1 2>/dev/null
    sudo mv "$TMP_DIR"/zstd /usr/local/bin/zstd 2>/dev/null
    sudo chmod +x /usr/local/bin/zstd
    curl -fsSL https://ollama.com/download/ollama-linux-amd64.tar.zst \
      | sudo tar x --use-compress-program=unzstd -C /usr 2>/dev/null
    command -v ollama &>/dev/null && INSTALLED=true && ok "Installed via manual tar.zst"
    rm -rf "$TMP_DIR"
  fi

  if [ "$INSTALLED" = false ]; then
    fail "All install methods failed. Check network and disk, then try again."
    exit 1
  fi
fi

# ─── Step 3: Start Ollama server ─────────────────────────────────────────────────────────
log "Starting Ollama server in background..."
if pgrep -x ollama &>/dev/null; then
  ok "Ollama server already running"
else
  nohup ollama serve > /workspaces/gestaltview-v2/ollama.log 2>&1 &
  sleep 2
  pgrep -x ollama &>/dev/null && ok "Ollama server started (PID: $(pgrep -x ollama))" \
    || fail "Server failed to start. Check ollama.log"
fi

# ─── Step 4: Pull model ─────────────────────────────────────────────────────────────────
MODEL="qwen2.5-coder:7b"
log "Pulling model: ${MODEL} (~4.7GB, this takes a few minutes)..."
if ollama list 2>/dev/null | grep -q "qwen2.5-coder:7b"; then
  ok "Model already pulled"
else
  ollama pull "$MODEL" && ok "Model ready: ${MODEL}"
fi

# ─── Done ────────────────────────────────────────────────────────────────────────
echo -e "\n${NEON_CYAN}✦✦✦ Ollama Scout is armed and ready ✦✦✦${RESET}"
echo -e "${DIM}  Run: ollama run qwen2.5-coder:7b${RESET}"
echo -e "${DIM}  Or:  bash scripts/agent-start.sh  (launches full suite)${RESET}\n"
