/**
 * ToDo Notebook Application Logic
 */

// Initial Seed Tabs
const INITIAL_TABS = [
  { id: 'todo', title: 'Что\nсделать?' },
  { id: 'buy', title: 'Что\nкупить?' },
  { id: 'watch', title: 'Что\nпосмотреть?' }
];

// Initial Seed Tasks matching clean lined notebook
const INITIAL_TASKS = {
  todo: [
    { id: '1', period: 'УТРО', text: 'Принять лекарства (вопрос жизни и смерти)', completed: false },
    { id: '2', period: 'УТРО', text: 'Завтрак и кофе', completed: false },
    { id: '3', period: 'ДЕНЬ', text: 'Сдать отчет (очень важно)', completed: false },
    { id: '4', period: 'ДЕНЬ', text: 'Рабочий созвон', completed: false },
    { id: '5', period: 'ВЕЧЕР', text: 'Прогулка в парке', completed: false },
  ],
  buy: [
    { id: '6', text: 'Свежий хлеб и круассаны', completed: false },
    { id: '7', text: 'Кофе в зернах', completed: false },
    { id: '8', text: 'Фрукты и ягоды', completed: false },
  ],
  watch: [
    { id: '9', text: 'Интерстеллар', completed: false },
    { id: '10', text: 'Новая серия сериала', completed: false },
  ]
};

const PERIODS_TODO = ['УТРО', 'ДЕНЬ', 'ВЕЧЕР', 'В СВОБОДНОЕ ВРЕМЯ'];

const DURATION_OPTIONS = [
  '10 минут',
  '15 минут',
  '20 минут',
  '30 минут',
  '1 час',
  '2 часа',
  '3 часа',
  'целый день',
  'не важно'
];

const PRIORITIES = [
  { id: 'спокойно', label: 'Спокойно', class: 'p-calm', icon: '🌿' },
  { id: 'в течении дня', label: 'В течении дня', class: 'p-day', icon: '⏳' },
  { id: 'очень важно', label: 'Очень важно', class: 'p-important', icon: '⚡' },
  { id: 'вопрос жизни и смерти', label: 'Жизнь и смерть', class: 'p-urgent', icon: '🔥' }
];

class NotebookApp {
  constructor() {
    this.tabs = this.loadTabs();
    this.currentTab = this.tabs.length > 0 ? this.tabs[0].id : 'todo';
    this.tasks = this.loadTasks();
    this.tempPhotoData = null;

    this.initElements();
    this.initEventListeners();
    this.initDragToScroll();
    this.renderTabs();
    this.render();
  }

