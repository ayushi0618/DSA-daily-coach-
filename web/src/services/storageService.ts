import { SolvedProblem, UserStats, UserProfile, ChatMessage, AchievementBadge, Language, DailyQuote, DailyChallenge } from '../types';

const STORAGE_KEYS = {
  SOLVED_PROBLEMS: 'dsa_solved_problems',
  USER_PROFILE: 'dsa_user_profile',
  CHAT_MESSAGES: 'dsa_chat_messages',
  GEMINI_KEY: 'dsa_gemini_api_key',
  SETTINGS: 'dsa_settings',
  NOTES: 'dsa_problem_notes',
};

export const StorageService = {
  // --- User Profile & Auth ---
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) return getDefaultUserProfile();
      return JSON.parse(data);
    } catch {
      return getDefaultUserProfile();
    }
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  loginUser(email: string): UserProfile {
    const current = this.getUserProfile();
    const updated: UserProfile = {
      ...current,
      email,
      displayName: email.split('@')[0].replace('.', ' '),
      isGuest: false,
    };
    this.saveUserProfile(updated);
    return updated;
  },

  signUpUser(
    name: string,
    email: string,
    language: Language,
    dailyGoal: number
  ): UserProfile {
    const newUser: UserProfile = {
      uid: 'user_' + Date.now(),
      displayName: name || email.split('@')[0],
      email,
      preferredLanguage: language,
      dailyGoal,
      streak: 3,
      xp: 150,
      level: 1,
      joinedDate: Date.now(),
      isGuest: false,
    };
    this.saveUserProfile(newUser);
    return newUser;
  },

  loginAsGuest(): UserProfile {
    const guestUser: UserProfile = {
      uid: 'guest_' + Date.now(),
      displayName: 'Guest Scholar',
      email: 'guest@dsacoach.app',
      preferredLanguage: 'Java',
      dailyGoal: 1,
      streak: 1,
      xp: 50,
      level: 1,
      joinedDate: Date.now(),
      isGuest: true,
    };
    this.saveUserProfile(guestUser);
    return guestUser;
  },

  logoutUser(): void {
    const guest = this.loginAsGuest();
    this.saveUserProfile(guest);
  },

  // --- Solved Problems ---
  getSolvedProblems(): SolvedProblem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOLVED_PROBLEMS);
      if (!data) return getDefaultMockProblems();
      return JSON.parse(data);
    } catch {
      return getDefaultMockProblems();
    }
  },

  saveSolvedProblem(problem: Omit<SolvedProblem, 'id' | 'solvedAt'>): SolvedProblem {
    const list = this.getSolvedProblems();
    const newProblem: SolvedProblem = {
      ...problem,
      id: 'sol_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      solvedAt: Date.now(),
      bookmarked: false,
    };
    const updated = [newProblem, ...list];
    localStorage.setItem(STORAGE_KEYS.SOLVED_PROBLEMS, JSON.stringify(updated));

    // Award XP to user profile
    const profile = this.getUserProfile();
    const xpBonus = problem.difficulty === 'Hard' ? 250 : problem.difficulty === 'Medium' ? 150 : 80;
    profile.xp += xpBonus;
    profile.level = Math.floor(profile.xp / 250) + 1;
    this.saveUserProfile(profile);

    return newProblem;
  },

  toggleBookmark(id: string): void {
    const list = this.getSolvedProblems().map(p => {
      if (p.id === id) {
        return { ...p, bookmarked: !p.bookmarked };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.SOLVED_PROBLEMS, JSON.stringify(list));
  },

  updateNotes(id: string, notes: string): void {
    const list = this.getSolvedProblems().map(p => {
      if (p.id === id) {
        return { ...p, notes };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.SOLVED_PROBLEMS, JSON.stringify(list));
  },

  deleteSolvedProblem(id: string): void {
    const list = this.getSolvedProblems().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.SOLVED_PROBLEMS, JSON.stringify(list));
  },

  // --- Chat Doubts History ---
  getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (!data) {
        return [
          {
            id: 'msg_welcome',
            text: "Hello! I'm your Gemini DSA Mentor. Ask me any Data Structures & Algorithms doubts, edge cases, time complexities, or interview questions!",
            isUser: false,
            timestamp: Date.now(),
          },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveChatMessage(msg: ChatMessage): void {
    const msgs = this.getChatMessages();
    const updated = [...msgs, msg];
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updated));
  },

  clearChatMessages(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  },

  // --- User Stats Calculation ---
  calculateUserStats(problems: SolvedProblem[]): UserStats {
    const profile = this.getUserProfile();
    if (problems.length === 0) {
      return {
        xp: profile.xp,
        streak: profile.streak,
        longestStreak: profile.streak,
        lastSolvedDate: '',
        level: profile.level,
        title: 'Novice Coder',
      };
    }

    const sorted = [...problems].sort((a, b) => b.solvedAt - a.solvedAt);
    const datesSet = new Set<string>();
    sorted.forEach(p => {
      const d = new Date(p.solvedAt);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      datesSet.add(iso);
    });

    const dates = Array.from(datesSet).sort().reverse();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let currentStreak = 0;
    if (dates.includes(todayStr) || dates.includes(yesterdayStr)) {
      let checkDate = dates.includes(todayStr) ? today : yesterday;
      while (true) {
        const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (datesSet.has(checkStr)) {
          currentStreak++;
          checkDate = new Date(checkDate);
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    let longestStreak = currentStreak;
    let tempStreak = 0;
    const sortedDatesAsc = Array.from(datesSet).sort();
    for (let i = 0; i < sortedDatesAsc.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDatesAsc[i - 1]);
        const curr = new Date(sortedDatesAsc[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    const calculatedXp = problems.reduce((acc, p) => {
      if (p.difficulty === 'Easy') return acc + 50;
      if (p.difficulty === 'Medium') return acc + 100;
      return acc + 200;
    }, 0) + (currentStreak * 25) + 120;

    const level = Math.floor(calculatedXp / 250) + 1;
    let title = 'Novice Coder';
    if (level >= 10) title = 'Grandmaster Algorithmist';
    else if (level >= 7) title = 'Senior Dynamic Programmer';
    else if (level >= 5) title = 'Graph Specialist';
    else if (level >= 3) title = 'Recursion Adept';
    else if (level >= 2) title = 'Array Tactician';

    return {
      xp: calculatedXp,
      streak: Math.max(currentStreak, profile.streak),
      longestStreak: Math.max(longestStreak, profile.streak),
      lastSolvedDate: dates[0] || '',
      level,
      title,
    };
  },

  get7DayCalendar(problems: SolvedProblem[]) {
    const datesSet = new Set<string>();
    problems.forEach(p => {
      const d = new Date(p.solvedAt);
      datesSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    });

    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const target = new Date(today);
      target.setDate(today.getDate() - i);
      const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
      const dayName = target.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        date: iso,
        dayName,
        isToday: i === 0,
        solved: datesSet.has(iso),
      });
    }
    return days;
  },

  getAchievements(problems: SolvedProblem[], user: UserProfile, chatCount: number): AchievementBadge[] {
    const languagesUsed = new Set(problems.map(p => p.language)).size;
    const treeProblems = problems.filter(p => p.topic.toLowerCase().includes('tree')).length;
    const dpProblems = problems.filter(p => p.topic.toLowerCase().includes('dynamic') || p.topic.toLowerCase().includes('dp')).length;
    const hardProblems = problems.filter(p => p.difficulty === 'Hard').length;

    return [
      {
        id: 'first_blood',
        title: 'First Blood',
        description: 'Solve your first LeetCode algorithmic problem',
        icon: '🚀',
        category: 'general',
        isUnlocked: problems.length >= 1,
        progress: Math.min(problems.length, 1),
        maxProgress: 1,
      },
      {
        id: 'streak_3',
        title: 'Streak Flame',
        description: 'Maintain a 3-day consecutive study streak',
        icon: '🔥',
        category: 'streak',
        isUnlocked: user.streak >= 3,
        progress: Math.min(user.streak, 3),
        maxProgress: 3,
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Solve problems 7 days in a row without breaking streak',
        icon: '⚡',
        category: 'streak',
        isUnlocked: user.streak >= 7,
        progress: Math.min(user.streak, 7),
        maxProgress: 7,
      },
      {
        id: 'polyglot',
        title: 'Code Polyglot',
        description: 'Solve problems in at least 2 different programming languages',
        icon: '🌐',
        category: 'speed',
        isUnlocked: languagesUsed >= 2,
        progress: Math.min(languagesUsed, 2),
        maxProgress: 2,
      },
      {
        id: 'tree_climber',
        title: 'Tree Climber',
        description: 'Conquer 2 or more Binary Tree or BST problems',
        icon: '🌳',
        category: 'topic',
        isUnlocked: treeProblems >= 2,
        progress: Math.min(treeProblems, 2),
        maxProgress: 2,
      },
      {
        id: 'dp_wizard',
        title: 'DP Mastermind',
        description: 'Solve 2 Dynamic Programming problems with optimal subproblems',
        icon: '🧩',
        category: 'topic',
        isUnlocked: dpProblems >= 2,
        progress: Math.min(dpProblems, 2),
        maxProgress: 2,
      },
      {
        id: 'hard_core',
        title: 'Hardcore Hacker',
        description: 'Solve an official Hard difficulty LeetCode problem',
        icon: '💀',
        category: 'general',
        isUnlocked: hardProblems >= 1,
        progress: Math.min(hardProblems, 1),
        maxProgress: 1,
      },
      {
        id: 'ai_scholar',
        title: 'AI Disciple',
        description: 'Ask 5 questions to the Gemini DSA Doubts Tutor',
        icon: '🧠',
        category: 'mentor',
        isUnlocked: chatCount >= 5,
        progress: Math.min(chatCount, 5),
        maxProgress: 5,
      },
      {
        id: 'grandmaster',
        title: 'Grandmaster Rank',
        description: 'Earn 1000+ XP and reach Level 5',
        icon: '👑',
        category: 'general',
        isUnlocked: user.level >= 5 || user.xp >= 1000,
        progress: Math.min(user.xp, 1000),
        maxProgress: 1000,
      },
    ];
  },

  getDailyQuote(): DailyQuote {
    const quotes: DailyQuote[] = [
      {
        quote: "Premature optimization is the root of all evil.",
        author: "Donald Knuth",
        tag: "Optimization",
      },
      {
        quote: "Simplicity is prerequisite for reliability.",
        author: "Edsger W. Dijkstra",
        tag: "Architecture",
      },
      {
        quote: "Talk is cheap. Show me the code.",
        author: "Linus Torvalds",
        tag: "Execution",
      },
      {
        quote: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.",
        author: "Christopher Thompson",
        tag: "Debugging",
      },
      {
        quote: "An algorithm must be seen to be believed.",
        author: "Donald Knuth",
        tag: "Algorithms",
      },
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return quotes[dayOfYear % quotes.length];
  },

  getCuratedChallenges(): DailyChallenge[] {
    return [
      {
        id: '1',
        title: 'Two Sum',
        topic: 'Arrays & Hashing',
        difficulty: 'Easy',
        leetCodeSlug: 'two-sum',
        leetCodeUrl: 'https://leetcode.com/problems/two-sum/',
        companies: ['Google', 'Meta', 'Amazon', 'Apple'],
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        acceptanceRate: '54.2%',
      },
      {
        id: '146',
        title: 'LRU Cache',
        topic: 'Design & Linked List',
        difficulty: 'Medium',
        leetCodeSlug: 'lru-cache',
        leetCodeUrl: 'https://leetcode.com/problems/lru-cache/',
        companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put operations.',
        acceptanceRate: '43.1%',
      },
      {
        id: '200',
        title: 'Number of Islands',
        topic: 'Graphs & BFS/DFS',
        difficulty: 'Medium',
        leetCodeSlug: 'number-of-islands',
        leetCodeUrl: 'https://leetcode.com/problems/number-of-islands/',
        companies: ['Amazon', 'Meta', 'Microsoft', 'Uber'],
        description: 'Given an m x n 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands.',
        acceptanceRate: '58.9%',
      },
      {
        id: '322',
        title: 'Coin Change',
        topic: 'Dynamic Programming',
        difficulty: 'Medium',
        leetCodeSlug: 'coin-change',
        leetCodeUrl: 'https://leetcode.com/problems/coin-change/',
        companies: ['Amazon', 'ByteDance', 'Google', 'Goldman Sachs'],
        description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.',
        acceptanceRate: '44.8%',
      },
      {
        id: '42',
        title: 'Trapping Rain Water',
        topic: 'Two Pointers & Monotonic Stack',
        difficulty: 'Hard',
        leetCodeSlug: 'trapping-rain-water',
        leetCodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
        companies: ['Google', 'Meta', 'Amazon', 'Apple'],
        description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
        acceptanceRate: '62.4%',
      },
      {
        id: '226',
        title: 'Invert Binary Tree',
        topic: 'Trees & Recursion',
        difficulty: 'Easy',
        leetCodeSlug: 'invert-binary-tree',
        leetCodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
        companies: ['Google', 'Amazon', 'Microsoft'],
        description: 'Given the root of a binary tree, invert the tree, and return its root.',
        acceptanceRate: '77.5%',
      },
    ];
  },

  getGeminiApiKey(): string {
    return localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  },

  setGeminiApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key.trim());
  },
};

function getDefaultUserProfile(): UserProfile {
  return {
    uid: 'user_default',
    displayName: 'Ayushi Singh',
    email: 'ayushi.singh0618@gmail.com',
    preferredLanguage: 'Java',
    dailyGoal: 1,
    streak: 3,
    xp: 150,
    level: 1,
    joinedDate: Date.now() - 3 * 86400000,
    leetcodeUsername: 'ayushi_code',
    isGuest: false,
  };
}

function getDefaultMockProblems(): SolvedProblem[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return [
    {
      id: 'sol_1',
      title: 'Two Sum',
      topic: 'Arrays & Hashing',
      difficulty: 'Easy',
      solvedAt: now - dayMs * 0.2, // Today
      language: 'Java',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      notes: 'Used HashMap complement technique to achieve linear runtime.',
      bookmarked: true,
    },
    {
      id: 'sol_2',
      title: 'Valid Anagram',
      topic: 'Arrays & Strings',
      difficulty: 'Easy',
      solvedAt: now - dayMs * 1.1, // Yesterday
      language: 'Python',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      notes: 'Character frequency array of size 26.',
      bookmarked: false,
    },
    {
      id: 'sol_3',
      title: 'Longest Substring Without Repeating Characters',
      topic: 'Sliding Window',
      difficulty: 'Medium',
      solvedAt: now - dayMs * 2.3, // 2 days ago
      language: 'Java',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(min(M, N))',
      notes: 'Two pointers left and right with hash table storing last seen index.',
      bookmarked: true,
    },
  ];
}
