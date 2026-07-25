import { useEffect, useState } from 'react';
import type { OTSEntry } from './types';

export interface OTSDataState {
  entries: OTSEntry[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  buckets: string[];
}

export function useOTSData(): OTSDataState {
  const [entries, setEntries] = useState<OTSEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/diligence/ots')
      .then((r) => r.json())
      .then((data: { entries: OTSEntry[] }) => {
        setEntries(data.entries ?? []);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const buckets = Array.from(new Set(entries.map((e) => e.topicBucket).filter(Boolean)));

  return {
    entries,
    loading,
    error,
    totalCount: entries.length,
    buckets,
  };
}
