import React from 'react';
import type { AuditHistoryItem } from '../types';

interface AuditHistoryProps {
  items: AuditHistoryItem[];
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900">Recent Audits</h3>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Last {items.length}</span>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isRisk = /reject|risk/i.test(item.status);
          return (
            <div key={item.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{item.type}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${isRisk ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {item.status}
                </span>
                <span className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{item.summary}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
