import { createHash } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ARTIFACT_ID = "33333333-3333-4333-8333-333333333333";

type ResponseCapture = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
};

function responseCapture(): { res: VercelResponse; capture: ResponseCapture } {
  const capture: ResponseCapture = { statusCode: 200, body: undefined, headers: {} };
  const res = {
    status(code: number) {
      capture.statusCode = code;
      return this;
    },
    json(body: unknown) {
      capture.body = body;
      return this;
    },
    setHeader(name: string, value: string) {
      capture.headers[name] = value;
      return this;
    },
    end() {
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

describe("render engine durable contract", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SUPABASE_URL = "https://render-proof.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-proof-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an unauthenticated request before writing a job", async () => {
    vi.doMock("../../api/_lib/auth.js", () => ({
      getAuthUser: vi.fn().mockResolvedValue(null),
    }));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { default: handler } = await import("../../api/render/engine.js");
    const { res, capture } = responseCapture();

    await handler(
      {
        method: "POST",
        headers: {},
        body: { sourceFamily: "scene_graph", content: "# Private" },
      } as VercelRequest,
      res,
    );

    expect(capture.statusCode).toBe(401);
    expect(capture.body).toMatchObject({
      ok: false,
      error: { code: "AUTHENTICATION_REQUIRED" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("persists real HTML bytes and a matching receipt before becoming ready", async () => {
    vi.doMock("../../api/_lib/auth.js", () => ({
      getAuthUser: vi.fn().mockResolvedValue({
        id: OWNER_ID,
        email: "owner@example.com",
      }),
    }));

    const jobs: Array<Record<string, unknown>> = [];
    const receipts: Array<Record<string, unknown>> = [];
    const storedObjects = new Map<string, Uint8Array>();
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";

      if (url.includes("/rest/v1/render_jobs?") && method === "GET") {
        return jsonResponse([]);
      }
      if (url.endsWith("/rest/v1/render_jobs") && method === "POST") {
        jobs.push(JSON.parse(String(init?.body)));
        return jsonResponse({}, 201);
      }
      if (url.includes("/rest/v1/render_jobs?") && method === "PATCH") {
        Object.assign(jobs[0], JSON.parse(String(init?.body)));
        return new Response(null, { status: 204 });
      }
      if (url.includes("/storage/v1/object/") && method === "POST") {
        const bytes = new Uint8Array(await new Response(init?.body).arrayBuffer());
        storedObjects.set(url, bytes);
        return jsonResponse({ id: `upload-${storedObjects.size}` }, 200);
      }
      if (url.endsWith("/rest/v1/render_artifacts") && method === "POST") {
        receipts.push(JSON.parse(String(init?.body)));
        return jsonResponse([{ id: ARTIFACT_ID }], 201);
      }
      throw new Error(`Unexpected proof request: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { default: handler } = await import("../../api/render/engine.js");
    const { res, capture } = responseCapture();
    await handler(
      {
        method: "POST",
        headers: {},
        body: {
          contractVersion: "gestaltview.render-request.v2",
          sourceFamily: "scene_graph",
          content: "# Convergence proof\n\nKnown marker: GV-RENDER-PROOF",
          targets: [
            {
              format: "html",
              mimeType: "text/html; charset=utf-8",
              destinationIntent: "preview",
              required: true,
            },
          ],
          idempotencyKey: "convergence-proof",
        },
      } as VercelRequest,
      res,
    );

    expect(
      capture.statusCode,
      JSON.stringify({
        body: capture.body,
        calls: fetchMock.mock.calls.map(([input, init]) => [
          String(input),
          (init as RequestInit | undefined)?.method ?? "GET",
        ]),
      }),
    ).toBe(200);
    expect(capture.body).toMatchObject({
      ok: true,
      reused: false,
      job: { status: "ready" },
    });
    expect(jobs[0]).toMatchObject({
      user_id: OWNER_ID,
      status: "ready",
      source_family: "scene_graph",
    });

    const htmlReceipt = receipts.find((receipt) =>
      String(receipt.mime_type).startsWith("text/html"),
    );
    expect(htmlReceipt).toBeDefined();
    const storedEntry = [...storedObjects.entries()].find(([url]) =>
      url.endsWith(String(htmlReceipt?.storage_path)),
    );
    expect(storedEntry).toBeDefined();
    const storedBytes = storedEntry?.[1] ?? new Uint8Array();
    expect(storedBytes.byteLength).toBeGreaterThan(0);
    expect(new TextDecoder().decode(storedBytes)).toContain("GV-RENDER-PROOF");
    expect(htmlReceipt).toMatchObject({
      user_id: OWNER_ID,
      byte_size: storedBytes.byteLength,
      content_hash: createHash("sha256").update(storedBytes).digest("hex"),
      target_status: "success",
    });
  });

  it("records an unsupported required target as a durable failed job", async () => {
    vi.doMock("../../api/_lib/auth.js", () => ({
      getAuthUser: vi.fn().mockResolvedValue({
        id: OWNER_ID,
        email: "owner@example.com",
      }),
    }));
    const jobs: Array<Record<string, unknown>> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";
        if (url.includes("/rest/v1/render_jobs?") && method === "GET") {
          return jsonResponse([]);
        }
        if (url.endsWith("/rest/v1/render_jobs") && method === "POST") {
          jobs.push(JSON.parse(String(init?.body)));
          return jsonResponse({}, 201);
        }
        if (url.includes("/rest/v1/render_jobs?") && method === "PATCH") {
          Object.assign(jobs[0], JSON.parse(String(init?.body)));
          return new Response(null, { status: 204 });
        }
        throw new Error(`Unexpected proof request: ${method} ${url}`);
      }),
    );
    const { default: handler } = await import("../../api/render/engine.js");
    const { res, capture } = responseCapture();

    await handler(
      {
        method: "POST",
        headers: {},
        body: {
          contractVersion: "gestaltview.render-request.v2",
          sourceFamily: "scene_graph",
          content: "# Unsupported proof",
          targets: [
            {
              format: "mp4",
              mimeType: "video/mp4",
              destinationIntent: "download",
              required: true,
            },
          ],
        },
      } as VercelRequest,
      res,
    );

    expect(capture.statusCode, JSON.stringify({ body: capture.body, jobs })).toBe(422);
    expect(capture.body).toMatchObject({
      ok: false,
      job: { status: "failed" },
      manifest: {
        targetReceipts: [{ format: "mp4", required: true, status: "unsupported" }],
      },
    });
    expect(jobs[0]?.status).toBe("failed");
  });

  it("keeps an optional unsupported target as a warning without falsifying its status", async () => {
    vi.doMock("../../api/_lib/auth.js", () => ({
      getAuthUser: vi.fn().mockResolvedValue({
        id: OWNER_ID,
        email: "owner@example.com",
      }),
    }));
    const jobs: Array<Record<string, unknown>> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";
        if (url.includes("/rest/v1/render_jobs?") && method === "GET") {
          return jsonResponse([]);
        }
        if (url.endsWith("/rest/v1/render_jobs") && method === "POST") {
          jobs.push(JSON.parse(String(init?.body)));
          return jsonResponse({}, 201);
        }
        if (url.includes("/rest/v1/render_jobs?") && method === "PATCH") {
          Object.assign(jobs[0], JSON.parse(String(init?.body)));
          return new Response(null, { status: 204 });
        }
        throw new Error(`Unexpected optional-target proof request: ${method} ${url}`);
      }),
    );
    const { default: handler } = await import("../../api/render/engine.js");
    const { res, capture } = responseCapture();

    await handler(
      {
        method: "POST",
        headers: {},
        body: {
          contractVersion: "gestaltview.render-request.v2",
          sourceFamily: "scene_graph",
          content: "# Optional target proof",
          targets: [
            {
              format: "mp4",
              mimeType: "video/mp4",
              destinationIntent: "download",
              required: false,
            },
          ],
        },
      } as VercelRequest,
      res,
    );

    expect(capture.statusCode).toBe(200);
    expect(capture.body).toMatchObject({
      ok: true,
      job: { status: "ready" },
      diagnostics: [
        {
          code: "TARGET_PLANNED_NOT_WIRED",
          severity: "warning",
          details: { format: "mp4", required: false, targetStatus: "unsupported" },
        },
      ],
      manifest: {
        targetReceipts: [{ format: "mp4", required: false, status: "unsupported" }],
      },
    });
  });

  it("returns the existing owner job for the same canonical idempotency input", async () => {
    vi.doMock("../../api/_lib/auth.js", () => ({
      getAuthUser: vi.fn().mockResolvedValue({
        id: OWNER_ID,
        email: "owner@example.com",
      }),
    }));
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/rest/v1/render_jobs?")) {
        expect(url).toContain(`user_id=eq.${OWNER_ID}`);
        return jsonResponse([
          {
            id: "55555555-5555-4555-8555-555555555555",
            status: "ready",
            graph_id: "existing-graph",
            diagnostics: [],
            manifest: { contract: "gestaltview.render-result.v2" },
          },
        ]);
      }
      if (url.includes("/rest/v1/render_artifacts?")) {
        return jsonResponse([
          {
            id: ARTIFACT_ID,
            format: "html",
            backend: "gestalt-document-backend",
            byte_size: 12,
            mime_type: "text/html",
            content_hash: "a".repeat(64),
            target_status: "success",
          },
        ]);
      }
      throw new Error(`Unexpected idempotency proof request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { default: handler } = await import("../../api/render/engine.js");
    const { res, capture } = responseCapture();

    await handler(
      {
        method: "POST",
        headers: {},
        body: {
          contractVersion: "gestaltview.render-request.v2",
          sourceFamily: "scene_graph",
          content: "# Stable input",
          idempotencyKey: "stable-client-key",
        },
      } as VercelRequest,
      res,
    );

    expect(capture.statusCode).toBe(200);
    expect(capture.body).toMatchObject({
      ok: true,
      reused: true,
      job: {
        id: "55555555-5555-4555-8555-555555555555",
        status: "ready",
      },
      artifacts: [{ id: ARTIFACT_ID, hash: "a".repeat(64) }],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
