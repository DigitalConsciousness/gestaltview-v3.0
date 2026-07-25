-- Transcriptory audio storage bucket and user-scoped object policies.

do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values ('transcriptory_audio_files', 'transcriptory_audio_files', false)
    on conflict (id) do nothing;
  end if;
end
$$;

do $$
begin
  if to_regclass('storage.objects') is not null then
    drop policy if exists "Users can read own transcriptory audio"
      on storage.objects;
    create policy "Users can read own transcriptory audio"
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'transcriptory_audio_files'
        and auth.uid()::text = (storage.foldername(name))[1]
      );

    drop policy if exists "Users can upload own transcriptory audio"
      on storage.objects;
    create policy "Users can upload own transcriptory audio"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'transcriptory_audio_files'
        and auth.uid()::text = (storage.foldername(name))[1]
      );

    drop policy if exists "Users can update own transcriptory audio"
      on storage.objects;
    create policy "Users can update own transcriptory audio"
      on storage.objects
      for update
      to authenticated
      using (
        bucket_id = 'transcriptory_audio_files'
        and auth.uid()::text = (storage.foldername(name))[1]
      )
      with check (
        bucket_id = 'transcriptory_audio_files'
        and auth.uid()::text = (storage.foldername(name))[1]
      );

    drop policy if exists "Users can delete own transcriptory audio"
      on storage.objects;
    create policy "Users can delete own transcriptory audio"
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'transcriptory_audio_files'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end
$$;
