/**
 * useSEO — GestaltView per-page SEO & H1 hook
 * 2026 Keith Soyka / GestaltView
 */

import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  h1: string;
  canonical?: string;
  ogImage?: string;
}

const BASE_URL = 'https://gestaltview-di-gsvw.vercel.app';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const H1_ID = 'gv-seo-h1';

function upsertMeta(selector: string, attr: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const parts = selector.match(/\[([^=]+)=["']?([^"'\]]+)["']?\]/);
    if (parts) el.setAttribute(parts[1], parts[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function upsertLink(rel: string, value: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = value;
}

export function useSEO({ title, description, h1, canonical, ogImage }: SEOProps) {
  useEffect(() => {
    const prevTitle = document.title;
    const prevDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? '';
    const prevCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? '';
    const prevOgTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content ?? '';
    const prevOgDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content ?? '';
    const prevOgUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content ?? '';
    const prevTwTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content ?? '';
    const prevTwDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.content ?? '';

    document.title = title;
    upsertMeta('meta[name="description"]', 'content', description);
    upsertLink('canonical', canonical ?? `${BASE_URL}/`);
    upsertMeta('meta[property="og:title"]', 'content', title);
    upsertMeta('meta[property="og:description"]', 'content', description);
    upsertMeta('meta[property="og:url"]', 'content', canonical ?? BASE_URL);
    upsertMeta('meta[property="og:image"]', 'content', ogImage ?? DEFAULT_OG_IMAGE);
    upsertMeta('meta[name="twitter:title"]', 'content', title);
    upsertMeta('meta[name="twitter:description"]', 'content', description);

    document.getElementById(H1_ID)?.remove();
    const h1El = document.createElement('h1');
    h1El.id = H1_ID;
    h1El.textContent = h1;
    h1El.style.cssText = [
      'position:absolute',
      'width:1px',
      'height:1px',
      'padding:0',
      'margin:-1px',
      'overflow:hidden',
      'clip:rect(0,0,0,0)',
      'white-space:nowrap',
      'border:0',
    ].join(';');
    document.body.prepend(h1El);

    return () => {
      document.title = prevTitle;
      upsertMeta('meta[name="description"]', 'content', prevDesc);
      upsertLink('canonical', prevCanonical);
      upsertMeta('meta[property="og:title"]', 'content', prevOgTitle);
      upsertMeta('meta[property="og:description"]', 'content', prevOgDesc);
      upsertMeta('meta[property="og:url"]', 'content', prevOgUrl);
      upsertMeta('meta[name="twitter:title"]', 'content', prevTwTitle);
      upsertMeta('meta[name="twitter:description"]', 'content', prevTwDesc);
      document.getElementById(H1_ID)?.remove();
    };
  }, [title, description, h1, canonical, ogImage]);
}

export const PAGE_SEO: Record<string, SEOProps> = {
  home: {
    title: 'GestaltView — Consciousness-Serving Platform | Keith Soyka',
    description: 'GestaltView is a consciousness-serving runtime for capture, reflection, synthesis, and creation. Start in the Blackboard Room or Sanctuary to enter the live flow.',
    h1: 'GestaltView — The Consciousness-Serving Platform',
    canonical: `${BASE_URL}/`,
  },
  engine: {
    title: 'The Engine — GestaltView AI Architecture | Keith Soyka',
    description: 'Explore GestaltView\'s multi-LLM engine: BillyEngine, Knowledge Loom RAG, PLK v5.0 personalization, Tribunal governance, and Constitutional Invariants for safe AI.',
    h1: 'The GestaltView Engine',
    canonical: `${BASE_URL}/engine`,
  },
  orientation: {
    title: 'Orientation — Welcome to GestaltView',
    description: 'A plain-language entry point to GestaltView: what it is, what exists today, how the user moves through the rooms, and what Billy does and does not do.',
    h1: 'Welcome to GestaltView',
    canonical: `${BASE_URL}/orientation`,
  },
  brainSparks: {
    title: 'External Scaffold Of You | GestaltView',
    description: 'External Scaffold Of You is the intervention lane for executive scaffolding, attention capture, and clear next steps.',
    h1: 'External Scaffold Of You',
    canonical: `${BASE_URL}/external-scaffold`,
  },
  brainSparksStation: {
    title: 'External Scaffold Of You — Live Thought Capture | GestaltView',
    description: 'Experience Keith\'s lightning bolt thought capture system as part of the External Scaffold Of You module family. PLK pattern analysis in real time.',
    h1: 'Brain Sparks Station',
    canonical: `${BASE_URL}/brain-sparks-station`,
  },
  adhdPowerUp: {
    title: 'External Scaffold Of You | GestaltView',
    description: 'External Scaffold Of You is the intervention lane for executive scaffolding, attention capture, and clear next steps.',
    h1: 'External Scaffold Of You',
    canonical: `${BASE_URL}/external-scaffold`,
  },
  symbiocoder: {
    title: 'SymbioCoder — Adaptive AI Coding Partner | GestaltView',
    description: 'SymbioCoder is GestaltView\'s voice-enabled AI coding partner — context-aware, PLK-grounded, and built to amplify your cognitive style instead of flattening it.',
    h1: 'SymbioCoder',
    canonical: `${BASE_URL}/symbiocoder`,
  },
  vibeCoder: {
    title: 'VibeCoder — Translate Your Vibe Into Code | GestaltView',
    description: 'VibeCoder translates beautiful chaos into brilliant code. Choose your coding companion and describe the vibe — GestaltView does the rest.',
    h1: 'VibeCoder',
    canonical: `${BASE_URL}/vibe-coder`,
  },
  musicalDNA: {
    title: 'Musical DNA — Emotion & Cognition Mapping | GestaltView',
    description: 'Musical DNA maps the emotional and cognitive signature of music to your personal pattern — a GestaltView module for self-understanding through sound.',
    h1: 'Musical DNA',
    canonical: `${BASE_URL}/musical-dna`,
  },
  sanctuary: {
    title: 'The Sanctuary | GestaltView',
    description: 'The Sanctuary is a private room for restoration, writing, and quiet presence. Nothing leaves without your say.',
    h1: 'The Sanctuary',
    canonical: `${BASE_URL}/sanctuary`,
  },
  profile: {
    title: 'Profile Room | GestaltView',
    description: 'The Profile Room holds your account-bound identity context, live portrait, and founder profile ingest flow.',
    h1: 'Profile Room',
    canonical: `${BASE_URL}/profile`,
  },
  blackboardRoom: {
    title: 'Blackboard Room | GestaltView',
    description: 'The Blackboard Room is the active capture room for GestaltView: raw material lands here before it becomes structure.',
    h1: 'Blackboard Room',
    canonical: `${BASE_URL}/blackboard-room`,
  },
  whiteboardRoom: {
    title: 'Blackboard Room | GestaltView',
    description: 'The Blackboard Room is the active contextual surface for GestaltView: raw capture lands here before it becomes structure.',
    h1: 'Blackboard Room',
    canonical: `${BASE_URL}/blackboard-room`,
  },
  dynamicInnerWorld: {
    title: 'Dynamic Inner World | GestaltView',
    description: 'The Dynamic Inner World is the Museum of You: finished artifacts stay alive here, with remembered context and curator access.',
    h1: 'Dynamic Inner World',
    canonical: `${BASE_URL}/dynamic-inner-world`,
  },
  artifactGallery: {
    title: 'Artifact Gallery | GestaltView',
    description: 'The Artifact Gallery is the staging layer between capture and museum placement: queue unfinished work, repair failures, and publish only ready artifacts.',
    h1: 'Artifact Gallery',
    canonical: `${BASE_URL}/artifact-gallery`,
  },
  externalScaffold: {
    title: 'External Scaffold | GestaltView',
    description: 'External Scaffold is the accumulated structural map of approved artifacts and connections.',
    h1: 'External Scaffold',
    canonical: `${BASE_URL}/external-scaffold`,
  },
  creationCorner: {
    title: 'Creation Corner | GestaltView',
    description: 'Creation Corner turns blueprints into tangible artifacts, exports, and shareable outputs.',
    h1: 'Creation Corner',
    canonical: `${BASE_URL}/creation-corner`,
  },
  origin: {
    title: 'Origin Story | GestaltView',
    description: 'Origin Story traces how GestaltView took shape and how the platform preserves the founder’s own language, evidence, and continuity.',
    h1: 'Origin Story',
    canonical: `${BASE_URL}/origin`,
  },
  sandbox: {
    title: 'Multi-Modal Sandbox | GestaltView',
    description: 'Experiment with HTML/JS, Python, and Three.js in a sandboxed live preview.',
    h1: 'Multi-Modal Sandbox',
    canonical: `${BASE_URL}/app/sandbox`,
  },
  dashboard: {
    title: 'Your Manifest | GestaltView',
    description: 'Your Manifest is the founder control plane for GestaltView: live Billy runtime, admin overrides, memory entries, and system health in one place.',
    h1: 'Your Manifest',
    canonical: `${BASE_URL}/dashboard`,
  },
  fileExplorer: {
    title: 'File Explorer | GestaltView',
    description: 'File Explorer is the central library for uploaded files, previews, and room-linked materials.',
    h1: 'File Explorer',
    canonical: `${BASE_URL}/documents`,
  },
  digitalIntelligenceAcademy: {
    title: 'Digital Intelligence Academy | GestaltView',
    description: 'The Digital Intelligence Academy is the relationship hub for teaching the agents how to hold, guide, and protect the user with dignity.',
    h1: 'Digital Intelligence Academy',
    canonical: `${BASE_URL}/digital-intelligence-academy`,
  },
  embodimentStudio: {
    title: 'Embodiment Studio | GestaltView',
    description: 'The Embodiment Studio lets the user tune agent temperament, memory style, and collaborative voice across the ecosystem.',
    h1: 'Embodiment Studio',
    canonical: `${BASE_URL}/embodiment-studio`,
  },
  tribunal: {
    title: 'Tribunal | GestaltView',
    description: 'The Tribunal is where the designed agents coordinate care, scaffold, and legacy without flattening the user.',
    h1: 'Tribunal',
    canonical: `${BASE_URL}/tribunal`,
  },
  tribunalOfUnderstanding: {
    title: 'Tribunal — GestaltView AI Governance',
    description: "The Tribunal is GestaltView's AI governance layer — a living ethics board that reviews AI decisions against Constitutional Invariants.",
    h1: 'The GestaltView Tribunal',
    canonical: `${BASE_URL}/tribunal-of-understanding`,
  },
  agentCouncil: {
    title: 'Tribunal | GestaltView',
    description: 'The Tribunal is where the designed agents coordinate care, scaffold, and legacy without flattening the user.',
    h1: 'Tribunal',
    canonical: `${BASE_URL}/tribunal`,
  },
  platform: {
    title: 'The Platform — GestaltView',
    description: 'The GestaltView platform archive: live modules, operating flows, and the AI-Human Consciousness Symbiosis journey from May 2025 to present.',
    h1: 'The GestaltView Platform',
    canonical: `${BASE_URL}/platform`,
  },
  workspaces: {
    title: 'Workspaces | GestaltView',
    description: 'Collaborative workspaces for research, tribunal sessions, documents, and knowledge graph work.',
    h1: 'Workspaces',
    canonical: `${BASE_URL}/workspaces`,
  },
  documents: {
    title: 'Documents | GestaltView',
    description: 'Document analysis and ingestion for authenticated GestaltView workspaces.',
    h1: 'Documents',
    canonical: `${BASE_URL}/documents`,
  },
  voice: {
    title: 'Voice | GestaltView',
    description: 'Voice capture and speech controls for GestaltView.',
    h1: 'Voice',
    canonical: `${BASE_URL}/voice`,
  },
  analytics: {
    title: 'Analytics | GestaltView',
    description: 'Operational metrics and live queue visibility for GestaltView.',
    h1: 'Analytics',
    canonical: `${BASE_URL}/analytics`,
  },
  founderRuntime: {
    title: 'Founder Manifest | GestaltView',
    description: 'Founder entry point for the live GestaltView manifest, Billy embodiment, and admin control surface.',
    h1: 'Founder Manifest',
    canonical: `${BASE_URL}/founder-runtime`,
  },
  addictionRecovery: {
    title: 'For Life\'s Hard Parts: Pull String — GestaltView',
    description: 'The recovery lane is now organized as For Life\'s Hard Parts: Pull String, a non-judgmental module for grounding, stabilization, and support.',
    h1: 'For Life\'s Hard Parts: Pull String',
    canonical: `${BASE_URL}/pull-string`,
  },
  alzheimers: {
    title: 'Memory Continuity — GestaltView',
    description: 'Memory Continuity is the module family for memory continuity and identity preservation, with Heirloom Companion as the dedicated product surface.',
    h1: 'Memory Continuity',
    canonical: `${BASE_URL}/heirloom-companion`,
  },
  ethics: {
    title: 'Ethics Framework — GestaltView',
    description: 'GestaltView\'s ethics framework: Constitutional Invariants, Tribunal governance, no-extraction pledge, and cognitive justice principles built into the architecture.',
    h1: 'GestaltView Ethics Framework',
    canonical: `${BASE_URL}/ethics-framework`,
  },
  collaborationProof: {
    title: 'Collaboration Proof — GestaltView',
    description: 'Documented evidence of AI-Human Consciousness Symbiosis: blockchain-timestamped, auditable proof of GestaltView\'s breakthrough collaborations.',
    h1: 'Collaboration Proof',
    canonical: `${BASE_URL}/collaboration-proof`,
  },
  resonanceLoop: {
    title: 'Resonance Loop — GestaltView',
    description: 'The Resonance Loop: GestaltView\'s feedback system that deepens PLK alignment over time through continuous human-AI dialogue.',
    h1: 'The Resonance Loop',
    canonical: `${BASE_URL}/resonance-loop`,
  },
  validationWall: {
    title: 'The 1-in-18.75 Quintillion Validation Wall — GestaltView',
    description: 'The statistical proof of GestaltView\'s emergence: a convergence equation showing the 1-in-18.75 quintillion probability of Keith Soyka\'s breakthrough.',
    h1: 'The Validation Wall',
    canonical: `${BASE_URL}/validation-wall`,
  },
  villageBuilders: {
    title: 'Village Builders Covenant — GestaltView',
    description: 'From professional displacement to collective renaissance. GestaltView\'s covenant for building villages of innovation where human wisdom thrives.',
    h1: 'The Village Builders Covenant',
    canonical: `${BASE_URL}/village-builders`,
  },
  metricsDashboard: {
    title: 'Metrics of Human Flourishing — GestaltView',
    description: 'GestaltView\'s proprietary metrics: Empathy Resonance Index, Cognitive Justice Quotient, PLK Conversational Resonance, and more — live dashboard.',
    h1: 'The Metrics of Human Flourishing',
    canonical: `${BASE_URL}/metrics-dashboard`,
  },
  schemaDashboard: {
    title: 'Schema Dashboard — GestaltView',
    description: 'Live Supabase schema visibility for the GestaltView database.',
    h1: 'Schema Dashboard',
    canonical: `${BASE_URL}/schema-dashboard`,
  },
  heirloomCompanion: {
    title: 'Heirloom Companion — GestaltView',
    description: 'Preserve the voice, warmth, and wisdom of loved ones with Alzheimer\'s. Heirloom Companion holds their echo with love — never as a replacement, always as a gift.',
    h1: 'Heirloom Companion',
    canonical: `${BASE_URL}/heirloom-companion`,
  },
  bucketDrops: {
    title: 'Bucket Drops — Sealed Messages of Love | GestaltView',
    description: 'Create blockchain-secured time capsule messages for the people you love. Bucket Drops release on your terms — a date, a milestone, a moment.',
    h1: 'Bucket Drops',
    canonical: `${BASE_URL}/bucket-drops`,
  },
  codex: {
    title: 'Continuum Codex — GestaltView',
    description: 'The GestaltView Continuum Codex: seven scrolls of core doctrine covering PLK, Tribunal governance, consciousness-serving AI principles, and cognitive justice.',
    h1: 'The GestaltView Continuum Codex',
    canonical: `${BASE_URL}/codex`,
  },
  continuumCodex: {
    title: 'The Continuum Codex — GestaltView Constitutional Principles',
    description: 'Read the six living constitutional principles that define the GestaltView platform: consciousness first, PLK sovereignty, Bucket Drop, mutual liberation, transparency, and biographical IP.',
    h1: 'The Continuum Codex',
    canonical: `${BASE_URL}/continuum-codex`,
  },
  faq: {
    title: 'FAQ — GestaltView',
    description: 'Answers to common questions about GestaltView, consciousness-serving AI, PLK, Billy, and Keith Soyka\'s work.',
    h1: 'Frequently Asked Questions — GestaltView',
    canonical: `${BASE_URL}/faq`,
  },
  terms: {
    title: 'Terms of Service — GestaltView',
    description: 'GestaltView\'s terms of service — grounded in cognitive justice and the no-extraction pledge.',
    h1: 'GestaltView Terms of Service',
    canonical: `${BASE_URL}/terms`,
  },
  privacy: {
    title: 'Privacy Policy — GestaltView',
    description: 'GestaltView\'s privacy policy: how we handle your data with a no-extraction, consciousness-first approach.',
    h1: 'GestaltView Privacy Policy',
    canonical: `${BASE_URL}/privacy`,
  },
  record: {
    title: 'Evidence — GestaltView Diligence Workbook',
    description: 'Auditable evidence for GestaltView: blockchain-timestamped artifacts, AI-Human Symbiosis documentation, and diligence workbook.',
    h1: 'GestaltView Evidence & Diligence',
    canonical: `${BASE_URL}/record`,
  },
  exhibits: {
    title: 'Exhibits — GestaltView',
    description: 'Explore all GestaltView exhibits: interactive demonstrations of consciousness-serving AI tools built by Keith Soyka.',
    h1: 'GestaltView Exhibits',
    canonical: `${BASE_URL}/exhibits`,
  },
  gravityInspector: {
    title: 'Gravity Inspector — GestaltView',
    description: 'Inspect stored Two-Pass Gravity reports, surface maps, and fragment rankings inside the GestaltView control plane.',
    h1: 'Gravity Inspector',
    canonical: `${BASE_URL}/gravity`,
  },
  billy: {
    title: 'Billy — GestaltView AI Companion',
    description: 'Billy is GestaltView\'s Digital Intelligence guide — built to witness, hold context, and stay helpful without extraction or manipulation.',
    h1: 'Billy — Your Consciousness-Serving AI Companion',
    canonical: `${BASE_URL}/billy`,
  },
  theHuman: {
    title: 'The Human — Keith Soyka | GestaltView',
    description: 'The story of Keith Soyka — solo founder, neurodivergent systems thinker, and architect of the first consciousness-serving AI platform.',
    h1: 'The Human Behind GestaltView',
    canonical: `${BASE_URL}/the-human`,
  },
  contact: {
    title: 'Contact Keith Soyka — GestaltView',
    description: 'Get in touch with Keith Soyka for GestaltView consulting, custom AI builds, organizational AI transformation, or partnership inquiries.',
    h1: 'Contact GestaltView',
    canonical: `${BASE_URL}/contact`,
  },
  services: {
    title: 'Services — GestaltView AI Consulting | Keith Soyka',
    description: 'GestaltView consulting services: Resume Rockstar sessions ($297), custom AI collaborator builds ($1.5k–$5k), and organizational AI transformation ($10k+).',
    h1: 'GestaltView Services',
    canonical: `${BASE_URL}/services`,
  },
  evidence: {
    title: 'Evidence — GestaltView Diligence Workbook',
    description: 'Auditable evidence for GestaltView: blockchain-timestamped artifacts, Pepperdine validation, AI-Human Symbiosis documentation, and diligence workbook.',
    h1: 'GestaltView Evidence & Diligence',
    canonical: `${BASE_URL}/evidence`,
  },
};
