import React, { useMemo, useState } from 'react';
import { useOTSData } from './useOTSData';
import { OTSBadge } from './OTSBadge';
import { BlockchainBadge } from './BlockchainBadge';
import type { OTSEntry } from './types';

const PAGE_SIZE = 25;

function truncateHash(hash: string, chars = 12): string {
  if (!hash) return '—';
  return `${hash.slice(0, chars)}…`;
}

export function OTSQueryPanel() {
  const { entries, loading, error, totalCount, buckets } = useOTSData();
  const [search, setSearch] = useState('');
  const [bucket, setBucket] = useState<string>('All');
  const [showUnmatched, setShowUnmatched] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return entries.filter((e: OTSEntry) => {
      const matchSearch =
        !search ||
        e.originalFilename?.toLowerCase().includes(search.toLowerCase()) ||
        e.originalTitle?.toLowerCase().includes(search.toLowerCase()) ||
        e.otsId?.toLowerCase().includes(search.toLowerCase());
      const matchBucket = bucket === 'All' || e.topicBucket === bucket;
      const matchUnmatched = !showUnmatched || e.manifestMatchType === 'none';
      return matchSearch && matchBucket && matchUnmatched;
    });
  }, [entries, search, bucket, showUnmatched]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageEntries = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const unmatchedCount = entries.filter((e) => e.manifestMatchType === 'none').length;

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
  }

  if (loading) {
    return (
      <div className="space-y-3 p-6" aria-label="Loading OTS index">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
        Failed to load OTS index: {error}
      </div>
    );
  }

  return (
    <section aria-labelledby="ots-panel-heading" className="space-y-4">
      {/* Manifest reconciliation warning */}
      {unmatchedCount > 0 && (
        <div
          className="rounded border border-yellow-300 bg-yellow-50 px-4 py-2.5 text-sm text-yellow-800"
          role="status"
        >
          <strong>{unmatchedCount} OTS entries</strong> have no match in the current 8-package manifest.
          Re-run <code className="rounded bg-yellow-100 px-1">make refresh</code> after ingesting new zip
          packages to reconcile.
        </div>
      )}

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>
          <strong>{totalCount}</strong> OTS receipts indexed
        </span>
        <span>
          <strong>{entries.filter((e) => !e.isCopyVariant).length}</strong> canonical originals
        </span>
        <span>
          <strong>{entries.filter((e) => e.isCopyVariant).length}</strong> copy variants
        </span>
        <span className="text-gray-400">All anchored 2026-03-10 UTC via OpenTimestamps</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          aria-label="Search OTS records by filename or ID"
          placeholder="Search filename, title, OTS ID…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <select
          aria-label="Filter by topic bucket"
          value={bucket}
          onChange={(e) => { setBucket(e.target.value); setPage(1); }}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none"
        >
          <option value="All">All buckets</option>
          {buckets.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showUnmatched}
            onChange={(e) => { setShowUnmatched(e.target.checked); setPage(1); }}
            className="rounded"
          />
          Unmatched only
        </label>
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} results
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium text-gray-600">OTS ID</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-gray-600">Filename</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-gray-600">Bucket</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-gray-600">Proof</th>
              <th scope="col" className="px-3 py-2 text-left font-medium text-gray-600">Manifest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageEntries.map((entry: OTSEntry) => (
              <React.Fragment key={entry.otsId}>
                <tr
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(expanded === entry.otsId ? null : entry.otsId)}
                  aria-expanded={expanded === entry.otsId}
                >
                  <td className="px-3 py-2 font-mono text-xs text-blue-700">{entry.otsId}</td>
                  <td className="max-w-xs px-3 py-2">
                    <span className="block truncate text-gray-800" title={entry.originalFilename}>
                      {entry.originalTitle || entry.originalFilename}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <OTSBadge
                      bucket={entry.topicBucket}
                      proofSizeBytes={entry.proofSizeBytes}
                      isCopyVariant={entry.isCopyVariant}
                    />
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {entry.inferredDate || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    <BlockchainBadge
                      anchored={true}
                      label={`${entry.proofSha256 ? truncateHash(entry.proofSha256) : '—'}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {entry.manifestMatchType === 'none' ? (
                      <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-600">unmatched</span>
                    ) : (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-700">
                        {entry.manifestMatchType}
                      </span>
                    )}
                  </td>
                </tr>
                {/* Expanded detail row */}
                {expanded === entry.otsId && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600 sm:grid-cols-3">
                        <div>
                          <span className="font-medium text-gray-500">OTS filename:</span>{' '}
                          <span className="font-mono">{entry.otsFilename}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">SHA-256:</span>{' '}
                          <span className="font-mono break-all">{entry.proofSha256}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Zip modified UTC:</span>{' '}
                          {entry.zipModifiedUtc}
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Extension:</span>{' '}
                          {entry.targetExtension || '—'}
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Canonical group count:</span>{' '}
                          {entry.canonicalGroupCount}
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Verify at:</span>{' '}
                          <a
                            href="https://opentimestamps.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            opentimestamps.org
                          </a>
                        </div>
                        {entry.bundleCompanionPresent && (
                          <div className="col-span-full">
                            <span className="font-medium text-gray-500">Bundle companions:</span>{' '}
                            {entry.bundleCompanionFiles}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-3 py-1 disabled:opacity-40"
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded border px-3 py-1 disabled:opacity-40"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400">
        SHA-256 hashes are computed at index time. Verify any file's integrity at{' '}
        <a
          href="https://opentimestamps.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          opentimestamps.org
        </a>
        .
      </p>
    </section>
  );
}
