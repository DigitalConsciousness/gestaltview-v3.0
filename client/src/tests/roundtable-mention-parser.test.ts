import { describe, expect, it } from "vitest";
import type { TribunalParticipantSummary } from "@shared/roundtable/types";
import { extractTribunalMentions } from "@shared/roundtable/mentionParser";

describe("extractTribunalMentions", () => {
  const participants: TribunalParticipantSummary[] = [
    { slug: "billy", label: "Billy", color: "#00D4FF" },
    { slug: "the-weaver", label: "The Weaver", color: "#2CB67D" },
    { slug: "the-guardian", label: "The Guardian", color: "#F87171" },
  ];

  it("matches both label and slug style mentions", () => {
    const result = extractTribunalMentions(
      "Billy, please @The Weaver and @the-guardian review this.",
      participants,
    );

    expect(result).toEqual(["the-weaver", "the-guardian"]);
  });

  it("deduplicates repeated mentions and ignores unknown names", () => {
    const result = extractTribunalMentions(
      "@Billy, can you check this? @Billy, maybe loop in @Unknown voice.",
      participants,
    );

    expect(result).toEqual(["billy"]);
  });
});
