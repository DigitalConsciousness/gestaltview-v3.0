-- Source: supabase_schema.zip/supabase/migrations/20260601000300_profile_pipeline_v1_backfill.sql
-- Canonicalized filename: 20260601000300_profile_pipeline_v1_backfill.sql

create table if not exists public.migration_user_map (
  legacy_user_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.bucket_drops') is not null then
    execute $sql$
      insert into public.capture_events (
        capture_id,
        user_id,
        room,
        source_type,
        original_text,
        normalized_text,
        metadata,
        consent_state,
        preservation_status,
        created_at,
        updated_at
      )
      select
        gen_random_uuid(),
        user_map.user_id,
        'sanctuary',
        'migration',
        coalesce(drops.raw_text, drops.content, ''),
        null,
        jsonb_build_object('legacy_table', 'bucket_drops', 'legacy_id', drops.id::text),
        '{"tier":"private_default","migration":"bucket_drops"}'::jsonb,
        'private',
        coalesce(drops.created_at, now()),
        coalesce(drops.created_at, now())
      from public.bucket_drops drops
      left join public.migration_user_map user_map on user_map.legacy_user_id = drops.user_id::text
      where not exists (
          select 1 from public.capture_events existing
          where existing.metadata->>'legacy_table' = 'bucket_drops'
            and existing.metadata->>'legacy_id' = drops.id::text
        )
        and user_map.user_id is not null
    $sql$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.inner_world_artifacts') is not null then
    execute $sql$
      insert into public.artifacts (
        artifact_id,
        user_id,
        title,
        body,
        artifact_type,
        metadata,
        created_at,
        updated_at
      )
      select
        artifacts_legacy.id,
        artifacts_legacy.user_id,
        artifacts_legacy.title,
        coalesce(artifacts_legacy.html, artifacts_legacy.summary, ''),
        'html',
        jsonb_build_object('legacy_table', 'inner_world_artifacts', 'summary', artifacts_legacy.summary),
        coalesce(artifacts_legacy.created_at, now()),
        coalesce(artifacts_legacy.updated_at, artifacts_legacy.created_at, now())
      from public.inner_world_artifacts artifacts_legacy
      where not exists (
        select 1 from public.artifacts canonical
        where canonical.artifact_id = artifacts_legacy.id
      )
    $sql$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.user_profile_ingestion_runs') is not null then
    execute $sql$
      insert into public.profile_pipeline_runs (
        run_id,
        user_id,
        run_type,
        status,
        input_summary,
        output_summary,
        completed_at,
        created_at
      )
      select
        legacy.run_id,
        legacy.user_id,
        'ingestion',
        case legacy.status
          when 'complete' then 'complete'
          when 'error' then 'failed'
          when 'processing' then 'running'
          else 'pending'
        end,
        legacy.input_sources,
        jsonb_build_object(
          'extracted_attributes', legacy.extracted_attributes,
          'personality_profile', legacy.personality_profile,
          'confidence_scores', legacy.confidence_scores
        ),
        legacy.processed_at,
        legacy.created_at
      from public.user_profile_ingestion_runs legacy
      where not exists (
        select 1 from public.profile_pipeline_runs canonical
        where canonical.run_id = legacy.run_id
      )
        and exists (
          select 1 from auth.users users
          where users.id = legacy.user_id
        )
    $sql$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.user_personality_dimensions') is not null
     and to_regclass('public.user_profile_ingestion_runs') is not null then
    execute $sql$
      insert into public.identity_claims (
        claim_id,
        user_id,
        claim_text,
        review_state,
        metadata,
        created_at,
        updated_at
      )
      select
        dimension.dimension_id,
        run.user_id,
        coalesce(dimension.dimension_label, dimension.dimension_key),
        'proposed',
        jsonb_build_object(
          'legacy_table', 'user_personality_dimensions',
          'dimension_key', dimension.dimension_key,
          'dimension_value', dimension.dimension_value,
          'evidence_fragments', dimension.evidence_fragments,
          'salience', dimension.salience,
          'mutation_class', dimension.mutation_class
        ),
        dimension.created_at,
        dimension.created_at
      from public.user_personality_dimensions dimension
      join public.user_profile_ingestion_runs run on run.run_id = dimension.run_id
      join public.profile_pipeline_runs canonical_run on canonical_run.run_id = run.run_id
      where not exists (
        select 1 from public.identity_claims canonical
        where canonical.claim_id = dimension.dimension_id
      )
    $sql$;
  end if;
end $$;

do $$
begin
  if to_regclass('public.profile_ingestion_sources') is not null then
    execute $sql$
      insert into public.profile_pipeline_run_links (
        link_id,
        run_id,
        object_type,
        object_id,
        link_role,
        metadata,
        created_at
      )
      select
        source.source_link_id,
        source.run_id,
        source.source_type,
        coalesce(source.source_id, source.source_link_id::text),
        'source',
        jsonb_build_object(
          'legacy_table', 'profile_ingestion_sources',
          'source_bucket', source.source_bucket,
          'processing_notes', source.processing_notes
        ),
        source.created_at
      from public.profile_ingestion_sources source
      where not exists (
        select 1 from public.profile_pipeline_run_links canonical
        where canonical.link_id = source.source_link_id
      )
        and exists (
          select 1 from public.profile_pipeline_runs run
          where run.run_id = source.run_id
        )
    $sql$;
  end if;
end $$;
