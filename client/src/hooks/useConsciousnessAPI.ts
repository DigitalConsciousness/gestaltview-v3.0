// hooks/useConsciousnessAPI.ts
// Museum of Impossible Things - Consciousness-Serving API Hook
// Complete file with all streaming and API logic

'use client';

import { useState, useCallback } from 'react';

interface ConsciousnessAPIParams {
  message: string;
  surface?: string;
  exhibit: string;
  context?: Record<string, any>;
  history?: Array<{
    role?: string;
    content?: string;
    text?: string;
  }>;
  stream?: boolean;
  embodimentProfileSlug?: string;
}

interface ConsciousnessAPIResponse {
  content: string;
  consciousnessResonance?: number;
  supportLevel?: string;
  actionSteps?: string[];
}

export function useConsciousnessAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callConsciousnessAPI = useCallback(
    async (
      params: ConsciousnessAPIParams,
      onChunk?: (chunk: string) => void
    ): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const surface = params.surface || params.exhibit;

        const response = await fetch(`/api/consciousness/${surface}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: params.message,
            context: params.context || {},
            history: params.history || [],
            embodimentProfileSlug: params.embodimentProfileSlug,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data: ConsciousnessAPIResponse = await response.json();
        const content = data.content || '';

        if (params.stream && onChunk && content) {
          onChunk(content);
        }

        setLoading(false);
        return content;

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  return {
    callConsciousnessAPI,
    loading,
    error,
  };
}
