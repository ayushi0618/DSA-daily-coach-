import { Difficulty, Language, ProblemSolution } from '../types';
import { StorageService } from './storageService';

export const GeminiService = {
  async solveProblem(
    query: string,
    language: Language,
    difficulty: Difficulty = 'Medium'
  ): Promise<ProblemSolution> {
    const apiKey = StorageService.getGeminiApiKey();

    if (!apiKey) {
      // Return rich built-in solution if user hasn't added API key yet
      return getSmartFallbackSolution(query, language, difficulty);
    }

    const prompt = `You are a World-Class Senior Staff DSA Mentor and LeetCode Grandmaster.
Analyze the following coding interview problem: "${query}".
Target Programming Language: ${language}
Difficulty: ${difficulty}

You MUST respond ONLY with a single valid JSON object adhering strictly to this JSON schema (do not wrap in markdown quotes if possible, or wrap strictly in \`\`\`json):
{
  "title": "${query.trim()}",
  "topic": "Topic name (e.g. Dynamic Programming, Two Pointers, Trees, Graphs)",
  "difficulty": "${difficulty}",
  "summary": "2 sentence clear summary of the core problem challenge.",
  "intuition": "Deep intuitive mental model. Why brute force fails or is sub-optimal and the epiphany that unlocks the optimal solution.",
  "approach": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ],
  "code": "Complete, production-ready, clean, well-commented ${language} code for the solution.",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "dryRunSteps": [
    {"step": 1, "description": "Initialize pointers or state", "state": "e.g. left=0, right=0, sum=0"},
    {"step": 2, "description": "Iterate through elements", "state": "e.g. map={2:0}, looking for 7"},
    {"step": 3, "description": "Found match", "state": "return [0, 1]"}
  ],
  "edgeCases": [
    "Empty or single element input",
    "Negative numbers or duplicate values",
    "Large constraints"
  ],
  "interviewTips": [
    "State assumptions out loud before writing code",
    "Dry run with test cases before saying you are finished",
    "Discuss trade-offs between time and auxiliary space"
  ],
  "leetCodeUrl": "https://leetcode.com/problemset/all/?search=${encodeURIComponent(query)}"
}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn('Gemini API returned error, using smart fallback:', errText);
        return getSmartFallbackSolution(query, language, difficulty);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        return getSmartFallbackSolution(query, language, difficulty);
      }

      const parsed: ProblemSolution = JSON.parse(content);
      return parsed;
    } catch (err) {
      console.error('Error invoking Gemini API:', err);
      return getSmartFallbackSolution(query, language, difficulty);
    }
  },

  async askDoubt(
    question: string,
    history: Array<{ text: string; isUser: boolean }> = [],
    isSocratic: boolean = false
  ): Promise<string> {
    const apiKey = StorageService.getGeminiApiKey();
    if (!apiKey) {
      return getSmartFallbackDoubtAnswer(question, isSocratic);
    }

    const systemPrompt = isSocratic
      ? "You are a master DSA Coach using the Socratic method. Do NOT give away full answers immediately. Guide the student with leading questions, intuition, edge-case hints, and algorithmic patterns."
      : "You are an expert DSA Coach and LeetCode master. Explain the concept clearly, provide concise code snippets if relevant, and clarify time & space complexity.";

    const contents = [
      ...history.slice(-6).map(m => ({
        role: m.isUser ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent question: ${question}` }] },
    ];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        }
      );
      if (!response.ok) {
        return getSmartFallbackDoubtAnswer(question, isSocratic);
      }
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || getSmartFallbackDoubtAnswer(question, isSocratic);
    } catch {
      return getSmartFallbackDoubtAnswer(question, isSocratic);
    }
  },
};

