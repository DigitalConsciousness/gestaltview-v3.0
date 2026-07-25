create or replace function public.gv_record_capture_event(
  p_user_id uuid,
  p_room text,
  p_source_type text,
  p_original_text text,
  p_consent_state jsonb default '{"tier":"private_default"}'::jsonb,
  p_metadata jsonb default '{}'::jsonb
) returns public.capture_events
language plpgsql
security definer
set search_path = public
as $$
declare inserted public.capture_events;
begin
  insert into public.capture_events (user_id, room, source_type, original_text, consent_state, metadata)
  values (p_user_id, p_room, p_source_type, p_original_text, p_consent_state, p_metadata)
  returning * into inserted;
  return inserted;
end;
$$;

create or replace function public.gv_begin_profile_pipeline_run(
  p_user_id uuid,
  p_run_type text,
  p_input_summary jsonb default '{}'::jsonb
) returns public.profile_pipeline_runs
language plpgsql
security definer
set search_path = public
as $$
declare inserted public.profile_pipeline_runs;
begin
  insert into public.profile_pipeline_runs (user_id, run_type, status, input_summary, started_at)
  values (p_user_id, p_run_type, 'running', p_input_summary, now())
  returning * into inserted;
  return inserted;
end;
$$;

create or replace function public.gv_complete_profile_pipeline_run(
  p_run_id uuid,
  p_status text,
  p_output_summary jsonb default '{}'::jsonb,
  p_error_message text default null
) returns public.profile_pipeline_runs
language plpgsql
security definer
set search_path = public
as $$
declare updated public.profile_pipeline_runs;
begin
  update public.profile_pipeline_runs
  set status = p_status,
      output_summary = p_output_summary,
      error_message = p_error_message,
      completed_at = now()
  where run_id = p_run_id
  returning * into updated;
  return updated;
end;
$$;

create or replace function public.gv_link_pipeline_object(
  p_run_id uuid,
  p_object_type text,
  p_object_id text,
  p_link_role text default 'source',
  p_metadata jsonb default '{}'::jsonb
) returns public.profile_pipeline_run_links
language plpgsql
security definer
set search_path = public
as $$
declare inserted public.profile_pipeline_run_links;
begin
  insert into public.profile_pipeline_run_links (run_id, object_type, object_id, link_role, metadata)
  values (p_run_id, p_object_type, p_object_id, p_link_role, p_metadata)
  returning * into inserted;
  return inserted;
end;
$$;

create or replace function public.gv_create_pending_scaffold_node(
  p_user_id uuid,
  p_title text,
  p_body text,
  p_source_capture_ids uuid[] default '{}'::uuid[],
  p_source_artifact_ids uuid[] default '{}'::uuid[],
  p_metadata jsonb default '{}'::jsonb
) returns public.scaffold_nodes
language plpgsql
security definer
set search_path = public
as $$
declare inserted public.scaffold_nodes;
begin
  insert into public.scaffold_nodes (
    user_id, title, body, review_state, source_capture_ids, source_artifact_ids, metadata
  )
  values (
    p_user_id, p_title, p_body, 'pending', p_source_capture_ids, p_source_artifact_ids, p_metadata
  )
  returning * into inserted;
  return inserted;
end;
$$;

create or replace function public.gv_approve_scaffold_node(p_node_id uuid)
returns public.scaffold_nodes
language plpgsql
security definer
set search_path = public
as $$
declare updated public.scaffold_nodes;
begin
  update public.scaffold_nodes
  set review_state = 'approved'
  where node_id = p_node_id
  returning * into updated;
  return updated;
end;
$$;

create or replace function public.gv_create_identity_claim(
  p_user_id uuid,
  p_claim_text text,
  p_evidence_artifact_ids uuid[] default '{}'::uuid[],
  p_evidence_scaffold_node_ids uuid[] default '{}'::uuid[],
  p_metadata jsonb default '{}'::jsonb
) returns public.identity_claims
language plpgsql
security definer
set search_path = public
as $$
declare inserted public.identity_claims;
begin
  insert into public.identity_claims (
    user_id, claim_text, evidence_artifact_ids, evidence_scaffold_node_ids, metadata
  )
  values (
    p_user_id, p_claim_text, p_evidence_artifact_ids, p_evidence_scaffold_node_ids, p_metadata
  )
  returning * into inserted;
  return inserted;
end;
$$;

create or replace function public.gv_attach_provenance_envelope(
  p_subject_type text,
  p_subject_id text,
  p_content_hash text,
  p_source_capture_ids uuid[] default '{}'::uuid[],
  p_source_artifact_ids uuid[] default '{}'::uuid[],
  p_source_scaffold_node_ids uuid[] default '{}'::uuid[],
  p_pipeline_run_id uuid default null,
  p_operations text[] default '{}'::text[],
  p_privacy_class text default 'private',
  p_consent_state jsonb default '{"tier":"private_default"}'::jsonb,
  p_metadata jsonb default '{}'::jsonb
) returns public.provenance_envelopes
language plpgsql
security definer
set search_path = public
as $$
declare inserted public.provenance_envelopes;
begin
  insert into public.provenance_envelopes (
    subject_type,
    subject_id,
    content_hash,
    source_capture_ids,
    source_artifact_ids,
    source_scaffold_node_ids,
    pipeline_run_id,
    operations,
    privacy_class,
    consent_state,
    metadata
  )
  values (
    p_subject_type,
    p_subject_id,
    p_content_hash,
    p_source_capture_ids,
    p_source_artifact_ids,
    p_source_scaffold_node_ids,
    p_pipeline_run_id,
    p_operations,
    p_privacy_class,
    p_consent_state,
    p_metadata
  )
  returning * into inserted;
  return inserted;
end;
$$;

create or replace function public.resolve_route_embodiment_assignment(p_route_path text)
returns public.route_embodiment_assignments
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.route_embodiment_assignments
  where route_path = p_route_path
  limit 1
$$;
