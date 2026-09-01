import React, { useMemo, useState } from 'react';
import { Trade, TradingSession, StrategyId } from '../types';
import { approvedStrategies } from '../data';
import { 
  Sun, 
  CloudSun, 
  Moon, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar,
  Layers,
  BarChart3,
  Award
} from 'lucide-react';

interface SessionHeatmapWidgetProps {
  trades: Trade[];
}

export const SessionHeatmapWidget: React.FC<SessionHeatmapWidgetProps> = ({ trades }) => {
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<TradingSession | 'ALL'>('ALL');
  const [viewMetric, setViewMetric] = useState<'winRate' | 'pnl' | 'volume'>('winRate');

  // Days of week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const sessions: TradingSession[] = ['Morning', 'Midday', 'Evening'];

  // Session Time Windows
  const sessionInfo: Record<TradingSession, { label: string; timeRange: string; desc: string; icon: any; gradient: string }> = {
    Morning: {
      label: 'Morning Session',
      timeRange: '06:00 – 11:59',
      desc: 'London / NY Open Overlap & Early Volatility',
      icon: Sun,
      gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400'
    },
    Midday: {
      label: 'Midday Session',
      timeRange: '12:00 – 16:59',
      desc: 'NY Lunch & Afternoon Trend Continuations',
      icon: CloudSun,
      gradient: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400'
    },
    Evening: {
      label: 'Evening Session',
      timeRange: '17:00 – 23:59',
      desc: 'Asian Open & Tokyo Range Consolidations',
      icon: Moon,
      gradient: 'from-purple-500/20 to-indigo-900/10 border-purple-500/40 text-purple-400'
    }
  };

  // Helper to infer Day of Week from Trade date (YYYY-MM-DD)
  const getTradeDayIndex = (dateStr: string): number => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        // JS Date: 0 is Sunday, 1 is Monday ... 6 is Saturday
        const day = date.getDay();
        return day === 0 ? 6 : day - 1; // Map Sunday to index 6, Mon to 0
      }
    } catch {
      // fallback
    }
    return 0;
  };

  // Compute Aggregates per Session
  const sessionStats = useMemo(() => {
    const stats: Record<TradingSession, {
      tradesCount: number;
      wins: number;
      losses: number;
      ties: number;
      winRate: number;
      pnl: number;
      avgTrade: number;
      emotionalTrades: number;
      bestStrategy: string;
    }> = {
      Morning: { tradesCount: 0, wins: 0, losses: 0, ties: 0, winRate: 0, pnl: 0, avgTrade: 0, emotionalTrades: 0, bestStrategy: 'N/A' },
      Midday: { tradesCount: 0, wins: 0, losses: 0, ties: 0, winRate: 0, pnl: 0, avgTrade: 0, emotionalTrades: 0, bestStrategy: 'N/A' },
      Evening: { tradesCount: 0, wins: 0, losses: 0, ties: 0, winRate: 0, pnl: 0, avgTrade: 0, emotionalTrades: 0, bestStrategy: 'N/A' }
    };

    const stratPerSession: Record<TradingSession, Record<string, { wins: number; count: number }>> = {
      Morning: {},
      Midday: {},
      Evening: {}
    };

    trades.forEach(t => {
      // infer session if missing or map it
      let sess: TradingSession = t.session || 'Morning';
      if (!['Morning', 'Midday', 'Evening'].includes(sess)) {
        sess = 'Morning';
      }

      const s = stats[sess];
      s.tradesCount++;
      if (t.isEmotional) s.emotionalTrades++;
      if (t.result === 'WIN') s.wins++;
      else if (t.result === 'LOSS') s.losses++;
      else s.ties++;
      s.pnl += t.pnl;

      // Track strategy wins per session
      if (!stratPerSession[sess][t.strategyId]) {
        stratPerSession[sess][t.strategyId] = { wins: 0, count: 0 };
      }
      stratPerSession[sess][t.strategyId].count++;
      if (t.result === 'WIN') {
        stratPerSession[sess][t.strategyId].wins++;
      }
    });

    sessions.forEach(sess => {
      const s = stats[sess];
      const valid = s.wins + s.losses;
      s.winRate = valid > 0 ? Math.round((s.wins / valid) * 100) : 0;
      s.pnl = parseFloat(s.pnl.toFixed(2));
      s.avgTrade = s.tradesCount > 0 ? parseFloat((s.pnl / s.tradesCount).toFixed(2)) : 0;

      // Determine best strategy in this session
      let bestStratName = 'N/A';
      let highestWr = -1;
      Object.entries(stratPerSession[sess]).forEach(([stratId, data]) => {
        const wr = data.count > 0 ? (data.wins / data.count) : 0;
        if (wr > highestWr && data.count >= 1) {
          highestWr = wr;
          const found = approvedStrategies.find(item => item.id === stratId);
          bestStratName = found ? found.name : stratId;
        }
      });
      s.bestStrategy = bestStratName;
    });

    // Determine Best Session overall
    let bestSession: TradingSession = 'Morning';
    let maxScore = -Infinity;
    sessions.forEach(sess => {
      const s = stats[sess];
      // Score balances win rate and total trades
      if (s.tradesCount >= 2) {
        const score = s.winRate * 0.7 + (s.pnl > 0 ? 30 : 0);
        if (score > maxScore) {
          maxScore = score;
          bestSession = sess;
        }
      }
    });

    return {
      stats,
      bestSession
    };
  }, [trades]);

  // Compute 2D Matrix: Session (Rows) x Day of Week (Cols)
  const heatmapGrid = useMemo(() => {
    // grid[sessionIndex][dayIndex]
    const grid: Array<Array<{
      session: TradingSession;
      day: string;
      dayIndex: number;
      tradesCount: number;
      wins: number;
      losses: number;
      ties: number;
      winRate: number;
      pnl: number;
    }>> = sessions.map(sess => {
      return daysOfWeek.map((day, dIdx) => ({
        session: sess,
        day,
        dayIndex: dIdx,
        tradesCount: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        winRate: 0,
        pnl: 0
      }));
    });

    trades.forEach(t => {
      let sess: TradingSession = t.session || 'Morning';
      if (!['Morning', 'Midday', 'Evening'].includes(sess)) {
        sess = 'Morning';
      }
      const sIdx = sessions.indexOf(sess);
      const dIdx = getTradeDayIndex(t.date);

      if (sIdx >= 0 && dIdx >= 0 && dIdx < 7) {
        const cell = grid[sIdx][dIdx];
        cell.tradesCount++;
        if (t.result === 'WIN') cell.wins++;
        else if (t.result === 'LOSS') cell.losses++;
        else cell.ties++;
        cell.pnl += t.pnl;
      }
    });

    // Compute win rates and round PnL
    grid.forEach(row => {
      row.forEach(cell => {
        const valid = cell.wins + cell.losses;
        cell.winRate = valid > 0 ? Math.round((cell.wins / valid) * 100) : 0;
        cell.pnl = parseFloat(cell.pnl.toFixed(2));
      });
    });

    return grid;
  }, [trades]);

  // Dynamic Heatmap Cell Styling function
  const getCellIntensityStyle = (cell: { tradesCount: number; winRate: number; pnl: number }) => {
    if (cell.tradesCount === 0) {
      return 'bg-slate-950/60 border-slate-850/60 text-slate-600 hover:border-slate-700';
    }

    if (viewMetric === 'winRate') {
      if (cell.winRate >= 80) {
        return 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      } else if (cell.winRate >= 60) {
        return 'bg-emerald-600/15 border-emerald-600/40 text-emerald-400 font-semibold';
      } else if (cell.winRate >= 50) {
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold';
      } else {
        return 'bg-rose-500/20 border-rose-500/40 text-rose-400 font-semibold';
      }
    } else if (viewMetric === 'pnl') {
      if (cell.pnl > 100) {
        return 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      } else if (cell.pnl > 0) {
        return 'bg-emerald-600/15 border-emerald-600/40 text-emerald-400 font-semibold';
      } else if (cell.pnl === 0) {
        return 'bg-slate-850 border-slate-750 text-slate-300';
      } else {
        return 'bg-rose-500/20 border-rose-500/40 text-rose-400 font-semibold';
      }
    } else {
      // Volume
      if (cell.tradesCount >= 5) {
        return 'bg-indigo-500/30 border-indigo-500/60 text-indigo-200 font-bold';
      } else if (cell.tradesCount >= 2) {
        return 'bg-indigo-600/15 border-indigo-600/40 text-indigo-300 font-semibold';
      } else {
        return 'bg-slate-900 border-slate-800 text-slate-400';
      }
    }
  };

  return (
    <div id="session-heatmap-widget-container" className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-xl">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-bold text-slate-100 text-base">Session Performance Heat Map</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                Time Frame Matrix
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Correlate hourly market sessions (Morning, Midday, Evening) with historical win rates to isolate optimal trading windows.
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 self-start md:self-auto">
          <button
            onClick={() => setViewMetric('winRate')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
              viewMetric === 'winRate'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Win Rate %
          </button>
          <button
            onClick={() => setViewMetric('pnl')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
              viewMetric === 'pnl'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Net P&L ($)
          </button>
          <button
            onClick={() => setViewMetric('volume')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
              viewMetric === 'volume'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Volume
          </button>
        </div>
      </div>

      {/* 3 Executive Session Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sessions.map(sess => {
          const stat = sessionStats.stats[sess];
          const info = sessionInfo[sess];
          const IconComp = info.icon;
          const isOptimal = sessionStats.bestSession === sess && stat.tradesCount > 0;

          return (
            <div 
              key={sess}
              onClick={() => setSelectedSessionFilter(selectedSessionFilter === sess ? 'ALL' : sess)}
              className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                selectedSessionFilter === sess 
                  ? 'bg-slate-950 border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                  : 'bg-slate-950/80 border-slate-850 hover:border-slate-750'
              }`}
            >
              {isOptimal && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Optimal Session</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${info.gradient}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-slate-100 text-sm">{info.label}</h4>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {info.timeRange}
                    </span>
                  </div>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Win Rate</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`text-xl font-mono font-bold ${stat.winRate >= 60 ? 'text-emerald-400' : stat.winRate >= 50 ? 'text-amber-400' : 'text-rose-450'}`}>
                        {stat.winRate}%
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">({stat.wins}W / {stat.losses}L)</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">Net Return</span>
                    <span className={`text-xl font-mono font-bold mt-0.5 block ${stat.pnl >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                      {stat.pnl >= 0 ? '+' : ''}${stat.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      stat.winRate >= 60 ? 'bg-emerald-500' : stat.winRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stat.winRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer details */}
              <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Total: {stat.tradesCount} trades</span>
                <span className="text-slate-300 font-sans truncate max-w-[150px]">
                  Top: <strong className="text-indigo-300 font-semibold">{stat.bestStrategy}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive 2D Heatmap Grid Table */}
      <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 space-y-3 overflow-x-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-850 min-w-[550px]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">
              Trading Session × Day of Week Heat Grid
            </span>
          </div>

          {/* Color Intensity Legend */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500"></span> 70%+ / High PnL
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500"></span> 50-69%
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500"></span> &lt;50% / Drawdown
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-800"></span> No Trades
              </span>
            </div>
          </div>
        </div>

        <table className="w-full min-w-[550px] border-collapse">
          <thead>
            <tr>
              <th className="p-2.5 text-left text-[11px] font-mono font-semibold text-slate-500 w-32">
                Session Window
              </th>
              {dayAbbr.map(day => (
                <th key={day} className="p-2.5 text-center text-[11px] font-mono font-semibold text-slate-400">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((sess, sIdx) => {
              const info = sessionInfo[sess];
              const IconComp = info.icon;

              return (
                <tr key={sess} className="border-t border-slate-900">
                  <td className="p-2.5 text-xs font-sans font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      <IconComp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <span>{sess}</span>
                        <span className="block text-[9px] font-mono text-slate-500 font-normal">{info.timeRange}</span>
                      </div>
                    </div>
                  </td>

                  {dayAbbr.map((_, dIdx) => {
                    const cell = heatmapGrid[sIdx][dIdx];
                    const styleClass = getCellIntensityStyle(cell);

                    return (
                      <td key={dIdx} className="p-1.5 text-center">
                        <div 
                          className={`p-2 rounded-lg border transition-all flex flex-col items-center justify-center min-h-[54px] cursor-default ${styleClass}`}
                          title={`${sess} on ${daysOfWeek[dIdx]}: ${cell.winRate}% Win Rate, $${cell.pnl} PnL (${cell.tradesCount} trades)`}
                        >
                          {cell.tradesCount === 0 ? (
                            <span className="text-[10px] font-mono text-slate-600">–</span>
                          ) : (
                            <>
                              {viewMetric === 'winRate' && (
                                <>
                                  <span className="text-xs font-mono font-bold leading-tight">{cell.winRate}%</span>
                                  <span className="text-[9px] font-mono opacity-80">{cell.wins}W-{cell.losses}L</span>
                                </>
                              )}
                              {viewMetric === 'pnl' && (
                                <>
                                  <span className="text-xs font-mono font-bold leading-tight">
                                    {cell.pnl >= 0 ? '+' : ''}${cell.pnl}
                                  </span>
                                  <span className="text-[9px] font-mono opacity-80">{cell.tradesCount} trades</span>
                                </>
                              )}
                              {viewMetric === 'volume' && (
                                <>
                                  <span className="text-xs font-mono font-bold leading-tight">{cell.tradesCount}</span>
                                  <span className="text-[9px] font-mono opacity-80">contracts</span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actionable Time-of-Day Tactical Insights */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
            Automated Session Optimization Insights
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs text-slate-300 font-sans leading-relaxed">
          <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-900/30 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 block font-semibold">Prime Execution Window ({sessionStats.bestSession}):</strong>
              <span>
                Your highest statistical expectancy occurs during the <strong>{sessionStats.bestSession} session</strong> ({sessionStats.stats[sessionStats.bestSession].winRate}% Win Rate, ${sessionStats.stats[sessionStats.bestSession].pnl} Net). Prioritize scheduling your active trade executions within this window.
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-amber-900/30 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block font-semibold">Sub-Optimal Session Guardrail:</strong>
              <span>
                Exercise strict caution or contract size reduction during sessions where win rate dips below 55%. Avoid forcing setups during illiquid midday consolidations.
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
