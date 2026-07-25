import { afterEach, beforeEach, describe, expect, it } from "vitest";
import billyHandler from "../billy";
import billyVoiceHandler from "../voice/billy";
import { resolveCorsOrigin } from "../_lib/cors";

const PRIMARY_ORIGIN = "https://gestaltview-digital-intelligence.vercel.app";
const MAIN_PREVIEW_ORIGIN = "https://gestaltview-v2-git-main-gestalt-view-ai-inc.vercel.app";
const DEPLOYMENT_PREVIEW_ORIGIN = "https://gestaltview-v2-lb6cobn5j-gestalt-view-ai-inc.vercel.app";

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string) => void;
  getHeader: (key: string) => string | undefined;
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
    getHeader(key: string) {
      return this.headers[key];
    },
  };
}

describe("CORS preflight", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CORS_ORIGINS: [
        PRIMARY_ORIGIN,
        MAIN_PREVIEW_ORIGIN,
        DEPLOYMENT_PREVIEW_ORIGIN,
      ].join(", "),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("applies the main preview origin and Authorization header on /api/billy", async () => {
    const req = {
      method: "OPTIONS",
      headers: {
        origin: MAIN_PREVIEW_ORIGIN,
        "access-control-request-method": "POST",
        "access-control-request-headers": "authorization,content-type",
      },
      query: {},
      body: {},
    };
    const res = createRes();

    await billyHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe(MAIN_PREVIEW_ORIGIN);
    expect(res.headers["Access-Control-Allow-Headers"]).toContain("Authorization");
    expect(res.headers.Vary).toContain("Origin");
  });

  it("applies the deployment preview origin on /api/voice/billy", async () => {
    const req = {
      method: "OPTIONS",
      headers: {
        origin: DEPLOYMENT_PREVIEW_ORIGIN,
      },
      query: {},
      body: {},
    };
    const res = createRes();

    await billyVoiceHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe(DEPLOYMENT_PREVIEW_ORIGIN);
    expect(res.headers["Access-Control-Allow-Headers"]).toContain("Authorization");
  });

  it("falls back to the primary origin for non-matching preflight on /api/voice/billy", async () => {
    const req = {
      method: "OPTIONS",
      headers: {
        origin: "https://malicious.example",
      },
      query: {},
      body: {},
    };
    const res = createRes();

    await billyVoiceHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe(PRIMARY_ORIGIN);
    expect(res.headers["Access-Control-Allow-Headers"]).toContain("Authorization");
  });

  it("does not fail open to wildcard CORS in production when origins are missing", () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      CORS_ORIGINS: "",
    };

    const req = {
      headers: {
        origin: "https://malicious.example",
      },
    };

    expect(resolveCorsOrigin(req as never)).toBe("https://gestaltview-digital-intelligence.vercel.app");
  });
});
