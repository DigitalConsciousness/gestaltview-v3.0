import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { loadSanctuaryJournalFromServer, saveSanctuaryJournalRecordToServer } from "@/lib/sanctuaryContent";
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
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function isLater(left: string, right: string): boolean {
  return Date.parse(left) > Date.parse(right);
}

function toJournalEntry(record: { id: string; content: string; createdAt: string; updatedAt: string }): JournalEntry {
  return {
    id: record.id,
    content: record.content,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export default function JournalEditor() {
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const voiceBaseRef = useRef("");
  const voiceTranscriptRef = useRef("");
  const initialJournal = useMemo(() => readStoredJournal(), []);
  const [journal, setJournal] = useState(initialJournal);
  const [savedState, setSavedState] = useState<"saved" | "saving">("saved");
  const [isListening, setIsListening] = useState(false);
  const [surfaceSettings, setSurfaceSettings] = useState<UserSurfaceSettings>(() => readUserSurfaceSettings());

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
      recognitionRef.current?.stop?.();
    };
  }, []);

  useEffect(() => {
    const onSettingsChanged = (event: Event) => {
      const next = (event as CustomEvent<UserSurfaceSettings>).detail ?? readUserSurfaceSettings();
      setSurfaceSettings(next);
      if (!next.voiceCapture) {
        recognitionRef.current?.stop?.();
      }
    };

    window.addEventListener(USER_SURFACE_SETTINGS_EVENT, onSettingsChanged);
    return () => window.removeEventListener(USER_SURFACE_SETTINGS_EVENT, onSettingsChanged);
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
      setSavedState("saved");
      return;
    }

    const remoteJournal = await saveSanctuaryJournalRecordToServer({ journalId: journal.id, content });
    if (!remoteJournal) {
      if ((editorRef.current?.innerHTML ?? "") === content) {
        setSavedState("saved");
        toast.error("Could not sync the journal. Your local copy was kept.");
      }
      return;
    }

    if ((editorRef.current?.innerHTML ?? "") !== content) {
      return;
    }

    const next = toJournalEntry(remoteJournal);
    setJournal(next);
    writeStoredJournal(next);
    setSavedState("saved");
  };

  const queueSave = () => {
    const content = editorRef.current?.innerHTML ?? journal.content;
    const next = {
      ...journal,
      content,
      updatedAt: new Date().toISOString(),
    };

    setJournal(next);
    writeStoredJournal(next);
    setSavedState("saving");

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
    const next = {
      ...journal,
      content: html,
      updatedAt: new Date().toISOString(),
    };
    setJournal(next);
    writeStoredJournal(next);
    setSavedState("saving");
  };

  const toggleVoice = () => {
    if (!surfaceSettings.voiceCapture) {
      toast.info("Voice capture is turned off in Settings.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop?.();
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      toast.error("Voice capture is unavailable in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      voiceBaseRef.current = editorRef.current?.innerHTML ?? journal.content;
      voiceTranscriptRef.current = "";
      setIsListening(true);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      flushSave();
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      toast.error(event?.error ? `Voice capture stopped: ${event.error}` : "Voice capture stopped.");
    };
    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? "";
        if (result.isFinal) finalText += transcript;
        else interimText += transcript;
      }

      if (finalText.trim()) {
        voiceTranscriptRef.current = [voiceTranscriptRef.current, finalText.trim()].filter(Boolean).join(" ");
      }

      const transcript = [voiceTranscriptRef.current, interimText.trim()].filter(Boolean).join(" ").trim();
      const html = [voiceBaseRef.current, transcript ? `<p>${transcript}</p>` : ""].filter(Boolean).join("<br />");
      setEditorHtml(html);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gv-text-primary">Journal</p>
          <p className="mt-1 text-xs text-gv-text-muted">Autosaves quietly as you write.</p>
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
            {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {isListening ? "listening" : "voice"}
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/55">
            <Check className="h-3.5 w-3.5 text-gv-aurora-emerald" />
            {savedState === "saved" ? "saved" : "saving"}
          </div>
        </div>
      </div>

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
