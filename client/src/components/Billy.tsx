/**
 * Billy.tsx — GestaltView Digital Intelligence Interface
 *
 * Components:
 *   BillyOrb        — floating presence indicator (bottom-right), renders BillyBabylon avatar
 *   BillyPanel      — full synthesis panel (slides in from right)
 *   BillyChip       — per-section inline "Ask Billy" chip
 *   BillyProvider   — context provider, exposes isLoading + isListening
 *
 * Billy is the digital intelligence that holds the platform together:
 * safe by default, respectful by default, private until permission is given.
 *
 * Hooks (exported for use in demo pages):
 *   useBilly()            — access context (openPanel, setCurrentSection, etc.)
 *   useSectionObserver()  — IntersectionObserver-based auto section detection
 *   useBillySection()     — simple on-mount section setter for demo/exhibit pages
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  X,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Network,
  Code2,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import EmbodimentSelector from "./EmbodimentSelector";
import {
  billyCall,
  buildWeavePlan,
  queryLoom,
  getAllNodes,
  SECTION_CONTEXTS,
  type SynthesisMode,
  type LoomResult,
  type ManifestNode,
} from "../lib/BillyEngine";
import { callBillyApi, type BillySessionMetadata } from "../lib/billyApi";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { useBillyVoice } from "../hooks/useBillyVoice";
import { useBillyVoicePreference } from "../hooks/useBillyVoicePreference";
import type { TrainerEmbodimentSlug } from "@shared/agent-trainer/embodiment";
import BillyMarkdown from "./BillyMarkdown";
import { ThinkingAnimation } from "@/components/thinking/ThinkingAnimation";

const BillyBabylon = lazy(() => import("./BillyBabylon"));

// ─── Context ──────────────────────────────────────────────────────────────────

interface BillyContextValue {
  currentSection: string;
  setCurrentSection: (id: string) => void;
  openPanel: (prompt?: string, mode?: SynthesisMode) => void;
  isOpen: boolean;
  /** true while Billy is generating a response */
  isLoading: boolean;
  /** true while microphone is active */
  isListening: boolean;
}

const BillyContext = createContext<BillyContextValue>({
  currentSection: "hero",
  setCurrentSection: () => {},
  openPanel: () => {},
  isOpen: false,
  isLoading: false,
  isListening: false,
});

export function useBilly() {
  return useContext(BillyContext);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  symbioCoder: any;
  vibeCoder: any;
  role: "user" | "billy";
  content: string;
  provider?: string;
  mode?: SynthesisMode;
  loomResults?: LoomResult[];
}

const SECTION_TO_ROOM_SLUG: Record<string, string> = {
  sanctuary: "sanctuary",
  "blackboard-room": "blackboard-room",
  "whiteboard-room": "blackboard-room",
  "digital-intelligence-academy": "digital-intelligence-academy",
  "embodiment-studio": "embodiment-studio",
  "agent-council": "tribunal",
  tribunal: "tribunal",
  "external-scaffold": "external-scaffold",
  "creation-corner": "creation-corner",
  "dynamic-inner-world": "dynamic-inner-world",
  "masterclass": "masterclass",
  "di-session": "di-session",
};

const BILLY_THINKING_MESSAGES = [
  "Billy is weaving the room back into focus.",
  "Retrieving context from the Loom. This is taking the scenic route.",
  "The answer is being checked against the current shape of reality.",
  "Billy is organizing the thread before it becomes a sentence.",
  "Hold on. The platform is doing the invisible work in public.",
];

function resolveBillyRoomSlug(sectionId: string): string | null {
  const normalized = sectionId.trim().toLowerCase();
  return SECTION_TO_ROOM_SLUG[normalized] ?? null;
}

function BillyAvatarFallback({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        background: "radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.35), rgba(5, 10, 14, 0.95) 72%)",
      }}
    />
  );
}

// ─── Billy Provider ───────────────────────────────────────────────────────────

