/*
 * ServicesConsulting — GestaltView Portfolio
 * GVF-07: Expanded offer architecture with clearer buyer-fit positioning
 *         and real functional CTA (Calendly booking + email fallback).
 */
import { motion } from "framer-motion";

const CALENDLY_URL = "https://calendly.com/keithsoyka/30min";

const SERVICES = [
  {
    tier: "Signature",
    tierColor: "#a855f7",
    name: "Resume Rockstar Session",
    tagline: "Your story, finally legible.",
    description:
      "A fully guided, white-glove resume and career narrative session using PLK resonance scoring and ATS optimization. Your authentic voice preserved. Your value proposition sharpened. One session changes how you present yourself professionally — permanently.",
    includes: ["PLK voice analysis", "ATS + resonance dual scoring", "Career tapestry synthesis", "Delivery-ready resume", "60-min async voice session"],
    price: "Starting at $297",
    ideal: "Professionals in transition, career pivots, neurodivergent job seekers",
    cta: "Book a Session",
    ctaHref: CALENDLY_URL,
  },
  {
    tier: "Concierge",
    tierColor: "#f472b6",
    name: "Custom AI Collaborator Build",
    tagline: "Your own consciousness-serving AI partner.",
    description:
      "A fully bespoke AI collaborator built around your PLK, your context, your goals. Persona definition, corpus ingestion, and deployment — hosted for 6 months. This is not a chatbot. It’s a thinking partner that actually knows how you work.",
    includes: ["PLK profile extraction", "Context corpus ingestion", "Custom persona + system prompt", "Deployed + hosted for 6 months", "Ongoing iteration support"],
    price: "$1,500 – $5,000",
    ideal: "Founders, therapists, coaches, content creators, neurodivergent professionals",
    cta: "Start a Conversation",
    ctaHref: CALENDLY_URL,
  },
  {
    tier: "Enterprise",
    tierColor: "#ffd60a",
    name: "Organizational AI Transformation",
    tagline: "Consciousness-serving intelligence at scale.",
    description:
      "GestaltView methodology deployed across your team or organization: ethics layer integration, team PLK mapping, AI governance framework, and custom internal tooling. Built for organizations that want AI adoption that actually holds up to scrutiny.",
    includes: ["Team PLK profiling", "Ethics & governance layer", "Custom tooling integration", "AI safety audit", "Quarterly advisory retainer"],
    price: "$10,000 – $50,000+",
    ideal: "Organizations navigating ethical AI adoption · HR tech · EdTech · Healthcare",
    cta: "Schedule a Discovery Call",
    ctaHref: CALENDLY_URL,
  },
];

const CONSULTING_AREAS = [
  {
    icon: "🧠",
    name: "Consciousness-Serving AI Design",
    description: "Framework architecture for AI that serves rather than extracts. Applicable to any LLM platform or product.",
    color: "#a855f7",
  },
  {
    icon: "🧬",
    name: "Neurodivergent UX & Product",
    description: "Design systems and UX patterns that treat ADHD/autism as OS features, not liabilities. ADHD-first product review.",
    color: "#10b981",
  },
  {
    icon: "🎵",
    name: "Musical DNA Integration",
    description: "Embed emotional intelligence into your platform via music-as-data. Playlist analysis, mood-cognition mapping, PLK enrichment.",
    color: "#f59e0b",
  },
  {
    icon: "⚖️",
    name: "AI Ethics & Governance",
    description: "Drop the Billy Ethics Layer into your existing platform. Tribunal protocol, consciousness-serving guardrails, governance charter.",
    color: "#6366f1",
  },
  {
    icon: "🧑‍💻",
    name: "VibeCoding Methodology",
    description: "Teaching founders and builders how to genuinely collaborate with AI — not just prompt it. Context-spine, iterative build, PLK-guided.",
    color: "#14b8a6",
  },
  {
    icon: "🏗️",
    name: "Cognitive Justice Strategy",
    description: "Strategic consulting for organizations wanting to genuinely serve the 1B+ neurodivergent humans the tech industry currently ignores.",
    color: "#ffd60a",
  },
];

