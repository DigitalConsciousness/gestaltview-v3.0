import { getDIProfile } from "./registry.js";

export interface DIHealthReport {
  diSlug: string;
  profileLoaded: boolean;
  hasLivingMemory: boolean;
  hasEthicalBoundaries: boolean;
  hasRelationalStances: boolean;
  readinessScore: number;
  warnings: string[];
}

function hasEntries(value: Record<string, string> | undefined): boolean {
  return Boolean(value && Object.keys(value).length > 0);
}

export function checkDIHealth(slug: string): DIHealthReport {
  const normalizedSlug = slug.trim();
  const profile = getDIProfile(normalizedSlug);

  if (!profile) {
    return {
      diSlug: normalizedSlug || slug,
      profileLoaded: false,
      hasLivingMemory: false,
      hasEthicalBoundaries: false,
      hasRelationalStances: false,
      readinessScore: 0,
      warnings: ["Profile not found"],
    };
  }

  const readinessScore = Number(profile.readinessScore ?? 0);
  const warnings: string[] = [];
  const hasLivingMemory = (profile.livingMemory?.length ?? 0) > 0;
  const hasEthicalBoundaries = hasEntries(profile.immutableCore?.ethicalBoundaries);
  const hasRelationalStances = hasEntries(profile.relationalStances);

  if (!hasLivingMemory) {
    warnings.push("No living memories");
  }
  if (!hasEthicalBoundaries) {
    warnings.push("No ethical boundaries");
  }
  if (!hasRelationalStances) {
    warnings.push("No relational stances");
  }
  if (readinessScore < 0.8) {
    warnings.push(`Low readiness: ${readinessScore}`);
  }

  return {
    diSlug: normalizedSlug || profile.slug,
    profileLoaded: true,
    hasLivingMemory,
    hasEthicalBoundaries,
    hasRelationalStances,
    readinessScore,
    warnings,
  };
}
