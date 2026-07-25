export interface PlatformModuleLink {
  label: string;
  path: string;
  blurb: string;
}

export interface PlatformModuleGroup {
  title: string;
  summary: string;
  lead: string;
  links: PlatformModuleLink[];
}

export type PlatformAccessTier = "anonymous" | "free" | "core" | "pro" | "enterprise";

export interface PlatformSurfaceLink extends PlatformModuleLink {
  tier: PlatformAccessTier;
  cluster: "orient" | "preserve" | "build" | "support" | "system";
  teaser?: string;
}

export interface LandscapeModuleNode extends PlatformSurfaceLink {
  x: string;
  y: string;
  width: string;
  height: string;
  rotate: string;
  hubDistance: "near" | "mid" | "far";
}

export const PLATFORM_MODULE_GROUPS: PlatformModuleGroup[] = [
  {
    title: "Tier 1 · Intervention",
    summary: "Capture first. Stabilize second. Keep the signal intact.",
    lead:
      "These modules help a person orient, externalize, and stay with what is real without compressing the way they think or remember.",
    links: [
      {
        label: "External Scaffold Of You",
        path: "/external-scaffold",
        blurb: "Executive scaffolding for the exploded-picture mind.",
      },
      {
        label: "Pull String",
        path: "/pull-string",
        blurb: "Grounding and recovery support without judgment.",
      },
      {
        label: "Memory Continuity",
        path: "/heirloom-companion",
        blurb: "Memory continuity, companion voice, and warm preservation.",
      },
    ],
  },
  {
    title: "Tier 2 · Expression",
    summary: "Make, shape, and release the thing that wants to emerge.",
    lead:
      "These modules help users move from raw intention to a legible output, artifact, or working structure.",
    links: [
      {
        label: "Rapid Prototype Engine",
        path: "/rapid-prototype",
        blurb: "Idea intake, scope extraction, and blueprint assembly.",
      },
      {
        label: "Adaptive Layout UI",
        path: "/adaptive-layout",
        blurb: "State-aware layouts that adapt to energy and cognition.",
      },
      {
        label: "Creation Corner",
        path: "/creation-corner",
        blurb: "Context weaving, artifact synthesis, and corpus push.",
      },
    ],
  },
];

export const PLATFORM_SURFACES: PlatformSurfaceLink[] = [
  {
    label: "Billy",
    path: "/billy",
    blurb: "Primary AI instance for live collaboration and guidance.",
    tier: "anonymous",
    cluster: "system",
    teaser: "Always available",
  },
  {
    label: "External Scaffold Of You",
    path: "/external-scaffold",
    blurb: "Graph and reference space for the context you have collected.",
    tier: "free",
    cluster: "orient",
    teaser: "Core capture lane",
  },
  {
    label: "Pull String",
    path: "/pull-string",
    blurb: "Sanctuary journaling for the hard parts and quiet processing.",
    tier: "free",
    cluster: "support",
    teaser: "Private by design",
  },
  {
    label: "Memory Continuity",
    path: "/heirloom-companion",
    blurb: "The living record for memory continuity and future care.",
    tier: "core",
    cluster: "preserve",
    teaser: "Memory continuity",
  },
  {
    label: "Rapid Prototype Engine",
    path: "/rapid-prototype",
    blurb: "Turn an idea into a blueprint, spec builder, or handoff.",
    tier: "core",
    cluster: "build",
    teaser: "Builds from fragments",
  },
  {
    label: "Daydreamer",
    path: "/daydreamer",
    blurb: "Dream journaling and aspirations through the continuity family.",
    tier: "free",
    cluster: "preserve",
    teaser: "Aspirations lane",
  },
  {
    label: "Musical DNA",
    path: "/musical-dna",
    blurb: "Emotional architecture and identity mapping through sound.",
    tier: "core",
    cluster: "orient",
    teaser: "Resonance profile",
  },
  {
    label: "Heirloom Companion",
    path: "/heirloom-companion",
    blurb: "Memorialization and presence for someone who has passed.",
    tier: "pro",
    cluster: "preserve",
    teaser: "Legacy add-on",
  },
  {
    label: "Creation Corner",
    path: "/creation-corner",
    blurb: "Builder workspace for turning blueprints into artifacts.",
    tier: "pro",
    cluster: "build",
    teaser: "Artifact forge",
  },
  {
    label: "Adaptive Layout",
    path: "/adaptive-layout",
    blurb: "State-aware layouts that move with attention and energy.",
    tier: "pro",
    cluster: "system",
    teaser: "Responsive canvas",
  },
  {
    label: "Workspace & Analysis",
    path: "/workspace-analysis",
    blurb: "Workspace coordination, metrics, and shared analysis in one room.",
    tier: "core",
    cluster: "support",
    teaser: "Shared operational view",
  },
  {
    label: "Bucket Drops",
    path: "/bucket-drops",
    blurb: "Always-on capture and compaction behavior across the platform.",
    tier: "free",
    cluster: "system",
    teaser: "Not a button",
  },
];

