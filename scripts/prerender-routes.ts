/**
 * GestaltView Prerender Route Registry
 * ─────────────────────────────────────
 * Single source of truth for all routes that get statically
 * pre-rendered at build time so search crawlers see full
 * HTML content (including H1 tags) without running JavaScript.
 *
 * Add new routes here as you create new pages.
 */
export const PRERENDER_ROUTES: string[] = [
  // ── Core pages ──────────────────────────────────────────────
  "/",
  "/engine",
  "/brain-sparks",
  "/museum",
  "/ethics-framework",
  "/collaboration-proof",
  "/resonance-loop",
  "/musical-dna",
  "/orientation",
  "/billy",
  "/codex",
  "/record",
  "/tribunal",
  "/exhibits",

  // ── Legal / utility ─────────────────────────────────────────
  "/privacy",
  "/terms",
  "/faq",

  // ── Exhibit aliases (redirect pages) ────────────────────────
  "/adhd-powerup",
  "/symbiocoder",
  "/addiction-recovery",
  "/alzheimers-legacy",
  "/vibe-coder",
  "/ai-collab-engine",
  "/creation-corner",
  "/interactive-tapestry",
  "/insight-bot",
];
