import type { ProfilePortrait } from "./profilePortrait.js";

export type ProfileIngestionStatus = "pending" | "processing" | "complete" | "error";

export type ProfileSourceType =
  | "journal"
  | "resume"
  | "transcript"
  | "music_dna"
  | "lived_experience"
  | "profile_upload";

export type PersonalityMutationClass = "immutable" | "stable" | "dynamic";

export interface ProfileIngestionRequest {
  userId: string;
  sources: {
    journals?: string[];
    resume?: string;
    transcripts?: string[];
    musicDNA?: string;
    profileUpload?: {
      fileName: string;
      content: string;
      mimeType?: string;
    };
    livedExperience?: {
      narrative: string;
      keyTurningPoints?: string[];
      currentChallenges?: string[];
    };
  };
  contextFraming?: string;
  includeInPLK?: boolean;
  outputFormat?: "full" | "summary";
}

export interface PersonalityDimension {
  dimensionId: string;
  dimensionKey: string;
  dimensionLabel: string;
  dimensionValue: {
    summary: string;
    traits: string[];
    sourceTypes: ProfileSourceType[];
  };
  evidenceFragments: string[];
  salience: number;
  mutationClass: PersonalityMutationClass;
  confidence: number;
}

export interface PersonalityProfile {
  dimensions: PersonalityDimension[];
  keyThemes: string[];
  unresolvedTensions: string[];
  coreNarrative: string;
}

export interface ProfileIngestionResponse {
  runId: string;
  status: ProfileIngestionStatus;
  personalityProfile: PersonalityProfile;
  metadata: {
    sourcesProcessed: number;
    confidenceScore: number;
    processingTimeMs: number;
    plkFragmentsCreated: number;
    persistence: "stored" | "skipped" | "partial";
  };
}

export interface DynamicInnerWorldArtifact {
  id: string;
  type: "resume" | "skill" | "personality" | "plk" | "document";
  title: string;
  summary: string;
  content: string;
  metadata: Record<string, unknown>;
  salience: number;
  sourceId: string;
  updatedAt: string;
}

export interface DynamicInnerWorldResponse {
  artifacts: DynamicInnerWorldArtifact[];
  profile: PersonalityProfile;
  portrait: ProfilePortrait | null;
  stats: {
    totalArtifacts: number;
    skillGrowth: number;
    recentUpdates: number;
    plkFragmentCount: number;
  };
  curatorPersonality: string;
}
