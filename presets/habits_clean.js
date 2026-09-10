// Preset: Clean Store / Default Habits (2 starter habits, empty history)
window.INITIAL_HABITS_ID = 'clean_v1';
window.INITIAL_HABITS = [
  {
    "id": "h_water",
    "title": "💧 Пить 2л воды",
    "type": "numeric",
    "target": {
      "value": 2,
      "unit": "л",
      "step": 0.2
    },
    "schedule": {
      "type": "daily"
    },
    "history": {}
  },
  {
    "id": "h_sport",
    "title": "🏃 Зарядка",
    "type": "boolean",
    "schedule": {
      "type": "daily"
    },
    "history": {}
  }
];
