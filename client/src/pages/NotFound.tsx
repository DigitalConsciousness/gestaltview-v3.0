/**
 * @file NotFound.tsx
 * @project GestaltView v2
 * @repository DigitalConsciousness/gestaltview-v2.0
 * @author Keith Soyka
 * @copyright 2026 Keith Soyka / GestaltView. All rights reserved.
 *
 * Notes: Branded 404 surface that preserves Billy-era voice and returns users to Sanctuary.
 * This file is not responsible for route registration or global navigation policies.
 */
import { useSEO } from "@/hooks/useSEO";
import { Link } from "wouter";

export default function NotFound() {
  useSEO({
    title: '404 — Misplaced Page | GestaltView',
    description: "This page has been misplaced. We've filed the appropriate forms. Return to the Sanctuary.",
    h1: 'This page has been misplaced',
    canonical: 'https://gestaltview-di-gsvw.vercel.app/404',
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center" style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.85)' }}>
      <div className="text-center max-w-md px-6">
        <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'rgba(52,211,153,0.6)' }}>GestaltView</p>
        <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ background: 'linear-gradient(135deg,#FFD700,#9945FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
        <p className="text-white/60 mb-2">This page has been misplaced.</p>
        <p className="text-white/60 mb-8">We&apos;ve filed the appropriate forms.</p>
        <Link href="/sanctuary">
          <a className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-all">
            ← Return to the Sanctuary
          </a>
        </Link>
      </div>
    </div>
  );
}
