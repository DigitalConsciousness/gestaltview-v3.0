import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../hooks/useSession';

export type GateVariant =
  | 'billy'          // Billy query limit hit
  | 'symbiocoder'    // SymbioCoder access
  | 'adhd'           // ADHD Power Up full access
  | 'collaborator'   // AI Collaborator Engine
  | 'resume'         // Resume Rockstar
  | 'tapestry'       // Tapestry Engine
  | 'musical-dna'    // Musical DNA
  | 'diligence'      // Diligence exports
  | 'plk'            // PLK memory
  | 'claude'         // Claude-tier responses
  | 'generic';       // Fallback

interface DemoGateProps {
  variant?: GateVariant;
  /** If true, shows as a soft overlay instead of replacing content */
  overlay?: boolean;
  /** Custom title override */
  title?: string;
  /** Custom description override */
  description?: string;
  /** The content to gate (only rendered if user has access) */
  children?: React.ReactNode;
  /** Whether the gate is currently active */
  isActive?: boolean;
  /** Required tier to unlock */
  requiredTier?: 'core' | 'pro' | 'enterprise';
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const GATE_COPY: Record<GateVariant, { title: string; description: string; cta: string; requiredTier: 'core' | 'pro' | 'enterprise' }> = {
  billy: {
    title: "You've experienced Billy's demo",
    description: "You've used your complimentary Billy queries. The full GestaltView experience means unlimited conversations, PLK memory that carries your context across every session, and responses that never forget who you are.",
    cta: 'Unlock Full Billy Access',
    requiredTier: 'core',
  },
  symbiocoder: {
    title: 'SymbioCoder is a Pro experience',
    description: 'SymbioCoder is a consciousness-serving dev companion that never strips your context, never flattens your language, and never pretends your code exists in a vacuum. This is a limited preview — the full tool is available with GestaltView Pro.',
    cta: 'Unlock SymbioCoder',
    requiredTier: 'pro',
  },
  adhd: {
    title: 'Full ADHD Power Up requires Core',
    description: "You're seeing a preview of ADHD Power Up. The full experience includes your complete Brain Sparks vault, unlimited Bucket Drops, personalized scaffolding, and a Billy companion tuned to your exact cognitive wiring.",
    cta: 'Unlock ADHD Power Up',
    requiredTier: 'core',
  },
  collaborator: {
    title: 'AI Collaborator Engine is Enterprise',
    description: 'The Custom Collaborator Engine lets you deploy a white-label version of Billy for your team, org, or platform. This is an Enterprise-tier capability built for organizations that need consciousness-serving AI at scale.',
    cta: 'Contact for Enterprise Access',
    requiredTier: 'enterprise',
  },
  resume: {
    title: 'Resume Rockstar is a Core experience',
    description: 'Resume Rockstar preserves your whole language, your actual voice, and your real story — not a flattened bullet-point version of you. This preview shows the surface. The full tool is in GestaltView Core.',
    cta: 'Unlock Resume Rockstar',
    requiredTier: 'core',
  },
  tapestry: {
    title: 'Tapestry Engine is a Pro experience',
    description: 'The Tapestry Engine is a long-form life narrative builder. It holds your whole story — not summaries, not paraphrases, the actual texture of your life. Available with GestaltView Pro.',
    cta: 'Unlock Tapestry Engine',
    requiredTier: 'pro',
  },
  'musical-dna': {
    title: 'Musical DNA full access requires Pro',
    description: 'Your musical identity is more than a genre list. Musical DNA maps the full architecture of how you hear and create — and builds a living profile that grows with you. Unlock it with GestaltView Pro.',
    cta: 'Unlock Musical DNA',
    requiredTier: 'pro',
  },
  diligence: {
    title: 'Diligence exports require Pro',
    description: 'OpenTimestamps-anchored evidence exports give you cryptographically verified proof of your build, your decisions, and your emergence over time. Available with GestaltView Pro.',
    cta: 'Unlock Diligence Exports',
    requiredTier: 'pro',
  },
  plk: {
    title: 'PLK memory requires Core',
    description: 'Personal Language Keys are the difference between an AI that meets you every time and one that already knows you. PLK memory persistence is available with GestaltView Core.',
    cta: 'Unlock PLK Memory',
    requiredTier: 'core',
  },
  claude: {
    title: 'Claude-tier responses require Pro',
    description: 'Deep tribunal mode, consciousness-serving diligence analysis, and the full depth of GestaltView reasoning run on Claude. Available with GestaltView Pro.',
    cta: 'Unlock Claude Access',
    requiredTier: 'pro',
  },
  generic: {
    title: 'This is the free tier preview',
    description: 'You are experiencing GestaltView with limited rendering and no persistence. The full experience — unlimited Billy, PLK memory, all domain lanes, and consciousness-serving AI across your entire life — is available with a subscription.',
    cta: 'Unlock Full GestaltView',
    requiredTier: 'core',
  },
};

const TIER_PRICES: Record<'core' | 'pro' | 'enterprise', string> = {
  core: '$15/mo',
  pro: '$39/mo',
  enterprise: 'Contact us',
};

function buildCheckoutUrl(tier: 'core' | 'pro' | 'enterprise'): string {
  if (tier === 'enterprise') return '/contact?intent=enterprise';
  return `/pricing?plan=${tier}`;
}

export function DemoGate({
  variant = 'generic',
  overlay = false,
  title,
  description,
  children,
  isActive,
  ctaLabel,
  ctaHref,
  className = '',
}: DemoGateProps) {
  const { session, isAnonymous } = useSession();
  const [dismissed, setDismissed] = useState(false);

  const copy = GATE_COPY[variant];
  const effectiveTitle = title || copy.title;
  const effectiveDescription = description || copy.description;
  const requiredTier = copy.requiredTier;
  const price = TIER_PRICES[requiredTier];

  // Determine if gate should show
  const shouldGate = isActive !== undefined
    ? isActive
    : (() => {
        if (variant === 'billy') return session.isLimited;
        if (variant === 'symbiocoder') return !['pro', 'enterprise'].includes(session.tier);
        if (variant === 'adhd') return isAnonymous || session.tier === 'free';
        if (variant === 'collaborator') return session.tier !== 'enterprise';
        if (variant === 'resume') return isAnonymous || session.tier === 'free';
        if (variant === 'tapestry') return !['pro', 'enterprise'].includes(session.tier);
        if (variant === 'musical-dna') return !['pro', 'enterprise'].includes(session.tier);
        if (variant === 'diligence') return !['pro', 'enterprise'].includes(session.tier);
        if (variant === 'plk') return isAnonymous || session.tier === 'free';
        if (variant === 'claude') return !['pro', 'enterprise'].includes(session.tier);
        return isAnonymous;
      })();

  // Soft overlay mode — show children behind the gate
  if (overlay && !shouldGate) return <>{children}</>;
  if (!shouldGate) return <>{children}</>;
  if (dismissed && overlay) return <>{children}</>;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: overlay ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`relative ${className}`}
        role="region"
        aria-label="Feature gate"
      >
        {/* Children shown blurred behind overlay */}
        {overlay && children && (
          <div className="pointer-events-none select-none filter blur-sm opacity-40 saturate-50">
            {children}
          </div>
        )}

