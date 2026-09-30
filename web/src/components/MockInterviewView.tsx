import React, { useState, useEffect, useRef } from 'react';
import { Mic, Timer, Flag, Award, History, ExternalLink, Play } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Difficulty, MockProblem, MockResult } from '../types';

const BANK: MockProblem[] = [
  {
    id: 'm1', title: 'Two Sum', difficulty: 'Easy',
    statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Exactly one valid answer exists.'],
    leetCodeUrl: 'https://leetcode.com/problems/two-sum/',
  },
  {
    id: 'm2', title: 'Valid Parentheses', difficulty: 'Easy',
    statement: 'Given a string s containing just the characters ( ) { } [ ], determine if the input string is valid. A string is valid if open brackets are closed by the same type and in the correct order.',
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only.'],
    leetCodeUrl: 'https://leetcode.com/problems/valid-parentheses/',
  },
  {
    id: 'm3', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy',
    statement: 'You are given an array prices where prices[i] is the price of a stock on day i. Choose a single day to buy and a later day to sell to maximize profit. Return the maximum profit (0 if impossible).',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy day 2 (1), sell day 5 (6).' },
      { input: 'prices = [7,6,4,3,1]', output: '0' },
    ],
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    leetCodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
  },
  {
    id: 'm4', title: 'Valid Palindrome', difficulty: 'Easy',
    statement: 'A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.',
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 2×10⁵'],
    leetCodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
  },
  {
    id: 'm5', title: 'Binary Search', difficulty: 'Easy',
    statement: 'Given a sorted (ascending) integer array nums and a target, return its index, or -1 if absent. Your solution must run in O(log n) time.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'Array is sorted ascending, all elements distinct.'],
    leetCodeUrl: 'https://leetcode.com/problems/binary-search/',
  },
  {
    id: 'm6', title: 'Climbing Stairs', difficulty: 'Easy',
    statement: 'You are climbing a staircase of n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you reach the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
    ],
    constraints: ['1 ≤ n ≤ 45'],
    leetCodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
  },
  {
    id: 'm7', title: 'Group Anagrams', difficulty: 'Medium',
    statement: 'Given an array of strings strs, group the anagrams together. Return the answer in any order. An anagram is a word formed by rearranging another word\u2019s letters.',
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    constraints: ['1 ≤ strs.length ≤ 10⁴', '0 ≤ strs[i].length ≤ 100'],
    leetCodeUrl: 'https://leetcode.com/problems/group-anagrams/',
  },
  {
    id: 'm8', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium',
    statement: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc"' },
      { input: 's = "bbbbb"', output: '1' },
    ],
    constraints: ['0 ≤ s.length ≤ 5×10⁴'],
    leetCodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
  },
  {
    id: 'm9', title: 'Number of Islands', difficulty: 'Medium',
    statement: 'Given an m×n 2D binary grid of "1"s (land) and "0"s (water), return the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.',
    examples: [
      { input: 'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]', output: '2' },
    ],
    constraints: ['m,n ≤ 300'],
    leetCodeUrl: 'https://leetcode.com/problems/number-of-islands/',
  },
  {
    id: 'm10', title: 'LRU Cache', difficulty: 'Medium',
    statement: 'Design a data structure for a Least Recently Used (LRU) cache supporting get(key) and put(key, value) in O(1) average time. When capacity is exceeded, evict the least recently used entry.',
    examples: [
      { input: '["LRUCache","put","put","get","put","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2]]', output: '[null,null,null,1,null,-1]', explanation: 'Key 2 was evicted by put(3,3).' },
    ],
    constraints: ['1 ≤ capacity ≤ 3000', 'Up to 3×10⁵ operations.'],
    leetCodeUrl: 'https://leetcode.com/problems/lru-cache/',
  },
  {
    id: 'm11', title: 'Coin Change', difficulty: 'Medium',
    statement: 'You are given coins of different denominations and a total amount. Compute the fewest number of coins needed to make up that amount. Return -1 if it cannot be made.',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '5+5+1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
    ],
    constraints: ['1 ≤ coins.length ≤ 12', '0 ≤ amount ≤ 10⁴'],
    leetCodeUrl: 'https://leetcode.com/problems/coin-change/',
  },
  {
    id: 'm12', title: 'Trapping Rain Water', difficulty: 'Hard',
    statement: 'Given n non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
    ],
    constraints: ['n ≤ 2×10⁴'],
    leetCodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
  },
];

const RUBRIC = [
  { key: 'correctness', label: 'Correctness', hint: 'Does the solution handle the general case?' },
  { key: 'complexity', label: 'Optimal complexity', hint: 'Best achievable Big-O for time & space?' },
  { key: 'edgeCases', label: 'Edge cases', hint: 'Empty input, duplicates, overflow, off-by-one?' },
  { key: 'communication', label: 'Communication', hint: 'Clear thinking aloud, trade-offs discussed?' },
] as const;

type Phase = 'setup' | 'live' | 'assess';

interface MockInterviewViewProps {
  onXP: () => void;
}

