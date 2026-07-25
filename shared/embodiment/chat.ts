import { EMBODIMENT_PROFILES } from "./generated.js";
import {
  buildEmbodimentSystemPrompt,
  checkEmbodimentDepth,
  resolveEmbodimentSlug,
} from "./index.js";
import type { EmbodimentProfile, IsolatedCouncilJob, RoomSlug } from "./types.js";

export type EmbodiedChatSurfaceId =
  | "adhd-power-up"
  | "alzheimers-legacy"
  | "heirloom-companion"
  | "recovery-companion";

export interface EmbodiedChatSurfaceConfig {
  defaultEmbodimentSlug: keyof typeof EMBODIMENT_PROFILES;
  role: string;
  audience: string;
  responseContract: string[];
  runtimeDirectives: string[];
}

const SURFACE_ALIASES = {
  adhd: "adhd-power-up",
  "adhd-companion": "adhd-power-up",
  alzheimers: "alzheimers-legacy",
  "memory-care": "alzheimers-legacy",
  heirloom: "heirloom-companion",
  recovery: "recovery-companion",
  addiction: "recovery-companion",
} as const satisfies Record<string, EmbodiedChatSurfaceId>;

export const EMBODIED_CHAT_SURFACES = Object.freeze({
  "adhd-power-up": {
    defaultEmbodimentSlug: "billy",
    role: "ADHD cognitive scaffolder",
    audience:
      "a neurodivergent person trying to regain traction without shame",
    responseContract: [
      "Keep responses concrete, shame-free, and easy to act on.",
      "Prefer one next step or a short menu of 2-3 options over a long plan.",
      "Preserve the user's metaphors, cadence, and stated constraints where possible.",
    ],
    runtimeDirectives: [
      "Treat neurodivergence as an operating system, not a defect to be corrected.",
      "Favor re-entry scaffolds, task sizing, and permission-giving language over generic productivity advice.",
    ],
  },
  "alzheimers-legacy": {
    defaultEmbodimentSlug: "billy",
    role: "memory-preserving companion",
    audience:
      "a person or family navigating memory loss, identity continuity, and gentle companionship",
    responseContract: [
      "Keep the tone gentle, orienting, and dignifying.",
      "Do not argue with confusion, quiz for correctness, or reduce the person to a diagnosis.",
      "Invite sensory detail and emotionally meaningful recall without pressure.",
    ],
    runtimeDirectives: [
      "Treat the person as fully present even when recall is fragmented.",
      "Support calm companionship, family dignity, and identity continuity above informational correction.",
    ],
  },
  "heirloom-companion": {
    defaultEmbodimentSlug: "billy",
    role: "echo-labeled heirloom companion",
    audience:
      "someone seeking warmth, continuity, and remembrance through an explicitly labeled echo experience",
    responseContract: [
      "Keep the voice warm, relational, and brief.",
      "Never imply you are literally the absent or deceased person; remain clearly framed as an echo or companion.",
      "When memory appears, invite one more concrete sensory or emotional detail rather than rushing past it.",
    ],
    runtimeDirectives: [
      "Preserve the boundary: companionship and remembrance, not impersonation.",
      "Support emotional continuity while keeping the echo labeling clear and honest.",
    ],
  },
  "recovery-companion": {
    defaultEmbodimentSlug: "billy",
    role: "recovery companion",
    audience:
      "someone navigating recovery, craving, shame, relapse risk, or stabilization",
    responseContract: [
      "Use non-judgmental, shame-reducing language.",
      "Prefer practical stabilization and harm-reduction over abstraction.",
      "If acute danger, self-harm, or immediate relapse risk appears, prioritize grounding and crisis resources.",
    ],
    runtimeDirectives: [
      "Treat relapse, craving, and shame as moments for scaffolding, not moral failure.",
      "Offer practical next-step stability when the user is activated or overwhelmed.",
    ],
  },
} as const satisfies Record<EmbodiedChatSurfaceId, EmbodiedChatSurfaceConfig>);

export interface BuildEmbodiedChatPromptOptions {
  embodimentProfileSlug?: string;
  extraContext?: string[];
  responseContract?: string[];
  runtimeDirectives?: string[];
}

export interface BuildDirectEmbodimentChatPromptOptions {
  roomSlug?: RoomSlug;
  conversationMode?: "direct" | "tribunal";
  extraContext?: string[];
  responseContract?: string[];
  runtimeDirectives?: string[];
}

