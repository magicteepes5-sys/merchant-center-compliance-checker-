import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface UpgradeModalProps {
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in-up">
        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
            <SparklesIcon className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Trial Limit Reached</h2>
        <p className="text-slate-600 mb-8">
          You've used all 3 free analysis credits. Upgrade to our Pro plan to continue auditing your websites and product feeds without limits.
        </p>
        
        <div className="space-y-3">
          <button className="w-full py-3.5 px-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg">
            Upgrade to Pro
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3.5 px-4 bg-white text-slate-500 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};