import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildOnboardingSupportBundle,
  createOnboardingSession,
  executeOnboardingTask,
  getOnboardingProgress,
  getOnboardingTaskGraph,
  resumeOnboardingSession,
  type OnboardingSessionRecord
} from "../api/onboarding";
import {
  buildImportManifestForPack,
  buildStarterPackRouteRequest,
  buildStarterPackPlan,
  executeStarterPackActivation,
  previewStarterPacks
} from "../api/packs";
import { buildThemeFromBrandColor, getThemePreset, themePresets } from "../config/themeEngine";
import { operatorPacks } from "../config/operatorPacks";
import { sourceBundles } from "../config/sourceBundles";
import { createImportManifestTemplate } from "../config/importTemplates";
import { workspaceReadinessReport } from "../config/trainerBlueprint";
import type { BuyerSegment } from "../config/segments";
import { createRepoCorpusContainer } from "./corpusContainer";
import { loadAndValidateEnv } from "./validate-env";
import {
  formatSessionSummary,
  loadOnboardingSession,
  saveOnboardingSession
} from "./onboardingState";

function readPackageVersion(): string {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const packageJsonPath = resolve(scriptDir, "..", "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    version?: string;
  };

  return packageJson.version ?? "0.0.0";
}

function printHeader(): void {
  console.log(`GV Concierge CLI v${readPackageVersion()}`);
}

function showStatus(): void {
  printHeader();
  console.log("Package posture:");
  console.log("- product center: GestaltView Agent Trainer");
  console.log("- commercial lanes: solo, business, enterprise");
  console.log("- shared onboarding graph: web + CLI");
  console.log("- core lanes: knowledge, code, product, context");
  console.log("- readiness score:", `${workspaceReadinessReport.overallScore}%`);

  const session = loadOnboardingSession();

  if (!session) {
    console.log("");
    console.log("No local onboarding session found. Run `./gv.sh init` or `npm run cli -- init`.");
    return;
  }

  console.log("");
  console.log("Local onboarding session:");
  for (const line of formatSessionSummary(session)) {
    console.log(line);
  }
}

function showPacks(): void {
  printHeader();
  console.log("Starter packs:");

  const previews = previewStarterPacks();

  for (const pack of operatorPacks) {
    const preview = previews.find((entry) => entry.slug === pack.slug);
    console.log(`- ${pack.title} [${pack.kind}]`);
    console.log(`  ${pack.summary}`);
    console.log(`  includes: ${pack.includes.join(", ")}`);
    console.log(`  best for: ${pack.bestFor}`);
    if (preview) {
      console.log(`  seeds skills: ${preview.generatedSkills.length}`);
      console.log(`  seeds memory: ${preview.generatedMemoryKeys.length}`);
      console.log(`  source bundles: ${preview.recommendedSourceBundles.join(", ")}`);
    }
  }
}

function showBundles(): void {
  printHeader();
  console.log("Source bundles:");

  for (const bundle of sourceBundles) {
    console.log(`- ${bundle.title} [${bundle.lane}]`);
    console.log(`  ${bundle.summary}`);
    console.log(`  includes: ${bundle.includes.join(", ")}`);
    console.log(`  best for: ${bundle.bestFor}`);
  }
}

function showMemoryModel(): void {
  printHeader();
  console.log("Persistent memory model:");
  console.log("- user memory: operator-specific continuity and preferences");
  console.log("- shared memory: collaboration continuity across sessions and contributors");
  console.log("- pinned memory: durable truths that must survive wording drift");
  console.log("- unsafe memory: secrets, regulated claims, or low-value noise");
}

function detectProviders(env: ReturnType<typeof loadAndValidateEnv>["env"]): string[] {
  return [
    env.GROQ_API_KEY ? "groq" : null,
    env.OPENAI_API_KEY ? "openai" : null,
    env.GEMINI_API_KEY ? "gemini" : null
  ].filter(Boolean) as string[];
}

