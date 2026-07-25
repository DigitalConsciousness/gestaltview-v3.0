// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — Template Selector component
const TEMPLATES = ['modern', 'classic', 'minimalist', 'creative'];

interface Props {
  selected: string;
  onChange: (t: string) => void;
}

export default function TemplateSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TEMPLATES.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
            selected === t
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-slate-400 hover:bg-white/20'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
