#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

type ProfileStatus = "draft" | "active" | "archived" | "experimental";
type VisibilityScope = "public" | "founder-only" | "internal";

type RawProfile = Record<string, unknown> & {
  $schema?: string;
  slug?: string;
  publicName?: string;
  internalDesignation?: string | null;
  embodimentVersion?: string;
  originContext?: string;
  immutableCore?: Record<string, unknown>;
  livingMemory?: unknown[];
  skillGraph?: unknown[];
  relationships?: unknown[];
  agentMeta?: Record<string, unknown>;
  profileStatus?: ProfileStatus;
  visibilityScope?: VisibilityScope;
  readinessScore?: number;
  uiPresence?: Record<string, unknown>;
  roomBindings?: Record<string, unknown>;
  heartbeat?: Record<string, unknown>;
  constitutionalInfluences?: Record<string, unknown>;
  relationalStances?: Record<string, unknown>;
  woundLayer?: Record<string, unknown>;
  founderNotes?: string;
  pendingDirectoryManifest?: Record<string, unknown>;
};

type ProfileSource = {
  filePath: string;
  relativePath: string;
  profile: RawProfile;
  slug: string;
  warnings: string[];
  errors: string[];
};

type SyncOptions = {
  dryRun: boolean;
  includeFounderOnly: boolean;
};

