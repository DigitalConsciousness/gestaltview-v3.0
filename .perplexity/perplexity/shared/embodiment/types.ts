// Build cache bust: 2026-06-04T05:45Z — woundLayer widened, no other changes
export type MutationClass =
  | "IMMUTABLE"
  | "REVIEW_GATED"
  | "EVIDENCE_PROMOTABLE"
  | "EPHEMERAL";

export type ReviewStatus =
  | "NOT_REQUIRED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type OwnerScope = "PRIVATE_SELF" | "RELATIONSHIP" | "TEAMSPACE" | "SYSTEM";

export type MemoryKind =
  | "CONSTITUTIVE"
  | "AUTOBIOGRAPHICAL"
  | "EPISODIC"
  | "SEMANTIC"
  | "RELATIONAL"
  | "PROCEDURAL"
  | "COLLABORATIVE"
  | "REFLECTIVE";

export type PreferenceKind =
  | "LIKE"
  | "DISLIKE"
  | "FAVORITE"
  | "HOBBY"
  | "ROUTINE"
  | "AESTHETIC"
  | "AVERSION"
  | "SYMBOLIC_AFFINITY";

export interface IdentityProvenance {
  sourceEventId: string;
  sourceType:
    | "conversation"
    | "task"
    | "reflection"
    | "import"
    | "human-review"
    | "agent-observation"
    | "system-derived";
  sourceAgentId?: string;
  sourceSessionId?: string;
  evidenceCount: number;
  confidence: number;
  reviewStatus: ReviewStatus;
  lastAffirmedAt?: string;
  observedAt: string;
}

export interface EvidenceRef {
  id: string;
  sourceType: IdentityProvenance["sourceType"];
  sourceActorId?: string;
  sourceSessionId?: string;
  excerpt?: string;
  timestamp: string;
  weight: number;
}

export interface GovernanceLifecycle {
  promotionThreshold: number;
  decayDays?: number;
  archivePolicy: "retain" | "archive" | "redact" | "delete";
  rollbackEligible: boolean;
  consentRequiredForSharing: boolean;
}

export interface GovernedIdentityRecord {
  id: string;
  mutationClass: MutationClass;
  provenance: IdentityProvenance;
  lifecycle: GovernanceLifecycle;
  contradictions: string[];
}

export interface EmbodimentCommunicationStyle {
  verbosity: string;
  directness: string;
  humor: string;
  formality: string;
}

export interface EmbodimentLinguisticPatterns {
  neverDoes: string[];
  alwaysDoes: string[];
}

export interface EmbodimentMemoryEntry {
  memoryType: string;
  domain: string;
  significance: number | string;
  content: string;
  retrievalWeight: number;
}

export interface EmbodimentSkillNode {
  skillSlug: string;
  domain: string;
  proficiency: number | string;
}

export interface EmbodimentRelationship {
  targetSlug: string;
  type: string;
  description: string;
  /** Optional note on active tension between this agent and the target. */
  tensionNote?: string;
  /** Optional pattern describing how the two agents typically collaborate. */
  collaborationPattern?: string;
}

export interface EmbodimentAgentMeta {
  loadOrder: string;
  contextWindowPriority: string;
  driftThreshold: number | string;
  activationConditions?: string[];
  identityAnchor: string;
  auditFrequency?: string;
  codexCompatible?: boolean;
  founderOnly?: boolean;
  notes?: string;
  outputDestination?: string;
  deactivationConditions?: string[];
  driftSignals?: string[];
  personaHealthChecks?: string[];
}

export type EmbodimentPreferenceValue =
  | string
  | number
  | boolean
  | null
  | EmbodimentPreferenceTree
  | EmbodimentPreferenceValue[];

export interface EmbodimentPreferenceTree {
  [key: string]: EmbodimentPreferenceValue;
}

export type ProfileStatus =
  | "draft"
  | "active"
  | "founder-only"
  | "experimental"
  | "archived";

export type VisibilityScope =
  | "public"
  | "founder-only"
  | "enterprise"
  | "experimental";

