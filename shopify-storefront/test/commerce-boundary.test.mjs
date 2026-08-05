import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";

import { buildCheckout } from "../lib/checkout.mjs";
import { issueClaim, redeemClaim } from "../lib/claim.mjs";
import { buildWebhookCommand, normalizeOrderGid, preservesTerminalStatus } from "../lib/commerce.mjs";
import {
  EXPECTED_PRODUCT_GID,
  EXPECTED_STORE_DOMAIN,
  EXPECTED_VARIANT_GID,
  OFFER,
  resolveApprovedLine,
} from "../lib/offer.mjs";
import {
  generateSignedClaimToken,
  hashBuyerEmail,
  hashClaimToken,
  verifyShopifyHmac,
  verifySignedClaimToken,
} from "../lib/security.mjs";

const exactEnv = {
  STOREFRONT_CHECKOUT_ENABLED: "true",
  SHOPIFY_STORE_DOMAIN: EXPECTED_STORE_DOMAIN,
  SHOPIFY_PRODUCT_GID: EXPECTED_PRODUCT_GID,
  SHOPIFY_VARIANT_GID: EXPECTED_VARIANT_GID,
};

function paidLine(overrides = {}) {
  return {
    product_id: EXPECTED_PRODUCT_GID,
    variant_id: EXPECTED_VARIANT_GID,
    quantity: 1,
    price: "495.00",
    discounted_total: "495.00",
    total_discount: "0.00",
    discount_allocations: [],
    properties: [
      { name: "_gestaltview_offer_handle", value: OFFER.handle },
      { name: "_gestaltview_manifest_version", value: OFFER.manifestVersion },
    ],
    ...overrides,
  };
}

function paidPayload(line = paidLine()) {
  return {
    admin_graphql_api_id: "gid://shopify/Order/12345",
    name: "#1042",
    email: "Buyer@example.com",
    currency: "USD",
    current_total_price: "495.00",
    total_discount: "0.00",
    financial_status: "paid",
    processed_at: "2026-08-05T00:00:00.000Z",
    line_items: [line],
  };
}

test("checkout is fail-closed and contains only the exact mapped Sprint", () => {
  assert.throws(() => buildCheckout({ handle: OFFER.handle, manifestVersion: OFFER.manifestVersion }, {
    ...exactEnv,
    STOREFRONT_CHECKOUT_ENABLED: "false",
  }), /disabled/i);
  const checkout = buildCheckout({ handle: OFFER.handle, manifestVersion: OFFER.manifestVersion }, exactEnv);
  const url = new URL(checkout.checkoutUrl);
  assert.equal(url.hostname, EXPECTED_STORE_DOMAIN);
  assert.equal(url.pathname, "/cart/46345021718607:1");
  assert.equal(url.searchParams.get("properties[_gestaltview_offer_handle]"), OFFER.handle);
  assert.equal(url.searchParams.get("properties[_gestaltview_manifest_version]"), OFFER.manifestVersion);
});

test("approved line requires exact identity, quantity, amount, currency, and no discounts", () => {
  assert.equal(resolveApprovedLine(paidLine(), "USD"), OFFER);
  assert.equal(resolveApprovedLine(paidLine({ quantity: 2 }), "USD"), null);
  assert.equal(resolveApprovedLine(paidLine({ price: "494.99" }), "USD"), null);
  assert.equal(resolveApprovedLine(paidLine({ discount_allocations: [{ amount: "1.00" }] }), "USD"), null);
  assert.equal(resolveApprovedLine(paidLine(), "CAD"), null);
});

test("paid command contains hashes and bounded summaries, never raw buyer data", () => {
  const payload = paidPayload();
  const rawBody = Buffer.from(JSON.stringify(payload));
  const command = buildWebhookCommand({
    topic: "orders/paid",
    eventId: "event-1",
    shopDomain: EXPECTED_STORE_DOMAIN,
    payload,
    rawBody,
  });
  assert.equal(command.action, "verified_paid");
  assert.equal(command.total_amount, "495.00");
  assert.equal(command.buyer_email_hash, hashBuyerEmail(payload.email));
  assert.equal(JSON.stringify(command).includes(payload.email), false);
  assert.equal(command.activation_status, "pending_consent");
  assert.equal(buildWebhookCommand({ topic: "orders/paid", eventId: "event-2", shopDomain: EXPECTED_STORE_DOMAIN, payload: paidPayload(paidLine({ quantity: 2 })), rawBody }).action, "ignored");
  assert.equal(buildWebhookCommand({ topic: "orders/paid", eventId: "event-3", shopDomain: EXPECTED_STORE_DOMAIN, payload: { ...paidPayload(), total_discount: "1.00" }, rawBody }).action, "ignored");
  assert.equal(buildWebhookCommand({ topic: "orders/paid", eventId: "event-4", shopDomain: EXPECTED_STORE_DOMAIN, payload: { ...paidPayload(), total_discount_set: { shop_money: { amount: "1.00" } } }, rawBody }).action, "ignored");
});

