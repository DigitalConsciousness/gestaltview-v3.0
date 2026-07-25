// © 2026 Keith Soyka — GestaltView
// Symbio Coder — Main page
import { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import ChatSidebar from '../components/ChatSidebar';
import SuggestionPanel from '../components/SuggestionPanel';
import { useCoderStore } from '../store/coderStore';

export default function SymbioCoderMain() {
  const { code, language, setCode, setLanguage } = useCoderStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white">Symbio Coder</h1>
          <p className="text-slate-400 text-sm mt-0.5">AI code assistant with metaphor-driven explanations</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/10 border border-white/20 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none"
          >
            {['typescript', 'javascript', 'python', 'sql', 'bash', 'json'].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 text-sm rounded-lg transition-colors"
          >
            {sidebarOpen ? 'Hide Chat' : 'Show Chat'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main editor + suggestions */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CodeEditor code={code} language={language} onChange={setCode} />
          <SuggestionPanel />
        </div>

        {/* Chat sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-l border-white/10 flex-shrink-0">
            <ChatSidebar />
          </div>
        )}
      </div>
    </div>
  );
}