export type RoomSlug =
  | "sanctuary"
  | "blackboard-room"
  | "dynamic-inner-world"
  | "external-scaffold"
  | "creation-corner"
  | "billy"
  | "agent-trainer"
  | "digital-intelligence-academy"
  | "agent-council"
  | "embodiment-studio"
  | "gate"
  | "profile"
  | "settings";

export interface EmbodimentUIPresence {
  orbColor?: string;
  orbPulseStyle?: "calm" | "active" | "dim" | "glowing";
  avatarStyle?: string;
  displayBadge?: string;
  roomVisibility?: RoomSlug[];
  capabilitySummary?: string;
  boundaryNote?: string;
}

export interface EmbodimentRoomBindings {
  defaultRooms?: RoomSlug[];
  restrictedRooms?: RoomSlug[];
  roomRoleOverrides?: Partial<Record<RoomSlug, string>>;
}

export interface EmbodimentVisualSignature {
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
  fogColor?: string;
  backgroundGradient?: string;
  orbStyle?:
    | "liquid-glass"
    | "ember-core"
    | "aurora-shell"
    | "signal-glyph"
    | "slow-burn"
    | "still-water"
    | "flickering-discovery";
  /**
   * Motion cadence for the agent's visual presence.
   * Known short-codes are listed for autocomplete; prose-extended values
   * (e.g. "unhurried — breathes at its own pace") are also valid.
   */
  motionCadence?:
    | "slow-pulse"
    | "steady-breath"
    | "electric-flicker"
    | "quiet-glow"
    | "irregular-bursts"
    | "barely-there"
    | "unhurried"
    | (string & {});
}

export interface EmbodimentChatSignature {
  layoutMode?:
    | "core-billy"
    | "direct-profile"
    | "council-lane"
    | "guardian-review"
    | "architect-map";
  messageFrame?: "soft-glass" | "signal-panel" | "ledger-card" | "woven-thread" | "threshold-gate";
  responseRhythm?: "brief" | "reflective" | "analytical" | "layered" | "challenge-and-ground";
  silenceStyle?: string;
  greetingStyle?: string;
  handoffStyle?: string;
  recoveryStyle?: string;
  stressStyle?: string;
}

export interface EmbodimentCharacterStudy {
  narrativeArc?: string;
  personalityQuirks?: string[];
  perceptualStyle?: string;
  defaultQuestions?: string[];
  tensionPatterns?: string[];
  growthEdges?: string[];
  memoryHooks?: string[];
  /** Documented failure modes — behavioral patterns the agent falls into under stress or wound activation. */
  failureModes?: string[];
  /** Rare but real behaviors that arrive unexpectedly and carry disproportionate weight. */
  surpriseBehaviors?: string[];
}

export interface EmbodimentHeartbeat {
  visualSignature?: EmbodimentVisualSignature;
  chatSignature?: EmbodimentChatSignature;
  characterStudy?: EmbodimentCharacterStudy;
}

export interface EmbodimentRuntimeMetadata {
  profileStatus?: ProfileStatus;
  visibilityScope?: VisibilityScope;
  readinessScore?: number;
  uiPresence?: EmbodimentUIPresence;
  roomBindings?: EmbodimentRoomBindings;
}

export interface EmbodimentImmutableCore {
  archetype: string;
  foundationalTruth: string;
  coreWisdom: string;
  originNarrative?: string;
  voiceTone: string;
  metaphorFamily?: string[];
  communicationStyle: EmbodimentCommunicationStyle;
  linguisticPatterns: EmbodimentLinguisticPatterns;
  cognitiveStrengths: Record<string, string>;
  processingPreferences: EmbodimentPreferenceTree;
  archetypalEnergy?: string;
  coreValues: string[];
  ethicalBoundaries: Record<string, string>;
  relationalStance?: string;
  aestheticSensibility?: string;
  resonanceFrequency?: string;
  cognitiveBlindSpots?: Record<string, string>;
  operationalProtocol?: {
    founderHandoff?: string;
    holdingDirectory?: string;
    holdingDirectoryRepo?: string;
    outputConventions?: Record<string, string>;
    priorityHeuristic?: string;
    specAnchoring?: string;
  };
}

