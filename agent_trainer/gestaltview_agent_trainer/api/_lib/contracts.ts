import type { KitDomain } from "../../config/domains";
import type { KitTierName } from "../../config/tiers";
import type { EntitlementProfile } from "../../config/entitlements";
import type { WorkspaceReadinessReport, TrainingLane } from "../../config/readiness";
import type { BuyerSegment } from "../../config/segments";
import type { ThemeProfile } from "../../config/themeEngine";
import type { OperatorKitEnv } from "./supabaseClient";

export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

export interface StarterPackApplication {
  packSlug: string;
  activatedSkills: string[];
  seededMemoryKeys: string[];
  recommendedSourceBundles: string[];
}

export interface StarterPackExecutionResult {
  application: StarterPackApplication;
  manifest: {
    schemaVersion: string;
    projectName: string;
    owner: string;
    entries: Array<{
      title: string;
      lane: "knowledge" | "code" | "product" | "context";
      sourceType: "file" | "url" | "text";
      sourceUri: string;
      audience: string;
      notes: string;
    }>;
  };
  routeRequest: PackRouteRequest;
}

export interface StarterPackPreview {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  recommendedSourceBundles: string[];
  generatedSkills: string[];
  generatedMemoryKeys: string[];
}

export interface PackRouteRequest {
  method: "GET" | "POST";
  action: "list" | "bundles" | "preview" | "plan" | "manifest" | "apply";
  packSlug?: string;
  selectedBundleSlugs?: string[];
  projectName?: string;
  owner?: string;
  userId?: string;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  plan: KitTierName;
  status: string;
  createdAt?: string;
}

export interface WorkspaceRecord {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  segment: BuyerSegment;
  themeProfileId?: string | null;
  createdAt?: string;
}

export interface WorkspaceMemberRecord {
  id: string;
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "editor" | "viewer" | "auditor";
  createdAt?: string;
}

export interface AgentRecord {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  mode: string;
  status: string;
  defaultDomain: KitDomain;
  themeOverride?: Record<string, unknown> | null;
  createdAt?: string;
}

export interface ThemeProfileRecord extends ThemeProfile {
  workspaceId?: string;
  createdAt?: string;
}

export interface OnboardingTaskRecord {
  id: string;
  sessionId: string;
  taskKey: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: Record<string, unknown> | null;
  updatedAt?: string;
}

export interface OnboardingSessionRecord {
  id: string;
  workspaceId?: string | null;
  entryMode: "web" | "cli";
  status: "in_progress" | "blocked" | "completed";
  segmentRecommendation: BuyerSegment;
  metadata?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string | null;
}

export interface CorpusSourceRecord {
  id: string;
  workspaceId: string;
  agentId?: string | null;
  lane: TrainingLane;
  sourceType: string;
  sourceUri: string;
  checksum?: string | null;
  ingestionStatus: string;
  metadata: Record<string, unknown>;
  createdAt?: string;
}

export interface KnowledgeFragment {
  id: string;
  userId: string;
  namespace: "knowledge" | "code" | "product" | "context";
  title: string;
  content: string;
  sourceUri?: string | null;
  sourceType?: string | null;
  chunkIndex: number;
  metadata: Record<string, unknown>;
  createdAt?: string;
}

export interface SkillFragment {
  id: string;
  userId: string;
  name: string;
  description: string;
  domain: KitDomain;
  instructions?: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
}

export interface MemoryEntry {
  id: string;
  userId: string;
  sessionId: string;
  key: string;
  value: Record<string, unknown>;
  importance: number;
  metadata: Record<string, unknown>;
}

export interface AnalyticsEvent {
  id?: string;
  userId?: string | null;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt?: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  byType: Record<string, number>;
}

export interface EvaluationRunRecord {
  id: string;
  workspaceId: string;
  agentId: string;
  suiteName: string;
  score: number;
  status: string;
  report: Record<string, unknown>;
  createdAt?: string;
}

export interface AuditLogRecord {
  id: string;
  organizationId: string;
  workspaceId?: string | null;
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  payload: Record<string, unknown>;
  createdAt?: string;
}

export interface PolicyPackRecord {
  id: string;
  organizationId: string;
  name: string;
  rules: Record<string, unknown>;
  status: string;
  createdAt?: string;
}

export interface VocabularyProfile {
  id: string;
  userId: string;
  vocabulary: string[];
  tone: string;
  constraints: string[];
  metadata: Record<string, unknown>;
}

export interface RouteContext {
  env: OperatorKitEnv;
  userId: string;
  tier: KitTierName;
  workspaceId?: string;
  organizationId?: string;
  agentId?: string;
  entitlements?: EntitlementProfile;
}

export interface AssistantRequest {
  message: string;
  sessionId: string;
  domain: KitDomain;
  workspaceId?: string;
  agentId?: string;
  namespace?: KnowledgeFragment["namespace"];
  preloadedFragments?: KnowledgeFragment[];
}

export interface AssistantResponse {
  reply: string;
  provider: string;
  model: string;
  contextPreview: string;
}

export interface WorkspaceReadinessResponse {
  workspaceId: string;
  report: WorkspaceReadinessReport;
}