function showDoctor(envPath?: string): void {
  printHeader();
  const { env, sourcePath } = loadAndValidateEnv(envPath);
  const providers = detectProviders(env);
  const graph = getOnboardingTaskGraph();
  console.log(`Environment ok: ${sourcePath}`);
  console.log(`- tier: ${env.KIT_TIER}`);
  console.log(`- domain: ${env.KIT_DOMAIN}`);
  console.log(`- embedding: ${env.EMBEDDING_PROVIDER}/${env.EMBEDDING_MODEL}`);
  console.log(`- providers: ${providers.join(", ")}`);
  console.log(`- onboarding graph version: ${graph.version}`);
  console.log(`- tasks in graph: ${graph.tasks.length}`);
}

function showVerify(envPath?: string): void {
  printHeader();
  const { env, sourcePath } = loadAndValidateEnv(envPath);
  console.log("Verification summary:");
  console.log(`- env: ${sourcePath}`);
  console.log(`- kit: ${env.KIT_NAME}`);
  console.log(`- graph: ${getOnboardingTaskGraph().version}`);
  console.log(`- theme presets: ${themePresets.length}`);
  console.log(`- readiness score: ${workspaceReadinessReport.overallScore}%`);
}

function showPlatforms(): void {
  printHeader();
  console.log("Platform support posture:");
  console.log("- shell: use ./gv.sh or npm run gv -- <command>");
  console.log("- windows: use npm run bootstrap:windows");
  console.log("- docker: use docker compose run --rm trainer npm run cli -- status");
  console.log("- browser/iOS: use npm run wizard on a desktop or hosted environment and open /setup/");
}

function showImportTemplate(): void {
  printHeader();
  const template = createImportManifestTemplate();
  console.log(JSON.stringify(template, null, 2));
  console.log("");
  console.log("Fill this manifest with buyer-owned sources only.");
}

function showPlan(packSlug?: string): void {
  printHeader();

  if (!packSlug) {
    console.log("Usage: npm run cli -- plan <pack-slug>");
    return;
  }

  const result = buildStarterPackPlan(packSlug);

  if (!result.data || result.error) {
    console.log(result.error?.message ?? "Unable to build starter pack plan.");
    return;
  }

  console.log(JSON.stringify(result.data, null, 2));
}

function showManifest(
  packSlug?: string,
  projectName?: string,
  owner?: string,
  bundlesCsv?: string
): void {
  printHeader();

  if (!packSlug) {
    console.log("Usage: npm run cli -- manifest <pack-slug> [projectName] [owner] [bundlesCsv]");
    return;
  }

  const selectedBundleSlugs = bundlesCsv
    ? bundlesCsv.split(",").map((bundle) => bundle.trim()).filter(Boolean)
    : undefined;

  const result = buildImportManifestForPack(
    packSlug,
    projectName,
    owner,
    selectedBundleSlugs
  );

  if (!result.data || result.error) {
    console.log(result.error?.message ?? "Unable to build import manifest.");
    return;
  }

  console.log(JSON.stringify(result.data, null, 2));
  console.log("");
  console.log("Fill this manifest with buyer-owned sources only.");
}

async function runApply(
  userId?: string,
  packSlug?: string,
  projectName?: string,
  owner?: string,
  bundlesCsv?: string,
  outputPath?: string
): Promise<void> {
  printHeader();

  if (!userId || !packSlug) {
    console.log(
      "Usage: npm run cli -- apply <userId> <pack-slug> [projectName] [owner] [bundlesCsv] [outputPath]"
    );
    return;
  }

  const { env } = loadAndValidateEnv();
  const selectedBundleSlugs = bundlesCsv
    ? bundlesCsv.split(",").map((bundle) => bundle.trim()).filter(Boolean)
    : undefined;

  const execution = await executeStarterPackActivation(env, {
    userId,
    packSlug,
    projectName,
    owner,
    selectedBundleSlugs
  });

  if (!execution.data || execution.error) {
    console.log(execution.error?.message ?? "Unable to apply starter pack.");
    process.exitCode = 1;
    return;
  }

  console.log("Starter pack applied.");
  console.log(JSON.stringify(execution.data.application, null, 2));
  console.log("");
  console.log("Route payload:");
  console.log(
    JSON.stringify(
      buildStarterPackRouteRequest({
        packSlug,
        userId,
        projectName,
        owner,
        selectedBundleSlugs
      }),
      null,
      2
    )
  );
  console.log("");
  console.log("Buyer-owned import manifest:");
  console.log(JSON.stringify(execution.data.manifest, null, 2));

  if (outputPath) {
    writeFileSync(outputPath, JSON.stringify(execution.data.manifest, null, 2) + "\n", "utf8");
    console.log("");
    console.log(`Wrote ${outputPath}`);
  }
}

