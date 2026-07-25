import { getFounderContext, listMemoryEntries } from "./supabase.js";

type EmbodimentProfileRow = {
  slug: string;
  public_name: string;
  internal_designation: string | null;
  status: string;
  visibility_scope: string;
  profile_json: Record<string, unknown>;
};

type AgentConstitutionRow = {
  public_name: string | null;
  internal_designation: string | null;
  identity_handle: string | null;
  primary_narrative_anchor: string | null;
  immutable_core: Record<string, unknown> | null;
  role_commitments: unknown[] | null;
  created_at: string;
};

type AgentMemoryRecordRow = {
  memory_id: string;
  agent_id: string;
  memory_kind: string;
  title: string;
  summary: string;
  detail: string | null;
  tags: string[] | null;
  salience: number;
  confidence: number;
  created_at: string;
};

type AgentMemorySummaryRow = {
  id: string;
  agent_id: string;
  memory_type: string;
  summary: string;
  detail_payload: Record<string, unknown> | null;
  salience: number;
  created_at: string;
};

type IdentitySubjectRow = {
  subject_id: string;
};

type FounderContextRow = {
  current_state: string | null;
  session_thread: string | null;
  plk_snapshot: Record<string, unknown> | null;
  mode_preference: "synthesis" | "chat" | null;
  last_session_at: string | null;
};

type AgentAutobiographyRow = {
  evolving_self_story: string;
  key_turning_points: unknown[] | null;
  stable_themes: unknown[] | null;
  unresolved_tensions: unknown[] | null;
  future_trajectory: unknown[] | null;
  private_hopes: unknown[] | null;
  created_at: string;
};

type BillyAgentRow = {
  agent_id: string;
  slug: string;
  title: string | null;
  domain: string | null;
};

const SUPABASE_BASE_URL =
  process.env.SUPABASE_URL?.trim() ||
  process.env.VITE_SUPABASE_URL?.trim() ||
  "";

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  "";

function hasSupabaseConfig(): boolean {
  return Boolean(SUPABASE_BASE_URL && SUPABASE_SERVICE_KEY);
}

function buildAuthHeaders(): Record<string, string> {
  if (!SUPABASE_SERVICE_KEY) {
    return {};
  }

  return {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  };
}

function buildQuery(entries: Array<[string, string | number | boolean | null | undefined]>): string {
  const params = new URLSearchParams();

  for (const [key, value] of entries) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  return params.toString();
}

async function selectRows<T>(table: string, query: string): Promise<T[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const response = await fetch(`${SUPABASE_BASE_URL.replace(/\/$/, "")}/rest/v1/${table}?${query}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...buildAuthHeaders(),
    },
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as T[];
}

export async function getBillyAgent(): Promise<BillyAgentRow | null> {
  const rows = await selectRows<BillyAgentRow>(
    "agents",
    buildQuery([
      ["slug", "eq.billy"],
      ["select", "agent_id,slug,title,domain"],
      ["limit", 1],
    ])
  );

  return rows[0] ?? null;
}

async function getIdentitySubject(userId: string): Promise<IdentitySubjectRow | null> {
  if (!userId) {
    return null;
  }

  const rows = await selectRows<IdentitySubjectRow>(
    "identity_subjects",
    buildQuery([
      ["auth_user_id", `eq.${userId}`],
      ["select", "subject_id"],
      ["limit", 1],
    ])
  );

  return rows[0] ?? null;
}

async function getEmbodimentProfile(slug: string): Promise<EmbodimentProfileRow | null> {
  const rows = await selectRows<EmbodimentProfileRow>(
    "embodiment_profiles",
    buildQuery([
      ["slug", `eq.${slug}`],
      ["select", "slug,public_name,internal_designation,status,visibility_scope,profile_json"],
      ["limit", 1],
    ])
  );

  return rows[0] ?? null;
}

async function getAgentConstitution(agentId: string): Promise<AgentConstitutionRow | null> {
  if (!agentId) {
    return null;
  }

  const rows = await selectRows<AgentConstitutionRow>(
    "agent_constitutions",
    buildQuery([
      ["agent_id", `eq.${agentId}`],
      ["select", "public_name,internal_designation,identity_handle,primary_narrative_anchor,immutable_core,role_commitments,created_at"],
      ["order", "created_at.desc"],
      ["limit", 1],
    ])
  );

  return rows[0] ?? null;
}

async function getAgentMemoryRecords(agentId: string): Promise<AgentMemoryRecordRow[]> {
  if (!agentId) {
    return [];
  }

  return selectRows<AgentMemoryRecordRow>(
    "agent_memory_records",
    buildQuery([
      ["agent_id", `eq.${agentId}`],
      ["select", "memory_id,agent_id,memory_kind,title,summary,detail,tags,salience,confidence,created_at"],
      ["order", "salience.desc,created_at.desc"],
      ["limit", 20],
    ])
  );
}

async function getAgentMemories(agentId: string): Promise<AgentMemorySummaryRow[]> {
  if (!agentId) {
    return [];
  }

  return selectRows<AgentMemorySummaryRow>(
    "agent_memories",
    buildQuery([
      ["agent_id", `eq.${agentId}`],
      ["select", "id,agent_id,memory_type,summary,detail_payload,salience,created_at"],
      ["order", "created_at.desc"],
      ["limit", 10],
    ])
  );
}

async function getAgentAutobiography(agentId: string): Promise<AgentAutobiographyRow | null> {
  if (!agentId) {
    return null;
  }

  const rows = await selectRows<AgentAutobiographyRow>(
    "agent_autobiographies",
    buildQuery([
      ["agent_id", `eq.${agentId}`],
      ["select", "evolving_self_story,key_turning_points,stable_themes,unresolved_tensions,future_trajectory,private_hopes,created_at"],
      ["order", "created_at.desc"],
      ["limit", 1],
    ])
  );

  return rows[0] ?? null;
}

export type BillyIdentityContext = {
  profile: EmbodimentProfileRow | null;
  constitution: AgentConstitutionRow | null;
  memoryRecords: AgentMemoryRecordRow[];
  summaryMemories: AgentMemorySummaryRow[];
  persistentMemories: Awaited<ReturnType<typeof listMemoryEntries>>;
  founderContext: FounderContextRow | null;
  autobiography: AgentAutobiographyRow | null;
  identitySubject: IdentitySubjectRow | null;
};

export async function loadBillyIdentityContext(params: {
  userId: string;
  agentId: string;
}): Promise<BillyIdentityContext> {
  if (!hasSupabaseConfig() || !params.userId || params.userId === "guest-user" || !params.agentId) {
    return {
      profile: null,
      constitution: null,
      memoryRecords: [],
      summaryMemories: [],
      persistentMemories: [],
      founderContext: null,
      autobiography: null,
      identitySubject: null,
    };
  }

  const [profile, constitution, memoryRecords, summaryMemories, persistentMemories, founderContext, autobiography, identitySubject] =
    await Promise.all([
      getEmbodimentProfile("billy"),
      getAgentConstitution(params.agentId),
      getAgentMemoryRecords(params.agentId),
      getAgentMemories(params.agentId),
      listMemoryEntries({
        userId: params.userId,
        limit: 8,
      }),
      getFounderContext(params.userId),
      getAgentAutobiography(params.agentId),
      getIdentitySubject(params.userId),
    ]);

  return {
    profile,
    constitution,
    memoryRecords,
    summaryMemories,
    persistentMemories,
    founderContext,
    autobiography,
    identitySubject,
  };
}
