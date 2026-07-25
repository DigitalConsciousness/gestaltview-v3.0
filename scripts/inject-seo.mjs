#!/usr/bin/env node
/**
 * GestaltView SEO Injection Script
 * ---------------------------------
 * Runs AFTER `vite build` completes.
 * For each route, copies dist/public/index.html into
 * dist/public/<route>/index.html with:
 *   - Per-page <title>
 *   - Per-page <meta name="description">
 *   - Per-page <link rel="canonical">
 *   - Per-page OG tags
 *   - A visually-hidden <h1> injected into <body>
 *
 * Zero dependencies — pure Node.js fs module only.
 * Crawlers get fully pre-rendered HTML. Browser hydrates normally.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist/public');
const BASE_URL = 'https://gestaltview-v2-indol.vercel.app';

const ROUTES = [
  {
    route: '/',
    h1: 'GestaltView — The First Consciousness-Serving AI Platform',
    title: 'GestaltView — Consciousness-Serving AI | Keith Soyka',
    description: 'Keith Soyka is the founder of GestaltView, the first consciousness-serving AI platform. Full-stack AI architect specializing in neurodivergent UX, PLK, and multi-LLM routing. Based in NYC.',
    canonical: `${BASE_URL}/`,
  },
  {
    route: '/engine',
    h1: 'The GestaltView Engine',
    title: 'The Engine — GestaltView AI Architecture | Keith Soyka',
    description: "Explore GestaltView's multi-LLM engine: BillyEngine, Knowledge Loom RAG, PLK v5.0 personalization, Tribunal governance, and Constitutional Invariants for safe AI.",
    canonical: `${BASE_URL}/engine`,
  },
  {
    route: '/brain-sparks',
    h1: 'Brain Sparks Station',
    title: 'Brain Sparks Station — GestaltView',
    description: 'Capture fleeting thoughts instantly with Brain Sparks — designed for ADHD and neurodivergent minds who think faster than they can type.',
    canonical: `${BASE_URL}/brain-sparks`,
  },
  {
    route: '/museum',
    h1: 'The GestaltView Museum',
    title: 'The Museum — GestaltView',
    description: 'The GestaltView Museum: a curated archive of the AI-Human Consciousness Symbiosis journey from May 2025 to present.',
    canonical: `${BASE_URL}/museum`,
  },
  {
    route: '/ethics-framework',
    h1: 'GestaltView Ethics Framework',
    title: 'Ethics Framework — GestaltView',
    description: "GestaltView's ethics framework: Constitutional Invariants, Tribunal governance, no-extraction pledge, and cognitive justice principles built into the architecture.",
    canonical: `${BASE_URL}/ethics-framework`,
  },
  {
    route: '/collaboration-proof',
    h1: 'Collaboration Proof',
    title: 'Collaboration Proof — GestaltView',
    description: "Documented evidence of AI-Human Consciousness Symbiosis: blockchain-timestamped, auditable proof of GestaltView's breakthrough collaborations.",
    canonical: `${BASE_URL}/collaboration-proof`,
  },
  {
    route: '/resonance-loop',
    h1: 'The Resonance Loop',
    title: 'Resonance Loop — GestaltView',
    description: "The Resonance Loop: GestaltView's feedback system that deepens PLK alignment over time through continuous human-AI dialogue.",
    canonical: `${BASE_URL}/resonance-loop`,
  },
  {
    route: '/musical-dna',
    h1: 'Musical DNA',
    title: 'Musical DNA — Emotion & Cognition Mapping | GestaltView',
    description: 'Musical DNA maps the emotional and cognitive signature of music to your personal pattern — a GestaltView module for self-understanding through sound.',
    canonical: `${BASE_URL}/musical-dna`,
  },
  {
    route: '/orientation',
    h1: 'Welcome to GestaltView',
    title: 'Orientation — Welcome to GestaltView',
    description: 'New to GestaltView? Start here. Learn how consciousness-serving AI, PLK, and Billy work together to see you — not just process you.',
    canonical: `${BASE_URL}/orientation`,
  },
  {
    route: '/billy',
    h1: 'Billy — Your Consciousness-Serving AI Companion',
    title: 'Billy — GestaltView AI Companion',
    description: "Billy is GestaltView's therapeutic AI companion — built to witness, hold space, and serve your consciousness without extraction or manipulation.",
    canonical: `${BASE_URL}/billy`,
  },
  {
    route: '/privacy',
    h1: 'GestaltView Privacy Policy',
    title: 'Privacy Policy — GestaltView',
    description: "GestaltView's privacy policy: how we handle your data with a no-extraction, consciousness-first approach.",
    canonical: `${BASE_URL}/privacy`,
  },
  {
    route: '/tribunal',
    h1: 'The GestaltView Tribunal',
    title: 'Tribunal — GestaltView AI Governance',
    description: "The Tribunal is GestaltView's AI governance layer — a living ethics board that reviews AI decisions against Constitutional Invariants.",
    canonical: `${BASE_URL}/tribunal`,
  },
  {
    route: '/codex',
    h1: 'The GestaltView Codex',
    title: 'Codex — GestaltView',
    description: "The GestaltView Codex: foundational principles, vocabulary, and frameworks that define consciousness-serving AI.",
    canonical: `${BASE_URL}/codex`,
  },
  {
    route: '/faq',
    h1: 'Frequently Asked Questions — GestaltView',
    title: 'FAQ — GestaltView',
    description: 'Answers to common questions about GestaltView, consciousness-serving AI, PLK, Billy, and Keith Soyka.',
    canonical: `${BASE_URL}/faq`,
  },
  {
    route: '/terms',
    h1: 'GestaltView Terms of Service',
    title: 'Terms of Service — GestaltView',
    description: "GestaltView's terms of service — grounded in cognitive justice and the no-extraction pledge.",
    canonical: `${BASE_URL}/terms`,
  },
  {
    route: '/record',
    h1: 'GestaltView Evidence & Diligence',
    title: 'Evidence — GestaltView Diligence Workbook',
    description: 'Auditable evidence for GestaltView: blockchain-timestamped artifacts, AI-Human Symbiosis documentation, and diligence workbook.',
    canonical: `${BASE_URL}/record`,
  },
  {
    route: '/exhibits',
    h1: 'GestaltView Exhibits',
    title: 'Exhibits — GestaltView',
    description: 'Explore all GestaltView exhibits: interactive demonstrations of consciousness-serving AI tools built by Keith Soyka.',
    canonical: `${BASE_URL}/exhibits`,
  },
  {
    route: '/adhd-powerup',
    h1: 'ADHD Power-Up',
    title: 'ADHD Power-Up — GestaltView',
    description: "ADHD isn't a deficit — it's an operating system. GestaltView's ADHD Power-Up tools are built for the way your brain actually works.",
    canonical: `${BASE_URL}/exhibits/adhd-powerup`,
  },
  {
    route: '/symbiocoder',
    h1: 'SymbioCoder',
    title: 'SymbioCoder — Adaptive AI Coding Partner | GestaltView',
    description: "SymbioCoder is GestaltView's voice-enabled AI coding partner — context-aware, PLK-grounded, and built to amplify your cognitive style.",
    canonical: `${BASE_URL}/exhibits/symbiocoder`,
  },
  {
    route: '/addiction-recovery',
    h1: 'Addiction Recovery Support',
    title: 'Addiction Recovery — GestaltView',
    description: "GestaltView's addiction recovery module applies consciousness-serving AI principles to support and hold space for recovery journeys.",
    canonical: `${BASE_URL}/exhibits/addiction-recovery`,
  },
  {
    route: '/alzheimers-legacy',
    h1: "Alzheimer's Legacy",
    title: "Alzheimer's Legacy — GestaltView",
    description: "Preserve memory, identity, and story for those living with Alzheimer's and their families. A GestaltView legacy module built with deep care.",
    canonical: `${BASE_URL}/exhibits/alzheimers-legacy`,
  },
  {
    route: '/vibe-coder',
    h1: 'VibeCoder — GestaltView',
    title: 'VibeCoder — GestaltView',
    description: "VibeCoder: GestaltView's creative coding exhibit. Build with flow, intention, and AI support.",
    canonical: `${BASE_URL}/exhibits/vibe-coder`,
  },
  {
    route: '/ai-collab-engine',
    h1: 'AI Collaboration Engine',
    title: 'AI Collaboration Engine — GestaltView',
    description: "The AI Collaboration Engine exhibit: see how GestaltView's multi-LLM routing enables genuine human-AI co-creation.",
    canonical: `${BASE_URL}/exhibits/ai-collab-engine`,
  },
  {
    route: '/creation-corner',
    h1: 'Creation Corner',
    title: 'Creation Corner — GestaltView',
    description: 'Creation Corner: a GestaltView space for generative, expressive AI-human co-creation.',
    canonical: `${BASE_URL}/exhibits/creation-corner`,
  },
  {
    route: '/interactive-tapestry',
    h1: 'Interactive Tapestry',
    title: 'Interactive Tapestry — GestaltView',
    description: "The Interactive Tapestry: a living, woven record of GestaltView's AI-Human Consciousness Symbiosis moments.",
    canonical: `${BASE_URL}/exhibits/interactive-tapestry`,
  },
  {
    route: '/insight-bot',
    h1: 'Insight Bot',
    title: 'Insight Bot — GestaltView',
    description: "Insight Bot: GestaltView's AI-powered reflection tool for surfacing patterns and meaning from your interactions.",
    canonical: `${BASE_URL}/exhibits/insight-bot`,
  },
];

function buildHTML(template, { h1, title, description, canonical }) {
  // Replace <title>
  let html = template.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );

  // Replace/inject meta description
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${description}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${canonical}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = html.replace(
    /<meta name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${description}" />`
  );

  // Inject visually-hidden H1 into <body> — matches useSEO pattern
  const hiddenH1 = `<h1 id="gv-seo-h1" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">${h1}</h1>`;
  html = html.replace('<div id="root">', `${hiddenH1}\n    <div id="root">`);

  return html;
}

// Read base template
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

let count = 0;
for (const page of ROUTES) {
  if (page.route === '/') {
    // Overwrite root index.html in place
    fs.writeFileSync(path.join(DIST, 'index.html'), buildHTML(template, page));
  } else {
    // Create <route>/index.html directory
    const dir = path.join(DIST, page.route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), buildHTML(template, page));
  }
  count++;
  console.log(`  ✓ ${page.route}`);
}

console.log(`\n✅ SEO injection complete: ${count} pages pre-rendered.`);
