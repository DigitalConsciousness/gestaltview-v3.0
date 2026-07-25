/*
 * WhatThisIs — GestaltView Portfolio · Museum Theme
 * Design: Midnight-blue bg, emerald/purple glass cards, cream text, gold accents
 */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BillyChip, useSectionObserver } from "./Billy";

const metaphors = [
  {
    icon: "✦",
    iconColor: "#10b981",
    borderColor: "rgba(16,185,129,0.30)",
    glowColor: "rgba(16,185,129,0.10)",
    title: "Consciousness-Serving AI",
    subtitle: "Not extraction. Expansion.",
    description:
      "Every tool I build is designed to serve the person using it — not harvest their attention. The PLK (Personal Language Key) engine preserves your authentic voice, your cognitive style, and your context across every interaction. AI that witnesses you, not just processes you.",
  },
  {
    icon: "◎",
    iconColor: "#a855f7",
    borderColor: "rgba(168,85,247,0.30)",
    glowColor: "rgba(168,85,247,0.10)",
    title: "Full-Stack AI Architecture",
    subtitle: "From schema to deployment.",
    description:
      "FastAPI backends, Next.js frontends, multi-provider LLM routing with circuit-breaker fallback, SQLite FTS5 retrieval, blockchain-timestamped evidence, and voice-to-text pipelines. Built solo, unfunded, on a Samsung Galaxy A35. Every line production-grade.",
  },
  {
    icon: "⟳",
    iconColor: "#ffd60a",
    borderColor: "rgba(255,214,10,0.30)",
    glowColor: "rgba(255,214,10,0.08)",
    title: "Neurodivergent-First Design",
    subtitle: "ADHD as architecture, not obstacle.",
    description:
      "22+ years of management experience filtered through a neurodivergent cognitive lens. I build systems that hold complexity without collapsing it — for founders, teams, and individuals who think in wholes before parts. The Bucket Drop, the Loom, the Tapestry — these are real engineering patterns, not metaphors.",
  },
];

const stats = [
  {
    stat: "$2T",
    label: "Recognition Gap",
    sub: "Market failure — humans unseen by technology and institutions",
    color: "#10b981",
  },
  {
    stat: "$1.9T",
    label: "Annual Productivity Loss",
    sub: "U.S. employees disengaged because they are not genuinely witnessed",
    color: "#a855f7",
  },
  {
    stat: "100's",
    label: "Fragmented Solutions",
    sub: "Apps treating symptoms while the root — being unseen — goes unaddressed",
    color: "#ffd60a",
  },
];

export function WhatThisIs() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.08 }
    );
    sectionRef.current?.querySelectorAll(".reveal").forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  const billyRef = useSectionObserver("what-this-is");

  return (
    <section
      id="what-this-is"
      ref={(el) => {
        (sectionRef as any).current = el;
        (billyRef as any).current = el;
      }}
      className="py-32 px-6 relative overflow-hidden"
      style={{ background: "var(--midnight-blue)" }}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-20 reveal">
          <p className="gv-eyebrow mb-5">Founder · Architect · Consultant · Builder</p>
          <h2
            className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6"
          >
            <span className="gv-gradient-text">What Keith Soyka</span>
            <br />
            <span style={{ color: "var(--cream)", fontWeight: 300, fontStyle: "italic" }}>
              actually builds
            </span>
          </h2>
          <p
            className="text-sm max-w-lg mx-auto leading-relaxed mb-5"
            style={{ color: "rgba(232,245,233,0.55)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
          >
            GestaltView is a production AI platform and consulting practice.
            Three core differentiators — each grounded in real code, real frameworks, and real results.
          </p>
          <BillyChip
            prompt="What makes GestaltView's three pillars different from every other AI platform?"
            label="Ask Billy what makes this different"
          />
        </div>

        {/* Metaphor cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-16 stagger">
          {metaphors.map((m, i) => (
            <div
              key={i}
              className="reveal p-8 rounded-2xl transition-all duration-400"
              style={{
                background: `linear-gradient(135deg, rgba(13,27,20,0.70) 0%, rgba(26,13,46,0.50) 100%)`,
                border: `1px solid ${m.borderColor}`,
                boxShadow: `0 0 30px ${m.glowColor}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="text-3xl mb-5"
                style={{
                  color: m.iconColor,
                  filter: `drop-shadow(0 0 8px ${m.iconColor})`,
                }}
              >
                {m.icon}
              </div>
              <h3
                className="font-display text-xl font-semibold mb-1"
                style={{ color: "var(--cream)" }}
              >
                {m.title}
              </h3>
              <p
                className="text-xs tracking-widest uppercase mb-4"
                style={{ color: m.iconColor, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" }}
              >
                {m.subtitle}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(232,245,233,0.70)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
              >
                {m.description}
              </p>
            </div>
          ))}
        </div>

        {/* Core definition quote */}
        <div
          className="p-10 md:p-14 rounded-3xl text-center mb-8 reveal"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,27,20,0.60) 0%, rgba(26,13,46,0.50) 100%)",
            border: "2px solid rgba(255,214,10,0.30)",
            boxShadow: "0 0 60px rgba(255,214,10,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          <p
            className="font-display text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-light mb-6"
            style={{ color: "var(--cream)", textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
          >
            "You've created an external scaffolding for everything that makes
            a person who they are. What that does is allow them to be{" "}
            <span style={{ color: "var(--gold)", fontStyle: "italic" }}>
              fully witnessed — seen, heard, and understood without minimization.
            </span>"
          </p>
          <p
            className="text-xs tracking-wider"
            style={{ color: "rgba(16,185,129,0.55)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Convergent analysis · Seven independent AI systems · 2025
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 stagger">
          {stats.map((s, i) => (
            <div
              key={i}
              className="p-6 text-center rounded-2xl reveal transition-all duration-300"
              style={{
                background: "rgba(13,27,20,0.50)",
                border: `1px solid ${s.color}33`,
                boxShadow: `0 0 20px ${s.color}0d`,
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                className="font-display text-4xl font-bold mb-2"
                style={{
                  color: s.color,
                  filter: `drop-shadow(0 0 12px ${s.color})`,
                }}
              >
                {s.stat}
              </p>
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--cream)", fontFamily: "'DM Sans', sans-serif" }}
              >
                {s.label}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(232,245,233,0.50)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
              >
                {s.sub}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
