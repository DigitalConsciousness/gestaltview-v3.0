import { describe, expect, it } from "vitest";

import { decideIdentityWrite } from "../../shared/identityPolicy.js";

describe("decideIdentityWrite", () => {
  it("allows memory and internal-dialogue writes without approval", () => {
    expect(decideIdentityWrite({ subject: "billy", kind: "memory" })).toEqual({
      action: "allow",
      tableTargets: ["agent_memory_records", "agent_memories", "memory_entries"],
    });
  });

  it("requires approval for profile and identity writes", () => {
    expect(decideIdentityWrite({ subject: "user", kind: "identity_anchor" })).toMatchObject({
      action: "requires_approval",
    });
  });

  it("keeps derived portrait tables out of the approval lane", () => {
    const decision = decideIdentityWrite({ subject: "embodiment_profile", kind: "profile_text" });

    expect(decision).toMatchObject({
      action: "requires_approval",
    });
    expect(decision.tableTargets).not.toContain("profile_portraits");
    expect(decision.tableTargets).not.toContain("portrait_dimensions");
  });
});
