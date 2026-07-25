import { EMBODIMENT_PROFILES, resolveEmbodimentSlug } from "../embodiment/index.js";
import type { DIProfile } from "./types.js";

function normalizeProfileStatus(profile: DIProfile): DIProfile {
  return {
    ...profile,
    profileStatus: profile.profileStatus ?? "active",
  };
}

export function getDIProfile(slug: string): DIProfile | undefined {
  const resolvedSlug = resolveEmbodimentSlug(slug);
  if (!resolvedSlug) {
    return undefined;
  }

  const profile = EMBODIMENT_PROFILES[resolvedSlug] as
    | DIProfile
    | undefined;

  return profile ? normalizeProfileStatus(profile) : undefined;
}

export function getAllActiveDIProfiles(): DIProfile[] {
  return Object.values(EMBODIMENT_PROFILES)
    .map((profile) => normalizeProfileStatus(profile as DIProfile))
    .filter((profile) => profile.profileStatus === "active");
}
