import type { ApiResult } from "./_lib/contracts";
import type { KitTierName } from "../config/tiers";
import { getEntitlementProfile } from "../config/entitlements";
import {
  scoreWorkspaceReadiness,
  type ActivationMilestone,
  type LaneReadinessInput,
  type WorkspaceReadinessReport
} from "../config/readiness";
import {
  getThemePreset,
  resolveThemeProfile,
  type ThemeProfile
} from "../config/themeEngine";
import type { BuyerSegment } from "../config/segments";

export interface WorkspaceScaffoldInput {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  tier: KitTierName;
  segment: BuyerSegment;
  themePresetId?: string;
}

export interface WorkspaceScaffold {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  segment: BuyerSegment;
  entitlements: ReturnType<typeof getEntitlementProfile>;
  themeProfile: ThemeProfile;
}

export function createWorkspaceScaffold(
  input: WorkspaceScaffoldInput
): WorkspaceScaffold {
  const preset = input.themePresetId ? getThemePreset(input.themePresetId) : null;

  return {
    id: input.id,
    organizationId: input.organizationId,
    name: input.name,
    slug: input.slug,
    segment: input.segment,
    entitlements: getEntitlementProfile(input.tier),
    themeProfile: resolveThemeProfile({
      presetId: preset?.id,
      name: preset?.label ?? input.name
    })
  };
}

export function getWorkspaceReadiness(
  lanes: LaneReadinessInput[],
  milestones: ActivationMilestone[]
): ApiResult<WorkspaceReadinessReport> {
  return {
    data: scoreWorkspaceReadiness(lanes, milestones),
    error: null
  };
}

export function previewWorkspaceTheme(
  presetId?: string
): ApiResult<ThemeProfile> {
  return {
    data: resolveThemeProfile({ presetId }),
    error: null
  };
}
