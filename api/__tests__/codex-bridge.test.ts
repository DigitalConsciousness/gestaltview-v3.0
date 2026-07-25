import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratedArtifact, ProvenanceEnvelope } from "../../shared/gen-engine/types.js";

const insertedRows: Array<{ table: string; row: Record<string, unknown> }> = [];

vi.mock("../_lib/supabase.js", () => ({
  insertRow: vi.fn(async (table: string, row: Record<string, unknown>) => {
    insertedRows.push({ table, row });
    return row;
  }),
}));

const artifact: GeneratedArtifact = {
  id: "blueprint-e8bfc550-3a88-417c-af95-5ec2479f2188",
  userId: "11111111-1111-4111-8111-111111111111",
  type: "blueprint-markdown",
  title: "Blueprint Draft",
  content: "# Blueprint",
  contentFormat: "markdown",
  destination: "download-only",
  sourceCaptureIds: ["capture-1", "22222222-2222-4222-8222-222222222222"],
  sourceArtifactIds: ["blueprint-e8bfc550-3a88-417c-af95-5ec2479f2188"],
  createdAt: "2026-06-12T00:00:00.000Z",
  metadata: {},
};

const provenance: ProvenanceEnvelope = {
  artifactId: artifact.id,
  sourceCaptureIds: artifact.sourceCaptureIds,
  sourceHashes: ["hash-1"],
  artifactHash: "artifact-hash",
  transformType: "synthesis",
  generatedAt: "2026-06-12T00:00:00.000Z",
  engineVersion: "test",
};

describe("Codex bridge Supabase persistence", () => {
  beforeEach(() => {
    insertedRows.length = 0;
  });

  it("keeps prefixed gen-engine and source IDs out of UUID columns", async () => {
    const { bridgeToCodex } = await import("../_lib/codexBridge.js");

    await bridgeToCodex(artifact, provenance);

    const created = insertedRows.find((entry) => entry.table === "created_artifacts")?.row;
    const envelope = insertedRows.find((entry) => entry.table === "artifact_provenance_envelopes")?.row;

    expect(created?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created?.sourcecaptureids).toEqual(["22222222-2222-4222-8222-222222222222"]);
    expect(created?.sourceartifactids).toEqual(["e8bfc550-3a88-417c-af95-5ec2479f2188"]);
    expect(created?.metadata).toMatchObject({
      gen_artifact_id: artifact.id,
      source_capture_ids: artifact.sourceCaptureIds,
      source_artifact_ids: artifact.sourceArtifactIds,
    });
    expect(envelope?.artifactid).toBe(created?.id);
    expect(envelope).not.toHaveProperty("genartifactid");
  });
});
