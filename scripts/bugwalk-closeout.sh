#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NOTE_DIR="${ROOT_DIR}/bugwalks/closeouts"
DATE_UTC="$(date -u +%F)"

BUG_ID=""
TITLE=""
STATUS="In Flight"
NEXT_MOVE="If the bug persists, record what did not work and define the next hypothesis."
VALIDATION="<command or manual verification>"
CURRENTSTATE_TITLE=""

usage() {
  cat <<'EOF'
Usage:
  bash scripts/bugwalk-closeout.sh BW-YYYY-MM-DD-## "short title" [options]

Options:
  --status "lane name"               In Flight | Shipped / Verify | Watching / Deferred | Ready / Confirmed
  --next "next step"                 Board next-move text
  --validation "command or check"    Validation text for the board/current state
  --currentstate-title "title"       CurrentState entry title suffix
  --note-dir PATH                    Override output directory for the scaffold note
  -h, --help                         Show this help

Example:
  npm run bugwalk:close -- BW-2026-04-09-05 "package builder inputs bounced" \
    --status "Shipped / Verify" \
    --validation "npm run build"
EOF
}

normalize_lane() {
  local value
  value="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"

  case "$value" in
    ready|ready\ /\ confirmed|confirmed|ready\ confirmed)
      printf 'Ready / Confirmed'
      ;;
    in\ flight|in-flight|active)
      printf 'In Flight'
      ;;
    shipped|verify|shipped\ /\ verify|shipped\ verify)
      printf 'Shipped / Verify'
      ;;
    watching|deferred|watching\ /\ deferred|watching\ deferred)
      printf 'Watching / Deferred'
      ;;
    *)
      printf 'Unsupported status lane: %s\n' "$1" >&2
      exit 1
      ;;
  esac
}

slugify() {
  local value="$1"
  local slug

  slug="$(printf '%s' "$value" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g')"

  if [[ -z "$slug" ]]; then
    slug="closeout"
  fi

  printf '%s' "$slug"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --status)
      STATUS="${2:-}"
      shift 2
      ;;
    --next)
      NEXT_MOVE="${2:-}"
      shift 2
      ;;
    --validation)
      VALIDATION="${2:-}"
      shift 2
      ;;
    --currentstate-title)
      CURRENTSTATE_TITLE="${2:-}"
      shift 2
      ;;
    --note-dir)
      NOTE_DIR="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      printf 'Unknown option: %s\n' "$1" >&2
      usage >&2
      exit 1
      ;;
    *)
      if [[ -z "$BUG_ID" ]]; then
        BUG_ID="$1"
      elif [[ -z "$TITLE" ]]; then
        TITLE="$1"
      else
        TITLE="${TITLE} $1"
      fi
      shift
      ;;
  esac
done

if [[ $# -gt 0 ]]; then
  if [[ -z "$TITLE" ]]; then
    TITLE="$*"
  else
    TITLE="${TITLE} $*"
  fi
fi

if [[ -z "$BUG_ID" || -z "$TITLE" ]]; then
  printf 'Bug ID and short title are required.\n' >&2
  usage >&2
  exit 1
fi

STATUS="$(normalize_lane "$STATUS")"

if [[ -z "$CURRENTSTATE_TITLE" ]]; then
  CURRENTSTATE_TITLE="${TITLE}"
fi

mkdir -p "$NOTE_DIR"

BUG_ID_SLUG="$(slugify "$BUG_ID")"
TITLE_SLUG="$(slugify "$TITLE")"
NOTE_PATH="${NOTE_DIR}/${DATE_UTC}-${BUG_ID_SLUG}-${TITLE_SLUG}-closeout.md"

cat > "$NOTE_PATH" <<EOF
# Bug Fix Closeout Scaffold — ${TITLE}

- Bug ID: \`${BUG_ID}\`
- Created: \`${DATE_UTC}\`
- Board target: \`bugwalks/BugWalkBoard.md\`
- CurrentState target: \`docs/CurrentState.md\`

## Same-Pass Rule

- Update \`bugwalks/BugWalkBoard.md\` and \`docs/CurrentState.md\` in the same commit or PR.
- If the bug still reproduces, do not mark it shipped. Record what changed and what did not work in both places.

## BugWalk Board Update Stub

### ${BUG_ID} — ${TITLE}

- \`Status:\` ${STATUS}
- \`Next move:\` ${NEXT_MOVE}
- \`Evidence:\` <touched files>
- \`Validation:\` ${VALIDATION}
- \`Attempt log:\` ${DATE_UTC} — Tried <change>. Result: <fixed | partially fixed | still reproduces>.
- \`Persistence note:\` <what did not work and what to test next if it still reproduces>
- \`CurrentState link:\` \`docs/CurrentState.md\` entry "${CURRENTSTATE_TITLE}"

## CurrentState Entry Stub

# CurrentState — ${CURRENTSTATE_TITLE}

**Last updated:** ${DATE_UTC}
**Owner context:** GestaltView v2 runtime repository (\`gestaltview-v2\`)
**Bug IDs covered:** ${BUG_ID}
**Scope of this pass:** <summarize the bug-fix pass in one sentence>

## Executive summary (${DATE_UTC})

- <what changed>
- <what changed>
- <if the bug persisted, say so plainly>

## Validation performed

- ${VALIDATION}

## What did not work / persistence signals

- <capture the failed attempt or write "n/a" only if the bug no longer reproduces in the tested environment>

## Remaining risks / next steps

1. ${NEXT_MOVE}
2. <any follow-up risk, validation gap, or deploy check>
EOF

printf 'Wrote closeout scaffold: %s\n' "$NOTE_PATH"
printf 'Next: update bugwalks/BugWalkBoard.md and docs/CurrentState.md in the same change.\n'
