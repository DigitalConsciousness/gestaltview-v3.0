 /*
 * HeroSection — GestaltView Portfolio
 * GVF-02: Replaced 'serve' language with partnership framing.
 *         Fixed scroll target so page opens at hero, not Theories.
 */
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";

const HeroCanvas = lazy(() => import("./HeroCanvas"));

const GV_TITLE_GRADIENT =
  "linear-gradient(90deg, #00C896 0%, #00D4FF 28%, #1A6FFF 54%, #7C3AED 78%, #FF00C8 100%)";

function HeroCanvasFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(0,200,150,0.10) 0%, rgba(124,58,237,0.07) 40%, transparent 70%)",
        zIndex: 0,
      }}
    />
  );
}

// GVF-02: Replaced 'serve' framing with partnership/collaboration language throughout
const TYPING_TEXTS = [
  "Full-stack AI systems built from scratch, on a phone.",
  "PLK v5.0 — the first consciousness-serving personalization engine.",
  "Multi-provider AI routing with ethical guardrails built in.",
  "22+ years of systems thinking meets frontier AI architecture.",
  "Consulting, coding, UI/UX, and AI ethics — one founder.",
  "SymbioCoder, Resume Rockstar, Billy, Musical DNA — all live.",
  "Neurodivergent cognition as a design principle, not an afterthought.",
  "FastAPI · Next.js · TypeScript · Multi-LLM · Blockchain-timestamped.",
  "You deserve tools that actually work with how you think.",
  "Manual mode still breaks the sound barrier. Imagine native.",
];

const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE_DURATION = 2000;
const MAX_EMBERS = 22;

const EMBER_COLORS = [
  "rgba(0, 200, 150, 0.45)",
  "rgba(0, 212, 255, 0.40)",
  "rgba(26, 111, 255, 0.35)",
  "rgba(124, 58, 237, 0.30)",
  "rgba(255, 0, 200, 0.20)",
  "rgba(0, 212, 255, 0.35)",
];

const ICON_CONFIGS = [
  {
    Icon: Brain,
    gradient: "from-emerald-500/30 to-purple-500/20",
    border: "border-emerald-400/50",
    shadow: "shadow-emerald-400/30",
    animate: { rotate: 360, scale: [1, 1.1, 1] },
    transition: {
      rotate: { duration: 8, repeat: Infinity, ease: "linear" as const },
      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
    },
  },
  {
    Icon: Sparkles,
    gradient: "from-yellow-400/30 to-emerald-500/20",
    border: "border-yellow-400/60",
    shadow: "shadow-yellow-400/40",
    animate: { scale: [1, 1.3, 1], rotate: [0, 180, 360] },
    transition: {
      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
      rotate: { duration: 4, repeat: Infinity, ease: "linear" as const },
    },
  },
  {
    Icon: Zap,
    gradient: "from-emerald-500/20 to-teal-500/30",
    border: "border-emerald-400/50",
    shadow: "shadow-teal-400/30",
    animate: { rotate: -360, y: [0, -10, 0] },
    transition: {
      rotate: { duration: 6, repeat: Infinity, ease: "linear" as const },
      y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
    },
  },
];

interface Ember {
  id: number;
  size: number;
  duration: number;
  delay: number;
  initialX: number;
  drift: number;
  color: string;
  opacity: number;
}

function useTypingAnimation() {
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const fullText = TYPING_TEXTS[loopNum % TYPING_TEXTS.length];
    const timer = setTimeout(
      () => {
        if (isDeleting) {
          setCurrentText(fullText.substring(0, currentText.length - 1));
        } else {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }
        if (!isDeleting && currentText === fullText) {
          setTimeout(() => setIsDeleting(true), PAUSE_DURATION);
        } else if (isDeleting && currentText === "") {
          setIsDeleting(false);
          setLoopNum((n) => n + 1);
        }
      },
      isDeleting ? DELETING_SPEED : TYPING_SPEED
    );
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, loopNum]);

  useEffect(() => {
    const t = setInterval(() => setShowCursor((p) => !p), 530);
    return () => clearInterval(t);
  }, []);

  return { currentText, showCursor };
}

