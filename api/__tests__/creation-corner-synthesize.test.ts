import { beforeEach, describe, expect, it, vi } from "vitest";

const createArtifactMock = vi.hoisted(() => vi.fn());
const scoreResonanceMock = vi.hoisted(() => vi.fn());
const getAuthUserMock = vi.hoisted(() => vi.fn());

vi.mock("../../shared/gen-engine/index.js", () => ({
  createArtifact: createArtifactMock,
  getDefaultConsent: () => ({}),
  normalizeConsent: (value: unknown) => value,
  scoreResonance: scoreResonanceMock,
}));

vi.mock("../_lib/auth.js", () => ({
  getAuthUser: getAuthUserMock,
}));

const handlerPromise = import("../creation-corner/synthesize");

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

describe("creation corner synthesize route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserMock.mockResolvedValue({
      id: "user-1",
      email: "keithsoyka@gmail.com",
      tier: "free",
      isAdmin: false,
    });
    scoreResonanceMock.mockReturnValue({ score: 92, warnings: [] });
    createArtifactMock.mockReturnValue({
      artifact: {
        id: "artifact-1",
        title: "Session Recap",
        content: "Recap content.",
      },
      warnings: [],
      provenance: {
        artifactId: "artifact-1",
        sourceCaptureIds: [],
        sourceHashes: [],
        artifactHash: "hash-1",
        generatedAt: "2026-06-12T00:00:00.000Z",
        engineVersion: "test",
      },
      reviewRequired: false,
    });
  });

  it("routes blocked session recaps back to Creation Corner and returns an override warning", async () => {
    const module = await handlerPromise;
    const req = {
      method: "POST",
      headers: {},
      body: {
        text: "A warm recap of the session.",
        artifact_type: "session_recap",
        destination: "dynamic_inner_world",
      },
    };
    const res = createRes();

    await module.default(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(createArtifactMock).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: "creation-corner",
        targetType: "session-recap",
        tags: expect.arrayContaining(["creation-corner", "session_recap", "preserve_voice", "creation_corner"]),
      })
    );
    expect(res.body).toMatchObject({
      destination: "creation-corner",
      destination_override: expect.stringContaining("session_recap"),
    });
    expect((res.body as { warnings?: string[] }).warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("Destination override")])
    );
  });
});
