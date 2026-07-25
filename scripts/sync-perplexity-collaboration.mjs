#!/usr/bin/env node
/**
 * Sync canonical repo-state artifacts into `.perplexity/` for outside collaboration.
 *
 * This intentionally treats `docs/` and selected repo-local files as source of
 * truth. `.perplexity/MANIFEST.json` is not overwritten because it describes the
 * Perplexity collaboration package itself; generated repo manifests are written
 * as `.perplexity/REPO_MANIFEST.*`.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const args = new Set(process.argv.slice(2));
const shouldCheck = args.has("--check");
const skipGenerate = args.has("--skip-generate");

const canonicalManifestJson = "docs/gestaltview-v2.manifest.json";
const canonicalManifestMd = "docs/gestaltview-v2.manifest.md";

const syncPairs = [
  ["docs/CurrentState.md", ".perplexity/CurrentState.md"],
  [
    "docs/CurrentState.md",
    ".perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md",
  ],
  [canonicalManifestJson, ".perplexity/REPO_MANIFEST.json"],
  [canonicalManifestMd, ".perplexity/REPO_MANIFEST.md"],
  [
    canonicalManifestJson,
    ".perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json",
  ],
  [
    canonicalManifestMd,
    ".perplexity/perplexity/GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md",
  ],
  ["docs/ContinuityStack.md", ".perplexity/ContinuityStack.md"],
  ["docs/SessionHandoffPacket.md", ".perplexity/SessionHandoffPacket.md"],
  ["docs/Workflows.md", ".perplexity/Workflows.md"],
  ["docs/README-manifest.md", ".perplexity/README-manifest.md"],
  ["README.md", ".perplexity/REPO_README.md"],
  [".agents/skills/CurrentState.md", ".perplexity/agents-skills-CurrentState.md"],
  [".agents/skills/manifest.json", ".perplexity/agents-skills-manifest.json"],
];

function abs(path) {
  return resolve(root, path);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(abs(path))).digest("hex");
}

function ensureParent(path) {
  mkdirSync(dirname(abs(path)), { recursive: true });
}

function generateManifest() {
  if (skipGenerate || shouldCheck) return;

  const result = spawnSync("python3", ["scripts/generate_repo_manifest.py"], {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function copyPairs() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceRoot: root,
    generatedManifestRefreshed: !skipGenerate && !shouldCheck,
    files: [],
  };
  const mismatches = [];

  for (const [source, target] of syncPairs) {
    if (!existsSync(abs(source))) {
      throw new Error(`Missing source file: ${source}`);
    }

    const sourceHash = sha256(source);
    const targetExists = existsSync(abs(target));
    const targetHash = targetExists ? sha256(target) : null;

    if (shouldCheck) {
      if (!targetExists || targetHash !== sourceHash) {
        mismatches.push({ source, target, reason: targetExists ? "hash_mismatch" : "missing_target" });
      }
    } else if (!targetExists || targetHash !== sourceHash) {
      ensureParent(target);
      copyFileSync(abs(source), abs(target));
    }

    manifest.files.push({
      source,
      target,
      sha256: sourceHash,
      inSync: existsSync(abs(target)) && sha256(target) === sourceHash,
    });
  }

  if (shouldCheck) {
    if (mismatches.length > 0) {
      console.error("Perplexity collaboration sync check failed:");
      for (const mismatch of mismatches) {
        console.error(`- ${mismatch.reason}: ${mismatch.source} -> ${mismatch.target}`);
      }
      process.exit(1);
    }
    console.log("Perplexity collaboration sync check passed.");
    return;
  }

  const manifestPath = ".perplexity/SYNC_MANIFEST.json";
  ensureParent(manifestPath);
  writeFileSync(abs(manifestPath), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Synced ${syncPairs.length} collaboration artifacts into .perplexity/.`);
  console.log(`Wrote ${manifestPath}.`);
}

try {
  generateManifest();
  copyPairs();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
