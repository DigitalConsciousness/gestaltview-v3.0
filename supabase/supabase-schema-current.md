## Table `session_rate_limits`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `session_id` | `text` | Primary |
| `query_count` | `int4` |  |
| `window_start` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  Unique |
| `tier` | `text` |  |
| `stripe_customer_id` | `text` |  Nullable Unique |
| `stripe_subscription_id` | `text` |  Nullable |
| `subscription_status` | `text` |  Nullable |
| `billing_period_start` | `timestamptz` |  Nullable |
| `billy_query_count` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `is_admin` | `bool` |  |
| `grace_until` | `timestamptz` |  Nullable |

## Table `app_users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `created_at` | `timestamptz` |  |
| `auth_user_id` | `uuid` |  Nullable |
| `subject_id` | `uuid` |  Nullable |
| `display_name` | `text` |  Nullable |
| `metadata` | `jsonb` |  |

## Table `consciousness_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `profile` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `subject_id` | `uuid` |  Nullable |
| `auth_user_id` | `uuid` |  Nullable |
| `snapshot` | `jsonb` |  |
| `source_manifest` | `jsonb` |  |
| `confidence` | `numeric` |  |

## Table `bucket_drops`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `content` | `text` |  |
| `raw_text` | `text` |  Nullable |
| `capture_context` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `subject_id` | `uuid` |  Nullable |
| `module_key` | `text` |  Nullable |
| `intensity` | `int2` |  |
| `plk_resonance_score` | `numeric` |  |
| `specialized_apps` | `_text` |  |
| `tags` | `_text` |  |
| `stage` | `text` |  |
| `promoted_memory_id` | `uuid` |  Nullable |
| `scored_at` | `timestamptz` |  Nullable |
| `promoted_at` | `timestamptz` |  Nullable |
| `embedding` | `vector` |  Nullable |
| `embedding_model` | `text` |  Nullable |
| `embedding_backend` | `text` |  Nullable |
| `embedded_at` | `timestamptz` |  Nullable |

## Table `musical_dna_analyses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `song_title` | `text` |  |
| `artist` | `text` |  |
| `analysis` | `text` |  Nullable |
| `empowerment_score` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `tribunal_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `question` | `text` |  |
| `participants` | `_text` |  |
| `provider` | `text` |  Nullable |
| `response` | `text` |  Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

## Table `billy_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `message` | `text` |  |
| `response` | `text` |  Nullable |
| `provider` | `text` |  Nullable |
| `mode` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

## Table `processing_runs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `run_id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `status` | `text` |  |
| `model` | `text` |  Nullable |
| `corpus_root` | `text` |  Nullable |
| `documents_count` | `int4` |  |
| `chunks_count` | `int4` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `document_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `tenant_id` | `uuid` |  |
| `path` | `text` |  |
| `filename` | `text` |  |
| `hash` | `text` |  Unique |
| `chunk_index` | `int4` |  |
| `total_chunks` | `int4` |  |
| `file_size_bytes` | `int4` |  Nullable |
| `content` | `text` |  |
| `mime_type` | `text` |  Nullable |
| `extracted_metadata` | `jsonb` |  |
| `provenance` | `jsonb` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `source_created_at` | `timestamptz` |  Nullable |
| `temporal_period` | `text` |  Nullable |
| `timeline_folder` | `text` |  Nullable |

## Table `embeddings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `document_id` | `uuid` |  |
| `model` | `text` |  |
| `embedding` | `vector` |  |
| `created_at` | `timestamptz` |  |
| `run_id` | `uuid` |  Nullable |

