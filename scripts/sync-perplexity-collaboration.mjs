#!/usr/bin/env node
/**
 * Sync canonical repo-state artifacts into a provider-neutral collaborator context.
 *
 * This intentionally treats `docs/` and selected repo-local files as source of
 * truth. The context's MANIFEST.json is not overwritten; generated repo
 * manifests are written alongside it as REPO_MANIFEST.*.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const shouldCheck = args.has("--check");
const skipGenerate = args.has("--skip-generate");
const shouldPrintConfig = args.has("--print-config");
const contextRoot = resolve(
  root,
  process.env.GESTALTVIEW_COLLABORATOR_ROOT || ".perplexity",
);

function isPayload(path) {
  if (existsSync(resolve(path, "package.json"))) return true;
  return ["api", "client", "shared", "server"]
    .filter((marker) => existsSync(resolve(path, marker)) && statSync(resolve(path, marker)).isDirectory())
    .length >= 3;
}

function findPayloadRoot() {
  if (isPayload(contextRoot)) return contextRoot;
  const candidates = existsSync(contextRoot)
    ? readdirSync(contextRoot)
      .map((name) => resolve(contextRoot, name))
      .filter((path) => statSync(path).isDirectory() && isPayload(path))
    : [];
  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one repository payload under ${contextRoot}; found ${candidates.length}`);
  }
  return candidates[0];
}

const payloadRoot = findPayloadRoot();
const payloadRelative = relative(contextRoot, payloadRoot);
const contextTarget = (path) => resolve(contextRoot, path);
const payloadTarget = (path) => resolve(payloadRoot, path);

const canonicalManifestJson = "docs/gestaltview-v2.manifest.json";
const canonicalManifestMd = "docs/gestaltview-v2.manifest.md";

const syncPairs = [
  ["docs/CurrentState.md", contextTarget("CurrentState.md")],
  [
    "docs/CurrentState.md",
    payloadTarget("GestaltView-Collaboration-Onboarding-Packet/07_CURRENT_STATE_AND_EVIDENCE/CurrentState.md"),
  ],
  [canonicalManifestJson, contextTarget("REPO_MANIFEST.json")],
  [canonicalManifestMd, contextTarget("REPO_MANIFEST.md")],
  [
    canonicalManifestJson,
    payloadTarget("GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.json"),
  ],
  [
    canonicalManifestMd,
    payloadTarget("GestaltView-Collaboration-Onboarding-Packet/04_RUNTIME_AND_SCHEMA/repo_manifest.md"),
  ],
  ["docs/ContinuityStack.md", contextTarget("ContinuityStack.md")],
  ["docs/SessionHandoffPacket.md", contextTarget("SessionHandoffPacket.md")],
  ["docs/Workflows.md", contextTarget("Workflows.md")],
  ["docs/README-manifest.md", contextTarget("README-manifest.md")],
  ["README.md", contextTarget("REPO_README.md")],
  [".agents/skills/CurrentState.md", contextTarget("agents-skills-CurrentState.md")],
  [".agents/skills/manifest.json", contextTarget("agents-skills-manifest.json")],
];

function abs(path) {
  return resolve(root, path);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(abs(path))).digest("hex");
}

function ensureParent(path) {
  mkdirSync(dirname(path), { recursive: true });
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
    contextContract: "gestaltview.di-context.v1",
    sourceRoot: ".",
    payloadRoot: payloadRelative || ".",
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
      copyFileSync(abs(source), target);
    }

    manifest.files.push({
      source,
      target: relative(contextRoot, target),
      sha256: sourceHash,
      inSync: existsSync(abs(target)) && sha256(target) === sourceHash,
    });
  }

  if (shouldCheck) {
    if (mismatches.length > 0) {
      console.error("Digital Intelligence collaboration sync check failed:");
      for (const mismatch of mismatches) {
        console.error(`- ${mismatch.reason}: ${mismatch.source} -> ${mismatch.target}`);
      }
      process.exit(1);
    }
    console.log("Digital Intelligence collaboration sync check passed.");
    return;
  }

  const manifestPath = contextTarget("SYNC_MANIFEST.json");
  ensureParent(manifestPath);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Synced ${syncPairs.length} collaboration artifacts into ${contextRoot}.`);
  console.log(`Wrote ${manifestPath}.`);
}

try {
  if (shouldPrintConfig) {
    console.log(JSON.stringify({
      contextRoot,
      payloadRoot,
      payloadRelative,
      manifestPath: contextTarget("SYNC_MANIFEST.json"),
    }));
    process.exit(0);
  }
  generateManifest();
  copyPairs();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
