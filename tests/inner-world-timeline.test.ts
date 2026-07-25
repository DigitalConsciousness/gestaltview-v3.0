/**
 * tests/inner-world-timeline.test.ts
 * ====================================
 * Unit tests for the InnerWorldTimeline filterArtifactsByRange utility.
 * Tests all TimelineRange values against a set of mock artifacts.
 *
 * Run with: pnpm vitest run tests/inner-world-timeline.test.ts
 */
import { describe, expect, it } from "vitest";

// ── Inline type + function (mirrors InnerWorldTimeline.tsx exports) ────────────

type TimelineRange = "all" | "today" | "this-week" | "this-month" | "this-year" | "older";

interface MinimalArtifact {
  id: string;
  createdAt: string;
  updatedAt: string;
}

function artifactTimestamp(record: MinimalArtifact): number {
  for (const value of [record.updatedAt, record.createdAt]) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function filterArtifactsByRange<T extends MinimalArtifact>(
  artifacts: T[],
  range: TimelineRange
): T[] {
  if (range === "all") return artifacts;

  const now = Date.now();
  const MS = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  };

  return artifacts.filter((artifact) => {
    const ts = artifactTimestamp(artifact);
    const age = now - ts;
    switch (range) {
      case "today":
        return age <= MS.day;
      case "this-week":
        return age <= MS.week;
      case "this-month":
        return age <= MS.month;
      case "this-year":
        return age <= MS.year;
      case "older":
        return age > MS.year;
      default:
        return true;
    }
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function makeArtifact(id: string, daysBack: number): MinimalArtifact {
  return {
    id,
    createdAt: daysAgo(daysBack),
    updatedAt: daysAgo(daysBack),
  };
}

const ARTIFACTS: MinimalArtifact[] = [
  makeArtifact("today-1", 0),
  makeArtifact("today-2", 0.5),
  makeArtifact("week-1", 3),
  makeArtifact("week-2", 6),
  makeArtifact("month-1", 15),
  makeArtifact("month-2", 28),
  makeArtifact("year-1", 90),
  makeArtifact("year-2", 300),
  makeArtifact("older-1", 400),
  makeArtifact("older-2", 730),
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("filterArtifactsByRange", () => {
  it("'all' returns all artifacts", () => {
    expect(filterArtifactsByRange(ARTIFACTS, "all")).toHaveLength(ARTIFACTS.length);
  });

  it("'today' returns only artifacts from the last 24 hours", () => {
    const result = filterArtifactsByRange(ARTIFACTS, "today");
    expect(result.every((a) => ["today-1", "today-2"].includes(a.id))).toBe(true);
    expect(result.length).toBe(2);
  });

  it("'this-week' returns artifacts from the last 7 days", () => {
    const result = filterArtifactsByRange(ARTIFACTS, "this-week");
    const ids = result.map((a) => a.id);
    expect(ids).toContain("today-1");
    expect(ids).toContain("week-1");
    expect(ids).toContain("week-2");
    expect(ids).not.toContain("month-1");
  });

  it("'this-month' returns artifacts from the last 30 days", () => {
    const result = filterArtifactsByRange(ARTIFACTS, "this-month");
    const ids = result.map((a) => a.id);
    expect(ids).toContain("month-1");
    expect(ids).toContain("month-2");
    expect(ids).not.toContain("year-1");
  });

  it("'this-year' returns artifacts from the last 365 days", () => {
    const result = filterArtifactsByRange(ARTIFACTS, "this-year");
    const ids = result.map((a) => a.id);
    expect(ids).toContain("year-1");
    expect(ids).toContain("year-2");
    expect(ids).not.toContain("older-1");
  });

  it("'older' returns artifacts older than 365 days", () => {
    const result = filterArtifactsByRange(ARTIFACTS, "older");
    const ids = result.map((a) => a.id);
    expect(ids).toContain("older-1");
    expect(ids).toContain("older-2");
    expect(ids).not.toContain("year-1");
  });

  it("returns empty array when no artifacts match the range", () => {
    const recentOnly = [makeArtifact("recent", 0)];
    expect(filterArtifactsByRange(recentOnly, "older")).toHaveLength(0);
  });

  it("handles empty artifact array gracefully", () => {
    expect(filterArtifactsByRange([], "this-week")).toHaveLength(0);
  });
});