function showUsage(): void {
  printHeader();
  console.log("Usage:");
  console.log("  ./gv.sh init [solo|business|enterprise]");
  console.log("  ./gv.sh login <email>");
  console.log("  ./gv.sh workspace create <workspaceName> <agentName> [ownerEmail]");
  console.log("  ./gv.sh doctor [.env.local]");
  console.log("  ./gv.sh verify [.env.local]");
  console.log("  ./gv.sh connect supabase [.env.local]");
  console.log("  ./gv.sh connect provider [.env.local]");
  console.log("  ./gv.sh provider select <provider> [model]");
  console.log("  ./gv.sh repo stage <owner/repo> [defaultBranch] [outputRoot]");
  console.log("  ./gv.sh theme select <preset-id|#brandColor>");
  console.log("  ./gv.sh import start");
  console.log("  ./gv.sh import review ./buyer-import.template.json [reviewMode] [batchCount]");
  console.log("  ./gv.sh import manifest ./buyer-import.template.json");
  console.log("  ./gv.sh eval run [readinessScore] [benchmarkCount]");
  console.log("  ./gv.sh publish [target] [readinessScore]");
  console.log("  ./gv.sh resume");
  console.log("  ./gv.sh handoff [outputPath]");
  console.log("");
  console.log("  npm run cli -- status");
  console.log("  npm run cli -- packs");
  console.log("  npm run cli -- bundles");
  console.log("  npm run cli -- memory");
  console.log("  npm run cli -- platforms");
  console.log("  npm run cli -- import-template");
  console.log("  npm run cli -- plan <pack-slug>");
  console.log("  npm run cli -- manifest <pack-slug> [projectName] [owner] [bundlesCsv]");
  console.log(
    "  npm run cli -- apply <userId> <pack-slug> [projectName] [owner] [bundlesCsv] [outputPath]"
  );
}

function loadRequiredSession(): OnboardingSessionRecord {
  const session = loadOnboardingSession();

  if (!session) {
    throw new Error("No onboarding session found. Run `./gv.sh init` first.");
  }

  return session;
}

function saveAndPrintSession(session: OnboardingSessionRecord): void {
  const sessionPath = saveOnboardingSession(session);
  console.log(`Session saved: ${sessionPath}`);
  for (const line of formatSessionSummary(session)) {
    console.log(line);
  }
}

function initializeSession(segmentArg?: string): void {
  printHeader();
  const requestedSegment = ["solo", "business", "enterprise"].includes(segmentArg ?? "")
    ? (segmentArg as BuyerSegment)
    : undefined;
  const session = createOnboardingSession({
    entryMode: "cli",
    segment: requestedSegment
  });
  const seededProfileBySegment: Record<BuyerSegment, Record<string, unknown>> = {
    solo: {
      teamSize: 1,
      sourceVolume: 20,
      deploymentPreference: "hosted"
    },
    business: {
      teamSize: 6,
      sourceVolume: 160,
      deploymentPreference: "hybrid"
    },
    enterprise: {
      teamSize: 40,
      needsCompliance: true,
      multiWorkspace: true,
      identityBoundary: true,
      sourceVolume: 1000,
      deploymentPreference: "private"
    }
  };
  const initializedSession = requestedSegment
    ? executeOnboardingTask(session, "recommend_segment", seededProfileBySegment[requestedSegment]).session
    : session;

  console.log(`Created onboarding session for ${initializedSession.segmentRecommendation}.`);
  if (requestedSegment) {
    console.log(`- segment confirmed from init: ${requestedSegment}`);
  }
  saveAndPrintSession(initializedSession);
}

