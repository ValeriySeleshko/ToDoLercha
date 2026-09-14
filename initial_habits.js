// Preset: Clean Public Starter Habits
window.INITIAL_HABITS_ID = 'public_v1';
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
    "id": "h_steps",
    "title": "🚶 10 000 шагов",
    "type": "numeric",
    "target": {
      "value": 10000,
      "unit": "шагов",
      "step": 1000
    },
    "schedule": {
      "type": "daily"
    },
    "history": {}
  }
];
