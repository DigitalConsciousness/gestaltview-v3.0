import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson } from "../_lib/response.js";
import { invokeRpc } from "../_lib/supabase.js";
import type { PersonalityProfile } from "../../shared/profileIngestion.js";
import type { ProfilePortrait } from "../../shared/profilePortrait.js";
import {
  loadLatestPersistedPortraitRecord,
  loadProfilePortraitForUser,
} from "../_lib/profilePortrait.js";
import { recordPortraitRenderEvent } from "../_lib/profilePortraitPersistence.js";

export interface PersonalityProfileResponse {
  profile: PersonalityProfile;
  portrait: ProfilePortrait | null;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    // Get authenticated user ID from auth header or session
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }

    const userId = Array.isArray(req.query.userId) ? req.query.userId[0] ?? "" : String(req.query.userId ?? "");
    const contextFraming = Array.isArray(req.query.contextFraming)
      ? req.query.contextFraming[0] ?? ""
      : String(req.query.contextFraming ?? "");

    // Call RPC to fetch user's personality profile
    const profile = await invokeRpc<PersonalityProfile>("get_user_personality_profile", {
      user_id: userId,
    }).catch(() => ({
      dimensions: [],
      keyThemes: [],
      unresolvedTensions: [],
      coreNarrative: "",
    }));
    const persistedPortraitRecord = userId ? await loadLatestPersistedPortraitRecord(userId) : null;
    const portrait =
      persistedPortraitRecord?.portrait ??
      (userId ? await loadProfilePortraitForUser(userId, profile || undefined, "manual", null, undefined, contextFraming) : null);

    if (userId && persistedPortraitRecord) {
      void recordPortraitRenderEvent(userId, persistedPortraitRecord.id, "view", {
        surface: "api/profile/personality",
      }).catch(() => undefined);
    }

    sendJson(res, 200, {
      profile: profile || {
        dimensions: [],
        keyThemes: [],
        unresolvedTensions: [],
        coreNarrative: "",
      },
      portrait,
    });
  } catch (error) {
    console.error("[personality endpoint] error:", error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Internal server error",
      profile: {
        dimensions: [],
        keyThemes: [],
        unresolvedTensions: [],
        coreNarrative: "",
      } as PersonalityProfile,
      portrait: null,
    });
  }
}
