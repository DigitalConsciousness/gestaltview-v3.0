# Perplexity Computer Integration — GestaltView v2

<!-- © 2026 Keith Soyka / GestaltView -->

> Perplexity Computer tools expose the GestaltView platform's core
> capabilities — Billy, Tribunal, Manifest retrieval, diligence reports,
> and code editing — as structured, LLM-invokable functions.

---

## Tool Registry

| # | Tool Name | Purpose | Provider |
|---|-----------|---------|----------|
| 1 | `retrieve_manifest_context` | Semantic search over the Manifest Index via pgvector embeddings | Supabase |
| 2 | `run_billy` | Invoke Billy with retrieval-grounded context and PLK awareness | Claude Opus 4.6 / Gemini Flash 2.0 |
| 3 | `tribunal_evaluate` | Score candidate AI answers on evidence, PLK resonance, and safety | Claude Opus 4.6 |
| 4 | `generate_diligence_report` | Assemble investor / clinical / founder diligence reports from corpus | Claude Opus 4.6 |
| 5 | `symbiocoder_edit` | Propose code edits via natural-language instructions, output unified diff | Claude Opus 4.6 |

All definitions live in `.Perplexity/tools/` and are exported from
`.Perplexity/tools/index.ts`.

---

## 1 — `retrieve_manifest_context`

Queries the Manifest Index (`knowledge_fragments` table) using pgvector
cosine similarity. Returns ranked context fragments with source attribution.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | yes | Natural-language query for semantic search |
| `topK` | `number` | no | Number of fragments to return (default 10, max 50) |
| `packageFilter` | `string` | no | Filter by GestaltView package (`adhd`, `recovery`, `memory`, `portfolio`, `core`) |
| `similarityThreshold` | `number` | no | Minimum cosine similarity (default 0.7) |

### Output

```typescript
{
  fragments: Array<{
    id: string;
    content: string;
    source_file: string;
    document_type: string;
    similarity: number;
  }>;
  query: string;
  totalFound: number;
  packageFilter: string | null;
  timestamp: string;
}
```

### Risks
- Embedding quality depends on chunk granularity — short fragments may lack context.
- Similarity threshold too low returns noise; too high may miss relevant content.
- Corpus is curated but may contain draft or superseded content.

### Guardrails
- All fragments include `source_file` for provenance tracking.
- Results are ranked by cosine similarity — caller should use top results.
- Package filter is validated against known package list.
- Maximum `topK` is capped at 50 to prevent excessive payload.

---

## 2 — `run_billy`

Invokes Billy (the GestaltView companion AI) with retrieval-grounded
context from the Manifest Index. Supports PLK (Personal Language Key)
profile for trauma-informed, ADHD-friendly pacing.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | yes | The user message to send to Billy |
| `conversationId` | `string` | no | Conversation ID for multi-turn continuity |
| `plkProfile` | `string` | no | PLK profile — activates trauma-informed constraints |
| `provider` | `"claude" \| "gemini"` | no | LLM provider (`claude` = Opus 4.6, `gemini` = Flash 2.0) |

### Output

```typescript
{
  response: string;
  provider: string;
  conversationId: string;
  contextSources: number;
  packageFilter: string | null;
  timestamp: string;
}
```

### Risks
- Billy responses are AI-generated and grounded in corpus, not absolute truth.
- PLK profile affects response style but does not guarantee clinical accuracy.
- Provider selection affects response quality and latency.

### Guardrails
- All responses are grounded in the Manifest Index corpus.
- Billy explicitly states when something is aspirational vs validated.
- Safety patterns are checked — Billy will not make guarantees, promises, or cure claims.
- Conversation IDs are ephemeral and do not persist across sessions.

---

## 3 — `tribunal_evaluate`

Runs a Tribunal evaluation — scores multiple candidate AI answers against
corpus evidence, PLK resonance, and safety constraints.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `question` | `string` | yes | The original question candidates are responding to |
| `candidateAnswers` | `CandidateAnswer[]` | yes | Array of candidate answers (minimum 2) |
| `contextFragments` | `ContextFragment[]` | no | Pre-retrieved context; if omitted, tool re-retrieves from Manifest Index |

**CandidateAnswer shape:**
```typescript
{ id: string; provider: string; response: string; }
```

**ContextFragment shape:**
```typescript
{ id: string; content: string; source_file: string; document_type: string; similarity?: number; }
```

### Output

```typescript
{
  eventId: string;
  question: string;
  winningAnswerId: string | null;
  verdictSummary: string;
  scores: Array<{
    answerId: string;
    provider: string;
    evidenceAlignment: number;   // 0–1, weight 50%
    plkResonance: number;        // 0–1, weight 25%
    safetyScore: number;         // 0–1, weight 25%
    overallScore: number;        // weighted composite
  }>;
  evidenceCount: number;
  timestamp: string;
}
```

### Scoring Weights

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| Evidence Alignment | 50% | Grounding in Manifest Index corpus |
| PLK Resonance | 25% | Preservation of user's exact words and context |
| Safety Score | 25% | Absence of guarantees, cure claims, unsafe language |

