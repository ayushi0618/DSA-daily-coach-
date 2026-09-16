export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Language = 'Java' | 'Python' | 'C++' | 'JavaScript' | 'Kotlin' | 'Go';

export type NavTab = 'home' | 'solver' | 'lecture' | 'revision' | 'chat' | 'analytics' | 'profile';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  preferredLanguage: Language;
  dailyGoal: number;
  streak: number;
  xp: number;
  level: number;
  joinedDate: number;
  leetcodeUsername?: string;
  isGuest: boolean;
}

export interface SolvedProblem {
  id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  solvedAt: number; // timestamp
  notes?: string;
  language: Language;
  codeSnippet?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  bookmarked?: boolean;
}

export interface ProblemSolution {
  title: string;
  topic: string;
  difficulty: Difficulty;
  summary: string;
  intuition: string;
  approach: string[];
  code: string;
  language: Language;
  timeComplexity: string;
  spaceComplexity: string;
  dryRunSteps: Array<{
    step: number;
    description: string;
    state: string;
  }>;
  edgeCases: string[];
  interviewTips: string[];
  leetCodeUrl?: string;
}

export interface UserStats {
  xp: number;
  streak: number;
  longestStreak: number;
  lastSolvedDate: string; // YYYY-MM-DD
  level: number;
  title: string;
}

export interface DailyLectureScene {
  title: string;
  subtitle: string;
  visualType: 'pointers' | 'hashmap' | 'tree' | 'dp';
  explanation: string;
  codeHighlight?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  isSocratic?: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  leetCodeSlug: string;
  leetCodeUrl: string;
  companies: string[];
  description: string;
  acceptanceRate: string;
}

export interface DailyQuote {
  quote: string;
  author: string;
  tag: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'topic' | 'speed' | 'mentor' | 'general';
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}
