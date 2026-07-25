import React from 'react';

/**
 * Keith's Neural Aurora Gradient — full-screen animated background.
 * Drop inside any page as the first child.
 */
export function AuroraBackground() {
  return (
    <>
      <style>{`
        @keyframes aurora-shift {
          0%   { background-position: 0% 50%;   }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%;   }
        }
        @keyframes neural-float {
          0%, 100% { transform: translateY(0px) rotate(0deg);   opacity: 0.4; }
          33%       { transform: translateY(-20px) rotate(120deg); opacity: 0.8; }
          66%       { transform: translateY(10px) rotate(240deg);  opacity: 0.3; }
        }
        .aurora-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
          background: radial-gradient(ellipse at 20% 50%, rgba(120,40,200,0.18) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 80%, rgba(255,215,0,0.08) 0%, transparent 50%),
                      linear-gradient(135deg, #000011 0%, #001122 40%, #000033 70%, #110022 100%);
        }
        .aurora-layer {
          position: absolute; inset: -50%; width: 200%; height: 200%;
          background: linear-gradient(
            45deg,
            transparent 20%,
            rgba(0,212,255,0.04) 30%,
            rgba(153,69,255,0.06) 50%,
            rgba(0,255,212,0.04) 70%,
            transparent 80%
          );
          background-size: 400% 400%;
          animation: aurora-shift 15s ease infinite;
        }
        .aurora-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          animation: neural-float 8s ease-in-out infinite;
        }
        .orb-1 { width: 400px; height: 400px; top: -100px; left: -100px;  background: rgba(0,212,255,0.06);  animation-delay: 0s;   }
        .orb-2 { width: 300px; height: 300px; top: 40%;    right: -80px;   background: rgba(153,69,255,0.08); animation-delay: -3s;  }
        .orb-3 { width: 350px; height: 350px; bottom: -80px; left: 30%;    background: rgba(0,255,212,0.05);  animation-delay: -6s;  }
        .orb-4 { width: 200px; height: 200px; top: 60%;    left: 20%;      background: rgba(255,215,0,0.04);  animation-delay: -2s;  }
      `}</style>
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-layer" />
        <div className="aurora-orb orb-1" />
        <div className="aurora-orb orb-2" />
        <div className="aurora-orb orb-3" />
        <div className="aurora-orb orb-4" />
      </div>
    </>
  );
}

export default AuroraBackground;