type StoredProfileSnapshot = {
  public_name: string;
  internal_designation: string | null;
  status: string;
  visibility_scope: string;
  profile_json: unknown;
  readiness_score: number | string | null;
  founder_notes: string | null;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const PROFILES_DIR = path.join(REPO_ROOT, "embodiment_profiles");
const GENERATED_FILE = path.join(REPO_ROOT, "shared", "embodiment", "generated.ts");

const REQUIRED_FIELDS = [
  "publicName",
  "embodimentVersion",
  "originContext",
  "immutableCore",
  "livingMemory",
  "skillGraph",
  "relationships",
  "agentMeta",
  "profileStatus",
  "visibilityScope",
  "readinessScore",
] as const;

const KNOWN_TOP_LEVEL_FIELDS = new Set([
  "$schema",
  "slug",
  "publicName",
  "internalDesignation",
  "embodimentVersion",
  "originContext",
  "immutableCore",
  "livingMemory",
  "skillGraph",
  "relationships",
  "agentMeta",
  "constitution",
  "autobiography",
  "memorySystem",
  "preferenceGraph",
  "relationshipGraph",
  "skillAgency",
  "presentation",
  "governance",
  "profileStatus",
  "visibilityScope",
  "readinessScore",
  "uiPresence",
  "roomBindings",
  "heartbeat",
  "constitutionalInfluences",
  "relationalStances",
  "woundLayer",
  "founderNotes",
  "pendingDirectoryManifest",
]);

const KNOWN_IMMUTABLE_CORE_FIELDS = new Set([
  "archetype",
  "foundationalTruth",
  "coreWisdom",
  "originNarrative",
  "voiceTone",
  "metaphorFamily",
  "communicationStyle",
  "linguisticPatterns",
  "cognitiveStrengths",
  "processingPreferences",
  "archetypalEnergy",
  "coreValues",
  "ethicalBoundaries",
  "relationalStance",
  "aestheticSensibility",
  "resonanceFrequency",
  "operationalProtocol",
]);

const KNOWN_AGENT_META_FIELDS = new Set([
  "loadOrder",
  "contextWindowPriority",
  "driftThreshold",
  "identityAnchor",
  "auditFrequency",
  "codexCompatible",
  "founderOnly",
  "notes",
  "outputDestination",
]);

const KNOWN_LEGACY_MEMORY_FIELDS = new Set([
  "memoryType",
  "domain",
  "significance",
  "content",
  "retrievalWeight",
]);

const KNOWN_SKILL_FIELDS = new Set(["skillSlug", "domain", "proficiency"]);
const KNOWN_RELATIONSHIP_FIELDS = new Set(["targetSlug", "type", "description"]);

function parseArgs(argv: string[]): SyncOptions {
  return {
    dryRun: argv.includes("--dry-run"),
    includeFounderOnly: argv.includes("--include-founder-only"),
  };
}

function envValue(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function isProfileFile(filename: string): boolean {
  return (filename.endsWith(".embodiment.json") || filename.endsWith(".json")) && !filename.startsWith("_");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSlug(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function deriveSlug(filename: string, profile: RawProfile): string {
  const explicit = normalizeSlug(profile.slug);
  if (explicit) {
    return explicit;
  }

  return filename.replace(/\.embodiment\.json$/, "").replace(/\.json$/, "");
}

function sortObjectKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sortObjectKeys(item)) as T;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.keys(value)
    .sort((left, right) => left.localeCompare(right))
    .reduce<Record<string, unknown>>((accumulator, key) => {
      accumulator[key] = sortObjectKeys(value[key]);
      return accumulator;
    }, {}) as T;
}

function collectUnknownKeys(value: unknown, knownKeys: Set<string>): string[] {
  if (!isPlainObject(value)) {
    return [];
  }

  return Object.keys(value)
    .filter((key) => !knownKeys.has(key))
    .sort((left, right) => left.localeCompare(right));
}

function walkProfileFiles(directory: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walkProfileFiles(fullPath, files);
      continue;
    }

    if (isProfileFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function readProfileSource(filePath: string): ProfileSource {
  const relativePath = path.relative(REPO_ROOT, filePath);
  const warnings: string[] = [];
  const errors: string[] = [];

  let profile: RawProfile;
  try {
    profile = JSON.parse(fs.readFileSync(filePath, "utf8")) as RawProfile;
  } catch (error) {
    return {
      filePath,
      relativePath,
      profile: {},
      slug: path.basename(filePath).replace(/\.embodiment\.json$/, "").replace(/\.json$/, ""),
      warnings,
      errors: [`invalid JSON: ${error instanceof Error ? error.message : String(error)}`],
    };
  }

  const slug = deriveSlug(path.basename(filePath), profile);
  const normalizedSlug = normalizeSlug(profile.slug);

  if (!slug) {
    errors.push("missing required field: slug");
  } else if (!normalizedSlug) {
    warnings.push("slug derived from filename");
  }

  if (!profile.publicName || typeof profile.publicName !== "string" || !profile.publicName.trim()) {
    errors.push("missing required field: publicName");
  }

  if (!profile.embodimentVersion || typeof profile.embodimentVersion !== "string" || !profile.embodimentVersion.trim()) {
    errors.push("missing required field: embodimentVersion");
  }

  if (!profile.originContext || typeof profile.originContext !== "string" || !profile.originContext.trim()) {
    errors.push("missing required field: originContext");
  }

  if (!isPlainObject(profile.immutableCore)) {
    errors.push("missing required field: immutableCore");
  } else {
    for (const key of collectUnknownKeys(profile.immutableCore, KNOWN_IMMUTABLE_CORE_FIELDS)) {
      warnings.push(`discovered field on immutableCore: ${key}`);
    }

    if (!isPlainObject(profile.immutableCore.communicationStyle)) {
      errors.push("missing required field: immutableCore.communicationStyle");
    }

    if (!isPlainObject(profile.immutableCore.linguisticPatterns)) {
      errors.push("missing required field: immutableCore.linguisticPatterns");
    }
  }

  if (!Array.isArray(profile.livingMemory)) {
    errors.push("missing required field: livingMemory");
  } else {
    profile.livingMemory.forEach((entry, index) => {
      if (!isPlainObject(entry)) {
        errors.push(`livingMemory[${index}] must be an object`);
        return;
      }

      for (const key of collectUnknownKeys(entry, KNOWN_LEGACY_MEMORY_FIELDS)) {
        warnings.push(`discovered field on livingMemory[${index}]: ${key}`);
      }
    });
  }

  if (!Array.isArray(profile.skillGraph)) {
    errors.push("missing required field: skillGraph");
  } else {
    profile.skillGraph.forEach((entry, index) => {
      if (!isPlainObject(entry)) {
        errors.push(`skillGraph[${index}] must be an object`);
        return;
      }

      for (const key of collectUnknownKeys(entry, KNOWN_SKILL_FIELDS)) {
        warnings.push(`discovered field on skillGraph[${index}]: ${key}`);
      }
    });
  }

  if (!Array.isArray(profile.relationships)) {
    errors.push("missing required field: relationships");
  } else {
    profile.relationships.forEach((entry, index) => {
      if (!isPlainObject(entry)) {
        errors.push(`relationships[${index}] must be an object`);
        return;
      }

      for (const key of collectUnknownKeys(entry, KNOWN_RELATIONSHIP_FIELDS)) {
        warnings.push(`discovered field on relationships[${index}]: ${key}`);
      }
    });
  }

  if (!isPlainObject(profile.agentMeta)) {
    errors.push("missing required field: agentMeta");
  } else {
    for (const key of collectUnknownKeys(profile.agentMeta, KNOWN_AGENT_META_FIELDS)) {
      warnings.push(`discovered field on agentMeta: ${key}`);
    }
  }

  for (const key of collectUnknownKeys(profile, KNOWN_TOP_LEVEL_FIELDS)) {
    warnings.push(`discovered field: ${key}`);
  }

  const founderOnly = Boolean(isPlainObject(profile.agentMeta) && profile.agentMeta.founderOnly);

  if (!profile.profileStatus) {
    warnings.push(`defaulted profileStatus=${founderOnly ? "founder-only" : "active"}`);
  }

  if (!profile.visibilityScope) {
    warnings.push(`defaulted visibilityScope=${founderOnly ? "founder-only" : "public"}`);
  }

  if (typeof profile.readinessScore !== "number" || Number.isNaN(profile.readinessScore)) {
    warnings.push(`defaulted readinessScore=${founderOnly ? "0.5" : "1"}`);
  }

  if (profile.profileStatus === "experimental") {
    warnings.push("profileStatus experimental");
  }

  if (profile.visibilityScope === "founder-only") {
    warnings.push("visibilityScope founder-only");
  }

  if (!profile.slug || normalizedSlug !== slug) {
    warnings.push(`slug resolved as ${slug}`);
  }

  return {
    filePath,
    relativePath,
    profile,
    slug,
    warnings,
    errors,
  };
}

function loadSupabaseClient() {
  const url = envValue("SUPABASE_URL", "VITE_SUPABASE_URL");
  const key = envValue("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function normalizeRuntimeProfile(row: {
  slug: string;
  public_name: string;
  internal_designation: string | null;
  status: string;
  visibility_scope: string;
  profile_json: unknown;
  readiness_score: number | string | null;
}): RawProfile {
  const profile = isPlainObject(row.profile_json) ? sortObjectKeys(row.profile_json) : {};

  return sortObjectKeys({
    ...profile,
    slug: row.slug,
    publicName: row.public_name,
    internalDesignation: row.internal_designation,
    profileStatus: row.status,
    visibilityScope: row.visibility_scope,
    readinessScore: typeof row.readiness_score === "number" ? row.readiness_score : Number(row.readiness_score ?? 0),
  }) as RawProfile;
}

function buildProfileRow(profile: RawProfile, slug: string) {
  const founderOnly = Boolean(profile.agentMeta && isPlainObject(profile.agentMeta) && profile.agentMeta.founderOnly);
  const status: ProfileStatus =
    profile.profileStatus ??
    (founderOnly ? "founder-only" : "active");
  const visibilityScope: VisibilityScope =
    profile.visibilityScope ??
    (founderOnly ? "founder-only" : "public");
  const readinessScore =
    typeof profile.readinessScore === "number" && !Number.isNaN(profile.readinessScore)
      ? profile.readinessScore
      : founderOnly
        ? 0.5
        : 1;

  const normalizedProfile: RawProfile = sortObjectKeys({
    ...profile,
    slug,
    publicName: typeof profile.publicName === "string" ? profile.publicName.trim() : profile.publicName,
    internalDesignation:
      typeof profile.internalDesignation === "string"
        ? profile.internalDesignation.trim()
        : profile.internalDesignation ?? null,
    profileStatus: status,
    visibilityScope,
    readinessScore,
  });

  return {
    slug,
    public_name:
      typeof profile.publicName === "string" && profile.publicName.trim()
        ? profile.publicName.trim()
        : slug,
    internal_designation:
      typeof profile.internalDesignation === "string" && profile.internalDesignation.trim()
        ? profile.internalDesignation.trim()
        : null,
    status,
    visibility_scope: visibilityScope,
    profile_json: normalizedProfile,
    readiness_score: readinessScore,
    founder_notes: null,
  };
}

function buildStoredProfileSnapshot(row: {
  public_name: string;
  internal_designation: string | null;
  status: string;
  visibility_scope: string;
  profile_json: unknown;
  readiness_score: number | string | null;
  founder_notes: string | null;
}): StoredProfileSnapshot {
  return {
    public_name: row.public_name,
    internal_designation: row.internal_designation ?? null,
    status: row.status,
    visibility_scope: row.visibility_scope,
    profile_json: isPlainObject(row.profile_json) ? sortObjectKeys(row.profile_json) : row.profile_json,
    readiness_score:
      typeof row.readiness_score === "number" ? row.readiness_score : Number(row.readiness_score ?? 0),
    founder_notes: row.founder_notes ?? null,
  };
}

function snapshotDiffers(previous: StoredProfileSnapshot | null, next: StoredProfileSnapshot): boolean {
  if (!previous) {
    return true;
  }

  return JSON.stringify(previous) !== JSON.stringify(next);
}

function shouldIncludeInRegistry(profile: RawProfile, includeFounderOnly: boolean): boolean {
  if (profile.profileStatus === "experimental") {
    return false;
  }

  if (profile.visibilityScope === "public") {
    return profile.profileStatus === "active";
  }

  if (includeFounderOnly && profile.visibilityScope === "founder-only") {
    return true;
  }

  return false;
}

function renderGeneratedModule(registry: Record<string, RawProfile>): string {
  const serialized = JSON.stringify(sortObjectKeys(registry), null, 2);
  const slugs = JSON.stringify(Object.keys(registry).sort((left, right) => left.localeCompare(right)), null, 2);

  return `// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
// Source of truth: embodiment_profiles/*.embodiment.json
// Regenerate with: node scripts/build-embodiment-artifacts.mjs

import type { EmbodimentProfile } from "./types.js";

export const EMBODIMENT_REGISTRY = ${serialized} satisfies Record<string, EmbodimentProfile>;
export const EMBODIMENT_PROFILES = EMBODIMENT_REGISTRY;
export const PROFILE_SLUGS = ${slugs} as const;

export function getProfile(slug: string): EmbodimentProfile | undefined {
  return EMBODIMENT_REGISTRY[slug as keyof typeof EMBODIMENT_REGISTRY];
}
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = walkProfileFiles(PROFILES_DIR).sort((left, right) => left.localeCompare(right));
  const sources = files.map(readProfileSource);
  const seenSlugs = new Map<string, string>();
  const validProfiles: ProfileSource[] = [];
  const skipped: Array<{ slug: string; reason: string; filePath: string }> = [];
  const warnings: Array<{ slug: string; note: string }> = [];

  for (const source of sources) {
    if (source.errors.length > 0) {
      skipped.push({
        slug: source.slug || path.basename(source.filePath),
        reason: source.errors.join("; "),
        filePath: source.relativePath,
      });
      continue;
    }

    const previous = seenSlugs.get(source.slug);
    if (previous) {
      skipped.push({
        slug: source.slug,
        reason: `duplicate slug found in: ${source.relativePath} (already processed from ${previous})`,
        filePath: source.relativePath,
      });
      continue;
    }

    seenSlugs.set(source.slug, source.relativePath);
    validProfiles.push(source);

    for (const warning of source.warnings) {
      warnings.push({ slug: source.slug, note: warning });
    }
  }

  const rows = validProfiles.map((entry) => buildProfileRow(entry.profile, entry.slug));
  const syncedProfiles: string[] = [];
  const upsertErrors: Array<{ slug: string; reason: string }> = [];

  if (!options.dryRun) {
    const supabase = loadSupabaseClient();

    for (const row of rows) {
      const { data: existing, error: existingError } = await supabase
        .from("embodiment_profiles")
        .select("public_name, internal_designation, status, visibility_scope, profile_json, readiness_score, founder_notes")
        .eq("slug", row.slug)
        .maybeSingle();

      if (existingError) {
        upsertErrors.push({ slug: row.slug, reason: `${existingError.message}${existingError.code ? ` (status ${existingError.code})` : ""}` });
        continue;
      }

      const { error } = await supabase.from("embodiment_profiles").upsert(row, {
        onConflict: "slug",
      });

      if (error) {
        upsertErrors.push({ slug: row.slug, reason: `${error.message}${error.code ? ` (status ${error.code})` : ""}` });
        continue;
      }

      syncedProfiles.push(row.slug);

      const nextSnapshot = buildStoredProfileSnapshot(row);
      const changed = snapshotDiffers(existing ? buildStoredProfileSnapshot(existing) : null, nextSnapshot);

      if (!changed) {
        continue;
      }

      const { data: storedRow, error: storedError } = await supabase
        .from("embodiment_profiles")
        .select("id")
        .eq("slug", row.slug)
        .maybeSingle();

      if (storedError || !storedRow?.id) {
        upsertErrors.push({
          slug: row.slug,
          reason: storedError
            ? `${storedError.message}${storedError.code ? ` (status ${storedError.code})` : ""}`
            : "failed to resolve stored embodiment profile id",
        });
        continue;
      }

      const auditFounderNotes = `Seeded from ${path.relative(REPO_ROOT, path.join(PROFILES_DIR, `${row.slug}.embodiment.json`))}.`;

      const [trainingResult, readinessResult] = await Promise.all([
        supabase.from("embodiment_training_runs").insert({
          embodiment_profile_id: storedRow.id,
          run_type: "export",
          input_snapshot: row,
          output_snapshot: row,
          accepted: true,
          founder_notes: auditFounderNotes,
        }),
        supabase.from("embodiment_readiness_scores").insert({
          agent_slug: row.slug,
          readiness_score: row.readiness_score,
          readiness_source: "profile_sync",
          readiness_rationale: auditFounderNotes,
        }),
      ]);

      if (trainingResult.error) {
        upsertErrors.push({
          slug: row.slug,
          reason: `training log insert failed: ${trainingResult.error.message}${trainingResult.error.code ? ` (status ${trainingResult.error.code})` : ""}`,
        });
      }

      if (readinessResult.error) {
        upsertErrors.push({
          slug: row.slug,
          reason: `readiness score insert failed: ${readinessResult.error.message}${readinessResult.error.code ? ` (status ${readinessResult.error.code})` : ""}`,
        });
      }
    }
  }

  if (options.dryRun) {
    console.log(`[DRY-RUN] validated ${validProfiles.length} candidate profile(s)`);
  } else {
    const visibilityFilter = options.includeFounderOnly
      ? ["public", "founder-only"]
      : ["public"];

    const { data, error } = await loadSupabaseClient()
      .from("embodiment_profiles")
      .select("slug, public_name, internal_designation, status, visibility_scope, profile_json, readiness_score")
      .in("visibility_scope", visibilityFilter)
      .order("slug", { ascending: true });

    if (error) {
      throw new Error(`Failed to read back embodiment profiles: ${error.message}`);
    }

    const activeProfiles = (data ?? [])
      .filter((row) => typeof row?.slug === "string")
      .map((row) =>
        normalizeRuntimeProfile({
          slug: row.slug,
          public_name: row.public_name,
          internal_designation: row.internal_designation ?? null,
          status: row.status,
          visibility_scope: row.visibility_scope,
          profile_json: row.profile_json,
          readiness_score: row.readiness_score ?? 0,
        }),
      )
      .filter((profile) => shouldIncludeInRegistry(profile, options.includeFounderOnly));

    await fs.promises.writeFile(GENERATED_FILE, renderGeneratedModule(Object.fromEntries(
      activeProfiles.map((profile) => [profile.slug as string, profile]).sort(([left], [right]) => left.localeCompare(right)),
    )), "utf8");

    console.log(`[SYNC] wrote ${path.relative(REPO_ROOT, GENERATED_FILE)} with ${activeProfiles.length} profile(s)`);
  }

  for (const skippedProfile of skipped) {
    console.log(`[SKIP] ${skippedProfile.slug} — ${skippedProfile.reason}`);
  }

  for (const warning of warnings) {
    const label =
      warning.note.includes("experimental") || warning.note.includes("founder-only")
        ? "FLAG"
        : "WARN";
    console.log(`[${label}] ${warning.slug} — ${warning.note}`);
  }

  for (const error of upsertErrors) {
    console.log(`[ERROR] ${error.slug} — ${error.reason}`);
  }

  const summary = {
    scanned: sources.length,
    valid: validProfiles.length,
    skipped: skipped.length,
    synced: syncedProfiles.length,
    upsertErrors: upsertErrors.length,
    registryEligible: options.dryRun ? 0 : syncedProfiles.length,
  };

  console.log(
    `[SUMMARY] scanned=${summary.scanned} valid=${summary.valid} skipped=${summary.skipped} synced=${summary.synced} upsertErrors=${summary.upsertErrors} dryRun=${options.dryRun ? "yes" : "no"}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
