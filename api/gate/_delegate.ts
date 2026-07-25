import type { VercelRequest, VercelResponse } from "@vercel/node";

import gateHandler from "./_handler.js";

export function extractGateRouteParam(
  value: string | string[] | undefined,
  key: string
): string {
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved?.trim()) {
    throw new Error(`Missing route parameter: ${key}`);
  }

  return resolved.trim();
}

export function delegateGateRequest(
  req: VercelRequest,
  res: VercelResponse,
  path: string[]
) {
  req.query = {
    ...req.query,
    path,
  };

  return gateHandler(req, res);
}
