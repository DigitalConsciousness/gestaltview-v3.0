import { forwardRef, type ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Factory,
  FileCode2,
  FileUp,
  GitBranch,
  LoaderCircle,
  Network,
  PlayCircle,
  RefreshCcw,
  Rocket,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";


import { useAuth } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getEmbodimentPersistenceStatus,
  listEmbodimentMutationProposals,
  listEmbodimentReadinessScores,
  recordEmbodimentReview,
  saveEmbodimentReadinessScore,
  submitEmbodimentMutationProposal,
  type EmbodimentMutationProposalRecord,
  type EmbodimentMutationRiskLevel,
  type EmbodimentMutationStatus,
  type EmbodimentReadinessScoreRecord,
} from "@/lib/embodimentPersistence";
import {
  getEmbodimentGovernanceSummary,
  getEmbodimentUIPresence,
  getProfileBySlug,
} from "@/lib/embodimentRuntime";
import { cn } from "@/lib/utils";
import {
  EmbodimentBadge,
  GovernanceStatusBar,
  PrivateInteriorSeal,
} from "@/components/embodiment";
import { EmbodimentCompilerPanel } from "@/features/agent-trainer/EmbodimentCompilerPanel";
import {
  TRAINER_EMBODIMENT_OPTIONS,
  inferTrainerEmbodimentSlug,
  type TrainerEmbodimentSlug,
} from "@shared/agent-trainer/embodiment";
import type { SubmitTrainingRunRequest, TrainingRunDetail } from "@shared/agent-trainer/schemas";


import { ExperimentRegistry } from "./ExperimentRegistry";
import { ReviewQueuePanel } from "./ReviewQueuePanel";
import AgentFlowRail from "@/components/agent-trainer/AgentFlowRail";
import { useTrainerGovernance } from "./hooks/useTrainerGovernance";
import { useTrainingRun } from "./hooks/useTrainingRun";
import {
  buildManualStudyPacketManifest,
  buildManualStudyPacketZip,
  createManualStudySourceFromFile,
  readManualStudyPacket,
  readTrainerWorkspaceDraft,
  readManualStudySources,
  summarizeManualStudyPacket,
  type ManualStudySource,
  writeManualStudySources,
  writeTrainerWorkspaceDraft,
} from "./lib/manualStudyPacket";
import {
  listTrainerConnectors,
  listTrainerMemorySurfaces,
  listTrainerSkills,
} from "./lib/trainerApi";


const STATUS_STYLES: Record<string, string> = {
  queued: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  running: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
  awaiting_review: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  failed: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  cancelled: "border-zinc-500/40 bg-zinc-500/10 text-zinc-200",
  leased: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  retry_wait: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
};

type TrainerStage = "collect" | "compile" | "synthesize" | "export";

const TRAINER_STAGE_DEFINITIONS: Array<{
  key: TrainerStage;
  label: string;
  description: string;
  whyHref: string;
}> = [
  {
    key: "collect",
    label: "Collect Sources",
    description: "Load local packets, inspect uploaded files, and keep the source list offline-first.",
    whyHref: "/START_HERE.md#collect-sources",
  },
  {
    key: "compile",
    label: "Compile Profile",
    description: "Shape the base embodiment profile and scaffold the markdown artifact.",
    whyHref: "/START_HERE.md#compile-profile",
  },
  {
    key: "synthesize",
    label: "Synthesize & Layer",
    description: "Add memories, quirks, cadence, and PLK notes in layered passes.",
    whyHref: "/START_HERE.md#synthesize-layer",
  },
  {
    key: "export",
    label: "Export & Deploy",
    description: "Package the manual study packet, review warnings, and hand off to the runtime.",
    whyHref: "/START_HERE.md#export-deploy",
  },
];

const usePersistenceAdapter = import.meta.env.VITE_TRAINER_USE_PERSISTENCE_ADAPTER !== "false";

const DEFAULT_FOUNDER_ADMIN_EMAILS = ["keithsoyka@gmail.com"];
const MANUAL_STUDY_SOURCE_MAX_CHARS = 24000;
const MANUAL_STUDY_SOURCE_PACKET_BUDGET = 3000;
const STUDY_FOCUS_SCHEMA_SAFE_LIMIT = 3900;
const MANUAL_STUDY_SOURCE_PACKET_MARKER = "MANUAL SOURCE OVERRIDE PACKET";
const DEFAULT_MUTATION_TARGET_PATH = (slug: string) => `embodiment_profiles/${slug}.embodiment.json`;
const STAGE_WEIGHTS: Record<string, number> = {
  normalize: 5,
  curriculum: 10,
  scenario_expand: 15,
  author: 25,
  evaluate: 25,
  critique: 12,
  safety: 8,
  package: 10,
};
const ACTIVE_STATUSES = new Set(["queued", "running", "awaiting_review"]);
const QUEUE_MUTABLE_STATUSES = new Set(["queued", "awaiting_review", "cancelled"]);

interface HyperagentConnector {
  id: string;
  slug: string;
  displayName: string;
  kind: string;
  active: boolean;
}

interface HyperagentSkill {
  id: string;
  slug: string;
  category: string;
  defaultConnectorId: string | null;
}

interface HyperagentMemorySurface {
  surfaceKind: string;
  surfaceId: string;
  label: string;
  tags: string[];
}


const TRAINER_TEMPLATES = [
  {
    id: "operator",
    label: "Operator",
    description: "Internal execution partner for specs, plans, and safe escalation.",
    slug: "agent-trainer-prototype",
    title: "Agent Trainer Prototype",
    domain: "operations",
    embodimentProfileSlug: "the-weaver",
    goal:
      "Create and refine an internal GestaltView operator agent that can turn specs into reliable, auditable execution plans.",
    targetBehaviors:
      "deterministic output, concise reasoning, safe escalation, founder-aware prioritization",
    antiGoals: "inventing authority, vague strategy, unsupported claims",
    studyFocus:
      "Prioritize founder operating context, PLK, manifest-level execution principles, and direct operational usefulness over generic agent boilerplate.",
  },
  {
    id: "billy-guide",
    label: "Billy Guide",
    description: "Retrieval-grounded Billy helper for orientation, continuity, and context handoff.",
    slug: "billy-founder-guide",
    title: "Billy Founder Guide",
    domain: "companion",
    embodimentProfileSlug: "billy",
    goal:
      "Train a Billy-adjacent guide agent that can orient founders, summarize current state, and preserve thread continuity without flattening voice.",
    targetBehaviors: "warm orientation, thread continuity, grounded synthesis, exact scope discipline",
    antiGoals: "generic therapy language, invented memory, overconfident product claims",
    studyFocus:
      "Prioritize Billy collaboration patterns, context spine continuity, bucket drops, PLK, and voice fidelity without drifting into therapist-script language.",
  },
  {
    id: "memory-care",
    label: "Memory Care",
    description: "Review-first companion for Alzheimer's legacy and family memory support.",
    slug: "memory-care-companion",
    title: "Memory Care Companion",
    domain: "memory-care",
    embodimentProfileSlug: "billy",
    goal:
      "Train a review-first memory-care companion that stays warm, unhurried, and scoped to family legacy, heirloom companion, and bucket-drop workflows.",
    targetBehaviors: "gentle tone, explicit echo labeling, family-safe boundaries, zero correction pressure",
    antiGoals: "clinical overreach, false reassurance, unlabeled persona simulation",
    studyFocus:
      "Prioritize family-safe memory workflows, heirloom companion boundaries, bucket-drop handling, and Alzheimer's legacy context over generic wellness advice.",
  },
] as const;


const TRAINER_LIFECYCLE_STAGES = [
  {
    key: "queued",
    title: "Queued",
    detail: "Run is recorded and waiting for a worker lease or a manual start action.",
    Icon: Clock3,
  },
  {
    key: "running",
    title: "Running",
    detail: "A worker has the job and is moving through authoring, critique, safety, and package steps.",
    Icon: Activity,
  },
  {
    key: "evaluating",
    title: "Evaluating",
    detail: "Evaluation and safety checks are underway inside the active run pipeline.",
    Icon: ShieldCheck,
  },
  {
    key: "approved",
    title: "Approved",
    detail: "The candidate reached the review gate and is waiting for founder/admin approval.",
    Icon: CheckCircle2,
  },
  {
    key: "stored",
    title: "Stored",
    detail: "Deployment and artifact persistence are complete; the run is no longer active.",
    Icon: FileCode2,
  },
] as const;


function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}


function getFounderAdminEmails(): string[] {
  const configured = (import.meta.env.VITE_FOUNDER_ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);


  return configured.length > 0 ? configured : DEFAULT_FOUNDER_ADMIN_EMAILS;
}


function hasFounderTrainerAccess(email: string | null | undefined): boolean {
  if (!email) return false;
  return getFounderAdminEmails().includes(normalizeEmail(email));
}


function splitCsv(input: string): string[] {
  return input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function stripManualStudySourcePacket(value: string): string {
  const markerIndex = value.indexOf(MANUAL_STUDY_SOURCE_PACKET_MARKER);
  if (markerIndex === -1) {
    return value.trim();
  }

  return value.slice(0, markerIndex).replace(/\n-{3,}\s*$/m, "").trim();
}

function buildManualStudySourcePacket(sources: readonly ManualStudySource[]): string {
  if (sources.length === 0) {
    return "";
  }

  const lines = [
    "---",
    MANUAL_STUDY_SOURCE_PACKET_MARKER,
    "Backend source APIs are degraded; use these local/manual materials as the study-source fallback for this run.",
  ];
  let remaining = MANUAL_STUDY_SOURCE_PACKET_BUDGET - lines.join("\n").length;

  for (const source of sources) {
    if (remaining <= 180) {
      lines.push("[Additional manual sources omitted from inline focus; export packet keeps the full local text.]");
      break;
    }

    const header = [
      "",
      `### ${source.name}`,
      `Imported: ${source.importedAt} · ${source.size} bytes${source.truncated ? " · stored excerpt" : ""}`,
      "---",
    ].join("\n");
    const excerptLength = Math.max(0, remaining - header.length - 80);
    const excerpt = source.text.slice(0, excerptLength).trim();

    lines.push(header, excerpt);
    remaining = MANUAL_STUDY_SOURCE_PACKET_BUDGET - lines.join("\n").length;
  }

  return lines.join("\n").slice(0, MANUAL_STUDY_SOURCE_PACKET_BUDGET).trim();
}

function mergeManualSourcesIntoStudyFocus(baseValue: string, sources: readonly ManualStudySource[]): string {
  const packet = buildManualStudySourcePacket(sources);
  const base = stripManualStudySourcePacket(baseValue);
  if (!packet) {
    return base.slice(0, STUDY_FOCUS_SCHEMA_SAFE_LIMIT);
  }

  const separatorLength = base ? 2 : 0;
  const baseBudget = Math.max(0, STUDY_FOCUS_SCHEMA_SAFE_LIMIT - packet.length - separatorLength);
  const trimmedBase = base.slice(0, baseBudget).trim();

  return [trimmedBase, packet].filter(Boolean).join("\n\n").slice(0, STUDY_FOCUS_SCHEMA_SAFE_LIMIT);
}

function titleCaseStatus(status: string) {
  return status.replace(/_/g, " ");
}

function titleCaseRuntimeState(status: string) {
  return status.replace(/_/g, " ");
}

function runtimeStateBadgeClass(status: string) {
  if (status === "healthy") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  if (status === "auth_unavailable_but_fail_open") return "border-amber-500/40 bg-amber-500/10 text-amber-200";
  if (status === "saved_locally_pending_sync") return "border-cyan-500/40 bg-cyan-500/10 text-cyan-200";
  return "border-amber-500/40 bg-amber-500/10 text-amber-200";
}


function statusBadge(status: string | null | undefined) {
  const resolvedStatus = status ?? "queued";
  return (
    <Badge className={cn("border", STATUS_STYLES[resolvedStatus] || STATUS_STYLES.completed)} variant="outline">
      {titleCaseStatus(resolvedStatus)}
    </Badge>
  );
}


function averageScore(run: TrainingRunDetail | null): string {
  const evalResults = Array.isArray(run?.evalResults) ? run.evalResults : [];
  if (evalResults.length === 0) return "n/a";
  const total = evalResults.reduce((sum, result) => sum + result.overallScore, 0);
  return (total / evalResults.length).toFixed(2);
}


function RunStatusIcon({ status }: { status: string }) {
  if (status === "queued") return <Clock3 className="size-4" />;
  if (status === "running") return <Activity className="size-4" />;
  if (status === "awaiting_review") return <ShieldCheck className="size-4" />;
  if (status === "failed" || status === "rejected") return <XCircle className="size-4" />;
  return <CheckCircle2 className="size-4" />;
}


function describeElapsed(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return "unknown";
  }


  const createdAt = new Date(isoDate).getTime();
  if (!Number.isFinite(createdAt)) {
    return "unknown";
  }


  const deltaMs = Math.max(0, Date.now() - createdAt);
  const seconds = Math.floor(deltaMs / 1000);
  if (seconds < 60) return `${seconds}s`;


  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;


  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;


  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}


