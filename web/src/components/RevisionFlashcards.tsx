import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Trash2, Calendar, Code, Clock, Database, Tag, Brain, Eye, RotateCcw } from 'lucide-react';
import { SolvedProblem, ReviewState } from '../types';
import { StorageService } from '../services/storageService';

interface RevisionFlashcardsProps {
  problems: SolvedProblem[];
  onDeleteProblem: (id: string) => void;
  onXP?: () => void;
}

const GRADES: Array<{ id: 'again' | 'hard' | 'good' | 'easy'; label: string; hint: string; classes: string }> = [
  { id: 'again', label: 'Again', hint: '< 1 day', classes: 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900' },
  { id: 'hard', label: 'Hard', hint: 'struggled', classes: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900' },
  { id: 'good', label: 'Good', hint: 'recalled', classes: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900' },
  { id: 'easy', label: 'Easy', hint: 'trivial', classes: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900' },
];

export const RevisionFlashcards: React.FC<RevisionFlashcardsProps> = ({
  problems,
  onDeleteProblem,
  onXP,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [mode, setMode] = useState<'all' | 'due'>('all');
  const [reviewState, setReviewState] = useState<Record<string, ReviewState>>(() => StorageService.getReviewState());
  const [reviewIdx, setReviewIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDiff = filterDifficulty === 'ALL' || p.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  // SM-2-lite: cards due today (or never reviewed) form the review queue
  const dueProblems = useMemo(() => {
    const now = Date.now();
    return problems
      .filter(p => {
        const rs = reviewState[p.id];
        return !rs || rs.nextReview <= now;
      })
      .sort((a, b) => (reviewState[a.id]?.nextReview || 0) - (reviewState[b.id]?.nextReview || 0));
  }, [problems, reviewState]);

  const current = dueProblems[Math.min(reviewIdx, Math.max(0, dueProblems.length - 1))];

  const handleGrade = (grade: 'again' | 'hard' | 'good' | 'easy') => {
    if (!current) return;
    const next = StorageService.gradeReview(current.id, grade);
    setReviewState(prev => ({ ...prev, [current.id]: next }));
    setRevealed(false);
    // advance the queue (graded card drops out since nextReview is now in the future)
    setReviewIdx(0);
    onXP?.();
  };

  const fmtNext = (rs?: ReviewState) => {
    if (!rs) return 'never reviewed';
    const days = Math.max(0, Math.round((rs.nextReview - Date.now()) / 86400000));
    if (rs.nextReview <= Date.now()) return 'due now';
    return days === 0 ? 'later today' : `in ${days}d`;
  };

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

      {/* Mode switcher: All cards vs SM-2 review queue */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${mode === 'all' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300'}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> All cards ({problems.length})
        </button>
        <button
          onClick={() => setMode('due')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${mode === 'due' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300'}`}
        >
          <Brain className="w-3.5 h-3.5" /> Due for review ({dueProblems.length})
        </button>
      </div>

      {mode === 'due' ? (
        /* ============ SPACED REPETITION REVIEW QUEUE (SM-2 lite) ============ */
        <div>
          {!current ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <Brain className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Queue clear — nothing due!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your memory is fresh. Come back tomorrow for the next spaced reviews.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  card {Math.min(reviewIdx + 1, dueProblems.length)} of {dueProblems.length} due
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold diff-badge-${current.difficulty.toLowerCase()}`}>{current.difficulty}</span>
              </div>

              <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">{current.topic}</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{current.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Recall the approach, complexity, and edge cases — then reveal and grade yourself honestly.
              </p>

              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition"
                >
                  <Eye className="w-4 h-4" /> Reveal answer
                </button>
              ) : (
                <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                  {(current.timeComplexity || current.spaceComplexity) && (
                    <div className="flex gap-2 font-mono text-[11px]">
                      {current.timeComplexity && <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">time {current.timeComplexity}</span>}
                      {current.spaceComplexity && <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">space {current.spaceComplexity}</span>}
                    </div>
                  )}
                  {current.notes && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">Your note:</strong>
                      {current.notes}
                    </div>
                  )}
                  {current.codeSnippet && (
                    <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 text-[11px] font-mono overflow-x-auto border border-slate-800 max-h-48 overflow-y-auto">{current.codeSnippet}</pre>
                  )}
                  {!current.notes && !current.codeSnippet && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">No notes saved for this problem — recall the approach from memory.</p>
                  )}

                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">How well did you recall it? <span className="normal-case font-medium">(+5 XP)</span></p>
                    <div className="grid grid-cols-4 gap-2">
                      {GRADES.map(g => (
                        <button
                          key={g.id}
                          onClick={() => handleGrade(g.id)}
                          className={`rounded-xl px-2 py-2.5 text-xs font-bold transition ${g.classes}`}
                        >
                          {g.label}
                          <span className="block text-[9px] font-medium opacity-70 mt-0.5">{g.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-mono">
            SM-2 spaced repetition — Again resets the interval, Easy stretches it. Reviews schedule automatically.
          </p>
        </div>
      ) : (
      <>
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
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400" title="Spaced repetition schedule">
                      <RotateCcw className="w-3 h-3" /> {fmtNext(reviewState[item.id])}
                    </span>
                    <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                      {item.language}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

    </div>
  );
};
