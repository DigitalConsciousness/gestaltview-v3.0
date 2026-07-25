import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  corpusContainerBlueprint,
  corpusReviewChecklist,
  type CorpusLane
} from "../config/trainerBlueprint";
import { createImportManifestTemplate } from "../config/importTemplates";

export interface RepoCorpusContainerInput {
  repository: string;
  defaultBranch?: string;
  baseDir?: string;
}

export interface RepoCorpusContainerPlan {
  repository: string;
  owner: string;
  name: string;
  repoSlug: string;
  defaultBranch: string;
  containerRoot: string;
  manifestPath: string;
  reviewPath: string;
  readmePath: string;
  directories: string[];
  lanePaths: Record<CorpusLane, string>;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseRepository(repository: string): { owner: string; name: string } {
  const cleaned = repository.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
  const [owner, name] = cleaned.split("/").filter(Boolean);

  if (!owner || !name) {
    throw new Error("Repository must look like owner/repo or a GitHub URL.");
  }

  return { owner, name };
}

export function buildRepoCorpusContainerPlan(
  input: RepoCorpusContainerInput
): RepoCorpusContainerPlan {
  const parsedRepository = parseRepository(input.repository);
  const repoSlug = slugify(`${parsedRepository.owner}-${parsedRepository.name}`);
  const baseDir = resolve(input.baseDir ?? ".gsvw", "repo-corpus");
  const containerRoot = resolve(baseDir, repoSlug);
  const directories = corpusContainerBlueprint.map((zone) => resolve(containerRoot, zone.path));

  return {
    repository: input.repository,
    owner: parsedRepository.owner,
    name: parsedRepository.name,
    repoSlug,
    defaultBranch: input.defaultBranch?.trim() || "main",
    containerRoot,
    manifestPath: resolve(containerRoot, "manifests", "import-manifest.template.json"),
    reviewPath: resolve(containerRoot, "review", "seed-plan.md"),
    readmePath: resolve(containerRoot, "README.md"),
    directories,
    lanePaths: {
      knowledge: resolve(containerRoot, "staged", "knowledge"),
      code: resolve(containerRoot, "staged", "code"),
      product: resolve(containerRoot, "staged", "product"),
      context: resolve(containerRoot, "staged", "context")
    }
  };
}

function buildReadme(plan: RepoCorpusContainerPlan): string {
  const zones = corpusContainerBlueprint
    .map((zone) => `- \`${zone.path}\`: ${zone.summary}`)
    .join("\n");
  const checklist = corpusReviewChecklist.map((item, index) => `${index + 1}. ${item}`).join("\n");

  return `# Repo Corpus Container

Repository: \`${plan.owner}/${plan.name}\`
Default branch: \`${plan.defaultBranch}\`

This scaffold keeps raw repo exports separate from staged corpus lanes so the first import run stays small, auditable, and understandable.

## Zones

${zones}

## First pass

${checklist}

## Suggested first batch

- Add repo exports to \`incoming/github\`
- Add buyer docs to \`incoming/files\`
- Move only the highest-signal files into \`staged/knowledge\`, \`staged/code\`, \`staged/product\`, or \`staged/context\`
- Edit \`manifests/import-manifest.template.json\`
- Run a dry ingest before any live write
`;
}

function buildSeedPlan(plan: RepoCorpusContainerPlan): string {
  return `# Seed Plan

Repository: ${plan.owner}/${plan.name}
Default branch: ${plan.defaultBranch}

## Review sequence

1. Export or collect repo docs into ../incoming/github
2. Move product and operational files into the staged lane folders
3. Keep the first batch under 15 sources
4. Generate or edit ../manifests/import-manifest.template.json
5. Run the ingest in dry-run mode first

## Notes

- Flag anything oversized, duplicated, or obviously corrupted before import.
- Keep product docs out of the code lane unless they explain implementation behavior.
- If a source does not clearly fit a lane, hold it in review until the operator decides.
`;
}

export function createRepoCorpusContainer(
  input: RepoCorpusContainerInput
): RepoCorpusContainerPlan {
  const plan = buildRepoCorpusContainerPlan(input);

  mkdirSync(plan.containerRoot, { recursive: true });
  for (const directory of plan.directories) {
    mkdirSync(directory, { recursive: true });
  }

  const manifest = createImportManifestTemplate();
  manifest.projectName = plan.name;
  manifest.owner = plan.owner;
  manifest.repoContainer = "..";
  manifest.entries = manifest.entries.map((entry) => ({
    ...entry,
    sourceUri: entry.sourceUri.replace("./", "../")
  }));

  writeFileSync(plan.readmePath, buildReadme(plan), "utf8");
  writeFileSync(plan.reviewPath, buildSeedPlan(plan), "utf8");
  writeFileSync(plan.manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  return plan;
}
