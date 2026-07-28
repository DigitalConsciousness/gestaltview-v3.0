import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { beforeEach, afterEach, describe, expect, it } from "vitest";

import gateHandler from "../gate/[...path]";
import gateCheckoutHandler from "../gate/checkout";
import gateDraftByIdHandler from "../gate/draft";
import gateDraftsHandler from "../gate/drafts";
import gateOrderByIdHandler from "../gate/order";
import gateOrderRedeemHandler from "../gate/order-redeem";
import { createAdminSessionToken } from "../_lib/auth";
import { DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG } from "../../shared/gate/schemas";

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  rawBody: string | Buffer | null;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string | Buffer) => void;
};

function createRes(): MockRes {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    rawBody: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      return this;
    },
    end(value?: string | Buffer) {
      this.rawBody = value ?? null;
      if (typeof value === "string") {
        try {
          this.body = JSON.parse(value);
        } catch {
          this.body = value;
        }
        return;
      }

      this.body = value ?? null;
    },
  };
}

function createReq(input: {
  method: string;
  path: string[];
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
}) {
  return {
    method: input.method,
    query: {
      path: input.path,
      ...(input.query ?? {}),
    },
    headers: input.headers ?? {},
    body: input.body,
  };
}

function tokenFromDownloadUrl(url: string): string {
  return new URL(url, "http://localhost").searchParams.get("token") || "";
}

const originalGateEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  GATE_STORAGE_BUCKET: process.env.GATE_STORAGE_BUCKET,
  GATE_SIGNED_URL_TTL_SECONDS: process.env.GATE_SIGNED_URL_TTL_SECONDS,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  SESSION_SECRET: process.env.SESSION_SECRET,
};

function restoreEnvValue(
  key: keyof typeof originalGateEnv,
  value: string | undefined
) {
  if (typeof value === "string") {
    process.env[key] = value;
    return;
  }

  delete process.env[key];
}

let gateDataDir = "";

beforeEach(async () => {
  gateDataDir = path.join(os.tmpdir(), `gv-gate-test-${randomUUID()}`);
  process.env.GATE_DATA_DIR = gateDataDir;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_GATE_WEBHOOK_SECRET;
  delete process.env.GATE_ADMIN_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.VITE_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SERVICE_KEY;
  delete process.env.GATE_STORAGE_BUCKET;
  delete process.env.GATE_SIGNED_URL_TTL_SECONDS;
  process.env.NODE_ENV = "test";
  delete process.env.VERCEL_ENV;
  delete process.env.SESSION_SECRET;
  await fs.rm(gateDataDir, { recursive: true, force: true });
});

afterEach(async () => {
  await fs.rm(gateDataDir, { recursive: true, force: true });
  delete process.env.GATE_DATA_DIR;
  restoreEnvValue("SUPABASE_URL", originalGateEnv.SUPABASE_URL);
  restoreEnvValue("VITE_SUPABASE_URL", originalGateEnv.VITE_SUPABASE_URL);
  restoreEnvValue(
    "SUPABASE_SERVICE_ROLE_KEY",
    originalGateEnv.SUPABASE_SERVICE_ROLE_KEY
  );
  restoreEnvValue("SUPABASE_SERVICE_KEY", originalGateEnv.SUPABASE_SERVICE_KEY);
  restoreEnvValue("GATE_STORAGE_BUCKET", originalGateEnv.GATE_STORAGE_BUCKET);
  restoreEnvValue(
    "GATE_SIGNED_URL_TTL_SECONDS",
    originalGateEnv.GATE_SIGNED_URL_TTL_SECONDS
  );
  restoreEnvValue("NODE_ENV", originalGateEnv.NODE_ENV);
  restoreEnvValue("VERCEL_ENV", originalGateEnv.VERCEL_ENV);
  restoreEnvValue("SESSION_SECRET", originalGateEnv.SESSION_SECRET);
});

