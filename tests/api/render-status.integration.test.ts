import type { VercelRequest, VercelResponse } from "@vercel/node";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const JOB_ID = "33333333-3333-4333-8333-333333333333";

function responseCapture() {
  const capture = { statusCode: 200, body: undefined as unknown };
  const res = {
    status(code: number) {
      capture.statusCode = code;
      return this;
    },
    json(body: unknown) {
      capture.body = body;
      return this;
    },
    setHeader() {
      return this;
    },
  } as unknown as VercelResponse;
  return { res, capture };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function loadHandler(userId: string) {
  vi.resetModules();
  vi.doMock("../../api/_lib/auth.js", () => ({
    getAuthUser: vi.fn().mockResolvedValue({
      id: userId,
      email: `${userId}@example.com`,
    }),
  }));
  return (await import("../../api/render/status.js")).default;
}

describe("render status owner scope", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://render-proof.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-proof-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns an owner-scoped receipt with a five-minute signed URL", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/rest/v1/render_jobs?")) {
        expect(url).toContain(`user_id=eq.${OWNER_ID}`);
        return jsonResponse([
          {
            id: JOB_ID,
            status: "ready",
            graph_id: "proof-graph",
            diagnostics: "[]",
            manifest: '{"contract":"gestaltview.render-result.v2"}',
            created_at: "2026-07-27T00:00:00.000Z",
            updated_at: "2026-07-27T00:01:00.000Z",
          },
        ]);
      }
      if (url.includes("/rest/v1/render_artifacts?")) {
        expect(url).toContain(`user_id=eq.${OWNER_ID}`);
        return jsonResponse([
          {
            id: "44444444-4444-4444-8444-444444444444",
            format: "html",
            mime_type: "text/html; charset=utf-8",
            backend: "gestalt-document-backend",
            storage_bucket: "codex-exports",
            storage_path: `rendered/${OWNER_ID}/${JOB_ID}/artifact.html`,
            byte_size: 42,
            content_hash: "a".repeat(64),
            target_status: "success",
            metadata: {},
          },
        ]);
      }
      if (url.includes("/storage/v1/object/sign/")) {
        return jsonResponse({ signedURL: "/object/sign/codex-exports/proof?token=test" });
      }
      throw new Error(`Unexpected status proof request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadHandler(OWNER_ID);
    const { res, capture } = responseCapture();

    await handler(
      { method: "GET", query: { jobId: JOB_ID } } as unknown as VercelRequest,
      res,
    );

    expect(capture.statusCode).toBe(200);
    expect(capture.body).toMatchObject({
      ok: true,
      job: { id: JOB_ID, status: "ready" },
      artifacts: [
        {
          bytes: 42,
          hash: "a".repeat(64),
          downloadExpiresInSeconds: 300,
          downloadUrl:
            "https://render-proof.supabase.co/storage/v1/object/sign/codex-exports/proof?token=test",
        },
      ],
    });
  });

  it("does not reveal another owner's job or artifacts", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      expect(url).toContain(`user_id=eq.${OTHER_ID}`);
      return jsonResponse([]);
    });
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadHandler(OTHER_ID);
    const { res, capture } = responseCapture();

    await handler(
      { method: "GET", query: { jobId: JOB_ID } } as unknown as VercelRequest,
      res,
    );

    expect(capture.statusCode).toBe(404);
    expect(capture.body).toMatchObject({
      ok: false,
      error: { code: "RENDER_JOB_NOT_FOUND" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
