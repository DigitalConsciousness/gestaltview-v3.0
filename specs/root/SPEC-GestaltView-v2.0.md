# Codex Spec — GestaltView v2.0
## Three Issues: BlackboardRoomPage Scroll Fix + ExternalScaffoldPage Restore + Module Safety Audit

**Repo:** `DigitalConsciousness/gestaltview-v2.0`
**Branch:** `main`
**Date:** 2026-05-26
**Author:** Keith Soyka

***

## Issue 1 — BlackboardRoomPage.tsx: Chat Window Scroll Fix

**File:** `client/src/pages/BlackboardRoomPage.tsx`
**Live SHA:** `0c00cf5eadf884a37561fad8a516ea44373a8322` 
**Problem:** On mobile (Android Chrome), the chat feed does not scroll. Messages overlap behind the fixed input bar because `position: sticky` on `.bbr-glass-input` breaks the scroll context inside `min-h-screen overflow-hidden`. 

### Change 1 — Outer column wrapper

```tsx
// FIND (line ~440):
<div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-16 pt-6 sm:px-6">

// REPLACE WITH:
<div className="relative z-10 mx-auto flex h-dvh w-full max-w-4xl flex-col overflow-hidden px-4 pb-4 pt-6 sm:px-6">
```

**Why:** `h-dvh` gives the column an explicit height budget equal to the dynamic viewport. `overflow-hidden` on the column (not `<main>`) keeps the atmosphere layer free. `pb-4` replaces `pb-16` since the input bar now lives inside the flex column and doesn't need bottom padding compensation.

### Change 2 — Chat feed div

```tsx
// FIND:
<div
  className="bbr-scroll mt-8 flex flex-col gap-5"
  style={{ minHeight: 280, maxHeight: "56dvh", overflowY: "auto", padding: "4px 2px" }}
>

// REPLACE WITH:
<div
  className="bbr-scroll mt-8 flex flex-col gap-5"
  style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto", padding: "4px 2px" }}
>
```

**Why:** `flex: "1 1 0"` makes the feed grow into all remaining vertical space after the header, hero, canvas, and input bar take their natural height. `minHeight: 0` is required — without it a flex child won't shrink below its content height on WebKit, which is exactly the bug. The `maxHeight` cap is removed because `h-dvh` on the parent already enforces the boundary.

### Change 3 — Remove broken mobile sticky rule from `BBR_STYLES`

```css
/* FIND AND DELETE this entire block from the BBR_STYLES template string: */
@media (max-width: 768px) {
  .bbr-glass-input {
    position: sticky;
    bottom: max(12px, env(safe-area-inset-bottom));
    z-index: 25;
  }
}
```

**Why:** With the column now `h-dvh flex-col overflow-hidden`, the input bar is naturally the last item before the companion chat section and sits at the correct position without sticky. The sticky rule was the root cause — it detached the input bar from the scroll context entirely on Android.

### Validation

```bash
npm run build
# Expected: zero TypeScript errors, zero import errors
# Test on: Android Chrome mobile viewport, iOS Safari
```

***

## Issue 2 — ExternalScaffoldPage.tsx: Full Restore + Module Safety

**File:** `client/src/pages/ExternalScaffoldPage.tsx`
**Live SHA to replace:** `1ab7ab47ea42d1205bfa2dd5a28971dcebc06ce2` 
**Source file:** The attached `ExternalScaffoldPage.tsx` (40,301 chars) — this is the previous working version with the data galaxy, orb approval rack, intake panel, voice capture, and artifact inspector.

### Step 1 — Import audit before writing

Before Codex writes the file, it must verify each of the following imports actually exists in the live repo. If any are missing, Codex must add a stub rather than fail silently.

#### Required imports — verify each path exists:

