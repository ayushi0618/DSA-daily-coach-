import React, { useState } from 'react';
import { BookOpen, Search, Trash2, Calendar, Code, Clock, Database, Tag } from 'lucide-react';
import { SolvedProblem } from '../types';

interface RevisionFlashcardsProps {
  problems: SolvedProblem[];
  onDeleteProblem: (id: string) => void;
}

export const RevisionFlashcards: React.FC<RevisionFlashcardsProps> = ({
  problems,
  onDeleteProblem,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');

  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDiff = filterDifficulty === 'ALL' || p.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Revision Vault & Solved Log
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Review saved questions, algorithmic notes, and maintain retention through active recall.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topics or titles..."
                className="pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problem Cards List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-700 dark:text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Problems Found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Solve problems using the Daily Solver to populate your revision vault.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const dateStr = new Date(item.solvedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-200 dark:hover:border-slate-200 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          item.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {item.difficulty}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {item.topic}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => onDeleteProblem(item.id)}
                      className="text-slate-600 hover:text-rose-500 p-1 rounded-lg transition"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.notes && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Note:</strong>
                      {item.notes}
                    </div>
                  )}

                  <div className="mt-3 flex items-center space-x-4 text-[11px] text-slate-600 dark:text-slate-400">
                    {item.timeComplexity && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-indigo-400" /> {item.timeComplexity}
                      </span>
                    )}
                    {item.spaceComplexity && (
                      <span className="flex items-center gap-1 font-mono">
                        <Database className="w-3 h-3 text-purple-400" /> {item.spaceComplexity}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Solved {dateStr}
                  </span>
                  <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {item.language}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
