import type { ArtifactKind, CodexArtifact, ExportFormat } from "./contracts.js";

export const TEMPLATE_REGISTRY: Record<ArtifactKind, string> = {
  session_recap:   "session-recap-v1",
  blueprint:       "blueprint-v1",
  report_document: "report-document-v1",
  mind_map:        "mind-map-v1",
  share_card:      "share-card-v1",
  code_module:     "code-module-v1",
  spatial_scene:   "spatial-scene-v1",
  audio_narration: "audio-narration-v1",
};

export const EXPORTER_REGISTRY: Record<ArtifactKind, ExportFormat[]> = {
  session_recap:   ["html", "pdf", "mp3", "json"],
  blueprint:       ["html", "pdf", "json"],
  report_document: ["html", "pdf"],
  mind_map:        ["html", "png", "gltf"],
  share_card:      ["png", "html"],
  code_module:     ["zip", "html", "json"],
  spatial_scene:   ["html", "png", "gltf"],
  audio_narration: ["mp3", "wav", "json"],
};

export function getTemplateKey(kind: ArtifactKind): string {
  return TEMPLATE_REGISTRY[kind];
}

export function getAllowedExportFormats(kind: ArtifactKind): ExportFormat[] {
  return EXPORTER_REGISTRY[kind];
}

export function assertExportAllowed(artifact: CodexArtifact, format: ExportFormat): void {
  const allowed = EXPORTER_REGISTRY[artifact.kind];
  if (!allowed.includes(format)) {
    throw new Error(
      `Export format "${format}" is not allowed for artifact kind "${artifact.kind}". Allowed: ${allowed.join(", ")}.`,
    );
  }
}
