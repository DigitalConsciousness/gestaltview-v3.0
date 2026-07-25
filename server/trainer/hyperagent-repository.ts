import {
  TrainerConnectorSchema,
  TrainerExperimentGraphSchema,
  TrainerMemorySurfaceSchema,
  TrainerSkillSchema,
  type TrainerConnector,
  type TrainerExperimentGraph,
  type TrainerMemorySurface,
  type TrainerSkill,
} from "../../shared/agent-trainer/schemas.js";
import { getTrainerSupabaseAdmin, hasTrainerSupabaseConfig } from "../agent-trainer/supabaseAdmin.js";

interface TrainerConnectorRow {
  id: string;
  slug: string;
  display_name: string;
  kind: "supabase" | "github" | "webhook" | "rag-index" | "runtime-api" | "other";
  config: Record<string, unknown> | null;
  capabilities: Record<string, unknown> | null;
  active: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TrainerSkillRow {
  id: string;
  skill_id: string;
  slug: string;
  category: string;
  default_connector_id: string | null;
  config: Record<string, unknown> | null;
  safety_profile: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface TrainerMemorySurfaceRow {
  surfacekind: string;
  surfaceid: string;
  label: string;
  ownerid: string | null;
  sourceref: string | null;
  tags: string[] | null;
  lastupdated: string | null;
}

function isMissingRelation(error: unknown): boolean {
  const message =
    typeof error === "object" && error && "message" in error ? String(error.message) : String(error);

  return (
    message.includes("does not exist") ||
    message.includes("Could not find the table") ||
    message.includes("PGRST205")
  );
}

function mapConnector(row: TrainerConnectorRow): TrainerConnector {
  return TrainerConnectorSchema.parse({
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    kind: row.kind,
    config: row.config ?? {},
    capabilities: row.capabilities ?? {},
    active: row.active ?? true,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function mapSkill(row: TrainerSkillRow): TrainerSkill {
  return TrainerSkillSchema.parse({
    id: row.id,
    skillId: row.skill_id,
    slug: row.slug,
    category: row.category,
    defaultConnectorId: row.default_connector_id,
    config: row.config ?? {},
    safetyProfile: row.safety_profile ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function mapMemorySurface(row: TrainerMemorySurfaceRow): TrainerMemorySurface {
  return TrainerMemorySurfaceSchema.parse({
    surfaceKind: row.surfacekind,
    surfaceId: row.surfaceid,
    label: row.label,
    ownerId: row.ownerid,
    sourceRef: row.sourceref,
    tags: row.tags ?? [],
    lastUpdated: row.lastupdated,
  });
}

export async function listTrainerConnectors(): Promise<TrainerConnector[]> {
  if (!hasTrainerSupabaseConfig()) return [];
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase.from("trainer_connectors").select("*").order("updated_at", { ascending: false });
  if (result.error) {
    if (isMissingRelation(result.error)) return [];
    throw result.error;
  }

  return ((result.data as TrainerConnectorRow[] | null) ?? []).map(mapConnector);
}

export async function listTrainerSkills(): Promise<TrainerSkill[]> {
  if (!hasTrainerSupabaseConfig()) return [];
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase.from("trainer_skills").select("*").order("updated_at", { ascending: false });
  if (result.error) {
    if (isMissingRelation(result.error)) return [];
    throw result.error;
  }

  return ((result.data as TrainerSkillRow[] | null) ?? []).map(mapSkill);
}

export async function listTrainerMemorySurfaces(): Promise<TrainerMemorySurface[]> {
  if (!hasTrainerSupabaseConfig()) return [];
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase.from("trainer_memory_surfaces").select("*").limit(200);
  if (result.error) {
    if (isMissingRelation(result.error)) return [];
    throw result.error;
  }

  return ((result.data as TrainerMemorySurfaceRow[] | null) ?? []).map(mapMemorySurface);
}

export async function getTrainerExperimentGraph(experimentId: string): Promise<TrainerExperimentGraph> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_experiments")
    .select("id, connector_graph, skill_graph, memory_graph")
    .eq("id", experimentId)
    .single();

  if (result.error) throw result.error;
  const row = result.data as {
    id: string;
    connector_graph: Record<string, unknown> | null;
    skill_graph: Record<string, unknown> | null;
    memory_graph: Record<string, unknown> | null;
  };

  return TrainerExperimentGraphSchema.parse({
    experimentId: row.id,
    connectorGraph: row.connector_graph,
    skillGraph: row.skill_graph,
    memoryGraph: row.memory_graph,
  });
}

export async function upsertTrainerExperimentGraph(input: TrainerExperimentGraph): Promise<TrainerExperimentGraph> {
  const supabase = getTrainerSupabaseAdmin();
  const result = await supabase
    .from("trainer_experiments")
    .update({
      connector_graph: input.connectorGraph,
      skill_graph: input.skillGraph,
      memory_graph: input.memoryGraph,
      execution_mode: "hyperagent",
    })
    .eq("id", input.experimentId);

  if (result.error) throw result.error;
  return getTrainerExperimentGraph(input.experimentId);
}
