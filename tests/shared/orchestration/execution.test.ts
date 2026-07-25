import { describe, expect, it } from "vitest";
import { evaluatePresentationCandidate } from "../../../shared/orchestration/execution.js";

const completeHtml = (body: string) =>
  `<!doctype html><html lang="en"><head><title>Test</title></head><body>${body}</body></html>`;

describe("presentation repair gate", () => {
  it("does not double-count content and HTML alternate representations", () => {
    const content = [
      "The first section carries enough language to be measured correctly.",
      "The second section remains distinct from the first section.",
      "The third section completes the artifact without repetition.",
    ].join(" ");
    const gate = evaluatePresentationCandidate({
      content,
      previewHtml: completeHtml(`<p>${content}</p>`),
    });

    expect(gate.allowed).toBe(true);
    expect(gate.disposition).toBe("accepted");
    expect(gate.reasons).toEqual([]);
    expect(gate.checks.contentRepetitionRatio).toBe(0);
    expect(gate.checks.previewHtmlRepetitionRatio).toBe(0);
  });

  it("repairs repeated derivative sentences without mutating the source value", () => {
    const repeated =
      "This sentence is deliberately long enough to be measured by the repetition gate.";
    const source = [repeated, repeated, repeated, repeated].join(" ");
    const gate = evaluatePresentationCandidate({ content: source });

    expect(source.split(repeated)).toHaveLength(5);
    expect(gate.allowed).toBe(true);
    expect(gate.disposition).toBe("repaired");
    expect(gate.repairs[0]).toMatchObject({
      code: "DUPLICATE_CONTENT_REMOVED",
      field: "content",
      removedSegments: 3,
    });
    expect(gate.effectiveCandidate.content).toBe(repeated);
    expect(gate.checks.sourceContentPreserved).toBe(true);
  });

  it("blocks raw JSON as a visible artifact", () => {
    const gate = evaluatePresentationCandidate({
      content: JSON.stringify({ result_payload: { title: "not presentation" } }),
    });
    expect(gate.allowed).toBe(false);
    expect(gate.disposition).toBe("blocked");
    expect(gate.reasons).toContain("Raw JSON is not a finished user-facing artifact.");
  });

  it("blocks internal metadata leakage", () => {
    const gate = evaluatePresentationCandidate({
      content:
        "artifact_id: one\nsource_capture_ids: two\ndecision_payload: three\nVisible-looking text follows.",
    });
    expect(gate.allowed).toBe(false);
    expect(gate.reasons).toContain("Internal metadata is leaking into the visible artifact.");
  });

  it("blocks partial HTML but accepts a complete document", () => {
    const partial = evaluatePresentationCandidate({ previewHtml: "<section>Partial</section>" });
    const complete = evaluatePresentationCandidate({
      previewHtml: completeHtml("<section>Complete</section>"),
    });
    expect(partial.allowed).toBe(false);
    expect(complete.allowed).toBe(true);
  });
});
