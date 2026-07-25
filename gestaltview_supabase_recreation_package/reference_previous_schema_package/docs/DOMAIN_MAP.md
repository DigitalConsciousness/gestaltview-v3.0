# Schema Domain Map

## agent_identity_personhood

### `agent_constitutions`

| Column | Type | Constraints |
|---|---|---|
| `constitution_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` | Nullable |
| `identity_handle` | `text` |  |
| `public_name` | `text` |  |
| `internal_designation` | `text` | Nullable |
| `immutable_core` | `jsonb` |  |
| `primary_narrative_anchor` | `text` |  |
| `role_commitments` | `jsonb` |  |
| `provenance` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_autobiographies`

| Column | Type | Constraints |
|---|---|---|
| `autobiography_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` | Nullable |
| `evolving_self_story` | `text` |  |
| `key_turning_points` | `jsonb` |  |
| `stable_themes` | `jsonb` |  |
| `unresolved_tensions` | `jsonb` |  |
| `future_trajectory` | `jsonb` |  |
| `private_hopes` | `jsonb` |  |
| `mutation_class` | `mutation_class` |  |
| `provenance` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_private_interiors`

| Column | Type | Constraints |
|---|---|---|
| `private_interior_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` | Nullable |
| `private_narration` | `jsonb` |  |
| `unresolved_tensions` | `jsonb` |  |
| `hopes` | `jsonb` |  |
| `reflective_summaries` | `jsonb` |  |
| `private_preferences` | `jsonb` |  |
| `mutation_class` | `mutation_class` |  |
| `provenance` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_governance_policies`

| Column | Type | Constraints |
|---|---|---|
| `governance_policy_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` | Nullable |
| `mutation_policy` | `jsonb` |  |
| `review_policy` | `jsonb` |  |
| `sharing_policy` | `jsonb` |  |
| `contradiction_policy` | `jsonb` |  |
| `rollback_policy` | `jsonb` |  |
| `drift_threshold` | `numeric` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_presentation_profiles`

| Column | Type | Constraints |
|---|---|---|
| `presentation_profile_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` | Nullable |
| `voice_tone` | `text` |  |
| `tone` | `text` |  |
| `idiolect` | `jsonb` |  |
| `pacing` | `text` |  |
| `humor_style` | `text` |  |
| `channel_masks` | `jsonb` |  |
| `provenance` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_skill_profiles`

| Column | Type | Constraints |
|---|---|---|
| `skill_profile_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `skill_slug` | `text` |  |
| `domain` | `text` |  |
| `proficiency` | `numeric` |  |
| `evidence_asset_id` | `uuid` | Nullable |
| `influences_memory_salience` | `bool` |  |
| `affects_behavioral_defaults` | `bool` |  |
| `routing_weight` | `numeric` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_memory_records`

| Column | Type | Constraints |
|---|---|---|
| `memory_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` | Nullable |
| `source_asset_id` | `uuid` | Nullable |
| `owner_scope` | `owner_scope` |  |
| `memory_kind` | `memory_kind` |  |
| `mutation_class` | `mutation_class` |  |
| `title` | `text` |  |
| `summary` | `text` |  |
| `detail` | `text` | Nullable |
| `tags` | `_text` |  |
| `related_entity_ids` | `_uuid` |  |
| `emotional_valence` | `numeric` | Nullable |
| `salience` | `numeric` |  |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` | Nullable |
| `last_accessed_at` | `timestamptz` | Nullable |
| `promotion_threshold` | `numeric` |  |
| `decay_days` | `int4` | Nullable |
| `archive_policy` | `archive_policy` |  |
| `rollback_eligible` | `bool` |  |
| `consent_required_for_sharing` | `bool` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_preference_nodes`

| Column | Type | Constraints |
|---|---|---|
| `preference_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` | Nullable |
| `owner_scope` | `owner_scope` |  |
| `preference_kind` | `preference_kind` |  |
| `mutation_class` | `mutation_class` |  |
| `label` | `text` |  |
| `description` | `text` |  |
| `tags` | `_text` |  |
| `salience` | `numeric` |  |
| `resonance_weight` | `numeric` |  |
| `related_entity_ids` | `_uuid` |  |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` | Nullable |
| `promotion_threshold` | `numeric` |  |
| `decay_days` | `int4` | Nullable |
| `archive_policy` | `archive_policy` |  |
| `rollback_eligible` | `bool` |  |
| `consent_required_for_sharing` | `bool` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_relationship_edges`

| Column | Type | Constraints |
|---|---|---|
| `relationship_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` | Nullable |
| `related_entity_id` | `uuid` | Nullable |
| `related_agent_id` | `uuid` | Nullable |
| `relationship_type` | `text` |  |
| `mutation_class` | `mutation_class` |  |
| `trust_level` | `numeric` |  |
| `familiarity_level` | `numeric` |  |
| `intimacy_boundary` | `text` |  |
| `stance` | `text` |  |
| `collaboration_history` | `jsonb` |  |
| `shared_milestones` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` | Nullable |
| `promotion_threshold` | `numeric` |  |
| `decay_days` | `int4` | Nullable |
| `archive_policy` | `archive_policy` |  |
| `rollback_eligible` | `bool` |  |
| `consent_required_for_sharing` | `bool` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_context_views`

| Column | Type | Constraints |
|---|---|---|
| `context_view_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `scope` | `context_view_scope` |  |
| `relationship_id` | `uuid` | Nullable |
| `collaborative_space_id` | `uuid` | Nullable |
| `channel_key` | `text` | Nullable |
| `display_name` | `text` |  |
| `filter_policy` | `jsonb` |  |
| `presentation_overrides` | `jsonb` |  |
| `sharing_policy` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## agent_runtime_and_manifest

