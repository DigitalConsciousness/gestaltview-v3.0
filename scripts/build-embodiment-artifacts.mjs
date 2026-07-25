import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const profilesDir = path.join(repoRoot, "embodiment_profiles");
const outputDir = path.join(repoRoot, "shared", "embodiment");
const outputFile = path.join(outputDir, "generated.ts");
const checkOnly = process.argv.includes("--check");

function sortObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
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

function slugFromFilename(filename) {
  return filename.replace(/\.embodiment\.json$/, "");
}

async function readJsonProfile(filename) {
  const filePath = path.join(profilesDir, filename);
  const raw = await readFile(filePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in embodiment profile ${filename}: ${message}`);
  }
}

async function readProfiles() {
  const entries = await readdir(profilesDir, { withFileTypes: true });
  const profileFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".embodiment.json"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (profileFiles.length === 0) {
    throw new Error(`No embodiment profiles found in ${path.relative(repoRoot, profilesDir)}`);
  }

  const slugToFilename = new Map();
  const pairs = [];

  for (const filename of profileFiles) {
    const parsed = await readJsonProfile(filename);
    const expectedSlug = slugFromFilename(filename);

    if (!parsed.slug || typeof parsed.slug !== "string") {
      throw new Error(`Embodiment profile is missing string slug: ${filename}`);
    }

    if (parsed.slug !== expectedSlug) {
      throw new Error(
        `Embodiment profile slug/filename mismatch: ${filename} declares slug "${parsed.slug}" but expected "${expectedSlug}"`
      );
    }

    const priorFilename = slugToFilename.get(parsed.slug);
    if (priorFilename) {
      throw new Error(`Duplicate embodiment profile slug "${parsed.slug}" in ${priorFilename} and ${filename}`);
    }

    slugToFilename.set(parsed.slug, filename);
    pairs.push([parsed.slug, sortObjectKeys(parsed)]);
  }

  return Object.fromEntries(
    pairs.sort(([left], [right]) => left.localeCompare(right))
  );
}

function renderModule(profiles) {
  const profileSlugs = Object.keys(profiles).sort((left, right) => left.localeCompare(right));
  const serialized = JSON.stringify(profiles, null, 2);
  const slugs = JSON.stringify(profileSlugs, null, 2);

  return `// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
// Source of truth: embodiment_profiles/*.embodiment.json
// Regenerate with: node scripts/build-embodiment-artifacts.mjs
// Check drift with: node scripts/build-embodiment-artifacts.mjs --check
// Profile count: ${profileSlugs.length}

import type { EmbodimentProfile } from "./types.js";

export const EMBODIMENT_REGISTRY = ${serialized} satisfies Record<string, EmbodimentProfile>;
export const EMBODIMENT_PROFILES = EMBODIMENT_REGISTRY;
export const PROFILE_SLUGS = ${slugs} as const;

export function hasProfile(slug: string): slug is keyof typeof EMBODIMENT_REGISTRY {
  return Object.prototype.hasOwnProperty.call(EMBODIMENT_REGISTRY, slug);
}

export function getProfile(slug: string): EmbodimentProfile | undefined {
  return hasProfile(slug) ? EMBODIMENT_REGISTRY[slug] : undefined;
}
`;
}

async function assertGeneratedIsCurrent(nextContent) {
  let currentContent = "";
  try {
    currentContent = await readFile(outputFile, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Generated embodiment registry is missing or unreadable: ${message}`);
  }

  if (currentContent !== nextContent) {
    throw new Error(
      `Generated embodiment registry is stale. Run node scripts/build-embodiment-artifacts.mjs and commit ${path.relative(repoRoot, outputFile)}.`
    );
  }
}

async function main() {
  const profiles = await readProfiles();
  const nextContent = renderModule(profiles);

  if (checkOnly) {
    await assertGeneratedIsCurrent(nextContent);
    process.stdout.write(`Generated embodiment registry is current (${Object.keys(profiles).length} profiles).\n`);
    return;
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, nextContent, "utf8");
  process.stdout.write(`Wrote ${path.relative(repoRoot, outputFile)} (${Object.keys(profiles).length} profiles)\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
