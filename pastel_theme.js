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

    // Remove gradients
    content = content.replace(/bg-gradient-to-[a-z]+ from-[a-z]+-\d+\/\d+ to-[a-z]+-\d+\/\d+/g, 'bg-slate-100');
    content = content.replace(/bg-gradient-to-[a-z]+ from-\[#[a-zA-Z0-9]+\] to-\[#[a-zA-Z0-9]+\]/g, 'bg-slate-100');
    content = content.replace(/bg-gradient-to-[a-z]+ from-[a-z]+-\d+ to-[a-z]+-\d+/g, 'bg-slate-100');

    // Convert Dark hardcoded to Pastel Light
    content = content.replace(/bg-\[#1a1a1a\]/g, 'bg-[#fdfbf7]'); // warm pastel background
    content = content.replace(/bg-\[#1e1e1e\]/g, 'bg-[#f4f1ea]'); // sidebar
    content = content.replace(/bg-\[#2a2a2a\]/g, 'bg-white'); // widgets/cards
    content = content.replace(/bg-\[#333\]/g, 'bg-slate-100'); 
    content = content.replace(/border-slate-800/g, 'border-slate-200');
    content = content.replace(/border-slate-700/g, 'border-slate-200');
    content = content.replace(/border-white\/10/g, 'border-slate-200');
    content = content.replace(/border-white\/5/g, 'border-slate-200');
    
    // Text colors
    content = content.replace(/text-slate-300/g, 'text-slate-700');
    content = content.replace(/text-white/g, 'text-slate-900');
    content = content.replace(/text-slate-400/g, 'text-slate-500');
    content = content.replace(/text-slate-500/g, 'text-slate-600');
    content = content.replace(/hover:text-white/g, 'hover:text-slate-900');
    
    // Hover backgrounds
    content = content.replace(/hover:bg-white\/10/g, 'hover:bg-slate-100');
    content = content.replace(/hover:bg-white\/5/g, 'hover:bg-slate-50');
    content = content.replace(/bg-white\/10/g, 'bg-slate-200');
    content = content.replace(/bg-white\/5/g, 'bg-slate-100');

    // Misc
    content = content.replace(/bg-\[#1e1e1e\]\/50/g, 'bg-slate-50');
    
    fs.writeFileSync(file, content, 'utf8');
});

console.log("Done replacing colors!");
