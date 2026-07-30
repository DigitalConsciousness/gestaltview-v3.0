import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import TranscriptoryRecorder from "@/components/TranscriptoryRecorder";
import {
  createTranscriptoryCapture,
  requestTranscriptoryHandoff,
  transcribeTranscriptoryAudio,
} from "@/lib/transcriptory";
import { acceptTranscriptoryHandoffInSanctuary } from "@/lib/sanctuaryRuntimeHandoffs";
import {
  loadSanctuaryJournalFromServer,
  saveSanctuaryJournalRecordWithResult,
} from "@/lib/sanctuaryContent";
import {
  readUserSurfaceSettings,
  USER_SURFACE_SETTINGS_EVENT,
  type UserSurfaceSettings,
} from "@/lib/userSurfaceSettings";

type JournalEntry = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  syncState?: "local_only" | "syncing" | "synced" | "conflict";
};

const JOURNAL_STORAGE_KEY = "gv.sanctuary.journal.v1";
const JOURNAL_SAVE_DEBOUNCE_MS = 650;

function createId(prefix = "journal"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function readStoredJournal(): JournalEntry {
  if (typeof window === "undefined") {
    const now = new Date().toISOString();
    return { id: createId(), content: "", createdAt: now, updatedAt: now };
  }

  try {
    const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as JournalEntry;
    }
  } catch {
    // Ignore malformed storage and fall back to a fresh journal entry.
  }

  const now = new Date().toISOString();
  return { id: createId(), content: "", createdAt: now, updatedAt: now };
}

