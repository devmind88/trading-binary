import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Award, 
  Flame, 
  Activity, 
  Layers, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Percent, 
  Scale, 
  Calendar, 
  Clock, 
  Sliders, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { Trade, StrategyId } from '../types';
import { approvedStrategies } from '../data';

interface ProfessionalAnalyticsProps {
  trades: Trade[];
  startingBalance?: number;
}

export const ProfessionalAnalytics: React.FC<ProfessionalAnalyticsProps> = ({ 
  trades,
  startingBalance = 1000
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'ALL' | '30D' | '7D'>('ALL');
  const [filterStrategy, setFilterStrategy] = useState<string>('ALL');

  // Filtered Trades
  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      if (filterStrategy !== 'ALL' && t.strategyId !== filterStrategy) return false;
      return true;
    });
  }, [trades, filterStrategy]);

  // Quantitative Institutional Math Engine (Sharpe, Sortino, Profit Factor, Expectancy, Max Drawdown)
  const stats = useMemo(() => {
    const total = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.result === 'WIN').length;
    const losses = filteredTrades.filter(t => t.result === 'LOSS').length;
    const ties = filteredTrades.filter(t => t.result === 'TIE').length;
    const winRate = total > 0 ? Math.round((wins / (wins + losses || 1)) * 100) : 0;

    const grossProfit = filteredTrades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(filteredTrades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
    const netPnl = grossProfit - grossLoss;
    const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : parseFloat(grossProfit.toFixed(2));

    const avgWin = wins > 0 ? parseFloat((grossProfit / wins).toFixed(2)) : 0;
    const avgLoss = losses > 0 ? parseFloat((grossLoss / losses).toFixed(2)) : 0;
    
    // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
    const winPct = winRate / 100;
    const lossPct = 1 - winPct;
    const expectancyDollars = parseFloat(((winPct * avgWin) - (lossPct * avgLoss)).toFixed(2));
    const expectancyRatio = avgLoss > 0 ? parseFloat((expectancyDollars / avgLoss).toFixed(2)) : 0;

    // Equity Curve & Drawdown Decomposition
    let peak = startingBalance;
    let maxDrawdownDollars = 0;
    let maxDrawdownPct = 0;
    let currentBal = startingBalance;
    const returns: number[] = [];
    const equityCurve: Array<{ date: string; balance: number; drawdownPct: number }> = [];

    filteredTrades.forEach(t => {
      const prevBal = currentBal;
      currentBal += t.pnl;
      const tradeRet = (currentBal - prevBal) / prevBal;
      returns.push(tradeRet);

      if (currentBal > peak) peak = currentBal;
      const ddDollars = peak - currentBal;
      const ddPct = peak > 0 ? (ddDollars / peak) * 100 : 0;

      if (ddDollars > maxDrawdownDollars) maxDrawdownDollars = ddDollars;
      if (ddPct > maxDrawdownPct) maxDrawdownPct = ddPct;

      equityCurve.push({
        date: `${t.date} ${t.time}`,
        balance: parseFloat(currentBal.toFixed(2)),
        drawdownPct: parseFloat(ddPct.toFixed(2))
      });
    });

    // Sharpe & Sortino Calculations (Daily Risk Free Rate = 0 for intraday active)
    const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const variance = returns.length > 0 ? returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? parseFloat(((meanReturn / stdDev) * Math.sqrt(252)).toFixed(2)) : 0;

    // Downside deviation for Sortino
    const downsideReturns = returns.filter(r => r < 0);
    const downsideVariance = downsideReturns.length > 0 ? downsideReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / downsideReturns.length : 0;
    const downsideStdDev = Math.sqrt(downsideVariance);
    const sortinoRatio = downsideStdDev > 0 ? parseFloat(((meanReturn / downsideStdDev) * Math.sqrt(252)).toFixed(2)) : 0;

    // Calmar Ratio = Annualized Return / Max Drawdown %
    const totalReturnPct = ((currentBal - startingBalance) / startingBalance) * 100;
    const calmarRatio = maxDrawdownPct > 0 ? parseFloat((totalReturnPct / maxDrawdownPct).toFixed(2)) : 0;

    return {
      total,
      wins,
      losses,
      ties,
      winRate,
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      grossLoss: parseFloat(grossLoss.toFixed(2)),
      netPnl: parseFloat(netPnl.toFixed(2)),
      profitFactor,
      avgWin,
      avgLoss,
      expectancyDollars,
      expectancyRatio,
      maxDrawdownDollars: parseFloat(maxDrawdownDollars.toFixed(2)),
      maxDrawdownPct: parseFloat(maxDrawdownPct.toFixed(2)),
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      currentBal: parseFloat(currentBal.toFixed(2)),
      equityCurve
    };
  }, [filteredTrades, startingBalance]);

  // Export CSV Functionality
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Time', 'Strategy', 'Type', 'Amount', 'Result', 'PnL', 'Session', 'Emotional'];
    const rows = filteredTrades.map(t => [
      t.id,
      t.date,
      t.time,
      t.strategyId,
      t.type,
      t.amount,
      t.result,
      t.pnl,
      t.session,
      t.isEmotional ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trade_audit_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="professional-analytics-command-center" className="space-y-6">
      
      {/* Executive Command Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl text-white shadow-lg shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans font-bold text-slate-100 text-base">
                Institutional Quant Analytics & Risk Decomposition
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-955 border border-emerald-800 text-emerald-300 font-bold">
                Hedge-Fund Metrics
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Sharpe & Sortino risk-adjusted returns, expectancy modeling, drawdown clustering, and tax-ready CSV export.
            </p>
          </div>
        </div>

        {/* Filter & Export Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterStrategy}
            onChange={e => setFilterStrategy(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
          >
            <option value="ALL">All Strategies ({trades.length})</option>
            {approvedStrategies.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-700 hover:border-emerald-500 text-emerald-300 transition text-xs font-mono flex items-center gap-2 cursor-pointer shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Institutional Key Ratio Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-mono text-slate-500 block">Sharpe Ratio</span>
          <span className={`text-xl font-mono font-bold ${stats.sharpeRatio >= 1.5 ? 'text-emerald-400' : stats.sharpeRatio >= 1.0 ? 'text-indigo-300' : 'text-slate-200'}`}>
            {stats.sharpeRatio}
          </span>
          <span className="text-[9px] font-sans text-slate-400">&gt;1.5 is institutional</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-mono text-slate-500 block">Sortino Ratio</span>
          <span className={`text-xl font-mono font-bold ${stats.sortinoRatio >= 2.0 ? 'text-emerald-400' : 'text-indigo-300'}`}>
            {stats.sortinoRatio}
          </span>
          <span className="text-[9px] font-sans text-slate-400">Downside penalty</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-mono text-slate-500 block">Profit Factor</span>
          <span className={`text-xl font-mono font-bold ${stats.profitFactor >= 1.75 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stats.profitFactor}
          </span>
          <span className="text-[9px] font-sans text-slate-400">${stats.grossProfit} / ${stats.grossLoss}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-mono text-slate-500 block">Expectancy / Trade</span>
          <span className={`text-xl font-mono font-bold ${stats.expectancyDollars >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
            {stats.expectancyDollars >= 0 ? '+' : ''}${stats.expectancyDollars}
          </span>
          <span className="text-[9px] font-sans text-slate-400">Mathematical edge</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-mono text-slate-500 block">Max Drawdown</span>
          <span className={`text-xl font-mono font-bold ${stats.maxDrawdownPct <= 6 ? 'text-emerald-400' : 'text-rose-450'}`}>
            {stats.maxDrawdownPct}%
          </span>
          <span className="text-[9px] font-sans text-slate-400">-${stats.maxDrawdownDollars} peak-trough</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
          <span className="text-[9px] uppercase font-mono text-slate-500 block">Calmar Ratio</span>
          <span className="text-xl font-mono font-bold text-purple-300">
            {stats.calmarRatio}
          </span>
          <span className="text-[9px] font-sans text-slate-400">Return / Max DD</span>
        </div>

      </div>

      {/* Equity Curve & Drawdown Decomposition Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-sans font-bold text-sm text-slate-100">
                Equity Curve & Drawdown Decomposition
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Starting: ${startingBalance}</span>
              <span className="text-emerald-400 font-bold">Current: ${stats.currentBal}</span>
            </div>
          </div>

          {/* SVG Equity Graph */}
          <div className="h-56 w-full bg-slate-950 rounded-xl border border-slate-850 p-4 relative overflow-hidden flex flex-col justify-end">
            <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-20">
              <div className="border-b border-slate-700 w-full"></div>
              <div className="border-b border-slate-700 w-full"></div>
              <div className="border-b border-slate-700 w-full"></div>
            </div>

            {/* Render Polyline */}
            <svg className="w-full h-full overflow-visible z-10" preserveAspectRatio="none" viewBox={`0 0 ${Math.max(10, stats.equityCurve.length)} 100`}>
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={stats.equityCurve.map((pt, idx) => {
                  const maxBal = Math.max(stats.currentBal * 1.1, startingBalance * 1.2, 1100);
                  const minBal = Math.min(startingBalance * 0.9, 900);
                  const range = maxBal - minBal || 1;
                  const x = (idx / Math.max(1, stats.equityCurve.length - 1)) * (stats.equityCurve.length || 10);
                  const y = 100 - ((pt.balance - minBal) / range) * 85;
                  return `${x},${y}`;
                }).join(' ')}
              />
            </svg>

            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900 mt-2">
              <span>Origin (Session 1)</span>
              <span>Latest Verified Contract (Session {stats.equityCurve.length})</span>
            </div>
          </div>
        </div>

        {/* Right Capital Efficiency Radar (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="font-sans font-bold text-sm text-slate-100">Capital Efficiency Audit</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Win/Loss Asymmetry</span>
                <span className="text-xs font-mono text-slate-300 font-bold">Avg Win: ${stats.avgWin} / Avg Loss: ${stats.avgLoss}</span>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${stats.avgWin >= stats.avgLoss * 0.8 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                {stats.avgLoss > 0 ? (stats.avgWin / stats.avgLoss).toFixed(2) : '1.0'}x
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Execution Edge Ratio</span>
                <span className="text-xs font-mono text-slate-300 font-bold">{stats.winRate}% Base Reliability</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{stats.expectancyDollars}$/trade
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Capital Preservation Score</span>
                <span className="text-xs font-mono text-slate-300 font-bold">Drawdown capped at {stats.maxDrawdownPct}%</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-300">
                A+ Grade
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
