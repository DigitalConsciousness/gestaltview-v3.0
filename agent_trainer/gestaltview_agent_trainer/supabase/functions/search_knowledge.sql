create or replace function public.search_knowledge(
  query_text text,
  requesting_user uuid default null,
  namespace_filter text default null,
  limit_count integer default 10
)
returns table (
  id uuid,
  title text,
  content text,
  namespace text,
  metadata jsonb,
  rank real
)
language sql
stable
set search_path to public
as $$
  select
    kf.id,
    kf.title,
    kf.content,
    kf.namespace,
    kf.metadata,
    ts_rank_cd(kf.search_document, websearch_to_tsquery('english', query_text)) as rank
  from public.knowledge_fragments kf
  where
    kf.deleted_at is null
    and (requesting_user is null or kf.user_id = requesting_user)
    and (namespace_filter is null or kf.namespace = namespace_filter)
    and kf.search_document @@ websearch_to_tsquery('english', query_text)
  order by rank desc, kf.created_at desc
  limit greatest(1, least(limit_count, 50));
$$;

grant execute on function public.search_knowledge(text, uuid, text, integer)
to authenticated, service_role;
