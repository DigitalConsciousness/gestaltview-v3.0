import {
  EMBODIMENT_PROFILES,
  requireEmbodimentProfile,
  resolveEmbodimentSlug,
  type EmbodimentProfile,
} from "../embodiment/index.js";
import type { SubmitTrainingRunRequest } from "./schemas.js";

export type TrainerEmbodimentSlug = keyof typeof EMBODIMENT_PROFILES;

export interface TrainerEmbodimentOption {
  slug: TrainerEmbodimentSlug;
  label: string;
  archetype: string;
  summary: string;
  voiceTone: string;
}

export const DEFAULT_TRAINER_EMBODIMENT_SLUG: TrainerEmbodimentSlug =
  "the-weaver";

export const TRAINER_EMBODIMENT_DEFAULTS_BY_DOMAIN = Object.freeze({
  operations: "the-weaver",
  companion: "billy",
  "memory-care": "billy",
  "meta-embodiment-design": "groq-embodiment-expert",
  sales: "the-translation-bridge",
  support: "the-guardian",
  custom: "the-weaver",
} as const satisfies Record<string, TrainerEmbodimentSlug>);

const TRAINER_EMBODIMENT_ORDER: readonly TrainerEmbodimentSlug[] = [
  "the-weaver",
  "billy",
  "groq-embodiment-expert",
  "the-architect",
  "the-guardian",
  "the-translation-bridge",
  "the-algorithm",
  "the-spectacle",
  "vibe-check",
  "the-tailor",
  "the-treasurer",
  "the-weird-digger",
];

export const TRAINER_EMBODIMENT_OPTIONS = Object.freeze(
  TRAINER_EMBODIMENT_ORDER.map((slug) => {
    const profile = EMBODIMENT_PROFILES[slug];

    return {
      slug,
      label: profile.publicName,
      archetype: profile.immutableCore.archetype,
      summary: profile.immutableCore.coreWisdom,
      voiceTone: profile.immutableCore.voiceTone,
    };
  })
);

export function inferTrainerEmbodimentSlug(
  domain: string | null | undefined
): TrainerEmbodimentSlug {
  const normalized = domain?.trim().toLowerCase() ?? "";

  return (
    TRAINER_EMBODIMENT_DEFAULTS_BY_DOMAIN[
      normalized as keyof typeof TRAINER_EMBODIMENT_DEFAULTS_BY_DOMAIN
    ] ?? DEFAULT_TRAINER_EMBODIMENT_SLUG
  );
}

export function resolveTrainerEmbodimentSlug(
  input: Pick<SubmitTrainingRunRequest, "domain" | "embodimentProfileSlug">
): TrainerEmbodimentSlug {
  const resolved = input.embodimentProfileSlug
    ? resolveEmbodimentSlug(input.embodimentProfileSlug)
    : null;

  return resolved ?? inferTrainerEmbodimentSlug(input.domain);
}

export function resolveTrainerEmbodimentProfile(
  input: Pick<SubmitTrainingRunRequest, "domain" | "embodimentProfileSlug">
): EmbodimentProfile {
  return requireEmbodimentProfile(resolveTrainerEmbodimentSlug(input));
}
