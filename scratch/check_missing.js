const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const catalog = JSON.parse(fs.readFileSync('scratch/catalog.json', 'utf8'));

// Find any tags with id containing 'Modal', 'Popup', 'Menu', 'Dropdown', 'Sheet', 'Drawer'
const matches = html.match(/id="([^"]*(?:Modal|Popup|Menu|Dropdown|Sheet|Picker)[^"]*)"/gi);
const found = Array.from(new Set(matches ? matches.map(m => m.replace(/id="|"/gi, '')) : [])).sort();

console.log('Total found in HTML:', found.length);
found.forEach(id => {
  const inCat = catalog.some(c => c.id === id || (c.selector && c.selector.includes(id)));
  if (!inCat) console.log('  Not in catalog directly:', id);
});
