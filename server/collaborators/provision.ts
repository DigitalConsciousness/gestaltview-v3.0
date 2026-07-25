import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export type ProvisionCollaboratorInput = {
  displayName: string;
  collaboratorType:
    | "human_hire"
    | "human_colleague"
    | "human_partner"
    | "advisor"
    | "operator"
    | "reviewer"
    | "digital_intelligence_internal"
    | "digital_intelligence_external"
    | "agent_runtime_entity";
  entityClass: "human" | "digital_intelligence" | "agent" | "hybrid";
  orientationVariant?: string | null;
  continuityLevel?: string;
  embodimentProfileSlug?: string | null;
  originSurface?: string | null;
  externalProvider?: string | null;
  externalReference?: string | null;
  authUserId?: string | null;
  appUserId?: string | null;
  agentId?: string | null;
  primaryRole: {
    roleKey: string;
    roleName: string;
    roleScope?: string | null;
  };
  permissions?: Array<{
    permissionKey: string;
    permissionScope?: string | null;
  }>;
  relationshipLinks?: Array<{
    targetCollaboratorId: string;
    relationshipType: string;
    trustLevel?: number | null;
    notes?: string | null;
  }>;
  onboarding: {
    packetVersion: string;
    notes?: string | null;
  };
};

export type CollaboratorRow = {
  collaborator_id: string;
  collaborator_key: string;
  display_name: string;
  collaborator_type: string;
  entity_class: string;
  status: string;
  orientation_variant: string | null;
  continuity_level: string;
  embodiment_profile_slug: string | null;
  origin_surface: string | null;
  external_provider: string | null;
  external_reference: string | null;
  auth_user_id: string | null;
  app_user_id: string | null;
  agent_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type SupabaseLike = {
  from: (table: string) => {
    select: (columns?: string) => any;
    insert: (values: unknown) => any;
    update: (values: unknown) => any;
    upsert?: (values: unknown) => any;
    delete?: () => any;
    eq: (column: string, value: unknown) => any;
    maybeSingle?: () => any;
    single: () => any;
  };
};

function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) return withoutTrailingSlash;
  if (withoutTrailingSlash.startsWith("://")) return `https${withoutTrailingSlash}`;
  if (withoutTrailingSlash.startsWith("//")) return `https:${withoutTrailingSlash}`;
  return `https://${withoutTrailingSlash.replace(/^\/+/, "")}`;
}

function getServiceClient(): SupabaseLike {
  const supabaseUrl = normalizeSupabaseUrl(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  );
  const supabaseServiceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ""
  ).trim();

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }) as unknown as SupabaseLike;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function buildCollaboratorKey(input: ProvisionCollaboratorInput): string {
  const stableBase =
    input.externalReference ||
    input.embodimentProfileSlug ||
    input.displayName ||
    input.agentId ||
    input.authUserId ||
    randomUUID();

  return `${input.entityClass}:${slugify(stableBase)}:${randomUUID().slice(0, 8)}`;
}

