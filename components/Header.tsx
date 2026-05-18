import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
             <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 hidden sm:block">MC Checker</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end mr-2">
             <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trial Credits</span>
             <span className={`text-sm font-bold ${user.searchesRemaining > 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                {user.searchesRemaining} / 3 Left
             </span>
          </div>
          
          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.email.charAt(0).toUpperCase()}
             </div>
             <button 
                onClick={onLogout}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
             >
                Sign Out
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};