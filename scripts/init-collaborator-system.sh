#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$(pwd)}"
REPORT_PATH="${2:-$ROOT_DIR/collaborator_init_verification_report.md}"
SCHEMA_PATH="${3:-}"

timestamp_utc() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

pass_count=0
warn_count=0
fail_count=0
REPORT_LINES=()

add_line() {
  REPORT_LINES+=("$1")
}

record_pass() {
  pass_count=$((pass_count + 1))
  add_line "- PASS: $1"
}

record_warn() {
  warn_count=$((warn_count + 1))
  add_line "- WARN: $1"
}

record_fail() {
  fail_count=$((fail_count + 1))
  add_line "- FAIL: $1"
}

require_file() {
  local path="$1"
  local label="$2"
  if [[ -f "$ROOT_DIR/$path" ]]; then
    record_pass "$label exists at $path"
  else
    record_fail "$label missing at $path"
  fi
}

require_grep() {
  local path="$1"
  local pattern="$2"
  local label="$3"
  if [[ ! -f "$ROOT_DIR/$path" ]]; then
    record_fail "$label could not be checked because $path is missing"
    return
  fi

  if grep -qE "$pattern" "$ROOT_DIR/$path"; then
    record_pass "$label"
  else
    record_fail "$label"
  fi
}

optional_grep_warn() {
  local path="$1"
  local pattern="$2"
  local label="$3"
  if [[ ! -f "$ROOT_DIR/$path" ]]; then
    record_warn "$label could not be checked because $path is missing"
    return
  fi

  if grep -qE "$pattern" "$ROOT_DIR/$path"; then
    record_pass "$label"
  else
    record_warn "$label"
  fi
}

find_latest_collaborator_migration() {
  local latest
  latest="$(find "$ROOT_DIR/supabase/migrations" -maxdepth 1 -type f 2>/dev/null | grep -E 'collaborator|collaborators' | sort | tail -n 1 || true)"
  if [[ -n "$latest" ]]; then
    echo "$latest"
  fi
}

find_latest_backfill_migration() {
  local latest
  latest="$(find "$ROOT_DIR/supabase/migrations" -maxdepth 1 -type f 2>/dev/null | grep -Ei 'backfill.*collaborator|collaborator.*backfill' | sort | tail -n 1 || true)"
  if [[ -n "$latest" ]]; then
    echo "$latest"
  fi
}

find_schema_snapshot() {
  local candidate

  if [[ -n "${SCHEMA_PATH:-}" && -f "$SCHEMA_PATH" ]]; then
    echo "$SCHEMA_PATH"
    return
  fi

  for candidate in \
    "$ROOT_DIR/supabase/schema.sql" \
    "$ROOT_DIR/supabase/CompleteSchema.sql" \
    "$ROOT_DIR/supabase/gestaltview_schema.sql" \
    "$ROOT_DIR/supabase/supabase-db-dump-2026-06-21T06-21-21-963Z.sql"
  do
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done
}

add_line "# Collaborator Init Verification Report"
add_line ""
add_line "- Generated at UTC: $(timestamp_utc)"
add_line "- Root checked: $ROOT_DIR"
add_line ""

add_line "## Required file presence"
require_file "server/collaborators/provision.ts" "Provisioning service"
require_file "api/collaborators/provision.ts" "Provisioning API route"
require_file "orientation/gemini_onboarding_package.v1.json" "Gemini onboarding package JSON"
require_file "orientation/gemini_onboarding.md" "Gemini onboarding markdown"

collab_migration="$(find_latest_collaborator_migration)"
backfill_migration="$(find_latest_backfill_migration)"
schema_snapshot="$(find_schema_snapshot)"
collab_migration_rel=""
schema_snapshot_rel=""

if [[ -n "${collab_migration:-}" && -f "$collab_migration" ]]; then
  record_pass "Collaborator migration found at ${collab_migration#$ROOT_DIR/}"
  collab_migration_rel="${collab_migration#$ROOT_DIR/}"
else
  record_fail "Collaborator migration not found under supabase/migrations"
fi

if [[ -n "${backfill_migration:-}" && -f "$backfill_migration" ]]; then
  record_pass "Collaborator backfill migration found at ${backfill_migration#$ROOT_DIR/}"
else
  record_warn "Collaborator backfill migration not found under supabase/migrations"
fi

if [[ -n "${schema_snapshot:-}" && -f "$schema_snapshot" ]]; then
  schema_snapshot_rel="${schema_snapshot#$ROOT_DIR/}"
  record_pass "Schema snapshot found at ${schema_snapshot_rel}"
else
  record_fail "Schema snapshot not found (expected supabase/schema.sql, CompleteSchema.sql, gestaltview_schema.sql, or the live dump)"
fi

