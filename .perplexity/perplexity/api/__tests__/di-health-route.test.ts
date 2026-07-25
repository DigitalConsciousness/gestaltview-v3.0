import { describe, expect, it } from "vitest";
import diHealthHandler from "../di-health";

type MockRes = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string | Buffer) => void;
};

function createRes(): MockRes {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      return this;
    },
    end(value?: string | Buffer) {
      if (typeof value === "string") {
        this.body = JSON.parse(value);
        return;
      }
      this.body = value ?? null;
    },
  };
}

describe("DI health route", () => {
  it("returns the health report for one slug", async () => {
    const res = createRes();
    await diHealthHandler({ method: "GET", query: { slug: "billy" }, headers: {}, body: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      diSlug: "billy",
      profileLoaded: true,
    });
  });

  it("returns all active DI reports when no slug is supplied", async () => {
    const res = createRes();
    await diHealthHandler({ method: "GET", query: {}, headers: {}, body: {} } as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      profiles: expect.any(Array),
    });
  });
});