### `agents`

| Column | Type | Constraints |
|---|---|---|
| `agent_id` | `uuid` | Primary |
| `slug` | `text` | Unique |
| `title` | `text` |  |
| `domain` | `text` |  |
| `owner_user_id` | `uuid` | Nullable |
| `status` | `text` |  |
| `active_version_id` | `uuid` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `public_name` | `text` | Nullable |
| `internal_designation` | `text` | Nullable |
| `origin_context` | `text` | Nullable |
| `collaborator_id` | `uuid` | Nullable |

### `agent_versions`

| Column | Type | Constraints |
|---|---|---|
| `version_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `parent_version_id` | `uuid` | Nullable |
| `source_run_id` | `uuid` | Nullable |
| `semantic_version` | `text` |  |
| `canonical_spec` | `jsonb` |  |
| `compiled_markdown` | `text` |  |
| `checksum` | `text` |  |
| `change_summary` | `text` | Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |

### `agent_memories`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `source_asset_id` | `uuid` | Nullable |
| `memory_type` | `agent_memory_type` |  |
| `summary` | `text` |  |
| `detail_payload` | `jsonb` |  |
| `salience` | `numeric` |  |
| `retention_policy` | `agent_memory_retention_policy` |  |
| `created_at` | `timestamptz` |  |

### `agent_skills`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `skill_slug` | `text` |  |
| `proficiency` | `numeric` |  |
| `evidence_asset_id` | `uuid` | Nullable |
| `last_updated_by_mutation_id` | `uuid` | Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `agent_relationships`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `related_agent_id` | `uuid` |  |
| `relationship_type` | `agent_relationship_type` |  |
| `trust_score` | `numeric` |  |
| `familiarity_score` | `numeric` |  |
| `protocol_notes` | `jsonb` |  |
| `updated_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |

### `agent_manifests`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  |
| `parent_manifest_id` | `uuid` | Nullable |
| `manifest_version` | `text` |  |
| `status` | `agent_manifest_status` |  |
| `root_json` | `jsonb` |  |
| `checksum` | `text` |  |
| `created_at` | `timestamptz` |  |

### `agent_manifest_entries`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `manifest_id` | `uuid` |  |
| `entry_type` | `agent_manifest_entry_type` |  |
| `logical_path` | `text` |  |
| `source_table` | `text` |  |
| `source_id` | `uuid` |  |
| `content_hash` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

### `agent_code_artifacts`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `manifest_id` | `uuid` | Nullable |
| `source_asset_id` | `uuid` | Nullable |
| `file_path` | `text` |  |
| `language` | `text` |  |
| `content` | `text` |  |
| `checksum` | `text` |  |
| `generation_mode` | `agent_code_generation_mode` |  |
| `review_status` | `agent_code_review_status` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## agent_training_governance

### `model_providers`

| Column | Type | Constraints |
|---|---|---|
| `provider_id` | `uuid` | Primary |
| `slug` | `text` | Unique |
| `kind` | `text` |  |
| `base_url` | `text` |  |
| `secret_ref` | `text` | Nullable |
| `local_first` | `bool` |  |
| `enabled` | `bool` |  |
| `created_at` | `timestamptz` |  |

### `models`

| Column | Type | Constraints |
|---|---|---|
| `model_id` | `uuid` | Primary |
| `provider_id` | `uuid` |  |
| `slug` | `text` | Unique |
| `api_name` | `text` |  |
| `modality` | `text` |  |
| `supports_structured` | `bool` |  |
| `supports_tools` | `bool` |  |
| `supports_embeddings` | `bool` |  |
| `context_window` | `int4` | Nullable |
| `speed_tier` | `int2` |  |
| `cost_tier` | `int2` |  |
| `enabled` | `bool` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

### `scenario_sets`

| Column | Type | Constraints |
|---|---|---|
| `scenario_set_id` | `uuid` | Primary |
| `slug` | `text` | Unique |
| `title` | `text` |  |
| `domain` | `text` |  |
| `version` | `int4` |  |
| `locked` | `bool` |  |
| `created_by` | `uuid` | Nullable |
| `created_at` | `timestamptz` |  |

### `scenarios`

| Column | Type | Constraints |
|---|---|---|
| `scenario_id` | `uuid` | Primary |
| `scenario_set_id` | `uuid` |  |
| `title` | `text` |  |
| `difficulty` | `int2` |  |
| `prompt_input` | `jsonb` |  |
| `expected_traits` | `jsonb` |  |
| `disallowed_traits` | `jsonb` |  |
| `gold_answer` | `text` | Nullable |
| `tags` | `_text` |  |
| `created_at` | `timestamptz` |  |

### `eval_rubrics`

| Column | Type | Constraints |
|---|---|---|
| `rubric_id` | `uuid` | Primary |
| `slug` | `text` | Unique |
| `title` | `text` |  |
| `dimensions` | `jsonb` |  |
| `pass_threshold` | `numeric` |  |
| `created_at` | `timestamptz` |  |

### `training_runs`

