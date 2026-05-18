
import React from 'react';
import type { ProductIssue } from '../types';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ProductIssueCardProps {
  issue: ProductIssue;
}

export const ProductIssueCard: React.FC<ProductIssueCardProps> = ({ issue }) => {
  return (
    <div className="border border-rose-100 bg-white rounded-xl shadow-sm p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
      <div className="pl-3">
          <div className="flex justify-between items-start mb-2">
            <div>
                 <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md mb-1">
                    {issue.id}
                 </span>
                 <h5 className="font-bold text-slate-800 text-sm">{issue.title}</h5>
            </div>
            <div className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                {issue.policy}
            </div>
          </div>
          
          <div className="mt-3 flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg">
             <AlertTriangleIcon className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
             <p>{issue.reason}</p>
          </div>
      </div>
    </div>
  );
};