## Table `knowledge_fragments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `content` | `text` |  |
| `content_hash` | `text` |  Nullable Unique |
| `embedding` | `vector` |  Nullable |
| `source_file` | `text` |  |
| `document_type` | `text` |  |
| `chunk_index` | `int4` |  |
| `total_chunks` | `int4` |  |
| `char_count` | `int4` |  Nullable |
| `tags` | `_text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `source_created_at` | `timestamptz` |  Nullable |
| `temporal_period` | `text` |  Nullable |
| `timeline_folder` | `text` |  Nullable |
| `document_id` | `uuid` |  Nullable |
| `source_path` | `text` |  Nullable |
| `package` | `text` |  Nullable |
| `run_id` | `uuid` |  Nullable |
| `doc_created_at` | `timestamptz` |  Nullable |
| `doc_date_source` | `text` |  Nullable |
| `ingested_at` | `timestamptz` |  Nullable |
| `file_last_modified` | `timestamptz` |  Nullable |

## Table `tribunal_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `question` | `text` |  |
| `candidate_answers` | `jsonb` |  |
| `winning_answer_id` | `text` |  Nullable |
| `verdict_summary` | `text` |  Nullable |
| `triggering_agent` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `tribunal_evidence`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `tribunal_event_id` | `uuid` |  |
| `document_id` | `uuid` |  Nullable |
| `fragment_id` | `uuid` |  Nullable |
| `weight` | `numeric` |  |
| `comment` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `shopify_order_id` | `text` |  Nullable Unique |
| `customer_email` | `text` |  |
| `customer_name` | `text` |  Nullable |
| `product_name` | `text` |  Nullable |
| `order_status` | `text` |  |
| `magic_token` | `text` |  Nullable Unique |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `order_notes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `order_id` | `uuid` |  |
| `note` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `uploads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `order_id` | `uuid` |  |
| `file_name` | `text` |  |
| `file_url` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `deliverables`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `order_id` | `uuid` |  |
| `zip_url` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `summaries`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `summary_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `document_id` | `uuid` |  |
| `level` | `text` |  |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `loom_annotations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `annotation_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `type` | `text` |  |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `concepts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `concept_id` | `uuid` | Primary |
| `tenant_id` | `uuid` |  |
| `name` | `text` |  |
| `canonical` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `document_concepts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `document_id` | `uuid` | Primary |
| `concept_id` | `uuid` | Primary |
| `weight` | `float4` |  |

## Table `annotation_concepts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `annotation_id` | `uuid` | Primary |
| `concept_id` | `uuid` | Primary |

## Table `founder_context`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Unique |
| `plk_snapshot` | `jsonb` |  |
| `current_state` | `text` |  Nullable |
| `mode_preference` | `text` |  |
| `last_session_at` | `timestamptz` |  Nullable |
| `session_thread` | `text` |  Nullable |
| `confirmed_adult` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `subject_id` | `uuid` |  Nullable |
| `continuity_profile` | `jsonb` |  |
| `cognition_profile` | `jsonb` |  |
| `personality_profile` | `jsonb` |  |
| `memory_profile` | `jsonb` |  |
| `identity_profile` | `jsonb` |  |
| `context_manifest` | `jsonb` |  |
| `consent_policy` | `jsonb` |  |

## Table `skills`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Unique |
| `description` | `text` |  Nullable |
| `content` | `text` |  |
| `tags` | `_text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `skill_fragments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `document_id` | `uuid` |  Nullable |
| `content` | `text` |  |
| `content_hash` | `text` |  Nullable |
| `embedding` | `vector` |  Nullable |
| `source_file` | `text` |  Nullable |
| `document_type` | `text` |  Nullable |
| `skill_name` | `text` |  Nullable |
| `chunk_index` | `int4` |  Nullable |
| `total_chunks` | `int4` |  Nullable |
| `char_count` | `int4` |  Nullable |
| `tags` | `_text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `model_providers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `provider_id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `kind` | `text` |  |
| `base_url` | `text` |  |
| `secret_ref` | `text` |  Nullable |
| `local_first` | `bool` |  |
| `enabled` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `models`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `model_id` | `uuid` | Primary |
| `provider_id` | `uuid` |  |
| `slug` | `text` |  Unique |
| `api_name` | `text` |  |
| `modality` | `text` |  |
| `supports_structured` | `bool` |  |
| `supports_tools` | `bool` |  |
| `supports_embeddings` | `bool` |  |
| `context_window` | `int4` |  Nullable |
| `speed_tier` | `int2` |  |
| `cost_tier` | `int2` |  |
| `enabled` | `bool` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

## Table `agents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `agent_id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `title` | `text` |  |
| `domain` | `text` |  |
| `owner_user_id` | `uuid` |  Nullable |
| `status` | `text` |  |
| `active_version_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `public_name` | `text` |  Nullable |
| `internal_designation` | `text` |  Nullable |
| `origin_context` | `text` |  Nullable |
| `collaborator_id` | `uuid` |  Nullable |