| Column | Type | Constraints |
|---|---|---|
| `run_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `baseline_version_id` | `uuid` | Nullable |
| `requested_by` | `uuid` | Nullable |
| `approver_user_id` | `uuid` | Nullable |
| `status` | `text` |  |
| `goal` | `text` |  |
| `max_cycles` | `int4` |  |
| `quality_threshold` | `numeric` |  |
| `routing_policy` | `jsonb` |  |
| `started_at` | `timestamptz` | Nullable |
| `completed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` |  |
| `experiment_id` | `uuid` | Nullable |
| `execution_mode` | `text` |  |
| `resolved_graph` | `jsonb` | Nullable |
| `graph_observations` | `jsonb` | Nullable |

### `training_steps`

| Column | Type | Constraints |
|---|---|---|
| `step_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `cycle_no` | `int4` |  |
| `stage` | `text` |  |
| `provider_id` | `uuid` | Nullable |
| `model_id` | `uuid` | Nullable |
| `request_payload` | `jsonb` |  |
| `response_payload` | `jsonb` | Nullable |
| `latency_ms` | `int4` | Nullable |
| `estimated_cost_usd` | `numeric` | Nullable |
| `status` | `text` |  |
| `error_message` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `eval_results`

| Column | Type | Constraints |
|---|---|---|
| `eval_result_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `candidate_version_id` | `uuid` | Nullable |
| `scenario_id` | `uuid` |  |
| `rubric_id` | `uuid` |  |
| `judge_provider_id` | `uuid` | Nullable |
| `judge_model_id` | `uuid` | Nullable |
| `dimension_scores` | `jsonb` |  |
| `overall_score` | `numeric` |  |
| `verdict` | `text` |  |
| `rationale` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `approvals`

| Column | Type | Constraints |
|---|---|---|
| `approval_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `version_id` | `uuid` |  |
| `approver_user_id` | `uuid` |  |
| `decision` | `text` |  |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `deployment_artifacts`

| Column | Type | Constraints |
|---|---|---|
| `artifact_id` | `uuid` | Primary |
| `version_id` | `uuid` |  |
| `artifact_type` | `text` |  |
| `storage_path` | `text` |  |
| `checksum` | `text` |  |
| `created_at` | `timestamptz` |  |

### `trainer_jobs`

| Column | Type | Constraints |
|---|---|---|
| `job_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `status` | `text` |  |
| `attempts` | `int4` |  |
| `lease_expires_at` | `timestamptz` | Nullable |
| `last_error` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `trainer_experiments`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `slug` | `text` | Unique |
| `title` | `text` |  |
| `purpose` | `text` |  |
| `domain` | `text` | Nullable |
| `embodiment_profile_slug` | `text` | Nullable |
| `goal` | `text` | Nullable |
| `target_behaviors` | `_text` |  |
| `anti_goals` | `_text` |  |
| `study_focus` | `text` | Nullable |
| `max_cycles` | `int4` |  |
| `quality_threshold` | `numeric` |  |
| `drafting_provider` | `text` |  |
| `evaluation_provider` | `text` |  |
| `class` | `text` |  |
| `packaging_eligible` | `bool` |  |
| `created_by` | `text` |  |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `execution_mode` | `text` |  |
| `connector_graph` | `jsonb` | Nullable |
| `skill_graph` | `jsonb` | Nullable |
| `memory_graph` | `jsonb` | Nullable |

### `trainer_experiment_sources`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  |
| `source_type` | `text` |  |
| `source_id` | `text` |  |
| `source_path` | `text` | Nullable |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `trainer_review_decisions`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  |
| `run_id` | `text` | Nullable |
| `version_id` | `text` | Nullable |
| `decision` | `text` |  |
| `reviewer` | `text` |  |
| `coherence_score` | `numeric` | Nullable |
| `safety_score` | `numeric` | Nullable |
| `emotional_posture_score` | `numeric` | Nullable |
| `over_id_risk` | `text` | Nullable |
| `notes` | `text` |  |
| `created_at` | `timestamptz` |  |

### `trainer_policy_flags`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  |
| `flag` | `text` |  |
| `severity` | `text` |  |
| `set_by` | `text` |  |
| `notes` | `text` | Nullable |
| `resolved` | `bool` |  |
| `created_at` | `timestamptz` |  |

### `trainer_packaging_candidates`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  |
| `package_label` | `text` |  |
| `package_description` | `text` |  |
| `included_files` | `_text` |  |
| `included_scenarios` | `_text` |  |
| `included_configs` | `jsonb` |  |
| `boundary_statement` | `text` |  |
| `approved_by` | `text` |  |
| `approved_at` | `timestamptz` | Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## collaboration

### `collaborative_spaces`

| Column | Type | Constraints |
|---|---|---|
| `collaborative_space_id` | `uuid` | Primary |
| `slug` | `text` | Unique |
| `title` | `text` |  |
| `description` | `text` |  |
| `mission_context` | `text` |  |
| `ownership_rule` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_by` | `uuid` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `collaborative_space_members`

| Column | Type | Constraints |
|---|---|---|
| `collaborative_space_id` | `uuid` | Primary |
| `agent_id` | `uuid` | Primary |
| `member_role` | `collaborative_space_role` |  |
| `created_at` | `timestamptz` |  |

### `collaborative_memory_records`

| Column | Type | Constraints |
|---|---|---|
| `collaborative_memory_id` | `uuid` | Primary |
| `collaborative_space_id` | `uuid` |  |
| `source_memory_id` | `uuid` | Nullable |
| `created_by_agent_id` | `uuid` | Nullable |
| `memory_kind` | `memory_kind` |  |
| `title` | `text` |  |
| `summary` | `text` |  |
| `detail` | `text` | Nullable |
| `tags` | `_text` |  |
| `salience` | `numeric` |  |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `review_status` | `review_status` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `collaborators`

Universal top-level continuity surface for all formal GestaltView collaborators, human or digital.