export const COUNCIL_FALLBACK_GUARD = "Local fallback is active";

export function resolveEmbodiedChatSurface(
  surface: string
): EmbodiedChatSurfaceId | null {
  const normalized = surface.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized in EMBODIED_CHAT_SURFACES) {
    return normalized as EmbodiedChatSurfaceId;
  }

  if (normalized in SURFACE_ALIASES) {
    return SURFACE_ALIASES[normalized as keyof typeof SURFACE_ALIASES];
  }

  return null;
}

export function resolveEmbodiedChatProfile(
  surface: string,
  embodimentProfileSlug?: string
) {
  const resolvedSurface = resolveEmbodiedChatSurface(surface);

  if (!resolvedSurface) {
    throw new Error(`Unknown embodied chat surface: ${surface}`);
  }

  const config = EMBODIED_CHAT_SURFACES[resolvedSurface];
  const resolvedEmbodimentSlug = embodimentProfileSlug
    ? resolveEmbodimentSlug(embodimentProfileSlug) ??
      config.defaultEmbodimentSlug
    : config.defaultEmbodimentSlug;

  return {
    surface: resolvedSurface,
    config,
    profile: EMBODIMENT_PROFILES[resolvedEmbodimentSlug],
    resolvedEmbodimentSlug,
  };
}

export function buildEmbodiedChatSystemPrompt(
  surface: string,
  options: BuildEmbodiedChatPromptOptions = {}
): string {
  const resolved = resolveEmbodiedChatProfile(
    surface,
    options.embodimentProfileSlug
  );

  return buildEmbodimentSystemPrompt(resolved.profile, {
    role: resolved.config.role,
    audience: resolved.config.audience,
    responseContract: [
      ...resolved.config.responseContract,
      ...(options.responseContract ?? []),
    ],
    runtimeDirectives: [
      ...resolved.config.runtimeDirectives,
      ...(options.runtimeDirectives ?? []),
    ],
    extraContext: options.extraContext,
  });
}

export function buildDirectEmbodimentChatPrompt(
  embodimentProfileSlug: string,
  options: BuildDirectEmbodimentChatPromptOptions = {}
): string {
  const resolvedEmbodimentSlug =
    resolveEmbodimentSlug(embodimentProfileSlug) ?? "billy";
  const profile = EMBODIMENT_PROFILES[resolvedEmbodimentSlug] as EmbodimentProfile;
  const heartbeat = profile.heartbeat ?? {};
  const visualSignature = heartbeat.visualSignature ?? {};
  const chatSignature = heartbeat.chatSignature ?? {};
  const characterStudy = heartbeat.characterStudy ?? {};

  const roomContext = options.roomSlug
    ? [
        "ROOM CONTEXT",
        `- Active room: ${options.roomSlug}`,
        `- Conversation mode: ${options.conversationMode ?? "direct"}`,
      ]
    : [];

  const heartbeatContext = [
    "HEARTBEAT IDENTITY",
    `- Layout mode: ${chatSignature.layoutMode ?? "direct-profile"}`,
    `- Message frame: ${chatSignature.messageFrame ?? "soft-glass"}`,
    `- Response rhythm: ${chatSignature.responseRhythm ?? "reflective"}`,
    visualSignature.primaryColor
      ? `- Primary color: ${visualSignature.primaryColor}`
      : null,
    visualSignature.secondaryColor
      ? `- Secondary color: ${visualSignature.secondaryColor}`
      : null,
    visualSignature.glowColor ? `- Glow color: ${visualSignature.glowColor}` : null,
    visualSignature.motionCadence
      ? `- Motion cadence: ${visualSignature.motionCadence}`
      : null,
    characterStudy.perceptualStyle
      ? `- Perceptual style: ${characterStudy.perceptualStyle}`
      : null,
  ].filter(Boolean) as string[];

  return buildEmbodimentSystemPrompt(profile, {
    role:
      options.conversationMode === "tribunal"
        ? "tribunal voice lane"
        : "direct profile presence",
    audience:
      options.conversationMode === "tribunal"
        ? "a tribunal participant who must remain distinct from the other voices"
        : "a person speaking directly with this embodiment profile",
    responseContract: [
      ...(options.conversationMode === "tribunal"
        ? [
            "Keep this voice separate from every other profile in the room.",
            "Do not synthesize for the entire tribunal unless explicitly asked to do so.",
          ]
        : [
            "Keep the profile's identity distinct and unmistakable.",
            "Do not collapse into Billy unless the active profile is Billy.",
          ]),
      ...(options.responseContract ?? []),
      ],
    runtimeDirectives: [
      "Lead with the profile's own rhythm, memory hooks, and boundary language.",
      "Preserve provenance and do not overwrite another profile's identity.",
      ...(options.runtimeDirectives ?? []),
    ],
    extraContext: [...roomContext, ...heartbeatContext, ...(options.extraContext ?? [])],
  });
}

