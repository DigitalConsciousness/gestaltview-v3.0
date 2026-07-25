export type HotfixEnvInput = Record<string, string | undefined>;

export type HotfixEnvCheck = {
  status: "ready" | "blocked" | "action_required" | "disabled" | "degraded";
  message?: string;
  missing?: string[];
};

export type HotfixEnvSummary = {
  coreRuntime: HotfixEnvCheck;
  session: HotfixEnvCheck;
  billyDiagnose: HotfixEnvCheck;
  transcriptory: HotfixEnvCheck;
};

export function summarizeHotfixEnv(env?: HotfixEnvInput): HotfixEnvSummary;
