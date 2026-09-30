import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Play, Pause, Shuffle, RotateCcw, StepForward, StepBack, Gauge, Award, Binary } from 'lucide-react';
import { StorageService } from '../services/storageService';

type AlgoId = 'bubble' | 'merge' | 'quick' | 'binary';

interface VizStep {
  arr: number[];
  cmp?: [number, number];
  swap?: [number, number];
  sortedIdx?: number[];
  pivot?: number;
  low?: number;
  mid?: number;
  high?: number;
  found?: number;
  label: string;
}

const ALGOS: Array<{
  id: AlgoId;
  name: string;
  time: string;
  space: string;
  blurb: string;
}> = [
  { id: 'bubble', name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', blurb: 'Repeatedly swaps adjacent out-of-order pairs. Simple, but quadratic.' },
  { id: 'merge', name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', blurb: 'Divide & conquer: split, sort halves, merge. Stable and predictable.' },
  { id: 'quick', name: 'Quick Sort', time: 'O(n log n) avg', space: 'O(log n)', blurb: 'Partitions around a pivot. Fast in practice, O(n²) worst case.' },
  { id: 'binary', name: 'Binary Search', time: 'O(log n)', space: 'O(1)', blurb: 'Halves a sorted array each step. The poster child of logarithmic time.' },
];

function shuffledArray(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => 5 + Math.floor(Math.random() * 95));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function bubbleSteps(input: number[]): VizStep[] {
  const a = [...input];
  const steps: VizStep[] = [{ arr: [...a], label: 'Initial array' }];
  const sorted: number[] = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      steps.push({ arr: [...a], cmp: [j, j + 1], sortedIdx: [...sorted], label: `Compare a[${j}] and a[${j + 1}]` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ arr: [...a], swap: [j, j + 1], sortedIdx: [...sorted], label: `Swap → ${a[j]} moves left` });
      }
    }
    sorted.unshift(a.length - 1 - i);
    steps.push({ arr: [...a], sortedIdx: [...sorted], label: `Position ${a.length - 1 - i} locked in` });
  }
  steps.push({ arr: [...a], sortedIdx: a.map((_, i) => i), label: 'Sorted ✓' });
  return steps;
}

function mergeSteps(input: number[]): VizStep[] {
  const a = [...input];
  const steps: VizStep[] = [{ arr: [...a], label: 'Initial array' }];
  const sorted: number[] = [];

  function merge(l: number, m: number, r: number) {
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      steps.push({ arr: [...a], cmp: [l + i, m + 1 + j], sortedIdx: [...sorted], label: `Merge: compare ${left[i]} vs ${right[j]}` });
      if (left[i] <= right[j]) a[k] = left[i++];
      else a[k] = right[j++];
      steps.push({ arr: [...a], swap: [k, k], sortedIdx: [...sorted], label: `Write ${a[k]} at index ${k}` });
      k++;
    }
    while (i < left.length) { a[k] = left[i++]; steps.push({ arr: [...a], swap: [k, k], sortedIdx: [...sorted], label: `Write ${a[k]} at index ${k}` }); k++; }
    while (j < right.length) { a[k] = right[j++]; steps.push({ arr: [...a], swap: [k, k], sortedIdx: [...sorted], label: `Write ${a[k]} at index ${k}` }); k++; }
  }

  function sort(l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    steps.push({ arr: [...a], cmp: [l, r], sortedIdx: [...sorted], label: `Split [${l}…${r}] at ${m}` });
    sort(l, m);
    sort(m + 1, r);
    merge(l, m, r);
    steps.push({ arr: [...a], swap: [l, r], sortedIdx: [...sorted], label: `Segment [${l}…${r}] merged` });
  }

  sort(0, a.length - 1);
  steps.push({ arr: [...a], sortedIdx: a.map((_, i) => i), label: 'Sorted ✓' });
  return steps;
}

