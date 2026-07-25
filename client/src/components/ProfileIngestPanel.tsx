import { useMemo, useState, type ChangeEvent } from "react";
import { FileText, FileUp, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { appFetchJson } from "@/lib/appFetch";
import UploadedDocumentPreview from "@/components/UploadedDocumentPreview";
import { extractProfileUpload, summarizeProfileUpload, type ProfileUploadExtraction } from "@/lib/profileUploadIngestion";
import type { ProfileIngestionResponse } from "@shared/profileIngestion";

type ProfileIngestionEnvelope = {
  response: ProfileIngestionResponse;
  provider: string;
  timestamp: string;
};

type BuildStage = "idle" | "reading" | "extracting" | "synthesizing" | "refreshing" | "complete";

interface ProfileIngestPanelProps {
  userId: string | null;
  contextFraming: string;
  onFramingChange: (value: string) => void;
  onIngested?: () => Promise<void> | void;
}

function StagePill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={[
        "rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.24em] transition-colors",
        active
          ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
          : "border-white/10 bg-white/[0.03] text-white/38",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default function ProfileIngestPanel({
  userId,
  contextFraming,
  onFramingChange,
  onIngested,
}: ProfileIngestPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [extraction, setExtraction] = useState<ProfileUploadExtraction | null>(null);
  const [stage, setStage] = useState<BuildStage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState<string | null>(null);
  const [resultStats, setResultStats] = useState<{ sourcesProcessed: number; confidenceScore: number; plkFragmentsCreated: number } | null>(null);

  const fileSummary = useMemo(() => (extraction ? summarizeProfileUpload(extraction) : ""), [extraction]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    event.target.value = "";
    setError(null);
    setResultSummary(null);
    setResultStats(null);
    setExtraction(null);
    setFile(nextFile);

    if (!nextFile) {
      setStage("idle");
      return;
    }

    setStage("reading");
    try {
      const nextExtraction = await extractProfileUpload(nextFile);
      setExtraction(nextExtraction);
      setStage("idle");
      if (!nextExtraction.text.trim()) {
        setError("That file did not contain readable text.");
      }
    } catch (uploadError) {
      setStage("idle");
      setError(uploadError instanceof Error ? uploadError.message : "Could not read the uploaded profile.");
      setFile(null);
    }
  };

  const handleIngest = async () => {
    if (!userId) {
      toast.error("Sign in to ingest your profile.");
      return;
    }

    if (!file) {
      toast.error("Choose a profile document first.");
      return;
    }

    let nextExtraction = extraction;
    try {
      if (!nextExtraction) {
        setStage("extracting");
        nextExtraction = await extractProfileUpload(file);
        setExtraction(nextExtraction);
      }

      if (!nextExtraction.text.trim()) {
        throw new Error("The uploaded file did not produce usable text.");
      }

      setStage("synthesizing");
      setError(null);

      const result = await appFetchJson<ProfileIngestionEnvelope>("/api/profile/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sources: {
            profileUpload: {
              fileName: nextExtraction.fileName,
              content: nextExtraction.text,
              mimeType: nextExtraction.mimeType,
            },
          },
          contextFraming: contextFraming.trim() || undefined,
          includeInPLK: true,
        }),
        timeoutMs: 60_000,
        retryUnsafe: true,
      });

      if (!result.ok) {
        throw new Error(result.message || "Profile ingestion failed.");
      }

      setStage("refreshing");
      setResultSummary(
        `Ingested ${nextExtraction.fileName} into the live profile pipeline. The profile can now refresh with the new signal.`,
      );
      setResultStats({
        sourcesProcessed: result.data.response.metadata.sourcesProcessed,
        confidenceScore: result.data.response.metadata.confidenceScore,
        plkFragmentsCreated: result.data.response.metadata.plkFragmentsCreated,
      });
      toast.success("Profile ingested.");
      await onIngested?.();
      setStage("complete");
    } catch (ingestError) {
      setStage("idle");
      setError(ingestError instanceof Error ? ingestError.message : "Could not ingest the uploaded profile.");
      toast.error(ingestError instanceof Error ? ingestError.message : "Could not ingest the uploaded profile.");
    }
  };

  const isBusy = stage === "reading" || stage === "extracting" || stage === "synthesizing" || stage === "refreshing";

  return (
    <section className="rounded-[1.6rem] border border-cyan-300/14 bg-cyan-300/[0.04] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-100/70">Profile ingest</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Upload Keith's profile source</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
            Supported formats: `pdf`, `markdown`, and `docx`. The file is read locally, extracted into raw text, then
            sent to the existing profile ingestion pipeline as `profile_upload` on this account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StagePill active={stage === "reading"} label="Read" />
          <StagePill active={stage === "extracting"} label="Extract" />
          <StagePill active={stage === "synthesizing"} label="Grow" />
          <StagePill active={stage === "refreshing"} label="Refresh" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <label className="block cursor-pointer rounded-[1.4rem] border border-dashed border-cyan-300/20 bg-black/18 px-4 py-4 transition-colors hover:border-cyan-300/40">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-cyan-300/18 bg-cyan-300/10 text-cyan-50">
                  <FileUp className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {file ? file.name : "Choose a profile file"}
                  </p>
                  {fileSummary ? <p className="mt-1 text-xs text-cyan-100/60">{fileSummary}</p> : null}
                  <p className="mt-1 text-sm text-white/52">
                    Drop in the founder profile you shared in `.perplexity`, then let Billy weave it into the live portrait.
                  </p>
                </div>
              </div>
            <input
              type="file"
              accept=".pdf,.md,.markdown,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => void handleFile(event)}
              className="sr-only"
              disabled={isBusy}
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">Context framing</span>
            <textarea
              value={contextFraming}
              onChange={(event) => onFramingChange(event.target.value)}
              placeholder="For example: founder-as-algorithm, current operating cadence, or how you want Billy to frame the material."
              className="mt-2 min-h-[120px] w-full rounded-[1.4rem] border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/28 focus:border-cyan-300/45"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleIngest()}
              disabled={!file || isBusy}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/12 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {stage === "refreshing" ? "Refreshing profile..." : "Ingest profile"}
            </button>
            {file ? (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setExtraction(null);
                  setResultSummary(null);
                  setResultStats(null);
                  setError(null);
                  setStage("idle");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition-colors hover:text-white"
              >
                Clear
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-[1.2rem] border border-rose-300/20 bg-rose-300/8 p-4 text-sm leading-6 text-rose-50">
              {error}
            </div>
          ) : null}

          {resultSummary ? (
            <div className="rounded-[1.2rem] border border-emerald-300/20 bg-emerald-300/8 p-4 text-sm leading-6 text-emerald-50">
              {resultSummary}
              {resultStats ? (
                <div className="mt-3 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.22em] text-emerald-100/72">
                  <span className="rounded-full border border-emerald-200/20 px-3 py-1">
                    Sources {resultStats.sourcesProcessed}
                  </span>
                  <span className="rounded-full border border-emerald-200/20 px-3 py-1">
                    Confidence {Math.round(resultStats.confidenceScore * 100)}%
                  </span>
                  <span className="rounded-full border border-emerald-200/20 px-3 py-1">
                    PLK fragments {resultStats.plkFragmentsCreated}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-black/18 p-4">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-cyan-100/70" />
            <h3 className="text-sm font-semibold text-white">Live extraction preview</h3>
          </div>

          {extraction ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="File" value={extraction.fileName} />
                <Stat
                  label="Shape"
                  value={
                    extraction.kind === "pdf"
                      ? `${extraction.pageCount ?? 1} page${(extraction.pageCount ?? 1) === 1 ? "" : "s"}`
                      : extraction.kind
                  }
                />
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/42">Extracted content</p>
                <UploadedDocumentPreview
                  name={extraction.fileName}
                  mimeType={extraction.mimeType}
                  kind={extraction.kind}
                  previewText={extraction.text}
                  className="mt-3"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[1.1rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/46">
              Upload a file and the extracted text will appear here before the profile is ingested.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-1 break-words text-sm text-white">{value}</p>
    </div>
  );
}
