import { describe, expect, it } from "vitest";
import { buildChunkSignalWeight, runTwoPassGravityProtocol } from "./protocol.js";

describe("two-pass gravity protocol", () => {
  it("separates hype from load-bearing signal", () => {
    const result = runTwoPassGravityProtocol({
      title: "Gravity Reports",
      source_type: "document",
      context: "A route that stores report metadata and links chunks to a report row.",
      text: [
        "This revolutionary protocol is game-changing.",
        "It adds a gravity_reports table that links knowledge_fragments to report rows."
      ].join(" ")
    });

    expect(result.surface_map.intensifiers).toEqual(
      expect.arrayContaining(["revolutionary", "game-changing"])
    );
    expect(result.gravity_report.load_bearing_claims.length).toBeGreaterThan(0);
    expect(result.gravity_report.actual_delta).toContain("gravity_reports table");
    expect(result.gravity_report.confidence).not.toBe("noise");
    expect(result.signal_weight).toBeGreaterThan(0.2);
  });

  it("downgrades surface area without evidence", () => {
    const result = runTwoPassGravityProtocol({
      text: "Unprecedented. Revolutionary. Best-in-class. Transformative.",
      source_type: "marketing"
    });

    expect(result.gravity_report.confidence).toBe("noise");
    expect(result.gravity_report.claims_that_collapse_under_scrutiny.length).toBeGreaterThan(0);
    expect(result.signal_weight).toBeLessThan(0.3);
  });

  it("lets chunk-specific signal weight rise for the strongest fragment", () => {
    const result = runTwoPassGravityProtocol({
      text: "The join table links gravity reports to chunks. Another sentence repeats the hype.",
      source_type: "document"
    });

    const chunkWeight = buildChunkSignalWeight(
      result,
      "The join table links gravity reports to chunks.",
      0
    );

    expect(chunkWeight).toBeGreaterThan(result.signal_weight - 0.01);
  });
});
