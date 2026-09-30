import React, { useState, useMemo } from 'react';
import {
  Flame, Lock, Search, ArrowUpDown, Filter, ChevronLeft, ChevronRight,
  BookOpen, Target, Compass, BookOpenCheck, LogIn, Check, Crown, CalendarDays
} from 'lucide-react';
import { SolvedProblem, UserStats, UserProfile, Difficulty } from '../types';
import { PaymentModal } from './PaymentModal';
import { StudyPlanView } from './StudyPlanView';

interface HomeViewProps {
  stats: UserStats;
  user: UserProfile;
  solvedProblems: SolvedProblem[];
  onSelectProblemToSolve: (title: string, difficulty?: Difficulty) => void;
  onOpenDoubts: () => void;
  onOpenVault: () => void;
  onOpenAuth: () => void;
  onXP: () => void;
}

const PROBLEMS = [
  { id: 1, title: 'Two Sum', acceptance: '58.2%', difficulty: 'Easy', locked: false, topics: ['Array', 'Hash Table'] },
  { id: 2, title: 'Add Two Numbers', acceptance: '49.3%', difficulty: 'Medium', locked: false, topics: ['Linked List', 'Math'] },
  { id: 3, title: 'Longest Substring Without Repeating Characters', acceptance: '40.0%', difficulty: 'Medium', locked: false, topics: ['String', 'Hash Table', 'Sliding Window'] },
  { id: 4, title: 'Median of Two Sorted Arrays', acceptance: '47.6%', difficulty: 'Hard', locked: true, topics: ['Array', 'Binary Search'] },
  { id: 5, title: 'Longest Palindromic Substring', acceptance: '38.7%', difficulty: 'Medium', locked: true, topics: ['String', 'Dynamic Programming'] },
  { id: 11, title: 'Container With Most Water', acceptance: '57.1%', difficulty: 'Medium', locked: false, topics: ['Array', 'Two Pointers'] },
  { id: 15, title: '3Sum', acceptance: '36.8%', difficulty: 'Medium', locked: false, topics: ['Array', 'Two Pointers', 'Sorting'] },
  { id: 20, title: 'Valid Parentheses', acceptance: '41.5%', difficulty: 'Easy', locked: false, topics: ['String', 'Stack'] },
  { id: 21, title: 'Merge Two Sorted Lists', acceptance: '66.2%', difficulty: 'Easy', locked: false, topics: ['Linked List', 'Recursion'] },
  { id: 121, title: 'Best Time to Buy and Sell Stock', acceptance: '54.9%', difficulty: 'Easy', locked: false, topics: ['Array', 'Dynamic Programming'] },
  { id: 200, title: 'Number of Islands', acceptance: '58.9%', difficulty: 'Medium', locked: true, topics: ['Array', 'DFS', 'BFS'] },
  { id: 206, title: 'Reverse Linked List', acceptance: '78.4%', difficulty: 'Easy', locked: false, topics: ['Linked List'] },
  { id: 217, title: 'Contains Duplicate', acceptance: '62.3%', difficulty: 'Easy', locked: false, topics: ['Array', 'Hash Table'] },
  { id: 238, title: 'Product of Array Except Self', acceptance: '66.0%', difficulty: 'Medium', locked: true, topics: ['Array', 'Prefix Sum'] },
  { id: 1621, title: 'Number of Sets of K Non-Overlapping Line Segments', acceptance: '56.7%', difficulty: 'Medium', locked: true, topics: ['Dynamic Programming', 'Math'] },
];

const TOPICS = [
  { name: 'Array', count: 2238 },
  { name: 'String', count: 893 },
  { name: 'Hash Table', count: 832 },
  { name: 'Math', count: 702 },
  { name: 'Dynamic Programming', count: 678 },
  { name: 'Sorting', count: 534 },
  { name: 'Greedy', count: 481 },
  { name: 'Depth-First Search', count: 421 },
];

