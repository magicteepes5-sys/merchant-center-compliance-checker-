
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-center py-8 mt-12 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4">
          <p className="text-sm text-slate-400">
            Powered by OpenAI • GMC Checker
          </p>
           <p className="text-xs text-slate-400 mt-2">
            Recommendations are AI-generated. Always verify with official{' '}
            <a href="https://support.google.com/merchants/answer/6149970" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Google Policies
            </a>
            .
          </p>
      </div>
    </footer>
  );
};
