import type { VercelRequest, VercelResponse } from "@vercel/node";

import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";
import { getStorefrontCatalog } from "../../server/storefront/shopify.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, { methods: ["GET", "OPTIONS"] });
  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

  try {
    return sendJson(res, 200, await getStorefrontCatalog());
  } catch (error) {
    console.error("[storefront/catalog] catalog unavailable", error instanceof Error ? error.message : "unknown error");
    return sendJson(res, 503, {
      error: "The artifact catalog is temporarily unavailable.",
      recoveryPath: "/store",
    });
  }
}
