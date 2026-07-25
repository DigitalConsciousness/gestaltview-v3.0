import { promises as fs } from "node:fs";
import path from "node:path";

import {
  AgentManifestSummarySchema,
  TrainerPersonhoodSnapshotSchema,
  type AgentManifestFile,
  type AgentManifestSummary,
  type KnowledgeAssetSummary,
  type TrainerPersonhoodSnapshot,
} from "../../shared/agent-trainer/schemas.js";
import { AgentSpecSchema, type AgentSpec } from "../../shared/agent-trainer/schemas.js";
import { sha256 } from "./checksum.js";
import { getTrainerSupabaseAdmin, hasTrainerSupabaseConfig } from "./supabaseAdmin.js";

const MANIFEST_VERSION = "1.0.0";
const LOCAL_MANIFEST_DIR = "agent_trainer/supabase/manifest";

interface AgentRow {
  agent_id: string;
  slug: string;
  title: string;
  domain: string;
  status: string;
  active_version_id: string | null;
}

interface AgentVersionRow {
  version_id: string;
  agent_id: string;
  parent_version_id: string | null;
  source_run_id: string | null;
  semantic_version: string;
  canonical_spec: unknown;
  compiled_markdown: string;
  checksum: string;
  change_summary: string | null;
  status: "candidate" | "approved" | "rejected" | "deployed";
  created_at: string;
}

interface KnowledgeAssetRow {
  id: string;
  title: string;
  asset_type: string;
  storage_path: string;
  raw_text: string | null;
  checksum: string;
  source_label: string | null;
  visibility: string;
  status: string;
  created_at: string;
}

interface AgentKnowledgeLinkRow {
  agent_id: string;
  asset_id: string;
  link_type: string;
  scope: string;
  approved_at: string | null;
}

interface AgentMemoryRow {
  id: string;
  agent_id: string;
  source_asset_id: string | null;
  memory_type: "episodic" | "semantic" | "procedural" | "relational";
  summary: string;
  detail_payload: Record<string, unknown>;
  salience: number;
  retention_policy: string;
  created_at: string;
}

interface AgentSkillRow {
  id: string;
  agent_id: string;
  skill_slug: string;
  proficiency: number;
  evidence_asset_id: string | null;
  last_updated_by_mutation_id: string | null;
  metadata: Record<string, unknown>;
}

interface AgentRelationshipRow {
  id: string;
  agent_id: string;
  related_agent_id: string;
  relationship_type: string;
  trust_score: number;
  familiarity_score: number;
  protocol_notes: Record<string, unknown>;
  updated_at: string;
}

interface AgentCodeArtifactRow {
  id: string;
  agent_id: string;
  manifest_id: string | null;
  source_asset_id: string | null;
  file_path: string;
  language: string;
  content: string;
  checksum: string;
  generation_mode: string;
  review_status: string;
  created_at: string;
  updated_at: string;
}

interface EmbodimentMutationRow {
  id: string;
  agent_id: string;
  mutation_type: string;
  target_path: string;
  diff_summary: string;
  risk_level: string;
  status: string;
  created_at: string;
}

interface DocumentRow {
  document_id: string;
  path: string;
  filename: string;
  hash: string;
  mime_type: string | null;
  content: string;
  extracted_metadata: Record<string, unknown> | null;
  provenance: Record<string, unknown> | null;
  created_at: string;
}

interface ManifestRow {
  id?: string;
  manifest_id?: string;
  agent_id: string;
  slug?: string;
  version_id: string;
  manifest_version: string;
  status?: string;
  root_json: Record<string, unknown>;
  checksum: string;
  created_at: string;
}

interface ManifestEntryRow {
  id?: string;
  manifest_id: string;
  entry_type: string;
  logical_path: string;
  source_table: string;
  source_id: string;
  content_hash: string;
  metadata: Record<string, unknown>;
}

interface ManifestBuildContext {
  agent: AgentRow;
  version: AgentVersionRow;
  spec: AgentSpec;
  parentManifestId: string | null;
  memories: AgentMemoryRow[];
  skills: AgentSkillRow[];
  relationships: AgentRelationshipRow[];
  links: AgentKnowledgeLinkRow[];
  assets: KnowledgeAssetRow[];
  codeArtifacts: AgentCodeArtifactRow[];
  approvedMutations: EmbodimentMutationRow[];
}

function isMissingRelation(error: unknown): boolean {
  const message =
    typeof error === "object" && error && "message" in error ? String(error.message) : String(error);

  return (
    message.includes("does not exist") ||
    message.includes("Could not find the table") ||
    message.includes("PGRST205") ||
    message.includes("PGRST200")
  );
}

function isTransientError(error: unknown): boolean {
  if (!error) return false;
  const obj = typeof error === "object" ? (error as Record<string, unknown>) : null;
  const status = obj ? (obj.status ?? obj.code ?? obj.statusCode) : null;
  const message =
    obj && "message" in obj ? String(obj.message) : String(error);

  if (status === 503 || status === "503") return true;
  if (
    message.includes("503") ||
    message.includes("Service Unavailable") ||
    message.includes("connection pool") ||
    message.includes("too many connections") ||
    message.includes("ECONNREFUSED") ||
    message.includes("ETIMEDOUT") ||
    message.includes("upstream connect error")
  ) {
    return true;
  }

  return false;
}

