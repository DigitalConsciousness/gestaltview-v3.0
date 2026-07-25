import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildTrainerStudyPack,
  listTrainerStudySources,
  recommendTrainerStudySources,
} from "../../server/agent-trainer/study-sources.js";

const SUPABASE_ENV_KEYS = [
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
] as const;

describe("trainer study sources", () => {
  const originalEnv = new Map<string, string | undefined>();

  beforeEach(() => {
    for (const key of SUPABASE_ENV_KEYS) {
      originalEnv.set(key, process.env[key]);
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of SUPABASE_ENV_KEYS) {
      const value = originalEnv.get(key);
      if (typeof value === "string") {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    }
    originalEnv.clear();
  });

  it("lists local subagent study sources without trainer supabase config", async () => {
    const studySources = await listTrainerStudySources(3);

    expect(
      studySources.some(
        (source) =>
          source.sourceFile === "agents/categories/09-meta-orchestration/multi-agent-coordinator.md"
      )
    ).toBe(true);
    expect(
      studySources.some(
        (source) =>
          source.sourceFile === "agents/references/bundles/function-calling-patterns"
      )
    ).toBe(true);
  });

  it("auto-recommends relevant local subagents when no explicit study sources are selected", async () => {
    const studyPack = await buildTrainerStudyPack({
      brief: {
        slug: "multi-agent-coordinator",
        title: "Multi Agent Coordinator",
        domain: "meta-orchestration",
        goal: "Coordinate multiple agents and synthesize their output into one execution plan.",
        studySourceFiles: [],
        studyFocus: "Favor distributed execution, reliable synchronization, and result synthesis.",
      },
    });

    expect(studyPack.sourceFiles).toContain(
      "agents/categories/09-meta-orchestration/multi-agent-coordinator.md"
    );
    expect(
      studyPack.sources.some(
        (source) =>
          source.reference ===
          "agents/categories/09-meta-orchestration/multi-agent-coordinator.md"
      )
    ).toBe(true);
  });

  it("auto-recommends local reference bundles for tool and function ability briefs", async () => {
    const studyPack = await buildTrainerStudyPack({
      brief: {
        slug: "tool-calling-agent",
        title: "Tool Calling Agent",
        domain: "developer-experience",
        goal: "Create an agent with explicit tool schemas, function calling, MCP handoffs, and safe result handling.",
        studySourceFiles: [],
        studyFocus: "Favor tool contracts, JSON parameters, parallel function calling, and capability boundaries.",
      },
    });

    expect(studyPack.sourceFiles).toContain(
      "agents/references/bundles/function-calling-patterns"
    );
    expect(
      studyPack.sources.some(
        (source) => source.reference === "agents/references/bundles/function-calling-patterns"
      )
    ).toBe(true);
  });

  it("uses local subagent family signals to prioritize reference bundles", async () => {
    const studyPack = await buildTrainerStudyPack({
      brief: {
        slug: "context-manager",
        title: "Context Manager",
        domain: "meta-orchestration",
        goal: "Keep long-running work coherent without losing important state across handoffs.",
        studySourceFiles: [],
        studyFocus: "Favor precise continuity and disciplined context curation.",
      },
    });

    expect(studyPack.sourceFiles).toContain(
      "agents/categories/09-meta-orchestration/context-manager.md"
    );
    expect(studyPack.sourceFiles).toContain(
      "agents/references/bundles/retrieval-and-memory-tool-patterns"
    );
  });

  it("returns recommendation receipts with preselected local sources for matching briefs", async () => {
    const response = await recommendTrainerStudySources({
      brief: {
        slug: "multi-agent-coordinator",
        title: "Multi Agent Coordinator",
        domain: "meta-orchestration",
        goal: "Coordinate multiple agents and synthesize their output into one execution plan.",
        targetBehaviors: ["parallel routing", "result synthesis"],
        antiGoals: ["single-threaded bottlenecks"],
        studySourceFiles: [],
        studyFocus: "Favor distributed execution, reliable synchronization, and result synthesis.",
        embodimentProfileSlug: "the-weaver",
      },
      limit: 4,
    });

    expect(response.retrievalQuery).toContain("Multi Agent Coordinator");
    expect(response.recommendations.length).toBeGreaterThan(0);
    expect(response.sourceFiles).toContain(
      "agents/categories/09-meta-orchestration/multi-agent-coordinator.md"
    );
  });
});
