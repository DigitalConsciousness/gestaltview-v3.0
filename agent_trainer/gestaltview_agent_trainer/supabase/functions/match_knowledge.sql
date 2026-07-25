create or replace function public.match_knowledge(
  query_embedding vector(768),
  match_threshold real default 0.2,
  match_count integer default 8,
  requesting_user uuid default null,
  namespace_filter text default null
)
returns table (
  id uuid,
  title text,
  content text,
  namespace text,
  metadata jsonb,
  similarity double precision
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
    1 - (kf.embedding <=> query_embedding) as similarity
  from public.knowledge_fragments kf
  where
    kf.deleted_at is null
    and kf.embedding is not null
    and (requesting_user is null or kf.user_id = requesting_user)
    and (namespace_filter is null or kf.namespace = namespace_filter)
    and 1 - (kf.embedding <=> query_embedding) >= match_threshold
  order by kf.embedding <=> query_embedding
  limit greatest(1, least(match_count, 50));
$$;

grant execute on function public.match_knowledge(vector(768), real, integer, uuid, text)
to authenticated, service_role;
