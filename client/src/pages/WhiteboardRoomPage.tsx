import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Mic, MicOff, Paperclip, Sparkles, Wand2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { useBillySection } from "@/components/Billy";
import {
  readLivingCanvasAbsorbEnabled,
  readLivingCanvasProfileEntries,
  writeLivingCanvasAbsorbEnabled,
  writeLivingCanvasProfileEntries,
  type LivingCanvasProfileEntry,
} from "@/lib/livingCanvas";

type JournalEntry = {
  id: string;
  text: string;
  source: "voice" | "manual";
  left: string;
  top: string;
  rotate: number;
  width: string;
  chalk: string;
  size: number;
};

const BOARD_LAYOUTS = [
  { left: "7%", top: "10%", rotate: -2.6, width: "26%", tone: "emerald", size: 22 },
  { left: "33%", top: "9%", rotate: 1.4, width: "24%", tone: "violet", size: 20 },
  { left: "64%", top: "12%", rotate: -1.2, width: "25%", tone: "blue", size: 21 },
  { left: "13%", top: "41%", rotate: 2.3, width: "24%", tone: "amber", size: 18 },
  { left: "40%", top: "39%", rotate: -1.8, width: "28%", tone: "slate", size: 19 },
  { left: "72%", top: "38%", rotate: 1.1, width: "21%", tone: "emerald", size: 18 },
  { left: "9%", top: "71%", rotate: -1.4, width: "25%", tone: "violet", size: 20 },
  { left: "38%", top: "70%", rotate: 1.6, width: "28%", tone: "blue", size: 19 },
  { left: "68%", top: "69%", rotate: -2.2, width: "22%", tone: "amber", size: 18 },
] as const;

const ROOM_FEEDS = [
  {
    title: "Feeds the scaffold",
    copy: "Fragments can move into the External Scaffold of You when they need shape, sequence, or next-step structure.",
  },
  {
    title: "Feeds Creation Corner",
    copy: "Mood, sparks, and unfinished material can move into making without being flattened into productivity theater.",
  },
  {
    title: "Feeds the living profile",
    copy: "Everything here can become part of the user's living, breathing profile — not as surveillance, but as resonance.",
  },
];

const CHALK_COLORS = [
  { name: "cyber", label: "Neon Cyan", value: "#00e5ff" },
  { name: "lime", label: "Electric Lime", value: "#7dff4f" },
  { name: "violet", label: "Laser Violet", value: "#c64dff" },
  { name: "pink", label: "Hot Magenta", value: "#ff4fd8" },
  { name: "amber", label: "Solar Amber", value: "#ff9f1a" },
] as const;

function makeNote(
  text: string,
  source: JournalEntry["source"],
  index: number,
  chalk: string
): JournalEntry {
  const layout = BOARD_LAYOUTS[index % BOARD_LAYOUTS.length];
  return {
    id: crypto.randomUUID(),
    text,
    source,
    left: layout.left,
    top: layout.top,
    rotate: layout.rotate,
    width: layout.width,
    chalk,
    size: layout.size,
  };
}

