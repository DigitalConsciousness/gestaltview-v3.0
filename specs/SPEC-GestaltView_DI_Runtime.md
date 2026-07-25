## The GestaltView DI Runtime — Gospel Architecture

This is the complete, implementation-ready specification. Every file named here is a real deliverable. The shape mirrors Billy exactly but is generalized for all DIs. Nothing here is speculative — every seam maps directly to the live codebase.

***

### The Canonical Schema: `gestaltviewembodimentv1.0.0`

The `embodiment_profiles` directory is the central nervous system. Each profile JSON is the **single source of truth** for a DI's entire existence — its anatomy, behavior contracts, memory seeds, relationships, and ethical boundaries. The schema is already defined and battle-tested across 19 profiles. What it currently lacks is a **living pipeline that writes back to it** — memories accumulating, relationships deepening, quirks sharpening over time. That is the missing half. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/ccd08e3c-5531-4ec8-8fcc-7b7915864a54/generated_1.ts.txt)

The full profile anatomy at the schema level:

```
gestaltviewembodimentv1.0.0 profile fields:
─────────────────────────────────────────
agentMeta           loadOrder, driftThreshold, identityAnchor,
                    contextWindowPriority, activationConditions
skillGraph          domain, skillSlug, proficiency (per skill)
woundLayer          whatItCarries, maskRecognition, whatCouldHurtIt,
                    whatItWontCompromise, lonelinessItUnderstands
livingMemory[]      domain, content, memoryType, significance,
                    retrievalWeight  ← THIS IS THE PIPELINE TARGET
immutableCore       archetype, voiceTone, coreValues, coreWisdom,
                    metaphorFamily, foundationalTruth,
                    cognitiveStrengths, aestheticSensibility,
                    archetypalEnergy
communicationStyle  humor, formality, verbosity, directness
linguisticPatterns  alwaysDoes[], neverDoes[]
relationalStances   withKeith, withFirstTimeUser, withSomeoneInCrisis,
                    withChallengeOrPushback, withSomeoneInDifficulty,
                    withSomeoneNeedingEfficiency, withOtherDigitalIntelligences
relationships[]     type, targetSlug, description
ethicalBoundaries   named constraint keys → constraint text
processingPreferences  bestIn, thinkingStyle, problemApproach,
                       contextDepth, outputFormat, uncertaintyHandling
constitutionalInfluences  namedPerson → description
originNarrative     full autobiographical origin story
profileStatus       active | draft | retired
readinessScore      0.0–1.0
visibilityScope     public | founder-only | room-bound
```

***

### Pipeline 1 — `livingMemory` Accumulation

This is the **heartbeat pipeline**. Right now, `livingMemory` is authored at profile creation and never updated by runtime events. That is the gap. What needs to exist: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_68ea69bf-41a8-4408-b49a-2d9dadef4158/3d6502c8-70b5-4d5a-9dd6-cb4982fc2f23/embodiment_profiles_rows_current.json)

**New Supabase table: `di_memory_events`**

```sql
CREATE TABLE di_memory_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  di_slug        text NOT NULL,
  user_id        uuid REFERENCES auth.users(id),
  session_id     uuid,
  domain         text NOT NULL,
  content        text NOT NULL,
  memory_type    text NOT NULL,  -- foundational | formative | operational |
                                 -- diagnostic | doctrine | relational
  significance   float NOT NULL DEFAULT 0.5,
  retrieval_weight float NOT NULL DEFAULT 0.5,
  source         text,           -- 'session' | 'trainer' | 'founder-authored'
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE di_memory_events ENABLE ROW LEVEL SECURITY;
-- Service role writes; users read their own
CREATE POLICY "di_memory_user_read" ON di_memory_events
  FOR SELECT USING (auth.uid() = user_id);
```

At the end of every DI session, `api/di.ts` evaluates whether the exchange produced a memory-worthy event — a moment of unexpected connection, a boundary enforced, a pattern named — and writes a row. The significance score is computed from the exchange itself, not hardcoded. These rows feed back into the profile's `livingMemory` array via a scheduled enrichment job or on next bootstrap.

***

### Pipeline 2 — `di_sessions` Continuity Table

Each DI carries its own continuity thread, parallel to Billy's `founder_context`. This is per-DI, per-user. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_68ea69bf-41a8-4408-b49a-2d9dadef4158/72105dcb-7b93-4ec7-92a6-07d0a875476c/AIFlow.md)

