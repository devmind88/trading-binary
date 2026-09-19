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

export type ExecutionType = 'LONG' | 'SHORT' | 'CALL' | 'PUT';

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
  type: ExecutionType; // 'LONG' | 'SHORT' (with legacy CALL/PUT backward-compatibility)
  amount: number; // Position Size / Risk Allocation ($)
  result: 'WIN' | 'LOSS' | 'TIE';
  payoutRate: number; // Target Risk:Reward or Expected Return %
  targetRr?: string; // e.g. '1:1.5', '1:2', '1:3'
  holdingHorizon?: string; // e.g. '5m', '15m', '1H', '4H'
  market?: string; // e.g. 'NQ Futures', 'ES Futures', 'EUR/USD', 'Gold', 'AAPL'
  pnl: number; // positive for WIN, negative for LOSS, 0 for TIE
  session: TradingSession;
  isEmotional: boolean;
  positionConsistencyChecked: boolean; // checks if within 1-2%
  notes: string;
}

export interface AccountSetupConfig {
  startingBalance: number;
  maxDailyLossPercent: number;
  maxWeeklyLossPercent: number;
  primaryMarkets: string[];
  executionStyle: 'Scalping' | 'Day Trading' | 'Swing Trading';
  defaultRiskReward: string;
  maxDailyTradesCount: number;
  maxTradeRiskPercent: number;
  loadSampleLedger?: boolean;
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

export type UserPlan = 'free' | 'pro' | 'elite';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  joinedAt: string;
  adFree: boolean;
  dailyAiQueriesUsed: number;
  maxDailyAiQueries: number;
  billingCycle?: 'monthly' | 'annual';
  googleAdsenseClientId?: string; // Configurable AdSense Client ID (ca-pub-xxx)
}

export interface PlanFeature {
  title: string;
  free: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
  highlight?: boolean;
}
