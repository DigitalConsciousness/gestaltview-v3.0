import type { VercelRequest, VercelResponse } from "@vercel/node";

import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import { sha256 } from "../../server/storefront/commerce.js";
import { findActivationReceipt } from "../../server/storefront/supabaseCommerce.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, { methods: ["GET", "OPTIONS"] });
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return sendJson(res, 405, { error: "method_not_allowed" });
  const token = typeof req.query.token === "string" ? req.query.token.trim() : "";
  if (!/^[A-Za-z0-9_-]{32,160}$/.test(token)) return sendJson(res, 400, { error: "invalid_receipt_token" });
  try {
    const receipt = await findActivationReceipt(sha256(token));
    if (!receipt) return sendJson(res, 404, { error: "receipt_not_found", known: false, inputPreserved: false, nextAction: "/contact" });
    return sendJson(res, 200, { receipt });
  } catch (error) {
    console.error("[storefront/activation-receipt] lookup failed", error instanceof Error ? error.message : "unknown");
    return sendJson(res, 503, { error: "receipt_temporarily_unavailable", inputPreserved: true, nextAction: "/contact" });
  }
}
