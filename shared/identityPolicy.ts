export type IdentityWriteSubject = "billy" | "embodiment_profile" | "user";

export type IdentityWriteKind =
  | "memory"
  | "internal_dialogue"
  | "profile_text"
  | "constitution_text"
  | "identity_anchor"
  | "user_identity";

export type IdentityWriteDecision = {
  action: "allow" | "allow_with_audit" | "requires_approval";
  tableTargets: string[];
};

const memoryLaneTargets = ["agent_memory_records", "agent_memories", "memory_entries"];

const approvalLaneTargets = [
  "identity_mutation_proposals",
  "identity_review_events",
  "identity_rollback_events",
  "identity_contradictions",
  "agent_constitutions",
  "agent_autobiographies",
  "embodiment_profiles",
];

const userApprovalLaneTargets = [...approvalLaneTargets, "identity_subjects"];

export function decideIdentityWrite(input: {
  subject: IdentityWriteSubject;
  kind: IdentityWriteKind;
}): IdentityWriteDecision {
  if (input.kind === "memory" || input.kind === "internal_dialogue") {
    return {
      action: "allow",
      tableTargets: [...memoryLaneTargets],
    };
  }

  return {
    action: "requires_approval",
    tableTargets: input.subject === "user" ? [...userApprovalLaneTargets] : [...approvalLaneTargets],
  };
}
