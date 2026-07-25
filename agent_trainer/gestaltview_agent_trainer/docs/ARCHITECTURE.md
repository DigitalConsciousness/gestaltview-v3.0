# Architecture Overview

## Package Goal

Provide a self-contained white-label AI assistant scaffold that can be deployed against the buyer's own corpus and infrastructure.

## Major Layers

- `supabase/`: schema, migrations, RLS, and retrieval functions
- `api/`: framework-agnostic handlers and helper libraries
- `components/`: reusable UI primitives for assistant operations
- `pages/`: route-level page scaffolds
- `config/`: commercial tiers, presets, and prompt templates
- `setup/`: onboarding and environment validation

## Retrieval Model

This package uses a simplified retrieval scaffold:

- vector similarity via `match_knowledge`
- keyword search via `search_knowledge`
- top-K context assembly in `api/_lib/contextAssembler.ts`

It intentionally does not include the full internal multi-stream RRF assembly logic from the parent product.

## Runtime Boundary

This scaffold avoids parent imports. It is designed to compile and evolve on its own once wired into a runtime framework of your choice.
