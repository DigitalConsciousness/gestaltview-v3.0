// GestaltView v2 — Perplexity Computer Tool: symbiocoder_edit
// © 2026 Keith Soyka / GestaltView
//
// Fetches a file from a GestaltView GitHub repository, uses Claude
// to propose edits based on natural-language instructions, and
// outputs a patch suitable for a pull request.

export interface SymbiocoderEditInput {
  repo: "goc" | "v2";
  filePath: string;
  instructions: string;
}

export interface SymbiocoderEditOutput {
  originalPath: string;
  repo: string;
  patch: string;
  summary: string;
  linesChanged: number;
  timestamp: string;
}

export const definition = {
  name: "symbiocoder_edit",
  description:
    "Propose code edits to a file in a GestaltView GitHub repository. " +
    "Fetches the target file, uses Claude Opus 4.6 to generate edits " +
    "based on natural-language instructions, and returns a unified diff patch. " +
    "The patch can be applied via PR. Supports both the Official Compendium (goc) " +
    "and v2 platform (v2) repositories.",
  parameters: {
    type: "object" as const,
    properties: {
      repo: {
        type: "string",
        enum: ["goc", "v2"],
        description:
          "'goc' — GestaltView-Official-Compendium repository. " +
          "'v2' — gestaltview-v2 platform repository.",
      },
      filePath: {
        type: "string",
        description: "Path to the file within the repository (e.g., 'client/src/pages/Home.tsx').",
      },
      instructions: {
        type: "string",
        description:
          "Natural-language instructions for the edit (e.g., 'Add a loading spinner to the submit button').",
      },
    },
    required: ["repo", "filePath", "instructions"],
  },
  risks: [
    "Generated patches are AI-proposed and must be reviewed before merging.",
    "File path must exist in the target repository — invalid paths will error.",
    "Large files may be truncated before processing.",
  ],
  guardrails: [
    "Patches are returned as unified diffs — never applied automatically.",
    "All edits follow AGENTS.md conventions: full file replacement, TypeScript strict, Neural Aurora design.",
    "The tool does not have write access to repositories — output is advisory only.",
    "Instructions are validated for safety — no destructive operations.",
  ],
};
