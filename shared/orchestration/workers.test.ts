import { describe, expect, it } from "vitest";

import { buildWorkerPlan } from "./workers";

describe("worker plan", () => {
  it("auto-spawns Creation Corner specialists by default", () => {
    const plan = buildWorkerPlan({
      sourceRoom: "creation-corner",
      trigger: "manual_synthesize",
      contentKind: "report_document",
      autoSpawn: true,
    });

    expect(plan.spawnMode).toBe("auto");
    expect(plan.workers.map((worker) => worker.id)).toEqual(
      expect.arrayContaining([
        "intake",
        "normalization",
        "synthesis",
        "rendering",
        "persistence",
        "presentation",
        "validation",
      ]),
    );
  });

  it("falls back to approval mode when auto spawning is disabled", () => {
    const plan = buildWorkerPlan({
      sourceRoom: "creation-corner",
      trigger: "manual_synthesize",
      contentKind: "report_document",
      autoSpawn: false,
    });

    expect(plan.spawnMode).toBe("approval");
  });

  it("does not spawn workers for unrelated rooms", () => {
    const plan = buildWorkerPlan({
      sourceRoom: "blackboard-room",
      trigger: "manual_synthesize",
      contentKind: "raw_capture",
      autoSpawn: true,
    });

    expect(plan.workers).toEqual([]);
  });
});