async function queryRows<T>(queryFactory: () => Promise<{ data: unknown; error: unknown }>): Promise<T[]> {
  const query = await queryFactory();

  if (query.error) {
    if (isMissingRelation(query.error) || isTransientError(query.error)) {
      return [];
    }
    throw query.error;
  }

  return ((query.data as T[] | null) ?? []) as T[];
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function summarizeAsset(row: KnowledgeAssetRow, linkedAgentCount = 0): KnowledgeAssetSummary {
  return {
    assetId: row.id,
    title: row.title,
    assetType: row.asset_type,
    status: row.status,
    visibility: row.visibility,
    sourceLabel: row.source_label,
    storagePath: row.storage_path,
    checksum: row.checksum,
    createdAt: row.created_at,
    linkedAgentCount,
  };
}

function slugifyPathSegment(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "asset";
}

function codeLogicalPath(filePath: string): string {
  const normalized = filePath.replace(/^\/+/, "");
  return normalized.startsWith("code/") ? normalized : `code/${normalized}`;
}

function assetLogicalPath(asset: KnowledgeAssetRow): string {
  const storageName = asset.storage_path.split("/").filter(Boolean).at(-1);
  return `assets/library/${slugifyPathSegment(storageName || asset.title)}`;
}

function buildMemoryManifest(memories: AgentMemoryRow[]) {
  return {
    episodic: memories.filter((memory) => memory.memory_type === "episodic"),
    semantic: memories.filter((memory) => memory.memory_type === "semantic"),
    procedural: memories.filter((memory) => memory.memory_type === "procedural"),
    relational: memories.filter((memory) => memory.memory_type === "relational"),
  };
}

function mapMemory(memory: AgentMemoryRow) {
  return {
    memoryId: memory.id,
    sourceAssetId: memory.source_asset_id,
    summary: memory.summary,
    detailPayload: memory.detail_payload ?? {},
    salience: Number(memory.salience ?? 0),
    retentionPolicy: memory.retention_policy,
    createdAt: memory.created_at,
  };
}

function buildIdentity(spec: AgentSpec) {
  const now = new Date().toISOString();
  const stableTags = spec.tags.filter((tag) => !tag.includes(":")).slice(0, 8);
  const promptFragments = [
    {
      name: "process",
      content: spec.system_prompt.process_steps,
    },
    {
      name: "output",
      content: spec.system_prompt.output_format,
    },
  ];

  return {
    constitution: {
      handle: spec.name,
      publicName: spec.title ?? spec.name,
      immutableCore: {
        name: spec.title ?? spec.name,
        purpose: spec.description,
        values: stableTags,
        boundaries: spec.constraints,
        voiceProfile: {
          color: spec.color,
          model: spec.model,
        },
        personaContract: {
          role: spec.system_prompt.role,
          coreResponsibilities: spec.system_prompt.core_responsibilities,
          handoffRules: spec.handoff_rules,
        },
      },
      primaryNarrativeAnchor: spec.description,
      roleCommitments: spec.system_prompt.core_responsibilities,
      mutationClass: "IMMUTABLE",
      provenance: {
        sourceType: "human-review",
        observedAt: now,
        reviewStatus: "APPROVED",
      },
    },
    autobiography: {
      evolvingSelfStory: spec.description,
      keyTurningPoints: [],
      stableThemes: stableTags,
      unresolvedTensions: [],
      futureTrajectory: [],
      privateHopes: [],
      mutationClass: "REVIEW_GATED",
      provenance: {
        sourceType: "human-review",
        observedAt: now,
        reviewStatus: "APPROVED",
      },
    },
    immutableCore: {
      name: spec.title ?? spec.name,
      purpose: spec.description,
      values: stableTags,
      boundaries: spec.constraints,
      voiceProfile: {
        color: spec.color,
        model: spec.model,
      },
      personaContract: {
        role: spec.system_prompt.role,
        coreResponsibilities: spec.system_prompt.core_responsibilities,
        handoffRules: spec.handoff_rules,
      },
    },
    mutableProfile: {
      description: spec.description,
      tags: spec.tags,
      tools: spec.tools,
      settings: {
        domain: spec.domain,
        color: spec.color,
        model: spec.model,
      },
      promptFragments,
    },
    memorySystem: {
      privateInterior: {
        privateNarration: [],
        unresolvedTensions: [],
        hopes: [],
        reflectiveSummaries: [],
        privatePreferences: [],
        mutationClass: "REVIEW_GATED",
      },
      collaborative: {
        ownershipRule:
          "Collaborative mission artifacts are shared context and do not mutate another agent's private identity by default.",
      },
    },
    preferenceGraph: stableTags.map((tag) => ({
      label: tag,
      preferenceKind: "LIKE",
      mutationClass: "EVIDENCE_PROMOTABLE",
    })),
    relationshipGraph: [],
    skillAgency: {
      competencies: spec.tools,
      delegationTendencies: spec.handoff_rules,
      planningStyle: spec.system_prompt.process_steps.join(" "),
    },
    presentation: {
      publicMask: spec.system_prompt.role,
      channelMasks: {
        default: "operational",
      },
    },
    governance: {
      mutationPolicy: {
        immutablePaths: ["constitution", "immutableCore"],
        reviewGatedPaths: ["autobiography", "memorySystem.privateInterior"],
        evidencePromotablePaths: ["preferenceGraph", "relationshipGraph"],
        ephemeralPaths: ["runtime"],
      },
      contradictionPolicy: {
        recordTensionInsteadOfOverwrite: true,
        rollbackEnabled: true,
      },
      reviewPolicy: {
        humanReviewRequiredFor: [
          "values",
          "loyalties",
          "ethical interpretations",
          "intimate relationship commitments",
          "existential goals",
        ],
      },
      sharingPolicy: {
        privateInteriorDefault: "private",
        collaborativeMemoryDefault: "shared_with_consent",
      },
    },
  };
}

function buildRootJson(context: ManifestBuildContext, manifestId: string | null) {
  const memory = buildMemoryManifest(context.memories);
  const assetsById = new Map(context.assets.map((asset) => [asset.id, asset]));

  return {
    manifestVersion: MANIFEST_VERSION,
    agent: {
      agentId: context.agent.agent_id,
      slug: context.agent.slug,
      title: context.agent.title,
      domain: context.agent.domain,
      status: context.agent.status,
      activeVersionId: context.version.version_id,
    },
    identity: buildIdentity(context.spec),
    memory: {
      episodic: memory.episodic.map(mapMemory),
      semantic: memory.semantic.map(mapMemory),
      procedural: memory.procedural.map(mapMemory),
      relational: memory.relational.map(mapMemory),
    },
    skills: context.skills.map((skill) => ({
      skillId: skill.id,
      skillSlug: skill.skill_slug,
      proficiency: Number(skill.proficiency ?? 0),
      evidence: skill.evidence_asset_id ? [skill.evidence_asset_id] : [],
      lastUpdatedByMutationId: skill.last_updated_by_mutation_id,
      metadata: skill.metadata ?? {},
    })),
    relationships: context.relationships.map((relationship) => ({
      relationshipId: relationship.id,
      relatedAgentId: relationship.related_agent_id,
      relationshipType: relationship.relationship_type,
      trustScore: Number(relationship.trust_score ?? 0),
      familiarityScore: Number(relationship.familiarity_score ?? 0),
      protocolNotes: relationship.protocol_notes ?? {},
      updatedAt: relationship.updated_at,
    })),
    assets: context.assets.map((asset) => ({
      assetId: asset.id,
      logicalPath: assetLogicalPath(asset),
      assetType: asset.asset_type,
      storagePath: asset.storage_path,
      checksum: asset.checksum,
      status: asset.status,
      visibility: asset.visibility,
    })),
    codeArtifacts: context.codeArtifacts.map((artifact) => ({
      artifactId: artifact.id,
      filePath: artifact.file_path,
      logicalPath: codeLogicalPath(artifact.file_path),
      language: artifact.language,
      checksum: artifact.checksum,
      generationMode: artifact.generation_mode,
      reviewStatus: artifact.review_status,
    })),
    retrieval: {
      visibleAssetIds: context.links
        .filter((link) => link.link_type === "visible" && assetsById.has(link.asset_id))
        .map((link) => link.asset_id),
      assignedAssetIds: context.links
        .filter((link) => link.link_type === "assigned" && assetsById.has(link.asset_id))
        .map((link) => link.asset_id),
      sharedCanonAssetIds: context.assets
        .filter((asset) => asset.visibility === "approved_shared")
        .map((asset) => asset.id),
    },
    lineage: {
      manifestId,
      parentManifestId: context.parentManifestId,
      sourceRunIds: context.version.source_run_id ? [context.version.source_run_id] : [],
      approvedMutationIds: context.approvedMutations.map((mutation) => mutation.id),
      generatedAt: new Date().toISOString(),
    },
  };
}

function buildEntry(params: {
  manifestId: string;
  entryType: string;
  logicalPath: string;
  sourceTable: string;
  sourceId: string;
  content: unknown;
  metadata?: Record<string, unknown>;
}): Omit<ManifestEntryRow, "id"> {
  return {
    manifest_id: params.manifestId,
    entry_type: params.entryType,
    logical_path: params.logicalPath,
    source_table: params.sourceTable,
    source_id: params.sourceId,
    content_hash: sha256(typeof params.content === "string" ? params.content : stableJson(params.content)),
    metadata: params.metadata ?? {},
  };
}

function buildManifestEntries(
  manifestId: string,
  context: ManifestBuildContext,
  rootJson: Record<string, unknown>
): Array<Omit<ManifestEntryRow, "id">> {
  const identity = rootJson.identity as Record<string, unknown>;
  const entries: Array<Omit<ManifestEntryRow, "id">> = [
    buildEntry({
      manifestId,
      entryType: "config_ref",
      logicalPath: "config/manifest.json",
      sourceTable: "agent_manifests",
      sourceId: manifestId,
      content: rootJson,
      metadata: { contentType: "application/json", section: "root" },
    }),
    buildEntry({
      manifestId,
      entryType: "profile_json",
      logicalPath: "identity/core.json",
      sourceTable: "agent_versions",
      sourceId: context.version.version_id,
      content: identity.immutableCore,
      metadata: { contentType: "application/json", section: "identity.immutableCore" },
    }),
    buildEntry({
      manifestId,
      entryType: "profile_json",
      logicalPath: "identity/constitution.json",
      sourceTable: "agent_versions",
      sourceId: context.version.version_id,
      content: identity.constitution,
      metadata: { contentType: "application/json", section: "identity.constitution" },
    }),
    buildEntry({
      manifestId,
      entryType: "profile_json",
      logicalPath: "identity/profile.json",
      sourceTable: "agent_versions",
      sourceId: context.version.version_id,
      content: identity.mutableProfile,
      metadata: { contentType: "application/json", section: "identity.mutableProfile" },
    }),
    buildEntry({
      manifestId,
      entryType: "profile_json",
      logicalPath: "identity/autobiography.json",
      sourceTable: "agent_versions",
      sourceId: context.version.version_id,
      content: identity.autobiography,
      metadata: { contentType: "application/json", section: "identity.autobiography" },
    }),
    buildEntry({
      manifestId,
      entryType: "profile_json",
      logicalPath: "identity/governance.json",
      sourceTable: "agent_versions",
      sourceId: context.version.version_id,
      content: identity.governance,
      metadata: { contentType: "application/json", section: "identity.governance" },
    }),
    buildEntry({
      manifestId,
      entryType: "profile_json",
      logicalPath: "identity/preferences.json",
      sourceTable: "agent_versions",
      sourceId: context.version.version_id,
      content: identity.preferenceGraph,
      metadata: { contentType: "application/json", section: "identity.preferenceGraph" },
    }),
    buildEntry({
      manifestId,
      entryType: "prompt_ref",
      logicalPath: "prompts/compiled-agent.md",
      sourceTable: "agent_versions",
      sourceId: context.version.version_id,
      content: context.version.compiled_markdown,
      metadata: { contentType: "text/markdown", section: "compiledMarkdown" },
    }),
  ];

  for (const memory of context.memories) {
    entries.push(
      buildEntry({
        manifestId,
        entryType: "memory_ref",
        logicalPath: `memory/${memory.memory_type}/${memory.id}.json`,
        sourceTable: "agent_memories",
        sourceId: memory.id,
        content: mapMemory(memory),
        metadata: { contentType: "application/json", memoryType: memory.memory_type },
      })
    );
  }

  for (const skill of context.skills) {
    entries.push(
      buildEntry({
        manifestId,
        entryType: "skill_ref",
        logicalPath: `skills/${skill.skill_slug}.json`,
        sourceTable: "agent_skills",
        sourceId: skill.id,
        content: skill,
        metadata: { contentType: "application/json", skillSlug: skill.skill_slug },
      })
    );
  }

  for (const relationship of context.relationships) {
    entries.push(
      buildEntry({
        manifestId,
        entryType: "relationship_ref",
        logicalPath: `relationships/${relationship.related_agent_id}.json`,
        sourceTable: "agent_relationships",
        sourceId: relationship.id,
        content: relationship,
        metadata: { contentType: "application/json", relationshipType: relationship.relationship_type },
      })
    );
  }

  for (const asset of context.assets) {
    entries.push(
      buildEntry({
        manifestId,
        entryType: "asset_ref",
        logicalPath: assetLogicalPath(asset),
        sourceTable: "knowledge_assets",
        sourceId: asset.id,
        content: asset.raw_text ?? asset.storage_path,
        metadata: { contentType: "text/plain", assetType: asset.asset_type, storagePath: asset.storage_path },
      })
    );
  }

  for (const artifact of context.codeArtifacts) {
    entries.push(
      buildEntry({
        manifestId,
        entryType: "ts_module_ref",
        logicalPath: codeLogicalPath(artifact.file_path),
        sourceTable: "agent_code_artifacts",
        sourceId: artifact.id,
        content: artifact.content,
        metadata: { contentType: "text/typescript", language: artifact.language },
      })
    );
  }

  return entries;
}

function mapManifestRow(row: ManifestRow, entries: ManifestEntryRow[] = []): AgentManifestSummary {
  return AgentManifestSummarySchema.parse({
    manifestId: row.manifest_id ?? row.id,
    agentId: row.agent_id,
    agentSlug: row.slug ?? String((row.root_json.agent as { slug?: string } | undefined)?.slug ?? ""),
    versionId: row.version_id,
    manifestVersion: row.manifest_version,
    status: row.status ?? "active",
    checksum: row.checksum,
    createdAt: row.created_at,
    rootJson: row.root_json,
    entries: entries.map((entry) => ({
      entryId: entry.id,
      entryType: entry.entry_type,
      logicalPath: entry.logical_path,
      sourceTable: entry.source_table,
      sourceId: entry.source_id,
      contentHash: entry.content_hash,
      metadata: entry.metadata ?? {},
    })),
  });
}

async function loadAgentBySlug(slug: string): Promise<AgentRow | null> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase.from("agents").select("*").eq("slug", slug).maybeSingle();

  if (query.error) {
    throw query.error;
  }

  return (query.data as AgentRow | null) ?? null;
}

