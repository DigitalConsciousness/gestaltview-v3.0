
import React, { useState } from 'react';
import { generateTextArtifact, generateImage, generateVideo } from '../services/geminiService';
import type { ArtifactType, Artifact, PersonalLanguageKey } from '../types';
import { SectionWrapper } from './SectionWrapper';

interface CreationCornerProps {
  plk: PersonalLanguageKey;
}

const artifactTypes: ArtifactType[] = ['story', 'pitchDeck', 'mindMap', 'image', 'video'];

export const CreationCorner: React.FC<CreationCornerProps> = ({ plk }) => {
  const [selectedType, setSelectedType] = useState<ArtifactType>('story');
  const [topic, setTopic] = useState('');
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setError(null);
    const newArtifact: Artifact = {
      type: selectedType,
      content: null,
      status: 'generating',
      filename: `${selectedType.toLowerCase()}_${Date.now()}`
    };
    setArtifact(newArtifact);

    try {
      let result: string;
      if (selectedType === 'image') {
        result = await generateImage(topic, plk);
      } else if (selectedType === 'video') {
        setArtifact({ ...newArtifact, status: 'polling' });
        result = await generateVideo(topic, plk);
      } else {
        result = await generateTextArtifact(topic, selectedType, plk);
      }
      setArtifact({ ...newArtifact, content: result, status: 'done' });
    } catch (err) {
      console.error('Artifact generation failed:', err);
      setError(`Failed to generate ${selectedType}. Please try another concept.`);
      setArtifact({ ...newArtifact, status: 'error' });
    }
  };

  const renderArtifactContent = () => {
    if (!artifact || !artifact.content) return null;

    switch (artifact.type) {
      case 'image':
        return <img src={artifact.content} alt={topic} className="rounded-lg max-w-full mx-auto" />;
      case 'video':
        return (
          <div>
            <p className="text-green-400 mb-2">Video generation complete!</p>
            <a href={artifact.content} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-block">
              Download Video
            </a>
            <p className="text-aurora-muted text-sm mt-2">Note: The link is temporary and may expire.</p>
          </div>
        );
      case 'mindMap':
        return <pre className="whitespace-pre-wrap text-aurora-primary font-mono text-sm">{artifact.content}</pre>;
      default:
        return <div className="whitespace-pre-wrap text-aurora-primary">{artifact.content}</div>;
    }
  };

  return (
    <SectionWrapper
      title="Creation Corner"
      subtitle="Transform consciousness into tangible artifacts through AI synthesis"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-aurora-secondary mb-3">
              1. Select Artifact Type
            </h3>
            <div className="flex flex-wrap gap-3">
              {artifactTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`capitalize px-4 py-2 rounded-lg border-2 transition-all duration-300 font-medium ${
                    selectedType === type 
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/50' 
                      : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-aurora-secondary mb-3">
              2. Provide Topic
            </h3>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your creative prompt..."
              className="w-full p-3 rounded-lg bg-slate-800/50 text-aurora-primary border-2 border-slate-700 focus:border-purple-500 focus:ring-purple-500 transition-colors"
            />
          </div>
          
          <button
            type="submit"
            disabled={artifact?.status === 'generating' || artifact?.status === 'polling' || !topic.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            {artifact?.status === 'generating' || artifact?.status === 'polling' ? 'Generating...' : 'Generate Artifact'}
          </button>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </form>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 min-h-[20rem] flex flex-col">
          <h3 className="text-xl font-semibold text-aurora-secondary mb-4 flex-shrink-0">
            Generated Artifact
          </h3>
          <div className="flex-grow overflow-y-auto">
            {artifact?.status === 'done' && renderArtifactContent()}
            {artifact?.status === 'generating' && (
              <p className="text-aurora-muted animate-pulse">Weaving your consciousness into a {selectedType}...</p>
            )}
            {artifact?.status === 'polling' && (
              <div className="text-aurora-muted animate-pulse">
                <p>Video generation initiated. This may take several minutes.</p>
                <p>Checking status periodically...</p>
              </div>
            )}
             {artifact?.status === 'error' && <p className="text-red-400">Generation failed. Your consciousness may be too profound for this medium.</p>}
            {artifact?.status === 'idle' || !artifact && <p className="text-aurora-muted">Your creation will appear here.</p>}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
