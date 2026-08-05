import { createHash } from 'node:crypto';
import { EXPECTED_PRODUCT_GID, EXPECTED_STORE_DOMAIN, EXPECTED_VARIANT_GID, matchesApprovedOfferIdentity, OFFER, resolveApprovedLine } from './offer.mjs';
import { hashBuyerEmail } from './security.mjs';

const TERMINAL_STATUSES = new Set(['cancelled', 'refunded', 'disputed', 'partially_refunded']);
const SUPPORTED_TOPICS = new Set(['orders/paid', 'orders/cancelled', 'refunds/create']);

export function normalizeOrderGid(value) {
  const text = String(value ?? '');
  const match = text.match(/^(?:gid:\/\/shopify\/Order\/)?(\d+)$/);
  if (!match) throw new Error('Invalid Shopify order id.');
  return `gid://shopify/Order/${match[1]}`;
}

export function preservesTerminalStatus(currentStatus, incomingStatus) {
  return TERMINAL_STATUSES.has(currentStatus) ? currentStatus : incomingStatus;
}

function getOrderId(topic, payload) {
  return normalizeOrderGid(topic === 'refunds/create'
    ? payload?.order_id
    : payload?.admin_graphql_api_id ?? payload?.id);
}

function safeOrderName(value) {
  const text = String(value ?? '');
  return /^#[A-Za-z0-9-]{1,30}$/.test(text) ? text : null;
}

function safeTimestamp(value, fallback = null) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? fallback : date.toISOString();
}

function processingEvent(shopDomain, eventId, topic, payloadSha256) {
  const now = new Date().toISOString();
  return {
    shop_domain: shopDomain,
    external_event_id: eventId,
    topic,
    payload_sha256: payloadSha256,
    status: 'processing',
    attempt_count: 1,
    error_code: null,
    error_detail: null,
    processed_at: null,
    updated_at: now,
  };
}

function finishFields(status, errorCode = null) {
  const now = new Date().toISOString();
  return {
    status,
    error_code: errorCode,
    error_detail: null,
    processed_at: now,
    updated_at: now,
  };
}

function orderAmounts(payload) {
  const candidates = [
    payload?.current_total_price,
    payload?.total_price,
    payload?.current_total_price_set?.shop_money?.amount,
    payload?.total_price_set?.shop_money?.amount,
  ].filter((value) => value != null);
  if (candidates.length === 0 || candidates.some((value) => String(value) !== OFFER.price)) return null;
  return String(payload.current_total_price ?? payload.total_price
    ?? payload.current_total_price_set?.shop_money?.amount
    ?? payload.total_price_set?.shop_money?.amount);
}

function orderHasNoDiscounts(payload) {
  const discounts = [
    payload?.total_discount,
    payload?.total_discounts,
    payload?.current_total_discounts,
    payload?.total_discount_set?.shop_money?.amount,
    payload?.total_discounts_set?.shop_money?.amount,
    payload?.current_total_discounts_set?.shop_money?.amount,
  ].filter((value) => value != null);
  return discounts.every((value) => {
    const amount = Number(value);
    return Number.isFinite(amount) && amount === 0;
  });
}

function mappedSummary(line, verifiedTotal) {
  return {
    offer_handle: OFFER.handle,
    manifest_version: OFFER.manifestVersion,
    product_gid: `gid://shopify/Product/${line.product_id.toString().split('/').at(-1)}`,
    variant_gid: `gid://shopify/ProductVariant/${line.variant_id.toString().split('/').at(-1)}`,
    line_amount: String(line.discounted_total ?? line.discounted_total_set?.shop_money?.amount ?? line.price),
    order_amount: verifiedTotal,
    quantity: 1,
    currency: OFFER.currency,
  };
}

function isMappedOrder(order) {
  const summary = order?.raw_summary;
  return summary?.offer_handle === OFFER.handle
    && summary?.manifest_version === OFFER.manifestVersion
    && summary?.product_gid === EXPECTED_PRODUCT_GID
    && summary?.variant_gid === EXPECTED_VARIANT_GID;
}

