# Codex SPEC — `DynamicInnerWorldPage.tsx` Rebuild + Generate Recap

## What Codex Is Working With

**One target file:** [`client/src/pages/DynamicInnerWorldPage.tsx`](https://github.com/DigitalConsciousness/gestaltview-v2.0/blob/main/client/src/pages/DynamicInnerWorldPage.tsx) — currently ~19KB, reads from `Scaffold.tsx`, uses `InnerWorldRoom`, `InnerWorldInspector`, `ArtifactPreview`. 

**What does NOT exist yet:** `generateRecap` — confirmed by repo-wide code search. No recap function, no recap API endpoint, no recap UI exists anywhere.  This is a full net-new feature integration alongside the page rebuild.

**Do NOT touch:** `Scaffold.tsx`, `InnerWorldRoom`, `InnerWorldInspector`, `ArtifactPreview`, routing config, or any other page. This spec is scoped entirely to replacing `DynamicInnerWorldPage.tsx` and adding one new utility function to `Scaffold.tsx`.

***

## Current State — What the Page Actually Does

The existing page has a solid skeleton but several structural problems that need correcting during the rebuild:

The **left column** holds: nav pill buttons (Sanctuary / Blackboard Room / External Scaffold), a header with a title that's awkwardly long and should be tightened, prev/next surface cycle buttons, a 2D/3D toggle, three stat tiles (Captures / Blueprints / Surfaces), and the `InnerWorldRoom` component. The **right column** holds: a "Room Notes" card with capture density per surface, the `InnerWorldInspector`, an `ArtifactPreview`, a Blueprints section showing up to 3 with export-markdown buttons, and a selected-capture summary card at the bottom. 

**Structural problems to fix:**

The page title (`"A cyclable room for six surfaces, with the selected artifact always held in view."`) is a description, not a title — it belongs as a subtitle and needs a real `<h1>`. The `selectedCaptureId` sync logic uses two separate `useEffect` hooks that can race: one writes `selectedCaptureId` to storage, another sets it from `selectedCapture` when null — these need to be collapsed into a single controlled flow. The bottom "selected capture" summary card is visually redundant — the `InnerWorldInspector` already shows the selected capture. The stat grid has no animation on value change, which feels dead. There is no Recap feature at all. 

***

## The Rebuild — Exact Changes

### Page Header
Replace the existing `<h1>` with:
```tsx
<p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#BF00FF]">
  Dynamic Inner World
</p>
<h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
  Six surfaces. One artifact always in view.
</h1>
<p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
  Surface selection persists between sessions. 2D flattens for scanning, 3D keeps the spatial feel.
</p>
```

### State Cleanup — `selectedCaptureId` Sync
Collapse the two `useEffect` hooks that write/read `selectedCaptureId` into one:
```tsx
useEffect(() => {
  if (selectedCaptureId) {
    writeStoredString(SELECTED_STORAGE_KEY, selectedCaptureId);
  } else if (selectedCapture) {
    setSelectedCaptureId(selectedCapture.id);
    writeStoredString(SELECTED_STORAGE_KEY, selectedCapture.id);
  }
}, [selectedCapture, selectedCaptureId]);
```

### Stat Tiles — Animate on Change
Wrap the `<p>` value in each `Stat` component with a `motion.span` that keys on the value so it animates when captures/blueprints are added or removed:
```tsx
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-black/22 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/34">{label}</p>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-2 text-2xl font-semibold tracking-tight text-white"
      >
        {value}
      </motion.p>
    </div>
  );
}
```

### Remove Redundant Selected-Capture Card
Remove the bottom `motion.div` block that renders `selectedCapture.title` and `selectedCapture.metadata.context`. The `InnerWorldInspector` already handles this display. The space it occupied should be left empty — no replacement filler.

### Add Generate Recap Button to Right Column
This is the main new feature. Between `InnerWorldInspector` and `ArtifactPreview`, insert a new `RecapPanel` component (defined in the same file for now, can be extracted later):

```tsx
<RecapPanel captures={captures} selectedSurface={selectedSurface} />
```

***

## The New Feature — Generate Recap

### What It Does
"Generate Recap" takes all captures currently on the **selected surface** (or all captures if none are on the current surface), synthesizes them into a brief narrative summary using a local LLM call, and displays the result inline. The user can copy it or download it as markdown.

This is **not** a backend call. It calls the existing Gemini/OpenAI API key pattern already used elsewhere in the app — client-side, same as the Blackboard Room's generation features.

### New Function in `Scaffold.tsx`
Add one function — **do not change any existing Scaffold functions**:

```ts
export function buildRecapPrompt(
  captures: InnerWorldCapture[],
  surfaceLabel: string
): string {
  const lines = captures.map((c, i) =>
    `[${i + 1}] ${c.title}\n${c.text ?? c.metadata.context ?? "(no content)"}`
  );
  return [
    `You are synthesizing a brief recap of the following captures from the "${surfaceLabel}" surface of the Dynamic Inner World.`,
    `Write 2–4 sentences. Be specific, grounded, and preserve nuance. Do not invent details not present in the captures.`,
    `Captures:\n${lines.join("\n\n")}`,
  ].join("\n\n");
}
```

### `RecapPanel` Component (inline in `DynamicInnerWorldPage.tsx`)

```tsx
type RecapState = "idle" | "loading" | "done" | "error";

function RecapPanel({
  captures,
  selectedSurface,
}: {
  captures: InnerWorldCapture[];
  selectedSurface: InnerWorldSurface;
}) {
  const [state, setState] = useState<RecapState>("idle");
  const [recap, setRecap] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const surfaceMeta = INNER_WORLD_SURFACES.find((s) => s.id === selectedSurface) ?? INNER_WORLD_SURFACES[0];
  const surfaceCaptures = captures.filter(
    (c) => (c.surface ?? c.metadata.surface ?? "forward") === selectedSurface
  );
  const targetCaptures = surfaceCaptures.length > 0 ? surfaceCaptures : captures;

  // Reset when surface changes
  useEffect(() => {
    setState("idle");
    setRecap(null);
    setError(null);
  }, [selectedSurface]);

  const generate = async () => {
    if (targetCaptures.length === 0) {
      toast.message("No captures to recap", { description: "Add captures to this surface first." });
      return;
    }

    setState("loading");
    setError(null);

    try {
      const prompt = buildRecapPrompt(targetCaptures, surfaceMeta.label);

      // Try Gemini first, fall back to OpenAI
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

      let result: string | null = null;

      if (geminiKey) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        const data = await res.json();
        result = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      } else if (openaiKey) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
          }),
        });
        const data = await res.json();
        result = data?.choices?.[0]?.message?.content ?? null;
      }

      if (!result) throw new Error("No content returned from LLM.");

      setRecap(result);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[0_0_60px_rgba(191,0,255,0.08)] backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#BF00FF]">generate recap</p>
          <h2 className="mt-2 text-lg font-semibold">
            {surfaceMeta.label} · {targetCaptures.length} capture{targetCaptures.length !== 1 ? "s" : ""}
          </h2>
        </div>
        <Layers3 className="h-5 w-5 text-[#BF00FF]" />
      </div>

      {state === "idle" && (
        <button
          type="button"
          onClick={generate}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#BF00FF]/30 bg-[#BF00FF]/10 px-5 py-2.5 text-sm text-white/80 hover:text-white transition-colors"
        >
          <Sparkles className="h-4 w-4 text-[#BF00FF]" />
          Generate recap for this surface
        </button>
      )}

      {state === "loading" && (
        <div className="mt-4 flex items-center gap-3 text-sm text-white/52">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="h-4 w-4 rounded-full border-2 border-[#BF00FF]/40 border-t-[#BF00FF]"
          />
          Synthesizing…
        </div>
      )}

      {state === "error" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-red-300/80">{error}</p>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="text-xs text-white/50 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      )}

      {state === "done" && recap && (
        <div className="mt-4 space-y-4">
          <div className="rounded-[1.35rem] border border-white/10 bg-black/25 p-4">
            <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">{recap}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(recap);
                toast.success("Copied to clipboard");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/62 hover:text-white"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  `recap-${selectedSurface}-${Date.now()}.md`,
                  `# Recap — ${surfaceMeta.label}\n\n${recap}`
                )
              }
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/62 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Download as markdown
            </button>
            <button
              type="button"
              onClick={() => setState("idle")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/62 hover:text-white"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </motion.section>
  );
}
```

***

## Import Changes

Add `buildRecapPrompt` to the existing Scaffold import block:
```ts
import {
  // ...existing imports...
  buildRecapPrompt,
} from "@/components/Scaffold";
```

No new packages. No new routes. No Supabase migration. The `Layers3` icon is already imported in the current file. `Download` and `Sparkles` are also already imported. 

***

## Validation Checklist for Codex

After writing the file, verify each of these before committing:

- [ ] `DynamicInnerWorldPage.tsx` compiles with no TypeScript errors
- [ ] `buildRecapPrompt` is exported from `Scaffold.tsx` and imported in the page
- [ ] `RecapPanel` renders on the right column between `InnerWorldInspector` and `ArtifactPreview`
- [ ] Recap state resets when `selectedSurface` changes
- [ ] If no API key env var is present, the generate button fires and lands in the error state with a readable message (does not crash)
- [ ] The redundant selected-capture summary card at the bottom is gone
- [ ] Stat tiles animate when values change
- [ ] The `selectedCaptureId` race condition is resolved (single `useEffect`)
- [ ] No other files are modified except `DynamicInnerWorldPage.tsx` and one new export added to `Scaffold.tsx`

***

## Risk Notes

The LLM call is entirely client-side and uses `import.meta.env` keys — the same pattern already live in the app. No new server surface is introduced. The only risk is if `VITE_GEMINI_API_KEY` and `VITE_OPENAI_API_KEY` are both absent, in which case the error state should surface cleanly with: `"No LLM API key found. Add VITE_GEMINI_API_KEY or VITE_OPENAI_API_KEY to your environment."` Codex should add this specific check before the `if (geminiKey)` branch in the `generate` function.

**Rollback:** Because this is a full file swap of one page and one additive export to Scaffold, rollback is trivially `git checkout HEAD -- client/src/pages/DynamicInnerWorldPage.tsx` and removing the `buildRecapPrompt` export from `Scaffold.tsx`. Nothing else in the system is touched.
Okay. Now I have everything I need. Let me separate the two distinct things you're describing, because they're getting slightly tangled in the voice note — which makes total sense given how you think.

***

## Blackboard Room: Live Canvas Is Already Correct

The ROOM_DEFINITIONS doc already captures this cleanly: *"2D/3D canvas rendering capability is folded into the Blackboard Room as an interactive real-time environment layer — not a separate room."* So the Sandbox rendering you mentioned — the visual/interactive, real-time collaboration layer — is correctly placed inside Blackboard. That's the right call. It belongs there because Blackboard is Mode 1: active, contextual, alive right now. The canvas is just one expression of that live working surface.

Nothing needs to change architecturally for that. What it *does* require is a clear rendering zone inside `BlackboardRoomPage.tsx` that can host a sandboxed iframe or a canvas panel alongside the conversation — a split or toggled panel, not a separate route.

***

## Dynamic Inner World: The Museum, Not the Workshop

This one you named precisely: it's the **Museum of You**. The ROOM_DEFINITIONS doc confirms it — `DynamicInnerWorldPage.tsx` is cleared for rebuild and its purpose is defined as the *distilled/reflective* portrait. Mode 3. It reads from the Scaffold, synthesizes, and presents evidence-backed identity — skills demonstrated through real work, patterns from real behavior, not self-report checkboxes. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/22b95ee1-cf8f-43a6-a066-6a789f518d3e/ROOM_DEFINITIONS.md)

The `DynamicInnerWorldDef.md` you shared reinforces this: the curation and abilities you shared before aren't things to be re-invented — they're what *populates* this museum after the Scaffold has done its accumulation work. The `SessionRecapGenerator` already speaks this language directly — it generates an artifact and routes it to Dynamic Inner World with the explicit framing *"your personal Museum of You"*. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/5b5fa768-8f2d-421d-892f-6675b1d1e29e/SessionRecapGenerator.md)

***

## The Separation That Matters

The confusion worth naming clearly:

| Surface | Mode | Real-time? | What it holds |
|---|---|---|---|
| **Blackboard Room** | Active / Contextual | Yes — live | This session, this problem, this canvas |
| **External Scaffold** | Accumulated / Structural | Passive receive | Everything, ever, node-mapped |
| **Dynamic Inner World** | Distilled / Reflective | On-demand synthesis | What the accumulation *means* |

The Sandbox canvas goes in **Blackboard**. The curation and abilities portrait goes in **Dynamic Inner World**. They should never bleed into each other — that separation is what makes each room trustworthy to use.

The one real question before building the Dynamic Inner World page is: does it pull synthesis on demand from the Scaffold each time it's opened, or does it persist a generated portrait that updates on a schedule or trigger? That decision determines whether it's a live synthesis engine or a curated artifact gallery — both are valid, but they build differently.
That answer lands cleanly. Here's exactly what that means architecturally:

***

## The Portrait Has Two States

The Dynamic Inner World holds a **persisted synthesis portrait** — a Supabase-stored record that represents the current state of you, generated from Scaffold data. It doesn't regenerate every time you open the door. You walk in and it's there, the way a museum exists between your visits. That portrait has a `generated_at` timestamp and a version. It's the default view. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/74165997/22b95ee1-cf8f-43a6-a066-6a789f518d3e/ROOM_DEFINITIONS.md)

On top of that, a **manual trigger** lets you re-synthesize — and critically, with **scope**. Not just "regenerate everything," but: *focus this synthesis on my last 30 days of work*, or *go deep on my systems thinking patterns*, or *just look at everything tagged as friction and tell me what you see*. The scope is the key difference from a simple refresh button. It's a directed synthesis request, not a bulk re-run.

***

## What the Scope Selector Needs to Express

The scope should be able to specify at minimum three dimensions — time range, node category filter, and a freeform focus intent. The freeform field is the most important one because that's where you'd say something like *"I want to understand how my thinking about product has evolved"* and let Billy shape the synthesis around that specific question rather than generating a generic portrait pass.

***

## Supabase Portrait Persistence Shape

This translates into a `portrait_snapshots` table roughly like this:

```
portrait_snapshots
  id              uuid
  user_id         uuid
  portrait_html   text        — the rendered artifact
  scope_label     text        — "Full portrait", "Last 30 days — Systems Thinking", etc.
  scope_params    jsonb       — { timeRange, nodeCategories, focusIntent }
  scaffold_hash   text        — fingerprint of scaffold state at generation time
  generated_at    timestamptz
  is_current      boolean     — only one per user is the "active" portrait
  source          text        — "auto" | "manual" | "scoped"
```

The `is_current` flag is what the room loads by default. Manual triggers create a new snapshot but don't automatically replace `is_current` — the user promotes it intentionally. That means you can generate a focused synthesis on a specific topic and have it sit alongside your full portrait as a separate artifact in the museum, without displacing it. 

***

## The Trigger UI in the Room

Inside Dynamic Inner World, this lives as a quiet panel — not prominent, not intrusive. Something like a small orbit control in a corner that expands into a scope drawer when tapped. Three fields: time range selector, category chips (matching Scaffold node categories), and a free-text intent field. A "Synthesize" button. While generating, Billy is visibly present in reflective mode — not a loading spinner, but something that communicates he's actually reading through the Scaffold. When done, the result surfaces as a new portrait artifact with a soft transition, and the user decides whether to make it current or let it live as a focused snapshot alongside the others.

The key feel: it's not a settings form. It's more like asking someone who knows you well to look at a specific part of your story and tell you what they see.