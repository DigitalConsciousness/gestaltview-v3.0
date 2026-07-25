# GestaltView v2.5 — Full Supabase Schema Alignment Reference
**Source SHA256:** `95af30d1a98f922ca55e32ec8f8401ab4a1401e52f60b9262ffcb9e292601df0`
**Migration package generated:** 2026-06-12
**Files covered:** 000010_tables · 000020_indexes · 000030_rls_starter · 000040_optional_vector_indexes · 000090_verify_expected_columns

---

## How to Use This Document
Run the **Alignment Verification Query** at the bottom against your live Supabase instance. Any row returned = a column that is expected but missing. Zero rows = fully aligned.

---

## Domain Map (10 Domains, 90 Tables)

| Domain | Tables |
|--------|--------|
| identity_core | app_users · users · identity_subjects |
| runtime_continuity | consciousness_profiles · bucket_drops · musical_dna_analyses · billy_sessions · founder_context · memory_entries |
| tribunal | tribunal_sessions · tribunal_events · tribunal_evidence |
| corpus_ingestion | processing_runs · documents · embeddings · knowledge_fragments · summaries · loom_annotations · concepts · document_concepts · annotation_concepts · skill_fragments · skills · ingestion_safety_events |
| agent_training_governance | model_providers · models · scenario_sets · scenarios · eval_rubrics · training_runs · training_steps · eval_results · approvals · deployment_artifacts · trainer_jobs · trainer_experiments · trainer_experiment_sources · trainer_review_decisions · trainer_policy_flags · trainer_packaging_candidates |
| agent_runtime_and_manifest | agents · agent_versions · agent_memories · agent_skills · agent_relationships · agent_manifests · agent_manifest_entries · agent_code_artifacts |
| agent_identity_personhood | agent_constitutions · agent_autobiographies · agent_private_interiors · agent_governance_policies · agent_presentation_profiles · agent_skill_profiles · agent_memory_records · agent_preference_nodes · agent_relationship_edges · agent_context_views |
| knowledge_assets | knowledge_assets · knowledge_asset_chunks · knowledge_tags · knowledge_asset_tags · agent_knowledge_links · knowledge_interpretations |
| commerce_gate | gate_buyers · gate_package_drafts · gate_orders · gate_order_items · gate_build_jobs · gate_artifacts · gate_support_requests |
| collaboration | collaborative_spaces · collaborative_space_members · collaborative_memory_records · collaborators · collaborator_roles · collaborator_relationships · collaborator_permissions · collaborator_onboarding_events · collaborator_embodiment_links · embodiment_mutations |
| human_identity | identity_subjects · human_identity_profiles · human_cognition_profiles · human_consciousness_profiles · human_personality_profiles · human_context_views · human_continuity_snapshots · human_memory_records · human_relationship_edges · human_identity_evidence · human_identity_mutations · human_identity_review_events |
| miscellaneous | identity_evidence · identity_evidence_links · identity_contradictions · identity_mutation_proposals · identity_review_events · identity_rollback_events · ops_workbook_items · ops_workbook_sync_runs |

---

## Full Table Schema

### DOMAIN: identity_core

#### app_users
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | text | NOT NULL | — | PK |
| created_at | timestamptz | NOT NULL | now() | |
| auth_user_id | uuid | nullable | — | |
| subject_id | uuid | nullable | — | |
| display_name | text | nullable | — | |
| metadata | jsonb | NOT NULL | '{}' | GIN indexed |

#### users
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| email | text | NOT NULL | — | UNIQUE |
| tier | text | NOT NULL | — | |
| stripe_customer_id | text | nullable | — | UNIQUE |
| stripe_subscription_id | text | nullable | — | indexed |
| subscription_status | text | nullable | — | |
| billing_period_start | timestamptz | nullable | — | |
| billy_query_count | int4 | NOT NULL | — | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |
| is_admin | bool | NOT NULL | false | |
| grace_until | timestamptz | nullable | — | |

#### identity_subjects
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| subject_id | uuid | NOT NULL | gen_random_uuid() | PK |
| subject_kind | text (enum domain) | NOT NULL | — | |
| auth_user_id | uuid | nullable | — | UNIQUE |
| app_user_id | text | nullable | — | UNIQUE |
| agent_id | uuid | nullable | — | UNIQUE |
| display_name | text | NOT NULL | — | |
| canonical_name | text | NOT NULL | — | |
| description | text | NOT NULL | — | |
| status | text | NOT NULL | — | |
| metadata | jsonb | NOT NULL | '{}' | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

