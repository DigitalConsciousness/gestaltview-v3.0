import { beforeEach, describe, expect, it, vi } from "vitest";

const routeLlmMock = vi.fn();

vi.mock("../_lib/llmRouter", () => ({
  routeLlm: routeLlmMock,
}));

type MockRes = {
  statusCode: number;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string) => void;
};

function createRes(): MockRes {
  return {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader() {
      return this;
    },
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
  };
}

describe("session recap route", () => {
  beforeEach(() => {
    routeLlmMock.mockReset();
  });

  it("routes the selected recap voice and cleans fenced html", async () => {
    routeLlmMock
      .mockResolvedValueOnce({
        response: "<div>not yet finished</div>",
        provider: "test-provider",
        timestamp: "2026-06-21T00:00:00.000Z",
        free: true,
        tokensUsed: 7,
      })
      .mockResolvedValueOnce({
        response: [
          "```html",
          "<!doctype html>",
          "<html>",
          "<body>",
          "<section><h2>What we built</h2><p>Built the thing.</p></section>",
          "<section><h2>What emerged</h2><p>Signals surfaced.</p></section>",
          "<section><h2>What's still in motion</h2><p>Open loops remain.</p></section>",
          "<section><h2>Worth holding</h2><p>Hold this moment.</p></section>",
          "</body>",
          "</html>",
          "```",
        ].join("\n"),
        provider: "test-provider",
        timestamp: "2026-06-21T00:00:01.000Z",
        free: true,
        tokensUsed: 10,
      });

    const handlerModule = await import("../sessionRecap");
    const res = createRes();

    await handlerModule.default(
      {
        method: "POST",
        body: {
          captures: [
            {
              id: "capture-1",
              title: "Capture One",
              content: "We built the thing.",
            },
          ],
          conversationHistory: [
            {
              role: "user",
              content: "Please recap the session.",
            },
          ],
          sessionLabel: "Blackboard Room",
          di: "curator",
        },
      } as never,
      res as never,
    );

    expect(routeLlmMock).toHaveBeenCalledTimes(2);
    const [, firstContext] = routeLlmMock.mock.calls[0] as [string, { systemPrompt?: string; mode?: string }];
    const [, secondContext] = routeLlmMock.mock.calls[1] as [string, { systemPrompt?: string; mode?: string }];
    expect(firstContext.mode).toBe("session_recap");
    expect(firstContext.systemPrompt).toContain("The Curator");
    expect(secondContext.systemPrompt).toContain("The Curator");
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      di: "curator",
      provider: "test-provider",
    });
    expect((res.body as { html: string }).html).toContain("<section><h2>What we built</h2>");
    expect((res.body as { html: string }).html).not.toContain("```");
  });

  it("falls back to a deterministic recap when the provider never satisfies the HTML gate", async () => {
    routeLlmMock.mockResolvedValue({
      response: "```json\n{\"summary\":\"raw json\"}\n```",
      provider: "test-provider",
      timestamp: "2026-06-21T00:00:00.000Z",
      free: true,
      tokensUsed: 3,
    });

    const handlerModule = await import("../sessionRecap");
    const res = createRes();

    await handlerModule.default(
      {
        method: "POST",
        body: {
          captures: [],
          conversationHistory: [],
          sessionLabel: "Blackboard Room",
          di: "billy",
        },
      } as never,
      res as never,
    );

    expect(routeLlmMock).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      di: "billy",
      provider: "session-recap-fallback",
    });
    expect((res.body as { html: string }).html).toContain("<h2>What we built</h2>");
    expect((res.body as { html: string }).html).toContain("<h2>Worth holding</h2>");
  });
});
