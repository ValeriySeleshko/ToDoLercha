const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Find all backdrops and their inner structure
const backdropRegex = /<div[^>]*class="[^"]*(?:modal-backdrop|popover-backdrop|sheet-backdrop)[^"]*"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*(?=<!--|<div class="modal-backdrop|<div class="sheet-export-backdrop|<\/body|$)/gi;

// Also find all dropdowns / popups
const allBackdrops = [];
const lines = html.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/<div[^>]*class="([^"]*(?:modal-backdrop|popover-backdrop|sheet-backdrop|dropdown|context-menu|popup)[^"]*)"[^>]*id="([^"]+)"/i)
         || line.match(/<div[^>]*id="([^"]+)"[^>]*class="([^"]*(?:modal-backdrop|popover-backdrop|sheet-backdrop|dropdown|context-menu|popup)[^"]*)"/i);
  if (m) {
    // determine id and class
    let id = m[1].includes(' ') ? m[2] : m[1];
    let cls = m[1].includes(' ') ? m[1] : m[2];
    allBackdrops.push({ lineNum: i + 1, id, cls });
  }
}

console.log('Candidate elements:', allBackdrops.length);
allBackdrops.forEach(b => console.log(`L${b.lineNum}: id="${b.id}", class="${b.cls}"`));
