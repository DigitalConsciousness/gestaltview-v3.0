import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useBilly } from "@/components/Billy";
import type { SynthesisMode } from "@/lib/BillyEngine";
import {
  BILLY_GREETING_LINES,
  BILLY_GREETER_PATHWAYS,
} from "@/lib/billy-runtime-guide";
import { useBillyVoice } from "@/hooks/useBillyVoice";
import { useBillyVoicePreference } from "@/hooks/useBillyVoicePreference";

interface BillyGreeterProps {
  /** Called when user dismisses — collapses to corner widget */
  onDismiss: () => void;
}

interface BillyGreeterPathway {
  id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  actionLabel: string;
  prompt: string;
  mode: SynthesisMode;
  targetId?: string;
  route?: string;
}

const CHAR_SPEED_MS = 7;
const LINE_PAUSE_MS = 180;
const INITIAL_DELAY_MS = 160;
const LS_KEY = "gv_billy_greeter_dismissed";
const PENDING_BILLY_LIVE_PROMPT_KEY = "gv_billy_live_pending_prompt";

function useStreamedLines(lines: readonly string[], active: boolean, resetKey: number) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayedLines([]);
    setCurrentLine("");
    setLineIndex(0);
    setCharIndex(0);
    setDone(false);
  }, [resetKey]);

  useEffect(() => {
    if (!active || done) {
      return;
    }

    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    if (lineIndex === 0 && charIndex === 0 && displayedLines.length === 0) {
      timeoutRef.current = setTimeout(() => {
        setCharIndex(1);
      }, INITIAL_DELAY_MS);
      return clearTimer;
    }

    const target = lines[lineIndex] ?? "";

    if (charIndex <= target.length) {
      setCurrentLine(target.slice(0, charIndex));
      timeoutRef.current = setTimeout(() => {
        setCharIndex((currentCharacter) => currentCharacter + 1);
      }, CHAR_SPEED_MS);
    } else {
      timeoutRef.current = setTimeout(() => {
        setDisplayedLines((previousLines) => [...previousLines, target]);
        setCurrentLine("");

        if (lineIndex + 1 < lines.length) {
          setLineIndex((currentLineIndex) => currentLineIndex + 1);
          setCharIndex(0);
        } else {
          setDone(true);
        }
      }, LINE_PAUSE_MS);
    }

    return clearTimer;
  }, [active, charIndex, displayedLines.length, done, lineIndex, lines]);

  return { displayedLines, currentLine, done };
}

function Cursor({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <motion.span
      className="ml-1 inline-block h-4 w-0.5 align-middle"
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
      style={{ background: "#00D4FF", boxShadow: "0 0 12px rgba(0, 212, 255, 0.75)" }}
    />
  );
}

function BillyAvatar({ muted }: { muted: boolean }) {
  return (
    <div className="relative h-14 w-14 flex-shrink-0">
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ scale: [1, 1.16, 1], opacity: [0.42, 0.12, 0.42] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ border: "2px solid rgba(0, 212, 255, 0.35)", boxShadow: "0 0 30px rgba(0, 212, 255, 0.18)" }}
      />
      <motion.div
        className="absolute inset-1 rounded-full"
        animate={{ scale: [1, 1.08, 1], opacity: [0.68, 0.22, 0.68] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        style={{ border: "1px solid rgba(0, 212, 255, 0.6)" }}
      />
      <div
        className="absolute inset-2 flex items-center justify-center rounded-full backdrop-blur-sm"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(0, 212, 255, 0.28), rgba(124, 58, 237, 0.2) 55%, rgba(5, 10, 14, 0.9) 100%)",
          border: "1px solid rgba(0, 212, 255, 0.45)",
        }}
      >
        <motion.span
          className="select-none text-2xl"
          animate={muted ? {} : { rotate: [0, -4, 4, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        >
          🧵
        </motion.span>
      </div>
      {muted && (
        <div
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full"
          style={{ background: "#050A0E", border: "1px solid rgba(255,255,255,0.22)" }}
        >
          <span className="text-[9px]">🔇</span>
        </div>
      )}
    </div>
  );
}

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);

  if (!section) {
    return;
  }

  section.scrollIntoView({ behavior: "smooth", block: "start" });

  const previousTransition = section.style.transition;
  const previousBoxShadow = section.style.boxShadow;
  section.style.transition = "box-shadow 260ms ease";
  section.style.boxShadow = "0 0 0 1px rgba(0, 212, 255, 0.45), 0 0 34px rgba(0, 212, 255, 0.18)";

  window.setTimeout(() => {
    section.style.boxShadow = previousBoxShadow;
    section.style.transition = previousTransition;
  }, 1600);
}

