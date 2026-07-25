import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getOnboardingTaskGraph } from "../api/onboarding";
import { themePresets } from "../config/themeEngine";
import { loadAndValidateEnv } from "../scripts/validate-env";

interface VerificationCheck {
  label: string;
  passed: boolean;
  detail: string;
}

function buildChecks(envPath: string): VerificationCheck[] {
  const requiredFiles = [
    "setup/env.example",
    "setup/setup-wizard.html",
    "setup/onboarding-task-graph.json",
    "supabase/seed.sql",
    "supabase/rls-policies.sql",
    "scripts/package-kit.sh",
    "gv.sh",
    "docs/SETUP_GUIDE.md",
    "docs/VOICE_INTEGRATION.md"
  ];

  return requiredFiles.map((relativePath) => {
    const absolutePath = resolve(relativePath);
    return {
      label: relativePath,
      passed: existsSync(absolutePath),
      detail: absolutePath
    };
  }).concat([
    {
      label: "Environment file",
      passed: existsSync(resolve(envPath)),
      detail: resolve(envPath)
    },
    {
      label: "Onboarding task graph",
      passed: getOnboardingTaskGraph().tasks.length > 0,
      detail: `${getOnboardingTaskGraph().tasks.length} shared tasks`
    },
    {
      label: "Theme presets",
      passed: themePresets.length >= 4,
      detail: `${themePresets.length} presets`
    }
  ]);
}

async function main(): Promise<void> {
  const envPath = process.argv[2] ?? ".env.local";

  const { env, sourcePath } = loadAndValidateEnv(envPath);
  const checks = buildChecks(sourcePath);
  const failedChecks = checks.filter((check) => !check.passed);

  console.log("GestaltView Agent Trainer setup report");
  console.log(`- env: ${sourcePath}`);
  console.log(`- kit: ${env.KIT_NAME}`);
  console.log(`- tier: ${env.KIT_TIER}`);
  console.log(`- domain: ${env.KIT_DOMAIN}`);
  console.log(`- embedding dimension: ${env.EMBEDDING_DIMENSION}`);
  console.log(`- onboarding graph: ${getOnboardingTaskGraph().version}`);
  console.log(`- theme presets: ${themePresets.length}`);
  console.log("");

  for (const check of checks) {
    console.log(`${check.passed ? "PASS" : "FAIL"} ${check.label} -> ${check.detail}`);
  }

  if (failedChecks.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("Setup scaffold looks internally consistent.");
  console.log("Next step: run `./gv.sh init`, apply the workspace-first schema, and wire these modules into your runtime.");
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  console.error("Unknown setup verification error.");
  process.exitCode = 1;
});
