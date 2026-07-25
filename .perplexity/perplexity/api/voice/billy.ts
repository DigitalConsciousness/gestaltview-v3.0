// GestaltView v2 — Billy Voice API
// © 2026 Keith Soyka / GestaltView

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCorsHeaders } from "../_lib/cors.js";
import { traceBraintrust } from "../../instrument.js";

interface BillyVoiceRequestBody {
  text?: string;
}

const DEFAULT_CORS_ORIGIN = "https://gestaltview-digital-intelligence.vercel.app";
const ELEVENLABS_API_KEY =
  process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY || "";
const ELEVENLABS_BILLY_VOICE_ID =
  process.env.ELEVENLABS_BILLY_VOICE_ID ||
  process.env.VITE_ELEVENLABS_VOICE_ID ||
  "JBFqnCBsd6RMkjVDRZzb";
const ELEVENLABS_TTS_MODEL = process.env.ELEVENLABS_TTS_MODEL || "eleven_multilingual_v2";

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

  if (!ELEVENLABS_API_KEY) {
    res.status(503).json({ error: "ELEVENLABS_API_KEY is not configured." });
    return;
  }

  const body = (req.body || {}) as BillyVoiceRequestBody;
  const text = body.text?.trim();

  if (!text) {
    res.status(400).json({ error: "Text is required." });
    return;
  }

  try {
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
            voiceId: ELEVENLABS_BILLY_VOICE_ID,
            model: ELEVENLABS_TTS_MODEL,
          },
        });

        return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_BILLY_VOICE_ID}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: text.slice(0, 2400),
            model_id: ELEVENLABS_TTS_MODEL,
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.8,
              style: 0.35,
              use_speaker_boost: true,
            },
          }),
        });
      }
    );

    if (!response.ok) {
      const details = await response.text();
      res.status(response.status).json({ error: details || "ElevenLabs TTS request failed." });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", response.headers.get("content-type") || "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
}
