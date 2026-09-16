import React from 'react';
import { Flame, Moon, Sun, Settings, Zap, Home, Code2, PlayCircle, BookOpen, MessageSquare, BarChart3, User, ShieldCheck, Download } from 'lucide-react';
import { UserStats, UserProfile, NavTab } from '../types';

interface NavbarProps {
  stats: UserStats;
  user: UserProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  user,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenAuth,
  activeTab,
  setActiveTab,
}) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'solver', label: 'Daily Solver', icon: <Code2 className="w-4 h-4" /> },
    { id: 'lecture', label: 'Animated Lecture', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'revision', label: 'Revision Vault', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'chat', label: 'AI Tutor', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer shrink-0"
          onClick={() => setActiveTab('home')}
        >
          <svg className="w-9 h-9 rounded-xl shadow-md shadow-indigo-500/20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nav-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#nav-logo-gradient)" />
            <path d="M55 22 L32 55 H50 L45 78 L68 45 H50 Z" fill="white" />
          </svg>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                DSA Daily Coach
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                Web
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-2">
          {/* Download App Button */}
          <a
            href="/app-release.apk"
            download
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden sm:flex items-center justify-center"
            title="Download Android App"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Flame Streak Badge */}
          <div
            onClick={() => setActiveTab('analytics')}
            className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 font-bold text-xs shadow-sm hover:scale-105 transition"
            title="Active Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{stats.streak}d</span>
          </div>

          {/* User Account Chip */}
          <div
            onClick={() => setActiveTab('profile')}
            className="cursor-pointer flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 transition"
            title="User Profile & Badges"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">
              {user.photoUrl || (user.isGuest ? '👤' : user.displayName[0] || 'U')}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[90px] truncate hidden sm:inline">
              {user.displayName.split(' ')[0]}
            </span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              L{stats.level}
            </span>
          </div>

          {/* If Guest, Show Quick Login CTA */}
          {user.isGuest && (
            <button
              onClick={onOpenAuth}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-600 text-slate-900 text-xs font-bold hover:bg-indigo-700 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sub-Nav */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-2 py-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                : 'text-slate-600 dark:text-slate-400 font-medium'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-0.5 whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
