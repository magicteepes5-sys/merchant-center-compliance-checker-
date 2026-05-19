import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CubeIcon } from './icons/CubeIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { Footer } from './Footer';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-800 flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-200/20 rounded-full blur-3xl mix-blend-multiply opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="w-full py-6 px-6 md:px-12 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">MC Checker</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={onStart}
            className="hidden sm:inline-flex px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col justify-center relative z-10 pt-10 pb-20">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in">
            <SparklesIcon className="w-4 h-4" />
            <span>Powered by OpenAI intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-8 animate-fade-in-up">
            Avoid Merchant Center <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Suspensions & Errors
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-100">
            Automatically audit your website and product feeds for Google Shopping compliance. Detect policy violations instantly and get actionable fixes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white text-base font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
            >
              Try it for Free
            </button>
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-700 border border-slate-200 text-base font-bold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            >
              View Demo
            </button>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400 font-medium animate-fade-in-up delay-300">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
              <span>3 Free Lifetime Audits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-16 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
                    3
                 </div>
                 <div className="text-slate-400 font-medium">Free Audits to Start</div>
              </div>
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                    &lt; 60s
                 </div>
                 <div className="text-slate-400 font-medium">Average First Risk Report</div>
              </div>
              <div className="p-4">
                 <div className="text-4xl md:text-5xl font-extrabold text-emerald-400 mb-2">
                    24/7
                 </div>
                 <div className="text-slate-400 font-medium">Always-on Monitoring Workflow</div>
              </div>
           </div>
           
           <div className="mt-12 text-center">
              <button 
                onClick={onStart}
                className="inline-flex items-center gap-2 text-indigo-300 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors group"
              >
                Start Your Free Analysis 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Complete Compliance Coverage</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">From landing page text to XML feed attributes, we check every corner of your store.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Website Compliance</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Scan pages for missing return policies, contact gaps, and unsecure checkout processes that trigger "Misrepresentation" suspensions.
              </p>
              <button onClick={onStart} className="text-indigo-600 font-bold text-sm hover:underline">Check Website →</button>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-purple-100 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <CubeIcon className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Feed Analysis</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Analyze XML feeds to catch dangerous products, medical claims, and missing attributes before upload.
              </p>
              <button onClick={onStart} className="text-purple-600 font-bold text-sm hover:underline">Check Feed →</button>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-amber-100 transition-all duration-300 group">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                <AlertTriangleIcon className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Actionable Fixes</h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                Don't just get errors. Get AI-generated recommendations on exactly what text to change on your site.
              </p>
              <button onClick={onStart} className="text-amber-600 font-bold text-sm hover:underline">See Example →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white relative">
         <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col md:flex-row items-center gap-16">
               <div className="w-full md:w-1/2">
                  <div className="inline-block p-3 rounded-2xl bg-rose-50 border border-rose-100 mb-6">
                     <AlertTriangleIcon className="w-8 h-8 text-rose-500" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                     Suspensions kill sales. <br/>
                     <span className="text-rose-500">Don't let it happen.</span>
                  </h2>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                     Google Merchant Center suspensions can happen instantly and take weeks to resolve. A suspended account means <strong>zero revenue</strong> from Google Shopping.
                  </p>
                  
                  <div className="space-y-4 mb-10">
                     <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                           <ShieldCheckIcon className="w-3 h-3 text-emerald-600" />
                        </div>
                        <p className="text-slate-700 font-medium">Detect "Misrepresentation" triggers before Google does.</p>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                           <ShieldCheckIcon className="w-3 h-3 text-emerald-600" />
                        </div>
                        <p className="text-slate-700 font-medium">Identify prohibited keywords in product titles and descriptions.</p>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                           <ShieldCheckIcon className="w-3 h-3 text-emerald-600" />
                        </div>
                        <p className="text-slate-700 font-medium">Verify Contact Information consistency across pages.</p>
                     </div>
                  </div>

                  <button 
                    onClick={onStart}
                    className="px-8 py-4 rounded-full bg-slate-900 text-white text-base font-bold shadow-xl hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
                  >
                    Check My Store for Risks
                  </button>
               </div>
               
               <div className="w-full md:w-1/2 bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-inner">
                  <div className="space-y-4">
                     {/* Mock UI Cards */}
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center opacity-50">
                        <div className="w-2 h-12 bg-rose-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                           <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                           <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                        </div>
                     </div>
                     
                     <div className="bg-white p-6 rounded-xl shadow-lg border border-rose-100 relative transform md:-translate-x-6 scale-105 z-10">
                        <div className="absolute top-4 right-4 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                           Risk Detected
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 bg-rose-100 rounded-lg">
                              <AlertTriangleIcon className="w-5 h-5 text-rose-600" />
                           </div>
                           <span className="font-bold text-slate-800">Return Policy Missing</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">Your refund policy page is empty or inaccessible. This is a primary trigger for Misrepresentation.</p>
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex gap-2">
                           <LightbulbIcon className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                           <p className="text-xs text-indigo-800 font-medium">Action: Add a clear text block detailing return windows and restocking fees.</p>
                        </div>
                     </div>

                     <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center opacity-50">
                        <div className="w-2 h-12 bg-emerald-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                           <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                           <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-slate-50 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-lg text-slate-500">From signup to fix plan in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Paste store policies or feed', desc: 'Add website policy sections or XML feed snippet.' },
              { step: '02', title: 'Run compliance analysis', desc: 'We scan for Merchant Center policy risks and weak trust signals.' },
              { step: '03', title: 'Apply fix-first checklist', desc: 'Get prioritized recommendations you can execute immediately.' },
            ].map((item) => (
              <div key={item.step} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="text-indigo-600 text-xs font-bold tracking-wider mb-3">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple pricing</h2>
            <p className="text-lg text-slate-500">Start free. Upgrade only when you need more monthly scans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-3xl border border-slate-200 p-7 bg-slate-50/60">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <p className="text-4xl font-extrabold text-slate-900 mb-5">$0</p>
              <ul className="space-y-3 text-sm text-slate-700 mb-8">
                <li>• 3 lifetime audits</li>
                <li>• Website + feed checks</li>
                <li>• Basic recommendations</li>
              </ul>
              <button onClick={onStart} className="w-full px-4 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">Start Free</button>
            </div>

            <div className="rounded-3xl border-2 border-indigo-500 p-7 bg-white shadow-xl shadow-indigo-100 relative">
              <span className="absolute -top-3 right-5 text-xs font-bold bg-indigo-600 text-white px-3 py-1 rounded-full">Current plan</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Growth</h3>
              <p className="text-4xl font-extrabold text-slate-900 mb-1">$14.99<span className="text-base font-semibold text-slate-500">/mo</span></p>
              <p className="text-sm text-slate-500 mb-5">Single paid plan for launch</p>
              <ul className="space-y-3 text-sm text-slate-700 mb-8">
                <li>• 100 audits / month</li>
                <li>• Priority fix-first checklist</li>
                <li>• Email support</li>
              </ul>
              <button onClick={onStart} className="w-full px-4 py-3 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">Upgrade</button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="container mx-auto px-4 text-center relative z-10 max-w-3xl">
           <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to secure your Google Shopping ads?</h2>
           <p className="text-indigo-100 text-xl mb-10">Join thousands of merchants who sleep soundly knowing their account is compliant.</p>
           <button 
              onClick={onStart}
              className="px-10 py-5 rounded-full bg-white text-indigo-600 text-lg font-bold shadow-2xl hover:bg-indigo-50 hover:scale-105 transition-all duration-200"
            >
              Get Started for Free
            </button>
            <p className="mt-6 text-sm text-indigo-200 font-medium">Includes 3 free lifetime audits • No credit card needed</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};