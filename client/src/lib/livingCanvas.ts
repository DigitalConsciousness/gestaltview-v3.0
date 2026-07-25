export type LivingCanvasMedium =
  | "voice"
  | "text"
  | "image"
  | "document"
  | "song"
  | "spotify";

export type LivingCanvasSourceModule =
  | "blackboard-room"
  | "musical-dna"
  | "external-scaffold"
  | "creation-corner"
  | "pull-string"
  | "rapid-prototype";

export type LivingCanvasProfileEntry = {
  id: string;
  text: string;
  createdAt: string;
  medium?: LivingCanvasMedium;
  sourceModule?: LivingCanvasSourceModule;
  resonanceTags?: string[];
  embeddingRef?: string; // Supabase pgvector row ID once synced
};

// ─── Storage keys ─────────────────────────────────────────────────────────────
// Legacy keys used by the old Whiteboard Room / current Blackboard Room alias — kept only for one-time migration.
const LEGACY_ABSORB_KEY = "whiteboard-room-absorb-enabled";
const LEGACY_PROFILE_KEY = "whiteboard-room-profile-entries";

export const LIVING_CANVAS_ABSORB_KEY = "blackboard-room-absorb-enabled";
export const LIVING_CANVAS_PROFILE_KEY = "blackboard-room-profile-entries";

// ─── One-time migration from legacy keys ──────────────────────────────────────
function runLegacyMigration(): void {
  if (typeof window === "undefined") return;
  try {
    // Migrate absorb preference
    if (
      localStorage.getItem(LIVING_CANVAS_ABSORB_KEY) === null &&
      localStorage.getItem(LEGACY_ABSORB_KEY) !== null
    ) {
      const legacyAbsorb = localStorage.getItem(LEGACY_ABSORB_KEY);
      if (legacyAbsorb !== null) {
        localStorage.setItem(LIVING_CANVAS_ABSORB_KEY, legacyAbsorb);
      }
      localStorage.removeItem(LEGACY_ABSORB_KEY);
    }

    // Migrate profile entries — backfill medium + sourceModule on old entries
    if (
      localStorage.getItem(LIVING_CANVAS_PROFILE_KEY) === null &&
      localStorage.getItem(LEGACY_PROFILE_KEY) !== null
    ) {
      const raw = localStorage.getItem(LEGACY_PROFILE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{
          id: string;
          text: string;
          createdAt: string;
        }>;
        const migrated: LivingCanvasProfileEntry[] = parsed.map((e) => ({
          ...e,
          medium: "text" as LivingCanvasMedium,
          sourceModule: "blackboard-room" as LivingCanvasSourceModule,
        }));
        localStorage.setItem(LIVING_CANVAS_PROFILE_KEY, JSON.stringify(migrated));
      }
      localStorage.removeItem(LEGACY_PROFILE_KEY);
    }
  } catch {
    // Silent — migration is best-effort
  }
}

// Run once on module load
runLegacyMigration();

// ─── Read / write helpers ──────────────────────────────────────────────────────
export function readLivingCanvasAbsorbEnabled(defaultValue = true): boolean {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(LIVING_CANVAS_ABSORB_KEY);
    return stored === null ? defaultValue : stored !== "false";
  } catch {
    return defaultValue;
  }
}

export function writeLivingCanvasAbsorbEnabled(value: boolean): void {
  try {
    localStorage.setItem(LIVING_CANVAS_ABSORB_KEY, String(value));
  } catch {
    // Optional persistence.
  }
}

export function readLivingCanvasProfileEntries(): LivingCanvasProfileEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(LIVING_CANVAS_PROFILE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as LivingCanvasProfileEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 18) : [];
  } catch {
    return [];
  }
}

export function writeLivingCanvasProfileEntries(
  entries: LivingCanvasProfileEntry[]
): void {
  try {
    localStorage.setItem(
      LIVING_CANVAS_PROFILE_KEY,
      JSON.stringify(entries.slice(0, 18))
    );
  } catch {
    // Optional persistence.
  }
}
