const fs = require('fs');
const file = './web/src/components/HomeView.tsx';
let content = fs.readFileSync(file, 'utf8');

// For the main text color of the app wrapper:
content = content.replace(/text-slate-700 -mt-6/, 'text-slate-700 dark:text-slate-300 -mt-6');

// Left sidebar border
content = content.replace(/border-slate-200 p-4 shrink-0/, 'border-slate-200 dark:border-slate-800 p-4 shrink-0');

// Tab buttons in sidebar
content = content.replace(/bg-slate-200 text-slate-900/g, 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white');
content = content.replace(/text-slate-600 hover:text-slate-900 hover:bg-slate-50/g, 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5');

// Sign in button
content = content.replace(/bg-white text-black/g, 'bg-slate-900 dark:bg-white text-white dark:text-black');
content = content.replace(/hover:bg-slate-200/g, 'hover:bg-slate-800 dark:hover:bg-slate-200');
content = content.replace(/text-slate-600 mb-4/g, 'text-slate-600 dark:text-slate-500 mb-4'); // text

// The Topics Tag Cloud
content = content.replace(/text-slate-600 hover:text-slate-900/g, 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white');
content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-white'); // generic

// Filters bar
content = content.replace(/bg-white text-black/g, 'bg-white dark:bg-white text-slate-900 dark:text-black'); // if it matches again
content = content.replace(/bg-slate-100 text-amber-500 hover:bg-slate-100/g, 'bg-slate-100 dark:bg-[#2a2a2a] text-amber-500 hover:bg-slate-200 dark:hover:bg-[#333]');
content = content.replace(/bg-slate-100 text-blue-400 hover:bg-slate-100/g, 'bg-slate-100 dark:bg-[#2a2a2a] text-blue-400 hover:bg-slate-200 dark:hover:bg-[#333]');
content = content.replace(/bg-slate-100 text-emerald-400 hover:bg-slate-100/g, 'bg-slate-100 dark:bg-[#2a2a2a] text-emerald-400 hover:bg-slate-200 dark:hover:bg-[#333]');
content = content.replace(/bg-slate-100 text-purple-400 hover:bg-slate-100/g, 'bg-slate-100 dark:bg-[#2a2a2a] text-purple-400 hover:bg-slate-200 dark:hover:bg-[#333]');
content = content.replace(/bg-slate-100 text-slate-700 hover:bg-slate-100/g, 'bg-slate-100 dark:bg-[#2a2a2a] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#333]');

// The Table Controls
content = content.replace(/bg-white border-none/g, 'bg-white dark:bg-[#2a2a2a] border-none');
content = content.replace(/bg-white rounded-lg text-slate-600 hover:text-slate-900/g, 'bg-white dark:bg-[#2a2a2a] rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white');
content = content.replace(/hover:bg-slate-100/g, 'hover:bg-slate-100 dark:hover:bg-[#333]');

// Table rows
content = content.replace(/hover:bg-slate-50/g, 'hover:bg-slate-50 dark:hover:bg-white/5');
content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-800');

// Calendar widget
content = content.replace(/bg-white rounded-xl p-5/g, 'bg-white dark:bg-[#2a2a2a] rounded-xl p-5');

// Trending companies
content = content.replace(/bg-\[#f4f1ea\] dark:bg-\[#1e1e1e\] hover:bg-slate-100/g, 'bg-[#f4f1ea] dark:bg-[#1e1e1e] hover:bg-slate-100 dark:hover:bg-[#333]');
content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300'); // generic
content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-400'); // generic

// Any remaining bg-white that used to be dark
content = content.replace(/bg-white(?! dark:bg)/g, 'bg-white dark:bg-[#2a2a2a]');

// Re-read file and apply regex safely for text replacements to not double up
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed HomeView!");