add_line ""
add_line "## Wiring checks"
require_grep "api/_lib/auth.ts" "export async function requireAdmin" "Auth wrapper exports requireAdmin"
require_grep "api/collaborators/provision.ts" "requireAdmin" "Provision route uses requireAdmin"
require_grep "api/collaborators/provision.ts" "provisionCollaborator" "Provision route calls provisionCollaborator"
require_grep "server/collaborators/provision.ts" "createClient" "Provision service creates Supabase SDK client"
require_grep "server/collaborators/provision.ts" "collaborator_onboarding_events" "Provision service writes onboarding event"
require_grep "server/collaborators/provision.ts" "collaborator_roles" "Provision service writes collaborator role"
require_grep "server/collaborators/provision.ts" "collaborator_embodiment_links" "Provision service writes embodiment link"
require_grep "server/collaborators/provision.ts" 'from\("collaborators"\)' "Provision service writes collaborator row"
optional_grep_warn "server/collaborators/provision.ts" 'from\("agents"\).*update|update\(\{ collaborator_id' "Provision service syncs agents.collaborator_id when agentId is present"

add_line ""
add_line "## Schema snapshot checks"
if [[ -n "$schema_snapshot_rel" ]]; then
  require_grep "$schema_snapshot_rel" "CREATE TABLE public\.collaborators" "Schema snapshot includes collaborators table"
  require_grep "$schema_snapshot_rel" "CREATE TABLE public\.collaborator_roles" "Schema snapshot includes collaborator_roles table"
  require_grep "$schema_snapshot_rel" "CREATE TABLE public\.collaborator_relationships" "Schema snapshot includes collaborator_relationships table"
  require_grep "$schema_snapshot_rel" "CREATE TABLE public\.collaborator_permissions" "Schema snapshot includes collaborator_permissions table"
  require_grep "$schema_snapshot_rel" "CREATE TABLE public\.collaborator_onboarding_events" "Schema snapshot includes collaborator_onboarding_events table"
  require_grep "$schema_snapshot_rel" "CREATE TABLE public\.collaborator_embodiment_links" "Schema snapshot includes collaborator_embodiment_links table"
  require_grep "$schema_snapshot_rel" "collaborator_id uuid" "Schema snapshot includes agents.collaborator_id column"
  require_grep "$schema_snapshot_rel" "CREATE OR REPLACE VIEW public\.agent_governed_identity_snapshot" "Schema snapshot includes governed identity snapshot view"
  require_grep "$schema_snapshot_rel" "security_invoker" "Schema snapshot marks governed identity snapshot as security invoker"
  require_grep "$schema_snapshot_rel" "collaborative_memory_records" "Schema snapshot includes collaborative memory overlay in the governed snapshot"
fi

if [[ -n "$collab_migration_rel" ]]; then
  add_line ""
  add_line "## Collaborator security checks"
  require_grep "$collab_migration_rel" 'alter table if exists public\.collaborators enable row level security' "Collaborators table enables RLS in the latest migration"
  require_grep "$collab_migration_rel" 'create policy "collaborators insert"' "Collaborators insert policy exists in the latest migration"
  require_grep "$collab_migration_rel" 'create policy "collaborators read"' "Collaborators read policy exists in the latest migration"
  require_grep "$collab_migration_rel" 'create policy "cp_select_own"' "Collaborator permissions own-row read policy exists in the latest migration"
  require_grep "$collab_migration_rel" 'create policy "cr_select_if_user_owns_source_or_target"' "Collaborator relationship ownership policy exists in the latest migration"
  require_grep "$collab_migration_rel" 'create policy "select own onboarding events"' "Collaborator onboarding read policy exists in the latest migration"
  require_grep "$collab_migration_rel" 'create policy "read_own_rows"' "Collaborator embodiment link read policy exists in the latest migration"
fi

add_line ""
add_line "## Gemini package checks"
require_grep "orientation/gemini_onboarding_package.v1.json" ""display_name": "Gemini"" "Gemini JSON package declares display name"
require_grep "orientation/gemini_onboarding_package.v1.json" ""orientation_variant": "gemini"" "Gemini JSON package declares orientation variant"
require_grep "orientation/gemini_onboarding_package.v1.json" ""external_provider": "google"" "Gemini JSON package declares external provider"
require_grep "orientation/gemini_onboarding.md" "Gemini — GestaltView Onboarding|Gemini - GestaltView Onboarding" "Gemini markdown onboarding title present"

add_line ""
add_line "## Recommended next live checks"
add_line "- Apply the collaborator migration in Supabase if not already applied."
add_line "- Apply the collaborator backfill migration if you want existing agents provisioned into collaborators automatically."
add_line "- Send a POST request to /api/collaborators/provision with an admin bearer token and confirm rows land in collaborators, collaborator_roles, collaborator_onboarding_events, and collaborator_embodiment_links."
add_line "- Provision Gemini either via the full API payload or by calling provisionGeminiCollaborator(...) server-side."
add_line "- After successful provision, confirm collaborator_relationships contains the Keith ↔ Gemini edge if you passed Keith's collaborator id."
add_line ""

overall="PASS"
if [[ $fail_count -gt 0 ]]; then
  overall="FAIL"
elif [[ $warn_count -gt 0 ]]; then
  overall="PASS WITH WARNINGS"
fi

add_line "## Summary"
add_line "- Overall status: $overall"
add_line "- Pass count: $pass_count"
add_line "- Warning count: $warn_count"
add_line "- Fail count: $fail_count"
add_line ""

printf "%s\n" "${REPORT_LINES[@]}" > "$REPORT_PATH"

echo "Wrote report to: $REPORT_PATH"
echo "Overall status: $overall"
echo "Pass: $pass_count | Warn: $warn_count | Fail: $fail_count"