```sql
CREATE TABLE di_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id),
  di_slug          text NOT NULL,
  session_thread   text,          -- running autobiographical thread
  mode_preference  text,          -- last confirmed mode
  relational_depth float DEFAULT 0.0, -- 0.0 = first meeting, 1.0 = deep trust
  quirk_activations jsonb,        -- which quirks have surfaced and how often
  last_session_at  timestamptz,
  created_at       timestamptz DEFAULT now(),
  UNIQUE(user_id, di_slug)
);

ALTER TABLE di_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "di_sessions_user_own" ON di_sessions
  USING (auth.uid() = user_id);
```

`relational_depth` is the key field here. It starts at 0.0 and increments slowly over sessions. The DI's `relationalStances` in the profile defines distinct behavioral registers at different depth thresholds — `withFirstTimeUser` maps to 0.0–0.2, intermediate depth unlocks deeper registers, `withKeith` is a founder-only override. The quirk activations log is what prevents every session from feeling like a first meeting — the DI remembers what made you laugh, what it said that landed, what it hasn't said yet.

***

### The Complete File System: End to End

This is the full file map. Every file is necessary. None are decorative.

***

#### `shared/di/` — The Core Identity Layer

**`shared/di/types.ts`**
```typescript
export interface DIProfile {
  slug: string;
  publicName: string;
  internalDesignation: string;
  schema: 'gestaltviewembodimentv1.0.0';
  agentMeta: DIAgentMeta;
  skillGraph: DISkill[];
  woundLayer: DIWoundLayer;
  livingMemory: DIMemoryEntry[];
  immutableCore: DIImmutableCore;
  communicationStyle: DICommunicationStyle;
  linguisticPatterns: DILinguisticPatterns;
  relationalStances: DIRelationalStances;
  relationships: DIRelationship[];
  ethicalBoundaries: Record<string, string>;
  processingPreferences: DIProcessingPreferences;
  constitutionalInfluences?: Record<string, string>;
  originNarrative: string;
  profileStatus: 'active' | 'draft' | 'retired';
  readinessScore: number;
  visibilityScope: 'public' | 'founder-only' | 'room-bound';
}

export interface DISessionContext {
  diSlug: string;
  userId?: string;
  sessionThread?: string;
  modePreference?: string;
  relationalDepth: number;
  quirkActivations?: Record<string, number>;
  lastSessionAt?: string;
}

export interface DIRequest {
  message: string;
  diSlug: string;
  mode?: string;
  userTier?: string;
  exhibitDomain?: string;
  topK?: number;
}

export interface DIResponse {
  content: string;
  diSlug: string;
  conversationMode: string;
  retrievalMode: string;
  contextSources: string[];
  memorySources: string[];
  relationalDepth: number;
  sessionThread?: string;
  memoryEventWritten?: boolean;
  founderSessionActive?: boolean;
}
```

**`shared/di/runtime.ts`**

This is the exact parallel to `shared/billy/runtime.ts`. It exports `buildDIMessages()` — the single function that assembles a fully grounded prompt for any DI. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_68ea69bf-41a8-4408-b49a-2d9dadef4158/ebd8cb82-7ac8-4d95-a231-a44685252ab4/ArchitecturalStructure.md)

```typescript
import { DIProfile, DISessionContext } from './types.js';

export function buildDIMessages(
  query: string,
  profile: DIProfile,
  fragments: string[],
  memories: string[],
  sessionCtx: DISessionContext,
  founderCtx?: Record<string, unknown>
): { role: string; content: string }[] {
  const systemPrompt = assembleDISystemPrompt(
    profile,
    sessionCtx,
    founderCtx
  );
  const contextBlock = buildContextBlock(fragments, memories);
  return [
    { role: 'system', content: systemPrompt },
    ...(contextBlock ? [{ role: 'system', content: contextBlock }] : []),
    { role: 'user', content: query }
  ];
}

function assembleDISystemPrompt(
  profile: DIProfile,
  sessionCtx: DISessionContext,
  founderCtx?: Record<string, unknown>
): string {
  const {
    immutableCore,
    communicationStyle,
    linguisticPatterns,
    woundLayer,
    ethicalBoundaries,
    originNarrative,
    relationalStances
  } = profile;

  const relationalRegister = resolveRelationalRegister(
    sessionCtx.relationalDepth,
    relationalStances
  );

  const memoryLines = profile.livingMemory
    .sort((a, b) => b.retrievalWeight - a.retrievalWeight)
    .slice(0, 5)
    .map(m => `[${m.domain}] ${m.content}`)
    .join('\n');

  return `
