-- Launch Slice 10: atomic Codex export job claim.
-- Rollback note: drop function public.claim_codex_jobs(integer) if the worker is
-- reverted to direct REST selection.

create or replace function public.claim_codex_jobs(batch_size integer default 5)
returns table (
  id uuid,
  artifact_id uuid,
  format text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  update public.codex_jobs
  set status = 'running',
      updated_at = now()
  where id in (
    select job.id
    from public.codex_jobs job
    where job.status = 'pending'
    order by job.created_at asc
    for update skip locked
    limit greatest(1, least(coalesce(batch_size, 5), 25))
  )
  returning codex_jobs.id,
            codex_jobs.artifact_id,
            codex_jobs.format,
            codex_jobs.created_at;
$$;
