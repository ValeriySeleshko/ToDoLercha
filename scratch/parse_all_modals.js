const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Regex to find all elements with class="modal-backdrop..." or role="dialog" or class="...sheet..." or id="...Modal..."
const lines = html.split('\n');
const results = [];

let currentModal = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check for modal backdrop
  const backdropMatch = line.match(/id="([^"]*ModalBackdrop|[^"]*Backdrop|[^"]*Overlay|[^"]*SheetBackdrop)"/i) 
    || line.match(/class="[^"]*(?:modal-backdrop|popup-overlay|drawer-backdrop|sheet-backdrop)[^"]*"\s+id="([^"]+)"/i)
    || line.match(/id="([^"]+)"\s+class="[^"]*(?:modal-backdrop|popup-overlay)[^"]*"/i);
    
  if (backdropMatch) {
    if (currentModal) results.push(currentModal);
    currentModal = {
      backdropId: backdropMatch[1],
      line: i + 1,
      title: null,
      headings: [],
      buttons: [],
      classes: line.trim()
    };
  }
  
  if (currentModal) {
    // Look for headings inside this modal block (up to 60 lines or next backdrop)
    const hMatch = line.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    if (hMatch) {
      const cleanH = hMatch[1].replace(/<[^>]+>/g, '').trim();
      if (cleanH) currentModal.headings.push(cleanH);
    }
    const dataI18n = line.match(/data-i18n="([^"]+)"/i);
    if (dataI18n && !currentModal.i18n) {
      currentModal.i18n = dataI18n[1];
    }
    const ariaLabelledby = line.match(/aria-labelledby="([^"]+)"/i);
    if (ariaLabelledby) {
      currentModal.ariaLabelledby = ariaLabelledby[1];
    }
  }
}
if (currentModal) results.push(currentModal);

console.log('--- FOUND MODALS IN index.html: ' + results.length + ' ---');
results.forEach((m, idx) => {
  console.log(`${idx + 1}. ID: ${m.backdropId} (L${m.line})`);
  console.log(`   Headings: ${m.headings.join(' | ') || 'None found in initial scan'}`);
  if (m.ariaLabelledby) console.log(`   aria-labelledby: ${m.ariaLabelledby}`);
});