function useEmbers() {
  const [embers, setEmbers] = useState<Ember[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const spawnEmber = () => {
      setEmbers((prev) => {
        if (prev.length >= MAX_EMBERS) return prev;
        const id = counterRef.current++;
        return [
          ...prev,
          {
            id,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 12 + 10,
            delay: Math.random() * 3,
            initialX: Math.random() * 100,
            drift: (Math.random() - 0.5) * 30,
            color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
            opacity: Math.random() * 0.4 + 0.1,
          },
        ];
      });
    };

    const burst = Array.from({ length: 8 }, (_, i) => setTimeout(spawnEmber, i * 200));
    const interval = setInterval(spawnEmber, 800);
    return () => {
      burst.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  const removeEmber = (id: number) => setEmbers((prev) => prev.filter((e) => e.id !== id));

  return { embers, removeEmber };
}

function EmberParticle({ ember, onComplete }: { ember: Ember; onComplete: () => void }) {
  const driftHalf = ember.drift * 0.5;
  return (
    <motion.div
      style={{
        position: "absolute",
        bottom: "-20px",
        left: `${ember.initialX}vw`,
        width: `${ember.size}px`,
        height: `${ember.size}px`,
        backgroundColor: ember.color,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 5,
        filter: "blur(0.5px)",
        willChange: "transform, opacity",
      }}
      initial={{ opacity: ember.opacity, scale: 1, x: 0, y: 0 }}
      animate={{
        opacity: [ember.opacity, ember.opacity * 0.7, 0],
        scale: [1, 0.8, 0.3],
        x: [`0vw`, `${driftHalf}vw`, `${ember.drift}vw`],
        y: ["0vh", "-60vh", "-120vh"],
      }}
      transition={{ duration: ember.duration, delay: ember.delay, ease: "easeOut" }}
      onAnimationComplete={onComplete}
    />
  );
}

function TypingBox({ currentText, showCursor }: { currentText: string; showCursor: boolean }) {
  return (
    <div
      className="text-xl md:text-2xl font-light min-h-[4rem] flex items-center justify-center rounded-2xl px-8 py-5 mx-auto max-w-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(0,10,20,0.6) 0%, rgba(15,8,40,0.5) 100%)",
        border: "1px solid rgba(0,212,255,0.25)",
        boxShadow: "0 0 28px rgba(0,212,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span className="font-mono" style={{ color: "var(--cream)", textShadow: "1px 1px 3px rgba(0,0,0,0.7)" }}>
        {currentText}
      </span>
      <motion.span
        className="inline-block w-0.5 h-7 ml-1.5 rounded-full"
        style={{
          background: GV_TITLE_GRADIENT,
          opacity: showCursor ? 1 : 0,
          filter: "drop-shadow(0 0 6px rgba(0,212,255,0.7))",
        }}
        animate={{ scale: showCursor ? 1 : 0.8 }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}

function CTAButton({
  href,
  sectionId,
  borderColor,
  glowColor,
  textColor,
  background,
  children,
}: {
  href: string;
  sectionId: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  background: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isExternal) return;
    e.preventDefault();
    document.querySelector(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <a
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      href={href}
      onClick={handleClick}
      className="px-10 py-4 rounded-full text-sm tracking-wide transition-all duration-300"
      style={{
        background,
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.08em",
        boxShadow: `0 0 20px ${glowColor}`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = borderColor.replace("0.45", "0.70").replace("0.50", "0.75");
        el.style.boxShadow = `0 0 30px ${glowColor.replace("0.15", "0.30")}`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = borderColor;
        el.style.boxShadow = `0 0 20px ${glowColor}`;
      }}
    >
      {children}
    </a>
  );
}

export function HeroSection() {
  const { currentText, showCursor } = useTypingAnimation();
  const { embers, removeEmber } = useEmbers();

  // GVF-02: Ensure page always opens at hero top — scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" } as ScrollToOptions);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden"
      style={{ background: "var(--midnight-blue)" }}
    >
      <Suspense fallback={<HeroCanvasFallback />}>
        <HeroCanvas />
      </Suspense>

      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,10,20,0.72) 0%, rgba(15,8,40,0.65) 50%, rgba(0,10,20,0.72) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top right, rgba(0,200,150,0.08) 0%, rgba(124,58,237,0.12) 50%, rgba(0,200,150,0.08) 100%)",
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "25%",
            left: "25%",
            width: "24rem",
            height: "24rem",
            background: "radial-gradient(circle, rgba(0,200,150,0.18) 0%, rgba(0,200,150,0.06) 40%, transparent 70%)",
            filter: "blur(48px)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: "33%",
            right: "25%",
            width: "32rem",
            height: "32rem",
            background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.07) 40%, transparent 70%)",
            filter: "blur(48px)",
          }}
          animate={{ scale: [1.2, 0.8, 1.2], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "48rem",
            height: "48rem",
            background: "radial-gradient(circle, rgba(0,212,255,0.10) 0%, rgba(0,200,150,0.04) 40%, transparent 70%)",
            filter: "blur(64px)",
          }}
          animate={{ scale: [0.9, 1.4, 0.9], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: "10%",
            right: "10%",
            width: "18rem",
            height: "18rem",
            background: "radial-gradient(circle, rgba(255,0,200,0.06) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C896" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#1A6FFF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="energyGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FF00C8" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,400 Q400,200 800,300 T1600,250"
              stroke="url(#energyGradient)"
              strokeWidth="2.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.path
              d="M0,600 Q600,400 1200,500 T2400,450"
              stroke="url(#energyGradient2)"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
            />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {embers.map((ember) => (
          <EmberParticle key={ember.id} ember={ember} onComplete={() => removeEmber(ember.id)} />
        ))}
      </AnimatePresence>

      <div className="relative z-20 max-w-5xl mx-auto w-full">
        <motion.p
          className="gv-eyebrow mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Keith Soyka · GestaltView · New York City
        </motion.p>

        {/* GVF-02: Reframed from 'serve' to partnership/collaboration language */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-4 text-sm italic"
          style={{
            color: "rgba(232,245,233,0.55)",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.05rem",
            letterSpacing: "0.02em",
          }}
        >
          I build AI that works with the human using it — because I've lived what happens when technology doesn't.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-8 flex justify-center"
        >
          <span
            style={{
              display: "inline-block",
              padding: "6px 18px",
              borderRadius: "999px",
              background: "rgba(0,212,255,0.07)",
              border: "1px solid rgba(0,212,255,0.20)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem",
              fontWeight: 400,
              letterSpacing: "0.04em",
              color: "rgba(0,212,255,0.80)",
            }}
          >
            Built for anyone who wants to hold on to all the little pieces that make them who they are — including founders, therapists, and neurodivergent professionals.
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
            <span
              style={{
                background: GV_TITLE_GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter:
                  "drop-shadow(0 0 24px rgba(0,180,140,0.3)) drop-shadow(0 0 40px rgba(124,58,237,0.15))",
              }}
            >
              AI that works with
              <br />
              the human using it.
            </span>
            <br />
            <span
              style={{
                fontFamily: "'Cabin Sketch', cursive",
                fontWeight: 700,
                color: "var(--cream)",
                textShadow: "0 0 30px rgba(232,245,233,0.4)",
              }}
            >
              GestaltView
              <br />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-4"
            style={{
              color: "rgba(232,245,233,0.85)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {/* GVF-02: Partnership framing — AI and human as co-architects, not provider/recipient */}
            Founder, full-stack developer, and AI systems architect. I build
            consciousness-serving platforms — production AI tools, ethical frameworks,
            and bespoke consulting for founders and teams who want a genuine AI partner,
            not a chatbot wrapper.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mb-14"
        >
          <TypingBox currentText={currentText} showCursor={showCursor} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.08, duration: 0.7 }}
          className="mb-12"
        >
          <div
            className="mx-auto max-w-4xl rounded-[28px] px-6 py-6 md:px-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,200,150,0.08) 38%, rgba(124,58,237,0.12) 100%)",
              border: "1px solid rgba(0,212,255,0.22)",
              boxShadow:
                "0 0 42px rgba(0,212,255,0.10), inset 0 1px 0 rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="text-left">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.45rem 0.8rem",
                      borderRadius: "999px",
                      background: "rgba(0,212,255,0.10)",
                      border: "1px solid rgba(0,212,255,0.18)",
                      color: "rgba(0,212,255,0.88)",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span
                      style={{
                        width: "0.45rem",
                        height: "0.45rem",
                        borderRadius: "999px",
                        background: "#7FFFE8",
                        boxShadow: "0 0 10px rgba(127,255,232,0.75)",
                      }}
                    />
                    New Product
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.46)",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Agent Trainer
                  </span>
                </div>

                <h2
                  className="mb-2 text-2xl md:text-3xl"
                  style={{
                    color: "var(--cream)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    textShadow: "0 0 24px rgba(0,212,255,0.08)",
                  }}
                >
                  Train an AI on your world, not ours.
                </h2>
                <p
                  className="max-w-2xl text-sm md:text-base"
                  style={{
                    color: "rgba(232,245,233,0.76)",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.7,
                  }}
                >
                  The new GestaltView Agent Trainer is a white-label scaffold and
                  commercial rollout path for buyers who want to shape an assistant
                  around their own corpus, vocabulary, product context, and operating
                  reality.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end">
                <Link href="/agent-trainer/pricing">
                  <a
                    className="rounded-full px-6 py-3 text-sm transition-all duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,212,255,0.96) 0%, rgba(127,255,232,0.88) 100%)",
                      color: "#04141D",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      boxShadow: "0 0 28px rgba(0,212,255,0.18)",
                    }}
                  >
                    View Pricing
                  </a>
                </Link>
                <Link href="/agent-trainer/package-builder">
                  <a
                    className="rounded-full px-6 py-3 text-sm transition-all duration-300"
                    style={{
                      background: "rgba(4,20,29,0.48)",
                      border: "1px solid rgba(0,212,255,0.22)",
                      color: "rgba(0,212,255,0.88)",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Open Hosted Builder
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex justify-center space-x-10 mb-14"
        >
          {ICON_CONFIGS.map(({ Icon, gradient, border, shadow, animate, transition }, i) => (
            <motion.div
              key={i}
              animate={animate}
              transition={transition}
              className={`p-6 bg-gradient-to-br ${gradient} rounded-full border ${border} shadow-2xl ${shadow}`}
            >
              <Icon
                className="w-10 h-10"
                style={{ color: "var(--cream)", filter: "drop-shadow(0 0 10px rgba(0,212,255,0.5))" }}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <CTAButton
            href="#what-was-built"
            sectionId="#what-was-built"
            borderColor="rgba(0,212,255,0.45)"
            glowColor="rgba(0,212,255,0.15)"
            textColor="var(--cream)"
            background="linear-gradient(135deg, rgba(0,200,150,0.18) 0%, rgba(124,58,237,0.13) 100%)"
          >
            See What Was Built
          </CTAButton>
          <CTAButton
            href="https://calendly.com/keithsoyka/30min"
            sectionId="#contact"
            borderColor="rgba(255,214,10,0.50)"
            glowColor="rgba(255,214,10,0.15)"
            textColor="var(--gold)"
            background="linear-gradient(135deg, rgba(0,10,20,0.60) 0%, rgba(15,8,40,0.50) 100%)"
          >
            Work Together
          </CTAButton>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-widest uppercase"
        style={{ color: "rgba(0,212,255,0.55)" }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        ↓
      </motion.div>
    </section>
  );
}
