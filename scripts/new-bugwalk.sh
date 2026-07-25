#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUGWALK_DIR="${ROOT_DIR}/bugwalks"
BOARD_PATH="${BUGWALK_DIR}/BugWalkBoard.md"

DATE_UTC="$(date -u +%F)"
STATUS="Fresh Sightings"
SURFACE="<page, route, component, or flow>"
OWNER="Unassigned"
SOURCE_LABEL="${DATE_UTC} walkthrough capture"
SYMPTOM="Capture the user-visible bug, regression, or friction point."
IMPACT="Explain why this matters for the user or operator."
NEXT_MOVE="Reproduce, confirm, and define the smallest credible fix."
RAW_EXT="mht"
TITLE=""
SLUG_OVERRIDE=""

usage() {
  cat <<'EOF'
Usage:
  bash scripts/new-bugwalk.sh "short title" [options]

Options:
  --surface "surface name"     Card surface label
  --owner "team or person"     Card owner
  --status "lane name"         Fresh Sightings | Ready / Confirmed | In Flight | Shipped / Verify | Watching / Deferred
  --source "capture label"     Source label shown on the card
  --symptom "text"             Symptom placeholder
  --impact "text"              Impact placeholder
  --next "text"                Next move placeholder
  --slug "custom-slug"         Override generated slug
  --raw-ext "mht"              Suggested raw capture extension (default: mht)
  --bugwalk-dir PATH           Override bugwalk directory
  --board PATH                 Override board file path
  -h, --help                   Show this help

Examples:
  npm run bugwalk:new -- "mobile composer overlaps send"
  npm run bugwalk:new -- "issued key validation fails" --owner "Backend / ops" --surface "GATE redeem flow"
EOF
}

normalize_lane() {
  local value
  value="$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')"

  case "$value" in
    fresh|fresh\ sightings)
      printf 'Fresh Sightings'
      ;;
    ready|ready\ /\ confirmed|ready\ /\ confirmed|confirmed|ready\ confirmed)
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
    slug="bugwalk"
  fi

  printf '%s' "$slug"
}

insert_after_heading() {
  local board_path="$1"
  local heading="$2"
  local insert_file="$3"
  local temp_file

  temp_file="$(mktemp)"

  awk -v heading="$heading" -v insert_file="$insert_file" '
    function print_insert_file(path,    line) {
      while ((getline line < path) > 0) {
        print line
      }
      close(path)
    }

    {
      print
      if (!inserted && $0 == heading) {
        print ""
        print_insert_file(insert_file)
        inserted = 1
      }
    }

    END {
      if (!inserted) {
        print ""
        print heading
        print ""
        print_insert_file(insert_file)
      }
    }
  ' "$board_path" > "$temp_file"

  mv "$temp_file" "$board_path"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --surface)
      SURFACE="${2:-}"
      shift 2
      ;;
    --owner)
      OWNER="${2:-}"
      shift 2
      ;;
    --status)
      STATUS="${2:-}"
      shift 2
      ;;
    --source)
      SOURCE_LABEL="${2:-}"
      shift 2
      ;;
    --symptom)
      SYMPTOM="${2:-}"
      shift 2
      ;;
    --impact)
      IMPACT="${2:-}"
      shift 2
      ;;
    --next)
      NEXT_MOVE="${2:-}"
      shift 2
      ;;
    --slug)
      SLUG_OVERRIDE="${2:-}"
      shift 2
      ;;
    --raw-ext)
      RAW_EXT="${2:-}"
      shift 2
      ;;
    --bugwalk-dir)
      BUGWALK_DIR="${2:-}"
      shift 2
      ;;
    --board)
      BOARD_PATH="${2:-}"
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
      if [[ -z "$TITLE" ]]; then
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

if [[ -z "$TITLE" ]]; then
  printf 'A short bugwalk title is required.\n' >&2
  usage >&2
  exit 1
fi

STATUS="$(normalize_lane "$STATUS")"

