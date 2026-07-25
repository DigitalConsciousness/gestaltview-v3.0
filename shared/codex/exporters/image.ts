import type { CodexArtifact } from "../contracts.js";

export type ImageExportRequest = {
  artifact: Extract<CodexArtifact, { kind: "share_card" }> | Extract<CodexArtifact, { kind: "mind_map" }> | Extract<CodexArtifact, { kind: "spatial_scene" }>;
  format: "png";
};

export async function exportImage(_request: ImageExportRequest): Promise<Buffer> {
  throw new Error("Image export requires a deterministic renderer worker and must run in the durable Codex export lane.");
}
