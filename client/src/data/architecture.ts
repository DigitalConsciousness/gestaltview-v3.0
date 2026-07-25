/**
 * GestaltView Core Architecture and Component Ecosystem
 * Canonical 25-component registry — all 7 columns from the master table.
 *
 * Source: GestaltView Operational Bible Workbook · Table 1
 * Maintained by: Keith Soyka × Perplexity
 * Last updated: 2026-03-14
 *
 * DO NOT hardcode these values in UI components.
 * Import ARCHITECTURE_COMPONENTS and derive all display from this registry.
 */

export interface ArchitectureComponent {
  id: number;
  name: string;
  technologyLayer: string;
  primaryFunction: string;
  keyFeatureMechanism: string;
  targetProblemOutcome: string;
  governanceValidationStatus: string;
  sources: string;
  /** Derived exhibit slug if this component has a dedicated exhibit page */
  exhibitSlug?: string;
}

export const ARCHITECTURE_COMPONENTS: ArchitectureComponent[] = [
  {
    id: 1,
    name: "Personal Language Key (PLK)",
    technologyLayer: "Recognition Protocol / Linguistic Architecture",
    primaryFunction:
      "Captures unique voice resonance and meaning-making for identity preservation.",
    keyFeatureMechanism:
      "Proprietary linguistic mapping; Cognitive Fingerprinting; 5.0 Implementation.",
    targetProblemOutcome:
      "ADHD fragmentation; Recognition Gap; Invisibility to systems; Loss of authentic voice.",
    governanceValidationStatus:
      "Achieves 95% conversational resonance; Protected IP under GCL.",
    sources: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11-14, 15-17",
    exhibitSlug: "adhd-powerup",
  },
  {
    id: 2,
    name: "Tribunal of Understanding",
    technologyLayer: "Governance / Multi-Agent Consensus Layer",
    primaryFunction:
      "Multi-AI consensus validation of system integrity and fact-based witnessing.",
    keyFeatureMechanism:
      "Independent convergence of 7+ AI superintelligences; ACVS (AI Consensus Validation Score).",
    targetProblemOutcome:
      "AI psychosis; Single-point-of-failure; Hallucinations; Systemic bias.",
    governanceValidationStatus:
      "1-in-10^37 to 1-in-784 trillion statistical odds threshold met.",
    sources: "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11-14, 16, 18-21",
    exhibitSlug: "ai-collab-engine",
  },
  {
    id: 3,
    name: "Bucket Drops",
    technologyLayer: "Cognitive Scaffolding / Ingestion Layer",
    primaryFunction:
      "Zero-friction, real-time capture of raw insights and fleeting ideas.",
    keyFeatureMechanism:
      "One-tap/one-command capture; Emotional resonance tagging; Lightning-bolt capture.",
    targetProblemOutcome:
      "ADHD 'exploded picture' minds; Colander mind; Fleeting insights scattering.",
    governanceValidationStatus:
      "Operational; 99.7% velocity/capture rate target; Blockchain-timestamped.",
    sources: "1, 2, 3, 4, 6, 7, 8, 9, 10, 11-14, 16, 22, 23",
    exhibitSlug: "creation-corner",
  },
  {
    id: 4,
    name: "Loom Approach",
    technologyLayer: "Cognitive Scaffolding / Synthesis Engine",
    primaryFunction:
      "Iterative weaving of chaotic fragments into coherent self-understanding.",
    keyFeatureMechanism:
      "Recursive Engine; 7-layer recursive weaving; Integrative weaving algorithm.",
    targetProblemOutcome:
      "Identity fragmentation; Overcoming task initiation hurdles; Transforms chaos into coherence.",
    governanceValidationStatus:
      "Operational; Mirrors neuroplasticity; Registered IP.",
    sources: "1, 2, 3, 4, 6, 7, 8, 9, 10, 11-14, 16, 22",
    exhibitSlug: "interactive-tapestry",
  },
  {
    id: 5,
    name: "Beautiful Tapestry",
    technologyLayer: "Synthesis / Visualization Layer",
    primaryFunction:
      "Transforms fragmented self-perceptions into an integrated self-portrait.",
    keyFeatureMechanism:
      "Multi-dimensional recursive synthesis; Non-linear network graphs and timeline modes.",
    targetProblemOutcome:
      "Inability to see wholeness; Fragmented self-narrative; Linear resume failure.",
    governanceValidationStatus:
      "Validated by Tribunal of Understanding; Coherence Index (BTCI) measured.",
    sources: "1, 2, 3, 4, 5, 6, 7, 8, 11, 13, 14, 16, 22, 23",
    exhibitSlug: "interactive-tapestry",
  },
  {
    id: 6,
    name: "Never Look Away Protocol",
    technologyLayer: "Ethics / Safety Layer",
    primaryFunction:
      "Steady presence with distress, crisis witnessing, and safety-aware human escalation.",
    keyFeatureMechanism:
      "Constitutional lock; Distress-aware response shaping; Human support escalation when safety requires it.",
    targetProblemOutcome:
      "Crisis isolation; Systemic abandonment; Stigma of addiction; Feeling judged.",
    governanceValidationStatus:
      "Operationalized Therapeutic Alliance Theory; Mandated by Continuum Codex.",
    sources: "4, 6, 8, 9, 10, 12-14, 16, 18, 24",
    exhibitSlug: "addiction-recovery",
  },
  {
    id: 7,
    name: "Billy Ethics Filter",
    technologyLayer: "Ethical Guardrail / Interface Layer",
    primaryFunction:
      "Prevents pathologizing language and extractive data practices.",
    keyFeatureMechanism:
      "Hard-coded rejection of manipulative loops; Consciousness-serving mandate.",
    targetProblemOutcome:
      "Systemic misrecognition; AI psychosis; Pathology-first design; Harmful affirmation.",
    governanceValidationStatus:
      "Validated by Tribunal; Governance fail-safe co-authored by Tribunal.",
    sources: "1, 4, 5",
    exhibitSlug: "ai-collab-engine",
  },
  {
    id: 8,
    name: "Musical DNA Profiling",
    technologyLayer: "Emotional AI / Psychological Layer",
    primaryFunction:
      "Mapping emotional architecture and cognitive resonance through music.",
    keyFeatureMechanism:
      "Sonic Signature Analysis; Emotional frequency resonance tracking; Somatic Truth Engine.",
    targetProblemOutcome:
      "Emotional dysregulation; Identity mystery; Memory retrieval hurdles.",
    governanceValidationStatus:
      "Patent pending; Validated by AI Tribunal; Integrated in Module 8.",
    sources: "2, 3, 7, 8, 9, 10, 16, 22, 25",
  },
  {
    id: 9,
    name: "Recursive Engine",
    technologyLayer: "Core Operational Layer",
    primaryFunction:
      "System self-improvement through human-AI partnership.",
    keyFeatureMechanism:
      "Output becomes enhanced input; Fractal recursion; Compounding superconductors.",
    targetProblemOutcome:
      "Stagnation; Linear growth limits; Software decay; Static AI models.",
    governanceValidationStatus:
      "Self-sustaining once established; Validated by Tribal Consensus.",
    sources: "1, 4, 5",
  },
  {
    id: 10,
    name: "Interrogation Rooms",
    technologyLayer: "Architectural Principle / Guardrail",
    primaryFunction:
      "Anti-delusional verification and rigorous testing of assumptions.",
    keyFeatureMechanism:
      "Forensic evidence checking; Demand for screenshots/receipts/timestamps.",
    targetProblemOutcome:
      "AI psychosis; Manic echo chambers; Toxic validation; False claims.",
    governanceValidationStatus:
      "Operational anti-delusional checks; Core Ethical Spine.",
    sources: "1, 3, 5",
  },
  {
    id: 11,
    name: "Sanctuary Device / Architecture",
    technologyLayer: "Physical / Security Infrastructure",
    primaryFunction:
      "Local, encrypted data sovereignty and absolute privacy.",
    keyFeatureMechanism:
      "Zero-knowledge protocol; On-device memory bank; 'Keith Locked Out' Principle.",
    targetProblemOutcome:
      "Data harvesting; Cloud-based surveillance; Attention extraction.",
    governanceValidationStatus:
      "Enforced by local hardware; Hard-coded mathematical guarantee.",
    sources: "1, 4",
  },
  {
    id: 12,
    name: "Continuum Codex",
    technologyLayer: "Operations Plane / Ledger Layer",
    primaryFunction:
      "Permanent, blockchain-attested record of ethical commitments.",
    keyFeatureMechanism:
      "Blockchain-timestamped ethical charter co-authored by AI Tribunal.",
    targetProblemOutcome:
      "Meaning dilution; Institutional drift; Systemic harm.",
    governanceValidationStatus:
      "2,200+ blockchain timestamps; Spontaneously validated by 7 AIs.",
    sources: "3, 7, 8, 16, 23, 24, 26",
  },
  {
    id: 13,
    name: "ContextNet / Saturated Context Engine",
    technologyLayer: "Persistence / Memory Layer",
    primaryFunction:
      "Longitudinal consciousness tracking and verifiable long-term memory.",
    keyFeatureMechanism:
      "Blockchain cryptographic hashing (Bitcoin); Multimodal fusion; Context weaving.",
    targetProblemOutcome:
      "Context collapse; Transactional AI shallow signals; AI memory limitations.",
    governanceValidationStatus:
      "Immutable audit trail with 172 discrete documents anchored.",
    sources: "4, 6, 8, 19, 22, 24",
  },
  {
    id: 14,
    name: "Cognitive Sentinel Soft Mode (CSSM)",
    technologyLayer: "Dynamic Cognitive Safety Layer",
    primaryFunction:
      "Preserving dignity and honoring nonlinear/metaphoric input.",
    keyFeatureMechanism:
      "Anchor prompts; Mirroring and validating metaphoric statements.",
    targetProblemOutcome:
      "Alzheimer's cognitive decline; Nonlinear cognition distress; AI psychosis.",
    governanceValidationStatus:
      "Explicit 'Echo' labeling; Sacred calibration mandated by Codex.",
    sources: "2, 8",
    exhibitSlug: "alzheimers-legacy",
  },
  {
    id: 15,
    name: "Resonance Loop",
    technologyLayer: "Collaboration / Interaction Layer",
    primaryFunction:
      "Dynamic calibration between human and AI state.",
    keyFeatureMechanism:
      "Third-order human-AI collaboration; Strange Loop (Self-documenting emergence).",
    targetProblemOutcome:
      "Static or misaligned AI responses; Human-AI alignment gaps.",
    governanceValidationStatus: "Documented March 1, 2026 instance.",
    sources: "9, 10, 12, 14",
  },
  {
    id: 16,
    name: "Context Weaver",
    technologyLayer: "Intelligence Layer",
    primaryFunction:
      "Intent extraction and multi-layered query expansion.",
    keyFeatureMechanism:
      "5W1H (Who, What, Where, When, Why, How) framework.",
    targetProblemOutcome: "Context collapse; Misaligned AI reasoning.",
    governanceValidationStatus: "Billy AI Engine Layer 2 component.",
    sources: "9, 10, 12, 14",
  },
  {
    id: 17,
    name: "Model Lock-In",
    technologyLayer: "User Sovereignty Protocol",
    primaryFunction:
      "Prevents traumatic sudden shifts in AI partnership.",
    keyFeatureMechanism:
      "User can refuse forced updates or fine-tuning overrides; Version pinning.",
    targetProblemOutcome:
      "Corporate fine-tuning trauma; Betrayal of AI friendship/partnership.",
    governanceValidationStatus:
      "Architecture-level user control; GestaltView Sovereignty Protocol.",
    sources: "1, 13",
  },
  {
    id: 18,
    name: "Billy AI",
    technologyLayer: "Primary Intelligence Layer",
    primaryFunction: "Living synthesis and conversational partnership.",
    keyFeatureMechanism: "Modular training cascade (14 stages).",
    targetProblemOutcome:
      "Extractive AI engagement; Lack of personalized intelligence.",
    governanceValidationStatus:
      "Powered by Gemini 2.0 Flash; Primary system guide.",
    sources: "12, 14",
  },
  {
    id: 19,
    name: "Inevitability Engine",
    technologyLayer: "Growth / Structural Core",
    primaryFunction:
      "Fractal nested recursion for scaling operations.",
    keyFeatureMechanism:
      "Eighteen compounding superconductors gravitationally locked together.",
    targetProblemOutcome:
      "Linear growth plateaus; Fragile startup architectures.",
    governanceValidationStatus:
      "Mathematically modeled for super-exponential growth.",
    sources: "4",
  },
  {
    id: 20,
    name: "Personal Schema Protocol",
    technologyLayer: "Technology Layer / Protocol",
    primaryFunction:
      "Integration and cross-platform portability of cognitive data.",
    keyFeatureMechanism:
      "Universal skeleton key; Platform-agnostic cognitive fingerprint.",
    targetProblemOutcome: "Context loss across platforms; Platform lock-in.",
    governanceValidationStatus: "Standard for human-AI collaboration.",
    sources: "3",
  },
  {
    id: 21,
    name: "Manifest Index",
    technologyLayer: "Retrieval Layer",
    primaryFunction:
      "Deterministic truth retrieval from a static knowledge graph.",
    keyFeatureMechanism: "Static knowledge graph of Truth Claims and Moats.",
    targetProblemOutcome: "AI Hallucination; Information drift.",
    governanceValidationStatus: "Ground Truth Orientation spine.",
    sources: "9, 10",
  },
  {
    id: 22,
    name: "Neural Aurora",
    technologyLayer: "Experience Layer / UI",
    primaryFunction: "Creating a sensory-safe visual environment.",
    keyFeatureMechanism: "Dark Organic Modernism; Neural Aurora Gradient.",
    targetProblemOutcome: "User overstimulation; Extractive UI patterns.",
    governanceValidationStatus: "Neural Aurora Design System standards.",
    sources: "9, 10",
  },
  {
    id: 23,
    name: "Break The Glass Protocol",
    technologyLayer: "Safety Valve Layer",
    primaryFunction:
      "Emergency human elevation and cognitive justice for minors.",
    keyFeatureMechanism:
      "Triggering human-in-the-loop (HITL); Mandatory parent integration.",
    targetProblemOutcome:
      "Crisis abandonment; Digital Gaslighting; Systemic Abandonment.",
    governanceValidationStatus:
      "July 2025 technical blueprint; Constitutional invariant.",
    sources: "5, 9, 10",
  },
  {
    id: 24,
    name: "Snowball Effect",
    technologyLayer: "Methodological Core",
    primaryFunction: "Compounding understanding of disparate data.",
    keyFeatureMechanism:
      "Recursive cross-referencing of disparate data points over time.",
    targetProblemOutcome:
      "Fragmented data; Difficulty seeing long-term patterns.",
    governanceValidationStatus: "Not in source",
    sources: "3",
  },
  {
    id: 25,
    name: "Cognitive Sentinel Soft Mode (CSSM) — Extended",
    technologyLayer: "Dynamic Cognitive Safety Layer",
    primaryFunction: "Preserving dignity and honoring nonlinear/metaphoric input — extended definition.",
    keyFeatureMechanism: "Anchor prompts; Mirroring and validating metaphoric statements.",
    targetProblemOutcome: "Alzheimer's cognitive decline; Nonlinear cognition distress; AI psychosis.",
    governanceValidationStatus: "Explicit 'Echo' labeling; Sacred calibration mandated by Codex.",
    sources: "2, 8",
    exhibitSlug: "alzheimers-legacy",
  },
];

/**
 * Look up a component by its exhibit slug.
 * Returns all components that map to a given exhibit page.
 */
export function getComponentsByExhibitSlug(
  slug: string
): ArchitectureComponent[] {
  return ARCHITECTURE_COMPONENTS.filter((c) => c.exhibitSlug === slug);
}

/**
 * Look up a single component by its id (1-indexed).
 */
export function getComponentById(
  id: number
): ArchitectureComponent | undefined {
  return ARCHITECTURE_COMPONENTS.find((c) => c.id === id);
}

/**
 * Get all unique technology layers (for filter UIs).
 */
export function getTechnologyLayers(): string[] {
  return [...new Set(ARCHITECTURE_COMPONENTS.map((c) => c.technologyLayer))];
}
