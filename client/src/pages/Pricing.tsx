// (c) 2026 Keith Soyka -- GestaltView
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { readBillingPlanFromSearch } from '@/lib/billing';
import FloatingEmbers from '../components/FloatingEmbers';
import FogOverlay from '../components/FogOverlay';

type Interval = 'monthly' | 'annual';
type Plan = 'core' | 'pro' | 'enterprise';

interface PricingTier {
  id: Plan;
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  annualMonthly: number | null;
  color: string;
  borderColor: string;
  badge?: string;
  features: string[];
  notIncluded?: string[];
  cta: string;
  ctaSecondary?: string;
}

interface CheckoutResponse {
  url?: string;
  sessionId?: string;
  error?: string;
  validPlans?: string[];
}

const FREE_TIER_FEATURES = [
  'Limited rendering only',
  'No persistence or saved context',
  '3 Billy queries to explore the surface',
  'No account required',
];

const TIERS: PricingTier[] = [
  {
    id: 'core',
    name: 'GestaltView Core',
    tagline: 'The foundation. Billy remembers who you are.',
    monthlyPrice: 15,
    annualPrice: 144,
    annualMonthly: 12,
    color: 'from-violet-600/20 to-indigo-600/20',
    borderColor: 'border-violet-500/30',
    features: [
      'Unlimited Billy conversations',
      'PLK memory -- Billy carries your context across every session',
      'ADHD Power Up -- full Brain Sparks vault + unlimited Bucket Drops',
      'Resume Rockstar -- your voice, your words, never flattened',
      '2 domain lanes (ADHD + 1 of your choice)',
      'Personalized cognitive scaffolding',
      'GestaltView mobile-responsive experience',
    ],
    notIncluded: [
      'SymbioCoder',
      'Claude-tier deep responses',
      'Diligence exports',
      'Musical DNA full access',
      'Tapestry Engine',
    ],
    cta: 'Start with Core',
  },
  {
    id: 'pro',
    name: 'GestaltView Pro',
    tagline: 'The full depth. Every engine, every lane, Claude-tier thinking.',
    monthlyPrice: 39,
    annualPrice: 372,
    annualMonthly: 31,
    color: 'from-indigo-600/30 to-cyan-600/20',
    borderColor: 'border-indigo-400/50',
    badge: 'Most Complete',
    features: [
      'Everything in Core',
      'SymbioCoder -- dev guide that never strips your context',
      'Claude-tier responses for deep, tribunal-level thinking',
      "All domain lanes (ADHD, Recovery, Alzheimer's Legacy, Musical DNA, Portfolio, Ethics)",
      'Tapestry Engine -- long-form life narrative builder',
      'Musical DNA -- full architecture of how you hear and create',
      'OpenTimestamps diligence exports -- cryptographic proof of your build',
      'Advanced PLK memory with cross-session pattern recognition',
    ],
    cta: 'Start with Pro',
    ctaSecondary: 'Most popular for solo founders and neurodivergent creators',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'White-label Billy for your team, org, or platform.',
    monthlyPrice: null,
    annualPrice: null,
    annualMonthly: null,
    color: 'from-amber-600/20 to-orange-600/10',
    borderColor: 'border-amber-500/30',
    features: [
      'Everything in Pro',
      'Collaborator Engine -- custom Billy for your organization',
      'White-label deployment with your brand',
      "Custom PLK training on your team's language and context",
      'Dedicated onboarding and integration support',
      'Custom domain lanes built for your use case',
      'SLA, security review, and enterprise billing',
    ],
    cta: 'Contact for Enterprise',
  },
];

const FAQS = [
  {
    q: 'What makes GestaltView different from ChatGPT or Claude?',
    a: "Those tools meet you from scratch every time. GestaltView builds a living model of who you are -- your language patterns, your cognitive wiring, your history -- and carries it forward. Billy doesn't summarize you. Billy holds you whole.",
  },
  {
    q: 'What is PLK memory?',
    a: 'PLK stands for Personal Language Keys -- the specific words, phrases, and patterns that are uniquely yours. Instead of paraphrasing what you say, GestaltView preserves your exact language and uses it as the foundation of every conversation, every output, every response.',
  },
  {
    q: 'I have ADHD. Will this actually work for me?',
    a: "GestaltView was built by a founder with ADHD, for people whose brains work differently. Bucket Drops let you offload overwhelm instantly. Brain Sparks capture your ideas before they vanish. The whole system is designed around how you actually think -- not how you're supposed to.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, always. No gotchas, no dark patterns. Cancel from your account settings and your access continues until the end of the billing period.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your PLK profile, conversation history, and all your stored context remain in your account for 90 days after cancellation. You can export everything at any time.',
  },
  {
    q: 'Is there a free tier?',
    a: 'Yes. The free tier gives you limited rendering and no persistence, plus 3 Billy queries so you can preview the experience without creating an account. Core adds memory and persistence, while Pro unlocks the full surface.',
  },
];

