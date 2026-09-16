import React from 'react';
import { Trophy, Flame, Zap, BarChart3, PieChart, Clock, Award, Target, CheckCircle2 } from 'lucide-react';
import { SolvedProblem, UserStats, UserProfile } from '../types';

interface AnalyticsViewProps {
  stats: UserStats;
  user: UserProfile;
  problems: SolvedProblem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, user, problems }) => {
  const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'Hard').length;
  const totalCount = problems.length || 1; // avoid divide by zero

  const easyPct = Math.round((easyCount / totalCount) * 100);
  const mediumPct = Math.round((mediumCount / totalCount) * 100);
  const hardPct = Math.round((hardCount / totalCount) * 100);

  // Group by topic
  const topicMap: Record<string, number> = {};
  problems.forEach(p => {
    topicMap[p.topic] = (topicMap[p.topic] || 0) + 1;
  });
  const topicsSorted = Object.entries(topicMap).sort((a, b) => b[1] - a[1]);

  // Group by language
  const langMap: Record<string, number> = {};
  problems.forEach(p => {
    langMap[p.language] = (langMap[p.language] || 0) + 1;
  });

  const nextLevelXp = stats.level * 250;
  const currentLevelBaseXp = (stats.level - 1) * 250;
  const xpInCurrentLevel = Math.max(0, stats.xp - currentLevelBaseXp);
  const xpNeededForNext = 250;
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Solved</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{problems.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active Streak</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.streak} Days</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Zap className="w-6 h-6 fill-purple-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Experience</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.xp} XP</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rank Level</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Lvl {stats.level}</h3>
          </div>
        </div>

      </div>

      {/* Level Progression Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-950 text-slate-900 p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-purple-300">
              Student Rank Title
            </span>
            <h2 className="text-2xl font-black mt-1">{stats.title}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-indigo-200 font-semibold">
              Level {stats.level} → Level {stats.level + 1}
            </span>
            <p className="text-sm font-bold text-amber-300">
              {nextLevelXp - stats.xp} XP to next milestone
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-slate-100 transition-all duration-500"
            style={{ width: `${levelProgressPct}%` }}
          />
        </div>
      </div>

      {/* Breakdown Section: Difficulty & Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Difficulty Distribution */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Difficulty Breakdown</span>
            </h3>
            <span className="text-xs font-bold text-slate-600">{problems.length} Total</span>
          </div>

          <div className="space-y-4">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-600 dark:text-emerald-400">Easy ({easyCount})</span>
                <span className="text-slate-600 dark:text-slate-400">{easyPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${easyPct}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-600 dark:text-amber-400">Medium ({mediumCount})</span>
                <span className="text-slate-600 dark:text-slate-400">{mediumPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${mediumPct}%` }}
                />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-rose-600 dark:text-rose-400">Hard ({hardCount})</span>
                <span className="text-slate-600 dark:text-slate-400">{hardPct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${hardPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Languages Used Mini Grid */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
              Programming Languages Used
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(langMap).map(([lang, count]) => (
                <div
                  key={lang}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5"
                >
                  <span className="font-bold">{lang}:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{count} problems</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic Mastery Distribution */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Topic Mastery</span>
            </h3>
            <span className="text-xs font-bold text-slate-600">{topicsSorted.length} Topics</span>
          </div>

          {topicsSorted.length === 0 ? (
            <p className="text-xs text-slate-600 italic py-8 text-center">
              Solve algorithmic problems to populate your topic mastery radar.
            </p>
          ) : (
            <div className="space-y-3.5">
              {topicsSorted.map(([topic, count]) => {
                const maxCount = Math.max(...topicsSorted.map(t => t[1])) || 1;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={topic}>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      <span>{topic}</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {count} solved
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-100 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