  // Load tabs from LocalStorage
  loadTabs() {
    try {
      const saved = localStorage.getItem('todo_notebook_tab_list');
      if (saved) {
        return JSON.parse(saved);
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

  // Load tasks from LocalStorage
  loadTasks() {
    try {
      const saved = localStorage.getItem('todo_notebook_tasks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load tasks:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_TASKS));
  }

  // Save tasks to LocalStorage
  saveTasks() {
    try {
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

    // Lightbox
    this.imageLightboxBackdrop = document.getElementById('imageLightboxBackdrop');
    this.lightboxImg = document.getElementById('lightboxImg');
    this.lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

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

    // Widgets
    this.widgetDate.addEventListener('click', () => {
      const now = new Date();
      const options = { weekday: 'short', day: 'numeric', month: 'long' };
      alert(`Сегодня: ${now.toLocaleDateString('ru-RU', options)}`);
    });

    this.widgetTimer.addEventListener('click', () => {
      alert('Таймер продуктивности: 5 часов 30 минут сегодня');
    });

    this.widgetStreak.addEventListener('click', () => {
      alert('Огонь! Вы продуктивны 15 дней подряд! 🔥');
    });

    this.widgetMedal.addEventListener('click', () => {
      alert('Достижение: "Мастер продуктивности" (все задачи закрыты)');
    });

    this.widgetSettings.addEventListener('click', () => {
      if (confirm('Сбросить все задачи и вкладки к начальному виду?')) {
        this.tabs = JSON.parse(JSON.stringify(INITIAL_TABS));
        this.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
        this.currentTab = 'todo';
        this.saveTabs();
        this.saveTasks();
        this.renderTabs();
        this.render();
      }
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

  // Render Tabs
  renderTabs() {
    this.folderTabsBar.innerHTML = '';

    this.tabs.forEach(tab => {
      const isActive = tab.id === this.currentTab;
      const taskCount = (this.tasks[tab.id] || []).filter(t => !t.completed).length;

      const tabBtn = document.createElement('button');
      tabBtn.className = `folder-tab ${isActive ? 'active' : ''}`;
      tabBtn.setAttribute('role', 'tab');
      tabBtn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tabBtn.setAttribute('data-tab', tab.id);

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

      tabBtn.addEventListener('click', () => {
        this.switchTab(tab.id);
      });

      this.folderTabsBar.appendChild(tabBtn);
    });
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

    this.closeNewTabModal();
    this.switchTab(tabId);

    setTimeout(() => {
      this.folderTabsBar.scrollTo({ left: this.folderTabsBar.scrollWidth, behavior: 'smooth' });
    }, 100);
  }

  // Toggle Task Completion
  toggleTask(taskId) {
    const tabTasks = this.tasks[this.currentTab];
    if (!tabTasks) return;
    
    const task = tabTasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
      this.renderTabs();
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
    }
  }

  // Open Task Modal with interactive fields matching current active tab
  openTaskModal() {
    this.tempPhotoData = null;
    this.renderDynamicForm(this.currentTab);
    
    this.taskModalBackdrop.classList.add('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'false');

    const firstInput = this.dynamicFormFields.querySelector('input[type="text"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 150);
    }
  }

  // Close Task Modal
  closeTaskModal() {
    this.taskModalBackdrop.classList.remove('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'true');
    this.tempPhotoData = null;
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
    const renderPrioritySelector = (defaultVal = 'спокойно') => `
      <div class="form-group">
        <label>Приоритет</label>
        <div class="priority-selector" id="prioritySelectorGroup">
          ${PRIORITIES.map(p => `
            <label class="priority-chip ${p.class} ${p.id === defaultVal ? 'selected' : ''}">
              <input type="radio" name="taskPriority" value="${p.id}" ${p.id === defaultVal ? 'checked' : ''}>
              <span class="p-indicator"></span>
              <span>${p.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;

    // Extra info section
    const renderExtraSection = () => `
      <div class="extra-details-card">
        <div class="extra-details-header">
          <span>📝 Дополнительная информация</span>
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
          <textarea id="taskExtraNotes" placeholder="Дописать заметку или подробности..."></textarea>
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
          <input type="url" id="taskLinkInput" placeholder="🔗 Вставить ссылку (например https://...)" autocomplete="off">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="margin-bottom: 4px;">Прикрепить фото:</label>
          <div class="photo-uploader-area">
            <label class="btn-upload-file">
              <span>📷 Выбрать файл</span>
              <input type="file" id="taskPhotoFileInput" accept="image/*" style="display: none;">
            </label>
            <div id="photoPreviewContainer" style="display: ${this.tempPhotoData ? 'block' : 'none'};">
              <div class="photo-preview-wrap">
                <img id="photoPreviewImg" class="photo-preview-img" src="${this.tempPhotoData || ''}" alt="Превью" />
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
          <label for="taskTextInput">Текст задачи *</label>
          <input type="text" id="taskTextInput" placeholder="Например: Прогулка в парке" required autocomplete="off">
        </div>

        ${renderPrioritySelector('спокойно')}

        <div class="form-group">
          <label for="taskPeriodSelect">Когда делать</label>
          <select id="taskPeriodSelect">
            <option value="УТРО">Утро</option>
            <option value="ДЕНЬ">День</option>
            <option value="ВЕЧЕР">Вечер</option>
            <option value="В СВОБОДНОЕ ВРЕМЯ">В свободное время</option>
          </select>
        </div>

        <div class="form-group">
          <label for="taskDurationSelect">Длительность задачи</label>
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
          <label for="taskTextInput">Название покупки *</label>
          <input type="text" id="taskTextInput" placeholder="Например: Кофе в зернах" required autocomplete="off">
        </div>

        <div class="form-group">
          <label for="taskBuyPlaceInput">Место, где купить</label>
          <input type="text" id="taskBuyPlaceInput" placeholder="Например: Супермаркет, Аптека, WB..." autocomplete="off">
        </div>

        ${renderPrioritySelector('спокойно')}

        ${renderExtraSection()}
      `;
    } else if (tabId === 'watch') {
      // 3) "Что посмотреть?"
      html = `
        <div class="form-group">
          <label for="taskTextInput">Название фильма / сериала *</label>
          <input type="text" id="taskTextInput" placeholder="Например: Интерстеллар" required autocomplete="off">
        </div>

        <div class="form-group">
          <label>Тип</label>
          <div class="segmented-control" id="watchTypeControl">
            <button type="button" class="segmented-btn active" data-type="Фильм">🎬 Фильм</button>
            <button type="button" class="segmented-btn" data-type="Сериал">📺 Сериал</button>
          </div>
          <input type="hidden" id="watchTypeInput" value="Фильм">
        </div>

        ${renderPrioritySelector('спокойно')}
      `;
    } else {
      // 4) Любая новая вкладка
      html = `
        <div class="form-group">
          <label for="taskTextInput">Название задачи / записи *</label>
          <input type="text" id="taskTextInput" placeholder="Например: Новая идея..." required autocomplete="off">
        </div>

        ${renderPrioritySelector('спокойно')}

        ${renderExtraSection()}
      `;
    }

    this.dynamicFormFields.innerHTML = html;

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
      photoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            this.tempPhotoData = event.target.result;
            if (previewImg) previewImg.src = this.tempPhotoData;
            if (previewContainer) previewContainer.style.display = 'block';
          };
          reader.readAsDataURL(file);
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

  // Handle Add Task
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

    const newTask = {
      id: Date.now().toString(),
      text: text,
      completed: false
    };

    // Period for 'todo'
    if (targetTab === 'todo') {
      const periodSelect = this.dynamicFormFields.querySelector('#taskPeriodSelect');
      newTask.period = periodSelect ? periodSelect.value : 'УТРО';
    }

    if (!this.tasks[targetTab]) {
      this.tasks[targetTab] = [];
    }

    this.tasks[targetTab].push(newTask);
    this.saveTasks();

    this.render();
    this.renderTabs();

    this.closeTaskModal();
  }

  // Render Notebook Content
  render() {
    const currentTasks = this.tasks[this.currentTab] || [];
    let html = '';

    if (currentTasks.length === 0) {
      html += `
        <div class="section-header-row">
          <span class="section-header-text">СПИСОК ПУСТ</span>
        </div>
        <div class="task-row">
          <div class="task-text" style="color: #8c919c; font-weight: normal; font-style: italic;">
            Нажмите «+» внизу, чтобы добавить запись
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

      PERIODS_TODO.forEach(period => {
        const tasksInPeriod = grouped[period];
        if (tasksInPeriod && tasksInPeriod.length > 0) {
          html += `
            <div class="section-header-row">
              <span class="section-header-text">${period}</span>
            </div>
          `;
          tasksInPeriod.forEach(task => {
            html += this.renderTaskRow(task);
          });
        }
      });

    } else {
      // Other Tabs (Что купить, Что посмотреть, Новые вкладки)
      currentTasks.forEach(task => {
        html += this.renderTaskRow(task);
      });
    }

    this.contentContainer.innerHTML = html;

    // Attach click events
    const rows = this.contentContainer.querySelectorAll('.task-row[data-id]');
    rows.forEach(row => {
      const taskId = row.dataset.id;
      
      row.addEventListener('click', (e) => {
        if (e.target.closest('.task-delete-btn')) return;
        this.toggleTask(taskId);
      });

      const delBtn = row.querySelector('.task-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => this.deleteTask(taskId, e));
      }
    });
  }

  // Render individual task row HTML - Clean single notebook line
  renderTaskRow(task) {
    return `
      <div class="task-row ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-checkbox-container">
          <div class="task-checkbox" role="checkbox" aria-checked="${task.completed}"></div>
        </div>
        <div class="task-text">${this.escapeHtml(task.text)}</div>
        <button class="task-delete-btn" title="Удалить запись" aria-label="Удалить">&times;</button>
      </div>
    `;
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