async function parseCheckoutResponse(res: Response): Promise<CheckoutResponse> {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return (await res.json()) as CheckoutResponse;
  }

  const text = await res.text();
  return {
    error: text.trim() || 'Checkout returned a non-JSON response.',
  };
}

function PricingCard({
  tier,
  interval,
  isLoading,
  onSelect,
}: {
  tier: PricingTier;
  interval: Interval;
  isLoading: boolean;
  onSelect: (plan: Plan) => void;
}) {
  const price =
    tier.monthlyPrice === null
      ? null
      : interval === 'annual'
        ? tier.annualMonthly
        : tier.monthlyPrice;

  const savings =
    tier.monthlyPrice && tier.annualMonthly
      ? Math.round(((tier.monthlyPrice - tier.annualMonthly) / tier.monthlyPrice) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={[
        'relative flex flex-col rounded-2xl border p-8 gap-6 backdrop-blur-sm',
        'bg-gradient-to-br',
        tier.color,
        tier.borderColor,
        tier.badge ? 'ring-2 ring-indigo-400/40 shadow-xl shadow-indigo-500/10' : '',
      ].join(' ')}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white shadow">
            {tier.badge}
          </span>
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-white">{tier.name}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{tier.tagline}</p>
      </div>

      <div className="space-y-1">
        {price !== null ? (
          <>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black text-white">${price}</span>
              <span className="text-gray-400 text-sm mb-1">/mo</span>
            </div>
            {interval === 'annual' && savings > 0 && (
              <p className="text-xs text-emerald-400 font-medium">
                Save {savings}% -- billed ${tier.annualPrice}/yr
              </p>
            )}
            {interval === 'monthly' && tier.annualMonthly && (
              <p className="text-xs text-gray-500">
                or ${tier.annualMonthly}/mo billed annually
              </p>
            )}
          </>
        ) : (
          <div className="text-2xl font-bold text-white">Custom pricing</div>
        )}
      </div>

      <button
        onClick={() => onSelect(tier.id)}
        disabled={isLoading}
        className={[
          'w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          tier.id === 'pro'
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            : tier.id === 'enterprise'
              ? 'bg-amber-600/80 hover:bg-amber-500 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
        ].join(' ')}
      >
        {isLoading ? 'Loading...' : tier.cta}
      </button>

      {tier.ctaSecondary && (
        <p className="text-center text-xs text-gray-500 -mt-3">{tier.ctaSecondary}</p>
      )}

      <ul className="space-y-2.5 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-emerald-400 mt-0.5 shrink-0">+</span>
            {feature}
          </li>
        ))}
        {tier.notIncluded?.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="mt-0.5 shrink-0">-</span>
            {feature}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function Pricing() {
  const [interval, setInterval] = useState<Interval>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, getAuthHeader } = useAuth();
  const preferredPlan =
    typeof window === 'undefined' ? null : readBillingPlanFromSearch(window.location.search);

  useEffect(() => {
    if (!document.getElementById('cabin-sketch-font')) {
      const cabinLink = document.createElement('link');
      cabinLink.id = 'cabin-sketch-font';
      cabinLink.rel = 'stylesheet';
      cabinLink.href = 'https://fonts.googleapis.com/css2?family=Cabin+Sketch:wght@400;700&display=swap';
      document.head.appendChild(cabinLink);
    }

    if (!document.getElementById('geist-font')) {
      const geistLink = document.createElement('link');
      geistLink.id = 'geist-font';
      geistLink.rel = 'stylesheet';
      geistLink.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap';
      document.head.appendChild(geistLink);
    }
  }, []);

  const handleSelect = async (plan: Plan) => {
    if (plan === 'enterprise') {
      window.location.href = '/contact?intent=enterprise';
      return;
    }

    setLoadingPlan(plan);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          plan,
          interval,
          email: user?.email || undefined,
          successUrl: `${window.location.origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const data = await parseCheckoutResponse(res);

      if (!res.ok) {
        const message = data.error || 'Something went wrong starting checkout. Please try again.';
        console.error('Checkout error response:', { status: res.status, data });
        alert(message);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      console.error('Checkout response missing redirect URL:', data);
      alert(data.error || 'Something went wrong starting checkout. Please try again.');
    } catch (err: unknown) {
      console.error('Checkout fetch error:', err);
      alert('Unable to reach checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const canceled = new URLSearchParams(window.location.search).get('canceled');

  return (
    <main className="relative min-h-screen overflow-hidden bg-gv-bg-void text-gv-text-primary">
      <FloatingEmbers
        colors={['#00E5FF', '#B026FF', '#FF007F', '#00FF66', '#FFD700']}
        count={12}
        intervalMs={900}
        sizeRange={[2, 4]}
        durationRange={[16, 30]}
        driftRange={14}
      />
      <FogOverlay />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.08),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(176,38,255,0.08),transparent_28%)]" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-20 px-4 py-20">
        {canceled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-4 text-center text-sm text-yellow-300"
          >
            No worries -- you can come back whenever you are ready. Your free-tier queries are still available.
          </motion.div>
        )}

        <div className="text-center space-y-5 max-w-2xl mx-auto">
          {preferredPlan ? (
            <div className="mx-auto inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">
              Plan preset: {preferredPlan}
            </div>
          ) : null}
          <h1
            className="text-4xl sm:text-5xl font-black leading-tight text-white"
            style={{ fontFamily: "'Cabin Sketch', cursive", letterSpacing: '0.01em' }}
          >
            The internet was built for capability.
            <span className="block text-gv-text-accent">We built GestaltView to see you.</span>
          </h1>
          <p
            className="text-lg leading-relaxed text-gv-text-secondary"
            style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}
          >
            Every plan is a commitment to never flattening who you are.
            Billy does not summarize. Billy holds you whole.
            The free tier gives you limited rendering with no persistence so you can preview the system before you commit.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex rounded-xl bg-[#161b22] border border-[#30363d] p-1 gap-1">
            {(['monthly', 'annual'] as Interval[]).map((value) => (
              <button
                key={value}
                onClick={() => setInterval(value)}
                className={[
                  'px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  interval === value ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white',
                ].join(' ')}
              >
                {value === 'monthly' ? 'Monthly' : 'Annual'}
                {value === 'annual' && (
                  <span className="ml-2 text-xs text-emerald-400 font-semibold">Save 20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_22px_80px_rgba(0,0,0,0.18)]"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center rounded-full border border-cyan-200/20 bg-cyan-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                Free tier
              </div>
              <div className="space-y-3">
                <h2
                  className="text-3xl sm:text-4xl font-black leading-tight text-white"
                  style={{ fontFamily: "'Cabin Sketch', cursive" }}
                >
                  Limited rendering. No persistence. A clean preview of GestaltView.
                </h2>
                <p
                  className="text-base leading-relaxed text-gv-text-secondary sm:text-lg"
                  style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}
                >
                  Use the free tier when you want to see the room, test Billy, and understand the shape of the experience before you upgrade.
                  It renders in the browser, but it does not save your context or carry state forward.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {FREE_TIER_FEATURES.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gv-text-secondary"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:w-72">
              <div className="space-y-1">
                <div className="text-sm uppercase tracking-[0.24em] text-gv-text-muted">Price</div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="mb-2 text-sm text-gv-text-secondary">/mo</span>
                </div>
              </div>
              <a
                href="/"
                className="w-full inline-flex items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-200/14 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cyan-200/20"
              >
                Try the free tier
              </a>
              <p className="text-xs leading-relaxed text-gv-text-muted">
                Core adds persistence and memory. Pro adds the full surface, deeper reasoning, and the advanced domain lanes.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              interval={interval}
              isLoading={loadingPlan === tier.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <p className="text-center text-sm text-gray-600">
          Want to try before committing?{' '}
          <a href="/" className="text-indigo-400 hover:underline">Start with the free tier</a>
          {' '}-- limited rendering, no persistence, and 3 demo queries without an account.
        </p>

        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-center mb-8">Real questions, real answers</h2>
          {FAQS.map((faq, index) => (
            <div key={faq.q} className="border border-[#30363d] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full text-left px-6 py-4 flex justify-between items-center text-sm font-medium text-gray-200 hover:bg-white/5 transition-colors"
              >
                {faq.q}
                <span className="text-gray-500 ml-4 shrink-0">{openFaq === index ? '-' : '+'}</span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-[#30363d]">
                  <p className="pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center space-y-4 pt-8 border-t border-[#30363d]">
          <p className="text-gray-500 text-sm">
            Questions? Reach out at{' '}
            <a href="mailto:keithsoyka@gmail.com" className="text-indigo-400 hover:underline">
              keithsoyka@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