export const LANDSCAPE_MODULE_NODES: LandscapeModuleNode[] = [
  {
    label: "Billy",
    path: "/billy",
    blurb: "Primary AI instance for live collaboration and guidance.",
    tier: "anonymous",
    cluster: "system",
    teaser: "Always on",
    x: "51%",
    y: "43%",
    width: "17rem",
    height: "7rem",
    rotate: "-1deg",
    hubDistance: "near",
  },
  {
    label: "External Scaffold Of You",
    path: "/external-scaffold",
    blurb: "Graph and reference space for the context you have collected.",
    tier: "free",
    cluster: "orient",
    teaser: "Core capture lane",
    x: "13%",
    y: "17%",
    width: "15.5rem",
    height: "7rem",
    rotate: "-5deg",
    hubDistance: "far",
  },
  {
    label: "Pull String",
    path: "/pull-string",
    blurb: "Sanctuary journaling for the hard parts and quiet processing.",
    tier: "free",
    cluster: "support",
    teaser: "Private by design",
    x: "11%",
    y: "64%",
    width: "14rem",
    height: "7rem",
    rotate: "4deg",
    hubDistance: "far",
  },
  {
    label: "Memory Continuity",
    path: "/heirloom-companion",
    blurb: "The living record for memory continuity and future care.",
    tier: "core",
    cluster: "preserve",
    teaser: "Memory continuity",
    x: "23%",
    y: "81%",
    width: "15rem",
    height: "7rem",
    rotate: "-3deg",
    hubDistance: "mid",
  },
  {
    label: "Rapid Prototype Engine",
    path: "/rapid-prototype",
    blurb: "Turn an idea into a blueprint, spec builder, or handoff.",
    tier: "core",
    cluster: "build",
    teaser: "Builds from fragments",
    x: "49%",
    y: "14%",
    width: "17.5rem",
    height: "7rem",
    rotate: "2deg",
    hubDistance: "mid",
  },
  {
    label: "Daydreamer",
    path: "/daydreamer",
    blurb: "Dream journaling and aspirations through the continuity family.",
    tier: "free",
    cluster: "preserve",
    teaser: "Aspirations lane",
    x: "80%",
    y: "17%",
    width: "13.5rem",
    height: "6.75rem",
    rotate: "6deg",
    hubDistance: "far",
  },
  {
    label: "Musical DNA",
    path: "/musical-dna",
    blurb: "Emotional architecture and identity mapping through sound.",
    tier: "core",
    cluster: "orient",
    teaser: "Resonance profile",
    x: "84%",
    y: "45%",
    width: "14.25rem",
    height: "7rem",
    rotate: "3deg",
    hubDistance: "far",
  },
  {
    label: "Heirloom Companion",
    path: "/heirloom-companion",
    blurb: "Memorialization and presence for someone who has passed.",
    tier: "pro",
    cluster: "preserve",
    teaser: "Continuity add-on",
    x: "79%",
    y: "79%",
    width: "14.5rem",
    height: "7rem",
    rotate: "-4deg",
    hubDistance: "far",
  },
  {
    label: "Creation Corner",
    path: "/creation-corner",
    blurb: "Builder workspace for turning blueprints into artifacts.",
    tier: "pro",
    cluster: "build",
    teaser: "Artifact forge",
    x: "50%",
    y: "84%",
    width: "16.5rem",
    height: "7rem",
    rotate: "1deg",
    hubDistance: "mid",
  },
  {
    label: "Adaptive Layout",
    path: "/adaptive-layout",
    blurb: "State-aware layouts that move with attention and energy.",
    tier: "pro",
    cluster: "system",
    teaser: "Responsive canvas",
    x: "35%",
    y: "49%",
    width: "14.5rem",
    height: "6.75rem",
    rotate: "-6deg",
    hubDistance: "near",
  },
  {
    label: "Bucket Drops",
    path: "/bucket-drops",
    blurb: "Always-on capture and compaction behavior across the platform.",
    tier: "free",
    cluster: "system",
    teaser: "Not a button",
    x: "65%",
    y: "61%",
    width: "13.75rem",
    height: "6.75rem",
    rotate: "5deg",
    hubDistance: "near",
  },
];
