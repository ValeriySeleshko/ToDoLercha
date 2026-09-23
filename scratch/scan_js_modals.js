const fs = require('fs');
const path = require('path');

const jsFiles = [
  'app.js',
  'finance_tracker.js',
  'nutrition_tracker.js',
  'cycle_tracker.js',
  'joy_tracker.js',
  'pet_system.js',
  'stickers_system.js',
  'achievements_system.js',
  'maine_quests.js'
];

jsFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  
  // Look for popup/modal/menu creation or references
  const matches = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.match(/(?:createCustomAlert|createCustomConfirm|showConfirmModal|showModal|openModal|openSheet|toggleDropdown|contextMenu|popup|dropdown|bottomSheet)/i)) {
      matches.push({ lineNum: idx + 1, text: line.trim() });
    }
  });
  console.log(`=== ${file}: ${matches.length} matches ===`);
  matches.slice(0, 15).forEach(m => console.log(`  L${m.lineNum}: ${m.text.substring(0, 100)}`));
});
