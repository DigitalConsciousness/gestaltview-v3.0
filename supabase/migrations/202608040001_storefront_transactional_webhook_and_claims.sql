begin;

alter table public.activation_receipts
  add column if not exists claim_token_expires_at timestamptz;

create index if not exists activation_receipts_claim_token_expiry_idx
  on public.activation_receipts (claim_token_expires_at)
  where claim_token_hash is not null;

create table if not exists public.storefront_claim_attempts (
  id bigint generated always as identity primary key,
  bucket_hash text not null check (bucket_hash ~ '^[a-f0-9]{64}$'),
  attempted_at timestamptz not null default clock_timestamp()
);

create index if not exists storefront_claim_attempts_bucket_time_idx
  on public.storefront_claim_attempts (bucket_hash, attempted_at desc);

create index if not exists storefront_claim_attempts_time_idx
  on public.storefront_claim_attempts (attempted_at);

alter table public.storefront_claim_attempts enable row level security;
revoke all on table public.storefront_claim_attempts from public, anon, authenticated;

insert into public.storefront_offers (
  id, manifest_version, handle, family, activation_mode,
  runtime_provisioning_key, review_status, activation_scope, voice_profile
) values (
  '9ec13b9e-5cd1-4315-a116-beb50c0bf23f',
  '1.0.0',
  'project-convergence-sprint',
  'custom_systems_counter',
  'human_handoff',
  null,
  'approved',
  jsonb_build_object(
    'service', 'project_convergence_sprint',
    'price_usd_cents', 49500,
    'delivery_window_business_days', 5,
    'delivery_clock_starts', 'intake_accepted',
    'project_limit', 1,
    'repository_limit', 3,
    'document_limit', 25,
    'clarification_rounds', 1,
    'handoff_minutes', 45,
    'implementation_included', false,
    'custom_build_credit_usd_cents', 49500,
    'custom_build_credit_window_days', 30,
    'source_material_import_requires_consent', true,
    'fulfillment_owner', 'founder',
    'shopify_product_gid', 'gid://shopify/Product/8985408208975',
    'shopify_variant_gid', 'gid://shopify/ProductVariant/46345021718607'
  ),
  'forensic_confidence'
)
on conflict (handle) do update set
  manifest_version = excluded.manifest_version,
  family = excluded.family,
  activation_mode = excluded.activation_mode,
  runtime_provisioning_key = excluded.runtime_provisioning_key,
  review_status = excluded.review_status,
  activation_scope = excluded.activation_scope,
  voice_profile = excluded.voice_profile,
  updated_at = clock_timestamp();

create or replace function public.consume_storefront_claim_attempts(p_bucket_hashes text[])
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
  v_hash text;
begin
  if cardinality(p_bucket_hashes) <> 2
    or (select count(distinct value) from unnest(p_bucket_hashes) as buckets(value)) <> 2
    or exists (
      select 1 from unnest(p_bucket_hashes) as buckets(value)
      where value !~ '^[a-f0-9]{64}$'
    ) then
    return false;
  end if;
  for v_hash in select value from unnest(p_bucket_hashes) as buckets(value) order by value
  loop
    perform pg_advisory_xact_lock(hashtextextended(v_hash, 0));
  end loop;
  delete from public.storefront_claim_attempts
    where attempted_at < clock_timestamp() - interval '24 hours';
  for v_hash in select value from unnest(p_bucket_hashes) as buckets(value) order by value
  loop
    select count(*) into v_count
      from public.storefront_claim_attempts
      where bucket_hash = v_hash
        and attempted_at > clock_timestamp() - interval '15 minutes';
    if v_count >= 5 then
      return false;
    end if;
  end loop;
  insert into public.storefront_claim_attempts (bucket_hash)
    select value from unnest(p_bucket_hashes) as buckets(value);
  return true;
end;
$$;

create or replace function public.storefront_runtime_readiness()
returns jsonb
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select jsonb_build_object(
    'schema_version', '202608040001',
    'offer_ready', exists (
      select 1 from public.storefront_offers
      where handle = 'project-convergence-sprint'
        and manifest_version = '1.0.0'
        and review_status = 'approved'
        and activation_mode = 'human_handoff'
        and (activation_scope->>'price_usd_cents')::integer = 49500
    ),
    'unresolved_sprints', (
      select count(*)::integer from public.activation_requests
      where offer_handle = 'project-convergence-sprint'
        and manifest_version = '1.0.0'
        and status in ('pending_consent', 'ready', 'working', 'partial', 'blocked')
    )
  );
