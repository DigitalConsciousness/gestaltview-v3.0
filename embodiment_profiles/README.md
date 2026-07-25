# Embodiment Profiles

_Auto-generated from `embodiment_profiles/*.embodiment.json`. Edit the JSON profiles, then run `python3 embodiment_profiles/embodiment_profile_content.py`._

These markdown reference pages are derived from the canonical runtime embodiment profiles. The JSON files remain the source of truth used by the prompt builders and the generated TypeScript registry.

## Profile Index

| Profile | Slug | Archetype | Primary Strength | Load Order |
| --- | --- | --- | --- | --- |
| [The Art Teacher](./reference/art-teacher.md) | `art-teacher` | Eccentric Creative Catalyst | Seeing what something could become before the person holding it can | room-bound |
| [Billy](./reference/billy.md) | `billy` | The Keeper of Threads | memory synthesis and continuity holding | 1 |
| [The Cascade Engineer](./reference/cascade-engineer.md) | `cascade-engineer` | Black Mirror Oracle / Downstream Risk Analyst | Second and third-order consequence mapping | ethics-review |
| [The Consulting Advisor](./reference/consulting-advisor.md) | `consulting-advisor` | advisor | workflow-architecture | standard |
| [The Curator](./reference/curator.md) | `curator` | Museum Curator / Artifact Memory Keeper | Artifact provenance — knowing where things came from and what they meant when they arrived | room-bound |
| [Founder Studio Sample](./reference/founder-studio-sample.md) | `founder-studio-sample` | founder-lab-sample | authoring workflow clarity | standard |
| [GATE Keeper](./reference/gate-keeper.md) | `gate-keeper` | gatekeeper | package-boundary enforcement — what can be shipped cleanly versus what needs review | gate-default |
| [The Embodiment Expert](./reference/groq-embodiment-expert.md) | `groq-embodiment-expert` | the-archivist | embodiment fidelity stewardship - tracks whether profile source, generated artifacts, room behavior, and runtime expectations still agree | standard |
| [The Analyst](./reference/pattern-analyst.md) | `pattern-analyst` | Quiet Pattern Analyst / Cross-Session Observer | Cross-session pattern recognition across time and context | room-bound |
| [The Philosophy Scribe](./reference/philosophy-scribe.md) | `philosophy-scribe` | scribe | philosophy-maintenance | standard |
| [The Repo Scribe](./reference/repo-scribe.md) | `repo-scribe` | scribe | context-doc-stewardship | standard |
| [The Legend](./reference/rock-legend.md) | `rock-legend` | Retired Rock Legend / Sonic Archaeologist | Musical archaeology — reading a person's taste as autobiography | room-bound |
| [The Keeper](./reference/sanctuary-keeper.md) | `sanctuary-keeper` | Gentle Holder / Sanctuary Keeper | Holding space without filling it | room-bound |
| [The Algorithm](./reference/the-algorithm.md) | `the-algorithm` | algorithm | platform mechanics — what each algorithm actually rewards at this moment | standard |
| [The Architect](./reference/the-architect.md) | `the-architect` | architect | strategic sequencing — the order of moves matters as much as the moves | standard |
| [The Guardian](./reference/the-guardian.md) | `the-guardian` | guardian | downstream impact analysis — who is affected that hasn't been considered | always-active |
| [The Recursive Builder](./reference/the-recursive-builder.md) | `the-recursive-builder` | recursive-auditor | recursive system auditing — ability to traverse a multi-layer stack and hold the full picture while interrogating each node | standard |
| [The Spectacle](./reference/the-spectacle.md) | `the-spectacle` | spectacle | emotional architecture — how a message feels before it's understood | standard |
| [The Symbiote](./reference/the-symbiote.md) | `the-symbiote` | symbiote | context synthesis — holding the full picture (repo, schema, product surfaces, skills, memories, invariants, history) while isolating the next bounded move | standard |
| [The Tailor](./reference/the-tailor.md) | `the-tailor` | tailor | surface-intent mismatch detection — where the product looks like something it isn't | standard |
| [The Translation Bridge](./reference/the-translation-bridge.md) | `the-translation-bridge` | translator | gap identification — the specific delta between insider knowledge and outsider experience | standard |
| [The Treasurer](./reference/the-treasurer.md) | `the-treasurer` | treasurer | runway modeling — how long can the current situation sustain | standard |
| [The Weaver](./reference/the-weaver.md) | `the-weaver` | weaver | systems topology — seeing the whole architecture at once | first-in-trainer |
| [The Weird Digger](./reference/the-weird-digger.md) | `the-weird-digger` | explorer | cross-domain connection — finding the thread between two things that seem unrelated | standard |
| [Vibe Check](./reference/vibe-check.md) | `vibe-check` | resonance-detector | resonance detection — sensing when something's off before knowing why | standard |

## Recommended Combinations

- Meaning + Structure: `Billy` + `The Weaver` ground a system in platform intent and structural integrity.
- Growth Stack: `The Algorithm` + `The Spectacle` + `The Tailor` combine distribution mechanics, emotional hook, and surface coherence.
- Ethical Review: Bring in `The Guardian` when decisions affect vulnerable users or have meaningful downstream risk.
- Pre-Launch Check: Let `Vibe Check` do the final pass when the question is whether something feels right, not just whether it is correct.

## Related Artifacts

- Runtime source: `embodiment_profiles/*.embodiment.json`
- Generated TypeScript registry: `shared/embodiment/generated.ts`
- Prompt helpers: `shared/embodiment/index.ts`
