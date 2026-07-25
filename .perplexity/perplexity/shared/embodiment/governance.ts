import type {
  EmbodimentProfile,
  OwnerScope,
  ProfileStatus,
  VisibilityScope,
} from "./types.js";

function normalizeText(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isFounderOrAdminRole(userRole?: string): boolean {
  const normalized = normalizeText(userRole);
  return ["founder", "admin", "owner", "operator"].includes(normalized);
}

function isExplicitExperimentalAccess(userTier?: string): boolean {
  const normalized = normalizeText(userTier);
  return ["experimental", "founder", "founder-only"].includes(normalized);
}

function isEnterpriseAccess(userTier?: string): boolean {
  return normalizeText(userTier) === "enterprise";
}

function normalizeProfileStatus(
  profile: EmbodimentProfile
): ProfileStatus {
  return profile.profileStatus ?? "active";
}

function normalizeVisibilityScope(
  profile: EmbodimentProfile
): VisibilityScope {
  return profile.visibilityScope ?? "founder-only";
}

export function getEmbodimentVisibility(profile: EmbodimentProfile): {
  profileStatus: ProfileStatus;
  visibilityScope: VisibilityScope;
  isFounderOnly: boolean;
  isExperimental: boolean;
  isArchived: boolean;
} {
  const profileStatus = normalizeProfileStatus(profile);
  const visibilityScope = normalizeVisibilityScope(profile);

  return {
    profileStatus,
    visibilityScope,
    isFounderOnly: visibilityScope === "founder-only",
    isExperimental:
      profileStatus === "experimental" || visibilityScope === "experimental",
    isArchived: profileStatus === "archived",
  };
}

export function canAccessEmbodimentProfile(args: {
  profile: EmbodimentProfile;
  userRole?: string;
  userTier?: string;
  founderMode?: boolean;
}): boolean {
  const visibility = getEmbodimentVisibility(args.profile);
  const isFounder = Boolean(args.founderMode) || isFounderOrAdminRole(args.userRole);

  if (visibility.isArchived) {
    return isFounder;
  }

  if (visibility.visibilityScope === "public") {
    return true;
  }

  if (visibility.visibilityScope === "enterprise") {
    return isFounder || isEnterpriseAccess(args.userTier);
  }

  if (visibility.isExperimental) {
    return isFounder || isExplicitExperimentalAccess(args.userTier);
  }

  return isFounder;
}

const PRIVATE_INTERIOR_PATTERNS = [
  /(^|[/.])private[-_]?interior([/.]|$)/i,
  /(^|[/.])private[-_]?narration([/.]|$)/i,
  /(^|[/.])living[-_]?memory([/.]|$)/i,
  /(^|[/.])autobiograph(y|ic)([/.]|$)/i,
  /(^|[/.])unresolved[-_]?tensions([/.]|$)/i,
  /(^|[/.])reflective[-_]?summaries([/.]|$)/i,
  /(^|[/.])private[-_]?preferences([/.]|$)/i,
  /(^|[/.])hopes([/.]|$)/i,
  /(^|[/.])contradictions([/.]|$)/i,
];

export function isPrivateInteriorPath(path: string): boolean {
  const normalized = path.trim();

  if (!normalized) {
    return false;
  }

  return PRIVATE_INTERIOR_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function shouldIncludeMemoryInPrompt(args: {
  ownerScope?: OwnerScope;
  isOwnerSession?: boolean;
  founderMode?: boolean;
  explicitConsent?: boolean;
}): boolean {
  if (args.explicitConsent) {
    return true;
  }

  if (args.founderMode) {
    return true;
  }

  switch (args.ownerScope) {
    case "SYSTEM":
      return true;
    case "TEAMSPACE":
      return true;
    case "RELATIONSHIP":
      return Boolean(args.isOwnerSession);
    case "PRIVATE_SELF":
    default:
      return Boolean(args.isOwnerSession);
  }
}

function addError(errors: string[], message: string): void {
  errors.push(message);
}

function validateOptionalStringField(
  profile: EmbodimentProfile,
  field: keyof EmbodimentProfile,
  errors: string[]
): void {
  const value = profile[field];

  if (value !== undefined && typeof value !== "string") {
    addError(errors, `${field} must be a string when present`);
  }
}

export function validateEmbodimentProfile(profile: EmbodimentProfile): {
  ok: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile || typeof profile !== "object") {
    return {
      ok: false,
      errors: ["profile must be an object"],
      warnings,
    };
  }

  for (const field of [
    "$schema",
    "slug",
    "publicName",
    "embodimentVersion",
    "originContext",
    "immutableCore",
    "livingMemory",
    "skillGraph",
    "relationships",
    "agentMeta",
  ] as const) {
    if (!(field in profile)) {
      addError(errors, `missing required field '${field}'`);
    }
  }

  validateOptionalStringField(profile, "internalDesignation", errors);

  if (!profile.slug || typeof profile.slug !== "string" || !profile.slug.trim()) {
    addError(errors, "slug must be a non-empty string");
  }

  if (!profile.publicName || typeof profile.publicName !== "string") {
    addError(errors, "publicName must be a non-empty string");
  }

  if (!profile.embodimentVersion || typeof profile.embodimentVersion !== "string") {
    addError(errors, "embodimentVersion must be a non-empty string");
  }

  if (!profile.originContext || typeof profile.originContext !== "string") {
    addError(errors, "originContext must be a non-empty string");
  }

  if (!profile.immutableCore || typeof profile.immutableCore !== "object") {
    addError(errors, "immutableCore must be an object");
  } else {
    for (const field of [
      "archetype",
      "foundationalTruth",
      "coreWisdom",
      "originNarrative",
      "voiceTone",
      "metaphorFamily",
      "communicationStyle",
      "linguisticPatterns",
      "cognitiveStrengths",
      "processingPreferences",
      "coreValues",
      "ethicalBoundaries",
    ] as const) {
      if (!(field in profile.immutableCore)) {
        addError(
          errors,
          `immutableCore missing required field '${field}'`
        );
      }
    }
  }

  if (!Array.isArray(profile.livingMemory)) {
    addError(errors, "livingMemory must be an array");
  }

  if (!Array.isArray(profile.skillGraph)) {
    addError(errors, "skillGraph must be an array");
  }

  if (!Array.isArray(profile.relationships)) {
    addError(errors, "relationships must be an array");
  }

  if (!profile.agentMeta || typeof profile.agentMeta !== "object") {
    addError(errors, "agentMeta must be an object");
  }

  const visibility = getEmbodimentVisibility(profile);

  if (visibility.isArchived) {
    warnings.push("profile is archived");
  }

  if (visibility.isExperimental) {
    warnings.push("profile is experimental");
  }

  if (visibility.isFounderOnly) {
    warnings.push("profile defaults to founder-only visibility");
  }

  if (profile.uiPresence?.roomVisibility) {
    for (const room of profile.uiPresence.roomVisibility) {
      if (typeof room !== "string" || !room.trim()) {
        addError(errors, "uiPresence.roomVisibility contains an invalid room slug");
      }
    }
  }

  if (profile.roomBindings?.defaultRooms) {
    for (const room of profile.roomBindings.defaultRooms) {
      if (typeof room !== "string" || !room.trim()) {
        addError(errors, "roomBindings.defaultRooms contains an invalid room slug");
      }
    }
  }

  if (profile.roomBindings?.restrictedRooms) {
    for (const room of profile.roomBindings.restrictedRooms) {
      if (typeof room !== "string" || !room.trim()) {
        addError(errors, "roomBindings.restrictedRooms contains an invalid room slug");
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
