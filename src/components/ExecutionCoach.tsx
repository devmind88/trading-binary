import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Brain, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  RotateCcw, 
  Lightbulb, 
  Layers, 
  Zap,
  Activity
} from 'lucide-react';
import { Trade } from '../types';

interface ExecutionCoachProps {
  trades: Trade[];
  onNavigate?: (tab: string) => void;
}

export type CoachPersona = 'STOIC_ZEN' | 'QUANT_DISCIPLINARIAN' | 'PERFORMANCE_PSYCHOLOGIST';

export const ExecutionCoach: React.FC<ExecutionCoachProps> = ({ trades, onNavigate }) => {
  const [selectedPersona, setSelectedPersona] = useState<CoachPersona>('QUANT_DISCIPLINARIAN');
  const [activeSessionStage, setActiveSessionStage] = useState<'PRE_SESSION' | 'LIVE_COACH' | 'POST_FORENSIC'>('PRE_SESSION');

  // Recent emotional metrics
  const recentTrades = trades.slice(0, 10);
  const emotionalTrades = recentTrades.filter(t => t.isEmotional);
  const consecutiveLosses = trades.slice(0, 4).filter(t => t.result === 'LOSS').length;

  return (
    <div id="ai-execution-coach-cockpit" className="space-y-6">
      
      {/* Coach Header & Persona Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl text-white shadow-lg shrink-0">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-slate-100 text-base">
                  AI Execution Coach 2.0 & Adaptive Cognitive Mentor
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold">
                  Memory-Aware
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Behavioral finance mentor auditing revenge triggers, burnout risks, and emotional leak patterns.
              </p>
            </div>
          </div>

          {/* Persona Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Persona:</span>
            <select
              value={selectedPersona}
              onChange={e => setSelectedPersona(e.target.value as CoachPersona)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5"
            >
              <option value="QUANT_DISCIPLINARIAN">Quant Disciplinarian (Strict Mathematical)</option>
              <option value="STOIC_ZEN">Stoic Zen Master (Marcus Aurelius Model)</option>
              <option value="PERFORMANCE_PSYCHOLOGIST">Cognitive Performance Psychologist</option>
            </select>
          </div>
        </div>

        {/* Stage Navigation: Pre-session Priming, Live Intervention, Post-session Forensic */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSessionStage('PRE_SESSION')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
              activeSessionStage === 'PRE_SESSION' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Pre-Session Mental Priming
          </button>
          <button
            onClick={() => setActiveSessionStage('LIVE_COACH')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
              activeSessionStage === 'LIVE_COACH' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Live Behavioral Intervention
          </button>
          <button
            onClick={() => setActiveSessionStage('POST_FORENSIC')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition ${
              activeSessionStage === 'POST_FORENSIC' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Post-Session Forensic Review
          </button>
        </div>
      </div>

      {/* STAGE 1: PRE-SESSION MENTAL PRIMING */}
      {activeSessionStage === 'PRE_SESSION' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold font-sans">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Pre-Session Mindset Synchronization</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Rule 1: Probabilistic Detachment</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Accept prior to entering the market that any individual contract outcome is random. Your edge only manifests over a cluster of 50+ executions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">Rule 2: Anti-Revenge Hard Circuit</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                If 2 consecutive losses occur, you are mandated to stand up and initiate a 15-minute screen disconnection protocol.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">Rule 3: Stake Integrity</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Under no circumstance may contract risk exceed 2.0% ($20.00). Inconsistent stake escalation destroys mathematical expectancy.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-slate-200 flex items-center justify-between">
            <span>Coach Persona Directive: <strong>"Trade the chart in front of you, not the P&L in your head."</strong></span>
            <button
              onClick={() => setActiveSessionStage('LIVE_COACH')}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition cursor-pointer"
            >
              Confirm Mindset & Proceed
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: LIVE BEHAVIORAL INTERVENTION */}
      {activeSessionStage === 'LIVE_COACH' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h4 className="font-sans font-bold text-sm text-slate-100">Live Cognitive Telemetry Monitor</h4>
            </div>
            <span className="text-xs font-mono text-slate-400">Monitoring Active Trade Impulses</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Revenge Drift Risk</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-mono font-bold ${consecutiveLosses >= 2 ? 'text-rose-450' : 'text-emerald-400'}`}>
                  {consecutiveLosses >= 2 ? 'ELEVATED (78%)' : 'LOW (12%)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {consecutiveLosses >= 2 
                  ? 'Recent loss cluster detected. Dopamine craving for instant breakeven is active.'
                  : 'Heart-rate and trade tempo indicate high patience and selective execution.'}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Emotional Tax Deductions</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-amber-400">
                  {emotionalTrades.length} Flagged Impulses
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Logged trades entered outside clean rule checklist confirmations.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
            <span className="text-xs font-mono uppercase text-indigo-400 font-bold block">Live Coach Feedback:</span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              "Your edge on <strong>Reversal Zones</strong> is proven at 68% win-rate when you wait for the 5-minute wick rejection. However, you lost 2 trades earlier today because you entered on a 1-minute candle mid-air. Wait for the level to hold."
            </p>
          </div>
        </div>
      )}

      {/* STAGE 3: POST-SESSION FORENSIC REVIEW */}
      {activeSessionStage === 'POST_FORENSIC' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center gap-2 text-purple-300 text-sm font-bold font-sans">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
            <span>End-of-Day Executive Forensic Audit</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200">Session Grade: A- (91% Discipline Consistency)</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">+250 Process XP</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              You executed with high emotional composure during the European morning overlap. You respected your 5 daily trade quota and stopped when your target was achieved. Maintain this routine tomorrow.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
