import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import type { AnalysisResult, AuditHistoryItem, ProductFeedAnalysisResult, User } from './types';
import { Footer } from './components/Footer';
import { AuthScreen } from './components/AuthScreen';
import { UpgradeModal } from './components/UpgradeModal';
import { LandingPage } from './components/LandingPage';
import { AuditHistory } from './components/AuditHistory';
import { FeedCleanerPanel } from './components/FeedCleanerPanel';
import { analyzeFeed, analyzeWebsite, createCheckoutSession, getAuditHistory, getMe, login, logoutLocal, signup, verifyEmailToken } from './services/apiClient';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [showAuth, setShowAuth] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [productAnalysisResult, setProductAnalysisResult] = useState<ProductFeedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [auditHistory, setAuditHistory] = useState<AuditHistoryItem[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<'compliance' | 'feedCleaner'>('compliance');

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const verifyToken = params.get('verify');
        if (verifyToken) {
          const verified = await verifyEmailToken(verifyToken);
          localStorage.setItem('currentUser', JSON.stringify(verified));
          setUser(verified);
          params.delete('verify');
          const next = params.toString();
          window.history.replaceState({}, '', `${window.location.pathname}${next ? `?${next}` : ''}`);
        } else {
          const me = await getMe();
          localStorage.setItem('currentUser', JSON.stringify(me));
          setUser(me);
        }
      } catch {
        logoutLocal();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setAuditHistory([]);
      return;
    }

    (async () => {
      try {
        const history = await getAuditHistory();
        setAuditHistory(history);
      } catch {
        setAuditHistory([]);
      }
    })();
  }, [user]);

  const handleSignup = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const newUser = await signup(email, pass);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);
      setShowLanding(false);
    } catch (e: any) {
      setAuthError(e?.message || 'Signup failed');
      throw e;
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const loggedUser = await login(email, pass);
      localStorage.setItem('currentUser', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setShowLanding(false);
    } catch (e: any) {
      setAuthError(e?.message || 'Invalid email or password');
      throw e;
    }
  };

  const handleLogout = () => {
    logoutLocal();
    setUser(null);
    setAnalysisResult(null);
    setProductAnalysisResult(null);
    setShowAuth(false);
  };

  const handleUpgrade = async () => {
    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || 'Could not start checkout.');
      setShowUpgradeModal(false);
    }
  };

  const handleAnalysis = useCallback(async (_url: string, content: string, feedContent: string) => {
    if (!user) return;

    if (user.searchesRemaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    if (!content.trim() && !feedContent.trim()) {
      setError('Please provide either website content or product feed content.');
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setProductAnalysisResult(null);
    setError(null);

    try {
      if (content.trim()) {
        const data = await analyzeWebsite(content);
        setAnalysisResult(data.result);
        const updated = { ...user, searchesRemaining: data.searchesRemaining };
        localStorage.setItem('currentUser', JSON.stringify(updated));
        setUser(updated);
      }

      if (feedContent.trim()) {
        const data = await analyzeFeed(feedContent);
        setProductAnalysisResult(data.result);
        const updated = { ...(user || { uid: '', email: '', searchesRemaining: 0 }), searchesRemaining: data.searchesRemaining };
        localStorage.setItem('currentUser', JSON.stringify(updated));
        setUser(updated as User);
      }

      const history = await getAuditHistory();
      setAuditHistory(history);
    } catch (err: any) {
      setError(err?.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  if (isBootstrapping) {
    return <div className="min-h-screen grid place-items-center text-slate-500">Loading...</div>;
  }

  if (user && showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} onLogin={() => setShowLanding(false)} />;
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-800">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Header user={user} onLogout={handleLogout} onShowLanding={() => setShowLanding(true)} />

        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="space-y-12">
            {!user.emailVerified && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl">
                <p className="font-bold">Verify your email to unlock free credits.</p>
                <p className="text-sm">Open the verification link sent to your inbox. If mail is not configured yet, use the verify link returned by signup response in non-production mode.</p>
              </div>
            )}
            {user.searchesRemaining <= 1 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-bold">Low credits: {user.searchesRemaining} left</p>
                  <p className="text-sm">Top up instantly with Stripe, or contact us for manual credits.</p>
                </div>
                <button
                  onClick={() => void handleUpgrade()}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                >
                  Upgrade
                </button>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 inline-flex gap-2">
              <button
                onClick={() => setActiveWorkspace('compliance')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeWorkspace === 'compliance' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Compliance Checker
              </button>
              <button
                onClick={() => setActiveWorkspace('feedCleaner')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeWorkspace === 'feedCleaner' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Feed Cleaner
              </button>
            </div>

            {activeWorkspace === 'compliance' ? (
              <>
                <InputForm onAnalyze={handleAnalysis} isLoading={isLoading} />
                {isLoading && <Loader />}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm animate-fade-in" role="alert">
                    <p className="font-bold">Analysis Failed</p>
                    <p>{error}</p>
                  </div>
                )}
                <ResultsDisplay result={analysisResult || undefined} productResult={productAnalysisResult || undefined} />
                <AuditHistory items={auditHistory} />
              </>
            ) : (
              <FeedCleanerPanel />
            )}
          </div>
        </main>

        <Footer />
        {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={handleUpgrade} />}
      </div>
    );
  }

  if (showAuth) {
    return <AuthScreen onLogin={handleLogin} onSignup={handleSignup} error={authError} />;
  }

  return <LandingPage onStart={() => setShowAuth(true)} onLogin={() => setShowAuth(true)} />;
};

export default App;
