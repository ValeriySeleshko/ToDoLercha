const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// List of all backdrops and popups we identified
const ids = [
  'modulesHubDropdown',
  'taskModalBackdrop',
  'newTabModalBackdrop',
  'editTabModalBackdrop',
  'habitModalBackdrop',
  'habitPeriodDropdownWrap',
  'habitPeriodDropdownMenu',
  'habitStepperBackdrop',
  'newSectionModalBackdrop',
  'sectionMenuModalBackdrop',
  'settingsModalBackdrop',
  'langDropdownMenu',
  'calendarModalBackdrop',
  'cycleModalBackdrop',
  'cycleAddModalBackdrop',
  'financeModalBackdrop',
  'financeEntryModalBackdrop',
  'financeCategoryModalBackdrop',
  'financeDatePickerModalBackdrop',
  'joyModalBackdrop',
  'joyJarModalBackdrop',
  'joyStickerPickerBackdrop',
  'nutritionModalBackdrop',
  'hungerCatColorPopup',
  'nutritionAddFoodModalBackdrop',
  'nutritionBarcodeScannerModalBackdrop',
  'nutritionStatsModalBackdrop',
  'nutritionSettingsModalBackdrop',
  'nutritionCalcModalBackdrop',
  'editMealModalBackdrop',
  'macroColorModalBackdrop',
  'achievementsModalBackdrop',
  'confirmModalBackdrop',
  'imageLightboxBackdrop',
  'petModalBackdrop',
  'petSettingsPopup',
  'stickersModalBackdrop',
  'stickerContextPopup',
  'sheetExportModalBackdrop'
];

ids.forEach(id => {
  const idx = html.indexOf(id);
  if (idx === -1) {
    console.log(`NOT FOUND: ${id}`);
    return;
  }
  
  // Extract snippet around this ID
  const start = Math.max(0, idx - 100);
  const end = Math.min(html.length, idx + 600);
  const snippet = html.substring(start, end);
  
  // Extract title / h2 / h3 / aria-labelledby / data-i18n
  const hMatch = snippet.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
  const heading = hMatch ? hMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  
  const titleAttr = snippet.match(/title="([^"]+)"/i);
  const title = titleAttr ? titleAttr[1] : '';
  
  console.log(`\n=== ID: ${id} ===`);
  if (heading) console.log(`  Heading: "${heading}"`);
  if (title) console.log(`  Title: "${title}"`);
  
  // First tag
  const tagMatch = snippet.substring(idx - 30, idx + 100).match(/<[a-z0-9]+[^>]+id=["']?${id}["']?[^>]*>/i);
  // console.log(`  Tag: ${tagMatch ? tagMatch[0] : 'n/a'}`);
});