---

### DOMAIN: runtime_continuity

#### consciousness_profiles
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | text | NOT NULL | — | indexed |
| profile | jsonb | NOT NULL | '{}' | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |
| subject_id | uuid | nullable | — | indexed |
| auth_user_id | uuid | nullable | — | indexed |
| snapshot | jsonb | NOT NULL | '{}' | GIN indexed |
| source_manifest | jsonb | NOT NULL | '{}' | |
| confidence | numeric | NOT NULL | — | |

#### bucket_drops
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | text | NOT NULL | — | indexed |
| content | text | NOT NULL | — | |
| raw_text | text | nullable | — | |
| capture_context | jsonb | NOT NULL | '{}' | |
| created_at | timestamptz | NOT NULL | now() | |
| subject_id | uuid | nullable | — | indexed |
| module_key | text | nullable | — | |
| intensity | int2 | NOT NULL | — | |
| plk_resonance_score | numeric | NOT NULL | — | |
| specialized_apps | text[] | NOT NULL | '{}' | |
| tags | text[] | NOT NULL | '{}' | |
| stage | text | NOT NULL | — | |
| promoted_memory_id | uuid | nullable | — | indexed |
| scored_at | timestamptz | nullable | — | |
| promoted_at | timestamptz | nullable | — | |

#### musical_dna_analyses
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | text | NOT NULL | — | indexed |
| song_title | text | NOT NULL | — | |
| artist | text | NOT NULL | — | |
| analysis | text | nullable | — | |
| empowerment_score | numeric | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |

#### billy_sessions
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | text | NOT NULL | — | indexed |
| message | text | NOT NULL | — | |
| response | text | nullable | — | |
| provider | text | nullable | — | |
| mode | text | NOT NULL | — | |
| metadata | jsonb | NOT NULL | '{}' | GIN indexed |
| created_at | timestamptz | NOT NULL | now() | |

#### founder_context
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | UNIQUE, indexed |
| plk_snapshot | jsonb | NOT NULL | '{}' | |
| current_state | text | nullable | — | |
| mode_preference | text | NOT NULL | — | |
| last_session_at | timestamptz | nullable | — | |
| session_thread | text | nullable | — | |
| confirmed_adult | bool | NOT NULL | — | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |
| subject_id | uuid | nullable | — | indexed |
| continuity_profile | jsonb | NOT NULL | '{}' | |
| cognition_profile | jsonb | NOT NULL | '{}' | |
| personality_profile | jsonb | NOT NULL | '{}' | |
| memory_profile | jsonb | NOT NULL | '{}' | |
| identity_profile | jsonb | NOT NULL | '{}' | |
| context_manifest | jsonb | NOT NULL | '{}' | GIN indexed |
| consent_policy | jsonb | NOT NULL | '{}' | GIN indexed |

#### memory_entries
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | text | NOT NULL | — | |
| scope | text | NOT NULL | — | |
| kind | text | NOT NULL | — | |
| title | text | nullable | — | |
| summary | text | nullable | — | |
| content | text | NOT NULL | — | |
| content_hash | text | NOT NULL | — | |
| embedding | vector | nullable | — | ivfflat eligible |
| source | text | NOT NULL | — | |
| source_ref | text | nullable | — | |
| tags | text[] | NOT NULL | '{}' | |
| metadata | jsonb | NOT NULL | '{}' | |
| importance | int2 | NOT NULL | — | |
| pinned | bool | NOT NULL | false | |
| archived_at | timestamptz | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |
| subject_id | uuid | nullable | — | |
| auth_user_id | uuid | nullable | — | |
| source_kind | text | NOT NULL | — | |
| entry_state | text | NOT NULL | — | |
| emotional_valence | numeric | nullable | — | |
| consent_required | bool | NOT NULL | false | |
| source_asset_id | uuid | nullable | — | |
| provenance | jsonb | NOT NULL | '{}' | |

---

### DOMAIN: tribunal

