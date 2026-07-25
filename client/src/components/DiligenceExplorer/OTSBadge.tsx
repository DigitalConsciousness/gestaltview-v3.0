import React from 'react';

const BUCKET_COLORS: Record<string, string> = {
  'Business Investor': 'bg-blue-100 text-blue-800',
  'Compendium': 'bg-purple-100 text-purple-800',
  'Gemini Gem': 'bg-cyan-100 text-cyan-800',
  'IP Legal': 'bg-amber-100 text-amber-800',
  'Knowledge Context': 'bg-green-100 text-green-800',
};

interface OTSBadgeProps {
  bucket: string;
  proofSizeBytes?: number;
  isCopyVariant?: boolean;
}

export function OTSBadge({ bucket, proofSizeBytes, isCopyVariant }: OTSBadgeProps) {
  const color = BUCKET_COLORS[bucket] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
        role="img"
        aria-label={`Topic bucket: ${bucket}`}
      >
        {bucket}
      </span>
      {proofSizeBytes !== undefined && (
        <span className="text-xs text-gray-400">{proofSizeBytes}B proof</span>
      )}
      {isCopyVariant && (
        <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-700" aria-label="Copy variant">
          copy
        </span>
      )}
    </span>
  );
}
