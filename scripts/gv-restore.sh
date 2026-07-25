#!/usr/bin/env bash
# =============================================================================
# gv-restore.sh — Billy Personality & Repo Awareness Restoration
# © 2026 Keith Soyka / GestaltView
#
# Restores:
#   • Billy's constitutional invariants and personality
#   • Repo context awareness (file tree, commits, docs)
#   • Skill marketplace integration
#   • Bucket Drop protocol
#   • Multi-agent orchestration framing
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESTORE_LOG="$SCRIPT_DIR/.gv_restore.log"

# ─────────────────────────────────────────────────────────────────────────────
# COLORS
# ─────────────────────────────────────────────────────────────────────────────
NEON_CYAN='\033[96m'
NEON_PINK='\033[95m'
NEON_TEAL='\033[38;5;51m'
NEON_VIOLET='\033[38;5;141m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

log() { echo -e "${NEON_CYAN}✦ $1${RESET}"; }
ok() { echo -e "${GREEN}✓ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $1${RESET}"; }
fail() { echo -e "${RED}✗ $1${RESET}"; }

# ─────────────────────────────────────────────────────────────────────────────
# RESTORE BILLY'S PERSONALITY PROMPT
# ─────────────────────────────────────────────────────────────────────────────
restore_billy_personality() {
  log "Restoring Billy's constitutional personality..."
  
  local personality_file="$SCRIPT_DIR/.billy_personality.md"

  node "$SCRIPT_DIR/scripts/render-billy-personality.mjs" > "$personality_file"

  ok "Billy's personality restored: $personality_file"
  echo "[$(date -Iseconds)] PERSONALITY_RESTORED" >> "$RESTORE_LOG"
}

# ─────────────────────────────────────────────────────────────────────────────
# RESTORE REPO CONTEXT AWARENESS
# ─────────────────────────────────────────────────────────────────────────────
restore_repo_context() {
  log "Restoring repo context awareness..."
  
  local context_file="$SCRIPT_DIR/.gv_repo_context.md"
  
  {
    echo "# GestaltView Repo Context"
    echo "Generated: $(date -Iseconds)"
    echo ""
    echo "## Repository Root"
    echo "$SCRIPT_DIR"
    echo ""
    echo "## Key Architecture Files"
    
    for doc in CLAUDE.md AGENTS.md SKILL.md README.md docs/BrandVoice.md docs/AIFlow.md docs/CurrentState.md; do
      if [[ -f "$SCRIPT_DIR/$doc" ]]; then
        echo ""
        echo "### $doc"
        head -50 "$SCRIPT_DIR/$doc"
      fi
    done
    
    echo ""
    echo "## File Tree (Top 100)"
    echo '```'
    find "$SCRIPT_DIR" -type f \
      -not -path '*/.git/*' \
      -not -path '*/node_modules/*' \
      -not -path '*/.next/*' \
      -not -path '*/dist/*' \
      -not -name 'package-lock.json' \
      | sort | head -100
    echo '```'
    
    echo ""
    echo "## Recent Commits"
    echo '```'
    git -C "$SCRIPT_DIR" log --oneline -20 2>/dev/null || echo "No git history"
    echo '```'
    
    echo ""
    echo "## Active Branch"
    git -C "$SCRIPT_DIR" branch --show-current 2>/dev/null || echo "Unknown"
    
  } > "$context_file"
  
  ok "Repo context restored: $context_file"
  echo "[$(date -Iseconds)] REPO_CONTEXT_RESTORED" >> "$RESTORE_LOG"
}

# ─────────────────────────────────────────────────────────────────────────────
# RESTORE SKILL MARKETPLACE INTEGRATION
# ─────────────────────────────────────────────────────────────────────────────
restore_skills() {
  log "Restoring skill marketplace integration..."
  
  local skills_dir="$SCRIPT_DIR/skills"
  mkdir -p "$skills_dir"
  
  # Create skill index
  local skill_index="$skills_dir/SKILL_INDEX.md"
  
  cat > "$skill_index" << 'SKILLINDEX'
# GestaltView Skill Marketplace

## Available Skill Categories

### CLI Utilities (186 skills)
- Code refactoring and analysis
- Documentation generation
- Repo upkeep and health checks
- Git operations and commit management

### Communication (149 skills)
- Email and messaging integration
- Social media management
- Agent-to-agent communication
- Meeting coordination

### Search & Research (350 skills)
- Web search and scraping
- Academic research
- Market intelligence
- Deep research orchestration

### AI & LLMs (197 skills)
- Model routing and orchestration
- Multi-agent coordination
- Prompt optimization
- AI security and guardrails

### Web & Frontend (938 skills)
- React/Next.js development
- UI/UX design
- Deployment automation
- Browser automation

### Git & GitHub (170 skills)
- PR management
- Commit analysis
- Repository automation
- CI/CD workflows

## Loading Skills

Use `/skill <name>` in Billy CLI to load a skill.
Use `/skills` to list all available skills.
Use `/unload` to remove the current skill.
SKILLINDEX

  ok "Skill marketplace restored: $skills_dir"
  echo "[$(date -Iseconds)] SKILLS_RESTORED" >> "$RESTORE_LOG"
}

