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

    // Revert the disastrous text color replacements in dark mode
    content = content.replace(/dark:text-slate-700/g, 'dark:text-slate-300');
    content = content.replace(/dark:text-slate-900/g, 'dark:text-slate-100'); // Some might have been converted to 900
    // Wait, fix_dark_mode.js already did dark:text-slate-900 -> dark:text-white, so this is just a backup.
    // What about dark:text-slate-600? My script did dark:text-slate-600 -> dark:text-slate-400. Let's make sure it's 400.
    
    // Check if there are any dark:bg-white that shouldn't be there
    // Actually, dark:bg-white might be valid in some places (like for inverted buttons).

    fs.writeFileSync(file, content, 'utf8');
});

console.log("Done fixing global dark text!");
