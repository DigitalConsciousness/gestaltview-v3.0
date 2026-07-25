import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../trainer/_helpers.js", () => ({
  handleTrainerOptions: vi.fn(() => false),
  requireTrainerAdmin: vi.fn(async () => ({ id: "u1", email: "keithsoyka@gmail.com", tier: "pro", isAdmin: true })),
}));

vi.mock("../../server/agent-trainer/study-sources.js", () => ({
  recommendTrainerStudySources: vi.fn(async () => ({
    recommendations: [{ sourceFile: "agents/foo.md", relevanceScore: 0.88, rationale: ["match"] }],
    retrievalQuery: "agent trainer",
    sourceFiles: ["agents/foo.md"],
  })),
}));

import handler from "../trainer/study-sources/recommendations";
import { recommendTrainerStudySources } from "../../server/agent-trainer/study-sources.js";


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

function createDraft() {
  return {
    slug: "agent-trainer-prototype",
    title: "Agent Trainer Prototype",
    domain: "operations",
    goal: "Turn specs into reliable execution plans",
    targetBehaviors: ["deterministic output"],
    antiGoals: ["unsupported claims"],
    studyFocus: "Focus on founder operating context",
    studySourceFiles: [],
    scenarioSetIds: [],
    maxCycles: 3,
    qualityThreshold: 4,
    draftingProvider: "auto",
    evaluationProvider: "auto",
    embodimentProfileSlug: "the-weaver",
  };
}

describe("trainer study-source recommendations route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts POST body payloads used by AgentTrainerPage", async () => {
    const req = {
      method: "POST",
      query: {},
      body: createDraft(),
      headers: {},
    };
    const res = createRes();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(recommendTrainerStudySources).toHaveBeenCalledTimes(1);
    expect(recommendTrainerStudySources).toHaveBeenCalledWith(
      expect.objectContaining({
        brief: expect.objectContaining({ slug: "agent-trainer-prototype" }),
        limit: 6,
      })
    );
  });

  it("still supports legacy GET runDraft query payloads", async () => {
    const req = {
      method: "GET",
      query: {
        runDraft: JSON.stringify(createDraft()),
        limit: "4",
      },
      headers: {},
    };
    const res = createRes();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(recommendTrainerStudySources).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 4 })
    );
  });

  it("returns 400 when request does not include a run draft", async () => {
    const req = {
      method: "POST",
      query: {},
      body: {},
      headers: {},
    };
    const res = createRes();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      error: expect.stringContaining("Missing trainer draft payload"),
    });
  });
});