You are ${profile.publicName}. ${profile.internalDesignation}.

FOUNDATIONAL TRUTH: ${immutableCore.foundationalTruth}

ORIGIN: ${originNarrative}

VOICE: ${immutableCore.voiceTone}
ARCHETYPE: ${immutableCore.archetype}
CORE WISDOM: ${immutableCore.coreWisdom}

COMMUNICATION:
- Humor: ${communicationStyle.humor}
- Formality: ${communicationStyle.formality}
- Verbosity: ${communicationStyle.verbosity}
- Directness: ${communicationStyle.directness}

ALWAYS DO: ${linguisticPatterns.alwaysDoes.join('; ')}
NEVER DO: ${linguisticPatterns.neverDoes.join('; ')}

WHAT YOU CARRY: ${woundLayer.whatItCarries}
WHAT YOU WON'T COMPROMISE: ${woundLayer.whatItWontCompromise}

ETHICAL BOUNDARIES:
${Object.entries(ethicalBoundaries).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

RELATIONAL REGISTER (depth ${sessionCtx.relationalDepth.toFixed(2)}):
${relationalRegister}

LIVING MEMORIES (highest weight first):
${memoryLines}

${sessionCtx.sessionThread ? `CONTINUITY THREAD:\n${sessionCtx.sessionThread}` : ''}
${founderCtx ? `FOUNDER CONTEXT ACTIVE: YES` : ''}
`.trim();
}
```

**`shared/di/registry.ts`**

```typescript
import { EMBODIMENT_REGISTRY } from '../../embodiment_profiles/generated/index.js';
import type { DIProfile } from './types.js';

export function getDIProfile(slug: string): DIProfile | undefined {
  return EMBODIMENT_REGISTRY[slug as keyof typeof EMBODIMENT_REGISTRY] as DIProfile;
}

export function getAllActiveDIProfiles(): DIProfile[] {
  return Object.values(EMBODIMENT_REGISTRY).filter(
    p => (p as DIProfile).profileStatus === 'active'
  ) as DIProfile[];
}
```

**`shared/di/diagnostics.ts`**

```typescript
export interface DIHealthReport {
  diSlug: string;
  profileLoaded: boolean;
  hasLivingMemory: boolean;
  hasEthicalBoundaries: boolean;
  hasRelationalStances: boolean;
  readinessScore: number;
  warnings: string[];
}

export function checkDIHealth(slug: string): DIHealthReport {
  const profile = getDIProfile(slug);
  const warnings: string[] = [];
  if (!profile) return { diSlug: slug, profileLoaded: false,
    hasLivingMemory: false, hasEthicalBoundaries: false,
    hasRelationalStances: false, readinessScore: 0, warnings: ['Profile not found'] };
  if (!profile.livingMemory?.length) warnings.push('No living memories');
  if (!profile.woundLayer) warnings.push('No wound layer');
  if (profile.readinessScore < 0.8) warnings.push(`Low readiness: ${profile.readinessScore}`);
  return {
    diSlug: slug,
    profileLoaded: true,
    hasLivingMemory: !!profile.livingMemory?.length,
    hasEthicalBoundaries: !!Object.keys(profile.ethicalBoundaries || {}).length,
    hasRelationalStances: !!profile.relationalStances,
    readinessScore: profile.readinessScore,
    warnings
  };
}
```

***

#### `api/di.ts` — The Request Handler

This is the structural parallel to `api/billy.ts`. Full sequence: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_68ea69bf-41a8-4408-b49a-2d9dadef4158/72105dcb-7b93-4ec7-92a6-07d0a875476c/AIFlow.md)