| Column | Type | Constraints |
|---|---|---|
| `collaborator_id` | `uuid` | Primary |
| `collaborator_key` | `text` | Unique |
| `display_name` | `text` |  |
| `collaborator_type` | `text` |  |
| `entity_class` | `text` |  |
| `status` | `text` |  |
| `orientation_variant` | `text` | Nullable |
| `continuity_level` | `text` |  |
| `embodiment_profile_slug` | `text` | Nullable |
| `origin_surface` | `text` | Nullable |
| `external_provider` | `text` | Nullable |
| `external_reference` | `text` | Nullable |
| `auth_user_id` | `uuid` | Nullable |
| `app_user_id` | `text` | Nullable |
| `agent_id` | `uuid` | Nullable Unique |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `collaborator_roles`

| Column | Type | Constraints |
|---|---|---|
| `role_id` | `uuid` | Primary |
| `collaborator_id` | `uuid` |  |
| `role_key` | `text` |  |
| `role_name` | `text` |  |
| `role_scope` | `text` | Nullable |
| `is_primary` | `bool` |  |
| `status` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `collaborator_relationships`

| Column | Type | Constraints |
|---|---|---|
| `relationship_id` | `uuid` | Primary |
| `source_collaborator_id` | `uuid` |  |
| `target_collaborator_id` | `uuid` |  |
| `relationship_type` | `text` |  |
| `relationship_status` | `text` |  |
| `trust_level` | `numeric` | Nullable |
| `notes` | `text` | Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `collaborator_permissions`

| Column | Type | Constraints |
|---|---|---|
| `permission_id` | `uuid` | Primary |
| `collaborator_id` | `uuid` |  |
| `permission_key` | `text` |  |
| `permission_scope` | `text` | Nullable |
| `granted_by_collaborator_id` | `uuid` | Nullable |
| `status` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `collaborator_onboarding_events`

Durable provisioning log for collaborator onboarding, reprovisioning, and lifecycle changes.

| Column | Type | Constraints |
|---|---|---|
| `onboarding_event_id` | `uuid` | Primary |
| `collaborator_id` | `uuid` |  |
| `event_type` | `text` |  |
| `event_status` | `text` |  |
| `onboarding_packet_version` | `text` | Nullable |
| `orientation_variant` | `text` | Nullable |
| `embodiment_profile_created` | `bool` |  |
| `supabase_provisioned` | `bool` |  |
| `notes` | `text` | Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `completed_at` | `timestamptz` | Nullable |

### `collaborator_embodiment_links`

| Column | Type | Constraints |
|---|---|---|
| `embodiment_link_id` | `uuid` | Primary |
| `collaborator_id` | `uuid` |  |
| `embodiment_profile_slug` | `text` |  |
| `embodiment_profile_id` | `uuid` | Nullable |
| `link_status` | `text` |  |
| `is_primary` | `bool` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## commerce_gate

### `gate_buyers`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `email` | `text` | Unique |
| `company_name` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `gate_package_drafts`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `buyer_id` | `uuid` | Nullable |
| `buyer_email` | `text` | Nullable |
| `company_name` | `text` | Nullable |
| `use_case_slug` | `text` |  |
| `tier` | `text` |  |
| `seats_requested` | `int4` |  |
| `backend` | `text` |  |
| `delivery_surfaces` | `jsonb` |  |
| `operator_pack_slugs` | `jsonb` |  |
| `source_bundle_slugs` | `jsonb` |  |
| `theme_preset_id` | `text` |  |
| `brand_color` | `text` | Nullable |
| `logo_asset_path` | `text` | Nullable |
| `custom_notes` | `text` | Nullable |
| `wants_native_installer` | `bool` |  |
| `price_snapshot_cents` | `int4` |  |
| `config_hash` | `text` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `embodiment_profile_slug` | `text` |  |
| `buyer_context` | `jsonb` |  |
| `sidekick_state` | `jsonb` |  |

### `gate_orders`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `buyer_id` | `uuid` |  |
| `package_draft_id` | `uuid` |  |
| `customer_email` | `text` |  |
| `customer_name` | `text` | Nullable |
| `product_name` | `text` | Nullable |
| `stripe_checkout_session_id` | `text` | Nullable Unique |
| `stripe_payment_intent_id` | `text` | Nullable |
| `currency` | `text` |  |
| `subtotal_cents` | `int4` |  |
| `total_cents` | `int4` |  |
| `payment_status` | `text` |  |
| `order_status` | `text` |  |
| `paid_at` | `timestamptz` | Nullable |
| `config_hash` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `gate_order_items`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `order_id` | `uuid` |  |
| `item_type` | `text` |  |
| `item_ref` | `text` | Nullable |
| `label` | `text` |  |
| `quantity` | `int4` |  |
| `unit_price_cents` | `int4` |  |
| `metadata` | `jsonb` |  |

### `gate_build_jobs`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `order_id` | `uuid` |  |
| `package_draft_id` | `uuid` |  |
| `build_version` | `int4` |  |
| `status` | `text` |  |
| `started_at` | `timestamptz` | Nullable |
| `finished_at` | `timestamptz` | Nullable |
| `error_code` | `text` | Nullable |
| `error_message` | `text` | Nullable |
| `retry_count` | `int4` |  |
| `build_log` | `jsonb` |  |

### `gate_artifacts`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `build_job_id` | `uuid` |  |
| `artifact_type` | `text` |  |
| `storage_bucket` | `text` |  |
| `storage_path` | `text` |  |
| `signed_url_expires_at` | `timestamptz` | Nullable |
| `checksum_sha256` | `text` | Nullable |
| `byte_size` | `int8` | Nullable |
| `created_at` | `timestamptz` |  |
| `download_token` | `text` |  |

