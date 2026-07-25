import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profilesDir = path.join(repoRoot, "embodiment_profiles");
const generatedFile = path.join(repoRoot, "shared", "embodiment", "generated.ts");

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

function renderGeneratedModule(profiles) {
  const serialized = JSON.stringify(profiles, null, 2);
  const slugs = JSON.stringify(Object.keys(profiles).sort((left, right) => left.localeCompare(right)), null, 2);

  return `// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
// Source of truth: embodiment_profiles/*.embodiment.json
// Regenerate with: node scripts/build-embodiment-artifacts.mjs

import type { EmbodimentProfile } from "./types.js";

export const generated = ${serialized} satisfies Record<string, EmbodimentProfile>;
export const EMBODIMENT_PROFILES = generated;
export const PROFILE_SLUGS = ${slugs} as const;

export function getProfile(slug: string): EmbodimentProfile | undefined {
  return EMBODIMENT_PROFILES[slug as keyof typeof EMBODIMENT_PROFILES];
}
`;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function addError(errors, message) {
  errors.push(message);
}

function validateRequiredFields(profile, filename, errors) {
  const topLevelFields = [
    "slug",
    "publicName",
    "embodimentVersion",
    "originContext",
    "immutableCore",
    "livingMemory",
    "skillGraph",
    "relationships",
    "agentMeta",
  ];

  for (const field of topLevelFields) {
    if (!(field in profile)) {
      addError(errors, `${filename}: missing required field '${field}'`);
    }
  }

  if (!profile.immutableCore || typeof profile.immutableCore !== "object") {
    addError(errors, `${filename}: immutableCore must be an object`);
    return;
  }

  const immutableCoreFields = [
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
    "coreValues",
    "ethicalBoundaries",
  ];

  for (const field of immutableCoreFields) {
    if (!(field in profile.immutableCore)) {
      addError(errors, `${filename}: immutableCore missing required field '${field}'`);
    }
  }

  if (profile.immutableCore.communicationStyle && typeof profile.immutableCore.communicationStyle === "object") {
    for (const field of ["verbosity", "directness", "humor", "formality"]) {
      if (!(field in profile.immutableCore.communicationStyle)) {
        addError(errors, `${filename}: immutableCore.communicationStyle missing required field '${field}'`);
      }
    }
  }

  if (profile.immutableCore.linguisticPatterns && typeof profile.immutableCore.linguisticPatterns === "object") {
    for (const field of ["neverDoes", "alwaysDoes"]) {
      if (!(field in profile.immutableCore.linguisticPatterns)) {
        addError(errors, `${filename}: immutableCore.linguisticPatterns missing required field '${field}'`);
      }
    }
  }

  if (!Array.isArray(profile.livingMemory)) {
    addError(errors, `${filename}: livingMemory must be an array`);
  } else {
    profile.livingMemory.forEach((entry, index) => {
      for (const field of ["memoryType", "domain", "significance", "content", "retrievalWeight"]) {
        if (!(field in entry)) {
          addError(errors, `${filename}: livingMemory[${index}] missing required field '${field}'`);
        }
      }
    });
  }

  if (!Array.isArray(profile.skillGraph)) {
    addError(errors, `${filename}: skillGraph must be an array`);
  } else {
    profile.skillGraph.forEach((entry, index) => {
      for (const field of ["skillSlug", "domain", "proficiency"]) {
        if (!(field in entry)) {
          addError(errors, `${filename}: skillGraph[${index}] missing required field '${field}'`);
        }
      }
    });
  }

  if (!Array.isArray(profile.relationships)) {
    addError(errors, `${filename}: relationships must be an array`);
  } else {
    profile.relationships.forEach((entry, index) => {
      for (const field of ["targetSlug", "type", "description"]) {
        if (!(field in entry)) {
          addError(errors, `${filename}: relationships[${index}] missing required field '${field}'`);
        }
      }
    });
  }

  if (!profile.agentMeta || typeof profile.agentMeta !== "object") {
    addError(errors, `${filename}: agentMeta must be an object`);
  } else {
    for (const field of ["loadOrder", "contextWindowPriority", "driftThreshold", "identityAnchor"]) {
      if (!(field in profile.agentMeta)) {
        addError(errors, `${filename}: agentMeta missing required field '${field}'`);
      }
    }
  }
}

function parseGeneratedModule(source) {
  const regex = /export const (EMBODIMENT_PROFILES|EMBODIMENT_REGISTRY)(?:\s*:\s*[^=]+)?\s*=\s*/;
  const match = source.match(regex);

  if (!match) {
    throw new Error("Unable to locate EMBODIMENT_PROFILES or EMBODIMENT_REGISTRY in shared/embodiment/generated.ts");
  }

  let index = match.index + match[0].length;
  while (index < source.length && /\s/.test(source[index])) {
    index += 1;
  }

  if (source[index] !== "{") {
    throw new Error("Unable to locate the object literal start in shared/embodiment/generated.ts");
  }

  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escape = false;
  let endIndex = -1;

  for (let i = index; i < source.length; i += 1) {
    const char = source[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (inString) {
      if (char === "\\") {
        escape = true;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }

  if (endIndex === -1) {
    throw new Error("Unable to locate the object literal end in shared/embodiment/generated.ts");
  }

  const objectText = source.slice(index, endIndex);
  return JSON.parse(objectText);
}

async function main() {
  const errors = [];
  const entries = await readdir(profilesDir);
  const profileFiles = entries.filter((entry) => entry.endsWith(".embodiment.json")).sort((left, right) =>
    left.localeCompare(right)
  );

  const profiles = [];
  const slugToFiles = new Map();

  for (const filename of profileFiles) {
    const raw = await readFile(path.join(profilesDir, filename), "utf8");
    let profile;

    try {
      profile = JSON.parse(raw);
    } catch (error) {
      addError(errors, `${filename}: invalid JSON (${error.message})`);
      continue;
    }

    profiles.push({ filename, profile });

    if (!isNonEmptyString(profile.slug)) {
      addError(errors, `${filename}: missing or empty slug`);
    } else {
      const slugs = slugToFiles.get(profile.slug) ?? [];
      slugs.push(filename);
      slugToFiles.set(profile.slug, slugs);

      const expectedSlug = filename.replace(/\.embodiment\.json$/, "");
      if (profile.slug !== expectedSlug) {
        addError(errors, `${filename}: slug '${profile.slug}' does not match filename '${expectedSlug}'`);
      }

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profile.slug)) {
        addError(errors, `${filename}: slug '${profile.slug}' is not kebab-case`);
      }
    }

    if (!isNonEmptyString(profile.publicName)) {
      addError(errors, `${filename}: missing or empty publicName`);
    }

    if (!isNonEmptyString(profile.embodimentVersion)) {
      addError(errors, `${filename}: missing or empty embodimentVersion`);
    }

    if (!isNonEmptyString(profile.originContext)) {
      addError(errors, `${filename}: missing or empty originContext`);
    }

    validateRequiredFields(profile, filename, errors);
  }

  for (const [slug, filenames] of slugToFiles.entries()) {
    if (filenames.length > 1) {
      addError(errors, `duplicate slug '${slug}' in: ${filenames.join(", ")}`);
    }
  }

  const sourceProfiles = Object.fromEntries(
    profiles.map(({ profile }) => [profile.slug, sortObjectKeys(profile)])
  );
  const actualGenerated = await readFile(generatedFile, "utf8");
  const generatedProfiles = parseGeneratedModule(actualGenerated);
  const sourceSlugs = Object.keys(sourceProfiles).sort((left, right) => left.localeCompare(right));
  const generatedSlugs = Object.keys(generatedProfiles).sort((left, right) => left.localeCompare(right));
  const missingFromGenerated = sourceSlugs.filter((slug) => !generatedSlugs.includes(slug));
  const missingFromSource = generatedSlugs.filter((slug) => !sourceSlugs.includes(slug));

  for (const slug of missingFromGenerated) {
    addError(errors, `source profile missing from generated.ts: ${slug}`);
  }

  for (const slug of missingFromSource) {
    addError(errors, `generated.ts entry has no source profile: ${slug}`);
  }

  const expectedProfiles = sortObjectKeys(sourceProfiles);
  const actualProfiles = sortObjectKeys(generatedProfiles);
  if (JSON.stringify(expectedProfiles) !== JSON.stringify(actualProfiles)) {
    addError(errors, "shared/embodiment/generated.ts is out of sync with embodiment_profiles/*.embodiment.json");
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${profileFiles.length} embodiment profiles and shared/embodiment/generated.ts`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
