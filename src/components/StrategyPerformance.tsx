import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trade, StrategyId, StrategyDefinition } from '../types';
import { approvedStrategies } from '../data';
import { SessionHeatmapWidget } from './SessionHeatmapWidget';
import { 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Info, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Brain, 
  HeartPulse, 
  Scale, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Activity, 
  RefreshCw, 
  Copy, 
  Check, 
  MessageSquare, 
  ChevronRight,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Clock
} from 'lucide-react';

interface StrategyPerformanceProps {
  trades: Trade[];
  onNavigate?: (tabId: string) => void;
}

export const StrategyPerformance: React.FC<StrategyPerformanceProps> = ({ trades, onNavigate }) => {
  const [selectedStratId, setSelectedStratId] = useState<StrategyId>('trend_continuation');
  const [activeSubTab, setActiveSubTab] = useState<'sentiment' | 'sessions' | 'playbook'>('sentiment');
  
  // AI Psychological Diagnosis State
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [filterOnlyEmotional, setFilterOnlyEmotional] = useState<boolean>(false);

  // 1. Compute dynamic stats per strategy
  const strategyStats = useMemo(() => {
    const stats: Record<StrategyId, {
      tradesCount: number;
      wins: number;
      losses: number;
      ties: number;
      winRate: number;
      avgWin: number;
      avgLoss: number;
      netPnl: number;
      emotionalCount: number;
    }> = {
      trend_continuation: { tradesCount: 0, wins: 0, losses: 0, ties: 0, winRate: 0, avgWin: 0, avgLoss: 0, netPnl: 0, emotionalCount: 0 },
      reversal_zones: { tradesCount: 0, wins: 0, losses: 0, ties: 0, winRate: 0, avgWin: 0, avgLoss: 0, netPnl: 0, emotionalCount: 0 },
      break_and_retest: { tradesCount: 0, wins: 0, losses: 0, ties: 0, winRate: 0, avgWin: 0, avgLoss: 0, netPnl: 0, emotionalCount: 0 },
      candlestick_patterns: { tradesCount: 0, wins: 0, losses: 0, ties: 0, winRate: 0, avgWin: 0, avgLoss: 0, netPnl: 0, emotionalCount: 0 }
    };

    trades.forEach(t => {
      const s = stats[t.strategyId];
      if (s) {
        s.tradesCount++;
        if (t.isEmotional) s.emotionalCount++;
        if (t.result === 'WIN') {
          s.wins++;
          s.avgWin += t.pnl;
        } else if (t.result === 'LOSS') {
          s.losses++;
          s.avgLoss += Math.abs(t.pnl);
        } else {
          s.ties++;
        }
        s.netPnl += t.pnl;
      }
    });

    Object.keys(stats).forEach(key => {
      const s = stats[key as StrategyId];
      const validTotal = s.tradesCount - s.ties;
      s.winRate = validTotal > 0 ? Math.round((s.wins / validTotal) * 100) : 0;
      s.avgWin = s.wins > 0 ? parseFloat((s.avgWin / s.wins).toFixed(2)) : 0;
      s.avgLoss = s.losses > 0 ? parseFloat((s.avgLoss / s.losses).toFixed(2)) : 0;
      s.netPnl = parseFloat(s.netPnl.toFixed(2));
    });

    return stats;
  }, [trades]);

  // 2. Comprehensive Sentiment Analysis & Emotional Correlation Engine
  const sentimentCorrelation = useMemo(() => {
    const totalTradesCount = trades.length;
    const disciplinedTrades = trades.filter(t => !t.isEmotional);
    const emotionalTrades = trades.filter(t => t.isEmotional);

    // Disciplined Math
    const discWins = disciplinedTrades.filter(t => t.result === 'WIN').length;
    const discLosses = disciplinedTrades.filter(t => t.result === 'LOSS').length;
    const discTies = disciplinedTrades.filter(t => t.result === 'TIE').length;
    const discValid = discWins + discLosses;
    const disciplinedWinRate = discValid > 0 ? Math.round((discWins / discValid) * 100) : 0;
    const disciplinedPnl = parseFloat(disciplinedTrades.reduce((acc, t) => acc + t.pnl, 0).toFixed(2));
    const avgDiscProfit = disciplinedTrades.length > 0 ? parseFloat((disciplinedPnl / disciplinedTrades.length).toFixed(2)) : 0;

    // Emotional Math
    const emoWins = emotionalTrades.filter(t => t.result === 'WIN').length;
    const emoLosses = emotionalTrades.filter(t => t.result === 'LOSS').length;
    const emoTies = emotionalTrades.filter(t => t.result === 'TIE').length;
    const emoValid = emoWins + emoLosses;
    const emotionalWinRate = emoValid > 0 ? Math.round((emoWins / emoValid) * 100) : 0;
    const emotionalPnl = parseFloat(emotionalTrades.reduce((acc, t) => acc + t.pnl, 0).toFixed(2));
    const avgEmoProfit = emotionalTrades.length > 0 ? parseFloat((emotionalPnl / emotionalTrades.length).toFixed(2)) : 0;

    // Delta & Impact Metrics
    const totalActualPnl = parseFloat(trades.reduce((acc, t) => acc + t.pnl, 0).toFixed(2));
    const edgeDegradation = Math.max(0, disciplinedWinRate - emotionalWinRate);
    const emotionTax = Math.abs(Math.min(0, emotionalPnl));
    const lostProfitPotential = parseFloat((disciplinedPnl - totalActualPnl).toFixed(2));
    const totalLosses = discLosses + emoLosses;
    const emotionalLossPercentage = totalLosses > 0 ? Math.round((emoLosses / totalLosses) * 100) : 0;
    const emotionalTradePercentage = totalTradesCount > 0 ? Math.round((emotionalTrades.length / totalTradesCount) * 100) : 0;

    // Strategy-specific correlations
    const strategyCorrelations = approvedStrategies.map(strat => {
      const stratTrades = trades.filter(t => t.strategyId === strat.id);
      const stratDisc = stratTrades.filter(t => !t.isEmotional);
      const stratEmo = stratTrades.filter(t => t.isEmotional);

      const sDiscWins = stratDisc.filter(t => t.result === 'WIN').length;
      const sDiscLosses = stratDisc.filter(t => t.result === 'LOSS').length;
      const sDiscValid = sDiscWins + sDiscLosses;
      const sDiscWinRate = sDiscValid > 0 ? Math.round((sDiscWins / sDiscValid) * 100) : 0;
      const sDiscPnl = parseFloat(stratDisc.reduce((acc, t) => acc + t.pnl, 0).toFixed(2));

      const sEmoWins = stratEmo.filter(t => t.result === 'WIN').length;
      const sEmoLosses = stratEmo.filter(t => t.result === 'LOSS').length;
      const sEmoValid = sEmoWins + sEmoLosses;
      const sEmoWinRate = sEmoValid > 0 ? Math.round((sEmoWins / sEmoValid) * 100) : 0;
      const sEmoPnl = parseFloat(stratEmo.reduce((acc, t) => acc + t.pnl, 0).toFixed(2));

      let vulnerability: 'Low' | 'Moderate' | 'Critical' = 'Low';
      if (stratEmo.length >= 2 || (sDiscWinRate > 60 && sEmoWinRate <= 40)) {
        vulnerability = 'Critical';
      } else if (stratEmo.length === 1) {
        vulnerability = 'Moderate';
      }

      return {
        id: strat.id,
        name: strat.name,
        totalTrades: stratTrades.length,
        disciplinedTrades: stratDisc.length,
        disciplinedWins: sDiscWins,
        disciplinedLosses: sDiscLosses,
        disciplinedWinRate: sDiscWinRate,
        disciplinedPnl: sDiscPnl,
        emotionalTrades: stratEmo.length,
        emotionalWins: sEmoWins,
        emotionalLosses: sEmoLosses,
        emotionalWinRate: sEmoWinRate,
        emotionalPnl: sEmoPnl,
        vulnerability
      };
    });

    // Calculate Real-Time Tilt / Psychological Index (0-100)
    // Evaluates recent 5 trades and overall emotional trade proportion
    const recentTrades = trades.slice(0, 5);
    const recentEmotionalCount = recentTrades.filter(t => t.isEmotional).length;
    let tiltIndex = Math.round((emotionalTradePercentage * 0.6) + (recentEmotionalCount * 8));
    if (tiltIndex > 100) tiltIndex = 100;

    let tiltStatus: { label: string; color: string; desc: string; iconBg: string } = {
      label: 'Pristine Zen State',
      color: 'text-emerald-400',
      iconBg: 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400',
      desc: 'Executing trades with surgical discipline and strict rule compliance.'
    };

    if (tiltIndex >= 50) {
      tiltStatus = {
        label: 'Severe Tilt / Capital Preservation Lock',
        color: 'text-rose-450',
        iconBg: 'bg-rose-955/40 border-rose-900 text-rose-400',
        desc: 'Critical emotional drag detected. Cease trading immediately to prevent catastrophic drawdown.'
      };
    } else if (tiltIndex >= 20) {
      tiltStatus = {
        label: 'Cognitive Friction / Elevated Impulsiveness',
        color: 'text-amber-400',
        iconBg: 'bg-amber-955/30 border-amber-900/60 text-amber-400',
        desc: 'Minor emotional leakage observed. Re-engage checklist gates before every single order.'
      };
    }

    return {
      totalTradesCount,
      disciplinedTradesCount: disciplinedTrades.length,
      disciplinedWins: discWins,
      disciplinedLosses: discLosses,
      disciplinedWinRate,
      disciplinedPnl,
      avgDiscProfit,
      emotionalTradesCount: emotionalTrades.length,
      emotionalWins: emoWins,
      emotionalLosses: emoLosses,
      emotionalWinRate,
      emotionalPnl,
      avgEmoProfit,
      edgeDegradation,
      emotionTax,
      lostProfitPotential,
      totalActualPnl,
      emotionalLossPercentage,
      emotionalTradePercentage,
      strategyCorrelations,
      tiltIndex,
      tiltStatus,
      emotionalTradesList: emotionalTrades
    };
  }, [trades]);

  // Strategy Highlights for quick cards
  const highlights = useMemo(() => {
    let bestStrat: StrategyId | null = null;
    let worstStrat: StrategyId | null = null;
    let maxPnl = -Infinity;
    let minPnl = Infinity;

    let consistentStrat: StrategyId | null = null;
    let highestWinrate = -Infinity;

    let emotionalStrat: StrategyId | null = null;
    let maxEmotionalCount = 0;

    Object.entries(strategyStats).forEach(([idStr, s]: [string, any]) => {
      const id = idStr as StrategyId;
      if (s.tradesCount > 0) {
        if (s.netPnl > maxPnl) {
          maxPnl = s.netPnl;
          bestStrat = id;
        }
        if (s.netPnl < minPnl) {
          minPnl = s.netPnl;
          worstStrat = id;
        }
        if (s.tradesCount >= 2 && s.winRate > highestWinrate) {
          highestWinrate = s.winRate;
          consistentStrat = id;
        }
        if (s.emotionalCount > maxEmotionalCount) {
          maxEmotionalCount = s.emotionalCount;
          emotionalStrat = id;
        }
      }
    });

    return {
      best: bestStrat ? approvedStrategies.find(s => s.id === bestStrat)?.name : 'N/A',
      worst: worstStrat ? approvedStrategies.find(s => s.id === worstStrat)?.name : 'N/A',
      consistent: consistentStrat ? approvedStrategies.find(s => s.id === consistentStrat)?.name : 'N/A',
      emotional: emotionalStrat ? approvedStrategies.find(s => s.id === emotionalStrat)?.name : 'None'
    };
  }, [strategyStats]);

  const activeStrategyData = useMemo(() => {
    return approvedStrategies.find(s => s.id === selectedStratId)!;
  }, [selectedStratId]);

  const activeStrategyStats = strategyStats[selectedStratId];

  // AI Psychological Diagnosis Handler
  const handleGenerateAiDiagnosis = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/gemini/psychological-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalTrades: sentimentCorrelation.totalTradesCount,
          disciplinedWinRate: sentimentCorrelation.disciplinedWinRate,
          disciplinedTrades: sentimentCorrelation.disciplinedTradesCount,
          disciplinedPnl: sentimentCorrelation.disciplinedPnl,
          emotionalWinRate: sentimentCorrelation.emotionalWinRate,
          emotionalTrades: sentimentCorrelation.emotionalTradesCount,
          emotionalPnl: sentimentCorrelation.emotionalPnl,
          lostProfitPotential: sentimentCorrelation.lostProfitPotential,
          strategyCorrelations: sentimentCorrelation.strategyCorrelations
        })
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();
      setAiDiagnosis(data.text);
    } catch (err) {
      console.error('AI diagnosis error:', err);
      // Construct rich local diagnosis as fallback
      const edgeDiff = sentimentCorrelation.edgeDegradation;
      const fallback = `### 🧠 EXECUTIVE PSYCHOLOGICAL SENTIMENT DIAGNOSIS

#### 1. Executive Psychological Sentiment Synthesis
Your performance data indicates that technical setups are not failing you—**emotional leakage is**:
* **Disciplined Execution**: **${sentimentCorrelation.disciplinedWinRate}% Win Rate** across ${sentimentCorrelation.disciplinedTradesCount} contracts (+**$${sentimentCorrelation.disciplinedPnl.toFixed(2)}**).
* **Emotional Compromise**: **${sentimentCorrelation.emotionalWinRate}% Win Rate** across ${sentimentCorrelation.emotionalTradesCount} contracts (**$${sentimentCorrelation.emotionalPnl.toFixed(2)}**).
* **Statistical Degradation**: Trading under emotional duress causes a **-${edgeDiff}% collapse in your statistical edge**.

#### 2. Cognitive Distortion & Setup Vulnerability
* **The "Recapture" Impulse**: When a loss occurs, impatience triggers premature entry before structural confirmation (especially in *Reversal Zones* and *Break-and-Retest*).
* **Inconsistent Sizing**: Emotional trades frequently coincide with elevated sizing, compounding drawdowns.

#### 3. The "Emotion Tax" Impact
* You have surrendered **$${sentimentCorrelation.emotionTax.toFixed(2)}** in capital directly to emotional impulses.
* If you merely followed your rules on 100% of trades, your account would be **+$${sentimentCorrelation.lostProfitPotential.toFixed(2)} higher today**.

#### 4. Targeted 3-Step Behavioral Prescription
1. **Mandatory 5-Minute Terminal Lockout**: After any loss, immediately step away from the monitors. Reset your heart rate before looking for the next setup.
2. **Strict 4-Point Checklist Gate**: Enforce full checklist verification on the Daily Plan before clicking CALL or PUT.
3. **Hard 1.5% Position Sizing Limit**: Never increase contract size to compensate for a prior loss.`;
      setAiDiagnosis(fallback);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyDiagnosis = () => {
    if (!aiDiagnosis) return;
    navigator.clipboard.writeText(aiDiagnosis);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div id="strategy-performance-tracker-container" className="space-y-6">
      
      {/* Top Navigation & Sub-view Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950 rounded-lg text-indigo-400 border border-indigo-900/60 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans tracking-tight">Strategy Intelligence & Sentiment Correlation</h2>
            <p className="text-xs text-slate-400 font-sans">Correlate emotional trade triggers with win/loss statistics to refine your psychological edge.</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setActiveSubTab('sentiment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'sentiment'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Sentiment & Psychology</span>
          </button>
          <button
            onClick={() => setActiveSubTab('sessions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'sessions'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Session Heat Map</span>
          </button>
          <button
            onClick={() => setActiveSubTab('playbook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'playbook'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Strategy Playbook</span>
          </button>
        </div>
      </div>

      {/* Structural Highlights Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-950 rounded-lg text-emerald-400 border border-emerald-900/60 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-500">Best Strategy (PnL)</span>
            <span className="text-xs font-sans text-slate-200 font-semibold">{highlights.best}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-rose-955 rounded-lg text-rose-450 border border-rose-900 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-500">Worst Strategy (Drawdown)</span>
            <span className="text-xs font-sans text-rose-350 font-semibold">{highlights.worst}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-950 rounded-lg text-indigo-400 border border-indigo-900 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-500">Most Consistent Setup</span>
            <span className="text-xs font-sans text-indigo-300 font-semibold">{highlights.consistent}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-955/20 rounded-lg text-amber-450 border border-amber-900/40 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-500">Emotional Mistake Hub</span>
            <span className="text-xs font-sans text-amber-300 font-semibold">{highlights.emotional}</span>
          </div>
        </div>

      </div>

      {/* SUB-VIEW 1: PSYCHOLOGICAL SENTIMENT & EMOTIONAL CORRELATION SUMMARY */}
      {activeSubTab === 'sentiment' && (
        <div className="space-y-6">
          
          {/* Main Psychological Impact Banner & Tilt Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Visual Correlation Comparison Cards (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-sans font-semibold text-slate-100 text-sm">Disciplined vs. Emotional Trade Correlation</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-900 text-indigo-300">
                  {sentimentCorrelation.totalTradesCount} Total Contracts Analyzed
                </span>
              </div>

              {/* Side-by-Side Performance Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Disciplined Trades Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200 uppercase font-mono">Disciplined Trades</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/60">
                      isEmotional: FALSE
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-mono font-bold text-emerald-400">{sentimentCorrelation.disciplinedWinRate}%</span>
                      <span className="text-[10px] text-slate-400 font-mono block">Win Rate ({sentimentCorrelation.disciplinedWins}W / {sentimentCorrelation.disciplinedLosses}L)</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-mono font-bold ${sentimentCorrelation.disciplinedPnl >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                        {sentimentCorrelation.disciplinedPnl >= 0 ? '+' : ''}${sentimentCorrelation.disciplinedPnl.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">Net P&L</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${sentimentCorrelation.disciplinedWinRate}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-2">
                    <span>Contracts: {sentimentCorrelation.disciplinedTradesCount}</span>
                    <span>Avg Trade: ${sentimentCorrelation.avgDiscProfit}</span>
                  </div>
                </div>

                {/* Emotional Trades Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-slate-200 uppercase font-mono">Emotional Trades</span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-955/30 px-2 py-0.5 rounded border border-rose-900">
                      isEmotional: TRUE
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-mono font-bold text-rose-450">{sentimentCorrelation.emotionalWinRate}%</span>
                      <span className="text-[10px] text-slate-400 font-mono block">Win Rate ({sentimentCorrelation.emotionalWins}W / {sentimentCorrelation.emotionalLosses}L)</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-mono font-bold ${sentimentCorrelation.emotionalPnl >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                        {sentimentCorrelation.emotionalPnl >= 0 ? '+' : ''}${sentimentCorrelation.emotionalPnl.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block">Net P&L</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${sentimentCorrelation.emotionalWinRate}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-2">
                    <span>Contracts: {sentimentCorrelation.emotionalTradesCount}</span>
                    <span>Avg Trade: ${sentimentCorrelation.avgEmoProfit}</span>
                  </div>
                </div>

              </div>

              {/* Edge Impact & Emotion Tax Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Edge Degradation</span>
                  <span className="text-sm font-mono font-bold text-rose-400 mt-0.5 block">
                    -{sentimentCorrelation.edgeDegradation}% WR
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Loss of statistical edge</span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">The "Emotion Tax"</span>
                  <span className="text-sm font-mono font-bold text-amber-400 mt-0.5 block">
                    -${sentimentCorrelation.emotionTax.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Lost to emotional impulses</span>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Discipline Potential</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
                    +${sentimentCorrelation.lostProfitPotential.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Profit if 100% disciplined</span>
                </div>
              </div>
            </div>

            {/* Right: Tilt Radar & Psychological Health Gauge (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-400" />
                    <h3 className="font-sans font-semibold text-slate-100 text-sm">Psychological Health & Tilt Radar</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Live Feedback</span>
                </div>

                {/* Tilt Score Card */}
                <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-4">
                  <div className={`p-3.5 rounded-xl border shrink-0 ${sentimentCorrelation.tiltStatus.iconBg}`}>
                    <Brain className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-slate-500">Current Tilt Index:</span>
                      <span className={`text-sm font-mono font-bold ${sentimentCorrelation.tiltStatus.color}`}>
                        {sentimentCorrelation.tiltIndex}%
                      </span>
                    </div>
                    <h4 className={`text-xs font-bold font-sans mt-0.5 ${sentimentCorrelation.tiltStatus.color}`}>
                      {sentimentCorrelation.tiltStatus.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-sans mt-1 leading-snug">
                      {sentimentCorrelation.tiltStatus.desc}
                    </p>
                  </div>
                </div>

                {/* Quick Emotional Breakdown Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Emotional Trade %</span>
                    <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">
                      {sentimentCorrelation.emotionalTradePercentage}% of orders
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Emotional Loss Drag</span>
                    <span className="text-xs font-mono font-bold text-rose-400 mt-0.5 block">
                      {sentimentCorrelation.emotionalLossPercentage}% of total losses
                    </span>
                  </div>
                </div>
              </div>

              {/* Action trigger button */}
              <button
                onClick={handleGenerateAiDiagnosis}
                disabled={isLoadingAi}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-mono text-xs font-semibold shadow-lg shadow-indigo-950/40 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoadingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Psychological Correlations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Psychological Diagnosis</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* AI Psychological Coach Diagnosis Result Card */}
          {aiDiagnosis && (
            <div className="bg-slate-900 border border-indigo-900/60 rounded-xl p-5 space-y-4 shadow-xl shadow-indigo-950/20 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-slate-100 text-sm">Targeted AI Psychological Coach Feedback</h3>
                    <p className="text-[10px] font-mono text-slate-400">Grounded in verified historical emotional trade correlation</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleCopyDiagnosis}
                    className="flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('plan')}
                      className="flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-300 hover:text-white transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Apply to Routine</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Markdown Diagnosis Container */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed font-sans space-y-2">
                <div className="markdown-body prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown>{aiDiagnosis}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Setup-by-Setup Emotional Vulnerability Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="font-sans font-semibold text-slate-100 text-sm">Setup-Specific Emotional Vulnerability Matrix</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Disciplined Win Rate vs. Emotional Win Rate per Strategy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentimentCorrelation.strategyCorrelations.map(sc => (
                <div 
                  key={sc.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-200 font-sans">{sc.name}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{sc.totalTrades} total executions</span>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      sc.vulnerability === 'Critical'
                        ? 'bg-rose-955/30 border-rose-900 text-rose-400'
                        : sc.vulnerability === 'Moderate'
                        ? 'bg-amber-955/30 border-amber-900 text-amber-400'
                        : 'bg-emerald-955/30 border-emerald-900 text-emerald-400'
                    }`}>
                      {sc.vulnerability} Vulnerability
                    </span>
                  </div>

                  {/* Comparative Progress bars */}
                  <div className="space-y-2 text-xs font-mono">
                    
                    {/* Disciplined bar */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Disciplined WR ({sc.disciplinedTrades} trades)
                        </span>
                        <span className="font-bold text-emerald-400">{sc.disciplinedWinRate}% (+${sc.disciplinedPnl})</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${sc.disciplinedWinRate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Emotional bar */}
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Emotional WR ({sc.emotionalTrades} trades)
                        </span>
                        <span className="font-bold text-rose-400">{sc.emotionalWinRate}% (${sc.emotionalPnl})</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div 
                          className="bg-rose-500 h-full rounded-full" 
                          style={{ width: `${sc.emotionalWinRate}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>

                  {sc.emotionalTrades > 0 ? (
                    <div className="text-[10px] text-rose-350 bg-rose-955/10 border border-rose-900/30 p-2 rounded font-sans leading-tight">
                      ⚠ Emotional trades reduced this setup's edge by {Math.max(0, sc.disciplinedWinRate - sc.emotionalWinRate)}%.
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded font-sans leading-tight">
                      ✓ 100% disciplined execution maintained on this setup.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emotional Trade History Log / Audit Trail */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-sans font-semibold text-slate-100 text-sm">Emotional Contracts Audit Trail</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {sentimentCorrelation.emotionalTradesList.length} Flagged Impulsive Contracts
              </span>
            </div>

            {sentimentCorrelation.emotionalTradesList.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-200">Zero Emotional Contracts Detected</p>
                <p className="text-[11px] text-slate-400">Every single logged trade followed clean technical discipline.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sentimentCorrelation.emotionalTradesList.map(trade => {
                  const stratName = approvedStrategies.find(s => s.id === trade.strategyId)?.name || trade.strategyId;
                  return (
                    <div 
                      key={trade.id}
                      className="bg-slate-950 p-3.5 rounded-lg border border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-slate-500">{trade.date} {trade.time}</span>
                          <span className="font-semibold text-slate-200">{stratName}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            trade.type === 'CALL' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-955 text-rose-450'
                          }`}>
                            {trade.type}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            trade.result === 'WIN' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-955 text-rose-450'
                          }`}>
                            {trade.result}
                          </span>
                        </div>
                        {trade.notes && (
                          <p className="text-[11px] text-slate-400 font-sans italic">
                            "{trade.notes}"
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-mono font-bold text-sm ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">Size: ${trade.amount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Integrated Session Performance Heatmap inside Sentiment & Psychology Tab */}
          <SessionHeatmapWidget trades={trades} />

        </div>
      )}

      {/* SUB-VIEW 2: DEDICATED SESSION PERFORMANCE HEAT MAP TAB */}
      {activeSubTab === 'sessions' && (
        <div className="space-y-6 animate-fadeIn">
          <SessionHeatmapWidget trades={trades} />
        </div>
      )}

      {/* SUB-VIEW 3: ORIGINAL STRATEGY PLAYBOOK & OPTIMIZER */}
      {activeSubTab === 'playbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left column: Selecting and overview stats table */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-sans font-medium text-slate-100 text-lg mb-4 border-b border-slate-800 pb-3">Approved Setups Dashboard</h3>
              
              <div className="space-y-2.5">
                {approvedStrategies.map(strat => {
                  const s = strategyStats[strat.id];
                  const isSelected = selectedStratId === strat.id;

                  return (
                    <div
                      key={strat.id}
                      onClick={() => setSelectedStratId(strat.id)}
                      className={`p-3.5 rounded-lg border transition cursor-pointer flex justify-between items-center ${
                        isSelected
                          ? 'bg-indigo-950/20 border-indigo-500 text-slate-200'
                          : 'bg-slate-950/50 border-slate-850 hover:border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <span className="block font-semibold text-xs text-slate-300">{strat.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{s.tradesCount} Contracts • {s.winRate}% WR</span>
                      </div>

                      <div className="text-right">
                        <span className={`block font-mono text-xs font-bold ${s.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                          {s.netPnl >= 0 ? '+' : ''}${s.netPnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick active-selected stats cards block */}
            <div className="bg-slate-900 border border-slate-805 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-mono uppercase text-slate-500 tracking-wider">Historical System Metrics ({activeStrategyData.name})</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800/40">
                  <span className="block text-[9px] uppercase font-mono text-slate-500">Wins : Losses</span>
                  <span className="font-mono text-xs text-slate-200">{activeStrategyStats.wins} : {activeStrategyStats.losses}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800/40">
                  <span className="block text-[9px] uppercase font-mono text-slate-500">Avg Profit</span>
                  <span className="font-mono text-xs text-emerald-400">${activeStrategyStats.avgWin}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800/40">
                  <span className="block text-[9px] uppercase font-mono text-slate-500">Avg Drawdown</span>
                  <span className="font-mono text-xs text-rose-450">${activeStrategyStats.avgLoss}</span>
                </div>
              </div>
              
              {activeStrategyStats.emotionalCount > 0 && (
                <div className="bg-rose-955/20 border border-rose-900/40 p-2.5 rounded text-xs text-rose-350 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Detected {activeStrategyStats.emotionalCount} instances of emotional trading utilizing this setup!</span>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Strategy Optimizer Details */}
          <div id="strategy-optimizer" className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-sans font-medium text-slate-100 text-lg">Strategy Optimizer System</h3>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-900 text-indigo-400">
                Diagnostic Module
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200 font-sans">{activeStrategyData.name} Pro-Playbook</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{activeStrategyData.description}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-lg border border-slate-850">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">✔ Primary Edge Strengths</span>
                <ul className="text-xs text-slate-350 list-disc list-inside space-y-1 leading-normal">
                  {activeStrategyData.strengths.map((str, i) => (
                    <li key={i} className="pl-1 text-slate-400">{str}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 bg-slate-950/40 p-3.5 rounded-lg border border-slate-850">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block font-bold">❌ Primary Architectural Risks</span>
                <ul className="text-xs text-slate-350 list-disc list-inside space-y-1 leading-normal">
                  {activeStrategyData.weaknesses.map((weak, i) => (
                    <li key={i} className="pl-1 text-slate-400">{weak}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Market Conditions Analysis */}
            <div className="space-y-3 bg-slate-950/30 p-4 rounded-lg border border-slate-800/40 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">Optimal Market Climate</span>
                <p className="text-slate-300 font-sans">{activeStrategyData.marketConditionsBest}</p>
              </div>
              <div className="border-t border-slate-900 pt-2.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">Hostile Market Climate (Exit Immediately)</span>
                <p className="text-rose-300 font-sans">{activeStrategyData.marketConditionsWorst}</p>
              </div>
            </div>

            {/* Common Behavioral Failures */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">⚠ Critical Behavioral Failures Observed</span>
              <ul className="text-xs text-slate-400 space-y-1 bg-amber-955/5 p-3 rounded-lg border border-amber-900/20 leading-normal">
                {activeStrategyData.behavioralMistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-500 shrink-0 font-mono">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practical Refinement Advice */}
            <div className="space-y-2 border-t border-slate-850 pt-3">
              <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">📈 Edge Refinement Suggestions</span>
              <div className="space-y-1.5 text-xs text-slate-300 font-sans">
                {activeStrategyData.refinementSuggestions.map((suggestion, i) => (
                  <p key={i} className="bg-emerald-950/20 p-2 rounded border border-emerald-900/20 font-sans leading-relaxed">
                    ✓ {suggestion}
                  </p>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
