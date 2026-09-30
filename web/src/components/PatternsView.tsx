import React, { useState, useEffect, useRef } from 'react';
import { Shapes, ChevronDown, ExternalLink, Zap, TrendingUp } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface Pattern {
  id: string;
  name: string;
  when: string;
  template: string;
  problems: Array<{ title: string; url: string }>;
}

const PATTERNS: Pattern[] = [
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    when: 'Contiguous subarray/substring problems — longest, shortest, or constrained windows. Look for "subarray" + a condition on the window.',
    template: `left = 0
for right in range(n):
    window.add(a[right])
    while invalid(window):
        window.remove(a[left]); left += 1
    best = max(best, right - left + 1)`,
    problems: [
      { title: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/' },
      { title: 'Max Consecutive Ones III', url: 'https://leetcode.com/problems/max-consecutive-ones-iii/' },
    ],
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    when: 'Sorted arrays or in-place rearrangement — pairs with a target, removing duplicates, partitioning around a condition.',
    template: `l, r = 0, n - 1
while l < r:
    s = a[l] + a[r]
    if s == target: return [l, r]
    elif s < target: l += 1
    else: r -= 1`,
    problems: [
      { title: 'Two Sum II — Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/' },
      { title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/' },
    ],
  },
  {
    id: 'fast-slow',
    name: 'Fast & Slow Pointers',
    when: 'Linked list cycles, middle of list, or happy-number style sequences where state repeats. Tortoise & hare.',
    template: `slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow == fast: return True  # cycle
return False`,
    problems: [
      { title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/' },
      { title: 'Middle of the Linked List', url: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
      { title: 'Happy Number', url: 'https://leetcode.com/problems/happy-number/' },
    ],
  },
  {
    id: 'merge-intervals',
    name: 'Merge Intervals',
    when: 'Overlapping ranges — meeting rooms, insert/merge schedules. Always sort by start first.',
    template: `intervals.sort(key=lambda x: x[0])
merged = [intervals[0]]
for s, e in intervals[1:]:
    if s <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], e)
    else: merged.append([s, e])`,
    problems: [
      { title: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/' },
      { title: 'Insert Interval', url: 'https://leetcode.com/problems/insert-interval/' },
      { title: 'Non-overlapping Intervals', url: 'https://leetcode.com/problems/non-overlapping-intervals/' },
    ],
  },
  {
    id: 'cyclic-sort',
    name: 'Cyclic Sort',
    when: 'Array of numbers in range [1..n] or [0..n-1] — find missing/duplicate numbers in O(n) time, O(1) space.',
    template: `i = 0
while i < n:
    j = a[i] - 1          # correct position
    if a[i] != a[j]: swap(a, i, j)
    else: i += 1
# now a[i] != i+1  →  missing/duplicate`,
    problems: [
      { title: 'Missing Number', url: 'https://leetcode.com/problems/missing-number/' },
      { title: 'Find the Duplicate Number', url: 'https://leetcode.com/problems/find-the-duplicate-number/' },
      { title: 'Find All Numbers Disappeared in an Array', url: 'https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/' },
    ],
  },
  {
    id: 'll-reversal',
    name: 'In-place Linked List Reversal',
    when: 'Reverse whole list or sub-lists, k-group reversals, palindrome checks. Three pointers: prev, curr, next.',
    template: `prev, curr = None, head
while curr:
    nxt = curr.next
    curr.next = prev
    prev, curr = curr, nxt
return prev`,
    problems: [
      { title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { title: 'Reverse Linked List II', url: 'https://leetcode.com/problems/reverse-linked-list-ii/' },
      { title: 'Palindrome Linked List', url: 'https://leetcode.com/problems/palindrome-linked-list/' },
    ],
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    when: 'Shortest path in unweighted graphs/grids, level-order traversal, "minimum steps" problems.',
    template: `from collections import deque
q = deque([start]); seen = {start}; dist = 0
while q:
    for _ in range(len(q)):
        u = q.popleft()
        if u == target: return dist
        for v in neighbors(u):
            if v not in seen:
                seen.add(v); q.append(v)
    dist += 1`,
    problems: [
      { title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/' },
      { title: 'Rotting Oranges', url: 'https://leetcode.com/problems/rotting-oranges/' },
      { title: 'Word Ladder', url: 'https://leetcode.com/problems/word-ladder/' },
    ],
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    when: 'Explore all paths — trees, connected components, topological sort. Recursion or explicit stack.',
    template: `def dfs(u):
    seen.add(u)
    for v in neighbors(u):
        if v not in seen: dfs(v)

# trees:
def dfs(node):
    if not node: return
    dfs(node.left); dfs(node.right)`,
    problems: [
      { title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/' },
      { title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/' },
      { title: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/' },
    ],
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    when: '"Find all …" — permutations, combinations, subsets, N-queens, Sudoku. Choose → explore → unchoose.',
    template: `def backtrack(path, start):
    if done(path): ans.append(path[:]); return
    for i in range(start, n):
        path.append(a[i])      # choose
        backtrack(path, i + 1) # explore
        path.pop()             # unchoose`,
    problems: [
      { title: 'Subsets', url: 'https://leetcode.com/problems/subsets/' },
      { title: 'Permutations', url: 'https://leetcode.com/problems/permutations/' },
      { title: 'Combination Sum', url: 'https://leetcode.com/problems/combination-sum/' },
    ],
  },
  {
    id: 'dp',
    name: 'Dynamic Programming',
    when: 'Overlapping subproblems + optimal substructure — "min/max ways/count". Define dp[i] precisely, then find the recurrence.',
    template: `# 1D: dp[i] = best up to i
dp = [0] * (n + 1); dp[0] = base
for i in range(1, n + 1):
    dp[i] = min(dp[i-1] + cost1,
                dp[i-2] + cost2)

# 2D knapsack: dp[i][w] = max value`,
    problems: [
      { title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/' },
      { title: 'Longest Increasing Subsequence', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
    ],
  },
  {
    id: 'greedy',
    name: 'Greedy',
    when: 'Locally optimal choices are globally optimal — intervals, jumps, partitioning. Prove the greedy choice!',
    template: `# Jump Game: track farthest reach
reach = 0
for i, jump in enumerate(a):
    if i > reach: return False
    reach = max(reach, i + jump)
return True`,
    problems: [
      { title: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/' },
      { title: 'Gas Station', url: 'https://leetcode.com/problems/gas-station/' },
      { title: 'Partition Labels', url: 'https://leetcode.com/problems/partition-labels/' },
    ],
  },
  {
    id: 'topk-heap',
    name: 'Top-K Heap',
    when: 'K largest/smallest/frequent elements, running medians, merge K sorted lists. Heap of size K.',
    template: `import heapq
heap = []
for x in stream:
    heapq.heappush(heap, x)
    if len(heap) > k: heapq.heappop(heap)
# heap holds the k largest`,
    problems: [
      { title: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { title: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { title: 'Find Median from Data Stream', url: 'https://leetcode.com/problems/find-median-from-data-stream/' },
    ],
  },
  {
    id: 'trie',
    name: 'Trie (Prefix Tree)',
    when: 'Prefix search, autocomplete, word games. O(L) insert/search where L = word length.',
    template: `class Trie:
    def __init__(self):
        self.next = {}; self.end = False
    def insert(self, w):
        node = self
        for ch in w:
            node = node.next.setdefault(ch, Trie())
        node.end = True`,
    problems: [
      { title: 'Implement Trie (Prefix Tree)', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
      { title: 'Word Search II', url: 'https://leetcode.com/problems/word-search-ii/' },
      { title: 'Design Add and Search Words', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' },
    ],
  },
  {
    id: 'union-find',
    name: 'Union Find (DSU)',
    when: 'Connectivity queries — components, cycles in undirected graphs, "are these connected?". Path compression + union by rank.',
    template: `parent = list(range(n))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]; x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb: parent[ra] = rb`,
    problems: [
      { title: 'Number of Provinces', url: 'https://leetcode.com/problems/number-of-provinces/' },
      { title: 'Redundant Connection', url: 'https://leetcode.com/problems/redundant-connection/' },
      { title: 'Accounts Merge', url: 'https://leetcode.com/problems/accounts-merge/' },
    ],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    when: 'Sorted data — or a monotonic predicate ("first bad", "minimum feasible"). Answer often hides in "sorted" + "log".',
    template: `lo, hi = 0, n - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == t: return mid
    elif a[mid] < t: lo = mid + 1
    else: hi = mid - 1
return -1`,
    problems: [
      { title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
      { title: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { title: 'Koko Eating Bananas', url: 'https://leetcode.com/problems/koko-eating-bananas/' },
    ],
  },
];

const BIG_O_ROWS = [
  { notation: 'O(1)', name: 'Constant', example: 'Hash map lookup, array index', color: '#10b981' },
  { notation: 'O(log n)', name: 'Logarithmic', example: 'Binary search', color: '#22d3ee' },
  { notation: 'O(n)', name: 'Linear', example: 'Single pass, two pointers', color: '#818cf8' },
  { notation: 'O(n log n)', name: 'Linearithmic', example: 'Merge sort, heap ops × n', color: '#e879f9' },
  { notation: 'O(n²)', name: 'Quadratic', example: 'Nested loops, bubble sort', color: '#fbbf24' },
  { notation: 'O(2ⁿ)', name: 'Exponential', example: 'Naive recursion, subsets', color: '#fb7185' },
];

function BigOChart({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = 640, H = 360;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const padL = 44, padR = 14, padT = 18, padB = 34;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const N = 64;
    const fns: Array<{ fn: (n: number) => number; color: string; label: string }> = [
      { fn: () => 1, color: '#10b981', label: 'O(1)' },
      { fn: n => Math.log2(n + 1), color: '#22d3ee', label: 'O(log n)' },
      { fn: n => n, color: '#818cf8', label: 'O(n)' },
      { fn: n => n * Math.log2(n + 1), color: '#e879f9', label: 'O(n log n)' },
      { fn: n => n * n, color: '#fbbf24', label: 'O(n²)' },
      { fn: n => Math.pow(2, n / 6), color: '#fb7185', label: 'O(2ⁿ)' },
    ];
    const maxY = N * N;

    const grid = dark ? 'rgba(148,163,184,0.14)' : 'rgba(100,116,139,0.18)';
    const axis = dark ? '#94a3b8' : '#64748b';

    ctx.strokeStyle = grid;
    ctx.fillStyle = axis;
    ctx.font = '10px "Fira Code", monospace';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(f => {
      const y = padT + plotH * (1 - f);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    });
    // axes
    ctx.strokeStyle = axis;
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
    ctx.fillText('n →', padL + plotW - 24, padT + plotH + 22);
    ctx.fillText('ops', 6, padT + 8);

    fns.forEach(({ fn, color, label }) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let n = 1; n <= N; n++) {
        const x = padL + (plotW * n) / N;
        const y = padT + plotH * (1 - Math.min(1, fn(n) / maxY));
        if (n === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // end label
      ctx.fillStyle = color;
      ctx.font = 'bold 10px "Fira Code", monospace';
      const yEnd = padT + plotH * (1 - Math.min(1, fn(N) / maxY));
      ctx.fillText(label, padL + plotW - 52, Math.max(padT + 8, Math.min(padT + plotH - 4, yEnd - 5)));
    });
  }, [dark]);

  return <canvas ref={ref} className="w-full" aria-label="Big-O complexity growth chart" />;
}

interface PatternsViewProps {
  onXP: () => void;
  darkMode: boolean;
}

export const PatternsView: React.FC<PatternsViewProps> = ({ onXP, darkMode }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [viewed, setViewed] = useState<string[]>(() => StorageService.getViewedPatterns());

  const toggle = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
    if (!viewed.includes(id)) {
      const isNew = StorageService.markPatternViewed(id);
      if (isNew) {
        setViewed(StorageService.getViewedPatterns());
        onXP();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shapes className="w-5 h-5 text-indigo-500" />
          15 Core DSA Patterns
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Interviewers test <em>patterns</em>, not problems. Open a card to study its template — first view of each earns <span className="font-bold text-amber-600 dark:text-amber-400">+10 XP</span>.
          <span className="ml-2 font-mono">{viewed.length}/15 mastered</span>
        </p>
        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${(viewed.length / 15) * 100}%` }} />
        </div>
      </div>

      {/* Pattern cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PATTERNS.map(p => {
          const open = openId === p.id;
          const seen = viewed.includes(p.id);
          return (
            <div key={p.id} className={`bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden transition ${open ? 'border-indigo-300 dark:border-indigo-700' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700'}`}>
              <button onClick={() => toggle(p.id)} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${seen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                    {seen ? '✓' : p.id.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <strong className="text-indigo-600 dark:text-indigo-400">When to use: </strong>{p.when}
                  </p>
                  <pre className="text-[11px] font-mono leading-relaxed bg-slate-950 text-slate-100 dark:bg-black/40 dark:text-slate-200 rounded-xl p-3 overflow-x-auto border border-slate-800">
                    {p.template}
                  </pre>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Practice on LeetCode</p>
                    <div className="space-y-1">
                      {p.problems.map(pr => (
                        <a key={pr.title} href={pr.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{pr.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Big-O cheat sheet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Big-O Cheat Sheet
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">Growth rates every interviewer expects you to rattle off — with a live growth chart.</p>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 pr-3 font-mono">Complexity</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2">Typical example</th>
                </tr>
              </thead>
              <tbody>
                {BIG_O_ROWS.map(r => (
                  <tr key={r.notation} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-2 pr-3 font-mono font-bold" style={{ color: r.color }}>{r.notation}</td>
                    <td className="py-2 pr-3 font-semibold text-slate-700 dark:text-slate-200">{r.name}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{r.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <BigOChart dark={darkMode} />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono text-center">operations vs input size n (O(2ⁿ) scaled to fit)</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-2">
          <Zap className="w-4 h-4 shrink-0" />
          Interview tip: always state time AND space complexity unprompted — then offer the trade-off ("we can drop to O(1) space with two pointers, at the cost of mutating input").
        </div>
      </div>
    </div>
  );
};
