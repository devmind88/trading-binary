import React, { useState } from 'react';
import { Shield, CheckSquare, Clock, HelpCircle, AlertTriangle, Play, RefreshCw } from 'lucide-react';
import { RiskLimits, ChecklistItem, Trade, RuleViolation } from '../types';

interface PlanModuleProps {
  riskLimits: RiskLimits;
  setRiskLimits: React.Dispatch<React.SetStateAction<RiskLimits>>;
  checklist: ChecklistItem[];
  setChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  trades: Trade[];
  violations: RuleViolation[];
  currentBalance: number;
}

export const PlanModule: React.FC<PlanModuleProps> = ({
  riskLimits,
  setRiskLimits,
  checklist,
  setChecklist,
  trades,
  violations,
  currentBalance
}) => {
  const [showPlanHelp, setShowPlanHelp] = useState(false);

  // Toggle entry checklist item
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Reset checklist helper
  const resetChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, checked: false })));
  };

  // Calculate live daily stats for current date
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(t => t.date === todayStr);
  const todayPnl = todayTrades.reduce((sum, t) => sum + t.pnl, 0);
  const dailyLossPercent = riskLimits.startingBalance > 0 
    ? Math.abs(Math.min(0, todayPnl)) / riskLimits.startingBalance * 100 
    : 0;

  // Render session status
  const getSessionStatus = (session: string) => {
    const currentHour = new Date().getHours();
    if (session === 'Morning' && currentHour >= 6 && currentHour < 12) return 'Active Now';
    if (session === 'Midday' && currentHour >= 12 && currentHour < 17) return 'Active Now';
    if (session === 'Evening' && (currentHour >= 17 || currentHour < 6)) return 'Active Now';
    return 'Outside Hours';
  };

  return (
    <div id="plan-module-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Risk Rule Monitor Board */}
      <div id="risk-enforcement-board" className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-sans font-medium text-slate-100 text-lg">Risk Controller</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800/30">
              Active Guard
            </span>
          </div>

          {/* Balance Tracker Card */}
          <div className="bg-slate-950/60 rounded-lg p-4 border border-slate-800/50 mb-4">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-mono">Current Account Balance</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-mono text-slate-200 font-semibold">${currentBalance.toFixed(2)}</span>
              <span className={`text-xs text-slate-400`}>
                (S.B: ${riskLimits.startingBalance})
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/20">
              <span className="block text-slate-500 text-[10px] uppercase font-mono">Today P&L</span>
              <span className={`font-mono text-sm font-semibold ${todayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {todayPnl >= 0 ? '+' : ''}${todayPnl.toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/20">
              <span className="block text-slate-500 text-[10px] uppercase font-mono">Today's Loss Ratio</span>
              <span className={`font-mono text-sm font-semibold ${dailyLossPercent >= riskLimits.maxDailyLossPercent ? 'text-rose-400' : 'text-slate-300'}`}>
                {dailyLossPercent.toFixed(1)}% / {riskLimits.maxDailyLossPercent}%
              </span>
            </div>
          </div>

          {/* Live Alerts Box */}
          <div className="space-y-2 mb-4">
            <h4 className="text-xs uppercase text-slate-400 font-mono mb-1">System Violations Logs</h4>
            {violations.length === 0 ? (
              <div className="text-[11px] text-emerald-400/80 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-lg text-center font-mono">
                ✔ NO ACTIVE RULE LIMIT VIOLATIONS DETECTED
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {violations.map(v => (
                  <div
                    key={v.id}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs font-mono ${
                      v.severity === 'critical'
                        ? 'bg-rose-955/20 border-rose-900/40 text-rose-300'
                        : 'bg-amber-955/10 border-amber-900/30 text-amber-300'
                    }`}
                  >
                    <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${v.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`} />
                    <div>
                      <span className="font-bold">[{v.type}]</span> {v.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Adjust Limits Panel */}
        <div className="border-t border-slate-800 pt-4 mt-2">
          <h4 className="text-xs uppercase text-slate-400 font-mono mb-3">Adjust Active Limits</h4>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Safe Trade Sizing (Account %)</span>
                <span className="text-slate-200 font-mono">1% - 2%</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">Min (%)</span>
                  <input
                    type="number"
                    step="0.5"
                    className="bg-transparent text-slate-200 mt-0.5 w-full font-mono outline-none"
                    value={riskLimits.minTradeSizePercent}
                    onChange={e => setRiskLimits(prev => ({ ...prev, minTradeSizePercent: Math.max(0, parseFloat(e.target.value) || 0) }))}
                  />
                </label>
                <label className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">Max (%)</span>
                  <input
                    type="number"
                    step="0.5"
                    className="bg-transparent text-slate-200 mt-0.5 w-full font-mono outline-none"
                    value={riskLimits.maxTradeSizePercent}
                    onChange={e => setRiskLimits(prev => ({ ...prev, maxTradeSizePercent: Math.max(0, parseFloat(e.target.value) || 0) }))}
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Start Balance & Max Daily Loss Limit</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">Starting Bal. ($)</span>
                  <input
                    type="number"
                    className="bg-transparent text-slate-200 mt-0.5 w-full font-mono outline-none"
                    value={riskLimits.startingBalance}
                    onChange={e => setRiskLimits(prev => ({ ...prev, startingBalance: Math.max(0, parseFloat(e.target.value) || 0) }))}
                  />
                </label>
                <label className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">Max Loss Limit (%)</span>
                  <input
                    type="number"
                    className="bg-transparent text-slate-200 mt-0.5 w-full font-mono outline-none"
                    value={riskLimits.maxDailyLossPercent}
                    onChange={e => setRiskLimits(prev => ({ ...prev, maxDailyLossPercent: Math.min(100, Math.max(1, parseFloat(e.target.value) || 0)) }))}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist, Session and Rules Panel */}
      <div id="checklists-and-routines" className="lg:col-span-8 space-y-6">
        
        {/* Entry Checklist card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="font-sans font-medium text-slate-100 text-lg">Entry Checklist</h3>
            </div>
            <button
              onClick={resetChecklist}
              className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded border border-slate-800/80 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            You must pass and log every check prior to pressing trade on the Binary Options Broker. Disorganized inputs yield erratic results.
          </p>

          <div className="space-y-2.5">
            {checklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer select-none ${
                  item.checked
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded flex items-center justify-center font-mono text-[10px] font-bold border transition ${
                  item.checked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                }`}>
                  {item.checked && '✓'}
                </div>
                <span className="text-sm font-sans">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Dynamic feedback on entry checklist readiness */}
          <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">
              Readiness: {checklist.filter(c => c.checked).length} / {checklist.length} Verified
            </span>
            {checklist.every(c => c.checked) ? (
              <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                ✔ SAFE ENTRY AUTHORIZED
              </span>
            ) : (
              <span className="text-xs font-mono px-2 py-1 rounded bg-amber-955/10 text-amber-400 border border-amber-800/20">
                ⚠ ENTRY BLOCKED: FINISH CHECKLIST
              </span>
            )}
          </div>
        </div>

        {/* Sessions & Rules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Approved sessions card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="font-sans font-medium text-slate-100 text-lg">Trading Sessions</h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Binary options trading should only occur during highly active liquidity sessions. Avoid consolidation dead hours.
            </p>

            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">Morning Session</span>
                  <span className="text-[10px] text-slate-500">06:00 - 12:00 Local</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  getSessionStatus('Morning') === 'Active Now'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-900 text-slate-500'
                }`}>
                  {getSessionStatus('Morning')}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">Midday Session</span>
                  <span className="text-[10px] text-slate-500">12:00 - 17:00 Local</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  getSessionStatus('Midday') === 'Active Now'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-900 text-slate-500'
                }`}>
                  {getSessionStatus('Midday')}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                <div>
                  <span className="block font-semibold text-slate-200">Evening Session</span>
                  <span className="text-[10px] text-slate-500">17:00 - 06:00 Local</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  getSessionStatus('Evening') === 'Active Now'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-900 text-slate-500'
                }`}>
                  {getSessionStatus('Evening')}
                </span>
              </div>
            </div>
          </div>

          {/* Approved Psychology Rules Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-sans font-medium text-slate-100 text-lg">Psychological Shields</h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              These structural rules act as circuit-breakers for emotional or erratic trading choices:
            </p>

            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              <li className="flex items-start gap-2.5 bg-slate-950/20 p-2 border border-slate-800/40 rounded">
                <span className="text-rose-400 shrink-0 font-mono">1.</span>
                <span><strong>No Revenge Trading:</strong> Losses are accepted objectively without dynamic re-entry.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-950/20 p-2 border border-slate-800/40 rounded">
                <span className="text-rose-400 shrink-0 font-mono">2.</span>
                <span><strong>No Emotional Doubles:</strong> Doubling standard trade sizes (Martingale) is strictly banned.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-950/20 p-2 border border-slate-800/40 rounded">
                <span className="text-rose-400 shrink-0 font-mono">3.</span>
                <span><strong>Accept Losses Completely:</strong> Treat every loss as an unavoidable business expense.</span>
              </li>
              <li className="flex items-start gap-2.5 bg-slate-950/20 p-2 border border-slate-800/40 rounded">
                <span className="text-rose-400 shrink-0 font-mono">4.</span>
                <span><strong>No "Just One More Trade":</strong> Hit your daily quota or step-limit and shut down the browser.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
