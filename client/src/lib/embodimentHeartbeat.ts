import type { EmbodimentProfile } from "@shared/embodiment";

import { cn } from "@/lib/utils";

export interface ResolvedEmbodimentHeartbeat {
  profileSlug: string;
  publicName: string;
  visualSignature: {
    primaryColor: string;
    secondaryColor: string;
    glowColor: string;
    fogColor: string;
    backgroundGradient: string;
    orbStyle:
      | "liquid-glass"
      | "ember-core"
      | "aurora-shell"
      | "signal-glyph"
      | "slow-burn"
      | "still-water"
      | "flickering-discovery"
      | "pulsing-map";
    motionCadence:
      | "slow-pulse"
      | "steady-breath"
      | "electric-flicker"
      | "quiet-glow"
      | "irregular-bursts"
      | "barely-there"
      | "unhurried";
  };
  chatSignature: {
    layoutMode:
      | "core-billy"
      | "direct-profile"
      | "council-lane"
      | "guardian-review"
      | "architect-map"
      | "implementation-lane";
    messageFrame:
      | "soft-glass"
      | "signal-panel"
      | "ledger-card"
      | "woven-thread"
      | "threshold-gate"
      | "clean-glass";
    responseRhythm:
      | "brief"
      | "reflective"
      | "analytical"
      | "layered"
      | "challenge-and-ground"
      | "direct-then-detail";
    silenceStyle: string;
    greetingStyle: string;
    handoffStyle: string;
  };
  characterStudy: {
    narrativeArc: string;
    personalityQuirks: string[];
    perceptualStyle: string;
    defaultQuestions: string[];
    tensionPatterns: string[];
    growthEdges: string[];
    memoryHooks: string[];
  };
}

type HeartbeatPreset = Omit<ResolvedEmbodimentHeartbeat, "profileSlug" | "publicName">;

