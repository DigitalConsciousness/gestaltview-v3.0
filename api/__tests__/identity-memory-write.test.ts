import { describe, expect, it, vi } from "vitest";

import { recordIdentityMemoryTurn } from "../_lib/identityMemoryWriter";

describe("recordIdentityMemoryTurn", () => {
  it("writes agent memory rows without touching proposal tables", async () => {
    const tables: string[] = [];
    const payloads: Array<Record<string, unknown>> = [];
    const insertRow = vi.fn(async (table: string, payload: Record<string, unknown>) => {
      tables.push(table);
      payloads.push(payload);
      return true;
    });

    const result = await recordIdentityMemoryTurn({
      subject: "billy",
      agentId: "agent-billy",
      userId: "user-1",
      source: "internal-dialogue",
      transcript: [
        {
          role: "user",
          content: "I want the memory pipeline to stay readable and direct.",
        },
        {
          role: "assistant",
          content: "Billy should keep the split clean and on the memory lane.",
        },
      ],
      insertRow,
    });

    expect(result).toEqual({
      agentId: "agent-billy",
      recordCount: 1,
      summaryWritten: true,
    });
    expect(tables).toEqual(["agent_memory_records", "agent_memories"]);
    expect(tables).not.toContain("identity_mutation_proposals");
    expect(payloads[0]).toMatchObject({
      agent_id: "agent-billy",
      memory_kind: "procedural",
      provenance: expect.objectContaining({
        subject: "billy",
        source: "internal-dialogue",
      }),
    });
    expect(payloads[1]).toMatchObject({
      agent_id: "agent-billy",
      memory_type: "internal_dialogue",
      detail_payload: expect.objectContaining({
        subject: "billy",
        source: "internal-dialogue",
      }),
    });
    expect(insertRow).toHaveBeenCalledTimes(2);
  });
});
