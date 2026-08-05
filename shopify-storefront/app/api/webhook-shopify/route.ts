import { buildWebhookCommand } from "@/lib/commerce.mjs";
import { assertExactEnvironment, EXPECTED_STORE_DOMAIN } from "@/lib/offer.mjs";
import { verifyShopifyHmac } from "@/lib/security.mjs";
import { createSupabaseRepository } from "@/lib/supabase.mjs";

export const runtime = "nodejs";
export const MAX_SHOPIFY_WEBHOOK_BYTES = 1024 * 1024;

function json(body: object, status = 200, headers: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: Request) {
  try {
    assertExactEnvironment(process.env);
    const declaredLength = request.headers.get("content-length");
    if (declaredLength !== null && !/^\d+$/.test(declaredLength)) {
      return json({ error: "Invalid content length." }, 400);
    }
    if (declaredLength !== null && Number(declaredLength) > MAX_SHOPIFY_WEBHOOK_BYTES) {
      return json({ error: "Webhook body is too large." }, 413);
    }

    // Shopify signs the exact request bytes. Parse only after this check passes.
    const rawBody = Buffer.from(await request.arrayBuffer());
    if (rawBody.byteLength > MAX_SHOPIFY_WEBHOOK_BYTES) {
      return json({ error: "Webhook body is too large." }, 413);
    }
    if (!verifyShopifyHmac(
      rawBody,
      request.headers.get("x-shopify-hmac-sha256"),
      process.env.SHOPIFY_APP_CLIENT_SECRET,
    )) {
      return json({ error: "Signature verification failed." }, 401);
    }

    const shopDomain = request.headers.get("x-shopify-shop-domain");
    if (shopDomain !== EXPECTED_STORE_DOMAIN) {
      return json({ error: "Shop verification failed." }, 401);
    }
    let payload: unknown;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return json({ error: "Invalid webhook body." }, 400);
    }
    const command = buildWebhookCommand({
      topic: request.headers.get("x-shopify-topic"),
      eventId: request.headers.get("x-shopify-webhook-id"),
      shopDomain,
      payload,
      rawBody,
    });
    if (command.action === "unsupported") {
      return json({ received: true, status: "unsupported" });
    }
    const result = await createSupabaseRepository(process.env).processWebhookEvent(command);
    if (!result || result.status === "failed") {
      return json({ error: "Webhook processing failed safely." }, 500);
    }
    return json({ received: true, status: result.status });
  } catch {
    return json({ error: "Webhook processing failed safely." }, 500);
  }
}
