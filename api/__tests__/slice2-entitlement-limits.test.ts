import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthMock = vi.fn();
const getTranscriptorySupabaseAdminMock = vi.fn();
const getInnerWorldSupabaseAdminMock = vi.fn();
const uploadInnerWorldFileObjectMock = vi.fn();
const buildInnerWorldFilePayloadMock = vi.fn(async (row: any) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
}));

vi.mock("../_lib/auth", () => ({
  requireAuth: requireAuthMock,
}));

vi.mock("../_lib/transcriptory", () => ({
  getTranscriptorySupabaseAdmin: getTranscriptorySupabaseAdminMock,
  TRANSCRIPTORY_CAPTURE_SELECT: "*",
  buildTranscriptoryCapturePayload: (row: any) => ({ id: row.id, userId: row.user_id }),
}));

vi.mock("../_lib/inner-world", () => ({
  buildInnerWorldFilePayload: buildInnerWorldFilePayloadMock,
  getInnerWorldSupabaseAdmin: getInnerWorldSupabaseAdminMock,
  storagePathForUserFile: (userId: string, fileId: string, fileName: string) => `user-files/${userId}/${fileId}/${fileName}`,
  uploadInnerWorldFileObject: uploadInnerWorldFileObjectMock,
}));

vi.mock("../_lib/llmRouter", () => ({
  routeLlm: vi.fn(),
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

function makeCountBuilder(count = 0) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => Promise.resolve({ count, error: null })),
  };
  return builder;
}

describe("Slice 2 entitlement limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthMock.mockReturnValue({
      id: "user-free",
      email: "free@example.com",
      tier: "free",
      isAdmin: false,
    });
    delete process.env.ASSEMBLYAI_API_KEY;
    delete process.env.BILLY_TRANSCRIPTION_URL;
    delete process.env.GROQ_API_KEY;
    delete process.env.HUGGINGFACE_API_KEY;
    delete process.env.HF_API_TOKEN;
  });

  it("blocks free Transcriptory audio uploads over the free tier cap before provider calls", async () => {
    process.env.ASSEMBLYAI_API_KEY = "aai_test_key";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const module = await import("../transcriptory/transcribe");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {
          "content-type": "audio/webm",
          "content-length": String(16 * 1024 * 1024),
          "x-capture-id": "capture-1",
        },
        body: Buffer.from("tiny test body"),
        query: {},
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(413);
    expect(res.body).toMatchObject({
      error: "upgrade_required",
      feature: "transcriptory_audio_upload",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getTranscriptorySupabaseAdminMock).not.toHaveBeenCalled();
  });

  it("blocks free large file imports before storage writes", async () => {
    getInnerWorldSupabaseAdminMock.mockReturnValue({ from: vi.fn(() => makeCountBuilder(0)) });
    const module = await import("../inner-world/files");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        query: {},
        body: {
          file: {
            id: "file-1",
            name: "large-image.png",
            mimeType: "image/png",
            sizeBytes: 12 * 1024 * 1024,
          },
          base64DataUrl: "data:image/png;base64,AAAA",
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(413);
    expect(res.body).toMatchObject({
      error: "upgrade_required",
      feature: "large_file_import",
    });
    expect(uploadInnerWorldFileObjectMock).not.toHaveBeenCalled();
  });
});