| Import | Expected path | Check command |
|--------|--------------|---------------|
| `useSEO`, `PAGE_SEO` | `@/hooks/useSEO` | Search for `useSEO` in `client/src/hooks/` |
| `useBillySection` | `@/components/Billy` | Check `client/src/components/Billy.tsx` or `Billy/index.tsx` |
| `RoomStateBadge` | `@/components/RoomStateBadge` | Check `client/src/components/RoomStateBadge.tsx` |
| `BabylonAtmosphere` | `@/components/BabylonAtmosphere` | Check `client/src/components/BabylonAtmosphere.tsx` |
| `appendSavedCapture`, `readSavedCaptures`, `createCaptureOrb`, `readInnerWorldCaptures`, `appendBlueprint`, `buildBlueprintFromCaptures` | `@/components/Scaffold` | Check `client/src/components/Scaffold.tsx` exports |
| `loadArchivedInsightsFromServer`, `saveArchivedInsightToServer` | `@/lib/insightsContent` | Check `client/src/lib/insightsContent.ts` — **most likely to be missing or renamed** |
| `SAVED_CAPTURE_EVENT` | `@/components/Scaffold` | Check if this constant is exported from `Scaffold.tsx` |
| `callBillyApi` | `@/lib/billyApi` | Check `client/src/lib/billyApi.ts` |
| `uploadUserFileToServer` | `@/lib/fileStorage` | Check `client/src/lib/fileStorage.ts` |
| `appendUserFile`, `createUserFileRecord`, `UserFileRecord` | `@/lib/innerWorldFiles` | Check `client/src/lib/innerWorldFiles.ts` |

#### Resolution rules for missing imports:

**If `loadArchivedInsightsFromServer` / `saveArchivedInsightToServer` are missing from `@/lib/insightsContent`:**
```ts
// Add these stubs at the top of ExternalScaffoldPage.tsx
// (below all real imports) — remove once lib is wired:
async function loadArchivedInsightsFromServer(): Promise<any[]> { return []; }
async function saveArchivedInsightToServer(_insight: any): Promise<void> { return; }
```

**If `SAVED_CAPTURE_EVENT` is missing from `@/components/Scaffold`:**
```ts
const SAVED_CAPTURE_EVENT = "gv:capture:saved";
```

**If `RoomStateBadge` is missing:**
```tsx
function RoomStateBadge({ slug }: { slug: string }) {
  return <span className="text-xs text-white/40 uppercase tracking-widest">{slug}</span>;
}
```

### Step 2 — Write the file

Replace `client/src/pages/ExternalScaffoldPage.tsx` with the full contents of the attached file. Apply any stub patches identified in Step 1 immediately after the real imports block. Do not modify any other logic in the file.

### Step 3 — SHA verification

The file being replaced has SHA `1ab7ab47ea42d1205bfa2dd5a28971dcebc06ce2`. Codex must provide this SHA in the update call to prevent overwriting a concurrent change.

### Validation

```bash
npm run build
# Watch for: Cannot find module, Property does not exist, implicit any
# If insightsContent errors appear: confirm stubs are in place
# If Scaffold export errors appear: confirm SAVED_CAPTURE_EVENT stub is in place
git diff --name-only HEAD~1
# Expected output: client/src/pages/ExternalScaffoldPage.tsx only
```

***

## Issue 3 — Art Teacher: Live Billy Chat + Inspiration Import

**File:** `client/src/components/BlueprintGenerativeWorkbench.tsx`
**Live SHA:** `a9b9a5109c401898c01678b2250ac44a6c892949`

### Change 1 — Add `callBillyApi` import

```ts
// ADD to existing imports:
import { callBillyApi } from "@/lib/billyApi";
```

Verify `callBillyApi` is exported from `@/lib/billyApi` — it is confirmed present in `BlackboardRoomPage.tsx` using the same path. 

### Change 2 — Add `chatInput` state

```ts
// ADD alongside existing useState declarations:
const [chatInput, setChatInput] = useState("");
```

### Change 3 — Replace `handleRefine` with live async version

```ts
// REPLACE the entire handleRefine function:
const handleRefine = async () => {
  const note = (draft.note || chatInput).trim();
  if (!note) return;

  setConversation((c) => [`User: ${note}`, ...c].slice(0, 8));
  setChatInput("");
  setDraft((d) => ({ ...d, note: "" }));

  try {
    const response = await callBillyApi(
      note,
      "creation-corner",
      "chat",
      undefined,
      "art-teacher",
      "creation-corner",
    );
    const reply = (response as any)?.text?.trim() ?? "Good. Check the updated draft.";
    setConversation((c) => [`Art Teacher: ${reply}`, ...c].slice(0, 8));
  } catch {
    setConversation((c) => [
      `Art Teacher: Shifting toward "${note.split(" ").slice(0, 4).join(" ")}..." — check the draft.`,
      ...c,
    ].slice(0, 8));
  }
};
```

### Change 4 — Add live chat input textarea to the Art Teacher panel