function existingOrderUpdate(existing, changes) {
  return {
    shop_domain: existing.shop_domain,
    external_order_id: existing.external_order_id,
    order_name: existing.order_name,
    buyer_email_hash: existing.buyer_email_hash,
    currency: existing.currency,
    total_amount: existing.total_amount,
    financial_status: existing.financial_status,
    status: existing.status,
    paid_at: existing.paid_at,
    cancelled_at: existing.cancelled_at,
    raw_summary: existing.raw_summary,
    ...changes,
  };
}

function receiptFor(state) {
  if (state === 'blocked') return {
    state: 'blocked',
    headline: 'Payment verified. Contact details need review.',
    detail: 'We could not match a usable checkout email. No project material has been received. Contact GestaltView support with the order name for recovery.',
    known_facts: ['Payment verified', 'One Project Convergence Sprint purchased'],
    unknowns: ['Verified contact email', 'Project scope', 'Source accessibility', 'Chosen implementation-ready artifact'],
    input_preserved: false,
    next_action_label: 'Contact GestaltView support with your order name',
    next_action_path: null,
  };
  return {
    state: 'pending',
    headline: 'Payment verified. Intake is waiting for you.',
    detail: 'Restricted intake access will be sent to the verified checkout email. Your five-business-day delivery window begins after the submitted material passes the scope check.',
    known_facts: ['Payment verified', 'One Project Convergence Sprint purchased'],
    unknowns: ['Project scope', 'Source accessibility', 'Chosen implementation-ready artifact'],
    input_preserved: false,
    next_action_label: 'Watch your checkout email for restricted intake access',
    next_action_path: null,
  };
}

function nonPaidReceipt(topic) {
  return {
    claim_token_hash: null,
    state: topic === 'orders/cancelled' ? 'revoked' : 'partial',
    headline: topic === 'orders/cancelled' ? 'Order cancelled.' : 'Refund activity is under review.',
    detail: topic === 'orders/cancelled'
      ? 'The Sprint activation is closed. Commerce history is retained.'
      : 'Shopify reported a refund. Access is paused while the final refund state is confirmed.',
    known_facts: [topic === 'orders/cancelled' ? 'Order cancelled' : 'Refund event verified'],
    unknowns: topic === 'orders/cancelled' ? [] : ['Whether the refund is full or partial'],
    input_preserved: false,
    next_action_label: 'Contact GestaltView support with your order name',
    next_action_path: null,
  };
}

export function buildWebhookCommand({ topic, eventId, shopDomain, payload, rawBody }) {
  if (!SUPPORTED_TOPICS.has(topic)) return { action: 'unsupported' };
  if (shopDomain !== EXPECTED_STORE_DOMAIN) throw new Error('Unexpected Shopify shop domain.');
  if (typeof eventId !== 'string' || eventId.length < 1 || eventId.length > 200) throw new Error('Invalid event id.');
  if (!Buffer.isBuffer(rawBody)) throw new Error('Raw webhook body is required.');
  const payloadSha256 = createHash('sha256').update(rawBody).digest('hex');
  const orderId = getOrderId(topic, payload);
  const base = {
    topic,
    shop_domain: shopDomain,
    external_event_id: eventId,
    payload_sha256: payloadSha256,
    external_order_id: orderId,
    offer_handle: OFFER.handle,
    manifest_version: OFFER.manifestVersion,
  };
  if (topic !== 'orders/paid') return {
    ...base,
    action: topic === 'orders/cancelled' ? 'cancelled' : 'partially_refunded',
    cancelled_at: safeTimestamp(payload?.cancelled_at),
    receipt: nonPaidReceipt(topic),
  };
  const currency = payload?.currency ?? payload?.currency_code;
  const verifiedTotal = orderAmounts(payload);
  const identityLines = (payload?.line_items ?? []).filter(matchesApprovedOfferIdentity);
  const mappedLine = identityLines.length === 1 ? identityLines[0] : null;
  if (!verifiedTotal || !orderHasNoDiscounts(payload) || !mappedLine || !resolveApprovedLine(mappedLine, currency)) return {
    ...base,
    action: 'ignored',
    error_code: 'offer_mapping_or_amount_mismatch',
  };
  let buyerEmailHash = null;
  if (payload?.email) {
    try { buyerEmailHash = hashBuyerEmail(payload.email); } catch { buyerEmailHash = null; }
  }
  const activationStatus = buyerEmailHash ? 'pending_consent' : 'blocked';
  return {
    ...base,
    action: 'verified_paid',
    order_name: safeOrderName(payload?.name),
    buyer_email_hash: buyerEmailHash,
    currency: OFFER.currency,
    total_amount: verifiedTotal,
    financial_status: String(payload?.financial_status || 'paid').slice(0, 50),
    paid_at: safeTimestamp(payload?.processed_at, new Date().toISOString()),
    raw_summary: mappedSummary(mappedLine, verifiedTotal),
    activation_scope: OFFER.activationScope,
    activation_status: activationStatus,
    status_detail: buyerEmailHash ? 'Payment verified; intake is pending.' : 'Payment verified; buyer email requires manual recovery.',
    receipt: receiptFor(buyerEmailHash ? 'pending' : 'blocked'),
  };
}

