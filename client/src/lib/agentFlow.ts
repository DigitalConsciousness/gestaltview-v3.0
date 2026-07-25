export type AgentFlowStageKey = "capture" | "synthesis" | "create" | "export";

export interface AgentFlowStage {
  key: AgentFlowStageKey;
  label: string;
  summary: string;
  defaultCommand?: string;
}

export const AGENT_FLOW_STAGES: AgentFlowStage[] = [
  {
    key: "capture",
    label: "Capture",
    summary: "Collect raw source material, constraints, intent, and the minimum context needed to act safely.",
    defaultCommand: "npm run cli -- status",
  },
  {
    key: "synthesis",
    label: "Synthesis",
    summary: "Turn the raw material into a scoped plan, with the relevant pack or agent pattern selected.",
    defaultCommand: "npm run cli -- plan <pack-slug>",
  },
  {
    key: "create",
    label: "Create",
    summary: "Generate the concrete agent spec, manifest, or run packet that can actually be reviewed.",
    defaultCommand: "npm run cli -- manifest <pack-slug> <project-name> <owner-email> <bundles>",
  },
  {
    key: "export",
    label: "Export",
    summary: "Package the result for deployment, handoff, or storage in a format the operator can inspect.",
    defaultCommand: "npm run cli -- apply <user-id> <pack-slug> <project-name> <owner-email> <bundles> <output-path>",
  },
];

export function getAgentFlowStageIndex(stage: AgentFlowStageKey): number {
  return AGENT_FLOW_STAGES.findIndex((entry) => entry.key === stage);
}

