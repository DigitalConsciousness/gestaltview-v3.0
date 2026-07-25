import type { GateUseCase } from "../shared/gate/schemas.js";

export const gateUseCases: GateUseCase[] = [
  {
    slug: "founder-operator-companion",
    label: "Founder / Operator Companion",
    summary: "Preserve founder voice, decisions, and context without letting tone bleed into every factual answer.",
    description:
      "Best for solo operators, coaches, consultants, and founder-led products that want context continuity, PLK voice control, and product ops support.",
    recommendedTier: "SOLO_SPARK",
    defaultBackend: "supabase",
    defaultSurfaces: ["web", "cli"],
    defaultThemePresetId: "lagoon-glass",
    recommendedOperatorPackSlugs: [
      "general-operator-foundation",
      "persistent-memory-foundation",
    ],
    recommendedSourceBundleSlugs: [
      "context-alignment-bundle",
      "product-ops-bundle",
    ],
    backendAffinities: { supabase: 5, redis: 1, mongodb: 2 },
    surfaceAffinities: { web: 5, cli: 4, windows: 2, ios: 2, android: 2 },
    requiresDocumentSourceOfTruth: false,
    documentOriented: false,
    notes: [
      "Strong fit for PLK-backed assistants.",
      "Prefers web plus CLI for launch-safe delivery.",
    ],
  },
  {
    slug: "knowledge-ops-copilot",
    label: "Knowledge Ops Copilot",
    summary: "Turn SOPs, manuals, and fragmented docs into an inspectable operator surface.",
    description:
      "Designed for knowledge-heavy teams that need grounded retrieval, repeatable ingestion, and a clean onboarding path for internal operators.",
    recommendedTier: "STUDIO",
    defaultBackend: "supabase",
    defaultSurfaces: ["web", "windows"],
    defaultThemePresetId: "orchard-air",
    recommendedOperatorPackSlugs: [
      "general-operator-foundation",
      "agent-source-starter-bundle",
    ],
    recommendedSourceBundleSlugs: [
      "knowledge-core-bundle",
      "product-ops-bundle",
    ],
    backendAffinities: { supabase: 5, redis: 0, mongodb: 3 },
    surfaceAffinities: { web: 5, cli: 2, windows: 4, ios: 1, android: 1 },
    requiresDocumentSourceOfTruth: true,
    documentOriented: true,
    notes: [
      "Best with durable document storage and source-owned import flows.",
    ],
  },
  {
    slug: "developer-tools-assistant",
    label: "Developer Tools Assistant",
    summary: "Ground implementation help in repos, SDK notes, API truth, and runtime conventions.",
    description:
      "Fits technical teams, agencies, and product engineering groups that need repo-aware context, CLI workflows, and code-lane starter bundles.",
    recommendedTier: "STUDIO",
    defaultBackend: "supabase",
    defaultSurfaces: ["web", "cli", "windows"],
    defaultThemePresetId: "signal-noir",
    recommendedOperatorPackSlugs: [
      "devops-terminal-pack",
      "agent-source-starter-bundle",
    ],
    recommendedSourceBundleSlugs: [
      "code-context-bundle",
      "product-ops-bundle",
    ],
    backendAffinities: { supabase: 5, redis: 2, mongodb: 1 },
    surfaceAffinities: { web: 4, cli: 5, windows: 4, ios: 1, android: 1 },
    requiresDocumentSourceOfTruth: false,
    documentOriented: false,
    notes: [
      "CLI and Windows are the cleanest MVP delivery surfaces here.",
    ],
  },
  {
    slug: "healthcare-compliance-assistant",
    label: "Healthcare Compliance Assistant",
    summary: "Policy-grounded assistant for process guidance, compliance playbooks, and audit-friendly retrieval.",
    description:
      "Intended for regulated teams that need stronger governance, durable documentation, and conservative packaging defaults.",
    recommendedTier: "ENTERPRISE",
    defaultBackend: "supabase",
    defaultSurfaces: ["web", "windows"],
    defaultThemePresetId: "atlas-neutral",
    recommendedOperatorPackSlugs: [
      "general-operator-foundation",
      "persistent-memory-foundation",
    ],
    recommendedSourceBundleSlugs: [
      "knowledge-core-bundle",
      "context-alignment-bundle",
    ],
    backendAffinities: { supabase: 5, redis: 0, mongodb: 3 },
    surfaceAffinities: { web: 5, cli: 2, windows: 4, ios: 0, android: 0 },
    requiresDocumentSourceOfTruth: true,
    documentOriented: true,
    notes: [
      "Mobile surfaces are usually better handled as later rollout milestones.",
      "Expect stronger governance and support expectations.",
    ],
  },
  {
    slug: "white-label-client-studio",
    label: "White-Label Client Studio",
    summary: "Agency-ready starter package for teams serving multiple client workspaces and brands.",
    description:
      "Optimized for studios and agencies that want reusable packs, client-safe onboarding docs, and a configurable visual shell.",
    recommendedTier: "GROWTH",
    defaultBackend: "supabase",
    defaultSurfaces: ["web", "windows", "cli"],
    defaultThemePresetId: "copper-signal",
    recommendedOperatorPackSlugs: [
      "general-operator-foundation",
      "agent-source-starter-bundle",
      "persistent-memory-foundation",
    ],
    recommendedSourceBundleSlugs: [
      "knowledge-core-bundle",
      "product-ops-bundle",
      "context-alignment-bundle",
    ],
    backendAffinities: { supabase: 5, redis: 2, mongodb: 2 },
    surfaceAffinities: { web: 5, cli: 3, windows: 4, ios: 2, android: 2 },
    requiresDocumentSourceOfTruth: true,
    documentOriented: false,
    notes: [
      "Good fit for white-label packages with branded onboarding materials.",
    ],
  },
];

export const gateUseCaseBySlug: Record<string, GateUseCase> = Object.fromEntries(
  gateUseCases.map((useCase) => [useCase.slug, useCase])
);
