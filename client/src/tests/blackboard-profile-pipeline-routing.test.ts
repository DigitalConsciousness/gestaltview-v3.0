import { describe, expect, it, vi } from "vitest";

import { createCaptureOrb, type CaptureOrb } from "@/components/Scaffold";
import { routeBlackboardCaptureThroughPipeline } from "@/lib/profilePipeline/blackboardRouting";
import { createInMemoryProfilePipelineStore } from "@/lib/profilePipeline/client";

describe("Blackboard profile pipeline routing", () => {
  it("dual-writes a saved Blackboard capture through the canonical capture service", async () => {
    const store = createInMemoryProfilePipelineStore();
    const appendSavedCapture = vi.fn();
    const orb = createCaptureOrb({
      text: "Preserve this raw Blackboard language.",
      source: "typed",
      action: "save",
    }) as CaptureOrb;

    const routed = await routeBlackboardCaptureThroughPipeline({
      orb,
      action: "save",
      ownerUserId: "user-1",
      store,
      appendSavedCapture,
    });

    expect(routed.canonicalCapture.originalText).toBe("Preserve this raw Blackboard language.");
    expect(appendSavedCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        id: orb.id,
        status: "saved",
        metadata: expect.objectContaining({
          profilePipeline: expect.objectContaining({
            captureId: routed.canonicalCapture.captureId,
          }),
        }),
      }),
    );
    expect(await store.listScaffoldNodes()).toEqual([]);
  });

  it("creates a pending canonical scaffold node when Blackboard sends a capture outward", async () => {
    const store = createInMemoryProfilePipelineStore();
    const appendScaffoldQueue = vi.fn();
    const orb = createCaptureOrb({
      text: "This capture is ready for external review.",
      source: "typed",
      action: "send-to-external-scaffold",
    }) as CaptureOrb;

    const routed = await routeBlackboardCaptureThroughPipeline({
      orb,
      action: "send-to-external-scaffold",
      ownerUserId: "user-1",
      store,
      appendScaffoldQueue,
    });

    expect(routed.scaffoldNode).toMatchObject({
      reviewState: "pending",
      sourceCaptureIds: [routed.canonicalCapture.captureId],
    });
    expect(appendScaffoldQueue).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "pending",
        metadata: expect.objectContaining({
          profilePipeline: expect.objectContaining({
            captureId: routed.canonicalCapture.captureId,
            scaffoldNodeId: routed.scaffoldNode?.nodeId,
          }),
        }),
      }),
    );
  });
});
