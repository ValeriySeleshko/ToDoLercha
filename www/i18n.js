/**
 * Plan4U - Internationalization (i18n) Module
 * 
 * Centralized, extensible translation system for Plan4U Notebook.
 * Supports RU (Russian), UK (Ukrainian), EN (English) with seamless extensibility for any language.
 */

(function () {
  'use strict';

  const I18N = {
    // ==========================================
    // 🇷🇺 РУССКИЙ (RUSSIAN)
    // ==========================================
    ru: {
      code: 'РУ',
      name: 'Русский',
      flag: '🇷🇺',
      locale: 'ru-RU',

      // Calendar & Date Formatting
      monthsGenitive: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
      monthsNominative: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      today: 'Сегодня',
      selectedDay: 'Выбранный день',

      // Header Widgets & Tooltips
      tooltip_date: 'Календарь блокнота',
      tooltip_timer: 'Загруженность за день (из 16 ч)',
      tooltip_streak: 'Серия дней',
      tooltip_trophy: 'Достижения',
      tooltip_settings: 'Настройки',
      workload_toast: 'Загруженность за день: {val} из 16 часов',
      streak_toast: '🔥 Беспрерывная серия: {days} {daysWord}! (Рекорд: {record})',

      // System Notebook Tabs
      tab_todo: 'Что\nсделать?',
      tab_buy: 'Что\nкупить?',
      tab_watch: 'Что\nпосмотреть?',

      // Standard Sections (Todo Tab)
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
      empty_list: 'Список пуст',
      empty_list_hint: 'Нажмите в строку раздела, чтобы добавить дело',

      // Day Periods
      period_morning: 'Утро',
      period_day: 'День',
      period_evening: 'Вечер',
      period_free: 'В свободное время',

      // Watch Tab Specifics
      watch_movies: '🎬 Фильмы',
      watch_series: '📺 Сериалы',
      watch_archive: '🎬 Архив просмотренного ({count})',

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

      // Section Actions Menu (Long-press on section header)
      sec_menu_title: 'Управление блоком',
      sec_menu_rename: 'Переименовать блок',
      sec_menu_move_up: 'Переместить выше',
      sec_menu_move_down: 'Переместить ниже',
      sec_menu_delete: 'Удалить блок',

      // New Section Modal
      new_section_title: 'Новый блок (раздел)',
      new_section_name_label: 'Название блока',
      new_section_name_ph: 'Например: Вечерние дела',
      new_section_icon_label: 'Иконка блока',
      new_section_submit: 'Создать блок',

      // Modals General
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

      // Form Fields
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

      // Settings Modal
      settings_title: '⚙️ Настройки',
      settings_language: 'Язык приложения',
      settings_language_desc: 'Интерфейс и даты на выбранном языке',
      settings_theme: 'Тема оформления',
      theme_light: '☀️ Светлая',
      theme_dark: '🌙 Тёмная',
      theme_auto: '⚙️ Авто',
      settings_accent: 'Цвет акцента',
      accent_disabled_hint: '(недоступно в тёмной теме)',
      theme_accent_chocolate: 'Шоколадный',
      theme_accent_coffee: 'Кофейный',
      theme_accent_swamp: 'Болотный',
      theme_accent_khaki_moss: 'Хаки-болото',
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

      // Achievements Modal
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

      // Confirm Delete Modal
      confirm_delete_tab_title: 'Удалить вкладку?',
      confirm_delete_tab_msg: 'Вы уверены, что хотите удалить созданную вкладку «{title}» и все её задачи? Это действие нельзя будет отменить.',
      confirm_delete_tab_btn: 'Да, удалить',
      confirm_delete_section_title: 'Удалить блок?',
      confirm_delete_section_msg: 'Вы уверены, что хотите удалить блок «{title}» и все задачи внутри него? Это действие нельзя отменить.',
      confirm_delete_section_btn: 'Да, удалить блок',

      // Calendar Modal
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
      toast_section_created: 'Блок успешно создан',
      toast_section_deleted: 'Блок удален',
      toast_section_renamed: 'Блок переименован',
      toast_backup_exported: 'Файл бэкапа успешно скачан',
      toast_backup_imported: 'Данные успешно восстановлены из бэкапа',
      toast_cloud_synced: 'Синхронизация завершена успешно',
      toast_notif_test_sent: 'Тестовое уведомление отправлено!',
      toast_notif_denied: 'Оповещения заблокированы в настройках устройства',

      // Stickers Drawer & Context Menu
      stickers_title: '✨ Стикеры и декор',
      stickers_hint: 'Перетяните на лист или нажмите для добавления',
      cat_fall: '🍂 Осень',
      cat_cats: '🐱 Коты',
      cat_more_cats: '🐾 Ещё коты',
      cat_flora: '🍄 Флора',
      cat_fauna: '🐝 Фауна',
      cat_ocean: '🌊 Океан',
      cat_pigs: '🐹 Свини',
      cat_food: '🍔 Еда',
      cat_sweets: '🍰 Сладости',
      cat_reptiles: '🐸 Рептилии',
      toast_sticker_added: 'Стикер прикреплен к листу ✨',
      toast_sticker_deleted: 'Стикер удален',
      toast_sticker_archive_day: 'Нельзя добавлять стикеры в прошедшие дни (архив)',
      btn_stk_rotate: 'Повернуть на 15°',
      btn_stk_bigger: 'Увеличить',
      btn_stk_smaller: 'Уменьшить',
      btn_stk_delete: 'Удалить стикер',

      // Maine Coon Tamagotchi Companion
      pet_default_name: 'Мейни',
      pet_level_badge: 'Ур. {level}',
      pet_rename_title: 'Переименовать питомца',
      pet_rename_prompt: 'Введите имя для вашего котёнка-мейнкуна:',
      pet_coat_colors_title: '🎨 Настоящие окрасы',
      pet_color_ginger: 'Рыжий табби 🦁',
      pet_color_white: 'Белоснежный ❄️',
      pet_color_tiger: 'Тигровый 🐯',
      pet_color_silver: 'Серебристый 🐺',
      pet_color_midnight: 'Угольный 🌙',
      pet_color_cream: 'Кремовый 🍑',
      pet_color_mocha: 'Шоколадный ☕',
      pet_color_siamese: 'Колор-пойнт 🐾',
      pet_color_calico: 'Трёхцветный 🎨',
      pet_tap_hint: '✨ Погладь Мейнкуна пальцем, чтобы помурчать',
      pet_stat_satiety: 'Сытость:',
      pet_stat_happiness: 'Счастье:',
      pet_status_sleeping: 'Спит клубочком... 💤',
      pet_status_full: 'Сытый и довольный 😋',
      pet_status_hungry_mild: 'Не откажется от камушка 🟤',
      pet_status_hungry_severe: 'Сильно проголодался! 🥺',
      pet_status_purring: 'Мурчит от радости! 💖',
      pet_status_happy: 'В хорошем настроении 🐾',
      pet_status_lonely: 'Скучает без внимания 😿',
      pet_status_sleep_sound: 'Хррр-пссс... 💤',
      pet_treat_brown_title: 'Коричневый камушек',
      pet_treat_golden_title: 'Золотое лакомство',
      pet_treat_count: 'В запасе: {count} шт.',
      pet_earning_hint: '💡 Выполняйте дела в блокноте, чтобы получать маленькие коричневые камушки 🟤 (+10 XP). За важные дела дня даются золотые консервы 🥫 (+30 XP)!',
      pet_btn_return: '🐾 Вернуться к делам',
      pet_no_brown_treats: 'Нет коричневых камушков! Выполняйте дела в блокноте, чтобы заработать 🟤',
      pet_no_golden_treats: 'Нет золотых консервов! Закрывайте важные дела дня, чтобы заработать 🥫',
      pet_level_up: '🎉 Уровень дружбы повышен: {name} теперь {level} уровня!',
      app_version_footer: 'Plan4U • Версия 0.1.0'
    },

    // ==========================================
    // 🇺🇦 УКРАЇНСЬКА (UKRAINIAN)
    // ==========================================
    uk: {
      code: 'УК',
      name: 'Українська',
      flag: '🇺🇦',
      locale: 'uk-UA',

      // Calendar & Date Formatting
      monthsGenitive: ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'],
      monthsNominative: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
      weekdays: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'],
      weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
      today: 'Сьогодні',
      selectedDay: 'Обраний день',

      // Header Widgets & Tooltips
      tooltip_date: 'Календар блокнота',
      tooltip_timer: 'Завантаженість за день (з 16 год)',
      tooltip_streak: 'Серія днів',
      tooltip_trophy: 'Досягнення',
      tooltip_settings: 'Налаштування',
      workload_toast: 'Завантаженість за день: {val} з 16 годин',
      streak_toast: '🔥 Безперервна серія: {days} {daysWord}! (Рекорд: {record})',

      // System Notebook Tabs
      tab_todo: 'Що\nзробити?',
      tab_buy: 'Що\nкупити?',
      tab_watch: 'Що\nподивитись?',

      // Standard Sections (Todo Tab)
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
      empty_list: 'Список порожній',
      empty_list_hint: 'Натисніть у рядок розділу, щоб додати справу',

      // Day Periods
      period_morning: 'Ранок',
      period_day: 'День',
      period_evening: 'Вечір',
      period_free: 'У вільний час',

      // Watch Tab Specifics
      watch_movies: '🎬 Фільми',
      watch_series: '📺 Серіали',
      watch_archive: '🎬 Архів переглянутого ({count})',

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

      // Section Actions Menu
      sec_menu_title: 'Керування блоком',
      sec_menu_rename: 'Перейменувати блок',
      sec_menu_move_up: 'Перемістити вище',
      sec_menu_move_down: 'Перемістити нижче',
      sec_menu_delete: 'Видалити блок',

      // New Section Modal
      new_section_title: 'Новий блок (розділ)',
      new_section_name_label: 'Назва блоку',
      new_section_name_ph: 'Наприклад: Вечірні справи',
      new_section_icon_label: 'Іконка блоку',
      new_section_submit: 'Створити блок',

      // Modals General
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

      // Form Fields
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

      // Settings Modal
      settings_title: '⚙️ Налаштування',
      settings_language: 'Мова додатку',
      settings_language_desc: 'Інтерфейс і дати вибраною мовою',
      settings_theme: 'Тема оформлення',
      theme_light: '☀️ Світла',
      theme_dark: '🌙 Темна',
      theme_auto: '⚙️ Авто',
      settings_accent: 'Колір акценту',
      accent_disabled_hint: '(недоступно в темній темі)',
      theme_accent_chocolate: 'Шоколадний',
      theme_accent_coffee: 'Кавовий',
      theme_accent_swamp: 'Болотний',
      theme_accent_khaki_moss: 'Хакі-болото',
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

      // Achievements Modal
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

      // Confirm Delete Modal
      confirm_delete_tab_title: 'Видалити вкладку?',
      confirm_delete_tab_msg: 'Ви впевнені, що хочете видалити створену вкладку «{title}» та всі її завдання? Цю дію не можна буде скасувати.',
      confirm_delete_tab_btn: 'Так, видалити',
      confirm_delete_section_title: 'Видалити блок?',
      confirm_delete_section_msg: 'Ви впевнені, що хочете видалити блок «{title}» та всі завдання всередині нього? Цю дію не можна скасувати.',
      confirm_delete_section_btn: 'Так, видалити блок',

      // Calendar Modal
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
      toast_section_created: 'Блок успішно створено',
      toast_section_deleted: 'Блок видалено',
      toast_section_renamed: 'Блок перейменовано',
      toast_backup_exported: 'Файл бекапу успішно завантажено',
      toast_backup_imported: 'Дані успішно відновлено з бекапу',
      toast_cloud_synced: 'Синхронізацію успішно завершено',
      toast_notif_test_sent: 'Тестове сповіщення надіслано!',
      toast_notif_denied: 'Сповіщення заблоковано в налаштуваннях пристрою',

      // Stickers Drawer & Context Menu
      stickers_title: '✨ Стікери та декор',
      stickers_hint: 'Перетягніть на аркуш або натисніть для додавання',
      cat_fall: '🍂 Осінь',
      cat_cats: '🐱 Коти',
      cat_more_cats: '🐾 Ще коти',
      cat_flora: '🍄 Флора',
      cat_fauna: '🐝 Фауна',
      cat_ocean: '🌊 Океан',
      cat_pigs: '🐹 Свинки',
      cat_food: '🍔 Їжа',
      cat_sweets: '🍰 Солодощі',
      cat_reptiles: '🐸 Рептилії',
      toast_sticker_added: 'Стікер прикріплено до аркуша ✨',
      toast_sticker_deleted: 'Стікер видалено',
      toast_sticker_archive_day: 'Не можна додавати стікери в минулі дні (архів)',
      btn_stk_rotate: 'Повернути на 15°',
      btn_stk_bigger: 'Збільшити',
      btn_stk_smaller: 'Зменшити',
      btn_stk_delete: 'Видалити стікер',

      // Maine Coon Tamagotchi Companion
      pet_default_name: 'Мейні',
      pet_level_badge: 'Рів. {level}',
      pet_rename_title: 'Перейменувати улюбленця',
      pet_rename_prompt: 'Введіть ім\'я для вашого котика-мейнкуна:',
      pet_coat_colors_title: '🎨 Справжні забарвлення',
      pet_color_ginger: 'Рудий таббі 🦁',
      pet_color_white: 'Білосніжний ❄️',
      pet_color_tiger: 'Тигровий 🐯',
      pet_color_silver: 'Сріблястий 🐺',
      pet_color_midnight: 'Вугільний 🌙',
      pet_color_cream: 'Кремовий 🍑',
      pet_color_mocha: 'Шоколадний ☕',
      pet_color_siamese: 'Колор-пойнт 🐾',
      pet_color_calico: 'Триколірний 🎨',
      pet_tap_hint: '✨ Погладьте Мейнкуна пальцем, щоб він замуркотів',
      pet_stat_satiety: 'Ситість:',
      pet_stat_happiness: 'Щастя:',
      pet_status_sleeping: 'Спить клубочком... 💤',
      pet_status_full: 'Ситий і задоволений 😋',
      pet_status_hungry_mild: 'Не відмовиться від камінчика 🟤',
      pet_status_hungry_severe: 'Дуже зголоднів! 🥺',
      pet_status_purring: 'Муркоче від щастя! 💖',
      pet_status_happy: 'У чудовому настрої 🐾',
      pet_status_lonely: 'Сумує без уваги 😿',
      pet_status_sleep_sound: 'Хррр-пссс... 💤',
      pet_treat_brown_title: 'Коричневий камінчик',
      pet_treat_golden_title: 'Золоті ласощі',
      pet_treat_count: 'У запасі: {count} шт.',
      pet_earning_hint: '💡 Виконуйте справи в блокноті, щоб отримувати маленькі коричневі камінчики 🟤 (+10 XP). За головні справи дня даються золоті консерви 🥫 (+30 XP)!',
      pet_btn_return: '🐾 Повернутися до справ',
      pet_no_brown_treats: 'Немає коричневих камінчиків! Виконуйте справи в блокноті, щоб заробити 🟤',
      pet_no_golden_treats: 'Немає золотих консервів! Закривайте важливі справи дня, щоб заробити 🥫',
      pet_level_up: '🎉 Рівень дружби підвищено: {name} тепер {level} рівня!',
      app_version_footer: 'Plan4U • Версія 0.1.0'
    },

    // ==========================================
    // 🇬🇧 ENGLISH
    // ==========================================
    en: {
      code: 'EN',
      name: 'English',
      flag: '🇬🇧',
      locale: 'en-US',

      // Calendar & Date Formatting
      monthsGenitive: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsNominative: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      today: 'Today',
      selectedDay: 'Selected day',

      // Header Widgets & Tooltips
      tooltip_date: 'Notebook Calendar',
      tooltip_timer: 'Daily workload (out of 16h)',
      tooltip_streak: 'Daily Streak',
      tooltip_trophy: 'Achievements',
      tooltip_settings: 'Settings',
      workload_toast: 'Daily workload: {val} of 16 hours',
      streak_toast: '🔥 Consecutive streak: {days} {daysWord}! (Best: {record})',

      // System Notebook Tabs
      tab_todo: 'To\nDo?',
      tab_buy: 'To\nBuy?',
      tab_watch: 'To\nWatch?',

      // Standard Sections (Todo Tab)
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
      empty_list: 'List is empty',
      empty_list_hint: 'Click on a section line to add a task',

      // Day Periods
      period_morning: 'Morning',
      period_day: 'Day',
      period_evening: 'Evening',
      period_free: 'Free time',

      // Watch Tab Specifics
      watch_movies: '🎬 Movies',
      watch_series: '📺 TV Series',
      watch_archive: '🎬 Watched Archive ({count})',

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

      // Section Actions Menu
      sec_menu_title: 'Block Options',
      sec_menu_rename: 'Rename Block',
      sec_menu_move_up: 'Move Up',
      sec_menu_move_down: 'Move Down',
      sec_menu_delete: 'Delete Block',

      // New Section Modal
      new_section_title: 'New Section Block',
      new_section_name_label: 'Block Title',
      new_section_name_ph: 'e.g.: Evening tasks',
      new_section_icon_label: 'Block Icon',
      new_section_submit: 'Create Block',

      // Modals General
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

      // Form Fields
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

      // Settings Modal
      settings_title: '⚙️ Settings',
      settings_language: 'Application Language',
      settings_language_desc: 'Interface & dates in selected language',
      settings_theme: 'Theme',
      theme_light: '☀️ Light',
      theme_dark: '🌙 Dark',
      theme_auto: '⚙️ Auto',
      settings_accent: 'Accent Color',
      accent_disabled_hint: '(inactive in dark theme)',
      theme_accent_chocolate: 'Chocolate',
      theme_accent_coffee: 'Coffee',
      theme_accent_swamp: 'Swamp Marsh',
      theme_accent_khaki_moss: 'Khaki Moss',
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

      // Achievements Modal
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

      // Confirm Delete Modal
      confirm_delete_tab_title: 'Delete tab?',
      confirm_delete_tab_msg: 'Are you sure you want to delete custom tab «{title}» and all its tasks? This action cannot be undone.',
      confirm_delete_tab_btn: 'Yes, delete',
      confirm_delete_section_title: 'Delete block?',
      confirm_delete_section_msg: 'Are you sure you want to delete block «{title}» and all its tasks? This action cannot be undone.',
      confirm_delete_section_btn: 'Yes, delete block',

      // Calendar Modal
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
      toast_section_created: 'Block created successfully',
      toast_section_deleted: 'Block deleted',
      toast_section_renamed: 'Block renamed',
      toast_backup_exported: 'Backup file successfully downloaded',
      toast_backup_imported: 'Data restored successfully from backup',
      toast_cloud_synced: 'Sync completed successfully',
      toast_notif_test_sent: 'Test notification sent!',
      toast_notif_denied: 'Notifications are blocked in device settings',

      // Stickers Drawer & Context Menu
      stickers_title: '✨ Stickers & Decor',
      stickers_hint: 'Drag onto page or tap to place',
      cat_fall: '🍂 Fall',
      cat_cats: '🐱 Cats',
      cat_more_cats: '🐾 More Cats',
      cat_flora: '🍄 Flora',
      cat_fauna: '🐝 Fauna',
      cat_ocean: '🌊 Ocean',
      cat_pigs: '🐹 Guinea Pigs',
      cat_food: '🍔 Food',
      cat_sweets: '🍰 Sweets',
      cat_reptiles: '🐸 Reptiles',
      toast_sticker_added: 'Sticker placed on page ✨',
      toast_sticker_deleted: 'Sticker removed',
      toast_sticker_archive_day: 'Cannot place stickers on past archive days',
      btn_stk_rotate: 'Rotate by 15°',
      btn_stk_bigger: 'Enlarge',
      btn_stk_smaller: 'Shrink',
      btn_stk_delete: 'Delete sticker',

      // Maine Coon Tamagotchi Companion
      pet_default_name: 'Mainey',
      pet_level_badge: 'Lvl. {level}',
      pet_rename_title: 'Rename Pet',
      pet_rename_prompt: 'Enter a name for your Maine Coon kitten:',
      pet_coat_colors_title: '🎨 Authentic Coat Colors',
      pet_color_ginger: 'Ginger Tabby 🦁',
      pet_color_white: 'Snow White ❄️',
      pet_color_tiger: 'Tiger Stripe 🐯',
      pet_color_silver: 'Silver Wolf 🐺',
      pet_color_midnight: 'Midnight Coal 🌙',
      pet_color_cream: 'Peach Cream 🍑',
      pet_color_mocha: 'Mocha Chocolate ☕',
      pet_color_siamese: 'Color-Point 🐾',
      pet_color_calico: 'Calico Tri-Color 🎨',
      pet_tap_hint: '✨ Pet your Maine Coon with finger to hear it purr',
      pet_stat_satiety: 'Satiety:',
      pet_stat_happiness: 'Happiness:',
      pet_status_sleeping: 'Sleeping curled up... 💤',
      pet_status_full: 'Well-fed & contented 😋',
      pet_status_hungry_mild: 'Wouldn\'t mind a pebble 🟤',
      pet_status_hungry_severe: 'Starving hungry! 🥺',
      pet_status_purring: 'Purring with joy! 💖',
      pet_status_happy: 'In great spirits 🐾',
      pet_status_lonely: 'Feeling lonely 😿',
      pet_status_sleep_sound: 'Zzz-purrr... 💤',
      pet_treat_brown_title: 'Brown Pebble',
      pet_treat_golden_title: 'Golden Canned Gourmet',
      pet_treat_count: 'In stock: {count} pcs',
      pet_earning_hint: '💡 Complete tasks in your notebook to earn brown pebbles 🟤 (+10 XP). Important priorities grant golden canned treats 🥫 (+30 XP)!',
      pet_btn_return: '🐾 Return to tasks',
      pet_no_brown_treats: 'Out of brown pebbles! Complete tasks in notebook to earn 🟤',
      pet_no_golden_treats: 'Out of golden canned treats! Complete priority tasks to earn 🥫',
      pet_level_up: '🎉 Friendship level increased: {name} is now level {level}!',
      app_version_footer: 'Plan4U • Version 0.1.0'
    }
  };

  /**
   * Plan4U Internationalization Engine (Public API)
   */
  const Plan4UI18n = {
    I18N,

    /**
     * Translate key with optional parameter replacement and language fallback
     */
    t(key, params = {}, lang = 'ru') {
      const dict = I18N[lang] || I18N.ru || {};
      let str = dict[key];
      if (str === undefined && I18N.ru) {
        str = I18N.ru[key];
      }
      if (str === undefined) {
        return key;
      }
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(p => {
          str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
        });
      }
      return str;
    },

    /**
     * Auto-detect system language with device-level priority:
     * 1. Saved user preference from localStorage / Plan4UStorage
     * 2. Device/Browser system languages (navigator.languages / navigator.language)
     * 3. Fallback: Ukrainian for 'uk', Russian for 'ru'/'be'/'kk', English for everything else
     */
    detectSystemLanguage() {
      try {
        const raw = localStorage.getItem('todo_notebook_app_settings');
        if (raw) {
          const s = JSON.parse(raw);
          if (s.lang && I18N[s.lang]) return s.lang;
        }
      } catch (e) { }

      // Read browser/system languages list
      const navLangs = (typeof navigator !== 'undefined' && Array.isArray(navigator.languages) && navigator.languages.length > 0)
        ? navigator.languages
        : [typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || 'en') : 'en'];

      for (const rawLang of navLangs) {
        if (!rawLang || typeof rawLang !== 'string') continue;
        const l = rawLang.toLowerCase();
        if (l.startsWith('uk')) return 'uk';
        if (l.startsWith('ru') || l.startsWith('be') || l.startsWith('kk')) return 'ru';
        if (l.startsWith('en')) return 'en';
      }

      // Default fallback for any other international device locale: English
      return 'en';
    },

    /**
     * Register a new language pack at runtime (e.g. 'de', 'fr', 'es', 'pl')
     */
    registerLanguage(code, dictionary) {
      if (!code || !dictionary) return false;
      I18N[code] = Object.assign({}, I18N.en || I18N.ru || {}, dictionary);
      return true;
    },

    /**
     * Get list of supported languages
     */
    getSupportedLanguages() {
      return Object.keys(I18N).map(code => ({
        code,
        short: I18N[code].code || code.toUpperCase(),
        name: I18N[code].name || code,
        flag: I18N[code].flag || '🌐'
      }));
    }
  };

  // Universal Export (Browser window or Node environment)
  if (typeof window !== 'undefined') {
    window.I18N = I18N;
    window.Plan4UI18n = Plan4UI18n;
    window.detectSystemLanguage = Plan4UI18n.detectSystemLanguage;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18N, Plan4UI18n };
  }
})();
