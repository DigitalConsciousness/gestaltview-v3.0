// useMasterclassProgress.ts
// Fetches the authenticated user's masterclass_progress rows from Supabase.
// Returns a map of embodiment_slug -> { session_count, last_session_at }
// so MasterclassPage / MasterclassProfileCard can show visited state.

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseAuth";

export interface SlugProgress {
  session_count: number;
  last_session_at: string | null;
}

export type ProgressMap = Record<string, SlugProgress>;

type SupabaseResult = {
  data: unknown;
  error?: unknown;
};

type MasterclassSupabaseClient = {
  from: (table: "masterclass_progress") => {
    select: (columns: string) => Promise<SupabaseResult>;
  };
  rpc: (
    fn: "upsert_masterclass_session",
    args: { p_embodiment_slug: string }
  ) => Promise<SupabaseResult>;
};

type MasterclassProgressRow = {
  embodiment_slug: string;
  session_count: number;
  last_session_at: string | null;
};

function isMasterclassProgressRow(value: unknown): value is MasterclassProgressRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  return (
    typeof row.embodiment_slug === "string" &&
    typeof row.session_count === "number" &&
    (typeof row.last_session_at === "string" || row.last_session_at === null)
  );
}

function toProgressMap(rows: unknown): ProgressMap {
  if (!Array.isArray(rows)) {
    return {};
  }

  return rows.reduce<ProgressMap>((map, row) => {
    if (isMasterclassProgressRow(row)) {
      map[row.embodiment_slug] = {
        session_count: row.session_count,
        last_session_at: row.last_session_at,
      };
    }
    return map;
  }, {});
}

export function useMasterclassProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const supabase = getSupabaseBrowserClient() as unknown as MasterclassSupabaseClient;
        const { data, error } = await supabase
          .from("masterclass_progress")
          .select("embodiment_slug, session_count, last_session_at");

        if (!cancelled && !error) {
          setProgress(toProgressMap(data));
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("[Masterclass] progress unavailable", error);
          setProgress({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const recordSession = useCallback(async (slug: string) => {
    try {
      const supabase = getSupabaseBrowserClient() as unknown as MasterclassSupabaseClient;
      const { data, error } = await supabase.rpc("upsert_masterclass_session", {
        p_embodiment_slug: slug,
      });

      if (!error && isMasterclassProgressRow(data)) {
        setProgress((prev) => ({
          ...prev,
          [slug]: {
            session_count: data.session_count,
            last_session_at: data.last_session_at,
          },
        }));
      }

      return { data, error };
    } catch (error) {
      console.warn("[Masterclass] progress record unavailable", error);
      return { data: null, error };
    }
  }, []);

  return { progress, loading, recordSession };
}
