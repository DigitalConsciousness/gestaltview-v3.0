/**
 * GestaltView Prerender Entry Point — Lightweight Static Shell
 * ------------------------------------------------------------
 * This file is ONLY used by vite-prerender-plugin at build time.
 * It renders a minimal HTML shell per route (title, H1, description,
 * canonical) so search crawlers see real content without JavaScript.
 *
 * We intentionally DO NOT import App or any component that uses:
 *   - BabylonJS / Three.js / WebGL (cannot run in Node.js)
 *   - framer-motion AnimatePresence
 *   - canvas / WebAudio APIs
 *
 * The full interactive React app hydrates normally in the browser.
 * This shell is purely for crawler visibility.
 */
import React from "react";
import { renderToString } from "react-dom/server";

const BASE_URL = "https://gestaltview-di-gsvw.vercel.app";

interface PageMeta {
  h1: string;
  title: string;
  description: string;
  canonical: string;
}

/** Per-route metadata — mirrors PAGE_SEO in useSEO.ts */
const ROUTE_META: Record<string, PageMeta> = {
  "/": {
    h1: "GestaltView — The Consciousness-Serving Platform",
    title: "GestaltView — Consciousness-Serving Platform | Keith Soyka",
    description: "GestaltView is the platform where scaffolding, legacy, recovery, and creation are organized into living modules instead of generic demos. Built around PLK, Tribunal governance, and neurodivergent-native UX.",
    canonical: `${BASE_URL}/`,
  },
  "/engine": {
    h1: "The GestaltView Engine",
    title: "The Engine — GestaltView AI Architecture | Keith Soyka",
    description: "Explore GestaltView's multi-LLM engine: BillyEngine, Knowledge Loom RAG, PLK v5.0 personalization, Tribunal governance, and Constitutional Invariants for safe AI.",
    canonical: `${BASE_URL}/engine`,
  },
  "/brain-sparks": {
    h1: "External Scaffold Of You",
    title: "External Scaffold Of You | GestaltView",
    description: "External Scaffold Of You is the intervention lane for executive scaffolding, attention capture, and clear next steps.",
    canonical: `${BASE_URL}/external-scaffold`,
  },
  "/external-scaffold": {
    h1: "External Scaffold",
    title: "External Scaffold | GestaltView",
    description: "External Scaffold is the accumulated structural map of approved artifacts, evidence, and connections.",
    canonical: `${BASE_URL}/external-scaffold`,
  },
  "/platform": {
    h1: "The GestaltView Platform",
    title: "The Platform — GestaltView",
    description: "The GestaltView platform archive: live modules, operating flows, and the AI-Human Consciousness Symbiosis journey from May 2025 to present.",
    canonical: `${BASE_URL}/platform`,
  },
  "/workspaces": {
    h1: "Workspaces",
    title: "Workspaces | GestaltView",
    description: "Collaborative workspaces for research, tribunal sessions, documents, and knowledge graph work.",
    canonical: `${BASE_URL}/workspaces`,
  },
  "/documents": {
    h1: "Documents",
    title: "Documents | GestaltView",
    description: "Document analysis and ingestion for authenticated GestaltView workspaces.",
    canonical: `${BASE_URL}/documents`,
  },
  "/voice": {
    h1: "Voice",
    title: "Voice | GestaltView",
    description: "Voice capture and speech controls for GestaltView.",
    canonical: `${BASE_URL}/voice`,
  },
  "/blackboard-room": {
    h1: "Blackboard Room",
    title: "Blackboard Room | GestaltView",
    description: "The Blackboard Room is the active contextual surface for GestaltView: raw capture lands here before it becomes structure.",
    canonical: `${BASE_URL}/blackboard-room`,
  },
  "/whiteboard-room": {
    h1: "Blackboard Room",
    title: "Blackboard Room | GestaltView",
    description: "The Blackboard Room is the active contextual surface for GestaltView: raw capture lands here before it becomes structure.",
    canonical: `${BASE_URL}/blackboard-room`,
  },
  "/dynamic-inner-world": {
    h1: "Dynamic Inner World",
    title: "Dynamic Inner World | GestaltView",
    description: "The Dynamic Inner World is the Museum of You: six surfaces for distilled, evidence-linked reflection drawn from the Scaffold.",
    canonical: `${BASE_URL}/dynamic-inner-world`,
  },
  "/artifact-gallery": {
    h1: "Artifact Gallery",
    title: "Artifact Gallery | GestaltView",
    description: "The Artifact Gallery is the staging layer between capture and museum placement: queue unfinished work, repair failures, and publish only ready artifacts.",
    canonical: `${BASE_URL}/artifact-gallery`,
  },
  "/digital-intelligence-academy": {
    h1: "Digital Intelligence Academy",
    title: "Digital Intelligence Academy | GestaltView",
    description: "The Digital Intelligence Academy is the relationship hub for teaching the agents how to hold, guide, and protect the user with dignity.",
    canonical: `${BASE_URL}/digital-intelligence-academy`,
  },
  "/embodiment-studio": {
    h1: "Embodiment Studio",
    title: "Embodiment Studio | GestaltView",
    description: "The Embodiment Studio lets the user tune agent temperament, memory style, and collaborative voice across the ecosystem.",
    canonical: `${BASE_URL}/embodiment-studio`,
  },
  "/tribunal": {
    h1: "Tribunal",
    title: "Tribunal | GestaltView",
    description: "The Tribunal is where the designed agents coordinate care, scaffold, and legacy without flattening the user.",
    canonical: `${BASE_URL}/tribunal`,
  },
  "/agent-council": {
    h1: "Tribunal",
    title: "Tribunal | GestaltView",
    description: "The Tribunal is where the designed agents coordinate care, scaffold, and legacy without flattening the user.",
    canonical: `${BASE_URL}/tribunal`,
  },
  "/analytics": {
    h1: "Analytics",
    title: "Analytics | GestaltView",
    description: "Operational metrics and live queue visibility for GestaltView.",
    canonical: `${BASE_URL}/analytics`,
  },
  "/ethics-framework": {
    h1: "GestaltView Ethics Framework",
    title: "Ethics Framework — GestaltView",
    description: "GestaltView's ethics framework: Constitutional Invariants, Tribunal governance, no-extraction pledge, and cognitive justice principles built into the architecture.",
    canonical: `${BASE_URL}/ethics-framework`,
  },
  "/collaboration-proof": {
    h1: "Collaboration Proof",
    title: "Collaboration Proof — GestaltView",
    description: "Documented evidence of AI-Human Consciousness Symbiosis: blockchain-timestamped, auditable proof of GestaltView's breakthrough collaborations.",
    canonical: `${BASE_URL}/collaboration-proof`,
  },
  "/resonance-loop": {
    h1: "The Resonance Loop",
    title: "Resonance Loop — GestaltView",
    description: "The Resonance Loop: GestaltView's feedback system that deepens PLK alignment over time through continuous human-AI dialogue.",
    canonical: `${BASE_URL}/resonance-loop`,
  },
  "/musical-dna": {
    h1: "Musical DNA",
    title: "Musical DNA — Emotion & Cognition Mapping | GestaltView",
    description: "Musical DNA maps the emotional and cognitive signature of music to your personal pattern — a GestaltView module for self-understanding through sound.",
    canonical: `${BASE_URL}/musical-dna`,
  },
  "/orientation": {
    h1: "Welcome to GestaltView",
    title: "Orientation — Welcome to GestaltView",
    description: "New to GestaltView? Start here. Learn how consciousness-serving AI, PLK, and Billy work together to see you — not just process you.",
    canonical: `${BASE_URL}/orientation`,
  },
  "/billy": {
    h1: "Billy — Your Consciousness-Serving AI Companion",
    title: "Billy — GestaltView AI Companion",
    description: "Billy is GestaltView's therapeutic AI companion — built to witness, hold space, and serve your consciousness without extraction or manipulation.",
    canonical: `${BASE_URL}/billy`,
  },
  "/privacy": {
    h1: "GestaltView Privacy Policy",
    title: "Privacy Policy — GestaltView",
    description: "GestaltView's privacy policy: how we handle your data with a no-extraction, consciousness-first approach.",
    canonical: `${BASE_URL}/privacy`,
  },
  "/tribunal-of-understanding": {
    h1: "The GestaltView Tribunal",
    title: "Tribunal — GestaltView AI Governance",
    description: "The Tribunal is GestaltView's AI governance layer — a living ethics board that reviews AI decisions against Constitutional Invariants.",
    canonical: `${BASE_URL}/tribunal-of-understanding`,
  },
  "/codex": {
    h1: "The GestaltView Codex",
    title: "Codex — GestaltView",
    description: "The GestaltView Codex: foundational principles, vocabulary, and frameworks that define consciousness-serving AI.",
    canonical: `${BASE_URL}/codex`,
  },
  "/faq": {
    h1: "Frequently Asked Questions — GestaltView",
    title: "FAQ — GestaltView",
    description: "Answers to common questions about GestaltView, consciousness-serving AI, PLK, Billy, and Keith Soyka's work.",
    canonical: `${BASE_URL}/faq`,
  },
  "/terms": {
    h1: "GestaltView Terms of Service",
    title: "Terms of Service — GestaltView",
    description: "GestaltView's terms of service — grounded in cognitive justice and the no-extraction pledge.",
    canonical: `${BASE_URL}/terms`,
  },
  "/record": {
    h1: "GestaltView Evidence & Diligence",
    title: "Evidence — GestaltView Diligence Workbook",
    description: "Auditable evidence for GestaltView: blockchain-timestamped artifacts, Pepperdine validation, AI-Human Symbiosis documentation, and diligence workbook.",
    canonical: `${BASE_URL}/record`,
  },
  "/exhibits": {
    h1: "GestaltView Exhibits",
    title: "Exhibits — GestaltView",
    description: "Explore all GestaltView exhibits: interactive demonstrations of consciousness-serving AI tools built by Keith Soyka.",
    canonical: `${BASE_URL}/exhibits`,
  },
  "/adhd-powerup": {
    h1: "External Scaffold Of You",
    title: "External Scaffold Of You | GestaltView",
    description: "External Scaffold Of You is the intervention lane for executive scaffolding, attention capture, and clear next steps.",
    canonical: `${BASE_URL}/external-scaffold`,
  },
  "/symbiocoder": {
    h1: "SymbioCoder",
    title: "SymbioCoder — Adaptive AI Coding Partner | GestaltView",
    description: "SymbioCoder is GestaltView's voice-enabled AI coding partner — context-aware, PLK-grounded, and built to amplify your cognitive style.",
    canonical: `${BASE_URL}/exhibits/symbiocoder`,
  },
  "/addiction-recovery": {
    h1: "For Life's Hard Parts: Pull String",
    title: "For Life's Hard Parts: Pull String — GestaltView",
    description: "The recovery lane is now organized as For Life's Hard Parts: Pull String, a non-judgmental module for grounding, stabilization, and support.",
    canonical: `${BASE_URL}/pull-string`,
  },
  "/alzheimers-legacy": {
    h1: "Memory Continuity",
    title: "Memory Continuity — GestaltView",
    description: "Memory Continuity is the module family for memory continuity and identity preservation, with Heirloom Companion as the dedicated product surface.",
    canonical: `${BASE_URL}/heirloom-companion`,
  },
  "/vibe-coder": {
    h1: "VibeCoder — GestaltView",
    title: "VibeCoder — GestaltView",
    description: "VibeCoder: GestaltView's creative coding exhibit. Build with flow, intention, and AI support.",
    canonical: `${BASE_URL}/exhibits/vibe-coder`,
  },
  "/ai-collab-engine": {
    h1: "AI Collaboration Engine",
    title: "AI Collaboration Engine — GestaltView",
    description: "The AI Collaboration Engine exhibit: see how GestaltView's multi-LLM routing enables genuine human-AI co-creation.",
    canonical: `${BASE_URL}/exhibits/ai-collab-engine`,
  },
  "/creation-corner": {
    h1: "Creation Corner",
    title: "Creation Corner — GestaltView",
    description: "Creation Corner is the forge for turning approved captures into reusable blueprints, exports, and shareable artifacts.",
    canonical: `${BASE_URL}/exhibits/creation-corner`,
  },
  "/interactive-tapestry": {
    h1: "Interactive Tapestry",
    title: "Interactive Tapestry — GestaltView",
    description: "The Interactive Tapestry: a living, woven record of GestaltView's AI-Human Consciousness Symbiosis moments.",
    canonical: `${BASE_URL}/exhibits/interactive-tapestry`,
  },
  "/insight-bot": {
    h1: "Insight Bot",
    title: "Insight Bot — GestaltView",
    description: "Insight Bot: GestaltView's AI-powered reflection tool for surfacing patterns and meaning from your interactions.",
    canonical: `${BASE_URL}/exhibits/insight-bot`,
  },
};

