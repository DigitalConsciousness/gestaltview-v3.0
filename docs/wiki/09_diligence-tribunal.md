<!-- PAGE_ID: gestaltview_v2_09_diligence-tribunal -->
<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [api/diligence.ts:79-163](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/diligence.ts#L79-L163)
- [api/diligence.ts:197-279](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/diligence.ts#L197-L279)
- [client/src/components/DiligenceExplorer/index.tsx:18-110](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/DiligenceExplorer/index.tsx#L18-L110)
- [client/src/components/DiligenceExplorer/useDiligenceData.ts:10-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/DiligenceExplorer/useDiligenceData.ts#L10-L29)
- [shared/tribunal/types.ts:4-52](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/tribunal/types.ts#L4-L52)
- [README.md:60-76](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L60-L76)

</details>

# Diligence And Tribunal

> **Related Pages**: [[Frontend, Auth, And Routing|03_frontend-auth-routing.md]], [[Billy Runtime|04_billy-runtime.md]], [[Current State And Glossary|12_current-state-and-glossary.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_09_diligence-tribunal_data -->
## Diligence Data Loading

The diligence endpoint builds a normalized API payload out of CSV and JSON exports from a `DiligenceReports` or `Diligence_Reports` directory. It includes its own CSV parser, a five-minute cache, filename fallback logic, and typed normalization for claims, chronology, skepticism items, evidence index rows, architecture rows, and bundle summaries.

This means `/api/diligence` is effectively an adapter between offline diligence artifacts and the live frontend. The endpoint is designed to be resilient to small naming changes in exported files rather than assuming a single perfect bundle layout.

Sources: [api/diligence.ts:79-163](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/diligence.ts#L79-L163), [api/diligence.ts:197-279](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/api/diligence.ts#L197-L279)
<!-- END:AUTOGEN gestaltview_v2_09_diligence-tribunal_data -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_09_diligence-tribunal_ui -->
## Explorer UI Surface

The diligence UI loads its entire dataset from `/api/diligence` and presents it through four tabs: claim wall, 2D evidence timeline, 3D loom, and audit record. It also computes quick headline stats such as total indexed files, OTS receipts, claim count, objections, and last update time from the loaded payload.

This surface sits alongside the rest of the public runtime instead of in a separate backoffice app. The README reflects that by listing diligence endpoints directly in the primary API families for the repo.

Sources: [client/src/components/DiligenceExplorer/useDiligenceData.ts:10-29](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/DiligenceExplorer/useDiligenceData.ts#L10-L29), [client/src/components/DiligenceExplorer/index.tsx:18-110](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/client/src/components/DiligenceExplorer/index.tsx#L18-L110), [README.md:64-76](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L64-L76)
<!-- END:AUTOGEN gestaltview_v2_09_diligence-tribunal_ui -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_09_diligence-tribunal_tribunal -->
## Tribunal Scoring Model

The tribunal layer is represented in shared types rather than a visible end-user flow in the files inspected for this pass. It defines candidate answers, optional context fragments, a verdict object with evidence counts and timestamps, and per-answer scoring dimensions for evidence alignment, PLK resonance, safety, and overall score.

That type shape places tribunal as an adjudication layer that can compare model outputs against evidence and voice fidelity, which fits the repo’s broader emphasis on grounded synthesis over raw single-model output.

Sources: [shared/tribunal/types.ts:4-52](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/shared/tribunal/types.ts#L4-L52)
<!-- END:AUTOGEN gestaltview_v2_09_diligence-tribunal_tribunal -->

---