function quickSteps(input: number[]): VizStep[] {
  const a = [...input];
  const steps: VizStep[] = [{ arr: [...a], label: 'Initial array' }];
  const sorted: number[] = [];

  function partition(lo: number, hi: number): number {
    const pivot = a[hi];
    let i = lo;
    steps.push({ arr: [...a], pivot: hi, sortedIdx: [...sorted], label: `Pivot = ${pivot} (index ${hi})` });
    for (let j = lo; j < hi; j++) {
      steps.push({ arr: [...a], cmp: [j, hi], pivot: hi, sortedIdx: [...sorted], label: `Is ${a[j]} < pivot ${pivot}?` });
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        if (i !== j) steps.push({ arr: [...a], swap: [i, j], pivot: hi, sortedIdx: [...sorted], label: `Swap ${a[j]} ↔ ${a[i]}` });
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    steps.push({ arr: [...a], swap: [i, hi], sortedIdx: [...sorted], label: `Pivot ${pivot} lands at index ${i}` });
    return i;
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) {
      if (lo === hi) { sorted.push(lo); steps.push({ arr: [...a], sortedIdx: [...sorted], label: `Index ${lo} fixed` }); }
      return;
    }
    const p = partition(lo, hi);
    sorted.push(p);
    steps.push({ arr: [...a], sortedIdx: [...sorted], label: `Index ${p} locked in` });
    sort(lo, p - 1);
    sort(p + 1, hi);
  }

  sort(0, a.length - 1);
  steps.push({ arr: [...a], sortedIdx: a.map((_, i) => i), label: 'Sorted ✓' });
  return steps;
}

function binarySteps(n: number): { steps: VizStep[]; target: number } {
  const set = new Set<number>();
  while (set.size < n) set.add(5 + Math.floor(Math.random() * 95));
  const a = [...set].sort((x, y) => x - y);
  const target = a[Math.floor(Math.random() * a.length)];
  const steps: VizStep[] = [{ arr: [...a], label: `Sorted array · searching for ${target}` }];
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ arr: [...a], low: lo, mid, high: hi, label: `Check mid=${mid} (value ${a[mid]})` });
    if (a[mid] === target) {
      steps.push({ arr: [...a], found: mid, label: `Found ${target} at index ${mid} ✓` });
      break;
    } else if (a[mid] < target) {
      lo = mid + 1;
      steps.push({ arr: [...a], low: lo, high: hi, label: `${a[mid]} < ${target} → search right half` });
    } else {
      hi = mid - 1;
      steps.push({ arr: [...a], low: lo, high: hi, label: `${a[mid]} > ${target} → search left half` });
    }
  }
  return { steps, target };
}

interface VisualizerViewProps {
  onXP: () => void;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({ onXP }) => {
  const [algo, setAlgo] = useState<AlgoId>('bubble');
  const [arraySize, setArraySize] = useState(18);
  const [speed, setSpeed] = useState(5);
  const [seed, setSeed] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const xpAwarded = useRef(false);

  const { steps } = useMemo(() => {
    if (algo === 'binary') {
      const { steps: s } = binarySteps(Math.min(28, Math.max(8, arraySize)));
      return { steps: s };
    }
    const arr = shuffledArray(arraySize);
    if (algo === 'merge') return { steps: mergeSteps(arr) };
    if (algo === 'quick') return { steps: quickSteps(arr) };
    return { steps: bubbleSteps(arr) };
  }, [algo, arraySize, seed]);

  // Derive the binary-search target from the final "found" step for display
  useEffect(() => {
    if (algo === 'binary') {
      const found = steps.find(s => s.found !== undefined);
      setTarget(found ? found.arr[found.found as number] : null);
    } else {
      setTarget(null);
    }
    setStepIdx(0);
    setPlaying(false);
    xpAwarded.current = false;
  }, [algo, arraySize, seed, steps]);

  const delay = Math.max(40, 640 - speed * 58);

  useEffect(() => {
    if (!playing) return;
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      if (!xpAwarded.current) {
        xpAwarded.current = true;
        StorageService.addXP(25);
        onXP();
      }
      return;
    }
    const t = setTimeout(() => setStepIdx(i => Math.min(i + 1, steps.length - 1)), delay);
    return () => clearTimeout(t);
  }, [playing, stepIdx, steps.length, delay, onXP]);

  const step: VizStep = steps[stepIdx];
  const maxVal = Math.max(...step.arr, 1);
  const meta = ALGOS.find(a => a.id === algo)!;