async function loadAgentById(agentId: string): Promise<AgentRow> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase.from("agents").select("*").eq("agent_id", agentId).single();

  if (query.error) {
    throw query.error;
  }

  return query.data as AgentRow;
}

async function loadVersionForManifest(
  agentId: string,
  preferredVersionId?: string | null
): Promise<AgentVersionRow | null> {
  const supabase = getTrainerSupabaseAdmin();

  if (preferredVersionId) {
    const query = await supabase
      .from("agent_versions")
      .select("*")
      .eq("version_id", preferredVersionId)
      .maybeSingle();

    if (query.error) {
      throw query.error;
    }

    return (query.data as AgentVersionRow | null) ?? null;
  }

  const query = await supabase
    .from("agent_versions")
    .select("*")
    .eq("agent_id", agentId)
    .in("status", ["deployed", "approved", "candidate"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (query.error) {
    throw query.error;
  }

  return (query.data as AgentVersionRow | null) ?? null;
}

async function loadManifestBuildContext(
  agent: AgentRow,
  versionId?: string | null
): Promise<ManifestBuildContext | null> {
  const supabase = getTrainerSupabaseAdmin();
  const version = await loadVersionForManifest(agent.agent_id, versionId ?? agent.active_version_id);

  if (!version) {
    return null;
  }

  const [parentActiveRows, memories, skills, relationships, links, codeArtifacts, approvedMutations] =
    await Promise.all([
      queryRows<ManifestRow>(() =>
        supabase
          .from("agent_manifests")
          .select("*")
          .eq("agent_id", agent.agent_id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
      ),
      queryRows<AgentMemoryRow>(() =>
        supabase.from("agent_memories").select("*").eq("agent_id", agent.agent_id).order("created_at")
      ),
      queryRows<AgentSkillRow>(() =>
        supabase.from("agent_skills").select("*").eq("agent_id", agent.agent_id).order("skill_slug")
      ),
      queryRows<AgentRelationshipRow>(() =>
        supabase.from("agent_relationships").select("*").eq("agent_id", agent.agent_id).order("updated_at", {
          ascending: false,
        })
      ),
      queryRows<AgentKnowledgeLinkRow>(() =>
        supabase
          .from("agent_knowledge_links")
          .select("*")
          .eq("agent_id", agent.agent_id)
          .neq("link_type", "blocked")
      ),
      queryRows<AgentCodeArtifactRow>(() =>
        supabase
          .from("agent_code_artifacts")
          .select("*")
          .eq("agent_id", agent.agent_id)
          .in("review_status", ["approved", "applied"])
          .order("updated_at", { ascending: false })
      ),
      queryRows<EmbodimentMutationRow>(() =>
        supabase
          .from("embodiment_mutations")
          .select("*")
          .eq("agent_id", agent.agent_id)
          .in("status", ["approved", "applied"])
          .order("created_at")
      ),
    ]);

  const assetIds = [...new Set(links.map((link) => link.asset_id))];
  const assets =
    assetIds.length > 0
      ? await queryRows<KnowledgeAssetRow>(() =>
          supabase.from("knowledge_assets").select("*").in("id", assetIds).neq("status", "rejected")
        )
      : [];

  return {
    agent,
    version,
    spec: AgentSpecSchema.parse(version.canonical_spec),
    parentManifestId: parentActiveRows[0]?.id ?? parentActiveRows[0]?.manifest_id ?? null,
    memories,
    skills,
    relationships,
    links,
    assets,
    codeArtifacts,
    approvedMutations,
  };
}

export async function rebuildAgentManifest(params: {
  agentId: string;
  versionId?: string | null;
  status?: "draft" | "active";
}): Promise<AgentManifestSummary | null> {
  if (!hasTrainerSupabaseConfig()) {
    return null;
  }

  const supabase = getTrainerSupabaseAdmin();
  const agent = await loadAgentById(params.agentId);
  const context = await loadManifestBuildContext(agent, params.versionId);

  if (!context) {
    return null;
  }

  const desiredStatus = params.status ?? "active";
  const insertStatus = desiredStatus === "active" ? "draft" : desiredStatus;
  const preliminaryRootJson = buildRootJson(context, null);
  const preliminaryChecksum = sha256(stableJson(preliminaryRootJson));

  const insertQuery = await supabase
    .from("agent_manifests")
    .insert({
      agent_id: params.agentId,
      version_id: context.version.version_id,
      parent_manifest_id: context.parentManifestId,
      manifest_version: MANIFEST_VERSION,
      status: insertStatus,
      root_json: preliminaryRootJson,
      checksum: preliminaryChecksum,
    })
    .select("*")
    .single();

  if (insertQuery.error) {
    if (isMissingRelation(insertQuery.error)) {
      return null;
    }
    throw insertQuery.error;
  }

  const inserted = insertQuery.data as ManifestRow;
  const manifestId = inserted.id ?? inserted.manifest_id;
  if (!manifestId) {
    return null;
  }

  const rootJson = buildRootJson(context, manifestId);
  const checksum = sha256(stableJson(rootJson));
  const updateQuery = await supabase
    .from("agent_manifests")
    .update({ root_json: rootJson, checksum })
    .eq("id", manifestId)
    .select("*")
    .single();

  if (updateQuery.error) {
    throw updateQuery.error;
  }

  const entries = buildManifestEntries(manifestId, context, rootJson);
  const entriesQuery = entries.length
    ? await supabase.from("agent_manifest_entries").insert(entries).select("*")
    : { data: [], error: null };

  if (entriesQuery.error) {
    throw entriesQuery.error;
  }

  let manifestRow = updateQuery.data as ManifestRow;

  if (desiredStatus === "active") {
    const archiveQuery = await supabase
      .from("agent_manifests")
      .update({ status: "archived" })
      .eq("agent_id", params.agentId)
      .eq("status", "active")
      .neq("id", manifestId);

    if (archiveQuery.error && !isMissingRelation(archiveQuery.error)) {
      throw archiveQuery.error;
    }

    const activateQuery = await supabase
      .from("agent_manifests")
      .update({ status: "active" })
      .eq("id", manifestId)
      .select("*")
      .single();

    if (activateQuery.error) {
      throw activateQuery.error;
    }

    manifestRow = activateQuery.data as ManifestRow;
  }

  return mapManifestRow(
    {
      ...manifestRow,
      slug: agent.slug,
    },
    (entriesQuery.data as ManifestEntryRow[] | null) ?? []
  );
}

async function loadManifestEntries(manifestId: string): Promise<ManifestEntryRow[]> {
  const supabase = getTrainerSupabaseAdmin();
  return queryRows<ManifestEntryRow>(() =>
    supabase
      .from("agent_manifest_entries")
      .select("*")
      .eq("manifest_id", manifestId)
      .order("logical_path")
  );
}

export async function getAgentManifestBySlug(slug: string): Promise<AgentManifestSummary | null> {
  if (!hasTrainerSupabaseConfig()) {
    return null;
  }

  const supabase = getTrainerSupabaseAdmin();
  const agent = await loadAgentBySlug(slug);

  if (!agent) {
    return null;
  }

  const activeQuery = await supabase
    .from("active_agent_manifests")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (activeQuery.error && !isMissingRelation(activeQuery.error)) {
    throw activeQuery.error;
  }

  if (activeQuery.data && !activeQuery.error) {
    const row = activeQuery.data as ManifestRow;
    const manifestId = row.manifest_id ?? row.id;
    const entries = manifestId ? await loadManifestEntries(manifestId) : [];
    return mapManifestRow(row, entries);
  }

  return rebuildAgentManifest({
    agentId: agent.agent_id,
    versionId: agent.active_version_id,
    status: "active",
  });
}

async function loadCompiledMarkdown(versionId: string): Promise<string> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("agent_versions")
    .select("compiled_markdown")
    .eq("version_id", versionId)
    .maybeSingle();

  if (query.error) {
    throw query.error;
  }

  return String((query.data as { compiled_markdown?: string } | null)?.compiled_markdown ?? "");
}

async function loadAppliedCodeArtifacts(manifest: AgentManifestSummary): Promise<AgentCodeArtifactRow[]> {
  const supabase = getTrainerSupabaseAdmin();
  const artifactIds = manifest.entries
    .filter((entry) => entry.sourceTable === "agent_code_artifacts")
    .map((entry) => entry.sourceId);

  if (artifactIds.length === 0) {
    return [];
  }

  return queryRows<AgentCodeArtifactRow>(() =>
    supabase.from("agent_code_artifacts").select("*").in("id", artifactIds)
  );
}

function jsonFile(logicalPath: string, value: unknown): AgentManifestFile {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  return {
    logicalPath,
    contentType: "application/json",
    checksum: sha256(content),
    content,
  };
}

function textFile(logicalPath: string, contentType: string, content: string): AgentManifestFile {
  return {
    logicalPath,
    contentType,
    checksum: sha256(content),
    content,
  };
}

function matchesFileFilter(file: AgentManifestFile, type?: string | null, logicalPath?: string | null): boolean {
  if (logicalPath && file.logicalPath !== logicalPath) {
    return false;
  }

  if (!type) {
    return true;
  }

  if (type === "code") {
    return file.logicalPath.startsWith("code/");
  }

  if (type === "profile") {
    return file.logicalPath.startsWith("identity/");
  }

  if (type === "asset") {
    return file.logicalPath.startsWith("assets/");
  }

  if (type === "prompt") {
    return file.logicalPath.startsWith("prompts/");
  }

  if (type === "config") {
    return file.logicalPath.startsWith("config/");
  }

  return file.logicalPath.startsWith(`${type}/`);
}

export async function listAgentManifestFilesBySlug(params: {
  slug: string;
  type?: string | null;
  logicalPath?: string | null;
}): Promise<{ manifest: AgentManifestSummary | null; files: AgentManifestFile[] }> {
  const manifest = await getAgentManifestBySlug(params.slug);

  if (!manifest) {
    return { manifest: null, files: [] };
  }

  const identity = manifest.rootJson.identity as Record<string, unknown> | undefined;
  const compiledMarkdown = await loadCompiledMarkdown(manifest.versionId);
  const codeArtifacts = await loadAppliedCodeArtifacts(manifest);
  const files: AgentManifestFile[] = [
    jsonFile("config/manifest.json", manifest.rootJson),
    jsonFile("identity/core.json", identity?.immutableCore ?? {}),
    jsonFile("identity/profile.json", identity?.mutableProfile ?? {}),
    textFile("prompts/compiled-agent.md", "text/markdown", compiledMarkdown),
    ...codeArtifacts.map((artifact) =>
      textFile(
        codeLogicalPath(artifact.file_path),
        artifact.language === "typescript" ? "text/typescript" : "text/plain",
        artifact.content
      )
    ),
  ];

  return {
    manifest,
    files: files.filter((file) => matchesFileFilter(file, params.type, params.logicalPath)),
  };
}

async function summarizeLocalManifestExports(limit = 12): Promise<TrainerPersonhoodSnapshot> {
  const manifestDir = path.resolve(process.cwd(), LOCAL_MANIFEST_DIR);
  const files = (await fs.readdir(manifestDir).catch(() => []))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const rows: Array<Record<string, unknown>> = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(manifestDir, file), "utf8").catch(() => "");
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        rows.push(...(parsed as Array<Record<string, unknown>>));
      }
    } catch {
      // Ignore malformed local exports; validation surfaces will catch them separately.
    }
  }

  const byPath = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const rowPath = String(row.path ?? "");
    if (rowPath && !byPath.has(rowPath)) {
      byPath.set(rowPath, row);
    }
  }

  const assets: KnowledgeAssetSummary[] = [...byPath.entries()].slice(0, limit).map(([rowPath, row]) => ({
    assetId: String(row.document_id ?? rowPath),
    title: String(row.filename ?? rowPath),
    assetType: String(row.mime_type ?? "text/plain"),
    status: "processed",
    visibility: "admin",
    sourceLabel: "agent_trainer/supabase/manifest",
    storagePath: rowPath,
    checksum: String(row.hash ?? ""),
    createdAt: row.created_at ? String(row.created_at) : null,
    linkedAgentCount: 0,
  }));

  return TrainerPersonhoodSnapshotSchema.parse({
    source: rows.length > 0 ? "local_manifest" : "unavailable",
    libraryStatus: rows.length > 0 ? "migration_required" : "unavailable",
    assetCount: byPath.size,
    approvedAssetCount: 0,
    linkedAssetCount: 0,
    assets,
    manifests: [],
    pendingMutations: [],
    notes:
      rows.length > 0
        ? [
            `${byPath.size} unique Agent Trainer document paths are present in ${LOCAL_MANIFEST_DIR}.`,
            "Apply the personhood migration before these become first-class Agent Knowledge Library assets.",
          ]
        : ["No local Supabase document export manifests were found."],
  });
}

