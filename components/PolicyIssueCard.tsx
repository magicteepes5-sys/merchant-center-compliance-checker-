
import React from 'react';
import type { PolicyIssue } from '../types';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface PolicyIssueCardProps {
  issue: PolicyIssue;
}

export const PolicyIssueCard: React.FC<PolicyIssueCardProps> = ({ issue }) => {
  return (
    <div className="border border-slate-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
        <h4 className="text-sm font-bold text-slate-800">{issue.policy}</h4>
        <AlertTriangleIcon className="w-4 h-4 text-amber-500" />
      </div>
      <div className="p-5 space-y-4">
        <div>
           <p className="text-slate-600 text-sm leading-relaxed mb-3">
             {issue.problem}
           </p>
        </div>
        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
          <div className="flex items-start">
            <LightbulbIcon className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
                <span className="block text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">Fix</span>
                <p className="text-slate-700 text-sm font-medium">{issue.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
