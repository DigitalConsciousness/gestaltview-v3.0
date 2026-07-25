import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearAdminSessionCookie } from "./_lib/auth.js";
import { sendJson } from "./_lib/response.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  res.setHeader("Set-Cookie", clearAdminSessionCookie());
  sendJson(res, 200, { ok: true });
}
