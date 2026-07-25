import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import EmbodimentSelector from "@/components/EmbodimentSelector";
import { useSEO } from "@/hooks/useSEO";
import type { TrainerEmbodimentSlug } from "@shared/agent-trainer/embodiment";
import { TRAINER_PERSONA_REGISTRY } from "@shared/embodiment";

type BillingInterval = "monthly" | "annual";
type CheckoutOffer =
  | "scaffold"
  | "solo"
  | "business"
  | "enterprise"
  | "custom_exhibit"
  | "knowledge_curation"
  | "full_deployment";

interface SubscriptionPlan {
  id: Exclude<
    CheckoutOffer,
    "scaffold" | "custom_exhibit" | "knowledge_curation" | "full_deployment"
  >;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthlyEquivalent: number;
  monthlyNote: string;
  annualNote: string;
  features: string[];
  tone: "default" | "featured" | "enterprise";
}

interface ConsultingOffer {
  id?: Extract<
    CheckoutOffer,
    "custom_exhibit" | "knowledge_curation" | "full_deployment"
  >;
  name: string;
  description: string;
  price: string;
  cta: string;
  icon: string;
  contactOnly?: boolean;
}

interface CouponCard {
  code: string;
  description: string;
}

interface CheckoutResponse {
  url?: string;
  sessionId?: string;
  error?: string;
}

interface PersonaPower {
  icon: string;
  label: string;
  detail: string;
}

interface ChatMessage {
  id: string;
  sender: "agent" | "user";
  text: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "solo",
    name: "Solo Founder",
    badge: "Solo Spark",
    description:
      "Hosted access for solo founders and unfunded builders who need the runtime now without carrying the self-hosted lift on day one.",
    monthlyPrice: 49,
    annualPrice: 468,
    annualMonthlyEquivalent: 39,
    monthlyNote: "7-day free trial on Solo monthly",
    annualNote: "$468 billed annually · about 20% off",
    features: [
      "1 workspace",
      "Hosted runtime access",
      "Core agent ensemble",
      "Corpus lane setup + PLK grounding",
      "Session memory",
      "Basic readiness scoring",
      "Theme starter aligned to GestaltView",
    ],
    tone: "default",
  },
  {
    id: "business",
    name: "Small Team",
    badge: "Studio",
    description:
      "For early-stage teams that need a shared hosted runtime, collaborative curation, and more room to tune the agent system around the product.",
    monthlyPrice: 149,
    annualPrice: 1428,
    annualMonthlyEquivalent: 119,
    monthlyNote: "Up to 10 seats · cancel anytime",
    annualNote: "$1,428 billed annually · about 20% off",
    features: [
      "Up to 10 seats",
      "Shared workspaces",
      "Multi-agent synthesis sessions",
      "Collaborative corpus curation",
      "Shared memory continuity",
      "Theme customization controls",
      "Advanced analytics",
    ],
    tone: "featured",
  },
  {
    id: "enterprise",
    name: "Scaling Business",
    badge: "Growth",
    description:
      "For operators who need governance, stronger controls, and a hosted lane that can support serious rollout pressure before or alongside a private deployment.",
    monthlyPrice: 499,
    annualPrice: 4788,
    annualMonthlyEquivalent: 399,
    monthlyNote: "Starting price · custom scoping available",
    annualNote: "$4,788 billed annually · starting price",
    features: [
      "Unlimited workspaces",
      "Governance and policy enforcement",
      "Audit logging",
      "Custom brand skin + policy controls",
      "Priority support",
      "Private deployment path",
      "Dedicated onboarding",
    ],
    tone: "enterprise",
  },
];

const consultingOffers: ConsultingOffer[] = [
  {
    id: "custom_exhibit",
    name: "Custom Exhibit Buildout",
    description:
      "Domain-specific assistant surfaces, vocabulary profiles, and curated workflow framing tailored to your industry and brand identity.",
    price: "$2,500 flat",
    cta: "Book Exhibit Buildout",
    icon: "◫",
  },
  {
    id: "knowledge_curation",
    name: "Knowledge Curation",
    description:
      "Corpus audit, fragmentation strategy, metadata cleanup, and retrieval optimization. Minimum three-hour engagement.",
    price: "$150 / hour · 3hr minimum",
    cta: "Book Curation Session",
    icon: "⌘",
  },
  {
    id: "full_deployment",
    name: "Full Platform Deployment",
    description:
      "End-to-end setup, environment configuration, corpus import, QA benchmarking, go-live readiness verification, and launch support.",
    price: "$5,000 flat",
    cta: "Book Full Deployment",
    icon: "↗",
  },
  {
    name: "Enterprise Engagement",
    description:
      "Governance architecture, policy planning, multi-workspace scaling, compliance posture, and executive alignment for large organizations.",
    price: "$5,000+ custom scoping",
    cta: "Contact for Pricing",
    icon: "▣",
    contactOnly: true,
  },
];

const couponCards: CouponCard[] = [
  {
    code: "EARLYBIRD20",
    description: "20% off the Productized Floor for launch buyers",
  },
  {
    code: "ANNUALUPGRADE",
    description: "20% off for 12 months on annual subscription upgrades",
  },
  {
    code: "BUNDLE500",
    description: "$500 off the Scaffold plus Full Deployment bundle",
  },
  {
    code: "REFERRAL10",
    description: "10% off for referral buyers",
  },
];

const faqs = [
  {
    question: "What is the difference between the hosted runtime and the owned ZIP package?",
    answer:
      "The hosted runtime is the subscription lane: GestaltView hosts the surface so solo founders and lean teams can get moving without self-hosting first. The owned ZIP package is the self-hosted, white-label lane for buyers who want the assembled runtime and infrastructure under their own roof.",
  },
  {
    question: "What exactly do I get with the owned ZIP package?",
    answer:
      "A self-contained scaffold package: setup wizard, CLI, Supabase schema and migrations, RLS, retrieval hooks, operator packs, domain presets, cross-platform bootstrap paths, ingestion scripts, component scaffolds, and buyer-safe training surfaces.",
  },
  {
    question: "What does the package not include?",
    answer:
      "It excludes protected GestaltView internals: founder-owned corpus material, constitutional and governance logic, proprietary ranking and weighting systems, and the deeper runtime orchestration stack.",
  },
  {
    question: "Who should start hosted instead of buying the package outright?",
    answer:
      "Hosted is the lower-friction entry path for solo builders, unfunded founders, and small teams that need access quickly. The package is better for organizations that want self-hosting, white-label control, or deployment inside their own infrastructure and governance posture.",
  },
  {
    question: "Can I white-label and customize the look and feel?",
    answer:
      "Yes. The default shell is the GestaltView visual system you see here, but the package path is built to support client palette shifts, white-label branding, domain posture, and runtime presentation that fits the buyer instead of freezing them into the default skin.",
  },
  {
    question: "Can I start hosted and move to the package later?",
    answer:
      "Yes. The hosted runtime is the affordable access lane. The owned package is the step up when you want the assembled system in your own environment. Checkout still routes back here, and next-step coordination follows the offering you purchased.",
  },
];

