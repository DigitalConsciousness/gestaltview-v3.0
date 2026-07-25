# Supabase Pipeline Cleanup For Agent Trainer Space

**Last updated:** 2026-04-10
**Goal:** Free enough Supabase free-tier database room for the Agent Trainer pipeline by deleting a small, chosen set of heavy Dynamic Corpus documents and their retrieval rows.

## Schema Notes

This repo uses snake_case corpus tables and columns:

- `documents.document_id`
- `documents.file_size_bytes`
- `documents.extracted_metadata`
- `embeddings.document_id`
- `knowledge_fragments.source_file`
- `skill_fragments.document_id`
- `skill_fragments.source_file`
- `processing_runs.run_id`

Do not use the older camelCase/table spellings such as `documentid`, `filesizebytes`, `knowledgefragments`, `skillfragments`, or `documentconcepts` in this project. They do not match the checked-in Supabase schema.

## Safety Rules

- Rank candidates first; delete by `document_id`, not by filename alone.
- Start with 2-3 heavy Dynamic Corpus documents, then check Supabase usage before removing more.
- Keep the first delete pass as `rollback;`; change it to `commit;` only after the verification counts look right.
- Run this from the Supabase SQL editor or another session with service-role/admin permissions.
- Do not touch Agent Trainer, GATE, order, buyer, or trainer-run tables for this cleanup.

## 1. Rank Heavy Dynamic Corpus Candidates

This finds likely Dynamic Corpus rows and counts the rows that will usually be freed with them. The fragment count joins through `source_file` because the current ingestion script writes `documents.document_id` to `embeddings`, but writes `knowledge_fragments` by relative `source_file`.

```sql
with doc_rollup as (
  select
    d.document_id,
    d.run_id,
    d.filename,
    d.path,
    d.file_size_bytes,
    length(d.content) as raw_content_chars,
    nullif(d.extracted_metadata->>'package', '') as package,
    nullif(d.extracted_metadata->>'relative_path', '') as relative_path,
    d.provenance->>'source' as provenance_source,
    d.created_at,
    (
      select count(*)
      from public.embeddings e
      where e.document_id = d.document_id
    ) as embedding_count,
    (
      select count(*)
      from public.knowledge_fragments kf
      where kf.source_file = any(
        array_remove(array[d.extracted_metadata->>'relative_path', d.filename, d.path], null)
      )
    ) as knowledge_fragment_count,
    (
      select count(*)
      from public.skill_fragments sf
      where sf.document_id = d.document_id
         or sf.source_file = any(
           array_remove(array[d.extracted_metadata->>'relative_path', d.filename, d.path], null)
         )
    ) as skill_fragment_count
  from public.documents d
  where lower(concat_ws(' ', d.path, d.filename, d.extracted_metadata::text, d.provenance::text)) like '%dynamic%'
)
select
  document_id,
  filename,
  path,
  package,
  relative_path,
  provenance_source,
  file_size_bytes,
  raw_content_chars,
  embedding_count,
  knowledge_fragment_count,
  skill_fragment_count,
  created_at
from doc_rollup
order by
  coalesce(file_size_bytes, 0) desc,
  raw_content_chars desc,
  knowledge_fragment_count desc,
  embedding_count desc
limit 25;
```

If the Dynamic Corpus filter is too narrow, use the same query and remove this line:

```sql
where lower(concat_ws(' ', d.path, d.filename, d.extracted_metadata::text, d.provenance::text)) like '%dynamic%'
```

## Candidate Batch From `HeavyCorpus.md`

`supabase/HeavyCorpus.md` now appears to be a post-second-clean snapshot. The prior six `knowledge-corpus` / `Dynamic Corpus Compendium` rows and the three `philosophy-narrative` Founder dynamic rows are no longer present in the candidate table.

Based on the captured before/after counts, the second pass removed about 11.8 MB of `documents.file_size_bytes`, about 3.61 million raw content characters, and 872 `knowledge_fragments` rows before considering any table/index overhead.

Second-pass batch already cleared:

```text
2177e3ec-a0ea-40b4-8640-0a12ba0e60c4  GestaltView Dynamic Knowledge Base 6_14_25 ... Keith Soyka.pdf
ae990aac-592d-4cb2-8882-5c1fee55b064  Keith's Dynamic Brain ... As Of 6_10_25 (1)(1).txt
64e3066f-598c-4308-b21d-4d7b9b216f82  Could I please get my full Dynamic Personality And.pdf
```

Only `3507a8ee-6e25-4e25-9a28-c1dca78218d3` (`dynamic-routing.md`) remains in the heavy-corpus scan. Skip it for quota cleanup. It is only 1,835 bytes, belongs to `skills-folder`, has two embedding rows, and has too little payoff compared with the Dynamic Corpus files that were already removed.

The latest post-clean audit captured in `HeavyCorpus.md` shows:

```text
documents:           1099 rows, 434,600,353 stored file bytes, 72,180,312 raw content chars
knowledge_fragments: 29234 rows, 30,571,238 chars
skill_fragments:     0 rows
embeddings:          4031 rows
```

