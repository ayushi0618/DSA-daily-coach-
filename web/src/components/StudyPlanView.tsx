import React, { useState } from 'react';
import { CalendarCheck, RefreshCw, ExternalLink, CheckCircle2, Circle, Sparkles, Award } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Difficulty, SolvedProblem, StudyPlanDay } from '../types';

interface TopicBank {
  topic: string;
  problems: Array<{ title: string; difficulty: Difficulty; url: string }>;
}

const TOPIC_BANKS: TopicBank[] = [
  {
    topic: 'Arrays & Hashing',
    problems: [
      { title: 'Two Sum', difficulty: 'Easy', url: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Contains Duplicate', difficulty: 'Easy', url: 'https://leetcode.com/problems/contains-duplicate/' },
      { title: 'Group Anagrams', difficulty: 'Medium', url: 'https://leetcode.com/problems/group-anagrams/' },
    ],
  },
  {
    topic: 'Two Pointers',
    problems: [
      { title: 'Valid Palindrome', difficulty: 'Easy', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { title: 'Two Sum II — Input Array Is Sorted', difficulty: 'Medium', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { title: 'Container With Most Water', difficulty: 'Medium', url: 'https://leetcode.com/problems/container-with-most-water/' },
    ],
  },
  {
    topic: 'Sliding Window',
    problems: [
      { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { title: 'Minimum Window Substring', difficulty: 'Hard', url: 'https://leetcode.com/problems/minimum-window-substring/' },
    ],
  },
  {
    topic: 'Binary Search',
    problems: [
      { title: 'Binary Search', difficulty: 'Easy', url: 'https://leetcode.com/problems/binary-search/' },
      { title: 'Search in Rotated Sorted Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { title: 'Koko Eating Bananas', difficulty: 'Medium', url: 'https://leetcode.com/problems/koko-eating-bananas/' },
    ],
  },
  {
    topic: 'Linked List',
    problems: [
      { title: 'Reverse Linked List', difficulty: 'Easy', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { title: 'Linked List Cycle', difficulty: 'Easy', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { title: 'Reorder List', difficulty: 'Medium', url: 'https://leetcode.com/problems/reorder-list/' },
    ],
  },
  {
    topic: 'Trees',
    problems: [
      { title: 'Invert Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/invert-binary-tree/' },
      { title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { title: 'Lowest Common Ancestor of a BST', difficulty: 'Medium', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
    ],
  },
  {
    topic: 'Graphs (BFS/DFS)',
    problems: [
      { title: 'Number of Islands', difficulty: 'Medium', url: 'https://leetcode.com/problems/number-of-islands/' },
      { title: 'Clone Graph', difficulty: 'Medium', url: 'https://leetcode.com/problems/clone-graph/' },
      { title: 'Course Schedule', difficulty: 'Medium', url: 'https://leetcode.com/problems/course-schedule/' },
    ],
  },
  {
    topic: 'Dynamic Programming',
    problems: [
      { title: 'Climbing Stairs', difficulty: 'Easy', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { title: 'House Robber', difficulty: 'Medium', url: 'https://leetcode.com/problems/house-robber/' },
      { title: 'Coin Change', difficulty: 'Medium', url: 'https://leetcode.com/problems/coin-change/' },
    ],
  },
  {
    topic: 'Heap / Priority Queue',
    problems: [
      { title: 'Kth Largest Element in an Array', difficulty: 'Medium', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { title: 'Top K Frequent Elements', difficulty: 'Medium', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { title: 'Find Median from Data Stream', difficulty: 'Hard', url: 'https://leetcode.com/problems/find-median-from-data-stream/' },
    ],
  },
  {
    topic: 'Backtracking',
    problems: [
      { title: 'Subsets', difficulty: 'Medium', url: 'https://leetcode.com/problems/subsets/' },
      { title: 'Combination Sum', difficulty: 'Medium', url: 'https://leetcode.com/problems/combination-sum/' },
      { title: 'Word Search', difficulty: 'Medium', url: 'https://leetcode.com/problems/word-search/' },
    ],
  },
];

const DEFAULT_TOPICS = ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Linked List', 'Trees', 'Dynamic Programming'];

function analyzeWeakTopics(solved: SolvedProblem[]): string[] {
  const counts = new Map<string, number>();
  TOPIC_BANKS.forEach(t => counts.set(t.topic, 0));
  solved.forEach(p => {
    const topic = p.topic.toLowerCase();
    TOPIC_BANKS.forEach(b => {
      const key = b.topic.toLowerCase().split(' ')[0];
      if (topic.includes(key) || b.topic.toLowerCase().includes(topic.split(' ')[0])) {
        counts.set(b.topic, (counts.get(b.topic) || 0) + 1);
      }
    });
  });
  return [...counts.entries()].sort((a, b) => a[1] - b[1]).map(([t]) => t);
}

interface StudyPlanViewProps {
  solvedProblems: SolvedProblem[];
  onXP: () => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({ solvedProblems, onXP }) => {
  const [plan, setPlan] = useState<StudyPlanDay[] | null>(() => StorageService.getStudyPlan());
  const [lastWeakTopics, setLastWeakTopics] = useState<string[]>(() => analyzeWeakTopics(solvedProblems).slice(0, 3));

  const generate = () => {
    // Re-analyze at generation time so newly solved problems count
    const topics = analyzeWeakTopics(solvedProblems);
    const ordered = topics.length > 0 ? topics : DEFAULT_TOPICS;
    const days: StudyPlanDay[] = [];
    for (let d = 0; d < 7; d++) {
      const topic = ordered[d % ordered.length];
      const bank = TOPIC_BANKS.find(b => b.topic === topic) || TOPIC_BANKS[0];
      days.push({
        day: d + 1,
        topic: bank.topic,
        problems: bank.problems,
        done: false,
      });
    }
    StorageService.saveStudyPlan(days);
    setPlan(days);
    setLastWeakTopics(ordered.slice(0, 3));
  };

  const toggleDay = (day: number) => {
    const updated = StorageService.toggleStudyPlanDay(day);
    if (updated) {
      setPlan(updated);
      onXP();
    }
  };

  const doneCount = plan?.filter(d => d.done).length || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-500" />
            Your 7-Day Study Plan
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {plan
              ? `Targeting your weakest topics first. Each completed day earns +30 XP.`
              : 'Generated from your solve history — weakest topics get priority.'}
          </p>
        </div>
        <button
          onClick={generate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/25 shrink-0"
        >
          {plan ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          {plan ? 'Regenerate plan' : 'Generate my plan'}
        </button>
      </div>

      {!plan && (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center">
          <CalendarCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No plan yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {solvedProblems.length > 0
              ? `We've analyzed your ${solvedProblems.length} solved problems${lastWeakTopics.length > 0 ? `. Your weakest areas: ${lastWeakTopics.join(', ')}.` : '.'}`
              : 'As a new learner we\u2019ll start you with the highest-ROI fundamentals.'}
          </p>
        </div>
      )}

      {plan && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all" style={{ width: `${(doneCount / 7) * 100}%` }} />
            </div>
            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{doneCount}/7 days</span>
          </div>

          <div className="space-y-3">
            {plan.map(d => (
              <div
                key={d.day}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 transition ${d.done ? 'border-emerald-300 dark:border-emerald-800 opacity-90' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${d.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                      D{d.day}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${d.done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{d.topic}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{d.problems.length} problems</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDay(d.day)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition shrink-0"
                    title={d.done ? 'Mark as not done' : 'Mark day complete (+30 XP)'}
                  >
                    {d.done
                      ? <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Done</span>
                      : <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Circle className="w-4 h-4" /> Mark done</span>}
                  </button>
                </div>
                <div className="mt-3 grid sm:grid-cols-3 gap-2">
                  {d.problems.map(p => (
                    <a
                      key={p.title}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition group"
                    >
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{p.title}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded diff-badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {doneCount === 7 && (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl px-4 py-3">
              <Award className="w-4 h-4" />
              Week crushed! 7/7 days complete — regenerate for next week's plan.
            </div>
          )}
        </>
      )}
    </div>
  );
};
