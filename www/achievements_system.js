/**
 * Plan4U - Achievements System (220 Gamified Awards & Milestones)
 * 
 * Manages progressive multi-tiered achievements, special one-time milestones,
 * translations, criteria checks, and catalog generation.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const achModule = factory();
    root.Plan4UAchievements = achModule;
    root.buildAchievementsCatalog = achModule.buildCatalog;
    root.ACHIEVEMENTS_LIST = achModule.buildCatalog(
      typeof root.detectSystemLanguage === 'function' ? root.detectSystemLanguage() : 'ru'
    );
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function buildAchievementsCatalog(lang = 'ru') {
    const list = [];

    const isUk = lang === 'uk';
    const isEn = lang === 'en';

    // Helper for multi-tiered progressive achievements
    function addTiered({ prefix, category, icon, titleBase, descTemplate, tiers, getProgress, unit }) {
      const romanNumerals = [
        'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
        'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
        'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'
      ];
      tiers.forEach((t, idx) => {
        const levelNum = idx + 1;
        const roman = romanNumerals[idx] || `${levelNum}`;
        list.push({
          id: `${prefix}_tier_${t.val}`,
          category,
          type: 'progressive',
          icon,
          title: `${titleBase} ${roman}`,
          desc: descTemplate(t.val, t.rank),
          target: t.val,
          unit,
          tierLevel: levelNum,
          tierRank: t.rank || (isEn ? `Level ${levelNum}` : (isUk ? `Рівень ${levelNum}` : `Уровень ${levelNum}`)),
          getProgress
        });
      });
    }

    // 1. 🔥 СЕРИИ ВХОДА И ДИСЦИПЛИНА (28 ступеней от 1 до 1095 дней)
    const streakTitle = isEn ? 'Victory Streak' : (isUk ? 'Серія перемог' : 'Серия побед');
    const streakUnit = isEn ? 'days' : 'дн.';
    const streakDesc = (v, r) => {
      if (isEn) return `Open the notebook every day without breaks: ${v} ${v === 1 ? 'day' : 'days'}${r ? ` (${r})` : ''}`;
      if (isUk) return `Заходити в блокнот щодня без перерв: ${v} ${v === 1 ? 'день' : (v < 5 ? 'дні' : 'днів')}${r ? ` (${r})` : ''}`;
      return `Заходить в блокнот каждый день без перерывов: ${v} ${v === 1 ? 'день' : (v < 5 ? 'дня' : 'дней')}${r ? ` (${r})` : ''}`;
    };

    addTiered({
      prefix: 'streak',
      category: 'streaks',
      icon: '🔥',
      titleBase: streakTitle,
      unit: streakUnit,
      descTemplate: streakDesc,
      getProgress: (s) => s.streakCount,
      tiers: [
        { val: 1, rank: isEn ? 'First Day' : (isUk ? 'Перший день' : 'Первый день') },
        { val: 2, rank: isEn ? 'Start' : (isUk ? 'Старт' : 'Старт') },
        { val: 3, rank: isEn ? '3 Days' : (isUk ? '3 Дні' : '3 Дня') },
        { val: 5, rank: isEn ? 'Work Week' : (isUk ? 'Робочий тиждень' : 'Рабочая неделя') },
        { val: 7, rank: isEn ? '1 Week' : (isUk ? '1 Тиждень' : '1 Неделя') },
        { val: 10, rank: isEn ? '10 Days' : (isUk ? '10 Днів' : '10 Дней') },
        { val: 14, rank: isEn ? '2 Weeks' : (isUk ? '2 Тижні' : '2 Недели') },
        { val: 21, rank: isEn ? 'Habit Formed' : (isUk ? 'Звичку закріплено' : 'Привычка закреплена') },
        { val: 30, rank: isEn ? '1 Month' : (isUk ? '1 Місяць' : '1 Месяц') },
        { val: 45, rank: isEn ? '45 Days' : (isUk ? '45 Днів' : '45 Дней') },
        { val: 60, rank: isEn ? '2 Months' : (isUk ? '2 Місяці' : '2 Месяца') },
        { val: 75, rank: isEn ? '75 Days' : (isUk ? '75 Днів' : '75 Дней') },
        { val: 90, rank: isEn ? 'Quarter (3 months)' : (isUk ? 'Квартал (3 місяці)' : 'Квартал (3 месяца)') },
        { val: 100, rank: isEn ? '100 Days!' : (isUk ? 'Сотня днів!' : 'Сотня дней!') },
        { val: 120, rank: isEn ? '4 Months' : (isUk ? '4 Місяці' : '4 Месяца') },
        { val: 150, rank: isEn ? '5 Months' : (isUk ? '5 Місяців' : '5 Месяцев') },
        { val: 180, rank: isEn ? 'Half a Year' : (isUk ? 'Півроку' : 'Полгода') },
        { val: 200, rank: isEn ? '200 Days' : (isUk ? '200 Днів' : '200 Дней') },
        { val: 250, rank: isEn ? 'Unshakeable' : (isUk ? 'Непохитний' : 'Непоколебимый') },
        { val: 300, rank: isEn ? '10 Months' : (isUk ? '10 Місяців' : '10 Месяцев') },
        { val: 365, rank: isEn ? '1 Full Year!' : (isUk ? '1 Рік перемог!' : '1 Год побед!') },
        { val: 400, rank: isEn ? '400 Days' : (isUk ? '400 Днів' : '400 Дней') },
        { val: 500, rank: isEn ? '500 Days' : (isUk ? '500 Днів' : '500 Дней') },
        { val: 600, rank: isEn ? '600 Days' : (isUk ? '600 Днів' : '600 Дней') },
        { val: 730, rank: isEn ? '2 Years Streak!' : (isUk ? '2 Роки поспіль!' : '2 Года подряд!') },
        { val: 850, rank: isEn ? '850 Days' : (isUk ? '850 Днів' : '850 Дней') },
        { val: 1000, rank: isEn ? '1000 Days of Discipline!' : (isUk ? '1000 Днів дисципліни!' : '1000 Дней дисциплины!') },
        { val: 1095, rank: isEn ? '3 Years in Plan4U!' : (isUk ? '3 Роки в блокноті!' : '3 Года в блокноте!') }
      ]
    });

    // 2. 📝 ОБЩАЯ ПРОДУКТИВНОСТЬ (25 ступеней от 1 до 10 000 дел)
    addTiered({
      prefix: 'tasks_total',
      category: 'tasks',
      icon: '📝',
      titleBase: isEn ? 'Task Master' : (isUk ? 'Майстер завдань' : 'Мастер задач'),
      unit: isEn ? 'tasks' : (isUk ? 'справ' : 'дел'),
      descTemplate: (v) => isEn ? `Complete a total of ${v} tasks across all notebook tabs` : (isUk ? `Виконати сумарно ${v} завдань у всіх вкладках блокнота` : `Выполнить суммарно ${v} задач во всех вкладках блокнота`),
      getProgress: (s) => s.totalCompleted,
      tiers: [
        { val: 1 }, { val: 5 }, { val: 10 }, { val: 25 }, { val: 50 },
        { val: 75 }, { val: 100 }, { val: 150 }, { val: 200 }, { val: 250 },
        { val: 300 }, { val: 400 }, { val: 500 }, { val: 650 }, { val: 800 },
        { val: 1000 }, { val: 1250 }, { val: 1500 }, { val: 2000 }, { val: 2500 },
        { val: 3000 }, { val: 4000 }, { val: 5000 }, { val: 7500 }, { val: 10000 }
      ]
    });

    // 3. 🌅 УТРЕННИЕ ЗАДАЧИ (15 ступеней)
    addTiered({
      prefix: 'morning_tasks',
      category: 'tasks',
      icon: '🌅',
      titleBase: isEn ? 'Early Bird' : (isUk ? 'Рання пташка' : 'Ранняя пташка'),
      unit: isEn ? 'tasks' : (isUk ? 'справ' : 'дел'),
      descTemplate: (v) => isEn ? `Complete ${v} morning tasks in MORNING section` : (isUk ? `Виконати ${v} ранкових завдань у блоці РАНОК` : `Выполнить ${v} утренних задач в блоке УТРО`),
      getProgress: (s) => s.morningCompletedCount,
      tiers: [
        { val: 1 }, { val: 3 }, { val: 5 }, { val: 10 }, { val: 20 },
        { val: 35 }, { val: 50 }, { val: 75 }, { val: 100 }, { val: 150 },
        { val: 200 }, { val: 300 }, { val: 500 }, { val: 750 }, { val: 1000 }
      ]
    });

    // 4. ☀️ ДНЕВНЫЕ ЗАДАЧИ (15 ступеней)
    addTiered({
      prefix: 'day_tasks',
      category: 'tasks',
      icon: '☀️',
      titleBase: isEn ? 'Daily Focus' : (isUk ? 'Денний фокус' : 'Дневной фокус'),
      unit: isEn ? 'tasks' : (isUk ? 'справ' : 'дел'),
      descTemplate: (v) => isEn ? `Complete ${v} afternoon tasks in DAY section` : (isUk ? `Виконати ${v} денних завдань у блоці ДЕНЬ` : `Выполнить ${v} дневных задач в блоке ДЕНЬ`),
      getProgress: (s) => s.dayTasksCompletedCount,
      tiers: [
        { val: 1 }, { val: 3 }, { val: 5 }, { val: 10 }, { val: 20 },
        { val: 35 }, { val: 50 }, { val: 75 }, { val: 100 }, { val: 150 },
        { val: 200 }, { val: 300 }, { val: 500 }, { val: 750 }, { val: 1000 }
      ]
    });

    // 5. 🌙 ВЕЧЕРНИЕ ЗАДАЧИ (15 ступеней)
    addTiered({
      prefix: 'evening_tasks',
      category: 'tasks',
      icon: '🌙',
      titleBase: isEn ? 'Evening Wrap-up' : (isUk ? 'Вечірній підсумок' : 'Вечерний итог'),
      unit: isEn ? 'tasks' : (isUk ? 'справ' : 'дел'),
      descTemplate: (v) => isEn ? `Complete ${v} evening tasks in EVENING section` : (isUk ? `Виконати ${v} вечірніх завдань у блоці ВЕЧІР` : `Выполнить ${v} вечерних задач в блоке ВЕЧЕР`),
      getProgress: (s) => s.eveningCompletedCount,
      tiers: [
        { val: 1 }, { val: 3 }, { val: 5 }, { val: 10 }, { val: 20 },
        { val: 35 }, { val: 50 }, { val: 75 }, { val: 100 }, { val: 150 },
        { val: 200 }, { val: 300 }, { val: 500 }, { val: 750 }, { val: 1000 }
      ]
    });

    // 6. ☕ В СВОБОДНОЕ ВРЕМЯ (12 ступеней)
    addTiered({
      prefix: 'free_tasks',
      category: 'tasks',
      icon: '☕',
      titleBase: isEn ? 'Free Time' : (isUk ? 'Вільний час' : 'Свободное время'),
      unit: isEn ? 'tasks' : (isUk ? 'справ' : 'дел'),
      descTemplate: (v) => isEn ? `Complete ${v} tasks in FREE TIME section` : (isUk ? `Виконати ${v} завдань у блоці У ВІЛЬНИЙ ЧАС` : `Выполнить ${v} задач в блоке В СВОБОДНОЕ ВРЕМЯ`),
      getProgress: (s) => s.freeCompletedCount,
      tiers: [
        { val: 1 }, { val: 3 }, { val: 5 }, { val: 10 }, { val: 20 },
        { val: 35 }, { val: 50 }, { val: 75 }, { val: 100 }, { val: 150 },
        { val: 250 }, { val: 500 }
      ]
    });

    // 7. 🎬 ФИЛЬМЫ И СЕРИАЛЫ В АРХИВЕ (20 ступеней от 1 до 500)
    addTiered({
      prefix: 'watch_total',
      category: 'watch',
      icon: '🎬',
      titleBase: isEn ? 'Cinema Enthusiast' : (isUk ? 'Кіноман зі стажем' : 'Киноман со стажем'),
      unit: isEn ? 'movies' : (isUk ? 'фільмів' : 'фильмов'),
      descTemplate: (v) => isEn ? `Watch and archive ${v} movies and series` : (isUk ? `Подивитися і зберегти в архів ${v} фільмів та серіалів` : `Посмотреть и сохранить в архив ${v} фильмов и сериалов`),
      getProgress: (s) => s.watchCompletedCount,
      tiers: [
        { val: 1 }, { val: 3 }, { val: 5 }, { val: 10 }, { val: 15 },
        { val: 20 }, { val: 30 }, { val: 40 }, { val: 50 }, { val: 65 },
        { val: 80 }, { val: 100 }, { val: 125 }, { val: 150 }, { val: 175 },
        { val: 200 }, { val: 250 }, { val: 300 }, { val: 400 }, { val: 500 }
      ]
    });

    // 8. 🛒 ПОКУПКИ И МАГАЗИНЫ (18 ступеней от 1 до 1000)
    addTiered({
      prefix: 'buy_total',
      category: 'buy',
      icon: '🛒',
      titleBase: isEn ? 'Shopping Pro' : (isUk ? 'Мисливець за покупками' : 'Охотник за покупками'),
      unit: isEn ? 'items' : (isUk ? 'покупок' : 'покупок'),
      descTemplate: (v) => isEn ? `Purchase and check off ${v} planned shopping items` : (isUk ? `Здійснити та викреслити ${v} запланованих покупок` : `Совершить и вычеркнуть ${v} запланированных покупок`),
      getProgress: (s) => s.buyCompletedCount,
      tiers: [
        { val: 1 }, { val: 3 }, { val: 5 }, { val: 10 }, { val: 15 },
        { val: 25 }, { val: 40 }, { val: 60 }, { val: 80 }, { val: 100 },
        { val: 150 }, { val: 200 }, { val: 250 }, { val: 300 }, { val: 400 },
        { val: 500 }, { val: 750 }, { val: 1000 }
      ]
    });

    // 9. ⏳ ЧАСЫ СФОКУСИРОВАННОЙ РАБОТЫ (18 ступеней от 1 до 5000 часов)
    addTiered({
      prefix: 'hours_total',
      category: 'tasks',
      icon: '⏳',
      titleBase: isEn ? 'Time Master' : (isUk ? 'Хранитель часу' : 'Хранитель времени'),
      unit: isEn ? 'hrs' : (isUk ? 'год.' : 'ч.'),
      descTemplate: (v) => isEn ? `Accumulate ${v} hours of focused work in notebook` : (isUk ? `Накопичити ${v} годин сфокусованої роботи в блокноті` : `Накопить ${v} часов сфокусированной работы в блокноте`),
      getProgress: (s) => s.totalHoursCompleted,
      tiers: [
        { val: 1 }, { val: 5 }, { val: 10 }, { val: 25 }, { val: 50 },
        { val: 75 }, { val: 100 }, { val: 150 }, { val: 200 }, { val: 300 },
        { val: 500 }, { val: 750 }, { val: 1000 }, { val: 1500 }, { val: 2000 },
        { val: 3000 }, { val: 4000 }, { val: 5000 }
      ]
    });

    // 10. 📅 ПРОЖИТЫЕ ДНИ В ИСТОРИИ (15 ступеней от 1 до 1000 дней)
    addTiered({
      prefix: 'days_history',
      category: 'streaks',
      icon: '📅',
      titleBase: isEn ? 'Life Chronicle' : (isUk ? 'Хроніка життя' : 'Хроника жизни'),
      unit: isEn ? 'days' : 'дней',
      descTemplate: (v) => isEn ? `Save history of completed tasks for ${v} active days` : (isUk ? `Зберегти історію виконаних справ за ${v} прожитих днів` : `Сохранить историю выполненных дел за ${v} прожитых дней`),
      getProgress: (s) => s.livedDaysCount,
      tiers: [
        { val: 1 }, { val: 3 }, { val: 7 }, { val: 14 }, { val: 30 },
        { val: 60 }, { val: 90 }, { val: 120 }, { val: 180 }, { val: 250 },
        { val: 365 }, { val: 500 }, { val: 730 }, { val: 850 }, { val: 1000 }
      ]
    });

    // 11. 🗂️ ОРГАНИЗАЦИЯ И ВКЛАДКИ (8 ступеней)
    addTiered({
      prefix: 'tabs_count',
      category: 'special',
      icon: '🗂️',
      titleBase: isEn ? 'Notebook Architect' : (isUk ? 'Архітектор блокнота' : 'Архитектор блокнота'),
      unit: isEn ? 'tabs' : (isUk ? 'вкладок' : 'вкладок'),
      descTemplate: (v) => isEn ? `Create and maintain ${v} notebook tabs` : (isUk ? `Створити та підтримувати ${v} вкладок` : `Создать и поддерживать ${v} вкладок`),
      getProgress: (s) => s.tabsCount,
      tiers: [
        { val: 3 }, { val: 4 }, { val: 5 }, { val: 6 }, { val: 7 },
        { val: 8 }, { val: 10 }, { val: 12 }
      ]
    });

    // 12. 🌟 ОСОБЫЕ И ЕДИНОРАЗОВЫЕ ДОСТИЖЕНИЯ (32 уникальные награды)
    const specialList = [
      { id: 'first_step', icon: '🌟', title: isEn ? 'First Step' : (isUk ? 'Перший крок' : 'Первый шаг'), desc: isEn ? 'Complete your very first task in the notebook' : (isUk ? 'Завершити своє найперше завдання в блокноті' : 'Завершить свою самую первую задачу в блокноте'), check: s => s.totalCompleted >= 1 },
      { id: 'all_day_done', icon: '🎯', title: isEn ? '100% Day' : (isUk ? 'День на всі 100%' : 'День на все 100%'), desc: isEn ? 'Complete 100% of tasks in a single day' : (isUk ? 'Виконати 100% справ за один день' : 'Выполнить 100% дел за один день'), check: s => s.hasDay100Percent },
      { id: 'master_day_10', icon: '⚡', title: isEn ? 'Productive Day (10+)' : (isUk ? 'Продуктивний день (10+)' : 'Продуктивный день (10+)'), desc: isEn ? 'Complete 10 or more tasks in a single day' : (isUk ? 'Виконати 10 або більше справ за один день' : 'Выполнить 10 или больше дел за один день'), check: s => s.has10TasksDay },
      { id: 'custom_style', icon: '🎨', title: isEn ? 'Personal Style' : (isUk ? 'Власний стиль' : 'Свой стиль'), desc: isEn ? 'Change accent color or theme in settings' : (isUk ? 'Змінити колір акценту або тему в налаштуваннях' : 'Сменить цвет акцента или тему в настройках'), check: s => s.hasCustomizedSettings },
      { id: 'backup_master', icon: '💾', title: isEn ? 'Prudent' : (isUk ? 'Ощадливий' : 'Бережливый'), desc: isEn ? 'Save a backup of your notebook data to a file' : (isUk ? 'Зберегти резервну копію блокнота у файл' : 'Сохранить резервную копию блокнота в файл'), check: s => s.hasExportedBackup },
      { id: 'time_traveler', icon: '🚀', title: isEn ? 'Time Machine' : (isUk ? 'Машина часу' : 'Машина времени'), desc: isEn ? 'Schedule a task for a future date in the calendar' : (isUk ? 'Запланувати завдання на майбутню дату в календарі' : 'Запланировать задачу на будущую дату в календаре'), check: s => s.hasFutureTask },
      { id: 'cinephile_first', icon: '🍿', title: isEn ? 'Premiere Screening' : (isUk ? 'Прем\'єрний показ' : 'Премьерный показ'), desc: isEn ? 'Mark first watched movie in the archive' : (isUk ? 'Відзначити перший переглянутий фільм в архіві' : 'Отметить первый просмотренный фильм в архив'), check: s => s.watchCompletedCount >= 1 },
      { id: 'serial_fan', icon: '📺', title: isEn ? 'Movie Buff' : (isUk ? 'Кіноман' : 'Киноман'), desc: isEn ? 'Watch 5 movies and mark in archive' : (isUk ? 'Подивитися 5 фільмів і відзначити в архіві' : 'Посмотреть 5 фильмов и отметить в архиве'), check: s => s.watchCompletedCount >= 5 },
      { id: 'smart_shopper', icon: '🛒', title: isEn ? 'Full Cart' : (isUk ? 'Повний кошик' : 'Полная корзина'), desc: isEn ? 'Buy everything from the "To Buy" list' : (isUk ? 'Купити все зі списку «Що купити?»' : 'Купить всё из списка «Что купить?»'), check: s => s.buyCompletedCount >= 1 },
      { id: 'shop_places_3', icon: '🏪', title: isEn ? 'Shopping Tour' : (isUk ? 'Шопінг-тур' : 'Шопинг-тур'), desc: isEn ? 'Buy 3 items from the shopping list' : (isUk ? 'Купити 3 товари зі списку покупок' : 'Купить 3 товара из списка покупок'), check: s => s.buyCompletedCount >= 3 },
      { id: 'shop_places_5', icon: '🏬', title: isEn ? 'Store Connoisseur' : (isUk ? 'Знавець покупок' : 'Знаток покупок'), desc: isEn ? 'Buy 10 items from the shopping list' : (isUk ? 'Купити 10 товарів зі списку покупок' : 'Купить 10 товаров из списка покупок'), check: s => s.buyCompletedCount >= 10 },
      { id: 'shop_places_10', icon: '🗺️', title: isEn ? 'Shopping Map' : (isUk ? 'Карта шопінгу' : 'Карта шопинга'), desc: isEn ? 'Buy 25 items from the shopping list' : (isUk ? 'Купити 25 товарів зі списку покупок' : 'Купить 25 товаров из списка покупок'), check: s => s.buyCompletedCount >= 25 },
      { id: 'night_owl', icon: '🦉', title: isEn ? 'Night Owl' : (isUk ? 'Нічна сова' : 'Ночная сова'), desc: isEn ? 'Complete a task late in the evening or night' : (isUk ? 'Завершити завдання пізно ввечері або вночі' : 'Завершить задачу в поздний вечер или ночь'), check: s => s.hasNightTask },
      { id: 'early_riser', icon: '☕', title: isEn ? 'First Rays' : (isUk ? 'З першими променями' : 'С первыми лучами'), desc: isEn ? 'Complete a morning task before noon' : (isUk ? 'Закрити ранкове завдання до полудня' : 'Закрыть утреннюю задачу до полудня'), check: s => s.morningCompletedCount >= 1 },
      { id: 'pattern_lines', icon: '📏', title: isEn ? 'Classic Lines' : (isUk ? 'Класичні лінії' : 'Классические линии'), desc: isEn ? 'Set notebook pattern to "Lines"' : (isUk ? 'Встановити візерунок «Лінії»' : 'Установить узор блокнота «Линии»'), check: s => s.hasCustomPattern },
      { id: 'pattern_grid', icon: '📐', title: isEn ? 'Strict Grid' : (isUk ? 'Сувора клітинка' : 'Строгая клетка'), desc: isEn ? 'Set notebook pattern to "Grid"' : (isUk ? 'Встановити візерунок «Клітинка»' : 'Установить узор блокнота «Клетка»'), check: s => s.hasGridPattern },
      { id: 'pattern_dots', icon: '🔘', title: isEn ? 'Elegant Dots' : (isUk ? 'Елегантні крапки' : 'Элегантные точки'), desc: isEn ? 'Set notebook pattern to "Dots"' : (isUk ? 'Встановити візерунок «Крапки»' : 'Установить узор блокнота «Точки»'), check: s => s.hasDotsPattern },
      { id: 'pattern_blank', icon: '📄', title: isEn ? 'Blank Sheet' : (isUk ? 'Чистий аркуш' : 'Чистый лист'), desc: isEn ? 'Set notebook pattern to blank' : (isUk ? 'Встановити чистий фон без візерунка' : 'Установить чистый фон без узора'), check: s => s.hasBlankPattern },
      { id: 'multi_tab_user', icon: '📁', title: isEn ? 'Multitasker' : (isUk ? 'Багатозадачність' : 'Многозадачность'), desc: isEn ? 'Manage tasks across 4 tabs simultaneously' : (isUk ? 'Вести справи одночасно у 4 вкладках' : 'Вести дела одновременно в 4 вкладках'), check: s => s.tabsCount >= 4 },
      { id: 'defer_task_once', icon: '🔄', title: isEn ? 'Second Wind' : (isUk ? 'Друге дихання' : 'Второе дыхание'), desc: isEn ? 'Defer a task to the next day via swipe' : (isUk ? 'Перенести завдання свайпом на наступний день' : 'Перенести задачу свайпом на следующий день'), check: s => s.hasDeferredTask },
      { id: 'photo_task', icon: '📝', title: isEn ? 'Detailed Note' : (isUk ? 'З приміткою' : 'С заметкой'), desc: isEn ? 'Add notes or details to a task' : (isUk ? 'Додати примітку або подробиці до завдання' : 'Добавить заметку или подробности к задаче'), check: s => s.hasNotesTask },
      { id: 'dark_side', icon: '🌙', title: isEn ? 'Dark Knight' : (isUk ? 'Темний лицар' : 'Тёмный рыцарь'), desc: isEn ? 'Enable deep dark theme' : (isUk ? 'Увімкнути глибоку темну тему' : 'Включить глубокую тёмную тему блокнота'), check: s => s.hasDarkTheme },
      { id: 'century_history', icon: '🏛️', title: isEn ? 'Chronicler' : (isUk ? 'Літописець' : 'Летописец'), desc: isEn ? 'Accumulate over 100 history entries' : (isUk ? 'Накопичити понад 100 записів в історії днів' : 'Накопить более 100 записей в истории дней'), check: s => s.totalHistoryItems >= 100 },
      { id: 'half_thousand_history', icon: '📜', title: isEn ? 'Grand Historian' : (isUk ? 'Великий хронікер' : 'Великий хроникер'), desc: isEn ? 'Accumulate over 500 history entries' : (isUk ? 'Накопичити понад 500 записів в історії' : 'Накопить более 500 записей в истории'), check: s => s.totalHistoryItems >= 500 },
      { id: 'thousand_history', icon: '👑', title: isEn ? 'Productivity Emperor' : (isUk ? 'Імператор продуктивності' : 'Император продуктивности'), desc: isEn ? 'Accumulate over 1000 history entries' : (isUk ? 'Накопичити понад 1000 записів в історії днів' : 'Накопить более 1000 записей в истории дней'), check: s => s.totalHistoryItems >= 1000 },
      { id: 'collector_10', icon: '🥉', title: isEn ? 'Collector (Bronze)' : (isUk ? 'Колекціонер (Бронза)' : 'Коллекционер (Бронза)'), desc: isEn ? 'Unlock 10 achievements in Plan4U' : (isUk ? 'Розблокувати 10 досягнень у блокноті' : 'Разблокировать 10 достижений в блокноте'), check: s => s.unlockedCount >= 10 },
      { id: 'collector_25', icon: '🥈', title: isEn ? 'Collector (Silver)' : (isUk ? 'Колекціонер (Срібло)' : 'Коллекционер (Серебро)'), desc: isEn ? 'Unlock 25 achievements in Plan4U' : (isUk ? 'Розблокувати 25 досягнень у блокноті' : 'Разблокировать 25 достижений в блокноте'), check: s => s.unlockedCount >= 25 },
      { id: 'collector_50', icon: '🥇', title: isEn ? 'Collector (Gold)' : (isUk ? 'Колекціонер (Золото)' : 'Коллекционер (Золото)'), desc: isEn ? 'Unlock 50 achievements in Plan4U' : (isUk ? 'Розблокувати 50 досягнень у блокноті' : 'Разблокировать 50 достижений в блокноте'), check: s => s.unlockedCount >= 50 },
      { id: 'collector_75', icon: '💎', title: isEn ? 'Collector (Platinum)' : (isUk ? 'Колекціонер (Платина)' : 'Коллекционер (Платина)'), desc: isEn ? 'Unlock 75 achievements in Plan4U' : (isUk ? 'Розблокувати 75 досягнень у блокноті' : 'Разблокировать 75 достижений в блокноте'), check: s => s.unlockedCount >= 75 },
      { id: 'collector_100', icon: '🏆', title: isEn ? 'Century of Glory (100)' : (isUk ? 'Вік слави (100 ачівок)' : 'Век славы (100 ачивок)'), desc: isEn ? 'Unlock 100 achievements in Plan4U!' : (isUk ? 'Розблокувати 100 досягнень у блокноті!' : 'Разблокировать 100 достижений в блокноте!'), check: s => s.unlockedCount >= 100 },
      { id: 'collector_150', icon: '🌌', title: isEn ? 'Cosmic Triumph (150)' : (isUk ? 'Космічний тріумф (150)' : 'Космический триумф (150)'), desc: isEn ? 'Unlock 150 achievements in Plan4U!' : (isUk ? 'Розблокувати 150 досягнень у блокноті!' : 'Разблокировать 150 достижений в блокноте!'), check: s => s.unlockedCount >= 150 },
      { id: 'collector_200', icon: '👑', title: isEn ? 'Ultimate Champion (200)' : (isUk ? 'Абсолютний чемпіон (200)' : 'Абсолютный чемпион (200)'), desc: isEn ? 'Unlock 200 achievements in Plan4U!' : (isUk ? 'Розблокувати 200 досягнень у блокноті!' : 'Разблокировать 200 достижений в блокноте!'), check: s => s.unlockedCount >= 200 }
    ];

    specialList.forEach(item => {
      list.push({
        ...item,
        category: 'special',
        type: 'onetime'
      });
    });

    return list;
  }

  return {
    buildCatalog: buildAchievementsCatalog
  };
}));