if [[ ! -d "$BUGWALK_DIR" ]]; then
  printf 'Bugwalk directory not found: %s\n' "$BUGWALK_DIR" >&2
  exit 1
fi

if [[ ! -f "$BOARD_PATH" ]]; then
  printf 'Bugwalk board not found: %s\n' "$BOARD_PATH" >&2
  exit 1
fi

TITLE_SLUG="$(slugify "${SLUG_OVERRIDE:-$TITLE}")"

MAX_SEQ=0
while IFS= read -r existing_id; do
  seq_value="${existing_id##*-}"
  seq_int=$((10#$seq_value))
  if (( seq_int > MAX_SEQ )); then
    MAX_SEQ=$seq_int
  fi
done < <(grep -o "BW-${DATE_UTC}-[0-9][0-9]" "$BOARD_PATH" || true)

NEXT_SEQ=$((MAX_SEQ + 1))
printf -v SEQ_PADDED '%02d' "$NEXT_SEQ"

CARD_ID="BW-${DATE_UTC}-${SEQ_PADDED}"
NOTE_BASENAME="${DATE_UTC}-bw-${SEQ_PADDED}-${TITLE_SLUG}"
NOTE_PATH="${BUGWALK_DIR}/${NOTE_BASENAME}.md"
RAW_CAPTURE_PATH="${BUGWALK_DIR}/${NOTE_BASENAME}.${RAW_EXT}"
BUGWALK_LABEL="$(basename "$BUGWALK_DIR")"
NOTE_REL_PATH="${BUGWALK_LABEL}/${NOTE_BASENAME}.md"
RAW_REL_PATH="${BUGWALK_LABEL}/${NOTE_BASENAME}.${RAW_EXT}"

cat > "$NOTE_PATH" <<EOF
# BugWalk Intake - ${TITLE}

- ID: \`${CARD_ID}\`
- Created: \`${DATE_UTC}\`
- Status lane: \`${STATUS}\`
- Surface: ${SURFACE}
- Owner: ${OWNER}
- Suggested raw capture: \`${RAW_REL_PATH}\`

## Walkthrough Context

- Source: ${SOURCE_LABEL}
- Summary: Capture the walkthrough setup, environment, and reproduction context.

## Raw Evidence

- Save the browser export or transcript to \`${RAW_REL_PATH}\`
- Add screenshots or extra notes below as needed.

## Notes

- Reproduction:
- Expected behavior:
- Actual behavior:
- Scope:

## Candidate Fix Shape

- Suspected layer:
- Likely files:
- Validation plan:
EOF

CARD_FILE="$(mktemp)"
cat > "$CARD_FILE" <<EOF
### ${CARD_ID} — ${TITLE}

- \`Status:\` ${STATUS}
- \`Surface:\` ${SURFACE}
- \`Symptom:\` ${SYMPTOM}
- \`Impact:\` ${IMPACT}
- \`Source:\` ${SOURCE_LABEL}
- \`Owner:\` ${OWNER}
- \`Next move:\` ${NEXT_MOVE}
- \`Evidence:\` \`${NOTE_REL_PATH}\`, \`${RAW_REL_PATH}\`
EOF

insert_after_heading "$BOARD_PATH" "## ${STATUS}" "$CARD_FILE"
rm -f "$CARD_FILE"

sed -i "s/^\\*\\*Last updated:\\*\\*.*/**Last updated:** ${DATE_UTC}  /" "$BOARD_PATH"

printf '\nCreated BugWalk scaffold\n'
printf 'ID: %s\n' "$CARD_ID"
printf 'Board lane: %s\n' "$STATUS"
printf 'Intake note: %s\n' "$NOTE_PATH"
printf 'Suggested raw capture: %s\n' "$RAW_CAPTURE_PATH"
printf '\nNext step:\n'
printf '1. Save the raw capture to %s\n' "$RAW_CAPTURE_PATH"
printf '2. Replace the placeholder symptom/impact fields in %s\n' "$BOARD_PATH"
