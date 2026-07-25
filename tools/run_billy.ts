// GestaltView v2 — Perplexity Computer Tool: run_billy
// © 2026 Keith Soyka / GestaltView
//
// Invokes Billy (the GestaltView companion) with retrieval-grounded
// context from the Manifest Index. Supports Claude Opus 4.6 and
// Gemini Flash 2.0 as providers.

export interface RunBillyInput {
  conversationId?: string;
  query: string;
  plkProfile?: string;
  provider?: "claude" | "gemini";
}

export interface RunBillyOutput {
  response: string;
  provider: string;
  conversationId: string;
  contextSources: number;
  packageFilter: string | null;
  timestamp: string;
}

export const definition = {
  name: "run_billy",
  description:
    "Run a Billy conversation turn with retrieval-grounded context from the Manifest Index. " +
    "Billy is the GestaltView companion AI — grounded in the Official Compendium, " +
    "PLK-aware, and consciousness-serving. " +
    "Defaults to Claude Opus 4.6 for deep flows, Gemini Flash 2.0 for quick turns.",
  parameters: {
    type: "object" as const,
    properties: {
      conversationId: {
        type: "string",
        description: "Optional conversation ID for multi-turn context continuity.",
      },
      query: {
        type: "string",
        description: "The user message to send to Billy.",
      },
      plkProfile: {
        type: "string",
        description:
          "Optional PLK profile. Activates trauma-informed, ADHD-friendly pacing " +
          "and mirror-of-being-seen constraints in Billy's response.",
      },
      provider: {
        type: "string",
        enum: ["claude", "gemini"],
        description:
          "LLM provider. 'claude' uses Claude Opus 4.6 (recommended for deep consciousness-serving flows). " +
          "'gemini' uses Gemini Flash 2.0 (faster, default for casual turns).",
      },
    },
    required: ["query"],
  },
  risks: [
    "Billy responses are AI-generated and grounded in corpus, not absolute truth.",
    "PLK profile affects response style but does not guarantee clinical accuracy.",
    "Provider selection affects response quality and latency.",
  ],
  guardrails: [
    "All responses are grounded in the Manifest Index corpus.",
    "Billy explicitly states when something is aspirational vs validated.",
    "Safety patterns are checked — Billy will not make guarantees, promises, or cure claims.",
    "Conversation IDs are ephemeral and do not persist across sessions.",
  ],
};