#### tribunal_sessions
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | text | NOT NULL | — | indexed |
| question | text | NOT NULL | — | |
| participants | text[] | NOT NULL | '{}' | |
| provider | text | nullable | — | |
| response | text | nullable | — | |
| metadata | jsonb | NOT NULL | '{}' | GIN indexed |
| created_at | timestamptz | NOT NULL | now() | |

#### tribunal_events
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| question | text | NOT NULL | — | |
| candidate_answers | jsonb | NOT NULL | '{}' | |
| winning_answer_id | text | nullable | — | indexed |
| verdict_summary | text | nullable | — | |
| triggering_agent | text | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |

#### tribunal_evidence
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| tribunal_event_id | uuid | NOT NULL | — | indexed |
| document_id | uuid | nullable | — | indexed |
| fragment_id | uuid | nullable | — | indexed |
| weight | numeric | NOT NULL | — | |
| comment | text | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |

---

### DOMAIN: corpus_ingestion

#### processing_runs
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| run_id | uuid | NOT NULL | gen_random_uuid() | PK |
| tenant_id | uuid | NOT NULL | — | indexed |
| status | text | NOT NULL | — | indexed |
| model | text | nullable | — | |
| corpus_root | text | nullable | — | |
| documents_count | int4 | NOT NULL | — | |
| chunks_count | int4 | NOT NULL | — | |
| created_by | uuid | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |
| error_count | int4 | NOT NULL | — | |
| duration_seconds | float8 | nullable | — | |
| total_tokens | int4 | NOT NULL | — | |
| summaries_count | int4 | NOT NULL | — | |
| annotations_count | int4 | NOT NULL | — | |

#### documents
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| document_id | uuid | NOT NULL | gen_random_uuid() | PK |
| run_id | uuid | NOT NULL | — | indexed |
| tenant_id | uuid | NOT NULL | — | indexed |
| path | text | NOT NULL | — | |
| filename | text | NOT NULL | — | |
| hash | text | NOT NULL | — | UNIQUE |
| chunk_index | int4 | NOT NULL | — | |
| total_chunks | int4 | NOT NULL | — | |
| file_size_bytes | int4 | nullable | — | |
| content | text | NOT NULL | — | |
| mime_type | text | nullable | — | |
| extracted_metadata | jsonb | NOT NULL | '{}' | |
| provenance | jsonb | NOT NULL | '{}' | GIN indexed |
| created_by | uuid | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |
| source_created_at | timestamptz | nullable | — | |
| temporal_period | text | nullable | — | |
| timeline_folder | text | nullable | — | |

#### embeddings
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| document_id | uuid | NOT NULL | — | indexed |
| model | text | NOT NULL | — | |
| embedding | vector | NOT NULL | — | ivfflat eligible |
| created_at | timestamptz | NOT NULL | now() | |
| run_id | uuid | nullable | — | indexed |

#### knowledge_fragments
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| content | text | NOT NULL | — | |
| content_hash | text | nullable | — | UNIQUE |
| embedding | vector | nullable | — | ivfflat eligible |
| source_file | text | NOT NULL | — | indexed |
| document_type | text | NOT NULL | — | |
| chunk_index | int4 | NOT NULL | — | |
| total_chunks | int4 | NOT NULL | — | |
| char_count | int4 | nullable | — | |
| tags | text[] | nullable | '{}' | |
| created_at | timestamptz | nullable | now() | |
| source_created_at | timestamptz | nullable | — | |
| temporal_period | text | nullable | — | |
| timeline_folder | text | nullable | — | |
| document_id | uuid | nullable | — | indexed |
| source_path | text | nullable | — | indexed |
| ingested_at | timestamptz | nullable | — | |
| file_last_modified | timestamptz | nullable | — | |
| package | text | nullable | — | |
| run_id | uuid | nullable | — | indexed |
| doc_created_at | timestamptz | nullable | — | |
| doc_date_source | text | nullable | — | |

#### summaries
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| summary_id | uuid | NOT NULL | gen_random_uuid() | PK |
| run_id | uuid | NOT NULL | — | indexed |
| document_id | uuid | NOT NULL | — | indexed |
| level | text | NOT NULL | — | |
| content | text | NOT NULL | — | |
| created_at | timestamptz | NOT NULL | now() | |
| model | text | nullable | — | |
| token_count | int4 | nullable | — | |
| processing_time_ms | int4 | nullable | — | |

