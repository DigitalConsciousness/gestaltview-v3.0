import { DEFAULT_MODEL_HOMES } from "../../shared/model-homes/registry.js";
import type { ModelHome } from "../../shared/model-homes/types.js";

export function listDefaultModelHomeOnboarding(): Pick<
  ModelHome,
  "slug" | "displayName" | "privacyTier" | "defaultRooms"
>[] {
  return DEFAULT_MODEL_HOMES.map(({ slug, displayName, privacyTier, defaultRooms }) => ({
    slug,
    displayName,
    privacyTier,
    defaultRooms,
  }));
}
