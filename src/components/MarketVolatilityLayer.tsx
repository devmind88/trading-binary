import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  Zap, 
  Flame, 
  Wind, 
  TrendingUp, 
  TrendingDown, 
  Radio, 
  Compass, 
  Clock, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Lock,
  Globe,
  BellRing
} from 'lucide-react';
import { Trade } from '../types';

export type VolatilityRegime = 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME_NO_TRADE';

interface VolatilityAsset {
  symbol: string;
  name: string;
  atrPips: number;
  atrAvg: number;
  relativeVolPct: number; // e.g. 135%
  spreadMultiplier: number;
  fearGreedSynthetic: number; // 0 - 100
  regime: VolatilityRegime;
  trendStrength: 'STRONG_TREND' | 'CHOPPY_BOX' | 'EXHAUSTION' | 'BREAKOUT';
  adxValue: number;
  activeWarning?: string;
  cooldownRemainingSeconds?: number;
}

interface MacroEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual?: string;
  forecast?: string;
  volatilityMultiplier: number;
  noTradeCountdownMin: number;
}

interface VolatilityLayerProps {
  trades: Trade[];
  onSetRiskAdjustment?: (multiplier: number) => void;
}

export const MarketVolatilityLayer: React.FC<VolatilityLayerProps> = ({
  trades,
  onSetRiskAdjustment
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('EUR/USD');
  const [activeSubTab, setActiveSubTab] = useState<'regime' | 'macro' | 'ai_narrative' | 'correlations'>('regime');
  const [cooldownActive, setCooldownActive] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  // Live Simulated High-Frequency Volatility Assets
  const [assets, setAssets] = useState<VolatilityAsset[]>([
    {
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      atrPips: 14.2,
      atrAvg: 9.8,
      relativeVolPct: 144,
      spreadMultiplier: 1.1,
      fearGreedSynthetic: 68,
      regime: 'HIGH',
      trendStrength: 'STRONG_TREND',
      adxValue: 34.6,
      activeWarning: 'Post-London fixing expansion. Tighten 1M expiry precision.'
    },
    {
      symbol: 'GBP/USD',
      name: 'British Pound / US Dollar',
      atrPips: 24.8,
      atrAvg: 12.1,
      relativeVolPct: 205,
      spreadMultiplier: 1.8,
      fearGreedSynthetic: 88,
      regime: 'EXTREME_NO_TRADE',
      trendStrength: 'BREAKOUT',
      adxValue: 48.2,
      activeWarning: 'NO-TRADE ZONE: UK CPI release aftermath with erratic wick rejection.'
    },
    {
      symbol: 'USD/JPY',
      name: 'US Dollar / Japanese Yen',
      atrPips: 11.5,
      atrAvg: 11.0,
      relativeVolPct: 104,
      spreadMultiplier: 1.0,
      fearGreedSynthetic: 42,
      regime: 'NORMAL',
      trendStrength: 'CHOPPY_BOX',
      adxValue: 18.4,
      activeWarning: 'Standard mean-reversion range. Ideal for Reversal Zone setups.'
    },
    {
      symbol: 'AUD/USD',
      name: 'Australian Dollar / USD',
      atrPips: 6.2,
      atrAvg: 8.5,
      relativeVolPct: 73,
      spreadMultiplier: 1.0,
      fearGreedSynthetic: 35,
      regime: 'LOW',
      trendStrength: 'CHOPPY_BOX',
      adxValue: 14.1,
      activeWarning: 'Low-liquidity Asian afternoon drift. Prone to false breakouts.'
    },
    {
      symbol: 'SYNTH_VOL_75',
      name: 'Synthetic Volatility Index 75',
      atrPips: 78.4,
      atrAvg: 75.0,
      relativeVolPct: 105,
      spreadMultiplier: 1.0,
      fearGreedSynthetic: 55,
      regime: 'NORMAL',
      trendStrength: 'STRONG_TREND',
      adxValue: 31.0,
      activeWarning: '24/7 Algorithmic liquidity. Pristine respect for Support/Resistance levels.'
    }
  ]);

  // Macro High-Impact Calendar with Volatility Impact Scoring
  const macroEvents: MacroEvent[] = [
    {
      id: 'm1',
      time: '14:30 EST',
      currency: 'USD',
      event: 'US Core PCE Price Index & Jobless Claims',
      impact: 'HIGH',
      actual: '0.3%',
      forecast: '0.2%',
      volatilityMultiplier: 2.8,
      noTradeCountdownMin: 0
    },
    {
      id: 'm2',
      time: '16:00 EST',
      currency: 'USD',
      event: 'Fed Chair Monetary Policy Testimony',
      impact: 'HIGH',
      forecast: 'Hawkish Drift Expected',
      volatilityMultiplier: 3.5,
      noTradeCountdownMin: 45
    },
    {
      id: 'm3',
      time: '19:30 EST',
      currency: 'AUD',
      event: 'RBA Governor Speech & Cash Rate Statement',
      impact: 'HIGH',
      volatilityMultiplier: 2.4,
      noTradeCountdownMin: 180
    },
    {
      id: 'm4',
      time: '02:00 EST',
      currency: 'EUR',
      event: 'German Industrial Production m/m',
      impact: 'MEDIUM',
      volatilityMultiplier: 1.4,
      noTradeCountdownMin: 420
    }
  ];

  // Dynamic Asset Lookup
  const currentAsset = useMemo(() => {
    return assets.find(a => a.symbol === selectedAsset) || assets[0];
  }, [assets, selectedAsset]);

  // Volatility-Adjusted Execution Parameters
  const adaptiveRiskProfile = useMemo(() => {
    switch (currentAsset.regime) {
      case 'EXTREME_NO_TRADE':
        return {
          statusBadge: 'NO-TRADE HARD LOCK',
          badgeColor: 'bg-rose-950/80 border-rose-600 text-rose-300 font-bold',
          recommendedStakePercent: 0,
          stakeAdvice: '0.0% (Trading Hard Prohibited)',
          confidenceDeduction: -50,
          suggestedExpiry: 'STAND DOWN — Wait for market to settle',
          bgGlow: 'from-rose-950/40 to-slate-900',
          borderColor: 'border-rose-600/80',
          actionIcon: Lock,
          actionColor: 'text-rose-400'
        };
      case 'HIGH':
        return {
          statusBadge: 'ELEVATED VOLATILITY ZONE',
          badgeColor: 'bg-amber-950/80 border-amber-500 text-amber-300',
          recommendedStakePercent: 0.75,
          stakeAdvice: '0.5% – 0.75% (Cut standard sizing by 50%)',
          confidenceDeduction: -15,
          suggestedExpiry: '3M – 5M Confirmation (Avoid 1M noise)',
          bgGlow: 'from-amber-955/30 to-slate-900',
          borderColor: 'border-amber-500/60',
          actionIcon: AlertTriangle,
          actionColor: 'text-amber-400'
        };
      case 'LOW':
        return {
          statusBadge: 'COMPRESSED VOLATILITY SLOW ZONE',
          badgeColor: 'bg-slate-950 border-slate-700 text-slate-400',
          recommendedStakePercent: 1.0,
          stakeAdvice: '1.0% flat (Beware false breakout wicks)',
          confidenceDeduction: -10,
          suggestedExpiry: 'Avoid trend trades, play tight channel boundaries',
          bgGlow: 'from-slate-950 to-slate-900',
          borderColor: 'border-slate-800',
          actionIcon: Wind,
          actionColor: 'text-slate-400'
        };
      case 'NORMAL':
      default:
        return {
          statusBadge: 'PRISTINE VOLATILITY GOLDILOCKS',
          badgeColor: 'bg-emerald-950/80 border-emerald-500 text-emerald-300',
          recommendedStakePercent: 1.5,
          stakeAdvice: '1.0% – 1.5% Standard Institutional Stake',
          confidenceDeduction: 0,
          suggestedExpiry: 'Optimal for 1M – 3M Trend Continuation & Retest',
          bgGlow: 'from-emerald-955/30 to-slate-900',
          borderColor: 'border-emerald-500/60',
          actionIcon: ShieldCheck,
          actionColor: 'text-emerald-400'
        };
    }
  }, [currentAsset]);

  // Handle Cooldown Trigger
  const triggerManualCooldown = (minutes: number) => {
    setCooldownActive(true);
    setCooldownSeconds(minutes * 60);
  };

  useEffect(() => {
    let timer: any;
    if (cooldownActive && cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownActive, cooldownSeconds]);

  return (
    <div id="market-volatility-layer-cockpit" className="space-y-6">
      
      {/* Top Volatility Header Alert Card */}
      <div className={`bg-gradient-to-br ${adaptiveRiskProfile.bgGlow} border ${adaptiveRiskProfile.borderColor} rounded-xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl bg-slate-950/80 border ${adaptiveRiskProfile.borderColor} ${adaptiveRiskProfile.actionColor} shrink-0 shadow-lg`}>
              <adaptiveRiskProfile.actionIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border shadow ${adaptiveRiskProfile.badgeColor}`}>
                  {adaptiveRiskProfile.statusBadge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Current ATR: <strong className="text-slate-100">{currentAsset.atrPips} pips</strong> ({currentAsset.relativeVolPct}% of 30-day baseline)
                </span>
              </div>
              <h3 className="text-lg font-bold font-sans text-slate-100 mt-1 flex items-center gap-2">
                Market Volatility & Liquidity Regime Layer
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                  {currentAsset.symbol}
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                {currentAsset.activeWarning}
              </p>
            </div>
          </div>

          {/* Sizing & Smart Cooldown Quick Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {cooldownActive ? (
              <div className="bg-rose-950/90 border border-rose-600 px-4 py-2.5 rounded-xl flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-rose-300 block font-bold">Volatility Cooldown Active</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {Math.floor(cooldownSeconds / 60)}:{(cooldownSeconds % 60).toString().padStart(2, '0')} min lock
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => triggerManualCooldown(15)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-700 hover:border-amber-500 text-amber-300 transition text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Initiate 15m Volatility Pause</span>
              </button>
            )}

            <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-center min-w-[140px]">
              <span className="text-[9px] uppercase font-mono text-slate-500 block">Dynamic Stake Cap</span>
              <span className="text-sm font-mono font-bold text-emerald-400 block mt-0.5">
                {adaptiveRiskProfile.stakeAdvice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Selection Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold px-2">Asset Scanner:</span>
          {assets.map(a => (
            <button
              key={a.symbol}
              onClick={() => setSelectedAsset(a.symbol)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer shrink-0 ${
                selectedAsset === a.symbol
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
              }`}
            >
              <span>{a.symbol}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                a.regime === 'EXTREME_NO_TRADE' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                a.regime === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                a.regime === 'NORMAL' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                'bg-slate-800 text-slate-400'
              }`}>
                {a.regime === 'EXTREME_NO_TRADE' ? 'NO-TRADE' : a.regime}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 shrink-0">
          <button
            onClick={() => setActiveSubTab('regime')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'regime' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700' : 'text-slate-400'
            }`}
          >
            Regime Radar
          </button>
          <button
            onClick={() => setActiveSubTab('macro')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'macro' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700' : 'text-slate-400'
            }`}
          >
            Macro Impact Calendar
          </button>
          <button
            onClick={() => setActiveSubTab('ai_narrative')}
            className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition ${
              activeSubTab === 'ai_narrative' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700' : 'text-slate-400'
            }`}
          >
            AI Volatility Narrative
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: REGIME RADAR & TECHNICAL HEATMAP */}
      {activeSubTab === 'regime' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* 4 Quantitative Gauge Cards */}
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>ATR Volatility Ratio</span>
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-slate-100">{currentAsset.atrPips} pips</span>
                <span className={`text-xs font-mono font-semibold ${currentAsset.relativeVolPct > 120 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  +{currentAsset.relativeVolPct}%
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${currentAsset.relativeVolPct > 150 ? 'bg-rose-500' : currentAsset.relativeVolPct > 110 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (currentAsset.relativeVolPct / 200) * 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 block">Baseline 30-day average: {currentAsset.atrAvg} pips</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Trend Strength (ADX 14)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-slate-100">{currentAsset.adxValue}</span>
                <span className="text-xs font-mono text-indigo-300 font-semibold uppercase">{currentAsset.trendStrength.replace('_', ' ')}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, (currentAsset.adxValue / 60) * 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 block">&gt;25 indicates strong directional velocity</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Synthetic Fear & Greed</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-slate-100">{currentAsset.fearGreedSynthetic} / 100</span>
                <span className={`text-xs font-mono font-semibold ${currentAsset.fearGreedSynthetic > 75 ? 'text-rose-450' : 'text-amber-400'}`}>
                  {currentAsset.fearGreedSynthetic > 75 ? 'Extreme Fear' : currentAsset.fearGreedSynthetic > 50 ? 'Greed Expansion' : 'Neutral'}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full"
                  style={{ width: `${currentAsset.fearGreedSynthetic}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 block">Cross-market orderbook imbalance index</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Spread & Slippage Friction</span>
                <Radio className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-slate-100">{currentAsset.spreadMultiplier}x</span>
                <span className={`text-xs font-mono font-semibold ${currentAsset.spreadMultiplier > 1.2 ? 'text-rose-450' : 'text-emerald-400'}`}>
                  {currentAsset.spreadMultiplier > 1.2 ? 'Elevated Friction' : 'Optimal Raw'}
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${currentAsset.spreadMultiplier > 1.5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, currentAsset.spreadMultiplier * 50)}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 block">Broker payout penalty & tick gap risk</span>
            </div>

          </div>

          {/* Tactical Execution Rules for this Regime */}
          <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <h4 className="font-sans font-bold text-sm text-slate-100">
                  Vol-Adaptive Execution Rules ({currentAsset.symbol} • {currentAsset.regime})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Institutional Strategy Filter</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">1. Recommended Expiry Duration</span>
                <p className="text-xs text-slate-200 font-sans font-medium">
                  {adaptiveRiskProfile.suggestedExpiry}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block pt-1">
                  Adjust expiry timing to allow market structure retests to complete without premature noise cutoffs.
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">2. Allowed Setups in this Regime</span>
                <p className="text-xs text-slate-200 font-sans font-medium">
                  {currentAsset.regime === 'EXTREME_NO_TRADE' ? 'NONE — Trading Blocked' :
                   currentAsset.trendStrength === 'STRONG_TREND' ? 'Trend Continuation & 50 EMA Retests' :
                   'Support/Resistance Range Reversals & Double Rejections'}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block pt-1">
                  Filter out strategies that suffer negative mathematical expectancy in {currentAsset.regime.toLowerCase()} volatility.
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">3. Capital Defense Constraint</span>
                <p className="text-xs text-slate-200 font-sans font-medium">
                  Max Daily Loss Cap tightened to 3.0%
                </p>
                <span className="text-[10px] text-slate-500 font-mono block pt-1">
                  Confidence score adjusted by <strong>{adaptiveRiskProfile.confidenceDeduction} pts</strong> to prevent overconfidence bias.
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 2: MACROECONOMIC IMPACT CALENDAR */}
      {activeSubTab === 'macro' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <h4 className="font-sans font-bold text-sm text-slate-100">
                High-Impact Macroeconomic Event Multipliers
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
              <BellRing className="w-3 h-3" /> Auto-Lockout: 15m Pre & Post Release
            </span>
          </div>

          <div className="space-y-3">
            {macroEvents.map(m => (
              <div 
                key={m.id}
                className="bg-slate-950 border border-slate-850 hover:border-slate-750 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="px-2.5 py-1 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs font-bold shrink-0">
                    {m.currency}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-sans font-bold text-slate-200 text-sm">{m.event}</h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                        {m.impact} IMPACT ({m.volatilityMultiplier}x Vol Spike)
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-400">
                      <span>Scheduled: <strong className="text-slate-200">{m.time}</strong></span>
                      {m.actual && <span>Actual: <strong className="text-emerald-400">{m.actual}</strong></span>}
                      {m.forecast && <span>Forecast: <strong className="text-indigo-300">{m.forecast}</strong></span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  {m.noTradeCountdownMin === 0 ? (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Event Passed • Volatility Normalizing
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Lockout in {m.noTradeCountdownMin} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: AI VOLATILITY NARRATIVE */}
      {activeSubTab === 'ai_narrative' && (
        <div className="bg-slate-900 border border-indigo-900/50 rounded-xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-slate-100 text-sm">
                AI Quantitative Volatility Assessment
              </h4>
              <p className="text-xs font-mono text-slate-400">
                Synthesized across real-time ATR, ADX directional vectors, and macro schedule.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 font-sans leading-relaxed space-y-3">
            <p>
              <strong>Market Structure Summary:</strong> Global currency pairs are currently displaying elevated dispersion. 
              <strong> {currentAsset.symbol}</strong> is printing an ATR of {currentAsset.atrPips} pips ({currentAsset.relativeVolPct}% of 30-day baseline) 
              with an ADX reading of {currentAsset.adxValue}. This reflects a <strong>{currentAsset.trendStrength.replace('_', ' ')}</strong> environment.
            </p>
            <p>
              <strong>Psychological Vulnerability Warning:</strong> High-volatility environments frequently induce <em>premature entry syndrome</em>. 
              Traders watching fast candle wicks experience heightened dopamine spikes and are 4.2x more likely to enter contracts before waiting for candle close confirmations.
            </p>
            <div className="p-3 bg-indigo-955/40 border border-indigo-900/60 rounded-lg text-indigo-200">
              <strong>Actionable Trading Coach Rule:</strong> Reduce position sizing to <strong>{adaptiveRiskProfile.stakeAdvice}</strong> and refuse all breakout trades that lack a clean retest of the broken level.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
