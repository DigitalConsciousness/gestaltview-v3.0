-- GestaltView Supabase post-deploy verification.
-- Run: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f verify_after_deploy.sql

select 'extensions' as check_name, extname
from pg_extension
where extname in ('pgcrypto','vector','pg_trgm')
order by extname;

select 'important_tables_missing' as check_name, expected.table_name
from (values
  ('users'),
  ('session_rate_limits'),
  ('app_users'),
  ('processing_runs'),
  ('documents'),
  ('embeddings'),
  ('knowledge_fragments'),
  ('memory_entries'),
  ('agents'),
  ('agent_versions'),
  ('training_runs'),
  ('training_steps'),
  ('eval_results'),
  ('approvals'),
  ('gate_package_drafts'),
  ('gate_buyers'),
  ('gate_orders'),
  ('gate_order_items'),
  ('gate_build_jobs'),
  ('gate_artifacts'),
  ('knowledge_assets'),
  ('knowledge_asset_chunks'),
  ('knowledge_interpretations'),
  ('agent_memories'),
  ('agent_manifests'),
  ('capture_events'),
  ('scaffold_nodes'),
  ('artifacts'),
  ('identity_claims'),
  ('profile_pipeline_runs'),
  ('codex_artifacts'),
  ('codex_jobs'),
  ('transcriptory_captures'),
  ('transcriptory_sessions'),
  ('transcriptory_sources')
) as expected(table_name)
where to_regclass('public.' || expected.table_name) is null
order by expected.table_name;

select 'rls_enabled_public_tables' as check_name, count(*) as table_count
from pg_tables t
join pg_class c on c.relname = t.tablename
join pg_namespace n on n.oid = c.relnamespace and n.nspname = t.schemaname
where t.schemaname = 'public'
  and c.relrowsecurity = true;

select 'policies_public_storage' as check_name, schemaname, tablename, count(*) as policy_count
from pg_policies
where schemaname in ('public','storage')
group by schemaname, tablename
order by schemaname, tablename;

select 'triggers_public_auth' as check_name, event_object_schema, event_object_table, trigger_name
from information_schema.triggers
where event_object_schema in ('public','auth')
order by event_object_schema, event_object_table, trigger_name;

select 'storage_buckets' as check_name, id, name, public
from storage.buckets
where id in ('transcriptory_audio_files','inner-world-files')
order by id;

