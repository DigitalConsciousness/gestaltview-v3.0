import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAdmin, requireFounderOrAdmin, type AuthUser } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { sendJson } from "../_lib/response.js";

export async function requireTrainerAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthUser | null> {
  const auth = await requireFounderOrAdmin(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return null;
  }

  return auth;
}

export async function requireTrainerGovernanceAdmin(
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthUser | null> {
  const auth = await requireFounderOrAdmin(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return null;
  }

  return auth;
}

export function handleTrainerOptions(
  req: VercelRequest,
  res: VercelResponse,
  methods: string[]
): boolean {
  applyCorsHeaders(req, res, {
    methods: [...methods, "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }

  return false;
}

export function extractRouteParam(
  value: string | string[] | undefined,
  key: string
): string {
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved?.trim()) {
    throw new Error(`Missing route parameter: ${key}`);
  }

  return resolved.trim();
}

export function shouldInlineTrainerExecution(): boolean {
  return process.env.TRAINER_INLINE_EXECUTION === "true";
}
