import {
  ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT,
  FREE_LARGE_FILE_IMPORT_BYTES,
  FREE_TRANSCRIPTORY_AUDIO_UPLOAD_BYTES,
  PAID_LARGE_FILE_IMPORT_BYTES,
  PAID_TRANSCRIPTORY_AUDIO_UPLOAD_BYTES,
  canUseAdvancedTribunal,
  canUseWorkspaceMutations,
  getLargeFileImportLimitBytes,
  getTranscriptoryAudioUploadLimitBytes,
  hasPaidTierAccess,
  isOverEntitlementLimit,
  normalizeEntitlementTier,
} from "@shared/entitlements";

export {
  ADVANCED_TRIBUNAL_PARTICIPANT_LIMIT,
  FREE_LARGE_FILE_IMPORT_BYTES,
  FREE_TRANSCRIPTORY_AUDIO_UPLOAD_BYTES,
  PAID_LARGE_FILE_IMPORT_BYTES,
  PAID_TRANSCRIPTORY_AUDIO_UPLOAD_BYTES,
  canUseAdvancedTribunal,
  canUseWorkspaceMutations,
  getLargeFileImportLimitBytes,
  getTranscriptoryAudioUploadLimitBytes,
  hasPaidTierAccess,
  isOverEntitlementLimit,
  normalizeEntitlementTier,
};

export function advancedTribunalLockText(tier: string | null | undefined): string {
  const normalized = normalizeEntitlementTier(tier);
  if (normalized === "anonymous") {
    return "Sign in on Core or higher to invite multiple voices.";
  }

  return "Core unlocks multi-voice Tribunal sessions.";
}

export function workspaceLockText(tier: string | null | undefined): string {
  const normalized = normalizeEntitlementTier(tier);
  if (normalized === "anonymous") {
    return "Sign in on Core or higher to create and manage workspaces.";
  }

  return "Core unlocks workspace creation, editing, and shared room management.";
}

export function largeFileImportLockText(tier: string | null | undefined): string {
  const limitMb = Math.round(getLargeFileImportLimitBytes(tier) / 1024 / 1024);
  return `This plan supports file imports up to ${limitMb} MB. Core unlocks larger imports.`;
}

export function transcriptoryAudioUploadLockText(tier: string | null | undefined): string {
  const limitMb = Math.round(getTranscriptoryAudioUploadLimitBytes(tier) / 1024 / 1024);
  return `This plan supports Transcriptory uploads up to ${limitMb} MB. Core unlocks longer recordings.`;
}
