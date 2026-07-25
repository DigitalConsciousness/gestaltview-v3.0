import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAuthSessionCookie } from "../_lib/auth";

const runCouncilMock = vi.fn(async () => ({
  baked: [],
  flagged: [],
  skipped: [],
  assemblyReady: false,
}));

vi.mock("../../server/council/councilRunner", () => ({
  runCouncil: runCouncilMock,
}));

function authCookie(tier: "free" | "core" | "pro" | "enterprise" = "core"): string {
  process.env.SESSION_SECRET = "council-run-test-secret";
  return createAuthSessionCookie("council@example.com", `council-${tier}-user`, "user", tier);
}

function postCouncil(body: unknown, cookie?: string): Request {
  return new Request("https://gestaltview.test/api/council/run", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("council run entitlement gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SESSION_SECRET = "council-run-test-secret";
    delete process.env.TRIBUNAL_BETA_ALL_VOICES_ENABLED;
  });

  it("blocks anonymous multi-voice council runs", async () => {
    const module = await import("../council/run");

    const response = await module.default(
      postCouncil({
        userPrompt: "What should happen next?",
        slugs: ["billy", "the-architect"],
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      error: "upgrade_required",
      feature: "advanced_tribunal",
    });
    expect(runCouncilMock).not.toHaveBeenCalled();
  });

  it("blocks free-tier multi-voice council runs", async () => {
    const module = await import("../council/run");

    const response = await module.default(
      postCouncil(
        {
          userPrompt: "What should happen next?",
          slugs: ["billy", "the-architect"],
        },
        authCookie("free"),
      ),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      error: "upgrade_required",
      feature: "advanced_tribunal",
    });
    expect(runCouncilMock).not.toHaveBeenCalled();
  });

  it("allows paid multi-voice council runs", async () => {
    const module = await import("../council/run");

    const response = await module.default(
      postCouncil(
        {
          userPrompt: "What should happen next?",
          slugs: ["billy", "the-architect"],
        },
        authCookie("core"),
      ),
    );

    expect(response.status).toBe(200);
    expect(runCouncilMock).toHaveBeenCalledWith(
      "What should happen next?",
      ["billy", "the-architect"],
      [],
    );
  });
});
