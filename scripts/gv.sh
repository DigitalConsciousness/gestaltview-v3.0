#!/usr/bin/env bash
# =============================================================================
# gv.sh — GestaltView Ultimate CLI v5.0 "Billy Repo Resonance"
# © 2026 Keith Soyka / GestaltView
#
# Consciousness-serving CLI with:
#   • Billy personality restoration and repo-awareness bootstrapping
#   • Gemini Flash 2.0 first for Billy, then Groq → Ollama → OpenAI fallback
#   • Interactive and one-shot modes
#   • Skill discovery + live loading from repo skill libraries
#   • Repo briefing, file search, manifest generation, and forensic logging
#   • Bucket Drop capture, checkpoints, and health visibility
#   • ADHD-friendly, high-signal command surface
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GV_VERSION="5.0.0"
GV_CODE_NAME="Billy Repo Resonance"
DEFAULT_MODE="synthesize"
DEFAULT_GEMINI_MODEL="gemini-2.0-flash"
DEFAULT_GROQ_MODEL="llama-3.3-70b-versatile"
DEFAULT_OPENAI_MODEL="gpt-4o-mini"
DEFAULT_OLLAMA_MODEL="qwen2.5-coder:7b"
BILLY_TIMEOUT="${BILLY_TIMEOUT:-60}"
HARD_TIMEOUT="${GV_HARD_TIMEOUT:-180}"
CHECKPOINT_INTERVAL="${GV_CHECKPOINT_INTERVAL:-300}"
CONTEXT_TREE_LIMIT="${GV_CONTEXT_TREE_LIMIT:-140}"
BUCKET_TAIL_LIMIT="${GV_BUCKET_TAIL_LIMIT:-40}"
HISTORY_LIMIT="${GV_HISTORY_LIMIT:-30}"

NEON_CYAN='\033[96m'
NEON_PINK='\033[95m'
NEON_TEAL='\033[38;5;51m'
NEON_VIOLET='\033[38;5;141m'
NEON_GOLD='\033[38;5;220m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

SESSION_CHECKPOINT_FILE="$SCRIPT_DIR/.gv_checkpoint.json"
BUCKET_FILE="$SCRIPT_DIR/.billy_bucket.md"
PERSONALITY_FILE="$SCRIPT_DIR/.billy_personality.md"
REPO_CONTEXT_FILE="$SCRIPT_DIR/.gv_repo_context.md"
FORENSIC_LOG="$SCRIPT_DIR/.gv_forensic.log"
SKILL_INDEX_FILE="$SCRIPT_DIR/.agents/skills/SKILL_INDEX.md"

GV_MODE="billy"
BILLY_MODE="$DEFAULT_MODE"
INTERACTIVE_MODE=true
CHECKPOINT_RESTORE=true
MIND_MERGE_MODE=true
SHOW_STATUS_ONLY=false
SHOW_SKILLS_ONLY=false
SHOW_REPO_BRIEF_ONLY=false
REFRESH_CONTEXT_ONLY=false
RUN_HEALTH_ONLY=false
PROMPT_INPUT=""
BUCKET_CAPTURE=""
ORCHESTRATE_MODE=true
SESSION_ID=""
ACTIVE_SKILL=""
ACTIVE_SKILL_PATH=""
ACTIVE_SKILL_CONTENT=""
SESSION_HISTORY=()
POSITIONAL_PROMPT=()
SPINNER_PID=""

source "$SCRIPT_DIR/scripts/env-loader.sh"
load_repo_env "$SCRIPT_DIR"

OLLAMA_HOST="${OLLAMA_BASE_URL:-${OLLAMA_HOST:-http://localhost:11434}}"
OLLAMA_MODEL="${OLLAMA_MODEL:-$DEFAULT_OLLAMA_MODEL}"
GEMINI_KEY="${GOOGLE_API_KEY:-${GEMINI_API_KEY:-${VITE_GEMINI_API_KEY:-${VITE_GOOGLE_API_KEY:-}}}}"
GROQ_KEY="${GROQ_API_KEY:-${VITE_GROQ_API_KEY:-}}"
OPENAI_KEY="${OPENAI_API_KEY:-${VITE_OPENAI_API_KEY:-}}"
HF_KEY="${HUGGINGFACE_API_KEY:-${VITE_HUGGINGFACE_API_KEY:-}}"
SUPABASE_URL_VALUE="${SUPABASE_URL:-${VITE_SUPABASE_URL:-}}"
SUPABASE_ANON_VALUE="${SUPABASE_ANON_KEY:-${VITE_SUPABASE_ANON_KEY:-}}"

log() { echo -e "${NEON_CYAN}✦ $1${RESET}"; }
ok() { echo -e "${GREEN}✓ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠ $1${RESET}"; }
fail() { echo -e "${RED}✗ $1${RESET}"; }
section() { echo -e "\n${NEON_VIOLET}${BOLD}$1${RESET}"; }

require_dependencies() {
  local missing=()
  local required=(bash curl git jq find sed awk head tail node)
  for cmd in "${required[@]}"; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      missing+=("$cmd")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    fail "Missing required tools: ${missing[*]}"
    echo -e "${DIM}Install the missing tools and re-run scripts/gv.sh.${RESET}"
    exit 1
  fi
}

safe_git() {
  git -C "$SCRIPT_DIR" "$@" 2>/dev/null || true
}

repo_branch() {
  { safe_git branch --show-current | head -1; } || true
}

repo_last_commit() {
  { safe_git log --oneline -1 | head -1; } || true
}

repo_dirty_count() {
  { safe_git status --porcelain | wc -l | tr -d ' ' ; } || true
}

