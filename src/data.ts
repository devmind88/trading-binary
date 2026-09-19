import { StrategyDefinition, Trade, ChecklistItem } from './types';

export const approvedStrategies: StrategyDefinition[] = [
  {
    id: 'trend_continuation',
    name: 'Trend Continuation',
    description: 'Entering trades in the direction of the strong established trend on a pullback/retest of short-term moving averages or local structure.',
    strengths: [
      'High win rates during prolonged trending sessions.',
      'Aligns with market momentum, reducing the risk of premature reversals.',
      'Clear entry and invalidation triggers.'
    ],
    weaknesses: [
      'Fails severely in choppy, sideways ranging markets.',
      'Prone to false breakout/continuation traps near major daily levels.'
    ],
    marketConditionsBest: 'Strongly trending markets, high volume pre-market or major session overlaps (London/New York).',
    marketConditionsWorst: 'Sideways consolidation, low-volume mid-day lulls, or immediately prior to major macroeconomic news releases.',
    behavioralMistakes: [
      'Chasing the trend and entering too late after the move has already exhausted.',
      'Failing to verify the timeline/timeframe alignment (e.g., trading against the 15-minute trend on a 1-minute chart).'
    ],
    refinementSuggestions: [
      'Add a multi-timeframe filter: Only take 1-minute Trend Continuation trades if the 5-minute is matching the trend.',
      'Use a dynamic moving average (e.g., 20 EMA) as a soft support/resistance guide. Never enter unless price is close to the EMA.'
    ]
  },
  {
    id: 'reversal_zones',
    name: 'Reversal Zones',
    description: 'Identifying major macro support and resistance lines or supply/demand blocks on higher timeframes and hunting for depletion signals to trade a rebound.',
    strengths: [
      'Extremely high payout potential if caught at precise structural extremes.',
      'Clear definition of supply and demand areas.'
    ],
    weaknesses: [
      'Trying to catch a falling knife in a parabolic market.',
      'Can result in consecutive quick losses during dynamic breakout sessions.'
    ],
    marketConditionsBest: 'Ranging or sideways markets with clean, respected horizontal boundaries.',
    marketConditionsWorst: 'Parabolic, fast-moving news-driven trends where previous containment levels are ignored.',
    behavioralMistakes: [
      'Entering too early without waiting for a clear exhaustion candlestick (pin bar, engulfing) to establish.',
      'Preempting the level rather than letting the structure manifest.'
    ],
    refinementSuggestions: [
      'Incorporate an oscillator like RSI or Stochastic to verify overbought/oversold exhaustion at the structural level.',
      'Ensure the level was tested and respected at least 2 times before trading the 3rd touch.'
    ]
  },
  {
    id: 'break_and_retest',
    name: 'Break-and-Retest',
    description: 'Trading the transition of supply-to-demand or vice-versa. After price cleanly breaks a validated level, waiting for a pullback to re-test it as new support/resistance.',
    strengths: [
      'Highly logical price action setup.',
      'Combines structural breakout clarity with a safe pullback entry.'
    ],
    weaknesses: [
      'Fake-outs where price returns inside the range and triggers immediate loss.',
      'Sometimes the retest never comes, leading to missed trades.'
    ],
    marketConditionsBest: 'Markets transitioning out of ranges into fresh expansion phases, showing clear and high-volume breakout candles.',
    marketConditionsWorst: 'Low-liquidity sessions where there is no follow-through on breakouts.',
    behavioralMistakes: [
      'Entering on the breakout candle itself rather than showing discipline and waiting for the retest.',
      'Confusing a deep retracement that breaks the level back with a healthy shallow retest.'
    ],
    refinementSuggestions: [
      'Check volume on the breakout: Volume should be significantly higher on the break and lower on the retest.',
      'Wait for a rejection wick on the retest candle before clicking buy/sell.'
    ]
  },
  {
    id: 'candlestick_patterns',
    name: 'High-Probability Candlestick Patterns',
    description: 'Pure price action trading focused on specific high-conviction formations such as pin bars (tweezers), engulfing candles, inside-bar breakouts, or morning/evening star configurations.',
    strengths: [
      'Extremely visual, highly objective, and adaptable across all pairs.',
      'Allows rapid mental calculation and alignment.'
    ],
    weaknesses: [
      'Patterns occurring in the middle of nowhere hold no statistical edge.',
      'Prone to subjective interpretation if the trader is desperate for an entry.'
    ],
    marketConditionsBest: 'Any market with clean liquidity and candles that respect pure open-close-high-low levels, avoiding highly volatile index spikes.',
    marketConditionsWorst: 'Doji-heavy, low-volume, or highly manipulated pairs where wicks are purely algorithmic noise.',
    behavioralMistakes: [
      'Trading patterns in isolation without confirming they are situated at a key structural level (horizontal or trendline).',
      'Ignoring wick-to-body ratios.'
    ],
    refinementSuggestions: [
      'Only accept candlestick patterns if they form in alignment with a key support/resistance level or a major feedback zone.',
      'Create a physical or digital cheat sheet of approved candle proportions and stick it to your secondary monitor.'
    ]
  }
];

