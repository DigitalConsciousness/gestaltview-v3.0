import { describe, expect, it } from "vitest";

import {
  buildIsolatedCouncilPrompt,
  COUNCIL_FALLBACK_GUARD,
} from "../../shared/embodiment/chat";
import { checkEmbodimentDepth } from "../../shared/embodiment";
import type { IsolatedCouncilJob } from "../../shared/embodiment/types";
import { buildAssemblyInput, runCouncil } from "../council/councilRunner";

function makeJob(slug: string, shouldFire = true): IsolatedCouncilJob {
  return {
    slug,
    systemPrompt: `system:${slug}`,
    userPrompt: "What should happen next?",
    depthStatus: shouldFire ? "full" : "stub",
    shouldFire,
    fallbackGuard: COUNCIL_FALLBACK_GUARD,
  };
}

describe("council bulkhead runner", () => {
  it("builds isolated council prompts with the council contract and fallback guard", () => {
    const job = buildIsolatedCouncilPrompt("billy", "Hold this prompt", {
      extraContext: ["Corpus context only."],
    });

    expect(job.fallbackGuard).toBe(COUNCIL_FALLBACK_GUARD);
    expect(job.systemPrompt).toContain(
      "Keep this voice separate from every other profile in the room.",
    );
    expect(job.systemPrompt).toContain(
      "Do not synthesize for the entire council unless explicitly asked to do so.",
    );
    expect(job.systemPrompt).toContain("- Conversation mode: council");
    expect(job.systemPrompt).toContain("Corpus context only.");
  });

  it("recognizes heartbeat-backed generated profiles as dispatch-ready", () => {
    expect(checkEmbodimentDepth("the-weaver")).toMatchObject({
      slug: "the-weaver",
      depth: "full",
    });
  });

  it("dispatches firing jobs in parallel and routes fallback responses to flagged", async () => {
    const started: string[] = [];
    let releaseFirst: () => void = () => {};

    const resultPromise = runCouncil(
      "What should happen next?",
      ["baked-lane", "fallback-lane", "skipped-lane"],
      [],
      {
        buildJob: (slug) => makeJob(slug, slug !== "skipped-lane"),
        callLlm: async (job) => {
          started.push(job.slug);

          if (job.slug === "baked-lane") {
            await new Promise<void>((resolve) => {
              releaseFirst = resolve;
            });
            return "Distinct baked response.";
          }

          return `${COUNCIL_FALLBACK_GUARD} this carefully: "echo"`;
        },
      },
    );

    await Promise.resolve();
    expect(started).toEqual(["baked-lane", "fallback-lane"]);
    releaseFirst();

    const result = await resultPromise;

    expect(result.baked).toHaveLength(1);
    expect(result.baked[0]).toMatchObject({
      slug: "baked-lane",
      fallbackTripped: false,
    });
    expect(result.flagged).toHaveLength(1);
    expect(result.flagged[0]).toMatchObject({
      slug: "fallback-lane",
      fallbackTripped: true,
    });
    expect(result.skipped).toEqual([
      {
        slug: "skipped-lane",
        response: "did-not-activate",
        fallbackTripped: false,
        depthStatus: "stub",
      },
    ]);
    expect(result.assemblyReady).toBe(true);
  });

  it("builds assembly input from baked responses only", async () => {
    const result = await runCouncil(
      "Synthesize",
      ["fallback-lane", "baked-lane"],
      [],
      {
        buildJob: (slug) => makeJob(slug),
        callLlm: async (job) =>
          job.slug === "fallback-lane"
            ? `${COUNCIL_FALLBACK_GUARD} this carefully`
            : "Ready for assembly.",
      },
    );

    expect(buildAssemblyInput(result, "Synthesize", "the-architect")).toEqual({
      baked: [
        {
          slug: "baked-lane",
          response: "Ready for assembly.",
          fallbackTripped: false,
          depthStatus: "full",
        },
      ],
      userPrompt: "Synthesize",
      synthesizerSlug: "the-architect",
    });
  });
});
