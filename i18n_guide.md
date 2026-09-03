# Инструкция по работе с системой интернационализации (i18n) Plan4U

Данный документ описывает архитектуру мультиязычности приложения **Plan4U**, правила использования переводов и пошаговый алгоритм добавления новых языков.

---

## 1. Архитектура системы

Вся языковая подсистема вынесена в отдельный модуль [i18n.js](file:///c:/Users/valer/Desktop/ToDoLercha/i18n.js) и предоставляет глобальный объект `window.Plan4UI18n` с методами:
- `Plan4UI18n.t(key, params, lang)`: получение перевода по ключу с автоматической подстановкой параметров вида `{name}` и каскадным фолбэком на язык по умолчанию (`ru`).
- `Plan4UI18n.detectSystemLanguage()`: автоопределение языка устройства (украинский для `uk`, русский для `ru`/`be`/`kk`, английский `en` для всех остальных).
- `Plan4UI18n.registerLanguage(code, dictionary)`: регистрация нового языкового пакета в рантайме.
- `Plan4UI18n.getSupportedLanguages()`: получение списка активных локалей с флагами и кодами.

### Порядок инициализации в браузере:
1. В `index.html` перед `app.js` загружается `<script src="i18n.js"></script>`.
2. Модуль `i18n.js` инициализирует `window.I18N` и `window.Plan4UI18n`.
3. При старте `NotebookApp`:
   - Считывается язык из сохранённых настроек (`todo_notebook_app_settings`).
   - Если настройки ещё не сохранялись (первый запуск), вызывается `detectSystemLanguage()`, который автоматически выбирает системный язык устройства.
   - Метод `app.applyLanguage(lang)` переводит всю разметку DOM, обновляет системные вкладки, календарь, стикеры и тексты котика.

---

## 2. Использование переводов в коде

### В HTML разметке (`index.html`)

Для автоматического перевода элементов используются специальные HTML-атрибуты:
- `data-i18n="ключ"`: переводит текстовое содержимое элемента (`textContent`).
  ```html
  <span data-i18n="section_spiritual">🕊️ Духовные дела</span>
  ```
- `data-i18n-placeholder="ключ"`: переводит плейсхолдер текстовых полей ввода (`placeholder`).
  ```html
  <input type="text" placeholder="..." data-i18n-placeholder="inline_input_placeholder" />
  ```
- `data-i18n-title="ключ"`: переводит всплывающую подсказку элемента (`title`).
  ```html
  <button type="button" title="..." data-i18n-title="btn_stk_rotate">...</button>
  ```

### В JavaScript логике (`app.js`)

Для перевода динамических строк (всплывающие тосты, диалоги подтверждения, системные уведомления) используется метод экземпляра приложения `this.t(key, params)`:
```javascript
// Простой перевод
this.showToast(this.t('toast_entry_updated'), '✓');

// Перевод с подстановкой параметров
this.showToast(this.t('toast_task_deferred', { date: formattedDate }), '📅');
```

---

## 3. Как добавить новый язык в приложение (пошаговая инструкция)

Допустим, необходимо добавить поддержку **немецкого языка (`de`)** или **испанского (`es`)**. Для этого требуется выполнить 4 простых шага:

### Шаг 1: Добавить словарь в `i18n.js`
Откройте [i18n.js](file:///c:/Users/valer/Desktop/ToDoLercha/i18n.js) и добавьте секцию для нового языка внутри объекта `I18N`:
```javascript
de: {
  code: 'DE',
  name: 'Deutsch',
  flag: '🇩🇪',
  locale: 'de-DE',
  monthsGenitive: ['Januar', 'Februar', 'März', ...],
  monthsNominative: ['Januar', 'Februar', 'März', ...],
  weekdays: ['Sonntag', 'Montag', 'Dienstag', ...],
  weekdaysShort: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  today: 'Heute',
  selectedDay: 'Ausgewählter Tag',
  // Скопируйте все 203 ключа из английского или русского словаря и переведите
  ...
}
```

### Шаг 2: Добавить кнопку в выпадающее меню выбора языка в `index.html`
В [index.html](file:///c:/Users/valer/Desktop/ToDoLercha/index.html) внутри `#langDropdownMenu` добавьте кнопку нового языка:
```html
<button type="button" class="lang-dropdown-opt" data-lang="de">
  <span class="lang-flag">🇩🇪</span>
  <span class="lang-name">Deutsch</span>
  <span class="lang-code-tag">DE</span>
  <span class="lang-check-icon">✓</span>
</button>
```

### Шаг 3: Обновить проверку системного языка (опционально)
В функции `detectSystemLanguage()` в [i18n.js](file:///c:/Users/valer/Desktop/ToDoLercha/i18n.js) добавьте проверку префикса:
```javascript
if (l.startsWith('de')) return 'de';
```

### Шаг 4: Проверить целостность словаря
Запустите проверочную команду в терминале:
```powershell
node -e "const fs = require('fs'); const code = fs.readFileSync('i18n.js', 'utf8'); const window = {}; eval(code); const { ru, de } = window.I18N; const missing = Object.keys(ru).filter(k => !de[k]); console.log('Missing in DE:', missing);"
```
Если массив `missing` пуст — язык интегрирован на 100%!

---

## 4. Памятка по структуре ключей словаря

| Категория | Префикс ключей | Пример |
|---|---|---|
| Месяцы и дни недели | `monthsGenitive`, `weekdays` | `monthsGenitive[0]`, `weekdaysShort[1]` |
| Виджеты шапки | `tooltip_*`, `*_toast` | `tooltip_date`, `workload_toast` |
| Системные вкладки | `tab_*` | `tab_todo`, `tab_buy`, `tab_watch` |
| Блоки и разделы дня | `section_*`, `period_*` | `section_spiritual`, `period_morning` |
| Приоритеты | `priority_*` | `priority_normal`, `priority_important` |
| Модальные окна | `modal_*`, `btn_*` | `modal_new_entry`, `btn_save` |
| Окно настроек | `settings_*`, `theme_*`, `notif_*` | `settings_theme`, `notif_morning_desc` |
| Достижения | `ach_*`, `achievements_*` | `ach_filter_streaks`, `ach_completed_text` |
| Категории стикеров | `cat_*` | `cat_fall`, `cat_food`, `cat_sweets`, `cat_reptiles` |
| Питомец Мейн-кун | `pet_*` | `pet_stat_satiety`, `pet_treat_brown_title`, `pet_btn_return` |
| Окрасы котика | `pet_color_*` | `pet_color_ginger`, `pet_color_calico` |
| Системные оповещения | `toast_*` | `toast_task_deferred`, `toast_lang_changed` |

---

## 5. Синхронизация и сборка

При любом обновлении текстов в `i18n.js` или логики в `app.js`:
1. Повысить версию кэша в `sw.js` (например, `todo-notebook-v0.0.93`).
2. Скопировать изменённые файлы в папку `www/`:
   ```powershell
   Copy-Item -Path 'i18n.js', 'index.html', 'app.js', 'sw.js', 'package.json' -Destination 'www\' -Force
   ```
3. Выполнить синхронизацию нативного Android проекта:
   ```powershell
   npx cap sync android
   ```
