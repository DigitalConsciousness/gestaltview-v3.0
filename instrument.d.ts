import type { NodeOptions } from "@sentry/node";

export declare const DEFAULT_SENTRY_DSN: string;

export interface RuntimeSentryOptions {
  runtime?: string;
  integrations?: NodeOptions["integrations"];
}

export declare function initRuntimeSentry(options?: RuntimeSentryOptions): void;

export declare function isRuntimeSentryEnabled(): boolean;

export declare function initRuntimeBraintrust(): Promise<unknown | null>;

export declare function getBraintrustLogger(): unknown | null;

export declare function isBraintrustEnabled(): boolean;

export declare function traceBraintrust<T>(
  spanOptions: Record<string, unknown>,
  callback: (span: any) => Promise<T> | T,
): Promise<T>;