function describeFreshness(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return "no heartbeat yet";
  }


  const delta = Date.now() - new Date(isoDate).getTime();
  if (!Number.isFinite(delta)) {
    return "no heartbeat yet";
  }


  if (delta <= 15_000) return "fresh";
  if (delta <= 60_000) return `stale by ${Math.floor(delta / 1000)}s`;
  return `stale by ${describeElapsed(new Date(Date.now() - delta).toISOString())}`;
}

function formatCompactDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "date unknown";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}


function computeRunProgress(run: TrainingRunDetail | null): number {
  if (!run) return 0;
  if (run.status === "completed") return 100;
  if (run.status === "awaiting_review") return 100;


  const steps = Array.isArray(run.steps) ? run.steps : [];
  const byStage = new Map<string, string>();
  for (const step of steps) {
    byStage.set(step.stage, step.status);
  }


  let progress = 0;
  for (const [stage, weight] of Object.entries(STAGE_WEIGHTS)) {
    const status = byStage.get(stage);
    if (status === "completed" || status === "skipped") {
      progress += weight;
    } else if (status === "running") {
      progress += weight * 0.5;
    }
  }


  return Math.max(0, Math.min(100, Math.round(progress)));
}


function isSubmitBlockerRun(
  blocker: { reason: string; detail?: string } | { reason: string; detail?: string; runId: string; status: string; createdAt: string }
): blocker is { reason: string; detail?: string; runId: string; status: string; createdAt: string } {
  return (
    "runId" in blocker &&
    typeof blocker.runId === "string" &&
    "status" in blocker &&
    typeof blocker.status === "string" &&
    "createdAt" in blocker &&
    typeof blocker.createdAt === "string"
  );
}


function explainRunBlock(run: TrainingRunDetail | null, hasGovernanceAccess: boolean): string {
  if (!run) {
    return "Select a run to inspect its queue and review state.";
  }


  if (run.job?.cancelRequested) {
    return "Admin requested cancellation. The worker will stop after the current stage settles.";
  }


  if (run.blockedReason) {
    return run.blockedReason;
  }


  if (run.status === "awaiting_review") {
    return hasGovernanceAccess
      ? "Admin review is required before this version can be promoted or deployed."
      : "Admin review is required to unblock this run.";
  }


  if (run.status === "queued") {
    return "Queued and waiting for an online worker claim or explicit manual execution.";
  }


  if (run.status === "running") {
    return "Worker has claimed the job and is updating stage state.";
  }


  if (run.status === "failed") {
    return run.lastEventMessage ?? "Run failed. Inspect the latest event and retry or purge if needed.";
  }


  return "Run is not currently blocked.";
}


interface UncontrolledTextareaProps extends Omit<ComponentProps<"textarea">, "value" | "onChange"> {
  onCommit?: (value: string) => void;
}


const UncontrolledTextarea = forwardRef<HTMLTextAreaElement, UncontrolledTextareaProps>(
  function UncontrolledTextarea({ onCommit, className, onBlur, ...props }, ref) {
    return (
      <Textarea
        ref={ref}
        className={className}
        onBlur={(event) => {
          onCommit?.(event.currentTarget.value);
          onBlur?.(event);
        }}
        {...props}
      />
    );
  }
);


UncontrolledTextarea.displayName = "UncontrolledTextarea";


