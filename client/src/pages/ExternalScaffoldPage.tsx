import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowRight,
  Archive,
  Check,
  CircleDot,
  GitBranch,
  FileDown,
  Layers3,
  Mic,
  MicOff,
  Orbit,
  Paperclip,
  RefreshCcw,
  Sparkles,
  Trash2,
  X,
  SendHorizonal,
  RotateCcw,
} from "lucide-react";
import {
  DEMO_PENDING_ORBS,
  SCAFFOLD_QUEUE_EVENT,
  SOURCE_LABELS,
  TYPE_COLORS,
  appendBlueprint,
  appendScaffoldQueue,
  applyBillyAssistToOrb,
  buildExternalScaffold,
  buildBlueprintFromCaptures,
  createCaptureOrb,
  applyExternalScaffoldDiToOrb,
  readApprovedOrbs,
  readBlueprints,
  readScaffoldQueue,
  removeApprovedOrb,
  removeScaffoldQueueOrb,
  resolveCaptureFileName,
  writeApprovedOrbs,
  writeScaffoldQueue,
  type ArtifactType,
  type CaptureOrb,
  type CaptureSource,
  type CaptureBlueprint,
  type ExternalScaffoldModel,
  type ScaffoldArtifact,
  type ScaffoldConnection,
} from "@/components/Scaffold";
import {
  approveScaffoldOrbThroughPipeline,
  denyScaffoldOrbThroughPipeline,
} from "@/lib/profilePipeline/scaffoldRouting";
import {
  archiveScaffoldOrb,
  buildScaffoldPreviewDetails,
  readArchivedScaffoldOrbs,
  restoreScaffoldOrb,
  writeArchivedScaffoldOrbs,
  type ScaffoldPreviewDetails,
} from "@/lib/scaffoldStorage";
import { readUserSurfaceSettings } from "@/lib/userSurfaceSettings";

type RackFilter = "all" | ArtifactType | CaptureSource;

type ProjectedArtifact = ScaffoldArtifact & {
  left: number;
  top: number;
  displaySize: number;
  opacity: number;
};

const RACK_FILTERS: { label: string; value: RackFilter }[] = [
  { label: "All", value: "all" },
  { label: "Journal", value: "journal" },
  { label: "Audio", value: "audio" },
  { label: "Image", value: "image" },
  { label: "Code", value: "code" },
  { label: "Fragments", value: "fragment" },
  { label: "Context", value: "context" },
];

function getSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function normalizeTranscript(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function projectArtifact(artifact: ScaffoldArtifact, expanded: boolean): ProjectedArtifact {
  const spread = expanded ? 2.2 : 1;
  const left = Math.max(6, Math.min(94, 50 + artifact.position.x * spread * 2.1));
  const top = Math.max(7, Math.min(91, 52 + artifact.position.y * spread * 1.74 - artifact.position.z * 0.035));
  const displaySize = Math.max(14, Math.min(54, artifact.size * (expanded ? 34 : 24)));
  const opacity = Math.max(0.56, Math.min(1, artifact.resonance / 100));

  return { ...artifact, left, top, displaySize, opacity };
}

function downloadTextFile(fileName: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function connectionLine(connection: ScaffoldConnection, points: ProjectedArtifact[]) {
  const source = points.find((point) => point.id === connection.sourceId);
  const target = points.find((point) => point.id === connection.targetId);
  if (!source || !target) {
    return null;
  }

  return { source, target };
}

export default function ExternalScaffoldPage() {
  const [, setLocation] = useLocation();
  const [draftText, setDraftText] = useState("");
  const [pendingOrbs, setPendingOrbs] = useState<CaptureOrb[]>(() => readScaffoldQueue());
  const [approvedOrbs, setApprovedOrbs] = useState<CaptureOrb[]>(() => readApprovedOrbs());
  const [archivedOrbs, setArchivedOrbs] = useState<CaptureOrb[]>(() => readArchivedScaffoldOrbs());
  const [blueprints, setBlueprints] = useState<CaptureBlueprint[]>(() => readBlueprints());
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);
  const [expandedOrbId, setExpandedOrbId] = useState<string | null>(null);
  const [rackFilter, setRackFilter] = useState<RackFilter>("all");
  const [expandedGalaxy, setExpandedGalaxy] = useState(false);
  const billyHelping = true;
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [liveInterim, setLiveInterim] = useState("");
  const recognitionRef = React.useRef<any>(null);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(() => {
    const settings = readUserSurfaceSettings();
    return settings.lowBandwidthMode || !settings.motionHints;
  });

  const scaffold: ExternalScaffoldModel = useMemo(() => buildExternalScaffold(approvedOrbs), [approvedOrbs]);
  const projectedArtifacts = useMemo(
    () => scaffold.artifacts.map((artifact) => projectArtifact(artifact, expandedGalaxy)),
    [scaffold.artifacts, expandedGalaxy],
  );
  const selectedArtifact = useMemo(() => {
    return scaffold.artifacts.find((artifact) => artifact.id === selectedArtifactId) ?? scaffold.artifacts[0];
  }, [scaffold.artifacts, selectedArtifactId]);
  const selectedApprovedOrb = useMemo(() => {
    return selectedArtifact ? approvedOrbs.find((orb) => orb.id === selectedArtifact.orbId) ?? null : null;
  }, [approvedOrbs, selectedArtifact]);

  const filteredPendingOrbs = useMemo(() => {
    if (rackFilter === "all") {
      return pendingOrbs;
    }

    return pendingOrbs.filter((orb) => orb.type === rackFilter || orb.source === rackFilter);
  }, [pendingOrbs, rackFilter]);

  const refreshFromStorage = useCallback(() => {
    setPendingOrbs(readScaffoldQueue());
    setApprovedOrbs(readApprovedOrbs());
    setArchivedOrbs(readArchivedScaffoldOrbs());
    setBlueprints(readBlueprints());
  }, []);

  useEffect(() => {
    setIsSpeechSupported(Boolean(getSpeechRecognition()));

    const onQueueUpdated = () => refreshFromStorage();
    const syncSurfaceSettings = () => {
      const settings = readUserSurfaceSettings();
      setLowBandwidthMode(settings.lowBandwidthMode || !settings.motionHints);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key?.includes("gestaltview.externalScaffold")) {
        refreshFromStorage();
      }
      if (event.key?.includes("gestaltview.settings.surface")) {
        syncSurfaceSettings();
      }
    };

    syncSurfaceSettings();
    window.addEventListener(SCAFFOLD_QUEUE_EVENT, onQueueUpdated);
    window.addEventListener("storage", onStorage);
    window.addEventListener("gestaltview:settings:surface", syncSurfaceSettings);

    return () => {
      recognitionRef.current?.stop?.();
      window.removeEventListener(SCAFFOLD_QUEUE_EVENT, onQueueUpdated);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("gestaltview:settings:surface", syncSurfaceSettings);
    };
  }, [refreshFromStorage]);

  const pushDraftToQueue = useCallback((source: CaptureSource = "typed") => {
    const orb = createCaptureOrb({
      text: draftText,
      source,
      action: "send-to-external-scaffold",
      surface: "forward",
    });

    if (!orb) {
      return;
    }

    const billyOrb = billyHelping ? applyBillyAssistToOrb(orb, "capture-integrity") : orb;
    const scaffoldOrb = applyExternalScaffoldDiToOrb(billyOrb, "capture-extraction");
    const nextQueue = appendScaffoldQueue({ ...scaffoldOrb, status: "pending" });
    setPendingOrbs(nextQueue);
    setExpandedOrbId(scaffoldOrb.id);
    setDraftText("");
    toast.success("Sent to External Scaffold", {
      description: scaffoldOrb.title,
      action: {
        label: "Open there",
        onClick: () => setLocation("/external-scaffold"),
      },
    });
  }, [billyHelping, draftText]);

  const startVoice = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setVoiceError("Voice capture is not supported in this browser yet. Typed capture still uses the same external scaffold queue.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setVoiceError(null);
      setLiveInterim("");
      setIsListening(true);
    };

    recognition.onend = () => {
      setLiveInterim("");
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setVoiceError(event?.error ? `Voice capture stopped: ${event.error}` : "Voice capture stopped.");
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? "";
        if (result.isFinal) {
          finalChunk += transcript;
        } else {
          interimChunk += transcript;
        }
      }

      const finalText = normalizeTranscript(finalChunk);
      const interimText = normalizeTranscript(interimChunk);

      if (interimText) {
        setLiveInterim(interimText);
        setDraftText(interimText);
      }

      if (finalText) {
        const orb = createCaptureOrb({
          text: finalText,
          source: "voice",
          type: "audio",
          action: "send-to-external-scaffold",
          surface: "forward",
        });

        if (orb) {
          const billyOrb = billyHelping ? applyBillyAssistToOrb(orb, "capture-integrity") : orb;
          const scaffoldOrb = applyExternalScaffoldDiToOrb(billyOrb, "capture-extraction");
          const nextQueue = appendScaffoldQueue({ ...scaffoldOrb, status: "pending" });
          setPendingOrbs(nextQueue);
          setExpandedOrbId(scaffoldOrb.id);
        }

        setLiveInterim("");
        setDraftText(finalText);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [billyHelping]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop?.();
    setIsListening(false);
  }, []);

  const approvePendingOrb = useCallback(async (orb: CaptureOrb) => {
    const billyOrb = billyHelping ? applyBillyAssistToOrb(orb, "display-integrity") : orb;
    const inspectedOrb = applyExternalScaffoldDiToOrb(billyOrb, "display-presentation");
    const { orb: approved } = await approveScaffoldOrbThroughPipeline({
      orb: inspectedOrb,
    });

    setPendingOrbs(readScaffoldQueue());
    setApprovedOrbs(readApprovedOrbs());
    setExpandedOrbId(null);
    setSelectedArtifactId(approved.id.replace(/^orb-/, "artifact-"));
    toast.success("Approved into External Scaffold", {
      description: approved.title,
      action: {
        label: "Open there",
        onClick: () => setLocation("/external-scaffold"),
      },
    });
  }, [billyHelping]);

  const rejectPendingOrb = useCallback(async (orb: CaptureOrb) => {
    await denyScaffoldOrbThroughPipeline({ orb });
    setPendingOrbs(readScaffoldQueue());
    setExpandedOrbId((current) => (current === orb.id ? null : current));
    toast.message("Removed from the pending rack");
  }, []);

  const clearScaffold = useCallback(() => {
    writeScaffoldQueue([]);
    writeApprovedOrbs([]);
    writeArchivedScaffoldOrbs([]);
    setPendingOrbs([]);
    setApprovedOrbs([]);
    setArchivedOrbs([]);
    setSelectedArtifactId(null);
    setExpandedOrbId(null);
    toast.message("External Scaffold cleared");
  }, []);

  const loadDemoCaptures = useCallback(() => {
    const next = [...DEMO_PENDING_ORBS, ...pendingOrbs].filter((orb, index, all) => all.findIndex((item) => item.id === orb.id) === index);
    writeScaffoldQueue(next);
    setPendingOrbs(next);
    setExpandedOrbId(next[0]?.id ?? null);
    toast.message("Demo captures loaded");
  }, [pendingOrbs]);

  const sendArtifactToCreationCorner = useCallback((artifact: ScaffoldArtifact | null) => {
    if (!artifact) {
      return;
    }

    const orb = createCaptureOrb({
      text: artifact.content,
      source: artifact.source,
      type: artifact.type,
      action: "send-to-external-scaffold",
      context: artifact.summary,
      meaning: "Approved scaffold artifact promoted into Creation Corner",
      anchor: artifact.title,
    });

    if (!orb) {
      return;
    }

    const scaffoldOrb = applyExternalScaffoldDiToOrb(orb, "capture-extraction");
    const blueprint = buildBlueprintFromCaptures([scaffoldOrb], `${artifact.title} Blueprint`, {
      summary: "An approved scaffold artifact promoted into Creation Corner.",
      status: "ready",
      notes: ["Promoted from External Scaffold."],
    });
    appendBlueprint(blueprint);
    setBlueprints(readBlueprints());
    toast.success("Sent to Creation Corner", {
      description: artifact.title,
      action: {
        label: "Open there",
        onClick: () => setLocation("/creation-corner"),
      },
    });
  }, []);

  const mergeRecommendedOrbs = useCallback(() => {
    const recommended = pendingOrbs.slice(0, 3);
    if (recommended.length === 0) {
      return;
    }

    appendBlueprint(
      buildBlueprintFromCaptures(recommended, "Recommended Merge", {
        summary: "A suggested merge of the highest-priority pending orbs.",
        status: "draft",
      }),
    );
    setBlueprints(readBlueprints());
    toast.message("Recommended orbs merged into a blueprint");
  }, [pendingOrbs]);

  const downloadArtifactMetadata = useCallback((artifact: ScaffoldArtifact | null) => {
    if (!artifact) {
      return;
    }

    downloadTextFile(
      `${artifact.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "artifact"}-metadata.json`,
      JSON.stringify(artifact, null, 2),
      "application/json;charset=utf-8",
    );
  }, []);

  const deletePendingOrb = useCallback((orbId: string) => {
    removeScaffoldQueueOrb(orbId);
    setPendingOrbs(readScaffoldQueue());
  }, []);

  const deleteApprovedArtifact = useCallback((orbId: string) => {
    removeApprovedOrb(orbId);
    setApprovedOrbs(readApprovedOrbs());
  }, []);

  const archiveOrb = useCallback((orbId: string) => {
    const next = archiveScaffoldOrb(orbId);
    setPendingOrbs(next.pending);
    setApprovedOrbs(next.approved);
    setArchivedOrbs(next.archived);
    setExpandedOrbId((current) => (current === orbId ? null : current));
    setSelectedArtifactId((current) => (current === orbId.replace(/^orb-/, "artifact-") ? null : current));
    toast.message("Moved to scaffold archive");
  }, []);

  const restoreOrb = useCallback((orbId: string) => {
    const next = restoreScaffoldOrb(orbId);
    setPendingOrbs(next.pending);
    setApprovedOrbs(next.approved);
    setArchivedOrbs(next.archived);
    toast.message("Restored from scaffold archive");
  }, []);

  const sendArtifactToInnerWorld = useCallback((artifact: ScaffoldArtifact | null) => {
    if (!artifact) {
      return;
    }

    const orb = createCaptureOrb({
      text: artifact.content,
      source: artifact.source,
      type: artifact.type,
      action: "send-to-dynamic-inner-world",
      context: artifact.summary,
      meaning: "Approved scaffold artifact routed back into the Inner World",
      anchor: artifact.title,
    });

    if (!orb) {
      return;
    }

    const scaffoldOrb = applyExternalScaffoldDiToOrb(orb, "capture-extraction");
    appendScaffoldQueue({
      ...scaffoldOrb,
      status: "pending",
      metadata: {
        ...scaffoldOrb.metadata,
        context: artifact.summary,
        anchor: artifact.title,
        meaning: "Approved scaffold artifact routed back into the Inner World",
      },
    });
    setPendingOrbs(readScaffoldQueue());
  }, []);

  return (
    <main className="operation-render-shell relative min-h-screen overflow-hidden bg-[#020305] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 16% 18%, rgba(18,214,255,0.16), transparent 24%), radial-gradient(circle at 84% 12%, rgba(191,0,255,0.16), transparent 25%), radial-gradient(circle at 50% 86%, rgba(255,60,172,0.08), transparent 31%), linear-gradient(180deg, rgba(255,255,255,0.028), transparent 34%)",
        }}
      />
      {!lowBandwidthMode ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
        />
      ) : null}

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/blackboard-room"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white"
              >
                Blackboard Room
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/dynamic-inner-world"
                className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/16 bg-fuchsia-300/10 px-4 py-2 text-sm text-white/72 transition-colors hover:text-white"
              >
                Dynamic Inner World
                <Layers3 className="h-4 w-4" />
              </a>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-cyan-100/85">
                <Sparkles className="h-3.5 w-3.5" />
                artifact-only scaffold
              </span>
            </div>

            <header>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#12D6FF]">
                External Scaffold of You
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                A compressed artifact galaxy, not an assistant-shaped visual layer.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/68">
                Captures arrive from the Blackboard or Dynamic Inner World as pending orbs. Approval compresses them into tagged artifacts with context, anchor, meaning, memory, date, and source. Connections appear only when the system has enough evidence.
              </p>
            </header>

            <Panel glow="cyan">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                    external intake
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Capture without forcing structure.</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    This local intake mirrors the Blackboard handoff: a fragment becomes an orb first, then waits for approval before becoming scaffold memory.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopVoice : startVoice}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                      isListening
                        ? "border-rose-300/25 bg-rose-300/12 text-rose-50"
                        : "border-white/12 bg-white/[0.05] text-white/72 hover:text-white"
                    }`}
                    aria-pressed={isListening}
                  >
                    <Mic className="h-4 w-4" />
                    {isListening ? "Stop voice" : "Voice"}
                  </button>
                </div>
              </div>

              <div
                className="mt-5 min-h-[172px] rounded-[1.5rem] border border-dashed border-white/12 bg-[#05090c] p-4"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              >
                <textarea
                  value={liveInterim || draftText}
                  onChange={(event) => {
                    setLiveInterim("");
                    setDraftText(event.target.value);
                  }}
                  className="min-h-[138px] w-full resize-none bg-transparent text-[1.15rem] leading-[1.55] text-[#12D6FF] outline-none placeholder:text-white/22"
                  placeholder="Type or speak a fragment. It will queue as an orb, not auto-organize itself."
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => pushDraftToQueue("typed")}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50 transition-colors hover:bg-cyan-300/15"
                >
                  <Paperclip className="h-4 w-4" />
                  Queue as orb
                </button>
                <button
                  type="button"
                  onClick={loadDemoCaptures}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-sm text-violet-50 transition-colors hover:bg-violet-300/15"
                >
                  <Sparkles className="h-4 w-4" />
                  Load demo captures
                </button>
                <button
                  type="button"
                  onClick={clearScaffold}
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/55 transition-colors hover:text-white"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Clear local scaffold
                </button>
              </div>

              {!isSpeechSupported && (
                <p className="mt-3 text-sm text-amber-300/90">
                  Voice capture is not supported in this browser yet. Typed capture still routes through the same orb queue.
                </p>
              )}
              {voiceError && <p className="mt-3 text-sm text-rose-300">{voiceError}</p>}

            </Panel>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="pending rack" value={pendingOrbs.length.toString()} detail="awaiting approval" />
              <MetricCard label="artifacts" value={approvedOrbs.length.toString()} detail="compressed memory" />
              <MetricCard label="archived" value={archivedOrbs.length.toString()} detail="restorable local items" />
            </div>
          </div>

          <Panel glow="cyan" className="operation-render-surface-active relative min-h-[720px] overflow-hidden bg-black/35 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#12D6FF]">
                  data galaxy // v.05
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Approved artifacts become spatial memory.</h2>
              </div>
              <button
                type="button"
                onClick={() => setExpandedGalaxy((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/65 transition-colors hover:text-white"
              >
                <Orbit className="h-4 w-4 text-[#12D6FF]" />
                {expandedGalaxy ? "Compress data" : "Initiate expansion"}
              </button>
            </div>

            <DataGalaxy
              expanded={expandedGalaxy}
              scaffold={scaffold}
              points={projectedArtifacts}
              selectedArtifactId={selectedArtifactId}
              onSelect={setSelectedArtifactId}
            />

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <NodeInspector
                artifact={selectedArtifact}
                onSendToCreationCorner={sendArtifactToCreationCorner}
                onSendToInnerWorld={sendArtifactToInnerWorld}
                onDownloadMetadata={downloadArtifactMetadata}
                onDeleteArtifact={selectedArtifact ? () => deleteApprovedArtifact(selectedArtifact.orbId) : undefined}
                onArchiveArtifact={selectedArtifact ? () => archiveOrb(selectedArtifact.orbId) : undefined}
                previewDetails={selectedArtifact ? buildScaffoldPreviewDetails(
                  selectedApprovedOrb ?? {
                    id: selectedArtifact.orbId,
                    label: selectedArtifact.title,
                    title: selectedArtifact.title,
                    text: selectedArtifact.content,
                    source: selectedArtifact.source,
                    type: selectedArtifact.type,
                    tags: selectedArtifact.tags,
                    resonance: selectedArtifact.resonance,
                    color: selectedArtifact.color,
                    createdAt: selectedArtifact.metadata.approvedAt,
                    status: "approved",
                    metadata: {
                      createdAt: selectedArtifact.metadata.approvedAt,
                      context: selectedArtifact.summary,
                      anchor: selectedArtifact.title,
                      memory: selectedArtifact.content,
                    },
                  },
                  { state: "approved", relatedOrbs: approvedOrbs },
                ) : undefined}
              />
              <Legend />
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <Panel glow="purple" className="operation-render-surface-artifact">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#BF00FF]">
                  orb approval rack
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Holding area before compression.</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Rejecting an orb removes it from the external scaffold queue without erasing the original Blackboard or Inner World source.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={mergeRecommendedOrbs}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-emerald-50 transition-colors hover:bg-emerald-300/16"
                >
                  <SendHorizonal className="h-4 w-4" />
                  Merge recommended orbs
                </button>
                <GitBranch className="h-5 w-5 text-[#BF00FF]" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {RACK_FILTERS.map((filter) => {
                const active = filter.value === rackFilter;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setRackFilter(filter.value)}
                    className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors ${
                      active
                        ? "border-white/18 bg-white/10 text-white"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <AnimatePresence initial={false}>
                {filteredPendingOrbs.map((orb) => (
                  <ApprovalOrb
                    key={orb.id}
                    orb={orb}
                    expanded={expandedOrbId === orb.id}
                    onToggle={() => setExpandedOrbId((current) => (current === orb.id ? null : orb.id))}
                    onApprove={() => approvePendingOrb(orb)}
                    onReject={() => rejectPendingOrb(orb)}
                    onDelete={() => deletePendingOrb(orb.id)}
                    onArchive={() => archiveOrb(orb.id)}
                    previewDetails={buildScaffoldPreviewDetails(orb, {
                      state: "pending",
                      relatedOrbs: [...pendingOrbs, ...approvedOrbs],
                    })}
                  />
                ))}
              </AnimatePresence>
            </div>

            {filteredPendingOrbs.length === 0 && (
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-6 text-center text-sm text-white/45">
                No pending orbs in this lane. Send something from Blackboard, Dynamic Inner World, or the intake above.
              </div>
            )}
          </Panel>

          <Panel glow="cyan" className="operation-render-surface">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#12D6FF]">
                  scaffold archive
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Paused, not erased.</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Archived scaffold orbs leave active views but can be restored to their previous pending or approved lane.
                </p>
              </div>
              <Archive className="h-5 w-5 text-[#12D6FF]" />
            </div>

            <div className="mt-5 space-y-3">
              {archivedOrbs.slice(0, 8).map((orb) => {
                const preview = buildScaffoldPreviewDetails(orb, { state: "archived", relatedOrbs: [...pendingOrbs, ...approvedOrbs] });
                return (
                  <article key={orb.id} className="rounded-[1.25rem] border border-white/10 bg-black/24 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">{preview.stateLabel}</p>
                        <h3 className="mt-2 text-base font-semibold text-white">{orb.title}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => restoreOrb(orb.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-50 transition-colors hover:bg-cyan-300/15"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/55">{orb.text}</p>
                  </article>
                );
              })}
            </div>

            {archivedOrbs.length === 0 && (
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-6 text-center text-sm text-white/45">
                No archived scaffold items yet.
              </div>
            )}
          </Panel>

        </section>
      </div>
    </main>
  );
}

function DataGalaxy({
  expanded,
  scaffold,
  points,
  selectedArtifactId,
  onSelect,
}: {
  expanded: boolean;
  scaffold: ExternalScaffoldModel;
  points: ProjectedArtifact[];
  selectedArtifactId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="operation-render-surface-artifact relative mt-5 h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#020405]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-65"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(18,214,255,0.14), transparent 12%), radial-gradient(circle at 50% 50%, transparent 0 20%, rgba(191,0,255,0.08) 20.4% 20.8%, transparent 21.2% 34%, rgba(255,60,172,0.06) 34.4% 34.8%, transparent 35.2% 48%, rgba(0,255,102,0.05) 48.4% 48.8%, transparent 49.2% 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          maskImage: "radial-gradient(circle at center, black 20%, transparent 82%)",
        }}
      />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <ellipse cx="50" cy="50" rx="31" ry="15" fill="none" stroke="rgba(18,214,255,0.22)" strokeWidth="0.25" />
        <ellipse cx="50" cy="50" rx="41" ry="23" fill="none" stroke="rgba(191,0,255,0.18)" strokeWidth="0.25" transform="rotate(-18 50 50)" />
        <ellipse cx="50" cy="50" rx="20" ry="43" fill="none" stroke="rgba(255,60,172,0.16)" strokeWidth="0.25" transform="rotate(28 50 50)" />
        {scaffold.connections.map((connection) => {
          const line = connectionLine(connection, points);
          if (!line) {
            return null;
          }
          return (
            <line
              key={connection.id}
              x1={line.source.left}
              y1={line.source.top}
              x2={line.target.left}
              y2={line.target.top}
              stroke="rgba(255,255,255,0.24)"
              strokeWidth={0.16 + connection.strength * 0.22}
              strokeDasharray="1.3 1.5"
            />
          );
        })}
      </svg>

      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <div className="operation-render-surface max-w-sm rounded-[1.5rem] border border-white/10 bg-black/45 p-6 backdrop-blur-md">
            <CircleDot className="mx-auto h-8 w-8 text-[#12D6FF]" />
            <h3 className="mt-4 text-xl font-semibold">No approved artifacts yet.</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              The scaffold stays empty until the user approves an orb. No forced constellation, no assistant-shaped overlay, no hidden organizing tax.
            </p>
          </div>
        </div>
      )}

      {points.map((artifact, index) => {
        const active = artifact.id === selectedArtifactId;
        const pointStyle = {
          left: `${artifact.left}%`,
          top: `${artifact.top}%`,
          width: artifact.displaySize,
          height: artifact.displaySize,
          opacity: artifact.opacity,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.92), rgba(255,255,255,0.16) 18%, transparent 42%), radial-gradient(circle, ${artifact.color}cc, ${artifact.color}28 72%, transparent 76%)`,
          boxShadow: active
            ? `0 0 48px ${artifact.color}aa, inset 0 0 20px rgba(255,255,255,0.3)`
            : `0 0 28px ${artifact.color}66, inset 0 0 18px rgba(255,255,255,0.22)`,
          transitionDelay: `${Math.min(index * 18, 240)}ms`,
        } satisfies CSSProperties;

        return (
          <button
            key={artifact.id}
            type="button"
            onClick={() => onSelect(artifact.id)}
            className={`absolute rounded-full border transition-all duration-500 ${active ? "border-white/70" : "border-white/20 hover:border-white/50"}`}
            style={pointStyle}
            aria-label={`Inspect ${artifact.title}`}
          >
            {artifact.type === "fragment" && <span className="absolute inset-[-8px] rounded-full border border-red-400/20 animate-pulse" />}
          </button>
        );
      })}

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 backdrop-blur-md">
        {expanded ? "expanded fly-through geometry" : "compressed artifact orbit"}
      </div>
    </div>
  );
}

