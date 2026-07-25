begin;

alter table public.transcriptory_captures
  add column if not exists search_document tsvector;

create or replace function public.transcriptory_captures_search_document_fn()
returns trigger
language plpgsql
as $$
begin
  new.search_document :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.summary, '')), 'A') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.themes, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.transcript_text, coalesce(new.raw_transcript, ''))), 'C');
  return new;
end;
$$;

update public.transcriptory_captures
set search_document =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(summary, '')), 'A') ||
  setweight(to_tsvector('english', array_to_string(coalesce(themes, '{}'), ' ')), 'B') ||
  setweight(to_tsvector('english', coalesce(transcript_text, coalesce(raw_transcript, ''))), 'C');

drop trigger if exists transcriptory_captures_search_document_trigger
  on public.transcriptory_captures;

create trigger transcriptory_captures_search_document_trigger
before insert or update of title, summary, themes, transcript_text, raw_transcript
on public.transcriptory_captures
for each row
execute function public.transcriptory_captures_search_document_fn();

create index if not exists transcriptory_captures_search_document_idx
  on public.transcriptory_captures using gin (search_document);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_transcriptory_sessions_updated_at
  on public.transcriptory_sessions;

create trigger set_transcriptory_sessions_updated_at
before update on public.transcriptory_sessions
for each row execute function public.set_updated_at();

alter table public.transcriptory_sessions enable row level security;
alter table public.transcriptory_sources enable row level security;

drop policy if exists "transcriptory_sessions_select_own" on public.transcriptory_sessions;
create policy "transcriptory_sessions_select_own"
  on public.transcriptory_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "transcriptory_sessions_insert_own" on public.transcriptory_sessions;
create policy "transcriptory_sessions_insert_own"
  on public.transcriptory_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "transcriptory_sessions_update_own" on public.transcriptory_sessions;
create policy "transcriptory_sessions_update_own"
  on public.transcriptory_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transcriptory_sessions_delete_own" on public.transcriptory_sessions;
create policy "transcriptory_sessions_delete_own"
  on public.transcriptory_sessions
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "transcriptory_sources_select_own" on public.transcriptory_sources;
create policy "transcriptory_sources_select_own"
  on public.transcriptory_sources
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "transcriptory_sources_insert_own" on public.transcriptory_sources;
create policy "transcriptory_sources_insert_own"
  on public.transcriptory_sources
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "transcriptory_sources_update_own" on public.transcriptory_sources;
create policy "transcriptory_sources_update_own"
  on public.transcriptory_sources
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transcriptory_sources_delete_own" on public.transcriptory_sources;
create policy "transcriptory_sources_delete_own"
  on public.transcriptory_sources
  for delete
  to authenticated
  using (auth.uid() = user_id);

commit;
