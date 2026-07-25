import { describe, expect, it } from "vitest";
import consciousnessHandler from "../consciousness/[surface]";

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

describe("consciousness chat API", () => {
  it("returns embodied chat responses for supported surfaces", async () => {
    const req = {
      method: "POST",
      query: { surface: "adhd-power-up" },
      headers: {},
      body: {
        message: "Help me restart this task without spiraling.",
        context: { energyLevel: 3, adhdState: "overwhelmed" },
      },
    };
    const res = createRes();

    await consciousnessHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      content: "Help me restart this task without spiraling.",
      provider: "test-provider",
      metadata: {
        surface: "adhd-power-up",
        embodimentProfileSlug: "billy",
      },
    });
  });

  it("accepts explicit embodiment overrides", async () => {
    const req = {
      method: "POST",
      query: { surface: "recovery-companion" },
      headers: {},
      body: {
        message: "I need a steadier frame for this decision.",
        embodimentProfileSlug: "the-guardian",
      },
    };
    const res = createRes();

    await consciousnessHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      metadata: {
        surface: "recovery-companion",
        embodimentProfileSlug: "the-guardian",
      },
    });
  });

  it("rejects unknown surfaces", async () => {
    const req = {
      method: "POST",
      query: { surface: "unknown-surface" },
      headers: {},
      body: { message: "hello" },
    };
    const res = createRes();

    await consciousnessHandler(req as never, res as never);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: "Unknown embodied chat surface: unknown-surface",
    });
  });
});
