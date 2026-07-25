import { describe, expect, it, vi } from "vitest";

vi.mock("../../shared/embodiment/index", () => ({
  getEmbodimentProfile: (slug: string) => ({ slug, publicName: slug }),
}));

vi.mock("../../shared/embodiment/index.js", () => ({
  getEmbodimentProfile: (slug: string) => ({ slug, publicName: slug }),
}));

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

describe("route embodiment API", () => {
  it("returns curator for Dynamic Inner World and no assignment for Blackboard Room", async () => {
    const module = await import("../embodiments/by-route");
    const dynamicRes = createRes();

    await module.default(
      { method: "GET", query: { path: "/dynamic-inner-world" } } as never,
      dynamicRes as never,
    );

    expect(dynamicRes.statusCode).toBe(200);
    expect(dynamicRes.body).toMatchObject({
      response: {
        available: true,
        assignment: { slug: "curator" },
      },
    });

    const blackboardRes = createRes();
    await module.default(
      { method: "GET", query: { path: "/blackboard-room" } } as never,
      blackboardRes as never,
    );

    expect(blackboardRes.body).toMatchObject({
      response: {
        available: false,
        embodimentProfile: null,
      },
    });

    const creationCornerRes = createRes();
    await module.default(
      { method: "GET", query: { path: "/creation-corner" } } as never,
      creationCornerRes as never,
    );

    expect(creationCornerRes.body).toMatchObject({
      response: {
        available: true,
        assignment: { slug: "art-teacher" },
      },
    });
  }, 20_000);
});
