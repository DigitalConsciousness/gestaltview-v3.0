alter table public.orders
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists currency text not null default 'usd',
  add column if not exists subtotal_cents integer not null default 0,
  add column if not exists total_cents integer not null default 0,
  add column if not exists payment_status text not null default 'awaiting_payment',
  add column if not exists paid_at timestamptz,
  add column if not exists config_hash text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_status_check'
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (
        payment_status in (
          'draft',
          'awaiting_payment',
          'paid',
          'review_requested',
          'failed'
        )
      );
  end if;
end
$$;

create unique index if not exists orders_stripe_checkout_session_id_idx
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_buyer_id_idx
  on public.orders (buyer_id);

create index if not exists orders_package_draft_id_idx
  on public.orders (package_draft_id);

create index if not exists orders_payment_status_idx
  on public.orders (payment_status);
