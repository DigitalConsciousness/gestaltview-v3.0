import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth";
import { provisionCollaborator } from "../../server/collaborators/provision";

function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function isServiceRoleBootstrapToken(token: string | null): boolean {
  if (!token) return false;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) return false;
  return token === serviceRoleKey;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const bearerToken = getBearerToken(req);

  if (!isServiceRoleBootstrapToken(bearerToken)) {
    const admin = await requireAdmin(req);
    if ("status" in admin) {
      return res.status(admin.status).json(admin.body);
    }
  }

  try {
    const collaborator = await provisionCollaborator(req.body);
    return res.status(200).json({
      ok: true,
      collaborator,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Provisioning failed";
    return res.status(500).json({
      ok: false,
      error: message,
    });
  }
}