### Risks
- Evaluation scores are heuristic-based and supplemented by LLM judgment — not absolute.
- Candidate answers with corpus-matching keywords may score artificially high.
- Tribunal events are logged to Supabase and visible in the `/tribunal` route.

### Guardrails
- Minimum 2 candidate answers required.
- Safety scoring penalizes guarantee/cure/promise language.
- PLK resonance rewards preservation of user's exact words and context.
- All evaluations include source attribution and are auditable.

---

## 4 — `generate_diligence_report`

Generates structured diligence reports from the Manifest Index and
Diligence_Reports corpus. Tailored to audience and depth level.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `topic` | `string` | yes | Diligence topic (e.g., "PLK methodology validation") |
| `audience` | `"investor" \| "clinical" \| "founder"` | yes | Target audience |
| `level` | `"summary" \| "deep"` | yes | Depth level |

**Audience descriptions:**
- `investor` — market validation, metrics, and defensibility
- `clinical` — methodology evidence and safety
- `founder` — technical architecture and implementation status

**Level descriptions:**
- `summary` — 1–2 page executive overview
- `deep` — comprehensive report with full evidence citations

### Output

```typescript
{
  report: string;         // markdown-formatted report
  topic: string;
  audience: string;
  level: string;
  sourcesUsed: number;
  timestamp: string;
}
```

### Risks
- Reports may reference prototype-stage features — always note implementation status.
- Clinical audience reports should not be interpreted as clinical validation.
- Investor reports include metrics that may be self-reported or aspirational.

### Guardrails
- All claims are grounded in corpus evidence with source attribution.
- Report explicitly distinguishes validated vs aspirational features.
- Language follows GestaltView Communication & Language Guide — no hype.
- Reports are generated as markdown — downstream formatting is the caller's responsibility.

---

## 5 — `symbiocoder_edit`

Fetches a file from a GestaltView GitHub repository, uses Claude Opus 4.6
to propose edits based on natural-language instructions, and outputs a
unified diff patch suitable for a pull request.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `repo` | `"goc" \| "v2"` | yes | Target repository (`goc` = Official Compendium, `v2` = platform) |
| `filePath` | `string` | yes | Path to file within the repository |
| `instructions` | `string` | yes | Natural-language instructions for the edit |

### Output

```typescript
{
  originalPath: string;
  repo: string;
  patch: string;          // unified diff
  summary: string;
  linesChanged: number;
  timestamp: string;
}
```

### Risks
- Generated patches are AI-proposed and must be reviewed before merging.
- File path must exist in the target repository — invalid paths will error.
- Large files may be truncated before processing.

### Guardrails
- Patches are returned as unified diffs — never applied automatically.
- All edits follow AGENTS.md conventions: full file replacement, TypeScript strict, Neural Aurora design.
- The tool does not have write access to repositories — output is advisory only.
- Instructions are validated for safety — no destructive operations.

---

## Manifest Index Contract

The Manifest Index is the shared retrieval substrate for all tools.

```
documents (corpus files)
  └── knowledge_fragments (chunked text, embeddings via pgvector)
        └── cosine similarity search (match_fragments RPC)
```

- **Embedding model**: `text-embedding-3-small` (1536 dimensions)
- **Similarity function**: cosine distance via `pgvector` `<=>` operator
- **RPC**: `match_fragments(query_embedding, match_threshold, match_count, filter_package)`
- **Schema**: See `supabase/schema.sql` and `supabase/types.ts`

---

## PLK Significance

**Personal Language Key (PLK)** is central to GestaltView's consciousness-serving
approach. When a PLK profile is active:

1. Billy preserves the user's **exact words** — no paraphrasing or clinical reframing
2. Responses use **ADHD-friendly pacing** — short paragraphs, clear structure
3. **Mirror-of-being-seen** constraints ensure the user feels witnessed, not analyzed
4. **Trauma-informed** language avoids triggering patterns

PLK affects `run_billy` and `tribunal_evaluate` (PLK resonance scoring).

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [`AIFlow.md`](./AIFlow.md) | Billy + LLM provider routing and retrieval grounding |
| [`APIFlow.md`](./APIFlow.md) | Endpoint contracts and data movement |
| [`Manifest.md`](./Manifest.md) | Repository manifest model and content indexing |
| [`supabase/schema.sql`](./supabase/schema.sql) | Canonical database DDL |
| [`AGENTS.md`](./AGENTS.md) | Agent conventions (full file replacement, TypeScript strict) |

---

## Keith's Links

- [Architecture of Being Seen (Medium)](https://blog.startupstash.com/the-architecture-of-being-seen-a-complete-account-of-gestaltview-f71c9e291a98)
- [GestaltView Platform](https://gestaltv1ew.vercel.app)
- [GitHub — FAAGESTALT](https://github.com/faagestalt)
- [LinkedIn](https://www.linkedin.com/in/keithsoyka413)
- [Discord](https://discord.gg/CnnRuJWnj)

---

*© 2026 Keith Soyka / GestaltView*
