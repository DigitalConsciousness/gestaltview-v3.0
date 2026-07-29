/**
 * CreationCornerPage
 * ==================
 * The workshop. The lab. The forge.
 * Hogwarts professor's laboratory × Steampunk × Tron × Hitchhiker's Guide × Vault-Tec.
 *
 * DI: The Art Teacher — "What are we actually making today?"
 *
 * Wired to:
 *   POST /api/codex/forge   (optional — falls back to local manifest when unavailable)
 *   useDigitalIntelligence('creation-corner')
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { useDigitalIntelligence } from "@/hooks/useDigitalIntelligence";
import {
  createArtifact as synthesizeArtifact,
  scoreResonance,
} from "@/lib/genEngineClient";
import { requestOrchestrationDecision } from "@/lib/orchestratorClient";
import BlueprintLibrary from "@/components/BlueprintLibrary";
import BlueprintGenerativeWorkbench from "@/components/BlueprintGenerativeWorkbench";
import { RoomHeaderBar } from "@/components/ui/RoomHeaderBar";
import {
  readBlueprints,
  removeBlueprint,
  writeBlueprints,
  type CaptureBlueprint,
} from "@/components/Scaffold";
import {
  buildCreationCornerCodexArtifact,
  mapCreationCornerArtifactType,
  mapCreationCornerDestination,
  mapCreationCornerStyle,
  isDestinationAllowed,
  resolveDestination,
  type CreationCornerLegacyArtifactType,
  type CreationCornerLegacyDestination,
  type CreationCornerLegacySynthesisStyle,
} from "@shared/codex/creationCorner";
import {
  loadCreationCornerBlueprintsFromServer,
  materializeCreationCornerBlueprint,
  mergeCreationCornerBlueprints,
} from "@/lib/creationCornerContent";
import { appendUserFile, createUserFileRecord } from "@/lib/innerWorldFiles";
import { uploadUserFileToServer } from "@/lib/fileStorage";
import { readCreationCornerUpload } from "@/lib/creationCornerIntake";
import { ArtifactExportViewer } from "@/lib/rendering";
import GestaltRenderSurface from "@/components/rendering/GestaltRenderSurface";
import { artifactsToSceneGraph } from "@/lib/rendering/fromArtifacts";
import type { GestaltSceneGraph } from "@/lib/rendering/sceneGraph";
import { renderArtifact } from "@/lib/renderingClient";
import {
  submitNextGenRender,
  type RenderEngineReceipt,
} from "@/lib/nextGenRenderClient";
import { projectRenderToInnerWorld } from "@/lib/renderProjectionClient";
import {
  buildCreationCornerHtml,
  buildCreationCornerExportFile,
  type CreationCornerExportFormat,
} from "@/lib/creationCornerArtifacts";
import type { CodexArtifact } from "@shared/codex/contracts";
import { TRANSCRIPTORY_CREATION_HANDOFF_KEY } from "@/lib/transcriptory";
import { acceptRuntimeSourceInCreationCorner } from "@/lib/blackboardRuntimeHandoffs";

const BLACKBOARD_CREATION_HANDOFF_KEY =
  "gestaltview.blackboard.creationHandoff.v1";

// ─── Types ───────────────────────────────────────────────────────────────────

type ArtifactType = CreationCornerLegacyArtifactType;

type SynthesisStyle = CreationCornerLegacySynthesisStyle;

type Destination = CreationCornerLegacyDestination;

type RenderLedgerState =
  | "local_preview"
  | "submitting"
  | "validating"
  | "queued"
  | "rendering"
  | "storing"
  | "ready"
  | "failed"
  | "cancelled"
  | "projection_pending"
  | "projected";

function mapCreationCornerArtifactIntent(
  artifactType: ArtifactType,
): "recap" | "document" | "mind_map" | "capture" | "unknown" {
  switch (artifactType) {
    case "session_recap":
      return "recap";
    case "mind_map":
      return "mind_map";
    case "markdown":
    case "blueprint_md":
    case "blueprint_json":
    case "share_card":
    case "marketing_copy":
    case "agent_prompt":
    case "code":
    case "image_prompt":
    case "audio_prompt":
      return "document";
    case "image":
    case "audio":
      return "capture";
    default:
      return "unknown";
  }
}

interface ArtifactResult {
  id: string;
  title: string;
  artifact_type: ArtifactType;
  content?: string;
  image_b64?: string;
  audio_b64?: string;
  image_prompt?: string;
  audio_prompt?: string;
  plk_resonance_score: number;
  generation_mode: string;
  fallback_used: boolean;
  warnings: string[];
  latency_ms: number;
  previewHtml?: string;
  provenance?: {
    artifactId: string;
    sourceCaptureIds: string[];
    sourceHashes: string[];
    artifactHash: string;
    generatedAt: string;
    engineVersion: string;
  };
  codex?: {
    status: "draft" | "rendering" | "ready" | "failed" | "archived";
    artifact: CodexArtifact;
    manifest: CodexArtifact["exports"];
    jobs?: Array<{
      id: string;
      artifactId: string;
      format: string;
      status: string;
    }>;
  };
}

type CodexForgeResponse = {
  status: "accepted";
  artifact: CodexArtifact;
  jobs: Array<{
    id: string;
    artifactId: string;
    format: string;
    status: string;
  }>;
};

type CodexRunJobResponse = {
  status: "drained" | "partial";
  artifact: CodexArtifact;
  manifest: CodexArtifact["exports"];
  jobs: Array<{
    id: string;
    artifactId: string;
    format: string;
    status: string;
  }>;
  results: Array<{
    job: { id: string; artifactId: string; format: string; status: string };
    manifestItem?: CodexArtifact["exports"][number];
  }>;
};

type CodexRunSingleJobResponse = {
  status: "ready";
  job: { id: string; artifactId: string; format: string; status: string };
  manifestItem: CodexArtifact["exports"][number];
  artifactId: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const ARTIFACT_TYPES: { value: ArtifactType; label: string; glyph: string }[] =
  [
    { value: "markdown", label: "Document", glyph: "📄" },
    { value: "blueprint_md", label: "Blueprint", glyph: "🗺" },
    { value: "blueprint_json", label: "Blueprint JSON", glyph: "⚙" },
    { value: "image_prompt", label: "Image Prompt", glyph: "🖼" },
    { value: "image", label: "Generate Image", glyph: "✨" },
    { value: "audio_prompt", label: "Audio Prompt", glyph: "🎵" },
    { value: "audio", label: "Generate Audio", glyph: "🔊" },
    { value: "share_card", label: "Share Card", glyph: "📡" },
    { value: "marketing_copy", label: "Marketing Copy", glyph: "✍" },
    { value: "session_recap", label: "Session Recap", glyph: "🗒" },
    { value: "mind_map", label: "Mind Map", glyph: "🕸" },
    { value: "agent_prompt", label: "Agent Prompt", glyph: "🤖" },
    { value: "code", label: "Code", glyph: "💻" },
  ];

const SYNTHESIS_STYLES: {
  value: SynthesisStyle;
  label: string;
  desc: string;
}[] = [
  {
    value: "preserve_voice",
    label: "Preserve Voice",
    desc: "Stay exactly in your register",
  },
  { value: "compress", label: "Compress", desc: "Irreducible essence only" },
  { value: "expand", label: "Expand", desc: "Elaborate what's implied" },
  { value: "reframe", label: "Reframe", desc: "New angle, same material" },
  {
    value: "structural",
    label: "Structural",
    desc: "Clean skeleton, no prose",
  },
  { value: "narrative", label: "Narrative", desc: "Flowing prose, one voice" },
];

const DESTINATIONS: { value: Destination; label: string }[] = [
  { value: "creation_corner", label: "Keep here" },
  { value: "dynamic_inner_world", label: "→ Inner World" },
  { value: "scaffold_pending", label: "→ Scaffold" },
  { value: "download_only", label: "Download only" },
  { value: "gate_draft", label: "→ Gate draft" },
];

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "/api";

// ─── Local codex manifest builder (used when API is unavailable) ─────────────

function buildLocalCodexManifest(
  codexDraft: ReturnType<typeof buildCreationCornerCodexArtifact>,
): NonNullable<ArtifactResult["codex"]> {
  const manifest: CodexArtifact["exports"] = codexDraft.exports.map((item) => ({
    ...item,
    status: "ready" as const,
  }));

  return {
    status: "ready",
    artifact: {
      ...codexDraft,
      exports: manifest,
    },
    manifest,
    jobs: [],
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreationCornerPage() {
  useSEO(PAGE_SEO.creationCorner);
  const { user } = useAuth();
  const { di, isReady, messages, sendMessage } =
    useDigitalIntelligence("creation-corner");
  const [location] = useLocation();

  // ── Blueprint state ──────────────────────────────────────────────────────
  const [blueprints, setBlueprints] = useState<CaptureBlueprint[]>(() =>
    readBlueprints(),
  );
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(
    null,
  );

  // ── Synthesis controls ───────────────────────────────────────────────────
  const [artifactType, setArtifactType] = useState<ArtifactType>("markdown");
  const [synthStyle, setSynthStyle] =
    useState<SynthesisStyle>("preserve_voice");
  const [destination, setDestination] =
    useState<Destination>("creation_corner");
  const [customTitle, setCustomTitle] = useState("");
  const [freeText, setFreeText] = useState("");
  const [selectedUploadName, setSelectedUploadName] = useState<string | null>(
    null,
  );
  const [incomingSourceRefs, setIncomingSourceRefs] = useState<string[]>([]);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);

  // ── Result state ─────────────────────────────────────────────────────────
  const [result, setResult] = useState<ArtifactResult | null>(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [isRenderingExports, setIsRenderingExports] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthError, setSynthError] = useState<string | null>(null);
  const [nextGenRenderResult, setNextGenRenderResult] =
    useState<RenderEngineReceipt | null>(null);
  const [renderLedgerState, setRenderLedgerState] =
    useState<RenderLedgerState | null>(null);
  const [isNextGenRendering, setIsNextGenRendering] = useState(false);

  // ── DI chat ──────────────────────────────────────────────────────────────
  const [diInput, setDiInput] = useState("");
  const [diOpen, setDiOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset the preview spinner whenever a fresh artifact is rendered so the
  // loading state tracks the new iframe rather than the previous one.
  useEffect(() => {
    setPreviewLoaded(false);
  }, [result?.codex?.artifact.id, result?.title]);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(
      TRANSCRIPTORY_CREATION_HANDOFF_KEY,
    );
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as {
        title?: string;
        text?: string;
        captureId?: string;
        handoffId?: string;
      };
      const text = payload.text?.trim();
      if (!text) return;
      setFreeText(text);
      setCustomTitle(
        (current) => current || payload.title || "Transcriptory capture",
      );
      if (payload.handoffId && payload.captureId) {
        void acceptRuntimeSourceInCreationCorner({
          handoffId: payload.handoffId,
          destinationEntityRef: `creation-source:transcriptory-capture:${payload.captureId}`,
          expectedSourceRoom: "transcriptory",
        })
          .then(() => {
            window.sessionStorage.removeItem(
              TRANSCRIPTORY_CREATION_HANDOFF_KEY,
            );
          })
          .catch((error) => {
            toast.error(
              error instanceof Error
                ? error.message
                : "Transcriptory source loaded, but durable acknowledgement failed.",
            );
          });
      } else {
        window.sessionStorage.removeItem(TRANSCRIPTORY_CREATION_HANDOFF_KEY);
      }
      toast.success("Transcriptory capture loaded as source material.");
    } catch {
      window.sessionStorage.removeItem(TRANSCRIPTORY_CREATION_HANDOFF_KEY);
    }
  }, []);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(BLACKBOARD_CREATION_HANDOFF_KEY);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as {
        handoffId?: string;
        blueprintId?: string;
        sourceRefs?: string[];
      };
      if (!payload.handoffId || !payload.blueprintId) return;
      setSelectedBlueprintId(payload.blueprintId);
      setIncomingSourceRefs(
        Array.isArray(payload.sourceRefs)
          ? payload.sourceRefs.filter(
              (sourceRef): sourceRef is string =>
                typeof sourceRef === "string" && sourceRef.trim().length > 0,
            )
          : [],
      );
      void acceptRuntimeSourceInCreationCorner({
        handoffId: payload.handoffId,
        destinationEntityRef: `creation-blueprint:${payload.blueprintId}`,
        expectedSourceRoom: "blackboard",
      })
        .then(() => {
          window.sessionStorage.removeItem(BLACKBOARD_CREATION_HANDOFF_KEY);
          toast.success("Blackboard blueprint accepted with durable lineage.");
        })
        .catch((error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Blueprint remains local, but durable acknowledgement failed.",
          );
        });
    } catch {
      window.sessionStorage.removeItem(BLACKBOARD_CREATION_HANDOFF_KEY);
    }
  }, []);

  const lastSeedRef = useRef<string | null>(null);
  useEffect(() => {
    const search = location.includes("?")
      ? location.split("?")[1]
      : window.location.search.slice(1);
    const params = new URLSearchParams(search);
    const seed = params.get("seed")?.trim();
    if (!seed || lastSeedRef.current === seed) {
      return;
    }

    lastSeedRef.current = seed;
    setFreeText(seed);
    setCustomTitle(
      (current) => params.get("title")?.trim() || current || "Tribunal seed",
    );
    toast.success("Tribunal seed loaded into Creation Corner.");
  }, [location]);

  // ── Blueprint hydration ──────────────────────────────────────────────────
  useEffect(() => {
    const refresh = (event?: Event) => {
      setBlueprints(readBlueprints());
      const blueprintId = (
        event as CustomEvent<{ blueprintId?: string }> | undefined
      )?.detail?.blueprintId;
      if (blueprintId) {
        setSelectedBlueprintId(blueprintId);
      }
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("gestaltview:creation-blueprints-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(
        "gestaltview:creation-blueprints-updated",
        refresh,
      );
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      if (!user?.id) return;
      const remote = await loadCreationCornerBlueprintsFromServer();
      if (cancelled || !remote) return;
      const next = mergeCreationCornerBlueprints(
        readBlueprints(),
        remote.map(materializeCreationCornerBlueprint),
      );
      writeBlueprints(next);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!isDestinationAllowed(artifactType, destination)) {
      setDestination("creation_corner");
    }
  }, [artifactType, destination]);

  useEffect(() => {
    if (!selectedBlueprintId && blueprints[0]) {
      setSelectedBlueprintId(blueprints[0].id);
    }
  }, [blueprints, selectedBlueprintId]);

  const selectedBlueprint = useMemo(
    () =>
      blueprints.find((b) => b.id === selectedBlueprintId) ??
      blueprints[0] ??
      null,
    [blueprints, selectedBlueprintId],
  );

  const handleSourceFileSelected = async (file: File) => {
    try {
      const material = await readCreationCornerUpload(file);
      setFreeText((current) =>
        [current.trim(), material.text.trim()].filter(Boolean).join("\n\n"),
      );
      setSelectedUploadName(material.name);

      const fileRecord = createUserFileRecord({
        userId: user?.id ?? "local",
        file,
        roomOrigin: "creation_corner",
        previewText: material.previewText,
        previewHtml: material.previewHtml,
      });
      const persisted = user?.id
        ? ((await uploadUserFileToServer({
            file: fileRecord,
            content:
              material.previewHtml ?? material.previewText ?? material.text,
          })) ?? fileRecord)
        : fileRecord;
      appendUserFile(persisted);
      toast.success(`${material.name} added as source material.`);
    } catch {
      toast.error("That file could not be read as source material.");
    }
  };

  const handleDeleteBlueprint = (blueprint: CaptureBlueprint) => {
    if (!window.confirm(`Remove "${blueprint.title}" from the workshop?`))
      return;
    const next = removeBlueprint(blueprint.id);
    setBlueprints(next);
    setSelectedBlueprintId((cur) =>
      cur !== blueprint.id ? cur : (next[0]?.id ?? null),
    );
  };

  // ── Synthesis ────────────────────────────────────────────────────────────
  const handleSynthesize = async () => {
    const blueprintMarkdown =
      selectedBlueprint?.outputs?.markdown ??
      (selectedBlueprint
        ? `# ${selectedBlueprint.title}\n\n${selectedBlueprint.summary}`
        : "");
    const textInput = freeText.trim() || blueprintMarkdown;

    if (!textInput) {
      setSynthError(
        "Add some raw material first — text, a blueprint, or anything.",
      );
      return;
    }

    setIsSynthesizing(true);
    setSynthError(null);
    setResult(null);
    setNextGenRenderResult(null);
    setRenderLedgerState(null);

    try {
      const synthesisSourceCaptureIds = selectedBlueprint?.sourceOrbIds ?? [];
      const synthesisSourceArtifactIds = selectedBlueprint
        ? [selectedBlueprint.id]
        : [];
      const title = customTitle || undefined;
      const startedAt = Date.now();

      let targetType = mapCreationCornerArtifactType(artifactType);
      let synthesisStyle = mapCreationCornerStyle(synthStyle);
      let safeDestination = resolveDestination(artifactType, destination);
      let artifactDestination = mapCreationCornerDestination(safeDestination);
      let orchestrationSummary = "";

      try {
        const orchestration = await requestOrchestrationDecision({
          trigger: "manual_synthesize",
          sourceRoom: "creation-corner",
          text: textInput,
          title,
          artifactIntent: mapCreationCornerArtifactIntent(artifactType),
          sourceCaptureIds: synthesisSourceCaptureIds,
          sourceArtifactIds: synthesisSourceArtifactIds,
          userId: user?.id,
        });

        orchestrationSummary = orchestration.decision.userFacingSummary;
        targetType = orchestration.decision.artifactTargetType ?? targetType;
        synthesisStyle =
          orchestration.decision.synthesisStyle ?? synthesisStyle;
        artifactDestination =
          orchestration.decision.artifactDestination ?? artifactDestination;
        safeDestination = resolveDestination(artifactType, destination);
      } catch {
        // Fall back to the local selector if the routing API is unavailable.
      }

      const synthesis = await synthesizeArtifact({
        sourceCaptureIds: synthesisSourceCaptureIds,
        sourceArtifactIds: synthesisSourceArtifactIds,
        targetType,
        synthesisStyle,
        destination: artifactDestination,
        userInstructions: `Creation Corner ${artifactType} synthesis.`,
        preserveExactLanguage: synthesisStyle === "faithful",
        plkMode: "light-touch",
        title,
        summary: textInput.slice(0, 240),
        sourceText: textInput,
        sourceRoom: "creation-corner",
        consent: {
          analyzeText: true,
          analyzeImage: artifactType === "image",
          analyzeAudio: artifactType === "audio",
          analyzeVideo: false,
          inferEmotion: false,
          storeDerivativeSignals: true,
        },
        tags: [
          "creation-corner",
          artifactType,
          synthesisStyle,
          safeDestination,
        ],
        userId: user?.id,
      });

      const resonance = await scoreResonance({
        text: [synthesis.artifact.title, synthesis.artifact.content].join("\n"),
        userId: user?.id,
        plkContext: {
          sourceRoom: "creation-corner",
          synthesisStyle,
          destination: artifactDestination,
        },
      });

      const codexDraft = buildCreationCornerCodexArtifact({
        legacyType: artifactType,
        userId: user?.id,
        title: synthesis.artifact.title,
        content: synthesis.artifact.content,
        sourceText: textInput,
      });

      const warnings = [...synthesis.warnings, ...resonance.warnings];
      if (orchestrationSummary) {
        warnings.push(orchestrationSummary);
      }

      if (artifactType === "image") {
        warnings.push(
          "Image generation is not configured here yet; returned a source-linked image prompt.",
        );
      }
      if (artifactType === "audio") {
        warnings.push(
          "Audio generation is not configured here yet; returned a source-linked audio direction prompt.",
        );
      }

      // ── Step 2: Attempt codex/forge API — gracefully degrade if absent ───
      let codexResult: NonNullable<ArtifactResult["codex"]>;
      let generationMode = "local-codex";

      try {
        const resp = await fetch(`${API_BASE}/codex/forge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artifact: codexDraft,
            exportFormats: codexDraft.exports.map((item) => item.format),
          }),
        });

        if (!resp.ok) {
          throw new Error(`Codex forge returned ${resp.status}`);
        }

        const forgeData: CodexForgeResponse = await resp.json();
        codexResult = {
          status: "draft",
          artifact: forgeData.artifact,
          manifest: forgeData.artifact.exports,
          jobs: forgeData.jobs,
        };
        generationMode = "codex-forge";
      } catch {
        codexResult = buildLocalCodexManifest(codexDraft);
        warnings.push(
          "Codex API offline — local preview remains available, but no durable render receipt exists yet.",
        );
      }

      const data: ArtifactResult = {
        id: synthesis.artifact.id,
        title: synthesis.artifact.title,
        artifact_type: artifactType,
        content: synthesis.artifact.content,
        image_prompt:
          artifactType === "image" || artifactType === "image_prompt"
            ? synthesis.artifact.content
            : undefined,
        audio_prompt:
          artifactType === "audio" || artifactType === "audio_prompt"
            ? synthesis.artifact.content
            : undefined,
        plk_resonance_score: Math.max(0, Math.min(1, resonance.score / 100)),
        generation_mode: generationMode,
        fallback_used: generationMode === "local-codex",
        warnings,
        latency_ms: Date.now() - startedAt,
        provenance: synthesis.provenance,
        codex: codexResult,
      };

      // ── Preview HTML: try server renderer, fall through to content-aware local shell
      let previewHtml = buildCreationCornerHtml(data);
      const codexArtifact = data.codex?.artifact;
      if (codexArtifact) {
        try {
          const renderedPreview = await renderArtifact({
            artifactKind: codexArtifact.kind,
            content: codexArtifact,
            format: "html",
          });

          // Only accept a full HTML document from the server renderer.
          // Any other shape (Mermaid string, JSON, partial HTML) falls through
          // to the content-aware local shell below — no warning needed.
          if (
            typeof renderedPreview === "string" &&
            /<!doctype html|<html[\s>]/i.test(renderedPreview)
          ) {
            previewHtml = renderedPreview;
          }
        } catch {
          // Server renderer offline — local shell is the correct path.
        }
      }

      data.previewHtml = previewHtml;

      setResult(data);
      setRenderLedgerState("local_preview");

      if (safeDestination === "dynamic_inner_world") {
        toast.info(
          "Inner World selected. Create a durable render, then project it explicitly.",
        );
      } else if (artifactType === "session_recap") {
        toast.success("Session Recap forged and saved to Creation Corner.");
      } else {
        toast.success("Artifact synthesized.");
      }
    } catch (err: any) {
      setSynthError(err.message ?? "Something went wrong in the forge.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleRenderCodexExports = async () => {
    const pendingJobs =
      result?.codex?.jobs?.filter(
        (job) => job.status === "pending" || job.status === "running",
      ) ?? [];
    if (!result?.codex || pendingJobs.length === 0) {
      return;
    }

    setIsRenderingExports(true);
    try {
      const drainResp = await fetch(
        `${API_BASE}/codex/artifacts/${result.codex.artifact.id}/drain-exports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      let drainData: CodexRunJobResponse | null = null;

      if (drainResp.ok) {
        drainData = await drainResp.json();
      } else {
        const completed: CodexRunSingleJobResponse[] = [];
        for (const job of pendingJobs) {
          const resp = await fetch(`${API_BASE}/codex/jobs/${job.id}/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (!resp.ok) {
            const err = await resp
              .json()
              .catch(() => ({ detail: resp.statusText }));
            throw new Error(err.detail ?? "Export rendering failed");
          }

          completed.push(await resp.json());
        }

        drainData = {
          status: completed.some((entry) => entry.job.status === "failed")
            ? "partial"
            : "drained",
          artifact: {
            ...result.codex.artifact,
            exports: completed.map((entry) => entry.manifestItem),
          },
          manifest: completed.map((entry) => entry.manifestItem),
          jobs: completed.map((entry) => entry.job),
          results: completed,
        };
      }

      setResult((current) => {
        if (!current?.codex) {
          return current;
        }

        const manifest = drainData?.manifest ?? current.codex.manifest;

        return {
          ...current,
          codex: {
            ...current.codex,
            status: manifest.some((item) => item.status === "pending")
              ? current.codex.status
              : "ready",
            manifest,
            artifact: {
              ...current.codex.artifact,
              exports: manifest,
            },
            jobs: drainData?.jobs ?? current.codex.jobs,
          },
        };
      });
      toast.success(
        drainData?.status === "partial"
          ? "Some exports rendered."
          : "Exports rendered.",
      );
    } catch (err: any) {
      toast.error(err.message ?? "Export rendering failed.");
    } finally {
      setIsRenderingExports(false);
    }
  };

  const nextGenSceneGraph: GestaltSceneGraph | null = useMemo(() => {
    if (!result) {
      return null;
    }

    const artifact = result.codex?.artifact
      ? {
          id: result.codex.artifact.id,
          title: result.codex.artifact.title,
          type: result.codex.artifact.kind,
          content: JSON.stringify(result.codex.artifact.body, null, 2),
          metadata: {
            sourceRoom: "CreationCorner",
            engineVersion: result.provenance?.engineVersion,
          },
        }
      : {
          id: result.id,
          title: result.title,
          type: result.artifact_type,
          content:
            result.content ??
            result.previewHtml ??
            result.image_prompt ??
            result.audio_prompt ??
            "",
          metadata: {
            sourceRoom: "CreationCorner",
            engineVersion: result.provenance?.engineVersion,
          },
        };

    return artifactsToSceneGraph([artifact], `creation_corner_${result.id}`);
  }, [result]);

  const handleNextGenRender = async () => {
    if (!nextGenSceneGraph) {
      return;
    }

    setIsNextGenRendering(true);
    setNextGenRenderResult(null);
    setRenderLedgerState("submitting");

    try {
      const payload = await submitNextGenRender({
        sceneGraph: nextGenSceneGraph,
        targets: [
          {
            format: "html",
            mimeType: "text/html; charset=utf-8",
            destinationIntent:
              destination === "dynamic_inner_world" ? "project" : "preview",
            required: true,
          },
        ],
        idempotencyKey: `creation-corner:${result?.id ?? nextGenSceneGraph.graphId}:html`,
      });
      setNextGenRenderResult(payload);
      const serverState = payload.job?.status as RenderLedgerState | undefined;
      setRenderLedgerState(serverState ?? (payload.ok ? "ready" : "failed"));
      if (!payload.ok || payload.job?.status === "failed") {
        toast.warning(
          "NextGen render returned diagnostics. Review the manifest below.",
        );
        return;
      }
      toast.success(
        payload.job?.status === "ready"
          ? "Durable render receipt verified."
          : `Render ledger state: ${payload.job?.status ?? "submitted"}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "NextGen render failed.";
      setNextGenRenderResult({
        ok: false,
        error: { code: "RENDER_SUBMISSION_FAILED", message },
      });
      setRenderLedgerState("failed");
      toast.error(message);
    } finally {
      setIsNextGenRendering(false);
    }
  };

  const handleProjectToInnerWorld = async () => {
    const renderJobId = nextGenRenderResult?.job?.id;
    if (!result || renderLedgerState !== "ready" || !renderJobId) return;

    setRenderLedgerState("projection_pending");
    try {
      const projection = await projectRenderToInnerWorld({
        renderJobId,
        title: result.title,
        summary: result.content?.slice(0, 1_000),
      });
      setRenderLedgerState("projected");
      toast.success(
        projection.idempotent
          ? "Verified projection is available in Dynamic Inner World."
          : "Projected to Dynamic Inner World.",
      );
    } catch (error) {
      setRenderLedgerState("ready");
      toast.error(
        error instanceof Error ? error.message : "Projection failed.",
      );
    }
  };

  const handleDownload = (format: CreationCornerExportFormat) => {
    if (!result) return;
    const file = buildCreationCornerExportFile(result, format);
    const blob = new Blob([file.content], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-gv-bg-void text-gv-text-primary"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.07) 0%, transparent 55%), " +
          "radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%), " +
          "radial-gradient(ellipse at 50% 90%, rgba(251,146,60,0.04) 0%, transparent 50%), " +
          "#080c10",
      }}
    >
      {/* Atmospheric grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,165,233,0.8) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(14,165,233,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <RoomHeaderBar
          roomSlug="creation-corner"
          backLabel="← Home"
          diName={di.publicName}
          diReady={isReady}
          onDiToggle={() => setDiOpen((o) => !o)}
        />

        {/* ── Workshop title ──────────────────────────────────────────────── */}
        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <span className="text-sky-400">⚗</span> The Workshop
          </h1>
          <p className="mt-1 text-sm text-gv-text-secondary">
            Raw material in. Finished artifacts out. The Art Teacher sees what
            it wants to become.
          </p>
        </div>

        <section className="mb-6 space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gv-aurora-amber">
              Synthesis workbench
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-gv-text-primary">
              Shape the active blueprint before forging it.
            </h2>
          </div>
          <BlueprintGenerativeWorkbench
            blueprint={selectedBlueprint}
            blueprints={blueprints}
            onSelectBlueprint={(nextBlueprint) =>
              setSelectedBlueprintId(nextBlueprint.id)
            }
            currentUserId={user?.id}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* ── Left column: workbench ──────────────────────────────────── */}
          <div className="space-y-5">
            {/* Raw material input */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">
                Raw Material
              </h2>
              <input
                ref={sourceFileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (file) void handleSourceFileSelected(file);
                }}
              />
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => sourceFileInputRef.current?.click()}
                  className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs font-medium text-sky-100 transition-colors hover:bg-sky-300/15"
                >
                  Select uploaded material
                </button>
                {selectedUploadName ? (
                  <span className="text-xs text-sky-300">
                    Using: {selectedUploadName}
                  </span>
                ) : null}
              </div>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Paste anything here — notes, fragments, voice transcripts, half-formed ideas. The Art Teacher will know what to do."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-gv-text-primary placeholder:text-gv-text-secondary/50 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
                rows={6}
              />
              {selectedBlueprint && !freeText && (
                <p className="mt-2 text-xs text-gv-text-secondary">
                  Using blueprint:{" "}
                  <span className="text-sky-400">
                    {selectedBlueprint.title}
                  </span>
                </p>
              )}
              {incomingSourceRefs.length > 0 ? (
                <div className="mt-3 rounded-lg border border-sky-300/20 bg-sky-300/5 px-3 py-2 text-xs text-sky-100">
                  <p className="font-semibold">Originating source lineage</p>
                  {incomingSourceRefs.map((sourceRef) => (
                    <p key={sourceRef} className="mt-1 break-all font-mono">
                      {sourceRef}
                    </p>
                  ))}
                </div>
              ) : null}
            </section>

            {/* Artifact type grid */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">
                Output Format
              </h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {ARTIFACT_TYPES.map((at) => (
                  <button
                    key={at.value}
                    onClick={() => setArtifactType(at.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-all ${
                      artifactType === at.value
                        ? "border-sky-500/60 bg-sky-500/10 text-sky-300"
                        : "border-white/10 bg-white/[0.02] text-gv-text-secondary hover:border-white/20 hover:text-gv-text-primary"
                    }`}
                  >
                    <span className="text-lg">{at.glyph}</span>
                    <span className="text-center leading-tight">
                      {at.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Style + destination row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">
                  Synthesis Style
                </h2>
                <div className="space-y-1">
                  {SYNTHESIS_STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSynthStyle(s.value)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-all ${
                        synthStyle === s.value
                          ? "bg-sky-500/10 text-sky-300"
                          : "text-gv-text-secondary hover:bg-white/[0.04] hover:text-gv-text-primary"
                      }`}
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="text-[10px] opacity-60">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">
                  Destination
                </h2>
                <div className="space-y-1">
                  {DESTINATIONS.filter((d) =>
                    isDestinationAllowed(artifactType, d.value),
                  ).map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDestination(d.value)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-all ${
                        destination === d.value
                          ? "bg-purple-500/10 text-purple-300"
                          : "text-gv-text-secondary hover:bg-white/[0.04] hover:text-gv-text-primary"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Custom title (optional)"
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-gv-text-primary placeholder:text-gv-text-secondary/50 focus:border-sky-500/40 focus:outline-none"
                  />
                </div>
              </section>
            </div>

            {/* Forge button */}
            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="w-full rounded-2xl border border-sky-500/30 bg-sky-500/10 py-4 text-sm font-semibold text-sky-300 transition-all hover:bg-sky-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSynthesizing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                  Forging…
                </span>
              ) : (
                "⚗ Synthesize"
              )}
            </button>

            {/* Error */}
            {synthError && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                {synthError}
              </p>
            )}

            {/* Result panel */}
            {result && (
              <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-emerald-300">
                      {result.title}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-gv-text-secondary">
                      {result.artifact_type} · {result.generation_mode} · PLK{" "}
                      {(result.plk_resonance_score * 100).toFixed(0)}% ·{" "}
                      {result.latency_ms.toFixed(0)}ms
                    </p>
                    {result.codex && (
                      <p className="mt-1 text-[10px] text-sky-300">
                        Codex {result.codex.artifact.contractVersion} ·{" "}
                        {result.codex.artifact.kind} ·{" "}
                        {result.codex.artifact.securityClass} ·{" "}
                        {result.codex.artifact.templateKey}
                        {result.fallback_used && (
                          <span className="ml-2 text-amber-400">· local</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      onClick={() => handleDownload("markdown")}
                      className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20"
                    >
                      Download MD
                    </button>
                    <button
                      onClick={() => handleDownload("html")}
                      className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-300 hover:bg-sky-500/20"
                    >
                      Download HTML
                    </button>
                    <button
                      onClick={() => handleDownload("json")}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gv-text-secondary hover:text-gv-text-primary"
                    >
                      Metadata JSON
                    </button>
                  </div>
                  {result.codex?.jobs?.some(
                    (job) =>
                      job.status === "pending" || job.status === "running",
                  ) && (
                    <button
                      onClick={handleRenderCodexExports}
                      disabled={isRenderingExports}
                      className="shrink-0 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-300 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRenderingExports ? "Rendering..." : "Render exports"}
                    </button>
                  )}
                </div>

                {result.codex ? (
                  <div className="mt-4 space-y-3">
                    <section className="overflow-hidden rounded-xl border border-white/10 bg-black/35">
                      <div className="border-b border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-sky-300">
                        Rendered preview
                      </div>
                      <div className="relative">
                        {!previewLoaded && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                          </div>
                        )}
                        <iframe
                          key={result.codex?.artifact.id ?? result.title}
                          title={`${result.title} preview`}
                          srcDoc={
                            result.previewHtml ??
                            buildCreationCornerHtml(result)
                          }
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                          onLoad={() => setPreviewLoaded(true)}
                          className="min-h-[32rem] w-full bg-black"
                        />
                      </div>
                    </section>
                    {nextGenSceneGraph ? (
                      <section className="rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-3">
                        <GestaltRenderSurface
                          graph={nextGenSceneGraph}
                          showToolbar={false}
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={handleNextGenRender}
                            disabled={isNextGenRendering}
                            className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isNextGenRendering
                              ? "Submitting to render ledger..."
                              : renderLedgerState === "failed"
                                ? "Retry durable render"
                                : "Create durable render"}
                          </button>
                          {renderLedgerState === "ready" &&
                          destination === "dynamic_inner_world" ? (
                            <button
                              type="button"
                              onClick={handleProjectToInnerWorld}
                              className="rounded-lg border border-purple-300/25 bg-purple-300/10 px-3 py-1.5 text-xs font-semibold text-purple-100 hover:bg-purple-300/20"
                            >
                              Project to Inner World
                            </button>
                          ) : null}
                          {renderLedgerState === "projection_pending" ? (
                            <span className="text-xs text-purple-200">
                              Writing projection receipt…
                            </span>
                          ) : null}
                          {renderLedgerState === "projected" ? (
                            <span className="text-xs font-semibold text-emerald-300">
                              Projected with durable receipt
                            </span>
                          ) : null}
                          <span className="text-xs text-gv-text-muted">
                            Scene graph preview preserves nodes, provenance,
                            diagnostics, and export targets before server
                            orchestration.
                          </span>
                        </div>
                        {renderLedgerState === "local_preview" ||
                        renderLedgerState === "failed" ? (
                          <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                            Local preview — not yet saved to the render ledger
                          </p>
                        ) : null}
                        {renderLedgerState &&
                        !["local_preview", "failed", "projected"].includes(
                          renderLedgerState,
                        ) ? (
                          <p className="mt-3 text-xs text-cyan-100">
                            Render ledger:{" "}
                            {renderLedgerState.replaceAll("_", " ")}
                          </p>
                        ) : null}
                        {nextGenRenderResult ? (
                          <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-[11px] text-cyan-50">
                            {JSON.stringify(nextGenRenderResult, null, 2)}
                          </pre>
                        ) : null}
                      </section>
                    ) : null}
                    <ArtifactExportViewer
                      artifact={result.codex.artifact}
                      defaultFormat="html"
                      retrievalMode="preview"
                      fallbackHtml={buildCreationCornerHtml(result)}
                    />
                  </div>
                ) : result.content ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-gv-text-primary">
                    {result.content}
                  </pre>
                ) : null}

                {result.image_b64 && (
                  <img
                    src={`data:image/jpeg;base64,${result.image_b64}`}
                    alt={result.title}
                    className="mt-3 w-full rounded-xl border border-white/10"
                  />
                )}

                {result.image_prompt && !result.image_b64 && (
                  <div className="mt-3">
                    <p className="mb-1 text-[10px] text-gv-text-secondary">
                      Image prompt ready:
                    </p>
                    <pre className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-sky-200">
                      {result.image_prompt}
                    </pre>
                  </div>
                )}

                {result.warnings.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="text-[10px] text-amber-400/70">
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* Blueprint library */}
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-sky-400">
                Blueprint Library
              </h2>
              <BlueprintLibrary
                blueprints={blueprints}
                selectedId={selectedBlueprint?.id ?? null}
                onSelect={(b) => setSelectedBlueprintId(b.id)}
                onDelete={handleDeleteBlueprint}
              />
            </section>
          </div>

          {/* ── Right column: DI panel ──────────────────────────────────── */}
          {diOpen && (
            <aside className="flex flex-col rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-purple-300">
                    {di.publicName}
                  </p>
                  <p className="text-[10px] text-gv-text-secondary">
                    Creation Corner · Art Teacher
                  </p>
                </div>
                <button
                  onClick={() => setDiOpen(false)}
                  className="text-xs text-gv-text-secondary hover:text-gv-text-primary"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-6 ${
                        msg.role === "user"
                          ? "bg-sky-500/15 text-sky-100"
                          : "bg-purple-500/10 text-purple-100"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/10 px-4 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={diInput}
                    onChange={(e) => setDiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (diInput.trim()) {
                          void sendMessage(diInput.trim());
                          setDiInput("");
                        }
                      }
                    }}
                    placeholder="Ask the Art Teacher…"
                    className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-gv-text-primary placeholder:text-gv-text-secondary/50 focus:border-purple-500/40 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (diInput.trim()) {
                        void sendMessage(diInput.trim());
                        setDiInput("");
                      }
                    }}
                    className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs text-purple-300 hover:bg-purple-500/20"
                  >
                    →
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
