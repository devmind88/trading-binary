import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Clock, 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  Target, 
  ShieldAlert, 
  Layers, 
  BarChart2, 
  Percent, 
  Flame, 
  Info,
  Calendar,
  Activity,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { Trade, StrategyId } from '../types';
import { approvedStrategies } from '../data';

interface PredictiveAnalyticsProps {
  trades: Trade[];
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ trades }) => {
  // Simulator & Forecast Setup State
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId>('trend_continuation');
  const [selectedDirection, setSelectedDirection] = useState<'CALL' | 'PUT'>('CALL');
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    const currentUTC = new Date().getUTCHours();
    return currentUTC;
  });
  const [marketRegime, setMarketRegime] = useState<'normal' | 'high_volatility' | 'compressed_range' | 'news_risk'>('normal');
  const [tradeSequenceContext, setTradeSequenceContext] = useState<'fresh' | 'after_win' | 'after_loss' | 'after_two_losses'>('fresh');
  const [traderMentalState, setTraderMentalState] = useState<'focused' | 'neutral' | 'fatigued' | 'impulsive'>('focused');
  const [activeSubTab, setActiveSubTab] = useState<'forecaster' | 'time_matrix' | 'scenario_compare'>('forecaster');

  // Sync to current UTC hour
  const handleSyncLiveHour = () => {
    setSelectedHour(new Date().getUTCHours());
  };

  // 1. Time-of-Day Historical Analysis (24 Hours)
  const hourlyPerformance = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return hours.map(hour => {
      // Find trades that happened in this UTC hour (or local hour string)
      const matchingTrades = trades.filter(t => {
        if (!t.time) return false;
        const h = parseInt(t.time.split(':')[0], 10);
        return h === hour;
      });

      const total = matchingTrades.length;
      const wins = matchingTrades.filter(t => t.result === 'WIN').length;
      const losses = matchingTrades.filter(t => t.result === 'LOSS').length;
      const winRate = total > 0 ? Math.round((wins / (wins + losses || 1)) * 100) : 0;
      const netPnl = matchingTrades.reduce((acc, t) => acc + t.pnl, 0);

      let sessionLabel = 'Asian Session';
      if (hour >= 7 && hour < 12) sessionLabel = 'London Session';
      else if (hour >= 12 && hour < 16) sessionLabel = 'London / NY Overlap';
      else if (hour >= 16 && hour < 21) sessionLabel = 'NY Afternoon';
      else if (hour >= 21 || hour < 7) sessionLabel = 'Asian / Pacific';

      return {
        hour,
        hourFormatted: `${hour.toString().padStart(2, '0')}:00`,
        total,
        wins,
        losses,
        winRate,
        netPnl: parseFloat(netPnl.toFixed(2)),
        sessionLabel
      };
    });
  }, [trades]);

  // 2. Strategy-Specific Historical Breakdown
  const strategyStats = useMemo(() => {
    const map = new Map<StrategyId, { total: number; wins: number; winRate: number; avgPnl: number; callWins: number; callTotal: number; putWins: number; putTotal: number }>();
    
    approvedStrategies.forEach(s => {
      const sTrades = trades.filter(t => t.strategyId === s.id);
      const total = sTrades.length;
      const wins = sTrades.filter(t => t.result === 'WIN').length;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 62; // Default empirical base if small sample
      
      const callTrades = sTrades.filter(t => t.type === 'CALL');
      const callWins = callTrades.filter(t => t.result === 'WIN').length;
      const putTrades = sTrades.filter(t => t.type === 'PUT');
      const putWins = putTrades.filter(t => t.result === 'WIN').length;

      const netPnl = sTrades.reduce((acc, t) => acc + t.pnl, 0);
      const avgPnl = total > 0 ? netPnl / total : 0;

      map.set(s.id, {
        total,
        wins,
        winRate,
        avgPnl: parseFloat(avgPnl.toFixed(2)),
        callWins,
        callTotal: callTrades.length,
        putWins,
        putTotal: putTrades.length
      });
    });

    return map;
  }, [trades]);

  // 3. Sequential Post-Loss / Post-Win Statistical Drift
  const sequentialDrift = useMemo(() => {
    let afterWinTotal = 0;
    let afterWinWins = 0;
    let afterLossTotal = 0;
    let afterLossWins = 0;
    let emotionalTotal = 0;
    let emotionalWins = 0;

    for (let i = 1; i < trades.length; i++) {
      const prev = trades[i - 1];
      const curr = trades[i];

      if (prev.result === 'WIN') {
        afterWinTotal++;
        if (curr.result === 'WIN') afterWinWins++;
      } else if (prev.result === 'LOSS') {
        afterLossTotal++;
        if (curr.result === 'WIN') afterLossWins++;
      }

      if (curr.isEmotional) {
        emotionalTotal++;
        if (curr.result === 'WIN') emotionalWins++;
      }
    }

    return {
      afterWinWinRate: afterWinTotal > 0 ? Math.round((afterWinWins / afterWinTotal) * 100) : 64,
      afterLossWinRate: afterLossTotal > 0 ? Math.round((afterLossWins / afterLossTotal) * 100) : 48,
      emotionalWinRate: emotionalTotal > 0 ? Math.round((emotionalWins / emotionalTotal) * 100) : 36,
      afterWinTotal,
      afterLossTotal
    };
  }, [trades]);

  // 4. Multi-Factor Predictive Bayesian Forecasting Model
  const forecast = useMemo(() => {
    const strat = strategyStats.get(selectedStrategy) || { winRate: 60, total: 0, callWins: 0, callTotal: 0, putWins: 0, putTotal: 0 };
    const hourData = hourlyPerformance[selectedHour] || { winRate: 50, total: 0, sessionLabel: 'Intraday Session' };
    const sessionName = hourData.sessionLabel || 'Intraday Session';

    // Base prior probability: Blend strategy historical win-rate with default Bayesian prior (60%)
    const priorSampleWeight = Math.min(1, strat.total / 15);
    const baseStrategyWinRate = strat.total > 0 
      ? (strat.winRate * priorSampleWeight) + (60 * (1 - priorSampleWeight))
      : 60;

    // Time-of-Day Modifier
    let timeModifier = 0;
    if (hourData.total >= 3) {
      timeModifier = (hourData.winRate - 55) * 0.35; // Calibrated scaling
    } else {
      // General institutional session heuristic if local hour sample is low
      if (selectedHour >= 12 && selectedHour <= 15) timeModifier = +4.5; // London/NY overlap
      else if (selectedHour >= 7 && selectedHour <= 10) timeModifier = +3.0; // London Open
      else if (selectedHour >= 19 && selectedHour <= 22) timeModifier = -4.0; // Late NY fatigue
      else if (selectedHour >= 1 && selectedHour <= 4) timeModifier = -2.0; // Asian low ATR
    }

    // Directional (CALL / PUT) modifier for strategy
    let directionModifier = 0;
    if (selectedDirection === 'CALL' && strat.callTotal >= 3) {
      const callWR = (strat.callWins / strat.callTotal) * 100;
      directionModifier = (callWR - strat.winRate) * 0.25;
    } else if (selectedDirection === 'PUT' && strat.putTotal >= 3) {
      const putWR = (strat.putWins / strat.putTotal) * 100;
      directionModifier = (putWR - strat.winRate) * 0.25;
    }

    // Market Regime Modifier
    let regimeModifier = 0;
    if (marketRegime === 'normal') regimeModifier = +2.5;
    else if (marketRegime === 'high_volatility') {
      regimeModifier = selectedStrategy === 'trend_continuation' ? +3.0 : -6.5; // Breakouts love volatility, reversals hate it
    } else if (marketRegime === 'compressed_range') {
      regimeModifier = selectedStrategy === 'reversal_zones' ? +4.0 : -5.0;
    } else if (marketRegime === 'news_risk') {
      regimeModifier = -14.0; // Severe penalty during high impact news
    }

    // Sequence / Streak Modifier
    let sequenceModifier = 0;
    if (tradeSequenceContext === 'after_win') {
      sequenceModifier = (sequentialDrift.afterWinWinRate - 55) * 0.2;
    } else if (tradeSequenceContext === 'after_loss') {
      sequenceModifier = (sequentialDrift.afterLossWinRate - 55) * 0.3 - 2.0;
    } else if (tradeSequenceContext === 'after_two_losses') {
      sequenceModifier = -8.5; // Higher tilt/hesitation risk
    }

    // Trader Mental State Modifier
    let mentalModifier = 0;
    if (traderMentalState === 'focused') mentalModifier = +3.5;
    else if (traderMentalState === 'neutral') mentalModifier = 0;
    else if (traderMentalState === 'fatigued') mentalModifier = -7.0;
    else if (traderMentalState === 'impulsive') mentalModifier = -16.0;

    // Calculate Final Forecast Probability
    let rawProb = baseStrategyWinRate + timeModifier + directionModifier + regimeModifier + sequenceModifier + mentalModifier;
    // Bound logically between 20% and 92%
    const forecastedWinRate = Math.max(20, Math.min(92, parseFloat(rawProb.toFixed(1))));

    // Quantitative Binary Options Expectancy:
    // Payout = 82% (0.82 gain per $1 risked on win, -$1 on loss)
    const payoutRate = 0.82;
    const breakEvenWinRate = (1 / (1 + payoutRate)) * 100; // ~54.95%
    const winProb = forecastedWinRate / 100;
    const lossProb = 1 - winProb;
    
    // EV per $100 trade
    const expectedValue100 = (winProb * 82) - (lossProb * 100);
    
    // Kelly Criterion % for Binary Options:
    // f* = (p * b - q) / b where b = 0.82, p = winProb, q = 1 - winProb
    let kellyFraction = 0;
    if (expectedValue100 > 0) {
      kellyFraction = ((winProb * payoutRate) - lossProb) / payoutRate;
      kellyFraction = Math.max(0, Math.min(0.05, kellyFraction * 0.5)); // Safe Half-Kelly capped at 5%
    }
    const recommendedStakePct = parseFloat((kellyFraction * 100).toFixed(2));

    // Execution Verdict
    let verdict: { title: string; color: string; badge: string; desc: string };
    if (forecastedWinRate >= 68 && expectedValue100 > 15) {
      verdict = {
        title: 'PRIME ASYMMETRICAL EDGE',
        color: 'text-emerald-400 border-emerald-500 bg-emerald-950/80',
        badge: 'OPTIMAL SETUP',
        desc: 'All statistical signals converge. Strategy, session hour, and mental focus align with positive historical alpha.'
      };
    } else if (forecastedWinRate >= 56 && expectedValue100 > 0) {
      verdict = {
        title: 'MODERATE POSITIVE EXPECTANCY',
        color: 'text-indigo-300 border-indigo-500 bg-indigo-950/80',
        badge: 'STANDARD EXECUTION',
        desc: 'Edge exceeds break-even requirements. Maintain disciplined standard 1.0% stake sizing without over-leveraging.'
      };
    } else {
      verdict = {
        title: 'NEGATIVE EXPECTANCY / HAZARD',
        color: 'text-rose-400 border-rose-500 bg-rose-950/80',
        badge: 'STAND DOWN / AVOID',
        desc: 'Forecasted win probability is below the 54.9% break-even threshold. High probability of capital erosion.'
      };
    }

    return {
      forecastedWinRate,
      breakEvenWinRate: parseFloat(breakEvenWinRate.toFixed(1)),
      expectedValue100: parseFloat(expectedValue100.toFixed(2)),
      recommendedStakePct,
      verdict,
      factors: [
        { name: 'Base Setup Empirical Edge', value: parseFloat(baseStrategyWinRate.toFixed(1)) - 55, positive: baseStrategyWinRate >= 55 },
        { name: `Time-of-Day (${sessionName})`, value: parseFloat(timeModifier.toFixed(1)), positive: timeModifier >= 0 },
        { name: `Direction Bias (${selectedDirection})`, value: parseFloat(directionModifier.toFixed(1)), positive: directionModifier >= 0 },
        { name: `Market Volatility Regime`, value: parseFloat(regimeModifier.toFixed(1)), positive: regimeModifier >= 0 },
        { name: `Sequence / Streak Momentum`, value: parseFloat(sequenceModifier.toFixed(1)), positive: sequenceModifier >= 0 },
        { name: `Cognitive / Discipline State`, value: parseFloat(mentalModifier.toFixed(1)), positive: mentalModifier >= 0 },
      ]
    };
  }, [
    selectedStrategy,
    selectedDirection,
    selectedHour,
    marketRegime,
    tradeSequenceContext,
    traderMentalState,
    strategyStats,
    hourlyPerformance,
    sequentialDrift
  ]);

  // Identify Best and Worst Historical Hours
  const { bestHours, dangerHours } = useMemo(() => {
    const hoursWithData = hourlyPerformance.filter(h => h.total >= 2);
    const sorted = [...hoursWithData].sort((a, b) => b.winRate - a.winRate);
    return {
      bestHours: sorted.slice(0, 3),
      dangerHours: [...sorted].reverse().slice(0, 3)
    };
  }, [hourlyPerformance]);

  return (
    <div id="predictive-analytics-submodule" className="space-y-6">
      
      {/* Sub-Module Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-xl text-white shadow-lg shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-bold text-slate-100 text-base">
                Predictive Analytics & Setup Probability Forecaster
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-bold">
                Bayesian Alpha Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Forecasts next-trade probability based on historical strategy edges, time-of-day volatility distributions, and cognitive execution states.
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveSubTab('forecaster')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'forecaster'
                ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Forecaster
          </button>
          <button
            onClick={() => setActiveSubTab('time_matrix')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'time_matrix'
                ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24h Time Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('scenario_compare')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'scenario_compare'
                ? 'bg-purple-950 text-purple-300 border border-purple-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scenario Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE FORECASTER */}
      {activeSubTab === 'forecaster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Setup Inputs (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="font-sans font-bold text-sm text-slate-100">Setup Parameter Inputs</h3>
              </div>
              <button
                onClick={handleSyncLiveHour}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/60 px-2 py-1 rounded border border-indigo-900"
              >
                <Clock className="w-3 h-3" /> Sync Live UTC
              </button>
            </div>

            {/* 1. Strategy Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>1. Core Strategy Setup</span>
                <span className="text-[10px] text-purple-400">
                  {strategyStats.get(selectedStrategy)?.winRate}% historical WR ({strategyStats.get(selectedStrategy)?.total} trades)
                </span>
              </label>
              <select
                value={selectedStrategy}
                onChange={e => setSelectedStrategy(e.target.value as StrategyId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                {approvedStrategies.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({strategyStats.get(s.id)?.total || 0} trades logged)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Direction & Time-of-Day */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">2. Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDirection('CALL')}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1 ${
                      selectedDirection === 'CALL'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> CALL
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDirection('PUT')}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center gap-1 ${
                      selectedDirection === 'PUT'
                        ? 'bg-rose-950 text-rose-300 border border-rose-700 shadow'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" /> PUT
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex justify-between">
                  <span>3. Hour (UTC)</span>
                  <span className="text-indigo-400 font-bold">{selectedHour.toString().padStart(2, '0')}:00</span>
                </label>
                <select
                  value={selectedHour}
                  onChange={e => setSelectedHour(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  {hourlyPerformance.map(h => (
                    <option key={h.hour} value={h.hour}>
                      {h.hourFormatted} — {h.sessionLabel.slice(0, 14)} ({h.total > 0 ? `${h.winRate}% WR` : 'No data'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Market Volatility Regime */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">4. Market Volatility & Liquidity Regime</label>
              <select
                value={marketRegime}
                onChange={e => setMarketRegime(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                <option value="normal">Normal Trending / Steady Order Flow (+2.5% edge)</option>
                <option value="high_volatility">High ATR Expansion / Dynamic Breakout</option>
                <option value="compressed_range">Low Volume / Tight Consolidation</option>
                <option value="news_risk">High-Impact News Release Window (-14% penalty)</option>
              </select>
            </div>

            {/* 5. Sequence & Psychological Context */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">5. Prior Sequence</label>
                <select
                  value={tradeSequenceContext}
                  onChange={e => setTradeSequenceContext(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="fresh">Fresh Session (1st Trade)</option>
                  <option value="after_win">Following a Win</option>
                  <option value="after_loss">Following 1 Loss</option>
                  <option value="after_two_losses">Following 2 Losses (Tilt Risk)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">6. Mental Focus</label>
                <select
                  value={traderMentalState}
                  onChange={e => setTraderMentalState(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="focused">Peak Zen & Patient (+3.5%)</option>
                  <option value="neutral">Neutral Execution (0%)</option>
                  <option value="fatigued">Fatigued / Distracted (-7%)</option>
                  <option value="impulsive">Anxious / Rushed (-16%)</option>
                </select>
              </div>
            </div>

            {/* Quick Session Presets */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">Institutional Session Presets</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedHour(8); setMarketRegime('normal'); }}
                  className="px-2 py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-slate-300 text-left"
                >
                  <span className="text-indigo-400 block font-bold">08:00 UTC</span>
                  London Open
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedHour(13); setMarketRegime('high_volatility'); }}
                  className="px-2 py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-slate-300 text-left"
                >
                  <span className="text-emerald-400 block font-bold">13:30 UTC</span>
                  NY Overlap
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedHour(2); setMarketRegime('compressed_range'); }}
                  className="px-2 py-1.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[10px] font-mono text-slate-300 text-left"
                >
                  <span className="text-purple-400 block font-bold">02:00 UTC</span>
                  Asian Range
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Predictive Forecast Output & Bayesian Attribution (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Primary Probability Gauge Card */}
            <div className={`p-6 rounded-xl border ${forecast.verdict.color} space-y-5 shadow-2xl transition-all`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                      Probabilistic Forecast Engine
                    </span>
                    <h3 className="text-sm font-mono font-bold tracking-tight">
                      {forecast.verdict.title}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black/40 border border-slate-700/60 self-start sm:self-auto">
                  {forecast.verdict.badge}
                </span>
              </div>

              {/* Main Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Win Probability */}
                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Forecast Win Probability</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-3xl font-mono font-extrabold ${forecast.forecastedWinRate >= 65 ? 'text-emerald-400' : forecast.forecastedWinRate >= 55 ? 'text-indigo-300' : 'text-rose-400'}`}>
                      {forecast.forecastedWinRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full transition-all duration-500 ${forecast.forecastedWinRate >= 65 ? 'bg-emerald-400' : forecast.forecastedWinRate >= 55 ? 'bg-indigo-400' : 'bg-rose-500'}`}
                      style={{ width: `${forecast.forecastedWinRate}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block pt-1">
                    Break-even: {forecast.breakEvenWinRate}% (82% Payout)
                  </span>
                </div>

                {/* Expected Value */}
                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Expected Value / $100</span>
                  <span className={`text-3xl font-mono font-extrabold block ${forecast.expectedValue100 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {forecast.expectedValue100 >= 0 ? '+' : ''}${forecast.expectedValue100}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    {forecast.expectedValue100 >= 0 ? 'Positive Alpha' : 'Negative Expectancy'}
                  </span>
                </div>

                {/* Sizing Recommendation */}
                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Kelly Recommended Sizing</span>
                  <span className="text-3xl font-mono font-extrabold text-purple-300 block">
                    {forecast.recommendedStakePct > 0 ? `${forecast.recommendedStakePct}%` : '0.0%'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    {forecast.recommendedStakePct > 0 ? 'Safe 0.5x Kelly Fractional' : 'Do Not Execute'}
                  </span>
                </div>

              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed bg-black/30 p-3 rounded-lg border border-slate-850">
                {forecast.verdict.desc}
              </p>

            </div>

            {/* Factor Attribution Breakdown Waterfall */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-sans font-bold text-xs text-slate-200">
                    Predictive Bayesian Factor Attribution
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Baseline Target: 55.0%</span>
              </div>

              <div className="space-y-2">
                {forecast.factors.map((factor, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300">{factor.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${factor.positive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                        {factor.value >= 0 ? '+' : ''}{factor.value}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: 24-HOUR TIME-OF-DAY MATRIX & HEATMAP */}
      {activeSubTab === 'time_matrix' && (
        <div className="space-y-6">
          
          {/* 24-Hour Win Rate Distribution Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-sans font-bold text-sm text-slate-100">
                  24-Hour Intraday Win Rate & Volume Distribution (UTC)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Break-even line: 55%
              </span>
            </div>

            {/* Hourly Grid Bars */}
            <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 pt-4">
              {hourlyPerformance.map(h => {
                const isSelected = h.hour === selectedHour;
                const hasTrades = h.total > 0;
                const isWinning = h.winRate >= 55;

                return (
                  <button
                    key={h.hour}
                    onClick={() => { setSelectedHour(h.hour); setActiveSubTab('forecaster'); }}
                    className={`flex flex-col items-center p-2 rounded-lg border transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950 border-purple-500 shadow-lg'
                        : hasTrades
                        ? isWinning
                          ? 'bg-emerald-950/40 border-emerald-900/60 hover:border-emerald-500'
                          : 'bg-rose-950/40 border-rose-900/60 hover:border-rose-500'
                        : 'bg-slate-950 border-slate-850 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 font-bold block mb-1">
                      {h.hour.toString().padStart(2, '0')}h
                    </span>
                    
                    {/* Bar representation */}
                    <div className="h-20 w-full bg-slate-900 rounded flex flex-col justify-end p-0.5 overflow-hidden">
                      {hasTrades ? (
                        <div
                          className={`w-full rounded-sm transition-all ${
                            isWinning ? 'bg-emerald-400' : 'bg-rose-500'
                          }`}
                          style={{ height: `${Math.max(15, h.winRate)}%` }}
                        />
                      ) : (
                        <div className="w-full bg-slate-800 h-1 rounded" />
                      )}
                    </div>

                    <span className={`text-[10px] font-mono font-bold mt-1.5 block ${
                      hasTrades 
                        ? isWinning ? 'text-emerald-400' : 'text-rose-400'
                        : 'text-slate-600'
                    }`}>
                      {hasTrades ? `${h.winRate}%` : '-'}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 block">
                      {h.total} tr
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-slate-850 gap-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Positive Edge (&gt;55%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Negative Edge (&lt;55%)
                </span>
              </div>
              <span className="text-slate-500">Click any hour block to load into the Predictive Forecaster.</span>
            </div>
          </div>

          {/* Golden Execution Windows vs Danger Killzones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Golden Windows */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Flame className="w-4 h-4 text-emerald-400" />
                <h4 className="font-sans font-bold text-sm text-slate-100">
                  Golden Execution Windows (Highest Alpha)
                </h4>
              </div>
              <div className="space-y-2">
                {bestHours.length > 0 ? (
                  bestHours.map(h => (
                    <div key={h.hour} className="bg-slate-950 p-3 rounded-lg border border-emerald-900/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-300">{h.hourFormatted} UTC</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {h.sessionLabel}
                          </span>
                        </div>
                        <span className="text-[10px] font-sans text-slate-400 mt-0.5 block">
                          {h.wins} Wins / {h.losses} Losses ({h.total} contracts)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-mono font-bold text-emerald-400">{h.winRate}%</span>
                        <span className="text-[10px] font-mono text-emerald-500 block">+${h.netPnl} Net</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-3">Log more trades to surface top statistical execution hours.</p>
                )}
              </div>
            </div>

            {/* Danger Killzones */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h4 className="font-sans font-bold text-sm text-slate-100">
                  Danger Killzones (High Penalty / Low Edge)
                </h4>
              </div>
              <div className="space-y-2">
                {dangerHours.length > 0 ? (
                  dangerHours.map(h => (
                    <div key={h.hour} className="bg-slate-950 p-3 rounded-lg border border-rose-900/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-rose-300">{h.hourFormatted} UTC</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                            {h.sessionLabel}
                          </span>
                        </div>
                        <span className="text-[10px] font-sans text-slate-400 mt-0.5 block">
                          {h.wins} Wins / {h.losses} Losses ({h.total} contracts)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-mono font-bold text-rose-400">{h.winRate}%</span>
                        <span className="text-[10px] font-mono text-rose-500 block">${h.netPnl} Net</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-3">No negative outlier hours identified yet.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: SCENARIO MATRIX COMPARISON */}
      {activeSubTab === 'scenario_compare' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="font-sans font-bold text-sm text-slate-100">
                Multi-Strategy Session Cross-Tabulation Matrix
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Empirical Historical Comparison</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3">Strategy Setup</th>
                  <th className="py-2.5 px-3">Total Verified</th>
                  <th className="py-2.5 px-3">Historical Win Rate</th>
                  <th className="py-2.5 px-3">CALL Accuracy</th>
                  <th className="py-2.5 px-3">PUT Accuracy</th>
                  <th className="py-2.5 px-3">Avg P&L / Trade</th>
                  <th className="py-2.5 px-3 text-right">Edge Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs font-mono">
                {approvedStrategies.map(s => {
                  const stat = strategyStats.get(s.id) || { total: 0, winRate: 60, callWins: 0, callTotal: 0, putWins: 0, putTotal: 0, avgPnl: 0 };
                  const callWR = stat.callTotal > 0 ? Math.round((stat.callWins / stat.callTotal) * 100) : 60;
                  const putWR = stat.putTotal > 0 ? Math.round((stat.putWins / stat.putTotal) * 100) : 60;

                  return (
                    <tr key={s.id} className="hover:bg-slate-950/60 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-200 block">{s.name}</span>
                        <span className="text-[10px] font-sans text-slate-500">{s.marketConditionsBest.slice(0, 45)}...</span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{stat.total} trades</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${stat.winRate >= 65 ? 'text-emerald-400' : stat.winRate >= 55 ? 'text-indigo-300' : 'text-rose-400'}`}>
                          {stat.winRate}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {callWR}% <span className="text-[10px] text-slate-500">({stat.callTotal})</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {putWR}% <span className="text-[10px] text-slate-500">({stat.putTotal})</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={stat.avgPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {stat.avgPnl >= 0 ? '+' : ''}${stat.avgPnl}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          stat.winRate >= 68 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}>
                          {stat.winRate >= 68 ? 'GRADE A+' : stat.winRate >= 58 ? 'GRADE B+' : 'GRADE C'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
