/**
 * Plan4U - Maine Coon Secret Quests Manager ("Записки лапкой")
 * 
 * Manages periodic surprise quests from Maine Coon companion:
 * - Appears once every 2-3 days in a random available block on the "What to do?" (todo) tab.
 * - Non-repeating randomized selection: exhausts all 100 quests before resetting the pool.
 * - Complete trilingual localization (RU, UK, EN).
 * - Completing awards a golden canned treat (🥫), bonus XP, and cat happiness.
 */

(function () {
  'use strict';

  class MaineQuestsManager {
    constructor() {
      this.storageKey = 'plan4u_maine_quests_state';
      this.questFrequencyDays = 2; // Every 2 days minimum
      this.state = {
        usedQuestIds: [],
        lastQuestDate: null,
        totalQuestsCompleted: 0
      };
      this.loadState();
    }

    /**
     * Load persistent state from LocalStorage and Plan4UStorage
     */
    loadState() {
      try {
        if (typeof localStorage === 'undefined') return;
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            this.state.usedQuestIds = Array.isArray(parsed.usedQuestIds) ? parsed.usedQuestIds : [];
            this.state.lastQuestDate = parsed.lastQuestDate || null;
            this.state.totalQuestsCompleted = parsed.totalQuestsCompleted || 0;
          }
        }
      } catch (e) {
        console.warn('MaineQuestsManager: error loading state', e);
      }
    }

    /**
     * Save persistent state to LocalStorage and device storage
     */
    saveState() {
      try {
        if (typeof localStorage !== 'undefined') {
          const jsonStr = JSON.stringify(this.state);
          localStorage.setItem(this.storageKey, jsonStr);
        }
        if (typeof window !== 'undefined' && window.Plan4UStorage && typeof window.Plan4UStorage.saveFile === 'function') {
          window.Plan4UStorage.saveFile('maine_quests_state.json', this.state);
        }
      } catch (e) {
        console.warn('MaineQuestsManager: error saving state', e);
      }
    }

    /**
     * Get the full catalog of 100 quests
     */
    getCatalog() {
      if (typeof window !== 'undefined' && Array.isArray(window.MAINE_QUESTS_DATA)) {
        return window.MAINE_QUESTS_DATA;
      }
      try {
        if (typeof require !== 'undefined') {
          const mod = require('./maine_quests_data.js');
          if (mod && Array.isArray(mod.MAINE_QUESTS_DATA)) return mod.MAINE_QUESTS_DATA;
        }
      } catch (e) { }
      return [];
    }

    /**
     * Get a quest object by its ID
     */
    getQuestById(questId) {
      const catalog = this.getCatalog();
      return catalog.find(q => q.id === questId) || null;
    }

    /**
     * Get localized quest text with paw icon
     */
    getQuestText(questOrId, lang = 'ru') {
      const quest = typeof questOrId === 'string' ? this.getQuestById(questOrId) : questOrId;
      if (!quest) return '';
      const cleanLang = (lang || 'ru').toLowerCase();
      if (cleanLang.startsWith('uk') && quest.uk) return quest.uk;
      if (cleanLang.startsWith('en') && quest.en) return quest.en;
      return quest.ru || quest.en || '';
    }

    /**
     * Pick a random quest from the pool without repeats.
     * When all 100 are used, resets usedQuestIds and picks from the full pool again.
     */
    pickNextRandomQuest() {
      const catalog = this.getCatalog();
      if (!catalog || catalog.length === 0) return null;

      const usedSet = new Set(this.state.usedQuestIds || []);
      let available = catalog.filter(q => !usedSet.has(q.id));

      // If all 100 have been used, reset the pool and start a fresh cycle
      if (available.length === 0) {
        this.state.usedQuestIds = [];
        available = [...catalog];
      }

      const randomIndex = Math.floor(Math.random() * available.length);
      const chosen = available[randomIndex];

      if (chosen && chosen.id) {
        this.state.usedQuestIds.push(chosen.id);
        this.saveState();
      }

      return chosen;
    }

    /**
     * Calculate difference in full calendar days between two 'YYYY-MM-DD' dates
     */
    getDaysDifference(dateStrA, dateStrB) {
      if (!dateStrA || !dateStrB) return 999;
      try {
        const [y1, m1, d1] = dateStrA.split('-').map(Number);
        const [y2, m2, d2] = dateStrB.split('-').map(Number);
        const dt1 = new Date(y1, m1 - 1, d1).getTime();
        const dt2 = new Date(y2, m2 - 1, d2).getTime();
        return Math.floor(Math.abs(dt2 - dt1) / (1000 * 60 * 60 * 24));
      } catch (e) {
        return 999;
      }
    }

    /**
     * Check if a quest should spawn today
     */
    shouldSpawnToday(app) {
      if (!app || typeof app.getTodayDateString !== 'function') return false;
      const todayStr = app.getTodayDateString();

      // Check if today already has an active or completed Maine quest
      const todayTasks = (app.dailyTasks && app.dailyTasks[todayStr]) || (app.tasks && app.tasks.todo) || [];
      const hasQuestToday = todayTasks.some(t => t && (t.isMaineQuest || t.isSecretQuest));
      if (hasQuestToday) return false;

      // Check date difference with lastQuestDate (at least 2 days)
      if (!this.state.lastQuestDate) {
        return true; // First time run: spawn today!
      }

      const daysElapsed = this.getDaysDifference(this.state.lastQuestDate, todayStr);
      return daysElapsed >= this.questFrequencyDays;
    }

    /**
     * Spawn a Maine secret quest in a random available block on the "todo" tab
     * @param {NotebookApp} app - Application instance
     * @param {boolean} force - Force spawn regardless of time intervals (for testing or manual trigger)
     */
    spawnQuestForToday(app, force = false) {
      if (!app) return null;
      const todayStr = app.getTodayDateString();

      if (!force && !this.shouldSpawnToday(app)) {
        return null;
      }

      // Ensure today's daily tasks array exists
      if (!app.dailyTasks[todayStr]) {
        app.dailyTasks[todayStr] = [];
      }

      // Pick random quest from the remaining pool
      const quest = this.pickNextRandomQuest();
      if (!quest) return null;

      // Choose a random section among available blocks in 'todo' tab
      const sections = typeof app.getTabSections === 'function'
        ? app.getTabSections('todo')
        : [{ id: 'personal', name: 'Личные дела' }];

      const validSections = sections.filter(s => s && !s.id.startsWith('archive_'));
      const chosenSection = (validSections.length > 0)
        ? validSections[Math.floor(Math.random() * validSections.length)]
        : { id: 'personal' };

      const sectionId = chosenSection.id || 'personal';

      // Detect current language for title
      const currentLang = app.settings?.lang || (typeof detectSystemLanguage === 'function' ? detectSystemLanguage() : 'ru');
      const questText = this.getQuestText(quest, currentLang);

      // Create new secret quest task
      const taskId = 'mq_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
      const newTask = {
        id: taskId,
        questId: quest.id,
        isMaineQuest: true,
        isSecretQuest: true,
        text: questText,
        section: sectionId,
        priority: 'обычный',
        completed: false,
        rewarded: false,
        color: 'black',
        createdAt: new Date().toISOString()
      };

      // Insert at the beginning of the section's tasks or append
      app.dailyTasks[todayStr].push(newTask);
      if (app.currentTab === 'todo' && app.selectedDate === todayStr) {
        app.tasks.todo = app.dailyTasks[todayStr];
      }

      // Update state
      this.state.lastQuestDate = todayStr;
      this.saveState();

      // Save application state and re-render
      if (typeof app.saveTasks === 'function') {
        app.saveTasks();
      }
      if (typeof app.render === 'function') {
        app.render();
      }

      // Trigger feline speech bubble on companion
      if (app.petSystem && typeof app.petSystem.showMiniSpeech === 'function') {
        const speechMsg = currentLang === 'en'
          ? 'Meow! Secret paw note in your notebook! 🐾✨'
          : (currentLang === 'uk'
            ? 'Няв! Секретна записка лапкою в блокноті! 🐾✨'
            : 'Муррр! Секретная записка лапкой в блокноте! 🐾✨');
        setTimeout(() => {
          app.petSystem.showMiniSpeech(speechMsg);
        }, 600);
      }

      return newTask;
    }

    /**
     * Check and spawn routine called on app startup and midnight date rollovers
     */
    checkAndSpawnQuest(app) {
      try {
        if (!app) return;
        if (this.shouldSpawnToday(app)) {
          this.spawnQuestForToday(app, false);
        }
      } catch (e) {
        console.warn('MaineQuestsManager check error:', e);
      }
    }

    /**
     * Called when a secret quest task is completed
     */
    onQuestCompleted(task, petSystem, app) {
      this.state.totalQuestsCompleted = (this.state.totalQuestsCompleted || 0) + 1;
      this.saveState();

      const lang = app?.settings?.lang || 'ru';
      const toastMsg = lang === 'en'
        ? '🐾 Secret quest completed! +1 Golden Treat 🥫'
        : (lang === 'uk'
          ? '🐾 Секретний квест виконано! +1 золотий корм 🥫'
          : '🐾 Секретный квест выполнен! +1 порция золотого корма 🥫');

      if (app && typeof app.showToast === 'function') {
        app.showToast(toastMsg, '🥫');
      }
    }
  }

  // Universal Export
  const instance = new MaineQuestsManager();

  if (typeof window !== 'undefined') {
    window.MaineQuests = instance;
    window.MaineQuestsManager = MaineQuestsManager;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MaineQuests: instance, MaineQuestsManager };
  }
})();
