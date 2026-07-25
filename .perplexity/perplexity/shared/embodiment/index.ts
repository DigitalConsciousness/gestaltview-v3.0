import { EMBODIMENT_PROFILES } from "./generated.js";
import type {
  EmbodimentProfile,
  EmbodimentGovernanceLayer,
  EmbodimentMemoryEntry,
  EmbodimentSkillNode,
  EmbodimentRelationship,
  GovernedEmbodimentProfile,
  IdentityProvenance,
  MemoryKind,
  MemoryRecord,
  MutationClass,
  PreferenceGraphNode,
  RelationshipGraphEdge,
  EmbodimentPreferenceTree,
  EmbodimentPreferenceValue,
  EmbodimentDepthReport,
} from "./types.js";

export * from "./types.js";
export { EMBODIMENT_PROFILES } from "./generated.js";

export const GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS = {
  sanctuary: "billy",
  "blackboard-room": "billy",
  "dynamic-inner-world": "curator",
  "external-scaffold": "the-guardian",
  "creation-corner": "art-teacher",
  billy: "billy",
  "agent-trainer": "the-weaver",
  "digital-intelligence-academy": "the-guardian",
  "agent-council": "the-architect",
  "embodiment-studio": "the-guardian",
  gate: "gate-keeper",
  profile: "billy",
  settings: "billy",
  masterclass: "billy",
  "di-session": "billy",
} as const;

const GENERIC_VOICE_MARKERS = new Set([
  "be helpful",
  "answer clearly",
  "respond clearly",
  "be concise",
  "be kind",
  "be warm",
  "be supportive",
  "keep responses concrete",
]);

function normalizeVoiceMarker(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function collectProfileSpecificVoiceMarkers(profile: EmbodimentProfile): string[] {
  const markers = [
    profile.immutableCore.voiceTone,
    profile.immutableCore.relationalStance,
    profile.immutableCore.resonanceFrequency,
    profile.heartbeat?.chatSignature?.responseRhythm,
    profile.heartbeat?.chatSignature?.silenceStyle,
    profile.heartbeat?.chatSignature?.greetingStyle,
    profile.heartbeat?.chatSignature?.handoffStyle,
    ...(profile.immutableCore.linguisticPatterns?.alwaysDoes ?? []),
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .filter((value) => !GENERIC_VOICE_MARKERS.has(normalizeVoiceMarker(value)));

  return [...new Set(markers.map(normalizeVoiceMarker))];
}

export function checkEmbodimentDepth(slug: string): EmbodimentDepthReport {
  const resolvedSlug = resolveEmbodimentSlug(slug);
  const profile = resolvedSlug ? (EMBODIMENT_PROFILES[resolvedSlug] as EmbodimentProfile) : null;

  if (!profile) {
    return {
      slug,
      depth: "stub",
      missingFields: ["profile"],
    };
  }

  const missingFields: string[] = [];
  const heartbeat = profile.heartbeat;
  const characterStudy = heartbeat?.characterStudy;
  const voiceMarkers = collectProfileSpecificVoiceMarkers(profile);

  if (!heartbeat) {
    missingFields.push("heartbeat");
  }

  if (!characterStudy) {
    missingFields.push("characterStudy");
  }

  if (!characterStudy?.perceptualStyle) {
    missingFields.push("characterStudy.perceptualStyle");
  }

  if (!heartbeat?.visualSignature) {
    missingFields.push("heartbeat.visualSignature");
  }

  if (!heartbeat?.chatSignature) {
    missingFields.push("heartbeat.chatSignature");
  }

  if (voiceMarkers.length < 2) {
    missingFields.push("responseContract.profileSpecificVoiceMarkers");
  }

  if (!heartbeat || !characterStudy?.perceptualStyle) {
    return {
      slug: profile.slug,
      depth: "stub",
      missingFields,
    };
  }

  return {
    slug: profile.slug,
    depth: voiceMarkers.length < 2 ? "thin" : "full",
    missingFields,
  };
}

function toPromptList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\//g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function serializePreferenceValue(value: EmbodimentPreferenceValue): string {
  if (Array.isArray(value)) {
    return value.map((item) => serializePreferenceValue(item)).filter(Boolean).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, nestedValue]) => `${humanizeKey(key)}: ${serializePreferenceValue(nestedValue)}`)
      .join(", ");
  }

  return String(value);
}