async function summarizePackageSourcesFromKnowledgeFragments(limit = 12): Promise<TrainerPersonhoodSnapshot> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("knowledge_fragments")
    .select("source_file, document_type, content, tags")
    .contains("tags", ["agent-trainer-package"])
    .limit(200);

  if (query.error) {
    if (isMissingRelation(query.error)) {
      return summarizeLocalManifestExports(limit);
    }
    throw query.error;
  }

  const rows = ((query.data as Array<{
    source_file: string;
    document_type: string | null;
    content: string | null;
    tags: string[] | null;
  }> | null) ?? []);
  const byPath = new Map<string, { documentType: string; sample: string }>();

  for (const row of rows) {
    if (!byPath.has(row.source_file)) {
      byPath.set(row.source_file, {
        documentType: row.document_type ?? "Knowledge",
        sample: row.content ?? "",
      });
    }
  }

  return TrainerPersonhoodSnapshotSchema.parse({
    source: "supabase",
    libraryStatus: "migration_required",
    assetCount: byPath.size,
    approvedAssetCount: 0,
    linkedAssetCount: 0,
    assets: [...byPath.entries()].slice(0, limit).map(([sourceFile, row]) => ({
      assetId: sourceFile,
      title: sourceFile.split("/").at(-1) ?? sourceFile,
      assetType: row.documentType,
      status: "processed",
      visibility: "admin",
      sourceLabel: "knowledge_fragments",
      storagePath: sourceFile,
      checksum: sha256(row.sample),
      createdAt: null,
      linkedAgentCount: 0,
    })),
    manifests: [],
    pendingMutations: [],
    notes: [
      `${byPath.size} agent-trainer-package sources are retrievable from knowledge_fragments.`,
      "Apply the personhood migration to promote them into first-class knowledge_assets.",
    ],
  });
}