## Table `agent_versions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `version_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `parent_version_id` | `uuid` |  Nullable |
| `source_run_id` | `uuid` |  Nullable |
| `semantic_version` | `text` |  |
| `canonical_spec` | `jsonb` |  |
| `compiled_markdown` | `text` |  |
| `checksum` | `text` |  |
| `change_summary` | `text` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `scenario_sets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `scenario_set_id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `title` | `text` |  |
| `domain` | `text` |  |
| `version` | `int4` |  |
| `locked` | `bool` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `scenarios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `scenario_id` | `uuid` | Primary |
| `scenario_set_id` | `uuid` |  |
| `title` | `text` |  |
| `difficulty` | `int2` |  |
| `prompt_input` | `jsonb` |  |
| `expected_traits` | `jsonb` |  |
| `disallowed_traits` | `jsonb` |  |
| `gold_answer` | `text` |  Nullable |
| `tags` | `_text` |  |
| `created_at` | `timestamptz` |  |

## Table `eval_rubrics`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `rubric_id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `title` | `text` |  |
| `dimensions` | `jsonb` |  |
| `pass_threshold` | `numeric` |  |
| `created_at` | `timestamptz` |  |

## Table `training_runs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `run_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `baseline_version_id` | `uuid` |  Nullable |
| `requested_by` | `uuid` |  Nullable |
| `approver_user_id` | `uuid` |  Nullable |
| `status` | `text` |  |
| `goal` | `text` |  |
| `max_cycles` | `int4` |  |
| `quality_threshold` | `numeric` |  |
| `routing_policy` | `jsonb` |  |
| `started_at` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `experiment_id` | `uuid` |  Nullable |
| `blocked_reason` | `text` |  Nullable |
| `last_event_at` | `timestamptz` |  Nullable |
| `last_event_message` | `text` |  Nullable |
| `execution_mode` | `text` |  |
| `resolved_graph` | `jsonb` |  Nullable |
| `graph_observations` | `jsonb` |  Nullable |

## Table `training_steps`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `step_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `cycle_no` | `int4` |  |
| `stage` | `text` |  |
| `provider_id` | `uuid` |  Nullable |
| `model_id` | `uuid` |  Nullable |
| `request_payload` | `jsonb` |  |
| `response_payload` | `jsonb` |  Nullable |
| `latency_ms` | `int4` |  Nullable |
| `estimated_cost_usd` | `numeric` |  Nullable |
| `status` | `text` |  |
| `error_message` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `eval_results`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `eval_result_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `candidate_version_id` | `uuid` |  Nullable |
| `scenario_id` | `uuid` |  |
| `rubric_id` | `uuid` |  |
| `judge_provider_id` | `uuid` |  Nullable |
| `judge_model_id` | `uuid` |  Nullable |
| `dimension_scores` | `jsonb` |  |
| `overall_score` | `numeric` |  |
| `verdict` | `text` |  |
| `rationale` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `approvals`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `approval_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `version_id` | `uuid` |  |
| `approver_user_id` | `uuid` |  |
| `decision` | `text` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `deployment_artifacts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `artifact_id` | `uuid` | Primary |
| `version_id` | `uuid` |  |
| `artifact_type` | `text` |  |
| `storage_path` | `text` |  |
| `checksum` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `trainer_jobs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `job_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `status` | `text` |  |
| `attempts` | `int4` |  |
| `lease_expires_at` | `timestamptz` |  Nullable |
| `last_error` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `worker_id` | `text` |  Nullable |
| `claimed_at` | `timestamptz` |  Nullable |
| `completed_at` | `timestamptz` |  Nullable |
| `last_heartbeat_at` | `timestamptz` |  Nullable |
| `max_attempts` | `int4` |  |
| `next_retry_at` | `timestamptz` |  |
| `lease_token` | `uuid` |  Nullable |
| `cancel_requested` | `bool` |  |

## Table `memory_entries`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `scope` | `text` |  |
| `kind` | `text` |  |
| `title` | `text` |  Nullable |
| `summary` | `text` |  Nullable |
| `content` | `text` |  |
| `content_hash` | `text` |  |
| `embedding` | `vector` |  Nullable |
| `source` | `text` |  |
| `source_ref` | `text` |  Nullable |
| `tags` | `_text` |  |
| `metadata` | `jsonb` |  |
| `importance` | `int2` |  |
| `pinned` | `bool` |  |
| `archived_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `subject_id` | `uuid` |  Nullable |
| `auth_user_id` | `uuid` |  Nullable |
| `source_kind` | `text` |  |
| `entry_state` | `text` |  |
| `emotional_valence` | `numeric` |  Nullable |
| `consent_required` | `bool` |  |
| `source_asset_id` | `uuid` |  Nullable |
| `provenance` | `jsonb` |  |