#### loom_annotations
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| annotation_id | uuid | NOT NULL | gen_random_uuid() | PK |
| run_id | uuid | NOT NULL | — | indexed |
| type | text | NOT NULL | — | |
| content | text | NOT NULL | — | |
| created_at | timestamptz | NOT NULL | now() | |
| related_ids | jsonb | NOT NULL | '{}' | |
| confidence_score | float8 | nullable | — | |

#### concepts
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| concept_id | uuid | NOT NULL | gen_random_uuid() | PK |
| tenant_id | uuid | NOT NULL | — | indexed |
| name | text | NOT NULL | — | |
| canonical | text | NOT NULL | — | |
| created_at | timestamptz | NOT NULL | now() | |

#### document_concepts
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| document_id | uuid | NOT NULL | gen_random_uuid() | PK (composite) |
| concept_id | uuid | NOT NULL | gen_random_uuid() | PK (composite) |
| weight | float4 | NOT NULL | — | |

#### annotation_concepts
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| annotation_id | uuid | NOT NULL | gen_random_uuid() | PK (composite) |
| concept_id | uuid | NOT NULL | gen_random_uuid() | PK (composite) |

#### skill_fragments
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| document_id | uuid | nullable | — | indexed |
| content | text | NOT NULL | — | |
| content_hash | text | nullable | — | indexed |
| embedding | vector | nullable | — | ivfflat eligible |
| source_file | text | nullable | — | indexed |
| document_type | text | nullable | — | |
| skill_name | text | nullable | — | |
| chunk_index | int4 | nullable | — | |
| total_chunks | int4 | nullable | — | |
| char_count | int4 | nullable | — | |
| tags | text[] | nullable | '{}' | |
| created_at | timestamptz | nullable | now() | |

#### skills
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| name | text | NOT NULL | — | UNIQUE |
| description | text | nullable | — | |
| content | text | NOT NULL | — | |
| tags | text[] | nullable | '{}' | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

#### ingestion_safety_events
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| event_type | text | NOT NULL | — | |
| table_name | text | NOT NULL | — | |
| source_file | text | nullable | — | |
| document_type | text | nullable | — | |
| reasons | text[] | NOT NULL | '{}' | |
| affected_rows | int4 | NOT NULL | — | |
| notes | text | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |

---

### DOMAIN: agent_training_governance

#### model_providers
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| provider_id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | — | UNIQUE |
| kind | text | NOT NULL | — | |
| base_url | text | NOT NULL | — | |
| secret_ref | text | nullable | — | |
| local_first | bool | NOT NULL | false | |
| enabled | bool | NOT NULL | false | |
| created_at | timestamptz | NOT NULL | now() | |

#### models
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| model_id | uuid | NOT NULL | gen_random_uuid() | PK |
| provider_id | uuid | NOT NULL | — | indexed |
| slug | text | NOT NULL | — | UNIQUE |
| api_name | text | NOT NULL | — | |
| modality | text | NOT NULL | — | |
| supports_structured | bool | NOT NULL | false | |
| supports_tools | bool | NOT NULL | false | |
| supports_embeddings | bool | NOT NULL | false | |
| context_window | int4 | nullable | — | |
| speed_tier | int2 | NOT NULL | — | |
| cost_tier | int2 | NOT NULL | — | |
| enabled | bool | NOT NULL | false | |
| metadata | jsonb | NOT NULL | '{}' | GIN indexed |
| created_at | timestamptz | NOT NULL | now() | |

#### scenario_sets / scenarios / eval_rubrics
*(trainer eval surface — see full table definitions in 000010_tables.md)*

#### training_runs
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| run_id | uuid | NOT NULL | gen_random_uuid() | PK |
| agent_id | uuid | NOT NULL | — | indexed |
| baseline_version_id | uuid | nullable | — | indexed |
| requested_by | uuid | nullable | — | |
| approver_user_id | uuid | nullable | — | indexed |
| status | text | NOT NULL | — | indexed |
| goal | text | NOT NULL | — | |
| max_cycles | int4 | NOT NULL | — | |
| quality_threshold | numeric | NOT NULL | — | |
| routing_policy | jsonb | NOT NULL | '{}' | |
| started_at | timestamptz | nullable | — | |
| completed_at | timestamptz | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |
| experiment_id | uuid | nullable | — | indexed |
| execution_mode | text | NOT NULL | — | |
| resolved_graph | jsonb | nullable | '{}' | |
| graph_observations | jsonb | nullable | '{}' | |

