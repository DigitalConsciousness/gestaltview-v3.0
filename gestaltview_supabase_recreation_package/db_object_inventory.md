# GestaltView Supabase DB Object Inventory

Generated: 2026-06-16T12:34:22.428657+00:00

## Counts

- extension: 36
- function: 66
- index: 288
- policy: 108
- table: 154
- trigger: 40
- type: 42
- view: 11

## Objects

| Type | Object | Schema | Migration | Source |
|---|---|---|---|---|
| table | `session_rate_limits` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| table | `users` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| function | `update_updated_at()` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| trigger | `users_updated_at ON users` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| trigger | `session_rate_limits_updated_at ON session_rate_limits` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| policy | `"Users can read own record" ON users` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| policy | `"Service role full access on users" ON users` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| policy | `"Service role full access on session_rate_limits" ON session_rate_limits` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| index | `idx_session_rate_limits_window ON session_rate_limits` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| index | `idx_users_email ON users` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| index | `idx_users_stripe_customer ON users` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| index | `idx_users_tier ON users` | `public` | `20260301000100_rate_limits_and_users.sql` | `001_rate_limits_and_users.sql` |
| function | `public.handle_new_user()` | `public` | `20260301000400_user_trigger.sql` | `004_user_trigger.sql` |
| trigger | `on_auth_user_created ON auth.users` | `auth` | `20260301000400_user_trigger.sql` | `004_user_trigger.sql` |
| extension | `pgcrypto` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| extension | `vector` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `app_users` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `consciousness_profiles` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `bucket_drops` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `musical_dna_analyses` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `tribunal_sessions` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `billy_sessions` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `processing_runs` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `documents` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `embeddings` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `knowledge_fragments` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| view | `knowledge_stats` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| function | `match_knowledge_fragments( query_embedding vector(1536)` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| function | `search_knowledge_fragments( query_text text, match_count int default 8, filter_type text default null )` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| function | `matchknowledgefragments( queryembedding vector(1536)` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| function | `searchknowledgefragments( querytext text, matchcount int default 8, filtertype text default null )` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| policy | `"Public read knowledge fragments" ON knowledge_fragments` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| policy | `"Service role full access documents" ON documents` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| policy | `"Service role full access embeddings" ON embeddings` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `bucket_drops_user_created_idx ON bucket_drops` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `musical_dna_user_created_idx ON musical_dna_analyses` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `tribunal_user_created_idx ON tribunal_sessions` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `billy_sessions_user_created_idx ON billy_sessions` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `documents_tenant_path_idx ON documents` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `documents_hash_idx ON documents` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `embeddings_document_idx ON embeddings` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `embeddings_hnsw_idx ON embeddings` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `knowledge_fragments_content_fts ON knowledge_fragments` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `knowledge_fragments_doc_type_idx ON knowledge_fragments` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `knowledge_fragments_tags_idx ON knowledge_fragments` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| index | `knowledge_fragments_embedding_idx ON knowledge_fragments` | `public` | `20260311162044_new-migration.sql` | `20260311162044_new-migration.sql` |
| table | `tribunal_events` | `public` | `20260319162400_tribunal-tables.sql` | `20260319162400_tribunal-tables.sql` |
| table | `tribunal_evidence` | `public` | `20260319162400_tribunal-tables.sql` | `20260319162400_tribunal-tables.sql` |
| policy | `"Public read tribunal events" ON tribunal_events` | `public` | `20260319162400_tribunal-tables.sql` | `20260319162400_tribunal-tables.sql` |
| policy | `"Public read tribunal evidence" ON tribunal_evidence` | `public` | `20260319162400_tribunal-tables.sql` | `20260319162400_tribunal-tables.sql` |
| policy | `"Service role full access tribunal events" ON tribunal_events` | `public` | `20260319162400_tribunal-tables.sql` | `20260319162400_tribunal-tables.sql` |
| policy | `"Service role full access tribunal evidence" ON tribunal_evidence` | `public` | `20260319162400_tribunal-tables.sql` | `20260319162400_tribunal-tables.sql` |
| index | `tribunal_events_created_idx ON tribunal_events` | `public` | `20260319162400_tribunal-tables.sql` | `20260319162400_tribunal-tables.sql` |
| index | `tribunal_evidence_event_idx ON tribunal_evidence` | `public` | `20260319162400_tribunal-tables.sql` | `20260319162400_tribunal-tables.sql` |
| table | `orders` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `order_notes` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `uploads` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `deliverables` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `summaries` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `loom_annotations` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `document_concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `annotation_concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Magic token read orders" ON orders` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access orders" ON orders` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access order_notes" ON order_notes` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access uploads" ON uploads` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Public read deliverables" ON deliverables` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access deliverables" ON deliverables` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Public read summaries" ON summaries` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access summaries" ON summaries` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Public read loom_annotations" ON loom_annotations` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access loom_annotations" ON loom_annotations` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Public read concepts" ON concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access concepts" ON concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Public read document_concepts" ON document_concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access document_concepts" ON document_concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Public read annotation_concepts" ON annotation_concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| policy | `"Service role full access annotation_concepts" ON annotation_concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `orders_customer_email_idx ON orders` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `orders_shopify_order_id_idx ON orders` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `orders_magic_token_idx ON orders` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `orders_status_created_idx ON orders` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `order_notes_order_idx ON order_notes` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `uploads_order_idx ON uploads` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `deliverables_order_idx ON deliverables` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `summaries_document_idx ON summaries` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `summaries_run_level_idx ON summaries` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `loom_annotations_run_idx ON loom_annotations` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `loom_annotations_type_idx ON loom_annotations` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `concepts_tenant_canonical_idx ON concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `document_concepts_concept_idx ON document_concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `annotation_concepts_concept_idx ON annotation_concepts` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| index | `embeddings_run_idx ON embeddings` | `public` | `20260319164400_orders-loom-concepts.sql` | `20260319164400_orders-loom-concepts.sql` |
| table | `founder_context` | `public` | `20260321100000_founder-context.sql` | `20260321100000_founder-context.sql` |
| policy | `"Service role full access founder_context" ON founder_context` | `public` | `20260321100000_founder-context.sql` | `20260321100000_founder-context.sql` |
| index | `founder_context_last_session_idx ON founder_context` | `public` | `20260321100000_founder-context.sql` | `20260321100000_founder-context.sql` |
| function | `has_valid_subscription_access(p_user_id UUID)` | `public` | `20260321104200_grace_period.sql` | `20260321104200_grace_period.sql` |
| index | `idx_users_grace_until ON users` | `public` | `20260321104200_grace_period.sql` | `20260321104200_grace_period.sql` |
| extension | `vector` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| extension | `pgcrypto` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| table | `knowledge_fragments` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| function | `match_knowledge_fragments( query_embedding vector(768)` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| function | `search_knowledge_fragments( query_text TEXT, match_count INT DEFAULT 8, filter_type TEXT DEFAULT NULL )` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| policy | `"Public read knowledge fragments" ON knowledge_fragments` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| policy | `"Service role full access knowledge_fragments" ON knowledge_fragments` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| index | `idx_knowledge_fragments_embedding ON knowledge_fragments` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| index | `knowledge_fragments_content_fts ON knowledge_fragments` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| index | `knowledge_fragments_doctype_idx ON knowledge_fragments` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| index | `knowledge_fragments_tags_idx ON knowledge_fragments` | `public` | `20260321104300_fix_embedding_dims_768.sql` | `20260321104300_fix_embedding_dims_768.sql` |
| function | `match_knowledge_fragments( query_embedding vector(1536)` | `public` | `20260324010700_add_filter_package_to_rpcs.sql` | `20260324010700_add_filter_package_to_rpcs.sql` |
| function | `search_knowledge_fragments( query_text text, match_count int default 8, filter_type text default null, filter_package text default null )` | `public` | `20260324010700_add_filter_package_to_rpcs.sql` | `20260324010700_add_filter_package_to_rpcs.sql` |
| function | `matchknowledgefragments( queryembedding vector(1536)` | `public` | `20260324010700_add_filter_package_to_rpcs.sql` | `20260324010700_add_filter_package_to_rpcs.sql` |
| function | `searchknowledgefragments( querytext text, matchcount int default 8, filtertype text default null, filterpackage text default null )` | `public` | `20260324010700_add_filter_package_to_rpcs.sql` | `20260324010700_add_filter_package_to_rpcs.sql` |
| function | `match_knowledge_fragments( query_embedding vector(1536)` | `public` | `20260324010800_fix_rpc_conflict.sql` | `fix_rpc_conflict.sql` |
| function | `search_knowledge_fragments( query_text text, match_count int default 12, filter_type text default null, filter_package text default null )` | `public` | `20260324010800_fix_rpc_conflict.sql` | `fix_rpc_conflict.sql` |
| extension | `pgcrypto` | `public` | `20260325000000_create_skill_tables.sql` | `20260325000000_create_skill_tables.sql` |
| extension | `vector` | `public` | `20260325000000_create_skill_tables.sql` | `20260325000000_create_skill_tables.sql` |
| table | `public.skills` | `public` | `20260325000000_create_skill_tables.sql` | `20260325000000_create_skill_tables.sql` |
| table | `public.skill_fragments` | `public` | `20260325000000_create_skill_tables.sql` | `20260325000000_create_skill_tables.sql` |
| index | `skill_fragments_document_id_idx ON public.skill_fragments` | `public` | `20260325000000_create_skill_tables.sql` | `20260325000000_create_skill_tables.sql` |
| index | `skill_fragments_tags_idx ON public.skill_fragments` | `public` | `20260325000000_create_skill_tables.sql` | `20260325000000_create_skill_tables.sql` |
| index | `skills_name_idx ON public.skills` | `public` | `20260325000000_create_skill_tables.sql` | `20260325000000_create_skill_tables.sql` |
| extension | `vector` | `public` | `20260327094500_align_fragment_embeddings_to_768.sql` | `20260327094500_align_fragment_embeddings_to_768.sql` |
| function | `match_knowledge_fragments( query_embedding vector(768)` | `public` | `20260327094500_align_fragment_embeddings_to_768.sql` | `20260327094500_align_fragment_embeddings_to_768.sql` |
| function | `match_skill_fragments( query_embedding vector(768)` | `public` | `20260327094500_align_fragment_embeddings_to_768.sql` | `20260327094500_align_fragment_embeddings_to_768.sql` |
| function | `matchknowledgefragments( queryembedding vector(768)` | `public` | `20260327094500_align_fragment_embeddings_to_768.sql` | `20260327094500_align_fragment_embeddings_to_768.sql` |
| index | `knowledge_fragments_embedding_idx ON knowledge_fragments` | `public` | `20260327094500_align_fragment_embeddings_to_768.sql` | `20260327094500_align_fragment_embeddings_to_768.sql` |
| index | `skill_fragments_embedding_idx ON skill_fragments` | `public` | `20260327094500_align_fragment_embeddings_to_768.sql` | `20260327094500_align_fragment_embeddings_to_768.sql` |
| index | `knowledge_fragments_embedding_idx ON knowledge_fragments` | `public` | `20260327094600_fix_vector_dims.sql` | `20260327_fix_vector_dims.sql` |
| index | `skill_fragments_embedding_idx ON skill_fragments` | `public` | `20260327094600_fix_vector_dims.sql` | `20260327_fix_vector_dims.sql` |
| index | `embeddings_hnsw_idx ON embeddings` | `public` | `20260327094600_fix_vector_dims.sql` | `20260327_fix_vector_dims.sql` |
| function | `public.claim_trainer_job(_worker_id text default null, _lease_seconds integer default 90)` | `public` | `20260330115505_trainer_security_hardening.sql` | `20260330115505_trainer_security_hardening.sql` |
| extension | `pgcrypto` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `model_providers` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `models` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `agents` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `agent_versions` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `scenario_sets` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `scenarios` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `eval_rubrics` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `training_runs` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `training_steps` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `eval_results` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `approvals` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `deployment_artifacts` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| table | `trainer_jobs` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| view | `public.trainer_run_summary` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| function | `claim_trainer_job(_worker_id text default null, _lease_seconds integer default 90)` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| index | `trainer_jobs_status_created_idx ON trainer_jobs` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| index | `agents_slug_idx ON agents` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| index | `agent_versions_agent_created_idx ON agent_versions` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| index | `training_runs_agent_status_idx ON training_runs` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| index | `training_steps_run_cycle_stage_idx ON training_steps` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| index | `eval_results_run_scenario_idx ON eval_results` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| index | `scenarios_set_difficulty_idx ON scenarios` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| index | `approvals_run_idx ON approvals` | `public` | `20260330120000_trainer_core.sql` | `20260330120000_trainer_core.sql` |
| function | `public.is_founder_admin_email(candidate text)` | `public` | `20260330170000_founder_admin_bootstrap.sql` | `20260330170000_founder_admin_bootstrap.sql` |
| function | `public.handle_new_user()` | `public` | `20260330170000_founder_admin_bootstrap.sql` | `20260330170000_founder_admin_bootstrap.sql` |
| trigger | `on_auth_user_created ON auth.users` | `auth` | `20260330170000_founder_admin_bootstrap.sql` | `20260330170000_founder_admin_bootstrap.sql` |
| extension | `vector` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| extension | `pg_trgm` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| table | `memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| function | `match_memory_entries( query_embedding vector(768)` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| function | `search_memory_entries( query_text text, match_count integer default 4, filter_user_id text default null, filter_scope text default null, filter_kind text default null )` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| policy | `"service_role_all_memory_entries" ON public.memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| index | `memory_entries_user_id_idx ON memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| index | `memory_entries_scope_idx ON memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| index | `memory_entries_kind_idx ON memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| index | `memory_entries_pinned_idx ON memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| index | `memory_entries_embedding_idx ON memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| index | `memory_entries_tags_idx ON memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| index | `memory_entries_content_fts_idx ON memory_entries` | `public` | `20260330193000_persistent_memory_entries.sql` | `20260330193000_persistent_memory_entries.sql` |
| function | `public.trainer_list_knowledge_sources( limit_count integer default 18, type_filter text[] default null )` | `public` | `20260331110000_trainer_study_sources_rpc.sql` | `20260331110000_trainer_study_sources_rpc.sql` |
| function | `trainer_search_study_sources( query_text text, query_embedding vector(768)` | `public` | `20260331110001_vector_sim_source.sql` | `vector_sim_source.sql` |
| extension | `pgcrypto` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| table | `buyers` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| table | `package_drafts` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| table | `orders` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| table | `order_items` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| table | `build_jobs` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| table | `artifacts` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| table | `support_requests` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| function | `set_updated_at_timestamp()` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| trigger | `trg_package_drafts_set_updated_at ON package_drafts` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| trigger | `trg_orders_set_updated_at ON orders` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_package_drafts_buyer_id ON package_drafts` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_package_drafts_status ON package_drafts` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_package_drafts_config_hash ON package_drafts` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_orders_buyer_id ON orders` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_orders_package_draft_id ON orders` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_orders_order_status ON orders` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_build_jobs_order_id ON build_jobs` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_build_jobs_status ON build_jobs` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_artifacts_build_job_id ON artifacts` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_support_requests_order_id ON support_requests` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_support_requests_package_draft_id ON support_requests` | `public` | `20260406171500_create_gate_package_builder_tables.sql` | `20260406171500_create_gate_package_builder_tables.sql` |
| index | `idx_package_drafts_buyer_email ON package_drafts` | `public` | `20260406193500_add_gate_draft_contact_fields.sql` | `20260406193500_add_gate_draft_contact_fields.sql` |
| index | `orders_stripe_checkout_session_id_idx ON public.orders` | `public` | `20260407120000_extend_orders_for_gate_checkout.sql` | `20260407120000_extend_orders_for_gate_checkout.sql` |
| index | `orders_buyer_id_idx ON public.orders` | `public` | `20260407120000_extend_orders_for_gate_checkout.sql` | `20260407120000_extend_orders_for_gate_checkout.sql` |
| index | `orders_package_draft_id_idx ON public.orders` | `public` | `20260407120000_extend_orders_for_gate_checkout.sql` | `20260407120000_extend_orders_for_gate_checkout.sql` |
| index | `orders_payment_status_idx ON public.orders` | `public` | `20260407120000_extend_orders_for_gate_checkout.sql` | `20260407120000_extend_orders_for_gate_checkout.sql` |
| extension | `pgcrypto` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| table | `public.gate_buyers` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| table | `public.gate_package_drafts` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| table | `public.gate_orders` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| table | `public.gate_order_items` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| table | `public.gate_build_jobs` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| table | `public.gate_artifacts` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| table | `public.gate_support_requests` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| function | `public.set_updated_at_timestamp()` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| trigger | `trg_gate_package_drafts_set_updated_at ON public.gate_package_drafts` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| trigger | `trg_gate_orders_set_updated_at ON public.gate_orders` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_package_drafts_buyer_id_idx ON public.gate_package_drafts` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_package_drafts_buyer_email_idx ON public.gate_package_drafts` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_package_drafts_status_idx ON public.gate_package_drafts` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_package_drafts_config_hash_idx ON public.gate_package_drafts` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_orders_buyer_id_idx ON public.gate_orders` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_orders_package_draft_id_idx ON public.gate_orders` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_orders_payment_status_idx ON public.gate_orders` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_orders_order_status_idx ON public.gate_orders` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_build_jobs_order_id_idx ON public.gate_build_jobs` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_build_jobs_status_idx ON public.gate_build_jobs` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_artifacts_build_job_id_idx ON public.gate_artifacts` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_support_requests_order_id_idx ON public.gate_support_requests` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_support_requests_package_draft_id_idx ON public.gate_support_requests` | `public` | `20260408113000_isolate_gate_persistence.sql` | `20260408113000_isolate_gate_persistence.sql` |
| index | `gate_artifacts_download_token_idx ON public.gate_artifacts` | `public` | `20260408143000_gate_artifact_download_keys.sql` | `20260408143000_gate_artifact_download_keys.sql` |
| extension | `pgcrypto` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| extension | `vector` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.knowledge_assets` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.knowledge_asset_chunks` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.knowledge_tags` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.knowledge_asset_tags` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.agent_knowledge_links` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.knowledge_interpretations` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.embodiment_mutations` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.agent_memories` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.agent_skills` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.agent_relationships` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.agent_manifests` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.agent_manifest_entries` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| table | `public.agent_code_artifacts` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| view | `public.active_agent_manifests` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| view | `public.manifest_file_pull` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| view | `public.approved_library_assets_by_agent` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| view | `public.pending_embodiment_mutations` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| function | `public.set_agent_personhood_updated_at()` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| trigger | `knowledge_assets_set_updated_at ON public.knowledge_assets` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| trigger | `agent_skills_set_updated_at ON public.agent_skills` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| trigger | `agent_code_artifacts_set_updated_at ON public.agent_code_artifacts` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_assets_status_created_idx ON public.knowledge_assets` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_assets_visibility_status_idx ON public.knowledge_assets` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_assets_checksum_idx ON public.knowledge_assets` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_asset_chunks_asset_idx ON public.knowledge_asset_chunks` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_asset_chunks_embedding_idx ON public.knowledge_asset_chunks` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_asset_chunks_content_fts_idx ON public.knowledge_asset_chunks` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_asset_tags_tag_idx ON public.knowledge_asset_tags` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_knowledge_links_agent_scope_idx ON public.agent_knowledge_links` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_knowledge_links_asset_idx ON public.agent_knowledge_links` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_interpretations_asset_idx ON public.knowledge_interpretations` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `knowledge_interpretations_agent_idx ON public.knowledge_interpretations` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `embodiment_mutations_agent_status_idx ON public.embodiment_mutations` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `embodiment_mutations_source_asset_idx ON public.embodiment_mutations` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_memories_agent_type_idx ON public.agent_memories` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_memories_source_asset_idx ON public.agent_memories` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_skills_agent_idx ON public.agent_skills` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_skills_evidence_asset_idx ON public.agent_skills` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_relationships_agent_idx ON public.agent_relationships` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_relationships_related_agent_idx ON public.agent_relationships` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_manifests_agent_status_created_idx ON public.agent_manifests` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_manifests_one_active_per_agent_idx ON public.agent_manifests` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_manifest_entries_manifest_idx ON public.agent_manifest_entries` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_manifest_entries_source_idx ON public.agent_manifest_entries` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_code_artifacts_agent_review_idx ON public.agent_code_artifacts` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| index | `agent_code_artifacts_manifest_idx ON public.agent_code_artifacts` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.knowledge_asset_type` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.knowledge_asset_visibility` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.knowledge_asset_status` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_knowledge_link_type` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_knowledge_link_scope` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.knowledge_classification` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.embodiment_mutation_type` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.embodiment_mutation_risk_level` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.embodiment_mutation_status` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_memory_type` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_memory_retention_policy` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_relationship_type` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_manifest_status` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_manifest_entry_type` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_code_generation_mode` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| type | `public.agent_code_review_status` | `public` | `20260410190000_agent_personhood_framework.sql` | `20260410190000_agent_personhood_framework.sql` |
| policy | `"service_role full access %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated read %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"service_role full access app_users" ON public.app_users` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated manage own app_users" ON public.app_users` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"service_role full access users" ON public.users` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated read own users" ON public.users` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated update own users" ON public.users` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"service_role full access founder_context" ON public.founder_context` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated manage own founder_context" ON public.founder_context` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"service_role full access %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated manage own %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"service_role full access %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated read %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"service_role full access %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated read %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"service_role full access %I" ON public.` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated read own gate_orders" ON public.gate_orders` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| policy | `"authenticated read own gate_package_drafts" ON public.gate_package_drafts` | `public` | `20260410200000_resolve_legacy_tables_rls.sql` | `20260410_200000_resolve_legacy_tables_rls.sql` |
| extension | `pgcrypto` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| table | `public.ops_workbook_items` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| table | `public.ops_workbook_sync_runs` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| table | `public.trainer_experiments` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| table | `public.trainer_experiment_sources` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| table | `public.trainer_review_decisions` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| table | `public.trainer_policy_flags` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| table | `public.trainer_packaging_candidates` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| function | `public.set_workbook_governance_updated_at()` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| trigger | `ops_workbook_items_set_updated_at ON public.ops_workbook_items` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| trigger | `trainer_experiments_set_updated_at ON public.trainer_experiments` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| trigger | `trainer_packaging_candidates_set_updated_at ON public.trainer_packaging_candidates` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `ops_workbook_items_sheet_status_idx ON public.ops_workbook_items` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `ops_workbook_items_sheet_updated_idx ON public.ops_workbook_items` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `ops_workbook_sync_runs_created_idx ON public.ops_workbook_sync_runs` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `trainer_experiments_class_updated_idx ON public.trainer_experiments` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `trainer_experiment_sources_experiment_idx ON public.trainer_experiment_sources` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `trainer_review_decisions_experiment_idx ON public.trainer_review_decisions` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `trainer_policy_flags_experiment_resolved_idx ON public.trainer_policy_flags` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `trainer_packaging_candidates_status_idx ON public.trainer_packaging_candidates` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| index | `training_runs_experiment_created_idx ON public.training_runs` | `public` | `20260410213000_workbook_and_experiment_governance.sql` | `20260410213000_workbook_and_experiment_governance.sql` |
| table | `public.agent_constitutions` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_autobiographies` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_private_interiors` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_governance_policies` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_presentation_profiles` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_skill_profiles` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_memory_records` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_preference_nodes` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_relationship_edges` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.collaborative_spaces` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.collaborative_space_members` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.collaborative_memory_records` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.identity_evidence` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.identity_evidence_links` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.identity_contradictions` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.identity_mutation_proposals` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.identity_review_events` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.identity_rollback_events` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| table | `public.agent_context_views` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| view | `public.pending_identity_reviews` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| view | `public.agent_governed_identity_snapshot` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agents_owner_status_idx ON public.agents` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_versions_agent_status_created_idx ON public.agent_versions` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_constitutions_agent_idx ON public.agent_constitutions` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_constitutions_current_idx ON public.agent_constitutions` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_autobiographies_agent_idx ON public.agent_autobiographies` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_autobiographies_current_idx ON public.agent_autobiographies` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_private_interiors_agent_idx ON public.agent_private_interiors` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_private_interiors_current_idx ON public.agent_private_interiors` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_governance_policies_agent_idx ON public.agent_governance_policies` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_governance_policies_current_idx ON public.agent_governance_policies` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_presentation_profiles_agent_idx ON public.agent_presentation_profiles` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_presentation_profiles_current_idx ON public.agent_presentation_profiles` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_skill_profiles_agent_idx ON public.agent_skill_profiles` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_memory_records_agent_kind_idx ON public.agent_memory_records` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_memory_records_teamspace_idx ON public.agent_memory_records` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_preference_nodes_agent_kind_idx ON public.agent_preference_nodes` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_relationship_edges_agent_idx ON public.agent_relationship_edges` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `collaborative_space_members_agent_idx ON public.collaborative_space_members` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `collaborative_memory_records_space_idx ON public.collaborative_memory_records` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `identity_evidence_agent_observed_idx ON public.identity_evidence` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `identity_evidence_links_target_idx ON public.identity_evidence_links` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `identity_contradictions_agent_status_idx ON public.identity_contradictions` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `identity_mutation_proposals_agent_status_idx ON public.identity_mutation_proposals` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `identity_mutation_proposals_review_queue_idx ON public.identity_mutation_proposals` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `identity_review_events_mutation_idx ON public.identity_review_events` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| index | `agent_context_views_agent_scope_idx ON public.agent_context_views` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.mutation_class` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.review_status` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.owner_scope` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.evidence_source_type` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.memory_kind` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.preference_kind` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.archive_policy` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.identity_mutation_type` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.identity_mutation_status` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.identity_mutation_risk_level` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.identity_review_decision` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.collaborative_space_role` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| type | `public.context_view_scope` | `public` | `20260411110000_integrate_agent_identity_governance.sql` | `20260411110000_integrate_agent_identity_governance.sql` |
| extension | `pgcrypto` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| extension | `pg_trgm` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| table | `public.trainer_workers` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| table | `public.trainer_job_events` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| view | `public.trainer_queue_health_v` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| function | `public.claim_trainer_job( _worker_id text default null, _lease_seconds integer default 90 )` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| function | `public.heartbeat_trainer_worker( _worker_id text, _job_id uuid default null )` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| function | `public.repair_stale_trainer_jobs()` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| function | `public.trainer_queue_health()` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| function | `public.trainer_search_study_sources( query_text text, limit_count integer default 24 )` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| index | `trainer_jobs_status_retry_created_idx ON public.trainer_jobs` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| index | `trainer_jobs_run_idx ON public.trainer_jobs` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| index | `trainer_jobs_lease_expires_idx ON public.trainer_jobs` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| index | `trainer_workers_status_heartbeat_idx ON public.trainer_workers` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| index | `trainer_job_events_run_created_idx ON public.trainer_job_events` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| index | `trainer_job_events_job_created_idx ON public.trainer_job_events` | `public` | `20260412093000_trainer_control_plane_stabilization.sql` | `20260412093000_trainer_control_plane_stabilization.sql` |
| extension | `pg_trgm` | `public` | `20260412101500_fix_trgm_search_path_for_trainer_search.sql` | `20260412101500_fix_trgm_search_path_for_trainer_search.sql` |
| function | `public.trainer_search_study_sources( query_text text, limit_count integer default 24 )` | `public` | `20260412101500_fix_trgm_search_path_for_trainer_search.sql` | `20260412101500_fix_trgm_search_path_for_trainer_search.sql` |
| index | `documents_temporal_period_idx ON public.documents` | `public` | `20260413120000_add_temporal_metadata_to_corpus_tables.sql` | `20260413120000_add_temporal_metadata_to_corpus_tables.sql` |
| index | `documents_source_created_at_idx ON public.documents` | `public` | `20260413120000_add_temporal_metadata_to_corpus_tables.sql` | `20260413120000_add_temporal_metadata_to_corpus_tables.sql` |
| index | `knowledge_fragments_temporal_period_idx ON public.knowledge_fragments` | `public` | `20260413120000_add_temporal_metadata_to_corpus_tables.sql` | `20260413120000_add_temporal_metadata_to_corpus_tables.sql` |
| index | `knowledge_fragments_source_created_at_idx ON public.knowledge_fragments` | `public` | `20260413120000_add_temporal_metadata_to_corpus_tables.sql` | `20260413120000_add_temporal_metadata_to_corpus_tables.sql` |
| table | `public.collaborators` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| table | `public.collaborator_roles` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| table | `public.collaborator_relationships` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| table | `public.collaborator_permissions` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| table | `public.collaborator_onboarding_events` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| table | `public.collaborator_embodiment_links` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| function | `public.set_updated_at()` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| trigger | `trg_collaborators_updated_at ON public.collaborators` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| trigger | `trg_collaborator_roles_updated_at ON public.collaborator_roles` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| trigger | `trg_collaborator_relationships_updated_at ON public.collaborator_relationships` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| trigger | `trg_collaborator_permissions_updated_at ON public.collaborator_permissions` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| trigger | `trg_collaborator_embodiment_links_updated_at ON public.collaborator_embodiment_links` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborator_roles_one_primary ON public.collaborator_roles` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborator_embodiment_links_one_primary ON public.collaborator_embodiment_links` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_agents_collaborator_id_unique ON public.agents` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborators_auth_user_id ON public.collaborators` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborators_app_user_id ON public.collaborators` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborators_agent_id ON public.collaborators` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborator_roles_collaborator_id ON public.collaborator_roles` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborator_relationships_source ON public.collaborator_relationships` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborator_relationships_target ON public.collaborator_relationships` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborator_permissions_collaborator_id ON public.collaborator_permissions` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborator_onboarding_events_collaborator_id ON public.collaborator_onboarding_events` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| index | `idx_collaborator_embodiment_links_collaborator_id ON public.collaborator_embodiment_links` | `public` | `20260413190000_add_collaborator_system.sql` | `20260413190000_add_collaborator_system.sql` |
| extension | `pg_trgm` | `public` | `20260419090700_runtime_alignment_carryover.sql` | `20260419090700_runtime_alignment_carryover.sql` |
| table | `public.ingestion_safety_events` | `public` | `20260419090700_runtime_alignment_carryover.sql` | `20260419090700_runtime_alignment_carryover.sql` |
| function | `public.trainer_search_study_sources( query_text text, limit_count integer default 24 )` | `public` | `20260419090700_runtime_alignment_carryover.sql` | `20260419090700_runtime_alignment_carryover.sql` |
| policy | `"Service role full access ingestion_safety_events" ON public.ingestion_safety_events` | `public` | `20260419090700_runtime_alignment_carryover.sql` | `20260419090700_runtime_alignment_carryover.sql` |
| index | `ingestion_safety_events_created_at_idx ON public.ingestion_safety_events` | `public` | `20260419090700_runtime_alignment_carryover.sql` | `20260419090700_runtime_alignment_carryover.sql` |
| index | `ingestion_safety_events_source_file_idx ON public.ingestion_safety_events` | `public` | `20260419090700_runtime_alignment_carryover.sql` | `20260419090700_runtime_alignment_carryover.sql` |
| extension | `pgcrypto` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| extension | `vector` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| extension | `pg_trgm` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| function | `public.touch_updated_at()` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| function | `public.try_cast_uuid(input_text text)` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| policy | `"service_role full access %I" ON public.` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| policy | `"authenticated manage own %I" ON public.` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| policy | `"authenticated manage own %I" ON public.` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `identity_subjects_kind_updated_idx ON public.identity_subjects` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `identity_subjects_auth_user_idx ON public.identity_subjects` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `identity_subjects_app_user_idx ON public.identity_subjects` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `identity_subjects_agent_idx ON public.identity_subjects` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_memory_records_subject_created_idx ON public.human_memory_records` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_memory_records_auth_user_idx ON public.human_memory_records` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_memory_records_kind_idx ON public.human_memory_records` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_memory_records_tags_idx ON public.human_memory_records` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_memory_records_embedding_idx ON public.human_memory_records` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_memory_records_content_fts_idx ON public.human_memory_records` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_identity_evidence_subject_idx ON public.human_identity_evidence` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_identity_evidence_auth_user_idx ON public.human_identity_evidence` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_identity_mutations_subject_idx ON public.human_identity_mutations` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_identity_mutations_status_idx ON public.human_identity_mutations` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `context_injection_rules_subject_idx ON public.context_injection_rules` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `context_injection_packets_subject_idx ON public.context_injection_packets` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `context_injection_packets_kind_idx ON public.context_injection_packets` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| index | `human_context_views_subject_idx ON public.human_context_views` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.mutation_class` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.review_status` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.archive_policy` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.identity_mutation_type` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.identity_mutation_status` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.identity_mutation_risk_level` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.identity_review_decision` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.identity_subject_kind` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.context_packet_kind` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| type | `public.context_surface_kind` | `public` | `20260420150000_human_continuity_schema.sql` | `20260420150000_human_continuity_schema.sql` |
| extension | `pgcrypto` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| table | `public.trainer_connectors` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| table | `public.trainer_skills` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| table | `public.trainer_memory_bindings` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| view | `public.trainer_memory_surfaces` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| index | `trainer_connectors_kind_active_idx ON public.trainer_connectors` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| index | `trainer_skills_category_updated_idx ON public.trainer_skills` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| index | `trainer_memory_bindings_experiment_idx ON public.trainer_memory_bindings` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| index | `trainer_experiments_execution_mode_idx ON public.trainer_experiments` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| index | `training_runs_execution_mode_idx ON public.training_runs` | `public` | `20260427100000_trainer_hyperagent_integration.sql` | `20260427100000_trainer_hyperagent_integration.sql` |
| index | `agents_updated_at_idx ON public.agents` | `public` | `20260428000000_trainer_list_indexes.sql` | `20260428000000_trainer_list_indexes.sql` |
| index | `training_runs_created_at_idx ON public.training_runs` | `public` | `20260428000000_trainer_list_indexes.sql` | `20260428000000_trainer_list_indexes.sql` |
| index | `scenario_sets_created_at_idx ON public.scenario_sets` | `public` | `20260428000000_trainer_list_indexes.sql` | `20260428000000_trainer_list_indexes.sql` |
| index | `trainer_jobs_run_created_idx ON public.trainer_jobs` | `public` | `20260428000000_trainer_list_indexes.sql` | `20260428000000_trainer_list_indexes.sql` |
| index | `agent_versions_source_run_created_idx ON public.agent_versions` | `public` | `20260428000000_trainer_list_indexes.sql` | `20260428000000_trainer_list_indexes.sql` |
| extension | `pgcrypto` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| table | `public.gestaltview_modules` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| table | `public.gestaltview_module_keys` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| table | `public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| function | `public.touch_updated_at()` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| function | `public.gestaltview_upsert_module_profile( p_subject_id uuid, p_auth_user_id uuid, p_module_key text, p_payload jsonb, p_source_notes text[] default '{}'::text[], p_merge_strategy text default 'merge', p_visibility public.gestaltview_module_profile_visibility default 'private' )` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| function | `public.gestaltview_get_module_profile( p_subject_id uuid, p_module_key text )` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| trigger | `touch_gestaltview_modules_updated_at ON public.gestaltview_modules` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| trigger | `touch_gestaltview_module_keys_updated_at ON public.gestaltview_module_keys` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| trigger | `touch_gestaltview_module_profiles_updated_at ON public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| policy | `"gestaltview_modules_read" ON public.gestaltview_modules` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| policy | `"gestaltview_module_keys_read" ON public.gestaltview_module_keys` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| policy | `"gestaltview_module_profiles_select_own" ON public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| policy | `"gestaltview_module_profiles_insert_own" ON public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| policy | `"gestaltview_module_profiles_update_own" ON public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| policy | `"gestaltview_module_profiles_delete_own" ON public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| index | `gestaltview_modules_scope_idx ON public.gestaltview_modules` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| index | `gestaltview_module_keys_module_id_idx ON public.gestaltview_module_keys` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| index | `gestaltview_module_profiles_subject_id_idx ON public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| index | `gestaltview_module_profiles_module_key_idx ON public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| index | `gestaltview_module_profiles_auth_user_id_idx ON public.gestaltview_module_profiles` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| type | `public.gestaltview_module_scope` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| type | `public.gestaltview_module_profile_visibility` | `public` | `20260429120000_gestaltview_module_registry.sql` | `20260429120000_gestaltview_module_registry.sql` |
| extension | `pgcrypto` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| table | `public.workspace_rooms` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| table | `public.workspace_documents` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| function | `public.set_workspace_persistence_updated_at()` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| trigger | `trg_workspace_rooms_set_updated_at ON public.workspace_rooms` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| trigger | `trg_workspace_documents_set_updated_at ON public.workspace_documents` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| policy | `"Service role full access workspace_rooms" ON public.workspace_rooms` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| policy | `"Service role full access workspace_documents" ON public.workspace_documents` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| index | `workspace_rooms_user_id_idx ON public.workspace_rooms` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| index | `workspace_documents_user_id_idx ON public.workspace_documents` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| index | `workspace_documents_workspace_id_idx ON public.workspace_documents` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| index | `workspace_documents_status_idx ON public.workspace_documents` | `public` | `20260430143000_workspaces_documents_persistence.sql` | `20260430143000_workspaces_documents_persistence.sql` |
| extension | `pgcrypto` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| table | `public.embodiment_mutation_proposals` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| table | `public.embodiment_review_log` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| table | `public.embodiment_readiness_scores` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| function | `public.is_founder_admin_user(candidate uuid)` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| policy | `"service role full access embodiment_mutation_proposals" ON public.embodiment_mutation_proposals` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| policy | `"authenticated review own embodiment_mutation_proposals" ON public.embodiment_mutation_proposals` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| policy | `"authenticated submit embodiment_mutation_proposals" ON public.embodiment_mutation_proposals` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| policy | `"founder review embodiment_mutation_proposals" ON public.embodiment_mutation_proposals` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| policy | `"service role full access embodiment_review_log" ON public.embodiment_review_log` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| policy | `"founder review embodiment_review_log" ON public.embodiment_review_log` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| policy | `"service role full access embodiment_readiness_scores" ON public.embodiment_readiness_scores` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| policy | `"authenticated manage embodiment_readiness_scores" ON public.embodiment_readiness_scores` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| index | `embodiment_mutation_proposals_agent_slug_idx ON public.embodiment_mutation_proposals` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| index | `embodiment_mutation_proposals_review_queue_idx ON public.embodiment_mutation_proposals` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| index | `embodiment_review_log_agent_slug_idx ON public.embodiment_review_log` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| index | `embodiment_review_log_proposal_id_idx ON public.embodiment_review_log` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| index | `embodiment_readiness_scores_agent_slug_idx ON public.embodiment_readiness_scores` | `public` | `20260509000000_embodiment_governance_persistence.sql` | `20260509000000_embodiment_governance_persistence.sql` |
| extension | `pgcrypto` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| table | `public.user_files` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| table | `public.inner_world_artifacts` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| function | `public.set_inner_world_files_updated_at()` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| trigger | `trg_user_files_set_updated_at ON public.user_files` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| trigger | `trg_inner_world_artifacts_set_updated_at ON public.inner_world_artifacts` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| policy | `"Users manage their own files" ON public.user_files` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| policy | `"Service role full access user_files" ON public.user_files` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| policy | `"Users manage their own inner world artifacts" ON public.inner_world_artifacts` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| policy | `"Service role full access inner_world_artifacts" ON public.inner_world_artifacts` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| index | `user_files_user_id_created_at_idx ON public.user_files` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| index | `user_files_room_origin_idx ON public.user_files` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| index | `user_files_mime_type_idx ON public.user_files` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| index | `inner_world_artifacts_user_id_created_at_idx ON public.inner_world_artifacts` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| index | `inner_world_artifacts_origin_room_idx ON public.inner_world_artifacts` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| index | `inner_world_artifacts_source_file_id_idx ON public.inner_world_artifacts` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| type | `public.file_room_origin` | `public` | `20260515000000_inner_world_files.sql` | `20260515000000_inner_world_files.sql` |
| extension | `pgcrypto` | `public` | `20260515000100_embodiment_profiles.sql` | `20260515_embodiment_profiles.sql` |
| table | `public.embodiment_profiles` | `public` | `20260515000100_embodiment_profiles.sql` | `20260515_embodiment_profiles.sql` |
| table | `public.embodiment_training_runs` | `public` | `20260515000100_embodiment_profiles.sql` | `20260515_embodiment_profiles.sql` |
| function | `public.set_updated_at()` | `public` | `20260515000100_embodiment_profiles.sql` | `20260515_embodiment_profiles.sql` |
| trigger | `set_embodiment_profiles_updated_at ON public.embodiment_profiles` | `public` | `20260515000100_embodiment_profiles.sql` | `20260515_embodiment_profiles.sql` |
| extension | `pgcrypto` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| table | `public.journals` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| table | `public.scrapbook_items` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| table | `public.blueprints` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| table | `public.insights` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| table | `public.user_preferences` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| function | `public.set_user_content_updated_at()` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| trigger | `trg_journals_set_updated_at ON public.journals` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| trigger | `trg_user_preferences_set_updated_at ON public.user_preferences` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| policy | `"Users access own journals" ON public.journals` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| policy | `"Users access own scrapbook" ON public.scrapbook_items` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| policy | `"Users access own blueprints" ON public.blueprints` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| policy | `"Users access own artifacts" ON public.inner_world_artifacts` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| policy | `"Users access own insights" ON public.insights` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| policy | `"Users access own preferences" ON public.user_preferences` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `journals_user_id_created_at_idx ON public.journals` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `scrapbook_items_user_id_created_at_idx ON public.scrapbook_items` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `scrapbook_items_file_id_idx ON public.scrapbook_items` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `blueprints_user_id_created_at_idx ON public.blueprints` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `blueprints_status_idx ON public.blueprints` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `inner_world_artifacts_user_id_created_at_idx ON public.inner_world_artifacts` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `inner_world_artifacts_blueprint_id_idx ON public.inner_world_artifacts` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `inner_world_artifacts_status_idx ON public.inner_world_artifacts` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `insights_user_id_created_at_idx ON public.insights` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `insights_type_idx ON public.insights` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| index | `insights_status_idx ON public.insights` | `public` | `20260519000000_add_user_content_tables.sql` | `20260519000000_add_user_content_tables.sql` |
| extension | `pgcrypto` | `public` | `20260519010000_fix_blueprints_schema.sql` | `20260519010000_fix_blueprints_schema.sql` |
| trigger | `trg_blueprints_set_updated_at ON public.blueprints` | `public` | `20260519010000_fix_blueprints_schema.sql` | `20260519010000_fix_blueprints_schema.sql` |
| extension | `pgcrypto` | `public` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` |
| trigger | `trg_insights_set_updated_at ON public.insights` | `public` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` |
| index | `user_files_source_ref_key ON public.user_files` | `public` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` |
| index | `inner_world_artifacts_source_ref_key ON public.inner_world_artifacts` | `public` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` |
| index | `insights_source_ref_key ON public.insights` | `public` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` |
| index | `inner_world_artifacts_source_file_ref_idx ON public.inner_world_artifacts` | `public` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` |
| index | `insights_user_id_updated_at_idx ON public.insights` | `public` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` |
| index | `insights_status_updated_at_idx ON public.insights` | `public` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` | `20260519020000_add_source_refs_to_inner_world_and_insights.sql` |
| extension | `pgcrypto` | `public` | `20260525000000_di_runtime.sql` | `20260525000000_di_runtime.sql` |
| table | `di_sessions` | `public` | `20260525000000_di_runtime.sql` | `20260525000000_di_runtime.sql` |
| table | `di_memory_events` | `public` | `20260525000000_di_runtime.sql` | `20260525000000_di_runtime.sql` |
| policy | `"di_sessions_user_own" ON di_sessions` | `public` | `20260525000000_di_runtime.sql` | `20260525000000_di_runtime.sql` |
| policy | `"di_memory_user_read" ON di_memory_events` | `public` | `20260525000000_di_runtime.sql` | `20260525000000_di_runtime.sql` |
| policy | `"di_memory_service_write" ON di_memory_events` | `public` | `20260525000000_di_runtime.sql` | `20260525000000_di_runtime.sql` |
| index | `di_sessions_di_slug_last_session_idx ON di_sessions` | `public` | `20260525000000_di_runtime.sql` | `20260525000000_di_runtime.sql` |
| index | `di_memory_events_di_slug_created_at_idx ON di_memory_events` | `public` | `20260525000000_di_runtime.sql` | `20260525000000_di_runtime.sql` |
| index | `user_preferences_embodiment_profile_slug_idx ON public.user_preferences` | `public` | `20260526000000_add_profile_preference_fields.sql` | `20260526000000_add_profile_preference_fields.sql` |
| trigger | `trg_scrapbook_items_set_updated_at ON public.scrapbook_items` | `public` | `20260526001000_add_sanctuary_source_refs.sql` | `20260526001000_add_sanctuary_source_refs.sql` |
| index | `journals_source_ref_key ON public.journals` | `public` | `20260526001000_add_sanctuary_source_refs.sql` | `20260526001000_add_sanctuary_source_refs.sql` |
| index | `scrapbook_items_source_ref_key ON public.scrapbook_items` | `public` | `20260526001000_add_sanctuary_source_refs.sql` | `20260526001000_add_sanctuary_source_refs.sql` |
| table | `user_profile_ingestion_runs` | `public` | `20260528000000_profile_ingestion_and_route_embodiments.sql` | `20260528000000_profile_ingestion_and_route_embodiments.sql` |
| table | `user_personality_dimensions` | `public` | `20260528000000_profile_ingestion_and_route_embodiments.sql` | `20260528000000_profile_ingestion_and_route_embodiments.sql` |
| table | `profile_ingestion_sources` | `public` | `20260528000000_profile_ingestion_and_route_embodiments.sql` | `20260528000000_profile_ingestion_and_route_embodiments.sql` |
| table | `embodiment_modules` | `public` | `20260528000000_profile_ingestion_and_route_embodiments.sql` | `20260528000000_profile_ingestion_and_route_embodiments.sql` |
| table | `route_embodiment_assignments` | `public` | `20260528000000_profile_ingestion_and_route_embodiments.sql` | `20260528000000_profile_ingestion_and_route_embodiments.sql` |
| index | `user_profile_ingestion_runs_user_created_idx ON user_profile_ingestion_runs` | `public` | `20260528000000_profile_ingestion_and_route_embodiments.sql` | `20260528000000_profile_ingestion_and_route_embodiments.sql` |
| index | `user_personality_dimensions_run_key_idx ON user_personality_dimensions` | `public` | `20260528000000_profile_ingestion_and_route_embodiments.sql` | `20260528000000_profile_ingestion_and_route_embodiments.sql` |
| index | `profile_ingestion_sources_run_type_idx ON profile_ingestion_sources` | `public` | `20260528000000_profile_ingestion_and_route_embodiments.sql` | `20260528000000_profile_ingestion_and_route_embodiments.sql` |
| table | `masterclass_progress` | `public` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` |
| function | `upsert_masterclass_session( p_embodiment_slug text )` | `public` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` |
| policy | `"users see own masterclass progress" ON masterclass_progress` | `public` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` |
| index | `idx_masterclass_progress_user_slug ON masterclass_progress` | `public` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` |
| index | `idx_masterclass_progress_last_session ON masterclass_progress` | `public` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` | `20260531013000_masterclass_module_setup_and_progress_tracking.sql` |
| extension | `vector` | `public` | `20260531020000_vector_search_and_indexes.sql` | `20260531020000_vector_search_and_indexes.sql` |
| function | `match_memories( query_embedding vector(384)` | `public` | `20260531020000_vector_search_and_indexes.sql` | `20260531020000_vector_search_and_indexes.sql` |
| index | `idx_memory_entries_embedding ON memory_entries` | `public` | `20260531020000_vector_search_and_indexes.sql` | `20260531020000_vector_search_and_indexes.sql` |
| index | `idx_bucket_drops_stage_user ON bucket_drops` | `public` | `20260531020000_vector_search_and_indexes.sql` | `20260531020000_vector_search_and_indexes.sql` |
| index | `idx_inner_world_artifacts_user ON inner_world_artifacts` | `public` | `20260531020000_vector_search_and_indexes.sql` | `20260531020000_vector_search_and_indexes.sql` |
| index | `idx_di_memory_events_session ON di_memory_events` | `public` | `20260531020000_vector_search_and_indexes.sql` | `20260531020000_vector_search_and_indexes.sql` |
| index | `idx_di_memory_events_user_slug ON di_memory_events` | `public` | `20260531020000_vector_search_and_indexes.sql` | `20260531020000_vector_search_and_indexes.sql` |
| extension | `pgcrypto` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| table | `public.capture_events` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| table | `public.scaffold_nodes` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| table | `public.artifacts` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| table | `public.identity_claims` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| table | `public.profile_pipeline_runs` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| table | `public.profile_pipeline_run_links` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| table | `public.provenance_envelopes` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| table | `public.provenance_links` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| function | `public.gv_profile_pipeline_touch_updated_at()` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| function | `public.gv_capture_events_guard()` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| trigger | `trg_capture_events_guard ON public.capture_events` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| trigger | `trg_capture_events_touch ON public.capture_events` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| trigger | `trg_scaffold_nodes_touch ON public.scaffold_nodes` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| trigger | `trg_artifacts_touch ON public.artifacts` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| trigger | `trg_identity_claims_touch ON public.identity_claims` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `capture_events_user_created_idx ON public.capture_events` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `capture_events_room_created_idx ON public.capture_events` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `scaffold_nodes_user_review_idx ON public.scaffold_nodes` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `artifacts_user_created_idx ON public.artifacts` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `identity_claims_user_review_idx ON public.identity_claims` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `profile_pipeline_runs_user_created_idx ON public.profile_pipeline_runs` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `profile_pipeline_run_links_run_idx ON public.profile_pipeline_run_links` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `provenance_envelopes_subject_idx ON public.provenance_envelopes` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| index | `provenance_links_envelope_idx ON public.provenance_links` | `public` | `20260601000100_profile_pipeline_v1_core.sql` | `20260601000100_profile_pipeline_v1_core.sql` |
| policy | `"Users read their own profile_pipeline_runs" ON public.profile_pipeline_runs` | `public` | `20260601000200_profile_pipeline_v1_rls.sql` | `20260601000200_profile_pipeline_v1_rls.sql` |
| policy | `"Service role manages profile_pipeline_runs" ON public.profile_pipeline_runs` | `public` | `20260601000200_profile_pipeline_v1_rls.sql` | `20260601000200_profile_pipeline_v1_rls.sql` |
| policy | `"Users read linked objects for their runs" ON public.profile_pipeline_run_links` | `public` | `20260601000200_profile_pipeline_v1_rls.sql` | `20260601000200_profile_pipeline_v1_rls.sql` |
| policy | `"Service role manages profile_pipeline_run_links" ON public.profile_pipeline_run_links` | `public` | `20260601000200_profile_pipeline_v1_rls.sql` | `20260601000200_profile_pipeline_v1_rls.sql` |
| policy | `"Users read own provenance envelopes" ON public.provenance_envelopes` | `public` | `20260601000200_profile_pipeline_v1_rls.sql` | `20260601000200_profile_pipeline_v1_rls.sql` |
| policy | `"Service role manages provenance_envelopes" ON public.provenance_envelopes` | `public` | `20260601000200_profile_pipeline_v1_rls.sql` | `20260601000200_profile_pipeline_v1_rls.sql` |
| policy | `"Service role manages provenance_links" ON public.provenance_links` | `public` | `20260601000200_profile_pipeline_v1_rls.sql` | `20260601000200_profile_pipeline_v1_rls.sql` |
| table | `public.migration_user_map` | `public` | `20260601000300_profile_pipeline_v1_backfill.sql` | `20260601000300_profile_pipeline_v1_backfill.sql` |
| function | `public.gv_record_capture_event( p_user_id uuid, p_room text, p_source_type text, p_original_text text, p_consent_state jsonb default '{"tier":"private_default"}'::jsonb, p_metadata jsonb default '{}'::jsonb )` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| function | `public.gv_begin_profile_pipeline_run( p_user_id uuid, p_run_type text, p_input_summary jsonb default '{}'::jsonb )` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| function | `public.gv_complete_profile_pipeline_run( p_run_id uuid, p_status text, p_output_summary jsonb default '{}'::jsonb, p_error_message text default null )` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| function | `public.gv_link_pipeline_object( p_run_id uuid, p_object_type text, p_object_id text, p_link_role text default 'source', p_metadata jsonb default '{}'::jsonb )` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| function | `public.gv_create_pending_scaffold_node( p_user_id uuid, p_title text, p_body text, p_source_capture_ids uuid[] default '{}'::uuid[], p_source_artifact_ids uuid[] default '{}'::uuid[], p_metadata jsonb default '{}'::jsonb )` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| function | `public.gv_approve_scaffold_node(p_node_id uuid)` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| function | `public.gv_create_identity_claim( p_user_id uuid, p_claim_text text, p_evidence_artifact_ids uuid[] default '{}'::uuid[], p_evidence_scaffold_node_ids uuid[] default '{}'::uuid[], p_metadata jsonb default '{}'::jsonb )` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| function | `public.gv_attach_provenance_envelope( p_subject_type text, p_subject_id text, p_content_hash text, p_source_capture_ids uuid[] default '{}'::uuid[], p_source_artifact_ids uuid[] default '{}'::uuid[], p_source_scaffold_node_ids uuid[] default '{}'::uuid[], p_pipeline_run_id uuid default null, p_operations text[] default '{}'::text[], p_privacy_class text default 'private', p_consent_state jsonb default '{"tier":"private_default"}'::jsonb, p_metadata jsonb default '{}'::jsonb )` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| function | `public.resolve_route_embodiment_assignment(p_route_path text)` | `public` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` | `20260601000400_profile_pipeline_v1_rpc_helpers.sql` |
| extension | `pgcrypto` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| table | `public.model_homes` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| table | `public.model_home_capabilities` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| table | `public.model_home_assignments` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| table | `public.model_home_events` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| table | `public.model_home_evaluations` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| table | `public.model_home_consent_grants` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| index | `model_homes_status_privacy_idx ON public.model_homes` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| index | `model_home_assignments_room_task_idx ON public.model_home_assignments` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| index | `model_home_events_created_idx ON public.model_home_events` | `public` | `20260601000500_model_homes_v1.sql` | `20260601000500_model_homes_v1.sql` |
| extension | `pgcrypto` | `public` | `20260601000600_resonance_event_bus_v1.sql` | `20260601000600_resonance_event_bus_v1.sql` |
| table | `public.resonance_events` | `public` | `20260601000600_resonance_event_bus_v1.sql` | `20260601000600_resonance_event_bus_v1.sql` |
| function | `public.gv_emit_resonance_event( p_event_type text, p_actor_type text, p_owner_user_id uuid, p_subject_type text, p_subject_id text, p_room text default null, p_pipeline_run_id uuid default null, p_consent_state jsonb default '{}'::jsonb, p_provenance jsonb default '{}'::jsonb, p_payload jsonb default '{}'::jsonb )` | `public` | `20260601000600_resonance_event_bus_v1.sql` | `20260601000600_resonance_event_bus_v1.sql` |
| policy | `"Users read their own resonance events" ON public.resonance_events` | `public` | `20260601000600_resonance_event_bus_v1.sql` | `20260601000600_resonance_event_bus_v1.sql` |
| policy | `"Service role manages resonance events" ON public.resonance_events` | `public` | `20260601000600_resonance_event_bus_v1.sql` | `20260601000600_resonance_event_bus_v1.sql` |
| index | `resonance_events_owner_created_idx ON public.resonance_events` | `public` | `20260601000600_resonance_event_bus_v1.sql` | `20260601000600_resonance_event_bus_v1.sql` |
| index | `resonance_events_type_created_idx ON public.resonance_events` | `public` | `20260601000600_resonance_event_bus_v1.sql` | `20260601000600_resonance_event_bus_v1.sql` |
| index | `resonance_events_subject_idx ON public.resonance_events` | `public` | `20260601000600_resonance_event_bus_v1.sql` | `20260601000600_resonance_event_bus_v1.sql` |
| table | `codex_artifacts` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| table | `codex_jobs` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| policy | `"users_select_own_codex_artifacts" ON codex_artifacts` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| policy | `"users_insert_own_codex_artifacts" ON codex_artifacts` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| policy | `"users_update_own_codex_artifacts" ON codex_artifacts` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| policy | `"users_select_own_codex_jobs" ON codex_jobs` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| index | `codex_artifacts_user_created_idx ON codex_artifacts` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| index | `codex_artifacts_workspace_created_idx ON codex_artifacts` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| index | `codex_jobs_artifact_status_idx ON codex_jobs` | `public` | `20260602000100_codex_artifacts.sql` | `20260602000100_codex_artifacts.sql` |
| table | `public.created_artifacts` | `public` | `20260604000100_codex_artifact_tables.sql` | `20260604_codex_artifact_tables.sql` |
| table | `public.artifact_provenance_envelopes` | `public` | `20260604000100_codex_artifact_tables.sql` | `20260604_codex_artifact_tables.sql` |
| table | `public.transcriptory_captures` | `public` | `20260609000100_transcriptory_captures.sql` | `20260609000100_transcriptory_captures.sql` |
| function | `public.set_transcriptory_captures_updated_at()` | `public` | `20260609000100_transcriptory_captures.sql` | `20260609000100_transcriptory_captures.sql` |
| trigger | `transcriptory_captures_set_updated_at ON public.transcriptory_captures` | `public` | `20260609000100_transcriptory_captures.sql` | `20260609000100_transcriptory_captures.sql` |
| policy | `"Users can manage their own transcriptory captures" ON public.transcriptory_captures` | `public` | `20260609000100_transcriptory_captures.sql` | `20260609000100_transcriptory_captures.sql` |
| index | `transcriptory_captures_user_created_idx ON public.transcriptory_captures` | `public` | `20260609000100_transcriptory_captures.sql` | `20260609000100_transcriptory_captures.sql` |
| index | `transcriptory_captures_user_status_idx ON public.transcriptory_captures` | `public` | `20260609000100_transcriptory_captures.sql` | `20260609000100_transcriptory_captures.sql` |
| policy | `"Users can read own transcriptory audio" ON storage.objects` | `storage` | `20260609000200_transcriptory_audio_bucket.sql` | `20260609000200_transcriptory_audio_bucket.sql` |
| policy | `"Users can upload own transcriptory audio" ON storage.objects` | `storage` | `20260609000200_transcriptory_audio_bucket.sql` | `20260609000200_transcriptory_audio_bucket.sql` |
| policy | `"Users can update own transcriptory audio" ON storage.objects` | `storage` | `20260609000200_transcriptory_audio_bucket.sql` | `20260609000200_transcriptory_audio_bucket.sql` |
| policy | `"Users can delete own transcriptory audio" ON storage.objects` | `storage` | `20260609000200_transcriptory_audio_bucket.sql` | `20260609000200_transcriptory_audio_bucket.sql` |
| index | `idx_inner_world_artifacts_user_id ON inner_world_artifacts` | `public` | `20260609000300_artifact_query_indexes.sql` | `20260609000300_artifact_query_indexes.sql` |
| index | `idx_inner_world_artifacts_user_created ON inner_world_artifacts` | `public` | `20260609000300_artifact_query_indexes.sql` | `20260609000300_artifact_query_indexes.sql` |
| index | `idx_codex_jobs_artifact_id ON codex_jobs` | `public` | `20260609000300_artifact_query_indexes.sql` | `20260609000300_artifact_query_indexes.sql` |
| index | `idx_codex_jobs_status ON codex_jobs` | `public` | `20260609000300_artifact_query_indexes.sql` | `20260609000300_artifact_query_indexes.sql` |
| index | `idx_codex_jobs_status_created ON codex_jobs` | `public` | `20260609000300_artifact_query_indexes.sql` | `20260609000300_artifact_query_indexes.sql` |
| table | `public.transcriptory_sessions` | `public` | `20260610000100_transcriptory_sessions_and_sources.sql` | `20260610000100_transcriptory_sessions_and_sources.sql` |
| table | `public.transcriptory_sources` | `public` | `20260610000100_transcriptory_sessions_and_sources.sql` | `20260610000100_transcriptory_sessions_and_sources.sql` |
| index | `transcriptory_sessions_user_created_idx ON public.transcriptory_sessions` | `public` | `20260610000100_transcriptory_sessions_and_sources.sql` | `20260610000100_transcriptory_sessions_and_sources.sql` |
| index | `transcriptory_sources_user_capture_idx ON public.transcriptory_sources` | `public` | `20260610000100_transcriptory_sessions_and_sources.sql` | `20260610000100_transcriptory_sessions_and_sources.sql` |
| index | `transcriptory_captures_user_created_idx ON public.transcriptory_captures` | `public` | `20260610000100_transcriptory_sessions_and_sources.sql` | `20260610000100_transcriptory_sessions_and_sources.sql` |
| index | `transcriptory_captures_user_session_idx ON public.transcriptory_captures` | `public` | `20260610000100_transcriptory_sessions_and_sources.sql` | `20260610000100_transcriptory_sessions_and_sources.sql` |
| index | `transcriptory_captures_transcript_status_idx ON public.transcriptory_captures` | `public` | `20260610000100_transcriptory_sessions_and_sources.sql` | `20260610000100_transcriptory_sessions_and_sources.sql` |
| function | `public.transcriptory_captures_search_document_fn()` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| function | `public.set_updated_at()` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| trigger | `transcriptory_captures_search_document_trigger ON public.transcriptory_captures` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| trigger | `set_transcriptory_sessions_updated_at ON public.transcriptory_sessions` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| policy | `"transcriptory_sessions_select_own" ON public.transcriptory_sessions` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| policy | `"transcriptory_sessions_insert_own" ON public.transcriptory_sessions` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| policy | `"transcriptory_sessions_update_own" ON public.transcriptory_sessions` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| policy | `"transcriptory_sessions_delete_own" ON public.transcriptory_sessions` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| policy | `"transcriptory_sources_select_own" ON public.transcriptory_sources` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| policy | `"transcriptory_sources_insert_own" ON public.transcriptory_sources` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| policy | `"transcriptory_sources_update_own" ON public.transcriptory_sources` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| policy | `"transcriptory_sources_delete_own" ON public.transcriptory_sources` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| index | `transcriptory_captures_search_document_idx ON public.transcriptory_captures` | `public` | `20260610000200_transcriptory_search_and_triggers.sql` | `20260610000200_transcriptory_search_and_triggers.sql` |
| index | `transcriptory_captures_user_status_updated_idx ON public.transcriptory_captures` | `public` | `20260610000300_transcriptory_processing_state.sql` | `20260610000300_transcriptory_processing_state.sql` |
| function | `public.claim_codex_jobs(batch_size integer default 5)` | `public` | `20260611000100_codex_job_claim_rpc.sql` | `20260611000100_codex_job_claim_rpc.sql` |