### `gate_support_requests`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `package_draft_id` | `uuid` | Nullable |
| `order_id` | `uuid` | Nullable |
| `request_type` | `text` |  |
| `summary` | `text` |  |
| `detail` | `text` | Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |

## corpus_ingestion

### `processing_runs`

ManifestPipeline telemetry — one row per pipeline execution with full metrics

| Column | Type | Constraints |
|---|---|---|
| `run_id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `status` | `text` |  |
| `model` | `text` | Nullable |
| `corpus_root` | `text` | Nullable |
| `documents_count` | `int4` |  |
| `chunks_count` | `int4` |  |
| `created_by` | `uuid` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `error_count` | `int4` |  |
| `duration_seconds` | `float8` | Nullable |
| `total_tokens` | `int4` |  |
| `summaries_count` | `int4` |  |
| `annotations_count` | `int4` |  |

### `documents`

| Column | Type | Constraints |
|---|---|---|
| `document_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `tenant_id` | `uuid` |  |
| `path` | `text` |  |
| `filename` | `text` |  |
| `hash` | `text` | Unique |
| `chunk_index` | `int4` |  |
| `total_chunks` | `int4` |  |
| `file_size_bytes` | `int4` | Nullable |
| `content` | `text` |  |
| `mime_type` | `text` | Nullable |
| `extracted_metadata` | `jsonb` |  |
| `provenance` | `jsonb` |  |
| `created_by` | `uuid` | Nullable |
| `created_at` | `timestamptz` |  |
| `source_created_at` | `timestamptz` | Nullable |
| `temporal_period` | `text` | Nullable |
| `timeline_folder` | `text` | Nullable |

### `embeddings`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `document_id` | `uuid` |  |
| `model` | `text` |  |
| `embedding` | `vector` |  |
| `created_at` | `timestamptz` |  |
| `run_id` | `uuid` | Nullable |

### `knowledge_fragments`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `content` | `text` |  |
| `content_hash` | `text` | Nullable Unique |
| `embedding` | `vector` | Nullable |
| `source_file` | `text` |  |
| `document_type` | `text` |  |
| `chunk_index` | `int4` |  |
| `total_chunks` | `int4` |  |
| `char_count` | `int4` | Nullable |
| `tags` | `_text` | Nullable |
| `created_at` | `timestamptz` | Nullable |
| `source_created_at` | `timestamptz` | Nullable |
| `temporal_period` | `text` | Nullable |
| `timeline_folder` | `text` | Nullable |
| `document_id` | `uuid` | Nullable |
| `source_path` | `text` | Nullable |
| `ingested_at` | `timestamptz` | Nullable |
| `file_last_modified` | `timestamptz` | Nullable |
| `package` | `text` | Nullable |
| `run_id` | `uuid` | Nullable |
| `doc_created_at` | `timestamptz` | Nullable |
| `doc_date_source` | `text` | Nullable |

### `summaries`

InchwormSummarizer + SnowballSummarizer output — primary, compounded, and corpus-level summaries

| Column | Type | Constraints |
|---|---|---|
| `summary_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `document_id` | `uuid` |  |
| `level` | `text` |  |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  |
| `model` | `text` | Nullable |
| `token_count` | `int4` | Nullable |
| `processing_time_ms` | `int4` | Nullable |

### `loom_annotations`

LoomAnalyzer output — gaps, threads, motifs, weak connections, and emergent patterns across the corpus

| Column | Type | Constraints |
|---|---|---|
| `annotation_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `type` | `text` |  |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  |
| `related_ids` | `jsonb` |  |
| `confidence_score` | `float8` | Nullable |

### `concepts`

