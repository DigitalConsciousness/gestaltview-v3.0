create extension if not exists pg_trgm with schema extensions;

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
  with ranked as (
    select
      kf.source_file,
      kf.document_type,
      kf.id as fragment_id,
      left(regexp_replace(coalesce(kf.content, ''), '\s+', ' ', 'g'), 600) as excerpt,
      coalesce(similarity(lower(kf.content), lower(query_text)), 0)::numeric as semantic_score,
      ts_rank(
        to_tsvector('english', coalesce(kf.content, '')),
        plainto_tsquery('english', query_text)
      )::numeric as keyword_score,
      (
        0.55 * coalesce(similarity(lower(kf.content), lower(query_text)), 0)
        + 0.20 * ts_rank(
          to_tsvector('english', coalesce(kf.content, '')),
          plainto_tsquery('english', query_text)
        )
        + 0.15 * case
          when lower(kf.document_type) in ('billy', 'plk', 'manifestindex') then 1
          when lower(kf.document_type) in ('architecture', 'documentation', 'product', 'api', 'diligence') then 0.7
          else 0.4
        end
        + 0.10 * case
          when lower(kf.source_file) like '%' || lower(query_text) || '%' then 1
          when lower(kf.source_file) like '%billy%' and lower(query_text) like '%billy%' then 0.8
          when lower(kf.source_file) like '%plk%' and lower(query_text) like '%plk%' then 0.8
          else 0.3
        end
      )::numeric as final_score,
      kf.tags
    from public.knowledge_fragments kf
    where
      query_text is not null
      and length(trim(query_text)) > 0
      and (
        to_tsvector('english', coalesce(kf.content, '')) @@ plainto_tsquery('english', query_text)
        or similarity(lower(kf.content), lower(query_text)) > 0.05
      )
  )
  select
    source_file,
    document_type,
    fragment_id,
    excerpt,
    semantic_score,
    keyword_score,
    final_score,
    tags
  from ranked
  order by final_score desc, keyword_score desc, semantic_score desc
  limit greatest(coalesce(limit_count, 24), 1);
$$;
