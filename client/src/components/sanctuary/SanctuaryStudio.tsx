import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  BrainCircuit,
  NotebookPen,
  PanelsTopLeft,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { BINAURAL_PRESETS, type BinauralPreset } from "@/hooks/useBinauralBeats";
import { cn } from "@/lib/utils";
import { createId } from "@/lib/innerWorldFiles";

type JournalMood = "resting" | "clear" | "tender" | "focused" | "foggy";

type JournalEntry = {
  id: string;
  title: string;
  body: string;
  mood: JournalMood;
  createdAt: string;
  updatedAt: string;
};

type ScrapbookItem = {
  id: string;
  title: string;
  body: string;
  tag: string;
  createdAt: string;
};

type SanctuaryPersistence = {
  journal: JournalEntry[];
  scrapbook: ScrapbookItem[];
  preset: BinauralPreset;
};

const STORAGE_KEY = "gestaltview.sanctuary.studio.v1";

const MOODS: Array<{ value: JournalMood; label: string; hint: string }> = [
  { value: "resting", label: "Resting", hint: "slow down" },
  { value: "clear", label: "Clear", hint: "observe" },
  { value: "tender", label: "Tender", hint: "soften" },
  { value: "focused", label: "Focused", hint: "gather" },
  { value: "foggy", label: "Foggy", hint: "hold lightly" },
];

