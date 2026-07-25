import type { EmbodimentProfile } from "@shared/embodiment/types";
import { hasPaidTierAccess } from "@/lib/entitlements";

const INTERNAL_PROFILE_SLUGS = new Set([
  "gate-keeper",
  "repo-scribe",
  "the-recursive-builder",
  "recursive-builder",
]);

export function getLaunchVisibleProfiles(profiles: EmbodimentProfile[]): EmbodimentProfile[] {
  return profiles.filter((profile) => {
    if (INTERNAL_PROFILE_SLUGS.has(profile.slug)) {
      return false;
    }
    return profile.visibilityScope !== "founder-only" && profile.profileStatus !== "archived";
  });
}

export function buildMasterclassSessionOpening(profile: EmbodimentProfile): string {
  const name = profile.publicName ?? profile.slug;
  const archetype = profile.immutableCore?.archetype;
  const tone = profile.immutableCore?.voiceTone;

  return [
    `I am beginning a Masterclass session with ${name}.`,
    archetype ? `${name} is the selected Digital Intelligence: ${archetype}.` : null,
    tone ? `Keep Billy in a support role and preserve this voice boundary: ${tone}.` : "Keep Billy in a support role and preserve the selected DI boundary.",
    "Route the session through the selected embodiment profile. Billy can orient, summarize, and hold the thread, but Billy must not impersonate the selected DI.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildOnboardingExplainerPrompt(): string {
  return [
    "Create an original GestaltView onboarding explainer with the clarity of retro instructional safety films and the dry cosmic absurdity of a travel guide to consciousness.",
    "Do not reference or imitate specific protected names, characters, companies, visual marks, or source dialogue.",
    "The tone is weird, warm, practical, and lightly mischievous.",
    "Explain: capture first, organize later; collaborate as you go when it helps; Billy as guide not authority; rooms as different modes; privacy and ownership; exports; and why the user does not need to understand a fragment before saving it.",
  ].join(" ");
}

export function buildProfileModuleLandscapeCopy(moduleCount: number): string {
  const label = moduleCount === 1 ? "module" : "modules";
  return `${moduleCount} user-facing ${label} in your GestaltView profile landscape. Explore, create, and refine the parts that are actually available to you.`;
}

export function getBetaAnalyticsAccess(input: {
  tier: string | null | undefined;
  isAdmin?: boolean;
}): { visible: boolean; reason?: string } {
  if (input.isAdmin || hasPaidTierAccess(input.tier)) {
    return { visible: true };
  }

  return {
    visible: false,
    reason: "Analytics is hidden during beta for this account while operational telemetry is hardened.",
  };
}
