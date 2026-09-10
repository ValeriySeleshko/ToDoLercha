const fs = require('fs');
const path = require('path');

// 1. Read the converted habits
const rawJsonPath = 'C:\\Users\\valer\\Desktop\\Habits\\Plan4U_Converted_Habits.json';
const rawHabits = JSON.parse(fs.readFileSync(rawJsonPath, 'utf8'));

// Give clean semantic IDs
const idMap = {
  '💊 Vitamin D': 'h_vitamin_d',
  '🤸 Зарядка': 'h_zaryadka',
  '📖 Библия': 'h_bibliya',
  '💆 Массаж лица': 'h_massazh_litsa',
  '🏋️ Треня': 'h_trenya',
  '🚶 Шаги': 'h_shagi',
  '🥗 Без вредных сладостей': 'h_sladosti'
};

const wifeHabits = rawHabits.map(h => {
  return {
    id: idMap[h.title] || h.id,
    title: h.title,
    type: h.type,
    ...(h.target ? { target: h.target } : {}),
    schedule: h.schedule,
    history: h.history
  };
});

// 2. Create clean store habits (only 2: Water 2L and Morning Workout)
const cleanHabits = [
  {
    id: 'h_water',
    title: '💧 Пить 2л воды',
    type: 'numeric',
    target: { value: 2, unit: 'л', step: 0.2 },
    schedule: { type: 'daily' },
    history: {}
  },
  {
    id: 'h_sport',
    title: '🏃 Зарядка',
    type: 'boolean',
    schedule: { type: 'daily' },
    history: {}
  }
];

// Ensure presets directory exists
const presetsDir = path.join(__dirname, '..', 'presets');
if (!fs.existsSync(presetsDir)) {
  fs.mkdirSync(presetsDir, { recursive: true });
}

// Write presets/habits_wife.js
const wifeJsContent = `// Preset: Wife's Personal Habits with Full 149-day History
window.INITIAL_HABITS_ID = 'wife_v1';
window.INITIAL_HABITS = ${JSON.stringify(wifeHabits, null, 2)};
`;
fs.writeFileSync(path.join(presetsDir, 'habits_wife.js'), wifeJsContent, 'utf8');

// Write presets/habits_clean.js
const cleanJsContent = `// Preset: Clean Store / Default Habits (2 starter habits, empty history)
window.INITIAL_HABITS_ID = 'clean_v1';
window.INITIAL_HABITS = ${JSON.stringify(cleanHabits, null, 2)};
`;
fs.writeFileSync(path.join(presetsDir, 'habits_clean.js'), cleanJsContent, 'utf8');

// Set active initial_habits.js to wife's preset right now!
const rootInitialJs = path.join(__dirname, '..', 'initial_habits.js');
const wwwInitialJs = path.join(__dirname, '..', 'www', 'initial_habits.js');

fs.writeFileSync(rootInitialJs, wifeJsContent, 'utf8');
fs.writeFileSync(wwwInitialJs, wifeJsContent, 'utf8');

console.log('Successfully created presets:');
console.log(' - presets/habits_wife.js (7 habits, full history)');
console.log(' - presets/habits_clean.js (2 starter habits, clean)');
console.log(' - initial_habits.js (active: wife)');
