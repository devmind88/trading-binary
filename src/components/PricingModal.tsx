import React, { useState } from 'react';
import { 
  X, Check, Sparkles, Shield, Zap, Flame, Crown, 
  CreditCard, ArrowRight, Settings, CheckCircle2, Lock, HelpCircle
} from 'lucide-react';
import { UserProfile, UserPlan } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdatePlan: (plan: UserPlan, billingCycle: 'monthly' | 'annual') => void;
  onUpdatePublisherId?: (publisherId: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdatePlan,
  onUpdatePublisherId
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [publisherIdInput, setPublisherIdInput] = useState(currentUser.googleAdsenseClientId || 'ca-pub-6822094812390192');
  const [showAdSenseConfig, setShowAdSenseConfig] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'TRADER100' || promoCode.trim().toUpperCase() === 'ALPHA') {
      setPromoApplied(true);
      setFeedback('Promo code applied: 100% complimentary trial unlocked!');
    } else {
      setFeedback('Invalid coupon code. Try TRADER100 for test discount.');
    }
  };

  const handleSelectPlan = (plan: UserPlan) => {
    setIsProcessing(true);
    setTimeout(() => {
      onUpdatePlan(plan, billingCycle);
      setIsProcessing(false);
      setFeedback(`Plan successfully updated to ${plan.toUpperCase()}!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 600);
  };

  const handleSavePublisherId = () => {
    if (onUpdatePublisherId) {
      onUpdatePublisherId(publisherIdInput.trim());
      setFeedback('Google AdSense Publisher ID updated and saved!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 overflow-hidden"
      >
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRANSPARENT TRADER PRICING • NO HIDDEN FEES</span>
          </div>
          <h2 id="pricing-modal-title" className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-sans">
            Choose Your Execution Edge
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Start completely free supported by clean non-intrusive Google Ads, or upgrade to Pro to unlock institutional risk stress-testing, unlimited AI Trade Coach, and 100% ad-free focus.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-5 inline-flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Status / Feedback banner */}
        {feedback && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* 3-Tier Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* TIER 1: FREE (Ad-Supported) */}
          <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
            currentUser.plan === 'free' 
              ? 'bg-slate-905 border-slate-700 shadow-lg ring-1 ring-slate-700' 
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase font-bold text-slate-400 px-2.5 py-1 rounded bg-slate-800">
                  Free Plan
                </span>
                {currentUser.plan === 'free' && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Current Tier
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-100 font-mono">$0</span>
                  <span className="text-xs text-slate-400 font-mono">/ forever</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ad-supported tier with full access to standard journaling and discipline checklists.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs font-mono text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Trading Plan & Entry Checklists</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>P&L Calendar & Equity Decomposition</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Strategy Performance Tracker</span>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</span>
                  <span>Supported by Google Ads banners</span>
                </div>
                <div className="flex items-start gap-2 text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">5</span>
                  <span>5 AI Coach queries per day</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('free')}
              disabled={currentUser.plan === 'free' || isProcessing}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl font-mono text-xs font-semibold transition ${
                currentUser.plan === 'free'
                  ? 'bg-slate-800 text-slate-500 cursor-default'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {currentUser.plan === 'free' ? 'Active Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* TIER 2: PRO TRADER (Most Popular) */}
          <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
            currentUser.plan === 'pro'
              ? 'bg-gradient-to-b from-indigo-950/70 to-slate-900 border-indigo-500 ring-2 ring-indigo-500/50 shadow-2xl shadow-indigo-950'
              : 'bg-gradient-to-b from-indigo-950/40 to-slate-900 border-indigo-500/60 hover:border-indigo-400 shadow-xl'
          }`}>
            {/* Best Value Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-mono text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-300" />
              <span>Recommended for Serious Traders</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="text-xs font-mono uppercase font-bold text-indigo-300 px-2.5 py-1 rounded bg-indigo-500/20 border border-indigo-500/30">
                  Pro Trader
                </span>
                {currentUser.plan === 'pro' && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Current Tier
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-100 font-mono">
                    {billingCycle === 'monthly' ? '$29' : '$22'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / mo {billingCycle === 'annual' && '(billed $264/yr)'}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/80 mt-1">
                  What typical traders pay for TradingView Pro & Edgewonk combined. Zero ads + advanced risk engines.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-indigo-900/40 text-xs font-mono text-slate-200">
                <div className="flex items-start gap-2 text-emerald-400 font-semibold">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>100% Ad-Free Experience (No Google Ads)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Unlimited Gemini AI Trade Coach & Voice</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Exclusive: Monte Carlo Ruin Simulator</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Exclusive: Prop-Firm Drawdown Guardian (FTMO/Apex)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Time-of-Day Bayesian Forecast Engine</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>PDF Executive Dossier & CSV Audit Export</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('pro')}
              disabled={currentUser.plan === 'pro' || isProcessing}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                currentUser.plan === 'pro'
                  ? 'bg-indigo-950 text-indigo-400 border border-indigo-800 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/60'
              }`}
            >
              {currentUser.plan === 'pro' ? (
                'Active Subscription'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade to Pro Trader</span>
                </>
              )}
            </button>
          </div>

          {/* TIER 3: INSTITUTIONAL ELITE */}
          <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
            currentUser.plan === 'elite'
              ? 'bg-slate-905 border-purple-500 ring-2 ring-purple-500/50 shadow-2xl'
              : 'bg-slate-950/80 border-slate-800 hover:border-purple-800/60'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase font-bold text-purple-300 px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/30">
                  Institutional Elite
                </span>
                {currentUser.plan === 'elite' && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Current Tier
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-100 font-mono">
                    {billingCycle === 'monthly' ? '$59' : '$45'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / mo {billingCycle === 'annual' && '(billed $540/yr)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  For high-capital fund traders, prop firms, and multi-broker syndicates.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs font-mono text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Everything included in Pro Trader</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Multi-Account & Multi-Broker Journaling</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Direct Quantitative Webhook & API Access</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Custom Automated Strategy Guardrails</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Priority 24/7 Concierge Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan('elite')}
              disabled={currentUser.plan === 'elite' || isProcessing}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                currentUser.plan === 'elite'
                  ? 'bg-purple-950 text-purple-400 border border-purple-800 cursor-default'
                  : 'bg-purple-700 hover:bg-purple-600 text-white shadow-lg shadow-purple-950/60'
              }`}
            >
              {currentUser.plan === 'elite' ? (
                'Active Subscription'
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>Upgrade to Elite</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Promo Code & Owner Settings */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleApplyPromo} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo code (try TRADER100)"
              className="py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition"
            >
              Apply
            </button>
          </form>

          {/* Owner Monetization AdSense Configuration Toggle */}
          <button
            onClick={() => setShowAdSenseConfig(!showAdSenseConfig)}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-slate-300 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Site Owner AdSense Monetization Setup</span>
          </button>
        </div>

        {/* AdSense Publisher Configuration Drawer for Owner */}
        {showAdSenseConfig && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-mono font-bold text-slate-200 uppercase">
                Google AdSense Publisher Configuration
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Enter your Google AdSense Publisher ID (e.g., <code className="text-indigo-300 font-mono">ca-pub-1234567890123456</code>). The application injects this ID into all live ad banners on the Free tier so you receive monetization payouts directly from Google.
            </p>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={publisherIdInput}
                onChange={(e) => setPublisherIdInput(e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="flex-1 py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSavePublisherId}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold rounded-lg transition"
              >
                Save ID
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