function Panel({ children, glow = "cyan", className = "" }: { children: React.ReactNode; glow?: "cyan" | "purple"; className?: string }) {
  const shadow = glow === "purple" ? "shadow-[0_0_70px_rgba(191,0,255,0.12)]" : "shadow-[0_0_70px_rgba(18,214,255,0.12)]";
  return (
    <div className={`operation-render-surface rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-md ${shadow} ${className}`}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="operation-render-surface rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/45">{detail}</p>
    </div>
  );
}

function ApprovalOrb({
  orb,
  expanded,
  onToggle,
  onApprove,
  onReject,
  onDelete,
  onArchive,
  previewDetails,
}: {
  orb: CaptureOrb;
  expanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onArchive: () => void;
  previewDetails: ScaffoldPreviewDetails;
}) {
  const presentation = orb.metadata.presentation;
  const accent = presentation?.accent ?? orb.color;
  const orbStyle = {
    borderColor: `${accent}44`,
    background: `radial-gradient(circle at 82% 20%, ${accent}33, transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.06), rgba(5,7,11,0.62))`,
    boxShadow: `0 18px 52px rgba(0,0,0,0.3), inset 0 0 28px ${accent}18`,
  } satisfies CSSProperties;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.94 }}
      className="operation-render-surface relative min-h-[206px] overflow-hidden rounded-[1.6rem] border p-4 text-left"
      style={orbStyle}
    >
      <button type="button" onClick={onToggle} className="absolute inset-0 z-0" aria-label={`Inspect ${orb.title}`} />
      <div
        aria-hidden="true"
        className="absolute right-4 top-4 h-16 w-16 rounded-full border border-white/20"
        style={{
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), rgba(255,255,255,0.12) 18%, transparent 42%), radial-gradient(circle at 50% 50%, ${accent}88, transparent 74%)`,
          boxShadow: `0 0 32px ${accent}55, inset 0 0 22px rgba(255,255,255,0.24)`,
        }}
      />
      <div className="pointer-events-none absolute right-5 top-5 h-14 w-14 rounded-full bg-white/15 blur-xl" />
      <div className="relative z-10 max-w-[70%]">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/42">
          {SOURCE_LABELS[orb.source]}
        </p>
        <h3 className="mt-3 text-lg font-semibold text-white">{orb.title}</h3>
        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">
          {orb.type} · resonance {orb.resonance}
        </p>
        {presentation ? (
          <p className="mt-2 inline-flex rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/58">
            {presentation.mode} / {presentation.motion}
          </p>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mt-4 overflow-hidden"
          >
            <p className="rounded-[1rem] border border-white/10 bg-black/30 p-3 text-sm leading-relaxed text-white/68">
              {orb.text}
            </p>
            <div className="mt-3 rounded-[1rem] border border-white/10 bg-black/24 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">{previewDetails.stateLabel}</p>
              <div className="mt-3 grid gap-2">
                {previewDetails.rows.map((row) => (
                  <div key={row.label} className="grid gap-1 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2 sm:grid-cols-[0.32fr_0.68fr]">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/36">{row.label}</span>
                    <span className="text-xs leading-5 text-white/62">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReject}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/52 transition-colors hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Deny
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/12 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-emerald-50 transition-colors hover:bg-emerald-300/18"
        >
          <Check className="h-3.5 w-3.5" />
          Approve
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-rose-50 transition-colors hover:bg-rose-300/16"
        >
          <X className="h-3.5 w-3.5" />
          Delete
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-cyan-50 transition-colors hover:bg-cyan-300/16"
        >
          <Archive className="h-3.5 w-3.5" />
          Archive
        </button>
      </div>
    </motion.article>
  );
}

function NodeInspector({
  artifact,
  onSendToCreationCorner,
  onSendToInnerWorld,
  onDownloadMetadata,
  onDeleteArtifact,
  onArchiveArtifact,
  previewDetails,
}: {
  artifact?: ScaffoldArtifact;
  onSendToCreationCorner: (artifact: ScaffoldArtifact | null) => void;
  onSendToInnerWorld: (artifact: ScaffoldArtifact | null) => void;
  onDownloadMetadata: (artifact: ScaffoldArtifact | null) => void;
  onDeleteArtifact?: () => void;
  onArchiveArtifact?: () => void;
  previewDetails?: ScaffoldPreviewDetails;
}) {
  if (!artifact) {
    return (
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/45">
        Approve an orb to inspect its compressed scaffold position.
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">selected artifact</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{artifact.title}</h3>
        </div>
        <span
          className="rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
          style={{ borderColor: `${artifact.color}55`, color: artifact.color }}
        >
          {artifact.type}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/62">{artifact.summary}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/48">
        <Coordinate label="x" value={artifact.position.x} />
        <Coordinate label="y" value={artifact.position.y} />
        <Coordinate label="z" value={artifact.position.z} />
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-white/35">
        {SOURCE_LABELS[artifact.source]} · resonance {artifact.resonance}
      </p>
      {artifact.metadata.presentation ? (
        <p className="mt-2 inline-flex rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/58">
          {artifact.metadata.presentation.mode} / {artifact.metadata.presentation.motion}
        </p>
      ) : null}
      {previewDetails ? (
        <div className="mt-4 rounded-[1rem] border border-white/10 bg-black/20 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/38">{previewDetails.stateLabel}</p>
          <div className="mt-3 grid gap-2">
            {previewDetails.rows.map((row) => (
              <div key={row.label} className="grid gap-1 rounded-xl border border-white/8 bg-white/[0.025] px-3 py-2 sm:grid-cols-[0.32fr_0.68fr]">
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/36">{row.label}</span>
                <span className="text-xs leading-5 text-white/62">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSendToCreationCorner(artifact)}
          className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-emerald-50 transition-colors hover:bg-emerald-300/16"
        >
          Send to Creation Corner
        </button>
        <button
          type="button"
          onClick={() => onSendToInnerWorld(artifact)}
          className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-fuchsia-50 transition-colors hover:bg-fuchsia-300/16"
        >
          Send to Inner World
        </button>
        <button
          type="button"
          onClick={() => onDownloadMetadata(artifact)}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/58 transition-colors hover:text-white"
        >
          <FileDown className="mr-2 inline-block h-3.5 w-3.5" />
          Download metadata
        </button>
        <button
          type="button"
          onClick={onDeleteArtifact}
          className="rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-rose-50 transition-colors hover:bg-rose-300/16"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onArchiveArtifact}
          className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-50 transition-colors hover:bg-cyan-300/16"
        >
          <Archive className="mr-2 inline-block h-3.5 w-3.5" />
          Archive
        </button>
      </div>
    </div>
  );
}

function Coordinate({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
      <p className="uppercase tracking-[0.2em] text-white/30">{label}</p>
      <p className="mt-1 font-mono text-white/68">{Math.round(value)}</p>
    </div>
  );
}

function Legend() {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">data types</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}` }} />
            <span className="text-xs uppercase tracking-[0.16em] text-white/52">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
