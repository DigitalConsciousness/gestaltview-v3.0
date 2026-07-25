import type { RenderableArtifact } from "../types";

export function resolveVideoSource(artifact: RenderableArtifact): string {
  const content = artifact.content.trim();

  if (
    content.startsWith("data:") ||
    content.startsWith("blob:") ||
    content.startsWith("http://") ||
    content.startsWith("https://")
  ) {
    return content;
  }

  return `data:${artifact.mimeType ?? "video/mp4"};base64,${artifact.content}`;
}

export function describeVideoArtifact(artifact: RenderableArtifact): string {
  const title = artifact.title?.trim() || "Moving picture";
  const mimeType = artifact.mimeType ?? "video/mp4";
  return `${title} · ${mimeType}`;
}