function loginOperator(email?: string): void {
  printHeader();

  if (!email) {
    console.log("Usage: ./gv.sh login <email>");
    return;
  }

  const session = loadRequiredSession();
  const updatedSession: OnboardingSessionRecord = {
    ...session,
    metadata: {
      ...(session.metadata ?? {}),
      operatorEmail: email,
      authStatus: "captured"
    }
  };

  console.log(`Captured operator identity for ${email}.`);
  saveAndPrintSession(updatedSession);
}

function createWorkspaceCommand(
  workspaceName?: string,
  agentName?: string,
  ownerEmail?: string
): void {
  if (!workspaceName || !agentName) {
    printHeader();
    console.log("Usage: ./gv.sh workspace create <workspaceName> <agentName> [ownerEmail]");
    return;
  }

  executeTask("create_workspace", {
    workspace_name: workspaceName,
    agent_name: agentName,
    owner_email: ownerEmail ?? ""
  });
}

function executeTask(
  taskKey: string,
  input: Record<string, unknown>
){
  printHeader();
  const session = loadRequiredSession();

  if (!session.tasks.some((task) => task.taskKey === taskKey)) {
    console.log(`Task ${taskKey} is not part of the ${session.segmentRecommendation} track.`);
    return null;
  }

  const result = executeOnboardingTask(session, taskKey, input);
  console.log(result.task.summary);
  if (result.task.error) {
    console.log(`- error: ${JSON.stringify(result.task.error)}`);
  }
  if (result.nextTaskKeys.length > 0) {
    console.log(`- next: ${result.nextTaskKeys.join(", ")}`);
  }
  saveAndPrintSession(result.session);
  return result;
}

function connectSupabase(envPath?: string): void {
  const { env } = loadAndValidateEnv(envPath);
  executeTask("connect_supabase", {
    project_url: env.NEXT_PUBLIC_SUPABASE_URL,
    anon_key: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service_role_key: env.SUPABASE_SERVICE_ROLE_KEY
  });
}

function connectProvider(envPath?: string): void {
  const { env } = loadAndValidateEnv(envPath);
  const provider = detectProviders(env)[0];
  executeTask("connect_provider", {
    provider,
    model:
      provider === "openai"
        ? "gpt-4.1-mini"
        : provider === "gemini"
          ? "gemini-pro"
          : "llama-3.3-70b-versatile",
    api_key_present: Boolean(provider)
  });
}

function selectProvider(provider?: string, model?: string): void {
  if (!provider) {
    printHeader();
    console.log("Usage: ./gv.sh provider select <provider> [model]");
    return;
  }

  executeTask("connect_provider", {
    provider,
    model: model ?? "default",
    api_key_present: true
  });
}

function selectTheme(value?: string): void {
  if (!value) {
    printHeader();
    console.log("Usage: ./gv.sh theme select <preset-id|#brandColor>");
    console.log(`Available presets: ${themePresets.map((preset) => preset.id).join(", ")}`);
    return;
  }

  const preset = getThemePreset(value);
  const theme = value.startsWith("#") ? buildThemeFromBrandColor("CLI Theme", value) : null;

  executeTask("select_theme", preset
    ? { preset_id: preset.id }
    : theme
      ? { brand_color: value }
      : { preset_id: value });
}

function startImport(): void {
  printHeader();
  const session = loadRequiredSession();
  console.log("Import flow opened.");
  console.log(
    `Next step: review the manifest first with ./gv.sh import review ./buyer-import.template.json, then import the approved first batch for ${session.segmentRecommendation}.`
  );
}