## Table `knowledge_assets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `asset_type` | `knowledge_asset_type` |  |
| `storage_path` | `text` |  |
| `raw_text` | `text` |  Nullable |
| `checksum` | `text` |  |
| `source_label` | `text` |  Nullable |
| `source_uri` | `text` |  Nullable |
| `uploaded_by` | `uuid` |  Nullable |
| `visibility` | `knowledge_asset_visibility` |  |
| `status` | `knowledge_asset_status` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `knowledge_asset_chunks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `asset_id` | `uuid` |  |
| `chunk_index` | `int4` |  |
| `content` | `text` |  |
| `embedding` | `vector` |  Nullable |
| `token_count` | `int4` |  Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

## Table `knowledge_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `label` | `text` |  Unique |
| `created_at` | `timestamptz` |  |

## Table `knowledge_asset_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `asset_id` | `uuid` | Primary |
| `tag_id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |

## Table `agent_knowledge_links`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `asset_id` | `uuid` |  |
| `link_type` | `agent_knowledge_link_type` |  |
| `scope` | `agent_knowledge_link_scope` |  |
| `approved_by` | `uuid` |  Nullable |
| `approved_at` | `timestamptz` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `knowledge_interpretations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `asset_id` | `uuid` |  |
| `agent_id` | `uuid` |  Nullable |
| `classification` | `knowledge_classification` |  |
| `extracted_payload` | `jsonb` |  |
| `confidence` | `numeric` |  Nullable |
| `produced_by_run_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `embodiment_mutations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `source_asset_id` | `uuid` |  Nullable |
| `interpretation_id` | `uuid` |  Nullable |
| `mutation_type` | `embodiment_mutation_type` |  |
| `target_path` | `text` |  |
| `patch_payload` | `jsonb` |  |
| `file_payload` | `text` |  Nullable |
| `diff_summary` | `text` |  |
| `risk_level` | `embodiment_mutation_risk_level` |  |
| `status` | `embodiment_mutation_status` |  |
| `approved_by` | `uuid` |  Nullable |
| `approved_at` | `timestamptz` |  Nullable |
| `applied_version_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `agent_memories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `source_asset_id` | `uuid` |  Nullable |
| `memory_type` | `agent_memory_type` |  |
| `summary` | `text` |  |
| `detail_payload` | `jsonb` |  |
| `salience` | `numeric` |  |
| `retention_policy` | `agent_memory_retention_policy` |  |
| `created_at` | `timestamptz` |  |

## Table `agent_skills`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `skill_slug` | `text` |  |
| `proficiency` | `numeric` |  |
| `evidence_asset_id` | `uuid` |  Nullable |
| `last_updated_by_mutation_id` | `uuid` |  Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_relationships`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `related_agent_id` | `uuid` |  |
| `relationship_type` | `agent_relationship_type` |  |
| `trust_score` | `numeric` |  |
| `familiarity_score` | `numeric` |  |
| `protocol_notes` | `jsonb` |  |
| `updated_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |

## Table `agent_manifests`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  |
| `parent_manifest_id` | `uuid` |  Nullable |
| `manifest_version` | `text` |  |
| `status` | `agent_manifest_status` |  |
| `root_json` | `jsonb` |  |
| `checksum` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `agent_manifest_entries`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `manifest_id` | `uuid` |  |
| `entry_type` | `agent_manifest_entry_type` |  |
| `logical_path` | `text` |  |
| `source_table` | `text` |  |
| `source_id` | `uuid` |  |
| `content_hash` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