## 2. Delete The Chosen Documents

The previous prefilled batches are already reflected in `HeavyCorpus.md`. Leave `purge_docs` empty for quota cleanup unless a future pass deliberately decides to prune the tiny `dynamic-routing.md` row for exact keyword hygiene rather than storage relief.

Keep `rollback;` on the first pass. After the verification result is clean, rerun with `commit;`.

```sql
begin;

create temp table purge_docs (
  document_id uuid primary key
) on commit drop;

-- No quota-worthy rows remain from the updated supabase/HeavyCorpus.md snapshot.
-- Optional exact-keyword pruning only, not recommended for quota relief:
--
-- insert into purge_docs (document_id) values
--   ('3507a8ee-6e25-4e25-9a28-c1dca78218d3');

create temp table purge_manifest on commit drop as
select
  d.document_id,
  d.run_id,
  d.filename,
  d.path,
  d.file_size_bytes,
  length(d.content) as raw_content_chars,
  nullif(d.extracted_metadata->>'package', '') as package,
  coalesce(nullif(d.extracted_metadata->>'relative_path', ''), d.filename) as relative_path,
  d.extracted_metadata,
  d.provenance
from public.documents d
join purge_docs p on p.document_id = d.document_id;

create temp table purge_source_keys on commit drop as
select distinct
  pm.document_id,
  pm.package,
  key.source_file
from purge_manifest pm
cross join lateral unnest(
  array_remove(array[pm.relative_path, pm.filename, pm.path], null)
) as key(source_file)
where btrim(key.source_file) <> '';

create temp table purge_runs on commit drop as
select distinct run_id
from purge_manifest
where run_id is not null;

select
  document_id,
  filename,
  path,
  package,
  relative_path,
  file_size_bytes,
  raw_content_chars
from purge_manifest
order by coalesce(file_size_bytes, 0) desc, raw_content_chars desc;

delete from public.embeddings e
using purge_docs p
where e.document_id = p.document_id;

delete from public.skill_fragments sf
using purge_docs p
where sf.document_id = p.document_id;

delete from public.skill_fragments sf
using purge_source_keys psk
where sf.source_file = psk.source_file
  and (
    psk.package is null
    or sf.tags @> array[psk.package]::text[]
    or sf.tags @> array['package:' || psk.package]::text[]
  );

delete from public.knowledge_fragments kf
using purge_source_keys psk
where kf.source_file = psk.source_file
  and (
    psk.package is null
    or kf.tags @> array[psk.package]::text[]
    or kf.tags @> array['package:' || psk.package]::text[]
  );

delete from public.documents d
using purge_docs p
where d.document_id = p.document_id;

delete from public.processing_runs pr
using purge_runs r
where pr.run_id = r.run_id
  and not exists (
    select 1
    from public.documents d
    where d.run_id = pr.run_id
  );

select 'documents' as surface, count(*) as remaining
from public.documents d
join purge_docs p on p.document_id = d.document_id
union all
select 'embeddings', count(*)
from public.embeddings e
join purge_docs p on p.document_id = e.document_id
union all
select 'skill_fragments_by_document_id', count(*)
from public.skill_fragments sf
join purge_docs p on p.document_id = sf.document_id
union all
select 'skill_fragments_by_source_file_any_package', count(*)
from public.skill_fragments sf
join purge_source_keys psk on psk.source_file = sf.source_file
union all
select 'knowledge_fragments_by_source_file_any_package', count(*)
from public.knowledge_fragments kf
join purge_source_keys psk on psk.source_file = kf.source_file
union all
select 'processing_runs_now_empty', count(*)
from public.processing_runs pr
join purge_runs r on r.run_id = pr.run_id
where not exists (
  select 1
  from public.documents d
  where d.run_id = pr.run_id
);

rollback;
-- After a successful dry run, change the two lines above to:
-- commit;
```

## 3. Post-Cleanup Size Audit

Run this after a committed cleanup to confirm row and content counts. This does not include private GATE or Agent Trainer operational tables.

```sql
select
  'documents' as table_name,
  count(*) as row_count,
  coalesce(sum(file_size_bytes), 0)::bigint as stored_file_bytes,
  coalesce(sum(length(content)), 0)::bigint as raw_content_chars
from public.documents

union all

select
  'knowledge_fragments',
  count(*),
  null::bigint,
  coalesce(sum(char_count), 0)::bigint
from public.knowledge_fragments

union all

select
  'skill_fragments',
  count(*),
  null::bigint,
  coalesce(sum(char_count), 0)::bigint
from public.skill_fragments

union all

select
  'embeddings',
  count(*),
  null::bigint,
  null::bigint
from public.embeddings;
```

Optional planner refresh after a committed cleanup:

```sql
analyze public.documents;
analyze public.embeddings;
analyze public.knowledge_fragments;
analyze public.skill_fragments;
```

Deleting rows frees reusable database space, but Supabase project-size reporting can lag and ordinary `vacuum` may not immediately shrink the physical database file. The practical goal here is to remove enough heavy rows that the Agent Trainer ingest can proceed without adding more corpus bloat.
