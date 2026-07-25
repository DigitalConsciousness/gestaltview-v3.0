// © 2026 Keith Soyka — GestaltView
// Vibe Coder — TypeScript types

export interface VibeProfile {
  vibeId: string;
  song: string;
  artist?: string;
  emotionScores: {
    energy?: number;
    joy?: number;
    melancholy?: number;
    tension?: number;
    serenity?: number;
    [key: string]: number | undefined;
  };
  personalityDimensions: string[];
  coreNarrative: string;
  creativeSignature: string;
  analyzedAt: string;
}

export interface VibeAnalyzeRequest {
  song: string;
  artist?: string;
  userId?: string;
}

export interface VibeAnalyzeResponse {
  response: VibeProfile;
  provider: string;
  timestamp: string;
}

export interface VibeSuggestion {
  prompt: string;
  action: string;
}

export interface VibeSuggestionsResponse {
  response: {
    suggestions: VibeSuggestion[];
  };
  provider: string;
  timestamp: string;
}