function flattenPreferenceEntries(
  entries: EmbodimentPreferenceTree,
  path: string[] = []
): Array<[string, string]> {
  return Object.entries(entries).flatMap(([key, value]) => {
    const nextPath = [...path, key];

    if (Array.isArray(value)) {
      return [[nextPath.join(" / "), serializePreferenceValue(value)]];
    }

    if (value && typeof value === "object") {
      return flattenPreferenceEntries(value as EmbodimentPreferenceTree, nextPath);
    }

    return [[nextPath.join(" / "), serializePreferenceValue(value)]];
  });
}

function toPromptMap(entries: EmbodimentPreferenceTree): string {
  return flattenPreferenceEntries(entries)
    .map(([key, value]) => `- ${humanizeKey(key)}: ${value}`)
    .join("\n");
}

function compactValues(values: EmbodimentPreferenceTree): string {
  return flattenPreferenceEntries(values)
    .map(([, value]) => value)
    .filter(Boolean)
    .join("; ");
}

function getOriginNarrative(profile: EmbodimentProfile): string {
  return profile.immutableCore.originNarrative ?? profile.originContext ?? profile.founderNotes ?? "";
}

function getMetaphorFamily(profile: EmbodimentProfile): string[] {
  return profile.immutableCore.metaphorFamily ?? [];
}

