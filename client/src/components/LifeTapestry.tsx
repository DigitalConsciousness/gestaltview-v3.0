// components/LifeTapestry.tsx
import React, { useState } from 'react';
import { Calendar, Heart, MapPin, Users, Camera, Plus, Edit3 } from 'lucide-react';

interface LifeThread {
  id: string;
  title: string;
  description: string;
  timePeriod: string;
  emotionalSignificance: number;
  memoryAnchors: string[];
  mediaCount: number;
  familyContributions: FamilyContribution[];
}

interface FamilyContribution {
  id: string;
  contributor: string;
  relationship: string;
  content: string;
  addedAt: string;
}

const sampleThreads: LifeThread[] = [
  {
    id: 'lt-1',
    title: 'Love Letters to Carl',
    description: '57 years of marriage, dancing through life together',
    timePeriod: '1965-2022',
    emotionalSignificance: 10,
    memoryAnchors: ['First dance to Moon River', 'Sunday morning coffee ritual', "Carl's humming while gardening"],
    mediaCount: 23,
    familyContributions: [
      {
        id: 'fc-1',
        contributor: 'Sarah',
        relationship: 'daughter',
        content: 'Mom and Dad still held hands watching TV every night, even after 50 years.',
        addedAt: '2024-01-15'
      }
    ]
  },
  {
    id: 'lt-2',
    title: "Maggie's Map",
    description: 'Places that mattered, from Iowa farm to grandchildren\'s homes',
    timePeriod: '1940-2024',
    emotionalSignificance: 8,
    memoryAnchors: ['Iowa family farm', 'First little apartment', 'The house where we raised our children'],
    mediaCount: 45,
    familyContributions: []
  }
];

export default function LifeTapestry() {
  const [selectedThread, setSelectedThread] = useState<LifeThread | null>(null);
  const [viewMode, setViewMode] = useState<'chronological' | 'emotional'>('chronological');

  const getEmotionalColor = (significance: number) => {
    if (significance >= 9) return 'from-red-400 to-pink-500';
    if (significance >= 7) return 'from-yellow-400 to-orange-500';
    if (significance >= 5) return 'from-blue-400 to-purple-500';
    return 'from-gray-400 to-gray-500';
  };

  const sortedThreads = [...sampleThreads].sort((a, b) => {
    if (viewMode === 'emotional') {
      return b.emotionalSignificance - a.emotionalSignificance;
    }
    return a.timePeriod.localeCompare(b.timePeriod);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Life Tapestry</h2>
              <p className="text-gray-600">Weaving together the threads of a beautiful life</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('chronological')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'chronological' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2 inline" />
                Chronological
              </button>
              <button
                onClick={() => setViewMode('emotional')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'emotional' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <Heart className="w-4 h-4 mr-2 inline" />
                Emotional
              </button>
            </div>
            
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Thread</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-semibold text-purple-600">{sampleThreads.length}</div>
            <div className="text-sm text-gray-600">Life Threads</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-semibold text-blue-600">
              {sampleThreads.reduce((acc, thread) => acc + thread.mediaCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Media Items</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-semibold text-green-600">
              {sampleThreads.reduce((acc, thread) => acc + thread.familyContributions.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Family Contributions</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-semibold text-orange-600">
              {Math.round(sampleThreads.reduce((acc, thread) => acc + thread.emotionalSignificance, 0) / sampleThreads.length * 10) / 10}
            </div>
            <div className="text-sm text-gray-600">Avg. Emotional Significance</div>
          </div>
        </div>
      </div>

      {/* Threads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedThreads.map((thread) => (
          <ThreadCard 
            key={thread.id} 
            thread={thread} 
            onSelect={() => setSelectedThread(thread)}
            getEmotionalColor={getEmotionalColor}
          />
        ))}
      </div>

      {/* Thread Detail Modal would go here */}
      {selectedThread && (
        <ThreadDetailModal 
          thread={selectedThread} 
          onClose={() => setSelectedThread(null)} 
        />
      )}
    </div>
  );
}

function ThreadCard({ 
  thread, 
  onSelect, 
  getEmotionalColor 
}: { 
  thread: LifeThread; 
  onSelect: () => void;
  getEmotionalColor: (significance: number) => string;
}) {
  return (
    <div 
      onClick={onSelect}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
    >
      <div className={`h-2 bg-gradient-to-r ${getEmotionalColor(thread.emotionalSignificance)}`} />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{thread.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{thread.description}</p>
          </div>
          
          <div className="flex flex-col items-center ml-4">
            <div className="text-xs text-gray-500 mb-1">Significance</div>
            <div className="w-12 h-12 rounded-full border-4 border-purple-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-purple-600">{thread.emotionalSignificance}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{thread.timePeriod}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Camera className="w-4 h-4 mr-2" />
            <span>{thread.mediaCount} photos & recordings</span>
          </div>
          
          {thread.familyContributions.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{thread.familyContributions.length} family contributions</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-2">Memory Anchors:</div>
          <div className="flex flex-wrap gap-2">
            {thread.memoryAnchors.slice(0, 2).map((anchor, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs"
              >
                {anchor}
              </span>
            ))}
            {thread.memoryAnchors.length > 2 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                +{thread.memoryAnchors.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadDetailModal({ thread, onClose }: { thread: LifeThread; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800">{thread.title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">{thread.description}</p>
        </div>
        
        <div className="p-6">
          {/* Thread details would be rendered here */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Memory Anchors</h3>
              <div className="space-y-2">
                {thread.memoryAnchors.map((anchor, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-800">{anchor}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {thread.familyContributions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Family Contributions</h3>
                <div className="space-y-3">
                  {thread.familyContributions.map((contribution) => (
                    <div key={contribution.id} className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-800">
                          {contribution.contributor} ({contribution.relationship})
                        </span>
                        <span className="text-sm text-green-600">
                          {new Date(contribution.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-green-700">{contribution.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
