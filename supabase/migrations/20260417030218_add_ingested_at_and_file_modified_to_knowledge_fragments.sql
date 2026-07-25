-- Source: live schema reconciliation
-- Purpose: add the ingestion metadata columns that exist in the live
-- knowledge_fragments table but were missing from the tracked migration spine.

alter table if exists public.knowledge_fragments
  add column if not exists ingested_at timestamp with time zone default now(),
  add column if not exists file_last_modified timestamp with time zone;