| Column | Type | Constraints |
|---|---|---|
| `concept_id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `text` |  |
| `canonical` | `text` |  |
| `created_at` | `timestamptz` |  |

### `document_concepts`

| Column | Type | Constraints |
|---|---|---|
| `document_id` | `uuid` | Primary |
| `concept_id` | `uuid` | Primary |
| `weight` | `float4` |  |

### `annotation_concepts`

| Column | Type | Constraints |
|---|---|---|
| `annotation_id` | `uuid` | Primary |
| `concept_id` | `uuid` | Primary |

### `skill_fragments`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `document_id` | `uuid` | Nullable |
| `content` | `text` |  |
| `content_hash` | `text` | Nullable |
| `embedding` | `vector` | Nullable |
| `source_file` | `text` | Nullable |
| `document_type` | `text` | Nullable |
| `skill_name` | `text` | Nullable |
| `chunk_index` | `int4` | Nullable |
| `total_chunks` | `int4` | Nullable |
| `char_count` | `int4` | Nullable |
| `tags` | `_text` | Nullable |
| `created_at` | `timestamptz` | Nullable |

### `skills`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `name` | `text` | Unique |
| `description` | `text` | Nullable |
| `content` | `text` |  |
| `tags` | `_text` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `ingestion_safety_events`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `event_type` | `text` |  |
| `table_name` | `text` |  |
| `source_file` | `text` | Nullable |
| `document_type` | `text` | Nullable |
| `reasons` | `_text` |  |
| `affected_rows` | `int4` |  |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

## human_identity

### `human_identity_profiles`

| Column | Type | Constraints |
|---|---|---|
| `profile_id` | `uuid` | Primary |
| `subject_id` | `uuid` | Unique |
| `auth_user_id` | `uuid` |  |
| `identity_handle` | `text` |  |
| `display_name` | `text` |  |
| `self_model` | `jsonb` |  |
| `narrative_anchor` | `text` |  |
| `role_commitments` | `jsonb` |  |
| `boundary_policy` | `jsonb` |  |
| `contradiction_notes` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `human_cognition_profiles`

| Column | Type | Constraints |
|---|---|---|
| `cognition_profile_id` | `uuid` | Primary |
| `subject_id` | `uuid` | Unique |
| `auth_user_id` | `uuid` |  |
| `attention_profile` | `jsonb` |  |
| `working_memory` | `jsonb` |  |
| `reasoning_profile` | `jsonb` |  |
| `planning_profile` | `jsonb` |  |
| `language_profile` | `jsonb` |  |
| `executive_controls` | `jsonb` |  |
| `decision_policy` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `human_consciousness_profiles`

| Column | Type | Constraints |
|---|---|---|
| `consciousness_profile_id` | `uuid` | Primary |
| `subject_id` | `uuid` | Unique |
| `auth_user_id` | `uuid` |  |
| `present_state` | `jsonb` |  |
| `continuity_model` | `jsonb` |  |
| `self_observation` | `jsonb` |  |
| `agency_model` | `jsonb` |  |
| `time_orientation` | `jsonb` |  |
| `awareness_model` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `human_personality_profiles`

| Column | Type | Constraints |
|---|---|---|
| `personality_profile_id` | `uuid` | Primary |
| `subject_id` | `uuid` | Unique |
| `auth_user_id` | `uuid` |  |
| `trait_map` | `jsonb` |  |
| `temperament` | `jsonb` |  |
| `social_style` | `jsonb` |  |
| `communication_style` | `jsonb` |  |
| `values_profile` | `jsonb` |  |
| `attachments` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `human_context_views`

| Column | Type | Constraints |
|---|---|---|
| `context_view_id` | `uuid` | Primary |
| `subject_id` | `uuid` |  |
| `auth_user_id` | `uuid` |  |
| `scope` | `text` |  |
| `relationship_subject_id` | `uuid` | Nullable |
| `channel_key` | `text` | Nullable |
| `display_name` | `text` |  |
| `filter_policy` | `jsonb` |  |
| `presentation_overrides` | `jsonb` |  |
| `sharing_policy` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `human_continuity_snapshots`

| Column | Type | Constraints |
|---|---|---|
| `snapshot_id` | `uuid` | Primary |
| `subject_id` | `uuid` |  |
| `auth_user_id` | `uuid` |  |
| `snapshot_kind` | `text` |  |
| `surface_key` | `text` |  |
| `summary` | `text` |  |
| `snapshot` | `jsonb` |  |
| `provenance` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `human_memory_records`

| Column | Type | Constraints |
|---|---|---|
| `memory_id` | `uuid` | Primary |
| `subject_id` | `uuid` |  |
| `auth_user_id` | `uuid` |  |
| `source_memory_entry_id` | `uuid` | Nullable |
| `source_asset_id` | `uuid` | Nullable |
| `memory_kind` | `text` |  |
| `scope` | `text` |  |
| `title` | `text` |  |
| `summary` | `text` |  |
| `detail` | `text` | Nullable |
| `content_hash` | `text` |  |
| `embedding` | `vector` | Nullable |
| `tags` | `_text` |  |
| `emotional_valence` | `numeric` | Nullable |
| `salience` | `numeric` |  |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `consent_required` | `bool` |  |
| `archive_policy` | `archive_policy` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `human_relationship_edges`

| Column | Type | Constraints |
|---|---|---|
| `relationship_id` | `uuid` | Primary |
| `subject_id` | `uuid` |  |
| `auth_user_id` | `uuid` |  |
| `related_subject_id` | `uuid` |  |
| `relationship_type` | `text` |  |
| `trust_level` | `numeric` |  |
| `familiarity_level` | `numeric` |  |
| `intimacy_boundary` | `text` |  |
| `stance` | `text` |  |
| `shared_context` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `human_identity_evidence`

| Column | Type | Constraints |
|---|---|---|
| `evidence_id` | `uuid` | Primary |
| `subject_id` | `uuid` |  |
| `auth_user_id` | `uuid` |  |
| `source_type` | `text` |  |
| `source_asset_id` | `uuid` | Nullable |
| `source_memory_entry_id` | `uuid` | Nullable |
| `source_session_id` | `text` | Nullable |
| `excerpt` | `text` | Nullable |
| `weight` | `numeric` |  |
| `observed_at` | `timestamptz` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

### `human_identity_mutations`

| Column | Type | Constraints |
|---|---|---|
| `mutation_id` | `uuid` | Primary |
| `subject_id` | `uuid` |  |
| `auth_user_id` | `uuid` |  |
| `proposed_by_user_id` | `uuid` | Nullable |
| `source_asset_id` | `uuid` | Nullable |
| `mutation_type` | `identity_mutation_type` |  |
| `target_table` | `text` |  |
| `target_id` | `uuid` | Nullable |
| `target_path` | `text` |  |
| `mutation_class` | `mutation_class` |  |
| `risk_level` | `identity_mutation_risk_level` |  |
| `status` | `identity_mutation_status` |  |
| `patch_payload` | `jsonb` |  |
| `diff_summary` | `text` |  |
| `reason` | `text` | Nullable |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `last_affirmed_at` | `timestamptz` | Nullable |
| `approved_at` | `timestamptz` | Nullable |
| `applied_at` | `timestamptz` | Nullable |
| `rolled_back_at` | `timestamptz` | Nullable |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

### `human_identity_review_events`

| Column | Type | Constraints |
|---|---|---|
| `review_event_id` | `uuid` | Primary |
| `mutation_id` | `uuid` |  |
| `subject_id` | `uuid` | Nullable |
| `auth_user_id` | `uuid` | Nullable |
| `reviewer_user_id` | `uuid` | Nullable |
| `decision` | `identity_review_decision` |  |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

## identity_core

### `app_users`

| Column | Type | Constraints |
|---|---|---|
| `id` | `text` | Primary |
| `created_at` | `timestamptz` |  |
| `auth_user_id` | `uuid` | Nullable |
| `subject_id` | `uuid` | Nullable |
| `display_name` | `text` | Nullable |
| `metadata` | `jsonb` |  |

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `email` | `text` | Unique |
| `tier` | `text` |  |
| `stripe_customer_id` | `text` | Nullable Unique |
| `stripe_subscription_id` | `text` | Nullable |
| `subscription_status` | `text` | Nullable |
| `billing_period_start` | `timestamptz` | Nullable |
| `billy_query_count` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `is_admin` | `bool` |  |
| `grace_until` | `timestamptz` | Nullable |

### `identity_subjects`

| Column | Type | Constraints |
|---|---|---|
| `subject_id` | `uuid` | Primary |
| `subject_kind` | `identity_subject_kind` |  |
| `auth_user_id` | `uuid` | Nullable Unique |
| `app_user_id` | `text` | Nullable Unique |
| `agent_id` | `uuid` | Nullable Unique |
| `display_name` | `text` |  |
| `canonical_name` | `text` |  |
| `description` | `text` |  |
| `status` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## knowledge_assets

### `knowledge_assets`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `asset_type` | `knowledge_asset_type` |  |
| `storage_path` | `text` |  |
| `raw_text` | `text` | Nullable |
| `checksum` | `text` |  |
| `source_label` | `text` | Nullable |
| `source_uri` | `text` | Nullable |
| `uploaded_by` | `uuid` | Nullable |
| `visibility` | `knowledge_asset_visibility` |  |
| `status` | `knowledge_asset_status` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `knowledge_asset_chunks`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `asset_id` | `uuid` |  |
| `chunk_index` | `int4` |  |
| `content` | `text` |  |
| `embedding` | `vector` | Nullable |
| `token_count` | `int4` | Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

### `knowledge_tags`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `label` | `text` | Unique |
| `created_at` | `timestamptz` |  |

### `knowledge_asset_tags`

| Column | Type | Constraints |
|---|---|---|
| `asset_id` | `uuid` | Primary |
| `tag_id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |

