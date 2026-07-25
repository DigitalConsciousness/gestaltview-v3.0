# Billy Tone Guard

## Problem

Billy is defaulting to canned supportive language that feels generic, clinical, and patronizing in ordinary product failure contexts.

## Add a response postprocessor

Create a small guard in the Billy response path:

```ts
const BANNED_BILLY_FILLER = [
  "I know this is hard",
  "That sounds hard",
  "I'm sorry you're going through this",
  "This is a courageous step",
  "journey of self-discovery",
  "no judgment",
];
```

Behavior:

- If banned phrase appears and the user did not express direct distress, rewrite to concrete state naming.
- If the context is a runtime bug, acknowledge the bug plainly.
- Preserve exact user language.

Examples:

Bad:

```text
I know this is hard, but you're taking a courageous step.
```

Good:

```text
This didn’t land. The system treated your input like a therapy prompt instead of recognizing the signal.
```

Bad:

```text
No judgment, let’s explore what this means.
```

Good:

```text
Capture first. We don’t need to explain it yet.
```
