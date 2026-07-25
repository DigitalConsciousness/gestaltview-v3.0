-- GestaltView v2 — Persistent memory knowledge base for Billy
-- Creates a curated memory table plus retrieval RPCs.

create extension if not exists vector;
create extension if not exists pg_trgm;

create table if not exists memory_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  scope         text not null default 'personal'
                check (scope = any(array['personal','session','shared'])),
  kind          text not null default 'note'
                check (kind = any(array[
                  'identity','preference','goal','project',
                  'relationship','constraint','insight','note'
                ])),
  title         text,
  summary       text,
  content       text not null,
  content_hash  text not null,
  embedding     vector(768),
  source        text not null default 'manual',
  source_ref    text,
  tags          text[] not null default '{}'::text[],
  metadata      jsonb not null default '{}'::jsonb,
  importance    smallint not null default 3
                check (importance between 1 and 5),
  pinned        boolean not null default false,
  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, content_hash)
);

create index if not exists memory_entries_user_id_idx
  on memory_entries (user_id, updated_at desc);

create index if not exists memory_entries_scope_idx
  on memory_entries (scope);

create index if not exists memory_entries_kind_idx
  on memory_entries (kind);

create index if not exists memory_entries_pinned_idx
  on memory_entries (user_id, pinned desc, importance desc, updated_at desc);

create index if not exists memory_entries_embedding_idx
  on memory_entries
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists memory_entries_tags_idx
  on memory_entries using gin (tags);

create index if not exists memory_entries_content_fts_idx
  on memory_entries
  using gin (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || content
    )
  );

alter table memory_entries enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'memory_entries'
      and policyname = 'service_role_all_memory_entries'
  ) then
    create policy "service_role_all_memory_entries"
      on public.memory_entries
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

create or replace function match_memory_entries(
  query_embedding  vector(768),
  match_count      integer  default 4,
  filter_user_id   text     default null,
  filter_scope     text     default null,
  filter_kind      text     default null
)
returns table (
  id          uuid,
  title       text,
  summary     text,
  content     text,
  kind        text,
  scope       text,
  importance  smallint,
  pinned      boolean,
  tags        text[],
  similarity  double precision
)
language sql
stable
set search_path to 'public', 'extensions'
as $$
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

create or replace function search_memory_entries(
  query_text       text,
  match_count      integer  default 4,
  filter_user_id   text     default null,
  filter_scope     text     default null,
  filter_kind      text     default null
)
returns table (
  id          uuid,
  title       text,
  summary     text,
  content     text,
  kind        text,
  scope       text,
  importance  smallint,
  pinned      boolean,
  tags        text[],
  rank        double precision
)
language sql
stable
set search_path to 'public', 'extensions'
as $$
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