test("Shopify HMAC verifies the exact raw bytes", () => {
  const secret = "test-secret-with-enough-entropy";
  const raw = Buffer.from('{"order":123, "spacing":"preserved"}');
  const signature = createHmac("sha256", secret).update(raw).digest("base64");
  assert.equal(verifyShopifyHmac(raw, signature, secret), true);
  assert.equal(verifyShopifyHmac(Buffer.from(raw.toString().replace(" ", "")), signature, secret), false);
});

test("claim tokens are signed, peppered, expire, and redeem once", async () => {
  const pepper = "claim-pepper-longer-than-thirty-two-characters";
  const now = Date.parse("2026-08-05T00:00:00.000Z");
  const token = generateSignedClaimToken(pepper, now);
  assert.equal(verifySignedClaimToken(token, pepper, now + 1_000)?.valid, true);
  assert.equal(verifySignedClaimToken(token, pepper, now + 30 * 60_000), null);
  assert.notEqual(hashClaimToken(token, pepper), token);

  let storedHash = null;
  const receipt = { id: "receipt-1", state: "pending", headline: "Verified", detail: "Waiting", known_facts: [], unknowns: [], input_preserved: false, next_action_label: "Check email", next_action_path: null };
  const repository = {
    consumeClaimAttempts: async (buckets) => buckets.length === 2,
    findPaidOrders: async () => [{ id: "order-1", status: "verified_paid" }],
    findSprintActivations: async () => [{ id: "activation-1", offer_handle: OFFER.handle }],
    getReceiptByActivationId: async () => receipt,
    issueReceiptClaim: async (_id, hash) => { if (storedHash) return false; storedHash = hash; return true; },
    consumeReceiptClaim: async (hash) => { if (hash !== storedHash) return null; storedHash = null; return receipt; },
  };
  const issued = await issueClaim({ orderName: "#1042", email: "buyer@example.com", rateLimitKey: "test", pepper, origin: "https://example.com", repository, now });
  const issuedToken = new URLSearchParams(new URL(issued.claimUrl).hash.slice(1)).get("token");
  assert.equal((await redeemClaim({ token: issuedToken, pepper, repository, now: now + 1_000 })).headline, "Verified");
  assert.equal(await redeemClaim({ token: issuedToken, pepper, repository, now: now + 2_000 }), null);
});

test("refund IDs normalize and paid replay cannot reopen terminal status", () => {
  assert.equal(normalizeOrderGid(12345), "gid://shopify/Order/12345");
  assert.equal(normalizeOrderGid("gid://shopify/Order/12345"), "gid://shopify/Order/12345");
  assert.equal(preservesTerminalStatus("cancelled", "verified_paid"), "cancelled");
  assert.equal(preservesTerminalStatus("partially_refunded", "verified_paid"), "partially_refunded");
});

test("Next.js storefront exposes exactly four commerce functions and no browser token storage", async () => {
  const apiEntries = await readdir(new URL("../app/api/", import.meta.url), { withFileTypes: true });
  const routeNames = [];
  for (const entry of apiEntries.filter((candidate) => candidate.isDirectory())) {
    const files = await readdir(new URL(`../app/api/${entry.name}/`, import.meta.url));
    if (files.some((file) => /^route\.[cm]?[jt]s$/.test(file))) routeNames.push(entry.name);
  }
  assert.deepEqual(routeNames.sort(), ["checkout", "claim", "health", "webhook-shopify"]);
  const clientSources = await Promise.all([
    "../app/components/field-vending-machine.tsx",
    "../app/activate/claim-receipt.tsx",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));
  assert.equal(clientSources.join("\n").includes("localStorage"), false);
  assert.match(clientSources[1], /history\.replaceState/);
});
