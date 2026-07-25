import {
  EMBODIMENT_PROFILES,
  buildRoomAwareEmbodimentPrompt,
  getEmbodimentProfile,
  getGovernedEmbodimentProfile,
  resolveRoomEmbodimentSlug,
} from "@shared/embodiment";
import type {
  EmbodimentProfile,
  RoomSlug,
} from "@shared/embodiment";
import {
  isPrivateInteriorPath,
  getEmbodimentVisibility,
} from "@shared/embodiment/governance";

function sortedProfiles(): EmbodimentProfile[] {
  return (Object.values(EMBODIMENT_PROFILES) as EmbodimentProfile[]).sort(
    (left, right) => left.slug.localeCompare(right.slug)
  );
}

function firstEthicalBoundary(profile: EmbodimentProfile): string | undefined {
  const boundaries = Object.values(profile.immutableCore.ethicalBoundaries ?? {});
  return boundaries.find((value) => typeof value === "string" && value.trim().length > 0);
}

function normalizePulseStyle(value?: string): string {
  switch (value) {
    case "active":
    case "dim":
    case "glowing":
    case "calm":
    case "steady":
      return value;
    default:
      return "calm";
  }
}

function normalizeProfileStatus(value?: string): string {
  switch (value) {
    case "draft":
    case "active":
    case "founder-only":
    case "experimental":
    case "archived":
      return value;
    default:
      return "active";
  }
}

function normalizeVisibilityScope(value?: string): string {
  switch (value) {
    case "public":
    case "founder-only":
    case "enterprise":
    case "experimental":
      return value;
    default:
      return "founder-only";
  }
}

export function getAllEmbodimentProfiles(): EmbodimentProfile[] {
  return sortedProfiles();
}

export function getProfileBySlug(slug: string): EmbodimentProfile | null {
  const normalized = slug.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return getEmbodimentProfile(normalized);
}

export function getActiveRoomProfile(roomSlug: RoomSlug): EmbodimentProfile | null {
  const resolvedSlug = resolveRoomEmbodimentSlug(roomSlug);
  return resolvedSlug ? getProfileBySlug(resolvedSlug) : null;
}

export function getEmbodimentUIPresence(profile: EmbodimentProfile): {
  name: string;
  badge: string;
  capabilitySummary: string;
  boundaryNote?: string;
  orbColor: string;
  orbPulseStyle: string;
  avatarStyle: string;
  profileStatus: string;
  visibilityScope: string;
} {
  const visibility = getEmbodimentVisibility(profile);
  const uiPresence = profile.uiPresence;

  return {
    name: profile.publicName,
    badge: uiPresence?.displayBadge ?? profile.immutableCore.archetype,
    capabilitySummary:
      uiPresence?.capabilitySummary ?? profile.immutableCore.coreWisdom,
    boundaryNote: uiPresence?.boundaryNote ?? firstEthicalBoundary(profile),
    orbColor: uiPresence?.orbColor ?? "#8f00ff",
    orbPulseStyle: normalizePulseStyle(uiPresence?.orbPulseStyle),
    avatarStyle: uiPresence?.avatarStyle ?? "liquid-glass-orb",
    profileStatus: normalizeProfileStatus(profile.profileStatus ?? visibility.profileStatus),
    visibilityScope: normalizeVisibilityScope(
      profile.visibilityScope ?? visibility.visibilityScope
    ),
  };
}

export function getEmbodimentGovernanceSummary(profile: EmbodimentProfile): {
  founderOnly: boolean;
  experimental: boolean;
  archived: boolean;
  privateInteriorProtected: boolean;
  reviewGated: boolean;
} {
  const visibility = getEmbodimentVisibility(profile);
  const governed = getGovernedEmbodimentProfile(profile);
  const privateInteriorProtected = Boolean(
    governed.memorySystem.privateInterior &&
      (governed.governance.sharingPolicy.privateInteriorDefault === "private" ||
        isPrivateInteriorPath("memorySystem/privateInterior"))
  );
  const reviewGated =
    visibility.isArchived ||
    visibility.isExperimental ||
    visibility.isFounderOnly ||
    privateInteriorProtected;

  return {
    founderOnly: visibility.isFounderOnly,
    experimental: visibility.isExperimental,
    archived: visibility.isArchived,
    privateInteriorProtected,
    reviewGated,
  };
}

export function buildRoomAwareEmbodimentClientPrompt(
  slug: string,
  roomSlug: RoomSlug,
  options: Parameters<typeof buildRoomAwareEmbodimentPrompt>[2] = {}
): string | null {
  const profile = getProfileBySlug(slug);

  if (!profile) {
    return null;
  }

  return buildRoomAwareEmbodimentPrompt(profile, roomSlug, options);
}
