# GIL Protocol

GIL, the GestaltView Intent Layer, is the official synthesis and retrieval
protocol for meaning-bearing work in this repository.

## Purpose

GIL carries the intent, governance, routing, and corpus-context signals that
should shape how content is summarized, synthesized, and retrieved. It is
used to understand context and meaning beyond the literal words on the page.

## Canonical Inputs

The protocol is expressed as YAML. The current canonical example lives at:

- [`gil/rough-draft-ratification.yaml`](/workspaces/gestaltview-v2.0/gil/rough-draft-ratification.yaml)
- [`gil/targeted-summarization-runs.yml`](/workspaces/gestaltview-v2.0/gil/targeted-summarization-runs.yml)
- [`gil/targeted-summarization-core-docs.yml`](/workspaces/gestaltview-v2.0/gil/targeted-summarization-core-docs.yml)
- [`gil/targeted-summarization-agent-trainer.yml`](/workspaces/gestaltview-v2.0/gil/targeted-summarization-agent-trainer.yml)
- [`gil/targeted-summarization-mixed.yml`](/workspaces/gestaltview-v2.0/gil/targeted-summarization-mixed.yml)

Additional examples may live under `gil/examples/`.

## Required Sections

The protocol currently uses these sections:

- `envelope`: provenance and intent metadata
- `normalized`: normalized meaning, role, and summary
- `context`: repo and corpus references that constrain interpretation
- `governance`: doctrine links and safety flags
- `routing`: model, safety, and runtime preferences

## How It Is Used

- `scripts/synthesize_corpus.py` loads a GIL protocol and injects it into the
  summary and loom prompts.
- `scripts/synthesize_corpus.py` also uses the GIL context to infer retrieval
  scope and rank fragments before summarization.
- `scripts/synthesize_corpus.py --run-spec <file>` can execute multiple
  timeboxed runs from a YAML profile file and write one manifest per run.
- `scripts/targeted-summarization.sh` provides a simple launcher for the
  `core-docs`, `agent-trainer`, `mixed`, or `all` profile groups.
- `scripts/gestaltview_manifest_pipeline.py` uses the same protocol for
  filesystem corpus synthesis.
- The generated manifest output includes the GIL envelope metadata as
  provenance.

## Operational Rule

If a GIL protocol is present, it is treated as the first interpretive lens for
summarization and retrieval. Raw fragment text is still read, but it is
interpreted through the protocol's intent, governance, and routing context.