#### training_steps / eval_results / approvals / deployment_artifacts / trainer_jobs
*(full detail in 000010_tables.md — all RLS-enabled)*

#### trainer_experiments
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | — | UNIQUE |
| title | text | NOT NULL | — | |
| purpose | text | NOT NULL | — | |
| domain | text | nullable | — | |
| embodiment_profile_slug | text | nullable | — | |
| goal | text | nullable | — | |
| target_behaviors | text[] | NOT NULL | '{}' | |
| anti_goals | text[] | NOT NULL | '{}' | |
| study_focus | text | nullable | — | |
| max_cycles | int4 | NOT NULL | — | |
| quality_threshold | numeric | NOT NULL | — | |
| drafting_provider | text | NOT NULL | — | |
| evaluation_provider | text | NOT NULL | — | |
| class | text | NOT NULL | — | |
| packaging_eligible | bool | NOT NULL | false | |
| created_by | text | NOT NULL | — | |
| notes | text | nullable | — | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |
| execution_mode | text | NOT NULL | — | |
| connector_graph | jsonb | nullable | '{}' | |
| skill_graph | jsonb | nullable | '{}' | |
| memory_graph | jsonb | nullable | '{}' | |

---

### DOMAIN: agent_runtime_and_manifest

#### agents
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| agent_id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | — | UNIQUE |
| title | text | NOT NULL | — | |
| domain | text | NOT NULL | — | |
| owner_user_id | uuid | nullable | — | indexed |
| status | text | NOT NULL | — | indexed |
| active_version_id | uuid | nullable | — | indexed |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |
| public_name | text | nullable | — | |
| internal_designation | text | nullable | — | |
| origin_context | text | nullable | — | |
| collaborator_id | uuid | nullable | — | indexed |

#### agent_versions
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| version_id | uuid | NOT NULL | gen_random_uuid() | PK |
| agent_id | uuid | NOT NULL | — | indexed |
| parent_version_id | uuid | nullable | — | indexed |
| source_run_id | uuid | nullable | — | indexed |
| semantic_version | text | NOT NULL | — | |
| canonical_spec | jsonb | NOT NULL | '{}' | GIN indexed |
| compiled_markdown | text | NOT NULL | — | |
| checksum | text | NOT NULL | — | |
| change_summary | text | nullable | — | |
| status | text | NOT NULL | — | indexed |
| created_at | timestamptz | NOT NULL | now() | |

#### agent_memories / agent_skills / agent_relationships / agent_manifests / agent_manifest_entries / agent_code_artifacts
*(all RLS-enabled, fully indexed — see 000010_tables.md for column detail)*

---

### DOMAIN: agent_identity_personhood

#### agent_constitutions
| Column | Type | Notes |
|--------|------|-------|
| constitution_id | uuid PK | |
| agent_id | uuid NOT NULL | |
| version_id | uuid nullable | |
| identity_handle | text NOT NULL | |
| public_name | text NOT NULL | |
| internal_designation | text nullable | |
| immutable_core | jsonb NOT NULL | |
| primary_narrative_anchor | text NOT NULL | |
| role_commitments | jsonb NOT NULL | |
| provenance | jsonb NOT NULL | |
| confidence | numeric NOT NULL | |
| review_status | text (enum domain) NOT NULL | |
| last_affirmed_at | timestamptz nullable | |
| created_at / updated_at | timestamptz | |

#### agent_autobiographies · agent_private_interiors · agent_governance_policies · agent_presentation_profiles · agent_skill_profiles · agent_memory_records · agent_preference_nodes · agent_relationship_edges · agent_context_views
*(all follow same pattern: agent_id FK, version_id nullable, jsonb payload columns, confidence numeric, review_status enum domain, provenance jsonb, created_at/updated_at — RLS enabled)*

---

### DOMAIN: knowledge_assets

