import React, { useState, useMemo } from 'react';
import { 
  Flame, Lock, Search, ArrowUpDown, Filter, ChevronLeft, ChevronRight, 
  BookOpen, Target, Compass, BookOpenCheck, LogIn, Check, Crown
} from 'lucide-react';
import { SolvedProblem, UserStats, UserProfile } from '../types';
import { PaymentModal } from './PaymentModal';

interface HomeViewProps {
  stats: UserStats;
  user: UserProfile;
  solvedProblems: SolvedProblem[];
  onSelectProblemToSolve: (title: string, difficulty?: 'Easy' | 'Medium' | 'Hard') => void;
  onOpenDoubts: () => void;
  onOpenVault: () => void;
  onOpenAuth: () => void;
}

const PROBLEMS = [
  { id: 1, title: 'Two Sum', acceptance: '58.2%', difficulty: 'Easy', locked: false, topics: ['Array', 'Hash Table'] },
  { id: 2, title: 'Add Two Numbers', acceptance: '49.3%', difficulty: 'Medium', locked: false, topics: ['Math'] },
  { id: 3, title: 'Longest Substring Without Repeating Characters', acceptance: '40.0%', difficulty: 'Medium', locked: false, topics: ['String', 'Hash Table'] },
  { id: 4, title: 'Median of Two Sorted Arrays', acceptance: '47.6%', difficulty: 'Hard', locked: true, topics: ['Array'] },
  { id: 5, title: 'Longest Palindromic Substring', acceptance: '38.7%', difficulty: 'Medium', locked: true, topics: ['String', 'Dynamic Programming'] },
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

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  user,
  solvedProblems,
  onSelectProblemToSolve,
  onOpenAuth,
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState({ name: '', price: '' });
  
  const [activeTab, setActiveTab] = useState('Library');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Topics');

  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = activeFilter === 'All Topics' || activeFilter === 'Algorithms' || p.topics.includes(activeFilter);
      return matchesSearch && matchesTopic;
    });
  }, [searchQuery, activeFilter]);

  const filteredCompanies = useMemo(() => {
    return COMPANIES.filter(c => c.name.toLowerCase().includes(companyQuery.toLowerCase()));
  }, [companyQuery]);

  const handleOpenPayment = (name: string, price: string) => {
    setPaymentPlan({ name, price });
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="flex w-full bg-[#fdfbf7] dark:bg-[#1a1a1a] min-h-screen text-slate-700 dark:text-slate-300 dark:text-slate-300 -mt-6 sm:-mt-8 -mx-3 sm:-mx-6 lg:-mx-8">
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        planName={paymentPlan.name}
        price={paymentPlan.price}
      />

      {/* LEFT SIDEBAR (Desktop) */}
      <div className="hidden lg:flex flex-col w-56 border-r border-slate-200 dark:border-slate-800 dark:border-slate-800 p-4 shrink-0 bg-[#f4f1ea] dark:bg-[#1e1e1e]">
        <div className="space-y-1 mt-4">
          {['Library', 'Quest', 'Explore', 'Study Plan'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${
                activeTab === tab ? 'bg-slate-200 dark:bg-white dark:bg-[#2a2a2a]/10 text-slate-900 dark:text-white dark:text-white' : 'text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white dark:bg-[#2a2a2a]/5 dark:hover:bg-white dark:bg-[#2a2a2a]/5'
              }`}
            >
              {tab === 'Library' && <BookOpen className="w-4 h-4" />}
              {tab === 'Quest' && <Target className="w-4 h-4" />}
              {tab === 'Explore' && <Compass className="w-4 h-4" />}
              {tab === 'Study Plan' && <BookOpenCheck className="w-4 h-4" />}
              <span>{tab}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-12 px-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">Sign in to view lists and<br/>track study progress.</p>
          <button 
            onClick={onOpenAuth}
            className="w-full flex justify-center items-center space-x-2 bg-slate-900 dark:bg-white dark:bg-[#2a2a2a] text-white dark:text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign in</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-8">
        
        {activeTab === 'Library' ? (
          <>
            {/* CENTER COLUMN (Problems List) */}
            <div className="flex-1 min-w-0">
          
          {/* Promo Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div 
              onClick={() => handleOpenPayment('DSA Coach Pro - Annual', '$99/yr')}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer hover:border-blue-300 transition"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition duration-500"></div>
              <div className="z-10">
                <p className="text-blue-600 text-xs font-bold tracking-wider mb-1">LIMITED OFFER</p>
                <h3 className="text-blue-950 font-bold text-lg leading-tight">Master Algorithms.<br/>Ace Interviews.</h3>
              </div>
              <div className="text-xs font-bold bg-blue-600/10 text-blue-700 px-2 py-1 rounded inline-flex self-start z-10">
                $99/yr <span className="line-through text-blue-400 ml-1">$159</span>
              </div>
            </div>
            
            <div 
              onClick={() => handleOpenPayment('DSA Coach Pro - Monthly', '$8.25/mo')}
              className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col justify-between h-32 cursor-pointer hover:border-indigo-300 transition"
            >
              <Crown className="w-6 h-6 text-indigo-500 mb-1" />
              <h3 className="text-indigo-950 font-bold">Unlock Full Experience<br/>on DSA Coach Pro</h3>
              <div className="text-sm font-bold text-indigo-600 mt-2">
                $8.25<span className="text-xs text-indigo-400 font-normal">/mo</span>
              </div>
            </div>
            
            <div 
              onClick={() => handleOpenPayment('DSA Coach Pro - Video Generation', '$4.99/mo')}
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col justify-between h-32 cursor-pointer hover:border-purple-300 transition relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition duration-500"></div>
              <div className="z-10">
                <p className="text-purple-600 text-[10px] font-bold tracking-wider mb-1 uppercase">Generate video from text</p>
                <h3 className="text-purple-950 font-bold text-sm leading-tight line-clamp-3">Add video generation to your creative app. Let users turn their blog posts, scripts, or product descriptions into short video clips.</h3>
              </div>
            </div>
          </div>

          {/* Topics Tag Cloud */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-4 scrollbar-hide text-sm whitespace-nowrap">
            {TOPICS.map(topic => (
              <button 
                key={topic.name} 
                onClick={() => setActiveFilter(topic.name)}
                className={`flex items-center space-x-1.5 cursor-pointer group transition ${activeFilter === topic.name ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white'}`}
              >
                <span>{topic.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full transition ${activeFilter === topic.name ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white dark:bg-[#2a2a2a] text-slate-600 dark:text-slate-400 group-hover:bg-[#3a3a3a]'}`}>
                  {topic.count}
                </span>
              </button>
            ))}
            <button className="text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white cursor-pointer ml-2">Expand ⌄</button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {['All Topics', 'Algorithms', 'Database', 'Shell', 'Concurrency'].map((filter) => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-sm transition ${
                  activeFilter === filter 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black' 
                    : filter === 'Algorithms'
                      ? 'bg-white dark:bg-[#2a2a2a] text-amber-500 hover:bg-slate-100 dark:hover:bg-[#333]'
                      : filter === 'Database'
                        ? 'bg-white dark:bg-[#2a2a2a] text-blue-400 hover:bg-slate-100 dark:hover:bg-[#333]'
                        : filter === 'Shell'
                          ? 'bg-white dark:bg-[#2a2a2a] text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#333]'
                          : filter === 'Concurrency'
                            ? 'bg-white dark:bg-[#2a2a2a] text-purple-400 hover:bg-slate-100 dark:hover:bg-[#333]'
                            : 'bg-white dark:bg-[#2a2a2a] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333]'
                }`}
              >
                {filter === 'All Topics' && <BookOpen className="w-4 h-4" />}
                {filter === 'Algorithms' && <Crown className="w-4 h-4" />}
                <span>{filter}</span>
              </button>
            ))}
          </div>

          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search questions" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white dark:bg-[#2a2a2a] border-none text-slate-900 dark:text-white text-sm rounded-lg pl-9 pr-4 py-2 w-full sm:w-64 focus:ring-1 focus:ring-white/20 outline-none transition"
                />
              </div>
              <button className="p-2 bg-white dark:bg-[#2a2a2a] rounded-lg text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white transition">
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white dark:bg-[#2a2a2a] rounded-lg text-slate-600 dark:text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white transition">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-emerald-500/20" style={{ height: '40%', transform: 'translateY(60%)' }}></div>
                </div>
                <span>{solvedProblems.length}/4055 Solved</span>
              </div>
              <button className="p-2 hover:bg-white dark:bg-[#2a2a2a] rounded-lg transition"><ArrowUpDown className="w-4 h-4 rotate-90" /></button>
            </div>
          </div>

          {/* Problems Table */}
          <div className="w-full">
            <div className="border-b border-slate-200 dark:border-slate-800"></div>
            {filteredProblems.length === 0 ? (
              <div className="py-12 text-center text-slate-600 dark:text-slate-400">
                No problems match your filters.
              </div>
            ) : (
              filteredProblems.map((prob, idx) => {
                const isSolved = solvedProblems.some(sp => sp.id === prob.id.toString());
                
                return (
                  <div key={prob.id} 
                    className={`flex items-center py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-white dark:bg-[#2a2a2a]/5 transition rounded-lg ${idx % 2 === 0 ? 'bg-[#f4f1ea] dark:bg-[#1e1e1e]/50' : ''}`}
                  >
                    <div className="w-8 flex justify-center shrink-0">
                      {isSolved ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <button 
                        onClick={() => {
                          if (prob.locked) {
                            handleOpenPayment('DSA Coach Pro - Access Problem', '$8.25/mo');
                          } else {
                            onSelectProblemToSolve(prob.title, prob.difficulty as any);
                          }
                        }}
                        className="text-slate-900 dark:text-white hover:text-blue-400 font-medium truncate text-left transition w-full flex items-center"
                      >
                        {prob.id}. {prob.title}
                      </button>
                    </div>
                    <div className="w-20 text-slate-600 dark:text-slate-400 text-sm hidden sm:block shrink-0">
                      {prob.acceptance}
                    </div>
                    <div className={`w-20 text-sm font-medium shrink-0 ${
                      prob.difficulty === 'Easy' ? 'text-emerald-400' : 
                      prob.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-500'
                    }`}>
                      {prob.difficulty}
                    </div>
                    <div className="w-8 flex justify-center shrink-0">
                      {prob.locked && (
                        <button onClick={() => handleOpenPayment('DSA Coach Pro - Access Problem', '$8.25/mo')} className="p-1 hover:bg-slate-100 dark:hover:bg-[#333] rounded transition">
                          <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-amber-500" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (Widgets) */}
        <div className="w-full xl:w-80 shrink-0 space-y-6">
          
          {/* Calendar Widget */}
          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-5 hover:border-amber-500/30 border border-transparent transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Day 16</span>
                <span className="text-xs">19:26:33 left</span>
              </div>
              <div className="w-10 h-10 -mt-8 -mr-2 bg-slate-100 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center transform rotate-6">
                <span className="text-xs font-bold text-slate-900 dark:text-white">9</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-600 dark:text-slate-400">Sep</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 text-slate-900 dark:text-white">
              <button className="p-1 hover:bg-slate-100 dark:hover:bg-[#333] rounded transition"><ChevronLeft className="w-4 h-4" /></button>
              <span className="font-medium text-sm">September 2026</span>
              <button className="p-1 hover:bg-slate-100 dark:hover:bg-[#333] rounded transition"><ChevronRight className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-600 dark:text-slate-400 font-medium">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const isToday = day === 16;
                const isPast = day < 16;
                return (
                  <div key={day} className={`
                    aspect-square flex items-center justify-center rounded-full text-xs cursor-pointer transition
                    ${isToday ? 'bg-emerald-500 text-slate-900 dark:text-white font-bold hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                      isPast ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333]' : 'text-slate-600 dark:text-slate-400 hover:text-slate-600 dark:text-slate-400'}
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
                <span className="text-slate-600 dark:text-slate-400 text-xs">5 days left</span>
              </div>
              <div className="flex justify-between mt-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="text-amber-500 font-bold">W1</span>
                <span>W2</span>
                <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-medium">W3</span>
                <span>W4</span>
                <span>W5</span>
              </div>
            </div>
          </div>

          {/* Trending Companies */}
          <div className="bg-white dark:bg-[#2a2a2a] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Trending Companies</h3>
              <div className="flex space-x-1">
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-[#333] rounded text-slate-600 dark:text-slate-400 transition"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-[#333] rounded text-slate-600 dark:text-slate-400 transition"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for a company..." 
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
                className="w-full bg-[#f4f1ea] dark:bg-[#1e1e1e] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-full pl-8 pr-4 py-2 focus:border-slate-500 outline-none transition"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredCompanies.length === 0 ? (
                <div className="text-xs text-slate-600 dark:text-slate-400 text-center w-full py-2">No companies found</div>
              ) : (
                filteredCompanies.map(company => (
                  <button 
                    key={company.name} 
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter('All Topics');
                    }}
                    className="flex items-center space-x-2 bg-[#f4f1ea] dark:bg-[#1e1e1e] hover:bg-slate-100 dark:hover:bg-[#333] dark:hover:bg-[#333] hover:border-amber-500/50 cursor-pointer transition border border-slate-200 dark:border-slate-800/50 rounded-full pl-3 pr-1.5 py-1"
                  >
                    <span className="text-xs text-slate-700 dark:text-slate-300">{company.name}</span>
                    <span className="bg-amber-500/20 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      {company.count}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>
        </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-300">
             <div className="w-20 h-20 bg-white dark:bg-[#2a2a2a] rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-200 dark:border-slate-800">
                {activeTab === 'Quest' && <Target className="w-10 h-10 text-amber-500" />}
                {activeTab === 'Explore' && <Compass className="w-10 h-10 text-blue-500" />}
                {activeTab === 'Study Plan' && <BookOpenCheck className="w-10 h-10 text-emerald-500" />}
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{activeTab}</h2>
             <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-8">This premium feature is currently being crafted for DSA Coach Pro users. Stay tuned!</p>
             <button 
                onClick={() => setActiveTab('Library')}
                className="bg-slate-900 dark:bg-white dark:bg-[#2a2a2a] text-white dark:text-black px-6 py-2.5 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
             >
                Return to Library
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