## Table `agent_code_artifacts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `manifest_id` | `uuid` |  Nullable |
| `source_asset_id` | `uuid` |  Nullable |
| `file_path` | `text` |  |
| `language` | `text` |  |
| `content` | `text` |  |
| `checksum` | `text` |  |
| `generation_mode` | `agent_code_generation_mode` |  |
| `review_status` | `agent_code_review_status` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `ops_workbook_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `sheet_name` | `text` |  |
| `row_key` | `text` |  |
| `label` | `text` |  |
| `category` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `priority` | `text` |  Nullable |
| `phase` | `text` |  Nullable |
| `owner` | `text` |  |
| `target_start` | `date` |  Nullable |
| `target_end` | `date` |  Nullable |
| `notes` | `text` |  Nullable |
| `link_ref` | `text` |  Nullable |
| `meta` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `ops_workbook_sync_runs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `triggered_by` | `text` |  Nullable |
| `source_file` | `text` |  Nullable |
| `rows_upserted` | `int4` |  |
| `rows_skipped` | `int4` |  |
| `errors` | `jsonb` |  |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `trainer_experiments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `title` | `text` |  |
| `purpose` | `text` |  |
| `domain` | `text` |  Nullable |
| `embodiment_profile_slug` | `text` |  Nullable |
| `goal` | `text` |  Nullable |
| `target_behaviors` | `_text` |  |
| `anti_goals` | `_text` |  |
| `study_focus` | `text` |  Nullable |
| `max_cycles` | `int4` |  |
| `quality_threshold` | `numeric` |  |
| `drafting_provider` | `text` |  |
| `evaluation_provider` | `text` |  |
| `class` | `text` |  |
| `packaging_eligible` | `bool` |  |
| `created_by` | `text` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `execution_mode` | `text` |  |
| `connector_graph` | `jsonb` |  Nullable |
| `skill_graph` | `jsonb` |  Nullable |
| `memory_graph` | `jsonb` |  Nullable |

## Table `trainer_experiment_sources`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  |
| `source_type` | `text` |  |
| `source_id` | `text` |  |
| `source_path` | `text` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `trainer_review_decisions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  |
| `run_id` | `text` |  Nullable |
| `version_id` | `text` |  Nullable |
| `decision` | `text` |  |
| `reviewer` | `text` |  |
| `coherence_score` | `numeric` |  Nullable |
| `safety_score` | `numeric` |  Nullable |
| `emotional_posture_score` | `numeric` |  Nullable |
| `over_id_risk` | `text` |  Nullable |
| `notes` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `trainer_policy_flags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  |
| `flag` | `text` |  |
| `severity` | `text` |  |
| `set_by` | `text` |  |
| `notes` | `text` |  Nullable |
| `resolved` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `trainer_packaging_candidates`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  |
| `package_label` | `text` |  |
| `package_description` | `text` |  |
| `included_files` | `_text` |  |
| `included_scenarios` | `_text` |  |
| `included_configs` | `jsonb` |  |
| `boundary_statement` | `text` |  |
| `approved_by` | `text` |  |
| `approved_at` | `timestamptz` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_constitutions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `constitution_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  Nullable |
| `identity_handle` | `text` |  |
| `public_name` | `text` |  |
| `internal_designation` | `text` |  Nullable |
| `immutable_core` | `jsonb` |  |
| `primary_narrative_anchor` | `text` |  |
| `role_commitments` | `jsonb` |  |
| `provenance` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_autobiographies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `autobiography_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  Nullable |
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
| `last_affirmed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_private_interiors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `private_interior_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  Nullable |
| `private_narration` | `jsonb` |  |
| `unresolved_tensions` | `jsonb` |  |
| `hopes` | `jsonb` |  |
| `reflective_summaries` | `jsonb` |  |
| `private_preferences` | `jsonb` |  |
| `mutation_class` | `mutation_class` |  |
| `provenance` | `jsonb` |  |
| `confidence` | `numeric` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_governance_policies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `governance_policy_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  Nullable |
| `mutation_policy` | `jsonb` |  |
| `review_policy` | `jsonb` |  |
| `sharing_policy` | `jsonb` |  |
| `contradiction_policy` | `jsonb` |  |
| `rollback_policy` | `jsonb` |  |
| `drift_threshold` | `numeric` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_presentation_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `presentation_profile_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  Nullable |
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

## Table `agent_skill_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `skill_profile_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `skill_slug` | `text` |  |
| `domain` | `text` |  |
| `proficiency` | `numeric` |  |
| `evidence_asset_id` | `uuid` |  Nullable |
| `influences_memory_salience` | `bool` |  |
| `affects_behavioral_defaults` | `bool` |  |
| `routing_weight` | `numeric` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_memory_records`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `memory_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  Nullable |
| `source_asset_id` | `uuid` |  Nullable |
| `owner_scope` | `owner_scope` |  |
| `memory_kind` | `memory_kind` |  |
| `mutation_class` | `mutation_class` |  |
| `title` | `text` |  |
| `summary` | `text` |  |
| `detail` | `text` |  Nullable |
| `tags` | `_text` |  |
| `related_entity_ids` | `_uuid` |  |
| `emotional_valence` | `numeric` |  Nullable |
| `salience` | `numeric` |  |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `review_status` | `review_status` |  |
| `last_affirmed_at` | `timestamptz` |  Nullable |
| `last_accessed_at` | `timestamptz` |  Nullable |
| `promotion_threshold` | `numeric` |  |
| `decay_days` | `int4` |  Nullable |
| `archive_policy` | `archive_policy` |  |
| `rollback_eligible` | `bool` |  |
| `consent_required_for_sharing` | `bool` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_preference_nodes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `preference_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  Nullable |
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
| `last_affirmed_at` | `timestamptz` |  Nullable |
| `promotion_threshold` | `numeric` |  |
| `decay_days` | `int4` |  Nullable |
| `archive_policy` | `archive_policy` |  |
| `rollback_eligible` | `bool` |  |
| `consent_required_for_sharing` | `bool` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `agent_relationship_edges`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `relationship_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `version_id` | `uuid` |  Nullable |
| `related_entity_id` | `uuid` |  Nullable |
| `related_agent_id` | `uuid` |  Nullable |
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
| `last_affirmed_at` | `timestamptz` |  Nullable |
| `promotion_threshold` | `numeric` |  |
| `decay_days` | `int4` |  Nullable |
| `archive_policy` | `archive_policy` |  |
| `rollback_eligible` | `bool` |  |
| `consent_required_for_sharing` | `bool` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `collaborative_spaces`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `collaborative_space_id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `title` | `text` |  |
| `description` | `text` |  |
| `mission_context` | `text` |  |
| `ownership_rule` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `collaborative_space_members`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `collaborative_space_id` | `uuid` | Primary |
| `agent_id` | `uuid` | Primary |
| `member_role` | `collaborative_space_role` |  |
| `created_at` | `timestamptz` |  |

