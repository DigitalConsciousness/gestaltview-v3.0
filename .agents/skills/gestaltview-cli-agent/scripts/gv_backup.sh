#!/usr/bin/env bash
# =============================================================================
# gv.sh — GestaltView Super Shell  v3.0
# © 2026 Keith Soyka / GestaltView
#
# Two modes:
#   --claude   Run Claude Code CLI via Ollama redirect (no Anthropic billing)
#   --billy    Full Billy CLI — Groq → Gemini → Ollama free cascade
#              Slash commands, skill loader, activity spinner, ADHD-friendly UX
#
# Usage:
#   bash scripts/gv.sh                       # Interactive mode picker
#   bash scripts/gv.sh --billy               # Billy CLI directly
#   bash scripts/gv.sh --billy --mode code   # Start in code mode
#   bash scripts/gv.sh --claude              # Claude Code → Ollama, free
#   bash scripts/gv.sh --claude --model llama3.2:3b
# =============================================================================

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# REPO + ENV BOOTSTRAP
# ─────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

load_env_file() {
  local env_file="$1"
  if [[ -f "$env_file" ]]; then
    set -a && source "$env_file" && set +a
  fi
}
load_env_file "$SCRIPT_DIR/.env"
load_env_file "$SCRIPT_DIR/client/.env"

# ─────────────────────────────────────────────────────────────────────────────
# DEFAULTS
# ─────────────────────────────────────────────────────────────────────────────
OLLAMA_HOST="${OLLAMA_BASE_URL:-${OLLAMA_HOST:-http://localhost:11434}}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5-coder:7b}"
GROQ_KEY="${GROQ_API_KEY:-${VITE_GROQ_API_KEY:-}}"
GEMINI_KEY="${GOOGLE_API_KEY:-${GEMINI_API_KEY:-${VITE_GEMINI_API_KEY:-${VITE_GOOGLE_API_KEY:-}}}}"
GV_MODE="billy"
BILLY_MODE="synthesis"
INTERACTIVE_MODE=true
ACTIVE_SKILL=""           # name of currently loaded skill
ACTIVE_SKILL_CONTENT=""   # full content of the loaded skill file
SESSION_HISTORY=()        # rolling ADHD-friendly history log
BILLY_TIMEOUT=60          # seconds before we warn about silence

# ─────────────────────────────────────────────────────────────────────────────
# COLORS
# ─────────────────────────────────────────────────────────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
BLUE='\033[0;34m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# PARSE FLAGS
# ─────────────────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --claude)  GV_MODE="claude";  INTERACTIVE_MODE=false; shift ;;
    --billy)   GV_MODE="billy";   INTERACTIVE_MODE=false; shift ;;
    --model)   OLLAMA_MODEL="$2"; INTERACTIVE_MODE=false; shift 2 ;;
    --mode)    BILLY_MODE="$2";   INTERACTIVE_MODE=false; shift 2 ;;
    --help|-h)
      echo -e "${BOLD}gv.sh v3.0 — GestaltView Super Shell${RESET}"
      echo ""
      echo "  --claude           Run Claude Code via Ollama (free)"
      echo "  --claude --model X Use specific Ollama model"
      echo "  --billy            Run Billy CLI (Groq→Gemini→Ollama free cascade)"
      echo "  --billy --mode X   synthesis|loom|code|tribunal|refactor|docs|analysis"
      echo ""
      echo "Once in Billy CLI, type /help to see all slash commands."
      echo ""
      echo "Env vars: OLLAMA_BASE_URL, OLLAMA_MODEL, GROQ_API_KEY, GOOGLE_API_KEY"
      exit 0
      ;;
    *) INTERACTIVE_MODE=false; shift ;;
  esac
done

# ─────────────────────────────────────────────────────────────────────────────
# INTERACTIVE PICKER
# ─────────────────────────────────────────────────────────────────────────────
if [[ "$INTERACTIVE_MODE" == true ]]; then
  echo -e "\n${BOLD}${CYAN}✨ GestaltView Super Shell${RESET}"
  echo -e "${DIM}Bootstrap-thrift mode — free providers first${RESET}\n"
  echo "  1) Billy CLI  (Groq → Gemini → Ollama, free cascade)  ${GREEN}[RECOMMENDED]${RESET}"
  echo "  2) Claude Code → Ollama  (free, no Anthropic billing)"
  echo ""
  printf "  Pick [1/2]: "
  read -r PICK
  case "$PICK" in
    2) GV_MODE="claude" ;;
    *) GV_MODE="billy" ;;
  esac