describe("GATE API", () => {
  it("creates a supported draft and returns analysis", async () => {
    const req = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Acme Labs",
        useCaseSlug: "developer-tools-assistant",
        deliverySurfaces: ["web", "cli"],
      },
    });
    const res = createRes();

    await gateHandler(req as never, res as never);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      analysis: {
        draft: {
          id: expect.any(String),
          companyName: "Acme Labs",
        },
        sidekick: {
          session: {
            embodimentProfileSlug: DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
          },
          turns: [
            {
              actor: "sidekick",
            },
          ],
        },
        compatibility: {
          checkoutMode: "pay_now",
        },
        quote: {
          totalCents: expect.any(Number),
        },
      },
    });
  });

  it("captures buyer context through the GATE sidekick and applies a suggested action", async () => {
    const createReqBody = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Clinic Operator",
        useCaseSlug: "developer-tools-assistant",
        deliverySurfaces: ["web", "windows"],
      },
    });
    const createResBody = createRes();
    await gateHandler(createReqBody as never, createResBody as never);

    const createAnalysis = (createResBody.body as { analysis: { draft: { id: string } } }).analysis;
    const draftId = createAnalysis.draft.id;

    const sidekickReq = createReq({
      method: "POST",
      path: ["drafts", draftId, "sidekick"],
      body: {
        message:
          "We're a healthcare operations team for clinic admins. Need an audit-friendly Windows rollout.",
      },
    });
    const sidekickRes = createRes();
    await gateHandler(sidekickReq as never, sidekickRes as never);

    expect(sidekickRes.statusCode).toBe(200);
    expect(sidekickRes.body).toMatchObject({
      analysis: {
        draft: {
          id: draftId,
          buyerContext: {
            industry: "healthcare",
            audience: "clinic admins",
            preferredChannels: expect.arrayContaining(["windows"]),
          },
        },
      },
    });

    const sidekickAnalysis = (sidekickRes.body as { analysis: { sidekick: { actions: Array<{ id: string; targetRef: string }> } } }).analysis;
    const useCaseAction = sidekickAnalysis.sidekick.actions.find(
      (action) => action.targetRef === "useCaseSlug"
    );

    expect(useCaseAction).toBeDefined();

    const applyReq = createReq({
      method: "POST",
      path: ["drafts", draftId, "sidekick", "actions", useCaseAction!.id],
      body: {},
    });
    const applyRes = createRes();
    await gateHandler(applyReq as never, applyRes as never);

    expect(applyRes.statusCode).toBe(200);
    expect(applyRes.body).toMatchObject({
      analysis: {
        draft: {
          id: draftId,
          useCaseSlug: "healthcare-compliance-assistant",
        },
      },
    });
  });

  it("simulates checkout, issues an access key, and returns a downloadable ZIP after redemption", async () => {
    const createReqBody = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Builder Corp",
        buyerEmail: "ops@builder.test",
        useCaseSlug: "developer-tools-assistant",
        tier: "STUDIO",
        backend: "supabase",
        deliverySurfaces: ["web", "cli", "windows"],
      },
    });
    const createResBody = createRes();
    await gateHandler(createReqBody as never, createResBody as never);

    const draftId = (createResBody.body as { analysis: { draft: { id: string } } }).analysis.draft.id;

    const checkoutReq = createReq({
      method: "POST",
      path: ["checkout"],
      body: {
        draftId,
        buyerEmail: "ops@builder.test",
        companyName: "Builder Corp",
        mockPayment: true,
      },
    });
    const checkoutRes = createRes();
    await gateHandler(checkoutReq as never, checkoutRes as never);

    expect(checkoutRes.statusCode).toBe(202);
    expect(checkoutRes.body).toMatchObject({
      mode: "simulated",
      orderId: expect.any(String),
      redirectUrl: expect.stringContaining("/agent-trainer/orders/"),
    });

    const { orderId, accessToken } = checkoutRes.body as {
      orderId: string;
      accessToken: string;
    };

    const unauthorizedReq = createReq({
      method: "GET",
      path: ["orders", orderId],
    });
    const unauthorizedRes = createRes();
    await gateHandler(unauthorizedReq as never, unauthorizedRes as never);
    expect(unauthorizedRes.statusCode).toBe(401);

    const orderReq = createReq({
      method: "GET",
      path: ["orders", orderId],
      query: { access: accessToken },
    });
    const orderRes = createRes();
    await gateHandler(orderReq as never, orderRes as never);

    expect(orderRes.statusCode).toBe(200);
    expect(orderRes.body).toMatchObject({
      order: {
        order: {
          id: orderId,
          orderStatus: "delivered",
          paymentStatus: "paid",
        },
        artifacts: [
          {
            accessKey: expect.any(String),
            downloadUrl: null,
          },
        ],
        buildJobs: [
          {
            status: "delivered",
          },
        ],
      },
    });

    const accessKey =
      (
        orderRes.body as {
          order: {
            artifacts: Array<{ accessKey: string }>;
          };
        }
      ).order.artifacts[0]!.accessKey;

    const redeemReq = createReq({
      method: "POST",
      path: ["orders", orderId, "redeem"],
      body: {
        key: accessKey,
      },
    });
    const redeemRes = createRes();
    await gateHandler(redeemReq as never, redeemRes as never);

    expect(redeemRes.statusCode).toBe(200);
    expect(redeemRes.body).toMatchObject({
      artifactId: expect.any(String),
      downloadUrl: expect.stringContaining(`/api/gate/orders/${orderId}/download?token=`),
    });

    const downloadUrl = (redeemRes.body as { downloadUrl: string }).downloadUrl;

    const downloadReq = createReq({
      method: "GET",
      path: ["orders", orderId, "download"],
      query: {
        token: tokenFromDownloadUrl(downloadUrl),
      },
    });
    const downloadRes = createRes();
    await gateHandler(downloadReq as never, downloadRes as never);

    expect(downloadRes.statusCode).toBe(200);
    expect(downloadRes.headers["Content-Type"]).toBe("application/zip");
    expect(Buffer.isBuffer(downloadRes.body)).toBe(true);
    expect((downloadRes.body as Buffer).byteLength).toBeGreaterThan(0);
  });

  it("fails closed for mock checkout in production when GATE_ADMIN_KEY is missing", async () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "production";
    delete process.env.GATE_ADMIN_KEY;

    const createReqBody = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Production Gate",
        buyerEmail: "ops@production-gate.test",
        useCaseSlug: "developer-tools-assistant",
        tier: "STUDIO",
        backend: "supabase",
        deliverySurfaces: ["web", "cli"],
      },
    });
    const createResBody = createRes();
    await gateHandler(createReqBody as never, createResBody as never);
    const draftId = (createResBody.body as { analysis: { draft: { id: string } } }).analysis.draft.id;

    const checkoutReq = createReq({
      method: "POST",
      path: ["checkout"],
      body: {
        draftId,
        buyerEmail: "ops@production-gate.test",
        mockPayment: true,
      },
    });
    const checkoutRes = createRes();

    await gateHandler(checkoutReq as never, checkoutRes as never);

    expect(checkoutRes.statusCode).toBe(503);
    expect(checkoutRes.body).toMatchObject({
      error: "gate_payment_not_configured",
    });
  });

  it("writes sidekick provenance into the package manifest", async () => {
    const createReqBody = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Signal Studio",
        buyerEmail: "ops@signal-studio.test",
        useCaseSlug: "white-label-client-studio",
        tier: "GROWTH",
        backend: "supabase",
        deliverySurfaces: ["web", "windows", "cli"],
        buyerContext: {
          industry: "agency",
          audience: "client delivery leads",
          preferredChannels: ["web", "windows"],
          requestedOutcomes: [
            "Launch a white-label operator package",
            "Preserve a traceable asset ledger",
          ],
          brandingInputs: "High-contrast client-facing shell with a calmer handoff tone.",
        },
      },
    });
    const createResBody = createRes();
    await gateHandler(createReqBody as never, createResBody as never);

    const draftId = (createResBody.body as { analysis: { draft: { id: string } } }).analysis
      .draft.id;

    const checkoutReq = createReq({
      method: "POST",
      path: ["checkout"],
      body: {
        draftId,
        buyerEmail: "ops@signal-studio.test",
        companyName: "Signal Studio",
        mockPayment: true,
      },
    });
    const checkoutRes = createRes();
    await gateHandler(checkoutReq as never, checkoutRes as never);

    const { orderId, accessToken } = checkoutRes.body as {
      orderId: string;
      accessToken: string;
    };
    const orderReq = createReq({
      method: "GET",
      path: ["orders", orderId],
      query: { access: accessToken },
    });
    const orderRes = createRes();
    await gateHandler(orderReq as never, orderRes as never);

    const buildJobId =
      (
        orderRes.body as {
          order: {
            buildJobs: Array<{ id: string }>;
          };
        }
      ).order.buildJobs[0]!.id;
    const manifestPath = path.join(
      gateDataDir,
      "builds",
      buildJobId,
      "staging",
      "package.manifest.json"
    );
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as {
      buyerProfile: { industry: string | null; embodimentProfileSlug: string };
      selectedAssets: Array<{ sourcePath: string }>;
      transformations: Array<{ type: string }>;
      sidekick: { embodimentProfileSlug: string } | null;
    };

    expect(manifest.buyerProfile).toMatchObject({
      industry: "agency",
      embodimentProfileSlug: DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
    });
    expect(manifest.selectedAssets.length).toBeGreaterThan(0);
    expect(
      manifest.selectedAssets.some((asset) => asset.sourcePath.includes("templates/gate/"))
    ).toBe(true);
    expect(manifest.transformations.length).toBeGreaterThan(0);
    expect(manifest.sidekick).toMatchObject({
      embodimentProfileSlug: DEFAULT_GATE_EMBODIMENT_PROFILE_SLUG,
    });
  });

  it("reuses the saved buyer email during checkout without re-entering it", async () => {
    const createDraftReq = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Saved Identity Co",
        buyerEmail: "ops@saved-identity.test",
        useCaseSlug: "developer-tools-assistant",
        tier: "STUDIO",
        backend: "supabase",
        deliverySurfaces: ["web", "cli"],
      },
    });
    const createDraftRes = createRes();
    await gateHandler(createDraftReq as never, createDraftRes as never);

    const draftId = (createDraftRes.body as { analysis: { draft: { id: string } } }).analysis
      .draft.id;

    const checkoutReq = createReq({
      method: "POST",
      path: ["checkout"],
      body: {
        draftId,
        mockPayment: true,
      },
    });
    const checkoutRes = createRes();
    await gateHandler(checkoutReq as never, checkoutRes as never);

    expect(checkoutRes.statusCode).toBe(202);
    expect(checkoutRes.body).toMatchObject({
      mode: "simulated",
      orderId: expect.any(String),
    });
  });

  it("uses identity saved during a later draft update when checkout omits buyer fields", async () => {
    const createDraftReq = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Draft Identity Co",
        useCaseSlug: "developer-tools-assistant",
        tier: "STUDIO",
        backend: "supabase",
        deliverySurfaces: ["web", "cli"],
      },
    });
    const createDraftRes = createRes();
    await gateHandler(createDraftReq as never, createDraftRes as never);

    const draftId = (createDraftRes.body as { analysis: { draft: { id: string } } }).analysis
      .draft.id;

    const patchDraftReq = createReq({
      method: "PATCH",
      path: ["drafts", draftId],
      body: {
        buyerEmail: "ops@draft-identity.test",
        companyName: "Draft Identity Company",
      },
    });
    const patchDraftRes = createRes();
    await gateHandler(patchDraftReq as never, patchDraftRes as never);

    expect(patchDraftRes.statusCode).toBe(200);
    expect(patchDraftRes.body).toMatchObject({
      analysis: {
        draft: {
          id: draftId,
          buyerEmail: "ops@draft-identity.test",
          companyName: "Draft Identity Company",
        },
      },
    });

    const checkoutReq = createReq({
      method: "POST",
      path: ["checkout"],
      body: {
        draftId,
        mockPayment: true,
      },
    });
    const checkoutRes = createRes();
    await gateHandler(checkoutReq as never, checkoutRes as never);

    expect(checkoutRes.statusCode).toBe(202);
    expect(checkoutRes.body).toMatchObject({
      mode: "simulated",
      orderId: expect.any(String),
    });

    const { orderId, accessToken } = checkoutRes.body as {
      orderId: string;
      accessToken: string;
    };
    const orderReq = createReq({
      method: "GET",
      path: ["orders", orderId],
      query: { access: accessToken },
    });
    const orderRes = createRes();
    await gateHandler(orderReq as never, orderRes as never);

    expect(orderRes.statusCode).toBe(200);
    expect(orderRes.body).toMatchObject({
      order: {
        draft: {
          buyerEmail: "ops@draft-identity.test",
          companyName: "Draft Identity Company",
        },
        order: {
          id: orderId,
          orderStatus: "delivered",
        },
      },
    });
  });

  it("routes unsupported combinations into manual review", async () => {
    const draftReq = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Policy Clinic",
        useCaseSlug: "knowledge-ops-copilot",
        backend: "redis",
        deliverySurfaces: ["web"],
      },
    });
    const draftRes = createRes();
    await gateHandler(draftReq as never, draftRes as never);

    const draftId = (draftRes.body as { analysis: { draft: { id: string } } }).analysis.draft.id;

    const checkoutReq = createReq({
      method: "POST",
      path: ["checkout"],
      body: {
        draftId,
        buyerEmail: "team@policy.test",
        companyName: "Policy Clinic",
        mockPayment: true,
      },
    });
    const checkoutRes = createRes();
    await gateHandler(checkoutReq as never, checkoutRes as never);

    expect(checkoutRes.statusCode).toBe(202);
    expect(checkoutRes.body).toMatchObject({
      mode: "manual_review",
      orderId: expect.any(String),
    });

    const { orderId, accessToken } = checkoutRes.body as {
      orderId: string;
      accessToken: string;
    };
    const orderReq = createReq({
      method: "GET",
      path: ["orders", orderId],
      query: { access: accessToken },
    });
    const orderRes = createRes();
    await gateHandler(orderReq as never, orderRes as never);

    expect(orderRes.statusCode).toBe(200);
    expect(orderRes.body).toMatchObject({
      order: {
        order: {
          orderStatus: "review_requested",
          paymentStatus: "review_requested",
        },
        supportRequests: [
          {
            summary: "Package requires review before payment.",
          },
        ],
      },
    });
  });

  it("allows draft saves with an invalid in-progress buyer email", async () => {
    const createDraftReq = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Typing Test Co",
        useCaseSlug: "developer-tools-assistant",
      },
    });
    const createDraftRes = createRes();
    await gateHandler(createDraftReq as never, createDraftRes as never);

    const draftId = (createDraftRes.body as { analysis: { draft: { id: string } } }).analysis
      .draft.id;

    const patchReq = createReq({
      method: "PATCH",
      path: ["drafts", draftId],
      body: {
        buyerEmail: "khttps://gestaltviewai.gumroad.com/l/gestaltview_agent",
      },
    });
    const patchRes = createRes();
    await gateHandler(patchReq as never, patchRes as never);

    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body).toMatchObject({
      analysis: {
        draft: {
          id: draftId,
          buyerEmail: "khttps://gestaltviewai.gumroad.com/l/gestaltview_agent",
        },
      },
    });
  });

  it("routes relationship-first requisitions to founder review before payment", async () => {
    const draftReq = createReq({
      method: "POST",
      path: ["drafts"],
      body: {
        companyName: "Relationship First Studio",
        buyerEmail: "hello@relationship-first.test",
        useCaseSlug: "developer-tools-assistant",
        tier: "STUDIO",
        backend: "supabase",
        deliverySurfaces: ["web", "cli"],
        themePresetId: "cyberpunk-neon",
      },
    });
    const draftRes = createRes();
    await gateHandler(draftReq as never, draftRes as never);
    const draftId = (draftRes.body as { analysis: { draft: { id: string } } }).analysis
      .draft.id;

    const checkoutReq = createReq({
      method: "POST",
      path: ["checkout"],
      body: {
        draftId,
        requestFounderReview: true,
        mockPayment: true,
      },
    });
    const checkoutRes = createRes();
    await gateHandler(checkoutReq as never, checkoutRes as never);

    expect(checkoutRes.statusCode).toBe(202);
    expect(checkoutRes.body).toMatchObject({
      mode: "manual_review",
      orderId: expect.any(String),
      accessToken: expect.any(String),
      redirectUrl: expect.stringContaining("#access="),
    });

    const { orderId, accessToken } = checkoutRes.body as {
      orderId: string;
      accessToken: string;
    };
    const orderReq = createReq({
      method: "GET",
      path: ["orders", orderId],
      query: { access: accessToken },
    });
    const orderRes = createRes();
    await gateHandler(orderReq as never, orderRes as never);

    expect(orderRes.statusCode).toBe(200);
    expect(orderRes.body).toMatchObject({
      order: {
        order: {
          orderStatus: "review_requested",
          paymentStatus: "review_requested",
        },
        compatibility: {
          checkoutMode: "request_review",
          requiresManualReview: true,
        },
      },
    });

    process.env.SESSION_SECRET = "gate-founder-quote-test-secret";
    const founderSession = createAdminSessionToken(
      "keithsoyka@gmail.com",
      "keith"
    );
    const quoteReq = createReq({
      method: "POST",
      path: ["orders", orderId, "quote"],
      headers: {
        cookie: `gv_admin_session=${founderSession}`,
      },
      body: {
        totalCents: 275000,
        scopeSummary:
          "A governed collaborator with web and CLI surfaces, explicit memory boundaries, and tracked acceptance.",
        paymentTerms: "Full payment before the governed build begins.",
      },
    });
    const quoteRes = createRes();
    await gateHandler(quoteReq as never, quoteRes as never);

    expect(quoteRes.statusCode).toBe(200);
    expect(quoteRes.body).toMatchObject({
      order: {
        id: orderId,
        totalCents: 275000,
        orderStatus: "awaiting_payment",
        paymentStatus: "awaiting_payment",
      },
    });

    const approvedOrderReq = createReq({
      method: "GET",
      path: ["orders", orderId],
      headers: {
        "x-gate-order-token": accessToken,
      },
    });
    const approvedOrderRes = createRes();
    await gateHandler(approvedOrderReq as never, approvedOrderRes as never);

    expect(approvedOrderRes.statusCode).toBe(200);
    expect(approvedOrderRes.body).toMatchObject({
      order: {
        order: {
          totalCents: 275000,
          orderStatus: "awaiting_payment",
        },
        supportRequests: expect.arrayContaining([
          expect.objectContaining({
            summary: "Firm scope and quote approved.",
          }),
        ]),
      },
    });

    const paymentReq = createReq({
      method: "POST",
      path: ["orders", orderId, "pay"],
      body: { accessToken },
    });
    const paymentRes = createRes();
    await gateHandler(paymentReq as never, paymentRes as never);

    expect(paymentRes.statusCode).toBe(503);
    expect(paymentRes.body).toMatchObject({
      error: "gate_payment_not_configured",
    });
  });

  it("supports the explicit Vercel route files used for deployed GATE requests", async () => {
    const createReqBody = createReq({
      method: "POST",
      path: [],
      body: {
        companyName: "Explicit Route Co",
        buyerEmail: "ops@explicit-route.test",
        useCaseSlug: "developer-tools-assistant",
        tier: "STUDIO",
        backend: "supabase",
        deliverySurfaces: ["web", "cli", "windows"],
      },
    });
    const createResBody = createRes();
    await gateDraftsHandler(createReqBody as never, createResBody as never);

    expect(createResBody.statusCode).toBe(201);
    const draftId = (createResBody.body as { analysis: { draft: { id: string } } }).analysis
      .draft.id;

    const patchReq = createReq({
      method: "PATCH",
      path: [],
      query: {
        id: draftId,
      },
      body: {
        companyName: "Explicit Route Company",
      },
    });
    const patchRes = createRes();
    await gateDraftByIdHandler(patchReq as never, patchRes as never);

    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body).toMatchObject({
      analysis: {
        draft: {
          id: draftId,
          companyName: "Explicit Route Company",
        },
      },
    });

    const checkoutReq = createReq({
      method: "POST",
      path: [],
      body: {
        draftId,
        buyerEmail: "ops@explicit-route.test",
        companyName: "Explicit Route Company",
        mockPayment: true,
      },
    });
    const checkoutRes = createRes();
    await gateCheckoutHandler(checkoutReq as never, checkoutRes as never);

    expect(checkoutRes.statusCode).toBe(202);
    const { orderId, accessToken } = checkoutRes.body as {
      orderId: string;
      accessToken: string;
    };

    const orderReq = createReq({
      method: "GET",
      path: [],
      query: {
        id: orderId,
        access: accessToken,
      },
    });
    const orderRes = createRes();
    await gateOrderByIdHandler(orderReq as never, orderRes as never);

    expect(orderRes.statusCode).toBe(200);
    expect(orderRes.body).toMatchObject({
      order: {
        order: {
          id: orderId,
          orderStatus: "delivered",
        },
      },
    });

    const orderAccessKey =
      (
        orderRes.body as {
          order: {
            artifacts: Array<{ accessKey: string }>;
          };
        }
      ).order.artifacts[0]!.accessKey;

    const redeemReq = createReq({
      method: "POST",
      path: [],
      query: {
        id: orderId,
        access: accessToken,
      },
      body: {
        key: orderAccessKey,
      },
    });
    const redeemRes = createRes();
    await gateOrderRedeemHandler(redeemReq as never, redeemRes as never);

    expect(redeemRes.statusCode).toBe(200);
    expect(redeemRes.body).toMatchObject({
      downloadUrl: expect.stringContaining(`/api/gate/orders/${orderId}/download?token=`),
    });
  });
});
