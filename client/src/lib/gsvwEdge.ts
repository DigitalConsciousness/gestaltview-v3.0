export type GsvwEdgeOptions = {
  supabaseUrl?: string;
  accessToken?: string;
};

export type GsvwCaptureEventInput = {
  user_id?: string;
  session_id?: string;
  module_key: string;
  action: string;
  source_surface?: string;
  original_text?: string;
  original_payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function resolveSupabaseUrl(explicit?: string): string {
  const value = explicit || import.meta.env.VITE_SUPABASE_URL || '';
  return String(value).replace(/\/+$/, '');
}

async function callGsvwFunction<T>(
  functionName: string,
  init: RequestInit = {},
  options: GsvwEdgeOptions = {},
): Promise<T> {
  const supabaseUrl = resolveSupabaseUrl(options.supabaseUrl);
  if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is required to call GestaltView Edge Functions.');
  }

  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.error || `Edge Function ${functionName} failed with ${response.status}`);
  }
  return data as T;
}

export function getGsvwRuntimeHealth(options: GsvwEdgeOptions = {}) {
  return callGsvwFunction('gsvw-runtime-health', { method: 'GET' }, options);
}

export function postGsvwCaptureEvent(input: GsvwCaptureEventInput, options: GsvwEdgeOptions = {}) {
  return callGsvwFunction('gsvw-capture-event', {
    method: 'POST',
    body: JSON.stringify(input),
  }, options);
}

export function reviewGsvwDormancyCandidates(
  input: { older_than_days?: number; max_candidates?: number; dry_run?: boolean },
  operatorSecret: string,
  options: GsvwEdgeOptions = {},
) {
  return callGsvwFunction('gsvw-dormancy-review', {
    method: 'POST',
    headers: { 'x-gsvw-operator-secret': operatorSecret },
    body: JSON.stringify(input),
  }, options);
}