export default function BillyGreeter({ onDismiss }: BillyGreeterProps) {
  const [visible, setVisible] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [showingPathways, setShowingPathways] = useState(false);
  const [pendingPathwayId, setPendingPathwayId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const { openPanel } = useBilly();
  const {
    speak,
    stop: stopVoice,
    isAvailable: isVoiceAvailable,
    error: voiceError,
  } = useBillyVoice();
  const [voiceEnabled, setVoiceEnabled] = useBillyVoicePreference("shared");
  const [, setLocation] = useLocation();
  const hasSpokenGreetingRef = useRef(false);

  const { displayedLines, currentLine, done } = useStreamedLines(BILLY_GREETING_LINES, streaming, resetKey);
  const greetingVoiceText = `${BILLY_GREETING_LINES[0]} ${BILLY_GREETING_LINES[1]} ${BILLY_GREETING_LINES[5]}`;

  useEffect(() => {
    const alreadyDismissed = localStorage.getItem(LS_KEY);

    if (!alreadyDismissed) {
      const timeout = window.setTimeout(() => {
        setVisible(true);
        setStreaming(true);
      }, 800);

      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!visible) {
      hasSpokenGreetingRef.current = false;
      return;
    }

    if (!isVoiceAvailable || !voiceEnabled || hasSpokenGreetingRef.current) {
      return;
    }

    hasSpokenGreetingRef.current = true;
    void speak(greetingVoiceText);
  }, [greetingVoiceText, isVoiceAvailable, speak, visible, voiceEnabled]);

  const closeGreeter = useCallback((afterClose?: () => void) => {
    localStorage.setItem(LS_KEY, "true");
    setVisible(false);
    stopVoice();

    window.setTimeout(() => {
      onDismiss();
      afterClose?.();
    }, 320);
  }, [onDismiss, stopVoice]);

  const handleDismiss = useCallback(() => {
    closeGreeter();
  }, [closeGreeter]);

  const handleShowMe = useCallback(() => {
    setShowingPathways(true);
  }, []);

  const runOnNextFrame = useCallback((task: () => void) => {
    window.requestAnimationFrame(() => {
      task();
    });
  }, []);

  const runOnIdle = useCallback((task: () => void, timeout = 280) => {
    const requestIdle = (window as Window & {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
    }).requestIdleCallback;

    if (requestIdle) {
      requestIdle(() => {
        task();
      }, { timeout });
      return;
    }

    window.setTimeout(task, 24);
  }, []);

  const handlePathwaySelect = useCallback((pathway: BillyGreeterPathway) => {
    const route = pathway.route;
    const targetId = pathway.targetId;

    closeGreeter(() => {
      runOnNextFrame(() => {
        if (route) {
          window.sessionStorage.setItem(
            PENDING_BILLY_LIVE_PROMPT_KEY,
            JSON.stringify({
              prompt: pathway.prompt,
              mode: pathway.mode === "synthesize" ? "synthesis" : "chat",
            })
          );
          setLocation(route);
          return;
        }

        if (targetId) {
          runOnNextFrame(() => {
            scrollToSection(targetId);
            runOnIdle(() => {
              openPanel(pathway.prompt, pathway.mode);
            }, 520);
          });
          return;
        }

        runOnIdle(() => {
          openPanel(pathway.prompt, pathway.mode);
        }, 320);
      });
    });
  }, [closeGreeter, openPanel, runOnIdle, runOnNextFrame, setLocation]);

  const handlePathwayTap = useCallback((pathway: BillyGreeterPathway) => {
    setPendingPathwayId(pathway.id);
    handlePathwaySelect(pathway);
  }, [handlePathwaySelect]);

  useEffect(() => {
    const handler = () => {
      localStorage.removeItem(LS_KEY);
      setShowingPathways(false);
      setPendingPathwayId(null);
      setStreaming(true);
      setVisible(true);
      setResetKey((currentKey) => currentKey + 1);
      hasSpokenGreetingRef.current = false;
    };

    window.addEventListener("gv:billy-greeter-reset", handler);
    return () => window.removeEventListener("gv:billy-greeter-reset", handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="backdrop"
            className="pointer-events-none fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: [
                "radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.08) 0%, rgba(0, 212, 255, 0.02) 26%, transparent 64%)",
                "linear-gradient(180deg, rgba(10, 15, 20, 0.06) 0%, rgba(10, 15, 20, 0.18) 100%)",
              ].join(", "),
            }}
          />

          <motion.div
            key="greeter"
            role="dialog"
            aria-label="Billy — GestaltView platform embodiment"
            aria-live="polite"
            className="fixed bottom-0 left-0 right-0 z-50 mx-0 rounded-t-[1.75rem] p-5 sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.75rem] sm:p-6"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            style={{
              background: "linear-gradient(180deg, rgba(5, 10, 14, 0.98) 0%, rgba(10, 15, 20, 0.96) 100%)",
              border: "1px solid rgba(0, 212, 255, 0.22)",
              boxShadow: "0 28px 120px rgba(0, 0, 0, 0.58), 0 0 40px rgba(0, 212, 255, 0.12)",
              backdropFilter: "blur(22px)",
              overflow: "hidden",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(circle at top, rgba(0, 212, 255, 0.13), transparent 42%)",
                opacity: 0.95,
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
                backgroundSize: "100% 4px",
                opacity: 0.06,
                mixBlendMode: "screen",
              }}
            />

            <div className="relative">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <BillyAvatar muted={!voiceEnabled} />
                  <div>
                    <p
                      className="text-sm font-semibold leading-tight text-white"
                      style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", letterSpacing: "0.08em" }}
                    >
                      Billy
                    </p>
                    <p
                      className="text-[11px] uppercase tracking-[0.28em]"
                      style={{ color: "rgba(0, 212, 255, 0.62)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
                    >
                      Platform embodiment
                    </p>
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVoiceEnabled((currentEnabled) => {
                        const nextEnabled = !currentEnabled;
                        if (!nextEnabled) {
                          stopVoice();
                        }
                        return nextEnabled;
                      });
                    }}
                    aria-label={voiceEnabled ? "Mute Billy" : "Unmute Billy"}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    style={{ color: "rgba(255,255,255,0.68)", background: "rgba(255,255,255,0.04)" }}
                    title={voiceEnabled ? "Mute" : "Unmute"}
                  >
                    <span className="text-sm">{voiceEnabled ? "🔊" : "🔇"}</span>
                  </button>

                  <button
                    onClick={handleDismiss}
                    aria-label="Dismiss Billy greeter"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                    style={{ color: "rgba(255,255,255,0.68)", background: "rgba(255,255,255,0.04)" }}
                    title="Dismiss (you can find Billy in the corner)"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-5 min-h-[7rem] space-y-2 sm:min-h-[7.5rem]">
                {displayedLines.map((line) => (
                  <motion.p
                    key={line}
                    className="text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ color: "rgba(255,255,255,0.9)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
                  >
                    {line}
                  </motion.p>
                ))}

                {currentLine && (
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                    {currentLine}
                    <Cursor visible={!done} />
                  </p>
                )}

                {!streaming && !done && displayedLines.length === 0 && <Cursor visible={true} />}
              </div>

              <AnimatePresence mode="wait">
                {done && !showingPathways && (
                  <motion.div
                    key="intro-cta"
                    className="flex flex-col gap-2 sm:flex-row"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <button
                      onClick={handleShowMe}
                      className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(90deg, rgba(0, 212, 255, 0.95) 0%, rgba(124, 58, 237, 0.92) 100%)",
                        boxShadow: "0 18px 40px rgba(0, 212, 255, 0.2)",
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      }}
                    >
                      Yeah — show me the threads ✦
                    </button>

                    <button
                      onClick={handleDismiss}
                      className="flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 active:scale-[0.98]"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.84)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                      }}
                    >
                      Maybe later
                    </button>
                  </motion.div>
                )}

                {done && showingPathways && (
                  <motion.div
                    key="pathways"
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p
                          className="text-[11px] uppercase"
                          style={{ color: "rgba(0, 212, 255, 0.7)", fontFamily: "ui-monospace, SFMono-Regular, monospace", letterSpacing: "0.28em" }}
                        >
                          Show me
                        </p>
                        <p className="text-sm text-white" style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                          Pick the doorway that matches your curiosity.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowingPathways(false)}
                        className="rounded-full px-3 py-1 text-[11px] uppercase"
                        style={{
                          color: "rgba(255,255,255,0.74)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          fontFamily: "ui-monospace, SFMono-Regular, monospace",
                          letterSpacing: "0.22em",
                        }}
                      >
                        Back
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {BILLY_GREETER_PATHWAYS.map((pathway) => (
                        <button
                          key={pathway.id}
                          onClick={() => handlePathwayTap(pathway)}
                          disabled={pendingPathwayId !== null}
                          className="rounded-2xl p-4 text-left transition-transform duration-150 hover:-translate-y-0.5"
                          style={{
                            background: "linear-gradient(180deg, rgba(5, 10, 14, 0.88) 0%, rgba(10, 15, 20, 0.96) 100%)",
                            border: "1px solid rgba(0, 212, 255, 0.16)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 12px 30px rgba(0,0,0,0.22)",
                            opacity: pendingPathwayId && pendingPathwayId !== pathway.id ? 0.6 : 1,
                          }}
                        >
                          <p
                            className="mb-2 text-[11px] uppercase"
                            style={{ color: "rgba(0, 212, 255, 0.72)", fontFamily: "ui-monospace, SFMono-Regular, monospace", letterSpacing: "0.24em" }}
                          >
                            {pathway.eyebrow}
                          </p>
                          <p className="mb-2 text-sm font-semibold text-white" style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                            {pathway.title}
                          </p>
                          <p className="mb-4 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.72)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}>
                            {pathway.subtitle}
                          </p>
                          <span
                            className="text-[11px] uppercase"
                            style={{ color: "rgba(255,255,255,0.84)", fontFamily: "ui-monospace, SFMono-Regular, monospace", letterSpacing: "0.22em" }}
                          >
                            {pendingPathwayId === pathway.id ? "Opening…" : `${pathway.actionLabel} →`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {voiceError ? (
                <p
                  className="mt-3 text-[11px] uppercase tracking-[0.2em]"
                  style={{ color: "rgba(255,180,0,0.78)", fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
                >
                  {voiceError}
                </p>
              ) : null}

              <p
                className="mt-4 text-center text-[10px]"
                style={{ color: "rgba(255,255,255,0.34)", fontFamily: "ui-monospace, SFMono-Regular, monospace", letterSpacing: "0.1em" }}
              >
                GestaltView · Consciousness-serving AI · Billy stays nearby if you want him later
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
