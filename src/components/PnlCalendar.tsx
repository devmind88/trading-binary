import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Plus, Trash2, ArrowUpRight, ArrowDownRight, Tag, HelpCircle, FileText, ChevronLeft, ChevronRight, RotateCcw, Filter, X, Flame, Sparkles } from 'lucide-react';
import { Trade, RiskLimits, StrategyId, TradingSession } from '../types';
import { approvedStrategies } from '../data';

interface PnlCalendarProps {
  trades: Trade[];
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
  riskLimits: RiskLimits;
  onTriggerStreakToast?: (streak: number, pnl: number) => void;
}

export const PnlCalendar: React.FC<PnlCalendarProps> = ({ trades, setTrades, riskLimits, onTriggerStreakToast }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Dynamic Year and Month state initialized from latest trade or current date
  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (trades.length > 0) {
      const y = parseInt(trades[0].date.split('-')[0]);
      if (!isNaN(y)) return y;
    }
    return new Date().getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (trades.length > 0) {
      const m = parseInt(trades[0].date.split('-')[1]);
      if (!isNaN(m)) return m - 1;
    }
    return new Date().getMonth();
  });

  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDayFilter(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDayFilter(null);
  };

  const handleJumpToCurrent = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDayFilter(null);
  };

  // Local state for adding a trade
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    strategyId: 'trend_continuation' as StrategyId,
    type: 'CALL' as 'CALL' | 'PUT',
    amount: 20,
    result: 'WIN' as 'WIN' | 'LOSS' | 'TIE',
    payoutRate: 82,
    session: 'Morning' as TradingSession,
    isEmotional: false,
    notes: ''
  });

  // Calculate session helper automatically based on time
  const handleTimeChange = (timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0]) || 0;
    let session: TradingSession = 'Morning';
    if (hour >= 12 && hour < 17) session = 'Midday';
    else if (hour >= 17 || hour < 6) session = 'Evening';
    setFormData(prev => ({ ...prev, time: timeStr, session }));
  };

  // Add individual trade logger handler
  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify limit size standard
    const singlePercent = (formData.amount / riskLimits.startingBalance) * 100;
    const consistencyChecked = singlePercent >= riskLimits.minTradeSizePercent && singlePercent <= riskLimits.maxTradeSizePercent;

    // Calculate dynamic PNL
    let computedPnl = 0;
    if (formData.result === 'WIN') {
      computedPnl = formData.amount * (formData.payoutRate / 100);
    } else if (formData.result === 'LOSS') {
      computedPnl = -formData.amount;
    }

    const newTrade: Trade = {
      id: 't_' + Date.now(),
      date: formData.date,
      time: formData.time,
      strategyId: formData.strategyId,
      type: formData.type,
      amount: formData.amount,
      result: formData.result,
      payoutRate: formData.payoutRate,
      pnl: parseFloat(computedPnl.toFixed(2)),
      session: formData.session,
      isEmotional: formData.isEmotional,
      positionConsistencyChecked: consistencyChecked,
      notes: formData.notes
    };

    setTrades(prev => [newTrade, ...prev]);

    // Reset form fields but keep date
    setFormData(prev => ({
      ...prev,
      time: new Date().toTimeString().slice(0, 5),
      amount: 20,
      isEmotional: false,
      notes: ''
    }));
  };

  // Delete trade logger handler
  const handleDeleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  // Group trades by Date for calendar rendering and aggregation
  const dailyAggregates = useMemo(() => {
    const aggregates: Record<string, {
      trades: Trade[];
      wins: number;
      losses: number;
      ties: number;
      netPnl: number;
    }> = {};

    trades.forEach(trade => {
      const d = trade.date;
      if (!aggregates[d]) {
        aggregates[d] = { trades: [], wins: 0, losses: 0, ties: 0, netPnl: 0 };
      }
      aggregates[d].trades.push(trade);
      if (trade.result === 'WIN') aggregates[d].wins++;
      else if (trade.result === 'LOSS') aggregates[d].losses++;
      else aggregates[d].ties++;
      aggregates[d].netPnl += trade.pnl;
    });

    return aggregates;
  }, [trades]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = trades.length;
    const wins = trades.filter(t => t.result === 'WIN').length;
    const losses = trades.filter(t => t.result === 'LOSS').length;
    const ties = trades.filter(t => t.result === 'TIE').length;
    const winRate = total > 0 ? (wins / (total - ties || 1)) * 100 : 0;
    const netPnl = trades.reduce((sum, t) => sum + t.pnl, 0);

    let bestDayName = 'None';
    let bestDayPnl = -Infinity;
    let worstDayName = 'None';
    let worstDayPnl = Infinity;

    Object.entries(dailyAggregates).forEach(([dateStr, agg]: [string, any]) => {
      if (agg.netPnl > bestDayPnl) {
        bestDayPnl = agg.netPnl;
        bestDayName = dateStr;
      }
      if (agg.netPnl < worstDayPnl) {
        worstDayPnl = agg.netPnl;
        worstDayName = dateStr;
      }
    });

    return {
      total,
      wins,
      losses,
      ties,
      winRate: Math.round(winRate),
      netPnl,
      bestDay: bestDayName !== 'None' ? `${bestDayName} (+$${bestDayPnl.toFixed(2)})` : 'N/A',
      worstDay: worstDayName !== 'None' ? `${worstDayName} (-$${Math.abs(worstDayPnl).toFixed(2)})` : 'N/A'
    };
  }, [trades, dailyAggregates]);

  // Generate Equity Curve points
  const equityPoints = useMemo(() => {
    // Sort trades chronologically
    const sortedTrades = [...trades].sort((a, b) => {
      const aComp = `${a.date}T${a.time}`;
      const bComp = `${b.date}T${b.time}`;
      return aComp.localeCompare(bComp);
    });

    let cumBalance = riskLimits.startingBalance;
    const points = [{ balance: cumBalance, label: 'Start' }];

    sortedTrades.forEach((t, index) => {
      cumBalance += t.pnl;
      points.push({
        balance: parseFloat(cumBalance.toFixed(2)),
        label: t.date.slice(5) // MM-DD
      });
    });

    return points;
  }, [trades, riskLimits.startingBalance]);

  // Dynamic Current Win Streak Calculation
  const currentStreakInfo = useMemo(() => {
    if (!trades || trades.length === 0) return { streak: 0, pnl: 0 };
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
    return { streak, pnl: parseFloat(pnl.toFixed(2)) };
  }, [trades]);

  // Render SVG Sparkline
  const renderEquityCurve = () => {
    if (equityPoints.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-lg">
          Not enough logged trades to plot the Equity curve. Add logs below.
        </div>
      );
    }

    const w = 400;
    const h = 180;
    const pad = 25;

    const balances = equityPoints.map(p => p.balance);
    const minBal = Math.min(...balances) * 0.98; // 2% breathing room
    const maxBal = Math.max(...balances) * 1.02; // 2% breathing room
    const balRange = maxBal - minBal || 1;

    // Map point to coordinates
    const getX = (i: number) => pad + (i / (equityPoints.length - 1)) * (w - 2 * pad);
    const getY = (bal: number) => h - pad - ((bal - minBal) / balRange) * (h - 2 * pad);

    let pathD = `M ${getX(0)} ${getY(equityPoints[0].balance)}`;
    for (let i = 1; i < equityPoints.length; i++) {
      pathD += ` L ${getX(i)} ${getY(equityPoints[i].balance)}`;
    }

    // Gradient area path
    let areaD = pathD + ` L ${getX(equityPoints.length - 1)} ${h - pad} L ${getX(0)} ${h - pad} Z`;

    return (
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">Dynamic Equity Curve</span>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">
            Start: ${riskLimits.startingBalance} → End: ${(equityPoints[equityPoints.length - 1]?.balance || 0).toFixed(2)}
          </span>
        </div>
        
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44 cursor-crosshair">
          {/* Gradients */}
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={pad} y1={getY(riskLimits.startingBalance)} x2={w - pad} y2={getY(riskLimits.startingBalance)} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <text x={pad + 5} y={getY(riskLimits.startingBalance) - 4} fill="#475569" className="text-[9px] font-mono">Starting S.B.</text>
          
          {/* Fill Area */}
          <path d={areaD} fill="url(#curveGrad)" />
          
          {/* Curve Line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

          {/* Points circles */}
          {equityPoints.map((pt, idx) => (
            <circle
              key={idx}
              cx={getX(idx)}
              cy={getY(pt.balance)}
              r="3.5"
              fill="#1e293b"
              stroke="#10b981"
              strokeWidth="1.5"
              className="hover:r-5 hover:fill-emerald-400 transition"
            >
              <title>{`Trade ${idx}: $${pt.balance} (${pt.label})`}</title>
            </circle>
          ))}
        </svg>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1 border-t border-slate-900 pt-2 shrink-0">
          <span>T#0</span>
          <span>Midpoint</span>
          <span>T#{equityPoints.length - 1}</span>
        </div>
      </div>
    );
  };

  return (
    <div id="pnl-calendar-container" className="space-y-6">
      
      {/* Upper Metrics Dashboard banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-500">Gross Wins / Loss</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-mono text-slate-200">{stats.wins} <span className="text-slate-500 font-normal">W</span> : {stats.losses} <span className="text-slate-500 font-normal">L</span></span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-500">Global winrate</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-mono text-emerald-400 font-semibold">{stats.winRate}%</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-500">Net Return (PnL)</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl font-mono font-bold ${stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-500">Executed Quant</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-mono text-slate-200">{stats.total} trades</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-500">Peak Session (Best)</span>
          <div className="mt-2">
            <span className="text-xs font-mono text-emerald-400 truncate block">{stats.bestDay}</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-500">Trough Session (Worst)</span>
          <div className="mt-2">
            <span className="text-xs font-mono text-rose-400 truncate block">{stats.worstDay}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Win Streak Positive Reinforcement Card (Milestone Alert) */}
      {currentStreakInfo.streak >= 3 && (
        <div 
          onClick={() => onTriggerStreakToast && onTriggerStreakToast(currentStreakInfo.streak, currentStreakInfo.pnl)}
          className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/30 hover:border-amber-500/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition group shadow-lg shadow-amber-950/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-100 font-sans">
                  Active {currentStreakInfo.streak}-Trade Win Streak!
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold">
                  +${currentStreakInfo.pnl.toFixed(2)} Streak P&L
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                  Positive Reinforcement Engaged
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Outstanding execution discipline! Remember: protect your profits, avoid overconfidence, and keep sizing at 1-2%.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0 self-end sm:self-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Show Toast Alert</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Trade Logger Form and Equity curve */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Logger Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-sidebar-border pb-3">
              <Plus className="w-5 h-5 text-emerald-400" />
              <h3 className="font-sans font-medium text-slate-100 text-lg">Log Single Contract</h3>
            </div>

            <form onSubmit={handleAddTrade} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-slate-400 uppercase tracking-wider block mb-1">Contract Expiry Date</span>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:border-slate-700 outline-none"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="text-slate-400 uppercase tracking-wider block mb-1">Entry Timestamp</span>
                  <input
                    type="time"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:border-slate-700 outline-none"
                    value={formData.time}
                    onChange={e => handleTimeChange(e.target.value)}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-slate-400 uppercase tracking-wider block mb-1">S.B. Allocation Amount ($)</span>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:border-slate-700 outline-none"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: Math.max(1, parseFloat(e.target.value) || 0) }))}
                  />
                </label>
                <label className="block">
                  <span className="text-slate-400 uppercase tracking-wider block mb-1">Payout Multiplier (%)</span>
                  <input
                    type="number"
                    required
                    min="50"
                    max="100"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:border-slate-700 outline-none"
                    value={formData.payoutRate}
                    onChange={e => setFormData(prev => ({ ...prev, payoutRate: Math.max(10, parseFloat(e.target.value) || 0) }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-slate-400 uppercase tracking-wider block mb-1">Approved Strategy</span>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-sans focus:border-slate-700 outline-none"
                    value={formData.strategyId}
                    onChange={e => setFormData(prev => ({ ...prev, strategyId: e.target.value as StrategyId }))}
                  >
                    {approvedStrategies.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
                
                <label className="block">
                  <span className="text-slate-400 uppercase tracking-wider block mb-1">Contract Entry Direction</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'CALL' }))}
                      className={`py-1.5 rounded font-mono text-[10px] font-bold border transition ${
                        formData.type === 'CALL'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      ▲ BUY/CALL
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: 'PUT' }))}
                      className={`py-1.5 rounded font-mono text-[10px] font-bold border transition ${
                        formData.type === 'PUT'
                          ? 'bg-rose-955 border-rose-600 text-rose-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      ▼ SELL/PUT
                    </button>
                  </div>
                </label>
              </div>

              <div>
                <span className="text-slate-400 uppercase tracking-wider block mb-1">Settlement Outcome</span>
                <div className="grid grid-cols-3 gap-2">
                  {['WIN', 'LOSS', 'TIE'].map(outcome => (
                    <button
                      key={outcome}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, result: outcome as 'WIN' | 'LOSS' | 'TIE' }))}
                      className={`py-1.5 rounded font-mono text-[10px] font-bold border transition ${
                        formData.result === outcome
                          ? outcome === 'WIN'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                            : outcome === 'LOSS'
                              ? 'bg-rose-955 border-rose-600 text-rose-400'
                              : 'bg-slate-800 border-slate-700 text-slate-200'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {outcome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotional assessment checkbox */}
              <label className="flex items-center gap-2.5 p-2 bg-slate-950/40 border border-slate-800/60 rounded cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-0"
                  checked={formData.isEmotional}
                  onChange={e => setFormData(prev => ({ ...prev, isEmotional: e.target.checked }))}
                />
                <div>
                  <span className="text-slate-200 font-semibold block">Did you trade emotionally?</span>
                  <span className="text-[10px] text-slate-500 block">Check this if you felt rushed, anxious, double-sized, or revengeful.</span>
                </div>
              </label>

              <label className="block">
                <span className="text-slate-400 uppercase tracking-wider block mb-1 font-mono">Contract Log Notes</span>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-sans focus:border-slate-700 outline-none h-16 resize-none"
                  placeholder="Explain structural invalidation, price action wicks, or mistake logs..."
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </label>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2.5 rounded font-mono font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4 text-slate-950" /> LOG CONTRACT ENTRY
              </button>
            </form>
          </div>

          {/* Equity curve display */}
          {renderEquityCurve()}
        </div>

        {/* Right Side: P&L Calendar and Historical Ledger list */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Calendar Day Grid block */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            {/* Header with full month and year navigation controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="font-sans font-medium text-slate-100 text-lg">
                  {monthNames[currentMonth]} {currentYear} P&L Calendar
                </h3>
              </div>
              
              {/* Navigation buttons and selectors */}
              <div className="flex items-center flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <select
                  value={currentMonth}
                  onChange={e => {
                    setCurrentMonth(Number(e.target.value));
                    setSelectedDayFilter(null);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-sans focus:border-slate-700 outline-none cursor-pointer"
                >
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx}>{name}</option>
                  ))}
                </select>

                <select
                  value={currentYear}
                  onChange={e => {
                    setCurrentYear(Number(e.target.value));
                    setSelectedDayFilter(null);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:border-slate-700 outline-none cursor-pointer"
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleJumpToCurrent}
                  className="px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-xs text-indigo-400 hover:text-indigo-300 font-mono transition flex items-center gap-1 ml-1"
                  title="Jump to Today's Month"
                >
                  <RotateCcw className="w-3 h-3" /> Today
                </button>
              </div>
            </div>

            {/* Monthly mini metrics row */}
            {(() => {
              const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
              const monthTrades = trades.filter(t => t.date.startsWith(monthStr));
              const monthNetPnl = monthTrades.reduce((acc, t) => acc + t.pnl, 0);
              const wins = monthTrades.filter(t => t.result === 'WIN').length;
              const losses = monthTrades.filter(t => t.result === 'LOSS').length;
              const nonTies = monthTrades.filter(t => t.result !== 'TIE').length;
              const winRate = nonTies > 0 ? Math.round((wins / nonTies) * 100) : 0;

              return (
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 mb-4 text-xs font-mono">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Monthly Net PnL</span>
                    <span className={`font-bold ${monthNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {monthNetPnl >= 0 ? '+' : ''}${monthNetPnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Monthly Win Rate</span>
                    <span className="text-slate-200 font-bold">{monthTrades.length > 0 ? `${winRate}%` : '—'}</span>
                    <span className="text-[9px] text-slate-500 block">({wins}W / {losses}L)</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase block">Logged Contracts</span>
                    <span className="text-indigo-300 font-bold">{monthTrades.length}</span>
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-slate-400 mb-3 font-sans leading-relaxed">
              Consolidated grid representation mapping daily outputs. Winning days are high-contrast emerald, losing days are muted rose. Click on any date box to filter the contract ledger below.
            </p>

            {/* Calendar Grid Days */}
            {(() => {
              const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
              const firstDayRaw = new Date(currentYear, currentMonth, 1).getDay();
              // Monday-first offset: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
              const startDayOffset = (firstDayRaw + 6) % 7;

              return (
                <div className="grid grid-cols-7 gap-2 text-center font-mono">
                  {/* Header days */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold py-1">{day}</div>
                  ))}

                  {/* Dynamic offset blank tiles */}
                  {Array.from({ length: startDayOffset }).map((_, i) => (
                    <div key={`offset-${i}`} className="aspect-square opacity-0"></div>
                  ))}

                  {/* Dynamic Days of the selected month */}
                  {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                    const dayStats = dailyAggregates[dayStr];
                    const isSelected = selectedDayFilter === dayStr;
                    
                    // Color formatting based on daily PnL
                    let bgStyle = 'bg-slate-950/40 hover:bg-slate-950 border border-slate-800/40 text-slate-400';
                    if (dayStats) {
                      if (dayStats.netPnl > 0) bgStyle = 'bg-emerald-950/60 hover:bg-emerald-950 border-emerald-800/80 text-emerald-300 font-bold';
                      else if (dayStats.netPnl < 0) bgStyle = 'bg-rose-955/20 hover:bg-rose-955 border-rose-900/50 text-rose-300 font-bold';
                      else bgStyle = 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300';
                    }

                    if (isSelected) {
                      bgStyle += ' ring-2 ring-indigo-500 shadow-md';
                    }

                    return (
                      <button
                        type="button"
                        key={dayStr}
                        onClick={() => setSelectedDayFilter(prev => prev === dayStr ? null : dayStr)}
                        className={`aspect-square rounded-lg flex flex-col justify-between p-1.5 transition text-xs relative cursor-pointer text-left ${bgStyle}`}
                        title={dayStats ? `Date: ${dayStr}\nTrades: ${dayStats.trades.length}\nNet PnL: $${dayStats.netPnl.toFixed(2)}\n(Click to filter ledger)` : `Date: ${dayStr} (No trades)`}
                      >
                        <span className="self-start text-[10px] opacity-70">{dayNum}</span>
                        {dayStats ? (
                          <span className="block text-[8px] font-mono text-center font-bold tracking-tighter">
                            {dayStats.netPnl > 0 ? '+' : ''}{dayStats.netPnl.toFixed(0)}
                          </span>
                        ) : (
                          <span className="block text-[8px] opacity-0 font-mono">-</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Historical Ledger List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-sans font-medium text-slate-100 text-lg">Historical S.B. Contract Ledger</h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedDayFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedDayFilter(null)}
                    className="flex items-center gap-1 text-[11px] font-mono bg-indigo-950/80 border border-indigo-700 text-indigo-300 px-2 py-0.5 rounded hover:bg-indigo-900 transition"
                  >
                    <Filter className="w-3 h-3" />
                    <span>{selectedDayFilter}</span>
                    <X className="w-3 h-3 ml-0.5" />
                  </button>
                )}
                <span className="text-xs font-mono text-slate-400">
                  {selectedDayFilter 
                    ? `${trades.filter(t => t.date === selectedDayFilter).length} on date`
                    : `${trades.length} contracts`}
                </span>
              </div>
            </div>

            {trades.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-500 font-mono text-center border border-dashed border-slate-800 rounded-lg">
                No active trade logs. Use the Left panel to record your standard binary options contracts.
              </div>
            ) : (() => {
              const displayList = selectedDayFilter ? trades.filter(t => t.date === selectedDayFilter) : trades;
              if (displayList.length === 0) {
                return (
                  <div className="h-32 flex flex-col items-center justify-center text-xs text-slate-400 font-mono text-center border border-dashed border-slate-800 rounded-lg p-4 space-y-2">
                    <p>No logged contracts found for date: <strong className="text-indigo-400">{selectedDayFilter}</strong>.</p>
                    <button
                      type="button"
                      onClick={() => setSelectedDayFilter(null)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition"
                    >
                      Show All Logs
                    </button>
                  </div>
                );
              }

              return (
                <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {displayList.map(trade => {
                    const strat = approvedStrategies.find(s => s.id === trade.strategyId);
                    return (
                      <div
                        key={trade.id}
                        className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
                      >
                        {/* Left Block: Date/Time, Strategy & Amount */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              trade.result === 'WIN' 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' 
                                : trade.result === 'LOSS' 
                                  ? 'bg-rose-955 text-rose-400 border border-rose-900/40' 
                                  : 'bg-slate-800 text-slate-300'
                            }`}>
                              {trade.result}
                            </span>
                            <span className={`font-mono px-1.5 py-0.5 rounded text-[9px] ${
                              trade.type === 'CALL' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20' : 'bg-rose-955/15 text-rose-400 border border-rose-900/10'
                            }`}>
                              {trade.type}
                            </span>
                            <span className="text-slate-500 font-mono">{trade.date} {trade.time}</span>
                            <span className="text-slate-500 font-mono">[{trade.session}]</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans font-semibold text-slate-200">{strat?.name || trade.strategyId}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">All: <span className="font-mono text-slate-300">${trade.amount}</span> @ <span className="font-mono text-slate-300">{trade.payoutRate}%</span></span>
                          </div>
                          {trade.notes && (
                            <p className="text-[11px] text-slate-400 bg-slate-950/40 p-1.5 rounded italic whitespace-pre-wrap">
                              "{trade.notes}"
                            </p>
                          )}
                          {trade.isEmotional && (
                            <span className="inline-block bg-rose-955/20 border border-rose-900/40 text-rose-400 font-mono text-[9px] px-2 py-0.5 rounded-full uppercase font-semibold">
                              ⚠ Emotional Trade
                            </span>
                          )}
                        </div>

                        {/* Right Block: PNL calculation and action */}
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 text-right">
                          <div>
                            <span className="block text-[9px] text-slate-500 font-mono uppercase">Net payout</span>
                            <span className={`text-sm font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteTrade(trade.id)}
                            className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-rose-900 text-slate-500 hover:text-rose-400 transition"
                            title="Delete log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

        </div>

      </div>

    </div>
  );
};
