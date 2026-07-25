import { isCannedResponse } from "@/lib/PersonaATC";

export interface RetryOptions {
  maxRetries?: number;
  backoffMs?: number[];
}

export interface TribunalRetryResult {
  text: string | null;
  exhausted: boolean;
  attempts: number;
}

const PASS_SIGNAL = /^\s*\[pass\]\s*$/i;

function normalizeResponseText(text: string | null | undefined): string {
  return typeof text === "string" ? text : "";
}

export function isTribunalPassSignal(text: string | null | undefined): boolean {
  return PASS_SIGNAL.test(normalizeResponseText(text).trim());
}

export function isCannedTribunalResponse(text: string | null | undefined): boolean {
  const normalized = normalizeResponseText(text).trim();
  if (isTribunalPassSignal(normalized)) {
    return false;
  }

  return (
    isCannedResponse(normalized) ||
    /canned fallback detected|response blocked|local fallback is active/i.test(normalized)
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export async function retryTribunalResponse(
  fetchTurn: () => Promise<string | null | undefined>,
  options: RetryOptions = {},
): Promise<TribunalRetryResult> {
  const maxRetries = Math.max(0, options.maxRetries ?? 2);
  const backoffMs = options.backoffMs ?? [1000, 2000];

  let attempts = 0;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    attempts = attempt + 1;
    const text = normalizeResponseText(await fetchTurn());

    if (isTribunalPassSignal(text) || !isCannedTribunalResponse(text)) {
      return { text, exhausted: false, attempts };
    }

    if (attempt < maxRetries) {
      const delay = backoffMs[attempt] ?? backoffMs[backoffMs.length - 1] ?? 0;
      await sleep(delay);
    }
  }

  return { text: null, exhausted: true, attempts };
}
