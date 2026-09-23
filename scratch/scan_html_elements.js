const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Check all elements with role="dialog", class containing "modal", "sheet", "menu", "dropdown", "popup", "drawer"
const lines = html.split('\n');

console.log('--- Inspecting index.html for all menu / popup / modal elements ---');

// Find all elements with role="dialog" or class="modal-sheet..." or class="dropdown..." or class="context-menu..."
const foundElements = [];

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  if (/class="[^"]*(?:modal-sheet|modal-backdrop|dropdown|context-menu|action-sheet|popover|bottom-sheet|picker-sheet|popup)[^"]*"/i.test(line) ||
      /role="dialog"/i.test(line) ||
      /id="[^"]*(?:Menu|Modal|Popup|Dialog|Sheet|Picker|Drawer)[^"]*"/i.test(line)) {
    // Only interesting tags
    if (/<(div|dialog|aside|nav|ul|section)[^>]+>/i.test(line)) {
      foundElements.push({ lineNum, line: line.trim() });
    }
  }
});

console.log(`Found ${foundElements.length} candidate lines.`);
foundElements.forEach(f => {
  if (!f.line.includes('modal-header') && !f.line.includes('modal-actions') && !f.line.includes('modal-form') && !f.line.includes('modal-body') && !f.line.includes('modal-close')) {
    console.log(`L${f.lineNum}: ${f.line.substring(0, 120)}`);
  }
});
