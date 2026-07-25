import { useState } from "react";
import { Copy, Download, PenSquare, Send, SquareLibrary, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import { requestOrchestrationDecision } from "@/lib/orchestratorClient";
import {
  requestTranscriptoryHandoff,
  writeTranscriptoryHandoff,
  type TranscriptoryCapture,
  type TranscriptorySession,
  type TranscriptorySource,
} from "@/lib/transcriptory";
import {
  downloadTranscriptoryCapture,
  type TranscriptoryDownloadFormat,
} from "@/lib/transcriptoryDownloads";

export default function TranscriptViewer({
  capture,
  sources = [],
  session = null,
  onDelete,
}: {
  capture: TranscriptoryCapture | null;
  sources?: TranscriptorySource[];
  session?: TranscriptorySession | null;
  onDelete?: () => void;
}) {
  const [, setLocation] = useLocation();
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  if (!capture) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 text-white/58">
        Select a transcript to inspect the raw source, summary, and handoff actions.
      </section>
    );
  }
  const isFailed = capture.status === "failed" || capture.transcriptStatus === "failed";

  const copyTranscript = async () => {
    await navigator.clipboard.writeText(capture.transcriptText || capture.rawTranscript || capture.summary || capture.title);
    toast.success("Transcript copied.");
  };

  const sendHandoff = async (destination: "blackboard" | "creation") => {
    try {
      const orchestrationInputText = capture.transcriptText || capture.rawTranscript || capture.summary || capture.title;
      let routedDestination = destination;

      try {
        const orchestration = await requestOrchestrationDecision({
          trigger: "transcript_handoff",
          sourceRoom: "import",
          text: orchestrationInputText,
          title: capture.title,
          sourceCaptureIds: [capture.id],
          sourceArtifactIds: session?.id ? [session.id] : [],
          hasAudio: Boolean(capture.hasAudio),
          hasFile: Boolean(capture.audioStoragePath),
          userId: capture.userId,
        });

        if (
          orchestration.decision.contentKind === "session_recap" ||
          orchestration.decision.contentKind === "mind_map" ||
          orchestration.decision.contentKind === "report_document"
        ) {
          routedDestination = "creation";
        }

        toast.success("Transcript routed", {
          description: orchestration.decision.userFacingSummary,
        });
      } catch {
        // If orchestration is unavailable, fall back to the user's explicit destination.
      }

      const target = routedDestination === "blackboard" ? "blackboard_room" : "creation_corner";
      if (!capture.id.startsWith("local-transcript-")) {
        await requestTranscriptoryHandoff(capture.id, target);
      }
      writeTranscriptoryHandoff(routedDestination, capture);
      setLocation(routedDestination === "blackboard" ? "/blackboard-room" : "/creation-corner");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to prepare Transcriptory handoff.");
    }
  };

  const sendUniversalCapture = async () => {
    try {
      if (!capture.id.startsWith("local-transcript-")) {
        await requestTranscriptoryHandoff(capture.id, "universal_capture");
      }
      await navigator.clipboard.writeText(capture.transcriptText || capture.rawTranscript || capture.summary || capture.title);
      toast.success("Universal Capture source prepared.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to prepare Universal Capture source.");
    }
  };

  return (
    <section className="rounded-[2rem] border border-cyan-300/14 bg-[#050a0e]/82 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur">
      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-200/70">Transcript viewer</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{capture.title}</h2>

      {isFailed ? (
        <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] p-4 text-sm leading-6 text-rose-50">
          {capture.errorMessage || "Transcription failed. Upload or record the source again to retry."}
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">Summary</p>
        <p className="mt-2 text-sm leading-6 text-white/68">
          {capture.summary || (isFailed ? "No summary is available for this failed transcription." : "Summary generation is pending. Raw source remains available below.")}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/24 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">Raw transcript</p>
        <pre className="mt-3 max-h-[34rem] overflow-auto whitespace-pre-wrap text-sm leading-6 text-white/72">
          {capture.transcriptText || capture.rawTranscript || (isFailed ? "No transcript was produced for this capture." : "Transcription pending. Transcriptory will not use browser SpeechRecognition fallback.")}
        </pre>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">Session</p>
          <p className="mt-2 text-sm text-white/68">{session?.title || capture.sessionId || "No session attached"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/38">Source lineage</p>
          <p className="mt-2 text-sm text-white/68">
            {sources.length > 0 ? sources.map((source) => source.source_type.replace(/_/g, " ")).join(", ") : capture.sourceKind || "Transcriptory"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyTranscript}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72 hover:text-white"
        >
          <Copy className="size-4" />
          Copy Transcript
        </button>
        <button
          type="button"
          onClick={() => setDownloadMenuOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72 hover:text-white"
        >
          <Download className="size-4" />
          Download
        </button>
        <button
          type="button"
          onClick={() => void sendHandoff("blackboard")}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50"
        >
          <Send className="size-4" />
          Send to Blackboard
        </button>
        <button
          type="button"
          onClick={() => void sendHandoff("creation")}
          className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-50"
        >
          <PenSquare className="size-4" />
          Send to Creation Corner
        </button>
        <button
          type="button"
          onClick={() => void sendUniversalCapture()}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-50"
        >
          <SquareLibrary className="size-4" />
          Universal Capture
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-semibold text-rose-50"
          >
            <Trash2 className="size-4" />
            Delete capture
          </button>
        ) : null}
      </div>

      {downloadMenuOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-[1.8rem] border border-white/10 bg-[#06131a]/96 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-200/72">Choose format</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{capture.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/56">
                  Pick a download format for this transcript.
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
                { format: "html", label: "HTML", description: "Keeps the transcript in a readable page." },
                { format: "txt", label: "Text", description: "Downloads the raw transcript copy." },
                { format: "json", label: "JSON", description: "Includes capture metadata and sources." },
              ].map((option) => (
                <button
                  key={option.format}
                  type="button"
                  onClick={() => {
                    downloadTranscriptoryCapture({ capture, session, sources }, option.format as TranscriptoryDownloadFormat);
                    toast.success("Transcript downloaded");
                    setDownloadMenuOpen(false);
                  }}
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-cyan-300/25 hover:bg-cyan-300/[0.08]"
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
        </div>
      ) : null}
    </section>
  );
}
