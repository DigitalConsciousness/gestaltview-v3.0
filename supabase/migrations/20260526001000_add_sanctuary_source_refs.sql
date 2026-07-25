-- Source: supabase_schema.zip/supabase/migrations/20260526001000_add_sanctuary_source_refs.sql
-- Canonicalized filename: 20260526001000_add_sanctuary_source_refs.sql

alter table if exists public.journals
  add column if not exists source_ref text;

update public.journals
set source_ref = coalesce(source_ref, 'sanctuary-journal:' || user_id::text)
where source_ref is null;

create unique index if not exists journals_source_ref_key
  on public.journals (source_ref);

alter table if exists public.scrapbook_items
  add column if not exists source_ref text,
  add column if not exists source_file_ref text,
  add column if not exists updated_at timestamptz not null default now();

update public.scrapbook_items
set source_ref = coalesce(source_ref, id::text)
where source_ref is null;

update public.scrapbook_items scrapbook
set source_file_ref = coalesce(scrapbook.source_file_ref, files.source_ref)
from public.user_files files
where scrapbook.file_id = files.id
  and scrapbook.source_file_ref is null;

create unique index if not exists scrapbook_items_source_ref_key
  on public.scrapbook_items (source_ref);

drop trigger if exists trg_scrapbook_items_set_updated_at on public.scrapbook_items;
create trigger trg_scrapbook_items_set_updated_at
before update on public.scrapbook_items
for each row
execute function public.set_user_content_updated_at();
