import { describe, expect, it } from "vitest";

import {
  listLocalAgentCatalog,
  loadLocalAgentMarkdown,
} from "../../server/agent-trainer/catalog.js";

describe("local trainer agent catalog", () => {
  it("includes categorized subagents alongside root agent specs", async () => {
    const agents = await listLocalAgentCatalog();

    expect(agents.some((agent) => agent.slug === "skills-keeper")).toBe(true);
    expect(agents.some((agent) => agent.slug === "multi-agent-coordinator")).toBe(true);
  });

  it("can load categorized subagent markdown by slug", async () => {
    const markdown = await loadLocalAgentMarkdown("multi-agent-coordinator");

    expect(markdown).toContain("name: multi-agent-coordinator");
    expect(markdown).toContain("You are a senior multi-agent coordinator");
  });
});
