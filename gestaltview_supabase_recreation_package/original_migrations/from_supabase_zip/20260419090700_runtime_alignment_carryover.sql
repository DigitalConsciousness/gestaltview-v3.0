-- GestaltView runtime alignment carryover
-- Reviewed: 2026-04-19
--
-- Purpose:
-- - Preserve corpus-side ingestion safety audit metadata.
-- - Provide the trainer text-search RPC expected by runtime study-source code.
-- - Refresh PostgREST schema cache after DDL.

create extension if not exists pg_trgm with schema extensions;

create table if not exists public.ingestion_safety_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  table_name text not null,
  source_file text,
  document_type text,
  reasons text[] not null default '{}'::text[],
  affected_rows integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists ingestion_safety_events_created_at_idx
  on public.ingestion_safety_events (created_at desc);

create index if not exists ingestion_safety_events_source_file_idx
  on public.ingestion_safety_events (source_file);

alter table public.ingestion_safety_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ingestion_safety_events'
      and policyname = 'Service role full access ingestion_safety_events'
  ) then
    create policy "Service role full access ingestion_safety_events"
      on public.ingestion_safety_events
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

create or replace function public.trainer_search_study_sources(
  query_text text,
  limit_count integer default 24
)
returns table (
  source_file text,
  document_type text,
  fragment_id uuid,
  excerpt text,
  semantic_score numeric,
  keyword_score numeric,
  final_score numeric,
  tags text[]
)
language sql
stable
set search_path = public, extensions
as $$
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

grant execute on function public.trainer_search_study_sources(text, integer)
  to anon, authenticated, service_role;

notify pgrst, 'reload schema';
