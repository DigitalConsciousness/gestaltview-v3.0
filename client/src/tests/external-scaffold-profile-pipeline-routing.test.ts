import { describe, expect, it, vi } from "vitest";

import { createCaptureOrb, type CaptureOrb } from "@/components/Scaffold";
import { routeBlackboardCaptureThroughPipeline } from "@/lib/profilePipeline/blackboardRouting";
import { createInMemoryProfilePipelineStore } from "@/lib/profilePipeline/client";
import {
  approveScaffoldOrbThroughPipeline,
  denyScaffoldOrbThroughPipeline,
} from "@/lib/profilePipeline/scaffoldRouting";

describe("External Scaffold profile pipeline routing", () => {
  it("approves pending scaffold orbs through the canonical scaffold node", async () => {
    const store = createInMemoryProfilePipelineStore();
    const appendApprovedOrb = vi.fn();
    const removeScaffoldQueueOrb = vi.fn();
    const orb = createCaptureOrb({
      text: "A pending scaffold node with evidence.",
      source: "typed",
      action: "send-to-external-scaffold",
    }) as CaptureOrb;

    const routed = await routeBlackboardCaptureThroughPipeline({
      orb,
      action: "send-to-external-scaffold",
      store,
      appendScaffoldQueue: vi.fn(),
    });

    const approved = await approveScaffoldOrbThroughPipeline({
      orb: routed.orb,
      store,
      appendApprovedOrb,
      removeScaffoldQueueOrb,
    });

    expect(approved.scaffoldNode?.reviewState).toBe("approved");
    expect(appendApprovedOrb).toHaveBeenCalledWith(expect.objectContaining({ status: "approved" }));
    expect(removeScaffoldQueueOrb).toHaveBeenCalledWith(routed.orb.id);
  });

  it("denies pending scaffold orbs without deleting the source capture", async () => {
    const store = createInMemoryProfilePipelineStore();
    const removeScaffoldQueueOrb = vi.fn();
    const orb = createCaptureOrb({
      text: "A pending scaffold node that should stay as source capture.",
      source: "typed",
      action: "send-to-external-scaffold",
    }) as CaptureOrb;

    const routed = await routeBlackboardCaptureThroughPipeline({
      orb,
      action: "send-to-external-scaffold",
      store,
      appendScaffoldQueue: vi.fn(),
    });

    const denied = await denyScaffoldOrbThroughPipeline({
      orb: routed.orb,
      store,
      removeScaffoldQueueOrb,
    });

    expect(denied.scaffoldNode?.reviewState).toBe("denied");
    expect(await store.getCapture(routed.canonicalCapture.captureId)).toMatchObject({
      originalText: "A pending scaffold node that should stay as source capture.",
    });
    expect(removeScaffoldQueueOrb).toHaveBeenCalledWith(routed.orb.id);
  });
});
