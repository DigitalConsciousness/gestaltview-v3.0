import type { RecapArtifact } from "@/components/SessionRecapGenerator";
import { appendInnerWorldArtifact, type InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function slugifyTags(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildBlackboardRecapInnerWorldArtifact(
  artifact: RecapArtifact,
  userId: string,
  sourceCaptureIds: string[],
): InnerWorldArtifactRecord {
  const now = new Date().toISOString();
  const summary = stripHtml(artifact.content).slice(0, 240) || artifact.metadata.sessionLabel || artifact.title;

  return {
    id: artifact.id,
    userId,
    title: artifact.title,
    summary,
    sourceFileId: null,
    html: artifact.content,
    thumbnailUrl: undefined,
    createdAt: artifact.metadata.generatedAt ?? now,
    updatedAt: now,
    originRoom: "blackboard",
    originDiId: artifact.metadata.sourceDiId ?? "recap-di",
    evidenceNodeIds: sourceCaptureIds.length > 0 ? sourceCaptureIds : [artifact.metadata.sessionLabel || artifact.id],
    tags: Array.from(
      new Set([
        "blackboard-room",
        "session-recap",
        artifact.metadata.sourceDiId ? `source-di-${slugifyTags(artifact.metadata.sourceDiId)}` : "source-di-recap-di",
        slugifyTags(artifact.metadata.sessionLabel || artifact.title),
      ]),
    ),
    // Session recaps begin queued in the Artifact Gallery and only surface in the
    // museum after an explicit publish action marks them ready.
    status: "queued",
  };
}

export function appendBlackboardRecapToInnerWorld(
  artifact: RecapArtifact,
  userId: string,
  sourceCaptureIds: string[],
): InnerWorldArtifactRecord[] {
  const innerWorldArtifact = buildBlackboardRecapInnerWorldArtifact(artifact, userId, sourceCaptureIds);
  return appendInnerWorldArtifact(innerWorldArtifact);
}
