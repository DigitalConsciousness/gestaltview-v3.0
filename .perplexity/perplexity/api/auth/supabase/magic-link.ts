import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { getFounderAdminEmails } from "../../_lib/auth.js";
import { sendJson } from "../../_lib/response.js";
import { getSupabaseProjectUrl } from "../../_lib/supabaseOidc.js";

function readAllowlist(): string[] {
  const raw =
    process.env.MAGIC_LINK_ALLOWLIST?.trim() ||
    process.env.SUPABASE_MAGIC_LINK_ALLOWLIST?.trim() ||
    "";

  const allowlist = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.length > 0 ? allowlist : getFounderAdminEmails();
}

function getSupabaseServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

function readBody(body: unknown): { email?: string; redirectTo?: string } {
  if (!body || typeof body !== "object") {
    return {};
  }

  return body as { email?: string; redirectTo?: string };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const projectUrl = getSupabaseProjectUrl();
  const serviceKey = getSupabaseServiceKey();

  if (!projectUrl || !serviceKey) {
    sendJson(res, 500, { error: "Supabase magic-link delivery is not configured." });
    return;
  }

  const body = readBody(req.body);
  const email = body.email?.trim().toLowerCase() || "";
  const redirectTo = body.redirectTo?.trim() || `${projectUrl}/auth/callback`;

  if (!email) {
    sendJson(res, 400, { error: "email is required" });
    return;
  }

  const allowlist = readAllowlist();
  if (allowlist.length === 0) {
    sendJson(res, 400, {
      error: "Magic-link allowlist is not configured. Set MAGIC_LINK_ALLOWLIST first.",
    });
    return;
  }

  if (!allowlist.includes(email)) {
    sendJson(res, 403, {
      error: "This email is not allowed to receive a magic link.",
    });
    return;
  }

  const supabase = createClient(projectUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const authClient = supabase.auth as any;
  const { error } = await authClient.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: false,
    },
  });

  if (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    sentTo: email,
  });
}
