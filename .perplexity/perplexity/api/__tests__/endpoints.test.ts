import { describe, expect, it } from "vitest";
import actionsHandler from "../actions/[...path]";
import billyHandler from "../billy";

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

describe("API response envelope", () => {
  it("handles chat", async () => {
    const req = { method: "POST", query: { path: ["chat"] }, headers: {}, body: { message: "hello" } };
    const res = createRes();
    await actionsHandler(req as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ response: expect.any(String), provider: expect.any(String), timestamp: expect.any(String) });
  });

  it("handles bucket drops", async () => {
    const req = { method: "POST", query: { path: ["bucket-drops"] }, headers: {}, body: { content: "lightning bolt" } };
    const res = createRes();
    await actionsHandler(req as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ response: expect.any(String), provider: "bucket-drop-capture", timestamp: expect.any(String) });
  });

  it("handles musical dna", async () => {
    const req = {
      method: "POST",
      query: { path: ["musical-dna", "analyze"] },
      headers: {},
      body: { songTitle: "Space Oddity", artist: "David Bowie" },
    };
    const res = createRes();
    await actionsHandler(req as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ response: expect.any(String), provider: "musical-dna", timestamp: expect.any(String) });
  });

  it("handles tribunal", async () => {
    const req = { method: "POST", query: { path: ["tribunal", "run"] }, headers: {}, body: { question: "What is truth?" } };
    const res = createRes();
    await actionsHandler(req as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ response: expect.any(String), provider: expect.any(String), timestamp: expect.any(String) });
  });

  it("handles billy chat", async () => {
    const req = { method: "POST", query: {}, headers: {}, body: { message: "Hey Billy" } };
    const res = createRes();
    await billyHandler(req as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ response: expect.any(String), provider: expect.any(String), timestamp: expect.any(String) });
  });
});
