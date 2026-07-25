// © 2026 Keith Soyka — GestaltView
// Symbio Coder — Zustand store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

interface CoderStoreState {
  code: string;
  language: string;
  sessionId: string;
  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  resetSession: () => void;
}

export const useCoderStore = create<CoderStoreState>()(
  persist(
    (set) => ({
      code: '',
      language: 'typescript',
      sessionId: nanoid(),
      setCode: (code) => set({ code }),
      setLanguage: (language) => set({ language }),
      resetSession: () => set({ code: '', sessionId: nanoid() }),
    }),
    { name: 'gv-symbio-coder' }
  )
);
