<!-- PAGE_ID: gestaltview_v2_10_operations-manifest-skills -->
<details>
<summary>📚 Relevant source files</summary>

The following files were used as context for generating this wiki page:

- [scripts/gv.sh:3-14](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L3-L14)
- [scripts/gv.sh:72-93](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L72-L93)
- [scripts/gv.sh:100-143](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L100-L143)
- [scripts/gv.sh:199-276](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L199-L276)
- [scripts/gv-health-check.sh:6-10](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv-health-check.sh#L6-L10)
- [scripts/gv-health-check.sh:30-177](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv-health-check.sh#L30-L177)
- [scripts/generate_repo_manifest.py:3-25](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L3-L25)
- [scripts/generate_repo_manifest.py:39-87](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L39-L87)
- [scripts/generate_repo_manifest.py:185-260](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L185-L260)

</details>

# Operations, Manifest, And Skills

> **Related Pages**: [[Development Environment|02_development-environment.md]], [[Agent Trainer|08_agent-trainer.md]], [[Deployment And Infrastructure|11_deployment-infrastructure.md]]

---

<!-- BEGIN:AUTOGEN gestaltview_v2_10_operations-manifest-skills_cli -->
## Repo CLI And Context Refresh

`scripts/gv.sh` positions itself as the repo-aware Billy CLI, not just a shell helper. It loads env from both repo root and `client/`, defines provider defaults and time budgets, verifies core dependencies, and maintains several local artifacts including a checkpoint file, bucket file, rendered Billy personality file, repo context file, forensic log, and skill index.

Its context-refresh path builds a repo briefing by collecting canonical orientation files, a skill inventory, a file-tree snapshot, recent commits, and the active scripts list. That makes operator context generation a first-class repository concern rather than a manual ritual.

Sources: [scripts/gv.sh:3-14](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L3-L14), [scripts/gv.sh:72-93](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L72-L93), [scripts/gv.sh:199-276](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv.sh#L199-L276)
<!-- END:AUTOGEN gestaltview_v2_10_operations-manifest-skills_cli -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_10_operations-manifest-skills_health -->
## Health Checks And Readiness Gates

`scripts/gv-health-check.sh` encodes a simple but useful operational contract: exit code `0` for fully ready, `1` for degraded-but-usable, and `2` for critical problems. It checks core tools, AI provider keys, Supabase env, Ollama availability, project structure, and git status, then emits a single final verdict.

That script is valuable because the runtime depends on many optional external services. A quick degraded verdict is often the right answer; it tells the operator Billy may still run, but with offline fallback, missing retrieval, or missing local-model capability.

Sources: [scripts/gv-health-check.sh:6-10](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv-health-check.sh#L6-L10), [scripts/gv-health-check.sh:30-177](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/gv-health-check.sh#L30-L177)
<!-- END:AUTOGEN gestaltview_v2_10_operations-manifest-skills_health -->

---

<!-- BEGIN:AUTOGEN gestaltview_v2_10_operations-manifest-skills_manifest -->
## Manifest Generation And Inventory

The repo manifest generator writes both JSON and Markdown manifests to `docs/`, scanning selected directories for file metadata, checksums, categories, route inventory, API endpoints, docs, test scripts, dependency snapshots, and git state. Category inference is rule-based, so the manifest doubles as a structured cross-section of the codebase rather than a flat file listing.

This script is the automation behind the README maintenance rule about regenerating manifest outputs when the route, API, script, or documentation inventory changes materially.

Sources: [scripts/generate_repo_manifest.py:3-25](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L3-L25), [scripts/generate_repo_manifest.py:39-87](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L39-L87), [scripts/generate_repo_manifest.py:185-260](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/scripts/generate_repo_manifest.py#L185-L260), [README.md:148-154](https://github.com/faagestalt-web/gestaltview-v2/blob/46a35cdd664bd3549ef8d41b793a1d21a51657d9/README.md#L148-L154)
<!-- END:AUTOGEN gestaltview_v2_10_operations-manifest-skills_manifest -->

---
