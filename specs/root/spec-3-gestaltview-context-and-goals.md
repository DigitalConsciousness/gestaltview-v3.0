# GestaltView Context and Goals  
GestaltView spans two linked codebases: the **live runtime** (`gestaltview-v2.0`) and a **knowledge/corpus repository**. The corpus repo is a structured “knowledge substrate” containing canonical docs, transcripts, schema, and evidence (see CONTEXT.md)【28†L2-L10】【28†L22-L28】.  In practice, this means our expert agent must navigate both layers: understanding the **runtime code/API surface** (590+ files, dozens of routes/APIs) and the **corpus of documentation and transcripts** that explain the system.  The agent’s mission is to *internalize GestaltView’s why/what/how/where/when* by systematically reading code, schemas, prompts, and orientation docs.  In effect, the agent must learn the entire project context and then identify gaps and tasks needed to improve or refactor it.

# Agent Design (“GestaltView Expert”)  
Following GestaltView conventions, we’ll define a new agent in the `agents/` directory with YAML-frontmatter.  For example, name it **`gestaltview-expert`** with fields like `display_name`, `description`, and `default_prompt` in a flat Markdown spec (much like the existing `agents/skills-keeper.md`)【14†L36-L44】.  The spec lists its **responsibilities**, e.g.: 
- Load all relevant context layers (orientation docs, codebase, manifests) each time it starts. 
- Ask clarifying questions or propose sub-tasks if needed before action. 
- Produce outputs with evidence citations and a clear “Next steps” list.  
For instance, the *Skills Keeper* agent spec enumerates a core task list and output format【14†L36-L44】.  We would similarly enumerate that **GestaltView Expert** holds the “whole language” of the system, preserves nuance, and ensures changes remain true to current code and docs.  Once written (e.g. `agents/gestaltview-expert.md`), we register it in `agents/openai.yaml` (the agents registry) and update `agents/INDEX.md` as per the guidelines【6†L49-L53】.  

# Recursive Learning Directory Structure  
To enable *recursive learning*, we propose a dedicated workspace tree, for example:

- **`openAI.yaml`** (or similarly named config): A YAML file listing AI providers and default models.  It might map each provider to its required env var and model name.  For example:
  ```yaml
  providers:
    gemini:
      key_env: GEMINI_API_KEY
      model: gemini-2.0-flash
    openai:
      key_env: OPENAI_API_KEY
      model: gpt-4
    groq:
      key_env: GROQ_API_KEY
      model: groq-7b-chat
  ```
  This mirrors how the LLM router code expects keys and models.  In `llm_Router.py`, the Gemini adapter checks `GOOGLE_API_KEY`/`GEMINI_API_KEY` (any non-empty indicates Gemini is available)【9†L147-L155】.  Likewise, the API proxy reads `GROQ_API_KEY` or `OPENAI_API_KEY` from the environment for Groq/OpenAI calls【17†L87-L95】.  Our YAML makes these associations explicit and can drive the workflow configuration below.

- **`.github/workflows/llm_selection.yml`**: A GitHub Actions workflow to validate provider setup or run example queries.  It could use a *matrix* strategy with entries like `provider: [gemini, openai, groq]` and `model` accordingly.  Each job would set the corresponding secrets (e.g. `${{ secrets.GEMINI_API_KEY }}`) and attempt a simple API call or health check.  This approach is analogous to the existing ingestion workflow: secrets like `SUPABASE_URL`, `HF_TOKEN` etc. are injected via `env:` in Actions (see `ingest_corpus.yml` requiring `HF_TOKEN`, etc.)【42†L13-L17】.  In our LLM workflow, the key environment vars come from Vercel or repo secrets (the Vercel checklist confirms these: GEMINI/GOOGLE, GROQ, OPENAI, HF_TOKEN, etc. are required)【40†L19-L24】.  For example, one job might do:
  ```yaml
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
  ```
  and then run a sanity command (`npm test` or a curl against `/api/billy` with each provider), verifying no errors.  Using a matrix lets us quickly switch providers/models and ensures the orchestrator picks up the right chain (remember Gemini is first, then OpenAI, etc.【9†L147-L155】【17†L87-L95】).  

- **`assets/` directory**: A place to drop intermediate artifacts, partial code refactors, component prototypes, or downloaded content that the agent discovers.  For instance, if the agent identifies outdated UI code or design sketches, it could store revised files here.  Likewise, any large documents or data (screenshots, transcripts) needed for deep dives can live in `assets/` to keep them versioned.  As the agent “recursively learns” and refactors, it logs TODO notes or tasks, possibly in files under `assets/` or `docs/TODO.md`.  (Ingest workflows similarly snapshot paths to artifact lists【23†L70-L79】; we’d keep track of changes in a TODO list of missing or outdated pieces.)