export const defaultEntryChecklist: ChecklistItem[] = [
  { id: 'ec1', text: 'Trend confirmation across multi-timeframe structures', checked: false },
  { id: 'ec2', text: 'Key level validation (Order block, liquidity pool, support/resistance)', checked: false },
  { id: 'ec3', text: 'Approved execution trigger present', checked: false },
  { id: 'ec4', text: 'High-impact macro news clearance (30m buffer)', checked: false },
  { id: 'ec5', text: 'Cognitive state confirmation (Calm, structured, non-reactive)', checked: false }
];

export const defaultBeforeRoutine: ChecklistItem[] = [
  { id: 'br1', text: 'Review yesterday’s trades & identify any rule/strategy slip-ups', checked: false },
  { id: 'br2', text: 'Check economic calendar for high-impact releases (CPI, Fed/FOMC, NFP)', checked: false },
  { id: 'br3', text: 'Identify and mark major structural levels on target markets (Futures/Forex/Equities)', checked: false },
  { id: 'br4', text: 'Define maximum daily risk budget (3-5% hard cap)', checked: false },
  { id: 'br5', text: 'Set standard position sizing (1-2% of current account balance)', checked: false },
  { id: 'br6', text: 'Verify hardware, internet connection, and confirm calm, structured breathing', checked: false }
];

export const defaultDuringRoutine: ChecklistItem[] = [
  { id: 'dr1', text: 'Enforce entry checklist strictly. No checks skipped, no trades executed.', checked: false },
  { id: 'dr2', text: 'Log every trade execution immediately with strategy tag and rationale.', checked: false },
  { id: 'dr3', text: 'Stop trading immediately if 3 consecutive losses occur (Lockout rule).', checked: false },
  { id: 'dr4', text: 'Take a stand-up or stretch break after every 3 trades to clear the mind.', checked: false }
];

export const defaultAfterRoutine: ChecklistItem[] = [
  { id: 'ar1', text: 'Fill out PnL Calendar with final wins, losses, and net balance.', checked: false },
  { id: 'ar2', text: 'Review charts of today’s entries to verify matching structural edge.', checked: false },
  { id: 'ar3', text: 'Identify any emotional impulses or rushing mistakes.', checked: false },
  { id: 'ar4', text: 'Document improvements in the strategy performance tracker notes.', checked: false }
];

export const psychologyReminders = [
  'Accept the outcome. Once you take a trade, you have relinquished control to the market.',
  'Your job is not to win every single trade; your job is to execute your system with mathematical precision.',
  'Losses are the operating expenses of a professional trading business. Do not take them personally.',
  'Revenge trading is a fast-track to bankruptcy. Stop, breathe, and step away from the monitors.',
  'The markets will always be there tomorrow. Your capital, if blown, will not.',
  'Discipline is doing what needs to be done, even when you do not feel like doing it.'
];

