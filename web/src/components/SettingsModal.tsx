import React, { useState } from 'react';
import { X, Key, Bell, Download, Upload, ShieldCheck, Check } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { SolvedProblem } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solvedProblems: SolvedProblem[];
  onImportProblems: (problems: SolvedProblem[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  solvedProblems,
  onImportProblems,
}) => {
  const [apiKey, setApiKey] = useState<string>(StorageService.getGeminiApiKey());
  const [savedKey, setSavedKey] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>('09:00');
  const [notifGranted, setNotifGranted] = useState<boolean>(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    StorageService.setGeminiApiKey(apiKey);
    setSavedKey(true);
    setTimeout(() => setSavedKey(false), 2000);
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser notifications are not supported by your browser.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotifGranted(true);
      new Notification('⚔️ DSA Daily Coach', {
        body: `Daily study reminder successfully activated for ${reminderTime}!`,
      });
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(solvedProblems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dsa_coach_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportProblems(imported);
          alert(`Successfully imported ${imported.length} solved problems!`);
        }
      } catch {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            Settings & Integrations
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          
          {/* Gemini API Key */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              Gemini API Key (Google AI Studio)
            </label>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
              Provide your personal Gemini API key for live streaming solutions. Stored locally on your device.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                {savedKey ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{savedKey ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Daily Study Reminder Notification */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              Daily Study Notification
            </label>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2">
              Receive a daily desktop browser ping to keep your coding streak alive.
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-mono"
              />
              <button
                onClick={handleEnableNotifications}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  notifGranted
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {notifGranted ? 'Notifications Active ✓' : 'Enable Daily Alert'}
              </button>
            </div>
          </div>

          {/* Backup & Restore Data */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Data Portability & Backup
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportData}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Solved JSON</span>
              </button>

              <label className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
