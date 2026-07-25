import { EMBODIMENT_PROFILES } from "../embodiment/index.js";
import type { DIProfile } from "./types.js";

function normalizeProfileStatus(profile: DIProfile): DIProfile {
  return {
    ...profile,
    profileStatus: profile.profileStatus ?? "active",
  };
}

export function getDIProfile(slug: string): DIProfile | undefined {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return undefined;
  }

  const profile = EMBODIMENT_PROFILES[normalizedSlug as keyof typeof EMBODIMENT_PROFILES] as
    | DIProfile
    | undefined;

  return profile ? normalizeProfileStatus(profile) : undefined;
}

export function getAllActiveDIProfiles(): DIProfile[] {
  return Object.values(EMBODIMENT_PROFILES)
    .map((profile) => normalizeProfileStatus(profile as DIProfile))
    .filter((profile) => profile.profileStatus === "active");
}
