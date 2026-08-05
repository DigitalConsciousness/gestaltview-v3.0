import { OFFER } from './offer.mjs';
import {
  generateSignedClaimToken, hashBuyerEmail, hashClaimRateBucket, hashClaimToken,
  normalizeEmail, verifySignedClaimToken,
} from './security.mjs';

const PAID_STATUSES = new Set(['verified_paid', 'partially_refunded']);
const SAFE_RECEIPT_FIELDS = [
  'state', 'headline', 'detail', 'known_facts', 'unknowns',
  'input_preserved', 'next_action_label', 'next_action_path',
];

function normalizeOrderName(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return /^#[A-Z0-9-]{1,30}$/.test(normalized) ? normalized : null;
}

function safeReceipt(row) {
  if (!row) return null;
  return Object.fromEntries(SAFE_RECEIPT_FIELDS.map((key) => [key, row[key]]));
}

export async function issueClaim({ orderName, email, rateLimitKey = 'unknown', pepper, origin, repository, now = Date.now() }) {
  const normalizedOrder = normalizeOrderName(orderName);
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedOrder || !normalizedEmail) return null;
  const buckets = [
    hashClaimRateBucket(['ip', String(rateLimitKey).slice(0, 200)], pepper),
    hashClaimRateBucket(['identifier', normalizedOrder, normalizedEmail], pepper),
  ];
  if (!await repository.consumeClaimAttempts(buckets)) return null;
  const orders = await repository.findPaidOrders(normalizedOrder, hashBuyerEmail(normalizedEmail));
  if (orders.length !== 1 || !PAID_STATUSES.has(orders[0].status)) return null;
  const activations = await repository.findSprintActivations(orders[0].id);
  if (activations.length !== 1 || activations[0].offer_handle !== OFFER.handle) return null;
  const receipt = await repository.getReceiptByActivationId(activations[0].id);
  if (!receipt || ['revoked', 'failed'].includes(receipt.state)) return null;

  const token = generateSignedClaimToken(pepper, now);
  const expiresAt = new Date(now + 30 * 60_000).toISOString();
  const stored = await repository.issueReceiptClaim(receipt.id, hashClaimToken(token, pepper), expiresAt);
  if (!stored) return null;
  const url = new URL('/activate', origin);
  url.hash = new URLSearchParams({ token }).toString();
  return { claimUrl: url.toString() };
}

export async function redeemClaim({ token, pepper, repository, now = Date.now() }) {
  if (!verifySignedClaimToken(token, pepper, now)) return null;
  let tokenHash;
  try { tokenHash = hashClaimToken(token, pepper); } catch { return null; }
  const receipt = await repository.consumeReceiptClaim(tokenHash);
  return safeReceipt(receipt);
}
