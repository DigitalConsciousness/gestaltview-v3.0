import { buildProfilePortrait, type ProfilePortrait } from "../../shared/profilePortrait.js";
import type { PersonalityProfile } from "../../shared/profileIngestion.js";
import { getFounderContext, invokeRpc, listBucketDrops, listGravityReports, listMemoryEntries } from "./supabase.js";
import {
  loadLatestPersistedPortrait,
  loadLatestPersistedPortraitRecord as loadLatestPersistedPortraitRecordFromPersistence,
} from "./profilePortraitPersistence.js";

function emptyProfile(): PersonalityProfile {
  return {
    dimensions: [],
    keyThemes: [],
    unresolvedTensions: [],
    coreNarrative: "",
  };
}

export async function loadProfilePortraitForUser(
  userId: string,
  profile?: PersonalityProfile | null,
  inferenceTriggeredBy: ProfilePortrait["inferenceTriggeredBy"] = "manual",
  previousPortrait: ProfilePortrait | null = null,
  inferenceRunId?: string,
  contextFraming?: string,
): Promise<ProfilePortrait> {
  const resolvedProfile =
    profile === undefined
      ? await invokeRpc<PersonalityProfile>("get_user_personality_profile", {
          user_id: userId,
        }).catch(() => emptyProfile())
      : profile ?? emptyProfile();

  const [memoryEntries, bucketDrops, gravityReports, founderContext] = await Promise.all([
    listMemoryEntries({ userId, limit: 24 }),
    listBucketDrops(userId, 24),
    listGravityReports(userId, 12),
    getFounderContext(userId),
  ]);

  return buildProfilePortrait({
    userId,
    profile: resolvedProfile ?? emptyProfile(),
    previousPortrait,
    contextFraming,
    evidence: {
      memoryEntries,
      bucketDrops,
      gravityReports,
      founderContext,
    },
    inferenceTriggeredBy,
    inferenceRunId,
  });
}

export async function loadLatestPortraitForUser(userId: string): Promise<ProfilePortrait | null> {
  return loadLatestPersistedPortrait(userId);
}

export async function loadLatestPersistedPortraitRecord(userId: string) {
  return loadLatestPersistedPortraitRecordFromPersistence(userId);
}
