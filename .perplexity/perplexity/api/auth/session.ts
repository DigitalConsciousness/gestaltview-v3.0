import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthUser } from "../_lib/auth.js";
import { sendJson } from "../_lib/response.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const user = await getAuthUser(req);
  if (!user) {
    sendJson(res, 401, { authenticated: false });
    return;
  }

  sendJson(res, 200, {
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.isAdmin ? "admin" : "user",
    },
    tier: user.tier,
    isAdmin: user.isAdmin,
  });
}
