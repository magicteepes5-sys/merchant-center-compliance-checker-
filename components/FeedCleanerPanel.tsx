import React, { useMemo, useState } from 'react';
import {
  applyFeedCleanerSafeFixes,
  downloadFeedCleanerCleanedCsv,
  downloadFeedCleanerReport,
  processFeedCleanerCsv,
} from '../services/apiClient';
import type { FeedCleanerIssue, FeedCleanerProcessResult } from '../types';

const severityStyles: Record<string, string> = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const FeedCleanerPanel: React.FC = () => {
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplyingFixes, setIsApplyingFixes] = useState(false);
  const [result, setResult] = useState<FeedCleanerProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewIssues = useMemo(() => (result?.issues || []).slice(0, 50), [result]);

  const onFileUpload = async (file: File) => {
    const text = await file.text();
    setCsvText(text);
  };

  const onProcess = async () => {
    if (!csvText.trim()) {
      setError('Please upload or paste a CSV first.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const processed = await processFeedCleanerCsv(csvText);
      setResult(processed);
    } catch (e: any) {
      setError(e?.message || 'Failed to process CSV.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onApplySafeFixes = async () => {
    if (!result?.jobId) return;
    setError(null);
    setIsApplyingFixes(true);
    try {
      const updated = await applyFeedCleanerSafeFixes(result.jobId);
      setResult(updated);
    } catch (e: any) {
      setError(e?.message || 'Failed to apply safe fixes.');
    } finally {
      setIsApplyingFixes(false);
    }
  };

  const onDownloadCleanedCsv = async () => {
    if (!result?.jobId) return;
    setError(null);
    try {
      const blob = await downloadFeedCleanerCleanedCsv(result.jobId);
      downloadBlob(blob, 'cleaned-feed.csv');
    } catch (e: any) {
      setError(e?.message || 'Failed to download cleaned CSV.');
    }
  };

  const onDownloadReport = async () => {
    if (!result?.jobId) return;
    setError(null);
    try {
      const blob = await downloadFeedCleanerReport(result.jobId);
      downloadBlob(blob, 'feed-cleaner-report.json');
    } catch (e: any) {
      setError(e?.message || 'Failed to download report.');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900">Feed Cleaner</h2>
        <p className="mt-1 text-sm text-slate-500">Upload or paste CSV, review issues, apply safe fixes, and download outputs.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 block">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Upload CSV</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onFileUpload(file);
              }}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
            />
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CSV Input</p>
            <p className="text-xs text-slate-500 mt-1">Paste CSV content manually if you prefer.</p>
          </div>
        </div>

        <div>
          <textarea
            rows={10}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="id,title,description,price,availability"
            className="block w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-700 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => void onProcess()}
            disabled={isProcessing || !csvText.trim()}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </button>

          <button
            onClick={() => void onApplySafeFixes()}
            disabled={!result?.jobId || isApplyingFixes}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplyingFixes ? 'Applying...' : 'Apply Safe Fixes'}
          </button>

          <button
            onClick={() => void onDownloadCleanedCsv()}
            disabled={!result?.jobId}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Download Cleaned CSV
          </button>

          <button
            onClick={() => void onDownloadReport()}
            disabled={!result?.jobId}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Download Report
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm" role="alert">
            <p className="font-bold">Feed Cleaner Failed</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryCard label="Critical" value={result.summary.critical} tone="critical" />
              <SummaryCard label="High" value={result.summary.high} tone="high" />
              <SummaryCard label="Medium" value={result.summary.medium} tone="medium" />
              <SummaryCard label="Auto-fixable" value={result.summary.autoFixable} tone="low" />
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Issues Preview</h3>
                <span className="text-xs text-slate-500">Showing first {previewIssues.length} of {result.issues.length}</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[420px] overflow-auto">
                {previewIssues.map((issue, idx) => (
                  <IssueRow key={`${issue.row}-${idx}`} issue={issue} />
                ))}
                {previewIssues.length === 0 && (
                  <div className="p-5 text-sm text-emerald-700 bg-emerald-50">No issues detected.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: number; tone: string }> = ({ label, value, tone }) => (
  <div className={`rounded-xl border p-4 ${severityStyles[tone] || severityStyles.low}`}>
    <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </div>
);

const IssueRow: React.FC<{ issue: FeedCleanerIssue }> = ({ issue }) => {
  const tone = (issue.severity || 'medium').toLowerCase();
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Row {issue.row} · {issue.field}</p>
          <p className="text-sm text-slate-600 mt-1">{issue.message}</p>
          {issue.suggestedFix && <p className="text-xs text-indigo-700 mt-2">Suggested fix: {issue.suggestedFix}</p>}
        </div>
        <span className={`shrink-0 px-2 py-1 rounded-full text-[11px] font-bold border ${severityStyles[tone] || severityStyles.medium}`}>
          {issue.severity}
        </span>
      </div>
    </div>
  );
};