export default function WhiteboardRoomPage() {
  useSEO(PAGE_SEO.whiteboardRoom);
  useBillySection("whiteboard-room");

  const [draftText, setDraftText] = useState(
    "Speak or type here. The surface will hold the fragment as script."
  );
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [profileEntries, setProfileEntries] = useState<LivingCanvasProfileEntry[]>([]);
  const [liveInterim, setLiveInterim] = useState("");
  const [chalkColor, setChalkColor] = useState<(typeof CHALK_COLORS)[number]["value"]>(
    CHALK_COLORS[0].value
  );
  const [absorbIntoProfile, setAbsorbIntoProfile] = useState(() => readLivingCanvasAbsorbEnabled(true));
  const lastCommittedTranscriptRef = useRef("");

  useEffect(() => {
    setProfileEntries(readLivingCanvasProfileEntries());
  }, []);

  useEffect(() => {
    writeLivingCanvasAbsorbEnabled(absorbIntoProfile);
  }, [absorbIntoProfile]);

  useEffect(() => {
    writeLivingCanvasProfileEntries(profileEntries);
  }, [profileEntries]);

  const addEntry = useCallback((text: string, source: JournalEntry["source"]) => {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) {
      return;
    }

    setJournalEntries((current) => [
      ...current.slice(-12),
      makeNote(normalized, source, current.length, chalkColor),
    ]);

    if (absorbIntoProfile) {
      setProfileEntries((current) => [
        {
          id: crypto.randomUUID(),
          text: normalized,
          createdAt: new Date().toISOString(),
          medium: source === "voice" ? "voice" : "text",
          sourceModule: "blackboard-room",
          resonanceTags: source === "voice" ? ["spoken-fragment", "blackboard-room"] : ["typed-fragment", "blackboard-room"],
        },
        ...current.slice(0, 17),
      ]);
    }
  }, [absorbIntoProfile, chalkColor]);

  const handleTranscript = useCallback(
    (fullTranscript: string) => {
      const normalized = fullTranscript.replace(/\s+/g, " ").trim();
      if (!normalized) {
        return;
      }

      const previous = lastCommittedTranscriptRef.current;
      const delta = normalized.startsWith(previous)
        ? normalized.slice(previous.length).trim()
        : normalized;

      lastCommittedTranscriptRef.current = normalized;
      setDraftText(normalized);

      if (delta) {
        addEntry(delta, "voice");
      }
    },
    [addEntry]
  );

  const { isListening, isSupported, audioLevel, error, toggle } = useVoiceChat({
    continuous: true,
    onTranscript: handleTranscript,
    onInterim: setLiveInterim,
  });

  useEffect(() => {
    if (isListening) {
      lastCommittedTranscriptRef.current = "";
      setLiveInterim("");
    }
  }, [isListening]);

  const pinManualFragment = () => {
    addEntry(draftText, "manual");
    setDraftText("");
  };

  const scaffoldHref = `/external-scaffold?seed=${encodeURIComponent(
    (liveInterim || draftText || "").trim()
  )}`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050608] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(132,255,181,0.14), transparent 20%), radial-gradient(circle at 82% 14%, rgba(122,92,255,0.16), transparent 24%), radial-gradient(circle at 50% 82%, rgba(0,0,0,0.55), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 26%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/sanctuary">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Sanctuary
            </a>
          </Link>
          <Link href="/creation-corner">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
              Creation Corner
              <ArrowRight className="h-4 w-4" />
            </a>
          </Link>
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-start">
          <div className="space-y-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/45">
              expression surface
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              A shared blackboard for spoken journaling, loose expression, and living profile ingestion.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/68">
              Talk out loud. Type. Upload later. This surface is where unfinished fragments can land without needing to be clean first. Nothing here is passive - what belongs can feed outward into your profile, scaffold, and creation flow.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/sanctuary">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
                  Back to Sanctuary
                </a>
              </Link>
              <Link href="/rapid-prototype">
                <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
                  Rapid Prototype Engine
                </a>
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                    voice journaling
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    Speak naturally. Final phrases can flow into the living profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    lastCommittedTranscriptRef.current = "";
                    toggle();
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                    isListening
                      ? "border-emerald-400/25 bg-emerald-400/12 text-emerald-50"
                      : "border-white/10 bg-white/[0.05] text-white/72 hover:text-white"
                  }`}
                  aria-pressed={isListening}
                  aria-label={isListening ? "Stop voice journaling" : "Start voice journaling"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isListening ? "Stop" : "Start voice"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                  living canvas profile
                </span>
                <button
                  type="button"
                  onClick={() => setAbsorbIntoProfile((value) => !value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] transition-colors ${
                    absorbIntoProfile
                      ? "border-emerald-400/22 bg-emerald-400/10 text-emerald-50"
                      : "border-white/10 bg-white/[0.04] text-white/65 hover:text-white"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      absorbIntoProfile ? "bg-emerald-300" : "bg-white/35"
                    }`}
                  />
                  {absorbIntoProfile ? "Absorbing into profile" : "Profile absorption off"}
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0c1114] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                    live draft
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isListening ? "animate-pulse bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                      {isListening ? "listening" : "idle"}
                    </span>
                  </div>
                </div>
                <div
                  className="mt-3 min-h-[160px] rounded-[1.25rem] border border-dashed border-white/10 bg-[#06090c] p-4"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                >
                  <p
                    className="font-['Permanent_Marker'] text-[1.45rem] leading-[1.55] text-slate-800"
                    style={{
                      color: chalkColor,
                      textShadow: "0 0 12px rgba(255,255,255,0.08)",
                    }}
                  >
                    {isListening && liveInterim
                      ? liveInterim
                      : draftText || "Your spoken fragment will land here before it is pinned."}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={pinManualFragment}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/22 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-50 transition-colors hover:bg-emerald-400/15"
                  >
                    <Paperclip className="h-4 w-4" />
                    Pin fragment
                  </button>
                  <Link href={scaffoldHref}>
                    <a className="inline-flex items-center gap-2 rounded-full border border-violet-400/22 bg-violet-400/10 px-4 py-2 text-sm text-violet-50 transition-colors hover:bg-violet-400/15">
                      <Wand2 className="h-4 w-4" />
                      Send to scaffold
                    </a>
                  </Link>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-violet-400 to-sky-300 transition-all"
                        style={{ width: `${Math.max(10, Math.round(audioLevel * 100))}%` }}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                      audio signal
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {CHALK_COLORS.map((color) => {
                    const active = color.value === chalkColor;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setChalkColor(color.value)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] transition-colors ${
                          active
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </button>
                    );
                  })}
                </div>

                {!isSupported && (
                  <p className="mt-4 text-sm text-amber-300/90">
                    Voice capture is not supported in this browser yet. Typing still works.
                  </p>
                )}
                {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2.3rem] border border-white/10 bg-[#071117] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
                  fragment log
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                  Fragments stay visible until the surface needs new space.
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-2 text-[11px] text-emerald-50">
                  <Sparkles className="h-4 w-4" />
                  living surface
                </div>
              </div>

              <div
                className="relative mt-5 min-h-[640px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#020405]"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(0,229,255,0.08), transparent 22%), radial-gradient(circle at 70% 22%, rgba(198,77,255,0.1), transparent 24%), radial-gradient(circle at 50% 80%, rgba(125,255,79,0.08), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 28%)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-45"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                  }}
                />

                <AnimatePresence>
                  {journalEntries.map((entry) => (
                    <motion.article
                      key={entry.id}
                      initial={{ opacity: 0, y: 24, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute rounded-[1.4rem] border border-white/10 bg-black/35 px-5 py-4 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm"
                      style={{
                        left: entry.left,
                        top: entry.top,
                        width: entry.width,
                        transform: `rotate(${entry.rotate}deg)`,
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                        {entry.source === "voice" ? "spoken fragment" : "typed fragment"}
                      </p>
                      <p
                        className="mt-3 font-['Permanent_Marker'] leading-[1.55]"
                        style={{
                          color: entry.chalk,
                          fontSize: `${entry.size}px`,
                          textShadow: `0 0 8px ${entry.chalk}22`,
                        }}
                      >
                        {entry.text}
                      </p>
                    </motion.article>
                  ))}
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 grid gap-3 border-t border-white/10 bg-black/25 p-4 backdrop-blur-sm sm:grid-cols-3">
                  {ROOM_FEEDS.map((feed) => (
                    <div
                      key={feed.title}
                      className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">
                        {feed.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-white/62">{feed.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                  profile memory
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/62">
                  This surface can absorb fragments into the living profile with medium, module origin, and resonance tags.
                </p>
                <p className="mt-4 text-xs text-white/38">
                  {profileEntries.length} profile fragments currently held on this device
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                  next ingestion lanes
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/62">
                  Images, screenshots, documents, and Musical DNA signals can route through this same surface as multimodal inputs.
                </p>
                <p className="mt-4 text-xs text-white/38">
                  Blackboard Room now acts as the ingestion mouth of the wider system.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