export const MockInterviewView: React.FC<MockInterviewViewProps> = ({ onXP }) => {
  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty | 'Mixed'>('Mixed');
  const [durationMin, setDurationMin] = useState<30 | 45>(30);
  const [problem, setProblem] = useState<MockProblem | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ correctness: 3, complexity: 3, edgeCases: 3, communication: 3 });
  const [history, setHistory] = useState<MockResult[]>(() => StorageService.getMockHistory());
  const [lastSaved, setLastSaved] = useState<MockResult | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 'live') return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1));
    }, 1000);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [phase]);

  // Time's up → move to self-assessment (kept outside the updater for StrictMode safety)
  useEffect(() => {
    if (phase === 'live' && secondsLeft === 0) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setPhase('assess');
    }
  }, [phase, secondsLeft]);

  const start = () => {
    const pool = difficulty === 'Mixed' ? BANK : BANK.filter(p => p.difficulty === difficulty);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setProblem(pick);
    setSecondsLeft(durationMin * 60);
    setLastSaved(null);
    setPhase('live');
  };

  const endInterview = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setPhase('assess');
  };

  const submitAssessment = () => {
    if (!problem) return;
    const total = RUBRIC.reduce((acc, r) => acc + (scores[r.key] || 0), 0);
    const xp = total * 10;
    const saved = StorageService.saveMockResult({
      problemTitle: problem.title,
      difficulty: problem.difficulty,
      durationMin,
      rubric: {
        correctness: scores.correctness,
        complexity: scores.complexity,
        edgeCases: scores.edgeCases,
        communication: scores.communication,
      },
      totalScore: total,
      xpEarned: xp,
    });
    setHistory(StorageService.getMockHistory());
    setLastSaved(saved);
    onXP();
    setPhase('setup');
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const urgent = secondsLeft < 300;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mic className="w-5 h-5 text-indigo-500" />
          Mock Interview Mode
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Simulate real interview pressure: random problem, ticking clock, then an honest self-assessment rubric. Score up to <span className="font-bold text-amber-600 dark:text-amber-400">200 XP</span> per session.
        </p>
      </div>

      {phase === 'setup' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          {lastSaved && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2">
              <Award className="w-4 h-4" />
              Session saved: {lastSaved.problemTitle} — {lastSaved.totalScore}/20 → +{lastSaved.xpEarned} XP
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {(['Mixed', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    difficulty === d ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Time limit</p>
            <div className="flex gap-2">
              {([30, 45] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setDurationMin(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    durationMin === m ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" /> {m} min
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={start}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-md shadow-indigo-500/25"
          >
            <Play className="w-4 h-4" /> Start mock interview
          </button>

          {/* History */}
          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-indigo-500" /> Past sessions ({history.length})
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">No mock interviews yet — run your first one above.</p>
            ) : (
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{h.problemTitle}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {new Date(h.completedAt).toLocaleDateString()} · {h.durationMin} min · C{h.rubric.correctness} O{h.rubric.complexity} E{h.rubric.edgeCases} T{h.rubric.communication}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full diff-badge-${h.difficulty.toLowerCase()}`}>{h.difficulty}</span>
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{h.totalScore}/20</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'live' && problem && (
        <div className="space-y-4">
          <div className={`sticky top-16 z-10 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm ${urgent ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
            <div className="flex items-center gap-2">
              <Timer className={`w-4 h-4 ${urgent ? 'text-rose-500 animate-pulse' : 'text-indigo-500'}`} />
              <span className={`font-mono text-lg font-bold ${urgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{fmt(secondsLeft)}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">remaining</span>
            </div>
            <button onClick={endInterview} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition">
              <Flag className="w-3.5 h-3.5" /> End & self-assess
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full diff-badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
              <a href={problem.leetCodeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
                <ExternalLink className="w-3 h-3" /> Open on LeetCode
              </a>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{problem.title}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{problem.statement}</p>
            <div className="mt-4 space-y-2">
              {problem.examples.map((ex, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-700 dark:text-slate-200">
                  <p><span className="font-bold text-slate-500 dark:text-slate-400">Example {i + 1}:</span></p>
                  <p className="mt-1"><span className="text-slate-500">Input:</span> {ex.input}</p>
                  <p><span className="text-slate-500">Output:</span> {ex.output}</p>
                  {ex.explanation && <p className="text-slate-500 mt-0.5">Explanation: {ex.explanation}</p>}
                </div>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Constraints</p>
              <ul className="list-disc list-inside text-[11px] font-mono text-slate-600 dark:text-slate-300 space-y-0.5">
                {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div className="mt-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 p-3 text-[11px] text-indigo-900 dark:text-indigo-200">
              <strong>Interview protocol:</strong> think out loud, state your approach before coding, give time/space complexity unprompted, then walk through an example. The clock is real — treat it like one.
            </div>
          </div>
        </div>
      )}

      {phase === 'assess' && problem && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Self-assessment</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Be honest — the rubric is where the learning happens. <span className="font-mono">{problem.title}</span></p>
          </div>
          {RUBRIC.map(r => (
            <div key={r.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{r.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.hint}</p>
                </div>
                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">{scores[r.key]}/5</span>
              </div>
              <input
                type="range" min={1} max={5} step={1}
                value={scores[r.key]}
                onChange={e => setScores(s => ({ ...s, [r.key]: Number(e.target.value) }))}
                className="w-full accent-indigo-600"
              />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-4 py-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Total → XP</span>
            <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
              {RUBRIC.reduce((a, r) => a + (scores[r.key] || 0), 0)}/20 → +{RUBRIC.reduce((a, r) => a + (scores[r.key] || 0), 0) * 10} XP
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={submitAssessment} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-md shadow-indigo-500/25">
              <Award className="w-4 h-4" /> Save session
            </button>
            <button onClick={() => setPhase('setup')} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
