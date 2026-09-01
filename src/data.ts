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
      'Pre-empting the level rather than letting the structure manifest.'
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
    description: 'Pure price action trading focused on specific high-conviction formations such as pin bars (peezers), engulfing candles, inside-bar breakouts, or morning/evening star configurations.',
    strengths: [
      'Extremely visual, highly objective, and adaptable across all pairs.',
      'Allows rapid mental calculation and alignment.'
    ],
    weaknesses: [
      'Patterns occurring in the middle of nowhere hold no statistical edge.',
      'Prone to subjective interpretation if the trader is desperate for an entry.'
    ],
    marketConditionsBest: 'Any market with clean liquidity and candles that respects pure open-cloze-high-low levels, avoiding highly volatile index spikes.',
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
  { id: 'ec1', text: 'Trend direction confirmed on multiple timeframes', checked: false },
  { id: 'ec2', text: 'Key historical level (S/R, supply/demand, or Fibonacci) identified', checked: false },
  { id: 'ec3', text: 'Approved candlestick entry signal present', checked: false },
  { id: 'ec4', text: 'No high-impact macroeconomic news in next 30 minutes', checked: false },
  { id: 'ec5', text: 'Mental check: I am calm, breathing steadily, and entirely focused', checked: false }
];

export const defaultBeforeRoutine: ChecklistItem[] = [
  { id: 'br1', text: 'Review yesterday’s trades & identify any rule/strategy slip-ups', checked: false },
  { id: 'br2', text: 'Check economic calendar for high-impact USD, EUR, or GBP releases', checked: false },
  { id: 'br3', text: 'Identify and draw major structural levels on target currency pairs', checked: false },
  { id: 'br4', text: 'Define maximum daily risk budget (5% limit)', checked: false },
  { id: 'br5', text: 'Set standard position sizing (1-2% of current account balance)', checked: false },
  { id: 'br6', text: 'Verify hardware, internet connection, and confirm normal calm breathing', checked: false }
];

export const defaultDuringRoutine: ChecklistItem[] = [
  { id: 'dr1', text: 'Enforce entry checklist strictly. No checks skipped, no trades made.', checked: false },
  { id: 'dr2', text: 'Log every single trade immediately with tags and comments.', checked: false },
  { id: 'dr3', text: 'Stop trading immediately if 3 consecutive losses occur.', checked: false },
  { id: 'dr4', text: 'Take a stand-up or stretch break after every 3 trades to clear the mind.', checked: false }
];

export const defaultAfterRoutine: ChecklistItem[] = [
  { id: 'ar1', text: 'Fill out PnL Calendar with final wins, losses, and net balance.', checked: false },
  { id: 'ar2', text: 'Review screenshots of today’s entries to verify matching structure.', checked: false },
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
    type: 'CALL',
    amount: 20,
    result: 'WIN',
    payoutRate: 85,
    pnl: 17,
    session: 'Morning',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Clean entry off 20 EMA pullback in EUR/USD strong uptrend. Followed checklist.'
  },
  {
    id: 't2',
    date: '2026-05-25',
    time: '08:45',
    strategyId: 'trend_continuation',
    type: 'CALL',
    amount: 20,
    result: 'WIN',
    payoutRate: 85,
    pnl: 17,
    session: 'Morning',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Second pullback successful. Solid momentum.'
  },
  {
    id: 't3',
    date: '2026-05-26',
    time: '12:30',
    strategyId: 'reversal_zones',
    type: 'PUT',
    amount: 20,
    result: 'LOSS',
    pnl: -20,
    payoutRate: 82,
    session: 'Midday',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'GBP/USD major resistance breakout. Traded rejection but candle broke and closed above S/R.'
  },
  {
    id: 't4',
    date: '2026-05-26',
    time: '13:02',
    strategyId: 'reversal_zones',
    type: 'PUT',
    amount: 40, // Inconsistent larger size!
    result: 'LOSS',
    pnl: -40,
    payoutRate: 82,
    session: 'Midday',
    isEmotional: true, // Revenge behavior detected
    positionConsistencyChecked: false,
    notes: 'Revenge trade. Doubled trade size attempting to win back the previous reversal loss. Major mistake.'
  },
  {
    id: 't5',
    date: '2026-05-27',
    time: '09:40',
    strategyId: 'break_and_retest',
    type: 'CALL',
    amount: 15,
    result: 'WIN',
    payoutRate: 85,
    pnl: 12.75,
    session: 'Morning',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Beautiful retest of broken high range on USD/JPY. Waited patiently for the wick rejection.'
  },
  {
    id: 't6',
    date: '2026-05-28',
    time: '15:10',
    strategyId: 'candlestick_patterns',
    type: 'PUT',
    amount: 15,
    result: 'WIN',
    payoutRate: 80,
    pnl: 12,
    session: 'Midday',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Stellar pin-bar rejection engulfing at historical daily supply level on AUD/USD.'
  },
  {
    id: 't7',
    date: '2026-05-29',
    time: '19:45',
    strategyId: 'trend_continuation',
    type: 'CALL',
    amount: 15,
    result: 'LOSS',
    pnl: -15,
    payoutRate: 80,
    session: 'Evening',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Evening volume was very thin, trend died and fluctuated heavily. Lesson: avoid trading late evening.'
  },
  {
    id: 't8',
    date: '2026-05-29',
    time: '20:02',
    strategyId: 'reversal_zones',
    type: 'CALL',
    amount: 15,
    result: 'WIN',
    payoutRate: 80,
    pnl: 12,
    session: 'Evening',
    isEmotional: false,
    positionConsistencyChecked: true,
    notes: 'Final rebound off daily pivot. Retiring with focus.'
  }
];
