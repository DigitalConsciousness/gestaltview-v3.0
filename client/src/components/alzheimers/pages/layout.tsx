import React from 'react';
import { Heart, Home, BookOpen, Music, MessageCircle, Camera, Settings, type LucideIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userName: string;
  lastInteraction?: string;
}

export default function Layout({ children, userName, lastInteraction }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {userName}'s Legacy Garden
              </h1>
              <p className="text-sm text-gray-500 italic">Presence, Not Perfection</p>
            </div>
          </div>
          
          {lastInteraction && (
            <div className="text-sm text-gray-600">
              Last connection: {new Date(lastInteraction).toLocaleDateString()}
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-purple-100 px-6 py-3">
        <div className="flex items-center space-x-6 max-w-6xl mx-auto">
          <NavItem icon={Home} label="Home" active />
          <NavItem icon={MessageCircle} label="Companion" />
          <NavItem icon={BookOpen} label="Life Tapestry" />
          <NavItem icon={Music} label="Music Quest" />
          <NavItem icon={Camera} label="Bucket Drops" />
          <NavItem icon={Settings} label="Family Portal" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 px-6 py-8 mt-16">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p className="mb-2">
            Built with love by GestaltView • Preserving dignity through technology
          </p>
          <p className="text-sm text-gray-500">
            Every interaction is sacred • Your story matters • You are whole
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: { 
  icon: LucideIcon; 
  label: string; 
  active?: boolean; 
}) {
  return (
    <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-purple-100 text-purple-700' 
        : 'hover:bg-purple-50 text-gray-600 hover:text-purple-600'
    }`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
