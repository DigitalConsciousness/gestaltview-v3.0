import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const JOB_ID = "33333333-3333-4333-8333-333333333333";
const ARTIFACT_ID = "44444444-4444-4444-8444-444444444444";
const PROJECTION_ID = "55555555-5555-4555-8555-555555555555";
const HTML = "<!doctype html><html><body>GV-PROJECTION-PROOF</body></html>";

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
  return (await import("../../api/render/promote-to-gallery.js")).default;
}

function request(): VercelRequest {
  return {
    method: "POST",
    body: {
      renderJobId: JOB_ID,
      targetRoom: "dynamic_inner_world",
      title: "Projection proof",
    },
  } as VercelRequest;
}

describe("render projection contract", () => {
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

  it("rejects a non-ready owner job before reading artifacts", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([{ id: JOB_ID, status: "rendering", graph_id: "proof-graph" }]),
    );
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadHandler(OWNER_ID);
    const { res, capture } = responseCapture();

    await handler(request(), res);

    expect(capture.statusCode).toBe(409);
    expect(capture.body).toMatchObject({
      error: { code: "RENDER_JOB_NOT_READY" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("downloads verified bytes and creates a source-preserving projection", async () => {
    const inserts: Array<Record<string, unknown>> = [];
    const receiptHash = createHash("sha256").update(HTML).digest("hex");
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.includes("/rest/v1/render_jobs?") && method === "GET") {
        expect(url).toContain(`user_id=eq.${OWNER_ID}`);
        return jsonResponse([
          { id: JOB_ID, status: "ready", graph_id: "proof-graph", manifest: {} },
        ]);
      }
      if (url.includes("/rest/v1/render_artifacts?")) {
        expect(url).toContain("content_hash");
        return jsonResponse([
          {
            id: ARTIFACT_ID,
            format: "html",
            mime_type: "text/html; charset=utf-8",
            backend: "gestalt-document-backend",
            storage_bucket: "codex-exports",
            storage_path: `rendered/${OWNER_ID}/${JOB_ID}/artifact.html`,
            byte_size: Buffer.byteLength(HTML),
            content_hash: receiptHash,
            target_status: "success",
            metadata: {},
          },
        ]);
      }
      if (url.includes("/rest/v1/inner_world_artifacts?")) return jsonResponse([]);
      if (url.includes("/storage/v1/object/authenticated/")) {
        return new Response(HTML, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      if (url.endsWith("/rest/v1/inner_world_artifacts") && method === "POST") {
        inserts.push(JSON.parse(String(init?.body)));
        return jsonResponse([{ id: PROJECTION_ID }], 201);
      }
      if (url.includes("/rest/v1/render_jobs?") && method === "PATCH") {
        return new Response(null, { status: 204 });
      }
      throw new Error(`Unexpected projection proof request: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadHandler(OWNER_ID);
    const { res, capture } = responseCapture();

    await handler(request(), res);

    expect(capture.statusCode).toBe(200);
    expect(capture.body).toMatchObject({
      ok: true,
      projectedIds: [PROJECTION_ID],
      targetRoom: "dynamic_inner_world",
    });
    expect(inserts[0]).toMatchObject({
      user_id: OWNER_ID,
      html: HTML,
      source_ref: `render-artifact:${ARTIFACT_ID}`,
      content_ref: {
        renderJobId: JOB_ID,
        renderArtifactId: ARTIFACT_ID,
      },
    });
  });

  it("reuses an existing projection without downloading or inserting again", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.includes("/rest/v1/render_jobs?") && method === "GET") {
        return jsonResponse([
          { id: JOB_ID, status: "ready", graph_id: "proof-graph", manifest: {} },
        ]);
      }
      if (url.includes("/rest/v1/render_artifacts?")) {
        return jsonResponse([
          {
            id: ARTIFACT_ID,
            format: "html",
            mime_type: "text/html",
            backend: "gestalt-document-backend",
            storage_bucket: "codex-exports",
            storage_path: "existing/artifact.html",
            byte_size: Buffer.byteLength(HTML),
            content_hash: createHash("sha256").update(HTML).digest("hex"),
            target_status: "success",
          },
        ]);
      }
      if (url.includes("/rest/v1/inner_world_artifacts?")) {
        return jsonResponse([{ id: PROJECTION_ID }]);
      }
      if (url.includes("/rest/v1/render_jobs?") && method === "PATCH") {
        return new Response(null, { status: 204 });
      }
      throw new Error(`Idempotent projection performed an unexpected request: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadHandler(OWNER_ID);
    const { res, capture } = responseCapture();

    await handler(request(), res);

    expect(capture.statusCode).toBe(200);
    expect(capture.body).toMatchObject({
      ok: true,
      projectedIds: [PROJECTION_ID],
      idempotent: true,
    });
    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).includes("/storage/v1/object/authenticated/"),
      ),
    ).toBe(false);
  });

  it("does not project another owner's job", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      expect(String(input)).toContain(`user_id=eq.${OTHER_ID}`);
      return jsonResponse([]);
    });
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadHandler(OTHER_ID);
    const { res, capture } = responseCapture();

    await handler(request(), res);

    expect(capture.statusCode).toBe(404);
    expect(capture.body).toMatchObject({
      error: { code: "RENDER_JOB_NOT_FOUND" },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refuses projection when stored bytes do not match the receipt", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/rest/v1/render_jobs?")) {
        return jsonResponse([
          { id: JOB_ID, status: "ready", graph_id: "proof-graph", manifest: {} },
        ]);
      }
      if (url.includes("/rest/v1/render_artifacts?")) {
        return jsonResponse([
          {
            id: ARTIFACT_ID,
            format: "html",
            mime_type: "text/html",
            backend: "gestalt-document-backend",
            storage_bucket: "codex-exports",
            storage_path: "corrupt/artifact.html",
            byte_size: Buffer.byteLength(HTML),
            content_hash: "a".repeat(64),
            target_status: "success",
          },
        ]);
      }
      if (url.includes("/rest/v1/inner_world_artifacts?")) return jsonResponse([]);
      if (url.includes("/storage/v1/object/authenticated/")) return new Response(HTML);
      throw new Error(`Unexpected corrupt-receipt request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadHandler(OWNER_ID);
    const { res, capture } = responseCapture();

    await handler(request(), res);

    expect(capture.statusCode).toBe(422);
    expect(capture.body).toMatchObject({
      ok: false,
      error: { code: "NO_PROJECTABLE_HTML" },
      skipped: [
        {
          artifactId: ARTIFACT_ID,
          reason: "Stored bytes do not match the durable render receipt.",
        },
      ],
    });
  });
});