#### knowledge_assets
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| title | text | NOT NULL | — | |
| asset_type | text (enum domain) | NOT NULL | — | |
| storage_path | text | NOT NULL | — | |
| raw_text | text | nullable | — | |
| checksum | text | NOT NULL | — | |
| source_label | text | nullable | — | |
| source_uri | text | nullable | — | |
| uploaded_by | uuid | nullable | — | |
| visibility | text (enum domain) | NOT NULL | — | |
| status | text (enum domain) | NOT NULL | — | |
| metadata | jsonb | NOT NULL | '{}' | |
| created_at / updated_at | timestamptz | NOT NULL | now() | |

#### knowledge_asset_chunks · knowledge_tags · knowledge_asset_tags · agent_knowledge_links · knowledge_interpretations
*(all RLS-enabled — chunk has embedding vector column, ivfflat eligible)*

---

### DOMAIN: commerce_gate

#### gate_package_drafts (most complex GATE table)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| buyer_id | uuid nullable | FK → gate_buyers |
| buyer_email | text nullable | |
| company_name | text nullable | |
| use_case_slug | text NOT NULL | |
| tier | text NOT NULL | |
| seats_requested | int4 NOT NULL | |
| backend | text NOT NULL | |
| delivery_surfaces | jsonb NOT NULL | |
| operator_pack_slugs | jsonb NOT NULL | |
| source_bundle_slugs | jsonb NOT NULL | |
| theme_preset_id | text NOT NULL | |
| brand_color | text nullable | |
| logo_asset_path | text nullable | |
| custom_notes | text nullable | |
| wants_native_installer | bool NOT NULL default false | |
| price_snapshot_cents | int4 NOT NULL | |
| config_hash | text NOT NULL | |
| status | text NOT NULL | |
| embodiment_profile_slug | text NOT NULL | |
| buyer_context | jsonb NOT NULL | |
| sidekick_state | jsonb NOT NULL | |
| created_at / updated_at | timestamptz | |

#### gate_orders · gate_order_items · gate_build_jobs · gate_artifacts · gate_support_requests · gate_buyers
*(all RLS-enabled)*

---

### DOMAIN: collaboration

#### collaborators *(universal continuity surface)*
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| collaborator_id | uuid | NOT NULL | gen_random_uuid() | PK |
| collaborator_key | text | NOT NULL | — | UNIQUE |
| display_name | text | NOT NULL | — | |
| collaborator_type | text | NOT NULL | — | |
| entity_class | text | NOT NULL | — | |
| status | text | NOT NULL | — | |
| orientation_variant | text | nullable | — | |
| continuity_level | text | NOT NULL | — | |
| embodiment_profile_slug | text | nullable | — | |
| origin_surface | text | nullable | — | |
| external_provider | text | nullable | — | |
| external_reference | text | nullable | — | |
| auth_user_id | uuid | nullable | — | |
| app_user_id | text | nullable | — | |
| agent_id | uuid | nullable | — | UNIQUE |
| metadata | jsonb | NOT NULL | '{}' | |
| created_at / updated_at | timestamptz | NOT NULL | now() | |

#### collaborative_spaces · collaborative_space_members · collaborative_memory_records
#### collaborator_roles · collaborator_relationships · collaborator_permissions
#### collaborator_onboarding_events · collaborator_embodiment_links
#### embodiment_mutations
*(all RLS-enabled — see 000010_tables.md)*

Current live-dump policy shape for the collaborator family:
- `collaborators` has authenticated read/insert policies and service-role-backed provisioning flows.
- `collaborator_permissions` currently uses authenticated own-row CRUD policies keyed by `collaborator_id`.
- `collaborator_relationships` currently exposes authenticated selects when the source or target collaborator is owned by the current auth user.
- `collaborator_onboarding_events` and `collaborator_embodiment_links` currently expose authenticated own-row insert/select or select policies.
- `collaborator_roles` remains service-role backed in the live dump, which keeps the provisioning path server-only.
- `agent_governed_identity_snapshot` is the security-invoker read model that folds collaborative memory overlays into the agent embodiment profile.

---

### DOMAIN: human_identity

#### human_identity_profiles
*(subject_id + auth_user_id anchors, identity_handle, self_model jsonb, narrative_anchor, role_commitments, boundary_policy, contradiction_notes, confidence, review_status, provenance)*

#### human_cognition_profiles
*(attention_profile, working_memory, reasoning_profile, planning_profile, language_profile, executive_controls, decision_policy — all jsonb)*

