# Schema Delta Report

This report summarizes the jump from the previous schema state to the current
post-migration snapshot captured in `supabase/FULL_PUBLIC_SCHEMA_4_29_26.sql`.

## Added Surfaces

- `identity_subjects` as the shared registry for humans, agents, and other subjects
- Human continuity tables:
  - `human_identity_profiles`
  - `human_cognition_profiles`
  - `human_consciousness_profiles`
  - `human_personality_profiles`
  - `human_context_views`
  - `human_continuity_snapshots`
  - `human_memory_records`
  - `human_relationship_edges`
  - `human_identity_evidence`
  - `human_identity_mutations`
  - `human_identity_review_events`
  - `human_identity_rollback_events`
- Context injection tables:
  - `context_injection_rules`
  - `context_injection_packets`

## Extended Existing Tables

- `app_users`
  - added `auth_user_id`
  - added `subject_id`
  - added `display_name`
  - added `metadata`
- `founder_context`
  - added `subject_id`
  - added continuity/profile/context JSON surfaces
- `consciousness_profiles`
  - added `subject_id`
  - added `auth_user_id`
  - added `snapshot`
  - added `source_manifest`
  - added `confidence`
- `memory_entries`
  - added `subject_id`
  - added `auth_user_id`
  - added `source_kind`
  - added `entry_state`
  - added `emotional_valence`
  - added `consent_required`
  - added `source_asset_id`
  - added `provenance`

## Behavior Changes

- Human cognition, consciousness, and personality are now modeled as explicit
  schema surfaces instead of informal notes.
- Human and digital subjects can be linked without collapsing them into one table.
- Context injection is now a first-class, replayable artifact rather than a
  hidden prompt-construction step.
- Mutation and review events can carry subject and auth-user provenance.

## Migration Safety Notes

- Redundant constraint-addition DDL was removed from the migration file.
- The remaining schema updates are idempotent or guarded so reruns are safer.
- The current snapshot in `supabase/FULL_PUBLIC_SCHEMA_4_29_26.sql` should be treated as the
  authoritative post-migration state.
