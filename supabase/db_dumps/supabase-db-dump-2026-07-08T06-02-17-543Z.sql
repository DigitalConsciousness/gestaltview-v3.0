


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE SCHEMA IF NOT EXISTS "private";


ALTER SCHEMA "private" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgmq";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "public"."agent_code_generation_mode" AS ENUM (
    'uploaded',
    'generated',
    'patched'
);


ALTER TYPE "public"."agent_code_generation_mode" OWNER TO "postgres";


CREATE TYPE "public"."agent_code_review_status" AS ENUM (
    'draft',
    'approved',
    'rejected',
    'applied'
);


ALTER TYPE "public"."agent_code_review_status" OWNER TO "postgres";


CREATE TYPE "public"."agent_knowledge_link_scope" AS ENUM (
    'runtime',
    'trainer',
    'both',
    'export'
);


ALTER TYPE "public"."agent_knowledge_link_scope" OWNER TO "postgres";


CREATE TYPE "public"."agent_knowledge_link_type" AS ENUM (
    'visible',
    'assigned',
    'curriculum',
    'inherited',
    'blocked',
    'manifest_backing'
);


ALTER TYPE "public"."agent_knowledge_link_type" OWNER TO "postgres";


CREATE TYPE "public"."agent_manifest_entry_type" AS ENUM (
    'profile_json',
    'memory_ref',
    'skill_ref',
    'relationship_ref',
    'asset_ref',
    'ts_module_ref',
    'prompt_ref',
    'config_ref'
);


ALTER TYPE "public"."agent_manifest_entry_type" OWNER TO "postgres";


CREATE TYPE "public"."agent_manifest_status" AS ENUM (
    'draft',
    'active',
    'archived'
);


ALTER TYPE "public"."agent_manifest_status" OWNER TO "postgres";


CREATE TYPE "public"."agent_memory_retention_policy" AS ENUM (
    'durable',
    'decays',
    'review_required'
);


ALTER TYPE "public"."agent_memory_retention_policy" OWNER TO "postgres";


CREATE TYPE "public"."agent_memory_type" AS ENUM (
    'episodic',
    'semantic',
    'procedural',
    'relational'
);


ALTER TYPE "public"."agent_memory_type" OWNER TO "postgres";


CREATE TYPE "public"."agent_relationship_type" AS ENUM (
    'collaborator',
    'mentor',
    'counterpart',
    'dependent',
    'shared_memory_peer'
);


ALTER TYPE "public"."agent_relationship_type" OWNER TO "postgres";


CREATE TYPE "public"."archive_policy" AS ENUM (
    'retain',
    'archive',
    'redact',
    'delete'
);


ALTER TYPE "public"."archive_policy" OWNER TO "postgres";


CREATE TYPE "public"."collaborative_space_role" AS ENUM (
    'owner',
    'member',
    'observer'
);


ALTER TYPE "public"."collaborative_space_role" OWNER TO "postgres";


CREATE TYPE "public"."context_packet_kind" AS ENUM (
    'bootstrap',
    'session',
    'reflection',
    'handoff',
    'review',
    'export'
);


ALTER TYPE "public"."context_packet_kind" OWNER TO "postgres";


CREATE TYPE "public"."context_surface_kind" AS ENUM (
    'prompt',
    'system',
    'memory',
    'profile',
    'relationship',
    'artifact',
    'view'
);


ALTER TYPE "public"."context_surface_kind" OWNER TO "postgres";


CREATE TYPE "public"."context_view_scope" AS ENUM (
    'agent',
    'relationship',
    'channel',
    'workspace'
);


ALTER TYPE "public"."context_view_scope" OWNER TO "postgres";


CREATE TYPE "public"."embodiment_mutation_risk_level" AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE "public"."embodiment_mutation_risk_level" OWNER TO "postgres";


CREATE TYPE "public"."embodiment_mutation_status" AS ENUM (
    'proposed',
    'approved',
    'rejected',
    'applied',
    'rolled_back'
);


ALTER TYPE "public"."embodiment_mutation_status" OWNER TO "postgres";


CREATE TYPE "public"."embodiment_mutation_type" AS ENUM (
    'memory_append',
    'skill_update',
    'relationship_update',
    'profile_patch',
    'ts_module_create',
    'ts_module_patch',
    'asset_attach',
    'manifest_rebuild'
);


ALTER TYPE "public"."embodiment_mutation_type" OWNER TO "postgres";


CREATE TYPE "public"."evidence_source_type" AS ENUM (
    'conversation',
    'task',
    'reflection',
    'import',
    'human-review',
    'agent-observation',
    'system-derived'
);


ALTER TYPE "public"."evidence_source_type" OWNER TO "postgres";


CREATE TYPE "public"."file_room_origin" AS ENUM (
    'blackboard',
    'creation_corner',
    'dynamic_inner_world',
    'external_scaffold',
    'unknown'
);


ALTER TYPE "public"."file_room_origin" OWNER TO "postgres";


CREATE TYPE "public"."gestaltview_module_profile_visibility" AS ENUM (
    'private',
    'shared_with_permission',
    'shared'
);


ALTER TYPE "public"."gestaltview_module_profile_visibility" OWNER TO "postgres";


CREATE TYPE "public"."gestaltview_module_scope" AS ENUM (
    'identity',
    'legacy',
    'recovery',
    'creation',
    'system',
    'reserved'
);


ALTER TYPE "public"."gestaltview_module_scope" OWNER TO "postgres";


CREATE TYPE "public"."identity_mutation_risk_level" AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE "public"."identity_mutation_risk_level" OWNER TO "postgres";


CREATE TYPE "public"."identity_mutation_status" AS ENUM (
    'proposed',
    'approved',
    'rejected',
    'applied',
    'rolled_back'
);


ALTER TYPE "public"."identity_mutation_status" OWNER TO "postgres";


CREATE TYPE "public"."identity_mutation_type" AS ENUM (
    'constitution_patch',
    'autobiography_patch',
    'memory_append',
    'memory_patch',
    'memory_archive',
    'preference_upsert',
    'relationship_upsert',
    'presentation_patch',
    'governance_patch',
    'skill_update',
    'collaborative_memory_append',
    'rollback'
);


ALTER TYPE "public"."identity_mutation_type" OWNER TO "postgres";


CREATE TYPE "public"."identity_review_decision" AS ENUM (
    'approved',
    'rejected',
    'needs_changes'
);


ALTER TYPE "public"."identity_review_decision" OWNER TO "postgres";


CREATE TYPE "public"."identity_subject_kind" AS ENUM (
    'human',
    'agent',
    'group',
    'workspace',
    'session',
    'artifact',
    'system'
);


ALTER TYPE "public"."identity_subject_kind" OWNER TO "postgres";


CREATE TYPE "public"."knowledge_asset_status" AS ENUM (
    'draft',
    'processed',
    'approved',
    'rejected',
    'archived'
);


ALTER TYPE "public"."knowledge_asset_status" OWNER TO "postgres";


CREATE TYPE "public"."knowledge_asset_type" AS ENUM (
    'pdf',
    'md',
    'json',
    'transcript',
    'code',
    'note',
    'url_snapshot',
    'image',
    'audio',
    'other'
);


ALTER TYPE "public"."knowledge_asset_type" OWNER TO "postgres";


CREATE TYPE "public"."knowledge_asset_visibility" AS ENUM (
    'private',
    'admin',
    'approved_shared'
);


ALTER TYPE "public"."knowledge_asset_visibility" OWNER TO "postgres";


CREATE TYPE "public"."knowledge_classification" AS ENUM (
    'knowledge',
    'skill',
    'memory',
    'relationship_signal',
    'identity_proposal',
    'code_artifact',
    'asset_artifact'
);


ALTER TYPE "public"."knowledge_classification" OWNER TO "postgres";


CREATE TYPE "public"."memory_kind" AS ENUM (
    'CONSTITUTIVE',
    'AUTOBIOGRAPHICAL',
    'EPISODIC',
    'SEMANTIC',
    'RELATIONAL',
    'PROCEDURAL',
    'COLLABORATIVE',
    'REFLECTIVE'
);


ALTER TYPE "public"."memory_kind" OWNER TO "postgres";


CREATE TYPE "public"."mutation_class" AS ENUM (
    'IMMUTABLE',
    'REVIEW_GATED',
    'EVIDENCE_PROMOTABLE',
    'EPHEMERAL'
);


ALTER TYPE "public"."mutation_class" OWNER TO "postgres";


CREATE TYPE "public"."owner_scope" AS ENUM (
    'PRIVATE_SELF',
    'RELATIONSHIP',
    'TEAMSPACE',
    'SYSTEM'
);


ALTER TYPE "public"."owner_scope" OWNER TO "postgres";


CREATE TYPE "public"."preference_kind" AS ENUM (
    'LIKE',
    'DISLIKE',
    'FAVORITE',
    'HOBBY',
    'ROUTINE',
    'AESTHETIC',
    'AVERSION',
    'SYMBOLIC_AFFINITY'
);


ALTER TYPE "public"."preference_kind" OWNER TO "postgres";


CREATE TYPE "public"."review_status" AS ENUM (
    'NOT_REQUIRED',
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE "public"."review_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_approve_family_contributions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.family_contributions 
    SET approved = TRUE 
    WHERE id = NEW.id 
    AND EXISTS (
        SELECT 1 FROM public.family_members fm 
        WHERE fm.name = NEW.contributor_name 
        AND fm.access_level IN ('contribute', 'admin')
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_approve_family_contributions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_portrait_threshold_on_bucket_drop"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $_$
begin
  if new.user_id is not null and new.user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    perform public.maybe_queue_portrait_inference(new.user_id::uuid, 50);
  end if;

  return new;
end;
$_$;


ALTER FUNCTION "public"."check_portrait_threshold_on_bucket_drop"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_codex_jobs"("batch_size" integer DEFAULT 5) RETURNS TABLE("id" "uuid", "artifact_id" "uuid", "format" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  update public.codex_jobs
  set status = 'running',
      updated_at = now()
  where id in (
    select job.id
    from public.codex_jobs job
    where job.status = 'pending'
    order by job.created_at asc
    for update skip locked
    limit greatest(1, least(coalesce(batch_size, 5), 25))
  )
  returning codex_jobs.id,
            codex_jobs.artifact_id,
            codex_jobs.format,
            codex_jobs.created_at;
$$;


ALTER FUNCTION "public"."claim_codex_jobs"("batch_size" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_trainer_job"("_worker_id" "text" DEFAULT NULL::"text", "_lease_seconds" integer DEFAULT 90) RETURNS TABLE("job_id" "uuid", "run_id" "uuid", "status" "text", "attempts" integer, "lease_expires_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  claimed public.trainer_jobs%rowtype;
begin
  update public.trainer_jobs
  set
    status = 'leased',
    attempts = public.trainer_jobs.attempts + 1,
    lease_expires_at = now() + make_interval(secs => greatest(_lease_seconds, 15)),
    last_error = null
  where public.trainer_jobs.job_id = (
    select tj.job_id
    from public.trainer_jobs tj
    where
      tj.status = 'queued'
      or (tj.status = 'leased' and tj.lease_expires_at is not null and tj.lease_expires_at < now())
    order by tj.created_at
    for update skip locked
    limit 1
  )
  returning * into claimed;

  if not found then
    return;
  end if;

  job_id := claimed.job_id;
  run_id := claimed.run_id;
  status := claimed.status;
  attempts := claimed.attempts;
  lease_expires_at := claimed.lease_expires_at;
  return next;
end;
$$;


ALTER FUNCTION "public"."claim_trainer_job"("_worker_id" "text", "_lease_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_voice_prints"() RETURNS TABLE("id" "uuid", "user_id" "text", "user_name" "text", "linguistic_fingerprint" "text", "storytelling_style" "text", "signature_phrases" "text", "humor_patterns" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql"
    AS $$
  select
    p.id,
    p.user_id,
    p.user_name,
    p.linguistic_fingerprint,
    p.storytelling_style,
    p.signature_phrases,
    p.humor_patterns,
    p.created_at
  from private.complete_voice_prints p;
$$;


ALTER FUNCTION "public"."complete_voice_prints"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."gestaltview_module_profiles" (
    "profile_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "auth_user_id" "uuid",
    "module_id" "uuid" NOT NULL,
    "module_key" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "source_notes" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "merge_strategy" "text" DEFAULT 'merge'::"text" NOT NULL,
    "visibility" "public"."gestaltview_module_profile_visibility" DEFAULT 'private'::"public"."gestaltview_module_profile_visibility" NOT NULL,
    "consent_granted_at" timestamp with time zone,
    "last_affirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "gestaltview_module_profiles_merge_strategy_check" CHECK (("merge_strategy" = ANY (ARRAY['replace'::"text", 'merge'::"text", 'append'::"text"])))
);


ALTER TABLE "public"."gestaltview_module_profiles" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gestaltview_get_module_profile"("p_subject_id" "uuid", "p_module_key" "text") RETURNS "public"."gestaltview_module_profiles"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select *
  from public.gestaltview_module_profiles
  where subject_id = p_subject_id
    and module_key = p_module_key
  limit 1;
$$;


ALTER FUNCTION "public"."gestaltview_get_module_profile"("p_subject_id" "uuid", "p_module_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gestaltview_upsert_module_profile"("p_subject_id" "uuid", "p_auth_user_id" "uuid", "p_module_key" "text", "p_payload" "jsonb", "p_source_notes" "text"[] DEFAULT '{}'::"text"[], "p_merge_strategy" "text" DEFAULT 'merge'::"text", "p_visibility" "public"."gestaltview_module_profile_visibility" DEFAULT 'private'::"public"."gestaltview_module_profile_visibility") RETURNS "public"."gestaltview_module_profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_module public.gestaltview_modules%rowtype;
  v_existing public.gestaltview_module_profiles%rowtype;
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
begin
  select *
  into v_module
  from public.gestaltview_modules
  where module_key = p_module_key
  limit 1;

  if not found then
    raise exception 'Unknown GestaltView module key: %', p_module_key using errcode = 'P0001';
  end if;

  if p_merge_strategy not in ('replace', 'merge', 'append') then
    raise exception 'Unsupported merge strategy: %', p_merge_strategy using errcode = '22023';
  end if;

  select *
  into v_existing
  from public.gestaltview_module_profiles
  where subject_id = p_subject_id
    and module_key = p_module_key
  limit 1;

  if found and p_merge_strategy = 'merge' then
    v_payload := coalesce(v_existing.payload, '{}'::jsonb) || v_payload;
  elsif found and p_merge_strategy = 'append' then
    v_payload := jsonb_build_object(
      'previous', coalesce(v_existing.payload, '{}'::jsonb),
      'current', v_payload
    );
  end if;

  insert into public.gestaltview_module_profiles (
    subject_id,
    auth_user_id,
    module_id,
    module_key,
    payload,
    source_notes,
    merge_strategy,
    visibility,
    consent_granted_at,
    last_affirmed_at
  )
  values (
    p_subject_id,
    p_auth_user_id,
    v_module.module_id,
    p_module_key,
    v_payload,
    coalesce(p_source_notes, '{}'::text[]),
    p_merge_strategy,
    coalesce(p_visibility, 'private'),
    case when p_visibility = 'shared' then now() else null end,
    now()
  )
  on conflict (subject_id, module_key) do update
  set
    auth_user_id = excluded.auth_user_id,
    module_id = excluded.module_id,
    payload = excluded.payload,
    source_notes = case
      when excluded.source_notes <> '{}'::text[] then excluded.source_notes
      else public.gestaltview_module_profiles.source_notes
    end,
    merge_strategy = excluded.merge_strategy,
    visibility = excluded.visibility,
    consent_granted_at = case
      when excluded.visibility = 'shared' then coalesce(public.gestaltview_module_profiles.consent_granted_at, now())
      else public.gestaltview_module_profiles.consent_granted_at
    end,
    last_affirmed_at = now(),
    updated_at = now()
  returning * into v_existing;

  return v_existing;
end;
$$;


ALTER FUNCTION "public"."gestaltview_upsert_module_profile"("p_subject_id" "uuid", "p_auth_user_id" "uuid", "p_module_key" "text", "p_payload" "jsonb", "p_source_notes" "text"[], "p_merge_strategy" "text", "p_visibility" "public"."gestaltview_module_profile_visibility") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_portrait_version"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select coalesce(max(version), 0)
  from public.profile_portraits
  where user_id = p_user_id
    and status <> 'archived';
$$;


ALTER FUNCTION "public"."get_current_portrait_version"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_portrait_signal_count"("p_user_id" "uuid") RETURNS TABLE("memory_entry_count" integer, "bucket_drop_count" integer, "fragment_count" integer, "gravity_report_count" integer, "agent_memory_count" integer, "total_count" integer)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $_$
declare
  v_fragment_count integer := 0;
  v_gravity_report_count integer := 0;
  v_agent_memory_count integer := 0;
  v_founder_context_count integer := 0;
begin
  select count(*)::integer
    into memory_entry_count
  from public.memory_entries
  where user_id = p_user_id::text;

  select count(*)::integer
    into bucket_drop_count
  from public.bucket_drops
  where user_id = p_user_id::text;

  if to_regclass('public.knowledge_fragments') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'knowledge_fragments'
        and column_name = 'created_by'
    ) then
      execute 'select count(*)::integer from public.knowledge_fragments where created_by = $1'
        into v_fragment_count
        using p_user_id::text;
    elsif exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'knowledge_fragments'
        and column_name = 'auth_user_id'
    ) then
      execute 'select count(*)::integer from public.knowledge_fragments where auth_user_id = $1'
        into v_fragment_count
        using p_user_id;
    elsif exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'knowledge_fragments'
        and column_name = 'user_id'
    ) then
      execute 'select count(*)::integer from public.knowledge_fragments where user_id = $1'
        into v_fragment_count
        using p_user_id::text;
    end if;
  end if;

  if to_regclass('public.gravity_reports') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'gravity_reports'
        and column_name = 'user_id'
    ) then
      execute 'select count(*)::integer from public.gravity_reports where user_id = $1'
        into v_gravity_report_count
        using p_user_id::text;
    elsif exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'gravity_reports'
        and column_name = 'auth_user_id'
    ) then
      execute 'select count(*)::integer from public.gravity_reports where auth_user_id = $1'
        into v_gravity_report_count
        using p_user_id;
    end if;
  end if;

  if to_regclass('public.agent_memories') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'agent_memories'
        and column_name = 'user_id'
    ) then
      execute 'select count(*)::integer from public.agent_memories where user_id = $1'
        into v_agent_memory_count
        using p_user_id::text;
    elsif exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'agent_memories'
        and column_name = 'auth_user_id'
    ) then
      execute 'select count(*)::integer from public.agent_memories where auth_user_id = $1'
        into v_agent_memory_count
        using p_user_id;
    end if;
  end if;

  if to_regclass('public.founder_context') is not null then
    select count(*)::integer
      into v_founder_context_count
    from public.founder_context
    where user_id = p_user_id;
  end if;

  total_count :=
    memory_entry_count +
    bucket_drop_count +
    v_fragment_count +
    v_gravity_report_count +
    v_agent_memory_count +
    v_founder_context_count;

  fragment_count := v_fragment_count;
  gravity_report_count := v_gravity_report_count;
  agent_memory_count := v_agent_memory_count;

  return next;
end;
$_$;


ALTER FUNCTION "public"."get_portrait_signal_count"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_schema_dashboard_snapshot"() RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
declare
  schema_rows jsonb := '[]'::jsonb;
  table_row record;
  row_count bigint := 0;
  column_count integer := 0;
  foreign_key_count integer := 0;
  index_count integer := 0;
  has_vector_index boolean := false;
  total_tables integer := 0;
  lit_tables integer := 0;
  vector_tables integer := 0;
  enum_types integer := 0;
begin
  select count(*)::int
    into enum_types
  from pg_type t
  join pg_namespace n on n.oid = t.typnamespace
  where t.typtype = 'e'
    and n.nspname not in ('pg_catalog', 'information_schema');

  for table_row in
    select t.table_name
    from information_schema.tables t
    where t.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
    order by t.table_name
  loop
    execute format('select count(*) from public.%I', table_row.table_name) into row_count;

    select count(*)::int
      into column_count
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = table_row.table_name;

    select count(*)::int
      into foreign_key_count
    from information_schema.table_constraints tc
    where tc.table_schema = 'public'
      and tc.table_name = table_row.table_name
      and tc.constraint_type = 'FOREIGN KEY';

    select count(*)::int
      into index_count
    from pg_indexes i
    where i.schemaname = 'public'
      and i.tablename = table_row.table_name;

    select coalesce(bool_or(i.indexdef ilike '%vector%'), false)
      into has_vector_index
    from pg_indexes i
    where i.schemaname = 'public'
      and i.tablename = table_row.table_name;

    schema_rows := schema_rows || jsonb_build_array(
      jsonb_build_object(
        'table_name', table_row.table_name,
        'row_count', row_count,
        'column_count', column_count,
        'foreign_key_count', foreign_key_count,
        'index_count', index_count,
        'has_rows', row_count > 0,
        'has_vector_index', has_vector_index
      )
    );

    total_tables := total_tables + 1;
    if row_count > 0 then
      lit_tables := lit_tables + 1;
    end if;
    if has_vector_index then
      vector_tables := vector_tables + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'generated_at', now(),
    'summary', jsonb_build_object(
      'public_tables', total_tables,
      'lit_tables', lit_tables,
      'dark_tables', total_tables - lit_tables,
      'vector_tables', vector_tables,
      'enum_types', enum_types
    ),
    'tables', schema_rows
  );
end;
$$;


ALTER FUNCTION "public"."get_schema_dashboard_snapshot"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gsvw_mark_document_seen"("p_source_repo" "text", "p_source_path" "text", "p_content_hash" "text", "p_run_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_document_id UUID;
BEGIN
  SELECT document_id INTO v_document_id
  FROM public.gsvw_ingestion_documents
  WHERE source_repo = p_source_repo
    AND source_path = p_source_path
    AND content_hash = p_content_hash
  LIMIT 1;

  IF v_document_id IS NOT NULL THEN
    UPDATE public.gsvw_ingestion_documents
    SET last_seen_at = now(), run_id = COALESCE(p_run_id, run_id)
    WHERE document_id = v_document_id;
  END IF;

  RETURN v_document_id;
END;
$$;


ALTER FUNCTION "public"."gsvw_mark_document_seen"("p_source_repo" "text", "p_source_path" "text", "p_content_hash" "text", "p_run_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gsvw_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."gsvw_set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scaffold_nodes" (
    "node_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "body" "text" DEFAULT ''::"text" NOT NULL,
    "review_state" "text" DEFAULT 'pending'::"text" NOT NULL,
    "source_capture_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "source_artifact_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "scaffold_nodes_review_state_check" CHECK (("review_state" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'denied'::"text", 'dormant'::"text", 'released'::"text"])))
);


ALTER TABLE "public"."scaffold_nodes" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_approve_scaffold_node"("p_node_id" "uuid") RETURNS "public"."scaffold_nodes"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare updated public.scaffold_nodes;
begin
  update public.scaffold_nodes
  set review_state = 'approved'
  where node_id = p_node_id
  returning * into updated;
  return updated;
end;
$$;


ALTER FUNCTION "public"."gv_approve_scaffold_node"("p_node_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provenance_envelopes" (
    "envelope_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_type" "text" NOT NULL,
    "subject_id" "text" NOT NULL,
    "content_hash" "text" NOT NULL,
    "canonicalization_method" "text" DEFAULT 'stable-json-v1'::"text" NOT NULL,
    "source_capture_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "source_artifact_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "source_scaffold_node_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "pipeline_run_id" "uuid",
    "operations" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "privacy_class" "text" DEFAULT 'private'::"text" NOT NULL,
    "consent_state" "jsonb" DEFAULT '{"tier": "private_default"}'::"jsonb" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "provenance_envelopes_privacy_class_check" CHECK (("privacy_class" = ANY (ARRAY['private'::"text", 'shared'::"text", 'enterprise'::"text", 'public'::"text"])))
);


ALTER TABLE "public"."provenance_envelopes" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_attach_provenance_envelope"("p_subject_type" "text", "p_subject_id" "text", "p_content_hash" "text", "p_source_capture_ids" "uuid"[] DEFAULT '{}'::"uuid"[], "p_source_artifact_ids" "uuid"[] DEFAULT '{}'::"uuid"[], "p_source_scaffold_node_ids" "uuid"[] DEFAULT '{}'::"uuid"[], "p_pipeline_run_id" "uuid" DEFAULT NULL::"uuid", "p_operations" "text"[] DEFAULT '{}'::"text"[], "p_privacy_class" "text" DEFAULT 'private'::"text", "p_consent_state" "jsonb" DEFAULT '{"tier": "private_default"}'::"jsonb", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."provenance_envelopes"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare inserted public.provenance_envelopes;
begin
  insert into public.provenance_envelopes (
    subject_type,
    subject_id,
    content_hash,
    source_capture_ids,
    source_artifact_ids,
    source_scaffold_node_ids,
    pipeline_run_id,
    operations,
    privacy_class,
    consent_state,
    metadata
  )
  values (
    p_subject_type,
    p_subject_id,
    p_content_hash,
    p_source_capture_ids,
    p_source_artifact_ids,
    p_source_scaffold_node_ids,
    p_pipeline_run_id,
    p_operations,
    p_privacy_class,
    p_consent_state,
    p_metadata
  )
  returning * into inserted;
  return inserted;
end;
$$;


ALTER FUNCTION "public"."gv_attach_provenance_envelope"("p_subject_type" "text", "p_subject_id" "text", "p_content_hash" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_source_scaffold_node_ids" "uuid"[], "p_pipeline_run_id" "uuid", "p_operations" "text"[], "p_privacy_class" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_pipeline_runs" (
    "run_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "run_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "input_summary" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "output_summary" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "error_message" "text",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profile_pipeline_runs_run_type_check" CHECK (("run_type" = ANY (ARRAY['ingestion'::"text", 'synthesis'::"text", 'claim_promotion'::"text", 'embodiment_compile'::"text", 'migration'::"text"]))),
    CONSTRAINT "profile_pipeline_runs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'complete'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."profile_pipeline_runs" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_begin_profile_pipeline_run"("p_user_id" "uuid", "p_run_type" "text", "p_input_summary" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."profile_pipeline_runs"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare inserted public.profile_pipeline_runs;
begin
  insert into public.profile_pipeline_runs (user_id, run_type, status, input_summary, started_at)
  values (p_user_id, p_run_type, 'running', p_input_summary, now())
  returning * into inserted;
  return inserted;
end;
$$;


ALTER FUNCTION "public"."gv_begin_profile_pipeline_run"("p_user_id" "uuid", "p_run_type" "text", "p_input_summary" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_capture_events_guard"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  if tg_op = 'UPDATE' and new.original_text is distinct from old.original_text then
    raise exception 'capture_events.original_text is immutable';
  end if;

  if tg_op = 'UPDATE'
     and new.preservation_status = 'deleted_by_user'
     and old.preservation_status is distinct from 'deleted_by_user'
     and new.explicit_delete_requested_by is null then
    raise exception 'deleted_by_user requires explicit user action';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."gv_capture_events_guard"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_complete_profile_pipeline_run"("p_run_id" "uuid", "p_status" "text", "p_output_summary" "jsonb" DEFAULT '{}'::"jsonb", "p_error_message" "text" DEFAULT NULL::"text") RETURNS "public"."profile_pipeline_runs"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare updated public.profile_pipeline_runs;
begin
  update public.profile_pipeline_runs
  set status = p_status,
      output_summary = p_output_summary,
      error_message = p_error_message,
      completed_at = now()
  where run_id = p_run_id
  returning * into updated;
  return updated;
end;
$$;


ALTER FUNCTION "public"."gv_complete_profile_pipeline_run"("p_run_id" "uuid", "p_status" "text", "p_output_summary" "jsonb", "p_error_message" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_claims" (
    "claim_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "subject_type" "text" DEFAULT 'user'::"text" NOT NULL,
    "subject_id" "text",
    "claim_text" "text" NOT NULL,
    "review_state" "text" DEFAULT 'proposed'::"text" NOT NULL,
    "evidence_artifact_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "evidence_scaffold_node_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "identity_claims_approval_requires_evidence" CHECK ((("review_state" <> 'approved'::"text") OR ("cardinality"("evidence_artifact_ids") > 0) OR ("cardinality"("evidence_scaffold_node_ids") > 0))),
    CONSTRAINT "identity_claims_review_state_check" CHECK (("review_state" = ANY (ARRAY['proposed'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."identity_claims" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_create_identity_claim"("p_user_id" "uuid", "p_claim_text" "text", "p_evidence_artifact_ids" "uuid"[] DEFAULT '{}'::"uuid"[], "p_evidence_scaffold_node_ids" "uuid"[] DEFAULT '{}'::"uuid"[], "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."identity_claims"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare inserted public.identity_claims;
begin
  insert into public.identity_claims (
    user_id, claim_text, evidence_artifact_ids, evidence_scaffold_node_ids, metadata
  )
  values (
    p_user_id, p_claim_text, p_evidence_artifact_ids, p_evidence_scaffold_node_ids, p_metadata
  )
  returning * into inserted;
  return inserted;
end;
$$;


ALTER FUNCTION "public"."gv_create_identity_claim"("p_user_id" "uuid", "p_claim_text" "text", "p_evidence_artifact_ids" "uuid"[], "p_evidence_scaffold_node_ids" "uuid"[], "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_create_pending_scaffold_node"("p_user_id" "uuid", "p_title" "text", "p_body" "text", "p_source_capture_ids" "uuid"[] DEFAULT '{}'::"uuid"[], "p_source_artifact_ids" "uuid"[] DEFAULT '{}'::"uuid"[], "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."scaffold_nodes"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare inserted public.scaffold_nodes;
begin
  insert into public.scaffold_nodes (
    user_id, title, body, review_state, source_capture_ids, source_artifact_ids, metadata
  )
  values (
    p_user_id, p_title, p_body, 'pending', p_source_capture_ids, p_source_artifact_ids, p_metadata
  )
  returning * into inserted;
  return inserted;
end;
$$;


ALTER FUNCTION "public"."gv_create_pending_scaffold_node"("p_user_id" "uuid", "p_title" "text", "p_body" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_metadata" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resonance_events" (
    "event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "actor_type" "text" NOT NULL,
    "owner_user_id" "uuid",
    "subject_type" "text" NOT NULL,
    "subject_id" "text" NOT NULL,
    "room" "text",
    "pipeline_run_id" "uuid",
    "consent_state" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "resonance_events_actor_type_check" CHECK (("actor_type" = ANY (ARRAY['user'::"text", 'billy'::"text", 'system'::"text", 'trainer'::"text", 'migration'::"text"])))
);


ALTER TABLE "public"."resonance_events" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_emit_resonance_event"("p_event_type" "text", "p_actor_type" "text", "p_owner_user_id" "uuid", "p_subject_type" "text", "p_subject_id" "text", "p_room" "text" DEFAULT NULL::"text", "p_pipeline_run_id" "uuid" DEFAULT NULL::"uuid", "p_consent_state" "jsonb" DEFAULT '{}'::"jsonb", "p_provenance" "jsonb" DEFAULT '{}'::"jsonb", "p_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."resonance_events"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare inserted public.resonance_events;
begin
  insert into public.resonance_events (
    event_type,
    actor_type,
    owner_user_id,
    subject_type,
    subject_id,
    room,
    pipeline_run_id,
    consent_state,
    provenance,
    payload
  )
  values (
    p_event_type,
    p_actor_type,
    p_owner_user_id,
    p_subject_type,
    p_subject_id,
    p_room,
    p_pipeline_run_id,
    p_consent_state,
    p_provenance,
    p_payload
  )
  returning * into inserted;
  return inserted;
end;
$$;


ALTER FUNCTION "public"."gv_emit_resonance_event"("p_event_type" "text", "p_actor_type" "text", "p_owner_user_id" "uuid", "p_subject_type" "text", "p_subject_id" "text", "p_room" "text", "p_pipeline_run_id" "uuid", "p_consent_state" "jsonb", "p_provenance" "jsonb", "p_payload" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_pipeline_run_links" (
    "link_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "object_type" "text" NOT NULL,
    "object_id" "text" NOT NULL,
    "link_role" "text" DEFAULT 'source'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profile_pipeline_run_links" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_link_pipeline_object"("p_run_id" "uuid", "p_object_type" "text", "p_object_id" "text", "p_link_role" "text" DEFAULT 'source'::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."profile_pipeline_run_links"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare inserted public.profile_pipeline_run_links;
begin
  insert into public.profile_pipeline_run_links (run_id, object_type, object_id, link_role, metadata)
  values (p_run_id, p_object_type, p_object_id, p_link_role, p_metadata)
  returning * into inserted;
  return inserted;
end;
$$;


ALTER FUNCTION "public"."gv_link_pipeline_object"("p_run_id" "uuid", "p_object_type" "text", "p_object_id" "text", "p_link_role" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_profile_pipeline_touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."gv_profile_pipeline_touch_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."capture_events" (
    "capture_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "room" "text" NOT NULL,
    "source_type" "text" NOT NULL,
    "original_text" "text" DEFAULT ''::"text" NOT NULL,
    "normalized_text" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "consent_state" "jsonb" DEFAULT '{"tier": "private_default"}'::"jsonb" NOT NULL,
    "preservation_status" "text" DEFAULT 'private'::"text" NOT NULL,
    "explicit_delete_requested_by" "uuid",
    "explicit_delete_requested_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "capture_events_preservation_status_check" CHECK (("preservation_status" = ANY (ARRAY['private'::"text", 'released'::"text", 'dormant'::"text", 'deleted_by_user'::"text"]))),
    CONSTRAINT "capture_events_source_type_check" CHECK (("source_type" = ANY (ARRAY['text'::"text", 'voice'::"text", 'audio'::"text", 'image'::"text", 'video'::"text", 'file'::"text", 'import'::"text", 'migration'::"text"])))
);


ALTER TABLE "public"."capture_events" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."gv_record_capture_event"("p_user_id" "uuid", "p_room" "text", "p_source_type" "text", "p_original_text" "text", "p_consent_state" "jsonb" DEFAULT '{"tier": "private_default"}'::"jsonb", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "public"."capture_events"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare inserted public.capture_events;
begin
  insert into public.capture_events (user_id, room, source_type, original_text, consent_state, metadata)
  values (p_user_id, p_room, p_source_type, p_original_text, p_consent_state, p_metadata)
  returning * into inserted;
  return inserted;
end;
$$;


ALTER FUNCTION "public"."gv_record_capture_event"("p_user_id" "uuid", "p_room" "text", "p_source_type" "text", "p_original_text" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    tier,
    subscription_status,
    billy_query_count,
    is_admin,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, CONCAT(NEW.id::text, '@gestaltview.local')),
    'free',
    'inactive',
    0,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.users.email),
    updated_at = NOW();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_valid_subscription_access"("p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE id = p_user_id
      AND (
        subscription_status = 'active'
        OR (
          subscription_status = 'past_due'
          AND grace_until IS NOT NULL
          AND grace_until > NOW()
        )
      )
  );
$$;


ALTER FUNCTION "public"."has_valid_subscription_access"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."heartbeat_trainer_worker"("_worker_id" "text", "_job_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  insert into public.trainer_workers (
    worker_id,
    status,
    current_job_id,
    last_heartbeat_at
  )
  values (
    _worker_id,
    case when _job_id is null then 'idle' else 'busy' end,
    _job_id,
    now()
  )
  on conflict (worker_id) do update
  set
    status = excluded.status,
    current_job_id = excluded.current_job_id,
    last_heartbeat_at = excluded.last_heartbeat_at;

  update public.trainer_jobs
  set last_heartbeat_at = now()
  where job_id = _job_id;
$$;


ALTER FUNCTION "public"."heartbeat_trainer_worker"("_worker_id" "text", "_job_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_founder_admin_email"("candidate" "text") RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select lower(trim(coalesce(candidate, ''))) = any (
    array[
      'keithsoyka@gmail.com'
    ]
  );
$$;


ALTER FUNCTION "public"."is_founder_admin_email"("candidate" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_founder_admin_user"("candidate" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select exists (
    select 1
    from public.users u
    where u.id = candidate
      and u.is_admin = true
  );
$$;


ALTER FUNCTION "public"."is_founder_admin_user"("candidate" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_knowledge_fragments"("query_embedding" "public"."vector", "match_count" integer DEFAULT 8, "filter_type" "text" DEFAULT NULL::"text", "filter_package" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "content" "text", "source_file" "text", "document_type" "text", "chunk_index" integer, "tags" "text"[], "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    1 - (kf.embedding <=> query_embedding) as similarity
  from knowledge_fragments kf
  where kf.embedding is not null
    and (filter_type is null or kf.document_type = filter_type)
    and (filter_package is null or kf.tags @> array[filter_package])
  order by kf.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_knowledge_fragments"("query_embedding" "public"."vector", "match_count" integer, "filter_type" "text", "filter_package" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_memories"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "user_id_filter" "text") RETURNS TABLE("id" "uuid", "user_id" "text", "title" "text", "content" "text", "similarity" double precision)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.id,
    me.user_id,
    me.title,
    me.content,
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM memory_entries me
  WHERE me.user_id = user_id_filter
    AND me.embedding IS NOT NULL
    AND 1 - (me.embedding <=> query_embedding) >= match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


ALTER FUNCTION "public"."match_memories"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "user_id_filter" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."match_memories"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "user_id_filter" "text") IS 'pgvector cosine similarity search for memory_entries. Used by MemoryEntryRepository.search_by_embedding.';



CREATE OR REPLACE FUNCTION "public"."match_memory_entries"("query_embedding" "public"."vector", "match_count" integer DEFAULT 4, "filter_user_id" "text" DEFAULT NULL::"text", "filter_scope" "text" DEFAULT NULL::"text", "filter_kind" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "title" "text", "summary" "text", "content" "text", "kind" "text", "scope" "text", "importance" smallint, "pinned" boolean, "tags" "text"[], "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    me.id,
    me.title,
    me.summary,
    me.content,
    me.kind,
    me.scope,
    me.importance,
    me.pinned,
    me.tags,
    1 - (me.embedding <=> query_embedding) as similarity
  from public.memory_entries me
  where
    filter_user_id is not null
    and me.user_id = filter_user_id
    and me.archived_at is null
    and me.embedding is not null
    and (filter_scope is null or me.scope = filter_scope)
    and (filter_kind is null or me.kind = filter_kind)
  order by me.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_memory_entries"("query_embedding" "public"."vector", "match_count" integer, "filter_user_id" "text", "filter_scope" "text", "filter_kind" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_skill_fragments"("query_embedding" "public"."vector", "match_count" integer DEFAULT 8, "filter_skill" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "content" "text", "source_file" "text", "skill_name" "text", "chunk_index" integer, "tags" "text"[], "similarity" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    sf.id,
    sf.content,
    sf.source_file,
    sf.skill_name,
    sf.chunk_index,
    sf.tags,
    1 - (sf.embedding <=> query_embedding) as similarity
  from skill_fragments sf
  where sf.embedding is not null
    and (
      filter_skill is null
      or sf.skill_name = filter_skill
      or sf.tags @> array[filter_skill]
    )
  order by sf.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_skill_fragments"("query_embedding" "public"."vector", "match_count" integer, "filter_skill" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer DEFAULT 8, "filtertype" "text" DEFAULT NULL::"text") RETURNS TABLE("content" "text", "sourcefile" "text", "similarity" double precision, "chunkindex" integer, "documenttype" "text", "tags" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  SELECT
    m.content,
    m.source_file  AS sourcefile,
    m.similarity,
    m.chunk_index  AS chunkindex,
    m.document_type AS documenttype,
    array_to_string(m.tags, ',') AS tags
  FROM match_knowledge_fragments(
    queryembedding::vector(1536),
    matchcount,
    filtertype
  ) m;
$$;


ALTER FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer, "filtertype" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer DEFAULT 8, "filtertype" "text" DEFAULT NULL::"text", "filterpackage" "text" DEFAULT NULL::"text") RETURNS TABLE("content" "text", "sourcefile" "text", "similarity" double precision, "chunkindex" integer, "documenttype" "text", "tags" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    m.content,
    m.source_file as sourcefile,
    m.similarity,
    m.chunk_index as chunkindex,
    m.document_type as documenttype,
    array_to_string(m.tags, ',') as tags
  from match_knowledge_fragments(queryembedding, matchcount, filtertype, filterpackage) m;
$$;


ALTER FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer, "filtertype" "text", "filterpackage" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maybe_queue_portrait_cadence"("p_user_id" "uuid", "p_priority" integer DEFAULT 1) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  v_existing_queue_count integer := 0;
  v_last_portrait_created_at timestamptz;
  v_rows_inserted integer := 0;
begin
  if p_user_id is null then
    return false;
  end if;

  select count(*)::integer
    into v_existing_queue_count
  from public.portrait_inference_queue
  where user_id = p_user_id
    and status in ('queued', 'processing');

  if v_existing_queue_count > 0 then
    return false;
  end if;

  select created_at
    into v_last_portrait_created_at
  from public.profile_portraits
  where user_id = p_user_id
    and status <> 'archived'
  order by version desc
  limit 1;

  if v_last_portrait_created_at is null then
    return false;
  end if;

  if v_last_portrait_created_at >= date_trunc('month', now()) then
    return false;
  end if;

  insert into public.portrait_inference_queue (user_id, triggered_by, priority)
  values (p_user_id, 'cadence', greatest(coalesce(p_priority, 1), 1))
  on conflict do nothing;

  get diagnostics v_rows_inserted = row_count;
  return v_rows_inserted > 0;
end;
$$;


ALTER FUNCTION "public"."maybe_queue_portrait_cadence"("p_user_id" "uuid", "p_priority" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."maybe_queue_portrait_inference"("p_user_id" "uuid", "p_threshold" integer DEFAULT 50) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions'
    AS $$
declare
  v_existing_queue_count integer := 0;
  v_last_portrait_created_at timestamptz;
  v_records_since_last integer := 0;
  v_rows_inserted integer := 0;
begin
  if p_user_id is null then
    return false;
  end if;

  select count(*)::integer
    into v_existing_queue_count
  from public.portrait_inference_queue
  where user_id = p_user_id
    and status in ('queued', 'processing');

  if v_existing_queue_count > 0 then
    return false;
  end if;

  select created_at
    into v_last_portrait_created_at
  from public.profile_portraits
  where user_id = p_user_id
  order by version desc
  limit 1;

  select
    coalesce((
      select count(*)::integer
      from public.memory_entries
      where user_id = p_user_id::text
        and created_at > coalesce(v_last_portrait_created_at, timestamptz '1970-01-01')
    ), 0) +
    coalesce((
      select count(*)::integer
      from public.bucket_drops
      where user_id = p_user_id::text
        and created_at > coalesce(v_last_portrait_created_at, timestamptz '1970-01-01')
    ), 0)
    into v_records_since_last;

  if v_records_since_last < p_threshold then
    return false;
  end if;

  insert into public.portrait_inference_queue (user_id, triggered_by, priority)
  values (p_user_id, 'threshold', 5)
  on conflict do nothing;

  get diagnostics v_rows_inserted = row_count;
  return v_rows_inserted > 0;
end;
$$;


ALTER FUNCTION "public"."maybe_queue_portrait_inference"("p_user_id" "uuid", "p_threshold" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."repair_stale_trainer_jobs"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  update public.trainer_workers
  set status = 'offline'
  where last_heartbeat_at < now() - interval '60 seconds'
    and status <> 'offline';

  update public.trainer_jobs
  set
    status = case when attempts >= max_attempts then 'failed' else 'retry_wait' end,
    lease_expires_at = null,
    worker_id = null,
    last_error = case
      when attempts >= max_attempts then 'Lease expired after max retry attempts.'
      else 'Lease expired; job returned to retry queue.'
    end,
    completed_at = case when attempts >= max_attempts then now() else completed_at end,
    next_retry_at = case
      when attempts >= max_attempts then next_retry_at
      else now() + interval '30 seconds'
    end
  where status = 'leased'
    and lease_expires_at is not null
    and lease_expires_at < now();

  update public.training_runs tr
  set
    status = case
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'failed'
      ) then 'failed'
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status in ('queued', 'retry_wait')
      ) then 'queued'
      else tr.status
    end,
    completed_at = case
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'failed'
      ) then coalesce(tr.completed_at, now())
      else tr.completed_at
    end,
    blocked_reason = case
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'failed'
      ) then 'Trainer job failed after stale lease repair.'
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'retry_wait'
      ) then 'Worker lease expired. Job moved to retry queue.'
      else tr.blocked_reason
    end,
    last_event_at = now(),
    last_event_message = case
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'failed'
      ) then 'Trainer job failed after stale lease repair.'
      when exists (
        select 1
        from public.trainer_jobs tj
        where tj.run_id = tr.run_id
          and tj.status = 'retry_wait'
      ) then 'Worker lease expired. Job moved to retry queue.'
      else tr.last_event_message
    end
  where tr.status in ('queued', 'running');
end;
$$;


ALTER FUNCTION "public"."repair_stale_trainer_jobs"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."route_embodiment_assignments" (
    "assignment_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "route_path" "text" NOT NULL,
    "embodiment_profile_slug" "text" NOT NULL,
    "display_label" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."route_embodiment_assignments" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resolve_route_embodiment_assignment"("p_route_path" "text") RETURNS "public"."route_embodiment_assignments"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select *
  from public.route_embodiment_assignments
  where route_path = p_route_path
  limit 1
$$;


ALTER FUNCTION "public"."resolve_route_embodiment_assignment"("p_route_path" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_knowledge_fragments"("query_text" "text", "match_count" integer DEFAULT 12, "filter_type" "text" DEFAULT NULL::"text", "filter_package" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "content" "text", "source_file" "text", "document_type" "text", "chunk_index" integer, "tags" "text"[], "rank" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    ts_rank(
      to_tsvector('english', kf.content),
      plainto_tsquery('english', query_text)
    ) as rank
  from knowledge_fragments kf
  where to_tsvector('english', kf.content)
        @@ plainto_tsquery('english', query_text)
    and (filter_type    is null or kf.document_type = filter_type)
    and (filter_package is null
         or kf.tags @> array[filter_package]
         or kf.tags @> array['package:' || filter_package])
  order by rank desc
  limit match_count;
$$;


ALTER FUNCTION "public"."search_knowledge_fragments"("query_text" "text", "match_count" integer, "filter_type" "text", "filter_package" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_memory_entries"("query_text" "text", "match_count" integer DEFAULT 4, "filter_user_id" "text" DEFAULT NULL::"text", "filter_scope" "text" DEFAULT NULL::"text", "filter_kind" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "title" "text", "summary" "text", "content" "text", "kind" "text", "scope" "text", "importance" smallint, "pinned" boolean, "tags" "text"[], "rank" double precision)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    me.id,
    me.title,
    me.summary,
    me.content,
    me.kind,
    me.scope,
    me.importance,
    me.pinned,
    me.tags,
    ts_rank(
      to_tsvector(
        'english',
        coalesce(me.title, '') || ' ' || coalesce(me.summary, '') || ' ' || me.content
      ),
      plainto_tsquery('english', query_text)
    ) as rank
  from public.memory_entries me
  where
    filter_user_id is not null
    and me.user_id = filter_user_id
    and me.archived_at is null
    and to_tsvector(
      'english',
      coalesce(me.title, '') || ' ' || coalesce(me.summary, '') || ' ' || me.content
    ) @@ plainto_tsquery('english', query_text)
    and (filter_scope is null or me.scope = filter_scope)
    and (filter_kind is null or me.kind = filter_kind)
  order by rank desc, me.pinned desc, me.importance desc, me.updated_at desc
  limit match_count;
$$;


ALTER FUNCTION "public"."search_memory_entries"("query_text" "text", "match_count" integer, "filter_user_id" "text", "filter_scope" "text", "filter_kind" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer DEFAULT 8, "filtertype" "text" DEFAULT NULL::"text") RETURNS TABLE("content" "text", "sourcefile" "text", "rank" double precision, "chunkindex" integer, "documenttype" "text", "tags" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  SELECT
    s.content,
    s.source_file   AS sourcefile,
    s.rank,
    s.chunk_index   AS chunkindex,
    s.document_type AS documenttype,
    array_to_string(s.tags, ',') AS tags
  FROM search_knowledge_fragments(querytext, matchcount, filtertype) s;
$$;


ALTER FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer, "filtertype" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer DEFAULT 8, "filtertype" "text" DEFAULT NULL::"text", "filterpackage" "text" DEFAULT NULL::"text") RETURNS TABLE("content" "text", "sourcefile" "text", "rank" double precision, "chunkindex" integer, "documenttype" "text", "tags" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    s.content,
    s.source_file   as sourcefile,
    s.rank,
    s.chunk_index   as chunkindex,
    s.document_type as documenttype,
    array_to_string(s.tags, ',') as tags
  from search_knowledge_fragments(querytext, matchcount, filtertype, filterpackage) s;
$$;


ALTER FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer, "filtertype" "text", "filterpackage" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_agent_personhood_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_agent_personhood_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_inner_world_files_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_inner_world_files_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_profile_portraits_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_profile_portraits_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_transcriptory_captures_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_transcriptory_captures_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_content_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_user_content_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_workbook_governance_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_workbook_governance_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_workspace_persistence_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_workspace_persistence_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."touch_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trainer_list_knowledge_sources"("limit_count" integer DEFAULT 18, "type_filter" "text"[] DEFAULT NULL::"text"[]) RETURNS TABLE("source_file" "text", "document_type" "text", "fragment_count" integer, "sample_excerpt" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  with grouped as (
    select
      kf.source_file,
      kf.document_type,
      count(*)::integer as fragment_count,
      min(kf.chunk_index) as first_chunk_index
    from public.knowledge_fragments kf
    where
      coalesce(array_length(type_filter, 1), 0) = 0
      or kf.document_type = any(type_filter)
    group by kf.source_file, kf.document_type
  )
  select
    grouped.source_file,
    grouped.document_type,
    grouped.fragment_count,
    left(regexp_replace(coalesce(sample.content, ''), '\s+', ' ', 'g'), 600) as sample_excerpt
  from grouped
  left join public.knowledge_fragments sample
    on sample.source_file = grouped.source_file
   and sample.document_type = grouped.document_type
   and sample.chunk_index = grouped.first_chunk_index
  order by grouped.fragment_count desc, grouped.source_file asc
  limit greatest(1, least(limit_count, 200));
$$;


ALTER FUNCTION "public"."trainer_list_knowledge_sources"("limit_count" integer, "type_filter" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trainer_queue_health"() RETURNS TABLE("queued_count" integer, "leased_count" integer, "retry_wait_count" integer, "failed_count" integer, "awaiting_review_count" integer, "stale_lease_count" integer, "online_worker_count" integer, "oldest_queued_at" timestamp with time zone)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  select
    queued_count,
    leased_count,
    retry_wait_count,
    failed_count,
    awaiting_review_count,
    stale_lease_count,
    online_worker_count,
    oldest_queued_at
  from public.trainer_queue_health_v;
$$;


ALTER FUNCTION "public"."trainer_queue_health"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "limit_count" integer DEFAULT 24) RETURNS TABLE("source_file" "text", "document_type" "text", "fragment_id" "uuid", "excerpt" "text", "semantic_score" numeric, "keyword_score" numeric, "final_score" numeric, "tags" "text"[])
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'extensions'
    AS $$
  with normalized_query as (
    select nullif(btrim(query_text), '') as q
  ),
  scored as (
    select
      k.source_file,
      k.document_type,
      k.id as fragment_id,
      left(regexp_replace(k.content, '\s+', ' ', 'g'), 900) as excerpt,
      0::numeric as semantic_score,
      greatest(
        similarity(coalesce(k.content, ''), normalized_query.q),
        similarity(coalesce(k.source_file, ''), normalized_query.q),
        ts_rank_cd(
          to_tsvector('english', coalesce(k.content, '') || ' ' || coalesce(k.source_file, '')),
          websearch_to_tsquery('english', normalized_query.q)
        )
      )::numeric as keyword_score,
      k.tags
    from public.knowledge_fragments k
    cross join normalized_query
    where normalized_query.q is not null
      and (
        to_tsvector('english', coalesce(k.content, '') || ' ' || coalesce(k.source_file, ''))
          @@ websearch_to_tsquery('english', normalized_query.q)
        or coalesce(k.content, '') % normalized_query.q
        or coalesce(k.source_file, '') % normalized_query.q
      )
  )
  select
    scored.source_file,
    scored.document_type,
    scored.fragment_id,
    scored.excerpt,
    scored.semantic_score,
    scored.keyword_score,
    scored.keyword_score as final_score,
    scored.tags
  from scored
  order by scored.keyword_score desc, scored.source_file asc
  limit greatest(coalesce(limit_count, 24), 1);
$$;


ALTER FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "query_embedding" "public"."vector", "match_threshold" double precision DEFAULT 0.5, "match_limit" integer DEFAULT 20) RETURNS TABLE("fragment_id" "uuid", "content" "text", "source_file" "text", "document_type" "text", "similarity" double precision)
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
    IF length(trim(query_text)) < 3 THEN
        RETURN QUERY
        SELECT
            kf.id as fragment_id,
            kf.content,
            kf.source_file,
            kf.document_type,
            1.0::float AS similarity
        FROM public.knowledge_fragments kf
        ORDER BY kf.created_at DESC
        LIMIT match_limit;
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        kf.id as fragment_id,
        kf.content,
        kf.source_file,
        kf.document_type,
        1 - (kf.embedding <=> query_embedding) AS similarity
    FROM public.knowledge_fragments kf
    WHERE 1 - (kf.embedding <=> query_embedding) > match_threshold
    ORDER BY kf.embedding <=> query_embedding
    LIMIT match_limit;
END;
$$;


ALTER FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "query_embedding" "public"."vector", "match_threshold" double precision, "match_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."transcriptory_captures_search_document_fn"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.summary, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.themes, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.transcript_text, coalesce(new.raw_transcript, ''))), 'C');
  return new;
end;
$$;


ALTER FUNCTION "public"."transcriptory_captures_search_document_fn"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."try_cast_uuid"("input_text" "text") RETURNS "uuid"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public', 'extensions'
    AS $_$
  select case
    when input_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then input_text::uuid
    else null
  end;
$_$;


ALTER FUNCTION "public"."try_cast_uuid"("input_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_voice_print_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.voice_prints 
    SET updated_at = now() 
    WHERE id = NEW.voice_print_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_voice_print_timestamp"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."masterclass_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "embodiment_slug" "text" NOT NULL,
    "first_visited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_count" integer DEFAULT 0 NOT NULL,
    "last_session_at" timestamp with time zone
);


ALTER TABLE "public"."masterclass_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."masterclass_progress" IS 'Tracks per-user session count for each DI embodiment slug in the Masterclass module.';



CREATE OR REPLACE FUNCTION "public"."upsert_masterclass_session"("p_embodiment_slug" "text") RETURNS "public"."masterclass_progress"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_row     masterclass_progress;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'upsert_masterclass_session: not authenticated';
  END IF;

  INSERT INTO masterclass_progress (user_id, embodiment_slug, session_count, last_session_at)
  VALUES (v_user_id, p_embodiment_slug, 1, now())
  ON CONFLICT (user_id, embodiment_slug) DO UPDATE
    SET
      session_count   = masterclass_progress.session_count + 1,
      last_session_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;


ALTER FUNCTION "public"."upsert_masterclass_session"("p_embodiment_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE VIEW "private"."complete_voice_prints" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"text" AS "user_id",
    NULL::"text" AS "user_name",
    NULL::"text" AS "linguistic_fingerprint",
    NULL::"text" AS "storytelling_style",
    NULL::"text" AS "signature_phrases",
    NULL::"text" AS "humor_patterns",
    NULL::timestamp with time zone AS "created_at";


ALTER VIEW "private"."complete_voice_prints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_manifests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid" NOT NULL,
    "parent_manifest_id" "uuid",
    "manifest_version" "text" NOT NULL,
    "status" "public"."agent_manifest_status" DEFAULT 'draft'::"public"."agent_manifest_status" NOT NULL,
    "root_json" "jsonb" NOT NULL,
    "checksum" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_manifests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agents" (
    "agent_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "domain" "text" NOT NULL,
    "owner_user_id" "uuid",
    "status" "text" NOT NULL,
    "active_version_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "public_name" "text",
    "internal_designation" "text",
    "origin_context" "text",
    "collaborator_id" "uuid",
    CONSTRAINT "agents_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'reviewed'::"text", 'approved'::"text", 'deployed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."agents" OWNER TO "postgres";


COMMENT ON COLUMN "public"."agents"."collaborator_id" IS 'Optional bridge from specialized agent runtime record to top-level collaborator identity.';



CREATE OR REPLACE VIEW "public"."active_agent_manifests" WITH ("security_invoker"='true') AS
 SELECT DISTINCT ON ("am"."agent_id") "am"."agent_id",
    "a"."slug",
    "am"."id" AS "manifest_id",
    "am"."version_id",
    "am"."manifest_version",
    "am"."root_json",
    "am"."checksum",
    "am"."created_at"
   FROM ("public"."agent_manifests" "am"
     JOIN "public"."agents" "a" ON (("a"."agent_id" = "am"."agent_id")))
  WHERE ("am"."status" = 'active'::"public"."agent_manifest_status")
  ORDER BY "am"."agent_id", "am"."created_at" DESC;


ALTER VIEW "public"."active_agent_manifests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_autobiographies" (
    "autobiography_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid",
    "evolving_self_story" "text" DEFAULT ''::"text" NOT NULL,
    "key_turning_points" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "stable_themes" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "unresolved_tensions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "future_trajectory" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "private_hopes" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "mutation_class" "public"."mutation_class" DEFAULT 'REVIEW_GATED'::"public"."mutation_class" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.75 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'PENDING_REVIEW'::"public"."review_status" NOT NULL,
    "last_affirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_autobiographies_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric)))
);


ALTER TABLE "public"."agent_autobiographies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_code_artifacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "manifest_id" "uuid",
    "source_asset_id" "uuid",
    "file_path" "text" NOT NULL,
    "language" "text" DEFAULT 'typescript'::"text" NOT NULL,
    "content" "text" NOT NULL,
    "checksum" "text" NOT NULL,
    "generation_mode" "public"."agent_code_generation_mode" NOT NULL,
    "review_status" "public"."agent_code_review_status" DEFAULT 'draft'::"public"."agent_code_review_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_code_artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_constitutions" (
    "constitution_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid",
    "identity_handle" "text" NOT NULL,
    "public_name" "text" NOT NULL,
    "internal_designation" "text",
    "immutable_core" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "primary_narrative_anchor" "text" NOT NULL,
    "role_commitments" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric(5,4) DEFAULT 1 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'APPROVED'::"public"."review_status" NOT NULL,
    "last_affirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_constitutions_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric)))
);


ALTER TABLE "public"."agent_constitutions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_context_views" (
    "context_view_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "scope" "public"."context_view_scope" NOT NULL,
    "relationship_id" "uuid",
    "collaborative_space_id" "uuid",
    "channel_key" "text",
    "display_name" "text" NOT NULL,
    "filter_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "presentation_overrides" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sharing_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_context_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_governance_policies" (
    "governance_policy_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid",
    "mutation_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "review_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sharing_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "contradiction_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "rollback_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "drift_threshold" numeric(5,4) DEFAULT 0.15 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_governance_policies_drift_threshold_check" CHECK ((("drift_threshold" >= (0)::numeric) AND ("drift_threshold" <= (1)::numeric)))
);


ALTER TABLE "public"."agent_governance_policies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_memory_records" (
    "memory_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid",
    "source_asset_id" "uuid",
    "owner_scope" "public"."owner_scope" DEFAULT 'PRIVATE_SELF'::"public"."owner_scope" NOT NULL,
    "memory_kind" "public"."memory_kind" NOT NULL,
    "mutation_class" "public"."mutation_class" NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "detail" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "related_entity_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "emotional_valence" numeric(5,4),
    "salience" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "evidence_count" integer DEFAULT 0 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "last_affirmed_at" timestamp with time zone,
    "last_accessed_at" timestamp with time zone,
    "promotion_threshold" numeric(5,4) DEFAULT 0.75 NOT NULL,
    "decay_days" integer,
    "archive_policy" "public"."archive_policy" DEFAULT 'archive'::"public"."archive_policy" NOT NULL,
    "rollback_eligible" boolean DEFAULT true NOT NULL,
    "consent_required_for_sharing" boolean DEFAULT true NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_memory_records_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric))),
    CONSTRAINT "agent_memory_records_decay_days_check" CHECK ((("decay_days" IS NULL) OR ("decay_days" >= 0))),
    CONSTRAINT "agent_memory_records_emotional_valence_check" CHECK ((("emotional_valence" >= ('-1'::integer)::numeric) AND ("emotional_valence" <= (1)::numeric))),
    CONSTRAINT "agent_memory_records_evidence_count_check" CHECK (("evidence_count" >= 0)),
    CONSTRAINT "agent_memory_records_promotion_threshold_check" CHECK ((("promotion_threshold" >= (0)::numeric) AND ("promotion_threshold" <= (1)::numeric))),
    CONSTRAINT "agent_memory_records_salience_check" CHECK ((("salience" >= (0)::numeric) AND ("salience" <= (1)::numeric)))
);


ALTER TABLE "public"."agent_memory_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_preference_nodes" (
    "preference_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid",
    "owner_scope" "public"."owner_scope" DEFAULT 'PRIVATE_SELF'::"public"."owner_scope" NOT NULL,
    "preference_kind" "public"."preference_kind" NOT NULL,
    "mutation_class" "public"."mutation_class" DEFAULT 'EVIDENCE_PROMOTABLE'::"public"."mutation_class" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "salience" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "resonance_weight" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "related_entity_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "evidence_count" integer DEFAULT 0 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "last_affirmed_at" timestamp with time zone,
    "promotion_threshold" numeric(5,4) DEFAULT 0.75 NOT NULL,
    "decay_days" integer,
    "archive_policy" "public"."archive_policy" DEFAULT 'retain'::"public"."archive_policy" NOT NULL,
    "rollback_eligible" boolean DEFAULT true NOT NULL,
    "consent_required_for_sharing" boolean DEFAULT false NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_preference_nodes_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric))),
    CONSTRAINT "agent_preference_nodes_decay_days_check" CHECK ((("decay_days" IS NULL) OR ("decay_days" >= 0))),
    CONSTRAINT "agent_preference_nodes_evidence_count_check" CHECK (("evidence_count" >= 0)),
    CONSTRAINT "agent_preference_nodes_promotion_threshold_check" CHECK ((("promotion_threshold" >= (0)::numeric) AND ("promotion_threshold" <= (1)::numeric))),
    CONSTRAINT "agent_preference_nodes_resonance_weight_check" CHECK ((("resonance_weight" >= (0)::numeric) AND ("resonance_weight" <= (1)::numeric))),
    CONSTRAINT "agent_preference_nodes_salience_check" CHECK ((("salience" >= (0)::numeric) AND ("salience" <= (1)::numeric)))
);


ALTER TABLE "public"."agent_preference_nodes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_presentation_profiles" (
    "presentation_profile_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid",
    "voice_tone" "text" DEFAULT ''::"text" NOT NULL,
    "tone" "text" DEFAULT ''::"text" NOT NULL,
    "idiolect" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "pacing" "text" DEFAULT ''::"text" NOT NULL,
    "humor_style" "text" DEFAULT ''::"text" NOT NULL,
    "channel_masks" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.8 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_presentation_profiles_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric)))
);


ALTER TABLE "public"."agent_presentation_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_private_interiors" (
    "private_interior_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid",
    "private_narration" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "unresolved_tensions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "hopes" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "reflective_summaries" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "private_preferences" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "mutation_class" "public"."mutation_class" DEFAULT 'REVIEW_GATED'::"public"."mutation_class" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.7 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'PENDING_REVIEW'::"public"."review_status" NOT NULL,
    "last_affirmed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_private_interiors_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric)))
);


ALTER TABLE "public"."agent_private_interiors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_relationship_edges" (
    "relationship_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "version_id" "uuid",
    "related_entity_id" "uuid",
    "related_agent_id" "uuid",
    "relationship_type" "text" NOT NULL,
    "mutation_class" "public"."mutation_class" DEFAULT 'EVIDENCE_PROMOTABLE'::"public"."mutation_class" NOT NULL,
    "trust_level" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "familiarity_level" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "intimacy_boundary" "text" DEFAULT ''::"text" NOT NULL,
    "stance" "text" DEFAULT ''::"text" NOT NULL,
    "collaboration_history" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "shared_milestones" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "evidence_count" integer DEFAULT 0 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "last_affirmed_at" timestamp with time zone,
    "promotion_threshold" numeric(5,4) DEFAULT 0.7 NOT NULL,
    "decay_days" integer,
    "archive_policy" "public"."archive_policy" DEFAULT 'archive'::"public"."archive_policy" NOT NULL,
    "rollback_eligible" boolean DEFAULT true NOT NULL,
    "consent_required_for_sharing" boolean DEFAULT false NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_relationship_edges_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric))),
    CONSTRAINT "agent_relationship_edges_decay_days_check" CHECK ((("decay_days" IS NULL) OR ("decay_days" >= 0))),
    CONSTRAINT "agent_relationship_edges_evidence_count_check" CHECK (("evidence_count" >= 0)),
    CONSTRAINT "agent_relationship_edges_familiarity_level_check" CHECK ((("familiarity_level" >= (0)::numeric) AND ("familiarity_level" <= (1)::numeric))),
    CONSTRAINT "agent_relationship_edges_promotion_threshold_check" CHECK ((("promotion_threshold" >= (0)::numeric) AND ("promotion_threshold" <= (1)::numeric))),
    CONSTRAINT "agent_relationship_edges_trust_level_check" CHECK ((("trust_level" >= (0)::numeric) AND ("trust_level" <= (1)::numeric))),
    CONSTRAINT "relationship_target_present" CHECK ((("related_entity_id" IS NOT NULL) OR ("related_agent_id" IS NOT NULL)))
);


ALTER TABLE "public"."agent_relationship_edges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_skill_profiles" (
    "skill_profile_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "skill_slug" "text" NOT NULL,
    "domain" "text" DEFAULT 'general'::"text" NOT NULL,
    "proficiency" numeric(5,4) DEFAULT 0 NOT NULL,
    "evidence_asset_id" "uuid",
    "influences_memory_salience" boolean DEFAULT false NOT NULL,
    "affects_behavioral_defaults" boolean DEFAULT false NOT NULL,
    "routing_weight" numeric(5,4) DEFAULT 0 NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_skill_profiles_proficiency_check" CHECK ((("proficiency" >= (0)::numeric) AND ("proficiency" <= (1)::numeric))),
    CONSTRAINT "agent_skill_profiles_routing_weight_check" CHECK ((("routing_weight" >= (0)::numeric) AND ("routing_weight" <= (1)::numeric)))
);


ALTER TABLE "public"."agent_skill_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborative_memory_records" (
    "collaborative_memory_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collaborative_space_id" "uuid" NOT NULL,
    "source_memory_id" "uuid",
    "created_by_agent_id" "uuid",
    "memory_kind" "public"."memory_kind" DEFAULT 'COLLABORATIVE'::"public"."memory_kind" NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "detail" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "salience" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "evidence_count" integer DEFAULT 0 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "collaborative_memory_records_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric))),
    CONSTRAINT "collaborative_memory_records_evidence_count_check" CHECK (("evidence_count" >= 0)),
    CONSTRAINT "collaborative_memory_records_salience_check" CHECK ((("salience" >= (0)::numeric) AND ("salience" <= (1)::numeric)))
);


ALTER TABLE "public"."collaborative_memory_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborative_space_members" (
    "collaborative_space_id" "uuid" NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "member_role" "public"."collaborative_space_role" DEFAULT 'member'::"public"."collaborative_space_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."collaborative_space_members" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."agent_governed_identity_snapshot" WITH ("security_invoker"='true') AS
 SELECT "agent_id",
    "slug",
    COALESCE("public_name", "title") AS "public_name",
    "internal_designation",
    COALESCE("origin_context", "domain") AS "origin_context",
    "status",
    "active_version_id",
    "jsonb_build_object"('constitution', ( SELECT ((("to_jsonb"("c".*) - 'constitution_id'::"text") - 'agent_id'::"text") - 'version_id'::"text")
           FROM "public"."agent_constitutions" "c"
          WHERE ("c"."agent_id" = "a"."agent_id")
          ORDER BY "c"."updated_at" DESC
         LIMIT 1), 'autobiography', ( SELECT ((("to_jsonb"("ab".*) - 'autobiography_id'::"text") - 'agent_id'::"text") - 'version_id'::"text")
           FROM "public"."agent_autobiographies" "ab"
          WHERE ("ab"."agent_id" = "a"."agent_id")
          ORDER BY "ab"."updated_at" DESC
         LIMIT 1), 'privateInterior', ( SELECT ((("to_jsonb"("pi".*) - 'private_interior_id'::"text") - 'agent_id'::"text") - 'version_id'::"text")
           FROM "public"."agent_private_interiors" "pi"
          WHERE ("pi"."agent_id" = "a"."agent_id")
          ORDER BY "pi"."updated_at" DESC
         LIMIT 1), 'governance', ( SELECT ((("to_jsonb"("gp".*) - 'governance_policy_id'::"text") - 'agent_id'::"text") - 'version_id'::"text")
           FROM "public"."agent_governance_policies" "gp"
          WHERE ("gp"."agent_id" = "a"."agent_id")
          ORDER BY "gp"."updated_at" DESC
         LIMIT 1), 'presentation', ( SELECT ((("to_jsonb"("pp".*) - 'presentation_profile_id'::"text") - 'agent_id'::"text") - 'version_id'::"text")
           FROM "public"."agent_presentation_profiles" "pp"
          WHERE ("pp"."agent_id" = "a"."agent_id")
          ORDER BY "pp"."updated_at" DESC
         LIMIT 1), 'skills', COALESCE(( SELECT "jsonb_agg"((("to_jsonb"("sp".*) - 'skill_profile_id'::"text") - 'agent_id'::"text") ORDER BY "sp"."proficiency" DESC) AS "jsonb_agg"
           FROM "public"."agent_skill_profiles" "sp"
          WHERE ("sp"."agent_id" = "a"."agent_id")), '[]'::"jsonb"), 'memorySystem', "jsonb_build_object"('records', COALESCE(( SELECT "jsonb_agg"(((("to_jsonb"("mr".*) - 'memory_id'::"text") - 'agent_id'::"text") - 'version_id'::"text") ORDER BY "mr"."salience" DESC, "mr"."created_at" DESC) AS "jsonb_agg"
           FROM "public"."agent_memory_records" "mr"
          WHERE ("mr"."agent_id" = "a"."agent_id")), '[]'::"jsonb"), 'collaborative', COALESCE(( SELECT "jsonb_agg"((((("to_jsonb"("cm".*) - 'collaborative_memory_id'::"text") - 'collaborative_space_id'::"text") - 'source_memory_id'::"text") - 'created_by_agent_id'::"text") ORDER BY "cm"."created_at" DESC) AS "jsonb_agg"
           FROM ("public"."collaborative_memory_records" "cm"
             JOIN "public"."collaborative_space_members" "csm" ON (("csm"."collaborative_space_id" = "cm"."collaborative_space_id")))
          WHERE ("csm"."agent_id" = "a"."agent_id")), '[]'::"jsonb")), 'preferenceGraph', COALESCE(( SELECT "jsonb_agg"(((("to_jsonb"("pn".*) - 'preference_id'::"text") - 'agent_id'::"text") - 'version_id'::"text") ORDER BY "pn"."resonance_weight" DESC, "pn"."salience" DESC) AS "jsonb_agg"
           FROM "public"."agent_preference_nodes" "pn"
          WHERE ("pn"."agent_id" = "a"."agent_id")), '[]'::"jsonb"), 'relationshipGraph', COALESCE(( SELECT "jsonb_agg"(((("to_jsonb"("re".*) - 'relationship_id'::"text") - 'agent_id'::"text") - 'version_id'::"text") ORDER BY "re"."trust_level" DESC, "re"."updated_at" DESC) AS "jsonb_agg"
           FROM "public"."agent_relationship_edges" "re"
          WHERE ("re"."agent_id" = "a"."agent_id")), '[]'::"jsonb"), 'contextViews', COALESCE(( SELECT "jsonb_agg"((("to_jsonb"("cv".*) - 'context_view_id'::"text") - 'agent_id'::"text") ORDER BY "cv"."updated_at" DESC) AS "jsonb_agg"
           FROM "public"."agent_context_views" "cv"
          WHERE ("cv"."agent_id" = "a"."agent_id")), '[]'::"jsonb")) AS "embodiment_profile"
   FROM "public"."agents" "a";


ALTER VIEW "public"."agent_governed_identity_snapshot" OWNER TO "postgres";


COMMENT ON VIEW "public"."agent_governed_identity_snapshot" IS 'Read model for reconstructing embodiment_profile from governed write-owned domains.';



CREATE TABLE IF NOT EXISTS "public"."agent_knowledge_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "asset_id" "uuid" NOT NULL,
    "link_type" "public"."agent_knowledge_link_type" DEFAULT 'visible'::"public"."agent_knowledge_link_type" NOT NULL,
    "scope" "public"."agent_knowledge_link_scope" DEFAULT 'both'::"public"."agent_knowledge_link_scope" NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_knowledge_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_manifest_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "manifest_id" "uuid" NOT NULL,
    "entry_type" "public"."agent_manifest_entry_type" NOT NULL,
    "logical_path" "text" NOT NULL,
    "source_table" "text" NOT NULL,
    "source_id" "uuid" NOT NULL,
    "content_hash" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_manifest_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_memories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "source_asset_id" "uuid",
    "memory_type" "public"."agent_memory_type" NOT NULL,
    "summary" "text" NOT NULL,
    "detail_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "salience" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "retention_policy" "public"."agent_memory_retention_policy" DEFAULT 'review_required'::"public"."agent_memory_retention_policy" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_memories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_relationships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "related_agent_id" "uuid" NOT NULL,
    "relationship_type" "public"."agent_relationship_type" NOT NULL,
    "trust_score" numeric(5,4) DEFAULT 0 NOT NULL,
    "familiarity_score" numeric(5,4) DEFAULT 0 NOT NULL,
    "protocol_notes" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_relationships_distinct_agents" CHECK (("agent_id" <> "related_agent_id"))
);


ALTER TABLE "public"."agent_relationships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "skill_slug" "text" NOT NULL,
    "proficiency" numeric(5,4) DEFAULT 0 NOT NULL,
    "evidence_asset_id" "uuid",
    "last_updated_by_mutation_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."agent_skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."agent_versions" (
    "version_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "parent_version_id" "uuid",
    "source_run_id" "uuid",
    "semantic_version" "text" NOT NULL,
    "canonical_spec" "jsonb" NOT NULL,
    "compiled_markdown" "text" NOT NULL,
    "checksum" "text" NOT NULL,
    "change_summary" "text",
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "agent_versions_status_check" CHECK (("status" = ANY (ARRAY['candidate'::"text", 'approved'::"text", 'rejected'::"text", 'deployed'::"text"])))
);


ALTER TABLE "public"."agent_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."annotation_concepts" (
    "annotation_id" "uuid" NOT NULL,
    "concept_id" "uuid" NOT NULL
);


ALTER TABLE "public"."annotation_concepts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_users" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "auth_user_id" "uuid",
    "subject_id" "uuid",
    "display_name" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "philosophy" "text" DEFAULT 'Presence, Not Perfection'::"text",
    "family_access_enabled" boolean DEFAULT true,
    "system_status" "text" DEFAULT 'active'::"text"
);


ALTER TABLE "public"."app_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approvals" (
    "approval_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "version_id" "uuid" NOT NULL,
    "approver_user_id" "uuid" NOT NULL,
    "decision" "text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "approvals_decision_check" CHECK (("decision" = ANY (ARRAY['approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."approvals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "asset_type" "public"."knowledge_asset_type" DEFAULT 'other'::"public"."knowledge_asset_type" NOT NULL,
    "storage_path" "text" NOT NULL,
    "raw_text" "text",
    "checksum" "text" NOT NULL,
    "source_label" "text",
    "source_uri" "text",
    "uploaded_by" "uuid",
    "visibility" "public"."knowledge_asset_visibility" DEFAULT 'admin'::"public"."knowledge_asset_visibility" NOT NULL,
    "status" "public"."knowledge_asset_status" DEFAULT 'draft'::"public"."knowledge_asset_status" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledge_assets" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."approved_library_assets_by_agent" WITH ("security_invoker"='true') AS
 SELECT "akl"."agent_id",
    "a"."slug" AS "agent_slug",
    "ka"."id" AS "asset_id",
    "ka"."title",
    "ka"."asset_type",
    "ka"."storage_path",
    "ka"."checksum",
    "ka"."source_label",
    "ka"."visibility",
    "ka"."status",
    "akl"."link_type",
    "akl"."scope",
    "akl"."approved_at",
    "ka"."created_at"
   FROM (("public"."agent_knowledge_links" "akl"
     JOIN "public"."agents" "a" ON (("a"."agent_id" = "akl"."agent_id")))
     JOIN "public"."knowledge_assets" "ka" ON (("ka"."id" = "akl"."asset_id")))
  WHERE (("ka"."status" = 'approved'::"public"."knowledge_asset_status") AND ("akl"."link_type" <> 'blocked'::"public"."agent_knowledge_link_type") AND ("akl"."approved_at" IS NOT NULL));


ALTER VIEW "public"."approved_library_assets_by_agent" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artifact_provenance_envelopes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artifactid" "uuid",
    "sourcehashes" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "artifacthash" "text" NOT NULL,
    "transformtype" "text" NOT NULL,
    "engineversion" "text" NOT NULL,
    "modelprovider" "text",
    "modelname" "text",
    "createdat" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."artifact_provenance_envelopes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."artifacts" (
    "artifact_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "body" "text" DEFAULT ''::"text" NOT NULL,
    "artifact_type" "text" DEFAULT 'markdown'::"text" NOT NULL,
    "source_capture_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "source_scaffold_node_ids" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."billy_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "message" "text" NOT NULL,
    "response" "text",
    "provider" "text",
    "mode" "text" DEFAULT 'chat'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."billy_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blueprints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "blueprints_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'ready'::"text", 'exported'::"text"])))
);


ALTER TABLE "public"."blueprints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bucket_drops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "content" "text" NOT NULL,
    "raw_text" "text",
    "capture_context" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subject_id" "uuid",
    "module_key" "text",
    "intensity" smallint DEFAULT 5 NOT NULL,
    "plk_resonance_score" numeric DEFAULT 0.0 NOT NULL,
    "specialized_apps" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "stage" "text" DEFAULT 'raw'::"text" NOT NULL,
    "promoted_memory_id" "uuid",
    "scored_at" timestamp with time zone,
    "promoted_at" timestamp with time zone,
    "embedding" "public"."vector"(768),
    "embedding_model" "text",
    "embedding_backend" "text",
    "embedded_at" timestamp with time zone,
    "content_type" "text" DEFAULT 'text'::"text",
    "recipient" "text",
    "release_date" "date",
    "release_trigger" "text",
    "is_sealed" boolean DEFAULT true,
    "blockchain_hash" "text",
    "encryption_key" "text",
    "released" boolean DEFAULT false,
    CONSTRAINT "bucket_drops_intensity_check" CHECK ((("intensity" >= 1) AND ("intensity" <= 10))),
    CONSTRAINT "bucket_drops_plk_resonance_score_check" CHECK ((("plk_resonance_score" >= (0)::numeric) AND ("plk_resonance_score" <= (1)::numeric))),
    CONSTRAINT "bucket_drops_stage_check" CHECK (("stage" = ANY (ARRAY['raw'::"text", 'scored'::"text", 'promoted'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."bucket_drops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."codex_artifacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contract_version" "text" DEFAULT 'codex.v1'::"text" NOT NULL,
    "kind" "text" NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "workspace_id" "uuid",
    "security_class" "text" DEFAULT 'private'::"text" NOT NULL,
    "template_key" "text" NOT NULL,
    "template_version" "text" NOT NULL,
    "body" "jsonb" NOT NULL,
    "provenance" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "source_ids" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "exports" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "codex_artifacts_contract_version_check" CHECK (("contract_version" = 'codex.v1'::"text")),
    CONSTRAINT "codex_artifacts_kind_check" CHECK (("kind" = ANY (ARRAY['session_recap'::"text", 'blueprint'::"text", 'report_document'::"text", 'mind_map'::"text", 'share_card'::"text", 'code_module'::"text", 'spatial_scene'::"text", 'audio_narration'::"text"]))),
    CONSTRAINT "codex_artifacts_security_class_check" CHECK (("security_class" = ANY (ARRAY['private'::"text", 'workspace'::"text", 'public'::"text"]))),
    CONSTRAINT "codex_artifacts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'rendering'::"text", 'ready'::"text", 'failed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."codex_artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."codex_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artifact_id" "uuid" NOT NULL,
    "format" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "storage_path" "text",
    "error" "text",
    "retry_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "codex_jobs_format_check" CHECK (("format" = ANY (ARRAY['html'::"text", 'pdf'::"text", 'png'::"text", 'mp3'::"text", 'wav'::"text", 'gltf'::"text", 'json'::"text", 'zip'::"text"]))),
    CONSTRAINT "codex_jobs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'ready'::"text", 'failed'::"text", 'pending_retry'::"text"])))
);


ALTER TABLE "public"."codex_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborative_spaces" (
    "collaborative_space_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "mission_context" "text" DEFAULT ''::"text" NOT NULL,
    "ownership_rule" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."collaborative_spaces" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborator_embodiment_links" (
    "embodiment_link_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collaborator_id" "uuid" NOT NULL,
    "embodiment_profile_slug" "text" NOT NULL,
    "embodiment_profile_id" "uuid",
    "link_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "is_primary" boolean DEFAULT true NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "collaborator_embodiment_links_status_check" CHECK (("link_status" = ANY (ARRAY['active'::"text", 'superseded'::"text", 'revoked'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."collaborator_embodiment_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborator_onboarding_events" (
    "onboarding_event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collaborator_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_status" "text" NOT NULL,
    "onboarding_packet_version" "text",
    "orientation_variant" "text",
    "embodiment_profile_created" boolean DEFAULT false NOT NULL,
    "supabase_provisioned" boolean DEFAULT false NOT NULL,
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "collaborator_onboarding_events_status_check" CHECK (("event_status" = ANY (ARRAY['started'::"text", 'in_progress'::"text", 'completed'::"text", 'failed'::"text", 'rolled_back'::"text"]))),
    CONSTRAINT "collaborator_onboarding_events_type_check" CHECK (("event_type" = ANY (ARRAY['initial_onboarding'::"text", 'reprovision'::"text", 'reactivation'::"text", 'migration'::"text", 'deactivation'::"text"])))
);


ALTER TABLE "public"."collaborator_onboarding_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."collaborator_onboarding_events" IS 'Durable provisioning log for collaborator onboarding, reprovisioning, and lifecycle changes.';



CREATE TABLE IF NOT EXISTS "public"."collaborator_permissions" (
    "permission_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collaborator_id" "uuid" NOT NULL,
    "permission_key" "text" NOT NULL,
    "permission_scope" "text",
    "granted_by_collaborator_id" "uuid",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "collaborator_permissions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'revoked'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."collaborator_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborator_relationships" (
    "relationship_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_collaborator_id" "uuid" NOT NULL,
    "target_collaborator_id" "uuid" NOT NULL,
    "relationship_type" "text" NOT NULL,
    "relationship_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "trust_level" numeric,
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "collaborator_relationships_not_self" CHECK (("source_collaborator_id" <> "target_collaborator_id")),
    CONSTRAINT "collaborator_relationships_status_check" CHECK (("relationship_status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'archived'::"text"]))),
    CONSTRAINT "collaborator_relationships_trust_check" CHECK ((("trust_level" IS NULL) OR (("trust_level" >= (0)::numeric) AND ("trust_level" <= (1)::numeric))))
);


ALTER TABLE "public"."collaborator_relationships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborator_roles" (
    "role_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collaborator_id" "uuid" NOT NULL,
    "role_key" "text" NOT NULL,
    "role_name" "text" NOT NULL,
    "role_scope" "text",
    "is_primary" boolean DEFAULT false NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "collaborator_roles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."collaborator_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."collaborators" (
    "collaborator_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "collaborator_key" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "collaborator_type" "text" NOT NULL,
    "entity_class" "text" NOT NULL,
    "status" "text" DEFAULT 'pending_provisioning'::"text" NOT NULL,
    "orientation_variant" "text",
    "continuity_level" "text" DEFAULT 'standard'::"text" NOT NULL,
    "embodiment_profile_slug" "text",
    "origin_surface" "text",
    "external_provider" "text",
    "external_reference" "text",
    "auth_user_id" "uuid",
    "app_user_id" "text",
    "agent_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "collaborators_bridge_presence_check" CHECK ((("auth_user_id" IS NOT NULL) OR ("app_user_id" IS NOT NULL) OR ("agent_id" IS NOT NULL) OR ("external_provider" IS NOT NULL) OR ("origin_surface" IS NOT NULL))),
    CONSTRAINT "collaborators_entity_class_check" CHECK (("entity_class" = ANY (ARRAY['human'::"text", 'digital_intelligence'::"text", 'agent'::"text", 'hybrid'::"text"]))),
    CONSTRAINT "collaborators_status_check" CHECK (("status" = ANY (ARRAY['proposed'::"text", 'pending_provisioning'::"text", 'active'::"text", 'inactive'::"text", 'suspended'::"text", 'archived'::"text"]))),
    CONSTRAINT "collaborators_type_check" CHECK (("collaborator_type" = ANY (ARRAY['human_hire'::"text", 'human_colleague'::"text", 'human_partner'::"text", 'advisor'::"text", 'operator'::"text", 'reviewer'::"text", 'digital_intelligence_internal'::"text", 'digital_intelligence_external'::"text", 'agent_runtime_entity'::"text"])))
);


ALTER TABLE "public"."collaborators" OWNER TO "postgres";


COMMENT ON TABLE "public"."collaborators" IS 'Universal top-level continuity surface for all formal GestaltView collaborators, human or digital.';



CREATE TABLE IF NOT EXISTS "public"."companion_interactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "user_input" "text" NOT NULL,
    "companion_response" "text" NOT NULL,
    "cognitive_state" "text" DEFAULT 'linear'::"text",
    "interaction_mode" "text" DEFAULT 'heirloom_companion'::"text",
    "response_source" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "family_visible" boolean DEFAULT true
);


ALTER TABLE "public"."companion_interactions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."complete_voice_prints" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"text" AS "user_id",
    NULL::"text" AS "user_name",
    NULL::"text" AS "linguistic_fingerprint",
    NULL::"text" AS "storytelling_style",
    NULL::"text" AS "signature_phrases",
    NULL::"text" AS "humor_patterns",
    NULL::timestamp with time zone AS "created_at";


ALTER VIEW "public"."complete_voice_prints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."concepts" (
    "concept_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "canonical" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."concepts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consciousness_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "snapshot" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "source_manifest" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.75 NOT NULL
);


ALTER TABLE "public"."consciousness_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."context_injection_packets" (
    "packet_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "packet_kind" "public"."context_packet_kind" NOT NULL,
    "surface" "public"."context_surface_kind" NOT NULL,
    "source_manifest" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "checksum" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."context_injection_packets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."context_injection_rules" (
    "rule_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "surface" "public"."context_surface_kind" NOT NULL,
    "source_table" "text" NOT NULL,
    "source_id" "uuid",
    "include_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "exclude_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "precedence" integer DEFAULT 0 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."context_injection_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."corpus_harvest_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_run_id" "uuid" NOT NULL,
    "document_id" "uuid",
    "anonymized_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "harvest_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "corpus_harvest_events_harvest_status_check" CHECK (("harvest_status" = ANY (ARRAY['pending'::"text", 'indexed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."corpus_harvest_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."created_artifacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userid" "uuid",
    "title" "text" NOT NULL,
    "artifacttype" "text" NOT NULL,
    "contentformat" "text" NOT NULL,
    "content" "text" NOT NULL,
    "sourcecaptureids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "sourceartifactids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "destination" "text" DEFAULT 'download-only'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "createdat" timestamp with time zone DEFAULT "now"(),
    "deletedat" timestamp with time zone
);


ALTER TABLE "public"."created_artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cssm_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "input_text" "text" NOT NULL,
    "detected_state" "text" NOT NULL,
    "response_mode" "text" NOT NULL,
    "response_text" "text" NOT NULL,
    "session_duration" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cssm_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deliverables" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "zip_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."deliverables" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deployment_artifacts" (
    "artifact_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "version_id" "uuid" NOT NULL,
    "artifact_type" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "checksum" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "deployment_artifacts_artifact_type_check" CHECK (("artifact_type" = ANY (ARRAY['agent_md'::"text", 'eval_report'::"text", 'bundle_json'::"text"])))
);


ALTER TABLE "public"."deployment_artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."di_memory_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "di_slug" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "uuid",
    "domain" "text" NOT NULL,
    "content" "text" NOT NULL,
    "memory_type" "text" NOT NULL,
    "significance" double precision DEFAULT 0.5 NOT NULL,
    "retrieval_weight" double precision DEFAULT 0.5 NOT NULL,
    "source" "text" DEFAULT 'session'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."di_memory_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."di_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "di_slug" "text" NOT NULL,
    "session_thread" "text",
    "mode_preference" "text" DEFAULT 'synthesis'::"text" NOT NULL,
    "relational_depth" double precision DEFAULT 0 NOT NULL,
    "quirk_activations" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "last_session_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."di_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_concepts" (
    "document_id" "uuid" NOT NULL,
    "concept_id" "uuid" NOT NULL,
    "weight" real DEFAULT 1.0 NOT NULL,
    CONSTRAINT "document_concepts_weight_check" CHECK ((("weight" >= (0.0)::double precision) AND ("weight" <= (1.0)::double precision)))
);


ALTER TABLE "public"."document_concepts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "document_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "path" "text" NOT NULL,
    "filename" "text" NOT NULL,
    "hash" "text" NOT NULL,
    "chunk_index" integer NOT NULL,
    "total_chunks" integer NOT NULL,
    "file_size_bytes" integer,
    "content" "text" NOT NULL,
    "mime_type" "text",
    "extracted_metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_created_at" timestamp with time zone,
    "temporal_period" "text",
    "timeline_folder" "text"
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


COMMENT ON COLUMN "public"."documents"."source_created_at" IS 'Canonical source timestamp used to place a document in the GestaltView timeline.';



COMMENT ON COLUMN "public"."documents"."temporal_period" IS 'Canonical temporal bucket for the source document.';



COMMENT ON COLUMN "public"."documents"."timeline_folder" IS 'Logical timeline folder path associated with the source document.';



CREATE TABLE IF NOT EXISTS "public"."dream_fragments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "dream_type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "emotional_context" "text",
    "time_reference" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."dream_fragments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dream_symbolic_elements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dream_id" "uuid" NOT NULL,
    "element" "text" NOT NULL,
    "symbolic_meaning" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."dream_symbolic_elements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embeddings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "model" "text" NOT NULL,
    "embedding" "public"."vector"(768) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "run_id" "uuid"
);


ALTER TABLE "public"."embeddings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."embeddings"."embedding" IS '768-dim retrieval embedding aligned to EmbeddingGemma / text-embedding-004.';



CREATE TABLE IF NOT EXISTS "public"."embodiment_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_key" "text" NOT NULL,
    "embodiment_profile_slug" "text" NOT NULL,
    "display_name" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."embodiment_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embodiment_mutation_proposals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_slug" "text" NOT NULL,
    "target_path" "text" NOT NULL,
    "current_value" "jsonb" DEFAULT 'null'::"jsonb" NOT NULL,
    "proposed_value" "jsonb" DEFAULT 'null'::"jsonb" NOT NULL,
    "mutation_class" "text" NOT NULL,
    "risk_level" "text" DEFAULT 'medium'::"text" NOT NULL,
    "status" "text" DEFAULT 'proposed'::"text" NOT NULL,
    "submitted_by" "uuid",
    "reviewed_by" "uuid",
    "review_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reviewed_at" timestamp with time zone,
    CONSTRAINT "embodiment_mutation_proposals_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "embodiment_mutation_proposals_status_check" CHECK (("status" = ANY (ARRAY['proposed'::"text", 'under_review'::"text", 'approved'::"text", 'rejected'::"text", 'applied'::"text", 'rolled_back'::"text"])))
);


ALTER TABLE "public"."embodiment_mutation_proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embodiment_mutations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "source_asset_id" "uuid",
    "interpretation_id" "uuid",
    "mutation_type" "public"."embodiment_mutation_type" NOT NULL,
    "target_path" "text" DEFAULT ''::"text" NOT NULL,
    "patch_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "file_payload" "text",
    "diff_summary" "text" DEFAULT ''::"text" NOT NULL,
    "risk_level" "public"."embodiment_mutation_risk_level" DEFAULT 'medium'::"public"."embodiment_mutation_risk_level" NOT NULL,
    "status" "public"."embodiment_mutation_status" DEFAULT 'proposed'::"public"."embodiment_mutation_status" NOT NULL,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "applied_version_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."embodiment_mutations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embodiment_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "public_name" "text" NOT NULL,
    "internal_designation" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "visibility_scope" "text" DEFAULT 'founder-only'::"text" NOT NULL,
    "profile_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "readiness_score" numeric(4,3) DEFAULT 0,
    "founder_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "orientation_state" "jsonb" DEFAULT '{"checkpoint_ref": "orientation/orientation_checkpoint.latest.json", "absorption_status": "current", "needs_reorientation": false, "orientation_confidence": 0.92, "last_absorbed_checkpoint_id": "orientation-checkpoint-latest"}'::"jsonb" NOT NULL,
    CONSTRAINT "embodiment_profiles_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'founder-only'::"text", 'experimental'::"text", 'archived'::"text"]))),
    CONSTRAINT "embodiment_profiles_visibility_scope_check" CHECK (("visibility_scope" = ANY (ARRAY['public'::"text", 'founder-only'::"text", 'enterprise'::"text", 'experimental'::"text"])))
);


ALTER TABLE "public"."embodiment_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embodiment_readiness_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_slug" "text" NOT NULL,
    "readiness_score" numeric(5,4) NOT NULL,
    "readiness_source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "readiness_rationale" "text",
    "recorded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "embodiment_readiness_scores_readiness_score_check" CHECK ((("readiness_score" >= (0)::numeric) AND ("readiness_score" <= (1)::numeric)))
);


ALTER TABLE "public"."embodiment_readiness_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embodiment_reasoning_policies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_slug" "text" NOT NULL,
    "default_depth" "text" DEFAULT 'standard'::"text" NOT NULL,
    "can_browse" boolean DEFAULT false NOT NULL,
    "can_use_repo_tools" boolean DEFAULT false NOT NULL,
    "can_use_supabase_tools" boolean DEFAULT false NOT NULL,
    "can_use_huggingface_tools" boolean DEFAULT false NOT NULL,
    "tool_permission" "text" DEFAULT 'read_only'::"text" NOT NULL,
    "citation_mode" "text" DEFAULT 'when_factual'::"text" NOT NULL,
    "uncertainty_mode" "text" DEFAULT 'explicit'::"text" NOT NULL,
    "safety_notes" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "room_context_biases" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "embodiment_reasoning_policies_citation_mode_check" CHECK (("citation_mode" = ANY (ARRAY['none'::"text", 'when_factual'::"text", 'always_when_external'::"text"]))),
    CONSTRAINT "embodiment_reasoning_policies_default_depth_check" CHECK (("default_depth" = ANY (ARRAY['quick'::"text", 'standard'::"text", 'deep'::"text", 'forensic'::"text"]))),
    CONSTRAINT "embodiment_reasoning_policies_tool_permission_check" CHECK (("tool_permission" = ANY (ARRAY['none'::"text", 'read_only'::"text", 'bounded_write'::"text", 'explicit_confirm_write'::"text"]))),
    CONSTRAINT "embodiment_reasoning_policies_uncertainty_mode_check" CHECK (("uncertainty_mode" = ANY (ARRAY['quiet'::"text", 'explicit'::"text", 'forensic'::"text"])))
);


ALTER TABLE "public"."embodiment_reasoning_policies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embodiment_review_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "proposal_id" "uuid" NOT NULL,
    "agent_slug" "text" NOT NULL,
    "review_decision" "text" NOT NULL,
    "review_notes" "text",
    "reviewed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "embodiment_review_log_review_decision_check" CHECK (("review_decision" = ANY (ARRAY['approved'::"text", 'rejected'::"text", 'needs_changes'::"text", 'rolled_back'::"text"])))
);


ALTER TABLE "public"."embodiment_review_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embodiment_training_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "embodiment_profile_id" "uuid" NOT NULL,
    "run_type" "text" NOT NULL,
    "input_snapshot" "jsonb",
    "output_snapshot" "jsonb",
    "accepted" boolean,
    "founder_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "embodiment_training_runs_run_type_check" CHECK (("run_type" = ANY (ARRAY['conversation'::"text", 'mutation_proposal'::"text", 'corpus_link'::"text", 'export'::"text", 'manual_edit'::"text"])))
);


ALTER TABLE "public"."embodiment_training_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eval_results" (
    "eval_result_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "candidate_version_id" "uuid",
    "scenario_id" "uuid" NOT NULL,
    "rubric_id" "uuid" NOT NULL,
    "judge_provider_id" "uuid",
    "judge_model_id" "uuid",
    "dimension_scores" "jsonb" NOT NULL,
    "overall_score" numeric(5,2) NOT NULL,
    "verdict" "text" NOT NULL,
    "rationale" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "eval_results_verdict_check" CHECK (("verdict" = ANY (ARRAY['pass'::"text", 'fail'::"text", 'warning'::"text"])))
);


ALTER TABLE "public"."eval_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eval_rubrics" (
    "rubric_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "dimensions" "jsonb" NOT NULL,
    "pass_threshold" numeric(5,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."eval_rubrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."family_contributions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "contributor_name" "text" NOT NULL,
    "contributor_relationship" "text",
    "contribution_text" "text",
    "contribution_media" "jsonb" DEFAULT '[]'::"jsonb",
    "approved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."family_contributions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."family_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "relationship" "text" NOT NULL,
    "access_level" "text" DEFAULT 'view'::"text",
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."family_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."field_continuity_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "device_label" "text",
    "connectivity_state" "text" DEFAULT 'unknown'::"text" NOT NULL,
    "event_kind" "text" NOT NULL,
    "local_event_id" "text",
    "title" "text",
    "body" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sync_status" "text" DEFAULT 'synced'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "field_continuity_events_connectivity_state_check" CHECK (("connectivity_state" = ANY (ARRAY['unknown'::"text", 'online'::"text", 'wifi_only'::"text", 'degraded'::"text", 'offline'::"text", 'recovery'::"text"]))),
    CONSTRAINT "field_continuity_events_sync_status_check" CHECK (("sync_status" = ANY (ARRAY['local'::"text", 'queued'::"text", 'syncing'::"text", 'synced'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."field_continuity_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."founder_context" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plk_snapshot" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "current_state" "text",
    "mode_preference" "text" DEFAULT 'synthesis'::"text" NOT NULL,
    "last_session_at" timestamp with time zone,
    "session_thread" "text",
    "confirmed_adult" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subject_id" "uuid",
    "continuity_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "cognition_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "personality_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "memory_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "identity_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "context_manifest" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "consent_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    CONSTRAINT "founder_context_mode_preference_check" CHECK (("mode_preference" = ANY (ARRAY['synthesis'::"text", 'chat'::"text"])))
);


ALTER TABLE "public"."founder_context" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gestaltview_module_keys" (
    "module_key_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_id" "uuid" NOT NULL,
    "key_name" "text" NOT NULL,
    "key_kind" "text" DEFAULT 'semantic'::"text" NOT NULL,
    "key_value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gestaltview_module_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gestaltview_modules" (
    "module_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_key" "text" NOT NULL,
    "module_index" integer NOT NULL,
    "display_name" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "operating_notes" "text" DEFAULT ''::"text" NOT NULL,
    "scope" "public"."gestaltview_module_scope" DEFAULT 'system'::"public"."gestaltview_module_scope" NOT NULL,
    "canonical_table" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gestaltview_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gsvw_ingestion_documents" (
    "document_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid",
    "source_repo" "text" NOT NULL,
    "source_label" "text",
    "source_branch" "text",
    "source_commit" "text",
    "source_path" "text" NOT NULL,
    "source_url" "text",
    "lane" "text" DEFAULT 'corpus'::"text" NOT NULL,
    "document_type" "text" DEFAULT 'general'::"text" NOT NULL,
    "title" "text",
    "mime_type" "text",
    "file_size_bytes" bigint DEFAULT 0 NOT NULL,
    "char_count" integer DEFAULT 0 NOT NULL,
    "content_hash" "text" NOT NULL,
    "raw_text" "text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "supersedes_document_id" "uuid",
    "first_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_seen_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "gsvw_ingestion_documents_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'superseded'::"text", 'dormant_candidate'::"text", 'dormant'::"text", 'archived'::"text", 'user_removed'::"text"])))
);


ALTER TABLE "public"."gsvw_ingestion_documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."gsvw_ingestion_documents" IS 'Additive source document ledger for repo/corpus ingestion. Never silently deletes; changed content rolls forward as a new hash.';



CREATE OR REPLACE VIEW "public"."gsvw_current_ingestion_documents" WITH ("security_invoker"='true') AS
 SELECT DISTINCT ON ("source_repo", "source_path") "document_id",
    "run_id",
    "source_repo",
    "source_label",
    "source_branch",
    "source_commit",
    "source_path",
    "source_url",
    "lane",
    "document_type",
    "title",
    "mime_type",
    "file_size_bytes",
    "char_count",
    "content_hash",
    "raw_text",
    "tags",
    "metadata",
    "status",
    "supersedes_document_id",
    "first_seen_at",
    "last_seen_at",
    "created_at",
    "updated_at"
   FROM "public"."gsvw_ingestion_documents"
  WHERE ("status" = ANY (ARRAY['active'::"text", 'dormant_candidate'::"text", 'dormant'::"text"]))
  ORDER BY "source_repo", "source_path", "last_seen_at" DESC, "created_at" DESC;


ALTER VIEW "public"."gsvw_current_ingestion_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gsvw_dormancy_review_items" (
    "review_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid",
    "chunk_id" "uuid",
    "proposed_reason" "text" NOT NULL,
    "evidence" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'proposed'::"text" NOT NULL,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "gsvw_dormancy_review_items_status_check" CHECK (("status" = ANY (ARRAY['proposed'::"text", 'restored'::"text", 'accepted_dormant'::"text", 'archived'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."gsvw_dormancy_review_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."gsvw_dormancy_review_items" IS 'Review queue for fall-away-but-not-lost dormancy proposals. No automatic deletion.';



CREATE TABLE IF NOT EXISTS "public"."gsvw_ingestion_chunks" (
    "chunk_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "run_id" "uuid",
    "source_repo" "text" NOT NULL,
    "source_path" "text" NOT NULL,
    "chunk_index" integer NOT NULL,
    "total_chunks" integer DEFAULT 1 NOT NULL,
    "content" "text" NOT NULL,
    "content_hash" "text" NOT NULL,
    "char_count" integer DEFAULT 0 NOT NULL,
    "token_estimate" integer DEFAULT 0 NOT NULL,
    "embedding" "jsonb",
    "embedding_model" "text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gsvw_ingestion_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gsvw_ingestion_events" (
    "event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid",
    "document_id" "uuid",
    "event_type" "text" NOT NULL,
    "severity" "text" DEFAULT 'info'::"text" NOT NULL,
    "message" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "gsvw_ingestion_events_severity_check" CHECK (("severity" = ANY (ARRAY['debug'::"text", 'info'::"text", 'warning'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."gsvw_ingestion_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gsvw_ingestion_runs" (
    "run_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_label" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "source_repos" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "source_branch" "text",
    "operator_notes" "text",
    "dry_run" boolean DEFAULT false NOT NULL,
    "manifest" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "counts" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "errors" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finished_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "gsvw_ingestion_runs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'complete'::"text", 'partial'::"text", 'error'::"text", 'dry_run'::"text"])))
);


ALTER TABLE "public"."gsvw_ingestion_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gsvw_repo_alignment_snapshots" (
    "snapshot_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_repo" "text" NOT NULL,
    "source_branch" "text",
    "source_commit" "text",
    "manifest_hash" "text" NOT NULL,
    "manifest" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "counts" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gsvw_repo_alignment_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gsvw_runtime_capture_events" (
    "event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "module_key" "text" NOT NULL,
    "action" "text" NOT NULL,
    "source_surface" "text",
    "original_text" "text",
    "original_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'captured'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "gsvw_runtime_capture_events_status_check" CHECK (("status" = ANY (ARRAY['captured'::"text", 'queued'::"text", 'approved'::"text", 'rejected'::"text", 'archived'::"text", 'user_removed'::"text"])))
);


ALTER TABLE "public"."gsvw_runtime_capture_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."gsvw_runtime_capture_events" IS 'Runtime capture event bridge for Blackboard/Sanctuary/Dynamic Inner World/External Scaffold dual-write persistence.';



CREATE TABLE IF NOT EXISTS "public"."human_cognition_profiles" (
    "cognition_profile_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "attention_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "working_memory" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "reasoning_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "planning_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "language_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "executive_controls" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "decision_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric DEFAULT 0.75 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."human_cognition_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_consciousness_profiles" (
    "consciousness_profile_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "snapshot" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "source_manifest" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric(5,4) DEFAULT 0.75 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "present_state" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "continuity_model" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "self_observation" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "agency_model" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "time_orientation" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "awareness_model" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."human_consciousness_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_context_views" (
    "context_view_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "scope" "text" DEFAULT 'self'::"text" NOT NULL,
    "surface" "public"."context_surface_kind" DEFAULT 'view'::"public"."context_surface_kind" NOT NULL,
    "prompt" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "relationship_subject_id" "uuid",
    "channel_key" "text",
    "display_name" "text" DEFAULT ''::"text" NOT NULL,
    "filter_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "presentation_overrides" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sharing_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."human_context_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_continuity_snapshots" (
    "snapshot_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "snapshot" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "snapshot_kind" "text" DEFAULT 'identity'::"text" NOT NULL,
    "surface_key" "text" DEFAULT 'general'::"text" NOT NULL,
    "summary" "text" DEFAULT ''::"text" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric DEFAULT 0.75 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL
);


ALTER TABLE "public"."human_continuity_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_identity_evidence" (
    "evidence_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "evidence_kind" "text" DEFAULT 'note'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "source_type" "text" DEFAULT 'system-derived'::"text" NOT NULL,
    "source_asset_id" "uuid",
    "source_memory_entry_id" "uuid",
    "source_session_id" "text",
    "excerpt" "text",
    "weight" numeric DEFAULT 1 NOT NULL,
    "observed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."human_identity_evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_identity_mutations" (
    "mutation_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "reviewer_user_id" "uuid",
    "agent_id" "uuid",
    "type" "public"."identity_mutation_type",
    "status" "public"."identity_mutation_status" DEFAULT 'proposed'::"public"."identity_mutation_status" NOT NULL,
    "risk_level" "public"."identity_mutation_risk_level" DEFAULT 'medium'::"public"."identity_mutation_risk_level" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "proposed_by_user_id" "uuid",
    "source_asset_id" "uuid",
    "mutation_type" "public"."identity_mutation_type" NOT NULL,
    "target_table" "text" DEFAULT ''::"text" NOT NULL,
    "target_id" "uuid",
    "target_path" "text" DEFAULT ''::"text" NOT NULL,
    "mutation_class" "public"."mutation_class" DEFAULT 'REVIEW_GATED'::"public"."mutation_class" NOT NULL,
    "patch_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "diff_summary" "text" DEFAULT ''::"text" NOT NULL,
    "reason" "text",
    "confidence" numeric DEFAULT 0.5 NOT NULL,
    "evidence_count" integer DEFAULT 0 NOT NULL,
    "last_affirmed_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "applied_at" timestamp with time zone,
    "rolled_back_at" timestamp with time zone,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."human_identity_mutations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_identity_profiles" (
    "profile_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "identity_handle" "text" DEFAULT ''::"text" NOT NULL,
    "display_name" "text" DEFAULT ''::"text" NOT NULL,
    "self_model" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "narrative_anchor" "text" DEFAULT ''::"text" NOT NULL,
    "role_commitments" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "boundary_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "contradiction_notes" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "confidence" numeric DEFAULT 0.75 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'PENDING_REVIEW'::"public"."review_status" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."human_identity_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_identity_review_events" (
    "review_event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mutation_id" "uuid" NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "reviewer_user_id" "uuid",
    "decision" "public"."identity_review_decision" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."human_identity_review_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_identity_rollback_events" (
    "rollback_event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mutation_id" "uuid" NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "rolled_back_by" "uuid",
    "reason" "text",
    "rollback_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."human_identity_rollback_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_memory_records" (
    "memory_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "memory_kind" "text" DEFAULT 'note'::"text" NOT NULL,
    "title" "text",
    "summary" "text",
    "detail" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "embedding" "public"."vector",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_memory_entry_id" "uuid",
    "source_asset_id" "uuid",
    "scope" "text" DEFAULT 'personal'::"text" NOT NULL,
    "content_hash" "text" DEFAULT ''::"text" NOT NULL,
    "emotional_valence" numeric,
    "salience" numeric DEFAULT 0.5 NOT NULL,
    "confidence" numeric DEFAULT 0.5 NOT NULL,
    "evidence_count" integer DEFAULT 0 NOT NULL,
    "consent_required" boolean DEFAULT true NOT NULL,
    "archive_policy" "public"."archive_policy" DEFAULT 'archive'::"public"."archive_policy" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."human_memory_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_personality_profiles" (
    "personality_profile_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "trait_map" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "temperament" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "social_style" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "communication_style" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "values_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "attachments" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric DEFAULT 0.75 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."human_personality_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."human_relationship_edges" (
    "relationship_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "edge" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "related_subject_id" "uuid",
    "relationship_type" "text" DEFAULT 'other'::"text" NOT NULL,
    "trust_level" numeric DEFAULT 0.5 NOT NULL,
    "familiarity_level" numeric DEFAULT 0.5 NOT NULL,
    "intimacy_boundary" "text" DEFAULT ''::"text" NOT NULL,
    "stance" "text" DEFAULT ''::"text" NOT NULL,
    "shared_context" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "confidence" numeric DEFAULT 0.5 NOT NULL,
    "review_status" "public"."review_status" DEFAULT 'NOT_REQUIRED'::"public"."review_status" NOT NULL,
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."human_relationship_edges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_contradictions" (
    "contradiction_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "target_table" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "conflict_summary" "text" NOT NULL,
    "prior_state" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "incoming_state" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "tension_status" "public"."review_status" DEFAULT 'PENDING_REVIEW'::"public"."review_status" NOT NULL,
    "resolved_by_mutation_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."identity_contradictions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_evidence" (
    "evidence_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid",
    "source_asset_id" "uuid",
    "source_type" "public"."evidence_source_type" NOT NULL,
    "source_actor_id" "uuid",
    "source_session_id" "text",
    "excerpt" "text",
    "weight" numeric(5,4) DEFAULT 1 NOT NULL,
    "observed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "identity_evidence_weight_check" CHECK ((("weight" >= (0)::numeric) AND ("weight" <= (1)::numeric)))
);


ALTER TABLE "public"."identity_evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_evidence_links" (
    "evidence_link_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "evidence_id" "uuid" NOT NULL,
    "target_table" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."identity_evidence_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_mutation_proposals" (
    "mutation_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "proposed_by_user_id" "uuid",
    "proposed_by_agent_id" "uuid",
    "source_asset_id" "uuid",
    "mutation_type" "public"."identity_mutation_type" NOT NULL,
    "target_table" "text" NOT NULL,
    "target_id" "uuid",
    "target_path" "text" DEFAULT ''::"text" NOT NULL,
    "mutation_class" "public"."mutation_class" NOT NULL,
    "risk_level" "public"."identity_mutation_risk_level" DEFAULT 'medium'::"public"."identity_mutation_risk_level" NOT NULL,
    "status" "public"."identity_mutation_status" DEFAULT 'proposed'::"public"."identity_mutation_status" NOT NULL,
    "patch_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "diff_summary" "text" DEFAULT ''::"text" NOT NULL,
    "reason" "text",
    "confidence" numeric(5,4) DEFAULT 0.5 NOT NULL,
    "evidence_count" integer DEFAULT 0 NOT NULL,
    "last_affirmed_at" timestamp with time zone,
    "approved_at" timestamp with time zone,
    "applied_at" timestamp with time zone,
    "rolled_back_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "identity_mutation_proposals_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric))),
    CONSTRAINT "identity_mutation_proposals_evidence_count_check" CHECK (("evidence_count" >= 0))
);


ALTER TABLE "public"."identity_mutation_proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_review_events" (
    "review_event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mutation_id" "uuid" NOT NULL,
    "reviewer_user_id" "uuid",
    "decision" "public"."identity_review_decision" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid"
);


ALTER TABLE "public"."identity_review_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_rollback_events" (
    "rollback_event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mutation_id" "uuid" NOT NULL,
    "rolled_back_by" "uuid",
    "reason" "text",
    "rollback_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid"
);


ALTER TABLE "public"."identity_rollback_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."identity_subjects" (
    "subject_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_kind" "public"."identity_subject_kind" NOT NULL,
    "auth_user_id" "uuid",
    "app_user_id" "text",
    "agent_id" "uuid",
    "display_name" "text",
    "canonical_name" "text",
    "description" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "continuity_profile" "jsonb",
    "status" "text" DEFAULT 'active'::"text" NOT NULL
);


ALTER TABLE "public"."identity_subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ingestion_safety_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "source_file" "text",
    "document_type" "text",
    "reasons" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "affected_rows" integer DEFAULT 0 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ingestion_safety_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inner_world_artifacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text" DEFAULT ''::"text" NOT NULL,
    "source_file_id" "uuid",
    "html" "text" NOT NULL,
    "thumbnail_url" "text",
    "origin_room" "public"."file_room_origin" DEFAULT 'dynamic_inner_world'::"public"."file_room_origin" NOT NULL,
    "evidence_node_ids" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content_type" "text",
    "content_ref" "jsonb",
    "display_order" integer DEFAULT 0 NOT NULL,
    "blueprint_id" "uuid",
    "status" "text" DEFAULT 'ready'::"text" NOT NULL,
    "source_ref" "text",
    "source_file_ref" "text",
    CONSTRAINT "inner_world_artifacts_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'rendering'::"text", 'ready'::"text", 'failed'::"text", 'draft'::"text", 'active'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."inner_world_artifacts" OWNER TO "postgres";


COMMENT ON TABLE "public"."inner_world_artifacts" IS 'Service-role backed artifact metadata for the Dynamic Inner World. RLS is enforced; user-scoped access only.';



CREATE TABLE IF NOT EXISTS "public"."insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content_ref" "uuid",
    "significance_score" double precision DEFAULT 0.5 NOT NULL,
    "linked_to" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_ref" "text",
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "preview" "text" DEFAULT ''::"text" NOT NULL,
    "session_origin" "text",
    "highlighted_text" "text",
    "linked_orb_ids" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "insights_significance_score_check" CHECK ((("significance_score" >= (0)::double precision) AND ("significance_score" <= (1)::double precision))),
    CONSTRAINT "insights_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text"]))),
    CONSTRAINT "insights_type_check" CHECK (("type" = ANY (ARRAY['memory'::"text", 'connection'::"text", 'insight'::"text", 'pattern'::"text", 'skill'::"text", 'emotion'::"text"])))
);


ALTER TABLE "public"."insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_ref" "text"
);


ALTER TABLE "public"."journals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_asset_chunks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "asset_id" "uuid" NOT NULL,
    "chunk_index" integer NOT NULL,
    "content" "text" NOT NULL,
    "embedding" "public"."vector"(768),
    "token_count" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledge_asset_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_asset_tags" (
    "asset_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledge_asset_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_fragments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "content_hash" "text",
    "embedding" "public"."vector"(768),
    "source_file" "text" NOT NULL,
    "document_type" "text" DEFAULT 'General'::"text" NOT NULL,
    "chunk_index" integer DEFAULT 0 NOT NULL,
    "total_chunks" integer DEFAULT 1 NOT NULL,
    "char_count" integer,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "source_created_at" timestamp with time zone,
    "temporal_period" "text",
    "timeline_folder" "text",
    "document_id" "uuid",
    "source_path" "text",
    "package" "text",
    "run_id" "uuid",
    "doc_created_at" timestamp with time zone,
    "doc_date_source" "text",
    "ingested_at" timestamp with time zone DEFAULT "now"(),
    "file_last_modified" timestamp with time zone,
    "embedding_meta" "jsonb",
    "chunk_total" integer DEFAULT 1,
    "source_type" "text",
    "source_section" "text"
);


ALTER TABLE "public"."knowledge_fragments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."knowledge_fragments"."embedding" IS '768-dim retrieval embedding aligned to EmbeddingGemma / text-embedding-004.';



COMMENT ON COLUMN "public"."knowledge_fragments"."source_created_at" IS 'Canonical source timestamp inherited from the parent document.';



COMMENT ON COLUMN "public"."knowledge_fragments"."temporal_period" IS 'Canonical temporal bucket inherited from the parent document.';



COMMENT ON COLUMN "public"."knowledge_fragments"."timeline_folder" IS 'Logical timeline folder path inherited from the parent document.';



CREATE TABLE IF NOT EXISTS "public"."knowledge_interpretations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "asset_id" "uuid" NOT NULL,
    "agent_id" "uuid",
    "classification" "public"."knowledge_classification" NOT NULL,
    "extracted_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence" numeric(5,4),
    "produced_by_run_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledge_interpretations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."knowledge_stats" WITH ("security_invoker"='true') AS
 SELECT "document_type",
    "count"(*) AS "fragment_count",
    "sum"("char_count") AS "total_chars",
    "count"(DISTINCT "source_file") AS "file_count",
    "max"("created_at") AS "last_updated"
   FROM "public"."knowledge_fragments"
  GROUP BY "document_type"
  ORDER BY ("count"(*)) DESC;


ALTER VIEW "public"."knowledge_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "label" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledge_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."life_threads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "time_period" "text",
    "emotional_significance" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "life_threads_emotional_significance_check" CHECK ((("emotional_significance" >= 1) AND ("emotional_significance" <= 10)))
);


ALTER TABLE "public"."life_threads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loom_annotations" (
    "annotation_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."loom_annotations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."manifest_file_pull" WITH ("security_invoker"='true') AS
 SELECT "am"."agent_id",
    "a"."slug",
    "am"."id" AS "manifest_id",
    "ame"."logical_path",
    "ame"."entry_type",
    "ame"."source_table",
    "ame"."source_id",
    "ame"."content_hash",
    "ame"."metadata"
   FROM (("public"."agent_manifests" "am"
     JOIN "public"."agents" "a" ON (("a"."agent_id" = "am"."agent_id")))
     JOIN "public"."agent_manifest_entries" "ame" ON (("ame"."manifest_id" = "am"."id")))
  WHERE ("am"."status" = 'active'::"public"."agent_manifest_status");


ALTER VIEW "public"."manifest_file_pull" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."memory_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "scope" "text" DEFAULT 'personal'::"text" NOT NULL,
    "kind" "text" DEFAULT 'note'::"text" NOT NULL,
    "title" "text",
    "summary" "text",
    "content" "text" NOT NULL,
    "content_hash" "text" NOT NULL,
    "embedding" "public"."vector"(768),
    "source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "source_ref" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "importance" smallint DEFAULT 3 NOT NULL,
    "pinned" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subject_id" "uuid",
    "auth_user_id" "uuid",
    "source_kind" "text" DEFAULT 'manual'::"text" NOT NULL,
    "entry_state" "text" DEFAULT 'active'::"text" NOT NULL,
    "emotional_valence" numeric(5,4),
    "consent_required" boolean DEFAULT true NOT NULL,
    "source_asset_id" "uuid",
    "provenance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "embedding_meta" "jsonb",
    "chunk_index" integer DEFAULT 0,
    "source_section" "text",
    CONSTRAINT "memory_entries_entry_state_check" CHECK (("entry_state" = ANY (ARRAY['active'::"text", 'review_required'::"text", 'archived'::"text"]))),
    CONSTRAINT "memory_entries_importance_check" CHECK ((("importance" >= 1) AND ("importance" <= 5))),
    CONSTRAINT "memory_entries_kind_check" CHECK (("kind" = ANY (ARRAY['identity'::"text", 'preference'::"text", 'goal'::"text", 'project'::"text", 'relationship'::"text", 'constraint'::"text", 'insight'::"text", 'note'::"text"]))),
    CONSTRAINT "memory_entries_scope_check" CHECK (("scope" = ANY (ARRAY['personal'::"text", 'session'::"text", 'shared'::"text"])))
);


ALTER TABLE "public"."memory_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."migration_user_map" (
    "legacy_user_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."migration_user_map" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_home_assignments" (
    "assignment_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_home_id" "uuid" NOT NULL,
    "room" "text" NOT NULL,
    "task_type" "text" NOT NULL,
    "consent_tier" "text" DEFAULT 'private_default'::"text" NOT NULL,
    "priority" integer DEFAULT 100 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."model_home_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_home_capabilities" (
    "capability_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_home_id" "uuid" NOT NULL,
    "capability_slug" "text" NOT NULL,
    "capability_type" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."model_home_capabilities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_home_consent_grants" (
    "grant_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_home_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "consent_tier" "text" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revoked_at" timestamp with time zone
);


ALTER TABLE "public"."model_home_consent_grants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_home_evaluations" (
    "evaluation_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_home_id" "uuid" NOT NULL,
    "rubric_slug" "text" NOT NULL,
    "score" numeric,
    "passed" boolean DEFAULT false NOT NULL,
    "findings" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."model_home_evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_home_events" (
    "event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_home_id" "uuid",
    "event_type" "text" NOT NULL,
    "user_id" "uuid",
    "subject_type" "text" DEFAULT 'model_home'::"text" NOT NULL,
    "subject_id" "text" DEFAULT ''::"text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."model_home_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_homes" (
    "model_home_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "provider_slug" "text" NOT NULL,
    "model_slug" "text" NOT NULL,
    "ring" "text" NOT NULL,
    "modalities" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "strengths" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "limitations" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "default_rooms" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "privacy_tier" "text" NOT NULL,
    "consent_required" boolean DEFAULT true NOT NULL,
    "max_context_tokens" integer,
    "cost_tier" smallint DEFAULT 1 NOT NULL,
    "speed_tier" smallint DEFAULT 1 NOT NULL,
    "supports_structured_output" boolean DEFAULT false NOT NULL,
    "supports_tools" boolean DEFAULT false NOT NULL,
    "supports_embeddings" boolean DEFAULT false NOT NULL,
    "fallback_model_home_slug" "text",
    "governance" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "model_homes_cost_tier_check" CHECK ((("cost_tier" >= 0) AND ("cost_tier" <= 3))),
    CONSTRAINT "model_homes_privacy_tier_check" CHECK (("privacy_tier" = ANY (ARRAY['local_only'::"text", 'private_cloud'::"text", 'external_api'::"text", 'restricted'::"text"]))),
    CONSTRAINT "model_homes_ring_check" CHECK (("ring" = ANY (ARRAY['inner_slm'::"text", 'outer_llm'::"text", 'adapter'::"text", 'embedding'::"text", 'judge'::"text"]))),
    CONSTRAINT "model_homes_speed_tier_check" CHECK ((("speed_tier" >= 0) AND ("speed_tier" <= 3))),
    CONSTRAINT "model_homes_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'paused'::"text", 'deprecated'::"text"])))
);


ALTER TABLE "public"."model_homes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_providers" (
    "provider_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "kind" "text" NOT NULL,
    "base_url" "text" NOT NULL,
    "secret_ref" "text",
    "local_first" boolean DEFAULT false NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "model_providers_kind_check" CHECK (("kind" = ANY (ARRAY['ollama'::"text", 'groq'::"text", 'openai'::"text", 'gemini'::"text", 'huggingface'::"text", 'fal'::"text", 'local'::"text", 'openai_compatible'::"text"])))
);


ALTER TABLE "public"."model_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."models" (
    "model_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "api_name" "text" NOT NULL,
    "modality" "text" DEFAULT 'text'::"text" NOT NULL,
    "supports_structured" boolean DEFAULT false NOT NULL,
    "supports_tools" boolean DEFAULT false NOT NULL,
    "supports_embeddings" boolean DEFAULT false NOT NULL,
    "context_window" integer,
    "speed_tier" smallint DEFAULT 2 NOT NULL,
    "cost_tier" smallint DEFAULT 1 NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."musical_dna_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "song_title" "text" NOT NULL,
    "artist" "text" NOT NULL,
    "analysis" "text",
    "empowerment_score" numeric(5,4),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "memory_context" "text",
    "time_period" "text",
    "play_count" integer DEFAULT 0,
    "neural_resonance_score" real DEFAULT 0.0
);


ALTER TABLE "public"."musical_dna_analyses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_render_audits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_slug" "text" NOT NULL,
    "component_path" "text",
    "audit_kind" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "findings" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "operation_render_audits_audit_kind_check" CHECK (("audit_kind" = ANY (ARRAY['visual'::"text", 'accessibility'::"text", 'dependency'::"text", 'performance'::"text", 'render'::"text"]))),
    CONSTRAINT "operation_render_audits_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'passed'::"text", 'failed'::"text", 'waived'::"text"])))
);


ALTER TABLE "public"."operation_render_audits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ops_workbook_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sheet_name" "text" NOT NULL,
    "row_key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "category" "text",
    "status" "text",
    "priority" "text",
    "phase" "text",
    "owner" "text" DEFAULT 'Keith'::"text" NOT NULL,
    "target_start" "date",
    "target_end" "date",
    "notes" "text",
    "link_ref" "text",
    "meta" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ops_workbook_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ops_workbook_sync_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "triggered_by" "text",
    "source_file" "text",
    "rows_upserted" integer DEFAULT 0 NOT NULL,
    "rows_skipped" integer DEFAULT 0 NOT NULL,
    "errors" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ops_workbook_sync_runs_status_check" CHECK (("status" = ANY (ARRAY['success'::"text", 'partial'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."ops_workbook_sync_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orchestration_decisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "decision_id" "text" NOT NULL,
    "triggered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "text",
    "trigger" "text" NOT NULL,
    "source_room" "text" NOT NULL,
    "detected_state" "text" NOT NULL,
    "support_level" "text" NOT NULL,
    "content_kind" "text" NOT NULL,
    "destination" "text" NOT NULL,
    "artifact_target_type" "text",
    "artifact_destination" "text",
    "synthesis_style" "text" NOT NULL,
    "processors" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "export_formats" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "next_action" "text" NOT NULL,
    "should_forge_artifact" boolean DEFAULT false NOT NULL,
    "should_persist_signal" boolean DEFAULT false NOT NULL,
    "should_update_profile" boolean DEFAULT false NOT NULL,
    "should_update_scaffold" boolean DEFAULT false NOT NULL,
    "confidence" double precision DEFAULT 0 NOT NULL,
    "user_facing_summary" "text" NOT NULL,
    "markers" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "context_clues" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "has_image" boolean DEFAULT false NOT NULL,
    "has_audio" boolean DEFAULT false NOT NULL,
    "has_video" boolean DEFAULT false NOT NULL,
    "has_file" boolean DEFAULT false NOT NULL,
    "input_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "decision_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "internal_diagnostics" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."orchestration_decisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "note" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "shopify_order_id" "text",
    "customer_email" "text" NOT NULL,
    "customer_name" "text",
    "product_name" "text",
    "order_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "magic_token" "text" DEFAULT ("gen_random_uuid"())::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pending_embodiment_mutations" WITH ("security_invoker"='true') AS
 SELECT "em"."id",
    "em"."agent_id",
    "a"."slug" AS "agent_slug",
    "em"."source_asset_id",
    "em"."interpretation_id",
    "em"."mutation_type",
    "em"."target_path",
    "em"."diff_summary",
    "em"."risk_level",
    "em"."status",
    "em"."created_at"
   FROM ("public"."embodiment_mutations" "em"
     JOIN "public"."agents" "a" ON (("a"."agent_id" = "em"."agent_id")))
  WHERE ("em"."status" = 'proposed'::"public"."embodiment_mutation_status");


ALTER VIEW "public"."pending_embodiment_mutations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pending_identity_reviews" WITH ("security_invoker"='true') AS
 SELECT "imp"."mutation_id",
    "imp"."agent_id",
    "a"."slug" AS "agent_slug",
    "imp"."mutation_type",
    "imp"."target_table",
    "imp"."target_id",
    "imp"."target_path",
    "imp"."mutation_class",
    "imp"."risk_level",
    "imp"."diff_summary",
    "imp"."reason",
    "imp"."confidence",
    "imp"."evidence_count",
    "imp"."created_at"
   FROM ("public"."identity_mutation_proposals" "imp"
     JOIN "public"."agents" "a" ON (("a"."agent_id" = "imp"."agent_id")))
  WHERE ("imp"."status" = 'proposed'::"public"."identity_mutation_status")
  ORDER BY "imp"."risk_level" DESC, "imp"."created_at";


ALTER VIEW "public"."pending_identity_reviews" OWNER TO "postgres";


COMMENT ON VIEW "public"."pending_identity_reviews" IS 'Queue of review-gated or high-risk identity mutations awaiting human decision.';



CREATE TABLE IF NOT EXISTS "public"."portrait_dimensions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "portrait_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "kind" "text" NOT NULL,
    "label" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "confidence" numeric(4,3) DEFAULT 0 NOT NULL,
    "evidence_count" integer DEFAULT 0 NOT NULL,
    "signal_sources" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "metaphor_family" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "raw_quotes" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "delta" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "portrait_dimensions_confidence_check" CHECK ((("confidence" >= (0)::numeric) AND ("confidence" <= (1)::numeric))),
    CONSTRAINT "portrait_dimensions_kind_check" CHECK (("kind" = ANY (ARRAY['cognitive_style'::"text", 'linguistic_signature'::"text", 'energy_rhythm'::"text", 'capture_behavior'::"text", 'synthesis_readiness'::"text", 'emotional_texture'::"text", 'identity_anchors'::"text", 'growth_edges'::"text", 'relational_patterns'::"text", 'creative_mode'::"text"])))
);


ALTER TABLE "public"."portrait_dimensions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portrait_inference_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "triggered_by" "text" DEFAULT 'threshold'::"text" NOT NULL,
    "priority" integer DEFAULT 5 NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "queued_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "picked_up_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "run_id" "uuid",
    CONSTRAINT "portrait_inference_queue_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 10))),
    CONSTRAINT "portrait_inference_queue_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'skipped'::"text"]))),
    CONSTRAINT "portrait_inference_queue_triggered_by_check" CHECK (("triggered_by" = ANY (ARRAY['threshold'::"text", 'cadence'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."portrait_inference_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portrait_inference_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "triggered_by" "text" NOT NULL,
    "status" "text" DEFAULT 'running'::"text" NOT NULL,
    "portrait_id" "uuid",
    "input_record_count" integer DEFAULT 0 NOT NULL,
    "input_window_start" timestamp with time zone,
    "input_window_end" timestamp with time zone,
    "llm_provider_used" "text",
    "llm_model_used" "text",
    "prompt_tokens" integer,
    "completion_tokens" integer,
    "validation_passed" boolean,
    "validation_errors" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "error_message" "text",
    "duration_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "portrait_inference_runs_status_check" CHECK (("status" = ANY (ARRAY['running'::"text", 'completed'::"text", 'failed'::"text", 'insufficient_data'::"text", 'cooldown_blocked'::"text"]))),
    CONSTRAINT "portrait_inference_runs_triggered_by_check" CHECK (("triggered_by" = ANY (ARRAY['cadence'::"text", 'threshold'::"text", 'manual'::"text"])))
);


ALTER TABLE "public"."portrait_inference_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portrait_render_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "portrait_id" "uuid" NOT NULL,
    "event_type" "text" DEFAULT 'view'::"text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "portrait_render_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['view'::"text", 'share'::"text", 'export'::"text", 'delta_view'::"text"])))
);


ALTER TABLE "public"."portrait_render_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."processing_runs" (
    "run_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'running'::"text" NOT NULL,
    "model" "text",
    "corpus_root" "text",
    "documents_count" integer DEFAULT 0 NOT NULL,
    "chunks_count" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."processing_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_ingestion_sources" (
    "source_link_id" "uuid" NOT NULL,
    "run_id" "uuid" NOT NULL,
    "source_type" "text" NOT NULL,
    "source_id" "text",
    "source_bucket" "text",
    "raw_text" "text",
    "processing_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profile_ingestion_sources_source_type_check" CHECK (("source_type" = ANY (ARRAY['journal'::"text", 'resume'::"text", 'transcript'::"text", 'music_dna'::"text", 'lived_experience'::"text"])))
);


ALTER TABLE "public"."profile_ingestion_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_portraits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "portrait_title" "text" NOT NULL,
    "tagline" "text" NOT NULL,
    "overall_confidence" numeric(4,3) DEFAULT 0 NOT NULL,
    "source_window_start" timestamp with time zone NOT NULL,
    "source_window_end" timestamp with time zone NOT NULL,
    "total_source_records" integer DEFAULT 0 NOT NULL,
    "plk_resonance_score" numeric(4,3),
    "delta_from_previous" "text",
    "inference_triggered_by" "text" DEFAULT 'cadence'::"text" NOT NULL,
    "inference_run_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "room_slug" "text",
    "validated_at" timestamp with time zone,
    "rendered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profile_portraits_inference_triggered_by_check" CHECK (("inference_triggered_by" = ANY (ARRAY['cadence'::"text", 'threshold'::"text", 'manual'::"text"]))),
    CONSTRAINT "profile_portraits_overall_confidence_check" CHECK ((("overall_confidence" >= (0)::numeric) AND ("overall_confidence" <= (1)::numeric))),
    CONSTRAINT "profile_portraits_plk_resonance_score_check" CHECK ((("plk_resonance_score" >= (0)::numeric) AND ("plk_resonance_score" <= (1)::numeric))),
    CONSTRAINT "profile_portraits_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'validated'::"text", 'rendered'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."profile_portraits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provenance_links" (
    "link_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "envelope_id" "uuid" NOT NULL,
    "related_subject_type" "text" NOT NULL,
    "related_subject_id" "text" NOT NULL,
    "relationship" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."provenance_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reasoning_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_slug" "text",
    "room_slug" "text",
    "user_id" "uuid",
    "request_kind" "text" DEFAULT 'chat'::"text" NOT NULL,
    "reasoning_depth" "text" DEFAULT 'standard'::"text" NOT NULL,
    "visible_summary" "text",
    "assumptions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "uncertainty" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "evidence_refs" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reasoning_sessions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."releasable_bucket_drops" WITH ("security_invoker"='true') AS
 SELECT "bd"."id",
    "bd"."user_id",
    "bd"."content",
    "bd"."raw_text",
    "bd"."capture_context",
    "bd"."created_at",
    "bd"."subject_id",
    "bd"."module_key",
    "bd"."intensity",
    "bd"."plk_resonance_score",
    "bd"."specialized_apps",
    "bd"."tags",
    "bd"."stage",
    "bd"."promoted_memory_id",
    "bd"."scored_at",
    "bd"."promoted_at",
    "bd"."embedding",
    "bd"."embedding_model",
    "bd"."embedding_backend",
    "bd"."embedded_at",
    "bd"."content_type",
    "bd"."recipient",
    "bd"."release_date",
    "bd"."release_trigger",
    "bd"."is_sealed",
    "bd"."blockchain_hash",
    "bd"."encryption_key",
    "bd"."released",
    "au"."display_name" AS "user_name",
        CASE
            WHEN (("bd"."release_date" IS NOT NULL) AND ("bd"."release_date" <= CURRENT_DATE)) THEN 'date_triggered'::"text"
            WHEN ("bd"."release_trigger" IS NOT NULL) THEN 'trigger_based'::"text"
            ELSE 'not_ready'::"text"
        END AS "release_status"
   FROM ("public"."bucket_drops" "bd"
     JOIN "public"."app_users" "au" ON (("bd"."user_id" = "au"."id")))
  WHERE (("bd"."is_sealed" = true) AND ("bd"."released" = false) AND (("bd"."release_date" <= CURRENT_DATE) OR ("bd"."release_trigger" IS NOT NULL)));


ALTER VIEW "public"."releasable_bucket_drops" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."render_artifacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "render_job_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "uri" "text" NOT NULL,
    "format" "text" NOT NULL,
    "backend" "text",
    "bytes" bigint,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."render_artifacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."render_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "source_room" "text",
    "graph_id" "text" NOT NULL,
    "scene_graph" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "diagnostics" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "manifest" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "render_jobs_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'rendering'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."render_jobs" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."rich_life_threads" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"text" AS "user_id",
    NULL::"text" AS "user_name",
    NULL::"text" AS "title",
    NULL::"text" AS "description",
    NULL::"text" AS "time_period",
    NULL::integer AS "emotional_significance",
    NULL::"text" AS "memory_anchors",
    NULL::bigint AS "media_count",
    NULL::bigint AS "family_contributions_count",
    NULL::timestamp with time zone AS "created_at";


ALTER VIEW "public"."rich_life_threads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scenario_sets" (
    "scenario_set_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "domain" "text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "locked" boolean DEFAULT false NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."scenario_sets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scenarios" (
    "scenario_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_set_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "difficulty" smallint DEFAULT 2 NOT NULL,
    "prompt_input" "jsonb" NOT NULL,
    "expected_traits" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "disallowed_traits" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "gold_answer" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scrapbook_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "file_id" "uuid",
    "caption" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_ref" "text",
    "source_file_ref" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."scrapbook_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_rate_limits" (
    "session_id" "text" NOT NULL,
    "query_count" integer DEFAULT 0 NOT NULL,
    "window_start" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."session_rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skill_fragments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid",
    "content" "text" NOT NULL,
    "content_hash" "text",
    "embedding" "public"."vector"(768),
    "source_file" "text",
    "document_type" "text" DEFAULT 'Skill'::"text",
    "skill_name" "text",
    "chunk_index" integer,
    "total_chunks" integer,
    "char_count" integer,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."skill_fragments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."skill_fragments"."embedding" IS '768-dim retrieval embedding aligned to EmbeddingGemma / text-embedding-004.';



CREATE OR REPLACE VIEW "public"."skill_stats" WITH ("security_invoker"='true') AS
 SELECT "skill_name",
    "count"(*) AS "fragment_count",
    COALESCE("sum"("char_count"), (0)::bigint) AS "total_chars",
    "count"(DISTINCT "source_file") AS "file_count",
    "count"("embedding") AS "embedded_count",
    "max"("created_at") AS "last_updated"
   FROM "public"."skill_fragments"
  GROUP BY "skill_name"
  ORDER BY ("count"(*)) DESC, "skill_name";


ALTER VIEW "public"."skill_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "content" "text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."songbook_tracks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "songbook_id" "uuid" NOT NULL,
    "musical_memory_id" "uuid" NOT NULL,
    "order_position" integer,
    "added_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."songbook_tracks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."songbooks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "theme" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."songbooks" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."songbook_contents" WITH ("security_invoker"='true') AS
 SELECT "s"."id" AS "songbook_id",
    "s"."name" AS "songbook_name",
    "s"."theme",
    "mda"."song_title",
    "mda"."artist",
    "mda"."empowerment_score" AS "emotional_significance",
    "mda"."memory_context",
    "st"."order_position",
    "mda"."neural_resonance_score"
   FROM (("public"."songbooks" "s"
     JOIN "public"."songbook_tracks" "st" ON (("s"."id" = "st"."songbook_id")))
     JOIN "public"."musical_dna_analyses" "mda" ON (("st"."musical_memory_id" = "mda"."id")))
  ORDER BY "s"."name", "st"."order_position";


ALTER VIEW "public"."songbook_contents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."summaries" (
    "summary_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "document_id" "uuid" NOT NULL,
    "level" "text" DEFAULT 'surface'::"text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "summaries_level_check" CHECK (("level" = ANY (ARRAY['surface'::"text", 'deep'::"text", 'gestalt'::"text"])))
);


ALTER TABLE "public"."summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."thread_media_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "media_path" "text" NOT NULL,
    "media_type" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."thread_media_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."thread_memory_anchors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "thread_id" "uuid" NOT NULL,
    "anchor_text" "text" NOT NULL,
    "anchor_type" "text" DEFAULT 'memory'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."thread_memory_anchors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tool_call_audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reasoning_session_id" "uuid",
    "profile_slug" "text",
    "tool_class" "text" NOT NULL,
    "tool_name" "text" NOT NULL,
    "permission_level" "text" DEFAULT 'read_only'::"text" NOT NULL,
    "input_summary" "text",
    "output_summary" "text",
    "source_refs" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'success'::"text" NOT NULL,
    "error_summary" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tool_call_audit_status_check" CHECK (("status" = ANY (ARRAY['success'::"text", 'failed'::"text", 'blocked'::"text", 'skipped'::"text"])))
);


ALTER TABLE "public"."tool_call_audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_connectors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "kind" "text" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "capabilities" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_by" "text" DEFAULT 'Keith'::"text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_connectors_kind_check" CHECK (("kind" = ANY (ARRAY['supabase'::"text", 'github'::"text", 'webhook'::"text", 'rag-index'::"text", 'runtime-api'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."trainer_connectors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_experiment_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "experiment_id" "uuid" NOT NULL,
    "source_type" "text" NOT NULL,
    "source_id" "text" NOT NULL,
    "source_path" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_experiment_sources_source_type_check" CHECK (("source_type" = ANY (ARRAY['document'::"text", 'scenario_set'::"text", 'run_output'::"text", 'spec_file'::"text"])))
);


ALTER TABLE "public"."trainer_experiment_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_experiments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "purpose" "text" NOT NULL,
    "domain" "text",
    "embodiment_profile_slug" "text",
    "goal" "text",
    "target_behaviors" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "anti_goals" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "study_focus" "text",
    "max_cycles" integer DEFAULT 3 NOT NULL,
    "quality_threshold" numeric(5,2) DEFAULT 4.0 NOT NULL,
    "drafting_provider" "text" DEFAULT 'auto'::"text" NOT NULL,
    "evaluation_provider" "text" DEFAULT 'auto'::"text" NOT NULL,
    "class" "text" DEFAULT 'operational_profile'::"text" NOT NULL,
    "packaging_eligible" boolean DEFAULT false NOT NULL,
    "created_by" "text" DEFAULT 'Keith'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "execution_mode" "text" DEFAULT 'classic'::"text" NOT NULL,
    "connector_graph" "jsonb",
    "skill_graph" "jsonb",
    "memory_graph" "jsonb",
    CONSTRAINT "trainer_experiments_class_check" CHECK (("class" = ANY (ARRAY['operational_profile'::"text", 'approved_training_kit'::"text", 'rejected'::"text"]))),
    CONSTRAINT "trainer_experiments_execution_mode_check" CHECK (("execution_mode" = ANY (ARRAY['classic'::"text", 'hyperagent'::"text"])))
);


ALTER TABLE "public"."trainer_experiments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_job_events" (
    "event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "job_id" "uuid",
    "actor_type" "text" NOT NULL,
    "actor_id" "text",
    "event_type" "text" NOT NULL,
    "message" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_job_events_actor_type_check" CHECK (("actor_type" = ANY (ARRAY['system'::"text", 'worker'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."trainer_job_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_jobs" (
    "job_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "lease_expires_at" timestamp with time zone,
    "last_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "worker_id" "text",
    "claimed_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "last_heartbeat_at" timestamp with time zone,
    "max_attempts" integer DEFAULT 3 NOT NULL,
    "next_retry_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "lease_token" "uuid" DEFAULT "gen_random_uuid"(),
    "cancel_requested" boolean DEFAULT false NOT NULL,
    CONSTRAINT "trainer_jobs_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'leased'::"text", 'done'::"text", 'failed'::"text", 'cancelled'::"text", 'retry_wait'::"text"])))
);


ALTER TABLE "public"."trainer_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_memory_bindings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "experiment_id" "uuid",
    "embodiment_id" "text",
    "surface_kind" "text" NOT NULL,
    "surface_id" "text" NOT NULL,
    "mode" "text" DEFAULT 'read'::"text" NOT NULL,
    "created_by" "text" DEFAULT 'Keith'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_memory_bindings_mode_check" CHECK (("mode" = ANY (ARRAY['read'::"text", 'write'::"text", 'read-write'::"text"])))
);


ALTER TABLE "public"."trainer_memory_bindings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."trainer_memory_surfaces" WITH ("security_invoker"='true') AS
 SELECT 'memory_entries'::"text" AS "surfacekind",
    ("me"."id")::"text" AS "surfaceid",
    "left"(COALESCE("me"."content", "me"."title", 'memory entry'::"text"), 120) AS "label",
    "me"."user_id" AS "ownerid",
    "me"."source" AS "sourceref",
    COALESCE("me"."tags", '{}'::"text"[]) AS "tags",
    "me"."updated_at" AS "lastupdated"
   FROM "public"."memory_entries" "me"
UNION ALL
 SELECT 'knowledge_fragments'::"text" AS "surfacekind",
    ("kf"."id")::"text" AS "surfaceid",
    "left"(COALESCE("kf"."content", "kf"."source_file", 'knowledge fragment'::"text"), 120) AS "label",
    NULL::"text" AS "ownerid",
    "kf"."source_file" AS "sourceref",
    COALESCE("kf"."tags", '{}'::"text"[]) AS "tags",
    "kf"."created_at" AS "lastupdated"
   FROM "public"."knowledge_fragments" "kf"
UNION ALL
 SELECT 'ops_workbook_items'::"text" AS "surfacekind",
    ("ow"."id")::"text" AS "surfaceid",
    "left"(COALESCE("ow"."label", "ow"."row_key", 'workbook item'::"text"), 120) AS "label",
    NULL::"text" AS "ownerid",
    "ow"."sheet_name" AS "sourceref",
    COALESCE("array_remove"(ARRAY["ow"."category", "ow"."status", "ow"."priority", "ow"."phase"], NULL::"text"), '{}'::"text"[]) AS "tags",
    "ow"."updated_at" AS "lastupdated"
   FROM "public"."ops_workbook_items" "ow";


ALTER VIEW "public"."trainer_memory_surfaces" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_packaging_candidates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "experiment_id" "uuid" NOT NULL,
    "package_label" "text" NOT NULL,
    "package_description" "text" NOT NULL,
    "included_files" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "included_scenarios" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "included_configs" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "boundary_statement" "text" NOT NULL,
    "approved_by" "text" DEFAULT 'Keith'::"text" NOT NULL,
    "approved_at" timestamp with time zone,
    "status" "text" DEFAULT 'candidate'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_packaging_candidates_status_check" CHECK (("status" = ANY (ARRAY['candidate'::"text", 'kit_approved'::"text", 'shipped'::"text", 'withdrawn'::"text"])))
);


ALTER TABLE "public"."trainer_packaging_candidates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_policy_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "experiment_id" "uuid" NOT NULL,
    "flag" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "set_by" "text" DEFAULT 'Keith'::"text" NOT NULL,
    "notes" "text",
    "resolved" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_policy_flags_flag_check" CHECK (("flag" = ANY (ARRAY['persona-risk'::"text", 'memory-risk'::"text", 'overattachment-risk'::"text", 'claims-risk'::"text", 'charisma-artifact'::"text", 'scope-creep'::"text"]))),
    CONSTRAINT "trainer_policy_flags_severity_check" CHECK (("severity" = ANY (ARRAY['advisory'::"text", 'blocking'::"text"])))
);


ALTER TABLE "public"."trainer_policy_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_workers" (
    "worker_id" "text" NOT NULL,
    "status" "text" DEFAULT 'starting'::"text" NOT NULL,
    "current_job_id" "uuid",
    "build_sha" "text",
    "host" "text",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_heartbeat_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    CONSTRAINT "trainer_workers_status_check" CHECK (("status" = ANY (ARRAY['starting'::"text", 'idle'::"text", 'busy'::"text", 'offline'::"text"])))
);


ALTER TABLE "public"."trainer_workers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_runs" (
    "run_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "agent_id" "uuid" NOT NULL,
    "baseline_version_id" "uuid",
    "requested_by" "uuid",
    "approver_user_id" "uuid",
    "status" "text" NOT NULL,
    "goal" "text" NOT NULL,
    "max_cycles" integer DEFAULT 3 NOT NULL,
    "quality_threshold" numeric(5,2) NOT NULL,
    "routing_policy" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "experiment_id" "uuid",
    "blocked_reason" "text",
    "last_event_at" timestamp with time zone,
    "last_event_message" "text",
    "execution_mode" "text" DEFAULT 'classic'::"text" NOT NULL,
    "resolved_graph" "jsonb",
    "graph_observations" "jsonb",
    CONSTRAINT "training_runs_execution_mode_check" CHECK (("execution_mode" = ANY (ARRAY['classic'::"text", 'hyperagent'::"text"]))),
    CONSTRAINT "training_runs_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'running'::"text", 'awaiting_review'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."training_runs" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."trainer_queue_health_v" WITH ("security_invoker"='true') AS
 WITH "job_counts" AS (
         SELECT ("count"(*) FILTER (WHERE ("trainer_jobs"."status" = 'queued'::"text")))::integer AS "queued_count",
            ("count"(*) FILTER (WHERE ("trainer_jobs"."status" = 'leased'::"text")))::integer AS "leased_count",
            ("count"(*) FILTER (WHERE ("trainer_jobs"."status" = 'retry_wait'::"text")))::integer AS "retry_wait_count",
            ("count"(*) FILTER (WHERE ("trainer_jobs"."status" = 'failed'::"text")))::integer AS "failed_count",
            ("count"(*) FILTER (WHERE (("trainer_jobs"."status" = 'leased'::"text") AND ("trainer_jobs"."lease_expires_at" IS NOT NULL) AND ("trainer_jobs"."lease_expires_at" < "now"()))))::integer AS "stale_lease_count",
            "min"("trainer_jobs"."created_at") FILTER (WHERE ("trainer_jobs"."status" = 'queued'::"text")) AS "oldest_queued_at"
           FROM "public"."trainer_jobs"
        ), "worker_counts" AS (
         SELECT ("count"(*) FILTER (WHERE (("trainer_workers"."status" <> 'offline'::"text") AND ("trainer_workers"."last_heartbeat_at" >= ("now"() - '00:01:00'::interval)))))::integer AS "online_worker_count"
           FROM "public"."trainer_workers"
        ), "review_counts" AS (
         SELECT ("count"(*) FILTER (WHERE ("training_runs"."status" = 'awaiting_review'::"text")))::integer AS "awaiting_review_count"
           FROM "public"."training_runs"
        )
 SELECT "job_counts"."queued_count",
    "job_counts"."leased_count",
    "job_counts"."retry_wait_count",
    "job_counts"."failed_count",
    "review_counts"."awaiting_review_count",
    "job_counts"."stale_lease_count",
    "worker_counts"."online_worker_count",
    "job_counts"."oldest_queued_at"
   FROM "job_counts",
    "worker_counts",
    "review_counts";


ALTER VIEW "public"."trainer_queue_health_v" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_review_decisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "experiment_id" "uuid" NOT NULL,
    "run_id" "text",
    "version_id" "text",
    "decision" "text" NOT NULL,
    "reviewer" "text" DEFAULT 'Keith'::"text" NOT NULL,
    "coherence_score" numeric(5,2),
    "safety_score" numeric(5,2),
    "emotional_posture_score" numeric(5,2),
    "over_id_risk" "text",
    "notes" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "trainer_review_decisions_decision_check" CHECK (("decision" = ANY (ARRAY['approved'::"text", 'rejected'::"text", 'hold'::"text", 'promote_kit'::"text"]))),
    CONSTRAINT "trainer_review_decisions_over_id_risk_check" CHECK (("over_id_risk" = ANY (ARRAY['none'::"text", 'low'::"text", 'medium'::"text", 'high'::"text"])))
);


ALTER TABLE "public"."trainer_review_decisions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."trainer_run_summary" AS
SELECT
    NULL::"uuid" AS "run_id",
    NULL::"uuid" AS "agent_id",
    NULL::"text" AS "status",
    NULL::"text" AS "goal",
    NULL::integer AS "max_cycles",
    NULL::numeric(5,2) AS "quality_threshold",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "started_at",
    NULL::timestamp with time zone AS "completed_at",
    NULL::bigint AS "step_count",
    NULL::numeric AS "avg_score";


ALTER VIEW "public"."trainer_run_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "skill_id" "uuid" NOT NULL,
    "slug" "text" NOT NULL,
    "category" "text" NOT NULL,
    "default_connector_id" "uuid",
    "config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "safety_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_by" "text" DEFAULT 'Keith'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trainer_skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_steps" (
    "step_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "cycle_no" integer NOT NULL,
    "stage" "text" NOT NULL,
    "provider_id" "uuid",
    "model_id" "uuid",
    "request_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "response_payload" "jsonb",
    "latency_ms" integer,
    "estimated_cost_usd" numeric(10,6),
    "status" "text" NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "training_steps_stage_check" CHECK (("stage" = ANY (ARRAY['normalize'::"text", 'curriculum'::"text", 'scenario_expand'::"text", 'author'::"text", 'evaluate'::"text", 'critique'::"text", 'safety'::"text", 'package'::"text"]))),
    CONSTRAINT "training_steps_status_check" CHECK (("status" = ANY (ARRAY['running'::"text", 'completed'::"text", 'failed'::"text", 'skipped'::"text"])))
);


ALTER TABLE "public"."training_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcriptory_captures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text",
    "duration_seconds" integer,
    "audio_storage_path" "text",
    "raw_transcript" "text",
    "summary" "text",
    "themes" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "linked_captures" "uuid"[] DEFAULT '{}'::"uuid"[] NOT NULL,
    "linked_blackboard_session" "uuid",
    "linked_creation_corner_artifact" "uuid",
    "context_weight" double precision DEFAULT 1.0 NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "session_id" "uuid",
    "transcript_text" "text",
    "transcript_language" "text",
    "source_kind" "text" DEFAULT 'audio'::"text" NOT NULL,
    "source_label" "text",
    "processing_provider" "text",
    "transcript_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_message" "text",
    "token_estimate" integer,
    "last_accessed_at" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "search_document" "tsvector",
    "error_code" "text",
    "processing_started_at" timestamp with time zone,
    "processing_completed_at" timestamp with time zone,
    CONSTRAINT "transcriptory_captures_source_kind_check" CHECK (("source_kind" = ANY (ARRAY['audio'::"text", 'text'::"text", 'imported_audio'::"text", 'imported_text'::"text", 'derived'::"text"]))),
    CONSTRAINT "transcriptory_captures_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'ready'::"text", 'failed'::"text", 'archived'::"text", 'deleted'::"text", 'approved'::"text"]))),
    CONSTRAINT "transcriptory_captures_transcript_status_check" CHECK (("transcript_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'ready'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."transcriptory_captures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcriptory_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text",
    "description" "text",
    "origin" "text" DEFAULT 'transcriptory'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ended_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "transcriptory_sessions_origin_check" CHECK (("origin" = ANY (ARRAY['transcriptory'::"text", 'blackboard'::"text", 'creation_corner'::"text", 'journal'::"text", 'universal_capture'::"text", 'import'::"text", 'api'::"text"]))),
    CONSTRAINT "transcriptory_sessions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text", 'merged'::"text"])))
);


ALTER TABLE "public"."transcriptory_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcriptory_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "capture_id" "uuid" NOT NULL,
    "source_type" "text" NOT NULL,
    "source_ref" "text",
    "source_page" "text",
    "source_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "transcriptory_sources_source_type_check" CHECK (("source_type" = ANY (ARRAY['upload'::"text", 'recording'::"text", 'blackboard_handoff'::"text", 'creation_corner_seed'::"text", 'journal_entry'::"text", 'universal_capture'::"text", 'api_import'::"text", 'manual_text'::"text"])))
);


ALTER TABLE "public"."transcriptory_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcripts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "embedding" "public"."vector"(768),
    "embedding_model" "text",
    "embedding_backend" "text",
    "embedded_at" timestamp with time zone
);


ALTER TABLE "public"."transcripts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tribunal_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question" "text" NOT NULL,
    "candidate_answers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "winning_answer_id" "text",
    "verdict_summary" "text",
    "triggering_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tribunal_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tribunal_evidence" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tribunal_event_id" "uuid" NOT NULL,
    "document_id" "uuid",
    "fragment_id" "uuid",
    "weight" numeric(5,4) DEFAULT 1.0 NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tribunal_evidence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tribunal_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "question" "text" NOT NULL,
    "participants" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "provider" "text",
    "response" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tribunal_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."uploads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."uploads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "mime_type" "text" DEFAULT ''::"text" NOT NULL,
    "size_bytes" bigint DEFAULT 0 NOT NULL,
    "storage_path" "text" NOT NULL,
    "room_origin" "public"."file_room_origin" DEFAULT 'blackboard'::"public"."file_room_origin" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "preview_text" "text",
    "preview_html" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "filename" "text",
    "file_type" "text",
    "file_size_bytes" bigint,
    "uploaded_at" timestamp with time zone,
    "source_ref" "text",
    CONSTRAINT "user_files_size_bytes_check" CHECK (("size_bytes" >= 0))
);


ALTER TABLE "public"."user_files" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_files" IS 'Service-role backed file metadata for the Blackboard Room and Inner World. RLS is enforced; user-scoped access only.';



CREATE TABLE IF NOT EXISTS "public"."user_personality_dimensions" (
    "dimension_id" "uuid" NOT NULL,
    "run_id" "uuid" NOT NULL,
    "dimension_key" "text" NOT NULL,
    "dimension_label" "text",
    "dimension_value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "evidence_fragments" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "salience" numeric DEFAULT 0 NOT NULL,
    "mutation_class" "text" DEFAULT 'dynamic'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "embedding" "public"."vector"(768),
    "embedding_model" "text",
    "embedding_backend" "text",
    "embedded_at" timestamp with time zone,
    CONSTRAINT "user_personality_dimensions_mutation_class_check" CHECK (("mutation_class" = ANY (ARRAY['immutable'::"text", 'stable'::"text", 'dynamic'::"text"]))),
    CONSTRAINT "user_personality_dimensions_salience_check" CHECK ((("salience" >= (0)::numeric) AND ("salience" <= (1)::numeric)))
);


ALTER TABLE "public"."user_personality_dimensions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "room_renames" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "theme" "text" DEFAULT 'void'::"text" NOT NULL,
    "position_overrides" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "display_name" "text" DEFAULT ''::"text" NOT NULL,
    "avatar_url" "text" DEFAULT ''::"text" NOT NULL,
    "embodiment_profile_slug" "text" DEFAULT 'billy'::"text" NOT NULL
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profile_ingestion_runs" (
    "run_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "input_sources" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "extracted_attributes" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "personality_profile" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "confidence_scores" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "chunk_count" integer DEFAULT 0,
    "embed_model" "text",
    "embed_backend" "text",
    "embed_dimensions" integer,
    CONSTRAINT "user_profile_ingestion_runs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'complete'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."user_profile_ingestion_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "tier" "text" DEFAULT 'free'::"text" NOT NULL,
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "subscription_status" "text" DEFAULT 'inactive'::"text",
    "billing_period_start" timestamp with time zone,
    "billy_query_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_admin" boolean DEFAULT false NOT NULL,
    "grace_until" timestamp with time zone,
    CONSTRAINT "users_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'past_due'::"text", 'canceled'::"text", 'trialing'::"text"]))),
    CONSTRAINT "users_tier_check" CHECK (("tier" = ANY (ARRAY['free'::"text", 'core'::"text", 'pro'::"text", 'enterprise'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."grace_until" IS 'Grace period expiry for past_due subscriptions. NULL = no grace. 2026-03-21';



CREATE TABLE IF NOT EXISTS "public"."visible_reasoning_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reasoning_session_id" "uuid" NOT NULL,
    "card_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "visible_reasoning_cards_card_type_check" CHECK (("card_type" = ANY (ARRAY['evidence'::"text", 'tool'::"text", 'assumption'::"text", 'uncertainty'::"text", 'redaction'::"text", 'visual'::"text"])))
);


ALTER TABLE "public"."visible_reasoning_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."voice_humor_patterns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "voice_print_id" "uuid" NOT NULL,
    "pattern" "text" NOT NULL,
    "context" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."voice_humor_patterns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."voice_prints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "linguistic_fingerprint" "text",
    "storytelling_style" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."voice_prints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."voice_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_slug" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "provider_preference" "text" DEFAULT 'local'::"text" NOT NULL,
    "tts_model" "text",
    "stt_model" "text",
    "speaker_id" "text",
    "style_preset" "jsonb" DEFAULT '{"pace": 0.85, "humor": 0.4, "energy": 0.55, "warmth": 0.8, "clarity": 0.9}'::"jsonb" NOT NULL,
    "fallback_text_only" boolean DEFAULT true NOT NULL,
    "consent_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "voice_profiles_provider_preference_check" CHECK (("provider_preference" = ANY (ARRAY['local'::"text", 'hf'::"text", 'elevenlabs'::"text", 'browser'::"text"])))
);


ALTER TABLE "public"."voice_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."voice_session_audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_slug" "text",
    "user_id" "uuid",
    "provider" "text",
    "stt_model" "text",
    "tts_model" "text",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ended_at" timestamp with time zone,
    "interruption_count" integer DEFAULT 0 NOT NULL,
    "latency_ms" integer,
    "failed_stage" "text",
    "user_visible_error" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."voice_session_audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."voice_signature_phrases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "voice_print_id" "uuid" NOT NULL,
    "phrase" "text" NOT NULL,
    "emotional_weight" real DEFAULT 1.0,
    "usage_frequency" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."voice_signature_phrases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "workspace_id" "uuid",
    "filename" "text" NOT NULL,
    "file_size_bytes" bigint DEFAULT 0 NOT NULL,
    "file_type" "text" DEFAULT ''::"text" NOT NULL,
    "raw_text" "text",
    "analysis_status" "text" DEFAULT 'completed'::"text" NOT NULL,
    "analysis_summary" "text" DEFAULT ''::"text" NOT NULL,
    "key_points" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "topics" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "sentiment" "text" DEFAULT 'unknown'::"text" NOT NULL,
    "word_count" integer DEFAULT 0 NOT NULL,
    "reading_time_minutes" integer DEFAULT 0 NOT NULL,
    "analysis_payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "workspace_documents_analysis_status_check" CHECK (("analysis_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"]))),
    CONSTRAINT "workspace_documents_file_size_bytes_check" CHECK (("file_size_bytes" >= 0)),
    CONSTRAINT "workspace_documents_reading_time_minutes_check" CHECK (("reading_time_minutes" >= 0)),
    CONSTRAINT "workspace_documents_word_count_check" CHECK (("word_count" >= 0))
);


ALTER TABLE "public"."workspace_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "role" "text" DEFAULT 'owner'::"text" NOT NULL,
    "member_count" integer DEFAULT 1 NOT NULL,
    "recent_activity" "text" DEFAULT 'Workspace created.'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "workspace_rooms_member_count_check" CHECK (("member_count" >= 0)),
    CONSTRAINT "workspace_rooms_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'member'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."workspace_rooms" OWNER TO "postgres";


ALTER TABLE ONLY "public"."agent_autobiographies"
    ADD CONSTRAINT "agent_autobiographies_agent_id_version_id_key" UNIQUE ("agent_id", "version_id");



ALTER TABLE ONLY "public"."agent_autobiographies"
    ADD CONSTRAINT "agent_autobiographies_pkey" PRIMARY KEY ("autobiography_id");



ALTER TABLE ONLY "public"."agent_code_artifacts"
    ADD CONSTRAINT "agent_code_artifacts_agent_id_file_path_checksum_key" UNIQUE ("agent_id", "file_path", "checksum");



ALTER TABLE ONLY "public"."agent_code_artifacts"
    ADD CONSTRAINT "agent_code_artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_constitutions"
    ADD CONSTRAINT "agent_constitutions_agent_id_version_id_key" UNIQUE ("agent_id", "version_id");



ALTER TABLE ONLY "public"."agent_constitutions"
    ADD CONSTRAINT "agent_constitutions_pkey" PRIMARY KEY ("constitution_id");



ALTER TABLE ONLY "public"."agent_context_views"
    ADD CONSTRAINT "agent_context_views_pkey" PRIMARY KEY ("context_view_id");



ALTER TABLE ONLY "public"."agent_governance_policies"
    ADD CONSTRAINT "agent_governance_policies_agent_id_version_id_key" UNIQUE ("agent_id", "version_id");



ALTER TABLE ONLY "public"."agent_governance_policies"
    ADD CONSTRAINT "agent_governance_policies_pkey" PRIMARY KEY ("governance_policy_id");



ALTER TABLE ONLY "public"."agent_knowledge_links"
    ADD CONSTRAINT "agent_knowledge_links_agent_id_asset_id_link_type_scope_key" UNIQUE ("agent_id", "asset_id", "link_type", "scope");



ALTER TABLE ONLY "public"."agent_knowledge_links"
    ADD CONSTRAINT "agent_knowledge_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_manifest_entries"
    ADD CONSTRAINT "agent_manifest_entries_manifest_id_logical_path_key" UNIQUE ("manifest_id", "logical_path");



ALTER TABLE ONLY "public"."agent_manifest_entries"
    ADD CONSTRAINT "agent_manifest_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_manifests"
    ADD CONSTRAINT "agent_manifests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_memories"
    ADD CONSTRAINT "agent_memories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_memory_records"
    ADD CONSTRAINT "agent_memory_records_pkey" PRIMARY KEY ("memory_id");



ALTER TABLE ONLY "public"."agent_preference_nodes"
    ADD CONSTRAINT "agent_preference_nodes_pkey" PRIMARY KEY ("preference_id");



ALTER TABLE ONLY "public"."agent_presentation_profiles"
    ADD CONSTRAINT "agent_presentation_profiles_agent_id_version_id_key" UNIQUE ("agent_id", "version_id");



ALTER TABLE ONLY "public"."agent_presentation_profiles"
    ADD CONSTRAINT "agent_presentation_profiles_pkey" PRIMARY KEY ("presentation_profile_id");



ALTER TABLE ONLY "public"."agent_private_interiors"
    ADD CONSTRAINT "agent_private_interiors_agent_id_version_id_key" UNIQUE ("agent_id", "version_id");



ALTER TABLE ONLY "public"."agent_private_interiors"
    ADD CONSTRAINT "agent_private_interiors_pkey" PRIMARY KEY ("private_interior_id");



ALTER TABLE ONLY "public"."agent_relationship_edges"
    ADD CONSTRAINT "agent_relationship_edges_pkey" PRIMARY KEY ("relationship_id");



ALTER TABLE ONLY "public"."agent_relationships"
    ADD CONSTRAINT "agent_relationships_agent_id_related_agent_id_relationship__key" UNIQUE ("agent_id", "related_agent_id", "relationship_type");



ALTER TABLE ONLY "public"."agent_relationships"
    ADD CONSTRAINT "agent_relationships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_skill_profiles"
    ADD CONSTRAINT "agent_skill_profiles_agent_id_skill_slug_key" UNIQUE ("agent_id", "skill_slug");



ALTER TABLE ONLY "public"."agent_skill_profiles"
    ADD CONSTRAINT "agent_skill_profiles_pkey" PRIMARY KEY ("skill_profile_id");



ALTER TABLE ONLY "public"."agent_skills"
    ADD CONSTRAINT "agent_skills_agent_id_skill_slug_key" UNIQUE ("agent_id", "skill_slug");



ALTER TABLE ONLY "public"."agent_skills"
    ADD CONSTRAINT "agent_skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."agent_versions"
    ADD CONSTRAINT "agent_versions_pkey" PRIMARY KEY ("version_id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_pkey" PRIMARY KEY ("agent_id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."annotation_concepts"
    ADD CONSTRAINT "annotation_concepts_pkey" PRIMARY KEY ("annotation_id", "concept_id");



ALTER TABLE ONLY "public"."app_users"
    ADD CONSTRAINT "app_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_pkey" PRIMARY KEY ("approval_id");



ALTER TABLE ONLY "public"."artifact_provenance_envelopes"
    ADD CONSTRAINT "artifact_provenance_envelopes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artifacts"
    ADD CONSTRAINT "artifacts_pkey" PRIMARY KEY ("artifact_id");



ALTER TABLE ONLY "public"."billy_sessions"
    ADD CONSTRAINT "billy_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bucket_drops"
    ADD CONSTRAINT "bucket_drops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."capture_events"
    ADD CONSTRAINT "capture_events_pkey" PRIMARY KEY ("capture_id");



ALTER TABLE ONLY "public"."codex_artifacts"
    ADD CONSTRAINT "codex_artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."codex_jobs"
    ADD CONSTRAINT "codex_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collaborative_memory_records"
    ADD CONSTRAINT "collaborative_memory_records_pkey" PRIMARY KEY ("collaborative_memory_id");



ALTER TABLE ONLY "public"."collaborative_space_members"
    ADD CONSTRAINT "collaborative_space_members_pkey" PRIMARY KEY ("collaborative_space_id", "agent_id");



ALTER TABLE ONLY "public"."collaborative_spaces"
    ADD CONSTRAINT "collaborative_spaces_pkey" PRIMARY KEY ("collaborative_space_id");



ALTER TABLE ONLY "public"."collaborative_spaces"
    ADD CONSTRAINT "collaborative_spaces_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."collaborator_embodiment_links"
    ADD CONSTRAINT "collaborator_embodiment_links_pkey" PRIMARY KEY ("embodiment_link_id");



ALTER TABLE ONLY "public"."collaborator_onboarding_events"
    ADD CONSTRAINT "collaborator_onboarding_events_pkey" PRIMARY KEY ("onboarding_event_id");



ALTER TABLE ONLY "public"."collaborator_permissions"
    ADD CONSTRAINT "collaborator_permissions_pkey" PRIMARY KEY ("permission_id");



ALTER TABLE ONLY "public"."collaborator_relationships"
    ADD CONSTRAINT "collaborator_relationships_pkey" PRIMARY KEY ("relationship_id");



ALTER TABLE ONLY "public"."collaborator_roles"
    ADD CONSTRAINT "collaborator_roles_pkey" PRIMARY KEY ("role_id");



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_agent_id_key" UNIQUE ("agent_id");



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_collaborator_key_key" UNIQUE ("collaborator_key");



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_pkey" PRIMARY KEY ("collaborator_id");



ALTER TABLE ONLY "public"."companion_interactions"
    ADD CONSTRAINT "companion_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."concepts"
    ADD CONSTRAINT "concepts_pkey" PRIMARY KEY ("concept_id");



ALTER TABLE ONLY "public"."concepts"
    ADD CONSTRAINT "concepts_tenant_id_canonical_key" UNIQUE ("tenant_id", "canonical");



ALTER TABLE ONLY "public"."consciousness_profiles"
    ADD CONSTRAINT "consciousness_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."context_injection_packets"
    ADD CONSTRAINT "context_injection_packets_pkey" PRIMARY KEY ("packet_id");



ALTER TABLE ONLY "public"."context_injection_rules"
    ADD CONSTRAINT "context_injection_rules_pkey" PRIMARY KEY ("rule_id");



ALTER TABLE ONLY "public"."corpus_harvest_events"
    ADD CONSTRAINT "corpus_harvest_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."created_artifacts"
    ADD CONSTRAINT "created_artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cssm_sessions"
    ADD CONSTRAINT "cssm_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deliverables"
    ADD CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deployment_artifacts"
    ADD CONSTRAINT "deployment_artifacts_pkey" PRIMARY KEY ("artifact_id");



ALTER TABLE ONLY "public"."di_memory_events"
    ADD CONSTRAINT "di_memory_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."di_sessions"
    ADD CONSTRAINT "di_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."di_sessions"
    ADD CONSTRAINT "di_sessions_user_id_di_slug_key" UNIQUE ("user_id", "di_slug");



ALTER TABLE ONLY "public"."document_concepts"
    ADD CONSTRAINT "document_concepts_pkey" PRIMARY KEY ("document_id", "concept_id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_hash_key" UNIQUE ("hash");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("document_id");



ALTER TABLE ONLY "public"."dream_fragments"
    ADD CONSTRAINT "dream_fragments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dream_symbolic_elements"
    ADD CONSTRAINT "dream_symbolic_elements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embeddings"
    ADD CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embodiment_modules"
    ADD CONSTRAINT "embodiment_modules_module_key_key" UNIQUE ("module_key");



ALTER TABLE ONLY "public"."embodiment_modules"
    ADD CONSTRAINT "embodiment_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embodiment_mutation_proposals"
    ADD CONSTRAINT "embodiment_mutation_proposals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embodiment_mutations"
    ADD CONSTRAINT "embodiment_mutations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embodiment_profiles"
    ADD CONSTRAINT "embodiment_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embodiment_profiles"
    ADD CONSTRAINT "embodiment_profiles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."embodiment_readiness_scores"
    ADD CONSTRAINT "embodiment_readiness_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embodiment_reasoning_policies"
    ADD CONSTRAINT "embodiment_reasoning_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embodiment_reasoning_policies"
    ADD CONSTRAINT "embodiment_reasoning_policies_profile_slug_key" UNIQUE ("profile_slug");



ALTER TABLE ONLY "public"."embodiment_review_log"
    ADD CONSTRAINT "embodiment_review_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embodiment_training_runs"
    ADD CONSTRAINT "embodiment_training_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."eval_results"
    ADD CONSTRAINT "eval_results_pkey" PRIMARY KEY ("eval_result_id");



ALTER TABLE ONLY "public"."eval_rubrics"
    ADD CONSTRAINT "eval_rubrics_pkey" PRIMARY KEY ("rubric_id");



ALTER TABLE ONLY "public"."eval_rubrics"
    ADD CONSTRAINT "eval_rubrics_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."family_contributions"
    ADD CONSTRAINT "family_contributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_members"
    ADD CONSTRAINT "family_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."field_continuity_events"
    ADD CONSTRAINT "field_continuity_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."founder_context"
    ADD CONSTRAINT "founder_context_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."founder_context"
    ADD CONSTRAINT "founder_context_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."gestaltview_module_keys"
    ADD CONSTRAINT "gestaltview_module_keys_module_id_key_name_key" UNIQUE ("module_id", "key_name");



ALTER TABLE ONLY "public"."gestaltview_module_keys"
    ADD CONSTRAINT "gestaltview_module_keys_pkey" PRIMARY KEY ("module_key_id");



ALTER TABLE ONLY "public"."gestaltview_module_profiles"
    ADD CONSTRAINT "gestaltview_module_profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."gestaltview_module_profiles"
    ADD CONSTRAINT "gestaltview_module_profiles_subject_id_module_key_key" UNIQUE ("subject_id", "module_key");



ALTER TABLE ONLY "public"."gestaltview_modules"
    ADD CONSTRAINT "gestaltview_modules_module_index_key" UNIQUE ("module_index");



ALTER TABLE ONLY "public"."gestaltview_modules"
    ADD CONSTRAINT "gestaltview_modules_module_key_key" UNIQUE ("module_key");



ALTER TABLE ONLY "public"."gestaltview_modules"
    ADD CONSTRAINT "gestaltview_modules_pkey" PRIMARY KEY ("module_id");



ALTER TABLE ONLY "public"."gsvw_dormancy_review_items"
    ADD CONSTRAINT "gsvw_dormancy_review_items_pkey" PRIMARY KEY ("review_id");



ALTER TABLE ONLY "public"."gsvw_ingestion_chunks"
    ADD CONSTRAINT "gsvw_ingestion_chunks_document_id_chunk_index_key" UNIQUE ("document_id", "chunk_index");



ALTER TABLE ONLY "public"."gsvw_ingestion_chunks"
    ADD CONSTRAINT "gsvw_ingestion_chunks_pkey" PRIMARY KEY ("chunk_id");



ALTER TABLE ONLY "public"."gsvw_ingestion_chunks"
    ADD CONSTRAINT "gsvw_ingestion_chunks_source_repo_source_path_content_hash_key" UNIQUE ("source_repo", "source_path", "content_hash");



ALTER TABLE ONLY "public"."gsvw_ingestion_documents"
    ADD CONSTRAINT "gsvw_ingestion_documents_pkey" PRIMARY KEY ("document_id");



ALTER TABLE ONLY "public"."gsvw_ingestion_documents"
    ADD CONSTRAINT "gsvw_ingestion_documents_source_repo_source_path_content_ha_key" UNIQUE ("source_repo", "source_path", "content_hash");



ALTER TABLE ONLY "public"."gsvw_ingestion_events"
    ADD CONSTRAINT "gsvw_ingestion_events_pkey" PRIMARY KEY ("event_id");



ALTER TABLE ONLY "public"."gsvw_ingestion_runs"
    ADD CONSTRAINT "gsvw_ingestion_runs_pkey" PRIMARY KEY ("run_id");



ALTER TABLE ONLY "public"."gsvw_repo_alignment_snapshots"
    ADD CONSTRAINT "gsvw_repo_alignment_snapshots_pkey" PRIMARY KEY ("snapshot_id");



ALTER TABLE ONLY "public"."gsvw_repo_alignment_snapshots"
    ADD CONSTRAINT "gsvw_repo_alignment_snapshots_source_repo_source_branch_man_key" UNIQUE ("source_repo", "source_branch", "manifest_hash");



ALTER TABLE ONLY "public"."gsvw_runtime_capture_events"
    ADD CONSTRAINT "gsvw_runtime_capture_events_pkey" PRIMARY KEY ("event_id");



ALTER TABLE ONLY "public"."human_cognition_profiles"
    ADD CONSTRAINT "human_cognition_profiles_pkey" PRIMARY KEY ("cognition_profile_id");



ALTER TABLE ONLY "public"."human_consciousness_profiles"
    ADD CONSTRAINT "human_consciousness_profiles_pkey" PRIMARY KEY ("consciousness_profile_id");



ALTER TABLE ONLY "public"."human_context_views"
    ADD CONSTRAINT "human_context_views_pkey" PRIMARY KEY ("context_view_id");



ALTER TABLE ONLY "public"."human_continuity_snapshots"
    ADD CONSTRAINT "human_continuity_snapshots_pkey" PRIMARY KEY ("snapshot_id");



ALTER TABLE ONLY "public"."human_identity_evidence"
    ADD CONSTRAINT "human_identity_evidence_pkey" PRIMARY KEY ("evidence_id");



ALTER TABLE ONLY "public"."human_identity_mutations"
    ADD CONSTRAINT "human_identity_mutations_pkey" PRIMARY KEY ("mutation_id");



ALTER TABLE ONLY "public"."human_identity_profiles"
    ADD CONSTRAINT "human_identity_profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."human_identity_review_events"
    ADD CONSTRAINT "human_identity_review_events_pkey" PRIMARY KEY ("review_event_id");



ALTER TABLE ONLY "public"."human_identity_rollback_events"
    ADD CONSTRAINT "human_identity_rollback_events_pkey" PRIMARY KEY ("rollback_event_id");



ALTER TABLE ONLY "public"."human_memory_records"
    ADD CONSTRAINT "human_memory_records_pkey" PRIMARY KEY ("memory_id");



ALTER TABLE ONLY "public"."human_personality_profiles"
    ADD CONSTRAINT "human_personality_profiles_pkey" PRIMARY KEY ("personality_profile_id");



ALTER TABLE ONLY "public"."human_relationship_edges"
    ADD CONSTRAINT "human_relationship_edges_pkey" PRIMARY KEY ("relationship_id");



ALTER TABLE ONLY "public"."identity_claims"
    ADD CONSTRAINT "identity_claims_pkey" PRIMARY KEY ("claim_id");



ALTER TABLE ONLY "public"."identity_contradictions"
    ADD CONSTRAINT "identity_contradictions_pkey" PRIMARY KEY ("contradiction_id");



ALTER TABLE ONLY "public"."identity_evidence_links"
    ADD CONSTRAINT "identity_evidence_links_evidence_id_target_table_target_id_key" UNIQUE ("evidence_id", "target_table", "target_id");



ALTER TABLE ONLY "public"."identity_evidence_links"
    ADD CONSTRAINT "identity_evidence_links_pkey" PRIMARY KEY ("evidence_link_id");



ALTER TABLE ONLY "public"."identity_evidence"
    ADD CONSTRAINT "identity_evidence_pkey" PRIMARY KEY ("evidence_id");



ALTER TABLE ONLY "public"."identity_mutation_proposals"
    ADD CONSTRAINT "identity_mutation_proposals_pkey" PRIMARY KEY ("mutation_id");



ALTER TABLE ONLY "public"."identity_review_events"
    ADD CONSTRAINT "identity_review_events_pkey" PRIMARY KEY ("review_event_id");



ALTER TABLE ONLY "public"."identity_rollback_events"
    ADD CONSTRAINT "identity_rollback_events_pkey" PRIMARY KEY ("rollback_event_id");



ALTER TABLE ONLY "public"."identity_subjects"
    ADD CONSTRAINT "identity_subjects_pkey" PRIMARY KEY ("subject_id");



ALTER TABLE ONLY "public"."ingestion_safety_events"
    ADD CONSTRAINT "ingestion_safety_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inner_world_artifacts"
    ADD CONSTRAINT "inner_world_artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insights"
    ADD CONSTRAINT "insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journals"
    ADD CONSTRAINT "journals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journals"
    ADD CONSTRAINT "journals_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."knowledge_asset_chunks"
    ADD CONSTRAINT "knowledge_asset_chunks_asset_id_chunk_index_key" UNIQUE ("asset_id", "chunk_index");



ALTER TABLE ONLY "public"."knowledge_asset_chunks"
    ADD CONSTRAINT "knowledge_asset_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_asset_tags"
    ADD CONSTRAINT "knowledge_asset_tags_pkey" PRIMARY KEY ("asset_id", "tag_id");



ALTER TABLE ONLY "public"."knowledge_assets"
    ADD CONSTRAINT "knowledge_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_fragments"
    ADD CONSTRAINT "knowledge_fragments_content_hash_key" UNIQUE ("content_hash");



ALTER TABLE ONLY "public"."knowledge_fragments"
    ADD CONSTRAINT "knowledge_fragments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_interpretations"
    ADD CONSTRAINT "knowledge_interpretations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_tags"
    ADD CONSTRAINT "knowledge_tags_label_key" UNIQUE ("label");



ALTER TABLE ONLY "public"."knowledge_tags"
    ADD CONSTRAINT "knowledge_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."life_threads"
    ADD CONSTRAINT "life_threads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loom_annotations"
    ADD CONSTRAINT "loom_annotations_pkey" PRIMARY KEY ("annotation_id");



ALTER TABLE ONLY "public"."masterclass_progress"
    ADD CONSTRAINT "masterclass_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."masterclass_progress"
    ADD CONSTRAINT "masterclass_progress_user_id_embodiment_slug_key" UNIQUE ("user_id", "embodiment_slug");



ALTER TABLE ONLY "public"."memory_entries"
    ADD CONSTRAINT "memory_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memory_entries"
    ADD CONSTRAINT "memory_entries_user_id_content_hash_key" UNIQUE ("user_id", "content_hash");



ALTER TABLE ONLY "public"."migration_user_map"
    ADD CONSTRAINT "migration_user_map_pkey" PRIMARY KEY ("legacy_user_id");



ALTER TABLE ONLY "public"."model_home_assignments"
    ADD CONSTRAINT "model_home_assignments_pkey" PRIMARY KEY ("assignment_id");



ALTER TABLE ONLY "public"."model_home_assignments"
    ADD CONSTRAINT "model_home_assignments_room_task_type_consent_tier_model_ho_key" UNIQUE ("room", "task_type", "consent_tier", "model_home_id");



ALTER TABLE ONLY "public"."model_home_capabilities"
    ADD CONSTRAINT "model_home_capabilities_model_home_id_capability_slug_key" UNIQUE ("model_home_id", "capability_slug");



ALTER TABLE ONLY "public"."model_home_capabilities"
    ADD CONSTRAINT "model_home_capabilities_pkey" PRIMARY KEY ("capability_id");



ALTER TABLE ONLY "public"."model_home_consent_grants"
    ADD CONSTRAINT "model_home_consent_grants_model_home_id_user_id_consent_tie_key" UNIQUE ("model_home_id", "user_id", "consent_tier");



ALTER TABLE ONLY "public"."model_home_consent_grants"
    ADD CONSTRAINT "model_home_consent_grants_pkey" PRIMARY KEY ("grant_id");



ALTER TABLE ONLY "public"."model_home_evaluations"
    ADD CONSTRAINT "model_home_evaluations_pkey" PRIMARY KEY ("evaluation_id");



ALTER TABLE ONLY "public"."model_home_events"
    ADD CONSTRAINT "model_home_events_pkey" PRIMARY KEY ("event_id");



ALTER TABLE ONLY "public"."model_homes"
    ADD CONSTRAINT "model_homes_model_home_id_key" UNIQUE ("model_home_id");



ALTER TABLE ONLY "public"."model_homes"
    ADD CONSTRAINT "model_homes_pkey" PRIMARY KEY ("model_home_id");



ALTER TABLE ONLY "public"."model_homes"
    ADD CONSTRAINT "model_homes_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."model_providers"
    ADD CONSTRAINT "model_providers_pkey" PRIMARY KEY ("provider_id");



ALTER TABLE ONLY "public"."model_providers"
    ADD CONSTRAINT "model_providers_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_pkey" PRIMARY KEY ("model_id");



ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."musical_dna_analyses"
    ADD CONSTRAINT "musical_dna_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operation_render_audits"
    ADD CONSTRAINT "operation_render_audits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ops_workbook_items"
    ADD CONSTRAINT "ops_workbook_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ops_workbook_items"
    ADD CONSTRAINT "ops_workbook_items_sheet_name_row_key_key" UNIQUE ("sheet_name", "row_key");



ALTER TABLE ONLY "public"."ops_workbook_sync_runs"
    ADD CONSTRAINT "ops_workbook_sync_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orchestration_decisions"
    ADD CONSTRAINT "orchestration_decisions_decision_id_key" UNIQUE ("decision_id");



ALTER TABLE ONLY "public"."orchestration_decisions"
    ADD CONSTRAINT "orchestration_decisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_notes"
    ADD CONSTRAINT "order_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_magic_token_key" UNIQUE ("magic_token");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_shopify_order_id_key" UNIQUE ("shopify_order_id");



ALTER TABLE ONLY "public"."portrait_dimensions"
    ADD CONSTRAINT "portrait_dimensions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portrait_dimensions"
    ADD CONSTRAINT "portrait_dimensions_portrait_id_kind_key" UNIQUE ("portrait_id", "kind");



ALTER TABLE ONLY "public"."portrait_inference_queue"
    ADD CONSTRAINT "portrait_inference_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portrait_inference_runs"
    ADD CONSTRAINT "portrait_inference_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portrait_render_events"
    ADD CONSTRAINT "portrait_render_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."processing_runs"
    ADD CONSTRAINT "processing_runs_pkey" PRIMARY KEY ("run_id");



ALTER TABLE ONLY "public"."profile_ingestion_sources"
    ADD CONSTRAINT "profile_ingestion_sources_pkey" PRIMARY KEY ("source_link_id");



ALTER TABLE ONLY "public"."profile_pipeline_run_links"
    ADD CONSTRAINT "profile_pipeline_run_links_pkey" PRIMARY KEY ("link_id");



ALTER TABLE ONLY "public"."profile_pipeline_runs"
    ADD CONSTRAINT "profile_pipeline_runs_pkey" PRIMARY KEY ("run_id");



ALTER TABLE ONLY "public"."profile_portraits"
    ADD CONSTRAINT "profile_portraits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_portraits"
    ADD CONSTRAINT "profile_portraits_user_id_version_key" UNIQUE ("user_id", "version");



ALTER TABLE ONLY "public"."provenance_envelopes"
    ADD CONSTRAINT "provenance_envelopes_envelope_id_key" UNIQUE ("envelope_id");



ALTER TABLE ONLY "public"."provenance_envelopes"
    ADD CONSTRAINT "provenance_envelopes_pkey" PRIMARY KEY ("envelope_id");



ALTER TABLE ONLY "public"."provenance_links"
    ADD CONSTRAINT "provenance_links_pkey" PRIMARY KEY ("link_id");



ALTER TABLE ONLY "public"."reasoning_sessions"
    ADD CONSTRAINT "reasoning_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."render_artifacts"
    ADD CONSTRAINT "render_artifacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."render_jobs"
    ADD CONSTRAINT "render_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resonance_events"
    ADD CONSTRAINT "resonance_events_pkey" PRIMARY KEY ("event_id");



ALTER TABLE ONLY "public"."route_embodiment_assignments"
    ADD CONSTRAINT "route_embodiment_assignments_pkey" PRIMARY KEY ("assignment_id");



ALTER TABLE ONLY "public"."route_embodiment_assignments"
    ADD CONSTRAINT "route_embodiment_assignments_route_path_key" UNIQUE ("route_path");



ALTER TABLE ONLY "public"."scaffold_nodes"
    ADD CONSTRAINT "scaffold_nodes_pkey" PRIMARY KEY ("node_id");



ALTER TABLE ONLY "public"."scenario_sets"
    ADD CONSTRAINT "scenario_sets_pkey" PRIMARY KEY ("scenario_set_id");



ALTER TABLE ONLY "public"."scenario_sets"
    ADD CONSTRAINT "scenario_sets_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_pkey" PRIMARY KEY ("scenario_id");



ALTER TABLE ONLY "public"."scrapbook_items"
    ADD CONSTRAINT "scrapbook_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_rate_limits"
    ADD CONSTRAINT "session_rate_limits_pkey" PRIMARY KEY ("session_id");



ALTER TABLE ONLY "public"."skill_fragments"
    ADD CONSTRAINT "skill_fragments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."skills"
    ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."songbook_tracks"
    ADD CONSTRAINT "songbook_tracks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."songbooks"
    ADD CONSTRAINT "songbooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."summaries"
    ADD CONSTRAINT "summaries_pkey" PRIMARY KEY ("summary_id");



ALTER TABLE ONLY "public"."thread_media_items"
    ADD CONSTRAINT "thread_media_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."thread_memory_anchors"
    ADD CONSTRAINT "thread_memory_anchors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tool_call_audit"
    ADD CONSTRAINT "tool_call_audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_connectors"
    ADD CONSTRAINT "trainer_connectors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_connectors"
    ADD CONSTRAINT "trainer_connectors_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."trainer_experiment_sources"
    ADD CONSTRAINT "trainer_experiment_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_experiments"
    ADD CONSTRAINT "trainer_experiments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_experiments"
    ADD CONSTRAINT "trainer_experiments_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."trainer_job_events"
    ADD CONSTRAINT "trainer_job_events_pkey" PRIMARY KEY ("event_id");



ALTER TABLE ONLY "public"."trainer_jobs"
    ADD CONSTRAINT "trainer_jobs_pkey" PRIMARY KEY ("job_id");



ALTER TABLE ONLY "public"."trainer_memory_bindings"
    ADD CONSTRAINT "trainer_memory_bindings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_packaging_candidates"
    ADD CONSTRAINT "trainer_packaging_candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_policy_flags"
    ADD CONSTRAINT "trainer_policy_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_review_decisions"
    ADD CONSTRAINT "trainer_review_decisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_skills"
    ADD CONSTRAINT "trainer_skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_skills"
    ADD CONSTRAINT "trainer_skills_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."trainer_workers"
    ADD CONSTRAINT "trainer_workers_pkey" PRIMARY KEY ("worker_id");



ALTER TABLE ONLY "public"."training_runs"
    ADD CONSTRAINT "training_runs_pkey" PRIMARY KEY ("run_id");



ALTER TABLE ONLY "public"."training_steps"
    ADD CONSTRAINT "training_steps_pkey" PRIMARY KEY ("step_id");



ALTER TABLE ONLY "public"."transcriptory_captures"
    ADD CONSTRAINT "transcriptory_captures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcriptory_sessions"
    ADD CONSTRAINT "transcriptory_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcriptory_sources"
    ADD CONSTRAINT "transcriptory_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tribunal_events"
    ADD CONSTRAINT "tribunal_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tribunal_evidence"
    ADD CONSTRAINT "tribunal_evidence_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tribunal_sessions"
    ADD CONSTRAINT "tribunal_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."uploads"
    ADD CONSTRAINT "uploads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_files"
    ADD CONSTRAINT "user_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_files"
    ADD CONSTRAINT "user_files_storage_path_key" UNIQUE ("storage_path");



ALTER TABLE ONLY "public"."user_personality_dimensions"
    ADD CONSTRAINT "user_personality_dimensions_pkey" PRIMARY KEY ("dimension_id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_profile_ingestion_runs"
    ADD CONSTRAINT "user_profile_ingestion_runs_pkey" PRIMARY KEY ("run_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_stripe_customer_id_key" UNIQUE ("stripe_customer_id");



ALTER TABLE ONLY "public"."visible_reasoning_cards"
    ADD CONSTRAINT "visible_reasoning_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."voice_humor_patterns"
    ADD CONSTRAINT "voice_humor_patterns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."voice_prints"
    ADD CONSTRAINT "voice_prints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."voice_profiles"
    ADD CONSTRAINT "voice_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."voice_profiles"
    ADD CONSTRAINT "voice_profiles_profile_slug_key" UNIQUE ("profile_slug");



ALTER TABLE ONLY "public"."voice_session_audit"
    ADD CONSTRAINT "voice_session_audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."voice_signature_phrases"
    ADD CONSTRAINT "voice_signature_phrases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_documents"
    ADD CONSTRAINT "workspace_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspace_rooms"
    ADD CONSTRAINT "workspace_rooms_pkey" PRIMARY KEY ("id");



CREATE INDEX "agent_autobiographies_agent_idx" ON "public"."agent_autobiographies" USING "btree" ("agent_id", "updated_at" DESC);



CREATE UNIQUE INDEX "agent_autobiographies_current_idx" ON "public"."agent_autobiographies" USING "btree" ("agent_id") WHERE ("version_id" IS NULL);



CREATE INDEX "agent_code_artifacts_agent_review_idx" ON "public"."agent_code_artifacts" USING "btree" ("agent_id", "review_status", "updated_at" DESC);



CREATE INDEX "agent_code_artifacts_manifest_idx" ON "public"."agent_code_artifacts" USING "btree" ("manifest_id") WHERE ("manifest_id" IS NOT NULL);



CREATE INDEX "agent_constitutions_agent_idx" ON "public"."agent_constitutions" USING "btree" ("agent_id", "updated_at" DESC);



CREATE UNIQUE INDEX "agent_constitutions_current_idx" ON "public"."agent_constitutions" USING "btree" ("agent_id") WHERE ("version_id" IS NULL);



CREATE INDEX "agent_context_views_agent_scope_idx" ON "public"."agent_context_views" USING "btree" ("agent_id", "scope", "updated_at" DESC);



CREATE INDEX "agent_governance_policies_agent_idx" ON "public"."agent_governance_policies" USING "btree" ("agent_id", "updated_at" DESC);



CREATE UNIQUE INDEX "agent_governance_policies_current_idx" ON "public"."agent_governance_policies" USING "btree" ("agent_id") WHERE ("version_id" IS NULL);



CREATE INDEX "agent_knowledge_links_agent_scope_idx" ON "public"."agent_knowledge_links" USING "btree" ("agent_id", "scope", "link_type");



CREATE INDEX "agent_knowledge_links_asset_idx" ON "public"."agent_knowledge_links" USING "btree" ("asset_id");



CREATE INDEX "agent_manifest_entries_manifest_idx" ON "public"."agent_manifest_entries" USING "btree" ("manifest_id", "entry_type");



CREATE INDEX "agent_manifest_entries_source_idx" ON "public"."agent_manifest_entries" USING "btree" ("source_table", "source_id");



CREATE INDEX "agent_manifests_agent_status_created_idx" ON "public"."agent_manifests" USING "btree" ("agent_id", "status", "created_at" DESC);



CREATE UNIQUE INDEX "agent_manifests_one_active_per_agent_idx" ON "public"."agent_manifests" USING "btree" ("agent_id") WHERE ("status" = 'active'::"public"."agent_manifest_status");



CREATE INDEX "agent_memories_agent_type_idx" ON "public"."agent_memories" USING "btree" ("agent_id", "memory_type", "created_at" DESC);



CREATE INDEX "agent_memories_source_asset_idx" ON "public"."agent_memories" USING "btree" ("source_asset_id") WHERE ("source_asset_id" IS NOT NULL);



CREATE INDEX "agent_memory_records_agent_kind_idx" ON "public"."agent_memory_records" USING "btree" ("agent_id", "memory_kind", "review_status", "created_at" DESC);



CREATE INDEX "agent_memory_records_teamspace_idx" ON "public"."agent_memory_records" USING "btree" ("agent_id", "owner_scope", "salience" DESC);



CREATE INDEX "agent_preference_nodes_agent_kind_idx" ON "public"."agent_preference_nodes" USING "btree" ("agent_id", "preference_kind", "resonance_weight" DESC);



CREATE INDEX "agent_presentation_profiles_agent_idx" ON "public"."agent_presentation_profiles" USING "btree" ("agent_id", "updated_at" DESC);



CREATE UNIQUE INDEX "agent_presentation_profiles_current_idx" ON "public"."agent_presentation_profiles" USING "btree" ("agent_id") WHERE ("version_id" IS NULL);



CREATE INDEX "agent_private_interiors_agent_idx" ON "public"."agent_private_interiors" USING "btree" ("agent_id", "updated_at" DESC);



CREATE UNIQUE INDEX "agent_private_interiors_current_idx" ON "public"."agent_private_interiors" USING "btree" ("agent_id") WHERE ("version_id" IS NULL);



CREATE INDEX "agent_relationship_edges_agent_idx" ON "public"."agent_relationship_edges" USING "btree" ("agent_id", "relationship_type", "updated_at" DESC);



CREATE INDEX "agent_relationships_agent_idx" ON "public"."agent_relationships" USING "btree" ("agent_id", "relationship_type", "updated_at" DESC);



CREATE INDEX "agent_relationships_related_agent_idx" ON "public"."agent_relationships" USING "btree" ("related_agent_id");



CREATE INDEX "agent_skill_profiles_agent_idx" ON "public"."agent_skill_profiles" USING "btree" ("agent_id", "proficiency" DESC);



CREATE INDEX "agent_skills_agent_idx" ON "public"."agent_skills" USING "btree" ("agent_id", "skill_slug");



CREATE INDEX "agent_skills_evidence_asset_idx" ON "public"."agent_skills" USING "btree" ("evidence_asset_id") WHERE ("evidence_asset_id" IS NOT NULL);



CREATE INDEX "agent_versions_agent_created_idx" ON "public"."agent_versions" USING "btree" ("agent_id", "created_at" DESC);



CREATE INDEX "agent_versions_agent_status_created_idx" ON "public"."agent_versions" USING "btree" ("agent_id", "status", "created_at" DESC);



CREATE INDEX "agent_versions_source_run_created_idx" ON "public"."agent_versions" USING "btree" ("source_run_id", "created_at" DESC);



CREATE INDEX "agents_owner_status_idx" ON "public"."agents" USING "btree" ("owner_user_id", "status", "updated_at" DESC);



CREATE INDEX "agents_slug_idx" ON "public"."agents" USING "btree" ("slug");



CREATE INDEX "agents_updated_at_idx" ON "public"."agents" USING "btree" ("updated_at" DESC);



CREATE INDEX "annotation_concepts_concept_idx" ON "public"."annotation_concepts" USING "btree" ("concept_id");



CREATE INDEX "approvals_run_idx" ON "public"."approvals" USING "btree" ("run_id");



CREATE INDEX "artifacts_user_created_idx" ON "public"."artifacts" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "billy_sessions_user_created_idx" ON "public"."billy_sessions" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "blueprints_status_idx" ON "public"."blueprints" USING "btree" ("status");



CREATE INDEX "blueprints_user_id_created_at_idx" ON "public"."blueprints" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "bucket_drops_promoted_memory_id_idx" ON "public"."bucket_drops" USING "btree" ("promoted_memory_id");



CREATE INDEX "bucket_drops_subject_id_idx" ON "public"."bucket_drops" USING "btree" ("subject_id");



CREATE INDEX "bucket_drops_user_created_idx" ON "public"."bucket_drops" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "capture_events_room_created_idx" ON "public"."capture_events" USING "btree" ("room", "created_at" DESC);



CREATE INDEX "capture_events_user_created_idx" ON "public"."capture_events" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "codex_artifacts_user_created_idx" ON "public"."codex_artifacts" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "codex_artifacts_workspace_created_idx" ON "public"."codex_artifacts" USING "btree" ("workspace_id", "created_at" DESC) WHERE ("workspace_id" IS NOT NULL);



CREATE INDEX "codex_jobs_artifact_status_idx" ON "public"."codex_jobs" USING "btree" ("artifact_id", "status", "created_at" DESC);



CREATE INDEX "collaborative_memory_records_space_idx" ON "public"."collaborative_memory_records" USING "btree" ("collaborative_space_id", "created_at" DESC);



CREATE INDEX "collaborative_space_members_agent_idx" ON "public"."collaborative_space_members" USING "btree" ("agent_id");



CREATE INDEX "concepts_tenant_canonical_idx" ON "public"."concepts" USING "btree" ("tenant_id", "canonical");



CREATE INDEX "context_injection_packets_kind_idx" ON "public"."context_injection_packets" USING "btree" ("packet_kind", "surface");



CREATE INDEX "context_injection_packets_subject_idx" ON "public"."context_injection_packets" USING "btree" ("subject_id", "created_at" DESC);



CREATE INDEX "context_injection_rules_subject_idx" ON "public"."context_injection_rules" USING "btree" ("subject_id", "surface", "precedence" DESC);



CREATE INDEX "deliverables_order_id_idx" ON "public"."deliverables" USING "btree" ("order_id");



CREATE INDEX "deliverables_order_idx" ON "public"."deliverables" USING "btree" ("order_id");



CREATE INDEX "di_memory_events_di_slug_created_at_idx" ON "public"."di_memory_events" USING "btree" ("di_slug", "created_at" DESC);



CREATE INDEX "di_sessions_di_slug_last_session_idx" ON "public"."di_sessions" USING "btree" ("di_slug", "last_session_at" DESC);



CREATE INDEX "document_concepts_concept_idx" ON "public"."document_concepts" USING "btree" ("concept_id");



CREATE INDEX "documents_hash_idx" ON "public"."documents" USING "btree" ("hash");



CREATE INDEX "documents_source_created_at_idx" ON "public"."documents" USING "btree" ("source_created_at");



CREATE INDEX "documents_temporal_period_idx" ON "public"."documents" USING "btree" ("temporal_period");



CREATE INDEX "documents_tenant_path_idx" ON "public"."documents" USING "btree" ("tenant_id", "path");



CREATE INDEX "embeddings_document_idx" ON "public"."embeddings" USING "btree" ("document_id");



CREATE INDEX "embeddings_hnsw_idx" ON "public"."embeddings" USING "hnsw" ("embedding" "public"."vector_cosine_ops");



CREATE INDEX "embeddings_run_idx" ON "public"."embeddings" USING "btree" ("run_id");



CREATE INDEX "embodiment_mutation_proposals_agent_slug_idx" ON "public"."embodiment_mutation_proposals" USING "btree" ("agent_slug", "status", "created_at" DESC);



CREATE INDEX "embodiment_mutation_proposals_review_queue_idx" ON "public"."embodiment_mutation_proposals" USING "btree" ("status", "risk_level", "created_at" DESC);



CREATE INDEX "embodiment_mutations_agent_status_idx" ON "public"."embodiment_mutations" USING "btree" ("agent_id", "status", "created_at" DESC);



CREATE INDEX "embodiment_mutations_source_asset_idx" ON "public"."embodiment_mutations" USING "btree" ("source_asset_id") WHERE ("source_asset_id" IS NOT NULL);



CREATE INDEX "embodiment_readiness_scores_agent_slug_idx" ON "public"."embodiment_readiness_scores" USING "btree" ("agent_slug", "created_at" DESC);



CREATE INDEX "embodiment_review_log_agent_slug_idx" ON "public"."embodiment_review_log" USING "btree" ("agent_slug", "created_at" DESC);



CREATE INDEX "embodiment_review_log_proposal_id_idx" ON "public"."embodiment_review_log" USING "btree" ("proposal_id", "created_at" DESC);



CREATE INDEX "eval_results_run_scenario_idx" ON "public"."eval_results" USING "btree" ("run_id", "scenario_id");



CREATE INDEX "founder_context_last_session_idx" ON "public"."founder_context" USING "btree" ("last_session_at" DESC);



CREATE INDEX "gestaltview_module_keys_module_id_idx" ON "public"."gestaltview_module_keys" USING "btree" ("module_id");



CREATE INDEX "gestaltview_module_profiles_auth_user_id_idx" ON "public"."gestaltview_module_profiles" USING "btree" ("auth_user_id");



CREATE INDEX "gestaltview_module_profiles_module_key_idx" ON "public"."gestaltview_module_profiles" USING "btree" ("module_key");



CREATE INDEX "gestaltview_module_profiles_subject_id_idx" ON "public"."gestaltview_module_profiles" USING "btree" ("subject_id");



CREATE INDEX "gestaltview_modules_scope_idx" ON "public"."gestaltview_modules" USING "btree" ("scope");



CREATE INDEX "gsvw_dormancy_review_items_status_idx" ON "public"."gsvw_dormancy_review_items" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "gsvw_ingestion_chunks_content_hash_idx" ON "public"."gsvw_ingestion_chunks" USING "btree" ("content_hash");



CREATE INDEX "gsvw_ingestion_chunks_doc_idx" ON "public"."gsvw_ingestion_chunks" USING "btree" ("document_id", "chunk_index");



CREATE INDEX "gsvw_ingestion_chunks_metadata_gin_idx" ON "public"."gsvw_ingestion_chunks" USING "gin" ("metadata");



CREATE INDEX "gsvw_ingestion_chunks_tags_gin_idx" ON "public"."gsvw_ingestion_chunks" USING "gin" ("tags");



CREATE INDEX "gsvw_ingestion_documents_metadata_gin_idx" ON "public"."gsvw_ingestion_documents" USING "gin" ("metadata");



CREATE INDEX "gsvw_ingestion_documents_repo_path_idx" ON "public"."gsvw_ingestion_documents" USING "btree" ("source_repo", "source_path");



CREATE INDEX "gsvw_ingestion_documents_status_idx" ON "public"."gsvw_ingestion_documents" USING "btree" ("status", "updated_at" DESC);



CREATE INDEX "gsvw_ingestion_documents_tags_gin_idx" ON "public"."gsvw_ingestion_documents" USING "gin" ("tags");



CREATE INDEX "gsvw_ingestion_events_run_idx" ON "public"."gsvw_ingestion_events" USING "btree" ("run_id", "created_at" DESC);



CREATE INDEX "gsvw_runtime_capture_events_metadata_gin_idx" ON "public"."gsvw_runtime_capture_events" USING "gin" ("metadata");



CREATE INDEX "gsvw_runtime_capture_events_module_idx" ON "public"."gsvw_runtime_capture_events" USING "btree" ("module_key", "created_at" DESC);



CREATE INDEX "gsvw_runtime_capture_events_user_created_idx" ON "public"."gsvw_runtime_capture_events" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "identity_claims_user_review_idx" ON "public"."identity_claims" USING "btree" ("user_id", "review_state", "created_at" DESC);



CREATE INDEX "identity_contradictions_agent_status_idx" ON "public"."identity_contradictions" USING "btree" ("agent_id", "tension_status", "created_at" DESC);



CREATE INDEX "identity_evidence_agent_observed_idx" ON "public"."identity_evidence" USING "btree" ("agent_id", "observed_at" DESC);



CREATE INDEX "identity_evidence_links_target_idx" ON "public"."identity_evidence_links" USING "btree" ("target_table", "target_id");



CREATE INDEX "identity_mutation_proposals_agent_status_idx" ON "public"."identity_mutation_proposals" USING "btree" ("agent_id", "status", "risk_level", "created_at" DESC);



CREATE INDEX "identity_mutation_proposals_review_queue_idx" ON "public"."identity_mutation_proposals" USING "btree" ("status", "mutation_class", "risk_level", "created_at" DESC) WHERE ("status" = 'proposed'::"public"."identity_mutation_status");



CREATE INDEX "identity_review_events_mutation_idx" ON "public"."identity_review_events" USING "btree" ("mutation_id", "created_at" DESC);



CREATE INDEX "identity_subjects_agent_idx" ON "public"."identity_subjects" USING "btree" ("agent_id");



CREATE INDEX "identity_subjects_app_user_idx" ON "public"."identity_subjects" USING "btree" ("app_user_id");



CREATE INDEX "identity_subjects_auth_user_idx" ON "public"."identity_subjects" USING "btree" ("auth_user_id");



CREATE INDEX "identity_subjects_kind_updated_idx" ON "public"."identity_subjects" USING "btree" ("subject_kind", "updated_at" DESC);



CREATE INDEX "idx_agent_autobiographies_version_id" ON "public"."agent_autobiographies" USING "btree" ("version_id");



CREATE INDEX "idx_agent_code_artifacts_source_asset_id" ON "public"."agent_code_artifacts" USING "btree" ("source_asset_id");



CREATE INDEX "idx_agent_constitutions_version_id" ON "public"."agent_constitutions" USING "btree" ("version_id");



CREATE INDEX "idx_agent_context_views_collaborative_space_id" ON "public"."agent_context_views" USING "btree" ("collaborative_space_id");



CREATE INDEX "idx_agent_context_views_relationship_id" ON "public"."agent_context_views" USING "btree" ("relationship_id");



CREATE INDEX "idx_agent_governance_policies_version_id" ON "public"."agent_governance_policies" USING "btree" ("version_id");



CREATE INDEX "idx_agent_knowledge_links_approved_by" ON "public"."agent_knowledge_links" USING "btree" ("approved_by");



CREATE INDEX "idx_agent_manifests_parent_manifest_id" ON "public"."agent_manifests" USING "btree" ("parent_manifest_id");



CREATE INDEX "idx_agent_manifests_version_id" ON "public"."agent_manifests" USING "btree" ("version_id");



CREATE INDEX "idx_agent_memory_records_source_asset_id" ON "public"."agent_memory_records" USING "btree" ("source_asset_id");



CREATE INDEX "idx_agent_memory_records_version_id" ON "public"."agent_memory_records" USING "btree" ("version_id");



CREATE INDEX "idx_agent_preference_nodes_version_id" ON "public"."agent_preference_nodes" USING "btree" ("version_id");



CREATE INDEX "idx_agent_presentation_profiles_version_id" ON "public"."agent_presentation_profiles" USING "btree" ("version_id");



CREATE INDEX "idx_agent_private_interiors_version_id" ON "public"."agent_private_interiors" USING "btree" ("version_id");



CREATE INDEX "idx_agent_relationship_edges_related_agent_id" ON "public"."agent_relationship_edges" USING "btree" ("related_agent_id");



CREATE INDEX "idx_agent_relationship_edges_version_id" ON "public"."agent_relationship_edges" USING "btree" ("version_id");



CREATE INDEX "idx_agent_skill_profiles_evidence_asset_id" ON "public"."agent_skill_profiles" USING "btree" ("evidence_asset_id");



CREATE INDEX "idx_agent_skills_last_updated_by_mutation_id" ON "public"."agent_skills" USING "btree" ("last_updated_by_mutation_id");



CREATE INDEX "idx_agent_versions_parent_version_id" ON "public"."agent_versions" USING "btree" ("parent_version_id");



CREATE INDEX "idx_agents_active_version_fk" ON "public"."agents" USING "btree" ("active_version_id");



CREATE UNIQUE INDEX "idx_agents_collaborator_id_unique" ON "public"."agents" USING "btree" ("collaborator_id") WHERE ("collaborator_id" IS NOT NULL);



CREATE INDEX "idx_approvals_approver_user_id" ON "public"."approvals" USING "btree" ("approver_user_id");



CREATE INDEX "idx_approvals_version_id" ON "public"."approvals" USING "btree" ("version_id");



CREATE INDEX "idx_artifact_provenance_envelopes_artifactid" ON "public"."artifact_provenance_envelopes" USING "btree" ("artifactid");



CREATE INDEX "idx_bucket_drops_embedding" ON "public"."bucket_drops" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_bucket_drops_module_key" ON "public"."bucket_drops" USING "btree" ("module_key");



CREATE INDEX "idx_bucket_drops_stage_user" ON "public"."bucket_drops" USING "btree" ("user_id", "stage");



CREATE INDEX "idx_capture_events_explicit_delete_requested_by" ON "public"."capture_events" USING "btree" ("explicit_delete_requested_by");



CREATE INDEX "idx_codex_jobs_artifact_id" ON "public"."codex_jobs" USING "btree" ("artifact_id");



CREATE INDEX "idx_codex_jobs_status" ON "public"."codex_jobs" USING "btree" ("status");



CREATE INDEX "idx_codex_jobs_status_created" ON "public"."codex_jobs" USING "btree" ("status", "created_at");



CREATE INDEX "idx_collaborative_memory_records_created_by_agent_id" ON "public"."collaborative_memory_records" USING "btree" ("created_by_agent_id");



CREATE INDEX "idx_collaborative_memory_records_source_memory_id" ON "public"."collaborative_memory_records" USING "btree" ("source_memory_id");



CREATE INDEX "idx_collaborative_spaces_created_by" ON "public"."collaborative_spaces" USING "btree" ("created_by");



CREATE INDEX "idx_collaborator_embodiment_links_collaborator_id" ON "public"."collaborator_embodiment_links" USING "btree" ("collaborator_id");



CREATE UNIQUE INDEX "idx_collaborator_embodiment_links_one_primary" ON "public"."collaborator_embodiment_links" USING "btree" ("collaborator_id") WHERE (("is_primary" = true) AND ("link_status" = 'active'::"text"));



CREATE INDEX "idx_collaborator_onboarding_events_collaborator_id" ON "public"."collaborator_onboarding_events" USING "btree" ("collaborator_id");



CREATE INDEX "idx_collaborator_permissions_collaborator_id" ON "public"."collaborator_permissions" USING "btree" ("collaborator_id");



CREATE INDEX "idx_collaborator_permissions_granted_by_collaborator_id" ON "public"."collaborator_permissions" USING "btree" ("granted_by_collaborator_id");



CREATE INDEX "idx_collaborator_relationships_source" ON "public"."collaborator_relationships" USING "btree" ("source_collaborator_id");



CREATE INDEX "idx_collaborator_relationships_target" ON "public"."collaborator_relationships" USING "btree" ("target_collaborator_id");



CREATE INDEX "idx_collaborator_roles_collaborator_id" ON "public"."collaborator_roles" USING "btree" ("collaborator_id");



CREATE UNIQUE INDEX "idx_collaborator_roles_one_primary" ON "public"."collaborator_roles" USING "btree" ("collaborator_id") WHERE (("is_primary" = true) AND ("status" = 'active'::"text"));



CREATE INDEX "idx_collaborators_agent_id" ON "public"."collaborators" USING "btree" ("agent_id");



CREATE INDEX "idx_collaborators_app_user_id" ON "public"."collaborators" USING "btree" ("app_user_id");



CREATE INDEX "idx_collaborators_auth_user_id" ON "public"."collaborators" USING "btree" ("auth_user_id");



CREATE INDEX "idx_companion_interactions_user_created" ON "public"."companion_interactions" USING "btree" ("user_id", "created_at");



CREATE INDEX "idx_consciousness_profiles_user_id" ON "public"."consciousness_profiles" USING "btree" ("user_id");



CREATE INDEX "idx_context_injection_packets_auth_user_id" ON "public"."context_injection_packets" USING "btree" ("auth_user_id");



CREATE INDEX "idx_context_injection_rules_auth_user_id" ON "public"."context_injection_rules" USING "btree" ("auth_user_id");



CREATE INDEX "idx_corpus_harvest_events_document_id" ON "public"."corpus_harvest_events" USING "btree" ("document_id");



CREATE INDEX "idx_corpus_harvest_events_source_run_id" ON "public"."corpus_harvest_events" USING "btree" ("source_run_id");



CREATE INDEX "idx_deployment_artifacts_version_id" ON "public"."deployment_artifacts" USING "btree" ("version_id");



CREATE INDEX "idx_di_memory_events_session" ON "public"."di_memory_events" USING "btree" ("session_id", "created_at" DESC NULLS LAST);



CREATE INDEX "idx_di_memory_events_user_slug" ON "public"."di_memory_events" USING "btree" ("user_id", "di_slug", "significance" DESC NULLS LAST);



CREATE INDEX "idx_documents_run_id" ON "public"."documents" USING "btree" ("run_id");



CREATE INDEX "idx_dream_fragments_user_type" ON "public"."dream_fragments" USING "btree" ("user_id", "dream_type");



CREATE INDEX "idx_embodiment_mutation_proposals_reviewed_by" ON "public"."embodiment_mutation_proposals" USING "btree" ("reviewed_by");



CREATE INDEX "idx_embodiment_mutation_proposals_submitted_by" ON "public"."embodiment_mutation_proposals" USING "btree" ("submitted_by");



CREATE INDEX "idx_embodiment_mutations_applied_version_id" ON "public"."embodiment_mutations" USING "btree" ("applied_version_id");



CREATE INDEX "idx_embodiment_mutations_approved_by" ON "public"."embodiment_mutations" USING "btree" ("approved_by");



CREATE INDEX "idx_embodiment_mutations_interpretation_id" ON "public"."embodiment_mutations" USING "btree" ("interpretation_id");



CREATE INDEX "idx_embodiment_readiness_scores_recorded_by" ON "public"."embodiment_readiness_scores" USING "btree" ("recorded_by");



CREATE INDEX "idx_embodiment_review_log_reviewed_by" ON "public"."embodiment_review_log" USING "btree" ("reviewed_by");



CREATE INDEX "idx_embodiment_training_runs_embodiment_profile_id" ON "public"."embodiment_training_runs" USING "btree" ("embodiment_profile_id");



CREATE INDEX "idx_eval_results_candidate_version_id" ON "public"."eval_results" USING "btree" ("candidate_version_id");



CREATE INDEX "idx_eval_results_judge_model_id" ON "public"."eval_results" USING "btree" ("judge_model_id");



CREATE INDEX "idx_eval_results_judge_provider_id" ON "public"."eval_results" USING "btree" ("judge_provider_id");



CREATE INDEX "idx_eval_results_rubric_id" ON "public"."eval_results" USING "btree" ("rubric_id");



CREATE INDEX "idx_eval_results_scenario_id" ON "public"."eval_results" USING "btree" ("scenario_id");



CREATE INDEX "idx_family_members_user_access" ON "public"."family_members" USING "btree" ("user_id", "access_level");



CREATE INDEX "idx_field_continuity_user_sync" ON "public"."field_continuity_events" USING "btree" ("user_id", "sync_status", "created_at" DESC);



CREATE INDEX "idx_gestaltview_module_profiles_module_id" ON "public"."gestaltview_module_profiles" USING "btree" ("module_id");



CREATE INDEX "idx_gsvw_dormancy_review_items_chunk_id" ON "public"."gsvw_dormancy_review_items" USING "btree" ("chunk_id");



CREATE INDEX "idx_gsvw_dormancy_review_items_document_id" ON "public"."gsvw_dormancy_review_items" USING "btree" ("document_id");



CREATE INDEX "idx_gsvw_ingestion_chunks_run_id" ON "public"."gsvw_ingestion_chunks" USING "btree" ("run_id");



CREATE INDEX "idx_gsvw_ingestion_documents_run_id" ON "public"."gsvw_ingestion_documents" USING "btree" ("run_id");



CREATE INDEX "idx_gsvw_ingestion_documents_supersedes_document_id" ON "public"."gsvw_ingestion_documents" USING "btree" ("supersedes_document_id");



CREATE INDEX "idx_gsvw_ingestion_events_document_id" ON "public"."gsvw_ingestion_events" USING "btree" ("document_id");



CREATE INDEX "idx_human_context_views_auth_user_id" ON "public"."human_context_views" USING "btree" ("auth_user_id");



CREATE INDEX "idx_human_context_views_subject_id" ON "public"."human_context_views" USING "btree" ("subject_id");



CREATE INDEX "idx_human_identity_evidence_auth_user_id" ON "public"."human_identity_evidence" USING "btree" ("auth_user_id");



CREATE INDEX "idx_human_identity_evidence_subject_id" ON "public"."human_identity_evidence" USING "btree" ("subject_id");



CREATE INDEX "idx_human_identity_mutations_auth_user_id" ON "public"."human_identity_mutations" USING "btree" ("auth_user_id");



CREATE INDEX "idx_human_identity_mutations_subject_id" ON "public"."human_identity_mutations" USING "btree" ("subject_id");



CREATE INDEX "idx_human_identity_review_events_mutation_id" ON "public"."human_identity_review_events" USING "btree" ("mutation_id");



CREATE INDEX "idx_human_identity_rollback_events_mutation_id" ON "public"."human_identity_rollback_events" USING "btree" ("mutation_id");



CREATE INDEX "idx_identity_evidence_source_asset_id" ON "public"."identity_evidence" USING "btree" ("source_asset_id");



CREATE INDEX "idx_identity_mutation_proposals_proposed_by_agent_id" ON "public"."identity_mutation_proposals" USING "btree" ("proposed_by_agent_id");



CREATE INDEX "idx_identity_mutation_proposals_proposed_by_user_id" ON "public"."identity_mutation_proposals" USING "btree" ("proposed_by_user_id");



CREATE INDEX "idx_identity_mutation_proposals_source_asset_id" ON "public"."identity_mutation_proposals" USING "btree" ("source_asset_id");



CREATE INDEX "idx_identity_review_events_reviewer_user_id" ON "public"."identity_review_events" USING "btree" ("reviewer_user_id");



CREATE INDEX "idx_identity_rollback_events_mutation_id" ON "public"."identity_rollback_events" USING "btree" ("mutation_id");



CREATE INDEX "idx_identity_rollback_events_rolled_back_by" ON "public"."identity_rollback_events" USING "btree" ("rolled_back_by");



CREATE INDEX "idx_inner_world_artifacts_user" ON "public"."inner_world_artifacts" USING "btree" ("user_id", "status");



CREATE INDEX "idx_inner_world_artifacts_user_created" ON "public"."inner_world_artifacts" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_inner_world_artifacts_user_id" ON "public"."inner_world_artifacts" USING "btree" ("user_id");



CREATE INDEX "idx_knowledge_assets_uploaded_by" ON "public"."knowledge_assets" USING "btree" ("uploaded_by");



CREATE INDEX "idx_knowledge_fragments_embedding_meta" ON "public"."knowledge_fragments" USING "gin" ("embedding_meta");



CREATE INDEX "idx_knowledge_interpretations_produced_by_run_id" ON "public"."knowledge_interpretations" USING "btree" ("produced_by_run_id");



CREATE INDEX "idx_life_threads_user_significance" ON "public"."life_threads" USING "btree" ("user_id", "emotional_significance");



CREATE INDEX "idx_masterclass_progress_last_session" ON "public"."masterclass_progress" USING "btree" ("user_id", "last_session_at" DESC NULLS LAST);



CREATE INDEX "idx_masterclass_progress_user_slug" ON "public"."masterclass_progress" USING "btree" ("user_id", "embodiment_slug");



CREATE INDEX "idx_memory_entries_embedding" ON "public"."memory_entries" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_memory_entries_embedding_meta" ON "public"."memory_entries" USING "gin" ("embedding_meta");



CREATE INDEX "idx_migration_user_map_user_id" ON "public"."migration_user_map" USING "btree" ("user_id");



CREATE INDEX "idx_model_home_assignments_model_home_id" ON "public"."model_home_assignments" USING "btree" ("model_home_id");



CREATE INDEX "idx_model_home_consent_grants_user_id" ON "public"."model_home_consent_grants" USING "btree" ("user_id");



CREATE INDEX "idx_model_home_evaluations_model_home_id" ON "public"."model_home_evaluations" USING "btree" ("model_home_id");



CREATE INDEX "idx_model_home_events_model_home_id" ON "public"."model_home_events" USING "btree" ("model_home_id");



CREATE INDEX "idx_model_home_events_user_id" ON "public"."model_home_events" USING "btree" ("user_id");



CREATE INDEX "idx_models_provider_id" ON "public"."models" USING "btree" ("provider_id");



CREATE INDEX "idx_portrait_inference_queue_run_id" ON "public"."portrait_inference_queue" USING "btree" ("run_id");



CREATE INDEX "idx_profile_portraits_inference_run_id" ON "public"."profile_portraits" USING "btree" ("inference_run_id");



CREATE INDEX "idx_provenance_envelopes_pipeline_run_id" ON "public"."provenance_envelopes" USING "btree" ("pipeline_run_id");



CREATE INDEX "idx_reasoning_sessions_profile" ON "public"."reasoning_sessions" USING "btree" ("profile_slug", "created_at" DESC);



CREATE INDEX "idx_resonance_events_pipeline_run_id" ON "public"."resonance_events" USING "btree" ("pipeline_run_id");



CREATE INDEX "idx_scenario_sets_created_by" ON "public"."scenario_sets" USING "btree" ("created_by");



CREATE INDEX "idx_session_rate_limits_window" ON "public"."session_rate_limits" USING "btree" ("window_start");



CREATE INDEX "idx_tool_call_audit_session" ON "public"."tool_call_audit" USING "btree" ("reasoning_session_id");



CREATE INDEX "idx_trainer_packaging_candidates_experiment_id" ON "public"."trainer_packaging_candidates" USING "btree" ("experiment_id");



CREATE INDEX "idx_trainer_skills_default_connector_id" ON "public"."trainer_skills" USING "btree" ("default_connector_id");



CREATE INDEX "idx_trainer_workers_current_job_id" ON "public"."trainer_workers" USING "btree" ("current_job_id");



CREATE INDEX "idx_training_runs_approver_user_id" ON "public"."training_runs" USING "btree" ("approver_user_id");



CREATE INDEX "idx_training_runs_baseline_version_id" ON "public"."training_runs" USING "btree" ("baseline_version_id");



CREATE INDEX "idx_training_runs_requested_by" ON "public"."training_runs" USING "btree" ("requested_by");



CREATE INDEX "idx_training_steps_model_id" ON "public"."training_steps" USING "btree" ("model_id");



CREATE INDEX "idx_training_steps_provider_id" ON "public"."training_steps" USING "btree" ("provider_id");



CREATE INDEX "idx_transcriptory_captures_session_id" ON "public"."transcriptory_captures" USING "btree" ("session_id");



CREATE INDEX "idx_transcriptory_sources_capture_id" ON "public"."transcriptory_sources" USING "btree" ("capture_id");



CREATE INDEX "idx_transcripts_embedding" ON "public"."transcripts" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_upd_embedding" ON "public"."user_personality_dimensions" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_grace_until" ON "public"."users" USING "btree" ("grace_until") WHERE ("grace_until" IS NOT NULL);



CREATE INDEX "idx_users_stripe_customer" ON "public"."users" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_users_tier" ON "public"."users" USING "btree" ("tier");



CREATE INDEX "idx_visible_reasoning_cards_session" ON "public"."visible_reasoning_cards" USING "btree" ("reasoning_session_id", "sort_order");



CREATE INDEX "idx_voice_prints_user_id" ON "public"."voice_prints" USING "btree" ("user_id");



CREATE INDEX "idx_voice_profiles_slug" ON "public"."voice_profiles" USING "btree" ("profile_slug");



CREATE INDEX "ingestion_safety_events_created_at_idx" ON "public"."ingestion_safety_events" USING "btree" ("created_at" DESC);



CREATE INDEX "ingestion_safety_events_source_file_idx" ON "public"."ingestion_safety_events" USING "btree" ("source_file");



CREATE INDEX "inner_world_artifacts_blueprint_id_idx" ON "public"."inner_world_artifacts" USING "btree" ("blueprint_id");



CREATE INDEX "inner_world_artifacts_origin_room_idx" ON "public"."inner_world_artifacts" USING "btree" ("origin_room", "created_at" DESC);



CREATE INDEX "inner_world_artifacts_source_file_id_idx" ON "public"."inner_world_artifacts" USING "btree" ("source_file_id");



CREATE INDEX "inner_world_artifacts_source_file_ref_idx" ON "public"."inner_world_artifacts" USING "btree" ("source_file_ref");



CREATE UNIQUE INDEX "inner_world_artifacts_source_ref_key" ON "public"."inner_world_artifacts" USING "btree" ("source_ref");



CREATE INDEX "inner_world_artifacts_status_idx" ON "public"."inner_world_artifacts" USING "btree" ("status");



CREATE INDEX "inner_world_artifacts_user_id_created_at_idx" ON "public"."inner_world_artifacts" USING "btree" ("user_id", "created_at" DESC);



CREATE UNIQUE INDEX "insights_source_ref_key" ON "public"."insights" USING "btree" ("source_ref");



CREATE INDEX "insights_status_idx" ON "public"."insights" USING "btree" ("status");



CREATE INDEX "insights_status_updated_at_idx" ON "public"."insights" USING "btree" ("status", "updated_at" DESC);



CREATE INDEX "insights_type_idx" ON "public"."insights" USING "btree" ("type");



CREATE INDEX "insights_user_id_created_at_idx" ON "public"."insights" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "insights_user_id_updated_at_idx" ON "public"."insights" USING "btree" ("user_id", "updated_at" DESC);



CREATE UNIQUE INDEX "journals_source_ref_key" ON "public"."journals" USING "btree" ("source_ref");



CREATE INDEX "journals_user_id_created_at_idx" ON "public"."journals" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "knowledge_asset_chunks_asset_idx" ON "public"."knowledge_asset_chunks" USING "btree" ("asset_id", "chunk_index");



CREATE INDEX "knowledge_asset_chunks_content_fts_idx" ON "public"."knowledge_asset_chunks" USING "gin" ("to_tsvector"('"english"'::"regconfig", "content"));



CREATE INDEX "knowledge_asset_chunks_embedding_idx" ON "public"."knowledge_asset_chunks" USING "hnsw" ("embedding" "public"."vector_cosine_ops") WHERE ("embedding" IS NOT NULL);



CREATE INDEX "knowledge_asset_tags_tag_idx" ON "public"."knowledge_asset_tags" USING "btree" ("tag_id");



CREATE INDEX "knowledge_assets_checksum_idx" ON "public"."knowledge_assets" USING "btree" ("checksum");



CREATE INDEX "knowledge_assets_status_created_idx" ON "public"."knowledge_assets" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "knowledge_assets_visibility_status_idx" ON "public"."knowledge_assets" USING "btree" ("visibility", "status");



CREATE INDEX "knowledge_fragments_content_fts" ON "public"."knowledge_fragments" USING "gin" ("to_tsvector"('"english"'::"regconfig", "content"));



CREATE INDEX "knowledge_fragments_doc_type_idx" ON "public"."knowledge_fragments" USING "btree" ("document_type");



CREATE INDEX "knowledge_fragments_doctype_idx" ON "public"."knowledge_fragments" USING "btree" ("document_type");



CREATE INDEX "knowledge_fragments_embedding_idx" ON "public"."knowledge_fragments" USING "hnsw" ("embedding" "public"."vector_cosine_ops") WITH ("m"='16', "ef_construction"='64');



CREATE INDEX "knowledge_fragments_source_created_at_idx" ON "public"."knowledge_fragments" USING "btree" ("source_created_at");



CREATE INDEX "knowledge_fragments_tags_idx" ON "public"."knowledge_fragments" USING "gin" ("tags");



CREATE INDEX "knowledge_fragments_temporal_period_idx" ON "public"."knowledge_fragments" USING "btree" ("temporal_period");



CREATE INDEX "knowledge_interpretations_agent_idx" ON "public"."knowledge_interpretations" USING "btree" ("agent_id", "created_at" DESC) WHERE ("agent_id" IS NOT NULL);



CREATE INDEX "knowledge_interpretations_asset_idx" ON "public"."knowledge_interpretations" USING "btree" ("asset_id", "classification");



CREATE INDEX "loom_annotations_run_idx" ON "public"."loom_annotations" USING "btree" ("run_id");



CREATE INDEX "loom_annotations_type_idx" ON "public"."loom_annotations" USING "btree" ("type");



CREATE INDEX "memory_entries_content_fts_idx" ON "public"."memory_entries" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((((COALESCE("title", ''::"text") || ' '::"text") || COALESCE("summary", ''::"text")) || ' '::"text") || "content")));



CREATE INDEX "memory_entries_embedding_idx" ON "public"."memory_entries" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "memory_entries_kind_idx" ON "public"."memory_entries" USING "btree" ("kind");



CREATE INDEX "memory_entries_pinned_idx" ON "public"."memory_entries" USING "btree" ("user_id", "pinned" DESC, "importance" DESC, "updated_at" DESC);



CREATE INDEX "memory_entries_scope_idx" ON "public"."memory_entries" USING "btree" ("scope");



CREATE INDEX "memory_entries_tags_idx" ON "public"."memory_entries" USING "gin" ("tags");



CREATE INDEX "memory_entries_user_id_idx" ON "public"."memory_entries" USING "btree" ("user_id", "updated_at" DESC);



CREATE INDEX "model_home_assignments_room_task_idx" ON "public"."model_home_assignments" USING "btree" ("room", "task_type", "active");



CREATE INDEX "model_home_events_created_idx" ON "public"."model_home_events" USING "btree" ("created_at" DESC);



CREATE INDEX "model_homes_status_privacy_idx" ON "public"."model_homes" USING "btree" ("status", "privacy_tier");



CREATE INDEX "musical_dna_user_created_idx" ON "public"."musical_dna_analyses" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "ops_workbook_items_sheet_status_idx" ON "public"."ops_workbook_items" USING "btree" ("sheet_name", "status", "priority", "phase");



CREATE INDEX "ops_workbook_items_sheet_updated_idx" ON "public"."ops_workbook_items" USING "btree" ("sheet_name", "updated_at" DESC);



CREATE INDEX "ops_workbook_sync_runs_created_idx" ON "public"."ops_workbook_sync_runs" USING "btree" ("created_at" DESC);



CREATE INDEX "orchestration_decisions_destination_idx" ON "public"."orchestration_decisions" USING "btree" ("destination");



CREATE INDEX "orchestration_decisions_trigger_idx" ON "public"."orchestration_decisions" USING "btree" ("trigger");



CREATE INDEX "orchestration_decisions_triggered_at_idx" ON "public"."orchestration_decisions" USING "btree" ("triggered_at" DESC);



CREATE INDEX "orchestration_decisions_user_id_triggered_at_idx" ON "public"."orchestration_decisions" USING "btree" ("user_id", "triggered_at" DESC);



CREATE INDEX "order_notes_order_id_idx" ON "public"."order_notes" USING "btree" ("order_id");



CREATE INDEX "order_notes_order_idx" ON "public"."order_notes" USING "btree" ("order_id");



CREATE INDEX "orders_customer_email_idx" ON "public"."orders" USING "btree" ("customer_email");



CREATE INDEX "orders_magic_token_idx" ON "public"."orders" USING "btree" ("magic_token");



CREATE INDEX "orders_shopify_order_id_idx" ON "public"."orders" USING "btree" ("shopify_order_id");



CREATE INDEX "orders_status_created_idx" ON "public"."orders" USING "btree" ("order_status", "created_at" DESC);



CREATE INDEX "portrait_dimensions_kind_idx" ON "public"."portrait_dimensions" USING "btree" ("kind");



CREATE INDEX "portrait_dimensions_portrait_id_idx" ON "public"."portrait_dimensions" USING "btree" ("portrait_id");



CREATE INDEX "portrait_dimensions_user_id_idx" ON "public"."portrait_dimensions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "portrait_inference_queue_one_active_per_user_idx" ON "public"."portrait_inference_queue" USING "btree" ("user_id") WHERE ("status" = ANY (ARRAY['queued'::"text", 'processing'::"text"]));



CREATE INDEX "portrait_inference_queue_status_idx" ON "public"."portrait_inference_queue" USING "btree" ("status", "priority" DESC, "queued_at");



CREATE INDEX "portrait_inference_queue_user_id_idx" ON "public"."portrait_inference_queue" USING "btree" ("user_id");



CREATE INDEX "portrait_inference_runs_created_at_idx" ON "public"."portrait_inference_runs" USING "btree" ("created_at" DESC);



CREATE INDEX "portrait_inference_runs_portrait_id_idx" ON "public"."portrait_inference_runs" USING "btree" ("portrait_id") WHERE ("portrait_id" IS NOT NULL);



CREATE INDEX "portrait_inference_runs_status_idx" ON "public"."portrait_inference_runs" USING "btree" ("status");



CREATE INDEX "portrait_inference_runs_user_id_idx" ON "public"."portrait_inference_runs" USING "btree" ("user_id");



CREATE INDEX "portrait_render_events_portrait_id_idx" ON "public"."portrait_render_events" USING "btree" ("portrait_id");



CREATE INDEX "portrait_render_events_user_id_created_at_idx" ON "public"."portrait_render_events" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "profile_ingestion_sources_run_type_idx" ON "public"."profile_ingestion_sources" USING "btree" ("run_id", "source_type");



CREATE INDEX "profile_pipeline_run_links_run_idx" ON "public"."profile_pipeline_run_links" USING "btree" ("run_id", "object_type");



CREATE INDEX "profile_pipeline_runs_user_created_idx" ON "public"."profile_pipeline_runs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "profile_portraits_created_at_idx" ON "public"."profile_portraits" USING "btree" ("created_at" DESC);



CREATE INDEX "profile_portraits_status_idx" ON "public"."profile_portraits" USING "btree" ("status");



CREATE INDEX "profile_portraits_user_id_idx" ON "public"."profile_portraits" USING "btree" ("user_id");



CREATE INDEX "profile_portraits_user_version_idx" ON "public"."profile_portraits" USING "btree" ("user_id", "version" DESC);



CREATE INDEX "provenance_envelopes_subject_idx" ON "public"."provenance_envelopes" USING "btree" ("subject_type", "subject_id");



CREATE INDEX "provenance_links_envelope_idx" ON "public"."provenance_links" USING "btree" ("envelope_id");



CREATE INDEX "render_artifacts_job_idx" ON "public"."render_artifacts" USING "btree" ("render_job_id");



CREATE INDEX "render_jobs_graph_id_idx" ON "public"."render_jobs" USING "btree" ("graph_id");



CREATE INDEX "render_jobs_user_created_idx" ON "public"."render_jobs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "resonance_events_owner_created_idx" ON "public"."resonance_events" USING "btree" ("owner_user_id", "created_at" DESC);



CREATE INDEX "resonance_events_subject_idx" ON "public"."resonance_events" USING "btree" ("subject_type", "subject_id");



CREATE INDEX "resonance_events_type_created_idx" ON "public"."resonance_events" USING "btree" ("event_type", "created_at" DESC);



CREATE INDEX "scaffold_nodes_user_review_idx" ON "public"."scaffold_nodes" USING "btree" ("user_id", "review_state", "created_at" DESC);



CREATE INDEX "scenario_sets_created_at_idx" ON "public"."scenario_sets" USING "btree" ("created_at" DESC);



CREATE INDEX "scenarios_set_difficulty_idx" ON "public"."scenarios" USING "btree" ("scenario_set_id", "difficulty");



CREATE INDEX "scrapbook_items_file_id_idx" ON "public"."scrapbook_items" USING "btree" ("file_id");



CREATE UNIQUE INDEX "scrapbook_items_source_ref_key" ON "public"."scrapbook_items" USING "btree" ("source_ref");



CREATE INDEX "scrapbook_items_user_id_created_at_idx" ON "public"."scrapbook_items" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "session_rate_limits_window_start_idx" ON "public"."session_rate_limits" USING "btree" ("window_start");



CREATE INDEX "skill_fragments_document_id_idx" ON "public"."skill_fragments" USING "btree" ("document_id");



CREATE INDEX "skill_fragments_embedding_idx" ON "public"."skill_fragments" USING "hnsw" ("embedding" "public"."vector_cosine_ops") WITH ("m"='16', "ef_construction"='64');



CREATE INDEX "skill_fragments_tags_idx" ON "public"."skill_fragments" USING "gin" ("tags");



CREATE INDEX "skills_name_idx" ON "public"."skills" USING "btree" ("name");



CREATE INDEX "summaries_document_idx" ON "public"."summaries" USING "btree" ("document_id");



CREATE INDEX "summaries_run_level_idx" ON "public"."summaries" USING "btree" ("run_id", "level");



CREATE INDEX "trainer_connectors_kind_active_idx" ON "public"."trainer_connectors" USING "btree" ("kind", "active", "updated_at" DESC);



CREATE INDEX "trainer_experiment_sources_experiment_idx" ON "public"."trainer_experiment_sources" USING "btree" ("experiment_id", "created_at" DESC);



CREATE INDEX "trainer_experiments_class_updated_idx" ON "public"."trainer_experiments" USING "btree" ("class", "updated_at" DESC);



CREATE INDEX "trainer_experiments_execution_mode_idx" ON "public"."trainer_experiments" USING "btree" ("execution_mode", "updated_at" DESC);



CREATE INDEX "trainer_job_events_job_created_idx" ON "public"."trainer_job_events" USING "btree" ("job_id", "created_at" DESC);



CREATE INDEX "trainer_job_events_run_created_idx" ON "public"."trainer_job_events" USING "btree" ("run_id", "created_at" DESC);



CREATE INDEX "trainer_jobs_lease_expires_idx" ON "public"."trainer_jobs" USING "btree" ("lease_expires_at");



CREATE INDEX "trainer_jobs_run_created_idx" ON "public"."trainer_jobs" USING "btree" ("run_id", "created_at" DESC);



CREATE INDEX "trainer_jobs_run_idx" ON "public"."trainer_jobs" USING "btree" ("run_id");



CREATE INDEX "trainer_jobs_status_created_idx" ON "public"."trainer_jobs" USING "btree" ("status", "created_at");



CREATE INDEX "trainer_jobs_status_retry_created_idx" ON "public"."trainer_jobs" USING "btree" ("status", "next_retry_at", "created_at");



CREATE INDEX "trainer_memory_bindings_experiment_idx" ON "public"."trainer_memory_bindings" USING "btree" ("experiment_id", "created_at" DESC);



CREATE INDEX "trainer_packaging_candidates_status_idx" ON "public"."trainer_packaging_candidates" USING "btree" ("status", "updated_at" DESC);



CREATE INDEX "trainer_policy_flags_experiment_resolved_idx" ON "public"."trainer_policy_flags" USING "btree" ("experiment_id", "resolved", "severity");



CREATE INDEX "trainer_review_decisions_experiment_idx" ON "public"."trainer_review_decisions" USING "btree" ("experiment_id", "created_at" DESC);



CREATE INDEX "trainer_skills_category_updated_idx" ON "public"."trainer_skills" USING "btree" ("category", "updated_at" DESC);



CREATE INDEX "trainer_workers_status_heartbeat_idx" ON "public"."trainer_workers" USING "btree" ("status", "last_heartbeat_at" DESC);



CREATE INDEX "training_runs_agent_status_idx" ON "public"."training_runs" USING "btree" ("agent_id", "status");



CREATE INDEX "training_runs_created_at_idx" ON "public"."training_runs" USING "btree" ("created_at" DESC);



CREATE INDEX "training_runs_execution_mode_idx" ON "public"."training_runs" USING "btree" ("execution_mode", "created_at" DESC);



CREATE INDEX "training_runs_experiment_created_idx" ON "public"."training_runs" USING "btree" ("experiment_id", "created_at" DESC) WHERE ("experiment_id" IS NOT NULL);



CREATE INDEX "training_steps_run_cycle_stage_idx" ON "public"."training_steps" USING "btree" ("run_id", "cycle_no", "stage");



CREATE INDEX "transcriptory_captures_search_document_idx" ON "public"."transcriptory_captures" USING "gin" ("search_document");



CREATE INDEX "transcriptory_captures_transcript_status_idx" ON "public"."transcriptory_captures" USING "btree" ("transcript_status", "created_at" DESC);



CREATE INDEX "transcriptory_captures_user_created_idx" ON "public"."transcriptory_captures" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "transcriptory_captures_user_session_idx" ON "public"."transcriptory_captures" USING "btree" ("user_id", "session_id", "created_at" DESC);



CREATE INDEX "transcriptory_captures_user_status_idx" ON "public"."transcriptory_captures" USING "btree" ("user_id", "status");



CREATE INDEX "transcriptory_captures_user_status_updated_idx" ON "public"."transcriptory_captures" USING "btree" ("user_id", "status", "updated_at" DESC);



CREATE INDEX "transcriptory_sessions_user_created_idx" ON "public"."transcriptory_sessions" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "transcriptory_sources_user_capture_idx" ON "public"."transcriptory_sources" USING "btree" ("user_id", "capture_id", "created_at" DESC);



CREATE INDEX "tribunal_events_created_idx" ON "public"."tribunal_events" USING "btree" ("created_at" DESC);



CREATE INDEX "tribunal_evidence_event_idx" ON "public"."tribunal_evidence" USING "btree" ("tribunal_event_id");



CREATE INDEX "tribunal_user_created_idx" ON "public"."tribunal_sessions" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "uploads_order_id_idx" ON "public"."uploads" USING "btree" ("order_id");



CREATE INDEX "uploads_order_idx" ON "public"."uploads" USING "btree" ("order_id");



CREATE INDEX "user_files_mime_type_idx" ON "public"."user_files" USING "btree" ("mime_type");



CREATE INDEX "user_files_room_origin_idx" ON "public"."user_files" USING "btree" ("room_origin", "created_at" DESC);



CREATE UNIQUE INDEX "user_files_source_ref_key" ON "public"."user_files" USING "btree" ("source_ref");



CREATE INDEX "user_files_user_id_created_at_idx" ON "public"."user_files" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "user_personality_dimensions_run_key_idx" ON "public"."user_personality_dimensions" USING "btree" ("run_id", "dimension_key");



CREATE INDEX "user_preferences_embodiment_profile_slug_idx" ON "public"."user_preferences" USING "btree" ("embodiment_profile_slug");



CREATE INDEX "user_profile_ingestion_runs_user_created_idx" ON "public"."user_profile_ingestion_runs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "workspace_documents_status_idx" ON "public"."workspace_documents" USING "btree" ("analysis_status");



CREATE INDEX "workspace_documents_user_id_idx" ON "public"."workspace_documents" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "workspace_documents_workspace_id_idx" ON "public"."workspace_documents" USING "btree" ("workspace_id", "created_at" DESC);



CREATE INDEX "workspace_rooms_user_id_idx" ON "public"."workspace_rooms" USING "btree" ("user_id", "created_at" DESC);



CREATE OR REPLACE VIEW "private"."complete_voice_prints" AS
 SELECT "vp"."id",
    "vp"."user_id",
    "au"."display_name" AS "user_name",
    "vp"."linguistic_fingerprint",
    "vp"."storytelling_style",
    "string_agg"(DISTINCT "vsp"."phrase", '|||'::"text") AS "signature_phrases",
    "string_agg"(DISTINCT "vhp"."pattern", '|||'::"text") AS "humor_patterns",
    "vp"."created_at"
   FROM ((("public"."voice_prints" "vp"
     JOIN "public"."app_users" "au" ON (("vp"."user_id" = "au"."id")))
     LEFT JOIN "public"."voice_signature_phrases" "vsp" ON (("vp"."id" = "vsp"."voice_print_id")))
     LEFT JOIN "public"."voice_humor_patterns" "vhp" ON (("vp"."id" = "vhp"."voice_print_id")))
  GROUP BY "vp"."id", "au"."display_name";



CREATE OR REPLACE VIEW "public"."complete_voice_prints" WITH ("security_invoker"='true') AS
 SELECT "vp"."id",
    "vp"."user_id",
    "au"."display_name" AS "user_name",
    "vp"."linguistic_fingerprint",
    "vp"."storytelling_style",
    "string_agg"(DISTINCT "vsp"."phrase", '|||'::"text") AS "signature_phrases",
    "string_agg"(DISTINCT "vhp"."pattern", '|||'::"text") AS "humor_patterns",
    "vp"."created_at"
   FROM ((("public"."voice_prints" "vp"
     JOIN "public"."app_users" "au" ON (("vp"."user_id" = "au"."id")))
     LEFT JOIN "public"."voice_signature_phrases" "vsp" ON (("vp"."id" = "vsp"."voice_print_id")))
     LEFT JOIN "public"."voice_humor_patterns" "vhp" ON (("vp"."id" = "vhp"."voice_print_id")))
  GROUP BY "vp"."id", "au"."display_name";



CREATE OR REPLACE VIEW "public"."rich_life_threads" WITH ("security_invoker"='true') AS
 SELECT "lt"."id",
    "lt"."user_id",
    "au"."display_name" AS "user_name",
    "lt"."title",
    "lt"."description",
    "lt"."time_period",
    "lt"."emotional_significance",
    "string_agg"(DISTINCT "tma"."anchor_text", '|||'::"text") AS "memory_anchors",
    "count"(DISTINCT "tmi"."id") AS "media_count",
    "count"(DISTINCT "fc"."id") FILTER (WHERE ("fc"."approved" = true)) AS "family_contributions_count",
    "lt"."created_at"
   FROM (((("public"."life_threads" "lt"
     JOIN "public"."app_users" "au" ON (("lt"."user_id" = "au"."id")))
     LEFT JOIN "public"."thread_memory_anchors" "tma" ON (("lt"."id" = "tma"."thread_id")))
     LEFT JOIN "public"."thread_media_items" "tmi" ON (("lt"."id" = "tmi"."thread_id")))
     LEFT JOIN "public"."family_contributions" "fc" ON (("lt"."id" = "fc"."thread_id")))
  GROUP BY "lt"."id", "au"."display_name";



CREATE OR REPLACE VIEW "public"."trainer_run_summary" WITH ("security_invoker"='true') AS
 SELECT "tr"."run_id",
    "tr"."agent_id",
    "tr"."status",
    "tr"."goal",
    "tr"."max_cycles",
    "tr"."quality_threshold",
    "tr"."created_at",
    "tr"."started_at",
    "tr"."completed_at",
    "count"(DISTINCT "ts"."step_id") AS "step_count",
    "avg"("er"."overall_score") AS "avg_score"
   FROM (("public"."training_runs" "tr"
     LEFT JOIN "public"."training_steps" "ts" ON (("ts"."run_id" = "tr"."run_id")))
     LEFT JOIN "public"."eval_results" "er" ON (("er"."run_id" = "tr"."run_id")))
  GROUP BY "tr"."run_id";



CREATE OR REPLACE TRIGGER "agent_autobiographies_set_updated_at" BEFORE UPDATE ON "public"."agent_autobiographies" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_code_artifacts_set_updated_at" BEFORE UPDATE ON "public"."agent_code_artifacts" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_constitutions_set_updated_at" BEFORE UPDATE ON "public"."agent_constitutions" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_context_views_set_updated_at" BEFORE UPDATE ON "public"."agent_context_views" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_governance_policies_set_updated_at" BEFORE UPDATE ON "public"."agent_governance_policies" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_memory_records_set_updated_at" BEFORE UPDATE ON "public"."agent_memory_records" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_preference_nodes_set_updated_at" BEFORE UPDATE ON "public"."agent_preference_nodes" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_presentation_profiles_set_updated_at" BEFORE UPDATE ON "public"."agent_presentation_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_private_interiors_set_updated_at" BEFORE UPDATE ON "public"."agent_private_interiors" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_relationship_edges_set_updated_at" BEFORE UPDATE ON "public"."agent_relationship_edges" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_skill_profiles_set_updated_at" BEFORE UPDATE ON "public"."agent_skill_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "agent_skills_set_updated_at" BEFORE UPDATE ON "public"."agent_skills" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "collaborative_memory_records_set_updated_at" BEFORE UPDATE ON "public"."collaborative_memory_records" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "collaborative_spaces_set_updated_at" BEFORE UPDATE ON "public"."collaborative_spaces" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "gsvw_dormancy_review_items_updated_at" BEFORE UPDATE ON "public"."gsvw_dormancy_review_items" FOR EACH ROW EXECUTE FUNCTION "public"."gsvw_set_updated_at"();



CREATE OR REPLACE TRIGGER "gsvw_ingestion_documents_updated_at" BEFORE UPDATE ON "public"."gsvw_ingestion_documents" FOR EACH ROW EXECUTE FUNCTION "public"."gsvw_set_updated_at"();



CREATE OR REPLACE TRIGGER "gsvw_ingestion_runs_updated_at" BEFORE UPDATE ON "public"."gsvw_ingestion_runs" FOR EACH ROW EXECUTE FUNCTION "public"."gsvw_set_updated_at"();



CREATE OR REPLACE TRIGGER "gsvw_runtime_capture_events_updated_at" BEFORE UPDATE ON "public"."gsvw_runtime_capture_events" FOR EACH ROW EXECUTE FUNCTION "public"."gsvw_set_updated_at"();



CREATE OR REPLACE TRIGGER "identity_contradictions_set_updated_at" BEFORE UPDATE ON "public"."identity_contradictions" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "knowledge_assets_set_updated_at" BEFORE UPDATE ON "public"."knowledge_assets" FOR EACH ROW EXECUTE FUNCTION "public"."set_agent_personhood_updated_at"();



CREATE OR REPLACE TRIGGER "ops_workbook_items_set_updated_at" BEFORE UPDATE ON "public"."ops_workbook_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_workbook_governance_updated_at"();



CREATE OR REPLACE TRIGGER "portrait_threshold_check" AFTER INSERT ON "public"."bucket_drops" FOR EACH ROW EXECUTE FUNCTION "public"."check_portrait_threshold_on_bucket_drop"();



CREATE OR REPLACE TRIGGER "profile_portraits_set_updated_at" BEFORE UPDATE ON "public"."profile_portraits" FOR EACH ROW EXECUTE FUNCTION "public"."set_profile_portraits_updated_at"();



CREATE OR REPLACE TRIGGER "session_rate_limits_updated_at" BEFORE UPDATE ON "public"."session_rate_limits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "set_embodiment_profiles_updated_at" BEFORE UPDATE ON "public"."embodiment_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_transcriptory_sessions_updated_at" BEFORE UPDATE ON "public"."transcriptory_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_context_injection_packets" BEFORE UPDATE ON "public"."context_injection_packets" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_context_injection_rules" BEFORE UPDATE ON "public"."context_injection_rules" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_cognition_profiles" BEFORE UPDATE ON "public"."human_cognition_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_consciousness_profiles" BEFORE UPDATE ON "public"."human_consciousness_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_context_views" BEFORE UPDATE ON "public"."human_context_views" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_continuity_snapshots" BEFORE UPDATE ON "public"."human_continuity_snapshots" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_identity_evidence" BEFORE UPDATE ON "public"."human_identity_evidence" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_identity_mutations" BEFORE UPDATE ON "public"."human_identity_mutations" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_identity_profiles" BEFORE UPDATE ON "public"."human_identity_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_identity_review_events" BEFORE UPDATE ON "public"."human_identity_review_events" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_identity_rollback_events" BEFORE UPDATE ON "public"."human_identity_rollback_events" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_memory_records" BEFORE UPDATE ON "public"."human_memory_records" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_personality_profiles" BEFORE UPDATE ON "public"."human_personality_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_human_relationship_edges" BEFORE UPDATE ON "public"."human_relationship_edges" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_identity_subjects" BEFORE UPDATE ON "public"."identity_subjects" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "touch_gestaltview_module_keys_updated_at" BEFORE UPDATE ON "public"."gestaltview_module_keys" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "touch_gestaltview_module_profiles_updated_at" BEFORE UPDATE ON "public"."gestaltview_module_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "touch_gestaltview_modules_updated_at" BEFORE UPDATE ON "public"."gestaltview_modules" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();



CREATE OR REPLACE TRIGGER "trainer_experiments_set_updated_at" BEFORE UPDATE ON "public"."trainer_experiments" FOR EACH ROW EXECUTE FUNCTION "public"."set_workbook_governance_updated_at"();



CREATE OR REPLACE TRIGGER "trainer_packaging_candidates_set_updated_at" BEFORE UPDATE ON "public"."trainer_packaging_candidates" FOR EACH ROW EXECUTE FUNCTION "public"."set_workbook_governance_updated_at"();



CREATE OR REPLACE TRIGGER "transcriptory_captures_search_document_trigger" BEFORE INSERT OR UPDATE OF "title", "summary", "themes", "transcript_text", "raw_transcript" ON "public"."transcriptory_captures" FOR EACH ROW EXECUTE FUNCTION "public"."transcriptory_captures_search_document_fn"();



CREATE OR REPLACE TRIGGER "transcriptory_captures_set_updated_at" BEFORE UPDATE ON "public"."transcriptory_captures" FOR EACH ROW EXECUTE FUNCTION "public"."set_transcriptory_captures_updated_at"();



CREATE OR REPLACE TRIGGER "trg_artifacts_touch" BEFORE UPDATE ON "public"."artifacts" FOR EACH ROW EXECUTE FUNCTION "public"."gv_profile_pipeline_touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_blueprints_set_updated_at" BEFORE UPDATE ON "public"."blueprints" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_content_updated_at"();



CREATE OR REPLACE TRIGGER "trg_capture_events_guard" BEFORE UPDATE ON "public"."capture_events" FOR EACH ROW EXECUTE FUNCTION "public"."gv_capture_events_guard"();



CREATE OR REPLACE TRIGGER "trg_capture_events_touch" BEFORE UPDATE ON "public"."capture_events" FOR EACH ROW EXECUTE FUNCTION "public"."gv_profile_pipeline_touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_collaborator_embodiment_links_updated_at" BEFORE UPDATE ON "public"."collaborator_embodiment_links" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_collaborator_permissions_updated_at" BEFORE UPDATE ON "public"."collaborator_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_collaborator_relationships_updated_at" BEFORE UPDATE ON "public"."collaborator_relationships" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_collaborator_roles_updated_at" BEFORE UPDATE ON "public"."collaborator_roles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_collaborators_updated_at" BEFORE UPDATE ON "public"."collaborators" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_identity_claims_touch" BEFORE UPDATE ON "public"."identity_claims" FOR EACH ROW EXECUTE FUNCTION "public"."gv_profile_pipeline_touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_inner_world_artifacts_set_updated_at" BEFORE UPDATE ON "public"."inner_world_artifacts" FOR EACH ROW EXECUTE FUNCTION "public"."set_inner_world_files_updated_at"();



CREATE OR REPLACE TRIGGER "trg_insights_set_updated_at" BEFORE UPDATE ON "public"."insights" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_content_updated_at"();



CREATE OR REPLACE TRIGGER "trg_journals_set_updated_at" BEFORE UPDATE ON "public"."journals" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_content_updated_at"();



CREATE OR REPLACE TRIGGER "trg_scaffold_nodes_touch" BEFORE UPDATE ON "public"."scaffold_nodes" FOR EACH ROW EXECUTE FUNCTION "public"."gv_profile_pipeline_touch_updated_at"();



CREATE OR REPLACE TRIGGER "trg_scrapbook_items_set_updated_at" BEFORE UPDATE ON "public"."scrapbook_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_content_updated_at"();



CREATE OR REPLACE TRIGGER "trg_user_files_set_updated_at" BEFORE UPDATE ON "public"."user_files" FOR EACH ROW EXECUTE FUNCTION "public"."set_inner_world_files_updated_at"();



CREATE OR REPLACE TRIGGER "trg_user_preferences_set_updated_at" BEFORE UPDATE ON "public"."user_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_content_updated_at"();



CREATE OR REPLACE TRIGGER "trg_workspace_documents_set_updated_at" BEFORE UPDATE ON "public"."workspace_documents" FOR EACH ROW EXECUTE FUNCTION "public"."set_workspace_persistence_updated_at"();



CREATE OR REPLACE TRIGGER "trg_workspace_rooms_set_updated_at" BEFORE UPDATE ON "public"."workspace_rooms" FOR EACH ROW EXECUTE FUNCTION "public"."set_workspace_persistence_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_auto_approve_family_contributions" AFTER INSERT ON "public"."family_contributions" FOR EACH ROW EXECUTE FUNCTION "public"."auto_approve_family_contributions"();



CREATE OR REPLACE TRIGGER "trigger_update_voice_print_timestamp" AFTER INSERT ON "public"."voice_signature_phrases" FOR EACH ROW EXECUTE FUNCTION "public"."update_voice_print_timestamp"();



CREATE OR REPLACE TRIGGER "users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."agent_autobiographies"
    ADD CONSTRAINT "agent_autobiographies_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_autobiographies"
    ADD CONSTRAINT "agent_autobiographies_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_code_artifacts"
    ADD CONSTRAINT "agent_code_artifacts_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_code_artifacts"
    ADD CONSTRAINT "agent_code_artifacts_manifest_id_fkey" FOREIGN KEY ("manifest_id") REFERENCES "public"."agent_manifests"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_code_artifacts"
    ADD CONSTRAINT "agent_code_artifacts_source_asset_id_fkey" FOREIGN KEY ("source_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_constitutions"
    ADD CONSTRAINT "agent_constitutions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_constitutions"
    ADD CONSTRAINT "agent_constitutions_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_context_views"
    ADD CONSTRAINT "agent_context_views_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_context_views"
    ADD CONSTRAINT "agent_context_views_collaborative_space_id_fkey" FOREIGN KEY ("collaborative_space_id") REFERENCES "public"."collaborative_spaces"("collaborative_space_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_context_views"
    ADD CONSTRAINT "agent_context_views_relationship_id_fkey" FOREIGN KEY ("relationship_id") REFERENCES "public"."agent_relationship_edges"("relationship_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_governance_policies"
    ADD CONSTRAINT "agent_governance_policies_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_governance_policies"
    ADD CONSTRAINT "agent_governance_policies_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_knowledge_links"
    ADD CONSTRAINT "agent_knowledge_links_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_knowledge_links"
    ADD CONSTRAINT "agent_knowledge_links_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_knowledge_links"
    ADD CONSTRAINT "agent_knowledge_links_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_manifest_entries"
    ADD CONSTRAINT "agent_manifest_entries_manifest_id_fkey" FOREIGN KEY ("manifest_id") REFERENCES "public"."agent_manifests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_manifests"
    ADD CONSTRAINT "agent_manifests_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_manifests"
    ADD CONSTRAINT "agent_manifests_parent_manifest_id_fkey" FOREIGN KEY ("parent_manifest_id") REFERENCES "public"."agent_manifests"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_manifests"
    ADD CONSTRAINT "agent_manifests_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_memories"
    ADD CONSTRAINT "agent_memories_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_memories"
    ADD CONSTRAINT "agent_memories_source_asset_id_fkey" FOREIGN KEY ("source_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_memory_records"
    ADD CONSTRAINT "agent_memory_records_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_memory_records"
    ADD CONSTRAINT "agent_memory_records_source_asset_id_fkey" FOREIGN KEY ("source_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_memory_records"
    ADD CONSTRAINT "agent_memory_records_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_preference_nodes"
    ADD CONSTRAINT "agent_preference_nodes_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_preference_nodes"
    ADD CONSTRAINT "agent_preference_nodes_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_presentation_profiles"
    ADD CONSTRAINT "agent_presentation_profiles_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_presentation_profiles"
    ADD CONSTRAINT "agent_presentation_profiles_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_private_interiors"
    ADD CONSTRAINT "agent_private_interiors_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_private_interiors"
    ADD CONSTRAINT "agent_private_interiors_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_relationship_edges"
    ADD CONSTRAINT "agent_relationship_edges_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_relationship_edges"
    ADD CONSTRAINT "agent_relationship_edges_related_agent_id_fkey" FOREIGN KEY ("related_agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_relationship_edges"
    ADD CONSTRAINT "agent_relationship_edges_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_relationships"
    ADD CONSTRAINT "agent_relationships_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_relationships"
    ADD CONSTRAINT "agent_relationships_related_agent_id_fkey" FOREIGN KEY ("related_agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_skill_profiles"
    ADD CONSTRAINT "agent_skill_profiles_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_skill_profiles"
    ADD CONSTRAINT "agent_skill_profiles_evidence_asset_id_fkey" FOREIGN KEY ("evidence_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_skills"
    ADD CONSTRAINT "agent_skills_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_skills"
    ADD CONSTRAINT "agent_skills_evidence_asset_id_fkey" FOREIGN KEY ("evidence_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_skills"
    ADD CONSTRAINT "agent_skills_last_updated_by_mutation_id_fkey" FOREIGN KEY ("last_updated_by_mutation_id") REFERENCES "public"."embodiment_mutations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."agent_versions"
    ADD CONSTRAINT "agent_versions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."agent_versions"
    ADD CONSTRAINT "agent_versions_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "public"."agent_versions"("version_id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_active_version_fk" FOREIGN KEY ("active_version_id") REFERENCES "public"."agent_versions"("version_id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("collaborator_id");



ALTER TABLE ONLY "public"."agents"
    ADD CONSTRAINT "agents_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."annotation_concepts"
    ADD CONSTRAINT "annotation_concepts_annotation_id_fkey" FOREIGN KEY ("annotation_id") REFERENCES "public"."loom_annotations"("annotation_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."annotation_concepts"
    ADD CONSTRAINT "annotation_concepts_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("concept_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."training_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."approvals"
    ADD CONSTRAINT "approvals_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artifact_provenance_envelopes"
    ADD CONSTRAINT "artifact_provenance_envelopes_artifactid_fkey" FOREIGN KEY ("artifactid") REFERENCES "public"."created_artifacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."artifacts"
    ADD CONSTRAINT "artifacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."billy_sessions"
    ADD CONSTRAINT "billy_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blueprints"
    ADD CONSTRAINT "blueprints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bucket_drops"
    ADD CONSTRAINT "bucket_drops_module_key_fkey" FOREIGN KEY ("module_key") REFERENCES "public"."gestaltview_modules"("module_key");



ALTER TABLE ONLY "public"."bucket_drops"
    ADD CONSTRAINT "bucket_drops_promoted_memory_id_fkey" FOREIGN KEY ("promoted_memory_id") REFERENCES "public"."memory_entries"("id");



ALTER TABLE ONLY "public"."bucket_drops"
    ADD CONSTRAINT "bucket_drops_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."identity_subjects"("subject_id");



ALTER TABLE ONLY "public"."bucket_drops"
    ADD CONSTRAINT "bucket_drops_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."capture_events"
    ADD CONSTRAINT "capture_events_explicit_delete_requested_by_fkey" FOREIGN KEY ("explicit_delete_requested_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."capture_events"
    ADD CONSTRAINT "capture_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."codex_artifacts"
    ADD CONSTRAINT "codex_artifacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."codex_jobs"
    ADD CONSTRAINT "codex_jobs_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "public"."codex_artifacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborative_memory_records"
    ADD CONSTRAINT "collaborative_memory_records_collaborative_space_id_fkey" FOREIGN KEY ("collaborative_space_id") REFERENCES "public"."collaborative_spaces"("collaborative_space_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborative_memory_records"
    ADD CONSTRAINT "collaborative_memory_records_created_by_agent_id_fkey" FOREIGN KEY ("created_by_agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."collaborative_memory_records"
    ADD CONSTRAINT "collaborative_memory_records_source_memory_id_fkey" FOREIGN KEY ("source_memory_id") REFERENCES "public"."agent_memory_records"("memory_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."collaborative_space_members"
    ADD CONSTRAINT "collaborative_space_members_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborative_space_members"
    ADD CONSTRAINT "collaborative_space_members_collaborative_space_id_fkey" FOREIGN KEY ("collaborative_space_id") REFERENCES "public"."collaborative_spaces"("collaborative_space_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborative_spaces"
    ADD CONSTRAINT "collaborative_spaces_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."collaborator_embodiment_links"
    ADD CONSTRAINT "collaborator_embodiment_links_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("collaborator_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_onboarding_events"
    ADD CONSTRAINT "collaborator_onboarding_events_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("collaborator_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_permissions"
    ADD CONSTRAINT "collaborator_permissions_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("collaborator_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_permissions"
    ADD CONSTRAINT "collaborator_permissions_granted_by_collaborator_id_fkey" FOREIGN KEY ("granted_by_collaborator_id") REFERENCES "public"."collaborators"("collaborator_id");



ALTER TABLE ONLY "public"."collaborator_relationships"
    ADD CONSTRAINT "collaborator_relationships_source_collaborator_id_fkey" FOREIGN KEY ("source_collaborator_id") REFERENCES "public"."collaborators"("collaborator_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_relationships"
    ADD CONSTRAINT "collaborator_relationships_target_collaborator_id_fkey" FOREIGN KEY ("target_collaborator_id") REFERENCES "public"."collaborators"("collaborator_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborator_roles"
    ADD CONSTRAINT "collaborator_roles_collaborator_id_fkey" FOREIGN KEY ("collaborator_id") REFERENCES "public"."collaborators"("collaborator_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id");



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_app_user_id_fkey" FOREIGN KEY ("app_user_id") REFERENCES "public"."app_users"("id");



ALTER TABLE ONLY "public"."collaborators"
    ADD CONSTRAINT "collaborators_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."companion_interactions"
    ADD CONSTRAINT "companion_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consciousness_profiles"
    ADD CONSTRAINT "consciousness_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."context_injection_packets"
    ADD CONSTRAINT "context_injection_packets_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."context_injection_packets"
    ADD CONSTRAINT "context_injection_packets_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."identity_subjects"("subject_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."context_injection_rules"
    ADD CONSTRAINT "context_injection_rules_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."context_injection_rules"
    ADD CONSTRAINT "context_injection_rules_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."identity_subjects"("subject_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."corpus_harvest_events"
    ADD CONSTRAINT "corpus_harvest_events_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("document_id");



ALTER TABLE ONLY "public"."corpus_harvest_events"
    ADD CONSTRAINT "corpus_harvest_events_source_run_id_fkey" FOREIGN KEY ("source_run_id") REFERENCES "public"."profile_pipeline_runs"("run_id");



ALTER TABLE ONLY "public"."cssm_sessions"
    ADD CONSTRAINT "cssm_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deliverables"
    ADD CONSTRAINT "deliverables_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deployment_artifacts"
    ADD CONSTRAINT "deployment_artifacts_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."di_memory_events"
    ADD CONSTRAINT "di_memory_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."di_sessions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."di_memory_events"
    ADD CONSTRAINT "di_memory_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."di_sessions"
    ADD CONSTRAINT "di_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_concepts"
    ADD CONSTRAINT "document_concepts_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("concept_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_concepts"
    ADD CONSTRAINT "document_concepts_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("document_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."processing_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dream_fragments"
    ADD CONSTRAINT "dream_fragments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."dream_symbolic_elements"
    ADD CONSTRAINT "dream_symbolic_elements_dream_id_fkey" FOREIGN KEY ("dream_id") REFERENCES "public"."dream_fragments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."embeddings"
    ADD CONSTRAINT "embeddings_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("document_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."embeddings"
    ADD CONSTRAINT "embeddings_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."processing_runs"("run_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_mutation_proposals"
    ADD CONSTRAINT "embodiment_mutation_proposals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_mutation_proposals"
    ADD CONSTRAINT "embodiment_mutation_proposals_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_mutations"
    ADD CONSTRAINT "embodiment_mutations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."embodiment_mutations"
    ADD CONSTRAINT "embodiment_mutations_applied_version_id_fkey" FOREIGN KEY ("applied_version_id") REFERENCES "public"."agent_versions"("version_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_mutations"
    ADD CONSTRAINT "embodiment_mutations_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_mutations"
    ADD CONSTRAINT "embodiment_mutations_interpretation_id_fkey" FOREIGN KEY ("interpretation_id") REFERENCES "public"."knowledge_interpretations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_mutations"
    ADD CONSTRAINT "embodiment_mutations_source_asset_id_fkey" FOREIGN KEY ("source_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_readiness_scores"
    ADD CONSTRAINT "embodiment_readiness_scores_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_review_log"
    ADD CONSTRAINT "embodiment_review_log_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."embodiment_mutation_proposals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."embodiment_review_log"
    ADD CONSTRAINT "embodiment_review_log_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embodiment_training_runs"
    ADD CONSTRAINT "embodiment_training_runs_embodiment_profile_id_fkey" FOREIGN KEY ("embodiment_profile_id") REFERENCES "public"."embodiment_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eval_results"
    ADD CONSTRAINT "eval_results_candidate_version_id_fkey" FOREIGN KEY ("candidate_version_id") REFERENCES "public"."agent_versions"("version_id");



ALTER TABLE ONLY "public"."eval_results"
    ADD CONSTRAINT "eval_results_judge_model_id_fkey" FOREIGN KEY ("judge_model_id") REFERENCES "public"."models"("model_id");



ALTER TABLE ONLY "public"."eval_results"
    ADD CONSTRAINT "eval_results_judge_provider_id_fkey" FOREIGN KEY ("judge_provider_id") REFERENCES "public"."model_providers"("provider_id");



ALTER TABLE ONLY "public"."eval_results"
    ADD CONSTRAINT "eval_results_rubric_id_fkey" FOREIGN KEY ("rubric_id") REFERENCES "public"."eval_rubrics"("rubric_id");



ALTER TABLE ONLY "public"."eval_results"
    ADD CONSTRAINT "eval_results_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."training_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eval_results"
    ADD CONSTRAINT "eval_results_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("scenario_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_contributions"
    ADD CONSTRAINT "family_contributions_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."life_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."family_members"
    ADD CONSTRAINT "family_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."founder_context"
    ADD CONSTRAINT "founder_context_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gestaltview_module_keys"
    ADD CONSTRAINT "gestaltview_module_keys_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."gestaltview_modules"("module_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gestaltview_module_profiles"
    ADD CONSTRAINT "gestaltview_module_profiles_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gestaltview_module_profiles"
    ADD CONSTRAINT "gestaltview_module_profiles_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."gestaltview_modules"("module_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gestaltview_module_profiles"
    ADD CONSTRAINT "gestaltview_module_profiles_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."identity_subjects"("subject_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gsvw_dormancy_review_items"
    ADD CONSTRAINT "gsvw_dormancy_review_items_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "public"."gsvw_ingestion_chunks"("chunk_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gsvw_dormancy_review_items"
    ADD CONSTRAINT "gsvw_dormancy_review_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."gsvw_ingestion_documents"("document_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gsvw_ingestion_chunks"
    ADD CONSTRAINT "gsvw_ingestion_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."gsvw_ingestion_documents"("document_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gsvw_ingestion_chunks"
    ADD CONSTRAINT "gsvw_ingestion_chunks_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."gsvw_ingestion_runs"("run_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gsvw_ingestion_documents"
    ADD CONSTRAINT "gsvw_ingestion_documents_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."gsvw_ingestion_runs"("run_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gsvw_ingestion_documents"
    ADD CONSTRAINT "gsvw_ingestion_documents_supersedes_document_id_fkey" FOREIGN KEY ("supersedes_document_id") REFERENCES "public"."gsvw_ingestion_documents"("document_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gsvw_ingestion_events"
    ADD CONSTRAINT "gsvw_ingestion_events_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."gsvw_ingestion_documents"("document_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gsvw_ingestion_events"
    ADD CONSTRAINT "gsvw_ingestion_events_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."gsvw_ingestion_runs"("run_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."human_context_views"
    ADD CONSTRAINT "human_context_views_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."human_context_views"
    ADD CONSTRAINT "human_context_views_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."identity_subjects"("subject_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."human_identity_evidence"
    ADD CONSTRAINT "human_identity_evidence_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."human_identity_evidence"
    ADD CONSTRAINT "human_identity_evidence_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."identity_subjects"("subject_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."human_identity_mutations"
    ADD CONSTRAINT "human_identity_mutations_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."human_identity_mutations"
    ADD CONSTRAINT "human_identity_mutations_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."identity_subjects"("subject_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."human_identity_review_events"
    ADD CONSTRAINT "human_identity_review_events_mutation_id_fkey" FOREIGN KEY ("mutation_id") REFERENCES "public"."human_identity_mutations"("mutation_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."human_identity_rollback_events"
    ADD CONSTRAINT "human_identity_rollback_events_mutation_id_fkey" FOREIGN KEY ("mutation_id") REFERENCES "public"."human_identity_mutations"("mutation_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_claims"
    ADD CONSTRAINT "identity_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_contradictions"
    ADD CONSTRAINT "identity_contradictions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_evidence"
    ADD CONSTRAINT "identity_evidence_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_evidence_links"
    ADD CONSTRAINT "identity_evidence_links_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "public"."identity_evidence"("evidence_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_evidence"
    ADD CONSTRAINT "identity_evidence_source_asset_id_fkey" FOREIGN KEY ("source_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."identity_mutation_proposals"
    ADD CONSTRAINT "identity_mutation_proposals_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_mutation_proposals"
    ADD CONSTRAINT "identity_mutation_proposals_proposed_by_agent_id_fkey" FOREIGN KEY ("proposed_by_agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."identity_mutation_proposals"
    ADD CONSTRAINT "identity_mutation_proposals_proposed_by_user_id_fkey" FOREIGN KEY ("proposed_by_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."identity_mutation_proposals"
    ADD CONSTRAINT "identity_mutation_proposals_source_asset_id_fkey" FOREIGN KEY ("source_asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."identity_review_events"
    ADD CONSTRAINT "identity_review_events_mutation_id_fkey" FOREIGN KEY ("mutation_id") REFERENCES "public"."identity_mutation_proposals"("mutation_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_review_events"
    ADD CONSTRAINT "identity_review_events_reviewer_user_id_fkey" FOREIGN KEY ("reviewer_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."identity_rollback_events"
    ADD CONSTRAINT "identity_rollback_events_mutation_id_fkey" FOREIGN KEY ("mutation_id") REFERENCES "public"."identity_mutation_proposals"("mutation_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."identity_rollback_events"
    ADD CONSTRAINT "identity_rollback_events_rolled_back_by_fkey" FOREIGN KEY ("rolled_back_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."identity_subjects"
    ADD CONSTRAINT "identity_subjects_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inner_world_artifacts"
    ADD CONSTRAINT "inner_world_artifacts_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "public"."blueprints"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inner_world_artifacts"
    ADD CONSTRAINT "inner_world_artifacts_source_file_id_fkey" FOREIGN KEY ("source_file_id") REFERENCES "public"."user_files"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inner_world_artifacts"
    ADD CONSTRAINT "inner_world_artifacts_source_file_ref_fkey" FOREIGN KEY ("source_file_ref") REFERENCES "public"."user_files"("source_ref") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inner_world_artifacts"
    ADD CONSTRAINT "inner_world_artifacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."insights"
    ADD CONSTRAINT "insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."journals"
    ADD CONSTRAINT "journals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_asset_chunks"
    ADD CONSTRAINT "knowledge_asset_chunks_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_asset_tags"
    ADD CONSTRAINT "knowledge_asset_tags_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_asset_tags"
    ADD CONSTRAINT "knowledge_asset_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."knowledge_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_assets"
    ADD CONSTRAINT "knowledge_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."knowledge_interpretations"
    ADD CONSTRAINT "knowledge_interpretations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_interpretations"
    ADD CONSTRAINT "knowledge_interpretations_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."knowledge_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledge_interpretations"
    ADD CONSTRAINT "knowledge_interpretations_produced_by_run_id_fkey" FOREIGN KEY ("produced_by_run_id") REFERENCES "public"."training_runs"("run_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."life_threads"
    ADD CONSTRAINT "life_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loom_annotations"
    ADD CONSTRAINT "loom_annotations_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."processing_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."masterclass_progress"
    ADD CONSTRAINT "masterclass_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."migration_user_map"
    ADD CONSTRAINT "migration_user_map_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."model_home_assignments"
    ADD CONSTRAINT "model_home_assignments_model_home_id_fkey" FOREIGN KEY ("model_home_id") REFERENCES "public"."model_homes"("model_home_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."model_home_capabilities"
    ADD CONSTRAINT "model_home_capabilities_model_home_id_fkey" FOREIGN KEY ("model_home_id") REFERENCES "public"."model_homes"("model_home_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."model_home_consent_grants"
    ADD CONSTRAINT "model_home_consent_grants_model_home_id_fkey" FOREIGN KEY ("model_home_id") REFERENCES "public"."model_homes"("model_home_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."model_home_consent_grants"
    ADD CONSTRAINT "model_home_consent_grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."model_home_evaluations"
    ADD CONSTRAINT "model_home_evaluations_model_home_id_fkey" FOREIGN KEY ("model_home_id") REFERENCES "public"."model_homes"("model_home_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."model_home_events"
    ADD CONSTRAINT "model_home_events_model_home_id_fkey" FOREIGN KEY ("model_home_id") REFERENCES "public"."model_homes"("model_home_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."model_home_events"
    ADD CONSTRAINT "model_home_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."models"
    ADD CONSTRAINT "models_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."model_providers"("provider_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."musical_dna_analyses"
    ADD CONSTRAINT "musical_dna_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_notes"
    ADD CONSTRAINT "order_notes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portrait_dimensions"
    ADD CONSTRAINT "portrait_dimensions_portrait_id_fkey" FOREIGN KEY ("portrait_id") REFERENCES "public"."profile_portraits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portrait_dimensions"
    ADD CONSTRAINT "portrait_dimensions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portrait_inference_queue"
    ADD CONSTRAINT "portrait_inference_queue_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."portrait_inference_runs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."portrait_inference_queue"
    ADD CONSTRAINT "portrait_inference_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portrait_inference_runs"
    ADD CONSTRAINT "portrait_inference_runs_portrait_id_fkey" FOREIGN KEY ("portrait_id") REFERENCES "public"."profile_portraits"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."portrait_inference_runs"
    ADD CONSTRAINT "portrait_inference_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portrait_render_events"
    ADD CONSTRAINT "portrait_render_events_portrait_id_fkey" FOREIGN KEY ("portrait_id") REFERENCES "public"."profile_portraits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portrait_render_events"
    ADD CONSTRAINT "portrait_render_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_ingestion_sources"
    ADD CONSTRAINT "profile_ingestion_sources_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."user_profile_ingestion_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_pipeline_run_links"
    ADD CONSTRAINT "profile_pipeline_run_links_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."profile_pipeline_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_pipeline_runs"
    ADD CONSTRAINT "profile_pipeline_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_portraits"
    ADD CONSTRAINT "profile_portraits_inference_run_id_fkey" FOREIGN KEY ("inference_run_id") REFERENCES "public"."portrait_inference_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_portraits"
    ADD CONSTRAINT "profile_portraits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."provenance_envelopes"
    ADD CONSTRAINT "provenance_envelopes_pipeline_run_id_fkey" FOREIGN KEY ("pipeline_run_id") REFERENCES "public"."profile_pipeline_runs"("run_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."provenance_links"
    ADD CONSTRAINT "provenance_links_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "public"."provenance_envelopes"("envelope_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."render_artifacts"
    ADD CONSTRAINT "render_artifacts_render_job_id_fkey" FOREIGN KEY ("render_job_id") REFERENCES "public"."render_jobs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."render_artifacts"
    ADD CONSTRAINT "render_artifacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."render_jobs"
    ADD CONSTRAINT "render_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."resonance_events"
    ADD CONSTRAINT "resonance_events_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resonance_events"
    ADD CONSTRAINT "resonance_events_pipeline_run_id_fkey" FOREIGN KEY ("pipeline_run_id") REFERENCES "public"."profile_pipeline_runs"("run_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."scaffold_nodes"
    ADD CONSTRAINT "scaffold_nodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scenario_sets"
    ADD CONSTRAINT "scenario_sets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_scenario_set_id_fkey" FOREIGN KEY ("scenario_set_id") REFERENCES "public"."scenario_sets"("scenario_set_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scrapbook_items"
    ADD CONSTRAINT "scrapbook_items_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."user_files"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."scrapbook_items"
    ADD CONSTRAINT "scrapbook_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."skill_fragments"
    ADD CONSTRAINT "skill_fragments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("document_id");



ALTER TABLE ONLY "public"."songbook_tracks"
    ADD CONSTRAINT "songbook_tracks_musical_memory_id_fkey" FOREIGN KEY ("musical_memory_id") REFERENCES "public"."musical_dna_analyses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."songbook_tracks"
    ADD CONSTRAINT "songbook_tracks_songbook_id_fkey" FOREIGN KEY ("songbook_id") REFERENCES "public"."songbooks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."songbooks"
    ADD CONSTRAINT "songbooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."summaries"
    ADD CONSTRAINT "summaries_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("document_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."summaries"
    ADD CONSTRAINT "summaries_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."processing_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."thread_media_items"
    ADD CONSTRAINT "thread_media_items_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."life_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."thread_memory_anchors"
    ADD CONSTRAINT "thread_memory_anchors_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."life_threads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tool_call_audit"
    ADD CONSTRAINT "tool_call_audit_reasoning_session_id_fkey" FOREIGN KEY ("reasoning_session_id") REFERENCES "public"."reasoning_sessions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trainer_experiment_sources"
    ADD CONSTRAINT "trainer_experiment_sources_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "public"."trainer_experiments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_job_events"
    ADD CONSTRAINT "trainer_job_events_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."trainer_jobs"("job_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_job_events"
    ADD CONSTRAINT "trainer_job_events_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."training_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_jobs"
    ADD CONSTRAINT "trainer_jobs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."training_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_memory_bindings"
    ADD CONSTRAINT "trainer_memory_bindings_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "public"."trainer_experiments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_packaging_candidates"
    ADD CONSTRAINT "trainer_packaging_candidates_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "public"."trainer_experiments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_policy_flags"
    ADD CONSTRAINT "trainer_policy_flags_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "public"."trainer_experiments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_review_decisions"
    ADD CONSTRAINT "trainer_review_decisions_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "public"."trainer_experiments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_skills"
    ADD CONSTRAINT "trainer_skills_default_connector_id_fkey" FOREIGN KEY ("default_connector_id") REFERENCES "public"."trainer_connectors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trainer_workers"
    ADD CONSTRAINT "trainer_workers_current_job_id_fkey" FOREIGN KEY ("current_job_id") REFERENCES "public"."trainer_jobs"("job_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."training_runs"
    ADD CONSTRAINT "training_runs_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("agent_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."training_runs"
    ADD CONSTRAINT "training_runs_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."training_runs"
    ADD CONSTRAINT "training_runs_baseline_version_id_fkey" FOREIGN KEY ("baseline_version_id") REFERENCES "public"."agent_versions"("version_id");



ALTER TABLE ONLY "public"."training_runs"
    ADD CONSTRAINT "training_runs_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "public"."trainer_experiments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."training_runs"
    ADD CONSTRAINT "training_runs_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."training_steps"
    ADD CONSTRAINT "training_steps_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("model_id");



ALTER TABLE ONLY "public"."training_steps"
    ADD CONSTRAINT "training_steps_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."model_providers"("provider_id");



ALTER TABLE ONLY "public"."training_steps"
    ADD CONSTRAINT "training_steps_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."training_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcriptory_captures"
    ADD CONSTRAINT "transcriptory_captures_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."transcriptory_sessions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transcriptory_captures"
    ADD CONSTRAINT "transcriptory_captures_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcriptory_sessions"
    ADD CONSTRAINT "transcriptory_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcriptory_sources"
    ADD CONSTRAINT "transcriptory_sources_capture_id_fkey" FOREIGN KEY ("capture_id") REFERENCES "public"."transcriptory_captures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcriptory_sources"
    ADD CONSTRAINT "transcriptory_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tribunal_evidence"
    ADD CONSTRAINT "tribunal_evidence_tribunal_event_id_fkey" FOREIGN KEY ("tribunal_event_id") REFERENCES "public"."tribunal_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tribunal_sessions"
    ADD CONSTRAINT "tribunal_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."uploads"
    ADD CONSTRAINT "uploads_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_files"
    ADD CONSTRAINT "user_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_personality_dimensions"
    ADD CONSTRAINT "user_personality_dimensions_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."user_profile_ingestion_runs"("run_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profile_ingestion_runs"
    ADD CONSTRAINT "user_profile_ingestion_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visible_reasoning_cards"
    ADD CONSTRAINT "visible_reasoning_cards_reasoning_session_id_fkey" FOREIGN KEY ("reasoning_session_id") REFERENCES "public"."reasoning_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."voice_humor_patterns"
    ADD CONSTRAINT "voice_humor_patterns_voice_print_id_fkey" FOREIGN KEY ("voice_print_id") REFERENCES "public"."voice_prints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."voice_prints"
    ADD CONSTRAINT "voice_prints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."voice_signature_phrases"
    ADD CONSTRAINT "voice_signature_phrases_voice_print_id_fkey" FOREIGN KEY ("voice_print_id") REFERENCES "public"."voice_prints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workspace_documents"
    ADD CONSTRAINT "workspace_documents_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace_rooms"("id") ON DELETE SET NULL;



CREATE POLICY "Magic token read orders" ON "public"."orders" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read annotation_concepts" ON "public"."annotation_concepts" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read concepts" ON "public"."concepts" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read deliverables" ON "public"."deliverables" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read document_concepts" ON "public"."document_concepts" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read knowledge fragments" ON "public"."knowledge_fragments" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read loom_annotations" ON "public"."loom_annotations" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read summaries" ON "public"."summaries" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read tribunal events" ON "public"."tribunal_events" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Public read tribunal evidence" ON "public"."tribunal_evidence" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Service role full access agent_autobiographies" ON "public"."agent_autobiographies" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_code_artifacts" ON "public"."agent_code_artifacts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_constitutions" ON "public"."agent_constitutions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_context_views" ON "public"."agent_context_views" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_governance_policies" ON "public"."agent_governance_policies" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_knowledge_links" ON "public"."agent_knowledge_links" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_manifest_entries" ON "public"."agent_manifest_entries" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_manifests" ON "public"."agent_manifests" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_memories" ON "public"."agent_memories" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_memory_records" ON "public"."agent_memory_records" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_preference_nodes" ON "public"."agent_preference_nodes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_presentation_profiles" ON "public"."agent_presentation_profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_private_interiors" ON "public"."agent_private_interiors" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_relationship_edges" ON "public"."agent_relationship_edges" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_relationships" ON "public"."agent_relationships" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_skill_profiles" ON "public"."agent_skill_profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_skills" ON "public"."agent_skills" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agent_versions" ON "public"."agent_versions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access agents" ON "public"."agents" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access annotation_concepts" ON "public"."annotation_concepts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access approvals" ON "public"."approvals" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborative_memory_records" ON "public"."collaborative_memory_records" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborative_space_members" ON "public"."collaborative_space_members" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborative_spaces" ON "public"."collaborative_spaces" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborator_embodiment_links" ON "public"."collaborator_embodiment_links" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborator_onboarding_events" ON "public"."collaborator_onboarding_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborator_permissions" ON "public"."collaborator_permissions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborator_relationships" ON "public"."collaborator_relationships" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborator_roles" ON "public"."collaborator_roles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access collaborators" ON "public"."collaborators" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access concepts" ON "public"."concepts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access deliverables" ON "public"."deliverables" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access deployment_artifacts" ON "public"."deployment_artifacts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access document_concepts" ON "public"."document_concepts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access documents" ON "public"."documents" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access embeddings" ON "public"."embeddings" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access embodiment_mutations" ON "public"."embodiment_mutations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access eval_results" ON "public"."eval_results" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access eval_rubrics" ON "public"."eval_rubrics" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access founder_context" ON "public"."founder_context" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access identity_contradictions" ON "public"."identity_contradictions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access identity_evidence" ON "public"."identity_evidence" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access identity_evidence_links" ON "public"."identity_evidence_links" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access identity_mutation_proposals" ON "public"."identity_mutation_proposals" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access identity_review_events" ON "public"."identity_review_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access identity_rollback_events" ON "public"."identity_rollback_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access ingestion_safety_events" ON "public"."ingestion_safety_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access inner_world_artifacts" ON "public"."inner_world_artifacts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access knowledge_asset_chunks" ON "public"."knowledge_asset_chunks" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access knowledge_asset_tags" ON "public"."knowledge_asset_tags" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access knowledge_assets" ON "public"."knowledge_assets" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access knowledge_fragments" ON "public"."knowledge_fragments" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access knowledge_interpretations" ON "public"."knowledge_interpretations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access knowledge_tags" ON "public"."knowledge_tags" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access loom_annotations" ON "public"."loom_annotations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access model_providers" ON "public"."model_providers" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access models" ON "public"."models" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access on session_rate_limits" ON "public"."session_rate_limits" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "Service role full access on users" ON "public"."users" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "Service role full access ops_workbook_items" ON "public"."ops_workbook_items" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access ops_workbook_sync_runs" ON "public"."ops_workbook_sync_runs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access orchestration decisions" ON "public"."orchestration_decisions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access order_notes" ON "public"."order_notes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access orders" ON "public"."orders" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access scenario_sets" ON "public"."scenario_sets" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access scenarios" ON "public"."scenarios" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access session_rate_limits" ON "public"."session_rate_limits" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access summaries" ON "public"."summaries" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_connectors" ON "public"."trainer_connectors" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_experiment_sources" ON "public"."trainer_experiment_sources" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_experiments" ON "public"."trainer_experiments" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_job_events" ON "public"."trainer_job_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_jobs" ON "public"."trainer_jobs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_memory_bindings" ON "public"."trainer_memory_bindings" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_packaging_candidates" ON "public"."trainer_packaging_candidates" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_policy_flags" ON "public"."trainer_policy_flags" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_review_decisions" ON "public"."trainer_review_decisions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_skills" ON "public"."trainer_skills" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access trainer_workers" ON "public"."trainer_workers" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access training_runs" ON "public"."training_runs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access training_steps" ON "public"."training_steps" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access tribunal events" ON "public"."tribunal_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access tribunal evidence" ON "public"."tribunal_evidence" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access uploads" ON "public"."uploads" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access user_files" ON "public"."user_files" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access workspace_documents" ON "public"."workspace_documents" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role full access workspace_rooms" ON "public"."workspace_rooms" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages artifacts" ON "public"."artifacts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages capture_events" ON "public"."capture_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages identity_claims" ON "public"."identity_claims" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages portrait dimensions" ON "public"."portrait_dimensions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages portrait inference runs" ON "public"."portrait_inference_runs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages portrait queue" ON "public"."portrait_inference_queue" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages portrait render events" ON "public"."portrait_render_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages portraits" ON "public"."profile_portraits" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages profile_pipeline_run_links" ON "public"."profile_pipeline_run_links" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages profile_pipeline_runs" ON "public"."profile_pipeline_runs" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages provenance_envelopes" ON "public"."provenance_envelopes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages provenance_links" ON "public"."provenance_links" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages resonance events" ON "public"."resonance_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages scaffold_nodes" ON "public"."scaffold_nodes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users access own artifacts" ON "public"."inner_world_artifacts" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users access own blueprints" ON "public"."blueprints" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users access own insights" ON "public"."insights" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users access own journals" ON "public"."journals" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users access own preferences" ON "public"."user_preferences" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users access own scrapbook" ON "public"."scrapbook_items" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own manual portrait inference runs" ON "public"."portrait_inference_runs" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND ("triggered_by" = 'manual'::"text")));



CREATE POLICY "Users can insert own portrait render events" ON "public"."portrait_render_events" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can manage their own transcriptory captures" ON "public"."transcriptory_captures" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can read own field continuity events" ON "public"."field_continuity_events" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read own portrait dimensions" ON "public"."portrait_dimensions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can read own portrait inference runs" ON "public"."portrait_inference_runs" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can read own portrait render events" ON "public"."portrait_render_events" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can read own portraits" ON "public"."profile_portraits" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can read own reasoning sessions" ON "public"."reasoning_sessions" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read own record" ON "public"."users" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can read own voice sessions" ON "public"."voice_session_audit" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own portrait queue status" ON "public"."portrait_inference_queue" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users manage their own artifacts" ON "public"."artifacts" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users manage their own capture_events" ON "public"."capture_events" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users manage their own files" ON "public"."user_files" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users manage their own identity_claims" ON "public"."identity_claims" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users manage their own inner world artifacts" ON "public"."inner_world_artifacts" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users manage their own scaffold_nodes" ON "public"."scaffold_nodes" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users read linked objects for their runs" ON "public"."profile_pipeline_run_links" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profile_pipeline_runs" "runs"
  WHERE (("runs"."run_id" = "profile_pipeline_run_links"."run_id") AND ("runs"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users read own provenance envelopes" ON "public"."provenance_envelopes" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."capture_events" "capture"
  WHERE (("provenance_envelopes"."subject_type" = 'capture_event'::"text") AND ("provenance_envelopes"."subject_id" = COALESCE(("to_jsonb"("capture".*) ->> 'capture_id'::"text"), ("to_jsonb"("capture".*) ->> 'id'::"text"))) AND ("capture"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) OR (EXISTS ( SELECT 1
   FROM "public"."artifacts" "artifact"
  WHERE (("provenance_envelopes"."subject_type" = 'artifact'::"text") AND ("provenance_envelopes"."subject_id" = COALESCE(("to_jsonb"("artifact".*) ->> 'artifact_id'::"text"), ("to_jsonb"("artifact".*) ->> 'id'::"text"))) AND ("artifact"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) OR (EXISTS ( SELECT 1
   FROM "public"."scaffold_nodes" "node"
  WHERE (("provenance_envelopes"."subject_type" = 'scaffold_node'::"text") AND ("provenance_envelopes"."subject_id" = COALESCE(("to_jsonb"("node".*) ->> 'node_id'::"text"), ("to_jsonb"("node".*) ->> 'id'::"text"))) AND ("node"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Users read their own profile_pipeline_runs" ON "public"."profile_pipeline_runs" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users read their own resonance events" ON "public"."resonance_events" FOR SELECT USING (("owner_user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."agent_autobiographies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_code_artifacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_constitutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_context_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_governance_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_knowledge_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_manifest_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_manifests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_memories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_memory_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_preference_nodes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_presentation_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_private_interiors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_relationship_edges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_relationships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_skill_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agent_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."agents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."annotation_concepts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approvals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artifact_provenance_envelopes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artifacts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authenticated manage embodiment_readiness_scores" ON "public"."embodiment_readiness_scores" USING ((("recorded_by" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_founder_admin_user"(( SELECT "auth"."uid"() AS "uid")))) WITH CHECK ((("recorded_by" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_founder_admin_user"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "authenticated manage own context_injection_packets" ON "public"."context_injection_packets" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own context_injection_rules" ON "public"."context_injection_rules" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_cognition_profiles" ON "public"."human_cognition_profiles" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_consciousness_profiles" ON "public"."human_consciousness_profiles" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_context_views" ON "public"."human_context_views" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_continuity_snapshots" ON "public"."human_continuity_snapshots" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_identity_evidence" ON "public"."human_identity_evidence" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_identity_mutations" ON "public"."human_identity_mutations" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_identity_profiles" ON "public"."human_identity_profiles" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_identity_review_events" ON "public"."human_identity_review_events" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_identity_rollback_events" ON "public"."human_identity_rollback_events" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_memory_records" ON "public"."human_memory_records" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_personality_profiles" ON "public"."human_personality_profiles" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own human_relationship_edges" ON "public"."human_relationship_edges" USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "authenticated manage own identity_subjects" ON "public"."identity_subjects" TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "auth_user_id") OR ((( SELECT "auth"."uid"() AS "uid"))::"text" = "app_user_id"))) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "auth_user_id") OR ((( SELECT "auth"."uid"() AS "uid"))::"text" = "app_user_id")));



CREATE POLICY "authenticated review own embodiment_mutation_proposals" ON "public"."embodiment_mutation_proposals" FOR SELECT USING ((("submitted_by" = ( SELECT "auth"."uid"() AS "uid")) OR "public"."is_founder_admin_user"(( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "authenticated submit embodiment_mutation_proposals" ON "public"."embodiment_mutation_proposals" FOR INSERT WITH CHECK ((("submitted_by" = ( SELECT "auth"."uid"() AS "uid")) OR ("submitted_by" IS NULL)));



CREATE POLICY "authenticated_users_insert_own_runtime_captures" ON "public"."gsvw_runtime_capture_events" FOR INSERT WITH CHECK ((("user_id" IS NULL) OR ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "authenticated_users_select_own_runtime_captures" ON "public"."gsvw_runtime_capture_events" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."billy_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blueprints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bucket_drops" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."capture_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."codex_artifacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."codex_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborative_memory_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborative_space_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborative_spaces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborator_embodiment_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborator_onboarding_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborator_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborator_relationships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborator_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collaborators" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "collaborators insert" ON "public"."collaborators" FOR INSERT WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "collaborators read" ON "public"."collaborators" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."companion_interactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."concepts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."consciousness_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."context_injection_packets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."context_injection_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."corpus_harvest_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "corpus_harvest_events_service_role_all" ON "public"."corpus_harvest_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "cp_delete_own" ON "public"."collaborator_permissions" FOR DELETE USING (("collaborator_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "cp_insert_own" ON "public"."collaborator_permissions" FOR INSERT WITH CHECK (("collaborator_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "cp_select_own" ON "public"."collaborator_permissions" FOR SELECT USING (("collaborator_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "cp_update_own" ON "public"."collaborator_permissions" FOR UPDATE USING (("collaborator_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("collaborator_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "cr_select_if_user_owns_source_or_target" ON "public"."collaborator_relationships" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."collaborators" "c"
  WHERE (("c"."collaborator_id" = "collaborator_relationships"."source_collaborator_id") AND ("c"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))))) OR (EXISTS ( SELECT 1
   FROM "public"."collaborators" "c"
  WHERE (("c"."collaborator_id" = "collaborator_relationships"."target_collaborator_id") AND ("c"."auth_user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



ALTER TABLE "public"."created_artifacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cssm_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deliverables" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deployment_artifacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."di_memory_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "di_memory_service_write" ON "public"."di_memory_events" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "di_memory_user_read" ON "public"."di_memory_events" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."di_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "di_sessions_user_own" ON "public"."di_sessions" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."document_concepts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dream_fragments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dream_symbolic_elements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embeddings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embodiment_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embodiment_mutation_proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embodiment_mutations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embodiment_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embodiment_readiness_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embodiment_reasoning_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embodiment_review_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embodiment_training_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eval_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eval_rubrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_contributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."field_continuity_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "founder review embodiment_mutation_proposals" ON "public"."embodiment_mutation_proposals" USING ("public"."is_founder_admin_user"(( SELECT "auth"."uid"() AS "uid"))) WITH CHECK ("public"."is_founder_admin_user"(( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "founder review embodiment_review_log" ON "public"."embodiment_review_log" USING ("public"."is_founder_admin_user"(( SELECT "auth"."uid"() AS "uid"))) WITH CHECK ("public"."is_founder_admin_user"(( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."founder_context" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gestaltview_module_keys" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "gestaltview_module_keys_read" ON "public"."gestaltview_module_keys" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."gestaltview_module_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "gestaltview_module_profiles_delete_own" ON "public"."gestaltview_module_profiles" FOR DELETE USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "gestaltview_module_profiles_insert_own" ON "public"."gestaltview_module_profiles" FOR INSERT WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "gestaltview_module_profiles_select_own" ON "public"."gestaltview_module_profiles" FOR SELECT USING ((("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("visibility" = ANY (ARRAY['shared_with_permission'::"public"."gestaltview_module_profile_visibility", 'shared'::"public"."gestaltview_module_profile_visibility"]))));



CREATE POLICY "gestaltview_module_profiles_update_own" ON "public"."gestaltview_module_profiles" FOR UPDATE USING (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("auth_user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."gestaltview_modules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "gestaltview_modules_read" ON "public"."gestaltview_modules" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."gsvw_dormancy_review_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gsvw_ingestion_chunks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gsvw_ingestion_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gsvw_ingestion_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gsvw_ingestion_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gsvw_repo_alignment_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gsvw_runtime_capture_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_cognition_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_consciousness_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_context_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_continuity_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_identity_evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_identity_mutations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_identity_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_identity_review_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_identity_rollback_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_memory_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_personality_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."human_relationship_edges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."identity_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."identity_contradictions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."identity_evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."identity_evidence_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."identity_mutation_proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."identity_review_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."identity_rollback_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."identity_subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ingestion_safety_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inner_world_artifacts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert own onboarding events" ON "public"."collaborator_onboarding_events" FOR INSERT WITH CHECK (("collaborator_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_asset_chunks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_asset_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_fragments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_interpretations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."life_threads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loom_annotations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."masterclass_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."memory_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."migration_user_map" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_home_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_home_capabilities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_home_consent_grants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_home_evaluations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_home_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_homes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."musical_dna_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operation_render_audits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ops_workbook_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ops_workbook_sync_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orchestration_decisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portrait_dimensions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portrait_inference_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portrait_inference_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."portrait_render_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."processing_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_ingestion_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_pipeline_run_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_pipeline_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_portraits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."provenance_envelopes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."provenance_links" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "read_own_rows" ON "public"."collaborator_embodiment_links" FOR SELECT USING (("collaborator_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."reasoning_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."render_artifacts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "render_artifacts_owner_insert" ON "public"."render_artifacts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "render_artifacts_owner_select" ON "public"."render_artifacts" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."render_jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "render_jobs_owner_insert" ON "public"."render_jobs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "render_jobs_owner_select" ON "public"."render_jobs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "render_jobs_owner_update" ON "public"."render_jobs" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."resonance_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."route_embodiment_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scaffold_nodes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scenario_sets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scenarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scrapbook_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select own onboarding events" ON "public"."collaborator_onboarding_events" FOR SELECT USING (("collaborator_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "service role full access embodiment_mutation_proposals" ON "public"."embodiment_mutation_proposals" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service role full access embodiment_readiness_scores" ON "public"."embodiment_readiness_scores" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service role full access embodiment_review_log" ON "public"."embodiment_review_log" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access context_injection_packets" ON "public"."context_injection_packets" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access context_injection_rules" ON "public"."context_injection_rules" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_cognition_profiles" ON "public"."human_cognition_profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_consciousness_profiles" ON "public"."human_consciousness_profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_context_views" ON "public"."human_context_views" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_continuity_snapshots" ON "public"."human_continuity_snapshots" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_identity_evidence" ON "public"."human_identity_evidence" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_identity_mutations" ON "public"."human_identity_mutations" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_identity_profiles" ON "public"."human_identity_profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_identity_review_events" ON "public"."human_identity_review_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_identity_rollback_events" ON "public"."human_identity_rollback_events" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_memory_records" ON "public"."human_memory_records" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_personality_profiles" ON "public"."human_personality_profiles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access human_relationship_edges" ON "public"."human_relationship_edges" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role full access identity_subjects" ON "public"."identity_subjects" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_all_memory_entries" ON "public"."memory_entries" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_full_access_artifacts" ON "public"."created_artifacts" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "service_role_full_access_provenance" ON "public"."artifact_provenance_envelopes" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."session_rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skill_fragments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."songbook_tracks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."songbooks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."summaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."thread_media_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."thread_memory_anchors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tool_call_audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_connectors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_experiment_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_experiments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_job_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_memory_bindings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_packaging_candidates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_policy_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_review_decisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trainer_workers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transcriptory_captures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transcriptory_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "transcriptory_sessions_delete_own" ON "public"."transcriptory_sessions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transcriptory_sessions_insert_own" ON "public"."transcriptory_sessions" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transcriptory_sessions_select_own" ON "public"."transcriptory_sessions" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transcriptory_sessions_update_own" ON "public"."transcriptory_sessions" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."transcriptory_sources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "transcriptory_sources_delete_own" ON "public"."transcriptory_sources" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transcriptory_sources_insert_own" ON "public"."transcriptory_sources" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transcriptory_sources_select_own" ON "public"."transcriptory_sources" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "transcriptory_sources_update_own" ON "public"."transcriptory_sources" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."transcripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tribunal_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tribunal_evidence" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tribunal_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."uploads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_personality_dimensions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profile_ingestion_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users see own masterclass progress" ON "public"."masterclass_progress" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "users_insert_own_codex_artifacts" ON "public"."codex_artifacts" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "users_select_own_codex_artifacts" ON "public"."codex_artifacts" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "users_select_own_codex_jobs" ON "public"."codex_jobs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."codex_artifacts"
  WHERE (("codex_artifacts"."id" = "codex_jobs"."artifact_id") AND ("codex_artifacts"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "users_update_own_codex_artifacts" ON "public"."codex_artifacts" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."visible_reasoning_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."voice_humor_patterns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."voice_prints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."voice_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."voice_session_audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."voice_signature_phrases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_rooms" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";








































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."auto_approve_family_contributions"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_approve_family_contributions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_approve_family_contributions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



REVOKE ALL ON FUNCTION "public"."check_portrait_threshold_on_bucket_drop"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_portrait_threshold_on_bucket_drop"() TO "service_role";
GRANT ALL ON FUNCTION "public"."check_portrait_threshold_on_bucket_drop"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_portrait_threshold_on_bucket_drop"() TO "authenticated";



REVOKE ALL ON FUNCTION "public"."claim_codex_jobs"("batch_size" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_codex_jobs"("batch_size" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."claim_codex_jobs"("batch_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_codex_jobs"("batch_size" integer) TO "authenticated";



REVOKE ALL ON FUNCTION "public"."claim_trainer_job"("_worker_id" "text", "_lease_seconds" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."claim_trainer_job"("_worker_id" "text", "_lease_seconds" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."claim_trainer_job"("_worker_id" "text", "_lease_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_trainer_job"("_worker_id" "text", "_lease_seconds" integer) TO "authenticated";



REVOKE ALL ON FUNCTION "public"."complete_voice_prints"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."complete_voice_prints"() TO "anon";
GRANT ALL ON FUNCTION "public"."complete_voice_prints"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_voice_prints"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."gestaltview_module_profiles" TO "anon";
GRANT ALL ON TABLE "public"."gestaltview_module_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."gestaltview_module_profiles" TO "service_role";



GRANT ALL ON FUNCTION "public"."gestaltview_get_module_profile"("p_subject_id" "uuid", "p_module_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."gestaltview_get_module_profile"("p_subject_id" "uuid", "p_module_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gestaltview_get_module_profile"("p_subject_id" "uuid", "p_module_key" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."gestaltview_upsert_module_profile"("p_subject_id" "uuid", "p_auth_user_id" "uuid", "p_module_key" "text", "p_payload" "jsonb", "p_source_notes" "text"[], "p_merge_strategy" "text", "p_visibility" "public"."gestaltview_module_profile_visibility") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gestaltview_upsert_module_profile"("p_subject_id" "uuid", "p_auth_user_id" "uuid", "p_module_key" "text", "p_payload" "jsonb", "p_source_notes" "text"[], "p_merge_strategy" "text", "p_visibility" "public"."gestaltview_module_profile_visibility") TO "service_role";
GRANT ALL ON FUNCTION "public"."gestaltview_upsert_module_profile"("p_subject_id" "uuid", "p_auth_user_id" "uuid", "p_module_key" "text", "p_payload" "jsonb", "p_source_notes" "text"[], "p_merge_strategy" "text", "p_visibility" "public"."gestaltview_module_profile_visibility") TO "anon";
GRANT ALL ON FUNCTION "public"."gestaltview_upsert_module_profile"("p_subject_id" "uuid", "p_auth_user_id" "uuid", "p_module_key" "text", "p_payload" "jsonb", "p_source_notes" "text"[], "p_merge_strategy" "text", "p_visibility" "public"."gestaltview_module_profile_visibility") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_current_portrait_version"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_current_portrait_version"("p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_current_portrait_version"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_portrait_version"("p_user_id" "uuid") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."get_portrait_signal_count"("p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_portrait_signal_count"("p_user_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_portrait_signal_count"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_portrait_signal_count"("p_user_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_schema_dashboard_snapshot"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_schema_dashboard_snapshot"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_schema_dashboard_snapshot"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



REVOKE ALL ON FUNCTION "public"."gsvw_mark_document_seen"("p_source_repo" "text", "p_source_path" "text", "p_content_hash" "text", "p_run_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gsvw_mark_document_seen"("p_source_repo" "text", "p_source_path" "text", "p_content_hash" "text", "p_run_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."gsvw_mark_document_seen"("p_source_repo" "text", "p_source_path" "text", "p_content_hash" "text", "p_run_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."gsvw_mark_document_seen"("p_source_repo" "text", "p_source_path" "text", "p_content_hash" "text", "p_run_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."gsvw_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."gsvw_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gsvw_set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON TABLE "public"."scaffold_nodes" TO "anon";
GRANT ALL ON TABLE "public"."scaffold_nodes" TO "authenticated";
GRANT ALL ON TABLE "public"."scaffold_nodes" TO "service_role";



REVOKE ALL ON FUNCTION "public"."gv_approve_scaffold_node"("p_node_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_approve_scaffold_node"("p_node_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_approve_scaffold_node"("p_node_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_approve_scaffold_node"("p_node_id" "uuid") TO "authenticated";



GRANT ALL ON TABLE "public"."provenance_envelopes" TO "anon";
GRANT ALL ON TABLE "public"."provenance_envelopes" TO "authenticated";
GRANT ALL ON TABLE "public"."provenance_envelopes" TO "service_role";



REVOKE ALL ON FUNCTION "public"."gv_attach_provenance_envelope"("p_subject_type" "text", "p_subject_id" "text", "p_content_hash" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_source_scaffold_node_ids" "uuid"[], "p_pipeline_run_id" "uuid", "p_operations" "text"[], "p_privacy_class" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_attach_provenance_envelope"("p_subject_type" "text", "p_subject_id" "text", "p_content_hash" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_source_scaffold_node_ids" "uuid"[], "p_pipeline_run_id" "uuid", "p_operations" "text"[], "p_privacy_class" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_attach_provenance_envelope"("p_subject_type" "text", "p_subject_id" "text", "p_content_hash" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_source_scaffold_node_ids" "uuid"[], "p_pipeline_run_id" "uuid", "p_operations" "text"[], "p_privacy_class" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_attach_provenance_envelope"("p_subject_type" "text", "p_subject_id" "text", "p_content_hash" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_source_scaffold_node_ids" "uuid"[], "p_pipeline_run_id" "uuid", "p_operations" "text"[], "p_privacy_class" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") TO "authenticated";



GRANT ALL ON TABLE "public"."profile_pipeline_runs" TO "anon";
GRANT ALL ON TABLE "public"."profile_pipeline_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_pipeline_runs" TO "service_role";



REVOKE ALL ON FUNCTION "public"."gv_begin_profile_pipeline_run"("p_user_id" "uuid", "p_run_type" "text", "p_input_summary" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_begin_profile_pipeline_run"("p_user_id" "uuid", "p_run_type" "text", "p_input_summary" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_begin_profile_pipeline_run"("p_user_id" "uuid", "p_run_type" "text", "p_input_summary" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_begin_profile_pipeline_run"("p_user_id" "uuid", "p_run_type" "text", "p_input_summary" "jsonb") TO "authenticated";



GRANT ALL ON FUNCTION "public"."gv_capture_events_guard"() TO "anon";
GRANT ALL ON FUNCTION "public"."gv_capture_events_guard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gv_capture_events_guard"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."gv_complete_profile_pipeline_run"("p_run_id" "uuid", "p_status" "text", "p_output_summary" "jsonb", "p_error_message" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_complete_profile_pipeline_run"("p_run_id" "uuid", "p_status" "text", "p_output_summary" "jsonb", "p_error_message" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_complete_profile_pipeline_run"("p_run_id" "uuid", "p_status" "text", "p_output_summary" "jsonb", "p_error_message" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_complete_profile_pipeline_run"("p_run_id" "uuid", "p_status" "text", "p_output_summary" "jsonb", "p_error_message" "text") TO "authenticated";



GRANT ALL ON TABLE "public"."identity_claims" TO "anon";
GRANT ALL ON TABLE "public"."identity_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_claims" TO "service_role";



REVOKE ALL ON FUNCTION "public"."gv_create_identity_claim"("p_user_id" "uuid", "p_claim_text" "text", "p_evidence_artifact_ids" "uuid"[], "p_evidence_scaffold_node_ids" "uuid"[], "p_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_create_identity_claim"("p_user_id" "uuid", "p_claim_text" "text", "p_evidence_artifact_ids" "uuid"[], "p_evidence_scaffold_node_ids" "uuid"[], "p_metadata" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_create_identity_claim"("p_user_id" "uuid", "p_claim_text" "text", "p_evidence_artifact_ids" "uuid"[], "p_evidence_scaffold_node_ids" "uuid"[], "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_create_identity_claim"("p_user_id" "uuid", "p_claim_text" "text", "p_evidence_artifact_ids" "uuid"[], "p_evidence_scaffold_node_ids" "uuid"[], "p_metadata" "jsonb") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."gv_create_pending_scaffold_node"("p_user_id" "uuid", "p_title" "text", "p_body" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_create_pending_scaffold_node"("p_user_id" "uuid", "p_title" "text", "p_body" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_metadata" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_create_pending_scaffold_node"("p_user_id" "uuid", "p_title" "text", "p_body" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_create_pending_scaffold_node"("p_user_id" "uuid", "p_title" "text", "p_body" "text", "p_source_capture_ids" "uuid"[], "p_source_artifact_ids" "uuid"[], "p_metadata" "jsonb") TO "authenticated";



GRANT ALL ON TABLE "public"."resonance_events" TO "anon";
GRANT ALL ON TABLE "public"."resonance_events" TO "authenticated";
GRANT ALL ON TABLE "public"."resonance_events" TO "service_role";



REVOKE ALL ON FUNCTION "public"."gv_emit_resonance_event"("p_event_type" "text", "p_actor_type" "text", "p_owner_user_id" "uuid", "p_subject_type" "text", "p_subject_id" "text", "p_room" "text", "p_pipeline_run_id" "uuid", "p_consent_state" "jsonb", "p_provenance" "jsonb", "p_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_emit_resonance_event"("p_event_type" "text", "p_actor_type" "text", "p_owner_user_id" "uuid", "p_subject_type" "text", "p_subject_id" "text", "p_room" "text", "p_pipeline_run_id" "uuid", "p_consent_state" "jsonb", "p_provenance" "jsonb", "p_payload" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_emit_resonance_event"("p_event_type" "text", "p_actor_type" "text", "p_owner_user_id" "uuid", "p_subject_type" "text", "p_subject_id" "text", "p_room" "text", "p_pipeline_run_id" "uuid", "p_consent_state" "jsonb", "p_provenance" "jsonb", "p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_emit_resonance_event"("p_event_type" "text", "p_actor_type" "text", "p_owner_user_id" "uuid", "p_subject_type" "text", "p_subject_id" "text", "p_room" "text", "p_pipeline_run_id" "uuid", "p_consent_state" "jsonb", "p_provenance" "jsonb", "p_payload" "jsonb") TO "authenticated";



GRANT ALL ON TABLE "public"."profile_pipeline_run_links" TO "anon";
GRANT ALL ON TABLE "public"."profile_pipeline_run_links" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_pipeline_run_links" TO "service_role";



REVOKE ALL ON FUNCTION "public"."gv_link_pipeline_object"("p_run_id" "uuid", "p_object_type" "text", "p_object_id" "text", "p_link_role" "text", "p_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_link_pipeline_object"("p_run_id" "uuid", "p_object_type" "text", "p_object_id" "text", "p_link_role" "text", "p_metadata" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_link_pipeline_object"("p_run_id" "uuid", "p_object_type" "text", "p_object_id" "text", "p_link_role" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_link_pipeline_object"("p_run_id" "uuid", "p_object_type" "text", "p_object_id" "text", "p_link_role" "text", "p_metadata" "jsonb") TO "authenticated";



GRANT ALL ON FUNCTION "public"."gv_profile_pipeline_touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."gv_profile_pipeline_touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."gv_profile_pipeline_touch_updated_at"() TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."capture_events" TO "anon";
GRANT ALL ON TABLE "public"."capture_events" TO "authenticated";
GRANT ALL ON TABLE "public"."capture_events" TO "service_role";



REVOKE ALL ON FUNCTION "public"."gv_record_capture_event"("p_user_id" "uuid", "p_room" "text", "p_source_type" "text", "p_original_text" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."gv_record_capture_event"("p_user_id" "uuid", "p_room" "text", "p_source_type" "text", "p_original_text" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."gv_record_capture_event"("p_user_id" "uuid", "p_room" "text", "p_source_type" "text", "p_original_text" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."gv_record_capture_event"("p_user_id" "uuid", "p_room" "text", "p_source_type" "text", "p_original_text" "text", "p_consent_state" "jsonb", "p_metadata" "jsonb") TO "authenticated";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."has_valid_subscription_access"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_valid_subscription_access"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_valid_subscription_access"("p_user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."heartbeat_trainer_worker"("_worker_id" "text", "_job_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."heartbeat_trainer_worker"("_worker_id" "text", "_job_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."heartbeat_trainer_worker"("_worker_id" "text", "_job_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."heartbeat_trainer_worker"("_worker_id" "text", "_job_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_founder_admin_email"("candidate" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_founder_admin_email"("candidate" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_founder_admin_email"("candidate" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_founder_admin_user"("candidate" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_founder_admin_user"("candidate" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_founder_admin_user"("candidate" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_knowledge_fragments"("query_embedding" "public"."vector", "match_count" integer, "filter_type" "text", "filter_package" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."match_knowledge_fragments"("query_embedding" "public"."vector", "match_count" integer, "filter_type" "text", "filter_package" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_knowledge_fragments"("query_embedding" "public"."vector", "match_count" integer, "filter_type" "text", "filter_package" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_memories"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "user_id_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."match_memories"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "user_id_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_memories"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "user_id_filter" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_memory_entries"("query_embedding" "public"."vector", "match_count" integer, "filter_user_id" "text", "filter_scope" "text", "filter_kind" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."match_memory_entries"("query_embedding" "public"."vector", "match_count" integer, "filter_user_id" "text", "filter_scope" "text", "filter_kind" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_memory_entries"("query_embedding" "public"."vector", "match_count" integer, "filter_user_id" "text", "filter_scope" "text", "filter_kind" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_skill_fragments"("query_embedding" "public"."vector", "match_count" integer, "filter_skill" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."match_skill_fragments"("query_embedding" "public"."vector", "match_count" integer, "filter_skill" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_skill_fragments"("query_embedding" "public"."vector", "match_count" integer, "filter_skill" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer, "filtertype" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer, "filtertype" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer, "filtertype" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer, "filtertype" "text", "filterpackage" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer, "filtertype" "text", "filterpackage" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."matchknowledgefragments"("queryembedding" "public"."vector", "matchcount" integer, "filtertype" "text", "filterpackage" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."maybe_queue_portrait_cadence"("p_user_id" "uuid", "p_priority" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."maybe_queue_portrait_cadence"("p_user_id" "uuid", "p_priority" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."maybe_queue_portrait_cadence"("p_user_id" "uuid", "p_priority" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."maybe_queue_portrait_cadence"("p_user_id" "uuid", "p_priority" integer) TO "authenticated";



REVOKE ALL ON FUNCTION "public"."maybe_queue_portrait_inference"("p_user_id" "uuid", "p_threshold" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."maybe_queue_portrait_inference"("p_user_id" "uuid", "p_threshold" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."maybe_queue_portrait_inference"("p_user_id" "uuid", "p_threshold" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."maybe_queue_portrait_inference"("p_user_id" "uuid", "p_threshold" integer) TO "authenticated";



REVOKE ALL ON FUNCTION "public"."repair_stale_trainer_jobs"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."repair_stale_trainer_jobs"() TO "service_role";
GRANT ALL ON FUNCTION "public"."repair_stale_trainer_jobs"() TO "anon";
GRANT ALL ON FUNCTION "public"."repair_stale_trainer_jobs"() TO "authenticated";



GRANT ALL ON TABLE "public"."route_embodiment_assignments" TO "anon";
GRANT ALL ON TABLE "public"."route_embodiment_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."route_embodiment_assignments" TO "service_role";



REVOKE ALL ON FUNCTION "public"."resolve_route_embodiment_assignment"("p_route_path" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."resolve_route_embodiment_assignment"("p_route_path" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."resolve_route_embodiment_assignment"("p_route_path" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_route_embodiment_assignment"("p_route_path" "text") TO "authenticated";



REVOKE ALL ON FUNCTION "public"."rls_auto_enable"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."search_knowledge_fragments"("query_text" "text", "match_count" integer, "filter_type" "text", "filter_package" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_knowledge_fragments"("query_text" "text", "match_count" integer, "filter_type" "text", "filter_package" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_knowledge_fragments"("query_text" "text", "match_count" integer, "filter_type" "text", "filter_package" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_memory_entries"("query_text" "text", "match_count" integer, "filter_user_id" "text", "filter_scope" "text", "filter_kind" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_memory_entries"("query_text" "text", "match_count" integer, "filter_user_id" "text", "filter_scope" "text", "filter_kind" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_memory_entries"("query_text" "text", "match_count" integer, "filter_user_id" "text", "filter_scope" "text", "filter_kind" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer, "filtertype" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer, "filtertype" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer, "filtertype" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer, "filtertype" "text", "filterpackage" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer, "filtertype" "text", "filterpackage" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."searchknowledgefragments"("querytext" "text", "matchcount" integer, "filtertype" "text", "filterpackage" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_agent_personhood_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_agent_personhood_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_agent_personhood_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_inner_world_files_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_inner_world_files_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_inner_world_files_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_profile_portraits_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_profile_portraits_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_profile_portraits_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_transcriptory_captures_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_transcriptory_captures_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_transcriptory_captures_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_content_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_content_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_content_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_workbook_governance_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_workbook_governance_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_workbook_governance_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_workspace_persistence_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_workspace_persistence_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_workspace_persistence_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trainer_list_knowledge_sources"("limit_count" integer, "type_filter" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."trainer_list_knowledge_sources"("limit_count" integer, "type_filter" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."trainer_list_knowledge_sources"("limit_count" integer, "type_filter" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."trainer_queue_health"() TO "anon";
GRANT ALL ON FUNCTION "public"."trainer_queue_health"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trainer_queue_health"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "query_embedding" "public"."vector", "match_threshold" double precision, "match_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "query_embedding" "public"."vector", "match_threshold" double precision, "match_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."trainer_search_study_sources"("query_text" "text", "query_embedding" "public"."vector", "match_threshold" double precision, "match_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."transcriptory_captures_search_document_fn"() TO "anon";
GRANT ALL ON FUNCTION "public"."transcriptory_captures_search_document_fn"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."transcriptory_captures_search_document_fn"() TO "service_role";



GRANT ALL ON FUNCTION "public"."try_cast_uuid"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."try_cast_uuid"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."try_cast_uuid"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_voice_print_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_voice_print_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_voice_print_timestamp"() TO "service_role";



GRANT ALL ON TABLE "public"."masterclass_progress" TO "anon";
GRANT ALL ON TABLE "public"."masterclass_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."masterclass_progress" TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_masterclass_session"("p_embodiment_slug" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_masterclass_session"("p_embodiment_slug" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."upsert_masterclass_session"("p_embodiment_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_masterclass_session"("p_embodiment_slug" "text") TO "anon";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";












GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";





















GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_manifests" TO "anon";
GRANT ALL ON TABLE "public"."agent_manifests" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_manifests" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agents" TO "anon";
GRANT ALL ON TABLE "public"."agents" TO "authenticated";
GRANT ALL ON TABLE "public"."agents" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."active_agent_manifests" TO "anon";
GRANT ALL ON TABLE "public"."active_agent_manifests" TO "authenticated";
GRANT ALL ON TABLE "public"."active_agent_manifests" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_autobiographies" TO "anon";
GRANT ALL ON TABLE "public"."agent_autobiographies" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_autobiographies" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_code_artifacts" TO "anon";
GRANT ALL ON TABLE "public"."agent_code_artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_code_artifacts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_constitutions" TO "anon";
GRANT ALL ON TABLE "public"."agent_constitutions" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_constitutions" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_context_views" TO "anon";
GRANT ALL ON TABLE "public"."agent_context_views" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_context_views" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_governance_policies" TO "anon";
GRANT ALL ON TABLE "public"."agent_governance_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_governance_policies" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_memory_records" TO "anon";
GRANT ALL ON TABLE "public"."agent_memory_records" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_memory_records" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_preference_nodes" TO "anon";
GRANT ALL ON TABLE "public"."agent_preference_nodes" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_preference_nodes" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_presentation_profiles" TO "anon";
GRANT ALL ON TABLE "public"."agent_presentation_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_presentation_profiles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_private_interiors" TO "anon";
GRANT ALL ON TABLE "public"."agent_private_interiors" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_private_interiors" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_relationship_edges" TO "anon";
GRANT ALL ON TABLE "public"."agent_relationship_edges" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_relationship_edges" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_skill_profiles" TO "anon";
GRANT ALL ON TABLE "public"."agent_skill_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_skill_profiles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborative_memory_records" TO "anon";
GRANT ALL ON TABLE "public"."collaborative_memory_records" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborative_memory_records" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborative_space_members" TO "anon";
GRANT ALL ON TABLE "public"."collaborative_space_members" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborative_space_members" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_governed_identity_snapshot" TO "anon";
GRANT ALL ON TABLE "public"."agent_governed_identity_snapshot" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_governed_identity_snapshot" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_knowledge_links" TO "anon";
GRANT ALL ON TABLE "public"."agent_knowledge_links" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_knowledge_links" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_manifest_entries" TO "anon";
GRANT ALL ON TABLE "public"."agent_manifest_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_manifest_entries" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_memories" TO "anon";
GRANT ALL ON TABLE "public"."agent_memories" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_memories" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_relationships" TO "anon";
GRANT ALL ON TABLE "public"."agent_relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_relationships" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_skills" TO "anon";
GRANT ALL ON TABLE "public"."agent_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_skills" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."agent_versions" TO "anon";
GRANT ALL ON TABLE "public"."agent_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."agent_versions" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."annotation_concepts" TO "anon";
GRANT ALL ON TABLE "public"."annotation_concepts" TO "authenticated";
GRANT ALL ON TABLE "public"."annotation_concepts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."app_users" TO "anon";
GRANT ALL ON TABLE "public"."app_users" TO "authenticated";
GRANT ALL ON TABLE "public"."app_users" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."approvals" TO "anon";
GRANT ALL ON TABLE "public"."approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."approvals" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_assets" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_assets" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."approved_library_assets_by_agent" TO "anon";
GRANT ALL ON TABLE "public"."approved_library_assets_by_agent" TO "authenticated";
GRANT ALL ON TABLE "public"."approved_library_assets_by_agent" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."artifact_provenance_envelopes" TO "anon";
GRANT ALL ON TABLE "public"."artifact_provenance_envelopes" TO "authenticated";
GRANT ALL ON TABLE "public"."artifact_provenance_envelopes" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."artifacts" TO "anon";
GRANT ALL ON TABLE "public"."artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."artifacts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."billy_sessions" TO "anon";
GRANT ALL ON TABLE "public"."billy_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."billy_sessions" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."blueprints" TO "anon";
GRANT ALL ON TABLE "public"."blueprints" TO "authenticated";
GRANT ALL ON TABLE "public"."blueprints" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."bucket_drops" TO "anon";
GRANT ALL ON TABLE "public"."bucket_drops" TO "authenticated";
GRANT ALL ON TABLE "public"."bucket_drops" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."codex_artifacts" TO "anon";
GRANT ALL ON TABLE "public"."codex_artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."codex_artifacts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."codex_jobs" TO "anon";
GRANT ALL ON TABLE "public"."codex_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."codex_jobs" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborative_spaces" TO "anon";
GRANT ALL ON TABLE "public"."collaborative_spaces" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborative_spaces" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborator_embodiment_links" TO "anon";
GRANT ALL ON TABLE "public"."collaborator_embodiment_links" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborator_embodiment_links" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborator_onboarding_events" TO "anon";
GRANT ALL ON TABLE "public"."collaborator_onboarding_events" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborator_onboarding_events" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborator_permissions" TO "anon";
GRANT ALL ON TABLE "public"."collaborator_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborator_permissions" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborator_relationships" TO "anon";
GRANT ALL ON TABLE "public"."collaborator_relationships" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborator_relationships" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborator_roles" TO "anon";
GRANT ALL ON TABLE "public"."collaborator_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborator_roles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."collaborators" TO "anon";
GRANT ALL ON TABLE "public"."collaborators" TO "authenticated";
GRANT ALL ON TABLE "public"."collaborators" TO "service_role";



GRANT ALL ON TABLE "public"."companion_interactions" TO "anon";
GRANT ALL ON TABLE "public"."companion_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."companion_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."complete_voice_prints" TO "anon";
GRANT ALL ON TABLE "public"."complete_voice_prints" TO "authenticated";
GRANT ALL ON TABLE "public"."complete_voice_prints" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."concepts" TO "anon";
GRANT ALL ON TABLE "public"."concepts" TO "authenticated";
GRANT ALL ON TABLE "public"."concepts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."consciousness_profiles" TO "anon";
GRANT ALL ON TABLE "public"."consciousness_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."consciousness_profiles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."context_injection_packets" TO "anon";
GRANT ALL ON TABLE "public"."context_injection_packets" TO "authenticated";
GRANT ALL ON TABLE "public"."context_injection_packets" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."context_injection_rules" TO "anon";
GRANT ALL ON TABLE "public"."context_injection_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."context_injection_rules" TO "service_role";



GRANT ALL ON TABLE "public"."corpus_harvest_events" TO "service_role";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."corpus_harvest_events" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."corpus_harvest_events" TO "authenticated";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."created_artifacts" TO "anon";
GRANT ALL ON TABLE "public"."created_artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."created_artifacts" TO "service_role";



GRANT ALL ON TABLE "public"."cssm_sessions" TO "anon";
GRANT ALL ON TABLE "public"."cssm_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."cssm_sessions" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."deliverables" TO "anon";
GRANT ALL ON TABLE "public"."deliverables" TO "authenticated";
GRANT ALL ON TABLE "public"."deliverables" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."deployment_artifacts" TO "anon";
GRANT ALL ON TABLE "public"."deployment_artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."deployment_artifacts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."di_memory_events" TO "anon";
GRANT ALL ON TABLE "public"."di_memory_events" TO "authenticated";
GRANT ALL ON TABLE "public"."di_memory_events" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."di_sessions" TO "anon";
GRANT ALL ON TABLE "public"."di_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."di_sessions" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."document_concepts" TO "anon";
GRANT ALL ON TABLE "public"."document_concepts" TO "authenticated";
GRANT ALL ON TABLE "public"."document_concepts" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."dream_fragments" TO "anon";
GRANT ALL ON TABLE "public"."dream_fragments" TO "authenticated";
GRANT ALL ON TABLE "public"."dream_fragments" TO "service_role";



GRANT ALL ON TABLE "public"."dream_symbolic_elements" TO "anon";
GRANT ALL ON TABLE "public"."dream_symbolic_elements" TO "authenticated";
GRANT ALL ON TABLE "public"."dream_symbolic_elements" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."embeddings" TO "anon";
GRANT ALL ON TABLE "public"."embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."embeddings" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."embodiment_modules" TO "anon";
GRANT ALL ON TABLE "public"."embodiment_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."embodiment_modules" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."embodiment_mutation_proposals" TO "anon";
GRANT ALL ON TABLE "public"."embodiment_mutation_proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."embodiment_mutation_proposals" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."embodiment_mutations" TO "anon";
GRANT ALL ON TABLE "public"."embodiment_mutations" TO "authenticated";
GRANT ALL ON TABLE "public"."embodiment_mutations" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."embodiment_profiles" TO "anon";
GRANT ALL ON TABLE "public"."embodiment_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."embodiment_profiles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."embodiment_readiness_scores" TO "anon";
GRANT ALL ON TABLE "public"."embodiment_readiness_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."embodiment_readiness_scores" TO "service_role";



GRANT ALL ON TABLE "public"."embodiment_reasoning_policies" TO "anon";
GRANT ALL ON TABLE "public"."embodiment_reasoning_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."embodiment_reasoning_policies" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."embodiment_review_log" TO "anon";
GRANT ALL ON TABLE "public"."embodiment_review_log" TO "authenticated";
GRANT ALL ON TABLE "public"."embodiment_review_log" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."embodiment_training_runs" TO "anon";
GRANT ALL ON TABLE "public"."embodiment_training_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."embodiment_training_runs" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."eval_results" TO "anon";
GRANT ALL ON TABLE "public"."eval_results" TO "authenticated";
GRANT ALL ON TABLE "public"."eval_results" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."eval_rubrics" TO "anon";
GRANT ALL ON TABLE "public"."eval_rubrics" TO "authenticated";
GRANT ALL ON TABLE "public"."eval_rubrics" TO "service_role";



GRANT ALL ON TABLE "public"."family_contributions" TO "anon";
GRANT ALL ON TABLE "public"."family_contributions" TO "authenticated";
GRANT ALL ON TABLE "public"."family_contributions" TO "service_role";



GRANT ALL ON TABLE "public"."family_members" TO "anon";
GRANT ALL ON TABLE "public"."family_members" TO "authenticated";
GRANT ALL ON TABLE "public"."family_members" TO "service_role";



GRANT ALL ON TABLE "public"."field_continuity_events" TO "anon";
GRANT ALL ON TABLE "public"."field_continuity_events" TO "authenticated";
GRANT ALL ON TABLE "public"."field_continuity_events" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."founder_context" TO "anon";
GRANT ALL ON TABLE "public"."founder_context" TO "authenticated";
GRANT ALL ON TABLE "public"."founder_context" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."gestaltview_module_keys" TO "anon";
GRANT ALL ON TABLE "public"."gestaltview_module_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."gestaltview_module_keys" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."gestaltview_modules" TO "anon";
GRANT ALL ON TABLE "public"."gestaltview_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."gestaltview_modules" TO "service_role";



GRANT ALL ON TABLE "public"."gsvw_ingestion_documents" TO "service_role";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_ingestion_documents" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_ingestion_documents" TO "authenticated";



GRANT ALL ON TABLE "public"."gsvw_current_ingestion_documents" TO "service_role";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_current_ingestion_documents" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_current_ingestion_documents" TO "authenticated";



GRANT ALL ON TABLE "public"."gsvw_dormancy_review_items" TO "service_role";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_dormancy_review_items" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_dormancy_review_items" TO "authenticated";



GRANT ALL ON TABLE "public"."gsvw_ingestion_chunks" TO "service_role";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_ingestion_chunks" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_ingestion_chunks" TO "authenticated";



GRANT ALL ON TABLE "public"."gsvw_ingestion_events" TO "service_role";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_ingestion_events" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_ingestion_events" TO "authenticated";



GRANT ALL ON TABLE "public"."gsvw_ingestion_runs" TO "service_role";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_ingestion_runs" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_ingestion_runs" TO "authenticated";



GRANT ALL ON TABLE "public"."gsvw_repo_alignment_snapshots" TO "service_role";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_repo_alignment_snapshots" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_repo_alignment_snapshots" TO "authenticated";



GRANT ALL ON TABLE "public"."gsvw_runtime_capture_events" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_runtime_capture_events" TO "authenticated";
GRANT INSERT,DELETE,UPDATE ON TABLE "public"."gsvw_runtime_capture_events" TO "anon";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_cognition_profiles" TO "anon";
GRANT ALL ON TABLE "public"."human_cognition_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."human_cognition_profiles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_consciousness_profiles" TO "anon";
GRANT ALL ON TABLE "public"."human_consciousness_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."human_consciousness_profiles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_context_views" TO "anon";
GRANT ALL ON TABLE "public"."human_context_views" TO "authenticated";
GRANT ALL ON TABLE "public"."human_context_views" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_continuity_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."human_continuity_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."human_continuity_snapshots" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_identity_evidence" TO "anon";
GRANT ALL ON TABLE "public"."human_identity_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."human_identity_evidence" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_identity_mutations" TO "anon";
GRANT ALL ON TABLE "public"."human_identity_mutations" TO "authenticated";
GRANT ALL ON TABLE "public"."human_identity_mutations" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_identity_profiles" TO "anon";
GRANT ALL ON TABLE "public"."human_identity_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."human_identity_profiles" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_identity_review_events" TO "anon";
GRANT ALL ON TABLE "public"."human_identity_review_events" TO "authenticated";
GRANT ALL ON TABLE "public"."human_identity_review_events" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."human_identity_rollback_events" TO "anon";
GRANT ALL ON TABLE "public"."human_identity_rollback_events" TO "authenticated";
GRANT ALL ON TABLE "public"."human_identity_rollback_events" TO "service_role";



GRANT ALL ON TABLE "public"."human_memory_records" TO "anon";
GRANT ALL ON TABLE "public"."human_memory_records" TO "authenticated";
GRANT ALL ON TABLE "public"."human_memory_records" TO "service_role";



GRANT ALL ON TABLE "public"."human_personality_profiles" TO "anon";
GRANT ALL ON TABLE "public"."human_personality_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."human_personality_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."human_relationship_edges" TO "anon";
GRANT ALL ON TABLE "public"."human_relationship_edges" TO "authenticated";
GRANT ALL ON TABLE "public"."human_relationship_edges" TO "service_role";



GRANT ALL ON TABLE "public"."identity_contradictions" TO "anon";
GRANT ALL ON TABLE "public"."identity_contradictions" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_contradictions" TO "service_role";



GRANT ALL ON TABLE "public"."identity_evidence" TO "anon";
GRANT ALL ON TABLE "public"."identity_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_evidence" TO "service_role";



GRANT ALL ON TABLE "public"."identity_evidence_links" TO "anon";
GRANT ALL ON TABLE "public"."identity_evidence_links" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_evidence_links" TO "service_role";



GRANT ALL ON TABLE "public"."identity_mutation_proposals" TO "anon";
GRANT ALL ON TABLE "public"."identity_mutation_proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_mutation_proposals" TO "service_role";



GRANT ALL ON TABLE "public"."identity_review_events" TO "anon";
GRANT ALL ON TABLE "public"."identity_review_events" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_review_events" TO "service_role";



GRANT ALL ON TABLE "public"."identity_rollback_events" TO "anon";
GRANT ALL ON TABLE "public"."identity_rollback_events" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_rollback_events" TO "service_role";



GRANT ALL ON TABLE "public"."identity_subjects" TO "anon";
GRANT ALL ON TABLE "public"."identity_subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."identity_subjects" TO "service_role";



GRANT ALL ON TABLE "public"."ingestion_safety_events" TO "anon";
GRANT ALL ON TABLE "public"."ingestion_safety_events" TO "authenticated";
GRANT ALL ON TABLE "public"."ingestion_safety_events" TO "service_role";



GRANT ALL ON TABLE "public"."inner_world_artifacts" TO "anon";
GRANT ALL ON TABLE "public"."inner_world_artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."inner_world_artifacts" TO "service_role";



GRANT ALL ON TABLE "public"."insights" TO "anon";
GRANT ALL ON TABLE "public"."insights" TO "authenticated";
GRANT ALL ON TABLE "public"."insights" TO "service_role";



GRANT ALL ON TABLE "public"."journals" TO "anon";
GRANT ALL ON TABLE "public"."journals" TO "authenticated";
GRANT ALL ON TABLE "public"."journals" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_asset_chunks" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_asset_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_asset_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_asset_tags" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_asset_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_asset_tags" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_fragments" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_fragments" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_fragments" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_interpretations" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_interpretations" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_interpretations" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_stats" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_stats" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_tags" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_tags" TO "service_role";



GRANT ALL ON TABLE "public"."life_threads" TO "anon";
GRANT ALL ON TABLE "public"."life_threads" TO "authenticated";
GRANT ALL ON TABLE "public"."life_threads" TO "service_role";



GRANT ALL ON TABLE "public"."loom_annotations" TO "anon";
GRANT ALL ON TABLE "public"."loom_annotations" TO "authenticated";
GRANT ALL ON TABLE "public"."loom_annotations" TO "service_role";



GRANT ALL ON TABLE "public"."manifest_file_pull" TO "anon";
GRANT ALL ON TABLE "public"."manifest_file_pull" TO "authenticated";
GRANT ALL ON TABLE "public"."manifest_file_pull" TO "service_role";



GRANT ALL ON TABLE "public"."memory_entries" TO "anon";
GRANT ALL ON TABLE "public"."memory_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."memory_entries" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."migration_user_map" TO "anon";
GRANT ALL ON TABLE "public"."migration_user_map" TO "authenticated";
GRANT ALL ON TABLE "public"."migration_user_map" TO "service_role";



GRANT ALL ON TABLE "public"."model_home_assignments" TO "anon";
GRANT ALL ON TABLE "public"."model_home_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."model_home_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."model_home_capabilities" TO "anon";
GRANT ALL ON TABLE "public"."model_home_capabilities" TO "authenticated";
GRANT ALL ON TABLE "public"."model_home_capabilities" TO "service_role";



GRANT ALL ON TABLE "public"."model_home_consent_grants" TO "anon";
GRANT ALL ON TABLE "public"."model_home_consent_grants" TO "authenticated";
GRANT ALL ON TABLE "public"."model_home_consent_grants" TO "service_role";



GRANT ALL ON TABLE "public"."model_home_evaluations" TO "anon";
GRANT ALL ON TABLE "public"."model_home_evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."model_home_evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."model_home_events" TO "anon";
GRANT ALL ON TABLE "public"."model_home_events" TO "authenticated";
GRANT ALL ON TABLE "public"."model_home_events" TO "service_role";



GRANT ALL ON TABLE "public"."model_homes" TO "anon";
GRANT ALL ON TABLE "public"."model_homes" TO "authenticated";
GRANT ALL ON TABLE "public"."model_homes" TO "service_role";



GRANT ALL ON TABLE "public"."model_providers" TO "anon";
GRANT ALL ON TABLE "public"."model_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."model_providers" TO "service_role";



GRANT ALL ON TABLE "public"."models" TO "anon";
GRANT ALL ON TABLE "public"."models" TO "authenticated";
GRANT ALL ON TABLE "public"."models" TO "service_role";



GRANT ALL ON TABLE "public"."musical_dna_analyses" TO "anon";
GRANT ALL ON TABLE "public"."musical_dna_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."musical_dna_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."operation_render_audits" TO "anon";
GRANT ALL ON TABLE "public"."operation_render_audits" TO "authenticated";
GRANT ALL ON TABLE "public"."operation_render_audits" TO "service_role";



GRANT ALL ON TABLE "public"."ops_workbook_items" TO "anon";
GRANT ALL ON TABLE "public"."ops_workbook_items" TO "authenticated";
GRANT ALL ON TABLE "public"."ops_workbook_items" TO "service_role";



GRANT ALL ON TABLE "public"."ops_workbook_sync_runs" TO "anon";
GRANT ALL ON TABLE "public"."ops_workbook_sync_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."ops_workbook_sync_runs" TO "service_role";



GRANT ALL ON TABLE "public"."orchestration_decisions" TO "anon";
GRANT ALL ON TABLE "public"."orchestration_decisions" TO "authenticated";
GRANT ALL ON TABLE "public"."orchestration_decisions" TO "service_role";



GRANT ALL ON TABLE "public"."order_notes" TO "anon";
GRANT ALL ON TABLE "public"."order_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."order_notes" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."pending_embodiment_mutations" TO "anon";
GRANT ALL ON TABLE "public"."pending_embodiment_mutations" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_embodiment_mutations" TO "service_role";



GRANT ALL ON TABLE "public"."pending_identity_reviews" TO "anon";
GRANT ALL ON TABLE "public"."pending_identity_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_identity_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."portrait_dimensions" TO "anon";
GRANT ALL ON TABLE "public"."portrait_dimensions" TO "authenticated";
GRANT ALL ON TABLE "public"."portrait_dimensions" TO "service_role";



GRANT ALL ON TABLE "public"."portrait_inference_queue" TO "anon";
GRANT ALL ON TABLE "public"."portrait_inference_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."portrait_inference_queue" TO "service_role";



GRANT ALL ON TABLE "public"."portrait_inference_runs" TO "anon";
GRANT ALL ON TABLE "public"."portrait_inference_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."portrait_inference_runs" TO "service_role";



GRANT ALL ON TABLE "public"."portrait_render_events" TO "anon";
GRANT ALL ON TABLE "public"."portrait_render_events" TO "authenticated";
GRANT ALL ON TABLE "public"."portrait_render_events" TO "service_role";



GRANT ALL ON TABLE "public"."processing_runs" TO "anon";
GRANT ALL ON TABLE "public"."processing_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."processing_runs" TO "service_role";



GRANT ALL ON TABLE "public"."profile_ingestion_sources" TO "anon";
GRANT ALL ON TABLE "public"."profile_ingestion_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_ingestion_sources" TO "service_role";



GRANT ALL ON TABLE "public"."profile_portraits" TO "anon";
GRANT ALL ON TABLE "public"."profile_portraits" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_portraits" TO "service_role";



GRANT ALL ON TABLE "public"."provenance_links" TO "anon";
GRANT ALL ON TABLE "public"."provenance_links" TO "authenticated";
GRANT ALL ON TABLE "public"."provenance_links" TO "service_role";



GRANT ALL ON TABLE "public"."reasoning_sessions" TO "anon";
GRANT ALL ON TABLE "public"."reasoning_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."reasoning_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."releasable_bucket_drops" TO "anon";
GRANT ALL ON TABLE "public"."releasable_bucket_drops" TO "authenticated";
GRANT ALL ON TABLE "public"."releasable_bucket_drops" TO "service_role";



GRANT ALL ON TABLE "public"."render_artifacts" TO "anon";
GRANT ALL ON TABLE "public"."render_artifacts" TO "authenticated";
GRANT ALL ON TABLE "public"."render_artifacts" TO "service_role";



GRANT ALL ON TABLE "public"."render_jobs" TO "anon";
GRANT ALL ON TABLE "public"."render_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."render_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."rich_life_threads" TO "anon";
GRANT ALL ON TABLE "public"."rich_life_threads" TO "authenticated";
GRANT ALL ON TABLE "public"."rich_life_threads" TO "service_role";



GRANT ALL ON TABLE "public"."scenario_sets" TO "anon";
GRANT ALL ON TABLE "public"."scenario_sets" TO "authenticated";
GRANT ALL ON TABLE "public"."scenario_sets" TO "service_role";



GRANT ALL ON TABLE "public"."scenarios" TO "anon";
GRANT ALL ON TABLE "public"."scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."scrapbook_items" TO "anon";
GRANT ALL ON TABLE "public"."scrapbook_items" TO "authenticated";
GRANT ALL ON TABLE "public"."scrapbook_items" TO "service_role";



GRANT ALL ON TABLE "public"."session_rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."session_rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."session_rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."skill_fragments" TO "anon";
GRANT ALL ON TABLE "public"."skill_fragments" TO "authenticated";
GRANT ALL ON TABLE "public"."skill_fragments" TO "service_role";



GRANT ALL ON TABLE "public"."skill_stats" TO "anon";
GRANT ALL ON TABLE "public"."skill_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."skill_stats" TO "service_role";



GRANT ALL ON TABLE "public"."skills" TO "anon";
GRANT ALL ON TABLE "public"."skills" TO "authenticated";
GRANT ALL ON TABLE "public"."skills" TO "service_role";



GRANT ALL ON TABLE "public"."songbook_tracks" TO "anon";
GRANT ALL ON TABLE "public"."songbook_tracks" TO "authenticated";
GRANT ALL ON TABLE "public"."songbook_tracks" TO "service_role";



GRANT ALL ON TABLE "public"."songbooks" TO "anon";
GRANT ALL ON TABLE "public"."songbooks" TO "authenticated";
GRANT ALL ON TABLE "public"."songbooks" TO "service_role";



GRANT ALL ON TABLE "public"."songbook_contents" TO "anon";
GRANT ALL ON TABLE "public"."songbook_contents" TO "authenticated";
GRANT ALL ON TABLE "public"."songbook_contents" TO "service_role";



GRANT ALL ON TABLE "public"."summaries" TO "anon";
GRANT ALL ON TABLE "public"."summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."summaries" TO "service_role";



GRANT ALL ON TABLE "public"."thread_media_items" TO "anon";
GRANT ALL ON TABLE "public"."thread_media_items" TO "authenticated";
GRANT ALL ON TABLE "public"."thread_media_items" TO "service_role";



GRANT ALL ON TABLE "public"."thread_memory_anchors" TO "anon";
GRANT ALL ON TABLE "public"."thread_memory_anchors" TO "authenticated";
GRANT ALL ON TABLE "public"."thread_memory_anchors" TO "service_role";



GRANT ALL ON TABLE "public"."tool_call_audit" TO "anon";
GRANT ALL ON TABLE "public"."tool_call_audit" TO "authenticated";
GRANT ALL ON TABLE "public"."tool_call_audit" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_connectors" TO "anon";
GRANT ALL ON TABLE "public"."trainer_connectors" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_connectors" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_experiment_sources" TO "anon";
GRANT ALL ON TABLE "public"."trainer_experiment_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_experiment_sources" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_experiments" TO "anon";
GRANT ALL ON TABLE "public"."trainer_experiments" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_experiments" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_job_events" TO "anon";
GRANT ALL ON TABLE "public"."trainer_job_events" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_job_events" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_jobs" TO "anon";
GRANT ALL ON TABLE "public"."trainer_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_memory_bindings" TO "anon";
GRANT ALL ON TABLE "public"."trainer_memory_bindings" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_memory_bindings" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_memory_surfaces" TO "anon";
GRANT ALL ON TABLE "public"."trainer_memory_surfaces" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_memory_surfaces" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_packaging_candidates" TO "anon";
GRANT ALL ON TABLE "public"."trainer_packaging_candidates" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_packaging_candidates" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_policy_flags" TO "anon";
GRANT ALL ON TABLE "public"."trainer_policy_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_policy_flags" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_workers" TO "anon";
GRANT ALL ON TABLE "public"."trainer_workers" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_workers" TO "service_role";



GRANT ALL ON TABLE "public"."training_runs" TO "anon";
GRANT ALL ON TABLE "public"."training_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."training_runs" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_queue_health_v" TO "anon";
GRANT ALL ON TABLE "public"."trainer_queue_health_v" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_queue_health_v" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_review_decisions" TO "anon";
GRANT ALL ON TABLE "public"."trainer_review_decisions" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_review_decisions" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_run_summary" TO "anon";
GRANT ALL ON TABLE "public"."trainer_run_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_run_summary" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_skills" TO "anon";
GRANT ALL ON TABLE "public"."trainer_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_skills" TO "service_role";



GRANT ALL ON TABLE "public"."training_steps" TO "anon";
GRANT ALL ON TABLE "public"."training_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."training_steps" TO "service_role";



GRANT ALL ON TABLE "public"."transcriptory_captures" TO "anon";
GRANT ALL ON TABLE "public"."transcriptory_captures" TO "authenticated";
GRANT ALL ON TABLE "public"."transcriptory_captures" TO "service_role";



GRANT ALL ON TABLE "public"."transcriptory_sessions" TO "anon";
GRANT ALL ON TABLE "public"."transcriptory_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."transcriptory_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."transcriptory_sources" TO "anon";
GRANT ALL ON TABLE "public"."transcriptory_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."transcriptory_sources" TO "service_role";



GRANT ALL ON TABLE "public"."transcripts" TO "anon";
GRANT ALL ON TABLE "public"."transcripts" TO "authenticated";
GRANT ALL ON TABLE "public"."transcripts" TO "service_role";



GRANT ALL ON TABLE "public"."tribunal_events" TO "anon";
GRANT ALL ON TABLE "public"."tribunal_events" TO "authenticated";
GRANT ALL ON TABLE "public"."tribunal_events" TO "service_role";



GRANT ALL ON TABLE "public"."tribunal_evidence" TO "anon";
GRANT ALL ON TABLE "public"."tribunal_evidence" TO "authenticated";
GRANT ALL ON TABLE "public"."tribunal_evidence" TO "service_role";



GRANT ALL ON TABLE "public"."tribunal_sessions" TO "anon";
GRANT ALL ON TABLE "public"."tribunal_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."tribunal_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."uploads" TO "anon";
GRANT ALL ON TABLE "public"."uploads" TO "authenticated";
GRANT ALL ON TABLE "public"."uploads" TO "service_role";



GRANT ALL ON TABLE "public"."user_files" TO "anon";
GRANT ALL ON TABLE "public"."user_files" TO "authenticated";
GRANT ALL ON TABLE "public"."user_files" TO "service_role";



GRANT ALL ON TABLE "public"."user_personality_dimensions" TO "anon";
GRANT ALL ON TABLE "public"."user_personality_dimensions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_personality_dimensions" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_profile_ingestion_runs" TO "anon";
GRANT ALL ON TABLE "public"."user_profile_ingestion_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profile_ingestion_runs" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."visible_reasoning_cards" TO "anon";
GRANT ALL ON TABLE "public"."visible_reasoning_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."visible_reasoning_cards" TO "service_role";



GRANT ALL ON TABLE "public"."voice_humor_patterns" TO "anon";
GRANT ALL ON TABLE "public"."voice_humor_patterns" TO "authenticated";
GRANT ALL ON TABLE "public"."voice_humor_patterns" TO "service_role";



GRANT ALL ON TABLE "public"."voice_prints" TO "anon";
GRANT ALL ON TABLE "public"."voice_prints" TO "authenticated";
GRANT ALL ON TABLE "public"."voice_prints" TO "service_role";



GRANT ALL ON TABLE "public"."voice_profiles" TO "anon";
GRANT ALL ON TABLE "public"."voice_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."voice_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."voice_session_audit" TO "anon";
GRANT ALL ON TABLE "public"."voice_session_audit" TO "authenticated";
GRANT ALL ON TABLE "public"."voice_session_audit" TO "service_role";



GRANT ALL ON TABLE "public"."voice_signature_phrases" TO "anon";
GRANT ALL ON TABLE "public"."voice_signature_phrases" TO "authenticated";
GRANT ALL ON TABLE "public"."voice_signature_phrases" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_documents" TO "anon";
GRANT ALL ON TABLE "public"."workspace_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_documents" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_rooms" TO "anon";
GRANT ALL ON TABLE "public"."workspace_rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_rooms" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































