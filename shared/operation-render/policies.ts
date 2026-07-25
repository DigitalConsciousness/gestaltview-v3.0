import { EMBODIMENT_PROFILES, GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS, resolveEmbodimentSlug } from "../embodiment/index.js";
import type { EmbodimentReasoningPolicy, VoiceProfile } from "./contracts.js";

const PROFILE_DEFAULTS: Record<string, Partial<EmbodimentReasoningPolicy>> = {
  billy: {
    defaultDepth: "deep",
    canBrowse: true,
    canUseRepoTools: true,
    toolPermission: "read_only",
    roomContextBiases: ["preserve exact language", "separate fact from inference"],
  },
  "the-guardian": {
    defaultDepth: "standard",
    uncertaintyMode: "explicit",
    safetyNotes: ["Prefer consent, containment, and clear recovery paths."],
  },
  "the-architect": {
    defaultDepth: "forensic",
    canUseRepoTools: true,
    citationMode: "always_when_external",
  },
  "art-teacher": {
    defaultDepth: "standard",
    canUseHuggingFaceTools: true,
    roomContextBiases: ["translate reasoning into visible creative structure"],
  },
};

export function resolveReasoningPolicy(profileSlug?: string | null, roomSlug?: string | null): EmbodimentReasoningPolicy {
  const roomDefault = roomSlug
    ? GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS[roomSlug as keyof typeof GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS]
    : undefined;
  const resolved = resolveEmbodimentSlug(profileSlug ?? roomDefault ?? "billy") ?? "billy";
  const profile = EMBODIMENT_PROFILES[resolved];
  const overrides = PROFILE_DEFAULTS[resolved] ?? {};

  return {
    profileSlug: resolved,
    defaultDepth: overrides.defaultDepth ?? "standard",
    canBrowse: overrides.canBrowse ?? false,
    canUseRepoTools: overrides.canUseRepoTools ?? false,
    canUseSupabaseTools: overrides.canUseSupabaseTools ?? false,
    canUseHuggingFaceTools: overrides.canUseHuggingFaceTools ?? false,
    toolPermission: overrides.toolPermission ?? "read_only",
    citationMode: overrides.citationMode ?? "when_factual",
    uncertaintyMode: overrides.uncertaintyMode ?? "explicit",
    safetyNotes: [
      "Never expose raw hidden chain-of-thought; show evidence, assumptions, and uncertainty instead.",
      ...(overrides.safetyNotes ?? []),
    ],
    roomContextBiases: [profile?.publicName ?? resolved, ...(overrides.roomContextBiases ?? [])],
  };
}

export function resolveVoiceProfile(profileSlug?: string | null): VoiceProfile {
  const resolved = resolveEmbodimentSlug(profileSlug ?? "billy") ?? "billy";
  const profile = EMBODIMENT_PROFILES[resolved];

  return {
    profileSlug: resolved,
    displayName: profile?.publicName ?? "Billy",
    providerPreference: resolved === "billy" ? "local" : "browser",
    ttsModel: resolved === "billy" ? "CosyVoice/open-worker-preferred" : undefined,
    sttModel: "Whisper-compatible/open-worker-preferred",
    speakerId: resolved,
    stylePreset: {
      warmth: resolved === "billy" ? 0.9 : 0.8,
      pace: 0.82,
      humor: resolved === "billy" ? 0.55 : 0.35,
      energy: 0.58,
      clarity: 0.92,
    },
    fallbackTextOnly: true,
  };
}