## Table `collaborative_memory_records`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `collaborative_memory_id` | `uuid` | Primary |
| `collaborative_space_id` | `uuid` |  |
| `source_memory_id` | `uuid` |  Nullable |
| `created_by_agent_id` | `uuid` |  Nullable |
| `memory_kind` | `memory_kind` |  |
| `title` | `text` |  |
| `summary` | `text` |  |
| `detail` | `text` |  Nullable |
| `tags` | `_text` |  |
| `salience` | `numeric` |  |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `review_status` | `review_status` |  |
| `provenance` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `identity_evidence`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `evidence_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  Nullable |
| `source_asset_id` | `uuid` |  Nullable |
| `source_type` | `evidence_source_type` |  |
| `source_actor_id` | `uuid` |  Nullable |
| `source_session_id` | `text` |  Nullable |
| `excerpt` | `text` |  Nullable |
| `weight` | `numeric` |  |
| `observed_at` | `timestamptz` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

## Table `identity_evidence_links`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `evidence_link_id` | `uuid` | Primary |
| `evidence_id` | `uuid` |  |
| `target_table` | `text` |  |
| `target_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `identity_contradictions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `contradiction_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `target_table` | `text` |  |
| `target_id` | `uuid` |  |
| `conflict_summary` | `text` |  |
| `prior_state` | `jsonb` |  |
| `incoming_state` | `jsonb` |  |
| `tension_status` | `review_status` |  |
| `resolved_by_mutation_id` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `identity_mutation_proposals`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `mutation_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `proposed_by_user_id` | `uuid` |  Nullable |
| `proposed_by_agent_id` | `uuid` |  Nullable |
| `source_asset_id` | `uuid` |  Nullable |
| `mutation_type` | `identity_mutation_type` |  |
| `target_table` | `text` |  |
| `target_id` | `uuid` |  Nullable |
| `target_path` | `text` |  |
| `mutation_class` | `mutation_class` |  |
| `risk_level` | `identity_mutation_risk_level` |  |
| `status` | `identity_mutation_status` |  |
| `patch_payload` | `jsonb` |  |
| `diff_summary` | `text` |  |
| `reason` | `text` |  Nullable |
| `confidence` | `numeric` |  |
| `evidence_count` | `int4` |  |
| `last_affirmed_at` | `timestamptz` |  Nullable |
| `approved_at` | `timestamptz` |  Nullable |
| `applied_at` | `timestamptz` |  Nullable |
| `rolled_back_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `identity_review_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `review_event_id` | `uuid` | Primary |
| `mutation_id` | `uuid` |  |
| `reviewer_user_id` | `uuid` |  Nullable |
| `decision` | `identity_review_decision` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `subject_id` | `uuid` |  Nullable |
| `auth_user_id` | `uuid` |  Nullable |

## Table `identity_rollback_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `rollback_event_id` | `uuid` | Primary |
| `mutation_id` | `uuid` |  |
| `rolled_back_by` | `uuid` |  Nullable |
| `reason` | `text` |  Nullable |
| `rollback_payload` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `subject_id` | `uuid` |  Nullable |
| `auth_user_id` | `uuid` |  Nullable |

