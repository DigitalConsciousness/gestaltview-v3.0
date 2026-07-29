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
    const { transcribeTranscriptoryAudio } =
      await import("@/lib/transcriptory");
    const file = new File(
      [new Blob(["audio bytes"], { type: "audio/webm" })],
      "note.webm",
      {
        type: "audio/webm",
      },
    );

    const result = await transcribeTranscriptoryAudio({
      captureId: "capture-1",
      file,
    });

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
    expect(JSON.stringify(fetchMock.mock.calls[0][1])).not.toContain(
      "ASSEMBLYAI",
    );
  });

  it("builds clean handoff text for Blackboard and Creation Corner without JSON payloads", async () => {
    const { buildTranscriptoryHandoffText } =
      await import("@/lib/transcriptory");

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
    const { formatTranscriptoryFailureMessage } =
      await import("@/lib/transcriptory");

    expect(
      formatTranscriptoryFailureMessage(
        new Error("AssemblyAI upload failed: payload too large"),
      ),
    ).toBe("AssemblyAI upload failed: payload too large");
    expect(
      formatTranscriptoryFailureMessage({
        message: "  Unable to reach transcription provider.  ",
      }),
    ).toBe("Unable to reach transcription provider.");
    expect(formatTranscriptoryFailureMessage(null, "Fallback message")).toBe(
      "Fallback message",
    );
  });

  it("keeps local-only captures recoverable with the same synchronization identity", async () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    const { createLocalTranscriptoryCapture, listLocalTranscriptoryCaptures } =
      await import("@/lib/transcriptory");

    const capture = createLocalTranscriptoryCapture({
      title: "Offline thought",
      rawTranscript: "Preserve these exact words.",
    });
    const reopened = listLocalTranscriptoryCaptures();

    expect(reopened).toHaveLength(1);
    expect(reopened[0]).toMatchObject({
      id: capture.id,
      rawTranscript: "Preserve these exact words.",
      metadata: {
        persistence: "local_only",
        localCaptureId: capture.id,
      },
    });
  });

  it("includes the durable handoff id in the destination compatibility packet", async () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      sessionStorage: {
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    const { TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY, writeTranscriptoryHandoff } =
      await import("@/lib/transcriptory");
    writeTranscriptoryHandoff(
      "blackboard",
      {
        id: "capture-1",
        title: "Cited source",
        rawTranscript: "Exact words",
        summary: "",
        themes: [],
        linkedCaptures: [],
        status: "ready",
        createdAt: "2026-07-29T00:00:00.000Z",
        updatedAt: "2026-07-29T00:00:00.000Z",
      },
      { handoffId: "handoff-1" },
    );

    expect(
      JSON.parse(values.get(TRANSCRIPTORY_BLACKBOARD_HANDOFF_KEY) ?? "{}"),
    ).toMatchObject({
      captureId: "capture-1",
      handoffId: "handoff-1",
    });
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

    const { getTranscriptoryCapture, listTranscriptoryCaptures } =
      await import("@/lib/transcriptory");
    const captures = await listTranscriptoryCaptures({
      q: "raw signal",
      theme: "Workflow",
      status: "ready",
      limit: 25,
    });
    const detail = await getTranscriptoryCapture("capture-1");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/transcriptory/captures?q=raw+signal&theme=Workflow&status=ready&limit=25",
    );
    expect(captures[0].transcriptText).toBe("Raw words");
    expect(fetchMock.mock.calls[1][0]).toBe(
      "/api/transcriptory/captures/capture-1",
    );
    expect(detail.sources[0].source_type).toBe("upload");
    expect(detail.session?.id).toBe("session-1");
  });

  it("creates Transcriptory sessions and canonical durable handoff offers", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessions: [{ id: "session-1", title: "Morning walks" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          session: { id: "session-2", title: "Afternoon walks" },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          handoff: {
            contractVersion: "gestaltview.runtime-handoff.v1",
            handoffId: "4d65eb8d-1ae0-40af-a18d-16c334f10723",
            ownerId: "8d96383f-702a-46c4-a3e5-0d88d621c701",
            source: {
              room: "transcriptory",
              entityType: "transcriptory_capture",
              entityId: "capture-1",
              immutableRef: "transcriptory-capture:capture-1",
            },
            destination: {
              room: "creation_corner",
              requestedAction: "use_as_source_material",
            },
            payload: {
              context: { title: "Walk note", sourceKind: "audio" },
              references: [
                {
                  type: "transcriptory_capture",
                  ref: "transcriptory-capture:capture-1",
                  label: "Walk note",
                },
              ],
            },
            selectedEmbodiments: [],
            intent: "synthesize",
            state: "prepared",
            idempotencyKey: "transcriptory:capture-1:creation_corner:v1",
            provenance: {
              actorType: "user",
              actorId: "8d96383f-702a-46c4-a3e5-0d88d621c701",
              originatingRoute: "/transcriptory",
              consentScope: ["offer:creation_corner"],
              createdAt: "2026-07-29T00:00:00.000Z",
              updatedAt: "2026-07-29T00:00:00.000Z",
            },
            receipt: null,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          handoff: {
            contractVersion: "gestaltview.runtime-handoff.v1",
            handoffId: "4d65eb8d-1ae0-40af-a18d-16c334f10723",
            ownerId: "8d96383f-702a-46c4-a3e5-0d88d621c701",
            source: {
              room: "transcriptory",
              entityType: "transcriptory_capture",
              entityId: "capture-1",
              immutableRef: "transcriptory-capture:capture-1",
            },
            destination: {
              room: "creation_corner",
              requestedAction: "use_as_source_material",
            },
            payload: {
              context: { title: "Walk note", sourceKind: "audio" },
              references: [
                {
                  type: "transcriptory_capture",
                  ref: "transcriptory-capture:capture-1",
                  label: "Walk note",
                },
              ],
            },
            selectedEmbodiments: [],
            intent: "synthesize",
            state: "offered",
            idempotencyKey: "transcriptory:capture-1:creation_corner:v1",
            provenance: {
              actorType: "user",
              actorId: "8d96383f-702a-46c4-a3e5-0d88d621c701",
              originatingRoute: "/transcriptory",
              consentScope: ["offer:creation_corner"],
              createdAt: "2026-07-29T00:00:00.000Z",
              updatedAt: "2026-07-29T00:00:01.000Z",
            },
            receipt: null,
          },
        }),
      });

    const {
      createTranscriptorySession,
      listTranscriptorySessions,
      requestTranscriptoryHandoff,
    } = await import("@/lib/transcriptory");
    const sessions = await listTranscriptorySessions();
    const session = await createTranscriptorySession({
      title: "Afternoon walks",
    });
    const handoff = await requestTranscriptoryHandoff({
      capture: {
        id: "capture-1",
        userId: "8d96383f-702a-46c4-a3e5-0d88d621c701",
        title: "Walk note",
        rawTranscript: "Raw words",
        summary: "A summary",
        themes: ["Workflow"],
        linkedCaptures: [],
        sourceKind: "audio",
        transcriptStatus: "ready",
        status: "ready",
        createdAt: "2026-07-29T00:00:00.000Z",
        updatedAt: "2026-07-29T00:00:00.000Z",
      },
      target: "creation_corner",
    });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/transcriptory/sessions");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: "GET",
      credentials: "include",
    });
    expect(sessions[0].id).toBe("session-1");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/transcriptory/sessions");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: "POST",
      credentials: "include",
    });
    expect(session.id).toBe("session-2");
    expect(fetchMock.mock.calls[2][0]).toBe("/api/runtime-handoffs");
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toMatchObject({
      contractVersion: "gestaltview.runtime-handoff.v1",
      source: {
        room: "transcriptory",
        entityId: "capture-1",
        immutableRef: "transcriptory-capture:capture-1",
      },
      destination: { room: "creation_corner" },
      idempotencyKey: "transcriptory:capture-1:creation_corner:v1",
    });
    expect(JSON.stringify(fetchMock.mock.calls[2][1].body)).not.toContain(
      "Raw words",
    );
    expect(fetchMock.mock.calls[3][0]).toBe(
      "/api/runtime-handoffs/4d65eb8d-1ae0-40af-a18d-16c334f10723",
    );
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({
      state: "offered",
    });
    expect(handoff.state).toBe("offered");
  });
});
