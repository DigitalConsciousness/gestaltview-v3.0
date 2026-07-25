import type { BillyTier } from "./billy/types.js";

export type EntitlementTier = BillyTier | "anonymous" | "free" | "core" | "pro" | "enterprise" | "founder";

export const ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT = 1;
export const FREE_TRANSCRIPTORY_AUDIO_UPLOAD_BYTES = 10 * 1024 * 1024;
export const PAID_TRANSCRIPTORY_AUDIO_UPLOAD_BYTES = 100 * 1024 * 1024;
export const FREE_LARGE_FILE_IMPORT_BYTES = 5 * 1024 * 1024;
export const PAID_LARGE_FILE_IMPORT_BYTES = 50 * 1024 * 1024;

export function normalizeEntitlementTier(value: string | null | undefined): EntitlementTier {
  const tier = (value ?? "").trim().toLowerCase();
  if (
    tier === "free" ||
    tier === "core" ||
    tier === "pro" ||
    tier === "enterprise" ||
    tier === "founder"
  ) {
    return tier;
  }

  return "anonymous";
}

export function hasPaidTierAccess(tier: string | null | undefined): boolean {
  const normalized = normalizeEntitlementTier(tier);
  return (
    normalized === "core" ||
    normalized === "pro" ||
    normalized === "enterprise" ||
    normalized === "founder"
  );
}

export function isAdvancedTribunalRequest(input: {
  participants?: unknown;
  defaultParticipantCount?: number;
}): boolean {
  if (Array.isArray(input.participants)) {
    return input.participants.length > ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT;
  }

  return (input.defaultParticipantCount ?? 0) > ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT;
}

export function canUseAdvancedTribunal(input: {
  tier?: string | null;
  betaEnabled?: boolean;
}): boolean {
  return Boolean(input.betaEnabled) || hasPaidTierAccess(input.tier);
}

export function canUseWorkspaceMutations(input: {
  tier?: string | null;
  isAdmin?: boolean;
  betaEnabled?: boolean;
}): boolean {
  return Boolean(input.isAdmin || input.betaEnabled) || hasPaidTierAccess(input.tier);
}

export function getTranscriptoryAudioUploadLimitBytes(tier: string | null | undefined): number {
  return hasPaidTierAccess(tier)
    ? PAID_TRANSCRIPTORY_AUDIO_UPLOAD_BYTES
    : FREE_TRANSCRIPTORY_AUDIO_UPLOAD_BYTES;
}

export function getLargeFileImportLimitBytes(tier: string | null | undefined): number {
  return hasPaidTierAccess(tier) ? PAID_LARGE_FILE_IMPORT_BYTES : FREE_LARGE_FILE_IMPORT_BYTES;
}

export function isOverEntitlementLimit(
  sizeBytes: number | null | undefined,
  limitBytes: number,
): boolean {
  return typeof sizeBytes === "number" && Number.isFinite(sizeBytes) && sizeBytes > limitBytes;
}

export function buildEntitlementBlock(feature: string, message?: string) {
  return {
    error: "upgrade_required",
    feature,
    message: message ?? "This advanced collaboration mode is available on Core and higher plans.",
  };
}