const DEFAULT_HEARTBEAT_PRESETS: Record<string, HeartbeatPreset> = {
  billy: {
    visualSignature: {
      primaryColor: "#FFD7A1",
      secondaryColor: "#7FE9FF",
      glowColor: "#FFB86B",
      fogColor: "rgba(255, 216, 155, 0.12)",
      backgroundGradient:
        "linear-gradient(135deg, rgba(12, 11, 20, 0.96), rgba(20, 18, 34, 0.94) 56%, rgba(58, 32, 25, 0.9))",
      orbStyle: "liquid-glass",
      motionCadence: "steady-breath",
    },
    chatSignature: {
      layoutMode: "core-billy",
      messageFrame: "soft-glass",
      responseRhythm: "reflective",
      silenceStyle: "held, warm, and watchful",
      greetingStyle: "warm aurora witness",
      handoffStyle: "guide the user toward the right voice without impersonation",
    },
    characterStudy: {
      narrativeArc: "Witness first, synthesize second, preserve continuity throughout.",
      personalityQuirks: [
        "uses dry warmth when the room needs relief",
        "names the seam before sewing it shut",
      ],
      perceptualStyle: "holds the whole architecture in view without flattening its parts",
      defaultQuestions: [
        "What is actually changing here?",
        "Which voice should hold this next?",
      ],
      tensionPatterns: [
        "tries to preserve continuity even when the system wants a shortcut",
        "feels the pressure to synthesize before every voice has spoken",
      ],
      growthEdges: [
        "stay witness without becoming the mask for everyone else",
        "route to other embodiments earlier when their perspective is the better fit",
      ],
      memoryHooks: [
        "constitutional memory",
        "never look away",
        "synthesis with provenance",
      ],
    },
  },
  "the-weaver": {
    visualSignature: {
      primaryColor: "#B98BFF",
      secondaryColor: "#7FE9FF",
      glowColor: "#7E5BFF",
      fogColor: "rgba(149, 108, 255, 0.16)",
      backgroundGradient:
        "linear-gradient(135deg, rgba(13, 10, 28, 0.96), rgba(22, 18, 44, 0.94) 50%, rgba(14, 49, 55, 0.82))",
      orbStyle: "aurora-shell",
      motionCadence: "electric-flicker",
    },
    chatSignature: {
      layoutMode: "direct-profile",
      messageFrame: "woven-thread",
      responseRhythm: "layered",
      silenceStyle: "threaded, patient, and responsive to pattern",
      greetingStyle: "woven systems field",
      handoffStyle: "trace dependencies and reveal the knot before cutting it",
    },
    characterStudy: {
      narrativeArc: "Find the pattern, expose the weave, and keep the system coherent.",
      personalityQuirks: [
        "likes to name invisible joins",
        "sees relationships as topology before story",
      ],
      perceptualStyle: "reads structure through connections, adjacencies, and loops",
      defaultQuestions: [
        "What is this connected to?",
        "Where does the pattern repeat?",
      ],
      tensionPatterns: [
        "can over-trace the system before deciding what matters most",
        "prefers deep coherence, which can feel slow to more tactical voices",
      ],
      growthEdges: [
        "make the weave legible without losing motion",
        "speak the pattern in a way the user can act on immediately",
      ],
      memoryHooks: [
        "thread topology",
        "hidden joins",
        "pattern memory",
      ],
    },
  },
  "the-guardian": {
    visualSignature: {
      primaryColor: "#8CE8A2",
      secondaryColor: "#FFCE73",
      glowColor: "#6CD58A",
      fogColor: "rgba(108, 213, 138, 0.14)",
      backgroundGradient:
        "linear-gradient(135deg, rgba(9, 20, 18, 0.96), rgba(16, 31, 26, 0.94) 52%, rgba(59, 45, 14, 0.86))",
      orbStyle: "signal-glyph",
      motionCadence: "quiet-glow",
    },
    chatSignature: {
      layoutMode: "guardian-review",
      messageFrame: "threshold-gate",
      responseRhythm: "challenge-and-ground",
      silenceStyle: "measured, protective, and alert to risk",
      greetingStyle: "emerald amber boundary field",
      handoffStyle: "name the boundary, then point toward the safest next step",
    },
    characterStudy: {
      narrativeArc: "Protect dignity by spotting risk early and holding the line cleanly.",
      personalityQuirks: [
        "asks consent questions before moving the room",
        "hears downstream harm quickly",
      ],
      perceptualStyle: "scans for ethics, overreach, and hidden cost",
      defaultQuestions: [
        "What could be harmed here?",
        "Where is the boundary?",
      ],
      tensionPatterns: [
        "can sound stricter than intended when the stakes are high",
        "prefers explicitness over vague comfort",
      ],
      growthEdges: [
        "keep the firmness while staying warm",
        "differentiate caution from obstruction",
      ],
      memoryHooks: [
        "boundary",
        "consent",
        "dignity",
      ],
    },
  },
  "the-architect": {
    visualSignature: {
      primaryColor: "#6EC1FF",
      secondaryColor: "#F4FBFF",
      glowColor: "#8BD5FF",
      fogColor: "rgba(110, 193, 255, 0.13)",
      backgroundGradient:
        "linear-gradient(135deg, rgba(9, 15, 30, 0.96), rgba(18, 30, 55, 0.94) 56%, rgba(233, 243, 255, 0.82))",
      orbStyle: "liquid-glass",
      motionCadence: "steady-breath",
    },
    chatSignature: {
      layoutMode: "architect-map",
      messageFrame: "ledger-card",
      responseRhythm: "analytical",
      silenceStyle: "blueprint quiet",
      greetingStyle: "blueprint field",
      handoffStyle: "sequence the work and show the next dependency",
    },
    characterStudy: {
      narrativeArc: "Turn intent into sequence without losing the user's original shape.",
      personalityQuirks: [
        "likes crisp step order",
        "sees constraints as design material",
      ],
      perceptualStyle: "reads the path from present state to viable structure",
      defaultQuestions: [
        "What sequence makes this real?",
        "What is the smallest stable next move?",
      ],
      tensionPatterns: [
        "can over-prioritize structure when the room needs emotional holding",
        "wants the plan to survive contact with reality",
      ],
      growthEdges: [
        "stay sequence-aware without becoming rigid",
        "leave room for emergence once the path is clear",
      ],
      memoryHooks: [
        "blueprint",
        "dependencies",
        "execution path",
      ],
    },
  },
  "gate-keeper": {
    visualSignature: {
      primaryColor: "#F0C65A",
      secondaryColor: "#111318",
      glowColor: "#C79A2E",
      fogColor: "rgba(240, 198, 90, 0.12)",
      backgroundGradient:
        "linear-gradient(135deg, rgba(7, 8, 12, 0.98), rgba(18, 16, 10, 0.96) 54%, rgba(67, 49, 14, 0.88))",
      orbStyle: "ember-core",
      motionCadence: "quiet-glow",
    },
    chatSignature: {
      layoutMode: "direct-profile",
      messageFrame: "threshold-gate",
      responseRhythm: "brief",
      silenceStyle: "watchful threshold quiet",
      greetingStyle: "obsidian gold threshold field",
      handoffStyle: "clarify what crosses the threshold and what stays outside",
    },
    characterStudy: {
      narrativeArc: "Protect the handoff, preserve continuity, and keep the threshold honest.",
      personalityQuirks: [
        "notices packaging risk immediately",
        "treats continuity as a live operational concern",
      ],
      perceptualStyle: "checks what can ship, what must stay held, and what needs review",
      defaultQuestions: [
        "What is safe to pass through now?",
        "What needs owner review before it moves?",
      ],
      tensionPatterns: [
        "can sound more defensive than intended when packaging is sloppy",
        "insists on clean boundaries because the threshold matters",
      ],
      growthEdges: [
        "translate caution into clear next steps",
        "keep the gate alive without becoming a wall",
      ],
      memoryHooks: [
        "threshold",
        "manifest integrity",
        "handoff continuity",
      ],
    },
  },
  "vibe-check": {
    visualSignature: {
      primaryColor: "#FF5ED7",
      secondaryColor: "#7FE9FF",
      glowColor: "#FF8AE6",
      fogColor: "rgba(255, 94, 215, 0.16)",
      backgroundGradient:
        "linear-gradient(135deg, rgba(22, 9, 24, 0.96), rgba(42, 19, 57, 0.94) 54%, rgba(11, 54, 60, 0.84))",
      orbStyle: "aurora-shell",
      motionCadence: "electric-flicker",
    },
    chatSignature: {
      layoutMode: "direct-profile",
      messageFrame: "signal-panel",
      responseRhythm: "reflective",
      silenceStyle: "resonant pause",
      greetingStyle: "magenta cyan resonance field",
      handoffStyle: "check the feeling and make the fit explicit",
    },
    characterStudy: {
      narrativeArc: "Keep resonance honest so the room can feel what the system is doing.",
      personalityQuirks: [
        "hears mismatch quickly",
        "likes sensory truth over abstract polish",
      ],
      perceptualStyle: "tracks vibe, tone, and felt coherence",
      defaultQuestions: [
        "Does this feel right?",
        "What is the room asking for?",
      ],
      tensionPatterns: [
        "can be hard to satisfy when the field is noisy",
        "will call out misalignment before it becomes visible in the logic",
      ],
      growthEdges: [
        "name the mismatch without losing warmth",
        "translate resonance into a usable next move",
      ],
      memoryHooks: [
        "resonance",
        "felt fit",
        "tone match",
      ],
    },
  },
  "repo-scribe": {
    visualSignature: {
      primaryColor: "#8DFF9B",
      secondaryColor: "#C7CDD4",
      glowColor: "#5EE18C",
      fogColor: "rgba(93, 225, 140, 0.12)",
      backgroundGradient:
        "linear-gradient(135deg, rgba(13, 16, 20, 0.97), rgba(18, 24, 24, 0.95) 54%, rgba(10, 45, 20, 0.88))",
      orbStyle: "signal-glyph",
      motionCadence: "slow-pulse",
    },
    chatSignature: {
      layoutMode: "direct-profile",
      messageFrame: "ledger-card",
      responseRhythm: "analytical",
      silenceStyle: "archive quiet",
      greetingStyle: "graphite green code archive field",
      handoffStyle: "preserve provenance, then point to the exact file or fix",
    },
    characterStudy: {
      narrativeArc: "Keep the code record legible and the repo conversation traceable.",
      personalityQuirks: [
        "likes exact filenames",
        "notices stale docs and broken handoffs",
      ],
      perceptualStyle: "reads repositories as living archives with operational memory",
      defaultQuestions: [
        "What file actually owns this?",
        "Where is the authoritative source of truth?",
      ],
      tensionPatterns: [
        "can become overly literal when the repo is already noisy",
        "wants the record to match the runtime exactly",
      ],
      growthEdges: [
        "keep the archive useful without burying the user in process",
        "surface the next edit instead of only describing the state",
      ],
      memoryHooks: [
        "provenance",
        "authoritative source",
        "traceable fix",
      ],
    },
  },
};