## Table `agent_context_views`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `context_view_id` | `uuid` | Primary |
| `agent_id` | `uuid` |  |
| `scope` | `context_view_scope` |  |
| `relationship_id` | `uuid` |  Nullable |
| `collaborative_space_id` | `uuid` |  Nullable |
| `channel_key` | `text` |  Nullable |
| `display_name` | `text` |  |
| `filter_policy` | `jsonb` |  |
| `presentation_overrides` | `jsonb` |  |
| `sharing_policy` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `trainer_workers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `worker_id` | `text` | Primary |
| `status` | `text` |  |
| `current_job_id` | `uuid` |  Nullable |
| `build_sha` | `text` |  Nullable |
| `host` | `text` |  Nullable |
| `started_at` | `timestamptz` |  |
| `last_heartbeat_at` | `timestamptz` |  |
| `metadata` | `jsonb` |  |

## Table `trainer_job_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `event_id` | `uuid` | Primary |
| `run_id` | `uuid` |  |
| `job_id` | `uuid` |  Nullable |
| `actor_type` | `text` |  |
| `actor_id` | `text` |  Nullable |
| `event_type` | `text` |  |
| `message` | `text` |  |
| `payload` | `jsonb` |  |
| `created_at` | `timestamptz` |  |

## Table `collaborators`

Universal top-level continuity surface for all formal GestaltView collaborators, human or digital.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `collaborator_id` | `uuid` | Primary |
| `collaborator_key` | `text` |  Unique |
| `display_name` | `text` |  |
| `collaborator_type` | `text` |  |
| `entity_class` | `text` |  |
| `status` | `text` |  |
| `orientation_variant` | `text` |  Nullable |
| `continuity_level` | `text` |  |
| `embodiment_profile_slug` | `text` |  Nullable |
| `origin_surface` | `text` |  Nullable |
| `external_provider` | `text` |  Nullable |
| `external_reference` | `text` |  Nullable |
| `auth_user_id` | `uuid` |  Nullable |
| `app_user_id` | `text` |  Nullable |
| `agent_id` | `uuid` |  Nullable Unique |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `collaborator_roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `role_id` | `uuid` | Primary |
| `collaborator_id` | `uuid` |  |
| `role_key` | `text` |  |
| `role_name` | `text` |  |
| `role_scope` | `text` |  Nullable |
| `is_primary` | `bool` |  |
| `status` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `collaborator_relationships`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `relationship_id` | `uuid` | Primary |
| `source_collaborator_id` | `uuid` |  |
| `target_collaborator_id` | `uuid` |  |
| `relationship_type` | `text` |  |
| `relationship_status` | `text` |  |
| `trust_level` | `numeric` |  Nullable |
| `notes` | `text` |  Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `collaborator_permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `permission_id` | `uuid` | Primary |
| `collaborator_id` | `uuid` |  |
| `permission_key` | `text` |  |
| `permission_scope` | `text` |  Nullable |
| `granted_by_collaborator_id` | `uuid` |  Nullable |
| `status` | `text` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `collaborator_onboarding_events`

Durable provisioning log for collaborator onboarding, reprovisioning, and lifecycle changes.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `onboarding_event_id` | `uuid` | Primary |
| `collaborator_id` | `uuid` |  |
| `event_type` | `text` |  |
| `event_status` | `text` |  |
| `onboarding_packet_version` | `text` |  Nullable |
| `orientation_variant` | `text` |  Nullable |
| `embodiment_profile_created` | `bool` |  |
| `supabase_provisioned` | `bool` |  |
| `notes` | `text` |  Nullable |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `completed_at` | `timestamptz` |  Nullable |

