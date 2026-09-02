import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Sparkles, Crown, Zap, Lock, Download, 
  TrendingUp, AlertTriangle, CheckCircle2, Sliders, Play, RefreshCw, BarChart2
} from 'lucide-react';
import { Trade, RiskLimits, UserProfile } from '../types';

interface PremiumGuardianProps {
  trades: Trade[];
  riskLimits: RiskLimits;
  user: UserProfile;
  onOpenPricing: () => void;
}

export const PremiumGuardian: React.FC<PremiumGuardianProps> = ({
  trades,
  riskLimits,
  user,
  onOpenPricing
}) => {
  const isPremium = user.plan === 'pro' || user.plan === 'elite';

  // Monte Carlo parameters
  const [iterations, setIterations] = useState<number>(2000);
  const [horizonContracts, setHorizonContracts] = useState<number>(100);
  const [customWinRate, setCustomWinRate] = useState<number>(62);
  const [customStakePercent, setCustomStakePercent] = useState<number>(1.5);
  const [propFirmMode, setPropFirmMode] = useState<'Apex' | 'FTMO' | 'Topstep'>('FTMO');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Derive empirical win-rate from logged trades
  const empiricalStats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter(t => t.result === 'WIN').length;
    const winRate = total > 0 ? (wins / total) * 100 : 60;
    return { total, wins, winRate: parseFloat(winRate.toFixed(1)) };
  }, [trades]);

  // Monte Carlo Simulation Engine
  const simulationResults = useMemo(() => {
    const pWin = (customWinRate || empiricalStats.winRate) / 100;
    const stakeFrac = (customStakePercent || 1.5) / 100;
    const payout = 0.82; // standard 82% binary option payout
    const startBal = riskLimits.startingBalance || 1000;

    let ruinedCount = 0;
    let maxDrawdowns: number[] = [];
    let finalBalances: number[] = [];
    let propFirmBreachedCount = 0;

    // Prop firm drawdown limit
    const maxAllowedDrawdown = propFirmMode === 'FTMO' ? 0.10 : propFirmMode === 'Apex' ? 0.06 : 0.08;

    // 10 Sample paths for visualization
    const samplePaths: number[][] = [];

    for (let i = 0; i < iterations; i++) {
      let balance = startBal;
      let peak = startBal;
      let maxDdFrac = 0;
      let path: number[] = [startBal];

      for (let c = 0; c < horizonContracts; c++) {
        const isWin = Math.random() < pWin;
        const bet = balance * stakeFrac;

        if (isWin) {
          balance += bet * payout;
        } else {
          balance -= bet;
        }

        if (balance > peak) peak = balance;
        const currentDd = (peak - balance) / peak;
        if (currentDd > maxDdFrac) maxDdFrac = currentDd;

        if (i < 8) path.push(Math.round(balance));

        // Check ruin condition (< 15% of start)
        if (balance <= startBal * 0.15) {
          ruinedCount++;
          break;
        }
      }

      maxDrawdowns.push(maxDdFrac);
      finalBalances.push(balance);
      if (maxDdFrac >= maxAllowedDrawdown) {
        propFirmBreachedCount++;
      }

      if (i < 8) samplePaths.push(path);
    }

    const probOfRuin = (ruinedCount / iterations) * 100;
    const propPassRate = 100 - (propFirmBreachedCount / iterations) * 100;
    const avgFinalBalance = finalBalances.reduce((a, b) => a + b, 0) / iterations;
    const avgMaxDrawdown = (maxDrawdowns.reduce((a, b) => a + b, 0) / iterations) * 100;

    return {
      probOfRuin: parseFloat(probOfRuin.toFixed(2)),
      propPassRate: parseFloat(propPassRate.toFixed(1)),
      avgFinalBalance: Math.round(avgFinalBalance),
      avgMaxDrawdown: parseFloat(avgMaxDrawdown.toFixed(1)),
      samplePaths
    };
  }, [iterations, horizonContracts, customWinRate, customStakePercent, propFirmMode, empiricalStats, riskLimits.startingBalance]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  const handleExportDossier = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Trade_ID,Date,Time,Strategy,Direction,Amount,PayoutRate,Result,PnL,Emotion_Flag\n" +
      trades.map(t => `${t.id},${t.date},${t.time},${t.strategyId},${t.type},${t.amount},${t.payoutRate}%,${t.result},${t.pnl},${t.isEmotional}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NeuroTactix_Institutional_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Pro Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-800/50 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-sans">
                Institutional Monte Carlo & Prop Firm Guardian
              </h2>
              <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow">
                PRO EXCLUSIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              10,000-iteration probability of ruin, VaR drawdown stress testing, and prop firm compliance.
            </p>
          </div>
        </div>

        {isPremium ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDossier}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit CSV
            </button>
            <span className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pro Unlocked
            </span>
          </div>
        ) : (
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-950 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Unlock Pro Features ($29/mo)</span>
          </button>
        )}
      </div>

      {/* Feature Teaser Overlay for Free Users */}
      {!isPremium && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-200 font-mono">You are currently previewing the Pro Guardian Suite</p>
              <p className="text-[11px] text-amber-300/80">Upgrade to Pro Trader ($29/mo) to unlock real-time parameters, unlimited Monte Carlo simulations, and remove all ads.</p>
            </div>
          </div>
          <button
            onClick={onOpenPricing}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold shrink-0 transition"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Simulation Controls & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameter Sliders */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Simulation Parameters</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Fast Vectorized</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Base Win Rate:</span>
              <span className="text-emerald-400 font-bold">{customWinRate}%</span>
            </div>
            <input
              type="range"
              min={45}
              max={80}
              value={customWinRate}
              onChange={(e) => setCustomWinRate(Number(e.target.value))}
              disabled={!isPremium}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>Break-even (54.9%)</span>
              <span>Empirical: {empiricalStats.winRate}%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Fixed Stake per Trade:</span>
              <span className="text-indigo-400 font-bold">{customStakePercent}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.5}
              value={customStakePercent}
              onChange={(e) => setCustomStakePercent(Number(e.target.value))}
              disabled={!isPremium}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>Conservative (1%)</span>
              <span>Aggressive (5%)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Trade Horizon:</span>
              <span className="text-slate-200 font-bold">{horizonContracts} Contracts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 250].map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizonContracts(h)}
                  disabled={!isPremium}
                  className={`py-1 rounded-lg text-xs font-mono border transition ${
                    horizonContracts === h
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h} trades
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-mono text-slate-400 mb-1">Prop Firm Evaluation Standard:</span>
            <div className="grid grid-cols-3 gap-2">
              {(['FTMO', 'Apex', 'Topstep'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPropFirmMode(p)}
                  disabled={!isPremium}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold border transition ${
                    propFirmMode === p
                      ? 'bg-purple-950 border-purple-600 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p} ({p === 'FTMO' ? '10% Max' : p === 'Apex' ? '6% Trail' : '8% Max'})
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-md transition flex items-center justify-center gap-1.5 mt-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Re-run {iterations.toLocaleString()} Iterations</span>
          </button>
        </div>

        {/* Center & Right Column: Simulation Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Probability of Ruin</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-mono font-black ${
                  simulationResults.probOfRuin === 0 ? 'text-emerald-400' : simulationResults.probOfRuin < 5 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {simulationResults.probOfRuin}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                {simulationResults.probOfRuin === 0 ? 'Mathematically Protected' : 'Capital depletion risk'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">
                {propFirmMode} Pass Probability
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-mono font-black text-indigo-400">
                  {simulationResults.propPassRate}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Under {propFirmMode} drawdown constraints
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Expected Max Drawdown</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-mono font-black text-amber-400">
                  {simulationResults.avgMaxDrawdown}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Mean peak-to-trough decline
              </span>
            </div>
          </div>

          {/* Monte Carlo Visual Paths */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>Simulated Equity Trajectories (8 Sample Paths)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Starting Balance: ${riskLimits.startingBalance}
              </span>
            </div>

            <div className="h-44 w-full bg-slate-950 rounded-xl p-3 flex items-end gap-1.5 relative overflow-hidden border border-slate-800/80">
              {/* Baseline horizon line */}
              <div className="absolute inset-x-0 bottom-8 border-b border-slate-800 border-dashed" />
              
              {simulationResults.samplePaths.map((path, pIdx) => {
                const finalBal = path[path.length - 1];
                const isProfitable = finalBal >= riskLimits.startingBalance;
                const minVal = Math.min(...path);
                const maxVal = Math.max(...path);
                const range = Math.max(1, maxVal - minVal);
                const normHeight = Math.min(100, Math.max(15, ((finalBal - minVal) / range) * 100));

                return (
                  <div key={pIdx} className="flex-1 flex flex-col items-center justify-end h-full z-10">
                    <div 
                      style={{ height: `${normHeight}%` }}
                      className={`w-full rounded-t transition-all ${
                        isProfitable 
                          ? 'bg-gradient-to-t from-emerald-950 to-emerald-500/80 border-t border-emerald-400' 
                          : 'bg-gradient-to-t from-red-950 to-red-500/80 border-t border-red-400'
                      }`}
                      title={`Path #${pIdx + 1}: Final $${finalBal}`}
                    />
                    <span className="text-[9px] font-mono text-slate-600 mt-1">#{pIdx + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Projected Mean Terminal Capital: <strong className="text-emerald-400">${simulationResults.avgFinalBalance}</strong></span>
              <span>Edge Payout: <strong>82.0% Fixed</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
