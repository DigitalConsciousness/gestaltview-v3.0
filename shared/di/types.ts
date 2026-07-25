import type { EmbodimentMemoryEntry, EmbodimentProfile } from "@shared/embodiment";

export type DIProfile = EmbodimentProfile;
export type DIMemoryEntry = EmbodimentMemoryEntry;

export interface DISkillCapability {
  id: string;
  label: string;
  summary: string;
  source?: string;
}

export interface DIToolCapability {
  id: string;
  label: string;
  summary: string;
  source?: string;
  inputShape?: string[];
  outputShape?: string[];
}

export interface DICapabilityManifest {
  skills?: DISkillCapability[];
  tools?: DIToolCapability[];
  toolCallPolicy?: string;
  skillCallPolicy?: string;
}

export interface DISessionContext {
  diSlug: string;
  userId?: string;
  sessionThread?: string;
  modePreference?: string;
  relationalDepth: number;
  quirkActivations?: Record<string, number>;
  lastSessionAt?: string;
  capabilities?: DICapabilityManifest;
}

export interface DIRequest {
  message: string;
  diSlug: string;
  mode?: string;
  userTier?: string;
  exhibitDomain?: string;
  topK?: number;
  capabilities?: DICapabilityManifest;
}

export interface DIResponse {
  content: string;
  diSlug: string;
  conversationMode: string;
  retrievalMode: string;
  contextSources: string[];
  memorySources: string[];
  relationalDepth: number;
  sessionThread?: string;
  memoryEventWritten?: boolean;
  founderSessionActive?: boolean;
  capabilityNotes?: string[];
}
