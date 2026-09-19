import React, { useState } from 'react';
import { ShieldCheck, Sliders, DollarSign, Activity, Target, Check, RotateCcw, X, Layers } from 'lucide-react';
import { RiskLimits, Trade, AccountSetupConfig } from '../types';
import { sampleTrades } from '../data';

interface QuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimits: RiskLimits;
  onSaveLimits?: (limits: RiskLimits) => void;
  onSetTrades?: (trades: Trade[]) => void;
  tradesCount?: number;
  onSaveConfig?: (config: AccountSetupConfig) => void;
}

const MARKET_OPTIONS = [
  { id: 'nq', name: 'NQ Futures (Nasdaq)', category: 'Futures' },
  { id: 'es', name: 'ES Futures (S&P 500)', category: 'Futures' },
  { id: 'cl_gc', name: 'CL Crude / GC Gold', category: 'Commodities' },
  { id: 'eur_usd', name: 'EUR/USD & GBP/USD', category: 'Forex' },
  { id: 'usd_jpy', name: 'USD/JPY & Crosses', category: 'Forex' },
  { id: 'spy_qqq', name: 'SPY & Tech Equities', category: 'Equities' },
  { id: 'btc_eth', name: 'BTC / ETH Derivatives', category: 'Crypto' },
];

export const QuickStartModal: React.FC<QuickStartModalProps> = ({
  isOpen,
  onClose,
  currentLimits,
  onSaveLimits,
  onSetTrades,
  tradesCount = 0,
  onSaveConfig
}) => {
  const [startingBalance, setStartingBalance] = useState<number>(currentLimits.startingBalance || 25000);
  const [maxDailyLossPercent, setMaxDailyLossPercent] = useState<number>(currentLimits.maxDailyLossPercent || 3);
  const [maxWeeklyLossPercent, setMaxWeeklyLossPercent] = useState<number>(currentLimits.maxWeeklyLossPercent || 8);
  const [maxDailyTradesCount, setMaxDailyTradesCount] = useState<number>(currentLimits.maxDailyTradesCount || 8);
  const [minTradeSizePercent, setMinTradeSizePercent] = useState<number>(currentLimits.minTradeSizePercent || 1);
  const [maxTradeSizePercent, setMaxTradeSizePercent] = useState<number>(currentLimits.maxTradeSizePercent || 2);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['nq', 'es', 'eur_usd']);
  const [executionStyle, setExecutionStyle] = useState<'Scalping' | 'Day Trading' | 'Swing Trading'>('Day Trading');

  if (!isOpen) return null;

  const toggleMarket = (id: string) => {
    setSelectedMarkets(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = (mode: 'keep' | 'clear_zero' | 'load_sample') => {
    const updated: RiskLimits = {
      ...currentLimits,
      startingBalance: Number(startingBalance),
      currentBalance: Number(startingBalance),
      maxDailyLossPercent: Number(maxDailyLossPercent),
      maxWeeklyLossPercent: Number(maxWeeklyLossPercent),
      maxDailyTradesCount: Number(maxDailyTradesCount),
      minTradeSizePercent: Number(minTradeSizePercent),
      maxTradeSizePercent: Number(maxTradeSizePercent)
    };

    if (onSaveConfig) {
      onSaveConfig({
        startingBalance: Number(startingBalance),
        maxDailyLossPercent: Number(maxDailyLossPercent),
        maxWeeklyLossPercent: Number(maxWeeklyLossPercent),
        primaryMarkets: selectedMarkets,
        executionStyle,
        defaultRiskReward: '1:2',
        maxDailyTradesCount: Number(maxDailyTradesCount),
        maxTradeRiskPercent: Number(maxTradeSizePercent),
        loadSampleLedger: mode === 'load_sample'
      });
    }

    if (onSaveLimits) {
      onSaveLimits(updated);
    }

    if (mode === 'clear_zero') {
      onSetTrades?.([]);
    } else if (mode === 'load_sample') {
      onSetTrades?.(sampleTrades);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-sans font-bold text-slate-100 flex items-center gap-2">
                Initialize Account Parameters
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  Institutional Setup
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Configure your starting capital, drawdown limits, and multi-asset market focus.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* 1. Starting Capital */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Starting Capital / Prop Account Size ($)
              </label>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                ${startingBalance.toLocaleString()}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[10000, 25000, 50000, 100000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStartingBalance(val)}
                  className={`py-2 px-3 rounded-lg border font-mono text-xs transition ${
                    startingBalance === val
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  ${val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>

            <input
              type="number"
              min="100"
              max="10000000"
              step="1000"
              value={startingBalance}
              onChange={e => setStartingBalance(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono focus:border-indigo-500 outline-none"
              placeholder="Or enter custom capital..."
            />
          </div>

          {/* 2. Risk & Loss Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
            {/* Daily Loss % */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Max Daily Loss Cap (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="15"
                  step="0.5"
                  value={maxDailyLossPercent}
                  onChange={e => setMaxDailyLossPercent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500 font-mono text-xs">%</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                Hard limit: ${(startingBalance * (maxDailyLossPercent / 100)).toFixed(0)}
              </span>
            </div>

            {/* Weekly Loss % */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Max Weekly Loss Cap (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="3"
                  max="25"
                  step="1"
                  value={maxWeeklyLossPercent}
                  onChange={e => setMaxWeeklyLossPercent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500 font-mono text-xs">%</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                Drawdown ceiling
              </span>
            </div>

            {/* Daily Trade Quota */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Max Trades / Day
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={maxDailyTradesCount}
                  onChange={e => setMaxDailyTradesCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500 font-mono text-xs">orders</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                Prevents overtrading
              </span>
            </div>
          </div>

          {/* 3. Execution Style & Sizing Rule */}
          <div className="pt-2 border-t border-slate-800/60 space-y-3">
            <label className="font-semibold text-slate-200 block">Execution Horizon & Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Scalping', 'Day Trading', 'Swing Trading'] as const).map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setExecutionStyle(style)}
                  className={`py-2 px-3 rounded-xl border text-xs font-sans font-medium transition ${
                    executionStyle === style
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Primary Trading Markets */}
          <div className="pt-2 border-t border-slate-800/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Primary Monitored Markets
              </label>
              <span className="text-[10px] font-mono text-slate-500">{selectedMarkets.length} selected</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MARKET_OPTIONS.map(opt => {
                const active = selectedMarkets.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleMarket(opt.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start justify-between transition ${
                      active
                        ? 'bg-indigo-950/30 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="block font-medium text-xs text-slate-200">{opt.name}</span>
                      <span className="text-[9px] font-mono text-slate-500">{opt.category}</span>
                    </div>
                    {active && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Ledger Reset Options */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-200 block text-xs">P&L Ledger State</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Currently: {tradesCount} trade {tradesCount === 1 ? 'execution' : 'executions'} in active ledger
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSave('clear_zero')}
                className="px-3 py-2 rounded-lg bg-rose-950/20 border border-rose-800/40 text-rose-300 hover:bg-rose-950/40 transition text-xs font-mono flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Initialize Clean Zero Ledger (0 Trades)
              </button>

              <button
                type="button"
                onClick={() => handleSave('load_sample')}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-slate-300 hover:text-white transition text-xs font-mono flex items-center gap-1.5"
              >
                Load Demo Ledger (8 Sample Trades)
              </button>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-mono transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSave('keep')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-semibold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save & Deploy Parameters
          </button>
        </div>

      </div>
    </div>
  );
};
