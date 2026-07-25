import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const profilesDir = path.join(repoRoot, "embodiment_profiles");
const outputDir = path.join(repoRoot, "shared", "embodiment");
const outputFile = path.join(outputDir, "generated.ts");

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

async function readProfiles() {
  const entries = await readdir(profilesDir);
  const profileFiles = entries
    .filter((entry) => entry.endsWith(".embodiment.json"))
    .sort((left, right) => left.localeCompare(right));

  const pairs = await Promise.all(
    profileFiles.map(async (filename) => {
      const raw = await readFile(path.join(profilesDir, filename), "utf8");
      const parsed = JSON.parse(raw);

      if (!parsed.slug) {
        throw new Error(`Embodiment profile is missing slug: ${filename}`);
      }

      return [parsed.slug, sortObjectKeys(parsed)];
    })
  );

  return Object.fromEntries(
    pairs.sort(([left], [right]) => left.localeCompare(right))
  );
}

function renderModule(profiles) {
  const serialized = JSON.stringify(profiles, null, 2);
  const slugs = JSON.stringify(Object.keys(profiles).sort((left, right) => left.localeCompare(right)), null, 2);

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
  const profiles = await readProfiles();
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, renderModule(profiles), "utf8");
  process.stdout.write(`Wrote ${path.relative(repoRoot, outputFile)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
