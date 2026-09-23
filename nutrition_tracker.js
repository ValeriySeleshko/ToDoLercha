/**
 * Plan4U - Nutrition & Macro Tracker Module (Подсчёт калорий и БЖУ)
 * 
 * Вдохновлен эстетикой крафтового блокнота Plan4U:
 * - Смещенное влево интерактивное кольцо приёмов пищи с иконками
 * - 3 вертикальные шкалы БЖУ с заполнением выше нормы (>100%, до 150-200%) и предупреждениями
 * - Добавление отдельного блюда и составного блюда с расчетом уварки/ужарки
 * - Полная интеграция с Open Food Facts API + локальная база своих продуктов
 * - Штамп питания на архивных листах прошлых дней
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Plan4UNutritionTracker = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'plan4u_nutrition_data';
  const CUSTOM_FOODS_KEY = 'plan4u_custom_foods';
  const RECIPES_KEY = 'plan4u_nutrition_recipes';

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

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const FOOD_CATEGORY_ICONS = [
    { id: 'cat_toast_egg', num: 1, label: 'Тост с яйцом', defaultCategory: 'Завтрак', src: 'assets/nutrition_icons/meal_icon_1.webp' },
    { id: 'cat_fruit_bowl', num: 2, label: 'Фруктовый боул', defaultCategory: 'Полдник', src: 'assets/nutrition_icons/meal_icon_2.webp' },
    { id: 'cat_salad', num: 3, label: 'Салат с авокадо', defaultCategory: 'Обед', src: 'assets/nutrition_icons/meal_icon_3.webp' },
    { id: 'cat_toast_banana', num: 4, label: 'Тост с бананом', defaultCategory: 'Перекус', src: 'assets/nutrition_icons/meal_icon_4.webp' },
    { id: 'cat_meat_plate', num: 5, label: 'Курица с гарниром', defaultCategory: 'Ужин', src: 'assets/nutrition_icons/meal_icon_5.webp' },
    { id: 'cat_tea_cookies', num: 6, label: 'Чай с печеньем', defaultCategory: 'Чай', src: 'assets/nutrition_icons/meal_icon_6.webp' },
    { id: 'cat_soup_bowl', num: 7, label: 'Суп / лапша', defaultCategory: 'Обед', src: 'assets/nutrition_icons/meal_icon_7.webp' },
    { id: 'cat_pie_dessert', num: 8, label: 'Пирог / десерт', defaultCategory: 'Десерт', src: 'assets/nutrition_icons/meal_icon_8.webp' },
    { id: 'cat_snack_nuts', num: 9, label: 'Вода, банан, орехи', defaultCategory: 'Перекус', src: 'assets/nutrition_icons/meal_icon_9.webp' }
  ];

  function isImageIcon(icon) {
    if (!icon || typeof icon !== 'string') return false;
    return icon.endsWith('.webp') || icon.endsWith('.png') || icon.endsWith('.jpg') || icon.endsWith('.svg') ||
           icon.startsWith('assets/') || icon.startsWith('data:') || icon.startsWith('http') || icon.startsWith('/');
  }

  function renderSvgIconElement(icon, x, y, badgeRadius) {
    if (isImageIcon(icon)) {
      const imgSize = (badgeRadius - 3.5) * 2;
      const imgX = (x - imgSize / 2).toFixed(2);
      const imgY = (y - imgSize / 2).toFixed(2);
      return `<image href="${escapeHtml(icon)}" x="${imgX}" y="${imgY}" width="${imgSize.toFixed(2)}" height="${imgSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />`;
    }
    return `<text x="${x.toFixed(2)}" y="${(y + 5.5).toFixed(2)}" text-anchor="middle" font-size="16">${escapeHtml(icon)}</text>`;
  }

  function renderMealIconHtml(icon, name = '', className = '') {
    if (isImageIcon(icon)) {
      return `<img src="${escapeHtml(icon)}" class="meal-icon-img ${className}" alt="${escapeHtml(name)}" loading="lazy">`;
    }
    return `<span class="meal-icon-emoji ${className}">${escapeHtml(icon || '🍽️')}</span>`;
  }

  const DEFAULT_MACRO_COLORS = {
    protein: '#3b82f6', // Б
    fat: '#f59e0b',     // Ж
    carbs: '#10b981'    // У
  };

  function adjustHexColor(hex, percent) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex || '#3b82f6';
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return hex;
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  const DEFAULT_SETTINGS = {
    enabled: false,
    showArchiveStamp: true,
    calorieTarget: 2000,
    proteinTarget: 80,    // Белки (г)
    fatTarget: 70,        // Жиры (г)
    carbTarget: 250,      // Углеводы (г)
    macroColors: { ...DEFAULT_MACRO_COLORS }
  };

  const DEFAULT_MEALS = [
    { id: 'meal_breakfast', name: 'Завтрак', icon: 'assets/nutrition_icons/meal_icon_1.webp', color: '#f59e0b', order: 1 },
    { id: 'meal_lunch', name: 'Обед', icon: 'assets/nutrition_icons/meal_icon_7.webp', color: '#10b981', order: 2 },
    { id: 'meal_dinner', name: 'Ужин', icon: 'assets/nutrition_icons/meal_icon_5.webp', color: '#6366f1', order: 3 },
    { id: 'meal_snack', name: 'Перекус', icon: 'assets/nutrition_icons/meal_icon_9.webp', color: '#ec4899', order: 4 }
  ];

  // --- Реестр эталонных продуктов и готовых блюд с точным КБЖУ (Offline-First Knowledge Base) ---
  const BUILTIN_FOODS = [
    // 1. Крупы, каши и бобовые
    { name: 'Гречка отварная', aliases: ['гречка', 'гречневая каша', 'греча', 'каша гречневая', 'buckwheat'], calories: 110, protein: 4.2, fat: 1.1, carbs: 21.3 },
    { name: 'Гречка сухая (ядрица)', aliases: ['гречневая крупа сухая', 'гречка ядрица', 'гречневая крупа'], calories: 343, protein: 13, fat: 3.4, carbs: 71.5 },
    { name: 'Рис белый отварной', aliases: ['рис отварной', 'рис вареный', 'белый рис', 'рис', 'rice'], calories: 130, protein: 2.7, fat: 0.3, carbs: 28.2 },
    { name: 'Рис белый сухой', aliases: ['рис крупа', 'крупа рисовая', 'рис сухой'], calories: 360, protein: 7, fat: 1, carbs: 79 },
    { name: 'Рис бурый отварной', aliases: ['бурый рис', 'коричневый рис'], calories: 111, protein: 2.6, fat: 0.9, carbs: 23 },
    { name: 'Овсяная каша на воде', aliases: ['овсянка', 'овсяная каша', 'каша овсяная', 'oatmeal'], calories: 88, protein: 3, fat: 1.7, carbs: 15 },
    { name: 'Овсяная каша на молоке', aliases: ['овсянка на молоке', 'овсяная каша молочная'], calories: 115, protein: 4.5, fat: 3.2, carbs: 17.5 },
    { name: 'Овсяные хлопья (Геркулес)', aliases: ['геркулес', 'овсяные хлопья', 'хлопья овсяные', 'овсянка сухая'], calories: 366, protein: 12.3, fat: 6.2, carbs: 61.8 },
    { name: 'Макароны отварные', aliases: ['макароны', 'паста отварная', 'спагетти отварные', 'макароны вареные', 'паста', 'pasta'], calories: 158, protein: 5.8, fat: 0.9, carbs: 30.9 },
    { name: 'Макароны сухие', aliases: ['макаронные изделия', 'спагетти', 'перья', 'рожки', 'макароны твердых сортов'], calories: 371, protein: 13, fat: 1.5, carbs: 75 },
    { name: 'Булгур отварной', aliases: ['булгур', 'каша булгур', 'булгур вареный'], calories: 83, protein: 3.1, fat: 0.2, carbs: 18.6 },
    { name: 'Кускус отварной', aliases: ['кускус', 'кус-кус'], calories: 112, protein: 3.8, fat: 0.2, carbs: 23.2 },
    { name: 'Пшенная каша отварная', aliases: ['пшенная каша', 'пшенка', 'пшено отварное', 'пшено'], calories: 90, protein: 3, fat: 0.7, carbs: 17 },
    { name: 'Перловая каша отварная', aliases: ['перловая каша', 'перловка', 'перловая крупа'], calories: 109, protein: 3.1, fat: 0.4, carbs: 22.2 },
    { name: 'Киноа отварная', aliases: ['киноа', 'киноа вареная'], calories: 120, protein: 4.4, fat: 1.9, carbs: 21.3 },
    { name: 'Чечевица отварная', aliases: ['чечевица', 'чечевица вареная'], calories: 116, protein: 9, fat: 0.4, carbs: 20 },
    { name: 'Фасоль отварная', aliases: ['фасоль красная', 'фасоль белая', 'фасоль', 'beans'], calories: 127, protein: 8.7, fat: 0.5, carbs: 22.8 },
    { name: 'Нут отварной', aliases: ['нут', 'турецкий горох'], calories: 164, protein: 8.9, fat: 2.6, carbs: 27.4 },
    { name: 'Гороховое пюре / каша', aliases: ['гороховая каша', 'горох отварной', 'гороховое пюре'], calories: 118, protein: 8.3, fat: 0.4, carbs: 21.1 },

    // 2. Мясо и птица
    { name: 'Куриное филе (грудка) запеченное', aliases: ['куриное филе', 'куриная грудка', 'филе курицы', 'грудка куриная', 'курица филе', 'chicken breast'], calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    { name: 'Куриная грудка отварная', aliases: ['вареная грудка', 'курица вареная', 'отварная курица', 'грудка вареная'], calories: 137, protein: 29.8, fat: 1.8, carbs: 0 },
    { name: 'Куриное бедро без кожи', aliases: ['куриное бедро', 'бедро куриное', 'бедра куриные'], calories: 170, protein: 24, fat: 8, carbs: 0 },
    { name: 'Куриная голень без кожи', aliases: ['куриная голень', 'ножка куриная', 'куриные ножки'], calories: 160, protein: 23, fat: 7.5, carbs: 0 },
    { name: 'Курица запеченная с кожей', aliases: ['курица запеченная', 'жареная курица', 'курица гриль', 'курица'], calories: 220, protein: 25, fat: 13, carbs: 0 },
    { name: 'Индейка филе запеченное', aliases: ['филе индейки', 'грудка индейки', 'индейка грудка', 'индейка филе', 'индейка'], calories: 145, protein: 30, fat: 2.5, carbs: 0 },
    { name: 'Говядина нежирная запеченная', aliases: ['говядина', 'говядина запеченная', 'говядина отварная', 'beef'], calories: 187, protein: 26, fat: 9, carbs: 0 },
    { name: 'Говяжий стейк / вырезка', aliases: ['стейк из говядины', 'вырезка говяжья', 'стейк', 'ростбиф'], calories: 218, protein: 26, fat: 12, carbs: 0 },
    { name: 'Телятина', aliases: ['телятина отварная', 'телятина запеченная'], calories: 131, protein: 24, fat: 3.5, carbs: 0 },
    { name: 'Свинина нежирная', aliases: ['свинина', 'свиная вырезка', 'свиной карбонад', 'pork'], calories: 195, protein: 26, fat: 10, carbs: 0 },
    { name: 'Фарш куриный', aliases: ['куриный фарш'], calories: 143, protein: 18, fat: 8, carbs: 0 },
    { name: 'Фарш говяжий нежирный', aliases: ['говяжий фарш'], calories: 215, protein: 19, fat: 15, carbs: 0 },
    { name: 'Фарш домашний (говядина + свинина)', aliases: ['домашний фарш', 'свино-говяжий фарш'], calories: 260, protein: 16, fat: 21, carbs: 0 },
    { name: 'Печень куриная', aliases: ['куриная печень', 'печенка куриная'], calories: 137, protein: 20.4, fat: 5.9, carbs: 0.7 },
    { name: 'Печень говяжья', aliases: ['говяжья печень'], calories: 135, protein: 20, fat: 3.6, carbs: 4 },
    { name: 'Котлеты мясные домашние', aliases: ['котлета', 'котлеты', 'биточки', 'котлеты из говядины'], calories: 230, protein: 14, fat: 16, carbs: 7 },
    { name: 'Сосиски молочные', aliases: ['сосиски', 'сосиска', 'сардельки'], calories: 260, protein: 11, fat: 23, carbs: 1.5 },
    { name: 'Ветчина из индейки / нежирная', aliases: ['ветчина', 'ветчина из индейки'], calories: 110, protein: 18, fat: 4, carbs: 1 },

    // 3. Рыба и морепродукты
    { name: 'Лосось (сёмга) запеченный', aliases: ['лосось', 'семга', 'сёмга', 'форель запеченная', 'salmon'], calories: 208, protein: 20, fat: 13, carbs: 0 },
    { name: 'Форель слабосоленая', aliases: ['слабосоленая форель', 'семга слабосоленая', 'лосось слабосоленый'], calories: 190, protein: 21, fat: 12, carbs: 0 },
    { name: 'Тунец в собственном соку', aliases: ['тунец консервированный', 'тунец в с/с', 'тунец'], calories: 116, protein: 26, fat: 1, carbs: 0 },
    { name: 'Минтай на пару / отварной', aliases: ['минтай', 'филе минтая'], calories: 72, protein: 16, fat: 0.9, carbs: 0 },
    { name: 'Треска отварная / запеченная', aliases: ['треска', 'филе трески'], calories: 78, protein: 17.8, fat: 0.7, carbs: 0 },
    { name: 'Скумбрия запеченная', aliases: ['скумбрия', 'скумбрия горячего копчения'], calories: 262, protein: 18, fat: 20.5, carbs: 0 },
    { name: 'Сельдь слабосоленая', aliases: ['сельдь', 'селедка', 'селедочка'], calories: 217, protein: 19.8, fat: 15.4, carbs: 0 },
    { name: 'Горбуша запеченная', aliases: ['горбуша', 'филе горбуши'], calories: 142, protein: 20.5, fat: 6.5, carbs: 0 },
    { name: 'Судак запеченный', aliases: ['судак', 'филе судака'], calories: 84, protein: 18.4, fat: 1.1, carbs: 0 },
    { name: 'Креветки отварные', aliases: ['креветки', 'креветка', 'королевские креветки', 'shrimp'], calories: 99, protein: 24, fat: 0.3, carbs: 0.2 },
    { name: 'Кальмар отварной', aliases: ['кальмар', 'кальмары'], calories: 92, protein: 18, fat: 1.4, carbs: 2 },
    { name: 'Мидии отварные', aliases: ['мидии'], calories: 86, protein: 12, fat: 2.2, carbs: 3.7 },
    { name: 'Крабовые палочки', aliases: ['крабовые палочки'], calories: 100, protein: 6, fat: 1, carbs: 15 },

    // 4. Яйца и молочные продукты
    { name: 'Яйцо куриное вареное (1 шт ~55г)', aliases: ['яйцо', 'яйца', 'яйцо куриное', 'яйцо вареное', 'яйцо всмятку', 'яйцо вкрутую', 'egg'], calories: 157, protein: 12.7, fat: 11.5, carbs: 0.7 },
    { name: 'Яичный белок', aliases: ['белок яичный', 'белок яйца'], calories: 52, protein: 11, fat: 0.2, carbs: 0.7 },
    { name: 'Яичный желток', aliases: ['желток яичный', 'желток'], calories: 322, protein: 16, fat: 27, carbs: 3.6 },
    { name: 'Яичница из 2 яиц', aliases: ['яичница', 'глазунья', 'яичница глазунья'], calories: 200, protein: 14, fat: 15, carbs: 1 },
    { name: 'Омлет классический на молоке', aliases: ['омлет', 'омлет из яиц'], calories: 154, protein: 10, fat: 11.5, carbs: 2 },
    { name: 'Творог 0% (обезжиренный)', aliases: ['творог 0%', 'обезжиренный творог', 'творог мягкий 0%'], calories: 71, protein: 16.5, fat: 0.5, carbs: 1.3 },
    { name: 'Творог 2%', aliases: ['творог 2%', 'творог 2.5%'], calories: 86, protein: 16, fat: 2, carbs: 1.5 },
    { name: 'Творог 5%', aliases: ['творог 5%', 'творог классический 5%', 'творог'], calories: 121, protein: 17, fat: 5, carbs: 1.8 },
    { name: 'Творог 9%', aliases: ['творог 9%', 'творог жирный 9%'], calories: 159, protein: 16, fat: 9, carbs: 2 },
    { name: 'Молоко 1.5%', aliases: ['молоко 1.5%', 'молоко нежирное 1.5%'], calories: 44, protein: 2.8, fat: 1.5, carbs: 4.7 },
    { name: 'Молоко 2.5%', aliases: ['молоко 2.5%', 'молоко пастеризованное 2.5%', 'молоко питьевое 2.5%', 'молоко', 'milk'], calories: 54, protein: 2.9, fat: 2.5, carbs: 4.8 },
    { name: 'Молоко 3.2%', aliases: ['молоко 3.2%', 'молоко отборное', 'молоко пастеризованное 3.2%'], calories: 59, protein: 3.0, fat: 3.2, carbs: 4.7 },
    { name: 'Кефир 1%', aliases: ['кефир 1%'], calories: 40, protein: 2.8, fat: 1, carbs: 4 },
    { name: 'Кефир 2.5%', aliases: ['кефир 2.5%', 'кефир'], calories: 53, protein: 2.9, fat: 2.5, carbs: 4 },
    { name: 'Ряженка 2.5%', aliases: ['ряженка', 'ряженка 2.5%'], calories: 54, protein: 2.9, fat: 2.5, carbs: 4.2 },
    { name: 'Сметана 10%', aliases: ['сметана 10%'], calories: 115, protein: 3, fat: 10, carbs: 2.9 },
    { name: 'Сметана 15%', aliases: ['сметана 15%', 'сметана'], calories: 162, protein: 2.6, fat: 15, carbs: 3.6 },
    { name: 'Сметана 20%', aliases: ['сметана 20%'], calories: 206, protein: 2.5, fat: 20, carbs: 3.4 },
    { name: 'Йогурт греческий натуральный', aliases: ['греческий йогурт', 'йогурт натуральный', 'йогурт без сахара'], calories: 73, protein: 10, fat: 2, carbs: 3.6 },
    { name: 'Йогурт питьевой классический', aliases: ['йогурт', 'йогурт питьевой'], calories: 66, protein: 3.2, fat: 2.5, carbs: 8 },
    { name: 'Сыр Российский (45-50%)', aliases: ['сыр российский', 'российский сыр', 'сыр твердый', 'сыр'], calories: 363, protein: 24, fat: 29.5, carbs: 0 },
    { name: 'Сыр Гауда', aliases: ['сыр гауда', 'гауда'], calories: 356, protein: 25, fat: 27.5, carbs: 0 },
    { name: 'Сыр Моцарелла', aliases: ['моцарелла', 'сыр моцарелла', 'mozzarella'], calories: 280, protein: 22, fat: 20, carbs: 2.2 },
    { name: 'Сыр Пармезан', aliases: ['пармезан', 'сыр пармезан', 'parmesan'], calories: 431, protein: 38, fat: 29, carbs: 4 },
    { name: 'Сыр Сулугуни', aliases: ['сулугуни', 'сыр сулугуни'], calories: 286, protein: 20, fat: 22, carbs: 0 },
    { name: 'Сыр Фета', aliases: ['фета', 'сыр фета', 'брынза'], calories: 264, protein: 14, fat: 21, carbs: 4 },
    { name: 'Сыр творожный (сливочный)', aliases: ['творожный сыр', 'кремчиз', 'сливочный сыр'], calories: 240, protein: 6, fat: 23, carbs: 3 },
    { name: 'Масло сливочное 82.5%', aliases: ['масло сливочное', 'сливочное масло 82.5%', 'масло 82.5%', 'сливочное масло'], calories: 748, protein: 0.6, fat: 82.5, carbs: 0.8 },
    { name: 'Масло сливочное 72.5%', aliases: ['масло крестьянское', 'сливочное масло 72.5%', 'масло 72.5%'], calories: 662, protein: 1, fat: 72.5, carbs: 1.4 },

    // 5. Овощи, грибы и зелень
    { name: 'Огурец свежий', aliases: ['огурец', 'огурцы', 'огурчик', 'cucumber'], calories: 15, protein: 0.8, fat: 0.1, carbs: 3 },
    { name: 'Помидор свежий (томат)', aliases: ['помидор', 'помидоры', 'томат', 'томаты', 'черри', 'tomato'], calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9 },
    { name: 'Картофель отварной', aliases: ['картофель', 'картошка', 'картофель отварной', 'вареная картошка', 'potato'], calories: 87, protein: 2, fat: 0.1, carbs: 20 },
    { name: 'Картофель жареный', aliases: ['жареная картошка', 'картофель жареный', 'картошка жареная'], calories: 192, protein: 2.8, fat: 9.5, carbs: 24 },
    { name: 'Картофельное пюре на молоке', aliases: ['картофельное пюре', 'пюре', 'пюрешка'], calories: 106, protein: 2, fat: 4, carbs: 15 },
    { name: 'Морковь свежая', aliases: ['морковь', 'морковка', 'carrot'], calories: 35, protein: 1.3, fat: 0.1, carbs: 7 },
    { name: 'Капуста белокочанная', aliases: ['капуста', 'капуста свежая', 'cabbage'], calories: 25, protein: 1.8, fat: 0.1, carbs: 4.7 },
    { name: 'Брокколи', aliases: ['брокколи', 'капуста брокколи', 'broccoli'], calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6 },
    { name: 'Цветная капуста', aliases: ['цветная капуста'], calories: 25, protein: 2, fat: 0.3, carbs: 5 },
    { name: 'Кабачок свежий', aliases: ['кабачок', 'кабачки', 'цукини'], calories: 17, protein: 0.6, fat: 0.3, carbs: 3.1 },
    { name: 'Баклажан свежий', aliases: ['баклажан', 'баклажаны'], calories: 25, protein: 1, fat: 0.2, carbs: 5.7 },
    { name: 'Перец болгарский сладкий', aliases: ['болгарский перец', 'перец сладкий', 'перец'], calories: 27, protein: 1.3, fat: 0.1, carbs: 5.3 },
    { name: 'Свёкла отварная', aliases: ['свекла', 'свёкла', 'свекла отварная'], calories: 44, protein: 1.7, fat: 0.2, carbs: 9.6 },
    { name: 'Лук репчатый', aliases: ['лук репчатый', 'лук', 'onion'], calories: 40, protein: 1.4, fat: 0.2, carbs: 8.2 },
    { name: 'Лук зеленый', aliases: ['зеленый лук', 'зелёный лук'], calories: 20, protein: 1.3, fat: 0.1, carbs: 4.6 },
    { name: 'Чеснок', aliases: ['чеснок', 'garlic'], calories: 149, protein: 6.4, fat: 0.5, carbs: 33 },
    { name: 'Шпинат свежий', aliases: ['шпинат', 'spinach'], calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6 },
    { name: 'Салат листовой / Айсберг', aliases: ['салат айсберг', 'айсберг', 'листья салата', 'салат листовой'], calories: 14, protein: 1.2, fat: 0.2, carbs: 2.3 },
    { name: 'Укроп / Петрушка', aliases: ['укроп', 'петрушка', 'зелень'], calories: 40, protein: 3, fat: 0.5, carbs: 6 },
    { name: 'Авокадо', aliases: ['авокадо', 'avocado'], calories: 160, protein: 2, fat: 14.7, carbs: 8.5 },
    { name: 'Шампиньоны свежие', aliases: ['шампиньоны', 'грибы шампиньоны', 'грибы'], calories: 27, protein: 4.3, fat: 1, carbs: 1 },
    { name: 'Кукуруза консервированная', aliases: ['кукуруза консервированная', 'кукуруза'], calories: 86, protein: 2.2, fat: 1.2, carbs: 18 },
    { name: 'Горошек зеленый консервированный', aliases: ['зеленый горошек', 'горошек консервированный', 'горошек'], calories: 73, protein: 5, fat: 0.2, carbs: 12.8 },

    // 6. Фрукты, ягоды и сухофрукты
    { name: 'Яблоко свежее', aliases: ['яблоко', 'яблоки', 'яблочко', 'apple'], calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8 },
    { name: 'Банан свежий', aliases: ['банан', 'бананы', 'banana'], calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8 },
    { name: 'Апельсин', aliases: ['апельсин', 'апельсины', 'orange'], calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8 },
    { name: 'Мандарин', aliases: ['мандарин', 'мандарины'], calories: 53, protein: 0.8, fat: 0.3, carbs: 13.3 },
    { name: 'Грейпфрут', aliases: ['грейпфрут'], calories: 42, protein: 0.8, fat: 0.1, carbs: 10.7 },
    { name: 'Лимон', aliases: ['лимон', 'лимоны', 'lemon'], calories: 29, protein: 1.1, fat: 0.3, carbs: 9.3 },
    { name: 'Груша', aliases: ['груша', 'груши', 'pear'], calories: 57, protein: 0.4, fat: 0.1, carbs: 15.2 },
    { name: 'Персик', aliases: ['персик', 'персики', 'peach'], calories: 39, protein: 0.9, fat: 0.3, carbs: 9.5 },
    { name: 'Абрикос', aliases: ['абрикос', 'абрикосы'], calories: 48, protein: 1.4, fat: 0.4, carbs: 11.1 },
    { name: 'Киви', aliases: ['киви', 'kiwi'], calories: 61, protein: 1.1, fat: 0.5, carbs: 14.7 },
    { name: 'Виноград', aliases: ['виноград', 'виноград кишмиш', 'grapes'], calories: 67, protein: 0.6, fat: 0.2, carbs: 17.5 },
    { name: 'Арбуз', aliases: ['арбуз', 'watermelon'], calories: 30, protein: 0.6, fat: 0.2, carbs: 7.6 },
    { name: 'Дыня', aliases: ['дыня', 'melon'], calories: 34, protein: 0.8, fat: 0.2, carbs: 8.2 },
    { name: 'Ананас свежий', aliases: ['ананас', 'pineapple'], calories: 50, protein: 0.5, fat: 0.1, carbs: 13.1 },
    { name: 'Манго', aliases: ['манго', 'mango'], calories: 60, protein: 0.8, fat: 0.4, carbs: 15 },
    { name: 'Клубника свежая', aliases: ['клубника', 'клубничка', 'strawberry'], calories: 33, protein: 0.7, fat: 0.3, carbs: 7.7 },
    { name: 'Малина свежая', aliases: ['малина', 'ягода малина'], calories: 52, protein: 1.2, fat: 0.7, carbs: 11.9 },
    { name: 'Черника / Голубика', aliases: ['черника', 'голубика', 'blueberry'], calories: 57, protein: 0.7, fat: 0.3, carbs: 14.5 },
    { name: 'Вишня свежая', aliases: ['вишня', 'вишни'], calories: 50, protein: 1, fat: 0.3, carbs: 12 },
    { name: 'Черешня', aliases: ['черешня'], calories: 63, protein: 1.1, fat: 0.4, carbs: 16 },
    { name: 'Курага', aliases: ['курага', 'сушеный абрикос'], calories: 241, protein: 3.4, fat: 0.5, carbs: 62.6 },
    { name: 'Изюм', aliases: ['изюм'], calories: 299, protein: 3, fat: 0.5, carbs: 79 },
    { name: 'Чернослив', aliases: ['чернослив'], calories: 240, protein: 2.2, fat: 0.4, carbs: 63.9 },
    { name: 'Финики', aliases: ['финики', 'финик'], calories: 282, protein: 2.5, fat: 0.4, carbs: 75 },

    // 7. Хлеб, выпечка, снеки
    { name: 'Хлеб белый пшеничный', aliases: ['хлеб белый', 'белый хлеб', 'хлеб пшеничный', 'bread'], calories: 265, protein: 9, fat: 3.2, carbs: 49 },
    { name: 'Хлеб ржаной (Бородинский)', aliases: ['хлеб ржаной', 'ржаной хлеб', 'хлеб бородинский', 'бородинский хлеб', 'черный хлеб'], calories: 205, protein: 6.8, fat: 1.3, carbs: 40.7 },
    { name: 'Хлеб цельнозерновой', aliases: ['цельнозерновой хлеб', 'хлеб из цельного зерна'], calories: 247, protein: 13, fat: 4.2, carbs: 41 },
    { name: 'Батон нарезной', aliases: ['батон', 'батон нарезной'], calories: 260, protein: 7.5, fat: 3, carbs: 51 },
    { name: 'Лаваш тонкий армянский', aliases: ['лаваш', 'тонкий лаваш', 'лаваш армянский'], calories: 236, protein: 7.9, fat: 1, carbs: 47.6 },
    { name: 'Хлебцы цельнозерновые (Dr. Korner / др.)', aliases: ['хлебцы', 'хлебцы цельнозерновые', 'хлебец'], calories: 320, protein: 11, fat: 2.5, carbs: 65 },
    { name: 'Круассан классический', aliases: ['круассан', 'круасан'], calories: 406, protein: 8.2, fat: 21, carbs: 45.8 },
    { name: 'Печенье овсяное', aliases: ['овсяное печенье', 'печенье овсяное'], calories: 437, protein: 6.5, fat: 14.4, carbs: 71.8 },
    { name: 'Печенье песочное / сахарное', aliases: ['печенье', 'песочное печенье', 'печенье к чаю'], calories: 480, protein: 6, fat: 22, carbs: 65 },

    // 8. Орехи, семена и масла
    { name: 'Грецкий орех', aliases: ['грецкий орех', 'грецкие орехи', 'walnut'], calories: 654, protein: 15.2, fat: 65.2, carbs: 7 },
    { name: 'Миндаль', aliases: ['миндаль', 'орех миндаль', 'almond'], calories: 579, protein: 21.2, fat: 49.9, carbs: 21.6 },
    { name: 'Фундук', aliases: ['фундук', 'лесной орех'], calories: 628, protein: 15, fat: 61, carbs: 17 },
    { name: 'Кешью', aliases: ['кешью', 'орех кешью'], calories: 553, protein: 18.2, fat: 43.8, carbs: 30.2 },
    { name: 'Арахис', aliases: ['арахис', 'земляной орех', 'peanut'], calories: 567, protein: 25.8, fat: 49.2, carbs: 16.1 },
    { name: 'Фисташки', aliases: ['фисташки'], calories: 560, protein: 20, fat: 45, carbs: 28 },
    { name: 'Семена подсолнечника (семечки)', aliases: ['семечки', 'семена подсолнечника', 'семечки очищенные'], calories: 584, protein: 20.8, fat: 51.5, carbs: 20 },
    { name: 'Семена тыквы', aliases: ['тыквенные семечки', 'семена тыквы'], calories: 559, protein: 30, fat: 49, carbs: 11 },
    { name: 'Семена льна', aliases: ['семена льна', 'лен'], calories: 534, protein: 18.3, fat: 42.2, carbs: 28.9 },
    { name: 'Семена чиа', aliases: ['семена чиа', 'чиа'], calories: 486, protein: 16.5, fat: 30.7, carbs: 42.1 },
    { name: 'Масло подсолнечное рафинированное', aliases: ['масло подсолнечное', 'подсолнечное масло', 'масло растительное', 'растительное масло', 'sunflower oil', 'refined sunflower oil'], calories: 884, protein: 0, fat: 100, carbs: 0 },
    { name: 'Масло оливковое Extra Virgin', aliases: ['масло оливковое', 'оливковое масло', 'olive oil'], calories: 884, protein: 0, fat: 100, carbs: 0 },

    // 9. Популярные готовые блюда
    { name: 'Борщ с говядиной', aliases: ['борщ', 'борщ со сметаной', 'украинский борщ', 'красный борщ'], calories: 65, protein: 4, fat: 3, carbs: 5.5 },
    { name: 'Щи из свежей капусты', aliases: ['щи', 'щи мясные'], calories: 45, protein: 2.5, fat: 2, carbs: 4.2 },
    { name: 'Суп куриный с лапшой', aliases: ['куриный суп', 'суп лапша', 'куриная лапша', 'бульон куриный'], calories: 50, protein: 4.2, fat: 1.8, carbs: 4.5 },
    { name: 'Суп гороховый с копченостями', aliases: ['гороховый суп', 'суп гороховый'], calories: 66, protein: 4.4, fat: 2.4, carbs: 8.5 },
    { name: 'Солянка мясная сборная', aliases: ['солянка', 'солянка мясная'], calories: 85, protein: 5.5, fat: 5.5, carbs: 3.5 },
    { name: 'Крем-суп тыквенный', aliases: ['тыквенный суп', 'крем-суп из тыквы'], calories: 60, protein: 1.5, fat: 3, carbs: 7 },
    { name: 'Крем-суп грибной', aliases: ['грибной суп', 'грибной крем-суп'], calories: 75, protein: 2, fat: 4.5, carbs: 6 },
    { name: 'Плов с курицей', aliases: ['плов', 'плов с курицей'], calories: 160, protein: 8, fat: 6, carbs: 18 },
    { name: 'Плов с говядиной', aliases: ['плов с мясом', 'плов с говядиной', 'узбекский плов'], calories: 190, protein: 9, fat: 8, carbs: 20 },
    { name: 'Салат Цезарь с курицей', aliases: ['цезарь', 'салат цезарь', 'caesar salad'], calories: 150, protein: 12, fat: 9, carbs: 5 },
    { name: 'Салат Оливье с колбасой', aliases: ['оливье', 'салат оливье'], calories: 198, protein: 5.5, fat: 16.5, carbs: 7 },
    { name: 'Салат Греческий', aliases: ['греческий салат', 'greek salad'], calories: 110, protein: 3.2, fat: 9.5, carbs: 4 },
    { name: 'Салат Винегрет', aliases: ['винегрет', 'салат винегрет'], calories: 90, protein: 1.7, fat: 4.8, carbs: 10 },
    { name: 'Салат овощной с маслом', aliases: ['овощной салат', 'салат из огурцов и помидоров'], calories: 75, protein: 1, fat: 6, carbs: 4 },
    { name: 'Пельмени отварные (с мясом)', aliases: ['пельмени', 'пельмешки', 'пельмени со сметаной'], calories: 275, protein: 12, fat: 14, carbs: 25 },
    { name: 'Вареники с картофелем', aliases: ['вареники', 'вареники с картошкой'], calories: 185, protein: 4, fat: 3.5, carbs: 34 },
    { name: 'Вареники с творогом', aliases: ['вареники с творогом'], calories: 210, protein: 9.5, fat: 5, carbs: 31 },
    { name: 'Сырники творожные', aliases: ['сырники', 'сырник', 'творожные сырники'], calories: 215, protein: 14, fat: 9, carbs: 19 },
    { name: 'Блины классические', aliases: ['блины', 'блинчики', 'блин'], calories: 233, protein: 6.1, fat: 10.2, carbs: 30.4 },
    { name: 'Оладьи на кефире', aliases: ['оладьи', 'оладушки'], calories: 227, protein: 5.5, fat: 9, carbs: 31 },
    { name: 'Запеканка творожная', aliases: ['запеканка', 'творожная запеканка'], calories: 170, protein: 15, fat: 6, carbs: 14 },
    { name: 'Шаурма с курицей', aliases: ['шаурма', 'шаверма', 'донер'], calories: 185, protein: 9.5, fat: 8.5, carbs: 17 },
    { name: 'Пицца Маргарита', aliases: ['пицца', 'пицца маргарита', 'pizza'], calories: 250, protein: 10, fat: 9, carbs: 31 },
    { name: 'Бургер с говядиной', aliases: ['бургер', 'гамбургер', 'чизбургер', 'burger'], calories: 260, protein: 13, fat: 12, carbs: 24 },

    // 10. Сладости, десерты и напитки
    { name: 'Шоколад молочный', aliases: ['шоколад молочный', 'молочный шоколад', 'плитка шоколада', 'milka', 'alpen gold'], calories: 535, protein: 7.6, fat: 29.7, carbs: 59.4 },
    { name: 'Шоколад темный 70%', aliases: ['шоколад темный', 'темный шоколад', 'горький шоколад 70%'], calories: 546, protein: 8.5, fat: 42.6, carbs: 30.8 },
    { name: 'Шоколад горький 85%', aliases: ['горький шоколад', 'шоколад горький 85%'], calories: 580, protein: 10, fat: 50, carbs: 20 },
    { name: 'Ореховая паста (Nutella / Nutti)', aliases: ['nutella', 'нутелла', 'шоколадная паста', 'ореховая паста'], calories: 539, protein: 6.3, fat: 30.9, carbs: 57.5 },
    { name: 'Зефир классический', aliases: ['зефир', 'зефир белый'], calories: 318, protein: 0.8, fat: 0.1, carbs: 78.5 },
    { name: 'Пастила', aliases: ['пастила', 'белевская пастила'], calories: 310, protein: 0.5, fat: 0, carbs: 80 },
    { name: 'Мармелад желейный', aliases: ['мармелад', 'желейные конфеты'], calories: 321, protein: 0.4, fat: 0.1, carbs: 79.4 },
    { name: 'Мёд натуральный', aliases: ['мед', 'мёд', 'honey'], calories: 304, protein: 0.3, fat: 0, carbs: 82.4 },
    { name: 'Сахар белый', aliases: ['сахар', 'сахарный песок', 'sugar'], calories: 387, protein: 0, fat: 0, carbs: 100 },
    { name: 'Варенье / Джем', aliases: ['варенье', 'джем', 'повидло'], calories: 240, protein: 0.4, fat: 0.2, carbs: 60 },
    { name: 'Мороженое пломбир', aliases: ['мороженое', 'пломбир', 'стаканчик пломбир'], calories: 227, protein: 3.7, fat: 15, carbs: 20.4 },
    { name: 'Кофе черный без сахара (эспрессо/американо)', aliases: ['кофе', 'эспрессо', 'американо', 'кофе черный', 'coffee'], calories: 2, protein: 0.2, fat: 0, carbs: 0.3 },
    { name: 'Кофе с молоком без сахара', aliases: ['кофе с молоком', 'кофе молоко'], calories: 35, protein: 1.8, fat: 1.5, carbs: 3 },
    { name: 'Капучино без сахара', aliases: ['капучино', 'cappuccino'], calories: 45, protein: 2.5, fat: 2.2, carbs: 3.8 },
    { name: 'Латте без сахара', aliases: ['латте', 'latte'], calories: 55, protein: 3.1, fat: 2.8, carbs: 4.5 },
    { name: 'Чай без сахара (черный / зеленый)', aliases: ['чай', 'черный чай', 'зеленый чай', 'tea'], calories: 1, protein: 0, fat: 0, carbs: 0.2 },
    { name: 'Кола (Coca-Cola / Добрый Кола)', aliases: ['кока кола', 'coca-cola', 'кола', 'добрый кола', 'пепси', 'pepsi', 'coke'], calories: 42, protein: 0, fat: 0, carbs: 10.6 },
    { name: 'Кола без сахара (Zero / Без сахара)', aliases: ['кола зеро', 'coca-cola zero', 'кола без сахара'], calories: 0.3, protein: 0, fat: 0, carbs: 0 },
    { name: 'Сок апельсиновый 100%', aliases: ['апельсиновый сок', 'сок апельсиновый', 'сок'], calories: 45, protein: 0.7, fat: 0.2, carbs: 10.2 },
    { name: 'Сок яблочный 100%', aliases: ['яблочный сок', 'сок яблочный'], calories: 46, protein: 0.5, fat: 0.1, carbs: 11 },
    { name: 'Морс клюквенный', aliases: ['морс', 'морс клюквенный'], calories: 40, protein: 0.1, fat: 0, carbs: 10 },
    { name: 'Протеиновый батончик', aliases: ['протеиновый батончик', 'батончик протеиновый', 'protein bar'], calories: 360, protein: 30, fat: 12, carbs: 33 },
    { name: 'Сывороточный протеин (порошок)', aliases: ['протеин', 'сывороточный протеин', 'вей протеин', 'whey protein'], calories: 380, protein: 78, fat: 5, carbs: 6 }
  ];

  // Реестр частых штрихкодов продуктов
  const COMMON_BARCODES = {
    '5449000000996': { name: 'Coca-Cola', calories: 42, protein: 0, fat: 0, carbs: 10.6 },
    '4607053473544': { name: 'Молоко Простоквашино 2.5%', calories: 54, protein: 2.9, fat: 2.5, carbs: 4.8 },
    '4607053473537': { name: 'Молоко Простоквашино Отборное', calories: 63, protein: 3.2, fat: 3.5, carbs: 4.7 },
    '4601662000016': { name: 'Молоко Parmalat 3.5%', calories: 62, protein: 3, fat: 3.5, carbs: 4.7 },
    '4600605008515': { name: 'Макароны Makfa Перья', calories: 356, protein: 12, fat: 1.3, carbs: 70.5 },
    '4605829006040': { name: 'Хлеб пшеничный', calories: 278, protein: 8, fat: 6, carbs: 48 },
    '4601347004179': { name: 'Хлеб Бородинский', calories: 200, protein: 7, fat: 1.5, carbs: 40 },
    '4601347002212': { name: 'Батон нарезной', calories: 260, protein: 7.5, fat: 3, carbs: 51 },
    '4607015630329': { name: 'Творог Простоквашино 5%', calories: 121, protein: 16, fat: 5, carbs: 3 },
    '4605496000078': { name: 'Хлопья овсяные Ясно Солнышко №2', calories: 310, protein: 12, fat: 6, carbs: 62 },
    '7622210286864': { name: 'Шоколад Milka Молочный', calories: 539, protein: 6.3, fat: 31, carbs: 58 },
    '7622210100917': { name: 'Milka Choco', calories: 505, protein: 5.7, fat: 24, carbs: 65 },
    '3017620422003': { name: 'Паста Nutella', calories: 539, protein: 6.3, fat: 30.9, carbs: 57.5 },
    '4820000000000': { name: 'Масло подсолнечное рафинированное', calories: 884, protein: 0, fat: 100, carbs: 0 }
  };

  /**
   * Комплексное извлечение КБЖУ из любых структур ответов Open Food Facts API
   */
  function extractNutrients(product) {
    if (!product) return { calories: 0, protein: 0, fat: 0, carbs: 0 };
    const nut = product.nutriments || product.nutrition || {};

    // 1. Белки (г)
    let p = nut['proteins_100g'] ?? nut['proteins_value'] ?? nut['proteins'] ??
            nut['protein_100g'] ?? nut['protein_value'] ?? nut['protein'] ??
            nut['proteins_serving'] ?? 0;
    p = Math.max(0, Math.round((Number(p) || 0) * 10) / 10);

    // 2. Жиры (г)
    let f = nut['fat_100g'] ?? nut['fat_value'] ?? nut['fat'] ??
            nut['fats_100g'] ?? nut['lipides_100g'] ?? nut['lipids_100g'] ??
            nut['fat_serving'] ?? nut['saturated-fat_100g'] ?? 0;
    f = Math.max(0, Math.round((Number(f) || 0) * 10) / 10);

    // 3. Углеводы (г)
    let c = nut['carbohydrates_100g'] ?? nut['carbohydrates_value'] ?? nut['carbohydrates'] ??
            nut['carbs_100g'] ?? nut['carbs_value'] ?? nut['carbs'] ??
            nut['glucides_100g'] ?? nut['carbohydrates_serving'] ?? nut['sugars_100g'] ?? 0;
    c = Math.max(0, Math.round((Number(c) || 0) * 10) / 10);

    // 4. Калории (ккал)
    let kcal = nut['energy-kcal_100g'] ?? nut['energy-kcal_value'] ?? nut['energy-kcal'] ??
               nut['energy_kcal_100g'] ?? nut['energy_kcal'] ?? nut['energy-kcal_serving'];

    if (kcal == null) {
      const kj = nut['energy-kj_100g'] ?? nut['energy-kj_value'] ?? nut['energy-kj'] ?? nut['energy-kj_serving'];
      if (kj != null && Number(kj) > 0) {
        kcal = Math.round(Number(kj) / 4.184);
      }
    }

    if (kcal == null) {
      const nrg = nut['energy_100g'] ?? nut['energy_value'] ?? nut['energy'] ?? nut['energy_serving'];
      if (nrg != null && Number(nrg) > 0) {
        const unit = String(nut['energy_unit'] || '').toLowerCase();
        if (unit === 'kcal') {
          kcal = Math.round(Number(nrg));
        } else if (unit === 'kj' || Number(nrg) > 900) {
          kcal = Math.round(Number(nrg) / 4.184);
        } else {
          kcal = Math.round(Number(nrg));
        }
      }
    }

    kcal = Math.max(0, Math.round(Number(kcal) || 0));

    // 5. Формула Этуотера: если калории нулевые или пропущены в базе, но есть БЖУ
    if (kcal === 0 && (p > 0 || f > 0 || c > 0)) {
      kcal = Math.round(p * 4 + f * 9 + c * 4);
    }

    return { calories: kcal, protein: p, fat: f, carbs: c };
  }

  /**
   * Интеллектуальный поиск продукта / блюда во встроенной базе эталонных продуктов
   */
  function findBuiltinFood(query) {
    if (!query || typeof query !== 'string') return null;
    const cleanQ = query.trim().toLowerCase()
      .replace(/[\(\)\[\],\.«»"']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleanQ || cleanQ.length < 2) return null;

    // 1. Точное совпадение по имени или псевдониму
    let hit = BUILTIN_FOODS.find(f => f.name.toLowerCase() === cleanQ || f.aliases.some(a => a.toLowerCase() === cleanQ));
    if (hit) return hit;

    // 2. Совпадение по началу строки (startsWith)
    hit = BUILTIN_FOODS.find(f => f.name.toLowerCase().startsWith(cleanQ) || f.aliases.some(a => a.toLowerCase().startsWith(cleanQ)));
    if (hit) return hit;

    // 3. Вхождение подстроки (substring)
    hit = BUILTIN_FOODS.find(f => cleanQ.includes(f.name.toLowerCase()) || f.aliases.some(a => cleanQ.includes(a.toLowerCase())));
    if (hit) return hit;

    // 4. Пословный поиск по ключевым словам
    const words = cleanQ.split(' ').filter(w => w.length > 2);
    if (words.length > 0) {
      hit = BUILTIN_FOODS.find(f => {
        const text = (f.name + ' ' + f.aliases.join(' ')).toLowerCase();
        return words.every(w => text.includes(w));
      });
      if (hit) return hit;

      // Поиск по первому значимому слову (например: «яблоко», «молоко», «гречка»)
      hit = BUILTIN_FOODS.find(f => {
        const text = (f.name + ' ' + f.aliases.join(' ')).toLowerCase();
        return text.includes(words[0]);
      });
      if (hit) return hit;
    }

    return null;
  }

  class NutritionTracker {
    constructor() {
      this.data = this.loadData();
      this.customFoods = this.loadCustomFoods();
      this.recipes = this.loadRecipes();
    }

    getCategoryIcons() {
      return [...FOOD_CATEGORY_ICONS];
    }

    renderMealIcon(icon, name, className) {
      return renderMealIconHtml(icon, name, className);
    }

    loadData() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            let loadedMeals = (Array.isArray(parsed.meals) && parsed.meals.length > 0) ? parsed.meals : [...DEFAULT_MEALS];
            // Плавное обновление старых эмодзи на новые иллюстрации Food_Kategory.jpg
            loadedMeals = loadedMeals.map(m => {
              if (m.icon === '🍳') return { ...m, icon: 'assets/nutrition_icons/meal_icon_1.webp' };
              if (m.icon === '🍲') return { ...m, icon: 'assets/nutrition_icons/meal_icon_7.webp' };
              if (m.icon === '🍽️') return { ...m, icon: 'assets/nutrition_icons/meal_icon_5.webp' };
              if (m.icon === '🥪') return { ...m, icon: 'assets/nutrition_icons/meal_icon_9.webp' };
              return m;
            });
            // Автоматическое удаление тестовой симуляции без следа и восстановление бэкапа
            let needsImmediateSave = false;
            try {
              if (typeof localStorage !== 'undefined') {
                const backupRaw = localStorage.getItem('plan4u_nutrition_backup_before_simulation');
                if (backupRaw) {
                  const parsedBackup = JSON.parse(backupRaw);
                  if (Array.isArray(parsedBackup)) {
                    parsed.entries = parsedBackup;
                    needsImmediateSave = true;
                  }
                  localStorage.removeItem('plan4u_nutrition_backup_before_simulation');
                }
                if (localStorage.getItem('plan4u_nutrition_sim_active')) {
                  localStorage.removeItem('plan4u_nutrition_sim_active');
                  needsImmediateSave = true;
                }
              }
            } catch (e) {}

            let cleanEntries = Array.isArray(parsed.entries) ? parsed.entries : [];
            const originalCount = cleanEntries.length;
            cleanEntries = cleanEntries.filter(e => e && !e.isSimulation && !(e.id && String(e.id).startsWith('sim_')));
            if (cleanEntries.length !== originalCount) {
              needsImmediateSave = true;
            }

            const finalData = {
              settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
              meals: loadedMeals,
              entries: cleanEntries,
              recipes: Array.isArray(parsed.recipes) ? parsed.recipes : []
            };

            if (needsImmediateSave && typeof localStorage !== 'undefined') {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
              } catch (e) {}
            }

            return finalData;
          }
        }
      } catch (e) {
        console.warn('Plan4UNutritionTracker: error loading data', e);
      }
      return {
        settings: { ...DEFAULT_SETTINGS },
        meals: [...DEFAULT_MEALS],
        entries: [],
        recipes: []
      };
    }

    saveData() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        }
        if (typeof window !== 'undefined' && window.Plan4UStorage && typeof window.Plan4UStorage.saveFile === 'function') {
          window.Plan4UStorage.saveFile('nutrition_data.json', this.data);
        }
      } catch (e) {
        console.warn('Plan4UNutritionTracker: error saving data', e);
      }
    }

    loadCustomFoods() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(CUSTOM_FOODS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      } catch (e) {
        console.warn('Plan4UNutritionTracker: error loading custom foods', e);
      }
      return [];
    }

    saveCustomFoods() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(this.customFoods));
        }
        if (typeof window !== 'undefined' && window.Plan4UStorage && typeof window.Plan4UStorage.saveFile === 'function') {
          window.Plan4UStorage.saveFile('nutrition_custom_foods.json', this.customFoods);
        }
      } catch (e) {
        console.warn('Plan4UNutritionTracker: error saving custom foods', e);
      }
    }

    // --- Recipes (Составные блюда) Management & Storage ---
    loadRecipes() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(RECIPES_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      } catch (e) {
        console.warn('Plan4UNutritionTracker: error loading recipes', e);
      }
      return [];
    }

    saveRecipes() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(RECIPES_KEY, JSON.stringify(this.recipes));
        }
        if (typeof window !== 'undefined' && window.Plan4UStorage && typeof window.Plan4UStorage.saveFile === 'function') {
          window.Plan4UStorage.saveFile('nutrition_recipes.json', this.recipes);
        }
      } catch (e) {
        console.warn('Plan4UNutritionTracker: error saving recipes', e);
      }
    }

    getRecipes() {
      return [...this.recipes];
    }

    getRecipe(id) {
      if (!id) return null;
      return this.recipes.find(r => r.id === id) || null;
    }

    getRecipeByName(name) {
      if (!name) return null;
      const clean = String(name).trim().toLowerCase();
      return this.recipes.find(r => (r.name || '').trim().toLowerCase() === clean) || null;
    }

    saveRecipe(recipe) {
      if (!recipe || !recipe.name) return null;
      const trimmedName = String(recipe.name).trim();
      const idx = this.recipes.findIndex(r =>
        (recipe.id && r.id === recipe.id) ||
        (r.name && r.name.toLowerCase() === trimmedName.toLowerCase())
      );

      const entry = {
        id: recipe.id || ('rec_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)),
        name: trimmedName,
        isCustom: true,
        isComposite: true,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ing => ({
          name: String(ing.name || '').trim(),
          rawWeight: Math.max(0, Number(ing.rawWeight) || 0),
          calories100g: Math.max(0, Number(ing.calories100g) || 0),
          protein100g: Math.max(0, Number(ing.protein100g) || 0),
          fat100g: Math.max(0, Number(ing.fat100g) || 0),
          carbs100g: Math.max(0, Number(ing.carbs100g) || 0)
        })) : [],
        cookedWeight: Math.max(1, Number(recipe.cookedWeight) || 0),
        portionWeight: Math.max(0, Number(recipe.portionWeight) || 0),
        caloriesPer100g: Math.round(Number(recipe.caloriesPer100g) || 0),
        proteinPer100g: Math.round((Number(recipe.proteinPer100g) || 0) * 10) / 10,
        fatPer100g: Math.round((Number(recipe.fatPer100g) || 0) * 10) / 10,
        carbsPer100g: Math.round((Number(recipe.carbsPer100g) || 0) * 10) / 10,
        updatedAt: Date.now()
      };

      if (idx !== -1) {
        this.recipes[idx] = { ...this.recipes[idx], ...entry };
      } else {
        this.recipes.unshift(entry);
      }
      this.saveRecipes();

      // Register / update in customFoods so it's readily searchable everywhere
      this.saveCustomFood({
        id: 'cf_' + entry.id,
        name: entry.name,
        caloriesPer100g: entry.caloriesPer100g,
        proteinPer100g: entry.proteinPer100g,
        fatPer100g: entry.fatPer100g,
        carbsPer100g: entry.carbsPer100g,
        isCustom: true,
        isComposite: true,
        source: 'custom_recipe',
        recipeId: entry.id
      });

      return entry;
    }

    deleteRecipe(id) {
      const initialLen = this.recipes.length;
      this.recipes = this.recipes.filter(r => r.id !== id);
      if (this.recipes.length !== initialLen) {
        this.saveRecipes();
        return true;
      }
      return false;
    }

    // Hydrate persistent data from Plan4UStorage (IndexedDB & Native Filesystem)
    async hydrateFromStorage() {
      if (typeof window === 'undefined' || !window.Plan4UStorage || typeof window.Plan4UStorage.loadFile !== 'function') {
        return;
      }
      try {
        const [storedData, storedFoods, storedRecipes] = await Promise.all([
          window.Plan4UStorage.loadFile('nutrition_data.json', null).catch(() => null),
          window.Plan4UStorage.loadFile('nutrition_custom_foods.json', null).catch(() => null),
          window.Plan4UStorage.loadFile('nutrition_recipes.json', null).catch(() => null)
        ]);

        let changedData = false;
        let changedFoods = false;
        let changedRecipes = false;

        if (storedData && typeof storedData === 'object') {
          if (Array.isArray(storedData.entries) && storedData.entries.length > 0) {
            const existingIds = new Set(this.data.entries.map(e => e.id));
            storedData.entries.forEach(entry => {
              if (entry && entry.id && !existingIds.has(entry.id)) {
                this.data.entries.push(entry);
                changedData = true;
              }
            });
          }
        }

        if (Array.isArray(storedFoods) && storedFoods.length > 0) {
          const existingNames = new Set(this.customFoods.map(f => (f.name || '').toLowerCase()));
          storedFoods.forEach(food => {
            if (food && food.name && !existingNames.has(food.name.toLowerCase())) {
              this.customFoods.push({ ...food, isCustom: true });
              existingNames.add(food.name.toLowerCase());
              changedFoods = true;
            }
          });
        }

        if (Array.isArray(storedRecipes) && storedRecipes.length > 0) {
          const existingRecNames = new Set(this.recipes.map(r => (r.name || '').toLowerCase()));
          storedRecipes.forEach(rec => {
            if (rec && rec.name && !existingRecNames.has(rec.name.toLowerCase())) {
              this.recipes.push({ ...rec, isCustom: true, isComposite: true });
              existingRecNames.add(rec.name.toLowerCase());
              changedRecipes = true;
            }
          });
        }

        if (changedData) this.saveData();
        if (changedFoods) this.saveCustomFoods();
        if (changedRecipes) this.saveRecipes();
      } catch (e) {
        console.warn('Plan4UNutritionTracker: hydration error', e);
      }
    }

    // --- Settings ---
    isEnabled() {
      return !!this.data.settings.enabled;
    }

    setEnabled(val) {
      this.data.settings.enabled = !!val;
      this.saveData();
    }

    getSettings() {
      return { ...this.data.settings };
    }

    updateSettings(updates) {
      this.data.settings = { ...this.data.settings, ...updates };
      this.saveData();
      return this.data.settings;
    }

    /**
     * Научный автоматический расчёт суточных калорий и БЖУ (Формула Миффлина — Сан-Жеора)
     */
    static calculateTargets(params = {}) {
      const gender = params.gender === 'male' ? 'male' : 'female';
      const age = Math.min(120, Math.max(12, Number(params.age) || 28));
      const height = Math.min(250, Math.max(90, Number(params.height) || 165));
      const weight = Math.min(300, Math.max(30, Number(params.weight) || 65));

      const ACTIVITY_MULTIPLIERS = {
        sedentary: 1.2,    // Сидячий образ жизни
        light: 1.375,      // Легкая активность (1-3 тренировки/нед)
        moderate: 1.55,    // Умеренная активность (3-5 тренировок/нед)
        high: 1.725,       // Высокая активность (6-7 тренировок/нед)
        extreme: 1.9       // Экстремальная активность
      };
      const actMult = ACTIVITY_MULTIPLIERS[params.activityLevel] || ACTIVITY_MULTIPLIERS.light;

      // 1. BMR (Базовый обмен веществ)
      let bmr = (10 * weight) + (6.25 * height) - (5 * age);
      if (gender === 'male') {
        bmr += 5;
      } else {
        bmr -= 161;
      }
      bmr = Math.max(600, Math.round(bmr));

      // 2. TDEE (Полный суточный расход энергии с активностью)
      const tdee = Math.round(bmr * actMult);

      // 3. Калории с учётом цели
      let calTarget = tdee;
      let plannedDiff = 0;
      const userGoal = params.goal || 'maintain';

      if (userGoal === 'loss') {
        calTarget = Math.max(800, Math.round((tdee * 0.85) / 10) * 10);
        plannedDiff = calTarget - tdee;
      } else if (userGoal === 'gain') {
        calTarget = Math.max(800, Math.round((tdee * 1.10) / 10) * 10);
        plannedDiff = calTarget - tdee;
      } else {
        // Поддержание веса: округляем TDEE до ближайших 10 ккал, плановый дефицит/профицит = 0
        calTarget = Math.max(800, Math.round(tdee / 10) * 10);
        plannedDiff = 0;
      }

      // 4. Пропорции БЖУ
      const SPLITS = {
        balanced: { p: 0.30, f: 0.30, c: 0.40 }, // Здоровье и баланс
        loss_opt: { p: 0.35, f: 0.25, c: 0.40 }, // Снижение веса и рельеф
        low_carb: { p: 0.30, f: 0.40, c: 0.30 }, // Низкоуглеводная
        athlete:  { p: 0.25, f: 0.20, c: 0.55 }  // Энергия / выносливость
      };
      const split = SPLITS[params.macroSplit] || (params.goal === 'loss' ? SPLITS.loss_opt : SPLITS.balanced);

      const protGrams = Math.max(20, Math.round((calTarget * split.p) / 4));
      const fatGrams = Math.max(15, Math.round((calTarget * split.f) / 9));
      // Углеводы закрывают остаток калорийности для точности
      const carbKcal = Math.max(40, calTarget - (protGrams * 4 + fatGrams * 9));
      const carbGrams = Math.max(20, Math.round(carbKcal / 4));

      return {
        gender,
        age,
        height,
        weight,
        goal: userGoal,
        bmr,
        tdee,
        diffKcal: plannedDiff,
        calorieTarget: calTarget,
        proteinTarget: protGrams,
        fatTarget: fatGrams,
        carbTarget: carbGrams,
        splitPercents: {
          p: Math.round(split.p * 100),
          f: Math.round(split.f * 100),
          c: Math.round(split.c * 100)
        }
      };
    }

    calculateTargets(params = {}) {
      return NutritionTracker.calculateTargets(params);
    }

    setCycleTracker(ct) {
      this._cycleTracker = ct || null;
    }

    getMacroColor(key) {
      if (!this.data.settings) this.data.settings = { ...DEFAULT_SETTINGS };
      if (!this.data.settings.macroColors) {
        this.data.settings.macroColors = { ...DEFAULT_MACRO_COLORS };
      }
      return this.data.settings.macroColors[key] || DEFAULT_MACRO_COLORS[key] || '#3b82f6';
    }

    setMacroColor(key, color) {
      if (!this.data.settings) this.data.settings = { ...DEFAULT_SETTINGS };
      if (!this.data.settings.macroColors) {
        this.data.settings.macroColors = { ...DEFAULT_MACRO_COLORS };
      }
      this.data.settings.macroColors[key] = color;
      this.saveData();
      return this.data.settings.macroColors;
    }

    resetMacroColor(key) {
      if (!this.data.settings) this.data.settings = { ...DEFAULT_SETTINGS };
      if (!this.data.settings.macroColors) {
        this.data.settings.macroColors = { ...DEFAULT_MACRO_COLORS };
      }
      if (key && DEFAULT_MACRO_COLORS[key]) {
        this.data.settings.macroColors[key] = DEFAULT_MACRO_COLORS[key];
        this.saveData();
        return DEFAULT_MACRO_COLORS[key];
      }
      return this.getMacroColor(key);
    }

    adjustHexColor(hex, percent) {
      return adjustHexColor(hex, percent);
    }

    // --- Meals (Categories) ---
    getMeals() {
      return [...this.data.meals].sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    getMeal(id) {
      return this.data.meals.find(m => m.id === id) || null;
    }

    addMeal({ name, icon = '🥗', color = '#10b981' }) {
      const id = 'meal_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const maxOrder = this.data.meals.reduce((max, m) => Math.max(max, m.order || 0), 0);
      const newMeal = {
        id,
        name: (name || 'Приём пищи').trim(),
        icon: icon || '🥗',
        color: color || '#10b981',
        order: maxOrder + 1
      };
      this.data.meals.push(newMeal);
      this.saveData();
      return newMeal;
    }

    updateMeal(id, updates) {
      const idx = this.data.meals.findIndex(m => m.id === id);
      if (idx === -1) return null;
      this.data.meals[idx] = { ...this.data.meals[idx], ...updates };
      this.saveData();
      return this.data.meals[idx];
    }

    deleteMeal(id) {
      const idx = this.data.meals.findIndex(m => m.id === id);
      if (idx === -1) return false;
      if (this.data.meals.length <= 1) return false; // Оставляем минимум 1 прием пищи
      this.data.meals.splice(idx, 1);
      this.saveData();
      return true;
    }

    // --- Food Entries ---
    getEntries(date = null) {
      const targetDate = date || getTodayString();
      return this.data.entries.filter(e => e.date === targetDate);
    }

    getEntry(id) {
      return this.data.entries.find(e => e.id === id) || null;
    }

    addEntry({
      date = null,
      mealId,
      foodType = 'single', // 'single' | 'composite'
      name,
      weightGrams,
      calories,
      protein,
      fat,
      carbs,
      barcode = '',
      per100g = null,
      rawIngredients = null,
      cookedWeight = null,
      portionWeight = null
    }) {
      const id = 'entry_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const entry = {
        id,
        date: date || getTodayString(),
        mealId: mealId || (this.data.meals[0] ? this.data.meals[0].id : 'meal_breakfast'),
        foodType: foodType === 'composite' ? 'composite' : 'single',
        name: (name || 'Блюдо').trim(),
        weightGrams: Math.max(0, Math.round(Number(weightGrams) || 0)),
        calories: Math.max(0, Math.round(Number(calories) || 0)),
        protein: Math.max(0, Math.round((Number(protein) || 0) * 10) / 10),
        fat: Math.max(0, Math.round((Number(fat) || 0) * 10) / 10),
        carbs: Math.max(0, Math.round((Number(carbs) || 0) * 10) / 10),
        barcode: barcode || '',
        per100g: per100g || null,
        rawIngredients: Array.isArray(rawIngredients) ? rawIngredients : null,
        cookedWeight: cookedWeight != null ? Number(cookedWeight) : null,
        portionWeight: portionWeight != null ? Number(portionWeight) : null,
        timestamp: Date.now()
      };

      this.data.entries.push(entry);
      this.saveData();
      return entry;
    }

    deleteEntry(id) {
      const idx = this.data.entries.findIndex(e => e.id === id);
      if (idx === -1) return false;
      this.data.entries.splice(idx, 1);
      this.saveData();
      return true;
    }

    getEntry(id) {
      return (this.data.entries || []).find(e => e.id === id) || null;
    }

    updateEntry(id, updates = {}) {
      const entry = (this.data.entries || []).find(e => e.id === id);
      if (!entry) return null;
      if (updates.mealId !== undefined) entry.mealId = updates.mealId;
      if (updates.name !== undefined) entry.name = String(updates.name).trim();
      if (updates.weightGrams !== undefined) entry.weightGrams = Math.max(0, Math.round(Number(updates.weightGrams) || 0));
      if (updates.calories !== undefined) entry.calories = Math.max(0, Math.round(Number(updates.calories) || 0));
      if (updates.protein !== undefined) entry.protein = Math.max(0, Math.round((Number(updates.protein) || 0) * 10) / 10);
      if (updates.fat !== undefined) entry.fat = Math.max(0, Math.round((Number(updates.fat) || 0) * 10) / 10);
      if (updates.carbs !== undefined) entry.carbs = Math.max(0, Math.round((Number(updates.carbs) || 0) * 10) / 10);
      if (updates.barcode !== undefined) entry.barcode = updates.barcode;
      if (updates.per100g !== undefined) entry.per100g = updates.per100g;
      if (updates.rawIngredients !== undefined) entry.rawIngredients = updates.rawIngredients;
      if (updates.cookedWeight !== undefined) entry.cookedWeight = updates.cookedWeight;
      if (updates.portionWeight !== undefined) entry.portionWeight = updates.portionWeight;
      entry.updatedAt = Date.now();
      this.saveData();
      return entry;
    }

    // --- Kitchen / Composite Dish Calculator (Уварка / Ужарка) ---
    /**
     * Пересчет КБЖУ составного блюда с учетом изменения веса при готовке
     * @param {Array} ingredients - [{ name, rawWeight, calories100g, protein100g, fat100g, carbs100g }]
     * @param {number} cookedWeight - фактический вес готового блюда (г)
     * @param {number} portionWeight - вес съеденной порции (г)
     */
    calculateCompositeDish(ingredients, cookedWeight, portionWeight) {
      let rawTotalWeight = 0;
      let totalCalories = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;

      const items = (ingredients || []).map(ing => {
        const w = Math.max(0, Number(ing.rawWeight) || 0);
        const c100 = Number(ing.calories100g) || 0;
        const p100 = Number(ing.protein100g) || 0;
        const f100 = Number(ing.fat100g) || 0;
        const cb100 = Number(ing.carbs100g) || 0;

        const cal = (w * c100) / 100;
        const prot = (w * p100) / 100;
        const fat = (w * f100) / 100;
        const carb = (w * cb100) / 100;

        rawTotalWeight += w;
        totalCalories += cal;
        totalProtein += prot;
        totalFat += fat;
        totalCarbs += carb;

        return {
          ...ing,
          rawWeight: w,
          calories: Math.round(cal),
          protein: Math.round(prot * 10) / 10,
          fat: Math.round(fat * 10) / 10,
          carbs: Math.round(carb * 10) / 10
        };
      });

      const finalCookedWeight = Math.max(1, Number(cookedWeight) || rawTotalWeight || 1);
      const finalPortionWeight = Math.max(0, Number(portionWeight) || finalCookedWeight);

      // Плотность нутриентов на 100 г готового блюда
      const per100gCooked = {
        calories: Math.round((totalCalories / finalCookedWeight) * 100),
        protein: Math.round(((totalProtein / finalCookedWeight) * 100) * 10) / 10,
        fat: Math.round(((totalFat / finalCookedWeight) * 100) * 10) / 10,
        carbs: Math.round(((totalCarbs / finalCookedWeight) * 100) * 10) / 10
      };

      // Итоговые нутриенты для съеденной порции
      const portionNutrients = {
        weightGrams: finalPortionWeight,
        calories: Math.round((finalPortionWeight * per100gCooked.calories) / 100),
        protein: Math.round(((finalPortionWeight * per100gCooked.protein) / 100) * 10) / 10,
        fat: Math.round(((finalPortionWeight * per100gCooked.fat) / 100) * 10) / 10,
        carbs: Math.round(((finalPortionWeight * per100gCooked.carbs) / 100) * 10) / 10
      };

      // Коэффициент изменения веса (ужарка < 1, разваривание > 1)
      const ratio = rawTotalWeight > 0 ? (finalCookedWeight / rawTotalWeight) : 1;

      return {
        rawTotalWeight,
        cookedWeight: finalCookedWeight,
        portionWeight: finalPortionWeight,
        ratio: Math.round(ratio * 100) / 100,
        per100gCooked,
        portionNutrients,
        ingredients: items
      };
    }

    findFoodByName(query) {
      if (!query || typeof query !== 'string') return null;
      const q = query.trim().toLowerCase();
      if (!q) return null;

      // 1. Проверяем локальные сохраненные продукты пользователя
      if (Array.isArray(this.customFoods)) {
        const customHit = this.customFoods.find(f => f.name && f.name.toLowerCase() === q);
        if (customHit) return customHit;
      }

      // 2. Проверяем составные рецепты пользователя
      if (Array.isArray(this.recipes)) {
        const recipeHit = this.recipes.find(r => r.name && r.name.toLowerCase() === q);
        if (recipeHit) {
          return {
            id: recipeHit.id,
            name: recipeHit.name,
            caloriesPer100g: recipeHit.calories100g || recipeHit.per100g?.calories || 0,
            proteinPer100g: recipeHit.protein100g || recipeHit.per100g?.protein || 0,
            fatPer100g: recipeHit.fat100g || recipeHit.per100g?.fat || 0,
            carbsPer100g: recipeHit.carbs100g || recipeHit.per100g?.carbs || 0,
            recipe: recipeHit,
            isComposite: true,
            source: 'recipe'
          };
        }
      }

      // 3. Поиск во встроенной базе эталонных продуктов
      const bHit = findBuiltinFood(query);
      if (bHit) {
        return {
          id: 'builtin_' + bHit.name.toLowerCase().replace(/[^a-zа-я0-9]/gi, '_'),
          name: bHit.name,
          calories: bHit.calories,
          caloriesPer100g: bHit.calories,
          protein: bHit.protein,
          proteinPer100g: bHit.protein,
          fat: bHit.fat,
          fatPer100g: bHit.fat,
          carbs: bHit.carbs,
          carbsPer100g: bHit.carbs,
          isCustom: false,
          isBuiltin: true,
          source: 'builtin'
        };
      }

      return null;
    }

    // --- Custom Foods & Open Food Facts ---
    async lookupBarcode(barcode) {
      const code = String(barcode || '').trim();
      if (!code) return null;

      // 1. Проверяем локальную базу пользователя (только если есть валидные КБЖУ)
      const local = this.customFoods.find(f => f.barcode === code);
      if (local && (Number(local.caloriesPer100g) > 0 || Number(local.proteinPer100g) > 0 || Number(local.fatPer100g) > 0 || Number(local.carbsPer100g) > 0)) {
        return { ...local, source: 'local' };
      }

      // 2. Проверяем реестр частых штрихкодов продуктов
      if (COMMON_BARCODES[code]) {
        const bItem = COMMON_BARCODES[code];
        const item = {
          id: 'barcode_' + code,
          barcode: code,
          name: bItem.name,
          caloriesPer100g: bItem.calories,
          proteinPer100g: bItem.protein,
          fatPer100g: bItem.fat,
          carbsPer100g: bItem.carbs,
          source: 'builtin_barcode'
        };
        this.saveCustomFood(item);
        return item;
      }

      // 3. Запрос в Open Food Facts API с несколькими зеркалами и тайм-аутом
      const endpoints = [
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`,
        `https://ru.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`,
        `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`
      ];

      for (const url of endpoints) {
        try {
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'Plan4U-App/1.0 (contact@plan4u.app)' },
            signal: controller?.signal
          });
          if (timeoutId) clearTimeout(timeoutId);
          if (!res.ok) continue;

          const data = await res.json();
          if (data && data.product) {
            const p = data.product;
            let nut = extractNutrients(p);

            const name = p.product_name_ru || p.product_name || p.generic_name_ru || p.generic_name || (local && local.name) || `Продукт ${code}`;
            let brand = '';
            if (Array.isArray(p.brands)) {
              brand = p.brands.filter(Boolean).join(', ');
            } else if (typeof p.brands === 'string') {
              brand = p.brands.trim();
            }
            const displayName = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} (${brand})` : name;

            // Если в Open Food Facts пищевая ценность нулевая/не заполнена, пробуем сопоставить по названию
            if (nut.calories === 0 && nut.protein === 0 && nut.fat === 0 && nut.carbs === 0) {
              const matchedFood = findBuiltinFood(name);
              if (matchedFood) {
                nut = {
                  calories: matchedFood.calories,
                  protein: matchedFood.protein,
                  fat: matchedFood.fat,
                  carbs: matchedFood.carbs
                };
              }
            }

            const item = {
              id: 'food_' + code,
              barcode: code,
              name: displayName,
              caloriesPer100g: nut.calories,
              proteinPer100g: nut.protein,
              fatPer100g: nut.fat,
              carbsPer100g: nut.carbs,
              source: 'openfoodfacts'
            };

            this.saveCustomFood(item);
            return item;
          }
        } catch (e) {
          // Пробуем следующее зеркало
        }
      }

      // 4. Если штрихкод не найден в сети, но есть в локальной базе с именем
      if (local && local.name) {
        const matchedFood = findBuiltinFood(local.name);
        if (matchedFood) {
          const item = {
            id: local.id || ('food_' + code),
            barcode: code,
            name: local.name,
            caloriesPer100g: matchedFood.calories,
            proteinPer100g: matchedFood.protein,
            fatPer100g: matchedFood.fat,
            carbsPer100g: matchedFood.carbs,
            source: 'builtin_matched'
          };
          this.saveCustomFood(item);
          return item;
        }
      }

      return null;
    }

    async searchFood(query) {
      const q = String(query || '').trim().toLowerCase();
      if (!q) return [];

      // 1. Поиск в сохраненных составных блюдах (рецептах)
      const recipeMatches = (this.recipes || [])
        .filter(r => r && r.name && r.name.toLowerCase().includes(q))
        .map(r => ({
          id: r.id,
          name: r.name,
          isCustom: true,
          isComposite: true,
          ingredientsCount: Array.isArray(r.ingredients) ? r.ingredients.length : 0,
          ingredients: r.ingredients || [],
          cookedWeight: r.cookedWeight || 0,
          portionWeight: r.portionWeight || 0,
          caloriesPer100g: r.caloriesPer100g || 0,
          proteinPer100g: r.proteinPer100g || 0,
          fatPer100g: r.fatPer100g || 0,
          carbsPer100g: r.carbsPer100g || 0,
          source: 'custom_recipe',
          updatedAt: r.updatedAt || 0
        }));

      // 2. Поиск в пользовательских продуктах (свои блюда / custom foods)
      const customMatches = (this.customFoods || [])
        .filter(f =>
          (f.name && f.name.toLowerCase().includes(q)) ||
          (f.barcode && f.barcode.includes(q))
        )
        .map(f => ({
          ...f,
          isCustom: true,
          source: f.source || 'custom'
        }));

      // 3. Поиск во встроенной базе эталонных продуктов (offline-first)
      const builtinMatches = BUILTIN_FOODS
        .filter(f => {
          const text = (f.name + ' ' + f.aliases.join(' ')).toLowerCase();
          return text.includes(q);
        })
        .map(f => ({
          id: 'builtin_' + f.name.toLowerCase().replace(/[^a-zа-я0-9]/gi, '_'),
          name: f.name,
          caloriesPer100g: f.calories,
          proteinPer100g: f.protein,
          fatPer100g: f.fat,
          carbsPer100g: f.carbs,
          isCustom: false,
          isBuiltin: true,
          source: 'builtin'
        }));

      // Объединяем локальные свои блюда, рецепты и встроенную базу
      const localSeen = new Set();
      const localCombined = [];

      for (const item of [...recipeMatches, ...customMatches, ...builtinMatches]) {
        const key = item.barcode ? `b_${item.barcode}` : `n_${(item.name || '').toLowerCase()}`;
        if (!localSeen.has(key)) {
          localSeen.add(key);
          localCombined.push(item);
        }
      }

      // Приоритетная сортировка своих блюд:
      // Ранг 1: точное совпадение имени (name === q) -> СТРОГО ПЕРВАЯ ПОЗИЦИЯ!
      // Ранг 2: имя начинается с запроса (startsWith)
      // Ранг 3: имя содержит запрос (includes)
      // Внутри ранга: составные рецепты и самые свежие записи имеют приоритет
      localCombined.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();

        const exactA = nameA === q ? 1 : 0;
        const exactB = nameB === q ? 1 : 0;
        if (exactA !== exactB) return exactB - exactA;

        const startA = nameA.startsWith(q) ? 1 : 0;
        const startB = nameB.startsWith(q) ? 1 : 0;
        if (startA !== startB) return startB - startA;

        if (a.isComposite !== b.isComposite) return (b.isComposite ? 1 : 0) - (a.isComposite ? 1 : 0);
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });

      // 4. Запрос в Open Food Facts Search API (Search-a-licious)
      let remoteMatches = [];
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 5000) : null;
      try {
        const isLocalWeb = typeof window !== 'undefined' && 
                           window.location && 
                           (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
                           !window.Capacitor;

        const primaryUrl = isLocalWeb
          ? `/api/food-search?q=${encodeURIComponent(q)}`
          : `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&page_size=15`;

        let res;
        try {
          res = await fetch(primaryUrl, {
            headers: isLocalWeb ? {} : { 'User-Agent': 'Plan4U-App/1.0 (contact@plan4u.app)' },
            signal: controller?.signal
          });
          if (!res.ok && isLocalWeb) {
            res = await fetch(`https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&page_size=15`, {
              signal: controller?.signal
            });
          }
        } catch (fetchErr) {
          if (isLocalWeb) {
            res = await fetch(`https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&page_size=15`, {
              signal: controller?.signal
            });
          } else {
            throw fetchErr;
          }
        }

        if (timeoutId) clearTimeout(timeoutId);
        if (res && res.ok) {
          const data = await res.json();
          const items = Array.isArray(data.hits) ? data.hits : (Array.isArray(data.products) ? data.products : []);
          remoteMatches = items
            .filter(p => p && (p.product_name_ru || p.product_name || p.generic_name_ru || p.generic_name))
            .map(p => {
              let nut = extractNutrients(p);

              const name = p.product_name_ru || p.product_name || p.generic_name_ru || p.generic_name || `Продукт ${p.code || ''}`;
              let brand = '';
              if (Array.isArray(p.brands)) {
                brand = p.brands.filter(Boolean).join(', ');
              } else if (typeof p.brands === 'string') {
                brand = p.brands.trim();
              }

              const displayName = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${name} (${brand})` : name;
              const code = p.code || '';

              // Если в Open Food Facts нутриенты нулевые, сопоставляем по имени
              if (nut.calories === 0 && nut.protein === 0 && nut.fat === 0 && nut.carbs === 0) {
                const matchedFood = findBuiltinFood(name);
                if (matchedFood) {
                  nut = {
                    calories: matchedFood.calories,
                    protein: matchedFood.protein,
                    fat: matchedFood.fat,
                    carbs: matchedFood.carbs
                  };
                }
              }

              return {
                id: 'off_' + (code || Math.random().toString(36).slice(2, 9)),
                barcode: code,
                name: displayName,
                caloriesPer100g: nut.calories,
                proteinPer100g: nut.protein,
                fatPer100g: nut.fat,
                carbsPer100g: nut.carbs,
                isCustom: false,
                source: 'openfoodfacts'
              };
            });

          remoteMatches.sort((a, b) => {
            const hasNutA = (a.caloriesPer100g > 0 || a.proteinPer100g > 0 || a.fatPer100g > 0 || a.carbsPer100g > 0) ? 1 : 0;
            const hasNutB = (b.caloriesPer100g > 0 || b.proteinPer100g > 0 || b.fatPer100g > 0 || b.carbsPer100g > 0) ? 1 : 0;
            return hasNutB - hasNutA;
          });
        }
      } catch (e) {
        if (timeoutId) clearTimeout(timeoutId);
      }

      // 5. Финальное объединение: СВОИ БЛЮДА, РЕЦЕПТЫ И ВСТРОЕННЫЕ СТРОГО ПЕРВЫМИ!
      const seen = new Set();
      const combined = [];
      for (const item of [...localCombined, ...remoteMatches]) {
        const key = item.barcode ? `b_${item.barcode}` : `n_${(item.name || '').toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }
      return combined;
    }

    saveCustomFood(food) {
      if (!food || !food.name) return null;
      const cleanName = food.name.trim();
      const idx = this.customFoods.findIndex(f => 
        (food.barcode && f.barcode && f.barcode === food.barcode) || 
        f.id === food.id ||
        (f.name && f.name.toLowerCase() === cleanName.toLowerCase())
      );
      const entry = {
        id: food.id || ('cf_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)),
        barcode: food.barcode || '',
        name: cleanName,
        caloriesPer100g: Math.round(Number(food.caloriesPer100g) || 0),
        proteinPer100g: Math.round((Number(food.proteinPer100g) || 0) * 10) / 10,
        fatPer100g: Math.round((Number(food.fatPer100g) || 0) * 10) / 10,
        carbsPer100g: Math.round((Number(food.carbsPer100g) || 0) * 10) / 10,
        isCustom: true,
        isComposite: !!food.isComposite,
        source: food.source || 'custom',
        recipeId: food.recipeId || null,
        updatedAt: Date.now()
      };

      if (idx !== -1) {
        this.customFoods[idx] = { ...this.customFoods[idx], ...entry };
      } else {
        this.customFoods.unshift(entry);
      }
      this.saveCustomFoods();
      return entry;
    }

    // --- Statistics for Selected Date ---
    getStatsForDate(date = null) {
      const curDateStr = date || getTodayString();
      const entries = this.getEntries(curDateStr);

      let totalCalories = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;

      const mealMap = {};
      this.data.meals.forEach(m => {
        mealMap[m.id] = {
          mealId: m.id,
          name: m.name,
          icon: m.icon,
          color: m.color,
          order: m.order,
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          entries: []
        };
      });

      for (const e of entries) {
        totalCalories += e.calories;
        totalProtein += e.protein;
        totalFat += e.fat;
        totalCarbs += e.carbs;

        if (!mealMap[e.mealId]) {
          mealMap[e.mealId] = {
            mealId: e.mealId,
            name: 'Приём пищи',
            icon: '🥗',
            color: '#10b981',
            order: 99,
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            entries: []
          };
        }

        mealMap[e.mealId].calories += e.calories;
        mealMap[e.mealId].protein += e.protein;
        mealMap[e.mealId].fat += e.fat;
        mealMap[e.mealId].carbs += e.carbs;
        mealMap[e.mealId].entries.push(e);
      }

      totalProtein = Math.round(totalProtein * 10) / 10;
      totalFat = Math.round(totalFat * 10) / 10;
      totalCarbs = Math.round(totalCarbs * 10) / 10;

      const breakdown = Object.values(mealMap)
        .filter(m => m.calories > 0 || m.entries.length > 0)
        .sort((a, b) => a.order - b.order)
        .map(m => {
          const pct = totalCalories > 0 ? (m.calories / totalCalories) * 100 : 0;
          return {
            ...m,
            percent: Math.round(pct * 10) / 10
          };
        });

      const s = this.data.settings;
      let calTarget = s.calorieTarget || 2000;
      let pTarget = s.proteinTarget || 80;
      let fTarget = s.fatTarget || 70;
      let cTarget = s.carbTarget || 250;

      // Кросс-модульная синергия: Женский календарь + Дневник питания (Лютеиновая фаза / ПМС)
      let cycleBoost = {
        isBoosted: false,
        percent: 0,
        baseCalories: calTarget,
        baseCarbs: cTarget,
        extraCalories: 0,
        extraCarbs: 0,
        adviceText: '',
        phase: 'unknown'
      };

      try {
        const ct = this._cycleTracker || window.app?.cycleTracker || (typeof window !== 'undefined' && window.Plan4UCycleTracker ? new window.Plan4UCycleTracker.CycleTracker() : null);
        if (ct) {
          const cycleSettings = ct.getSettings();
          const synergyStatus = (typeof ct.getLutealSynergyStatus === 'function')
            ? ct.getLutealSynergyStatus(curDateStr)
            : null;
          cycleBoost.synergyStatus = synergyStatus;

          const isLutealBoost = (typeof ct.isLutealNutritionBoostActive === 'function')
            ? ct.isLutealNutritionBoostActive(curDateStr)
            : (synergyStatus ? synergyStatus.isBoosted : false);

          const boostPct = Number(cycleSettings.lutealBoostPercent) || 10;
          cycleBoost.percent = boostPct;

            if (isLutealBoost) {
              const boostedCal = Math.round(calTarget * (1 + boostPct / 100));
              const boostedCarbs = Math.round(cTarget * (1 + boostPct / 100));
              const currentLang = (window.Plan4UI18n && typeof window.Plan4UI18n.getCurrentLanguage === 'function')
                ? window.Plan4UI18n.getCurrentLanguage()
                : (window.app?.settings?.lang || 'ru');
              const advice = (typeof ct.getLutealNutritionAdvice === 'function')
                ? ct.getLutealNutritionAdvice(curDateStr, currentLang)
                : '';

              cycleBoost.isBoosted = true;
              cycleBoost.baseCalories = calTarget;
              cycleBoost.baseCarbs = cTarget;
              cycleBoost.extraCalories = boostedCal - calTarget;
              cycleBoost.extraCarbs = boostedCarbs - cTarget;
              cycleBoost.adviceText = advice;
              cycleBoost.phase = 'luteal';

              calTarget = boostedCal;
              cTarget = boostedCarbs;
            }
        }
      } catch (e) {
        console.warn('Plan4UNutritionTracker: cycle synergy evaluation error', e);
      }

      return {
        date: curDateStr,
        totalCalories,
        totalProtein,
        totalFat,
        totalCarbs,
        targets: {
          calories: calTarget,
          protein: pTarget,
          fat: fTarget,
          carbs: cTarget
        },
        percentages: {
          calories: Math.round((totalCalories / calTarget) * 100),
          protein: Math.round((totalProtein / pTarget) * 100),
          fat: Math.round((totalFat / fTarget) * 100),
          carbs: Math.round((totalCarbs / cTarget) * 100)
        },
        breakdown,
        allMealsWithStatus: this.data.meals.map(m => mealMap[m.id] || { ...m, mealId: m.id, calories: 0, entries: [] }),
        entryCount: entries.length,
        cycleBoost
      };
    }

    // --- SVG: Left-Offset Meals Ring (Кольцо приёмов пищи) ---
    /**
     * Генерация SVG-кольца приёмов пищи
     * @param {Object} stats - статистика за день из getStatsForDate
     * @param {Object} options - { selectedMealId, isArchive, isWidget, size, strokeWidth }
     */
    generateRingSvg(stats, options = {}) {
      const isWidget = !!options.isWidget;
      const size = options.size || (isWidget ? 52 : 220);
      const strokeWidth = options.strokeWidth || (isWidget ? 5 : 16);
      const center = size / 2;
      const selectedMealId = options.selectedMealId || null;

      let centerRadius;
      let iconRadius;
      const badgeRadius = 17.5;
      const outerMargin = 4.5;

      if (isWidget) {
        centerRadius = (size / 2) - (strokeWidth / 2);
        iconRadius = centerRadius;
      } else {
        iconRadius = (size / 2) - badgeRadius - outerMargin; // 110 - 17.5 - 4.5 = 88
        const gapBetweenRingAndBadge = 4;
        const outerRingRadius = iconRadius - badgeRadius - gapBetweenRingAndBadge; // 88 - 17.5 - 4 = 66.5
        centerRadius = outerRingRadius - (strokeWidth / 2); // 66.5 - 8 = 58.5
      }

      const circumference = 2 * Math.PI * centerRadius;
      const bgTrackStroke = 'rgba(0, 0, 0, 0.08)';

      const breakdown = (stats.breakdown || []).filter(item => (item.calories || 0) > 0);
      const targetCal = Math.max(1, stats.targets?.calories || 2000);
      const totalCal = stats.totalCalories || 0;

      // 1. Если в этот день ещё ничего не съедено (0 калорий)
      if (totalCal === 0 || breakdown.length === 0) {
        return `
          <svg class="nutrition-donut-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
            <circle class="nutrition-donut-bg" cx="${center}" cy="${center}" r="${centerRadius.toFixed(2)}" 
                    fill="none" stroke="${bgTrackStroke}" stroke-width="${strokeWidth}" 
                    ${isWidget ? '' : 'stroke-dasharray="4 4"'} />
          </svg>
        `;
      }

      // 2. База прогресса и общий угол заполнения кольца (от 0° до 360°)
      const scaleBase = Math.max(targetCal, totalCal);
      const isOverflow = totalCal > targetCal;
      const totalProgressAngle = Math.min(360, (totalCal / scaleBase) * 360);

      // Зазор между секторами разных приёмов пищи
      const gapAngle = (!isWidget && breakdown.length > 1)
        ? Math.min(2.5, Math.max(0.8, (totalProgressAngle / breakdown.length) * 0.2))
        : 0;
      const isFullLoop = totalProgressAngle >= 359;
      const totalGap = gapAngle * (isFullLoop ? breakdown.length : (breakdown.length - 1));
      const availableSpanForArcs = Math.max(breakdown.length * 2, totalProgressAngle - totalGap);

      let accumulatedAngle = -90; // Старт сверху (12:00)
      let sectorsSvg = '';
      const sectorsData = [];

      breakdown.forEach((item) => {
        const itemCal = Math.max(0, item.calories || 0);
        if (itemCal <= 0) return;

        // Доля этого блюда среди съеденных калорий
        const fractionOfEaten = itemCal / totalCal;
        // Длина дуги сектора в градусах
        const sweepAngle = Math.max(1.5, fractionOfEaten * availableSpanForArcs);
        const strokeColor = item.color || 'var(--primary-magenta, #d83a88)';
        const isSel = selectedMealId === item.mealId;

        // Длина дуги и пробела по длине окружности
        const arcLength = (sweepAngle / 360) * circumference;
        const dashSpace = circumference - arcLength;
        const rotationAngle = accumulatedAngle;
        const midAngle = accumulatedAngle + (sweepAngle / 2);

        // Процент от дневной нормы
        const pctOfGoal = Math.round((itemCal / targetCal) * 1000) / 10;

        // Акцент и прозрачность при выборе
        const opacity = (selectedMealId && !isSel) ? '0.3' : '1';
        const strokeW = isSel ? strokeWidth + 5 : strokeWidth;
        const sectorFilter = isSel ? `filter: drop-shadow(0 0 8px ${strokeColor});` : '';

        sectorsSvg += `
          <circle class="nutrition-donut-sector ${isSel ? 'is-selected' : ''}"
                  data-meal-id="${item.mealId}"
                  data-name="${escapeHtml(item.name)}"
                  data-calories="${item.calories}"
                  data-percent="${item.percent}"
                  cx="${center}" cy="${center}" r="${centerRadius.toFixed(2)}"
                  fill="none"
                  stroke="${strokeColor}"
                  stroke-width="${strokeW}"
                  stroke-dasharray="${arcLength.toFixed(2)} ${dashSpace.toFixed(2)}"
                  transform="rotate(${rotationAngle.toFixed(2)} ${center} ${center})"
                  stroke-linecap="butt"
                  opacity="${opacity}"
                  style="cursor: pointer; transition: stroke-width 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s; ${sectorFilter}">
            <title>${escapeHtml(item.name)}: ${item.calories} ккал (${pctOfGoal}% от нормы)</title>
          </circle>
        `;

        sectorsData.push({
          item,
          strokeColor,
          midAngle,
          sweepAngle,
          pctOfGoal,
          isSel
        });

        accumulatedAngle += sweepAngle + gapAngle;
      });

      // 3. Выносные бейджи с иконками категорий приёмов пищи
      let iconsSvg = '';
      if (!isWidget && options.showIcons !== false && sectorsData.length > 0) {
        const N = sectorsData.length;

        if (N === 1) {
          const sec = sectorsData[0];
          const midRad = (sec.midAngle * Math.PI) / 180;
          const iconX = center + iconRadius * Math.cos(midRad);
          const iconY = center + iconRadius * Math.sin(midRad);
          const opacity = (selectedMealId && !sec.isSel) ? '0.35' : '1';
          const badgeScale = sec.isSel ? 'scale(1.25)' : 'scale(1)';

          iconsSvg = `
            <g class="nutrition-donut-icon-group ${sec.isSel ? 'is-selected' : ''}"
               data-meal-id="${sec.item.mealId}"
               data-name="${escapeHtml(sec.item.name)}"
               data-calories="${sec.item.calories}"
               data-percent="${sec.item.percent}"
               opacity="${opacity}"
               style="cursor: pointer; transform-origin: ${iconX.toFixed(2)}px ${iconY.toFixed(2)}px; transform: ${badgeScale}; transition: transform 0.22s, opacity 0.2s;">
              <circle cx="${iconX.toFixed(2)}" cy="${iconY.toFixed(2)}" r="${badgeRadius}"
                      fill="#ffffff" stroke="${sec.strokeColor}" stroke-width="${sec.isSel ? '3.5' : '2.2'}"
                      filter="drop-shadow(0 2px 6px rgba(0,0,0,0.18))" />
              ${renderSvgIconElement(sec.item.icon, iconX, iconY, badgeRadius)}
              <title>${escapeHtml(sec.item.name)}: ${sec.item.calories} ккал (${sec.pctOfGoal}% от нормы)</title>
            </g>
          `;
        } else {
          // Несколько секторов: раздвигаем близкие бейджи (minSep = 24°)
          const minSep = Math.min(25, 350 / N);
          const baseAngle = sectorsData[0].midAngle;
          const unrolled = [baseAngle];
          for (let i = 1; i < N; i++) {
            let diff = (sectorsData[i].midAngle - unrolled[i - 1]) % 360;
            if (diff <= 0) diff += 360;
            unrolled.push(unrolled[i - 1] + diff);
          }

          for (let iter = 0; iter < 25; iter++) {
            for (let i = 0; i < N - 1; i++) {
              const gap = unrolled[i + 1] - unrolled[i];
              if (gap < minSep) {
                const shift = (minSep - gap) / 2;
                unrolled[i] -= shift;
                unrolled[i + 1] += shift;
              }
            }
            if (isFullLoop) {
              const wrapGap = (unrolled[0] + 360) - unrolled[N - 1];
              if (wrapGap < minSep) {
                const shift = (minSep - wrapGap) / 2;
                unrolled[N - 1] -= shift;
                unrolled[0] += shift;
              }
            }
            for (let i = 0; i < N; i++) {
              const ideal = i === 0 ? baseAngle : (unrolled[0] + ((sectorsData[i].midAngle - sectorsData[0].midAngle + 360) % 360));
              unrolled[i] += (ideal - unrolled[i]) * 0.08;
            }
          }

          sectorsData.forEach((sec, idx) => {
            const finalAngle = unrolled[idx];
            const angleRad = (finalAngle * Math.PI) / 180;
            const iconX = center + iconRadius * Math.cos(angleRad);
            const iconY = center + iconRadius * Math.sin(angleRad);
            const opacity = (selectedMealId && !sec.isSel) ? '0.35' : '1';
            const badgeScale = sec.isSel ? 'scale(1.25)' : 'scale(1)';

            iconsSvg += `
              <g class="nutrition-donut-icon-group ${sec.isSel ? 'is-selected' : ''}"
                 data-meal-id="${sec.item.mealId}"
                 data-name="${escapeHtml(sec.item.name)}"
                 data-calories="${sec.item.calories}"
                 data-percent="${sec.item.percent}"
                 opacity="${opacity}"
                 style="cursor: pointer; transform-origin: ${iconX.toFixed(2)}px ${iconY.toFixed(2)}px; transform: ${badgeScale}; transition: transform 0.22s, opacity 0.2s;">
                <circle cx="${iconX.toFixed(2)}" cy="${iconY.toFixed(2)}" r="${badgeRadius}"
                        fill="#ffffff" stroke="${sec.strokeColor}" stroke-width="${sec.isSel ? '3.5' : '2.2'}"
                        filter="drop-shadow(0 2px 6px rgba(0,0,0,0.18))" />
                ${renderSvgIconElement(sec.item.icon, iconX, iconY, badgeRadius)}
                <title>${escapeHtml(sec.item.name)}: ${sec.item.calories} ккал (${sec.pctOfGoal}% от нормы)</title>
              </g>
            `;
          });
        }
      }

      // 4. Отметка превышения нормы калорий (> 100%)
      let overflowMarkSvg = '';
      if (isOverflow) {
        const targetDeg = -90 + (targetCal / scaleBase) * 360;
        const targetRad = (targetDeg * Math.PI) / 180;
        const innerR = centerRadius - strokeWidth / 2 - 3;
        const outerR = centerRadius + strokeWidth / 2 + 3;
        const x1 = center + innerR * Math.cos(targetRad);
        const y1 = center + innerR * Math.sin(targetRad);
        const x2 = center + outerR * Math.cos(targetRad);
        const y2 = center + outerR * Math.sin(targetRad);

        overflowMarkSvg = `
          <line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" 
                x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" 
                stroke="#ef4444" stroke-width="2.5" stroke-linecap="round">
            <title>Дневная норма (${targetCal} ккал) превышена на ${totalCal - targetCal} ккал</title>
          </line>
        `;
      }

      return `
        <svg class="nutrition-donut-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle class="nutrition-donut-bg" cx="${center}" cy="${center}" r="${centerRadius.toFixed(2)}" 
                  fill="none" stroke="${bgTrackStroke}" stroke-width="${strokeWidth}" />
          ${sectorsSvg}
          ${overflowMarkSvg}
          ${iconsSvg}
        </svg>
      `;
    }

    // --- SVG: 3 Vertical Macro Bars (Б Ж У) with Overflow Support (>100%) ---
    /**
     * Генерация HTML/SVG разметки 3 вертикальных шкал БЖУ
     * @param {Object} stats - статистика за день
     */
    generateMacroBarsHtml(stats) {
      const macros = [
        {
          key: 'protein',
          letter: 'Б',
          name: 'Белки',
          color: this.getMacroColor('protein'),
          current: stats.totalProtein,
          target: stats.targets.protein,
          percent: stats.percentages.protein
        },
        {
          key: 'fat',
          letter: 'Ж',
          name: 'Жиры',
          color: this.getMacroColor('fat'),
          current: stats.totalFat,
          target: stats.targets.fat,
          percent: stats.percentages.fat
        },
        {
          key: 'carbs',
          letter: 'У',
          name: 'Углеводы',
          color: this.getMacroColor('carbs'),
          current: stats.totalCarbs,
          target: stats.targets.carbs,
          percent: stats.percentages.carbs
        }
      ];

      // Визуальная шкала: отметка 100% нормы находится на 68% высоты столбика.
      // Оставшиеся 32% сверху отведены под переполнение (до 160%).
      return `
        <div class="macro-bars-wrapper" role="region" aria-label="Шкалы БЖУ">
          ${macros.map(m => {
            const isOver = m.current > m.target;
            const overAmount = isOver ? Math.round((m.current - m.target) * 10) / 10 : 0;
            
            // Расчет визуальной высоты заполнения (в %)
            let fillHeightPct;
            if (m.current <= m.target) {
              fillHeightPct = m.target > 0 ? (m.current / m.target) * 68 : 0;
            } else {
              // Превышение: от 68% до 100%
              const overRatio = Math.min(1, (m.current - m.target) / (m.target * 0.6)); // максимум 160%
              fillHeightPct = 68 + (overRatio * 32);
            }
            fillHeightPct = Math.min(100, Math.max(0, fillHeightPct));

            const lighter = adjustHexColor(m.color, 32);
            const deeper = adjustHexColor(m.color, -18);

            // Градиент столбика: в норме красивый градиент выбранного цвета.
            // При превышении нормы: градиент от алого (#dc2626 -> #ef4444) к выбранному цвету (m.color).
            let barGradient;
            if (!isOver) {
              barGradient = `linear-gradient(180deg, ${lighter} 0%, ${m.color} 100%)`;
            } else {
              const normRatio = fillHeightPct > 68 ? (fillHeightPct - 68) / fillHeightPct : 0;
              const normFromTopPct = Math.round(Math.max(12, Math.min(60, normRatio * 100)));
              const blendMid = Math.round(normFromTopPct * 0.55);
              barGradient = `linear-gradient(180deg, #dc2626 0%, #ef4444 ${blendMid}%, ${m.color} ${normFromTopPct}%, ${deeper} 100%)`;
            }

            return `
              <div class="macro-bar-column ${isOver ? 'is-overflow' : ''}" 
                   data-macro="${m.key}" 
                   data-macro-name="${escapeHtml(m.name)}" 
                   data-macro-letter="${m.letter}" 
                   data-macro-color="${m.color}"
                   title="${m.name}: ${m.current} из ${m.target} г (${m.percent}%)${isOver ? ' • Превышение на ' + overAmount + ' г! ⚠️' : ''} (Удерживайте для выбора цвета)">
                <div class="macro-bar-header">
                  <span class="macro-bar-pct ${isOver ? 'is-warning' : ''}">${m.percent}%</span>
                  ${isOver ? `<span class="macro-bar-warn-badge" title="Превышение нормы на ${overAmount} г">⚠️</span>` : ''}
                </div>

                <div class="macro-bar-track">
                  <!-- Линия 100% нормы -->
                  <div class="macro-bar-target-line" style="bottom: 68%;" title="Норма: ${m.target} г (100%)"></div>
                  
                  <!-- Заполняющийся столбик -->
                  <div class="macro-bar-fill ${isOver ? 'has-glow' : ''}" 
                       style="height: ${fillHeightPct.toFixed(1)}%; background: ${barGradient};">
                  </div>
                </div>

                <div class="macro-bar-footer">
                  <span class="macro-bar-letter" style="color: ${m.color};">${m.letter}</span>
                  <div class="macro-bar-fraction">
                    <span class="macro-val-current">${m.current}</span>
                    <span class="macro-fraction-line"></span>
                    <span class="macro-val-target">${m.target}г</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // --- SVG: Archive Sheet Craft Stamp (Штамп на архивном листе блокнота) ---
    generateArchiveStampSvg(stats) {
      const size = 92;
      const center = size / 2;
      const cal = stats.totalCalories || 0;
      const target = stats.targets?.calories || 2000;
      const pct = Math.round((cal / target) * 100);

      const r = 38;
      const circumference = 2 * Math.PI * r;
      const dash = Math.min(circumference, (pct / 100) * circumference);

      return `
        <div class="nutrition-archive-stamp-inner">
          <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
            <!-- Внешний пунктирный обод крафтового штампа -->
            <circle cx="${center}" cy="${center}" r="43" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.45" />
            <!-- Фоновый трек кольца -->
            <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="currentColor" stroke-width="4.5" opacity="0.15" />
            <!-- Заполненное кольцо калорий -->
            <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="currentColor" stroke-width="4.5" 
                    stroke-dasharray="${dash.toFixed(1)} ${circumference.toFixed(1)}" 
                    transform="rotate(-90 ${center} ${center})" stroke-linecap="round" opacity="0.85" />
            
            <!-- Центр штампа -->
            <text x="${center}" y="${center - 6}" text-anchor="middle" font-family="'Caveat', cursive, sans-serif" font-size="14" font-weight="700" fill="currentColor">🥑 КБЖУ</text>
            <text x="${center}" y="${center + 9}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="13" font-weight="800" fill="currentColor">${cal}</text>
            <text x="${center}" y="${center + 20}" text-anchor="middle" font-family="'Inter', sans-serif" font-size="8.5" opacity="0.75" fill="currentColor">ккал</text>
          </svg>
        </div>
      `;
    }

    // --- Interactive Hunger & Schedule Balance Scale ---
    /**
     * Расчет баланса сытости / голода / переедания для интерактивной шкалы со смайликом
     * @param {string} targetDate - дата в формате YYYY-MM-DD
     * @param {Object} stats - статистика за день
     * @returns {Object} { balance: number (-1 to 1), state: string, title: string, desc: string, pctPosition: number }
     */
    calculateHungerBalance(targetDate, stats) {
      const todayStr = getTodayString();
      const isToday = !targetDate || targetDate === todayStr;

      // 1. Проверяем переедание нормы (приоритет сытости / перебора)
      const targetKcal = (stats && stats.targets && stats.targets.calories) ? stats.targets.calories : (this.data.targets.calories || 2000);
      const curKcal = (stats && stats.totalCalories != null) ? stats.totalCalories : (stats ? stats.totalKcal : 0);
      const kcalPct = targetKcal > 0 ? (curKcal / targetKcal) * 100 : 0;

      // Также учитываем сильный перебор по макросам (как на скриншоте 134%, 220%, 241%)
      let maxMacroPct = 0;
      if (stats && stats.percentages) {
        maxMacroPct = Math.max(stats.percentages.fat || 0, stats.percentages.protein || 0, stats.percentages.carbs || 0);
      }
      const effectivePct = Math.max(kcalPct, maxMacroPct > 125 ? (kcalPct * 0.6 + maxMacroPct * 0.4) : kcalPct);

      let overeatOffset = 0;
      if (effectivePct > 100) {
        const surplus = effectivePct - 100;
        // 0% -> 0; 15% surplus -> 0.45; 35% surplus -> 0.8; 50%+ surplus -> 1.0
        overeatOffset = Math.min(1.0, surplus / 45);
      }

      // 2. Расчет времени и интервала между приёмами пищи
      let hungerOffset = 0;
      let delayHoursFormatted = '';

      if (isToday) {
        const now = new Date();
        const nowHours = now.getHours() + (now.getMinutes() / 60);

        const mealsCount = Math.max(1, (this.data.meals || []).length); // Например 4 приема пищи
        const activeDayHours = 16; // 16-часовой активный день (с 08:00 до 24:00)
        const wakeHour = 8.0; // 08:00 утро
        const mealInterval = activeDayHours / mealsCount; // ~4 часа на прием

        const entries = this.getEntries(todayStr);

        if (entries && entries.length > 0) {
          // Ищем время последней записи за сегодня
          let latestTimeHours = null;
          for (const e of entries) {
            if (e.timestamp) {
              const d = new Date(e.timestamp);
              // Если timestamp сегодняшнего дня
              if (d.getDate() === now.getDate() && d.getMonth() === now.getMonth()) {
                const h = d.getHours() + (d.getMinutes() / 60);
                if (latestTimeHours == null || h > latestTimeHours) latestTimeHours = h;
              }
            }
          }

          if (latestTimeHours == null) {
            // Если нет точного времени в entries, берем пропорцию от количества приемов
            latestTimeHours = Math.min(nowHours, wakeHour + (entries.length * mealInterval));
          }

          const elapsedSinceLastMeal = Math.max(0, nowHours - latestTimeHours);

          if (elapsedSinceLastMeal > mealInterval) {
            const overdue = elapsedSinceLastMeal - mealInterval;
            // overdue = 0.5h -> -0.3; overdue = 1.5h -> -0.65; overdue >= 3h -> -1.0
            hungerOffset = -Math.min(1.0, 0.2 + (overdue / 2.5) * 0.8);
            const hrs = Math.floor(overdue);
            const mins = Math.round((overdue - hrs) * 60);
            delayHoursFormatted = hrs > 0 ? `${hrs}ч ${mins}м` : `${mins}м`;
          } else if (elapsedSinceLastMeal > mealInterval * 0.75) {
            // Легкий аппетит перед приемом
            const preRatio = (elapsedSinceLastMeal - (mealInterval * 0.75)) / (mealInterval * 0.25);
            hungerOffset = -(preRatio * 0.2);
          }
        } else {
          // Записей сегодня ещё нет
          if (nowHours >= wakeHour) {
            const hoursAwake = nowHours - wakeHour;
            if (hoursAwake > 1.5) {
              // Завтрак задерживается
              const overdue = hoursAwake - 1.5;
              hungerOffset = -Math.min(1.0, 0.25 + (overdue / 3.0) * 0.75);
              const hrs = Math.floor(overdue);
              const mins = Math.round((overdue - hrs) * 60);
              delayHoursFormatted = hrs > 0 ? `${hrs}ч ${mins}м` : `${mins}м`;
            }
          }
        }
      }

      // 3. Сводим общий баланс от -1.0 до +1.0
      let balance = 0;
      if (overeatOffset > 0) {
        // Если переел, переедание доминирует (человек сыт / перегружен)
        balance = overeatOffset;
      } else if (hungerOffset < 0) {
        // Если не переел, но время вышло — смещается влево (голоден)
        balance = hungerOffset;
      } else {
        balance = 0; // Идеальный баланс в центре
      }

      // Положение на дорожке (от 12% до 88% чтобы не вылезало за края)
      // center = 50%, при balance = -1 => 12%, при balance = +1 => 88%
      const pctPosition = Math.round(50 + (balance * 38));

      // 4. Определение эмоционального состояния и текстов
      let state = 'happy';
      let title = 'Сыт и счастлив! ✨';
      let desc = 'Питание по графику и в пределах нормы.';

      if (balance <= -0.6) {
        state = 'hangry';
        title = 'Злой и голодный! 💢';
        desc = delayHoursFormatted 
          ? `Приём пищи задержан на ${delayHoursFormatted}! Срочно поешьте!` 
          : 'Слишком большой перерыв без еды! Организм требует топлива!';
      } else if (balance <= -0.2) {
        state = 'hungry';
        title = 'Пора подкрепиться! ⏳';
        desc = delayHoursFormatted 
          ? `Задержка приёма: ${delayHoursFormatted}. Желудок уже урчит!` 
          : 'Время для следующего приёма пищи! Не пропускайте.';
      } else if (balance >= 0.6) {
        state = 'bloated';
        title = 'Объелся и лопаюсь! 🍩';
        desc = `Норма калорий сильно превышена (${Math.round(effectivePct)}%)! Дайте организму отдых.`;
      } else if (balance >= 0.2) {
        state = 'stuffed';
        title = 'Сытно перекусил 🥐';
        desc = `Калории подходят к пределу (${Math.round(effectivePct)}%). Отличная плотная еда!`;
      }

      return {
        balance,
        state,
        title,
        desc,
        pctPosition,
        effectivePct: Math.round(effectivePct)
      };
    }

    /**
     * Генерация выразительного мультяшного SVG-смайлика в зависимости от состояния
     * @param {string} state - 'happy' | 'hungry' | 'hangry' | 'stuffed' | 'bloated'
     * @returns {string} SVG разметка
     */
    generateHungerSmileySvg(state) {
      if (state === 'hangry') {
        return `
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="faceHangry" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#fee2e2"/>
                <stop offset="40%" stop-color="#ef4444"/>
                <stop offset="100%" stop-color="#b91c1c"/>
              </radialGradient>
            </defs>
            <circle cx="16" cy="16" r="14" fill="url(#faceHangry)" stroke="#991b1b" stroke-width="1.3"/>
            <!-- Знак гнева 💢 -->
            <path d="M23 4 L27 4 M25 2 L25 6 M24 3 L26 5 M26 3 L24 5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
            <!-- Сердитые брови -->
            <path d="M6 10 L13 13" stroke="#450a0a" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M26 10 L19 13" stroke="#450a0a" stroke-width="2.2" stroke-linecap="round"/>
            <!-- Злые глаза -->
            <path d="M7 14 Q10 16 13 14" stroke="#450a0a" stroke-width="1.8" fill="#ffffff"/>
            <circle cx="10" cy="14.5" r="1.3" fill="#450a0a"/>
            <path d="M19 14 Q22 16 25 14" stroke="#450a0a" stroke-width="1.8" fill="#ffffff"/>
            <circle cx="22" cy="14.5" r="1.3" fill="#450a0a"/>
            <!-- Зубастый оскал от голода -->
            <path d="M9 20 L11 23 L13 20 L15 23 L17 20 L19 23 L21 20 L23 23" stroke="#450a0a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="#ffffff"/>
            <path d="M8.5 21.5 L23.5 21.5" stroke="#450a0a" stroke-width="1"/>
          </svg>
        `;
      }

      if (state === 'hungry') {
        return `
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="faceHungry" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#fff7ed"/>
                <stop offset="40%" stop-color="#fb923c"/>
                <stop offset="100%" stop-color="#ea580c"/>
              </radialGradient>
            </defs>
            <circle cx="16" cy="16" r="14" fill="url(#faceHungry)" stroke="#c2410c" stroke-width="1.2"/>
            <!-- Жалобные брови домиком -->
            <path d="M7 9 Q10.5 7.5 13 10.5" stroke="#7c2d12" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M25 9 Q21.5 7.5 19 10.5" stroke="#7c2d12" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <!-- Большие умоляющие глаза -->
            <circle cx="10.5" cy="14" r="3.2" fill="#431407"/>
            <circle cx="21.5" cy="14" r="3.2" fill="#431407"/>
            <circle cx="9.5" cy="13" r="1.3" fill="#ffffff"/>
            <circle cx="20.5" cy="13" r="1.3" fill="#ffffff"/>
            <circle cx="12" cy="15.5" r="0.6" fill="#ffffff"/>
            <circle cx="23" cy="15.5" r="0.6" fill="#ffffff"/>
            <!-- Капля пота от голода 💧 -->
            <path d="M26 9 C26 7.5 28 6 28 6 C28 6 30 7.5 30 9 C30 10.2 29.1 11.2 28 11.2 C26.9 11.2 26 10.2 26 9 Z" fill="#38bdf8"/>
            <!-- Дрожащий волнистый рот -->
            <path d="M10 21 Q12.5 19 15 21.5 Q17.5 24 20 21" stroke="#7c2d12" stroke-width="1.6" stroke-linecap="round" fill="none"/>
            <!-- Капелька слюны -->
            <path d="M19 22.5 C19 22.5 20.5 24 20.5 25 C20.5 25.6 20 26 19.5 26 C19 26 18.5 25.6 18.5 25 C18.5 24 19 22.5 19 22.5 Z" fill="#60a5fa"/>
          </svg>
        `;
      }

      if (state === 'stuffed') {
        return `
          <svg viewBox="0 0 32 32" width="30" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="faceStuffed" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#fff7ed"/>
                <stop offset="40%" stop-color="#fb923c"/>
                <stop offset="100%" stop-color="#f43f5e"/>
              </radialGradient>
              <radialGradient id="blushStuffed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.85"/>
                <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <!-- Круглые пухлые щечки -->
            <ellipse cx="16" cy="16" rx="15" ry="13.5" fill="url(#faceStuffed)" stroke="#e11d48" stroke-width="1.2"/>
            <circle cx="6" cy="18" r="3.5" fill="url(#blushStuffed)"/>
            <circle cx="26" cy="18" r="3.5" fill="url(#blushStuffed)"/>
            <!-- Довольные прищуренные глаза -->
            <path d="M7 13.5 Q10.5 16 14 13.5" stroke="#881337" stroke-width="1.8" stroke-linecap="round" fill="none"/>
            <path d="M18 13.5 Q21.5 16 25 13.5" stroke="#881337" stroke-width="1.8" stroke-linecap="round" fill="none"/>
            <!-- Круглый ротик "о" от сытости -->
            <circle cx="16" cy="20.5" r="2.4" fill="#881337"/>
            <!-- Мыльный пузырик отрыжки 🫧 -->
            <circle cx="21" cy="8" r="1.8" fill="#bae6fd" fill-opacity="0.8" stroke="#38bdf8" stroke-width="0.8"/>
            <circle cx="20.5" cy="7.5" r="0.5" fill="#ffffff"/>
            <!-- Крошка у рта -->
            <circle cx="12" cy="21" r="0.7" fill="#78350f"/>
          </svg>
        `;
      }

      if (state === 'bloated') {
        return `
          <svg viewBox="0 0 32 32" width="32" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="faceBloated" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#ffe4e6"/>
                <stop offset="45%" stop-color="#fb7185"/>
                <stop offset="100%" stop-color="#e11d48"/>
              </radialGradient>
              <radialGradient id="blushBloated" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#be123c" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="#be123c" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <!-- Широкое толстое лицо с вторым подбородком -->
            <ellipse cx="16" cy="16.5" rx="15.8" ry="13.5" fill="url(#faceBloated)" stroke="#9f1239" stroke-width="1.3"/>
            <path d="M12 28 Q16 30 20 28" stroke="#9f1239" stroke-width="1.2" stroke-linecap="round" fill="none"/>
            <!-- Нахмуренные недовольные брови -->
            <path d="M7 11.5 L13 13" stroke="#4c0519" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M25 11.5 L19 13" stroke="#4c0519" stroke-width="1.8" stroke-linecap="round"/>
            <!-- Глаза-спирали от пищевой комы -->
            <ellipse cx="10" cy="15" rx="2.5" ry="1.8" fill="#4c0519"/>
            <circle cx="9.2" cy="14.3" r="0.8" fill="#ffffff"/>
            <ellipse cx="22" cy="15" rx="2.5" ry="1.8" fill="#4c0519"/>
            <circle cx="21.2" cy="14.3" r="0.8" fill="#ffffff"/>
            <!-- Огромные раздутые щеки -->
            <circle cx="5" cy="18.5" r="4.2" fill="url(#blushBloated)"/>
            <circle cx="27" cy="18.5" r="4.2" fill="url(#blushBloated)"/>
            <!-- Недовольный надутый рот -->
            <path d="M12 21.5 Q16 19 20 21.5" stroke="#4c0519" stroke-width="2" stroke-linecap="round" fill="none"/>
            <!-- Капелька перегрузки -->
            <path d="M26.5 9 C26.5 7.8 27.8 6.5 27.8 6.5 C27.8 6.5 29.1 7.8 29.1 9 C29.1 9.8 28.5 10.5 27.8 10.5 C27.1 10.5 26.5 9.8 26.5 9 Z" fill="#67e8f9"/>
          </svg>
        `;
      }

      // По умолчанию: 'happy' (баланс, сыт и счастлив)
      return `
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="faceHappy" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="40%" stop-color="#fde047"/>
              <stop offset="100%" stop-color="#f59e0b"/>
            </radialGradient>
            <radialGradient id="blushHappy" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fb7185" stop-opacity="0.8"/>
              <stop offset="100%" stop-color="#fb7185" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="14" fill="url(#faceHappy)" stroke="#d97706" stroke-width="1.2"/>
          <ellipse cx="12" cy="7" rx="4" ry="1.8" fill="#ffffff" fill-opacity="0.45" transform="rotate(-20 12 7)"/>
          <ellipse cx="7.5" cy="18" rx="2.5" ry="1.4" fill="url(#blushHappy)"/>
          <ellipse cx="24.5" cy="18" rx="2.5" ry="1.4" fill="url(#blushHappy)"/>
          <!-- Счастливые закрытые глазки-дуги ^ ^ -->
          <path d="M7 13.5 Q10 10 13 13.5" stroke="#78350f" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M19 13.5 Q22 10 25 13.5" stroke="#78350f" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <!-- Широкая сияющая улыбка с язычком -->
          <path d="M11 17 Q16 25 21 17 Z" fill="#b91c1c"/>
          <path d="M13 20 Q16 18 19 20 Q16 23.5 13 20 Z" fill="#f472b6"/>
          <path d="M11 17 Q16 19 21 17" stroke="#78350f" stroke-width="1.4" stroke-linecap="round" fill="none"/>
          <!-- Искорка ✨ -->
          <path d="M26 6 L27 8 L29 9 L27 10 L26 12 L25 10 L23 9 L25 8 Z" fill="#fef08a" opacity="0.9"/>
        </svg>
      `;
    }

    // --- SVG: Header Widget Circle (Круг в выпадающем меню модулей) ---
    generateWidgetSvg(stats) {
      const size = 52;
      const center = size / 2;
      const cal = stats.totalCalories || 0;
      const target = stats.targets?.calories || 2000;
      const pct = Math.min(100, Math.round((cal / target) * 100));

      const r = 21;
      const circumference = 2 * Math.PI * r;
      const dash = (pct / 100) * circumference;

      return `
        <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
          <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="4.2" />
          <circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="var(--primary-magenta, #d83a88)" stroke-width="4.2"
                  stroke-dasharray="${dash.toFixed(1)} ${circumference.toFixed(1)}"
                  transform="rotate(-90 ${center} ${center})" stroke-linecap="round" />
        </svg>
      `;
    }

    clearSimulationData() {
      this.data.entries = (this.data.entries || []).filter(e => !e.isSimulation && !(e.id && String(e.id).startsWith('sim_')));
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('plan4u_nutrition_backup_before_simulation');
        localStorage.removeItem('plan4u_nutrition_sim_active');
      }
      this.saveData();
      return true;
    }

    clearAllEntries() {
      this.data.entries = [];
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('plan4u_nutrition_backup_before_simulation');
        localStorage.removeItem('plan4u_nutrition_sim_active');
      }
      this.saveData();
      return true;
    }

    /**
     * Расчёт аналитики соблюдения нормы КБЖУ за 4 недели (28 дней)
     * и частоты по дням недели (Пн..Вс)
     * @param {number} weeksCount - количество недель (по умолчанию 4 = 28 дней)
     * @returns {Object} детальная статистика compliance
     */
    calculateComplianceStats(weeksCount = 4) {
      const today = new Date();
      // Вычисляем понедельник текущей недели
      const dayOfWeek = today.getDay(); // 0 - Вс, 1 - Пн ... 6 - Сб
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const currentWeekMon = new Date(today);
      currentWeekMon.setDate(today.getDate() + diffToMon);
      currentWeekMon.setHours(0, 0, 0, 0);

      // Начало 4-недельного диапазона: понедельник 3 недели назад (всего 4 недели = 28 дней)
      const startDate = new Date(currentWeekMon);
      startDate.setDate(currentWeekMon.getDate() - ((weeksCount - 1) * 7));

      const days = [];
      const todayStr = getTodayString();
      let totalTrackedDays = 0;
      let compliantDaysCount = 0;
      let totalTrackedCalories = 0;

      const dowNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const dowShorts = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const dowOrder = [1, 2, 3, 4, 5, 6, 0]; // Пн, Вт, Ср, Чт, Пт, Сб, Вс

      const weekdayStatsMap = {};
      dowOrder.forEach(dow => {
        weekdayStatsMap[dow] = {
          dow,
          shortName: dowShorts[dow],
          fullName: dowNames[dow],
          totalDays: 0,
          compliantDays: 0,
          nonCompliantDays: 0,
          totalCalories: 0,
          avgCalories: 0,
          rate: 0,
          avgSurplus: 0
        };
      });

      for (let i = 0; i < weeksCount * 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const isToday = dateStr === todayStr;
        const isFuture = dateStr > todayStr;

        const dayStats = this.getStatsForDate(dateStr);
        const targetCal = dayStats.targets?.calories || 2000;
        const actualCal = dayStats.totalCalories || 0;
        const entryCount = dayStats.entryCount || 0;

        const hasEntries = entryCount > 0;
        // В норме: есть записи и калории в коридоре 75%..110%
        const isCompliant = hasEntries && actualCal >= (targetCal * 0.75) && actualCal <= (targetCal * 1.10);
        const isOver = hasEntries && actualCal > (targetCal * 1.10);
        const isUnder = hasEntries && actualCal < (targetCal * 0.75);

        if (hasEntries && !isFuture) {
          totalTrackedDays++;
          totalTrackedCalories += actualCal;
          if (isCompliant) compliantDaysCount++;

          const dow = d.getDay();
          const wStat = weekdayStatsMap[dow];
          wStat.totalDays++;
          if (isCompliant) {
            wStat.compliantDays++;
          } else {
            wStat.nonCompliantDays++;
          }
          wStat.totalCalories += actualCal;
          wStat.avgSurplus += (actualCal - targetCal);
        }

        days.push({
          dateStr,
          dayNum: d.getDate(),
          dow: d.getDay(),
          isToday,
          isFuture,
          hasEntries,
          isCompliant,
          isOver,
          isUnder,
          actualCalories: actualCal,
          targetCalories: targetCal,
          percent: Math.round((actualCal / targetCal) * 100),
          entryCount
        });
      }

      let currentStreak = 0;
      const sortedDaysForStreak = [...days].filter(d => !d.isFuture).reverse();
      for (const d of sortedDaysForStreak) {
        if (d.isToday && !d.hasEntries) {
          continue;
        }
        if (d.isCompliant) {
          currentStreak++;
        } else {
          break;
        }
      }

      const weekdaysList = dowOrder.map(dow => {
        const item = weekdayStatsMap[dow];
        if (item.totalDays > 0) {
          item.rate = Math.round((item.compliantDays / item.totalDays) * 100);
          item.avgCalories = Math.round(item.totalCalories / item.totalDays);
          item.avgSurplus = Math.round(item.avgSurplus / item.totalDays);
        }
        return item;
      });

      const trackedWeekdays = weekdaysList.filter(w => w.totalDays > 0);
      let hardestDay = null;
      let bestDay = null;

      if (trackedWeekdays.length > 0) {
        const sortedByRate = [...trackedWeekdays].sort((a, b) => a.rate - b.rate || b.avgSurplus - a.avgSurplus);
        hardestDay = sortedByRate[0];
        bestDay = sortedByRate[sortedByRate.length - 1];
      }

      const overallRate = totalTrackedDays > 0 ? Math.round((compliantDaysCount / totalTrackedDays) * 100) : 0;
      const avgCalories = totalTrackedDays > 0 ? Math.round(totalTrackedCalories / totalTrackedDays) : 0;

      return {
        weeksCount,
        days,
        currentStreak,
        totalTrackedDays,
        compliantDaysCount,
        overallRate,
        avgCalories,
        weekdaysList,
        hardestDay,
        bestDay
      };
    }
  }

  return { 
    NutritionTracker,
    FOOD_CATEGORY_ICONS,
    isImageIcon,
    renderMealIconHtml
  };
}));
