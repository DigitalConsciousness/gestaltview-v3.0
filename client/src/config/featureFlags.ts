export const FEATURE_FLAGS = {
  transcriptory: true,
  embodimentStudio: true,
  agentCouncil: false,
  digitalIntelligenceAcademy: false,
  rapidPrototype: false,
  adaptiveLayout: false,
  brainSparks: false,
  externalScaffold: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