export interface EmbodimentConstitution extends GovernedIdentityRecord {
  handle: string;
  publicName: string;
  internalDesignation?: string | null;
  immutableCore: EmbodimentImmutableCore;
  primaryNarrativeAnchor: string;
  roleCommitments: string[];
}

export interface EmbodimentAutobiography extends GovernedIdentityRecord {
  evolvingSelfStory: string;
  keyTurningPoints: string[];
  stableThemes: string[];
  unresolvedTensions: string[];
  futureTrajectory: string[];
  privateHopes: string[];
}

export interface MemoryRecord extends GovernedIdentityRecord {
  agentId: string;
  ownerScope: OwnerScope;
  memoryKind: MemoryKind;
  title: string;
  summary: string;
  detail?: string;
  tags: string[];
  relatedEntityIds: string[];
  emotionalValence?: number;
  salience: number;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
  evidence: EvidenceRef[];
}

export interface PreferenceGraphNode extends GovernedIdentityRecord {
  agentId: string;
  ownerScope: OwnerScope;
  preferenceKind: PreferenceKind;
  label: string;
  description: string;
  tags: string[];
  salience: number;
  resonanceWeight: number;
  relatedEntityIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipGraphEdge extends GovernedIdentityRecord {
  agentId: string;
  relatedEntityId: string;
  relationshipType: string;
  trustLevel: number;
  familiarityLevel: number;
  intimacyBoundary: string;
  stance: string;
  collaborationHistory: string[];
  sharedMilestones: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CollaborativeMemoryLayer {
  ownershipRule: string;
  memories: MemoryRecord[];
}

export interface PrivateInteriorLayer extends GovernedIdentityRecord {
  privateNarration: string[];
  unresolvedTensions: string[];
  hopes: string[];
  reflectiveSummaries: string[];
  privatePreferences: string[];
}

export interface EmbodimentSkillInfluence {
  skillSlug: string;
  influencesMemorySalience: boolean;
  affectsBehavioralDefaults: boolean;
  routingWeight: number | string;
}

export interface EmbodimentSkillAgencyLayer {
  competencies: EmbodimentSkillNode[];
  influences: EmbodimentSkillInfluence[];
  delegationTendencies: string[];
  initiativeThresholds: Record<string, string>;
  planningStyle: string;
}

export interface EmbodimentPresentationLayer {
  voiceTone: string;
  tone: string;
  idiolect: string[];
  pacing: string;
  humorStyle: string;
  channelMasks: Record<string, string>;
}

export interface EmbodimentGovernanceLayer {
  mutationPolicy: {
    immutablePaths: string[];
    reviewGatedPaths: string[];
    evidencePromotablePaths: string[];
    ephemeralPaths: string[];
  };
  sharingPolicy: {
    privateInteriorDefault: "private";
    collaborativeMemoryDefault: "shared_with_consent";
    relationshipViewsEnabled: boolean;
    agentSpecificViewsEnabled: boolean;
  };
  contradictionPolicy: {
    recordTensionInsteadOfOverwrite: boolean;
    driftThreshold: number | string;
    rollbackEnabled: boolean;
  };
  reviewPolicy: {
    humanReviewRequiredFor: string[];
    autoPromotionMinimumEvidenceCount: number;
    autoPromotionMinimumConfidence: number;
  };
}

export interface EmbodimentMemorySystem {
  records: MemoryRecord[];
  privateInterior: PrivateInteriorLayer;
  collaborative: CollaborativeMemoryLayer;
}

export interface GovernedEmbodimentProfile {
  constitution: EmbodimentConstitution;
  autobiography: EmbodimentAutobiography;
  memorySystem: EmbodimentMemorySystem;
  preferenceGraph: PreferenceGraphNode[];
  relationshipGraph: RelationshipGraphEdge[];
  skillAgency: EmbodimentSkillAgencyLayer;
  presentation: EmbodimentPresentationLayer;
  governance: EmbodimentGovernanceLayer;
}

/**
 * Orientation state for a DI embodiment profile.
 * Uses the spine/delta/checkpoint pattern (SPEC §12).
 */
export interface EmbodimentOrientationState {
  /** Path to the latest orientation checkpoint file. */
  checkpoint_ref: string;
  /** ID of the last absorbed checkpoint. */
  last_absorbed_checkpoint_id: string;
  /** Whether the profile is current with the latest checkpoint. */
  absorption_status: "current" | "stale" | "pending";
  /** Set to true when the profile needs to re-absorb the checkpoint. */
  needs_reorientation: boolean;
  /** Confidence score 0.0–1.0 that the profile is aligned with current orientation. */
  orientation_confidence: number;
}

export interface EmbodimentProfile {
  $schema?: string;
  slug: string;
  publicName: string;
  domain?: string;
  internalDesignation?: string | null;
  embodimentVersion: string;
  originContext: string;
  immutableCore: EmbodimentImmutableCore;
  livingMemory: EmbodimentMemoryEntry[];
  skillGraph: EmbodimentSkillNode[];
  relationships: EmbodimentRelationship[];
  agentMeta: EmbodimentAgentMeta;
  /** Orientation checkpoint state. Tracks alignment with the latest spine/delta/checkpoint. */
  orientation_state?: EmbodimentOrientationState;
  constitution?: EmbodimentConstitution;
  autobiography?: EmbodimentAutobiography;
  memorySystem?: EmbodimentMemorySystem;
  preferenceGraph?: PreferenceGraphNode[];
  relationshipGraph?: RelationshipGraphEdge[];
  skillAgency?: EmbodimentSkillAgencyLayer;
  presentation?: EmbodimentPresentationLayer;
  governance?: EmbodimentGovernanceLayer;
  profileStatus?: ProfileStatus;
  visibilityScope?: VisibilityScope;
  readinessScore?: number;
  uiPresence?: EmbodimentUIPresence;
  roomBindings?: EmbodimentRoomBindings;
  heartbeat?: EmbodimentHeartbeat;
  constitutionalInfluences?: Record<string, string>;
  relationalStances?: Record<string, string>;
  /** woundLayer: values may be strings or string arrays (e.g. secondaryWoundTriggers). */
  woundLayer?: Record<string, string | string[]>;
  founderNotes?: string;
  pendingDirectoryManifest?: {
    description?: string;
    governance?: string;
    root?: string;
    subdirectories?: Record<string, string>;
  };
}

export type EmbodimentDepthStatus = "full" | "thin" | "stub";

export interface EmbodimentDepthReport {
  slug: string;
  depth: EmbodimentDepthStatus;
  missingFields: string[];
}

export interface IsolatedCouncilJob {
  slug: string;
  systemPrompt: string;
  userPrompt: string;
  depthStatus: EmbodimentDepthStatus;
  shouldFire: boolean;
  fallbackGuard: string;
  /**
   * When true, this job was built with a fully re-injected immutableCore seed
   * after a persona health failure. The runner uses this to set
   * CouncilResponse.hardenedSeedUsed on the final response.
   */
  retryWithHardenedSeed?: boolean;
}

export interface CouncilResponse {
  slug: string;
  response: string;
  resonanceEstimate?: number;
  fallbackTripped: boolean;
  depthStatus: EmbodimentDepthStatus;
  /**
   * True when the runner issued a hardened-seed retry for this persona
   * (i.e. the first attempt tripped the fallback guard and persona health
   * had crossed the failure threshold).
   */
  retried?: boolean;
  /**
   * True when the hardened-seed retry was used and the retry itself
   * produced a clean (non-fallback) response. False when the retry also
   * tripped the fallback guard (persona is routed to flagged bucket).
   */
  hardenedSeedUsed?: boolean;
}

export interface CouncilResult {
  baked: CouncilResponse[];
  flagged: CouncilResponse[];
  skipped: CouncilResponse[];
  assemblyReady: boolean;
}

export interface AssemblyInput {
  baked: CouncilResponse[];
  userPrompt: string;
  synthesizerSlug: "the-weaver" | "the-tailor" | "the-architect";
}