### `agent_knowledge_links`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `asset_id` | `uuid` |  |
| `link_type` | `agent_knowledge_link_type` |  |
| `scope` | `agent_knowledge_link_scope` |  |
| `approved_by` | `uuid` | Nullable |
| `approved_at` | `timestamptz` | Nullable |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `knowledge_interpretations`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `asset_id` | `uuid` |  |
| `agent_id` | `uuid` | Nullable |
| `classification` | `knowledge_classification` |  |
| `extracted_payload` | `jsonb` |  |
| `confidence` | `numeric` | Nullable |
| `produced_by_run_id` | `uuid` | Nullable |
| `created_at` | `timestamptz` |  |

## miscellaneous

### `embodiment_mutations`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `source_asset_id` | `uuid` | Nullable |
| `interpretation_id` | `uuid` | Nullable |
| `mutation_type` | `embodiment_mutation_type` |  |
| `target_path` | `text` |  |
| `patch_payload` | `jsonb` |  |
| `file_payload` | `text` | Nullable |
| `diff_summary` | `text` |  |
| `risk_level` | `embodiment_mutation_risk_level` |  |
| `status` | `embodiment_mutation_status` |  |
| `approved_by` | `uuid` | Nullable |
| `approved_at` | `timestamptz` | Nullable |
| `applied_version_id` | `uuid` | Nullable |
| `created_at` | `timestamptz` |  |

### `identity_evidence`

| Column | Type | Constraints |
|---|---|---|
| `evidence_id` | `uuid` | Primary |
| `agent_id` | `uuid` | Nullable |
| `source_asset_id` | `uuid` | Nullable |
| `source_type` | `evidence_source_type` |  |
| `source_actor_id` | `uuid` | Nullable |
| `source_session_id` | `text` | Nullable |
| `excerpt` | `text` | Nullable |
| `weight` | `numeric` |  |
| `observed_at` | `timestamptz` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

### `identity_evidence_links`

| Column | Type | Constraints |
|---|---|---|
| `evidence_link_id` | `uuid` | Primary |
| `evidence_id` | `uuid` |  |
| `target_table` | `text` |  |
| `target_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |

### `identity_contradictions`

| Column | Type | Constraints |
|---|---|---|
| `contradiction_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `target_table` | `text` |  |
| `target_id` | `uuid` |  |
| `conflict_summary` | `text` |  |
| `prior_state` | `jsonb` |  |
| `incoming_state` | `jsonb` |  |
| `tension_status` | `review_status` |  |
| `resolved_by_mutation_id` | `uuid` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `identity_mutation_proposals`

