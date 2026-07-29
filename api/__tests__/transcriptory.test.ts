import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const getTranscriptorySupabaseAdminMock = vi.fn();
const routeLlmMock = vi.fn();
const fetchMock = vi.fn();

vi.mock("../_lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../_lib/transcriptory", () => ({
  getTranscriptorySupabaseAdmin: getTranscriptorySupabaseAdminMock,
  TRANSCRIPTORY_CAPTURE_SELECT: "*",
  TRANSCRIPTORY_SESSION_SELECT: "*",
  TRANSCRIPTORY_SOURCE_SELECT: "*",
  getQueryValue: (value: string | string[] | undefined) =>
    Array.isArray(value) ? (value[0] ?? "") : (value ?? ""),
  getPaginationValue: (
    value: string | string[] | undefined,
    fallback: number,
  ) => {
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number.parseInt(raw ?? "", 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  },
  normalizeTranscriptoryStatus: (status?: string) => {
    if (status === "transcribing") return "processing";
    if (status === "error") return "failed";
    return status === "ready" || status === "processing" || status === "failed"
      ? status
      : "pending";
  },
  normalizeHandoffTarget: (value: unknown) =>
    value === "creation_corner" ||
    value === "blackboard_room" ||
    value === "universal_capture"
      ? value
      : null,
  handoffSourceForTarget: (target: string) => {
    if (target === "creation_corner")
      return {
        sourceType: "creation_corner_seed",
        sourcePage: "creation_corner",
      };
    if (target === "blackboard_room")
      return {
        sourceType: "blackboard_handoff",
        sourcePage: "blackboard_room",
      };
    return { sourceType: "universal_capture", sourcePage: "universal_capture" };
  },
  buildTranscriptoryCapturePayload: (row: any) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title ?? "Untitled transcript",
    sessionId: row.session_id ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    hasAudio: Boolean(row.audio_storage_path),
    audioStoragePath: row.audio_storage_path ?? undefined,
    rawTranscript: row.raw_transcript ?? "",
    transcriptText: row.transcript_text ?? row.raw_transcript ?? "",
    summary: row.summary ?? "",
    themes: row.themes ?? [],
    linkedCaptures: row.linked_captures ?? [],
    linkedBlackboardSession: row.linked_blackboard_session ?? undefined,
    linkedCreationCornerArtifact:
      row.linked_creation_corner_artifact ?? undefined,
    contextWeight: row.context_weight ?? 1,
    sourceKind: row.source_kind ?? "audio",
    sourceLabel: row.source_label ?? undefined,
    processingProvider: row.processing_provider ?? undefined,
    transcriptStatus:
      row.transcript_status ?? (row.status === "ready" ? "ready" : "pending"),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
  buildTranscriptoryHandoffPayload: (capture: any, target: string) => ({
    target,
    captureId: capture.id,
    title: capture.title ?? "Untitled transcript",
    summary: capture.summary ?? "",
    themes: capture.themes ?? [],
    markdown: [
      `# Transcriptory capture: ${capture.title ?? "Untitled transcript"}`,
      capture.summary ? `Summary:\n${capture.summary}` : "",
      capture.raw_transcript
        ? `Raw transcript:\n${capture.raw_transcript}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  }),
  buildTranscriptorySessionPayload: (row: any) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title ?? "Untitled session",
    description: row.description ?? "",
    origin: row.origin,
    status: row.status,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }),
}));

vi.mock("../_lib/llmRouter", () => ({
  routeLlm: routeLlmMock,
}));

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  getHeader: (key: string) => string | undefined;
  end: (value?: string) => void;
};

function createRes(): MockRes {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      return this;
    },
    getHeader(key: string) {
      return this.headers[key];
    },
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
  };
}

function createBuilder(options: { listData?: any[]; singleData?: any } = {}) {
  const calls = {
    eq: [] as Array<[string, unknown]>,
    is: [] as Array<[string, unknown]>,
    in: [] as Array<[string, unknown[]]>,
    neq: [] as Array<[string, unknown]>,
    insert: [] as Array<Record<string, unknown>>,
    update: [] as Array<Record<string, unknown>>,
    delete: [] as boolean[],
    select: [] as string[],
  };
  const builder: any = {
    calls,
    select(columns: string) {
      calls.select.push(columns);
      return builder;
    },
    eq(column: string, value: unknown) {
      calls.eq.push([column, value]);
      return builder;
    },
    is(column: string, value: unknown) {
      calls.is.push([column, value]);
      return builder;
    },
    in(column: string, value: unknown[]) {
      calls.in.push([column, value]);
      return builder;
    },
    neq(column: string, value: unknown) {
      calls.neq.push([column, value]);
      return builder;
    },
    textSearch(column: string, value: unknown) {
      calls.eq.push([`textSearch:${column}`, value]);
      return builder;
    },
    contains(column: string, value: unknown) {
      calls.eq.push([`contains:${column}`, value]);
      return builder;
    },
    range(from: number, to: number) {
      calls.eq.push(["range", [from, to]]);
      return Promise.resolve({ data: options.listData ?? [], error: null });
    },
    order() {
      return builder;
    },
    limit() {
      return Promise.resolve({ data: options.listData ?? [], error: null });
    },
    insert(payload: Record<string, unknown>) {
      calls.insert.push(payload);
      return builder;
    },
    update(payload: Record<string, unknown>) {
      calls.update.push(payload);
      return builder;
    },
    delete() {
      calls.delete.push(true);
      return builder;
    },
    single() {
      return Promise.resolve({ data: options.singleData ?? null, error: null });
    },
  };
  return builder;
}

describe("Transcriptory API", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    routeLlmMock.mockReset();
    routeLlmMock.mockResolvedValue({
      response: JSON.stringify({
        summary: "A concise Transcriptory summary.",
        themes: ["Product", "Workflow"],
      }),
      provider: "test-provider",
      timestamp: "2026-06-09T00:00:00.000Z",
    });
    requireAuthMock.mockReset();
    getTranscriptorySupabaseAdminMock.mockReset();
    delete process.env.ASSEMBLYAI_API_KEY;
    delete process.env.BILLY_TRANSCRIPTION_URL;
    delete process.env.GROQ_API_KEY;
    delete process.env.HUGGINGFACE_API_KEY;
    delete process.env.HF_API_TOKEN;
    requireAuthMock.mockReturnValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "enterprise",
      isAdmin: true,
    });
  });

  it("requires authentication before listing captures", async () => {
    requireAuthMock.mockReturnValue({
      status: 401,
      body: { error: "Authentication required" },
    });
    const module = await import("../transcriptory/captures");
    const res = createRes();

    await module.default({ method: "GET", headers: {} } as never, res as never);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Authentication required" });
  }, 10000);

  it("lists only the authenticated user's transcriptory captures", async () => {
    const builder = createBuilder({
      listData: [
        {
          id: "capture-1",
          user_id: "user-1",
          title: "Morning Walk",
          duration_seconds: 120,
          audio_storage_path: "user-1/audio.webm",
          raw_transcript: "Raw words",
          summary: "Summary",
          themes: ["Product"],
          linked_captures: [],
          linked_blackboard_session: null,
          linked_creation_corner_artifact: null,
          context_weight: 1,
          status: "ready",
          created_at: "2026-06-09T00:00:00.000Z",
          updated_at: "2026-06-09T00:00:00.000Z",
        },
      ],
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/captures");
    const res = createRes();

    await module.default({ method: "GET", headers: {} } as never, res as never);

    expect(builder.calls.eq).toContainEqual(["user_id", "user-1"]);
    expect(builder.calls.is).toContainEqual(["archived_at", null]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      captures: [
        {
          id: "capture-1",
          userId: "user-1",
          title: "Morning Walk",
          status: "ready",
          themes: ["Product"],
        },
      ],
    });
  });

  it("filters the transcriptory library by session, text query, theme, status, and pagination", async () => {
    const builder = createBuilder({ listData: [] });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/captures");
    const res = createRes();

    await module.default(
      {
        method: "GET",
        headers: {},
        query: {
          sessionId: "session-1",
          q: "raw signal",
          theme: "Workflow",
          status: "ready",
          limit: "25",
          offset: "50",
        },
      } as never,
      res as never,
    );

    expect(builder.calls.eq).toContainEqual(["user_id", "user-1"]);
    expect(builder.calls.eq).toContainEqual(["session_id", "session-1"]);
    expect(builder.calls.eq).toContainEqual(["transcript_status", "ready"]);
    expect(builder.calls.eq).toContainEqual([
      "textSearch:search_document",
      "raw signal",
    ]);
    expect(builder.calls.eq).toContainEqual(["contains:themes", ["Workflow"]]);
    expect(builder.calls.eq).toContainEqual(["range", [50, 74]]);
    expect(res.statusCode).toBe(200);
  });

  it("creates a pending transcriptory capture for upload or recording handoff", async () => {
    const builder = createBuilder({
      singleData: {
        id: "capture-2",
        user_id: "user-1",
        title: "Uploaded voice note",
        duration_seconds: null,
        audio_storage_path: "user-1/voice.webm",
        raw_transcript: null,
        summary: null,
        themes: [],
        linked_captures: [],
        linked_blackboard_session: null,
        linked_creation_corner_artifact: null,
        context_weight: 1,
        status: "pending",
        created_at: "2026-06-09T00:00:00.000Z",
        updated_at: "2026-06-09T00:00:00.000Z",
      },
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/captures");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          title: "Uploaded voice note",
          audioStoragePath: "user-1/voice.webm",
        },
      } as never,
      res as never,
    );

    expect(builder.calls.insert[0]).toMatchObject({
      user_id: "user-1",
      title: "Uploaded voice note",
      audio_storage_path: "user-1/voice.webm",
      status: "pending",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      capture: { id: "capture-2", status: "pending" },
    });
  });

  it("forces upload captures into pending unless raw transcript text is already present", async () => {
    const builder = createBuilder({
      singleData: {
        id: "capture-3",
        user_id: "user-1",
        title: "Pending upload",
        audio_storage_path: "user-1/pending.webm",
        raw_transcript: null,
        transcript_text: null,
        status: "pending",
        transcript_status: "pending",
        created_at: "2026-06-09T00:00:00.000Z",
        updated_at: "2026-06-09T00:00:00.000Z",
      },
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn((table: string) =>
        table === "transcriptory_captures" ? builder : createBuilder(),
      ),
    });

    const module = await import("../transcriptory/captures");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          title: "Pending upload",
          audioStoragePath: "user-1/pending.webm",
          status: "processing",
        },
      } as never,
      res as never,
    );

    expect(builder.calls.insert[0]?.status).toBe("pending");
  });

  it("creates sessions for accumulating related transcriptory captures", async () => {
    const builder = createBuilder({
      singleData: {
        id: "session-1",
        user_id: "user-1",
        title: "Morning walks",
        description: "Notes from recurring walking captures.",
        origin: "transcriptory",
        status: "active",
        started_at: "2026-06-10T00:00:00.000Z",
        ended_at: null,
        created_at: "2026-06-10T00:00:00.000Z",
        updated_at: "2026-06-10T00:00:00.000Z",
      },
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/sessions");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          title: "Morning walks",
          description: "Notes from recurring walking captures.",
        },
      } as never,
      res as never,
    );

    expect(builder.calls.insert[0]).toMatchObject({
      user_id: "user-1",
      title: "Morning walks",
      description: "Notes from recurring walking captures.",
      origin: "transcriptory",
      status: "active",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      session: { id: "session-1", title: "Morning walks" },
    });
  });

  it("lists the authenticated user's transcriptory sessions", async () => {
    const builder = createBuilder({
      listData: [
        {
          id: "session-1",
          user_id: "user-1",
          title: "Morning walks",
          description: null,
          origin: "transcriptory",
          status: "active",
          started_at: "2026-06-10T00:00:00.000Z",
          ended_at: null,
          created_at: "2026-06-10T00:00:00.000Z",
          updated_at: "2026-06-10T00:00:00.000Z",
        },
      ],
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/sessions");
    const res = createRes();

    await module.default({ method: "GET", headers: {} } as never, res as never);

    expect(builder.calls.eq).toContainEqual(["user_id", "user-1"]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      sessions: [{ id: "session-1", title: "Morning walks" }],
    });
  });

  it("updates owned transcriptory sessions by id", async () => {
    const builder = createBuilder({
      singleData: {
        id: "session-1",
        user_id: "user-1",
        title: "Renamed walk notes",
        description: "Updated description.",
        origin: "transcriptory",
        status: "active",
        started_at: "2026-06-10T00:00:00.000Z",
        ended_at: null,
        created_at: "2026-06-10T00:00:00.000Z",
        updated_at: "2026-06-10T00:00:00.000Z",
      },
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/sessions/[id]");
    const res = createRes();

    await module.default(
      {
        method: "PATCH",
        headers: {},
        query: { id: "session-1" },
        body: {
          title: "Renamed walk notes",
          description: "Updated description.",
        },
      } as never,
      res as never,
    );

    expect(builder.calls.update[0]).toMatchObject({
      title: "Renamed walk notes",
      description: "Updated description.",
    });
    expect(builder.calls.eq).toContainEqual(["id", "session-1"]);
    expect(builder.calls.eq).toContainEqual(["user_id", "user-1"]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      session: { id: "session-1", title: "Renamed walk notes" },
    });
  });

  it("returns capture detail with source lineage and session, then marks it accessed", async () => {
    const captureBuilder = createBuilder({
      singleData: {
        id: "capture-1",
        user_id: "user-1",
        title: "Morning Walk",
        raw_transcript: "These are the raw words.",
        transcript_text: "These are the raw words.",
        summary: "A direct summary.",
        themes: ["Workflow"],
        linked_captures: ["capture-related"],
        status: "ready",
        transcript_status: "ready",
        source_kind: "audio",
        created_at: "2026-06-10T00:00:00.000Z",
        updated_at: "2026-06-10T00:00:00.000Z",
      },
    });
    const sourceBuilder = createBuilder({
      listData: [
        {
          id: "source-1",
          source_type: "upload",
          source_page: "transcriptory",
          created_at: "2026-06-10T00:00:00.000Z",
        },
      ],
    });
    const sessionBuilder = createBuilder({ singleData: null });
    const fromMock = vi.fn((table: string) => {
      if (table === "transcriptory_sources") return sourceBuilder;
      if (table === "transcriptory_sessions") return sessionBuilder;
      return captureBuilder;
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({ from: fromMock });
    const module = await import("../transcriptory/captures/[id]");
    const res = createRes();

    await module.default(
      { method: "GET", headers: {}, query: { id: "capture-1" } } as never,
      res as never,
    );

    expect(captureBuilder.calls.eq).toContainEqual(["id", "capture-1"]);
    expect(captureBuilder.calls.eq).toContainEqual(["user_id", "user-1"]);
    expect(captureBuilder.calls.update[0]).toHaveProperty("last_accessed_at");
    expect(sourceBuilder.calls.eq).toContainEqual(["capture_id", "capture-1"]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      capture: { id: "capture-1", transcriptText: "These are the raw words." },
      sources: [{ id: "source-1", source_type: "upload" }],
    });
  });

  it("creates a normalized handoff packet without JSON dumping transcript fields", async () => {
    const captureBuilder = createBuilder({
      singleData: {
        id: "capture-1",
        user_id: "user-1",
        title: "Walk note",
        raw_transcript: "These are the raw words.",
        summary: "A direct summary.",
        themes: ["Workflow"],
        status: "ready",
        transcript_status: "ready",
        created_at: "2026-06-10T00:00:00.000Z",
        updated_at: "2026-06-10T00:00:00.000Z",
      },
    });
    const sourceBuilder = createBuilder({ singleData: { id: "source-2" } });
    const fromMock = vi.fn((table: string) =>
      table === "transcriptory_sources" ? sourceBuilder : captureBuilder,
    );
    getTranscriptorySupabaseAdminMock.mockReturnValue({ from: fromMock });
    const module = await import("../transcriptory/captures/[id]/handoff");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        query: { id: "capture-1" },
        body: { target: "creation_corner" },
      } as never,
      res as never,
    );

    expect(sourceBuilder.calls.insert[0]).toMatchObject({
      user_id: "user-1",
      capture_id: "capture-1",
      source_type: "creation_corner_seed",
      source_page: "creation_corner",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      handoff: {
        target: "creation_corner",
        captureId: "capture-1",
        markdown: expect.stringContaining("These are the raw words."),
      },
    });
    expect(JSON.stringify(res.body)).not.toContain("raw_transcript");
  });

  it("does not fall back to browser speech recognition for transcription", async () => {
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: { captureId: "capture-1" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(501);
    expect(res.body).toMatchObject({
      error: "transcription_provider_not_configured",
      browserSpeechRecognitionUsed: false,
    });
  });

  it("reclaims zombie processing captures that were never actually started", async () => {
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";

    const singleMock = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: {
          id: "capture-zombie",
          user_id: "user-1",
          title: "Zombie",
          status: "processing",
          transcript_status: "processing",
          processing_started_at: null,
          raw_transcript: null,
          created_at: "2026-06-09T00:00:00.000Z",
          updated_at: "2026-06-09T00:00:00.000Z",
        },
        error: null,
      });
    const claimBuilder: any = {
      update: vi.fn(() => claimBuilder),
      eq: vi.fn(() => claimBuilder),
      in: vi.fn(() => claimBuilder),
      is: vi.fn(() => claimBuilder),
      select: vi.fn(() => claimBuilder),
      single: singleMock,
    };

    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => claimBuilder),
      storage: {
        createBucket: vi.fn(),
        from: vi.fn(() => ({ upload: vi.fn() })),
      },
    });

    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: { "x-capture-id": "capture-zombie" },
      } as never,
      res as never,
    );

    expect(res.statusCode).not.toBe(409);
  });

  it("requires authentication before transcribing audio", async () => {
    requireAuthMock.mockReturnValue({
      status: 401,
      body: { error: "Authentication required" },
    });
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {
          "content-type": "audio/webm",
          "x-capture-id": "capture-1",
        },
        body: Buffer.from("audio bytes"),
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Authentication required" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("transcribes raw audio through AssemblyAI and updates the authenticated capture", async () => {
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";
    const builder = createBuilder({
      listData: [
        {
          id: "capture-related",
          user_id: "user-1",
          title: "Related workflow note",
          duration_seconds: 30,
          audio_storage_path: null,
          raw_transcript: "More workflow product capture.",
          summary: "A related workflow note.",
          themes: ["Workflow", "Product"],
          linked_captures: [],
          linked_blackboard_session: null,
          linked_creation_corner_artifact: null,
          context_weight: 1,
          status: "ready",
          created_at: "2026-06-08T00:00:00.000Z",
          updated_at: "2026-06-08T00:00:00.000Z",
        },
      ],
      singleData: {
        id: "capture-1",
        user_id: "user-1",
        title: "Morning Walk",
        duration_seconds: 42,
        audio_storage_path: null,
        raw_transcript: "Raw transcript from AssemblyAI.",
        summary: "A concise Transcriptory summary.",
        themes: ["Product", "Workflow"],
        linked_captures: ["capture-related"],
        linked_blackboard_session: null,
        linked_creation_corner_artifact: null,
        context_weight: 1,
        status: "ready",
        created_at: "2026-06-09T00:00:00.000Z",
        updated_at: "2026-06-09T00:00:00.000Z",
      },
    });
    const uploadMock = vi.fn().mockResolvedValue({ error: null });
    const storageFromMock = vi.fn(() => ({ upload: uploadMock }));
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
      storage: {
        createBucket: vi
          .fn()
          .mockResolvedValue({ error: { message: "already exists" } }),
        from: storageFromMock,
      },
    });
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          upload_url: "https://cdn.assemblyai.com/upload/audio.webm",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "aai-transcript-1", status: "queued" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "aai-transcript-1", status: "processing" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "aai-transcript-1",
          status: "completed",
          text: "Raw transcript from AssemblyAI.",
          audio_duration: 42,
        }),
      });
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {
          "content-type": "audio/webm",
          "x-capture-id": "capture-1",
          "X-Filename": "note.webm",
        },
        body: Buffer.from("audio bytes"),
      } as never,
      res as never,
    );

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.assemblyai.com/v2/upload",
    );
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe(
      "aai_test_key",
    );
    expect(fetchMock.mock.calls[0][1].headers.Authorization).not.toMatch(
      /^Bearer /,
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://api.assemblyai.com/v2/transcript",
    );
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      audio_url: "https://cdn.assemblyai.com/upload/audio.webm",
      speech_models: ["universal-3-pro", "universal-2"],
    });
    expect(builder.calls.eq).toContainEqual(["id", "capture-1"]);
    expect(builder.calls.eq).toContainEqual(["user_id", "user-1"]);
    expect(builder.calls.update).toContainEqual(
      expect.objectContaining({
        status: "processing",
        transcript_status: "processing",
        processing_provider: "assemblyai",
      }),
    );
    expect(builder.calls.in).toContainEqual(["status", ["pending", "failed"]]);
    expect(builder.calls.update).toContainEqual(
      expect.objectContaining({
        raw_transcript: "Raw transcript from AssemblyAI.",
        duration_seconds: 42,
        audio_storage_path: expect.stringMatching(
          /^user-1\/capture-1\/.+note\.webm$/,
        ),
        summary: "A concise Transcriptory summary.",
        themes: ["Product", "Workflow"],
        linked_captures: ["capture-related"],
        status: "ready",
      }),
    );
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/^user-1\/capture-1\/.+note\.webm$/),
      expect.any(ArrayBuffer),
      expect.objectContaining({
        contentType: "audio/webm",
        cacheControl: "3600",
        upsert: true,
      }),
    );
    expect(storageFromMock).toHaveBeenCalledWith("transcriptory_audio_files");
    expect(routeLlmMock).toHaveBeenCalledWith(
      expect.stringContaining("Raw transcript from AssemblyAI."),
      expect.objectContaining({
        mode: "transcriptory-summary",
        userId: "user-1",
      }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      transcript: "Raw transcript from AssemblyAI.",
      duration_seconds: 42,
      provider: "assemblyai",
      summary: "A concise Transcriptory summary.",
      themes: ["Product", "Workflow"],
      capture: {
        id: "capture-1",
        status: "ready",
        summary: "A concise Transcriptory summary.",
        themes: ["Product", "Workflow"],
        linkedCaptures: ["capture-related"],
      },
    });
  });

  it("archives owned transcriptory captures on delete and removes their sources", async () => {
    const builder = createBuilder({
      singleData: {
        id: "capture-3",
        user_id: "user-1",
        title: "Failed note",
        duration_seconds: null,
        audio_storage_path: "user-1/failed.webm",
        raw_transcript: null,
        summary: null,
        themes: [],
        linked_captures: [],
        linked_blackboard_session: null,
        linked_creation_corner_artifact: null,
        context_weight: 1,
        status: "failed",
        created_at: "2026-06-09T00:00:00.000Z",
        updated_at: "2026-06-09T00:00:00.000Z",
        archived_at: null,
      },
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/captures/[id]");
    const res = createRes();

    await module.default(
      { method: "DELETE", headers: {}, query: { id: "capture-3" } } as never,
      res as never,
    );

    expect(builder.calls.eq).toContainEqual(["id", "capture-3"]);
    expect(builder.calls.eq).toContainEqual(["user_id", "user-1"]);
    expect(builder.calls.is).toContainEqual(["archived_at", null]);
    expect(builder.calls.update[0]).toMatchObject({
      archived_at: expect.any(String),
      updated_at: expect.any(String),
    });
    expect(builder.calls.delete).toEqual([true]);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      deleted: true,
      captureId: "capture-3",
      archivedAt: expect.any(String),
    });
  });

  it("rejects unsafe capture ids before storage or provider work", async () => {
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {
          "content-type": "audio/webm",
          "x-capture-id": "../victim",
        },
        body: Buffer.from("audio bytes"),
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      error: "invalid_capture_id",
    });
    expect(getTranscriptorySupabaseAdminMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects duplicate same-capture transcription before provider work", async () => {
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";
    const builder = createBuilder({ singleData: null });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {
          "content-type": "audio/webm",
          "x-capture-id": "capture-duplicate",
        },
        body: Buffer.from("audio bytes"),
      } as never,
      res as never,
    );

    expect(builder.calls.update[0]).toMatchObject({
      status: "processing",
      transcript_status: "processing",
    });
    expect(builder.calls.in).toContainEqual(["status", ["pending", "failed"]]);
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({
      error: "capture_already_processing",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not claim a capture when the audio body is empty", async () => {
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";
    const builder = createBuilder({
      singleData: {
        id: "capture-empty",
        user_id: "user-1",
        status: "processing",
        transcript_status: "processing",
        created_at: "2026-06-09T00:00:00.000Z",
        updated_at: "2026-06-09T00:00:00.000Z",
      },
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
    });
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {
          "content-type": "audio/webm",
          "x-capture-id": "capture-empty",
        },
        body: Buffer.alloc(0),
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ error: "audio_required" });
    expect(builder.calls.update).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("marks provider failures as failed with safe diagnostics", async () => {
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";
    const builder = createBuilder({
      singleData: {
        id: "capture-failed",
        user_id: "user-1",
        title: "Failure note",
        duration_seconds: null,
        audio_storage_path: null,
        raw_transcript: null,
        summary: null,
        themes: [],
        linked_captures: [],
        linked_blackboard_session: null,
        linked_creation_corner_artifact: null,
        context_weight: 1,
        status: "processing",
        transcript_status: "processing",
        created_at: "2026-06-09T00:00:00.000Z",
        updated_at: "2026-06-09T00:00:00.000Z",
      },
    });
    const uploadMock = vi.fn().mockResolvedValue({ error: null });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
      storage: {
        createBucket: vi
          .fn()
          .mockResolvedValue({ error: { message: "already exists" } }),
        from: vi.fn(() => ({ upload: uploadMock })),
      },
    });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      statusText: "Bad Gateway",
      json: async () => ({
        error:
          "provider unavailable with sensitive detail that should not leak forever",
      }),
    });
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {
          "content-type": "audio/webm",
          "x-capture-id": "capture-failed",
        },
        body: Buffer.from("audio bytes"),
      } as never,
      res as never,
    );

    expect(builder.calls.update).toContainEqual(
      expect.objectContaining({
        status: "failed",
        transcript_status: "failed",
        audio_storage_path: expect.stringMatching(
          /^user-1\/capture-failed\/.+audio\.webm$/,
        ),
        error_code: "assemblyai_transcription_failed",
        error_message: expect.stringContaining("AssemblyAI upload failed"),
        processing_completed_at: expect.any(String),
      }),
    );
    expect(res.statusCode).toBe(502);
    expect(res.body).toMatchObject({
      error: "assemblyai_transcription_failed",
      browserSpeechRecognitionUsed: false,
    });
  });

  it("times out AssemblyAI polling within a bounded function budget", async () => {
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";
    const builder = createBuilder({
      singleData: {
        id: "capture-timeout",
        user_id: "user-1",
        title: "Timeout note",
        duration_seconds: null,
        audio_storage_path: null,
        raw_transcript: null,
        summary: null,
        themes: [],
        linked_captures: [],
        linked_blackboard_session: null,
        linked_creation_corner_artifact: null,
        context_weight: 1,
        status: "processing",
        transcript_status: "processing",
        created_at: "2026-06-09T00:00:00.000Z",
        updated_at: "2026-06-09T00:00:00.000Z",
      },
    });
    getTranscriptorySupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => builder),
      storage: {
        createBucket: vi
          .fn()
          .mockResolvedValue({ error: { message: "already exists" } }),
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ error: null }),
        })),
      },
    });
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          upload_url: "https://cdn.assemblyai.com/upload/audio.webm",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "aai-transcript-timeout", status: "queued" }),
      });
    for (let i = 0; i < 80; i += 1) {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "aai-transcript-timeout",
          status: "processing",
        }),
      });
    }
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {
          "content-type": "audio/webm",
          "x-capture-id": "capture-timeout",
        },
        body: Buffer.from("audio bytes"),
      } as never,
      res as never,
    );

    expect(fetchMock).toHaveBeenCalledTimes(10);
    expect(builder.calls.update).toContainEqual(
      expect.objectContaining({
        status: "failed",
        transcript_status: "failed",
        error_message: "AssemblyAI transcription timed out.",
      }),
    );
    expect(res.statusCode).toBe(502);
  });
});