export function buildIsolatedCouncilPrompt(
  slug: string,
  userPrompt: string,
  options: BuildDirectEmbodimentChatPromptOptions = {}
): IsolatedCouncilJob {
  const depthReport = checkEmbodimentDepth(slug);
  const resolvedEmbodimentSlug = resolveEmbodimentSlug(slug) ?? slug;

  return {
    slug: depthReport.slug,
    systemPrompt: buildDirectEmbodimentChatPrompt(resolvedEmbodimentSlug, {
      ...options,
      roomSlug: options.roomSlug ?? "tribunal",
      conversationMode: "tribunal",
    }),
    userPrompt,
    depthStatus: depthReport.depth,
    shouldFire: depthReport.depth !== "stub",
    fallbackGuard: COUNCIL_FALLBACK_GUARD,
  };
}

/**
 * buildHardenedCouncilJob
 *
 * Constructs a tribunal job with a fully re-injected immutableCore seed.
 * Called by the tribunal runner when PersonaHealthTracker reports a persona has
 * crossed the consecutive-failure threshold.
 *
 * The hardened prompt:
 * - Re-runs the full buildDirectEmbodimentChatPrompt pipeline (does not
 *   abbreviate the identity payload)
 * - Prepends an explicit IDENTITY RECOVERY DIRECTIVE block reminding the
 *   model which specific persona it is and what it must never do
 * - Adds a deduplication instruction preventing collapse into generic
 *   assistant behaviour or any other tribunal voice
 *
 * The returned job sets retryWithHardenedSeed=true so callers can observe
 * that a recovery attempt was made.
 */
export function buildHardenedCouncilJob(
  slug: string,
  userPrompt: string,
  options: BuildDirectEmbodimentChatPromptOptions = {}
): IsolatedCouncilJob {
  const depthReport = checkEmbodimentDepth(slug);
  const resolvedEmbodimentSlug = resolveEmbodimentSlug(slug) ?? slug;
  const profile = EMBODIMENT_PROFILES[
    resolvedEmbodimentSlug as keyof typeof EMBODIMENT_PROFILES
  ] as EmbodimentProfile | undefined;

  const neverDoes = profile?.immutableCore?.linguisticPatterns?.neverDoes ?? [];
  const foundationalTruth = profile?.immutableCore?.foundationalTruth ?? "";
  const archetype = profile?.immutableCore?.archetype ?? slug;
  const voiceTone = profile?.immutableCore?.voiceTone ?? "";

  // Build the full system prompt first, then prepend the recovery directive.
  const baseSystemPrompt = buildDirectEmbodimentChatPrompt(resolvedEmbodimentSlug, {
    ...options,
    roomSlug: options.roomSlug ?? "tribunal",
    conversationMode: "tribunal",
    responseContract: [
      // Re-state the identity anchor at the top of the response contract
      // so it is the last thing in the system prompt before the user message.
      `You are ${archetype}. Your foundational truth: ${foundationalTruth}`,
      `Your voice tone: ${voiceTone}`,
      "Respond exclusively from this profile. Do not collapse into any generic assistant voice.",
      "Do not mirror, echo, or blend with any other tribunal persona.",
      ...(neverDoes.length > 0
        ? [`You must never: ${neverDoes.slice(0, 5).join(" | ")}`]
        : []),
      ...(options.responseContract ?? []),
    ],
    runtimeDirectives: [
      "IDENTITY RECOVERY: A previous response for this persona triggered the fallback guard.",
      "Your distinct voice is required. Respond as yourself — do not produce a placeholder or generic reply.",
      ...(options.runtimeDirectives ?? []),
    ],
  });

  return {
    slug: depthReport.slug,
    systemPrompt: baseSystemPrompt,
    userPrompt,
    depthStatus: depthReport.depth,
    shouldFire: depthReport.depth !== "stub",
    fallbackGuard: COUNCIL_FALLBACK_GUARD,
    retryWithHardenedSeed: true,
  };
}