- **`agents/` and `skills/` directories**: These house the agent and skill specs.  In addition to the new expert agent, we ensure existing skills (like `gestaltview-agents-context`, `gestaltview-repo-map`, etc.) are up-to-date.  For example, the *gestaltview-agents-context* skill (from the knowledge repo) explicitly says it “Load[s] and apply the current operating context for work inside `gestaltview-v2`”【48†L61-L64】.  We would leverage this: when our expert agent initializes, it could invoke that skill to orient itself by reading the repo’s root docs and current state.  We might even refine or extend these skills.  Similarly, an “ecosystem-orchestrator” skill exists to route multi-repo tasks【48†L81-L83】 and could guide the expert agent on where to look next.  All agent/skill specs should be recorded in `docs/CurrentState.md` when updated, per the *Skills Keeper* instructions【6†L49-L53】.

# Environment and Models Setup  
GestaltView’s code uses multiple LLM/back-end providers in a fallback chain.  Key environment variables must be set (in Vercel or CI secrets) for each.  The official checklist documents the needed keys: e.g. `GOOGLE_API_KEY`/`GEMINI_API_KEY` for Gemini, `GROQ_API_KEY` for Groq, `HUGGINGFACE_API_KEY` or `HF_TOKEN` for Hugging Face, and `OPENAI_API_KEY` for OpenAI【40†L19-L24】.  In code, the Gemini adapter looks for `GOOGLE_API_KEY` or `GEMINI_API_KEY` and uses the **gemini-2.0-flash** model by default【9†L147-L155】.  Similarly, the proxy for OpenAI-compatible calls expects `GROQ_API_KEY` for Groq or `OPENAI_API_KEY` for OpenAI【17†L87-L95】.  Our `openAI.yaml` and workflow should reflect these: for instance, mapping “gemini”→“gemini-2.0-flash”, “openai”→“gpt-4”, “groq”→an LLM of choice (e.g. `groq-7b-chat`).  The CI job can use these mappings to test each combination.

# Recursive Learning and To-Do Process  
We envision a *recursive builder chain* where the agent repeatedly scans the repo, identifies missing pieces, and then implements or records them.  For example, it might generate or update a **manifest** (using the existing `generate_repo_manifest.py`) and compare against code to find undocumented endpoints.  If it finds issues, it appends tasks to a TODO file or GitHub Issues.  Each run, it would process tasks in order: update a doc, refactor a component, improve a prompt, etc.  At every step it cites evidence: e.g., quoting the code or manifest lines that need changes (as mandated by the Evidence Citation policy in the skills suite【45†L78-L83】).  After applying edits, it runs builds or tests (like “npm run build”) to validate changes (similar to how the ingest workflow does a build check【23†L106-L112】).  All changes are kept granular and visible; the *Skills Keeper* agent emphasizes concrete diffs and updating `docs/CurrentState.md` with rationale【14†L36-L44】.

# Supporting Skills and Assets  
The existing **skills catalog** will enrich the expert agent.  For orientation, the `gestaltview-repo-map` skill directs it to “map the actual `gestaltview-v2` repository before making changes” for fast orientation【48†L91-L93】.  The `gestaltview-corpus-ingestion` skill ensures the agent understands the RAG pipeline (embeddingGemma, chunk sizes) for knowledge retrieval【48†L73-L76】.  We’ll also provide an `assets/README.md` explaining how to use the directory (e.g. “drop refactored code or retrieved docs here”).  Importantly, we track **TODOs** explicitly. The agent should produce immediate next actions (max 3 each run) and backlog items, as per its spec, with each action tied to a specific file or code snippet. In summary, the directory will look something like:

```
project-root/
├─ openAI.yaml            # config of providers → env vars & models
├─ .github/workflows/
│    └─ llm_selection.yml  # tests providers matrix with secrets
├─ assets/                # artifacts, code scraps, TODO logs
├─ agents/
│    └─ gestaltview-expert.md  # new agent spec (YAML frontmatter, prompt)
├─ skills/                # skill SKILL.md files (gestaltview-agents-context.md, etc.)
└─ docs/CurrentState.md   # ongoing record of changes (updated by agents)
```

Each element is grounded in our existing architecture.  For example, the `.github/workflows` matrix pattern is similar to the `ingest_corpus.yml` workflow【42†L13-L17】.  The `openAI.yaml` config draws on how the LLM router reads environment keys【9†L147-L155】【17†L87-L95】.  And the agent/skill files follow the established spec conventions (flat `.md` with frontmatter, indexed in `agents/INDEX.md`)【6†L49-L53】【14†L36-L44】. By mirroring GestaltView’s own patterns (evidence-based docs, manifest-driven updates, multi-agent orchestration), this setup will let the **GestaltView Expert** agent build up a full picture of the system and bridge any gaps in implementation or documentation.  

**Sources:** GestaltView architecture and repository guidance【28†L2-L10】【28†L22-L28】; agent/skill specification examples【6†L49-L53】【14†L36-L44】; environment variables and provider chain from code and docs【9†L147-L155】【17†L87-L95】【40†L19-L24】; ingestion and workflow patterns【37†L1-L4】【42†L13-L17】.
