type HotfixEnv = Record<string, string | undefined>;

export type HotfixEnvSummary = {
  coreRuntime: {
    status: "ready" | "blocked";
    missing: string[];
  };
  session: {
    status: "ready" | "action_required";
    message: string;
  };
  billyDiagnose: {
    status: "ready" | "disabled";
    message: string;
  };
  transcriptory: {
    status: "ready" | "degraded";
    message: string;
  };
};

export declare function summarizeHotfixEnv(env?: HotfixEnv): HotfixEnvSummary;
