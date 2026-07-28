import type { VercelRequest, VercelResponse } from "@vercel/node";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_ID = "22222222-2222-4222-8222-222222222222";
const HANDOFF_ID = "33333333-3333-4333-8333-333333333333";

function responseCapture() {
  const capture = { statusCode: 200, body: undefined as unknown, ended: false };
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
    end() {
      capture.ended = true;
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

function createInput(intent = "continue") {
  return {
    contractVersion: "gestaltview.runtime-handoff.v1",
    source: {
      room: "blackboard",
      entityType: "capture",
      entityId: "capture-1",
      revision: "rev-1",
      immutableRef: "capture-events:source-1",
    },
    destination: {
      room: "creation_corner",
      requestedAction: "continue-editing",
    },
    payload: { context: { summary: "Derivative" }, references: [] },
    selectedEmbodiments: [],
    intent,
    idempotencyKey: "stable-blackboard-source-rev-1-key",
    provenance: {
      actorType: "user",
      actorId: OWNER_ID,
      originatingRoute: "/blackboard",
      consentScope: ["creation_corner:read_source"],
    },
  };
}

function row(overrides: Record<string, unknown> = {}) {
  return {
    handoff_id: HANDOFF_ID,
    contract_version: "gestaltview.runtime-handoff.v1",
    owner_id: OWNER_ID,
    source_room: "blackboard",
    source_entity_type: "capture",
    source_entity_id: "capture-1",
    source_revision: "rev-1",
    source_ref: "capture-events:source-1",
    destination_room: "creation_corner",
    requested_action: "continue-editing",
    payload: { context: { summary: "Derivative" }, references: [] },
    selected_embodiments: [],
    intent: "continue",
    state: "prepared",
    idempotency_key: "stable-blackboard-source-rev-1-key",
    material_fingerprint: "",
    provenance: {
      actorType: "user",
      actorId: OWNER_ID,
      originatingRoute: "/blackboard",
      consentScope: ["creation_corner:read_source"],
    },
    receipt: null,
    created_at: "2026-07-27T20:00:00.000Z",
    updated_at: "2026-07-27T20:00:00.000Z",
    ...overrides,
  };
}

async function loadCreateHandler(userId: string | null) {
  vi.resetModules();
  vi.doMock("../../api/_lib/auth.js", () => ({
    getAuthUser: vi
      .fn()
      .mockResolvedValue(
        userId ? { id: userId, email: `${userId}@example.com` } : null,
      ),
  }));
  return (await import("../../api/runtime-handoffs/index.js")).default;
}

async function loadItemHandler(userId: string) {
  vi.resetModules();
  vi.doMock("../../api/_lib/auth.js", () => ({
    getAuthUser: vi.fn().mockResolvedValue({
      id: userId,
      email: `${userId}@example.com`,
    }),
  }));
  return (await import("../../api/runtime-handoffs/[id].js")).default;
}

describe("runtime handoff owner scope and idempotency", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://handoff-proof.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-proof-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects anonymous preparation", async () => {
    const handler = await loadCreateHandler(null);
    const { res, capture } = responseCapture();
    await handler(
      { method: "POST", body: createInput() } as VercelRequest,
      res,
    );
    expect(capture.statusCode).toBe(401);
  });

  it("returns the same handoff for the same owner and material", async () => {
    const input = createInput();
    const shared = await import("../../api/runtime-handoffs/_shared.js");
    const existing = row({
      material_fingerprint: shared.runtimeHandoffMaterialFingerprint(
        shared.createRuntimeHandoffRow
          ? (input as Parameters<
              typeof shared.runtimeHandoffMaterialFingerprint
            >[0])
          : never,
      ),
    });
    const fetchMock = vi.fn(
      async (request: string | URL | Request, init?: RequestInit) => {
        const url = String(request);
        expect(url).toContain(`owner_id=eq.${OWNER_ID}`);
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer server-only-proof-key",
        });
        return jsonResponse([existing]);
      },
    );
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadCreateHandler(OWNER_ID);
    const { res, capture } = responseCapture();
    await handler({ method: "POST", body: input } as VercelRequest, res);
    expect(capture.statusCode).toBe(200);
    expect(capture.body).toMatchObject({
      ok: true,
      handoff: { handoffId: HANDOFF_ID },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects materially different intent under an existing key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse([
          row({
            material_fingerprint: "different-material",
          }),
        ]),
      ),
    );
    const handler = await loadCreateHandler(OWNER_ID);
    const { res, capture } = responseCapture();
    await handler(
      { method: "POST", body: createInput("render") } as VercelRequest,
      res,
    );
    expect(capture.statusCode).toBe(409);
    expect(capture.body).toMatchObject({
      error: { code: "IDEMPOTENCY_MATERIAL_MISMATCH" },
    });
  });

  it("does not reveal another owner's handoff", async () => {
    const fetchMock = vi.fn(async (request: string | URL | Request) => {
      expect(String(request)).toContain(`owner_id=eq.${OTHER_ID}`);
      return jsonResponse([]);
    });
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadItemHandler(OTHER_ID);
    const { res, capture } = responseCapture();
    await handler(
      { method: "GET", query: { id: HANDOFF_ID } } as unknown as VercelRequest,
      res,
    );
    expect(capture.statusCode).toBe(404);
  });

  it("rejects an invalid lifecycle jump before writing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([row()]));
    vi.stubGlobal("fetch", fetchMock);
    const handler = await loadItemHandler(OWNER_ID);
    const { res, capture } = responseCapture();
    await handler(
      {
        method: "PATCH",
        query: { id: HANDOFF_ID },
        body: {
          state: "completed",
          receipt: { destinationEntityRef: "created-artifacts:destination-1" },
        },
      } as unknown as VercelRequest,
      res,
    );
    expect(capture.statusCode).toBe(409);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
