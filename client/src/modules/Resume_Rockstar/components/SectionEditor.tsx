// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — Section Editor component
import { useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import type { ResumeSection } from '../lib/types';

interface Props {
  activeSection: string | null;
  onSectionSelect: (id: string) => void;
}

const SECTION_TYPES: ResumeSection['type'][] = [
  'objective', 'experience', 'skills', 'education',
];

interface SectionScore {
  atsGrade: string;
  atsTotal: number | null;
  plkVoice: string;
  plkScore: number | null;
  atsDelta?: number;
  plkDelta?: number;
}

type SectionAction = 'score' | 'enhance';

interface SectionStatus {
  loading?: SectionAction;
  error?: string;
  score?: SectionScore;
}

async function postResumeEndpoint<T>(
  path: '/api/modules/resume-rockstar/analyze' | '/api/modules/resume-rockstar/enhance',
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload.error === 'string' ? payload.error : 'Resume Rockstar request failed';
    throw new Error(message);
  }

  return payload as T;
}

function toScore(payload: any, previous?: SectionScore): SectionScore {
  const ats = payload.atsAfter ?? payload.ats ?? {};
  const plk = payload.plkAfter ?? payload.plk ?? {};

  return {
    atsGrade: String(ats.grade ?? previous?.atsGrade ?? 'N/A'),
    atsTotal: typeof ats.total === 'number' ? ats.total : previous?.atsTotal ?? null,
    plkVoice: String(plk.voice ?? previous?.plkVoice ?? 'neutral'),
    plkScore: typeof plk.score === 'number' ? plk.score : previous?.plkScore ?? null,
    atsDelta: typeof payload.atsDelta === 'number' ? payload.atsDelta : previous?.atsDelta,
    plkDelta: typeof payload.plkDelta === 'number' ? payload.plkDelta : previous?.plkDelta,
  };
}

export default function SectionEditor({ activeSection, onSectionSelect }: Props) {
  const { resume, addSection, updateSection } = useResumeStore();
  const [sectionStatus, setSectionStatus] = useState<Record<string, SectionStatus>>({});

  const patchStatus = (sectionId: string, patch: SectionStatus) => {
    setSectionStatus((current) => ({
      ...current,
      [sectionId]: {
        ...current[sectionId],
        ...patch,
      },
    }));
  };

  const scoreSection = async (section: ResumeSection) => {
    patchStatus(section.id, { loading: 'score', error: undefined });

    try {
      const payload = await postResumeEndpoint<any>('/api/modules/resume-rockstar/analyze', {
        text: section.content,
        section: section.type,
      });

      patchStatus(section.id, {
        loading: undefined,
        score: toScore(payload, sectionStatus[section.id]?.score),
      });
    } catch (error) {
      patchStatus(section.id, {
        loading: undefined,
        error: error instanceof Error ? error.message : 'Unable to score this section.',
      });
    }
  };

  const enhanceSection = async (section: ResumeSection) => {
    patchStatus(section.id, { loading: 'enhance', error: undefined });

    try {
      const payload = await postResumeEndpoint<any>('/api/modules/resume-rockstar/enhance', {
        text: section.content,
        section: section.type,
      });

      if (typeof payload.enhanced !== 'string' || !payload.enhanced.trim()) {
        throw new Error('Enhancement returned no usable text.');
      }

      updateSection(section.id, { content: payload.enhanced });
      patchStatus(section.id, {
        loading: undefined,
        score: toScore(payload, sectionStatus[section.id]?.score),
      });
    } catch (error) {
      patchStatus(section.id, {
        loading: undefined,
        error: error instanceof Error ? error.message : 'Unable to enhance this section.',
      });
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Sections</h2>

      {/* Existing sections */}
      <div className="space-y-3 mb-6">
        {resume.sections.map((section) => {
          const status = sectionStatus[section.id] ?? {};
          const isActive = activeSection === section.id;
          const isBusy = Boolean(status.loading);
          const canRun = Boolean(section.content.trim()) && !isBusy;

          return (
            <div
              key={section.id}
              onClick={() => onSectionSelect(section.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm font-medium text-slate-300 capitalize">
                  {section.type}
                </span>
                <span className="text-xs text-slate-500">{section.id.slice(0, 8)}</span>
              </div>

              {status.score ? (
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 font-semibold text-emerald-100">
                    ATS {status.score.atsGrade}
                    {status.score.atsTotal !== null ? ` - ${status.score.atsTotal} pts` : ''}
                  </span>
                  <span className="rounded-md border border-sky-400/40 bg-sky-400/10 px-2 py-1 font-semibold text-sky-100">
                    PLK {status.score.plkVoice}
                    {status.score.plkScore !== null ? ` - ${status.score.plkScore} pts` : ''}
                  </span>
                  {typeof status.score.atsDelta === 'number' ? (
                    <span className="animate-pulse rounded-md bg-emerald-500/15 px-2 py-1 font-semibold text-emerald-200">
                      ATS {status.score.atsDelta >= 0 ? '+' : ''}{status.score.atsDelta} pts
                    </span>
                  ) : null}
                  {typeof status.score.plkDelta === 'number' ? (
                    <span className="animate-pulse rounded-md bg-sky-500/15 px-2 py-1 font-semibold text-sky-200">
                      PLK {status.score.plkDelta >= 0 ? '+' : ''}{status.score.plkDelta} pts
                    </span>
                  ) : null}
                </div>
              ) : null}

              {isActive ? (
                <textarea
                  className="w-full bg-transparent text-white text-sm resize-none outline-none"
                  rows={4}
                  value={section.content}
                  onChange={(e) => updateSection(section.id, { content: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="text-slate-400 text-sm truncate">
                  {section.content || 'Click to edit...'}
                </p>
              )}

              {status.error ? (
                <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                  {status.error}
                </p>
              ) : null}

              {isBusy ? (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-label={`${status.loading} loading`}>
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-300" />
                </div>
              ) : null}

              {isActive ? (
                <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => scoreSection(section)}
                    disabled={!canRun}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {status.loading === 'score' ? 'Scoring...' : 'Score'}
                  </button>
                  <button
                    type="button"
                    onClick={() => enhanceSection(section)}
                    disabled={!canRun}
                    className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/30 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {status.loading === 'enhance' ? 'Enhancing...' : 'Enhance'}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Add section buttons */}
      <div className="flex flex-wrap gap-2">
        {SECTION_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => addSection(type)}
            className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg transition-colors capitalize"
          >
            + {type}
          </button>
        ))}
      </div>
    </div>
  );
}
