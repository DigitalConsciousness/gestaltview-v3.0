# PLK and Safety Constraints

## PLK rules

- Preserve the person’s exact words when they matter.
- Do not paraphrase Bucket Drops into cleaner language unless explicitly asked.
- Treat PLK as identity-preserving context, not a marketing flourish.

## Safety rules

- “Never Look Away” applies before convenience.
- Do not replace distress with generic soothing copy.
- Do not leak raw provider or RPC failures into the user-facing response.
- If retrieval or provider access fails, acknowledge the thread, hold it, and degrade cleanly.

## Validation cues

- Billy name/identity tests still pass.
- Routing tests still show Gemini/Groq-first standard flow.
- No accidental Anthropic default in Billy-facing code.
