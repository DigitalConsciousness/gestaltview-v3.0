import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  PersonaHealthTracker,
  PERSONA_HEALTH_FAILURE_THRESHOLD,
} from "../../server/council/personaHealth.js";
import { runCouncil, buildAssemblyInput } from "../../server/council/councilRunner.js";
import type { IsolatedCouncilJob } from "../../shared/embodiment/types.js";
import { COUNCIL_FALLBACK_GUARD } from "../../shared/embodiment/chat.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CLEAN_RESPONSE = "The pattern here is clear: let me name it precisely.";
const FALLBACK_RESPONSE = COUNCIL_FALLBACK_GUARD + " — placeholder text.";

function makeJob(slug: string, depthStatus: IsolatedCouncilJob["depthStatus"] = "full"): IsolatedCouncilJob {
  return {
    slug,
    systemPrompt: `System prompt for ${slug}`,
    userPrompt: "What do you see?",
    depthStatus,
    shouldFire: depthStatus !== "stub",
    fallbackGuard: COUNCIL_FALLBACK_GUARD,
  };
}

// ---------------------------------------------------------------------------
// PersonaHealthTracker unit tests
// ---------------------------------------------------------------------------

describe("PersonaHealthTracker", () => {
  let tracker: PersonaHealthTracker;

  beforeEach(() => {
    tracker = new PersonaHealthTracker(PERSONA_HEALTH_FAILURE_THRESHOLD);
  });

  it("starts every slug as healthy with zero failures", () => {
    const entry = tracker.getEntry("the-weaver");
    expect(entry.status).toBe("healthy");
    expect(entry.consecutiveFailures).toBe(0);
  });

  it("moves to recovering after one failure below threshold", () => {
    tracker.recordFailure("the-weaver");
    expect(tracker.getEntry("the-weaver").status).toBe("recovering");
    expect(tracker.isDegraded("the-weaver")).toBe(false);
  });

  it("moves to degraded and returns true after threshold failures", () => {
    for (let i = 0; i < PERSONA_HEALTH_FAILURE_THRESHOLD - 1; i++) {
      tracker.recordFailure("the-weaver");
    }
    const crossedThreshold = tracker.recordFailure("the-weaver");
    expect(crossedThreshold).toBe(true);
    expect(tracker.isDegraded("the-weaver")).toBe(true);
    expect(tracker.getEntry("the-weaver").status).toBe("degraded");
  });

  it("resets to healthy after a clean success", () => {
    tracker.recordFailure("the-weaver");
    tracker.recordFailure("the-weaver");
    tracker.recordSuccess("the-weaver");
    const entry = tracker.getEntry("the-weaver");
    expect(entry.status).toBe("healthy");
    expect(entry.consecutiveFailures).toBe(0);
  });

  it("tracks retries separately from failures", () => {
    tracker.recordFailure("the-weaver");
    tracker.recordRetry("the-weaver");
    const entry = tracker.getEntry("the-weaver");
    expect(entry.totalRetries).toBe(1);
    expect(entry.totalFailures).toBe(1);
  });

  it("tracks multiple slugs independently", () => {
    tracker.recordFailure("the-weaver");
    tracker.recordFailure("the-weaver");
    tracker.recordSuccess("the-algorithm");
    expect(tracker.getEntry("the-weaver").consecutiveFailures).toBe(2);
    expect(tracker.getEntry("the-algorithm").consecutiveFailures).toBe(0);
  });

  it("reset clears all state", () => {
    tracker.recordFailure("the-weaver");
    tracker.reset();
    expect(tracker.snapshot()).toHaveLength(0);
    expect(tracker.getEntry("the-weaver").consecutiveFailures).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// councilRunner — staggered sequential dispatch
// ---------------------------------------------------------------------------

describe("runCouncil — staggered dispatch", () => {
  it("dispatches slugs one at a time in order with no stagger in test mode", async () => {
    const dispatchOrder: string[] = [];

    const callLlm = vi.fn(async (job: IsolatedCouncilJob) => {
      dispatchOrder.push(job.slug);
      return CLEAN_RESPONSE;
    });

    const slugs = ["alpha", "beta", "gamma"];
    await runCouncil(
      "test prompt",
      slugs,
      [],
      {
        callLlm,
        buildJob: (slug) => makeJob(slug),
        personaHealthTracker: new PersonaHealthTracker(),
        dispatchStaggerMs: 0,
      }
    );

    expect(dispatchOrder).toEqual(["alpha", "beta", "gamma"]);
  });

  it("does not dispatch stub personas", async () => {
    const callLlm = vi.fn().mockResolvedValue(CLEAN_RESPONSE);

    const result = await runCouncil(
      "test prompt",
      ["stub-persona"],
      [],
      {
        callLlm,
        buildJob: (slug) => makeJob(slug, "stub"),
        personaHealthTracker: new PersonaHealthTracker(),
        dispatchStaggerMs: 0,
      }
    );

    expect(callLlm).not.toHaveBeenCalled();
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]!.slug).toBe("stub-persona");
  });
});

// ---------------------------------------------------------------------------
// councilRunner — persona health + hardened retry
// ---------------------------------------------------------------------------

describe("runCouncil — persona health circuit breaker", () => {
  it("bakes a clean first response and marks persona healthy", async () => {
    const tracker = new PersonaHealthTracker();
    const callLlm = vi.fn().mockResolvedValue(CLEAN_RESPONSE);

    const result = await runCouncil(
      "test prompt",
      ["the-weaver"],
      [],
      {
        callLlm,
        buildJob: (slug) => makeJob(slug),
        personaHealthTracker: tracker,
        dispatchStaggerMs: 0,
      }
    );

    expect(result.baked).toHaveLength(1);
    expect(result.baked[0]!.fallbackTripped).toBe(false);
    expect(tracker.getEntry("the-weaver").status).toBe("healthy");
  });

  it("flags a fallback response when below failure threshold (no retry)", async () => {
    const tracker = new PersonaHealthTracker(3); // higher threshold
    const callLlm = vi.fn().mockResolvedValue(FALLBACK_RESPONSE);

    const result = await runCouncil(
      "test prompt",
      ["the-algorithm"],
      [],
      {
        callLlm,
        buildJob: (slug) => makeJob(slug),
        personaHealthTracker: tracker,
        dispatchStaggerMs: 0,
      }
    );

    // Only one call — no retry because threshold not yet crossed.
    expect(callLlm).toHaveBeenCalledTimes(1);
    expect(result.flagged).toHaveLength(1);
    expect(result.flagged[0]!.retried).toBeFalsy();
  });

  it("issues a hardened-seed retry when failure threshold is crossed", async () => {
    const tracker = new PersonaHealthTracker(1); // threshold = 1 for this test
    const callLlm = vi
      .fn()
      .mockResolvedValueOnce(FALLBACK_RESPONSE)  // primary
      .mockResolvedValueOnce(CLEAN_RESPONSE);     // hardened retry

    const result = await runCouncil(
      "test prompt",
      ["the-spectacle"],
      [],
      {
        callLlm,
        buildJob: (slug) => makeJob(slug),
        personaHealthTracker: tracker,
        dispatchStaggerMs: 0,
      }
    );

    expect(callLlm).toHaveBeenCalledTimes(2);
    expect(result.baked).toHaveLength(1);
    expect(result.baked[0]!.retried).toBe(true);
    expect(result.baked[0]!.hardenedSeedUsed).toBe(true);
    expect(result.baked[0]!.fallbackTripped).toBe(false);
    expect(tracker.getEntry("the-spectacle").status).toBe("healthy");
  });

  it("flags with hardenedSeedUsed when both primary and retry trip the guard", async () => {
    const tracker = new PersonaHealthTracker(1);
    const callLlm = vi.fn().mockResolvedValue(FALLBACK_RESPONSE);

    const result = await runCouncil(
      "test prompt",
      ["vibe-check"],
      [],
      {
        callLlm,
        buildJob: (slug) => makeJob(slug),
        personaHealthTracker: tracker,
        dispatchStaggerMs: 0,
      }
    );

    expect(callLlm).toHaveBeenCalledTimes(2);
    expect(result.flagged).toHaveLength(1);
    expect(result.flagged[0]!.retried).toBe(true);
    expect(result.flagged[0]!.hardenedSeedUsed).toBe(true);
    expect(result.flagged[0]!.fallbackTripped).toBe(true);
  });

  it("skips on provider error without corrupting persona health state", async () => {
    const tracker = new PersonaHealthTracker();
    const callLlm = vi.fn().mockRejectedValue(new Error("LLM provider timeout"));

    const result = await runCouncil(
      "test prompt",
      ["the-guardian"],
      [],
      {
        callLlm,
        buildJob: (slug) => makeJob(slug),
        personaHealthTracker: tracker,
        dispatchStaggerMs: 0,
      }
    );

    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]!.response).toBe("provider-error");
    // Health state should be untouched — no failure recorded.
    expect(tracker.getEntry("the-guardian").consecutiveFailures).toBe(0);
    expect(tracker.getEntry("the-guardian").status).toBe("healthy");
  });

  it("mixed council: bakes clean responses, flags double-fallback", async () => {
    const tracker = new PersonaHealthTracker(1);

    const callLlm = vi.fn().mockImplementation(async (job: IsolatedCouncilJob) => {
      if (job.slug === "the-treasurer") return FALLBACK_RESPONSE;
      return CLEAN_RESPONSE;
    });

    const result = await runCouncil(
      "test prompt",
      ["the-weaver", "the-treasurer", "the-architect"],
      [],
      {
        callLlm,
        buildJob: (slug) => makeJob(slug),
        personaHealthTracker: tracker,
        dispatchStaggerMs: 0,
      }
    );

    // weaver + architect baked, treasurer flagged (retry also fallback)
    const bakedSlugs = result.baked.map((r) => r.slug);
    expect(bakedSlugs).toContain("the-weaver");
    expect(bakedSlugs).toContain("the-architect");
    expect(result.flagged.map((r) => r.slug)).toContain("the-treasurer");
    expect(result.assemblyReady).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildAssemblyInput
// ---------------------------------------------------------------------------

describe("buildAssemblyInput", () => {
  it("returns null when assemblyReady is false", () => {
    const result = {
      baked: [],
      flagged: [],
      skipped: [],
      assemblyReady: false,
    };
    expect(buildAssemblyInput(result, "prompt", "the-weaver")).toBeNull();
  });

  it("returns AssemblyInput when baked responses exist", () => {
    const baked = [
      {
        slug: "the-weaver",
        response: CLEAN_RESPONSE,
        fallbackTripped: false,
        depthStatus: "full" as const,
      },
    ];
    const result = { baked, flagged: [], skipped: [], assemblyReady: true };
    const assembly = buildAssemblyInput(result, "user prompt", "the-weaver");
    expect(assembly).not.toBeNull();
    expect(assembly!.baked).toHaveLength(1);
    expect(assembly!.synthesizerSlug).toBe("the-weaver");
  });
});
