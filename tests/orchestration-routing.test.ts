import { describe, expect, it } from "vitest";
import {
  decideOrchestration,
  ORCHESTRATION_EXAMPLE_INPUTS,
} from "../shared/orchestration/index.js";

describe("Neural Handshake Orchestrator v0", () => {
  it("routes low-energy load conservatively without forging by default", () => {
    const decision = decideOrchestration(ORCHESTRATION_EXAMPLE_INPUTS.lowEnergyConservative);

    expect(decision.detectedState).toBe("low_energy");
    expect(decision.supportLevel).toBe("low");
    expect(decision.shouldForgeArtifact).toBe(false);
    expect(decision.nextAction).toBe("preserve_capture");
    expect(decision.internalDiagnostics.join(" ")).toContain("Triggered-event decision only");
  });

  it("allows explicit document synthesis for breakthrough material", () => {
    const decision = decideOrchestration(ORCHESTRATION_EXAMPLE_INPUTS.breakthroughToCreationCorner);

    expect(decision.detectedState).toBe("breakthrough_processing");
    expect(decision.contentKind).toBe("report_document");
    expect(decision.destination).toBe("creation-corner");
    expect(decision.shouldForgeArtifact).toBe(true);
    expect(decision.processors).toContain("codex");
  });

  it("routes explicit mind-map requests to mind_map with loom and tapestry processors", () => {
    const decision = decideOrchestration(ORCHESTRATION_EXAMPLE_INPUTS.mindMapFromThreads);

    expect(decision.contentKind).toBe("mind_map");
    expect(decision.artifactTargetType).toBe("mind-map");
    expect(decision.nextAction).toBe("draft_mind_map");
    expect(decision.processors).toContain("loom");
    expect(decision.processors).toContain("tapestry");
    expect(decision.diSelection).toMatchObject({
      category: "rich_rendering",
      execution_surface: "dynamic-inner-world",
    });
  });

  it("routes profile requests to profile signals without forging an artifact", () => {
    const decision = decideOrchestration(ORCHESTRATION_EXAMPLE_INPUTS.profileSignal);

    expect(decision.contentKind).toBe("profile_signal");
    expect(decision.destination).toBe("profile");
    expect(decision.shouldUpdateProfile).toBe(true);
    expect(decision.shouldForgeArtifact).toBe(false);
  });

  it("adds multimodal processor for upload metadata", () => {
    const decision = decideOrchestration(ORCHESTRATION_EXAMPLE_INPUTS.multimodalUpload);

    expect(decision.processors).toContain("multimodal");
    expect(decision.shouldPersistSignal).toBe(true);
  });

  it("adds safety processor and prevents casual artifact forging for elevated support markers", () => {
    const decision = decideOrchestration({
      trigger: "manual_synthesize",
      sourceRoom: "sanctuary",
      text: "I feel completely overwhelmed and don't know how to cope.",
      energyLevel: 4,
      artifactIntent: "document",
    });

    expect(decision.supportLevel).toBe("elevated");
    expect(decision.processors).toContain("safety");
    expect(decision.shouldForgeArtifact).toBe(false);
    expect(decision.nextAction).toBe("ask_user_to_choose");
  });
});
