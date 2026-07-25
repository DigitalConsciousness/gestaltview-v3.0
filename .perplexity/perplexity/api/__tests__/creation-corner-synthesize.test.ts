import { describe, expect, it } from "vitest";

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

describe("Creation Corner synthesize API", () => {
  it("maps the page payload into a gen-engine artifact result", async () => {
    const module = await import("../creation-corner/synthesize");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: {
          user_id: "user-1",
          text: "A working artifact about source-linked room memory.",
          artifact_type: "blueprint_md",
          synthesis_style: "preserve_voice",
          destination: "dynamic_inner_world",
          custom_title: "Room Memory Draft",
          consent: {
            allow_data_persistence: true,
          },
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      title: "Room Memory Draft",
      artifact_type: "blueprint_md",
      generation_mode: "gen-engine",
      fallback_used: false,
      review_required: true,
    });
    expect((res.body as { content: string }).content).toContain("Room Memory Draft");
    expect((res.body as { plk_resonance_score: number }).plk_resonance_score).toBeGreaterThan(0);
    expect((res.body as { plk_resonance_score: number }).plk_resonance_score).toBeLessThanOrEqual(1);
  }, 20_000);

  it("returns a clear error when there is no source material", async () => {
    const module = await import("../creation-corner/synthesize");
    const res = createRes();

    await module.default(
      {
        method: "POST",
        headers: {},
        body: { text: "   " },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      detail: "Add source text or select a blueprint before synthesizing.",
    });
  }, 20_000);
});
