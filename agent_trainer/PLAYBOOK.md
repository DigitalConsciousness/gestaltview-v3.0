# GestaltView Operator Kit Playbook

## Welcome

The GestaltView Operator Kit is a client-safe packaging layer for deploying a white-label AI assistant on top of a buyer's own knowledge, brand language, and operational context. It is designed to be installable by a technical founder, agency, consultant, or small team without exposing GestaltView's internal constitutional IP.

This playbook serves two purposes:
- It is the setup and operating guide for buyers of the kit.
- It is also a trust-building document that demonstrates the rigor behind GestaltView's consulting, customization, and vertical buildout work.

## What the Kit Does

At its core, the kit helps an operator do six things:
- Create a branded AI assistant backed by the buyer's own API keys.
- Upload and manage a searchable knowledge base.
- Configure a vocabulary profile so the assistant reflects the buyer's terminology and tone.
- Attach domain-specific skills or workflows.
- Preserve useful session memory over time.
- Review usage analytics to improve quality and adoption.

This package is intentionally **not** a clone of the internal GestaltView runtime. It is a deployment-grade commercial layer that keeps the deepest secret sauce protected while still delivering real value.

## Setup Sequence

A clean setup follows this order:
1. Create a Supabase project.
2. Add the required environment variables from `setup/env.example`.
3. Run the SQL bootstrap and migrations.
4. Launch the setup wizard.
5. Name the assistant and choose a domain preset.
6. Upload starting knowledge.
7. Complete the vocabulary profile.
8. Test the assistant with five real prompts.

## Knowledge Base Guidance

The kit performs best when the knowledge base is curated rather than dumped in blindly.

Recommended upload types:
- SOPs and process docs.
- Service descriptions and FAQs.
- Brand voice documents.
- Product documentation.
- Sales call notes and objection handling.
- Role-specific reference material.

Avoid uploading:
- Raw secrets or credentials.
- Highly sensitive legal or medical information without review.
- Duplicate content in multiple formats unless intentional.
- Giant mixed dumps with no metadata.

Best practices:
- Prefer modular files over giant monoliths.
- Keep fragment titles descriptive.
- Add metadata for source, department, and audience.
- Review poor answers and trace them back to missing or weak source material.

## Vocabulary Profile

The vocabulary profile is the client-safe evolution of GestaltView's internal language-preservation philosophy. In the kit, this is presented as a practical configuration layer rather than a philosophical one.

The vocabulary profile should capture:
- Preferred terms.
- Terms to avoid.
- Tone qualities.
- Audience level.
- Sensitive phrasing boundaries.
- Brand or domain-specific shorthand.

A strong profile leads to outputs that feel aligned instead of generic.

## Skills and Domain Presets

The kit ships with domain presets that make onboarding easier without hardcoding GestaltView's internal worldview.

Preset examples:
- `general`
- `resume`
- `adhd`
- `creative`
- `consulting`
- `custom`

Each preset influences:
- Starter system prompt.
- Demo data.
- Suggested fields.
- Example user journeys.
- Recommended analytics events.

## Memory

Memory in the kit is operational memory, not mystical memory. It stores useful continuity items such as preferences, recurring facts, project context, and prior interaction signals.

Good uses of memory:
- Remembering preferred writing tone.
- Remembering user role and goals.
- Preserving project milestones.
- Recalling preferred formatting.

Bad uses of memory:
- Storing secrets.
- Storing health or legal claims without explicit policy.
- Saving noisy, low-value trivia.

## Analytics

The included analytics are lightweight but commercially useful.

Track these first:
- Query volume.
- Active users.
- Top searched topics.
- Weak-response patterns.
- Most-hit knowledge fragments.
- Skill usage frequency.
- Domain preset adoption.

Use analytics to answer three questions:
1. What do users actually ask?
2. Where is the assistant weak?
3. Which vertical deserves deeper consulting or a custom upgrade?

## Commercial Upgrade Path

This kit is built to work self-serve, but it is also intentionally designed to surface consulting opportunities.

Natural upgrade triggers:
- The buyer wants a vertical-specific deployment.
- The buyer wants help curating knowledge.
- The buyer needs a custom onboarding flow.
- The buyer wants better analytics or governance.
- The buyer wants a hosted or white-label version.

## Operating Rhythm

A healthy operator cadence looks like this:
- Weekly: review analytics and weak answers.
- Biweekly: add or improve source material.
- Monthly: refresh prompts, vocabulary, and inactive skills.
- Quarterly: evaluate whether the kit should stay self-serve or move into a custom consulting engagement.

## Troubleshooting

If responses are weak:
- Verify API keys.
- Confirm embeddings are being created.
- Check whether the right fragments are being retrieved.
- Reduce duplicate knowledge.
- Improve the vocabulary profile.
- Narrow the domain preset.

If setup fails:
- Validate env vars.
- Confirm Supabase extensions are enabled.
- Confirm service-role usage is server-side only.
- Re-run the SQL migrations in order.

## Consulting Appendix

GestaltView also offers service layers on top of this package:
- Knowledge base curation.
- Domain-specific assistant design.
- Prompt and vocabulary refinement.
- Full white-label deployment.
- Governance and AI rollout strategy.

The kit is the productized floor. Consulting is the strategic ceiling.
