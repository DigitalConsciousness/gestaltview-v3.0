-- Source: supabase_schema.zip/supabase/migrations/20260311162044_new-migration.sql
-- Canonicalized filename: 20260311162044_new-migration.sql

-- GestaltView v2 — Manifest Index Layer + API persistence schema
-- © 2026 Keith Soyka / GestaltView

create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists app_users (
  id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists consciousness_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bucket_drops (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  content text not null,
  raw_text text,
  capture_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists musical_dna_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  song_title text not null,
  artist text not null,
  analysis text,
  empowerment_score numeric(5,4),
  created_at timestamptz not null default now()
);

create table if not exists tribunal_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  question text not null,
  participants text[] not null default '{}'::text[],
  provider text,
  response text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists billy_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  message text not null,
  response text,
  provider text,
  mode text not null default 'chat',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists processing_runs (
  run_id uuid primary key,
  tenant_id uuid not null,
  status text not null default 'running',
  model text,
  corpus_root text,
  documents_count int not null default 0,
  chunks_count int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  document_id uuid primary key,
  run_id uuid not null references processing_runs(run_id) on delete cascade,
  tenant_id uuid not null,
  path text not null,
  filename text not null,
  hash text not null unique,
  chunk_index int not null,
  total_chunks int not null,
  file_size_bytes int,
  content text not null,
  mime_type text,
  extracted_metadata jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(document_id) on delete cascade,
  model text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_fragments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  content_hash text unique,
  embedding vector(1536),
  source_file text not null,
  document_type text not null default 'General',
  chunk_index integer not null default 0,
  total_chunks integer not null default 1,
  char_count integer,
  tags text[] default '{}'::text[],
  created_at timestamptz default now()
);

create index if not exists bucket_drops_user_created_idx on bucket_drops (user_id, created_at desc);
create index if not exists musical_dna_user_created_idx on musical_dna_analyses (user_id, created_at desc);
create index if not exists tribunal_user_created_idx on tribunal_sessions (user_id, created_at desc);
create index if not exists billy_sessions_user_created_idx on billy_sessions (user_id, created_at desc);

create index if not exists documents_tenant_path_idx on documents (tenant_id, path);
create index if not exists documents_hash_idx on documents (hash);
create index if not exists embeddings_document_idx on embeddings (document_id);
create index if not exists embeddings_hnsw_idx on embeddings using hnsw (embedding vector_cosine_ops);

create index if not exists knowledge_fragments_content_fts on knowledge_fragments using gin (to_tsvector('english', content));
create index if not exists knowledge_fragments_doc_type_idx on knowledge_fragments (document_type);
create index if not exists knowledge_fragments_tags_idx on knowledge_fragments using gin (tags);
create index if not exists knowledge_fragments_embedding_idx on knowledge_fragments using hnsw (embedding vector_cosine_ops) with (m = 16, ef_construction = 64);

create or replace function match_knowledge_fragments(
  query_embedding vector(1536),
  match_count int default 8,
  filter_type text default null
)
returns table (
  id uuid,
  content text,
  source_file text,
  document_type text,
  chunk_index int,
  tags text[],
  similarity float
)
language sql stable
as $$
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
  order by kf.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function search_knowledge_fragments(
  query_text text,
  match_count int default 8,
  filter_type text default null
)
returns table (
  id uuid,
  content text,
  source_file text,
  document_type text,
  chunk_index int,
  tags text[],
  rank float
)
language sql stable
as $$
  select
    kf.id,
    kf.content,
    kf.source_file,
    kf.document_type,
    kf.chunk_index,
    kf.tags,
    ts_rank(to_tsvector('english', kf.content), plainto_tsquery('english', query_text)) as rank
  from knowledge_fragments kf
  where to_tsvector('english', kf.content) @@ plainto_tsquery('english', query_text)
    and (filter_type is null or kf.document_type = filter_type)
  order by rank desc
  limit match_count;
$$;

create or replace function matchknowledgefragments(
  queryembedding vector(1536),
  matchcount int default 8,
  filtertype text default null
)
returns table (
  content text,
  sourcefile text,
  similarity float,
  chunkindex int,
  documenttype text,
  tags text
)
language sql stable
as $$
  select
    m.content,
    m.source_file as sourcefile,
    m.similarity,
    m.chunk_index as chunkindex,
    m.document_type as documenttype,
    array_to_string(m.tags, ',') as tags
  from match_knowledge_fragments(queryembedding, matchcount, filtertype) m;
$$;

create or replace function searchknowledgefragments(
  querytext text,
  matchcount int default 8,
  filtertype text default null
)
returns table (
  content text,
  sourcefile text,
  rank float,
  chunkindex int,
  documenttype text,
  tags text
)
language sql stable
as $$
  select
    s.content,
    s.source_file as sourcefile,
    s.rank,
    s.chunk_index as chunkindex,
    s.document_type as documenttype,
    array_to_string(s.tags, ',') as tags
  from search_knowledge_fragments(querytext, matchcount, filtertype) s;
$$;

create or replace view knowledge_stats as
select
  document_type,
  count(*) as fragment_count,
  sum(char_count) as total_chars,
  count(distinct source_file) as file_count,
  max(created_at) as last_updated
from knowledge_fragments
group by document_type
order by fragment_count desc;

alter table app_users enable row level security;
alter table consciousness_profiles enable row level security;
alter table bucket_drops enable row level security;
alter table musical_dna_analyses enable row level security;
alter table tribunal_sessions enable row level security;
alter table billy_sessions enable row level security;
alter table processing_runs enable row level security;
alter table documents enable row level security;
alter table embeddings enable row level security;
alter table knowledge_fragments enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'knowledge_fragments' and policyname = 'Public read knowledge fragments') then
    create policy "Public read knowledge fragments" on knowledge_fragments for select to anon, authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'documents' and policyname = 'Service role full access documents') then
    create policy "Service role full access documents" on documents for all to service_role using (true) with check (true);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'embeddings' and policyname = 'Service role full access embeddings') then
    create policy "Service role full access embeddings" on embeddings for all to service_role using (true) with check (true);
  end if;
end $$;

-- Ensure guest user exists for API defaults.
insert into app_users(id) values ('guest-user') on conflict (id) do nothing;
