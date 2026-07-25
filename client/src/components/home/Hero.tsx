import { useEffect, useRef, useState } from "react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wordmarkVisible, setWordmarkVisible] = useState(false);
  const [taglineVisible, setTaglineVisible] = useState(false);
  const [fogComplete, setFogComplete] = useState(false);

  // Inject fonts once
  useEffect(() => {
    const fonts = [
      {
        id: "cabin-sketch-font",
        href: "https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap",
      },
      {
        id: "dancing-script-font",
        href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600&display=swap",
      },
      {
        id: "orbitron-font",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap",
      },
    ];
    fonts.forEach(({ id, href }) => {
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id   = id;
        link.rel  = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);

  // Reveal sequence: wordmark → tagline → fog settles
  useEffect(() => {
    const t1 = setTimeout(() => setWordmarkVisible(true), 1200);
    const t2 = setTimeout(() => setTaglineVisible(true),  2000);
    const t3 = setTimeout(() => setFogComplete(true),     3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Canvas: rolling fog + aurora + lightning
  useEffect(() => {
    if (!canvasRef.current) return;
    // Assign to non-null typed consts so TS narrowing holds inside all inner functions
    const canvas: HTMLCanvasElement = canvasRef.current;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let raf: number;

    const bolts: {
      branches: { x1: number; y1: number; x2: number; y2: number }[];
      opacity: number;
      age: number;
    }[] = [];

    function spawnBolt() {
      if (Math.random() > 0.035) return;
      const x = Math.random() * canvas.width;
      let bx = x;
      let by = Math.random() * canvas.height * 0.52;
      const branches: { x1: number; y1: number; x2: number; y2: number }[] = [];
      for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
        const nx = bx + (Math.random() - 0.5) * 55;
        const ny = by + Math.random() * 28 + 10;
        branches.push({ x1: bx, y1: by, x2: nx, y2: ny });
        bx = nx;
        by = ny;
      }
      bolts.push({ branches, opacity: 1, age: 0 });
    }

    function tick() {
      frame++;
      const progress = Math.min(frame / 160, 1);
      context.clearRect(0, 0, canvas.width, canvas.height);

      // ── Fog ──
      const fogH = canvas.height * Math.min(progress * 1.4, 1);
      const fogGrad = context.createLinearGradient(0, 0, 0, fogH);
      fogGrad.addColorStop(0,    "rgba(8, 10, 22, 1.0)");
      fogGrad.addColorStop(0.35, "rgba(12, 20, 50, 0.92)");
      fogGrad.addColorStop(0.65, "rgba(6, 28, 48, 0.70)");
      fogGrad.addColorStop(1,    "rgba(8, 13, 26, 0.0)");
      context.fillStyle = fogGrad;
      context.fillRect(0, 0, canvas.width, fogH);

      // ── Aurora band ──
      const t = frame * 0.012;
      const auroraGrad = context.createLinearGradient(0, 0, canvas.width, 0);
      auroraGrad.addColorStop(0,    "rgba(0,212,255, 0.0)");
      auroraGrad.addColorStop(0.15, `rgba(0,212,255, ${0.28 + Math.sin(t) * 0.10})`);
      auroraGrad.addColorStop(0.38, `rgba(0,180,255, ${0.18 + Math.cos(t * 0.8) * 0.08})`);
      auroraGrad.addColorStop(0.52, `rgba(153,69,255, ${0.32 + Math.sin(t * 1.1) * 0.12})`);
      auroraGrad.addColorStop(0.68, `rgba(0,200,150, ${0.22 + Math.cos(t * 0.9) * 0.08})`);
      auroraGrad.addColorStop(0.85, `rgba(0,255,180, ${0.20 + Math.sin(t * 0.7) * 0.08})`);
      auroraGrad.addColorStop(1,    "rgba(0,212,255, 0.0)");
      context.fillStyle = auroraGrad;
      context.fillRect(0, fogH * 0.05, canvas.width, fogH * 0.55);

      // Vertical shimmer
      const shimmerGrad = context.createLinearGradient(0, fogH * 0.05, 0, fogH * 0.60);
      shimmerGrad.addColorStop(0,   `rgba(100,180,255, ${0.08 + Math.sin(t * 1.3) * 0.04})`);
      shimmerGrad.addColorStop(0.5, "rgba(100,100,255, 0.03)");
      shimmerGrad.addColorStop(1,   "rgba(0,0,0, 0.0)");
      context.fillStyle = shimmerGrad;
      context.fillRect(0, fogH * 0.05, canvas.width, fogH * 0.55);

      // ── Lightning ──
      spawnBolt();
      bolts.forEach((bolt, i) => {
        bolt.age++;
        bolt.opacity = Math.max(0, 1 - bolt.age / 10);
        bolt.branches.forEach((b) => {
          context.beginPath();
          context.moveTo(b.x1, b.y1);
          context.lineTo(b.x2, b.y2);
          context.strokeStyle = `rgba(180,230,255, ${bolt.opacity * 0.9})`;
          context.lineWidth   = bolt.age < 2 ? 2 : 0.8;
          context.shadowColor = "rgba(0,212,255,1)";
          context.shadowBlur  = 14;
          context.stroke();
          context.shadowBlur  = 0;
        });
        if (bolt.opacity <= 0) bolts.splice(i, 1);
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative w-full min-h-[55vh] flex flex-col items-center justify-center overflow-hidden bg-[#080A16]">

      {/* Fog + aurora canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Wordmark + tagline */}
      <div className="relative z-10 flex flex-col items-center gap-5">

        {/* GestaltView wordmark */}
        <h1
          className={`
            text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white select-none
            transition-all duration-1000 ease-out
            ${wordmarkVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
          style={{
            fontFamily: "'Cabin Sketch', cursive",
            textShadow:
              "0 0 40px rgba(0,212,255,0.55), 0 0 80px rgba(153,69,255,0.30), 0 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          GestaltView
        </h1>

        {/* Founder tagline — Dancing Script, delayed reveal */}
        <p
          className={`
            text-xl md:text-2xl text-white/75 text-center max-w-md leading-relaxed
            transition-all duration-1200 ease-out
            ${taglineVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontWeight: 500,
            textShadow:
              "0 0 24px rgba(0,212,255,0.30), 0 0 48px rgba(153,69,255,0.15)",
            letterSpacing: "0.01em",
          }}
        >
          You don&apos;t have to know where you&apos;re going,
          <br />
          <span className="text-white/60">just that you&apos;re not alone in getting there.</span>
tml        </p>
      </div>

      {/* Fog tail into Babylon section */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-0
          transition-opacity duration-1000 delay-500
          ${fogComplete ? "opacity-100" : "opacity-0"}
        `}
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(7,16,31,0.97))",
        }}
      />

      {/* Scroll cue */}
      <div
        className={`
          absolute bottom-8 left-1/2 -translate-x-1/2 z-10
          flex flex-col items-center gap-1
          transition-all duration-700 delay-[2200ms]
          ${taglineVisible ? "opacity-30" : "opacity-0"}
        `}
      >
        <span className="text-white/40 text-xs tracking-[0.3em] uppercase font-mono">
          Enter the field
        </span>
        <div className="w-px h-6 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}
