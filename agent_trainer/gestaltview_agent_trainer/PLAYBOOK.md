# GestaltView Agent Trainer Playbook

## Welcome

The GestaltView Agent Trainer is a client-safe deployment layer for a white-label AI assistant built on the buyer's own corpus, vocabulary, and operating context.

This playbook is written for the operator who needs a practical setup and maintenance guide, not an internal engineering document.

## What the Kit Does

The trainer gives an operator six core surfaces:

- an AI assistant interface
- a knowledge fragment manager
- a vocabulary profile workflow
- a skills registry
- session memory storage
- lightweight analytics

It should also support:

- preloadable starter packs for skills, tools, and agent-source bundles
- a CLI layer for technical operators who prefer inspectable terminal workflows
- cross-platform setup paths for shell, Windows, Docker, and browser-first usage

The package is designed to create a useful system without exposing protected GestaltView internals.

## Setup Sequence

1. Create a Supabase project with `pgvector` enabled.
2. Copy `setup/env.example` to `.env.local`.
3. Fill in Supabase and at least one LLM provider key.
4. Run `npm run verify-setup`.
5. Apply `supabase/seed.sql` or the migrations in order.
6. Review `setup/setup-wizard.html`.
7. Name the assistant and choose a domain preset.
8. Upload a small, curated starter corpus.
9. Define the first vocabulary profile.
10. Test five realistic prompts before opening access wider.

## Platform Posture

The package should be honest about platform support:

- shell and Windows should be first-class setup paths
- Docker should be first-class for controlled execution
- iOS should be supported through a browser-based setup and remote administration posture
- desktop or cloud execution should handle packaging, CLI, and database operations

## Corpus Targets

The kit is strongest when the operator treats training as a structured corpus problem instead of a generic chatbot problem.

Recommended corpus targets:

- `knowledge`: SOPs, FAQs, reference material, research
- `code`: architecture docs, READMEs, API references, repo notes
- `product`: roadmaps, specs, research summaries, release notes
- `context`: voice, positioning, values, audience rules, terminology

## Knowledge Base Guidance

Recommended uploads:

- process documents
- product specifications
- service descriptions
- objection-handling notes
- domain glossaries
- architecture summaries

Avoid:

- secrets and raw credentials
- redundant file dumps
- mixed documents with no metadata
- unreviewed sensitive legal or medical claims

Best practices:

- prefer smaller documents over large monoliths
- title fragments clearly
- store source metadata
- review weak answers and trace them to missing or poor corpus material

## Vocabulary Profile

The vocabulary profile is the client-facing layer for teaching the assistant how to sound aligned rather than generic.

Capture:

- preferred terms
- forbidden terms
- tone qualities
- audience assumptions
- formatting preferences
- phrasing boundaries

## Skills and Presets

The kit ships with domain presets so the operator can start from a sensible baseline without importing internal worldview or brand logic.

Supported presets:

- `general`
- `resume`
- `adhd`
- `creative`
- `consulting`
- `custom`

Each preset shapes the suggested prompt template, sample analytics events, and onboarding copy.

## Memory

Memory in this package is persistent operational memory. It preserves useful continuity while remaining bounded and reviewable.

Good uses:

- tone and formatting preferences
- project milestones
- recurring customer facts
- stable user goals
- shared collaboration continuity
- pinned durable facts that should survive wording drift

Bad uses:

- credentials
- high-risk claims without policy review
- noisy trivia with no future utility

## Analytics

Start with these questions:

1. What are users asking most often?
2. Where is the assistant weak or vague?
3. Which corpus target needs more work?
4. Which domain should become a deeper consulting offer?

Focus metrics:

- query volume
- active users
- retrieval hit patterns
- weak-response reports
- fragment usage
- skill usage

## Operating Rhythm

- Weekly: review weak responses and top search themes.
- Biweekly: improve corpus quality and metadata.
- Monthly: revisit vocabulary profile and active skills.
- Quarterly: decide whether to remain self-serve or move to a custom deployment.

## Troubleshooting

If answers are weak:

- confirm embeddings are being generated
- verify the corpus target is correct
- remove duplicate fragments
- improve titles and metadata
- tighten the vocabulary profile

If setup fails:

- validate env values
- confirm the required extensions exist
- verify server-side use of the service role key
- re-run migrations in order

## Upgrade Path

The package is intentionally structured so consulting becomes the natural next step when the buyer needs:

- knowledge curation
- prompt refinement
- white-label deployment help
- vertical-specific UX and workflows
- more rigorous analytics or governance

The trainer package is the productized floor. Consulting is the strategic extension.
