import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { getAllEmbodimentProfiles } from "@/lib/embodimentRuntime";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function readProfileSlugs(): string[] {
  return readdirSync(path.join(repoRoot, "embodiment_profiles"))
    .filter((filename) => filename.endsWith(".embodiment.json"))
    .map((filename) => filename.replace(/\.embodiment\.json$/, ""))
    .sort((left, right) => left.localeCompare(right));
}

describe("embodiment runtime registry", () => {
  it("stays aligned with the profile files on disk", () => {
    const fileSlugs = readProfileSlugs();
    const runtimeSlugs = getAllEmbodimentProfiles()
      .map((profile) => profile.slug)
      .sort((left, right) => left.localeCompare(right));

    expect(runtimeSlugs).toEqual(fileSlugs);
  });
});