async function summarizePackageSourcesFromDocuments(limit = 12): Promise<TrainerPersonhoodSnapshot | null> {
  const supabase = getTrainerSupabaseAdmin();
  const query = await supabase
    .from("documents")
    .select("document_id, path, filename, hash, mime_type, content, extracted_metadata, provenance, created_at")
    .contains("extracted_metadata", {
      package: "agent-trainer-package",
      package_builder_source: true,
    })
    .limit(250);

  if (query.error) {
    if (isMissingRelation(query.error)) {
      return null;
    }
    throw query.error;
  }

  const rows = ((query.data as DocumentRow[] | null) ?? []);
  if (rows.length === 0) {
    return null;
  }

  const byPath = new Map<string, DocumentRow>();
  for (const row of rows) {
    if (!byPath.has(row.path)) {
      byPath.set(row.path, row);
    }
  }

  return TrainerPersonhoodSnapshotSchema.parse({
    source: "supabase",
    libraryStatus: "ready",
    assetCount: byPath.size,
    approvedAssetCount: 0,
    linkedAssetCount: 0,
    assets: [...byPath.values()].slice(0, limit).map((row) => ({
      assetId: row.document_id,
      title: row.filename,
      assetType: row.mime_type ?? "text/plain",
      status: "processed",
      visibility: "admin",
      sourceLabel: "documents",
      storagePath: row.path,
      checksum: row.hash,
      createdAt: row.created_at,
      linkedAgentCount: 0,
    })),
    manifests: [],
    pendingMutations: [],
    notes: [
      `${byPath.size} Agent Trainer package sources are present in documents after the personhood migration.`,
      "Run a deliberate library backfill before treating these as approved knowledge_assets.",
    ],
  });
}

