/**
 * OpeningCeremony — GestaltView
 * Cyberpunk-neural entry experience.
 * Palette: deep black (#050810), teal (#00D4FF), midnight electric blue (#1A6FFF),
 *          electric purple (#7C3AED), neon fuchsia (#FF00C8) as accent flash.
 * Title gradient: emerald → teal → midnight blue → electric purple → fuchsia pulse.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Shared gradient — used on title here and matched exactly in HeroSection
export const GV_TITLE_GRADIENT =
  "linear-gradient(90deg, #00C896 0%, #00D4FF 28%, #1A6FFF 54%, #7C3AED 78%, #FF00C8 100%)";

// ── Circuit node particle system (pure canvas) ───────────────────────────
function CircuitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODE_COUNT = 40;
    // Restrained palette matching the new gradient: emerald, teal, blue-purple, fuchsia
    const PALETTE =["#00C896", "#00D4FF", "#1A6FFF", "#7C3AED", "#FF00C8"];

    interface Node {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      color: string;
      pulse: number;
    }

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2.2 + 0.8,
      // weight: mostly teal/emerald, sparse fuchsia
      color: PALETTE[Math.floor(Math.random() * (Math.random() > 0.85 ? 5 : 3))],
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.14;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.035;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        const glow = Math.sin(n.pulse) * 0.35 + 0.65;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  },[]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function OpeningCeremony({ onComplete }: { onComplete: () => void }) {
  const[showButton, setShowButton] = useState(false);
  const [exiting, setExiting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 900);
    return () => clearTimeout(t);
  },[]);

  const handleEnter = useCallback(() => {
    setExiting(true);
    const audio = new Audio("/audio/welcome-to-gestaltview.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setTimeout(() => {
      sessionStorage.setItem("gv-home-reveal-seen", "true");
      onComplete();
    }, 2500);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#050810" }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
    >
      <CircuitCanvas />

      {/* Radial glows — teal + purple, no magenta-heavy wash */}
      <motion.div
        className="absolute rounded-full blur-[150px] pointer-events-none"
        style={{
          width: 700, height: 700,
          background: "rgba(0,200,150,0.055)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity:[0.35, 0.6, 0.35] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[120px] pointer-events-none"
        style={{
          width: 480, height: 480,
          background: "rgba(124,58,237,0.055)",
          top: "58%", left: "54%", transform: "translate(-50%,-50%)",
        }}
        animate={{ scale:[1.1, 1, 1.1], opacity:[0.25, 0.45, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />
      {/* Subtle fuchsia accent glow — just a hint, bottom-right */}
      <motion.div
        className="absolute rounded-full blur-[100px] pointer-events-none"
        style={{
          width: 320, height: 320,
          background: "rgba(255,0,200,0.04)",
          bottom: "15%", right: "15%",
        }}
        animate={{ opacity: [0.15, 0.45, 0.15], scale:[0.9, 1.15, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Centre content */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          {/* Eyebrow */}
          <p
            className="font-mono text-sm tracking-[0.35em] uppercase mb-4"
            style={{ color: "#00D4FF", textShadow: "0 0 18px rgba(0,212,255,0.45)" }}
          >
            Welcome To
          </p>

          {/* GestaltView — emerald → teal → midnight blue → electric purple → fuchsia */}
          <h1
            className="tracking-wider mb-3"
            style={{
              fontFamily: "'Cabin Sketch', cursive",
              fontWeight: 700,
              fontSize: "clamp(2.4rem, 8vw, 5.5rem)",
              background: GV_TITLE_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 22px rgba(0,180,140,0.35)) drop-shadow(0 0 40px rgba(124,58,237,0.2))",
              lineHeight: 1.1,
            }}
          >
            GestaltView
          </h1>

          {/* Tagline */}
          <p
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: "rgba(124,58,237,0.85)", textShadow: "0 0 12px rgba(124,58,237,0.4)" }}
          >
            Your Infrastructure for Being Seen
          </p>

          {/* Neural divider */}
          <motion.div
            className="mx-auto mt-8 mb-8 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, #00C896, #00D4FF, #7C3AED, #FF00C8, transparent)",
              maxWidth: 340,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.7 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
        </motion.div>

        {/* Enter System button */}
        <AnimatePresence>
          {showButton && !exiting && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              onClick={handleEnter}
              className="px-10 py-3.5 rounded-full font-mono text-xs tracking-[0.3em] uppercase transition-all duration-500 cursor-pointer"
              style={{
                background: "rgba(0,180,150,0.07)",
                border: "1px solid rgba(0,212,255,0.45)",
                color: "#00D4FF",
                textShadow: "0 0 10px rgba(0,212,255,0.55)",
                boxShadow: "0 0 22px rgba(0,212,255,0.1), inset 0 0 10px rgba(0,212,255,0.04)",
              }}
              whileHover={{
                boxShadow: "0 0 38px rgba(0,212,255,0.28), inset 0 0 18px rgba(0,212,255,0.07)",
                background: "rgba(0,180,150,0.13)",
                scale: 1.04,
              }}
              whileTap={{ scale: 0.97 }}
            >
              ENTER SYSTEM
            </motion.button>
          )}
        </AnimatePresence>

        {exiting && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono italic text-lg"
            style={{ color: "rgba(0,212,255,0.5)" }}
          >
            Initializing...
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
