const fs = require('fs');

const css = fs.readFileSync('style.css', 'utf8');

// Find selectors with modal, popup, dropdown, menu, popover, sheet, context
const classMatches = css.match(/\.([a-z0-9_-]*(?:modal|popup|dropdown|context|popover|sheet|picker)[a-z0-9_-]*)/gi);
const uniqueClasses = Array.from(new Set(classMatches ? classMatches.map(c => c.trim()) : [])).sort();

console.log('Total unique classes related to popups/modals in style.css:', uniqueClasses.length);

// Also let's check for any other context menus in JS or HTML
const html = fs.readFileSync('index.html', 'utf8');

// Let's see if there are any context menus on tasks, notes, etc.
console.log('\n--- Checking contextmenu events in app.js ---');
const appJs = fs.readFileSync('app.js', 'utf8');
const contextMenuMatches = [];
appJs.split('\n').forEach((line, idx) => {
  if (line.includes('contextmenu') || line.includes('longpress') || line.includes('showMenu') || line.includes('contextPopup')) {
    contextMenuMatches.push(`L${idx+1}: ${line.trim()}`);
  }
});
console.log('contextmenu references in app.js:', contextMenuMatches.length);
contextMenuMatches.slice(0, 20).forEach(m => console.log(m));
