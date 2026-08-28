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
  } catch (e) {}

  const navLang = (typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || 'ru') : 'ru').toLowerCase();
  if (navLang.startsWith('uk')) return 'uk';
  if (navLang.startsWith('ru') || navLang.startsWith('be') || navLang.startsWith('kk')) return 'ru';
  if (navLang.startsWith('en')) return 'en';
  return 'ru';
}

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

    // Period section headers
    period_morning: 'УТРО',
    period_day: 'ДЕНЬ',
    period_evening: 'ВЕЧЕР',
    period_free: 'В СВОБОДНОЕ ВРЕМЯ',
    watch_movies: '🎬 ФИЛЬМЫ',
    watch_series: '📺 СЕРИАЛЫ',
    watch_archive: '🎬 Архив просмотренного ({count})',
    empty_list: 'СПИСОК ПУСТ',
    empty_list_hint: 'Нажмите «+» внизу, чтобы добавить запись',

    // Priorities
    priority_calm: 'Спокойно',
    priority_day: 'В течении дня',
    priority_important: 'Очень важно',
    priority_urgent: 'Жизнь и смерть',

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
    buy_place_label: 'Магазин / Место покупки',
    buy_place_placeholder: 'Например: Супермаркет, Аптека...',
    watch_name_label: 'Название фильма / сериала *',
    watch_name_placeholder: 'Например: Интерстеллар, Дюна...',
    watch_type_label: 'Тип',
    watch_movie: '🎬 Фильм',
    watch_series_btn: '📺 Сериал',
    period_label: 'Время суток',
    duration_label: 'Длительность',
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
    settings_font: 'Шрифт и размер задач',
    font_family_label: 'Шрифт блокнота',
    font_size_label: 'Размер текста задач',
    settings_notif: 'Оповещения и звуки',
    notif_browser_label: 'Уведомления браузера',
    notif_browser_desc: 'Напоминания о задачах дня',
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
    achievements_title: '🏆 Достижения',
    achievements_search_placeholder: 'Поиск среди 220+ достижений...',
    filter_all: 'Все',
    filter_streaks: '🔥 Серии',
    filter_tasks: '📝 Дела',
    filter_watch: '🎬 Кино',
    filter_buy: '🛒 Покупки',
    filter_special: '🌟 Особые',
    filter_unlocked: '✓ Открыто',
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
    toast_lang_changed: 'Язык изменен: Русский 🇷🇺'
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

    // Period section headers
    period_morning: 'РАНОК',
    period_day: 'ДЕНЬ',
    period_evening: 'ВЕЧІР',
    period_free: 'У ВІЛЬНИЙ ЧАС',
    watch_movies: '🎬 ФІЛЬМИ',
    watch_series: '📺 СЕРІАЛИ',
    watch_archive: '🎬 Архів переглянутого ({count})',
    empty_list: 'СПИСОК ПОРОЖНІЙ',
    empty_list_hint: 'Натисніть «+» унизу, щоб додати запис',

    // Priorities
    priority_calm: 'Спокійно',
    priority_day: 'Протягом дня',
    priority_important: 'Дуже важливо',
    priority_urgent: 'Життя і смерть',

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
    buy_place_label: 'Магазин / Місце покупки',
    buy_place_placeholder: 'Наприклад: Супермаркет, Аптека...',
    watch_name_label: 'Назва фільму / серіалу *',
    watch_name_placeholder: 'Наприклад: Інтерстеллар, Дюна...',
    watch_type_label: 'Тип',
    watch_movie: '🎬 Фільм',
    watch_series_btn: '📺 Серіал',
    period_label: 'Час доби',
    duration_label: 'Тривалість',
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
    settings_font: 'Шрифт і розмір завдань',
    font_family_label: 'Шрифт блокнота',
    font_size_label: 'Розмір тексту завдань',
    settings_notif: 'Сповіщення та звуки',
    notif_browser_label: 'Сповіщення браузера',
    notif_browser_desc: 'Нагадування про завдання дня',
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
    achievements_title: '🏆 Досягнення',
    achievements_search_placeholder: 'Пошук серед 220+ досягнень...',
    filter_all: 'Всі',
    filter_streaks: '🔥 Серії',
    filter_tasks: '📝 Справи',
    filter_watch: '🎬 Кіно',
    filter_buy: '🛒 Покупки',
    filter_special: '🌟 Особливі',
    filter_unlocked: '✓ Відкрито',
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
    toast_lang_changed: 'Мову змінено: Українська 🇺🇦'
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

    // Period section headers
    period_morning: 'MORNING',
    period_day: 'DAY',
    period_evening: 'EVENING',
    period_free: 'FREE TIME',
    watch_movies: '🎬 MOVIES',
    watch_series: '📺 TV SERIES',
    watch_archive: '🎬 Watched Archive ({count})',
    empty_list: 'LIST IS EMPTY',
    empty_list_hint: 'Press \'+\' below to add a new task',

    // Priorities
    priority_calm: 'Calm',
    priority_day: 'During the day',
    priority_important: 'Important',
    priority_urgent: 'Urgent',

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
    buy_place_label: 'Store / Place of purchase',
    buy_place_placeholder: 'e.g.: Supermarket, Pharmacy...',
    watch_name_label: 'Movie / Series title *',
    watch_name_placeholder: 'e.g.: Interstellar, Dune...',
    watch_type_label: 'Type',
    watch_movie: '🎬 Movie',
    watch_series_btn: '📺 Series',
    period_label: 'Time of day',
    duration_label: 'Duration',
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
    settings_font: 'Font & Task Size',
    font_family_label: 'Notebook font',
    font_size_label: 'Task text size',
    settings_notif: 'Notifications & Sounds',
    notif_browser_label: 'Browser Notifications',
    notif_browser_desc: 'Daily task reminders',
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
    achievements_title: '🏆 Achievements',
    achievements_search_placeholder: 'Search 220+ achievements...',
    filter_all: 'All',
    filter_streaks: '🔥 Streaks',
    filter_tasks: '📝 Tasks',
    filter_watch: '🎬 Watch',
    filter_buy: '🛒 Buy',
    filter_special: '🌟 Special',
    filter_unlocked: '✓ Unlocked',
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
    toast_lang_changed: 'Language changed: English 🇬🇧'
  }
};

// Initial Seed Tabs
const INITIAL_TABS = [
  { id: 'todo', title: 'Что\nсделать?', colorId: 'default' },
  { id: 'buy', title: 'Что\nкупить?', colorId: 'orange' },
  { id: 'watch', title: 'Что\nпосмотреть?', colorId: 'purple' }
];

// Initial Seed Tasks matching clean lined notebook
const INITIAL_TASKS = {
  todo: [
    { id: '1', period: 'УТРО', duration: '30 минут', text: 'Принять лекарства (вопрос жизни и смерти)', completed: false },
    { id: '2', period: 'УТРО', duration: '1 час', text: 'Завтрак и кофе', completed: false },
    { id: '3', period: 'ДЕНЬ', duration: '2 часа', text: 'Сдать отчет (очень важно)', completed: false },
    { id: '4', period: 'ДЕНЬ', duration: '1 час', text: 'Рабочий созвон', completed: false },
    { id: '5', period: 'ВЕЧЕР', duration: '1 час', text: 'Прогулка в парке', completed: false },
  ],
  buy: [
    { id: '6', place: 'Пекарня', text: 'Свежий хлеб и круассаны', completed: false },
    { id: '7', place: 'Супермаркет', text: 'Кофе в зернах', completed: false },
    { id: '8', place: 'Рынок', text: 'Фрукты и ягоды', completed: false },
  ],
  watch: [
    { id: '9', watchType: 'Фильм', text: 'Интерстеллар', completed: false },
    { id: '10', watchType: 'Сериал', text: 'Новая серия сериала', completed: false },
  ]
};

const PERIODS_TODO = ['УТРО', 'ДЕНЬ', 'ВЕЧЕР', 'В СВОБОДНОЕ ВРЕМЯ'];

const DURATION_OPTIONS = [
  '10 минут',
  '15 минут',
  '20 минут',
  '30 минут',
  '45 минут',
  '1 час',
  '1.5 часа',
  '2 часа',
  '2.5 часа',
  '3 часа',
  '4 часа',
  '5 часов',
  '6 часов',
  '8 часов',
  'целый день (16 ч)'
];

// Haptic vibration feedback helper
function triggerHaptic(pattern = 15) {
  try {
    const raw = localStorage.getItem('todo_notebook_app_settings');
    if (raw) {
      const s = JSON.parse(raw);
      if (s.hapticsEnabled === false) return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Ignore if not supported or disabled
  }
}

// Helper to convert duration string to minutes
function parseDurationToMinutes(duration) {
  if (!duration) return 30;
  const s = duration.toString().toLowerCase().trim();
  if (s.includes('целый день') || s.includes('весь день') || s.includes('16')) return 960;
  if (s.includes('не важно') || s.includes('не указано') || s === '0') return 0;
  
  let total = 0;
  const hoursMatch = s.match(/(\d+(?:[.,]\d+)?)\s*(?:час|ч|h)/);
  if (hoursMatch) {
    total += parseFloat(hoursMatch[1].replace(',', '.')) * 60;
  }
  const minMatch = s.match(/(\d+)\s*(?:минут|мин|м|m)/);
  if (minMatch && (!hoursMatch || s.includes('мин') || s.includes('минут'))) {
    total += parseInt(minMatch[1], 10);
  }
  
  if (total === 0 && /^\d+$/.test(s)) {
    total = parseInt(s, 10);
  }

  return total > 0 ? total : 30;
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
  { id: 'спокойно', label: 'Спокойно', class: 'p-calm', icon: '🌿' },
  { id: 'в течении дня', label: 'В течении дня', class: 'p-day', icon: '⏳' },
  { id: 'очень важно', label: 'Очень важно', class: 'p-important', icon: '⚡' },
  { id: 'вопрос жизни и смерти', label: 'Жизнь и смерть', class: 'p-urgent', icon: '🔥' }
];

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
  }
];

const DEFAULT_SETTINGS = {
  lang: detectSystemLanguage(), // 'ru' | 'uk' | 'en' (auto system detected)
  theme: 'light', // 'light' | 'dark' | 'auto'
  accentColorId: 'magenta',
  fontFamily: "'PT Serif', Georgia, serif",
  fontSize: 14,
  notificationsEnabled: false,
  hapticsEnabled: true,
  soundEnabled: true,
  lastSync: 'Локально'
};

