import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, CloudOff, CloudUpload, Copy, Download, Loader2, Mic, MicOff, Volume2 } from "lucide-react";

import VoiceInputUniversal from "@/components/VoiceInput-Universal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/GlassCard";
import type { OfflineCaptureItem } from "@shared/operation-render/contracts";

type VoiceNote = {
  id: string;
  text: string;
  createdAt: string;
  syncStatus: OfflineCaptureItem["syncStatus"];
  lastError?: string;
};

const STORAGE_KEY = "gv-voice-notes-v1";

function readStoredNotes(): VoiceNote[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as VoiceNote[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((note) => typeof note?.id === "string" && typeof note?.text === "string")
      .map((note) => ({
        id: note.id,
        text: note.text,
        createdAt: typeof note.createdAt === "string" ? note.createdAt : new Date().toISOString(),
        syncStatus:
          note.syncStatus === "synced" || note.syncStatus === "syncing" || note.syncStatus === "failed"
            ? note.syncStatus
            : "local",
        lastError: typeof note.lastError === "string" ? note.lastError : undefined,
      }));
  } catch {
    return [];
  }
}

function writeStoredNotes(notes: VoiceNote[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Keep the in-memory queue even if storage is unavailable.
  }
}

export function VoiceInterface() {
  const [notes, setNotes] = useState<VoiceNote[]>(() => readStoredNotes());
  const [manualText, setManualText] = useState("");
  const [isCopying, setIsCopying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const latestNote = useMemo(() => notes[0] ?? null, [notes]);
  const queuedNotes = useMemo(() => notes.filter((note) => note.syncStatus !== "synced"), [notes]);
  const syncedCount = useMemo(() => notes.filter((note) => note.syncStatus === "synced").length, [notes]);

  useEffect(() => {
    writeStoredNotes(notes);
  }, [notes]);

  const syncQueuedNotes = useCallback(async () => {
    const pending = notes.filter((note) => note.syncStatus !== "synced");
    if (pending.length === 0) {
      setSyncMessage("Everything is already synced.");
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      for (const note of pending) {
        markNoteStatus(note.id, "syncing");

        const response = await fetch("/api/transcriptory/captures", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            title: note.text.slice(0, 80) || "Voice note",
            rawTranscript: note.text,
            summary: note.text.length > 280 ? `${note.text.slice(0, 277)}...` : note.text,
            sourceKind: "text",
            sourceLabel: "Voice interface",
            sourceType: "manual_text",
            sourcePage: "voice-interface",
            themes: ["voice", "field-continuity"],
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          const message = payload.error?.trim() || `Sync failed with status ${response.status}`;
          markNoteStatus(note.id, "failed", message);
          continue;
        }

        markNoteStatus(note.id, "synced");
      }

      setSyncMessage("Queued notes synced to transcriptory captures.");
    } catch (thrown) {
      const message = thrown instanceof Error ? thrown.message : "Sync failed.";
      setSyncMessage(message);
      for (const note of pending) {
        markNoteStatus(note.id, "failed", message);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [notes]);

  useEffect(() => {
    const syncFromQueue = () => {
      void syncQueuedNotes();
    };

    window.addEventListener("online", syncFromQueue);
    return () => window.removeEventListener("online", syncFromQueue);
  }, [syncQueuedNotes]);

  const addNote = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setNotes((current) => [
      {
        id: crypto.randomUUID(),
        text: trimmed,
        createdAt: new Date().toISOString(),
        syncStatus: "local",
      },
      ...current,
    ]);
    setManualText("");
  };

  const markNoteStatus = (id: string, syncStatus: VoiceNote["syncStatus"], lastError?: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              syncStatus,
              lastError,
            }
          : note
      )
    );
  };

  const exportNotes = () => {
    const payload = JSON.stringify(notes, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gestaltview-voice-notes.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyLatest = async () => {
    if (!latestNote) {
      return;
    }

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(latestNote.text);
    } finally {
      setIsCopying(false);
    }
  };

  const exportQueuedNotes = () => {
    const payload = JSON.stringify(queuedNotes, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gestaltview-voice-notes-queued.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <GlassCard glow="cyan" intensity="high" className="p-5 md:p-6" hover={false}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00E5FF]">Voice</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Capture speech, then keep moving</h2>
          </div>
          <Volume2 className="h-5 w-5 text-[#00E5FF]" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/55">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            {queuedNotes.length} queued
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            {syncedCount} synced
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
            {typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline"}
          </span>
        </div>

        <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-black/25 p-4">
          <VoiceInputUniversal
            autoSubmit
            placeholder="Click to start voice input..."
            onTranscriptReceived={addNote}
            className="bg-transparent"
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <Textarea
            value={manualText}
            onChange={(event) => setManualText(event.target.value)}
            rows={4}
            placeholder="Or type a note and save it locally."
            className="border-white/10 bg-black/25 text-white placeholder:text-white/25"
          />
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={() => addNote(manualText)}
              className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white"
            >
              <Mic className="h-4 w-4" />
              Save note
            </Button>
            <Button
              type="button"
              onClick={exportNotes}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              type="button"
              onClick={syncQueuedNotes}
              disabled={isSyncing || queuedNotes.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
              Sync queue
            </Button>
            <Button
              type="button"
              onClick={exportQueuedNotes}
              disabled={queuedNotes.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CloudOff className="h-4 w-4" />
              Export unsynced
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={copyLatest}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75"
          >
            {isCopying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            Copy latest
            </Button>
          <Button
            type="button"
            onClick={() => addNote("Voice capture is running locally and ready for the next thought.")}
            className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white"
          >
            <MicOff className="h-4 w-4" />
            Add sample
          </Button>
        </div>

        {syncMessage ? (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/60">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#A7F3D0]" />
            <p>{syncMessage}</p>
          </div>
        ) : null}
      </GlassCard>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-white">Saved voice notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-white/55">No voice notes saved yet.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm leading-relaxed text-white/70">{note.text}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                    {new Date(note.createdAt).toLocaleTimeString()}
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                    {note.syncStatus}
                  </span>
                </div>
                {note.lastError ? <p className="mt-2 text-xs text-amber-200">{note.lastError}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
