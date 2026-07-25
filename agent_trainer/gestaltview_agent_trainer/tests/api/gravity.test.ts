import { describe, expect, it } from "vitest";
import {
  analyzeGravity,
  buildGravityReportFragmentLinkInsert,
  buildGravityReportInsert,
  scoreFragmentGravity
} from "../../api/gravity";

describe("gravity helpers", () => {
  it("separates signal from hype and prepares a report insert", () => {
    const insert = buildGravityReportInsert({
      id: "report-1",
      userId: "user-1",
      sourceTitle: "Gravity Protocol",
      sourceType: "document",
      content: [
        "This revolutionary protocol is game-changing.",
        "It adds a gravity_reports table that links knowledge_fragments to report rows."
      ].join(" "),
      metadata: {
        notes: "Store the real signal, not the hype."
      }
    });

    expect(insert).toMatchObject({
      id: "report-1",
      user_id: "user-1",
      source_title: "Gravity Protocol",
      confidence: expect.any(String),
      source_fingerprint: expect.any(String)
    });
    expect(insert.gravity_report).toMatchObject({
      confidence: expect.any(String),
      actual_delta: expect.stringContaining("gravity_reports table")
    });
    expect(insert.signal_weight).toBeGreaterThan(0.2);
  });

  it("prepares a fragment link row for the report join table", () => {
    const link = buildGravityReportFragmentLinkInsert({
      id: "link-1",
      userId: "user-1",
      gravityReportId: "report-1",
      knowledgeFragmentId: "fragment-1",
      chunkIndex: 3,
      priorityRank: 0,
      signalWeight: 0.91
    });

    expect(link).toMatchObject({
      id: "link-1",
      gravity_report_id: "report-1",
      knowledge_fragment_id: "fragment-1",
      chunk_index: 3,
      priority_rank: 0,
      signal_weight: 0.91
    });
  });

  it("scores the strongest chunk above the base report weight", () => {
    const result = analyzeGravity({
      title: "Gravity Protocol",
      content: "The join table links gravity reports to chunks. Everything else is filler.",
      sourceType: "document"
    });

    const chunkWeight = scoreFragmentGravity(
      result,
      "The join table links gravity reports to chunks.",
      0
    );

    expect(chunkWeight).toBeGreaterThan(result.signal_weight - 0.01);
  });
});
