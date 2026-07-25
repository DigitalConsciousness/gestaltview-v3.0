import { beforeEach, describe, expect, it } from "vitest";

import {
  buildMusicalDnaAmbientAnalysis,
  readAmbientJournalSnapshot,
} from "@/lib/musicalDnaAmbient";

function createMemoryStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };
}

beforeEach(() => {
  (globalThis as any).window = {
    localStorage: createMemoryStorage(),
  };
});

describe("Musical DNA ambient inference", () => {
  it("reads the local sanctuary journal snapshot when present", () => {
    window.localStorage.setItem(
      "gv.sanctuary.journal.v1",
      JSON.stringify({
        content: "<p>I keep noticing pattern drift.</p>",
        createdAt: "2026-06-12T12:00:00.000Z",
        updatedAt: "2026-06-12T12:30:00.000Z",
      }),
    );

    expect(readAmbientJournalSnapshot()).toEqual({
      content: "<p>I keep noticing pattern drift.</p>",
      createdAt: "2026-06-12T12:00:00.000Z",
      updatedAt: "2026-06-12T12:30:00.000Z",
    });
  });

  it("builds a stable ambient analysis from multiple signal sources", () => {
    const analysis = buildMusicalDnaAmbientAnalysis({
      journal: {
        content: "<p>I keep noticing pattern drift.</p>",
        updatedAt: "2026-06-12T12:30:00.000Z",
      },
      savedCaptures: [
        {
          title: "Blackboard thread",
          text: "We should keep the recap orbit alive.",
          createdAt: "2026-06-12T11:00:00.000Z",
          metadata: { context: "Blackboard Room summary" },
        },
      ],
      sessionRecaps: [
        {
          title: "Blackboard Room · Recap",
          summary: "We built the recap bridge.",
          createdAt: "2026-06-12T10:30:00.000Z",
          originRoom: "blackboard",
        },
      ],
      creationCornerArtifacts: [
        {
          title: "Creation Corner export",
          summary: "An exported artifact with provenance.",
          createdAt: "2026-06-11T18:00:00.000Z",
          originRoom: "creation_corner",
        },
      ],
      userFiles: [
        {
          name: "voice-note.m4a",
          kind: "audio",
          createdAt: "2026-06-12T09:00:00.000Z",
          previewText: "Voice note about the session.",
        },
      ],
      profile: {
        keyThemes: ["pattern recognition", "care through structure"],
        unresolvedTensions: ["moving fast without losing the thread"],
        coreNarrative: "A builder who keeps the room coherent.",
        dimensions: [],
      },
      playlistCount: 3,
    });

    expect(analysis).not.toBeNull();
    expect(analysis).toMatchObject({
      songTitle: expect.stringContaining("Journal"),
      artist: expect.stringContaining("journal"),
      summary: "Ambient inference woven from 7 signals.",
    });
    expect(analysis?.provenance[0]).toContain("Journal note");
    expect(analysis?.provenance).toEqual(expect.arrayContaining([
      expect.stringContaining("Session recap"),
      expect.stringContaining("File upload"),
    ]));
    expect(analysis?.signature).toMatch(/^[a-z0-9]+$/);
  });
});
