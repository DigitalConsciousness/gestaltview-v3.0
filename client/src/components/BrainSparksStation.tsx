// © 2026 Keith Soyka — GestaltView
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useBillySection } from '@/components/Billy';
import BillyChip from '@/components/BillyChip';
import { useSEO, PAGE_SEO } from '@/hooks/useSEO';

interface PlkPattern {
  pattern: string;
  description: string;
  resonance: number;
}

export default function BrainSparksStation() {
  useSEO(PAGE_SEO.brainSparksStation);
  const billyRef = useBillySection('brain-sparks-station');

  const [currentSpark, setCurrentSpark] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [thoughtInput, setThoughtInput] = useState('');
  const [showVisualization, setShowVisualization] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [displayedPatterns, setDisplayedPatterns] = useState<PlkPattern[]>([]);
  const [showEvolution, setShowEvolution] = useState(false);
  const [stats, setStats] = useState({
    thoughtsProcessed: 2847329,
    patternsIdentified: 847239,
    connectionsMade: 15847293,
    sparksCaptured: 1847,
  });
  const thoughtInputRef = useRef<HTMLTextAreaElement>(null);

  const plkPatterns: PlkPattern[] = [
    { pattern: 'Insight Genesis', description: 'The moment a new understanding is born', resonance: 0.95 },
    { pattern: 'Connection Cascade', description: 'When one thought triggers many others', resonance: 0.87 },
    { pattern: 'Breakthrough Moment', description: 'Sudden clarity after struggle', resonance: 0.92 },
    { pattern: 'Integration Wave', description: 'Multiple insights combining into wisdom', resonance: 0.89 },
  ];
  const processingStages = ['capturing', 'analyzing', 'connecting', 'integrating', 'complete'];

  useEffect(() => {
    const bg = document.getElementById('electricBackground');
    if (bg && bg.children.length === 0) {
      for (let i = 0; i < 15; i++) {
        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt';
        bolt.style.left = `${Math.random() * 100}%`;
        bolt.style.height = `${Math.random() * 200 + 100}px`;
        bolt.style.animationDelay = `${Math.random() * 3}s`;
        bolt.style.animationDuration = `${Math.random() * 2 + 2}s`;
        bg.appendChild(bolt);
      }
    }
    const network = document.getElementById('neuralNetwork');
    if (network && network.children.length === 0) {
      for (let i = 0; i < 40; i++) {
        const node = document.createElement('div');
        node.className = 'neural-node';
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        node.style.animationDelay = `${Math.random() * 3}s`;
        network.appendChild(node);
      }
    }
    thoughtInputRef.current?.focus();
  }, []);

  const usePrompt = (prompt: string) => {
    setThoughtInput(prompt);
    thoughtInputRef.current?.focus();
  };

  const captureThought = async () => {
    if (isProcessing || !thoughtInput.trim()) return;
    setIsProcessing(true);
    setCurrentSpark(thoughtInput);
    setShowVisualization(true);
    setActiveStage(-1);
    setDisplayedPatterns([]);
    setShowEvolution(false);
    for (let i = 0; i < processingStages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setActiveStage(i);
    }
    let tempPatterns: PlkPattern[] = [];
    for (const pattern of plkPatterns) {
      tempPatterns = [...tempPatterns, pattern];
      setDisplayedPatterns([...tempPatterns]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    setShowEvolution(true);
    setStats(prev => ({
      thoughtsProcessed: prev.thoughtsProcessed + Math.floor(Math.random() * 10) + 1,
      patternsIdentified: prev.patternsIdentified + Math.floor(Math.random() * 5) + 1,
      connectionsMade: prev.connectionsMade + Math.floor(Math.random() * 20) + 1,
      sparksCaptured: prev.sparksCaptured + 1,
    }));
    setIsProcessing(false);
  };

  const exportSpark = () => {
    if (!currentSpark) return alert('No spark to export! Capture a thought first.');
    const sparkData = { thought: currentSpark, timestamp: new Date().toISOString(), patterns: plkPatterns.slice(0, 2), station: 'Brain Sparks Station' };
    const dataStr = JSON.stringify(sparkData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url; link.download = 'brain-spark.json'; link.click();
    URL.revokeObjectURL(url);
  };

  const shareSpark = () => {
    if (!currentSpark) return alert('No spark to share! Capture a thought first.');
    const shareText = `I just captured a lightning bolt thought at the Brain Sparks Station: "${currentSpark}" - Experience Keith's consciousness-serving AI at GestaltView!`;
    if (navigator.share) {
      navigator.share({ title: 'Brain Sparks Station', text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText).then(() => alert('Spark copied to clipboard!'));
    }
  };

  return (
    <>
      <style>{`
        :root{--electric-blue:#00D4FF;--electric-gold:#FFD700;--electric-purple:#9945FF;--electric-cyan:#00FFD4;--lightning-white:#FFFFFF;--spark-orange:#FF8C00}
        .electric-bg{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
        .lightning-bolt{position:absolute;width:2px;background:linear-gradient(to bottom,var(--electric-blue),var(--electric-cyan),var(--lightning-white));opacity:0;animation:lightning 3s infinite;box-shadow:0 0 10px var(--electric-blue)}
        @keyframes lightning{0%{opacity:0;transform:scaleY(0)}10%{opacity:1;transform:scaleY(1)}20%{opacity:0;transform:scaleY(1)}100%{opacity:0}}
        .neural-network{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.3}
        .neural-node{position:absolute;width:4px;height:4px;background:var(--electric-purple);border-radius:50%;animation:neural-pulse 3s infinite ease-in-out}
        @keyframes neural-pulse{0%,100%{opacity:0.2;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
        .station-container{max-width:1200px;margin:0 auto;padding:32px 16px;position:relative;z-index:1}
        .capture-interface{background:rgba(0,17,34,0.8);border:2px solid var(--electric-blue);border-radius:12px;padding:32px;margin:60px 0;backdrop-filter:blur(10px);box-shadow:0 0 50px rgba(0,212,255,0.3)}
        .thought-input{width:100%;padding:16px;font-size:16px;background:rgba(0,0,0,0.6);border:2px solid var(--electric-blue);border-radius:8px;color:var(--lightning-white);margin-bottom:16px;box-sizing:border-box;font-family:inherit}
        .demo-prompts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:24px}
        .demo-prompt{background:rgba(153,69,255,0.2);border:1px solid var(--electric-purple);color:var(--electric-purple);padding:6px 12px;border-radius:9999px;font-size:12px;cursor:pointer;transition:all 250ms ease}
        .demo-prompt:hover{background:rgba(153,69,255,0.4)}
        .capture-button{display:block;width:100%;padding:16px 24px;background:linear-gradient(135deg,var(--electric-blue),var(--electric-purple));border:none;border-radius:8px;color:var(--lightning-white);font-size:16px;font-weight:600;cursor:pointer;transition:all 250ms ease}
        .capture-button.processing{background:linear-gradient(135deg,var(--electric-gold),var(--spark-orange))}
        .plk-visualization{background:rgba(0,17,34,0.6);border:1px solid var(--electric-cyan);border-radius:12px;padding:24px;margin:32px 0;backdrop-filter:blur(10px)}
        .processing-stage{display:flex;align-items:center;padding:12px;background:rgba(0,0,0,0.4);border-radius:8px;border-left:4px solid var(--electric-blue);opacity:0.3;transition:all 250ms ease;margin-bottom:8px}
        .processing-stage.active{opacity:1;border-left-color:var(--electric-gold);background:rgba(255,215,0,0.1)}
        .pattern-display{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-top:24px}
        .pattern-card{background:rgba(0,0,0,0.4);border:1px solid var(--electric-purple);border-radius:8px;padding:16px;transition:all 0.5s ease}
        .pattern-card.matched{border-color:var(--electric-gold);background:rgba(255,215,0,0.1);transform:scale(1.02)}
        .resonance-bar{width:100%;height:8px;background:rgba(255,255,255,0.2);border-radius:6px;overflow:hidden;margin-top:8px}
        .resonance-fill{height:100%;background:linear-gradient(90deg,var(--electric-blue),var(--electric-gold));transition:width 2s ease-out}
        .thought-evolution{margin-top:24px;padding:20px;background:rgba(0,0,0,0.4);border-radius:8px;border:1px solid var(--electric-cyan)}
        .captured-thought{background:rgba(255,215,0,0.1);border:1px solid var(--electric-gold);border-radius:8px;padding:16px;margin-top:16px;color:var(--electric-gold);font-style:italic}
        .export-section{text-align:center;margin-top:32px}
        .export-button{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:rgba(0,255,212,0.2);border:1px solid var(--electric-cyan);border-radius:8px;color:var(--electric-cyan);cursor:pointer;transition:all 250ms ease;margin:0 8px}
        .stats-section{background:rgba(0,17,34,0.6);border:1px solid var(--electric-cyan);border-radius:12px;padding:32px;margin:80px 0;backdrop-filter:blur(10px)}
        .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));text-align:center;gap:16px}
        .stat-number{font-size:24px;font-weight:600;color:var(--electric-gold);display:block}
        .stat-label{color:var(--electric-cyan);text-transform:uppercase;font-size:12px;display:block}
        .connection-card{background:rgba(0,17,34,0.8);border:1px solid var(--electric-purple);border-radius:12px;padding:24px;transition:all 250ms ease;cursor:pointer}
        .connection-card:hover{border-color:var(--electric-gold)}
      `}</style>

      <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at center,#001122 0%,#000011 50%,#000000 100%)', color: 'var(--electric-blue)' }}>
        <NavBar />
        <div className="electric-bg" id="electricBackground" />
        <div className="neural-network" id="neuralNetwork" />

        <div ref={billyRef} className="station-container">
          {/* Back nav + Billy */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/brain-sparks">
              <a className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                <ArrowLeft size={16} /> Back to Brain Sparks
              </a>
            </Link>
            <BillyChip context="brain-sparks-station" />
          </div>

          <section style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 600, marginBottom: '16px', background: 'linear-gradient(135deg,var(--electric-gold),var(--electric-blue),var(--electric-purple))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Brain Sparks Station
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--electric-cyan)', opacity: 0.9 }}>Experience Keith&apos;s lightning bolt thought capture system</p>
            <p style={{ fontSize: '16px', color: 'var(--electric-gold)', fontStyle: 'italic', marginBottom: '32px' }}>Where consciousness meets technology</p>
          </section>

          <section className="capture-interface">
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--electric-gold)', textAlign: 'center', marginBottom: '24px' }}>⚡ Capture Your Lightning Bolt Thought ⚡</h2>
            <textarea
              ref={thoughtInputRef}
              value={thoughtInput}
              onChange={e => setThoughtInput(e.target.value)}
              className="thought-input"
              placeholder="Enter your lightning bolt thought here..."
              rows={3}
            />
            <div className="demo-prompts">
              <span className="demo-prompt" onClick={() => usePrompt('What if consciousness could be mapped?')}>What if consciousness could be mapped?</span>
              <span className="demo-prompt" onClick={() => usePrompt('How do we capture lightning bolt insights?')}>How do we capture lightning bolt insights?</span>
              <span className="demo-prompt" onClick={() => usePrompt('What if AI could truly understand you?')}>What if AI could truly understand you?</span>
            </div>
            <button className={`capture-button${isProcessing ? ' processing' : ''}`} onClick={captureThought} disabled={isProcessing}>
              {isProcessing ? '⚡ Processing... ⚡' : currentSpark ? '⚡ Capture Another Spark ⚡' : '⚡ Capture Spark ⚡'}
            </button>
          </section>

          {showVisualization && (
            <section className="plk-visualization">
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--electric-cyan)', textAlign: 'center' }}>🧠 PLK Pattern Analysis 🧠</h3>
              <div>
                {processingStages.map((stage, i) => (
                  <div key={stage} className={`processing-stage${activeStage >= i ? ' active' : ''}`}>
                    <span>⚡</span>
                    <span style={{ marginLeft: '8px' }}>{stage.charAt(0).toUpperCase() + stage.slice(1)}...</span>
                  </div>
                ))}
              </div>
              <div className="pattern-display">
                {displayedPatterns.map((pattern, i) => (
                  <div key={i} className="pattern-card matched">
                    <div style={{ fontWeight: 600, color: 'var(--electric-gold)' }}>{pattern.pattern}</div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{pattern.description}</p>
                    <div className="resonance-bar">
                      <div className="resonance-fill" style={{ width: `${pattern.resonance * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {showEvolution && (
                <div className="thought-evolution">
                  <h4 style={{ color: 'var(--electric-cyan)', fontWeight: 600 }}>💫 Thought Evolution Pathway 💫</h4>
                  <div className="captured-thought">
                    <strong>Original Spark:</strong> &quot;{currentSpark}&quot;<br /><br />
                    <strong>PLK Integration:</strong> Your thought has been mapped to {Math.floor(Math.random() * 5) + 2} knowledge patterns.
                  </div>
                </div>
              )}
              <div className="export-section">
                <button className="export-button" onClick={exportSpark}>📤 Export Spark</button>
                <button className="export-button" onClick={shareSpark}>🔗 Share Spark</button>
              </div>
            </section>
          )}

          <section className="stats-section">
            <h2 style={{ color: 'var(--electric-cyan)', fontSize: '24px', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>Live System Stats</h2>
            <div className="stats-grid">
              <div><span className="stat-number">{stats.thoughtsProcessed.toLocaleString()}</span><span className="stat-label">Thoughts Processed</span></div>
              <div><span className="stat-number">{stats.patternsIdentified.toLocaleString()}</span><span className="stat-label">Patterns Identified</span></div>
              <div><span className="stat-number">{stats.connectionsMade.toLocaleString()}</span><span className="stat-label">Connections Made</span></div>
              <div><span className="stat-number">{stats.sparksCaptured.toLocaleString()}</span><span className="stat-label">Sparks Today</span></div>
            </div>
          </section>

          <section style={{ marginBottom: '80px' }}>
            <h2 style={{ color: 'var(--electric-purple)', fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Continue Your Journey</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '24px' }}>
              <Link href="/adhd-powerup">
                <a className="connection-card" style={{ display: 'block', textDecoration: 'none' }}>
                  <h3 style={{ color: 'var(--electric-gold)', marginBottom: '8px' }}>ADHD PowerUp Station</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)' }}>See how Brain Sparks powers ADHD task orchestration</p>
                </a>
              </Link>
              <Link href="/village-builders">
                <a className="connection-card" style={{ display: 'block', textDecoration: 'none' }}>
                  <h3 style={{ color: 'var(--electric-gold)', marginBottom: '8px' }}>Village Builders Covenant</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)' }}>Understand the consciousness framework behind the sparks</p>
                </a>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
