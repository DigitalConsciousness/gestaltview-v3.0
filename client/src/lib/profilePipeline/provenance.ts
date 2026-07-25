import type { CreateArtifactInput, ProvenanceEnvelope } from "./types";

export async function buildProvenanceEnvelope(input: {
  subjectType: string;
  subjectId: string;
  content: unknown;
  artifactInput: CreateArtifactInput;
}): Promise<ProvenanceEnvelope> {
  const consentTier = input.artifactInput.consentTier ?? "private_default";
  const consentState = {
    tier: consentTier,
    ...(input.artifactInput.consentState ?? {}),
  };

  return {
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    contentHash: await sha256StableJson(input.content),
    canonicalizationMethod: "stable-json-v1",
    sourceCaptureIds: input.artifactInput.sourceCaptureIds ?? [],
    sourceArtifactIds: [],
    sourceScaffoldNodeIds: input.artifactInput.sourceScaffoldNodeIds ?? [],
    pipelineRunId: input.artifactInput.pipelineRunId,
    operations: input.artifactInput.operations ?? ["artifact.created"],
    privacyClass: consentTier === "public_allowed" ? "public" : "private",
    consentState,
    createdAt: new Date().toISOString(),
  };
}

async function sha256StableJson(value: unknown): Promise<string> {
  const payload = stableJson(value);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(payload);

  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return `sha256:${[...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`;
  }

  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return `sha256:fallback-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
    .join(",")}}`;
}
