// © 2026 Keith Soyka — GestaltView
import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import NavBar from '@/components/NavBar';
import { useBillySection } from '@/components/Billy';
import BillyChip from '@/components/BillyChip';
import { useSEO, PAGE_SEO } from '@/hooks/useSEO';
import HeirloomCompanion from '@/components/HeirloomCompanion';

export default function HeirloomCompanionPage() {
  useSEO(PAGE_SEO.heirloomCompanion);
  const billyRef = useBillySection('heirloom-companion');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-pink-950 text-white">
      <NavBar />
      <div ref={billyRef} className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/exhibits">
            <a className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft size={16} /> Back to Exhibits
            </a>
          </Link>
          <BillyChip context="heirloom-companion" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-pink-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Heirloom Companion
          </h1>
          <p className="text-lg text-purple-300/80 max-w-2xl mx-auto">
            Preserving the voice, warmth, and wisdom of loved ones — never as a replacement, always as a gift.
          </p>
        </motion.div>

        <HeirloomCompanion userName="Your Loved One" />
      </div>
    </div>
  );
}
