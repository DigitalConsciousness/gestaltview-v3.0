-- Source: live schema reconciliation
-- Purpose: align knowledge_fragments with the richer manifest pipeline shape
-- observed in the live Supabase schema snapshots.

alter table if exists public.knowledge_fragments
  add column if not exists document_id uuid,
  add column if not exists source_path text,
  add column if not exists package text,
  add column if not exists run_id uuid,
  add column if not exists doc_created_at timestamp with time zone,
  add column if not exists doc_date_source text;

