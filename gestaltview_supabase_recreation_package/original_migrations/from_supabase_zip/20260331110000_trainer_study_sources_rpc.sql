-- GestaltView v2 — grouped study-source listing for trainer corpus selection.

create or replace function public.trainer_list_knowledge_sources(
  limit_count integer default 18,
  type_filter text[] default null
)
returns table (
  source_file text,
  document_type text,
  fragment_count integer,
  sample_excerpt text
)
language sql
stable
set search_path to 'public'
as $$
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

grant execute on function public.trainer_list_knowledge_sources(integer, text[]) to service_role;
