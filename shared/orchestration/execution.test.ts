import { describe, expect, it } from "vitest";

import { evaluatePresentationCandidate, executeOrchestration } from "./execution.js";
import { buildWorkerPlan } from "./workers.js";
import type { OrchestrationDecision, OrchestrationInput } from "./types.js";

const input: OrchestrationInput = {
  trigger: "artifact_route",
  sourceRoom: "creation-corner",
  title: "A finished artifact",
  text: "A source-linked artifact with a clear beginning, middle, and end.",
  artifactIntent: "document",
  sourceCaptureIds: ["capture-1"],
  meta: {
    presentationCandidate: {
      title: "A finished artifact",
      content: "A source-linked artifact with a clear beginning, middle, and end.",
      previewHtml: "<!doctype html><html><body><main>Finished</main></body></html>",
      artifactType: "markdown",
    },
  },
};

const decision: OrchestrationDecision = {
  decisionId: "decision-1",
  triggeredAt: "2026-07-11T12:00:00.000Z",
  trigger: "artifact_route",
  sourceRoom: "creation-corner",
  detectedState: "active_creation",
  supportLevel: "none",
  contentKind: "report_document",
  destination: "creation-corner",
  artifactTargetType: "markdown",
  artifactDestination: "creation-corner",
  synthesisStyle: "faithful",
  processors: ["routing", "codex"],
  exportFormats: ["markdown", "html"],
  nextAction: "forge_artifact",
  shouldForgeArtifact: true,
  shouldPersistSignal: true,
  shouldUpdateProfile: false,
  shouldUpdateScaffold: false,
  confidence: 0.94,
  userFacingSummary: "Route the finished document through the presentation gate.",
  internalDiagnostics: [],
};

describe("orchestration execution", () => {
  it("builds a decision-driven artifact graph and completes a presentable artifact", () => {
    const plan = buildWorkerPlan({
      sourceRoom: input.sourceRoom,
      trigger: input.trigger,
      contentKind: decision.contentKind,
      shouldForgeArtifact: decision.shouldForgeArtifact,
      shouldUpdateProfile: decision.shouldUpdateProfile,
      shouldUpdateScaffold: decision.shouldUpdateScaffold,
    });

    expect(plan.workers.map((worker) => worker.id)).toEqual([
      "intake",
      "normalization",
      "synthesis",
      "rendering",
      "persistence",
      "presentation",
      "validation",
    ]);

    const result = executeOrchestration({ input, decision, plan });
    expect(result.status).toBe("completed");
    expect(result.presentation.allowed).toBe(true);
    expect(result.receipts.every((receipt) => receipt.status === "done")).toBe(true);
  });

  it("rejects raw JSON before presentation", () => {
    const gate = evaluatePresentationCandidate({
      content: JSON.stringify({ artifact_id: "a", result_payload: {}, decision_payload: {}, internal_diagnostics: [] }),
    });

    expect(gate.allowed).toBe(false);
    expect(gate.checks.isNotRawJson).toBe(false);
    expect(gate.reasons).toContain("Raw JSON is not a finished user-facing artifact.");
  });

  it("adds profile and scaffold branches only when the decision asks for them", () => {
    const plan = buildWorkerPlan({
      sourceRoom: "external-scaffold",
      trigger: "user_requested_scaffold",
      contentKind: "scaffold_signal",
      shouldForgeArtifact: false,
      shouldUpdateProfile: true,
      shouldUpdateScaffold: true,
    });

    expect(plan.workers.map((worker) => worker.id)).toEqual([
      "intake",
      "normalization",
      "profile_enrichment",
      "scaffold_context",
      "orb_generation",
      "persistence",
      "presentation",
      "validation",
    ]);
  });
});