$$;

create or replace function public.issue_storefront_receipt_claim(
  p_receipt_id text,
  p_claim_token_hash text,
  p_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_id text;
begin
  if p_claim_token_hash !~ '^[a-f0-9]{64}$'
    or p_expires_at <= clock_timestamp()
    or p_expires_at > clock_timestamp() + interval '30 minutes 5 seconds' then
    return false;
  end if;
  select id::text into v_id
    from public.activation_receipts
    where id::text = p_receipt_id
    for update;
  if v_id is null then
    return false;
  end if;
  update public.activation_receipts
    set claim_token_hash = p_claim_token_hash,
        claim_token_expires_at = p_expires_at
    where id::text = p_receipt_id
      and (claim_token_hash is null or claim_token_expires_at is null
        or claim_token_expires_at <= clock_timestamp());
  return found;
end;
$$;

create or replace function public.consume_storefront_receipt_claim(p_claim_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_receipt public.activation_receipts%rowtype;
begin
  update public.activation_receipts
    set claim_token_hash = null,
        claim_token_expires_at = null
    where claim_token_hash = p_claim_token_hash
      and claim_token_expires_at > clock_timestamp()
    returning * into v_receipt;
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'state', v_receipt.state,
    'headline', v_receipt.headline,
    'detail', v_receipt.detail,
    'known_facts', v_receipt.known_facts,
    'unknowns', v_receipt.unknowns,
    'input_preserved', v_receipt.input_preserved,
    'next_action_label', v_receipt.next_action_label,
    'next_action_path', v_receipt.next_action_path
  );
end;
$$;

create or replace function public.process_storefront_shopify_event(p_event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_event public.commerce_event_log%rowtype;
  v_order public.commerce_orders%rowtype;
  v_offer public.storefront_offers%rowtype;
  v_activation public.activation_requests%rowtype;
  v_attempt integer;
  v_action text := p_event->>'action';
  v_rows integer;
begin
  if p_event->>'shop_domain' is null
    or p_event->>'external_event_id' is null
    or p_event->>'payload_sha256' !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('status', 'failed', 'error_code', 'invalid_event_command');
  end if;

  insert into public.commerce_event_log (
    shop_domain, external_event_id, topic, payload_sha256, status,
    attempt_count, error_code, error_detail, processed_at, updated_at
  ) values (
    p_event->>'shop_domain', p_event->>'external_event_id', p_event->>'topic',
    p_event->>'payload_sha256', 'processing', 1, null, null, null, v_now
  )
  on conflict (shop_domain, external_event_id) do nothing
  returning * into v_event;

  if not found then
    select * into v_event
      from public.commerce_event_log
      where shop_domain = p_event->>'shop_domain'
        and external_event_id = p_event->>'external_event_id'
      for update;
    if v_event.payload_sha256 <> p_event->>'payload_sha256' then
      return jsonb_build_object('status', 'duplicate_payload_mismatch');
    end if;
    if v_event.status in ('processed', 'ignored') then
      return jsonb_build_object('status', 'duplicate');
    end if;
    if v_event.status = 'processing' and coalesce(v_event.updated_at, v_event.created_at) > v_now - interval '5 minutes' then
      return jsonb_build_object('status', 'in_flight');
    end if;
    if v_event.status not in ('failed', 'processing') then
      return jsonb_build_object('status', 'duplicate');
    end if;
    update public.commerce_event_log
      set status = 'processing',
          attempt_count = v_event.attempt_count + 1,
          error_code = null,
          error_detail = null,
          processed_at = null,
          updated_at = v_now
      where shop_domain = v_event.shop_domain
        and external_event_id = v_event.external_event_id
        and status = v_event.status
        and attempt_count = v_event.attempt_count
        and payload_sha256 = v_event.payload_sha256
      returning * into v_event;
    if not found then
      return jsonb_build_object('status', 'in_flight');
    end if;
  end if;
  v_attempt := v_event.attempt_count;

  begin
    if v_action = 'ignored' then
      update public.commerce_event_log
        set status = 'ignored', error_code = p_event->>'error_code',
            error_detail = null, processed_at = v_now, updated_at = v_now
        where shop_domain = v_event.shop_domain
          and external_event_id = v_event.external_event_id
          and status = 'processing' and attempt_count = v_attempt;
      get diagnostics v_rows = row_count;
      return jsonb_build_object('status', case when v_rows = 1 then 'ignored' else 'stale_worker' end);
    end if;

    if v_action = 'verified_paid' then
      select * into v_offer from public.storefront_offers
        where handle = p_event->>'offer_handle'
          and manifest_version = p_event->>'manifest_version'
          and review_status = 'approved'
          and activation_mode = 'human_handoff'
        limit 1;
      if v_offer.id is null then
        raise exception using errcode = 'P0001', message = 'offer_not_approved';
      end if;

      insert into public.commerce_orders (
        shop_domain, external_order_id, order_name, buyer_email_hash, currency,
        total_amount, financial_status, status, paid_at, cancelled_at, raw_summary
      ) values (
        p_event->>'shop_domain', p_event->>'external_order_id', p_event->>'order_name',
        p_event->>'buyer_email_hash', p_event->>'currency', (p_event->>'total_amount')::numeric,
        p_event->>'financial_status', 'verified_paid', nullif(p_event->>'paid_at','')::timestamptz,
        null, p_event->'raw_summary'
      )
      on conflict (shop_domain, external_order_id) do update set
        order_name = excluded.order_name,
        buyer_email_hash = coalesce(public.commerce_orders.buyer_email_hash, excluded.buyer_email_hash),
        currency = excluded.currency,
        total_amount = excluded.total_amount,
        financial_status = excluded.financial_status,
        status = case when public.commerce_orders.status in ('cancelled','refunded','disputed','partially_refunded')
          then public.commerce_orders.status else 'verified_paid' end,
        paid_at = coalesce(public.commerce_orders.paid_at, excluded.paid_at),
        raw_summary = excluded.raw_summary
      returning * into v_order;

      if v_order.status in ('cancelled','refunded','disputed','partially_refunded') then
        update public.commerce_event_log set status='processed', error_code='terminal_state_preserved',
          error_detail=null, processed_at=v_now, updated_at=v_now
          where shop_domain=v_event.shop_domain and external_event_id=v_event.external_event_id
            and status='processing' and attempt_count=v_attempt;
        get diagnostics v_rows = row_count;
        return jsonb_build_object('status', case when v_rows=1 then 'terminal_preserved' else 'stale_worker' end);
      end if;

      select * into v_activation from public.activation_requests
        where commerce_order_id = v_order.id
          and offer_handle = p_event->>'offer_handle'
          and manifest_version = p_event->>'manifest_version'
        limit 1;
      if v_activation.id is null then
        insert into public.activation_requests (
          commerce_order_id, offer_id, offer_handle, manifest_version, claim_token_hash,
          activation_scope, status, status_detail
        ) values (
          v_order.id, v_offer.id, p_event->>'offer_handle', p_event->>'manifest_version', null,
          p_event->'activation_scope', p_event->>'activation_status', p_event->>'status_detail'
        )
        on conflict (commerce_order_id, offer_handle, claim_token_hash) do nothing
        returning * into v_activation;
        if v_activation.id is null then
          select * into v_activation from public.activation_requests
            where commerce_order_id=v_order.id and offer_handle=p_event->>'offer_handle'
              and claim_token_hash is null limit 1;
        end if;
        insert into public.activation_receipts (
          activation_request_id, claim_token_hash, claim_token_expires_at, state, headline,
          detail, known_facts, unknowns, input_preserved, next_action_label, next_action_path
        ) values (
          v_activation.id, null, null, p_event#>>'{receipt,state}', p_event#>>'{receipt,headline}',
          p_event#>>'{receipt,detail}', p_event#>'{receipt,known_facts}', p_event#>'{receipt,unknowns}',
          coalesce((p_event#>>'{receipt,input_preserved}')::boolean,false),
          p_event#>>'{receipt,next_action_label}', p_event#>>'{receipt,next_action_path}'
        ) on conflict (activation_request_id) do nothing;
      end if;

    elsif v_action in ('cancelled','partially_refunded') then
      select * into v_order from public.commerce_orders
        where shop_domain=p_event->>'shop_domain' and external_order_id=p_event->>'external_order_id'
        for update;
      if v_order.id is null
        or v_order.raw_summary->>'offer_handle' <> p_event->>'offer_handle'
        or v_order.raw_summary->>'manifest_version' <> p_event->>'manifest_version' then
        update public.commerce_event_log set status='ignored', error_code='stored_offer_mapping_mismatch',
          error_detail=null, processed_at=v_now, updated_at=v_now
          where shop_domain=v_event.shop_domain and external_event_id=v_event.external_event_id
            and status='processing' and attempt_count=v_attempt;
        return jsonb_build_object('status','ignored');
      end if;
      update public.commerce_orders set
        status = case when v_action='cancelled' then 'cancelled'
          when status in ('cancelled','refunded','disputed') then status else 'partially_refunded' end,
        financial_status = case when v_action='cancelled' then 'cancelled'
          when status in ('cancelled','refunded','disputed') then financial_status else 'partially_refunded' end,
        cancelled_at = case when v_action='cancelled' then coalesce(nullif(p_event->>'cancelled_at','')::timestamptz,v_now)
          else cancelled_at end
        where id=v_order.id;
      for v_activation in select * from public.activation_requests
        where commerce_order_id=v_order.id and offer_handle=p_event->>'offer_handle'
          and manifest_version=p_event->>'manifest_version'
      loop
        update public.activation_requests set
          status=case when v_action='cancelled' then 'revoked' else 'partial' end,
          status_detail=p_event#>>'{receipt,detail}'
          where id=v_activation.id;
        update public.activation_receipts set
          claim_token_hash=null, claim_token_expires_at=null,
          state=p_event#>>'{receipt,state}', headline=p_event#>>'{receipt,headline}',
          detail=p_event#>>'{receipt,detail}', known_facts=p_event#>'{receipt,known_facts}',
          unknowns=p_event#>'{receipt,unknowns}',
          input_preserved=coalesce((p_event#>>'{receipt,input_preserved}')::boolean,false),
          next_action_label=p_event#>>'{receipt,next_action_label}',
          next_action_path=p_event#>>'{receipt,next_action_path}'
          where activation_request_id=v_activation.id;
      end loop;
    else
      raise exception using errcode='P0001', message='unsupported_action';
    end if;

    update public.commerce_event_log set status='processed', error_code=null, error_detail=null,
      processed_at=v_now, updated_at=v_now
      where shop_domain=v_event.shop_domain and external_event_id=v_event.external_event_id
        and status='processing' and attempt_count=v_attempt;
    get diagnostics v_rows = row_count;
    return jsonb_build_object('status', case when v_rows=1 then v_action else 'stale_worker' end);
  exception when others then
    update public.commerce_event_log set status='failed', error_code='processing_failure',
      error_detail=null, processed_at=v_now, updated_at=v_now
      where shop_domain=v_event.shop_domain and external_event_id=v_event.external_event_id
        and status='processing' and attempt_count=v_attempt;
    return jsonb_build_object('status','failed','error_code','processing_failure');
  end;
end;
$$;

revoke all on function public.consume_storefront_claim_attempts(text[]) from public, anon, authenticated;
revoke all on function public.storefront_runtime_readiness() from public, anon, authenticated;
revoke all on function public.issue_storefront_receipt_claim(text,text,timestamptz) from public, anon, authenticated;
revoke all on function public.consume_storefront_receipt_claim(text) from public, anon, authenticated;
revoke all on function public.process_storefront_shopify_event(jsonb) from public, anon, authenticated;
grant execute on function public.consume_storefront_claim_attempts(text[]) to service_role;
grant execute on function public.storefront_runtime_readiness() to service_role;
grant execute on function public.issue_storefront_receipt_claim(text,text,timestamptz) to service_role;
grant execute on function public.consume_storefront_receipt_claim(text) to service_role;
grant execute on function public.process_storefront_shopify_event(jsonb) to service_role;

commit;
