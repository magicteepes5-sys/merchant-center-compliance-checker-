import React, { useState } from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string) => Promise<void>;
  error?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false); // Default to SignUp for new users
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      setIsLoading(true);
      try {
        if (isLogin) {
          await onLogin(email, password);
        } else {
          await onSignup(email, password);
        }
      } catch (err) {
        // Error is handled by parent and passed down via props
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-3xl"></div>
             <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-3xl"></div>
        </div>

      <div className="max-w-md w-full mx-4 z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Merchant Compliance AI
          </h1>
          <p className="text-slate-500 mb-8">
            Identify suspension risks and fix product feed errors before they cost you sales.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 ml-1 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 ml-1 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                minLength={6}
                className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Start Free Trial')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  // Clear fields on toggle
                  // setEmail(''); 
                  // setPassword('');
                }}
                className="ml-1 font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {isLogin ? 'Start Trial' : 'Sign In'}
              </button>
            </p>
            {!isLogin && (
                <p className="text-xs text-slate-400 mt-3">
                    Includes 3 free credits after email verification. No credit card required.
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};