export function BillyProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState("hero");
  const [isOpen, setIsOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const [initialMode, setInitialMode] = useState<SynthesisMode>("synthesize");

  // Lifted state — BillyPanel writes these via callbacks; BillyOrb reads them for BillyBabylon mood
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [shouldDeferPanelEffects, setShouldDeferPanelEffects] = useState(false);
  const [hasOpenedPanel, setHasOpenedPanel] = useState(false);
  const [embodimentProfileSlug, setEmbodimentProfileSlug] =
    useState<TrainerEmbodimentSlug>("billy");
  const [location] = useLocation();
  const suppressBillyShell = location === "/billy";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const handleChange = () => setIsMobileViewport(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (suppressBillyShell && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen, suppressBillyShell]);

  const openPanel = useCallback((prompt?: string, mode: SynthesisMode = "synthesize") => {
    setShouldDeferPanelEffects(isMobileViewport && !hasOpenedPanel);
    setHasOpenedPanel(true);
    setInitialPrompt(prompt);
    setInitialMode(mode);
    setIsOpen(true);
  }, [hasOpenedPanel, isMobileViewport]);

  const billyMood: "idle" | "listening" | "processing" = isListening
    ? "listening"
    : isLoading
    ? "processing"
    : "idle";

  return (
    <BillyContext.Provider
      value={{ currentSection, setCurrentSection, openPanel, isOpen, isLoading, isListening }}
    >
      {children}
      {!suppressBillyShell && (
        <>
          <BillyOrb
            isOpen={isOpen}
            onToggle={() => setIsOpen((v) => !v)}
            currentSection={currentSection}
            mood={billyMood}
          />
          <AnimatePresence>
            {isOpen && (
              <BillyPanel
                onClose={() => setIsOpen(false)}
                currentSection={currentSection}
                initialPrompt={initialPrompt}
                initialMode={initialMode}
                embodimentProfileSlug={embodimentProfileSlug}
                onEmbodimentChange={setEmbodimentProfileSlug}
                deferVisualEffects={shouldDeferPanelEffects}
                onLoadingChange={setIsLoading}
                onListeningChange={setIsListening}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </BillyContext.Provider>
  );
}

// ─── Billy Orb ────────────────────────────────────────────────────────────────

function BillyOrb({
  isOpen,
  onToggle,
  currentSection,
  mood,
}: {
  isOpen: boolean;
  onToggle: () => void;
  currentSection: string;
  mood: "idle" | "listening" | "processing";
}) {
  const sectionCtx = SECTION_CONTEXTS[currentSection];
  const sectionName = sectionCtx?.section_name || "Home";

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      {/* Section label — only when panel is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs cursor-pointer select-none"
            style={{
              background: "rgba(0,10,20,0.85)",
              border: "1px solid rgba(0,212,255,0.25)",
              backdropFilter: "blur(8px)",
              color: "rgba(0,212,255,0.75)",
              fontFamily: "var(--gv-font-mono)",
              letterSpacing: "0.04em",
            }}
            onClick={onToggle}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "rgba(0,212,255,0.8)" }}
            />
            Billy · {sectionName}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Orb — BillyBabylon avatar, mood-driven */}
      <motion.div
        onClick={onToggle}
        className="relative cursor-pointer"
        style={{ width: 56, height: 56 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        aria-label={isOpen ? "Close Billy" : "Open Billy"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
      >
        {/* BillyBabylon renders the Babylon.js orb with live mood */}
        <div className="rounded-full overflow-hidden w-14 h-14">
          <Suspense fallback={<BillyAvatarFallback size={56} />}>
            <BillyBabylon size={56} mood={mood} />
          </Suspense>
        </div>

        {/* Close icon overlay when panel is open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="close-overlay"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center rounded-full"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <X size={20} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Billy Panel ──────────────────────────────────────────────────────────────

function BillyPanel({
  onClose,
  currentSection,
  initialPrompt,
  initialMode,
  embodimentProfileSlug,
  onEmbodimentChange,
  deferVisualEffects,
  onLoadingChange,
  onListeningChange,
}: {
  onClose: () => void;
  currentSection: string;
  initialPrompt?: string;
  initialMode: SynthesisMode;
  embodimentProfileSlug: TrainerEmbodimentSlug;
  onEmbodimentChange: (value: TrainerEmbodimentSlug) => void;
  deferVisualEffects: boolean;
  onLoadingChange: (v: boolean) => void;
  onListeningChange: (v: boolean) => void;
}) {
  const [mode, setMode] = useState<SynthesisMode>(initialMode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialPrompt || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loomBrowse, setLoomBrowse] = useState<ManifestNode[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const {
    speak,
    stop: stopVoice,
    isSpeaking,
    isAvailable: isVoiceAvailable,
    provider: voiceProvider,
    mode: voiceMode,
    error: voiceError,
  } = useBillyVoice();
  const voiceReplyAvailable = isVoiceAvailable;
  const resolvedVoiceProvider = voiceProvider === "none" ? voiceMode : voiceProvider;
  const [voiceEnabled, setVoiceEnabled] = useBillyVoicePreference("shared");

  // Propagate local isLoading up to provider so BillyOrb / BillyBabylon can react
  useEffect(() => { onLoadingChange(isLoading); }, [isLoading, onLoadingChange]);

  const sectionCtx = SECTION_CONTEXTS[currentSection] || SECTION_CONTEXTS["hero"];
  const roomSlug = resolveBillyRoomSlug(currentSection);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: deferVisualEffects ? "auto" : "smooth" });
  }, [deferVisualEffects, isLoading, messages]);

  // Initial greeting
  useEffect(() => {
    setMessages([{
      role: "billy", content: sectionCtx.billy_framing, mode: "synthesize",
      symbioCoder: undefined,
      vibeCoder: undefined
    }]);
  }, [currentSection]);

  // Auto-send initial prompt if provided
  useEffect(() => {
    if (!initialPrompt || !initialPrompt.trim()) return;

    let timeoutId: number | undefined;
    let rafId1: number | undefined;
    let rafId2: number | undefined;

    setInput(initialPrompt);
    const queueSend = () => {
      timeoutId = window.setTimeout(() => handleSend(initialPrompt), deferVisualEffects ? 700 : 400);
    };

    if (deferVisualEffects) {
      rafId1 = window.requestAnimationFrame(() => {
        rafId2 = window.requestAnimationFrame(() => queueSend());
      });
    } else {
      queueSend();
    }

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (rafId1 !== undefined) cancelAnimationFrame(rafId1);
      if (rafId2 !== undefined) cancelAnimationFrame(rafId2);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferVisualEffects, initialPrompt]);

  // Load loom nodes for browse tab
  useEffect(() => {
    if (mode === "loom") setLoomBrowse(getAllNodes());
  }, [mode]);

  const handleSend = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim();
      if (!text || isLoading) return;
      setInput("");
      setErrorMessage(null);
      setIsLoading(true);
      const userMsg: Message = {
        role: "user", content: text, mode,
        symbioCoder: undefined,
        vibeCoder: undefined
      };
      setMessages((prev) => [...prev, userMsg]);
      const weavePlan = buildWeavePlan(text);
      const loomResults = queryLoom(weavePlan, 3);

      try {
        const result = mode === "synthesize"
          ? await callBillyApi(
              text,
              currentSection,
              "synthesis",
              undefined,
              embodimentProfileSlug,
              roomSlug
            )
          : await billyCall(text, currentSection, mode, undefined, embodimentProfileSlug, roomSlug);
        const billyMsg: Message = {
          role: "billy",
          content: result.text,
          provider: result.provider,
          mode,
          loomResults: mode === "loom" ? loomResults : undefined,
          symbioCoder: result.metadata?.symbioCoder ?? null,
          vibeCoder: result.metadata?.vibeCoder ?? null,
        };
        setMessages((prev) => [...prev, billyMsg]);

        if (voiceEnabled) {
          void speak(result.text);
        }
      } catch (error: unknown) {
        const resolvedError = error instanceof Error ? error.message : String(error);
        setErrorMessage(resolvedError);
        setMessages((prev) => [
          ...prev,
          {
            role: "billy",
            content:
              "My connection to the cloud is disrupted right now, but I am still here. Try again in a moment and I will keep weaving with you.",
            provider: "error",
            mode,
            symbioCoder: undefined,
            vibeCoder: undefined,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSection, embodimentProfileSlug, input, isLoading, mode, roomSlug, speak, voiceEnabled]
  );

  // ── Voice input — useVoiceChat (replaces legacy useVoiceInput) ────────────
  const {
    isListening,
    audioLevel,
    toggle: toggleVoice,
  } = useVoiceChat({
    onTranscript: (t: string) => setInput((prev) => (prev ? prev + " " + t : t)),
  });

  // Propagate isListening up to provider
  useEffect(() => { onListeningChange(isListening || isSpeaking); }, [isListening, isSpeaking, onListeningChange]);

  useEffect(() => () => stopVoice(), [stopVoice]);

  const TABS: Array<{ id: SynthesisMode; label: string; icon: ReactNode; desc: string }> = [
    { id: "synthesize", label: "Synthesize", icon: <Sparkles size={14} />, desc: "Ask anything — get a layered, consciousness-serving response" },
    { id: "loom", label: "Loom", icon: <Network size={14} />, desc: "Browse the Knowledge Loom — 7 Claims, 18 Moats, all products" },
    { id: "code", label: "Code", icon: <Code2 size={14} />, desc: "Generate working code from GestaltView concepts" },
  ];

  // ── GV cyberpunk-neural panel colors ──────────────────────────────────────
  const GV_TEAL = "rgba(0,212,255,";
  const GV_BG = "rgba(5,8,16,0.97)";
  const GV_BORDER = `${GV_TEAL}0.15)`;
  const GV_TEXT = "rgba(232,240,255,0.82)";

  return (
    <motion.div
      className="fixed right-0 top-0 bottom-0 z-[9998] flex flex-col"
      style={{
        width: "min(480px, 100vw)",
        background: GV_BG,
        borderLeft: `1px solid ${GV_BORDER}`,
        backdropFilter: "blur(20px)",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.7)",
      }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${GV_BORDER}` }}
      >
        <div className="flex items-center gap-3">
          {/* Mini BillyBabylon in panel header */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Suspense fallback={<BillyAvatarFallback size={32} />}>
              <BillyBabylon
                size={32}
                mood={isLoading ? "processing" : isListening ? "listening" : "idle"}
              />
            </Suspense>
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: "rgba(232,240,255,0.9)", fontFamily: "var(--gv-font-body)" }}>Billy</div>
            <div className="text-xs" style={{ color: `${GV_TEAL}0.65)`, fontFamily: "var(--gv-font-mono)", fontSize: "10px" }}>
              {sectionCtx.section_name}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: GV_TEXT }}>
          <X size={18} />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${GV_TEAL}0.08)` }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all flex-1 justify-center"
            style={{
              background: mode === tab.id ? `${GV_TEAL}0.15)` : "transparent",
              border: mode === tab.id ? `1px solid ${GV_TEAL}0.35)` : "1px solid transparent",
              color: mode === tab.id ? `${GV_TEAL}0.9)` : "rgba(232,240,255,0.4)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: mode === tab.id ? 500 : 400,
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${GV_TEAL}0.08)` }}>
        <EmbodimentSelector
          value={embodimentProfileSlug}
          onValueChange={onEmbodimentChange}
          label="Embodiment Standard"
          showDetails={false}
          triggerClassName="border-cyan-500/20 bg-black/30 text-cyan-100"
          labelClassName="text-cyan-500/60"
        />
      </div>

      {/* Loom Browse */}
      {mode === "loom" && messages.length <= 1 && (
        <div className="flex-1 overflow-y-auto px-4 py-3">
            <p className="text-xs mb-3" style={{ color: "rgba(232,240,255,0.4)", fontFamily: "var(--gv-font-body)", fontStyle: "italic" }}>
            Browse the GestaltView Knowledge Loom — or ask a question below to retrieve relevant nodes.
          </p>
          {(["claim", "moat", "product", "protocol", "concept"] as const).map((type) => {
            const nodes = loomBrowse.filter((n) => n.type === type);
            if (!nodes.length) return null;
            return (
              <div key={type} className="mb-4">
                <div className="text-xs uppercase tracking-widest mb-2" style={{ color: `${GV_TEAL}0.5)`, fontFamily: "var(--gv-font-mono)" }}>
                  {type === "claim" ? "7 Truth Claims" : type === "moat" ? "Operational Moats" : type === "product" ? "Products" : type === "protocol" ? "Protocols" : "Concepts"}
                </div>
                <div className="flex flex-col gap-1.5">
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => { setInput(`Tell me about: ${node.title}`); setMode("synthesize"); setTimeout(() => handleSend(`Tell me about: ${node.title}`), 100); }}
                      className="text-left px-3 py-2 rounded-lg transition-all group"
                      style={{ background: `${GV_TEAL}0.04)`, border: `1px solid ${GV_TEAL}0.1)` }}
                    >
                      <div className="text-xs font-medium flex items-center justify-between" style={{ color: "rgba(232,240,255,0.75)", fontFamily: "var(--gv-font-body)" }}>
                        {node.title}
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: `${GV_TEAL}0.7)` }} />
                      </div>
                      <div className="text-xs mt-0.5 line-clamp-2" style={{ color: "rgba(232,240,255,0.35)", fontFamily: "var(--gv-font-body)" }}>
                        {node.description.slice(0, 90)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Messages */}
      {(mode !== "loom" || messages.length > 1) && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {msg.role === "billy" ? (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                    <Suspense fallback={<BillyAvatarFallback size={24} />}>
                      <BillyBabylon size={24} mood="idle" />
                    </Suspense>
                  </div>
                  <div className="flex-1 min-w-0">
                    {msg.mode && (
                      <div className="text-xs mb-1.5 flex items-center gap-1" style={{ color: `${GV_TEAL}0.5)`, fontFamily: "var(--gv-font-mono)", fontSize: "10px" }}>
                        {msg.mode === "synthesize" && <Sparkles size={10} />}
                        {msg.mode === "loom" && <Network size={10} />}
                        {msg.mode === "code" && <Code2 size={10} />}
                        {msg.mode}{msg.provider && ` · ${msg.provider}`}
                      </div>
                    )}
                    <BillyMarkdown
                      content={msg.content}
                      className="text-sm leading-relaxed text-slate-200/85"
                    />
                    {msg.loomResults && msg.loomResults.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {msg.loomResults.map((r) => (
                          <span key={r.node.id} className="text-xs px-2 py-1 rounded-full"
                            style={{ background: `${GV_TEAL}0.08)`, border: `1px solid ${GV_TEAL}0.2)`, color: `${GV_TEAL}0.7)`, fontFamily: "var(--gv-font-mono)", fontSize: "10px" }}>
                            {r.node.title}
                          </span>
                        ))}
                      </div>
                    )}
                    {(msg.symbioCoder || msg.vibeCoder) && (
                      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                        {msg.symbioCoder && (
                          <>
                            <span
                              data-testid="billy-symbio-chip"
                              title={`Intent: ${msg.symbioCoder.intent.primary} (${Math.round(msg.symbioCoder.intent.confidence * 100)}% confidence)\nSignals: ${msg.symbioCoder.intent.signals.join(", ") || "none"}`}
                              style={{ background: `${GV_TEAL}0.06)`, border: `1px solid ${GV_TEAL}0.15)`, color: `${GV_TEAL}0.55)`, fontFamily: "var(--gv-font-mono)", fontSize: "9px", padding: "2px 7px", borderRadius: "99px", cursor: "default" }}
                            >
                              {msg.symbioCoder.intent.primary}
                            </span>
                            <span
                              title={`Emotion: ${msg.symbioCoder.emotion.tone} (intensity ${Math.round(msg.symbioCoder.emotion.intensity * 100)}%)\nSupport mode: ${msg.symbioCoder.emotion.supportMode}`}
                              style={{ background: `${GV_TEAL}0.06)`, border: `1px solid ${GV_TEAL}0.15)`, color: `${GV_TEAL}0.55)`, fontFamily: "var(--gv-font-mono)", fontSize: "9px", padding: "2px 7px", borderRadius: "99px", cursor: "default" }}
                            >
                              {msg.symbioCoder.emotion.tone}
                            </span>
                            <span
                              title={`Flow: ${msg.symbioCoder.flow.state}\nMomentum: ${Math.round(msg.symbioCoder.flow.momentum * 100)}%\nRoute: ${msg.symbioCoder.routing}`}
                              style={{ background: `${GV_TEAL}0.06)`, border: `1px solid ${GV_TEAL}0.15)`, color: `${GV_TEAL}0.55)`, fontFamily: "var(--gv-font-mono)", fontSize: "9px", padding: "2px 7px", borderRadius: "99px", cursor: "default" }}
                            >
                              {msg.symbioCoder.flow.state}
                            </span>
                          </>
                        )}
                        {msg.vibeCoder && (
                          <span
                            title={`Voice preservation: ${msg.vibeCoder.score}/100\nAlignment: ${msg.vibeCoder.alignment}\nConcept preservation: ${msg.vibeCoder.conceptPreservation}%\nMetaphor bonus: +${msg.vibeCoder.metaphorBonus}`}
                            style={{
                              background: msg.vibeCoder.alignment === "resonant" || msg.vibeCoder.alignment === "aligned"
                                ? `rgba(0,212,255,0.08)` : `rgba(255,160,80,0.08)`,
                              border: `1px solid ${msg.vibeCoder.alignment === "resonant" || msg.vibeCoder.alignment === "aligned" ? "rgba(0,212,255,0.2)" : "rgba(255,160,80,0.2)"}`,
                              color: msg.vibeCoder.alignment === "resonant" || msg.vibeCoder.alignment === "aligned"
                                ? `rgba(0,212,255,0.6)` : `rgba(255,160,80,0.6)`,
                              fontFamily: "var(--gv-font-mono)", fontSize: "9px", padding: "2px 7px", borderRadius: "99px", cursor: "default"
                            }}
                          >
                            vibe {msg.vibeCoder.score}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-sm"
                    style={{ background: "rgba(224,64,251,0.1)", border: "1px solid rgba(224,64,251,0.2)", color: GV_TEXT, fontFamily: "'DM Sans', sans-serif" }}>
                    {msg.content}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-1">
                <Suspense fallback={<BillyAvatarFallback size={24} />}>
                  <BillyBabylon size={24} mood="processing" />
                </Suspense>
              </div>
              <ThinkingAnimation diName="Billy" messages={BILLY_THINKING_MESSAGES} interval={3600} />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: `1px solid ${GV_TEAL}0.1)` }}>
        <div className="text-xs mb-2 italic" style={{ color: "rgba(232,240,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>
          {TABS.find((t) => t.id === mode)?.desc}
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={mode === "synthesize" ? "Ask Billy anything..." : mode === "loom" ? "Search the Knowledge Loom..." : "Describe what you want to build..."}
            rows={2}
            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
            style={{ background: `${GV_TEAL}0.06)`, border: `1px solid ${GV_TEAL}0.18)`, color: GV_TEXT, fontFamily: "'DM Sans', sans-serif", lineHeight: "1.5" }}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-1.5">
            <button onClick={toggleVoice} className="p-2 rounded-lg transition-all"
              style={{
                background: isListening ? "rgba(239,68,68,0.15)" : `${GV_TEAL}0.08)`,
                border: isListening ? "1px solid rgba(239,68,68,0.35)" : `1px solid ${GV_TEAL}0.18)`,
                color: isListening ? "rgba(239,68,68,0.8)" : `${GV_TEAL}0.6)`,
                boxShadow: isListening ? `0 0 ${8 + (audioLevel ?? 0) * 20}px rgba(239,68,68,${0.2 + (audioLevel ?? 0) * 0.4})` : "none",
              }}
              title={isListening ? "Stop listening" : "Voice input"}
              aria-pressed={isListening}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={() => {
                if (!voiceReplyAvailable) {
                  return;
                }
                setVoiceEnabled((prev) => {
                  const next = !prev;
                  if (!next) {
                    stopVoice();
                  }
                  return next;
                });
              }}
              className="p-2 rounded-lg transition-all"
              disabled={!voiceReplyAvailable}
              style={{
                background: !voiceReplyAvailable ? "transparent" : voiceEnabled ? `${GV_TEAL}0.12)` : "transparent",
                border: !voiceReplyAvailable ? `1px solid ${GV_TEAL}0.08)` : voiceEnabled ? `1px solid ${GV_TEAL}0.28)` : `1px solid ${GV_TEAL}0.12)`,
                color: !voiceReplyAvailable ? `${GV_TEAL}0.16)` : voiceEnabled ? `${GV_TEAL}0.85)` : `${GV_TEAL}0.3)`,
                cursor: !voiceReplyAvailable ? "not-allowed" : "pointer",
              }}
              title={!voiceReplyAvailable ? "Billy voice reply is offline" : voiceEnabled ? "Mute Billy voice" : "Enable Billy voice"}
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="p-2 rounded-lg transition-all"
              style={{
                background: isLoading || !input.trim() ? `${GV_TEAL}0.04)` : `${GV_TEAL}0.18)`,
                border: isLoading || !input.trim() ? `1px solid ${GV_TEAL}0.08)` : `1px solid ${GV_TEAL}0.35)`,
                color: isLoading || !input.trim() ? `${GV_TEAL}0.25)` : `${GV_TEAL}0.85)`,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
        {(errorMessage || voiceError) && (
          <p className="text-xs mt-2" style={{ color: errorMessage ? "rgba(255,120,120,0.72)" : "rgba(0,212,255,0.55)", fontFamily: "'DM Sans', sans-serif", lineHeight: "1.5" }}>
            {errorMessage ?? voiceError}
          </p>
        )}
        <p className="text-center text-xs mt-2" style={{ color: "rgba(232,240,255,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
          Billy · GestaltView Digital Intelligence · Voice {!voiceReplyAvailable ? "offline" : voiceEnabled ? `ready (${resolvedVoiceProvider})` : "muted"} · Enter to send
        </p>
      </div>
    </motion.div>
  );
}

// ─── Billy Chip (inline per-section) ─────────────────────────────────────────

export function BillyChip({ prompt, mode = "synthesize", label }: { prompt: string; mode?: SynthesisMode; label?: string; }) {
  const { openPanel } = useBilly();
  return (
    <motion.button
      onClick={() => openPanel(prompt, mode)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
      style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)", color: "rgba(0,212,255,0.7)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}
      whileHover={{ background: "rgba(0,212,255,0.12)", borderColor: "rgba(0,212,255,0.35)", color: "rgba(0,212,255,0.9)", scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <Sparkles size={11} />
      {label || "Ask Billy"}
    </motion.button>
  );
}

// ─── Section Observer Hook ────────────────────────────────────────────────────
// Use this for platform scroll sections — auto-detects when element enters viewport.

export function useSectionObserver(sectionId: string) {
  const { setCurrentSection } = useBilly();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCurrentSection(sectionId); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionId, setCurrentSection]);
  return ref;
}

// ─── Billy Section Hook ───────────────────────────────────────────────────────
// Use this in demo / exhibit pages to immediately set Billy's active section
// context on mount (and restore to "hero" on unmount).
//
// Usage in any demo page:
//   import { useBillySection } from "../components/Billy";
//   // inside component:
//   useBillySection("adhd-exhibit");   // or "recovery-exhibit", "memory-care-exhibit", etc.
//
// Valid sectionIds come from SECTION_CONTEXTS in BillyEngine.ts:
//   "hero" | "what-this-is" | "the-evidence" | "what-systems-said" | "what-was-built"
//   "what-you-can-build" | "theories-map" | "services-consulting" | "the-human" | "contact"
//   "adhd-exhibit" | "recovery-exhibit" | "memory-care-exhibit"

export function useBillySection(sectionId: string) {
  const { setCurrentSection } = useBilly();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentSection(sectionId);
    return () => setCurrentSection("hero");
  }, [sectionId, setCurrentSection]);

  return ref;
}