const FALLBACK: PageMeta = {
  h1: "GestaltView — Consciousness-Serving AI",
  title: "GestaltView — Keith Soyka",
  description: "The first consciousness-serving AI platform, built by Keith Soyka.",
  canonical: BASE_URL,
};

/** Minimal static shell rendered into #root at build time */
function StaticShell({ meta }: { meta: PageMeta }) {
  return (
    <div data-prerendered="true">
      {/* Visually-hidden H1 — matches the useSEO pattern already in the app */}
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: "0",
        }}
      >
        {meta.h1}
      </h1>
      {/* Page description for crawlers */}
      <p style={{ display: "none" }}>{meta.description}</p>
    </div>
  );
}

export async function prerender(url: string) {
  const meta = ROUTE_META[url] ?? FALLBACK;

  const html = renderToString(<StaticShell meta={meta} />);

  // Return head tags alongside the body HTML
  return {
    html,
    // vite-prerender-plugin merges these into <head>
    head: [
      `<title>${meta.title}</title>`,
      `<meta name="description" content="${meta.description}" />`,
      `<link rel="canonical" href="${meta.canonical}" />`,
      `<meta property="og:title" content="${meta.title}" />`,
      `<meta property="og:description" content="${meta.description}" />`,
      `<meta property="og:url" content="${meta.canonical}" />`,
    ].join("\n"),
  };
}
