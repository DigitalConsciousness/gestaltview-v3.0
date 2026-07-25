alter table public.profile_ingestion_sources
  drop constraint if exists profile_ingestion_sources_source_type_check;

alter table public.profile_ingestion_sources
  add constraint profile_ingestion_sources_source_type_check
  check (source_type in ('journal', 'transcript', 'resume', 'music_dna', 'profile_upload', 'lived_experience'));

alter table public.inner_world_artifacts
  add column if not exists origin_di_id text;

update public.transcriptory_captures
set
  status = 'pending',
  transcript_status = 'pending',
  error_message = 'Capture was marked processing before the transcriber could claim it. Reset by runtime hotfix; upload can be retried.'
where status = 'processing'
  and processing_started_at is null
  and raw_transcript is null;
