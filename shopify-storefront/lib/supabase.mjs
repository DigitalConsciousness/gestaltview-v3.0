import { OFFER } from './offer.mjs';

const EVENT_LEASE_MS = 5 * 60 * 1000;
export const SUPABASE_RPC_TIMEOUT_MS = 3_500;
export const STOREFRONT_SCHEMA_VERSION = '202608040001';

function createClient(env = process.env, fetchImpl = fetch) {
  const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.SUPABASE_URL || !secret) throw new Error('Server persistence is not configured.');
  const base = new URL('/rest/v1/', env.SUPABASE_URL);

  return async function request(table, { method = 'GET', query = {}, body, prefer } = {}) {
    const url = new URL(table, base);
    for (const [key, value] of Object.entries(query)) if (value != null) url.searchParams.set(key, value);
    const response = await fetchImpl(url, {
      method,
      headers: {
        apikey: secret,
        authorization: `Bearer ${secret}`,
        'content-type': 'application/json',
        ...(prefer ? { prefer } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(SUPABASE_RPC_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Persistence request failed (${response.status}).`);
    if (response.status === 204) return [];
    const text = await response.text();
    return text ? JSON.parse(text) : [];
  };
}

function first(rows) { return Array.isArray(rows) ? rows[0] ?? null : rows ?? null; }

export function createSupabaseRepository(env = process.env, fetchImpl = fetch) {
  const request = createClient(env, fetchImpl);
  const upsert = async (table, row, conflict) => first(await request(table, {
    method: 'POST',
    query: { on_conflict: conflict, select: '*' },
    prefer: 'resolution=merge-duplicates,return=representation',
    body: row,
  }));

  return {
    async processWebhookEvent(command) {
      return first(await request('rpc/process_storefront_shopify_event', {
        method: 'POST', body: { p_event: command }, prefer: 'return=representation',
      }));
    },
    async checkRuntimeReadiness() {
      const result = first(await request('rpc/storefront_runtime_readiness', {
        method: 'POST', body: {}, prefer: 'return=representation',
      }));
      return Boolean(
        result?.schema_version === STOREFRONT_SCHEMA_VERSION
        && result?.offer_ready === true
        && Number.isInteger(result?.unresolved_sprints)
        && result.unresolved_sprints < 2
      );
    },
    async consumeClaimAttempts(bucketHashes) {
      const result = await request('rpc/consume_storefront_claim_attempts', {
        method: 'POST', body: { p_bucket_hashes: bucketHashes }, prefer: 'return=representation',
      });
      return first(result) === true;
    },
    async claimEvent(row) {
      const now = new Date();
      const nowIso = now.toISOString();
      const candidate = { ...row, updated_at: nowIso };
      const inserted = first(await request('commerce_event_log', {
        method: 'POST',
        query: { on_conflict: 'shop_domain,external_event_id', select: '*' },
        prefer: 'resolution=ignore-duplicates,return=representation',
        body: candidate,
      }));
      if (inserted) return { state: 'inserted', row: inserted };

      const existing = first(await request('commerce_event_log', {
        query: {
          shop_domain: `eq.${row.shop_domain}`,
          external_event_id: `eq.${row.external_event_id}`,
          select: 'shop_domain,external_event_id,payload_sha256,status,attempt_count,error_code,error_detail,processed_at,created_at,updated_at',
          limit: '1',
        },
      }));
      if (!existing) return { state: 'in_flight', row: null };
      if (existing.payload_sha256 !== row.payload_sha256) return { state: 'payload_mismatch', row: existing };
      if (['processed', 'ignored'].includes(existing.status)) return { state: 'duplicate_complete', row: existing };

      let leaseColumn = null;
      let leaseValue = null;
      if (existing.status === 'processing') {
        leaseColumn = existing.updated_at ? 'updated_at' : 'created_at';
        leaseValue = existing[leaseColumn];
        const leaseTime = new Date(leaseValue).valueOf();
        if (!Number.isFinite(leaseTime) || now.valueOf() - leaseTime <= EVENT_LEASE_MS) {
          return { state: 'in_flight', row: existing };
        }
      } else if (existing.status !== 'failed') {
        return { state: 'duplicate_complete', row: existing };
      }

      const attemptCount = Number(existing.attempt_count);
      if (!Number.isInteger(attemptCount) || attemptCount < 1) return { state: 'in_flight', row: existing };
      const query = {
        shop_domain: `eq.${row.shop_domain}`,
        external_event_id: `eq.${row.external_event_id}`,
        status: `eq.${existing.status}`,
        attempt_count: `eq.${attemptCount}`,
        payload_sha256: `eq.${row.payload_sha256}`,
        select: '*',
      };
      if (leaseColumn) query[leaseColumn] = `eq.${leaseValue}`;
      const reclaimed = first(await request('commerce_event_log', {
        method: 'PATCH',
        query,
        prefer: 'return=representation',
        body: {
          status: 'processing',
          attempt_count: attemptCount + 1,
          error_code: null,
          error_detail: null,
          processed_at: null,
          updated_at: nowIso,
        },
      }));
      const reclaimedState = existing.status === 'failed' ? 'reclaimed_failed' : 'reclaimed_stale';
      return reclaimed ? { state: reclaimedState, row: reclaimed } : { state: 'in_flight', row: existing };
    },
    async finishEvent(shopDomain, eventId, claimedAttemptCount, update) {
      const rows = await request('commerce_event_log', {
        method: 'PATCH',
        query: {
          shop_domain: `eq.${shopDomain}`,
          external_event_id: `eq.${eventId}`,
          status: 'eq.processing',
          attempt_count: `eq.${claimedAttemptCount}`,
          select: 'external_event_id',
        },
        prefer: 'return=representation',
        body: { ...update, updated_at: new Date().toISOString() },
      });
      return rows.length === 1;
    },
    async getOrder(orderId) {
      return first(await request('commerce_orders', {
        query: { shop_domain: `eq.${env.SHOPIFY_STORE_DOMAIN}`, external_order_id: `eq.${orderId}`, select: '*', limit: '1' },
      }));
    },
    upsertOrder: (row) => upsert('commerce_orders', row, 'shop_domain,external_order_id'),
    async getApprovedOffer(handle, manifestVersion) {
      return first(await request('storefront_offers', {
        query: {
          handle: `eq.${handle}`,
          manifest_version: `eq.${manifestVersion}`,
          review_status: 'eq.approved',
          activation_mode: 'eq.human_handoff',
          select: 'id,handle,manifest_version,review_status,activation_mode,activation_scope',
          limit: '1',
        },
      }));
    },
    upsertActivation: (row) => upsert(
      'activation_requests',
      { ...row, claim_token_hash: null },
      'commerce_order_id,offer_handle,claim_token_hash',
    ),
    upsertReceipt: (row) => upsert('activation_receipts', row, 'activation_request_id'),
    findActivationsByOrder(orderId) {
      return request('activation_requests', {
        query: {
          commerce_order_id: `eq.${orderId}`,
          select: 'id,commerce_order_id,offer_id,offer_handle,manifest_version,status,status_detail,activation_scope',
        },
      });
    },
    async updateActivationStatus(id, status, statusDetail) {
      await request('activation_requests', {
        method: 'PATCH', query: { id: `eq.${id}` },
        body: { status, status_detail: statusDetail }, prefer: 'return=minimal',
      });
    },
    async updateReceiptByActivation(activationId, update) {
      await request('activation_receipts', {
        method: 'PATCH', query: { activation_request_id: `eq.${activationId}` },
        body: update, prefer: 'return=minimal',
      });
    },
    async findPaidOrders(orderName, emailHash) {
      return request('commerce_orders', {
        query: {
          shop_domain: `eq.${env.SHOPIFY_STORE_DOMAIN}`,
          order_name: `eq.${orderName}`,
          buyer_email_hash: `eq.${emailHash}`,
          status: 'in.(verified_paid,partially_refunded)',
          select: 'id,status,order_name',
          limit: '2',
        },
      });
    },
    findSprintActivations(orderId) {
      return request('activation_requests', {
        query: {
          commerce_order_id: `eq.${orderId}`,
          offer_handle: `eq.${OFFER.handle}`,
          select: 'id,commerce_order_id,offer_handle,status',
          limit: '2',
        },
      });
    },
    async getReceiptByActivationId(activationId) {
      return first(await request('activation_receipts', {
        query: { activation_request_id: `eq.${activationId}`, select: '*', limit: '1' },
      }));
    },
    async issueReceiptClaim(receiptId, claimTokenHash, expiresAt) {
      const result = await request('rpc/issue_storefront_receipt_claim', {
        method: 'POST',
        body: { p_receipt_id: String(receiptId), p_claim_token_hash: claimTokenHash, p_expires_at: expiresAt },
        prefer: 'return=representation',
      });
      return first(result) === true;
    },
    async consumeReceiptClaim(claimTokenHash) {
      return first(await request('rpc/consume_storefront_receipt_claim', {
        method: 'POST', body: { p_claim_token_hash: claimTokenHash }, prefer: 'return=representation',
      }));
    },
  };
}
