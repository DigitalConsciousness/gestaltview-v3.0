-- GestaltView — create the skill corpus tables before vector alignment runs
-- © 2026 Keith Soyka / GestaltView

create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.skills (
  id uuid not null default gen_random_uuid(),
  name text not null unique,
  description text,
  content text not null,
  tags text[] default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_pkey primary key (id)
);

create table if not exists public.skill_fragments (
  id uuid not null default gen_random_uuid(),
  document_id uuid,
  content text not null,
  content_hash text,
  embedding vector(1536),
  source_file text,
  document_type text default 'Skill'::text,
  skill_name text,
  chunk_index integer,
  total_chunks integer,
  char_count integer,
  tags text[] default '{}'::text[],
  created_at timestamptz default now(),
  constraint skill_fragments_pkey primary key (id),
  constraint skill_fragments_document_id_fkey
    foreign key (document_id) references public.documents(document_id)
);

create index if not exists skill_fragments_document_id_idx
  on public.skill_fragments (document_id);

create index if not exists skill_fragments_tags_idx
  on public.skill_fragments using gin (tags);

create index if not exists skills_name_idx
  on public.skills (name);

