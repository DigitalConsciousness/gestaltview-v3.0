import { describe, expect, it } from "vitest";

import {
  advancedTribunalLockText,
  canUseAdvancedTribunal,
  canUseWorkspaceMutations,
  getLargeFileImportLimitBytes,
  getTranscriptoryAudioUploadLimitBytes,
  hasPaidTierAccess,
  isOverEntitlementLimit,
  largeFileImportLockText,
  normalizeEntitlementTier,
  transcriptoryAudioUploadLockText,
  workspaceLockText,
} from "@/lib/entitlements";

describe("entitlement helpers", () => {
  it("normalizes unknown tiers to anonymous", () => {
    expect(normalizeEntitlementTier(undefined)).toBe("anonymous");
    expect(normalizeEntitlementTier("")).toBe("anonymous");
    expect(normalizeEntitlementTier("mystery")).toBe("anonymous");
    expect(normalizeEntitlementTier(" Pro ")).toBe("pro");
  });

  it("keeps advanced tribunal access on paid tiers or explicit beta only", () => {
    expect(canUseAdvancedTribunal({ tier: "anonymous" })).toBe(false);
    expect(canUseAdvancedTribunal({ tier: "free" })).toBe(false);
    expect(canUseAdvancedTribunal({ tier: "core" })).toBe(true);
    expect(canUseAdvancedTribunal({ tier: "pro" })).toBe(true);
    expect(canUseAdvancedTribunal({ tier: "enterprise" })).toBe(true);
    expect(canUseAdvancedTribunal({ tier: "free", betaEnabled: true })).toBe(true);
  });

  it("uses paid-tier access for Core and higher", () => {
    expect(hasPaidTierAccess("free")).toBe(false);
    expect(hasPaidTierAccess("core")).toBe(true);
    expect(hasPaidTierAccess("pro")).toBe(true);
    expect(hasPaidTierAccess("enterprise")).toBe(true);
  });

  it("returns clear lock copy for anonymous and free users", () => {
    expect(advancedTribunalLockText("anonymous")).toContain("Sign in");
    expect(advancedTribunalLockText("free")).toContain("Core");
  });

  it("keeps workspace mutations on Core and higher unless admin overrides", () => {
    expect(canUseWorkspaceMutations({ tier: "free" })).toBe(false);
    expect(canUseWorkspaceMutations({ tier: "core" })).toBe(true);
    expect(canUseWorkspaceMutations({ tier: "free", isAdmin: true })).toBe(true);
    expect(workspaceLockText("anonymous")).toContain("Sign in");
    expect(workspaceLockText("free")).toContain("Core");
  });

  it("publishes shared upload limits for client preflight", () => {
    const freeFileLimit = getLargeFileImportLimitBytes("free");
    const paidFileLimit = getLargeFileImportLimitBytes("core");
    const freeAudioLimit = getTranscriptoryAudioUploadLimitBytes("free");
    const paidAudioLimit = getTranscriptoryAudioUploadLimitBytes("pro");

    expect(freeFileLimit).toBeLessThan(paidFileLimit);
    expect(freeAudioLimit).toBeLessThan(paidAudioLimit);
    expect(isOverEntitlementLimit(freeFileLimit + 1, freeFileLimit)).toBe(true);
    expect(isOverEntitlementLimit(freeAudioLimit, freeAudioLimit)).toBe(false);
    expect(largeFileImportLockText("free")).toContain("MB");
    expect(transcriptoryAudioUploadLockText("free")).toContain("Transcriptory");
  });
});
