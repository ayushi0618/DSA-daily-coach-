import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ProblemSolver } from './components/ProblemSolver';
import { AnimatedLecture } from './components/AnimatedLecture';
import { RevisionFlashcards } from './components/RevisionFlashcards';
import { ChatView } from './components/ChatView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { StorageService } from './services/storageService';
import { SolvedProblem, UserProfile, NavTab, Difficulty } from './types';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    return StorageService.getUserProfile();
  });

  const [solvedProblems, setSolvedProblems] = useState<SolvedProblem[]>(() => {
    return StorageService.getSolvedProblems();
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  const [pendingProblemQuery, setPendingProblemQuery] = useState<string | undefined>();
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty | undefined>();

  // Sync dark mode class with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const userStats = StorageService.calculateUserStats(solvedProblems);

  const handleMarkSolved = (problemData: Omit<SolvedProblem, 'id' | 'solvedAt'>) => {
    StorageService.saveSolvedProblem(problemData);
    setSolvedProblems(StorageService.getSolvedProblems());
    setUserProfile(StorageService.getUserProfile());
  };

  const handleDeleteProblem = (id: string) => {
    StorageService.deleteSolvedProblem(id);
    setSolvedProblems(StorageService.getSolvedProblems());
  };

  const handleImportProblems = (imported: SolvedProblem[]) => {
    localStorage.setItem('dsa_solved_problems', JSON.stringify(imported));
    setSolvedProblems(imported);
  };

  const handleSelectProblemToSolve = (title: string, diff?: Difficulty) => {
    setPendingProblemQuery(title);
    setPendingDifficulty(diff || 'Medium');
    setActiveTab('solver');
  };

  const handleSignOut = () => {
    StorageService.logoutUser();
    setUserProfile(StorageService.getUserProfile());
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-slate-900 transition-colors duration-200">
      
      {/* Top Navigation Bar with All Hubs & Account Status */}
      <Navbar
        stats={userStats}
        user={userProfile}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Responsive View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* 1. Home Dashboard Hub */}
        {activeTab === 'home' && (
          <HomeView
            stats={userStats}
            user={userProfile}
            solvedProblems={solvedProblems}
            onSelectProblemToSolve={handleSelectProblemToSolve}
            onOpenDoubts={() => setActiveTab('chat')}
            onOpenVault={() => setActiveTab('revision')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* 2. Daily Problem AI Solver */}
        {activeTab === 'solver' && (
          <ProblemSolver
            onMarkSolved={handleMarkSolved}
            solvedProblems={solvedProblems}
            initialQuery={pendingProblemQuery}
            initialDifficulty={pendingDifficulty}
          />
        )}

        {/* 3. Interactive Whiteboard Animated Lecture */}
        {activeTab === 'lecture' && (
          <AnimatedLecture
            problemTitle="Two Sum - Hash Map Masterclass"
            topic="Arrays & Hashing"
            difficulty="Easy"
          />
        )}

        {/* 4. Revision Vault & Flashcards */}
        {activeTab === 'revision' && (
          <RevisionFlashcards
            problems={solvedProblems}
            onDeleteProblem={handleDeleteProblem}
          />
        )}

        {/* 5. Gemini DSA Mentor Doubts Chat */}
        {activeTab === 'chat' && (
          <ChatView />
        )}

        {/* 6. Learning Analytics & Topic Radar */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            stats={userStats}
            user={userProfile}
            problems={solvedProblems}
          />
        )}

        {/* 7. Student Profile & Gamification Achievements */}
        {activeTab === 'profile' && (
          <ProfileView
            user={userProfile}
            stats={userStats}
            problems={solvedProblems}
            chatCount={StorageService.getChatMessages().length}
            onUpdateUser={setUserProfile}
            onSignOut={handleSignOut}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-1000 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>DSA Daily Coach</strong> • Web & Android Parity • Powered by Gemini 2.5 & Local Storage
          </p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1" />
              Local & Offline Ready
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              API Key & Backup
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Sign In / Register / Guest) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={user => {
          setUserProfile(user);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        solvedProblems={solvedProblems}
        onImportProblems={handleImportProblems}
      />

    </div>
  );
};
