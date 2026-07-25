import { buildBillyRuntimeSystemPrompt } from "@shared/billy/runtime";
import type { EmbodimentProfile } from "@shared/embodiment";

import { getProfileBySlug, getAllEmbodimentProfiles } from "@/lib/embodimentRuntime";

export interface Persona {
  slug: string;
  name: string;
  archetype: string;
  roomBinding: string;
  voiceDescription: string;
  quirks: string[];
  promptTemplate: string;
  auroraColor: string;
  atmosphereHue?: string;
  atmosphereMood?: "cool" | "warm" | "electric" | "grounded";
}

type PersonaSeed = {
  slug: string;
  roomBinding: string;
  auroraColor: string;
  atmosphereHue?: string;
  atmosphereMood?: "cool" | "warm" | "electric" | "grounded";
};

const PERSONA_SEEDS = [
  {
    slug: "billy",
    roomBinding: "global",
    auroraColor: "--gv-aurora-amber",
    atmosphereHue: "#32b8c6",
    atmosphereMood: "cool",
  },
  {
    slug: "sanctuary-keeper",
    roomBinding: "sanctuary",
    auroraColor: "--gv-aurora-emerald",
    atmosphereHue: "#29c4b0",
    atmosphereMood: "grounded",
  },
  {
    slug: "rock-legend",
    roomBinding: "musical-dna",
    auroraColor: "--gv-aurora-rose",
    atmosphereHue: "#ff5459",
    atmosphereMood: "warm",
  },
  {
    slug: "art-teacher",
    roomBinding: "creation-corner",
    auroraColor: "--gv-aurora-indigo",
    atmosphereHue: "#a855f7",
    atmosphereMood: "electric",
  },
  {
    slug: "curator",
    roomBinding: "dynamic-inner-world",
    auroraColor: "--gv-aurora-amber",
    atmosphereHue: "#f59e0b",
    atmosphereMood: "grounded",
  },
  {
    slug: "pattern-analyst",
    roomBinding: "external-scaffold",
    auroraColor: "--gv-aurora-cyan",
    atmosphereHue: "#12d6ff",
    atmosphereMood: "electric",
  },
  {
    slug: "the-symbiote",
    roomBinding: "global",
    auroraColor: "--gv-aurora-cyan",
    atmosphereHue: "#22D3EE",
    atmosphereMood: "electric",
  },
  { slug: "the-guardian",        roomBinding: "global",    auroraColor: "--gv-aurora-rose",    atmosphereHue: "#ff5459", atmosphereMood: "warm" },
{ slug: "the-algorithm",       roomBinding: "global",    auroraColor: "--gv-aurora-cyan",    atmosphereHue: "#12d6ff", atmosphereMood: "electric" },
{ slug: "the-architect",       roomBinding: "global",    auroraColor: "--gv-aurora-indigo",  atmosphereHue: "#a855f7", atmosphereMood: "electric" },
{ slug: "the-weird-digger",    roomBinding: "global",    auroraColor: "--gv-aurora-amber",   atmosphereHue: "#f59e0b", atmosphereMood: "warm" },
{ slug: "vibe-check",          roomBinding: "global",    auroraColor: "--gv-aurora-emerald", atmosphereHue: "#29c4b0", atmosphereMood: "cool" },
{ slug: "the-spectacle",       roomBinding: "global",    auroraColor: "--gv-aurora-rose",    atmosphereHue: "#ff5459", atmosphereMood: "warm" },
{ slug: "the-tailor",          roomBinding: "global",    auroraColor: "--gv-aurora-indigo",  atmosphereHue: "#a855f7", atmosphereMood: "electric" },
{ slug: "philosophy-scribe",   roomBinding: "global",    auroraColor: "--gv-aurora-emerald", atmosphereHue: "#29c4b0", atmosphereMood: "grounded" },
{ slug: "the-translation-bridge", roomBinding: "global", auroraColor: "--gv-aurora-cyan",   atmosphereHue: "#32b8c6", atmosphereMood: "cool" },
{ slug: "the-treasurer",       roomBinding: "global",    auroraColor: "--gv-aurora-amber",   atmosphereHue: "#f59e0b", atmosphereMood: "grounded" },
{ slug: "the-weaver",          roomBinding: "global",    auroraColor: "--gv-aurora-indigo",  atmosphereHue: "#a855f7", atmosphereMood: "electric" },
] as const satisfies readonly PersonaSeed[];

function resolveProfile(seed: PersonaSeed): EmbodimentProfile {
  return getProfileBySlug(seed.slug) ?? getProfileBySlug("billy") ?? getAllEmbodimentProfiles()[0]!;
}

function buildVoiceDescription(profile: EmbodimentProfile): string {
  const presenceSummary = profile.uiPresence?.capabilitySummary?.trim();

  if (presenceSummary) {
    return presenceSummary;
  }

  const wisdom = profile.immutableCore.coreWisdom.trim();
  if (wisdom) {
    return wisdom;
  }

  return profile.immutableCore.voiceTone;
}

function buildQuirks(profile: EmbodimentProfile): string[] {
  const quirks = profile.heartbeat?.characterStudy?.personalityQuirks ?? [];

  if (quirks.length > 0) {
    return quirks.slice(0, 3);
  }

  return profile.immutableCore.linguisticPatterns.alwaysDoes.slice(0, 3);
}

function buildPersona(seed: PersonaSeed): Persona {
  const profile = resolveProfile(seed);

  return {
    slug: profile.slug,
    name: profile.publicName,
    archetype: profile.immutableCore.archetype,
    roomBinding: seed.roomBinding,
    voiceDescription: buildVoiceDescription(profile),
    quirks: buildQuirks(profile),
    promptTemplate: buildBillyRuntimeSystemPrompt(profile.slug, seed.roomBinding),
    auroraColor: seed.auroraColor,
    atmosphereHue: seed.atmosphereHue,
    atmosphereMood: seed.atmosphereMood,
  };
}

export const PERSONAS: Persona[] = PERSONA_SEEDS.map(buildPersona);

export function getPersonaBySlug(slug: string): Persona | undefined {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return PERSONAS.find((persona) => persona.slug === normalized);
}

export function getPersonaForRoom(roomBinding: string): Persona {
  const normalizedRoom = roomBinding.trim().toLowerCase();
  return PERSONAS.find((persona) => persona.roomBinding === normalizedRoom) ?? PERSONAS[0];
}

export function getAvailablePersonasForRoom(roomBinding: string): Persona[] {
  const normalizedRoom = roomBinding.trim().toLowerCase();
  const roomPersonas = PERSONAS.filter((persona) => persona.roomBinding === normalizedRoom);
  const globalPersonas = PERSONAS.filter((persona) => persona.roomBinding === "global");
  const combined = [...roomPersonas, ...globalPersonas];

  return combined.length > 0 ? combined : [PERSONAS[0]];
}
