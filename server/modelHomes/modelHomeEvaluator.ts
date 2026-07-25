import type { ModelHome } from "../../shared/model-homes/types.js";

export function evaluateModelHomeReadiness(home: ModelHome): {
  ready: boolean;
  findings: string[];
} {
  const findings: string[] = [];
  if (home.consentRequired && home.privacyTier === "local_only") {
    findings.push("local_only homes should not require external consent.");
  }
  if (home.governance.allowedForEmbodimentMutation) {
    findings.push("model homes may propose embodiment mutations but must not write them directly.");
  }
  return { ready: findings.length === 0, findings };
}
