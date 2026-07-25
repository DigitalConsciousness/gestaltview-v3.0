import { useEffect, useMemo, useRef, useState } from "react";
import { FileAudio, Mic2, Plus, Search, UploadCloud, Waves } from "lucide-react";
import { toast } from "sonner";

import TranscriptCard from "@/components/TranscriptCard";
import TranscriptViewer from "@/components/TranscriptViewer";
import TranscriptoryRecorder from "@/components/TranscriptoryRecorder";
import { useAuth } from "@/contexts/AuthContext";
import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import {
  deleteTranscriptoryCapture,
  createLocalTranscriptoryCapture,
  createTranscriptoryCapture,
  createTranscriptorySession,
  formatTranscriptoryFailureMessage,
  getTranscriptoryCapture,
  listTranscriptoryCaptures,
  listTranscriptorySessions,
  transcribeTranscriptoryAudio,
  type TranscriptoryCapture,
  type TranscriptorySession,
  type TranscriptorySource,
} from "@/lib/transcriptory";

const ACCEPTED_AUDIO = ".mp3,.mp4,.m4a,.wav,.webm,.ogg,audio/*";

export default function TranscriptoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [captures, setCaptures] = useState<TranscriptoryCapture[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<TranscriptorySource[]>([]);
  const [selectedSession, setSelectedSession] = useState<TranscriptorySession | null>(null);
  const [sessions, setSessions] = useState<TranscriptorySession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useSEO({
    ...PAGE_SEO.default,
    title: "Transcriptory | GestaltView",
    description: "Voice notes, transcripts, and raw source captures accumulated over time.",
    h1: "Transcriptory",
    canonical: "https://gestaltview-v2.vercel.app/transcriptory",
  });

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    let active = true;
    listTranscriptoryCaptures({ q: query || undefined, sessionId: activeSessionId || undefined })
      .then((items) => {
        if (!active) return;
        setCaptures(items);
        setSelectedId((current) => current ?? items[0]?.id ?? null);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load Transcriptory.");
      });
    return () => {
      active = false;
    };
  }, [activeSessionId, isAuthenticated, isLoading, query]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    let active = true;
    listTranscriptorySessions()
      .then((items) => {
        if (active) setSessions(items);
      })
      .catch(() => {
        if (active) setSessions([]);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!selectedId || selectedId.startsWith("local-transcript-") || !isAuthenticated) {
      setSelectedSources([]);
      setSelectedSession(null);
      return;
    }
    let active = true;
    getTranscriptoryCapture(selectedId)
      .then((detail) => {
        if (!active) return;
        setCaptures((current) => current.map((capture) => (capture.id === detail.capture.id ? detail.capture : capture)));
        setSelectedSources(detail.sources);
        setSelectedSession(detail.session);
      })
      .catch(() => {
        if (!active) return;
        setSelectedSources([]);
        setSelectedSession(null);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, selectedId]);

  const filteredCaptures = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return captures;
    return captures.filter((capture) =>
      [capture.title, capture.summary, capture.rawTranscript, capture.themes.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [captures, query]);

  const selectedCapture = captures.find((capture) => capture.id === selectedId) ?? filteredCaptures[0] ?? null;

  const createSession = async () => {
    const title = sessionTitle.trim();
    if (!title) return;
    if (!isAuthenticated) {
      toast.info("Sign in to create Transcriptory sessions.");
      return;
    }
    try {
      const session = await createTranscriptorySession({ title });
      setSessions((current) => [session, ...current]);
      setActiveSessionId(session.id);
      setSessionTitle("");
      toast.success("Transcriptory session created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create Transcriptory session.");
    }
  };

  const addCapture = async (input: {
    title: string;
    audioStoragePath?: string;
    rawTranscript?: string;
    file?: File;
  }) => {
    setTranscriptionError(null);
    const local = createLocalTranscriptoryCapture(input);
    setCaptures((current) => [local, ...current]);
    setSelectedId(local.id);

    if (!isAuthenticated) {
      toast.info("Sign in to persist Transcriptory captures to Supabase.");
      return;
    }

    let persistedCaptureId = local.id;
    try {
      const saved = await createTranscriptoryCapture({
        title: input.title,
        sessionId: activeSessionId || undefined,
        audioStoragePath: input.audioStoragePath,
        rawTranscript: input.rawTranscript,
        status: input.file ? "processing" : undefined,
        sourceKind: input.file ? "audio" : input.rawTranscript ? "text" : "audio",
        sourceLabel: input.file?.name,
      });
      persistedCaptureId = saved.id;
      setCaptures((current) => current.map((capture) => (capture.id === local.id ? saved : capture)));
      setSelectedId(saved.id);
      if (!input.file) {
        toast.success("Transcriptory capture saved.");
        return;
      }

      toast.info("Transcribing audio with AssemblyAI. This may take a moment.");
      const transcription = await transcribeTranscriptoryAudio({ captureId: saved.id, file: input.file });
      if (transcription.capture) {
        setCaptures((current) => current.map((capture) => (capture.id === saved.id ? transcription.capture! : capture)));
        setSelectedId(transcription.capture.id);
      } else {
        setCaptures((current) =>
          current.map((capture) =>
            capture.id === saved.id
              ? {
                  ...capture,
                  rawTranscript: transcription.transcript,
                  durationSeconds: transcription.durationSeconds,
                  status: "ready",
                  updatedAt: new Date().toISOString(),
                }
              : capture,
          ),
        );
      }
      toast.success("Transcript saved to Transcriptory.");
    } catch (error) {
      const failureMessage = formatTranscriptoryFailureMessage(error, "Transcriptory capture failed.");
      setTranscriptionError(failureMessage);
      setCaptures((current) =>
        current.map((capture) =>
          capture.id === local.id || capture.id === persistedCaptureId
            ? {
                ...capture,
                status: "failed",
                transcriptStatus: "failed",
                errorMessage: failureMessage,
                updatedAt: new Date().toISOString(),
              }
            : capture,
        ),
      );
      toast.error(failureMessage);
    }
  };

  const deleteCapture = async (captureId: string) => {
    const capture = captures.find((item) => item.id === captureId);
    if (!capture) {
      return;
    }

    if (!window.confirm(`Delete "${capture.title}" from Transcriptory?`)) {
      return;
    }

    try {
      if (isAuthenticated && !captureId.startsWith("local-transcript-")) {
        await deleteTranscriptoryCapture(captureId);
      }

      setCaptures((current) => {
        const next = current.filter((item) => item.id !== captureId);
        setSelectedId((currentSelected) =>
          currentSelected === captureId ? next[0]?.id ?? null : currentSelected,
        );
        return next;
      });

      if (selectedId === captureId) {
        setSelectedSources([]);
        setSelectedSession(null);
      }

      toast.success("Transcriptory capture deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete Transcriptory capture.");
    }
  };

  const handleFile = (file: File) => {
    void addCapture({
      title: file.name.replace(/\.[^.]+$/, "") || "Uploaded voice note",
      file,
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#061016] pt-24 text-white">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-[-12rem] top-20 h-96 w-96 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(135deg,rgba(0,212,255,0.08),transparent_45%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-100/78">
              <Waves className="size-3.5" />
              Transcriptory
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              Your voice. Accumulated.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/64">
              Upload or record audio, preserve the raw transcript, and keep each voice note available as context for Blackboard, Creation Corner, and future Digital Intelligence work.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur">
            <p className="text-sm leading-6 text-white/62">
              Large files over 50MB may take several minutes to transcribe. Browser SpeechRecognition is intentionally bypassed.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                value={sessionTitle}
                onChange={(event) => setSessionTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void createSession();
                }}
                placeholder="New session title"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white outline-none placeholder:text-white/34"
              />
              <button
                type="button"
                onClick={() => void createSession()}
                className="inline-flex size-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-50"
                aria-label="Create Transcriptory session"
                title="Create Transcriptory session"
              >
                <Plus className="size-4" />
              </button>
            </div>
            {sessions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSessionId("")}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    activeSessionId ? "border-white/10 text-white/50" : "border-cyan-300/24 bg-cyan-300/10 text-cyan-50"
                  }`}
                >
                  All
                </button>
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setActiveSessionId(session.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      activeSessionId === session.id ? "border-cyan-300/24 bg-cyan-300/10 text-cyan-50" : "border-white/10 text-white/50"
                    }`}
                  >
                    {session.title}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-[#041014]"
              >
                <UploadCloud className="size-4" />
                Upload audio
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AUDIO}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleFile(file);
                  event.currentTarget.value = "";
                }}
              />
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/58">
                <Mic2 className="size-4" />
                Record below
              </span>
            </div>
            {transcriptionError ? (
              <p role="alert" className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] p-3 text-sm leading-6 text-rose-50">
                Audio upload or transcription failed: {transcriptionError}
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-8">
          <TranscriptoryRecorder onRecordingReady={handleFile} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/42">Transcript library</p>
                <p className="mt-1 text-sm text-white/52">{captures.length} captures</p>
              </div>
              <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/62">
                <Search className="size-4" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  className="w-28 bg-transparent text-white outline-none placeholder:text-white/32"
                />
              </label>
            </div>

            {loadError ? (
              <p className="mt-4 rounded-2xl border border-amber-300/18 bg-amber-300/[0.06] p-3 text-sm text-amber-50">{loadError}</p>
            ) : null}

            <div className="mt-5 grid gap-3">
              {filteredCaptures.length > 0 ? (
                filteredCaptures.map((capture) => (
                <TranscriptCard
                  key={capture.id}
                  capture={capture}
                  selected={capture.id === selectedCapture?.id}
                  onOpen={() => setSelectedId(capture.id)}
                  onDelete={() => void deleteCapture(capture.id)}
                />
              ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-black/18 p-6 text-sm leading-6 text-white/50">
                  <FileAudio className="mb-3 size-5 text-cyan-200/68" />
                  No transcripts yet. Upload audio, record a note, or paste a transcript in the next implementation slice.
                </div>
              )}
            </div>
          </div>

          <TranscriptViewer
            capture={selectedCapture}
            sources={selectedSources}
            session={selectedSession}
            onDelete={selectedCapture ? () => void deleteCapture(selectedCapture.id) : undefined}
          />
        </section>
      </div>
    </main>
  );
}
