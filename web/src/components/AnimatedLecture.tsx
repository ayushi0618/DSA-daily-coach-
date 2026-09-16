import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Sparkles, CheckCircle, Code, Volume2, VolumeX } from 'lucide-react';
import { DailyLectureScene } from '../types';

interface AnimatedLectureProps {
  problemTitle?: string;
  topic?: string;
  difficulty?: string;
}

export const AnimatedLecture: React.FC<AnimatedLectureProps> = ({
  problemTitle = "Two Sum: Array Hash Map Masterclass",
  topic = "Arrays & Hashing",
  difficulty = "Easy",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [pointerLeft, setPointerLeft] = useState<number>(0);
  const [pointerRight, setPointerRight] = useState<number>(1);
  const [hashMapEntries, setHashMapEntries] = useState<Array<{ key: number; val: number }>>([]);
  const [highlightCodeLine, setHighlightCodeLine] = useState<number>(1);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const sampleArray = [2, 7, 11, 15];
  const target = 9;

  const scenes: DailyLectureScene[] = [
    {
      title: "Scene 1: Problem Anatomy & Brute Force Trap",
      subtitle: "Why nested iteration O(N²) fails large constraints",
      visualType: "pointers",
      explanation: "Given array [2, 7, 11, 15] and target 9, a naive nested loop checks all n times n minus 1 pairs. For a hundred thousand elements, this triggers Time Limit Exceeded. We need an immediate complement lookup.",
      codeHighlight: "// Brute Force (Nested Loop) -> O(N^2) Too Slow!\nfor (int i = 0; i < n; i++) {\n  for (int j = i + 1; j < n; j++) {\n    if (nums[i] + nums[j] == target) return {i, j};\n  }\n}",
    },
    {
      title: "Scene 2: The Hash Map Epiphany",
      subtitle: "Trading O(N) auxiliary space for O(1) instantaneous lookup",
      visualType: "hashmap",
      explanation: "Instead of searching forward, we compute complement equals target minus current value. As we visit index 0, value 2, needed complement is 7. We register key 2 with index 0 in our hash map.",
      codeHighlight: "int complement = target - nums[i];\nif (map.containsKey(complement)) {\n    return new int[]{ map.get(complement), i };\n}\nmap.put(nums[i], i);",
    },
    {
      title: "Scene 3: Optimal Match & Complexity Verdict",
      subtitle: "One pass traversal finishes in O(N) time with O(N) space",
      visualType: "hashmap",
      explanation: "Next at index 1, value 7. Complement is 9 minus 7, which equals 2. We query map: key 2 is already stored at index 0! Instant match in O(1). Output indices 0 and 1.",
      codeHighlight: "// Target 9 matched!\n// Stored complement: key=2 at index=0\n// Current index=1\nreturn [0, 1];",
    },
  ];

  // Auto-step through scenes when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSceneIdx((prev) => (prev + 1) % scenes.length);
    }, 7500); // Increased time slightly for better voice pacing
    return () => clearInterval(timer);
  }, [isPlaying, scenes.length]);

  // Update visual state and trigger voice when scene changes
  useEffect(() => {
    if (currentSceneIdx === 0) {
      setPointerLeft(0);
      setPointerRight(1);
      setHashMapEntries([]);
      setHighlightCodeLine(1);
    } else if (currentSceneIdx === 1) {
      setPointerLeft(0);
      setPointerRight(0);
      setHashMapEntries([{ key: 2, val: 0 }]);
      setHighlightCodeLine(2);
    } else {
      setPointerLeft(0);
      setPointerRight(1);
      setHashMapEntries([{ key: 2, val: 0 }, { key: 7, val: 1 }]);
      setHighlightCodeLine(3);
    }

    if (isVoiceEnabled && synthRef.current) {
      synthRef.current.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(scenes[currentSceneIdx].explanation);
      // Optional: Adjust voice properties
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      synthRef.current.speak(utterance);
    }
  }, [currentSceneIdx, isVoiceEnabled]);

  const toggleVoice = () => {
    if (isVoiceEnabled && synthRef.current) {
      synthRef.current.cancel();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const currentScene = scenes[currentSceneIdx];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mb-8">
      
      {/* Lecture Header Banner */}
      <div className="bg-slate-900 text-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              {topic}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
              {difficulty}
            </span>
            <span className="flex items-center text-xs text-amber-400 font-semibold gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Whiteboard
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight mt-1 text-slate-900">
            {problemTitle}
          </h2>
        </div>

        {/* Scene progress pills */}
        <div className="flex items-center space-x-2">
          {scenes.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSceneIdx(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSceneIdx
                  ? 'w-8 bg-indigo-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={s.title}
            />
          ))}
        </div>
      </div>

      {/* Main Whiteboard Canvas & Visualizer */}
      <div className="p-6 bg-slate-950 text-slate-100 min-h-[320px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

        {/* Scene Subtitle and Stage */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-400 font-bold tracking-wider">
              STAGE {currentSceneIdx + 1}/{scenes.length}: {currentScene.title}
            </span>
            <span className="text-xs font-mono text-slate-600">Target = {target}</span>
          </div>
          <p className="text-sm font-medium text-slate-700 mt-1 max-w-2xl">
            {currentScene.subtitle}
          </p>
        </div>

        {/* Dynamic Visual Area */}
        <div className="relative z-10 my-6 flex flex-col md:flex-row items-center justify-around gap-8">
          
          {/* Array Visualizer with Pointers */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-mono text-slate-600 mb-2">Input Array nums</span>
            <div className="flex items-center space-x-2">
              {sampleArray.map((val, idx) => {
                const isLeft = idx === pointerLeft;
                const isRight = idx === pointerRight;
                const isMatched = currentSceneIdx === 2 && (idx === 0 || idx === 1);

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-lg transition-all duration-300 ${
                        isMatched
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 scale-105 shadow-lg shadow-emerald-500/30'
                          : isLeft || isRight
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                          : 'border-slate-200 bg-slate-900 text-slate-700'
                      }`}
                    >
                      {val}
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 mt-1">idx {idx}</span>
                    <div className="h-5 flex items-center justify-center">
                      {isLeft && (
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950 px-1 rounded">
                          ptr i
                        </span>
                      )}
                      {!isLeft && isRight && currentSceneIdx !== 1 && (
                        <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950 px-1 rounded">
                          ptr j
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hash Map State Visualizer */}
          <div className="bg-slate-900/80 border border-slate-200 rounded-xl p-4 w-full md:w-64 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-600 font-bold">
              <span>HashMap (Complement Tracker)</span>
            </div>
            <div className="mt-3 space-y-1.5 min-h-[70px]">
              {hashMapEntries.length === 0 ? (
                <div className="text-slate-600 italic text-center py-4">Empty hash map &#123; &#125;</div>
              ) : (
                hashMapEntries.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-indigo-950/60 border border-indigo-900/60 px-2.5 py-1.5 rounded text-indigo-200"
                  >
                    <span>Key (val): <strong className="text-slate-900">{e.key}</strong></span>
                    <span>Idx: <strong className="text-amber-400">{e.val}</strong></span>
                  </div>
                ))
              )}
            </div>
            {currentSceneIdx === 2 && (
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Target 9 found: 2 + 7 = 9
              </div>
            )}
          </div>

        </div>

        {/* Code Walkthrough Preview */}
        {currentScene.codeHighlight && (
          <div className="relative z-10 bg-slate-900 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-700 overflow-x-auto">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Code className="w-3 h-3 text-indigo-400" /> Algorithmic Logic
            </div>
            <pre className="text-indigo-200 whitespace-pre">{currentScene.codeHighlight}</pre>
          </div>
        )}

      </div>

      {/* Explanation Text Box */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {currentScene.explanation}
        </p>
      </div>

      {/* Player Controls Toolbar */}
      <div className="px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-slate-900 font-bold transition flex items-center space-x-1 text-xs"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button
            onClick={() => {
              setCurrentSceneIdx(0);
              setIsPlaying(true);
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Restart lecture"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentSceneIdx((prev) => (prev > 0 ? prev - 1 : scenes.length - 1))}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Previous scene"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentSceneIdx((prev) => (prev + 1) % scenes.length)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Next scene"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={toggleVoice}
            className={`p-2 rounded-xl transition ${isVoiceEnabled ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title={isVoiceEnabled ? "Mute Voice Explanation" : "Enable Voice Explanation"}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Scene {currentSceneIdx + 1} of {scenes.length}
        </div>
      </div>

    </div>
  );
};
