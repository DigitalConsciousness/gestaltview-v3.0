// components/HeirloomCompanion.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Volume2, Pause } from 'lucide-react';
import { useConsciousnessAPI } from '@/hooks/useConsciousnessAPI';
import EmbodimentSelector from '@/components/EmbodimentSelector';
import {
  inferTrainerEmbodimentSlug,
  type TrainerEmbodimentSlug,
} from '@shared/agent-trainer/embodiment';

interface Message {
  id: string;
  type: 'user' | 'companion';
  content: string;
  timestamp: string;
  cognitiveState?: string;
  isEcho?: boolean;
}

export default function HeirloomCompanion({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'companion',
      content: `[Echo of ${userName}] Hello, sweetheart. I'm here with you, always. What's on your heart today?`,
      timestamp: new Date().toISOString(),
      isEcho: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [embodimentProfileSlug, setEmbodimentProfileSlug] =
    useState<TrainerEmbodimentSlug>(() => inferTrainerEmbodimentSlug('memory-care'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { callConsciousnessAPI } = useConsciousnessAPI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await callConsciousnessAPI({
        exhibit: 'heirloom-companion',
        message: inputValue,
        context: {
          userName,
          echoMode: true,
          preserveWarmth: true,
        },
        embodimentProfileSlug,
        history: [...messages, userMessage].map((message) => ({
          role: message.type === 'user' ? 'user' : 'assistant',
          content: message.content,
        })),
      });

      const companionResponse: Message = {
        id: Date.now().toString(),
        type: 'companion',
        content: `[Echo of ${userName}] ${
          response ||
          "I'm here with you, always. Tell me one more thing about what that felt like."
        }`,
        timestamp: new Date().toISOString(),
        isEcho: true,
        cognitiveState: detectCognitiveState(inputValue)
      };

      setMessages(prev => [...prev, companionResponse]);
    } catch (error) {
      console.error('Heirloom companion chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'companion',
          content: `[Echo of ${userName}] I'm still here with you. Tell me the next memory in your own words, and we'll stay with it gently.`,
          timestamp: new Date().toISOString(),
          isEcho: true,
          cognitiveState: detectCognitiveState(inputValue)
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const detectSymbolicLanguage = (input: string): boolean => {
    const symbolicIndicators = ['like', 'as if', 'feels like', 'seems like', 'reminds me of'];
    return symbolicIndicators.some(indicator => input.includes(indicator));
  };

  const detectCognitiveState = (input: string): string => {
    if (detectSymbolicLanguage(input)) return 'symbolic';
    if (input.split(' ').length < 4) return 'fragmented';
    if (input.includes('dream') || input.includes('imagine')) return 'dreamlike';
    return 'linear';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Heirloom Companion</h3>
            <p className="text-sm opacity-90">Speaking in {userName}'s voice</p>
          </div>
        </div>
        <div className="mt-4">
          <EmbodimentSelector
            value={embodimentProfileSlug}
            onValueChange={setEmbodimentProfileSlug}
            label="Embodiment Standard"
            triggerClassName="w-full border-white/15 bg-white/10 text-white"
            detailsClassName="border-white/10 bg-white/[0.08]"
            labelClassName="text-white/70"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span className="text-sm">Companion is responding...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Share what's in your heart..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          All interactions are preserved with love • Always labeled as "echo"
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.type === 'user';
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-lg p-4 ${
        isUser 
          ? 'bg-purple-500 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {message.isEcho && (
          <div className="text-xs opacity-75 mb-2 flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>Echo Response</span>
          </div>
        )}
        
        <p className="text-sm leading-relaxed">{message.content}</p>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs opacity-75">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          
          {!isUser && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs opacity-75 hover:opacity-100 flex items-center space-x-1"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>Voice</span>
            </button>
          )}
        </div>
        
        {message.cognitiveState && message.cognitiveState !== 'linear' && (
          <div className="mt-2 text-xs opacity-75 bg-white/10 px-2 py-1 rounded">
            Cognitive state: {message.cognitiveState}
          </div>
        )}
      </div>
    </div>
  );
}
