import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Sparkles, 
  Brain, 
  Heart, 
  ShieldAlert, 
  Award, 
  Sliders, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Flame,
  BarChart2,
  FileText
} from 'lucide-react';
import { StrategyId, TradingSession } from '../types';
import { approvedStrategies } from '../data';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ReplayTradeDecision {
  id: string;
  candleIndex: number;
  timestamp: string;
  type: 'CALL' | 'PUT';
  entryPrice: number;
  expiryCandleIndex: number;
  exitPrice?: number;
  amount: number;
  result?: 'WIN' | 'LOSS';
  pnl?: number;
  strategyId: StrategyId;
  emotionalState: 'Calm & Zen' | 'FOMO Rush' | 'Hesitation' | 'Revenge Tilt';
  note: string;
}

export const InstitutionalReplayEngine: React.FC = () => {
  // Pre-loaded realistic historical session candle data (50 M1 candles with clear trend, breakout, retest, and reversal)
  const initialCandles: Candle[] = useMemo(() => {
    let base = 1.0850;
    const candles: Candle[] = [];
    const times = [
      '09:30', '09:31', '09:32', '09:33', '09:34', '09:35', '09:36', '09:37', '09:38', '09:39',
      '09:40', '09:41', '09:42', '09:43', '09:44', '09:45', '09:46', '09:47', '09:48', '09:49',
      '09:50', '09:51', '09:52', '09:53', '09:54', '09:55', '09:56', '09:57', '09:58', '09:59',
      '10:00', '10:01', '10:02', '10:03', '10:04', '10:05', '10:06', '10:07', '10:08', '10:09',
      '10:10', '10:11', '10:12', '10:13', '10:14', '10:15', '10:16', '10:17', '10:18', '10:19'
    ];

    // Seeded structural price movements: Morning Open Dip -> Breakout Retest -> Trend continuation -> Reversal Top
    const deltas = [
      -0.0003, -0.0004, -0.0002, 0.0001, 0.0002, 0.0005, 0.0007, 0.0009, 0.0004, -0.0002,
      -0.0003, 0.0006, 0.0008, 0.0010, 0.0005, 0.0007, 0.0006, 0.0002, -0.0001, 0.0004,
      0.0008, 0.0005, -0.0003, -0.0004, 0.0002, 0.0006, 0.0008, 0.0009, 0.0003, -0.0002,
      -0.0006, -0.0008, -0.0005, 0.0001, -0.0004, -0.0007, -0.0005, -0.0003, 0.0002, -0.0004,
      -0.0005, 0.0001, 0.0003, -0.0002, -0.0004, -0.0006, -0.0003, 0.0001, -0.0002, 0.0004
    ];

    times.forEach((t, i) => {
      const delta = deltas[i] || 0.0001;
      const open = base;
      const close = parseFloat((open + delta).toFixed(5));
      const high = parseFloat((Math.max(open, close) + 0.0002).toFixed(5));
      const low = parseFloat((Math.min(open, close) - 0.0002).toFixed(5));
      const volume = Math.floor(150 + Math.random() * 300);
      candles.push({ time: t, open, high, low, close, volume });
      base = close;
    });

    return candles;
  }, []);

  // Replay Player State
  const [currentStep, setCurrentStep] = useState<number>(10); // Start showing first 10 candles
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // 1 sec per candle
  const [simSlippagePips, setSimSlippagePips] = useState<number>(0.2);
  const [simPayout, setSimPayout] = useState<number>(85);

  // Active Trade Execution Inputs inside Replay
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyId>('trend_continuation');
  const [replayStake, setReplayStake] = useState<number>(20);
  const [expiryCandlesCount, setExpiryCandlesCount] = useState<number>(3); // 3-candle expiry
  const [selectedEmotion, setSelectedEmotion] = useState<'Calm & Zen' | 'FOMO Rush' | 'Hesitation' | 'Revenge Tilt'>('Calm & Zen');
  const [tradeNote, setTradeNote] = useState<string>('');

  // Recorded Replay Trades
  const [executedReplayTrades, setExecutedReplayTrades] = useState<ReplayTradeDecision[]>([]);

  // Timer for Step Playback
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= initialCandles.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, initialCandles.length]);

  // Evaluate Pending Trades at Current Step
  useEffect(() => {
    setExecutedReplayTrades(prev => {
      return prev.map(trade => {
        if (!trade.result && currentStep >= trade.expiryCandleIndex) {
          const exitCandle = initialCandles[trade.expiryCandleIndex];
          if (exitCandle) {
            const exitPrice = exitCandle.close;
            let isWin = false;
            if (trade.type === 'CALL') {
              isWin = exitPrice > trade.entryPrice;
            } else {
              isWin = exitPrice < trade.entryPrice;
            }

            const pnl = isWin ? parseFloat((trade.amount * (simPayout / 100)).toFixed(2)) : -trade.amount;
            return {
              ...trade,
              exitPrice,
              result: isWin ? 'WIN' : 'LOSS',
              pnl
            };
          }
        }
        return trade;
      });
    });
  }, [currentStep, initialCandles, simPayout]);

  // Handle Placing a Replay Trade
  const handleExecuteReplayTrade = (type: 'CALL' | 'PUT') => {
    const currentCandle = initialCandles[currentStep];
    if (!currentCandle) return;

    // Apply simulated slippage
    const slippageDelta = (simSlippagePips / 10000) * (type === 'CALL' ? 1 : -1);
    const actualEntry = parseFloat((currentCandle.close + slippageDelta).toFixed(5));

    const newTrade: ReplayTradeDecision = {
      id: 'rep_' + Date.now(),
      candleIndex: currentStep,
      timestamp: currentCandle.time,
      type,
      entryPrice: actualEntry,
      expiryCandleIndex: currentStep + expiryCandlesCount,
      amount: replayStake,
      strategyId: selectedStrategy,
      emotionalState: selectedEmotion,
      note: tradeNote || `${type} execution based on ${selectedStrategy}`
    };

    setExecutedReplayTrades(prev => [...prev, newTrade]);
    setTradeNote('');
  };

  // Aggregated Replay Statistics
  const replayStats = useMemo(() => {
    const closed = executedReplayTrades.filter(t => t.result !== undefined);
    const wins = closed.filter(t => t.result === 'WIN').length;
    const losses = closed.filter(t => t.result === 'LOSS').length;
    const totalPnl = closed.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const winRate = closed.length > 0 ? Math.round((wins / closed.length) * 100) : 0;

    // Emotional Breakdown
    const calmTrades = closed.filter(t => t.emotionalState === 'Calm & Zen');
    const calmWins = calmTrades.filter(t => t.result === 'WIN').length;
    const calmWr = calmTrades.length > 0 ? Math.round((calmWins / calmTrades.length) * 100) : 0;

    const emotionalTrades = closed.filter(t => t.emotionalState !== 'Calm & Zen');
    const emoWins = emotionalTrades.filter(t => t.result === 'WIN').length;
    const emoWr = emotionalTrades.length > 0 ? Math.round((emoWins / emotionalTrades.length) * 100) : 0;

    return {
      totalExecuted: executedReplayTrades.length,
      closedCount: closed.length,
      wins,
      losses,
      winRate,
      totalPnl: parseFloat(totalPnl.toFixed(2)),
      calmWr,
      calmCount: calmTrades.length,
      emoWr,
      emoCount: emotionalTrades.length
    };
  }, [executedReplayTrades]);

  const visibleCandles = initialCandles.slice(0, currentStep + 1);
  const currentPrice = initialCandles[currentStep]?.close || 1.0850;

  return (
    <div id="institutional-replay-engine" className="space-y-6">
      
      {/* Replay Header & Controller */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shrink-0">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-slate-100 text-base">
                  Institutional Historical Candle Replay Simulator
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold">
                  Tick-by-Tick M1
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Practice tape reading, test strategies, and audit emotional trigger reactions in risk-free historical conditions.
              </p>
            </div>
          </div>

          {/* Player Transport Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer shadow ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause Replay' : 'Play Simulation'}</span>
            </button>

            <button
              onClick={() => {
                if (currentStep < initialCandles.length - 1) {
                  setCurrentStep(prev => prev + 1);
                }
              }}
              disabled={isPlaying || currentStep >= initialCandles.length - 1}
              className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-50 text-slate-200 text-xs font-mono rounded-xl transition cursor-pointer"
              title="Advance 1 Candle Forward"
            >
              +1 Step
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(10);
                setExecutedReplayTrades([]);
              }}
              className="p-2 bg-slate-950 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
              title="Reset Replay Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speed & Slippage Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Playback Speed:</span>
            <button 
              onClick={() => setPlaybackSpeed(1500)}
              className={`px-2 py-1 rounded border ${playbackSpeed === 1500 ? 'bg-indigo-950 text-indigo-300 border-indigo-700' : 'bg-slate-950 border-slate-850'}`}
            >
              0.5x
            </button>
            <button 
              onClick={() => setPlaybackSpeed(1000)}
              className={`px-2 py-1 rounded border ${playbackSpeed === 1000 ? 'bg-indigo-950 text-indigo-300 border-indigo-700' : 'bg-slate-950 border-slate-850'}`}
            >
              1.0x (Realtime)
            </button>
            <button 
              onClick={() => setPlaybackSpeed(400)}
              className={`px-2 py-1 rounded border ${playbackSpeed === 400 ? 'bg-indigo-950 text-indigo-300 border-indigo-700' : 'bg-slate-950 border-slate-850'}`}
            >
              2.5x (Fast)
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Slippage:</span>
              <span className="text-slate-200 font-bold">{simSlippagePips} pips</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Sim Payout:</span>
              <span className="text-emerald-400 font-bold">{simPayout}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Candle:</span>
              <span className="text-indigo-400 font-bold">{currentStep + 1} / {initialCandles.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Candlestick Display & Execution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left SVG Candlestick Stage (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-100">EUR/USD 1-Minute Playback</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">${currentPrice.toFixed(5)}</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Timestamp: {initialCandles[currentStep]?.time || '09:30'} EST
            </span>
          </div>

          {/* Candlestick Canvas SVG */}
          <div className="h-64 w-full bg-slate-950 rounded-xl border border-slate-850 p-4 relative overflow-hidden flex flex-col justify-end">
            
            {/* Price lines / Grid */}
            <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
              <div className="border-b border-slate-700 w-full"></div>
              <div className="border-b border-slate-700 w-full"></div>
              <div className="border-b border-slate-700 w-full"></div>
              <div className="border-b border-slate-700 w-full"></div>
            </div>

            {/* Render Candlesticks */}
            <div className="w-full h-full flex items-end justify-start gap-1 relative z-10">
              {visibleCandles.map((c, idx) => {
                const isGreen = c.close >= c.open;
                // Calculate relative heights inside 0.0030 window
                const minPrice = 1.0830;
                const maxPrice = 1.0880;
                const range = maxPrice - minPrice;

                const bottomPercent = Math.max(5, Math.min(95, ((Math.min(c.open, c.close) - minPrice) / range) * 100));
                const bodyHeightPercent = Math.max(3, Math.min(90, (Math.abs(c.close - c.open) / range) * 100));
                const wickBottomPercent = Math.max(2, Math.min(95, ((c.low - minPrice) / range) * 100));
                const wickHeightPercent = Math.max(5, Math.min(95, ((c.high - c.low) / range) * 100));

                // Check if trade was placed on this candle
                const placedTrade = executedReplayTrades.find(t => t.candleIndex === idx);

                return (
                  <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center relative group min-w-[6px]">
                    
                    {/* Trade Marker Pin */}
                    {placedTrade && (
                      <div 
                        className={`absolute -top-3 z-30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                          placedTrade.type === 'CALL' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {placedTrade.type}
                      </div>
                    )}

                    {/* High/Low Wick */}
                    <div 
                      className={`w-[1px] absolute ${isGreen ? 'bg-emerald-400' : 'bg-rose-450'}`}
                      style={{
                        bottom: `${wickBottomPercent}%`,
                        height: `${wickHeightPercent}%`
                      }}
                    ></div>

                    {/* Open/Close Body */}
                    <div 
                      className={`w-full max-w-[10px] rounded-[1px] absolute ${isGreen ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{
                        bottom: `${bottomPercent}%`,
                        height: `${bodyHeightPercent}%`
                      }}
                    ></div>

                  </div>
                );
              })}
            </div>

            {/* Current Tick Price Tag Line */}
            <div className="absolute right-2 top-2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-slate-200">
              Live Ask: <strong className="text-emerald-400">${(currentPrice + (simSlippagePips/10000)).toFixed(5)}</strong>
            </div>

          </div>

          {/* Execution Control Form */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Strategy Setup:</label>
                <select
                  value={selectedStrategy}
                  onChange={e => setSelectedStrategy(e.target.value as StrategyId)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs font-mono"
                >
                  {approvedStrategies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Contract Stake ($):</label>
                <input
                  type="number"
                  value={replayStake}
                  onChange={e => setReplayStake(Math.max(5, Number(e.target.value)))}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block">Expiry Duration:</label>
                <select
                  value={expiryCandlesCount}
                  onChange={e => setExpiryCandlesCount(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs font-mono"
                >
                  <option value={1}>1 Candle (1M Expiry)</option>
                  <option value={3}>3 Candles (3M Expiry)</option>
                  <option value={5}>5 Candles (5M Expiry)</option>
                </select>
              </div>
            </div>

            {/* Emotional Reaction Tagging (Cognitive Performance Integration) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-purple-400" />
                <span>Record Active Emotional Mindset on Entry:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Calm & Zen', 'FOMO Rush', 'Hesitation', 'Revenge Tilt'] as const).map(emo => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => setSelectedEmotion(emo)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono transition cursor-pointer ${
                      selectedEmotion === emo 
                        ? emo === 'Calm & Zen' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold' :
                          emo === 'Revenge Tilt' ? 'bg-rose-950 text-rose-300 border border-rose-700 font-bold' :
                          'bg-amber-950 text-amber-300 border border-amber-700 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            {/* CALL / PUT Action Triggers */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <button
                onClick={() => handleExecuteReplayTrade('CALL')}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <TrendingUp className="w-4 h-4" />
                <span>BUY HIGHER (CALL)</span>
              </button>

              <button
                onClick={() => handleExecuteReplayTrade('PUT')}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
              >
                <TrendingDown className="w-4 h-4" />
                <span>BUY LOWER (PUT)</span>
              </button>
            </div>

          </div>

        </div>

        {/* Right Replay Performance & Emotional Audit (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Executive Stats Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>REPLAY SESSION SCORECARD</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{replayStats.closedCount} Closed</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Win Rate</span>
                <span className={`text-lg font-mono font-bold ${replayStats.winRate >= 60 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {replayStats.winRate}% ({replayStats.wins}W - {replayStats.losses}L)
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Net Replay P&L</span>
                <span className={`text-lg font-mono font-bold ${replayStats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                  {replayStats.totalPnl >= 0 ? '+' : ''}${replayStats.totalPnl}
                </span>
              </div>
            </div>

            {/* Calm vs Emotional Contrast */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-emerald-400">Calm & Zen Trades ({replayStats.calmCount}):</span>
                <strong className="text-emerald-300">{replayStats.calmWr}% WR</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-400">Emotional / FOMO ({replayStats.emoCount}):</span>
                <strong className="text-rose-300">{replayStats.emoWr}% WR</strong>
              </div>
            </div>
          </div>

          {/* Executed Replay Audit Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
              Session Decision Log
            </span>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {executedReplayTrades.length === 0 ? (
                <p className="text-xs font-sans text-slate-500 text-center py-6">
                  No trades placed yet. Advance candles or press Play to execute.
                </p>
              ) : (
                executedReplayTrades.map((t, idx) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={`font-bold ${t.type === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        #{idx + 1} {t.type} @ ${t.entryPrice}
                      </span>
                      {t.result ? (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.result === 'WIN' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {t.result} ({t.pnl && t.pnl > 0 ? `+$${t.pnl}` : `-$${t.amount}`})
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 animate-pulse">Running ({t.expiryCandleIndex - currentStep}c left)</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{t.strategyId}</span>
                      <span className={`italic ${t.emotionalState === 'Calm & Zen' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.emotionalState}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
