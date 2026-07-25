import type { VercelRequest, VercelResponse } from "@vercel/node";

import { requireAuth } from "../_lib/auth.js";
import { applyCorsHeaders } from "../_lib/cors.js";
import { getInnerWorldSupabaseAdmin } from "../_lib/inner-world.js";
import { sendJson } from "../_lib/response.js";

type ProfilePreferences = {
  displayName: string;
  avatarUrl: string;
  embodimentProfileSlug: string;
};

const DEFAULT_PREFERENCES: ProfilePreferences = {
  displayName: "",
  avatarUrl: "",
  embodimentProfileSlug: "billy",
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizePreferences(value: unknown): ProfilePreferences {
  const record = value && typeof value === "object" ? (value as Partial<ProfilePreferences>) : {};
  const avatarUrl = asString(record.avatarUrl);

  return {
    displayName: asString(record.displayName).slice(0, 120),
    avatarUrl: avatarUrl.startsWith("data:") ? "" : avatarUrl.slice(0, 2048),
    embodimentProfileSlug: asString(record.embodimentProfileSlug, DEFAULT_PREFERENCES.embodimentProfileSlug).slice(0, 120),
  };
}

function buildPreferencesPayload(row: {
  display_name?: string | null;
  avatar_url?: string | null;
  embodiment_profile_slug?: string | null;
} | null): ProfilePreferences {
  if (!row) {
    return DEFAULT_PREFERENCES;
  }

  return {
    displayName: row.display_name ?? "",
    avatarUrl: row.avatar_url ?? "",
    embodimentProfileSlug: row.embodiment_profile_slug ?? DEFAULT_PREFERENCES.embodimentProfileSlug,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCorsHeaders(req, res, {
    methods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const auth = requireAuth(req);
  if ("status" in auth) {
    sendJson(res, auth.status, auth.body);
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const supabase: any = getInnerWorldSupabaseAdmin();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("display_name,avatar_url,embodiment_profile_slug")
      .eq("user_id", auth.id)
      .maybeSingle();

    if (error) {
      sendJson(res, 500, { error: error.message ?? "Failed to load profile preferences." });
      return;
    }

    sendJson(res, 200, { preferences: buildPreferencesPayload(data) });
    return;
  }

  const preferences = normalizePreferences((req.body as { preferences?: unknown } | undefined)?.preferences);

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: auth.id,
        display_name: preferences.displayName,
        avatar_url: preferences.avatarUrl,
        embodiment_profile_slug: preferences.embodimentProfileSlug,
      },
      { onConflict: "user_id" },
    )
    .select("display_name,avatar_url,embodiment_profile_slug")
    .single();

  if (error || !data) {
    sendJson(res, 500, { error: error?.message ?? "Failed to save profile preferences." });
    return;
  }

  sendJson(res, 200, { preferences: buildPreferencesPayload(data) });
}
