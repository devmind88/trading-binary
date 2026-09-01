import React from 'react';
import { ChecklistItem, DailyRoutineState } from '../types';
import { ShieldCheck, Play, Save, CheckCircle, Flame, Heart } from 'lucide-react';

interface DailyRoutineProps {
  routineState: DailyRoutineState;
  setRoutineState: React.Dispatch<React.SetStateAction<DailyRoutineState>>;
}

export const DailyRoutine: React.FC<DailyRoutineProps> = ({ routineState, setRoutineState }) => {
  
  // Toggle checklist utilities
  const toggleStep = (type: 'before' | 'during' | 'after', id: string) => {
    setRoutineState(prev => {
      const field = type === 'before' ? 'beforeChecklist' : type === 'during' ? 'duringChecklist' : 'afterChecklist';
      const updatedList = prev[field].map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      return { ...prev, [field]: updatedList };
    });
  };

  // Check state categories finished
  const beforeDone = routineState.beforeChecklist.every(c => c.checked);
  const duringDone = routineState.duringChecklist.every(c => c.checked);
  const afterDone = routineState.afterChecklist.every(c => c.checked);

  const beforeProgress = routineState.beforeChecklist.filter(c => c.checked).length;
  const duringProgress = routineState.duringChecklist.filter(c => c.checked).length;
  const afterProgress = routineState.afterChecklist.filter(c => c.checked).length;

  return (
    <div id="daily-routine-container" className="space-y-6">
      
      {/* Introduction text */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="font-sans font-medium text-slate-100 text-lg mb-1">Daily Executive Protocol</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          The difference between a gambler and a clinical business trader is procedural fidelity. Complete each phase sequentially to foster peak cognitive performance and absolute strategic alignment.
        </p>
      </div>

      {/* Routine Blocks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Phase 1: Before Trading */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-[10px] font-mono font-bold text-indigo-400">1</span>
                <h4 className="font-sans font-semibold text-slate-200">Before Trading</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {beforeProgress} / {routineState.beforeChecklist.length} Clear
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 h-11 leading-normal">
              Pre-flight checks. Drawing structural charts and setting your risk budgets prior to opening broker windows.
            </p>

            <div className="space-y-2.5 mb-6">
              {routineState.beforeChecklist.map(step => (
                <div
                  key={step.id}
                  onClick={() => toggleStep('before', step.id)}
                  className={`flex items-start gap-3 p-2.5 rounded border transition cursor-pointer select-none text-xs ${
                    step.checked
                      ? 'bg-emerald-950/10 border-emerald-900/40 text-slate-300'
                      : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center font-mono text-[9px] border transition ${
                    step.checked ? 'bg-indigo-500 border-indigo-400 text-slate-950 font-bold' : 'border-slate-700'
                  }`}>
                    {step.checked && '✓'}
                  </div>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 mt-auto">
            {beforeDone ? (
              <div className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 p-2 text-center rounded text-xs font-mono flex items-center justify-center gap-1.5 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> PRE-FLIGHT APPROVED
              </div>
            ) : (
              <div className="bg-slate-950 text-slate-500 border border-slate-800/40 p-2 text-center rounded text-xs font-mono">
                WAITING FOR CHECKS...
              </div>
            )}
          </div>
        </div>

        {/* Phase 2: During Trading */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400">2</span>
                <h4 className="font-sans font-semibold text-slate-200">During Session Rules</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {duringProgress} / {routineState.duringChecklist.length} Active
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 h-11 leading-normal">
              Real-time operational constraints. Active defensive anchors to avoid greed triggers or blind chasing.
            </p>

            <div className="space-y-2.5 mb-6">
              {routineState.duringChecklist.map(step => (
                <div
                  key={step.id}
                  onClick={() => toggleStep('during', step.id)}
                  className={`flex items-start gap-3 p-2.5 rounded border transition cursor-pointer select-none text-xs ${
                    step.checked
                      ? 'bg-emerald-950/10 border-emerald-900/40 text-slate-300'
                      : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center font-mono text-[9px] border transition ${
                    step.checked ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold' : 'border-slate-700'
                  }`}>
                    {step.checked && '✓'}
                  </div>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 mt-auto">
            {duringDone ? (
              <div className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 p-2 text-center rounded text-xs font-mono flex items-center justify-center gap-1.5 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> CONTINUOUS FIDELITY SAFE
              </div>
            ) : (
              <div className="bg-slate-950 text-slate-500 border border-slate-800/40 p-2 text-center rounded text-xs font-mono">
                ENFORCING PROTOCOLS...
              </div>
            )}
          </div>
        </div>

        {/* Phase 3: Post-Session Audit */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-950 border border-violet-800 flex items-center justify-center text-[10px] font-mono font-bold text-violet-400">3</span>
                <h4 className="font-sans font-semibold text-slate-200">After Trading Audit</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {afterProgress} / {routineState.afterChecklist.length} Done
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 h-11 leading-normal">
              The post-mortem phase. Entering your data logs, studying screenshots, and reflecting on rule deviations.
            </p>

            <div className="space-y-2.5 mb-6">
              {routineState.afterChecklist.map(step => (
                <div
                  key={step.id}
                  onClick={() => toggleStep('after', step.id)}
                  className={`flex items-start gap-3 p-2.5 rounded border transition cursor-pointer select-none text-xs ${
                    step.checked
                      ? 'bg-emerald-950/10 border-emerald-900/40 text-slate-300'
                      : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center font-mono text-[9px] border transition ${
                    step.checked ? 'bg-violet-500 border-violet-400 text-slate-950 font-bold' : 'border-slate-700'
                  }`}>
                    {step.checked && '✓'}
                  </div>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 mt-auto">
            {afterDone ? (
              <div className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 p-2 text-center rounded text-xs font-mono flex items-center justify-center gap-1.5 font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> METRICS SYNCHRONIZED
              </div>
            ) : (
              <div className="bg-slate-950 text-slate-500 border border-slate-800/40 p-2 text-center rounded text-xs font-mono">
                PENDING LOG CLOSURE...
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Psychology Warmup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Mood select box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-3">
            <Heart className="w-5 h-5 text-rose-450" />
            <h4 className="font-sans font-medium text-slate-100 text-md">Psychological Entrance Log</h4>
          </div>

          <p className="text-xs text-slate-400 mb-4 h-12">
            Discipline begins with raw self-honesty. Pick your current mental condition. Rushing or trading with anxiety triggers overleveraging.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {([
              { name: 'Focused & Calm', color: 'bg-emerald-950 border-emerald-700/80 text-emerald-400' },
              { name: 'Neutral', color: 'bg-slate-950 border-slate-800 text-slate-300' },
              { name: 'Anxious', color: 'bg-amber-955/10 border-amber-800/30 text-amber-300' },
              { name: 'Frustrated', color: 'bg-rose-955/20 border-rose-900/40 text-rose-300' },
              { name: 'Impulsive', color: 'bg-rose-955/40 border-rose-600 text-rose-400' }
            ] as const).map(mood => (
              <button
                key={mood.name}
                type="button"
                onClick={() => setRoutineState(prev => ({ ...prev, currentMood: mood.name }))}
                className={`py-2 px-1 text-center rounded-lg border font-mono transition text-[10px] flex items-center justify-center font-bold ${
                  routineState.currentMood === mood.name
                    ? mood.color
                    : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-500'
                }`}
              >
                {mood.name}
              </button>
            ))}
          </div>
        </div>

        {/* Free text session notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h4 className="font-sans font-medium text-slate-100 text-md mb-2">Pre-Session Psychological Commitment</h4>
          <label className="block">
            <textarea
              className="w-full bg-slate-950 border border-slate-850 rounded p-3 text-xs text-slate-200 font-sans focus:border-slate-800 outline-none h-24 resize-none"
              placeholder="Commit to your rules in writing here prior to trading (e.g., 'I will accept a $50 maximum loss today and walk away if reached.')"
              value={routineState.notes}
              onChange={e => setRoutineState(prev => ({ ...prev, notes: e.target.value }))}
            />
          </label>
        </div>

      </div>

    </div>
  );
};
