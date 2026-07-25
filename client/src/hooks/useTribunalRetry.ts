import { useCallback } from "react";

import {
  isCannedTribunalResponse,
  isTribunalPassSignal,
  retryTribunalResponse,
  type RetryOptions,
  type TribunalRetryResult,
} from "@/lib/tribunalResponseGuard";

type RetryTribunalResponse = (
  fetchTurn: () => Promise<string | null | undefined>,
  options?: RetryOptions,
) => Promise<TribunalRetryResult>;

export function useTribunalRetry(): {
  callWithRetry: RetryTribunalResponse;
  isCannedTribunalResponse: typeof isCannedTribunalResponse;
  isTribunalPassSignal: typeof isTribunalPassSignal;
} {
  const callWithRetry = useCallback<RetryTribunalResponse>(
    (fetchTurn, options) => retryTribunalResponse(fetchTurn, options),
    [],
  );

  return {
    callWithRetry,
    isCannedTribunalResponse,
    isTribunalPassSignal,
  };
}