const DEFAULT_STATE: SanctuaryPersistence = {
  journal: [
    {
      id: "seed-rest",
      title: "Morning weather",
      body: "The room feels quieter when the work is not demanding an answer. Let this be a place to notice what is already here.",
      mood: "resting",
      createdAt: new Date("2026-05-18T09:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-05-18T09:00:00.000Z").toISOString(),
    },
  ],
  scrapbook: [
    {
      id: "seed-light",
      title: "Light over the desk",
      body: "A small bright thing that made the room feel survivable.",
      tag: "scene",
      createdAt: new Date("2026-05-18T09:00:00.000Z").toISOString(),
    },
    {
      id: "seed-quiet",
      title: "Silence before the next step",
      body: "A note to return to when the work wants to accelerate too quickly.",
      tag: "anchor",
      createdAt: new Date("2026-05-18T09:05:00.000Z").toISOString(),
    },
  ],
  preset: "alpha",
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readState(): SanctuaryPersistence {
  if (!hasStorage()) {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<SanctuaryPersistence>;
    return {
      journal: Array.isArray(parsed.journal) ? parsed.journal : DEFAULT_STATE.journal,
      scrapbook: Array.isArray(parsed.scrapbook) ? parsed.scrapbook : DEFAULT_STATE.scrapbook,
      preset: parsed.preset && parsed.preset in BINAURAL_PRESETS ? parsed.preset : DEFAULT_STATE.preset,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(next: SanctuaryPersistence): void {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function moodStyles(mood: JournalMood): string {
  switch (mood) {
    case "resting":
      return "border-emerald-300/20 bg-emerald-300/10 text-emerald-50";
    case "clear":
      return "border-cyan-300/20 bg-cyan-300/10 text-cyan-50";
    case "tender":
      return "border-[#C7A5FF]/20 bg-[#C7A5FF]/10 text-[#F0E6FF]";
    case "focused":
      return "border-white/15 bg-white/10 text-white/78";
    default:
      return "border-white/10 bg-white/[0.06] text-white/68";
  }
}

export default function SanctuaryStudio() {
  const [state, setState] = useState<SanctuaryPersistence>(() => readState());
  const [journalTitle, setJournalTitle] = useState("");
  const [journalBody, setJournalBody] = useState("");
  const [journalMood, setJournalMood] = useState<JournalMood>("resting");
  const [scrapTitle, setScrapTitle] = useState("");
  const [scrapBody, setScrapBody] = useState("");
  const [scrapTag, setScrapTag] = useState("memory");

  useEffect(() => {
    writeState(state);
  }, [state]);

  const selectedPreset = useMemo(() => BINAURAL_PRESETS[state.preset], [state.preset]);

  const saveJournalEntry = () => {
    const body = journalBody.trim();
    if (!body) return;

    const now = new Date().toISOString();
    const nextEntry: JournalEntry = {
      id: createId("journal"),
      title: journalTitle.trim() || "Untitled reflection",
      body,
      mood: journalMood,
      createdAt: now,
      updatedAt: now,
    };

    setState((current) => ({
      ...current,
      journal: [nextEntry, ...current.journal].slice(0, 12),
    }));
    setJournalBody("");
    setJournalTitle("");
  };

  const deleteJournalEntry = (id: string) => {
    setState((current) => ({
      ...current,
      journal: current.journal.filter((entry) => entry.id !== id),
    }));
  };

  const loadJournalEntry = (entry: JournalEntry) => {
    setJournalTitle(entry.title);
    setJournalBody(entry.body);
    setJournalMood(entry.mood);
  };

  const addScrapbookItem = () => {
    const body = scrapBody.trim();
    if (!body) return;

    const item: ScrapbookItem = {
      id: createId("scrap"),
      title: scrapTitle.trim() || "Pinned fragment",
      body,
      tag: scrapTag.trim() || "memory",
      createdAt: new Date().toISOString(),
    };

    setState((current) => ({
      ...current,
      scrapbook: [item, ...current.scrapbook].slice(0, 12),
    }));
    setScrapTitle("");
    setScrapBody("");
    setScrapTag("memory");
  };

  const deleteScrapbookItem = (id: string) => {
    setState((current) => ({
      ...current,
      scrapbook: current.scrapbook.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <GlassCard glow="none" intensity="medium" className="border-white/12 bg-white/[0.05] p-5 sm:p-6" hover={false}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <NotebookPen className="h-5 w-5 text-[#84f5c0]" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#84f5c0]">
                Journal editor
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">Write privately, keep the thread.</h2>
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
            {state.journal.length} entries
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <input
            value={journalTitle}
            onChange={(event) => setJournalTitle(event.target.value)}
            placeholder="Entry title"
            className="w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#84f5c0]/40"
          />
          <textarea
            value={journalBody}
            onChange={(event) => setJournalBody(event.target.value)}
            placeholder="Write what is true. Nothing has to be polished."
            rows={8}
            className="min-h-[12rem] w-full resize-none rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/30 focus:border-[#84f5c0]/40"
          />

          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setJournalMood(mood.value)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition",
                  journalMood === mood.value
                    ? "border-[#84f5c0]/35 bg-[#84f5c0]/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-white/60 hover:text-white",
                )}
              >
                {mood.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveJournalEntry}
              className="inline-flex items-center gap-2 rounded-full border border-[#84f5c0]/25 bg-[#84f5c0]/12 px-4 py-2.5 text-sm text-white transition hover:border-[#84f5c0]/40 hover:bg-[#84f5c0]/18"
            >
              <Plus className="h-4 w-4" />
              Save note
            </button>
            <button
              type="button"
              onClick={() => {
                setJournalBody("");
                setJournalTitle("");
                setJournalMood("resting");
              }}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/68 transition hover:text-white"
            >
              Clear draft
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <AnimatePresence initial={false}>
            {state.journal.map((entry) => (
              <motion.article
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-medium text-white">{entry.title}</h3>
                      <span className={cn("rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]", moodStyles(entry.mood))}>
                        {entry.mood}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/42">
                      {formatTimestamp(entry.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => loadJournalEntry(entry)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/60 transition hover:text-white"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteJournalEntry(entry.id)}
                      className="rounded-full border border-white/10 bg-white/[0.04] p-1.5 text-white/45 transition hover:text-white"
                      aria-label={`Delete ${entry.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/66">
                  {entry.body}
                </p>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      <div className="grid gap-4">
        <GlassCard glow="none" intensity="medium" className="border-white/12 bg-white/[0.05] p-5 sm:p-6" hover={false}>
          <div className="flex items-center gap-3">
            <PanelsTopLeft className="h-5 w-5 text-[#f5d36b]" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#f5d36b]">
                Scrapbook panel
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">Keep the fragments that matter.</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <input
              value={scrapTitle}
              onChange={(event) => setScrapTitle(event.target.value)}
              placeholder="Fragment title"
              className="w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f5d36b]/35"
            />
            <textarea
              value={scrapBody}
              onChange={(event) => setScrapBody(event.target.value)}
              rows={5}
              placeholder="A clipped thought, a scene, a quote, an image description."
              className="w-full resize-none rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/30 focus:border-[#f5d36b]/35"
            />
            <input
              value={scrapTag}
              onChange={(event) => setScrapTag(event.target.value)}
              placeholder="Tag"
              className="w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f5d36b]/35"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={addScrapbookItem}
                className="inline-flex items-center gap-2 rounded-full border border-[#f5d36b]/25 bg-[#f5d36b]/10 px-4 py-2.5 text-sm text-white transition hover:border-[#f5d36b]/40 hover:bg-[#f5d36b]/16"
              >
                <Plus className="h-4 w-4" />
                Pin fragment
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!journalBody.trim()) return;
                  setScrapTitle(journalTitle.trim() || "Pinned note");
                  setScrapBody(journalBody.trim());
                  setScrapTag(journalMood);
                }}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/68 transition hover:text-white"
              >
                Lift from draft
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <AnimatePresence initial={false}>
              {state.scrapbook.map((item) => (
                <motion.article
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-white">{item.title}</h3>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/56">
                          {item.tag}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/42">
                        {formatTimestamp(item.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteScrapbookItem(item.id)}
                      className="rounded-full border border-white/10 bg-white/[0.04] p-1.5 text-white/45 transition hover:text-white"
                      aria-label={`Remove ${item.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/66">
                    {item.body}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>

        <GlassCard glow="none" intensity="medium" className="border-white/12 bg-white/[0.05] p-5 sm:p-6" hover={false}>
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-[#7fe9ff]" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#7fe9ff]">
                Musical DNA hub
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">Choose the state that fits the moment.</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(BINAURAL_PRESETS).map(([key, preset]) => {
                const active = state.preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setState((current) => ({ ...current, preset: key as BinauralPreset }))}
                    className={cn(
                      "rounded-[1rem] border px-4 py-3 text-left transition",
                      active
                        ? "border-[#7fe9ff]/35 bg-[#7fe9ff]/12"
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">{preset.label}</span>
                      {active ? <Sparkles className="h-4 w-4 text-[#7fe9ff]" /> : null}
                    </div>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/42">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.1rem] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                    Active preset
                  </p>
                  <h3 className="mt-1 text-lg font-medium text-white">{selectedPreset.label}</h3>
                </div>
                <Link href="/musical-dna">
                  <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/70 transition hover:text-white">
                    Open room
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </Link>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/64">{selectedPreset.therapeuticUse}</p>
              <div className="mt-4 grid gap-2 text-sm text-white/58 sm:grid-cols-2">
                <div className="rounded-[0.95rem] border border-white/10 bg-white/[0.04] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">Beat</p>
                  <p className="mt-1">{selectedPreset.beatFreq} Hz</p>
                </div>
                <div className="rounded-[0.95rem] border border-white/10 bg-white/[0.04] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/42">Carrier</p>
                  <p className="mt-1">{selectedPreset.baseFreq} Hz</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