const COMPANIES = [
  { name: 'Google', count: 2345 },
  { name: 'Amazon', count: 2023 },
  { name: 'Meta', count: 1405 },
  { name: 'Microsoft', count: 1378 },
  { name: 'Bloomberg', count: 1238 },
  { name: 'Citadel', count: 84 },
];

const diffBadge = (d: string) =>
  d === 'Easy' ? 'diff-badge-easy' : d === 'Medium' ? 'diff-badge-medium' : 'diff-badge-hard';

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  user,
  solvedProblems,
  onSelectProblemToSolve,
  onOpenAuth,
  onXP,
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState({ name: '', price: '' });

  const [activeTab, setActiveTab] = useState('Library');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Topics');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Todo'>('All');
  const [diffFilter, setDiffFilter] = useState<'All' | Difficulty>('All');

  const isSolved = (id: number) => solvedProblems.some(sp => sp.id === id.toString());

  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = activeFilter === 'All Topics' || activeFilter === 'Algorithms' || p.topics.includes(activeFilter);
      const solved = isSolved(p.id);
      const matchesStatus = statusFilter === 'All' || (statusFilter === 'Solved' ? solved : !solved);
      const matchesDiff = diffFilter === 'All' || p.difficulty === diffFilter;
      return matchesSearch && matchesTopic && matchesStatus && matchesDiff;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeFilter, statusFilter, diffFilter, solvedProblems]);

  const filteredCompanies = useMemo(() => {
    return COMPANIES.filter(c => c.name.toLowerCase().includes(companyQuery.toLowerCase()));
  }, [companyQuery]);

  const solvedCount = PROBLEMS.filter(p => isSolved(p.id)).length;

  const handleOpenPayment = (name: string, price: string) => {
    setPaymentPlan({ name, price });
    setIsPaymentModalOpen(true);
  };

  const openProblem = (prob: typeof PROBLEMS[number]) => {
    if (prob.locked) {
      handleOpenPayment('DSA Coach Pro - Access Problem', '$8.25/mo');
    } else {
      onSelectProblemToSolve(prob.title, prob.difficulty as Difficulty);
    }
  };

  return (
    <div className="flex w-full bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-700 dark:text-slate-300 -mt-6 sm:-mt-8 -mx-3 sm:-mx-6 lg:-mx-8">

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        planName={paymentPlan.name}
        price={paymentPlan.price}
      />

      {/* LEFT SIDEBAR (Desktop) */}
      <div className="hidden lg:flex flex-col w-60 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 bg-white dark:bg-slate-900">
        <div className="px-3 pt-2 pb-4">
          <p className="font-display font-bold text-sm text-slate-900 dark:text-white">Study Hub</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">O(log n) to mastery</p>
        </div>
        <div className="space-y-1">
          {['Library', 'Quest', 'Explore', 'Study Plan'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition ${
                activeTab === tab
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'Library' && <BookOpen className="w-4 h-4" />}
              {tab === 'Quest' && <Target className="w-4 h-4" />}
              {tab === 'Explore' && <Compass className="w-4 h-4" />}
              {tab === 'Study Plan' && <BookOpenCheck className="w-4 h-4" />}
              <span>{tab}</span>
              {tab === 'Study Plan' && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">NEW</span>
              )}
            </button>
          ))}
        </div>

        {/* Mini stats */}
        <div className="mt-8 px-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-2.5 text-center">
            <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">{stats.streak}</p>
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><Flame className="w-3 h-3 text-amber-500" /> streak</p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-2.5 text-center">
            <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">{stats.level}</p>
            <p className="text-[10px] text-slate-500">level</p>
          </div>
        </div>

        <div className="mt-8 px-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Sign in to view lists and<br />track study progress.</p>
          <button
            onClick={onOpenAuth}
            className="w-full flex justify-center items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full font-semibold text-sm hover:bg-slate-700 dark:hover:bg-slate-200 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-8 min-w-0">

        {activeTab === 'Library' ? (
          <>
            {/* CENTER COLUMN (Problems Table) */}
            <div className="flex-1 min-w-0">

              {/* Promo Banners (fake paywall entry points — unchanged behavior) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div
                  onClick={() => handleOpenPayment('DSA Coach Pro - Annual', '$99/yr')}
                  className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer hover:border-blue-300 transition"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition duration-500"></div>
                  <div className="z-10">
                    <p className="text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider mb-1">LIMITED OFFER</p>
                    <h3 className="text-blue-950 dark:text-blue-100 font-bold text-lg leading-tight">Master Algorithms.<br />Ace Interviews.</h3>
                  </div>
                  <div className="text-xs font-bold bg-blue-600/10 text-blue-700 dark:text-blue-300 px-2 py-1 rounded inline-flex self-start z-10">
                    $99/yr <span className="line-through text-blue-400 ml-1">$159</span>
                  </div>
                </div>

                <div
                  onClick={() => handleOpenPayment('DSA Coach Pro - Monthly', '$8.25/mo')}
                  className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-4 flex flex-col justify-between h-32 cursor-pointer hover:border-indigo-300 transition"
                >
                  <Crown className="w-6 h-6 text-indigo-500 mb-1" />
                  <h3 className="text-indigo-950 dark:text-indigo-100 font-bold">Unlock Full Experience<br />on DSA Coach Pro</h3>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                    $8.25<span className="text-xs text-indigo-400 font-normal">/mo</span>
                  </div>
                </div>

                <div
                  onClick={() => handleOpenPayment('DSA Coach Pro - Video Generation', '$4.99/mo')}
                  className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl p-4 flex flex-col justify-between h-32 cursor-pointer hover:border-purple-300 transition relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition duration-500"></div>
                  <div className="z-10">
                    <p className="text-purple-600 dark:text-purple-400 text-[10px] font-bold tracking-wider mb-1 uppercase">Generate video from text</p>
                    <h3 className="text-purple-950 dark:text-purple-100 font-bold text-sm leading-tight line-clamp-3">Add video generation to your creative app. Let users turn their blog posts, scripts, or product descriptions into short video clips.</h3>
                  </div>
                </div>
              </div>

              {/* Topics Tag Cloud */}
              <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-2 text-sm whitespace-nowrap">
                {TOPICS.map(topic => (
                  <button
                    key={topic.name}
                    onClick={() => setActiveFilter(topic.name)}
                    className={`flex items-center space-x-1.5 cursor-pointer group transition shrink-0 ${activeFilter === topic.name ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    <span>{topic.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono transition ${activeFilter === topic.name ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {topic.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {['All Topics', 'Algorithms'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-full font-semibold text-xs transition border ${
                      activeFilter === filter
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    {filter === 'Algorithms' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{filter}</span>
                  </button>
                ))}
                <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDiffFilter(d)}
                    className={`px-3 py-1.5 rounded-full font-semibold text-xs transition border ${
                      diffFilter === d
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    {d === 'All' ? 'All levels' : d}
                  </button>
                ))}
                <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />
                {(['All', 'Todo', 'Solved'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full font-semibold text-xs transition border ${
                      statusFilter === s
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    {s === 'All' ? 'All status' : s}
                  </button>
                ))}
              </div>

              {/* Table Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-3 gap-3">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search questions"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl pl-9 pr-4 py-2 w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder:text-slate-400"
                    />
                  </div>
                  <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition" title="Sort">
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition" title="Filters">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-xs">{solvedCount}/{PROBLEMS.length} Solved</span>
                </div>
              </div>

              {/* ===== LeetCode-style Problems Table: # / Title / Topics / Acceptance / Difficulty / Status ===== */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
                      <th className="py-3 pl-4 pr-2 font-semibold w-12">#</th>
                      <th className="py-3 px-2 font-semibold">Title</th>
                      <th className="py-3 px-2 font-semibold hidden lg:table-cell">Topics</th>
                      <th className="py-3 px-2 font-semibold hidden sm:table-cell w-24">Acceptance</th>
                      <th className="py-3 px-2 font-semibold w-24">Difficulty</th>
                      <th className="py-3 px-2 pr-4 font-semibold w-16 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                          No problems match your filters.
                        </td>
                      </tr>
                    )}
                    {filteredProblems.map((prob) => {
                      const solved = isSolved(prob.id);
                      return (
                        <tr
                          key={prob.id}
                          className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 transition"
                        >
                          <td className="py-3 pl-4 pr-2 font-mono text-xs text-slate-400">{prob.id}</td>
                          <td className="py-3 px-2 min-w-0">
                            <button
                              onClick={() => openProblem(prob)}
                              className="text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-left transition flex items-center gap-1.5 max-w-full"
                            >
                              <span className="truncate">{prob.title}</span>
                              {prob.locked && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                            </button>
                          </td>
                          <td className="py-3 px-2 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {prob.topics.slice(0, 3).map(t => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{t}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2 hidden sm:table-cell font-mono text-xs text-slate-500 dark:text-slate-400">{prob.acceptance}</td>
                          <td className="py-3 px-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffBadge(prob.difficulty)}`}>
                              {prob.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-2 pr-4 text-center">
                            {solved ? (
                              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="inline-block w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                Showing {filteredProblems.length} of {PROBLEMS.length} curated problems · <span className="diff-easy font-bold">Easy</span> · <span className="diff-medium font-bold">Medium</span> · <span className="diff-hard font-bold">Hard</span>
              </p>
            </div>

            {/* RIGHT COLUMN (Widgets) */}
            <div className="w-full xl:w-80 shrink-0 space-y-6">

              {/* Calendar Widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <CalendarDays className="w-4 h-4 text-indigo-500" />
                    <span className="font-mono text-xs">September 2026</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400 font-medium">
                  <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {[...Array(30)].map((_, i) => {
                    const day = i + 1;
                    const isToday = day === 30;
                    const isPast = day < 30;
                    return (
                      <div key={day} className={`
                        aspect-square flex items-center justify-center rounded-full text-xs cursor-pointer transition font-mono
                        ${isToday ? 'bg-emerald-500 text-white font-bold hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                          isPast ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-400 dark:text-slate-600'}
                      `}>
                        {day}
                      </div>
                    );
                  })}
                </div>

                <div
                  className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 cursor-pointer group"
                  onClick={() => handleOpenPayment('DSA Coach Premium - Weekly Plan', '$3.99/wk')}
                >
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-amber-500 font-medium flex items-center group-hover:text-amber-400 transition"><Crown className="w-4 h-4 mr-1" /> Weekly Premium</span>
                    <span className="text-slate-400 text-xs font-mono">5 days left</span>
                  </div>
                </div>
              </div>

              {/* Trending Companies */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">Trending Companies</h3>
                  <div className="flex space-x-1">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 transition"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 transition"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for a company..."
                    value={companyQuery}
                    onChange={(e) => setCompanyQuery(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-full pl-8 pr-4 py-2 focus:border-indigo-400 outline-none transition placeholder:text-slate-400"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {filteredCompanies.length === 0 ? (
                    <div className="text-xs text-slate-400 text-center w-full py-2">No companies found</div>
                  ) : (
                    filteredCompanies.map(company => (
                      <button
                        key={company.name}
                        onClick={() => {
                          setSearchQuery("");
                          setActiveFilter('All Topics');
                        }}
                        className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 rounded-full pl-3 pr-1.5 py-1"
                      >
                        <span className="text-xs text-slate-600 dark:text-slate-300">{company.name}</span>
                        <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                          {company.count}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
        ) : activeTab === 'Study Plan' ? (
          <div className="flex-1 min-w-0">
            <StudyPlanView solvedProblems={solvedProblems} onXP={onXP} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
              {activeTab === 'Quest' && <Target className="w-10 h-10 text-amber-500" />}
              {activeTab === 'Explore' && <Compass className="w-10 h-10 text-blue-500" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-display">{activeTab}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 text-sm">This premium feature is currently being crafted for DSA Coach Pro users. Stay tuned!</p>
            <button
              onClick={() => setActiveTab('Library')}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-700 dark:hover:bg-slate-200 transition"
            >
              Return to Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
