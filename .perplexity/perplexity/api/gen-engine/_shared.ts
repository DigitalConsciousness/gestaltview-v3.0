import type { VercelRequest, VercelResponse } from "@vercel/node";

import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";

export function prepareJsonRoute(
  req: VercelRequest,
  res: VercelResponse,
  methods: string[],
): boolean {
  applyCorsHeaders(req, res, {
    methods: [...methods, "OPTIONS"],
    allowHeaders: ["Content-Type"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  if (!req.method || !methods.includes(req.method)) {
    sendJson(res, 405, { error: "Method not allowed" });
    return true;
  }

  return false;
}

export function readBody<T>(req: VercelRequest): T {
  return (req.body ?? {}) as T;
}
