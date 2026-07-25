// © 2026 Keith Soyka — GestaltView
import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useBillySection } from '@/components/Billy';
import BillyChip from '@/components/BillyChip';
import { useSEO, PAGE_SEO } from '@/hooks/useSEO';
import { GestaltViewMetricsDashboard } from '@/components/GestaltViewMetricsDashboard';

export default function MetricsDashboardPage() {
  useSEO(PAGE_SEO.metricsDashboard);
  const billyRef = useBillySection('metrics-dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavBar />
      <div ref={billyRef} className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/exhibits">
            <a className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft size={16} /> Back to Exhibits
            </a>
          </Link>
          <BillyChip context="metrics-dashboard" />
        </div>
        <GestaltViewMetricsDashboard />
      </div>
    </div>
  );
}
