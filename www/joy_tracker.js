/**
 * Plan4U - Joy Tracker Module (Модуль «Заметить радость» / Дневник благодарности)
 * 
 * Позволяет фиксировать позитивные моменты дня, благодарности и улыбки,
 * сохраняя их на 25 аутентичных бумажных стикерах блокнота.
 * Поддерживает вечернее приглашение, «Банку радости» с кнопкой «Мне грустно»,
 * реакцию котика Мейни и долгое нажатие для смены стикера.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Plan4UJoyTracker = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'plan4u_joy_data';

  function formatDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  const getTodayString = () => formatDate(new Date());

  const DEFAULT_SETTINGS = {
    enabled: true,
    reminderTime: '21:00',
    showOnSheet: true,
    lastDismissedDate: null
  };

  const DEFAULT_TAGS = [
    { id: 't_food', icon: '☕', nameKey: 'joy_tag_food', defaultName: 'Вкусное' },
    { id: 't_nature', icon: '🌿', nameKey: 'joy_tag_nature', defaultName: 'Природа' },
    { id: 't_people', icon: '👥', nameKey: 'joy_tag_people', defaultName: 'Общение' },
    { id: 't_win', icon: '🏆', nameKey: 'joy_tag_win', defaultName: 'Победа' },
    { id: 't_cozy', icon: '🛋️', nameKey: 'joy_tag_cozy', defaultName: 'Уют' },
    { id: 't_art', icon: '🎬', nameKey: 'joy_tag_art', defaultName: 'Творчество' },
    { id: 't_pet', icon: '🐾', nameKey: 'joy_tag_pet', defaultName: 'Питомец' },
    { id: 't_love', icon: '💖', nameKey: 'joy_tag_love', defaultName: 'Любовь' }
  ];

  const DEFAULT_MOODS = [
    { id: 'm_great', icon: '☀️', nameKey: 'joy_mood_great', defaultName: 'Отлично' },
    { id: 'm_cozy', icon: '🌸', nameKey: 'joy_mood_cozy', defaultName: 'Уютно' },
    { id: 'm_calm', icon: '💫', nameKey: 'joy_mood_calm', defaultName: 'Спокойно' },
    { id: 'm_ok', icon: '🌿', nameKey: 'joy_mood_ok', defaultName: 'В норме' },
    { id: 'm_tired', icon: '🌧️', nameKey: 'joy_mood_tired', defaultName: 'Держусь' },
    { id: 'm_joy', icon: '🎉', nameKey: 'joy_mood_joy', defaultName: 'Радостно' },
    { id: 'm_inspired', icon: '✨', nameKey: 'joy_mood_inspired', defaultName: 'Подъём' },
    { id: 'm_grateful', icon: '💖', nameKey: 'joy_mood_grateful', defaultName: 'Тепло' },
    { id: 'm_dreamy', icon: '🌙', nameKey: 'joy_mood_dreamy', defaultName: 'Мечты' },
    { id: 'm_sad', icon: '🍂', nameKey: 'joy_mood_sad', defaultName: 'Грустно' }
  ];

  const DEFAULT_PROMPT_KEYS = Array.from({ length: 36 }, (_, i) => `joy_prompt_${i + 1}`);

  class JoyTracker {
    constructor() {
      this.data = this.loadData();
    }

    loadData() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.entries) {
              for (const k in parsed.entries) {
                if (parsed.entries[k]?.isDemo) delete parsed.entries[k];
              }
            }
            return {
              settings: Object.assign({}, DEFAULT_SETTINGS, parsed.settings || {}),
              entries: parsed.entries || {}
            };
          }
        }
      } catch (e) {
        console.warn('Plan4UJoyTracker: failed to load data from localStorage', e);
      }
      return {
        settings: Object.assign({}, DEFAULT_SETTINGS),
        entries: {}
      };
    }

    saveData() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        }
      } catch (e) {
        console.warn('Plan4UJoyTracker: failed to save data to localStorage', e);
      }
    }

    isEnabled() {
      return !!this.data.settings.enabled;
    }

    setEnabled(enabled) {
      this.data.settings.enabled = !!enabled;
      this.saveData();
    }

    getSettings() {
      return Object.assign({}, this.data.settings);
    }

    updateSettings(newSettings) {
      this.data.settings = Object.assign({}, this.data.settings, newSettings);
      this.saveData();
    }

    getTags() {
      return DEFAULT_TAGS;
    }

    getMoods() {
      return DEFAULT_MOODS;
    }

    getPromptKeys() {
      return DEFAULT_PROMPT_KEYS;
    }

    getRandomStickerId() {
      const num = Math.floor(Math.random() * 25) + 1;
      return `paper_${String(num).padStart(2, '0')}`;
    }

    getAllStickerIds() {
      return Array.from({ length: 25 }, (_, i) => `paper_${String(i + 1).padStart(2, '0')}`);
    }

    getStickerImagePath(stickerId) {
      const id = (stickerId && stickerId.startsWith('paper_')) ? stickerId : 'paper_01';
      return `./assets/stickers/paper/${id}.png?v=8`;
    }

    hasEntry(dateStr = getTodayString()) {
      return !!(this.data.entries && this.data.entries[dateStr] && this.data.entries[dateStr].text?.trim());
    }

    getEntry(dateStr = getTodayString()) {
      return (this.data.entries && this.data.entries[dateStr]) || null;
    }

    saveEntry(dateStr, entryData) {
      if (!dateStr) dateStr = getTodayString();
      if (!this.data.entries) this.data.entries = {};

      const existing = this.data.entries[dateStr] || {};
      const stickerId = entryData.stickerId || existing.stickerId || this.getRandomStickerId();

      const entry = {
        id: existing.id || `joy_${dateStr}_${Date.now()}`,
        date: dateStr,
        text: (entryData.text || '').trim().slice(0, 100),
        stickerId: stickerId,
        mood: entryData.mood || existing.mood || 'm_great',
        tags: [],
        x: (entryData.x !== undefined) ? entryData.x : existing.x,
        y: (entryData.y !== undefined) ? entryData.y : existing.y,
        rotate: (entryData.rotate !== undefined) ? entryData.rotate : existing.rotate,
        createdAt: existing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.data.entries[dateStr] = entry;
      this.saveData();
      return entry;
    }

    updatePosition(dateStr, x, y, rotate) {
      if (!this.data.entries || !this.data.entries[dateStr]) return null;
      if (typeof x === 'number' && !isNaN(x)) this.data.entries[dateStr].x = x;
      if (typeof y === 'number' && !isNaN(y)) this.data.entries[dateStr].y = y;
      if (typeof rotate === 'number' && !isNaN(rotate)) this.data.entries[dateStr].rotate = rotate;
      this.data.entries[dateStr].updatedAt = new Date().toISOString();
      this.saveData();
      return this.data.entries[dateStr];
    }

    updateSticker(dateStr, stickerId) {
      if (!this.data.entries || !this.data.entries[dateStr]) return null;
      this.data.entries[dateStr].stickerId = stickerId;
      this.data.entries[dateStr].updatedAt = new Date().toISOString();
      this.saveData();
      return this.data.entries[dateStr];
    }

    deleteEntry(dateStr) {
      if (this.data.entries && this.data.entries[dateStr]) {
        delete this.data.entries[dateStr];
        this.saveData();
        return true;
      }
      return false;
    }

    getAllEntries() {
      const list = Object.values(this.data.entries || {}).filter(e => e && e.text);
      list.sort((a, b) => b.date.localeCompare(a.date));
      return list;
    }

    getRandomEntry(excludeDateStr = null) {
      const all = this.getAllEntries();
      if (!all.length) return null;
      const filtered = excludeDateStr ? all.filter(e => e.date !== excludeDateStr) : all;
      const pool = filtered.length ? filtered : all;
      const idx = Math.floor(Math.random() * pool.length);
      return pool[idx];
    }

    getStats() {
      const entries = this.getAllEntries();
      const totalCount = entries.length;

      // Calculate tag occurrences
      const tagCounts = {};
      entries.forEach(e => {
        if (Array.isArray(e.tags)) {
          e.tags.forEach(t => {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          });
        }
      });

      let topTag = null;
      let maxCount = 0;
      for (const t in tagCounts) {
        if (tagCounts[t] > maxCount) {
          maxCount = tagCounts[t];
          topTag = t;
        }
      }

      return {
        totalCount,
        tagCounts,
        topTag,
        hasToday: this.hasEntry(getTodayString())
      };
    }

    dismissToday(dateStr = getTodayString()) {
      this.data.settings.lastDismissedDate = dateStr;
      this.saveData();
    }

    isDismissedToday(dateStr = getTodayString()) {
      return this.data.settings.lastDismissedDate === dateStr;
    }

    shouldTriggerEveningPrompt(dateStr = getTodayString()) {
      if (!this.isEnabled()) return false;
      if (this.hasEntry(dateStr)) return false;
      if (this.isDismissedToday(dateStr)) return false;

      const [targetH, targetM] = (this.data.settings.reminderTime || '21:00').split(':').map(Number);
      const now = new Date();
      const curH = now.getHours();
      const curM = now.getMinutes();

      if (curH > targetH || (curH === targetH && curM >= targetM)) {
        return true;
      }
      return false;
    }
  }

  return JoyTracker;
}));
