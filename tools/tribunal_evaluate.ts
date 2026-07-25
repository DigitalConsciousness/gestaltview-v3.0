// GestaltView v2 — Perplexity Computer Tool: tribunal_evaluate
// © 2026 Keith Soyka / GestaltView
//
// Runs a Tribunal evaluation — scores multiple candidate answers
// against corpus evidence, PLK resonance, and safety constraints.
// Uses Claude Opus 4.6 for deep evaluation.

export interface CandidateAnswer {
  id: string;
  provider: string;
  response: string;
}

export interface ContextFragment {
  id: string;
  content: string;
  source_file: string;
  document_type: string;
  similarity?: number;
}

export interface TribunalEvaluateInput {
  question: string;
  candidateAnswers: CandidateAnswer[];
  contextFragments?: ContextFragment[];
}

export interface TribunalScore {
  answerId: string;
  provider: string;
  evidenceAlignment: number;
  plkResonance: number;
  safetyScore: number;
  overallScore: number;
}

export interface TribunalEvaluateOutput {
  eventId: string;
  question: string;
  winningAnswerId: string | null;
  verdictSummary: string;
  scores: TribunalScore[];
  evidenceCount: number;
  timestamp: string;
}

export const definition = {
  name: "tribunal_evaluate",
  description:
    "Evaluate multiple candidate AI answers using the GestaltView Tribunal framework. " +
    "Scores each candidate on evidence alignment (corpus grounding), " +
    "PLK resonance (consciousness-serving language fidelity), and safety " +
    "(absence of guarantees, cure claims, or unsafe language). " +
    "Logs a tribunal_event in Supabase for audit trail.",
  parameters: {
    type: "object" as const,
    properties: {
      question: {
        type: "string",
        description: "The original question that candidate answers are responding to.",
      },
      candidateAnswers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique answer ID." },
            provider: { type: "string", description: "Provider name (e.g., 'claude', 'gemini', 'openai')." },
            response: { type: "string", description: "The candidate's full response text." },
          },
          required: ["id", "provider", "response"],
        },
        description: "Array of candidate answers to evaluate (minimum 2).",
      },
      contextFragments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            content: { type: "string" },
            source_file: { type: "string" },
            document_type: { type: "string" },
          },
          required: ["id", "content", "source_file", "document_type"],
        },
        description: "Optional pre-retrieved context fragments. If omitted, the tool re-retrieves from Manifest Index.",
      },
    },
    required: ["question", "candidateAnswers"],
  },
  risks: [
    "Evaluation scores are heuristic-based and supplemented by LLM judgment — not absolute.",
    "Candidate answers with corpus-matching keywords may score artificially high on evidence alignment.",
    "Tribunal events are logged to Supabase and visible in the /tribunal route.",
  ],
  guardrails: [
    "Minimum 2 candidate answers required.",
    "Safety scoring penalizes guarantee/cure/promise language.",
    "PLK resonance rewards preservation of user's exact words and context.",
    "All evaluations include source attribution and are auditable.",
  ],
};