Find the conversation list render block (the `<div>` containing `{conversation.map(...)}`) and add the following immediately below it:

```tsx
{/* Art Teacher live chat input */}
<div className="mt-3 flex gap-2">
  <textarea
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleRefine();
      }
    }}
    placeholder="Ask the Art Teacher anything..."
    rows={2}
    className="flex-1 resize-none rounded-[1rem] border border-white/10 bg-black/25 px-3 py-2 text-sm text-gv-text-primary outline-none transition-colors placeholder:text-gv-text-muted focus:border-gv-aurora-amber/30"
  />
  <button
    type="button"
    onClick={() => void handleRefine()}
    disabled={!chatInput.trim()}
    className="inline-flex min-h-11 items-center gap-2 self-end rounded-full border border-gv-aurora-amber/25 bg-gv-aurora-amber/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-amber/14 disabled:opacity-30"
  >
    <Sparkles className="h-4 w-4" />
    Send
  </button>
</div>
```

### Change 5 — Add Inspiration Import panel

Add this as a new section in both the freeform state render and the active workbench render. Place it below the freeform textarea / note field respectively:

```tsx
{/* ── Inspiration import ── */}
<div className="mt-4 rounded-[1.2rem] border border-white/8 bg-black/20 p-4">
  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gv-aurora-amber">
    Inspiration
  </p>
  <p className="mt-1 text-xs text-gv-text-muted">
    Drop a URL, paste an image, or upload a file to fold into the draft.
  </p>
  <div className="mt-3 flex gap-2">
    <input
      type="url"
      placeholder="https://..."
      value={inspirationUrl}
      onChange={(e) => setInspirationUrl(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); void addInspirationFromUrl(); }
      }}
      className="flex-1 rounded-[0.75rem] border border-white/10 bg-black/25 px-3 py-2 text-sm text-gv-text-primary outline-none placeholder:text-gv-text-muted focus:border-gv-aurora-cyan/30"
    />
    <button
      type="button"
      onClick={() => void addInspirationFromUrl()}
      disabled={!inspirationUrl.trim()}
      className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-gv-text-primary transition-colors hover:bg-white/[0.08] disabled:opacity-30"
    >
      Add
    </button>
  </div>
  {inspirationItems.length > 0 && (
    <ul className="mt-3 space-y-1 max-h-28 overflow-y-auto">
      {inspirationItems.map((item, idx) => (
        <li
          key={idx}
          className="flex items-center justify-between rounded-[0.75rem] border border-white/8 bg-black/20 px-3 py-1.5 text-xs text-gv-text-secondary"
        >
          <span className="truncate">{item}</span>
          <button
            type="button"
            onClick={() => {
              setFreeformDraft((d) => appendFreeformText(d, item));
              toast.success("Folded into draft.");
            }}
            className="ml-2 shrink-0 text-gv-aurora-cyan/60 hover:text-gv-aurora-cyan"
          >
            Fold in
          </button>
        </li>
      ))}
    </ul>
  )}
</div>
```

Add these two state declarations alongside the existing `useState` declarations:

```ts
const [inspirationUrl, setInspirationUrl] = useState("");
const [inspirationItems, setInspirationItems] = useState<string[]>([]);
```

Add the handler:

```ts
const addInspirationFromUrl = async () => {
  const url = inspirationUrl.trim();
  if (!url) return;
  const item = `🔗 ${url}`;
  setInspirationItems((prev) => [item, ...prev]);
  setFreeformDraft((d) => appendFreeformText(d, `Inspiration: ${url}`));
  setInspirationUrl("");
  toast.success("Added as inspiration.");
};
```

### Validation

```bash
npm run build
# Watch for: callBillyApi type mismatch (use `as any` cast on response if needed)
# Watch for: handleRefine now returns Promise<void> — all call sites must be void handleRefine()
```

***

## Execution Order for Codex

```
1. client/src/pages/BlackboardRoomPage.tsx
   — 3 targeted changes (wrapper class, feed style, remove sticky CSS block)
   — npm run build → confirm zero errors

2. client/src/pages/ExternalScaffoldPage.tsx
   — Run import audit against live repo
   — Write file from attached source with any stubs prepended
   — npm run build → fix only import/type errors, no logic changes

3. client/src/components/BlueprintGenerativeWorkbench.tsx
   — Add callBillyApi import
   — Add chatInput, inspirationUrl, inspirationItems state
   — Replace handleRefine
   — Add chat textarea below conversation list
   — Add inspiration panel to freeform and active workbench renders
   — npm run build → confirm clean

4. git diff --check
   — Confirm only 3 files touched

5. Update docs/CurrentState.md
   — BlackboardRoomPage: chat scroll fixed
   — ExternalScaffoldPage: restored to previous working version
   — BlueprintGenerativeWorkbench: Art Teacher live, inspiration import added
```