export async function getTrainerPersonhoodSnapshot(limit = 12): Promise<TrainerPersonhoodSnapshot> {
  if (!hasTrainerSupabaseConfig()) {
    return summarizeLocalManifestExports(limit);
  }

  const supabase = getTrainerSupabaseAdmin();
  const assetsQuery = await supabase
    .from("knowledge_assets")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (assetsQuery.error) {
    if (isMissingRelation(assetsQuery.error)) {
      return summarizePackageSourcesFromKnowledgeFragments(limit);
    }
    if (isTransientError(assetsQuery.error)) {
      return summarizeLocalManifestExports(limit);
    }
    throw assetsQuery.error;
  }

  const [approvedQuery, linksQuery, manifestsRows, pendingMutationRows] = await Promise.all([
    supabase.from("knowledge_assets").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("agent_knowledge_links").select("asset_id", { count: "exact" }),
    queryRows<ManifestRow>(() => supabase.from("active_agent_manifests").select("*").limit(limit)),
    queryRows<{
      id: string;
      agent_id: string;
      agent_slug: string | null;
      mutation_type: string;
      target_path: string;
      diff_summary: string;
      risk_level: string;
      status: string;
      created_at: string;
    }>(() => supabase.from("pending_embodiment_mutations").select("*").limit(limit)),
  ]);

  if (approvedQuery.error && !isMissingRelation(approvedQuery.error) && !isTransientError(approvedQuery.error)) {
    throw approvedQuery.error;
  }

  if (linksQuery.error && !isMissingRelation(linksQuery.error) && !isTransientError(linksQuery.error)) {
    throw linksQuery.error;
  }

  const linkCounts = new Map<string, number>();
  for (const row of ((linksQuery.data as Array<{ asset_id: string }> | null) ?? [])) {
    linkCounts.set(row.asset_id, (linkCounts.get(row.asset_id) ?? 0) + 1);
  }

  const assets = ((assetsQuery.data as KnowledgeAssetRow[] | null) ?? []).map((asset) =>
    summarizeAsset(asset, linkCounts.get(asset.id) ?? 0)
  );

  if ((assetsQuery.count ?? assets.length) === 0) {
    const documentSnapshot = await summarizePackageSourcesFromDocuments(limit);
    if (documentSnapshot) {
      return documentSnapshot;
    }
  }

  return TrainerPersonhoodSnapshotSchema.parse({
    source: "supabase",
    libraryStatus: "ready",
    assetCount: assetsQuery.count ?? assets.length,
    approvedAssetCount: approvedQuery.count ?? assets.filter((asset) => asset.status === "approved").length,
    linkedAssetCount: linksQuery.count ?? 0,
    assets,
    manifests: manifestsRows.map((row) => mapManifestRow(row)),
    pendingMutations: pendingMutationRows.map((row) => ({
      mutationId: row.id,
      agentId: row.agent_id,
      agentSlug: row.agent_slug,
      mutationType: row.mutation_type,
      targetPath: row.target_path,
      riskLevel: row.risk_level,
      status: row.status,
      diffSummary: row.diff_summary,
      createdAt: row.created_at,
    })),
    notes: [
      "Agent Knowledge Library tables are available.",
      "Active manifests are file-pullable through the manifest endpoints once an agent version is deployed.",
    ],
  });
}
