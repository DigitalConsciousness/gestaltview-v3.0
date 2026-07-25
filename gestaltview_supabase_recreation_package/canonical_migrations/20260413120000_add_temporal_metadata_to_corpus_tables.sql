-- Source: supabase_schema.zip/supabase/migrations/20260413120000_add_temporal_metadata_to_corpus_tables.sql
-- Canonicalized filename: 20260413120000_add_temporal_metadata_to_corpus_tables.sql

-- Add temporal metadata columns to the corpus pipeline tables.
-- Safe to re-run.

alter table if exists public.documents
  add column if not exists source_created_at timestamptz null,
  add column if not exists temporal_period text null,
  add column if not exists timeline_folder text null;

alter table if exists public.knowledge_fragments
  add column if not exists source_created_at timestamptz null,
  add column if not exists temporal_period text null,
  add column if not exists timeline_folder text null;

create index if not exists documents_temporal_period_idx
  on public.documents (temporal_period);

create index if not exists documents_source_created_at_idx
  on public.documents (source_created_at);

create index if not exists knowledge_fragments_temporal_period_idx
  on public.knowledge_fragments (temporal_period);

create index if not exists knowledge_fragments_source_created_at_idx
  on public.knowledge_fragments (source_created_at);

comment on column public.documents.source_created_at
  is 'Canonical source timestamp used to place a document in the GestaltView timeline.';

comment on column public.documents.temporal_period
  is 'Canonical temporal bucket for the source document.';

comment on column public.documents.timeline_folder
  is 'Logical timeline folder path associated with the source document.';

comment on column public.knowledge_fragments.source_created_at
  is 'Canonical source timestamp inherited from the parent document.';

comment on column public.knowledge_fragments.temporal_period
  is 'Canonical temporal bucket inherited from the parent document.';

comment on column public.knowledge_fragments.timeline_folder
  is 'Logical timeline folder path inherited from the parent document.';