function stageRepoContainer(repository?: string, defaultBranch?: string, outputRoot?: string): void {
  if (!repository) {
    printHeader();
    console.log("Usage: ./gv.sh repo stage <owner/repo> [defaultBranch] [outputRoot]");
    return;
  }

  const plan = createRepoCorpusContainer({
    repository,
    defaultBranch,
    baseDir: outputRoot
  });

  const result = executeTask("stage_corpus_container", {
    repository: `${plan.owner}/${plan.name}`,
    default_branch: plan.defaultBranch,
    corpus_container: plan.containerRoot,
    staging_mode: "github_repo"
  });

  if (!result) {
    return;
  }

  console.log(`- container: ${plan.containerRoot}`);
  console.log(`- manifest: ${plan.manifestPath}`);
  console.log(`- review plan: ${plan.reviewPath}`);
}

function reviewImport(manifestPath?: string, reviewMode?: string, batchCountArg?: string): void {
  if (!manifestPath) {
    printHeader();
    console.log("Usage: ./gv.sh import review ./buyer-import.template.json [reviewMode] [batchCount]");
    return;
  }

  const absolutePath = resolve(manifestPath);

  if (!existsSync(absolutePath)) {
    printHeader();
    console.log(`Manifest not found: ${absolutePath}`);
    process.exitCode = 1;
    return;
  }

  const manifest = JSON.parse(readFileSync(absolutePath, "utf8")) as {
    entries?: Array<{ lane?: string; sourceType?: string; sourceUri?: string }>;
  };
  const manifestDirectory = dirname(absolutePath);
  const entries = manifest.entries ?? [];
  const laneAssignments = entries.reduce<Record<string, number>>((accumulator, entry) => {
    const lane = entry.lane ?? "knowledge";
    accumulator[lane] = (accumulator[lane] ?? 0) + 1;
    return accumulator;
  }, {});
  const oversizedSourceCount = entries.reduce((count, entry) => {
    if (entry.sourceType !== "file" || !entry.sourceUri) {
      return count;
    }

    const sourcePath = resolve(manifestDirectory, entry.sourceUri);
    if (!existsSync(sourcePath)) {
      return count;
    }

    return statSync(sourcePath).size > 15 * 1024 * 1024 ? count + 1 : count;
  }, 0);
  const batchCount =
    Number(batchCountArg ?? 0) || Math.max(1, Math.ceil(Math.max(entries.length, 1) / 12));

  executeTask("review_sources", {
    review_mode: reviewMode ?? "operator-guided",
    source_count: entries.length,
    batch_count: batchCount,
    lane_assignments: laneAssignments,
    oversized_source_count: oversizedSourceCount
  });
}