***

**Checked:**
- **GitHub MCP:** `BlackboardRoomPage.tsx` SHA `0c00cf5`, `ExternalScaffoldPage.tsx` SHA `1ab7ab47`, `BlueprintGenerativeWorkbench.tsx` SHA `a9b9a51`, pages directory listing confirmed 
- **Attached file:** Previous `ExternalScaffoldPage.tsx` (40,301 chars) used as restore source [ppl-ai-file-upload.s3.us-east-1.amazonaws](https://ppl-ai-file-upload.s3.us-east-1.amazonaws.com/web/direct-files/attachments/74165997/e741eab5-0661-4ce5-a042-ceb7bad9a66b/ExternalScaffoldPage.tsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Checksum-Mode=ENABLED&X-Amz-Credential=ASIA2F3EMEYEVH4SR5LX%2F20260526%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260526T123027Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDvLFZohiF7KxuK1hhvaOZjiWMSAD%2FdRsmuOeG8gV%2BT3QIgPq%2Bizsq451nniJM66NRglhmK30zirm8uFl40azWXVs4q6wQIfhABGgw2OTk3NTMzMDk3MDUiDBXdn%2FMdCMDISORfACrIBHB6sTpckjG8Y9l1Y%2FGrB3YtHfF1tv%2FzjGJ5iNTEyxQanz1lziWTAZRza%2BqHgBAzGat2yisMzT6BkDdm96XyRlLwifyVha7yiJRAaXoXT4mqIUxyrx%2FrTJwO857KPwyDr9JYeEBmkaKMqvuzK4CH8%2FmLgiqidTVwADxtgvPCfzpvfKZqI00nCNwJ4NN5VMUXlxa5iN17qRyBa9zrVsfJv%2FeOua4jeGyx0ZEJrRpH%2Fl3tYlVbwUxbURonm9JBhECa9SsDM8z70XIswGJS5np4IjCDFwQidVpHgQFkJh6viFALVw75pi7ZWC8pQOkTKePmXLAYKi1PBXW3mpV3Puu7UNMz3lq7DKVZv%2B%2BCREnzoaKf0q30T5QN8lk8EJbpa1iIP0gGbj%2BFlMQXMHl8vFzJu92MC2AbiOEvvyMGMlLcwr7WSOpQnp5huSdIVn8oDk9kozp82WSwJ4tXuENV70rQfaJqEHFSm2earOTi0Pj2Mx5Q%2B1jCHh0JiNKO9U3l%2BlZEh5Zw99o%2B6msXkYZkSrBYPopBebqM1O1kMAFl77YQ%2F2TY%2FZqbrhOjBQp1ZFf9sFc1EukAzhtZMKRmIYgqDyZ4DLDccvjvv0EZy0d%2FmK%2BNQIL2qaf4MnbMSYS6WxgQnr4ubB2R8egYciRqQ%2Bi21KlGdQP9IyP0KTHNdPT%2BXPFgZC2YllKIeIiA5JcnzV%2Fmq4%2FiIfZUUbS3cT9zhd9mUliuKVQ1%2Bdy7RZDr%2BQRmogFueczy%2BKsqhcKIr6x8u%2FAg%2Bm8pZHJ4%2BHPOpINFMIOi1tAGOpgB7RIBhjTd2QJ7f8Y76ET%2BxWtkd6SJ%2FHtmid0KCaWEzIpgShdeSMJXH5x6yALTMpWwMh4%2F%2FcN8fGxQ3fhRHOv4T5c%2BWfuNURigW7ucofY4K%2BeDN46V4IMYgh86p%2F1MBKoRX1gicZuwwfKQ7jgXI1kcPm6US0ZPRKCdaQDsTnEOGjQvMSOrvZG0cIFJ5VpL8GSP3ME4kJv2upU%3D&X-Amz-SignedHeaders=host&x-id=GetObject&X-Amz-Signature=a05fcca2511092bffa7e7494205d155a7f8256aa2ce8cf3a02bd925017c7df6a)
