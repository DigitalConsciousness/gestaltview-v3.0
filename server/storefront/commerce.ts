import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SHOPIFY_COMMERCE_TOPICS = ["orders/paid", "orders/cancelled", "refunds/create"] as const;
export type ShopifyCommerceTopic = (typeof SHOPIFY_COMMERCE_TOPICS)[number];

export type ActivationClaim = {
  offerHandle: string;
  manifestVersion: string;
  tokenHash: string | null;
};

export type VerifiedOrder = {
  shopDomain: string;
  externalOrderId: string;
  orderName: string | null;
  buyerEmailHash: string | null;
  currency: string | null;
  totalAmount: number | null;
  financialStatus: string | null;
  paidAt: string | null;
  summary: Record<string, unknown>;
  claims: ActivationClaim[];
};

export interface CommerceRepository {
  claimEvent(event: { eventId: string; shopDomain: string; topic: ShopifyCommerceTopic; payloadHash: string }): Promise<"claimed" | "duplicate">;
  processPaidOrder(order: VerifiedOrder): Promise<void>;
  processOrderCancelled(input: { shopDomain: string; externalOrderId: string; cancelledAt: string | null }): Promise<void>;
  processRefund(input: { shopDomain: string; externalOrderId: string; fullyRefunded: boolean }): Promise<void>;
  finishEvent(eventId: string, shopDomain: string, status: "processed" | "ignored"): Promise<void>;
  failEvent(eventId: string, shopDomain: string, code: string, detail: string): Promise<void>;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function verifyShopifyHmac(rawBody: Buffer, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  let received: Buffer;
  try {
    received = Buffer.from(signature, "base64");
  } catch {
    return false;
  }
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function text(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function propertyValue(line: Record<string, unknown>, name: string): string | null {
  const properties = Array.isArray(line.properties) ? line.properties : [];
  for (const candidate of properties) {
    const property = record(candidate);
    if (text(property.name) === name) return text(property.value);
  }
  return null;
}

export function parsePaidOrder(payload: Record<string, unknown>, shopDomain: string): VerifiedOrder {
  const externalOrderId = text(payload.admin_graphql_api_id) || text(payload.id);
  if (!externalOrderId) throw new Error("missing_order_id");
  const email = text(payload.contact_email) || text(payload.email);
  const claims: ActivationClaim[] = [];
  for (const entry of Array.isArray(payload.line_items) ? payload.line_items : []) {
    const line = record(entry);
    const offerHandle = propertyValue(line, "_gestaltview_offer_handle") || propertyValue(line, "gestaltview_offer_handle");
    if (!offerHandle) continue;
    const token = propertyValue(line, "_gestaltview_activation_token") || propertyValue(line, "gestaltview_activation_token");
    claims.push({
      offerHandle,
      manifestVersion: propertyValue(line, "_gestaltview_manifest_version") || propertyValue(line, "gestaltview_manifest_version") || "1.0.0",
      tokenHash: token ? sha256(token) : null,
    });
  }
  const total = Number(text(payload.current_total_price) || text(payload.total_price));
  return {
    shopDomain,
    externalOrderId,
    orderName: text(payload.name),
    buyerEmailHash: email ? sha256(email.toLowerCase()) : null,
    currency: text(payload.currency),
    totalAmount: Number.isFinite(total) && total >= 0 ? total : null,
    financialStatus: text(payload.financial_status),
    paidAt: text(payload.processed_at) || text(payload.created_at),
    summary: { lineItemCount: Array.isArray(payload.line_items) ? payload.line_items.length : 0, claimCount: claims.length },
    claims,
  };
}

export async function processVerifiedShopifyEvent(input: {
  rawBody: Buffer;
  eventId: string;
  shopDomain: string;
  topic: string;
  repository: CommerceRepository;
}): Promise<"processed" | "duplicate" | "ignored"> {
  if (!SHOPIFY_COMMERCE_TOPICS.includes(input.topic as ShopifyCommerceTopic)) return "ignored";
  const topic = input.topic as ShopifyCommerceTopic;
  const claimed = await input.repository.claimEvent({ eventId: input.eventId, shopDomain: input.shopDomain, topic, payloadHash: sha256(input.rawBody.toString("utf8")) });
  if (claimed === "duplicate") return "duplicate";
  try {
    const payload = record(JSON.parse(input.rawBody.toString("utf8")));
    if (topic === "orders/paid") {
      await input.repository.processPaidOrder(parsePaidOrder(payload, input.shopDomain));
    } else if (topic === "orders/cancelled") {
      const externalOrderId = text(payload.admin_graphql_api_id) || text(payload.id);
      if (!externalOrderId) throw new Error("missing_order_id");
      await input.repository.processOrderCancelled({ shopDomain: input.shopDomain, externalOrderId, cancelledAt: text(payload.cancelled_at) });
    } else {
      const externalOrderId = text(payload.order_id);
      if (!externalOrderId) throw new Error("missing_order_id");
      // refunds/create does not normally contain enough order-level context to
      // prove a full refund. Default to partial/review unless an upstream
      // normalized delivery explicitly supplies full_refund=true.
      const fullyRefunded = payload.full_refund === true;
      await input.repository.processRefund({ shopDomain: input.shopDomain, externalOrderId, fullyRefunded });
    }
    await input.repository.finishEvent(input.eventId, input.shopDomain, "processed");
    return "processed";
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown_error";
    await input.repository.failEvent(input.eventId, input.shopDomain, "processing_failed", detail);
    throw error;
  }
}
