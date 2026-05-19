
import React from 'react';
import type { AnalysisResult, ProductFeedAnalysisResult, PolicyIssue } from '../types';
import { PolicyIssueCard } from './PolicyIssueCard';
import { ProductIssueCard } from './ProductIssueCard';
import { CubeIcon } from './icons/CubeIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface ResultsDisplayProps {
  result?: AnalysisResult;
  productResult?: ProductFeedAnalysisResult;
}

const scoreIssue = (issue: PolicyIssue) => {
  const text = `${issue.problem} ${issue.recommendation}`.toLowerCase();
  if (/suspend|misrepresent|ban|prohibit|illegal|critical/.test(text)) return 3;
  if (/missing|inconsistent|mismatch|required|not found|lack/.test(text)) return 2;
  return 1;
};

const getRiskTier = (issues: PolicyIssue[]) => {
  const score = issues.reduce((acc, issue) => acc + scoreIssue(issue), 0);
  if (score >= 10 || issues.length >= 5) return { label: 'High', classes: 'bg-rose-50 text-rose-700 border-rose-200' };
  if (score >= 4 || issues.length >= 2) return { label: 'Medium', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { label: 'Low', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, productResult }) => {
  if (!result && !productResult) return null;

  const groupedIssues = result?.issues.reduce<Record<string, PolicyIssue[]>>((acc, issue) => {
    const key = issue.policy || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {}) || {};

  const topFixes = (result?.issues || [])
    .slice()
    .sort((a, b) => scoreIssue(b) - scoreIssue(a))
    .slice(0, 3);

  const siteRisk = result ? getRiskTier(result.issues) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in-up">
      {result && (
        <div className={`bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden ${!productResult ? 'lg:col-span-2' : ''}`}>
          <div className="bg-gradient-to-r from-indigo-50 to-white px-8 py-6 border-b border-indigo-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Site Audit</h2>
            </div>
            <div className="flex items-center gap-2">
              {siteRisk && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${siteRisk.classes}`}>
                  Risk: {siteRisk.label}
                </span>
              )}
              <div
                className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                  result.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {result.status === 'Approved' ? 'Likely Approved' : 'Risk Detected'}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Analysis Summary</h3>
              <p className="text-slate-600 leading-relaxed text-lg">{result.summary}</p>
            </div>

            {topFixes.length > 0 && (
              <div className="mb-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">Fix First Checklist</h3>
                <ol className="space-y-2 list-decimal pl-5 text-sm text-indigo-900">
                  {topFixes.map((issue, idx) => (
                    <li key={`${issue.policy}-${idx}`}>
                      <span className="font-semibold">{issue.policy}:</span> {issue.recommendation}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Identified Issues</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{result.issues.length}</span>
              </h3>

              {result.issues.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedIssues).map(([policy, issues]) => (
                    <div key={policy}>
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-700">{policy}</h4>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{issues.length}</span>
                      </div>
                      <div className="space-y-4">
                        {issues.map((issue, index) => (
                          <PolicyIssueCard key={`${policy}-${index}`} issue={issue} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl border-dashed">
                  <p className="text-emerald-700 font-medium">No critical violations found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {productResult && (
        <div className={`bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden ${!result ? 'lg:col-span-2' : ''}`}>
          <div className="bg-gradient-to-r from-purple-50 to-white px-8 py-6 border-b border-purple-50 flex items-center">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-purple-100 mr-3">
              <CubeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Feed Audit</h2>
          </div>

          <div className="p-8">
            <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Feed Health</h3>
              <p className="text-slate-700 mb-4 font-medium">{productResult.summary}</p>

              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-100/50 text-emerald-700 text-sm font-semibold border border-emerald-100">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  {productResult.safeProductCount} Safe
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold border ${productResult.riskyProducts.length > 0 ? 'bg-rose-100/50 text-rose-700 border-rose-100' : 'bg-slate-100 text-slate-500 border-slate-100'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${productResult.riskyProducts.length > 0 ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                  {productResult.riskyProducts.length} Risky
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Product Warnings</h3>
              {productResult.riskyProducts.length > 0 ? (
                <div className="space-y-4">
                  {productResult.riskyProducts.map((issue, index) => (
                    <ProductIssueCard key={index} issue={issue} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl border-dashed">
                  <p className="text-emerald-700 font-medium">No high-risk products identified.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
