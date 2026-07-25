import { describe, expect, it } from "vitest";

import {
  buildGestaltViewMetricsSnapshot,
  buildOrchestrationAnalyticsSummary,
  buildTribunalTranscriptSummary,
} from "@/lib/gestaltviewMetrics";

describe("buildTribunalTranscriptSummary", () => {
  it("counts tribunal voices, blocked turns, and saved excerpts", () => {
    const summary = buildTribunalTranscriptSummary(
      [
        { id: "1", role: "user", content: "Hey @Billy" },
        {
          id: "2",
          role: "agent",
          agentSlug: "billy",
          content: "A real reply that carries actual content.",
          addressedTo: ["billy"],
        },
        {
          id: "3",
          role: "agent",
          agentSlug: "the-weaver",
          content: "[The Weaver response blocked: canned fallback detected.]",
          isAutoReply: true,
          replyDepth: 2,
        },
      ],
      [{ id: "save-1", content: "Saved excerpt" }],
    );

    expect(summary).toEqual({
      totalTurns: 3,
      userTurns: 1,
      agentTurns: 2,
      cleanAgentTurns: 1,
      cannedAgentTurns: 1,
      uniqueVoices: 2,
      addressedTurns: 1,
      autoReplyTurns: 1,
      maxReplyDepth: 2,
      savedExcerpts: 1,
    });
  });
});

describe("buildGestaltViewMetricsSnapshot", () => {
  it("derives the live metric families from trainer, analytics, and tribunal transcript inputs", () => {
    const snapshot = buildGestaltViewMetricsSnapshot({
      generatedAt: "2026-06-24T00:00:00.000Z",
      trainer: {
        trackedRuns: 4,
        queuedRuns: 1,
        awaitingReviewRuns: 2,
        failedRuns: 1,
        stalledRuns: 1,
      },
      orchestration: {
        totalDecisions: 12,
        artifactRate: 0.5,
        persistenceRate: 0.75,
        profileRate: 0.25,
        scaffoldRate: 0.25,
        averageConfidence: 0.81,
        elevatedSupportRate: 0.25,
        supportBreakdown: {
          none: 6,
          elevated: 3,
          low: 3,
        },
        topTrigger: {
          label: "manual_synthesize",
          count: 7,
        },
        topDestination: {
          label: "creation-corner",
          count: 8,
        },
        topContentKind: {
          label: "session_recap",
          count: 5,
        },
        latestDecisionAt: "2026-06-24T00:30:00.000Z",
      },
      tribunal: {
        totalTurns: 18,
        userTurns: 3,
        agentTurns: 15,
        cleanAgentTurns: 14,
        cannedAgentTurns: 1,
        uniqueVoices: 5,
        addressedTurns: 8,
        autoReplyTurns: 4,
        maxReplyDepth: 3,
        savedExcerpts: 2,
      },
    });

    expect(snapshot.overviewCards[0]).toMatchObject({
      label: "Operational health",
      value: "1 stalled",
    });
    expect(snapshot.familyCards).toHaveLength(5);
    expect(snapshot.familyCards[0]).toMatchObject({
      key: "empathy_actualization",
      label: "Live proxy",
      value: "93%",
    });
    expect(snapshot.familyCards.map((card) => card.key)).toEqual([
      "empathy_actualization",
      "transformational_change",
      "collective_intelligence",
      "authentic_self_discovery",
      "narrative_change",
    ]);
    expect(snapshot.familyCards[0].value).not.toBe("0%");
    expect(snapshot.liveSignals).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Artifact cadence:"),
        expect.stringContaining("Routing focus:"),
        expect.stringContaining("Content mix:"),
      ]),
    );
  });
});

describe("buildOrchestrationAnalyticsSummary", () => {
  it("summarizes orchestration decisions into the shared metrics shape", () => {
    const summary = buildOrchestrationAnalyticsSummary([
      {
        trigger: "manual_synthesize",
        destination: "creation-corner",
        content_kind: "session_recap",
        support_level: "elevated",
        should_forge_artifact: true,
        should_persist_signal: true,
        should_update_profile: false,
        should_update_scaffold: false,
        confidence: 0.81,
        triggered_at: "2026-06-24T00:05:00.000Z",
      },
      {
        trigger: "manual_synthesize",
        destination: "creation-corner",
        content_kind: "profile_signal",
        support_level: "low",
        should_forge_artifact: false,
        should_persist_signal: true,
        should_update_profile: true,
        should_update_scaffold: false,
        confidence: 0.61,
        triggered_at: "2026-06-24T00:10:00.000Z",
      },
    ]);

    expect(summary).toMatchObject({
      totalDecisions: 2,
      artifactRate: 0.5,
      persistenceRate: 1,
      profileRate: 0.5,
      scaffoldRate: 0,
      elevatedSupportRate: 0.5,
      averageConfidence: 0.71,
      topTrigger: {
        label: "manual_synthesize",
        count: 2,
      },
      topDestination: {
        label: "creation-corner",
        count: 2,
      },
      topContentKind: {
        label: "profile_signal",
        count: 1,
      },
      latestDecisionAt: "2026-06-24T00:05:00.000Z",
    });
  });
});
