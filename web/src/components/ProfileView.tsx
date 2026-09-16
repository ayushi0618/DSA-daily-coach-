import React, { useState } from 'react';
import { User, Mail, Award, Flame, Zap, Trophy, ShieldCheck, LogOut, ExternalLink, Edit3, Check, CheckCircle2, Lock } from 'lucide-react';
import { UserProfile, UserStats, SolvedProblem, Language } from '../types';
import { StorageService } from '../services/storageService';

interface ProfileViewProps {
  user: UserProfile;
  stats: UserStats;
  problems: SolvedProblem[];
  chatCount: number;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
  onOpenAuth: () => void;
}

const AVATARS = ['👨‍💻', '👩‍💻', '🧙‍♂️', '🤖', '🥷', '🧑‍🔬', '⚡', '🚀'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  problems,
  chatCount,
  onUpdateUser,
  onSignOut,
  onOpenAuth,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [leetcodeUsername, setLeetcodeUsername] = useState(user.leetcodeUsername || '');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(user.preferredLanguage);
  const [dailyGoal, setDailyGoal] = useState<number>(user.dailyGoal);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.photoUrl || '👨‍💻');

  const achievements = StorageService.getAchievements(problems, user, chatCount);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      displayName: displayName.trim() || user.displayName,
      email: email.trim() || user.email,
      leetcodeUsername: leetcodeUsername.trim(),
      preferredLanguage,
      dailyGoal,
      photoUrl: selectedAvatar,
    };
    StorageService.saveUserProfile(updated);
    onUpdateUser(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Student Profile Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          
          {/* Avatar */}
          <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-[22px] bg-white dark:bg-slate-900 flex items-center justify-center text-4xl select-none">
                {user.photoUrl || '👨‍💻'}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-indigo-600 text-slate-900 shadow-md text-xs">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {user.displayName}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                user.isGuest
                  ? 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
              }`}>
                {user.isGuest ? 'Guest Mode' : 'Verified Learner'}
              </span>
            </div>

            <p className="text-xs text-slate-600 flex items-center justify-center sm:justify-start space-x-1.5 mb-3">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Level {stats.level} ({stats.title})</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800 flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{stats.streak} Days Active</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>{stats.xp} Total XP</span>
              </span>
            </div>

            {/* LeetCode Profile Shortcut */}
            {user.leetcodeUsername && (
              <div className="mt-3">
                <a
                  href={`https://leetcode.com/u/${encodeURIComponent(user.leetcodeUsername)}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <span>LeetCode: @{user.leetcodeUsername}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 sm:items-end">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {user.isGuest ? (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 text-xs font-bold shadow-sm shadow-indigo-500/25 flex items-center space-x-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            ) : (
              <button
                onClick={onSignOut}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Switch</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
              Edit Student Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Choose Avatar Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center border transition ${
                        selectedAvatar === av
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 scale-105'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  LeetCode Username (Optional)
                </label>
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={e => setLeetcodeUsername(e.target.value)}
                  placeholder="e.g. ayushi_code"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Language
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Java', 'Python', 'C++', 'JavaScript', 'Kotlin', 'Go'] as Language[]).map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setPreferredLanguage(l)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                        preferredLanguage === l
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold text-xs shadow-md shadow-indigo-500/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gamification Badges & Achievements Grid */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Achievements & Mastery Badges</span>
            </h3>
            <p className="text-xs text-slate-600">
              {unlockedCount} of {achievements.length} Badges Unlocked
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
            {Math.round((unlockedCount / achievements.length) * 100)}% Completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all ${
                badge.isUnlocked
                  ? 'bg-gradient-to-br from-amber-500/5 via-indigo-500/5 to-purple-500/5 border-amber-400/40 dark:border-amber-500/30 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl border border-slate-100 dark:border-slate-800">
                  {badge.icon}
                </div>
                {badge.isUnlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-[10px] font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {badge.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-normal">
                {badge.description}
              </p>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                  <span>Progress</span>
                  <span>{badge.progress} / {badge.maxProgress}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.isUnlocked ? 'bg-amber-500' : 'bg-indigo-400'
                    }`}
                    style={{ width: `${Math.min(100, (badge.progress / badge.maxProgress) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