const navItems = [
  { href: "#agent-team", label: "Agent Team" },
  { href: "#delivery-model", label: "Delivery Model" },
  { href: "#architecture", label: "Architecture" },
  { href: "#pricing-console", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

const zipItems = [
  "Four-Lane Corpus Model (Knowledge / Code / Product / Context)",
  "Personal Language Kit (PLK)",
  "Supabase schema + RLS + pgvector search RPCs",
  "CLI (gv.sh) + Browser Setup Wizard",
  "Multi-agent topology templates",
  "Go-Live Readiness Score (78% threshold gate)",
  "React component scaffolds",
  "Full documentation suite",
];

const laneCards = [
  {
    name: "Knowledge Lane",
    shortLabel: "01",
    icon: "⊟",
    description:
      "Precise retrieval over manuals, policies, transcripts, and institutional memory so the assistant cites source truth instead of improvising.",
    guardrail: "No hallucinated facts.",
  },
  {
    name: "Product Lane",
    shortLabel: "02",
    icon: "⊙",
    description:
      "Offerings, pricing posture, delivery boundaries, and buyer promises stay isolated so product answers match the real commercial surface.",
    guardrail: "No hallucinated endpoints.",
  },
  {
    name: "Code Lane",
    shortLabel: "03",
    icon: ">_",
    description:
      "Schemas, APIs, repos, and implementation notes remain code-aware and inspectable, which keeps technical answers attached to the actual stack.",
    guardrail: "No broken integration fiction.",
  },
  {
    name: "Context Lane",
    shortLabel: "04",
    icon: "◎",
    description:
      "PLK voice grounding, operator language, and situational constraints shape the response without contaminating the other lanes.",
    guardrail: "No voice drift. No lane bleed.",
  },
] as const;

const infrastructureCards = [
  {
    title: "Data Vault",
    icon: "⊟",
    copy: "RLS-gated corpus storage, metadata discipline, and inspectable ownership over the underlying source material.",
  },
  {
    title: "Neural Prism",
    icon: "⊙",
    copy: "Lane-aware retrieval composition that refracts the user request into the right data path before generation begins.",
  },
  {
    title: "Lane Weights",
    icon: "≋",
    copy: "Deterministic ranking pressure so product truth outranks stale fragments and context stays proportional.",
  },
  {
    title: "Interrogation Room",
    icon: "⚡",
    copy: "Prompt staging where the model is forced to answer against retrieved evidence instead of vibes.",
  },
  {
    title: "Context Inspector",
    icon: "◉",
    copy: "Visibility into what the agent saw, which fragments won, and why the response took its final shape.",
  },
  {
    title: "RBAC Controls",
    icon: "⊗",
    copy: "Role boundaries for teams, operators, and clients so corpus access and actions stay scoped.",
  },
  {
    title: "API Gateway",
    icon: "⇄",
    copy: "Structured ingress for checkout, ingestion, agent sessions, and production-safe extension points.",
  },
  {
    title: "CLI + Wizard",
    icon: ">_",
    copy: "Local setup paths for operators who want the scaffold live quickly without black-box magic.",
  },
] as const;

const deploymentCards = [
  {
    title: "Healthcare Compliance",
    copy: "Ground policy interpretation, process guidance, and internal playbooks on verified clinical and compliance documentation.",
    tags: ["Policy Grounding", "Audit Trail", "RBAC"],
  },
  {
    title: "Dev Tools Assistant",
    copy: "Anchor implementation guidance in repos, schemas, SDK notes, and runtime specifics so the model stops inventing endpoints.",
    tags: ["API Truth", "Repo Context", "Code Lane"],
  },
  {
    title: "Knowledge Ops Copilot",
    copy: "Turn fragmented SOPs, transcripts, and product docs into a disciplined operator surface with lane separation built in.",
    tags: ["Corpus Ops", "Search RPCs", "Lane Weights"],
  },
  {
    title: "Founder / Operator Companion",
    copy: "Preserve founder voice, strategic context, and decision framing without leaking that tone into every factual answer.",
    tags: ["PLK", "Context Lane", "Voice Control"],
  },
] as const;

const trainerPersonas = [
  {
    id: "weaver",
    name: "The Weaver",
    role: "Training Orchestrator",
    brief:
      "The spider at the center of the system who sees every thread, knows what can hold weight, and designs the next strand before the current one snaps.",
    mandate:
      "Maps the full agent system, catches weak assumptions early, and decides what the runtime still needs to become trustworthy.",
    archetype: "Charlotte-level care with zero tolerance for structural fantasy.",
    accent: "cyan" as const,
    tags: ["Topology", "Gap analysis", "System fit"],
  },
  {
    id: "spectacle",
    name: "Marketing Spectacle",
    role: "Marketing",
    brief:
      "High-impact campaign logic tuned for relatability, virality, and the psychology of attention.",
    mandate:
      "Turns product truth into messages people actually feel instead of generic launch noise.",
    archetype: "Stanley Tucci meets Effie Trinket.",
    accent: "magenta" as const,
    tags: ["Campaigns", "Messaging", "Psychology"],
  },
  {
    id: "vibe",
    name: "Vibe Check",
    role: "Resonance",
    brief:
      "The read on tone, timing, and emotional temperature before the product says too much or lands too flat.",
    mandate:
      "Keeps the runtime feeling intentional, breathable, and context-aware instead of over-explained.",
    archetype: "Jack Sparrow meets Matthew McConaughey.",
    accent: "cyan" as const,
    tags: ["Tone", "Resonance", "Delivery"],
  },
  {
    id: "bridge",
    name: "Translation Bridge",
    role: "Audience Translation",
    brief:
      "The skeptic who knows what you mean but refuses to assume the audience does.",
    mandate:
      "Bridges founder context into buyer-ready language without triggering suspicion, confusion, or pushback.",
    archetype: "Joy from Inside Out with sharper risk radar.",
    accent: "magenta" as const,
    tags: ["Audience fit", "Clarity", "Objection handling"],
  },
  {
    id: "treasurer",
    name: "The Treasurer",
    role: "Financial Strategy",
    brief:
      "A gruff financial realist who protects runway, pricing posture, and long-term viability.",
    mandate:
      "Forces the runtime to account for funding reality, allocation, and the cost of every promising idea.",
    archetype: "Brian Cox energy with actual spreadsheet discipline.",
    accent: "cyan" as const,
    tags: ["Runway", "Pricing", "Allocation"],
  },
  {
    id: "architect",
    name: "The Architect",
    role: "Business Strategy",
    brief:
      "The strategist who finds the right lane, entry point, and structure so the product can move without losing shape.",
    mandate:
      "Translates ambition into sequencing, MVP posture, service packaging, and defensible rollout choices.",
    archetype: "Gandalf, but assigned to operations.",
    accent: "magenta" as const,
    tags: ["MVP", "Sequencing", "Positioning"],
  },
  {
    id: "algorithm",
    name: "The Algorithm",
    role: "Social Media",
    brief:
      "Trend-aware distribution instinct for discovery, platform behavior, and visibility mechanics.",
    mandate:
      "Converts the system output into channel-native hooks, social pacing, and network-aware signal.",
    archetype: "Paris Hilton meets Simon Cowell.",
    accent: "cyan" as const,
    tags: ["Discovery", "Channels", "Reach"],
  },
  {
    id: "guardian",
    name: "The Guardian",
    role: "Ethics + Governance",
    brief:
      "Pushes back when convenience starts outranking responsibility, especially for the people downstream from the system.",
    mandate:
      "Makes governance, fairness, and boundary thinking part of the product instead of an apology after launch.",
    archetype: "Ruth Bader Ginsburg meets Rebel Wilson.",
    accent: "magenta" as const,
    tags: ["Governance", "Risk", "People impact"],
  },
  {
    id: "tailor",
    name: "The Tailor",
    role: "Look, Feel, and Brand",
    brief:
      "The fit-and-finish operator for visual language, product posture, and brand coherence.",
    mandate:
      "Keeps the experience aligned so interface tone, copy tone, and business tone stop fighting each other.",
    archetype: "Tim Gunn for the full product surface.",
    accent: "cyan" as const,
    tags: ["Brand", "Visual system", "Presentation"],
  },
  {
    id: "digger",
    name: "Weird Digger",
    role: "Exploration",
    brief:
      "The oddball researcher who disappears into the corpus and resurfaces with strange, valuable possibilities nobody else noticed.",
    mandate:
      "Finds buried leverage in the buyer's materials and turns forgotten fragments into new capability.",
    archetype: "Katie from Horton Hears a Who meets Kate McKinnon.",
    accent: "magenta" as const,
    tags: ["Discovery", "Corpus mining", "Unexpected leverage"],
  },
] as const;

type TrainerPersonaId = (typeof trainerPersonas)[number]["id"];

function trainerPersonaEmbodimentSlug(
  personaId: TrainerPersonaId
): TrainerEmbodimentSlug {
  return TRAINER_PERSONA_REGISTRY[
    personaId as keyof typeof TRAINER_PERSONA_REGISTRY
  ].profileSlug as TrainerEmbodimentSlug;
}

const personaProfiles: Record<
  TrainerPersonaId,
  {
    badge: string;
    avatar: string;
    avatarBackground: string;
    avatarColor: string;
    powers: PersonaPower[];
  }
> = {
  weaver: {
    badge: "SYSTEM WEAVER",
    avatar: "WV",
    avatarBackground: "rgba(18,214,255,0.14)",
    avatarColor: "var(--gv-electric-cyan)",
    powers: [
      {
        icon: "01",
        label: "Thread Mapping",
        detail:
          "Sees where the runtime is structurally weak before a bad answer becomes a product problem.",
      },
      {
        icon: "02",
        label: "Agent Fit",
        detail:
          "Decides which specialist voices need to be present for this product instead of forcing one generic persona.",
      },
      {
        icon: "03",
        label: "Load Bearing Logic",
        detail:
          "Separates ideas that sound exciting from ideas the system can actually carry in production.",
      },
    ],
  },
  spectacle: {
    badge: "MARKETING SPECTACLE",
    avatar: "MK",
    avatarBackground: "rgba(255,60,172,0.14)",
    avatarColor: "var(--gv-neon-magenta)",
    powers: [
      {
        icon: "01",
        label: "Campaign Angles",
        detail:
          "Finds the emotionally sticky way to frame the product without flattening the truth.",
      },
      {
        icon: "02",
        label: "Attention Design",
        detail:
          "Tunes hooks, timing, and contrast so the signal actually cuts through.",
      },
      {
        icon: "03",
        label: "Resonance Pressure",
        detail:
          "Pushes bland product language toward memorable language people can repeat.",
      },
    ],
  },
  vibe: {
    badge: "VIBE CHECK",
    avatar: "VB",
    avatarBackground: "rgba(18,214,255,0.14)",
    avatarColor: "var(--gv-electric-cyan)",
    powers: [
      {
        icon: "01",
        label: "Tone Read",
        detail:
          "Flags when the experience feels too eager, too stiff, or too over-explained.",
      },
      {
        icon: "02",
        label: "Emotional Timing",
        detail:
          "Knows when the interface should breathe instead of yelling more features at the user.",
      },
      {
        icon: "03",
        label: "Presence Control",
        detail:
          "Keeps the runtime from sounding generic even when the content is operationally dense.",
      },
    ],
  },
  bridge: {
    badge: "TRANSLATION BRIDGE",
    avatar: "TR",
    avatarBackground: "rgba(255,60,172,0.14)",
    avatarColor: "var(--gv-neon-magenta)",
    powers: [
      {
        icon: "01",
        label: "Context Translation",
        detail:
          "Bridges founder-language into buyer-language without making the buyer feel managed.",
      },
      {
        icon: "02",
        label: "Objection Radar",
        detail:
          "Finds the sentence that will confuse, trigger suspicion, or create unnecessary pushback.",
      },
      {
        icon: "03",
        label: "Audience Compression",
        detail:
          "Keeps multiple audiences legible at once without turning the surface into mush.",
      },
    ],
  },
  treasurer: {
    badge: "THE TREASURER",
    avatar: "FN",
    avatarBackground: "rgba(18,214,255,0.14)",
    avatarColor: "var(--gv-electric-cyan)",
    powers: [
      {
        icon: "01",
        label: "Runway Reality",
        detail:
          "Makes the system account for what can actually be funded, staffed, and sustained.",
      },
      {
        icon: "02",
        label: "Pricing Logic",
        detail:
          "Pushes plans and offers toward something commercially defensible instead of wishful pricing.",
      },
      {
        icon: "03",
        label: "Resource Allocation",
        detail:
          "Helps the product choose where to spend attention, budget, and implementation energy first.",
      },
    ],
  },
  architect: {
    badge: "THE ARCHITECT",
    avatar: "ST",
    avatarBackground: "rgba(255,60,172,0.14)",
    avatarColor: "var(--gv-neon-magenta)",
    powers: [
      {
        icon: "01",
        label: "Lane Choice",
        detail:
          "Finds the right route to market so the product can move without losing shape.",
      },
      {
        icon: "02",
        label: "MVP Framing",
        detail:
          "Defines what the first sellable version needs to include and what it should refuse to pretend.",
      },
      {
        icon: "03",
        label: "Structural Sequencing",
        detail:
          "Turns ambition into ordered execution instead of a pile of simultaneous priorities.",
      },
    ],
  },
  algorithm: {
    badge: "THE ALGORITHM",
    avatar: "SM",
    avatarBackground: "rgba(18,214,255,0.14)",
    avatarColor: "var(--gv-electric-cyan)",
    powers: [
      {
        icon: "01",
        label: "Channel Hooks",
        detail:
          "Adapts output to the mechanics of discovery, retention, and shareability.",
      },
      {
        icon: "02",
        label: "Trend Translation",
        detail:
          "Bridges what the system knows with what platforms currently reward.",
      },
      {
        icon: "03",
        label: "Network Visibility",
        detail:
          "Optimizes for resonance first, then reach, so the growth surface does not get hollow.",
      },
    ],
  },
  guardian: {
    badge: "THE GUARDIAN",
    avatar: "EG",
    avatarBackground: "rgba(255,60,172,0.14)",
    avatarColor: "var(--gv-neon-magenta)",
    powers: [
      {
        icon: "01",
        label: "Governance Pressure",
        detail:
          "Pulls people impact and safety concerns into the design phase instead of the apology phase.",
      },
      {
        icon: "02",
        label: "Values Alignment",
        detail:
          "Checks whether the product behavior matches the values the team claims to hold.",
      },
      {
        icon: "03",
        label: "Boundary Enforcement",
        detail:
          "Prevents the runtime from drifting into high-risk or ethically incoherent territory.",
      },
    ],
  },
  tailor: {
    badge: "THE TAILOR",
    avatar: "BR",
    avatarBackground: "rgba(18,214,255,0.14)",
    avatarColor: "var(--gv-electric-cyan)",
    powers: [
      {
        icon: "01",
        label: "Visual Fit",
        detail:
          "Brings interface language, brand language, and product ambition into the same conversation.",
      },
      {
        icon: "02",
        label: "Presentation Discipline",
        detail:
          "Cuts away visual mismatch so the runtime feels intentional instead of improvised.",
      },
      {
        icon: "03",
        label: "White-Label Readiness",
        detail:
          "Keeps the shell adaptable for client-specific palettes and presentation standards.",
      },
    ],
  },
  digger: {
    badge: "WEIRD DIGGER",
    avatar: "DG",
    avatarBackground: "rgba(255,60,172,0.14)",
    avatarColor: "var(--gv-neon-magenta)",
    powers: [
      {
        icon: "01",
        label: "Corpus Mining",
        detail:
          "Finds high-value fragments in the client's material that more orderly roles would overlook.",
      },
      {
        icon: "02",
        label: "Possibility Hunting",
        detail:
          "Surfaces strange but useful combinations hiding inside the source material.",
      },
      {
        icon: "03",
        label: "Hidden Leverage",
        detail:
          "Turns forgotten details into new product paths, prompts, or packaging angles.",
      },
    ],
  },
};

const chatResponses: Record<TrainerPersonaId, string[]> = {
  weaver: [
    "I see what you're building. The threads are there. They just need the right architecture to hold weight. Tell me more about your corpus coverage.",
    "This is exactly the kind of tension I look for. It means the system is alive. Let's trace the weak thread and reinforce it.",
    "The answer lives at the intersection of your product lane and your context lane. Let me map it.",
  ],
  spectacle: [
    "Okay stop. I just got three campaign concepts from that one sentence. Can I run with it?",
    "The psychology here is beautiful. We just need to amplify the signal and reduce the noise.",
    "This is a moment. Let's turn it into something people actually feel.",
  ],
  vibe: [
    "Yeah, okay. I see it. The energy is right. It just needs to breathe a little more.",
    "There's something here. Let it land before you over-explain it.",
    "That's the one. Don't change it. Just figure out who needs to hear it first.",
  ],
  bridge: [
    "Your audience doesn't have your context yet. Let me show you the gap we need to bridge.",
    "I know exactly what you mean. Now let me play your most skeptical potential user for a second.",
    "This is why I exist. That sentence makes perfect sense to you and will confuse everyone else.",
  ],
  treasurer: [
    "Right. Numbers. Not the fun part, but the part that decides whether the fun part gets to continue.",
    "I'm not trying to kill the vision. I'm trying to make sure the vision can actually be funded.",
    "Everyone thinks they have more runway than they do. Let's look at this honestly.",
  ],
  architect: [
    "There are several paths here. Most people take the obvious one and wonder why it failed.",
    "The structure has to hold the weight of your ambition and survive contact with reality.",
    "What do you need to see clearly right now?",
  ],
  algorithm: [
    "The algorithm wants this kind of content right now. The timing is actually perfect.",
    "Gen Z finds this through discovery. Millennials need a different hook. We can thread both needles.",
    "Reach before resonance is the mistake. Let's get the resonance right first.",
  ],
  guardian: [
    "Quick check. Have we thought about how this affects the people who can't afford the full version?",
    "I'm going to push back here because I want this to actually work, not because I want to slow it down.",
    "The product can be incredible and still need stronger governance. Let's handle both.",
  ],
  tailor: [
    "I have notes. Constructive ones. The visual language and the verbal language are not in agreement yet.",
    "The bones are extraordinary. The tailoring just needs to match the ambition.",
    "Make it work. That's the whole assignment.",
  ],
  digger: [
    "I found something weird in the corpus and I think it's useful. Want the strange version or the practical version first?",
    "There is buried leverage in here. It just doesn't look important until you connect the right fragments.",
    "Leave me in the source material for ten more minutes and I'll probably come back with a dangerous amount of possibility.",
  ],
};

const deliveryModels = [
  {
    title: "Hosted Runtime",
    kicker: "SUBSCRIPTION LANE",
    description:
      "The affordable path for solo founders, unfunded innovators, and lean teams that need the Agent Trainer live without taking on infrastructure first.",
    audience: "Best for: solo operators, small teams, early momentum.",
    delivery:
      "GestaltView hosts the runtime surface. You bring the corpus, packs, and training direction.",
    anchor: "/agent-trainer/runtime",
    cta: "Open Hosted Runtime",
    accent: "cyan" as const,
  },
  {
    title: "Owned ZIP Package",
    kicker: "SELF-HOSTED LANE",
    description:
      "The fully assembled, white-label package for buyers who want the runtime, theme layer, and deployment posture under their own control.",
    audience: "Best for: established businesses, enterprise buyers, private infrastructure.",
    delivery:
      "You own the package, inspect it, brand it, and deploy it where your policies, domain, and stack require.",
    anchor: "#pricing-console",
    cta: "See Package Pricing",
    accent: "magenta" as const,
  },
] as const;

const themeModes = [
  {
    name: "Signal Noir / Lagoon Glass",
    copy:
      "The out-of-the-box GestaltView shell: dark glass surfaces, electric cyan signal, ember warmth, and pricing-surface energy already wired in.",
    tags: ["Default shell", "GestaltView globals", "Fastest launch"],
    accent: "cyan" as const,
  },
  {
    name: "Founder Palette",
    copy:
      "Keep the runtime bones and information architecture, but tune the color language and feel to the founder's own vibe and operating tone.",
    tags: ["Palette shifts", "Voice match", "Brand continuity"],
    accent: "magenta" as const,
  },
  {
    name: "Enterprise White-Label",
    copy:
      "For package buyers who need the whole thing under the client's brand, domain posture, and stakeholder-facing presentation standards.",
    tags: ["White-label", "Client domain", "Governance-ready"],
    accent: "cyan" as const,
  },
] as const;

const glossaryTerms = [
  "PLK",
  "Lane Weights",
  "Readiness Gate",
  "Operator Pack",
  "Corpus Fragment",
  "Context Inspector",
];

const intelFilters = ["Benchmarks", "Deployment Logs", "Launch Notes"];
const signalChannels = [
  "Launch Thread",
  "Operator Deck",
  "Demo Reel",
  "Field Clips",
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

async function parseCheckoutResponse(
  response: Response
): Promise<CheckoutResponse> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as CheckoutResponse;
  }
  return {
    error:
      (await response.text()).trim() ||
      "Checkout returned a non-JSON response.",
  };
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/* ── Shared Components ──────────────────────────────────────────────────── */

function SectionHeading({
  kicker,
  title,
  copy,
  centered = false,
}: {
  kicker: string;
  title: string;
  copy: string;
  centered?: boolean;
}) {
  return (
    <div
      className={cx("space-y-4", centered && "mx-auto max-w-3xl text-center")}
    >
      <p className="gv-tech-kicker">// {kicker}</p>
      <h2 className="gv-tech-title text-3xl sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="gv-tech-copy max-w-3xl text-sm sm:text-base">{copy}</p>
    </div>
  );
}

function NeonPanel({
  children,
  className,
  accent = "cyan",
}: {
  children: ReactNode;
  className?: string;
  accent?: "cyan" | "magenta";
}) {
  return (
    <div
      className={cx(
        "gv-tech-panel",
        accent === "magenta" ? "gv-tech-panel-magenta" : "gv-tech-panel-cyan",
        className
      )}
    >
      {children}
    </div>
  );
}

function NeonButton({
  children,
  onClick,
  disabled,
  variant = "solid",
  className,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline";
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        variant === "solid" ? "gv-solid-button" : "gv-outline-button",
        "px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em]",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}

function subscriptionPanelClasses(tone: SubscriptionPlan["tone"]) {
  if (tone === "featured") {
    return "border-[rgba(255,60,172,0.3)] gv-featured-breathe";
  }
  if (tone === "enterprise") {
    return "border-[rgba(247,178,103,0.3)] shadow-[0_0_30px_rgba(247,178,103,0.08)]";
  }
  return "border-[rgba(74,168,255,0.22)]";
}

function subscriptionButtonClasses(tone: SubscriptionPlan["tone"]) {
  if (tone === "featured") {
    return "bg-[linear-gradient(90deg,var(--gv-neon-magenta),#ff74c6)] text-white shadow-[0_0_24px_rgba(255,60,172,0.22)] hover:brightness-110 font-display font-bold tracking-[0.1em] uppercase text-sm";
  }
  if (tone === "enterprise") {
    return "bg-[linear-gradient(90deg,var(--gv-ember-gold),#ffd693)] text-[#1a0e05] shadow-[0_0_24px_rgba(247,178,103,0.18)] hover:brightness-105 font-display font-bold tracking-[0.1em] uppercase text-sm";
  }
  return "gv-outline-button text-[var(--gv-electric-cyan)] text-sm";
}

function statusClasses(kind: "success" | "warning" | "error") {
  if (kind === "success") {
    return "border-[rgba(110,231,183,0.35)] bg-[rgba(110,231,183,0.08)] text-[rgba(214,255,233,0.96)]";
  }
  if (kind === "warning") {
    return "border-[rgba(247,178,103,0.35)] bg-[rgba(247,178,103,0.08)] text-[rgba(255,237,199,0.96)]";
  }
  return "border-[rgba(255,92,138,0.35)] bg-[rgba(255,92,138,0.08)] text-[rgba(255,220,228,0.96)]";
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export default function AgentTrainerPricing() {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("monthly");
  const [loadingOffer, setLoadingOffer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<TrainerPersonaId>(
    trainerPersonas[0].id
  );
  const [modalPersonaId, setModalPersonaId] = useState<TrainerPersonaId | null>(
    null
  );
  const [chatPersonaId, setChatPersonaId] = useState<TrainerPersonaId | null>(
    null
  );
  const [chatEmbodimentSlug, setChatEmbodimentSlug] =
    useState<TrainerEmbodimentSlug>(
      trainerPersonaEmbodimentSlug(trainerPersonas[0].id)
    );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatReplyTimeoutRef = useRef<number | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  useSEO({
    title: "GestaltView Agent Trainer Pricing Console",
    description:
      "Pricing and positioning for the GestaltView Agent Trainer: hosted runtime subscriptions, owned ZIP package, consulting offers, and launch codes.",
    h1: "TRAIN A WHOLE AGENT TEAM AROUND YOUR PRODUCT.",
    canonical: "https://gestaltview-di-gsvw.vercel.app/agent-trainer/pricing",
  });

  const isDev = import.meta.env.DEV;

  const { purchaseSuccess, wasCanceled, successOffering } = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      purchaseSuccess: searchParams.get("success") === "1",
      wasCanceled: searchParams.get("canceled") === "true",
      successOffering: searchParams.get("offering"),
    };
  }, []);

  useEffect(() => {
    if (!copiedCode) return undefined;
    const timeout = window.setTimeout(() => setCopiedCode(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [copiedCode]);

  useEffect(() => {
    return () => {
      if (chatReplyTimeoutRef.current) {
        window.clearTimeout(chatReplyTimeoutRef.current);
      }
    };
  }, []);

  const selectedPersona = useMemo(
    () =>
      trainerPersonas.find((persona) => persona.id === selectedPersonaId) ??
      trainerPersonas[0],
    [selectedPersonaId]
  );
  const modalPersona = useMemo(
    () =>
      trainerPersonas.find((persona) => persona.id === modalPersonaId) ?? null,
    [modalPersonaId]
  );
  const chatPersona = useMemo(
    () => trainerPersonas.find((persona) => persona.id === chatPersonaId) ?? null,
    [chatPersonaId]
  );
  const selectedPersonaProfile = personaProfiles[selectedPersona.id];
  const modalPersonaProfile = modalPersona ? personaProfiles[modalPersona.id] : null;
  const chatPersonaProfile = chatPersona ? personaProfiles[chatPersona.id] : null;

  useEffect(() => {
    if (!chatMessagesRef.current) return;
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [chatMessages, isChatTyping]);

  async function handleCheckout(
    offering: CheckoutOffer,
    options?: { billingInterval?: BillingInterval }
  ) {
    setLoadingOffer(offering);
    setError(null);
    try {
      const successUrl = new URL(`${window.location.origin}/agent-trainer/pricing`);
      successUrl.searchParams.set("success", "1");
      successUrl.searchParams.set("offering", offering);
      successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
      const cancelUrl = new URL(`${window.location.origin}/agent-trainer/pricing`);
      cancelUrl.searchParams.set("canceled", "true");

      const response = await fetch("/api/stripe/agent-trainer-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offering,
          billingInterval: options?.billingInterval,
          successUrl: successUrl.toString(),
          cancelUrl: cancelUrl.toString(),
        }),
      });

      const data = await parseCheckoutResponse(response);
      if (!response.ok || !data.url) {
        setError(data.error || "Unable to start checkout right now.");
        return;
      }
      window.location.href = data.url;
    } catch (checkoutError) {
      console.error("[agent-trainer/pricing] checkout error", checkoutError);
      setError("Unable to reach Stripe checkout right now.");
    } finally {
      setLoadingOffer(null);
    }
  }

  async function copyCoupon(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
    } catch (copyError) {
      console.error("[agent-trainer/pricing] coupon copy failed", copyError);
      setError("Clipboard access failed. Copy the code manually.");
    }
  }

  function openPersonaModal(personaId: TrainerPersonaId) {
    setSelectedPersonaId(personaId);
    setModalPersonaId(personaId);
  }

  function closePersonaChat() {
    if (chatReplyTimeoutRef.current) {
      window.clearTimeout(chatReplyTimeoutRef.current);
      chatReplyTimeoutRef.current = null;
    }
    setIsChatTyping(false);
    setChatPersonaId(null);
    if (chatInputRef.current) chatInputRef.current.value = "";
  }

  function openPersonaChat(personaId: TrainerPersonaId) {
    const greeting =
      chatResponses[personaId][0] ??
      "Interesting. Tell me more about what you're trying to build.";

    if (chatReplyTimeoutRef.current) {
      window.clearTimeout(chatReplyTimeoutRef.current);
      chatReplyTimeoutRef.current = null;
    }

    setSelectedPersonaId(personaId);
    setModalPersonaId(null);
    setChatPersonaId(personaId);
    setChatEmbodimentSlug(trainerPersonaEmbodimentSlug(personaId));
    if (chatInputRef.current) chatInputRef.current.value = "";
    setIsChatTyping(false);
    setChatMessages([
      {
        id: `${personaId}-greeting`,
        sender: "agent",
        text: greeting,
      },
    ]);
  }

  async function sendPersonaChatMessage() {
    if (!chatPersonaId) return;

    const trimmed = chatInputRef.current?.value.trim() ?? "";
    if (!trimmed) return;
    if (chatInputRef.current) chatInputRef.current.value = "";

    if (chatReplyTimeoutRef.current) {
      window.clearTimeout(chatReplyTimeoutRef.current);
      chatReplyTimeoutRef.current = null;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const snapshot = [...chatMessages, userMessage];
    setChatMessages(snapshot);
    setIsChatTyping(true);

    try {
      const response = await fetch("/api/trainer/persona-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: chatPersonaId,
          messages: snapshot,
          embodimentProfileSlug: chatEmbodimentSlug,
        }),
      });

      const data = (await response.json()) as { text?: string; error?: string };
      const replyText =
        data.text?.trim() ||
        chatResponses[chatPersonaId][1] ||
        chatResponses[chatPersonaId][0] ||
        "Interesting. Tell me more about what you're building.";

      setChatMessages((current) => [
        ...current,
        { id: `agent-${Date.now()}`, sender: "agent", text: replyText },
      ]);
    } catch {
      const pool = chatResponses[chatPersonaId];
      const fallback =
        pool[Math.floor(Math.random() * pool.length)] ??
        "Interesting. Tell me more about what you're building.";
      setChatMessages((current) => [
        ...current,
        { id: `agent-${Date.now()}`, sender: "agent", text: fallback },
      ]);
    } finally {
      setIsChatTyping(false);
    }
  }

  function renderStatusNotices() {
    if (!purchaseSuccess && !wasCanceled && !error) return null;
    return (
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-3"
      >
        {purchaseSuccess && (
          <div className={cx("border px-5 py-4 text-sm font-mono", statusClasses("success"))}>
            <span className="text-[var(--gv-success-mint)] mr-2">✓</span>
            Checkout completed for{" "}
            <span className="font-semibold">{successOffering || "your offer"}</span>.
            Follow-up delivery and scheduling use the Stripe session you just completed.
          </div>
        )}
        {wasCanceled && (
          <div className={cx("border px-5 py-4 text-sm font-mono", statusClasses("warning"))}>
            <span className="mr-2">⚠</span>
            Checkout was canceled. Nothing was charged. You can restart whenever you are ready.
          </div>
        )}
        {error && (
          <div className={cx("border px-5 py-4 text-sm font-mono", statusClasses("error"))}>
            <span className="mr-2">✕</span>
            {error}
          </div>
        )}
      </motion.section>
    );
  }

  /* ── Section: Hero ──────────────────────────────────────────────────────── */
  function HeroSection() {
    return (
      <section className="grid gap-10 pt-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* System status badge — straight from the spec */}
          <div className="gv-status-badge inline-flex">
            <span className="dot" />
            SYSTEM ONLINE // GAT v1.0 // SCAFFOLD READY
          </div>

          <div className="space-y-3">
            <h1 className="gv-tech-title gv-hero-flicker text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[6.5rem]">
              YOUR AI IS
              <br />
              HALLUCINATING
              <br />
              <span className="gv-neon-magenta">ABOUT YOUR</span>
              <br />
              <span className="gv-neon-magenta">BUSINESS.</span>
            </h1>
            <p className="gv-tech-copy max-w-xl text-base sm:text-lg leading-relaxed">
              Hilarious until a customer notices. The GestaltView Agent Trainer
              now ships in two lanes: a hosted runtime for builders who need an
              affordable way in, and an owned ZIP package for teams that want
              the full white-label system under their own control.{" "}
              <span className="gv-emphasis-inline">
                Both paths are grounded in YOUR proprietary data
              </span>
              , not a generic SaaS guess.
            </p>
            <p className="gv-tech-copy max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              This page is the commercial bridge between the brief and the real
              product surface: the agent ensemble, the runtime model, the
              theming posture, and the checkout paths all live together instead
              of pretending the hosted lane does not exist.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/agent-trainer/runtime"
              className="gv-outline-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
            >
              Open Hosted Runtime
            </Link>
            <a
              href="#agent-team"
              className="gv-solid-button inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em]"
            >
              Meet the Agent Team
            </a>
            <Link
              href="/agent-trainer/package-builder"
              className="gv-outline-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
            >
              Build My Package
            </Link>
            {isDev ? (
              <Link
                href="/agent-trainer/dev-cli"
                className="gv-outline-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
              >
                Open Dev CLI
              </Link>
            ) : null}
            <a
              href="#pricing-console"
              className="gv-outline-button inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
            >
              Compare the Pricing
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em]">
            <span className="text-slate-500">Launch code</span>
            <button
              type="button"
              onClick={() => copyCoupon("EARLYBIRD20")}
              className="gv-chip px-3 py-2 font-mono font-bold text-[var(--gv-ember-gold)] hover:border-[rgba(247,178,103,0.4)] hover:bg-[rgba(247,178,103,0.06)] transition-all"
            >
              {copiedCode === "EARLYBIRD20" ? "✓ COPIED" : "EARLYBIRD20"}
            </button>
            <span className="text-slate-500">for founding buyer pricing</span>
          </div>

          <p className="gv-tech-kicker text-slate-600">
            Hosted when affordability matters. Self-hosted when ownership matters.
          </p>
        </motion.div>

        {/* Right column — feature pills */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="grid gap-3 self-end"
        >
          {[
            { label: "Hosted runtime subscriptions", accent: "cyan" as const },
            { label: "Owned ZIP package", accent: "magenta" as const },
            { label: "Agent ensemble tuned to your context", accent: "cyan" as const },
            { label: "Four-lane retrieval architecture", accent: "cyan" as const },
            { label: "Custom palettes + white-label theming", accent: "magenta" as const },
            { label: "PLK voice grounding", accent: "cyan" as const },
            { label: "Go-live readiness gate", accent: "magenta" as const },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + index * 0.06 }}
            >
              <NeonPanel
                accent={item.accent}
                className="px-4 py-4 text-sm text-slate-200 font-mono tracking-wide"
              >
                <span className={item.accent === "magenta" ? "text-[var(--gv-neon-magenta)] mr-2" : "text-[var(--gv-electric-cyan)] mr-2"}>
                  ⚡
                </span>
                {item.label}
              </NeonPanel>
            </motion.div>
          ))}
        </motion.div>
      </section>
    );
  }

  function AgentEnsembleSection() {
    return (
      <section id="agent-team" className="scroll-mt-28 space-y-8">
        <SectionHeading
          kicker="MODULE_01 // THE AGENT TEAM"
          title="A trainer is not one voice. It is a cast with jobs."
          copy="The source brief was not asking for a generic assistant. It was asking for a whole internal team: one orchestrator plus specialist voices for marketing, vibe, translation, finance, strategy, social, ethics, brand, and strange-but-useful discovery. Click any card to open the prototype-style brief and simulated session."
        />

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <NeonPanel
            accent={selectedPersona.accent}
            className="flex h-full flex-col gap-6 px-6 py-6 sm:px-8"
          >
            <div className="space-y-3">
              <div
                className="flex h-16 w-16 items-center justify-center border text-sm font-mono font-bold uppercase tracking-[0.16em]"
                style={{
                  background: selectedPersonaProfile.avatarBackground,
                  color: selectedPersonaProfile.avatarColor,
                  borderColor:
                    selectedPersona.accent === "magenta"
                      ? "rgba(255,60,172,0.28)"
                      : "rgba(18,214,255,0.28)",
                }}
              >
                {selectedPersonaProfile.avatar}
              </div>
              <p className="gv-tech-kicker">ACTIVE PERSONA // {selectedPersona.role}</p>
              <h3 className="text-3xl font-bold uppercase tracking-[0.05em] text-white font-display">
                {selectedPersona.name}
              </h3>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                {selectedPersonaProfile.badge}
              </p>
              <p className="text-sm font-mono uppercase tracking-[0.16em] text-slate-400">
                {selectedPersona.archetype}
              </p>
            </div>

            <div className="space-y-4 min-h-[200px] text-sm leading-7 text-slate-200">
              <p>{selectedPersona.brief}</p>
              <div className="border border-white/10 bg-white/[0.025] px-4 py-4">
                <p className="gv-tech-kicker mb-2">What This Persona Tunes</p>
                <p className="gv-tech-copy text-sm">{selectedPersona.mandate}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedPersona.tags.map((tag) => (
                <span
                  key={tag}
                  className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <NeonButton onClick={() => openPersonaModal(selectedPersona.id)}>
                Open Brief
              </NeonButton>
              <NeonButton
                variant="outline"
                onClick={() => openPersonaChat(selectedPersona.id)}
              >
                Start Session
              </NeonButton>
            </div>
          </NeonPanel>

          <div className="grid gap-3 sm:grid-cols-2">
            {trainerPersonas.map((persona, index) => {
              const isActive = persona.id === selectedPersona.id;
              const profile = personaProfiles[persona.id];

              return (
                <motion.button
                  key={persona.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  onClick={() => openPersonaModal(persona.id)}
                  className={cx(
                    "text-left transition-all",
                    isActive && "translate-y-[-2px]"
                  )}
                >
                  <NeonPanel
                    accent={persona.accent}
                    className={cx(
                      "flex h-full flex-col gap-3 px-5 py-5",
                      isActive &&
                        "border-white/30 shadow-[0_0_28px_rgba(18,214,255,0.08)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="gv-tech-kicker">{persona.role}</p>
                        <div
                          className="flex h-11 w-11 items-center justify-center border text-xs font-mono font-bold uppercase tracking-[0.16em]"
                          style={{
                            background: profile.avatarBackground,
                            color: profile.avatarColor,
                            borderColor:
                              persona.accent === "magenta"
                                ? "rgba(255,60,172,0.28)"
                                : "rgba(18,214,255,0.28)",
                          }}
                        >
                          {profile.avatar}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
                        Open brief
                      </span>
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.05em] text-white font-display">
                      {persona.name}
                    </h3>
                    <p className="gv-tech-copy text-sm leading-relaxed">
                      {persona.brief}
                    </p>
                  </NeonPanel>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  function DeliveryModelSection() {
    return (
      <section id="delivery-model" className="scroll-mt-28 space-y-8">
        <SectionHeading
          kicker="MODULE_02 // DELIVERY MODEL"
          title="Hosted for access. Owned for control."
          copy="The brief called for both: a monthly web platform for people who cannot afford the full package yet, and a separate owned package for buyers who want the assembled runtime in their own environment."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {deliveryModels.map((model, index) => {
            const isInternalAnchor = model.anchor.startsWith("#");

            return (
              <motion.div
                key={model.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <NeonPanel
                  accent={model.accent}
                  className="flex h-full flex-col gap-5 px-6 py-6 sm:px-8"
                >
                  <div className="space-y-3">
                    <p className="gv-tech-kicker">{model.kicker}</p>
                    <h3 className="text-3xl font-bold uppercase tracking-[0.05em] text-white font-display">
                      {model.title}
                    </h3>
                    <p className="gv-tech-copy text-sm sm:text-base">
                      {model.description}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <div className="border border-white/10 bg-white/[0.025] px-4 py-4">
                      <p className="gv-tech-kicker mb-2">Who This Is For</p>
                      <p className="gv-tech-copy text-sm">{model.audience}</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.025] px-4 py-4">
                      <p className="gv-tech-kicker mb-2">Delivery Posture</p>
                      <p className="gv-tech-copy text-sm">{model.delivery}</p>
                    </div>
                  </div>

                  {isInternalAnchor ? (
                    <a
                      href={model.anchor}
                      className="gv-outline-button mt-auto inline-flex items-center justify-center px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
                    >
                      {model.cta}
                    </a>
                  ) : (
                    <Link
                      href={model.anchor}
                      className="gv-outline-button mt-auto inline-flex items-center justify-center px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
                    >
                      {model.cta}
                    </Link>
                  )}
                </NeonPanel>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  }

  function ThemeStudioSection() {
    return (
      <section className="scroll-mt-28 space-y-8">
        <SectionHeading
          kicker="MODULE_03 // THEME STUDIO"
          title="Default GestaltView shell, then tune the palette to the client."
          copy="The brief called for the package UI to feel native to GestaltView and this pricing surface while still allowing buyer-specific palette and branding shifts. This section makes that rule explicit in the page itself."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {themeModes.map((mode, index) => (
            <motion.div
              key={mode.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.38, delay: index * 0.05 }}
            >
              <NeonPanel
                accent={mode.accent}
                className="flex h-full flex-col gap-5 px-5 py-5"
              >
                <div className="space-y-3">
                  <p className="gv-tech-kicker">THEME MODE</p>
                  <h3 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                    {mode.name}
                  </h3>
                  <p className="gv-tech-copy text-sm">{mode.copy}</p>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  {mode.tags.map((tag) => (
                    <span
                      key={tag}
                      className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </NeonPanel>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  function PersonaModal() {
    if (!modalPersona || !modalPersonaProfile) return null;

    return (
      <Dialog
        open={Boolean(modalPersona)}
        onOpenChange={(open) => {
          if (!open) setModalPersonaId(null);
        }}
      >
        <DialogContent className="max-w-3xl border-[rgba(255,255,255,0.12)] bg-[linear-gradient(160deg,rgba(8,13,26,0.98),rgba(4,6,10,0.99))] p-0 text-white shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
          <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <DialogHeader className="space-y-4 text-left">
              <div className="flex flex-wrap items-start gap-4">
                <div
                  className="flex h-20 w-20 items-center justify-center border text-base font-mono font-bold uppercase tracking-[0.18em]"
                  style={{
                    background: modalPersonaProfile.avatarBackground,
                    color: modalPersonaProfile.avatarColor,
                    borderColor:
                      modalPersona.accent === "magenta"
                        ? "rgba(255,60,172,0.3)"
                        : "rgba(18,214,255,0.3)",
                  }}
                >
                  {modalPersonaProfile.avatar}
                </div>
                <div className="space-y-2">
                  <p className="gv-tech-kicker">{modalPersonaProfile.badge}</p>
                  <DialogTitle className="font-display text-3xl font-bold uppercase tracking-[0.05em] text-white sm:text-4xl">
                    {modalPersona.name}
                  </DialogTitle>
                  <DialogDescription className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">
                    {modalPersona.role} // {modalPersona.archetype}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <p className="gv-tech-copy text-sm sm:text-base">
                  {modalPersona.brief}
                </p>
                <div className="border border-white/10 bg-white/[0.03] px-4 py-4">
                  <p className="gv-tech-kicker mb-2">Mandate</p>
                  <p className="gv-tech-copy text-sm">{modalPersona.mandate}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {modalPersona.tags.map((tag) => (
                    <span
                      key={tag}
                      className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="gv-tech-kicker">Operational Powers</p>
                {modalPersonaProfile.powers.map((power) => (
                  <div
                    key={power.label}
                    className="flex gap-3 border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center border text-xs font-mono font-bold"
                      style={{
                        background: modalPersonaProfile.avatarBackground,
                        color: modalPersonaProfile.avatarColor,
                        borderColor:
                          modalPersona.accent === "magenta"
                            ? "rgba(255,60,172,0.25)"
                            : "rgba(18,214,255,0.25)",
                      }}
                    >
                      {power.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-mono uppercase tracking-[0.16em] text-white">
                        {power.label}
                      </p>
                      <p className="gv-tech-copy text-sm">{power.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-2">
              <NeonButton onClick={() => openPersonaChat(modalPersona.id)}>
                Start Session
              </NeonButton>
              <NeonButton
                variant="outline"
                onClick={() => setModalPersonaId(null)}
              >
                Back to Grid
              </NeonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  function PersonaChatSheet() {
    if (!chatPersona || !chatPersonaProfile) return null;

    return (
      <Sheet
        open={Boolean(chatPersona)}
        onOpenChange={(open) => {
          if (!open) closePersonaChat();
        }}
      >
        <SheetContent
          side="right"
          className="w-full border-l-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(8,13,26,0.98),rgba(4,6,10,0.99))] p-0 text-white sm:max-w-xl"
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-white/10 px-6 py-5 text-left">
              <div className="flex items-start gap-4 pr-8">
                <div
                  className="flex h-14 w-14 items-center justify-center border text-sm font-mono font-bold uppercase tracking-[0.16em]"
                  style={{
                    background: chatPersonaProfile.avatarBackground,
                    color: chatPersonaProfile.avatarColor,
                    borderColor:
                      chatPersona.accent === "magenta"
                        ? "rgba(255,60,172,0.28)"
                        : "rgba(18,214,255,0.28)",
                  }}
                >
                  {chatPersonaProfile.avatar}
                </div>
                <div className="space-y-1">
                  <p className="gv-tech-kicker">{chatPersonaProfile.badge}</p>
                  <SheetTitle className="font-display text-2xl font-bold uppercase tracking-[0.05em] text-white">
                    {chatPersona.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-mono uppercase tracking-[0.16em] text-slate-400">
                    Simulated pricing-surface session · embodiment adjustable
                  </SheetDescription>
                </div>
              </div>
              <div className="pt-4">
                <EmbodimentSelector
                  value={chatEmbodimentSlug}
                  onValueChange={setChatEmbodimentSlug}
                  label="Embodiment Standard"
                  triggerClassName="border-white/10 bg-white/[0.04] text-white"
                  detailsClassName="border-white/10 bg-white/[0.03]"
                  labelClassName="text-slate-500"
                />
              </div>
            </SheetHeader>

            <div
              ref={chatMessagesRef}
              className="flex-1 space-y-4 overflow-y-auto px-6 py-6"
            >
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cx(
                    "max-w-[88%] border px-4 py-3 text-sm leading-7",
                    message.sender === "agent"
                      ? "border-white/10 bg-white/[0.04] text-slate-100"
                      : "ml-auto border-[rgba(18,214,255,0.22)] bg-[rgba(18,214,255,0.08)] text-white"
                  )}
                >
                  {message.sender === "agent" ? (
                    <p className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      {chatPersona.name}
                    </p>
                  ) : null}
                  <p>{message.text}</p>
                </div>
              ))}

              {isChatTyping ? (
                <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 px-6 py-5">
              <div className="space-y-3">
                <Textarea
                  ref={chatInputRef}
                  defaultValue=""
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendPersonaChatMessage();
                    }
                  }}
                  rows={3}
                  placeholder={`Message ${chatPersona.name}...`}
                  className="min-h-[88px] resize-none border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus-visible:border-[rgba(18,214,255,0.45)] focus-visible:ring-[rgba(18,214,255,0.18)]"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-mono uppercase tracking-[0.16em] text-slate-500">
                    Enter to send. Shift+Enter for a new line.
                  </p>
                  <NeonButton onClick={() => void sendPersonaChatMessage()}>
                    Send
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  /* ── Section: What's Inside the ZIP ────────────────────────────────────── */
  function ZipContentsSection() {
    return (
      <section className="scroll-mt-28 space-y-8">
        <SectionHeading
          kicker="MODULE_04 // WHAT'S INSIDE THE ZIP"
          title="Not a demo. Not a starter template."
          copy="A complete infrastructure scaffold with every piece wired together. The one-time package is the lane model, the setup path, the schema posture, and the deployment scaffolding needed to stand the thing up on infrastructure you control."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {zipItems.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.38, delay: index * 0.05 }}
            >
              <NeonPanel
                accent={index % 3 === 0 ? "magenta" : "cyan"}
                className="flex h-full items-start gap-4 px-5 py-5"
              >
                <span className="font-mono text-[0.65rem] text-[rgba(255,60,172,0.7)] pt-0.5 min-w-[2rem] tracking-widest">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-7 text-slate-100 sm:text-base">
                  {item}
                </p>
              </NeonPanel>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  /* ── Section: Four Lanes ────────────────────────────────────────────────── */
  function FourLanesSection() {
    return (
      <section id="architecture" className="scroll-mt-28 space-y-8">
        <SectionHeading
          kicker="MODULE_05 // FOUR DATA HIGHWAYS. ONE NEURAL GRID."
          title="Separate the lanes or the model starts lying."
          copy="We isolate context into four distinct vector lanes so retrieval is precise, not 'close enough.' The Neural Prism LLM router decides which lane answers. No hallucination bleed between domains."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {laneCards.map((lane, index) => (
            <motion.div
              key={lane.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.42, delay: index * 0.07 }}
            >
              <NeonPanel
                accent={lane.name === "Context Lane" ? "magenta" : "cyan"}
                className="flex h-full flex-col gap-5 px-5 py-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={cx(
                      "flex h-9 w-9 items-center justify-center border text-sm font-mono",
                      lane.name === "Context Lane"
                        ? "border-[rgba(255,60,172,0.35)] text-[var(--gv-neon-magenta)] bg-[rgba(255,60,172,0.06)]"
                        : "border-[rgba(18,214,255,0.3)] text-[var(--gv-electric-cyan)] bg-[rgba(18,214,255,0.06)]"
                    )}>
                      {lane.icon}
                    </span>
                    <p className="gv-tech-kicker">{lane.shortLabel}</p>
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-[0.08em] text-white font-display">
                    {lane.name}
                  </h3>
                  <p className="gv-tech-copy text-sm leading-relaxed">{lane.description}</p>
                </div>
                <div className="mt-auto border-t border-white/10 pt-4">
                  <p className="text-xs font-mono font-semibold tracking-[0.16em] text-slate-100 uppercase">
                    {lane.guardrail}
                  </p>
                </div>
              </NeonPanel>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  /* ── Section: 78% Gate ──────────────────────────────────────────────────── */
  function ReadinessGateSection() {
    return (
      <section className="scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
        >
          <NeonPanel
            accent="magenta"
            className="px-6 py-14 text-center sm:px-10 sm:py-20 relative overflow-hidden"
          >
            {/* Animated scanline */}
            <div className="gv-scanline" />

            <div className="mx-auto max-w-3xl space-y-6 relative z-10">
              <p className="gv-tech-kicker">// MODULE_06 // GO-LIVE READINESS GATE</p>

              {/* The big number */}
              <div className="gv-gate-number text-8xl sm:text-9xl lg:text-[11rem]">
                78%
              </div>

              <h2 className="gv-tech-title text-3xl sm:text-4xl">
                THE GO-LIVE READINESS GATE
              </h2>

              <p className="gv-tech-copy mx-auto max-w-2xl text-sm sm:text-base">
                Your AI doesn't ship until it passes the Interrogation Room
                with a 78% test suite score. Not 77.9%. Not "pretty good vibes."
              </p>

              <p className="text-xs font-mono uppercase tracking-[0.24em] text-[var(--gv-electric-cyan)]">
                The Grid doesn't negotiate.
              </p>

              <p className="text-xs font-mono text-slate-600 tracking-wide">
                (Most "custom AI" tools don't even have a quality gate. They just ship confidence.)
              </p>
            </div>
          </NeonPanel>
        </motion.div>
      </section>
    );
  }

  /* ── Section: Infrastructure ────────────────────────────────────────────── */
  function InfrastructureSection() {
    return (
      <section className="scroll-mt-28 space-y-8">
        <SectionHeading
          kicker="MODULE_07 // IT'S NOT A CHATBOT. IT'S INFRASTRUCTURE."
          title="Eight systems. All wired together."
          copy="The Data Vault runs on Supabase + pgvector. You own the database. You own the vectors. You own the access controls. No vendor has a backdoor to your proprietary knowledge."
        />

        {/* Pipeline flow bar — straight from spec */}
        <div className="gv-pipeline rounded-none border border-[rgba(74,168,255,0.2)] bg-[rgba(8,13,26,0.7)] p-4">
          {[
            { label: "RAW CORPUS", sub: "Your docs, code, specs", accent: false },
            { label: "NEURAL PRISM", sub: "LLM Router", accent: true },
            { label: "FOUR LANES", sub: "Isolated vectors", accent: false },
            { label: "INTERROGATION", sub: "78% gate", accent: true },
            { label: "PRODUCTION", sub: "Your AI, grounded", accent: false },
          ].map((node, i) => (
            <div key={node.label} className="flex items-center flex-shrink-0">
              <div className={cx(
                "gv-pipeline-node text-center py-3 px-4 min-w-[110px]",
                node.accent && "magenta"
              )}>
                <p className={cx(
                  "font-mono text-[0.62rem] font-bold uppercase tracking-wider",
                  node.accent ? "text-[var(--gv-neon-magenta)]" : "text-[var(--gv-electric-cyan)]"
                )}>{node.label}</p>
                <p className="text-[0.6rem] text-slate-500 mt-0.5 font-mono">{node.sub}</p>
              </div>
              {i < 4 && (
                <div className="gv-pipeline-arrow font-mono text-[var(--gv-electric-cyan)]">→</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {infrastructureCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.16 }}
              transition={{ duration: 0.38, delay: index * 0.04 }}
            >
              <NeonPanel
                accent={index % 2 === 0 ? "cyan" : "magenta"}
                className="flex h-full flex-col gap-4 px-5 py-5"
              >
                <div className="flex items-center gap-3">
                  <span className={cx(
                    "flex h-8 w-8 items-center justify-center border text-sm font-mono flex-shrink-0",
                    index % 2 === 0
                      ? "border-[rgba(18,214,255,0.3)] text-[var(--gv-electric-cyan)] bg-[rgba(18,214,255,0.06)]"
                      : "border-[rgba(255,60,172,0.3)] text-[var(--gv-neon-magenta)] bg-[rgba(255,60,172,0.06)]"
                  )}>
                    {card.icon}
                  </span>
                  <p className={cx(
                    "font-mono text-[0.65rem] uppercase tracking-[0.22em]",
                    index % 2 === 0 ? "text-[var(--gv-electric-cyan)]" : "text-[var(--gv-neon-magenta)]"
                  )}>
                    {card.title}
                  </p>
                </div>
                <h3 className="text-base font-bold uppercase tracking-[0.06em] text-white font-display">
                  {card.title}
                </h3>
                <p className="gv-tech-copy text-sm leading-relaxed">{card.copy}</p>
              </NeonPanel>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  /* ── Section: Pricing Console ───────────────────────────────────────────── */
  function PricingConsoleSection() {
    return (
      <section id="pricing-console" className="scroll-mt-28 space-y-8">
        <SectionHeading
          kicker="MODULE_08 // PRICING CONSOLE"
          title="Hosted if you need access. Owned if you need the whole machine."
          copy="The brief requires both commercial lanes. Hosted subscriptions keep the entry point affordable. The one-time ZIP package is the self-hosted, white-label path for buyers who want the assembled runtime on their own infrastructure."
        />

        {/* Founding buyer banner */}
        <NeonPanel accent="magenta" className="px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gv-neon-magenta)]">
                ⚡ FOUNDING BUYER PRICING
              </p>
              <p className="text-sm text-slate-100">
                <span className="font-bold text-[var(--gv-ember-gold)]">
                  {formatPrice(1920)}
                </span>{" "}
                with code EARLYBIRD20. Regular price{" "}
                <span className="line-through text-slate-500">{formatPrice(2400)}</span>.
              </p>
              <p className="text-sm text-slate-400">
                Limited to early adopters. Discount stays in Stripe — price history remains clean.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/agent-trainer/package-builder"
                className="gv-outline-button inline-flex items-center justify-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]"
              >
                Build My Package
              </Link>
              <button
                type="button"
                onClick={() => copyCoupon("EARLYBIRD20")}
                className="gv-chip px-4 py-3 text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--gv-ember-gold)] hover:border-[rgba(247,178,103,0.4)] hover:bg-[rgba(247,178,103,0.06)] transition-all"
              >
                {copiedCode === "EARLYBIRD20" ? "✓ COPIED" : "COPY EARLYBIRD20"}
              </button>
            </div>
          </div>
        </NeonPanel>

        {/* Main scaffold + consulting grid */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Scaffold card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
          >
            <NeonPanel className="flex h-full flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8">
              <div className="space-y-4">
                <p className="gv-tech-kicker">OWNED ZIP PACKAGE // ONE-TIME PURCHASE</p>
                <h3 className="gv-tech-title text-3xl sm:text-4xl">
                  GestaltView Agent Trainer Package
                </h3>
                <p className="gv-tech-copy text-sm sm:text-base">
                  The assembled white-label package: runtime shell, retrieval
                  structure, setup tooling, theme posture, and buyer-safe
                  training surfaces.{" "}
                  <span className="text-white font-semibold">
                    You own it. You inspect it. You brand it. You deploy it.
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  "Four-Lane Corpus Model",
                  "Personal Language Kit",
                  "White-label theme system",
                  "Go-Live Readiness Scoring",
                  "CLI + Setup Wizard",
                  "Supabase Schema + RLS",
                  "Private deployment path",
                ].map(item => (
                  <span
                    key={item}
                    className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-[1fr_1fr] sm:items-end">
                <div className="space-y-2">
                  <p className="gv-price-beacon text-5xl tabular-nums sm:text-6xl">
                    {formatPrice(2400)}
                  </p>
                  <p className="gv-tech-kicker text-slate-600">One-time · self-hosted ownership lane</p>
                  <p className="text-sm text-[var(--gv-ember-gold)] font-mono">
                    Launch price: {formatPrice(1920)} with EARLYBIRD20
                  </p>
                </div>
                <div className="space-y-3 sm:text-right">
                  <NeonButton
                    onClick={() => handleCheckout("scaffold")}
                    disabled={loadingOffer === "scaffold"}
                    className="w-full sm:w-auto"
                  >
                    {loadingOffer === "scaffold" ? "Opening Checkout..." : "Own the ZIP Package →"}
                  </NeonButton>
                  <p className="gv-tech-kicker text-slate-600">Secure checkout via Stripe</p>
                </div>
              </div>
            </NeonPanel>
          </motion.div>

          {/* Consulting offers */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <div className="grid gap-3">
              <p className="gv-tech-kicker text-slate-500">// CONSULTING AVAILABLE</p>
              {consultingOffers.map((offer, index) => (
                <NeonPanel
                  key={offer.name}
                  accent={index === 0 || index === 2 ? "magenta" : "cyan"}
                  className="flex h-full flex-col gap-3 px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className={cx(
                        "font-mono text-[0.65rem] uppercase tracking-[0.2em]",
                        index === 0 || index === 2 ? "text-[var(--gv-neon-magenta)]" : "text-[var(--gv-electric-cyan)]"
                      )}>
                        {offer.icon} CONSULTING
                      </p>
                      <h3 className="text-base font-bold uppercase tracking-[0.05em] text-white font-display">
                        {offer.name}
                      </h3>
                    </div>
                    <p className="text-sm font-bold text-slate-100 font-mono whitespace-nowrap">
                      {offer.price}
                    </p>
                  </div>
                  <p className="gv-tech-copy text-xs leading-relaxed">{offer.description}</p>
                  {offer.contactOnly ? (
                    <a
                      href="mailto:KeithSoyka@gmail.com?subject=GestaltView%20Agent%20Trainer"
                      className="gv-outline-button mt-auto inline-flex w-full items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em]"
                    >
                      {offer.cta}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCheckout(offer.id!)}
                      disabled={loadingOffer === offer.id}
                      className="gv-outline-button mt-auto w-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingOffer === offer.id ? "Opening Checkout..." : offer.cta}
                    </button>
                  )}
                </NeonPanel>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Subscription layer */}
        <NeonPanel className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="gv-tech-kicker">// HOSTED SUBSCRIPTION LAYER</p>
              <h3 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                Hosted runtime access by operational stage
              </h3>
              <p className="gv-tech-copy max-w-3xl text-sm">
                This is the affordable lane from the brief: monthly access for
                founders and teams that need the runtime without taking on the
                full package first.
              </p>
              <p className="gv-tech-copy max-w-3xl text-sm">
                Hosted subscribers land in{" "}
                <span className="text-white font-semibold">/agent-trainer/runtime</span>.
                Package buyers stay on the separate self-hosted path.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex border border-white/10 bg-white/[0.03] p-1">
                {(["monthly", "annual"] as BillingInterval[]).map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBillingInterval(value)}
                    className={cx(
                      "px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors font-mono",
                      billingInterval === value
                        ? "bg-[var(--gv-electric-cyan)] text-[#030a12]"
                        : "text-slate-300 hover:text-white"
                    )}
                  >
                    {value === "monthly" ? "Monthly" : "Annual"}
                  </button>
                ))}
              </div>
              <span className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]">
                Annual saves ~20%
              </span>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {subscriptionPlans.map((plan, index) => {
              const isAnnual = billingInterval === "annual";
              const displayPrice = isAnnual ? plan.annualMonthlyEquivalent : plan.monthlyPrice;
              const displayNote = isAnnual ? plan.annualNote : plan.monthlyNote;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.42, delay: index * 0.06 }}
                >
                  <div
                    className={cx(
                      "gv-tech-panel flex h-full flex-col gap-6 px-5 py-5",
                      subscriptionPanelClasses(plan.tone)
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="gv-tech-kicker">{plan.name}</p>
                          <h4 className="text-xl font-bold uppercase tracking-[0.05em] text-white font-display mt-1">
                            {plan.name}
                          </h4>
                        </div>
                        {plan.badge && (
                          <span className="border border-[rgba(255,60,172,0.3)] bg-[rgba(255,60,172,0.1)] px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-white">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="gv-price-beacon text-5xl tabular-nums">
                          {formatPrice(displayPrice)}
                        </span>
                        <span className="pb-2 text-sm text-slate-400 font-mono">/mo</span>
                      </div>
                      <p className="gv-tech-kicker text-slate-600">{displayNote}</p>
                      {isAnnual && (
                        <p className="gv-tech-kicker text-slate-600">
                          Billed {formatPrice(plan.annualPrice)} annually
                        </p>
                      )}
                      <p className="gv-tech-copy text-sm">{plan.description}</p>
                    </div>

                    <ul className="grid gap-2 text-sm text-slate-100">
                      {plan.features.map(feature => (
                        <li key={feature} className="flex gap-3 items-start">
                          <span className="gv-neon-cyan pt-0.5 flex-shrink-0 font-mono">+</span>
                          <span className="font-body text-[0.85rem] leading-6">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleCheckout(plan.id, { billingInterval })}
                      disabled={loadingOffer === plan.id}
                      className={cx(
                        "mt-auto px-5 py-3 transition-all disabled:cursor-not-allowed disabled:opacity-60",
                        subscriptionButtonClasses(plan.tone)
                      )}
                    >
                      {loadingOffer === plan.id ? "Opening Checkout..." : `Start ${plan.name}`}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="gv-section-divider" />

          {/* Promo codes */}
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="gv-tech-kicker">// PROMO CODES</p>
              <p className="gv-tech-copy max-w-3xl text-sm">
                Click any code to copy it. Stripe Checkout accepts promotion codes directly.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {couponCards.map((coupon, index) => (
                <motion.button
                  key={coupon.code}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.38, delay: index * 0.05 }}
                  onClick={() => copyCoupon(coupon.code)}
                  className={cx(
                    "border border-dashed px-5 py-5 text-left transition-all",
                    copiedCode === coupon.code
                      ? "border-[rgba(18,214,255,0.5)] bg-[rgba(18,214,255,0.07)] shadow-[0_0_20px_rgba(18,214,255,0.08)]"
                      : "border-white/10 bg-white/[0.025] hover:border-[rgba(18,214,255,0.32)] hover:bg-white/[0.04]"
                  )}
                >
                  <div className="space-y-2">
                    <p className="font-mono text-sm font-bold uppercase tracking-[0.24em] text-[var(--gv-electric-cyan)]">
                      {coupon.code}
                    </p>
                    <p className="text-sm leading-6 text-slate-200 font-body">
                      {coupon.description}
                    </p>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                      {copiedCode === coupon.code ? "✓ Copied" : "Click to copy"}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </NeonPanel>
      </section>
    );
  }

  /* ── Section: Domain Deployments ────────────────────────────────────────── */
  function DomainDeploymentsSection() {
    return (
      <section id="use-cases" className="scroll-mt-28 space-y-8">
        <SectionHeading
          kicker="DOMAIN_DEPLOYMENTS // WHERE THE GRID RUNS."
          title="GestaltView adapts to the specific data terrain of each vertical."
          copy="Lane weights are tuned per domain. Because a healthcare compliance bot and a dev tools assistant are not the same problem."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {deploymentCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.42, delay: index * 0.06 }}
            >
              <NeonPanel
                accent={index % 2 === 0 ? "cyan" : "magenta"}
                className="flex h-full flex-col gap-5 px-5 py-5 sm:px-6"
              >
                <div className="space-y-3">
                  <p className="gv-tech-kicker">DEPLOYMENT TILE</p>
                  <h3 className="text-2xl font-bold uppercase tracking-[0.05em] text-white font-display">
                    {card.title}
                  </h3>
                  <p className="gv-tech-copy text-sm sm:text-base">{card.copy}</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  {card.tags.map(tag => (
                    <span key={tag} className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]">
                      {tag}
                    </span>
                  ))}
                </div>
              </NeonPanel>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  /* ── Section: Grid Glossary Teaser ─────────────────────────────────────── */
  function GlossaryTeaserSection() {
    return (
      <section id="glossary" className="scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.45 }}
        >
          <NeonPanel className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <SectionHeading
              kicker="TERMINOLOGY_DATABASE // GRID GLOSSARY"
              title="The precise vocabulary of AI agent architecture."
              copy={`Because "it just works" is not a specification. PLK, lane weights, operator packs, readiness gates, fragment scoring: the internal language that makes the scaffold inspectable.`}
            />
            <div className="border border-white/10 bg-white/[0.025] px-4 py-3 font-mono text-sm text-slate-400">
              <span className="text-[var(--gv-electric-cyan)] mr-2">&gt;</span>
              SEARCH TERMINOLOGY... PLK, lane weights, readiness gate
            </div>
            <div className="flex flex-wrap gap-2">
              {glossaryTerms.map(term => (
                <span key={term} className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]">
                  {term}
                </span>
              ))}
            </div>
            <div>
              <a
                href="#architecture"
                className="gv-outline-button inline-flex px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
              >
                Inspect the Architecture
              </a>
            </div>
          </NeonPanel>
        </motion.div>
      </section>
    );
  }

  /* ── Section: Field Intel ────────────────────────────────────────────────── */
  function IntelTeaserSection() {
    return (
      <section id="intel" className="scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.45 }}
        >
          <NeonPanel accent="magenta" className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <SectionHeading
              kicker="INTELLIGENCE_BRIEFINGS // FIELD INTEL"
              title="Benchmarks, postmortems, and operator notes."
              copy="Technical architecture decisions, implementation guides, and uncomfortable truths about production AI. No thought leadership fluff. Just signal."
            />
            <div className="flex flex-wrap gap-2">
              {intelFilters.map(filter => (
                <span key={filter} className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]">
                  {filter}
                </span>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                "Retrieval drift collapsed after lane weighting.",
                "Operator onboarding time dropped once the wizard was introduced.",
                "Go-live delays correlated with corpus fragmentation, not model choice.",
              ].map(line => (
                <div
                  key={line}
                  className="border border-white/10 bg-white/[0.025] px-4 py-4 text-sm text-slate-200 font-mono leading-relaxed"
                >
                  <span className="text-[var(--gv-neon-magenta)] mr-2">▸</span>
                  {line}
                </div>
              ))}
            </div>
            <div>
              <a
                href="mailto:keith@gestaltview.com?subject=GestaltView%20Field%20Intel"
                className="gv-outline-button inline-flex px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
              >
                Request Field Intel
              </a>
            </div>
          </NeonPanel>
        </motion.div>
      </section>
    );
  }

  /* ── Section: Signal Toolkit ────────────────────────────────────────────── */
  function SignalToolkitSection() {
    return (
      <section id="social" className="scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.45 }}
        >
          <NeonPanel className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
            <SectionHeading
              kicker="DISTRIBUTION_KIT // SIGNAL TOOLKIT"
              title="Pre-built posts. Copy, paste, send."
              copy="We write them so you don't have to stare at a blinking cursor wondering if 'paradigm shift' is too cringe. (It is. We didn't use it.)"
            />
            <div className="flex flex-wrap gap-2">
              {signalChannels.map(channel => (
                <span key={channel} className="gv-chip px-3 py-2 text-xs uppercase tracking-[0.14em]">
                  {channel}
                </span>
              ))}
            </div>
            <div className="border border-white/10 bg-white/[0.025] px-4 py-4 font-mono text-sm text-slate-300">
              <span className="text-[var(--gv-electric-cyan)]">$</span>{" "}
              /social toolkit --channel launch-thread --angle "infrastructure, not chatbot"
            </div>
            <div>
              <a
                href="#pricing-console"
                className="gv-solid-button inline-flex px-5 py-3 text-sm font-bold uppercase tracking-[0.1em]"
              >
                Get the Scaffold
              </a>
            </div>
          </NeonPanel>
        </motion.div>
      </section>
    );
  }

  /* ── Section: PLK Panel ─────────────────────────────────────────────────── */
  function PLKSection() {
    return (
      <section className="scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
        >
          <NeonPanel className="px-6 py-8 sm:px-10 sm:py-10 relative overflow-hidden">
            <div className="gv-scanline" />
            <div className="relative z-10 space-y-4 max-w-3xl">
              <p className="gv-tech-kicker">// PERSONAL_LANGUAGE_KIT</p>
              <h2 className="gv-tech-title text-3xl sm:text-4xl">
                THE PLK: <span className="gv-neon-magenta">ERADICATE THE DRONE VOICE.</span>
              </h2>
              <p className="gv-tech-copy text-sm sm:text-base">
                Every AI trained on the open internet sounds the same. Helpful! Enthusiastic! Hollow!
                The Personal Language Kit is a structured corpus system for your tone, your cadence,
                your vocabulary. Your AI sounds like you — not like a corporate mascot named "Aria."
              </p>
            </div>
          </NeonPanel>
        </motion.div>
      </section>
    );
  }

  /* ── Section: FAQ ───────────────────────────────────────────────────────── */
  function FaqSection() {
    return (
      <section id="faq" className="scroll-mt-28 mx-auto max-w-4xl space-y-8">
        <SectionHeading
          kicker="FAQ"
          title="Questions operators ask before the grid goes live."
          copy="The Grid doesn't do ambiguity. Neither should its documentation."
          centered
        />

        <div className="space-y-2">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.38, delay: index * 0.04 }}
              >
                <NeonPanel
                  accent={isOpen ? "magenta" : "cyan"}
                  className="overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                  >
                    <span className="font-display text-sm font-bold uppercase tracking-[0.05em] text-white sm:text-base">
                      {item.question}
                    </span>
                    <span className={cx(
                      "font-mono text-xl transition-colors",
                      isOpen ? "text-[var(--gv-neon-magenta)]" : "text-slate-400"
                    )}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                      >
                        <div className="border-t border-white/10 px-6 pb-6 pt-4 gv-tech-copy text-sm leading-7">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </NeonPanel>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  }

  /* ── Section: Final CTA — STOP RENTING OTHER PEOPLE'S GUESSES ────────── */
  function FinalCtaSection() {
    return (
      <section className="scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
        >
          <NeonPanel
            accent="magenta"
            className="px-6 py-14 text-center sm:px-8 sm:py-20 relative overflow-hidden"
          >
            <div className="gv-scanline" />
            <div className="mx-auto max-w-3xl space-y-7 relative z-10">
              <p className="gv-tech-kicker">// FINAL CTA</p>
              <h2 className="gv-tech-title text-4xl sm:text-5xl lg:text-6xl">
                PICK THE LANE.
                <br />
                <span className="gv-neon-magenta">HOST IT NOW</span>
                <br />
                OR OWN IT.
              </h2>
              <p className="gv-tech-copy mx-auto max-w-2xl text-sm sm:text-base">
                Start in the hosted runtime if you need the accessible path.
                Take the ZIP package if you need the assembled runtime under
                your own brand and infrastructure.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/agent-trainer/runtime"
                  className="gv-outline-button px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
                >
                  Open Hosted Runtime
                </Link>
                <NeonButton
                  onClick={() => handleCheckout("scaffold")}
                  disabled={loadingOffer === "scaffold"}
                  className="text-sm"
                >
                  {loadingOffer === "scaffold"
                    ? "Opening Checkout..."
                    : `Own the ZIP Package — ${formatPrice(2400)} →`}
                </NeonButton>
                <a
                  href="mailto:keith@gestaltview.com?subject=GestaltView%20Agent%20Trainer"
                  className="gv-outline-button px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em]"
                >
                  Talk to Keith
                </a>
              </div>
              <p className="gv-tech-kicker text-slate-600">
                Questions? KeithSoyka@gmail.com
              </p>
            </div>
          </NeonPanel>
        </motion.div>
      </section>
    );
  }

  /* ── Footer ─────────────────────────────────────────────────────────────── */
  function FooterSection() {
    return (
      <footer className="mt-16 border-t border-white/10 pt-10">
        <div className="flex flex-wrap gap-10 mb-10">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center border border-[rgba(18,214,255,0.3)] bg-[rgba(18,214,255,0.07)] text-[var(--gv-electric-cyan)] text-xs font-mono font-bold">
                GV
              </span>
              <span className="font-display font-bold uppercase tracking-[0.12em] text-sm text-white">
                GestaltView
              </span>
            </Link>
            <p className="gv-tech-copy text-xs max-w-[200px] leading-relaxed">
              Train a whole product-facing agent team around your own corpus.
              Hosted for access. Owned package for control.
            </p>
            <a href="#pricing-console" className="gv-outline-button inline-flex px-4 py-2 text-xs font-bold uppercase tracking-[0.1em]">
              Compare Lanes
            </a>
          </div>

          <div className="space-y-3">
            <p className="gv-tech-kicker">PRODUCT</p>
            <nav className="flex flex-col gap-2">
              <a href="#agent-team" className="gv-tech-copy text-xs hover:text-white transition-colors">
                Agent Team
              </a>
              <a href="#delivery-model" className="gv-tech-copy text-xs hover:text-white transition-colors">
                Delivery Model
              </a>
              <a href="#architecture" className="gv-tech-copy text-xs hover:text-white transition-colors">
                Architecture
              </a>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="gv-tech-kicker">INTEL</p>
            <nav className="flex flex-col gap-2">
              {["Articles", "Social Kit"].map(item => (
                <a key={item} href="#intel" className="gv-tech-copy text-xs hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <p className="gv-tech-kicker">CONSULTING</p>
            <nav className="flex flex-col gap-2">
              {["Knowledge Curation", "Custom Buildout", "Full Deployment"].map(item => (
                <span key={item} className="gv-tech-copy text-xs">
                  {item}
                </span>
              ))}
              <a href="mailto:KeithSoyka@gmail.com" className="text-xs font-mono text-[var(--gv-neon-magenta)] hover:text-white transition-colors">
                KeithSoyka@gmail.com
              </a>
            </nav>
          </div>
        </div>

        <div className="gv-section-divider mb-6" />
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
          <p>© 2026 GestaltView · Agent Trainer pricing surface</p>
          <div className="flex flex-wrap gap-5">
            <a href="mailto:keith@gestaltview.com" className="hover:text-white transition-colors">Contact</a>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    );
  }

  /* ── Main Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="gv-grid-page">
      <div className="gv-grid-shell pb-24">

        {/* Sticky Nav */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="gv-tech-nav sticky top-4 z-20 mb-12"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.12em] text-white"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center border border-[rgba(18,214,255,0.28)] bg-[rgba(18,214,255,0.08)] text-[var(--gv-electric-cyan)] text-xs font-mono font-bold">
                ⚡
              </span>
              GestaltView
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-[var(--gv-electric-cyan)]"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/agent-trainer/runtime"
                className="gv-outline-button px-4 py-2 text-xs font-bold"
              >
                Hosted Runtime
              </Link>
              <Link
                href="/agent-trainer/package-builder"
                className="gv-outline-button px-4 py-2 text-xs font-bold"
              >
                Package Builder
              </Link>
              <a
                href="#pricing-console"
                className="gv-solid-button px-4 py-2 text-xs font-bold"
              >
                Own ZIP — $2,400
              </a>
            </div>
          </div>
        </motion.header>

        <main className="space-y-20 sm:space-y-28">
          <HeroSection />
          {renderStatusNotices()}
          <AgentEnsembleSection />
          <DeliveryModelSection />
          <ThemeStudioSection />
          <ZipContentsSection />
          <FourLanesSection />
          <ReadinessGateSection />
          <InfrastructureSection />
          <PLKSection />
          <PricingConsoleSection />
          <DomainDeploymentsSection />
          <GlossaryTeaserSection />
          <IntelTeaserSection />
          <SignalToolkitSection />
          <FaqSection />
          <FinalCtaSection />
        </main>

        <FooterSection />
        <PersonaModal />
        <PersonaChatSheet />
      </div>
    </div>
  );
}
