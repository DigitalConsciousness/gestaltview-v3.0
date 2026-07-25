// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — Zustand store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Resume, ResumeSection } from '../lib/types';
import { nanoid } from 'nanoid';

interface ResumeStoreState {
  resume: Resume;
  selectedTemplate: string;
  isSaving: boolean;
  setTitle: (title: string) => void;
  addSection: (type: ResumeSection['type']) => void;
  updateSection: (id: string, patch: Partial<ResumeSection>) => void;
  removeSection: (id: string) => void;
  setSelectedTemplate: (t: string) => void;
  saveResume: () => Promise<void>;
  resetResume: () => void;
}

const DEFAULT_RESUME: Resume = {
  resumeId: nanoid(),
  title: 'My Resume',
  sections: [],
  lastModified: new Date().toISOString(),
};

export const useResumeStore = create<ResumeStoreState>()(
  persist(
    (set, get) => ({
      resume: DEFAULT_RESUME,
      selectedTemplate: 'modern',
      isSaving: false,

      setTitle: (title) =>
        set((s) => ({ resume: { ...s.resume, title } })),

      addSection: (type) =>
        set((s) => ({
          resume: {
            ...s.resume,
            sections: [
              ...s.resume.sections,
              { id: nanoid(), type, content: '' },
            ],
          },
        })),

      updateSection: (id, patch) =>
        set((s) => ({
          resume: {
            ...s.resume,
            sections: s.resume.sections.map((sec) =>
              sec.id === id ? { ...sec, ...patch } : sec
            ),
          },
        })),

      removeSection: (id) =>
        set((s) => ({
          resume: {
            ...s.resume,
            sections: s.resume.sections.filter((sec) => sec.id !== id),
          },
        })),

      setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),

      saveResume: async () => {
        set({ isSaving: true });
        try {
          const { resume } = get();
          await fetch('/api/modules/resume-rockstar/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume }),
          });
        } finally {
          set({ isSaving: false });
        }
      },

      resetResume: () =>
        set({ resume: { ...DEFAULT_RESUME, resumeId: nanoid() } }),
    }),
    { name: 'gv-resume-rockstar' }
  )
);
