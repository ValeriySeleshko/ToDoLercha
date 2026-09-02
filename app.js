/**
 * ToDo Notebook Application Logic with Scalable i18n
 */

// Detect user's system language (ru, uk, or en)
function detectSystemLanguage() {
  try {
    const raw = localStorage.getItem('todo_notebook_app_settings');
    if (raw) {
      const s = JSON.parse(raw);
      if (s.lang && ['ru', 'uk', 'en'].includes(s.lang)) return s.lang;
    }
  } catch (e) { }

  const navLang = (typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || 'ru') : 'ru').toLowerCase();
  if (navLang.startsWith('uk')) return 'uk';
  if (navLang.startsWith('ru') || navLang.startsWith('be') || navLang.startsWith('kk')) return 'ru';
  if (navLang.startsWith('en')) return 'en';
  return 'ru';
}

// Device Haptic & Vibration Engine
function triggerHaptic(pattern = 20) {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
    if (window.Capacitor?.Plugins?.Haptics) {
      if (Array.isArray(pattern)) {
        const total = pattern.reduce((a, b) => a + b, 0);
        window.Capacitor.Plugins.Haptics.vibrate({ duration: Math.min(3000, total) });
      } else {
        window.Capacitor.Plugins.Haptics.vibrate({ duration: pattern });
      }
    }
  } catch (e) { }
}

/**
 * Plan4U Dedicated Device Storage System
 * Manages structured folder layout on device:
 *   Plan4U/
 *     ├── tasks.json
 *     ├── settings.json
 *     ├── achievements.json
 *     ├── history.json
 *     ├── daily_tasks.json
 *     └── photos/
 *          └── photo_*.jpg
 */
const Plan4UStorage = {
  db: null,
  BASE_DIR: 'Plan4U',
  PHOTOS_DIR: 'Plan4U/photos',
  initPromise: null,

  init() {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          this.db = await this.openIndexedDB();
        } catch (e) {
          console.warn('Plan4U Storage: IndexedDB fallback', e);
        }

        try {
          const fs = window.Capacitor?.Plugins?.Filesystem;
          if (fs) {
            // Ensure Plan4U/ and Plan4U/photos/ folders exist on device (DATA and DOCUMENTS)
            await fs.mkdir({
              path: this.PHOTOS_DIR,
              directory: 'DATA',
              recursive: true
            }).catch(() => { });

            await fs.mkdir({
              path: this.BASE_DIR,
              directory: 'DOCUMENTS',
              recursive: true
            }).catch(() => { });

            console.log('Plan4U storage ready: Plan4U/ & Plan4U/photos/');
          }
        } catch (e) {
          console.log('Filesystem native init:', e);
        }
      })();
    }
    return this.initPromise;
  },

  openIndexedDB() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open('Plan4U_DeviceDatabase', 2);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'filename' });
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  // Save attached photo into dedicated photos subfolder: Plan4U/photos/
  async savePhoto(base64Data) {
    if (!base64Data) return null;
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;

    if (this.initPromise) await this.initPromise.catch(() => { });

    // 1. Store in IndexedDB Photos Store
    if (this.db) {
      try {
        const tx = this.db.transaction('photos', 'readwrite');
        tx.objectStore('photos').put({ id: photoId, data: base64Data, savedAt: new Date().toISOString() });
      } catch (e) { }
    }

    // 2. Store in Native Device Filesystem Plan4U/photos/
    try {
      const fs = window.Capacitor?.Plugins?.Filesystem;
      if (fs) {
        const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        await fs.writeFile({
          path: `${this.PHOTOS_DIR}/${photoId}`,
          data: cleanBase64,
          directory: 'DATA',
          recursive: true
        });
      }
    } catch (e) { }

    return photoId;
  },

  // Load photo by ID or passthrough legacy Base64
  async getPhoto(photoRef) {
    if (!photoRef) return null;
    if (photoRef.startsWith('data:')) return photoRef;

    if (this.initPromise) await this.initPromise.catch(() => { });

    // 1. Check IndexedDB
    if (this.db) {
      try {
        const record = await new Promise((resolve) => {
          const tx = this.db.transaction('photos', 'readonly');
          const req = tx.objectStore('photos').get(photoRef);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (record && record.data) {
          return record.data;
        }
      } catch (e) { }
    }

    // 2. Check Native Filesystem
    try {
      const fs = window.Capacitor?.Plugins?.Filesystem;
      if (fs) {
        const fileRes = await fs.readFile({
          path: `${this.PHOTOS_DIR}/${photoRef}`,
          directory: 'DATA'
        });
        if (fileRes && fileRes.data) {
          return `data:image/jpeg;base64,${fileRes.data}`;
        }
      }
    } catch (e) { }

    return photoRef;
  },

  // Save JSON data files into Plan4U/
  async saveFile(filename, data) {
    if (data === undefined || data === null) return;
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    if (!jsonStr || jsonStr === 'undefined' || jsonStr === 'null') return;

    // 1. LocalStorage mirror
    try {
      localStorage.setItem(`plan4u_${filename}`, jsonStr);
    } catch (e) { }

    if (this.initPromise) await this.initPromise.catch(() => { });

    // 2. IndexedDB mirror
    if (this.db) {
      try {
        const tx = this.db.transaction('files', 'readwrite');
        tx.objectStore('files').put({ filename, content: jsonStr, updatedAt: new Date().toISOString() });
      } catch (e) { }
    }

    // 3. Native Device File in Plan4U/ (DATA and DOCUMENTS directory)
    try {
      const fs = window.Capacitor?.Plugins?.Filesystem;
      if (fs) {
        await fs.writeFile({
          path: `${this.BASE_DIR}/${filename}`,
          data: jsonStr,
          directory: 'DATA',
          encoding: 'utf8',
          recursive: true
        });

        // Backup mirror in DOCUMENTS
        await fs.writeFile({
          path: `${this.BASE_DIR}/${filename}`,
          data: jsonStr,
          directory: 'DOCUMENTS',
          encoding: 'utf8',
          recursive: true
        }).catch(() => { });
      }
    } catch (e) { }
  },

  // Load JSON file with robust fallback chain across all layers
  async loadFile(filename, defaultVal = null) {
    if (this.initPromise) await this.initPromise.catch(() => { });

    // 1. Check Native Device Filesystem (DATA directory)
    try {
      const fs = window.Capacitor?.Plugins?.Filesystem;
      if (fs) {
        const res = await fs.readFile({
          path: `${this.BASE_DIR}/${filename}`,
          directory: 'DATA',
          encoding: 'utf8'
        });
        if (res && res.data) {
          const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          if (parsed !== null && parsed !== undefined) return parsed;
        }
      }
    } catch (e) { }

    // 2. Check Native Device Filesystem (DOCUMENTS directory)
    try {
      const fs = window.Capacitor?.Plugins?.Filesystem;
      if (fs) {
        const res = await fs.readFile({
          path: `${this.BASE_DIR}/${filename}`,
          directory: 'DOCUMENTS',
          encoding: 'utf8'
        });
        if (res && res.data) {
          const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          if (parsed !== null && parsed !== undefined) return parsed;
        }
      }
    } catch (e) { }

    // 3. Check IndexedDB
    if (this.db) {
      try {
        const res = await new Promise((resolve, reject) => {
          const tx = this.db.transaction('files', 'readonly');
          const req = tx.objectStore('files').get(filename);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        if (res && res.content) {
          const parsed = typeof res.content === 'string' ? JSON.parse(res.content) : res.content;
          if (parsed !== null && parsed !== undefined) return parsed;
        }
      } catch (e) { }
    }

    // 4. Check LocalStorage
    try {
      const saved = localStorage.getItem(`plan4u_${filename}`) || localStorage.getItem(`todo_notebook_${filename.replace('.json', '')}`);
      if (saved && saved !== 'undefined' && saved !== 'null') {
        return JSON.parse(saved);
      }
    } catch (e) { }

    return defaultVal;
  }
};

// Initialize dedicated storage on app launch
Plan4UStorage.init();

// Comprehensive multi-language dictionary
const I18N = {
  ru: {
    code: 'РУ',
    name: 'Русский',
    flag: '🇷🇺',
    locale: 'ru-RU',
    monthsGenitive: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    monthsNominative: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    today: 'Сегодня',
    selectedDay: 'Выбранный день',

    // Widgets & Toasts
    tooltip_date: 'Календарь блокнота',
    tooltip_timer: 'Загруженность за день (из 16 ч)',
    tooltip_streak: 'Серия дней',
    tooltip_trophy: 'Достижения',
    tooltip_settings: 'Настройки',
    workload_toast: 'Загруженность за день: {val} из 16 часов',
    streak_toast: '🔥 Беспрерывная серия: {days} {daysWord}! (Рекорд: {record})',

    // System Tabs
    tab_todo: 'Что\nсделать?',
    tab_buy: 'Что\nкупить?',
    tab_watch: 'Что\nпосмотреть?',

    // Period & 5 Section headers
    section_spiritual: '🕊️ Духовные дела',
    section_personal: '👤 Личные дела',
    section_household: '🏠 Домашние дела',
    section_cook: '🍳 Что приготовить',
    section_other: '📋 Другие планы',
    inline_input_placeholder: 'Нажмите, чтобы записать...',
    blank_line_placeholder: 'Пустая строка (нажмите для записи)...',
    priority_board_title: 'Главные дела дня',
    priority_board_no_tasks: 'Нет важных задач',
    priority_board_all_done: 'Все главные цели выполнены! 🎉',
    period_morning: 'Утро',
    period_day: 'День',
    period_evening: 'Вечер',
    period_free: 'В свободное время',
    watch_movies: '🎬 Фильмы',
    watch_series: '📺 Сериалы',
    watch_archive: '🎬 Архив просмотренного ({count})',
    empty_list: 'Список пуст',
    empty_list_hint: 'Нажмите в строку раздела, чтобы добавить дело',

    // Priorities
    priority_normal: 'Обычный',
    priority_normal_desc: 'Стандартная задача',
    priority_calm: 'Обычный',
    priority_day: 'В течении дня',
    priority_important: 'Важный',
    priority_important_desc: 'Выделяет жирным и поднимает наверх',
    priority_urgent: 'Очень важно',
    time_label: 'Когда выполнить? (время)',
    time_placeholder: 'Укажите время',

    // Modals
    modal_new_entry: 'Новая запись',
    modal_edit_entry: 'Редактировать запись',
    modal_new_tab: 'Новая вкладка',
    modal_edit_tab: 'Настройка вкладки',
    modal_delete_tab: 'Удалить вкладку',
    btn_cancel: 'Отмена',
    btn_save: 'Сохранить',
    btn_save_changes: 'Сохранить изменения',
    btn_create_tab: 'Создать вкладку',
    btn_delete_tab: '🗑️ Удалить вкладку',
    btn_done: 'Готово',

    // Form fields
    task_text_label: 'Текст задачи / записи *',
    task_text_placeholder: 'Что нужно сделать...',
    buy_item_placeholder: 'Например: Молоко, Хлеб...',
    watch_name_label: 'Название фильма / сериала *',
    watch_name_placeholder: 'Например: Интерстеллар, Дюна...',
    period_label: 'Время суток',
    priority_label: 'Важность и срочность',
    photo_attach_btn: '📸 Прикрепить фото или чек',
    photo_change_btn: '📸 Заменить фото',
    photo_attached_title: 'Фото прикреплено к записи',

    // Settings
    settings_title: '⚙️ Настройки',
    settings_language: 'Язык приложения',
    settings_language_desc: 'Интерфейс и даты на выбранном языке',
    settings_theme: 'Тема оформления',
    theme_light: '☀️ Светлая',
    theme_dark: '🌙 Тёмная',
    theme_auto: '⚙️ Авто',
    settings_accent: 'Цвет акцента',
    settings_font: 'Шрифт и оформление задач',
    font_family_label: 'Шрифт блокнота',
    font_size_label: 'Размер текста задач',
    settings_task_weight: 'Жирность обычных задач',
    settings_priority_weight: 'Жирность важных задач',
    settings_priority_color: 'Цвет важных задач',
    settings_notif: 'Оповещения и звуки',
    notif_browser_label: 'Уведомления',
    notif_browser_desc: 'Системные напоминания на телефоне',
    notif_morning_label: 'Утренний план ☀️',
    notif_morning_desc: 'Напоминание о делах в начале дня',
    notif_evening_label: 'Вечерний обзор 🌙',
    notif_evening_desc: 'Итоги дня и проверка дел',
    notif_pet_label: 'Забота о питомце 🐾',
    notif_pet_desc: 'Напоминание покормить Мейн-куна (15:00)',
    notif_haptics_label: 'Тактильный виброотклик',
    notif_haptics_desc: 'Вибрация при свайпах и тапах',
    notif_sound_label: 'Звуковые щелчки',
    notif_sound_desc: 'Приятный звук выполнения задачи',
    notif_test_btn: 'Проверить уведомление',
    settings_backup: 'Синхронизация и бэкап',
    backup_export: 'Скачать бэкап (JSON)',
    backup_import: 'Загрузить из файла',
    cloud_sync_btn: 'Синхронизировать сейчас',

    // Achievements
    achievements_title: 'Достижения',
    achievements_search_ph: 'Поиск среди 220+ достижений...',
    ach_filter_all: 'Все',
    ach_filter_streaks: '🔥 Серии',
    ach_filter_tasks: '📝 Дела',
    ach_filter_watch: '🎬 Кино',
    ach_filter_buy: '🛒 Покупки',
    ach_filter_special: '🌟 Особые',
    ach_filter_unlocked: '✓ Открыто',
    ach_unlocked_badge: '✓ Открыто',
    ach_locked_badge: '🔒 Закрыто',
    ach_progress_label: 'Прогресс:',
    ach_status_label: 'Статус:',
    ach_completed_text: 'Выполнено',
    ach_not_completed_text: 'Не выполнено',
    ach_nothing_found: 'Ничего не найдено',
    ach_nothing_found_sub: 'Попробуйте изменить категорию или поисковый запрос',

    // Confirm Modal
    confirm_delete_tab_title: 'Удалить вкладку?',
    confirm_delete_tab_msg: 'Вы уверены, что хотите удалить созданную вкладку «{title}» и все её задачи? Это действие нельзя будет отменить.',
    confirm_delete_tab_btn: 'Да, удалить',

    // Calendar
    calendar_title: '📅 Календарь блокнота',
    calendar_today_btn: '📍 Сегодня',
    calendar_select_btn: '✓ Открыть этот день',

    // Toasts
    toast_task_deferred: 'Задача перенесена на {date}',
    toast_entry_deferred: 'Запись перенесена',
    toast_entry_updated: 'Запись успешно обновлена',
    toast_tab_deleted: 'Вкладка «{title}» успешно удалена',
    toast_tab_updated: 'Вкладка и фон листа обновлены',
    toast_lang_changed: 'Язык изменен: Русский 🇷🇺',

    // Stickers
    stickers_title: '✨ Стикеры и декор',
    stickers_hint: 'Перетяните на лист или нажмите для добавления',
    stickers_cat_animals: '🐾 Зверушки',
    stickers_cat_nature: '🌸 Цветы',
    stickers_cat_sky: '☁️ Небо',
    stickers_cat_cozy: '🎀 Уют',
    toast_sticker_added: 'Стикер прикреплен к листу ✨',
    toast_sticker_deleted: 'Стикер удален'
  },

  uk: {
    code: 'УК',
    name: 'Українська',
    flag: '🇺🇦',
    locale: 'uk-UA',
    monthsGenitive: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
    monthsNominative: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
    weekdays: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'],
    weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    today: 'Сьогодні',
    selectedDay: 'Обраний день',

    // Widgets & Toasts
    tooltip_date: 'Календар блокнота',
    tooltip_timer: 'Завантаженість за день (з 16 год)',
    tooltip_streak: 'Серія днів',
    tooltip_trophy: 'Досягнення',
    tooltip_settings: 'Налаштування',
    workload_toast: 'Завантаженість за день: {val} з 16 годин',
    streak_toast: '🔥 Безперервна серія: {days} {daysWord}! (Рекорд: {record})',

    // System Tabs
    tab_todo: 'Що\nзробити?',
    tab_buy: 'Що\nкупити?',
    tab_watch: 'Що\nподивитись?',

    // Period & 5 Section headers
    section_spiritual: '🕊️ Духовні справи',
    section_personal: '👤 Особисті справи',
    section_household: '🏠 Домашні справи',
    section_cook: '🍳 Що приготувати',
    section_other: '📋 Інші плани',
    inline_input_placeholder: 'Натисніть, щоб записати...',
    blank_line_placeholder: 'Порожній рядок (натисніть для запису)...',
    priority_board_title: 'Головні справи дня',
    priority_board_no_tasks: 'Немає важливих завдань',
    priority_board_all_done: 'Всі головні цілі виконано! 🎉',
    period_morning: 'Ранок',
    period_day: 'День',
    period_evening: 'Вечір',
    period_free: 'У вільний час',
    watch_movies: '🎬 Фільми',
    watch_series: '📺 Серіали',
    watch_archive: '🎬 Архів переглянутого ({count})',
    empty_list: 'Список порожній',
    empty_list_hint: 'Натисніть у рядок розділу, щоб додати справу',

    // Priorities
    priority_normal: 'Звичайний',
    priority_normal_desc: 'Стандартне завдання',
    priority_calm: 'Звичайний',
    priority_day: 'Протягом дня',
    priority_important: 'Важливий',
    priority_important_desc: 'Виділяє жирним і піднімає вгору',
    priority_urgent: 'Дуже важливо',
    time_label: 'Коли виконати? (час)',
    time_placeholder: 'Оберіть час',

    // Modals
    modal_new_entry: 'Новий запис',
    modal_edit_entry: 'Редагувати запис',
    modal_new_tab: 'Нова вкладка',
    modal_edit_tab: 'Налаштування вкладки',
    modal_delete_tab: 'Видалити вкладку',
    btn_cancel: 'Скасувати',
    btn_save: 'Зберегти',
    btn_save_changes: 'Зберегти зміни',
    btn_create_tab: 'Створити вкладку',
    btn_delete_tab: '🗑️ Видалити вкладку',
    btn_done: 'Готово',

    // Form fields
    task_text_label: 'Текст завдання / запису *',
    task_text_placeholder: 'Що потрібно зробити...',
    buy_item_placeholder: 'Наприклад: Молоко, Хліб...',
    watch_name_label: 'Назва фільму / серіалу *',
    watch_name_placeholder: 'Наприклад: Інтерстеллар, Дюна...',
    period_label: 'Час доби',
    priority_label: 'Важливість і терміновість',
    photo_attach_btn: '📸 Прикріпити фото або чек',
    photo_change_btn: '📸 Замінити фото',
    photo_attached_title: 'Фото прикріплено до запису',

    // Settings
    settings_title: '⚙️ Налаштування',
    settings_language: 'Мова додатку',
    settings_language_desc: 'Інтерфейс і дати вибраною мовою',
    settings_theme: 'Тема оформлення',
    theme_light: '☀️ Світла',
    theme_dark: '🌙 Темна',
    theme_auto: '⚙️ Авто',
    settings_accent: 'Колір акценту',
    settings_font: 'Шрифт і оформлення завдань',
    font_family_label: 'Шрифт блокнота',
    font_size_label: 'Розмір тексту завдань',
    settings_task_weight: 'Жирність звичайних завдань',
    settings_priority_weight: 'Жирність важливих завдань',
    settings_priority_color: 'Колір важливих завдань',
    settings_notif: 'Сповіщення та звуки',
    notif_browser_label: 'Сповіщення',
    notif_browser_desc: 'Системні нагадування на телефоні',
    notif_morning_label: 'Ранковий план ☀️',
    notif_morning_desc: 'Нагадування про справи на початку дня',
    notif_evening_label: 'Вечірній огляд 🌙',
    notif_evening_desc: 'Підсумки дня та перевірка справ',
    notif_pet_label: 'Турбота про котика 🐾',
    notif_pet_desc: 'Нагадування провідати Мейн-куна (15:00)',
    notif_haptics_label: 'Тактильний вібровідгук',
    notif_haptics_desc: 'Вібрація при свайпах і тапах',
    notif_sound_label: 'Звукові клацання',
    notif_sound_desc: 'Приємний звук виконання завдання',
    notif_test_btn: 'Перевірити сповіщення',
    settings_backup: 'Синхронізація та бекап',
    backup_export: 'Завантажити бекап (JSON)',
    backup_import: 'Відновити з файлу',
    cloud_sync_btn: 'Синхронізувати зараз',

    // Achievements
    achievements_title: 'Досягнення',
    achievements_search_ph: 'Пошук серед 220+ досягнень...',
    ach_filter_all: 'Всі',
    ach_filter_streaks: '🔥 Серії',
    ach_filter_tasks: '📝 Справи',
    ach_filter_watch: '🎬 Кіно',
    ach_filter_buy: '🛒 Покупки',
    ach_filter_special: '🌟 Особливі',
    ach_filter_unlocked: '✓ Відкрито',
    ach_unlocked_badge: '✓ Відкрито',
    ach_locked_badge: '🔒 Закрито',
    ach_progress_label: 'Прогрес:',
    ach_status_label: 'Статус:',
    ach_completed_text: 'Виконано',
    ach_not_completed_text: 'Не виконано',
    ach_nothing_found: 'Нічого не знайдено',
    ach_nothing_found_sub: 'Спробуйте змінити категорію або пошуковий запит',

    // Confirm Modal
    confirm_delete_tab_title: 'Видалити вкладку?',
    confirm_delete_tab_msg: 'Ви впевнені, що хочете видалити створену вкладку «{title}» та всі її завдання? Цю дію не можна буде скасувати.',
    confirm_delete_tab_btn: 'Так, видалити',

    // Calendar
    calendar_title: '📅 Календар блокнота',
    calendar_today_btn: '📍 Сьогодні',
    calendar_select_btn: '✓ Відкрити цей день',

    // Toasts
    toast_task_deferred: 'Завдання перенесено на {date}',
    toast_entry_deferred: 'Запис перенесено',
    toast_entry_updated: 'Запис успішно оновлено',
    toast_tab_deleted: 'Вкладку «{title}» успішно видалено',
    toast_tab_updated: 'Вкладку і фон аркуша оновлено',
    toast_lang_changed: 'Мову змінено: Українська 🇺🇦',

    // Stickers
    stickers_title: '✨ Стікери та декор',
    stickers_hint: 'Перетягніть на аркуш або натисніть для додавання',
    stickers_cat_animals: '🐾 Звірятка',
    stickers_cat_nature: '🌸 Квіти',
    stickers_cat_sky: '☁️ Небо',
    stickers_cat_cozy: '🎀 Затишок',
    toast_sticker_added: 'Стікер прикріплено до аркуша ✨',
    toast_sticker_deleted: 'Стікер видалено'
  },

  en: {
    code: 'EN',
    name: 'English',
    flag: '🇬🇧',
    locale: 'en-US',
    monthsGenitive: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsNominative: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    today: 'Today',
    selectedDay: 'Selected day',

    // Widgets & Toasts
    tooltip_date: 'Notebook Calendar',
    tooltip_timer: 'Daily workload (out of 16h)',
    tooltip_streak: 'Daily Streak',
    tooltip_trophy: 'Achievements',
    tooltip_settings: 'Settings',
    workload_toast: 'Daily workload: {val} of 16 hours',
    streak_toast: '🔥 Consecutive streak: {days} {daysWord}! (Best: {record})',

    // System Tabs
    tab_todo: 'To\nDo?',
    tab_buy: 'To\nBuy?',
    tab_watch: 'To\nWatch?',

    // Period & 5 Section headers
    section_spiritual: '🕊️ Spiritual tasks',
    section_personal: '👤 Personal tasks',
    section_household: '🏠 Household tasks',
    section_cook: '🍳 What to cook',
    section_other: '📋 Other plans',
    inline_input_placeholder: 'Click to write down...',
    blank_line_placeholder: 'Empty line (click to write)...',
    priority_board_title: 'Priority Focus',
    priority_board_no_tasks: 'No priority tasks',
    priority_board_all_done: 'All priorities completed! 🎉',
    period_morning: 'Morning',
    period_day: 'Day',
    period_evening: 'Evening',
    period_free: 'Free time',
    watch_movies: '🎬 Movies',
    watch_series: '📺 TV Series',
    watch_archive: '🎬 Watched Archive ({count})',
    empty_list: 'List is empty',
    empty_list_hint: 'Click on a section line to add a task',

    // Priorities
    priority_normal: 'Normal',
    priority_normal_desc: 'Standard task priority',
    priority_calm: 'Normal',
    priority_day: 'During the day',
    priority_important: 'Important',
    priority_important_desc: 'Bolds font and sorts to top',
    priority_urgent: 'Top priority',
    time_label: 'When to execute? (time)',
    time_placeholder: 'Set time',

    // Modals
    modal_new_entry: 'New Entry',
    modal_edit_entry: 'Edit Entry',
    modal_new_tab: 'New Tab',
    modal_edit_tab: 'Tab Settings',
    modal_delete_tab: 'Delete Tab',
    btn_cancel: 'Cancel',
    btn_save: 'Save',
    btn_save_changes: 'Save Changes',
    btn_create_tab: 'Create Tab',
    btn_delete_tab: '🗑️ Delete Tab',
    btn_done: 'Done',

    // Form fields
    task_text_label: 'Task text / entry *',
    task_text_placeholder: 'What needs to be done...',
    buy_item_placeholder: 'e.g.: Milk, Bread...',
    watch_name_label: 'Movie / Series title *',
    watch_name_placeholder: 'e.g.: Interstellar, Dune...',
    period_label: 'Time of day',
    priority_label: 'Priority & urgency',
    photo_attach_btn: '📸 Attach photo or receipt',
    photo_change_btn: '📸 Replace photo',
    photo_attached_title: 'Photo attached to entry',

    // Settings
    settings_title: '⚙️ Settings',
    settings_language: 'Application Language',
    settings_language_desc: 'Interface & dates in selected language',
    settings_theme: 'Theme',
    theme_light: '☀️ Light',
    theme_dark: '🌙 Dark',
    theme_auto: '⚙️ Auto',
    settings_accent: 'Accent Color',
    settings_font: 'Font & Styling',
    font_family_label: 'Notebook font',
    font_size_label: 'Task text size',
    settings_task_weight: 'Regular task boldness',
    settings_priority_weight: 'Priority task boldness',
    settings_priority_color: 'Priority task color',
    settings_notif: 'Notifications & Sounds',
    notif_browser_label: 'Notifications',
    notif_browser_desc: 'System phone reminders',
    notif_morning_label: 'Morning Plan ☀️',
    notif_morning_desc: 'Daily morning task briefing',
    notif_evening_label: 'Evening Review 🌙',
    notif_evening_desc: 'Daily wrap-up and completed task check',
    notif_pet_label: 'Pet Care Reminder 🐾',
    notif_pet_desc: 'Reminder to feed and pet your Maine Coon',
    notif_haptics_label: 'Haptic Vibration',
    notif_haptics_desc: 'Vibration on swipes and taps',
    notif_sound_label: 'Sound Effects',
    notif_sound_desc: 'Pleasant sound on task completion',
    notif_test_btn: 'Test Notification',
    settings_backup: 'Backup & Cloud Sync',
    backup_export: 'Download Backup (JSON)',
    backup_import: 'Restore from file',
    cloud_sync_btn: 'Sync Now',

    // Achievements
    achievements_title: 'Achievements',
    achievements_search_ph: 'Search 220+ achievements...',
    ach_filter_all: 'All',
    ach_filter_streaks: '🔥 Streaks',
    ach_filter_tasks: '📝 Tasks',
    ach_filter_watch: '🎬 Watch',
    ach_filter_buy: '🛒 Buy',
    ach_filter_special: '🌟 Special',
    ach_filter_unlocked: '✓ Unlocked',
    ach_unlocked_badge: '✓ Unlocked',
    ach_locked_badge: '🔒 Locked',
    ach_progress_label: 'Progress:',
    ach_status_label: 'Status:',
    ach_completed_text: 'Completed',
    ach_not_completed_text: 'Incomplete',
    ach_nothing_found: 'Nothing found',
    ach_nothing_found_sub: 'Try changing category or search query',

    // Confirm Modal
    confirm_delete_tab_title: 'Delete tab?',
    confirm_delete_tab_msg: 'Are you sure you want to delete custom tab «{title}» and all its tasks? This action cannot be undone.',
    confirm_delete_tab_btn: 'Yes, delete',

    // Calendar
    calendar_title: '📅 Notebook Calendar',
    calendar_today_btn: '📍 Today',
    calendar_select_btn: '✓ Open this day',

    // Toasts
    toast_task_deferred: 'Task deferred to {date}',
    toast_entry_deferred: 'Entry deferred',
    toast_entry_updated: 'Entry successfully updated',
    toast_tab_deleted: 'Tab «{title}» deleted successfully',
    toast_tab_updated: 'Tab and notebook sheet updated',
    toast_lang_changed: 'Language changed: English 🇬🇧',

    // Stickers
    stickers_title: '✨ Stickers & Decor',
    stickers_hint: 'Drag onto page or tap to place',
    stickers_cat_animals: '🐾 Animals',
    stickers_cat_nature: '🌸 Nature',
    stickers_cat_sky: '☁️ Sky & Magic',
    stickers_cat_cozy: '🎀 Cozy & Deco',
    toast_sticker_added: 'Sticker placed on page ✨',
    toast_sticker_deleted: 'Sticker removed'
  }
};

// Initial Seed Tabs
const INITIAL_TABS = [
  { id: 'todo', title: 'Что\nсделать?', colorId: 'default' },
  { id: 'buy', title: 'Что\nкупить?', colorId: 'orange' },
  { id: 'watch', title: 'Что\nпосмотреть?', colorId: 'purple' }
];

// Clean Initial Start: no pre-filled mock tasks
const INITIAL_TASKS = {
  todo: [],
  buy: [],
  watch: []
};

const DEFAULT_SECTIONS = {
  todo: [
    { id: 'spiritual', name: 'Духовные дела', icon: '🕊️', key: 'section_spiritual' },
    { id: 'personal', name: 'Личные дела', icon: '👤', key: 'section_personal' },
    { id: 'household', name: 'Домашние дела', icon: '🏠', key: 'section_household' },
    { id: 'cook', name: 'Что приготовить', icon: '🍳', key: 'section_cook' },
    { id: 'other', name: 'Другие планы', icon: '📋', key: 'section_other' }
  ],
  buy: [
    { id: 'products', name: 'Продукты', icon: '🛒' },
    { id: 'household_goods', name: 'Для дома', icon: '🧼' },
    { id: 'other_buy', name: 'Разное', icon: '📦' }
  ],
  watch: [
    { id: 'movies', name: 'Фильмы', icon: '🎬' },
    { id: 'series', name: 'Сериалы', icon: '📺' }
  ]
};

const SECTIONS_TODO = DEFAULT_SECTIONS.todo;

// Haptic vibration feedback helper
function triggerHaptic(pattern = 20, style = 'light') {
  try {
    if (window.appInstance && window.appInstance.settings) {
      if (window.appInstance.settings.hapticsEnabled === false) return;
    } else {
      const raw = localStorage.getItem('todo_notebook_app_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.hapticsEnabled === false) return;
      }
    }

    // 1. Native Android hardware vibration bridge
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.WidgetBridge && typeof window.Capacitor.Plugins.WidgetBridge.vibrate === 'function') {
      let dur = 25;
      let st = typeof style === 'string' ? style : 'light';
      if (typeof pattern === 'number') {
        dur = pattern;
      }
      if (Array.isArray(pattern) || style === 'achievement') {
        st = 'achievement';
      } else if (dur >= 30) {
        st = 'heavy';
      } else if (dur >= 20) {
        st = 'medium';
      }
      window.Capacitor.Plugins.WidgetBridge.vibrate({ duration: dur, style: st });
      return;
    }

    // 2. Standard Web Navigator Vibrate fallback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Ignore if not supported or disabled
  }
}

// High-performance client-side image downscaling and compression to preserve LocalStorage quota
function compressImageFile(file, maxWidth = 900, maxHeight = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Неверный тип файла'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const PRIORITIES = [
  { id: 'обычный', label: 'Обычный', class: 'p-calm', icon: '⚪' },
  { id: 'важный', label: 'Важный', class: 'p-important', icon: '⭐' }
];

function getTaskSection(task) {
  if (!task) return 'personal';
  if (task.section) {
    const s = task.section.toLowerCase();
    if (s.includes('духовн') || s === 'spiritual') return 'spiritual';
    if (s.includes('личн') || s === 'personal') return 'personal';
    if (s.includes('дом') || s.includes('семейн') || s.includes('семья') || s === 'household' || s === 'family') return 'household';
    if (s.includes('готов') || s.includes('кухн') || s.includes('еда') || s.includes('cook') || s.includes('meal')) return 'cook';
    if (s.includes('друг') || s.includes('план') || s === 'other') return 'other';
    return task.section;
  }
  const p = (task.period || '').toUpperCase();
  if (p === 'УТРО') return 'spiritual';
  if (p === 'ДЕНЬ') return 'personal';
  if (p === 'ВЕЧЕР') return 'household';
  return 'other';
}

function getPriorityRank(task) {
  if (!task || task.isEmpty || !task.text) return 2;
  const p = (task.priority || '').toLowerCase();
  const t = (task.text || '').toLowerCase().trim();
  if (p === 'важный' || p === 'важно' || p === 'очень важно' || p === 'вопрос жизни и смерти' ||
    p === 'important' || p === 'urgent' || p === 'high' ||
    t.includes('очень важно') || t.includes('жизни и смерти') ||
    t.includes('(важно)') || t.includes('(важный)') ||
    t.startsWith('! ') || t.startsWith('!') || t.startsWith('⚡')) {
    return 1;
  }
  return 2;
}

function cleanTaskText(text) {
  if (!text) return '';
  const cleaned = text
    .replace(/\s*\(вопрос жизни и смерти\)/gi, '')
    .replace(/\s*\(очень важно\)/gi, '')
    .replace(/\s*\(важно\)/gi, '')
    .replace(/\s*\(важный\)/gi, '')
    .replace(/\s*\(в течении дня\)/gi, '')
    .replace(/\s*\(перенесено\)/gi, '')
    .replace(/^!\s*/, '')
    .trim();
  return cleaned || text.trim();
}

function generateTaskId() {
  return 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

const TAB_COLORS = [
  // Row 1: Нейтральные, Серые и Лавандовые
  { id: 'white', alias: 'default', name: 'Белый', inactiveBg: '#e8e4db', sheetBg: '#ffffff', darkInactiveBg: '#1c202d', darkSheetBg: '#131620', swatch: '#ffffff' },
  { id: 'cream', name: 'Кремовый', inactiveBg: '#ece4d2', sheetBg: '#fcf8ee', darkInactiveBg: '#221f1a', darkSheetBg: '#171512', swatch: '#f6f0e2' },
  { id: 'gray_light', name: 'Светло-серый', inactiveBg: '#dbe1e8', sheetBg: '#f1f5f9', darkInactiveBg: '#1e2430', darkSheetBg: '#141822', swatch: '#e2e8f0' },
  { id: 'gray_slate', name: 'Пепельный серый', inactiveBg: '#cbd5e1', sheetBg: '#e2e8f0', darkInactiveBg: '#212635', darkSheetBg: '#151924', swatch: '#94a3b8' },
  { id: 'lavender_light', name: 'Нежная лаванда', inactiveBg: '#e2dcfa', sheetBg: '#f6f3ff', darkInactiveBg: '#221d36', darkSheetBg: '#171426', swatch: '#ede9fe' },
  { id: 'lavender', name: 'Лавандовый', inactiveBg: '#d4cbfa', sheetBg: '#eee8fc', darkInactiveBg: '#251e3e', darkSheetBg: '#19142b', swatch: '#c4b5fd' },
  { id: 'violet_pastel', name: 'Сиреневый', inactiveBg: '#c3b5f7', sheetBg: '#e8ddfb', darkInactiveBg: '#271c42', darkSheetBg: '#1a132c', swatch: '#a78bfa' },

  // Row 2: Тёплые пастельные (Розовые, Пудровые, Персиковые, Лимонные)
  { id: 'pink_powder', name: 'Пудровый розовый', inactiveBg: '#f8dbe8', sheetBg: '#fdf2f8', darkInactiveBg: '#2a1a26', darkSheetBg: '#1c121b', swatch: '#fce7f3' },
  { id: 'pink', name: 'Розовый', inactiveBg: '#f6bfda', sheetBg: '#fbe4ef', darkInactiveBg: '#2e1929', darkSheetBg: '#1f111d', swatch: '#f472b6' },
  { id: 'rose', name: 'Роза', inactiveBg: '#f4a5ca', sheetBg: '#fadbe9', darkInactiveBg: '#32182b', darkSheetBg: '#21101e', swatch: '#ec4899' },
  { id: 'peach_light', name: 'Нежный персик', inactiveBg: '#fae3cb', sheetBg: '#fff3e8', darkInactiveBg: '#2b1f18', darkSheetBg: '#1c1410', swatch: '#ffedd5' },
  { id: 'orange', name: 'Персиковый', inactiveBg: '#f8cc9e', sheetBg: '#fee8cf', darkInactiveBg: '#2f1f17', darkSheetBg: '#1f130e', swatch: '#fb923c' },
  { id: 'apricot', name: 'Абрикосовый', inactiveBg: '#f7b677', sheetBg: '#fedebf', darkInactiveBg: '#301d14', darkSheetBg: '#20120c', swatch: '#f97316' },
  { id: 'yellow', name: 'Лимонный', inactiveBg: '#faea7e', sheetBg: '#fef5be', darkInactiveBg: '#2b2312', darkSheetBg: '#1b160b', swatch: '#eab308' },

  // Row 3: Природные и Свежие (Мятные, Фисташка, Небесные, Морская волна)
  { id: 'mint_light', name: 'Светлая мята', inactiveBg: '#ccf7d9', sheetBg: '#ebfaf0', darkInactiveBg: '#172720', darkSheetBg: '#101b16', swatch: '#bbf7d0' },
  { id: 'green', name: 'Мятный', inactiveBg: '#a8f0be', sheetBg: '#def7e7', darkInactiveBg: '#162b20', darkSheetBg: '#0f1d16', swatch: '#4ade80' },
  { id: 'sage', name: 'Шалфей', inactiveBg: '#8ee6b2', sheetBg: '#d3f4e2', darkInactiveBg: '#182b22', darkSheetBg: '#101e17', swatch: '#22c55e' },
  { id: 'sky_light', name: 'Небесный ультралайт', inactiveBg: '#d1ebfc', sheetBg: '#edf7fc', darkInactiveBg: '#162232', darkSheetBg: '#101723', swatch: '#bae6fd' },
  { id: 'blue', name: 'Голубой', inactiveBg: '#b1defa', sheetBg: '#ddf0fb', darkInactiveBg: '#152438', darkSheetBg: '#0e1826', swatch: '#38bdf8' },
  { id: 'azure', name: 'Лазурный', inactiveBg: '#96ccfa', sheetBg: '#dbeafe', darkInactiveBg: '#16203a', darkSheetBg: '#0f1628', swatch: '#60a5fa' },
  { id: 'teal_ice', name: 'Морская пена', inactiveBg: '#9dede5', sheetBg: '#d5f7f9', darkInactiveBg: '#15272a', darkSheetBg: '#0e1a1c', swatch: '#2dd4bf' }
];

const ACCENT_COLORS = [
  {
    id: 'magenta',
    name: 'Малиновый',
    color: '#d83a88',
    dark: '#580c35',
    rgb: '216, 58, 136',
    marginLine: 'rgba(216, 58, 136, 0.45)',
    darkMarginLine: 'rgba(244, 114, 182, 0.4)',
    sectionBg: '#fdf0f5',
    sectionBorder: '#f4c9db',
    sectionText: '#70133c',
    darkSectionBg: '#2a1627',
    darkSectionBorder: '#4d2044',
    darkSectionText: '#f472b6'
  },
  {
    id: 'purple',
    name: 'Фиолетовый',
    color: '#8b5cf6',
    dark: '#3b0764',
    rgb: '139, 92, 246',
    marginLine: 'rgba(139, 92, 246, 0.45)',
    darkMarginLine: 'rgba(196, 181, 253, 0.4)',
    sectionBg: '#f5f3ff',
    sectionBorder: '#ddd6fe',
    sectionText: '#5b21b6',
    darkSectionBg: '#231838',
    darkSectionBorder: '#4a2b7e',
    darkSectionText: '#c4b5fd'
  },
  {
    id: 'blue',
    name: 'Океан',
    color: '#0284c7',
    dark: '#0c4a6e',
    rgb: '2, 132, 199',
    marginLine: 'rgba(2, 132, 199, 0.45)',
    darkMarginLine: 'rgba(125, 211, 252, 0.4)',
    sectionBg: '#f0f9ff',
    sectionBorder: '#bae6fd',
    sectionText: '#0369a1',
    darkSectionBg: '#132438',
    darkSectionBorder: '#1c4a73',
    darkSectionText: '#7dd3fc'
  },
  {
    id: 'emerald',
    name: 'Изумруд',
    color: '#10b981',
    dark: '#064e3b',
    rgb: '16, 185, 129',
    marginLine: 'rgba(16, 185, 129, 0.45)',
    darkMarginLine: 'rgba(110, 231, 183, 0.4)',
    sectionBg: '#ecfdf5',
    sectionBorder: '#a7f3d0',
    sectionText: '#047857',
    darkSectionBg: '#122820',
    darkSectionBorder: '#1c5440',
    darkSectionText: '#6ee7b7'
  },
  {
    id: 'amber',
    name: 'Янтарь',
    color: '#f59e0b',
    dark: '#78350f',
    rgb: '245, 158, 11',
    marginLine: 'rgba(245, 158, 11, 0.45)',
    darkMarginLine: 'rgba(252, 211, 77, 0.4)',
    sectionBg: '#fffbeb',
    sectionBorder: '#fde68a',
    sectionText: '#b45309',
    darkSectionBg: '#2d2314',
    darkSectionBorder: '#5c431b',
    darkSectionText: '#fcd34d'
  },
  {
    id: 'crimson',
    name: 'Рубин',
    color: '#ef4444',
    dark: '#7f1d1d',
    rgb: '239, 68, 68',
    marginLine: 'rgba(239, 68, 68, 0.45)',
    darkMarginLine: 'rgba(252, 165, 165, 0.4)',
    sectionBg: '#fef2f2',
    sectionBorder: '#fecaca',
    sectionText: '#b91c1c',
    darkSectionBg: '#2d181c',
    darkSectionBorder: '#5c222a',
    darkSectionText: '#fca5a5'
  },
  {
    id: 'slate',
    name: 'Графит',
    color: '#475569',
    dark: '#0f172a',
    rgb: '71, 85, 105',
    marginLine: 'rgba(71, 85, 105, 0.45)',
    darkMarginLine: 'rgba(203, 213, 225, 0.4)',
    sectionBg: '#f8fafc',
    sectionBorder: '#cbd5e1',
    sectionText: '#334155',
    darkSectionBg: '#1c2230',
    darkSectionBorder: '#344159',
    darkSectionText: '#cbd5e1'
  },
  {
    id: 'indigo',
    name: 'Индиго',
    color: '#6366f1',
    dark: '#312e81',
    rgb: '99, 102, 241',
    marginLine: 'rgba(99, 102, 241, 0.45)',
    darkMarginLine: 'rgba(165, 180, 252, 0.4)',
    sectionBg: '#eef2ff',
    sectionBorder: '#c7d2fe',
    sectionText: '#3730a3',
    darkSectionBg: '#1e1f3d',
    darkSectionBorder: '#373b75',
    darkSectionText: '#a5b4fc'
  },
  {
    id: 'teal',
    name: 'Бирюзовый',
    color: '#0d9488',
    dark: '#134e4a',
    rgb: '13, 148, 136',
    marginLine: 'rgba(13, 148, 136, 0.45)',
    darkMarginLine: 'rgba(94, 234, 212, 0.4)',
    sectionBg: '#f0fdfa',
    sectionBorder: '#99f6e4',
    sectionText: '#115e59',
    darkSectionBg: '#132b29',
    darkSectionBorder: '#1e5954',
    darkSectionText: '#5eead4'
  },
  {
    id: 'rose_gold',
    name: 'Пыльная роза',
    color: '#f43f5e',
    dark: '#881337',
    rgb: '244, 63, 94',
    marginLine: 'rgba(244, 63, 94, 0.45)',
    darkMarginLine: 'rgba(253, 164, 175, 0.4)',
    sectionBg: '#fff1f2',
    sectionBorder: '#fecdd3',
    sectionText: '#9f1239',
    darkSectionBg: '#30161d',
    darkSectionBorder: '#5c2331',
    darkSectionText: '#fda4af'
  },
  {
    id: 'coral',
    name: 'Коралл',
    color: '#f97316',
    dark: '#7c2d12',
    rgb: '249, 115, 22',
    marginLine: 'rgba(249, 115, 22, 0.45)',
    darkMarginLine: 'rgba(253, 186, 116, 0.4)',
    sectionBg: '#fff7ed',
    sectionBorder: '#fed7aa',
    sectionText: '#9a3412',
    darkSectionBg: '#2f1e14',
    darkSectionBorder: '#5e341f',
    darkSectionText: '#fdba74'
  },
  {
    id: 'lime',
    name: 'Лайм',
    color: '#84cc16',
    dark: '#365314',
    rgb: '132, 204, 22',
    marginLine: 'rgba(132, 204, 22, 0.45)',
    darkMarginLine: 'rgba(190, 242, 100, 0.4)',
    sectionBg: '#f7fee7',
    sectionBorder: '#d9f99d',
    sectionText: '#3f6212',
    darkSectionBg: '#212a14',
    darkSectionBorder: '#42591e',
    darkSectionText: '#bef264'
  },
  {
    id: 'cyan',
    name: 'Аквамарин',
    color: '#06b6d4',
    dark: '#164e63',
    rgb: '6, 182, 212',
    marginLine: 'rgba(6, 182, 212, 0.45)',
    darkMarginLine: 'rgba(103, 232, 249, 0.4)',
    sectionBg: '#ecfeff',
    sectionBorder: '#a5f3fc',
    sectionText: '#155e75',
    darkSectionBg: '#122a32',
    darkSectionBorder: '#1c5566',
    darkSectionText: '#67e8f9'
  },
  {
    id: 'fuchsia',
    name: 'Фуксия',
    color: '#d946ef',
    dark: '#701a75',
    rgb: '217, 70, 239',
    marginLine: 'rgba(217, 70, 239, 0.45)',
    darkMarginLine: 'rgba(240, 171, 252, 0.4)',
    sectionBg: '#fdf4ff',
    sectionBorder: '#f5d0fe',
    sectionText: '#86198f',
    darkSectionBg: '#2c152e',
    darkSectionBorder: '#56235c',
    darkSectionText: '#f0abfc'
  },
  {
    id: 'mint',
    name: 'Мята',
    color: '#14b8a6',
    dark: '#115e59',
    rgb: '20, 184, 166',
    marginLine: 'rgba(20, 184, 166, 0.45)',
    darkMarginLine: 'rgba(94, 234, 212, 0.4)',
    sectionBg: '#f0fdfa',
    sectionBorder: '#99f6e4',
    sectionText: '#115e59',
    darkSectionBg: '#132b29',
    darkSectionBorder: '#1b5650',
    darkSectionText: '#5eead4'
  },
  {
    id: 'bronze',
    name: 'Бронза',
    color: '#d97706',
    dark: '#78350f',
    rgb: '217, 119, 6',
    marginLine: 'rgba(217, 119, 6, 0.45)',
    darkMarginLine: 'rgba(252, 211, 77, 0.4)',
    sectionBg: '#fffbeb',
    sectionBorder: '#fde68a',
    sectionText: '#92400e',
    darkSectionBg: '#2c2214',
    darkSectionBorder: '#573d19',
    darkSectionText: '#fcd34d'
  },
  {
    id: 'midnight',
    name: 'Ультрамарин',
    color: '#3b82f6',
    dark: '#1e3a8a',
    rgb: '59, 130, 246',
    marginLine: 'rgba(59, 130, 246, 0.45)',
    darkMarginLine: 'rgba(147, 197, 253, 0.4)',
    sectionBg: '#eff6ff',
    sectionBorder: '#bfdbfe',
    sectionText: '#1d4ed8',
    darkSectionBg: '#15213d',
    darkSectionBorder: '#23447d',
    darkSectionText: '#93c5fd'
  },
  {
    id: 'navy',
    name: 'Тёмно-синий',
    color: '#1e3a8a',
    dark: '#0f172a',
    rgb: '30, 58, 138',
    btnText: '#ffffff',
    btnBorder: 'none',
    readableText: '#1e3a8a',
    marginLine: 'rgba(30, 58, 138, 0.45)',
    darkMarginLine: 'rgba(147, 197, 253, 0.4)',
    sectionBg: '#eff6ff',
    sectionBorder: '#bfdbfe',
    sectionText: '#1e3a8a',
    darkSectionBg: '#172554',
    darkSectionBorder: '#1e40af',
    darkSectionText: '#93c5fd'
  },
  {
    id: 'onyx',
    name: 'Оникс (Почти чёрный)',
    color: '#18181b',
    dark: '#09090b',
    rgb: '24, 24, 27',
    marginLine: 'rgba(24, 24, 27, 0.5)',
    darkMarginLine: 'rgba(161, 161, 170, 0.4)',
    sectionBg: '#f4f4f5',
    sectionBorder: '#d4d4d8',
    sectionText: '#09090b',
    darkSectionBg: '#18181b',
    darkSectionBorder: '#3f3f46',
    darkSectionText: '#f4f4f5'
  },
  {
    id: 'lavender',
    name: 'Нежная лаванда',
    color: '#a78bfa',
    dark: '#581c87',
    rgb: '167, 139, 250',
    marginLine: 'rgba(167, 139, 250, 0.45)',
    darkMarginLine: 'rgba(216, 180, 254, 0.4)',
    sectionBg: '#faf5ff',
    sectionBorder: '#e9d5ff',
    sectionText: '#6b21a8',
    darkSectionBg: '#261536',
    darkSectionBorder: '#4c1d70',
    darkSectionText: '#d8b4fe'
  }
];

const PRIORITY_COLORS = [
  { id: 'burgundy', name: 'Бордовый', color: '#881337', darkColor: '#fb7185' },
  { id: 'red', name: 'Красный', color: '#dc2626', darkColor: '#f87171' },
  { id: 'magenta', name: 'Малиновый', color: '#d83a88', darkColor: '#f472b6' },
  { id: 'purple', name: 'Фиолетовый', color: '#7e22ce', darkColor: '#c084fc' },
  { id: 'blue', name: 'Синий', color: '#2563eb', darkColor: '#60a5fa' },
  { id: 'green', name: 'Изумрудный', color: '#15803d', darkColor: '#4ade80' },
  { id: 'chocolate', name: 'Шоколадный', color: '#78350f', darkColor: '#fbbf24' },
  { id: 'black', name: 'Черный', color: '#0f172a', darkColor: '#f8fafc' }
];

const DEFAULT_SETTINGS = {
  lang: detectSystemLanguage(), // 'ru' | 'uk' | 'en' (auto system detected)
  theme: 'light', // 'light' | 'dark' | 'auto'
  accentColorId: 'magenta',
  fontFamily: "'PT Serif', Georgia, serif",
  fontSize: 14,
  taskFontWeight: 500,
  priorityFontWeight: 900,
  priorityColorId: 'burgundy',
  priorityColor: '#881337',
  notificationsEnabled: false,
  morningNotifEnabled: true,
  morningNotifTime: '09:00',
  eveningNotifEnabled: true,
  eveningNotifTime: '21:00',
  petNotifEnabled: true,
  petNotifTime: '15:00',
  hapticsEnabled: true,
  soundEnabled: true,
  autoBackupEnabled: true,
  lastSync: 'Локально'
};

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

let ACHIEVEMENTS_LIST = buildAchievementsCatalog(detectSystemLanguage());

function getTabColor(colorId) {
  if (!colorId || colorId === 'default') return TAB_COLORS[0];
  const found = TAB_COLORS.find(c => c.id === colorId || c.alias === colorId);
  return found || TAB_COLORS[0];
}

// --- Cloud Cryptography Helper (AES-GCM 256-bit with PBKDF2 key derivation) ---
async function deriveCloudKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function sha256Hex(text) {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function encryptCloudPayload(plainText, password, email) {
  const key = await deriveCloudKey(password, email.toLowerCase().trim());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  );
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const dataB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return JSON.stringify({ iv: ivHex, data: dataB64, v: 1 });
}

async function decryptCloudPayload(cipherJsonStr, password, email) {
  const parsed = JSON.parse(cipherJsonStr);
  const key = await deriveCloudKey(password, email.toLowerCase().trim());
  const ivBytes = new Uint8Array(parsed.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const binaryString = atob(parsed.data);
  const dataBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    dataBytes[i] = binaryString.charCodeAt(i);
  }
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    dataBytes
  );
  return new TextDecoder().decode(decrypted);
}

// =========================================================================
// STICKERS & NOTEBOOK DECOR CATALOG (WebP Assets)
// =========================================================================
const STICKERS_CATALOG = {
  fall: Array.from({ length: 49 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: `fall_${num}`,
      img: `./assets/stickers/fall/fall_${num}.webp`
    };
  }),
  cats: Array.from({ length: 49 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: `cat_${num}`,
      img: `./assets/stickers/cats/cat_${num}.webp`
    };
  }).filter(s => s.id !== 'cat_19'),
  more_cats: Array.from({ length: 49 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: `more_cat_${num}`,
      img: `./assets/stickers/more_cats/more_cat_${num}.webp`
    };
  }),
  flora: Array.from({ length: 64 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: `flora_${num}`,
      img: `./assets/stickers/flora/flora_${num}.webp`
    };
  }),
  fauna: Array.from({ length: 49 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: `fauna_${num}`,
      img: `./assets/stickers/fauna/fauna_${num}.webp`
    };
  }),
  ocean: Array.from({ length: 49 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: `ocean_${num}`,
      img: `./assets/stickers/ocean/ocean_${num}.webp`
    };
  }),
  pigs: Array.from({ length: 49 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: `pig_${num}`,
      img: `./assets/stickers/pigs/pig_${num}.webp`
    };
  })
};

class NotebookApp {
  constructor() {
    window.appInstance = this;
    this._isHydrating = true;
    this.hasDeferredTaskFlag = localStorage.getItem('todo_notebook_flag_defer') === '1';
    this.hasExportedBackupFlag = localStorage.getItem('todo_notebook_flag_backup') === '1';
    this.initCloudSync();

    this.selectedDate = this.getTodayDateString();
    this.tempSelectedDate = this.selectedDate;
    this.displayedCalendarMonth = new Date();

    // Fast synchronous cache from LocalStorage for instant UI paint
    this.dailyTasks = this.loadDailyTasks();
    this.dayHistory = this.loadDayHistory();
    this.achievementsData = this.loadAchievementsData();
    this.activeAchievementFilter = 'all';
    this.watchArchiveCollapsed = false;

    this.settings = this.loadSettings();
    this.tabs = this.loadTabs();
    this.currentTab = this.tabs.length > 0 ? this.tabs[0].id : 'todo';
    this.tasks = this.loadTasks();
    this.rolloverPastUncompletedTasks();
    this.history = this.loadHistory();
    this.stickers = this.loadStickers();
    this.selectedStickerId = null;
    this.activeStickerCategory = 'cats';
    this.tempPhotoData = null;
    this.editingTaskId = null;
    this.toastTimer = null;

    this.initElements();
    this.applyLanguage(this.settings.lang);
    this.applySettings();
    this.initStreakTracker();
    this.updateDateWidget();
    this.checkAchievements(false);
    this.updateTrophyWidgetAura();
    this.initEventListeners();
    this.initLifecycleListeners();
    this.initDragToScroll();
    this.initAutoBackupEngine();
    this.initSections();
    this.initStickersSystem();
    this.renderTabs();
    this.render();
    this.updateWorkloadWidget();
    this.syncWithNativeWidget();
    this.initDayChangeListener();
    this.scheduleSmartDailyNotifications();

    // Initialize Maine Coon Companion (Tamagotchi)
    this.petSystem = new MaineCoonPetSystem(this);
    this.petSystem.init();

    // Start background hydration from Plan4UStorage (Native Device Filesystem & IndexedDB)
    this.hydrateFromStorage();

    // Seamless, jitter-free initial reveal once fonts and DOM are fully calculated
    this.revealAppWhenReady();
  }

  // Hydrate persistent data from Plan4UStorage when LocalStorage is empty/cleared (e.g. after cache wipe)
  async hydrateFromStorage() {
    try {
      await Plan4UStorage.initPromise;

      const hasLocalDaily = localStorage.getItem('todo_notebook_daily_tasks') || localStorage.getItem('plan4u_daily_tasks.json');
      const hasLocalTasks = localStorage.getItem('todo_notebook_tasks') || localStorage.getItem('plan4u_tasks.json');

      // Only restore from disk if LocalStorage had NO data (e.g. WebView cache was cleared by Android)
      if (!hasLocalDaily && !hasLocalTasks) {
        const [
          savedDaily,
          savedTasks,
          savedTabs,
          savedSettings,
          savedSections,
          savedAchievements,
          savedDayHistory,
          savedHistory,
          savedPet,
          savedStickers
        ] = await Promise.all([
          Plan4UStorage.loadFile('daily_tasks.json', null),
          Plan4UStorage.loadFile('tasks.json', null),
          Plan4UStorage.loadFile('tabs.json', null),
          Plan4UStorage.loadFile('settings.json', null),
          Plan4UStorage.loadFile('sections.json', null),
          Plan4UStorage.loadFile('achievements.json', null),
          Plan4UStorage.loadFile('day_history.json', null),
          Plan4UStorage.loadFile('history.json', null),
          Plan4UStorage.loadFile('pet.json', null),
          Plan4UStorage.loadFile('stickers.json', null)
        ]);

        let hasRestored = false;

        if (savedDaily && typeof savedDaily === 'object' && Object.keys(savedDaily).length > 0) {
          this.dailyTasks = savedDaily;
          hasRestored = true;
        }

        if (savedTasks && typeof savedTasks === 'object') {
          if (savedTasks.buy) this.tasks.buy = savedTasks.buy;
          if (savedTasks.watch) this.tasks.watch = savedTasks.watch;
          hasRestored = true;
        }

        const todayStr = this.getTodayDateString();
        const targetDate = this.selectedDate || todayStr;
        if (this.dailyTasks[targetDate]) {
          this.tasks.todo = this.dailyTasks[targetDate];
        }

        if (Array.isArray(savedTabs) && savedTabs.length > 0) {
          this.tabs = savedTabs;
          hasRestored = true;
        }

        if (savedSettings && typeof savedSettings === 'object') {
          this.settings = { ...DEFAULT_SETTINGS, ...savedSettings };
          this.applySettings();
        }

        if (savedSections && typeof savedSections === 'object') {
          this.tabSections = savedSections;
        }

        if (savedAchievements && typeof savedAchievements === 'object') {
          this.achievementsData = savedAchievements;
        }

        if (savedDayHistory && typeof savedDayHistory === 'object') {
          this.dayHistory = savedDayHistory;
        }

        if (savedHistory && typeof savedHistory === 'object') {
          this.history = savedHistory;
        }

        if (savedPet && this.petSystem && typeof this.petSystem.restorePetData === 'function') {
          this.petSystem.restorePetData(savedPet);
        }

        if (savedStickers && typeof savedStickers === 'object') {
          this.stickers = savedStickers;
          this.renderStickers();
        }

        if (hasRestored) {
          this.rolloverPastUncompletedTasks();
          this.saveDailyTasks();
          this.saveTasks();
          this.saveTabs();
          this.saveSettings();
          this.saveStickers();
          this.renderTabs();
          this.render();
          this.updateDateWidget();
          this.updateWorkloadWidget();
          this.syncWithNativeWidget();
        }
      }
    } catch (e) {
      console.warn('Storage hydration error:', e);
    }
  }

  // App Lifecycle Listeners to flush saves immediately on minimize, app switch or pause
  initLifecycleListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushAllSaves();
      } else if (document.visibilityState === 'visible') {
        this.checkMidnightOrWake();
      }
    });

    window.addEventListener('pagehide', () => this.flushAllSaves());
    window.addEventListener('beforeunload', () => this.flushAllSaves());
    window.addEventListener('blur', () => this.flushAllSaves());

    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      try {
        window.Capacitor.Plugins.App.addListener('appStateChange', (state) => {
          if (!state.isActive) {
            this.flushAllSaves();
          } else {
            this.checkMidnightOrWake();
          }
        });
        window.Capacitor.Plugins.App.addListener('pause', () => {
          this.flushAllSaves();
        });
      } catch (e) {
        console.warn('Capacitor App lifecycle listener error:', e);
      }
    }
  }

  // Flush all in-memory changes to LocalStorage, IndexedDB and Native Filesystem
  flushAllSaves() {
    try {
      if (this._isHydrating) return;
      this.flushSaveTasks();
      this.saveDailyTasks();
      this.saveDayHistory();
      this.saveSettings();
      this.saveTabs();
      this.saveAchievementsData();
      this.saveHistory();
      this.saveStickers();
      if (this.tabSections && window.Plan4UStorage) {
        Plan4UStorage.saveFile('sections.json', this.tabSections);
      }
      if (this.petSystem && typeof this.petSystem.savePetData === 'function') {
        this.petSystem.savePetData();
      }
    } catch (e) {
      console.warn('Flush all saves error:', e);
    }
  }

  // Check if date changed when app is resumed from background
  checkMidnightOrWake() {
    const todayStr = this.getTodayDateString();
    if (this.selectedDate !== todayStr) {
      this.saveTasks();
      this.selectedDate = todayStr;
      this.tempSelectedDate = todayStr;
      this.initStreakTracker();
      this.rolloverPastUncompletedTasks();
      if (!this.dailyTasks[todayStr]) {
        this.dailyTasks[todayStr] = [];
      }
      this.tasks.todo = this.dailyTasks[todayStr];
      this.updateDateWidget();
      this.renderTabs();
      this.render();
      this.renderStickers();
      this.updateWorkloadWidget();
      this.syncWithNativeWidget();
    }
  }

  // Smoothly reveal the fully initialized application
  revealAppWhenReady() {
    const reveal = () => {
      requestAnimationFrame(() => {
        document.body.classList.remove('app-booting');
        document.body.classList.add('app-ready');
        setTimeout(() => {
          document.body.classList.remove('preload-no-transitions');
        }, 100);
      });
    };

    if (document.fonts && document.fonts.ready) {
      Promise.race([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 120))
      ]).then(reveal).catch(reveal);
    } else {
      setTimeout(reveal, 50);
    }
  }

  // Automatic Day Transition Listener (Midnight rollover & app wake from sleep)
  initDayChangeListener() {
    let lastCheckedDate = this.getTodayDateString();

    const checkNewDay = () => {
      const todayStr = this.getTodayDateString();
      if (todayStr !== lastCheckedDate) {
        this.saveTasks();
        lastCheckedDate = todayStr;
        this.selectedDate = todayStr;
        this.tempSelectedDate = todayStr;
        this.initStreakTracker();
        this.rolloverPastUncompletedTasks();
        if (!this.dailyTasks[todayStr]) {
          this.dailyTasks[todayStr] = [];
        }
        this.tasks.todo = this.dailyTasks[todayStr];
        this.updateDateWidget();
        this.renderTabs();
        this.render();
        this.renderStickers();
        this.updateWorkloadWidget();
        this.syncWithNativeWidget();
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkNewDay();
      }
    });

    setInterval(checkNewDay, 30000);
  }

  // Load app settings
  loadSettings() {
    try {
      const saved = localStorage.getItem('todo_notebook_app_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not load settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings() {
    try {
      localStorage.setItem('todo_notebook_app_settings', JSON.stringify(this.settings));
      Plan4UStorage.saveFile('settings.json', this.settings);
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  }

  // Load autocomplete history from LocalStorage & Plan4UStorage
  loadHistory() {
    try {
      const saved = localStorage.getItem('plan4u_history.json') || localStorage.getItem('todo_notebook_autocomplete_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load autocomplete history:', e);
    }
    return {
      buy_items: [],
      buy_places: [],
      todo_items: [],
      watch_items: []
    };
  }

  saveHistory() {
    try {
      localStorage.setItem('todo_notebook_autocomplete_history', JSON.stringify(this.history));
      Plan4UStorage.saveFile('history.json', this.history);
    } catch (e) {
      console.warn('Could not save autocomplete history:', e);
    }
  }

  recordHistory(tabId, text, place = '', watchType = '') {
    if (!text) return;
    const cleanText = text.trim();
    if (!cleanText) return;

    if (tabId === 'buy') {
      if (!this.history.buy_items) this.history.buy_items = [];
      let item = this.history.buy_items.find(i => i.text.toLowerCase() === cleanText.toLowerCase());
      if (item) {
        item.count = (item.count || 1) + 1;
        if (place) item.place = place.trim();
      } else {
        this.history.buy_items.unshift({ text: cleanText, place: place ? place.trim() : '', icon: '🛍️', count: 1 });
      }

      if (place && place.trim()) {
        const cleanPlace = place.trim();
        if (!this.history.buy_places) this.history.buy_places = [];
        let p = this.history.buy_places.find(pl => pl.text.toLowerCase() === cleanPlace.toLowerCase());
        if (p) {
          p.count = (p.count || 1) + 1;
        } else {
          this.history.buy_places.unshift({ text: cleanPlace, icon: '🏪', count: 1 });
        }
      }
    } else if (tabId === 'todo') {
      if (!this.history.todo_items) this.history.todo_items = [];
      let item = this.history.todo_items.find(i => i.text.toLowerCase() === cleanText.toLowerCase());
      if (item) {
        item.count = (item.count || 1) + 1;
      } else {
        this.history.todo_items.unshift({ text: cleanText, icon: '⚡', count: 1 });
      }
    } else if (tabId === 'watch') {
      if (!this.history.watch_items) this.history.watch_items = [];
      let item = this.history.watch_items.find(i => i.text.toLowerCase() === cleanText.toLowerCase());
      if (item) {
        item.count = (item.count || 1) + 1;
        if (watchType) item.type = watchType;
      } else {
        this.history.watch_items.unshift({ text: cleanText, icon: watchType === 'Сериал' ? '📺' : '🎬', type: watchType, count: 1 });
      }
    }
    this.saveHistory();
  }

  // Track daily visit streaks (requires opening app at least once every 24h)
  initStreakTracker() {
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    let streakData = { count: 1, lastVisitDate: todayStr, bestStreak: 1 };
    try {
      const saved = localStorage.getItem('todo_notebook_daily_streak');
      if (saved) {
        streakData = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read streak data:', e);
    }

    if (!streakData.lastVisitDate) {
      streakData.lastVisitDate = todayStr;
      streakData.count = streakData.count || 1;
      streakData.bestStreak = streakData.bestStreak || streakData.count;
    } else if (streakData.lastVisitDate !== todayStr) {
      // Calculate day difference
      const lastDate = new Date(streakData.lastVisitDate + 'T00:00:00');
      const currDate = new Date(todayStr + 'T00:00:00');
      const diffMs = currDate - lastDate;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Visited yesterday -> continuous streak continues!
        streakData.count = (streakData.count || 0) + 1;
        streakData.lastVisitDate = todayStr;
        streakData.bestStreak = Math.max(streakData.bestStreak || 0, streakData.count);
      } else if (diffDays > 1) {
        // Missed at least 1 day -> streak reset to 1
        streakData.count = 1;
        streakData.lastVisitDate = todayStr;
      }
    }

    try {
      localStorage.setItem('todo_notebook_daily_streak', JSON.stringify(streakData));
    } catch (e) { }

    this.streakData = streakData;
    this.updateStreakWidget();
  }

  updateStreakWidget() {
    const streakNumEl = document.querySelector('.widget-streak-num');
    if (streakNumEl && this.streakData) {
      streakNumEl.textContent = this.streakData.count;
    }
    if (this.widgetStreak && this.streakData) {
      const daysWord = this.getDaysWord(this.streakData.count);
      this.widgetStreak.title = `Беспрерывная серия: ${this.streakData.count} ${daysWord} (Рекорд: ${this.streakData.bestStreak}). Заходите каждый день, чтобы серия продолжалась!`;
    }
  }

  getDaysWord(num) {
    const lang = this.settings.lang || 'ru';
    if (lang === 'en') return num === 1 ? 'day' : 'days';
    if (lang === 'uk') {
      const n = Math.abs(num) % 100;
      const n1 = n % 10;
      if (n > 10 && n < 20) return 'днів';
      if (n1 > 1 && n1 < 5) return 'дні';
      if (n1 === 1) return 'день';
      return 'днів';
    }
    const n = Math.abs(num) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return 'дней';
    if (n1 > 1 && n1 < 5) return 'дня';
    if (n1 === 1) return 'день';
    return 'дней';
  }

  // Helper for today's date string YYYY-MM-DD
  getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatDateTitle(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const lang = this.settings.lang || 'ru';
    const dict = I18N[lang] || I18N.ru;
    const days = dict.weekdays;
    const months = dict.monthsGenitive;
    if (lang === 'en') {
      return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()} (${days[dateObj.getDay()]})`;
    }
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} (${days[dateObj.getDay()]})`;
  }

  // Load daily tasks dictionary: { [YYYY-MM-DD]: [ ...tasks... ] }
  loadDailyTasks() {
    let daily = null;
    try {
      const saved = localStorage.getItem('todo_notebook_daily_tasks') || localStorage.getItem('plan4u_daily_tasks.json');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        daily = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load daily tasks:', e);
    }
    if (!daily || typeof daily !== 'object' || Array.isArray(daily)) {
      daily = {};
    }
    const today = this.getTodayDateString();
    if (!daily[today]) {
      daily[today] = [];
    }
    return daily;
  }

  saveDailyTasks() {
    try {
      if (!this.dailyTasks || typeof this.dailyTasks !== 'object') return;
      const dailyJson = JSON.stringify(this.dailyTasks);
      localStorage.setItem('todo_notebook_daily_tasks', dailyJson);
      localStorage.setItem('plan4u_daily_tasks.json', dailyJson);
      Plan4UStorage.saveFile('daily_tasks.json', this.dailyTasks);
      this.triggerBackgroundBackup?.();
    } catch (e) {
      console.warn('Could not save daily tasks:', e);
    }
  }

  // Load completed tasks history dictionary: { [YYYY-MM-DD]: [ { id, tabId, text, completedAt, ... } ] }
  loadDayHistory() {
    try {
      const saved = localStorage.getItem('plan4u_day_history.json') || localStorage.getItem('todo_notebook_day_history');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load day history:', e);
    }
    return {};
  }

  saveDayHistory() {
    try {
      if (!this.dayHistory || typeof this.dayHistory !== 'object') return;
      localStorage.setItem('todo_notebook_day_history', JSON.stringify(this.dayHistory));
      Plan4UStorage.saveFile('day_history.json', this.dayHistory);
      this.triggerBackgroundBackup?.();
    } catch (e) {
      console.warn('Could not save day history:', e);
    }
  }

  // Carry over uncompleted tasks from past days to today, keeping completed tasks archived in past days
  rolloverPastUncompletedTasks() {
    if (!this.dailyTasks || typeof this.dailyTasks !== 'object') return;
    const todayStr = this.getTodayDateString();
    let changed = false;

    if (!this.dailyTasks[todayStr]) {
      this.dailyTasks[todayStr] = [];
    }

    // Build set of task IDs belonging to other non-todo tabs to ensure total isolation
    const nonTodoTaskIds = new Set();
    if (this.tasks && typeof this.tasks === 'object') {
      for (const tabKey in this.tasks) {
        if (tabKey !== 'todo' && Array.isArray(this.tasks[tabKey])) {
          this.tasks[tabKey].forEach(t => {
            if (t && t.id) nonTodoTaskIds.add(String(t.id));
          });
        }
      }
    }

    // 0. Recover any completed tasks from dayHistory ONLY for the 'todo' tab
    if (this.dayHistory && typeof this.dayHistory === 'object') {
      for (const d in this.dayHistory) {
        if (d < todayStr && Array.isArray(this.dayHistory[d])) {
          if (!this.dailyTasks[d]) this.dailyTasks[d] = [];
          this.dayHistory[d].forEach(hItem => {
            if (!hItem || !hItem.text) return;
            // Never recover tasks from other tabs (custom tabs, buy, watch, etc.) into the daily todo archive!
            if (hItem.tabId && hItem.tabId !== 'todo') return;
            if (nonTodoTaskIds.has(String(hItem.id))) return;

            const exists = this.dailyTasks[d].some(t => String(t.id) === String(hItem.id) || (t.text === hItem.text && t.completed));
            if (!exists) {
              this.dailyTasks[d].push({
                id: hItem.id || generateTaskId(),
                text: hItem.text,
                section: hItem.place || hItem.period || 'personal',
                completed: true,
                date: d
              });
              changed = true;
            }
          });
        }
      }
    }

    // Clean up any tasks from dailyTasks that actually belong to other perpetual/custom tabs
    if (nonTodoTaskIds.size > 0 && this.dailyTasks) {
      for (const d in this.dailyTasks) {
        if (Array.isArray(this.dailyTasks[d])) {
          const initLen = this.dailyTasks[d].length;
          this.dailyTasks[d] = this.dailyTasks[d].filter(t => !nonTodoTaskIds.has(String(t.id)));
          if (this.dailyTasks[d].length !== initLen) {
            changed = true;
          }
        }
      }
    }

    const pastDateKeys = Object.keys(this.dailyTasks).filter(d => d < todayStr).sort();

    // 1. Rollover uncompleted tasks from past days into today, leaving completed tasks in past archives
    pastDateKeys.forEach(pastDate => {
      const pastList = this.dailyTasks[pastDate] || [];
      if (!Array.isArray(pastList) || pastList.length === 0) return;

      const uncompleted = pastList.filter(t => !t.completed && !t.isEmpty && t.text && t.text.trim());
      const completed = pastList.filter(t => t.completed && !t.isEmpty && t.text && t.text.trim());

      if (uncompleted.length > 0) {
        // Move uncompleted tasks to today, resetting completed flag to false
        uncompleted.forEach(origTask => {
          const alreadyInToday = this.dailyTasks[todayStr].some(t => String(t.id) === String(origTask.id) || (t.text === origTask.text && t.section === origTask.section));
          if (!alreadyInToday) {
            const rolledTask = {
              ...origTask,
              date: todayStr,
              completed: false
            };
            this.dailyTasks[todayStr].push(rolledTask);
          }
        });

        // Leave only completed tasks in the past day
        this.dailyTasks[pastDate] = completed;
        changed = true;
      }
    });

    // 2. Clean up any completed tasks from past days that might have leaked into today as completed
    const pastCompletedMap = new Map();
    pastDateKeys.forEach(pastDate => {
      const pList = this.dailyTasks[pastDate] || [];
      pList.forEach(t => {
        if (t.completed && t.text && t.text.trim()) {
          pastCompletedMap.set(`${t.text.trim()}___${t.section || ''}`, true);
        }
      });
    });

    if (this.dailyTasks[todayStr].length > 0) {
      const initialLen = this.dailyTasks[todayStr].length;
      this.dailyTasks[todayStr] = this.dailyTasks[todayStr].filter(t => {
        if (t.completed && pastCompletedMap.has(`${(t.text || '').trim()}___${t.section || ''}`)) {
          return false;
        }
        return true;
      });
      if (this.dailyTasks[todayStr].length !== initialLen) {
        changed = true;
      }
    }

    if (changed) {
      if ((this.selectedDate || todayStr) === todayStr && this.tasks) {
        this.tasks.todo = this.dailyTasks[todayStr];
      }
      this.saveDailyTasks();
      this.flushSaveTasks();
    }
  }

  // Update date widget: highlight in accent color if not today
  updateDateWidget() {
    const todayStr = this.getTodayDateString();
    const isToday = this.selectedDate === todayStr;

    const [y, m, d] = (this.selectedDate || todayStr).split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const lang = this.settings.lang || 'ru';
    const dict = I18N[lang] || I18N.ru;

    const daysShort = dict.weekdaysShort || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const months = dict.monthsGenitive || ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    const dateNum = dateObj.getDate();
    // Monday is 0
    const dayOfWeekIndex = (dateObj.getDay() + 6) % 7;
    const dayName = daysShort[dayOfWeekIndex].toLowerCase();

    const numEl = document.querySelector('.widget-date-num');
    const dayEl = document.querySelector('.widget-date-day');
    if (numEl) numEl.textContent = dateNum;
    if (dayEl) dayEl.textContent = dayName;

    if (this.widgetDate) {
      this.widgetDate.classList.toggle('is-custom-date', !isToday);
      if (isToday) {
        this.widgetDate.title = `${dict.today}: ${dateNum} ${months[dateObj.getMonth()]} (${dayName.toUpperCase()})`;
      } else {
        this.widgetDate.title = `${dict.selectedDay}: ${dateNum} ${months[dateObj.getMonth()]} (${dayName.toUpperCase()})`;
      }
    }
  }

  // Load tabs from LocalStorage & Plan4UStorage
  loadTabs() {
    try {
      const saved = localStorage.getItem('plan4u_tabs.json') || localStorage.getItem('todo_notebook_tab_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.forEach(tab => {
          if (!tab.colorId) {
            if (tab.id === 'buy') tab.colorId = 'orange';
            else if (tab.id === 'watch') tab.colorId = 'purple';
            else tab.colorId = 'default';
          }
        });
        return parsed;
      }
    } catch (e) {
      console.warn('Could not load tab list:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_TABS));
  }

  // Save tabs to LocalStorage & Plan4UStorage
  saveTabs() {
    try {
      localStorage.setItem('todo_notebook_tab_list', JSON.stringify(this.tabs));
      Plan4UStorage.saveFile('tabs.json', this.tabs);
      this.triggerBackgroundBackup?.();
      this.scheduleCloudSync?.();
    } catch (e) {
      console.warn('Could not save tab list:', e);
    }
  }

  // Load tasks from LocalStorage & Plan4UStorage
  loadTasks() {
    let persistentTasks = {};
    try {
      const saved = localStorage.getItem('todo_notebook_tasks') || localStorage.getItem('plan4u_tasks.json');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        persistentTasks = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load tasks:', e);
    }

    if (!persistentTasks || typeof persistentTasks !== 'object' || Array.isArray(persistentTasks)) {
      persistentTasks = {};
    }

    if (!persistentTasks.buy) persistentTasks.buy = JSON.parse(JSON.stringify(INITIAL_TASKS.buy));
    if (!persistentTasks.watch) persistentTasks.watch = JSON.parse(JSON.stringify(INITIAL_TASKS.watch));

    const todayStr = this.getTodayDateString();
    const targetDate = this.selectedDate || todayStr;

    if (!this.dailyTasks || typeof this.dailyTasks !== 'object') {
      this.dailyTasks = {};
    }

    // Daily todo tasks for selected date
    if (this.dailyTasks[targetDate] && Array.isArray(this.dailyTasks[targetDate])) {
      persistentTasks.todo = this.dailyTasks[targetDate];
    } else {
      const allDailyKeys = Object.keys(this.dailyTasks);
      if (allDailyKeys.length === 0 && (!persistentTasks.todo || persistentTasks.todo.length === 0)) {
        this.dailyTasks[targetDate] = JSON.parse(JSON.stringify(INITIAL_TASKS.todo || []));
      } else {
        this.dailyTasks[targetDate] = [];
      }
      persistentTasks.todo = this.dailyTasks[targetDate];
    }

    return persistentTasks;
  }

  // Instant synchronous save to LocalStorage, Plan4UStorage and native widgets
  saveTasks() {
    if (!this.tasks || typeof this.tasks !== 'object') return;
    const todayStr = this.getTodayDateString();
    const targetDate = this.selectedDate || todayStr;
    // Only save this.tasks.todo to dailyTasks for today or future dates (past dates are read-only archive!)
    if (this.dailyTasks && this.tasks.todo && targetDate >= todayStr) {
      this.dailyTasks[targetDate] = this.tasks.todo;
    }
    this.flushSaveTasks();
  }

  flushSaveTasks() {
    clearTimeout(this._saveTasksDebounceTimer);
    try {
      if (!this.tasks || typeof this.tasks !== 'object') return;
      const todayStr = this.getTodayDateString();
      const targetDate = this.selectedDate || todayStr;

      // Ensure dailyTasks for selectedDate is strictly in sync with tasks.todo if today or future
      if (this.dailyTasks && this.tasks.todo && targetDate >= todayStr) {
        this.dailyTasks[targetDate] = this.tasks.todo;
        this.saveDailyTasks();
      }

      const tasksJson = JSON.stringify(this.tasks);
      try {
        localStorage.setItem('todo_notebook_tasks', tasksJson);
        localStorage.setItem('plan4u_tasks.json', tasksJson);
      } catch (lsErr) {
        console.warn('LocalStorage quota warning:', lsErr);
      }
      Plan4UStorage.saveFile('tasks.json', this.tasks);
      this.triggerBackgroundBackup?.();
      this.scheduleCloudSync?.();
      this.syncWithNativeWidget?.();
    } catch (e) {
      console.warn('Could not save tasks:', e);
    }
  }

  // Sync today's tasks with Android Home Screen Widget
  syncWithNativeWidget() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.WidgetBridge) {
        const currentTasks = (this.tasks && this.tasks.todo) ? this.tasks.todo : [];
        window.Capacitor.Plugins.WidgetBridge.updateWidgetData({
          tasksJson: JSON.stringify(currentTasks),
          dateStr: this.selectedDate || this.getTodayDateString()
        });
      }
    } catch (e) {
      console.warn('Widget sync error:', e);
    }
  }

  // Initialize DOM elements
  initElements() {
    this.folderTabsBar = document.getElementById('folderTabsBar');
    this.addTabBtn = document.getElementById('addTabBtn');
    this.contentContainer = document.getElementById('notebookContent');
    this.fabBtn = document.getElementById('fabAddBtn');

    // Add Task Modal elements
    this.taskModalBackdrop = document.getElementById('taskModalBackdrop');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
    this.modalCancelBtn = document.getElementById('modalCancelBtn');
    this.modalSubmitBtn = document.getElementById('modalSubmitBtn');
    this.newTaskForm = document.getElementById('newTaskForm');
    this.dynamicFormFields = document.getElementById('dynamicFormFields');

    // Add Tab Modal elements
    this.newTabModalBackdrop = document.getElementById('newTabModalBackdrop');
    this.newTabCloseBtn = document.getElementById('newTabCloseBtn');
    this.newTabCancelBtn = document.getElementById('newTabCancelBtn');
    this.newTabSubmitBtn = document.getElementById('newTabSubmitBtn');
    this.newTabForm = document.getElementById('newTabForm');
    this.newTabNameInput = document.getElementById('newTabNameInput');

    // Edit Tab Modal elements (Long Press)
    this.editTabModalBackdrop = document.getElementById('editTabModalBackdrop');
    this.editTabCloseBtn = document.getElementById('editTabCloseBtn');
    this.editTabCancelBtn = document.getElementById('editTabCancelBtn');
    this.editTabSubmitBtn = document.getElementById('editTabSubmitBtn');
    this.editTabForm = document.getElementById('editTabForm');
    this.editTabId = document.getElementById('editTabId');
    this.editTabTitleInput = document.getElementById('editTabTitleInput');
    this.tabColorPicker = document.getElementById('tabColorPicker');
    this.tabPatternSelector = document.getElementById('tabPatternSelector');
    this.tabPatternSizeRange = document.getElementById('tabPatternSizeRange');
    this.patternSizeVal = document.getElementById('patternSizeVal');
    this.patternSizeGroup = document.getElementById('patternSizeGroup');
    this.btnTabMoveLeft = document.getElementById('btnTabMoveLeft');
    this.btnTabMoveRight = document.getElementById('btnTabMoveRight');
    this.deleteTabGroup = document.getElementById('deleteTabGroup');
    this.btnDeleteTab = document.getElementById('btnDeleteTab');

    // Lightbox
    this.imageLightboxBackdrop = document.getElementById('imageLightboxBackdrop');
    this.lightboxImg = document.getElementById('lightboxImg');
    this.lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

    // Settings Modal elements
    this.settingsModalBackdrop = document.getElementById('settingsModalBackdrop');
    this.settingsCloseBtn = document.getElementById('settingsCloseBtn');
    this.settingsDoneBtn = document.getElementById('settingsDoneBtn');
    this.themeSelector = document.getElementById('themeSelector');
    this.accentColorPicker = document.getElementById('accentColorPicker');
    // Lightbox Modal Listeners
    if (this.imageLightboxBackdrop) {
      let startedOnLb = false;
      this.imageLightboxBackdrop.addEventListener('pointerdown', (e) => {
        startedOnLb = (e.target === this.imageLightboxBackdrop || e.target === this.lightboxCloseBtn || (e.target.classList && e.target.classList.contains('lightbox-content')));
      });
      this.imageLightboxBackdrop.addEventListener('click', (e) => {
        if (Date.now() - (this._lightboxOpenedAt || 0) < 300) return;
        if (startedOnLb && (e.target === this.imageLightboxBackdrop || e.target === this.lightboxCloseBtn || (e.target.classList && e.target.classList.contains('lightbox-content')))) {
          this.closeLightbox();
        }
        startedOnLb = false;
      });
    }
    this.fontFamilySelect = document.getElementById('fontFamilySelect');
    this.fontSizeRange = document.getElementById('fontSizeRange');
    this.fontSizeVal = document.getElementById('fontSizeVal');
    this.taskWeightRange = document.getElementById('taskWeightRange');
    this.taskWeightVal = document.getElementById('taskWeightVal');
    this.priorityWeightRange = document.getElementById('priorityWeightRange');
    this.priorityWeightVal = document.getElementById('priorityWeightVal');
    this.priorityColorPalette = document.getElementById('priorityColorPalette');
    this.previewRegularText = document.getElementById('previewRegularText');
    this.previewPriorityText = document.getElementById('previewPriorityText');
    this.fontPreviewBox = document.getElementById('fontPreviewBox');
    this.toggleNotifications = document.getElementById('toggleNotifications');
    this.toggleMorningNotif = document.getElementById('toggleMorningNotif');
    this.morningNotifTime = document.getElementById('morningNotifTime');
    this.toggleEveningNotif = document.getElementById('toggleEveningNotif');
    this.eveningNotifTime = document.getElementById('eveningNotifTime');
    this.togglePetNotif = document.getElementById('togglePetNotif');
    this.toggleHaptics = document.getElementById('toggleHaptics');
    this.toggleSound = document.getElementById('toggleSound');
    this.btnTestNotification = document.getElementById('btnTestNotification');

    // Google Drive & Backup DOM Elements
    this.cloudSyncCard = document.getElementById('cloudSyncCard');
    this.cloudStatusBadge = document.getElementById('cloudStatusBadge');
    this.cloudLastSyncText = document.getElementById('cloudLastSyncText');
    this.btnSaveToGoogleDrive = document.getElementById('btnSaveToGoogleDrive');
    this.btnDownloadLocalBackup = document.getElementById('btnDownloadLocalBackup');
    this.importBackupFile = document.getElementById('importBackupFile');

    // Calendar Modal elements
    this.calendarModalBackdrop = document.getElementById('calendarModalBackdrop');
    this.calendarCloseBtn = document.getElementById('calendarCloseBtn');
    this.calendarPrevMonth = document.getElementById('calendarPrevMonth');
    this.calendarNextMonth = document.getElementById('calendarNextMonth');
    this.calendarMonthTitle = document.getElementById('calendarMonthTitle');
    this.calendarDaysGrid = document.getElementById('calendarDaysGrid');
    this.calendarDateInfo = document.getElementById('calendarDateInfo');
    this.calendarInfoDate = document.getElementById('calendarInfoDate');
    this.calendarInfoBadge = document.getElementById('calendarInfoBadge');
    this.calendarInfoStats = document.getElementById('calendarInfoStats');
    this.calendarTodayBtn = document.getElementById('calendarTodayBtn');
    this.calendarSelectBtn = document.getElementById('calendarSelectBtn');

    // Achievements Modal elements
    this.achievementsModalBackdrop = document.getElementById('achievementsModalBackdrop');
    this.achievementsCloseBtn = document.getElementById('achievementsCloseBtn');
    this.achievementsUnlockedCount = document.getElementById('achievementsUnlockedCount');
    this.achievementsProgressBarFill = document.getElementById('achievementsProgressBarFill');
    this.achievementsProgressPercent = document.getElementById('achievementsProgressPercent');
    this.achievementsFilterTabs = document.getElementById('achievementsFilterTabs');
    this.achievementsSearchInput = document.getElementById('achievementsSearchInput');
    this.achievementsGrid = document.getElementById('achievementsGrid');

    // In-App Confirmation Modal
    this.confirmModalBackdrop = document.getElementById('confirmModalBackdrop');
    this.confirmModalIcon = document.getElementById('confirmModalIcon');
    this.confirmModalTitle = document.getElementById('confirmModalTitle');
    this.confirmModalMessage = document.getElementById('confirmModalMessage');
    this.confirmModalCancelBtn = document.getElementById('confirmModalCancelBtn');
    this.confirmModalApproveBtn = document.getElementById('confirmModalApproveBtn');
    this.pendingConfirmCallback = null;

    // Widgets
    this.widgetDate = document.getElementById('widgetDate');
    this.widgetTimer = document.getElementById('widgetTimer');
    this.widgetStreak = document.getElementById('widgetStreak');
    this.widgetMedal = document.getElementById('widgetMedal');
    this.widgetSettings = document.getElementById('widgetSettings');

    // Section Modals
    this.newSectionModalBackdrop = document.getElementById('newSectionModalBackdrop');
    this.newSectionCloseBtn = document.getElementById('newSectionCloseBtn');
    this.newSectionCancelBtn = document.getElementById('newSectionCancelBtn');
    this.newSectionSubmitBtn = document.getElementById('newSectionSubmitBtn');
    this.newSectionForm = document.getElementById('newSectionForm');
    this.newSectionNameInput = document.getElementById('newSectionNameInput');
    this.newSectionEmojiPicker = document.getElementById('newSectionEmojiPicker');

    this.sectionMenuModalBackdrop = document.getElementById('sectionMenuModalBackdrop');
    this.sectionMenuCloseBtn = document.getElementById('sectionMenuCloseBtn');
    this.secMenuRenameBtn = document.getElementById('secMenuRenameBtn');
    this.secMenuMoveUpBtn = document.getElementById('secMenuMoveUpBtn');
    this.secMenuDeleteBtn = document.getElementById('secMenuDeleteBtn');

    // Stickers System DOM Elements
    this.notebookStickersLayer = document.getElementById('notebookStickersLayer');
    this.fabStickersBtn = document.getElementById('fabStickersBtn');
    this.stickersModalBackdrop = document.getElementById('stickersModalBackdrop');
    this.stickersModalSheet = document.getElementById('stickersModalSheet');
    this.stickersCloseBtn = document.getElementById('stickersCloseBtn');
    this.stickersCategoriesBar = document.getElementById('stickersCategoriesBar');
    this.stickersGridContainer = document.getElementById('stickersGridContainer');
    this.stickerContextPopup = document.getElementById('stickerContextPopup');
    this.btnStickerMove = document.getElementById('btnStickerMove');
    this.btnStickerRotate = document.getElementById('btnStickerRotate');
    this.btnStickerBigger = document.getElementById('btnStickerBigger');
    this.btnStickerSmaller = document.getElementById('btnStickerSmaller');
    this.btnStickerDelete = document.getElementById('btnStickerDelete');

    this.initContentDelegation();
  }

  // Centralized high-performance event delegation for task content
  initContentDelegation() {
    if (!this.contentContainer || this.contentContainer._delegatedBound) return;
    this.contentContainer._delegatedBound = true;

    this.contentContainer.addEventListener('click', (e) => {
      // 1. Swipe action buttons
      const swipeBtn = e.target.closest('.swipe-action-btn');
      if (swipeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = swipeBtn.closest('.task-row-wrapper');
        const taskId = wrapper ? wrapper.dataset.id : swipeBtn.dataset.id;
        const action = swipeBtn.dataset.action;
        if (action === 'delete') {
          triggerHaptic([15, 30, 15]);
          this.deleteTask(taskId, e);
        } else if (action === 'edit') {
          triggerHaptic(20);
          this.openEditTaskModal(taskId);
        } else if (action === 'defer') {
          this.deferTask(taskId);
        } else if (action === 'move-up') {
          this.moveTaskOrder(taskId, 'up');
        } else if (action === 'move-down') {
          this.moveTaskOrder(taskId, 'down');
        }
        return;
      }

      // 2. Checkbox click
      const checkbox = e.target.closest('.task-checkbox');
      if (checkbox) {
        e.preventDefault();
        e.stopPropagation();
        const row = checkbox.closest('.task-row') || checkbox.closest('.task-row-wrapper');
        const taskId = row ? row.dataset.id : null;
        if (taskId) {
          triggerHaptic(15);
          this.toggleTask(taskId);
        }
        return;
      }

      // 3. Attached photo button click
      const photoBtn = e.target.closest('.task-attached-photo-btn');
      if (photoBtn) {
        e.preventDefault();
        e.stopPropagation();
        const row = photoBtn.closest('.task-row') || photoBtn.closest('.task-row-wrapper');
        const taskId = row ? row.dataset.id : null;
        if (taskId) {
          this.openPhotoForTask(taskId);
        }
        return;
      }

      // 4. Blank slot delete button click
      const blankDelBtn = e.target.closest('.blank-slot-delete-btn');
      if (blankDelBtn) {
        e.preventDefault();
        e.stopPropagation();
        const taskId = blankDelBtn.dataset.taskId;
        const sectionId = blankDelBtn.closest('.section-tasks-list')?.dataset?.section;
        if (taskId) {
          this.deleteBlankTask(taskId, sectionId);
        }
        return;
      }

      // Section header clicks removed - only long-press is supported
    });

    // Direct Robust Listener for Floating Return to Today Button
    const triggerReturnToday = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      triggerHaptic([30, 45]);
      const todayStr = this.getTodayDateString();
      this.selectedDate = todayStr;
      this.tempSelectedDate = todayStr;
      this.syncSelectedDate();
      const lang = this.settings?.lang || 'ru';
      const msg = lang === 'en' ? 'Back to Today! ✨' : (lang === 'uk' ? 'Ви повернулися до Сьогодні! ✨' : 'Вы вернулись в Сегодня! ✨');
      this.showToast(msg, '📅');
    };

    const returnBtn = document.getElementById('pastDayReturnBtn');
    if (returnBtn) {
      returnBtn.addEventListener('click', triggerReturnToday);
      returnBtn.addEventListener('touchend', triggerReturnToday);
    }
    const returnWrapper = document.getElementById('pastDayReturnWrapper');
    if (returnWrapper) {
      returnWrapper.addEventListener('click', triggerReturnToday);
    }
  }

  // Dismiss keyboard/focus from text inputs
  dismissActiveKeyboard() {
    try {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    } catch (e) { }
  }

  // Bind event listeners
  initEventListeners() {
    // Automatically dismiss keyboard/focus from text inputs when any modal, sheet or submenu opens
    const modalBackdrops = document.querySelectorAll('.modal-backdrop, .pet-modal-overlay');
    modalBackdrops.forEach(backdrop => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'class' && backdrop.classList.contains('open')) {
            this.dismissActiveKeyboard();
          }
        });
      });
      observer.observe(backdrop, { attributes: true, attributeFilter: ['class'] });
    });

    // Lifecycle listeners to guarantee zero data loss when leaving or minimizing app
    const flushAllData = () => {
      this.flushSaveTasks();
      this.saveDailyTasks();
      this.saveDayHistory();
      this.saveAchievementsData();
      this.saveSettings();
    };

    window.addEventListener('beforeunload', flushAllData);
    window.addEventListener('pagehide', flushAllData);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushAllData();
      }
    });

    // Also blur active input when tapping interactive widgets, buttons, or sheet actions
    document.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.widget-circle, .folder-tab, .add-tab-btn, .fab-button, .notebook-pet-anchor, .section-header-btn, .btn-primary-block, .btn-secondary-block, .modal-backdrop, .modal-sheet')) {
        this.dismissActiveKeyboard();
      }
    }, { capture: true, passive: true });

    // Lightbox listeners
    if (this.lightboxCloseBtn) {
      this.lightboxCloseBtn.addEventListener('click', () => this.closeLightbox());
    }
    if (this.imageLightboxBackdrop) {
      this.imageLightboxBackdrop.addEventListener('click', (e) => {
        if (e.target === this.imageLightboxBackdrop || e.target === this.lightboxCloseBtn || e.target.classList.contains('lightbox-content')) {
          this.closeLightbox();
        }
      });
    }

    // Open FAB modal (Now creates a new block/section!)
    if (this.fabBtn) {
      this.fabBtn.addEventListener('click', () => {
        this.openAddSectionModal();
      });
    }

    // Helper to ensure backdrop clicks only trigger when the user actually pressed down ON the backdrop,
    // preventing accidental modal dismissal when virtual keyboard collapses or viewport shifts during input blur.
    const bindSafeBackdrop = (backdropEl, closeFn, getOpenedAt) => {
      if (!backdropEl) return;
      let startedOnBackdrop = false;
      backdropEl.addEventListener('pointerdown', (e) => {
        startedOnBackdrop = (e.target === backdropEl);
      });
      backdropEl.addEventListener('click', (e) => {
        if (getOpenedAt && (Date.now() - (getOpenedAt() || 0) < 400)) return;
        if (startedOnBackdrop && e.target === backdropEl) {
          closeFn(e);
        }
        startedOnBackdrop = false;
      });
    };

    // Helper for bulletproof form submit on mobile devices (prevents keyboard jump from cancelling submit)
    const bindReliableSubmit = (formEl, submitBtn, submitHandler) => {
      let isSubmitting = false;
      const runSubmit = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (isSubmitting) return;
        isSubmitting = true;
        setTimeout(() => { isSubmitting = false; }, 350);
        submitHandler();
      };

      if (formEl) {
        formEl.addEventListener('submit', runSubmit);
      }

      if (submitBtn) {
        submitBtn.addEventListener('pointerdown', (e) => {
          e.preventDefault(); // Prevents input blur from jumping viewport before action completes
        });
        submitBtn.addEventListener('click', runSubmit);
        submitBtn.addEventListener('touchend', runSubmit);
      }
    };

    // Section Modal Listeners
    if (this.newSectionCloseBtn) {
      this.newSectionCloseBtn.addEventListener('click', () => this.closeAddSectionModal());
    }
    if (this.newSectionCancelBtn) {
      this.newSectionCancelBtn.addEventListener('click', () => this.closeAddSectionModal());
    }
    bindSafeBackdrop(this.newSectionModalBackdrop, () => this.closeAddSectionModal(), () => this._newSectionModalOpenedAt);
    bindReliableSubmit(this.newSectionForm, this.newSectionSubmitBtn, () => this.handleSaveSection());

    if (this.newSectionEmojiPicker) {
      this.newSectionEmojiPicker.addEventListener('click', (e) => {
        const chip = e.target.closest('.emoji-chip');
        if (!chip) return;
        e.preventDefault();
        e.stopPropagation();
        this.dismissActiveKeyboard();
        this.newSectionEmojiPicker.querySelectorAll('.emoji-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedSectionEmoji = chip.dataset.emoji || '📋';
        triggerHaptic(10);
      });
    }

    // Section Actions Menu Modal Listeners
    if (this.sectionMenuCloseBtn) {
      this.sectionMenuCloseBtn.addEventListener('click', () => this.closeSectionMenuModal());
    }
    bindSafeBackdrop(this.sectionMenuModalBackdrop, () => this.closeSectionMenuModal(), () => this._sectionMenuModalOpenedAt);

    if (this.secMenuRenameBtn) {
      let lastRenameTrigger = 0;
      const handleRename = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const now = Date.now();
        if (now - lastRenameTrigger < 500) return;
        lastRenameTrigger = now;

        triggerHaptic(15);
        const secId = this.activeSectionMenuId;
        this.closeSectionMenuModal();
        if (secId) {
          setTimeout(() => {
            this.openRenameSectionModal(secId);
          }, 80);
        }
      };
      this.secMenuRenameBtn.addEventListener('click', handleRename);
      this.secMenuRenameBtn.addEventListener('touchend', handleRename);
    }
    if (this.secMenuMoveUpBtn) {
      this.secMenuMoveUpBtn.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (this.activeSectionMenuId) {
          this.moveSectionOrder(this.activeSectionMenuId, 'up');
        }
      });
    }
    if (this.secMenuMoveDownBtn) {
      this.secMenuMoveDownBtn.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (this.activeSectionMenuId) {
          this.moveSectionOrder(this.activeSectionMenuId, 'down');
        }
      });
    }
    if (this.secMenuDeleteBtn) {
      this.secMenuDeleteBtn.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (this.activeSectionMenuId) {
          this.confirmDeleteSection(this.activeSectionMenuId);
        }
      });
    }

    // Close task modal
    const closeTaskModalHandler = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      triggerHaptic(15);
      this.closeTaskModal();
    };

    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', closeTaskModalHandler);
    }
    if (this.modalCancelBtn) {
      this.modalCancelBtn.addEventListener('click', closeTaskModalHandler);
    }
    bindSafeBackdrop(this.taskModalBackdrop, closeTaskModalHandler, () => this._taskModalOpenedAt);
    bindReliableSubmit(this.newTaskForm, this.modalSubmitBtn || document.getElementById('modalSubmitBtn'), () => this.handleAddTask());

    // Open Add Tab Modal
    if (this.addTabBtn) {
      this.addTabBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openNewTabModal();
      });
    }

    // Close Add Tab Modal
    const closeNewTabModalHandler = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      triggerHaptic(15);
      this.closeNewTabModal();
    };
    if (this.newTabCloseBtn) {
      this.newTabCloseBtn.addEventListener('click', closeNewTabModalHandler);
    }
    if (this.newTabCancelBtn) {
      this.newTabCancelBtn.addEventListener('click', closeNewTabModalHandler);
    }
    bindSafeBackdrop(this.newTabModalBackdrop, closeNewTabModalHandler, () => this._newTabModalOpenedAt);
    bindReliableSubmit(this.newTabForm, this.newTabSubmitBtn || document.getElementById('newTabSubmitBtn'), () => this.handleAddNewTab());

    // Edit Tab Modal listeners
    const closeEditTabModalHandler = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      triggerHaptic(15);
      this.closeEditTabModal();
    };
    if (this.editTabCloseBtn) {
      this.editTabCloseBtn.addEventListener('click', closeEditTabModalHandler);
    }
    if (this.editTabCancelBtn) {
      this.editTabCancelBtn.addEventListener('click', closeEditTabModalHandler);
    }
    bindSafeBackdrop(this.editTabModalBackdrop, closeEditTabModalHandler, () => this._editTabModalOpenedAt);
    bindReliableSubmit(this.editTabForm, this.editTabSubmitBtn || document.getElementById('editTabSubmitBtn'), () => this.handleEditTabSubmit());

    if (this.btnTabMoveLeft) {
      this.btnTabMoveLeft.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = this.currentEditingTabId || (this.editTabId ? this.editTabId.value : null);
        this.moveTab(tabId, -1);
      });
    }
    if (this.btnTabMoveRight) {
      this.btnTabMoveRight.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = this.currentEditingTabId || (this.editTabId ? this.editTabId.value : null);
        this.moveTab(tabId, 1);
      });
    }
    if (this.btnDeleteTab) {
      this.btnDeleteTab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tabId = this.currentEditingTabId || (this.editTabId ? this.editTabId.value : null);
        this.deleteTab(tabId);
      });
    }

    // In-App Confirmation Modal listeners
    if (this.confirmModalCancelBtn) {
      this.confirmModalCancelBtn.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.closeConfirmModal();
      });
    }
    bindSafeBackdrop(this.confirmModalBackdrop, () => this.closeConfirmModal(), () => this._confirmModalOpenedAt);

    if (this.confirmModalApproveBtn) {
      this.confirmModalApproveBtn.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const cb = this.pendingConfirmCallback;
        this.closeConfirmModal();
        if (typeof cb === 'function') {
          cb();
        }
      });
    }

    // Settings Modal Listeners
    if (this.settingsCloseBtn) {
      this.settingsCloseBtn.addEventListener('click', () => this.closeSettingsModal());
    }
    if (this.settingsDoneBtn) {
      this.settingsDoneBtn.addEventListener('click', () => this.closeSettingsModal());
    }
    bindSafeBackdrop(this.settingsModalBackdrop, () => this.closeSettingsModal(), () => this._settingsModalOpenedAt);

    // Calendar Modal listeners
    if (this.calendarCloseBtn) {
      this.calendarCloseBtn.addEventListener('click', () => this.closeCalendarModal());
    }
    bindSafeBackdrop(this.calendarModalBackdrop, () => this.closeCalendarModal(), () => this._calendarModalOpenedAt);

    if (this.calendarPrevMonth) {
      this.calendarPrevMonth.addEventListener('click', () => {
        triggerHaptic(15);
        this.displayedCalendarMonth.setMonth(this.displayedCalendarMonth.getMonth() - 1);
        this.renderCalendar();
      });
    }
    if (this.calendarNextMonth) {
      this.calendarNextMonth.addEventListener('click', () => {
        triggerHaptic(15);
        this.displayedCalendarMonth.setMonth(this.displayedCalendarMonth.getMonth() + 1);
        this.renderCalendar();
      });
    }
    if (this.calendarTodayBtn) {
      this.calendarTodayBtn.addEventListener('click', () => {
        triggerHaptic(20);
        const todayStr = this.getTodayDateString();
        // Save current tasks if we were on today or future before switching
        if (this.selectedDate >= todayStr && this.tasks && this.tasks.todo && this.dailyTasks) {
          this.dailyTasks[this.selectedDate] = this.tasks.todo;
          this.saveDailyTasks();
        }
        this.selectedDate = todayStr;
        this.tempSelectedDate = todayStr;
        this.displayedCalendarMonth = new Date();
        this.closeCalendarModal();
        this.syncSelectedDate();
        this.showToast('Открыт сегодняшний день 📍', '📅');
      });
    }
    if (this.calendarSelectBtn) {
      this.calendarSelectBtn.addEventListener('click', () => {
        triggerHaptic(20);
        const todayStr = this.getTodayDateString();
        // Save current tasks if we were on today or future before switching
        if (this.selectedDate >= todayStr && this.tasks && this.tasks.todo && this.dailyTasks) {
          this.dailyTasks[this.selectedDate] = this.tasks.todo;
          this.saveDailyTasks();
        }
        this.selectedDate = this.tempSelectedDate;
        this.closeCalendarModal();
        this.syncSelectedDate();
        const formatted = this.formatDateTitle(this.selectedDate);
        this.showToast(`Выбран день: ${formatted}`, '📅');
      });
    }

    // Achievements Modal listeners
    if (this.achievementsCloseBtn) {
      this.achievementsCloseBtn.addEventListener('click', () => this.closeAchievementsModal());
    }
    bindSafeBackdrop(this.achievementsModalBackdrop, () => this.closeAchievementsModal(), () => this._achievementsModalOpenedAt);

    if (this.achievementsFilterTabs) {
      this.achievementsFilterTabs.querySelectorAll('.achievement-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerHaptic(15);
          this.achievementsFilterTabs.querySelectorAll('.achievement-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeAchievementFilter = btn.dataset.filter || 'all';
          this.renderAchievements();
        });
      });
    }
    if (this.achievementsSearchInput) {
      let debounceTimer = null;
      this.achievementsSearchInput.addEventListener('input', (e) => {
        const queryVal = e.target.value.toLowerCase().trim();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.achievementSearchQuery = queryVal;
          this.renderAchievements();
        }, 80);
      });
    }

    // Global keyboard Escape key handler to close any open modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        this.closeAllModals();
      }
    });

    // Widgets
    if (this.widgetDate) {
      this.widgetDate.addEventListener('click', () => {
        triggerHaptic(20);
        this.openCalendarModal();
      });
    }

    if (this.widgetTimer) {
      this.widgetTimer.addEventListener('click', () => {
        triggerHaptic(15);
        const todoTasks = this.tasks['todo'] || [];
        const totalCount = todoTasks.length;
        const completedCount = todoTasks.filter(t => t.completed).length;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const isEn = this.settings.lang === 'en';
        const isUk = this.settings.lang === 'uk';
        const msg = isEn
          ? `Completed: ${completedCount} of ${totalCount} tasks (${percent}%)`
          : (isUk
            ? `Виконано: ${completedCount} з ${totalCount} справ (${percent}%)`
            : `Выполнено: ${completedCount} из ${totalCount} дел (${percent}%)`);
        this.showToast(msg, '📊');
      });
    }

    if (this.widgetStreak) {
      this.widgetStreak.addEventListener('click', () => {
        triggerHaptic([20, 40, 20]);
        const days = this.streakData ? this.streakData.count : 15;
        const daysWord = this.getDaysWord(days);
        const record = this.streakData ? this.streakData.bestStreak : days;
        this.showToast(`🔥 Беспрерывная серия: ${days} ${daysWord}! (Рекорд: ${record})`, '🔥');
      });
    }

    if (this.widgetMedal) {
      this.widgetMedal.addEventListener('click', () => {
        triggerHaptic(20);
        this.openAchievementsModal();
      });
    }

    if (this.widgetSettings) {
      this.widgetSettings.addEventListener('click', () => {
        triggerHaptic(15);
        this.openSettingsModal();
      });
    }
  }

  // Smooth mouse, wheel and touch drag-to-scroll for tabs
  initDragToScroll() {
    const slider = this.folderTabsBar;
    const container = slider ? slider.closest('.tabs-scroll-container') || slider.parentElement : null;
    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let isDragging = false;

    const onPointerStart = (e) => {
      // Only left mouse button (e.button === 0) or pointer
      if (e.button !== undefined && e.button !== 0) return;
      isDown = true;
      isDragging = false;
      startX = e.pageX || (e.touches && e.touches[0] ? e.touches[0].pageX : 0);
      scrollStart = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
    };

    slider.addEventListener('mousedown', onPointerStart);
    if (container && container !== slider) {
      container.addEventListener('mousedown', onPointerStart);
    }

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const currentX = e.pageX || (e.touches && e.touches[0] ? e.touches[0].pageX : 0);
      const dx = currentX - startX;
      if (Math.abs(dx) > 4) {
        isDragging = true;
        slider.classList.add('is-dragging');
      }
      slider.scrollLeft = scrollStart - dx;
    });

    const onPointerEnd = () => {
      if (isDown) {
        isDown = false;
        slider.style.scrollBehavior = '';
        slider.classList.remove('is-dragging');
        // Reset dragging flag after next tick so tab click handler doesn't trigger
        setTimeout(() => {
          isDragging = false;
        }, 60);
      }
    };

    window.addEventListener('mouseup', onPointerEnd);
    window.addEventListener('mouseleave', onPointerEnd);

    // Suppress tab selection if user was dragging/scrolling tabs
    slider.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Horizontal wheel scroll on desktop & trackpad
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta !== 0) {
        slider.scrollLeft += delta;
        e.preventDefault();
      }
    };

    slider.addEventListener('wheel', onWheel, { passive: false });
    if (container && container !== slider) {
      container.addEventListener('wheel', onWheel, { passive: false });
    }
  }

  // Check if Dark Mode is active
  isDarkMode() {
    const theme = this.settings ? this.settings.theme : 'light';
    if (theme === 'dark') return true;
    if (theme === 'auto') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  // Render Tabs with long-press support and synchronized color tinting
  renderTabs() {
    this.folderTabsBar.innerHTML = '';

    const isDark = this.isDarkMode();
    const activeTab = this.tabs.find(t => t.id === this.currentTab) || this.tabs[0];
    const activeColorObj = getTabColor(activeTab ? activeTab.colorId : 'white');

    this.tabs.forEach(tab => {
      const isActive = tab.id === this.currentTab;
      const tabColorObj = getTabColor(tab.colorId);
      const tabList = (tab.id === 'todo' && this.tasks.todo) ? this.tasks.todo : (this.tasks[tab.id] || []);
      const taskCount = tabList.filter(t => !t.completed && !t.isEmpty && t.text && t.text.trim().length > 0).length;

      const tabBtn = document.createElement('button');
      tabBtn.className = `folder-tab ${isActive ? 'active' : ''}`;
      tabBtn.setAttribute('role', 'tab');
      tabBtn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tabBtn.setAttribute('data-tab', tab.id);
      tabBtn.title = 'Нажмите для выбора. Удерживайте для настройки';

      // Active tab gets EXACT same background as sheet; Inactive gets soft inactive color
      if (isDark) {
        tabBtn.style.backgroundColor = isActive ? (tabColorObj.darkSheetBg || '#131620') : (tabColorObj.darkInactiveBg || '#1c202d');
      } else {
        tabBtn.style.backgroundColor = isActive ? tabColorObj.sheetBg : tabColorObj.inactiveBg;
      }

      // Badge
      const badge = document.createElement('span');
      badge.className = `tab-badge ${isActive ? 'badge-active' : 'badge-inactive'}`;
      badge.id = `badge-${tab.id}`;
      badge.textContent = taskCount;

      // Label
      const label = document.createElement('span');
      label.className = 'tab-label';
      label.textContent = tab.title;

      tabBtn.appendChild(badge);
      tabBtn.appendChild(label);

      // Long press detection (touch & mouse)
      let pressTimer = null;
      let startX = 0;
      let startY = 0;
      let isLongPress = false;

      const startPress = (clientX, clientY) => {
        isLongPress = false;
        startX = clientX;
        startY = clientY;
        clearTimeout(pressTimer);
        pressTimer = setTimeout(() => {
          isLongPress = true;
          triggerHaptic([30, 50, 30]);
          this.openEditTabModal(tab.id);
        }, 450);
      };

      const cancelPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      tabBtn.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        startPress(e.clientX, e.clientY);
      });

      tabBtn.addEventListener('pointermove', (e) => {
        if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) {
          cancelPress();
        }
      });

      tabBtn.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          if (Math.abs(e.touches[0].clientX - startX) > 4 || Math.abs(e.touches[0].clientY - startY) > 4) {
            cancelPress();
          }
        }
      }, { passive: true });

      tabBtn.addEventListener('pointerup', () => cancelPress());
      tabBtn.addEventListener('pointercancel', () => cancelPress());
      tabBtn.addEventListener('touchend', () => cancelPress(), { passive: true });
      tabBtn.addEventListener('touchcancel', () => cancelPress(), { passive: true });

      tabBtn.addEventListener('click', (e) => {
        if (isLongPress) {
          e.preventDefault();
          e.stopPropagation();
          isLongPress = false;
          return;
        }
        this.switchTab(tab.id);
      });

      this.folderTabsBar.appendChild(tabBtn);
    });

    // Re-append Add Tab Button (+) at the end of the folder tabs bar
    const addTabBtn = document.createElement('button');
    addTabBtn.className = 'add-tab-btn';
    addTabBtn.id = 'addTabBtn';
    addTabBtn.title = this.t('btn_add_tab') || 'Добавить новую вкладку';
    addTabBtn.setAttribute('aria-label', this.t('btn_add_tab') || 'Добавить новую вкладку');
    addTabBtn.innerHTML = '<span>+</span>';
    addTabBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openNewTabModal();
    };
    this.folderTabsBar.appendChild(addTabBtn);

    // Dynamically tint the notebook sheet background and apply pattern to match active tab
    const sheet = document.getElementById('notebookSheet') || document.querySelector('.notebook-sheet');
    if (sheet) {
      if (isDark) {
        sheet.style.backgroundColor = activeColorObj.darkSheetBg || '#131620';
      } else {
        sheet.style.backgroundColor = activeColorObj.sheetBg;
      }
      const pattern = activeTab ? (activeTab.pattern || 'lines') : 'lines';
      const size = activeTab ? (activeTab.patternSize || 32) : 32;
      sheet.setAttribute('data-pattern', pattern);
      sheet.style.setProperty('--pattern-size', `${size}px`);
    }
  }

  // Open Edit Tab Modal (Long press)
  openEditTabModal(tabId) {
    this.dismissActiveKeyboard();
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    this.currentEditingTabId = tabId;
    this.selectedTabColorId = tab.colorId || 'white';
    this.selectedPattern = tab.pattern || 'lines';
    this.selectedPatternSize = tab.patternSize || 32;

    if (this.editTabId) this.editTabId.value = tabId;
    if (this.editTabTitleInput) {
      this.editTabTitleInput.value = tab.title.replace('\n', ' ');
    }

    // 1. Render Color Picker with live sheet preview
    if (this.tabColorPicker) {
      this.tabColorPicker.innerHTML = TAB_COLORS.map(c => `
        <div class="color-swatch ${c.id === this.selectedTabColorId || c.alias === this.selectedTabColorId ? 'active' : ''}" 
             data-color-id="${c.id}" 
             style="background-color: ${c.swatch};" 
             title="${c.name}">
        </div>
      `).join('');

      this.tabColorPicker.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          this.selectedTabColorId = swatch.dataset.colorId;
          this.tabColorPicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
          triggerHaptic(15);

          // Instant Live Preview on sheet & active tab
          const previewColor = getTabColor(this.selectedTabColorId);
          const sheet = document.getElementById('notebookSheet') || document.querySelector('.notebook-sheet');
          if (sheet && previewColor) {
            sheet.style.backgroundColor = previewColor.sheetBg;
          }
          const activeTabBtn = document.querySelector(`.folder-tab[data-tab="${this.editTabId.value}"]`);
          if (activeTabBtn && previewColor) {
            activeTabBtn.style.backgroundColor = previewColor.sheetBg;
          }
        });
      });
    }

    // 2. Pattern Chips
    if (this.tabPatternSelector) {
      this.tabPatternSelector.querySelectorAll('.pattern-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.pattern === this.selectedPattern);
        chip.onclick = () => {
          this.selectedPattern = chip.dataset.pattern;
          this.tabPatternSelector.querySelectorAll('.pattern-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          triggerHaptic(15);

          if (this.patternSizeGroup) {
            this.patternSizeGroup.style.display = this.selectedPattern === 'blank' ? 'none' : 'block';
          }

          // Instant Live Preview
          const sheet = document.getElementById('notebookSheet') || document.querySelector('.notebook-sheet');
          if (sheet) {
            sheet.setAttribute('data-pattern', this.selectedPattern);
          }
        };
      });
    }

    // 3. Pattern Size Slider
    if (this.patternSizeGroup) {
      this.patternSizeGroup.style.display = this.selectedPattern === 'blank' ? 'none' : 'block';
    }
    if (this.tabPatternSizeRange && this.patternSizeVal) {
      this.tabPatternSizeRange.value = this.selectedPatternSize;
      this.patternSizeVal.textContent = `${this.selectedPatternSize} px`;

      this.tabPatternSizeRange.oninput = (e) => {
        this.selectedPatternSize = parseInt(e.target.value, 10);
        this.patternSizeVal.textContent = `${this.selectedPatternSize} px`;

        // Instant Live Preview
        const sheet = document.getElementById('notebookSheet') || document.querySelector('.notebook-sheet');
        if (sheet) {
          sheet.style.setProperty('--pattern-size', `${this.selectedPatternSize}px`);
        }
      };
    }

    // 4. Hide Delete Tab Button for default 3 system tabs (todo, buy, watch)
    const isSystemTab = (tabId === 'todo' || tabId === 'buy' || tabId === 'watch');

    const deleteGroup = document.getElementById('deleteTabGroup') || this.deleteTabGroup;
    const deleteBtn = document.getElementById('btnDeleteTab') || this.btnDeleteTab;
    if (deleteGroup) {
      deleteGroup.style.display = isSystemTab ? 'none' : 'block';
    }
    if (deleteBtn) {
      deleteBtn.style.display = isSystemTab ? 'none' : 'flex';
    }

    if (this.editTabModalBackdrop) {
      this._editTabModalOpenedAt = Date.now();
      this.editTabModalBackdrop.classList.add('open');
      this.editTabModalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  // Close Edit Tab Modal
  closeEditTabModal() {
    if (this.editTabModalBackdrop) {
      this.editTabModalBackdrop.classList.remove('open');
      this.editTabModalBackdrop.setAttribute('aria-hidden', 'true');
    }
    // Restore actual saved sheet and tab background
    this.renderTabs();
  }

  // Move Tab Left or Right
  moveTab(tabId, direction) {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.tabs.length) return;

    // Swap tabs
    const [movedTab] = this.tabs.splice(index, 1);
    this.tabs.splice(newIndex, 0, movedTab);

    this.saveTabs();
    this.renderTabs();
    triggerHaptic(20);
    this.showToast(direction < 0 ? 'Вкладка сдвинута влево ⬅️' : 'Вкладка сдвинута вправо ➡️', '🔄');
  }

  // Reusable In-App Confirmation Modal (Beautiful dialog matching notebook aesthetic)
  showConfirmModal({ title, message, icon = '🗑️', confirmText = 'Удалить', onConfirm }) {
    this.dismissActiveKeyboard();
    const backdrop = document.getElementById('confirmModalBackdrop') || this.confirmModalBackdrop;
    const titleEl = document.getElementById('confirmModalTitle') || this.confirmModalTitle;
    const msgEl = document.getElementById('confirmModalMessage') || this.confirmModalMessage;
    const iconEl = document.getElementById('confirmModalIcon') || this.confirmModalIcon;
    const approveBtn = document.getElementById('confirmModalApproveBtn') || this.confirmModalApproveBtn;

    if (!backdrop) return;

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;
    if (approveBtn) approveBtn.textContent = confirmText;

    this.pendingConfirmCallback = onConfirm;
    this._confirmModalOpenedAt = Date.now();
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    triggerHaptic(20);
  }

  closeConfirmModal() {
    const backdrop = document.getElementById('confirmModalBackdrop') || this.confirmModalBackdrop;
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    this.pendingConfirmCallback = null;
  }

  // Delete Tab (Only for user-created custom tabs with in-app confirmation)
  deleteTab(targetTabId) {
    const tabId = targetTabId || this.currentEditingTabId || (this.editTabId ? this.editTabId.value : null);
    if (!tabId) return;

    // First 3 default tabs cannot be deleted
    if (tabId === 'todo' || tabId === 'buy' || tabId === 'watch') {
      this.showToast('Основные вкладки (Что сделать, Что купить, Что посмотреть) нельзя удалять', '⚠️');
      return;
    }

    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (this.tabs.length <= 1) {
      this.showToast('Нельзя удалить единственную вкладку', '⚠️');
      return;
    }

    const tabTitleClean = tab.title ? tab.title.replace('\n', ' ') : 'вкладку';

    this.showConfirmModal({
      title: this.t('confirm_delete_tab_title'),
      message: this.t('confirm_delete_tab_msg', { title: tabTitleClean }),
      icon: '🗑️',
      confirmText: this.t('confirm_delete_tab_btn'),
      onConfirm: () => {
        this.tabs = this.tabs.filter(t => t.id !== tabId);
        delete this.tasks[tabId];

        if (this.currentTab === tabId) {
          this.currentTab = this.tabs.length > 0 ? this.tabs[0].id : 'todo';
        }

        this.saveTabs();
        this.saveTasks();
        this.closeEditTabModal();
        this.checkAchievements(true);
        this.renderTabs();
        this.render();
        this.updateWorkloadWidget();
        triggerHaptic([20, 30, 20]);
        this.showToast(this.t('toast_tab_deleted', { title: tabTitleClean }), '🗑️');
      }
    });
  }

  // Handle Edit Tab Form Submit
  handleEditTabSubmit() {
    const tabId = this.editTabId ? this.editTabId.value : null;
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    const rawTitle = this.editTabTitleInput.value.trim();
    if (!rawTitle) return;

    let formattedTitle = rawTitle;
    const words = rawTitle.split(' ');
    if (words.length >= 2) {
      formattedTitle = `${words[0]}\n${words.slice(1).join(' ')}`;
    }

    tab.title = formattedTitle;
    tab.colorId = this.selectedTabColorId || 'white';
    tab.pattern = this.selectedPattern || 'lines';
    tab.patternSize = this.selectedPatternSize || 32;

    this.saveTabs();
    this.renderTabs();
    this.closeEditTabModal();
    triggerHaptic(20);
    this.showToast('Вкладка и фон листа обновлены', '✨');
  }

  // Switch Tab
  switchTab(tabKey) {
    if (this.currentTab === tabKey) return;
    this.currentTab = tabKey;
    this.renderTabs();
    this.render();

    // Scroll active tab into view smoothly
    const activeTabElem = this.folderTabsBar.querySelector(`.folder-tab[data-tab="${tabKey}"]`);
    if (activeTabElem) {
      activeTabElem.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }

  // Open New Tab Modal
  openNewTabModal() {
    this.dismissActiveKeyboard();
    this._newTabModalOpenedAt = Date.now();
    const backdrop = this.newTabModalBackdrop || document.getElementById('newTabModalBackdrop');
    const input = this.newTabNameInput || document.getElementById('newTabNameInput');
    if (input) input.value = '';
    if (backdrop) {
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
    }
    triggerHaptic(15);
  }

  // Close New Tab Modal
  closeNewTabModal() {
    const backdrop = this.newTabModalBackdrop || document.getElementById('newTabModalBackdrop');
    const form = this.newTabForm || document.getElementById('newTabForm');
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    if (form) form.reset();
  }

  // Handle Add New Tab
  handleAddNewTab() {
    const input = this.newTabNameInput || document.getElementById('newTabNameInput');
    const rawName = input ? input.value.trim() : '';
    if (!rawName) return;

    let formattedTitle = rawName;
    const words = rawName.split(' ');
    if (words.length >= 2) {
      formattedTitle = `${words[0]}\n${words.slice(1).join(' ')}`;
    }

    const tabId = 'tab_' + Date.now().toString(36);

    this.tabs.push({
      id: tabId,
      title: formattedTitle,
      colorId: 'white',
      pattern: 'lines',
      patternSize: 32
    });

    if (!this.tasks[tabId]) {
      this.tasks[tabId] = [];
    }

    if (!this.tabSections) this.initSections();
    if (!this.tabSections[tabId] || this.tabSections[tabId].length === 0) {
      this.tabSections[tabId] = [
        { id: 'sec_' + Date.now().toString(36), name: 'Планы', icon: '📋' }
      ];
      this.saveSections();
    }

    this.saveTabs();
    this.saveTasks();
    this.checkAchievements(true);

    this.closeNewTabModal();
    this.switchTab(tabId);
    this.renderTabs();
    this.render();

    triggerHaptic([30, 50]);
    this.showToast(`Создана новая вкладка: ${rawName}`, '📁');

    setTimeout(() => {
      if (this.folderTabsBar) {
        this.folderTabsBar.scrollTo({ left: this.folderTabsBar.scrollWidth, behavior: 'smooth' });
      }
    }, 100);
  }

  // =========================================================================
  // SECTION (BLOCK) MANAGEMENT
  // =========================================================================

  initSections() {
    try {
      const stored = localStorage.getItem('todo_notebook_tab_sections');
      if (stored) {
        this.tabSections = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load sections:', e);
    }

    if (!this.tabSections) {
      this.tabSections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    }
  }

  getTabSections(tabId) {
    if (!this.tabSections) this.initSections();
    if (!this.tabSections[tabId] || this.tabSections[tabId].length === 0) {
      if (DEFAULT_SECTIONS[tabId]) {
        this.tabSections[tabId] = JSON.parse(JSON.stringify(DEFAULT_SECTIONS[tabId]));
      } else {
        this.tabSections[tabId] = [
          { id: 'main', name: 'Основное', icon: '📋' }
        ];
      }
      this.saveSections();
    }
    return this.tabSections[tabId];
  }

  saveSections() {
    try {
      localStorage.setItem('todo_notebook_tab_sections', JSON.stringify(this.tabSections));
      if (window.Plan4UStorage) {
        Plan4UStorage.saveFile('sections.json', this.tabSections);
      }
    } catch (e) {
      console.warn('Could not save sections:', e);
    }
  }

  // Open Add Section Modal (via FAB or menu)
  openAddSectionModal() {
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      triggerHaptic(15);
      const isEn = this.settings.lang === 'en';
      const isUk = this.settings.lang === 'uk';
      const msg = isEn
        ? 'Cannot edit structure of past days'
        : (isUk
          ? 'Неможливо змінювати структуру минулих днів'
          : 'Нельзя изменять структуру прошедших дней');
      this.showToast(msg, '🔒');
      return;
    }
    triggerHaptic(15);
    this.selectedSectionEmoji = '📋';
    if (this.newSectionNameInput) this.newSectionNameInput.value = '';
    if (this.newSectionEmojiPicker) {
      this.newSectionEmojiPicker.querySelectorAll('.emoji-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.emoji === '📋');
      });
    }
    const modalTitle = document.getElementById('newSectionModalTitle');
    if (modalTitle) {
      modalTitle.textContent = 'Новый блок (раздел)';
    }
    const submitBtn = this.newSectionForm ? this.newSectionForm.querySelector('.btn-submit') : null;
    if (submitBtn) {
      submitBtn.textContent = 'Создать блок';
    }
    this.editingSectionId = null;
    if (this.newSectionModalBackdrop) {
      this.newSectionModalBackdrop.classList.add('open');
      this.newSectionModalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  closeAddSectionModal() {
    if (this.newSectionModalBackdrop) {
      this.newSectionModalBackdrop.classList.remove('open');
      this.newSectionModalBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (this.newSectionForm) this.newSectionForm.reset();
    this.editingSectionId = null;
  }

  handleSaveSection() {
    let rawName = this.newSectionNameInput ? this.newSectionNameInput.value.trim() : '';
    const emoji = this.selectedSectionEmoji || '📋';
    const sections = this.getTabSections(this.currentTab);

    if (this.editingSectionId) {
      // Edit existing section
      const sec = sections.find(s => s.id === this.editingSectionId || String(s.id) === String(this.editingSectionId));
      if (sec) {
        if (!rawName) {
          rawName = sec.name || (sec.key && this.t(sec.key)) || 'Блок';
        }
        sec.name = rawName;
        sec.icon = emoji;
        delete sec.key; // custom name overrides translation key
        this.saveSections();
        triggerHaptic(20);
        this.render();
        this.showToast(`Блок обновлен: ${emoji} ${rawName}`, '✏️');
      }
    } else {
      if (!rawName) return;
      // Add new section
      const newSec = {
        id: 'sec_' + Date.now().toString(36),
        name: rawName,
        icon: emoji
      };
      sections.push(newSec);
      this.saveSections();
      triggerHaptic(25);
      this.render();
      this.showToast(`Создан новый блок: ${emoji} ${rawName}`, '✨');

      // Focus the new section's inline input
      setTimeout(() => {
        const inp = this.contentContainer.querySelector(`.inline-task-input[data-section="${newSec.id}"]`);
        if (inp) {
          inp.focus();
          inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    this.closeAddSectionModal();
  }

  // Open Section Actions Submenu Modal (Long-press on section header)
  openSectionMenuModal(secId) {
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      triggerHaptic(15);
      const isEn = this.settings.lang === 'en';
      const isUk = this.settings.lang === 'uk';
      const msg = isEn
        ? 'Cannot edit sections of past days'
        : (isUk
          ? 'Неможливо редагувати блоки минулих днів'
          : 'Нельзя редактировать блоки прошедших дней');
      this.showToast(msg, '🔒');
      return;
    }
    this.dismissActiveKeyboard();
    this._sectionMenuModalOpenedAt = Date.now();
    this.activeSectionMenuId = secId;
    const sections = this.getTabSections(this.currentTab);
    const sec = sections.find(s => s.id === secId || String(s.id) === String(secId));
    if (!sec) return;

    const titleEl = document.getElementById('sectionMenuTitle');
    const headerTitle = (sec.key && this.t(sec.key)) ? this.t(sec.key) : `${sec.icon ? sec.icon + ' ' : ''}${sec.name}`;
    if (titleEl) {
      titleEl.textContent = headerTitle;
    }

    if (this.sectionMenuModalBackdrop) {
      this.sectionMenuModalBackdrop.classList.add('open');
      this.sectionMenuModalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  closeSectionMenuModal() {
    if (this.sectionMenuModalBackdrop) {
      this.sectionMenuModalBackdrop.classList.remove('open');
      this.sectionMenuModalBackdrop.setAttribute('aria-hidden', 'true');
    }
    this.activeSectionMenuId = null;
  }

  // Rename Section
  openRenameSectionModal(secId) {
    this.dismissActiveKeyboard();
    this._newSectionModalOpenedAt = Date.now();
    const sections = this.getTabSections(this.currentTab);
    const sec = sections.find(s => s.id === secId || String(s.id) === String(secId));
    this.closeSectionMenuModal();
    if (!sec) return;

    this.editingSectionId = sec.id;
    this.selectedSectionEmoji = sec.icon || '📋';

    // Clean current name (strip any leading emojis so user only edits clean text)
    let currentName = sec.name || '';
    if (!currentName && sec.key && this.t(sec.key)) {
      currentName = this.t(sec.key).replace(/^[^\wа-яА-ЯёЁіІїЇєЄ]+/, '').trim();
    }
    if (!currentName) currentName = 'Блок';

    if (this.newSectionNameInput) {
      this.newSectionNameInput.value = currentName;
    }
    if (this.newSectionEmojiPicker) {
      this.newSectionEmojiPicker.querySelectorAll('.emoji-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.emoji === this.selectedSectionEmoji);
      });
    }
    const modalTitle = document.getElementById('newSectionModalTitle');
    if (modalTitle) {
      modalTitle.textContent = 'Переименовать блок';
    }
    const submitBtn = this.newSectionForm ? this.newSectionForm.querySelector('.btn-submit') : null;
    if (submitBtn) {
      submitBtn.textContent = 'Сохранить';
    }
    if (this.newSectionModalBackdrop) {
      this.newSectionModalBackdrop.classList.add('open');
      this.newSectionModalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  // Move Section Up or Down
  moveSectionOrder(secId, direction) {
    this.closeSectionMenuModal();
    const sections = this.getTabSections(this.currentTab);
    const idx = sections.findIndex(s => s.id === secId);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = sections[idx];
      sections[idx] = sections[idx - 1];
      sections[idx - 1] = temp;
      this.saveSections();
      triggerHaptic(20);
      this.render();
    } else if (direction === 'down' && idx < sections.length - 1) {
      const temp = sections[idx];
      sections[idx] = sections[idx + 1];
      sections[idx + 1] = temp;
      this.saveSections();
      triggerHaptic(20);
      this.render();
    } else {
      triggerHaptic(10);
    }
  }

  // Delete Section with confirmation
  confirmDeleteSection(secId) {
    this.closeSectionMenuModal();
    const sections = this.getTabSections(this.currentTab);
    const sec = sections.find(s => s.id === secId);
    if (!sec) return;

    const secName = (sec.key && this.t(sec.key)) ? this.t(sec.key) : `${sec.icon ? sec.icon + ' ' : ''}${sec.name}`;

    this.showConfirmModal({
      title: 'Удалить блок?',
      message: `Вы уверены, что хотите удалить блок «${secName}»? Все задачи в этом блоке также будут удалены.`,
      icon: '🗑️',
      confirmText: 'Удалить',
      onConfirm: () => {
        // Remove section
        this.tabSections[this.currentTab] = sections.filter(s => s.id !== secId);
        // Remove tasks belonging to this section
        if (this.tasks[this.currentTab]) {
          this.tasks[this.currentTab] = this.tasks[this.currentTab].filter(t => (t.section || getTaskSection(t)) !== secId);
        }
        this.saveSections();
        this.saveTasks();
        this.render();
        this.renderTabs();
        this.updateWorkloadWidget();
        triggerHaptic([30, 60]);
        this.showToast(`Блок «${secName}» удален`, '🗑️');
      }
    });
  }

  // Apply selected language across the entire application interface
  applyLanguage(langId) {
    const lang = (langId && I18N[langId]) ? langId : (this.settings.lang || detectSystemLanguage());
    this.settings.lang = lang;
    this.saveSettings();

    const dict = I18N[lang] || I18N.ru;

    // 1. Update text nodes with [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // 2. Update placeholder attributes with [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // 3. Update circular badge text
    const badgeText = document.getElementById('langBadgeText');
    if (badgeText) {
      badgeText.textContent = dict.code || 'РУ';
    }

    // 4. Update active dropdown item in settings
    const dropdownMenu = document.getElementById('langDropdownMenu');
    if (dropdownMenu) {
      dropdownMenu.querySelectorAll('.lang-dropdown-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
      });
    }

    // 5. Update system tabs default titles if not customized
    if (this.tabs) {
      this.tabs.forEach(tab => {
        if (tab.id === 'todo' && !tab.customTitle) tab.title = dict.tab_todo;
        if (tab.id === 'buy' && !tab.customTitle) tab.title = dict.tab_buy;
        if (tab.id === 'watch' && !tab.customTitle) tab.title = dict.tab_watch;
      });
      this.saveTabs();
      this.renderTabs();
    }

    // 6. Refresh date widget, achievements, and main notebook content
    ACHIEVEMENTS_LIST = buildAchievementsCatalog(lang);
    this.updateDateWidget();
    this.render();
    if (this.calendarModalBackdrop && this.calendarModalBackdrop.classList.contains('open')) {
      this.renderCalendar();
    }
    if (this.achievementsModalBackdrop && this.achievementsModalBackdrop.classList.contains('open')) {
      this.renderAchievements();
    }
  }

  // Translation helper function with parameter interpolation
  t(key, params = {}) {
    const lang = this.settings.lang || 'ru';
    const dict = I18N[lang] || I18N.ru;
    let str = dict[key] || (I18N.ru && I18N.ru[key]) || key;
    Object.keys(params).forEach(p => {
      str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
    return str;
  }

  // Apply saved visual & behavioral settings to DOM
  applySettings() {
    const appFrame = document.getElementById('appFrame') || document.querySelector('.app-frame');

    // 1. Theme
    const theme = this.settings.theme || 'light';
    let isDark = false;
    if (theme === 'dark') {
      isDark = true;
    } else if (theme === 'auto') {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      document.documentElement.classList.add('theme-dark');
      document.body.classList.add('theme-dark');
      if (appFrame) appFrame.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
      document.body.classList.remove('theme-dark');
      if (appFrame) appFrame.classList.remove('theme-dark');
    }

    // 2. Accent Color
    const accentObj = ACCENT_COLORS.find(c => c.id === this.settings.accentColorId) || ACCENT_COLORS[0];
    document.documentElement.style.setProperty('--primary-rgb', accentObj.rgb || '216, 58, 136');
    document.documentElement.style.setProperty('--primary-magenta', accentObj.color);
    document.documentElement.style.setProperty('--primary-magenta-dark', accentObj.dark);
    document.documentElement.style.setProperty('--btn-accent-text', accentObj.btnText || '#ffffff');
    document.documentElement.style.setProperty('--btn-accent-border', accentObj.btnBorder || 'none');
    document.documentElement.style.setProperty('--accent-readable-text', accentObj.readableText || (isDark ? accentObj.darkSectionText : accentObj.sectionText) || accentObj.dark);
    document.documentElement.style.setProperty('--accent-margin-line', isDark ? (accentObj.darkMarginLine || accentObj.marginLine) : accentObj.marginLine);
    document.documentElement.style.setProperty('--section-header-bg', isDark ? accentObj.darkSectionBg : accentObj.sectionBg);
    document.documentElement.style.setProperty('--section-header-border', isDark ? accentObj.darkSectionBorder : accentObj.sectionBorder);
    document.documentElement.style.setProperty('--section-header-text', isDark ? accentObj.darkSectionText : accentObj.sectionText);

    // 3. Font Family, Size, Weights & Priority Color
    const fontFamily = this.settings.fontFamily || "'PT Serif', Georgia, serif";
    const fontSize = (this.settings.fontSize || 14) + 'px';
    const taskWeight = parseInt(this.settings.taskFontWeight || 700, 10);
    const priorityWeight = parseInt(this.settings.priorityFontWeight || 900, 10);
    const prioColorObj = PRIORITY_COLORS.find(c => c.id === this.settings.priorityColorId) || PRIORITY_COLORS[0];
    const priorityColor = this.settings.priorityColor || prioColorObj.color;
    const priorityDarkColor = prioColorObj.darkColor || priorityColor;

    // Subtle continuous smooth stroke calculation for regular cursive/serif fonts
    const taskStroke = (taskWeight <= 400) ? '0px' : (((taskWeight - 400) * 0.0006) + 'px');
    const priorityStroke = (((priorityWeight - 500) * 0.0018) + 0.12) + 'px';

    document.documentElement.style.setProperty('--task-font-family', fontFamily);
    document.documentElement.style.setProperty('--task-font-size', fontSize);
    document.documentElement.style.setProperty('--task-font-weight', taskWeight);
    document.documentElement.style.setProperty('--task-text-stroke', taskStroke);
    document.documentElement.style.setProperty('--priority-font-weight', priorityWeight);
    document.documentElement.style.setProperty('--priority-text-stroke', priorityStroke);
    document.documentElement.style.setProperty('--priority-task-color', priorityColor);
    document.documentElement.style.setProperty('--priority-task-dark-color', priorityDarkColor);

    // Update cloud sync label
    if (this.cloudLastSyncText) {
      this.cloudLastSyncText.textContent = this.settings.lastSync ? `Последняя синхронизация: ${this.settings.lastSync}` : 'Резервная копия сохранена локально в браузере';
    }

    if (this.folderTabsBar) {
      this.renderTabs();
    }
  }

  // Play subtle audio pop on task completion
  playCompletionSound() {
    if (!this.settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.07); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  // Play pleasant fanfare chime on achievement unlocked
  playAchievementSound() {
    if (!this.settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 fanfare
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.16, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.16);
      });
    } catch (e) {
      // Audio not supported or blocked
    }
  }

  // Open Settings Modal
  openSettingsModal() {
    this.dismissActiveKeyboard();
    if (!this.settingsModalBackdrop) return;

    // 0. Language Selector (Circular Badge & Dropdown Submenu)
    const langCircleBtn = document.getElementById('langCircleBadgeBtn');
    const langDropdown = document.getElementById('langDropdownMenu');
    const langBadgeText = document.getElementById('langBadgeText');

    const currentLang = this.settings.lang || detectSystemLanguage();
    if (langBadgeText) {
      langBadgeText.textContent = (I18N[currentLang] || I18N.ru).code;
    }

    if (langDropdown) {
      langDropdown.querySelectorAll('.lang-dropdown-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === currentLang);
        opt.onclick = (e) => {
          e.stopPropagation();
          const selectedLang = opt.dataset.lang;
          this.applyLanguage(selectedLang);
          triggerHaptic(20);
          this.showToast(this.t('toast_lang_changed'), '🌐');
          if (langCircleBtn) langCircleBtn.classList.remove('open');
          if (langDropdown) langDropdown.classList.remove('show');
        };
      });
    }

    if (langCircleBtn) {
      langCircleBtn.onclick = (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        const isOpen = langDropdown && langDropdown.classList.contains('show');
        if (langCircleBtn) langCircleBtn.classList.toggle('open', !isOpen);
        if (langDropdown) langDropdown.classList.toggle('show', !isOpen);
      };
    }

    // 1. Theme segmented control
    if (this.themeSelector) {
      const currentTheme = this.settings.theme || 'light';
      this.themeSelector.querySelectorAll('.segmented-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
        btn.onclick = () => {
          this.settings.theme = btn.dataset.theme;
          this.themeSelector.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.saveSettings();
          this.applySettings();
          triggerHaptic(15);
        };
      });
    }

    // 2. Accent Color Swatches
    if (this.accentColorPicker) {
      this.accentColorPicker.innerHTML = ACCENT_COLORS.map(c => `
        <button type="button" class="accent-swatch ${c.id === this.settings.accentColorId ? 'active' : ''}" 
                data-accent-id="${c.id}" 
                style="background-color: ${c.color};" 
                title="${c.name}">
        </button>
      `).join('');

      this.accentColorPicker.querySelectorAll('.accent-swatch').forEach(swatch => {
        swatch.onclick = () => {
          this.settings.accentColorId = swatch.dataset.accentId;
          this.accentColorPicker.querySelectorAll('.accent-swatch').forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
          this.saveSettings();
          this.applySettings();
          this.renderTabs();
          triggerHaptic(15);
        };
      });
    }

    // 3. Font Family Select
    if (this.fontFamilySelect) {
      this.fontFamilySelect.value = this.settings.fontFamily || "'PT Serif', Georgia, serif";
      this.fontFamilySelect.onchange = (e) => {
        this.settings.fontFamily = e.target.value;
        this.saveSettings();
        this.applySettings();
        this.updateFontPreview();
        triggerHaptic(15);
      };
    }

    // 4. Font Size Range
    if (this.fontSizeRange && this.fontSizeVal) {
      this.fontSizeRange.value = this.settings.fontSize || 14;
      this.fontSizeVal.textContent = `${this.settings.fontSize || 14} px`;

      this.fontSizeRange.oninput = (e) => {
        this.settings.fontSize = parseInt(e.target.value, 10);
        this.fontSizeVal.textContent = `${this.settings.fontSize} px`;
        this.saveSettings();
        this.applySettings();
        this.updateFontPreview();
      };
    }

    const getRegularWeightLabel = (w) => {
      const isUk = this.settings.lang === 'uk';
      const isEn = this.settings.lang === 'en';
      if (w <= 400) return isEn ? `${w} (Light)` : (isUk ? `${w} (Тонкий)` : `${w} (Тонкий)`);
      if (w <= 450) return isEn ? `${w} (Regular)` : (isUk ? `${w} (Звичайний)` : `${w} (Обычный)`);
      if (w <= 500) return isEn ? `${w} (Medium)` : (isUk ? `${w} (Середній)` : `${w} (Средний)`);
      if (w <= 550) return isEn ? `${w} (Semi-Bold)` : (isUk ? `${w} (Насичений)` : `${w} (Насыщенный)`);
      return isEn ? `${w} (Bold)` : (isUk ? `${w} (Жирний)` : `${w} (Жирный)`);
    };

    const getPrioWeightLabel = (w) => {
      const isUk = this.settings.lang === 'uk';
      const isEn = this.settings.lang === 'en';
      if (w <= 600) return isEn ? `${w} (Semi-Bold)` : (isUk ? `${w} (Напівжирний)` : `${w} (Полужирный)`);
      if (w <= 700) return isEn ? `${w} (Bold)` : (isUk ? `${w} (Жирний)` : `${w} (Жирный)`);
      if (w <= 800) return isEn ? `${w} (Extra Bold)` : (isUk ? `${w} (Дуже жирний)` : `${w} (Очень жирный)`);
      return isEn ? `${w} (Max / Heavy)` : (isUk ? `${w} (Максимальний)` : `${w} (Максимальный)`);
    };

    // 5. Regular Task Font Weight Slider (400..600)
    if (this.taskWeightRange && this.taskWeightVal) {
      this.taskWeightRange.min = '400';
      this.taskWeightRange.max = '600';
      this.taskWeightRange.step = '50';
      const currentTaskWeight = Math.min(600, Math.max(400, this.settings.taskFontWeight || 500));
      this.taskWeightRange.value = currentTaskWeight;
      this.taskWeightVal.textContent = getRegularWeightLabel(currentTaskWeight);

      this.taskWeightRange.oninput = (e) => {
        this.settings.taskFontWeight = parseInt(e.target.value, 10);
        this.taskWeightVal.textContent = getRegularWeightLabel(this.settings.taskFontWeight);
        this.saveSettings();
        this.applySettings();
        this.updateFontPreview();
      };
    }

    // 6. Priority Task Font Weight Slider
    if (this.priorityWeightRange && this.priorityWeightVal) {
      const currentPrioWeight = this.settings.priorityFontWeight || 900;
      this.priorityWeightRange.value = currentPrioWeight;
      this.priorityWeightVal.textContent = getPrioWeightLabel(currentPrioWeight);

      this.priorityWeightRange.oninput = (e) => {
        this.settings.priorityFontWeight = parseInt(e.target.value, 10);
        this.priorityWeightVal.textContent = getPrioWeightLabel(this.settings.priorityFontWeight);
        this.saveSettings();
        this.applySettings();
        this.updateFontPreview();
      };
    }

    this.updateFontPreview();

    // 8. Toggles
    if (this.toggleNotifications) {
      this.toggleNotifications.checked = !!this.settings.notificationsEnabled;
      this.toggleNotifications.onchange = async (e) => {
        if (e.target.checked) {
          const granted = await this.requestNotificationPermission();
          if (!granted) {
            e.target.checked = false;
          } else {
            this.scheduleSmartDailyNotifications();
          }
        } else {
          this.settings.notificationsEnabled = false;
          this.saveSettings();
          this.scheduleSmartDailyNotifications();
        }
      };
    }

    if (this.toggleMorningNotif) {
      this.toggleMorningNotif.checked = this.settings.morningNotifEnabled !== false;
      this.toggleMorningNotif.onchange = (e) => {
        this.settings.morningNotifEnabled = e.target.checked;
        this.saveSettings();
        this.scheduleSmartDailyNotifications();
      };
    }

    if (this.morningNotifTime) {
      this.morningNotifTime.value = this.settings.morningNotifTime || '09:00';
      this.morningNotifTime.onchange = (e) => {
        this.settings.morningNotifTime = e.target.value || '09:00';
        this.saveSettings();
        this.scheduleSmartDailyNotifications();
      };
    }

    if (this.toggleEveningNotif) {
      this.toggleEveningNotif.checked = this.settings.eveningNotifEnabled !== false;
      this.toggleEveningNotif.onchange = (e) => {
        this.settings.eveningNotifEnabled = e.target.checked;
        this.saveSettings();
        this.scheduleSmartDailyNotifications();
      };
    }

    if (this.eveningNotifTime) {
      this.eveningNotifTime.value = this.settings.eveningNotifTime || '21:00';
      this.eveningNotifTime.onchange = (e) => {
        this.settings.eveningNotifTime = e.target.value || '21:00';
        this.saveSettings();
        this.scheduleSmartDailyNotifications();
      };
    }

    if (this.togglePetNotif) {
      this.togglePetNotif.checked = this.settings.petNotifEnabled !== false;
      this.togglePetNotif.onchange = (e) => {
        this.settings.petNotifEnabled = e.target.checked;
        this.saveSettings();
        this.scheduleSmartDailyNotifications();
      };
    }

    if (this.toggleHaptics) {
      this.toggleHaptics.checked = this.settings.hapticsEnabled !== false;
      this.toggleHaptics.onchange = (e) => {
        this.settings.hapticsEnabled = e.target.checked;
        this.saveSettings();
        if (e.target.checked) triggerHaptic(20);
      };
    }

    if (this.toggleSound) {
      this.toggleSound.checked = this.settings.soundEnabled !== false;
      this.toggleSound.onchange = (e) => {
        this.settings.soundEnabled = e.target.checked;
        this.saveSettings();
        if (e.target.checked) this.playCompletionSound();
      };
    }

    if (this.btnTestNotification) {
      this.btnTestNotification.onclick = () => {
        this.sendTestNotification();
      };
    }

    // 6. Google Drive & Backup Actions
    if (this.importBackupFile) {
      this.importBackupFile.onchange = (e) => this.importBackup(e);
    }
    if (this.btnSaveToGoogleDrive) {
      this.btnSaveToGoogleDrive.onclick = () => this.saveToGoogleDriveDirect();
    }
    if (this.btnDownloadLocalBackup) {
      this.btnDownloadLocalBackup.onclick = () => this.downloadLocalBackup();
    }

    const last = localStorage.getItem('plan4u_last_gdrive_export');
    if (this.cloudLastSyncText && last) {
      this.cloudLastSyncText.innerHTML = `Сохранено на Диск: <b>${last}</b>`;
    }

    this._settingsModalOpenedAt = Date.now();
    this.settingsModalBackdrop.classList.add('open');
    this.settingsModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  // Update Font Preview text styling in settings
  updateFontPreview() {
    if (!this.fontPreviewBox) return;
    const fontFamily = this.settings.fontFamily || "'PT Serif', Georgia, serif";
    const fontSize = `${this.settings.fontSize || 14}px`;
    const taskWeight = parseInt(this.settings.taskFontWeight || 700, 10);
    const priorityWeight = parseInt(this.settings.priorityFontWeight || 900, 10);
    const prioColorObj = PRIORITY_COLORS.find(c => c.id === this.settings.priorityColorId) || PRIORITY_COLORS[0];
    const priorityColor = this.settings.priorityColor || prioColorObj.color;
    const isDark = document.body.classList.contains('theme-dark');
    const priorityDarkColor = prioColorObj.darkColor || priorityColor;

    const taskStroke = (taskWeight <= 400) ? '0px' : (((taskWeight - 400) * 0.0014) + 'px');
    const priorityStroke = (((priorityWeight - 500) * 0.0018) + 0.12) + 'px';

    if (this.previewRegularText) {
      this.previewRegularText.style.fontFamily = fontFamily;
      this.previewRegularText.style.fontSize = fontSize;
      this.previewRegularText.style.fontWeight = taskWeight;
      this.previewRegularText.style.webkitTextStroke = `${taskStroke} currentColor`;
    }
    if (this.previewPriorityText) {
      this.previewPriorityText.style.fontFamily = fontFamily;
      this.previewPriorityText.style.fontSize = fontSize;
      this.previewPriorityText.style.fontWeight = priorityWeight;
      this.previewPriorityText.style.color = isDark ? priorityDarkColor : priorityColor;
      this.previewPriorityText.style.webkitTextStroke = `${priorityStroke} currentColor`;
    }
  }

  // Close Settings Modal
  closeSettingsModal() {
    if (this.settingsModalBackdrop) {
      this.settingsModalBackdrop.classList.remove('open');
      this.settingsModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // Schedule smart recurring notifications (Morning Briefing, Evening Review, Pet Care)
  async scheduleSmartDailyNotifications() {
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.LocalNotifications) return;
    const { LocalNotifications } = window.Capacitor.Plugins;

    try {
      // Cancel previous smart notification IDs
      await LocalNotifications.cancel({
        notifications: [{ id: 1001 }, { id: 1002 }, { id: 1003 }]
      }).catch(() => { });

      if (!this.settings.notificationsEnabled) return;

      const isUk = this.settings.lang === 'uk';
      const isEn = this.settings.lang === 'en';
      const notificationsToSchedule = [];

      // 1. Morning Plan Summary
      if (this.settings.morningNotifEnabled !== false) {
        const timeStr = this.settings.morningNotifTime || '09:00';
        const [h, m] = timeStr.split(':').map(Number);
        const title = isEn ? 'Plan4U — Morning Plan ☀️' : (isUk ? 'Plan4U — Ранковий план ☀️' : 'Plan4U — Утренний план ☀️');
        const body = isEn
          ? '☀️ Good morning! Check today’s tasks in your notebook and have a productive day!'
          : (isUk
            ? '☀️ Доброго ранку! Перегляньте заплановані справи на сьогодні в блокноті Plan4U!'
            : '☀️ Доброе утро! Проверьте список дел на сегодня в блокноте Plan4U!');

        notificationsToSchedule.push({
          id: 1001,
          title,
          body,
          schedule: {
            on: { hour: isNaN(h) ? 9 : h, minute: isNaN(m) ? 0 : m },
            every: 'day'
          },
          sound: 'beep.wav',
          smallIcon: 'ic_launcher'
        });
      }

      // 2. Evening Review
      if (this.settings.eveningNotifEnabled !== false) {
        const timeStr = this.settings.eveningNotifTime || '21:00';
        const [h, m] = timeStr.split(':').map(Number);
        const title = isEn ? 'Plan4U — Evening Review 🌙' : (isUk ? 'Plan4U — Вечірній огляд 🌙' : 'Plan4U — Вечерний обзор 🌙');
        const body = isEn
          ? '🌙 Evening wrap-up: check off completed tasks and keep your streak going!'
          : (isUk
            ? '🌙 Вечірній огляд: перевірте, чи всі справи виконані, та збережіть серію днів!'
            : '🌙 Вечерний обзор: проверьте, все ли дела выполнены, и сохраните серию дней!');

        notificationsToSchedule.push({
          id: 1002,
          title,
          body,
          schedule: {
            on: { hour: isNaN(h) ? 21 : h, minute: isNaN(m) ? 0 : m },
            every: 'day'
          },
          sound: 'beep.wav',
          smallIcon: 'ic_launcher'
        });
      }

      // 3. Pet Companion Care (Maine Coon)
      if (this.settings.petNotifEnabled !== false) {
        const title = isEn ? 'Plan4U — Pet Care 🐾' : (isUk ? 'Plan4U — Турбота про котика 🐾' : 'Plan4U — Забота о питомце 🐾');
        const body = isEn
          ? '🐾 Your Maine Coon misses you! Give him a treat for today’s achievements 🐟'
          : (isUk
            ? '🐾 Мейн-кун скучив! Зайдіть погладити котика та пригостити його смаколиком 🐟'
            : '🐾 Мейн-кун скучает! Зайдите погладить котика и угостить его вкусняшкой 🐟');

        notificationsToSchedule.push({
          id: 1003,
          title,
          body,
          schedule: {
            on: { hour: 15, minute: 0 },
            every: 'day'
          },
          sound: 'beep.wav',
          smallIcon: 'ic_launcher'
        });
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      }
    } catch (err) {
      console.warn('Error scheduling smart notifications:', err);
    }
  }

  // Request browser / Android notification permission
  async requestNotificationPermission() {
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
        const res = await window.Capacitor.Plugins.LocalNotifications.requestPermissions();
        if (res.display === 'granted') {
          this.settings.notificationsEnabled = true;
          this.saveSettings();
          this.showToast(this.settings.lang === 'en' ? 'Notifications enabled!' : (this.settings.lang === 'uk' ? 'Сповіщення успішно увімкнено!' : 'Уведомления успешно включены!'), '🔔');
          return true;
        }
      }
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          this.settings.notificationsEnabled = true;
          this.saveSettings();
          this.showToast(this.settings.lang === 'en' ? 'Notifications enabled!' : (this.settings.lang === 'uk' ? 'Сповіщення успішно увімкнено!' : 'Уведомления успешно включены!'), '🔔');
          return true;
        }
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
    this.settings.notificationsEnabled = false;
    this.saveSettings();
    this.showToast(this.settings.lang === 'en' ? 'Notification access denied' : (this.settings.lang === 'uk' ? 'Доступ до сповіщень вимкнено' : 'Доступ к уведомлениям заблокирован'), 'ℹ️');
    return false;
  }

  // Send Test Notification (supports native Android tray notifications & Web Push)
  async sendTestNotification() {
    triggerHaptic(20);
    this.playCompletionSound();
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
        await window.Capacitor.Plugins.LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 100000),
              title: 'Plan4U — Блокнот Задач',
              body: this.settings.lang === 'en' ? 'Reminder: you have unfinished tasks in Plan4U!' : (this.settings.lang === 'uk' ? 'Нагадування: у вас є незавершені справи в Plan4U!' : 'Напоминание: у вас есть незавершенные дела в Plan4U!'),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: 'beep.wav',
              smallIcon: 'ic_launcher'
            }
          ]
        });
        this.showToast(this.settings.lang === 'en' ? 'Test notification sent to phone!' : (this.settings.lang === 'uk' ? 'Тестове сповіщення надіслано на телефон!' : 'Тестовое уведомление отправлено на телефон!'), '🔔');
        return;
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Plan4U — Блокнот Задач', {
          body: this.settings.lang === 'en' ? 'Reminder: you have unfinished tasks in Plan4U!' : (this.settings.lang === 'uk' ? 'Нагадування: у вас є незавершені справи в Plan4U!' : 'Напоминание: у вас есть незавершенные дела в Plan4U!'),
          icon: 'icon.svg'
        });
        this.showToast(this.settings.lang === 'en' ? 'Test notification sent!' : (this.settings.lang === 'uk' ? 'Тестове сповіщення надіслано!' : 'Тестовое push-уведомление отправлено!'), '🔔');
        return;
      }
    } catch (e) {
      console.warn('Send notification error:', e);
    }
    this.showToast(this.settings.lang === 'en' ? 'Please allow notification permission' : (this.settings.lang === 'uk' ? 'Будь ласка, дозвольте доступ до сповіщень' : 'Разрешите доступ к уведомлениям'), '🔔');
  }

  // Get formatted backup filename: Plan4U_YYYY-MM-DD_HH-mm-ss.json
  getFormattedBackupFilename(prefix = 'Plan4U') {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const sec = String(d.getSeconds()).padStart(2, '0');
    return `${prefix}_${y}-${m}-${day}_${h}-${min}-${sec}.json`;
  }

  // ==========================================
  // Plan4U Cloud Sync (Zero-Config Cloud Storage)
  // ==========================================

  initCloudSync() {
    this.PLAN4U_REGISTRY_ID = 'ff8081819ff5b11001a049c5b2d6571a';
    this.PLAN4U_API_URL = 'https://api.restful-api.dev/objects';

    try {
      this.cloudEmail = localStorage.getItem('plan4u_cloud_email') || null;
      this.cloudObjectId = localStorage.getItem('plan4u_cloud_object_id') || null;
      this.cloudAutoSync = localStorage.getItem('plan4u_cloud_autosync') !== 'false';
    } catch (e) {
      this.cloudEmail = null;
      this.cloudObjectId = null;
      this.cloudAutoSync = true;
    }

    // Auto-sync on online reconnect
    window.addEventListener('online', () => {
      console.log('Online connection restored, syncing pending changes to cloud...');
      if (this.cloudEmail && this.cloudObjectId && localStorage.getItem('plan4u_pending_cloud_sync') === '1') {
        this.syncToCloud(true);
      }
      this.updateCloudUI();
    });

    window.addEventListener('offline', () => {
      this.updateCloudUI();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        if (this.cloudEmail && this.cloudObjectId && localStorage.getItem('plan4u_pending_cloud_sync') === '1') {
          this.syncToCloud(true);
        }
      }
    });
  }

  // Update Cloud Sync UI in Settings
  updateCloudUI() {
    if (!this.cloudSyncCard) return;
    const isConnected = !!(this.cloudEmail && this.cloudObjectId);
    const isOnline = navigator.onLine !== false;
    const hasPending = localStorage.getItem('plan4u_pending_cloud_sync') === '1';

    if (this.cloudStatusBadge) {
      if (!isConnected) {
        this.cloudStatusBadge.textContent = '⚪ Не подключено';
        this.cloudStatusBadge.className = 'cloud-status-badge disconnected';
      } else if (!isOnline) {
        this.cloudStatusBadge.textContent = '🟡 Офлайн (в памяти)';
        this.cloudStatusBadge.className = 'cloud-status-badge disconnected';
      } else if (hasPending) {
        this.cloudStatusBadge.textContent = '🟡 Синхронизация...';
        this.cloudStatusBadge.className = 'cloud-status-badge connected';
      } else {
        this.cloudStatusBadge.textContent = '🟢 Подключено';
        this.cloudStatusBadge.className = 'cloud-status-badge connected';
      }
    }

    if (this.cloudAuthForm) {
      this.cloudAuthForm.style.display = isConnected ? 'none' : 'flex';
      if (this.cloudEmailInput && !this.cloudEmailInput.value && this.cloudEmail) {
        this.cloudEmailInput.value = this.cloudEmail;
      }
    }

    if (this.cloudConnectedControls) {
      this.cloudConnectedControls.style.display = isConnected ? 'block' : 'none';
      if (isConnected) {
        if (this.cloudUserInitial) {
          this.cloudUserInitial.textContent = (this.cloudEmail[0] || 'U').toUpperCase();
        }
        if (this.cloudUserEmailDisplay) {
          this.cloudUserEmailDisplay.textContent = this.cloudEmail;
        }
        if (this.cloudLastSyncText) {
          const last = localStorage.getItem('plan4u_last_cloud_sync');
          this.cloudLastSyncText.textContent = last
            ? `Облако активно • ${last}`
            : 'Данные автоматически сохраняются в вашем защищённом облаке.';
        }
        if (this.toggleCloudAutoSync) {
          this.toggleCloudAutoSync.checked = this.cloudAutoSync !== false;
        }
      }
    }
  }

  // 1-Click Connect Email to Cloud
  async handleConnectCloud() {
    triggerHaptic(20);
    const email = (this.cloudEmailInput ? this.cloudEmailInput.value : '').trim().toLowerCase();

    if (!email || !email.includes('@') || !email.includes('.')) {
      this.showToast('Пожалуйста, введите корректный Email адрес', '⚠️');
      return;
    }

    if (!navigator.onLine) {
      this.showToast('Для подключения требуется интернет', '📡');
      return;
    }

    this.showToast('Подключение к облаку Plan4U...', '☁️');

    try {
      // 1. Fetch or initialize Master Registry
      let registry = {};
      try {
        const regRes = await fetch(`${this.PLAN4U_API_URL}/${this.PLAN4U_REGISTRY_ID}`);
        if (regRes.ok) {
          const regData = await regRes.json();
          registry = JSON.parse(regData.data.index || '{}');
        }
      } catch (e) {
        console.warn('Registry fetch error:', e);
      }

      let userObjectId = registry[email];

      if (userObjectId) {
        // User already has a cloud bucket!
        this.cloudEmail = email;
        this.cloudObjectId = userObjectId;
        localStorage.setItem('plan4u_cloud_email', email);
        localStorage.setItem('plan4u_cloud_object_id', userObjectId);

        // Fetch cloud data and sync current data
        try {
          const userRes = await fetch(`${this.PLAN4U_API_URL}/${userObjectId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            const bundle = JSON.parse(userData.data.payload || '{}');
            if (bundle.tabs && bundle.tabs.length > 0 && (!this.tabs || this.tabs.length === 0)) {
              await this.applyRestoredData(bundle);
            } else {
              await this.syncToCloud(true);
            }
          }
        } catch (e) {
          await this.syncToCloud(true);
        }
      } else {
        // Create new Cloud Object for this user
        const bundle = this.prepareDataBundle();
        const createRes = await fetch(this.PLAN4U_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `plan4u_user_${email}`,
            data: { payload: JSON.stringify(bundle), email: email, timestamp: Date.now() }
          })
        });

        if (createRes.ok) {
          const created = await createRes.json();
          userObjectId = created.id;
          registry[email] = userObjectId;

          // Register in Master Registry
          await fetch(`${this.PLAN4U_API_URL}/${this.PLAN4U_REGISTRY_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'plan4u_master_sync_registry_v1',
              data: { index: JSON.stringify(registry), updatedAt: Date.now() }
            })
          });

          this.cloudEmail = email;
          this.cloudObjectId = userObjectId;
          localStorage.setItem('plan4u_cloud_email', email);
          localStorage.setItem('plan4u_cloud_object_id', userObjectId);
        } else {
          throw new Error('Could not create cloud object');
        }
      }

      const now = new Date();
      const formatted = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('plan4u_last_cloud_sync', `Синхронизировано: ${formatted}`);
      localStorage.removeItem('plan4u_pending_cloud_sync');

      this.updateCloudUI();
      triggerHaptic([30, 50, 30]);
      this.showToast(`Облако успешно подключено к ${email}! 🟢`, '☁️');
    } catch (err) {
      console.error('Cloud connect error:', err);
      this.showToast('Не удалось подключить облако. Проверьте соединение', '⚠️');
    }
  }

  // Prepare full data bundle for cloud storage
  prepareDataBundle() {
    return {
      version: 4,
      appName: 'Plan4U',
      appVersion: '0.0.90',
      email: this.cloudEmail,
      timestamp: new Date().toISOString(),
      tabs: this.tabs,
      sections: this.tabSections || {},
      tabSections: this.tabSections || {},
      tasks: this.tasks,
      dailyTasks: this.dailyTasks,
      stickers: this.stickers || {},
      dayHistory: this.dayHistory,
      achievements: this.achievementsData,
      history: this.history,
      settings: this.settings,
      streak: this.streakData,
      pet: this.petSystem ? this.petSystem.getPetSnapshot() : (JSON.parse(localStorage.getItem('plan4u_pet_data') || '{}'))
    };
  }

  // Overwrite (PUT) single user object in cloud
  async syncToCloud(silent = false) {
    if (!this.cloudEmail || !this.cloudObjectId) return false;

    if (!navigator.onLine) {
      localStorage.setItem('plan4u_pending_cloud_sync', '1');
      this.updateCloudUI();
      if (!silent) {
        this.showToast('Нет сети. Данные сохранены в памяти и отправятся при подключении', '📡');
      }
      return false;
    }

    try {
      const bundle = this.prepareDataBundle();
      const payloadString = JSON.stringify(bundle);

      const updateRes = await fetch(`${this.PLAN4U_API_URL}/${this.cloudObjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `plan4u_user_${this.cloudEmail}`,
          data: { payload: payloadString, email: this.cloudEmail, updatedAt: Date.now() }
        })
      });

      if (updateRes.ok) {
        const now = new Date();
        const formatted = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem('plan4u_last_cloud_sync', `Синхронизировано: ${formatted}`);
        localStorage.removeItem('plan4u_pending_cloud_sync');
        this.updateCloudUI();

        if (!silent) {
          triggerHaptic([30, 40]);
          this.showToast('Облако Plan4U успешно обновлено! ☁️', '✓');
        }
        return true;
      }
    } catch (e) {
      console.warn('Cloud sync error:', e);
      localStorage.setItem('plan4u_pending_cloud_sync', '1');
      this.updateCloudUI();
      if (!silent) {
        this.showToast('Ошибка сети. Данные сохранены локально', '📡');
      }
    }
    return false;
  }

  // Restore data from Cloud
  async restoreFromCloud() {
    if (!this.cloudEmail || !this.cloudObjectId) {
      this.showToast('Сначала подключите ваш Email', '⚠️');
      return false;
    }

    if (!navigator.onLine) {
      this.showToast('Для загрузки из облака требуется подключение к интернету', '📡');
      return false;
    }

    this.showToast('Загрузка из облака Plan4U...', '☁️');

    try {
      const getRes = await fetch(`${this.PLAN4U_API_URL}/${this.cloudObjectId}`);
      if (getRes.ok) {
        const data = await getRes.json();
        const bundle = JSON.parse(data.data.payload || '{}');
        if (bundle && (bundle.tabs || bundle.tasks || bundle.dailyTasks || bundle.settings || bundle.sections || bundle.tabSections)) {
          await this.applyRestoredData(bundle);

          const now = new Date();
          const formatted = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          localStorage.setItem('plan4u_last_cloud_sync', `Загружено: ${formatted}`);
          localStorage.removeItem('plan4u_pending_cloud_sync');
          this.updateCloudUI();

          triggerHaptic([30, 50, 30]);
          this.showToast('Все дела, разделы и настройки успешно загружены из облака! ✨', '☁️');
          return true;
        }
      }
    } catch (e) {
      console.warn('Restore from cloud error:', e);
      this.showToast('Не удалось загрузить данные из облака', '⚠️');
    }
    return false;
  }

  // Unified complete restore handler for Cloud & File Backup
  async applyRestoredData(data) {
    if (!data || typeof data !== 'object') return false;

    // 1. Tabs (including user-created custom tabs)
    if (Array.isArray(data.tabs) && data.tabs.length > 0) {
      this.tabs = data.tabs;
    }

    // 2. Sections / Blocks (for each tab)
    const restoredSections = data.sections || data.tabSections;
    if (restoredSections && typeof restoredSections === 'object') {
      this.tabSections = restoredSections;
      this.saveSections();
    }

    // 3. Daily Tasks (all dates)
    if (data.dailyTasks && typeof data.dailyTasks === 'object') {
      this.dailyTasks = data.dailyTasks;
    }

    // 4. Tasks (custom tabs, buy, watch, etc.)
    if (data.tasks && typeof data.tasks === 'object') {
      this.tasks = { ...this.tasks, ...data.tasks };
    }

    // Sync today's / selected date tasks with tasks.todo
    const todayStr = this.getTodayDateString();
    const targetDate = this.selectedDate || todayStr;
    if (this.dailyTasks && this.dailyTasks[targetDate]) {
      this.tasks.todo = this.dailyTasks[targetDate];
    } else if (this.tasks && this.tasks.todo) {
      if (!this.dailyTasks) this.dailyTasks = {};
      this.dailyTasks[targetDate] = this.tasks.todo;
    }

    // 5. Day History (archived completed tasks)
    if (data.dayHistory && typeof data.dayHistory === 'object') {
      this.dayHistory = data.dayHistory;
    }

    // 6. Autocomplete History
    if (data.history && typeof data.history === 'object') {
      this.history = data.history;
    }

    // 7. Achievements & Streak
    if (data.achievements && typeof data.achievements === 'object') {
      this.achievementsData = data.achievements;
    }
    if (data.streak && typeof data.streak === 'object') {
      this.streakData = data.streak;
      try {
        localStorage.setItem('todo_notebook_daily_streak', JSON.stringify(this.streakData));
      } catch (e) { }
    }

    // 8. Settings, Themes, Fonts, Language
    if (data.settings && typeof data.settings === 'object') {
      this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    }

    // 9. Pet Companion (Maine Coon state, level, treats, costumes)
    if (data.pet && this.petSystem && typeof this.petSystem.restorePetData === 'function') {
      this.petSystem.restorePetData(data.pet);
    }

    // 10. Notebook Stickers
    if (data.stickers && typeof data.stickers === 'object') {
      this.stickers = data.stickers;
    }

    // 11. Persist everything to LocalStorage, IndexedDB and Disk
    this.saveTabs();
    this.saveSections();
    this.saveTasks();
    this.saveDailyTasks();
    this.saveDayHistory();
    this.saveHistory();
    this.saveAchievementsData();
    this.saveSettings();
    this.saveStickers();

    // 12. Apply visual state & update UI components
    this.currentTab = this.tabs.length > 0 ? this.tabs[0].id : 'todo';
    this.applySettings();
    this.updateDateWidget();
    this.updateTrophyWidgetAura();
    this.renderTabs();
    this.render();
    this.updateWorkloadWidget();
    this.syncWithNativeWidget?.();

    return true;
  }

  // Auto-sync debounced trigger for Cloud Sync
  scheduleCloudSync() {
    if (!this.cloudEmail || !this.cloudObjectId || this.cloudAutoSync === false) return;
    if (this._cloudAutoSyncTimer) clearTimeout(this._cloudAutoSyncTimer);
    this._cloudAutoSyncTimer = setTimeout(() => {
      this.syncToCloud(true);
    }, 1500);
  }

  // Sign out / Disconnect Cloud
  handleCloudSignOut() {
    triggerHaptic(15);
    this.cloudEmail = null;
    this.cloudObjectId = null;
    localStorage.removeItem('plan4u_cloud_email');
    localStorage.removeItem('plan4u_cloud_object_id');
    localStorage.removeItem('plan4u_pending_cloud_sync');
    localStorage.removeItem('plan4u_last_cloud_sync');
    this.updateCloudUI();
    this.showToast('Облачный аккаунт отключен', 'ℹ️');
  }

  // Standardized complete database backup snapshot
  getBackupSnapshot() {
    return {
      version: 4,
      appName: 'Plan4U',
      appVersion: '0.0.90',
      timestamp: new Date().toISOString(),
      tabs: this.tabs,
      sections: this.tabSections || {},
      tabSections: this.tabSections || {},
      tasks: this.tasks,
      dailyTasks: this.dailyTasks,
      dayHistory: this.dayHistory,
      achievements: this.achievementsData,
      history: this.history,
      settings: this.settings,
      streak: this.streakData,
      stickers: this.stickers || {},
      pet: this.petSystem ? this.petSystem.getPetSnapshot() : (JSON.parse(localStorage.getItem('plan4u_pet_data') || '{}'))
    };
  }

  // Update timestamp and settings for last backup
  updateLastSyncTimestamp() {
    const now = new Date();
    const formatted = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    this.settings.lastSync = formatted;
    this.saveSettings();
    if (this.cloudLastSyncText) {
      this.cloudLastSyncText.textContent = `Последняя выгрузка: ${formatted}`;
    }
  }

  // Direct Export / Save to Google Drive
  async saveToGoogleDriveDirect() {
    triggerHaptic(25);
    const backupData = this.getBackupSnapshot();
    const fileName = 'Plan4U_Database.json';
    const jsonString = JSON.stringify(backupData, null, 2);

    try {
      // 1. Native Android Capacitor Filesystem + Share Sheet (Prompts Google Drive directly)
      if (window.Capacitor && window.Capacitor.Plugins) {
        const { Filesystem, Share } = window.Capacitor.Plugins;
        if (Filesystem) {
          const writeRes = await Filesystem.writeFile({
            path: fileName,
            data: jsonString,
            directory: 'CACHE',
            encoding: 'utf8'
          });

          const fileUri = writeRes.uri;
          if (Share && fileUri) {
            await Share.share({
              title: 'Plan4U_Database.json',
              text: 'Резервная копия Plan4U_Database.json',
              files: [fileUri],
              url: fileUri,
              dialogTitle: 'Сохранить на Google Диск'
            });

            const now = new Date();
            const formatted = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            localStorage.setItem('plan4u_last_gdrive_export', formatted);
            if (this.cloudLastSyncText) {
              this.cloudLastSyncText.innerHTML = `Сохранено на Диск: <b>${formatted}</b>`;
            }

            this.hasExportedBackupFlag = true;
            localStorage.setItem('todo_notebook_flag_backup', '1');
            this.checkAchievements(true);
            return;
          }
        }
      }

      // 2. Web Share API with File
      if (navigator.canShare) {
        const file = new File([jsonString], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Plan4U_Database.json',
            text: 'Резервная копия базы Plan4U'
          });

          const now = new Date();
          const formatted = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          localStorage.setItem('plan4u_last_gdrive_export', formatted);
          if (this.cloudLastSyncText) {
            this.cloudLastSyncText.innerHTML = `Сохранено на Диск: <b>${formatted}</b>`;
          }

          this.hasExportedBackupFlag = true;
          localStorage.setItem('todo_notebook_flag_backup', '1');
          this.checkAchievements(true);
          return;
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Google Drive share error:', err);
      }
    }

    // Fallback: download file
    this.downloadLocalBackup();
  }

  // Download local backup JSON file / Save to phone
  async downloadLocalBackup() {
    triggerHaptic(20);
    const backupData = this.getBackupSnapshot();
    const fileName = 'Plan4U_Database.json';
    const jsonString = JSON.stringify(backupData, null, 2);

    let savedViaCapacitor = false;

    // 1. Native Android Capacitor: Write file to device & trigger Android Native Save/Share Sheet
    if (window.Capacitor && window.Capacitor.Plugins) {
      const { Filesystem, Share } = window.Capacitor.Plugins;
      if (Filesystem) {
        try {
          // Write to Documents and Data folders on device
          await Filesystem.writeFile({
            path: fileName,
            data: jsonString,
            directory: 'DOCUMENTS',
            encoding: 'utf8',
            recursive: true
          }).catch(() => { });

          await Filesystem.writeFile({
            path: `Plan4U/${fileName}`,
            data: jsonString,
            directory: 'DATA',
            encoding: 'utf8',
            recursive: true
          }).catch(() => { });

          // Write to Cache and invoke native Share Sheet so user can pick 'Save to Downloads/Device'
          const writeRes = await Filesystem.writeFile({
            path: fileName,
            data: jsonString,
            directory: 'CACHE',
            encoding: 'utf8'
          });

          if (Share && writeRes && writeRes.uri) {
            await Share.share({
              title: fileName,
              text: 'Резервная копия базы Plan4U',
              files: [writeRes.uri],
              url: writeRes.uri,
              dialogTitle: 'Сохранить копию на телефон'
            });
            savedViaCapacitor = true;
          }
        } catch (fsErr) {
          console.warn('Capacitor local backup save error:', fsErr);
        }
      }
    }

    if (!savedViaCapacitor) {
      // 2. Web Share API with File (Mobile Chrome / PWA)
      if (navigator.canShare) {
        try {
          const file = new File([jsonString], fileName, { type: 'application/json' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: fileName,
              text: 'Резервная копия базы Plan4U'
            });
            savedViaCapacitor = true;
          }
        } catch (shareErr) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Web Share error:', shareErr);
          }
        }
      }

      // 3. Fallback for Desktop Browser: standard browser download anchor
      try {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', url);
        downloadAnchor.setAttribute('download', fileName);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (dlErr) {
        console.warn('Browser download fallback error:', dlErr);
      }
    }

    this.hasExportedBackupFlag = true;
    localStorage.setItem('todo_notebook_flag_backup', '1');
    this.checkAchievements(true);

    const now = new Date();
    const formatted = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('plan4u_last_local_export', formatted);
    if (this.cloudLastSyncText) {
      this.cloudLastSyncText.innerHTML = `Копия на телефоне: <b>${formatted}</b>`;
    }

    this.showToast('Файл Plan4U_Database.json готов! 💾', '✓');
  }

  // Export full backup alias
  exportBackup() {
    this.saveToGoogleDriveDirect();
  }

  // Import backup from uploaded JSON file
  importBackup(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && (data.tabs || data.tasks || data.dailyTasks || data.settings || data.sections || data.tabSections)) {
          await this.applyRestoredData(data);
          this.closeSettingsModal();
          triggerHaptic([30, 40, 30]);
          this.showToast('Все данные, разделы, настройки и питомец успешно восстановлены! ✨', '🎉');
        } else {
          this.showToast('Неверный формат файла бэкапа', '⚠️');
        }
      } catch (err) {
        console.error('Import error:', err);
        this.showToast('Ошибка при чтении файла бэкапа', '⚠️');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // Google Drive Cloud Sync / Share integration
  async syncGoogleDrive() {
    triggerHaptic(20);
    const backupData = this.getBackupSnapshot();
    const fileName = this.getFormattedBackupFilename('Plan4U');
    const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const backupFile = new File([jsonBlob], fileName, { type: 'application/json' });

    this.hasExportedBackupFlag = true;
    localStorage.setItem('todo_notebook_flag_backup', '1');
    this.checkAchievements(true);

    // 1. If Web Share API is available (Android native sheet -> Save to Google Drive)
    if (navigator.canShare && navigator.canShare({ files: [backupFile] })) {
      try {
        await navigator.share({
          title: 'Plan4U Backup',
          text: 'Сохранить резервную копию Plan4U в Google Диск',
          files: [backupFile]
        });
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + ', ' + now.toLocaleDateString('ru-RU');
        this.settings.lastSync = timeStr;
        this.saveSettings();
        if (this.cloudLastSyncText) {
          this.cloudLastSyncText.textContent = `Последняя копия: ${timeStr}`;
        }
        this.showToast('Резервная копия отправлена в Google Диск! ☁️', '📁');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    // 2. Fallback to direct file download
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + ', ' + now.toLocaleDateString('ru-RU');
    this.settings.lastSync = timeStr;
    this.saveSettings();
    if (this.cloudLastSyncText) {
      this.cloudLastSyncText.textContent = `Последняя копия: ${timeStr}`;
    }
    this.showToast('Файл бэкапа сохранен для загрузки в Google Диск! 📁', '💾');
  }

  // Automatic Background Backup & Synchronization Engine
  initAutoBackupEngine() {
    this._autoBackupTimer = null;
    this.triggerBackgroundBackup = () => {
      if (this.settings.autoBackupEnabled === false) return;
      clearTimeout(this._autoBackupTimer);
      this._autoBackupTimer = setTimeout(() => {
        this.performAutoBackup(true);
      }, 2500);
    };

    // 1. Periodic background sync every 15 minutes (active only while app is open)
    const startPeriodicBackup = () => {
      if (this._periodicBackupInterval) clearInterval(this._periodicBackupInterval);
      this._periodicBackupInterval = setInterval(() => {
        if (this.settings.autoBackupEnabled !== false && document.visibilityState === 'visible') {
          this.performAutoBackup(true);
        }
      }, 15 * 60 * 1000);
    };

    startPeriodicBackup();

    // 2. Auto-save on visibility change / backgrounding / page exit (pauses timers when asleep)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (this._periodicBackupInterval) {
          clearInterval(this._periodicBackupInterval);
          this._periodicBackupInterval = null;
        }
        if (this.settings.autoBackupEnabled !== false) {
          this.performAutoBackup(true);
        }
      } else if (document.visibilityState === 'visible') {
        startPeriodicBackup();
      }
    });
    window.addEventListener('pagehide', () => {
      if (this.settings.autoBackupEnabled !== false) this.performAutoBackup(true);
    });
    window.addEventListener('beforeunload', () => {
      if (this.settings.autoBackupEnabled !== false) this.performAutoBackup(true);
    });

    // 3. Initial silent backup on start
    setTimeout(() => {
      if (this.settings.autoBackupEnabled !== false) {
        this.performAutoBackup(true);
      }
    }, 3500);
  }

  async performAutoBackup(isSilent = false) {
    try {
      const now = new Date();
      const dateStr = this.getTodayDateString();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const fullSnapshot = {
        ...this.getBackupSnapshot(),
        createdAt: now.toISOString(),
        backupDate: dateStr,
        backupTime: timeStr
      };

      // 1. Save to dedicated device filesystem Plan4U/backups/
      const backupFilename = this.getFormattedBackupFilename('Plan4U');
      await Plan4UStorage.saveFile('backups/plan4u_autobackup_latest.json', fullSnapshot);
      await Plan4UStorage.saveFile(`backups/${backupFilename}`, fullSnapshot);

      // 2. Mirror into LocalStorage
      localStorage.setItem('plan4u_last_autobackup_time', timeStr);
      localStorage.setItem('plan4u_last_autobackup_date', dateStr);

      this.updateAutoBackupStatusUI(timeStr);

      if (!isSilent) {
        this.showToast(this.settings.lang === 'en' ? `Auto-backup saved (${timeStr})` : `Резервный снимок сохранён (${timeStr})`, '🟢');
      }
    } catch (e) {
      console.warn('Auto-backup error:', e);
    }
  }

  updateAutoBackupStatusUI(timeOverride = null) {
    const timeStr = timeOverride || localStorage.getItem('plan4u_last_autobackup_time') || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isAutoActive = this.settings.autoBackupEnabled !== false;
    const statusBadge = document.getElementById('cloudStatusBadge');
    const syncText = document.getElementById('cloudLastSyncText');

    if (statusBadge) {
      statusBadge.textContent = isAutoActive ? (this.settings.lang === 'en' ? 'Active' : (this.settings.lang === 'uk' ? 'Активна' : 'Активна')) : (this.settings.lang === 'en' ? 'Paused' : 'На паузе');
      statusBadge.style.background = isAutoActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.2)';
      statusBadge.style.color = isAutoActive ? '#10b981' : '#64748b';
    }

    if (syncText) {
      const msg = isAutoActive
        ? (this.settings.lang === 'en' ? `Auto-saved in Plan4U folder at ${timeStr}` : (this.settings.lang === 'uk' ? `Автозбережено у папку Plan4U о ${timeStr}` : `Автосохранено в папку Plan4U в ${timeStr}`))
        : (this.settings.lang === 'en' ? 'Auto-backup is currently disabled in settings' : (this.settings.lang === 'uk' ? 'Автобекап наразі призупинено в налаштуваннях' : 'Автоматический бэкап приостановлен в настройках'));
      syncText.textContent = msg;
    }
  }

  // Open Calendar Modal
  openCalendarModal() {
    this.dismissActiveKeyboard();
    if (!this.calendarModalBackdrop) return;
    this.tempSelectedDate = this.selectedDate || this.getTodayDateString();
    const [y, m, d] = this.tempSelectedDate.split('-').map(Number);
    this.displayedCalendarMonth = new Date(y, m - 1, 1);
    this.renderCalendar();

    this._calendarModalOpenedAt = Date.now();
    this.calendarModalBackdrop.classList.add('open');
    this.calendarModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  // Close Calendar Modal
  closeCalendarModal() {
    if (this.calendarModalBackdrop) {
      this.calendarModalBackdrop.classList.remove('open');
      this.calendarModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // Synchronize notebook sheet to selected date
  syncSelectedDate() {
    const todayStr = this.getTodayDateString();
    if (this.selectedDate === todayStr) {
      this.rolloverPastUncompletedTasks();
    }
    if (!this.dailyTasks[this.selectedDate]) {
      this.dailyTasks[this.selectedDate] = [];
    }
    this.tasks.todo = this.dailyTasks[this.selectedDate];
    this.updateDateWidget();
    this.render();
    this.renderStickers();
    this.updateWorkloadWidget();
    this.renderTabs();
    this.syncWithNativeWidget?.();
  }

  // Render Calendar Month & Days Grid with full localization
  renderCalendar() {
    if (!this.calendarDaysGrid) return;
    this.calendarDaysGrid.innerHTML = '';

    const lang = this.settings.lang || 'ru';
    const dict = I18N[lang] || I18N.ru;

    const currentYear = this.displayedCalendarMonth.getFullYear();
    const currentMonth = this.displayedCalendarMonth.getMonth();

    const monthNames = dict.monthsNominative || ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    if (this.calendarMonthTitle) {
      this.calendarMonthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Weekdays row
    const weekdaysEl = document.querySelector('.calendar-weekdays');
    if (weekdaysEl && dict.weekdaysShort) {
      weekdaysEl.innerHTML = dict.weekdaysShort.map(w => `<span>${w}</span>`).join('');
    }

    const todayStr = this.getTodayDateString();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // In JS: 0 is Sunday, 1 is Monday... convert so Monday is 0
    let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.textContent = pDay;
      this.calendarDaysGrid.appendChild(cell);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === this.tempSelectedDate;

      cell.className = `calendar-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
      cell.textContent = day;

      // Has tasks or history check
      const dayTasks = this.dailyTasks[dateStr] || [];
      const historyList = this.dayHistory[dateStr] || [];
      if (dayTasks.length > 0 || historyList.length > 0) {
        cell.classList.add('has-tasks');
        const dot = document.createElement('span');
        dot.className = 'day-dot';
        cell.appendChild(dot);
      }

      cell.onclick = () => {
        triggerHaptic(15);
        this.tempSelectedDate = dateStr;
        this.renderCalendar();
      };

      this.calendarDaysGrid.appendChild(cell);
    }

    // Next month padding days to fill 35 or 42 grid slots
    const totalRendered = startDayOfWeek + daysInMonth;
    const remaining = totalRendered % 7 === 0 ? 0 : 7 - (totalRendered % 7);
    for (let i = 1; i <= remaining; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.textContent = i;
      this.calendarDaysGrid.appendChild(cell);
    }

    // Update Date Info Panel
    if (this.calendarDateInfo) {
      const [y, m, d] = this.tempSelectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = dict.weekdays || ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const monthsGenitive = dict.monthsGenitive || ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

      if (this.calendarInfoDate) {
        if (lang === 'en') {
          this.calendarInfoDate.textContent = `${monthsGenitive[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()} (${days[dateObj.getDay()]})`;
        } else {
          this.calendarInfoDate.textContent = `${dateObj.getDate()} ${monthsGenitive[dateObj.getMonth()]} ${dateObj.getFullYear()} (${days[dateObj.getDay()]})`;
        }
      }

      const isTempToday = this.tempSelectedDate === todayStr;
      if (this.calendarInfoBadge) {
        this.calendarInfoBadge.textContent = isTempToday ? dict.today : dict.selectedDay;
        this.calendarInfoBadge.classList.toggle('not-today', !isTempToday);
      }

      const selectedDayTasks = this.dailyTasks[this.tempSelectedDate] || [];
      const completedToday = selectedDayTasks.filter(t => t.completed).length;
      const historyList = this.dayHistory[this.tempSelectedDate] || [];

      if (this.calendarInfoStats) {
        if (selectedDayTasks.length > 0) {
          const tasksWord = lang === 'en' ? 'Tasks' : (lang === 'uk' ? 'Завдань на день' : 'Задач на день');
          const doneWord = lang === 'en' ? 'Completed' : (lang === 'uk' ? 'Виконано' : 'Выполнено');
          const histWord = lang === 'en' ? 'In history' : (lang === 'uk' ? 'В історії' : 'В истории');
          this.calendarInfoStats.textContent = `${tasksWord}: ${selectedDayTasks.length} • ${doneWord}: ${completedToday} ${historyList.length > 0 ? `• ${histWord}: ${historyList.length}` : ''}`;
        } else if (historyList.length > 0) {
          const histText = lang === 'en' ? `In history for this day: ${historyList.length} completed tasks` : (lang === 'uk' ? `В історії цього дня: ${historyList.length} виконаних справ` : `В истории этого дня: ${historyList.length} выполненных дел`);
          this.calendarInfoStats.textContent = histText;
        } else {
          const emptyText = isTempToday
            ? (lang === 'en' ? 'Click "Open this day" to plan tasks' : (lang === 'uk' ? 'Натисніть «Відкрити цей день», щоб планувати справи' : 'Нажмите «Открыть этот день», чтобы планировать задачи'))
            : (lang === 'en' ? 'No tasks yet for this day. Open it to make a plan!' : (lang === 'uk' ? 'На цей день поки немає записів. Відкрийте його для планування!' : 'На этот день пока нет записей. Откройте его, чтобы составить план!'));
          this.calendarInfoStats.textContent = emptyText;
        }
      }
    }
  }

  // Load achievements progress & unlock timestamps from LocalStorage & Plan4UStorage
  loadAchievementsData() {
    try {
      const saved = localStorage.getItem('plan4u_achievements.json') || localStorage.getItem('todo_notebook_achievements');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load achievements:', e);
    }
    return { unlocked: {}, viewed: {} };
  }

  saveAchievementsData() {
    try {
      localStorage.setItem('todo_notebook_achievements', JSON.stringify(this.achievementsData));
      Plan4UStorage.saveFile('achievements.json', this.achievementsData);
    } catch (e) {
      console.warn('Could not save achievements:', e);
    }
  }

  // Calculate live app metrics across all tabs and dates for achievements
  calculateStats() {
    let totalCompleted = 0;
    let morningCompleted = 0;
    let dayTasksCompleted = 0;
    let eveningCompleted = 0;
    let freeCompleted = 0;
    let hasDay100Percent = false;
    let has10TasksDay = false;
    let hasNightTask = false;
    let hasFutureTask = false;
    let hasNotesTask = false;
    let totalHistoryItems = 0;

    const todayStr = this.getTodayDateString();

    // Check all dayHistory
    const livedDaysKeys = Object.keys(this.dayHistory || {});
    const livedDaysCount = livedDaysKeys.filter(k => (this.dayHistory[k] || []).length > 0).length;

    livedDaysKeys.forEach(dayKey => {
      const items = this.dayHistory[dayKey] || [];
      totalHistoryItems += items.length;
      totalCompleted += items.length;
      if (items.length >= 10) has10TasksDay = true;
      items.forEach(item => {
        if (item.period === 'УТРО') morningCompleted++;
        if (item.period === 'ДЕНЬ') dayTasksCompleted++;
        if (item.period === 'ВЕЧЕР') eveningCompleted++;
        if (item.period === 'В СВОБОДНОЕ ВРЕМЯ') freeCompleted++;
        if (item.notes) hasNotesTask = true;
      });
    });

    // Check dailyTasks
    Object.keys(this.dailyTasks || {}).forEach(dayKey => {
      const tasks = this.dailyTasks[dayKey] || [];
      if (dayKey > todayStr && tasks.length > 0) {
        hasFutureTask = true;
      }
      if (tasks.length > 0 && tasks.every(t => t.completed)) {
        hasDay100Percent = true;
      }
      const completedCount = tasks.filter(t => t.completed).length;
      if (completedCount >= 10) has10TasksDay = true;
      tasks.forEach(t => {
        if (t.completed) {
          if (t.period === 'УТРО') morningCompleted++;
          if (t.period === 'ДЕНЬ') dayTasksCompleted++;
          if (t.period === 'ВЕЧЕР') eveningCompleted++;
          if (t.period === 'В СВОБОДНОЕ ВРЕМЯ') freeCompleted++;
          if (t.notes) hasNotesTask = true;
        }
      });
    });

    // Persistent tabs tasks
    const buyTasks = this.tasks.buy || [];
    const buyCompletedCount = buyTasks.filter(t => t.completed).length;

    const watchTasks = this.tasks.watch || [];
    const watchCompletedCount = watchTasks.filter(t => t.completed).length;

    // Add other persistent custom tabs tasks
    Object.keys(this.tasks || {}).forEach(k => {
      if (k !== 'todo' && k !== 'buy' && k !== 'watch') {
        const list = this.tasks[k] || [];
        list.forEach(t => {
          if (t.completed) {
            totalCompleted++;
            if (t.notes) hasNotesTask = true;
          }
        });
      }
    });

    // Check current hour for night owl (23:00 - 05:00)
    const currentHour = new Date().getHours();
    if (currentHour >= 23 || currentHour < 5) {
      if (totalCompleted > 0) hasNightTask = true;
    }

    const streakCount = this.streakData ? (this.streakData.count || 1) : 1;
    const tabsCount = (this.tabs || []).length;
    const hasCustomizedSettings = (this.settings.accentColorId !== 'magenta' || this.settings.theme !== 'light');
    const hasDarkTheme = (this.settings.theme === 'dark');
    const hasCustomPattern = (this.tabs || []).some(t => t.pattern === 'lines');
    const hasGridPattern = (this.tabs || []).some(t => t.pattern === 'grid');
    const hasDotsPattern = (this.tabs || []).some(t => t.pattern === 'dots');
    const hasBlankPattern = (this.tabs || []).some(t => t.pattern === 'blank');
    const unlockedCount = Object.keys(this.achievementsData ? this.achievementsData.unlocked : {}).length;

    return {
      totalCompleted,
      morningCompletedCount: morningCompleted,
      dayTasksCompletedCount: dayTasksCompleted,
      eveningCompletedCount: eveningCompleted,
      freeCompletedCount: freeCompleted,
      buyCompletedCount,
      watchCompletedCount,
      livedDaysCount,
      totalHistoryItems,
      hasDay100Percent,
      has10TasksDay,
      hasNotesTask,
      streakCount,
      tabsCount,
      hasCustomizedSettings,
      hasNightTask,
      hasFutureTask,
      hasDarkTheme,
      hasCustomPattern,
      hasGridPattern,
      hasDotsPattern,
      hasBlankPattern,
      hasDeferredTask: !!this.hasDeferredTaskFlag,
      hasExportedBackup: !!this.hasExportedBackupFlag,
      unlockedCount
    };
  }

  // Check achievements progress and trigger celebration if newly unlocked
  checkAchievements(notify = true) {
    if (!this.achievementsData) this.achievementsData = { unlocked: {}, viewed: {} };
    if (!this.achievementsData.unlocked) this.achievementsData.unlocked = {};
    if (!this.achievementsData.viewed) this.achievementsData.viewed = {};

    const stats = this.calculateStats();
    let newlyUnlocked = [];

    ACHIEVEMENTS_LIST.forEach(ach => {
      const isAlreadyUnlocked = !!this.achievementsData.unlocked[ach.id];
      if (!isAlreadyUnlocked) {
        let unlocked = false;
        if (ach.type === 'onetime') {
          unlocked = ach.check(stats);
        } else if (ach.type === 'progressive') {
          const progress = ach.getProgress(stats);
          unlocked = progress >= ach.target;
        }

        if (unlocked) {
          this.achievementsData.unlocked[ach.id] = new Date().toISOString();
          this.achievementsData.viewed[ach.id] = false;
          newlyUnlocked.push(ach);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveAchievementsData();
      this.updateTrophyWidgetAura();

      if (notify) {
        triggerHaptic([40, 70, 50], 'achievement');
        this.playAchievementSound();
        const firstAch = newlyUnlocked[0];
        this.showToast(`🏆 Достижение получено: "${firstAch.title}"!`, firstAch.icon);
      }
    }
  }

  // Update pulsating aura on Trophy Widget if there are unclaimed/unviewed achievements
  updateTrophyWidgetAura() {
    if (!this.widgetMedal || !this.achievementsData) return;
    const hasUnclaimed = Object.keys(this.achievementsData.unlocked || {}).some(id => !this.achievementsData.viewed[id]);
    this.widgetMedal.classList.toggle('has-unclaimed', hasUnclaimed);
    if (hasUnclaimed) {
      this.widgetMedal.title = '🏆 У вас есть новые полученные достижения! Нажмите, чтобы открыть меню';
    } else {
      const unlockedCount = Object.keys(this.achievementsData.unlocked || {}).length;
      this.widgetMedal.title = `🏆 Достижения (${unlockedCount} / ${ACHIEVEMENTS_LIST.length} открыто)`;
    }
  }

  // Open Achievements Modal
  openAchievementsModal() {
    this.dismissActiveKeyboard();
    if (!this.achievementsModalBackdrop) return;

    this.renderAchievements();
    this.updateTrophyWidgetAura();
    this._achievementsModalOpenedAt = Date.now();
    this.achievementsModalBackdrop.classList.add('open');
    this.achievementsModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  // Close Achievements Modal
  closeAchievementsModal() {
    if (this.achievementsModalBackdrop) {
      this.achievementsModalBackdrop.classList.remove('open');
      this.achievementsModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // Close all open modals simultaneously (for ESC key or reset)
  closeAllModals() {
    this.closeTaskModal();
    this.closeEditTabModal();
    this.closeNewTabModal();
    this.closeSettingsModal();
    this.closeCalendarModal();
    this.closeAchievementsModal();
    this.closeConfirmModal();
    this.closeLightbox();
  }

  // Render Achievements 2-column cards grid
  renderAchievements() {
    if (!this.achievementsGrid) return;
    const lang = this.settings.lang || 'ru';
    const stats = this.calculateStats();
    const unlockedCount = Object.keys(this.achievementsData.unlocked || {}).length;
    const totalCount = ACHIEVEMENTS_LIST.length;
    const percent = Math.round((unlockedCount / totalCount) * 100);

    if (this.achievementsUnlockedCount) {
      this.achievementsUnlockedCount.textContent = `${unlockedCount} / ${totalCount}`;
    }
    if (this.achievementsProgressBarFill) {
      this.achievementsProgressBarFill.style.width = `${percent}%`;
    }
    if (this.achievementsProgressPercent) {
      const progLabel = lang === 'en' ? `${percent}% completed (${unlockedCount} of ${totalCount})` : (lang === 'uk' ? `${percent}% пройдено (${unlockedCount} з ${totalCount})` : `${percent}% пройдено (${unlockedCount} из ${totalCount})`);
      this.achievementsProgressPercent.textContent = progLabel;
    }

    // Filter items by category & search query
    const query = this.achievementSearchQuery || '';
    const filtered = ACHIEVEMENTS_LIST.filter(ach => {
      if (this.activeAchievementFilter === 'streaks' && ach.category !== 'streaks') return false;
      if (this.activeAchievementFilter === 'tasks' && ach.category !== 'tasks') return false;
      if (this.activeAchievementFilter === 'watch' && ach.category !== 'watch') return false;
      if (this.activeAchievementFilter === 'buy' && ach.category !== 'buy') return false;
      if (this.activeAchievementFilter === 'special' && ach.category !== 'special') return false;
      if (this.activeAchievementFilter === 'unlocked' && !this.achievementsData.unlocked[ach.id]) return false;

      if (query) {
        const text = (ach.title + ' ' + ach.desc + ' ' + (ach.unit || '') + ' ' + (ach.tierRank || '')).toLowerCase();
        if (!text.includes(query)) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      const emptyTitle = lang === 'en' ? 'Nothing found' : (lang === 'uk' ? 'Нічого не знайдено' : 'Ничего не найдено');
      const emptyHint = lang === 'en' ? 'Try changing the category or search query' : (lang === 'uk' ? 'Спробуйте змінити категорію або пошуковий запит' : 'Попробуйте изменить категорию или поисковый запрос');
      this.achievementsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; color: #a8a29e;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 700; font-size: 15px; color: #78716c;">${emptyTitle}</div>
          <div style="font-size: 13px; margin-top: 4px;">${emptyHint}</div>
        </div>
      `;
      return;
    }

    // Smart Sorting:
    // 1) Newly unlocked & unacknowledged (aura-glow) achievements ALWAYS first at the top
    // 2) Unlocked/completed achievements next
    // 3) Locked achievements last
    filtered.sort((a, b) => {
      const aUnlocked = !!this.achievementsData.unlocked[a.id];
      const bUnlocked = !!this.achievementsData.unlocked[b.id];
      const aNew = aUnlocked && !this.achievementsData.viewed[a.id];
      const bNew = bUnlocked && !this.achievementsData.viewed[b.id];

      if (aNew && !bNew) return -1;
      if (!aNew && bNew) return 1;
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return 0;
    });

    const badgeUnlocked = lang === 'en' ? '✓ Unlocked' : (lang === 'uk' ? '✓ Відкрито' : '✓ Открыто');
    const badgeLocked = lang === 'en' ? '🔒 Locked' : (lang === 'uk' ? '🔒 Закрито' : '🔒 Закрыто');
    const labelProg = lang === 'en' ? 'Progress:' : (lang === 'uk' ? 'Прогрес:' : 'Прогресс:');
    const labelStatus = lang === 'en' ? 'Status:' : (lang === 'uk' ? 'Статус:' : 'Статус:');
    const doneText = lang === 'en' ? 'Completed' : (lang === 'uk' ? 'Виконано' : 'Выполнено');
    const notDoneText = lang === 'en' ? 'Not completed' : (lang === 'uk' ? 'Не виконано' : 'Не выполнено');

    let html = '';
    filtered.forEach(ach => {
      const isUnlocked = !!this.achievementsData.unlocked[ach.id];
      const isUnviewed = isUnlocked && !this.achievementsData.viewed[ach.id];
      let targetVal = ach.target || 1;
      let progressPercent = isUnlocked ? 100 : 0;
      let progressText = isUnlocked ? doneText : notDoneText;

      if (ach.type === 'progressive') {
        const currentProg = Math.min(ach.getProgress(stats), targetVal);
        progressPercent = Math.min(Math.round((currentProg / targetVal) * 100), 100);
        progressText = `${currentProg} / ${targetVal} ${ach.unit}`;
      }

      html += `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${isUnviewed ? 'aura-glow' : ''}" data-ach-id="${ach.id}">
          <div>
            <div class="achievement-icon-row">
              <span class="achievement-icon">${ach.icon}</span>
              <span class="achievement-status-badge">${isUnlocked ? badgeUnlocked : badgeLocked}</span>
            </div>
            <div class="achievement-title">${this.escapeHtml(ach.title)}</div>
            <div class="achievement-desc">${this.escapeHtml(ach.desc)}</div>
          </div>
          <div class="achievement-progress-box">
            <div class="achievement-progress-bar-bg">
              <div class="achievement-progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="achievement-progress-text">
              <span>${ach.type === 'progressive' ? labelProg : labelStatus}</span>
              <span>${progressText}</span>
            </div>
          </div>
        </div>
      `;
    });

    this.achievementsGrid.innerHTML = html;

    // Attach click listeners to completed cards to extinguish the breathing aura on click
    const unlockedCards = this.achievementsGrid.querySelectorAll('.achievement-card.unlocked');
    unlockedCards.forEach(card => {
      card.addEventListener('click', () => {
        const achId = card.getAttribute('data-ach-id');
        if (!achId) return;

        if (card.classList.contains('aura-glow')) {
          card.classList.remove('aura-glow');
          triggerHaptic(15);
        }

        if (this.achievementsData && this.achievementsData.unlocked && this.achievementsData.unlocked[achId]) {
          this.achievementsData.viewed[achId] = true;
          this.saveAchievementsData();
          this.updateTrophyWidgetAura();
        }
      });
    });
  }

  // Toggle Task Completion (with history recording for every lived day)
  toggleTask(taskId) {
    if (!taskId) return;
    if (!this._lastToggleTimestamps) this._lastToggleTimestamps = {};
    const now = Date.now();
    if (this._lastToggleTimestamps[taskId] && (now - this._lastToggleTimestamps[taskId] < 200)) {
      return;
    }
    this._lastToggleTimestamps[taskId] = now;

    const tabTasks = this.tasks[this.currentTab];
    if (!tabTasks) return;

    const task = tabTasks.find(t => String(t.id) === String(taskId));
    if (!task) return;

    if (task.isEmpty || !task.text || !task.text.trim()) {
      const emptyInput = this.contentContainer.querySelector(`.blank-task-input[data-task-id="${taskId}"]`);
      if (emptyInput) emptyInput.focus();
      return;
    }
    const todayStr = this.getTodayDateString();
    // Completed tasks in past days are archived in history and cannot be modified
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      triggerHaptic(15);
      const isEn = this.settings.lang === 'en';
      const isUk = this.settings.lang === 'uk';
      const msg = isEn
        ? 'Tasks from past days are archived in history and cannot be modified'
        : (isUk
          ? 'Справи минулих днів знаходяться в архіві та не підлягають зміні'
          : 'Дела прошлых дней находятся в архиве истории и не изменяются');
      this.showToast(msg, '🔒');
      return;
    }

    // Capture previous visual positions of all task items before re-sorting
    const oldPositions = new Map();
    const prevWrappers = this.contentContainer.querySelectorAll('.task-row-wrapper[data-id]');
    prevWrappers.forEach(el => {
      const id = el.dataset.id;
      if (id) {
        oldPositions.set(id, el.getBoundingClientRect().top);
      }
    });

    task.completed = !task.completed;

    // Update in dailyTasks directly ONLY for todo tab
    const targetDate = this.selectedDate || todayStr;
    if (this.currentTab === 'todo' && this.dailyTasks && this.dailyTasks[targetDate]) {
      const dailyTask = this.dailyTasks[targetDate].find(t => String(t.id) === String(taskId));
      if (dailyTask) {
        dailyTask.completed = task.completed;
      }
    }

    if (task.completed) {
      this.playCompletionSound();
      if (this.petSystem && !task.rewarded) {
        this.petSystem.onTaskCompleted(task);
        task.rewarded = true;
      }
      if (this.currentTab === 'watch') {
        task.completedDate = new Date().toLocaleDateString('ru-RU');
      }

      // Record in day history
      if (!this.dayHistory[targetDate]) {
        this.dayHistory[targetDate] = [];
      }
      const activeTab = this.tabs.find(t => t.id === this.currentTab);
      const tabTitle = activeTab ? activeTab.title : this.currentTab;

      const existingIdx = this.dayHistory[targetDate].findIndex(h => String(h.id) === String(task.id));
      if (existingIdx === -1) {
        this.dayHistory[targetDate].push({
          id: task.id,
          tabId: this.currentTab,
          tabTitle: tabTitle,
          text: task.text,
          period: task.period || '',
          place: task.place || '',
          watchType: task.watchType || '',
          completedAt: new Date().toISOString()
        });
      }
    } else {
      if (this.currentTab === 'watch') {
        delete task.completedDate;
      }
      // Remove from history if unchecked
      if (this.dayHistory[targetDate]) {
        this.dayHistory[targetDate] = this.dayHistory[targetDate].filter(h => String(h.id) !== String(task.id));
      }
    }

    // Re-render UI
    this.render();
    this.renderTabs();

    // 2. Ultra-smooth FLIP animation: 50% slower (~0.65s), hardware-accelerated, zero-jank
    if (oldPositions.size > 0) {
      const newWrappers = this.contentContainer.querySelectorAll('.task-row-wrapper[data-id]');

      // PHASE 1: Read all new bounding rects in one pass (no layout thrashing)
      const moves = [];
      newWrappers.forEach(el => {
        const id = el.dataset.id;
        if (id && oldPositions.has(id)) {
          const oldTop = oldPositions.get(id);
          const newTop = el.getBoundingClientRect().top;
          const deltaY = oldTop - newTop;
          if (Math.abs(deltaY) > 0.5) {
            moves.push({ el, id, deltaY });
          }
        }
      });

      // PHASE 2: Apply initial inverted transforms (GPU accelerated)
      moves.forEach(({ el, id, deltaY }) => {
        el.style.transform = `translate3d(0, ${deltaY}px, 0)`;
        el.style.transition = 'none';
        el.style.willChange = 'transform';
        el.style.zIndex = (String(id) === String(taskId)) ? '25' : '20';
        if (String(id) === String(taskId)) {
          el.classList.add('just-completed-gliding');
        }
      });

      // PHASE 3: Animate smoothly to natural position (2.00s, ultra smooth cubic-bezier)
      if (moves.length > 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            moves.forEach(({ el }) => {
              el.style.transition = 'transform 2.00s cubic-bezier(0.16, 1, 0.3, 1)';
              el.style.transform = 'translate3d(0, 0, 0)';

              const cleanup = () => {
                el.style.transform = '';
                el.style.transition = '';
                el.style.willChange = '';
                el.style.zIndex = '';
                el.classList.remove('just-completed-gliding');
                el.removeEventListener('transitionend', cleanup);
              };
              el.addEventListener('transitionend', cleanup, { once: true });
              setTimeout(cleanup, 2100);
            });
          });
        });
      }
    }

    // PHASE 4: Defer heavy operations (saving data, achievements check, widget updates)
    // to avoid dropping frames during the animation
    setTimeout(() => {
      this.saveTasks();
      this.saveDayHistory();
      this.checkAchievements(true);
      this.updateWorkloadWidget();
    }, 150);
  }

  // Delete Task
  deleteTask(taskId, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      return;
    }
    if (this.tasks[this.currentTab]) {
      this.tasks[this.currentTab] = this.tasks[this.currentTab].filter(t => String(t.id) !== String(taskId));
      if (this.currentTab === 'todo' && this.dailyTasks) {
        const targetDate = this.selectedDate || todayStr;
        if (this.dailyTasks[targetDate]) {
          this.dailyTasks[targetDate] = this.dailyTasks[targetDate].filter(t => String(t.id) !== String(taskId));
        }
      }
      this.saveTasks();
      this.saveDailyTasks();
      this.render();
      this.renderTabs();
      this.updateWorkloadWidget();
    }
  }

  // Dedicated instant deletion of an empty blank slot with focus restoration
  deleteBlankTask(taskId, focusSectionId = null) {
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      return;
    }
    if (this.tasks[this.currentTab]) {
      this.tasks[this.currentTab] = this.tasks[this.currentTab].filter(t => String(t.id) !== String(taskId));
      if (this.currentTab === 'todo' && this.dailyTasks) {
        const targetDate = this.selectedDate || todayStr;
        if (this.dailyTasks[targetDate]) {
          this.dailyTasks[targetDate] = this.dailyTasks[targetDate].filter(t => String(t.id) !== String(taskId));
        }
      }
      this.flushSaveTasks();
      this.saveDailyTasks();
      this.render();
      this.renderTabs();
      this.updateWorkloadWidget();
      triggerHaptic(15);
      if (focusSectionId) {
        setTimeout(() => {
          const inp = this.contentContainer.querySelector(`.inline-task-input[data-section="${focusSectionId}"]`);
          if (inp) inp.focus({ preventScroll: true });
        }, 40);
      }
    }
  }

  // Show Floating Toast Notification
  showToast(message, icon = 'ℹ️') {
    const toast = document.getElementById('appToast');
    if (!toast) return;
    toast.innerHTML = `<span>${icon}</span> <span>${this.escapeHtml(message)}</span>`;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Defer / Postpone Task to Next Day
  deferTask(taskId) {
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      return;
    }
    const tabTasks = this.tasks[this.currentTab];
    if (!tabTasks) return;
    const taskIdx = tabTasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) return;
    const task = tabTasks[taskIdx];

    if (this.currentTab === 'todo') {
      const [y, m, d] = (this.selectedDate || this.getTodayDateString()).split('-').map(Number);
      const nextDateObj = new Date(y, m - 1, d + 1);
      const nextDateStr = `${nextDateObj.getFullYear()}-${String(nextDateObj.getMonth() + 1).padStart(2, '0')}-${String(nextDateObj.getDate()).padStart(2, '0')}`;

      // Remove from current day
      tabTasks.splice(taskIdx, 1);
      this.dailyTasks[this.selectedDate] = tabTasks;
      this.tasks.todo = tabTasks;

      // Add to next day
      if (!this.dailyTasks[nextDateStr]) {
        this.dailyTasks[nextDateStr] = [];
      }
      task.date = nextDateStr;
      this.dailyTasks[nextDateStr].push(task);
      this.saveDailyTasks();
      this.saveTasks();

      this.hasDeferredTaskFlag = true;
      localStorage.setItem('todo_notebook_flag_defer', '1');
      this.checkAchievements(true);
      this.render();
      this.renderTabs();
      this.updateWorkloadWidget();
      triggerHaptic([20, 40, 20]);
      const nextDayName = this.formatDateTitle(nextDateStr);
      this.showToast(this.t('toast_task_deferred', { date: nextDayName }), '📅');
    } else {
      if (!task.text.toLowerCase().includes('перенесено')) {
        task.text += ' (перенесено)';
      }
      this.hasDeferredTaskFlag = true;
      localStorage.setItem('todo_notebook_flag_defer', '1');
      this.checkAchievements(true);
      this.saveTasks();
      this.render();
      this.renderTabs();
      this.updateWorkloadWidget();
      triggerHaptic([20, 40, 20]);
      this.showToast(this.t('toast_entry_deferred'), '📅');
    }
  }

  // Open Task Modal with interactive fields matching current active tab
  openTaskModal() {
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      triggerHaptic(15);
      const isEn = this.settings.lang === 'en';
      const isUk = this.settings.lang === 'uk';
      const msg = isEn
        ? 'Tasks from past days are archived and cannot be added'
        : (isUk
          ? 'Неможливо додавати завдання у минулі дні (архів)'
          : 'Нельзя добавлять задачи в прошедшие дни (архив)');
      this.showToast(msg, '🔒');
      return;
    }
    this.editingTaskId = null;
    this.tempPhotoData = null;
    this.renderDynamicForm(this.currentTab);

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Новая запись';
    const submitBtn = document.getElementById('modalSubmitBtn');
    if (submitBtn) submitBtn.textContent = 'Сохранить';

    this._taskModalOpenedAt = Date.now();
    this.taskModalBackdrop.classList.add('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  // Open Edit Task Modal with existing task values pre-filled
  openEditTaskModal(taskId) {
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      return;
    }
    const tabTasks = this.tasks[this.currentTab];
    if (!tabTasks) return;
    const task = tabTasks.find(t => t.id === taskId);
    if (!task) return;

    this.editingTaskId = taskId;
    this.tempPhotoData = task.photo || null;
    this.renderDynamicForm(this.currentTab);

    // Set modal title & button text
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = this.t('modal_edit_entry') || 'Редактировать запись';
    const submitBtn = document.getElementById('modalSubmitBtn');
    if (submitBtn) submitBtn.textContent = this.t('btn_save_changes') || 'Сохранить изменения';

    // Populate values
    const textInput = this.dynamicFormFields.querySelector('#taskTextInput');
    if (textInput) {
      textInput.value = cleanTaskText(task.text);
    }

    // Populate priority & color
    const isImportant = getPriorityRank(task) === 1 || task.priority === 'важный' || task.priority === 'очень важно' || task.priority === 'вопрос жизни и смерти';
    const priorityVal = isImportant ? 'важный' : 'обычный';
    const priorityChips = this.dynamicFormFields.querySelectorAll('.priority-chip');
    priorityChips.forEach(chip => {
      const radio = chip.querySelector('input[type="radio"]');
      if (radio && (radio.value === priorityVal || (isImportant && (radio.value === 'очень важно' || radio.value === 'важный')))) {
        radio.checked = true;
        chip.classList.add('selected');
      } else {
        if (radio) radio.checked = false;
        chip.classList.remove('selected');
      }
    });

    const colorGroup = this.dynamicFormFields.querySelector('#taskPriorityColorGroup');
    const priorityHint = this.dynamicFormFields.querySelector('#taskPriorityHint');
    if (colorGroup) {
      colorGroup.style.display = isImportant ? 'flex' : 'none';
    }
    if (priorityHint) {
      priorityHint.style.display = isImportant ? 'block' : 'none';
    }

    // Default to black if not important, or task.color if important
    const taskColor = isImportant ? (task.color || 'black') : 'black';
    const colorOptions = this.dynamicFormFields.querySelectorAll('.priority-color-circle');
    colorOptions.forEach(opt => {
      const radio = opt.querySelector('input[type="radio"]');
      if (radio && radio.value === taskColor) {
        radio.checked = true;
        opt.classList.add('selected');
      } else {
        if (radio) radio.checked = false;
        opt.classList.remove('selected');
      }
    });

    // Populate time
    const timeInput = this.dynamicFormFields.querySelector('#taskTimeInput');
    if (timeInput && task.time) {
      timeInput.value = task.time;
    }
    const clearTimeBtn = this.dynamicFormFields.querySelector('#btnClearTaskTime');
    if (clearTimeBtn && timeInput) {
      clearTimeBtn.onclick = () => {
        timeInput.value = '';
        triggerHaptic(10);
      };
    }

    // Populate notes
    const notesInput = this.dynamicFormFields.querySelector('#taskExtraNotes');
    if (notesInput && task.notes) {
      notesInput.value = task.notes;
    }

    this._taskModalOpenedAt = Date.now();
    this.taskModalBackdrop.classList.add('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  // Close Task Modal
  closeTaskModal() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    if (this.taskModalBackdrop) {
      this.taskModalBackdrop.classList.remove('open');
      this.taskModalBackdrop.setAttribute('aria-hidden', 'true');
    }
    this.tempPhotoData = null;
    this.editingTaskId = null;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Новая запись';
    const submitBtn = document.getElementById('modalSubmitBtn');
    if (submitBtn) submitBtn.textContent = 'Сохранить';
    if (this.newTaskForm) this.newTaskForm.reset();
  }

  // Open Photo by Task ID (safe lookup across all tabs and daily collections)
  openPhotoForTask(taskId) {
    if (!taskId) return;
    for (const tab in this.tasks) {
      const found = (this.tasks[tab] || []).find(t => t.id === taskId);
      if (found && found.photo) {
        this.openLightbox(found.photo);
        return;
      }
    }
    if (this.dailyTasks) {
      for (const d in this.dailyTasks) {
        const found = (this.dailyTasks[d] || []).find(t => t.id === taskId);
        if (found && found.photo) {
          this.openLightbox(found.photo);
          return;
        }
      }
    }
    if (this.dayHistory) {
      for (const d in this.dayHistory) {
        const found = (this.dayHistory[d] || []).find(t => t.id === taskId);
        if (found && found.photo) {
          this.openLightbox(found.photo);
          return;
        }
      }
    }
  }

  // Open Lightbox for full photo preview
  async openLightbox(photoSrc) {
    if (!photoSrc) return;
    if (!this.imageLightboxBackdrop) {
      this.imageLightboxBackdrop = document.getElementById('imageLightboxBackdrop');
    }
    if (!this.lightboxImg) {
      this.lightboxImg = document.getElementById('lightboxImg');
    }
    if (!this.imageLightboxBackdrop || !this.lightboxImg) return;

    let srcToDisplay = photoSrc;
    if (typeof Plan4UStorage !== 'undefined' && Plan4UStorage.getPhoto && (photoSrc.startsWith('photo_') || !photoSrc.startsWith('data:'))) {
      srcToDisplay = await Plan4UStorage.getPhoto(photoSrc) || photoSrc;
    }

    this.lightboxImg.src = srcToDisplay;
    this._lightboxOpenedAt = Date.now();
    this.imageLightboxBackdrop.classList.add('open');
    this.imageLightboxBackdrop.setAttribute('aria-hidden', 'false');
    triggerHaptic(15);
  }

  closeLightbox() {
    if (!this.imageLightboxBackdrop) {
      this.imageLightboxBackdrop = document.getElementById('imageLightboxBackdrop');
    }
    if (!this.lightboxImg) {
      this.lightboxImg = document.getElementById('lightboxImg');
    }
    if (this.imageLightboxBackdrop) {
      this.imageLightboxBackdrop.classList.remove('open');
      this.imageLightboxBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (this.lightboxImg) {
      this.lightboxImg.src = '';
    }
  }

  // Render Dynamic Form Fields depending on active tab
  renderDynamicForm(tabId) {
    let html = '';

    // Priority selector HTML
    const priorityLabels = {
      'спокойно': this.t('priority_calm'),
      'в течении дня': this.t('priority_day'),
      'очень важно': this.t('priority_important'),
      'вопрос жизни и смерти': this.t('priority_urgent')
    };

    const renderPriorityColorSelector = (selectedColor = 'black', isVisible = false) => {
      const isUk = this.settings.lang === 'uk';
      const isEn = this.settings.lang === 'en';
      const blackLabel = isEn ? 'Black' : (isUk ? 'Чорний' : 'Чёрный');
      const burgundyLabel = isEn ? 'Burgundy' : (isUk ? 'Бордовий' : 'Бордовый');
      const purpleLabel = isEn ? 'Purple' : (isUk ? 'Фіолетовий' : 'Фиолетовый');
      const navyLabel = isEn ? 'Navy Blue' : (isUk ? 'Темно-синій' : 'Тёмно-синий');
      const darkGreenLabel = isEn ? 'Dark Green' : (isUk ? 'Темно-зелений' : 'Тёмно-зелёный');

      return `
        <div class="priority-color-selector" id="taskPriorityColorGroup" style="${isVisible ? 'display: flex;' : 'display: none;'}">
          <div class="priority-color-options">
            <label class="priority-color-circle ${selectedColor === 'black' ? 'selected' : ''}" data-color="black" title="${blackLabel}" style="--circle-color: #0f172a;">
              <input type="radio" name="taskPriorityColor" value="black" ${selectedColor === 'black' ? 'checked' : ''}>
            </label>
            <label class="priority-color-circle ${selectedColor === 'burgundy' ? 'selected' : ''}" data-color="burgundy" title="${burgundyLabel}" style="--circle-color: #881337;">
              <input type="radio" name="taskPriorityColor" value="burgundy" ${selectedColor === 'burgundy' ? 'checked' : ''}>
            </label>
            <label class="priority-color-circle ${selectedColor === 'purple' ? 'selected' : ''}" data-color="purple" title="${purpleLabel}" style="--circle-color: #7e22ce;">
              <input type="radio" name="taskPriorityColor" value="purple" ${selectedColor === 'purple' ? 'checked' : ''}>
            </label>
            <label class="priority-color-circle ${selectedColor === 'navy' ? 'selected' : ''}" data-color="navy" title="${navyLabel}" style="--circle-color: #1e3a8a;">
              <input type="radio" name="taskPriorityColor" value="navy" ${selectedColor === 'navy' ? 'checked' : ''}>
            </label>
            <label class="priority-color-circle ${selectedColor === 'darkgreen' ? 'selected' : ''}" data-color="darkgreen" title="${darkGreenLabel}" style="--circle-color: #065f46;">
              <input type="radio" name="taskPriorityColor" value="darkgreen" ${selectedColor === 'darkgreen' ? 'checked' : ''}>
            </label>
          </div>
        </div>
      `;
    };

    const renderPrioritySelector = (defaultVal = 'спокойно') => `
      <div class="form-section-card">
        <div class="form-group" style="margin-bottom: 0;">
          <label>⚡ ${this.t('priority_label')}</label>
          <div class="priority-selector" id="prioritySelectorGroup">
            ${PRIORITIES.map(p => `
              <label class="priority-chip ${p.class} ${p.id === defaultVal ? 'selected' : ''}">
                <input type="radio" name="taskPriority" value="${p.id}" ${p.id === defaultVal ? 'checked' : ''}>
                <span class="p-indicator"></span>
                <span>${priorityLabels[p.id] || p.label}</span>
              </label>
            `).join('')}
          </div>
          ${renderPriorityColorSelector('black', defaultVal === 'очень важно' || defaultVal === 'вопрос жизни и смерти')}
        </div>
      </div>
    `;

    // Watch tab custom 2-option priority selector:
    const renderWatchPrioritySelector = (defaultVal = 'спокойно') => {
      const isTop = defaultVal === 'очень важно' || defaultVal === 'вопрос жизни и смерти';
      const watchOptions = [
        {
          id: 'спокойно',
          label: this.settings.lang === 'en' ? '🍿 Casual' : (this.settings.lang === 'uk' ? '🍿 За настроєм' : '🍿 По настроению'),
          class: 'p-calm'
        },
        {
          id: 'очень важно',
          label: this.settings.lang === 'en' ? '🔥 Top Priority' : (this.settings.lang === 'uk' ? '🔥 В першу чергу' : '🔥 В первую очередь'),
          class: 'p-important'
        }
      ];

      const activeId = isTop ? 'очень важно' : 'спокойно';

      return `
        <div class="form-section-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label>⚡ ${this.settings.lang === 'en' ? 'Priority' : (this.settings.lang === 'uk' ? 'Пріоритет перегляду' : 'Приоритет просмотра')}</label>
            <div class="priority-selector" id="prioritySelectorGroup">
              ${watchOptions.map(p => `
                <label class="priority-chip ${p.class} ${p.id === activeId ? 'selected' : ''}">
                  <input type="radio" name="taskPriority" value="${p.id}" ${p.id === activeId ? 'checked' : ''}>
                  <span class="p-indicator"></span>
                  <span>${p.label}</span>
                </label>
              `).join('')}
            </div>
            ${renderPriorityColorSelector('black', isTop)}
          </div>
        </div>
      `;
    };

    // Extra info section (Notes + Photo Uploader)
    const renderExtraSection = () => {
      const hasPhoto = !!this.tempPhotoData;
      return `
        <div class="extra-details-card">
          <div class="extra-details-header">
            <span>📝 ${this.settings.lang === 'en' ? 'Extra details' : (this.settings.lang === 'uk' ? 'Додаткова інформація' : 'Дополнительная информация')}</span>
          </div>
          <div class="form-group" style="margin-bottom: 8px;">
            <textarea id="taskExtraNotes" rows="2" placeholder="${this.settings.lang === 'en' ? 'Add notes or details...' : (this.settings.lang === 'uk' ? 'Дописати нотатку або подробиці...' : 'Дописать заметку или подробности...')}"></textarea>
          </div>

          <div class="photo-uploader-area">
            <input type="file" id="taskPhotoFileInput" accept="image/*" style="display: none;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-upload-file" id="btnTriggerPhotoUpload">
                ${hasPhoto ? (this.t('photo_change_btn') || '📸 Заменить фото') : (this.t('photo_attach_btn') || '📸 Прикрепить фото или чек')}
              </button>
              <span id="photoAttachedBadge" style="font-size: 11.5px; color: #10b981; font-weight: 600; ${hasPhoto ? '' : 'display: none;'}">✓ ${this.t('photo_attached_title') || 'Фото прикреплено'}</span>
            </div>
            <div class="photo-preview-wrap" id="photoPreviewContainer" style="${hasPhoto ? 'display: inline-block;' : 'display: none;'}">
              <img id="photoPreviewImg" class="photo-preview-img" src="${hasPhoto ? this.tempPhotoData : ''}" alt="Attached Photo">
              <button type="button" class="photo-remove-btn" id="photoRemoveBtn" title="Удалить фото" aria-label="Удалить фото">&times;</button>
            </div>
          </div>
        </div>
      `;
    };

    if (tabId === 'todo') {
      // 1) Streamlined Edit Form for Todo notebook
      html = `
        <div class="form-section-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="taskTextInput">✏️ ${this.t('task_text_label')}</label>
            <div class="autocomplete-wrapper">
              <input type="text" id="taskTextInput" placeholder="${this.t('task_text_placeholder')}" required autocomplete="off">
              <div class="autocomplete-dropdown" id="taskTextDropdown"></div>
            </div>
          </div>
        </div>

        <div class="form-section-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label>⚡ ${this.t('priority_label')}</label>
            <div class="priority-selector" id="prioritySelectorGroup">
              <label class="priority-chip p-calm selected">
                <input type="radio" name="taskPriority" value="обычный" checked>
                <span class="p-indicator"></span>
                <span>⚪ ${this.t('priority_normal') || 'Обычный'}</span>
              </label>
              <label class="priority-chip p-important">
                <input type="radio" name="taskPriority" value="важный">
                <span class="p-indicator"></span>
                <span>⭐ ${this.t('priority_important') || 'Важный'}</span>
              </label>
            </div>
            ${renderPriorityColorSelector('black', false)}
            <div class="priority-hint" id="taskPriorityHint" style="font-size: 11px; color: #64748b; margin-top: 6px; font-weight: 500; display: none;">
              ${this.t('priority_important_desc') || '«Важный» выделяет задачу жирным шрифтом и поднимает наверх'}
            </div>
          </div>
        </div>

        <div class="form-section-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="taskTimeInput">⏰ ${this.t('time_label') || 'Когда выполнить? (время)'}</label>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
              <input type="time" id="taskTimeInput" class="time-input-field" style="flex: 1; padding: 9px 12px; border: 1.5px solid #dcdfe4; border-radius: 10px; font-family: var(--font-ui); font-size: 14px; font-weight: 600; color: #1e293b; background: #ffffff;">
              <button type="button" class="btn-clear-time" id="btnClearTaskTime" style="padding: 9px 12px; background: #f1f5f9; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer;">
                ✕ Сброс
              </button>
            </div>
            <div style="font-size: 11px; color: #dc2626; margin-top: 5px; font-weight: 600; line-height: 1.35;">
              🔔 В указанное время придет оповещение, а в блокноте появится красная метка времени
            </div>
          </div>
        </div>

        ${renderExtraSection()}
      `;
    } else if (tabId === 'buy') {
      // 2) "Что купить?"
      html = `
        <div class="form-section-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="taskTextInput">🛒 ${this.t('task_text_label')}</label>
            <div class="autocomplete-wrapper">
              <input type="text" id="taskTextInput" placeholder="${this.t('buy_item_placeholder')}" required autocomplete="off">
              <div class="autocomplete-dropdown" id="taskTextDropdown"></div>
            </div>
          </div>
        </div>

        ${renderPrioritySelector('спокойно')}

        ${renderExtraSection()}
      `;
    } else if (tabId === 'watch') {
      // 3) "Что посмотреть?"
      html = `
        <div class="form-section-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="taskTextInput">🎬 ${this.t('watch_name_label')}</label>
            <div class="autocomplete-wrapper">
              <input type="text" id="taskTextInput" placeholder="${this.t('watch_name_placeholder')}" required autocomplete="off">
              <div class="autocomplete-dropdown" id="taskTextDropdown"></div>
            </div>
          </div>
        </div>

        ${renderWatchPrioritySelector('спокойно')}

        ${renderExtraSection()}
      `;
    } else {
      // 4) Любая новая вкладка
      html = `
        <div class="form-section-card">
          <div class="form-group" style="margin-bottom: 0;">
            <label for="taskTextInput">✏️ ${this.t('task_text_label')}</label>
            <div class="autocomplete-wrapper">
              <input type="text" id="taskTextInput" placeholder="${this.t('task_text_placeholder')}" required autocomplete="off">
              <div class="autocomplete-dropdown" id="taskTextDropdown"></div>
            </div>
          </div>
        </div>

        ${renderPrioritySelector('спокойно')}

        ${renderExtraSection()}
      `;
    }

    this.dynamicFormFields.innerHTML = html;

    // Attach Autocomplete Handlers
    const textInput = this.dynamicFormFields.querySelector('#taskTextInput');
    const textDropdown = this.dynamicFormFields.querySelector('#taskTextDropdown');

    const historyKey = tabId === 'buy' ? 'buy_items' : (tabId === 'watch' ? 'watch_items' : 'todo_items');

    this.setupAutocomplete({
      inputEl: textInput,
      dropdownEl: textDropdown,
      historyListKey: historyKey,
      onSelect: () => { }
    });

    // Attach Priority Chip click events & toggle color selector + priority hint
    const colorGroup = this.dynamicFormFields.querySelector('#taskPriorityColorGroup');
    const priorityHint = this.dynamicFormFields.querySelector('#taskPriorityHint');
    const chips = this.dynamicFormFields.querySelectorAll('.priority-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const radio = chip.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          const val = (radio.value || '').toLowerCase();
          const isPrio = val === 'важный' || val === 'очень важно' || val === 'вопрос жизни и смерти';
          if (colorGroup) {
            colorGroup.style.display = isPrio ? 'flex' : 'none';
          }
          if (priorityHint) {
            priorityHint.style.display = isPrio ? 'block' : 'none';
          }
          if (!isPrio) {
            // When downgraded to regular task, reset color option to black
            const colorOptions = this.dynamicFormFields.querySelectorAll('.priority-color-circle');
            colorOptions.forEach(opt => {
              const cradio = opt.querySelector('input[type="radio"]');
              const isBlack = cradio && cradio.value === 'black';
              if (cradio) cradio.checked = isBlack;
              opt.classList.toggle('selected', isBlack);
            });
          }
        }
      });
    });

    // Attach Priority Color Option click events
    const colorOptions = this.dynamicFormFields.querySelectorAll('.priority-color-circle');
    colorOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        colorOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        triggerHaptic(15);
      });
    });

    // Wire up Photo Uploader elements
    const btnTriggerPhoto = this.dynamicFormFields.querySelector('#btnTriggerPhotoUpload');
    const photoFileInput = this.dynamicFormFields.querySelector('#taskPhotoFileInput');
    const previewContainer = this.dynamicFormFields.querySelector('#photoPreviewContainer');
    const previewImg = this.dynamicFormFields.querySelector('#photoPreviewImg');
    const removePhotoBtn = this.dynamicFormFields.querySelector('#photoRemoveBtn');
    const photoBadge = this.dynamicFormFields.querySelector('#photoAttachedBadge');

    if (btnTriggerPhoto && photoFileInput) {
      btnTriggerPhoto.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoFileInput.click();
      });
    }

    if (photoFileInput) {
      photoFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const maxDim = 1200;
              let w = img.width;
              let h = img.height;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round((h * maxDim) / w);
                  w = maxDim;
                } else {
                  w = Math.round((w * maxDim) / h);
                  h = maxDim;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
              this.tempPhotoData = compressedBase64;
              if (previewImg) previewImg.src = this.tempPhotoData;
              if (previewContainer) previewContainer.style.display = 'inline-block';
              if (photoBadge) photoBadge.style.display = 'inline';
              if (btnTriggerPhoto) btnTriggerPhoto.textContent = this.t('photo_change_btn') || '📸 Заменить фото';
              triggerHaptic(15);
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.tempPhotoData = null;
        if (photoFileInput) photoFileInput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (photoBadge) photoBadge.style.display = 'none';
        if (btnTriggerPhoto) btnTriggerPhoto.textContent = this.t('photo_attach_btn') || '📸 Прикрепить фото или чек';
        triggerHaptic(15);
      });
    }
  }

  // Helper for wiring input autocompletion with smart dropdown on typing
  setupAutocomplete({ inputEl, dropdownEl, historyListKey, onSelect }) {
    if (!inputEl) return;

    const getItems = () => {
      return (this.history && this.history[historyListKey]) ? [...this.history[historyListKey]] : [];
    };

    // Dropdown suggestions on input (only when user actively types)
    const showDropdown = (query = '') => {
      if (!dropdownEl) return;
      const q = query.trim().toLowerCase();
      if (!q) {
        dropdownEl.classList.remove('show');
        dropdownEl.innerHTML = '';
        return;
      }

      let matched = getItems().filter(item => item.text.toLowerCase().includes(q));
      matched.sort((a, b) => {
        const aStarts = a.text.toLowerCase().startsWith(q) ? 1 : 0;
        const bStarts = b.text.toLowerCase().startsWith(q) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        return (b.count || 0) - (a.count || 0);
      });

      if (matched.length === 0) {
        dropdownEl.classList.remove('show');
        dropdownEl.innerHTML = '';
        return;
      }

      dropdownEl.innerHTML = matched.slice(0, 7).map((item, idx) => {
        let highlighted = this.escapeHtml(item.text);
        const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlighted = highlighted.replace(regex, '<strong>$1</strong>');

        let metaHtml = '';
        if (item.place) {
          metaHtml = `📍 ${this.escapeHtml(item.place)}`;
        } else if (item.count && item.count > 1) {
          metaHtml = `×${item.count}`;
        }

        return `
          <div class="autocomplete-item ${idx === 0 ? 'active' : ''}" data-val="${this.escapeHtml(item.text)}">
            <span class="autocomplete-item-text">
              ${item.icon ? `<span>${item.icon}</span>` : ''}
              <span>${highlighted}</span>
            </span>
            ${metaHtml ? `<span class="autocomplete-item-meta">${metaHtml}</span>` : ''}
          </div>
        `;
      }).join('');

      dropdownEl.classList.add('show');

      // Click on dropdown item
      dropdownEl.querySelectorAll('.autocomplete-item').forEach(el => {
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const val = el.dataset.val;
          const found = getItems().find(i => i.text === val);
          inputEl.value = val;
          triggerHaptic(15);
          dropdownEl.classList.remove('show');
          if (onSelect) onSelect(found || { text: val });
        });
      });
    };

    inputEl.addEventListener('input', () => {
      showDropdown(inputEl.value);
    });

    inputEl.addEventListener('blur', () => {
      setTimeout(() => {
        if (dropdownEl) dropdownEl.classList.remove('show');
      }, 200);
    });

    // Keyboard navigation
    inputEl.addEventListener('keydown', (e) => {
      if (!dropdownEl || !dropdownEl.classList.contains('show')) return;
      const items = dropdownEl.querySelectorAll('.autocomplete-item');
      if (items.length === 0) return;

      let activeIndex = Array.from(items).findIndex(el => el.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex >= 0) items[activeIndex].classList.remove('active');
        activeIndex = (activeIndex + 1) % items.length;
        items[activeIndex].classList.add('active');
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex >= 0) items[activeIndex].classList.remove('active');
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        items[activeIndex].classList.add('active');
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          const val = items[activeIndex].dataset.val;
          const found = getItems().find(i => i.text === val);
          inputEl.value = val;
          triggerHaptic(15);
          dropdownEl.classList.remove('show');
          if (onSelect) onSelect(found || { text: val });
        }
      } else if (e.key === 'Escape') {
        dropdownEl.classList.remove('show');
      }
    });
  }

  // Handle Add / Edit Task
  handleAddTask() {
    this.dismissActiveKeyboard();
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      this.closeTaskModal();
      return;
    }
    const textInput = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskTextInput') : null) || document.getElementById('taskTextInput');
    let text = textInput ? textInput.value.trim() : '';
    const targetTab = this.currentTab;

    if (!text) return;

    // Get selected priority & color
    const priorityRadio = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('input[name="taskPriority"]:checked') : null) || document.querySelector('input[name="taskPriority"]:checked');
    const priority = priorityRadio ? priorityRadio.value : 'спокойно';

    const isPrio = priority === 'важный' || priority === 'очень важно' || priority === 'вопрос жизни и смерти';
    const colorRadio = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('input[name="taskPriorityColor"]:checked') : null) || document.querySelector('input[name="taskPriorityColor"]:checked');
    const taskColor = isPrio ? (colorRadio ? colorRadio.value : 'black') : 'black';

    text = cleanTaskText(text);

    const notesInput = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskExtraNotes') : null) || document.getElementById('taskExtraNotes');
    const notes = notesInput ? notesInput.value.trim() : '';

    if (this.editingTaskId) {
      // Update existing task
      const tabTasks = this.tasks[targetTab];
      const task = tabTasks ? tabTasks.find(t => String(t.id) === String(this.editingTaskId)) : null;
      if (task) {
        task.text = text;
        task.priority = priority;
        task.color = taskColor;
        task.notes = notes;
        task.photo = this.tempPhotoData || null;
        if (task.photo && typeof Plan4UStorage !== 'undefined') {
          Plan4UStorage.savePhoto(task.photo);
        }
        if (targetTab === 'todo') {
          const timeInput = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskTimeInput') : null) || document.getElementById('taskTimeInput');
          task.time = timeInput ? (timeInput.value.trim() || null) : null;
          if (task.time) {
            this.scheduleTaskNotification(task);
          }
        }
        this.saveTasks();
        this.recordHistory(targetTab, text);
        this.render();
        this.renderTabs();
        this.updateWorkloadWidget();
        triggerHaptic(20);
        this.showToast(this.t('toast_entry_updated'), '✏️');
      }
      this.closeTaskModal();
      return;
    }
    const newTask = {
      id: generateTaskId(),
      text: text,
      priority: priority,
      color: taskColor,
      notes: notes,
      photo: this.tempPhotoData || null,
      completed: false,
      date: this.selectedDate || this.getTodayDateString()
    };

    if (newTask.photo && typeof Plan4UStorage !== 'undefined') {
      Plan4UStorage.savePhoto(newTask.photo);
    }

    if (targetTab === 'todo') {
      const timeInput = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskTimeInput') : null) || document.getElementById('taskTimeInput');
      newTask.time = timeInput ? (timeInput.value.trim() || null) : null;
      newTask.section = 'personal';
      if (newTask.time) {
        this.scheduleTaskNotification(newTask);
      }
    }

    if (!this.tasks[targetTab]) {
      this.tasks[targetTab] = [];
    }

    this.tasks[targetTab].push(newTask);
    this.saveTasks();
    this.recordHistory(targetTab, text);

    this.render();
    this.renderTabs();
    this.updateWorkloadWidget();
    this.checkAchievements(true);
    triggerHaptic(20);

    this.closeTaskModal();
  }

  // Schedule local push notification for task at its specified time
  async scheduleTaskNotification(task) {
    if (!task || !task.time) return;
    try {
      const parts = task.time.split(':');
      if (parts.length < 2) return;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      const targetDateStr = this.selectedDate || this.getTodayDateString();
      const [y, m, d] = targetDateStr.split('-').map(Number);
      const scheduledDate = new Date(y, m - 1, d, hours, minutes, 0);

      if (scheduledDate.getTime() > Date.now()) {
        const notifId = Math.abs(parseInt(task.id.slice(-7), 10)) || Math.floor(Math.random() * 100000);
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
          await window.Capacitor.Plugins.LocalNotifications.schedule({
            notifications: [
              {
                id: notifId,
                title: 'Plan4U — Напоминание',
                body: `⏰ ${task.time} • ${cleanTaskText(task.text)}`,
                schedule: { at: scheduledDate },
                sound: 'beep.wav',
                smallIcon: 'ic_launcher'
              }
            ]
          });
        } else if ('Notification' in window && Notification.permission === 'granted') {
          const delayMs = scheduledDate.getTime() - Date.now();
          if (delayMs > 0 && delayMs < 24 * 60 * 60 * 1000) {
            setTimeout(() => {
              try {
                new Notification('Plan4U — Напоминание', {
                  body: `⏰ ${task.time} • ${cleanTaskText(task.text)}`,
                  icon: 'icon.svg'
                });
              } catch (err) {
                console.warn(err);
              }
            }, delayMs);
          }
        }
      }
    } catch (e) {
      console.warn('Notification scheduling error:', e);
    }
  }

  // Rapid inline task addition directly on notebook lines
  addInlineTask(text, sectionId) {
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      return;
    }
    if (!text || !text.trim()) return;
    const cleanTitle = cleanTaskText(text.trim());
    if (!cleanTitle) return;

    const newTask = {
      id: generateTaskId(),
      text: cleanTitle,
      section: sectionId || 'personal',
      priority: 'обычный',
      completed: false,
      date: this.selectedDate || this.getTodayDateString(),
      time: null,
      notes: '',
      photo: null
    };

    if (!this.tasks[this.currentTab]) {
      this.tasks[this.currentTab] = [];
    }

    this.tasks[this.currentTab].push(newTask);
    this.saveTasks();
    this.recordHistory(this.currentTab, cleanTitle);
    this.render();
    this.renderTabs();
    this.updateWorkloadWidget();
    this.checkAchievements(true);
    triggerHaptic(15);

    // Keep focus in the same section for writing the next line
    setTimeout(() => {
      const nextInput = this.contentContainer.querySelector(`.inline-task-input[data-section="${sectionId}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    }, 60);
  }

  // Attach events to a single inline input across all blocks
  attachEventsToInlineInput(input) {
    if (!input || input._eventsAttached) return;
    input._eventsAttached = true;
    input.setAttribute('enterkeyhint', 'done');

    const sectionId = input.dataset.section;
    const isBlankSlot = input.classList.contains('blank-task-input');
    const taskId = input.dataset.taskId;
    const row = input.closest('.inline-task-row') || input.closest('.task-row-blank') || input.closest('.task-row-wrapper');

    if (row && !row._tapBound) {
      row._tapBound = true;
      row.addEventListener('click', (e) => {
        if (e.target !== input) {
          input.focus();
        }
      });
    }

    input.addEventListener('input', () => {
      const val = input.value;
      if (val.trim().length > 0) {
        if (row) row.classList.add('has-text');
      } else {
        if (row) row.classList.remove('has-text');
      }
      if (isBlankSlot && taskId) {
        const tabTasks = this.tasks[this.currentTab] || [];
        const task = tabTasks.find(t => String(t.id) === String(taskId));
        if (task) {
          task.text = val;
          task.isEmpty = !val.trim();
          this.saveTasks();
        }
      }
    });

    const handleCommit = (e, isEnterKey = false) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const todayStr = this.getTodayDateString();
      if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
        input.value = '';
        return;
      }
      const finalVal = input.value.trim();

      // Case A: Editing an existing blank slot
      if (isBlankSlot && taskId) {
        const tabTasks = this.tasks[this.currentTab] || [];
        const taskIdx = tabTasks.findIndex(t => String(t.id) === String(taskId));
        if (taskIdx === -1) return;

        if (finalVal) {
          // Fill the blank slot with text
          const cleanTitle = cleanTaskText(finalVal);
          tabTasks[taskIdx].text = cleanTitle;
          tabTasks[taskIdx].isEmpty = false;
          this.flushSaveTasks();
          this.recordHistory(this.currentTab, cleanTitle);
          this.checkAchievements(true);
          triggerHaptic(15);

          // Replace blank slot wrapper with regular task row
          const wrapper = input.closest('.task-row-wrapper');
          if (wrapper) {
            const plateHtml = this.renderTaskRow(tabTasks[taskIdx]);
            const temp = document.createElement('div');
            temp.innerHTML = plateHtml.trim();
            const newPlate = temp.firstElementChild;
            wrapper.parentNode.replaceChild(newPlate, wrapper);
            this.attachSwipeEvents();
          }

          if (isEnterKey) {
            // Find next input (next blank slot or bottom section input)
            const nextInp = this.contentContainer.querySelector(`.inline-task-input[data-section="${sectionId}"]`);
            if (nextInp) {
              requestAnimationFrame(() => nextInp.focus());
            }
          }
          this.updateWorkloadWidget();
          this.renderTabs();
        } else if (isEnterKey) {
          // Double enter inside blank slot -> insert another blank line right after it
          const nextBlankTask = {
            id: generateTaskId(),
            text: '',
            isEmpty: true,
            section: sectionId || 'personal',
            priority: 'обычный',
            completed: false,
            date: this.selectedDate || this.getTodayDateString(),
            time: null,
            notes: '',
            photo: null
          };
          tabTasks.splice(taskIdx + 1, 0, nextBlankTask);
          this.flushSaveTasks();
          triggerHaptic(15);
          this.render();
          this.renderTabs();
          this.updateWorkloadWidget();
          setTimeout(() => {
            const nextInp = this.contentContainer.querySelector(`.blank-task-input[data-task-id="${nextBlankTask.id}"]`);
            if (nextInp) nextInp.focus();
          }, 30);
        }
        return;
      }

      // Case B: Bottom section input
      if (!finalVal) {
        // Double Enter on empty input / Enter with no text -> Insert a blank line / skipped line for future writing!
        if (isEnterKey) {
          const blankTask = {
            id: generateTaskId(),
            text: '',
            isEmpty: true,
            section: sectionId || 'personal',
            priority: 'обычный',
            completed: false,
            date: this.selectedDate || this.getTodayDateString(),
            time: null,
            notes: '',
            photo: null
          };

          if (!this.tasks[this.currentTab]) {
            this.tasks[this.currentTab] = [];
          }
          this.tasks[this.currentTab].push(blankTask);

          this.flushSaveTasks();
          triggerHaptic(15);

          // Insert empty plate above the bottom row
          const sectionContainer = input.closest('.section-tasks-list');
          if (sectionContainer && row) {
            const plateHtml = this.renderTaskRow(blankTask);
            const temp = document.createElement('div');
            temp.innerHTML = plateHtml.trim();
            const newPlate = temp.firstElementChild;
            sectionContainer.insertBefore(newPlate, row);

            const blankInput = newPlate.querySelector('.blank-task-input');
            if (blankInput) {
              this.attachEventsToInlineInput(blankInput);
            }
            const delBtn = newPlate.querySelector('.blank-slot-delete-btn');
            if (delBtn) {
              delBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deleteBlankTask(blankTask.id, sectionId);
              };
            }
            this.attachSwipeEvents();
          }

          input.value = '';
          if (row) row.classList.remove('has-text');

          this.updateWorkloadWidget();
          this.renderTabs();

          requestAnimationFrame(() => {
            input.focus({ preventScroll: true });
            setTimeout(() => {
              input.focus({ preventScroll: true });
            }, 35);
          });
        }
        return;
      }

      // Normal text commit
      const cleanTitle = cleanTaskText(finalVal);
      const newTask = {
        id: generateTaskId(),
        text: cleanTitle,
        section: sectionId || 'personal',
        priority: 'обычный',
        completed: false,
        date: this.selectedDate || this.getTodayDateString(),
        time: null,
        notes: '',
        photo: null
      };

      if (!this.tasks[this.currentTab]) {
        this.tasks[this.currentTab] = [];
      }
      this.tasks[this.currentTab].push(newTask);

      this.flushSaveTasks();
      this.recordHistory(this.currentTab, cleanTitle);
      this.checkAchievements(true);
      triggerHaptic(15);

      // 1. Instantly insert the ready swipeable plate right into THIS section
      const sectionContainer = input.closest('.section-tasks-list');
      if (sectionContainer && row) {
        const plateHtml = this.renderTaskRow(newTask);
        const temp = document.createElement('div');
        temp.innerHTML = plateHtml.trim();
        const newPlate = temp.firstElementChild;
        sectionContainer.insertBefore(newPlate, row);
      }

      // 2. Clear this input line so it is immediately ready for the next task in THIS block
      input.value = '';
      if (row) row.classList.remove('has-text');

      // 3. Attach swipe listeners to all plates
      this.attachSwipeEvents();

      // 4. Update tab badge and workload counter instantly
      this.updateWorkloadWidget();
      this.renderTabs();

      // 5. Firmly retain focus in THIS block's input, preventing IME jumping to the next block
      requestAnimationFrame(() => {
        input.focus({ preventScroll: true });
        setTimeout(() => {
          input.focus({ preventScroll: true });
        }, 35);
      });
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
        e.preventDefault();
        e.stopPropagation();
        handleCommit(e, true);
        return;
      }

      // Backspace on empty input -> Delete the blank line!
      if (e.key === 'Backspace' || e.keyCode === 8 || e.which === 8) {
        if (input.value === '') {
          if (isBlankSlot && taskId) {
            e.preventDefault();
            e.stopPropagation();
            this.deleteBlankTask(taskId, sectionId);
            return;
          }

          // If in bottom input and previous task in section is an empty line, delete it
          if (!isBlankSlot) {
            const tabTasks = this.tasks[this.currentTab] || [];
            const secTasks = tabTasks.filter(t => (t.section || 'personal') === (sectionId || 'personal'));
            if (secTasks.length > 0) {
              const lastSecTask = secTasks[secTasks.length - 1];
              if (lastSecTask.isEmpty || !lastSecTask.text) {
                e.preventDefault();
                e.stopPropagation();
                this.deleteBlankTask(lastSecTask.id, sectionId);
                return;
              }
            }
          }
        }
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
        e.preventDefault();
        e.stopPropagation();
        input.focus({ preventScroll: true });
      }
    });

    input.addEventListener('blur', () => {
      const finalVal = input.value.trim();
      if (finalVal) {
        handleCommit(null, false);
      }
    });
  }

  // Attach interactive listeners for inline writing lines
  attachInlineInputEvents() {
    const inlineInputs = this.contentContainer.querySelectorAll('.inline-task-input');
    inlineInputs.forEach(input => {
      this.attachEventsToInlineInput(input);
    });

    // Attach click events for blank slot delete buttons (×)
    const blankDeleteBtns = this.contentContainer.querySelectorAll('.blank-slot-delete-btn');
    blankDeleteBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const sec = btn.closest('.notebook-section');
        const secId = sec ? sec.dataset.section : 'personal';
        this.deleteBlankTask(taskId, secId);
      };
    });
  }

  // Move task order up or down respecting priority and section
  moveTaskOrder(taskId, direction) {
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      return;
    }
    const tabTasks = this.tasks[this.currentTab];
    if (!tabTasks) return;
    const taskIndex = tabTasks.findIndex(t => String(t.id) === String(taskId));
    if (taskIndex === -1) return;

    const task = tabTasks[taskIndex];
    const section = task.section || 'personal';
    const rank = getPriorityRank(task);
    const completed = !!task.completed;

    // Filter tasks belonging to the same section, completion state and priority rank
    const matchingSectionTasks = tabTasks.filter(t =>
      (t.section || 'personal') === section &&
      !!t.completed === completed &&
      getPriorityRank(t) === rank
    );

    const posInGroup = matchingSectionTasks.findIndex(t => String(t.id) === String(taskId));
    if (posInGroup === -1) return;

    if (direction === 'up') {
      if (posInGroup === 0) {
        triggerHaptic(10);
        return;
      }
      const targetNeighbor = matchingSectionTasks[posInGroup - 1];
      const targetIndex = tabTasks.findIndex(t => String(t.id) === String(targetNeighbor.id));
      if (targetIndex !== -1) {
        tabTasks.splice(taskIndex, 1);
        tabTasks.splice(targetIndex, 0, task);
        this.saveTasks();
        triggerHaptic(20);
        this.render();
        setTimeout(() => {
          const newWrapper = this.contentContainer.querySelector(`.task-row-wrapper[data-id="${taskId}"]`);
          if (newWrapper) {
            newWrapper.classList.add('open');
            const row = newWrapper.querySelector('.task-row');
            const actions = newWrapper.querySelector('.task-swipe-actions-right');
            if (row) row.style.transform = 'translateX(-180px)';
            if (actions) actions.style.transform = 'translateX(0px)';
          }
        }, 30);
      } else {
        triggerHaptic(10);
      }
    } else if (direction === 'down') {
      if (posInGroup >= matchingSectionTasks.length - 1) {
        triggerHaptic(10);
        return;
      }
      const targetNeighbor = matchingSectionTasks[posInGroup + 1];
      const targetIndex = tabTasks.findIndex(t => String(t.id) === String(targetNeighbor.id));
      if (targetIndex !== -1) {
        tabTasks.splice(taskIndex, 1);
        tabTasks.splice(targetIndex, 0, task);
        this.saveTasks();
        triggerHaptic(20);
        this.render();
        setTimeout(() => {
          const newWrapper = this.contentContainer.querySelector(`.task-row-wrapper[data-id="${taskId}"]`);
          if (newWrapper) {
            newWrapper.classList.add('open');
            const row = newWrapper.querySelector('.task-row');
            const actions = newWrapper.querySelector('.task-swipe-actions-right');
            if (row) row.style.transform = 'translateX(-180px)';
            if (actions) actions.style.transform = 'translateX(0px)';
          }
        }, 30);
      } else {
        triggerHaptic(10);
      }
    }
  }

  // Render Notebook Content for current tab using its dynamic sections
  render() {
    const sheetEl = document.getElementById('notebookSheet') || document.querySelector('.notebook-sheet');
    const prevScrollTop = sheetEl ? sheetEl.scrollTop : 0;
    const currentTasks = this.tasks[this.currentTab] || [];
    let html = '';

    const todayStr = this.getTodayDateString();
    const isTodoTab = this.currentTab === 'todo';
    const isPastDay = isTodoTab && this.selectedDate < todayStr;
    const isFutureDay = isTodoTab && this.selectedDate > todayStr;
    const isNotToday = isPastDay || isFutureDay;

    const appFrame = document.getElementById('appFrame') || document.body;
    if (appFrame) {
      appFrame.classList.toggle('is-past-day-mode', isPastDay);
    }
    document.body.classList.toggle('is-past-day-mode', isPastDay);

    // 1. Manage FAB button visibility (hidden ONLY on past archive days)
    if (this.fabBtn) {
      const fabWrapper = this.fabBtn.closest('.fab-wrapper') || this.fabBtn;
      if (fabWrapper) {
        fabWrapper.style.setProperty('display', isPastDay ? 'none' : 'flex', 'important');
      }
    }

    // 2. Manage Stickers FAB button visibility (hidden ONLY on past archive days)
    if (this.fabStickersBtn) {
      const fabStickersWrapper = this.fabStickersBtn.closest('.fab-stickers-wrapper') || this.fabStickersBtn;
      if (fabStickersWrapper) {
        fabStickersWrapper.style.setProperty('display', isPastDay ? 'none' : 'flex', 'important');
      }
    }

    // 3. Manage Pet Companion anchor visibility (hidden ONLY on past archive days)
    const petAnchor = document.getElementById('notebookPetAnchor');
    if (petAnchor) {
      petAnchor.style.setProperty('display', isPastDay ? 'none' : 'flex', 'important');
    }

    // 4. Manage Floating Return to Today Button (visible in past and future days)
    const returnWrapper = document.getElementById('pastDayReturnWrapper');
    if (returnWrapper) {
      returnWrapper.style.setProperty('display', isNotToday ? 'flex' : 'none', 'important');
      returnWrapper.classList.toggle('is-future-day', isFutureDay);
      const returnText = document.getElementById('pastDayReturnText');
      if (returnText) {
        const lang = this.settings?.lang || 'ru';
        returnText.textContent = lang === 'en' ? 'Back to Today' : (lang === 'uk' ? 'Повернутися до Сьогодні' : 'Вернуться в Сегодня');
      }
    }

    const sections = this.getTabSections(this.currentTab);
    const grouped = {};
    sections.forEach(sec => { grouped[sec.id] = []; });

    if (this.currentTab === 'watch') {
      const activeGrouped = {};
      const archiveGrouped = {};

      sections.forEach(sec => {
        activeGrouped[sec.id] = [];
        archiveGrouped[sec.id] = [];
      });

      currentTasks.forEach(task => {
        let secId = task.section;
        if (!activeGrouped[secId] && !archiveGrouped[secId]) {
          const found = sections.find(s => s.id === secId || s.name.toLowerCase() === (task.section || '').toLowerCase() || s.name.toLowerCase() === (task.place || '').toLowerCase() || s.name.toLowerCase() === (task.watchType || '').toLowerCase());
          secId = found ? found.id : (sections[0] ? sections[0].id : 'movies');
        }

        if (task.completed) {
          if (!archiveGrouped[secId]) archiveGrouped[secId] = [];
          archiveGrouped[secId].push(task);
        } else {
          if (!activeGrouped[secId]) activeGrouped[secId] = [];
          activeGrouped[secId].push(task);
        }
      });

      // 1. Render Active Sections (Only uncompleted movies/series/cartoons)
      sections.forEach(sec => {
        const tasksInSec = activeGrouped[sec.id] || [];
        tasksInSec.sort((a, b) => {
          const rankA = getPriorityRank(a);
          const rankB = getPriorityRank(b);
          if (rankA !== rankB) return rankA - rankB;
          return 0;
        });

        const headerTitle = (sec.key && this.t(sec.key)) ? this.t(sec.key) : `${sec.icon ? sec.icon + ' ' : ''}${sec.name}`;

        html += `
          <div class="notebook-section" data-section="${sec.id}">
            <div class="section-header-row" data-section="${sec.id}">
              <span class="section-header-text" data-section="${sec.id}">${this.escapeHtml(headerTitle)}</span>
            </div>
            <div class="section-tasks-list" data-section="${sec.id}">
        `;

        tasksInSec.forEach(task => {
          html += this.renderTaskRow(task);
        });

        html += `
              <div class="inline-task-row" data-section="${sec.id}">
                <div class="inline-task-bullet">
                  <span class="bullet-pencil">✏️</span>
                  <div class="task-checkbox inline-checkbox"></div>
                </div>
                <input type="text" 
                       class="inline-task-input" 
                       data-section="${sec.id}" 
                       placeholder="${this.t('inline_input_placeholder') || 'Нажмите, чтобы записать...'}" 
                       autocomplete="off"
                       enterkeyhint="done" />
              </div>
            </div>
          </div>
        `;
      });

      // 2. Render Archives PER SECTION (Sorted alphabetically by title)
      sections.forEach(sec => {
        const archivedInSec = archiveGrouped[sec.id] || [];
        if (archivedInSec.length > 0) {
          archivedInSec.sort((a, b) => cleanTaskText(a.text || '').localeCompare(cleanTaskText(b.text || ''), 'ru', { sensitivity: 'base' }));

          let archiveTitle = '';
          const lang = this.settings?.lang || 'ru';
          if (sec.id === 'movies') {
            archiveTitle = lang === 'en' ? 'MOVIES ARCHIVE' : (lang === 'uk' ? 'АРХІВ ФІЛЬМІВ' : 'АРХИВ ФИЛЬМОВ');
          } else if (sec.id === 'series') {
            archiveTitle = lang === 'en' ? 'SERIES ARCHIVE' : (lang === 'uk' ? 'АРХІВ СЕРІАЛІВ' : 'АРХИВ СЕРИАЛОВ');
          } else {
            const prefix = lang === 'en' ? 'ARCHIVE' : (lang === 'uk' ? 'АРХІВ' : 'АРХИВ');
            archiveTitle = `${prefix}: ${sec.name.toUpperCase()}`;
          }

          const icon = sec.icon || '🎬';

          html += `
            <div class="notebook-section archive-section watch-archive-${sec.id}" data-section="archive_${sec.id}">
              <div class="section-header-row" data-section="archive_${sec.id}">
                <span class="section-header-text" data-section="archive_${sec.id}">${icon} ${archiveTitle} (${archivedInSec.length})</span>
              </div>
              <div class="section-tasks-list" data-section="archive_${sec.id}">
          `;

          archivedInSec.forEach(task => {
            html += this.renderTaskRow(task);
          });

          html += `
              </div>
            </div>
          `;
        }
      });
    } else {
      // Standard grouping for other tabs
      currentTasks.forEach(task => {
        let secId = task.section || getTaskSection(task);
        if (!grouped[secId]) {
          const found = sections.find(s => s.id === secId || s.name.toLowerCase() === (task.section || '').toLowerCase() || s.name.toLowerCase() === (task.place || '').toLowerCase() || s.name.toLowerCase() === (task.watchType || '').toLowerCase());
          if (found) {
            secId = found.id;
          } else if (sections.length > 0) {
            secId = sections[0].id;
          }
        }
        if (grouped[secId]) {
          grouped[secId].push(task);
        }
      });

      if (isPastDay) {
        const totalPastTasks = currentTasks.filter(t => !t.isEmpty && t.text && t.text.trim().length > 0).length;
        if (totalPastTasks === 0) {
          const isEn = this.settings.lang === 'en';
          const isUk = this.settings.lang === 'uk';
          const emptyTitle = isEn ? 'Archive is empty' : (isUk ? 'Архів цього дня порожній' : 'Архив этого дня пуст');
          const emptySub = isEn ? 'No completed tasks recorded on this day' : (isUk ? 'У цей день не було виконаних завдань' : 'В этот день не было выполненных дел');
          html += `
            <div class="past-day-empty-state">
              <div class="past-day-empty-icon">📜</div>
              <div class="past-day-empty-title">${emptyTitle}</div>
              <div class="past-day-empty-subtitle">${emptySub}</div>
            </div>
          `;
        } else {
          const isEn = this.settings.lang === 'en';
          const isUk = this.settings.lang === 'uk';
          const bannerText = isEn ? 'Archive of past day • Read only' : (isUk ? 'Архів минулого дня • Тільки перегляд' : 'Архив прошедшего дня • Только просмотр');
          html += `
            <div class="past-day-archive-banner">
              <span>🔒</span>
              <span>${bannerText}</span>
            </div>
          `;

          sections.forEach(sec => {
            const tasksInSec = grouped[sec.id] || [];
            if (tasksInSec.length === 0) return; // Hide empty sections in past archive

            tasksInSec.sort((a, b) => {
              if (a.completed !== b.completed) return a.completed ? 1 : -1;
              const rankA = getPriorityRank(a);
              const rankB = getPriorityRank(b);
              if (rankA !== rankB) return rankA - rankB;
              return 0;
            });

            const headerTitle = (sec.key && this.t(sec.key)) ? this.t(sec.key) : `${sec.icon ? sec.icon + ' ' : ''}${sec.name}`;

            html += `
              <div class="notebook-section" data-section="${sec.id}">
                <div class="section-header-row" data-section="${sec.id}">
                  <span class="section-header-text" data-section="${sec.id}">${this.escapeHtml(headerTitle)}</span>
                </div>
                <div class="section-tasks-list" data-section="${sec.id}">
            `;

            tasksInSec.forEach(task => {
              html += this.renderTaskRow(task);
            });

            html += `
                </div>
              </div>
            `;
          });
        }
      } else {
        sections.forEach(sec => {
          const tasksInSec = grouped[sec.id] || [];

          // Sort tasks: Active first (important first, then normal), then completed, preserving manual array order
          tasksInSec.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const rankA = getPriorityRank(a);
            const rankB = getPriorityRank(b);
            if (rankA !== rankB) return rankA - rankB;
            return 0;
          });

          const headerTitle = (sec.key && this.t(sec.key)) ? this.t(sec.key) : `${sec.icon ? sec.icon + ' ' : ''}${sec.name}`;

          html += `
            <div class="notebook-section" data-section="${sec.id}">
              <div class="section-header-row" data-section="${sec.id}">
                <span class="section-header-text" data-section="${sec.id}">${this.escapeHtml(headerTitle)}</span>
              </div>
              <div class="section-tasks-list" data-section="${sec.id}">
          `;

          tasksInSec.forEach(task => {
            html += this.renderTaskRow(task);
          });

          // Interactive inline notepad line input
          html += `
                <div class="inline-task-row" data-section="${sec.id}">
                  <div class="inline-task-bullet">
                    <span class="bullet-pencil">✏️</span>
                    <div class="task-checkbox inline-checkbox"></div>
                  </div>
                  <input type="text" 
                         class="inline-task-input" 
                         data-section="${sec.id}" 
                         placeholder="${this.t('inline_input_placeholder') || 'Нажмите, чтобы записать...'}" 
                         autocomplete="off"
                         enterkeyhint="done" />
                </div>
              </div>
            </div>
          `;
        });
      }
    }

    this.contentContainer.innerHTML = html;

    // Restore scroll position so screen never jumps
    if (sheetEl && prevScrollTop > 0) {
      sheetEl.scrollTop = prevScrollTop;
    }

    // Attach interactive swipe gestures and actions
    this.attachSwipeEvents();

    // Attach inline notepad line input events
    this.attachInlineInputEvents();

    // Attach section header long-press and context menu events
    this.attachSectionHeaderEvents();

    // Render notebook customizable stickers layer
    this.renderStickers();

    this.updateWorkloadWidget();
  }

  // Attach Long-Press (Only) and Context Menu to Section Headers
  // Attach Long-Press (Only) and Context Menu strictly to Section Header Badge
  attachSectionHeaderEvents() {
    const headerRows = this.contentContainer.querySelectorAll('.section-header-row');
    headerRows.forEach(row => {
      const secId = row.dataset.section;
      if (!secId || secId.startsWith('archive_')) return;

      const textBadge = row.querySelector('.section-header-text');
      if (!textBadge) return;

      let pressTimer = null;
      let startX = 0;
      let startY = 0;

      const startPress = (e) => {
        if (e.button && e.button !== 0) return;
        startX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
        startY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
        clearTimeout(pressTimer);
        pressTimer = setTimeout(() => {
          pressTimer = null;
          triggerHaptic([30, 60]);
          this.openSectionMenuModal(secId);
        }, 420);
      };

      const cancelPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      textBadge.addEventListener('pointerdown', startPress);
      textBadge.addEventListener('pointerup', cancelPress);
      textBadge.addEventListener('pointercancel', cancelPress);
      textBadge.addEventListener('pointermove', (e) => {
        if (pressTimer) {
          const currentX = e.clientX || 0;
          const currentY = e.clientY || 0;
          if (Math.abs(currentX - startX) > 10 || Math.abs(currentY - startY) > 10) {
            cancelPress();
          }
        }
      });

      textBadge.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        cancelPress();
        triggerHaptic(20);
        this.openSectionMenuModal(secId);
      });
    });

    // 4. Render stickers for current tab/page
    this.renderStickers();
  }

  // Render individual task row HTML - Interactive swipeable notebook line with priority typography
  renderTaskRow(task) {
    const isWatchArchive = this.currentTab === 'watch' && task.completed;
    const isBuyCompleted = this.currentTab === 'buy' && task.completed;
    const todayStr = this.getTodayDateString();
    const isPastArchived = (this.currentTab === 'todo' && this.selectedDate < todayStr);

    if (task.isEmpty || !task.text) {
      if (isPastArchived || isWatchArchive) return '';
      return `
        <div class="task-row-wrapper task-row-empty-slot" data-id="${task.id}">
          <div class="task-swipe-actions-right">
            <button type="button" class="swipe-action-btn action-move-up" data-action="move-up" title="Переместить вверх" aria-label="Вверх">
              <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
            <button type="button" class="swipe-action-btn action-move-down" data-action="move-down" title="Переместить вниз" aria-label="Вниз">
              <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </button>
            <button type="button" class="swipe-action-btn action-delete" data-action="delete" title="Удалить пустую строку" aria-label="Удалить">
              <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          <div class="task-row task-row-blank" data-id="${task.id}">
            <div class="task-checkbox-container">
              <div class="task-checkbox blank-slot-checkbox" title="Свободная строка для записи"></div>
            </div>
            <div class="task-text blank-slot-text">
              <input type="text"
                     class="inline-task-input blank-task-input"
                     data-task-id="${task.id}"
                     data-section="${task.section || 'personal'}"
                     placeholder="${this.t('blank_line_placeholder') || 'Пустая строка (нажмите для записи)...'}"
                     value=""
                     autocomplete="off"
                     enterkeyhint="done" />
            </div>
            <button type="button" class="blank-slot-delete-btn" data-task-id="${task.id}" title="Удалить пустую строку" aria-label="Удалить">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    }

    const swipeCheckLabel = task.completed ? this.t('btn_cancel') : (this.settings.lang === 'en' ? 'Done' : 'Готово');
    const priorityRank = getPriorityRank(task);
    const isImportant = priorityRank === 1 || (task.priority && (task.priority.toLowerCase() === 'важный' || task.priority.toLowerCase() === 'очень важно' || task.priority.toLowerCase() === 'вопрос жизни и смерти'));
    const priorityClass = isImportant ? 'priority-important' : 'priority-calm';
    const taskColor = isImportant ? (task.color || 'black') : 'black';

    const cleanTitle = cleanTaskText(task.text);

    return `
      <div class="task-row-wrapper ${isImportant ? 'is-important-wrapper' : ''} ${isPastArchived ? 'is-past-archived-wrapper no-swipe' : ''} ${isBuyCompleted ? 'is-single-delete' : ''}" data-id="${task.id}">
        ${!isPastArchived ? (isBuyCompleted ? `
        <!-- Right side actions for completed purchase: ONLY Delete button -->
        <div class="task-swipe-actions-right swipe-delete-only">
          <button type="button" class="swipe-action-btn action-delete" data-action="delete" title="Удалить" aria-label="Удалить" style="width: 50px;">
            <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>` : `
        <!-- Right side actions on swipe left (5 buttons: Move Up, Move Down, Defer, Edit, Delete) -->
        <div class="task-swipe-actions-right">
          <button type="button" class="swipe-action-btn action-move-up" data-action="move-up" title="Переместить вверх" aria-label="Вверх">
            <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
          <button type="button" class="swipe-action-btn action-move-down" data-action="move-down" title="Переместить вниз" aria-label="Вниз">
            <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>
          <button type="button" class="swipe-action-btn action-defer" data-action="defer" title="Перенести на следующий день" aria-label="Перенести">
            <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
          <button type="button" class="swipe-action-btn action-edit" data-action="edit" title="Редактировать" aria-label="Редактировать">
            <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="swipe-action-btn action-delete" data-action="delete" title="Удалить" aria-label="Удалить">
            <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>`) : ''}

        ${!isPastArchived ? `
        <!-- Left side complete indicator on swipe right -->
        <div class="task-swipe-check-bg">
          <span class="swipe-check-icon">✓</span>
          <span class="swipe-check-text">${swipeCheckLabel}</span>
        </div>` : ''}

        <!-- Sliding foreground task row -->
        <div class="task-row ${task.completed ? 'completed' : ''} ${isImportant ? 'task-row-important' : ''} ${isPastArchived ? 'is-past-archived' : ''}" data-id="${task.id}" data-color="${taskColor}">
          <div class="task-checkbox-container">
            <div class="task-checkbox ${isPastArchived ? 'checkbox-archived' : ''}" role="checkbox" aria-checked="${task.completed}" title="${isPastArchived ? 'В архиве истории' : ''}"></div>
          </div>
          <div class="task-text ${priorityClass}" data-color="${taskColor}">
            <span class="task-title-text ${isImportant ? 'task-text-bold' : ''}">${this.escapeHtml(cleanTitle)}</span>
            ${isPastArchived ? `<span class="archived-lock-badge" title="Завершено в истории">🔒</span>` : ''}
            ${task.time ? `<span class="task-time-badge">⏰ ${this.escapeHtml(task.time)}</span>` : ''}
            ${isWatchArchive && task.completedDate ? `<span class="archive-date-tag">✓ ${task.completedDate}</span>` : ''}
            ${task.notes ? `<div class="task-attached-notes">${this.escapeHtml(task.notes)}</div>` : ''}
            ${(task.link || task.photo) ? `
              <div class="task-attachments-bar">
                ${task.link ? `<a href="${this.escapeHtml(task.link)}" target="_blank" rel="noopener noreferrer" class="task-attached-link" onclick="event.stopPropagation()">🔗 ${this.escapeHtml(task.link.replace(/^https?:\/\//i, '').slice(0, 26))}${task.link.length > 28 ? '...' : ''}</a>` : ''}
                ${task.photo ? `<button type="button" class="task-attached-photo-btn" onclick="event.stopPropagation(); window.appInstance && window.appInstance.openPhotoForTask('${task.id}')">${this.settings.lang === 'en' ? 'Photo' : 'Фото'}</button>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Attach touch and drag swipe gestures for each task row
  attachSwipeEvents() {
    const wrappers = this.contentContainer.querySelectorAll('.task-row-wrapper:not(.no-swipe)');
    let activeOpenWrapper = null;

    const closeAllSwipes = () => {
      wrappers.forEach(w => {
        w.classList.remove('open', 'swiping');
        const r = w.querySelector('.task-row');
        const a = w.querySelector('.task-swipe-actions-right');
        const bg = w.querySelector('.task-swipe-check-bg');
        if (r) {
          r.style.transform = '';
          r.style.transition = '';
        }
        if (a) {
          a.style.transform = '';
          a.style.transition = '';
        }
        if (bg) bg.classList.remove('visible');
      });
      activeOpenWrapper = null;
    };

    // Close open swipe on tap outside
    const outsideTapHandler = (e) => {
      if (activeOpenWrapper && !activeOpenWrapper.contains(e.target)) {
        closeAllSwipes();
      }
    };
    document.removeEventListener('pointerdown', this._outsideTapHandler);
    this._outsideTapHandler = outsideTapHandler;
    document.addEventListener('pointerdown', this._outsideTapHandler, { passive: true });

    wrappers.forEach(wrapper => {
      if (wrapper._swipeBound) return;
      wrapper._swipeBound = true;

      const row = wrapper.querySelector('.task-row');
      const checkBg = wrapper.querySelector('.task-swipe-check-bg');
      const actionsRight = wrapper.querySelector('.task-swipe-actions-right');
      const taskId = wrapper.dataset.id;
      if (!row) return;

      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let isHorizontal = null;
      let rafId = null;
      const isSingleDelete = wrapper.classList.contains('is-single-delete');
      const maxLeftSwipe = isSingleDelete ? -58 : -180;
      const actionsBaseWidth = isSingleDelete ? 58 : 180;
      const openThreshold = isSingleDelete ? -25 : -40;
      const maxRightSwipe = 90;

      const handleStart = (clientX, clientY, target) => {
        if (wrapper.classList.contains('no-swipe') || wrapper.classList.contains('is-past-archived-wrapper')) {
          return false;
        }
        if (target && target.closest('.task-checkbox-container, .task-checkbox, .task-attached-photo-btn, .task-attached-link, a, button')) {
          return false;
        }
        const rowRect = row.getBoundingClientRect();
        if (clientX < rowRect.left || clientX > rowRect.right + 8) {
          return false;
        }
        if (activeOpenWrapper && activeOpenWrapper !== wrapper) {
          closeAllSwipes();
        }
        startX = clientX;
        startY = clientY;
        isDragging = false;
        isHorizontal = null;
        wrapper.classList.add('swiping');
        if (row) row.style.transition = 'none';
        if (actionsRight) actionsRight.style.transition = 'none';
        return true;
      };

      const handleMove = (clientX, clientY, e) => {
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (isHorizontal === null) {
          if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isHorizontal = Math.abs(dx) > Math.abs(dy);
          }
        }

        if (!isHorizontal) return;

        if (!isDragging) {
          isDragging = true;
          if (e && e.target && typeof e.target.blur === 'function') {
            e.target.blur();
          }
          try { window.getSelection()?.removeAllRanges(); } catch (err) { }
        }

        if (e && e.cancelable) e.preventDefault();

        let translateX = dx;
        if (wrapper.classList.contains('open')) {
          translateX = maxLeftSwipe + dx;
        }

        // Resistance at ends
        if (translateX < maxLeftSwipe) {
          translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.25;
        } else if (translateX > maxRightSwipe) {
          translateX = maxRightSwipe + (translateX - maxRightSwipe) * 0.25;
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;

          if (translateX < 0) {
            // Actions follow directly
            const actionsOffset = Math.max(0, actionsBaseWidth + translateX);
            if (actionsRight) actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
            if (checkBg) checkBg.classList.remove('visible');
          } else if (translateX > 15) {
            if (actionsRight) actionsRight.style.transform = 'translate3d(100%, 0, 0)';
            if (checkBg) checkBg.classList.add('visible');
          } else {
            if (actionsRight) actionsRight.style.transform = 'translate3d(100%, 0, 0)';
            if (checkBg) checkBg.classList.remove('visible');
          }
        });
      };

      const handleEnd = (clientX, target) => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        wrapper.classList.remove('swiping');
        if (row) row.style.transition = '';
        if (actionsRight) actionsRight.style.transition = '';
        if (checkBg) checkBg.classList.remove('visible');

        if (target && target.closest('.task-checkbox-container, .task-checkbox, .task-attached-photo-btn, .task-attached-link, a, button, input')) {
          return;
        }

        if (!isDragging) {
          closeAllSwipes();
          return;
        }

        const dx = clientX - startX;

        if (wrapper.classList.contains('open')) {
          if (dx > 30) {
            // Swiped right -> close
            wrapper.classList.remove('open');
            if (row) row.style.transform = '';
            if (actionsRight) actionsRight.style.transform = '';
            activeOpenWrapper = null;
          } else {
            // Stay open
            if (row) row.style.transform = `translate3d(${maxLeftSwipe}px, 0, 0)`;
            if (actionsRight) actionsRight.style.transform = 'translate3d(0px, 0, 0)';
          }
        } else {
          if (dx < openThreshold) {
            // Swiped left enough -> open action menu
            closeAllSwipes();
            wrapper.classList.add('open');
            if (row) row.style.transform = `translate3d(${maxLeftSwipe}px, 0, 0)`;
            if (actionsRight) actionsRight.style.transform = 'translate3d(0px, 0, 0)';
            activeOpenWrapper = wrapper;
            triggerHaptic(15);
          } else if (dx > 45) {
            // Swiped right enough -> complete / undo
            if (row) row.style.transform = '';
            if (actionsRight) actionsRight.style.transform = '';
            triggerHaptic([20, 40]);
            this.toggleTask(taskId);
          } else {
            // Snap back
            if (row) row.style.transform = '';
            if (actionsRight) actionsRight.style.transform = '';
          }
        }
      };

      // Dedicated listener for task checkbox toggle (click and touch with debounce)
      const checkboxContainer = wrapper.querySelector('.task-checkbox-container');
      if (checkboxContainer) {
        const onCheckboxToggle = (e) => {
          if (e) {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
          }
          triggerHaptic(15);
          this.toggleTask(taskId);
        };
        checkboxContainer.addEventListener('click', onCheckboxToggle);
        checkboxContainer.addEventListener('touchend', onCheckboxToggle);
      }

      // Explicitly handle attached Photo Button tap
      const photoBtn = wrapper.querySelector('.task-attached-photo-btn');
      if (photoBtn) {
        photoBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.openPhotoForTask(taskId);
        });
        photoBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
        photoBtn.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
      }

      // Pointer / Mouse events
      let pointerActive = false;
      row.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        if (e.pointerType === 'touch') return; // Handled by touch events
        if (e.target && e.target.closest('.task-checkbox-container, .task-checkbox, .task-attached-photo-btn, .task-attached-link, a, button')) return;

        pointerActive = handleStart(e.clientX, e.clientY, e.target);
        if (!pointerActive) return;

        try { row.setPointerCapture(e.pointerId); } catch (err) { }

        const onPointerMove = (ev) => {
          if (pointerActive) handleMove(ev.clientX, ev.clientY, ev);
        };
        const onPointerUp = (ev) => {
          try { row.releasePointerCapture(ev.pointerId); } catch (err) { }
          row.removeEventListener('pointermove', onPointerMove);
          row.removeEventListener('pointerup', onPointerUp);
          row.removeEventListener('pointercancel', onPointerUp);
          if (pointerActive) {
            handleEnd(ev.clientX, ev.target);
            pointerActive = false;
          }
        };

        row.addEventListener('pointermove', onPointerMove);
        row.addEventListener('pointerup', onPointerUp);
        row.addEventListener('pointercancel', onPointerUp);
      });

      // Native Touch events (smooth & bulletproof on all mobile phones)
      let touchActive = false;
      let touchStartTarget = null;
      row.addEventListener('touchstart', (e) => {
        if (e.target && e.target.closest('.task-checkbox-container, .task-checkbox, .task-attached-photo-btn, .task-attached-link, a, button')) return;
        const touch = e.touches[0];
        touchStartTarget = e.target;
        touchActive = handleStart(touch.clientX, touch.clientY, e.target);
      }, { passive: true });

      row.addEventListener('touchmove', (e) => {
        if (!touchActive) return;
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY, e);
      }, { passive: false });

      row.addEventListener('touchend', (e) => {
        if (!touchActive) return;
        const touch = e.changedTouches[0];
        handleEnd(touch ? touch.clientX : 0, touchStartTarget);
        touchActive = false;
        touchStartTarget = null;
      }, { passive: true });

      row.addEventListener('touchcancel', () => {
        if (touchActive) {
          handleEnd(0, touchStartTarget);
          touchActive = false;
          touchStartTarget = null;
        }
      }, { passive: true });
    });
  }

  // Update Task Counter Widget (Top: Completed tasks, Bottom: Total planned tasks)
  updateWorkloadWidget() {
    const todoTasks = (this.tasks['todo'] || []).filter(t => !t.isEmpty && (t.text && t.text.trim().length > 0));
    const totalCount = todoTasks.length;
    const completedCount = todoTasks.filter(t => t.completed).length;

    const remEl = document.getElementById('widgetProgressRemaining');
    const totEl = document.getElementById('widgetProgressTotal');
    const textEl = document.getElementById('widgetProgressText');

    if (remEl && totEl) {
      remEl.textContent = completedCount.toString();
      totEl.textContent = `/ ${totalCount}`;
    } else if (textEl) {
      textEl.textContent = `${completedCount} / ${totalCount}`;
    }

    const circleEl = document.getElementById('widgetProgressRingFill') || document.querySelector('.progress-ring-fill');
    if (circleEl) {
      const radius = 23.5;
      const circumference = 2 * Math.PI * radius; // ~147.65

      let fraction = 0;
      if (totalCount > 0) {
        fraction = Math.min(Math.max(completedCount / totalCount, 0), 1);
      }
      const offset = circumference * (1 - fraction);

      circleEl.style.strokeDasharray = `${circumference.toFixed(2)}`;
      circleEl.style.strokeDashoffset = `${offset.toFixed(2)}`;
    }

    const widgetTimer = document.getElementById('widgetTimer');
    if (widgetTimer) {
      const isEn = this.settings.lang === 'en';
      const isUk = this.settings.lang === 'uk';
      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      widgetTimer.title = isEn
        ? `Completed: ${completedCount} of ${totalCount} tasks (${percent}%)`
        : (isUk
          ? `Виконано: ${completedCount} з ${totalCount} справ (${percent}%)`
          : `Выполнено: ${completedCount} из ${totalCount} дел (${percent}%)`);
    }
  }

  // =========================================================================
  // STICKERS & NOTEBOOK CUSTOMIZATION ENGINE
  // =========================================================================

  // Load stickers dictionary: { [tabSheetKey]: [ { id, type, x, y, scale, rotate, zIndex } ] }
  loadStickers() {
    try {
      const saved = localStorage.getItem('plan4u_stickers.json') || localStorage.getItem('todo_notebook_stickers');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          for (const key in parsed) {
            if (Array.isArray(parsed[key])) {
              parsed[key] = parsed[key].filter(stk => stk && typeof stk === 'object' && stk.id && stk.type).map(stk => ({
                id: stk.id,
                type: stk.type,
                x: (typeof stk.x === 'number' && !isNaN(stk.x)) ? parseFloat(Math.max(5, Math.min(95, stk.x)).toFixed(2)) : 50,
                y: (typeof stk.y === 'number' && !isNaN(stk.y)) ? Math.max(10, Math.round(stk.y)) : 240,
                scale: (typeof stk.scale === 'number' && !isNaN(stk.scale)) ? parseFloat(stk.scale.toFixed(2)) : 1.0,
                rotate: (typeof stk.rotate === 'number' && !isNaN(stk.rotate)) ? Math.round(stk.rotate) : 0,
                zIndex: stk.zIndex || 12
              }));
            }
          }

          // Migrate any legacy date keys (YYYY-MM-DD) into (todo_YYYY-MM-DD)
          const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;
          for (const key in parsed) {
            if (dateKeyRegex.test(key) && Array.isArray(parsed[key])) {
              const newKey = `todo_${key}`;
              if (!parsed[newKey]) {
                parsed[newKey] = parsed[key];
              }
              delete parsed[key];
            }
          }

          // If legacy 'todo' key exists and today's key doesn't, migrate it to today's date
          const todayStr = this.getTodayDateString();
          const todayKey = `todo_${todayStr}`;
          if (Array.isArray(parsed.todo) && parsed.todo.length > 0 && !parsed[todayKey]) {
            parsed[todayKey] = JSON.parse(JSON.stringify(parsed.todo));
          }

          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load stickers:', e);
    }
    return {};
  }

  saveStickers() {
    try {
      if (!this.stickers || typeof this.stickers !== 'object') return;
      const todayStr = this.getTodayDateString();
      // Past archives are frozen and read-only
      if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
        return;
      }
      const jsonStr = JSON.stringify(this.stickers);
      localStorage.setItem('todo_notebook_stickers', jsonStr);
      localStorage.setItem('plan4u_stickers.json', jsonStr);
      if (window.Plan4UStorage) {
        Plan4UStorage.saveFile('stickers.json', this.stickers);
      }
      this.triggerBackgroundBackup?.();
      this.scheduleCloudSync?.();
    } catch (e) {
      console.warn('Could not save stickers:', e);
    }
  }

  getStickerPageKey(targetDate = null) {
    if (this.currentTab === 'todo') {
      const dateStr = targetDate || this.selectedDate || this.getTodayDateString();
      return `todo_${dateStr}`;
    }
    return this.currentTab || 'todo';
  }

  getCurrentPageStickers() {
    if (!this.stickers || typeof this.stickers !== 'object') this.stickers = {};
    const key = this.getStickerPageKey();

    // If this is a daily todo sheet and it's not yet populated for this date:
    if (this.currentTab === 'todo') {
      if (!Array.isArray(this.stickers[key])) {
        const currentDate = this.selectedDate || this.getTodayDateString();
        // Look for the most recent preceding day that has stickers
        const allTodoDays = Object.keys(this.stickers)
          .filter(k => k.startsWith('todo_') && k.slice(5) < currentDate && Array.isArray(this.stickers[k]) && this.stickers[k].length > 0)
          .map(k => k.slice(5))
          .sort();

        const latestPastDay = allTodoDays.pop();

        if (latestPastDay && Array.isArray(this.stickers[`todo_${latestPastDay}`])) {
          // Clone yesterday's stickers to the new day with fresh IDs so each day is fully independent
          this.stickers[key] = this.stickers[`todo_${latestPastDay}`].map(stk => ({
            ...stk,
            id: 'stk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
          }));
          this.saveStickers();
        } else if (Array.isArray(this.stickers.todo) && this.stickers.todo.length > 0) {
          // Migration fallback from legacy un-dated 'todo' sheet
          this.stickers[key] = this.stickers.todo.map(stk => ({
            ...stk,
            id: 'stk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
          }));
          this.saveStickers();
        } else {
          this.stickers[key] = [];
        }
      }
    } else {
      if (!Array.isArray(this.stickers[key])) {
        this.stickers[key] = [];
      }
    }

    return this.stickers[key];
  }

  renderStickers() {
    const layer = this.notebookStickersLayer || document.getElementById('notebookStickersLayer');
    if (!layer) return;
    layer.innerHTML = '';

    const list = this.getCurrentPageStickers();
    if (!list || list.length === 0) return;

    list.forEach(stk => {
      const el = this.createStickerElement(stk);
      layer.appendChild(el);
    });
  }

  findStickerDef(typeId) {
    for (const cat in STICKERS_CATALOG) {
      const found = STICKERS_CATALOG[cat].find(s => s.id === typeId);
      if (found) return found;
    }
    if (typeId?.startsWith('fall_')) return { id: typeId, img: `./assets/stickers/fall/${typeId}.webp` };
    if (typeId?.startsWith('more_cat_')) return { id: typeId, img: `./assets/stickers/more_cats/${typeId}.webp` };
    if (typeId?.startsWith('flora_')) return { id: typeId, img: `./assets/stickers/flora/${typeId}.webp` };
    if (typeId?.startsWith('fauna_')) return { id: typeId, img: `./assets/stickers/fauna/${typeId}.webp` };
    if (typeId?.startsWith('ocean_')) return { id: typeId, img: `./assets/stickers/ocean/${typeId}.webp` };
    if (typeId?.startsWith('pigs_') || typeId?.startsWith('pig_')) return { id: typeId, img: `./assets/stickers/pigs/${typeId}.webp` };
    if (typeId?.startsWith('cat_')) return { id: typeId, img: `./assets/stickers/cats/${typeId}.webp` };
    return null;
  }

  createStickerElement(stk) {
    const def = this.findStickerDef(stk.type);
    const div = document.createElement('div');
    div.className = 'placed-sticker';
    div.dataset.stickerId = stk.id;
    div.dataset.type = stk.type;

    const x = (typeof stk.x === 'number' && !isNaN(stk.x)) ? Math.max(5, Math.min(95, stk.x)) : 50;
    const y = (typeof stk.y === 'number' && !isNaN(stk.y)) ? Math.max(10, Math.round(stk.y)) : 240;
    const scale = (typeof stk.scale === 'number' && !isNaN(stk.scale)) ? stk.scale : 1.0;
    const rotate = (typeof stk.rotate === 'number' && !isNaN(stk.rotate)) ? stk.rotate : 0;

    stk.x = parseFloat(x.toFixed(2));
    stk.y = Math.round(y);
    stk.scale = parseFloat(scale.toFixed(2));
    stk.rotate = Math.round(rotate);

    div.style.left = `${stk.x}%`;
    div.style.top = `${stk.y}px`;
    div.style.zIndex = stk.zIndex || 12;
    div.style.setProperty('--rot', `${stk.rotate}deg`);
    div.style.setProperty('--sc', `${stk.scale}`);
    div.style.transform = `translate(-50%, -50%) rotate(${stk.rotate}deg) scale(${stk.scale})`;

    // Width and height
    const isWashi = stk.type === 'washi_tape' || stk.type === 'highlighter';
    const baseW = isWashi ? 96 : (def?.img ? 76 : 72);
    const baseH = isWashi ? 48 : (def?.img ? 76 : 72);
    div.style.width = `${baseW}px`;
    div.style.height = `${baseH}px`;

    if (def) {
      if (def.img) {
        div.innerHTML = `<img src="${def.img}" alt="${stk.type}" draggable="false" class="placed-sticker-img" />`;
      } else if (def.svg) {
        div.innerHTML = def.svg;
      }
    }

    if (this.selectedStickerId === stk.id) {
      div.classList.add('is-selected');
    }

    const todayStr = this.getTodayDateString();
    const isPastDay = this.currentTab === 'todo' && this.selectedDate < todayStr;
    if (isPastDay) {
      div.style.pointerEvents = 'none';
      div.classList.add('is-past-archive');
      return div;
    }

    this.attachStickerInteraction(div, stk);
    return div;
  }

  attachStickerInteraction(el, stk) {
    let dragTimer = null;
    let menuTimer = null;
    let isDragReady = false;
    let isMenuOpened = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startStkX = stk.x;
    let startStkY = stk.y;
    let activePointerId = null;

    const cleanup = () => {
      clearTimeout(dragTimer);
      clearTimeout(menuTimer);
      dragTimer = null;
      menuTimer = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      try {
        if (activePointerId !== null && el.hasPointerCapture && el.hasPointerCapture(activePointerId)) {
          el.releasePointerCapture(activePointerId);
        }
      } catch (err) { }
      activePointerId = null;
      const stickersLayer = document.getElementById('notebookStickersLayer');
      if (stickersLayer) stickersLayer.classList.remove('has-dragging-sticker');
      document.body.classList.remove('is-dragging-sticker');
      el.classList.remove('is-dragging');
    };

    const startInteraction = (clientX, clientY, isTouch, pointerId = null) => {
      cleanup();

      const todayStr = this.getTodayDateString();
      const isPastDay = this.currentTab === 'todo' && this.selectedDate < todayStr;
      if (isPastDay) return;

      const pageSheet = document.getElementById('notebookSheet');
      if (!pageSheet) return;

      startX = clientX;
      startY = clientY;
      startStkX = (typeof stk.x === 'number') ? stk.x : 50;
      startStkY = (typeof stk.y === 'number') ? stk.y : 240;
      isDragReady = false;
      isMenuOpened = false;
      isDragging = false;
      activePointerId = pointerId;

      // 1. Подхват стикера при задержке 250 мс с ощутимым тактильным виброоткликом
      dragTimer = setTimeout(() => {
        isDragReady = true;
        triggerHaptic([35, 50]);
        const stickersLayer = document.getElementById('notebookStickersLayer');
        if (stickersLayer) stickersLayer.classList.add('has-dragging-sticker');
        document.body.classList.add('is-dragging-sticker');
        el.classList.add('is-dragging');
      }, 250);

      // 2. Контекстное меню стикера при статичном удержании 1500 мс (без сдвига)
      menuTimer = setTimeout(() => {
        if (!isDragging) {
          isMenuOpened = true;
          triggerHaptic([50, 70]);
          this.selectSticker(stk.id);
          this.openStickerContextMenu(stk.id, el, { clientX, clientY });
        }
      }, 2000);

      if (isTouch) {
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        window.addEventListener('touchcancel', onTouchEnd, { passive: true });
      } else {
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerEnd);
        window.addEventListener('pointercancel', onPointerEnd);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerEnd);
      }
    };

    const handleMove = (clientX, clientY, e, isTouch) => {
      const pageSheet = document.getElementById('notebookSheet');
      if (!pageSheet) return;

      const dx = clientX - startX;
      const dy = clientY - startY;

      // Если прошло меньше 250 мс: проверяем, не скроллит ли пользователь страницу
      if (!isDragReady) {
        if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
          cleanup();
        }
        return;
      }

      // Прошло 250 мс (подхват готов): при движении начинаем перемещение и отменяем меню
      if (!isMenuOpened && !isDragging) {
        if (Math.abs(dx) >= 2 || Math.abs(dy) >= 2) {
          clearTimeout(menuTimer);
          menuTimer = null;
          isDragging = true;
          el.classList.add('is-dragging');
          const stickersLayer = document.getElementById('notebookStickersLayer');
          if (stickersLayer) stickersLayer.classList.add('has-dragging-sticker');
          document.body.classList.add('is-dragging-sticker');
          this.closeStickerContextMenu();
          this.deselectStickers();
        }
      }

      if (isDragging) {
        if (e && e.cancelable) e.preventDefault();

        const rect = pageSheet.getBoundingClientRect();
        const newX = Math.max(5, Math.min(95, startStkX + (dx / rect.width) * 100));
        const newY = Math.max(20, startStkY + dy);

        stk.x = parseFloat(newX.toFixed(2));
        stk.y = Math.round(newY);

        el.style.left = `${stk.x}%`;
        el.style.top = `${stk.y}px`;
      }
    };

    const handleEnd = (clientX, clientY, evt) => {
      const wasDragging = isDragging;
      const wasMenu = isMenuOpened;

      cleanup();

      isDragReady = false;
      isMenuOpened = false;
      isDragging = false;
      const stickersLayer = document.getElementById('notebookStickersLayer');
      if (stickersLayer) stickersLayer.classList.remove('has-dragging-sticker');
      document.body.classList.remove('is-dragging-sticker');
      el.classList.remove('is-dragging');

      if (wasMenu) {
        // Menu was opened by long-press: keep menu open and do not deselect
        this._stickerTouchJustEndedAt = Date.now();
      } else if (wasDragging) {
        const list = this.getCurrentPageStickers();
        const found = list.find(s => s.id === stk.id);
        if (found) {
          found.x = stk.x;
          found.y = stk.y;
        }
        this.deselectStickers();
        this.saveStickers();
        triggerHaptic(15);
      } else {
        const popup = this.stickerContextPopup || document.getElementById('stickerContextPopup');
        if (!popup || popup.style.display === 'none') {
          this.deselectStickers();
        }
      }
    };

    const onPointerMove = (e) => handleMove(e.clientX, e.clientY, e, false);
    const onPointerEnd = (e) => handleEnd(e.clientX, e.clientY, e);

    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        if (isDragReady && e.cancelable) e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY, e, true);
      }
    };
    const onTouchEnd = (e) => {
      const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
      handleEnd(touch ? touch.clientX : startX, touch ? touch.clientY : startY, e);
    };

    // Touch events for mobile (Android WebView)
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startInteraction(e.touches[0].clientX, e.touches[0].clientY, true);
    }, { passive: true });

    // Pointer events for desktop / mouse
    const onPointerDown = (e) => {
      if (e.pointerType === 'touch') return;
      if (e.button !== undefined && e.button !== 0) return;
      startInteraction(e.clientX, e.clientY, false, e.pointerId);
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      startInteraction(e.clientX, e.clientY, false);
    });

    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerHaptic(20);
      this.selectSticker(stk.id);
      this.openStickerContextMenu(stk.id, el, e);
    });

    el._startInteraction = (clientX, clientY, isTouch, pointerId = null) => {
      startInteraction(clientX, clientY, isTouch, pointerId);
    };

    el._onPointerDownHandler = (e) => {
      if (e.touches && e.touches.length > 0) {
        startInteraction(e.touches[0].clientX, e.touches[0].clientY, true);
      } else {
        startInteraction(e.clientX, e.clientY, false, e.pointerId);
      }
    };
  }

  initStickersSystem() {
    // 1. FAB Open Stickers Drawer
    if (this.fabStickersBtn) {
      this.fabStickersBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(20);
        this.openStickersDrawer();
      });
    }

    // 2. Close Stickers Drawer
    if (this.stickersCloseBtn) {
      this.stickersCloseBtn.addEventListener('click', () => this.closeStickersDrawer());
    }

    if (this.stickersModalBackdrop) {
      let startedOnStkBackdrop = false;
      this.stickersModalBackdrop.addEventListener('pointerdown', (e) => {
        startedOnStkBackdrop = (e.target === this.stickersModalBackdrop);
      });
      this.stickersModalBackdrop.addEventListener('click', (e) => {
        if (Date.now() - (this._stickersModalOpenedAt || 0) < 400) return;
        if (startedOnStkBackdrop && e.target === this.stickersModalBackdrop) {
          this.closeStickersDrawer();
        }
        startedOnStkBackdrop = false;
      });
    }

    // 3. Category Buttons in Drawer (with smooth drag, wheel scroll & auto-center)
    if (this.stickersCategoriesBar) {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let hasDragged = false;

      // Mouse drag-to-scroll
      this.stickersCategoriesBar.addEventListener('mousedown', (e) => {
        isDown = true;
        hasDragged = false;
        startX = e.pageX - this.stickersCategoriesBar.offsetLeft;
        scrollLeft = this.stickersCategoriesBar.scrollLeft;
      });

      window.addEventListener('mouseup', () => {
        isDown = false;
      });

      this.stickersCategoriesBar.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - this.stickersCategoriesBar.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 4) {
          hasDragged = true;
        }
        this.stickersCategoriesBar.scrollLeft = scrollLeft - walk;
      });

      // Mouse Wheel -> Horizontal Scroll
      this.stickersCategoriesBar.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          this.stickersCategoriesBar.scrollLeft += e.deltaY;
        }
      }, { passive: false });

      // Click Category Button
      this.stickersCategoriesBar.addEventListener('click', (e) => {
        if (hasDragged) return; // Prevent click trigger after dragging
        const btn = e.target.closest('.sticker-cat-btn');
        if (btn && btn.dataset.category) {
          triggerHaptic(15);
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          this.renderStickersCatalog(btn.dataset.category);
        }
      });
    }

    // 4. Context Menu Actions
    if (this.btnStickerRotate) {
      this.btnStickerRotate.addEventListener('click', (e) => {
        e.stopPropagation();
        this.rotateSelectedSticker(15);
      });
    }

    if (this.btnStickerBigger) {
      this.btnStickerBigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.scaleSelectedSticker(0.15);
      });
    }

    if (this.btnStickerSmaller) {
      this.btnStickerSmaller.addEventListener('click', (e) => {
        e.stopPropagation();
        this.scaleSelectedSticker(-0.15);
      });
    }

    if (this.btnStickerDelete) {
      this.btnStickerDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteSelectedSticker();
      });
    }

    // 5. Context Backdrop Tap to close sticker popup
    const backdrop = document.getElementById('stickerContextBackdrop');
    if (backdrop) {
      const closeMenuOnBackdrop = (e) => {
        if (Date.now() - (this._stickerCtxOpenedAt || 0) < 400) return;
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.deselectStickers();
      };
      backdrop.addEventListener('click', closeMenuOnBackdrop);
      backdrop.addEventListener('touchend', closeMenuOnBackdrop);
    }

    // 6. Hit-test delegation for stickers anywhere on sheet
    const sheet = document.getElementById('notebookSheet');
    if (sheet && !sheet._hasStickerDelegator) {
      sheet._hasStickerDelegator = true;

      const handleSheetStickerTap = (clientX, clientY, isTouch, pointerId = null) => {
        const todayStr = this.getTodayDateString();
        const isPastDay = this.currentTab === 'todo' && this.selectedDate < todayStr;
        if (isPastDay) return;

        const directTarget = document.elementFromPoint(clientX, clientY);
        if (directTarget && directTarget.closest('.task-checkbox-container, .task-checkbox, .swipe-action-btn, .inline-task-input, .blank-task-input, .task-attached-photo-btn, .task-attached-link, button, a, input, textarea, .modal-backdrop, .sticker-context-popup')) {
          return;
        }

        const elements = document.elementsFromPoint(clientX, clientY);
        const hitSticker = elements.find(el => el.classList && el.classList.contains('placed-sticker'));
        if (hitSticker && typeof hitSticker._startInteraction === 'function') {
          hitSticker._startInteraction(clientX, clientY, isTouch, pointerId);
        }
      };

      sheet.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        handleSheetStickerTap(e.touches[0].clientX, e.touches[0].clientY, true);
      }, { passive: true });

      sheet.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') return;
        if (e.button !== undefined && e.button !== 0) return;
        handleSheetStickerTap(e.clientX, e.clientY, false, e.pointerId);
      });
    }
  }

  openStickersDrawer() {
    const todayStr = this.getTodayDateString();
    const isPastDay = this.currentTab === 'todo' && this.selectedDate < todayStr;
    if (isPastDay) {
      const isEn = this.settings.lang === 'en';
      const isUk = this.settings.lang === 'uk';
      const msg = isEn ? 'Stickers cannot be added to past archive days' : (isUk ? 'Не можна додавати стікери в минулі дні' : 'Нельзя добавлять стикеры в прошедшие дни (архив)');
      this.showToast(msg, '🔒');
      return;
    }
    this.dismissActiveKeyboard();
    this.closeStickerContextMenu();
    this.renderStickersCatalog(this.activeStickerCategory || 'animals');
    if (this.stickersModalBackdrop) {
      this._stickersModalOpenedAt = Date.now();
      this.stickersModalBackdrop.classList.add('open');
      this.stickersModalBackdrop.setAttribute('aria-hidden', 'false');
      triggerHaptic(20);
    }
  }

  closeStickersDrawer() {
    if (this.stickersModalBackdrop) {
      this.stickersModalBackdrop.classList.remove('open');
      this.stickersModalBackdrop.classList.remove('is-picking-sticker');
      this.stickersModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  renderStickersCatalog(category = 'fall') {
    this.activeStickerCategory = category;
    const catBar = this.stickersCategoriesBar || document.getElementById('stickersCategoriesBar');
    const container = this.stickersGridContainer || document.getElementById('stickersGridContainer');
    if (!container) return;

    if (catBar) {
      catBar.querySelectorAll('.sticker-cat-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
      });
    }

    const items = STICKERS_CATALOG[category] || [];

    container.innerHTML = items.map(stk => {
      const previewHtml = stk.img
        ? `<img src="${stk.img}" alt="" draggable="false" class="sticker-picker-img" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried='1';setTimeout(()=>{this.src='${stk.img}?v=0.0.90';},300);}" />`
        : stk.svg;
      return `
        <div class="sticker-picker-card" data-type="${stk.id}">
          <div class="sticker-picker-preview">${previewHtml}</div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.sticker-picker-card').forEach(card => {
      const typeId = card.dataset.type;
      this.attachStickerCardDrag(card, typeId);
    });
  }

  attachStickerCardDrag(card, typeId) {
    let ghost = null;
    let isDragging = false;
    let isHolding = false;
    let holdTimer = null;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    const createGhost = () => {
      if (ghost) return;
      const def = this.findStickerDef(typeId);
      ghost = document.createElement('div');
      ghost.className = 'sticker-drag-ghost';
      if (def) {
        if (def.img) {
          ghost.innerHTML = `<img src="${def.img}" draggable="false" class="sticker-drag-ghost-img" />`;
        } else if (def.svg) {
          ghost.innerHTML = def.svg;
        }
      }
      ghost.style.left = `${currentX}px`;
      ghost.style.top = `${currentY}px`;
      document.body.appendChild(ghost);
    };

    const startDragGesture = () => {
      isHolding = true;
      isDragging = true;
      triggerHaptic([30, 45]);
      if (this.stickersModalBackdrop) {
        this.stickersModalBackdrop.classList.add('is-picking-sticker');
      }
      createGhost();
    };

    const cleanupWindowListeners = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    const endDrag = (clientX, clientY) => {
      cleanupWindowListeners();
      clearTimeout(holdTimer);
      holdTimer = null;

      const wasDragging = isDragging;
      const dx = Math.abs(clientX - startX);
      const dy = Math.abs(clientY - startY);

      isHolding = false;
      isDragging = false;

      if (ghost) {
        ghost.remove();
        ghost = null;
      }

      if (this.stickersModalBackdrop) {
        this.stickersModalBackdrop.classList.remove('is-picking-sticker');
      }

      if (wasDragging) {
        this.closeStickersDrawer();

        const sheet = document.getElementById('notebookSheet');
        if (sheet) {
          const rect = sheet.getBoundingClientRect();
          const scrollY = sheet.scrollTop || 0;
          const xPercent = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
          const yPixels = Math.max(20, (clientY - rect.top) + scrollY);
          this.addStickerToCurrentPage(typeId, xPercent, yPixels);
        }
      } else if (dx < 12 && dy < 12) {
        // Real tap without dragging: place in center of visible notebook sheet
        const sheet = document.getElementById('notebookSheet');
        const scrollY = sheet ? sheet.scrollTop : 0;
        this.closeStickersDrawer();
        this.addStickerToCurrentPage(typeId, 50, 240 + scrollY);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        currentX = touch.clientX;
        currentY = touch.clientY;
        const dx = currentX - startX;
        const dy = currentY - startY;

        if (!isDragging) {
          if (!isHolding && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
            clearTimeout(holdTimer);
            holdTimer = null;
            return;
          }
        }

        if (isDragging && ghost) {
          if (e.cancelable) e.preventDefault();
          ghost.style.left = `${currentX}px`;
          ghost.style.top = `${currentY}px`;
        }
      }
    };

    const onTouchEnd = (e) => {
      const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
      const cx = touch ? touch.clientX : currentX;
      const cy = touch ? touch.clientY : currentY;
      endDrag(cx, cy);
    };

    const onMouseMove = (e) => {
      currentX = e.clientX;
      currentY = e.clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;

      if (!isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        startDragGesture();
      }

      if (isDragging && ghost) {
        if (e.cancelable) e.preventDefault();
        ghost.style.left = `${currentX}px`;
        ghost.style.top = `${currentY}px`;
      }
    };

    const onMouseUp = (e) => {
      endDrag(e.clientX, e.clientY);
    };

    // 1. Touch Start (Mobile)
    card.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = touch.clientX;
      currentY = touch.clientY;
      isDragging = false;
      isHolding = false;

      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('touchcancel', onTouchEnd, { passive: true });

      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        startDragGesture();
      }, 140);
    }, { passive: true });

    // 2. Mouse Down (Desktop)
    card.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      currentX = e.clientX;
      currentY = e.clientY;
      isDragging = false;
      isHolding = false;

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  addStickerToCurrentPage(typeId, xPercent = 50, yPos = 240, scale = 1.0, rotate = 0) {
    const todayStr = this.getTodayDateString();
    const isPastDay = this.currentTab === 'todo' && this.selectedDate < todayStr;
    if (isPastDay) return;

    const list = this.getCurrentPageStickers();
    const newStk = {
      id: 'stk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      type: typeId,
      x: parseFloat(Math.max(5, Math.min(95, xPercent)).toFixed(2)),
      y: Math.max(10, Math.round(yPos)),
      scale: typeof scale === 'number' ? parseFloat(scale.toFixed(2)) : 1.0,
      rotate: typeof rotate === 'number' ? Math.round(rotate) : 0,
      zIndex: list.length + 12
    };

    list.push(newStk);
    this.saveStickers();
    this.renderStickers();
    this.deselectStickers();

    const layer = this.notebookStickersLayer || document.getElementById('notebookStickersLayer');
    const newEl = layer?.querySelector(`[data-sticker-id="${newStk.id}"]`);
    if (newEl) {
      newEl.classList.add('just-added');
      setTimeout(() => newEl.classList.remove('just-added'), 400);
    }

    triggerHaptic([30, 45]);
  }

  selectSticker(stickerId) {
    const todayStr = this.getTodayDateString();
    const isPastDay = this.currentTab === 'todo' && this.selectedDate < todayStr;
    if (isPastDay) return;

    this.selectedStickerId = stickerId;
    const layer = this.notebookStickersLayer || document.getElementById('notebookStickersLayer');
    if (!layer) return;
    layer.querySelectorAll('.placed-sticker').forEach(el => {
      el.classList.toggle('is-selected', el.dataset.stickerId === stickerId);
    });
  }

  deselectStickers() {
    this.selectedStickerId = null;
    const layer = this.notebookStickersLayer || document.getElementById('notebookStickersLayer');
    if (!layer) return;
    layer.querySelectorAll('.placed-sticker').forEach(el => {
      el.classList.remove('is-selected');
    });
    this.closeStickerContextMenu();
  }

  openStickerContextMenu(stickerId, stickerEl, e) {
    const todayStr = this.getTodayDateString();
    const isPastDay = this.currentTab === 'todo' && this.selectedDate < todayStr;
    if (isPastDay) return;

    this.selectedStickerId = stickerId;
    const popup = this.stickerContextPopup || document.getElementById('stickerContextPopup');
    const backdrop = document.getElementById('stickerContextBackdrop');
    const frame = document.getElementById('appFrame') || document.body;
    if (!popup || !stickerEl || !frame) return;

    this._stickerCtxOpenedAt = Date.now();
    if (backdrop) backdrop.style.display = 'block';
    popup.style.display = 'block';

    const frameRect = frame.getBoundingClientRect();
    const stkRect = stickerEl.getBoundingClientRect();
    const popupWidth = popup.offsetWidth || 230;

    const centerX = (stkRect.left + stkRect.width / 2) - frameRect.left;
    let topY = stkRect.top - frameRect.top;

    // Strict boundary clamping: popup will NEVER overflow left or right screen border
    const minX = (popupWidth / 2) + 12;
    const maxX = frameRect.width - (popupWidth / 2) - 12;
    const clampedX = Math.max(minX, Math.min(maxX, centerX));

    if (topY < 80) {
      topY = (stkRect.bottom - frameRect.top) + 16;
      popup.classList.add('popup-below');
    } else {
      topY = topY - 10;
      popup.classList.remove('popup-below');
    }

    popup.style.left = `${clampedX}px`;
    popup.style.top = `${topY}px`;
  }

  closeStickerContextMenu() {
    const popup = this.stickerContextPopup || document.getElementById('stickerContextPopup');
    const backdrop = document.getElementById('stickerContextBackdrop');
    if (popup) popup.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
  }

  rotateSelectedSticker(degChange = 15) {
    if (!this.selectedStickerId) return;
    const list = this.getCurrentPageStickers();
    const stk = list.find(s => s.id === this.selectedStickerId);
    if (!stk) return;

    stk.rotate = ((stk.rotate || 0) + degChange) % 360;
    this.saveStickers();

    const layer = this.notebookStickersLayer || document.getElementById('notebookStickersLayer');
    const el = layer?.querySelector(`[data-sticker-id="${stk.id}"]`);
    if (el) {
      el.style.setProperty('--rot', `${stk.rotate}deg`);
      el.style.transform = `translate(-50%, -50%) rotate(${stk.rotate}deg) scale(${stk.scale || 1})`;
    } else {
      this.renderStickers();
    }
    triggerHaptic(15);
  }

  scaleSelectedSticker(delta = 0.15) {
    if (!this.selectedStickerId) return;
    const list = this.getCurrentPageStickers();
    const stk = list.find(s => s.id === this.selectedStickerId);
    if (!stk) return;

    const cur = stk.scale || 1.0;
    const next = Math.max(0.45, Math.min(2.4, cur + delta));
    stk.scale = parseFloat(next.toFixed(2));
    this.saveStickers();

    const layer = this.notebookStickersLayer || document.getElementById('notebookStickersLayer');
    const el = layer?.querySelector(`[data-sticker-id="${stk.id}"]`);
    if (el) {
      el.style.setProperty('--sc', `${stk.scale}`);
      el.style.transform = `translate(-50%, -50%) rotate(${stk.rotate || 0}deg) scale(${stk.scale})`;
    } else {
      this.renderStickers();
    }
    triggerHaptic(15);
  }

  deleteSelectedSticker() {
    if (!this.selectedStickerId) return;
    const list = this.getCurrentPageStickers();
    const idx = list.findIndex(s => s.id === this.selectedStickerId);
    if (idx !== -1) {
      list.splice(idx, 1);
      this.saveStickers();
      this.closeStickerContextMenu();
      this.renderStickers();
      triggerHaptic([20, 35]);
      this.showToast(this.t('toast_sticker_deleted') || 'Стикер удален', '🗑️');
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

/**
 * ============================================================================
 * MAINE COON COZY COMPANION (TAMAGOTCHI) SYSTEM
 * ============================================================================
 */
class MaineCoonPetSystem {
  constructor(app) {
    this.app = app;
    this.audioCtx = null;
    this.quotesIndex = 0;
    this.isPurring = false;
    this.isEating = false;

    this.defaultData = {
      name: 'Мейни',
      color: 'ginger', // 'ginger' | 'silver' | 'mocha' | 'midnight'
      level: 1,
      xp: 20,
      xpToNext: 100,
      hunger: 80, // 0..100
      happiness: 85, // 0..100
      treats: 3, // Starter fish treats
      goldenTreats: 1, // Starter golden treat
      equippedAccessory: 'none', // 'none' | 'glasses' | 'scarf' | 'bowtie' | 'crown' | 'flower'
      unlockedAccessories: ['none', 'glasses', 'scarf', 'bowtie', 'crown', 'flower'],
      lastSaved: Date.now()
    };

    this.data = { ...this.defaultData };
  }

  async init() {
    await this.loadData();
    this.applyTimeDecay();
    this.initElements();
    this.initEventListeners();
    this.preloadAudio();
    this.renderMiniCompanion();
    this.renderFullModal();
    this.startIdleQuotesCycle();
    this.startDecayInterval();
  }

  // Preload purr audio in memory to eliminate play latency/stutter
  preloadAudio() {
    try {
      if (!this.purrAudioElement) {
        this.purrAudioElement = new Audio('assets/purr.wav');
        this.purrAudioElement.preload = 'auto';
        this.purrAudioElement.volume = 0.5;
      }
    } catch (e) { }
  }

  // Periodic natural decay (every 60s)
  startDecayInterval() {
    setInterval(() => {
      this.applyTimeDecay();
      this.updateGaugeUI();
      this.renderMiniCompanion();
    }, 60000);
  }

  // Natural needs decay across real-world time (exactly drops from 100% to 10% in 12 hours: 7.5%/hour)
  applyTimeDecay() {
    const now = Date.now();
    const last = this.data.lastSaved || now;
    const elapsedHours = (now - last) / (1000 * 60 * 60);

    if (elapsedHours > 0.016) { // ~1 min elapsed
      const hungerLoss = elapsedHours * 7.5; // 90% in 12 hours (100% -> 10%)
      const happyLoss = elapsedHours * 7.5; // 90% in 12 hours (100% -> 10%)

      this.data.hunger = Math.max(10, Math.min(100, Math.round((this.data.hunger - hungerLoss) * 10) / 10));
      this.data.happiness = Math.max(10, Math.min(100, Math.round((this.data.happiness - happyLoss) * 10) / 10));
      this.data.lastSaved = now;
      this.saveData(true);
    }
  }

  // Audio Player for natural cozy purr (plays pristine assets/purr.wav) and long rhythmic vibration in rhythm
  playPurr() {
    // 1. Long rhythmic vibration in sync with cat's purr beat (total ~2.8s)
    this.triggerPurrVibration();

    if (this.app?.settings?.soundEnabled === false) return;
    try {
      if (!this.purrAudioElement) {
        this.preloadAudio();
      }
      if (this.purrAudioElement) {
        this.purrAudioElement.currentTime = 0;
        const playPromise = this.purrAudioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => { });
        }
      }
    } catch (e) { }
  }

  // Feline purring vibration rhythm (long wave with rhythmic vibration pulses in sync with purr cycles)
  triggerPurrVibration() {
    try {
      const purrVibePattern = [
        180, 50, 200, 60, 220, 60, 200, 50, 180, 70,
        190, 50, 210, 60, 240, 60, 210, 50, 190, 70,
        180, 50, 200, 60, 220, 60, 180
      ];
      triggerHaptic(purrVibePattern);
    } catch (e) { }
  }

  // Load and save state with debounced asynchronous I/O
  async loadData() {
    try {
      const saved = localStorage.getItem('plan4u_pet_data') || localStorage.getItem('todo_notebook_pet_companion');
      if (saved) {
        this.data = { ...this.defaultData, ...JSON.parse(saved) };
      } else if (window.Plan4UStorage) {
        const fileData = await Plan4UStorage.loadFile('pet.json', null);
        if (fileData) {
          this.data = { ...this.defaultData, ...fileData };
        }
      }
    } catch (e) {
      console.warn('Error loading pet data:', e);
    }
  }

  saveData(debounced = false) {
    if (debounced) {
      clearTimeout(this._savePetDebounceTimer);
      this._savePetDebounceTimer = setTimeout(() => {
        this.flushSaveData();
      }, 500);
      return;
    }
    this.flushSaveData();
  }

  flushSaveData() {
    clearTimeout(this._savePetDebounceTimer);
    try {
      this.data.lastSaved = Date.now();
      const jsonStr = JSON.stringify(this.data);
      localStorage.setItem('plan4u_pet_data', jsonStr);
      localStorage.setItem('todo_notebook_pet_companion', jsonStr);
      if (window.Plan4UStorage) {
        Plan4UStorage.saveFile('pet.json', this.data);
      }
    } catch (e) {
      console.warn('Error saving pet data:', e);
    }
  }

  // Pet state export snapshot
  getPetSnapshot() {
    return JSON.parse(JSON.stringify(this.data || this.defaultData));
  }

  // Restore pet state from snapshot
  restorePetData(petData) {
    if (!petData || typeof petData !== 'object') return;
    this.data = { ...this.defaultData, ...petData };
    this.flushSaveData();
    this._renderedStageKey = null;
    this._renderedMiniColor = null;
    this.renderMiniCompanion();
    this.updateGaugeUI();
  }

  initElements() {
    this.petAnchor = document.getElementById('notebookPetAnchor');
    this.petMiniAvatar = document.getElementById('petMiniAvatar');
    this.petMiniTreatsCount = document.getElementById('petMiniTreatsCount');
    this.petMiniSpeech = document.getElementById('petMiniSpeech');
    this.petMiniSpeechText = document.getElementById('petMiniSpeechText');

    this.petModalBackdrop = document.getElementById('petModalBackdrop');
    this.petModalCloseBtn = document.getElementById('petModalCloseBtn');
    this.petModalDoneBtn = document.getElementById('petModalDoneBtn');

    this.petModalNameTitle = document.getElementById('petModalNameTitle');
    this.btnPetRename = document.getElementById('btnPetRename');
    this.petLevelBadge = document.getElementById('petLevelBadge');
    this.petXpBarFill = document.getElementById('petXpBarFill');
    this.petXpText = document.getElementById('petXpText');

    this.petInteractiveStage = document.getElementById('petInteractiveStage');
    this.petSettingsGearBtn = document.getElementById('petSettingsGearBtn');
    this.petSettingsPopup = document.getElementById('petSettingsPopup');
    this.petPopupCloseBtn = document.getElementById('petPopupCloseBtn');

    this.petThoughtBubble = document.getElementById('petThoughtBubble');
    this.petThoughtText = document.getElementById('petThoughtText');
    this.petCharacterStage = document.getElementById('petCharacterStage');
    this.petParticlesLayer = document.getElementById('petParticlesLayer');

    this.petHungerStatus = document.getElementById('petHungerStatus');
    this.petHungerBarFill = document.getElementById('petHungerBarFill');
    this.petHungerVal = document.getElementById('petHungerVal');

    this.petHappinessStatus = document.getElementById('petHappinessStatus');
    this.petHappinessBarFill = document.getElementById('petHappinessBarFill');
    this.petHappinessVal = document.getElementById('petHappinessVal');

    this.btnPetFeed = document.getElementById('btnPetFeed');
    this.btnPetGoldenFeed = document.getElementById('btnPetGoldenFeed');
    this.petFishCountLabel = document.getElementById('petFishCountLabel');
    this.petGoldenCountLabel = document.getElementById('petGoldenCountLabel');
  }

  initEventListeners() {
    // 1. Mini companion click on notebook sheet -> Open Modal
    if (this.petAnchor) {
      this.petAnchor.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(20);
        this.playPurr();
        this.openPetModal();
      });
    }

    // 2. Modal Close
    if (this.petModalCloseBtn) {
      this.petModalCloseBtn.addEventListener('click', () => this.closePetModal());
    }
    if (this.petModalDoneBtn) {
      this.petModalDoneBtn.addEventListener('click', () => this.closePetModal());
    }
    if (this.petModalBackdrop) {
      let startedOnPetBackdrop = false;
      this.petModalBackdrop.addEventListener('pointerdown', (e) => {
        startedOnPetBackdrop = (e.target === this.petModalBackdrop);
      });
      this.petModalBackdrop.addEventListener('click', (e) => {
        if (Date.now() - (this._petModalOpenedAt || 0) < 400) return;
        if (startedOnPetBackdrop && e.target === this.petModalBackdrop) {
          this.closePetModal();
        }
        startedOnPetBackdrop = false;
      });
    }

    // 3. Rename
    if (this.btnPetRename) {
      this.btnPetRename.addEventListener('click', () => this.renamePet());
    }

    // 4. Feed buttons
    if (this.btnPetFeed) {
      this.btnPetFeed.addEventListener('click', () => this.feedFish());
    }
    if (this.btnPetGoldenFeed) {
      this.btnPetGoldenFeed.addEventListener('click', () => this.feedGolden());
    }

    // 5. Gear button for coat color sub-menu / popup
    if (this.petSettingsGearBtn && this.petSettingsPopup) {
      this.petSettingsGearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(15);
        this.petSettingsPopup.classList.toggle('show');
      });
    }

    if (this.petPopupCloseBtn && this.petSettingsPopup) {
      this.petPopupCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(10);
        this.petSettingsPopup.classList.remove('show');
      });
    }

    // Close popup on outside click
    document.addEventListener('pointerdown', (e) => {
      if (this.petSettingsPopup && this.petSettingsPopup.classList.contains('show')) {
        if (!this.petSettingsPopup.contains(e.target) && e.target !== this.petSettingsGearBtn && !this.petSettingsGearBtn?.contains(e.target)) {
          this.petSettingsPopup.classList.remove('show');
        }
      }
    });

    // Gauge click tester (toggles between 10% [sleeping/danger], 45% [warning], 100% [full])
    if (this.petHungerVal) {
      this.petHungerVal.style.cursor = 'pointer';
      this.petHungerVal.addEventListener('click', (e) => {
        e.stopPropagation();
        this.data.hunger = this.data.hunger <= 10 ? 45 : (this.data.hunger <= 45 ? 100 : 10);
        this.saveData();
        this.updateGaugeUI();
      });
    }
    if (this.petHappinessVal) {
      this.petHappinessVal.style.cursor = 'pointer';
      this.petHappinessVal.addEventListener('click', (e) => {
        e.stopPropagation();
        this.data.happiness = this.data.happiness <= 10 ? 45 : (this.data.happiness <= 45 ? 100 : 10);
        this.saveData();
        this.updateGaugeUI();
      });
    }

    // 6. Interactive Petting: ONLY when clicking/swiping directly on the cat (#petCharacterStage)
    if (this.petCharacterStage) {
      let isPetting = false;
      let lastPetTime = 0;

      const triggerPetAction = (clientX, clientY) => {
        const now = Date.now();
        if (now - lastPetTime < 220) return;
        lastPetTime = now;
        this.petCat(clientX, clientY);
      };

      this.petCharacterStage.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        isPetting = true;
        triggerPetAction(e.clientX, e.clientY);
      });

      this.petCharacterStage.addEventListener('pointermove', (e) => {
        if (isPetting) {
          triggerPetAction(e.clientX, e.clientY);
        }
      });

      window.addEventListener('pointerup', () => { isPetting = false; });
      window.addEventListener('pointercancel', () => { isPetting = false; });
    }

    // 7. Color Chips
    const colorChips = document.querySelectorAll('.pet-color-chip');
    colorChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const color = chip.dataset.color;
        if (!color) return;
        triggerHaptic(15);
        colorChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        this.data.color = color;
        this.saveData();
        this.renderMiniCompanion();
        this.renderFullModal();
        this.playPurr();
        this.setThought(this.getLocalizedText('color_changed') || 'Мурр! 🐾✨');

        if (this.petSettingsPopup) {
          setTimeout(() => {
            this.petSettingsPopup.classList.remove('show');
          }, 350);
        }
      });
    });
  }

  openPetModal() {
    if (this.app) this.app.dismissActiveKeyboard();
    else if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
    if (!this.petModalBackdrop) return;
    this.renderFullModal();
    if (this.petSettingsPopup) {
      this.petSettingsPopup.classList.remove('show');
    }
    this._petModalOpenedAt = Date.now();
    this.petModalBackdrop.classList.add('open');
    this.petModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closePetModal() {
    this.flushSaveData();
    if (this.petModalBackdrop) {
      this.petModalBackdrop.classList.remove('open');
      this.petModalBackdrop.setAttribute('aria-hidden', 'true');
    }
    if (this.petSettingsPopup) {
      this.petSettingsPopup.classList.remove('show');
    }
  }

  // Hook triggered when any task is completed in the notebook
  onTaskCompleted(task) {
    const isPriority = task && (task.priority === 'важный' || task.priority === 'очень важно');
    const xpGain = isPriority ? 30 : 10;
    const fishGain = isPriority ? 0 : 1;
    const goldenGain = isPriority ? 1 : 0;

    this.data.xp += xpGain;
    this.data.treats += fishGain;
    this.data.goldenTreats += goldenGain;
    this.data.hunger = Math.min(100, this.data.hunger + 4);
    this.data.happiness = Math.min(100, this.data.happiness + 5);

    // Spawn Flying Treat Animation
    this.spawnFlyingTreat(isPriority ? '🥫' : '🟤');

    // Show Speech Bubble on Mini Companion (100% feline)
    const quotes = isPriority
      ? ['МУРРР! 🥫✨', 'Мяу-мяу! ⭐', 'Муррр! 🐾']
      : ['Мяу! 🟤', 'Мурр! 🐾', 'Мяу-мяу! ✨'];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    this.showMiniSpeech(quote);

    this.checkLevelUp();
    this.saveData(true);
    this.renderMiniCompanion();
    this.renderFullModal();
  }

  // Flying Treat Visual Effect from screen to bottom anchor
  spawnFlyingTreat(icon = '🟤') {
    try {
      const anchorRect = this.petAnchor ? this.petAnchor.getBoundingClientRect() : null;
      const targetX = anchorRect ? anchorRect.left + 20 : window.innerWidth - 80;
      const targetY = anchorRect ? anchorRect.top + 20 : window.innerHeight - 80;

      const particle = document.createElement('div');
      particle.className = 'flying-treat-particle';
      particle.textContent = icon;
      particle.style.left = `${window.innerWidth / 2 - 15}px`;
      particle.style.top = `${window.innerHeight / 2 - 40}px`;
      particle.style.transform = 'scale(1.4)';
      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${targetX - (window.innerWidth / 2 - 15)}px, ${targetY - (window.innerHeight / 2 - 40)}px) scale(0.6)`;
        particle.style.opacity = '0.9';
      });

      setTimeout(() => {
        particle.remove();
        if (this.petAnchor) {
          this.petAnchor.style.transform = 'scale(1.22)';
          setTimeout(() => { this.petAnchor.style.transform = ''; }, 200);
        }
      }, 750);
    } catch (e) { }
  }

  showMiniSpeech(text) {
    if (!this.petMiniSpeech || !this.petMiniSpeechText) return;
    this.petMiniSpeechText.textContent = text;
    this.petMiniSpeech.classList.add('visible');
    clearTimeout(this._miniSpeechTimer);
    this._miniSpeechTimer = setTimeout(() => {
      this.petMiniSpeech.classList.remove('visible');
    }, 3200);
  }

  setThought(text) {
    if (this.petThoughtText) {
      this.petThoughtText.textContent = text;
    }
  }

  // Petting interaction
  petCat(clientX = null, clientY = null) {
    this.data.happiness = Math.min(100, this.data.happiness + 3);
    this.data.xp += 2;
    this.checkLevelUp();
    this.saveData(true);

    this.playPurr();
    triggerHaptic(20);

    // Visual Purr state on character
    if (this.petCharacterStage) {
      this.petCharacterStage.classList.add('purring');
      clearTimeout(this._purrTimer);
      this._purrTimer = setTimeout(() => {
        this.petCharacterStage.classList.remove('purring');
      }, 1200);
    }

    // Heart particles
    this.spawnHeartParticle(clientX, clientY);

    // 100% feline purr thoughts
    const purrThoughts = [
      'Муррррр... Мяу! 💖',
      'Мур-мур-мур... 🐾',
      'Мрррр... ✨',
      'Мяууу... Мурр! 💕',
      'Муррр-мяу! 🌸'
    ];
    this.setThought(purrThoughts[Math.floor(Math.random() * purrThoughts.length)]);
    this.updateGaugeUI();
  }

  spawnHeartParticle(clientX = null, clientY = null) {
    if (!this.petParticlesLayer) return;
    // Cap maximum active particles on stage to prevent DOM pileup
    if (this.petParticlesLayer.childElementCount > 6) {
      this.petParticlesLayer.firstElementChild?.remove();
    }

    const stageRect = this.petInteractiveStage.getBoundingClientRect();
    const x = clientX ? (clientX - stageRect.left) : (stageRect.width / 2);
    const y = clientY ? (clientY - stageRect.top) : (stageRect.height / 2);

    const heart = document.createElement('div');
    heart.className = 'pet-heart-particle';
    const emojis = ['💖', '✨', '🐾', '💕', '⭐'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${Math.max(10, Math.min(stageRect.width - 30, x - 10))}px`;
    heart.style.top = `${Math.max(10, Math.min(stageRect.height - 30, y - 10))}px`;
    heart.style.setProperty('--rand-x', (Math.random() * 2 - 1).toFixed(2));

    this.petParticlesLayer.appendChild(heart);
    setTimeout(() => { heart.remove(); }, 1100);
  }

  // Animation: Flying treat from clicked button directly into cat's mouth
  animateFeedToMouth(sourceBtn, icon = '🟤') {
    try {
      if (!this.petCharacterStage) return;
      const btn = sourceBtn || this.btnPetFeed;
      const btnRect = btn ? btn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 100, width: 40, height: 40 };
      const catRect = this.petCharacterStage.getBoundingClientRect();

      const startX = btnRect.left + btnRect.width / 2 - 15;
      const startY = btnRect.top + btnRect.height / 2 - 15;
      // Cat muzzle position in SVG center
      const targetX = catRect.left + catRect.width / 2 - 15;
      const targetY = catRect.top + catRect.height * 0.54 - 15;

      const item = document.createElement('div');
      item.className = 'flying-feed-item';
      item.textContent = icon;
      item.style.left = `${startX}px`;
      item.style.top = `${startY}px`;
      item.style.transform = 'scale(1.35) rotate(0deg)';
      document.body.appendChild(item);

      requestAnimationFrame(() => {
        item.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.68) rotate(25deg)`;
      });

      setTimeout(() => {
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 120);

        // Cat starts eating when the food reaches the mouth
        if (this.petCharacterStage) {
          this.petCharacterStage.classList.add('eating');
          this.playEatingSound();
          setTimeout(() => { this.petCharacterStage.classList.remove('eating'); }, 950);
        }

        // Crumb / sparkle effect around muzzle
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.spawnHeartParticle(targetX + 15, targetY + 15);
          }, i * 90);
        }
      }, 460);
    } catch (e) { }
  }

  // Play cute munching / "Ням-ням" sound with Web Audio API synthesis
  playEatingSound() {
    if (this.app?.settings?.soundEnabled === false) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = this.audioCtx || new AudioCtx();
      this.audioCtx = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Rhythmic sequence of cute "Nom-Nom-Nom" / "Ням-Ням" bites with crunch clicks
      const bites = [
        { time: 0.00, freqStart: 380, freqEnd: 240, dur: 0.12, crunchFreq: 950 },
        { time: 0.17, freqStart: 420, freqEnd: 260, dur: 0.13, crunchFreq: 1100 },
        { time: 0.35, freqStart: 460, freqEnd: 290, dur: 0.15, crunchFreq: 1250 }
      ];

      bites.forEach(bite => {
        const startTime = ctx.currentTime + bite.time;

        // 1. Tonal "Nom/Ням" mouth formant resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bite.freqStart, startTime);
        osc.frequency.exponentialRampToValueAtTime(bite.freqEnd, startTime + bite.dur);

        gain.gain.setValueAtTime(0.24, startTime);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + bite.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + bite.dur);

        // 2. Crisp food crunch/smack click
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(bite.crunchFreq, startTime);
        clickOsc.frequency.exponentialRampToValueAtTime(140, startTime + 0.045);

        clickGain.gain.setValueAtTime(0.18, startTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.045);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(startTime);
        clickOsc.stop(startTime + 0.045);
      });

      // Synchronized munching vibration pulses
      triggerHaptic([25, 45, 25, 45, 30]);
    } catch (e) {
      console.warn('Eating audio error:', e);
    }
  }

  // Feeding action: Normal treat (Маленький коричневый камушек / сухой корм 🟤)
  // Feeding action: Normal treat (Маленький коричневый камушек / сухой корм 🟤)
  feedFish() {
    if (this.data.treats <= 0) {
      triggerHaptic([10, 40]);
      const msg = this.getLocalizedText('no_fish') || 'Нет камушков! Выполняйте дела в блокноте, чтобы заработать угощение 🟤';
      this.app.showToast(msg, '🟤');
      this.setThought('Мяу? 🥺🐾');
      return;
    }

    this.data.treats--;
    // Balanced for 5 pebbles a day (+15% each = +75% total)
    this.data.hunger = Math.min(100, Math.max(10, this.data.hunger + 15));
    this.data.happiness = Math.min(100, Math.max(10, this.data.happiness + 5));
    this.data.xp += 15;

    triggerHaptic([20, 30]);

    // Animate pebble flying from feed button to mouth
    this.animateFeedToMouth(this.btnPetFeed, '🟤');

    this.setThought('Хрум-хрум-хрум! Муррр! 🟤✨');
    this.checkLevelUp();
    this.saveData(true);
    this.renderMiniCompanion();
    this.renderFullModal();
  }

  // Feeding action: Golden gourmet canned treat 🥫 (+25% hunger + 50% happiness)
  feedGolden() {
    if (this.data.goldenTreats <= 0) {
      triggerHaptic([10, 40]);
      const msg = this.getLocalizedText('no_golden') || 'Нет золотых консервов! Закрывайте важные дела дня, чтобы заработать 🥫';
      this.app.showToast(msg, '🥫');
      this.setThought('Мррр? 🥺🥫');
      return;
    }

    this.data.goldenTreats--;
    this.data.hunger = Math.min(100, Math.max(10, this.data.hunger + 25));
    this.data.happiness = Math.min(100, Math.max(10, this.data.happiness + 50));
    this.data.xp += 50;

    triggerHaptic([30, 60, 30]);

    // Animate canned treat flying from golden feed button to mouth
    this.animateFeedToMouth(this.btnPetGoldenFeed, '🥫');

    this.setThought('Чав-чав-хрум! МУРРРР! 🥫✨');
    this.checkLevelUp();
    this.saveData(true);
    this.renderMiniCompanion();
    this.renderFullModal();
  }

  checkLevelUp() {
    if (this.data.xp >= this.data.xpToNext) {
      this.data.xp = this.data.xp - this.data.xpToNext;
      this.data.level++;
      this.data.xpToNext = Math.round(this.data.xpToNext * 1.45);

      triggerHaptic([40, 80, 40]);
      this.app.showToast(`🎉 Уровень дружбы повышен: ${this.data.name} теперь ${this.data.level} уровня!`, '🏆');
      this.setThought(`МЯУ! Муррр-муррр! ⭐🐾`);
    }
  }

  renamePet() {
    const current = this.data.name || 'Мейни';
    const newName = prompt('Введите имя для вашего котёнка-мейнкуна:', current);
    if (newName && newName.trim()) {
      this.data.name = newName.trim().slice(0, 20);
      this.saveData();
      this.renderFullModal();
      this.setThought(`Мяу! 💖`);
      triggerHaptic(20);
    }
  }

  // Periodic motivational quotes (100% feline sounds)
  startIdleQuotesCycle() {
    setInterval(() => {
      if (!this.petThoughtText) return;
      const isSleeping = (this.data.hunger <= 10 || this.data.happiness <= 10);
      if (isSleeping) {
        this.setThought('Хррр-пссс... 💤 (спит)');
        return;
      }
      const pool = [
        'Мур-мур-мур... 🐾',
        'Мяу! ✨',
        'Мрррр... 💕',
        'Мяу-мяу! 🌸',
        'Муррр... 🐾',
        'Мяяяу... 🌟',
        'Фррр-мяу! 🐱'
      ];
      this.quotesIndex = (this.quotesIndex + 1) % pool.length;
      this.setThought(pool[this.quotesIndex]);
    }, 18000);
  }

  updateXpUI() {
    if (this.petLevelBadge) this.petLevelBadge.textContent = `Ур. ${this.data.level}`;
    const xpPercent = Math.min(100, Math.round((this.data.xp / this.data.xpToNext) * 100));
    if (this.petXpBarFill) this.petXpBarFill.style.width = `${xpPercent}%`;
    if (this.petXpText) this.petXpText.textContent = `${this.data.xp} / ${this.data.xpToNext} XP`;
  }

  updateGaugeUI() {
    this.updateXpUI();

    // Never fall below 10%
    this.data.hunger = Math.max(10, Math.min(100, this.data.hunger));
    this.data.happiness = Math.max(10, Math.min(100, this.data.happiness));

    // 1. Hunger Gauge: Blue by default, warning at <60%, red danger at <30%
    if (this.petHungerBarFill) {
      this.petHungerBarFill.style.width = `${this.data.hunger}%`;
      this.petHungerBarFill.classList.toggle('warning', this.data.hunger < 60 && this.data.hunger >= 30);
      this.petHungerBarFill.classList.toggle('danger', this.data.hunger < 30);
    }
    if (this.petHungerVal) this.petHungerVal.textContent = `${this.data.hunger}%`;

    // 2. Happiness Gauge: Green by default, warning at <60%, red danger at <30%
    if (this.petHappinessBarFill) {
      this.petHappinessBarFill.style.width = `${this.data.happiness}%`;
      this.petHappinessBarFill.classList.toggle('warning', this.data.happiness < 60 && this.data.happiness >= 30);
      this.petHappinessBarFill.classList.toggle('danger', this.data.happiness < 30);
    }
    if (this.petHappinessVal) this.petHappinessVal.textContent = `${this.data.happiness}%`;

    // 3. Sleeping state when hunger or happiness drops to minimum (<= 10%)
    const isSleeping = this.data.hunger <= 10 || this.data.happiness <= 10;

    if (this.petHungerStatus) {
      if (isSleeping) this.petHungerStatus.textContent = 'Спит клубочком... 💤';
      else if (this.data.hunger >= 75) this.petHungerStatus.textContent = 'Сытый и довольный 😋';
      else if (this.data.hunger >= 40) this.petHungerStatus.textContent = 'Не откажется от камушка 🟤';
      else this.petHungerStatus.textContent = 'Сильно проголодался! 🥺';
    }

    if (this.petHappinessStatus) {
      if (isSleeping) this.petHappinessStatus.textContent = 'Хррр-пссс... 💤';
      else if (this.data.happiness >= 75) this.petHappinessStatus.textContent = 'Мурчит от радости 💖';
      else if (this.data.happiness >= 40) this.petHappinessStatus.textContent = 'Спокойный и уютный 🐾';
      else this.petHappinessStatus.textContent = 'Хочет ласки и внимания 🥺';
    }

    // Toggle sleeping animation & SVG pose (with memoized rendering)
    const stageKey = `${this.data.color}_${isSleeping}`;
    if (this.petCharacterStage) {
      this.petCharacterStage.classList.toggle('is-sleeping', isSleeping);
      if (this._renderedStageKey !== stageKey) {
        this._renderedStageKey = stageKey;
        this.petCharacterStage.innerHTML = this.generateMaineCoonSVG(this.data.color, false, isSleeping);
      }
    }
  }

  renderMiniCompanion() {
    if (this.petMiniAvatar && this._renderedMiniColor !== this.data.color) {
      this._renderedMiniColor = this.data.color;
      this.petMiniAvatar.innerHTML = this.generateMaineCoonSVG(this.data.color, true);
    }
    const badge = document.getElementById('petMiniTreatsBadge');
    if (badge) {
      badge.style.display = (this.data.treats > 0) ? 'flex' : 'none';
    }
    if (this.petMiniTreatsCount) {
      this.petMiniTreatsCount.textContent = this.data.treats;
    }
  }

  renderFullModal() {
    if (this.petModalNameTitle) this.petModalNameTitle.textContent = this.data.name;
    if (this.petLevelBadge) this.petLevelBadge.textContent = `Ур. ${this.data.level}`;

    const xpPercent = Math.min(100, Math.round((this.data.xp / this.data.xpToNext) * 100));
    if (this.petXpBarFill) this.petXpBarFill.style.width = `${xpPercent}%`;
    if (this.petXpText) this.petXpText.textContent = `${this.data.xp} / ${this.data.xpToNext} XP`;

    const isSleeping = this.data.hunger <= 10 || this.data.happiness <= 10;
    const stageKey = `${this.data.color}_${isSleeping}`;
    if (this.petCharacterStage && this._renderedStageKey !== stageKey) {
      this._renderedStageKey = stageKey;
      this.petCharacterStage.innerHTML = this.generateMaineCoonSVG(this.data.color, false, isSleeping);
    }

    if (this.petFishCountLabel) {
      this.petFishCountLabel.textContent = `В запасе: ${this.data.treats} шт.`;
    }
    if (this.petGoldenCountLabel) {
      this.petGoldenCountLabel.textContent = `В запасе: ${this.data.goldenTreats} шт.`;
    }

    this.updateGaugeUI();

    // Sync active color chip
    const colorChips = document.querySelectorAll('.pet-color-chip');
    colorChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.color === this.data.color);
    });
  }

  getLocalizedText(key) {
    const lang = this.app?.settings?.lang || 'ru';
    const dict = {
      ru: {
        no_fish: 'Нет камушков! Выполняйте дела в блокноте, чтобы заработать угощение 🟤',
        no_golden: 'Нет золотых консервов! Закрывайте важные дела дня, чтобы заработать 🥫',
        color_changed: 'Мурр! 🐾✨'
      },
      uk: {
        no_fish: 'Немає камінчиків! Виконуйте справи у блокноті, щоб заробити ласощі 🟤',
        no_golden: 'Немає золотих консервів! Закривайте важливі справи дня, щоб заробити 🥫',
        color_changed: 'Мурр! 🐾✨'
      },
      en: {
        no_fish: 'No little brown pebbles left! Complete tasks in your notebook to earn dry food 🟤',
        no_golden: 'No golden treats! Complete priority tasks of the day to earn 🥫',
        color_changed: 'Purr! 🐾✨'
      }
    };
    return (dict[lang] && dict[lang][key]) || dict.ru[key] || '';
  }

  /**
   * MAINE COON VECTOR SVG RENDERER
   * Highly detailed, cute, stylized Maine Coon with lynx ear tufts, bushy plume tail,
   * fluffy bib/mane, forehead tabby "M", and expressive feline eyes.
   */
  generateMaineCoonSVG(colorScheme = 'ginger', isMini = false, isSleeping = false) {
    const palettes = {
      ginger: {
        furMain: '#f97316',
        furGrad: '#c2410c',
        furLight: '#fed7aa',
        furDark: '#9a3412',
        bib: '#fffbeb',
        earInner: '#fbcfe8',
        earTuft: '#7c2d12',
        eyes: '#10b981',
        eyeHighlight: '#ffffff',
        nose: '#fb7185',
        markings: '#9a3412'
      },
      white: {
        furMain: '#ffffff',
        furGrad: '#e2e8f0',
        furLight: '#ffffff',
        furDark: '#94a3b8',
        bib: '#f8fafc',
        earInner: '#fed7e2',
        earTuft: '#cbd5e1',
        eyes: '#0284c7',
        eyeHighlight: '#ffffff',
        nose: '#fb7185',
        markings: '#cbd5e1'
      },
      tiger: {
        furMain: '#b45309',
        furGrad: '#78350f',
        furLight: '#fef3c7',
        furDark: '#451a03',
        bib: '#fefce8',
        earInner: '#fed7aa',
        earTuft: '#291102',
        eyes: '#16a34a',
        eyeHighlight: '#ffffff',
        nose: '#e11d48',
        markings: '#291102'
      },
      silver: {
        furMain: '#94a3b8',
        furGrad: '#475569',
        furLight: '#e2e8f0',
        furDark: '#334155',
        bib: '#ffffff',
        earInner: '#fce7f3',
        earTuft: '#1e293b',
        eyes: '#0284c7',
        eyeHighlight: '#ffffff',
        nose: '#f43f5e',
        markings: '#334155'
      },
      midnight: {
        furMain: '#1e293b',
        furGrad: '#0f172a',
        furLight: '#475569',
        furDark: '#020617',
        bib: '#334155',
        earInner: '#64748b',
        earTuft: '#020617',
        eyes: '#eab308',
        eyeHighlight: '#ffffff',
        nose: '#475569',
        markings: '#020617'
      },
      cream: {
        furMain: '#fed7aa',
        furGrad: '#fb923c',
        furLight: '#fff7ed',
        furDark: '#ea580c',
        bib: '#ffffff',
        earInner: '#fed7e2',
        earTuft: '#c2410c',
        eyes: '#14b8a6',
        eyeHighlight: '#ffffff',
        nose: '#f43f5e',
        markings: '#ea580c'
      },
      mocha: {
        furMain: '#78350f',
        furGrad: '#451a03',
        furLight: '#fef3c7',
        furDark: '#291102',
        bib: '#fef9c3',
        earInner: '#fed7aa',
        earTuft: '#1c0a00',
        eyes: '#f59e0b',
        eyeHighlight: '#ffffff',
        nose: '#be123c',
        markings: '#291102'
      },
      siamese: {
        furMain: '#fef3c7',
        furGrad: '#d97706',
        furLight: '#ffffff',
        furDark: '#451a03',
        bib: '#ffffff',
        earInner: '#fed7aa',
        earTuft: '#291102',
        eyes: '#0284c7',
        eyeHighlight: '#ffffff',
        nose: '#881337',
        markings: '#451a03'
      },
      calico: {
        furMain: '#ea580c',
        furGrad: '#1e293b',
        furLight: '#ffffff',
        furDark: '#0f172a',
        bib: '#ffffff',
        earInner: '#fbcfe8',
        earTuft: '#0f172a',
        eyes: '#10b981',
        eyeHighlight: '#ffffff',
        nose: '#fb7185',
        markings: '#0f172a'
      }
    };

    const p = palettes[colorScheme] || palettes.ginger;
    const uid = Math.random().toString(36).slice(2, 7);

    return `
      <svg viewBox="0 0 200 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
        <defs>
          <linearGradient id="mcFurGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${p.furMain}"/>
            <stop offset="100%" stop-color="${p.furGrad}"/>
          </linearGradient>
          <linearGradient id="mcBibGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="${p.bib}"/>
          </linearGradient>
          <linearGradient id="mcEyeGrad_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${p.eyes}"/>
            <stop offset="100%" stop-color="#064e3b"/>
          </linearGradient>
          <filter id="mcShadow_${uid}" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.16"/>
          </filter>
        </defs>

        <!-- Shadow on Floor -->
        <ellipse cx="100" cy="184" rx="58" ry="10" fill="rgba(0,0,0,0.12)"/>

        <!-- 1. Fluffy Plume Maine Coon Tail (Normal upright position & sway in all states) -->
        <g class="mc-tail" style="filter: url(#mcShadow_${uid});">
          <path d="M56 160 C30 152, 6 128, 12 92 C16 68, 38 60, 48 76 C56 88, 44 116, 52 136 C56 146, 64 154, 70 162 Z" 
                fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8" stroke-linejoin="round"/>
          <!-- Fluffy Tail Tufts -->
          <path d="M12 92 C2 108, 10 134, 30 148" stroke="${p.markings}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.65"/>
          <path d="M22 80 C26 94, 28 116, 42 130" stroke="${p.markings}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.65"/>
          <path d="M48 76 C42 88, 36 104, 46 118" stroke="${p.furLight}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
        </g>

        <!-- 2. Body Group -->
        <g class="mc-body-group">
          <!-- Back Paws & Hips -->
          <ellipse cx="64" cy="164" rx="22" ry="14" fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.6"/>
          <ellipse cx="136" cy="164" rx="22" ry="14" fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.6"/>

          <!-- Main Torso -->
          <path d="M68 120 C64 145, 68 174, 100 176 C132 174, 136 145, 132 120 C128 105, 72 105, 68 120 Z" 
                fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8"/>

          <!-- Luxurious Fluffy Maine Coon Mane / Bib -->
          <path d="M72 114 C62 128, 66 146, 80 156 C88 162, 94 168, 100 172 C106 168, 112 162, 120 156 C134 146, 138 128, 128 114 C120 126, 108 132, 100 132 C92 132, 80 126, 72 114 Z" 
                fill="url(#mcBibGrad_${uid})" stroke="${p.furDark}" stroke-width="1.2"/>

          <!-- Fluffy fur layers on bib -->
          <path d="M84 126 C76 138, 86 148, 100 158 C114 148, 124 138, 116 126" stroke="${p.furLight}" stroke-width="1.8" fill="none" stroke-linecap="round"/>

          <!-- Front Paws -->
          <ellipse cx="86" cy="178" rx="10" ry="7" fill="${p.bib}" stroke="${p.furDark}" stroke-width="1.4"/>
          <ellipse cx="114" cy="178" rx="10" ry="7" fill="${p.bib}" stroke="${p.furDark}" stroke-width="1.4"/>
          <!-- Paw Claws/Toe Separators -->
          <path d="M83 176 L83 182 M89 176 L89 182" stroke="${p.furDark}" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M111 176 L111 182 M117 176 L117 182" stroke="${p.furDark}" stroke-width="1.2" stroke-linecap="round"/>
        </g>

        <!-- 3. Head & Ears Group -->
        <g class="mc-head-group">
          <!-- Left Lynx Ear with Tuft -->
          <g class="mc-ear-tuft-left">
            <polygon points="56,84 66,32 94,68" fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8"/>
            <polygon points="62,80 70,42 90,68" fill="${p.earInner}"/>
            <!-- Lynx Pointed Ear Tuft -->
            <path d="M66 32 C64 20, 60 14, 56 8 C62 16, 68 22, 69 34" fill="${p.earTuft}" stroke="${p.earTuft}" stroke-width="1.4" stroke-linecap="round"/>
          </g>

          <!-- Right Lynx Ear with Tuft -->
          <g class="mc-ear-tuft-right">
            <polygon points="144,84 134,32 106,68" fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8"/>
            <polygon points="138,80 130,42 110,68" fill="${p.earInner}"/>
            <!-- Lynx Pointed Ear Tuft -->
            <path d="M134 32 C136 20, 140 14, 144 8 C138 16, 132 22, 131 34" fill="${p.earTuft}" stroke="${p.earTuft}" stroke-width="1.4" stroke-linecap="round"/>
          </g>

          <!-- Head Silhouette with Fluffy Cheeks -->
          <path d="M64 78 C52 92, 50 114, 68 126 C82 134, 118 134, 132 126 C150 114, 148 92, 136 78 C126 66, 74 66, 64 78 Z" 
                fill="url(#mcFurGrad_${uid})" stroke="${p.furDark}" stroke-width="1.8"/>

          <!-- Fluffy Cheek Fur Wisps -->
          <path d="M50 106 L42 112 L52 116 L44 122 L58 124" stroke="${p.furDark}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
          <path d="M150 106 L158 112 L148 116 L156 122 L142 124" stroke="${p.furDark}" stroke-width="1.4" fill="none" stroke-linecap="round"/>

          <!-- Forehead Tabby "M" Marking (Maine Coon Signature) -->
          <g opacity="0.75">
            <path d="M88 68 L94 80 L100 72 L106 80 L112 68" stroke="${p.markings}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M92 62 L100 66 L108 62" stroke="${p.markings}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          </g>

          <!-- Expressive Eyes or Sleeping Closed Arcs -->
          ${isSleeping ? `
          <g class="mc-eye-sleeping">
            <path d="M72 100 Q82 110 92 100" stroke="${p.furDark}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
            <path d="M108 100 Q118 110 128 100" stroke="${p.furDark}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
            <path d="M76 96 Q82 103 88 96" stroke="${p.furLight}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>
            <path d="M112 96 Q118 103 124 96" stroke="${p.furLight}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.8"/>
          </g>
          <g class="sleep-zzz-svg-group" opacity="0.95">
            <text x="32" y="52" font-size="18" font-weight="900" fill="#6366f1" font-family="sans-serif">z</text>
            <text x="44" y="36" font-size="24" font-weight="900" fill="#818cf8" font-family="sans-serif">Z</text>
            <text x="60" y="18" font-size="30" font-weight="900" fill="#a5b4fc" font-family="sans-serif">Z</text>
          </g>
          ` : `
          <g class="mc-eye-lid">
            <!-- Left Eye -->
            <ellipse cx="82" cy="98" rx="10.5" ry="12.5" fill="url(#mcEyeGrad_${uid})" stroke="${p.furDark}" stroke-width="1.6"/>
            <!-- Left Pupil -->
            <ellipse cx="83" cy="98" rx="4.5" ry="8.5" fill="#0f172a"/>
            <!-- Highlights -->
            <circle cx="79" cy="93" r="3.2" fill="${p.eyeHighlight}"/>
            <circle cx="85" cy="103" r="1.5" fill="${p.eyeHighlight}"/>

            <!-- Right Eye -->
            <ellipse cx="118" cy="98" rx="10.5" ry="12.5" fill="url(#mcEyeGrad_${uid})" stroke="${p.furDark}" stroke-width="1.6"/>
            <!-- Right Pupil -->
            <ellipse cx="117" cy="98" rx="4.5" ry="8.5" fill="#0f172a"/>
            <!-- Highlights -->
            <circle cx="115" cy="93" r="3.2" fill="${p.eyeHighlight}"/>
            <circle cx="121" cy="103" r="1.5" fill="${p.eyeHighlight}"/>
          </g>`}

          <!-- Cute Muzzle (Cream base) -->
          <ellipse cx="100" cy="116" rx="16" ry="10" fill="${p.bib}" opacity="0.95"/>

          <!-- Pink Nose -->
          <polygon points="96,110 104,110 100,115" fill="${p.nose}" stroke="${p.furDark}" stroke-width="0.8"/>

          <!-- Sweet Mouth Line -->
          <path d="M94 118 Q100 122 100 115 Q100 122 106 118" stroke="${p.furDark}" stroke-width="1.5" fill="none" stroke-linecap="round"/>

          <!-- Long Realistic Whiskers -->
          <g stroke="#ffffff" stroke-width="1.4" opacity="0.85" stroke-linecap="round">
            <!-- Left Whiskers -->
            <line x1="92" y1="114" x2="48" y2="108"/>
            <line x1="91" y1="117" x2="44" y2="118"/>
            <line x1="92" y1="120" x2="52" y2="128"/>
            <!-- Right Whiskers -->
            <line x1="108" y1="114" x2="152" y2="108"/>
            <line x1="109" y1="117" x2="156" y2="118"/>
            <line x1="108" y1="120" x2="148" y2="128"/>
          </g>

          <!-- Eyebrow Whisker Tufts -->
          <path d="M78 86 Q72 80 68 76" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8"/>
          <path d="M122 86 Q128 80 132 76" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8"/>
        </g>
      </svg>
    `;
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NotebookApp();
});



