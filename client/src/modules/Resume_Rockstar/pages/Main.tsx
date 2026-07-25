// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — Main page
import { useState } from 'react';
import SectionEditor from '../components/SectionEditor';
import SectionPreview from '../components/SectionPreview';
import TemplateSelector from '../components/TemplateSelector';
import ExportButton from '../components/ExportButton';
import { useResumeStore } from '../store/resumeStore';

export default function ResumeRockstarMain() {
  const { resume, selectedTemplate, setSelectedTemplate } = useResumeStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Resume Rockstar</h1>
            <p className="text-slate-400 mt-1">Craft your career narrative with AI-powered precision</p>
          </div>
          <ExportButton resumeId={resume.resumeId} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Section Editor */}
          <div className="lg:col-span-2 space-y-4">
            <TemplateSelector
              selected={selectedTemplate}
              onChange={setSelectedTemplate}
            />
            <SectionEditor
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
            />
          </div>

          {/* Right: Live Preview */}
          <div className="lg:col-span-1">
            <SectionPreview template={selectedTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}