function writeStoredJournal(entry: JournalEntry): void {
  try {
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore storage failures in private mode or locked-down environments.
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLater(left: string, right: string): boolean {
  return Date.parse(left) > Date.parse(right);
}

function toJournalEntry(record: {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}): JournalEntry {
  return {
    id: record.id,
    content: record.content,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    syncState: "synced",
  };
}

export default function JournalEditor() {
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const initialJournal = useMemo(() => readStoredJournal(), []);
  const [journal, setJournal] = useState(initialJournal);
  const [savedState, setSavedState] = useState<
    "local_only" | "saving" | "synced" | "conflict"
  >(user?.id ? "saving" : "local_only");
  const [isListening, setIsListening] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceChoice, setVoiceChoice] = useState<{
    captureId: string;
    transcript: string;
  } | null>(null);
  const [surfaceSettings, setSurfaceSettings] = useState<UserSurfaceSettings>(
    () => readUserSurfaceSettings(),
  );

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== journal.content) {
      editorRef.current.innerHTML = journal.content;
    }
  }, [journal.content]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onSettingsChanged = (event: Event) => {
      const next =
        (event as CustomEvent<UserSurfaceSettings>).detail ??
        readUserSurfaceSettings();
      setSurfaceSettings(next);
      if (!next.voiceCapture) {
        setIsListening(false);
      }
    };

    window.addEventListener(USER_SURFACE_SETTINGS_EVENT, onSettingsChanged);
    return () =>
      window.removeEventListener(
        USER_SURFACE_SETTINGS_EVENT,
        onSettingsChanged,
      );
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!user?.id) {
        return;
      }

      const remoteJournal = await loadSanctuaryJournalFromServer();
      if (cancelled) {
        return;
      }

      const localJournal = readStoredJournal();

      if (!remoteJournal) {
        if (stripHtml(localJournal.content).length > 0) {
          void syncJournal(localJournal.content);
        }
        return;
      }

      if (isLater(localJournal.updatedAt, remoteJournal.updatedAt)) {
        setJournal(localJournal);
        writeStoredJournal(localJournal);
        void syncJournal(localJournal.content);
        return;
      }

      const next = toJournalEntry(remoteJournal);
      setJournal(next);
      writeStoredJournal(next);
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const syncJournal = async (content: string) => {
    if (!user?.id) {
      setSavedState("local_only");
      return;
    }

    const result = await saveSanctuaryJournalRecordWithResult({
      journalId: journal.id,
      content,
      expectedUpdatedAt:
        journal.syncState === "synced" ? journal.updatedAt : undefined,
    });
    if (!result.ok) {
      if (result.status === 409) {
        setSavedState("conflict");
        toast.error(
          "This journal changed elsewhere. Both versions were preserved.",
        );
        return;
      }
      if ((editorRef.current?.innerHTML ?? "") === content) {
        setSavedState("local_only");
        toast.error("Could not sync the journal. Your local copy was kept.");
      }
      return;
    }
    const remoteJournal = result.data.journal;
    if (!remoteJournal) return;

    if ((editorRef.current?.innerHTML ?? "") !== content) {
      return;
    }

    const next = toJournalEntry(remoteJournal);
    setJournal(next);
    writeStoredJournal(next);
    setSavedState("synced");
  };

  const queueSave = () => {
    const content = editorRef.current?.innerHTML ?? journal.content;
    const next: JournalEntry = {
      ...journal,
      content,
      updatedAt: new Date().toISOString(),
      syncState: user?.id ? "syncing" : "local_only",
    };

    setJournal(next);
    writeStoredJournal(next);
    setSavedState(user?.id ? "saving" : "local_only");

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      void syncJournal(content);
    }, JOURNAL_SAVE_DEBOUNCE_MS);
  };

  const flushSave = () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    void syncJournal(editorRef.current?.innerHTML ?? journal.content);
  };

  const hasContent = stripHtml(journal.content).length > 0;

  const setEditorHtml = (html: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
    const next: JournalEntry = {
      ...journal,
      content: html,
      updatedAt: new Date().toISOString(),
      syncState: user?.id ? "syncing" : "local_only",
    };
    setJournal(next);
    writeStoredJournal(next);
    setSavedState(user?.id ? "saving" : "local_only");
  };

  const toggleVoice = () => {
    if (!surfaceSettings.voiceCapture) {
      toast.info("Voice capture is turned off in Settings.");
      return;
    }

    setIsListening((current) => !current);
  };

  const preserveVoiceSource = async (file: File) => {
    if (!user?.id) {
      toast.error("Sign in before preserving a Sanctuary voice source.");
      return;
    }
    setVoiceProcessing(true);
    try {
      const capture = await createTranscriptoryCapture({
        title: `Sanctuary voice — ${new Date().toLocaleString()}`,
        status: "pending",
        sourceKind: "audio",
        sourceLabel: "Sanctuary voice",
      });
      const transcription = await transcribeTranscriptoryAudio({
        captureId: capture.id,
        file,
      });
      const readyCapture = transcription.capture ?? {
        ...capture,
        rawTranscript: transcription.transcript,
        transcriptText: transcription.transcript,
        transcriptStatus: "ready",
        status: "ready",
      };
      const offered = await requestTranscriptoryHandoff({
        capture: readyCapture,
        target: "sanctuary",
      });
      await acceptTranscriptoryHandoffInSanctuary({
        handoffId: offered.handoffId,
        captureId: capture.id,
      });
      setVoiceChoice({
        captureId: capture.id,
        transcript: transcription.transcript,
      });
      setIsListening(false);
      toast.success("Voice source preserved in Transcriptory.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The voice source could not be preserved.",
      );
    } finally {
      setVoiceProcessing(false);
    }
  };

  const useVoiceAsJournal = () => {
    if (!voiceChoice) return;
    const escaped = voiceChoice.transcript
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const html = [
      editorRef.current?.innerHTML ?? journal.content,
      `<p>${escaped}</p>`,
    ]
      .filter(Boolean)
      .join("<br />");
    setEditorHtml(html);
    void saveSanctuaryJournalRecordWithResult({
      journalId: journal.id,
      content: html,
      expectedUpdatedAt:
        journal.syncState === "synced" ? journal.updatedAt : undefined,
      sourceKind: "transcriptory",
      sourceEntityRef: `transcriptory-capture:${voiceChoice.captureId}`,
    });
    setVoiceChoice(null);
  };

  const useVoiceAsScrapbook = () => {
    if (!voiceChoice) return;
    window.dispatchEvent(
      new CustomEvent("gestaltview:sanctuary:add-transcriptory-scrap", {
        detail: voiceChoice,
      }),
    );
    setVoiceChoice(null);
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gv-text-primary">Journal</p>
          <p className="mt-1 text-xs text-gv-text-muted">
            Autosaves quietly as you write.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleVoice}
            disabled={!surfaceSettings.voiceCapture}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              isListening
                ? "border-rose-300/25 bg-rose-300/10 text-rose-50"
                : surfaceSettings.voiceCapture
                  ? "border-white/10 bg-black/20 text-white/65"
                  : "cursor-not-allowed border-white/8 bg-black/10 text-white/30"
            }`}
          >
            {isListening ? (
              <MicOff className="h-3.5 w-3.5" />
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
            {isListening ? "listening" : "voice"}
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/55">
            <Check className="h-3.5 w-3.5 text-gv-aurora-emerald" />
            {savedState === "synced"
              ? "synced"
              : savedState === "saving"
                ? "syncing"
                : savedState === "conflict"
                  ? "conflict preserved"
                  : "local only"}
          </div>
        </div>
      </div>

      {isListening ? (
        <div className="mt-4">
          <TranscriptoryRecorder
            onRecordingReady={(file) => void preserveVoiceSource(file)}
          />
          <p className="mt-2 text-xs text-gv-text-muted">
            Audio is preserved in Transcriptory first. Nothing is added to this
            journal until you choose.
          </p>
        </div>
      ) : null}

      {voiceProcessing ? (
        <p className="mt-4 text-sm text-gv-text-secondary">
          Preserving audio and preparing its transcript…
        </p>
      ) : null}

      {voiceChoice ? (
        <div className="mt-4 rounded-[1.3rem] border border-cyan-200/20 bg-cyan-200/[0.07] p-4">
          <p className="text-sm font-semibold text-gv-text-primary">
            Where should this preserved voice capture rest?
          </p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-gv-text-secondary">
            {voiceChoice.transcript}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={useVoiceAsJournal}
              className="rounded-full border border-white/15 px-3 py-2 text-xs"
            >
              Add to journal
            </button>
            <button
              type="button"
              onClick={useVoiceAsScrapbook}
              className="rounded-full border border-white/15 px-3 py-2 text-xs"
            >
              Add to scrapbook
            </button>
            <button
              type="button"
              onClick={() => setVoiceChoice(null)}
              className="rounded-full border border-white/10 px-3 py-2 text-xs text-gv-text-muted"
            >
              Keep capture only
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative mt-4">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={queueSave}
          onBlur={flushSave}
          className="min-h-[230px] rounded-[1.5rem] border border-white/10 bg-gv-bg-deep/80 px-5 py-4 text-[0.98rem] leading-7 text-gv-text-primary outline-none transition-colors focus:border-gv-aurora-cyan/40"
          style={{ fontFamily: "var(--gv-font-body)" }}
        />

        {!hasContent ? (
          <div className="pointer-events-none absolute inset-0 flex items-start px-5 py-4 text-[0.98rem] leading-7 text-gv-text-muted">
            Nothing leaves here without your say.
          </div>
        ) : null}
      </div>
    </section>
  );
}