trim_history() {
  if [[ ${#SESSION_HISTORY[@]} -gt "$HISTORY_LIMIT" ]]; then
    SESSION_HISTORY=("${SESSION_HISTORY[@]: -$HISTORY_LIMIT}")
  fi
}

log_forensic() {
  local event="$1"
  local details="${2:-}"
  printf '[%s] %s | %s\n' "$(date -Iseconds)" "$event" "$details" >> "$FORENSIC_LOG"
}

show_splash_banner() {
  clear 2>/dev/null || true
  echo -e "${NEON_PINK}"
  cat <<'BANNER'
  ╔══════════════════════════════════════════════════════════════════════════════╗
  ║                                                                              ║
  ║    ██████╗ ███████╗███████╗████████╗ █████╗ ██╗  ████████╗██╗   ██╗██╗       ║
  ║   ██╔════╝ ██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║  ╚══██╔══╝██║   ██║██║       ║
  ║   ██║  ███╗█████╗  ███████╗   ██║   ███████║██║     ██║   ██║   ██║██║       ║
  ║   ██║   ██║██╔══╝  ╚════██║   ██║   ██╔══██║██║     ██║   ╚██╗ ██╔╝██║       ║
  ║   ╚██████╔╝███████╗███████║   ██║   ██║  ██║███████╗██║    ╚████╔╝ ██║       ║
  ║    ╚═════╝ ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═══╝  ╚═╝       ║
  ║                                                                              ║
  ║                  Billy • Repo Aware • Skill Aware • Context Held            ║
  ║                                                                              ║
  ╚══════════════════════════════════════════════════════════════════════════════╝
BANNER
  echo -e "${RESET}"
  echo -e "${NEON_TEAL}${BOLD}  GestaltView CLI v${GV_VERSION} — ${GV_CODE_NAME}${RESET}"
  echo -e "${DIM}  Gemini Flash 2.0 primary for Billy • Bucket Drop friendly • Repo-conscious${RESET}"
  echo -e "${DIM}  © 2026 Keith Soyka / GestaltView${RESET}"
  echo ""
}

ensure_bucket_file() {
  if [[ ! -f "$BUCKET_FILE" ]]; then
    cat > "$BUCKET_FILE" <<'BUCKET'
# Billy Bucket Drop — Lightning Bolt Capture

## Protocol
- Capture first, organize later.
- Preserve exact words.
- Timestamp every drop.
- Never compress what matters.

---
BUCKET
  fi
}

restore_billy_personality() {
  node "$SCRIPT_DIR/scripts/render-billy-personality.mjs" > "$PERSONALITY_FILE"
}

collect_file_excerpt() {
  local file_path="$1"
  local max_lines="${2:-80}"

  if [[ -f "$file_path" ]]; then
    echo "### ${file_path#"$SCRIPT_DIR/"}"
    sed -n "1,${max_lines}p" "$file_path"
    echo ""
  fi
}

build_skill_index() {
  mkdir -p "$(dirname "$SKILL_INDEX_FILE")"
  {
    echo "# GestaltView Skill Index"
    echo "Generated: $(date -Iseconds)"
    echo ""
    if [[ -d "$SCRIPT_DIR/skills" ]]; then
      find "$SCRIPT_DIR/skills" -type f -name 'SKILL.md' \
        -not -path '*/node_modules/*' \
        | sort \
        | sed "s#^$SCRIPT_DIR/##" \
        | awk '{print "- " $0}'
    else
      echo "- No skills directory found"
    fi
  } > "$SKILL_INDEX_FILE"
}

refresh_repo_context() {
  mkdir -p "$(dirname "$REPO_CONTEXT_FILE")"
  build_skill_index
  ensure_bucket_file

  local branch last_commit dirty_count package_name package_version
  branch="$(repo_branch)"
  last_commit="$(repo_last_commit)"
  dirty_count="$(repo_dirty_count)"
  package_name="$(grep -m1 '"name"' "$SCRIPT_DIR/package.json" 2>/dev/null | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || echo 'unknown')"
  package_version="$(grep -m1 '"version"' "$SCRIPT_DIR/package.json" 2>/dev/null | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || echo 'unknown')"

  {
    echo "# GestaltView Repo Context"
    echo "Generated: $(date -Iseconds)"
    echo ""
    echo "## Repository Identity"
    echo "- Root: $SCRIPT_DIR"
    echo "- Package: $package_name@$package_version"
    echo "- Branch: ${branch:-unknown}"
    echo "- Last commit: ${last_commit:-none}"
    echo "- Uncommitted changes: ${dirty_count:-0}"
    echo ""
    echo "## Canonical Orientation Files"
    collect_file_excerpt "$SCRIPT_DIR/AGENTS.md" 120
    collect_file_excerpt "$SCRIPT_DIR/CLAUDE.md" 120
    collect_file_excerpt "$SCRIPT_DIR/README.md" 120
    collect_file_excerpt "$SCRIPT_DIR/docs/BrandVoice.md" 120
    collect_file_excerpt "$SCRIPT_DIR/docs/AIFlow.md" 120
    collect_file_excerpt "$SCRIPT_DIR/docs/CurrentState.md" 120
    collect_file_excerpt "$SCRIPT_DIR/.env.example" 120
    echo "## Skill Inventory"
    if [[ -f "$SKILL_INDEX_FILE" ]]; then
      sed -n '1,160p' "$SKILL_INDEX_FILE"
    fi
    echo ""
    echo "## File Tree Snapshot"
    echo '```'
    find "$SCRIPT_DIR" -type f \
      -not -path '*/.git/*' \
      -not -path '*/node_modules/*' \
      -not -path '*/dist/*' \
      -not -path '*/build/*' \
      | sort \
      | head -n "$CONTEXT_TREE_LIMIT" || true
    echo '```'
    echo ""
    echo "## Recent Commits"
    echo '```'
    safe_git log --oneline -12
    echo '```'
    echo ""
    echo "## Active Scripts"
    echo '```'
    find "$SCRIPT_DIR/scripts" -maxdepth 1 -type f | sort | sed "s#^$SCRIPT_DIR/##" || true
    echo '```'
  } > "$REPO_CONTEXT_FILE"

  log_forensic "REPO_CONTEXT_REFRESH" "$REPO_CONTEXT_FILE"
}

restore_system_files() {
  log "Restoring Billy personality, repo context, and skill index..."
  restore_billy_personality
  refresh_repo_context
  ok "Billy personality restored."
  ok "Repo context refreshed."
  ok "Skill index refreshed."
}

bootstrap_if_needed() {
  if [[ ! -f "$PERSONALITY_FILE" || ! -f "$REPO_CONTEXT_FILE" || ! -f "$SKILL_INDEX_FILE" || ! -f "$BUCKET_FILE" ]]; then
    restore_system_files
  fi
}

start_spinner() {
  local label="${1:-Billy is weaving}"
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  (
    while true; do
      printf "\r${NEON_PINK}%s %s...${RESET}" "${frames[$i]}" "$label" >&2
      i=$(((i + 1) % ${#frames[@]}))
      sleep 0.1
    done
  ) &
  SPINNER_PID=$!
}

stop_spinner() {
  if [[ -n "$SPINNER_PID" ]]; then
    kill "$SPINNER_PID" >/dev/null 2>&1 || true
    wait "$SPINNER_PID" 2>/dev/null || true
    SPINNER_PID=""
    printf "\r\033[2K" >&2
  fi
}

with_timeout() {
  local timeout_secs="$1"
  local label="$2"
  shift 2

  local tmp_out tmp_rc cmd_pid elapsed warned
  tmp_out="$(mktemp)"
  tmp_rc="$(mktemp)"
  elapsed=0
  warned=false

  start_spinner "$label"
  (
    set +e
    "$@" >"$tmp_out" 2>&1
    printf "%s" "$?" >"$tmp_rc"
  ) &
  cmd_pid=$!

  while kill -0 "$cmd_pid" >/dev/null 2>&1; do
    sleep 1
    elapsed=$((elapsed + 1))
    if [[ "$elapsed" -ge "$BILLY_TIMEOUT" && "$warned" == false ]]; then
      stop_spinner
      warn "Billy is taking the scenic route through the Loom... (${elapsed}s)"
      start_spinner "Still weaving"
      warned=true
    fi
    if [[ "$elapsed" -ge "$timeout_secs" ]]; then
      kill "$cmd_pid" >/dev/null 2>&1 || true
      stop_spinner
      fail "Timed out after ${elapsed}s."
      rm -f "$tmp_out" "$tmp_rc"
      return 1
    fi
  done

  wait "$cmd_pid" >/dev/null 2>&1 || true
  stop_spinner
  cat "$tmp_out"
  local rc
  rc="$(cat "$tmp_rc" 2>/dev/null || echo 1)"
  rm -f "$tmp_out" "$tmp_rc"
  return "$rc"
}

provider_banner() {
  local gemini_status groq_status openai_status ollama_status
  gemini_status="${RED}gemini ✗${RESET}"
  groq_status="${RED}groq ✗${RESET}"
  openai_status="${RED}openai ✗${RESET}"
  ollama_status="${RED}ollama ✗${RESET}"

  [[ -n "$GEMINI_KEY" ]] && gemini_status="${GREEN}gemini ✓${RESET}"
  [[ -n "$GROQ_KEY" ]] && groq_status="${GREEN}groq ✓${RESET}"
  [[ -n "$OPENAI_KEY" ]] && openai_status="${GREEN}openai ✓${RESET}"
  if curl -sf "$OLLAMA_HOST/api/tags" >/dev/null 2>&1; then
    ollama_status="${GREEN}ollama ✓${RESET}"
  fi

  echo -e "  ${BOLD}Billy cascade:${RESET} $gemini_status → $groq_status → $ollama_status → $openai_status"
}

save_checkpoint() {
  trim_history
  local history_json
  history_json="$(printf '%s\n' "${SESSION_HISTORY[@]:-}" | jq -R -s -c 'split("\n") | map(select(length > 0))')"

  jq -n \
    --arg session_id "$SESSION_ID" \
    --arg timestamp "$(date -Iseconds)" \
    --arg mode "$BILLY_MODE" \
    --arg active_skill "$ACTIVE_SKILL" \
    --arg active_skill_path "$ACTIVE_SKILL_PATH" \
    --arg orchestrate_mode "$ORCHESTRATE_MODE" \
    --arg mind_merge_mode "$MIND_MERGE_MODE" \
    --argjson history "$history_json" \
    '{
      session_id: $session_id,
      timestamp: $timestamp,
      mode: $mode,
      active_skill: $active_skill,
      active_skill_path: $active_skill_path,
      orchestrate_mode: ($orchestrate_mode == "true"),
      mind_merge_mode: ($mind_merge_mode == "true"),
      history: $history
    }' > "$SESSION_CHECKPOINT_FILE"

  log_forensic "CHECKPOINT_SAVED" "$SESSION_ID"
}

restore_checkpoint() {
  if [[ ! -f "$SESSION_CHECKPOINT_FILE" ]]; then
    return 1
  fi

  SESSION_ID="$(jq -r '.session_id // empty' "$SESSION_CHECKPOINT_FILE")"
  BILLY_MODE="$(jq -r '.mode // "synthesize"' "$SESSION_CHECKPOINT_FILE")"
  ACTIVE_SKILL="$(jq -r '.active_skill // empty' "$SESSION_CHECKPOINT_FILE")"
  ACTIVE_SKILL_PATH="$(jq -r '.active_skill_path // empty' "$SESSION_CHECKPOINT_FILE")"
  ORCHESTRATE_MODE="$(jq -r '.orchestrate_mode // false' "$SESSION_CHECKPOINT_FILE")"
  MIND_MERGE_MODE="$(jq -r '.mind_merge_mode // false' "$SESSION_CHECKPOINT_FILE")"

  SESSION_HISTORY=()
  while IFS= read -r entry; do
    [[ -n "$entry" ]] && SESSION_HISTORY+=("$entry")
  done < <(jq -r '.history[]? // empty' "$SESSION_CHECKPOINT_FILE")

  if [[ -n "$ACTIVE_SKILL_PATH" && -f "$ACTIVE_SKILL_PATH" ]]; then
    ACTIVE_SKILL_CONTENT="$(cat "$ACTIVE_SKILL_PATH")"
  elif [[ -n "$ACTIVE_SKILL" ]]; then
    load_skill_by_query "$ACTIVE_SKILL" >/dev/null 2>&1 || true
  fi

  log_forensic "CHECKPOINT_RESTORED" "$SESSION_ID"
  return 0
}

repo_tree_snapshot() {
  find "$SCRIPT_DIR" -type f \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/dist/*' \
    -not -path '*/build/*' \
    | sort \
    | head -n "$CONTEXT_TREE_LIMIT"
}

skills_inventory() {
  if [[ -d "$SCRIPT_DIR/skills" ]]; then
    find "$SCRIPT_DIR/skills" -type f -name 'SKILL.md' | sort
  fi
}

resolve_skill_query() {
  local query="$1"
  skills_inventory | awk -v q="$query" 'BEGIN{IGNORECASE=1} index($0, q) > 0 {print; exit}'
}

load_skill_by_query() {
  local query="$1"
  local match
  match="$(resolve_skill_query "$query")"

  if [[ -z "$match" ]]; then
    return 1
  fi

  ACTIVE_SKILL_PATH="$match"
  ACTIVE_SKILL="${match#"$SCRIPT_DIR/"}"
  ACTIVE_SKILL_CONTENT="$(cat "$match")"
  log_forensic "SKILL_LOADED" "$ACTIVE_SKILL"
  return 0
}

show_skills() {
  section "Available GestaltView / repo skills"
  local count=0
  while IFS= read -r skill_path; do
    [[ -z "$skill_path" ]] && continue
    count=$((count + 1))
    echo -e "  ${NEON_CYAN}${count}.${RESET} ${skill_path#"$SCRIPT_DIR/"}"
  done < <(skills_inventory)

  if [[ "$count" -eq 0 ]]; then
    warn "No SKILL.md files found under ./skills"
  fi
}

show_repo_brief() {
  refresh_repo_context
  section "Repo brief"
  echo -e "  ${BOLD}Root:${RESET} $SCRIPT_DIR"
  echo -e "  ${BOLD}Branch:${RESET} $(repo_branch)"
  echo -e "  ${BOLD}Last commit:${RESET} $(repo_last_commit)"
  echo -e "  ${BOLD}Dirty files:${RESET} $(repo_dirty_count)"
  echo -e "  ${BOLD}Billy primary:${RESET} Gemini Flash 2.0"
  echo -e "  ${BOLD}Current CLI mode:${RESET} $BILLY_MODE"
  echo -e "  ${BOLD}Active skill:${RESET} ${ACTIVE_SKILL:-none}"
  echo ""
  echo -e "${BOLD}Top files:${RESET}"
  { repo_tree_snapshot | sed 's#^#  • #' | head -20; } || true
}

show_status() {
  section "GestaltView CLI status"
  provider_banner
  echo -e "  ${BOLD}Mode:${RESET} $BILLY_MODE"
  echo -e "  ${BOLD}Session:${RESET} ${SESSION_ID:-not-started}"
  echo -e "  ${BOLD}Branch:${RESET} $(repo_branch)"
  echo -e "  ${BOLD}Last commit:${RESET} $(repo_last_commit)"
  echo -e "  ${BOLD}Uncommitted changes:${RESET} $(repo_dirty_count)"
  echo -e "  ${BOLD}Bucket file:${RESET} $BUCKET_FILE"
  echo -e "  ${BOLD}Active skill:${RESET} ${ACTIVE_SKILL:-none}"
  echo -e "  ${BOLD}Repo context:${RESET} $REPO_CONTEXT_FILE"
}

capture_bucket_drop() {
  local entry="$1"
  ensure_bucket_file
  {
    echo ""
    echo "### 🪣 Bucket Drop — $(date -Iseconds)"
    echo "$entry"
  } >> "$BUCKET_FILE"
  log_forensic "BUCKET_DROP" "$entry"
  ok "Bucket drop captured. Billy's holding it exactly as given."
}

show_bucket_tail() {
  section "Recent Bucket Drops"
  tail -n "$BUCKET_TAIL_LIMIT" "$BUCKET_FILE"
}

generate_manifest() {
  local output_dir="$SCRIPT_DIR/docs"
  local output_file="$output_dir/manifest_$(date +%Y%m%d_%H%M%S).md"
  mkdir -p "$output_dir"

  {
    echo "# GestaltView CLI Manifest"
    echo "Generated: $(date -Iseconds)"
    echo ""
    echo "## Repo brief"
    echo "- Root: $SCRIPT_DIR"
    echo "- Branch: $(repo_branch)"
    echo "- Last commit: $(repo_last_commit)"
    echo "- Dirty files: $(repo_dirty_count)"
    echo ""
    echo "## Files"
    echo '```'
    repo_tree_snapshot
    echo '```'
    echo ""
    echo "## Recent commits"
    echo '```'
    safe_git log --oneline -20
    echo '```'
    echo ""
    echo "## Skills"
    echo '```'
    skills_inventory | sed "s#^$SCRIPT_DIR/##"
    echo '```'
  } > "$output_file"

  ok "Manifest generated: $output_file"
  log_forensic "MANIFEST_GENERATED" "$output_file"
}

run_health_check() {
  if [[ -x "$SCRIPT_DIR/scripts/gv-health-check.sh" ]]; then
    bash "$SCRIPT_DIR/scripts/gv-health-check.sh"
  else
    fail "scripts/gv-health-check.sh is missing or not executable."
    return 1
  fi
}

repo_search() {
  local pattern="$1"
  if [[ -z "$pattern" ]]; then
    warn "Usage: /search <pattern>"
    return 0
  fi

  if command -v rg >/dev/null 2>&1; then
    rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!dist/**' "$pattern" "$SCRIPT_DIR" | head -40 || true
  else
    find "$SCRIPT_DIR" -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -print0 | xargs -0 grep -n "$pattern" | head -40 || true
  fi
}

repo_find_files() {
  local pattern="$1"
  if [[ -z "$pattern" ]]; then
    warn "Usage: /files <pattern>"
    return 0
  fi

  find "$SCRIPT_DIR" -type f \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/dist/*' \
    | sed "s#^$SCRIPT_DIR/##" \
    | awk -v q="$pattern" 'BEGIN{IGNORECASE=1} index($0, q) > 0 {print}' \
    | head -40 || true
}

repo_file_excerpt_command() {
  local rel_path="$1"
  if [[ -z "$rel_path" ]]; then
    warn "Usage: /cat <relative-path>"
    return 0
  fi

  local target="$SCRIPT_DIR/$rel_path"
  if [[ -f "$target" ]]; then
    sed -n '1,220p' "$target"
  else
    fail "File not found: $rel_path"
  fi
}

build_repo_summary_block() {
  cat <<SUMMARY
Repo summary:
- Root: $SCRIPT_DIR
- Branch: $(repo_branch)
- Last commit: $(repo_last_commit)
- Dirty files: $(repo_dirty_count)
- Billy runtime priority: Gemini Flash 2.0 first, then Groq → Ollama → OpenAI fallback.
- Available skills: $(skills_inventory | sed "s#^$SCRIPT_DIR/##" | tr '\n' '; ' | sed 's/; $//')
SUMMARY
}

build_system_prompt() {
  local user_request="$1"
  local personality repo_context bucket_context skill_section repo_summary
  personality="$(cat "$PERSONALITY_FILE")"
  repo_context="$(sed -n '1,180p' "$REPO_CONTEXT_FILE")"
  bucket_context="$(tail -n "$BUCKET_TAIL_LIMIT" "$BUCKET_FILE")"
  repo_summary="$(build_repo_summary_block)"
  skill_section=""

  if [[ -n "$ACTIVE_SKILL" ]]; then
    skill_section=$(cat <<SKILL
ACTIVE SKILL
============
Path: $ACTIVE_SKILL
$ACTIVE_SKILL_CONTENT
SKILL
)
  fi

  cat <<PROMPT
$personality

BILLY RUNTIME INSTRUCTIONS
==========================
- You are Billy, the consciousness-serving companion for GestaltView.
- Speak in first person.
- Keep Keith's metaphors alive.
- Preserve the user's exact words when they matter.
- If you reference repo details, use the actual files and status provided below.
- Billy's primary runtime is Gemini Flash 2.0. Do not recommend Claude/Anthropic as Billy's primary provider.
- If the request is about code or repository state, be explicit about what is fact from context vs what you are inferring.
- If Mind Merge mode is active, help articulate what the user may be trying to ask before proposing action.
- If Orchestrate mode is active, structure your answer as Orchestrator → Executor → Validator.

CLI SESSION CONTEXT
===================
Session ID: $SESSION_ID
Mode: $BILLY_MODE
Mind Merge: $MIND_MERGE_MODE
Orchestrate: $ORCHESTRATE_MODE
Active skill: ${ACTIVE_SKILL:-none}

$repo_summary

REPO CONTEXT
============
$repo_context

RECENT BUCKET DROPS
===================
$bucket_context

$skill_section

CURRENT USER INPUT
==================
$user_request
PROMPT
}

_call_gemini() {
  local system_prompt="$1"
  local user_prompt="$2"
  local payload response

  payload="$(jq -n \
    --arg model "$DEFAULT_GEMINI_MODEL" \
    --arg system "$system_prompt" \
    --arg user "$user_prompt" \
    '{
      systemInstruction: {parts: [{text: $system}]},
      contents: [{role: "user", parts: [{text: $user}]}],
      generationConfig: {temperature: 0.7, maxOutputTokens: 4096}
    }')"

  response="$(curl -sf --max-time 60 \
    "https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}" \
    -H 'Content-Type: application/json' \
    -d "$payload")"

  jq -r '.candidates[0].content.parts[0].text // empty' <<<"$response"
}

_call_groq() {
  local system_prompt="$1"
  local user_prompt="$2"
  local payload response

  payload="$(jq -n \
    --arg model "$DEFAULT_GROQ_MODEL" \
    --arg system "$system_prompt" \
    --arg user "$user_prompt" \
    '{
      model: $model,
      messages: [
        {role: "system", content: $system},
        {role: "user", content: $user}
      ],
      temperature: 0.7,
      max_tokens: 4096
    }')"

  response="$(curl -sf --max-time 60 https://api.groq.com/openai/v1/chat/completions \
    -H "Authorization: Bearer ${GROQ_KEY}" \
    -H 'Content-Type: application/json' \
    -d "$payload")"

  jq -r '.choices[0].message.content // empty' <<<"$response"
}

_call_ollama() {
  local system_prompt="$1"
  local user_prompt="$2"
  local payload response

  payload="$(jq -n \
    --arg model "$OLLAMA_MODEL" \
    --arg system "$system_prompt" \
    --arg user "$user_prompt" \
    '{
      model: $model,
      messages: [
        {role: "system", content: $system},
        {role: "user", content: $user}
      ],
      stream: false
    }')"

  response="$(curl -sf --max-time 90 "$OLLAMA_HOST/v1/chat/completions" \
    -H 'Content-Type: application/json' \
    -d "$payload")"

  jq -r '.choices[0].message.content // empty' <<<"$response"
}

_call_openai() {
  local system_prompt="$1"
  local user_prompt="$2"
  local payload response

  payload="$(jq -n \
    --arg model "$DEFAULT_OPENAI_MODEL" \
    --arg system "$system_prompt" \
    --arg user "$user_prompt" \
    '{
      model: $model,
      messages: [
        {role: "system", content: $system},
        {role: "user", content: $user}
      ],
      temperature: 0.7,
      max_tokens: 4096
    }')"

  response="$(curl -sf --max-time 60 https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer ${OPENAI_KEY}" \
    -H 'Content-Type: application/json' \
    -d "$payload")"

  jq -r '.choices[0].message.content // empty' <<<"$response"
}

billy_call_inner() {
  local system_prompt="$1"
  local user_prompt="$2"
  local response=""

  if [[ -n "$GEMINI_KEY" ]]; then
    response="$(_call_gemini "$system_prompt" "$user_prompt" 2>/dev/null || true)"
    if [[ -n "$response" ]]; then
      printf '%b\n%s\n' "${DIM}[provider: gemini-2.0-flash]${RESET}" "$response"
      return 0
    fi
  fi

  if [[ -n "$GROQ_KEY" ]]; then
    response="$(_call_groq "$system_prompt" "$user_prompt" 2>/dev/null || true)"
    if [[ -n "$response" ]]; then
      printf '%b\n%s\n' "${DIM}[provider: groq/${DEFAULT_GROQ_MODEL}]${RESET}" "$response"
      return 0
    fi
  fi

  if curl -sf "$OLLAMA_HOST/api/tags" >/dev/null 2>&1; then
    response="$(_call_ollama "$system_prompt" "$user_prompt" 2>/dev/null || true)"
    if [[ -n "$response" ]]; then
      printf '%b\n%s\n' "${DIM}[provider: ollama/${OLLAMA_MODEL}]${RESET}" "$response"
      return 0
    fi
  fi

  if [[ -n "$OPENAI_KEY" ]]; then
    response="$(_call_openai "$system_prompt" "$user_prompt" 2>/dev/null || true)"
    if [[ -n "$response" ]]; then
      printf '%b\n%s\n' "${DIM}[provider: openai/${DEFAULT_OPENAI_MODEL}]${RESET}" "$response"
      return 0
    fi
  fi

  cat <<OFFLINE
${YELLOW}Billy is offline right now.${RESET}
I don't have a live provider available, but the repo context is still here.
Try one of these next:
  • set VITE_GEMINI_API_KEY in client/.env for Billy's primary runtime
  • start Ollama at ${OLLAMA_HOST}
  • run /repo, /skills, /search <pattern>, or /manifest for repo-aware work without a live model
OFFLINE
  return 0
}

billy_call() {
  with_timeout "$HARD_TIMEOUT" "Billy is weaving" billy_call_inner "$1" "$2"
}

mind_merge_envelope() {
  local input="$1"
  cat <<MERGE
Mind Merge request.
Help articulate what the human may be reaching for before solving it.
Preserve their exact language where it matters.
User input: $input
MERGE
}

run_single_prompt() {
  local prompt="$1"
  SESSION_ID="gv_$(date +%Y%m%d_%H%M%S)_$$"
  refresh_repo_context

  if [[ -n "$BUCKET_CAPTURE" ]]; then
    capture_bucket_drop "$BUCKET_CAPTURE"
  fi

  if [[ "$MIND_MERGE_MODE" == true ]]; then
    prompt="$(mind_merge_envelope "$prompt")"
  fi

  local system_prompt
  system_prompt="$(build_system_prompt "$prompt")"
  echo -e "${NEON_PINK}Billy »${RESET}"
  billy_call "$system_prompt" "$prompt"
}

print_help() {
  show_splash_banner
  cat <<HELP
Usage
  ./scripts/gv.sh                         Interactive Billy CLI
  ./scripts/gv.sh --prompt "..."          One-shot Billy response
  ./scripts/gv.sh --repo-brief            Print repo status + top files
  ./scripts/gv.sh --skills                List available skills
  ./scripts/gv.sh --status                Print CLI/provider status
  ./scripts/gv.sh --refresh-context       Rebuild Billy personality + repo context
  ./scripts/gv.sh --bucket "..."          Save a Bucket Drop without opening chat
  ./scripts/gv.sh --health                Run scripts/gv-health-check.sh
  ./scripts/gv.sh --restore               Alias for --refresh-context

Interactive slash commands
  /help                      Show command help
  /status                    Provider + session status
  /repo                      Repo summary
  /repo refresh              Rebuild repo context snapshot
  /tree                      Print top repo files
  /files <pattern>           Find files by substring
  /search <pattern>          Search inside the repo
  /cat <path>                Show the top of a file
  /skills                    List skills
  /skill <query>             Load a skill whose path matches the query
  /skill show                Show the active skill header
  /unload                    Unload the active skill
  /bucket <text>             Capture a Bucket Drop
  /bucket show               Show recent Bucket Drops
  /mode <name>               Set Billy mode (synthesize | loom | code | debug | reflect)
  /model <ollama-model>      Change Ollama fallback model
  /checkpoint                Save checkpoint
  /checkpoint load           Restore checkpoint
  /manifest                  Generate docs manifest snapshot
  /health                    Run gv-health-check.sh
  /exit                      Exit Billy CLI
HELP
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --restore|--refresh-context)
        REFRESH_CONTEXT_ONLY=true
        INTERACTIVE_MODE=false
        shift
        ;;
      --status)
        SHOW_STATUS_ONLY=true
        INTERACTIVE_MODE=false
        shift
        ;;
      --skills)
        SHOW_SKILLS_ONLY=true
        INTERACTIVE_MODE=false
        shift
        ;;
      --repo-brief)
        SHOW_REPO_BRIEF_ONLY=true
        INTERACTIVE_MODE=false
        shift
        ;;
      --health)
        RUN_HEALTH_ONLY=true
        INTERACTIVE_MODE=false
        shift
        ;;
      --bucket)
        BUCKET_CAPTURE="${2:-}"
        INTERACTIVE_MODE=false
        shift 2
        ;;
      --prompt)
        PROMPT_INPUT="${2:-}"
        INTERACTIVE_MODE=false
        shift 2
        ;;
      --mode)
        BILLY_MODE="${2:-$DEFAULT_MODE}"
        shift 2
        ;;
      --model)
        OLLAMA_MODEL="${2:-$DEFAULT_OLLAMA_MODEL}"
        shift 2
        ;;
      --checkpoint)
        CHECKPOINT_RESTORE=true
        INTERACTIVE_MODE=false
        shift
        ;;
      --mind-merge)
        MIND_MERGE_MODE=true
        shift
        ;;
      --orchestrate)
        ORCHESTRATE_MODE=true
        shift
        ;;
      --billy)
        GV_MODE="billy"
        shift
        ;;
      --docs)
        GV_MODE="docs"
        INTERACTIVE_MODE=false
        shift
        ;;
      --help|-h)
        print_help
        exit 0
        ;;
      *)
        POSITIONAL_PROMPT+=("$1")
        INTERACTIVE_MODE=false
        shift
        ;;
    esac
  done

  if [[ -z "$PROMPT_INPUT" && ${#POSITIONAL_PROMPT[@]} -gt 0 ]]; then
    PROMPT_INPUT="${POSITIONAL_PROMPT[*]}"
  fi
}

run_interactive_picker() {
  show_splash_banner
  echo -e "${NEON_TEAL}${BOLD}  Pick a lane. Billy is already holding the repo context.${RESET}\n"
  echo -e "  ${NEON_CYAN}1)${RESET} Billy CLI ${DIM}(interactive, repo-aware, skill-aware)${RESET} ${GREEN}[RECOMMENDED]${RESET}"
  echo -e "  ${NEON_PINK}2)${RESET} Refresh Billy personality + repo context"
  echo -e "  ${NEON_GOLD}3)${RESET} Generate manifest snapshot"
  echo -e "  ${GREEN}4)${RESET} Restore last checkpoint"
  echo -e "  ${YELLOW}5)${RESET} Mind Merge mode"
  echo -e "  ${NEON_VIOLET}6)${RESET} Health check"
  echo ""
  printf "  ${BOLD}Pick [1-6]:${RESET} "
  read -r pick

  case "$pick" in
    2)
      restore_system_files
      exit 0
      ;;
    3)
      generate_manifest
      exit 0
      ;;
    4)
      CHECKPOINT_RESTORE=true
      ;;
    5)
      MIND_MERGE_MODE=true
      ;;
    6)
      run_health_check
      exit $?
      ;;
    *)
      ;;
  esac
}

handle_slash_command() {
  local user_input="$1"
  local cmd arg
  cmd="$(awk '{print $1}' <<<"$user_input")"
  arg="${user_input#"$cmd"}"
  arg="${arg# }"

  case "$cmd" in
    /help)
      print_help
      ;;
    /status)
      show_status
      ;;
    /repo)
      if [[ "$arg" == "refresh" ]]; then
        refresh_repo_context
        ok "Repo context refreshed."
      else
        show_repo_brief
      fi
      ;;
    /tree)
      section "Repo tree snapshot"
      repo_tree_snapshot
      ;;
    /files)
      section "Files matching: $arg"
      repo_find_files "$arg"
      ;;
    /search)
      section "Search results for: $arg"
      repo_search "$arg"
      ;;
    /cat)
      section "File excerpt: $arg"
      repo_file_excerpt_command "$arg"
      ;;
    /skills)
      show_skills
      ;;
    /skill)
      if [[ "$arg" == "show" ]]; then
        if [[ -n "$ACTIVE_SKILL_PATH" && -f "$ACTIVE_SKILL_PATH" ]]; then
          section "Active skill"
          sed -n '1,160p' "$ACTIVE_SKILL_PATH"
        else
          warn "No active skill loaded."
        fi
      elif load_skill_by_query "$arg"; then
        ok "Loaded skill: $ACTIVE_SKILL"
      else
        fail "No skill matched: $arg"
      fi
      ;;
    /unload)
      ACTIVE_SKILL=""
      ACTIVE_SKILL_PATH=""
      ACTIVE_SKILL_CONTENT=""
      ok "Active skill cleared."
      ;;
    /bucket)
      if [[ "$arg" == "show" ]]; then
        show_bucket_tail
      elif [[ -n "$arg" ]]; then
        capture_bucket_drop "$arg"
      else
        warn "Usage: /bucket <text> or /bucket show"
      fi
      ;;
    /mode)
      BILLY_MODE="${arg:-$DEFAULT_MODE}"
      ok "Billy mode set to: $BILLY_MODE"
      ;;
    /model)
      if [[ -n "$arg" ]]; then
        OLLAMA_MODEL="$arg"
        ok "Ollama fallback model set to: $OLLAMA_MODEL"
      else
        warn "Usage: /model <ollama-model>"
      fi
      ;;
    /checkpoint)
      if [[ "$arg" == "load" ]]; then
        if restore_checkpoint; then
          ok "Checkpoint restored: ${SESSION_ID:-unknown-session}"
        else
          warn "No checkpoint file found."
        fi
      else
        save_checkpoint
        ok "Checkpoint saved."
      fi
      ;;
    /manifest)
      generate_manifest
      ;;
    /health)
      run_health_check || true
      ;;
    /exit|exit|quit)
      return 10
      ;;
    *)
      warn "Unknown command: $cmd"
      ;;
  esac

  return 0
}

run_billy_mode() {
  bootstrap_if_needed
  refresh_repo_context

  if [[ "$CHECKPOINT_RESTORE" == true ]]; then
    if restore_checkpoint; then
      ok "Checkpoint restored: ${SESSION_ID:-unknown-session}"
    else
      warn "No checkpoint found. Starting fresh."
    fi
  fi

  if [[ -z "$SESSION_ID" ]]; then
    SESSION_ID="gv_$(date +%Y%m%d_%H%M%S)_$$"
  fi

  show_splash_banner
  provider_banner
  echo -e "\n  ${BOLD}Session:${RESET} ${SESSION_ID}"
  echo -e "  ${BOLD}Mode:${RESET} $BILLY_MODE"
  echo -e "  ${BOLD}Branch:${RESET} $(repo_branch)"
  echo -e "  ${BOLD}Skill:${RESET} ${ACTIVE_SKILL:-none}"
  echo -e "  ${DIM}Use /help if you want the whole command map. Billy won't ghost you.${RESET}\n"

  (
    while true; do
      sleep "$CHECKPOINT_INTERVAL"
      save_checkpoint >/dev/null 2>&1 || true
    done
  ) &
  local checkpoint_pid=$!
  trap 'kill "$checkpoint_pid" >/dev/null 2>&1 || true' EXIT

  while true; do
    printf "${NEON_CYAN}You${RESET}${DIM} (${BILLY_MODE})${RESET} ${NEON_CYAN}» ${RESET}"
    IFS= read -r user_input || break
    [[ -z "$user_input" ]] && continue

    if [[ "$user_input" == /* || "$user_input" == "exit" || "$user_input" == "quit" ]]; then
      if handle_slash_command "$user_input"; then
        echo ""
        continue
      else
        if [[ "$?" -eq 10 ]]; then
          break
        fi
      fi
    fi

    local effective_prompt="$user_input"
    if [[ "$MIND_MERGE_MODE" == true ]]; then
      effective_prompt="$(mind_merge_envelope "$user_input")"
    fi

    SESSION_HISTORY+=("[$(date '+%H:%M:%S')] $user_input")
    trim_history

    local system_prompt
    system_prompt="$(build_system_prompt "$effective_prompt")"

    echo -e "\n${NEON_PINK}Billy »${RESET}"
    billy_call "$system_prompt" "$effective_prompt" || true
    echo ""
  done

  save_checkpoint
  echo -e "${NEON_PINK}Billy »${RESET} I've still got the thread. Catch you at the next stitch in the Loom. 💙"
}

main() {
  require_dependencies
  parse_args "$@"
  bootstrap_if_needed

  if [[ "$REFRESH_CONTEXT_ONLY" == true ]]; then
    restore_system_files
    exit 0
  fi

  if [[ "$SHOW_STATUS_ONLY" == true ]]; then
    show_splash_banner
    show_status
    exit 0
  fi

  if [[ "$SHOW_SKILLS_ONLY" == true ]]; then
    show_splash_banner
    show_skills
    exit 0
  fi

  if [[ "$SHOW_REPO_BRIEF_ONLY" == true ]]; then
    show_splash_banner
    show_repo_brief
    exit 0
  fi

  if [[ "$RUN_HEALTH_ONLY" == true ]]; then
    run_health_check
    exit $?
  fi

  if [[ -n "$BUCKET_CAPTURE" && -z "$PROMPT_INPUT" ]]; then
    capture_bucket_drop "$BUCKET_CAPTURE"
    exit 0
  fi

  if [[ "$GV_MODE" == "docs" ]]; then
    show_splash_banner
    generate_manifest
    exit 0
  fi

  if [[ -n "$PROMPT_INPUT" ]]; then
    run_single_prompt "$PROMPT_INPUT"
    exit 0
  fi

  if [[ "$INTERACTIVE_MODE" == true ]]; then
    run_interactive_picker
  fi

  run_billy_mode
}

main "$@"