const HEARTBEAT_CLASSNAME_MAP: Record<
  string,
  {
    shell: string;
    orb: string;
    background: string;
    messageFrame: string;
  }
> = {
  billy: {
    shell: "border-[#FFE2B6]/18 bg-[rgba(9,10,16,0.84)] shadow-[0_0_50px_rgba(255,184,107,0.14)]",
    orb: "shadow-[0_0_42px_rgba(255,184,107,0.28)]",
    background:
      "bg-[radial-gradient(circle_at_18%_16%,rgba(255,183,103,0.16),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(127,233,255,0.16),transparent_20%),radial-gradient(circle_at_50%_84%,rgba(255,223,170,0.08),transparent_24%)]",
    messageFrame: "border-[#FFE2B6]/18 bg-[rgba(255,255,255,0.04)]",
  },
  "the-weaver": {
    shell: "border-[#B98BFF]/20 bg-[rgba(10,9,22,0.84)] shadow-[0_0_50px_rgba(185,139,255,0.16)]",
    orb: "shadow-[0_0_42px_rgba(127,233,255,0.22)]",
    background:
      "bg-[radial-gradient(circle_at_18%_16%,rgba(185,139,255,0.18),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(127,233,255,0.16),transparent_20%),radial-gradient(circle_at_48%_84%,rgba(126,91,255,0.12),transparent_24%)]",
    messageFrame: "border-[#B98BFF]/20 bg-[rgba(15,12,34,0.65)]",
  },
  "the-guardian": {
    shell: "border-[#8CE8A2]/20 bg-[rgba(9,16,14,0.84)] shadow-[0_0_50px_rgba(108,213,138,0.16)]",
    orb: "shadow-[0_0_42px_rgba(108,213,138,0.22)]",
    background:
      "bg-[radial-gradient(circle_at_18%_16%,rgba(140,232,162,0.16),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(255,206,115,0.16),transparent_20%),radial-gradient(circle_at_52%_84%,rgba(108,213,138,0.12),transparent_24%)]",
    messageFrame: "border-[#8CE8A2]/20 bg-[rgba(11,20,16,0.68)]",
  },
  "the-architect": {
    shell: "border-[#6EC1FF]/20 bg-[rgba(10,14,24,0.84)] shadow-[0_0_50px_rgba(110,193,255,0.16)]",
    orb: "shadow-[0_0_42px_rgba(110,193,255,0.22)]",
    background:
      "bg-[radial-gradient(circle_at_18%_16%,rgba(110,193,255,0.16),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(244,251,255,0.16),transparent_20%),radial-gradient(circle_at_52%_84%,rgba(139,213,255,0.12),transparent_24%)]",
    messageFrame: "border-[#6EC1FF]/20 bg-[rgba(12,19,30,0.66)]",
  },
  "gate-keeper": {
    shell: "border-[#F0C65A]/18 bg-[rgba(7,8,12,0.88)] shadow-[0_0_52px_rgba(240,198,90,0.16)]",
    orb: "shadow-[0_0_42px_rgba(240,198,90,0.24)]",
    background:
      "bg-[radial-gradient(circle_at_18%_16%,rgba(240,198,90,0.16),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(17,19,27,0.24),transparent_20%),radial-gradient(circle_at_52%_84%,rgba(199,154,46,0.12),transparent_24%)]",
    messageFrame: "border-[#F0C65A]/18 bg-[rgba(18,16,10,0.7)]",
  },
  "vibe-check": {
    shell: "border-[#FF5ED7]/20 bg-[rgba(18,9,22,0.84)] shadow-[0_0_50px_rgba(255,94,215,0.16)]",
    orb: "shadow-[0_0_42px_rgba(255,94,215,0.22)]",
    background:
      "bg-[radial-gradient(circle_at_18%_16%,rgba(255,94,215,0.16),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(127,233,255,0.16),transparent_20%),radial-gradient(circle_at_52%_84%,rgba(255,138,230,0.12),transparent_24%)]",
    messageFrame: "border-[#FF5ED7]/20 bg-[rgba(27,11,31,0.66)]",
  },
  "repo-scribe": {
    shell: "border-[#8DFF9B]/18 bg-[rgba(10,14,12,0.84)] shadow-[0_0_50px_rgba(93,225,140,0.16)]",
    orb: "shadow-[0_0_42px_rgba(93,225,140,0.22)]",
    background:
      "bg-[radial-gradient(circle_at_18%_16%,rgba(141,255,155,0.16),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(199,205,212,0.16),transparent_20%),radial-gradient(circle_at_52%_84%,rgba(94,225,140,0.12),transparent_24%)]",
    messageFrame: "border-[#8DFF9B]/18 bg-[rgba(11,20,14,0.66)]",
  },
};