  const barColor = (i: number): string => {
    if (step.found === i) return 'bg-emerald-500 dark:bg-emerald-400';
    if (step.sortedIdx?.includes(i)) return 'bg-emerald-400/80 dark:bg-emerald-500/80';
    if (step.swap && (step.swap[0] === i || step.swap[1] === i)) return 'bg-rose-500 dark:bg-rose-400';
    if (step.pivot === i) return 'bg-purple-500 dark:bg-purple-400';
    if (step.mid === i) return 'bg-indigo-500 dark:bg-indigo-400';
    if (step.cmp && (step.cmp[0] === i || step.cmp[1] === i)) return 'bg-amber-400 dark:bg-amber-300';
    if (step.low !== undefined && step.high !== undefined && i >= step.low && i <= step.high) return 'bg-sky-400/70 dark:bg-sky-500/70';
    return 'bg-slate-300 dark:bg-slate-600';
  };

  const reset = () => { setStepIdx(0); setPlaying(false); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Binary className="w-5 h-5 text-indigo-500" />
          Algorithm Visualizer
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Watch sorting & searching come alive. Finish a run to earn <span className="font-bold text-amber-600 dark:text-amber-400">+25 XP</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ALGOS.map(a => (
            <button
              key={a.id}
              onClick={() => setAlgo(a.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                algo === a.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">time {meta.time}</span>
          <span className="font-mono text-[11px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">space {meta.space}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">{meta.blurb}</span>
        </div>
      </div>

      {/* Stage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
            step <span className="text-indigo-600 dark:text-indigo-400 font-bold">{stepIdx + 1}</span> / {steps.length}
          </div>
          {algo === 'binary' && target !== null && (
            <div className="font-mono text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
              target = {target}
            </div>
          )}
        </div>

        <div className="h-56 sm:h-64 flex items-end justify-center gap-[3px] sm:gap-1 border-b-2 border-slate-200 dark:border-slate-700 pb-0 px-2">
          {step.arr.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all duration-150 ${barColor(i)}`}
              style={{ height: `${(v / maxVal) * 100}%`, maxWidth: 44 }}
              title={`index ${i}: ${v}`}
            />
          ))}
        </div>
        {step.arr.length <= 20 && (
          <div className="flex justify-center gap-[3px] sm:gap-1 px-2 mt-1 font-mono text-[9px] text-slate-500 dark:text-slate-400">
            {step.arr.map((v, i) => (
              <div key={i} className="flex-1 text-center truncate" style={{ maxWidth: 44 }}>{v}</div>
            ))}
          </div>
        )}

        <p className="mt-4 text-center text-xs font-mono text-slate-600 dark:text-slate-300 min-h-[1.25rem]">
          <span className="text-indigo-500">›</span> {step.label}
        </p>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> compare</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> swap / write</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> sorted / found</span>
          {algo === 'quick' && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> pivot</span>}
          {algo === 'binary' && <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-sky-400" /> search range</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPlaying(p => !p)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/25"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? 'Pause' : stepIdx >= steps.length - 1 ? 'Replay' : 'Play'}
          </button>
          <button onClick={() => setStepIdx(i => Math.max(0, i - 1))} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition" title="Step back">
            <StepBack className="w-4 h-4" />
          </button>
          <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition" title="Step forward">
            <StepForward className="w-4 h-4" />
          </button>
          <button onClick={reset} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition" title="Reset">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSeed(s => s + 1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            <Shuffle className="w-4 h-4" /> Shuffle
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-500" /> Speed <span className="font-mono text-slate-500">{speed}x</span>
            </span>
            <input type="range" min={1} max={10} value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full accent-indigo-600" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Array size <span className="font-mono text-slate-500">{algo === 'binary' ? Math.min(28, Math.max(8, arraySize)) : arraySize}</span>
            </span>
            <input type="range" min={8} max={40} value={arraySize} onChange={e => setArraySize(Number(e.target.value))} className="w-full accent-indigo-600" />
          </label>
        </div>

        {stepIdx >= steps.length - 1 && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2">
            <Award className="w-4 h-4" />
            Run complete in {steps.length} steps — +25 XP earned!
          </div>
        )}
      </div>
    </div>
  );
};