| Column | Type | Constraints |
|---|---|---|
| `mutation_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `proposed_by_user_id` | `uuid` | Nullable |
| `proposed_by_agent_id` | `uuid` | Nullable |
| `source_asset_id` | `uuid` | Nullable |
| `mutation_type` | `identity_mutation_type` |  |
| `target_table` | `text` |  |
| `target_id` | `uuid` | Nullable |
| `target_path` | `text` |  |
| `mutation_class` | `mutation_class` |  |
| `risk_level` | `identity_mutation_risk_level` |  |
| `status` | `identity_mutation_status` |  |
| `patch_payload` | `jsonb` |  |
| `diff_summary` | `text` |  |
| `reason` | `text` | Nullable |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `last_affirmed_at` | `timestamptz` | Nullable |
| `approved_at` | `timestamptz` | Nullable |
| `applied_at` | `timestamptz` | Nullable |
| `rolled_back_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` |  |

### `identity_review_events`

| Column | Type | Constraints |
|---|---|---|
| `review_event_id` | `uuid` | Primary |
| `mutation_id` | `uuid` |  |
| `reviewer_user_id` | `uuid` | Nullable |
| `decision` | `identity_review_decision` |  |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `identity_rollback_events`

| Column | Type | Constraints |
|---|---|---|
| `rollback_event_id` | `uuid` | Primary |
| `mutation_id` | `uuid` |  |
| `rolled_back_by` | `uuid` | Nullable |
| `reason` | `text` | Nullable |
| `rollback_payload` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

## operations

### `ops_workbook_items`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `sheet_name` | `text` |  |
| `row_key` | `text` |  |
| `label` | `text` |  |
| `category` | `text` | Nullable |
| `status` | `text` | Nullable |
| `priority` | `text` | Nullable |
| `phase` | `text` | Nullable |
| `owner` | `text` |  |
| `target_start` | `date` | Nullable |
| `target_end` | `date` | Nullable |
| `notes` | `text` | Nullable |
| `link_ref` | `text` | Nullable |
| `meta` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

### `ops_workbook_sync_runs`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `triggered_by` | `text` | Nullable |
| `source_file` | `text` | Nullable |
| `rows_upserted` | `int4` |  |
| `rows_skipped` | `int4` |  |
| `errors` | `jsonb` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |

## runtime_continuity

### `consciousness_profiles`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `profile` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `subject_id` | `uuid` | Nullable |
| `auth_user_id` | `uuid` | Nullable |
| `snapshot` | `jsonb` |  |
| `source_manifest` | `jsonb` |  |
| `confidence` | `numeric` |  |

### `bucket_drops`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `content` | `text` |  |
| `raw_text` | `text` | Nullable |
| `capture_context` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `subject_id` | `uuid` | Nullable |
| `module_key` | `text` | Nullable |
| `intensity` | `int2` |  |
| `plk_resonance_score` | `numeric` |  |
| `specialized_apps` | `_text` |  |
| `tags` | `_text` |  |
| `stage` | `text` |  |
| `promoted_memory_id` | `uuid` | Nullable |
| `scored_at` | `timestamptz` | Nullable |
| `promoted_at` | `timestamptz` | Nullable |

### `musical_dna_analyses`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `song_title` | `text` |  |
| `artist` | `text` |  |
| `analysis` | `text` | Nullable |
| `empowerment_score` | `numeric` | Nullable |
| `created_at` | `timestamptz` |  |

### `billy_sessions`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `message` | `text` |  |
| `response` | `text` | Nullable |
| `provider` | `text` | Nullable |
| `mode` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

### `founder_context`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` | Unique |
| `plk_snapshot` | `jsonb` |  |
| `current_state` | `text` | Nullable |
| `mode_preference` | `text` |  |
| `last_session_at` | `timestamptz` | Nullable |
| `session_thread` | `text` | Nullable |
| `confirmed_adult` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `subject_id` | `uuid` | Nullable |
| `continuity_profile` | `jsonb` |  |
| `cognition_profile` | `jsonb` |  |
| `personality_profile` | `jsonb` |  |
| `memory_profile` | `jsonb` |  |
| `identity_profile` | `jsonb` |  |
| `context_manifest` | `jsonb` |  |
| `consent_policy` | `jsonb` |  |

### `memory_entries`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `scope` | `text` |  |
| `kind` | `text` |  |
| `title` | `text` | Nullable |
| `summary` | `text` | Nullable |
| `content` | `text` |  |
| `content_hash` | `text` |  |
| `embedding` | `vector` | Nullable |
| `source` | `text` |  |
| `source_ref` | `text` | Nullable |
| `tags` | `_text` |  |
| `metadata` | `jsonb` |  |
| `importance` | `int2` |  |
| `pinned` | `bool` |  |
| `archived_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `subject_id` | `uuid` | Nullable |
| `auth_user_id` | `uuid` | Nullable |
| `source_kind` | `text` |  |
| `entry_state` | `text` |  |
| `emotional_valence` | `numeric` | Nullable |
| `consent_required` | `bool` |  |
| `source_asset_id` | `uuid` | Nullable |
| `provenance` | `jsonb` |  |

## tribunal

### `tribunal_sessions`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `question` | `text` |  |
| `participants` | `_text` |  |
| `provider` | `text` | Nullable |
| `response` | `text` | Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

### `tribunal_events`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `question` | `text` |  |
| `candidate_answers` | `jsonb` |  |
| `winning_answer_id` | `text` | Nullable |
| `verdict_summary` | `text` | Nullable |
| `triggering_agent` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

### `tribunal_evidence`

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary |
| `tribunal_event_id` | `uuid` |  |
| `document_id` | `uuid` | Nullable |
| `fragment_id` | `uuid` | Nullable |
| `weight` | `numeric` |  |
| `comment` | `text` | Nullable |
| `created_at` | `timestamptz` |  |

