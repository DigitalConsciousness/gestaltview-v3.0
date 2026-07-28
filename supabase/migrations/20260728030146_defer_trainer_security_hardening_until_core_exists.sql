create or replace function public.claim_trainer_job(
  _worker_id text default null,
  _lease_seconds integer default 90
)
returns table (
  job_id uuid,
  run_id uuid,
  status text,
  attempts integer,
  lease_expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.trainer_jobs%rowtype;
begin
  update public.trainer_jobs
  set
    status = 'leased',
    attempts = public.trainer_jobs.attempts + 1,
    lease_expires_at = now() + make_interval(secs => greatest(_lease_seconds, 15)),
    last_error = null
  where public.trainer_jobs.job_id = (
    select tj.job_id
    from public.trainer_jobs tj
    where
      tj.status = 'queued'
      or (
        tj.status = 'leased'
        and tj.lease_expires_at is not null
        and tj.lease_expires_at < now()
      )
    order by tj.created_at
    for update skip locked
    limit 1
  )
  returning * into claimed;

  if not found then
    return;
  end if;

  job_id := claimed.job_id;
  run_id := claimed.run_id;
  status := claimed.status;
  attempts := claimed.attempts;
  lease_expires_at := claimed.lease_expires_at;
  return next;
end;
$$;

revoke all on function public.claim_trainer_job(text, integer) from public;
revoke all on function public.claim_trainer_job(text, integer) from anon;
revoke all on function public.claim_trainer_job(text, integer) from authenticated;
grant execute on function public.claim_trainer_job(text, integer) to service_role;
