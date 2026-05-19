
import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { CubeIcon } from './icons/CubeIcon';

interface InputFormProps {
  onAnalyze: (url: string, content: string, feedContent: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [contact, setContact] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [refundReturnsPolicy, setRefundReturnsPolicy] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [paymentPolicy, setPaymentPolicy] = useState('');
  const [otherPolicies, setOtherPolicies] = useState('');
  const [feedContent, setFeedContent] = useState('');
  const [activeTab, setActiveTab] = useState<'website' | 'feed'>('website');
  const [openSection, setOpenSection] = useState<string>('aboutUs');

  const buildWebsiteContent = () => {
    const sections = [
      ['Store URL', url],
      ['About Us', aboutUs],
      ['Contact', contact],
      ['Privacy Policy', privacyPolicy],
      ['Refund and Returns Policy', refundReturnsPolicy],
      ['Shipping Policy', shippingPolicy],
      ['Payment Policy', paymentPolicy],
      ['Other Policies', otherPolicies],
    ];

    return sections
      .filter(([, text]) => String(text || '').trim())
      .map(([title, text]) => `## ${title}\n${String(text).trim()}`)
      .join('\n\n');
  };

  const hasWebsitePolicyContent = [
    aboutUs,
    contact,
    privacyPolicy,
    refundReturnsPolicy,
    shippingPolicy,
    paymentPolicy,
    otherPolicies,
  ].some((v) => String(v || '').trim());

  const policySections = [
    { key: 'aboutUs', label: 'About Us', value: aboutUs, setValue: setAboutUs, rows: 4, required: true, placeholder: 'Paste About Us text...' },
    { key: 'contact', label: 'Contact', value: contact, setValue: setContact, rows: 3, required: false, placeholder: 'Paste Contact page text...' },
    { key: 'privacyPolicy', label: 'Privacy Policy', value: privacyPolicy, setValue: setPrivacyPolicy, rows: 4, required: false, placeholder: 'Paste Privacy Policy text...' },
    { key: 'refundReturnsPolicy', label: 'Refund and Returns Policy', value: refundReturnsPolicy, setValue: setRefundReturnsPolicy, rows: 4, required: false, placeholder: 'Paste Refund/Returns Policy text...' },
    { key: 'shippingPolicy', label: 'Shipping Policy', value: shippingPolicy, setValue: setShippingPolicy, rows: 4, required: false, placeholder: 'Paste Shipping Policy text...' },
    { key: 'paymentPolicy', label: 'Payment Policy', value: paymentPolicy, setValue: setPaymentPolicy, rows: 3, required: false, placeholder: 'Paste Payment Policy text...' },
    { key: 'otherPolicies', label: 'Other Policies', value: otherPolicies, setValue: setOtherPolicies, rows: 4, required: false, placeholder: 'Paste any additional policy text...' },
  ] as const;

  const filledPolicyCount = policySections.filter((s) => String(s.value || '').trim()).length;
  const policyCompletionPct = Math.round((filledPolicyCount / policySections.length) * 100);
  const missingImportantPolicies = policySections
    .filter((s) => !String(s.value || '').trim() && s.key !== 'otherPolicies')
    .map((s) => s.label);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(url, buildWebsiteContent(), feedContent);
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
                    Fill each policy section separately. This helps the AI detect Merchant Center issues with better context and precision.
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
                  
                  <div className="space-y-3">
                    {policySections.map((section) => {
                      const isOpen = openSection === section.key;
                      const hasText = String(section.value || '').trim().length > 0;

                      return (
                        <div key={section.key} className="rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setOpenSection(isOpen ? '' : section.key)}
                            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
                          >
                            <span className="text-sm font-semibold text-slate-800">
                              {section.label} {section.required ? <span className="text-red-500">*</span> : null}
                            </span>
                            <span className="text-slate-500 text-sm">{isOpen ? '▾' : '▸'}</span>
                          </button>

                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 border-t border-slate-200 bg-white">
                              <textarea
                                id={section.key}
                                rows={section.rows}
                                value={section.value}
                                onChange={(e) => section.setValue(e.target.value)}
                                className="mt-2 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none"
                                placeholder={section.placeholder}
                                required={activeTab === 'website' && section.required}
                              />
                            </div>
                          )}

                          {!isOpen && hasText && (
                            <div className="px-4 pb-3 text-xs text-emerald-700">Filled</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-indigo-900">Policy Coverage Pre-check</p>
                      <p className="text-sm font-bold text-indigo-700">{filledPolicyCount}/{policySections.length} ({policyCompletionPct}%)</p>
                    </div>

                    <div className="h-2 w-full rounded-full bg-indigo-100 overflow-hidden mb-3">
                      <div className="h-full bg-indigo-500" style={{ width: `${policyCompletionPct}%` }} />
                    </div>

                    {missingImportantPolicies.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-1">Recommended to add before analyze:</p>
                        <ul className="text-xs text-amber-800 list-disc ml-4 space-y-0.5">
                          {missingImportantPolicies.map((label) => (
                            <li key={label}>{label}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-emerald-700">Great coverage. Your policy set looks complete for a strong first audit.</p>
                    )}
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
            disabled={isLoading || (activeTab === 'website' && !hasWebsitePolicyContent) || (activeTab === 'feed' && !feedContent)}
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
