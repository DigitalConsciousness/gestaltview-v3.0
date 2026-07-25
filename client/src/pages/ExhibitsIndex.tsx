// © 2026 Keith Soyka — GestaltView
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { Link } from "wouter";
import NavBar from "@/components/NavBar";
import AuroraBackground from "@/components/AuroraBackground";
import { EXHIBITS } from "@/data/exhibits";

export default function ExhibitsIndex() {
  useSEO(PAGE_SEO.exhibits);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0A0F14] text-white">
      <AuroraBackground />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.012) 2px, rgba(0,212,255,0.012) 4px)",
        }}
      />
      <NavBar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="mb-10 text-center">
          <p
            className="text-xs uppercase tracking-[0.35em] opacity-55"
            style={{ color: "#00D4FF", fontFamily: "'JetBrains Mono', monospace" }}
          >
            GestaltView · Platform Network
          </p>
          <h1
            className="mt-2 text-4xl font-bold sm:text-5xl"
            style={{ textShadow: "0 0 28px rgba(0,212,255,0.22)" }}
          >
            GestaltView Modules
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-white/70 sm:text-base">
            Browse the platform by module family. The structure is now organized around how the system actually serves a person,
            not a generic demo catalog.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXHIBITS.map((exhibit) => (
            <Link key={exhibit.slug} href={`/exhibits/${exhibit.slug}`}>
              <a
                className="group rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: `${exhibit.colorHex}35`,
                  background: "rgba(5,10,14,0.82)",
                  boxShadow: `0 0 0 rgba(0,0,0,0), 0 0 24px ${exhibit.colorHex}08`,
                }}
              >
                <p
                  className="font-mono text-xs uppercase tracking-[0.22em]"
                  style={{ color: exhibit.colorHex }}
                >
                  {exhibit.glyph} {exhibit.tribunalRole}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{exhibit.title}</h2>
                <p className="mt-2 text-sm text-white/75">{exhibit.tagline}</p>
                <p className="mt-4 text-xs text-white/55">{exhibit.billyPreviewPrompt}</p>
                <p
                  className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] transition-opacity group-hover:opacity-100"
                  style={{ color: exhibit.colorHex, opacity: 0.8 }}
                >
                  Open exhibit →
                </p>
              </a>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
