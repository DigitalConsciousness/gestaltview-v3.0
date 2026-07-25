import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

describe("Transcriptory client API", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  it("posts recorded audio to the server transcribe route without exposing provider credentials", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transcript: "Captured words",
        duration_seconds: 12,
        provider: "assemblyai",
        capture: {
          id: "capture-1",
          title: "Walk note",
          rawTranscript: "Captured words",
          summary: "",
          themes: [],
          linkedCaptures: [],
          status: "ready",
          createdAt: "2026-06-09T00:00:00.000Z",
          updatedAt: "2026-06-09T00:00:00.000Z",
        },
      }),
    });
    const { transcribeTranscriptoryAudio } = await import("@/lib/transcriptory");
    const file = new File([new Blob(["audio bytes"], { type: "audio/webm" })], "note.webm", {
      type: "audio/webm",
    });

    const result = await transcribeTranscriptoryAudio({ captureId: "capture-1", file });

    expect(fetchMock).toHaveBeenCalledWith("/api/transcriptory/transcribe", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "audio/webm",
        "X-Capture-Id": "capture-1",
        "X-Filename": "note.webm",
      },
      body: file,
    });
    expect(result.capture?.status).toBe("ready");
    expect(JSON.stringify(fetchMock.mock.calls[0][1])).not.toContain("ASSEMBLYAI");
  });

  it("builds clean handoff text for Blackboard and Creation Corner without JSON payloads", async () => {
    const { buildTranscriptoryHandoffText } = await import("@/lib/transcriptory");

    const text = buildTranscriptoryHandoffText({
      id: "capture-1",
      title: "Walk note",
      summary: "A direct summary.",
      rawTranscript: "These are the raw spoken words.",
      themes: ["Product", "Workflow"],
      linkedCaptures: [],
      status: "ready",
      createdAt: "2026-06-09T00:00:00.000Z",
      updatedAt: "2026-06-09T00:00:00.000Z",
    });

    expect(text).toContain("Transcriptory capture: Walk note");
    expect(text).toContain("A direct summary.");
    expect(text).toContain("These are the raw spoken words.");
    expect(text).not.toContain('{"');
    expect(text).not.toContain("rawTranscript");
  });

  it("formats transcriptory failures into a human-readable message", async () => {
    const { formatTranscriptoryFailureMessage } = await import("@/lib/transcriptory");

    expect(formatTranscriptoryFailureMessage(new Error("AssemblyAI upload failed: payload too large"))).toBe(
      "AssemblyAI upload failed: payload too large",
    );
    expect(formatTranscriptoryFailureMessage({ message: "  Unable to reach transcription provider.  " })).toBe(
      "Unable to reach transcription provider.",
    );
    expect(formatTranscriptoryFailureMessage(null, "Fallback message")).toBe("Fallback message");
  });

  it("loads searchable library results and detail payloads through normalized Transcriptory helpers", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          captures: [
            {
              id: "capture-1",
              title: "Walk note",
              transcriptText: "Raw words",
              rawTranscript: "Raw words",
              summary: "A direct summary.",
              themes: ["Workflow"],
              linkedCaptures: [],
              hasAudio: true,
              status: "ready",
              transcriptStatus: "ready",
              createdAt: "2026-06-10T00:00:00.000Z",
              updatedAt: "2026-06-10T00:00:00.000Z",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          capture: {
            id: "capture-1",
            title: "Walk note",
            transcriptText: "Raw words",
            rawTranscript: "Raw words",
            summary: "A direct summary.",
            themes: ["Workflow"],
            linkedCaptures: ["capture-2"],
            status: "ready",
            transcriptStatus: "ready",
            createdAt: "2026-06-10T00:00:00.000Z",
            updatedAt: "2026-06-10T00:00:00.000Z",
          },
          sources: [{ id: "source-1", source_type: "upload" }],
          session: { id: "session-1", title: "Morning walks" },
        }),
      });

    const { getTranscriptoryCapture, listTranscriptoryCaptures } = await import("@/lib/transcriptory");
    const captures = await listTranscriptoryCaptures({ q: "raw signal", theme: "Workflow", status: "ready", limit: 25 });
    const detail = await getTranscriptoryCapture("capture-1");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/transcriptory/captures?q=raw+signal&theme=Workflow&status=ready&limit=25");
    expect(captures[0].transcriptText).toBe("Raw words");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/transcriptory/captures/capture-1");
    expect(detail.sources[0].source_type).toBe("upload");
    expect(detail.session?.id).toBe("session-1");
  });

  it("creates Transcriptory sessions and server-side handoff packets", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [{ id: "session-1", title: "Morning walks" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ session: { id: "session-2", title: "Afternoon walks" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          handoff: {
            target: "creation_corner",
            captureId: "capture-1",
            markdown: "# Transcriptory capture: Walk note\n\nRaw transcript:\nRaw words",
          },
        }),
      });

    const { createTranscriptorySession, listTranscriptorySessions, requestTranscriptoryHandoff } = await import("@/lib/transcriptory");
    const sessions = await listTranscriptorySessions();
    const session = await createTranscriptorySession({ title: "Afternoon walks" });
    const handoff = await requestTranscriptoryHandoff("capture-1", "creation_corner");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/transcriptory/sessions");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "GET", credentials: "include" });
    expect(sessions[0].id).toBe("session-1");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/transcriptory/sessions");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "POST", credentials: "include" });
    expect(session.id).toBe("session-2");
    expect(fetchMock.mock.calls[2][0]).toBe("/api/transcriptory/captures/capture-1/handoff");
    expect(handoff.markdown).toContain("Raw words");
  });
});
