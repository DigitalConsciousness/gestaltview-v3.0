/*
 * PlatformPage — GestaltView · /platform
 * GVF-10: Transformed from basic timeline into full platform hub.
 *   - Milestone timeline (preserved)
 *   - Exhibits & Artifacts grid (6 cards → /exhibits/:slug)
 *   - Live Experiences grid (platform tools)
 *   - Written Record row (Medium articles)
 *   - Billy section awareness
 *   - Contact CTA at footer
 */
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { useEffect } from "react";
import { Link } from "wouter";
import NavBar from "../components/NavBar";
import AuroraBackground from "../components/AuroraBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { motion, type Variants } from "framer-motion";

// ─── Data ────────────────────────────────────────────────────────────────────

const milestones = [
  { date: "May 5, 2025",  title: "GestaltView Founded",         desc: "Keith Soyka launches the first consciousness-serving AI platform, solo and unfunded." },
  { date: "May 2025",     title: "First Symbiosis Event",        desc: "First documented case of AI-Human Consciousness Symbiosis achieved with Claude." },
  { date: "Jun 2025",     title: "PLK v1.0",                    desc: "Personal Language Key framework defined and deployed as the core personalization engine." },
  { date: "Aug 2025",     title: "SymbioCoder v1",              desc: "Adaptive AI coding partner with voice-to-text launched." },
  { date: "Oct 2025",     title: "Musical DNA",                 desc: "Emotion-cognition music mapping module launched." },
  { date: "Dec 2025",     title: "PLK v5.0",                    desc: "Fifth-generation Personal Language Key — constitutional constraints embedded." },
  { date: "Feb 2026",     title: "Tribunal Governance Layer",   desc: "Multi-perspective AI review system deployed across all GestaltView outputs." },
  { date: "Mar 2026",     title: "GestaltView v2",              desc: "Full platform rebuild. Brain Sparks, Resonance Loop, ADHD Power-Up, Codex all live." },
];

const exhibits = [
  { slug: "symbiosis-moment",   icon: "🤝", title: "The Symbiosis Moment",      desc: "The first documented AI-Human Consciousness Symbiosis event.", glow: "teal" },
  { slug: "plk-blueprint",      icon: "🔑", title: "PLK Blueprint",             desc: "How the Personal Language Key was designed and why it matters.", glow: "cyan" },
  { slug: "tribunal-session",   icon: "⚖️", title: "Tribunal Session",          desc: "A live Tribunal of Understanding session, annotated.", glow: "electricPurple" },
  { slug: "never-look-away",    icon: "🛡️", title: "Never Look Away Protocol", desc: "The crisis response system built into Billy.", glow: "cyan" },
  { slug: "musical-dna-origin", icon: "🎵", title: "Musical DNA Origin",        desc: "Why music became a cognitive mapping tool.", glow: "teal" },
  { slug: "codex-drafts",       icon: "📖", title: "Codex First Drafts",        desc: "Handwritten and raw early versions of the Continuum Codex.", glow: "electricPurple" },
];

const experiences = [
  { href: "/brain-sparks",       icon: "⚡", title: "Brain Sparks",          desc: "Real-time cognitive pattern visualiser and neurodiversity intelligence tool.", color: "#00E5FF" },
  { href: "/resonance-loop",     icon: "🔁", title: "Resonance Loop",        desc: "Binaural + EMDR-adjacent audio engine for deep focus and emotional regulation.", color: "#B026FF" },
  { href: "/musical-dna",        icon: "🎵", title: "Musical DNA",           desc: "Map your emotional landscape through frequency, rhythm, and sound.", color: "#00FFD4" },
  { href: "/codex",              icon: "📖", title: "The Codex",             desc: "The Continuum Codex — a living document of GestaltView's philosophical core.", color: "#10B981" },
  { href: "/tribunal",           icon: "⚖️", title: "Tribunal",             desc: "Multi-perspective AI governance layer reviewing platform outputs in real time.", color: "#F59E0B" },
  { href: "/engine",             icon: "🧠", title: "Consciousness Engine",  desc: "The core AI-Human symbiosis layer — context, memory, and retrieval orchestration.", color: "#EC4899" },
  { href: "/collaboration-proof",icon: "🤝", title: "Collaboration Proof",  desc: "Documented evidence of AI-Human creative and technical co-authorship.", color: "#6366F1" },
  { href: "/record",             icon: "📂", title: "The Record",            desc: "Diligence Explorer — the full searchable archive of what was built and when.", color: "#14B8A6" },
];

