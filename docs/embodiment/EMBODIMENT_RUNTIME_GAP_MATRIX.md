# Embodiment Runtime Gap Matrix

| Area | Current state | Gap or risk | Impact | Slice |
| --- | --- | --- | --- | --- |
| Source registry | 16 embodiment JSON profiles exist in `embodiment_profiles/`. | No enforced validation layer yet. | Registry drift can land silently. | Slice 2 |
| Generated registry | `shared/embodiment/generated.ts` is produced by the existing generator. | The generated artifact can drift from source profiles. | Runtime imports may miss newer profiles. | Slice 2 |
| Profile identity | Slugs are intended to match filenames. | No hard fail currently if a profile slug and filename diverge. | Registry semantics become ambiguous. | Slice 2 |
| Duplicate control | Profile list is manually curated. | Duplicate slugs could be introduced without notice. | The generated registry would silently collapse entries. | Slice 2 |
| Required fields | Profiles are structurally rich and nested. | Missing required fields are currently a manual-review problem. | Runtime and docs can become inconsistent. | Slice 2 |
| Room-aware intelligence | The next spec slice wants room-aware digital intelligence integration. | No runtime wiring exists yet in this pass. | No user-facing embodiment/runtime behavior changes yet. | Future slices |
| Shared types | `shared/embodiment/types.ts` remains untouched. | No stricter contract layer has been introduced. | Validation must rely on current shape assumptions. | Future slices |
| Shared index | `shared/embodiment/index.ts` remains untouched. | No new runtime exports or guards yet. | Consumers still depend on the current registry contract. | Future slices |
| Runtime consumers | Existing runtime code is unchanged. | No component, route, or service layer has been updated to use the new validation posture. | Spec progress stops at registry hardening for now. | Future slices |
| CI / build gates | Build exists, but registry validation is new. | Validation is not yet part of the default build pipeline. | Drift can reappear unless called explicitly. | Slice 2 |

## Notes

- Slice 1 is documentation only.
- Slice 2 adds validation and script entrypoints only.
- Runtime behavior should stay frozen until the next spec slice.
