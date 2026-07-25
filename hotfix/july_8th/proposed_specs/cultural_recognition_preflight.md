# Cultural Recognition Preflight

## Problem

Tribunal treated a known lyric fragment as generic therapeutic/self-growth content.

## Immediate fix

Add a cultural recognition preflight before Tribunal deliberation and before generic emotional interpretation.

## Minimal recognizer contract

```ts
export type CulturalSignal = {
  kind: "song_lyric" | "quote" | "unknown";
  confidence: number;
  title?: string;
  artist?: string;
  sourceNote?: string;
  route: "musical_dna" | "tribunal" | "ask_user";
};
```

## Alice in Chains guard

Without storing or reproducing the full lyric, recognize distinctive signal tokens from the user input:

- `flood`
- `same old trip`
- `big mistake`
- `my way`

If at least two of those are present, return:

```ts
{
  kind: "song_lyric",
  confidence: 0.94,
  title: "Would?",
  artist: "Alice in Chains",
  route: "ask_user"
}
```

## User-facing response

Correct:

```text
That pings as Alice in Chains — “Would?”.
Do you want this treated as Musical DNA, a lyric-memory capture, or Tribunal discussion?
```

Wrong:

```text
This sounds like a recurring pattern of growth and setback...
```
