import { EMBODIMENT_PROFILES } from "./generated.js";
import { checkEmbodimentDepth } from "./index.js";
import type { EmbodimentDepthReport, EmbodimentDepthStatus } from "./types.js";

const DEPTH_SORT_ORDER: Record<EmbodimentDepthStatus, number> = {
  stub: 0,
  thin: 1,
  full: 2,
};

export type EmbodimentAuditReport = EmbodimentDepthReport;

export function auditAllEmbodiments(): EmbodimentAuditReport[] {
  return Object.keys(EMBODIMENT_PROFILES)
    .map((slug) => checkEmbodimentDepth(slug))
    .sort((left, right) => {
      const depthDelta = DEPTH_SORT_ORDER[left.depth] - DEPTH_SORT_ORDER[right.depth];
      return depthDelta || left.slug.localeCompare(right.slug);
    });
}
