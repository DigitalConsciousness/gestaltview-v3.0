// GestaltView v2 — Billy Voice API
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { applyCorsHeaders } from "../_lib/cors.js";
import { getVoiceProfile } from "../_lib/supabase.js";
import { traceBraintrust } from "../../instrument.js";

interface BillyVoiceRequestBody {
  text?: string;
  profileSlug?: string;
}

interface DeepgramVoiceProfile {
  tts_model?: string;
  speed?: number;
}

interface DeepgramVoiceRegistry {
  defaults?: DeepgramVoiceProfile;
  profiles?: Record<string, DeepgramVoiceProfile>;
}

const DEFAULT_CORS_ORIGIN = "https://gestaltview-digital-intelligence.vercel.app";
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || "";
const DEEPGRAM_BILLY_TTS_MODEL = process.env.DEEPGRAM_BILLY_TTS_MODEL || "aura-2-aries-en";
const DEEPGRAM_BILLY_TTS_SPEED = Number.parseFloat(process.env.DEEPGRAM_BILLY_TTS_SPEED || "0.98");
const VOICE_PROFILE_SLUG = process.env.VOICE_PROFILE_SLUG || "billy";
const VOICE_TEXT_LIMIT = 1800;
const VOICE_REGISTRY_PATH = new URL("../../config/deepgram_voice_profiles.json", import.meta.url);

function loadVoiceRegistry(): DeepgramVoiceRegistry | null {
  try {
    return JSON.parse(readFileSync(fileURLToPath(VOICE_REGISTRY_PATH), "utf-8")) as DeepgramVoiceRegistry;
  } catch {
    return null;
  }
}

async function resolveVoiceProfile(profileSlugOverride?: string): Promise<{
  model: string;
  speed: number;
  slug: string;
  displayName: string;
}> {
  const profileSlug = profileSlugOverride?.trim() || VOICE_PROFILE_SLUG;
  const persistedProfile = await getVoiceProfile(profileSlug);
  if (persistedProfile) {
    const stylePreset = persistedProfile.style_preset as { pace?: unknown };
    const providerConfig = persistedProfile.provider_config as { speed?: unknown };
    const resolvedSpeed = Number(
      providerConfig.speed ?? stylePreset.pace ?? process.env.DEEPGRAM_BILLY_TTS_SPEED ?? 0.98
    );

    return {
      slug: persistedProfile.profile_slug,
      displayName: persistedProfile.display_name,
      model: persistedProfile.tts_model || DEEPGRAM_BILLY_TTS_MODEL,
      speed: Number.isFinite(resolvedSpeed) ? resolvedSpeed : DEEPGRAM_BILLY_TTS_SPEED,
    };
  }

  const registry = loadVoiceRegistry();
  const profiles = registry?.profiles ?? {};
  const selected = profiles[profileSlug] ?? profiles.billy ?? registry?.defaults ?? {};
  return {
    slug: profileSlug,
    displayName: profileSlug,
    model: selected.tts_model || DEEPGRAM_BILLY_TTS_MODEL,
    speed: Number.isFinite(selected.speed) ? Number(selected.speed) : DEEPGRAM_BILLY_TTS_SPEED,
  };
}

type BraintrustSpan = {
  log: (payload: Record<string, unknown>) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCorsHeaders(req, res, {
    methods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    defaultOrigin: DEFAULT_CORS_ORIGIN,
  });

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!DEEPGRAM_API_KEY) {
    res.status(503).json({ error: "DEEPGRAM_API_KEY is not configured." });
    return;
  }

  const body = (req.body || {}) as BillyVoiceRequestBody;
  const text = body.text?.trim();

  if (!text) {
    res.status(400).json({ error: "Text is required." });
    return;
  }

  try {
    const profile = await resolveVoiceProfile(body.profileSlug);
    const response = await traceBraintrust(
      {
        name: "billy voice tts",
        type: "task",
        metadata: {
          route: "/api/voice/billy",
          method: req.method,
        },
      },
      async (span: BraintrustSpan | null) => {
        span?.log({
          input: text,
          metadata: {
            profileSlug: profile.slug,
            profileDisplayName: profile.displayName,
            model: profile.model,
            speed: profile.speed,
          },
        });

        return fetch(
          `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(profile.model)}&encoding=linear16&container=wav&sample_rate=24000&speed=${encodeURIComponent(profile.speed.toFixed(2))}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${DEEPGRAM_API_KEY}`,
              Accept: "audio/wav",
            },
            body: JSON.stringify({
              text: text.slice(0, VOICE_TEXT_LIMIT),
            }),
          }
        );
      }
    );

    if (!response.ok) {
      const details = await response.text();
      res.status(response.status).json({ error: details || "Deepgram TTS request failed." });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", response.headers.get("content-type") || "audio/wav");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
}
