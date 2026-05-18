
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { CubeIcon } from './icons/CubeIcon';

interface InputFormProps {
  onAnalyze: (url: string, content: string, feedContent: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [feedContent, setFeedContent] = useState('');
  const [activeTab, setActiveTab] = useState<'website' | 'feed'>('website');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(url, content, feedContent);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex">
          <button
            onClick={() => setActiveTab('website')}
            className={`flex-1 py-4 text-sm font-semibold text-center transition-colors relative ${
              activeTab === 'website' ? 'text-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Website Audit
            {activeTab === 'website' && <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-600"></div>}
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-4 text-sm font-semibold text-center transition-colors relative flex items-center justify-center gap-2 ${
              activeTab === 'feed' ? 'text-purple-600 bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CubeIcon className="w-4 h-4" />
            Product Feed Audit
            {activeTab === 'feed' && <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-600"></div>}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {activeTab === 'website' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-1">
                  <h3 className="text-lg font-semibold text-slate-900">Website Details</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Provide your store URL and content. The AI needs the text content (About Us, Policies, etc.) to detect violations accurately.
                  </p>
               </div>
               <div className="md:col-span-2 space-y-4">
                  <div>
                    <label htmlFor="url" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Store URL
                    </label>
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                      placeholder="https://www.yourstore.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      Website Text Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="content"
                      rows={8}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none"
                      placeholder="Paste text from your About Us, Returns, Shipping, and Contact pages here..."
                      required={activeTab === 'website'}
                    />
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <h3 className="text-lg font-semibold text-slate-900">Feed Data</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Paste your XML feed snippet. We'll look for dangerous products, missing attributes, and policy violations.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="feedContent" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                      XML Product Feed
                    </label>
                    <textarea
                      id="feedContent"
                      rows={12}
                      value={feedContent}
                      onChange={(e) => setFeedContent(e.target.value)}
                      className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-600 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none"
                      placeholder="<item>
  <g:id>12345</g:id>
  <g:title>Example Product</g:title>
  ...
</item>"
                      required={activeTab === 'feed'}
                    />
                </div>
             </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button
            type="submit"
            disabled={isLoading || (activeTab === 'website' && !content) || (activeTab === 'feed' && !feedContent)}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2 text-indigo-300 group-hover:text-white transition-colors" />
                Analyze Compliance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
