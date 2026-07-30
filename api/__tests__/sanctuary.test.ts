import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const getInnerWorldSupabaseAdminMock = vi.fn();
const buildInnerWorldFilePayloadMock = vi.fn(async (row: any) => ({
  id: row.source_ref ?? row.id,
  userId: row.user_id,
  name: row.name,
  mimeType: row.mime_type,
  sizeBytes: row.size_bytes,
  storagePath: row.storage_path,
  roomOrigin: row.room_origin,
  tags: row.tags ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  kind: "text",
}));

vi.mock("../_lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../_lib/inner-world", () => ({
  buildInnerWorldFilePayload: buildInnerWorldFilePayloadMock,
  getInnerWorldSupabaseAdmin: getInnerWorldSupabaseAdminMock,
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

type BuilderOptions = {
  singleData?: any;
  maybeSingleData?: any;
  listData?: any[];
};

function createBuilder(options: BuilderOptions = {}) {
  const calls = {
    eq: [] as Array<[string, unknown]>,
    upsert: [] as Array<
      [Record<string, unknown>, Record<string, unknown> | undefined]
    >,
    select: [] as string[],
    onConflict: [] as string[],
    insert: [] as Array<Record<string, unknown>>,
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
    order() {
      return builder;
    },
    limit() {
      return Promise.resolve({ data: options.listData ?? [], error: null });
    },
    in() {
      return Promise.resolve({ data: options.listData ?? [], error: null });
    },
    upsert(payload: Record<string, unknown>, opts?: Record<string, unknown>) {
      calls.upsert.push([payload, opts]);
      if (typeof opts?.onConflict === "string") {
        calls.onConflict.push(opts.onConflict);
      }
      return builder;
    },
    insert(payload: Record<string, unknown>) {
      calls.insert.push(payload);
      return Promise.resolve({ data: null, error: null });
    },
    single() {
      return Promise.resolve({ data: options.singleData ?? null, error: null });
    },
    maybeSingle() {
      return Promise.resolve({
        data: options.maybeSingleData ?? null,
        error: null,
      });
    },
  };
  return builder;
}

async function loadJournalModule() {
  vi.resetModules();
  return import("../sanctuary/journal");
}

async function loadScrapbookModule() {
  vi.resetModules();
  return import("../sanctuary/scrapbook");
}

describe("sanctuary persistence API", () => {
  beforeEach(() => {
    requireAuthMock.mockReset();
    getInnerWorldSupabaseAdminMock.mockReset();
    buildInnerWorldFilePayloadMock.mockClear();
    requireAuthMock.mockReturnValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "enterprise",
      isAdmin: true,
    });
  });

  it("saves the journal with a stable source_ref instead of a client UUID boundary", async () => {
    const module = await loadJournalModule();
    const journalBuilder = createBuilder({
      singleData: {
        id: "11111111-1111-1111-1111-111111111111",
        source_ref: "sanctuary-journal-local",
        user_id: "user-1",
        content: "<p>Quiet note</p>",
        created_at: "2026-05-26T00:00:00.000Z",
        updated_at: "2026-05-26T00:00:00.000Z",
      },
    });
    getInnerWorldSupabaseAdminMock.mockReturnValue({
      from: vi.fn(() => journalBuilder),
    });

    const req = {
      method: "POST",
      headers: {},
      body: {
        journalId: "sanctuary-journal-local",
        content: "<p>Quiet note</p>",
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(journalBuilder.calls.upsert[0]?.[0]).toMatchObject({
      user_id: "user-1",
      source_ref: "sanctuary-journal-local",
      content: "<p>Quiet note</p>",
    });
    expect(journalBuilder.calls.onConflict).toContain("source_ref");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      journal: {
        id: "sanctuary-journal-local",
      },
    });
  });

  it("saves scrapbook items by source_ref and resolves uploaded files by source_ref", async () => {
    const module = await loadScrapbookModule();
    const scrapbookBuilder = createBuilder({
      singleData: {
        id: "22222222-2222-2222-2222-222222222222",
        source_ref: "scrapbook-local",
        user_id: "user-1",
        file_id: "33333333-3333-3333-3333-333333333333",
        source_file_ref: "file-local",
        caption: "Pinned note",
        created_at: "2026-05-26T00:00:00.000Z",
        updated_at: "2026-05-26T00:00:00.000Z",
      },
    });
    const fileBuilder = createBuilder({
      maybeSingleData: {
        id: "33333333-3333-3333-3333-333333333333",
        source_ref: "file-local",
        user_id: "user-1",
        name: "note.txt",
        mime_type: "text/plain",
        size_bytes: 42,
        storage_path: "user-files/user-1/file-local/note",
        room_origin: "sanctuary",
        tags: [],
        preview_text: "Pinned note",
        preview_html: null,
        created_at: "2026-05-26T00:00:00.000Z",
        updated_at: "2026-05-26T00:00:00.000Z",
      },
    });
    getInnerWorldSupabaseAdminMock.mockReturnValue({
      from: vi.fn((table: string) =>
        table === "scrapbook_items" ? scrapbookBuilder : fileBuilder,
      ),
    });

    const req = {
      method: "POST",
      headers: {},
      body: {
        itemId: "scrapbook-local",
        fileId: "file-local",
        caption: "Pinned note",
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(fileBuilder.calls.eq).toContainEqual(["source_ref", "file-local"]);
    expect(scrapbookBuilder.calls.upsert[0]?.[0]).toMatchObject({
      user_id: "user-1",
      source_ref: "scrapbook-local",
      source_file_ref: "file-local",
      file_id: "33333333-3333-3333-3333-333333333333",
    });
    expect(scrapbookBuilder.calls.onConflict).toContain("source_ref");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      item: {
        id: "scrapbook-local",
        fileId: "file-local",
        file: {
          id: "file-local",
        },
      },
    });
  });

  it("preserves both journal versions when optimistic concurrency detects a conflict", async () => {
    const module = await loadJournalModule();
    const journalBuilder = createBuilder({
      maybeSingleData: {
        id: "11111111-1111-1111-1111-111111111111",
        source_ref: "sanctuary-journal-local",
        user_id: "user-1",
        content: "<p>Remote words</p>",
        source_kind: "authored",
        source_entity_ref: null,
        archived_at: null,
        revision: 2,
        created_at: "2026-07-30T00:00:00.000Z",
        updated_at: "2026-07-30T02:00:00.000Z",
      },
    });
    const conflictBuilder = createBuilder();
    getInnerWorldSupabaseAdminMock.mockReturnValue({
      from: vi.fn((table: string) =>
        table === "journals" ? journalBuilder : conflictBuilder,
      ),
    });
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          journalId: "sanctuary-journal-local",
          content: "<p>Local words</p>",
          expectedUpdatedAt: "2026-07-30T01:00:00.000Z",
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(409);
    expect(conflictBuilder.calls.insert[0]).toMatchObject({
      owner_id: "user-1",
      entity_kind: "journal",
      source_ref: "sanctuary-journal-local",
      local_payload: { content: "<p>Local words</p>" },
      remote_payload: { content: "<p>Remote words</p>" },
    });
    expect(journalBuilder.calls.upsert).toEqual([]);
  });

});