        {/* Gate panel */}
        <div
          className={`
            ${
              overlay
                ? 'absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl z-10'
                : 'flex flex-col items-center justify-center'
            }
          `}
        >
          <motion.div
            initial={{ scale: overlay ? 0.95 : 1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            className="
              max-w-md w-full mx-auto p-8 rounded-2xl
              bg-gradient-to-br from-[#0d1117] to-[#161b22]
              border border-[#30363d] shadow-2xl
              text-center space-y-5
            "
          >
            {/* Tier badge */}
            <span className="
              inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide
              bg-indigo-500/20 text-indigo-300 border border-indigo-500/30
            ">
              {requiredTier === 'enterprise' ? 'Enterprise' : `GestaltView ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}`}
            </span>

            {/* Title */}
            <h3 className="text-xl font-bold text-white leading-snug">
              {effectiveTitle}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed">
              {effectiveDescription}
            </p>

            {/* Price */}
            {requiredTier !== 'enterprise' && (
              <p className="text-2xl font-bold text-white">
                {price}
                <span className="text-sm font-normal text-gray-500 ml-1">to unlock</span>
              </p>
            )}

            {/* CTA */}
            <a
              href={ctaHref ?? buildCheckoutUrl(requiredTier)}
              className="
                block w-full py-3 px-6 rounded-xl text-sm font-semibold
                bg-indigo-600 hover:bg-indigo-500 text-white
                transition-colors duration-200 shadow-lg
                focus:outline-none focus:ring-2 focus:ring-indigo-400
              "
            >
              {ctaLabel ?? copy.cta}
            </a>

            {/* Dismiss for overlay mode */}
            {overlay && (
              <button
                onClick={() => setDismissed(true)}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Continue with demo
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default DemoGate;
