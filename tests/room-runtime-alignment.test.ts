/**
 * tests/room-runtime-alignment.test.ts
 * ======================================
 * Integration tests for the room-to-embodiment route alignment.
 * Verifies that all canonical rooms resolve to a valid embodiment slug,
 * and that the registry contains all expected profiles.
 *
 * Run with: pnpm vitest run tests/room-runtime-alignment.test.ts
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const PROFILES_DIR = join(__dirname, "..", "embodiment_profiles");

function loadProfileSlugs(): string[] {
  return readdirSync(PROFILES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = readFileSync(join(PROFILES_DIR, f), "utf-8");
      const profile = JSON.parse(raw) as { slug: string };
      return profile.slug;
    });
}

// Canonical room-to-embodiment mapping (mirrors resolveRoomEmbodimentSlug)
const CANONICAL_ROOM_EMBODIMENTS: Record<string, string> = {
  sanctuary: "sanctuary-keeper",
  "blackboard-room": "billy",
  "dynamic-inner-world": "curator",
  "external-scaffold": "the-architect",
  "creation-corner": "art-teacher",
  billy: "billy",
  "agent-trainer": "gate-keeper",
  gate: "gate-keeper",
};

// All 24 expected profile slugs
const EXPECTED_SLUGS = [
  "art-teacher",
  "billy",
  "cascade-engineer",
  "consulting-advisor",
  "curator",
  "founder-studio-sample",
  "gate-keeper",
  "groq-embodiment-expert",
  "pattern-analyst",
  "philosophy-scribe",
  "repo-scribe",
  "rock-legend",
  "sanctuary-keeper",
  "the-algorithm",
  "the-architect",
  "the-guardian",
  "the-recursive-builder",
  "the-spectacle",
  "the-tailor",
  "the-translation-bridge",
  "the-treasurer",
  "the-weaver",
  "the-weird-digger",
  "vibe-check",
];

describe("embodiment profile registry", () => {
  const slugs = loadProfileSlugs();

  it("contains all 24 expected profiles", () => {
    for (const expectedSlug of EXPECTED_SLUGS) {
      expect(
        slugs,
        `Missing expected profile: ${expectedSlug}`
      ).toContain(expectedSlug);
    }
  });

  it("has no duplicate slugs", () => {
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });
});

describe("room-to-embodiment alignment", () => {
  const slugs = loadProfileSlugs();

  it("all canonical room embodiment slugs exist in the registry", () => {
    for (const [room, embodimentSlug] of Object.entries(CANONICAL_ROOM_EMBODIMENTS)) {
      expect(
        slugs,
        `Room '${room}' maps to '${embodimentSlug}' but that profile is missing from the registry`
      ).toContain(embodimentSlug);
    }
  });

  it("sanctuary maps to sanctuary-keeper", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["sanctuary"]).toBe("sanctuary-keeper");
  });

  it("blackboard-room maps to billy", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["blackboard-room"]).toBe("billy");
  });

  it("dynamic-inner-world maps to curator", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["dynamic-inner-world"]).toBe("curator");
  });

  it("external-scaffold maps to the-architect", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["external-scaffold"]).toBe("the-architect");
  });

  it("creation-corner maps to art-teacher", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["creation-corner"]).toBe("art-teacher");
  });

  it("agent-trainer maps to gate-keeper", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["agent-trainer"]).toBe("gate-keeper");
  });
});

describe("billy cross-room role boundaries", () => {
  it("billy is NOT the resident DI of creation-corner", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["creation-corner"]).not.toBe("billy");
  });

  it("billy is NOT the resident DI of sanctuary", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["sanctuary"]).not.toBe("billy");
  });

  it("billy is NOT the resident DI of external-scaffold", () => {
    expect(CANONICAL_ROOM_EMBODIMENTS["external-scaffold"]).not.toBe("billy");
  });
});