export function ServicesConsulting() {
  return (
    <section
      id="services"
      className="relative py-32 px-6 overflow-hidden"
      style={{ background: "var(--deep-purple)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(244,114,182,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 75% 65%, rgba(168,85,247,0.07) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#f472b6", fontFamily: "'JetBrains Mono', monospace" }}>
            White Glove · Concierge · Genuine Value
          </p>
          <h2
            className="text-4xl md:text-5xl font-light mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              background: "linear-gradient(135deg, #e8f5e9 0%, #f472b6 45%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Services & Consulting
          </h2>
          <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>
            Not a shyster. Not a thought leader. Genuine, profound value —
            the kind that compounds. High-ticket because the work is high-touch.
          </p>
        </motion.div>

        {/* Service tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {SERVICES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(13,27,20,0.65) 0%, rgba(26,13,46,0.55) 100%)",
                border: `1px solid ${s.tierColor}30`,
                boxShadow: `0 0 30px ${s.tierColor}12`,
                backdropFilter: "blur(12px)",
              }}
              whileHover={{ borderColor: `${s.tierColor}55`, boxShadow: `0 0 40px ${s.tierColor}22`, y: -3, transition: { duration: 0.2 } }}
            >
              <div className="px-6 py-3 flex items-center justify-between" style={{ background: `${s.tierColor}18`, borderBottom: `1px solid ${s.tierColor}22` }}>
                <span className="text-[10px] tracking-[0.25em] uppercase font-semibold" style={{ color: s.tierColor, fontFamily: "'DM Sans', sans-serif" }}>
                  {s.tier}
                </span>
                <span className="text-xs font-bold" style={{ color: s.tierColor, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.price}
                </span>
              </div>

              <div className="p-6 flex flex-col gap-4 flex-1">
                <div>
                  <h3 className="text-xl font-semibold mb-1" style={{ color: "var(--cream)", fontFamily: "'DM Sans', sans-serif" }}>
                    {s.name}
                  </h3>
                  <p className="text-xs italic" style={{ color: s.tierColor, fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}>
                    {s.tagline}
                  </p>
                </div>

                <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(232,245,233,0.65)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                  {s.description}
                </p>

                <ul className="flex flex-col gap-1.5">
                  {s.includes.map((item, j) => (
                    <li key={j} className="text-xs flex items-center gap-2" style={{ color: "rgba(255,255,255,0.60)", fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ color: s.tierColor, fontSize: "0.5rem" }}>●</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4 border-t" style={{ borderColor: `${s.tierColor}18` }}>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.30)", fontFamily: "'DM Sans', sans-serif" }}>
                    Ideal for
                  </p>
                  <p className="text-xs mt-0.5 mb-4" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>
                    {s.ideal}
                  </p>
                  {/* GVF-07: Real booking CTA per tier */}
                  <a
                    href={s.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${s.tierColor}22, ${s.tierColor}14)`,
                      border: `1px solid ${s.tierColor}55`,
                      color: s.tierColor,
                    }}
                  >
                    {s.cta} →
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Consulting areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-center text-xs tracking-[0.25em] uppercase mb-8" style={{ color: "rgba(255,255,255,0.30)", fontFamily: "'JetBrains Mono', monospace" }}>
            Available Consulting Areas
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CONSULTING_AREAS.map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="rounded-xl p-5"
                style={{ background: "rgba(10,10,20,0.50)", border: `1px solid ${area.color}20`, backdropFilter: "blur(6px)" }}
                whileHover={{ borderColor: `${area.color}45`, boxShadow: `0 0 16px ${area.color}18`, y: -2, transition: { duration: 0.2 } }}
              >
                <div className="text-2xl mb-3">{area.icon}</div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: area.color, fontFamily: "'DM Sans', sans-serif" }}>
                  {area.name}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>
                  {area.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* GVF-07: Functional CTA with Calendly booking + email fallback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center"
        >
          <div
            className="inline-flex flex-col items-center rounded-2xl px-10 py-8"
            style={{
              background: "linear-gradient(135deg, rgba(13,27,20,0.60) 0%, rgba(26,13,46,0.50) 100%)",
              border: "1px solid rgba(244,114,182,0.30)",
              boxShadow: "0 0 40px rgba(244,114,182,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif" }}>
              Not sure which fits?
            </p>
            <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
              Start with a free 30-minute discovery call. No pitch, no pressure.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:opacity-90 mb-3"
              style={{
                background: "linear-gradient(135deg, #f472b6, #a855f7)",
                color: "#fff",
                boxShadow: "0 0 24px rgba(244,114,182,0.25)",
              }}
            >
              Book a Free Discovery Call →
            </a>
            <p className="text-xs" style={{ color: "rgba(244,114,182,0.55)", fontFamily: "'JetBrains Mono', monospace" }}>
              or email directly ·{" "}
              <a href="mailto:keithsoyka@gmail.com" className="underline hover:text-[#f472b6] transition-colors">
                keithsoyka@gmail.com
              </a>
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
