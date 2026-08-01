export const config = { api: { bodyParser: false } };

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { processVerifiedShopifyEvent, verifyShopifyHmac } from "../../server/storefront/commerce.js";
import { SupabaseCommerceRepository } from "../../server/storefront/supabaseCommerce.js";

const MAX_WEBHOOK_BYTES = 2_000_000;

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_WEBHOOK_BYTES) throw new Error("payload_too_large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

function header(req: VercelRequest, name: string): string {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const secret = process.env.SHOPIFY_APP_CLIENT_SECRET?.trim() || "";
  if (!secret) return res.status(503).json({ error: "webhook_not_configured" });
  try {
    const rawBody = await readRawBody(req);
    if (!verifyShopifyHmac(rawBody, header(req, "x-shopify-hmac-sha256"), secret)) {
      return res.status(401).json({ error: "invalid_signature" });
    }
    const eventId = header(req, "x-shopify-webhook-id").trim();
    const shopDomain = header(req, "x-shopify-shop-domain").trim().toLowerCase();
    const topic = header(req, "x-shopify-topic").trim().toLowerCase();
    if (!eventId || !shopDomain || !topic || eventId.length > 200 || shopDomain.length > 255) {
      return res.status(400).json({ error: "invalid_webhook_headers" });
    }
    const outcome = await processVerifiedShopifyEvent({ rawBody, eventId, shopDomain, topic, repository: new SupabaseCommerceRepository() });
    return res.status(200).json({ received: true, outcome });
  } catch (error) {
    const code = error instanceof Error ? error.message : "webhook_processing_failed";
    console.error("[storefront/shopify-webhook] processing failed", code);
    return res.status(code === "payload_too_large" ? 413 : 500).json({ error: "webhook_processing_failed" });
  }
}