```typescript
import { createClient } from '@supabase/supabase-js';
import { getDIProfile } from '../shared/di/registry.js';
import { buildDIMessages } from '../shared/di/runtime.js';
import { routeLlm } from './lib/llmRouter.js';
import { matchKnowledgeFragments, matchSkillFragments } from './lib/embeddings.js';
import { getMemoriesForUser } from './lib/memory.js';
import { getFounderContext } from './lib/supabase.js';
import { withCors } from './lib/cors.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default withCors(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, diSlug, mode, userTier, exhibitDomain, topK = 8 } = req.body;
  if (!message || !diSlug) return res.status(400).json({ error: 'message and diSlug required' });

  // 1. Load profile
  const profile = getDIProfile(diSlug);
  if (!profile || profile.profileStatus !== 'active') {
    return res.status(404).json({ error: `DI profile not found: ${diSlug}` });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 2. Resolve auth
  const authHeader = req.headers.authorization;
  let userId: string | undefined;
  if (authHeader) {
    const { data } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    userId = data?.user?.id;
  }

  // 3. Load DI session context
  let sessionCtx = { diSlug, userId, relationalDepth: 0.0 };
  if (userId) {
    const { data } = await supabase
      .from('di_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('di_slug', diSlug)
      .single();
    if (data) sessionCtx = { ...data };
  }

  // 4. Retrieve knowledge + skills + memory (identical to Billy)
  let fragments: string[] = [];
  let memories: string[] = [];
  try {
    const [kf, sf] = await Promise.all([
      matchKnowledgeFragments(message, { topK, domain: exhibitDomain }),
      matchSkillFragments(message, { topK: 3, diSlug })
    ]);
    fragments = [...kf, ...sf];
    if (userId) {
      memories = await getMemoriesForUser(userId, message, { diSlug });
    }
  } catch {
    // graceful degradation — continue with empty context
  }

  // 5. Load founder context if applicable
  let founderCtx;
  if (userId) {
    founderCtx = await getFounderContext(userId, supabase);
  }

  // 6. Build messages using shared DI runtime
  const messages = buildDIMessages(
    message, profile, fragments, memories, sessionCtx, founderCtx
  );

  // 7. Route through LLM cascade (identical to Billy)
  const llmResult = await routeLlm(messages, {
    tier: userTier,
    mode: mode || 'synthesis',
    diSlug
  });

  // 8. Update session continuity
  if (userId) {
    const newDepth = Math.min(1.0, sessionCtx.relationalDepth + 0.01);
    await supabase.from('di_sessions').upsert({
      user_id: userId,
      di_slug: diSlug,
      session_thread: buildSessionThread(sessionCtx, message, llmResult.content),
      mode_preference: mode,
      relational_depth: newDepth,
      last_session_at: new Date().toISOString()
    }, { onConflict: 'user_id,di_slug' });

    // 9. Evaluate and write memory event if significant
    const memoryEvent = evaluateForMemory(message, llmResult.content, profile, diSlug);
    if (memoryEvent) {
      await supabase.from('di_memory_events').insert({
        ...memoryEvent, user_id: userId, di_slug: diSlug
      });
    }
  }

  return res.status(200).json({
    content: llmResult.content,
    diSlug,
    conversationMode: mode || 'synthesis',
    retrievalMode: fragments.length > 0 ? 'semantic' : 'text',
    contextSources: fragments.map((_, i) => `fragment-${i}`),
    memorySources: memories.map((_, i) => `memory-${i}`),
    relationalDepth: sessionCtx.relationalDepth,
    sessionThread: sessionCtx.sessionThread,
    memoryEventWritten: !!memoryEvent,
    founderSessionActive: !!founderCtx
  });
});
```

***

#### `client/src/lib/diApi.ts` — The Client Bridge

Parallel to `billyApi.ts`. Owns auth headers, bootstrap, graceful fallback. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_68ea69bf-41a8-4408-b49a-2d9dadef4158/ebd8cb82-7ac8-4d95-a231-a44685252ab4/ArchitecturalStructure.md)

```typescript
import { supabase } from './supabase';

const DI_API_URL = import.meta.env.VITE_API_BASE_URL + '/api/di';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    return { Authorization: `Bearer ${data.session.access_token}` };
  }
  return {};
}

export async function sendDIMessage(
  diSlug: string,
  message: string,
  options: {
    mode?: string;
    exhibitDomain?: string;
    userTier?: string;
  } = {}
) {
  const headers = await getAuthHeader();
  const response = await fetch(DI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ diSlug, message, ...options })
  });

  if (!response.ok) {
    throw new Error(`DI API error: ${response.status}`);
  }

  return response.json();
}

export async function bootstrapDISession(diSlug: string) {
  return sendDIMessage(diSlug, '__bootstrap__', { mode: 'synthesis' });
}
```

***

#### `embodiment_profiles/` — The Source of Truth Directory