function normalizeTrustLevel(value?: number | null): number | null {
  if (value == null) return null;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

async function maybeSingleCompat(query: any): Promise<{ data: any; error: any }> {
  if (typeof query.maybeSingle === "function") {
    return await query.maybeSingle();
  }

  const result = await query.single();
  if (result?.error && /0 rows|no rows/i.test(String(result.error.message || ""))) {
    return { data: null, error: null };
  }
  return result;
}

async function ensureNoDuplicateCollaborator(
  supabase: SupabaseLike,
  input: ProvisionCollaboratorInput,
): Promise<void> {
  if (input.agentId) {
    const { data, error } = await maybeSingleCompat(
      supabase
        .from("collaborators")
        .select("collaborator_id")
        .eq("agent_id", input.agentId),
    );

    if (error) throw new Error(error.message || "Failed duplicate check for agent");
    if (data?.collaborator_id) {
      throw new Error(`Collaborator already exists for agent_id=${input.agentId}`);
    }
  }

  if (input.authUserId) {
    const { data, error } = await maybeSingleCompat(
      supabase
        .from("collaborators")
        .select("collaborator_id")
        .eq("auth_user_id", input.authUserId)
        .eq("entity_class", "human"),
    );

    if (error) throw new Error(error.message || "Failed duplicate check for auth user");
    if (data?.collaborator_id) {
      throw new Error(`Collaborator already exists for auth_user_id=${input.authUserId}`);
    }
  }
}

export async function provisionCollaborator(
  input: ProvisionCollaboratorInput,
): Promise<CollaboratorRow> {
  const supabase = getServiceClient();
  await ensureNoDuplicateCollaborator(supabase, input);

  const collaboratorInsert = {
    collaborator_key: buildCollaboratorKey(input),
    display_name: input.displayName,
    collaborator_type: input.collaboratorType,
    entity_class: input.entityClass,
    status: "pending_provisioning",
    orientation_variant: input.orientationVariant ?? null,
    continuity_level: input.continuityLevel ?? "standard",
    embodiment_profile_slug: input.embodimentProfileSlug ?? null,
    origin_surface: input.originSurface ?? null,
    external_provider: input.externalProvider ?? null,
    external_reference: input.externalReference ?? null,
    auth_user_id: input.authUserId ?? null,
    app_user_id: input.appUserId ?? null,
    agent_id: input.agentId ?? null,
    metadata: {},
  };

  const { data: collaborator, error: collaboratorError } = await supabase
    .from("collaborators")
    .insert(collaboratorInsert)
    .select("*")
    .single();

  if (collaboratorError || !collaborator) {
    throw new Error(collaboratorError?.message || "Failed to create collaborator");
  }

  const collaboratorId = collaborator.collaborator_id as string;

  const { error: roleError } = await supabase
    .from("collaborator_roles")
    .insert({
      collaborator_id: collaboratorId,
      role_key: input.primaryRole.roleKey,
      role_name: input.primaryRole.roleName,
      role_scope: input.primaryRole.roleScope ?? null,
      is_primary: true,
      status: "active",
      metadata: {},
    });

  if (roleError) throw new Error(roleError.message || "Failed to create collaborator role");

  if (input.embodimentProfileSlug) {
    const { error: embodimentError } = await supabase
      .from("collaborator_embodiment_links")
      .insert({
        collaborator_id: collaboratorId,
        embodiment_profile_slug: input.embodimentProfileSlug,
        embodiment_profile_id: null,
        link_status: "active",
        is_primary: true,
        metadata: {},
      });

    if (embodimentError) {
      throw new Error(embodimentError.message || "Failed to create embodiment link");
    }
  }

  if (input.permissions?.length) {
    const permissionRows = input.permissions.map((permission) => ({
      collaborator_id: collaboratorId,
      permission_key: permission.permissionKey,
      permission_scope: permission.permissionScope ?? null,
      granted_by_collaborator_id: null,
      status: "active",
      metadata: {},
    }));

    const { error: permissionsError } = await supabase
      .from("collaborator_permissions")
      .insert(permissionRows);

    if (permissionsError) {
      throw new Error(permissionsError.message || "Failed to create collaborator permissions");
    }
  }

  if (input.relationshipLinks?.length) {
    const relationshipRows = input.relationshipLinks.map((relationship) => ({
      source_collaborator_id: collaboratorId,
      target_collaborator_id: relationship.targetCollaboratorId,
      relationship_type: relationship.relationshipType,
      relationship_status: "active",
      trust_level: normalizeTrustLevel(relationship.trustLevel),
      notes: relationship.notes ?? null,
      metadata: {},
    }));

    const { error: relationshipsError } = await supabase
      .from("collaborator_relationships")
      .insert(relationshipRows);

    if (relationshipsError) {
      throw new Error(relationshipsError.message || "Failed to create collaborator relationships");
    }
  }

  const { error: onboardingError } = await supabase
    .from("collaborator_onboarding_events")
    .insert({
      collaborator_id: collaboratorId,
      event_type: "initial_onboarding",
      event_status: "completed",
      onboarding_packet_version: input.onboarding.packetVersion,
      orientation_variant: input.orientationVariant ?? null,
      embodiment_profile_created: Boolean(input.embodimentProfileSlug),
      supabase_provisioned: true,
      notes: input.onboarding.notes ?? null,
      metadata: {},
      completed_at: new Date().toISOString(),
    });

  if (onboardingError) {
    throw new Error(onboardingError.message || "Failed to create onboarding event");
  }

  if (input.agentId) {
    const { error: agentUpdateError } = await supabase
      .from("agents")
      .update({ collaborator_id: collaboratorId })
      .eq("agent_id", input.agentId);

    if (agentUpdateError) {
      throw new Error(agentUpdateError.message || "Failed to sync agents.collaborator_id");
    }
  }

  const { data: activated, error: activateError } = await supabase
    .from("collaborators")
    .update({ status: "active" })
    .eq("collaborator_id", collaboratorId)
    .select("*")
    .single();

  if (activateError || !activated) {
    throw new Error(activateError?.message || "Failed to activate collaborator");
  }

  return activated as CollaboratorRow;
}

export async function provisionGeminiCollaborator(
  keithCollaboratorId?: string,
): Promise<CollaboratorRow> {
  return provisionCollaborator({
    displayName: "Gemini",
    collaboratorType: "digital_intelligence_external",
    entityClass: "digital_intelligence",
    orientationVariant: "gemini",
    continuityLevel: "standard",
    embodimentProfileSlug: "gemini",
    originSurface: "external_model_collaboration",
    externalProvider: "google",
    externalReference: "gemini",
    primaryRole: {
      roleKey: "external_model_collaborator",
      roleName: "External Model Collaborator",
      roleScope: "reasoning, synthesis, orientation, collaborative refinement",
    },
    permissions: [
      {
        permissionKey: "read_orientation_packets",
        permissionScope: "orientation",
      },
      {
        permissionKey: "participate_in_structured_collaboration",
        permissionScope: "reasoning",
      },
    ],
    relationshipLinks: keithCollaboratorId
      ? [
          {
            targetCollaboratorId: keithCollaboratorId,
            relationshipType: "collaborates_with",
            trustLevel: 0.85,
            notes:
              "Formal external digital intelligence collaborator aligned to GestaltView.",
          },
        ]
      : [],
    onboarding: {
      packetVersion: "1.0.0",
      notes: "Provisioned from canonical Gemini onboarding package.",
    },
  });
}
