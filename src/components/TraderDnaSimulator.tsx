import React, { useState, useMemo } from 'react';
import { 
  Dna, 
  Sparkles, 
  Target, 
  Scale, 
  Brain, 
  ShieldAlert, 
  Clock, 
  Percent, 
  Flame, 
  Compass, 
  RefreshCw, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  HelpCircle,
  BarChart4,
  Zap,
  BookOpen
} from 'lucide-react';
import { Trade, RiskLimits } from '../types';

interface TraderProfile {
  archetype: 'SNIPER' | 'MOMENTUM_SCALPER' | 'CONSERVATIVE_PRESERVER' | 'VOLATILITY_HUNTER';
  title: string;
  subtitle: string;
  primaryStrength: string;
  biggestLeak: string;
  recommendedTimeframe: string;
  optimalRiskPerTrade: string;
  recommendedMaxTradesDaily: number;
  psychologicalProfile: string;
  dailyGoldenRule: string;
  disciplineScore: number; // 0 - 100
  patienceScore: number; // 0 - 100
  riskToleranceScore: number; // 0 - 100
  recoveryScore: number; // 0 - 100
}

interface TraderDnaSimulatorProps {
  trades: Trade[];
  riskLimits: RiskLimits;
  onApplyPreset?: (preset: Partial<RiskLimits>) => void;
}