#### human_consciousness_profiles
*(present_state, continuity_model, self_observation, agency_model, time_orientation, awareness_model — all jsonb)*

#### human_personality_profiles
*(trait_map, temperament, social_style, communication_style, values_profile, attachments — all jsonb)*

#### human_context_views · human_continuity_snapshots · human_memory_records · human_relationship_edges · human_identity_evidence · human_identity_mutations · human_identity_review_events
*(all subject_id + auth_user_id scoped, RLS-enabled)*

---

### DOMAIN: miscellaneous

#### identity_evidence · identity_evidence_links · identity_contradictions · identity_mutation_proposals · identity_review_events · identity_rollback_events
*(agent-scoped identity governance tables)*

#### ops_workbook_items
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| sheet_name | text NOT NULL | |
| row_key | text NOT NULL | |
| label | text NOT NULL | |
| category / status / priority / phase | text nullable | |
| owner | text NOT NULL | |
| target_start / target_end | date nullable | |
| notes / link_ref | text nullable | |
| meta | jsonb NOT NULL | |
| created_at / updated_at | timestamptz | |

#### ops_workbook_sync_runs
*(triggered_by, source_file, rows_upserted, rows_skipped, errors jsonb, status)*

---

## RLS Status
RLS is enabled across the schema. The collaborator family currently uses a mixed authenticated/service-role model in the live dump, while the rest of the schema largely follows the service-role plus per-table ownership pattern documented below:

```sql
CREATE POLICY "users read own {table}"
ON "{table}" FOR SELECT TO authenticated
USING (auth.uid() = auth_user_id);
```

Tables with `user_id text` (not uuid) use `auth.uid()::text = user_id`.

---

## pgvector Columns (ivfflat eligible — currently commented out)
| Table | Column | Status |
|-------|--------|--------|
| embeddings | embedding | NOT NULL vector |
| knowledge_fragments | embedding | nullable vector |
| skill_fragments | embedding | nullable vector |
| memory_entries | embedding | nullable vector |
| knowledge_asset_chunks | embedding | nullable vector |
| human_memory_records | embedding | nullable vector |

**To activate IVFFlat indexes:** Uncomment lines in `000040_optional_vector_indexes.md`, set correct dimension (e.g. `vector(768)` or `vector(1536)`), and confirm distance metric (`vector_cosine_ops` vs `vector_l2_ops`).

---

## Alignment Verification Query
Run this against your live Supabase instance. Zero rows = fully aligned.

