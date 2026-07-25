'use client';
/**
 * SessionRecapGenerator — GestaltView v2
 *
 * Generates an interactive HTML recap artifact from the current session's
 * captures and conversation history. Delegates the LLM call to the
 * /api/sessionRecap server route (llmRouter cascade).
 *
 * After generation the user sees an action tray with three options:
 *   • Download   — save HTML file to device
 *   • Creation Corner — fire CustomEvent so CreationCornerPage can receive it
 *   • File Explorer   — fire CustomEvent so file‑explorer panel can receive it
 *
 * The artifact is created with status:"draft" so it does NOT auto-appear in
 * the Dynamic Inner World hall until the user explicitly promotes it.
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Download,
  Palette,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { HtmlArtifactRenderer } from "@/lib/rendering";
import {
  requestOrchestrationDecision,
  requestOrchestrationExtraction,
} from "@/lib/orchestratorClient";
import {
  downloadSessionRecapArtifact,
  type SessionRecapDownloadFormat,
} from "@/lib/sessionRecapDownloads";
import {
  RECAP_VOICE_OPTIONS,
  cleanRecapHtml,
  getRecapVoiceLabel,
  normalizeRecapVoice,
  type RecapVoiceId,
} from "@shared/sessionRecap";
import type { RuntimeDailyEntry } from "@shared/orchestration/extraction";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecapCapture {
  id: string;
  title: string;
  content?: string;
  type?: string;
  surface?: string;
  metadata?: {
    context?: string;
    createdAt?: string;
    tags?: string[];
  };
}

export interface RecapMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RecapArtifact {
  id: string;
  title: string;
  type: "recap";
  content: string;
  surface: "forward";
  source: "session-recap";
  status: "draft";
  metadata: {
    sessionLabel: string;
    captureCount: number;
    generatedAt: string;
    context?: string;
    surface: "forward";
    createdAt: string;
    updatedAt: string;
    sourceDiId?: RecapVoiceId;
    sourceDiLabel?: string;
    moduleTargets?: string[];
    nuggetSummaries?: string[];
    extractionId?: string;
  };
}

interface SessionRecapGeneratorProps {
  captures: RecapCapture[];
  conversationHistory?: RecapMessage[];
  runtimeDailies?: RuntimeDailyEntry[];
  sessionLabel?: string;
  onArtifactReady: (artifact: RecapArtifact) => void;
  compact?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRecapArtifact(
  html: string,
  captures: RecapCapture[],
  sessionLabel: string,
  sourceDiId: RecapVoiceId,
  extraction?: { extractionId: string; moduleTargets: string[]; nuggetSummaries: string[] },
): RecapArtifact {
  const now = new Date().toISOString();
  const label = sessionLabel || "Session Recap";
  return {
    id: `recap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: `${label} · Recap`,
    type: "recap",
    content: html,
    surface: "forward",
    source: "session-recap",
    status: "draft", // stays hidden in Inner World hall until user promotes it
    metadata: {
      sessionLabel: label,
      captureCount: captures.length,
      generatedAt: now,
      context: `Generated recap for: ${label}`,
      surface: "forward",
      createdAt: now,
      updatedAt: now,
      sourceDiId,
      sourceDiLabel: getRecapVoiceLabel(sourceDiId),
      moduleTargets: extraction?.moduleTargets,
      nuggetSummaries: extraction?.nuggetSummaries,
      extractionId: extraction?.extractionId,
    },
  };
}

function slugifyStorageKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "session-recap";
}

function getRecapStorageKey(sessionLabel: string): string {
  return `gv.blackboard.recap.${slugifyStorageKey(sessionLabel)}.v1`;
}

function readStoredRecap(sessionLabel: string): { html: string; artifact: RecapArtifact } | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getRecapStorageKey(sessionLabel));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { html?: string; artifact?: RecapArtifact };
    if (typeof parsed.html !== "string" || !parsed.artifact) {
      return null;
    }

    return { html: parsed.html, artifact: parsed.artifact };
  } catch {
    return null;
  }
}

function writeStoredRecap(sessionLabel: string, html: string, artifact: RecapArtifact): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(getRecapStorageKey(sessionLabel), JSON.stringify({ html, artifact }));
  } catch {
    // Best-effort session restore only.
  }
}

export { sanitizeRecapHtmlForDownload } from "@/lib/sessionRecapDownloads";

/** Fire a browser CustomEvent so Creation Corner or File Explorer can receive the artifact. */
function dispatchArtifactEvent(eventName: string, artifact: RecapArtifact) {
  window.dispatchEvent(new CustomEvent(eventName, { detail: artifact }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SessionRecapGenerator({
  captures,
  conversationHistory = [],
  runtimeDailies = [],
  sessionLabel = "",
  onArtifactReady,
  compact = false,
}: SessionRecapGeneratorProps) {
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [expanded, setExpanded] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<RecapArtifact | null>(null);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [orchestrationSummary, setOrchestrationSummary] = useState<string | null>(null);
  const [extractionSummary, setExtractionSummary] = useState<string | null>(null);
  const [recapVoice, setRecapVoice] = useState<RecapVoiceId>("recap-di");

  const hasContent = captures.length > 0 || conversationHistory.length > 0 || runtimeDailies.length > 0;

  useEffect(() => {
    const stored = readStoredRecap(sessionLabel || "Session Recap");
    if (!stored) {
      return;
    }

    setPreviewHtml(stored.html);
    setCurrentArtifact(stored.artifact);
    setStatus("done");
    setExpanded(true);
  }, [sessionLabel]);

  const generate = async () => {
    if (!hasContent) {
      toast.error("Nothing to recap yet — add some captures or start a conversation first.");
      return;
    }
    setStatus("generating");
    setErrorMsg(null);
    setOrchestrationSummary(null);
    setExtractionSummary(null);
    try {
      let orchestrationMessage = "Choose where to send it below.";
      const orchestrationText = [
        `Session: ${sessionLabel || "Untitled Session"}`,
        ...captures.map((capture) => `${capture.title}${capture.content ? `\n${capture.content}` : ""}`),
        ...conversationHistory.map((message) => `${message.role}: ${message.content}`),
      ].join("\n\n");

      try {
        const orchestration = await requestOrchestrationDecision({
          trigger: "session_end",
          sourceRoom: "blackboard-room",
          text: orchestrationText,
          title: sessionLabel || "Session Recap",
          artifactIntent: "recap",
          sourceCaptureIds: captures.map((capture) => capture.id),
        });
        orchestrationMessage = orchestration.decision.userFacingSummary;
        setOrchestrationSummary(orchestrationMessage);
      } catch {
        orchestrationMessage = "Orchestration preflight unavailable; using the local recap flow.";
        setOrchestrationSummary(orchestrationMessage);
      }

      try {
        const extraction = await requestOrchestrationExtraction({
          trigger: "session_end",
          sourceRoom: "blackboard-room",
          title: sessionLabel || "Session Recap",
          text: orchestrationText,
          conversationHistory,
          runtimeDailies,
        });

        const moduleTargets = extraction.extraction.modulePopulation.map((item) => item.label);
        const nuggetSummaries = extraction.extraction.nuggets.map((item) => item.title);
        const extractionLine = moduleTargets.length > 0
          ? `Extraction will populate ${moduleTargets.slice(0, 3).join(", ")}.`
          : "Extraction found a small signal and left the modules unchanged.";
        setExtractionSummary(extractionLine);
        setOrchestrationSummary((current) => current ? `${current} ${extractionLine}` : extractionLine);

        const response = await fetch("/api/sessionRecap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ captures, conversationHistory, sessionLabel, di: recapVoice }),
        });
        if (!response.ok) {
          throw new Error(`Recap API returned ${response.status}`);
        }
        const data = await response.json();
        const cleanHtml: string = cleanRecapHtml(data.html ?? "");
        if (!cleanHtml) throw new Error("Empty response from recap API");

        setPreviewHtml(cleanHtml);
        setStatus("done");
        setExpanded(true);

        const artifact = buildRecapArtifact(cleanHtml, captures, sessionLabel, recapVoice, {
          extractionId: extraction.extraction.extractionId,
          moduleTargets,
          nuggetSummaries,
        });

        setCurrentArtifact(artifact);
        writeStoredRecap(sessionLabel || "Session Recap", cleanHtml, artifact);
        onArtifactReady(artifact);
        toast.success("Recap generated", {
          description: extractionLine,
        });
        return;
      } catch {
        setExtractionSummary("Orchestration extraction unavailable; using the local recap flow.");
      }

      const response = await fetch("/api/sessionRecap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captures, conversationHistory, sessionLabel, di: recapVoice }),
      });
      if (!response.ok) {
        throw new Error(`Recap API returned ${response.status}`);
      }
      const data = await response.json();
      const cleanHtml: string = cleanRecapHtml(data.html ?? "");
      if (!cleanHtml) throw new Error("Empty response from recap API");

      setPreviewHtml(cleanHtml);
      setStatus("done");
      setExpanded(true);

      const artifact = buildRecapArtifact(cleanHtml, captures, sessionLabel, recapVoice);
      setCurrentArtifact(artifact);
      onArtifactReady(artifact);
      writeStoredRecap(sessionLabel || "Session Recap", cleanHtml, artifact);

      toast.success("Recap ready", {
        description: orchestrationMessage,
      });
    } catch (err) {
      console.error("[SessionRecapGenerator] recap generation failed", err);
      const msg = "Recap generation could not finish. Try again.";
      setErrorMsg(msg);
      setStatus("error");
      toast.error("Recap failed", { description: msg });
    }
  };

  // ── Compact toolbar button ───────────────────────────────────────────────────
  if (compact) {
    return (
      <button
        type="button"
        onClick={generate}
        disabled={status === "generating" || !hasContent}
        className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-2 text-sm text-violet-100 transition-all hover:bg-violet-400/18 hover:border-violet-400/40 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "generating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {status === "generating" ? "Generating…" : "Generate Recap"}
      </button>
    );
  }

  // ── Full panel ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[1.75rem] border border-violet-400/20 bg-violet-400/[0.06] p-5 shadow-[0_0_48px_rgba(191,0,255,0.08)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/30 bg-violet-400/15">
            <BookOpen className="h-4 w-4 text-violet-300" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-violet-400/80">
              session recap
            </p>
            <p className="mt-0.5 text-sm font-medium text-white/80">
              {sessionLabel || "Current session"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                Recap voice
              </span>
              <select
                value={recapVoice}
                onChange={(event) => setRecapVoice(normalizeRecapVoice(event.target.value))}
                className="min-h-9 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white/82 outline-none transition-colors focus:border-violet-300/40 focus:bg-black/45"
                aria-label="Choose recap voice"
              >
                {RECAP_VOICE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="text-xs leading-5 text-white/48">{getRecapVoiceLabel(recapVoice)} shapes the recap tone.</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] text-white/40">
            {captures.length} capture{captures.length !== 1 ? "s" : ""}
          </span>
          {status === "done" && previewHtml && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full border border-white/10 bg-white/[0.04] p-1.5 text-white/50 hover:text-white"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Status description */}
      <p className="mt-3 text-sm leading-relaxed text-white/52">
        {status === "idle" &&
          "Generate a visual recap of this session — what was built, what emerged, what's worth holding."}
        {status === "generating" && `${getRecapVoiceLabel(recapVoice)} is reading the session arc and building your recap…`}
        {status === "done" && "Recap ready. Choose what to do with it below."}
        {status === "error" && (
          <span className="text-red-300/80">{errorMsg || "Something went wrong. Try again."}</span>
        )}
      </p>
      {status === "done" && orchestrationSummary ? (
        <p className="mt-2 text-sm leading-relaxed text-cyan-100/70">{orchestrationSummary}</p>
      ) : null}
      {status === "done" && extractionSummary ? (
        <p className="mt-2 text-sm leading-relaxed text-violet-100/72">{extractionSummary}</p>
      ) : null}

      {/* Generate button (idle / error) */}
      {(status === "idle" || status === "error") && (
        <button
          type="button"
          onClick={generate}
          disabled={!hasContent}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/12 px-5 py-2.5 text-sm font-medium text-violet-100 transition-all hover:bg-violet-400/20 hover:border-violet-400/50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />
          {status === "error" ? "Try again" : "Generate recap"}
        </button>
      )}

      {/* Generating spinner */}
      {status === "generating" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-violet-400/15 bg-black/20 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
          <span className="text-sm text-white/52">{getRecapVoiceLabel(recapVoice)} is reading the session arc…</span>
        </div>
      )}

      {/* ── Action tray (done state) ──────────────────────────────────────────── */}
      {status === "done" && currentArtifact && previewHtml && (
        <div className="mt-4 space-y-3">
          {/* Three action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download */}
            <button
              type="button"
              onClick={() => setDownloadMenuOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/70 transition-all hover:bg-white/[0.10] hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>

            {/* Send to Creation Corner */}
            <button
              type="button"
              onClick={() => {
                dispatchArtifactEvent("gestaltview:artifact:creation-corner", currentArtifact);
                toast.success("Sent to Creation Corner", {
                  description: "Open Creation Corner to find your recap.",
                });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/[0.07] px-4 py-2 text-xs font-medium text-amber-200/80 transition-all hover:bg-amber-400/[0.14] hover:text-amber-100"
            >
              <Palette className="h-3.5 w-3.5" />
              Creation Corner
            </button>

            {/* Send to File Explorer */}
            <button
              type="button"
              onClick={() => {
                dispatchArtifactEvent("gestaltview:artifact:file-explorer", currentArtifact);
                toast.success("Sent to File Explorer", {
                  description: "Find it in your File Explorer.",
                });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/[0.07] px-4 py-2 text-xs font-medium text-sky-200/80 transition-all hover:bg-sky-400/[0.14] hover:text-sky-100"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              File Explorer
            </button>
          </div>

          {/* Regenerate link */}
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            Regenerate
          </button>
        </div>
      )}

      <AnimatePresence>
        {downloadMenuOpen && currentArtifact && previewHtml ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-xl"
          >
            <div className="w-full max-w-lg rounded-[1.8rem] border border-white/10 bg-[#0d0715]/96 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-violet-200/72">Choose format</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{currentArtifact.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/56">
                    Pick a download format for this recap.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDownloadMenuOpen(false)}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                  aria-label="Close download format picker"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  { format: "html", label: "HTML", description: "Keeps the styled recap intact." },
                  { format: "txt", label: "Text", description: "Strips markup into readable text." },
                  { format: "json", label: "JSON", description: "Includes metadata plus recap HTML." },
                ].map((option) => (
                  <button
                    key={option.format}
                    type="button"
                    onClick={() => {
                      downloadSessionRecapArtifact(currentArtifact, option.format as SessionRecapDownloadFormat, window.location.origin);
                      toast.success("Recap downloaded");
                      setDownloadMenuOpen(false);
                    }}
                    className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-violet-300/25 hover:bg-violet-300/[0.08]"
                  >
                    <p className="text-sm font-semibold text-white">{option.label}</p>
                    <p className="mt-2 text-xs leading-5 text-white/55">{option.description}</p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setDownloadMenuOpen(false)}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Inline preview (expandable iframe) */}
      <AnimatePresence>
        {status === "done" && expanded && previewHtml && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 overflow-hidden rounded-xl border border-white/10"
          >
            <HtmlArtifactRenderer
              title="Session Recap Preview"
              html={previewHtml}
              retrievalMode="persistent"
              minHeight={480}
              chrome={false}
              className="h-[480px] w-full rounded-xl bg-black"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
