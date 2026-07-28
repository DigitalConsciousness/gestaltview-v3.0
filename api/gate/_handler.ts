import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import { withSentryVercelHandler } from "../_lib/sentry.js";
import {
  attachStripeSessionToOrder,
  applyGateSidekickAction,
  createGateDraft,
  createGateOrderForCheckout,
  createGateSupportRequest,
  getGateDraft,
  getGateOrderDetail,
  markGateOrderPaid,
  redeemGateArtifactAccess,
  regenerateGateBuildJob,
  resolveGateDownload,
  runGateBuildJob,
  sendGateSidekickMessage,
  updateGateDraft,
  validateGateDraft,
} from "../../server/gate/service.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || "";
const stripeWebhookSecret = process.env.STRIPE_GATE_WEBHOOK_SECRET?.trim() || "";

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    })
  : null;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawRequestBody(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string") {
    return Buffer.from(req.body);
  }
  if (req.body && typeof req.body === "object") {
    return Buffer.from(JSON.stringify(req.body));
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function parseJsonRequestBody(rawBody: Buffer): unknown {
  if (rawBody.length === 0) {
    return {};
  }

  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function nowOrigin(req: VercelRequest): string {
  const forwardedProto =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim() ||
    "https";
  const host =
    (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim() ||
    req.headers.host ||
    "localhost:3000";
  return `${forwardedProto}://${host}`;
}

function resolvePathSegments(req: VercelRequest): string[] {
  const value = req.query.path;
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function allowOptions(req: VercelRequest, res: VercelResponse): boolean {
  applyCorsHeaders(req, res, {
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Stripe-Signature", "X-Gate-Admin-Key"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  return false;
}

function isProductionLikeEnvironment(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function isAdminRequest(req: VercelRequest): boolean {
  const configuredKey = process.env.GATE_ADMIN_KEY?.trim() || "";
  if (!configuredKey) {
    return !isProductionLikeEnvironment();
  }

  return req.headers["x-gate-admin-key"] === configuredKey;
}

async function handleCheckout(req: VercelRequest, res: VercelResponse) {
  const { analysis, buyer, order, accessToken } =
    await createGateOrderForCheckout(req.body ?? {});

  if (analysis.compatibility.checkoutMode === "request_review") {
    sendJson(res, 202, {
      mode: "manual_review",
      orderId: order.id,
      accessToken,
      url: null,
      sessionId: null,
      redirectUrl: `/agent-trainer/orders/${order.id}?access=${encodeURIComponent(
        accessToken
      )}`,
    });
    return;
  }

  const body = (req.body ?? {}) as {
    successUrl?: string;
    cancelUrl?: string;
    mockPayment?: boolean;
  };
  const origin = nowOrigin(req);
  const successBase =
    body.successUrl ??
    `${origin}/agent-trainer/orders/${order.id}?success=1&session_id={CHECKOUT_SESSION_ID}`;
  const successUrl = `${successBase}${
    successBase.includes("?") ? "&" : "?"
  }access=${encodeURIComponent(accessToken)}`;
  const cancelUrl =
    body.cancelUrl ??
    `${origin}/agent-trainer/package-builder?draft=${analysis.draft.id}&canceled=true`;
  const productionLike = isProductionLikeEnvironment();

  if (productionLike && !stripe) {
    sendJson(res, 503, {
      error: "gate_payment_not_configured",
      message: "GATE checkout requires Stripe configuration in production.",
    });
    return;
  }

  if (body.mockPayment === true && !isAdminRequest(req)) {
    sendJson(res, 403, {
      error: "gate_admin_key_required",
      message: "Mock checkout requires the configured GATE admin key.",
    });
    return;
  }

  const stripeClient = stripe;
  const forceMock = (body.mockPayment === true && isAdminRequest(req)) || (!stripeClient && !productionLike);

  if (forceMock) {
    const { buildJob } = await markGateOrderPaid(order.id, "simulated-payment");
    await runGateBuildJob(buildJob.id);
    sendJson(res, 202, {
      mode: "simulated",
      orderId: order.id,
      accessToken,
      url: null,
      sessionId: "simulated-session",
      redirectUrl: `/agent-trainer/orders/${order.id}?access=${encodeURIComponent(
        accessToken
      )}`,
    });
    return;
  }

  if (!stripeClient) {
    sendJson(res, 503, {
      error: "gate_payment_not_configured",
      message: "GATE checkout requires Stripe configuration.",
    });
    return;
  }

  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    client_reference_id: order.id,
    customer_email: buyer.email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: analysis.quote.currency,
          unit_amount: analysis.quote.totalCents,
          product_data: {
            name: `GestaltView Bespoke Package · ${analysis.draft.companyName ?? buyer.email}`,
            description: `${analysis.draft.tier} · ${analysis.draft.backend} · ${analysis.draft.deliverySurfaces.join(", ")}`,
          },
        },
      },
    ],
    metadata: {
      order_id: order.id,
      draft_id: analysis.draft.id,
      config_hash: analysis.draft.configHash,
      buyer_email: buyer.email,
    },
  });

  await attachStripeSessionToOrder(order.id, session.id);

  sendJson(res, 200, {
    mode: "stripe",
    orderId: order.id,
    accessToken,
    url: session.url,
    sessionId: session.id,
    redirectUrl: null,
  });
}

async function handleStripeWebhook(
  req: VercelRequest,
  res: VercelResponse,
  rawBody: Buffer
) {
  if (!stripe || !stripeWebhookSecret) {
    sendJson(res, 400, { error: "Stripe webhook configuration is missing." });
    return;
  }

  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string" || !signature.trim()) {
    sendJson(res, 400, { error: "Missing Stripe signature." });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret
    );
  } catch (error) {
    sendJson(res, 400, {
      error: error instanceof Error ? error.message : "Webhook verification failed.",
    });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Record<string, unknown>;
    const metadata =
      typeof session.metadata === "object" && session.metadata
        ? (session.metadata as Record<string, string | undefined>)
        : {};
    const orderId =
      metadata.order_id?.trim() ||
      (typeof session.client_reference_id === "string"
        ? session.client_reference_id.trim()
        : "") ||
      "";

    if (!orderId) {
      sendJson(res, 400, { error: "Webhook session is missing order metadata." });
      return;
    }

    const { buildJob } = await markGateOrderPaid(
      orderId,
      typeof session.payment_intent === "string" ? session.payment_intent : null
    );
    await runGateBuildJob(buildJob.id);
  }

  sendJson(res, 200, { received: true });
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (allowOptions(req, res)) {
    return;
  }

  try {
    const segments = resolvePathSegments(req);
    const isStripeWebhook =
      segments.length === 2 &&
      segments[0] === "webhooks" &&
      segments[1] === "stripe" &&
      req.method === "POST";
    const needsBody =
      req.method === "POST" || req.method === "PATCH" || isStripeWebhook;
    const rawBody = needsBody ? await readRawRequestBody(req) : Buffer.alloc(0);

    if (isStripeWebhook) {
      await handleStripeWebhook(req, res, rawBody);
      return;
    }

    if (needsBody) {
      req.body = parseJsonRequestBody(rawBody);
    }

    if (segments.length === 1 && segments[0] === "checkout" && req.method === "POST") {
      await handleCheckout(req, res);
      return;
    }

    if (segments.length === 1 && segments[0] === "support-request" && req.method === "POST") {
      const supportRequest = await createGateSupportRequest(req.body ?? {});
      sendJson(res, 201, { supportRequest });
      return;
    }

    if (segments.length === 1 && segments[0] === "drafts" && req.method === "POST") {
      const analysis = await createGateDraft(req.body ?? {});
      sendJson(res, 201, { analysis });
      return;
    }

    if (segments.length === 2 && segments[0] === "drafts" && req.method === "GET") {
      const analysis = await getGateDraft(segments[1]!);
      sendJson(res, 200, { analysis });
      return;
    }

    if (segments.length === 2 && segments[0] === "drafts" && req.method === "PATCH") {
      const analysis = await updateGateDraft(segments[1]!, req.body ?? {});
      sendJson(res, 200, { analysis });
      return;
    }

    if (
      segments.length === 3 &&
      segments[0] === "drafts" &&
      segments[2] === "sidekick" &&
      req.method === "POST"
    ) {
      const analysis = await sendGateSidekickMessage(segments[1]!, req.body ?? {});
      sendJson(res, 200, { analysis });
      return;
    }

    if (
      segments.length === 5 &&
      segments[0] === "drafts" &&
      segments[2] === "sidekick" &&
      segments[3] === "actions" &&
      segments[4] &&
      req.method === "POST"
    ) {
      const analysis = await applyGateSidekickAction(segments[1]!, segments[4]!);
      sendJson(res, 200, { analysis });
      return;
    }

    if (
      segments.length === 3 &&
      segments[0] === "drafts" &&
      segments[2] === "validate" &&
      req.method === "POST"
    ) {
      const analysis = await validateGateDraft(segments[1]!);
      sendJson(res, 200, { analysis });
      return;
    }

    if (segments.length === 2 && segments[0] === "orders" && req.method === "GET") {
      const accessToken =
        typeof req.query.access === "string" ? req.query.access.trim() : "";
      if (!accessToken) {
        sendJson(res, 401, { error: "Order access token is required." });
        return;
      }

      const order = await getGateOrderDetail(segments[1]!, accessToken);
      sendJson(res, 200, { order });
      return;
    }

    if (
      segments.length === 3 &&
      segments[0] === "orders" &&
      segments[2] === "redeem" &&
      req.method === "POST"
    ) {
      const redemption = await redeemGateArtifactAccess(segments[1]!, req.body ?? {});
      sendJson(res, 200, redemption);
      return;
    }

    if (
      segments.length === 3 &&
      segments[0] === "orders" &&
      segments[2] === "download" &&
      req.method === "GET"
    ) {
      const token = typeof req.query.token === "string" ? req.query.token : "";
      const { artifact, file } = await resolveGateDownload(segments[1]!, token);
      res.status(200);
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${artifact.storagePath.split("/").pop() ?? "gate-package.zip"}"`
      );
      res.end(file);
      return;
    }

    if (
      segments.length === 3 &&
      segments[0] === "build-jobs" &&
      segments[2] === "run" &&
      req.method === "POST"
    ) {
      if (!isAdminRequest(req)) {
        sendJson(res, 401, { error: "Admin authorization required." });
        return;
      }
      const buildJob = await runGateBuildJob(segments[1]!);
      sendJson(res, 200, { buildJob });
      return;
    }

    if (
      segments.length === 3 &&
      segments[0] === "build-jobs" &&
      segments[2] === "regenerate" &&
      req.method === "POST"
    ) {
      if (!isAdminRequest(req)) {
        sendJson(res, 401, { error: "Admin authorization required." });
        return;
      }
      const buildJob = await regenerateGateBuildJob(segments[1]!);
      sendJson(res, 200, { buildJob });
      return;
    }

    sendJson(res, 404, { error: "Unknown GATE endpoint." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GATE request failed.";
    sendJson(res, message === "Order access denied." ? 401 : 500, {
      error: message,
    });
  }
}

export default withSentryVercelHandler(handler, "/api/gate", {
  captureHandledResponseErrors: false,
});
