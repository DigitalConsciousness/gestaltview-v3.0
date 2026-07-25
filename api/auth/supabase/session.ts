import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { hasFounderOrAdminAccess, createAuthSessionCookie } from "../../_lib/auth.js";
import { sendJson } from "../../_lib/response.js";
import { getSupabaseProjectUrl } from "../../_lib/supabaseOidc.js";

function getSupabaseServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

function readBody(body: unknown): { accessToken?: string; redirectTo?: string } {
  if (!body || typeof body !== "object") {
    return {};
  }

  return body as { accessToken?: string; redirectTo?: string };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const projectUrl = getSupabaseProjectUrl();
  const serviceKey = getSupabaseServiceKey();

  if (!projectUrl || !serviceKey) {
    sendJson(res, 500, { error: "Supabase session sync is not configured." });
    return;
  }

  const body = readBody(req.body);
  const accessToken = body.accessToken?.trim() || "";
  const redirectTo = body.redirectTo?.trim() || "/";

  if (!accessToken) {
    sendJson(res, 400, { error: "accessToken is required" });
    return;
  }

  const supabase = createClient(projectUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user?.email) {
    sendJson(res, 401, {
      error: error?.message || "Supabase session could not be verified.",
    });
    return;
  }

  const email = data.user.email.trim().toLowerCase();
  const userId = data.user.id;
  const role = hasFounderOrAdminAccess({ email, isAdmin: false }) ? "admin" : "user";
  const cookie = createAuthSessionCookie(email, userId, role);

  res.setHeader("Set-Cookie", cookie);
  sendJson(res, 200, {
    authenticated: true,
    user: {
      id: userId,
      email,
      role,
    },
    redirectTo,
  });
}
