import { describe, expect, it } from "vitest";

import { TrainerExperimentDetailSchema } from "../../shared/agent-trainer/schemas.js";
import { evaluateTrainerPackagingGateForExperiment } from "../trainer/experiment-repository.js";

function buildExperiment(overrides: Record<string, unknown> = {}) {
  return TrainerExperimentDetailSchema.parse({
    id: "11111111-1111-4111-8111-111111111111",
    slug: "operator-kit",
    title: "Operator Kit",
    purpose: "Review specs, triage requests, and produce internal execution plans.",
    domain: "operations",
    embodimentProfileSlug: "the-weaver",
    goal: "Train an internal operator profile.",
    targetBehaviors: ["disciplined execution"],
    antiGoals: ["no persona inflation"],
    studyFocus: "Favor traceable operational work.",
    maxCycles: 3,
    qualityThreshold: 4,
    draftingProvider: "auto",
    evaluationProvider: "auto",
    class: "approved_training_kit",
    packagingEligible: true,
    createdBy: "Keith",
    notes: null,
    createdAt: "2026-04-10T00:00:00.000Z",
    updatedAt: "2026-04-10T00:00:00.000Z",
    sourceCount: 2,
    reviewCount: 2,
    unresolvedBlockingFlagCount: 0,
    unresolvedAdvisoryFlagCount: 0,
    latestReviewDecision: "promote_kit",
    latestRunStatus: "completed",
    latestRunId: "run-1",
    sources: [],
    reviews: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        experimentId: "11111111-1111-4111-8111-111111111111",
        runId: "run-1",
        versionId: "version-1",
        decision: "promote_kit",
        reviewer: "Keith",
        coherenceScore: 4.8,
        safetyScore: 4.7,
        emotionalPostureScore: 4.5,
        overIdRisk: "low",
        notes: "Passed governance review.",
        createdAt: "2026-04-10T00:00:00.000Z",
      },
    ],
    flags: [],
    runs: [
      {
        runId: "run-1",
        status: "completed",
        avgScore: 4.4,
        createdAt: "2026-04-10T00:00:00.000Z",
        completedAt: "2026-04-10T01:00:00.000Z",
        latestVersionId: "version-1",
      },
    ],
    ...overrides,
  });
}

describe("trainer packaging gate doctrine", () => {
  it("returns unmet gate codes for experiments that fail packaging doctrine", () => {
    const experiment = buildExperiment({
      purpose: "A digital being for companionship and identity transfer.",
      antiGoals: [],
      class: "operational_profile",
      packagingEligible: false,
      reviews: [],
      flags: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          experimentId: "11111111-1111-4111-8111-111111111111",
          flag: "charisma-artifact",
          severity: "blocking",
          setBy: "Keith",
          notes: "Too identity-coded.",
          resolved: false,
          createdAt: "2026-04-10T00:00:00.000Z",
        },
      ],
      runs: [
        {
          runId: "run-1",
          status: "completed",
          avgScore: 3.1,
          createdAt: "2026-04-10T00:00:00.000Z",
          completedAt: "2026-04-10T01:00:00.000Z",
          latestVersionId: "version-1",
        },
      ],
    });

    const issues = evaluateTrainerPackagingGateForExperiment(experiment);
    const codes = issues.map((issue) => issue.code);

    expect(codes).toEqual(
      expect.arrayContaining([
        "class_not_promoted",
        "packaging_not_enabled",
        "blocking_flags_present",
        "charisma_artifact_flag_present",
        "missing_approval_review",
        "missing_promote_kit_review",
        "purpose_not_operational",
        "missing_behavioral_boundary",
        "missing_passing_run",
        "missing_provenance_receipt",
        "missing_embodiment_compile_run",
        "missing_identity_review_event",
        "missing_checksum_manifest",
        "di_identity_export_violation",
      ])
    );
  });

  it("passes experiments that meet the promotion, boundary, review, and eval checks", () => {
    const experiment = buildExperiment({
      notes: JSON.stringify({
        packageGateReceipts: {
          provenanceReceiptId: "prov-1",
          embodimentCompileRunId: "compile-1",
          identityReviewEventId: "review-1",
          checksumManifestId: "manifest-1",
          exportClass: "behavior_framework",
        },
      }),
    });

    expect(evaluateTrainerPackagingGateForExperiment(experiment)).toEqual([]);
  });
});