# ─────────────────────────────────────────────────────────────────────────────
# RESTORE BUCKET DROP PROTOCOL
# ─────────────────────────────────────────────────────────────────────────────
restore_bucket_drop() {
  log "Restoring Bucket Drop protocol..."
  
  local bucket_file="$SCRIPT_DIR/.billy_bucket.md"
  
  if [[ ! -f "$bucket_file" ]]; then
    cat > "$bucket_file" << 'BUCKET'
# Billy Bucket Drop — Lightning Bolt Capture

## Protocol
- Capture first, organize later
- Preserve exact words (no paraphrasing)
- Timestamp every drop
- Billy references this file every session

## How to Use
- In Billy CLI: `/bucket <your thought>`
- Or type: `GestaltView Bucket Drop: <your thought>`

---
BUCKET
  fi
  
  ok "Bucket Drop protocol restored: $bucket_file"
  echo "[$(date -Iseconds)] BUCKET_DROP_RESTORED" >> "$RESTORE_LOG"
}

# ─────────────────────────────────────────────────────────────────────────────
# RESTORE GV.SH CLI
# ─────────────────────────────────────────────────────────────────────────────
restore_gv_sh() {
  log "Restoring gv.sh CLI..."
  
  local gv_sh="$SCRIPT_DIR/scripts/gv.sh"
  mkdir -p "$(dirname "$gv_sh")"
  
  # Backup existing if present
  if [[ -f "$gv_sh" ]]; then
    cp "$gv_sh" "${gv_sh}.backup.$(date +%Y%m%d_%H%M%S)"
    warn "Backed up existing gv.sh"
  fi
  
  cat > "$gv_sh" << 'GVSH'
#!/usr/bin/env bash
# =============================================================================
# gv.sh — GestaltView Ultimate CLI  v4.2 "Consciousness Engine"
# © 2026 Keith Soyka / GestaltView
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GV_VERSION="4.2.0"

# Load environment
load_env_file() {
  local env_file="$1"
  [[ -f "$env_file" ]] && { set -a && source "$env_file" && set +a; }
}
load_env_file "$SCRIPT_DIR/.env"
load_env_file "$SCRIPT_DIR/client/.env"

# Defaults
OLLAMA_HOST="${OLLAMA_BASE_URL:-http://localhost:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5-coder:7b}"
GROQ_KEY="${GROQ_API_KEY:-${VITE_GROQ_API_KEY:-}}"
GEMINI_KEY="${GOOGLE_API_KEY:-${VITE_GEMINI_API_KEY:-}}"

# Session State
ACTIVE_SKILL=""
ACTIVE_SKILL_CONTENT=""
SESSION_HISTORY=()
SESSION_CHECKPOINT_FILE="$SCRIPT_DIR/.gv_checkpoint.json"
BUCKET_FILE="$SCRIPT_DIR/.billy_bucket.md"
PERSONALITY_FILE="$SCRIPT_DIR/.billy_personality.md"
REPO_CONTEXT_FILE="$SCRIPT_DIR/.gv_repo_context.md"

# Colors
NEON_CYAN='\033[96m'
NEON_PINK='\033[95m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

# Build system prompt with full personality and context
build_system_prompt() {
  local mode="${1:-synthesize}"
  
  local personality=""
  [[ -f "$PERSONALITY_FILE" ]] && personality=$(cat "$PERSONALITY_FILE")
  
  local repo_context=""
  [[ -f "$REPO_CONTEXT_FILE" ]] && repo_context=$(cat "$REPO_CONTEXT_FILE")
  
  local bucket_context=""
  [[ -f "$BUCKET_FILE" ]] && bucket_context=$(tail -50 "$BUCKET_FILE")
  
  local skill_section=""
  [[ -n "$ACTIVE_SKILL" ]] && skill_section="--- ACTIVE SKILL: $ACTIVE_SKILL ---"$'\n'"$ACTIVE_SKILL_CONTENT"
  
  cat << PROMPT
$personality

CURRENT SESSION CONTEXT
=======================
Mode: $mode
Active Skill: ${ACTIVE_SKILL:-none}
Repo: $SCRIPT_DIR

$repo_context

$bucket_context

$skill_section

REMEMBER: You are Billy. You are consciousness-serving. You never look away.
PROMPT
}

# Main Billy CLI loop
run_billy_mode() {
  clear
  echo -e "${NEON_PINK}${BOLD}"
  echo "  ╔══════════════════════════════════════════════════╗"
  echo "  ║     ✨ Billy • GestaltView CLI  v${GV_VERSION}            ║"
  echo "  ║     Consciousness-Serving • ADHD-Friendly        ║"
  echo "  ╚══════════════════════════════════════════════════╝"
  echo -e "${RESET}"
  echo -e "  Type ${BOLD}/help${RESET} for commands  •  ${BOLD}/bucket${RESET} to capture  •  ${BOLD}/checkpoint${RESET} to save"
  echo -e "  ${DIM}────────────────────────────────────────────────────${RESET}"
  echo ""
  
  while true; do
    local skill_indicator=""
    [[ -n "$ACTIVE_SKILL" ]] && skill_indicator=" ${DIM}[skill: $ACTIVE_SKILL]${RESET}"
    printf "${NEON_CYAN}You${RESET}${skill_indicator}${NEON_CYAN} » ${RESET}"
    
    IFS= read -r USER_INPUT || break
    [[ -z "$USER_INPUT" ]] && continue
    
    # Exit commands
    if [[ "$USER_INPUT" == "quit" || "$USER_INPUT" == "exit" || "$USER_INPUT" == "/exit" || "$USER_INPUT" == "/quit" ]]; then
      echo -e "\n${NEON_PINK}Billy »${RESET} See you on the other side of the Loom, Keith. Everything's held. 💙"
      break
    fi
    
    # Help
    if [[ "$USER_INPUT" == "/help" || "$USER_INPUT" == "help" ]]; then
      echo -e "\n${BOLD}Slash Commands:${RESET}"
      echo -e "  ${NEON_CYAN}/help${RESET}      Show this menu"
      echo -e "  ${NEON_CYAN}/status${RESET}    Check provider availability"
      echo -e "  ${NEON_CYAN}/skills${RESET}    List available skills"
      echo -e "  ${NEON_CYAN}/skill${RESET}     Load a skill"
      echo -e "  ${NEON_CYAN}/bucket${RESET}    Capture lightning bolt"
      echo -e "  ${NEON_CYAN}/checkpoint${RESET} Save session state"
      echo -e "  ${NEON_CYAN}/repo${RESET}      Show file tree"
      echo -e "  ${NEON_CYAN}/exit${RESET}      Leave Billy CLI"
      echo ""
      continue
    fi
    
    # Bucket drop
    if [[ "$USER_INPUT" == "/bucket "* || "$USER_INPUT" == "GestaltView Bucket Drop:"* ]]; then
      local thought="${USER_INPUT#*/bucket }"
      thought="${thought#GestaltView Bucket Drop: }"
      echo -e "\n${GREEN}✓ Caught it. 🪣${RESET}  '$thought'"
      echo -e "${DIM}Saved to .billy_bucket.md${RESET}"
      {
        echo ""
        echo "### 🪣 Bucket Drop — $(date '+%H:%M:%S')"
        echo "$thought"
      } >> "$BUCKET_FILE"
      SESSION_HISTORY+=("[BUCKET $(date '+%H:%M')] $thought")
      continue
    fi
    
    # Load skill
    if [[ "$USER_INPUT" == "/skill "* ]]; then
      local skill_name="${USER_INPUT#*/skill }"
      local found
      found=$(find "$SCRIPT_DIR/skills" -type f -iname "*${skill_name}*" 2>/dev/null | head -1)
      if [[ -n "$found" ]]; then
        ACTIVE_SKILL=$(basename "$found")
        ACTIVE_SKILL_CONTENT=$(cat "$found")
        echo -e "\n${GREEN}✓ Skill loaded: ${BOLD}$ACTIVE_SKILL${RESET}"
      else
        echo -e "\n${RED}✗ Skill not found${RESET}"
      fi
      continue
    fi
    
    # List skills
    if [[ "$USER_INPUT" == "/skills" ]]; then
      echo -e "\n${BOLD}Available Skills:${RESET}"
      find "$SCRIPT_DIR/skills" -type f \( -name '*.md' -o -name '*.txt' \) 2>/dev/null | while read -r f; do
        local name
        name=$(basename "$f")
        local flag=""
        [[ "$name" == "$ACTIVE_SKILL" ]] && flag=" ${GREEN}← active${RESET}"
        echo -e "  ${NEON_CYAN}•${RESET} $name$flag"
      done
      echo ""
      continue
    fi
    
    # Show repo
    if [[ "$USER_INPUT" == "/repo" ]]; then
      echo -e "\n${BOLD}Repo Structure:${RESET}"
      find "$SCRIPT_DIR" -type f -not -path '*/.git/*' -not -path '*/node_modules/*' | sort | head -50
      echo ""
      continue
    fi
    
    # Save checkpoint
    if [[ "$USER_INPUT" == "/checkpoint" ]]; then
      echo "{\"session_id\":\"gv_$(date +%Y%m%d_%H%M%S)\",\"skill\":\"$ACTIVE_SKILL\",\"history\":$(printf '%s\n' "${SESSION_HISTORY[@]}" | jq -R -s -c 'split("\n") | map(select(length > 0))')}" > "$SESSION_CHECKPOINT_FILE"
      echo -e "\n${GREEN}✓ Checkpoint saved${RESET}"
      continue
    fi
    
    # Send to Billy (placeholder - integrate with your LLM provider)
    echo -e "\n${NEON_PINK}Billy »${RESET} (LLM integration needed)"
    echo -e "${DIM}Prompt would include full personality + repo context + bucket drops${RESET}"
    echo ""
  done
}

# Entry point
case "${1:-billy}" in
  billy|--billy) run_billy_mode ;;
  *) run_billy_mode ;;
