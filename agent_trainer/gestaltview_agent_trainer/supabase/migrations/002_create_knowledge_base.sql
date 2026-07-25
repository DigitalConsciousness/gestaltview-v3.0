create table if not exists public.knowledge_fragments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.kit_users(id) on delete cascade,
  namespace text not null default 'knowledge',
  title text not null,
  content text not null,
  source_uri text null,
  source_type text null,
  chunk_index integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768) null,
  search_document tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint knowledge_fragments_namespace_check
    check (namespace in ('knowledge', 'code', 'product', 'context'))
);

create index if not exists knowledge_fragments_user_namespace_idx
  on public.knowledge_fragments(user_id, namespace, created_at desc)
  where deleted_at is null;

create index if not exists knowledge_fragments_source_uri_idx
  on public.knowledge_fragments(source_uri)
  where deleted_at is null and source_uri is not null;

create index if not exists knowledge_fragments_metadata_gin_idx
  on public.knowledge_fragments
  using gin (metadata jsonb_path_ops);

create index if not exists knowledge_fragments_search_document_idx
  on public.knowledge_fragments
  using gin (search_document);

create index if not exists knowledge_fragments_embedding_idx
  on public.knowledge_fragments
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

drop trigger if exists set_knowledge_fragments_updated_at on public.knowledge_fragments;
create trigger set_knowledge_fragments_updated_at
before update on public.knowledge_fragments
for each row execute function public.set_updated_at();