export default function AgentTrainerPage() {
  const { isAuthenticated, isAdmin, isLoading, session, user } = useAuth();
  const hasAuthToken = Boolean(session?.access_token);
  const hasTrainerAccess = isAdmin || hasFounderTrainerAccess(user?.email);
  const hasGovernanceAccess = hasTrainerAccess;
  const isDev = import.meta.env.DEV;
  const persistedWorkspace = useMemo(
    () => (usePersistenceAdapter ? readTrainerWorkspaceDraft() : null),
    []
  );
  const [activeStage, setActiveStage] = useState<TrainerStage>(
    () => (persistedWorkspace?.activeStage as TrainerStage) ?? "collect"
  );
  const [showAdvanced, setShowAdvanced] = useState(
    () => persistedWorkspace?.showAdvanced ?? false
  );
  const trainerAuthHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    const accessToken = session?.access_token;

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  }, [session?.access_token]);

  const [activeExperimentId, setActiveExperimentId] = useState<string | null>(
    persistedWorkspace?.activeExperimentId ?? null
  );
  const [slug, setSlug] = useState(persistedWorkspace?.slug ?? "agent-trainer-prototype");
  const [title, setTitle] = useState(persistedWorkspace?.title ?? "Agent Trainer Prototype");
  const [domain, setDomain] = useState(persistedWorkspace?.domain ?? "operations");
  const [embodimentProfileSlug, setEmbodimentProfileSlug] = useState<TrainerEmbodimentSlug>(() =>
    persistedWorkspace?.embodimentProfileSlug &&
    TRAINER_EMBODIMENT_OPTIONS.some((profile) => profile.slug === persistedWorkspace.embodimentProfileSlug)
      ? (persistedWorkspace.embodimentProfileSlug as TrainerEmbodimentSlug)
      : inferTrainerEmbodimentSlug("operations")
  );
  const [goalText, setGoalText] = useState(
    persistedWorkspace?.goal ??
      "Create and refine an internal GestaltView operator agent that can turn specs into reliable, auditable execution plans."
  );
  const [targetBehaviorsText, setTargetBehaviorsText] = useState(
    persistedWorkspace?.targetBehaviors ??
      "deterministic output, concise reasoning, safe escalation, founder-aware prioritization"
  );
  const [antiGoalsText, setAntiGoalsText] = useState(
    persistedWorkspace?.antiGoals ?? "inventing authority, vague strategy, unsupported claims"
  );
  const [studyFocusText, setStudyFocusText] = useState(persistedWorkspace?.studyFocus ?? "");
  const [maxCycles, setMaxCycles] = useState(persistedWorkspace?.maxCycles ?? "3");
  const [qualityThreshold, setQualityThreshold] = useState(persistedWorkspace?.qualityThreshold ?? "4");
  const [draftingProvider, setDraftingProvider] = useState("auto");
  const [evaluationProvider, setEvaluationProvider] = useState("auto");
  const [selectedScenarioSetIds, setSelectedScenarioSetIds] = useState<string[]>(
    persistedWorkspace?.selectedScenarioSetIds ?? []
  );
  const [selectedStudySourceFiles, setSelectedStudySourceFiles] = useState<string[]>(
    persistedWorkspace?.selectedStudySourceFiles ?? []
  );
  const [manualStudySources, setManualStudySources] = useState<ManualStudySource[]>(() =>
    usePersistenceAdapter ? readManualStudySources() : []
  );
  const [selectedManualSourceId, setSelectedManualSourceId] = useState<string | null>(
    () => persistedWorkspace?.selectedStudySourceFiles?.[0] ?? null
  );
  const [deployOnApprove, setDeployOnApprove] = useState(true);
  const [deployPath, setDeployPath] = useState("");
  const [mutationTargetPath, setMutationTargetPath] = useState(
    DEFAULT_MUTATION_TARGET_PATH(embodimentProfileSlug)
  );
  const [mutationCurrentValue, setMutationCurrentValue] = useState("");
  const [mutationProposedValue, setMutationProposedValue] = useState("");
  const [mutationClass, setMutationClass] = useState("profile_patch");
  const [mutationRiskLevel, setMutationRiskLevel] =
    useState<EmbodimentMutationRiskLevel>("medium");
  const [mutationStatus, setMutationStatus] =
    useState<EmbodimentMutationStatus>("proposed");
  const [mutationReviewNotes, setMutationReviewNotes] = useState("");
  const [readinessScoreInput, setReadinessScoreInput] = useState("75");
  const [readinessSource, setReadinessSource] = useState("trainer-ui");
  const [readinessRationale, setReadinessRationale] = useState("");
  const [mutationProposals, setMutationProposals] = useState<EmbodimentMutationProposalRecord[]>([]);
  const [readinessScores, setReadinessScores] = useState<EmbodimentReadinessScoreRecord[]>([]);
  const [connectors, setConnectors] = useState<HyperagentConnector[]>([]);
  const [trainerSkills, setTrainerSkills] = useState<HyperagentSkill[]>([]);
  const [memorySurfaces, setMemorySurfaces] = useState<HyperagentMemorySurface[]>([]);

  const trainer = useTrainingRun({
    authHeaders: trainerAuthHeaders,
    enabled: !isLoading && isAuthenticated && hasAuthToken && hasTrainerAccess,
    manualStudySources,
  });
  const governance = useTrainerGovernance({
    authHeaders: trainerAuthHeaders,
    enabled: !isLoading && isAuthenticated && hasAuthToken && hasGovernanceAccess,
  });

  const goalRef = useRef<HTMLTextAreaElement>(null);
  const targetBehaviorsRef = useRef<HTMLTextAreaElement>(null);
  const antiGoalsRef = useRef<HTMLTextAreaElement>(null);
  const studyFocusRef = useRef<HTMLTextAreaElement>(null);
  const manualSourceToolsRef = useRef<HTMLDivElement>(null);
  const manualPacketImportInputRef = useRef<HTMLInputElement>(null);

  function syncStudyFocusValue(value: string) {
    setStudyFocusText(value);
    if (studyFocusRef.current) {
      studyFocusRef.current.value = value;
    }
  }

  function focusManualSourceTools() {
    manualSourceToolsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openManualPacketImport() {
    manualPacketImportInputRef.current?.click();
  }

  function parsePossiblyJson(value: string): unknown {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  useEffect(() => {
    if (!usePersistenceAdapter) {
      return;
    }

    writeManualStudySources(manualStudySources);
    writeTrainerWorkspaceDraft({
      slug,
      title,
      domain,
      embodimentProfileSlug,
      goal: goalText,
      targetBehaviors: targetBehaviorsText,
      antiGoals: antiGoalsText,
      studyFocus: studyFocusText,
      maxCycles,
      qualityThreshold,
      selectedScenarioSetIds,
      selectedStudySourceFiles,
      activeExperimentId,
      activeStage,
      showAdvanced,
    });
  }, [
    activeExperimentId,
    activeStage,
    antiGoalsText,
    domain,
    embodimentProfileSlug,
    goalText,
    manualStudySources,
    maxCycles,
    qualityThreshold,
    selectedScenarioSetIds,
    selectedStudySourceFiles,
    showAdvanced,
    slug,
    studyFocusText,
    targetBehaviorsText,
    title,
  ]);

  useEffect(() => {
    if (manualStudySources.length === 0) {
      if (selectedManualSourceId !== null) {
        setSelectedManualSourceId(null);
      }
      return;
    }

    if (!manualStudySources.some((source) => source.id === selectedManualSourceId)) {
      setSelectedManualSourceId(manualStudySources[0].id);
    }
  }, [manualStudySources, selectedManualSourceId]);

  async function refreshEmbodimentPersistence() {
    const accessToken = session?.access_token ?? null;
    const [proposalRecords, readinessRecords] = await Promise.all([
      listEmbodimentMutationProposals(selectedEmbodiment.slug, { accessToken }),
      listEmbodimentReadinessScores(selectedEmbodiment.slug, { accessToken }),
    ]);
    setMutationProposals(proposalRecords);
    setReadinessScores(readinessRecords);
  }

  async function handleSubmitMutationProposal() {
    if (!mutationTargetPath.trim()) {
      toast.error("Mutation target path is required.");
      return;
    }

    const accessToken = session?.access_token ?? null;
    await submitEmbodimentMutationProposal(
      {
        agentSlug: selectedEmbodiment.slug,
        targetPath: mutationTargetPath.trim(),
        currentValue: parsePossiblyJson(mutationCurrentValue),
        proposedValue: parsePossiblyJson(mutationProposedValue),
        mutationClass: mutationClass.trim() || "profile_patch",
        riskLevel: mutationRiskLevel,
        status: mutationStatus,
        reviewNotes: mutationReviewNotes.trim() || null,
        submittedBy: user?.id ?? null,
      },
      { accessToken }
    );
    await refreshEmbodimentPersistence();
    toast.success("Mutation proposal recorded.");
  }

  async function handleSaveReadinessScore() {
    const parsedScore = Number(readinessScoreInput) / 100;
    if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 1) {
      toast.error("Readiness score must be between 0 and 100.");
      return;
    }

    const accessToken = session?.access_token ?? null;
    await saveEmbodimentReadinessScore(
      {
        agentSlug: selectedEmbodiment.slug,
        readinessScore: parsedScore,
        readinessSource: readinessSource.trim() || "trainer-ui",
        readinessRationale: readinessRationale.trim() || null,
        recordedBy: user?.id ?? null,
      },
      { accessToken }
    );
    await refreshEmbodimentPersistence();
    toast.success("Readiness score saved.");
  }

  async function handleReviewProposal(
    proposal: EmbodimentMutationProposalRecord,
    reviewDecision: "approved" | "rejected"
  ) {
    const accessToken = session?.access_token ?? null;
    await recordEmbodimentReview(
      {
        proposalId: proposal.id,
        agentSlug: proposal.agentSlug,
        reviewDecision,
        reviewNotes: mutationReviewNotes.trim() || null,
        reviewedBy: user?.id ?? null,
      },
      { accessToken }
    );
    setMutationProposals((previous) =>
      previous.map((item) =>
        item.id === proposal.id
              ? {
              ...item,
              status: reviewDecision,
              reviewedBy: user?.id ?? item.reviewedBy ?? null,
              reviewNotes: mutationReviewNotes.trim() || item.reviewNotes || null,
              reviewedAt: new Date().toISOString(),
            }
          : item
      )
    );
    toast.success(`Proposal ${reviewDecision}.`);
  }


  const selectedEmbodiment = useMemo(
    () =>
      TRAINER_EMBODIMENT_OPTIONS.find((profile) => profile.slug === embodimentProfileSlug) ??
      TRAINER_EMBODIMENT_OPTIONS[0],
    [embodimentProfileSlug]
  );
  const selectedEmbodimentProfile = useMemo(
    () => getProfileBySlug(selectedEmbodiment.slug),
    [selectedEmbodiment.slug]
  );
  const selectedEmbodimentPresence = useMemo(
    () =>
      selectedEmbodimentProfile
        ? getEmbodimentUIPresence(selectedEmbodimentProfile)
        : null,
    [selectedEmbodimentProfile]
  );
  const selectedEmbodimentGovernance = useMemo(
    () =>
      selectedEmbodimentProfile
        ? getEmbodimentGovernanceSummary(selectedEmbodimentProfile)
        : null,
    [selectedEmbodimentProfile]
  );
  const embodimentPersistenceStatus = useMemo(() => getEmbodimentPersistenceStatus(), []);
  useEffect(() => {
    setMutationTargetPath(DEFAULT_MUTATION_TARGET_PATH(selectedEmbodiment.slug));
    setReadinessScoreInput(
      String(Math.round((selectedEmbodimentProfile?.readinessScore ?? 0.75) * 100))
    );
  }, [selectedEmbodiment.slug, selectedEmbodimentProfile?.readinessScore]);

  useEffect(() => {
    let cancelled = false;
    const accessToken = session?.access_token ?? null;

    void Promise.all([
      listEmbodimentMutationProposals(selectedEmbodiment.slug, { accessToken }),
      listEmbodimentReadinessScores(selectedEmbodiment.slug, { accessToken }),
    ])
      .then(([proposalRecords, readinessRecords]) => {
        if (cancelled) return;
        setMutationProposals(proposalRecords);
        setReadinessScores(readinessRecords);
      })
      .catch(() => {
        if (cancelled) return;
        setMutationProposals([]);
        setReadinessScores([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedEmbodiment.slug, session?.access_token]);

  const personhood = trainer.personhood;
  const currentRun = trainer.currentRun;
  const latestVersion = currentRun?.latestVersion ?? null;
  const trainerDiagnostic = trainer.diagnostic;
  const selectedManualSource = useMemo(
    () => manualStudySources.find((source) => source.id === selectedManualSourceId) ?? manualStudySources[0] ?? null,
    [manualStudySources, selectedManualSourceId]
  );
  const activeRuns = useMemo(
    () => trainer.runs.filter((run) => ACTIVE_STATUSES.has(run.status)),
    [trainer.runs]
  );
  const historyRuns = useMemo(
    () => trainer.runs.filter((run) => !ACTIVE_STATUSES.has(run.status)),
    [trainer.runs]
  );
  const canDeploy = Boolean(
    latestVersion &&
    (latestVersion.status === "approved" ||
      currentRun?.approvals.at(-1)?.decision === "approved")
  );
  const draftPayload = useMemo(
    () => ({
      slug,
      title,
      domain,
      experimentId: activeExperimentId ?? undefined,
      embodimentProfileSlug,
      goal: goalText,
      targetBehaviors: splitCsv(targetBehaviorsText),
      antiGoals: splitCsv(antiGoalsText),
      scenarioSetIds: selectedScenarioSetIds,
      studySourceFiles: selectedStudySourceFiles,
      studyFocus: mergeManualSourcesIntoStudyFocus(studyFocusText, manualStudySources),
      maxCycles: Number(maxCycles) || 3,
      qualityThreshold: Number(qualityThreshold) || 4,
      routingPolicy: {
        preferLocal: draftingProvider !== "groq",
        allowRemoteFallback: true,
        maxSchemaFailuresPerStage: 2,
        preferredProviders: {
          drafting: draftingProvider === "auto" ? undefined : (draftingProvider as "ollama" | "groq"),
          evaluation:
            evaluationProvider === "auto" ? undefined : (evaluationProvider as "ollama" | "groq"),
        },
      },
      promptSetVersion: "trainer-v2-embodiment",
      datasetVersion: "dataset-v1",
      rubricVersion: "default-agent-rubric",
    }),
    [
      activeExperimentId,
      antiGoalsText,
      domain,
      draftingProvider,
      embodimentProfileSlug,
      evaluationProvider,
      goalText,
      manualStudySources,
      maxCycles,
      qualityThreshold,
      selectedScenarioSetIds,
      selectedStudySourceFiles,
      slug,
      studyFocusText,
      targetBehaviorsText,
      title,
    ]
  );


  useEffect(() => {
    if (!hasTrainerAccess || !hasAuthToken) {
      return;
    }


    const timeoutId = window.setTimeout(() => {
      void trainer.loadRecommendations(draftPayload);
    }, 250);


    return () => window.clearTimeout(timeoutId);


  }, [draftPayload, hasAuthToken, hasTrainerAccess, trainer.loadRecommendations]);

  useEffect(() => {
    if (!hasGovernanceAccess || !hasAuthToken) {
      setConnectors([]);
      setTrainerSkills([]);
      setMemorySurfaces([]);
      return;
    }

    let cancelled = false;
    const headers = trainerAuthHeaders;

    void Promise.all([
      listTrainerConnectors(headers),
      listTrainerSkills(headers),
      listTrainerMemorySurfaces(headers),
    ]).then(([connectorsResult, skillsResult, surfacesResult]) => {
      if (cancelled) return;
      setConnectors(connectorsResult);
      setTrainerSkills(skillsResult);
      setMemorySurfaces(surfacesResult);
    }).catch(() => {
      if (cancelled) return;
      setConnectors([]);
      setTrainerSkills([]);
      setMemorySurfaces([]);
    });

    return () => {
      cancelled = true;
    };
  }, [hasAuthToken, hasGovernanceAccess, trainerAuthHeaders]);


  useEffect(() => {
    if (!trainer.lastReceipt) {
      return;
    }


    toast.success(trainer.lastReceipt.message, { id: "trainer-receipt" });


  }, [trainer.lastReceipt]);


  useEffect(() => {
    if (!trainer.error) {
      return;
    }


    toast.error(trainer.error, { id: "trainer-error" });


  }, [trainer.error]);


  useEffect(() => {
    if (!currentRun?.experimentId || !hasGovernanceAccess) {
      return;
    }


    void governance.loadExperiment(currentRun.experimentId);


  }, [currentRun?.experimentId, governance.loadExperiment, hasGovernanceAccess]);


  function syncLongformRefs(values: {
    goal: string;
    targetBehaviors: string;
    antiGoals: string;
    studyFocus: string;
  }) {
    if (goalRef.current) goalRef.current.value = values.goal;
    if (targetBehaviorsRef.current) targetBehaviorsRef.current.value = values.targetBehaviors;
    if (antiGoalsRef.current) antiGoalsRef.current.value = values.antiGoals;
    if (studyFocusRef.current) studyFocusRef.current.value = values.studyFocus;
  }


  function applyTemplate(templateId: (typeof TRAINER_TEMPLATES)[number]["id"]) {
    const template = TRAINER_TEMPLATES.find((entry) => entry.id === templateId);
    if (!template) return;


    setSlug(template.slug);
    setTitle(template.title);
    setDomain(template.domain);
    setEmbodimentProfileSlug(template.embodimentProfileSlug);
    setGoalText(template.goal);
    setTargetBehaviorsText(template.targetBehaviors);
    setAntiGoalsText(template.antiGoals);
    setStudyFocusText(template.studyFocus);
    setActiveExperimentId(null);
    setSelectedScenarioSetIds([]);
    setSelectedStudySourceFiles([]);
    setManualStudySources([]);


    syncLongformRefs({
      goal: template.goal,
      targetBehaviors: template.targetBehaviors,
      antiGoals: template.antiGoals,
      studyFocus: template.studyFocus,
    });
  }


  function applyExperimentToRunForm(experiment: any) {
    setActiveExperimentId(experiment.id);
    setSlug(experiment.slug);
    setTitle(experiment.title);
    setDomain(experiment.domain ?? "operations");
    setEmbodimentProfileSlug(
      experiment.embodimentProfileSlug &&
        TRAINER_EMBODIMENT_OPTIONS.some((profile) => profile.slug === experiment.embodimentProfileSlug)
        ? (experiment.embodimentProfileSlug as TrainerEmbodimentSlug)
        : inferTrainerEmbodimentSlug(experiment.domain ?? "operations")
    );
    setGoalText(experiment.goal ?? "");
    setTargetBehaviorsText((experiment.targetBehaviors ?? []).join(", "));
    setAntiGoalsText((experiment.antiGoals ?? []).join(", "));
    setStudyFocusText(experiment.studyFocus ?? "");
    setManualStudySources([]);


    syncLongformRefs({
      goal: experiment.goal ?? "",
      targetBehaviors: (experiment.targetBehaviors ?? []).join(", "),
      antiGoals: (experiment.antiGoals ?? []).join(", "),
      studyFocus: experiment.studyFocus ?? "",
    });
  }


  async function handleSubmit() {
    const mergedStudyFocus = mergeManualSourcesIntoStudyFocus(
      studyFocusRef.current?.value ?? studyFocusText,
      manualStudySources
    );
    const payload: SubmitTrainingRunRequest = {
      ...draftPayload,
      goal: goalRef.current?.value ?? goalText,
      targetBehaviors: splitCsv(targetBehaviorsRef.current?.value ?? targetBehaviorsText),
      antiGoals: splitCsv(antiGoalsRef.current?.value ?? antiGoalsText),
      studyFocus: mergedStudyFocus,
    };


    setGoalText(payload.goal);
    setTargetBehaviorsText(payload.targetBehaviors.join(", "));
    setAntiGoalsText(payload.antiGoals.join(", "));
    syncStudyFocusValue(payload.studyFocus);
    await trainer.submitRun(payload);
  }


  async function handleManualStudySourceFile(file: File | null) {
    if (!file) {
      return;
    }

    try {
      const text = (await file.text()).replace(/\r\n/g, "\n").trim();
      if (!text) {
        toast.error("Manual study source is empty.", { id: "trainer-manual-source" });
        return;
      }

      const nextSource = createManualStudySourceFromFile(file, text.slice(0, MANUAL_STUDY_SOURCE_MAX_CHARS));
      const nextSources = [...manualStudySources, nextSource];
      const nextStudyFocus = mergeManualSourcesIntoStudyFocus(
        studyFocusRef.current?.value ?? studyFocusText,
        nextSources
      );

      setManualStudySources(nextSources);
      setSelectedManualSourceId(nextSource.id);
      syncStudyFocusValue(nextStudyFocus);

      toast.success("Manual study source added to this run.", { id: "trainer-manual-source" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to read manual study source.",
        { id: "trainer-manual-source" }
      );
    }
  }

  function handleRemoveManualStudySource(sourceId: string) {
    const nextSources = manualStudySources.filter((source) => source.id !== sourceId);
    setManualStudySources(nextSources);
    syncStudyFocusValue(
      mergeManualSourcesIntoStudyFocus(studyFocusRef.current?.value ?? studyFocusText, nextSources)
    );
  }

  function buildManualTrainerPacket() {
    const payload: SubmitTrainingRunRequest = {
      ...draftPayload,
      goal: goalRef.current?.value ?? goalText,
      targetBehaviors: splitCsv(targetBehaviorsRef.current?.value ?? targetBehaviorsText),
      antiGoals: splitCsv(antiGoalsRef.current?.value ?? antiGoalsText),
      studyFocus: mergeManualSourcesIntoStudyFocus(
        studyFocusRef.current?.value ?? studyFocusText,
        manualStudySources
      ),
    };

    return {
      manifest: buildManualStudyPacketManifest(
        title || payload.title,
        "Manual study packet exported from the trainer control plane.",
        manualStudySources,
        Array.from(new Set(manualStudySources.flatMap((source) => source.tags))).slice(0, 12)
      ),
      draft: payload,
      manualSources: manualStudySources,
    };
  }

  function handleExportManualPacket() {
    const packet = buildManualTrainerPacket();
    const safeSlug = packet.draft.slug.replace(/[^a-z0-9._-]+/gi, "-") || "agent-training-run";
    const blob = buildManualStudyPacketZip(packet);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeSlug}-manual-study-packet.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Manual trainer packet exported as ZIP.", { id: "trainer-manual-source" });
  }

  async function handleImportManualPacket(file: File | null) {
    if (!file) {
      return;
    }

    try {
      const parsed = await readManualStudyPacket(file);
      const draft = parsed.draft ?? null;
      const importedSources = Array.isArray(parsed.manualSources)
        ? parsed.manualSources.filter((source): source is ManualStudySource => Boolean(source && typeof source === "object"))
        : [];

      if (draft) {
        if (typeof draft.slug === "string") setSlug(draft.slug);
        if (typeof draft.title === "string") setTitle(draft.title);
        if (typeof draft.domain === "string") setDomain(draft.domain);
        if (
          typeof draft.embodimentProfileSlug === "string" &&
          TRAINER_EMBODIMENT_OPTIONS.some((profile) => profile.slug === draft.embodimentProfileSlug)
        ) {
          setEmbodimentProfileSlug(draft.embodimentProfileSlug as TrainerEmbodimentSlug);
        }
        if (typeof draft.goal === "string") setGoalText(draft.goal);
        if (Array.isArray(draft.targetBehaviors)) setTargetBehaviorsText(draft.targetBehaviors.join(", "));
        if (Array.isArray(draft.antiGoals)) setAntiGoalsText(draft.antiGoals.join(", "));
        if (Array.isArray(draft.scenarioSetIds)) setSelectedScenarioSetIds(draft.scenarioSetIds);
        if (Array.isArray(draft.studySourceFiles)) setSelectedStudySourceFiles(draft.studySourceFiles);
        if (typeof draft.maxCycles === "number") setMaxCycles(String(draft.maxCycles));
        if (typeof draft.qualityThreshold === "number") setQualityThreshold(String(draft.qualityThreshold));
      }

      const baseStudyFocus =
        draft && typeof draft.studyFocus === "string"
          ? stripManualStudySourcePacket(draft.studyFocus)
          : stripManualStudySourcePacket(studyFocusRef.current?.value ?? studyFocusText);
      const nextStudyFocus = mergeManualSourcesIntoStudyFocus(baseStudyFocus, importedSources);
      setManualStudySources(importedSources);
      setSelectedManualSourceId(importedSources[0]?.id ?? null);
      syncStudyFocusValue(nextStudyFocus);
      syncLongformRefs({
        goal: typeof draft?.goal === "string" ? draft.goal : goalText,
        targetBehaviors: Array.isArray(draft?.targetBehaviors) ? draft.targetBehaviors.join(", ") : targetBehaviorsText,
        antiGoals: Array.isArray(draft?.antiGoals) ? draft.antiGoals.join(", ") : antiGoalsText,
        studyFocus: nextStudyFocus,
      });

      toast.success("Manual trainer packet imported.", { id: "trainer-manual-source" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import manual trainer packet.",
        { id: "trainer-manual-source" }
      );
    }
  }


  async function handleReviewDecision(
    decision: "approved" | "rejected" | "hold" | "promote_kit",
    payload: {
      runId?: string;
      versionId?: string;
      coherenceScore?: number | null;
      safetyScore?: number | null;
      emotionalPostureScore?: number | null;
      overIdRisk?: "none" | "low" | "medium" | "high" | null;
      notes: string;
      deployOnApprove?: boolean;
      storagePath?: string;
    }
  ) {
    const {
      deployOnApprove: shouldDeployOnApprove,
      storagePath,
      ...reviewPayload
    } = payload;


    if (
      currentRun?.experimentId &&
      governance.selectedExperiment?.id === currentRun.experimentId
    ) {
      await governance.createReview(currentRun.experimentId, {
        ...reviewPayload,
        decision,
      });
    }


    const targetRunId = reviewPayload.runId ?? currentRun?.runId;
    const targetVersionId = reviewPayload.versionId ?? currentRun?.latestVersion?.versionId;
    if (!targetRunId || !targetVersionId) {
      return;
    }


    if (decision === "approved" || decision === "promote_kit") {
      await trainer.approveRun(targetRunId, targetVersionId, reviewPayload.notes);
      if (shouldDeployOnApprove) {
        await trainer.deployRun(
          targetRunId,
          targetVersionId,
          storagePath?.trim() || undefined
        );
      }
      return;
    }


    if (decision === "rejected") {
      await trainer.rejectRun(targetRunId, targetVersionId, reviewPayload.notes);
    }
  }


  async function handleQueueDeletion(mode: "delete" | "purge") {
    if (!currentRun) {
      return;
    }


    const confirmed = window.confirm(
      mode === "purge"
        ? `Purge run ${currentRun.runId}? This permanently deletes the run, job, artifacts, approvals, and generated trainer records.`
        : `Cancel run ${currentRun.runId}? This removes queued work immediately or marks the run cancelled if it was still queue-mutable.`
    );
    if (!confirmed) {
      return;
    }


    if (mode === "purge") {
      await trainer.purgeRun(currentRun.runId);
      return;
    }


    await trainer.cancelRun(currentRun.runId);
  }


  async function handlePurgeCancelledRuns() {
    const cancelledRuns = historyRuns.filter((run) => run.status === "cancelled");
    if (cancelledRuns.length === 0) {
      return;
    }


    const confirmed = window.confirm(
      `Purge ${cancelledRuns.length} cancelled run${cancelledRuns.length === 1 ? "" : "s"} from history?`
    );
    if (!confirmed) {
      return;
    }


    for (const run of cancelledRuns) {
      // Sequential purge keeps state transitions deterministic and easier to follow.
      // eslint-disable-next-line no-await-in-loop
      await trainer.purgeRun(run.runId);
    }
  }


  const blockedExplanation = explainRunBlock(currentRun, hasGovernanceAccess);
  const runProgress = computeRunProgress(currentRun);
  const queueHealth = trainer.queueHealth;
  const reviewExperiment =
    currentRun?.experimentId && governance.selectedExperiment?.id === currentRun.experimentId
      ? governance.selectedExperiment
      : null;
  const personhoodStatusLabel = personhood
    ? personhood.libraryStatus === "ready"
      ? "Knowledge corpus ready"
      : personhood.libraryStatus === "migration_required"
        ? "Knowledge corpus pending migration"
        : "Knowledge corpus unavailable"
    : "Knowledge corpus loading";


  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <NavBar />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/" className="flex items-center gap-1 hover:text-slate-300">
              <ArrowLeft className="size-4" />
              Back to GestaltView
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-300">
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            ) : null}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Agent Trainer Workbench</h1>
            <p className="mt-1 text-sm text-slate-400">
              Focused surface for shaping runs, reviewing derived embodiment artifacts, and keeping study-source selection traceable.
            </p>
          </div>


          <div className="flex flex-wrap items-center gap-2">
            {statusBadge(currentRun?.status || "queued")}
            <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200">
              {activeRuns.length} active
            </Badge>
            <Badge variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200">
              {historyRuns.length} history
            </Badge>
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
              {manualStudySources.length} local sources
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowAdvanced((current: boolean) => !current)}
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800/70"
            >
              {showAdvanced ? "Hide" : "Show"} advanced
            </Button>
            {isDev ? (
              <Link href="/agent-trainer/dev-cli">
                <a className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Dev CLI
                </a>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Trainer flow</p>
          <div className="flex flex-wrap gap-2">
            {TRAINER_STAGE_DEFINITIONS.map((stage) => (
              <button
                key={stage.key}
                type="button"
                onClick={() => setActiveStage(stage.key)}
                className={cn(
                  "rounded-full border px-3 py-2 text-left transition-colors",
                  activeStage === stage.key
                    ? "border-cyan-400/40 bg-cyan-400/10 text-white"
                    : "border-slate-700/50 bg-slate-950/40 text-slate-300 hover:bg-slate-900/60"
                )}
              >
                <span className="text-sm font-semibold">{stage.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            {TRAINER_STAGE_DEFINITIONS.find((stage) => stage.key === activeStage)?.description ??
              "Define intent, inspect local sources, and queue the run with an explicit receipt."}
            {" "}
            <a
              href={TRAINER_STAGE_DEFINITIONS.find((stage) => stage.key === activeStage)?.whyHref ?? "/START_HERE.md"}
              className="underline underline-offset-2 hover:text-slate-300"
            >
              Read guide
            </a>
          </p>
          <AgentFlowRail />
        </div>


        {!isAuthenticated || !hasAuthToken ? (
          <Card className="border-amber-500/20 bg-slate-950/70">
            <CardHeader>
              <CardTitle>Authentication required</CardTitle>
              <CardDescription>
                Sign in with a founder or admin account to access the trainer control plane.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : !hasTrainerAccess ? (
          <Card className="border-rose-500/20 bg-slate-950/70">
            <CardHeader>
              <CardTitle>Access restricted</CardTitle>
              <CardDescription>
                The trainer control plane is available to admin and founder-allowlist accounts only.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-cyan-100">Manual packet shortcuts</CardTitle>
                <CardDescription className="text-cyan-100/80">
                  Jump straight to the local fallback tools when the remote trainer path is degraded.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                  onClick={focusManualSourceTools}
                >
                  <ArrowLeft className="mr-2 size-3.5 rotate-90" />
                  Jump to tools
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                  onClick={handleExportManualPacket}
                >
                  <Download className="mr-2 size-3.5" />
                  Export packet
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                  onClick={openManualPacketImport}
                >
                  <Upload className="mr-2 size-3.5" />
                  Import packet
                </Button>
                <input
                  ref={manualPacketImportInputRef}
                  type="file"
                  accept=".zip,.json,application/zip,application/json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    void handleImportManualPacket(file);
                    event.target.value = "";
                  }}
                />
              </CardContent>
            </Card>

            {trainer.lastReceipt ? (
              <Card className="border-emerald-500/20 bg-emerald-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-emerald-100">Latest receipt</CardTitle>
                  <CardDescription className="text-emerald-100/80">
                    {trainer.lastReceipt.message}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : null}


            {trainer.submitBlocker ? (
              <Card className="border-amber-500/30 bg-amber-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-amber-100">Run blocked</CardTitle>
                  <CardDescription className="text-amber-100/80">
                    {trainer.submitBlocker.reason}
                  </CardDescription>
                </CardHeader>
                {isSubmitBlockerRun(trainer.submitBlocker) ? (
                  <CardContent className="text-xs text-amber-100/80">
                    Blocking run: <span className="font-mono">{trainer.submitBlocker.runId}</span> ·{" "}
                    {titleCaseStatus(trainer.submitBlocker.status)} · started {describeElapsed(trainer.submitBlocker.createdAt)} ago
                  </CardContent>
                ) : trainer.submitBlocker.detail ? (
                  <CardContent className="text-xs text-amber-100/80">
                    {trainer.submitBlocker.detail}
                  </CardContent>
                ) : null}
              </Card>
            ) : null}


            {trainerDiagnostic ? (
              <Card className="border-rose-500/30 bg-rose-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-rose-100">Last trainer fetch diagnostic</CardTitle>
                  <CardDescription className="text-rose-100/80">
                    {trainer.error ??
                      "A trainer request failed before a normal API response came back."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-xs text-rose-100/85 sm:grid-cols-2">
                  <p>
                    Request <span className="font-mono">{trainerDiagnostic.method}</span>{" "}
                    <span className="font-mono">{trainerDiagnostic.requestPath}</span>
                  </p>
                  <p>Auth header {trainerDiagnostic.authHeaderPresent ? "present" : "missing"}</p>
                  <p>
                    Browser {trainerDiagnostic.online === null ? "state unknown" : trainerDiagnostic.online ? "online" : "offline"}
                  </p>
                  <p>
                    Visibility {trainerDiagnostic.visibilityState ?? "unknown"}
                  </p>
                  <p className="sm:col-span-2">
                    Route <span className="font-mono">{trainerDiagnostic.locationPathname ?? "unknown"}</span>
                  </p>
                  {trainerDiagnostic.cause ? (
                    <p className="sm:col-span-2">
                      Browser cause <span className="font-mono">{trainerDiagnostic.cause}</span>
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}


            {trainer.runtimeState !== "healthy" || trainer.recommendationsError ? (
              <Card className="border-amber-500/30 bg-amber-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-amber-100">
                    <AlertTriangle className="size-4" />
                    Trainer runtime degraded
                  </CardTitle>
                  <CardDescription className="text-amber-100/80">
                    {trainer.recommendationsError ??
                      "Remote services are cooling down after repeated failures. Manual source packets remain usable while the browser cache stays in charge."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge
                    variant="outline"
                    className={cn("border", runtimeStateBadgeClass(trainer.runtimeState))}
                  >
                    {titleCaseRuntimeState(trainer.runtimeState)}
                  </Badge>
                  <p className="text-xs leading-6 text-amber-100/75">
                    Prepare a manual study packet, keep the source list local, and use the export bundle if you need to move work between sessions.{" "}
                    <a href="/START_HERE.md" className="underline underline-offset-2 hover:text-amber-50">
                      How to prepare a manual study packet
                    </a>
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/20"
                    onClick={focusManualSourceTools}
                  >
                    Open manual packet tools
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            <EmbodimentCompilerPanel
              authHeaders={trainerAuthHeaders}
              selectedExperiment={governance.selectedExperiment}
              groqConfigured={Boolean(
                import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROK_API_KEY
              )}
            />


            {hasGovernanceAccess ? (
              <ExperimentRegistry
                experiments={governance.experiments}
                selectedExperiment={governance.selectedExperiment}
                isLoading={governance.isLoading}
                isMutating={governance.isMutating}
                error={governance.error}
                onCreateExperiment={async (payload) => {
                  await governance.createExperiment(payload);
                }}
                onSelectExperiment={async (experimentId) => {
                  await governance.loadExperiment(experimentId);
                }}
                onStartTrainingRun={applyExperimentToRunForm}
                onAttachSource={async (experimentId, payload) => {
                  await governance.attachSource(experimentId, payload);
                }}
                onCreateFlag={async (experimentId, payload) => {
                  await governance.createFlag(experimentId, payload);
                }}
                onUpdateExperiment={async (experimentId, payload) => {
                  await governance.updateExperiment(experimentId, payload);
                }}
              />
            ) : null}

            {showAdvanced && hasGovernanceAccess ? (
              <div className="grid gap-4 xl:grid-cols-3">
                <Card className="border-slate-700/50 bg-slate-900/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Network className="size-4 text-cyan-300" />
                      Connectors
                    </CardTitle>
                    <CardDescription>Hyperagent connector catalog used by trainer experiments.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {connectors.slice(0, 6).map((connector) => (
                      <div key={connector.id} className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-2">
                        <p className="font-medium text-slate-100">{connector.displayName}</p>
                        <p className="text-slate-400">{connector.kind} · {connector.active ? "active" : "disabled"}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="border-slate-700/50 bg-slate-900/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <GitBranch className="size-4 text-violet-300" />
                      Skill Graph
                    </CardTitle>
                    <CardDescription>Trainer skills available for hyperagent routing plans.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {trainerSkills.slice(0, 6).map((skill) => (
                      <div key={skill.id} className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-2">
                        <p className="font-medium text-slate-100">{skill.slug}</p>
                        <p className="text-slate-400">{skill.category}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="border-slate-700/50 bg-slate-900/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Database className="size-4 text-amber-300" />
                      Memory Field
                    </CardTitle>
                    <CardDescription>Unioned memory surfaces exposed to hyperagent runs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {memorySurfaces.slice(0, 6).map((surface) => (
                      <div key={`${surface.surfaceKind}:${surface.surfaceId}`} className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-2">
                        <p className="font-medium text-slate-100">{surface.label}</p>
                        <p className="text-slate-400">{surface.surfaceKind}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {showAdvanced && hasGovernanceAccess ? (
              <Card className="border-slate-700/50 bg-slate-900/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Factory className="size-4 text-emerald-300" />
                    Embodiment Lifecycle
                  </CardTitle>
                  <CardDescription>Builder → Grower → Pruner → Birth governance strip for trainer operations.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Builder", "Define embodiment profile, invariants, and baseline skill posture."],
                    ["Grower", "Attach classic or hyperagent experiments and run training cycles."],
                    ["Pruner", "Review runs, trim drift, and apply constraint updates before promotion."],
                    ["Birth", "Promote to active packaging candidate once blocking flags are cleared."],
                  ].map(([label, detail]) => (
                    <div key={label} className="rounded-lg border border-slate-700/60 bg-slate-950/60 p-3">
                      <p className="font-semibold text-slate-100">{label}</p>
                      <p className="mt-1 text-slate-400">{detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}


            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <Card className="border-slate-700/50 bg-slate-900/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Rocket className="size-4 text-cyan-300" />
                      Create Run
                      <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
                        {TRAINER_STAGE_DEFINITIONS.find((stage) => stage.key === activeStage)?.label ?? "Collect Sources"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {TRAINER_STAGE_DEFINITIONS.find((stage) => stage.key === activeStage)?.description ??
                        "Define intent, inspect local sources, and queue the run with an explicit receipt."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {TRAINER_TEMPLATES.map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 bg-slate-800/60 hover:bg-slate-700/60"
                          onClick={() => applyTemplate(template.id)}
                        >
                          <FileCode2 className="mr-1.5 size-3.5" />
                          {template.label}
                        </Button>
                      ))}
                      <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
                        {personhoodStatusLabel}
                      </Badge>
                    </div>


                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Agent slug</label>
                        <Input
                          value={slug}
                          onChange={(event) => setSlug(event.target.value)}
                          className="border-slate-600 bg-slate-800/60 font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Display title</label>
                        <Input
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          className="border-slate-600 bg-slate-800/60 text-sm"
                        />
                      </div>
                    </div>


                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Domain</label>
                        <Select value={domain} onValueChange={setDomain}>
                          <SelectTrigger className="border-slate-600 bg-slate-800/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="companion">Companion</SelectItem>
                            <SelectItem value="memory-care">Memory Care</SelectItem>
                            <SelectItem value="meta-orchestration">Meta-Orchestration</SelectItem>
                            <SelectItem value="developer-experience">Developer Experience</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Embodiment</label>
                        <Select
                          value={embodimentProfileSlug}
                          onValueChange={(value) => setEmbodimentProfileSlug(value as TrainerEmbodimentSlug)}
                        >
                          <SelectTrigger className="border-slate-600 bg-slate-800/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TRAINER_EMBODIMENT_OPTIONS.map((profile) => (
                              <SelectItem key={profile.slug} value={profile.slug}>
                                {profile.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>


                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <EmbodimentBadge
                          name={selectedEmbodiment.label}
                          status={selectedEmbodimentPresence?.profileStatus ?? "active"}
                        />
                        <Badge
                          variant="outline"
                          className="border-slate-700 bg-slate-950/50 text-slate-300"
                        >
                          {selectedEmbodiment.archetype}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
                        >
                          {selectedEmbodimentPresence?.visibilityScope ?? "founder-only"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-200">
                        {selectedEmbodimentPresence?.capabilitySummary ?? selectedEmbodiment.summary}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Voice tone: {selectedEmbodiment.voiceTone}
                      </p>
                      {selectedEmbodimentPresence?.boundaryNote ? (
                        <p className="mt-2 text-xs text-cyan-100/80">
                          Boundary note: {selectedEmbodimentPresence.boundaryNote}
                        </p>
                      ) : null}
                      <div className="mt-3">
                        {selectedEmbodimentGovernance ? (
                          <GovernanceStatusBar
                            profileStatus={selectedEmbodimentPresence?.profileStatus ?? "active"}
                            visibilityScope={selectedEmbodimentPresence?.visibilityScope ?? "founder-only"}
                            founderOnly={selectedEmbodimentGovernance.founderOnly}
                            experimental={selectedEmbodimentGovernance.experimental}
                            archived={selectedEmbodimentGovernance.archived}
                            reviewGated={selectedEmbodimentGovernance.reviewGated}
                          />
                        ) : null}
                      </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <PrivateInteriorSeal />
                      {selectedEmbodimentProfile?.readinessScore !== undefined ? (
                        <span className="text-xs text-slate-400">
                          Readiness: {Math.round(selectedEmbodimentProfile.readinessScore * 100)}%
                          </span>
                        ) : null}
                      </div>
                    </div>


                    <Card className="border-slate-700/50 bg-slate-950/50">
                      <CardHeader>
                        <CardTitle className="text-sm">Embodiment Persistence</CardTitle>
                        <CardDescription>
                          Propose profile mutations, store readiness scores, and keep the local fallback
                          path visible when Supabase is offline or unconfigured.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
                              {embodimentPersistenceStatus.remoteEnabled ? "Remote enabled" : "Local fallback"}
                            </Badge>
                            <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
                              {embodimentPersistenceStatus.configured ? "Supabase configured" : "Supabase optional"}
                            </Badge>
                            <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
                              {selectedEmbodiment.slug}
                            </Badge>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-400">Target path</label>
                              <Input
                                value={mutationTargetPath}
                                onChange={(event) => setMutationTargetPath(event.target.value)}
                                className="border-slate-600 bg-slate-800/60 text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-400">Mutation class</label>
                              <Input
                                value={mutationClass}
                                onChange={(event) => setMutationClass(event.target.value)}
                                className="border-slate-600 bg-slate-800/60 text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-400">Risk level</label>
                              <Select
                                value={mutationRiskLevel}
                                onValueChange={(value) => setMutationRiskLevel(value as EmbodimentMutationRiskLevel)}
                              >
                                <SelectTrigger className="border-slate-600 bg-slate-800/60">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-400">Status</label>
                              <Select
                                value={mutationStatus}
                                onValueChange={(value) => setMutationStatus(value as EmbodimentMutationStatus)}
                              >
                                <SelectTrigger className="border-slate-600 bg-slate-800/60">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="proposed">Proposed</SelectItem>
                                  <SelectItem value="under_review">Under review</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                  <SelectItem value="applied">Applied</SelectItem>
                                  <SelectItem value="rolled_back">Rolled back</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-400">Current value</label>
                              <Textarea
                                value={mutationCurrentValue}
                                onChange={(event) => setMutationCurrentValue(event.target.value)}
                                placeholder='{"profileStatus":"active"}'
                                className="min-h-[110px] border-slate-600 bg-slate-800/60 text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-400">Proposed value</label>
                              <Textarea
                                value={mutationProposedValue}
                                onChange={(event) => setMutationProposedValue(event.target.value)}
                                placeholder='{"profileStatus":"founder-only"}'
                                className="min-h-[110px] border-slate-600 bg-slate-800/60 text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Review notes</label>
                            <Textarea
                              value={mutationReviewNotes}
                              onChange={(event) => setMutationReviewNotes(event.target.value)}
                              placeholder="Why this proposal is safe, risky, or ready for founder review."
                              className="min-h-[84px] border-slate-600 bg-slate-800/60 text-sm"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                              onClick={() => void handleSubmitMutationProposal()}
                            >
                              <FileUp className="mr-2 size-3.5" />
                              Record proposal
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60"
                              onClick={() => void refreshEmbodimentPersistence()}
                            >
                              <RefreshCcw className="mr-2 size-3.5" />
                              Refresh records
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-white">Readiness score</p>
                                <p className="text-xs text-slate-400">Persist a normalized 0-100 score for the selected embodiment.</p>
                              </div>
                              <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
                                {selectedEmbodiment.slug}
                              </Badge>
                            </div>
                            <div className="mt-3 grid gap-3">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400">Score</label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={readinessScoreInput}
                                  onChange={(event) => setReadinessScoreInput(event.target.value)}
                                  className="border-slate-600 bg-slate-800/60 text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400">Source</label>
                                <Input
                                  value={readinessSource}
                                  onChange={(event) => setReadinessSource(event.target.value)}
                                  className="border-slate-600 bg-slate-800/60 text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400">Rationale</label>
                                <Textarea
                                  value={readinessRationale}
                                  onChange={(event) => setReadinessRationale(event.target.value)}
                                  placeholder="Why this score is being recorded."
                                  className="min-h-[80px] border-slate-600 bg-slate-800/60 text-sm"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                                onClick={() => void handleSaveReadinessScore()}
                              >
                                <ShieldCheck className="mr-2 size-3.5" />
                                Save readiness
                              </Button>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
                            <div className="flex items-center gap-2">
                              <Network className="size-4 text-cyan-300" />
                              <p className="text-sm font-medium text-white">Recent records</p>
                            </div>
                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                  Proposals
                                </p>
                                <ScrollArea className="mt-2 h-44 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
                                  <div className="space-y-2">
                                    {mutationProposals.length > 0 ? (
                                      mutationProposals.map((proposal) => (
                                        <div
                                          key={proposal.id}
                                          className="rounded-xl border border-slate-700/50 bg-slate-900/70 p-3"
                                        >
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
                                              {proposal.status}
                                            </Badge>
                                            <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
                                              {proposal.riskLevel}
                                            </Badge>
                                            <span className="font-mono text-[11px] text-slate-400">
                                              {proposal.targetPath}
                                            </span>
                                          </div>
                                          <p className="mt-2 text-xs text-slate-300">
                                            {proposal.mutationClass}
                                          </p>
                                          <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                                              onClick={() => void handleReviewProposal(proposal, "approved")}
                                            >
                                              <CheckCircle2 className="mr-2 size-3.5" />
                                              Approve
                                            </Button>
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              className="border-rose-500/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                                              onClick={() => void handleReviewProposal(proposal, "rejected")}
                                            >
                                              <XCircle className="mr-2 size-3.5" />
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-slate-500">No proposals recorded yet.</p>
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                              <div>
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                  Readiness
                                </p>
                                <ScrollArea className="mt-2 h-36 rounded-xl border border-slate-700/40 bg-slate-950/40 p-3">
                                  <div className="space-y-2">
                                    {readinessScores.length > 0 ? (
                                      readinessScores.map((record) => (
                                        <div
                                          key={record.id}
                                          className="rounded-xl border border-slate-700/50 bg-slate-900/70 p-3"
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100">
                                              {Math.round(record.readinessScore * 100)}%
                                            </Badge>
                                            <span className="text-[11px] text-slate-500">{record.readinessSource}</span>
                                          </div>
                                          {record.readinessRationale ? (
                                            <p className="mt-2 text-xs text-slate-300">{record.readinessRationale}</p>
                                          ) : null}
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-slate-500">No readiness scores recorded yet.</p>
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>


                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">Goal</label>
                      <UncontrolledTextarea
                        ref={goalRef}
                        defaultValue={goalText}
                        className="min-h-[88px] border-slate-600 bg-slate-800/60 text-sm"
                        onCommit={setGoalText}
                      />
                    </div>


                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Target behaviors (CSV)</label>
                        <UncontrolledTextarea
                          ref={targetBehaviorsRef}
                          defaultValue={targetBehaviorsText}
                          className="min-h-[84px] border-slate-600 bg-slate-800/60 text-sm"
                          onCommit={setTargetBehaviorsText}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Anti-goals (CSV)</label>
                        <UncontrolledTextarea
                          ref={antiGoalsRef}
                          defaultValue={antiGoalsText}
                          className="min-h-[84px] border-slate-600 bg-slate-800/60 text-sm"
                          onCommit={setAntiGoalsText}
                        />
                      </div>
                    </div>


                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">Study focus</label>
                      <UncontrolledTextarea
                        ref={studyFocusRef}
                        defaultValue={studyFocusText}
                        className="min-h-[84px] border-slate-600 bg-slate-800/60 text-sm"
                        placeholder="Optional: bias the retrieval pass toward a sharper operational focus."
                        onCommit={setStudyFocusText}
                      />
                      <div
                        ref={manualSourceToolsRef}
                        id="manual-source-tools"
                        className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3"
                      >
                          <div className="flex flex-wrap items-center gap-3">
                            <FileUp className="size-4 text-cyan-300" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-slate-100">Manual source fallback</p>
                              <p className="text-xs text-slate-400">
                              Upload local files into a ZIP-backed packet when the remote source path is unavailable. The inline run brief stays under the trainer schema limit; full source text stays exportable and re-importable.
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                            variant="outline"
                            className="border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                            onClick={handleExportManualPacket}
                          >
                            <Download className="mr-2 size-3.5" />
                            Export packet
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <label className="space-y-1">
                            <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                              <Upload className="size-3.5 text-cyan-300" />
                              Add source file
                            </span>
                            <Input
                              type="file"
                              accept=".txt,.md,.markdown,.json,.csv,text/plain,text/markdown,application/json,text/csv"
                              className="border-slate-600 bg-slate-800/60 text-xs file:text-slate-200"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                void handleManualStudySourceFile(file);
                                event.target.value = "";
                              }}
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="flex items-center gap-2 text-xs font-medium text-slate-300">
                              <Upload className="size-3.5 text-cyan-300" />
                              Import packet
                            </span>
                            <Input
                              type="file"
                              accept=".zip,.json,application/zip,application/json"
                              className="border-slate-600 bg-slate-800/60 text-xs file:text-slate-200"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                void handleImportManualPacket(file);
                                event.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                        {manualStudySources.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {manualStudySources.map((source) => (
                              <div
                                key={source.id}
                                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-950/50 px-3 py-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-mono text-xs text-slate-100">{source.name}</p>
                                  <p className="text-xs text-slate-500">
                                    {source.size} bytes · {source.truncated ? "stored excerpt" : "full text stored locally"} · {formatCompactDate(source.importedAt)}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800"
                                  onClick={() => handleRemoveManualStudySource(source.id)}
                                >
                                  <Trash2 className="mr-2 size-3.5" />
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>


                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Max cycles</label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={maxCycles}
                          onChange={(event) => setMaxCycles(event.target.value)}
                          className="border-slate-600 bg-slate-800/60 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Quality threshold</label>
                        <Input
                          type="number"
                          min={0}
                          max={5}
                          step={0.1}
                          value={qualityThreshold}
                          onChange={(event) => setQualityThreshold(event.target.value)}
                          className="border-slate-600 bg-slate-800/60 text-sm"
                        />
                      </div>
                    </div>


                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Drafting provider</label>
                        <Select value={draftingProvider} onValueChange={setDraftingProvider}>
                          <SelectTrigger className="border-slate-600 bg-slate-800/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="ollama">Ollama</SelectItem>
                            <SelectItem value="groq">Groq</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-400">Evaluation provider</label>
                        <Select value={evaluationProvider} onValueChange={setEvaluationProvider}>
                          <SelectTrigger className="border-slate-600 bg-slate-800/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="ollama">Ollama</SelectItem>
                            <SelectItem value="groq">Groq</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>


                    <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-white">Recommended for this run</p>
                          <p className="text-xs text-slate-400">
                            {trainer.recommendationQuery
                              ? `Retrieval query: ${trainer.recommendationQuery}`
                              : "Recommendations load from the current brief."}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 bg-slate-800/60 hover:bg-slate-700/60"
                            disabled={trainer.studyRecommendations.length === 0}
                            onClick={() => {
                              const files = trainer.studyRecommendations
                                .filter((recommendation) => recommendation.selected || recommendation.pinned)
                                .map((recommendation) => recommendation.sourceFile);
                              setSelectedStudySourceFiles(files);
                            }}
                          >
                            Use recommended set
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 bg-slate-800/60 hover:bg-slate-700/60"
                            onClick={() => setSelectedStudySourceFiles([])}
                          >
                            Clear pinned sources
                          </Button>
                        </div>
                      </div>


                      <div className="space-y-3">
                        {trainer.recommendationsError ? (
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                            {trainer.recommendationsError}
                          </div>
                        ) : null}
                        {trainer.studyRecommendations.length === 0 && !trainer.recommendationsError ? (
                          <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-3 text-sm text-slate-400">
                            Recommendations are pending. Manual source overrides can be selected below.
                          </div>
                        ) : null}
                        {trainer.studyRecommendations.slice(0, 6).map((recommendation) => {
                          const selected = selectedStudySourceFiles.includes(recommendation.sourceFile);
                          return (
                            <div
                              key={recommendation.sourceFile}
                              className={cn(
                                "rounded-xl border p-3 transition-colors",
                                selected
                                  ? "border-cyan-500/40 bg-cyan-500/10"
                                  : "border-slate-700/40 bg-slate-900/40"
                              )}
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                                  {recommendation.title}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="border-slate-700 bg-slate-950/60 text-slate-300"
                                >
                                  {recommendation.confidenceLabel}
                                </Badge>
                                {statusBadge(recommendation.documentType.toLowerCase())}
                              </div>
                              <p className="mt-2 text-sm text-slate-200">{recommendation.reason}</p>
                              {recommendation.fragments[0] ? (
                                <p className="mt-2 text-xs text-slate-400">
                                  {recommendation.fragments[0].excerpt}
                                </p>
                              ) : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-600 bg-slate-800/60 hover:bg-slate-700/60"
                                  onClick={() =>
                                    setSelectedStudySourceFiles((previous) =>
                                      previous.includes(recommendation.sourceFile)
                                        ? previous.filter((file) => file !== recommendation.sourceFile)
                                        : [...previous, recommendation.sourceFile]
                                    )
                                  }
                                >
                                  {selected ? "Remove" : "Pin source"}
                                </Button>
                                <span className="text-xs text-slate-500">
                                  {recommendation.fragmentCount} fragments · score {recommendation.finalScore.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>


                    {trainer.scenarioSets.length > 0 ? (
                      <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <GitBranch className="size-4 text-slate-300" />
                          <p className="text-sm font-medium text-white">Scenario sets</p>
                        </div>
                        <ScrollArea className="h-36">
                          <div className="space-y-2">
                            {trainer.scenarioSets.map((set) => {
                              const scenarioSetId = set.scenarioSetId ?? "";
                              const selected = selectedScenarioSetIds.includes(scenarioSetId);
                              return (
                                <label
                                  key={scenarioSetId || set.slug}
                                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700/40 px-3 py-2 text-sm hover:bg-slate-800/50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    disabled={!scenarioSetId}
                                    onChange={(event) => {
                                      if (!scenarioSetId) return;
                                      setSelectedScenarioSetIds((previous) =>
                                        event.target.checked
                                          ? [...previous, scenarioSetId]
                                          : previous.filter((id) => id !== scenarioSetId)
                                      );
                                    }}
                                    className="size-3.5 accent-cyan-400"
                                  />
                                  <span className="min-w-0 flex-1 truncate text-slate-200">{set.title}</span>
                                  <span className="text-xs text-slate-500">{set.scenarioCount} scenarios</span>
                                </label>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : null}


                    {manualStudySources.length > 0 ? (
                      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Database className="size-4 text-slate-300" />
                              <p className="text-sm font-medium text-white">Manual source packet</p>
                            </div>
                            <Badge variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-300">
                              {summarizeManualStudyPacket(manualStudySources)}
                            </Badge>
                          </div>
                          <ScrollArea className="h-44">
                            <div className="space-y-2">
                              {manualStudySources.map((source) => (
                                <button
                                  key={source.id}
                                  type="button"
                                  onClick={() => setSelectedManualSourceId(source.id)}
                                  className={cn(
                                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                                    selectedManualSource?.id === source.id
                                      ? "border-cyan-400/40 bg-cyan-400/10"
                                      : "border-slate-700/40 hover:bg-slate-800/50"
                                  )}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedStudySourceFiles.includes(source.name)}
                                    onChange={(event) =>
                                      setSelectedStudySourceFiles((previous) =>
                                        event.target.checked
                                          ? [...previous, source.name]
                                          : previous.filter((file) => file !== source.name)
                                      )
                                    }
                                    className="size-3.5 accent-cyan-400"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-mono text-xs text-slate-200">{source.name}</p>
                                    <p className="truncate text-xs text-slate-500">
                                      {source.fileType} · {source.size} bytes · {source.tags.join(", ") || "untagged"}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>

                        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <BookOpen className="size-4 text-cyan-300" />
                            <p className="text-sm font-medium text-white">Context viewer</p>
                          </div>
                          {selectedManualSource ? (
                            <div className="space-y-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                Imported {selectedManualSource.importedAt}
                              </p>
                              <p className="text-sm text-slate-200">{selectedManualSource.name}</p>
                              <p className="text-xs text-slate-400">{selectedManualSource.fileType}</p>
                              <ScrollArea className="h-40 rounded-xl border border-slate-700/40 bg-slate-950/60 p-3">
                                <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-200">
                                  {selectedManualSource.text}
                                </pre>
                              </ScrollArea>
                              <p className="text-xs text-slate-500">
                                Tags: {selectedManualSource.tags.length > 0 ? selectedManualSource.tags.join(", ") : "none"}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">Select a source to open it in context view.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-950/30 p-4 text-sm text-slate-400">
                        Upload a local transcript, paper, spec, or resume to begin the manual study packet.
                      </div>
                    )}


                    <Button
                      onClick={() => void handleSubmit()}
                      disabled={trainer.isSubmitting}
                      className="w-full bg-cyan-600 text-white hover:bg-cyan-500"
                    >
                      {trainer.isSubmitting ? (
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Rocket className="mr-2 size-4" />
                      )}
                      {trainer.isSubmitting ? "Submitting..." : "Queue training run"}
                    </Button>
                  </CardContent>
                </Card>


                <Card className="border-slate-700/50 bg-slate-900/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GitBranch className="size-4 text-cyan-300" />
                      Run Lifecycle
                    </CardTitle>
                    <CardDescription>
                      Explicit trainer path from queue entry to stored artifact so the control plane matches the operator model.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>Current run status:</span>
                      {statusBadge(currentRun?.status ?? "queued")}
                    </div>
                    <div className="grid gap-3 md:grid-cols-5">
                      {TRAINER_LIFECYCLE_STAGES.map(({ key, title, detail, Icon }) => (
                        <div
                          key={key}
                          className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-cyan-300" />
                            <p className="text-sm font-medium text-white">{title}</p>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-400">{detail}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs leading-5 text-slate-500">
                      Current repo status mapping: <span className="text-slate-300">`queued`</span> means waiting,
                      <span className="text-slate-300"> `running`</span> includes evaluation work,
                      <span className="text-slate-300"> `awaiting_review`</span> is the approval gate,
                      and <span className="text-slate-300">`completed`</span> is the stored/deployed end state.
                    </p>
                  </CardContent>
                </Card>


                <Card className="border-slate-700/50 bg-slate-900/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Network className="size-4 text-emerald-300" />
                      Queue Health
                    </CardTitle>
                    <CardDescription>
                      Worker heartbeat, stale jobs, queue age, and deterministic recovery actions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                        <p className="text-xs text-slate-400">Workers online</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {queueHealth?.onlineWorkerCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                        <p className="text-xs text-slate-400">Queued jobs</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {queueHealth?.queuedCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                        <p className="text-xs text-slate-400">Leased jobs</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {queueHealth?.leasedCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                        <p className="text-xs text-slate-400">Stale leases</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {queueHealth?.staleLeaseCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                        <p className="text-xs text-slate-400">Failed jobs</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {queueHealth?.failedCount ?? 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                        <p className="text-xs text-slate-400">Oldest queued age</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {queueHealth?.oldestQueuedAgeMs
                            ? describeElapsed(new Date(Date.now() - queueHealth.oldestQueuedAgeMs).toISOString())
                            : "n/a"}
                        </p>
                      </div>
                    </div>


                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        className="border-slate-600 bg-slate-800/60 hover:bg-slate-700/60"
                        onClick={() => void trainer.loadQueue()}
                      >
                        <RefreshCcw className="mr-2 size-4" />
                        Refresh queue health
                      </Button>
                      <Button
                        variant="outline"
                        className="border-rose-500/40 text-rose-100 hover:bg-rose-500/10"
                        disabled={trainer.isMutating || !historyRuns.some((run) => run.status === "cancelled")}
                        onClick={() => void handlePurgeCancelledRuns()}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Purge cancelled history
                      </Button>
                      <Button
                        variant="outline"
                        className="border-amber-500/40 text-amber-100 hover:bg-amber-500/10"
                        disabled={trainer.isMutating || !queueHealth?.staleJobs[0]}
                        onClick={() => {
                          const staleJob = queueHealth?.staleJobs[0];
                          if (!staleJob) return;
                          void trainer.retryJob(staleJob.jobId);
                        }}
                      >
                        <RefreshCcw className="mr-2 size-4" />
                        Retry stale job
                      </Button>
                      <Button
                        variant="outline"
                        className="border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/10"
                        disabled={trainer.isMutating || !activeRuns.some((run) => run.status === "queued")}
                        onClick={() => {
                          const queuedRun = activeRuns.find((run) => run.status === "queued");
                          if (!queuedRun) return;
                          void trainer.runNow(queuedRun.runId);
                        }}
                      >
                        <PlayCircle className="mr-2 size-4" />
                        Start oldest queued run
                      </Button>
                    </div>


                    {(queueHealth?.workers?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Workers
                        </p>
                        <div className="space-y-2">
                          {(queueHealth?.workers ?? []).map((worker) => (
                            <div
                              key={worker.workerId}
                              className="rounded-xl border border-slate-700/40 bg-slate-950/30 px-3 py-2"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs text-slate-200">{worker.workerId}</span>
                                {statusBadge(worker.status)}
                                <span className="text-xs text-slate-500">
                                  heartbeat {describeFreshness(worker.lastHeartbeatAt)}
                                </span>
                              </div>
                              {worker.currentJobId ? (
                                <p className="mt-1 text-xs text-slate-400">
                                  current job <span className="font-mono">{worker.currentJobId}</span>
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                        No worker heartbeat is visible yet. Queueing still works, but queued runs may
                        need manual execution until a worker comes online.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>


              <div className="space-y-6">
                <Card className="border-slate-700/50 bg-slate-900/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="size-4 text-cyan-300" />
                      Active Run Console
                    </CardTitle>
                    <CardDescription>
                      Run state, job state, worker freshness, last event, and the stage timeline.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentRun ? (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <RunStatusIcon status={currentRun.status} />
                          {statusBadge(currentRun.status)}
                          {currentRun.job ? statusBadge(currentRun.job.status) : null}
                          {currentRun.job?.cancelRequested ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/40 bg-amber-500/10 text-amber-100"
                            >
                              cancel requested
                            </Badge>
                          ) : null}
                          <span className="ml-auto text-xs text-slate-500">
                            created {describeElapsed(currentRun.createdAt)} ago
                          </span>
                        </div>


                        <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">{currentRun.runId}</p>
                              <p className="mt-1 text-xs text-slate-400">{blockedExplanation}</p>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              <p>Avg score {averageScore(currentRun)}</p>
                              <p>{runProgress}% progress</p>
                            </div>
                          </div>
                          <Progress value={runProgress} className="mt-4 bg-slate-800 [&_[data-slot=progress-indicator]]:bg-cyan-400" />
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 p-3">
                              <p className="text-xs text-slate-400">Worker / job</p>
                              <p className="mt-2 text-sm text-slate-200">
                                {currentRun.job?.workerId ?? "unclaimed"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                heartbeat {describeFreshness(currentRun.job?.lastHeartbeatAt)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 p-3">
                              <p className="text-xs text-slate-400">Last event</p>
                              <p className="mt-2 text-sm text-slate-200">
                                {currentRun.lastEventMessage ?? "No event message yet."}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {currentRun.lastEventAt
                                  ? `updated ${describeElapsed(currentRun.lastEventAt)} ago`
                                  : "waiting for first event"}
                              </p>
                            </div>
                          </div>
                        </div>


                        {latestVersion ? (
                          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Version lineage
                            </p>
                            <p className="mt-2 font-mono text-sm text-slate-200">
                              {latestVersion.versionId}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {latestVersion.semanticVersion} · {latestVersion.status}
                            </p>
                          </div>
                        ) : null}


                        <div className="grid gap-2 sm:grid-cols-2">
                          {currentRun.status === "queued" ? (
                            <Button
                              variant="outline"
                              className="border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/10"
                              disabled={trainer.isMutating}
                              onClick={() => void trainer.runNow(currentRun.runId)}
                            >
                              <PlayCircle className="mr-2 size-4" />
                              Start now
                            </Button>
                          ) : null}


                          {currentRun.status === "running" ? (
                            <Button
                              variant="outline"
                              className="border-amber-500/40 text-amber-100 hover:bg-amber-500/10"
                              disabled={trainer.isMutating}
                              onClick={() => void trainer.requestCancelRun(currentRun.runId)}
                            >
                              <AlertTriangle className="mr-2 size-4" />
                              Request cancel
                            </Button>
                          ) : null}


                          {QUEUE_MUTABLE_STATUSES.has(currentRun.status) ? (
                            <>
                              <Button
                                variant="outline"
                                className="border-zinc-500/40 text-zinc-100 hover:bg-zinc-500/10"
                                disabled={trainer.isMutating}
                                onClick={() => void handleQueueDeletion("delete")}
                              >
                                <XCircle className="mr-2 size-4" />
                                Cancel run
                              </Button>
                              <Button
                                variant="outline"
                                className="border-rose-500/40 text-rose-100 hover:bg-rose-500/10"
                                disabled={trainer.isMutating}
                                onClick={() => void handleQueueDeletion("purge")}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Purge run
                              </Button>
                            </>
                          ) : null}
                        </div>


                        {canDeploy && latestVersion ? (
                          <div className="rounded-2xl border border-lime-500/20 bg-lime-500/5 p-4">
                            <label className="text-xs font-medium text-slate-400">Deploy path</label>
                            <Input
                              value={deployPath}
                              onChange={(event) => setDeployPath(event.target.value)}
                              className="mt-2 border-slate-600 bg-slate-800/60 font-mono text-sm"
                              placeholder="/agents/agent-trainer-prototype.md"
                            />
                            <Button
                              className="mt-3 w-full bg-lime-700 hover:bg-lime-600"
                              disabled={trainer.isMutating}
                              onClick={() =>
                                void trainer.deployRun(currentRun.runId, latestVersion.versionId, deployPath)
                              }
                            >
                              <Rocket className="mr-2 size-4" />
                              Deploy approved version
                            </Button>
                          </div>
                        ) : null}


                        <div className="space-y-2 rounded-2xl border border-slate-700/40 bg-slate-950/30 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Event timeline
                          </p>
                          <ScrollArea className="h-72">
                            <div className="space-y-2">
                              {trainer.runEvents.length > 0 ? (
                                trainer.runEvents.map((event) => (
                                  <div
                                    key={event.eventId}
                                    className="rounded-xl border border-slate-700/40 px-3 py-2"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="border-slate-700 bg-slate-900/60 text-slate-300"
                                      >
                                        {event.eventType}
                                      </Badge>
                                      <span className="text-xs text-slate-500">
                                        {describeElapsed(event.createdAt)} ago
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-200">{event.message}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500">No event timeline yet.</p>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Queue a run or select one from active/history to inspect the console.
                      </p>
                    )}
                  </CardContent>
                </Card>


                {hasGovernanceAccess ? (
                  <ReviewQueuePanel
                    currentRun={currentRun}
                    experiment={reviewExperiment}
                    isSubmitting={governance.isMutating || trainer.isMutating}
                    deployOnApprove={deployOnApprove}
                    deployPath={deployPath}
                    onDeployOnApproveChange={setDeployOnApprove}
                    onDeployPathChange={setDeployPath}
                    onResolveFlag={async (experimentId, flagId) => {
                      await governance.resolveFlag(experimentId, flagId, true);
                    }}
                    onSubmitDecision={handleReviewDecision}
                  />
                ) : null}
              </div>
            </div>


            <Card className="border-slate-700/50 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base">History</CardTitle>
                <CardDescription>
                  Active queue items are separated from historical records so cancelled, failed, and
                  completed work stays legible.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-cyan-300" />
                    <p className="text-sm font-medium text-white">Active queue</p>
                  </div>
                  <ScrollArea className="h-72 rounded-2xl border border-slate-700/40 bg-slate-950/30 p-3">
                    <div className="space-y-2">
                      {activeRuns.length > 0 ? (
                        activeRuns.map((run) => (
                          <button
                            key={run.runId}
                            type="button"
                            className={cn(
                              "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                              currentRun?.runId === run.runId
                                ? "border-cyan-500/40 bg-cyan-500/10"
                                : "border-slate-700/40 bg-slate-900/40 hover:bg-slate-800/60"
                            )}
                            onClick={() => trainer.setCurrentRun(run)}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <RunStatusIcon status={run.status} />
                              <span className="font-mono text-xs text-slate-200">{run.runId}</span>
                              {statusBadge(run.status)}
                              {run.job ? statusBadge(run.job.status) : null}
                            </div>
                            <p className="mt-2 text-sm text-slate-200">{run.lastEventMessage ?? run.goal}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {describeElapsed(run.createdAt)} ago ·{" "}
                              {run.job && "workerId" in run.job ? run.job.workerId ?? "no worker yet" : "no worker yet"}
                            </p>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No active queue items.</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>


                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-slate-300" />
                    <p className="text-sm font-medium text-white">Archive</p>
                  </div>
                  <ScrollArea className="h-72 rounded-2xl border border-slate-700/40 bg-slate-950/30 p-3">
                    <div className="space-y-2">
                      {historyRuns.length > 0 ? (
                        historyRuns.map((run) => (
                          <button
                            key={run.runId}
                            type="button"
                            className={cn(
                              "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                              currentRun?.runId === run.runId
                                ? "border-cyan-500/40 bg-cyan-500/10"
                                : "border-slate-700/40 bg-slate-900/40 hover:bg-slate-800/60"
                            )}
                            onClick={() => trainer.setCurrentRun(run)}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <RunStatusIcon status={run.status} />
                              <span className="font-mono text-xs text-slate-200">{run.runId}</span>
                              {statusBadge(run.status)}
                            </div>
                            <p className="mt-2 text-sm text-slate-200">
                              {run.lastEventMessage ?? run.goal}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              completed {describeElapsed(run.completedAt ?? run.createdAt)} ago
                            </p>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No archived runs yet.</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>


            <Card className="border-slate-700/50 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base">Corpus Snapshot</CardTitle>
                <CardDescription>
                  Current knowledge state available to local source selection and packet export.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <BookOpen className="size-3.5" />
                    Manual sources
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{manualStudySources.length}</p>
                  <Badge
                    variant="outline"
                    className={cn("mt-2 border text-xs", runtimeStateBadgeClass(trainer.runtimeState))}
                  >
                    {titleCaseRuntimeState(trainer.runtimeState)}
                  </Badge>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Database className="size-3.5" />
                    Knowledge assets
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">{personhood?.assetCount ?? 0}</p>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Network className="size-3.5" />
                    Pending mutations
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {personhood?.pendingMutations?.length ?? 0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Activity className="size-3.5" />
                    Persistence
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {usePersistenceAdapter ? "local adapter on" : "session only"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {manualStudySources.length > 0
                      ? "Manual sources are saved to browser storage."
                      : "Upload a packet to start the local cache."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