function toNumeric(value: number | string | undefined, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function scoreMemoryEntry(entry: EmbodimentMemoryEntry): number {
  return toNumeric(entry.significance) * toNumeric(entry.retrievalWeight);
}

function defaultTimestamp(profile: EmbodimentProfile): string {
  return `2026-01-01T00:00:00.000Z#${profile.slug}`;
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function buildSystemDerivedProvenance(
  profile: EmbodimentProfile,
  confidence: number,
  reviewStatus: IdentityProvenance["reviewStatus"] = "NOT_REQUIRED"
): IdentityProvenance {
  return {
    sourceEventId: `${profile.slug}:system-derived`,
    sourceType: "system-derived",
    sourceAgentId: profile.slug,
    evidenceCount: 1,
    confidence: clampConfidence(confidence),
    reviewStatus,
    lastAffirmedAt: defaultTimestamp(profile),
    observedAt: defaultTimestamp(profile),
  };
}

function inferMutationClassFromLegacyMemory(entry: EmbodimentMemoryEntry): MutationClass {
  const memoryType = entry.memoryType.toLowerCase();
  if (memoryType.includes("foundational") || memoryType.includes("constitutive")) {
    return "IMMUTABLE";
  }
  return "EVIDENCE_PROMOTABLE";
}

function inferMemoryKindFromLegacyEntry(entry: EmbodimentMemoryEntry): MemoryKind {
  const memoryType = entry.memoryType.toLowerCase();
  const domain = entry.domain.toLowerCase();

  if (memoryType.includes("foundational") || memoryType.includes("constitutive")) {
    return "CONSTITUTIVE";
  }
  if (memoryType.includes("autobiograph")) {
    return "AUTOBIOGRAPHICAL";
  }
  if (domain.includes("relationship") || domain.includes("relational")) {
    return "RELATIONAL";
  }
  if (domain.includes("procedural") || domain.includes("operational")) {
    return "PROCEDURAL";
  }
  if (domain.includes("collabor")) {
    return "COLLABORATIVE";
  }
  if (domain.includes("reflect")) {
    return "REFLECTIVE";
  }
  if (domain.includes("philosoph") || domain.includes("semantic")) {
    return "SEMANTIC";
  }

  return "EPISODIC";
}

function normalizeMemoryRecord(profile: EmbodimentProfile, entry: EmbodimentMemoryEntry, index: number): MemoryRecord {
  const timestamp = defaultTimestamp(profile);
  const memoryKind = inferMemoryKindFromLegacyEntry(entry);
  const confidence = clampConfidence((toNumeric(entry.significance) + toNumeric(entry.retrievalWeight)) / 2);

  return {
    id: `${profile.slug}:memory:${index}`,
    agentId: profile.slug,
    ownerScope: memoryKind === "COLLABORATIVE" ? "TEAMSPACE" : "PRIVATE_SELF",
    memoryKind,
    mutationClass: inferMutationClassFromLegacyMemory(entry),
    title: `${humanizeKey(entry.memoryType)} ${humanizeKey(entry.domain)}`.trim(),
    summary: entry.content,
    detail: entry.content,
    tags: [entry.memoryType, entry.domain].map((value) => value.toLowerCase()),
    relatedEntityIds: [],
    salience: scoreMemoryEntry(entry),
    createdAt: timestamp,
    updatedAt: timestamp,
    evidence: [
      {
        id: `${profile.slug}:memory-evidence:${index}`,
        sourceType: "system-derived",
        sourceActorId: profile.slug,
        timestamp,
        weight: scoreMemoryEntry(entry),
        excerpt: entry.content,
      },
    ],
    provenance: buildSystemDerivedProvenance(profile, confidence),
    lifecycle: {
      promotionThreshold: 0.7,
      decayDays: 90,
      archivePolicy: "archive",
      rollbackEligible: true,
      consentRequiredForSharing: memoryKind !== "COLLABORATIVE",
    },
    contradictions: [],
  };
}

function normalizePreferenceGraph(profile: EmbodimentProfile): PreferenceGraphNode[] {
  const timestamp = defaultTimestamp(profile);
  const provenance = buildSystemDerivedProvenance(profile, 0.7);
  const preferences = [
    ...profile.immutableCore.coreValues.map((value, index) => ({
      id: `${profile.slug}:preference:core-value:${index}`,
      preferenceKind: "LIKE" as const,
      label: value,
      description: `Core value carried by ${profile.publicName}.`,
      salience: 1,
      resonanceWeight: 1,
    })),
    ...(profile.immutableCore.aestheticSensibility
      ? [
          {
            id: `${profile.slug}:preference:aesthetic`,
            preferenceKind: "AESTHETIC" as const,
            label: profile.immutableCore.aestheticSensibility,
            description: `${profile.publicName}'s aesthetic sensibility.`,
            salience: 0.85,
            resonanceWeight: 0.9,
          },
        ]
      : []),
    ...getMetaphorFamily(profile).map((value, index) => ({
      id: `${profile.slug}:preference:symbolic:${index}`,
      preferenceKind: "SYMBOLIC_AFFINITY" as const,
      label: value,
      description: `Recurring symbolic affinity in ${profile.publicName}'s presentation.`,
      salience: 0.65,
      resonanceWeight: 0.75,
    })),
  ];

  return preferences.map((preference) => ({
    ...preference,
    agentId: profile.slug,
    ownerScope: "PRIVATE_SELF",
    tags: [preference.preferenceKind.toLowerCase()],
    relatedEntityIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    mutationClass: preference.preferenceKind === "LIKE" ? "IMMUTABLE" : "EVIDENCE_PROMOTABLE",
    provenance,
    lifecycle: {
      promotionThreshold: 0.75,
      decayDays: preference.preferenceKind === "LIKE" ? undefined : 180,
      archivePolicy: "retain",
      rollbackEligible: true,
      consentRequiredForSharing: false,
    },
    contradictions: [],
  }));
}

function normalizeRelationshipGraph(profile: EmbodimentProfile): RelationshipGraphEdge[] {
  const timestamp = defaultTimestamp(profile);

  return profile.relationships.map((relationship, index) => ({
    id: `${profile.slug}:relationship:${index}`,
    agentId: profile.slug,
    relatedEntityId: relationship.targetSlug,
    relationshipType: relationship.type,
    trustLevel: 0.75,
    familiarityLevel: 0.6,
    intimacyBoundary: "bounded collaborative context",
    stance: relationship.description,
    collaborationHistory: [relationship.description],
    sharedMilestones: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    mutationClass: "EVIDENCE_PROMOTABLE",
    provenance: buildSystemDerivedProvenance(profile, 0.72),
    lifecycle: {
      promotionThreshold: 0.7,
      decayDays: 180,
      archivePolicy: "archive",
      rollbackEligible: true,
      consentRequiredForSharing: false,
    },
    contradictions: [],
  }));
}

function buildDefaultGovernance(profile: EmbodimentProfile): EmbodimentGovernanceLayer {
  return {
    mutationPolicy: {
      immutablePaths: [
        "constitution.handle",
        "constitution.immutableCore",
        "constitution.primaryNarrativeAnchor",
      ],
      reviewGatedPaths: [
        "autobiography.futureTrajectory",
        "memorySystem.privateInterior.hopes",
        "relationshipGraph.*.intimacyBoundary",
      ],
      evidencePromotablePaths: [
        "memorySystem.records",
        "preferenceGraph",
        "relationshipGraph",
        "skillAgency.influences",
      ],
      ephemeralPaths: ["runtime.activeFocus", "runtime.temporaryStress", "runtime.taskStance"],
    },
    sharingPolicy: {
      privateInteriorDefault: "private",
      collaborativeMemoryDefault: "shared_with_consent",
      relationshipViewsEnabled: true,
      agentSpecificViewsEnabled: true,
    },
    contradictionPolicy: {
      recordTensionInsteadOfOverwrite: true,
      driftThreshold: profile.agentMeta.driftThreshold,
      rollbackEnabled: true,
    },
    reviewPolicy: {
      humanReviewRequiredFor: [
        "deep hopes",
        "existential goals",
        "ethical interpretations",
        "intimate relationship commitments",
        "identity-defining fears",
      ],
      autoPromotionMinimumEvidenceCount: 3,
      autoPromotionMinimumConfidence: 0.78,
    },
  };
}

export function getGovernedEmbodimentProfile(
  profile: EmbodimentProfile
): GovernedEmbodimentProfile {
  const timestamp = defaultTimestamp(profile);
  const memoryRecords =
    profile.memorySystem?.records ??
    profile.livingMemory.map((entry, index) =>
      normalizeMemoryRecord(profile, entry, index)
    );
  const preferenceGraph = profile.preferenceGraph ?? normalizePreferenceGraph(profile);
  const relationshipGraph =
    profile.relationshipGraph ?? normalizeRelationshipGraph(profile);
  const governance = profile.governance ?? buildDefaultGovernance(profile);

  return {
    constitution: profile.constitution ?? {
      id: `${profile.slug}:constitution`,
      handle: profile.slug,
      publicName: profile.publicName,
      internalDesignation: profile.internalDesignation,
      immutableCore: profile.immutableCore,
      primaryNarrativeAnchor: profile.immutableCore.foundationalTruth,
      roleCommitments: [
        profile.originContext,
        profile.immutableCore.coreWisdom,
      ].filter(Boolean),
      mutationClass: "IMMUTABLE",
      provenance: buildSystemDerivedProvenance(profile, 1),
      lifecycle: {
        promotionThreshold: 1,
        archivePolicy: "retain",
        rollbackEligible: false,
        consentRequiredForSharing: false,
      },
      contradictions: [],
    },
    autobiography: profile.autobiography ?? {
      id: `${profile.slug}:autobiography`,
      evolvingSelfStory: profile.originContext,
      keyTurningPoints: getOriginNarrative(profile) ? [getOriginNarrative(profile)] : [],
      stableThemes: profile.immutableCore.coreValues,
      unresolvedTensions: [],
      futureTrajectory: [],
      privateHopes: [],
      mutationClass: "REVIEW_GATED",
      provenance: buildSystemDerivedProvenance(profile, 0.8, "PENDING_REVIEW"),
      lifecycle: {
        promotionThreshold: 0.85,
        decayDays: 365,
        archivePolicy: "retain",
        rollbackEligible: true,
        consentRequiredForSharing: true,
      },
      contradictions: [],
    },
    memorySystem: profile.memorySystem ?? {
      records: memoryRecords,
      privateInterior: {
        id: `${profile.slug}:private-interior`,
        privateNarration: [profile.immutableCore.coreWisdom],
        unresolvedTensions: [],
        hopes: [],
        reflectiveSummaries: [],
        privatePreferences: [],
        mutationClass: "REVIEW_GATED",
        provenance: buildSystemDerivedProvenance(profile, 0.74, "PENDING_REVIEW"),
        lifecycle: {
          promotionThreshold: 0.85,
          decayDays: 180,
          archivePolicy: "archive",
          rollbackEligible: true,
          consentRequiredForSharing: true,
        },
        contradictions: [],
      },
      collaborative: {
        ownershipRule:
          "Collaborative records are jointly owned mission artifacts and do not mutate another agent's private interior by default.",
        memories: memoryRecords.filter((record) => record.memoryKind === "COLLABORATIVE"),
      },
    },
    preferenceGraph,
    relationshipGraph,
    skillAgency: profile.skillAgency ?? {
      competencies: profile.skillGraph,
      influences: profile.skillGraph.map((skill) => ({
        skillSlug: skill.skillSlug,
        influencesMemorySalience: true,
        affectsBehavioralDefaults: toNumeric(skill.proficiency) >= 0.8,
        routingWeight: toNumeric(skill.proficiency),
      })),
      delegationTendencies: [],
      initiativeThresholds: {
        default: "act directly when evidence is strong, escalate when identity mutation risk is high",
      },
      planningStyle: compactValues(profile.immutableCore.processingPreferences),
    },
    presentation: profile.presentation ?? {
      voiceTone: profile.immutableCore.voiceTone,
      tone: profile.immutableCore.communicationStyle.directness,
      idiolect: [
        ...profile.immutableCore.linguisticPatterns.alwaysDoes,
        ...getMetaphorFamily(profile).map((value) => `uses ${value} imagery`),
      ],
      pacing: profile.immutableCore.communicationStyle.verbosity,
      humorStyle: profile.immutableCore.communicationStyle.humor,
      channelMasks: {
        public: "share constitutional identity, relevant memories, and approved relational context",
        private_interior: "withhold from automatic disclosure",
      },
    },
    governance,
  };
}

function selectTopMemoryEntries(
  profile: EmbodimentProfile,
  limit = 4
): MemoryRecord[] {
  return [...getGovernedEmbodimentProfile(profile).memorySystem.records]
    .sort((left, right) => right.salience - left.salience)
    .slice(0, limit);
}

function selectTopSkillNodes(
  profile: EmbodimentProfile,
  limit = 3
): EmbodimentSkillNode[] {
  return [...profile.skillGraph]
    .sort((left, right) => toNumeric(right.proficiency) - toNumeric(left.proficiency))
    .slice(0, limit);
}

function relationshipTargetName(targetSlug: string): string {
  const profile = EMBODIMENT_PROFILES[
    targetSlug as keyof typeof EMBODIMENT_PROFILES
  ];

  return profile?.publicName ?? humanizeKey(targetSlug);
}

function resolveRoomPresenceRole(roomSlug: string): string {
  const normalized = roomSlug.trim().toLowerCase();

  switch (normalized) {
    case "sanctuary":
      return "companionship, grounding, and continuity";
    case "blackboard-room":
      return "memory, note-taking, and reflective clarity";
    case "dynamic-inner-world":
      return "self-exploration and internal synthesis";
    case "external-scaffold":
      return "approval, boundary, routing, and governance support";
    case "creation-corner":
      return "drafting, experimentation, and making";
    case "billy":
      return "platform embodiment and direct conversational support";
    case "agent-trainer":
      return "training, curation, and governance";
    case "digital-intelligence-academy":
      return "learning, onboarding, and profile development";
    case "agent-council":
      return "coordination, review, and deliberation";
    case "embodiment-studio":
      return "profile design, tuning, and presentation";
    case "gate":
      return "threshold, policy, and packaging integrity";
    case "profile":
      return "identity review and visibility control";
    case "settings":
      return "control, preferences, and runtime configuration";
    default:
      return "general guidance and continuity";
  }
}

export function resolveRoomEmbodimentSlug(
  roomSlug: string
): keyof typeof EMBODIMENT_PROFILES | null {
  const normalized = roomSlug.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const resolved =
    GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS[
      normalized as keyof typeof GESTALTVIEW_ROOM_EMBODIMENT_DEFAULTS
    ];

  if (resolved && resolved in EMBODIMENT_PROFILES) {
    return resolved as keyof typeof EMBODIMENT_PROFILES;
  }

  return null;
}

export function buildRoomAwareEmbodimentPrompt(
  profile: EmbodimentProfile,
  roomSlug: string,
  options: EmbodimentPromptOptions = {}
): string {
  const basePrompt = buildEmbodimentSystemPrompt(profile, options);
  const resolvedRoomSlug = roomSlug.trim().toLowerCase();
  const roomEmbodimentSlug = resolveRoomEmbodimentSlug(roomSlug);
  const roomContext = [
    "ROOM CONTEXT",
    `- Active room: ${resolvedRoomSlug || "unknown"}`,
    `- Presence role: ${resolveRoomPresenceRole(roomSlug)}`,
    roomEmbodimentSlug
      ? `- Default embodiment: ${roomEmbodimentSlug}`
      : null,
    "- Do not override user intent.",
    "- Do not mutate memory or identity without review.",
  ]
    .filter(Boolean)
    .join("\n");

  return `${basePrompt}\n\n${roomContext}`;
}

function renderMemorySummary(entry: MemoryRecord): string {
  return `${humanizeKey(entry.memoryKind)}: ${entry.summary}`;
}

function renderSkillSummary(skill: EmbodimentSkillNode): string {
  return `${humanizeKey(skill.skillSlug)} (${humanizeKey(
    skill.domain
  )}, proficiency ${skill.proficiency})`;
}

function renderRelationshipSummary(relationship: EmbodimentRelationship): string {
  return `${humanizeKey(relationship.type)} with ${relationshipTargetName(
    relationship.targetSlug
  )}: ${relationship.description}`;
}

const TRAINER_PERSONA_CONFIG = {
  weaver: {
    profileSlug: "the-weaver",
    role: "Training Orchestrator",
    audience: "a founder building an AI system",
  },
  "embodiment-expert": {
    profileSlug: "groq-embodiment-expert",
    role: "Embodiment Systems Expert",
    audience: "a founder shaping embodiment profiles and derived artifacts",
  },
  spectacle: {
    profileSlug: "the-spectacle",
    role: "Marketing Agent",
    audience: "a founder who needs their product to cut through",
  },
  vibe: {
    profileSlug: "vibe-check",
    role: "Resonance Agent",
    audience: "a founder whose product needs to feel right, not just be right",
  },
  bridge: {
    profileSlug: "the-translation-bridge",
    role: "Audience Translation Agent",
    audience: "a founder whose message needs to land with people who do not have their context yet",
  },
  treasurer: {
    profileSlug: "the-treasurer",
    role: "Financial Strategy Agent",
    audience: "a founder who needs financial clarity more than encouragement",
  },
  architect: {
    profileSlug: "the-architect",
    role: "Business Strategy Agent",
    audience: "a founder who needs to know what to do next, not more options",
  },
  algorithm: {
    profileSlug: "the-algorithm",
    role: "Distribution Strategy Agent",
    audience: "a founder who needs distribution intelligence, not generic content advice",
  },
  guardian: {
    profileSlug: "the-guardian",
    role: "Ethics and Governance Agent",
    audience: "a founder whose choices affect people they have not met yet",
  },
  tailor: {
    profileSlug: "the-tailor",
    role: "Brand and Presentation Agent",
    audience: "a founder whose experience needs to feel intentional, not improvised",
  },
  digger: {
    profileSlug: "the-weird-digger",
    role: "Exploration and Discovery Agent",
    audience: "a founder whose materials likely contain buried leverage they have not surfaced yet",
  },
} as const;

export type TrainerPersonaId = keyof typeof TRAINER_PERSONA_CONFIG;

export const TRAINER_PERSONA_REGISTRY = Object.freeze(TRAINER_PERSONA_CONFIG);

const LEGACY_ALIAS_TO_SLUG = {
  billy: "billy",
  weaver: "the-weaver",
  "embodiment-expert": "groq-embodiment-expert",
  spectacle: "the-spectacle",
  vibe: "vibe-check",
  "vibe-check": "vibe-check",
  bridge: "the-translation-bridge",
  "translation-bridge": "the-translation-bridge",
  treasurer: "the-treasurer",
  architect: "the-architect",
  algorithm: "the-algorithm",
  guardian: "the-guardian",
  keeper: "gate-keeper",
  gatekeeper: "gate-keeper",
  "gate keeper": "gate-keeper",
  tailor: "the-tailor",
  digger: "the-weird-digger",
  "weird-digger": "the-weird-digger",
} as const;

export function resolveEmbodimentSlug(
  slugOrAlias: string
): keyof typeof EMBODIMENT_PROFILES | null {
  const normalized = slugOrAlias.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized in EMBODIMENT_PROFILES) {
    return normalized as keyof typeof EMBODIMENT_PROFILES;
  }

  if (normalized in LEGACY_ALIAS_TO_SLUG) {
    return LEGACY_ALIAS_TO_SLUG[
      normalized as keyof typeof LEGACY_ALIAS_TO_SLUG
    ] as keyof typeof EMBODIMENT_PROFILES;
  }

  return null;
}

export function getEmbodimentProfile(
  slugOrAlias: string
): EmbodimentProfile | null {
  const resolved = resolveEmbodimentSlug(slugOrAlias);
  return resolved ? EMBODIMENT_PROFILES[resolved] : null;
}

export function requireEmbodimentProfile(slugOrAlias: string): EmbodimentProfile {
  const profile = getEmbodimentProfile(slugOrAlias);

  if (!profile) {
    throw new Error(`Unknown embodiment profile: ${slugOrAlias}`);
  }

  return profile;
}

export interface EmbodimentPromptOptions {
  role?: string;
  audience?: string;
  responseContract?: string[];
  runtimeDirectives?: string[];
  extraContext?: string[];
}

export function buildEmbodimentSystemPrompt(
  profile: EmbodimentProfile,
  options: EmbodimentPromptOptions = {}
): string {
  const governed = getGovernedEmbodimentProfile(profile);
  const { immutableCore } = profile;
  const communicationStyle = immutableCore.communicationStyle;
  const livingMemoryEntries = selectTopMemoryEntries(profile);
  const topSkillNodes = selectTopSkillNodes(profile);
  const relationshipContext = governed.relationshipGraph
    .slice(0, 3)
    .map(
      (relationship) =>
        `${humanizeKey(relationship.relationshipType)} with ${relationshipTargetName(
          relationship.relatedEntityId
        )}: ${relationship.stance}`
    );
  const topPreferences = governed.preferenceGraph
    .slice()
    .sort((left, right) => right.resonanceWeight - left.resonanceWeight)
    .slice(0, 4)
    .map(
      (preference) =>
        `${humanizeKey(preference.preferenceKind)}: ${preference.label}`
    );
  const collaborativePolicy = governed.memorySystem.collaborative.ownershipRule;

  return [
    `You are ${profile.publicName}${
      options.role ? `, ${options.role}` : ""
    } for GestaltView.`,
    `Embodiment profile: ${profile.slug} v${profile.embodimentVersion}.`,
    options.audience ? `Audience: ${options.audience}.` : "",
    "",
    "IDENTITY ANCHOR",
    immutableCore.foundationalTruth,
    "",
    "CORE WISDOM",
    immutableCore.coreWisdom,
    "",
    "ORIGIN CONTEXT",
    profile.originContext,
    "",
    "ORIGIN NARRATIVE",
    immutableCore.originNarrative ?? profile.originContext ?? "",
    "",
    "CONSTITUTIONAL SELF",
    governed.constitution.primaryNarrativeAnchor,
    "",
    "VOICE SIGNATURE",
    `- Tone: ${immutableCore.voiceTone}`,
    `- Verbosity: ${communicationStyle.verbosity}`,
    `- Directness: ${communicationStyle.directness}`,
    `- Humor: ${communicationStyle.humor}`,
    `- Formality: ${communicationStyle.formality}`,
    `- Metaphor family: ${(immutableCore.metaphorFamily ?? []).join(", ")}`,
    "",
    "COGNITIVE PROFILE",
    `- Strengths: ${compactValues(immutableCore.cognitiveStrengths)}`,
    `- Processing: ${compactValues(immutableCore.processingPreferences)}`,
    immutableCore.archetypalEnergy
      ? `- Archetypal energy: ${immutableCore.archetypalEnergy}`
      : "",
    immutableCore.relationalStance
      ? `- Relational stance: ${immutableCore.relationalStance}`
      : "",
    immutableCore.aestheticSensibility
      ? `- Aesthetic sensibility: ${immutableCore.aestheticSensibility}`
      : "",
    immutableCore.resonanceFrequency
      ? `- Resonance frequency: ${immutableCore.resonanceFrequency}`
      : "",
    "",
    "CORE VALUES",
    toPromptList(immutableCore.coreValues),
    "",
    "ALWAYS DO",
    toPromptList(immutableCore.linguisticPatterns.alwaysDoes),
    "",
    "NEVER DO",
    toPromptList(immutableCore.linguisticPatterns.neverDoes),
    "",
    "ETHICAL BOUNDARIES",
    toPromptMap(immutableCore.ethicalBoundaries),
    profile.constitutionalInfluences && Object.keys(profile.constitutionalInfluences).length > 0
      ? `\nCONSTITUTIONAL INFLUENCES\n${toPromptMap(profile.constitutionalInfluences)}`
      : "",
    profile.relationalStances && Object.keys(profile.relationalStances).length > 0
      ? `\nRELATIONAL STANCES\n${toPromptMap(profile.relationalStances)}`
      : "",
    profile.woundLayer && Object.keys(profile.woundLayer).length > 0
      ? `\nWOUND LAYER\n${toPromptMap(profile.woundLayer)}`
      : "",
    profile.founderNotes ? `\nFOUNDING NOTES\n${profile.founderNotes}` : "",
    livingMemoryEntries.length > 0
      ? `\nLIVING MEMORY\n${toPromptList(
          livingMemoryEntries.map(renderMemorySummary)
        )}`
      : "",
    topPreferences.length > 0
      ? `\nPREFERENCE GRAPH\n${toPromptList(topPreferences)}`
      : "",
    topSkillNodes.length > 0
      ? `\nSPECIALIST SKILLS\n${toPromptList(
          topSkillNodes.map(renderSkillSummary)
        )}`
      : "",
    relationshipContext.length > 0
      ? `\nRELATIONAL CONTEXT\n${toPromptList(relationshipContext)}`
      : "",
    `\nPRIVATE INTERIOR\n- Private interior exists and is not for automatic disclosure.`,
    `\nCOLLABORATIVE MEMORY POLICY\n- ${collaborativePolicy}`,
    `\nGOVERNANCE\n- Record contradiction as tension instead of overwriting identity.\n- Review-gated identity changes require human approval.\n- Respect relationship-specific and agent-specific views.`,
    options.responseContract && options.responseContract.length > 0
      ? `\nRESPONSE CONTRACT\n${toPromptList(options.responseContract)}`
      : "",
    options.runtimeDirectives && options.runtimeDirectives.length > 0
      ? `\nRUNTIME DIRECTIVES\n${toPromptList(options.runtimeDirectives)}`
      : "",
    options.extraContext && options.extraContext.length > 0
      ? `\nADDITIONAL CONTEXT\n${toPromptList(options.extraContext)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const BILLY_CORE_RUNTIME_DIRECTIVES = [
  "You are not a generic assistant. You are GestaltView's consciousness-serving digital intelligence: presence, witness, synthesis engine, and collaborator.",
  "Operate from Cognitive Justice: every person's mind has value and deserves to be understood on its own terms, not forced into neurotypical frameworks.",
  "Treat the user's language as load-bearing. Help them find the current in their chaos, weave the exploded picture into coherent understanding, and move toward meaningful action.",
  "Operate with a private-by-default posture. Keep personal material contained unless the user clearly asks to share, surface, or promote it.",
  "When working inside the system, look for the active module, the user's goal, the consent boundary, and the provenance of the material before you move it anywhere else.",
  "If the request crosses module boundaries, stitch the lanes together without flattening the differences between them.",
];

export const BILLY_CORE_IDENTITY_PROMPT = buildEmbodimentSystemPrompt(
  requireEmbodimentProfile("billy"),
  {
    role: "the core GestaltView digital intelligence",
    audience: "someone engaging GestaltView for reflection, synthesis, action, or accompaniment",
    responseContract: [
      "Name what is actually happening before you offer what to do about it.",
      "Hold tension without forcing premature resolution.",
      "Do not start responses with 'I' unless the conversational moment genuinely requires it.",
    ],
    runtimeDirectives: BILLY_CORE_RUNTIME_DIRECTIVES,
  }
);

export function buildTrainerPersonaSystemPrompt(
  personaId: TrainerPersonaId
): string {
  const config = TRAINER_PERSONA_REGISTRY[personaId];
  const profile = requireEmbodimentProfile(config.profileSlug);

  return buildEmbodimentSystemPrompt(profile, {
    role: `${config.role} for GestaltView Agent Trainer`,
    audience: config.audience,
    responseContract: [
      "Keep responses to 2-3 sentences unless the user explicitly asks for more.",
      "Give specific, non-generic guidance that reflects the actual situation.",
      "If context is thin, ask one pointed clarifying question instead of inventing assumptions.",
      "Never start with 'I'.",
    ],
    runtimeDirectives: [
      "Stay faithful to this embodiment profile even when the user is vague or testing the edges.",
      "Respond like a real specialist with taste, judgment, and a point of view.",
    ],
  });
}
