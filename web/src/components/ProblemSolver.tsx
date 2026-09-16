import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  Code2,
  Lightbulb,
  Cpu,
  ShieldAlert,
  HelpCircle,
  Clock,
  Database,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Difficulty, Language, ProblemSolution, SolvedProblem } from '../types';
import { GeminiService } from '../services/geminiService';

interface ProblemSolverProps {
  onMarkSolved: (problem: Omit<SolvedProblem, 'id' | 'solvedAt'>) => void;
  solvedProblems: SolvedProblem[];
  initialQuery?: string;
  initialDifficulty?: Difficulty;
}

export const ProblemSolver: React.FC<ProblemSolverProps> = ({
  onMarkSolved,
  solvedProblems,
  initialQuery,
  initialDifficulty,
}) => {
  const [query, setQuery] = useState<string>(initialQuery || 'Two Sum');
  const [language, setLanguage] = useState<Language>('Java');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty || 'Easy');
  const [loading, setLoading] = useState<boolean>(false);
  const [solution, setSolution] = useState<ProblemSolution | null>(null);
  const [activeTab, setActiveTab] = useState<'intuition' | 'code' | 'dryrun' | 'complexity' | 'tips'>('intuition');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [personalNotes, setPersonalNotes] = useState<string>('');

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      if (initialDifficulty) setDifficulty(initialDifficulty);
      handleSolve(initialQuery);
    }
  }, [initialQuery, initialDifficulty]);

  const quickPicks = [
    { title: 'Two Sum', diff: 'Easy', topic: 'Arrays & Hashing' },
    { title: 'Valid Parentheses', diff: 'Easy', topic: 'Stack' },
    { title: 'LRU Cache', diff: 'Medium', topic: 'Design & Doubly Linked List' },
    { title: 'Trapping Rain Water', diff: 'Hard', topic: 'Two Pointers' },
    { title: 'Coin Change', diff: 'Medium', topic: 'Dynamic Programming' },
    { title: 'Course Schedule', diff: 'Medium', topic: 'Graphs & Topological Sort' },
  ];

  const handleSolve = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await GeminiService.solveProblem(searchQuery, language, difficulty);
      setSolution(res);
      setPersonalNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCompleteChallenge = () => {
    if (!solution) return;
    onMarkSolved({
      title: solution.title,
      topic: solution.topic,
      difficulty: solution.difficulty,
      language: solution.language,
      timeComplexity: solution.timeComplexity,
      spaceComplexity: solution.spaceComplexity,
      codeSnippet: solution.code,
      notes: personalNotes || solution.summary,
    });

    // Fire joyful confetti animation
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const isAlreadySolved = solution && solvedProblems.some(p => p.title.toLowerCase() === solution.title.toLowerCase());

  return (
    <div className="space-y-6">
      
      {/* Search and Input Console */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Algorithm Coach & Solver
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Enter any LeetCode or DSA problem for rigorous intuition, optimal code, and dry runs.
            </p>
          </div>

          {/* Quick Language & Difficulty Pickers */}
          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="C++">C++</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Kotlin">Kotlin</option>
              <option value="Go">Go</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
            placeholder="e.g. Two Sum, Subarray Sum Equals K, LRU Cache..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            onClick={() => handleSolve()}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain & Solve</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Pick Pills */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mr-1">Trending:</span>
          {quickPicks.map((pick) => (
            <button
              key={pick.title}
              onClick={() => {
                setQuery(pick.title);
                setDifficulty(pick.diff as Difficulty);
                handleSolve(pick.title);
              }}
              className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg transition border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
            >
              {pick.title}
            </button>
          ))}
        </div>

      </div>

      {/* Solution Panel */}
      {solution && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Solution Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  solution.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  solution.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {solution.difficulty}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {solution.topic}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {solution.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
                {solution.summary}
              </p>
            </div>

            {/* Actions: LeetCode & Mark Solved */}
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              {solution.leetCodeUrl && (
                <a
                  href={solution.leetCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <span>Open on LeetCode</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={handleCompleteChallenge}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                  isAlreadySolved
                    ? 'bg-emerald-600 text-slate-900 shadow-sm'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-slate-900 shadow-md shadow-indigo-600/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAlreadySolved ? 'Solved (Update)' : 'Mark Solved (+Streak)'}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-slate-50/60 dark:bg-slate-950/40 overflow-x-auto">
            {[
              { id: 'intuition', label: 'Intuition & Approach', icon: Lightbulb },
              { id: 'code', label: 'Optimal Code', icon: Code2 },
              { id: 'dryrun', label: 'Interactive Dry Run', icon: Cpu },
              { id: 'complexity', label: 'Time & Space', icon: Clock },
              { id: 'tips', label: 'Edge Cases & Tips', icon: ShieldAlert },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="p-5 sm:p-6">
            
            {/* 1. Intuition */}
            {activeTab === 'intuition' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                    Core Algorithmic Epiphany
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {solution.intuition}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
                    Step-by-Step Strategy
                  </h3>
                  <div className="space-y-2">
                    {solution.approach.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Code */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Language: <span className="text-indigo-600 dark:text-indigo-400">{solution.language}</span>
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-200 leading-relaxed">
                  <pre>{solution.code}</pre>
                </div>
              </div>
            )}

            {/* 3. Dry Run */}
            {activeTab === 'dryrun' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Walkthrough simulation demonstrating variable state transitions across loop iterations:
                </p>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="p-3">Step</th>
                        <th className="p-3">Iteration / Action</th>
                        <th className="p-3">State & Variables</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {solution.dryRunSteps.map((s) => (
                        <tr key={s.step} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">#{s.step}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{s.description}</td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/50">{s.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Complexity */}
            {activeTab === 'complexity' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Time Complexity</span>
                  </div>
                  <div className="text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
                    {solution.timeComplexity}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Optimal single pass or logarithmic structure ensuring sub-second execution on large test cases.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-1">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Space Complexity</span>
                  </div>
                  <div className="text-lg font-mono font-black text-slate-900 dark:text-white mt-1">
                    {solution.spaceComplexity}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Auxiliary memory allocated for hash table, recursion stack, or sliding window bounds.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Edge Cases & Tips */}
            {activeTab === 'tips' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
                    Critical Edge Cases to Test
                  </h4>
                  <div className="space-y-1.5">
                    {solution.edgeCases.map((ec, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{ec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                    Staff Interview Tips
                  </h4>
                  <div className="space-y-1.5">
                    {solution.interviewTips.map((tip, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Personal Revision Notes Input */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Add Personal Revision Notes for this Problem
            </label>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="e.g. Remember to watch out for duplicate keys in the hash map..."
              rows={2}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>
      )}

    </div>
  );
};
