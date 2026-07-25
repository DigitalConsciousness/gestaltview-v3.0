# GestaltView Unified Schema

This is the canonical human-readable map of the current GestaltView schema.
It is not a replacement for the live database. It is a guide to how the live database is organized.

## Reading Order

1. `supabase/FULL_PUBLIC_SCHEMA_4_29_26.sql`
2. `supabase/migrations/*`
3. Current runtime rows
4. These docs

## Domain Map

### Human Continuity

- `users`
- `app_users`
- `founder_context`
- `consciousness_profiles`
- `memory_entries`
- `human_identity_profiles`
- `human_cognition_profiles`
- `human_consciousness_profiles`
- `human_personality_profiles`
- `human_memory_records`
- `human_relationship_edges`
- `human_context_views`

### Digital Intelligence

- `agents`
- `agent_versions`
- `agent_constitutions`
- `agent_autobiographies`
- `agent_private_interiors`
- `agent_presentation_profiles`
- `agent_governance_policies`
- `agent_relationship_edges`
- `agent_memory_records`
- `agent_skill_profiles`
- `agent_knowledge_links`
- `agent_manifests`
- `agent_manifest_entries`

### Evidence And Mutation

- `identity_subjects`
- `identity_evidence`
- `identity_mutation_proposals`
- `identity_review_events`
- `identity_rollback_events`
- `embodiment_mutations`
- `knowledge_assets`
- `knowledge_asset_chunks`
- `knowledge_interpretations`
- `knowledge_tags`

### Training And Governance

- `trainer_experiments`
- `trainer_experiment_sources`
- `training_runs`
- `training_steps`
- `trainer_jobs`
- `trainer_packaging_candidates`
- `trainer_review_decisions`
- `trainer_policy_flags`
- `eval_rubrics`
- `eval_results`
- `scenario_sets`
- `scenarios`

### Commerce And Delivery

- `gate_buyers`
- `gate_package_drafts`
- `gate_orders`
- `gate_order_items`
- `gate_build_jobs`
- `gate_artifacts`
- `gate_support_requests`

## Canonical Relationships

- `founder_context.user_id -> auth.users.id`
- `app_users.id -> public.users.id::text` in the current compatibility model
- `memory_entries.user_id -> app_users.id`
- `agents.owner_user_id -> auth.users.id`
- `agent_versions.agent_id -> agents.agent_id`
- `knowledge_interpretations.asset_id -> knowledge_assets.id`
- `embodiment_mutations.interpretation_id -> knowledge_interpretations.id`
- `identity_subjects` bridges human and digital subjects without forcing them into one lifecycle

## Operational Rule

If the live schema says one thing and an older doc says another, the live schema wins.

## Design Intent

The schema should be able to hold:

- a human user’s continuity
- a digital agent’s identity
- memory as a first-class object
- consciousness as an explicitly modeled surface
- personality as a structured but non-reductive state
- context injection as a replayable artifact
