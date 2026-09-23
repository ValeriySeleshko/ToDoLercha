const fs = require('fs');

function findModalsInHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  console.log(`--- Analyzing ${filePath} ---`);

  // Look for elements with class containing modal, popup, sheet, dialog, dropdown, menu, etc.
  // Or look for modal-backdrop, modal-header, etc.
  const regex = /<([a-z0-9]+)[^>]*\b(id|class)=["']([^"']*(?:modal|popup|sheet|dialog|menu|drawer|overlay|backdrop)[^"']*)["'][^>]*>/gi;
  
  // Also find all h2/h3 inside modals or titles
  const modalBlocks = [];
  const lines = html.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('modal-sheet') || line.includes('modal-backdrop') || line.includes('role="dialog"') || line.includes('class="modal') || line.includes('modal-overlay')) {
      // Find nearby headings or IDs
      let context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 15)).join('\n');
      modalBlocks.push({ lineNum: i + 1, line: line.trim() });
    }
  }
  
  console.log(`Found ${modalBlocks.length} modal triggers/containers.`);
  modalBlocks.forEach(b => console.log(`L${b.lineNum}: ${b.line}`));
}

findModalsInHtml('index.html');
