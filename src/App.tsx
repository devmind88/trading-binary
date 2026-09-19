import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, 
  CalendarRange, 
  Clock, 
  Activity, 
  Settings, 
  RefreshCw, 
  Layers, 
  BrainCircuit, 
  Play, 
  ShieldAlert, 
  Smartphone, 
  Flame, 
  Dna,
  Radio,
  FastForward,
  BarChart3,
  Trophy,
  Brain,
  Crown,
  Sparkles,
  User,
  Mail,
  SlidersHorizontal,
  Terminal,
  X,
  ChevronUp
} from 'lucide-react';
import { Trade, RiskLimits, ChecklistItem, DailyRoutineState, RuleViolation, UserProfile, UserPlan, AccountSetupConfig } from './types';
import {
  sampleTrades,
  defaultEntryChecklist,
  defaultBeforeRoutine,
  defaultDuringRoutine,
  defaultAfterRoutine
} from './data';

// Component imports
import { PlanModule } from './components/PlanModule';
import { PnlCalendar } from './components/PnlCalendar';
import { DailyRoutine } from './components/DailyRoutine';
import { StrategyPerformance } from './components/StrategyPerformance';
import { WeeklyReview } from './components/WeeklyReview';
import { VoiceAssistant } from './components/VoiceAssistant';
import { AiMarketIntelligence } from './components/AiMarketIntelligence';
import { TraderDnaSimulator } from './components/TraderDnaSimulator';
import { AppStoreComplianceModal } from './components/AppStoreComplianceModal';
import { WinStreakToast } from './components/WinStreakToast';
import { MarketVolatilityLayer } from './components/MarketVolatilityLayer';
import { InstitutionalReplayEngine } from './components/InstitutionalReplayEngine';
import { ProfessionalAnalytics } from './components/ProfessionalAnalytics';
import { GamificationHub } from './components/GamificationHub';
import { ExecutionCoach } from './components/ExecutionCoach';
import { GoogleAdBanner } from './components/GoogleAdBanner';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { PremiumGuardian } from './components/PremiumGuardian';
import { QuickStartModal } from './components/QuickStartModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('plan');
  const [isComplianceOpen, setIsComplianceOpen] = useState<boolean>(false);
  
  // User Profile & Subscription Tier state
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('trading_os_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'usr_free_default',
      email: 'trader@neurotactix.trade',
      name: 'Alex Trader',
      plan: 'free',
      joinedAt: new Date().toISOString().split('T')[0],
      adFree: false,
      dailyAiQueriesUsed: 1,
      maxDailyAiQueries: 5,
      googleAdsenseClientId: 'ca-pub-6822094812390192'
    };
  });

  useEffect(() => {
    localStorage.setItem('trading_os_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);

  const handleUpdatePlan = (newPlan: UserPlan, billingCycle: 'monthly' | 'annual') => {
    setCurrentUser(prev => ({
      ...prev,
      plan: newPlan,
      adFree: newPlan !== 'free',
      billingCycle,
      maxDailyAiQueries: newPlan === 'free' ? 5 : Infinity
    }));
  };

  const handleUpdatePublisherId = (newId: string) => {
    setCurrentUser(prev => ({
      ...prev,
      googleAdsenseClientId: newId
    }));
  };

  // Win Streak Toast Notification state
  const [streakToast, setStreakToast] = useState<{
    isOpen: boolean;
    streakCount: number;
    streakPnl: number;
  }>({
    isOpen: false,
    streakCount: 0,
    streakPnl: 0
  });

  // Zero-State & Account Setup Modal
  const [isQuickStartOpen, setIsQuickStartOpen] = useState<boolean>(() => {
    const initialized = localStorage.getItem('neurotactix_account_initialized');
    return !initialized;
  });
  const [isMobileCommandDrawerOpen, setIsMobileCommandDrawerOpen] = useState<boolean>(false);

  const handleSaveAccountSetup = (config: AccountSetupConfig) => {
    setRiskLimits(prev => ({
      ...prev,
      startingBalance: config.startingBalance,
      currentBalance: config.startingBalance,
      maxDailyLossPercent: config.maxDailyLossPercent,
      maxTradeSizePercent: config.maxTradeRiskPercent,
      minTradeSizePercent: Math.max(0.25, parseFloat((config.maxTradeRiskPercent / 2).toFixed(2))),
    }));

    if (config.loadSampleLedger) {
      setTrades(sampleTrades.map(t => {
        const riskPerTrade = Math.round(config.startingBalance * (config.maxTradeRiskPercent / 100));
        return {
          ...t,
          market: config.primaryMarkets?.[0] || 'NQ Futures',
          amount: riskPerTrade,
          pnl: t.result === 'WIN' ? Math.round(riskPerTrade * (t.payoutRate / 100)) : -riskPerTrade
        };
      }));
    } else {
      setTrades([]);
    }

    localStorage.setItem('neurotactix_account_initialized', 'true');
    localStorage.setItem('neurotactix_account_config', JSON.stringify(config));
    setIsQuickStartOpen(false);
  };
  
  // 1. Trade States (Synchronized via Local Storage)
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('trading_os_trades');
    return saved ? JSON.parse(saved) : sampleTrades;
  });

  useEffect(() => {
    localStorage.setItem('trading_os_trades', JSON.stringify(trades));
  }, [trades]);

  // 2. Risk Settle limits
  const [riskLimits, setRiskLimits] = useState<RiskLimits>(() => {
    const saved = localStorage.getItem('trading_os_limits');
    if (saved) return JSON.parse(saved);
    return {
      startingBalance: 1000,
      currentBalance: 1000,
      maxDailyLossPercent: 5,
      maxWeeklyLossPercent: 15,
      maxDailyTradesCount: 10,
      maxConsecutiveLossesAllowed: 3,
      minTradeSizePercent: 1,
      maxTradeSizePercent: 2
    };
  });

  useEffect(() => {
    localStorage.setItem('trading_os_limits', JSON.stringify(riskLimits));
  }, [riskLimits]);

  // Compute live balance dynamically based on trades log
  const currentBalance = useMemo(() => {
    const netReturn = trades.reduce((sum, t) => sum + t.pnl, 0);
    return parseFloat((riskLimits.startingBalance + netReturn).toFixed(2));
  }, [trades, riskLimits.startingBalance]);

  // 3. Entry Checklists State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('trading_os_checklist');
    return saved ? JSON.parse(saved) : defaultEntryChecklist;
  });

  useEffect(() => {
    localStorage.setItem('trading_os_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // 4. Daily Routine state
  const [routineState, setRoutineState] = useState<DailyRoutineState>(() => {
    const saved = localStorage.getItem('trading_os_routine');
    if (saved) return JSON.parse(saved);
    return {
      beforeChecklist: defaultBeforeRoutine,
      duringChecklist: defaultDuringRoutine,
      afterChecklist: defaultAfterRoutine,
      currentMood: 'Focused & Calm',
      notes: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('trading_os_routine', JSON.stringify(routineState));
  }, [routineState]);

  // 5. Dynamic Risk Violation Audit Scanner
  const violations = useMemo(() => {
    const list: RuleViolation[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTrades = [...trades]
      .filter(t => t.date === todayStr)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

    // Overtrading check 
    if (todayTrades.length > riskLimits.maxDailyTradesCount) {
      list.push({
        id: 'v_over_' + Date.now(),
        type: 'OVERTRADING',
        message: `Total trades today (${todayTrades.length}) exceeds the maximum quota of ${riskLimits.maxDailyTradesCount}. Stop immediately.`,
        severity: 'critical',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Max daily loss check (Drawdown limit)
    const todayPnl = todayTrades.reduce((sum, t) => sum + t.pnl, 0);
    const maxLossValue = riskLimits.startingBalance * (riskLimits.maxDailyLossPercent / 100);
    if (todayPnl < 0 && Math.abs(todayPnl) >= maxLossValue) {
      list.push({
        id: 'v_loss_' + Date.now(),
        type: 'MAX_LOSS_EXCEEDED',
        message: `Today's net loss ($${Math.abs(todayPnl).toFixed(2)}) breached safety threshold of ${riskLimits.maxDailyLossPercent}% ($${maxLossValue.toFixed(2)}). Shut down application.`,
        severity: 'critical',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Max consecutive losses check (Streak protection)
    let consecutiveLossesCount = 0;
    let maxConsecStreak = 0;
    todayTrades.forEach(t => {
      if (t.result === 'LOSS') {
        consecutiveLossesCount++;
        if (consecutiveLossesCount > maxConsecStreak) maxConsecStreak = consecutiveLossesCount;
      } else if (t.result === 'WIN') {
        consecutiveLossesCount = 0;
      }
    });
    if (maxConsecStreak >= riskLimits.maxConsecutiveLossesAllowed) {
      list.push({
        id: 'v_consec_' + Date.now(),
        type: 'CONSECUTIVE_LOSS_REACHED',
        message: `Consecutive loss streak of ${maxConsecStreak} reached. Maximum allowed is ${riskLimits.maxConsecutiveLossesAllowed}. Trading blocked until reset.`,
        severity: 'critical',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Inconsistent Trade Sizing check (1-2%)
    const minSizingAllowed = riskLimits.startingBalance * (riskLimits.minTradeSizePercent / 100);
    const maxSizingAllowed = riskLimits.startingBalance * (riskLimits.maxTradeSizePercent / 100);
    let sizeDisobedience = false;
    todayTrades.forEach(t => {
      if (t.amount < minSizingAllowed || t.amount > maxSizingAllowed) {
        sizeDisobedience = true;
      }
    });
    if (sizeDisobedience) {
      list.push({
        id: 'v_sizing_' + Date.now(),
        type: 'INCONSISTENT_POSITION_SIZE',
        message: `Unsanctioned trade size detected. Budget per contract must remain strictly within $${minSizingAllowed.toFixed(0)} - $${maxSizingAllowed.toFixed(0)} (1-2%).`,
        severity: 'warning',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Martingale Doubling behavior scanner
    let martingaleFlag = false;
    for (let i = 1; i < todayTrades.length; i++) {
      const prev = todayTrades[i - 1];
      const cur = todayTrades[i];
      if (prev.result === 'LOSS' && cur.amount >= prev.amount * 1.5) {
        martingaleFlag = true;
      }
    }
    if (martingaleFlag) {
      list.push({
        id: 'v_mart_' + Date.now(),
        type: 'MARTINGALE_BEHAVIOR',
        message: 'Discipline error: position size increased immediately following a loss. Cease Martingale doubling.',
        severity: 'critical',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // Emotional logging indicator
    const emotionalTodayCount = todayTrades.filter(t => t.isEmotional).length;
    if (emotionalTodayCount > 0) {
      list.push({
        id: 'v_emot_' + Date.now(),
        type: 'EMOTIONAL_TRADING',
        message: `${emotionalTodayCount} executions registered today with emotional/impatience identifiers. Restoring mindfulness context.`,
        severity: 'warning',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    return list;
  }, [trades, riskLimits]);

  // 6. Dynamic Win Streak Calculation (Tracking consecutive winning executions)
  const currentWinStreakInfo = useMemo(() => {
    if (!trades || trades.length === 0) return { streak: 0, pnl: 0, latestTradeId: '' };
    const sorted = [...trades].sort((a, b) => {
      const aComp = `${a.date}T${a.time}`;
      const bComp = `${b.date}T${b.time}`;
      return aComp.localeCompare(bComp);
    });

    let streak = 0;
    let pnl = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].result === 'WIN') {
        streak++;
        pnl += sorted[i].pnl;
      } else {
        break;
      }
    }

    const latest = sorted[sorted.length - 1];
    return {
      streak,
      pnl: parseFloat(pnl.toFixed(2)),
      latestTradeId: latest ? latest.id : ''
    };
  }, [trades]);

  const initialMountRef = useRef(true);
  const celebratedTradeIdsRef = useRef<Set<string>>(new Set());

  // Automatic trigger on achieving or extending a win streak of 3+
  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      if (currentWinStreakInfo.latestTradeId) {
        celebratedTradeIdsRef.current.add(currentWinStreakInfo.latestTradeId);
      }
      return;
    }

    if (currentWinStreakInfo.streak >= 3 && currentWinStreakInfo.latestTradeId) {
      if (!celebratedTradeIdsRef.current.has(currentWinStreakInfo.latestTradeId)) {
        celebratedTradeIdsRef.current.add(currentWinStreakInfo.latestTradeId);
        setStreakToast({
          isOpen: true,
          streakCount: currentWinStreakInfo.streak,
          streakPnl: currentWinStreakInfo.pnl
        });
      }
    }
  }, [currentWinStreakInfo]);

  const handleTriggerStreakCelebration = (streak?: number, pnl?: number) => {
    setStreakToast({
      isOpen: true,
      streakCount: streak || (currentWinStreakInfo.streak >= 3 ? currentWinStreakInfo.streak : 3),
      streakPnl: pnl !== undefined ? pnl : currentWinStreakInfo.pnl
    });
  };

  // Reset all user data completely helper
  const handleClearData = () => {
    if (window.confirm('Reset terminal parameters and clear execution ledger? This lets you reconfigure realistic initial parameters.')) {
      localStorage.removeItem('trading_os_trades');
      localStorage.removeItem('trading_os_limits');
      localStorage.removeItem('neurotactix_account_initialized');
      localStorage.removeItem('neurotactix_account_config');
      setTrades([]);
      setRiskLimits({
        startingBalance: 10000,
        currentBalance: 10000,
        maxDailyLossPercent: 4,
        maxWeeklyLossPercent: 10,
        maxDailyTradesCount: 8,
        maxConsecutiveLossesAllowed: 3,
        minTradeSizePercent: 0.5,
        maxTradeSizePercent: 1.5
      });
      setChecklist(defaultEntryChecklist);
      setRoutineState({
        beforeChecklist: defaultBeforeRoutine,
        duringChecklist: defaultDuringRoutine,
        afterChecklist: defaultAfterRoutine,
        currentMood: 'Focused & Calm',
        notes: ''
      });
      setIsQuickStartOpen(true);
    }
  };

  // Quick trade logging trigger accessed via voice commands
  const handleVoiceAddTrade = (result: 'WIN' | 'LOSS', amount?: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().slice(0, 5);
    const payout = 85;

    // Use standard 1.5% size if none declared
    const size = amount || Math.round(riskLimits.startingBalance * 0.015);
    let computedPnl = 0;
    if (result === 'WIN') {
      computedPnl = size * (payout / 100);
    } else {
      computedPnl = -size;
    }

    const currentHour = new Date().getHours();
    let session: 'Morning' | 'Midday' | 'Evening' = 'Morning';
    if (currentHour >= 12 && currentHour < 17) session = 'Midday';
    else if (currentHour >= 17 || currentHour < 6) session = 'Evening';

    const cleanSize = size / riskLimits.startingBalance * 100;
    const isConsistent = cleanSize >= riskLimits.minTradeSizePercent && cleanSize <= riskLimits.maxTradeSizePercent;

    const voiceTrade: Trade = {
      id: 'voice_' + Date.now(),
      date: todayStr,
      time: timeStr,
      strategyId: 'trend_continuation',
      type: 'LONG',
      amount: size,
      result,
      payoutRate: payout,
      pnl: parseFloat(computedPnl.toFixed(2)),
      session,
      isEmotional: false,
      positionConsistencyChecked: isConsistent,
      notes: 'Voice logged execution creation.'
    };

    setTrades(prev => [voiceTrade, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-slate-950">
      
      {/* Primary Top Header Frame */}
      <header className="border-b border-slate-900 bg-slate-950 px-4 sm:px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Logo and system status */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-indigo-950 rounded-xl border border-indigo-850/60 shadow-lg text-indigo-400 shrink-0">
              <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-sans font-extrabold text-slate-100 tracking-tight text-base sm:text-lg flex items-center gap-1">
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">NEUROTACTIX</span>
                  <span className="text-slate-400 font-mono text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">OS</span>
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-bold hidden md:inline">
                  v3.4 ENTERPRISE
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-emerald-400/50 shadow"></span>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold text-emerald-400">Tactical Control Active</span>
                <span className="text-slate-700 font-mono text-[9px] hidden sm:inline">•</span>
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 hidden sm:inline">Quantitative Execution Terminal</span>
              </div>
            </div>
          </div>

          {/* Master Accounts, Balance & Quick Setup */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Master Balance Pill */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 text-right">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-500 block font-mono">Master Balance</span>
              <span className="text-xs sm:text-sm font-mono text-emerald-400 font-semibold">${currentBalance.toFixed(2)}</span>
            </div>

            {/* Account Parameters Setup Button */}
            <button
              onClick={() => setIsQuickStartOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-600 text-slate-400 hover:text-indigo-300 transition"
              title="Terminal Parameters & Prop Firm Sizing Setup"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* User Account & Profile Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition text-xs font-mono"
              title="Manage Trader Account & Email Sign-In"
            >
              <div className="w-5 h-5 rounded-md bg-indigo-950 border border-indigo-800 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">
                {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'T'}
              </div>
              <span className="max-w-[100px] truncate hidden md:inline text-slate-300 font-medium">
                {currentUser.email || currentUser.name}
              </span>
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border hidden sm:inline ${
                currentUser.plan === 'pro' 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : currentUser.plan === 'elite'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {currentUser.plan}
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Action Ribbon - Clean Horizontal Row */}
        <div className="mt-2.5 pt-2 border-t border-slate-900/80 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            {currentUser.plan === 'free' ? (
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 transition text-[11px] font-mono shadow-sm cursor-pointer whitespace-nowrap"
                title="Upgrade to Pro Plan ($29/mo) - Remove all ads"
              >
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="font-bold">Upgrade Pro</span>
                <span className="text-[9px] px-1 rounded bg-amber-500/30 text-amber-200">No Ads</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-600/60 text-indigo-300 hover:text-indigo-200 transition text-[11px] font-mono shadow-sm whitespace-nowrap"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span className="font-bold uppercase">{currentUser.plan} Active</span>
              </button>
            )}

            {currentWinStreakInfo.streak >= 3 && (
              <button
                onClick={() => handleTriggerStreakCelebration()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 transition text-[11px] font-mono shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="font-bold">{currentWinStreakInfo.streak}W Streak</span>
                <span className="text-[10px] text-emerald-400 hidden xs:inline">(+${currentWinStreakInfo.pnl.toFixed(2)})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsComplianceOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-900/50 text-indigo-300 hover:text-indigo-200 transition text-[11px] font-mono whitespace-nowrap"
              title="Store & Legal Compliance Center"
            >
              <Smartphone className="w-3 h-3 text-indigo-400" />
              <span>Store & Legal</span>
            </button>

            <button
              onClick={handleClearData}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-900 text-slate-500 hover:text-red-400 transition"
              title="Reset Database & Account Setup"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace split layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-130px)] lg:overflow-hidden">
        
        {/* Left Interactive Control board (8 columns) */}
        <section className="lg:col-span-8 flex flex-col gap-5 lg:overflow-y-auto pr-1">
          
          {/* Google AdSense / Sponsor Banner (Only shown for Free Plan) */}
          <GoogleAdBanner
            user={currentUser}
            onOpenPricing={() => setIsPricingModalOpen(true)}
            format="horizontal"
          />

          {/* Navigation Control bar - Swipeable Horizontal Ribbon */}
          <nav className="bg-slate-900 border border-slate-800/80 p-1.5 rounded-xl overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-max">
              <button
                onClick={() => setActiveTab('plan')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'plan'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" /> TRADING PLAN
              </button>
              
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'calendar'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <CalendarRange className="w-4 h-4 shrink-0" /> P&L CALENDAR
              </button>

              <button
                onClick={() => setActiveTab('routine')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'routine'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" /> DAILY ROUTINE
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'tracker'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0" /> STRATEGY TRACKER
              </button>

              <button
                onClick={() => setActiveTab('review')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'review'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" /> WEEKLY REVIEW
              </button>

              <button
                onClick={() => setActiveTab('volatility_layer')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'volatility_layer'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <Radio className="w-4 h-4 shrink-0 text-amber-400" /> VOLATILITY LAYER
              </button>

              <button
                onClick={() => setActiveTab('replay_engine')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'replay_engine'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <FastForward className="w-4 h-4 shrink-0 text-purple-400" /> REPLAY SIMULATOR
              </button>

              <button
                onClick={() => setActiveTab('quant_analytics')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'quant_analytics'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0 text-emerald-400" /> QUANT ANALYTICS
              </button>

              <button
                onClick={() => setActiveTab('gamification')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'gamification'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <Trophy className="w-4 h-4 shrink-0 text-amber-400" /> DISCIPLINE XP
              </button>

              <button
                onClick={() => setActiveTab('execution_coach')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'execution_coach'
                    ? 'bg-pink-950 text-pink-300 border border-pink-800 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <Brain className="w-4 h-4 shrink-0 text-pink-400" /> AI COACH 2.0
              </button>

              <button
                onClick={() => setActiveTab('dna_lab')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'dna_lab'
                    ? 'bg-purple-950 text-purple-300 border border-purple-900/80 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <Dna className="w-4 h-4 shrink-0 text-purple-400" /> TRADER DNA & SIM
              </button>

              <button
                onClick={() => setActiveTab('ai_intelligence')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'ai_intelligence'
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }`}
              >
                <BrainCircuit className="w-4 h-4 shrink-0 text-indigo-400 animate-pulse" /> AI INTELLIGENCE
              </button>

              <button
                onClick={() => setActiveTab('premium_guardian')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition whitespace-nowrap shrink-0 ${
                  activeTab === 'premium_guardian'
                    ? 'bg-gradient-to-r from-indigo-950 to-purple-950 text-amber-300 border border-amber-500/50 shadow-md'
                    : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-950/40'
                }`}
              >
                <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                <span>PRO GUARDIAN</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">PRO</span>
              </button>
            </div>
          </nav>

          {/* Active Tab View routers */}
          <div className="flex-grow">
            {activeTab === 'plan' && (
              <PlanModule
                riskLimits={riskLimits}
                setRiskLimits={setRiskLimits}
                checklist={checklist}
                setChecklist={setChecklist}
                trades={trades}
                violations={violations}
                currentBalance={currentBalance}
              />
            )}
            
            {activeTab === 'calendar' && (
              <PnlCalendar
                trades={trades}
                setTrades={setTrades}
                riskLimits={riskLimits}
                onTriggerStreakToast={handleTriggerStreakCelebration}
              />
            )}

            {activeTab === 'volatility_layer' && (
              <MarketVolatilityLayer
                trades={trades}
              />
            )}

            {activeTab === 'replay_engine' && (
              <InstitutionalReplayEngine />
            )}

            {activeTab === 'quant_analytics' && (
              <ProfessionalAnalytics
                trades={trades}
                startingBalance={riskLimits.startingBalance}
              />
            )}

            {activeTab === 'gamification' && (
              <GamificationHub
                trades={trades}
              />
            )}

            {activeTab === 'execution_coach' && (
              <ExecutionCoach
                trades={trades}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'routine' && (
              <DailyRoutine
                routineState={routineState}
                setRoutineState={setRoutineState}
              />
            )}

            {activeTab === 'tracker' && (
              <StrategyPerformance
                trades={trades}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'review' && (
              <WeeklyReview
                trades={trades}
              />
            )}

            {activeTab === 'dna_lab' && (
              <TraderDnaSimulator
                trades={trades}
                riskLimits={riskLimits}
                onApplyPreset={(preset) => setRiskLimits(prev => ({ ...prev, ...preset }))}
              />
            )}

            {activeTab === 'ai_intelligence' && (
              <AiMarketIntelligence />
            )}

            {activeTab === 'premium_guardian' && (
              <PremiumGuardian
                trades={trades}
                riskLimits={riskLimits}
                user={currentUser}
                onOpenPricing={() => setIsPricingModalOpen(true)}
              />
            )}
          </div>
        </section>

        {/* Right Voice assistant Sidebar Command deck (4 columns) - Desktop Only */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col justify-between lg:overflow-y-auto">
          <VoiceAssistant
            onNavigate={(id) => setActiveTab(id)}
            onAddQuickTrade={handleVoiceAddTrade}
            trades={trades}
            violationsCount={violations.length}
          />
        </aside>

      </main>

      {/* Mobile Floating Action Button (FAB) for OS Command Decryptor */}
      <div className="fixed bottom-5 right-5 z-40 lg:hidden">
        <button
          onClick={() => setIsMobileCommandDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 text-white shadow-2xl shadow-indigo-950/90 border border-indigo-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Open OS Command Decryptor & Voice Terminal"
        >
          <BrainCircuit className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-tight">OS Command</span>
          {violations.length > 0 ? (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white">
              {violations.length}
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </button>
      </div>

      {/* Mobile OS Command Slide-up Drawer */}
      {isMobileCommandDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fade-in">
          <div 
            className="fixed inset-0"
            onClick={() => setIsMobileCommandDrawerOpen(false)}
          />
          <div className="relative z-10 bg-slate-900 border-t border-slate-700/80 rounded-t-3xl max-h-[85vh] h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Top Handle & Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="w-8"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-1 bg-slate-700 rounded-full mb-2"></div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">OS Command Decryptor</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileCommandDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Drawer Body with VoiceAssistant */}
            <div className="flex-1 overflow-y-auto p-4">
              <VoiceAssistant
                onNavigate={(id) => {
                  setActiveTab(id);
                  setIsMobileCommandDrawerOpen(false);
                }}
                onAddQuickTrade={handleVoiceAddTrade}
                trades={trades}
                violationsCount={violations.length}
              />
            </div>
          </div>
        </div>
      )}

      {/* Clean compact screen boundary guidelines warning bar & compliance trigger */}
      <footer className="border-t border-slate-900/80 bg-slate-950 px-6 py-2.5 flex items-center justify-between text-[11px] text-slate-500 shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <span>🛡 Risk Sizing: <span className="text-emerald-400 font-semibold">1-2% Target</span></span>
          <span className="text-slate-800">•</span>
          <button
            onClick={() => setIsComplianceOpen(true)}
            className="text-slate-400 hover:text-indigo-400 transition underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="w-3 h-3 text-indigo-400" />
            <span>Store Compliance & Legal Notice</span>
          </button>
        </div>
        <span className="hidden leading-normal sm:inline-block">Non-custodial trading journal & discipline cockpit. No broker execution or financial advice provided.</span>
      </footer>

      {/* App Store & Legal Compliance Modal */}
      <AppStoreComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
      />

      {/* Subtle Win Streak Toast Notification (Positive Reinforcement) */}
      <WinStreakToast
        isOpen={streakToast.isOpen}
        onClose={() => setStreakToast(prev => ({ ...prev, isOpen: false }))}
        streakCount={streakToast.streakCount}
        streakPnl={streakToast.streakPnl}
        autoCloseMs={6000}
        onViewCalendar={() => setActiveTab('calendar')}
      />

      {/* User Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
        onOpenPricing={() => {
          setIsAuthModalOpen(false);
          setIsPricingModalOpen(true);
        }}
      />

      {/* Tiered Subscription & Monetization Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentUser={currentUser}
        onUpdatePlan={handleUpdatePlan}
        onUpdatePublisherId={handleUpdatePublisherId}
      />

      {/* Zero-State Initial Setup & Account Parameters Modal */}
      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
        onSaveConfig={handleSaveAccountSetup}
        currentLimits={riskLimits}
      />

    </div>
  );
}
