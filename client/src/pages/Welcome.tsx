import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import type { UserTier } from '../contexts/AuthContext';
import BillyOnboardingPrompt from '@/components/BillyOnboardingPrompt';
import { useBillyRuntimeReadiness } from '@/hooks/useBillyRuntimeReadiness';

const TIER_WELCOME: Record<string, {
  headline: string;
  sub: string;
  firstStep: string;
  route: string;
  routeLabel: string;
}> = {
  core: {
    headline: "Welcome to GestaltView Core. Billy has already found the snacks and organized the receipts.",
    sub: "Your PLK memory is active. Your ADHD Power Up is unlocked. Resume Rockstar is ready. It is gloriously overbuilt, and it still knows how to help. Start with orientation, then let Billy carry you into the live rooms that matter.",
    firstStep: "Open orientation first, then let Billy take the next step with you.",
    route: '/orientation',
    routeLabel: 'Open orientation',
  },
  pro: {
    headline: "Welcome to GestaltView Pro. The platform has become a little theatrical, which is fair.",
    sub: "Every engine is open. SymbioCoder, layered responses, Tapestry Engine, Musical DNA, diligence exports — all of it, tuned to your language, your wiring, your story. Start with orientation, then move into Billy or the domain lane that matters most right now.",
    firstStep: "Begin with orientation, then step into Billy or the lane that actually needs your attention.",
    route: '/orientation',
    routeLabel: 'Open orientation',
  },
  enterprise: {
    headline: "Welcome to GestaltView Enterprise. Your deployment is ready.",
    sub: "Your enterprise environment is online. Start with orientation, then move into Billy or the workspace your team needs most right now.",
    firstStep: "Start with orientation so the platform shape is clear, then open Billy for direct guidance.",
    route: '/orientation',
    routeLabel: 'Open orientation',
  },
  free: {
    headline: "Welcome to GestaltView. The door is open and the lights are, against all odds, on.",
    sub: "You're in. Start with orientation to see the live rooms, then let Billy guide you when you're ready. It is a little absurd that this all works, and yet it does.",
    firstStep: "Open the orientation first, then say hi to Billy.",
    route: '/orientation',
    routeLabel: 'Open orientation',
  },
};

const TIER_UNLOCKED: Record<string, string[]> = {
  core: [
    'Unlimited Billy conversations',
    'PLK memory — Billy remembers you across every session',
    'ADHD Power Up — full Brain Sparks vault + Bucket Drops',
    'Resume Rockstar — your voice, preserved',
    '2 domain lanes unlocked',
  ],
  pro: [
    'Everything in Core',
    'SymbioCoder — full access',
    'Claude-tier deep responses',
    'All 6 domain lanes',
    'Tapestry Engine + Musical DNA',
    'OpenTimestamps diligence exports',
  ],
  enterprise: [
    'Everything in Pro',
    'Collaborator Engine — white-label deployment',
    'Custom PLK training for your team',
    'Dedicated integration support',
  ],
};

export default function Welcome() {
  const { profile, refreshProfile, isLoading } = useAuth();
  const runtimeReady = useBillyRuntimeReadiness();
  const [sessionVerified, setSessionVerified] = useState(false);

  const sessionId = new URLSearchParams(window.location.search).get('session_id');
  const tier: UserTier = (profile?.tier as UserTier) || 'free';
  const copy = TIER_WELCOME[tier] || TIER_WELCOME.free;
  const unlocked = TIER_UNLOCKED[tier] || [];

  useEffect(() => {
    // Refresh profile to get updated tier from Stripe webhook
    const verifyAndRefresh = async () => {
      if (sessionId) {
        // Give webhook ~2s to process before refreshing
        await new Promise((r) => setTimeout(r, 2000));
        await refreshProfile();
        setSessionVerified(true);
      } else {
        setSessionVerified(true);
      }
    };
    verifyAndRefresh();
  }, [sessionId, refreshProfile]);

  if (isLoading || !sessionVerified) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="text-indigo-400 text-lg font-medium"
        >
          The Tribunal is reviewing this. Standard processing time: one moment.
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-10 text-center">

        {/* Tier badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {tier === 'core' ? 'GestaltView Core'
              : tier === 'pro' ? 'GestaltView Pro'
              : tier === 'enterprise' ? 'Enterprise'
              : 'GestaltView'}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            {copy.headline}
          </h1>
          <p className="text-gray-400 leading-relaxed">{copy.sub}</p>
        </motion.div>

        {/* Unlocked features */}
        {unlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-2xl bg-[#161b22] border border-[#30363d] p-6 text-left space-y-3"
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Now unlocked</p>
            <ul className="space-y-2">
              {unlocked.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex flex-wrap items-center gap-3"
        >
          <BillyOnboardingPrompt
            mode="default"
            openLabel="Open Billy tour"
            className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-200/16"
            autoOpen={runtimeReady}
          />
          <a
            href="/welcome?tour=new-year"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-300/16"
          >
            New Year tour
          </a>
        </motion.div>

        {/* First step */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-500">{copy.firstStep}</p>
          <a
            href={copy.route}
            className="inline-block w-full py-4 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-colors shadow-lg shadow-indigo-500/20"
          >
            {copy.routeLabel} →
          </a>
          <a href="/" className="block text-xs text-gray-600 hover:text-gray-400 transition-colors">
            Explore the platform first
          </a>
          <a href="/dashboard" className="block text-xs text-indigo-300 hover:text-indigo-200 transition-colors">
            Open your Manifest
          </a>
        </motion.div>

      </div>
    </div>
  );
}
