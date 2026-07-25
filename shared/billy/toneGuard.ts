type BillyToneGuardInput = {
  response: string;
  userMessage?: string;
  context: "runtime_bug" | "normal";
};

const BANNED_BILLY_FILLER = [
  "I know this is hard",
  "That sounds hard",
  "I'm sorry you're going through this",
  "This is a courageous step",
  "journey of self-discovery",
  "no judgment",
];

export function applyBillyToneGuard({ response, context }: BillyToneGuardInput): string {
  if (context !== "runtime_bug") {
    return response;
  }

  let next = response;
  for (const phrase of BANNED_BILLY_FILLER) {
    next = next.replaceAll(phrase, "").trim();
  }

  next = next
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s.,;:!?-]+|[\s.,;:!?-]+$/g, "")
    .trim();

  if (!/[a-z]/i.test(next)) {
    return "This didn’t land. The system treated your input like a therapy prompt. That’s the bug.";
  }

  return next || "This didn’t land. The system treated your input like a therapy prompt. That’s the bug.";
}