export const sampleTrades: Trade[] = [
  {
    id: 't1',
    date: '2026-05-25',
    time: '08:15',
    strategyId: 'trend_continuation',
    type: 'LONG',
    amount: 100,
    result: 'WIN',
    payoutRate: 150,
    targetRr: '1:1.5',
    holdingHorizon: '15m',
    market: 'NQ Futures',
    pnl: 150,
    session: 'Morning',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Clean entry off 20 EMA pullback in NQ Futures strong uptrend. Followed checklist.'
  },
  {
    id: 't2',
    date: '2026-05-25',
    time: '08:45',
    strategyId: 'trend_continuation',
    type: 'LONG',
    amount: 100,
    result: 'WIN',
    payoutRate: 200,
    targetRr: '1:2',
    holdingHorizon: '15m',
    market: 'ES Futures',
    pnl: 200,
    session: 'Morning',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Second pullback successful at key liquidity pool. Solid momentum.'
  },
  {
    id: 't3',
    date: '2026-05-26',
    time: '12:30',
    strategyId: 'reversal_zones',
    type: 'SHORT',
    amount: 100,
    result: 'LOSS',
    pnl: -100,
    payoutRate: 150,
    targetRr: '1:1.5',
    holdingHorizon: '30m',
    market: 'EUR/USD',
    session: 'Midday',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'EUR/USD major resistance breakout. Traded rejection but price broke and held above order block.'
  },
  {
    id: 't4',
    date: '2026-05-26',
    time: '13:02',
    strategyId: 'reversal_zones',
    type: 'SHORT',
    amount: 250, // Inconsistent larger size!
    result: 'LOSS',
    pnl: -250,
    payoutRate: 150,
    targetRr: '1:1.5',
    holdingHorizon: '15m',
    market: 'EUR/USD',
    session: 'Midday',
    isEmotional: true, // Revenge behavior detected
    positionConsistencyChecked: false,
    notes: 'Revenge trade. Increased position size attempting to recoup previous loss. Major rule violation.'
  },
  {
    id: 't5',
    date: '2026-05-27',
    time: '09:40',
    strategyId: 'break_and_retest',
    type: 'LONG',
    amount: 100,
    result: 'WIN',
    payoutRate: 180,
    targetRr: '1:1.8',
    holdingHorizon: '1H',
    market: 'Gold (XAU/USD)',
    pnl: 180,
    session: 'Morning',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Structured retest of broken high range on Gold. Waited patiently for the wick rejection.'
  },
  {
    id: 't6',
    date: '2026-05-28',
    time: '15:10',
    strategyId: 'candlestick_patterns',
    type: 'SHORT',
    amount: 100,
    result: 'WIN',
    payoutRate: 160,
    targetRr: '1:1.6',
    holdingHorizon: '15m',
    market: 'SPY',
    pnl: 160,
    session: 'Midday',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Pin-bar rejection engulfing at historical supply level on SPY.'
  },
  {
    id: 't7',
    date: '2026-05-29',
    time: '19:45',
    strategyId: 'trend_continuation',
    type: 'LONG',
    amount: 100,
    result: 'LOSS',
    pnl: -100,
    payoutRate: 150,
    targetRr: '1:1.5',
    holdingHorizon: '1H',
    market: 'BTC/USD',
    session: 'Evening',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Evening volume was thin, trend died and fluctuated heavily. Lesson: avoid trading late evening.'
  },
  {
    id: 't8',
    date: '2026-05-29',
    time: '20:02',
    strategyId: 'reversal_zones',
    type: 'LONG',
    amount: 100,
    result: 'WIN',
    payoutRate: 150,
    targetRr: '1:1.5',
    holdingHorizon: '30m',
    market: 'USD/JPY',
    pnl: 150,
    session: 'Evening',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Rebound off daily pivot support. Retiring with focus.'
  }
];