function buildAchievementsCatalog() {
  const list = [];

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
        tierRank: t.rank || `Уровень ${levelNum}`,
        getProgress
      });
    });
  }

  // 1. 🔥 СЕРИИ ВХОДА И ДИСЦИПЛИНА (28 ступеней от 1 до 1095 дней)
  addTiered({
    prefix: 'streak',
    category: 'streaks',
    icon: '🔥',
    titleBase: 'Серия побед',
    unit: 'дн.',
    descTemplate: (v, r) => `Заходить в блокнот каждый день без перерывов: ${v} ${v === 1 ? 'день' : (v < 5 ? 'дня' : 'дней')}${r ? ` (${r})` : ''}`,
    getProgress: (s) => s.streakCount,
    tiers: [
      { val: 1, rank: 'Первый день' },
      { val: 2, rank: 'Старт' },
      { val: 3, rank: '3 Дня' },
      { val: 5, rank: 'Рабочая неделя' },
      { val: 7, rank: '1 Неделя' },
      { val: 10, rank: '10 Дней' },
      { val: 14, rank: '2 Недели' },
      { val: 21, rank: 'Привычка закреплена' },
      { val: 30, rank: '1 Месяц' },
      { val: 45, rank: '45 Дней' },
      { val: 60, rank: '2 Месяца' },
      { val: 75, rank: '75 Дней' },
      { val: 90, rank: 'Квартал (3 месяца)' },
      { val: 100, rank: 'Сотня дней!' },
      { val: 120, rank: '4 Месяца' },
      { val: 150, rank: '5 Месяцев' },
      { val: 180, rank: 'Полгода' },
      { val: 200, rank: '200 Дней' },
      { val: 250, rank: 'Непоколебимый' },
      { val: 300, rank: '10 Месяцев' },
      { val: 365, rank: '1 Год побед!' },
      { val: 400, rank: '400 Дней' },
      { val: 500, rank: '500 Дней' },
      { val: 600, rank: '600 Дней' },
      { val: 730, rank: '2 Года подряд!' },
      { val: 850, rank: '850 Дней' },
      { val: 1000, rank: '1000 Дней дисциплины!' },
      { val: 1095, rank: '3 Года в блокноте!' }
    ]
  });

  // 2. 📝 ОБЩАЯ ПРОДУКТИВНОСТЬ (25 ступеней от 1 до 10 000 дел)
  addTiered({
    prefix: 'tasks_total',
    category: 'tasks',
    icon: '📝',
    titleBase: 'Мастер задач',
    unit: 'дел',
    descTemplate: (v) => `Выполнить суммарно ${v} задач во всех вкладках блокнота`,
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
    titleBase: 'Ранняя пташка',
    unit: 'дел',
    descTemplate: (v) => `Выполнить ${v} утренних задач в блоке УТРО`,
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
    titleBase: 'Дневной фокус',
    unit: 'дел',
    descTemplate: (v) => `Выполнить ${v} дневных задач в блоке ДЕНЬ`,
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
    titleBase: 'Вечерний итог',
    unit: 'дел',
    descTemplate: (v) => `Выполнить ${v} вечерних задач в блоке ВЕЧЕР`,
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
    titleBase: 'Свободное время',
    unit: 'дел',
    descTemplate: (v) => `Выполнить ${v} задач в блоке В СВОБОДНОЕ ВРЕМЯ`,
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
    titleBase: 'Киноман со стажем',
    unit: 'фильмов',
    descTemplate: (v) => `Посмотреть и сохранить в архив ${v} фильмов и сериалов`,
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
    titleBase: 'Охотник за покупками',
    unit: 'покупок',
    descTemplate: (v) => `Совершить и вычеркнуть ${v} запланированных покупок`,
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
    titleBase: 'Хранитель времени',
    unit: 'ч.',
    descTemplate: (v) => `Накопить ${v} часов сфокусированной работы в блокноте`,
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
    titleBase: 'Хроника жизни',
    unit: 'дней',
    descTemplate: (v) => `Сохранить историю выполненных дел за ${v} прожитых дней`,
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
    titleBase: 'Архитектор блокнота',
    unit: 'вкладок',
    descTemplate: (v) => `Создать и поддерживать ${v} вкладок`,
    getProgress: (s) => s.tabsCount,
    tiers: [
      { val: 3 }, { val: 4 }, { val: 5 }, { val: 6 }, { val: 7 },
      { val: 8 }, { val: 10 }, { val: 12 }
    ]
  });

  // 12. 🌟 ОСОБЫЕ И ЕДИНОРАЗОВЫЕ ДОСТИЖЕНИЯ (32 уникальные награды)
  const specialList = [
    { id: 'first_step', icon: '🌟', title: 'Первый шаг', desc: 'Завершить свою самую первую задачу в блокноте', check: s => s.totalCompleted >= 1 },
    { id: 'all_day_done', icon: '🎯', title: 'День на все 100%', desc: 'Выполнить 100% дел за один день', check: s => s.hasDay100Percent },
    { id: 'max_focus_16h', icon: '⚡', title: 'День титана (16ч)', desc: 'Закрыть 16 часов запланированных дел за день', check: s => s.has16hDay },
    { id: 'custom_style', icon: '🎨', title: 'Свой стиль', desc: 'Сменить цвет акцента или тему в настройках', check: s => s.hasCustomizedSettings },
    { id: 'backup_master', icon: '💾', title: 'Бережливый', desc: 'Сохранить резервную копию блокнота в файл', check: s => s.hasExportedBackup },
    { id: 'time_traveler', icon: '🚀', title: 'Машина времени', desc: 'Запланировать задачу на будущую дату в календаре', check: s => s.hasFutureTask },
    { id: 'cinephile_first', icon: '🍿', title: 'Премьерный показ', desc: 'Отметить первый просмотренный фильм в архив', check: s => s.watchCompletedCount >= 1 },
    { id: 'serial_fan', icon: '📺', title: 'Сериаломан', desc: 'Посмотреть сериал и отметить его в архиве', check: s => s.hasWatchedSerial },
    { id: 'smart_shopper', icon: '🛒', title: 'Полная корзина', desc: 'Купить всё из списка «Что купить?»', check: s => s.buyCompletedCount >= 1 },
    { id: 'shop_places_3', icon: '🏪', title: 'Шопинг-тур', desc: 'Сделать покупки в 3 разных магазинах', check: s => s.uniqueBuyPlacesCount >= 3 },
    { id: 'shop_places_5', icon: '🏬', title: 'Знаток магазинов', desc: 'Сделать покупки в 5 разных магазинах', check: s => s.uniqueBuyPlacesCount >= 5 },
    { id: 'shop_places_10', icon: '🗺️', title: 'Карта шопинга', desc: 'Сделать покупки в 10 разных магазинах', check: s => s.uniqueBuyPlacesCount >= 10 },
    { id: 'night_owl', icon: '🦉', title: 'Ночная сова', desc: 'Завершить задачу в поздний вечер или ночь', check: s => s.hasNightTask },
    { id: 'early_riser', icon: '☕', title: 'С первыми лучами', desc: 'Закрыть утреннюю задачу до полудня', check: s => s.morningCompletedCount >= 1 },
    { id: 'pattern_lines', icon: '📏', title: 'Классические линии', desc: 'Установить узор блокнота «Линии»', check: s => s.hasCustomPattern },
    { id: 'pattern_grid', icon: '📐', title: 'Строгая клетка', desc: 'Установить узор блокнота «Клетка»', check: s => s.hasGridPattern },
    { id: 'pattern_dots', icon: '🔘', title: 'Элегантные точки', desc: 'Установить узор блокнота «Точки»', check: s => s.hasDotsPattern },
    { id: 'pattern_blank', icon: '📄', title: 'Чистый лист', desc: 'Установить чистый фон без узора', check: s => s.hasBlankPattern },
    { id: 'multi_tab_user', icon: '📁', title: 'Многозадачность', desc: 'Вести дела одновременно в 4 вкладках', check: s => s.tabsCount >= 4 },
    { id: 'defer_task_once', icon: '🔄', title: 'Второе дыхание', desc: 'Перенести задачу свайпом на следующий день', check: s => s.hasDeferredTask },
    { id: 'photo_task', icon: '📸', title: 'С фотофиксацией', desc: 'Добавить прикрепленное фото или скриншот к задаче', check: s => s.hasPhotoTask },
    { id: 'dark_side', icon: '🌙', title: 'Тёмный рыцарь', desc: 'Включить глубокую тёмную тему блокнота', check: s => s.hasDarkTheme },
    { id: 'century_history', icon: '🏛️', title: 'Летописец', desc: 'Накопить более 100 записей в истории дней', check: s => s.totalHistoryItems >= 100 },
    { id: 'half_thousand_history', icon: '📜', title: 'Великий хроникер', desc: 'Накопить более 500 записей в истории', check: s => s.totalHistoryItems >= 500 },
    { id: 'thousand_history', icon: '👑', title: 'Император продуктивности', desc: 'Накопить более 1000 записей в истории дней', check: s => s.totalHistoryItems >= 1000 },
    { id: 'collector_10', icon: '🥉', title: 'Коллекционер (Бронза)', desc: 'Разблокировать 10 достижений в блокноте', check: s => s.unlockedCount >= 10 },
    { id: 'collector_25', icon: '🥈', title: 'Коллекционер (Серебро)', desc: 'Разблокировать 25 достижений в блокноте', check: s => s.unlockedCount >= 25 },
    { id: 'collector_50', icon: '🥇', title: 'Коллекционер (Золото)', desc: 'Разблокировать 50 достижений в блокноте', check: s => s.unlockedCount >= 50 },
    { id: 'collector_75', icon: '💎', title: 'Коллекционер (Платина)', desc: 'Разблокировать 75 достижений в блокноте', check: s => s.unlockedCount >= 75 },
    { id: 'collector_100', icon: '🏆', title: 'Век славы (100 ачивок)', desc: 'Разблокировать 100 достижений в блокноте!', check: s => s.unlockedCount >= 100 },
    { id: 'collector_150', icon: '🌌', title: 'Космический триумф (150)', desc: 'Разблокировать 150 достижений в блокноте!', check: s => s.unlockedCount >= 150 },
    { id: 'collector_200', icon: '👑', title: 'Абсолютный чемпион (200)', desc: 'Разблокировать 200 достижений в блокноте!', check: s => s.unlockedCount >= 200 }
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

const ACHIEVEMENTS_LIST = buildAchievementsCatalog();

function getTabColor(colorId) {
  if (!colorId || colorId === 'default') return TAB_COLORS[0];
  const found = TAB_COLORS.find(c => c.id === colorId || c.alias === colorId);
  return found || TAB_COLORS[0];
}

class NotebookApp {
  constructor() {
    this.selectedDate = this.getTodayDateString();
    this.tempSelectedDate = this.selectedDate;
    this.displayedCalendarMonth = new Date();
    this.dailyTasks = this.loadDailyTasks();
    this.dayHistory = this.loadDayHistory();
    this.achievementsData = this.loadAchievementsData();
    this.activeAchievementFilter = 'all';
    this.watchArchiveCollapsed = false;

    this.settings = this.loadSettings();
    this.tabs = this.loadTabs();
    this.currentTab = this.tabs.length > 0 ? this.tabs[0].id : 'todo';
    this.tasks = this.loadTasks();
    this.history = this.loadHistory();
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
    this.initDragToScroll();
    this.renderTabs();
    this.render();
    this.updateWorkloadWidget();
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
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  }

  // Load autocomplete history from LocalStorage
  loadHistory() {
    try {
      const saved = localStorage.getItem('todo_notebook_autocomplete_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load autocomplete history:', e);
    }
    return {
      buy_items: [
        { text: 'Молоко', place: 'Наталка', icon: '🥛', count: 12 },
        { text: 'Хлеб', place: 'Пекарня', icon: '🥖', count: 9 },
        { text: 'Кофе в зернах', place: 'Супермаркет', icon: '☕', count: 8 },
        { text: 'Яйца С0', place: 'Наталка', icon: '🥚', count: 7 },
        { text: 'Сыр', place: 'Супермаркет', icon: '🧀', count: 6 },
        { text: 'Вода 5л', place: 'Наталка', icon: '💧', count: 5 },
        { text: 'Куриное филе', place: 'Рынок', icon: '🍗', count: 4 },
        { text: 'Фрукты (яблоки, бананы)', place: 'Рынок', icon: '🍎', count: 4 },
        { text: 'Овощи (помидоры, огурцы)', place: 'Рынок', icon: '🥒', count: 4 },
        { text: 'Сливочное масло', place: 'Наталка', icon: '🧈', count: 3 }
      ],
      buy_places: [
        { text: 'Наталка', icon: '🏪', count: 15 },
        { text: 'Супермаркет', icon: '🛒', count: 10 },
        { text: 'Ашан', icon: '🛒', count: 6 },
        { text: 'Сильпо', icon: '🛒', count: 5 },
        { text: 'Пятёрочка', icon: '🛒', count: 4 },
        { text: 'Аптека', icon: '💊', count: 4 },
        { text: 'Рынок', icon: '🍎', count: 4 },
        { text: 'Пекарня', icon: '🥐', count: 4 },
        { text: 'Wildberries', icon: '📦', count: 3 },
        { text: 'Ozon', icon: '📦', count: 3 }
      ],
      todo_items: [
        { text: 'Завтрак и кофе', icon: '☕', count: 10 },
        { text: 'Рабочий созвон', icon: '📞', count: 8 },
        { text: 'Сдать отчет', icon: '📊', count: 6 },
        { text: 'Прогулка в парке', icon: '🌳', count: 5 },
        { text: 'Тренировка', icon: '🏃', count: 5 },
        { text: 'Почитать книгу', icon: '📖', count: 4 },
        { text: 'Уборка в комнате', icon: '🧹', count: 4 },
        { text: 'Заплатить по счетам', icon: '💳', count: 3 }
      ],
      watch_items: [
        { text: 'Интерстеллар', icon: '🚀', type: 'Фильм', count: 5 },
        { text: 'Дюна 2', icon: '🏜️', type: 'Фильм', count: 4 },
        { text: 'Оппенгеймер', icon: '💣', type: 'Фильм', count: 3 },
        { text: 'Рик и Морти', icon: '🛸', type: 'Сериал', count: 5 },
        { text: 'Очень странные дела', icon: '🚲', type: 'Сериал', count: 4 },
        { text: 'Тед Лассо', icon: '⚽', type: 'Сериал', count: 4 }
      ]
    };
  }

  saveHistory() {
    try {
      localStorage.setItem('todo_notebook_autocomplete_history', JSON.stringify(this.history));
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

    let streakData = { count: 15, lastVisitDate: todayStr, bestStreak: 15 };
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
      streakData.count = streakData.count || 15;
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
    } catch (e) {}

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
    try {
      const saved = localStorage.getItem('todo_notebook_daily_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load daily tasks:', e);
    }
    const today = this.getTodayDateString();
    return {
      [today]: JSON.parse(JSON.stringify(INITIAL_TASKS.todo))
    };
  }

  saveDailyTasks() {
    try {
      localStorage.setItem('todo_notebook_daily_tasks', JSON.stringify(this.dailyTasks));
    } catch (e) {
      console.warn('Could not save daily tasks:', e);
    }
  }

  // Load completed tasks history dictionary: { [YYYY-MM-DD]: [ { id, tabId, text, completedAt, ... } ] }
  loadDayHistory() {
    try {
      const saved = localStorage.getItem('todo_notebook_day_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load day history:', e);
    }
    return {};
  }

  saveDayHistory() {
    try {
      localStorage.setItem('todo_notebook_day_history', JSON.stringify(this.dayHistory));
    } catch (e) {
      console.warn('Could not save day history:', e);
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

  // Load tabs from LocalStorage
  loadTabs() {
    try {
      const saved = localStorage.getItem('todo_notebook_tab_list');
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

  // Save tabs to LocalStorage
  saveTabs() {
    try {
      localStorage.setItem('todo_notebook_tab_list', JSON.stringify(this.tabs));
    } catch (e) {
      console.warn('Could not save tab list:', e);
    }
  }

  // Load tasks from LocalStorage (todo tab tied to selected date, other tabs persistent)
  loadTasks() {
    let persistentTasks = {};
    try {
      const saved = localStorage.getItem('todo_notebook_tasks');
      if (saved) {
        persistentTasks = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load tasks:', e);
    }

    if (!persistentTasks.buy) persistentTasks.buy = JSON.parse(JSON.stringify(INITIAL_TASKS.buy));
    if (!persistentTasks.watch) persistentTasks.watch = JSON.parse(JSON.stringify(INITIAL_TASKS.watch));

    // Daily todo tasks for selected date
    if (this.dailyTasks) {
      if (!this.dailyTasks[this.selectedDate]) {
        this.dailyTasks[this.selectedDate] = this.selectedDate === this.getTodayDateString() ? JSON.parse(JSON.stringify(INITIAL_TASKS.todo)) : [];
      }
      persistentTasks.todo = this.dailyTasks[this.selectedDate];
    } else {
      persistentTasks.todo = JSON.parse(JSON.stringify(INITIAL_TASKS.todo));
    }

    return persistentTasks;
  }

  // Save tasks to LocalStorage
  saveTasks() {
    try {
      if (this.dailyTasks && this.tasks) {
        this.dailyTasks[this.selectedDate] = this.tasks.todo || [];
        this.saveDailyTasks();
      }
      localStorage.setItem('todo_notebook_tasks', JSON.stringify(this.tasks));
    } catch (e) {
      console.warn('Could not save tasks:', e);
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
    this.newTaskForm = document.getElementById('newTaskForm');
    this.dynamicFormFields = document.getElementById('dynamicFormFields');

    // Add Tab Modal elements
    this.newTabModalBackdrop = document.getElementById('newTabModalBackdrop');
    this.newTabCloseBtn = document.getElementById('newTabCloseBtn');
    this.newTabCancelBtn = document.getElementById('newTabCancelBtn');
    this.newTabForm = document.getElementById('newTabForm');
    this.newTabNameInput = document.getElementById('newTabNameInput');

    // Edit Tab Modal elements (Long Press)
    this.editTabModalBackdrop = document.getElementById('editTabModalBackdrop');
    this.editTabCloseBtn = document.getElementById('editTabCloseBtn');
    this.editTabCancelBtn = document.getElementById('editTabCancelBtn');
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
    this.fontFamilySelect = document.getElementById('fontFamilySelect');
    this.fontSizeRange = document.getElementById('fontSizeRange');
    this.fontSizeVal = document.getElementById('fontSizeVal');
    this.fontPreviewBox = document.getElementById('fontPreviewBox');
    this.toggleNotifications = document.getElementById('toggleNotifications');
    this.toggleHaptics = document.getElementById('toggleHaptics');
    this.toggleSound = document.getElementById('toggleSound');
    this.btnTestNotification = document.getElementById('btnTestNotification');
    this.btnExportBackup = document.getElementById('btnExportBackup');
    this.importBackupFile = document.getElementById('importBackupFile');
    this.btnGoogleDriveSync = document.getElementById('btnGoogleDriveSync');
    this.cloudLastSyncText = document.getElementById('cloudLastSyncText');

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
  }

  // Bind event listeners
  initEventListeners() {
    // Open FAB modal
    this.fabBtn.addEventListener('click', () => {
      this.openTaskModal();
    });

    // Close task modal
    this.modalCloseBtn.addEventListener('click', () => this.closeTaskModal());
    this.modalCancelBtn.addEventListener('click', () => this.closeTaskModal());
    this.taskModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.taskModalBackdrop) {
        this.closeTaskModal();
      }
    });

    // Add Task submit
    this.newTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddTask();
    });

    // Open Add Tab Modal
    this.addTabBtn.addEventListener('click', () => {
      this.openNewTabModal();
    });

    // Close Add Tab Modal
    this.newTabCloseBtn.addEventListener('click', () => this.closeNewTabModal());
    this.newTabCancelBtn.addEventListener('click', () => this.closeNewTabModal());
    this.newTabModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.newTabModalBackdrop) {
        this.closeNewTabModal();
      }
    });

    // Add Tab submit
    this.newTabForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddNewTab();
    });

    // Edit Tab Modal listeners
    if (this.editTabCloseBtn) {
      this.editTabCloseBtn.addEventListener('click', () => this.closeEditTabModal());
    }
    if (this.editTabCancelBtn) {
      this.editTabCancelBtn.addEventListener('click', () => this.closeEditTabModal());
    }
    if (this.editTabModalBackdrop) {
      this.editTabModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.editTabModalBackdrop) {
          this.closeEditTabModal();
        }
      });
    }

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
    if (this.editTabForm) {
      this.editTabForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEditTabSubmit();
      });
    }

    // Lightbox close
    if (this.lightboxCloseBtn) {
      this.lightboxCloseBtn.addEventListener('click', () => this.closeLightbox());
    }
    if (this.imageLightboxBackdrop) {
      this.imageLightboxBackdrop.addEventListener('click', (e) => {
        if (e.target === this.imageLightboxBackdrop) {
          this.closeLightbox();
        }
      });
    }

    // In-App Confirmation Modal listeners
    if (this.confirmModalCancelBtn) {
      this.confirmModalCancelBtn.addEventListener('click', () => this.closeConfirmModal());
    }
    if (this.confirmModalBackdrop) {
      this.confirmModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.confirmModalBackdrop) this.closeConfirmModal();
      });
    }
    if (this.confirmModalApproveBtn) {
      this.confirmModalApproveBtn.addEventListener('click', () => {
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
    if (this.settingsModalBackdrop) {
      this.settingsModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.settingsModalBackdrop) {
          this.closeSettingsModal();
        }
      });
    }

    // Calendar Modal listeners
    if (this.calendarCloseBtn) {
      this.calendarCloseBtn.addEventListener('click', () => this.closeCalendarModal());
    }
    if (this.calendarModalBackdrop) {
      this.calendarModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.calendarModalBackdrop) {
          this.closeCalendarModal();
        }
      });
    }
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
        this.selectedDate = this.getTodayDateString();
        this.tempSelectedDate = this.selectedDate;
        this.displayedCalendarMonth = new Date();
        this.syncSelectedDate();
        this.closeCalendarModal();
        this.showToast('Открыт сегодняшний день 📍', '📅');
      });
    }
    if (this.calendarSelectBtn) {
      this.calendarSelectBtn.addEventListener('click', () => {
        triggerHaptic(20);
        this.selectedDate = this.tempSelectedDate;
        this.syncSelectedDate();
        this.closeCalendarModal();
        const formatted = this.formatDateTitle(this.selectedDate);
        this.showToast(`Выбран день: ${formatted}`, '📅');
      });
    }

    // Achievements Modal listeners
    if (this.achievementsCloseBtn) {
      this.achievementsCloseBtn.addEventListener('click', () => this.closeAchievementsModal());
    }
    if (this.achievementsModalBackdrop) {
      this.achievementsModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.achievementsModalBackdrop) {
          this.closeAchievementsModal();
        }
      });
    }
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

    this.widgetTimer.addEventListener('click', () => {
      triggerHaptic(15);
      const textEl = document.getElementById('widgetProgressText');
      const timeText = textEl ? textEl.textContent : '5h 30m';
      this.showToast(`Загруженность за день: ${timeText} из 16 часов`, '⏳');
    });

    this.widgetStreak.addEventListener('click', () => {
      triggerHaptic([20, 40, 20]);
      const days = this.streakData ? this.streakData.count : 15;
      const daysWord = this.getDaysWord(days);
      const record = this.streakData ? this.streakData.bestStreak : days;
      this.showToast(`🔥 Беспрерывная серия: ${days} ${daysWord}! (Рекорд: ${record})`, '🔥');
    });

    if (this.widgetMedal) {
      this.widgetMedal.addEventListener('click', () => {
        triggerHaptic(20);
        this.openAchievementsModal();
      });
    }

    this.widgetSettings.addEventListener('click', () => {
      triggerHaptic(15);
      this.openSettingsModal();
    });
  }

  // Smooth mouse drag-to-scroll for tabs
  initDragToScroll() {
    const slider = this.folderTabsBar;
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
      isDown = false;
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    });
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
      const taskCount = (this.tasks[tab.id] || []).filter(t => !t.completed).length;

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
        if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) {
          cancelPress();
        }
      });

      tabBtn.addEventListener('pointerup', () => cancelPress());
      tabBtn.addEventListener('pointercancel', () => cancelPress());

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
      this.editTabModalBackdrop.classList.add('open');
      this.editTabModalBackdrop.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        if (this.editTabTitleInput) {
          this.editTabTitleInput.focus();
          this.editTabTitleInput.select();
        }
      }, 150);
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
    this.newTabNameInput.value = '';
    this.newTabModalBackdrop.classList.add('open');
    this.newTabModalBackdrop.setAttribute('aria-hidden', 'false');
    setTimeout(() => this.newTabNameInput.focus(), 150);
  }

  // Close New Tab Modal
  closeNewTabModal() {
    this.newTabModalBackdrop.classList.remove('open');
    this.newTabModalBackdrop.setAttribute('aria-hidden', 'true');
    this.newTabForm.reset();
  }

  // Handle Add New Tab
  handleAddNewTab() {
    const rawName = this.newTabNameInput.value.trim();
    if (!rawName) return;

    let formattedTitle = rawName;
    const words = rawName.split(' ');
    if (words.length >= 2) {
      formattedTitle = `${words[0]}\n${words.slice(1).join(' ')}`;
    }

    const tabId = 'tab_' + Date.now().toString(36);
    
    this.tabs.push({
      id: tabId,
      title: formattedTitle
    });

    if (!this.tasks[tabId]) {
      this.tasks[tabId] = [];
    }

    this.saveTabs();
    this.saveTasks();
    this.checkAchievements(true);

    this.closeNewTabModal();
    this.switchTab(tabId);

    setTimeout(() => {
      this.folderTabsBar.scrollTo({ left: this.folderTabsBar.scrollWidth, behavior: 'smooth' });
    }, 100);
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
    this.updateDateWidget();
    this.render();
    if (this.calendarModalBackdrop && this.calendarModalBackdrop.classList.contains('open')) {
      this.renderCalendar();
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
      document.body.classList.add('theme-dark');
      if (appFrame) appFrame.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
      if (appFrame) appFrame.classList.remove('theme-dark');
    }

    // 2. Accent Color
    const accentObj = ACCENT_COLORS.find(c => c.id === this.settings.accentColorId) || ACCENT_COLORS[0];
    document.documentElement.style.setProperty('--primary-rgb', accentObj.rgb || '216, 58, 136');
    document.documentElement.style.setProperty('--primary-magenta', accentObj.color);
    document.documentElement.style.setProperty('--primary-magenta-dark', accentObj.dark);
    document.documentElement.style.setProperty('--accent-margin-line', isDark ? (accentObj.darkMarginLine || accentObj.marginLine) : accentObj.marginLine);
    document.documentElement.style.setProperty('--section-header-bg', isDark ? accentObj.darkSectionBg : accentObj.sectionBg);
    document.documentElement.style.setProperty('--section-header-border', isDark ? accentObj.darkSectionBorder : accentObj.sectionBorder);
    document.documentElement.style.setProperty('--section-header-text', isDark ? accentObj.darkSectionText : accentObj.sectionText);

    // 3. Font Family & Size
    const fontFamily = this.settings.fontFamily || "'PT Serif', Georgia, serif";
    const fontSize = (this.settings.fontSize || 14) + 'px';
    document.documentElement.style.setProperty('--task-font-family', fontFamily);
    document.documentElement.style.setProperty('--task-font-size', fontSize);

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

  // Open Settings Modal
  openSettingsModal() {
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

    this.updateFontPreview();

    // 5. Toggles
    if (this.toggleNotifications) {
      this.toggleNotifications.checked = !!this.settings.notificationsEnabled;
      this.toggleNotifications.onchange = async (e) => {
        if (e.target.checked) {
          const granted = await this.requestNotificationPermission();
          if (!granted) {
            e.target.checked = false;
          }
        } else {
          this.settings.notificationsEnabled = false;
          this.saveSettings();
        }
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

    // 6. Backup Actions
    if (this.btnExportBackup) {
      this.btnExportBackup.onclick = () => this.exportBackup();
    }

    if (this.importBackupFile) {
      this.importBackupFile.onchange = (e) => this.importBackup(e);
    }

    if (this.btnGoogleDriveSync) {
      this.btnGoogleDriveSync.onclick = () => this.syncGoogleDrive();
    }

    this.settingsModalBackdrop.classList.add('open');
    this.settingsModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  // Update Font Preview text styling in settings
  updateFontPreview() {
    if (!this.fontPreviewBox) return;
    this.fontPreviewBox.style.fontFamily = this.settings.fontFamily || "'PT Serif', Georgia, serif";
    this.fontPreviewBox.style.fontSize = `${this.settings.fontSize || 14}px`;
  }

  // Close Settings Modal
  closeSettingsModal() {
    if (this.settingsModalBackdrop) {
      this.settingsModalBackdrop.classList.remove('open');
      this.settingsModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      this.showToast('Уведомления не поддерживаются вашим браузером', '⚠️');
      return false;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      this.settings.notificationsEnabled = true;
      this.saveSettings();
      this.showToast('Уведомления успешно включены!', '🔔');
      return true;
    } else {
      this.settings.notificationsEnabled = false;
      this.saveSettings();
      this.showToast('Доступ к уведомлениям заблокирован в браузере', 'ℹ️');
      return false;
    }
  }

  // Send Test Notification
  sendTestNotification() {
    triggerHaptic(20);
    this.playCompletionSound();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('📝 ToDo Notebook', {
        body: 'Напоминание: у вас есть незавершенные дела на сегодня!',
        icon: 'favicon.ico'
      });
      this.showToast('Тестовое push-уведомление отправлено!', '🔔');
    } else {
      this.showToast('Тестовое уведомление (разрешите доступ к Push)', '🔔');
    }
  }

  // Export full backup to JSON
  // Export all application data as downloadable JSON
  exportBackup() {
    const backupData = {
      version: 2,
      timestamp: new Date().toISOString(),
      tabs: this.tabs,
      tasks: this.tasks,
      dailyTasks: this.dailyTasks,
      dayHistory: this.dayHistory,
      achievements: this.achievementsData,
      history: this.history,
      settings: this.settings,
      streak: this.streakData
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const todayStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `todo-notebook-backup-${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerHaptic(25);
    this.showToast('Резервная копия сохранена в файл JSON', '💾');
  }

  // Import backup from uploaded JSON file
  importBackup(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.tabs && (data.tasks || data.dailyTasks)) {
          this.tabs = data.tabs;
          if (data.dailyTasks) this.dailyTasks = data.dailyTasks;
          if (data.dayHistory) this.dayHistory = data.dayHistory;
          if (data.achievements) this.achievementsData = data.achievements;
          this.tasks = data.tasks || this.loadTasks();
          if (data.history) this.history = data.history;
          if (data.settings) this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
          if (data.streak) this.streakData = data.streak;

          this.currentTab = this.tabs.length > 0 ? this.tabs[0].id : 'todo';

          this.saveTabs();
          this.saveTasks();
          this.saveDailyTasks();
          this.saveDayHistory();
          this.saveAchievementsData();
          this.saveSettings();
          if (this.history) localStorage.setItem('todo_notebook_autocomplete_history', JSON.stringify(this.history));
          if (this.streakData) localStorage.setItem('todo_notebook_daily_streak', JSON.stringify(this.streakData));

          this.applySettings();
          this.updateDateWidget();
          this.updateTrophyWidgetAura();
          this.renderTabs();
          this.render();
          this.updateWorkloadWidget();
          this.closeSettingsModal();

          triggerHaptic([30, 40, 30]);
          this.showToast('Данные успешно восстановлены из файла!', '✨');
        } else {
          this.showToast('Неверный формат файла бэкапа', '⚠️');
        }
      } catch (err) {
        this.showToast('Ошибка при чтении файла бэкапа', '⚠️');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // Simulate Google Drive Cloud Sync
  syncGoogleDrive() {
    triggerHaptic(20);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) + ', ' + now.toLocaleDateString('ru-RU');
    this.settings.lastSync = timeStr;
    this.saveSettings();

    if (this.cloudLastSyncText) {
      this.cloudLastSyncText.textContent = `Последняя синхронизация: ${timeStr}`;
    }

    this.showToast('Облачная копия успешно обновлена! ☁️', '📁');
  }

  // Open Calendar Modal
  openCalendarModal() {
    if (!this.calendarModalBackdrop) return;
    this.tempSelectedDate = this.selectedDate || this.getTodayDateString();
    const [y, m, d] = this.tempSelectedDate.split('-').map(Number);
    this.displayedCalendarMonth = new Date(y, m - 1, 1);
    this.renderCalendar();

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
    if (!this.dailyTasks[this.selectedDate]) {
      this.dailyTasks[this.selectedDate] = [];
    }
    this.tasks.todo = this.dailyTasks[this.selectedDate];
    this.updateDateWidget();
    this.render();
    this.updateWorkloadWidget();
    this.renderTabs();
  }

  // Render Calendar Month & Days Grid
  renderCalendar() {
    if (!this.calendarDaysGrid) return;
    this.calendarDaysGrid.innerHTML = '';

    const currentYear = this.displayedCalendarMonth.getFullYear();
    const currentMonth = this.displayedCalendarMonth.getMonth();

    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    if (this.calendarMonthTitle) {
      this.calendarMonthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
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
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const monthsGenitive = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

      if (this.calendarInfoDate) {
        this.calendarInfoDate.textContent = `${dateObj.getDate()} ${monthsGenitive[dateObj.getMonth()]} ${dateObj.getFullYear()} (${days[dateObj.getDay()]})`;
      }

      const isTempToday = this.tempSelectedDate === todayStr;
      if (this.calendarInfoBadge) {
        this.calendarInfoBadge.textContent = isTempToday ? 'Сегодня' : 'Выбранный день';
        this.calendarInfoBadge.classList.toggle('not-today', !isTempToday);
      }

      const selectedDayTasks = this.dailyTasks[this.tempSelectedDate] || [];
      const completedToday = selectedDayTasks.filter(t => t.completed).length;
      const historyList = this.dayHistory[this.tempSelectedDate] || [];

      if (this.calendarInfoStats) {
        if (selectedDayTasks.length > 0) {
          this.calendarInfoStats.textContent = `Задач на день: ${selectedDayTasks.length} • Выполнено: ${completedToday} ${historyList.length > 0 ? `• В истории: ${historyList.length}` : ''}`;
        } else if (historyList.length > 0) {
          this.calendarInfoStats.textContent = `В истории этого дня: ${historyList.length} выполненных дел`;
        } else {
          this.calendarInfoStats.textContent = isTempToday ? 'Нажмите «Открыть этот день», чтобы планировать задачи' : 'На этот день пока нет записей. Откройте его, чтобы составить план!';
        }
      }
    }
  }

  // Load achievements progress & unlock timestamps from LocalStorage
  loadAchievementsData() {
    try {
      const saved = localStorage.getItem('todo_notebook_achievements');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load achievements:', e);
    }
    return { unlocked: {}, viewed: {} };
  }

  saveAchievementsData() {
    try {
      localStorage.setItem('todo_notebook_achievements', JSON.stringify(this.achievementsData));
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
    let totalMinutesCompleted = 0;
    let hasDay100Percent = false;
    let has16hDay = false;
    let hasNightTask = false;
    let hasFutureTask = false;
    let hasPhotoTask = false;
    let hasWatchedSerial = false;
    let totalHistoryItems = 0;

    const todayStr = this.getTodayDateString();

    // Check all dayHistory
    const livedDaysKeys = Object.keys(this.dayHistory || {});
    const livedDaysCount = livedDaysKeys.filter(k => (this.dayHistory[k] || []).length > 0).length;

    livedDaysKeys.forEach(dayKey => {
      const items = this.dayHistory[dayKey] || [];
      totalHistoryItems += items.length;
      totalCompleted += items.length;
      items.forEach(item => {
        if (item.period === 'УТРО') morningCompleted++;
        if (item.period === 'ДЕНЬ') dayTasksCompleted++;
        if (item.period === 'ВЕЧЕР') eveningCompleted++;
        if (item.period === 'В СВОБОДНОЕ ВРЕМЯ') freeCompleted++;
        if (item.duration) totalMinutesCompleted += parseDurationToMinutes(item.duration);
        if (item.watchType === 'Сериал') hasWatchedSerial = true;
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
      let dayMins = 0;
      tasks.forEach(t => {
        if (t.completed) {
          dayMins += parseDurationToMinutes(t.duration);
          if (t.period === 'УТРО') morningCompleted++;
          if (t.period === 'ДЕНЬ') dayTasksCompleted++;
          if (t.period === 'ВЕЧЕР') eveningCompleted++;
          if (t.period === 'В СВОБОДНОЕ ВРЕМЯ') freeCompleted++;
          if (t.photo) hasPhotoTask = true;
        }
      });
      if (dayMins >= 960) has16hDay = true;
    });

    // Persistent tabs tasks
    const buyTasks = this.tasks.buy || [];
    const buyCompletedCount = buyTasks.filter(t => t.completed).length;
    const uniqueBuyPlaces = new Set(buyTasks.filter(t => t.completed && t.place).map(t => t.place.toLowerCase().trim()));

    const watchTasks = this.tasks.watch || [];
    const watchCompletedCount = watchTasks.filter(t => t.completed).length;
    if (watchTasks.some(t => t.completed && t.watchType === 'Сериал')) {
      hasWatchedSerial = true;
    }

    // Add other persistent custom tabs tasks
    Object.keys(this.tasks || {}).forEach(k => {
      if (k !== 'todo' && k !== 'buy' && k !== 'watch') {
        const list = this.tasks[k] || [];
        list.forEach(t => {
          if (t.completed) {
            totalCompleted++;
            if (t.photo) hasPhotoTask = true;
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

    const totalHoursCompleted = Math.floor(totalMinutesCompleted / 60);

    return {
      totalCompleted,
      morningCompletedCount: morningCompleted,
      dayTasksCompletedCount: dayTasksCompleted,
      eveningCompletedCount: eveningCompleted,
      freeCompletedCount: freeCompleted,
      buyCompletedCount,
      watchCompletedCount,
      uniqueBuyPlacesCount: uniqueBuyPlaces.size,
      totalHoursCompleted,
      livedDaysCount,
      totalHistoryItems,
      hasDay100Percent,
      has16hDay,
      streakCount,
      tabsCount,
      hasCustomizedSettings,
      hasWatchedSerial,
      hasNightTask,
      hasFutureTask,
      hasPhotoTask,
      hasDarkTheme,
      hasCustomPattern,
      hasGridPattern,
      hasDotsPattern,
      hasBlankPattern,
      hasDeferredTask: true,
      hasExportedBackup: true,
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
        triggerHaptic([30, 60, 30]);
        this.playCompletionSound();
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
    if (!this.achievementsModalBackdrop) return;
    
    // Mark all as viewed
    if (this.achievementsData && this.achievementsData.unlocked) {
      Object.keys(this.achievementsData.unlocked).forEach(id => {
        this.achievementsData.viewed[id] = true;
      });
      this.saveAchievementsData();
    }
    this.updateTrophyWidgetAura();
    this.renderAchievements();

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
      this.achievementsProgressPercent.textContent = `${percent}% пройдено (${unlockedCount} из ${totalCount})`;
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
      this.achievementsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; color: #a8a29e;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div style="font-weight: 700; font-size: 15px; color: #78716c;">Ничего не найдено</div>
          <div style="font-size: 13px; margin-top: 4px;">Попробуйте изменить категорию или поисковый запрос</div>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(ach => {
      const isUnlocked = !!this.achievementsData.unlocked[ach.id];
      let targetVal = ach.target || 1;
      let progressPercent = isUnlocked ? 100 : 0;
      let progressText = isUnlocked ? 'Выполнено' : 'Не выполнено';

      if (ach.type === 'progressive') {
        const currentProg = Math.min(ach.getProgress(stats), targetVal);
        progressPercent = Math.min(Math.round((currentProg / targetVal) * 100), 100);
        progressText = `${currentProg} / ${targetVal} ${ach.unit}`;
      }

      html += `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div>
            <div class="achievement-icon-row">
              <span class="achievement-icon">${ach.icon}</span>
              <span class="achievement-status-badge">${isUnlocked ? '✓ Открыто' : '🔒 Закрыто'}</span>
            </div>
            <div class="achievement-title">${this.escapeHtml(ach.title)}</div>
            <div class="achievement-desc">${this.escapeHtml(ach.desc)}</div>
          </div>
          <div class="achievement-progress-box">
            <div class="achievement-progress-bar-bg">
              <div class="achievement-progress-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="achievement-progress-text">
              <span>${ach.type === 'progressive' ? 'Прогресс:' : 'Статус:'}</span>
              <span>${progressText}</span>
            </div>
          </div>
        </div>
      `;
    });

    this.achievementsGrid.innerHTML = html;
  }

  // Toggle Task Completion (with history recording for every lived day)
  toggleTask(taskId) {
    const tabTasks = this.tasks[this.currentTab];
    if (!tabTasks) return;
    
    const task = tabTasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        this.playCompletionSound();
        if (this.currentTab === 'watch') {
          task.completedDate = new Date().toLocaleDateString('ru-RU');
        }

        // Record in day history
        if (!this.dayHistory[this.selectedDate]) {
          this.dayHistory[this.selectedDate] = [];
        }
        const activeTab = this.tabs.find(t => t.id === this.currentTab);
        const tabTitle = activeTab ? activeTab.title : this.currentTab;
        
        const existingIdx = this.dayHistory[this.selectedDate].findIndex(h => h.id === task.id);
        if (existingIdx === -1) {
          this.dayHistory[this.selectedDate].push({
            id: task.id,
            tabId: this.currentTab,
            tabTitle: tabTitle,
            text: task.text,
            period: task.period || '',
            place: task.place || '',
            watchType: task.watchType || '',
            duration: task.duration || '',
            completedAt: new Date().toISOString()
          });
        }
        this.saveDayHistory();
      } else {
        // Remove from history if unchecked
        if (this.dayHistory[this.selectedDate]) {
          this.dayHistory[this.selectedDate] = this.dayHistory[this.selectedDate].filter(h => h.id !== task.id);
          this.saveDayHistory();
        }
      }

      this.saveTasks();
      this.checkAchievements(true);
      this.render();
      this.renderTabs();
      this.updateWorkloadWidget();
    }
  }

  // Delete Task
  deleteTask(taskId, e) {
    e.stopPropagation();
    if (this.tasks[this.currentTab]) {
      this.tasks[this.currentTab] = this.tasks[this.currentTab].filter(t => t.id !== taskId);
      this.saveTasks();
      this.render();
      this.renderTabs();
      this.updateWorkloadWidget();
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

      // Add to next day
      if (!this.dailyTasks[nextDateStr]) {
        this.dailyTasks[nextDateStr] = [];
      }
      this.dailyTasks[nextDateStr].push(task);
      this.saveDailyTasks();
      this.saveTasks();

      this.render();
      this.renderTabs();
      this.updateWorkloadWidget();
      triggerHaptic([20, 40, 20]);
      const nextDayName = this.formatDateTitle(nextDateStr);
      this.showToast(`Задача перенесена на ${nextDayName}`, '📅');
    } else {
      if (!task.text.toLowerCase().includes('перенесено')) {
        task.text += ' (перенесено)';
      }
      this.saveTasks();
      this.render();
      this.renderTabs();
      this.updateWorkloadWidget();
      triggerHaptic([20, 40, 20]);
      this.showToast('Запись перенесена', '📅');
    }
  }

  // Open Task Modal with interactive fields matching current active tab
  openTaskModal() {
    this.editingTaskId = null;
    this.tempPhotoData = null;
    this.renderDynamicForm(this.currentTab);
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Новая запись';
    const submitBtn = document.getElementById('modalSubmitBtn');
    if (submitBtn) submitBtn.textContent = 'Сохранить';

    this.taskModalBackdrop.classList.add('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'false');

    const firstInput = this.dynamicFormFields.querySelector('input[type="text"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 150);
    }
  }

  // Open Edit Task Modal with existing task values pre-filled
  openEditTaskModal(taskId) {
    const tabTasks = this.tasks[this.currentTab];
    if (!tabTasks) return;
    const task = tabTasks.find(t => t.id === taskId);
    if (!task) return;

    this.editingTaskId = taskId;
    this.tempPhotoData = task.photo || null;
    this.renderDynamicForm(this.currentTab);

    // Set modal title & button text
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Редактировать запись';
    const submitBtn = document.getElementById('modalSubmitBtn');
    if (submitBtn) submitBtn.textContent = 'Сохранить изменения';

    // Populate values
    const textInput = this.dynamicFormFields.querySelector('#taskTextInput');
    if (textInput) {
      textInput.value = task.text;
    }

    // Populate period
    if (task.period) {
      const periodSelect = this.dynamicFormFields.querySelector('#taskPeriodSelect');
      if (periodSelect) periodSelect.value = task.period;
    }

    // Populate duration
    if (task.duration) {
      const durationSelect = this.dynamicFormFields.querySelector('#taskDurationSelect');
      if (durationSelect) durationSelect.value = task.duration;
    }

    // Populate place
    if (task.place) {
      const placeInput = this.dynamicFormFields.querySelector('#taskBuyPlaceInput');
      if (placeInput) placeInput.value = task.place;
    }

    // Populate watch type
    if (task.watchType) {
      const watchTypeInput = this.dynamicFormFields.querySelector('#watchTypeInput');
      if (watchTypeInput) watchTypeInput.value = task.watchType;
      const segmentedBtns = this.dynamicFormFields.querySelectorAll('#watchTypeControl .segmented-btn');
      segmentedBtns.forEach(btn => {
        if (btn.dataset.type === task.watchType) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    this.taskModalBackdrop.classList.add('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'false');

    if (textInput) {
      setTimeout(() => {
        textInput.focus();
        textInput.select();
      }, 150);
    }
  }

  // Close Task Modal
  closeTaskModal() {
    this.taskModalBackdrop.classList.remove('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'true');
    this.tempPhotoData = null;
    this.editingTaskId = null;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Новая запись';
    const submitBtn = document.getElementById('modalSubmitBtn');
    if (submitBtn) submitBtn.textContent = 'Сохранить';
    this.newTaskForm.reset();
  }

  // Open Lightbox for full photo preview
  openLightbox(photoSrc) {
    if (!this.lightboxImg || !this.imageLightboxBackdrop) return;
    this.lightboxImg.src = photoSrc;
    this.imageLightboxBackdrop.classList.add('open');
    this.imageLightboxBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeLightbox() {
    if (!this.imageLightboxBackdrop || !this.lightboxImg) return;
    this.imageLightboxBackdrop.classList.remove('open');
    this.imageLightboxBackdrop.setAttribute('aria-hidden', 'true');
    this.lightboxImg.src = '';
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

    const renderPrioritySelector = (defaultVal = 'спокойно') => `
      <div class="form-group">
        <label>${this.t('priority_label')}</label>
        <div class="priority-selector" id="prioritySelectorGroup">
          ${PRIORITIES.map(p => `
            <label class="priority-chip ${p.class} ${p.id === defaultVal ? 'selected' : ''}">
              <input type="radio" name="taskPriority" value="${p.id}" ${p.id === defaultVal ? 'checked' : ''}>
              <span class="p-indicator"></span>
              <span>${priorityLabels[p.id] || p.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;

    // Extra info section
    const renderExtraSection = () => `
      <div class="extra-details-card">
        <div class="extra-details-header">
          <span>📝 ${this.settings.lang === 'en' ? 'Extra details' : (this.settings.lang === 'uk' ? 'Додаткова інформація' : 'Дополнительная информация')}</span>
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
          <textarea id="taskExtraNotes" placeholder="${this.settings.lang === 'en' ? 'Add notes or details...' : (this.settings.lang === 'uk' ? 'Дописати нотатку або подробиці...' : 'Дописать заметку или подробности...')}"></textarea>
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
          <input type="url" id="taskLinkInput" placeholder="🔗 ${this.settings.lang === 'en' ? 'Insert link (https://...)' : (this.settings.lang === 'uk' ? 'Вставити посилання (https://...)' : 'Вставить ссылку (например https://...)')}" autocomplete="off">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="margin-bottom: 4px;">${this.t('photo_attach_btn')}</label>
          <div class="photo-uploader-area">
            <label class="btn-upload-file">
              <span>📷 ${this.settings.lang === 'en' ? 'Choose file' : (this.settings.lang === 'uk' ? 'Вибрати файл' : 'Выбрать файл')}</span>
              <input type="file" id="taskPhotoFileInput" accept="image/*" style="display: none;">
            </label>
            <div id="photoPreviewContainer" style="display: ${this.tempPhotoData ? 'block' : 'none'};">
              <div class="photo-preview-wrap">
                <img id="photoPreviewImg" class="photo-preview-img" src="${this.tempPhotoData || ''}" alt="Preview" />
                <button type="button" class="photo-remove-btn" id="photoRemoveBtn">&times;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (tabId === 'todo') {
      // 1) "Что сделать?"
      html = `
        <div class="form-group">
          <label for="taskTextInput">${this.t('task_text_label')}</label>
          <div class="autocomplete-wrapper">
            <input type="text" id="taskTextInput" placeholder="${this.t('task_text_placeholder')}" required autocomplete="off">
            <div class="autocomplete-dropdown" id="taskTextDropdown"></div>
          </div>
        </div>

        ${renderPrioritySelector('спокойно')}

        <div class="form-group">
          <label for="taskPeriodSelect">${this.t('period_label')}</label>
          <select id="taskPeriodSelect">
            <option value="УТРО">${this.t('period_morning')}</option>
            <option value="ДЕНЬ">${this.t('period_day')}</option>
            <option value="ВЕЧЕР">${this.t('period_evening')}</option>
            <option value="В СВОБОДНОЕ ВРЕМЯ">${this.t('period_free')}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="taskDurationSelect">${this.t('duration_label')}</label>
          <select id="taskDurationSelect">
            ${DURATION_OPTIONS.map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>

        ${renderExtraSection()}
      `;
    } else if (tabId === 'buy') {
      // 2) "Что купить?"
      html = `
        <div class="form-group">
          <label for="taskTextInput">${this.t('task_text_label')}</label>
          <div class="autocomplete-wrapper">
            <input type="text" id="taskTextInput" placeholder="${this.t('buy_item_placeholder')}" required autocomplete="off">
            <div class="autocomplete-dropdown" id="taskTextDropdown"></div>
          </div>
        </div>

        <div class="form-group">
          <label for="taskBuyPlaceInput">${this.t('buy_place_label')}</label>
          <div class="autocomplete-wrapper">
            <input type="text" id="taskBuyPlaceInput" placeholder="${this.t('buy_place_placeholder')}" autocomplete="off">
            <div class="autocomplete-dropdown" id="buyPlaceDropdown"></div>
          </div>
        </div>

        ${renderPrioritySelector('спокойно')}

        ${renderExtraSection()}
      `;
    } else if (tabId === 'watch') {
      // 3) "Что посмотреть?"
      html = `
        <div class="form-group">
          <label for="taskTextInput">${this.t('watch_name_label')}</label>
          <div class="autocomplete-wrapper">
            <input type="text" id="taskTextInput" placeholder="${this.t('watch_name_placeholder')}" required autocomplete="off">
            <div class="autocomplete-dropdown" id="taskTextDropdown"></div>
          </div>
        </div>

        <div class="form-group">
          <label>${this.t('watch_type_label')}</label>
          <div class="segmented-control" id="watchTypeControl">
            <button type="button" class="segmented-btn active" data-type="Фильм">${this.t('watch_movie')}</button>
            <button type="button" class="segmented-btn" data-type="Сериал">${this.t('watch_series_btn')}</button>
          </div>
          <input type="hidden" id="watchTypeInput" value="Фильм">
        </div>

        ${renderPrioritySelector('спокойно')}

        ${renderExtraSection()}
      `;
    } else {
      // 4) Любая новая вкладка
      html = `
        <div class="form-group">
          <label for="taskTextInput">${this.t('task_text_label')}</label>
          <div class="autocomplete-wrapper">
            <input type="text" id="taskTextInput" placeholder="${this.t('task_text_placeholder')}" required autocomplete="off">
            <div class="autocomplete-dropdown" id="taskTextDropdown"></div>
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
    const buyPlaceInput = this.dynamicFormFields.querySelector('#taskBuyPlaceInput');
    const buyPlaceDropdown = this.dynamicFormFields.querySelector('#buyPlaceDropdown');

    const historyKey = tabId === 'buy' ? 'buy_items' : (tabId === 'watch' ? 'watch_items' : 'todo_items');

    this.setupAutocomplete({
      inputEl: textInput,
      dropdownEl: textDropdown,
      historyListKey: historyKey,
      onSelect: (item) => {
        // If purchase has associated place, auto-fill it!
        if (tabId === 'buy' && item && item.place && buyPlaceInput && (!buyPlaceInput.value || buyPlaceInput.value === 'Разное')) {
          buyPlaceInput.value = item.place;
          triggerHaptic(15);
        }
        // If movie has associated watchType, update segmented control
        if (tabId === 'watch' && item && item.type) {
          const watchTypeInput = this.dynamicFormFields.querySelector('#watchTypeInput');
          if (watchTypeInput) watchTypeInput.value = item.type;
          const segmentedBtns = this.dynamicFormFields.querySelectorAll('#watchTypeControl .segmented-btn');
          segmentedBtns.forEach(btn => {
            if (btn.dataset.type === item.type) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          });
        }
      }
    });

    if (buyPlaceInput) {
      this.setupAutocomplete({
        inputEl: buyPlaceInput,
        dropdownEl: buyPlaceDropdown,
        historyListKey: 'buy_places',
        onSelect: () => {}
      });
    }

    // Attach Priority Chip click events
    const chips = this.dynamicFormFields.querySelectorAll('.priority-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const radio = chip.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // Attach Watch Type segmented control click events
    const segmentedBtns = this.dynamicFormFields.querySelectorAll('#watchTypeControl .segmented-btn');
    const watchTypeInput = this.dynamicFormFields.querySelector('#watchTypeInput');
    segmentedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        segmentedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (watchTypeInput) {
          watchTypeInput.value = btn.dataset.type;
        }
      });
    });

    // Attach Photo File Uploader listener
    const photoFileInput = this.dynamicFormFields.querySelector('#taskPhotoFileInput');
    const previewContainer = this.dynamicFormFields.querySelector('#photoPreviewContainer');
    const previewImg = this.dynamicFormFields.querySelector('#photoPreviewImg');
    const removeBtn = this.dynamicFormFields.querySelector('#photoRemoveBtn');

    if (photoFileInput) {
      photoFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const compressedData = await compressImageFile(file, 900, 900, 0.78);
            this.tempPhotoData = compressedData;
            if (previewImg) previewImg.src = this.tempPhotoData;
            if (previewContainer) previewContainer.style.display = 'block';
          } catch (err) {
            console.warn('Image compression fallback:', err);
            const reader = new FileReader();
            reader.onload = (event) => {
              this.tempPhotoData = event.target.result;
              if (previewImg) previewImg.src = this.tempPhotoData;
              if (previewContainer) previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
          }
        }
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.tempPhotoData = null;
        if (photoFileInput) photoFileInput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewImg) previewImg.src = '';
      });
    }
  }

  // Helper for wiring input autocompletion with smart dropdown on typing
  setupAutocomplete({ inputEl, dropdownEl, historyListKey, onSelect }) {
    if (!inputEl) return;

    const getItems = () => {
      return (this.history && this.history[historyListKey]) ? [...this.history[historyListKey]] : [];
    };

    // Dropdown suggestions on input
    const showDropdown = (query = '') => {
      if (!dropdownEl) return;
      const q = query.trim().toLowerCase();
      let matched = getItems();
      if (q) {
        matched = matched.filter(item => item.text.toLowerCase().includes(q));
      }
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
        if (q) {
          const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          highlighted = highlighted.replace(regex, '<strong>$1</strong>');
        }

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

    inputEl.addEventListener('focus', () => {
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
    const textInput = this.dynamicFormFields.querySelector('#taskTextInput');
    let text = textInput ? textInput.value.trim() : '';
    const targetTab = this.currentTab;

    if (!text) return;

    // Get selected priority
    const priorityRadio = this.dynamicFormFields.querySelector('input[name="taskPriority"]:checked');
    const priority = priorityRadio ? priorityRadio.value : 'спокойно';

    // Format priority directly in title if important / urgent
    if (priority === 'вопрос жизни и смерти' && !text.toLowerCase().includes('жизни и смерти')) {
      text += ' (вопрос жизни и смерти)';
    } else if (priority === 'очень важно' && !text.toLowerCase().includes('очень важно')) {
      text += ' (очень важно)';
    } else if (priority === 'в течении дня' && !text.toLowerCase().includes('в течении дня') && targetTab === 'todo') {
      text += ' (в течении дня)';
    }

    let itemPlace = '';
    let itemWatchType = '';

    if (this.editingTaskId) {
      // Update existing task
      const tabTasks = this.tasks[targetTab];
      const task = tabTasks ? tabTasks.find(t => t.id === this.editingTaskId) : null;
      if (task) {
        task.text = text;
        if (targetTab === 'todo') {
          const periodSelect = this.dynamicFormFields.querySelector('#taskPeriodSelect');
          const durationSelect = this.dynamicFormFields.querySelector('#taskDurationSelect');
          task.period = periodSelect ? periodSelect.value : 'УТРО';
          task.duration = durationSelect ? durationSelect.value : '30 минут';
        } else if (targetTab === 'buy') {
          const placeInput = this.dynamicFormFields.querySelector('#taskBuyPlaceInput');
          itemPlace = (placeInput && placeInput.value.trim()) ? placeInput.value.trim() : 'Разное';
          task.place = itemPlace;
        } else if (targetTab === 'watch') {
          const watchTypeInput = this.dynamicFormFields.querySelector('#watchTypeInput');
          itemWatchType = watchTypeInput ? watchTypeInput.value : 'Фильм';
          task.watchType = itemWatchType;
        }
        this.saveTasks();
        this.recordHistory(targetTab, text, itemPlace, itemWatchType);
        this.render();
        this.renderTabs();
        this.updateWorkloadWidget();
        triggerHaptic(20);
        this.showToast('Запись успешно обновлена', '✏️');
      }
      this.closeTaskModal();
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      text: text,
      completed: false
    };

    // Period & Duration for 'todo'
    if (targetTab === 'todo') {
      const periodSelect = this.dynamicFormFields.querySelector('#taskPeriodSelect');
      const durationSelect = this.dynamicFormFields.querySelector('#taskDurationSelect');
      newTask.period = periodSelect ? periodSelect.value : 'УТРО';
      newTask.duration = durationSelect ? durationSelect.value : '30 минут';
    }

    // Place for 'buy'
    if (targetTab === 'buy') {
      const placeInput = this.dynamicFormFields.querySelector('#taskBuyPlaceInput');
      const placeVal = placeInput ? placeInput.value.trim() : '';
      itemPlace = placeVal || 'Разное';
      newTask.place = itemPlace;
    }

    // Watch type for 'watch'
    if (targetTab === 'watch') {
      const watchTypeInput = this.dynamicFormFields.querySelector('#watchTypeInput');
      itemWatchType = watchTypeInput ? watchTypeInput.value : 'Фильм';
      newTask.watchType = itemWatchType;
    }

    if (!this.tasks[targetTab]) {
      this.tasks[targetTab] = [];
    }

    this.tasks[targetTab].push(newTask);
    this.saveTasks();
    this.recordHistory(targetTab, text, itemPlace, itemWatchType);

    this.render();
    this.renderTabs();
    this.updateWorkloadWidget();
    this.checkAchievements(true);
    triggerHaptic(20);

    this.closeTaskModal();
  }

  // Render Notebook Content
  render() {
    const currentTasks = this.tasks[this.currentTab] || [];
    let html = '';

    if (currentTasks.length === 0) {
      html += `
        <div class="section-header-row">
          <span class="section-header-text">${this.t('empty_list')}</span>
        </div>
        <div class="task-row">
          <div class="task-text" style="color: #8c919c; font-weight: normal; font-style: italic;">
            ${this.t('empty_list_hint')}
          </div>
        </div>
      `;
      this.contentContainer.innerHTML = html;
      return;
    }

    if (this.currentTab === 'todo') {
      // Group by period: УТРО, ДЕНЬ, ВЕЧЕР, В СВОБОДНОЕ ВРЕМЯ
      const grouped = {};
      PERIODS_TODO.forEach(p => { grouped[p] = []; });

      currentTasks.forEach(task => {
        const period = task.period || 'УТРО';
        if (!grouped[period]) {
          grouped[period] = [];
        }
        grouped[period].push(task);
      });

      const periodHeaderNames = {
        'УТРО': this.t('period_morning'),
        'ДЕНЬ': this.t('period_day'),
        'ВЕЧЕР': this.t('period_evening'),
        'В СВОБОДНОЕ ВРЕМЯ': this.t('period_free')
      };

      PERIODS_TODO.forEach(period => {
        const tasksInPeriod = grouped[period];
        if (tasksInPeriod && tasksInPeriod.length > 0) {
          const headerTitle = periodHeaderNames[period] || period;
          html += `
            <div class="section-header-row">
              <span class="section-header-text">${headerTitle}</span>
            </div>
          `;
          tasksInPeriod.forEach(task => {
            html += this.renderTaskRow(task);
          });
        }
      });

    } else if (this.currentTab === 'buy') {
      // Group and sort by place of purchase
      const grouped = {};
      currentTasks.forEach(task => {
        const place = (task.place && task.place.trim()) ? task.place.trim() : 'Разное';
        if (!grouped[place]) {
          grouped[place] = [];
        }
        grouped[place].push(task);
      });

      // Sort places alphabetically, keeping 'Разное' / 'Без места' at the end
      const sortedPlaces = Object.keys(grouped).sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower === 'разное' || aLower === 'без места' || aLower === 'другое') return 1;
        if (bLower === 'разное' || bLower === 'без места' || bLower === 'другое') return -1;
        return a.localeCompare(b, this.settings.lang || 'ru', { sensitivity: 'base' });
      });

      sortedPlaces.forEach(place => {
        const tasksInPlace = grouped[place];
        if (tasksInPlace && tasksInPlace.length > 0) {
          html += `
            <div class="section-header-row">
              <span class="section-header-text">${this.escapeHtml(place.toUpperCase())}</span>
            </div>
          `;
          tasksInPlace.forEach(task => {
            html += this.renderTaskRow(task);
          });
        }
      });

    } else if (this.currentTab === 'watch') {
      const activeTasks = currentTasks.filter(t => !t.completed);
      const archivedTasks = currentTasks.filter(t => t.completed);

      const watchCategories = [
        { key: 'Фильм', label: this.t('watch_movies') },
        { key: 'Сериал', label: this.t('watch_series') }
      ];

      const grouped = {
        'Фильм': [],
        'Сериал': []
      };

      activeTasks.forEach(task => {
        const type = task.watchType || task.type || 'Фильм';
        if (!grouped[type]) {
          grouped[type] = [];
        }
        grouped[type].push(task);
      });

      watchCategories.forEach(cat => {
        const tasksInCat = grouped[cat.key];
        if (tasksInCat && tasksInCat.length > 0) {
          html += `
            <div class="section-header-row">
              <span class="section-header-text">${cat.label}</span>
            </div>
          `;
          tasksInCat.forEach(task => {
            html += this.renderTaskRow(task);
          });
        }
      });

      // Any other custom watch categories
      Object.keys(grouped).forEach(k => {
        if (!watchCategories.some(c => c.key === k)) {
          const extraTasks = grouped[k];
          if (extraTasks && extraTasks.length > 0) {
            html += `
              <div class="section-header-row">
                <span class="section-header-text">${this.escapeHtml(k.toUpperCase())}</span>
              </div>
            `;
            extraTasks.forEach(task => {
              html += this.renderTaskRow(task);
            });
          }
        }
      });

      // Collapsible Watch Archive Section
      if (archivedTasks.length > 0) {
        html += `
          <div class="watch-archive-toggle-bar ${this.watchArchiveCollapsed ? '' : 'open'}" id="watchArchiveToggle">
            <span class="watch-archive-title">${this.t('watch_archive', { count: archivedTasks.length })}</span>
            <span class="watch-archive-arrow">▼</span>
          </div>
        `;
        if (!this.watchArchiveCollapsed) {
          archivedTasks.forEach(task => {
            html += this.renderTaskRow(task);
          });
        }
      }

    } else {
      // Other Tabs (Новые вкладки)
      currentTasks.forEach(task => {
        html += this.renderTaskRow(task);
      });
    }

    this.contentContainer.innerHTML = html;

    // Attach Watch Archive toggle listener
    const archiveToggle = document.getElementById('watchArchiveToggle');
    if (archiveToggle) {
      archiveToggle.onclick = () => {
        triggerHaptic(15);
        this.watchArchiveCollapsed = !this.watchArchiveCollapsed;
        this.render();
      };
    }

    // Attach interactive swipe gestures and actions
    this.attachSwipeEvents();

    this.updateWorkloadWidget();
  }

  // Render individual task row HTML - Interactive swipeable notebook line
  renderTaskRow(task) {
    const isWatchArchive = this.currentTab === 'watch' && task.completed;
    const swipeCheckLabel = task.completed ? this.t('btn_cancel') : (this.settings.lang === 'en' ? 'Done' : 'Готово');
    return `
      <div class="task-row-wrapper" data-id="${task.id}">
        <!-- Right side actions on swipe left (3 buttons: Defer, Edit, Delete) -->
        <div class="task-swipe-actions-right">
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
        </div>

        <!-- Left side complete indicator on swipe right -->
        <div class="task-swipe-check-bg">
          <span class="swipe-check-icon">✓</span>
          <span class="swipe-check-text">${swipeCheckLabel}</span>
        </div>

        <!-- Sliding foreground task row -->
        <div class="task-row ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-checkbox-container">
            <div class="task-checkbox" role="checkbox" aria-checked="${task.completed}"></div>
          </div>
          <div class="task-text">
            ${this.escapeHtml(task.text)}
            ${isWatchArchive && task.completedDate ? `<span class="archive-date-tag">✓ ${task.completedDate}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Attach touch and drag swipe gestures for each task row
  attachSwipeEvents() {
    const wrappers = this.contentContainer.querySelectorAll('.task-row-wrapper');
    let activeOpenWrapper = null;

    const closeAllSwipes = () => {
      wrappers.forEach(w => {
        w.classList.remove('open', 'swiping');
        const r = w.querySelector('.task-row');
        const a = w.querySelector('.task-swipe-actions-right');
        const bg = w.querySelector('.task-swipe-check-bg');
        if (r) r.style.transform = '';
        if (a) a.style.transform = '';
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
      const row = wrapper.querySelector('.task-row');
      const checkBg = wrapper.querySelector('.task-swipe-check-bg');
      const actionsRight = wrapper.querySelector('.task-swipe-actions-right');
      const taskId = wrapper.dataset.id;
      const actions = wrapper.querySelectorAll('.swipe-action-btn');

      // Click on action buttons
      actions.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          if (action === 'delete') {
            triggerHaptic([15, 30, 15]);
            this.deleteTask(taskId, e);
          } else if (action === 'edit') {
            triggerHaptic(20);
            this.openEditTaskModal(taskId);
          } else if (action === 'defer') {
            this.deferTask(taskId);
          }
          closeAllSwipes();
        });
      });

      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let isHorizontal = null;
      const maxLeftSwipe = -132;
      const maxRightSwipe = 90;

      const handleStart = (clientX, clientY) => {
        if (activeOpenWrapper && activeOpenWrapper !== wrapper) {
          closeAllSwipes();
        }
        startX = clientX;
        startY = clientY;
        isDragging = false;
        isHorizontal = null;
        wrapper.classList.add('swiping');
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

        if (e && e.cancelable) e.preventDefault();
        isDragging = true;

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

        row.style.transform = `translateX(${translateX}px)`;

        if (translateX < 0) {
          // Actions follow directly
          const actionsOffset = Math.max(0, 132 + translateX);
          if (actionsRight) actionsRight.style.transform = `translateX(${actionsOffset}px)`;
          if (checkBg) checkBg.classList.remove('visible');
        } else if (translateX > 15) {
          if (actionsRight) actionsRight.style.transform = 'translateX(100%)';
          if (checkBg) checkBg.classList.add('visible');
        } else {
          if (actionsRight) actionsRight.style.transform = 'translateX(100%)';
          if (checkBg) checkBg.classList.remove('visible');
        }
      };

      const handleEnd = (clientX) => {
        wrapper.classList.remove('swiping');
        if (checkBg) checkBg.classList.remove('visible');

        if (!isDragging) {
          // Tap / click
          if (wrapper.classList.contains('open')) {
            closeAllSwipes();
          } else {
            triggerHaptic(15);
            this.toggleTask(taskId);
          }
          return;
        }

        const dx = clientX - startX;

        if (wrapper.classList.contains('open')) {
          if (dx > 30) {
            // Swiped right -> close
            wrapper.classList.remove('open');
            row.style.transform = '';
            if (actionsRight) actionsRight.style.transform = '';
            activeOpenWrapper = null;
          } else {
            // Keep open
            wrapper.classList.add('open');
            row.style.transform = '';
            if (actionsRight) actionsRight.style.transform = '';
            activeOpenWrapper = wrapper;
          }
        } else {
          if (dx > 45) {
            // Swiped right -> complete
            triggerHaptic([20, 35, 20]);
            this.toggleTask(taskId);
            wrapper.classList.remove('open');
            row.style.transform = '';
            if (actionsRight) actionsRight.style.transform = '';
          } else if (dx < -35) {
            // Swiped left -> open
            triggerHaptic(20);
            wrapper.classList.add('open');
            row.style.transform = '';
            if (actionsRight) actionsRight.style.transform = '';
            activeOpenWrapper = wrapper;
          } else {
            // Snap back
            wrapper.classList.remove('open');
            row.style.transform = '';
            if (actionsRight) actionsRight.style.transform = '';
          }
        }
      };

      // Pointer / Mouse events
      row.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        if (e.pointerType === 'touch') return; // Handled by touch events
        try { row.setPointerCapture(e.pointerId); } catch (err) {}
        handleStart(e.clientX, e.clientY);

        const onPointerMove = (ev) => handleMove(ev.clientX, ev.clientY, ev);
        const onPointerUp = (ev) => {
          try { row.releasePointerCapture(ev.pointerId); } catch (err) {}
          row.removeEventListener('pointermove', onPointerMove);
          row.removeEventListener('pointerup', onPointerUp);
          row.removeEventListener('pointercancel', onPointerUp);
          handleEnd(ev.clientX);
        };

        row.addEventListener('pointermove', onPointerMove);
        row.addEventListener('pointerup', onPointerUp);
        row.addEventListener('pointercancel', onPointerUp);
      });

      // Native Touch events (smooth & bulletproof on all mobile phones)
      row.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }, { passive: true });

      row.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY, e);
      }, { passive: false });

      row.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        handleEnd(touch ? touch.clientX : 0);
      }, { passive: true });

      row.addEventListener('touchcancel', () => {
        handleEnd(0);
      }, { passive: true });
    });
  }

  // Update Workload Widget (Baseline: 16-hour day = 960 minutes)
  updateWorkloadWidget() {
    const todoTasks = this.tasks['todo'] || [];
    let totalMinutes = 0;

    todoTasks.forEach(task => {
      totalMinutes += parseDurationToMinutes(task.duration);
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    let timeText = '';
    if (totalMinutes === 0) {
      timeText = '0ч';
    } else if (hours > 0 && mins > 0) {
      timeText = `${hours}h ${mins}m`;
    } else if (hours > 0) {
      timeText = `${hours}h`;
    } else {
      timeText = `${mins}m`;
    }

    const textEl = document.getElementById('widgetProgressText');
    if (textEl) {
      textEl.textContent = timeText;
    }

    const circleEl = document.getElementById('widgetProgressRingFill') || document.querySelector('.progress-ring-fill');
    if (circleEl) {
      const radius = 23.5;
      const circumference = 2 * Math.PI * radius; // ~147.65
      const maxMinutes = 16 * 60; // 960 minutes = 16 hours
      const fraction = Math.min(Math.max(totalMinutes / maxMinutes, 0), 1);
      const offset = circumference * (1 - fraction);

      circleEl.style.strokeDasharray = `${circumference.toFixed(2)}`;
      circleEl.style.strokeDashoffset = `${offset.toFixed(2)}`;
    }

    const widgetTimer = document.getElementById('widgetTimer');
    if (widgetTimer) {
      const percent = Math.round((totalMinutes / (16 * 60)) * 100);
      widgetTimer.title = `Загруженность: ${timeText} из 16ч (${percent}%)`;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NotebookApp();
});
