// © 2026 Keith Soyka — GestaltView
// Symbio Coder — Code Editor component
interface Props {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({ code, language, onChange }: Props) {
  return (
    <div className="flex-1 flex flex-col bg-[#0D1117] border-b border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-xs text-slate-500 ml-2">{language}</span>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 bg-transparent text-green-300 font-mono text-sm p-4 resize-none outline-none leading-relaxed"
        placeholder={`// Write your ${language} code here...`}
      />
    </div>
  );
}
