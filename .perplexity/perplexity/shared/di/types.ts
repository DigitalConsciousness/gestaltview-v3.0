import type { EmbodimentMemoryEntry, EmbodimentProfile } from "@shared/embodiment";

export type DIProfile = EmbodimentProfile;
export type DIMemoryEntry = EmbodimentMemoryEntry;

export interface DISessionContext {
  diSlug: string;
  userId?: string;
  sessionThread?: string;
  modePreference?: string;
  relationalDepth: number;
  quirkActivations?: Record<string, number>;
  lastSessionAt?: string;
}

export interface DIRequest {
  message: string;
  diSlug: string;
  mode?: string;
  userTier?: string;
  exhibitDomain?: string;
  topK?: number;
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
}
