// api/_lib/user.ts — GestaltView v2
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest } from "@vercel/node";

const DEFAULT_USER_ID = "guest-user";

export function getUserId(
  req:  VercelRequest,
  body: Record<string, unknown>
): string {
  const value =
    (typeof body.userId          === "string" ? body.userId          : null) ||
    (typeof req.headers["x-user-id"] === "string" ? req.headers["x-user-id"] as string : null) ||
    (typeof req.query.userId     === "string" ? req.query.userId     : null);

  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_USER_ID;
}