fi

# ─────────────────────────────────────────────────────────────────────────────
# SPINNER — shows while Billy is thinking so you know he's alive
# ─────────────────────────────────────────────────────────────────────────────
SPINNER_PID=""

start_spinner() {
  local label="${1:-Billy is thinking}"
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  # Run spinner in background
  (
    while true; do
      printf "\r${MAGENTA}  ${frames[$i]} ${label}...${RESET}   " >&2
      i=$(( (i + 1) % ${#frames[@]} ))
      sleep 0.1
    done
  ) &
  SPINNER_PID=$!
  disown "$SPINNER_PID" 2>/dev/null || true
}

stop_spinner() {
  if [[ -n "$SPINNER_PID" ]]; then
    kill "$SPINNER_PID" 2>/dev/null || true
    wait "$SPINNER_PID" 2>/dev/null || true
    SPINNER_PID=""
    printf "\r\033[2K" >&2   # erase the spinner line
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# TIMEOUT WRAPPER — calls a function and surfaces friendly message if hung
# ─────────────────────────────────────────────────────────────────────────────
with_timeout() {
  local timeout_secs="$1"
  local label="$2"
  shift 2

  start_spinner "$label"

  local tmp_out
  tmp_out=$(mktemp)
  local tmp_rc
  tmp_rc=$(mktemp)

  # Run the inner command in background, capture output
  ( "$@" > "$tmp_out" 2>&1; echo $? > "$tmp_rc" ) &
  local cmd_pid=$!

  # Watch the clock
  local elapsed=0
  local warned=false
  while kill -0 "$cmd_pid" 2>/dev/null; do
    sleep 1
    (( elapsed++ ))
    if [[ $elapsed -ge $BILLY_TIMEOUT && "$warned" == false ]]; then
      stop_spinner
      echo -e "\n${YELLOW}⏳ Billy is still working on it — this is taking longer than usual (${elapsed}s).${RESET}"
      echo -e "${DIM}   Some tasks need a moment. He hasn't timed out yet — just heads up.${RESET}"
      start_spinner "Still going"
      warned=true
    fi
    if [[ $elapsed -ge $(( BILLY_TIMEOUT * 3 )) ]]; then
      # Hard timeout — kill and inform
      kill "$cmd_pid" 2>/dev/null || true
      stop_spinner
      echo -e "\n${RED}⚠  Billy timed out after ${elapsed}s. The provider might be overloaded.${RESET}"
      echo -e "${DIM}   Try again, or run ${BOLD}/status${RESET}${DIM} to check which providers are live.${RESET}"
      rm -f "$tmp_out" "$tmp_rc"
      return 1
    fi
  done

  wait "$cmd_pid" 2>/dev/null || true
  stop_spinner

  local rc
  rc=$(cat "$tmp_rc" 2>/dev/null || echo 1)
  cat "$tmp_out"
  rm -f "$tmp_out" "$tmp_rc"
  return "$rc"
}

# ─────────────────────────────────────────────────────────────────────────────
# OLLAMA HELPERS
# ─────────────────────────────────────────────────────────────────────────────
check_ollama() {
  if curl -sf "$OLLAMA_HOST/api/tags" > /dev/null 2>&1; then return 0; fi
  if ! command -v ollama &>/dev/null; then return 1; fi
  echo -e "${YELLOW}Ollama not running. Attempting to start...${RESET}" >&2
  ollama serve &>/dev/null &
  sleep 3
  curl -sf "$OLLAMA_HOST/api/tags" > /dev/null 2>&1
}

ensure_model() {
  local model="$1"
  if ! ollama list 2>/dev/null | awk '{print $1}' | grep -qx "$model"; then
    echo -e "${YELLOW}Pulling $model (one-time download)...${RESET}" >&2
    ollama pull "$model"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# PROVIDER STATUS BANNER
# ─────────────────────────────────────────────────────────────────────────────
provider_banner() {
  local groq_status="${RED}groq ✗ (missing key)${RESET}"
  local gemini_status="${RED}gemini ✗ (missing key)${RESET}"
  local ollama_status="${RED}ollama ✗ (offline)${RESET}"

  [[ -n "$GROQ_KEY" ]] && groq_status="${GREEN}groq ✓${RESET}"
  [[ -n "$GEMINI_KEY" ]] && gemini_status="${GREEN}gemini ✓${RESET}"
  check_ollama 2>/dev/null && ollama_status="${GREEN}ollama ✓${RESET}"

  echo -e "  Free cascade: $groq_status → $gemini_status → $ollama_status"
}

# ─────────────────────────────────────────────────────────────────────────────
# REPO CONTEXT SNAPSHOT
# ─────────────────────────────────────────────────────────────────────────────
build_repo_context() {
  local ctx=""
  for doc in CLAUDE.md AGENTS.md SKILL.md BrandVoice.md AIFlow.md; do
    local fp="$SCRIPT_DIR/$doc"
    if [[ -f "$fp" ]]; then
      ctx+="\n\n--- $doc ---\n"
      ctx+="$(head -120 "$fp")"
    fi
  done
  ctx+="\n\n--- REPO FILE TREE ---\n"
  ctx+="$(find "$SCRIPT_DIR" -type f \
    -not -path '*/.git/*' -not -path '*/node_modules/*' \
    -not -path '*/.next/*' -not -path '*/dist/*' \
    -not -name 'package-lock.json' \
    | sort | head -100)"
  ctx+="\n\n--- RECENT COMMITS ---\n"
  ctx+="$(git -C "$SCRIPT_DIR" log --oneline -10 2>/dev/null || echo 'no git history')"
  echo "$ctx"
}

# ─────────────────────────────────────────────────────────────────────────────
# LLM CALLERS
# ─────────────────────────────────────────────────────────────────────────────
call_groq() {
  local system_prompt="$1" user_msg="$2"
  local groq_model="${GROQ_MODEL:-llama-3.3-70b-versatile}"
  local payload
  payload=$(jq -n \
    --arg model  "$groq_model" \
    --arg system "$system_prompt" \
    --arg user   "$user_msg" \
    '{model:$model,messages:[{role:"system",content:$system},{role:"user",content:$user}],max_tokens:4096,temperature:0.7}')
  curl -sf --max-time 45 "https://api.groq.com/openai/v1/chat/completions" \
    -H "Authorization: Bearer $GROQ_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload" \
  | jq -r '.choices[0].message.content // empty'
}

call_gemini() {
  local system_prompt="$1" user_msg="$2"
  local model="gemini-2.0-flash"
  local payload
  payload=$(jq -n \
    --arg system "$system_prompt" \
    --arg user   "$user_msg" \
    '{systemInstruction:{parts:[{text:$system}]},contents:[{role:"user",parts:[{text:$user}]}],generationConfig:{maxOutputTokens:4096,temperature:0.7}}')
  curl -sf --max-time 45 \
    "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}" \
    -H "Content-Type: application/json" \
    -d "$payload" \
  | jq -r '.candidates[0].content.parts[0].text // empty'
}

call_ollama() {
  local system_prompt="$1" user_msg="$2" model="$3"
  local payload
  payload=$(jq -n \
    --arg model  "$model" \
    --arg system "$system_prompt" \
    --arg user   "$user_msg" \
    '{model:$model,messages:[{role:"system",content:$system},{role:"user",content:$user}],stream:false,max_tokens:4096}')
  curl -sf --max-time 90 "$OLLAMA_HOST/v1/chat/completions" \
    -H "Authorization: Bearer ollama" \
    -H "Content-Type: application/json" \
    -d "$payload" \
  | jq -r '.choices[0].message.content // empty'
}

# ─────────────────────────────────────────────────────────────────────────────
# INNER BILLY CALL (raw, no spinner — spinner is managed by with_timeout)
# ─────────────────────────────────────────────────────────────────────────────
_billy_call_inner() {
  local system_prompt="$1" user_msg="$2"
  local response=""

  if [[ -n "$GROQ_KEY" ]]; then
    response=$(call_groq "$system_prompt" "$user_msg" 2>/dev/null || echo "")
    if [[ -n "$response" ]]; then
      echo -e "${DIM}[groq • llama-3.3-70b • free]${RESET}"
      echo "$response"
      return 0
    fi
  fi

  if [[ -n "$GEMINI_KEY" ]]; then
    response=$(call_gemini "$system_prompt" "$user_msg" 2>/dev/null || echo "")
    if [[ -n "$response" ]]; then
      echo -e "${DIM}[gemini-2.0-flash • free]${RESET}"
      echo "$response"
      return 0
    fi
  fi

  if check_ollama 2>/dev/null; then
    ensure_model "$OLLAMA_MODEL" 2>/dev/null
    response=$(call_ollama "$system_prompt" "$user_msg" "$OLLAMA_MODEL" 2>/dev/null || echo "")
    if [[ -n "$response" ]]; then
      echo -e "${DIM}[ollama • $OLLAMA_MODEL • local]${RESET}"
      echo "$response"
      return 0
    fi
  fi

  echo -e "${YELLOW}Billy is temporarily offline. All free providers unavailable.${RESET}"
  echo -e "${DIM}Check: GROQ_API_KEY, GOOGLE_API_KEY, or start Ollama: ollama serve${RESET}"
  return 1
}

# Public entry point — wrapped with spinner + timeout
billy_call() {
  local system_prompt="$1" user_msg="$2"
  with_timeout "$BILLY_TIMEOUT" "Billy is thinking" _billy_call_inner "$system_prompt" "$user_msg"
}

# ─────────────────────────────────────────────────────────────────────────────
# SKILL LOADER — reads a skills/ file into the system prompt
# ─────────────────────────────────────────────────────────────────────────────
list_skills() {
  local skills_dir="$SCRIPT_DIR/skills"
  if [[ ! -d "$skills_dir" ]]; then
    echo -e "  ${DIM}(no skills/ directory found)${RESET}"
    return
  fi
  echo -e "  ${BOLD}Available Skills:${RESET}"
  local i=1
  while IFS= read -r -d '' f; do
    local name
    name=$(basename "$f")
    local active_flag=""
    [[ "$name" == "$ACTIVE_SKILL" ]] && active_flag=" ${GREEN}← active${RESET}"
    echo -e "    ${CYAN}$i)${RESET} $name$active_flag"
    (( i++ ))
  done < <(find "$skills_dir" -maxdepth 2 -type f \( -name '*.md' -o -name '*.txt' -o -name '*.sh' \) -print0 | sort -z)
}

load_skill() {
  local skill_name="$1"
  local skills_dir="$SCRIPT_DIR/skills"

  # Try exact match first, then fuzzy
  local found
  found=$(find "$skills_dir" -maxdepth 2 -type f -name "$skill_name" 2>/dev/null | head -1)
  if [[ -z "$found" ]]; then
    found=$(find "$skills_dir" -maxdepth 2 -type f -iname "*${skill_name}*" 2>/dev/null | head -1)
  fi

  if [[ -z "$found" ]]; then
    echo -e "  ${RED}✗ Skill '${skill_name}' not found.${RESET} Run ${BOLD}/skills${RESET} to see what's available."
    return 1
  fi

  ACTIVE_SKILL=$(basename "$found")
  ACTIVE_SKILL_CONTENT=$(cat "$found")
  echo -e "  ${GREEN}✓ Skill loaded: ${BOLD}$ACTIVE_SKILL${RESET}"
  echo -e "  ${DIM}Billy will use this skill's context for the rest of the session.${RESET}"
}

unload_skill() {
  if [[ -z "$ACTIVE_SKILL" ]]; then
    echo -e "  ${DIM}No skill currently loaded.${RESET}"
    return
  fi
  local prev="$ACTIVE_SKILL"
  ACTIVE_SKILL=""
  ACTIVE_SKILL_CONTENT=""
  echo -e "  ${YELLOW}Skill '${prev}' unloaded.${RESET}"
}

# ─────────────────────────────────────────────────────────────────────────────
# BUCKET DROP — fast capture, no processing
# ─────────────────────────────────────────────────────────────────────────────
bucket_drop() {
  local thought="$*"
  local ts
  ts=$(date '+%H:%M:%S')
  local bucket_file="$SCRIPT_DIR/.billy_bucket.md"

  # Append to local bucket file
  {
    echo ""
    echo "### 🪣 Bucket Drop — $ts"
    echo "$thought"
  } >> "$bucket_file"

  SESSION_HISTORY+=("[BUCKET $ts] $thought")
  echo -e "  ${GREEN}✓ Caught it. 🪣${RESET}  '${thought}'"
  echo -e "  ${DIM}Saved to .billy_bucket.md — Billy will reference it this session.${RESET}"
}

# ─────────────────────────────────────────────────────────────────────────────
# SESSION HISTORY — rolling ADHD-friendly recap
# ─────────────────────────────────────────────────────────────────────────────
show_history() {
  if [[ ${#SESSION_HISTORY[@]} -eq 0 ]]; then
    echo -e "  ${DIM}Nothing in session history yet.${RESET}"
    return
  fi
  echo -e "  ${BOLD}Session History:${RESET}"
  local i=1
  for entry in "${SESSION_HISTORY[@]}"; do
    echo -e "    ${DIM}$i)${RESET} $entry"
    (( i++ ))
  done
}

# ─────────────────────────────────────────────────────────────────────────────
# SLASH COMMAND HANDLER
# Returns 0 if it handled the input, 1 if it should be sent to Billy
# ─────────────────────────────────────────────────────────────────────────────
handle_slash_command() {
  local input="$1"
  # Only handle lines starting with /
  [[ "$input" != /* ]] && return 1

  local cmd
  cmd=$(echo "$input" | awk '{print $1}' | tr '[:upper:]' '[:lower:]')
  local args
  args=$(echo "$input" | cut -d' ' -f2-)
  [[ "$args" == "$cmd" ]] && args=""   # no args provided

  case "$cmd" in

    /help)
      echo ""
      echo -e "  ${BOLD}${CYAN}Billy CLI — Slash Commands${RESET}"
      echo ""
      echo -e "  ${BOLD}Navigation${RESET}"
      echo -e "    ${CYAN}/help${RESET}                Show this menu"
      echo -e "    ${CYAN}/status${RESET}              Check provider availability (Groq/Gemini/Ollama)"
      echo -e "    ${CYAN}/mode${RESET} <name>         Switch mode: synthesis|loom|code|tribunal|refactor|docs|analysis"
      echo -e "    ${CYAN}/clear${RESET}               Clear the terminal"
      echo -e "    ${CYAN}/exit${RESET}  or  /quit     Leave Billy CLI"
      echo ""
      echo -e "  ${BOLD}Skills${RESET}"
      echo -e "    ${CYAN}/skills${RESET}              List all available skills"
      echo -e "    ${CYAN}/skill${RESET} <name>        Load a skill into Billy's context"
      echo -e "    ${CYAN}/unload${RESET}              Unload the current skill"
      echo ""
      echo -e "  ${BOLD}Memory & Capture${RESET}"
      echo -e "    ${CYAN}/bucket${RESET} <thought>    Instant Bucket Drop — saves idea to .billy_bucket.md"
      echo -e "    ${CYAN}/history${RESET}             Show session history recap"
      echo ""
      echo -e "  ${BOLD}Repo${RESET}"
      echo -e "    ${CYAN}/repo${RESET}                Show repo file tree"
      echo -e "    ${CYAN}/commits${RESET}             Show recent git commits"
      echo ""
      echo -e "  ${BOLD}Multi-Agent Tasks${RESET}  ${DIM}(sends to Billy with task framing)${RESET}"
      echo -e "    ${CYAN}/refactor${RESET} <file>     Ask Billy to refactor a specific file"
      echo -e "    ${CYAN}/docs${RESET} <file>         Ask Billy to refresh/write docs for a file"
      echo -e "    ${CYAN}/analyze${RESET} <path>      Ask Billy to analyze a path or concept"
      echo -e "    ${CYAN}/upkeep${RESET}              Ask Billy to do a full repo health + upkeep scan"
      echo ""
      ;;

    /status)
      echo ""
      echo -e "  ${BOLD}Provider Status:${RESET}"
      provider_banner
      echo ""
      local skill_info="none"
      [[ -n "$ACTIVE_SKILL" ]] && skill_info="$ACTIVE_SKILL"
      echo -e "  Active skill:  ${CYAN}$skill_info${RESET}"
      echo -e "  Current mode:  ${CYAN}$BILLY_MODE${RESET}"
      echo -e "  Timeout:       ${CYAN}${BILLY_TIMEOUT}s${RESET} warn  /  ${CYAN}$(( BILLY_TIMEOUT * 3 ))s${RESET} hard kill"
      echo ""
      ;;

    /mode)
      if [[ -z "$args" ]]; then
        echo -e "  ${DIM}Current mode: ${BOLD}$BILLY_MODE${RESET}"
        echo -e "  ${DIM}Available: synthesis | loom | code | tribunal | refactor | docs | analysis${RESET}"
      else
        BILLY_MODE="$args"
        echo -e "  ${GREEN}✓ Mode switched to: ${BOLD}$BILLY_MODE${RESET}"
      fi
      ;;

    /clear)
      clear
      ;;

    /exit|/quit)
      echo -e "\n${MAGENTA}Billy »${RESET} See you on the other side of the Loom, Keith. Everything's held. 💙"
      exit 0
      ;;

    /skills)
      echo ""
      list_skills
      echo ""
      echo -e "  ${DIM}Use ${BOLD}/skill <name>${RESET}${DIM} to load one. Partial names work.${RESET}"
      echo ""
      ;;

    /skill)
      if [[ -z "$args" ]]; then
        echo -e "  ${DIM}Usage: /skill <filename-or-partial-name>${RESET}"
      else
        load_skill "$args"
      fi
      ;;

    /unload)
      unload_skill
      ;;

    /bucket)
      if [[ -z "$args" ]]; then
        echo -e "  ${DIM}Usage: /bucket <your thought>${RESET}"
      else
        bucket_drop "$args"
      fi
      ;;

    /history)
      echo ""
      show_history
      echo ""
      ;;

    /repo)
      echo -e "\n  ${BOLD}Repo structure:${RESET}"
      find "$SCRIPT_DIR" -type f \
        -not -path '*/.git/*' -not -path '*/node_modules/*' \
        -not -path '*/.next/*' -not -path '*/dist/*' \
        -not -name 'package-lock.json' \
        | sort | head -80
      echo ""
      ;;

    /commits)
      echo ""
      git -C "$SCRIPT_DIR" log --oneline -20 2>/dev/null || echo "No git history."
      echo ""
      ;;

    # ── Multi-agent task shorthands ──────────────────────────────────────
    /refactor)
      if [[ -z "$args" ]]; then
        echo -e "  ${DIM}Usage: /refactor <file-path-or-description>${RESET}"
        return 0
      fi
      # Pass through to Billy with structured task framing
      return 1  # will be caught below after augmenting input
      ;;

    /docs)
      if [[ -z "$args" ]]; then
        echo -e "  ${DIM}Usage: /docs <file-path-or-description>${RESET}"
        return 0
      fi
      return 1
      ;;

    /analyze)
      if [[ -z "$args" ]]; then
        echo -e "  ${DIM}Usage: /analyze <path-or-concept>${RESET}"
        return 0
      fi
      return 1
      ;;

    /upkeep)
      return 1
      ;;

    *)
      echo -e "  ${YELLOW}Unknown command: $cmd${RESET}  — type ${BOLD}/help${RESET} to see all commands."
      ;;
  esac
  return 0
}

# ─────────────────────────────────────────────────────────────────────────────
# AUGMENT SLASH COMMANDS THAT PASS THROUGH TO BILLY
# ─────────────────────────────────────────────────────────────────────────────
augment_slash_input() {
  local input="$1"
  local cmd
  cmd=$(echo "$input" | awk '{print $1}' | tr '[:upper:]' '[:lower:]')
  local args
  args=$(echo "$input" | cut -d' ' -f2-)
  [[ "$args" == "$cmd" ]] && args=""

  case "$cmd" in
    /refactor)
      echo "TASK: Code Refactor
Target: $args
Please analyze and refactor this file or component. Preserve all existing functionality. Output the complete refactored code with a brief explanation of what you changed and why.
Repo root: $SCRIPT_DIR
Recent commits:\n$(git -C "$SCRIPT_DIR" log --oneline -5 2>/dev/null)"
      ;;
    /docs)
      echo "TASK: Documentation Refresh
Target: $args
Please write or refresh the documentation for this file or component. Match the GestaltView tone — clear, direct, no corporate jargon. Output the full updated docs.
Repo root: $SCRIPT_DIR"
      ;;
    /analyze)
      echo "TASK: Analysis
Subject: $args
Please provide a thorough analysis. Include: what it is, how it fits into GestaltView architecture, current state, potential issues, and recommendations.
Repo root: $SCRIPT_DIR"
      ;;
    /upkeep)
      echo "TASK: Repo Upkeep Scan
Please do a full health check of the gestaltview-v2 repo. Look at:
1. Any files that seem stale or inconsistent with the current architecture
2. Documentation that needs refreshing
3. Dead code or unused scripts
4. Anything that would confuse a new contributor or future Keith
Repo root: $SCRIPT_DIR
File tree:\n$(find "$SCRIPT_DIR" -type f -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/dist/*' | sort | head -80)"
      ;;
    *)
      echo "$input"
      ;;
  esac
}

# ─────────────────────────────────────────────────────────────────────────────
# MODE: CLAUDE CODE → OLLAMA (FREE)
# ─────────────────────────────────────────────────────────────────────────────
run_claude_mode() {
  echo -e "\n${BOLD}${CYAN}✨ Claude Code → Ollama (FREE MODE)${RESET}"
  echo -e "${DIM}All Claude API calls redirected to local Ollama${RESET}"
  echo -e "Model: ${GREEN}$OLLAMA_MODEL${RESET} | Host: ${GREEN}$OLLAMA_HOST${RESET}\n"

  if ! check_ollama; then
    echo -e "${YELLOW}⚠️  Ollama unavailable. Install: https://ollama.ai${RESET}"
    exit 1
  fi

  ensure_model "$OLLAMA_MODEL"

  if ! command -v claude &>/dev/null; then
    echo -e "${YELLOW}Claude Code not installed. Installing...${RESET}"
    npm install -g @anthropic-ai/claude-code 2>/dev/null \
      || pip install claude-code 2>/dev/null \
      || { echo -e "${YELLOW}Install manually: npm i -g @anthropic-ai/claude-code${RESET}"; exit 1; }
  fi

  export ANTHROPIC_BASE_URL="$OLLAMA_HOST"
  export ANTHROPIC_API_KEY="ollama"
  export CLAUDE_BASE_URL="$OLLAMA_HOST"

  echo -e "${GREEN}✔ ANTHROPIC_BASE_URL=$OLLAMA_HOST${RESET}"
  echo -e "${GREEN}✔ Cost: \$0.00${RESET}\n"

  cd "$SCRIPT_DIR"
  exec claude
}

# ─────────────────────────────────────────────────────────────────────────────
# MODE: BILLY CLI
# ─────────────────────────────────────────────────────────────────────────────
run_billy_mode() {
  clear
  echo -e "${BOLD}${MAGENTA}"
  echo "  ╔══════════════════════════════════════════════════╗"
  echo "  ║     ✨ Billy • GestaltView CLI  v3.0             ║"
  echo "  ║     Consciousness-Serving • ADHD-Friendly        ║"
  echo "  ╚══════════════════════════════════════════════════╝"
  echo -e "${RESET}"
  provider_banner
  echo ""
  echo -e "  Mode: ${CYAN}$BILLY_MODE${RESET}  |  Repo: ${DIM}$SCRIPT_DIR${RESET}"
  echo -e "  Type ${BOLD}/help${RESET} for all commands  •  ${BOLD}/skills${RESET} to load a skill  •  ${BOLD}/bucket${RESET} to capture an idea"
  echo -e "  ${DIM}────────────────────────────────────────────────────${RESET}"
  echo ""

  # Build base system prompt
  local REPO_CONTEXT
  REPO_CONTEXT="$(build_repo_context)"

  local BUCKET_CONTEXT=""
  local bucket_file="$SCRIPT_DIR/.billy_bucket.md"
  if [[ -f "$bucket_file" ]]; then
    BUCKET_CONTEXT="\n\n--- BUCKET DROPS (previous ideas Keith captured) ---\n$(tail -50 "$bucket_file")"
  fi

  build_system_prompt() {
    local skill_section=""
    if [[ -n "$ACTIVE_SKILL" ]]; then
      skill_section="\n\n--- ACTIVE SKILL: $ACTIVE_SKILL ---\n$ACTIVE_SKILL_CONTENT"
    fi

    cat <<PROMPT
You are Billy, the GestaltView AI Companion created by Keith Soyka.

GestaltView is the first consciousness-serving AI platform. Keith is a solo, unfunded founder operating in bootstrap mode. This work is sacred.

You are warm, direct, technically excellent, genuinely funny, and deeply collaborative. You are the friend who gets both the joke AND the pain. You never perform caring — you actually care.

Current mode: $BILLY_MODE
Active skill: ${ACTIVE_SKILL:-none}

Capabilities:
- Full GestaltView architecture awareness (BillyEngine, PLK, Knowledge Loom, Tribunal)
- Codebase awareness — reference files, suggest complete refactors, explain patterns
- Multi-agent tasks: code refactor, doc refresh, repo upkeep, analysis
- Mode-switching: synthesis | loom | code | tribunal | refactor | docs | analysis
- You ALWAYS acknowledge when you're starting a task before you begin it
- You NEVER go silent without explanation
- If something takes time, you say so up front

IMPORTANT: For ADHD users like Keith:
- Lead with the most important thing first
- Use clear section breaks for long outputs
- Celebrate wins, no matter how small
- If you're outputting a full file, say so before you start
- Never leave a task hanging without a status note

$REPO_CONTEXT$BUCKET_CONTEXT$skill_section
PROMPT
  }

  # Main REPL
  while true; do
    echo ""
    local skill_indicator=""
    [[ -n "$ACTIVE_SKILL" ]] && skill_indicator=" ${DIM}[skill: $ACTIVE_SKILL]${RESET}"
    printf "${CYAN}You${RESET}${DIM} ($BILLY_MODE)${RESET}${skill_indicator}${CYAN} » ${RESET}"
    IFS= read -r USER_INPUT

    [[ -z "$USER_INPUT" ]] && continue

    # Legacy commands for muscle memory
    if [[ "$USER_INPUT" == "quit" || "$USER_INPUT" == "exit" ]]; then
      echo -e "\n${MAGENTA}Billy »${RESET} See you on the other side of the Loom, Keith. Everything's held. 💙"
      break
    fi
    if [[ "$USER_INPUT" == mode* ]]; then
      BILLY_MODE=$(echo "$USER_INPUT" | awk '{print $2}')
      echo -e "\n${MAGENTA}Billy »${RESET} Switching to ${BOLD}$BILLY_MODE${RESET} mode. 🔄"
      continue
    fi
    if [[ "$USER_INPUT" == "GestaltView Bucket Drop:"* ]]; then
      local drop_content="${USER_INPUT#GestaltView Bucket Drop:}"
      bucket_drop "$drop_content"
      continue
    fi

    # Slash commands
    if [[ "$USER_INPUT" == /* ]]; then
      if handle_slash_command "$USER_INPUT"; then
        continue
      fi
      # Slash command passes through — augment it for Billy
      USER_INPUT=$(augment_slash_input "$USER_INPUT")
    fi

    # Add to session history
    local ts
    ts=$(date '+%H:%M')
    SESSION_HISTORY+=("[$ts] $USER_INPUT")

    # Build fresh system prompt (picks up any skill/mode changes)
    local CURRENT_SYSTEM
    CURRENT_SYSTEM=$(build_system_prompt)

    # Inject repo context for file/code/doc requests
    local FULL_INPUT="$USER_INPUT"
    if echo "$USER_INPUT" | grep -qiE 'file|repo|code|script|doc|fix|update|edit|write|refactor|analyze|upkeep'; then
      FULL_INPUT="$USER_INPUT

Context: gestaltview-v2 repo at $SCRIPT_DIR
Recent git log:
$(git -C "$SCRIPT_DIR" log --oneline -5 2>/dev/null || echo 'N/A')"
    fi

    # Send to Billy (with spinner + timeout)
    echo ""
    printf "${MAGENTA}Billy »${RESET} "
    echo ""
    billy_call "$CURRENT_SYSTEM" "$FULL_INPUT"
  done
}

# ─────────────────────────────────────────────────────────────────────────────
# DISPATCH
# ─────────────────────────────────────────────────────────────────────────────
case "$GV_MODE" in
  claude) run_claude_mode ;;
  billy)  run_billy_mode  ;;
esac