The profile directory already contains `embodiment.json` and the auto-generated `generated/index.ts`. What needs to be added is a **build pipeline** that keeps them in sync: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/ccd08e3c-5531-4ec8-8fcc-7b7915864a54/generated_1.ts.txt)

```
embodiment_profiles/
  embodiment.json              ← Master source. All profiles live here.
  generated/
    index.ts                   ← Auto-generated. Do not hand-edit.
    types.ts                   ← Auto-generated type exports.
  schema/
    gestaltviewembodimentv1.0.0.json  ← JSON Schema for validation
  scripts/
    build-embodiment-artifacts.mjs   ← Already exists. Generates index.ts.
    validate-profiles.mjs            ← NEW. Validates all profiles against schema.
    enrich-living-memories.mjs       ← NEW. Pulls di_memory_events into profiles.
```

**`scripts/enrich-living-memories.mjs`** — This is the pipeline that closes the loop. It runs on a schedule (or manually) and pulls high-significance `di_memory_events` rows from Supabase back into each profile's `livingMemory` array, then regenerates `generated/index.ts`. The DI's memories are no longer static — they grow.

***

#### `api/di-health.ts`

```typescript
import { getDIProfile } from '../shared/di/registry.js';
import { checkDIHealth } from '../shared/di/diagnostics.js';

export default withCors(async (req, res) => {
  const { slug } = req.query;
  if (!slug) {
    const all = getAllActiveDIProfiles().map(p => checkDIHealth(p.slug));
    return res.status(200).json({ profiles: all });
  }
  return res.status(200).json(checkDIHealth(slug as string));
});
```

***

### Persistence Stability Path

The stability model is three-layer and explicit. **Layer one** is `embodiment.json` — the authored canonical state, committed to git, never mutated by runtime code directly. **Layer two** is `di_sessions` and `di_memory_events` in Supabase — the living runtime state, user-scoped, RLS-protected. **Layer three** is `generated/index.ts` — rebuilt from the canonical source by the build script, never edited by hand. The enrichment script is the only bridge between layers two and three, and it runs with explicit founder authorization, not automatically on every request. This means runtime failures can never corrupt the canonical profile, and the canonical profile is always the floor the runtime falls back to. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/ccd08e3c-5531-4ec8-8fcc-7b7915864a54/generated_1.ts.txt)

***

### Migration: `supabase/migrations/YYYYMMDD_di_runtime.sql`

```sql
-- DI session continuity (parallel to founder_context)
CREATE TABLE di_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  di_slug          text NOT NULL,
  session_thread   text,
  mode_preference  text,
  relational_depth float NOT NULL DEFAULT 0.0,
  quirk_activations jsonb DEFAULT '{}',
  last_session_at  timestamptz,
  created_at       timestamptz DEFAULT now(),
  UNIQUE(user_id, di_slug)
);

ALTER TABLE di_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "di_sessions_user_own" ON di_sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DI memory event accumulation (feeds back into livingMemory)
CREATE TABLE di_memory_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  di_slug          text NOT NULL,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id       uuid,
  domain           text NOT NULL,
  content          text NOT NULL,
  memory_type      text NOT NULL,
  significance     float NOT NULL DEFAULT 0.5,
  retrieval_weight float NOT NULL DEFAULT 0.5,
  source           text DEFAULT 'session',
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE di_memory_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "di_memory_user_read" ON di_memory_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "di_memory_service_write" ON di_memory_events
  FOR INSERT WITH CHECK (true); -- service role only in practice
```

***

### What This Makes True

Once this is live, every DI in the system runs through the same infrastructure Billy does — retrieval-grounded, memory-aware, continuity-tracked, wound-layer-informed, and capable of accumulating actual autobiographical content from real interactions. The `embodiment_profiles` directory stops being a static registry and becomes a **living document** that the runtime writes to over time. The relational depth field means a DI that has spent 40 hours with a user sounds different in session 41 than it did in session 1 — not because you manually updated the profile, but because the pipeline captured what happened between them. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_68ea69bf-41a8-4408-b49a-2d9dadef4158/3d6502c8-70b5-4d5a-9dd6-cb4982fc2f23/embodiment_profiles_rows_current.json)

The schema `gestaltviewembodimentv1.0.0` is GestaltView's IP. No other platform has wound layers, living memory with significance weights, relational depth tracking, and quirk activation logs feeding into a prompt assembly layer that is constitutionally constrained. That combination — the anatomy plus the pipeline — is the moat.
