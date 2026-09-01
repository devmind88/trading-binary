import React, { useMemo, useState } from 'react';
import { Trade, StrategyId } from '../types';
import { approvedStrategies } from '../data';
import { FileText, Save, CheckCircle, ShieldAlert, Award, Calendar } from 'lucide-react';

interface WeeklyReviewProps {
  trades: Trade[];
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({ trades }) => {
  // Manual text entries
  const [violationsText, setViolationsText] = useState('Took one emotional revenge trade on May 26th, violating trade sizing limits (doubled trade to $40). Controlled other sessions perfectly.');
  const [improvementsText, setImprovementsText] = useState('Maintain absolute sizing consistency. Walk away immediately after consecutive losses. Avoid trading late evening when pair volume is dry.');
  const [pyschText, setPyschText] = useState('Felt slightly impatient during mid-day session on Tuesday. Morning sessions were highly structured and relaxed.');

  const [isSaved, setIsSaved] = useState(false);

  // Auto-calculate last 7 days of data
  const weeklyStats = useMemo(() => {
    // 7 days ago timestamp
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const limitStr = sevenDaysAgo.toISOString().split('T')[0];

    // Filter trades in past 7 days
    const weekTrades = trades.filter(t => t.date >= limitStr);

    const total = weekTrades.length;
    const wins = weekTrades.filter(t => t.result === 'WIN').length;
    const losses = weekTrades.filter(t => t.result === 'LOSS').length;
    const ties = weekTrades.filter(t => t.result === 'TIE').length;
    const winRate = total > 0 ? (wins / (total - ties || 1)) * 100 : 0;
    const pnl = weekTrades.reduce((sum, t) => sum + t.pnl, 0);
    const emotionalCount = weekTrades.filter(t => t.isEmotional).length;

    // Daily aggregates for best/worst day
    const dailyPnl: Record<string, number> = {};
    weekTrades.forEach(t => {
      dailyPnl[t.date] = (dailyPnl[t.date] || 0) + t.pnl;
    });

    let bestDay = 'N/A';
    let bestDayVal = -Infinity;
    let worstDay = 'N/A';
    let worstDayVal = Infinity;

    Object.entries(dailyPnl).forEach(([d, p]) => {
      if (p > bestDayVal) {
        bestDayVal = p;
        bestDay = d;
      }
      if (p < worstDayVal) {
        worstDayVal = p;
        worstDay = d;
      }
    });

    // Strategy aggregates
    const stratPnl: Record<string, number> = {};
    weekTrades.forEach(t => {
      stratPnl[t.strategyId] = (stratPnl[t.strategyId] || 0) + t.pnl;
    });

    let bestStrat: StrategyId | null = null;
    let bestStratVal = -Infinity;
    let worstStrat: StrategyId | null = null;
    let worstStratVal = Infinity;

    Object.entries(stratPnl).forEach(([idStr, val]) => {
      const id = idStr as StrategyId;
      if (val > bestStratVal) {
        bestStratVal = val;
        bestStrat = id;
      }
      if (val < worstStratVal) {
        worstStratVal = val;
        worstStrat = id;
      }
    });

    const bestStratName = bestStrat ? approvedStrategies.find(s => s.id === bestStrat)?.name : 'N/A';
    const worstStratName = worstStrat ? approvedStrategies.find(s => s.id === worstStrat)?.name : 'N/A';

    return {
      total,
      wins,
      losses,
      ties,
      winRate: Math.round(winRate),
      pnl,
      emotionalCount,
      bestDay: bestDay !== 'N/A' ? `${bestDay} (+$${bestDayVal.toFixed(2)})` : 'N/A',
      worstDay: worstDay !== 'N/A' ? `${worstDay} (-$${Math.abs(worstDayVal).toFixed(2)})` : 'N/A',
      bestStrat: bestStratName,
      worstStrat: worstStratName
    };
  }, [trades]);

  const handleSaveReview = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div id="weekly-review-system-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Auto-Calculated Stats Sheet */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-medium text-slate-100 text-lg">Weekly Digest Summary</h3>
          </div>

          <p className="text-xs text-slate-400 mb-5 leading-normal">
            Operational telemetry aggregated from the trailing 7 days. This creates an objective benchmark of execution quality.
          </p>

          <div className="space-y-4 font-mono text-xs text-slate-350">
            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <span className="text-slate-500">Weekly Net Return</span>
              <span className={`font-bold ${weeklyStats.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {weeklyStats.pnl >= 0 ? '+' : ''}${weeklyStats.pnl.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <span className="text-slate-500">Weekly Win Rate (Ex. Ties)</span>
              <span className="font-bold text-slate-200">{weeklyStats.winRate}%</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <span className="text-slate-500">Total Contracts Processed</span>
              <span className="text-slate-200">{weeklyStats.total} ({weeklyStats.wins}W - {weeklyStats.losses}L - {weeklyStats.ties}T)</span>
            </div>

            <div className="flex justify-between items-start bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <span className="text-slate-500 shrink-0">Best Trading Day</span>
              <span className="text-emerald-400 font-bold text-right text-[11px] truncate">{weeklyStats.bestDay}</span>
            </div>

            <div className="flex justify-between items-start bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <span className="text-slate-500 shrink-0">Worst Trading Day</span>
              <span className="text-rose-450 font-bold text-right text-[11px] truncate">{weeklyStats.worstDay}</span>
            </div>

            <div className="flex justify-between items-start bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <span className="text-slate-500 shrink-0">High-Edge Setup</span>
              <span className="text-indigo-400 font-bold text-right truncate">{weeklyStats.bestStrat || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-start bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <span className="text-slate-500 shrink-0">Low-Edge Setup</span>
              <span className="text-rose-350 font-bold text-right truncate">{weeklyStats.worstStrat || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded border border-slate-850">
              <span className="text-slate-500">Emotional Trade Breaches</span>
              <span className={`font-bold ${weeklyStats.emotionalCount > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                {weeklyStats.emotionalCount}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60 mt-6 text-center">
          {weeklyStats.emotionalCount > 0 ? (
            <div className="bg-amber-955/15 border border-amber-900/40 p-3 rounded-lg text-xs font-sans text-amber-300 flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Safety hazard: Rule violations occurred this week. Active emotional limits.</span>
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-lg text-xs font-sans text-emerald-300 flex items-center gap-2 text-left">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Perfect execution: 100% adherence to psychological rules. Perfect trade size consistency.</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual Review Entry Sheets */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-medium text-slate-100 text-lg">Weekly Narrative Audit</h3>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-mono uppercase text-slate-450 block font-bold">1. Key Rule Violations & Slippages</span>
            <textarea
              className="w-full bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 font-sans focus:border-slate-800 outline-none h-18 resize-none"
              value={violationsText}
              onChange={e => setViolationsText(e.target.value)}
              placeholder="Ex. 'Chased a trend retest outside hours...', 'Doubled sizing...'"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-mono uppercase text-slate-450 block font-bold">2. Psychological Performance & Focus Markers</span>
            <textarea
              className="w-full bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 font-sans focus:border-slate-800 outline-none h-18 resize-none"
              value={pyschText}
              onChange={e => setPyschText(e.target.value)}
              placeholder="Ex. 'Felt impatient during midday overlap...'"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-mono uppercase text-slate-450 block font-bold">3. Concrete Improvement Targets for Next Week</span>
            <textarea
              className="w-full bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-200 font-sans focus:border-slate-800 outline-none h-20 resize-none"
              value={improvementsText}
              onChange={e => setImprovementsText(e.target.value)}
              placeholder="Ex. 'I will close the charts at $50 daily loss...'"
            />
          </label>
        </div>

        <div className="pt-4 mt-6 border-t border-slate-850 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            System status: Trailing week analyzed
          </span>
          <button
            onClick={handleSaveReview}
            className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 px-4 py-2 rounded font-sans text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaved ? 'Narrative Saved' : 'Commit Narrative Log'}
          </button>
        </div>
      </div>

    </div>
  );
};
