// © 2026 Keith Soyka — GestaltView
// Symbio Coder — TypeScript types

export interface CodeAnalysis {
  language: string;
  complexity: number;
  lineCount: number;
  patterns: string[];
  issues: { type: string; message: string; line: number }[];
}

export interface SuggestionRequest {
  sessionId: string;
  code: string;
  language: string;
  suggestionType: 'explain' | 'optimize' | 'refactor';
}

export interface SuggestionResponse {
  response: {
    suggestion: string;
    suggestedCode?: string;
    explanation?: string;
  };
  provider: string;
  timestamp: string;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  codeContext: string;
  language: string;
}

export interface ChatResponse {
  response: {
    reply: string;
    suggestedEdits?: string;
  };
  provider: string;
  timestamp: string;
}
