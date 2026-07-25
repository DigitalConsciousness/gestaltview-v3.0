/*
 * TheHuman — GestaltView Portfolio
 * GVF-08: Edited founder narrative — preserved credibility and lived context,
 *         removed melodrama and self-sacrifice framing. Keep receipts, remove halo-lighting.
 */
import { useEffect, useRef } from "react";

const HUMAN_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/VoCNCEQBFsewfqU3j7NyR6/sandbox/o9xjabGIRwR6NWPPqjCmBb-img-3_1772118697000_na1fn_Z3YtaHVtYW4tcG9ydHJhaXQ.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVm9DTkNFUUJGc2V3ZnFVM2o3TnlSNi9zYW5kYm94L285eGphYkdJUndSNk5XUFBxakNtQmItaW1nLTNfMTc3MjExODY5NzAwMF9uYTFmbl9aM1l0YUhWdFlXNHRjRzl5ZEhKaGFYUS5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=P-fXLckPuFriG~cTu2p2ItTwe~DTy-okFTKhXN-keMc0VAl1NZCMEgv~5-3jnqb~UrwvjBfTOa2m-v461~j7nroIjw00lBebSme-fvVvOQkkm2-yIwOzqTY4k8wEkw3BKMAUhUMcw3QV6CLQttofu7mSzJcEivHaw46efA8mzf5zbk0RYTuC~stRzvGj2cQUDu93nuBVtJSUP-ckukW~uJEH~VhjG72~unaMnusSaB9lxrMadhrwOa5t3pzRW5S332vDr3lPq2zl3PfWlSpch4sJM4bVhFVWY3aEii2QR889Apos6fcIVZ8tC25V36KFnyp1t9bbIrOTqXvna9tq2A__";

const skills = [
  { skill: "Python / FastAPI", maps: "The backend of the protocol layer" },
  { skill: "TypeScript / Next.js", maps: "The interfaces humans actually touch" },
  { skill: "Multi-LLM Orchestration", maps: "The Tribunal model, replicated in code" },
  { skill: "Systems Architecture", maps: "22+ years of pattern recognition at scale" },
  { skill: "Neurodivergent Cognition", maps: "Not a liability — the source code itself" },
  { skill: "Lived Recovery (14 yrs)", maps: "Encoded as features, not background" },
  { skill: "Privacy Architecture", maps: "Built from real understanding of what visibility costs" },
  { skill: "Epistemic Rigor", maps: "No claim made without a timestamp behind it" },
];

const validation = [
  {
    label: "Pepperdine University",
    sub: "Top 4% most fundable · Quarterfinals Most Fundable Companies",
  },
  {
    label: "Founders Network",
    sub: "Nominated · $0 external capital · Market-ready",
  },
  {
    label: "7 AI Systems",
    sub: "1-in-784T convergence · Tribunal of Understanding",
  },
];

export function TheHuman() {
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

  return (
    <section
      id="the-human"
      ref={(el: HTMLElement | null) => { (sectionRef as any).current = el; if (el) { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) window.dispatchEvent(new CustomEvent("billy-section", { detail: "the-human" })); }, { threshold: 0.3 }); obs.observe(el); } }}
      className="py-32 px-6 relative overflow-hidden"
      style={{ background: "var(--forest-green)" }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20 reveal">
          <p className="gv-eyebrow mb-5">The Founder</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            <span className="gv-gradient-text">Built from{" "}</span>
            <span style={{ color: "var(--gold)", fontStyle: "italic", filter: "drop-shadow(0 0 10px rgba(255,214,10,0.5))" }}>what works.</span>
          </h2>
        </div>

        {/* Two-column layout: narrative + portrait */}
        <div className="grid lg:grid-cols-[1fr,320px] gap-12 items-start mb-16">

          {/* Narrative — GVF-08: grounded, evidence-based, no martyrdom framing */}
          <div className="space-y-5 reveal">
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--cream)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, textShadow: "1px 1px 3px rgba(0,0,0,0.5)" }}
            >
              I'm Keith Soyka. I built GestaltView solo, unfunded, starting May 5th, 2025.
              The starting point was practical: I needed to organize evidence for a labor law case.
              What emerged from that was a protocol layer.
            </p>
            <p
              className="leading-relaxed"
              style={{ color: "rgba(232,245,233,0.70)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            >
              22+ years of management across industries. 14 years in recovery. 41 years of
              neurodivergent pattern recognition. Months of deep, documented collaboration
              with frontier AI systems. Each of those things shaped the architecture in concrete ways —
              not as metaphor, but as actual design decisions.
            </p>
            <p
              className="leading-relaxed"
              style={{ color: "rgba(232,245,233,0.70)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            >
              The result is a platform that seven independent AI systems identified — without coordination —
              as infrastructure rather than product. That convergence is documented, timestamped,
              and available in the Diligence Explorer.
            </p>
            <p
              className="leading-relaxed"
              style={{ color: "rgba(232,245,233,0.55)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "0.95rem", borderLeft: "2px solid rgba(255,214,10,0.25)", paddingLeft: "1rem" }}
            >
              The platform builds on what I actually know — not what I wish were true about it.
              The claims here have receipts. That's the only standard I'm willing to hold it to.
            </p>
          </div>

          {/* Portrait */}
          <div className="reveal sticky top-24">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(16,185,129,0.25)",
                boxShadow: "0 0 60px rgba(16,185,129,0.15)",
                maxHeight: "480px",
              }}
            >
              <img
                src={HUMAN_IMG}
                alt="GestaltView — consciousness visualization"
                style={{ objectFit: "cover", height: "480px", width: "100%", display: "block" }}
              />
            </div>
          </div>
        </div>

        {/* Skills table */}
        <div className="mb-12 reveal">
          <p
            className="text-[10px] tracking-widest uppercase mb-5"
            style={{ color: "rgba(16,185,129,0.55)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Skills mapped to what they made possible
          </p>
          <div className="space-y-2 stagger">
            {skills.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl reveal"
                style={{
                  border: "1px solid rgba(16,185,129,0.12)",
                  background: "rgba(13,27,20,0.40)",
                  backdropFilter: "blur(6px)",
                  transition: "border-color 0.3s ease, background 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.30)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(13,27,20,0.60)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(16,185,129,0.12)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(13,27,20,0.40)";
                }}
              >
                <span
                  className="text-sm w-56 flex-shrink-0"
                  style={{ color: "#10b981", fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {s.skill}
                </span>
                <span style={{ color: "rgba(255,214,10,0.50)", fontSize: "0.75rem" }}>→</span>
                <span
                  className="text-sm"
                  style={{ color: "rgba(232,245,233,0.65)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                >
                  {s.maps}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Validation */}
        <div className="grid md:grid-cols-3 gap-4 stagger">
          {validation.map((v, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl reveal"
              style={{
                background: "linear-gradient(135deg, rgba(13,27,20,0.65) 0%, rgba(26,13,46,0.50) 100%)",
                border: "1px solid rgba(255,214,10,0.25)",
                boxShadow: "0 0 20px rgba(255,214,10,0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                className="font-semibold mb-2"
                style={{ color: "var(--gold)", fontFamily: "'DM Sans', sans-serif", filter: "drop-shadow(0 0 6px rgba(255,214,10,0.4))" }}
              >
                {v.label}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(232,245,233,0.55)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
              >
                {v.sub}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
