/*
 * Contact — GestaltView Portfolio · Museum Theme
 * GVF-09: Fixed Calendly script injection, corrected GitHub URL,
 *         added YouTube / Reddit / Discord social links, updated copyright to 2026
 * GVF-11: Inserted GestaltView_Banner.gif above footer quote,
 *         applied Cabin Sketch font with emerald→lavender gradient to quote
 * Design: Midnight-blue bg, emerald/gold CTAs, cream text, ebbing orbs
 */
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Extend Window so TS doesn't complain about Calendly
declare global {
  interface Window { Calendly?: unknown; }
}

const CALENDLY_URL = "https://calendly.com/keithsoyka/30min";

export function Contact() {
  const sectionRef = useRef<HTMLElement | null>(null);

  // GVF-09: inject Calendly widget script once on mount
  useEffect(() => {
    if (!document.getElementById("calendly-script")) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.id  = "calendly-script";
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // GVF-11: inject Cabin Sketch from Google Fonts once
    if (!document.getElementById("cabin-sketch-font")) {
      const link = document.createElement("link");
      link.id   = "cabin-sketch-font";
      link.rel  = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Reveal-on-scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    sectionRef.current?.querySelectorAll(".reveal").forEach((r) => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  // Dispatch Billy section event
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) window.dispatchEvent(new CustomEvent("billy-section", { detail: "contact" })); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={(el) => { sectionRef.current = el; }}
      className="relative py-40 px-6 text-center overflow-hidden"
      style={{ background: "var(--midnight-blue)" }}
    >
      {/* Ebbing orbs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: "20%", left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "400px",
          background: "radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: "10%", left: "20%",
          width: "350px", height: "350px",
          background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: "50%", right: "15%",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(255,214,10,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [0.9, 1.3, 0.9], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <div className="relative max-w-2xl mx-auto">

        <p className="gv-eyebrow mb-10 reveal">What’s next</p>

        <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6 reveal">
          <span className="gv-gradient-text">If any of this resonated,</span>
          <br />
          <span style={{ color: "var(--cream)", fontWeight: 300, fontStyle: "italic" }}>
            you already know.
          </span>
        </h2>

        <p
          className="text-sm leading-relaxed mb-4 max-w-lg mx-auto reveal"
          style={{ color: "rgba(232,245,233,0.65)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
        >
          I’m not looking for a transaction. I’m looking for the person or team
          who understands that what’s been built here is infrastructure —
          and wants to be part of laying it down properly.
        </p>

        <p
          className="text-base leading-relaxed mb-14 max-w-md mx-auto italic reveal"
          style={{ color: "rgba(232,245,233,0.50)", fontFamily: "'Cormorant Garamond', serif" }}
        >
          “The Recognition Gap is a $2 trillion market failure.
          The solution wasn’t invented in a lab.
          It emerged from a life lived fully —
          and documented with enough rigor to be undeniable.”
        </p>

        {/* Calendly Inline Widget */}
        <div
          className="reveal mb-16"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(16,185,129,0.20)",
            boxShadow: "0 0 40px rgba(16,185,129,0.08)",
          }}
        >
          <div
            className="calendly-inline-widget"
            data-url={`${CALENDLY_URL}?hide_event_type_details=1&hide_gdpr_banner=1&background_color=0d1b14&text_color=e8f5e9&primary_color=10b981`}
            style={{ minWidth: "320px", height: "630px" }}
          />
        </div>

        {/* ── Primary CTA ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-6 mb-12 reveal">
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-12 py-5 rounded-full text-sm tracking-wide transition-all duration-300 font-semibold"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.28) 0%, rgba(168,85,247,0.22) 100%)",
              border: "2px solid rgba(16,185,129,0.55)",
              color: "var(--cream)",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.08em",
              boxShadow: "0 0 30px rgba(16,185,129,0.20), inset 0 0 20px rgba(16,185,129,0.05)",
              fontSize: "0.95rem",
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget as HTMLAnchorElement;
              t.style.borderColor  = "rgba(16,185,129,0.80)";
              t.style.boxShadow    = "0 0 50px rgba(16,185,129,0.35), inset 0 0 30px rgba(16,185,129,0.08)";
              t.style.transform    = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget as HTMLAnchorElement;
              t.style.borderColor  = "rgba(16,185,129,0.55)";
              t.style.boxShadow    = "0 0 30px rgba(16,185,129,0.20), inset 0 0 20px rgba(16,185,129,0.05)";
              t.style.transform    = "translateY(0)";
            }}
          >
            🗓️ Book a Call with Keith
          </a>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(232,245,233,0.30)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "-8px" }}>
            30-min intro · No pitch. Just a real conversation.
          </p>
        </div>

        {/* ── Secondary contact links ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-8 reveal">
          <a
            href="mailto:keithsoyka@gmail.com"
            className="px-8 py-3 rounded-full text-sm tracking-wide transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.20) 0%, rgba(168,85,247,0.15) 100%)",
              border: "1px solid rgba(16,185,129,0.45)",
              color: "var(--cream)",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.06em",
              boxShadow: "0 0 20px rgba(16,185,129,0.15)",
            }}
            onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(16,185,129,0.70)"; t.style.boxShadow = "0 0 30px rgba(16,185,129,0.30)"; }}
            onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(16,185,129,0.45)"; t.style.boxShadow = "0 0 20px rgba(16,185,129,0.15)"; }}
          >
            ✉️ keithsoyka@gmail.com
          </a>
          <a
            href="https://linkedin.com/in/keithsoyka413"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-full text-sm tracking-wide transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(13,27,20,0.60) 0%, rgba(26,13,46,0.50) 100%)",
              border: "2px solid rgba(255,214,10,0.40)",
              color: "var(--gold)",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.06em",
              boxShadow: "0 0 15px rgba(255,214,10,0.12)",
            }}
            onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(255,214,10,0.70)"; t.style.boxShadow = "0 0 25px rgba(255,214,10,0.25)"; }}
            onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(255,214,10,0.40)"; t.style.boxShadow = "0 0 15px rgba(255,214,10,0.12)"; }}
          >
            💼 LinkedIn
          </a>
          <a
            href="https://github.com/faagestalt-web"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-full text-sm tracking-wide transition-all duration-300"
            style={{
              border: "1px solid rgba(168,85,247,0.35)",
              color: "rgba(168,85,247,0.85)",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.06em",
            }}
            onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(168,85,247,0.65)"; t.style.color = "rgba(168,85,247,1)"; }}
            onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(168,85,247,0.35)"; t.style.color = "rgba(168,85,247,0.85)"; }}
          >
            💻 GitHub
          </a>
        </div>

        {/* ── Community / social links ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-20 reveal">
          <a
            href="https://youtube.com/@keithsoyka"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-full text-sm tracking-wide transition-all duration-300"
            style={{ border: "1px solid rgba(255,0,0,0.35)", color: "rgba(255,80,80,0.85)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}
            onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(255,0,0,0.65)"; t.style.color = "rgba(255,80,80,1)"; t.style.boxShadow = "0 0 20px rgba(255,0,0,0.15)"; }}
            onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(255,0,0,0.35)"; t.style.color = "rgba(255,80,80,0.85)"; t.style.boxShadow = "none"; }}
          >
            ▶️ YouTube
          </a>
          <a
            href="https://reddit.com/u/gestaltview_ai"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-full text-sm tracking-wide transition-all duration-300"
            style={{ border: "1px solid rgba(255,69,0,0.35)", color: "rgba(255,120,60,0.85)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}
            onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(255,69,0,0.65)"; t.style.color = "rgba(255,120,60,1)"; t.style.boxShadow = "0 0 20px rgba(255,69,0,0.15)"; }}
            onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(255,69,0,0.35)"; t.style.color = "rgba(255,120,60,0.85)"; t.style.boxShadow = "none"; }}
          >
            🤖 Reddit
          </a>
          <a
            href="https://discord.gg/CnnRuJWnj"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-3 rounded-full text-sm tracking-wide transition-all duration-300"
            style={{ border: "1px solid rgba(88,101,242,0.40)", color: "rgba(140,150,255,0.85)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}
            onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(88,101,242,0.70)"; t.style.color = "rgba(140,150,255,1)"; t.style.boxShadow = "0 0 20px rgba(88,101,242,0.20)"; }}
            onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.borderColor = "rgba(88,101,242,0.40)"; t.style.color = "rgba(140,150,255,0.85)"; t.style.boxShadow = "none"; }}
          >
            💬 Discord
          </a>
        </div>

        {/* ── Footer: Banner + Quote ───────────────────────────────────────── */}
        <div
          className="pt-10 reveal"
          style={{ borderTop: "1px solid rgba(16,185,129,0.12)" }}
        >
          {/* GVF-11: GestaltView Banner GIF */}
          <motion.div
            className="mb-8 mx-auto"
            style={{ maxWidth: "680px" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img
              src="client/shared/GestaltView_Banner_one.gif"
              alt="GestaltView — Consciousness-Serving AI Platform"
              width={680}
              height={240}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "12px",
                border: "1px solid rgba(16,185,129,0.15)",
                boxShadow: "0 0 40px rgba(16,185,129,0.10), 0 0 80px rgba(168,85,247,0.06)",
              }}
            />
          </motion.div>

          {/* GVF-11: Cabin Sketch quote with emerald→lavender gradient */}
          <motion.p
            className="text-xl md:text-2xl leading-relaxed mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{
              fontFamily: "'Cabin Sketch', cursive",
              fontWeight: 700,
              background: "linear-gradient(135deg, #10b981 0%, #a855f7 60%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "none",
            }}
          >
            “You don’t have to know where you’re going.
            <br />
            Just that you’re not alone in getting there.”
          </motion.p>

          <p
            className="text-xs mt-4"
            style={{ color: "rgba(232,245,233,0.25)", fontFamily: "'DM Sans', sans-serif" }}
          >
            © 2025–2026 Keith Soyka · GestaltView · All Rights Reserved
          </p>
        </div>

      </div>
    </section>
  );
}
