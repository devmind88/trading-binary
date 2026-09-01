import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Sparkles, X, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface WinStreakToastProps {
  isOpen: boolean;
  streakCount: number;
  streakPnl?: number;
  onClose: () => void;
  autoCloseMs?: number;
  onViewCalendar?: () => void;
}

export const WinStreakToast: React.FC<WinStreakToastProps> = ({
  isOpen,
  streakCount,
  streakPnl = 0,
  onClose,
  autoCloseMs = 6500,
  onViewCalendar
}) => {
  const [progress, setProgress] = useState(100);

  // Auto-dismiss countdown timer
  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoCloseMs) * 100);
      setProgress(remaining);

      if (elapsed >= autoCloseMs) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, autoCloseMs, onClose]);

  // Contextual coaching copy based on streak tier
  const getReinforcementCopy = (streak: number) => {
    if (streak === 3) {
      return {
        badge: 'Triple Win Milestone',
        title: '3-Trade Win Streak Achieved',
        message: 'Discipline is compounding. You executed 3 consecutive winning contracts. Stay centered, resist overtrading, and keep position sizing strictly at 1-2%.',
        accentColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
        glowColor: 'shadow-amber-950/50 border-amber-500/30'
      };
    } else if (streak === 4) {
      return {
        badge: 'Momentum Master',
        title: '4 Consecutive Wins Logged',
        message: 'Setup filtering is locked in. High-quality execution verified. Protect your equity curve and never force a trade when momentum slows.',
        accentColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
        glowColor: 'shadow-emerald-950/50 border-emerald-500/30'
      };
    } else {
      return {
        badge: `${streak}-Streak Dominance`,
        title: `${streak}-Trade Winning Run`,
        message: `Exceptional consistency! ${streak} contracts won in a row. Consider locking in profits and taking a short routine break to preserve emotional equilibrium.`,
        accentColor: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
        glowColor: 'shadow-indigo-950/50 border-indigo-500/30'
      };
    }
  };

  const copy = getReinforcementCopy(streakCount);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] pointer-events-auto"
          role="alert"
          aria-live="polite"
        >
          <div className={`relative overflow-hidden bg-slate-900/95 backdrop-blur-md border rounded-2xl p-4 shadow-2xl ${copy.glowColor} text-slate-100 transition-all duration-300`}>
            
            {/* Ambient Background Glow Effect */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex items-start gap-3.5">
              
              {/* Animated Trophy/Flame Icon */}
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  {streakCount >= 4 ? (
                    <Trophy className="w-5 h-5 animate-bounce [animation-duration:2.5s]" />
                  ) : (
                    <Flame className="w-5 h-5 animate-pulse text-amber-400" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-mono text-[9px] font-extrabold px-1 rounded-full shadow">
                  {streakCount}x
                </div>
              </div>

              {/* Text & Reinforcement Content */}
              <div className="flex-1 min-w-0 pr-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${copy.accentColor} inline-flex items-center gap-1`}>
                    <Sparkles className="w-2.5 h-2.5" />
                    {copy.badge}
                  </span>
                  {streakPnl > 0 && (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                      +${streakPnl.toFixed(2)}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-slate-100 font-sans tracking-tight">
                  {copy.title}
                </h4>

                <p className="text-xs text-slate-300/90 leading-relaxed mt-1 font-sans">
                  {copy.message}
                </p>

                {/* Micro Action link */}
                {onViewCalendar && (
                  <button
                    onClick={() => {
                      onViewCalendar();
                      onClose();
                    }}
                    className="mt-2 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition group"
                  >
                    <span>View in P&L Calendar</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-0 right-0 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-Dismiss Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