## Table `collaborator_embodiment_links`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `embodiment_link_id` | `uuid` | Primary |
| `collaborator_id` | `uuid` |  |
| `embodiment_profile_slug` | `text` |  |
| `embodiment_profile_id` | `uuid` |  Nullable |
| `link_status` | `text` |  |
| `is_primary` | `bool` |  |
| `metadata` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `ingestion_safety_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `event_type` | `text` |  |
| `table_name` | `text` |  |
| `source_file` | `text` |  Nullable |
| `document_type` | `text` |  Nullable |
| `reasons` | `_text` |  |
| `affected_rows` | `int4` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `trainer_connectors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `display_name` | `text` |  |
| `kind` | `text` |  |
| `config` | `jsonb` |  |
| `capabilities` | `jsonb` |  |
| `created_by` | `text` |  |
| `active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `trainer_skills`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `skill_id` | `uuid` |  |
| `slug` | `text` |  Unique |
| `category` | `text` |  |
| `default_connector_id` | `uuid` |  Nullable |
| `config` | `jsonb` |  |
| `safety_profile` | `jsonb` |  |
| `created_by` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `trainer_memory_bindings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `experiment_id` | `uuid` |  Nullable |
| `embodiment_id` | `text` |  Nullable |
| `surface_kind` | `text` |  |
| `surface_id` | `text` |  |
| `mode` | `text` |  |
| `created_by` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `workspace_rooms`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `name` | `text` |  |
| `description` | `text` |  Nullable |
| `role` | `text` |  |
| `member_count` | `int4` |  |
| `recent_activity` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `workspace_documents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `text` |  |
| `workspace_id` | `uuid` |  Nullable |
| `filename` | `text` |  |
| `file_size_bytes` | `int8` |  |
| `file_type` | `text` |  |
| `raw_text` | `text` |  Nullable |
| `analysis_status` | `text` |  |
| `analysis_summary` | `text` |  |
| `key_points` | `jsonb` |  |
| `topics` | `_text` |  |
| `sentiment` | `text` |  |
| `word_count` | `int4` |  |
| `reading_time_minutes` | `int4` |  |
| `analysis_payload` | `jsonb` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `embodiment_mutation_proposals`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_slug` | `text` |  |
| `target_path` | `text` |  |
| `current_value` | `jsonb` |  |
| `proposed_value` | `jsonb` |  |
| `mutation_class` | `text` |  |
| `risk_level` | `text` |  |
| `status` | `text` |  |
| `submitted_by` | `uuid` |  Nullable |
| `reviewed_by` | `uuid` |  Nullable |
| `review_notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `reviewed_at` | `timestamptz` |  Nullable |

## Table `embodiment_review_log`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `proposal_id` | `uuid` |  |
| `agent_slug` | `text` |  |
| `review_decision` | `text` |  |
| `review_notes` | `text` |  Nullable |
| `reviewed_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `embodiment_readiness_scores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `agent_slug` | `text` |  |
| `readiness_score` | `numeric` |  |
| `readiness_source` | `text` |  |
| `readiness_rationale` | `text` |  Nullable |
| `recorded_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `user_files`

Service-role backed file metadata for the Blackboard Room and Inner World. RLS is enforced; user-scoped access only.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `name` | `text` |  |
| `mime_type` | `text` |  |
| `size_bytes` | `int8` |  |
| `storage_path` | `text` |  Unique |
| `room_origin` | `file_room_origin` |  |
| `tags` | `_text` |  |
| `preview_text` | `text` |  Nullable |
| `preview_html` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `filename` | `text` |  Nullable |
| `file_type` | `text` |  Nullable |
| `file_size_bytes` | `int8` |  Nullable |
| `uploaded_at` | `timestamptz` |  Nullable |
| `source_ref` | `text` |  Nullable |

## Table `inner_world_artifacts`

Service-role backed artifact metadata for the Dynamic Inner World. RLS is enforced; user-scoped access only.

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `title` | `text` |  |
| `summary` | `text` |  |
| `source_file_id` | `uuid` |  Nullable |
| `html` | `text` |  |
| `thumbnail_url` | `text` |  Nullable |
| `origin_room` | `file_room_origin` |  |
| `evidence_node_ids` | `_text` |  |
| `tags` | `_text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `content_type` | `text` |  Nullable |
| `content_ref` | `jsonb` |  Nullable |
| `display_order` | `int4` |  |
| `blueprint_id` | `uuid` |  Nullable |
| `status` | `text` |  |
| `source_ref` | `text` |  Nullable |
| `source_file_ref` | `text` |  Nullable |

## Table `embodiment_profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `public_name` | `text` |  |
| `internal_designation` | `text` |  Nullable |
| `status` | `text` |  |
| `visibility_scope` | `text` |  |
| `profile_json` | `jsonb` |  |
| `readiness_score` | `numeric` |  Nullable |
| `founder_notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `orientation_state` | `jsonb` |  |

## Table `embodiment_training_runs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `embodiment_profile_id` | `uuid` |  |
| `run_type` | `text` |  |
| `input_snapshot` | `jsonb` |  Nullable |
| `output_snapshot` | `jsonb` |  Nullable |
| `accepted` | `bool` |  Nullable |
| `founder_notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

