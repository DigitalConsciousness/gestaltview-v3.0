import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  parsePaidOrder,
  processVerifiedShopifyEvent,
  sha256,
  verifyShopifyHmac,
  type CommerceRepository,
  type ShopifyCommerceTopic,
  type VerifiedOrder,
} from "../storefront/commerce.js";

class MemoryCommerceRepository implements CommerceRepository {
  events = new Set<string>();
  orders: VerifiedOrder[] = [];
  cancelled: string[] = [];
  refunds: Array<{ id: string; full: boolean }> = [];
  finished: string[] = [];
  failures: string[] = [];

  async claimEvent(event: { eventId: string; shopDomain: string; topic: ShopifyCommerceTopic; payloadHash: string }) {
    const key = `${event.shopDomain}:${event.eventId}`;
    if (this.events.has(key)) return "duplicate" as const;
    this.events.add(key);
    return "claimed" as const;
  }
  async processPaidOrder(order: VerifiedOrder) { this.orders.push(order); }
  async processOrderCancelled(input: { externalOrderId: string }) { this.cancelled.push(input.externalOrderId); }
  async processRefund(input: { externalOrderId: string; fullyRefunded: boolean }) { this.refunds.push({ id: input.externalOrderId, full: input.fullyRefunded }); }
  async finishEvent(eventId: string) { this.finished.push(eventId); }
  async failEvent(eventId: string) { this.failures.push(eventId); }
}

describe("Shopify commerce activation boundary", () => {
  it("verifies the raw request body with Shopify HMAC-SHA256", () => {
    const body = Buffer.from('{"id":42,"note":"untouched"}');
    const signature = createHmac("sha256", "secret").update(body).digest("base64");
    expect(verifyShopifyHmac(body, signature, "secret")).toBe(true);
    expect(verifyShopifyHmac(Buffer.from(body.toString().replace("42", "43")), signature, "secret")).toBe(false);
    expect(verifyShopifyHmac(body, "invalid", "secret")).toBe(false);
  });

  it("extracts bounded claims and hashes buyer and activation identifiers", () => {
    const order = parsePaidOrder({
      id: 42,
      name: "#1042",
      email: "Buyer@Example.com",
      currency: "USD",
      current_total_price: "29.00",
      financial_status: "paid",
      line_items: [{ properties: [
        { name: "_gestaltview_offer_handle", value: "field-manual" },
        { name: "_gestaltview_manifest_version", value: "1.0.0" },
        { name: "_gestaltview_activation_token", value: "buyer-secret-token" },
      ] }],
    }, "example.myshopify.com");
    expect(order.externalOrderId).toBe("42");
    expect(order.buyerEmailHash).toBe(sha256("buyer@example.com"));
    expect(JSON.stringify(order)).not.toContain("Buyer@Example.com");
    expect(order.claims).toEqual([{ offerHandle: "field-manual", manifestVersion: "1.0.0", tokenHash: sha256("buyer-secret-token") }]);
  });

  it("processes a paid event once and ignores Shopify retry duplicates", async () => {
    const repository = new MemoryCommerceRepository();
    const rawBody = Buffer.from(JSON.stringify({ id: 42, line_items: [] }));
    const input = { rawBody, eventId: "evt-1", shopDomain: "example.myshopify.com", topic: "orders/paid", repository };
    await expect(processVerifiedShopifyEvent(input)).resolves.toBe("processed");
    await expect(processVerifiedShopifyEvent(input)).resolves.toBe("duplicate");
    expect(repository.orders).toHaveLength(1);
    expect(repository.finished).toEqual(["evt-1"]);
  });

  it("keeps refunds partial unless the delivery explicitly proves a full refund", async () => {
    const repository = new MemoryCommerceRepository();
    await processVerifiedShopifyEvent({ rawBody: Buffer.from(JSON.stringify({ id: 8, order_id: 42, refund_line_items: [{}] })), eventId: "evt-refund", shopDomain: "example.myshopify.com", topic: "refunds/create", repository });
    expect(repository.refunds).toEqual([{ id: "42", full: false }]);
  });

  it("records failure state so processing errors are not silently acknowledged", async () => {
    const repository = new MemoryCommerceRepository();
    await expect(processVerifiedShopifyEvent({ rawBody: Buffer.from("not-json"), eventId: "evt-bad", shopDomain: "example.myshopify.com", topic: "orders/paid", repository })).rejects.toThrow();
    expect(repository.failures).toEqual(["evt-bad"]);
  });
});
