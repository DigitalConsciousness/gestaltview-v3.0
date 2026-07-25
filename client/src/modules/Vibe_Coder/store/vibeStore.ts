// © 2026 Keith Soyka — GestaltView
// Vibe Coder — Zustand store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VibeProfile } from '../lib/types';

interface VibeStoreState {
  vibe: VibeProfile | null;
  isAnalyzing: boolean;
  analyzeVibe: (song: string, artist?: string) => Promise<void>;
  clearVibe: () => void;
}

export const useVibeStore = create<VibeStoreState>()(
  persist(
    (set) => ({
      vibe: null,
      isAnalyzing: false,

      analyzeVibe: async (song, artist) => {
        set({ isAnalyzing: true, vibe: null });
        try {
          const res = await fetch('/api/modules/vibe-coder/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song, artist }),
          });
          const data = await res.json();
          if (data.response) set({ vibe: data.response });
        } catch (err) {
          console.error('Vibe analysis failed:', err);
        } finally {
          set({ isAnalyzing: false });
        }
      },

      clearVibe: () => set({ vibe: null }),
    }),
    { name: 'gv-vibe-coder' }
  )
);
