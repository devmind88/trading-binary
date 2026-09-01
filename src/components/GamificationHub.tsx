import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Award, 
  Target, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Compass, 
  Users, 
  MessageSquare, 
  Share2, 
  Lock,
  Star,
  Layers
} from 'lucide-react';
import { Trade } from '../types';

interface GamificationHubProps {
  trades: Trade[];
  onTriggerStreakToast?: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: 'DISCIPLINE' | 'STREAK' | 'RISK_CONTROL' | 'MASTERY';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({ trades }) => {
  const [activeTab, setActiveTab] = useState<'discipline_xp' | 'missions' | 'community'>('discipline_xp');

  // Discipline XP Engine (Rewards process adherence, NOT gambling)
  const userXP = 2450;
  const userLevel = Math.floor(userXP / 500) + 1;
  const xpInCurrentLevel = userXP % 500;
  const xpNeeded = 500;
  const progressPercent = Math.round((xpInCurrentLevel / xpNeeded) * 100);

  // Gamified Badges
  const achievements: Achievement[] = [
    {
      id: 'ach_1',
      title: 'Iron Discipline Guardian',
      description: 'Zero risk limit breaches across 20 consecutive logged trades',
      xp: 250,
      category: 'RISK_CONTROL',
      unlocked: true,
      progress: 20,
      maxProgress: 20
    },
    {
      id: 'ach_2',
      title: 'Anti-Martingale Stoic',
      description: 'Maintained 1.0%–2.0% position size without revenge doubling after 3 losses',
      xp: 300,
      category: 'DISCIPLINE',
      unlocked: true,
      progress: 3,
      maxProgress: 3
    },
    {
      id: 'ach_3',
      title: 'Statistical Sniper',
      description: 'Achieve a 65%+ verified win rate across 30+ trades using 1 primary strategy',
      xp: 500,
      category: 'MASTERY',
      unlocked: false,
      progress: 22,
      maxProgress: 30
    },
    {
      id: 'ach_4',
      title: 'Pre-Trade Checklist Master',
      description: 'Complete 100% of pre-session psychological primers before initiating executions',
      xp: 200,
      category: 'DISCIPLINE',
      unlocked: true,
      progress: 10,
      maxProgress: 10
    }
  ];

  // Daily Consistency Missions
  const dailyMissions = [
    { id: 'm1', title: 'Complete Pre-Session Breathing Primer', reward: '+50 XP', completed: true },
    { id: 'm2', title: 'Execute Max 5 High-Quality Setups Only', reward: '+100 XP', completed: true },
    { id: 'm3', title: 'Log Detailed Behavioral Tag on Every Trade', reward: '+75 XP', completed: false },
    { id: 'm4', title: 'Stop Session Immediately upon Reaching Daily Target', reward: '+120 XP', completed: false }
  ];

  // Anonymous Accountability Community Standings
  const communityTraders = [
    { rank: 1, alias: 'DisciplinedTitan_88', level: 'Level 14 Zen Master', consistencyScore: '98.4%', streak: '12 Days' },
    { rank: 2, alias: 'AlgoStructure_Quant', level: 'Level 11 Sniper', consistencyScore: '96.1%', streak: '9 Days' },
    { rank: 3, alias: 'You (Trader DNA)', level: `Level ${userLevel} Systematic Scalper`, consistencyScore: '94.8%', streak: '6 Days' },
    { rank: 4, alias: 'Patience_Over_FOMO', level: 'Level 8 Guardian', consistencyScore: '91.2%', streak: '4 Days' }
  ];

  return (
    <div id="gamification-behavioral-hub" className="space-y-6">
      
      {/* Top XP & Level Status Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/60 rounded-xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center text-slate-950 font-mono font-extrabold text-xl shadow-lg shrink-0">
              L{userLevel}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300 font-bold">
                  Discipline Level {userLevel}
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {userXP} Total Process XP
                </span>
              </div>
              <h3 className="font-sans font-bold text-slate-100 text-base mt-1">
                Process Mastery & Habit Reinforcement System
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Rewarding strict psychological discipline, zero overtrading, and perfect checklist execution.
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full md:w-64 space-y-1.5 shrink-0">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Next Level Progress:</span>
              <span className="text-purple-300 font-bold">{xpInCurrentLevel} / {xpNeeded} XP ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('discipline_xp')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
            activeTab === 'discipline_xp' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" /> Achievements & Badges
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
            activeTab === 'missions' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-400" /> Daily Consistency Missions
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-2 ${
            activeTab === 'community' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" /> Anonymous Accountability Arena
        </button>
      </div>

      {/* SUB-VIEW 1: ACHIEVEMENTS & TROPHIES */}
      {activeTab === 'discipline_xp' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
          {achievements.map(ach => (
            <div 
              key={ach.id}
              className={`p-4 rounded-xl border transition ${
                ach.unlocked 
                  ? 'bg-slate-900/90 border-purple-800/60 shadow-lg' 
                  : 'bg-slate-950/60 border-slate-850 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    ach.unlocked ? 'bg-purple-950 border-purple-700 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    {ach.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-slate-200 text-sm">{ach.title}</h4>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">{ach.description}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-955/60 px-2 py-1 rounded border border-amber-800 shrink-0">
                  +{ach.xp} XP
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Progress</span>
                  <span>{ach.progress} / {ach.maxProgress}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${ach.unlocked ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                    style={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-VIEW 2: DAILY CONSISTENCY MISSIONS */}
      {activeTab === 'missions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-sans font-bold text-sm text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Daily Habit & Execution Protocol Missions
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Resets at 00:00 UTC</span>
          </div>

          <div className="space-y-3">
            {dailyMissions.map(m => (
              <div 
                key={m.id}
                className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full ${m.completed ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xs font-sans font-medium block ${m.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {m.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Adherence Routine Target</span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950 px-2.5 py-1 rounded border border-purple-800">
                  {m.reward}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: ANONYMOUS ACCOUNTABILITY ARENA */}
      {activeTab === 'community' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-sans font-bold text-sm text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Anonymous Consistency & Discipline Leaderboard
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Ranked by Rule Adherence (Not P&L Gambling)
            </span>
          </div>

          <div className="space-y-2">
            {communityTraders.map(t => (
              <div 
                key={t.rank}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  t.alias.includes('You') 
                    ? 'bg-indigo-950/60 border-indigo-700 shadow-md' 
                    : 'bg-slate-950 border-slate-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-mono font-bold text-xs ${t.rank === 1 ? 'text-amber-400' : t.rank === 2 ? 'text-slate-300' : 'text-slate-500'}`}>
                    #{t.rank}
                  </span>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-200 block">{t.alias}</span>
                    <span className="text-[10px] font-sans text-slate-400">{t.level}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-[9px] uppercase text-slate-500 block">Consistency</span>
                    <span className="text-emerald-400 font-bold">{t.consistencyScore}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase text-slate-500 block">Streak</span>
                    <span className="text-purple-300 font-bold">{t.streak}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