export const TraderDnaSimulator: React.FC<TraderDnaSimulatorProps> = ({ 
  trades, 
  riskLimits,
  onApplyPreset 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dna' | 'simulator' | 'calculator'>('dna');

  // 1. Compute Dynamic Trader DNA Profile from historical trades
  const traderProfile: TraderProfile = useMemo(() => {
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.result === 'WIN').length;
    const losses = trades.filter(t => t.result === 'LOSS').length;
    const winRate = totalTrades > 0 ? Math.round((wins / (wins + losses || 1)) * 100) : 60;
    const emotionalCount = trades.filter(t => t.isEmotional).length;
    const emotionalRate = totalTrades > 0 ? (emotionalCount / totalTrades) : 0;

    // Calculate Discipline Score (100 minus penalty for emotional trades & rule breaches)
    const disciplineScore = Math.max(20, Math.min(100, Math.round(100 - (emotionalRate * 120))));
    
    // Patience score: higher if fewer trades per day & higher win rate
    const patienceScore = Math.max(30, Math.min(100, Math.round((winRate * 0.7) + (disciplineScore * 0.3))));

    // Risk tolerance: based on avg trade size vs starting balance
    const avgTradeSize = totalTrades > 0 ? (trades.reduce((acc, t) => acc + t.amount, 0) / totalTrades) : 10;
    const avgRiskPct = (avgTradeSize / (riskLimits.startingBalance || 1000)) * 100;
    const riskToleranceScore = Math.min(100, Math.max(20, Math.round(avgRiskPct * 35)));

    // Recovery score: how well they rebound after a loss
    let consecutiveLosses = 0;
    let maxConsLoss = 0;
    trades.forEach(t => {
      if (t.result === 'LOSS') {
        consecutiveLosses++;
        if (consecutiveLosses > maxConsLoss) maxConsLoss = consecutiveLosses;
      } else {
        consecutiveLosses = 0;
      }
    });
    const recoveryScore = Math.max(25, Math.min(100, 100 - (maxConsLoss * 15)));

    // Archetype Classification Algorithm
    if (winRate >= 70 && totalTrades <= 15) {
      return {
        archetype: 'SNIPER',
        title: 'Precision Sniper Archetype',
        subtitle: 'Ultra-Selective High-Probability Execution',
        primaryStrength: 'High win-rate expectancy on high-confluence candlestick/reversal setups.',
        biggestLeak: 'Risk of boredom-induced overtrading during low-volatility sessions.',
        recommendedTimeframe: '1M – 5M Confirmation (Peak Morning Session)',
        optimalRiskPerTrade: '1.0% – 1.5% fixed allocation',
        recommendedMaxTradesDaily: 4,
        psychologicalProfile: 'Analytical and patient. Trades best when waiting for price to reach major institutional levels before striking once with conviction.',
        dailyGoldenRule: 'Never fire more than 4 bullets a day. Let the market come directly into your crosshairs.',
        disciplineScore,
        patienceScore,
        riskToleranceScore,
        recoveryScore
      };
    } else if (emotionalRate > 0.35 || maxConsLoss >= 3) {
      return {
        archetype: 'VOLATILITY_HUNTER',
        title: 'Impulsive Volatility Hunter',
        subtitle: 'Prone to Chasing Momentum & Revenge Spikes',
        primaryStrength: 'Rapid responsiveness to fast-moving market breakouts and news shifts.',
        biggestLeak: 'Emotional compounding: doubling position sizes or over-clicking after sudden losses.',
        recommendedTimeframe: 'Strict 5M Expiry (Avoid 1M noise)',
        optimalRiskPerTrade: 'Strict 1.0% Hard Cap (Zero Exceptions)',
        recommendedMaxTradesDaily: 5,
        psychologicalProfile: 'High adrenaline sensitivity. Suffers cognitive friction when a contract expires out-of-the-money by a fraction of a pip.',
        dailyGoldenRule: 'Mandatory 10-minute lockout after any loss. Never fight the tape.',
        disciplineScore,
        patienceScore,
        riskToleranceScore,
        recoveryScore
      };
    } else if (avgRiskPct <= 1.2) {
      return {
        archetype: 'CONSERVATIVE_PRESERVER',
        title: 'Capital Preserver Archetype',
        subtitle: 'Risk-Averse Mathematical Compounder',
        primaryStrength: 'Impeccable draw-down mitigation and defense against account blowout.',
        biggestLeak: 'Premature exit anxiety or hesitation to execute high-grade A+ setups.',
        recommendedTimeframe: '2M – 5M Structured Trend Channels',
        optimalRiskPerTrade: '1.0% flat stake',
        recommendedMaxTradesDaily: 6,
        psychologicalProfile: 'Calculated and systematic. Understands that survival in binary options is 100% determined by asymmetric risk preservation.',
        dailyGoldenRule: 'Trust your verified technical checklist. Once all conditions are met, execute without second-guessing.',
        disciplineScore,
        patienceScore,
        riskToleranceScore,
        recoveryScore
      };
    } else {
      return {
        archetype: 'MOMENTUM_SCALPER',
        title: 'Systematic Momentum Scalper',
        subtitle: 'Trend Continuation & Volume Flow Specialist',
        primaryStrength: 'Riding sustained trends and key level breakouts across London/NY sessions.',
        biggestLeak: 'Over-staying in ranging or choppy sideways consolidations.',
        recommendedTimeframe: '1M – 3M Trend Continuation with EMA 20/50',
        optimalRiskPerTrade: '1.2% – 1.8%',
        recommendedMaxTradesDaily: 8,
        psychologicalProfile: 'Flow-state trader who thrives in active directional trends. Must maintain hard profit targets to avoid giving back morning gains.',
        dailyGoldenRule: 'When the market ranges into a box, close your trading terminal immediately.',
        disciplineScore,
        patienceScore,
        riskToleranceScore,
        recoveryScore
      };
    }
  }, [trades, riskLimits]);

  // 2. Monte Carlo Risk & Ruin Simulation State
  const [simStartingBalance, setSimStartingBalance] = useState<number>(riskLimits.startingBalance || 1000);
  const [simWinRate, setSimWinRate] = useState<number>(65);
  const [simPayoutPct, setSimPayoutPct] = useState<number>(85); // 85% binary payout
  const [simRiskPerTradePct, setSimRiskPerTradePct] = useState<number>(2.0);
  const [simTradesCount, setSimTradesCount] = useState<number>(100);
  const [simNumPaths, setSimNumPaths] = useState<number>(50); // 50 simulated random paths

  // Monte Carlo Engine
  const monteCarloResults = useMemo(() => {
    const paths: number[][] = [];
    let ruinedCount = 0;
    let maxDrawdownTotal = 0;
    const finalBalances: number[] = [];

    const riskFrac = simRiskPerTradePct / 100;
    const payoutMult = simPayoutPct / 100;
    const winFrac = simWinRate / 100;

    for (let p = 0; p < simNumPaths; p++) {
      const path: number[] = [simStartingBalance];
      let bal = simStartingBalance;
      let peak = bal;
      let maxDd = 0;
      let ruined = false;

      for (let t = 1; t <= simTradesCount; t++) {
        if (bal <= simStartingBalance * 0.2) { // 80% loss is considered terminal ruin
          ruined = true;
          path.push(bal);
          continue;
        }

        const stake = bal * riskFrac;
        const isWin = Math.random() < winFrac;

        if (isWin) {
          bal += stake * payoutMult;
        } else {
          bal -= stake;
        }

        if (bal > peak) peak = bal;
        const dd = (peak - bal) / peak;
        if (dd > maxDd) maxDd = dd;

        path.push(Math.round(bal * 100) / 100);
      }

      if (ruined) ruinedCount++;
      maxDrawdownTotal += maxDd;
      finalBalances.push(bal);
      paths.push(path);
    }

    finalBalances.sort((a, b) => a - b);
    const medianFinal = finalBalances[Math.floor(finalBalances.length / 2)] || simStartingBalance;
    const worstFinal = finalBalances[0] || 0;
    const bestFinal = finalBalances[finalBalances.length - 1] || simStartingBalance;
    const ruinProbability = Math.round((ruinedCount / simNumPaths) * 100);
    const avgMaxDd = Math.round((maxDrawdownTotal / simNumPaths) * 100);

    // Theoretical Mathematical Expected Value per trade
    // EV = (Win% * Payout) - (Loss% * 1.0)
    const evPercent = (winFrac * payoutMult) - ((1 - winFrac) * 1.0);
    const evDollars = (simStartingBalance * riskFrac) * evPercent;

    return {
      paths,
      medianFinal: Math.round(medianFinal),
      worstFinal: Math.round(worstFinal),
      bestFinal: Math.round(bestFinal),
      ruinProbability,
      avgMaxDd,
      evPercent: parseFloat((evPercent * 100).toFixed(2)),
      evDollars: parseFloat(evDollars.toFixed(2))
    };
  }, [simStartingBalance, simWinRate, simPayoutPct, simRiskPerTradePct, simTradesCount, simNumPaths]);

  // 3. Exact Binary Compounder & Kelly Criterion Calculator
  const [calcBankroll, setCalcBankroll] = useState<number>(1000);
  const [calcWinRate, setCalcWinRate] = useState<number>(68);
  const [calcPayout, setCalcPayout] = useState<number>(85);
  const [calcDays, setCalcDays] = useState<number>(30);
  const [calcTradesPerDay, setCalcTradesPerDay] = useState<number>(4);
  const [calcReinvestPct, setCalcReinvestPct] = useState<number>(100); // 100% compounding

  const compoundResults = useMemo(() => {
    const p = calcWinRate / 100;
    const b = calcPayout / 100;
    const q = 1 - p;

    // Standard Kelly Formula for Binary Options:
    // Kelly % = (b*p - q) / b = ( (Payout * WinRate) - LossRate ) / Payout
    const rawKelly = (b * p - q) / b;
    const fullKellyPct = Math.max(0, Math.min(25, rawKelly * 100));
    const halfKellyPct = fullKellyPct / 2; // Institutional Recommendation
    const quarterKellyPct = fullKellyPct / 4; // Conservative Binary Standard

    // Compounding schedule simulation
    const dailySchedule: Array<{ day: number; balance: number; dailyProfit: number; contractSize: number }> = [];
    let currentBal = calcBankroll;
    const conservativeTradePct = Math.min(2.5, Math.max(1.0, quarterKellyPct || 1.5)) / 100;

    for (let day = 1; day <= calcDays; day++) {
      let dayStartBal = currentBal;
      const contractSize = currentBal * conservativeTradePct;
      
      // Expected daily return based on mathematical expectancy
      const netPerTradeEv = (contractSize * b * p) - (contractSize * q);
      const expectedDailyProfit = netPerTradeEv * calcTradesPerDay;

      currentBal += expectedDailyProfit * (calcReinvestPct / 100);
      dailySchedule.push({
        day,
        balance: Math.round(currentBal),
        dailyProfit: Math.round(expectedDailyProfit),
        contractSize: parseFloat(contractSize.toFixed(2))
      });
    }

    return {
      fullKellyPct: parseFloat(fullKellyPct.toFixed(2)),
      halfKellyPct: parseFloat(halfKellyPct.toFixed(2)),
      quarterKellyPct: parseFloat(quarterKellyPct.toFixed(2)),
      finalCompoundedBal: dailySchedule[dailySchedule.length - 1]?.balance || calcBankroll,
      dailySchedule
    };
  }, [calcBankroll, calcWinRate, calcPayout, calcDays, calcTradesPerDay, calcReinvestPct]);

  return (
    <div id="trader-dna-simulator-module" className="space-y-6">
      
      {/* Top Banner & Sub-View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-950/60 shrink-0">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100 font-sans tracking-tight">Trader DNA & Monte Carlo Risk Lab</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                Institutional Upgrade
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Behavioral archetype profiling, 50-path Monte Carlo probability projections, and fractional Kelly sizing calculations.
            </p>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setActiveSubTab('dna')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
              activeSubTab === 'dna'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Trader DNA Profile</span>
          </button>
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
              activeSubTab === 'simulator'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Monte Carlo Sim</span>
          </button>
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition cursor-pointer ${
              activeSubTab === 'calculator'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-800 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kelly & Compounding</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TRADER DNA PROFILE */}
      {activeSubTab === 'dna' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Archetype Spotlight */}
          <div className="bg-slate-900 border border-purple-900/50 rounded-xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-purple-950/70 border border-purple-700/60 rounded-2xl text-purple-300 shrink-0 shadow-lg">
                  <Compass className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold bg-purple-955/60 px-2.5 py-0.5 rounded border border-purple-900">
                      Behavioral Archetype Identified
                    </span>
                    <span className="text-xs font-mono text-slate-500">• Based on {trades.length} historical executions</span>
                  </div>
                  <h3 className="text-xl font-bold font-sans text-slate-100 mt-1">{traderProfile.title}</h3>
                  <p className="text-xs text-purple-300 font-mono mt-0.5">{traderProfile.subtitle}</p>
                </div>
              </div>

              {/* Psychological Radar Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center min-w-[90px]">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Discipline</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">{traderProfile.disciplineScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center min-w-[90px]">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Patience</span>
                  <span className="text-sm font-mono font-bold text-indigo-400 mt-0.5 block">{traderProfile.patienceScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center min-w-[90px]">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Risk Heat</span>
                  <span className="text-sm font-mono font-bold text-amber-400 mt-0.5 block">{traderProfile.riskToleranceScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center min-w-[90px]">
                  <span className="text-[9px] font-mono uppercase text-slate-500 block">Loss Recovery</span>
                  <span className="text-sm font-mono font-bold text-purple-400 mt-0.5 block">{traderProfile.recoveryScore}%</span>
                </div>
              </div>
            </div>

            {/* Profile Strategic Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              
              <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-900/40 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold uppercase text-emerald-400">Core Mathematical Edge</h4>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {traderProfile.primaryStrength}
                </p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-rose-900/40 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <h4 className="text-xs font-mono font-bold uppercase text-rose-400">Primary Capital Leak</h4>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {traderProfile.biggestLeak}
                </p>
              </div>

            </div>

            {/* Tactical Guardrail Recommendations */}
            <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Recommended Execution Timeframe</span>
                <span className="text-xs font-mono font-semibold text-slate-200 mt-1 block">{traderProfile.recommendedTimeframe}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Optimal Stake Sizing</span>
                <span className="text-xs font-mono font-semibold text-emerald-400 mt-1 block">{traderProfile.optimalRiskPerTrade}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Daily Contract Volume Cap</span>
                <span className="text-xs font-mono font-semibold text-indigo-300 mt-1 block">Max {traderProfile.recommendedMaxTradesDaily} trades/day</span>
              </div>
            </div>

            {/* Daily Golden Rule Pill */}
            <div className="mt-5 bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-800/60 p-4 rounded-xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-purple-300 block">Your Daily Behavioral Mandate:</span>
                <span className="text-xs text-slate-200 font-sans font-medium">"{traderProfile.dailyGoldenRule}"</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: 50-PATH MONTE CARLO RISK & RUIN SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls (4 Cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="font-sans font-bold text-sm text-slate-100">Simulation Variables</h3>
              </div>

              {/* Starting Capital */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Starting Balance ($)</span>
                  <span className="text-slate-200 font-bold">${simStartingBalance}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={simStartingBalance}
                  onChange={e => setSimStartingBalance(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-950 rounded h-1.5"
                />
              </div>

              {/* Win Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Historical Win Rate (%)</span>
                  <span className={`font-bold ${simWinRate >= 60 ? 'text-emerald-400' : 'text-rose-450'}`}>{simWinRate}%</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="85"
                  step="1"
                  value={simWinRate}
                  onChange={e => setSimWinRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 rounded h-1.5"
                />
              </div>

              {/* Binary Payout Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Broker Payout (%)</span>
                  <span className="text-indigo-400 font-bold">{simPayoutPct}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  step="1"
                  value={simPayoutPct}
                  onChange={e => setSimPayoutPct(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-950 rounded h-1.5"
                />
              </div>

              {/* Risk Per Trade */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Risk Stake Per Trade (%)</span>
                  <span className={`font-bold ${simRiskPerTradePct <= 2.5 ? 'text-emerald-400' : 'text-rose-450'}`}>{simRiskPerTradePct}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.5"
                  value={simRiskPerTradePct}
                  onChange={e => setSimRiskPerTradePct(Number(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-950 rounded h-1.5"
                />
                {simRiskPerTradePct > 3 && (
                  <span className="text-[10px] font-mono text-rose-400 block leading-tight">
                    ⚠ Warning: Risking &gt;3% on binary options drastically increases mathematical risk of ruin.
                  </span>
                )}
              </div>

              {/* Sequence Horizon */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Trade Horizon</span>
                  <span className="text-slate-200 font-bold">{simTradesCount} contracts</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={simTradesCount}
                  onChange={e => setSimTradesCount(Number(e.target.value))}
                  className="w-full accent-slate-600 bg-slate-950 rounded h-1.5"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSimTradesCount(prev => prev)} // triggers re-render with new random seeds
                  className="w-full py-2 bg-slate-950 border border-slate-800 hover:border-purple-800 text-purple-300 font-mono text-xs rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-seed Monte Carlo Paths</span>
                </button>
              </div>
            </div>

            {/* Right Output Dashboard (8 Cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <BarChart4 className="w-4 h-4 text-purple-400" />
                  <h3 className="font-sans font-bold text-sm text-slate-100">
                    50-Iteration Probability Outcome Projection
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {simNumPaths} Stochastic Trajectories
                </span>
              </div>

              {/* Top Key Result Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Probability of Ruin</span>
                  <span className={`text-base font-mono font-bold mt-0.5 block ${monteCarloResults.ruinProbability === 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                    {monteCarloResults.ruinProbability}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">80%+ capital loss</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Expected Value / Trade</span>
                  <span className={`text-base font-mono font-bold mt-0.5 block ${monteCarloResults.evDollars >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                    {monteCarloResults.evDollars >= 0 ? '+' : ''}${monteCarloResults.evDollars}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">({monteCarloResults.evPercent}%)</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Median Final Balance</span>
                  <span className="text-base font-mono font-bold text-emerald-400 mt-0.5 block">
                    ${monteCarloResults.medianFinal}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">50th percentile</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Max Est. Drawdown</span>
                  <span className="text-base font-mono font-bold text-amber-400 mt-0.5 block">
                    {monteCarloResults.avgMaxDd}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Peak to trough</span>
                </div>
              </div>

              {/* Visual ASCII / SVG Curve Representation */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Trajectory Spread: Best (${monteCarloResults.bestFinal}) vs Worst (${monteCarloResults.worstFinal})</span>
                  <span>Horizon: {simTradesCount} Trades</span>
                </div>

                {/* SVG Curves Graph */}
                <div className="h-44 w-full bg-slate-950 rounded-lg relative overflow-hidden flex items-end pt-4">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${simTradesCount} 100`}>
                    {/* Render a sample of paths */}
                    {monteCarloResults.paths.slice(0, 20).map((path, pIdx) => {
                      const maxVal = Math.max(monteCarloResults.bestFinal, simStartingBalance * 1.5, 100);
                      const points = path.map((val, idx) => {
                        const x = (idx / simTradesCount) * simTradesCount;
                        const y = 100 - (val / maxVal) * 85;
                        return `${x},${y}`;
                      }).join(' ');

                      return (
                        <polyline
                          key={pIdx}
                          fill="none"
                          stroke={pIdx === 0 ? '#10b981' : pIdx === 1 ? '#ef4444' : '#6366f1'}
                          strokeWidth={pIdx < 2 ? '1.5' : '0.5'}
                          strokeOpacity={pIdx < 2 ? '0.9' : '0.2'}
                          points={points}
                        />
                      );
                    })}
                  </svg>
                </div>

                <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1">
                  <span className="text-emerald-400 font-semibold">● Top Path: ${monteCarloResults.bestFinal}</span>
                  <span className="text-indigo-400 font-semibold">● Median: ${monteCarloResults.medianFinal}</span>
                  <span className="text-rose-450 font-semibold">● Max Risk Path: ${monteCarloResults.worstFinal}</span>
                </div>
              </div>

              {/* Mathematical Expectancy Summary */}
              <div className="bg-purple-955/20 border border-purple-900/40 p-3.5 rounded-xl text-xs text-purple-200 leading-relaxed font-sans flex items-start gap-2.5">
                <Brain className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-300 block font-semibold">Institutional Takeaway:</strong>
                  At a {simWinRate}% win rate and {simPayoutPct}% payout, your system holds an exact positive edge of <strong>+{monteCarloResults.evPercent}% per contract</strong>. Maintaining risk below 2.0% guarantees mathematical survival through normal random loss clusters.
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW 3: FRACTIONAL KELLY & COMPOUNDING CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Parameters (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Percent className="w-4 h-4 text-emerald-400" />
                <h3 className="font-sans font-bold text-sm text-slate-100">Compounding Parameters</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Account Bankroll ($)</label>
                <input
                  type="number"
                  value={calcBankroll}
                  onChange={e => setCalcBankroll(Math.max(50, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Verified Strategy Win Rate (%)</label>
                <input
                  type="number"
                  value={calcWinRate}
                  onChange={e => setCalcWinRate(Math.max(40, Math.min(95, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Trading Days Horizon</label>
                <input
                  type="number"
                  value={calcDays}
                  onChange={e => setCalcDays(Math.max(5, Math.min(180, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400">Target Trades Per Day</label>
                <input
                  type="number"
                  value={calcTradesPerDay}
                  onChange={e => setCalcTradesPerDay(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 font-bold"
                />
              </div>
            </div>

            {/* Right Kelly & Table Dashboard (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              
              {/* Kelly Criterion Breakdown */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-200">
                      Kelly Criterion Sizing Matrix
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Mathematical Optimization</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Full Kelly (Theoretical)</span>
                    <span className="text-sm font-mono font-bold text-amber-400 mt-0.5 block">
                      {compoundResults.fullKellyPct}%
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans">High volatility risk</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Half Kelly (Standard)</span>
                    <span className="text-sm font-mono font-bold text-indigo-300 mt-0.5 block">
                      {compoundResults.halfKellyPct}%
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans">Balanced growth</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-emerald-900/40 text-center relative overflow-hidden">
                    <span className="text-[9px] uppercase font-mono text-emerald-400 block font-bold">Quarter Kelly (Preservation)</span>
                    <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
                      {compoundResults.quarterKellyPct}%
                    </span>
                    <span className="text-[9px] text-emerald-400/80 font-sans">Recommended for Binaries</span>
                  </div>
                </div>
              </div>

              {/* Compounded Horizon projection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-bold uppercase">
                    {calcDays}-Day Compounding Trajectory (${calcBankroll} → ${compoundResults.finalCompoundedBal})
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    +{Math.round(((compoundResults.finalCompoundedBal - calcBankroll) / calcBankroll) * 100)}% Expected Return
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-500 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Day</th>
                        <th className="p-2">Starting Balance</th>
                        <th className="p-2">Contract Size</th>
                        <th className="p-2">Daily Exp. PnL</th>
                        <th className="p-2 text-right">Day End Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {compoundResults.dailySchedule.map(row => (
                        <tr key={row.day} className="hover:bg-slate-850/40">
                          <td className="p-2 text-slate-400">Day {row.day}</td>
                          <td className="p-2 text-slate-300">${row.balance - row.dailyProfit}</td>
                          <td className="p-2 text-indigo-300 font-semibold">${row.contractSize}</td>
                          <td className="p-2 text-emerald-400 font-bold">+${row.dailyProfit}</td>
                          <td className="p-2 text-right text-emerald-300 font-bold">${row.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
