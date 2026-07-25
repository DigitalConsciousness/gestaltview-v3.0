// GestaltView v2 — Perplexity Computer Tool: retrieve_manifest_context
// © 2026 Keith Soyka / GestaltView
//
// Retrieves knowledge fragments from the Manifest Index via Supabase
// vector + text search. Used by Perplexity and Claude to ground
// responses in the GestaltView-Official-Compendium corpus.

export interface RetrieveManifestContextInput {
  query: string;
  plkProfile?: string;
  maxFragments?: number;
}

export interface ManifestFragment {
  id: string;
  content: string;
  source_file: string;
  document_type: string;
  similarity: number;
  plk_tags?: string[];
}

export interface RetrieveManifestContextOutput {
  fragments: ManifestFragment[];
  packageFilter: string | null;
  totalFragments: number;
  query: string;
}

export const definition = {
  name: "retrieve_manifest_context",
  description:
    "Retrieve knowledge fragments from the GestaltView Manifest Index. " +
    "Searches the GestaltView-Official-Compendium corpus using vector similarity " +
    "and full-text search. Supports PLK profile tagging and package-level filtering.",
  parameters: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description: "The search query to match against the Manifest Index corpus.",
      },
      plkProfile: {
        type: "string",
        description:
          "Optional PLK (Personal Language Key) profile string. " +
          "When provided, results are tagged with PLK resonance markers.",
      },
      maxFragments: {
        type: "number",
        description: "Maximum number of fragments to return (1–12). Defaults to 8.",
      },
    },
    required: ["query"],
  },
  risks: [
    "Returns corpus content that may include sensitive founder context or internal architecture details.",
    "Large maxFragments values increase response size and latency.",
  ],
  guardrails: [
    "maxFragments is clamped to 1–12 server-side.",
    "All returned fragments include source attribution.",
    "PLK profile is optional and never persisted by this tool.",
  ],
};
