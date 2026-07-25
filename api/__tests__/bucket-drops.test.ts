import { beforeEach, describe, expect, it, vi } from "vitest";
import actionsHandler from "../_lib/actionsHandler";
import bucketDropHandler from "../billy-bucket-drop";

const { insertRowMock, listBucketDropsMock, getAuthUserMock } = vi.hoisted(() => ({
  insertRowMock: vi.fn(async () => true),
  listBucketDropsMock: vi.fn(async () => []),
  getAuthUserMock: vi.fn(async () => null),
}));

vi.mock("../_lib/supabase", () => ({
  insertRow: insertRowMock,
  listBucketDrops: listBucketDropsMock,
}));

vi.mock("../_lib/auth", () => ({
  getAuthUser: getAuthUserMock,
}));

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
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
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
  };
}

describe("bucket drop endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists bucket drops through the actions route with derived launch fields", async () => {
    const res = createRes();

    await actionsHandler(
      {
        method: "POST",
        query: { path: ["bucket-drops"] },
        headers: {},
        body: {
          id: "drop-1",
          content: "keep this",
          rawText: "keep this",
          captureContext: {
            bucketDrop: {
              recipient: "Future self",
              isSealed: true,
              contentType: "text",
            },
          },
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(insertRowMock).toHaveBeenCalledWith(
      "bucket_drops",
      expect.objectContaining({
        id: "drop-1",
        user_id: "guest-user",
        content: "keep this",
        raw_text: "keep this",
        stage: "captured",
        intensity: expect.any(Number),
        plk_resonance_score: expect.any(Number),
        capture_context: expect.objectContaining({
          bucketDrop: expect.objectContaining({
            recipient: "Future self",
            isSealed: true,
            contentType: "text",
          }),
          source: "api",
        }),
      }),
    );
    expect(res.body).toMatchObject({
      response: expect.any(String),
      provider: "bucket-drop-capture",
      metadata: expect.objectContaining({
        bucketDrop: expect.objectContaining({
          id: "drop-1",
          userId: "guest-user",
        }),
      }),
    });
  });

  it("lists persisted bucket drops through the authenticated GET route", async () => {
    getAuthUserMock.mockResolvedValueOnce({ id: "auth-user" } as never);
    listBucketDropsMock.mockResolvedValueOnce([
      {
        id: "drop-1",
        user_id: "auth-user",
        content: "keep this",
        raw_text: "keep this",
        capture_context: {
          bucketDrop: {
            recipient: "Future self",
            releaseTrigger: "birthday",
            isSealed: true,
            contentType: "text",
          },
        },
        created_at: "2026-06-12T00:00:00.000Z",
        subject_id: null,
        module_key: null,
        intensity: 6,
        plk_resonance_score: 0.72,
        specialized_apps: [],
        tags: ["bucket-drop"],
        stage: "captured",
        promoted_memory_id: null,
        scored_at: null,
        promoted_at: null,
      },
    ] as never);

    const res = createRes();

    await bucketDropHandler(
      {
        method: "GET",
        query: {},
        headers: {},
        body: {},
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(listBucketDropsMock).toHaveBeenCalledWith("auth-user");
    expect(res.body).toMatchObject({
      bucketDrops: [
        {
          id: "drop-1",
          userId: "auth-user",
          content: "keep this",
          rawText: "keep this",
          createdAt: "2026-06-12T00:00:00.000Z",
          stage: "captured",
          intensity: 6,
          plkResonanceScore: 0.72,
          captureContext: expect.objectContaining({
            bucketDrop: expect.objectContaining({
              recipient: "Future self",
              releaseTrigger: "birthday",
              isSealed: true,
              contentType: "text",
            }),
          }),
        },
      ],
    });
  });
});
