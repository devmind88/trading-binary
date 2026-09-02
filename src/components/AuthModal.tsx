import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, ShieldCheck, Sparkles, Check, 
  ArrowRight, LogOut, CheckCircle2, AlertCircle, KeyRound
} from 'lucide-react';
import { UserProfile, UserPlan } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onOpenPricing: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenPricing
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid trader email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Process Login / Registration
    const derivedName = name.trim() || email.split('@')[0];
    const updatedUser: UserProfile = {
      ...currentUser,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
      joinedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateUser(updatedUser);
    setSuccessMsg(isSignUp ? 'Account registered successfully! Welcome aboard.' : 'Authenticated successfully. Welcome back!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleQuickLogin = (plan: UserPlan, demoEmail: string, demoName: string) => {
    const updated: UserProfile = {
      ...currentUser,
      id: 'demo_' + plan + '_' + Date.now(),
      email: demoEmail,
      name: demoName,
      plan: plan,
      adFree: plan !== 'free',
      dailyAiQueriesUsed: 0,
      maxDailyAiQueries: plan === 'free' ? 5 : Infinity
    };
    onUpdateUser(updated);
    setSuccessMsg(`Switched to ${plan.toUpperCase()} trader profile!`);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleSignOut = () => {
    const guestUser: UserProfile = {
      id: 'guest_' + Date.now(),
      email: 'guest@neurotactix.trade',
      name: 'Guest Trader',
      plan: 'free',
      joinedAt: new Date().toISOString().split('T')[0],
      adFree: false,
      dailyAiQueriesUsed: 0,
      maxDailyAiQueries: 5
    };
    onUpdateUser(guestUser);
    setSuccessMsg('Logged out to guest session.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const isLoggedIn = currentUser.email && !currentUser.email.startsWith('guest@');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
      >
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoggedIn ? (
          /* Active Account State */
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 font-bold text-lg font-mono">
                {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'TR'}
              </div>
              <div>
                <h3 id="auth-modal-title" className="text-lg font-bold text-slate-100">{currentUser.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                    currentUser.plan === 'pro' 
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                      : currentUser.plan === 'elite'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {currentUser.plan.toUpperCase()} PLAN
                  </span>
                  {currentUser.adFree && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> No Ads
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Plan Status Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400">Subscription Tier:</span>
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">{currentUser.plan}</span>
              </div>
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <span className="text-slate-400">AI Daily Coach Access:</span>
                <span className="text-emerald-400 font-bold">
                  {currentUser.plan === 'free' ? `${currentUser.dailyAiQueriesUsed}/5 queries today` : 'Unlimited VIP'}
                </span>
              </div>

              {currentUser.plan === 'free' ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Upgrade to Pro ($29/mo) • Remove All Ads
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-mono text-xs transition text-center block"
                >
                  Manage Membership & Billing
                </button>
              )}
            </div>

            {/* Switch / Sign Out */}
            <div className="space-y-2">
              <button
                onClick={handleSignOut}
                className="w-full py-2 px-4 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-905/40 text-red-300 font-mono text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out from {currentUser.email}
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 id="auth-modal-title" className="text-lg font-bold text-slate-100">
                  {isSignUp ? 'Create Trader Account' : 'Sign In to NeuroTactix'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Synchronize your trade logs, risk parameters, and membership tier.
              </p>
            </div>

            {/* Notification Messages */}
            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Trader Name / Handle</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Trader"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trader@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>Remember Session</span>
                </label>
                <button type="button" onClick={() => alert("Password reset link sent to " + (email || "your email"))} className="hover:text-slate-200">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-lg shadow-indigo-950/60 transition flex items-center justify-center gap-2 mt-2"
              >
                <span>{isSignUp ? 'Create Free Trader Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-bold"
              >
                {isSignUp ? 'Sign In' : 'Sign Up Free'}
              </button>
            </div>

            {/* Quick Demo Logins for Instant Testing */}
            <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/70">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2 font-semibold">
                Quick 1-Click Sandbox Logins:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('free', 'freetrader@example.com', 'Free Trader')}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition text-left"
                >
                  <div className="font-bold text-slate-300">Free Tier</div>
                  <div className="text-[9px] text-slate-500">Ad-Supported</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('pro', 'pro_trader@example.com', 'Pro Alpha')}
                  className="py-1.5 px-2.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-950 border border-indigo-800/60 text-[11px] font-mono text-indigo-300 hover:text-indigo-200 transition text-left"
                >
                  <div className="font-bold text-indigo-400">Pro Plan ($29)</div>
                  <div className="text-[9px] text-indigo-400/70">Ad-Free + Monte Carlo</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
