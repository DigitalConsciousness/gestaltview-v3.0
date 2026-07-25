import { describe, expect, it } from "vitest";

import {
  createInMemoryProfilePipelineStore,
  recordCapture,
  releaseCaptureToScaffold,
} from "@/lib/profilePipeline/client";

describe("profile pipeline capture flow", () => {
  it("preserves original text and requires explicit scaffold release", async () => {
    const store = createInMemoryProfilePipelineStore();

    const capture = await recordCapture(
      {
        ownerUserId: "user-1",
        room: "sanctuary",
        sourceType: "text",
        originalText: "Keep my exact source language.",
      },
      { store },
    );

    const mutated = await store.updateCapture(capture.captureId, {
      normalizedText: "summary only",
      preservationStatus: "private",
    });

    expect(mutated.originalText).toBe("Keep my exact source language.");
    expect(await store.listScaffoldNodes()).toEqual([]);

    const node = await releaseCaptureToScaffold(
      {
        captureId: capture.captureId,
        actorType: "user",
      },
      { store },
    );

    expect(node.reviewState).toBe("pending");
    expect(node.sourceCaptureIds).toEqual([capture.captureId]);
  });

  it("does not allow silent deletion of a capture", async () => {
    const store = createInMemoryProfilePipelineStore();
    const capture = await recordCapture(
      {
        ownerUserId: "user-1",
        room: "blackboard-room",
        sourceType: "text",
        originalText: "This needs explicit consent before deletion.",
      },
      { store },
    );

    await expect(
      store.updateCapture(capture.captureId, {
        preservationStatus: "deleted_by_user",
      }),
    ).rejects.toThrow(/explicit user action/i);
  });
});
