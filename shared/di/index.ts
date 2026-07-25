export { getDIProfile, getAllActiveDIProfiles } from "./registry.js";
export { buildDIContextBlock, buildDIBootstrapPrompt, buildDIMessages, buildDISystemPrompt } from "./runtime.js";
export { checkDIHealth } from "./diagnostics.js";

export type { DIHealthReport } from "./diagnostics.js";
export type {
  DIProfile,
  DIMemoryEntry,
  DISkillCapability,
  DIToolCapability,
  DICapabilityManifest,
  DISessionContext,
  DIRequest,
  DIResponse,
} from "./types.js";
