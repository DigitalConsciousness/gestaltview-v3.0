import { describe, expect, it } from "vitest";
import {
  mergeLivingMemoryEntries,
  selectEnrichmentCandidates,
  sortObjectKeys,
} from "../../scripts/enrich-living-memories.mjs";

describe("DI living-memory enrichment", () => {
  it("filters to high-significance events", () => {
    const candidates = selectEnrichmentCandidates([
      { diSlug: "billy", domain: "relational", content: "Low value", memory_type: "operational", significance: 0.2, retrieval_weight: 0.2, source: "session" },
      { diSlug: "billy", domain: "relational", content: "Keep this", memory_type: "relational", significance: 0.91, retrieval_weight: 0.83, source: "session" },
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].content).toBe("Keep this");
  });

  it("dedupes existing living memories against enrichment candidates", () => {
    const merged = mergeLivingMemoryEntries(
      [
        { domain: "relational", memoryType: "foundational", significance: "critical", content: "Already there", retrievalWeight: 1 },
      ],
      [
        { diSlug: "billy", domain: "relational", content: "Already there", memory_type: "relational", significance: 0.95, retrieval_weight: 0.91, source: "session" },
        { diSlug: "billy", domain: "operational", content: "New memory", memory_type: "operational", significance: 0.94, retrieval_weight: 0.9, source: "session" },
      ]
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].retrievalWeight).toBeGreaterThanOrEqual(merged[1].retrievalWeight);
  });

  it("sorts object keys before writing JSON back to disk", () => {
    expect(sortObjectKeys({ z: 1, a: { b: 2, a: 1 } })).toEqual({ a: { a: 1, b: 2 }, z: 1 });
  });
});
