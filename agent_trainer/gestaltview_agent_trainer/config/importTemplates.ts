import type { CorpusLane } from "./trainerBlueprint.js";

export interface ImportManifestEntry {
  title: string;
  lane: CorpusLane;
  sourceType: "file" | "url" | "text";
  sourceUri: string;
  audience: string;
  notes: string;
}

export interface ImportManifestTemplate {
  schemaVersion: string;
  projectName: string;
  owner: string;
  repoContainer: string;
  batchingStrategy: string;
  reviewChecklist: string[];
  entries: ImportManifestEntry[];
}

export function createImportManifestTemplate(): ImportManifestTemplate {
  return {
    schemaVersion: "1.1.0",
    projectName: "replace-with-project-name",
    owner: "replace-with-owner",
    repoContainer: "./.gsvw/repo-corpus/replace-with-repo-slug",
    batchingStrategy: "pilot-first",
    reviewChecklist: [
      "Start with 5-15 high-signal sources.",
      "Group repo docs into code/product/context before ingest.",
      "Keep large archives out of the first live batch."
    ],
    entries: [
      {
        title: "replace-with-foundation-doc",
        lane: "knowledge",
        sourceType: "file",
        sourceUri: "./staged/knowledge/your-document.md",
        audience: "internal",
        notes: "Describe why this source matters and how it should be chunked."
      },
      {
        title: "replace-with-repo-map",
        lane: "code",
        sourceType: "file",
        sourceUri: "./staged/code/repo-map.md",
        audience: "internal",
        notes: "Summarize modules, boundaries, and API surface before deeper code ingest."
      },
      {
        title: "replace-with-product-brief",
        lane: "product",
        sourceType: "file",
        sourceUri: "./staged/product/product-brief.md",
        audience: "internal",
        notes: "Keep roadmap and release context separate from raw support docs."
      },
      {
        title: "replace-with-voice-guide",
        lane: "context",
        sourceType: "file",
        sourceUri: "./staged/context/voice-guide.md",
        audience: "internal",
        notes: "Capture tone, positioning, and boundaries so responses stay aligned."
      }
    ]
  };
}
