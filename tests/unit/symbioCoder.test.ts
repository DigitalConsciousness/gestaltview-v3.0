import { describe, expect, it } from "vitest";
import { analyzeSymbio } from "../../shared/modules/symbioCoder";

describe("symbioCoder", () => {
  it.each([
    ["debug", "This TypeError is broken and the app crashes, please fix the bug."],
    ["refactor", "Refactor this messy component and clean up duplication."],
    ["generate", "Build a new component and implement the API call."],
    ["explain", "Explain how this hook works and walk me through it."],
    ["review", "Please do a code review and give feedback on this diff."],
    ["architect", "Design the schema and best approach for this system."],
    ["test", "Write unit test coverage with Vitest mocks and expects."],
    ["optimize", "This query is slow; optimize latency and find the bottleneck."],
  ] as const)("classifies %s intent", (intent, text) => {
    expect(analyzeSymbio(text).intent.primary).toBe(intent);
  });
});