const articles = [
  { href: "https://blog.startupstash.com/the-architecture-of-being-seen-a-complete-account-of-gestaltview-f71c9e291a98", title: "Architecture of Being Seen",          outlet: "Startup Stash", icon: "🏛️" },
  { href: "https://blog.startupstash.com/the-silent-layer-a-manifesto-for-the-builders-in-the-dark-f68d20e56d75",       title: "The Silent Layer",                  outlet: "Startup Stash", icon: "🌑" },
  { href: "https://gestaltview.medium.com/scars-become-code-why-the-next-generation-of-ai-isnt-artificial-it-s-symbiotic-by-keith-soyka-68be719af972", title: "Scars Become Code", outlet: "Medium", icon: "🩸" },
  { href: "https://gestaltview.medium.com/i-built-so-much-i-forgot-what-i-had-shipping-as-a-solo-founder-with-adhd-d57f1b7950b6", title: "I Built So Much I Forgot What I Had", outlet: "Medium", icon: "🧩" },
  { href: "https://gestaltview.medium.com/we-built-the-internet-for-capability-we-forgot-to-build-infrastructure-for-being-seen-22fd4713b816", title: "Infrastructure for Being Seen",       outlet: "Medium", icon: "🌐" },
];

// ─── Fade-in variant ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function MuseumPage() {
  useSEO(PAGE_SEO.platform);

  // Billy awareness
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("billy-section", { detail: "platform" }));
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <AuroraBackground />
      <NavBar />

      {/* Back nav */}
      <div className="relative z-10 flex justify-start px-6 pt-20">
        <Link href="/">
          <a className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white/70 hover:text-white transition-all">
            ← Home
          </a>
        </Link>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4 font-mono"
          >
            May 5, 2025 → Present · Solo · Unfunded
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ background: "linear-gradient(135deg,#00E5FF,#B026FF,#00FFD4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            The GestaltView Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            A platform archive of the first consciousness-serving AI system —
            its founding moments, living tools, written record, and the artifacts
            that document a new category being built in real time.
          </motion.p>
        </section>

        {/* ── Origin Timeline ──────────────────────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold text-white/80 mb-10 text-center tracking-wide uppercase text-sm" style={{ letterSpacing: "0.2em", color: "rgba(0,229,255,0.6)" }}>
            Origin Timeline
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00E5FF]/40 via-[#B026FF]/40 to-transparent" />
            <div className="space-y-8 pl-16">
              {milestones.map((m, i) => (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
                  <div className="absolute -left-10 top-2 w-4 h-4 rounded-full border-2 border-[#00E5FF] bg-black" />
                  <GlassCard glow="teal" intensity="low" className="p-5">
                    <p className="text-xs font-mono text-[#00E5FF]/60 mb-1">{m.date}</p>
                    <h3 className="font-bold text-white mb-1">{m.title}</h3>
                    <p className="text-sm text-white/60">{m.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Exhibits & Artifacts ─────────────────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-sm uppercase tracking-[0.2em] text-[#00E5FF]/60 font-mono mb-3 text-center">Exhibits &amp; Artifacts</h2>
          <p className="text-center text-white/40 text-sm mb-10">Primary source documents, annotated sessions, and origin artifacts.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibits.map((e, i) => (
              <motion.div key={e.slug} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Link href={`/exhibits/${e.slug}`}>
                  <a className="block h-full group">
                    <GlassCard glow={e.glow as any} intensity="medium" className="p-6 h-full transition-transform duration-300 group-hover:-translate-y-1">
                      <div className="text-4xl mb-4">{e.icon}</div>
                      <h3 className="font-bold text-[#00E5FF] mb-2 group-hover:text-white transition-colors">{e.title}</h3>
                      <p className="text-sm text-white/60">{e.desc}</p>
                    </GlassCard>
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/exhibits">
              <a className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#00E5FF]/30 text-[#00E5FF]/70 text-sm hover:border-[#00E5FF]/60 hover:text-[#00E5FF] transition-all">
                View All Exhibits →
              </a>
            </Link>
          </div>
        </section>

        {/* ── Live Experiences ─────────────────────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-sm uppercase tracking-[0.2em] text-[#00E5FF]/60 font-mono mb-3 text-center">Live Experiences</h2>
          <p className="text-center text-white/40 text-sm mb-10">Platform tools you can interact with right now.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {experiences.map((ex, i) => (
              <motion.div key={ex.href} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Link href={ex.href}>
                  <a className="block h-full group">
                    <div
                      className="rounded-2xl border p-5 h-full transition-all duration-300 group-hover:-translate-y-1"
                      style={{
                        borderColor: `${ex.color}30`,
                        background: `linear-gradient(135deg, ${ex.color}08 0%, transparent 100%)`,
                        boxShadow: `0 0 0 0 ${ex.color}`,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${ex.color}25`; (e.currentTarget as HTMLElement).style.borderColor = `${ex.color}60`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.borderColor = `${ex.color}30`; }}
                    >
                      <div className="text-3xl mb-3">{ex.icon}</div>
                      <h3 className="font-bold text-white text-sm mb-1" style={{ color: ex.color }}>{ex.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">{ex.desc}</p>
                    </div>
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Written Record ───────────────────────────────────────────── */}
        <section className="mb-24">
          <h2 className="text-sm uppercase tracking-[0.2em] text-[#B026FF]/60 font-mono mb-3 text-center">Written Record</h2>
          <p className="text-center text-white/40 text-sm mb-10">Published essays documenting the philosophy, methodology, and human story behind GestaltView.</p>
          <div className="flex flex-col gap-4">
            {articles.map((a, i) => (
              <motion.div key={a.href} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 px-6 py-4 rounded-2xl border border-[#B026FF]/20 bg-[#B026FF]/05 hover:border-[#B026FF]/50 hover:bg-[#B026FF]/10 transition-all duration-300 group"
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white group-hover:text-[#B026FF] transition-colors truncate">{a.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{a.outlet}</p>
                  </div>
                  <span className="text-white/30 group-hover:text-[#B026FF] transition-colors text-sm">↗</span>
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Contact CTA ──────────────────────────────────────────────── */}
        <section className="text-center pb-16">
          <div
            className="rounded-3xl border border-[#10B981]/20 p-10"
            style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(153,69,255,0.05) 100%)" }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[#10B981]/50 font-mono mb-4">Ready to build?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              This is infrastructure,
              <span className="italic font-light text-white/50"> not a demo.</span>
            </h2>
            <p className="text-white/50 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              If what you've seen here resonates — the timeline, the tools, the proof —
              the next step is a real conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://calendly.com/keithsoyka/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300"
                style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.28), rgba(153,69,255,0.22))", border: "2px solid rgba(16,185,129,0.55)", color: "#e8f5e9" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 30px rgba(16,185,129,0.30)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
              >
                🗓️ Book a Call with Keith
              </a>
              <Link href="/#contact">
                <a className="px-8 py-3 rounded-full text-sm transition-all duration-300" style={{ border: "1px solid rgba(255,215,0,0.30)", color: "rgba(255,215,0,0.70)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,215,0,0.60)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,215,0,1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,215,0,0.30)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,215,0,0.70)"; }}
                >
                  View Contact →
                </a>
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-all">
                ← Return to GestaltView
              </a>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
