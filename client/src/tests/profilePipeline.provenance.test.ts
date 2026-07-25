import { describe, expect, it } from "vitest";

import {
  createArtifact,
  createInMemoryProfilePipelineStore,
  recordCapture,
} from "@/lib/profilePipeline/client";

describe("profile pipeline provenance", () => {
  it("creates provenance envelopes for artifact promotion boundaries", async () => {
    const store = createInMemoryProfilePipelineStore();
    const capture = await recordCapture(
      {
        ownerUserId: "user-1",
        room: "blackboard-room",
        sourceType: "text",
        originalText: "A source fragment with stable provenance.",
      },
      { store },
    );

    const artifact = await createArtifact(
      {
        ownerUserId: "user-1",
        title: "Stable Artifact",
        body: "A visible artifact projection.",
        artifactType: "markdown",
        sourceCaptureIds: [capture.captureId],
        operations: ["capture_to_artifact"],
      },
      { store },
    );

    expect(artifact.provenance.contentHash).toMatch(/^sha256:/);
    expect(artifact.provenance.sourceCaptureIds).toEqual([capture.captureId]);
    expect(artifact.provenance.privacyClass).toBe("private");
    expect(artifact.provenance.consentState).toMatchObject({
      tier: "private_default",
    });
  });
});
