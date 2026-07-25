// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — Section Preview component
import { useResumeStore } from '../store/resumeStore';

interface Props {
  template: string;
}

export default function SectionPreview({ template }: Props) {
  const { resume } = useResumeStore();

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-8">
      <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
      <div className="text-xs text-slate-500 mb-4 capitalize">Template: {template}</div>

      <div className="bg-white rounded-xl p-6 text-gray-800 min-h-[400px]">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {resume.title || 'Your Resume'}
        </h3>

        {resume.sections.length === 0 && (
          <p className="text-gray-400 text-sm italic">Add sections to see your preview...</p>
        )}

        {resume.sections.map((section) => (
          <div key={section.id} className="mb-4">
            <h4 className="font-semibold text-gray-700 capitalize border-b border-gray-200 pb-1 mb-2">
              {section.type}
            </h4>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">
              {section.content || '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
