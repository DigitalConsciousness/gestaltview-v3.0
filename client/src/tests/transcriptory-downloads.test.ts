import { describe, expect, it } from "vitest";

import { buildTranscriptoryDownloadPayload } from "@/lib/transcriptoryDownloads";
import type { TranscriptoryCapture, TranscriptorySession, TranscriptorySource } from "@/lib/transcriptory";

const capture: TranscriptoryCapture = {
  id: "capture-1",
  title: "Walk note",
  rawTranscript: "These are the raw spoken words.",
  transcriptText: "These are the raw spoken words.",
  summary: "A direct summary.",
  themes: ["Workflow"],
  linkedCaptures: [],
  status: "ready",
  createdAt: "2026-06-18T00:00:00.000Z",
  updatedAt: "2026-06-18T00:00:00.000Z",
};

const session: TranscriptorySession = {
  id: "session-1",
  title: "Morning walks",
};

const sources: TranscriptorySource[] = [{ id: "source-1", source_type: "upload" }];

describe("Transcriptory downloads", () => {
  it("builds html, text, and json payloads", () => {
    const html = buildTranscriptoryDownloadPayload({ capture, session, sources }, "html");
    const text = buildTranscriptoryDownloadPayload({ capture, session, sources }, "txt");
    const json = buildTranscriptoryDownloadPayload({ capture, session, sources }, "json");

    expect(html.fileName).toBe("walk-note.html");
    expect(html.content).toContain("Transcriptory export");
    expect(html.content).toContain("Morning walks");

    expect(text.fileName).toBe("walk-note.txt");
    expect(text.content).toContain("Summary:");
    expect(text.content).toContain("These are the raw spoken words.");

    expect(json.fileName).toBe("walk-note.json");
    expect(JSON.parse(json.content)).toMatchObject({
      sessionTitle: "Morning walks",
      sourceLabels: ["upload"],
    });
  });
});
