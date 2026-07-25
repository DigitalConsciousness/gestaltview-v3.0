// GestaltView v2 — Perplexity Computer Tool: generate_diligence_report
// © 2026 Keith Soyka / GestaltView
//
// Generates structured diligence reports from the Manifest Index
// and Diligence_Reports corpus. Uses Claude Opus 4.6 for assembly.

export interface GenerateDiligenceReportInput {
  topic: string;
  audience: "investor" | "clinical" | "founder";
  level: "summary" | "deep";
}

export interface GenerateDiligenceReportOutput {
  report: string;
  topic: string;
  audience: string;
  level: string;
  sourcesUsed: number;
  timestamp: string;
}

export const definition = {
  name: "generate_diligence_report",
  description:
    "Generate a structured diligence report from the GestaltView Manifest Index " +
    "and Diligence_Reports corpus. Pulls evidence from IP Dossier, Metrics, Screenshots, " +
    "and domain-specific exhibits. Uses Claude Opus 4.6 to assemble a markdown-formatted " +
    "report tailored to the specified audience and depth level.",
  parameters: {
    type: "object" as const,
    properties: {
      topic: {
        type: "string",
        description:
          "The diligence topic (e.g., 'PLK methodology validation', " +
          "'ADHD-friendly UX evidence', 'blockchain timestamping proof').",
      },
      audience: {
        type: "string",
        enum: ["investor", "clinical", "founder"],
        description:
          "'investor' — focused on market validation, metrics, and defensibility. " +
          "'clinical' — focused on methodology evidence and safety. " +
          "'founder' — focused on technical architecture and implementation status.",
      },
      level: {
        type: "string",
        enum: ["summary", "deep"],
        description:
          "'summary' — 1-2 page executive overview. " +
          "'deep' — comprehensive report with full evidence citations.",
      },
    },
    required: ["topic", "audience", "level"],
  },
  risks: [
    "Reports may reference prototype-stage features — always note implementation status.",
    "Clinical audience reports should not be interpreted as clinical validation.",
    "Investor reports include metrics that may be self-reported or aspirational.",
  ],
  guardrails: [
    "All claims are grounded in corpus evidence with source attribution.",
    "Report explicitly distinguishes validated vs aspirational features.",
    "Language follows GestaltView Communication & Language Guide — no hype.",
    "Reports are generated as markdown, not PDF — downstream formatting is the caller's responsibility.",
  ],
};
