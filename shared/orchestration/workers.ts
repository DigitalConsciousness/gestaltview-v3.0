import type {
  OrchestratedContentKind,
  OrchestralGateState,
  OrchestralWorkerId,
  OrchestrationInput,
} from "./types.js";

export type OrchestralWorkerStatus = "queued" | "running" | "done" | "failed" | "skipped";

export type OrchestralWorker = {
  id: OrchestralWorkerId;
  label: string;
  status: OrchestralWorkerStatus;
  summary: string;
  dependsOn: OrchestralWorkerId[];
};

export type OrchestralWorkerPlan = {
  sourceRoom: string;
  trigger: OrchestrationInput["trigger"];
  contentKind: OrchestratedContentKind;
  spawnMode: OrchestralGateState;
  workers: OrchestralWorker[];
};

export type BuildWorkerPlanInput = {
  sourceRoom: string;
  trigger: OrchestrationInput["trigger"];
  contentKind: OrchestratedContentKind;
  autoSpawn?: boolean;
  gateState?: OrchestralGateState;
  shouldForgeArtifact?: boolean;
  shouldUpdateProfile?: boolean;
  shouldUpdateScaffold?: boolean;
};

function worker(
  id: OrchestralWorkerId,
  label: string,
  summary: string,
  dependsOn: OrchestralWorkerId[] = [],
): OrchestralWorker {
  return { id, label, status: "queued", summary, dependsOn };
}

function normalizeSourceRoom(sourceRoom: string): string {
  return sourceRoom.trim().toLowerCase().replace(/_/g, "-");
}

function readEnvGateState(): OrchestralGateState | null {
  const runtimeProcess = (globalThis as {
    process?: { env?: Record<string, string | undefined> };
  }).process;
  const candidate =
    runtimeProcess?.env?.ORCHESTRATOR_GATE_STATE ??
    runtimeProcess?.env?.VITE_ORCHESTRATOR_GATE_STATE;

  return candidate === "auto" || candidate === "approval" ? candidate : null;
}

export function buildWorkerPlan(input: BuildWorkerPlanInput): OrchestralWorkerPlan {
  const sourceRoom = normalizeSourceRoom(input.sourceRoom);
  const spawnMode =
    input.gateState ?? readEnvGateState() ?? (input.autoSpawn === false ? "approval" : "auto");
  const forgeArtifact = input.shouldForgeArtifact ?? sourceRoom === "creation-corner";
  const updateProfile = Boolean(input.shouldUpdateProfile);
  const updateScaffold = Boolean(input.shouldUpdateScaffold);
  const workers: OrchestralWorker[] = [
    worker(
      "intake",
      "Intake",
      "Preserve the source exactly and establish one canonical execution envelope.",
    ),
    worker(
      "normalization",
      "Normalization",
      "Prepare a processing view without replacing or mutating the original source.",
      ["intake"],
    ),
  ];

  if (updateProfile) {
    workers.push(
      worker(
        "profile_enrichment",
        "Profile enrichment",
        "Extract evidence-backed profile signals and module population candidates.",
        ["normalization"],
      ),
    );
  }

  if (updateScaffold) {
    workers.push(
      worker(
        "scaffold_context",
        "Scaffold contextualization",
        "Resolve context, evidence, module targets, and connections for scaffold candidates.",
        ["normalization"],
      ),
      worker(
        "orb_generation",
        "Orb candidate generation",
        "Shape contextualized signals into inspectable orb candidates without auto-approving them.",
        ["scaffold_context"],
      ),
    );
  }

  if (forgeArtifact) {
    workers.push(
      worker(
        "synthesis",
        "Synthesis contract",
        "Prepare the artifact contract, source boundaries, style, and destination for the forge.",
        ["normalization"],
      ),
      worker(
        "rendering",
        "Rendering contract",
        "Resolve the renderer and export formats required for a finished user-facing artifact.",
        ["synthesis"],
      ),
    );
  }

  const evidenceDependencies = workers
    .filter((entry) => entry.id !== "intake" && entry.id !== "normalization")
    .map((entry) => entry.id);

  workers.push(
    worker(
      "persistence",
      "Persistence receipt",
      "Record execution evidence and durable lineage without silently mutating source material.",
      evidenceDependencies.length > 0 ? evidenceDependencies : ["normalization"],
    ),
    worker(
      "presentation",
      "Presentation gate",
      "Keep raw JSON, metadata dumps, partial HTML, and incoherent repetition out of the visible surface.",
      forgeArtifact ? ["rendering"] : ["normalization"],
    ),
    worker(
      "validation",
      "Validation",
      "Confirm the run is coherent, inspectable, and safe to hand back to the room.",
      ["persistence", "presentation"],
    ),
  );

  return {
    sourceRoom,
    trigger: input.trigger,
    contentKind: input.contentKind,
    spawnMode,
    workers,
  };
}
