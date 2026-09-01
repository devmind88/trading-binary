export type StrategyId = 'trend_continuation' | 'reversal_zones' | 'break_and_retest' | 'candlestick_patterns';

export interface StrategyDefinition {
  id: StrategyId;
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketConditionsBest: string;
  marketConditionsWorst: string;
  behavioralMistakes: string[];
  refinementSuggestions: string[];
}

export type TradingSession = 'Morning' | 'Midday' | 'Evening';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  strategyId: StrategyId;
  type: 'CALL' | 'PUT';
  amount: number;
  result: 'WIN' | 'LOSS' | 'TIE';
  payoutRate: number; // e.g. 82 for 82%
  pnl: number; // positive for WIN, negative for LOSS, 0 for TIE
  session: TradingSession;
  isEmotional: boolean;
  positionConsistencyChecked: boolean; // checks if within 1-2%
  notes: string;
}

export interface RiskLimits {
  startingBalance: number;
  currentBalance: number;
  maxDailyLossPercent: number; // default 5%
  maxWeeklyLossPercent: number; // default 15%
  maxDailyTradesCount: number; // default 10
  maxConsecutiveLossesAllowed: number; // default 3
  minTradeSizePercent: number; // default 1%
  maxTradeSizePercent: number; // default 2%
}

export interface DailyRoutineState {
  beforeChecklist: ChecklistItem[];
  duringChecklist: ChecklistItem[];
  afterChecklist: ChecklistItem[];
  currentMood: 'Focused & Calm' | 'Neutral' | 'Anxious' | 'Frustrated' | 'Impulsive';
  notes: string;
}

export interface RuleViolation {
  id: string;
  type: 'OVERTRADING' | 'EMOTIONAL_TRADING' | 'MARTINGALE_BEHAVIOR' | 'INCONSISTENT_POSITION_SIZE' | 'OUTSIDE_HOURS' | 'MAX_LOSS_EXCEEDED' | 'CONSECUTIVE_LOSS_REACHED';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'system' | 'voice';
  text: string;
  timestamp: string;
  moduleActivated?: string;
  isAudioSpoken?: boolean;
}