export async function processCommerceEvent({ topic, eventId, shopDomain, payload, rawBody, repository }) {
  if (!SUPPORTED_TOPICS.has(topic)) return { status: 'unsupported' };
  if (shopDomain !== EXPECTED_STORE_DOMAIN) throw new Error('Unexpected Shopify shop domain.');
  if (typeof eventId !== 'string' || eventId.length < 1 || eventId.length > 200) throw new Error('Invalid event id.');
  if (!Buffer.isBuffer(rawBody)) throw new Error('Raw webhook body is required.');

  const payloadSha256 = createHash('sha256').update(rawBody).digest('hex');
  const claim = await repository.claimEvent(processingEvent(shopDomain, eventId, topic, payloadSha256));
  if (!['inserted', 'reclaimed_failed', 'reclaimed_stale'].includes(claim?.state)) {
    if (claim?.state === 'duplicate_complete') return { status: 'duplicate' };
    if (claim?.state === 'payload_mismatch') return { status: 'duplicate_payload_mismatch' };
    return { status: 'in_flight' };
  }
  const claimedAttemptCount = Number(claim?.row?.attempt_count);
  if (!Number.isInteger(claimedAttemptCount) || claimedAttemptCount < 1) throw new Error('Invalid claimed event attempt.');

  const complete = async (eventStatus, errorCode, result) => {
    const finished = await repository.finishEvent(
      shopDomain, eventId, claimedAttemptCount, finishFields(eventStatus, errorCode),
    );
    return finished ? result : { status: 'stale_worker' };
  };

  try {
    const orderId = getOrderId(topic, payload);
    const existingOrder = await repository.getOrder(orderId);

    if (topic === 'orders/paid') {
      const currency = payload?.currency ?? payload?.currency_code;
      const verifiedTotal = orderAmounts(payload);
      const identityLines = (payload?.line_items ?? []).filter(matchesApprovedOfferIdentity);
      const mappedLine = identityLines.length === 1 ? identityLines[0] : null;
      if (!verifiedTotal || !orderHasNoDiscounts(payload) || !mappedLine || !resolveApprovedLine(mappedLine, currency)) {
        return complete('ignored', 'offer_mapping_or_amount_mismatch', { status: 'ignored', orderId });
      }

      const nextStatus = preservesTerminalStatus(existingOrder?.status, 'verified_paid');
      let buyerEmailHash = existingOrder?.buyer_email_hash ?? null;
      if (!buyerEmailHash && payload?.email) {
        try { buyerEmailHash = hashBuyerEmail(payload.email); } catch { buyerEmailHash = null; }
      }
      const order = await repository.upsertOrder({
        shop_domain: shopDomain,
        external_order_id: orderId,
        order_name: safeOrderName(payload?.name),
        buyer_email_hash: buyerEmailHash,
        status: nextStatus,
        currency: OFFER.currency,
        total_amount: verifiedTotal,
        financial_status: String(payload?.financial_status || 'paid').slice(0, 50),
        paid_at: safeTimestamp(payload?.processed_at, new Date().toISOString()),
        cancelled_at: existingOrder?.cancelled_at ?? null,
        raw_summary: mappedSummary(mappedLine, verifiedTotal),
      });
      if (TERMINAL_STATUSES.has(nextStatus)) {
        return complete('processed', 'terminal_state_preserved', { status: 'terminal_preserved', orderId });
      }

      const existingActivations = await repository.findActivationsByOrder(order.id);
      const existingSprint = existingActivations.find((activation) =>
        activation.offer_handle === OFFER.handle && activation.manifest_version === OFFER.manifestVersion);
      if (existingSprint) {
        const existingReceipt = await repository.getReceiptByActivationId(existingSprint.id);
        if (!existingReceipt) {
          await repository.upsertReceipt({
            activation_request_id: existingSprint.id,
            claim_token_hash: null,
            ...receiptFor(buyerEmailHash ? 'pending' : 'blocked'),
          });
        }
        return complete('processed', 'active_state_preserved', { status: 'activation_preserved', orderId });
      }

      const offer = await repository.getApprovedOffer(OFFER.handle, OFFER.manifestVersion);
      if (!offer || offer.review_status !== 'approved' || offer.activation_mode !== OFFER.activationMode) {
        return complete('failed', 'offer_not_approved', { status: 'blocked', orderId });
      }
      const activationState = buyerEmailHash ? 'pending_consent' : 'blocked';
      const activation = await repository.upsertActivation({
        commerce_order_id: order.id,
        offer_id: offer.id,
        offer_handle: OFFER.handle,
        manifest_version: OFFER.manifestVersion,
        status: activationState,
        status_detail: buyerEmailHash ? 'Payment verified; intake is pending.' : 'Payment verified; buyer email requires manual recovery.',
        claim_token_hash: null,
        activation_scope: OFFER.activationScope,
      });
      const existingReceipt = await repository.getReceiptByActivationId(activation.id);
      if (!existingReceipt) {
        await repository.upsertReceipt({
          activation_request_id: activation.id,
          claim_token_hash: null,
          ...receiptFor(buyerEmailHash ? 'pending' : 'blocked'),
        });
      }
      return complete('processed', null, { status: 'activated', orderId });
    }

    if (!existingOrder) return complete('ignored', 'order_not_found', { status: 'ignored', orderId });
    if (!isMappedOrder(existingOrder)) return complete('ignored', 'stored_offer_mapping_mismatch', { status: 'ignored', orderId });

    const orderStatus = topic === 'orders/cancelled' ? 'cancelled' : 'partially_refunded';
    const preservedOrderStatus = topic === 'orders/cancelled'
      ? 'cancelled'
      : preservesTerminalStatus(existingOrder.status, orderStatus);
    await repository.upsertOrder(existingOrderUpdate(existingOrder, {
      status: preservedOrderStatus,
      financial_status: topic === 'orders/cancelled'
        ? 'cancelled'
        : TERMINAL_STATUSES.has(existingOrder.status) ? existingOrder.financial_status : orderStatus,
      cancelled_at: topic === 'orders/cancelled'
        ? safeTimestamp(payload?.cancelled_at, new Date().toISOString())
        : existingOrder.cancelled_at,
    }));
    if (topic === 'refunds/create' && ['cancelled', 'refunded', 'disputed'].includes(preservedOrderStatus)) {
      return complete('processed', 'terminal_state_preserved', { status: 'terminal_preserved', orderId });
    }

    const attached = (await repository.findActivationsByOrder(existingOrder.id))
      .filter((activation) =>
        activation.offer_handle === OFFER.handle && activation.manifest_version === OFFER.manifestVersion);
    const activationStatus = topic === 'orders/cancelled' ? 'revoked' : 'partial';
    const statusDetail = topic === 'orders/cancelled'
      ? 'Order cancelled; activation revoked.'
      : 'Refund event verified; manual review required.';
    for (const activation of attached) {
      await repository.updateActivationStatus(activation.id, activationStatus, statusDetail);
      await repository.updateReceiptByActivation(activation.id, nonPaidReceipt(topic));
    }
    return complete('processed', attached.length ? null : 'activation_not_found', {
      status: attached.length ? orderStatus : 'order_updated', orderId,
    });
  } catch (error) {
    await repository.finishEvent(
      shopDomain, eventId, claimedAttemptCount, finishFields('failed', 'processing_failure'),
    );
    throw error;
  }
}
