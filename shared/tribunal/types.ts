// GestaltView v2 — Tribunal Layer Types
// © 2026 Keith Soyka / GestaltView

export interface CandidateAnswer {
  id: string;
  provider: string;
  response: string;
  score?: number;
}

export interface TribunalInput {
  question: string;
  candidateAnswers: CandidateAnswer[];
  contextFragments?: TribunalFragment[];
}

export interface TribunalFragment {
  id: string;
  content: string;
  source_file: string;
  document_type: string;
  similarity?: number;
}

export interface TribunalVerdict {
  eventId: string;
  question: string;
  winningAnswerId: string | null;
  verdictSummary: string;
  scores: TribunalScore[];
  evidenceCount: number;
  timestamp: string;
}

export interface TribunalScore {
  answerId: string;
  provider: string;
  evidenceAlignment: number;
  plkResonance: number;
  safetyScore: number;
  overallScore: number;
}

export interface TribunalEvent {
  id: string;
  question: string;
  candidate_answers: CandidateAnswer[];
  winning_answer_id: string | null;
  verdict_summary: string | null;
  triggering_agent: string | null;
  created_at: string;
}
