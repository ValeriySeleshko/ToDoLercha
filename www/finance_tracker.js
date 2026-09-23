/**
 * Plan4U - Finance Tracker Module (Модуль учета финансов: доходы и расходы)
 * 
 * Вдохновлен лучшими чертами Monefy (быстрый ввод в 2 касания, наглядное кольцо секторов)
 * и Money Manager (баланс, история операций, фильтрация по периодам),
 * гармонично адаптированный под крафтовую стилистику бумажного блокнота.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Plan4UFinanceTracker = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'plan4u_finance_data';

  function parseDate(str) {
    if (!str || typeof str !== 'string') return null;
    const [y, m, d] = str.split('-').map(Number);
    return (y && m && d) ? new Date(y, m - 1, d, 12, 0, 0) : null;
  }

  function formatDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  const getTodayString = () => formatDate(new Date());

  /**
   * Возвращает диапазон дат { startDate, endDate, period } для выбранного периода
   */
  function getPeriodRange(period = 'month', refDate = null) {
    const curDateStr = refDate || getTodayString();
    if (period === 'day') {
      return { startDate: curDateStr, endDate: curDateStr, period: 'day' };
    }
    if (period === 'week') {
      const d = parseDate(curDateStr) || new Date();
      const dow = (d.getDay() + 6) % 7; // Monday = 0
      const monday = new Date(d);
      monday.setDate(d.getDate() - dow);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { startDate: formatDate(monday), endDate: formatDate(sunday), period: 'week' };
    }
    if (period === 'month') {
      const d = parseDate(curDateStr) || new Date();
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { startDate: formatDate(firstDay), endDate: formatDate(lastDay), period: 'month' };
    }
    // 'all'
    return { startDate: null, endDate: null, period: 'all' };
  }

  const DEFAULT_SETTINGS = {
    enabled: false,
    currency: 'грн',
    currencySymbol: '₴',
    initialBalance: 0,
    showInTopBar: true,
    showArchiveStamp: true
  };

  const DEFAULT_CATEGORIES = [
    // Расходы
    { id: 'cat_food', name: 'Еда', type: 'expense', color: '#22c55e', iconIndex: 0 },
    { id: 'cat_auto', name: 'Авто', type: 'expense', color: '#38bdf8', iconIndex: 14 },
    { id: 'cat_restaurants', name: 'Рестораны', type: 'expense', color: '#eab308', iconIndex: 2 },
    { id: 'cat_rent', name: 'Аренда', type: 'expense', color: '#a16207', iconIndex: 7 },
    { id: 'cat_hobby', name: 'Хобби', type: 'expense', color: '#a855f7', iconIndex: 36 },
    { id: 'cat_gifts', name: 'Подарки', type: 'expense', color: '#3b82f6', iconIndex: 41 },
    { id: 'cat_health', name: 'Здоровье', type: 'expense', color: '#ec4899', iconIndex: 28 },
    { id: 'cat_shopping', name: 'Покупки', type: 'expense', color: '#f97316', iconIndex: 21 },
    // Доходы
    { id: 'cat_salary', name: 'Зарплата', type: 'income', color: '#10b981', iconIndex: 44 },
    { id: 'cat_freelance', name: 'Подработка', type: 'income', color: '#06b6d4', iconIndex: 46 },
    { id: 'cat_savings', name: 'Копилка', type: 'income', color: '#f43f5e', iconIndex: 45 },
    { id: 'cat_gift_in', name: 'Подарок', type: 'income', color: '#8b5cf6', iconIndex: 41 }
  ];

  class FinanceTracker {
    constructor() {
      this.data = this.loadData();
    }

    loadData() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            const txs = (Array.isArray(parsed.transactions) ? parsed.transactions : [])
              .filter(t => t && t.isSimulated !== true);
            try { localStorage.removeItem('plan4u_finance_sim_seeded'); } catch (_) {}
            return {
              settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
              categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : [...DEFAULT_CATEGORIES],
              transactions: txs
            };
          }
        }
      } catch (e) {
        console.error('Error loading finance data:', e);
      }
      return {
        settings: { ...DEFAULT_SETTINGS },
        categories: [...DEFAULT_CATEGORIES],
        transactions: []
      };
    }

    saveData() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        }
        if (typeof window !== 'undefined' && window.Plan4UStorage && typeof window.Plan4UStorage.saveFile === 'function') {
          window.Plan4UStorage.saveFile('finance.json', this.data);
        }
      } catch (e) {
        console.error('Error saving finance data:', e);
      }
    }

    async hydrateFromStorage() {
      try {
        if (typeof window !== 'undefined' && window.Plan4UStorage && typeof window.Plan4UStorage.loadFile === 'function') {
          const fileData = await window.Plan4UStorage.loadFile('finance.json', null);
          if (fileData && typeof fileData === 'object') {
            const currentTxCount = Array.isArray(this.data.transactions) ? this.data.transactions.length : 0;
            const fileTxCount = Array.isArray(fileData.transactions) ? fileData.transactions.length : 0;
            if (fileTxCount > currentTxCount || (fileData.settings && fileData.settings.enabled && !this.data.settings.enabled)) {
              this.data = {
                settings: { ...DEFAULT_SETTINGS, ...(this.data.settings || {}), ...(fileData.settings || {}) },
                categories: (Array.isArray(fileData.categories) && fileData.categories.length > 0) ? fileData.categories : this.data.categories,
                transactions: (Array.isArray(fileData.transactions) && fileData.transactions.length > 0) ? fileData.transactions : this.data.transactions
              };
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
              }
              return true;
            }
          }
        }
      } catch (e) {
        console.warn('FinanceTracker hydration error:', e);
      }
      return false;
    }

    // --- Settings ---
    isEnabled() {
      return !!(this.data.settings && this.data.settings.enabled);
    }

    getSettings() {
      return { ...this.data.settings };
    }

    updateSettings(newSettings) {
      this.data.settings = { ...this.data.settings, ...newSettings };
      this.saveData();
      return this.data.settings;
    }

    getCurrency() {
      return this.data.settings.currency || 'грн';
    }

    getCurrencySymbol() {
      return this.data.settings.currencySymbol || '₴';
    }

    // --- Categories ---
    getCategories(type = null, includeDeleted = false) {
      let list = this.data.categories;
      if (!includeDeleted) {
        list = list.filter(c => !c.isDeleted);
      }
      if (!type) return [...list];
      return list.filter(c => c.type === type);
    }

    getCategory(id) {
      // Always look up by id, including soft-deleted, so past history & stats retain category details
      return this.data.categories.find(c => c.id === id) || null;
    }

    addCategory({ name, type = 'expense', color = '#3b82f6', iconIndex = 0 }) {
      const id = 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const cat = {
        id,
        name: (name || '').trim(),
        type: type === 'income' ? 'income' : 'expense',
        color: color || '#3b82f6',
        iconIndex: typeof iconIndex === 'number' ? Math.max(0, Math.min(97, iconIndex)) : 0
      };
      this.data.categories.push(cat);
      this.saveData();
      return cat;
    }

    updateCategory(id, updates) {
      const idx = this.data.categories.findIndex(c => c.id === id);
      if (idx === -1) return null;
      if (updates && typeof updates.iconIndex === 'number') {
        updates.iconIndex = Math.max(0, Math.min(97, updates.iconIndex));
      }
      this.data.categories[idx] = {
        ...this.data.categories[idx],
        ...updates
      };
      this.saveData();
      return this.data.categories[idx];
    }

    deleteCategory(id, refDate = null) {
      const idx = this.data.categories.findIndex(c => c.id === id);
      if (idx === -1) return false;
      const cat = this.data.categories[idx];

      // Ensure at least 1 active category remains for this type
      const activeSameType = this.data.categories.filter(c => c.type === cat.type && !c.isDeleted);
      if (activeSameType.length <= 1) {
        return false;
      }

      const todayStr = refDate || getTodayString();

      // Check if there are past transactions using this category
      const hasTransactions = this.data.transactions.some(t => t.categoryId === id);
      if (hasTransactions) {
        // Soft delete: preserve metadata for past history, archive stamps & stats
        cat.isDeleted = true;
        cat.deletedDate = todayStr;
      } else {
        // Hard delete if never used
        this.data.categories.splice(idx, 1);
      }
      this.saveData();
      return true;
    }

    // --- Transactions ---
    getTransactions(filter = {}) {
      let list = [...this.data.transactions];

      // Filter by period ('day', 'week', 'month', 'all')
      if (filter.period && filter.period !== 'all') {
        const range = getPeriodRange(filter.period, filter.refDate || filter.date);
        if (range.startDate && range.endDate) {
          list = list.filter(t => t.date >= range.startDate && t.date <= range.endDate);
        }
      } else if (filter.date) {
        list = list.filter(t => t.date === filter.date);
      } else if (filter.startDate && filter.endDate) {
        list = list.filter(t => t.date >= filter.startDate && t.date <= filter.endDate);
      }

      if (filter.type) {
        list = list.filter(t => t.type === filter.type);
      }
      if (filter.categoryId) {
        list = list.filter(t => t.categoryId === filter.categoryId);
      }

      return list.sort((a, b) => {
        // Sort newest first by date then timestamp
        if (b.date !== a.date) return (b.date || '').localeCompare(a.date || '');
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
    }

    getTransaction(id) {
      return this.data.transactions.find(t => t.id === id) || null;
    }

    addTransaction({ date, amount, categoryId, type = 'expense', note = '' }) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return null;

      const dateStr = date || getTodayString();
      const cat = this.getCategory(categoryId);
      const determinedType = cat ? cat.type : (type === 'income' ? 'income' : 'expense');

      const tx = {
        id: 'tx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        date: dateStr,
        timestamp: Date.now(),
        amount: Math.round(numAmount * 100) / 100,
        categoryId: categoryId || (determinedType === 'income' ? 'cat_salary' : 'cat_food'),
        type: determinedType,
        note: (note || '').trim()
      };

      this.data.transactions.push(tx);
      this.saveData();
      return tx;
    }

    updateTransaction(id, updates) {
      const idx = this.data.transactions.findIndex(t => t.id === id);
      if (idx === -1) return null;
      const safeUpdates = { ...updates };
      if (safeUpdates.amount !== undefined) {
        const num = parseFloat(safeUpdates.amount);
        if (isNaN(num) || num <= 0) {
          delete safeUpdates.amount;
        } else {
          safeUpdates.amount = Math.round(num * 100) / 100;
        }
      }
      this.data.transactions[idx] = {
        ...this.data.transactions[idx],
        ...safeUpdates
      };
      this.saveData();
      return this.data.transactions[idx];
    }

    deleteTransaction(id) {
      const idx = this.data.transactions.findIndex(t => t.id === id);
      if (idx === -1) return false;
      this.data.transactions.splice(idx, 1);
      this.saveData();
      return true;
    }

    // --- Calculations & Statistics ---
    getBalance() {
      const initial = parseFloat(this.data.settings.initialBalance) || 0;
      let totalIncome = 0;
      let totalExpense = 0;

      for (const t of this.data.transactions) {
        if (t.type === 'income') {
          totalIncome += t.amount;
        } else {
          totalExpense += t.amount;
        }
      }

      return {
        initialBalance: initial,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        currentBalance: Math.round((initial + totalIncome - totalExpense) * 100) / 100
      };
    }

    formatMoney(num) {
      return formatMoney(num);
    }

    getStatsForPeriod(period = 'month', refDate = null) {
      const curDateStr = refDate || getTodayString();
      const range = getPeriodRange(period, curDateStr);

      let txs = [];
      if (period === 'all') {
        txs = [...this.data.transactions];
      } else {
        txs = this.data.transactions.filter(t => t.date >= range.startDate && t.date <= range.endDate);
      }

      let totalExpense = 0;
      let totalIncome = 0;
      const expenseMap = {};
      const incomeMap = {};

      for (const t of txs) {
        if (t.type === 'income') {
          totalIncome += t.amount;
          incomeMap[t.categoryId] = (incomeMap[t.categoryId] || 0) + t.amount;
        } else {
          totalExpense += t.amount;
          expenseMap[t.categoryId] = (expenseMap[t.categoryId] || 0) + t.amount;
        }
      }

      totalExpense = Math.round(totalExpense * 100) / 100;
      totalIncome = Math.round(totalIncome * 100) / 100;

      const expenseBreakdown = Object.entries(expenseMap).map(([catId, amount]) => {
        const cat = this.getCategory(catId) || { name: 'Другое', color: '#94a3b8', iconIndex: 0 };
        const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          categoryId: catId,
          name: cat.name,
          color: cat.color,
          iconIndex: cat.iconIndex,
          amount: Math.round(amount * 100) / 100,
          percent: Math.round(pct * 10) / 10
        };
      }).sort((a, b) => b.amount - a.amount);

      const incomeBreakdown = Object.entries(incomeMap).map(([catId, amount]) => {
        const cat = this.getCategory(catId) || { name: 'Другое', color: '#94a3b8', iconIndex: 44 };
        const pct = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
        return {
          categoryId: catId,
          name: cat.name,
          color: cat.color,
          iconIndex: cat.iconIndex,
          amount: Math.round(amount * 100) / 100,
          percent: Math.round(pct * 10) / 10
        };
      }).sort((a, b) => b.amount - a.amount);

      return {
        period,
        refDate: curDateStr,
        startDate: range.startDate,
        endDate: range.endDate,
        totalExpense,
        totalIncome,
        netBalance: Math.round((totalIncome - totalExpense) * 100) / 100,
        expenseBreakdown,
        incomeBreakdown,
        transactionCount: txs.length
      };
    }

    /**
     * Генерация SVG секторного кольца (Donut Chart)
     * Используется для:
     * 1. Виджета в шапке блокнота (52x52px)
     * 2. Центрального кольца в финансовом окне (200x200px)
     * 3. Штампа на архивных страницах (88x88px)
     */
    generateDonutSvg(breakdown, options = {}) {
      const isWidget = !!options.isWidget;
      const size = options.size || (isWidget ? 52 : 220);
      const strokeWidth = options.strokeWidth || (isWidget ? 4.8 : 18);
      const center = size / 2;
      const showIcons = !isWidget && options.showIcons !== false;

      // Если значки не отображаются (виджет в шапке, штамп на архивной странице),
      // кольцо заполняет всё отведённое ему пространство от края до края.
      // Если значки отображаются (главное кольцо в окне финансов),
      // кольцо уменьшается для аккуратного выноса крупных бейджей наружу.
      let centerRadius;
      let iconRadius;
      if (!showIcons) {
        centerRadius = (size / 2) - (strokeWidth / 2);
        iconRadius = centerRadius;
      } else {
        const badgeRadius = 18.5; // В 2 раза больше (диаметр 37px вместо 19px)
        const outerMargin = 3.5;  // Небольшой отступ от границы viewBox (220)
        iconRadius = (size / 2) - badgeRadius - outerMargin; // 110 - 18.5 - 3.5 = 88
        const gapBetweenRingAndBadge = 3.5;
        const outerRingRadius = iconRadius - badgeRadius - gapBetweenRingAndBadge; // 88 - 18.5 - 3.5 = 66
        centerRadius = outerRingRadius - (strokeWidth / 2); // 66 - 8 = 58
      }

      const circumference = 2 * Math.PI * centerRadius;
      const bgTrackStroke = isWidget ? '#e2e8f0' : 'rgba(0,0,0,0.06)';

      if (!breakdown || breakdown.length === 0) {
        // Пустое кольцо
        const emptyStroke = isWidget ? '#e2e8f0' : (options.emptyStroke || 'rgba(148, 163, 184, 0.35)');
        return `
          <svg class="finance-donut-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
            <circle class="finance-donut-bg" cx="${center}" cy="${center}" r="${centerRadius}" 
                    fill="none" stroke="${emptyStroke}" stroke-width="${strokeWidth}" 
                    ${isWidget ? '' : 'stroke-dasharray="4 4"'} />
          </svg>
        `;
      }

      // Если только 1 сектор со 100% затрат
      if (breakdown.length === 1) {
        const item = breakdown[0];
        const strokeColor = item.color || '#3b82f6';
        let singleIconSvg = '';
        if (!isWidget && options.showIcons !== false) {
          const iconX = center;
          const iconY = center - iconRadius;
          const iconIdx = item.iconIndex ?? 0;
          const badgeRadius = 18.5;
          const iconSize = 27;
          const halfSize = iconSize / 2;
          singleIconSvg = `
            <g class="finance-donut-icon-group" style="cursor: pointer; transform-origin: ${iconX.toFixed(2)}px ${iconY.toFixed(2)}px; transform-box: view-box; --icon-cx: ${iconX.toFixed(2)}px; --icon-cy: ${iconY.toFixed(2)}px;" data-cat-id="${item.categoryId}" data-name="${escapeHtml(item.name)}" data-amount="${item.amount}" data-percent="100">
              <circle cx="${iconX.toFixed(2)}" cy="${iconY.toFixed(2)}" r="${badgeRadius}" fill="#ffffff" stroke="${strokeColor}" stroke-width="2.2" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.2))" />
              <image href="assets/finance_icons/fin_icon_${iconIdx}.png" xlink:href="assets/finance_icons/fin_icon_${iconIdx}.png" x="${(iconX - halfSize).toFixed(2)}" y="${(iconY - halfSize).toFixed(2)}" width="${iconSize}" height="${iconSize}" />
              <title>${escapeHtml(item.name)}: ${formatMoney(item.amount)} (100%)</title>
            </g>
          `;
        }
        return `
          <svg class="finance-donut-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
            <circle class="finance-donut-bg" cx="${center}" cy="${center}" r="${centerRadius}" fill="none" stroke="${bgTrackStroke}" stroke-width="${strokeWidth}" />
            <circle class="finance-donut-sector"
                    data-cat-id="${item.categoryId}"
                    data-name="${escapeHtml(item.name)}"
                    data-amount="${item.amount}"
                    data-percent="100"
                    cx="${center}" cy="${center}" r="${centerRadius}"
                    fill="none"
                    stroke="${strokeColor}"
                    stroke-width="${strokeWidth}">
              <title>${escapeHtml(item.name)}: ${formatMoney(item.amount)} (100%)</title>
            </circle>
            ${singleIconSvg}
          </svg>
        `;
      }

      let accumulatedAngle = -90; // Старт сверху (12:00)
      let sectorsSvg = '';
      let iconsSvg = '';
      const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);

      // Аккуратный микро-зазор между секторами
      const gapAngle = (!isWidget && breakdown.length > 1) ? 1.5 : 0;
      const totalGapAngle = gapAngle * breakdown.length;
      const availableAngle = 360 - totalGapAngle;

      const sectorsData = [];

      breakdown.forEach((item) => {
        const fraction = totalAmount > 0 ? item.amount / totalAmount : (1 / breakdown.length);
        const itemAngle = fraction * availableAngle;
        const arcLength = (itemAngle / 360) * circumference;
        const dashSpace = circumference - arcLength;
        const strokeColor = item.color || '#3b82f6';
        const midAngle = accumulatedAngle + (itemAngle / 2);

        sectorsSvg += `
          <circle class="finance-donut-sector" 
                  data-cat-id="${item.categoryId}" 
                  data-name="${escapeHtml(item.name)}" 
                  data-amount="${item.amount}"
                  data-percent="${item.percent}"
                  cx="${center}" cy="${center}" r="${centerRadius}" 
                  fill="none" 
                  stroke="${strokeColor}" 
                  stroke-width="${strokeWidth}" 
                  stroke-dasharray="${arcLength.toFixed(2)} ${dashSpace.toFixed(2)}"
                  transform="rotate(${accumulatedAngle.toFixed(2)} ${center} ${center})"
                  stroke-linecap="butt">
            <title>${escapeHtml(item.name)}: ${formatMoney(item.amount)} (${item.percent}%)</title>
          </circle>
        `;

        sectorsData.push({
          item,
          strokeColor,
          midAngle
        });

        accumulatedAngle += itemAngle + gapAngle;
      });

      if (!isWidget && options.showIcons !== false && sectorsData.length > 0) {
        const N = sectorsData.length;
        const badgeRadius = 18.5;
        const iconSize = 27;
        const halfSize = iconSize / 2;

        // Развертывание углов по часовой стрелке с сохранением циклического порядка
        const baseAngle = sectorsData[0].midAngle;
        const unrolled = [baseAngle];
        for (let i = 1; i < N; i++) {
          let diff = (sectorsData[i].midAngle - unrolled[i - 1]) % 360;
          if (diff <= 0) diff += 360;
          unrolled.push(unrolled[i - 1] + diff);
        }

        const minSep = Math.min(25, (350 / N));

        // Релаксация углов: раздвигаем близкие ярлыки, чтобы отобразить ВСЕ категории без наложений
        for (let iter = 0; iter < 28; iter++) {
          for (let i = 0; i < N - 1; i++) {
            const gap = unrolled[i + 1] - unrolled[i];
            if (gap < minSep) {
              const shift = (minSep - gap) / 2;
              unrolled[i] -= shift;
              unrolled[i + 1] += shift;
            }
          }
          const wrapGap = (unrolled[0] + 360) - unrolled[N - 1];
          if (wrapGap < minSep) {
            const shift = (minSep - wrapGap) / 2;
            unrolled[N - 1] -= shift;
            unrolled[0] += shift;
          }
          for (let i = 0; i < N; i++) {
            const ideal = i === 0 ? baseAngle : (unrolled[0] + ((sectorsData[i].midAngle - sectorsData[0].midAngle + 360) % 360));
            unrolled[i] += (ideal - unrolled[i]) * 0.08;
          }
        }

        sectorsData.forEach((sec, idx) => {
          const finalAngle = unrolled[idx];
          const angleRad = (finalAngle * Math.PI) / 180;
          const rOffset = (minSep < 24 && (idx % 2 === 1)) ? 4 : 0;
          const effectiveRadius = iconRadius + rOffset;
          const iconX = center + effectiveRadius * Math.cos(angleRad);
          const iconY = center + effectiveRadius * Math.sin(angleRad);
          const iconIdx = sec.item.iconIndex ?? 0;

          iconsSvg += `
            <g class="finance-donut-icon-group" style="cursor: pointer; transform-origin: ${iconX.toFixed(2)}px ${iconY.toFixed(2)}px; transform-box: view-box; --icon-cx: ${iconX.toFixed(2)}px; --icon-cy: ${iconY.toFixed(2)}px;" data-cat-id="${sec.item.categoryId}" data-name="${escapeHtml(sec.item.name)}" data-amount="${sec.item.amount}" data-percent="${sec.item.percent}">
              <circle cx="${iconX.toFixed(2)}" cy="${iconY.toFixed(2)}" r="${badgeRadius}" fill="#ffffff" stroke="${sec.strokeColor}" stroke-width="2.2" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.2))" />
              <image href="assets/finance_icons/fin_icon_${iconIdx}.png" xlink:href="assets/finance_icons/fin_icon_${iconIdx}.png" x="${(iconX - halfSize).toFixed(2)}" y="${(iconY - halfSize).toFixed(2)}" width="${iconSize}" height="${iconSize}" />
              <title>${escapeHtml(sec.item.name)}: ${formatMoney(sec.item.amount)} (${sec.item.percent}%)</title>
            </g>
          `;
        });
      }

      return `
        <svg class="finance-donut-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle class="finance-donut-bg" cx="${center}" cy="${center}" r="${centerRadius}" fill="none" stroke="${bgTrackStroke}" stroke-width="${strokeWidth}" />
          ${sectorsSvg}
          ${iconsSvg}
        </svg>
      `;
    }

    /**
     * Генерация полупрозрачного штампа для архивных дней блокнота
     */
    generateArchiveStampSvg(dayStats, currency = 'грн') {
      const breakdown = dayStats ? dayStats.expenseBreakdown : [];
      const total = dayStats ? dayStats.totalExpense : 0;
      const donutSvg = this.generateDonutSvg(breakdown, {
        size: 88,
        strokeWidth: 12,
        emptyStroke: 'rgba(100, 116, 139, 0.25)',
        showIcons: false
      });

      const hasExpenses = breakdown.length > 0;
      const totalFormatted = hasExpenses ? `${formatMoney(total)} ${currency}` : `0 ${currency}`;

      return `
        <div class="finance-stamp-inner">
          <div class="finance-stamp-donut-wrap">
            ${donutSvg}
            <div class="finance-stamp-center-label">
              <span class="finance-stamp-symbol">💸</span>
              <span class="finance-stamp-amount">${totalFormatted}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Экспорт / импорт данных
    exportData() {
      return JSON.parse(JSON.stringify(this.data));
    }

    importData(imported) {
      if (!imported || typeof imported !== 'object') return false;
      this.data = {
        settings: { ...DEFAULT_SETTINGS, ...(imported.settings || {}) },
        categories: Array.isArray(imported.categories) && imported.categories.length > 0 ? imported.categories : [...DEFAULT_CATEGORIES],
        transactions: Array.isArray(imported.transactions) ? imported.transactions : []
      };
      this.saveData();
      return true;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatMoney(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    const hasFraction = Math.abs(num % 1) > 0.001;
    return num.toLocaleString('ru-RU', {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2
    });
  }

  return {
    FinanceTracker,
    DEFAULT_SETTINGS,
    DEFAULT_CATEGORIES,
    formatDate,
    parseDate,
    getPeriodRange,
    getTodayString,
    formatMoney
  };
}));
