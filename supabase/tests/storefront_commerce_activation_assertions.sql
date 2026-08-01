begin;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['storefront_offers','storefront_offer_proofs','commerce_orders','activation_requests','activation_receipts','commerce_event_log']
  loop
    if not (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = table_name) then
      raise exception 'RLS is not enabled on public.%', table_name;
    end if;
    if has_table_privilege('anon', format('public.%I', table_name), 'select') or has_table_privilege('authenticated', format('public.%I', table_name), 'select') then
      raise exception 'browser role can read public.%', table_name;
    end if;
  end loop;
end $$;

insert into public.storefront_offers (id, handle, family, activation_mode, runtime_provisioning_key, review_status)
values ('10000000-0000-0000-0000-000000000001', 'test-field-manual', 'Field Notes', 'download', 'artifact:test-field-manual', 'approved');

insert into public.commerce_orders (id, shop_domain, external_order_id, order_name, buyer_email_hash, currency, total_amount, financial_status)
values ('20000000-0000-0000-0000-000000000001', 'test.myshopify.com', 'gid://shopify/Order/42', '#1042', repeat('a', 64), 'USD', 29.00, 'paid');

insert into public.activation_requests (id, commerce_order_id, offer_id, offer_handle, manifest_version, claim_token_hash, runtime_provisioning_key, status, status_detail)
values ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'test-field-manual', '1.0.0', repeat('b', 64), 'artifact:test-field-manual', 'pending_consent', 'Payment verified; consent pending.');

insert into public.activation_receipts (activation_request_id, claim_token_hash, state, headline, detail)
values ('30000000-0000-0000-0000-000000000001', repeat('b', 64), 'ready', 'Payment verified.', 'Activation waits for consent.');

insert into public.commerce_event_log (shop_domain, external_event_id, topic, payload_sha256)
values ('test.myshopify.com', 'event-42', 'orders/paid', repeat('c', 64));

do $$
begin
  begin
    insert into public.commerce_event_log (shop_domain, external_event_id, topic, payload_sha256)
    values ('test.myshopify.com', 'event-42', 'orders/paid', repeat('c', 64));
    raise exception 'duplicate webhook event was accepted';
  exception when unique_violation then
    null;
  end;
end $$;

rollback;