function importManifest(manifestPath?: string): void {
  if (!manifestPath) {
    printHeader();
    console.log("Usage: ./gv.sh import manifest ./buyer-import.template.json");
    return;
  }

  const absolutePath = resolve(manifestPath);

  if (!existsSync(absolutePath)) {
    printHeader();
    console.log(`Manifest not found: ${absolutePath}`);
    process.exitCode = 1;
    return;
  }

  const manifest = JSON.parse(readFileSync(absolutePath, "utf8")) as {
    entries?: Array<{ lane?: string }>;
  };

  const laneAssignments = (manifest.entries ?? []).reduce<Record<string, number>>(
    (accumulator, entry) => {
      const lane = entry.lane ?? "knowledge";
      accumulator[lane] = (accumulator[lane] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  executeTask("import_corpus", {
    import_mode: "manifest",
    manifest_path: absolutePath,
    source_count: manifest.entries?.length ?? 0,
    lane_assignments: laneAssignments,
    batch_count: Math.max(1, Math.ceil(Math.max(manifest.entries?.length ?? 0, 1) / 12))
  });
}

function chooseLaneFocus(lane?: string): void {
  executeTask("choose_lane_focus", { lane_focus: lane ?? "knowledge" });
}

function runEval(readinessScore?: string, benchmarkCount?: string): void {
  executeTask("run_evals", {
    workspace_readiness_score: Number(readinessScore ?? workspaceReadinessReport.overallScore),
    benchmark_count: Number(benchmarkCount ?? 5),
    activation_milestones: workspaceReadinessReport.activationMilestones
  });
}

function publish(target?: string, readinessScore?: string): void {
  executeTask("publish_agent", {
    publish_target: target ?? "shareable-assistant",
    readiness_score: Number(readinessScore ?? workspaceReadinessReport.overallScore)
  });
}

function resumeSession(): void {
  printHeader();
  const session = loadRequiredSession();
  const nextTask = resumeOnboardingSession(session);
  const progress = getOnboardingProgress(session);

  if (!nextTask) {
    console.log("All onboarding tasks are complete.");
    return;
  }

  console.log(`Next task: ${nextTask.taskKey}`);
  console.log(`- status: ${nextTask.status}`);
  console.log(`- summary: ${nextTask.summary}`);
  console.log(`- completed: ${progress.completedTaskCount}/${progress.totalTaskCount}`);
}

function handoff(outputPath?: string): void {
  printHeader();
  const session = loadRequiredSession();
  const bundle = buildOnboardingSupportBundle(session);
  const targetPath = outputPath ? resolve(outputPath) : resolve(".gsvw", "support-bundle.json");
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, JSON.stringify(bundle, null, 2) + "\n", "utf8");
  console.log(`Support bundle written to ${targetPath}`);
}

async function main(): Promise<void> {
  const [command, arg1, arg2, arg3, arg4, arg5, arg6] = process.argv.slice(2);

  switch (command) {
    case "status":
      showStatus();
      return;
    case "init":
      initializeSession(arg1);
      return;
    case "login":
      loginOperator(arg1);
      return;
    case "workspace":
      if (arg1 === "create") {
        createWorkspaceCommand(arg2, arg3, arg4);
        return;
      }
      showUsage();
      return;
    case "doctor":
      showDoctor(arg1);
      return;
    case "verify":
      showVerify(arg1);
      return;
    case "connect":
      if (arg1 === "supabase") {
        connectSupabase(arg2);
        return;
      }
      if (arg1 === "provider") {
        connectProvider(arg2);
        return;
      }
      showUsage();
      return;
    case "repo":
      if (arg1 === "stage") {
        stageRepoContainer(arg2, arg3, arg4);
        return;
      }
      showUsage();
      return;
    case "provider":
      if (arg1 === "select") {
        selectProvider(arg2, arg3);
        return;
      }
      showUsage();
      return;
    case "theme":
      if (arg1 === "select") {
        selectTheme(arg2);
        return;
      }
      showUsage();
      return;
    case "import":
      if (arg1 === "start") {
        startImport();
        return;
      }
      if (arg1 === "review") {
        reviewImport(arg2, arg3, arg4);
        return;
      }
      if (arg1 === "manifest") {
        importManifest(arg2);
        return;
      }
      showUsage();
      return;
    case "lane":
      if (arg1 === "focus") {
        chooseLaneFocus(arg2);
        return;
      }
      showUsage();
      return;
    case "eval":
      if (arg1 === "run") {
        runEval(arg2, arg3);
        return;
      }
      showUsage();
      return;
    case "publish":
      publish(arg1, arg2);
      return;
    case "resume":
      resumeSession();
      return;
    case "handoff":
      handoff(arg1);
      return;
    case "packs":
      showPacks();
      return;
    case "bundles":
      showBundles();
      return;
    case "memory":
      showMemoryModel();
      return;
    case "platforms":
      showPlatforms();
      return;
    case "import-template":
      showImportTemplate();
      return;
    case "plan":
      showPlan(arg1);
      return;
    case "manifest":
      showManifest(arg1, arg2, arg3, arg4);
      return;
    case "apply":
      await runApply(arg1, arg2, arg3, arg4, arg5, arg6);
      return;
    default:
      showUsage();
  }
}

void main();
