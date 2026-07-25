import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profilesDir = path.join(repoRoot, "embodiment_profiles");

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNumber(value, fallback = 0) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function livingMemoryKey(entry) {
  return `${normalizeText(entry.domain).toLowerCase()}::${normalizeText(entry.content).toLowerCase()}`;
}

export function sortObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortObjectKeys(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.keys(value)
    .sort((left, right) => left.localeCompare(right))
    .reduce((accumulator, key) => {
      accumulator[key] = sortObjectKeys(value[key]);
      return accumulator;
    }, {});
}

export function selectEnrichmentCandidates(events, minimumSignificance = 0.75) {
  return (events ?? []).filter((event) => normalizeNumber(event.significance) >= minimumSignificance);
}

export function mergeLivingMemoryEntries(existingEntries, events) {
  const merged = [...(existingEntries ?? [])];
  const seen = new Set(merged.map((entry) => livingMemoryKey(entry)));

  for (const event of events ?? []) {
    const key = livingMemoryKey(event);
    if (seen.has(key)) {
      continue;
    }

    merged.push({
      domain: normalizeText(event.domain),
      memoryType: normalizeText(event.memory_type),
      significance: normalizeNumber(event.significance),
      content: normalizeText(event.content),
      retrievalWeight: normalizeNumber(event.retrieval_weight),
    });

    seen.add(key);
  }

  return merged.sort((left, right) => normalizeNumber(right.retrievalWeight) - normalizeNumber(left.retrievalWeight));
}

async function loadProfiles() {
  const entries = await readdir(profilesDir);
  const profileFiles = entries
    .filter((entry) => entry.endsWith(".embodiment.json"))
    .sort((left, right) => left.localeCompare(right));

  const profiles = [];
  for (const filename of profileFiles) {
    const raw = await readFile(path.join(profilesDir, filename), "utf8");
    profiles.push({ filename, profile: JSON.parse(raw) });
  }

  return profiles;
}

async function writeProfiles(nextProfiles) {
  for (const { filename, profile } of nextProfiles) {
    const rendered = `${JSON.stringify(sortObjectKeys(profile), null, 2)}\n`;
    await writeFile(path.join(profilesDir, filename), rendered, "utf8");
  }
}

async function loadEnrichmentEvents() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl.trim() || !supabaseKey.trim()) {
    throw new Error("SUPABASE_URL and a service key are required to enrich living memories.");
  }

  const supabase = createClient(supabaseUrl.trim(), supabaseKey.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from("di_memory_events")
    .select("di_slug,domain,content,memory_type,significance,retrieval_weight,source,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function main() {
  if (process.env.DI_ENRICHMENT_APPROVED !== "true") {
    throw new Error("DI_ENRICHMENT_APPROVED=true is required before this script mutates canonical profiles.");
  }

  const profiles = await loadProfiles();
  const events = await loadEnrichmentEvents();
  const eventsBySlug = new Map();

  for (const event of selectEnrichmentCandidates(events)) {
    const bucket = eventsBySlug.get(event.di_slug) ?? [];
    bucket.push(event);
    eventsBySlug.set(event.di_slug, bucket);
  }

  const nextProfiles = profiles.map(({ filename, profile }) => {
    const currentLivingMemory = Array.isArray(profile.livingMemory) ? profile.livingMemory : [];
    const incoming = eventsBySlug.get(profile.slug) ?? [];

    return {
      filename,
      profile: {
        ...profile,
        livingMemory: mergeLivingMemoryEntries(currentLivingMemory, incoming),
      },
    };
  });

  await writeProfiles(nextProfiles);
  await execFileAsync("node", ["scripts/build-embodiment-artifacts.mjs"], { cwd: repoRoot });
}

const isDirectExecution =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
