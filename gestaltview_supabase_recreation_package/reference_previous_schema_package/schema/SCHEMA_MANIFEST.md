# GestaltView Schema Manifest

Generated: `2026-06-12T02:31:56+00:00`  
Source SHA256: `95af30d1a98f922ca55e32ec8f8401ab4a1401e52f60b9262ffcb9e292601df0`

- Tables: **100**
- Columns: **1164**
- Custom type/domain placeholders: **30**
- Vector columns: **6**

## Domain groups

### agent_identity_personhood

- `agent_constitutions`
- `agent_autobiographies`
- `agent_private_interiors`
- `agent_governance_policies`
- `agent_presentation_profiles`
- `agent_skill_profiles`
- `agent_memory_records`
- `agent_preference_nodes`
- `agent_relationship_edges`
- `agent_context_views`

### agent_runtime_and_manifest

- `agents`
- `agent_versions`
- `agent_memories`
- `agent_skills`
- `agent_relationships`
- `agent_manifests`
- `agent_manifest_entries`
- `agent_code_artifacts`

### agent_training_governance

- `model_providers`
- `models`
- `scenario_sets`
- `scenarios`
- `eval_rubrics`
- `training_runs`
- `training_steps`
- `eval_results`
- `approvals`
- `deployment_artifacts`
- `trainer_jobs`
- `trainer_experiments`
- `trainer_experiment_sources`
- `trainer_review_decisions`
- `trainer_policy_flags`
- `trainer_packaging_candidates`

### collaboration

- `collaborative_spaces`
- `collaborative_space_members`
- `collaborative_memory_records`
- `collaborators`
- `collaborator_roles`
- `collaborator_relationships`
- `collaborator_permissions`
- `collaborator_onboarding_events`
- `collaborator_embodiment_links`

### commerce_gate

- `gate_buyers`
- `gate_package_drafts`
- `gate_orders`
- `gate_order_items`
- `gate_build_jobs`
- `gate_artifacts`
- `gate_support_requests`

### corpus_ingestion

- `processing_runs`
- `documents`
- `embeddings`
- `knowledge_fragments`
- `summaries`
- `loom_annotations`
- `concepts`
- `document_concepts`
- `annotation_concepts`
- `skill_fragments`
- `skills`
- `ingestion_safety_events`

### human_identity

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

### identity_core

- `app_users`
- `users`
- `identity_subjects`

### knowledge_assets

- `knowledge_assets`
- `knowledge_asset_chunks`
- `knowledge_tags`
- `knowledge_asset_tags`
- `agent_knowledge_links`
- `knowledge_interpretations`

### miscellaneous

- `embodiment_mutations`
- `identity_evidence`
- `identity_evidence_links`
- `identity_contradictions`
- `identity_mutation_proposals`
- `identity_review_events`
- `identity_rollback_events`

### operations

- `ops_workbook_items`
- `ops_workbook_sync_runs`

### runtime_continuity

- `consciousness_profiles`
- `bucket_drops`
- `musical_dna_analyses`
- `billy_sessions`
- `founder_context`
- `memory_entries`

### tribunal

- `tribunal_sessions`
- `tribunal_events`
- `tribunal_evidence`

## Custom type placeholders

- `agent_code_generation_mode`
- `agent_code_review_status`
- `agent_knowledge_link_scope`
- `agent_knowledge_link_type`
- `agent_manifest_entry_type`
- `agent_manifest_status`
- `agent_memory_retention_policy`
- `agent_memory_type`
- `agent_relationship_type`
- `archive_policy`
- `collaborative_space_role`
- `context_view_scope`
- `embodiment_mutation_risk_level`
- `embodiment_mutation_status`
- `embodiment_mutation_type`
- `evidence_source_type`
- `identity_mutation_risk_level`
- `identity_mutation_status`
- `identity_mutation_type`
- `identity_review_decision`
- `identity_subject_kind`
- `knowledge_asset_status`
- `knowledge_asset_type`
- `knowledge_asset_visibility`
- `knowledge_classification`
- `memory_kind`
- `mutation_class`
- `owner_scope`
- `preference_kind`
- `review_status`

## Vector columns

- `embeddings.embedding`
- `knowledge_fragments.embedding`
- `skill_fragments.embedding`
- `memory_entries.embedding`
- `knowledge_asset_chunks.embedding`
- `human_memory_records.embedding`
