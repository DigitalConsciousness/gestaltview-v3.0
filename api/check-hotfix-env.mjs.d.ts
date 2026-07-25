type HotfixEnv = Record<string, string | undefined>;

declare module "../../scripts/check-hotfix-env.mjs" {
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

  export function summarizeHotfixEnv(env?: HotfixEnv): HotfixEnvSummary;
}
