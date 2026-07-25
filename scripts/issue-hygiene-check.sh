#!/usr/bin/env bash
set -euo pipefail

printf "\n🔎 GestaltView issue hygiene check\n"
printf "=================================\n"

failures=0

printf "\n[1/3] Checking for tracked secret .env files (excluding examples)...\n"
tracked_envs="$(git ls-files | rg '(^|/)\.env$' || true)"
if [[ -n "${tracked_envs}" ]]; then
  printf "❌ Tracked .env files found:\n%s\n" "${tracked_envs}"
  printf "   Recommendation: remove from git history/index and rotate credentials.\n"
  failures=$((failures + 1))
else
  printf "✅ No tracked .env files detected.\n"
fi

printf "\n[2/3] Checking Billy components for Anthropic endpoint usage...\n"
anthropic_hits="$(rg -n 'api\.anthropic\.com' client/src/components/Billy*.tsx api/billy.ts || true)"
if [[ -n "${anthropic_hits}" ]]; then
  printf "❌ Anthropic endpoint usage found in Billy paths:\n%s\n" "${anthropic_hits}"
  failures=$((failures + 1))
else
  printf "✅ No Anthropic endpoint usage found in Billy components/API.\n"
fi

printf "\n[3/3] Checking core knowledge_fragments contract references...\n"
required_fields=(
  source_file
  content
  content_hash
  embedding
  document_type
)

missing=0
for field in "${required_fields[@]}"; do
  if ! rg -n "\\b${field}\\b" scripts/create_knowledge_table.sql scripts/ingest_corpus.py >/dev/null; then
    printf "❌ Missing required field reference: %s\n" "${field}"
    missing=$((missing + 1))
  fi
done

if [[ ${missing} -gt 0 ]]; then
  failures=$((failures + 1))
else
  printf "✅ Required knowledge_fragments field references found in SQL + ingestion script.\n"
fi

printf "\n=================================\n"
if [[ ${failures} -gt 0 ]]; then
  printf "❌ Issue hygiene check completed with %d failure group(s).\n" "${failures}"
  exit 1
fi

printf "✅ Issue hygiene check passed.\n"
