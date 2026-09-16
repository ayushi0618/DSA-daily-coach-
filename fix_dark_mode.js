const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./web/src/components');
files.push(path.resolve('./web/src/App.tsx'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Fix broken dark mode prefixes from previous script
    content = content.replace(/dark:text-slate-900/g, 'dark:text-white');
    content = content.replace(/dark:border-slate-200/g, 'dark:border-slate-800');
    content = content.replace(/dark:text-slate-600/g, 'dark:text-slate-400');
    content = content.replace(/dark:hover:text-slate-900/g, 'dark:hover:text-white');
    
    // Convert hardcoded pastel light colors to toggle between light and dark
    content = content.replace(/bg-\[#fdfbf7\]/g, 'bg-[#fdfbf7] dark:bg-[#1a1a1a]'); 
    content = content.replace(/bg-\[#f4f1ea\]/g, 'bg-[#f4f1ea] dark:bg-[#1e1e1e]'); 
    
    // For bg-white, if it doesn't already have a dark prefix, add dark:bg-[#2a2a2a]
    // We will do this carefully using a regex that looks for bg-white NOT followed by dark:bg
    // Actually, bg-white was a replacement for bg-[#2a2a2a]. 
    // Let's replace 'bg-white' with 'bg-white dark:bg-[#2a2a2a]' but avoid duplicates
    // And for text-slate-700, replace with text-slate-700 dark:text-slate-300
    // And text-slate-500 -> text-slate-500 dark:text-slate-400
    // And text-slate-600 -> text-slate-600 dark:text-slate-500

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Done fixing simple dark prefixes!");
