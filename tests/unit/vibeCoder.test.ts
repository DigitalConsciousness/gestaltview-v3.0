import { describe, expect, it } from "vitest";
import { calculateVibeScore } from "../../shared/modules/vibeCoder";

describe("vibeCoder", () => {
  it("scores above 0.8/80 when metaphor text is preserved", () => {
    const source = "The product is a sanctuary and a bridge, like a compass for users navigating a river of memory.";
    const target = "The product is a sanctuary and a bridge, like a compass for users navigating a river of memory.";
    expect(calculateVibeScore(source, target).score).toBeGreaterThan(80);
  });
});
