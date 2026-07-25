# Collaborator init + verification shell script

Usage:

```bash
bash scripts/init-collaborator-system.sh /path/to/gestaltview-v2.0
```

Optional report path override:

```bash
bash scripts/init-collaborator-system.sh /path/to/gestaltview-v2.0 /path/to/report.md
```

What it does:
- verifies required collaborator files exist
- checks route/service wiring signatures
- checks `supabase/schema.sql` for collaborator tables and `agents.collaborator_id`
- checks Gemini onboarding package presence and key fields
- writes a markdown verification report

What it does not do:
- it does not mutate the repo
- it does not run migrations against Supabase
- it does not issue live API requests

# Continuity stack check

Usage:

```bash
npm run continuity:check
```

What it does:
- verifies the continuity stack docs exist
- checks the router, handoff packet, workflow docs, and packet templates for the current canonical references
- confirms the collaboration packet points at the continuity stack and embodiment sync scripts

What it does not do:
- it does not build the repo
- it does not validate runtime behavior
- it does not modify any files

# Collaborator package build

Usage:

```bash
npm run package:collaborator
```

What it does:
- builds the current collaborator handoff zip
- writes it into `artifacts/`
- refreshes `artifacts/latest.zip` so the newest bundle has a stable path

What it does not do:
- it does not touch runtime code
- it does not apply migrations
- it does not validate the packaged repo beyond assembling the archive

# Embodiment profile sync

Usage:

```bash
npm run sync-profiles
```

What it does:
- reads every `*.embodiment.json` file in `embodiment_profiles/`
- validates the core shape with warnings instead of hard failure
- derives the slug from the filename when needed
- upserts each profile into `embodiment_profiles`
- seeds `embodiment_training_runs` and `embodiment_readiness_scores` from the same profile snapshot when the record is new or materially changed

For already-deployed databases, apply `supabase/migrations/20260518000000_backfill_embodiment_profile_history.sql` once to populate the related history tables from the existing `embodiment_profiles` rows.

If you also want baseline governance history, apply `supabase/migrations/20260518001000_backfill_embodiment_profile_governance.sql` once to seed `embodiment_mutation_proposals` and `embodiment_review_log` from the same profile set.

Environment:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY`
