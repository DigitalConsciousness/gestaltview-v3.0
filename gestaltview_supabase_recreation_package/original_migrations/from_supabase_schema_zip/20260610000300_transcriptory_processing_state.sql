begin;

alter table public.transcriptory_captures
  add column if not exists error_code text,
  add column if not exists error_message text,
  add column if not exists processing_started_at timestamptz,
  add column if not exists processing_completed_at timestamptz;

update public.transcriptory_captures
set status = 'processing'
where status = 'transcribing';

update public.transcriptory_captures
set status = 'failed'
where status = 'error';

alter table public.transcriptory_captures
  drop constraint if exists transcriptory_captures_status_check;

alter table public.transcriptory_captures
  add constraint transcriptory_captures_status_check
  check (status in ('pending', 'processing', 'ready', 'failed', 'archived', 'deleted', 'approved'));

create index if not exists transcriptory_captures_user_status_updated_idx
  on public.transcriptory_captures (user_id, status, updated_at desc);

commit;