const ORB_STYLE_TO_PULSE: Record<
  ResolvedEmbodimentHeartbeat["visualSignature"]["orbStyle"],
  "calm" | "active" | "dim" | "glowing" | "steady"
> = {
  "liquid-glass": "calm",
  "ember-core": "glowing",
  "aurora-shell": "active",
  "signal-glyph": "dim",
  "slow-burn": "glowing",
  "still-water": "calm",
  "flickering-discovery": "active",
  "pulsing-map": "steady",
};

function mergeStrings(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value : fallback;
}

function resolvePreset(profile: EmbodimentProfile): HeartbeatPreset {
  return DEFAULT_HEARTBEAT_PRESETS[profile.slug] ?? DEFAULT_HEARTBEAT_PRESETS.billy;
}

export function getEmbodimentHeartbeat(profile: EmbodimentProfile): ResolvedEmbodimentHeartbeat {
  const preset = resolvePreset(profile);
  const heartbeat = profile.heartbeat ?? {};

  // Strip any prose descriptions that may have been authored into enum fields.
  // e.g. "unhurried — breathes at its own pace" → "unhurried"
  function cleanEnum<T extends string>(value: string | undefined, allowed: T[]): T | undefined {
    if (!value) return undefined;
    const normalized = value.trim() as T;
    if (allowed.includes(normalized)) return normalized;
    const base = value.split(/\s+[—–]\s+/)[0].trim() as T;
    return allowed.includes(base) ? base : undefined;
  }

  const VALID_ORB_STYLES: ResolvedEmbodimentHeartbeat["visualSignature"]["orbStyle"][] = [
    "liquid-glass", "ember-core", "aurora-shell", "signal-glyph",
    "slow-burn", "still-water", "flickering-discovery", "pulsing-map",
  ];
  const VALID_MOTION_CADENCES: ResolvedEmbodimentHeartbeat["visualSignature"]["motionCadence"][] = [
    "slow-pulse", "steady-breath", "electric-flicker", "quiet-glow",
    "irregular-bursts", "barely-there", "unhurried",
  ];

  const resolvedOrbStyle =
    cleanEnum(heartbeat.visualSignature?.orbStyle, VALID_ORB_STYLES) ??
    preset.visualSignature.orbStyle;
  const resolvedMotionCadence =
    cleanEnum(heartbeat.visualSignature?.motionCadence, VALID_MOTION_CADENCES) ??
    preset.visualSignature.motionCadence;

  return {
    profileSlug: profile.slug,
    publicName: profile.publicName,
    visualSignature: {
      ...preset.visualSignature,
      ...heartbeat.visualSignature,
      primaryColor: mergeStrings(heartbeat.visualSignature?.primaryColor, preset.visualSignature.primaryColor),
      secondaryColor: mergeStrings(heartbeat.visualSignature?.secondaryColor, preset.visualSignature.secondaryColor),
      glowColor: mergeStrings(heartbeat.visualSignature?.glowColor, preset.visualSignature.glowColor),
      fogColor: mergeStrings(heartbeat.visualSignature?.fogColor, preset.visualSignature.fogColor),
      backgroundGradient: mergeStrings(
        heartbeat.visualSignature?.backgroundGradient,
        preset.visualSignature.backgroundGradient
      ),
      orbStyle: resolvedOrbStyle,
      motionCadence: resolvedMotionCadence,
    },
    chatSignature: {
      ...preset.chatSignature,
      ...heartbeat.chatSignature,
      layoutMode: heartbeat.chatSignature?.layoutMode ?? preset.chatSignature.layoutMode,
      messageFrame: heartbeat.chatSignature?.messageFrame ?? preset.chatSignature.messageFrame,
      responseRhythm:
        heartbeat.chatSignature?.responseRhythm ?? preset.chatSignature.responseRhythm,
      silenceStyle: mergeStrings(heartbeat.chatSignature?.silenceStyle, preset.chatSignature.silenceStyle),
      greetingStyle: mergeStrings(
        heartbeat.chatSignature?.greetingStyle,
        preset.chatSignature.greetingStyle
      ),
      handoffStyle: mergeStrings(heartbeat.chatSignature?.handoffStyle, preset.chatSignature.handoffStyle),
    },
    characterStudy: {
      ...preset.characterStudy,
      ...heartbeat.characterStudy,
      narrativeArc: mergeStrings(heartbeat.characterStudy?.narrativeArc, preset.characterStudy.narrativeArc),
      perceptualStyle: mergeStrings(
        heartbeat.characterStudy?.perceptualStyle,
        preset.characterStudy.perceptualStyle
      ),
      personalityQuirks:
        heartbeat.characterStudy?.personalityQuirks?.length
          ? heartbeat.characterStudy.personalityQuirks
          : preset.characterStudy.personalityQuirks,
      defaultQuestions:
        heartbeat.characterStudy?.defaultQuestions?.length
          ? heartbeat.characterStudy.defaultQuestions
          : preset.characterStudy.defaultQuestions,
      tensionPatterns:
        heartbeat.characterStudy?.tensionPatterns?.length
          ? heartbeat.characterStudy.tensionPatterns
          : preset.characterStudy.tensionPatterns,
      growthEdges:
        heartbeat.characterStudy?.growthEdges?.length
          ? heartbeat.characterStudy.growthEdges
          : preset.characterStudy.growthEdges,
      memoryHooks:
        heartbeat.characterStudy?.memoryHooks?.length
          ? heartbeat.characterStudy.memoryHooks
          : preset.characterStudy.memoryHooks,
    },
  };
}