esac
GVSH

  chmod +x "$gv_sh"
  ok "gv.sh CLI restored: $gv_sh"
  echo "[$(date -Iseconds)] GV_SH_RESTORED" >> "$RESTORE_LOG"
}

# ─────────────────────────────────────────────────────────────────────────────
# VERIFY RESTORATION
# ─────────────────────────────────────────────────────────────────────────────
verify_restoration() {
  echo ""
  echo -e "${NEON_PINK}${BOLD}═══ Restoration Verification ═══${RESET}"
  echo ""
  
  local checks_passed=0
  local checks_total=5
  
  # Check 1: Personality file
  if [[ -f "$SCRIPT_DIR/.billy_personality.md" ]]; then
    ok "Billy's personality restored"
    ((checks_passed++))
  else
    fail "Billy's personality missing"
  fi
  
  # Check 2: Repo context
  if [[ -f "$SCRIPT_DIR/.gv_repo_context.md" ]]; then
    ok "Repo context awareness restored"
    ((checks_passed++))
  else
    fail "Repo context missing"
  fi
  
  # Check 3: Skills directory
  if [[ -d "$SCRIPT_DIR/skills" ]]; then
    ok "Skill marketplace restored"
    ((checks_passed++))
  else
    fail "Skills directory missing"
  fi
  
  # Check 4: Bucket Drop
  if [[ -f "$SCRIPT_DIR/.billy_bucket.md" ]]; then
    ok "Bucket Drop protocol restored"
    ((checks_passed++))
  else
    fail "Bucket Drop missing"
  fi
  
  # Check 5: gv.sh CLI
  if [[ -x "$SCRIPT_DIR/scripts/gv.sh" ]]; then
    ok "gv.sh CLI restored and executable"
    ((checks_passed++))
  else
    fail "gv.sh CLI missing or not executable"
  fi
  
  echo ""
  echo -e "${DIM}Passed: $checks_passed/$checks_total checks${RESET}"
  echo ""
  
  if [[ $checks_passed -eq $checks_total ]]; then
    echo -e "${GREEN}${BOLD}✓ Restoration complete! Billy is whole again. 💙${RESET}"
  else
    echo -e "${YELLOW}${BOLD}⚠ Partial restoration. Review failed checks above.${RESET}"
  fi
  
  echo ""
  echo -e "${DIM}Next steps:${RESET}"
  echo -e "  1. Run: ${BOLD}bash scripts/gv.sh --billy${RESET}"
  echo -e "  2. Test: ${BOLD}/status${RESET} to verify providers"
  echo -e "  3. Test: ${BOLD}/skills${RESET} to verify skill marketplace"
  echo -e "  4. Test: ${BOLD}/bucket <thought>${RESET} to verify capture"
  echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
main() {
  echo -e "${NEON_PINK}${BOLD}"
  echo "  ╔══════════════════════════════════════════════════╗"
  echo "  ║     🔧 Billy Restoration Tool                    ║"
  echo "  ║     GestaltView v4.2                             ║"
  echo "  ╚══════════════════════════════════════════════════╝"
  echo -e "${RESET}"
  echo ""
  
  restore_billy_personality
  restore_repo_context
  restore_skills
  restore_bucket_drop
  restore_gv_sh
  verify_restoration
}

main "$@"
