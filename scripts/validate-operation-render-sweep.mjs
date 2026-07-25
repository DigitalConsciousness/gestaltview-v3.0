import { access, readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");

const requiredFiles = [
  "client/src/styles/operation-render.css",
  "client/src/components/ui/GlassCard.tsx",
  "client/src/components/LoadingSpinner.tsx",
  "client/src/components/operation-render/VisibleReasoningTrace.tsx",
  "client/src/components/operation-render/VoiceReadinessPanel.tsx",
  "client/src/components/operation-render/index.ts",
  "shared/operation-render/contracts.ts",
  "shared/operation-render/policies.ts",
  "supabase/migrations/202607080001_operation_render_reasoning_voice.sql",
  "docs/operation-render/runtime-page-audit.md",
  "docs/operation-render/dependency-audit.md",
  "docs/operation-render/acceptance-checklist.md",
];

const contentChecks = [
  {
    file: "client/src/components/ui/GlassCard.tsx",
    tokens: ["surfaceRole", "operation-render-focus", "operation-render-surface-artifact"],
  },
  {
    file: "client/src/components/LoadingSpinner.tsx",
    tokens: ["operation-render-shell", "operation-render-surface-active"],
  },
  {
    file: "client/src/pages/VoicePage.tsx",
    tokens: ["VoiceReadinessPanel", "operation-render-shell"],
  },
  {
    file: "shared/operation-render/contracts.ts",
    tokens: ["embodimentReasoningPolicySchema", "visibleReasoningTraceSchema", "voiceProfileSchema", "offlineCaptureItemSchema"],
  },
  {
    file: "shared/operation-render/policies.ts",
    tokens: ["resolveReasoningPolicy", "resolveVoiceProfile", "Never expose raw hidden chain-of-thought"],
  },
  {
    file: "supabase/migrations/202607080001_operation_render_reasoning_voice.sql",
    tokens: ["operation_render_audits", "embodiment_reasoning_policies", "visible_reasoning_cards", "field_continuity_events"],
  },
];

async function fileExists(relativePath) {
  await access(path.join(repoRoot, relativePath));
}

async function fileContains(relativePath, tokens) {
  const content = await readFile(path.join(repoRoot, relativePath), "utf8");
  const missing = tokens.filter((token) => !content.includes(token));
  if (missing.length > 0) {
    throw new Error(`${relativePath} is missing expected token(s): ${missing.join(", ")}`);
  }
}

async function main() {
  const failures = [];

  for (const relativePath of requiredFiles) {
    try {
      await fileExists(relativePath);
    } catch {
      failures.push(`Missing required file: ${relativePath}`);
    }
  }

  for (const check of contentChecks) {
    try {
      await fileContains(check.file, check.tokens);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (failures.length > 0) {
    console.error("Operation Render sweep validation failed:\n");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Operation Render sweep validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