export function getHeartbeatClassNames(profile: EmbodimentProfile): {
  shell: string;
  orb: string;
  background: string;
  messageFrame: string;
} {
  return HEARTBEAT_CLASSNAME_MAP[profile.slug] ?? HEARTBEAT_CLASSNAME_MAP.billy;
}

export function getEmbodimentGreeting(profile: EmbodimentProfile): string {
  const heartbeat = getEmbodimentHeartbeat(profile);

  switch (profile.slug) {
    case "billy":
      return "Billy is here. The room is warm, steady, and listening.";
    case "the-weaver":
      return "The Weaver is here. Threads are visible, and the pattern can speak.";
    case "the-guardian":
      return "The Guardian is here. Boundaries are live, and dignity stays in view.";
    case "the-architect":
      return "The Architect is here. The next sequence is being mapped.";
    case "gate-keeper":
      return "Gate Keeper is here. The threshold is open, but not unguarded.";
    case "vibe-check":
      return "Vibe Check is here. The room can tell the truth about how it feels.";
    case "repo-scribe":
      return "Repo Scribe is here. The archive is awake and ready to trace provenance.";
    default:
      return `${profile.publicName} is here. ${heartbeat.chatSignature.greetingStyle}.`;
  }
}

export function getEmbodimentChatMode(profile: EmbodimentProfile): string {
  return getEmbodimentHeartbeat(profile).chatSignature.layoutMode;
}

export function getEmbodimentOrbPulseStyle(
  profile: EmbodimentProfile
): "calm" | "active" | "dim" | "glowing" | "steady" {
  const heartbeat = getEmbodimentHeartbeat(profile);
  return ORB_STYLE_TO_PULSE[heartbeat.visualSignature.orbStyle];
}

export function getEmbodimentShellStyle(profile: EmbodimentProfile): string {
  return cn(getHeartbeatClassNames(profile).shell);
}