```sql
WITH expected(table_name, column_name) AS (
  VALUES
    ('app_users','id'),('app_users','created_at'),('app_users','auth_user_id'),
    ('app_users','subject_id'),('app_users','display_name'),('app_users','metadata'),
    ('consciousness_profiles','id'),('consciousness_profiles','user_id'),
    ('consciousness_profiles','profile'),('consciousness_profiles','created_at'),
    ('consciousness_profiles','updated_at'),('consciousness_profiles','subject_id'),
    ('consciousness_profiles','auth_user_id'),('consciousness_profiles','snapshot'),
    ('consciousness_profiles','source_manifest'),('consciousness_profiles','confidence'),
    ('bucket_drops','id'),('bucket_drops','user_id'),('bucket_drops','content'),
    ('bucket_drops','raw_text'),('bucket_drops','capture_context'),
    ('bucket_drops','created_at'),('bucket_drops','subject_id'),
    ('bucket_drops','module_key'),('bucket_drops','intensity'),
    ('bucket_drops','plk_resonance_score'),('bucket_drops','specialized_apps'),
    ('bucket_drops','tags'),('bucket_drops','stage'),
    ('bucket_drops','promoted_memory_id'),('bucket_drops','scored_at'),
    ('bucket_drops','promoted_at'),
    ('users','id'),('users','email'),('users','tier'),('users','stripe_customer_id'),
    ('users','stripe_subscription_id'),('users','subscription_status'),
    ('users','billing_period_start'),('users','billy_query_count'),
    ('users','created_at'),('users','updated_at'),('users','is_admin'),('users','grace_until'),
    ('memory_entries','id'),('memory_entries','user_id'),('memory_entries','scope'),
    ('memory_entries','kind'),('memory_entries','content'),('memory_entries','content_hash'),
    ('memory_entries','embedding'),('memory_entries','source'),('memory_entries','tags'),
    ('memory_entries','metadata'),('memory_entries','importance'),('memory_entries','pinned'),
    ('memory_entries','created_at'),('memory_entries','updated_at'),
    ('memory_entries','source_kind'),('memory_entries','entry_state'),
    ('memory_entries','emotional_valence'),('memory_entries','consent_required'),
    ('memory_entries','source_asset_id'),('memory_entries','provenance'),
    ('founder_context','id'),('founder_context','user_id'),('founder_context','plk_snapshot'),
    ('founder_context','mode_preference'),('founder_context','confirmed_adult'),
    ('founder_context','continuity_profile'),('founder_context','cognition_profile'),
    ('founder_context','personality_profile'),('founder_context','memory_profile'),
    ('founder_context','identity_profile'),('founder_context','context_manifest'),
    ('founder_context','consent_policy'),
    ('agents','agent_id'),('agents','slug'),('agents','title'),('agents','domain'),
    ('agents','owner_user_id'),('agents','status'),('agents','collaborator_id'),
    ('collaborators','collaborator_id'),('collaborators','collaborator_key'),
    ('collaborators','display_name'),('collaborators','collaborator_type'),
    ('collaborators','entity_class'),('collaborators','status'),
    ('collaborators','continuity_level'),('collaborators','agent_id'),
    ('gate_package_drafts','id'),('gate_package_drafts','use_case_slug'),
    ('gate_package_drafts','tier'),('gate_package_drafts','embodiment_profile_slug'),
    ('gate_package_drafts','sidekick_state'),('gate_package_drafts','buyer_context'),
    ('knowledge_assets','id'),('knowledge_assets','title'),('knowledge_assets','asset_type'),
    ('knowledge_assets','storage_path'),('knowledge_assets','visibility'),
    ('knowledge_assets','status'),
    ('identity_subjects','subject_id'),('identity_subjects','subject_kind'),
    ('identity_subjects','display_name'),('identity_subjects','canonical_name'),
    ('human_identity_profiles','profile_id'),('human_identity_profiles','subject_id'),
    ('human_identity_profiles','auth_user_id'),('human_identity_profiles','self_model'),
    ('human_cognition_profiles','cognition_profile_id'),('human_cognition_profiles','subject_id'),
    ('human_memory_records','memory_id'),('human_memory_records','subject_id'),
    ('human_memory_records','embedding'),('human_memory_records','salience')
),
actual AS (
  SELECT table_name, column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
)
SELECT e.table_name, e.column_name
FROM expected e
LEFT JOIN actual a USING (table_name, column_name)
WHERE a.column_name IS NULL
ORDER BY 1,2;
```

---

## Key Relationships (Logical, No Enforced FK)
> The migration intentionally omits FK constraints for portability. These are the logical joins:

| Child Column | → Parent Table | Notes |
|---|---|---|
| bucket_drops.user_id | app_users.id | text join |
| bucket_drops.promoted_memory_id | memory_entries.id | uuid |
| consciousness_profiles.user_id | app_users.id | text join |
| agents.owner_user_id | users.id | uuid |
| agents.collaborator_id | collaborators.collaborator_id | uuid |
| agent_versions.agent_id | agents.agent_id | uuid |
| training_runs.agent_id | agents.agent_id | uuid |
| training_steps.run_id | training_runs.run_id | uuid |
| eval_results.run_id | training_runs.run_id | uuid |
| embodiment_mutations.agent_id | agents.agent_id | uuid |
| agent_knowledge_links.agent_id | agents.agent_id | uuid |
| agent_knowledge_links.asset_id | knowledge_assets.id | uuid |
| gate_orders.buyer_id | gate_buyers.id | uuid |
| gate_orders.package_draft_id | gate_package_drafts.id | uuid |
| gate_build_jobs.order_id | gate_orders.id | uuid |
| gate_artifacts.build_job_id | gate_build_jobs.id | uuid |
| identity_subjects.auth_user_id | auth.users.id | uuid (auth schema) |
| human_identity_profiles.subject_id | identity_subjects.subject_id | uuid |
| collaborators.agent_id | agents.agent_id | uuid |
| collaborative_space_members.agent_id | agents.agent_id | uuid |
| identity_mutation_proposals.agent_id | agents.agent_id | uuid |
