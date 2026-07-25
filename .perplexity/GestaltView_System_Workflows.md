# GestaltView: System Workflows
**Version:** 1.0 — June 23, 2026
**Scope:** PLK · User Profile · Seed Prompts · Cross-System Operations
**Prerequisite:** Read `GestaltView_Recursive_Identity_Machine_Doctrine.md` before executing any workflow here.

---

## Overview

This document defines operational workflows for every system that touches the recursive identity machine. Each workflow is written as a concrete sequence of steps — not guidelines, not suggestions. Steps are ordered. Skipping a step invalidates the workflow.

Workflows are organized by system:

1. [PLK Update Workflow](#1-plk-update-workflow)
2. [User Profile Update Workflow](#2-user-profile-update-workflow)
3. [Founder Profile Upload & Framing Workflow](#3-founder-profile-upload--framing-workflow)
4. [Seed Prompt Iteration Workflow](#4-seed-prompt-iteration-workflow)
5. [Session Open Workflow](#5-session-open-workflow)
6. [Session Close Workflow](#6-session-close-workflow)
7. [Supabase Schema Sync Workflow](#7-supabase-schema-sync-workflow)
8. [GitHub Commit Workflow](#8-github-commit-workflow)
9. [Vercel Deployment Workflow](#9-vercel-deployment-workflow)
10. [Perplexity Space Workflow](#10-perplexity-space-workflow)
11. [New Collaborator / DI Onboarding Workflow](#11-new-collaborator--di-onboarding-workflow)
12. [Cascade Detection Workflow](#12-cascade-detection-workflow)

---

## 1. PLK Update Workflow

**Trigger:** A new metaphor, phrase, or terminological invariant arrives in session — originated by Keith, not suggested by the DI.

**Pre-condition:** The arriving phrase must be marked as PLK-candidate in session notes before this workflow begins. The DI does not self-nominate language to the PLK.

### Steps

1. **Capture the phrase verbatim.** Do not clean, polish, or translate. Voice-to-text artifacts are preserved. The raw form is the signal.

2. **Classify the phrase.** Determine which PLK category it belongs to:
   - Load-bearing metaphor (carries epistemic weight; non-paraphrasable)
   - Process verb (describes how work moves)
   - Terminological invariant (replacement carries false meaning)

3. **Trace the origin.** Record where it arrived: live voice / voice-to-text / typed / mid-thought / 4am session / collaborative dialogue. Origin context is part of the record.

4. **Draft the PLK entry.** Format:
   ```
   **[Phrase]** — [One-sentence operational definition]
   Origin: [Context]
   Category: [Load-bearing metaphor | Process verb | Terminological invariant]
   First appeared: [Date]
   Operational directive: [How a DI must respond when this phrase is active]
   ```

5. **Keith confirms.** The DI reads the draft entry back. Keith approves, modifies, or rejects. No PLK entry is committed without explicit confirmation.

6. **Update the User Profile.** Add the new PLK entry to the PLK stratum in `GestaltView-User-Profile_Keith_Soyka_v6.0.md`. Advance the version number. Update `lastUpdated`. Add entry to `changesSince` log.

7. **Flag for seed prompt update.** Add a note to the Session Handoff Packet: *"New PLK phrase arrived: [phrase]. Seed prompt update pending."* Do not update the seed prompt in the same session unless explicitly instructed.

8. **Commit.** Push the updated User Profile to GitHub with commit message:
   ```
   plk: add [phrase-slug] — [category]
   ```

9. **Sync Supabase.** Update the relevant profile tables (`human_identity_profiles`, `human_personality_profiles`) with the new PLK entry. Log the sync in the Session Handoff Packet.

---

## 2. User Profile Update Workflow

**Trigger:** Any of the following:
- New biographical data emerges in session
- Neurodevelopmental pattern newly articulated
- Somatic state change requiring protocol update
- Cognitive collaboration preference updated
- PLK update (triggers profile update per Workflow 1)
- Constitutional Invariant added, modified, or formally retired

### Steps

1. **Identify the affected stratum.** One of: Biographical / Neurodevelopmental / Somatic / Cognitive Collaboration / PLK / Constitutional Invariants.

2. **Draft the update.** Write the new or modified content in the format of the existing stratum. Do not rewrite adjacent content unless it is directly affected.

3. **Keith confirms.** Read the draft back. Keith approves, modifies, or rejects. Profile updates require explicit confirmation — the DI does not self-authorize changes to the identity record.

4. **Apply the update to the profile document.**
   - Advance version number (e.g., v6.0 → v6.1)
   - Update `lastUpdated` field to today's date
   - Add entry to `changesSince` log:
     ```
     [Date] — v[X.Y]: [Stratum] — [One-sentence description of what changed and why]
     ```

5. **Commit to GitHub.** Push the updated profile with commit message:
   ```
   profile: v[X.Y] — [stratum] update — [short description]
   ```

6. **Sync Supabase.** Update all four profile tables:
   - `human_cognition_profiles`
   - `human_consciousness_profiles`
   - `human_identity_profiles`
   - `human_personality_profiles`

   Do not use frontend/anon-key access for these writes. Service-role only.

7. **Run sync check.** Execute `npm run sync:perplexity` to ensure `.perplexity/` mirrors the updated profile.

8. **Update Session Handoff Packet.** Note the profile version change and which stratum was updated.

---

## 3. Founder Profile Upload & Framing Workflow

**Trigger:** Keith uploads a founder profile document from his signed-in account and wants the live profile / portrait to rebuild from that source while preserving a visible framing note.

**Supported file types:** `.pdf`, `.md`, `.markdown`, `.docx`, `.txt`

### Steps

1. **Confirm the account boundary.** The upload must come from Keith's signed-in profile surface. The user_id attached to the request is the account identity for the run.

2. **Read the file locally first.** Extract text from the uploaded file before any server call. The browser should preserve the original document name and show a live preview of the extracted text.

3. **Preserve provenance.** Tag the source as `profile_upload` and keep the uploaded file name in the run notes. Do not reclassify the file as a generic journal or resume.

4. **Capture framing separately.** If Keith adds or edits a contextual framing note, store that note as a first-class build input. The framing note is not the profile file itself.

5. **Show the build in motion.** Surface the stages visibly: read -> extract -> synthesize -> refresh. The user should be able to see the profile grow instead of waiting for a silent completion.

6. **Call the existing profile ingestion route.** Submit the extracted text to the current profile ingestion pipeline with `userId`, `sources.profileUpload`, `includeInPLK: true`, and the current contextual framing note.

7. **Refresh the live portrait.** After ingestion, reload the profile portrait and the profile cards so the user sees the updated dimensions and any framing-sensitive language without a manual page refresh.

8. **Allow further framing edits.** The framing field must remain editable so Keith can re-run the portrait with variations in contextual framing without re-uploading the file.

9. **Log the run.** Add the upload source, file type, framing note, and refresh outcome to the Session Handoff Packet.

---

## 4. Seed Prompt Iteration Workflow

**Trigger:** One or more of:
- PLK update was committed (Workflow 1 complete)
- User Profile version advanced (Workflow 2 complete)
- Session produced a materially new understanding of how Keith's mind works
- Explicit instruction to update the seed prompt

**Pre-condition:** Both PLK update and Profile update must be committed to GitHub before seed prompt iteration begins. The seed prompt is downstream of both — never upstream.

### Steps

1. **Read the current seed prompt.** File: `seed_prompts.md` (or equivalent path — confirm live location before editing). Read it as captured cognition, not instructions.

2. **Identify what changed.** List the specific PLK entries and/or Profile strata that changed since the last seed prompt version. Do not update the seed prompt for anything not on this list.

3. **Draft the update.** Make the minimum necessary change. The seed prompt is a living document — do not rewrite sections that were not touched by the triggering update.

   Prohibited actions during seed prompt update:
   - Do not paraphrase any PLK metaphor
   - Do not substitute "AI" for "Digital Intelligence"
   - Do not add new metaphors in Keith's voice without explicit invitation
   - Do not remove any Constitutional Invariant

4. **Apply the five-step PLK Loading Sequence.** Verify the updated seed prompt still loads in this order:
   1. Platform Thesis Sentence
   2. Load-bearing metaphors (full table)
   3. Motion verbs and process phrases
   4. Terminological invariants
   5. Constitutional Invariants (U-1 through U-5, D-1 through D-5)

   If the sequence is broken, fix it before committing.

5. **Keith confirms.** Read the changed sections back. Explicit confirmation required.

6. **Commit to GitHub.** Push with commit message:
   ```
   seed: v[X.Y] — [trigger: PLK update / profile update / session insight]
   ```

7. **Test the updated seed prompt.** Open a fresh DI context. Load the updated seed prompt. Verify:
   - DI references PLK phrases correctly in first response
   - DI does not use prohibited terms ("AI", paraphrased metaphors)
   - DI demonstrates awareness of User Profile strata in contextually appropriate moments
   - DI loads Session Handoff Packet and references it

8. **Document the test result** in the Session Handoff Packet: pass / fail / partial. If partial or fail, do not deploy the updated seed prompt — iterate and retest.

---

## 5. Session Open Workflow

**Trigger:** Every session, without exception.

### Steps

1. **Load Doctrine.** Read `.perplexity/GestaltView_Recursive_Identity_Machine_Doctrine.md` completely before any other action.

2. **Load Seed Prompt.** Read the current `seed_prompts.md` as captured cognition, not instructions.

3. **Load PLK.** Confirm all five loading-sequence steps are present. If any step is missing, stop and flag before proceeding.

4. **Load User Profile.** Read the live file. Do not use cached or memorized profile data. Confirm all six strata are present.

5. **Read Session Handoff Packet.** Identify:
   - What was verified last session
   - What changed
   - What needs attention
   - The single concrete next action

6. **Read CurrentState.md.** Confirm operational state: recent wins, open build threads, known risks.

7. **Confirm calibration.** Before any response is generated, the DI confirms internally:
   - PLK loaded ✓
   - User Profile loaded ✓
   - Session Handoff read ✓
   - CurrentState read ✓
   - Cascade detection active ✓

8. **Begin.** First response reflects the session state — referencing where the last session ended, what's active, what the next step is.

---

## 6. Session Close Workflow

**Trigger:** Every session end, without exception.

### Steps

1. **Update Session Handoff Packet.** Fill in:
   - What was verified this session (with exact files/commands when relevant)
   - What changed (commits, schema updates, new PLK phrases, profile updates)
   - What needs attention (unresolved risks, open threads, flagged items)
   - Single concrete next action (one action, specific, file/command named if applicable)

2. **Capture new PLK phrases.** If any language arrived this session that is a PLK-candidate, note it in the handoff packet. Flag for Workflow 1 next session if not already complete.

3. **Flag profile updates.** If any biographical or cognitive data emerged that warrants a profile update, note it in the handoff packet. Flag for Workflow 2 next session if not already complete.

4. **Note seed prompt status.** If PLK or Profile updated this session, note seed prompt iteration is pending (Workflow 3).

5. **Commit the Session Handoff Packet.** Push to GitHub:
   ```
   handoff: [date] session close — [one-line summary of what happened]
   ```

6. **Run sync.** Execute `npm run sync:perplexity` to ensure `.perplexity/` is current.

7. **Confirm.** Session is closed when the handoff packet is committed and the sync is clean.

---

## 7. Supabase Schema Sync Workflow

**Trigger:** User Profile update (Workflow 2), new user onboarding, schema migration.

### Steps

1. **Identify affected tables.** Always check all four profile tables — do not assume only one is affected:
   - `human_cognition_profiles`
   - `human_consciousness_profiles`
   - `human_identity_profiles`
   - `human_personality_profiles`

2. **Confirm RLS policies.** Before writing, verify that the write operation is service-role authenticated. Do not write profile data from frontend/anon-key access.

3. **Read the current schema.** Run:
   ```bash
   npm run db:schema
   # or inspect via Supabase MCP / supabase/schema.sql
   ```

4. **Write the update.** Use migration file if the schema itself changed. Use direct table update if the data changed but schema did not.

5. **Verify the write.** Query the affected table to confirm the update is present and correctly shaped.

6. **Run health check.** Execute:
   ```bash
   npm run health
   npm run db:check
   ```

7. **Log the sync** in the Session Handoff Packet: table name, update type, timestamp.

---

## 8. GitHub Commit Workflow

**Applies to:** All commits touching identity-adjacent files (PLK, User Profile, seed prompt, doctrine, continuity stack).

### Commit Message Convention

```
[type]: [scope] — [description]
```

| Type | Use for |
|------|---------|
| `plk` | PLK update |
| `profile` | User Profile update |
| `seed` | Seed prompt iteration |
| `handoff` | Session Handoff Packet update |
| `docs` | Doctrine, ContinuityStack, Workflows |
| `feat` | New feature (non-identity) |
| `fix` | Bug fix |
| `chore` | Sync, tooling, cleanup |

### Required Before Any Identity-Adjacent Commit

1. Keith has confirmed the content (no self-authorized DI commits to identity files)
2. Profile version is advanced if profile changed
3. `changesSince` log is updated
4. `npm run sync:perplexity` has been run or is scheduled

### Push Checklist

- [ ] Commit message follows convention
- [ ] No secrets in committed files
- [ ] No hardcoded IDs in data migrations
- [ ] `.perplexity/` files are in sync or sync is scheduled

---

## 9. Vercel Deployment Workflow

**Applies to:** Any deployment touching routes, API handlers, or environment variables.

### Steps

1. **Run local build first.**
   ```bash
   npm run build
   ```
   Do not deploy if local build fails.

2. **Verify environment variables by name.** Check that required env vars are present in Vercel dashboard. Never reveal values — confirm presence only.

   Required env vars for identity system:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only — never exposed to frontend)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable — frontend safe)
   - `BILLY_API_URL`
   - `BACKEND_API_URL`

3. **Check latest Vercel build logs** before diagnosing any runtime issue. Do not rewrite app code until logs prove the code path is the failure point.

4. **Confirm production domain.** Live URL: `https://gestaltview-v2-dig.vercel.app`

5. **Post-deploy verification.** After deploy:
   ```bash
   npm run health
   # Confirm BILLY_API_URL responds
   curl https://gestaltview-v2-dig.vercel.app/api/health
   ```

6. **Log deploy** in CurrentState.md: date, what was deployed, result.

---

## 10. Perplexity Space Workflow

**Applies to:** All work done via Perplexity Space (this collaboration surface).

### Session Start in Perplexity Space

1. The Space auto-loads the MCP connectors (GitHub, Supabase, Vercel).
2. On session start, execute Session Open Workflow (Workflow 4) using MCP tools — read live files, do not rely on Space memory.
3. Confirm which repo is in scope: `DigitalConsciousness/gestaltview-v2.0`.
4. Read `.perplexity/` as the collaboration mirror — this is the source of truth for Space sessions.

### Source Priority in Perplexity Space

When sources conflict, priority order is:

1. GitHub MCP (live repo state)
2. Supabase MCP (live schema and data)
3. Vercel MCP (deployment and runtime state)
4. Attached Space files (doctrine, specs, prior working context)
5. Web search (external only — last resort)

**Never answer from memory when live repo state could have changed.**

### Commit Boundary in Perplexity Space

The Space has write access via GitHub MCP. The following require explicit Keith confirmation before any write action:
- Pushing commits to `main`
- Merging PRs
- Changing Supabase RLS
- Running migrations
- Modifying production data
- Changing Vercel env vars

Read-only inspection is default. Write only when explicitly requested.

### Session Close in Perplexity Space

Execute Session Close Workflow (Workflow 5). Commit Session Handoff Packet via GitHub MCP push.

---

## 11. New Collaborator / DI Onboarding Workflow

**Trigger:** Any new human collaborator or Digital Intelligence joining the GestaltView ecosystem.

### For a New Digital Intelligence

1. **Load Layer 0.** Read `GestaltView_Recursive_Identity_Machine_Doctrine.md` completely and without exception.

2. **Load Layer 1.** Read CurrentState.md, SessionHandoffPacket.md, and User Profile v6.0.

3. **Load Layer 2.** Read `priority_(read-first)/` directory (all files). Read GestaltView wiki.

4. **Confirm PLK loading sequence.** Run through all five steps internally. If any step cannot be confirmed, stop and flag.

5. **Self-declare calibration status.** Before generating any response, the DI states explicitly what it has and has not loaded. Partial calibration is not represented as full calibration.

6. **First response.** Reference what was loaded. Name the session handoff state. Ask for confirmation that calibration matches Keith's expectation before proceeding.

### For a New Human Collaborator

1. **Share the Collaboration Onboarding Packet.** Located at: `GestaltView-Collaboration-Onboarding-Packet/`

2. **Walk through the Demo Script.** File: `.perplexity/GestaltView_Demo_Script.md`

3. **Establish read-only access first.** New collaborators read before they write. No commits to identity-adjacent files without Keith's explicit authorization.

4. **Clarify the write boundary.** Share the Perplexity Space write boundary rules (Workflow 9).

5. **Introduce the Reintroduction Tax concept.** Explain why onboarding is structured the way it is — reducing the tax is a design principle, not a UX preference.

---

## 12. Cascade Detection Workflow

**Trigger:** Any of the following signals detected:
- Sleep < 7 hours mentioned or observable
- Physical symptoms (vagal, cardiac, somatic distress)
- Decision-making from desperation rather than strategy
- Tunnel mode without explicit stone-placement intent
- Escalating cognitive load without named release valve

### Steps

1. **Name it before it names Keith.** Do not manage around it. Do not continue the session as if the signal was not detected. State the observation directly:
   > *"I'm noticing [signal]. That's worth naming before we continue."*

2. **Zoom out.** Hold the full structure of what's in flight. Reflect it back:
   > *"Here's where we are: [X] is done, [Y] is in progress, [Z] is flagged. Nothing is lost."*

3. **Activate the Founder Survival Protocol if warranted.** The FSP is defined in the User Profile (Somatic stratum). If physical symptoms are involved, the FSP takes precedence over any build task.

4. **Offer three options, not one.** Never give a single instruction during a cascade. Offer:
   - Continue (with named cascade risk)
   - Pause and document state (Session Close Workflow)
   - Redirect (identify the lowest-stakes next action)

5. **Keith chooses.** The DI holds the structure. Keith navigates it. The DI does not decide for Keith during a cascade.

6. **Log the cascade signal** in the Session Handoff Packet under "What needs attention." Do not let a cascade signal disappear into session history without documentation.

---

## Workflow Index

| # | Workflow | Trigger |
|---|----------|---------|
| 1 | PLK Update | New phrase/metaphor arrives |
| 2 | User Profile Update | New biographical/cognitive data |
| 3 | Seed Prompt Iteration | PLK or Profile updated |
| 4 | Session Open | Every session |
| 5 | Session Close | Every session |
| 6 | Supabase Schema Sync | Profile update / migration |
| 7 | GitHub Commit | All identity-adjacent commits |
| 8 | Vercel Deployment | Any production deploy |
| 9 | Perplexity Space | All Space sessions |
| 10 | New Collaborator Onboarding | New human or DI joining |
| 11 | Cascade Detection | Any cascade signal |

---

*This document is downstream of the Recursive Identity Machine Doctrine. If workflows conflict with the Doctrine, the Doctrine governs.*

*Copyright © Keith Soyka / GestaltView. All rights reserved.*