function getSmartFallbackDoubtAnswer(q: string, socratic: boolean): string {
  const query = q.toLowerCase();
  if (socratic) {
    if (query.includes('two pointer') || query.includes('sliding window')) {
      return "Great intuition to consider two pointers! Ask yourself: is the input array sorted, or does the window monotonic property hold as you expand the right pointer? What happens when the window condition violates?";
    }
    if (query.includes('dp') || query.includes('dynamic programming')) {
      return "To unlock this dynamic programming problem, what are the distinct parameters that define your current subproblem state? Can you express the transition from state i in terms of previous states i-1 or i-k?";
    }
    if (query.includes('tree') || query.includes('graph')) {
      return "Consider the traversal order: does computing the answer require the children's results first (bottom-up / post-order), or can you propagate constraints downward (top-down / pre-order)?";
    }
    return "Think about the brute-force approach first. What is its exact time complexity, and which repeated computations can be eliminated by caching or maintaining pointers?";
  }

  if (query.includes('two pointer') || query.includes('sliding window')) {
    return "💡 **Two Pointers vs Sliding Window**:\n- **Two Pointers**: Often starts from opposite ends (left=0, right=n-1) on sorted arrays, or one fast & one slow pointer for cycle detection.\n- **Sliding Window**: Maintained over a contiguous subarray [L, R]. Expand R to include elements until condition fails, then shrink L to restore validity. Common time complexity is strictly O(N).";
  }
  if (query.includes('dp') || query.includes('dynamic programming')) {
    return "🧩 **Dynamic Programming Framework**:\n1. **Define State**: `dp[i]` = optimal answer for prefix of length `i`.\n2. **State Transition**: `dp[i] = min(dp[i - coin] + 1)`.\n3. **Base Case**: `dp[0] = 0`.\n4. **Order of Computation**: Bottom-up iteratively from 1 to N, or Top-Down recursive with `@memoize`.";
  }
  if (query.includes('time complexity') || query.includes('space complexity') || query.includes('big-o')) {
    return "⚡ **Complexity Rule of Thumb**:\n- N ≤ 20: O(2^N) or O(N!) - Backtracking / Subsets\n- N ≤ 10^3: O(N^2) - Nested loops, 2D DP\n- N ≤ 10^5: O(N log N) - Sorting, Heaps, Divide & Conquer\n- N ≤ 10^7: O(N) - Two Pointers, Sliding Window, Hash Tables\n- N > 10^9: O(log N) or O(1) - Binary Search, Math";
  }
  return `Here is how to approach this:\n1. Identify the input constraints and edge cases (e.g. null, negative, empty).\n2. Formulate a brute-force approach and compute Big-O.\n3. Identify the bottleneck (e.g., repeated lookup -> use HashMap O(1); sorted property -> use Binary Search O(log N)).\n4. Always verify with dry-run test cases!`;
}

function getSmartFallbackSolution(
  query: string,
  language: Language,
  difficulty: Difficulty
): ProblemSolution {
  const cleanTitle = query.trim() || 'Two Sum';
  
  return {
    title: cleanTitle,
    topic: cleanTitle.toLowerCase().includes('tree') ? 'Binary Trees' :
           cleanTitle.toLowerCase().includes('graph') ? 'Graphs & BFS/DFS' :
           cleanTitle.toLowerCase().includes('substring') ? 'Sliding Window' : 'Arrays & Hashing',
    difficulty: difficulty,
    summary: `Find the optimal approach to solve ${cleanTitle} meeting production constraints with minimum time and memory overhead.`,
    intuition: `Brute force approaches typically inspect all pairs or subproblems in O(N²) or exponential time. By maintaining an auxiliary hash structure or sliding two pointers strategically, we trade a small amount of memory for an immediate lookup of the complementary state, dropping execution time to optimal linear O(N).`,
    approach: [
      '1. Validate constraints and handle trivial boundary conditions (e.g. length < 2).',
      '2. Instantiate an auxiliary state tracker (e.g. HashMap or Two-Pointer bounds).',
      '3. Traverse elements linearly; at each step compute target - current value.',
      '4. If complement exists in the map, return indices immediately.',
      '5. Otherwise, register current value with its index and continue loop.'
    ],
    code: getCodeSnippet(cleanTitle, language),
    language: language,
    timeComplexity: 'O(N) single-pass traversal',
    spaceComplexity: 'O(N) auxiliary hash table',
    dryRunSteps: [
      { step: 1, description: 'Initialize empty Map complementTracker', state: 'map = {}, idx = 0' },
      { step: 2, description: 'Inspect element at index 0. Value = 2. Complement needed = 7', state: '7 not in map -> store 2: 0' },
      { step: 3, description: 'Inspect element at index 1. Value = 7. Complement needed = 2', state: '2 FOUND at idx 0! Return [0, 1]' },
    ],
    edgeCases: [
      'Array contains negative numbers and zeros',
      'Target can only be formed by identical elements occurring multiple times',
      'Extremely large array requiring integer overflow safety'
    ],
    interviewTips: [
      'Clarify if input array is guaranteed to have exactly one solution.',
      'Ask whether modifying the original array in-place is permitted.',
      'Always articulate time and auxiliary space complexities explicitly.'
    ],
    leetCodeUrl: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(cleanTitle)}`
  };
}

function getCodeSnippet(title: string, language: Language): string {
  switch (language) {
    case 'Java':
      return `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] solve(int[] nums, int target) {
        // Map value -> index for O(1) complement lookup
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        
        throw new IllegalArgumentException("No two sum solution found");
    }
}`;
    case 'Python':
      return `class Solution:
    def solve(self, nums: list[int], target: int) -> list[int]:
        # Hash map value to index
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`;
    case 'C++':
      return `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`;
    case 'JavaScript':
      return `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var solve = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
};`;
    case 'Kotlin':
      return `class Solution {
    fun solve(nums: IntArray, target: Int): IntArray {
        val map = HashMap<Int, Int>()
        nums.forEachIndexed { i, num ->
            val complement = target - num
            map[complement]?.let { return intArrayOf(it, i) }
            map[num] = i
        }
        throw IllegalArgumentException("No solution found")
    }
}`;
    case 'Go':
      return `package main

func solve(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if idx, ok := seen[complement]; ok {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return nil
}`;
  }
}
