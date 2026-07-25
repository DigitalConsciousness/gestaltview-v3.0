import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../contexts/AuthContext';

/**
 * UpgradeBanner — a persistent soft nudge shown to anonymous/free users
 * that shows their remaining Billy queries and a gentle upgrade path.
 * Does NOT block anything. Sits at the top of the viewport.
 */
export function UpgradeBanner() {
  const { session } = useSession();
  const { tier, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const effectiveTier = useMemo(() => {
    if (isAuthenticated) {
      return tier;
    }
    return session.tier;
  }, [isAuthenticated, session.tier, tier]);

  if (session.isLoading || authLoading) return null;
  if (isAdmin) return null;
  if (!['anonymous', 'free'].includes(effectiveTier)) return null;
  if (dismissed) return null;

  const remaining = session.remaining;
  const isNearLimit = remaining <= 1 && remaining >= 0;
  const isAtLimit = session.isLimited;

  const message = isAtLimit
    ? "You've reached the end of the free tier. Unlock persistence and the full GestaltView experience."
    : isNearLimit
    ? `1 free-tier query remaining. Upgrade to keep the conversation going.`
    : `You're exploring GestaltView's free tier — ${remaining} of ${session.queryLimit} Billy queries available. It renders in the browser and does not persist your context. Sign in to unlock persistence.`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -48, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`
          w-full px-4 py-2.5 flex items-center justify-between gap-4
          text-xs font-medium z-50
          ${
            isAtLimit
              ? 'bg-indigo-600 text-white'
              : isNearLimit
              ? 'bg-amber-500/90 text-black'
              : 'bg-[#161b22] border-b border-[#30363d] text-gray-400'
          }
        `}
        role="status"
        aria-live="polite"
      >
        <span className="flex-1 text-center sm:text-left">{message}</span>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/pricing"
            className={`
              px-3 py-1 rounded-lg text-xs font-semibold transition-colors
              ${
                isAtLimit
                  ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                  : isNearLimit
                  ? 'bg-black/20 text-black hover:bg-black/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }
            `}
          >
            {isAtLimit ? 'Upgrade Now' : 'See Plans'}
          </a>

          {!isAtLimit && (
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
              className="text-current opacity-50 hover:opacity-100 transition-opacity text-base leading-none"
            >
              ×
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default UpgradeBanner;
