import React from 'react';
import { Flame, Trophy, Award, CheckCircle2, Circle, ArrowRight, Play } from 'lucide-react';
import { SolvedProblem, UserStats } from '../types';
import { StorageService } from '../services/storageService';

interface StreakTrackerProps {
  stats: UserStats;
  solvedProblems: SolvedProblem[];
  onSolveDaily: () => void;
  onWatchLecture: () => void;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  stats,
  solvedProblems,
  onSolveDaily,
  onWatchLecture,
}) => {
  const calendar7Days = StorageService.get7DayCalendar(solvedProblems);
  const nextLevelXp = stats.level * 250;
  const currentLevelXp = (stats.level - 1) * 250;
  const progressInLevel = Math.min(100, Math.max(0, ((stats.xp - currentLevelXp) / 250) * 100));

  return (
    <div className="bg-gradient-to-br from-indigo-900/10 via-white to-purple-900/5 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-100 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Left: Streak & Flame Hero */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Flame className="w-9 h-9 text-slate-900 fill-amber-200 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.streak} Days
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                Active Streak
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              All-time peak: <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.longestStreak} days</span>
            </p>
          </div>
        </div>

        {/* Center: 7-Day Rolling Progress */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Past 7 Days Consistency
          </span>
          <div className="flex items-center space-x-2">
            {calendar7Days.map((day) => (
              <div key={day.date} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    day.solved
                      ? 'bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/20'
                      : day.isToday
                      ? 'border-2 border-dashed border-indigo-400 text-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                  title={`${day.date}: ${day.solved ? 'Solved' : 'Not solved'}`}
                >
                  {day.solved ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-slate-900" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1">
                  {day.dayName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Level, XP & CTA Actions */}
        <div className="flex flex-col justify-between h-full space-y-3">
          <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Level {stats.level}: {stats.title}
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-semibold">{stats.xp} XP</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressInLevel}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onSolveDaily}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 text-xs font-bold transition shadow-sm"
            >
              <span>Solve Today</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onWatchLecture}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              <Play className="w-3.5 h-3.5 fill-current text-indigo-500" />
              <span>Lecture</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
