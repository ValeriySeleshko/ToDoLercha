/**
 * ToDo Notebook Application Logic with Scalable i18n
 */

// Detect user's system language (ru, uk, or en)
function detectSystemLanguage() {
  if (window.Plan4UI18n && typeof window.Plan4UI18n.detectSystemLanguage === 'function') {
    return window.Plan4UI18n.detectSystemLanguage();
  }
  try {
    const raw = localStorage.getItem('todo_notebook_app_settings');
    if (raw) {
      const s = JSON.parse(raw);
      if (s.lang) return s.lang;
    }
  } catch (e) { }

  const navLang = (typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || 'en') : 'en').toLowerCase();
  if (navLang.startsWith('uk')) return 'uk';
  if (navLang.startsWith('ru') || navLang.startsWith('be') || navLang.startsWith('kk')) return 'ru';
  return 'en';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

// Spectacular City Day Multi-Volley Pyrotechnic Salute (~10 choreographed bursts of varying power, height, and beauty)
function launchConfetti() {
  try {
    // Clear any existing active firework timeouts
    if (window._confettiTimeouts && Array.isArray(window._confettiTimeouts)) {
      window._confettiTimeouts.forEach(t => clearTimeout(t));
    }
    window._confettiTimeouts = [];

    let canvas = document.getElementById('confettiCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'confettiCanvas';
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999999;';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const particles = [];
    const flashes = [];
    let isRunning = true;

    // Rich Festive Color Palettes for varied pyrotechnic flowers
    const PALETTES = {
      rubyMagenta: ['#FF007F', '#FF4D80', '#F72585', '#B5179E', '#FFB703', '#FFFFFF'],
      cyanEmerald: ['#00F5D4', '#06D6A0', '#00BBF9', '#48CAE4', '#90E0EF', '#FFFFFF'],
      goldImperial: ['#FFD700', '#FFC300', '#FFAA00', '#FFE600', '#FFF3B0', '#FFFFFF', '#FFB703'],
      sunsetFlame: ['#FF3366', '#FF6B6B', '#FF9E00', '#FFD000', '#FF5400', '#FFFFFF'],
      violetElectric: ['#7209B7', '#8338EC', '#3A0CA3', '#4CC9F0', '#F72585', '#E0AAFF'],
      grandFestival: ['#FF0055', '#00F5D4', '#FFD700', '#8338EC', '#06D6A0', '#FF9E00', '#4CC9F0', '#FFFFFF', '#FF3366']
    };

    // Helper: spawn one firework explosion burst
    function createBurst(cx, cy, count, palette, options = {}) {
      const spread = options.spread || 1;
      const baseSpeed = options.speed || 10;
      const isGoldenWillow = !!options.goldenWillow;

      // Radiant epicenter flash
      flashes.push({
        x: cx,
        y: cy,
        radius: 12,
        maxRadius: 70 * spread,
        alpha: 0.92,
        color: palette[0] || '#FFF'
      });

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.85 + 0.15) * baseSpeed * spread;
        const typeRoll = Math.random();
        let type = 'rect';
        if (typeRoll < 0.28) type = 'star';
        else if (typeRoll < 0.54) type = 'spark';
        else if (typeRoll < 0.76) type = 'ribbon';

        if (isGoldenWillow && Math.random() < 0.65) {
          type = 'spark';
        }

        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.86,
          gravity: isGoldenWillow ? 0.13 : (type === 'spark' ? 0.22 : 0.16),
          drag: isGoldenWillow ? 0.980 : (type === 'spark' ? 0.974 : 0.967),
          size: type === 'ribbon' ? (Math.random() * 9 + 8) : (type === 'spark' ? (Math.random() * 3 + 2.5) : (Math.random() * 6.5 + 5)),
          color: palette[Math.floor(Math.random() * palette.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.18,
          flip: Math.random() * Math.PI * 2,
          flipSpeed: Math.random() * 0.16 + 0.08,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.06 + 0.03,
          swayAmount: Math.random() * 0.4 + 0.2,
          type: type,
          opacity: 1,
          decay: isGoldenWillow ? (Math.random() * 0.0032 + 0.0025) : (Math.random() * 0.0045 + 0.0035),
          twinkleOffset: Math.random() * 10
        });
      }
    }

    // 5 to 10 Choreographed Volleys ("Как на день города" - разная высота, мощность и красота)
    const volleys = [
      // 1. Открытие - Средняя высота слева (Ruby Magenta)
      { delay: 0, x: 0.28, y: 0.38, count: 65, palette: PALETTES.rubyMagenta, speed: 9.5 },
      // 2. Высокий выстрел справа (Cyan Emerald)
      { delay: 380, x: 0.74, y: 0.24, count: 75, palette: PALETTES.cyanEmerald, speed: 10.5 },
      // 3. Золотой пион по центру (Imperial Gold)
      { delay: 820, x: 0.50, y: 0.42, count: 60, palette: PALETTES.goldImperial, speed: 8.5 },
      // 4. Высокий фиолетовый салют слева (Electric Violet)
      { delay: 1320, x: 0.18, y: 0.28, count: 70, palette: PALETTES.violetElectric, speed: 10 },
      // 5. Яркий залп на закатном пламени справа вверху (Sunset Flame)
      { delay: 1850, x: 0.82, y: 0.20, count: 75, palette: PALETTES.sunsetFlame, speed: 11 },
      // 6. Парный синхронный залп по флангам (Emerald + Magenta)
      { delay: 2450, x: 0.26, y: 0.32, count: 60, palette: PALETTES.cyanEmerald, speed: 9.5 },
      { delay: 2450, x: 0.74, y: 0.32, count: 60, palette: PALETTES.rubyMagenta, speed: 9.5 },
      // 7. «Золотая Ива» из самого зенита - медленно струящийся золотой дождь
      { delay: 3100, x: 0.50, y: 0.16, count: 90, palette: PALETTES.goldImperial, speed: 11.5, goldenWillow: true },
      // 8. Быстрый дуплет перед кульминацией
      { delay: 3700, x: 0.36, y: 0.26, count: 65, palette: PALETTES.sunsetFlame, speed: 10 },
      { delay: 3700, x: 0.64, y: 0.26, count: 65, palette: PALETTES.violetElectric, speed: 10 },
      // 9. ГРАНД-ФИНАЛ ДНЯ ГОРОДА! Мощный тройной взрыв на всё небо
      { delay: 4250, x: 0.50, y: 0.22, count: 130, palette: PALETTES.grandFestival, speed: 13.5, spread: 1.25 },
      { delay: 4250, x: 0.20, y: 0.34, count: 65, palette: PALETTES.goldImperial, speed: 10 },
      { delay: 4250, x: 0.80, y: 0.34, count: 65, palette: PALETTES.cyanEmerald, speed: 10 }
    ];

    volleys.forEach(v => {
      const timer = setTimeout(() => {
        if (!isRunning) return;
        w = window.innerWidth;
        h = window.innerHeight;
        createBurst(w * v.x, h * v.y, v.count, v.palette, {
          speed: v.speed,
          spread: v.spread || 1,
          goldenWillow: v.goldenWillow
        });
      }, v.delay);
      window._confettiTimeouts.push(timer);
    });

    if (window._confettiAnimId) cancelAnimationFrame(window._confettiAnimId);

    let frame = 0;
    const startTime = Date.now();

    function render() {
      const curW = window.innerWidth;
      const curH = window.innerHeight;
      if (canvas.width !== curW * dpr || canvas.height !== curH * dpr) {
        canvas.width = curW * dpr;
        canvas.height = curH * dpr;
        ctx.scale(dpr, dpr);
      }
      w = curW;
      h = curH;

      ctx.clearRect(0, 0, w, h);
      frame++;

      // Рендер вспышек детонации в эпицентрах
      for (let f = flashes.length - 1; f >= 0; f--) {
        const fl = flashes[f];
        fl.radius += (fl.maxRadius - fl.radius) * 0.28;
        fl.alpha -= 0.085;
        if (fl.alpha <= 0) {
          flashes.splice(f, 1);
          continue;
        }
        ctx.save();
        const grad = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, fl.radius);
        grad.addColorStop(0, 'rgba(255,255,255,' + (fl.alpha * 0.85) + ')');
        grad.addColorStop(0.35, fl.color);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, fl.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      let alive = 0;
      const pLen = particles.length;

      for (let i = 0; i < pLen; i++) {
        const p = particles[i];
        if (p.opacity <= 0 || p.y > h + 50) continue;
        alive++;

        p.x += p.vx + Math.sin(p.sway) * p.swayAmount;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.sway += p.swaySpeed;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;
        p.opacity = Math.max(0, p.opacity - p.decay);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'star') {
          // Сияющая мерцающая звезда
          const twinkle = 1 + 0.25 * Math.sin(frame * 0.15 + p.twinkleOffset);
          const r1 = p.size * twinkle;
          const r2 = r1 * 0.42;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const a1 = (s * 4 * Math.PI) / 5 - Math.PI / 2;
            const a2 = a1 + (2 * Math.PI) / 10;
            ctx[s === 0 ? 'moveTo' : 'lineTo'](Math.cos(a1) * r1, Math.sin(a1) * r1);
            ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'spark') {
          // Искрящийся пиротехнический уголёк с ореолом
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ribbon') {
          // Праздничная витая лента-серпантин
          ctx.scale(Math.sin(p.flip), 1);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 0.6, -p.size * 0.2, p.size * 1.2, p.size * 0.4);
        } else {
          // Порхающее 3D-конфетти
          ctx.scale(1, Math.cos(p.flip));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
        }

        ctx.restore();
      }

      // Пока идут залпы (в пределах 5300мс) ИЛИ пока в воздухе есть частицы
      const elapsed = Date.now() - startTime;
      const volleysPending = elapsed < 5300;

      if (alive > 0 || volleysPending || flashes.length > 0) {
        window._confettiAnimId = requestAnimationFrame(render);
      } else {
        isRunning = false;
        ctx.clearRect(0, 0, w, h);
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }

    window._confettiAnimId = requestAnimationFrame(render);
  } catch (err) {
    console.warn('Confetti error:', err);
  }
}
window.launchConfetti = launchConfetti;

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
  cleanOldBackupsFromLocalStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('plan4u_backups/') || key.startsWith('plan4u_backup'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) { }
      });
      if (keysToRemove.length > 0) {
        console.log(`Plan4U Storage: Cleaned ${keysToRemove.length} backup entries from LocalStorage to preserve quota`);
      }
    } catch (e) { }
  },

  init() {
    this.cleanOldBackupsFromLocalStorage();
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

    // 1. LocalStorage mirror (exclude huge backup snapshots to prevent QuotaExceededError)
    if (!filename.startsWith('backups/')) {
      try {
        localStorage.setItem(`plan4u_${filename}`, jsonStr);
      } catch (e) {
        this.cleanOldBackupsFromLocalStorage();
        try {
          localStorage.setItem(`plan4u_${filename}`, jsonStr);
        } catch (e2) { }
      }
    }

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

// Modular internationalization dictionary (sourced from i18n.js)
const I18N = (window.Plan4UI18n && window.Plan4UI18n.I18N) || window.I18N || {};

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

function inferSectionFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const t = text.toLowerCase();
  if (/молитв|библи|евангел|храм|церк|служб|исповед|причаст|духовн|псалом|писани|бог|свящ|сповідь|біблі|літург|литург/.test(t)) {
    return 'spiritual';
  }
  if (/уборк|стирк|мыть|помыть|пылесос|ремонт|посуд|прибра|прибиран/.test(t)) {
    return 'household';
  }
  if (/приготов|сварить|обед|ужин|завтрак|суп|рецепт|кухн|готуват|вечеря|обід|сніданок/.test(t)) {
    return 'cook';
  }
  return null;
}

function getTaskSection(task) {
  if (!task) return 'personal';
  if (task.section) {
    const s = task.section.toLowerCase();
    if (s.includes('духовн') || s === 'spiritual') return 'spiritual';
    if (s.includes('личн') || s === 'personal') {
      // If task was defaulted/corrupted to 'personal' but clearly belongs to spiritual affairs by text:
      const inferred = inferSectionFromText(task.text);
      if (inferred === 'spiritual') return 'spiritual';
      return 'personal';
    }
    if (s.includes('дом') || s.includes('семейн') || s.includes('семья') || s === 'household' || s === 'family') return 'household';
    if (s.includes('готов') || s.includes('кухн') || s.includes('еда') || s.includes('cook') || s.includes('meal')) return 'cook';
    if (s.includes('друг') || s.includes('план') || s === 'other') return 'other';
    return task.section;
  }
  const inferred = inferSectionFromText(task.text);
  if (inferred) return inferred;
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
  },
  {
    id: 'chocolate',
    name: 'Шоколадный',
    color: '#7c3f1d',
    dark: '#4a220c',
    rgb: '124, 63, 29',
    btnText: '#ffffff',
    btnBorder: 'none',
    readableText: '#5a2a11',
    marginLine: 'rgba(124, 63, 29, 0.45)',
    darkMarginLine: 'rgba(230, 169, 134, 0.4)',
    sectionBg: '#faf3ee',
    sectionBorder: '#e8cfbe',
    sectionText: '#4a220c',
    darkSectionBg: '#24150f',
    darkSectionBorder: '#5c3321',
    darkSectionText: '#f5cdb8'
  },
  {
    id: 'coffee',
    name: 'Кофейный',
    color: '#8d5b36',
    dark: '#52321c',
    rgb: '141, 91, 54',
    btnText: '#ffffff',
    btnBorder: 'none',
    readableText: '#4d2d17',
    marginLine: 'rgba(141, 91, 54, 0.45)',
    darkMarginLine: 'rgba(226, 187, 157, 0.4)',
    sectionBg: '#fcf6f1',
    sectionBorder: '#ebd6c5',
    sectionText: '#452611',
    darkSectionBg: '#221711',
    darkSectionBorder: '#5a3a25',
    darkSectionText: '#f7d5be'
  },
  {
    id: 'swamp',
    name: 'Болотный',
    color: '#5b7036',
    dark: '#2f3c19',
    rgb: '91, 112, 54',
    btnText: '#ffffff',
    btnBorder: 'none',
    readableText: '#2d3b18',
    marginLine: 'rgba(91, 112, 54, 0.45)',
    darkMarginLine: 'rgba(188, 214, 144, 0.4)',
    sectionBg: '#f4f7ee',
    sectionBorder: '#d3dfbf',
    sectionText: '#283615',
    darkSectionBg: '#17210e',
    darkSectionBorder: '#3d5225',
    darkSectionText: '#c6e498'
  },
  {
    id: 'khaki_moss',
    name: 'Хаки-болото',
    color: '#4a6147',
    dark: '#253424',
    rgb: '74, 97, 71',
    btnText: '#ffffff',
    btnBorder: 'none',
    readableText: '#20301f',
    marginLine: 'rgba(74, 97, 71, 0.45)',
    darkMarginLine: 'rgba(172, 203, 168, 0.4)',
    sectionBg: '#f2f6f1',
    sectionBorder: '#c7dac4',
    sectionText: '#1b2d1a',
    darkSectionBg: '#131f13',
    darkSectionBorder: '#324b30',
    darkSectionText: '#bfe0ba'
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

// buildAchievementsCatalog and ACHIEVEMENTS_LIST are modularized into achievements_system.js
if (typeof buildAchievementsCatalog === 'undefined') {
  var buildAchievementsCatalog = (window.Plan4UAchievements && window.Plan4UAchievements.buildCatalog) || window.buildAchievementsCatalog;
}
if (typeof ACHIEVEMENTS_LIST === 'undefined') {
  var ACHIEVEMENTS_LIST = window.ACHIEVEMENTS_LIST || (buildAchievementsCatalog ? buildAchievementsCatalog(detectSystemLanguage()) : []);
}

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
// STICKERS_CATALOG and DEFAULT_STICKER_CATEGORIES are modularized into stickers_system.js
if (typeof STICKERS_CATALOG === 'undefined') {
  var STICKERS_CATALOG = (window.Plan4UStickers && window.Plan4UStickers.CATALOG) || window.STICKERS_CATALOG || {};
}
if (typeof DEFAULT_STICKER_CATEGORIES === 'undefined') {
  var DEFAULT_STICKER_CATEGORIES = (window.Plan4UStickers && window.Plan4UStickers.CATEGORIES) || window.DEFAULT_STICKER_CATEGORIES || [];
}

class NotebookApp {
  constructor() {
    window.appInstance = this;
    this._isHydrating = false;
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
    this.financeHistoryCategoryFilter = null;
    this.tabs = this.loadTabs();
    this.currentTab = this.tabs.length > 0 ? this.tabs[0].id : 'todo';
    this.tasks = this.loadTasks();
    if (this.tasks && this.tasks.todo) {
      this.tasks.todo = this.tasks.todo.filter(t => !t.text || (!t.text.includes('createElement') && !t.text.includes('error=')));
    }
    if (this.dailyTasks) {
      Object.keys(this.dailyTasks).forEach(d => {
        if (Array.isArray(this.dailyTasks[d])) {
          this.dailyTasks[d] = this.dailyTasks[d].filter(t => !t.text || (!t.text.includes('createElement') && !t.text.includes('error=')));
        }
      });
    }
    this.saveTasks();
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
    this.renderHabits();
    this.updateSubstrateTrayHeight(true);
    this.updateWeekDaysProgress();
    this.updateWorkloadWidget();
    this.updateCycleWidget();
    this.updateFinanceWidget();
    this.updateFinanceArchiveStamp();
    this.updateNutritionWidget?.();
    this.updateNutritionArchiveStamp?.();
    this.updateJoyUI();
    this.updateModulesHubState();
    this.checkEveningJoyTrigger();
    this.cleanLegacyLocalStorageKeys();
    this.syncFromNativeWidget().finally(() => {
      this.syncWithNativeWidget();
    });
    this.initDayChangeListener();
    this.initNotificationSystem();

    // Initialize Maine Coon Companion (Tamagotchi)
    this.petSystem = new MaineCoonPetSystem(this);
    this.petSystem.init();

    // Start background hydration from Plan4UStorage (Native Device Filesystem & IndexedDB)
    this.hydrateFromStorage();

    // Check and spawn Maine secret quest if eligible ("Записки лапкой")
    if (window.MaineQuests && typeof window.MaineQuests.checkAndSpawnQuest === 'function') {
      window.MaineQuests.checkAndSpawnQuest(this);
    }

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
        this._isHydrating = true;
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
          savedStickers,
          savedHabits
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
          Plan4UStorage.loadFile('stickers.json', null),
          Plan4UStorage.loadFile('habits.json', null)
        ]);

        if (this.nutritionTracker && typeof this.nutritionTracker.hydrateFromStorage === 'function') {
          this.nutritionTracker.hydrateFromStorage().catch(() => {});
        }

        let hasRestored = false;

        if (savedDaily && typeof savedDaily === 'object' && Object.keys(savedDaily).length > 0) {
          this.dailyTasks = savedDaily;
          hasRestored = true;
        }

        if (savedTasks && typeof savedTasks === 'object') {
          this.tasks = { ...this.tasks, ...savedTasks };
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

        if (Array.isArray(savedHabits) && savedHabits.length > 0) {
          this.habits = savedHabits;
          this.saveHabits();
          this.renderHabits();
          this.updateWeekDaysProgress();
          this.scheduleAllHabitReminders();
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

      // Always verify custom tab sections and restore from disk or autobackup if needed
      try {
        const [diskSections, autoBackup] = await Promise.all([
          Plan4UStorage.loadFile('sections.json', null),
          Plan4UStorage.loadFile('backups/plan4u_autobackup_latest.json', null)
        ]);
        let sectionsUpdated = false;
        const backupSecs = autoBackup?.sections || autoBackup?.tabSections;

        [diskSections, backupSecs].forEach(source => {
          if (source && typeof source === 'object') {
            Object.keys(source).forEach(tabId => {
              if (!this.tabSections) this.tabSections = {};
              if (!this.tabSections[tabId] || (this.tabSections[tabId].length <= 1 && source[tabId].length > 1)) {
                this.tabSections[tabId] = source[tabId];
                sectionsUpdated = true;
              }
            });
          }
        });

        if (typeof this.recoverMissingTabSections === 'function') {
          const recovered = this.recoverMissingTabSections();
          if (recovered) sectionsUpdated = true;
        }

        if (sectionsUpdated) {
          this.saveSections();
          this.render();
        }
      } catch (secHydrateErr) {
        console.warn('Storage sections hydration check:', secHydrateErr);
      }
    } catch (e) {
      console.warn('Storage hydration error:', e);
    } finally {
      this._isHydrating = false;
    }
  }

  // App Lifecycle Listeners to flush saves immediately on minimize, app switch or pause
  initLifecycleListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushAllSaves();
      } else if (document.visibilityState === 'visible') {
        this.checkMidnightOrWake();
        this.syncFromNativeWidget?.();
      }
    });

    window.addEventListener('pagehide', () => this.flushAllSaves());
    window.addEventListener('beforeunload', () => this.flushAllSaves());
    window.addEventListener('blur', () => this.flushAllSaves());
    window.addEventListener('resume', () => {
      this.checkMidnightOrWake();
      this.syncFromNativeWidget?.();
    });

    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      try {
        window.Capacitor.Plugins.App.addListener('appStateChange', (state) => {
          if (!state.isActive) {
            this.flushAllSaves();
          } else {
            this.checkMidnightOrWake();
            this.syncFromNativeWidget?.();
          }
        });
        window.Capacitor.Plugins.App.addListener('pause', () => {
          this.flushAllSaves();
        });
        window.Capacitor.Plugins.App.addListener('backButton', () => {
          const handled = this.handleHardwareBack();
          if (!handled) {
            window.Capacitor.Plugins.App.exitApp();
          }
        });
      } catch (e) {
        console.warn('Capacitor App lifecycle listener error:', e);
      }
    }
  }

  // Flush all in-memory changes to LocalStorage, IndexedDB and Native Filesystem
  flushAllSaves() {
    try {
      if (this._isHydrating && (!this.tasks || !this.dailyTasks)) return;
      this.flushSaveTasks();
      this.saveDailyTasks();
      this.saveDayHistory();
      this.saveSettings();
      this.saveTabs();
      this.saveAchievementsData();
      this.saveHistory();
      this.saveStickers();
      this.saveHabits();
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
      this.rolloverBuyTasks();
      if (!this.dailyTasks[todayStr]) {
        this.dailyTasks[todayStr] = [];
      }
      this.tasks.todo = this.dailyTasks[todayStr];
      this.saveTasks();
      this.updateDateWidget();
      this.renderTabs();
      this.render();
      this.renderStickers();
      this.updateWorkloadWidget();
      this.syncWithNativeWidget();
      if (window.MaineQuests && typeof window.MaineQuests.checkAndSpawnQuest === 'function') {
        window.MaineQuests.checkAndSpawnQuest(this);
      }
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
        }, 450);
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
        this.rolloverBuyTasks();
        if (!this.dailyTasks[todayStr]) {
          this.dailyTasks[todayStr] = [];
        }
        this.tasks.todo = this.dailyTasks[todayStr];
        this.saveTasks();
        this.updateDateWidget();
        this.renderTabs();
        this.render();
        this.renderStickers();
        this.updateWorkloadWidget();
        this.syncWithNativeWidget();
        if (window.MaineQuests && typeof window.MaineQuests.checkAndSpawnQuest === 'function') {
          window.MaineQuests.checkAndSpawnQuest(this);
        }
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

  // Helper for ISO week key (e.g. "2026-W37")
  getISOWeekKey(dateOrStr) {
    const d = typeof dateOrStr === 'string' ? new Date(dateOrStr + 'T00:00:00') : new Date(dateOrStr);
    const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNr = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNr);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
    return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  // Track daily visit streaks with 1 Freeze Day ("Выходной ☕") per week
  initStreakTracker() {
    const today = new Date();
    const todayStr = this.getTodayDateString();

    let streakData = {
      count: 15,
      lastVisitDate: todayStr,
      bestStreak: 15,
      lastFreezeDate: null,
      lastFreezeWeek: null
    };

    try {
      const saved = localStorage.getItem('todo_notebook_daily_streak');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          streakData = { ...streakData, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Could not read streak data:', e);
    }

    let justProtectedByFreeze = false;

    if (!streakData.lastVisitDate) {
      streakData.lastVisitDate = todayStr;
      streakData.count = streakData.count !== undefined ? streakData.count : 15;
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
      } else if (diffDays === 2) {
        // Missed exactly 1 day (e.g. missed Sunday!)
        const missedDate = new Date(lastDate.getTime() + 86400000);
        const missedDateStr = `${missedDate.getFullYear()}-${String(missedDate.getMonth() + 1).padStart(2, '0')}-${String(missedDate.getDate()).padStart(2, '0')}`;
        const missedWeekKey = this.getISOWeekKey(missedDate);

        // Check if 1 freeze day is available for that week
        const canFreeze = streakData.lastFreezeWeek !== missedWeekKey;

        if (canFreeze) {
          // 1 Freeze Day per week ("Выходной ☕") saves the streak!
          streakData.lastFreezeDate = missedDateStr;
          streakData.lastFreezeWeek = missedWeekKey;
          streakData.count = (streakData.count || 1) + 1;
          streakData.bestStreak = Math.max(streakData.bestStreak || 0, streakData.count);
          streakData.lastVisitDate = todayStr;
          justProtectedByFreeze = true;
        } else {
          // Already used freeze this week -> streak reset to 1
          streakData.count = 1;
          streakData.lastVisitDate = todayStr;
        }
      } else if (diffDays > 2) {
        // Missed 2 or more consecutive days -> streak reset to 1
        streakData.count = 1;
        streakData.lastVisitDate = todayStr;
      }
    }

    try {
      localStorage.setItem('todo_notebook_daily_streak', JSON.stringify(streakData));
    } catch (e) { }

    this.streakData = streakData;
    this.updateStreakWidget();

    // If freeze saved the streak today, show welcoming reassuring toast
    if (justProtectedByFreeze) {
      setTimeout(() => {
        const daysWord = this.getDaysWord(this.streakData.count);
        this.showToast(`☕ Выходной: день заморозки спас вашу серию в ${this.streakData.count} ${daysWord}! Стрик сохранён ✨`, '☕');
      }, 900);
    }
  }

  updateStreakWidget() {
    const streakNumEl = document.querySelector('.widget-streak-num');
    if (streakNumEl && this.streakData) {
      streakNumEl.textContent = this.streakData.count;
    }
    if (this.widgetStreak && this.streakData) {
      const today = new Date();
      const currentWeekKey = this.getISOWeekKey(today);
      const isFreezeUsedThisWeek = (this.streakData.lastFreezeWeek === currentWeekKey);
      const daysWord = this.getDaysWord(this.streakData.count);

      // Show small coffee cup badge on flame widget if freeze was used this week
      this.widgetStreak.classList.toggle('has-freeze-badge', !!isFreezeUsedThisWeek);

      const hasUnclaimed = this.achievementsData && Object.keys(this.achievementsData.unlocked || {}).some(id => !this.achievementsData.viewed?.[id]);
      this.widgetStreak.classList.toggle('has-unclaimed', !!hasUnclaimed);

      if (hasUnclaimed) {
        this.widgetStreak.title = '🏆 У вас есть новые полученные достижения! Нажмите, чтобы открыть';
      } else if (isFreezeUsedThisWeek) {
        this.widgetStreak.title = `Беспрерывная серия: ${this.streakData.count} ${daysWord} (Выходной ☕ сохранил серию). Рекорд: ${this.streakData.bestStreak}.`;
      } else {
        this.widgetStreak.title = `Беспрерывная серия: ${this.streakData.count} ${daysWord} (Доступна заморозка: Выходной ☕). Рекорд: ${this.streakData.bestStreak}.`;
      }
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
      try {
        localStorage.setItem('todo_notebook_daily_tasks', dailyJson);
        localStorage.setItem('plan4u_daily_tasks.json', dailyJson);
      } catch (quotaErr) {
        Plan4UStorage.cleanOldBackupsFromLocalStorage?.();
        try {
          localStorage.setItem('todo_notebook_daily_tasks', dailyJson);
          localStorage.setItem('plan4u_daily_tasks.json', dailyJson);
        } catch (retryErr) {
          console.warn('LocalStorage quota warning:', retryErr);
        }
      }
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
      const histJson = JSON.stringify(this.dayHistory);
      try {
        localStorage.setItem('todo_notebook_day_history', histJson);
      } catch (quotaErr) {
        Plan4UStorage.cleanOldBackupsFromLocalStorage?.();
        try {
          localStorage.setItem('todo_notebook_day_history', histJson);
        } catch (retryErr) { }
      }
      Plan4UStorage.saveFile('day_history.json', this.dayHistory);
      this.triggerBackgroundBackup?.();
    } catch (e) {
      console.warn('Could not save day history:', e);
    }
  }

  // Carry over uncompleted items in "What to buy" tab to the new day, deleting completed items
  rolloverBuyTasks() {
    if (!this.tasks || !Array.isArray(this.tasks.buy)) return false;
    const todayStr = this.getTodayDateString();
    const lastRolloverDate = localStorage.getItem('todo_notebook_last_buy_date');

    const todayHistoryBuyIds = new Set();
    if (this.dayHistory && Array.isArray(this.dayHistory[todayStr])) {
      this.dayHistory[todayStr].forEach(item => {
        if (item && item.id && (item.tabId === 'buy' || item.tabId === 'Что купить' || item.tabId === 'Що купити' || item.tabId === 'What to buy')) {
          todayHistoryBuyIds.add(String(item.id));
        }
      });
    }

    const initialLen = this.tasks.buy.length;
    this.tasks.buy = this.tasks.buy.filter(task => {
      if (!task || task.isEmpty || !task.text || !task.text.trim()) {
        return true;
      }
      if (!task.completed) {
        return true;
      }

      // If task is completed: keep it ONLY if it was genuinely completed TODAY
      const isCompletedToday = (task.completedDate && task.completedDate === todayStr) ||
                               (!task.completedDate && lastRolloverDate === todayStr && todayHistoryBuyIds.has(String(task.id)));

      if (isCompletedToday) {
        task.completedDate = todayStr;
        return true;
      }

      // Completed on a previous day -> remove from sheet upon transitioning to next day
      return false;
    });

    localStorage.setItem('todo_notebook_last_buy_date', todayStr);

    if (this.tasks.buy.length !== initialLen) {
      this.saveTasks();
      return true;
    }
    return false;
  }

  // Carry over uncompleted tasks from past days to today, keeping completed tasks archived in past days
  rolloverPastUncompletedTasks() {
    this.rolloverBuyTasks();
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
            const recoveredSection = hItem.section || (hItem.place && getTaskSection({ section: hItem.place, text: hItem.text })) || getTaskSection(hItem) || inferSectionFromText(hItem.text) || 'personal';
            if (!exists) {
              this.dailyTasks[d].push({
                id: hItem.id || generateTaskId(),
                text: hItem.text,
                section: recoveredSection,
                completed: true,
                date: d
              });
              changed = true;
            } else {
              // Self-healing: if task exists in dailyTasks[d] but section was corrupted to 'personal', restore accurate section
              const existingTask = this.dailyTasks[d].find(t => String(t.id) === String(hItem.id) || (t.text === hItem.text && t.completed));
              if (existingTask && (!existingTask.section || existingTask.section === 'personal')) {
                const targetSec = hItem.section || inferSectionFromText(existingTask.text);
                if (targetSec && targetSec !== 'personal') {
                  existingTask.section = targetSec;
                  changed = true;
                }
              }
            }
          });
        }
      }
    }

    // Self-healing: scan past days in dailyTasks to repair any spiritual tasks that were corrupted to 'personal'
    if (this.dailyTasks && typeof this.dailyTasks === 'object') {
      for (const d in this.dailyTasks) {
        if (d < todayStr && Array.isArray(this.dailyTasks[d])) {
          this.dailyTasks[d].forEach(t => {
            if (t && (!t.section || t.section === 'personal')) {
              const inferred = inferSectionFromText(t.text);
              if (inferred && inferred !== 'personal') {
                t.section = inferred;
                changed = true;
              }
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
          const existingInToday = this.dailyTasks[todayStr].find(t => String(t.id) === String(origTask.id) || (t.text === origTask.text && t.section === origTask.section));
          if (!existingInToday) {
            const rolledTask = {
              ...origTask,
              date: todayStr,
              completed: false
            };
            this.dailyTasks[todayStr].push(rolledTask);
          } else {
            existingInToday.date = todayStr;
            existingInToday.completed = false;
          }
        });

        // Leave only completed tasks in the past day
        this.dailyTasks[pastDate] = completed;
        changed = true;
      }
    });

    // 2. Clean up any completed tasks from past days that leaked into today
    const pastCompletedIds = new Set();
    const pastCompletedTexts = new Set();
    pastDateKeys.forEach(pastDate => {
      const pList = this.dailyTasks[pastDate] || [];
      pList.forEach(t => {
        if (t && t.completed && t.text && t.text.trim()) {
          if (t.id) pastCompletedIds.add(String(t.id));
          pastCompletedTexts.add(`${t.text.trim().toLowerCase()}___${t.section || ''}`);
        }
      });
      if (this.dayHistory && Array.isArray(this.dayHistory[pastDate])) {
        this.dayHistory[pastDate].forEach(h => {
          if (h && h.id && (!h.tabId || h.tabId === 'todo')) {
            pastCompletedIds.add(String(h.id));
            if (h.text && h.text.trim()) {
              pastCompletedTexts.add(`${h.text.trim().toLowerCase()}___${h.section || ''}`);
            }
          }
        });
      }
    });

    // Tasks recorded as genuinely completed today
    const todayCompletedIds = new Set();
    if (this.dayHistory && Array.isArray(this.dayHistory[todayStr])) {
      this.dayHistory[todayStr].forEach(h => {
        if (h && h.id && (!h.tabId || h.tabId === 'todo')) {
          todayCompletedIds.add(String(h.id));
        }
      });
    }

    if (this.dailyTasks[todayStr] && this.dailyTasks[todayStr].length > 0) {
      const initialLen = this.dailyTasks[todayStr].length;
      this.dailyTasks[todayStr] = this.dailyTasks[todayStr].filter(t => {
        if (!t || t.isEmpty || !t.text || !t.text.trim()) return true;

        if (t.completed) {
          const tId = String(t.id || '');
          // If task matches an ID completed in a past day, it belongs strictly in the past archive!
          if (tId && pastCompletedIds.has(tId)) {
            return false;
          }
          // If task explicitly has a past date stamped on it:
          if (t.date && t.date < todayStr) {
            return false;
          }
          // If text matches a past completed task and was NOT genuinely completed today:
          const textKey = `${t.text.trim().toLowerCase()}___${t.section || ''}`;
          if (pastCompletedTexts.has(textKey) && !todayCompletedIds.has(tId)) {
            return false;
          }
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

    this.renderWeekDays();
  }

  // Render Week Days horizontal block (7 circles for rolling 7-day window ending on TODAY)
  renderWeekDays() {
    if (!this.weekDaysBar) return;
    const todayStr = this.getTodayDateString();
    const [ty, tm, td] = todayStr.split('-').map(Number);
    const todayObj = new Date(ty, tm - 1, td);

    const lang = this.settings.lang || 'ru';
    const dict = I18N[lang] || I18N.ru;

    const daysShort = dict.weekdaysShort || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const months = dict.monthsNominative || ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    let track = this.weekDaysBar.querySelector('.week-days-track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'week-days-track';
      track.id = 'weekDaysTrack';
      this.weekDaysBar.appendChild(track);
    }
    track.innerHTML = '';

    for (let i = 0; i < 7; i++) {
      const dayOffset = 6 - i; // 6, 5, 4, 3, 2, 1, 0 (i=6 is today)
      const dayDate = new Date(todayObj);
      dayDate.setDate(todayObj.getDate() - dayOffset);
      const dayDateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
      const isToday = (i === 6);
      const dowIndex = (dayDate.getDay() + 6) % 7; // 0=Mon, 1=Tue, ..., 6=Sun
      const isWeekend = (dowIndex === 5 || dowIndex === 6);

      const circle = document.createElement('div');
      circle.className = `week-day-circle${isToday ? ' is-today' : ''}${isWeekend ? ' is-weekend' : ''}`;
      circle.dataset.date = dayDateStr;
      circle.dataset.dayIndex = i;
      circle.title = `${dayDate.getDate()} ${months[dayDate.getMonth()]} (${daysShort[dowIndex]})`;

      // Circular SVG Progress Ring (clockwise progress, matching Widget 2 reference)
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'week-day-progress-ring');
      svg.setAttribute('viewBox', '0 0 36 36');

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bg.setAttribute('class', 'week-day-progress-bg');
      bg.setAttribute('cx', '18');
      bg.setAttribute('cy', '18');
      bg.setAttribute('r', '15.9155');

      const fill = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      fill.setAttribute('class', 'week-day-progress-fill');
      fill.setAttribute('cx', '18');
      fill.setAttribute('cy', '18');
      fill.setAttribute('r', '15.9155');
      fill.setAttribute('stroke-dasharray', '100');
      fill.setAttribute('stroke-dashoffset', '100');

      svg.appendChild(bg);
      svg.appendChild(fill);
      circle.appendChild(svg);

      const span = document.createElement('span');
      span.className = 'week-day-name';
      span.textContent = daysShort[dowIndex];
      circle.appendChild(span);

      // Verified Badge (top-right checkmark when all habits completed)
      const badge = document.createElement('div');
      badge.className = 'week-day-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = '<svg viewBox="0 0 10 10" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 5.2 4.2 7.4 8 2.8"></polyline></svg>';
      circle.appendChild(badge);

      track.appendChild(circle);
    }

    this.updateWeekDaysProgress();
    this.renderHabits();
  }

  // Update circular progress ring on each of the 7 week day circles (clockwise fill)
  updateWeekDaysProgress() {
    if (!this.weekDaysBar) return;
    const circles = this.weekDaysBar.querySelectorAll('.week-day-circle');
    if (!circles || circles.length === 0) return;

    const todayStr = this.getTodayDateString();

    circles.forEach(circle => {
      let dateStr = circle.dataset.date;
      if (!dateStr) {
        if (circle.classList.contains('is-today')) {
          dateStr = todayStr;
          circle.dataset.date = dateStr;
        } else {
          const dayIdx = parseInt(circle.dataset.dayIndex, 10);
          if (!isNaN(dayIdx)) {
            const [y, m, d] = todayStr.split('-').map(Number);
            const todayObj = new Date(y, m - 1, d);
            const targetDate = new Date(todayObj);
            targetDate.setDate(todayObj.getDate() - (6 - dayIdx));
            dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
            circle.dataset.date = dateStr;
          }
        }
      }
      if (!dateStr) return;

      // 1. Tasks for dateStr
      let list = [];
      if (dateStr === todayStr && this.tasks && this.tasks.todo) {
        list = this.tasks.todo;
      } else if (this.dailyTasks && this.dailyTasks[dateStr]) {
        list = this.dailyTasks[dateStr];
      }

      const activeTasks = (list || []).filter(t => !t.isEmpty && (t.text && t.text.trim().length > 0));
      const totalTasks = activeTasks.length;
      const completedTasks = activeTasks.filter(t => t.completed).length;

      // 2. Habits for dateStr (from habit tracker with schedule & numeric progress support)
      const allHabits = (this.habits && Array.isArray(this.habits)) ? this.habits : [];
      let scheduledHabitsCount = 0;
      let completedHabitsScore = 0;

      const [yVal, mVal, dVal] = dateStr.split('-').map(Number);
      const dayDateObj = new Date(yVal, mVal - 1, dVal);
      const dayDow = dayDateObj.getDay(); // 0 is Sun, 1 is Mon...

      allHabits.forEach(h => {
        let hStartStr = null;
        if (h.created) {
          const cd = new Date(h.created);
          if (!isNaN(cd.getTime())) {
            hStartStr = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}-${String(cd.getDate()).padStart(2, '0')}`;
          }
        }
        if (h.history && typeof h.history === 'object') {
          const hDates = Object.keys(h.history).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
          if (hDates.length > 0 && (!hStartStr || hDates[0] < hStartStr)) {
            hStartStr = hDates[0];
          }
        }

        const hEntry = h.history && h.history[dateStr];
        if (hStartStr && dateStr < hStartStr && !hEntry) {
          return; // Habit did not exist yet on dateStr
        }

        let frac = 0;
        if (h.type === 'numeric') {
          const cur = typeof hEntry === 'object' ? (hEntry.current || 0) : (hEntry ? (h.target?.value || 1) : 0);
          const tgt = (h.target && h.target.value) ? h.target.value : 1;
          frac = Math.min(Math.max(cur / tgt, 0), 1.0);
        } else {
          const done = typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry;
          frac = done ? 1.0 : 0.0;
        }

        if (h.schedule?.type === 'weekdays') {
          const dows = h.schedule.daysOfWeek || [1, 2, 3, 4, 5];
          const isScheduled = dows.includes(dayDow);
          if (isScheduled) {
            scheduledHabitsCount++;
            completedHabitsScore += frac;
          } else if (frac > 0) {
            scheduledHabitsCount++;
            completedHabitsScore += frac;
          }
        } else if (h.schedule?.type === 'periodic') {
          if (frac > 0) {
            // Completed on this date: counts as scheduled and completed
            scheduledHabitsCount++;
            completedHabitsScore += frac;
          }
          // If not completed on this date, a periodic habit with a floating schedule
          // is not tied to this specific day, so it does not penalize the daily progress circle.
        } else {
          // Daily schedule
          scheduledHabitsCount++;
          completedHabitsScore += frac;
        }
      });

      const totalHabits = scheduledHabitsCount;
      const completedHabits = completedHabitsScore;

      // Calculate fraction: habits and tasks both fill the progress ring
      let fraction = 0;
      let total = 0;
      let completed = 0;

      const habitFrac = totalHabits > 0 ? (completedHabits / totalHabits) : 0;
      const taskFrac = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

      if (totalHabits > 0 && totalTasks > 0) {
        fraction = Math.max(habitFrac, taskFrac, (completedTasks + completedHabits) / (totalTasks + totalHabits));
        total = totalHabits + totalTasks;
        completed = completedHabits + completedTasks;
      } else if (totalHabits > 0) {
        fraction = habitFrac;
        total = totalHabits;
        completed = completedHabits;
      } else if (totalTasks > 0) {
        fraction = taskFrac;
        total = totalTasks;
        completed = completedTasks;
      }

      fraction = Math.min(Math.max(fraction, 0), 1);

      const fillCircle = circle.querySelector('.week-day-progress-fill');
      if (fillCircle) {
        const offset = 100 * (1 - fraction);
        fillCircle.style.strokeDasharray = '100';
        fillCircle.style.strokeDashoffset = offset.toFixed(1);
        fillCircle.setAttribute('stroke-dasharray', '100');
        fillCircle.setAttribute('stroke-dashoffset', offset.toFixed(1));
        fillCircle.style.opacity = fraction > 0 ? '1' : '0';
        if (fraction === 1 && total > 0) {
          fillCircle.classList.add('is-completed-all');
        } else {
          fillCircle.classList.remove('is-completed-all');
        }
      }

      // Verified Badge: all scheduled habits for this day are completed
      let badge = circle.querySelector('.week-day-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'week-day-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.innerHTML = '<svg viewBox="0 0 10 10" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 5.2 4.2 7.4 8 2.8"></polyline></svg>';
        circle.appendChild(badge);
      }

      const allHabitsCompleted = (totalHabits > 0 && completedHabits >= totalHabits);
      circle.classList.toggle('has-verified-badge', allHabitsCompleted);

      // Tooltip
      const dayName = circle.querySelector('.week-day-name')?.textContent || '';
      if (total > 0) {
        const pct = Math.round(fraction * 100);
        const verifiedNote = allHabitsCompleted ? ' ✓ (все привычки выполнены)' : '';
        circle.title = `${dayName} (${dateStr}): выполнено ${completed} из ${total} (${pct}%)${verifiedNote}`;
      } else {
        circle.title = `${dayName} (${dateStr})`;
      }
    });
  }

  // Cartoon spring transition for the 7 week day circles between closed and open states
  // (110% overshoot -> 90% undershoot -> 105% rebound -> 100% settle)
  animateWeekCirclesFLIP(stateChangeCallback) {
    const circles = Array.from(document.querySelectorAll('.week-days-track .week-day-circle'));
    if (!circles.length) {
      if (stateChangeCallback) stateChangeCallback();
      return;
    }

    // 1. Capture current visual positions (First)
    const firstRects = circles.map(c => c.getBoundingClientRect());

    // Cancel any active spring animation on circles
    circles.forEach(c => {
      if (c._springAnim) {
        try { c._springAnim.cancel(); } catch (e) { }
        c._springAnim = null;
      }
      c.classList.remove('is-animating');
      c.style.transform = '';
    });

    // 2. Perform DOM state change (toggle .is-expanded, trigger tray spring, etc.)
    if (stateChangeCallback) {
      stateChangeCallback();
    }

    const container = document.getElementById('tabsSubstrateContainer');
    const isExpanded = container && container.classList.contains('is-expanded');

    // If collapsing: ensure slot inline styles are completely cleared so layout occupies 100% width
    if (!isExpanded) {
      const slot = document.getElementById('habitAddSlot');
      if (slot) {
        slot.style.removeProperty('width');
        slot.style.removeProperty('flex');
        slot.style.removeProperty('max-width');
        slot.style.removeProperty('padding-right');
      }
    }

    // 3. Capture new target positions (Last)
    const lastRects = circles.map(c => c.getBoundingClientRect());

    if (isExpanded && lastRects.length >= 2) {
      const targetWidth = this.updateAddHabitButtonWidth(lastRects[0], lastRects[1]);
      this.playAddHabitButtonEntranceAnimation(targetWidth);
    }

    // 4. Invert & Play with 4-phase Cartoon Spring Animation
    let hasMoved = false;
    const animDuration = 650; // ms

    circles.forEach((c, i) => {
      const dx = firstRects[i].left - lastRects[i].left;
      const dy = firstRects[i].top - lastRects[i].top;
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        hasMoved = true;
        // Keyframes: 0% -> 110% overshoot -> 90% undershoot -> 105% rebound -> 100% settle
        // Visual pos = Target + dx * (1 - progress)
        // progress 0: dx
        // progress 1.10: -0.10 * dx
        // progress 0.90: +0.10 * dx
        // progress 1.045: -0.045 * dx
        // progress 1.00: 0
        const keyframes = [
          { offset: 0.00, transform: `translate3d(${dx}px, ${dy}px, 0)` },
          { offset: 0.38, transform: `translate3d(${-0.10 * dx}px, ${-0.10 * dy}px, 0)` },
          { offset: 0.62, transform: `translate3d(${0.10 * dx}px, ${0.10 * dy}px, 0)` },
          { offset: 0.82, transform: `translate3d(${-0.045 * dx}px, ${-0.045 * dy}px, 0)` },
          { offset: 1.00, transform: 'translate3d(0, 0, 0)' }
        ];

        c._springAnim = c.animate(keyframes, {
          duration: animDuration,
          easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
          fill: 'forwards'
        });

        c._springAnim.onfinish = () => {
          c.style.transform = '';
          try { c._springAnim.cancel(); } catch (e) { }
          c._springAnim = null;
        };
      } else {
        c.style.transform = '';
      }
    });

    // Fallback safety timeout
    clearTimeout(this._circlesFlipTimer);
    this._circlesFlipTimer = setTimeout(() => {
      circles.forEach(c => {
        if (!c._springAnim) {
          c.style.transform = '';
        }
      });
      const cont = document.getElementById('tabsSubstrateContainer');
      if (cont && cont.classList.contains('is-expanded')) {
        this.updateAddHabitButtonWidth();
      } else if (cont) {
        const slot = document.getElementById('habitAddSlot');
        if (slot) {
          slot.style.removeProperty('width');
          slot.style.removeProperty('flex');
          slot.style.removeProperty('max-width');
          slot.style.removeProperty('padding-right');
        }
      }
    }, animDuration + 50);
  }

  // Cartoon spring animation for the habit drawer (#substrateTray)
  // (110% overshoot -> 90% undershoot -> 105% rebound -> 100% settle)
  animateSubstrateTraySpring(targetState, targetHeight) {
    const tray = document.getElementById('substrateTray');
    if (!tray) return;

    if (tray._springAnim) {
      try { tray._springAnim.cancel(); } catch (e) { }
      tray._springAnim = null;
    }

    const H = Math.max(targetHeight || 0, 52);
    const animDuration = 650; // ms, matching circles spring

    if (targetState) {
      // Opening: 0px -> 110% overshoot -> 90% undershoot -> 105% rebound -> 100% settle
      const keyframes = [
        { offset: 0.00, height: '0px', opacity: 0.3 },
        { offset: 0.38, height: `${Math.round(H * 1.10)}px`, opacity: 1 },
        { offset: 0.62, height: `${Math.round(H * 0.90)}px`, opacity: 1 },
        { offset: 0.82, height: `${Math.round(H * 1.045)}px`, opacity: 1 },
        { offset: 1.00, height: `${H}px`, opacity: 1 }
      ];

      tray.style.pointerEvents = 'auto';
      tray.setAttribute('aria-hidden', 'false');

      tray._springAnim = tray.animate(keyframes, {
        duration: animDuration,
        easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
        fill: 'forwards'
      });

      tray._springAnim.onfinish = () => {
        tray.style.height = '';
        tray.style.opacity = '';
        try { tray._springAnim.cancel(); } catch (e) { }
        tray._springAnim = null;
      };
    } else {
      // Closing: currentH -> 0px -> 10% bounce -> 0px -> 3% micro-bounce -> 0px
      const currentH = tray.offsetHeight || H;
      const keyframes = [
        { offset: 0.00, height: `${currentH}px`, opacity: 1 },
        { offset: 0.38, height: '0px', opacity: 0.3 },
        { offset: 0.62, height: `${Math.max(0, Math.round(currentH * 0.10))}px`, opacity: 0.6 },
        { offset: 0.82, height: '0px', opacity: 0.1 },
        { offset: 0.92, height: `${Math.max(0, Math.round(currentH * 0.03))}px`, opacity: 0.2 },
        { offset: 1.00, height: '0px', opacity: 0 }
      ];

      tray.style.pointerEvents = 'none';
      tray.setAttribute('aria-hidden', 'true');

      tray._springAnim = tray.animate(keyframes, {
        duration: animDuration,
        easing: 'cubic-bezier(0.2, 0.8, 0.25, 1)',
        fill: 'forwards'
      });

      tray._springAnim.onfinish = () => {
        tray.style.height = '';
        tray.style.opacity = '';
        try { tray._springAnim.cancel(); } catch (e) { }
        tray._springAnim = null;
      };
    }
  }

  // Toggle substrate drawer: slide tabs and tasks down to reveal habit tracker
  toggleSubstrateDrawer(forceState, isSilent = false) {
    const container = document.getElementById('tabsSubstrateContainer');
    if (!container) return;
    const isCurrentlyExpanded = container.classList.contains('is-expanded');
    const targetState = (forceState !== undefined) ? forceState : !isCurrentlyExpanded;
    if (targetState === isCurrentlyExpanded) return;

    if (!isSilent) {
      triggerHaptic(20);
    }

    let targetHeight = 0;
    const tray = document.getElementById('substrateTray');

    if (targetState) {
      this._substrateDrawerOpenedAt = Date.now();
      const habitsList = document.getElementById('habitsListContainer');
      const hasContent = habitsList && habitsList.children.length > 0;
      if (this._habitsDirty || !hasContent) {
        this.renderHabits();
      }
      targetHeight = this.updateSubstrateTrayHeight(true);
    } else {
      this._substrateDrawerOpenedAt = 0;
      this.closeAddHabitInput();
      if (tray) {
        targetHeight = tray.offsetHeight || parseFloat(container.style.getPropertyValue('--substrate-tray-height')) || 120;
      }
    }

    this.animateWeekCirclesFLIP(() => {
      const isExpanded = container.classList.toggle('is-expanded', targetState);

      if (this.weekDaysBar) {
        this.weekDaysBar.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        this.weekDaysBar.classList.toggle('is-expanded', isExpanded);
      }
      if (this.weekDaysTrack) {
        this.weekDaysTrack.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      }
      if (tray) {
        tray.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
      }

      if (!isExpanded) {
        this.resetAddHabitButtonAnimation();
      }

      this.animateSubstrateTraySpring(targetState, targetHeight);
    });
  }

  // Helper to cleanly collapse substrate drawer back to original state
  collapseSubstrateDrawer(isSilent = true) {
    this.toggleSubstrateDrawer(false, isSilent);
  }

  // Update substrate tray height adaptively based on habits count & content
  updateSubstrateTrayHeight(skipMeasurement = false) {
    const container = document.getElementById('tabsSubstrateContainer');
    const tray = document.getElementById('substrateTray');
    if (!container || !tray) return 0;

    const habitCount = (this.habits && Array.isArray(this.habits)) ? this.habits.length : 0;
    const addRow = document.getElementById('habitAddRow');
    const isAddRowVisible = addRow && addRow.style.display !== 'none';
    const addRowHeight = isAddRowVisible ? 40 : 0;

    let targetHeight = 0;
    if (habitCount === 0) {
      targetHeight = 56 + addRowHeight;
    } else {
      let measuredHeight = 0;
      if (!skipMeasurement && this.habitsListContainer && this.habitsListContainer.children.length > 0) {
        measuredHeight = this.habitsListContainer.scrollHeight + addRowHeight + 6;
      }
      const currentFontSize = this.settings?.fontSize || 14;
      const baseRowHeight = Math.max(38, currentFontSize * 2.3);
      const calculatedHeight = (habitCount * baseRowHeight) + (Math.max(0, habitCount - 1) * 3) + 14 + addRowHeight;
      targetHeight = Math.max(measuredHeight, calculatedHeight);
    }

    const maxAllowed = Math.floor(window.innerHeight * 0.72);
    const finalHeight = Math.min(Math.max(targetHeight, 52), maxAllowed);

    container.style.setProperty('--substrate-tray-height', `${finalHeight}px`);
    tray.style.setProperty('--substrate-tray-height', `${finalHeight}px`);
    return finalHeight;
  }

  // Adaptively adjust the width and height of #btnAddHabit so that:
  // 1. Its height equals the height of the week-day circle
  // 2. On the left it starts where it is now (aligned with left margin)
  // 3. On the right its distance to the first circle is EXACTLY the same as between the circles
  updateAddHabitButtonWidth(targetC0Rect, targetC1Rect) {
    const btn = document.getElementById('btnAddHabit');
    const slot = document.getElementById('habitAddSlot');
    const track = document.getElementById('weekDaysTrack');
    const container = document.getElementById('tabsSubstrateContainer');
    if (!btn || !slot || !track) return 0;
    if (container && !container.classList.contains('is-expanded')) {
      slot.style.removeProperty('width');
      slot.style.removeProperty('flex');
      slot.style.removeProperty('max-width');
      slot.style.removeProperty('padding-right');
      return 0;
    }

    const circles = Array.from(track.querySelectorAll('.week-day-circle'));
    if (circles.length < 2) return 0;

    const c0 = targetC0Rect || circles[0].getBoundingClientRect();
    const c1 = targetC1Rect || circles[1].getBoundingClientRect();
    const circleGap = Math.max(0, c1.left - c0.right);
    const slotRect = slot.getBoundingClientRect();

    if (c0.left > slotRect.left) {
      // Distance from btn right edge to c0 left edge is circleGap + 2px:
      // btn.right = c0.left - (circleGap + 2)
      const targetWidth = Math.max(50, Math.round((c0.left - (circleGap + 2)) - slotRect.left));
      slot.style.setProperty('width', `${targetWidth}px`, 'important');
      slot.style.setProperty('flex', `0 0 ${targetWidth}px`, 'important');
      slot.style.setProperty('max-width', `${targetWidth}px`, 'important');
      slot.style.setProperty('padding-right', '0px', 'important');
      const circleHeight = Math.round(c0.height || 31);
      btn.style.setProperty('height', `${circleHeight}px`, 'important');
      btn.style.setProperty('box-shadow', 'none', 'important');
      return targetWidth;
    }
    return 0;
  }

  // Cinematic 4-stage entrance animation requested by user:
  // 1) Shows circle with "+" inside on the left
  // 2) Circle smoothly expands horizontally to target width
  // 3) "+" rotates 90 degrees concurrently
  // 4) Text "Привычка" types letter-by-letter
  playAddHabitButtonEntranceAnimation(targetWidth) {
    const btn = document.getElementById('btnAddHabit');
    if (!btn) return;
    const textSpan = btn.querySelector('.btn-add-habit-text');
    const plusIcon = btn.querySelector('.plus-icon');
    if (!textSpan || !plusIcon) return;

    // Clear any previous active animation timers
    if (this._addHabitAnimTimers && Array.isArray(this._addHabitAnimTimers)) {
      this._addHabitAnimTimers.forEach(t => {
        clearTimeout(t);
        clearInterval(t);
      });
    }
    this._addHabitAnimTimers = [];

    const fullText = (this.t && typeof this.t === 'function')
      ? (this.t('habit_btn_add') || 'Привычка')
      : (textSpan.getAttribute('data-full-text') || textSpan.textContent || 'Привычка');
    textSpan.setAttribute('data-full-text', fullText);

    // Measure full text width so we can pre-calculate final left padding
    // Measure exact text width when full
    textSpan.textContent = fullText;
    textSpan.style.removeProperty('width');
    textSpan.style.removeProperty('min-width');
    textSpan.style.removeProperty('max-width');
    const fullTextWidth = Math.ceil(textSpan.getBoundingClientRect().width || 56);

    const circleHeight = 31;
    const finalWidth = targetWidth || 114;

    // Stage 1: Initial State - Circle of 31px on the left with '+' inside
    // Button is centered, text width is 0 so '+' is dead-center
    textSpan.textContent = '';
    textSpan.style.setProperty('display', 'inline-block', 'important');
    textSpan.style.setProperty('text-align', 'left', 'important');
    textSpan.style.setProperty('overflow', 'hidden', 'important');
    textSpan.style.setProperty('transition', 'none', 'important');
    textSpan.style.setProperty('width', '0px', 'important');
    textSpan.style.setProperty('min-width', '0px', 'important');
    textSpan.style.setProperty('max-width', '0px', 'important');

    btn.style.setProperty('transition', 'none', 'important');
    btn.style.setProperty('width', `${circleHeight}px`, 'important');
    btn.style.setProperty('min-width', `${circleHeight}px`, 'important');
    btn.style.setProperty('max-width', `${circleHeight}px`, 'important');
    btn.style.setProperty('padding', '0px', 'important');
    btn.style.setProperty('padding-left', '0px', 'important'); // Позиция "+" по левому краю в начальном кружке
    btn.style.setProperty('gap', '0px', 'important');
    btn.style.setProperty('justify-content', 'flex-start', 'important');
    btn.style.setProperty('opacity', '0', 'important');

    plusIcon.style.setProperty('transition', 'none', 'important');
    plusIcon.style.setProperty('transform', 'rotate(0deg)', 'important');

    void btn.offsetWidth; // Force layout reflow

    // t=20ms: Circle appears smoothly
    const t1 = setTimeout(() => {
      btn.style.setProperty('transition', 'opacity 0.16s ease', 'important');
      btn.style.setProperty('opacity', '1', 'important');
    }, 20);
    this._addHabitAnimTimers.push(t1);

    // Stage 2 & 3 (t=140ms): Circle stretches (0.72s) AND '+' rotates 180deg with identical 0.72s duration
    // Simultaneously textSpan smoothly expands to fullTextWidth so it is permanently in its exact final centered position
    const t2 = setTimeout(() => {
      btn.style.setProperty('transition', 'width 0.72s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.72s cubic-bezier(0.16, 1, 0.3, 1), padding 0.72s cubic-bezier(0.16, 1, 0.3, 1)', 'important');
      btn.style.setProperty('width', `${finalWidth}px`, 'important');
      btn.style.setProperty('max-width', `${finalWidth}px`, 'important');
      btn.style.setProperty('padding', '0 10px', 'important');
      btn.style.setProperty('gap', '5px', 'important');

      textSpan.style.setProperty('transition', 'width 0.72s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.72s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.72s cubic-bezier(0.16, 1, 0.3, 1)', 'important');
      textSpan.style.setProperty('width', `${fullTextWidth}px`, 'important');
      textSpan.style.setProperty('min-width', `${fullTextWidth}px`, 'important');
      textSpan.style.setProperty('max-width', `${fullTextWidth}px`, 'important');

      plusIcon.style.setProperty('transition', 'transform 0.72s cubic-bezier(0.16, 1, 0.3, 1)', 'important');
      plusIcon.style.setProperty('transform', 'rotate(180deg)', 'important');
    }, 140);
    this._addHabitAnimTimers.push(t2);

    // Stage 4 (t=260ms): Typewriter effect strictly letter-by-letter from left to right
    const t3 = setTimeout(() => {
      let charIndex = 0;
      const stepMs = Math.max(30, Math.min(60, Math.round(420 / fullText.length)));
      const typeInterval = setInterval(() => {
        const container = document.getElementById('tabsSubstrateContainer');
        if (!container || !container.classList.contains('is-expanded')) {
          clearInterval(typeInterval);
          return;
        }

        charIndex++;
        textSpan.textContent = fullText.slice(0, charIndex);
        if (charIndex >= fullText.length) {
          textSpan.textContent = fullText;
          clearInterval(typeInterval);
        }
      }, stepMs);
      this._addHabitAnimTimers.push(typeInterval);
    }, 260);
    this._addHabitAnimTimers.push(t3);

    // After animation settles (t=900ms), clean up transition only - ZERO position jump
    const t4 = setTimeout(() => {
      btn.style.removeProperty('transition');
      textSpan.style.removeProperty('transition');
      // Keep plusIcon at rotate(180deg) clockwise; remove inline transition so CSS handles hover
      plusIcon.style.removeProperty('transition');
    }, 900);
    this._addHabitAnimTimers.push(t4);
  }

  // Reset button animation when collapsing
  resetAddHabitButtonAnimation() {
    if (this._addHabitAnimTimers && Array.isArray(this._addHabitAnimTimers)) {
      this._addHabitAnimTimers.forEach(t => {
        clearTimeout(t);
        clearInterval(t);
      });
    }
    this._addHabitAnimTimers = [];

    const btn = document.getElementById('btnAddHabit');
    const slot = document.getElementById('habitAddSlot');

    // Immediately remove inline sizing from slot so flex layout expands weekDaysTrack
    if (slot) {
      slot.style.removeProperty('width');
      slot.style.removeProperty('flex');
      slot.style.removeProperty('max-width');
      slot.style.removeProperty('padding-right');
    }

    if (btn) {
      btn.style.setProperty('transition', 'opacity 0.15s ease', 'important');
      btn.style.setProperty('opacity', '0', 'important');
      btn.style.removeProperty('width');
      btn.style.removeProperty('min-width');
      btn.style.removeProperty('max-width');
      btn.style.removeProperty('padding');
      btn.style.removeProperty('padding-left');
      btn.style.removeProperty('padding-right');
      btn.style.removeProperty('justify-content');
      btn.style.removeProperty('gap');
      const plusIcon = btn.querySelector('.plus-icon');
      if (plusIcon) {
        plusIcon.style.setProperty('transition', 'none', 'important');
        plusIcon.style.setProperty('transform', 'rotate(0deg)', 'important');
        plusIcon.style.removeProperty('transform');
        plusIcon.style.removeProperty('transition');
      }
      const textSpan = btn.querySelector('.btn-add-habit-text');
      if (textSpan) {
        const fullText = textSpan.getAttribute('data-full-text') || 'Привычка';
        textSpan.textContent = fullText;
        textSpan.style.removeProperty('width');
        textSpan.style.removeProperty('min-width');
        textSpan.style.removeProperty('max-width');
        textSpan.style.removeProperty('display');
        textSpan.style.removeProperty('text-align');
        textSpan.style.removeProperty('overflow');
        textSpan.style.removeProperty('transition');
      }
      const resetTimer = setTimeout(() => {
        const container = document.getElementById('tabsSubstrateContainer');
        if (!container || !container.classList.contains('is-expanded')) {
          btn.style.removeProperty('opacity');
          btn.style.removeProperty('transition');
        }
      }, 160);
      this._addHabitAnimTimers.push(resetTimer);
    }
  }

  // ==========================================================================
  // ADVANCED HABIT TRACKER METHODS
  // ==========================================================================

  // Load habits from LocalStorage & Plan4UStorage with normalization
  loadHabits() {
    let habitsList = [];
    const activePresetId = window.INITIAL_HABITS_ID || 'public_v1';

    try {
      const saved = localStorage.getItem('plan4u_habits') || localStorage.getItem('plan4u_habits.json');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) habitsList = parsed;
      }
    } catch (e) {
      console.warn('Could not load habits:', e);
    }

    // Check if habits list contains old mock placeholders from early prototypes
    const isOldDefault = habitsList.some(h => h.id === 'h_read' || h.id === 'h_meditate' || h.id === 'h_vitamin_d' || h.id === 'h_zaryadka');

    // Initial starter habits apply ONLY on brand-new clean installs or ancient prototypes.
    // Existing user habits (including updates on device) are NEVER wiped, reset, or overwritten!
    if (!habitsList || habitsList.length === 0 || isOldDefault) {
      if (window.INITIAL_HABITS && Array.isArray(window.INITIAL_HABITS) && window.INITIAL_HABITS.length > 0) {
        habitsList = JSON.parse(JSON.stringify(window.INITIAL_HABITS));
      } else {
        // Clean public 2 habits baseline: Water & Steps
        habitsList = [
          {
            id: 'h_water',
            title: '💧 Пить 2л воды',
            type: 'numeric',
            target: { value: 2, unit: 'л', step: 0.2 },
            schedule: { type: 'daily' },
            history: {}
          },
          {
            id: 'h_steps',
            title: '🚶 10 000 шагов',
            type: 'numeric',
            target: { value: 10000, unit: 'шагов', step: 1000 },
            schedule: { type: 'daily' },
            history: {}
          }
        ];
      }
      localStorage.setItem('plan4u_habits', JSON.stringify(habitsList));
      localStorage.setItem('plan4u_habits_preset_id', activePresetId);
    }

    // Normalize each habit to support new schema while keeping backwards compatibility
    habitsList.forEach(h => {
      if (!h.type) h.type = 'boolean';
      if (!h.history || typeof h.history !== 'object') h.history = {};
      if (h.type === 'numeric') {
        if (!h.target) h.target = { value: 1, unit: '' };
        if (!h.target.value) h.target.value = 1;
        let autoStep = Number((h.target.value / 10).toFixed(2));
        if (Number.isInteger(h.target.value) && autoStep >= 1) {
          autoStep = Math.round(autoStep);
        }
        h.target.step = Math.max(0.01, autoStep);
      }
      if (!h.schedule) h.schedule = { type: 'daily' };
      if (h.schedule.type === 'weekdays' && !Array.isArray(h.schedule.daysOfWeek)) {
        h.schedule.daysOfWeek = [1, 2, 3, 4, 5];
      }
      if (h.schedule.type === 'periodic' && !h.schedule.targetCount) {
        h.schedule.targetCount = 3;
        h.schedule.period = 'week';
      }
      if (h.reminderEnabled === undefined) {
        h.reminderEnabled = false;
      }
      if (!h.reminderTime) {
        h.reminderTime = '09:00';
      }
    });

    return habitsList;
  }

  // Get auto-calculated step (1/10th of target value)
  getHabitAutoStep(habit) {
    if (!habit) return 1;
    const val = (habit.target && habit.target.value) ? habit.target.value : 1;
    let step = Number((val / 10).toFixed(2));
    if (Number.isInteger(val) && step >= 1) {
      step = Math.round(step);
    }
    return Math.max(0.01, step);
  }

  // Save habits to LocalStorage & Plan4UStorage
  saveHabits() {
    try {
      localStorage.setItem('plan4u_habits', JSON.stringify(this.habits));
      if (window.Plan4UStorage && typeof Plan4UStorage.saveFile === 'function') {
        Plan4UStorage.saveFile('habits.json', this.habits);
      }
      this.triggerBackgroundBackup?.();
      this.scheduleCloudSync?.();
    } catch (e) {
      console.warn('Could not save habits:', e);
    }
  }

  // Render habits rows with titles (left 1/3) and 7 day checkboxes/progress cells (right 2/3)
  renderHabits() {
    if (!this.habitsListContainer) {
      this.habitsListContainer = document.getElementById('habitsListContainer');
      if (!this.habitsListContainer) return;
    }

    const todayStr = this.getTodayDateString();
    const [ty, tm, td] = todayStr.split('-').map(Number);
    const todayObj = new Date(ty, tm - 1, td);

    // Clean up any accidental future dates in habits history
    if (this.habits && Array.isArray(this.habits)) {
      let cleaned = false;
      this.habits.forEach(h => {
        if (h.history && typeof h.history === 'object') {
          Object.keys(h.history).forEach(ds => {
            if (ds > todayStr) {
              delete h.history[ds];
              cleaned = true;
            }
          });
        }
      });
      if (cleaned) {
        this.saveHabits();
      }
    }

    // 7-day rolling window ending on TODAY (index 6 is today)
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const dayOffset = 6 - i;
      const dayDate = new Date(todayObj);
      dayDate.setDate(todayObj.getDate() - dayOffset);
      const dayDateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
      weekDates.push(dayDateStr);
    }

    if (!this.habits || this.habits.length === 0) {
      this.habitsListContainer.innerHTML = '';
      const emptyEl = document.createElement('div');
      emptyEl.className = 'habits-empty-state habit-empty-hint';
      emptyEl.textContent = window.Plan4UI18n ? Plan4UI18n.t('habit_empty_hint', {}, this.currentLang) : 'Нажмите «+ Привычка», чтобы добавить первую цель';
      this.habitsListContainer.appendChild(emptyEl);
      this._habitsDirty = false;
      this.updateSubstrateTrayHeight();
      return;
    }

    const fragment = document.createDocumentFragment();

    this.habits.forEach((habit, habitIdx) => {
      const row = document.createElement('div');
      row.className = 'habit-row';
      row.dataset.habitId = habit.id;
      row.style.animationDelay = `${Math.min(habitIdx * 0.035, 0.28)}s`;

      // Col 1: Habit title box (left 1/3)
      const colTitle = document.createElement('div');
      colTitle.className = 'habit-col-title';

      const titleBox = document.createElement('div');
      titleBox.className = 'habit-title-box';
      titleBox.title = 'Нажмите для настройки и статистики привычки';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'habit-title-text';
      titleSpan.textContent = habit.title;

      let periodicCompletions = 0;
      let periodicTarget = 3;
      if (habit.schedule?.type === 'periodic') {
        periodicTarget = habit.schedule.targetCount || 3;
        const period = habit.schedule.period || 'week';
        if (period === 'month') {
          const daysInMonth = new Date(ty, tm, 0).getDate();
          for (let d = 1; d <= daysInMonth; d++) {
            const cds = `${ty}-${String(tm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const hEntry = habit.history && habit.history[cds];
            if (habit.type === 'numeric') {
              const cur = typeof hEntry === 'object' ? (hEntry.current || 0) : (hEntry ? (habit.target?.value || 1) : 0);
              const tgt = (habit.target && habit.target.value) ? habit.target.value : 1;
              if (cur >= tgt) periodicCompletions++;
            } else {
              if (typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry) periodicCompletions++;
            }
          }
        } else {
          // 'week' - Monday to Sunday containing today
          const monOffset = (todayObj.getDay() + 6) % 7;
          const mondayDate = new Date(todayObj);
          mondayDate.setDate(todayObj.getDate() - monOffset);
          for (let i = 0; i < 7; i++) {
            const cd = new Date(mondayDate);
            cd.setDate(mondayDate.getDate() + i);
            const cds = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}-${String(cd.getDate()).padStart(2, '0')}`;
            const hEntry = habit.history && habit.history[cds];
            if (habit.type === 'numeric') {
              const cur = typeof hEntry === 'object' ? (hEntry.current || 0) : (hEntry ? (habit.target?.value || 1) : 0);
              const tgt = (habit.target && habit.target.value) ? habit.target.value : 1;
              if (cur >= tgt) periodicCompletions++;
            } else {
              if (typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry) periodicCompletions++;
            }
          }
        }
      }

      titleBox.appendChild(titleSpan);

      if (habit.reminderEnabled && habit.reminderTime) {
        const remBadge = document.createElement('span');
        remBadge.className = 'habit-reminder-badge';
        remBadge.textContent = `⏰ ${habit.reminderTime}`;
        remBadge.title = `Напоминание: ${habit.reminderTime}`;
        titleBox.appendChild(remBadge);
      }

      // Tap on title opens modal in edit / stats mode
      titleBox.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        this.openHabitModal('edit', habit.id);
      });

      colTitle.appendChild(titleBox);

      // Col 2: 7 Checkboxes / progress cells (right 2/3)
      const colChecks = document.createElement('div');
      colChecks.className = 'habit-col-checks';

      weekDates.forEach((dateStr) => {
        const isToday = (dateStr === todayStr);
        const isFuture = (dateStr > todayStr);
        const [dy, dm, dd] = dateStr.split('-').map(Number);
        const cellDateObj = new Date(dy, dm - 1, dd);
        const cellDow = cellDateObj.getDay(); // 0 is Sunday, 1 is Monday...

        // Check if day is scheduled
        let isScheduledDay = true;
        if (habit.schedule?.type === 'weekdays') {
          const dows = habit.schedule.daysOfWeek || [1, 2, 3, 4, 5];
          isScheduledDay = dows.includes(cellDow);
        } else if (habit.schedule?.type === 'periodic') {
          const hEntryForCell = habit.history && habit.history[dateStr];
          const isCellDone = habit.type === 'numeric'
            ? ((typeof hEntryForCell === 'object' ? (hEntryForCell.current || 0) : (hEntryForCell ? (habit.target?.value || 1) : 0)) >= (habit.target?.value || 1))
            : (typeof hEntryForCell === 'object' ? !!hEntryForCell.completed : !!hEntryForCell);

          // If target met and cell is not done, it is a rest day (dashed subtle border)
          if (!isCellDone && periodicCompletions >= periodicTarget) {
            isScheduledDay = false;
          }
        }

        const hEntry = habit.history && habit.history[dateStr];
        const checkBtn = document.createElement('button');
        checkBtn.type = 'button';
        checkBtn.dataset.habitId = habit.id;
        checkBtn.dataset.date = dateStr;

        if (habit.type === 'numeric') {
          // Numeric habit cell
          const tgtVal = Number((habit.target && habit.target.value) ? habit.target.value : 1);
          let curVal = 0;
          if (typeof hEntry === 'object') {
            curVal = (hEntry.current !== undefined) ? Number(hEntry.current) : (hEntry.completed ? tgtVal : 0);
          } else if (hEntry) {
            curVal = tgtVal;
          }
          curVal = Number(curVal) || 0;
          const isDone = curVal >= tgtVal;
          const pct = Math.min(Math.max((curVal / tgtVal) * 100, 0), 100);

          let cls = 'habit-check-btn is-numeric';
          if (isDone) cls += ' checked';
          if (isToday) cls += ' is-today';
          if (isFuture) cls += ' is-future';
          if (!isScheduledDay) cls += ' is-scheduled-off';
          checkBtn.className = cls;
          if (isFuture) checkBtn.disabled = true;

          checkBtn.title = `${dateStr}: ${curVal} / ${tgtVal} ${habit.target?.unit || ''} (${Math.round((curVal / tgtVal) * 100)}%)`;

          if (isDone) {
            checkBtn.innerHTML = `
              <div class="habit-cell-fill-bar" style="height: 100%;"></div>
              <svg class="habit-cell-check-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: relative; z-index: 2;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            `;
          } else if (curVal > 0) {
            const pctInt = Math.min(99, Math.max(1, Math.round(pct)));
            checkBtn.innerHTML = `
              <div class="habit-cell-fill-bar" style="height: ${pct}%;"></div>
              <span class="habit-cell-num">${pctInt}%</span>
            `;
          } else {
            checkBtn.innerHTML = `
              <div class="habit-cell-fill-bar" style="height: 0%;"></div>
            `;
          }

          let lastStepperTimestamp = 0;
          checkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const now = Date.now();
            if (now - lastStepperTimestamp < 350) return;
            lastStepperTimestamp = now;

            if (dateStr > this.getTodayDateString()) return;
            triggerHaptic(15);
            this.openHabitStepper(habit.id, dateStr, checkBtn);
          });
        } else {
          // Boolean habit cell
          const isChecked = typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry;

          let cls = 'habit-check-btn';
          if (isChecked) cls += ' checked';
          if (isToday) cls += ' is-today';
          if (isFuture) cls += ' is-future';
          if (!isScheduledDay) cls += ' is-scheduled-off';
          checkBtn.className = cls;
          if (isFuture) checkBtn.disabled = true;

          checkBtn.title = isChecked ? `${dateStr}: Выполнено` : dateStr;
          if (isChecked) {
            checkBtn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          }

          let lastToggleTimestamp = 0;
          checkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const now = Date.now();
            if (now - lastToggleTimestamp < 350) return;
            lastToggleTimestamp = now;

            if (dateStr > this.getTodayDateString()) return;
            this.toggleHabitDay(habit.id, dateStr, checkBtn);
          });
        }

        colChecks.appendChild(checkBtn);
      });

      row.appendChild(colTitle);
      row.appendChild(colChecks);
      fragment.appendChild(row);
    });

    this.habitsListContainer.innerHTML = '';
    this.habitsListContainer.appendChild(fragment);
    this._habitsDirty = false;
    this.updateSubstrateTrayHeight();
  }

  // Toggle habit completed for a specific date (boolean)
  toggleHabitDay(habitId, dateStr, buttonEl) {
    const todayStr = this.getTodayDateString();
    if (dateStr > todayStr) return; // Disallow marking habits in the future

    const habit = (this.habits || []).find(h => h.id === habitId);
    if (!habit) return;

    if (!habit.history) habit.history = {};
    const hEntry = habit.history[dateStr];
    const isCurrentlyChecked = typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry;
    const willBeChecked = !isCurrentlyChecked;

    if (willBeChecked) {
      habit.history[dateStr] = { completed: true, timestamp: Date.now() };
      try {
        triggerHaptic(20);
        this.playCompletionSound();
        const stats = this.calculateHabitStats(habit);
        this.checkHabitPetMilestone(habit, stats.currentStreak);
      } catch (err) {
        console.warn('Non-critical habit reward effect failed:', err);
      }
    } else {
      delete habit.history[dateStr];
      try {
        triggerHaptic(10);
      } catch (e) { }
    }

    // Surgical in-place DOM update instead of destroying and rebuilding all habits!
    const targetBtn = buttonEl || document.querySelector(`.habit-check-btn[data-habit-id="${habitId}"][data-date="${dateStr}"]`);
    if (targetBtn) {
      targetBtn.classList.toggle('checked', willBeChecked);
      targetBtn.title = willBeChecked ? `${dateStr}: Выполнено` : dateStr;
      if (willBeChecked) {
        targetBtn.classList.add('just-checked');
        setTimeout(() => targetBtn.classList.remove('just-checked'), 400);
        targetBtn.innerHTML = '<svg class="check-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      } else {
        targetBtn.innerHTML = '';
      }
    }

    this.saveHabits();
    try {
      this.updateWeekDaysProgress();
    } catch (e) { }
  }

  // Open the Habit Modal in 'create' or 'edit' mode
  openHabitModal(mode = 'create', habitId = null) {
    this.dismissActiveKeyboard();
    this._habitModalOpenedAt = Date.now();
    this.currentEditingHabitId = habitId;

    const backdrop = document.getElementById('habitModalBackdrop');
    const titleEl = document.getElementById('habitModalTitle');
    const tabsEl = document.getElementById('habitModalTabs');
    const statsPane = document.getElementById('habitStatsPane');
    const formPane = document.getElementById('habitModalForm');
    const dangerZone = document.getElementById('habitDangerZone');
    const submitBtn = document.getElementById('habitModalSubmitBtn');

    if (!backdrop) return;

    if (mode === 'edit' && habitId) {
      const habit = (this.habits || []).find(h => h.id === habitId);
      if (!habit) return;

      if (titleEl) titleEl.textContent = habit.title;
      if (tabsEl) tabsEl.style.display = 'flex';
      if (dangerZone) dangerZone.style.display = 'block';
      if (submitBtn) submitBtn.textContent = window.Plan4UI18n ? Plan4UI18n.t('habit_btn_save', {}, this.currentLang) : 'Сохранить';

      // Switch to stats tab by default in edit mode
      this.switchHabitModalTab('stats');
      this.populateHabitForm(habit);

      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      triggerHaptic(15);

      requestAnimationFrame(() => {
        this.renderHabitStats(habit);
      });
      return;
    } else {
      // Create mode
      if (titleEl) titleEl.textContent = window.Plan4UI18n ? Plan4UI18n.t('habit_modal_title_new', {}, this.currentLang) : 'Новая привычка';
      if (tabsEl) tabsEl.style.display = 'none';
      if (statsPane) statsPane.style.display = 'none';
      if (formPane) formPane.style.display = 'flex';
      if (dangerZone) dangerZone.style.display = 'none';
      if (submitBtn) submitBtn.textContent = window.Plan4UI18n ? Plan4UI18n.t('habit_btn_create', {}, this.currentLang) : 'Создать привычку';

      this.resetHabitForm();
    }

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    triggerHaptic(15);
  }

  // Close the Habit Modal
  closeHabitModal() {
    const backdrop = document.getElementById('habitModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    const periodMenu = document.getElementById('habitPeriodDropdownMenu');
    const periodBtn = document.getElementById('habitPeriodDropdownBtn');
    if (periodMenu) periodMenu.classList.remove('show');
    if (periodBtn) {
      periodBtn.classList.remove('open');
      periodBtn.setAttribute('aria-expanded', 'false');
    }
    this.currentEditingHabitId = null;
  }

  // Switch tabs in habit modal (stats vs settings)
  switchHabitModalTab(tabName) {
    const tabStatsBtn = document.getElementById('habitTabBtnStats');
    const tabSettingsBtn = document.getElementById('habitTabBtnSettings');
    const statsPane = document.getElementById('habitStatsPane');
    const formPane = document.getElementById('habitModalForm');

    if (tabName === 'stats') {
      tabStatsBtn?.classList.add('active');
      tabSettingsBtn?.classList.remove('active');
      if (statsPane) statsPane.style.display = 'flex';
      if (formPane) formPane.style.display = 'none';
    } else {
      tabSettingsBtn?.classList.add('active');
      tabStatsBtn?.classList.remove('active');
      if (formPane) formPane.style.display = 'flex';
      if (statsPane) statsPane.style.display = 'none';
      requestAnimationFrame(() => {
        const currentTime = document.getElementById('habitReminderTimeInput')?.value || '09:00';
        this.setHabitWheelTime(currentTime);
      });
    }
  }

  // Initialize and populate minimalist time wheel picker (hours 00..23 and minutes 00..59)
  initHabitTimeWheelPicker() {
    const hoursList = document.getElementById('habitHoursList');
    const minutesList = document.getElementById('habitMinutesList');
    const hoursCol = document.getElementById('habitHoursCol');
    const minutesCol = document.getElementById('habitMinutesCol');
    const timeInput = document.getElementById('habitReminderTimeInput');

    if (!hoursList || !minutesList || !hoursCol || !minutesCol) return;

    // 1. Populate hours (00..23)
    if (!hoursList.children.length) {
      for (let h = 0; h < 24; h++) {
        const val = String(h).padStart(2, '0');
        const item = document.createElement('div');
        item.className = 'habit-picker-item';
        item.dataset.val = val;
        item.textContent = val;
        item.addEventListener('click', () => {
          hoursCol.scrollTo({ top: h * 44, behavior: 'smooth' });
          triggerHaptic(10);
        });
        hoursList.appendChild(item);
      }
    }

    // 2. Populate minutes (00..59)
    if (!minutesList.children.length) {
      for (let m = 0; m < 60; m++) {
        const val = String(m).padStart(2, '0');
        const item = document.createElement('div');
        item.className = 'habit-picker-item';
        item.dataset.val = val;
        item.textContent = val;
        item.addEventListener('click', () => {
          minutesCol.scrollTo({ top: m * 44, behavior: 'smooth' });
          triggerHaptic(10);
        });
        minutesList.appendChild(item);
      }
    }

    // Helper to update current time input
    const updateTimeValue = () => {
      const hIdx = Math.max(0, Math.min(23, Math.round(hoursCol.scrollTop / 44)));
      const mIdx = Math.max(0, Math.min(59, Math.round(minutesCol.scrollTop / 44)));
      const hStr = String(hIdx).padStart(2, '0');
      const mStr = String(mIdx).padStart(2, '0');
      if (timeInput) {
        timeInput.value = `${hStr}:${mStr}`;
      }
    };

    // Scroll listeners with snap highlighting and tactile haptic ticks
    if (!hoursCol._wheelBound) {
      hoursCol._wheelBound = true;
      let lastHourIdx = -1;
      let hourScrollTimeout = null;
      hoursCol.addEventListener('scroll', () => {
        const idx = Math.max(0, Math.min(23, Math.round(hoursCol.scrollTop / 44)));
        if (idx !== lastHourIdx) {
          lastHourIdx = idx;
          triggerHaptic(5);
          Array.from(hoursList.children).forEach((el, i) => {
            el.classList.toggle('active', i === idx);
          });
          updateTimeValue();
        }
        clearTimeout(hourScrollTimeout);
        hourScrollTimeout = setTimeout(updateTimeValue, 100);
      }, { passive: true });
    }

    if (!minutesCol._wheelBound) {
      minutesCol._wheelBound = true;
      let lastMinIdx = -1;
      let minScrollTimeout = null;
      minutesCol.addEventListener('scroll', () => {
        const idx = Math.max(0, Math.min(59, Math.round(minutesCol.scrollTop / 44)));
        if (idx !== lastMinIdx) {
          lastMinIdx = idx;
          triggerHaptic(5);
          Array.from(minutesList.children).forEach((el, i) => {
            el.classList.toggle('active', i === idx);
          });
          updateTimeValue();
        }
        clearTimeout(minScrollTimeout);
        minScrollTimeout = setTimeout(updateTimeValue, 100);
      }, { passive: true });
    }
  }

  // Set the visual state of the habit time wheel picker
  setHabitWheelTime(timeStr) {
    this.initHabitTimeWheelPicker();
    const hoursList = document.getElementById('habitHoursList');
    const minutesList = document.getElementById('habitMinutesList');
    const hoursCol = document.getElementById('habitHoursCol');
    const minutesCol = document.getElementById('habitMinutesCol');
    const timeInput = document.getElementById('habitReminderTimeInput');

    if (!hoursCol || !minutesCol) return;

    const [hRaw, mRaw] = String(timeStr || '09:00').split(':');
    const h = Math.max(0, Math.min(23, parseInt(hRaw, 10) || 0));
    const m = Math.max(0, Math.min(59, parseInt(mRaw, 10) || 0));

    if (timeInput) {
      timeInput.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    if (hoursList) {
      Array.from(hoursList.children).forEach((el, i) => {
        el.classList.toggle('active', i === h);
      });
    }
    if (minutesList) {
      Array.from(minutesList.children).forEach((el, i) => {
        el.classList.toggle('active', i === m);
      });
    }

    const applyScroll = () => {
      hoursCol.scrollTop = h * 44;
      minutesCol.scrollTop = m * 44;
    };

    applyScroll();
    requestAnimationFrame(applyScroll);
    setTimeout(applyScroll, 40);
  }

  // Populate habit form with existing habit data
  populateHabitForm(habit) {
    const idInput = document.getElementById('habitEditId');
    const titleInput = document.getElementById('habitTitleInput');
    const targetInput = document.getElementById('habitTargetInput');
    const customUnitInput = document.getElementById('habitUnitCustomInput');
    const periodicCountInput = document.getElementById('habitPeriodicCountInput');
    const periodicSelect = document.getElementById('habitPeriodicSelect');

    if (idInput) idInput.value = habit.id;
    if (titleInput) titleInput.value = habit.title;

    // Type
    this.setHabitFormType(habit.type || 'boolean');

    if (habit.type === 'numeric') {
      if (targetInput) targetInput.value = habit.target?.value || 1;

      // Select unit chip
      const currentUnit = habit.target?.unit || '';
      let matchedChip = false;
      document.querySelectorAll('#habitUnitChips .habit-unit-chip').forEach(chip => {
        if (chip.dataset.unit === currentUnit) {
          chip.classList.add('active');
          matchedChip = true;
        } else {
          chip.classList.remove('active');
        }
      });
      if (customUnitInput) {
        customUnitInput.value = matchedChip ? '' : currentUnit;
      }
    }

    // Schedule
    const schedType = habit.schedule?.type || 'daily';
    const radio = document.querySelector(`input[name="habitScheduleRadio"][value="${schedType}"]`);
    if (radio) {
      radio.checked = true;
      this.updateHabitScheduleUI(schedType);
    }

    if (schedType === 'weekdays') {
      const dows = habit.schedule?.daysOfWeek || [1, 2, 3, 4, 5];
      document.querySelectorAll('#habitWeekdaysPicker .habit-dow-btn').forEach(btn => {
        const val = Number(btn.dataset.dow);
        btn.classList.toggle('active', dows.includes(val));
      });
    } else if (schedType === 'periodic') {
      if (periodicCountInput) periodicCountInput.value = habit.schedule?.targetCount || 3;
      if (periodicSelect) periodicSelect.value = habit.schedule?.period || 'week';
    }

    // Habit reminder
    const reminderToggle = document.getElementById('habitReminderToggle');
    const reminderTimeBox = document.getElementById('habitReminderTimeBox');
    const reminderOn = !!habit.reminderEnabled;
    const reminderTime = habit.reminderTime || '09:00';

    if (reminderToggle) reminderToggle.checked = reminderOn;
    if (reminderTimeBox) reminderTimeBox.style.display = reminderOn ? 'block' : 'none';
    this.setHabitWheelTime(reminderTime);
  }

  // Reset habit form for creating a new habit
  resetHabitForm() {
    const idInput = document.getElementById('habitEditId');
    const titleInput = document.getElementById('habitTitleInput');
    const targetInput = document.getElementById('habitTargetInput');
    const customUnitInput = document.getElementById('habitUnitCustomInput');
    const periodicCountInput = document.getElementById('habitPeriodicCountInput');
    const periodicSelect = document.getElementById('habitPeriodicSelect');

    if (idInput) idInput.value = '';
    if (titleInput) {
      titleInput.value = '';
    }
    if (targetInput) targetInput.value = '8000';
    if (customUnitInput) customUnitInput.value = '';

    // Default: Boolean type
    this.setHabitFormType('boolean');

    // Default unit chip: 'шагов'
    document.querySelectorAll('#habitUnitChips .habit-unit-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.unit === 'шагов');
    });

    // Default schedule: daily
    const dailyRadio = document.querySelector('input[name="habitScheduleRadio"][value="daily"]');
    if (dailyRadio) {
      dailyRadio.checked = true;
      this.updateHabitScheduleUI('daily');
    }

    // Weekdays default: Пн-Пт active
    document.querySelectorAll('#habitWeekdaysPicker .habit-dow-btn').forEach(btn => {
      const d = Number(btn.dataset.dow);
      btn.classList.toggle('active', [1, 2, 3, 4, 5].includes(d));
    });

    if (periodicCountInput) periodicCountInput.value = '3';
    if (periodicSelect) periodicSelect.value = 'week';

    // Default reminder: disabled, 09:00
    const reminderToggle = document.getElementById('habitReminderToggle');
    const reminderTimeBox = document.getElementById('habitReminderTimeBox');
    if (reminderToggle) reminderToggle.checked = false;
    if (reminderTimeBox) reminderTimeBox.style.display = 'none';
    this.setHabitWheelTime('09:00');
  }

  // Set active habit type in form UI
  setHabitFormType(type) {
    const btnBool = document.getElementById('habitTypeBtnBoolean');
    const btnNum = document.getElementById('habitTypeBtnNumeric');
    const numOpts = document.getElementById('habitNumericOptions');

    if (type === 'numeric') {
      btnNum?.classList.add('active');
      btnBool?.classList.remove('active');
      if (numOpts) numOpts.style.display = 'block';
    } else {
      btnBool?.classList.add('active');
      btnNum?.classList.remove('active');
      if (numOpts) numOpts.style.display = 'none';
    }
  }

  // Update schedule picker visibility
  updateHabitScheduleUI(schedType) {
    const weekdaysPicker = document.getElementById('habitWeekdaysPicker');
    const periodicPicker = document.getElementById('habitPeriodicPicker');

    if (weekdaysPicker) weekdaysPicker.style.display = (schedType === 'weekdays') ? 'flex' : 'none';
    if (periodicPicker) periodicPicker.style.display = (schedType === 'periodic') ? 'block' : 'none';
  }

  // Save habit from modal form submission
  saveHabitFromModal() {
    const idInput = document.getElementById('habitEditId');
    const titleInput = document.getElementById('habitTitleInput');
    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      if (titleInput) {
        titleInput.focus();
        if (typeof titleInput.reportValidity === 'function') {
          titleInput.reportValidity();
        }
      }
      return;
    }

    const isNumeric = document.getElementById('habitTypeBtnNumeric')?.classList.contains('active');
    const type = isNumeric ? 'numeric' : 'boolean';

    let targetObj = null;
    if (isNumeric) {
      const targetInput = document.getElementById('habitTargetInput');
      const customUnitInput = document.getElementById('habitUnitCustomInput');
      const activeUnitChip = document.querySelector('#habitUnitChips .habit-unit-chip.active');

      const val = Math.max(0.1, parseFloat(targetInput?.value) || 1);
      // Auto-calculate step as 1/10th of target
      let step = Number((val / 10).toFixed(2));
      if (Number.isInteger(val) && step >= 1) {
        step = Math.round(step);
      }
      step = Math.max(0.01, step);
      const unit = (customUnitInput?.value.trim()) || (activeUnitChip?.dataset.unit) || '';

      targetObj = { value: val, unit: unit, step: step };
    }

    // Schedule
    const schedRadio = document.querySelector('input[name="habitScheduleRadio"]:checked');
    const schedType = schedRadio ? schedRadio.value : 'daily';
    const scheduleObj = { type: schedType };

    if (schedType === 'weekdays') {
      const dows = [];
      document.querySelectorAll('#habitWeekdaysPicker .habit-dow-btn.active').forEach(btn => {
        dows.push(Number(btn.dataset.dow));
      });
      scheduleObj.daysOfWeek = dows.length > 0 ? dows : [1, 2, 3, 4, 5];
    } else if (schedType === 'periodic') {
      const countInput = document.getElementById('habitPeriodicCountInput');
      const selectPeriod = document.getElementById('habitPeriodicSelect');
      scheduleObj.targetCount = Math.max(1, parseInt(countInput?.value, 10) || 3);
      scheduleObj.period = selectPeriod ? selectPeriod.value : 'week';
    }

    // Reminder
    const reminderToggle = document.getElementById('habitReminderToggle');
    const reminderTimeInput = document.getElementById('habitReminderTimeInput');
    const reminderEnabled = !!reminderToggle?.checked;
    const reminderTime = reminderTimeInput ? (reminderTimeInput.value || '09:00') : '09:00';

    const editId = idInput ? idInput.value : '';
    let savedHabit = null;
    if (editId) {
      // Update existing
      const habit = (this.habits || []).find(h => h.id === editId);
      if (habit) {
        habit.title = title;
        habit.type = type;
        if (targetObj) habit.target = targetObj;
        habit.schedule = scheduleObj;
        habit.reminderEnabled = reminderEnabled;
        habit.reminderTime = reminderTime;
        savedHabit = habit;
      }
    } else {
      // Create new habit
      const newHabit = {
        id: 'h_' + Date.now(),
        title: title,
        type: type,
        target: targetObj,
        schedule: scheduleObj,
        reminderEnabled: reminderEnabled,
        reminderTime: reminderTime,
        created: Date.now(),
        history: {}
      };
      if (!this.habits) this.habits = [];
      this.habits.push(newHabit);
      savedHabit = newHabit;
    }

    if (savedHabit) {
      if (savedHabit.reminderEnabled) {
        this.scheduleHabitNotification(savedHabit);
      } else {
        this.cancelHabitNotification(savedHabit.id);
      }
    }

    this.saveHabits();
    this.renderHabits();
    this.updateWeekDaysProgress();
    this.closeHabitModal();
    triggerHaptic(25);
  }

  // Delete habit with modal confirmation
  deleteHabit(habitId) {
    const habit = (this.habits || []).find(h => h.id === habitId);
    if (!habit) return;

    const confirmTitle = window.Plan4UI18n ? Plan4UI18n.t('habit_delete_confirm_title', {}, this.currentLang) : 'Удалить привычку?';
    const confirmMsg = window.Plan4UI18n
      ? Plan4UI18n.t('habit_delete_confirm_msg', { title: habit.title }, this.currentLang)
      : `Вы действительно хотите удалить цель «${habit.title}»?`;

    if (this.showConfirmModal) {
      this.showConfirmModal({
        title: confirmTitle,
        message: confirmMsg,
        icon: '🗑️',
        confirmText: 'Удалить',
        onConfirm: () => {
          this.cancelHabitNotification(habitId);
          this.habits = (this.habits || []).filter(h => h.id !== habitId);
          this.saveHabits();
          this.renderHabits();
          this.updateWeekDaysProgress();
          this.closeHabitModal();
          triggerHaptic(15);
        }
      });
    } else {
      this.cancelHabitNotification(habitId);
      this.habits = (this.habits || []).filter(h => h.id !== habitId);
      this.saveHabits();
      this.renderHabits();
      this.updateWeekDaysProgress();
      this.closeHabitModal();
      triggerHaptic(15);
    }
  }

  // Render habit statistics & analytical sections
  renderHabitStats(habit) {
    const streakValEl = document.getElementById('habitStatStreakVal');
    const streakSubEl = document.getElementById('habitStatStreakSub');
    const recordValEl = document.getElementById('habitStatRecordVal');
    const recordSubEl = document.getElementById('habitStatRecordSub');
    const rateValEl = document.getElementById('habitStatRateVal');
    const rateSubEl = document.getElementById('habitStatRateSub');
    const dynamicIconEl = document.getElementById('habitStatDynamicIcon');
    const dynamicValEl = document.getElementById('habitStatDynamicVal');
    const dynamicLblEl = document.getElementById('habitStatDynamicLbl');
    const dynamicSubEl = document.getElementById('habitStatDynamicSub');

    const stats = this.calculateHabitStats(habit);

    const dayUnit = window.Plan4UI18n ? Plan4UI18n.t('habit_days_unit', {}, this.currentLang) : 'дн.';
    const weekUnit = window.Plan4UI18n ? Plan4UI18n.t('habit_weeks_unit', {}, this.currentLang) : 'нед.';
    const unitSuffix = habit.schedule?.type === 'periodic' ? weekUnit : dayUnit;

    // 1. Current Streak Card with date range
    if (streakValEl) streakValEl.textContent = `${stats.currentStreak} ${unitSuffix}`;
    if (streakSubEl) {
      if (stats.currentStreak > 0 && stats.currentStreakRange) {
        const rangeText = this.formatStreakDateRange(stats.currentStreakRange.start, stats.currentStreakRange.end);
        streakSubEl.textContent = stats.usedFreeze ? `${rangeText} • Выходной ☕` : rangeText;
      } else {
        streakSubEl.textContent = '—';
      }
    }

    // 2. Best Streak Card with date range
    if (recordValEl) recordValEl.textContent = `${stats.bestStreak} ${unitSuffix}`;
    if (recordSubEl) {
      if (stats.bestStreak > 0 && stats.bestStreakRange) {
        recordSubEl.textContent = this.formatStreakDateRange(stats.bestStreakRange.start, stats.bestStreakRange.end);
      } else {
        recordSubEl.textContent = window.Plan4UI18n ? Plan4UI18n.t('habit_stat_all_time', {}, this.currentLang) : 'за все время';
      }
    }

    // 3. Rate Card
    if (rateValEl) rateValEl.textContent = `${stats.rate}%`;
    if (rateSubEl) {
      rateSubEl.textContent = window.Plan4UI18n ? Plan4UI18n.t('habit_stat_days_30', {}, this.currentLang) : 'за 30 дней';
    }

    // 4. Dynamic Contextual Card (This Week / Daily Avg)
    if (dynamicValEl && dynamicLblEl && dynamicSubEl) {
      if (habit.type === 'numeric') {
        if (dynamicIconEl) dynamicIconEl.textContent = '💧';
        dynamicLblEl.textContent = window.Plan4UI18n ? Plan4UI18n.t('habit_stat_avg_day', {}, this.currentLang) : 'В среднем в день';
        dynamicValEl.textContent = `${stats.avgPerDay} ${habit.target?.unit || ''}`;
        dynamicSubEl.textContent = `цель: ${habit.target?.value || 1} ${habit.target?.unit || ''}`;
      } else {
        if (dynamicIconEl) dynamicIconEl.textContent = '🎯';
        dynamicLblEl.textContent = window.Plan4UI18n ? Plan4UI18n.t('habit_stat_this_week', {}, this.currentLang) : 'На этой неделе';
        dynamicValEl.textContent = `${stats.thisWeekCount} / ${stats.thisWeekTarget} ${dayUnit}`;
        if (stats.thisWeekCount >= stats.thisWeekTarget) {
          const metStr = window.Plan4UI18n ? Plan4UI18n.t('habit_stat_target_met', {}, this.currentLang) : '';
          dynamicSubEl.textContent = (metStr && metStr !== 'habit_stat_target_met') ? metStr : 'норма выполнена 🎯';
        } else {
          const left = stats.thisWeekTarget - stats.thisWeekCount;
          const leftStr = window.Plan4UI18n ? Plan4UI18n.t('habit_stat_days_left', { days: left }, this.currentLang) : '';
          dynamicSubEl.textContent = (leftStr && leftStr !== 'habit_stat_days_left') ? leftStr : `осталось ${left} дн.`;
        }
      }
    }

    // Section 1: Multi-Period History Bar Chart (12 columns: days, weeks, months, years)
    let activePeriod = this.currentHabitChartPeriod;
    if (!activePeriod) {
      try {
        activePeriod = localStorage.getItem('plan4u_habit_chart_period');
      } catch (e) { }
    }
    if (!activePeriod) {
      activePeriod = 'weeks';
    }
    this.currentHabitChartPeriod = activePeriod;

    this.updateHabitPeriodDropdownUI(activePeriod);
    this.currentHabitInModal = habit;
    this.currentHabitStats = stats;
    this.renderHabitChart(habit, stats, activePeriod);

    // Section 2: Heatmap & Weekday Activity Calendar (4 weeks aligned to Mon-Sun) & Frequency Matrix
    this.renderCalendarHeatmap(habit, stats);
    this.renderHabitFrequencyGrid(habit, stats);
    this.initHabitViewToggle();
  }

  // Update custom habit chart period dropdown UI
  updateHabitPeriodDropdownUI(activePeriod) {
    const periodSelect = document.getElementById('habitChartPeriodSelect');
    if (periodSelect) periodSelect.value = activePeriod;

    const currentIconEl = document.getElementById('habitPeriodCurrentIcon');
    const currentLabelEl = document.getElementById('habitPeriodCurrentLabel');
    const dropdownWrap = document.getElementById('habitPeriodDropdownWrap');

    const periodMeta = {
      days: { icon: '☀️', key: 'habit_chart_period_days', def: 'По дням' },
      weeks: { icon: '📅', key: 'habit_chart_period_weeks', def: 'По неделям' },
      months: { icon: '🗓️', key: 'habit_chart_period_months', def: 'По месяцам' },
      years: { icon: '📈', key: 'habit_chart_period_years', def: 'По годам' }
    };

    const meta = periodMeta[activePeriod] || periodMeta.weeks;
    if (currentIconEl) currentIconEl.textContent = meta.icon;
    if (currentLabelEl) {
      currentLabelEl.textContent = window.Plan4UI18n ? Plan4UI18n.t(meta.key, {}, this.currentLang) : meta.def;
      currentLabelEl.setAttribute('data-i18n', meta.key);
    }

    if (dropdownWrap) {
      dropdownWrap.querySelectorAll('.habit-period-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.period === activePeriod);
      });
    }
  }

  // Render 12-column bar chart for selected period (days / weeks / months / years)
  renderHabitChart(habit, stats, period = 'weeks') {
    const barsContainer = document.getElementById('habitWeeklyBars');
    const targetBadge = document.getElementById('habitStatTargetBadge');
    if (!barsContainer) return;

    const periodData = (stats.chartPeriods && stats.chartPeriods[period]) ? stats.chartPeriods[period] : (stats.chartPeriods?.weeks || null);
    const bars = periodData ? periodData.bars : (stats.weeklyBars || []);
    const targetVal = periodData ? periodData.target : (stats.targetPerWeek || 1);

    if (targetBadge && periodData) {
      const avgVal = periodData.avgStr || periodData.targetStr || '—';
      const avgBadgeText = window.Plan4UI18n
        ? Plan4UI18n.t('habit_stat_avg_badge', { val: avgVal }, this.currentLang)
        : `В среднем: ${avgVal}`;
      targetBadge.textContent = (avgBadgeText && avgBadgeText !== 'habit_stat_avg_badge')
        ? avgBadgeText
        : `В среднем: ${avgVal}`;
      if (periodData.targetStr) {
        targetBadge.title = `Цель: ${periodData.targetStr}`;
      }
    }

    barsContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    const maxCount = Math.max(targetVal, ...bars.map(b => b.count), 1);

    bars.forEach(item => {
      const col = document.createElement('div');
      col.className = `habit-chart-col${item.isTargetMet ? ' is-target-met' : ''}${item.isCurrent ? ' is-current-week' : ''}${item.isYearStart ? ' is-year-start' : ''}`;
      if (item.tooltip) {
        col.title = item.tooltip;
      }

      const hasCount = item.count > 0;
      const valText = hasCount ? item.count : '';
      const pctHeight = hasCount
        ? Math.min(100, Math.max(10, Math.round((item.count / maxCount) * 100)))
        : 0;

      const subTagHtml = item.yearTag
        ? `<span class="habit-chart-sub-tag">${item.yearTag}</span>`
        : (item.monthTag ? `<span class="habit-chart-sub-tag">${item.monthTag}</span>` : '');

      col.innerHTML = `
        <span class="habit-chart-val">${valText}</span>
        <div class="habit-chart-bar${hasCount ? '' : ' is-zero'}" style="height: ${hasCount ? pctHeight + '%' : '2px'};"></div>
        <span class="habit-chart-lbl${item.isYearStart ? ' is-year-start' : ''}">${item.label || ''}${subTagHtml}</span>
      `;
      fragment.appendChild(col);
    });

    // Add target threshold line
    if (targetVal <= maxCount && maxCount > 0) {
      const targetPct = Math.min(100, Math.round((targetVal / maxCount) * 100));
      const bottomPx = 24 + Math.round((targetPct / 100) * 82);
      const line = document.createElement('div');
      line.className = 'habit-chart-target-line';
      line.style.bottom = `${bottomPx}px`;
      fragment.appendChild(line);
    }
    barsContainer.appendChild(fragment);
  }

  // Format date range for streak bars (e.g. "30 мая — 9 сен")
  formatStreakDateRange(startStr, endStr) {
    if (!startStr) return '—';
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const fmt = (s) => {
      if (!s) return '';
      const [y, m, d] = s.split('-').map(Number);
      return `${d} ${months[m - 1]}`;
    };
    if (startStr === endStr) {
      return fmt(startStr);
    }
    return `${fmt(startStr)} — ${fmt(endStr)}`;
  }

  // Render 4-week calendar heatmap aligned to Monday-Sunday with weekday headers & best day highlight
  renderCalendarHeatmap(habit, stats) {
    const heatmapGrid = document.getElementById('habitHeatmapGrid');
    const insight = document.getElementById('habitWeekdaysInsight');

    // Highlight best day in weekday labels
    const dowLabels = document.querySelectorAll('#habitHeatmapDows .habit-heat-dow');
    dowLabels.forEach(el => {
      const dow = Number(el.dataset.dow);
      if (stats.bestDow && stats.bestDow.dow === dow && stats.bestDow.rate > 0) {
        el.classList.add('is-best-day');
        el.title = `⭐ ${stats.bestDow.rate}%`;
      } else {
        el.classList.remove('is-best-day');
        el.removeAttribute('title');
      }
    });

    if (heatmapGrid) {
      heatmapGrid.innerHTML = '';
      const fragment = document.createDocumentFragment();
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const currentDow = (today.getDay() + 6) % 7; // 0 for Mon ... 6 for Sun
      const currentMonday = new Date(today);
      currentMonday.setDate(today.getDate() - currentDow);
      currentMonday.setHours(0, 0, 0, 0);

      const startMonday = new Date(currentMonday);
      startMonday.setDate(currentMonday.getDate() - 21); // 3 weeks back Monday (4 weeks total)

      for (let i = 0; i < 28; i++) {
        const d = new Date(startMonday);
        d.setDate(startMonday.getDate() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const cell = document.createElement('div');
        const isFuture = dateStr > todayStr;
        const isToday = dateStr === todayStr;

        if (isFuture) {
          cell.className = 'habit-heat-cell is-future';
          cell.innerHTML = `<span class="habit-heat-date-num">${d.getDate()}</span>`;
        } else {
          const level = stats.heatLevels[dateStr] || 0;
          cell.className = `habit-heat-cell level-${level}${isToday ? ' is-today' : ''}`;
          cell.title = `${dateStr}: ${stats.heatLabels[dateStr] || '0%'}`;
          if (level === 3) {
            cell.innerHTML = `
              <span class="habit-heat-date-num">${d.getDate()}</span>
              <span class="habit-heat-check-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="6.5" height="6.5" stroke="currentColor" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            `;
          } else {
            cell.innerHTML = `<span class="habit-heat-date-num">${d.getDate()}</span>`;
          }
        }
        fragment.appendChild(cell);
      }
      heatmapGrid.appendChild(fragment);
    }

    if (insight) {
      if (stats.bestDow && stats.bestDow.rate > 0) {
        insight.textContent = window.Plan4UI18n
          ? Plan4UI18n.t('habit_stat_best_day', { day: stats.bestDow.name, rate: stats.bestDow.rate }, this.currentLang)
          : `⭐ Лучший день — ${stats.bestDow.name} (${stats.bestDow.rate}%)`;
        insight.style.display = 'flex';
      } else {
        insight.style.display = 'none';
      }
    }
  }

  // Initialize Segmented Toggle between 4-week Calendar Heatmap and Frequency Matrix
  initHabitViewToggle() {
    const btnHeatmap = document.getElementById('habitViewBtnHeatmap');
    const btnFrequency = document.getElementById('habitViewBtnFrequency');
    const paneHeatmap = document.getElementById('habitPaneHeatmap');
    const paneFrequency = document.getElementById('habitPaneFrequency');

    if (!btnHeatmap || !btnFrequency || !paneHeatmap || !paneFrequency) return;

    let savedMode = 'heatmap';
    try {
      savedMode = localStorage.getItem('plan4u_habit_view_mode') || 'heatmap';
    } catch (e) { }

    const applyViewMode = (mode) => {
      if (mode === 'frequency') {
        btnFrequency.classList.add('active');
        btnFrequency.setAttribute('aria-selected', 'true');
        btnHeatmap.classList.remove('active');
        btnHeatmap.setAttribute('aria-selected', 'false');
        paneHeatmap.style.display = 'none';
        paneFrequency.style.display = 'block';
      } else {
        btnHeatmap.classList.add('active');
        btnHeatmap.setAttribute('aria-selected', 'true');
        btnFrequency.classList.remove('active');
        btnFrequency.setAttribute('aria-selected', 'false');
        paneHeatmap.style.display = 'block';
        paneFrequency.style.display = 'none';
      }
    };

    applyViewMode(savedMode);

    if (!btnHeatmap.dataset.hasToggleListener) {
      btnHeatmap.dataset.hasToggleListener = 'true';
      btnFrequency.dataset.hasToggleListener = 'true';

      btnHeatmap.addEventListener('click', () => {
        triggerHaptic(12);
        applyViewMode('heatmap');
        try {
          localStorage.setItem('plan4u_habit_view_mode', 'heatmap');
        } catch (e) { }

        const insight = document.getElementById('habitWeekdaysInsight');
        if (insight && this.currentHabitStats?.bestDow) {
          insight.textContent = window.Plan4UI18n
            ? Plan4UI18n.t('habit_stat_best_day', { day: this.currentHabitStats.bestDow.name, rate: this.currentHabitStats.bestDow.rate }, this.currentLang)
            : `⭐ Лучший день — ${this.currentHabitStats.bestDow.name} (${this.currentHabitStats.bestDow.rate}%)`;
        }
      });

      btnFrequency.addEventListener('click', () => {
        triggerHaptic(12);
        applyViewMode('frequency');
        try {
          localStorage.setItem('plan4u_habit_view_mode', 'frequency');
        } catch (e) { }

        const insight = document.getElementById('habitWeekdaysInsight');
        if (insight && this.currentHabitStats?.bestDow) {
          insight.textContent = window.Plan4UI18n
            ? Plan4UI18n.t('habit_stat_best_day', { day: this.currentHabitStats.bestDow.name, rate: this.currentHabitStats.bestDow.rate }, this.currentLang)
            : `⭐ Самый активный день — ${this.currentHabitStats.bestDow.name} (${this.currentHabitStats.bestDow.rate}%)`;
        }
      });
    }
  }

  // Render Frequency Matrix (Weekdays x Months bubble matrix inspired by Loop Habit Tracker)
  renderHabitFrequencyGrid(habit, stats) {
    const container = document.getElementById('habitFreqMatrixContainer');
    if (!container || !stats.freqMonths || !stats.freqGrid) return;

    const wrap = document.createElement('div');
    wrap.className = 'habit-freq-matrix-wrap';

    const table = document.createElement('div');
    table.className = 'habit-freq-table';
    table.style.gridTemplateColumns = `26px repeat(${stats.freqMonths.length}, 1fr)`;

    const unit = habit.target?.unit || '';

    // 7 rows (Mon..Sun)
    stats.freqGrid.forEach(row => {
      // 1. Weekday label
      const dowLabel = document.createElement('div');
      dowLabel.className = 'habit-freq-dow-label';
      dowLabel.textContent = row.dowLabel;
      dowLabel.title = row.dowName;
      table.appendChild(dowLabel);

      // 2. Month bubble cells
      row.months.forEach(cellData => {
        const cell = document.createElement('div');
        cell.className = 'habit-freq-cell';

        const bubble = document.createElement('div');

        if (cellData.scheduled === 0 || cellData.rate === 0) {
          bubble.className = 'habit-freq-bubble is-empty';
          bubble.style.width = '2.5px';
          bubble.style.height = '2.5px';
          bubble.style.opacity = '0.16';
        } else {
          bubble.className = 'habit-freq-bubble';
          const size = Math.round(5 + (Math.pow(cellData.rate, 1.15) * 21));
          bubble.style.width = `${size}px`;
          bubble.style.height = `${size}px`;
          bubble.style.opacity = `${(0.42 + (0.58 * Math.pow(cellData.rate, 0.75))).toFixed(2)}`;
          if (cellData.rate >= 0.99) {
            bubble.style.boxShadow = '0 0 8px rgba(var(--primary-rgb, 216, 58, 136), 0.75)';
          }
        }
        cell.appendChild(bubble);

        // Tooltip calculation
        let tooltipText = '';
        if (cellData.scheduled === 0) {
          tooltipText = `${row.dowName}, ${cellData.monthLabel}: нет записей`;
        } else if (habit.type === 'numeric' && cellData.avgVal !== null) {
          tooltipText = `${row.dowName}, ${cellData.monthLabel}: ${cellData.completed} из ${cellData.scheduled} (${Math.round(cellData.rate * 100)}%) • в ср. ${cellData.avgVal}${unit ? ' ' + unit : ''}`;
        } else {
          tooltipText = `${row.dowName}, ${cellData.monthLabel}: ${cellData.completed} из ${cellData.scheduled} (${Math.round(cellData.rate * 100)}%)`;
        }

        cell.title = tooltipText;

        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerHaptic(10);
          wrap.querySelectorAll('.habit-freq-cell.is-selected').forEach(el => el.classList.remove('is-selected'));
          cell.classList.add('is-selected');

          const insight = document.getElementById('habitWeekdaysInsight');
          if (insight) {
            insight.textContent = `📍 ${tooltipText}`;
            insight.style.display = 'flex';
          }
        });

        table.appendChild(cell);
      });
    });

    // Bottom row: Empty corner + Month labels
    const emptyCorner = document.createElement('div');
    table.appendChild(emptyCorner);

    stats.freqMonths.forEach(m => {
      const mLabel = document.createElement('div');
      mLabel.className = 'habit-freq-month-label';
      mLabel.textContent = m.label;
      table.appendChild(mLabel);
    });

    wrap.appendChild(table);
    container.innerHTML = '';
    container.appendChild(wrap);
  }



  // Check and grant Pet treats upon reaching habit streak milestones
  checkHabitPetMilestone(habit, streak) {
    if (!this.petSystem || streak <= 0) return;
    const milestones = [3, 7, 14, 21, 30, 50, 100];
    if (!milestones.includes(streak)) return;

    if (!habit.lastAwardedMilestoneStreak) habit.lastAwardedMilestoneStreak = 0;
    if (habit.lastAwardedMilestoneStreak >= streak) return;

    habit.lastAwardedMilestoneStreak = streak;
    this.saveHabits();

    const isGolden = streak >= 7;
    if (isGolden) {
      this.petSystem.data.goldenTreats = (this.petSystem.data.goldenTreats || 0) + 1;
      this.petSystem.data.xp += 30;
      this.petSystem.spawnFlyingTreat('🥫');
    } else {
      this.petSystem.data.treats = (this.petSystem.data.treats || 0) + 1;
      this.petSystem.data.xp += 10;
      this.petSystem.spawnFlyingTreat('🟤');
    }

    this.petSystem.saveData(true);
    if (typeof this.petSystem.renderMiniCompanion === 'function') {
      this.petSystem.renderMiniCompanion();
    }

    const rewardTitle = isGolden ? '🥫 Золотую консерву (+30 XP)' : '🟤 Коричневый камушек (+10 XP)';
    if (this.showToast) {
      this.showToast(`🐾 Мейни дарит ${rewardTitle} за серию ${streak} дней!`, '🎉');
    }
  }

  // Calculate detailed streaks, records, total logged, success rate, weekly history, and weekday frequency
  calculateHabitStats(habit) {
    const history = habit.history || {};
    const today = new Date();
    let totalCount = 0;
    let totalSum = 0;

    const heatLevels = {};
    const heatLabels = {};

    let success30Count = 0;
    let scheduled30Count = 0;

    let earliestDate = habit.created ? new Date(habit.created) : new Date(today);
    if (isNaN(earliestDate.getTime())) earliestDate = new Date(today);
    if (habit.history && typeof habit.history === 'object') {
      const historyDates = Object.keys(habit.history).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
      if (historyDates.length > 0) {
        const [y, m, d] = historyDates[0].split('-').map(Number);
        const firstHistDate = new Date(y, m - 1, d);
        if (!isNaN(firstHistDate.getTime()) && firstHistDate < earliestDate) {
          earliestDate = firstHistDate;
        }
      }
    }
    const earliestDateStr = `${earliestDate.getFullYear()}-${String(earliestDate.getMonth() + 1).padStart(2, '0')}-${String(earliestDate.getDate()).padStart(2, '0')}`;

    const isDayCompleted = (dateStr) => {
      const hEntry = history[dateStr];
      if (!hEntry) return false;
      if (habit.type === 'numeric') {
        const cur = typeof hEntry === 'object' ? (hEntry.current || 0) : (habit.target?.value || 1);
        const tgt = (habit.target && habit.target.value) ? habit.target.value : 1;
        return cur >= tgt;
      }
      return typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry;
    };

    const isDayScheduled = (d) => {
      if (habit.schedule?.type === 'weekdays') {
        const dows = habit.schedule.daysOfWeek || [1, 2, 3, 4, 5];
        return dows.includes(d.getDay());
      }
      return true;
    };

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // Only count days from or after habit creation / first record
      if (dateStr < earliestDateStr) continue;

      const scheduled = isDayScheduled(d);
      if (scheduled) scheduled30Count++;

      const hEntry = history[dateStr];
      let frac = 0;
      let val = 0;

      if (habit.type === 'numeric') {
        const cur = typeof hEntry === 'object' ? (hEntry.current || 0) : (hEntry ? (habit.target?.value || 1) : 0);
        const tgt = (habit.target && habit.target.value) ? habit.target.value : 1;
        frac = Math.min(cur / tgt, 1.0);
        val = cur;
        totalSum += cur;
      } else {
        const done = typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry;
        frac = done ? 1.0 : 0.0;
        if (done) totalCount++;
      }

      if (frac >= 1.0) {
        success30Count++;
      }

    }

    let target30 = scheduled30Count;
    if (habit.schedule?.type === 'periodic') {
      const perCount = habit.schedule.targetCount || 3;
      target30 = habit.schedule.period === 'month' ? perCount : Math.round(perCount * (30 / 7));
    }
    const rate = target30 > 0 ? Math.min(100, Math.round((success30Count / target30) * 100)) : 0;
    const avgPerDay = scheduled30Count > 0 ? Number((totalSum / scheduled30Count).toFixed(1)) : 0;

    // Calculate 28-day calendar window aligned to Monday 3 weeks ago -> this Sunday
    const currentDow = (today.getDay() + 6) % 7; // 0 for Mon ... 6 for Sun
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - currentDow);
    currentMonday.setHours(0, 0, 0, 0);

    const startMonday = new Date(currentMonday);
    startMonday.setDate(currentMonday.getDate() - 21); // 3 weeks back Monday (4 full weeks = 28 days)

    const dayItems = [];
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    for (let i = 0; i < 28; i++) {
      const cd = new Date(startMonday);
      cd.setDate(startMonday.getDate() + i);
      const ds = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}-${String(cd.getDate()).padStart(2, '0')}`;
      const hEntry = history[ds];
      let frac = 0;
      let val = 0;
      let completed = false;
      if (habit.type === 'numeric') {
        const cur = typeof hEntry === 'object' ? (hEntry.current || 0) : (hEntry ? (habit.target?.value || 1) : 0);
        const tgt = (habit.target && habit.target.value) ? habit.target.value : 1;
        frac = tgt > 0 ? (cur / tgt) : 0;
        val = cur;
        completed = cur >= tgt;
      } else {
        completed = typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry;
        frac = completed ? 1.0 : 0.0;
      }
      dayItems.push({ date: cd, dateStr: ds, frac, val, completed, isFuture: ds > todayDateStr });
    }

    if (habit.schedule?.type === 'periodic') {
      const targetCount = habit.schedule.targetCount || 3;
      for (let w = 0; w < 4; w++) {
        const weekDays = dayItems.slice(w * 7, (w + 1) * 7);
        const completedCount = weekDays.filter(d => d.completed).length;

        weekDays.forEach(d => {
          if (d.completed) {
            heatLevels[d.dateStr] = 3;
            heatLabels[d.dateStr] = `100% (✓) • ${completedCount} из ${targetCount} дн.`;
          } else if (completedCount >= targetCount) {
            // Rest day in a fully satisfied week: light theme fill ("светлая заливка")
            heatLevels[d.dateStr] = 1;
            heatLabels[d.dateStr] = `Норма недели выполнена 🎯 (${completedCount} из ${targetCount} дн.)`;
          } else if (completedCount > 0) {
            // Day in an active in-progress week: light theme fill ("светлая заливка")
            heatLevels[d.dateStr] = 1;
            heatLabels[d.dateStr] = `В процессе: ${completedCount} из ${targetCount} дн.`;
          } else {
            heatLevels[d.dateStr] = 0;
            heatLabels[d.dateStr] = `0 из ${targetCount} дн.`;
          }
        });
      }
    } else {
      dayItems.forEach(d => {
        let level = 0;
        if (d.frac >= 1.0) level = 3;
        else if (d.frac >= 0.5) level = 2;
        else if (d.frac > 0) level = 1;
        heatLevels[d.dateStr] = level;
        heatLabels[d.dateStr] = `${Math.round(d.frac * 100)}% (${d.val || (d.completed ? '✓' : '0')})`;
      });
    }

    // Calculate completions for current week
    let thisWeekCount = 0;
    for (let d = 0; d <= currentDow; d++) {
      const cd = new Date(currentMonday);
      cd.setDate(currentMonday.getDate() + d);
      const cds = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}-${String(cd.getDate()).padStart(2, '0')}`;
      if (isDayCompleted(cds)) {
        thisWeekCount++;
      }
    }

    // --- Streak and Best Streak with date ranges ---
    let currentStreak = 0;
    let bestStreak = 0;
    let currentStreakRange = null;
    let bestStreakRange = null;
    let usedFreeze = false;

    if (habit.schedule?.type === 'periodic') {
      const targetCount = habit.schedule.targetCount || 3;
      let tempStreak = 0;
      let tempStart = null;
      let tempEnd = null;

      for (let w = 0; w < 26; w++) {
        let weekCompleted = 0;
        let weekFirstDay = null;
        let weekLastDay = null;
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const d = new Date(today);
          d.setDate(today.getDate() - (w * 7 + dayOffset));
          const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (isDayCompleted(ds)) {
            weekCompleted++;
            if (!weekLastDay) weekLastDay = ds;
            weekFirstDay = ds;
          }
        }

        if (weekCompleted >= targetCount) {
          tempStreak++;
          if (!tempEnd) tempEnd = weekLastDay;
          tempStart = weekFirstDay;

          if (w === 0 || tempStreak === w + 1) {
            currentStreak = tempStreak;
            currentStreakRange = { start: tempStart, end: tempEnd };
          }
          if (tempStreak >= bestStreak) {
            bestStreak = tempStreak;
            bestStreakRange = { start: tempStart, end: tempEnd };
          }
        } else {
          if (w === 0) {
            const daysLeftInCurWeek = 6 - currentDow;
            const canStillMeet = daysLeftInCurWeek >= (targetCount - weekCompleted);
            if (canStillMeet) {
              continue;
            } else {
              currentStreak = 0;
            }
          }
          tempStreak = 0;
          tempStart = null;
          tempEnd = null;
        }
      }
    } else {
      let streakRunning = true;
      let tempStreak = 0;
      let tempStart = null;
      let tempEnd = null;
      const habitFrozenWeeks = new Set();
      usedFreeze = false;

      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (!isDayScheduled(d)) continue;

        const done = isDayCompleted(ds);
        if (done) {
          tempStreak++;
          if (!tempEnd) tempEnd = ds;
          tempStart = ds;

          if (streakRunning) {
            currentStreak = tempStreak;
            currentStreakRange = { start: tempStart, end: tempEnd };
          }
          if (tempStreak >= bestStreak) {
            bestStreak = tempStreak;
            bestStreakRange = { start: tempStart, end: tempEnd };
          }
        } else {
          if (i === 0) {
            // Today not done yet: don't break streak if yesterday was done
            continue;
          }
          // 1 «Выходной ☕» (день заморозки) в неделю на случай пропуска
          const weekKey = this.getISOWeekKey ? this.getISOWeekKey(d) : '';
          if (weekKey && streakRunning && !habitFrozenWeeks.has(weekKey)) {
            habitFrozenWeeks.add(weekKey);
            usedFreeze = true;
            continue;
          }
          streakRunning = false;
          tempStreak = 0;
          tempStart = null;
          tempEnd = null;
        }
      }
    }

    // --- 1. Multi-Period History Charts (12 columns each: days, weeks, months, years) ---
    const defaultMonthNames = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const rawShortMonths = window.Plan4UI18n ? Plan4UI18n.t('monthsShort', {}, this.currentLang) : null;
    const monthNames = Array.isArray(rawShortMonths) ? rawShortMonths : defaultMonthNames;

    const targetVal = (habit.target && habit.target.value) ? habit.target.value : 1;
    const unit = habit.target?.unit || '';
    const dayUnit = window.Plan4UI18n ? Plan4UI18n.t('habit_days_unit', {}, this.currentLang) : 'дн.';

    const formatAvg = (val) => {
      if (val >= 10) return String(Math.round(val));
      const rounded = Number(val.toFixed(1));
      return rounded % 1 === 0 ? String(Math.round(rounded)) : String(rounded);
    };

    const perDay = window.Plan4UI18n ? Plan4UI18n.t('habit_period_per_day', {}, this.currentLang) : '/день';
    const perWeek = window.Plan4UI18n ? Plan4UI18n.t('habit_period_per_week', {}, this.currentLang) : '/нед.';
    const perMonth = window.Plan4UI18n ? Plan4UI18n.t('habit_period_per_month', {}, this.currentLang) : '/мес.';
    const perYear = window.Plan4UI18n ? Plan4UI18n.t('habit_period_per_year', {}, this.currentLang) : '/год';

    // A. 12 DAYS (Clean day numbers + 'Сег.' for today + tooltip)
    const todayLabel = window.Plan4UI18n ? Plan4UI18n.t('habit_chart_today', {}, this.currentLang) : 'Сег.';
    const dayBars = [];
    const dayTarget = habit.type === 'numeric' ? targetVal : 1;
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const completed = isDayCompleted(ds);
      const hEntry = history[ds];
      const cur = habit.type === 'numeric'
        ? (typeof hEntry === 'object' ? (hEntry.current || 0) : (hEntry ? targetVal : 0))
        : (completed ? 1 : 0);
      const isTargetMet = habit.type === 'numeric' ? cur >= targetVal : completed;

      const isCurrent = (i === 0);
      const isFirstOfMonth = (d.getDate() === 1);
      const label = isCurrent ? todayLabel : String(d.getDate());
      const countFormatted = habit.type === 'numeric' ? Number(cur.toFixed(1)) : (completed ? 1 : 0);
      const tooltip = `${d.getDate()} ${monthNames[d.getMonth()]}: ${countFormatted}${habit.type === 'numeric' && unit ? ' ' + unit : ''}`;

      dayBars.push({
        label,
        monthTag: isFirstOfMonth ? monthNames[d.getMonth()] : null,
        tooltip,
        dateStr: ds,
        count: countFormatted,
        target: dayTarget,
        isTargetMet,
        isCurrent
      });
    }
    const dayTargetStr = habit.type === 'numeric' ? (unit ? `${targetVal} ${unit}${perDay}` : `${targetVal}${perDay}`) : `1 ${dayUnit}${perDay}`;
    const activeDayBars = dayBars.filter(b => b.dateStr >= earliestDateStr);
    const dayDivisor = Math.max(1, activeDayBars.length);
    const dayTotalSum = dayBars.reduce((acc, b) => acc + (b.count || 0), 0);
    const dayAvg = dayTotalSum / dayDivisor;
    const dayAvgStr = habit.type === 'numeric'
      ? (unit ? `${formatAvg(dayAvg)} ${unit}${perDay}` : `${formatAvg(dayAvg)}${perDay}`)
      : `${formatAvg(dayAvg)}${perDay}`;

    // B. 12 WEEKS (Option A: alternating dates + 'Тек.' for current week)
    const curWeekLabel = window.Plan4UI18n ? Plan4UI18n.t('habit_chart_cur_week', {}, this.currentLang) : 'Тек.';
    const weekBars = [];
    const targetPerWeek = (habit.schedule?.type === 'periodic')
      ? (habit.schedule.targetCount || 3)
      : (habit.schedule?.type === 'weekdays' ? (habit.schedule.daysOfWeek?.length || 5) : 7);
    const thisMonday = currentMonday;

    for (let w = 11; w >= 0; w--) {
      const weekMonday = new Date(thisMonday);
      weekMonday.setDate(thisMonday.getDate() - (w * 7));
      const weekSunday = new Date(weekMonday);
      weekSunday.setDate(weekMonday.getDate() + 6);

      let count = 0;
      let sum = 0;

      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(weekMonday);
        cellDate.setDate(weekMonday.getDate() + d);
        const ds = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;

        if (isDayCompleted(ds)) {
          count++;
        }
        const hEntry = history[ds];
        if (habit.type === 'numeric' && hEntry) {
          sum += typeof hEntry === 'object' ? (hEntry.current || 0) : (habit.target?.value || 1);
        }
      }

      const isCurrent = (w === 0);
      const isTargetMet = habit.type === 'numeric' ? (sum >= targetPerWeek * targetVal) : (count >= targetPerWeek);

      // Alternating labels (even w: w=10, 8, 6, 4, 2) + current week 'Тек.' (w=0)
      let label = '';
      if (isCurrent) {
        label = curWeekLabel;
      } else if (w % 2 === 0) {
        label = `${weekMonday.getDate()} ${monthNames[weekMonday.getMonth()]}`;
      }

      const weekRangeText = `${weekMonday.getDate()} ${monthNames[weekMonday.getMonth()]} — ${weekSunday.getDate()} ${monthNames[weekSunday.getMonth()]}`;
      const countFormatted = habit.type === 'numeric' ? Number(sum.toFixed(1)) : count;
      const tooltip = `${weekRangeText}: ${countFormatted}${habit.type === 'numeric' && unit ? ' ' + unit : ''}`;

      weekBars.push({
        label,
        tooltip,
        weekSunday,
        count: countFormatted,
        target: targetPerWeek,
        isTargetMet,
        isCurrent
      });
    }
    const weekTargetStr = (habit.schedule?.type === 'periodic')
      ? `${targetPerWeek}${perWeek}`
      : (habit.schedule?.type === 'weekdays' ? `${targetPerWeek} ${dayUnit}${perWeek}` : `7 ${dayUnit}${perWeek}`);
    const activeWeekBars = weekBars.filter(b => b.weekSunday >= earliestDate);
    const weekDivisor = Math.max(1, activeWeekBars.length);
    const weekTotalSum = weekBars.reduce((acc, b) => acc + (b.count || 0), 0);
    const weekAvg = weekTotalSum / weekDivisor;
    const weekAvgStr = habit.type === 'numeric'
      ? (unit ? `${formatAvg(weekAvg)} ${unit}${perWeek}` : `${formatAvg(weekAvg)}${perWeek}`)
      : (habit.schedule?.type === 'periodic'
        ? `${formatAvg(weekAvg)}${perWeek}`
        : `${formatAvg(weekAvg)} ${dayUnit}${perWeek}`);

    // C. 12 MONTHS (Option A: clean 3 letters + year tag for January)
    const monthBars = [];
    let avgMonthTarget = 0;
    for (let m = 11; m >= 0; m--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();
      const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

      let count = 0;
      let sum = 0;
      let scheduledInMonth = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(targetYear, targetMonth, day);
        const ds = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (isDayScheduled(cellDate)) {
          scheduledInMonth++;
        }
        if (isDayCompleted(ds)) {
          count++;
        }
        const hEntry = history[ds];
        if (habit.type === 'numeric' && hEntry) {
          sum += typeof hEntry === 'object' ? (hEntry.current || 0) : targetVal;
        }
      }

      let monthTarget = scheduledInMonth;
      if (habit.schedule?.type === 'periodic') {
        monthTarget = Math.round((habit.schedule.targetCount || 3) * (daysInMonth / 7));
      }
      if (m === 0) avgMonthTarget = monthTarget;

      const isTargetMet = habit.type === 'numeric'
        ? (sum >= monthTarget * targetVal && monthTarget > 0)
        : (count >= monthTarget && monthTarget > 0);
      const isCurrent = (m === 0);

      // Clean 3-letter month label without year in main label
      const label = monthNames[targetMonth];
      const isYearStart = (targetMonth === 0); // January
      const countFormatted = habit.type === 'numeric' ? Number(sum.toFixed(1)) : count;
      const tooltip = `${monthNames[targetMonth].toUpperCase()} ${targetYear}: ${countFormatted}${habit.type === 'numeric' && unit ? ' ' + unit : ''}`;

      monthBars.push({
        label,
        yearTag: isYearStart ? `'${String(targetYear).slice(-2)}` : null,
        isYearStart,
        tooltip,
        year: targetYear,
        month: targetMonth,
        count: countFormatted,
        target: monthTarget,
        isTargetMet,
        isCurrent
      });
    }
    const monthTargetStr = habit.type === 'numeric'
      ? `${Number((avgMonthTarget * targetVal).toFixed(0))} ${unit}${perMonth}`
      : `~${avgMonthTarget} ${dayUnit}${perMonth}`;
    const activeMonthBars = monthBars.filter(b => new Date(b.year, b.month + 1, 0) >= earliestDate);
    const monthDivisor = Math.max(1, activeMonthBars.length);
    const monthTotalSum = monthBars.reduce((acc, b) => acc + (b.count || 0), 0);
    const monthAvg = monthTotalSum / monthDivisor;
    const monthAvgStr = habit.type === 'numeric'
      ? (unit ? `${formatAvg(monthAvg)} ${unit}${perMonth}` : `${formatAvg(monthAvg)}${perMonth}`)
      : `${formatAvg(monthAvg)} ${dayUnit}${perMonth}`;

    // D. 12 YEARS
    const yearBars = [];
    let avgYearTarget = 365;
    for (let y = 11; y >= 0; y--) {
      const targetYear = today.getFullYear() - y;
      const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0);
      const daysInYear = isLeap ? 366 : 365;

      let count = 0;
      let sum = 0;

      Object.keys(history).forEach(ds => {
        if (ds.startsWith(String(targetYear))) {
          if (isDayCompleted(ds)) {
            count++;
          }
          const hEntry = history[ds];
          if (habit.type === 'numeric' && hEntry) {
            sum += typeof hEntry === 'object' ? (hEntry.current || 0) : targetVal;
          }
        }
      });

      let yearTarget = (habit.schedule?.type === 'periodic')
        ? Math.round((habit.schedule.targetCount || 3) * 52)
        : (habit.schedule?.type === 'weekdays' ? Math.round((habit.schedule.daysOfWeek?.length || 5) * 52) : daysInYear);

      if (y === 0) avgYearTarget = yearTarget;

      const isTargetMet = habit.type === 'numeric'
        ? (sum >= yearTarget * targetVal && yearTarget > 0)
        : (count >= yearTarget && yearTarget > 0);
      const isCurrent = (y === 0);
      const label = `'${String(targetYear).slice(-2)}`;
      const countFormatted = habit.type === 'numeric' ? Number(sum.toFixed(1)) : count;
      const tooltip = `${targetYear}: ${countFormatted}${habit.type === 'numeric' && unit ? ' ' + unit : ''}`;

      yearBars.push({
        label,
        tooltip,
        year: targetYear,
        count: countFormatted,
        target: yearTarget,
        isTargetMet,
        isCurrent
      });
    }
    const yearTargetStr = habit.type === 'numeric'
      ? `${Number((avgYearTarget * targetVal).toFixed(0))} ${unit}${perYear}`
      : `~${avgYearTarget} ${dayUnit}${perYear}`;
    const activeYearBars = yearBars.filter(b => new Date(b.year, 11, 31) >= earliestDate);
    const yearDivisor = Math.max(1, activeYearBars.length);
    const yearTotalSum = yearBars.reduce((acc, b) => acc + (b.count || 0), 0);
    const yearAvg = yearTotalSum / yearDivisor;
    const yearAvgStr = habit.type === 'numeric'
      ? (unit ? `${formatAvg(yearAvg)} ${unit}${perYear}` : `${formatAvg(yearAvg)}${perYear}`)
      : `${formatAvg(yearAvg)} ${dayUnit}${perYear}`;

    const chartPeriods = {
      days: { bars: dayBars, target: dayTarget, targetStr: dayTargetStr, avgStr: dayAvgStr },
      weeks: { bars: weekBars, target: targetPerWeek, targetStr: weekTargetStr, avgStr: weekAvgStr },
      months: { bars: monthBars, target: avgMonthTarget, targetStr: monthTargetStr, avgStr: monthAvgStr },
      years: { bars: yearBars, target: avgYearTarget, targetStr: yearTargetStr, avgStr: yearAvgStr }
    };

    // --- Weekday Breakdown (past 60 days) ---
    // Days: 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб, 0=Вс
    const dowNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const dowOrder = [1, 2, 3, 4, 5, 6, 0];
    const dowStats = {};

    dowOrder.forEach(dow => {
      dowStats[dow] = { dow, name: dowNames[dow], completed: 0, total: 0, rate: 0 };
    });

    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dow = d.getDay();

      if (ds < earliestDateStr) continue;

      if (isDayScheduled(d)) {
        dowStats[dow].total++;
        if (isDayCompleted(ds)) {
          dowStats[dow].completed++;
        }
      }
    }

    let bestDow = null;
    let maxDowRate = -1;

    dowOrder.forEach(dow => {
      const item = dowStats[dow];
      item.rate = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
      if (item.rate > maxDowRate && item.total >= 2) {
        maxDowRate = item.rate;
        bestDow = item;
      }
    });

    // --- Frequency Grid by Months x Weekdays (inspired by Loop Habit Tracker) ---
    const freqMonths = [];
    const startMonthDate = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    const endMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);

    let curMonthCursor = new Date(startMonthDate);
    const minMonths = 6;
    const earliestAllowed = new Date(today.getFullYear(), today.getMonth() - (minMonths - 1), 1);
    if (curMonthCursor > earliestAllowed) {
      curMonthCursor = earliestAllowed;
    }

    while (curMonthCursor <= endMonthDate) {
      freqMonths.push({
        year: curMonthCursor.getFullYear(),
        month: curMonthCursor.getMonth(),
        label: monthNames[curMonthCursor.getMonth()]
      });
      curMonthCursor = new Date(curMonthCursor.getFullYear(), curMonthCursor.getMonth() + 1, 1);
    }

    if (freqMonths.length > 9) {
      freqMonths.splice(0, freqMonths.length - 9);
    }

    const freqGrid = [];
    const dowNamesFull = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const dowNamesShort = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    dowOrder.forEach(dow => {
      const row = {
        dow,
        dowLabel: dowNamesShort[dow],
        dowName: dowNamesFull[dow],
        months: []
      };

      freqMonths.forEach(m => {
        let scheduled = 0;
        let completed = 0;
        let sumVal = 0;

        const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const d = new Date(m.year, m.month, day);
          if (d.getDay() !== dow) continue;
          if (!isDayScheduled(d)) continue;

          const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (ds > todayDateString || ds < earliestDateStr) continue;

          scheduled++;
          if (isDayCompleted(ds)) {
            completed++;
          }
          const hEntry = history[ds];
          if (habit.type === 'numeric') {
            const cur = typeof hEntry === 'object' ? (hEntry.current || 0) : (hEntry ? targetVal : 0);
            sumVal += cur;
          }
        }

        const cellRate = scheduled > 0 ? (completed / scheduled) : 0;
        const avgVal = (scheduled > 0 && habit.type === 'numeric') ? Math.round(sumVal / scheduled) : null;

        row.months.push({
          year: m.year,
          month: m.month,
          monthLabel: m.label,
          scheduled,
          completed,
          rate: cellRate,
          avgVal
        });
      });

      freqGrid.push(row);
    });

    const thisWeekTarget = (habit.schedule?.type === 'periodic')
      ? (habit.schedule.targetCount || 3)
      : (habit.schedule?.type === 'weekdays' ? (habit.schedule.daysOfWeek?.length || 5) : 7);

    return {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      currentStreakRange,
      bestStreakRange,
      usedFreeze,
      totalCount,
      totalSum: Number(totalSum.toFixed(1)),
      rate,
      avgPerDay,
      thisWeekCount,
      thisWeekTarget,
      heatLevels,
      heatLabels,
      chartPeriods,
      weeklyBars: weekBars,
      targetPerWeek,
      dowList: dowOrder.map(dow => dowStats[dow]),
      bestDow,
      freqMonths,
      freqGrid
    };
  }

  // Open the Quick Stepper popover for logging numeric habits
  openHabitStepper(habitId, dateStr, anchorEl) {
    const todayStr = this.getTodayDateString();
    if (dateStr > todayStr) return; // Disallow logging in the future

    const habit = (this.habits || []).find(h => h.id === habitId);
    if (!habit || habit.type !== 'numeric') return;

    this.currentStepperHabitId = habitId;
    this.currentStepperDate = dateStr;

    const backdrop = document.getElementById('habitStepperBackdrop');
    const titleEl = document.getElementById('habitStepperTitle');
    const dateEl = document.getElementById('habitStepperDate');
    const curValEl = document.getElementById('habitStepperCurrentVal');
    const tgtValEl = document.getElementById('habitStepperTargetVal');
    const unitEl = document.getElementById('habitStepperUnit');
    const progressFill = document.getElementById('habitStepperProgressFill');
    const inputEl = document.getElementById('habitStepInput');
    const quick1 = document.getElementById('habitQuickStep1Btn');
    const quick2 = document.getElementById('habitQuickStep2Btn');

    if (!backdrop) return;

    const tgt = Number(habit.target?.value) || 1;
    const step = this.getHabitAutoStep(habit);
    const unit = habit.target?.unit || '';

    const hEntry = habit.history && habit.history[dateStr];
    let cur = 0;
    if (typeof hEntry === 'object') {
      cur = (hEntry.current !== undefined) ? Number(hEntry.current) : (hEntry.completed ? tgt : 0);
    } else if (hEntry) {
      cur = tgt;
    }
    cur = Number(cur) || 0;

    if (titleEl) titleEl.textContent = habit.title;
    if (dateEl) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const dows = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      dateEl.textContent = `${dows[dt.getDay()]}, ${d} ${months[dt.getMonth()]}`;
    }

    if (curValEl) curValEl.textContent = cur;
    if (tgtValEl) tgtValEl.textContent = tgt;
    if (unitEl) unitEl.textContent = unit;
    if (inputEl) {
      inputEl.value = cur;
      inputEl.step = step;
      inputEl.min = '0';
    }

    const pct = Math.min(Math.max((cur / tgt) * 100, 0), 100);
    if (progressFill) progressFill.style.width = `${pct}%`;

    if (quick1) quick1.textContent = `+${step}`;
    if (quick2) quick2.textContent = `+${Number((step * 2).toFixed(2))}`;

    this._stepperOpenedAt = Date.now();
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  // Close Quick Stepper popover
  closeHabitStepper() {
    const backdrop = document.getElementById('habitStepperBackdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
    }
    this.currentStepperHabitId = null;
    this.currentStepperDate = null;
  }

  // Set numeric value in Quick Stepper
  setHabitStepperValue(newVal) {
    if (!this.currentStepperHabitId || !this.currentStepperDate) return;
    const habit = (this.habits || []).find(h => h.id === this.currentStepperHabitId);
    if (!habit) return;

    const dateStr = this.currentStepperDate;
    const tgt = Number(habit.target?.value) || 1;
    let val = Math.max(0, Number(Number(newVal).toFixed(2)));

    if (!habit.history) habit.history = {};

    const wasCompleted = !!habit.history[dateStr]?.completed;
    const isNowCompleted = val >= tgt;

    if (val === 0) {
      delete habit.history[dateStr];
    } else {
      habit.history[dateStr] = {
        current: val,
        target: tgt,
        completed: isNowCompleted,
        timestamp: Date.now()
      };
    }

    if (!wasCompleted && isNowCompleted) {
      try {
        triggerHaptic(25);
        this.playCompletionSound();
        const stats = this.calculateHabitStats(habit);
        this.checkHabitPetMilestone(habit, stats.currentStreak);
      } catch (err) {
        console.warn('Non-critical habit reward effect failed:', err);
      }
    } else {
      try {
        triggerHaptic(15);
      } catch (e) { }
    }

    this.saveHabits();

    // In-place update of numeric cell button if present in DOM
    if (this.habitsListContainer) {
      const cellBtn = this.habitsListContainer.querySelector(`button[data-habit-id="${habit.id}"][data-date="${dateStr}"]`);
      if (cellBtn) {
        const isDone = val >= tgt;
        const pct = Math.min(Math.max((val / tgt) * 100, 0), 100);
        cellBtn.classList.toggle('checked', isDone);
        cellBtn.title = `${dateStr}: ${val} / ${tgt} ${habit.target?.unit || ''} (${Math.round((val / tgt) * 100)}%)`;
        if (isDone) {
          cellBtn.innerHTML = `
            <div class="habit-cell-fill-bar" style="height: 100%;"></div>
            <svg class="habit-cell-check-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: relative; z-index: 2;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          `;
        } else if (val > 0) {
          const pctInt = Math.min(99, Math.max(1, Math.round(pct)));
          cellBtn.innerHTML = `
            <div class="habit-cell-fill-bar" style="height: ${pct}%;"></div>
            <span class="habit-cell-num">${pctInt}%</span>
          `;
        } else {
          cellBtn.innerHTML = `
            <div class="habit-cell-fill-bar" style="height: 0%;"></div>
          `;
        }
      }
    }

    this.updateWeekDaysProgress();

    // Update stepper UI
    const curValEl = document.getElementById('habitStepperCurrentVal');
    const inputEl = document.getElementById('habitStepInput');
    const progressFill = document.getElementById('habitStepperProgressFill');

    if (curValEl) curValEl.textContent = val;
    if (inputEl && document.activeElement !== inputEl) inputEl.value = val;
    const pct = Math.min(Math.max((val / tgt) * 100, 0), 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
  }

  // Alias for legacy calls to open add habit
  openAddHabitInput() {
    const container = document.getElementById('tabsSubstrateContainer');
    if (container && !container.classList.contains('is-expanded')) {
      this.toggleSubstrateDrawer(true);
    }
    this.openHabitModal('create');
  }

  closeAddHabitInput() {
    this.closeHabitModal();
  }

  // Legacy addNewHabit alias
  addNewHabit(title) {
    if (!title) return;
    const newHabit = {
      id: 'h_' + Date.now(),
      title: title,
      type: 'boolean',
      schedule: { type: 'daily' },
      created: Date.now(),
      history: {}
    };
    if (!this.habits) this.habits = [];
    this.habits.push(newHabit);
    this.saveHabits();
    this.renderHabits();
    this.updateWeekDaysProgress();
    triggerHaptic(25);
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
    const hasAnyDailyTasks = Object.keys(this.dailyTasks).some(d => Array.isArray(this.dailyTasks[d]) && this.dailyTasks[d].length > 0);

    if (this.dailyTasks[targetDate] && Array.isArray(this.dailyTasks[targetDate]) && this.dailyTasks[targetDate].length > 0) {
      persistentTasks.todo = this.dailyTasks[targetDate];
    } else if (!hasAnyDailyTasks && persistentTasks.todo && Array.isArray(persistentTasks.todo) && persistentTasks.todo.length > 0) {
      // Legacy migration only: if dailyTasks dictionary was completely empty across all dates
      this.dailyTasks[targetDate] = persistentTasks.todo;
    } else {
      if (!this.dailyTasks[targetDate]) {
        const allDailyKeys = Object.keys(this.dailyTasks);
        if (allDailyKeys.length === 0 && (!persistentTasks.todo || persistentTasks.todo.length === 0)) {
          this.dailyTasks[targetDate] = JSON.parse(JSON.stringify(INITIAL_TASKS.todo || []));
        } else {
          this.dailyTasks[targetDate] = [];
        }
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
        Plan4UStorage.cleanOldBackupsFromLocalStorage?.();
        try {
          localStorage.setItem('todo_notebook_tasks', tasksJson);
          localStorage.setItem('plan4u_tasks.json', tasksJson);
        } catch (retryErr) {
          console.warn('LocalStorage quota warning:', retryErr);
        }
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

  // Read task completion changes made on Android Home Screen Widget back into notebook
  async syncFromNativeWidget() {
    try {
      if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.WidgetBridge) return;
      if (typeof window.Capacitor.Plugins.WidgetBridge.getWidgetData !== 'function') return;

      const res = await window.Capacitor.Plugins.WidgetBridge.getWidgetData();
      if (!res || !res.tasksJson || res.tasksJson === '[]') return;

      let widgetTasks = [];
      try {
        widgetTasks = typeof res.tasksJson === 'string' ? JSON.parse(res.tasksJson) : res.tasksJson;
      } catch (pe) {
        return;
      }
      if (!Array.isArray(widgetTasks) || widgetTasks.length === 0) return;

      const widgetDate = res.dateStr || this.getTodayDateString();
      const targetDate = this.selectedDate || this.getTodayDateString();

      let targetTaskList = null;
      if (this.dailyTasks && this.dailyTasks[widgetDate]) {
        targetTaskList = this.dailyTasks[widgetDate];
      } else if (widgetDate === targetDate && this.tasks && this.tasks.todo) {
        targetTaskList = this.tasks.todo;
      }

      if (!Array.isArray(targetTaskList) || targetTaskList.length === 0) return;

      let hasChanges = false;
      const widgetMap = new Map();
      widgetTasks.forEach(t => {
        if (t && t.id) widgetMap.set(String(t.id), !!t.completed);
      });

      targetTaskList.forEach(task => {
        if (task && task.id && widgetMap.has(String(task.id))) {
          const widgetCompleted = widgetMap.get(String(task.id));
          if (task.completed !== widgetCompleted) {
            task.completed = widgetCompleted;
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        if (widgetDate === targetDate && this.tasks) {
          this.tasks.todo = targetTaskList;
        }
        if (this.dailyTasks) {
          this.dailyTasks[widgetDate] = targetTaskList;
        }
        this.saveTasks();
        this.saveDailyTasks();
        this.render();
        this.updateWorkloadWidget();
        this.updateDateWidget();
      }
    } catch (e) {
      console.warn('Sync from native widget error:', e);
    }
  }

  // Handle hardware Android back button & mobile gestures
  handleHardwareBack() {
    try {
      // 0. Modules Hub Dropdown
      if (this.modulesHubDropdown && this.modulesHubDropdown.classList.contains('open')) {
        this.closeModulesHubDropdown();
        return true;
      }

      // 1. Specific modal backdrops in priority order (inner submodals first)
      if (this.financeEntryModalBackdrop && this.financeEntryModalBackdrop.classList.contains('open')) {
        this.closeFinanceEntryModal();
        return true;
      }
      if (this.financeCategoryModalBackdrop && this.financeCategoryModalBackdrop.classList.contains('open')) {
        this.closeFinanceCategoryModal();
        return true;
      }
      if (this.financeDatePickerModalBackdrop && this.financeDatePickerModalBackdrop.classList.contains('open')) {
        this.closeFinanceDatePicker();
        return true;
      }
      if (this.financeModalBackdrop && (this.financeModalBackdrop.classList.contains('active') || this.financeModalBackdrop.classList.contains('open'))) {
        this.closeFinanceModal();
        return true;
      }
      if (this.cycleModalBackdrop && this.cycleModalBackdrop.classList.contains('active')) {
        this.closeCycleModal();
        return true;
      }
      if (this.taskModalBackdrop && this.taskModalBackdrop.classList.contains('active')) {
        this.closeTaskModal();
        return true;
      }
      if (this.newTabModalBackdrop && this.newTabModalBackdrop.classList.contains('active')) {
        this.closeNewTabModal();
        return true;
      }
      if (this.calendarModalBackdrop && this.calendarModalBackdrop.classList.contains('active')) {
        this.closeCalendarModal();
        return true;
      }
      if (this.settingsModalBackdrop && this.settingsModalBackdrop.classList.contains('active')) {
        this.closeSettingsModal();
        return true;
      }
      if (this.trophyModalBackdrop && this.trophyModalBackdrop.classList.contains('active')) {
        this.closeTrophyModal();
        return true;
      }
      if (this.stickerShopModalBackdrop && this.stickerShopModalBackdrop.classList.contains('active')) {
        this.closeStickerShopModal();
        return true;
      }
      if (this.dayHistoryModalBackdrop && this.dayHistoryModalBackdrop.classList.contains('active')) {
        this.closeDayHistoryModal();
        return true;
      }

      // 2. Generic fallback for any active modal backdrop
      const activeModal = document.querySelector('.modal-backdrop.active, .modal-backdrop.open, .cycle-modal-backdrop.active, .finance-modal-backdrop.active, .app-modal-backdrop.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        activeModal.classList.remove('open');
        activeModal.setAttribute('aria-hidden', 'true');
        return true;
      }
    } catch (e) {
      console.warn('handleHardwareBack error:', e);
    }
    return false;
  }

  // Safe one-time cleanup of legacy keys from previous notebook versions
  cleanLegacyLocalStorageKeys() {
    try {
      // Intentionally keep essential storage keys active as fallback and backwards compatibility!
      localStorage.removeItem('plan4u_legacy_cleanup_done_v1');
    } catch (e) {
      console.warn('Legacy storage cleanup check:', e);
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
    this.widgetCycle = document.getElementById('widgetCycle');
    this.widgetCycleDay = document.getElementById('widgetCycleDay');

    // Modules Hub & Dropdown Elements
    this.widgetModulesHub = document.getElementById('widgetModulesHub');
    this.widgetModulesHubBadge = document.getElementById('widgetModulesHubBadge');
    this.widgetModulesHubWrapper = document.getElementById('widgetModulesHubWrapper');
    this.modulesHubDropdown = document.getElementById('modulesHubDropdown');

    // Cycle Tracker & Women's Health Elements
    this.cycleTracker = (window.Plan4UCycleTracker && window.Plan4UCycleTracker.CycleTracker) ? new window.Plan4UCycleTracker.CycleTracker() : null;
    this.cycleModalBackdrop = document.getElementById('cycleModalBackdrop');
    this.cycleCloseBtn = document.getElementById('cycleCloseBtn');
    this.cycleStatusCard = document.getElementById('cycleStatusCard');
    this.cycleDayBadge = document.getElementById('cycleDayBadge');
    this.cyclePhasePill = document.getElementById('cyclePhasePill');
    this.cycleOrbitBox = document.getElementById('cycleOrbitBox');
    this.cycleOrbitDayNum = document.getElementById('cycleOrbitDayNum');
    this.cycleOrbitDayLabel = document.getElementById('cycleOrbitDayLabel');
    this.cycleOrbitTotalLabel = document.getElementById('cycleOrbitTotalLabel');
    this.cycleOrbitPointerArm = document.getElementById('cycleOrbitPointerArm');
    this.orbitArcMenstrual = document.getElementById('orbitArcMenstrual');
    this.orbitArcFollicular = document.getElementById('orbitArcFollicular');
    this.orbitArcOvulation = document.getElementById('orbitArcOvulation');
    this.orbitArcLuteal = document.getElementById('orbitArcLuteal');
    this.legendTextMenstrual = document.getElementById('legendTextMenstrual');
    this.legendTextFollicular = document.getElementById('legendTextFollicular');
    this.legendTextOvulation = document.getElementById('legendTextOvulation');
    this.legendTextLuteal = document.getElementById('legendTextLuteal');
    this.cycleAdviceBox = document.getElementById('cycleAdviceBox');
    this.cycleEnergyTag = document.getElementById('cycleEnergyTag');
    this.cycleAdviceText = document.getElementById('cycleAdviceText');
    this.cyclePredictionLabel = document.getElementById('cyclePredictionLabel');
    this.cyclePredictionValue = document.getElementById('cyclePredictionValue');
    this.cyclePredictionSub = document.getElementById('cyclePredictionSub');
    this.btnCycleStartToday = document.getElementById('btnCycleStartToday');
    this.btnCycleOvulationToday = document.getElementById('btnCycleOvulationToday');
    this.btnCycleAddManual = document.getElementById('btnCycleAddManual');
    this.cycleHistoryCount = document.getElementById('cycleHistoryCount');
    this.cycleHistoryList = document.getElementById('cycleHistoryList');
    this.cycleAddModalBackdrop = document.getElementById('cycleAddModalBackdrop');
    this.cycleAddModalTitle = document.getElementById('cycleAddModalTitle');
    this.cycleAddCloseBtn = document.getElementById('cycleAddCloseBtn');
    this.cycleAddCancelBtn = document.getElementById('cycleAddCancelBtn');
    this.cycleAddSaveBtn = document.getElementById('cycleAddSaveBtn');
    this.cycleAddDeleteBtn = document.getElementById('cycleAddDeleteBtn');
    this.cycleFormDurationBadge = document.getElementById('cycleFormDurationBadge');
    this.editingCycleId = null;
    this.cycleInputStartDate = document.getElementById('cycleInputStartDate');
    this.cycleInputEndDate = document.getElementById('cycleInputEndDate');
    this.cycleInputIsOutlier = document.getElementById('cycleInputIsOutlier');
    this.cycleInputNotes = document.getElementById('cycleInputNotes');
    this.calendarCycleStrip = document.getElementById('calendarCycleStrip');
    this.calendarCyclePill = document.getElementById('calendarCyclePill');
    this.calendarCycleDesc = document.getElementById('calendarCycleDesc');
    this.btnCalendarCycleShortcut = document.getElementById('btnCalendarCycleShortcut');
    this.toggleCycleTracker = document.getElementById('toggleCycleTracker');
    this.cycleSubSettings = document.getElementById('cycleSubSettings');
    this.toggleCycleIrregular = document.getElementById('toggleCycleIrregular');
    this.cyclePeriodLengthRange = document.getElementById('cyclePeriodLengthRange');
    this.cyclePeriodLengthVal = document.getElementById('cyclePeriodLengthVal');
    this.cycleDefaultLengthRange = document.getElementById('cycleDefaultLengthRange');
    this.cycleDefaultLengthVal = document.getElementById('cycleDefaultLengthVal');
    this.btnOpenCycleFromSettings = document.getElementById('btnOpenCycleFromSettings');
    this.btnExpandCycleModule = document.getElementById('btnExpandCycleModule');
    this.btnExpandFinanceModule = document.getElementById('btnExpandFinanceModule');
    this.moduleCardCycle = document.getElementById('moduleCardCycle');
    this.moduleCardFinance = document.getElementById('moduleCardFinance');
    this.moduleHeaderCycle = document.getElementById('moduleHeaderCycle');
    this.moduleHeaderFinance = document.getElementById('moduleHeaderFinance');
    this.moduleCardJoy = document.getElementById('moduleCardJoy');
    this.moduleHeaderJoy = document.getElementById('moduleHeaderJoy');
    this.btnExpandJoyModule = document.getElementById('btnExpandJoyModule');

    // Joy Tracker Elements & Instance
    this.joyTracker = (typeof Plan4UJoyTracker !== 'undefined') ? new Plan4UJoyTracker() : (window.Plan4UJoyTracker ? new window.Plan4UJoyTracker() : null);
    this.widgetJoy = document.getElementById('widgetJoy');
    this.widgetJoyBadge = document.getElementById('widgetJoyBadge');
    this.notebookJoyWrapper = document.getElementById('notebookJoyWrapper');
    this.toggleJoyTracker = document.getElementById('toggleJoyTracker');
    this.joySubSettings = document.getElementById('joySubSettings');
    this.joyReminderTimeInput = document.getElementById('joyReminderTimeInput');
    this.toggleJoySheet = document.getElementById('toggleJoySheet');
    this.btnOpenJoyJarFromSettings = document.getElementById('btnOpenJoyJarFromSettings');

    // Joy Modal Elements
    this.joyModalBackdrop = document.getElementById('joyModalBackdrop');
    this.joyModalCloseBtn = document.getElementById('joyModalCloseBtn');
    this.joyModalTitle = document.getElementById('joyModalTitle');
    this.joyMoodSelector = document.getElementById('joyMoodSelector');
    this.joyTextInput = document.getElementById('joyTextInput');
    this.joyCharCount = document.getElementById('joyCharCount');
    this.btnJoyPromptHelp = document.getElementById('btnJoyPromptHelp');
    this.joyPromptBox = document.getElementById('joyPromptBox');
    this.joyPromptText = document.getElementById('joyPromptText');
    this.joyModalStickerThumb = document.getElementById('joyModalStickerThumb');
    this.btnJoyChangeSticker = document.getElementById('btnJoyChangeSticker');
    this.btnJoyRemindLater = document.getElementById('btnJoyRemindLater');
    this.btnJoySave = document.getElementById('btnJoySave');
    this.btnJoyModalOpenJar = document.getElementById('btnJoyModalOpenJar');

    // Joy Jar Modal Elements
    this.joyJarModalBackdrop = document.getElementById('joyJarModalBackdrop');
    this.joyJarCloseBtn = document.getElementById('joyJarCloseBtn');
    this.joyJarTotalBadge = document.getElementById('joyJarTotalBadge');
    this.joyJarDesk = document.getElementById('joyJarDesk');

    // Joy Sticker Picker Elements
    this.joyStickerPickerBackdrop = document.getElementById('joyStickerPickerBackdrop');
    this.joyStickerPickerCloseBtn = document.getElementById('joyStickerPickerCloseBtn');
    this.joyStickerPickerGrid = document.getElementById('joyStickerPickerGrid');

    this.currentJoyEditingDate = null;
    this.currentJoySelectedMood = 'm_great';
    this.currentJoySelectedStickerId = 'paper_01';
    this.joyPickerTargetDate = null;

    // Finance Tracker Elements & Instance
    this.financeTracker = (window.Plan4UFinanceTracker && window.Plan4UFinanceTracker.FinanceTracker) ? new window.Plan4UFinanceTracker.FinanceTracker() : null;
    this.widgetFinance = document.getElementById('widgetFinance');
    this.widgetFinanceRing = document.getElementById('widgetFinanceRing');
    this.widgetFinanceSymbol = document.getElementById('widgetFinanceSymbol');
    this.notebookFinanceStamp = document.getElementById('notebookFinanceStamp');
    this.financeModalBackdrop = document.getElementById('financeModalBackdrop');
    this.financeCloseBtn = document.getElementById('financeCloseBtn');
    this.btnFinanceAddCategory = document.getElementById('btnFinanceAddCategory');
    this.financePeriodPills = document.getElementById('financePeriodPills');
    this.financeViewTabs = document.getElementById('financeViewTabs');
    this.financePaneOverview = document.getElementById('financePaneOverview');
    this.financePaneHistory = document.getElementById('financePaneHistory');
    this.financePaneCategories = document.getElementById('financePaneCategories');
    this.financeDonutWrapper = document.getElementById('financeDonutWrapper');
    this.financeDonutCenterSymbol = document.getElementById('financeDonutCenterSymbol');
    this.financeDonutCenterVal = document.getElementById('financeDonutCenterVal');
    this.financeDonutCenterSub = document.getElementById('financeDonutCenterSub');
    this.financeOverviewBreakdown = document.getElementById('financeOverviewBreakdown');
    this.financeSelectedCategoryBadge = document.getElementById('financeSelectedCategoryBadge');
    this.financeSelectedCatIconWrap = document.getElementById('financeSelectedCatIconWrap');
    this.financeSelectedCatIcon = document.getElementById('financeSelectedCatIcon');
    this.financeSelectedCatName = document.getElementById('financeSelectedCatName');
    this.financeBalanceTotal = document.getElementById('financeBalanceTotal');
    this.financeBalanceIncome = document.getElementById('financeBalanceIncome');
    this.financeBalanceExpense = document.getElementById('financeBalanceExpense');
    this.btnFinanceQuickIncome = document.getElementById('btnFinanceQuickIncome');
    this.btnFinanceQuickExpense = document.getElementById('btnFinanceQuickExpense');
    this.financeArchiveActions = document.getElementById('financeArchiveActions');
    this.btnFinanceArchiveHistory = document.getElementById('btnFinanceArchiveHistory');
    this.financeHistoryHeaderBar = document.getElementById('financeHistoryHeaderBar');
    this.btnFinanceArchiveBackToRing = document.getElementById('btnFinanceArchiveBackToRing');
    this.financeArchiveHistoryTitle = document.getElementById('financeArchiveHistoryTitle');
    this.isFinanceArchiveMode = false;
    this.financeHistoryList = document.getElementById('financeHistoryList');
    this.financeCatFilterWrap = document.getElementById('financeCatFilterWrap');
    this.financeCatFilterScroll = document.getElementById('financeCatFilterScroll');
    this.financeCategoriesList = document.getElementById('financeCategoriesList');
    this.financeEntryModalBackdrop = document.getElementById('financeEntryModalBackdrop');
    this.financeEntryModalTitle = document.getElementById('financeEntryModalTitle');
    this.financeEntryCloseBtn = document.getElementById('financeEntryCloseBtn');
    this.financeEntryCatsGrid = document.getElementById('financeEntryCatsGrid');
    this.financeEntryAmountInput = document.getElementById('financeEntryAmountInput');
    this.financeEntryCurrencyBadge = document.getElementById('financeEntryCurrencyBadge');
    this.financeQuickChips = document.getElementById('financeQuickChips');
    this.financeEntryNoteInput = document.getElementById('financeEntryNoteInput');
    this.btnFinanceEntryBack = document.getElementById('btnFinanceEntryBack');
    this.btnFinanceEntrySave = document.getElementById('btnFinanceEntrySave');
    this.btnFinanceEntryDelete = document.getElementById('btnFinanceEntryDelete');
    this.financeCategoryModalBackdrop = document.getElementById('financeCategoryModalBackdrop');
    this.financeCategoryModalTitle = document.getElementById('financeCategoryModalTitle');
    this.financeCategoryCloseBtn = document.getElementById('financeCategoryCloseBtn');
    this.btnCatTypeExpense = document.getElementById('btnCatTypeExpense');
    this.btnCatTypeIncome = document.getElementById('btnCatTypeIncome');
    this.financeCatNameInput = document.getElementById('financeCatNameInput');
    this.financeColorPalette = document.getElementById('financeColorPalette');
    this.financeIconPickerGrid = document.getElementById('financeIconPickerGrid');
    this.btnFinanceCategoryCancel = document.getElementById('btnFinanceCategoryCancel');
    this.btnFinanceCategorySave = document.getElementById('btnFinanceCategorySave');
    this.btnFinanceCategoryDelete = document.getElementById('btnFinanceCategoryDelete');
    this.toggleFinanceTracker = document.getElementById('toggleFinanceTracker');
    this.financeSubSettings = document.getElementById('financeSubSettings');
    this.toggleFinanceStamp = document.getElementById('toggleFinanceStamp');
    this.financeCurrencySelect = document.getElementById('financeCurrencySelect');
    this.financeInitialBalanceInput = document.getElementById('financeInitialBalanceInput');
    this.btnOpenFinanceFromSettings = document.getElementById('btnOpenFinanceFromSettings');
    this.financePeriodSublabel = document.getElementById('financePeriodSublabel');
    this.financeHeaderDate = document.getElementById('financeHeaderDate');
    this.financeEntryDateInput = document.getElementById('financeEntryDateInput');
    this.financeEntryDateBox = document.getElementById('financeEntryDateBox');
    this.financeDatePickerModalBackdrop = document.getElementById('financeDatePickerModalBackdrop');
    this.financeDatePickerCloseBtn = document.getElementById('financeDatePickerCloseBtn');
    this.financeDatePrevMonth = document.getElementById('financeDatePrevMonth');
    this.financeDateMonthTitle = document.getElementById('financeDateMonthTitle');
    this.financeDateNextMonth = document.getElementById('financeDateNextMonth');
    this.financeDatePickerDaysGrid = document.getElementById('financeDatePickerDaysGrid');
    this.btnFinanceDateToday = document.getElementById('btnFinanceDateToday');
    this.btnFinanceDateConfirm = document.getElementById('btnFinanceDateConfirm');

    this.financePickerTempDate = null;
    this.financePickerDisplayedMonth = null;

    this.financeActivePeriod = 'month';
    this.financeActiveTab = 'overview';
    this.financeSelectedCatId = null;
    this.financeEditingTxId = null;
    this.financeEntryType = 'expense';
    this.financeNewCatColor = '#22c55e';
    this.financeNewCatType = 'expense';

    // Nutrition & Macro Tracker Elements & Instance
    this.nutritionTracker = (window.Plan4UNutritionTracker && window.Plan4UNutritionTracker.NutritionTracker)
      ? new window.Plan4UNutritionTracker.NutritionTracker()
      : null;
    this.widgetNutrition = document.getElementById('widgetNutrition');
    this.widgetNutritionRing = document.getElementById('widgetNutritionRing');
    this.notebookNutritionStamp = document.getElementById('notebookNutritionStamp');
    this.nutritionModalBackdrop = document.getElementById('nutritionModalBackdrop');
    this.nutritionCloseBtn = document.getElementById('nutritionCloseBtn');
    this.btnNutritionAddCategory = document.getElementById('btnNutritionAddCategory');
    this.btnNutritionStats = document.getElementById('btnNutritionStats');
    this.nutritionStatsModalBackdrop = document.getElementById('nutritionStatsModalBackdrop');
    this.nutritionStatsCloseBtn = document.getElementById('nutritionStatsCloseBtn');
    this.btnNutritionTabCalendar = document.getElementById('btnNutritionTabCalendar');
    this.btnNutritionTabFrequency = document.getElementById('btnNutritionTabFrequency');
    this.nutritionPaneCalendar = document.getElementById('nutritionPaneCalendar');
    this.nutritionPaneFrequency = document.getElementById('nutritionPaneFrequency');
    this.nutritionCalendarGrid = document.getElementById('nutritionCalendarGrid');
    this.nutritionFrequencyList = document.getElementById('nutritionFrequencyList');
    this.nutritionHeaderDate = document.getElementById('nutritionHeaderDate');
    this.nutritionDonutContainer = document.getElementById('nutritionDonutContainer');
    this.nutritionDonutCenter = document.getElementById('nutritionDonutCenter');
    this.nutritionDonutCenterVal = document.getElementById('nutritionDonutCenterVal');
    this.nutritionDonutCenterTarget = document.getElementById('nutritionDonutCenterTarget');
    this.nutritionDonutCenterSub = document.getElementById('nutritionDonutCenterSub');
    this.nutritionSelectedMealBadge = document.getElementById('nutritionSelectedMealBadge');
    this.nutritionFilterIcon = document.getElementById('nutritionFilterIcon');
    this.nutritionFilterName = document.getElementById('nutritionFilterName');
    this.btnClearMealFilter = document.getElementById('btnClearMealFilter');
    this.nutritionMacroBarsContainer = document.getElementById('nutritionMacroBarsContainer');
    this.nutritionHungerScaleBox = document.getElementById('nutritionHungerScaleBox');
    this.hungerScaleTrack = document.getElementById('hungerScaleTrack');
    this.hungerScaleFill = document.getElementById('hungerScaleFill');
    this.hungerScaleSlider = document.getElementById('hungerScaleSlider');
    this.hungerScaleSmiley = document.getElementById('hungerScaleSmiley');
    this.hungerScaleCatBox = document.getElementById('hungerScaleCatBox');
    this.hungerScaleCatA = document.getElementById('hungerScaleCatA');
    this.hungerScaleCatB = document.getElementById('hungerScaleCatB');
    this.hungerCatColorPopup = document.getElementById('hungerCatColorPopup');
    this.hungerCatColorList = document.getElementById('hungerCatColorList');
    this.btnHungerCatColorClose = document.getElementById('btnHungerCatColorClose');
    this.hungerScaleBubble = document.getElementById('hungerScaleBubble');
    this.nutritionMealsFilterBar = document.getElementById('nutritionMealsFilterBar');
    this.nutritionMealsList = document.getElementById('nutritionMealsList');
    this.nutritionEmptyHint = document.getElementById('nutritionEmptyHint');
    this.btnNutritionAddFood = document.getElementById('btnNutritionAddFood');
    this.nutritionBottomBar = document.getElementById('nutritionBottomBar');
    this.nutritionArchiveActions = document.getElementById('nutritionArchiveActions');
    this.isNutritionArchiveMode = false;
    this.nutritionSelectedMealFilterId = null;
    this.currentNutritionDate = null;

    // Macro Color Picker Modal Elements (Long press on Ж, Б, У)
    this.macroColorModalBackdrop = document.getElementById('macroColorModalBackdrop');
    this.macroColorTitle = document.getElementById('macroColorTitle');
    this.macroColorCloseBtn = document.getElementById('macroColorCloseBtn');
    this.macroColorCancelBtn = document.getElementById('macroColorCancelBtn');
    this.macroColorApplyBtn = document.getElementById('macroColorApplyBtn');
    this.macroColorPalette = document.getElementById('macroColorPalette');
    this.macroCustomColorInput = document.getElementById('macroCustomColorInput');
    this.btnResetMacroColor = document.getElementById('btnResetMacroColor');
    this.macroColorPreviewNormal = document.getElementById('macroColorPreviewNormal');
    this.macroColorPreviewOver = document.getElementById('macroColorPreviewOver');
    this.activeEditingMacroKey = null;
    this.tempEditingMacroColor = null;

    // Add Food Modal Elements
    this.nutritionAddFoodModalBackdrop = document.getElementById('nutritionAddFoodModalBackdrop');
    this.nutritionAddFoodCloseBtn = document.getElementById('nutritionAddFoodCloseBtn');
    this.tabFoodSingle = document.getElementById('tabFoodSingle');
    this.tabFoodComposite = document.getElementById('tabFoodComposite');
    this.paneFoodSingle = document.getElementById('paneFoodSingle');
    this.paneFoodComposite = document.getElementById('paneFoodComposite');
    this.singleFoodName = document.getElementById('singleFoodName');
    this.btnScanBarcodeSingle = document.getElementById('btnScanBarcodeSingle');
    this.singleFoodSuggestions = document.getElementById('singleFoodSuggestions');
    this.singleFoodMealSelect = document.getElementById('singleFoodMealSelect');
    this.singleFoodWeight = document.getElementById('singleFoodWeight');
    this.foodQuickChips = document.getElementById('foodQuickChips');
    this.singleFoodSummaryWeight = document.getElementById('singleFoodSummaryWeight');
    this.singleFoodKcal100 = document.getElementById('singleFoodKcal100');
    this.singleFoodProt100 = document.getElementById('singleFoodProt100');
    this.singleFoodFat100 = document.getElementById('singleFoodFat100');
    this.singleFoodCarb100 = document.getElementById('singleFoodCarb100');
    this.singleFoodCalcKcal = document.getElementById('singleFoodCalcKcal');
    this.singleFoodCalcProt = document.getElementById('singleFoodCalcProt');
    this.singleFoodCalcFat = document.getElementById('singleFoodCalcFat');
    this.singleFoodCalcCarb = document.getElementById('singleFoodCalcCarb');
    this.btnSaveSingleFood = document.getElementById('btnSaveSingleFood');
    this.btnSaveCustomFood = document.getElementById('btnSaveCustomFood');

    // Composite Dish Elements
    this.compositeDishName = document.getElementById('compositeDishName');
    this.compositeDishSuggestions = document.getElementById('compositeDishSuggestions');
    this.compositeMealSelect = document.getElementById('compositeMealSelect');
    this.compositeIngredientsList = document.getElementById('compositeIngredientsList');
    this.btnAddCompositeIngredient = document.getElementById('btnAddCompositeIngredient');
    this.compositeRawWeightTotal = document.getElementById('compositeRawWeightTotal');
    this.compositeRawKcalTotal = document.getElementById('compositeRawKcalTotal');
    this.compositeRawProtTotal = document.getElementById('compositeRawProtTotal');
    this.compositeRawFatTotal = document.getElementById('compositeRawFatTotal');
    this.compositeRawCarbTotal = document.getElementById('compositeRawCarbTotal');
    this.compositeCookedWeight = document.getElementById('compositeCookedWeight');
    this.compositePortionEaten = document.getElementById('compositePortionEaten');
    this.compositeYieldRatioHint = document.getElementById('compositeYieldRatioHint');
    this.compositeCalcKcal = document.getElementById('compositeCalcKcal');
    this.compositeCalcProt = document.getElementById('compositeCalcProt');
    this.compositeCalcFat = document.getElementById('compositeCalcFat');
    this.compositeCalcCarb = document.getElementById('compositeCalcCarb');
    this.compositeSummaryWeight = document.getElementById('compositeSummaryWeight');
    this.compositePer100gHint = document.getElementById('compositePer100gHint');
    this.btnSaveCompositeFood = document.getElementById('btnSaveCompositeFood');
    this.currentCompositeIngredients = [];

    // Barcode Scanner Elements
    this.nutritionBarcodeScannerModalBackdrop = document.getElementById('nutritionBarcodeScannerModalBackdrop');
    this.nutritionScannerVideo = document.getElementById('nutritionScannerVideo');
    this.btnScannerTorch = document.getElementById('btnScannerTorch');
    this.btnScannerManual = document.getElementById('btnScannerManual');
    this.btnScannerClose = document.getElementById('btnScannerClose');
    this.scannerMediaStream = null;
    this.scannerScanInterval = null;
    this.scannerTargetMode = 'single';
    this.scannerIngredientIndex = null;
    this.scannerTorchActive = false;

    // Settings Card Elements
    this.moduleCardNutrition = document.getElementById('moduleCardNutrition');
    this.moduleHeaderNutrition = document.getElementById('moduleHeaderNutrition');
    this.toggleNutritionTracker = document.getElementById('toggleNutritionTracker');
    this.btnExpandNutritionModule = document.getElementById('btnExpandNutritionModule');
    this.nutritionSubSettings = document.getElementById('nutritionSubSettings');
    this.toggleNutritionStamp = document.getElementById('toggleNutritionStamp');
    this.nutritionSettingCalories = document.getElementById('nutritionSettingCalories');
    this.nutritionSettingProtein = document.getElementById('nutritionSettingProtein');
    this.nutritionSettingFat = document.getElementById('nutritionSettingFat');
    this.nutritionSettingCarbs = document.getElementById('nutritionSettingCarbs');
    this.btnOpenNutritionFromSettings = document.getElementById('btnOpenNutritionFromSettings');

    // Nutrition Settings Modal Elements
    this.nutritionSettingsModalBackdrop = document.getElementById('nutritionSettingsModalBackdrop');
    this.nutritionSettingsCloseBtn = document.getElementById('nutritionSettingsCloseBtn');
    this.modalSettingCalorieTarget = document.getElementById('modalSettingCalorieTarget');
    this.modalSettingProteinTarget = document.getElementById('modalSettingProteinTarget');
    this.modalSettingFatTarget = document.getElementById('modalSettingFatTarget');
    this.modalSettingCarbTarget = document.getElementById('modalSettingCarbTarget');
    this.customMealsList = document.getElementById('customMealsList');
    this.newMealIconPickerGrid = document.getElementById('newMealIconPickerGrid');
    this.newMealSelectedPreviewImg = document.getElementById('newMealSelectedPreviewImg');
    this.newMealIconInput = document.getElementById('newMealIconInput');
    this.newMealNameInput = document.getElementById('newMealNameInput');
    this.newMealColorInput = document.getElementById('newMealColorInput');
    this.btnAddNewMealSubmit = document.getElementById('btnAddNewMealSubmit');
    this.btnSaveNutritionSettingsModal = document.getElementById('btnSaveNutritionSettingsModal');
    this.singleMealPreviewIcon = document.getElementById('singleMealPreviewIcon');
    this.compositeMealPreviewIcon = document.getElementById('compositeMealPreviewIcon');

    // Edit Meal Modal Elements
    this.editMealModalBackdrop = document.getElementById('editMealModalBackdrop');
    this.editMealModalTitle = document.getElementById('editMealModalTitle');
    this.editMealModalCloseBtn = document.getElementById('editMealModalCloseBtn');
    this.editMealForm = document.getElementById('editMealForm');
    this.editMealIdInput = document.getElementById('editMealIdInput');
    this.editMealIconInput = document.getElementById('editMealIconInput');
    this.editMealNameInput = document.getElementById('editMealNameInput');
    this.editMealColorInput = document.getElementById('editMealColorInput');
    this.editMealSelectedPreview = document.getElementById('editMealSelectedPreview');
    this.editMealSelectedPreviewImg = document.getElementById('editMealSelectedPreviewImg');
    this.editMealColorsRow = document.getElementById('editMealColorsRow');
    this.editMealIconPickerGrid = document.getElementById('editMealIconPickerGrid');
    this.btnCancelEditMeal = document.getElementById('btnCancelEditMeal');
    this.btnDeleteEditMeal = document.getElementById('btnDeleteEditMeal');
    this.btnSaveEditMeal = document.getElementById('btnSaveEditMeal');

    this.weekDaysBar = document.getElementById('weekDaysBar');
    this.weekDaysTrack = document.getElementById('weekDaysTrack');
    this.btnAddHabit = document.getElementById('btnAddHabit');
    this.habitAddSlot = document.getElementById('habitAddSlot');
    this.habitAddRow = document.getElementById('habitAddRow');
    this.habitInputField = document.getElementById('habitInputField');
    this.habitBtnConfirm = document.getElementById('habitBtnConfirm');
    this.habitBtnCancel = document.getElementById('habitBtnCancel');
    this.habitsListContainer = document.getElementById('habitsListContainer');
    this.habits = this.loadHabits();

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
    const navPrevBtn = document.getElementById('pastDayNavPrev');
    if (navPrevBtn) {
      navPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(15);
        this.navigateDayOffset(-1);
      });
    }
    const navNextBtn = document.getElementById('pastDayNavNext');
    if (navNextBtn) {
      navNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(15);
        this.navigateDayOffset(1);
      });
    }
  }

  // Dismiss keyboard/focus from text inputs
  dismissActiveKeyboard() {
    try {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    } catch (e) { }
    this.clearTextSelectionAndFocus();
  }

  // Universal helper to remove any text selection and drop focus
  clearTextSelectionAndFocus() {
    try {
      if (window.getSelection) {
        const sel = window.getSelection();
        if (sel) {
          if (typeof sel.removeAllRanges === 'function') sel.removeAllRanges();
          if (typeof sel.empty === 'function') sel.empty();
        }
      }
      if (document.selection && typeof document.selection.empty === 'function') {
        document.selection.empty();
      }
    } catch (e) { }
    try {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    } catch (e) { }
  }

  // Universal controller-only dragging for all range sliders across the app
  initThumbOnlySliders() {
    const setupSlider = (slider) => {
      if (!slider || slider._thumbOnlyInit) return;
      slider._thumbOnlyInit = true;

      let isDraggingThumb = false;
      let startVal = slider.value;

      const isPointNearThumb = (clientX) => {
        const rect = slider.getBoundingClientRect();
        if (!rect.width) return true;
        const min = parseFloat(slider.min) !== undefined && !isNaN(parseFloat(slider.min)) ? parseFloat(slider.min) : 0;
        const max = parseFloat(slider.max) !== undefined && !isNaN(parseFloat(slider.max)) ? parseFloat(slider.max) : 100;
        const val = parseFloat(slider.value) !== undefined && !isNaN(parseFloat(slider.value)) ? parseFloat(slider.value) : min;
        const range = max - min;
        const ratio = range > 0 ? (val - min) / range : 0;

        const thumbWidth = 24;
        const thumbRadius = thumbWidth / 2;
        const availableWidth = Math.max(rect.width - thumbWidth, 1);
        const thumbCenterX = rect.left + thumbRadius + ratio * availableWidth;

        const dist = Math.abs(clientX - thumbCenterX);
        // Grab tolerance: radius is 12px, 24px tolerance comfortably allows finger grab while blocking track clicks (>24px)
        return dist <= 24;
      };

      const handlePointerDown = (e) => {
        const onThumb = isPointNearThumb(e.clientX);
        if (!onThumb) {
          // Tapped on the track away from thumb -> cancel instant value jump!
          e.preventDefault();
          e.stopPropagation();
          isDraggingThumb = false;
          return false;
        }
        isDraggingThumb = true;
        startVal = slider.value;
        slider.classList.add('is-dragging');
      };

      const handlePointerUp = () => {
        isDraggingThumb = false;
        slider.classList.remove('is-dragging');
      };

      slider.addEventListener('pointerdown', handlePointerDown, { passive: false });
      window.addEventListener('pointerup', handlePointerUp, { passive: true });
      window.addEventListener('pointercancel', handlePointerUp, { passive: true });

      // Safety check: if an input event fires without active dragging, revert value
      slider.addEventListener('input', (e) => {
        if (!isDraggingThumb) {
          slider.value = startVal;
          e.preventDefault();
          e.stopPropagation();
        }
      });
    };

    // Bind current sliders
    document.querySelectorAll('input[type="range"], .range-slider').forEach(setupSlider);

    // Watch for newly rendered sliders (e.g. modals)
    try {
      const observer = new MutationObserver(() => {
        document.querySelectorAll('input[type="range"], .range-slider').forEach(setupSlider);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (err) { }
  }

  // Watch for virtual keyboard visibility & toggle keyboard-open class
  initKeyboardStateWatcher() {
    let isKeyboardOpen = false;

    const setKeyboardState = (isOpen) => {
      if (isKeyboardOpen === isOpen) return;
      isKeyboardOpen = isOpen;
      document.body.classList.toggle('keyboard-open', isOpen);
      const appFrame = document.getElementById('appFrame');
      if (appFrame) appFrame.classList.toggle('keyboard-open', isOpen);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        const isKb = heightDiff > 140;
        setKeyboardState(isKb);
      });
    }

    window.addEventListener('resize', () => {
      const container = document.getElementById('tabsSubstrateContainer');
      if (container && container.classList.contains('is-expanded')) {
        this.updateAddHabitButtonWidth();
      }
    });

    document.addEventListener('focusin', (e) => {
      const tag = e.target ? e.target.tagName : '';
      const type = e.target ? (e.target.type || '').toLowerCase() : '';
      if ((tag === 'INPUT' || tag === 'TEXTAREA') && !['checkbox', 'radio', 'range', 'button', 'submit'].includes(type)) {
        setKeyboardState(true);
        if (e.target.closest('.modal-sheet, .modal-form')) {
          setTimeout(() => {
            try {
              e.target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } catch (err) { }
          }, 200);
        }
      }
    });

    document.addEventListener('focusout', () => {
      setTimeout(() => {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        const activeType = document.activeElement ? (document.activeElement.type || '').toLowerCase() : '';
        const isInputStillActive = (activeTag === 'INPUT' || activeTag === 'TEXTAREA') && !['checkbox', 'radio', 'range', 'button', 'submit'].includes(activeType);
        if (!isInputStillActive) {
          if (!window.visualViewport || (window.innerHeight - window.visualViewport.height <= 140)) {
            setKeyboardState(false);
          }
        }
      }, 120);
    });
  }

  // Bind event listeners
  initEventListeners() {
    this.initThumbOnlySliders();
    this.initKeyboardStateWatcher();

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

    // Debounced resize watcher to accurately recalculate hand-drawn strike lines on screen orientation/window change
    let resizeStrikeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeStrikeTimer);
      resizeStrikeTimer = setTimeout(() => {
        this.applyHandDrawnStrikes();
      }, 150);
    });


    // Also blur active input when tapping outside or on main screen actions (never inside modal sheets!)
    document.addEventListener('pointerdown', (e) => {
      // Direct tap on modal backdrop outside the sheet
      if (e.target.classList && (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('pet-modal-overlay'))) {
        this.dismissActiveKeyboard();
        return;
      }
      // Tap on main screen action widgets (ignoring anything inside modal sheets or forms)
      if (!e.target.closest('.modal-sheet, .pet-modal-sheet, .modal-form') &&
        e.target.closest('.widget-circle, .folder-tab, .add-tab-btn, .fab-button, .notebook-pet-anchor, .section-header-btn, .btn-primary-block, .btn-secondary-block')) {
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
    this.bindSafeBackdrop = bindSafeBackdrop;

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
        const handled = this.handleHardwareBack();
        if (!handled) {
          this.closeAllModals();
        }
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
        const currentWeekKey = this.getISOWeekKey ? this.getISOWeekKey(new Date()) : '';
        const isFreezeUsed = this.streakData && (this.streakData.lastFreezeWeek === currentWeekKey);

        const hasUnclaimed = this.achievementsData && Object.keys(this.achievementsData.unlocked || {}).some(id => !this.achievementsData.viewed?.[id]);

        if (hasUnclaimed) {
          this.showToast(`🏆 Новые достижения получены! Открываем награды...`, '🏆');
          this.openAchievementsModal('all');
        } else {
          if (isFreezeUsed) {
            this.showToast(`🔥 Серия: ${days} ${daysWord} (Рекорд: ${record}) • На этой неделе активен «Выходной ☕» — стрик защищён!`, '☕');
          } else {
            this.showToast(`🔥 Серия: ${days} ${daysWord} (Рекорд: ${record}) • Доступен 1 «Выходной ☕» в неделю на случай пропуска!`, '🔥');
          }
          this.openAchievementsModal('streaks');
        }
      });
    }

    // Modules Hub Listeners
    if (this.widgetModulesHub) {
      this.widgetModulesHub.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.isModulesHubDisabled()) {
          triggerHaptic(10);
          const lang = this.settings?.lang || 'ru';
          const isEn = lang === 'en';
          const isUk = lang === 'uk';
          const msg = this.t('modules_hub_no_active_toast') || (isEn
            ? 'No active modules. Enable them in Settings ✦'
            : (isUk ? 'Немає активних модулів. Увімкніть їх у Налаштуваннях ✦' : 'Нет активных модулей. Включите их в Настройках ✦'));
          this.showToast(msg);
          return;
        }
        triggerHaptic(20);
        this.toggleModulesHubDropdown();
      });
    }

    // Click outside to close modules dropdown
    document.addEventListener('pointerdown', (e) => {
      if (!this.modulesHubDropdown || !this.modulesHubDropdown.classList.contains('open')) return;
      if (this.widgetModulesHubWrapper && this.widgetModulesHubWrapper.contains(e.target)) return;
      this.closeModulesHubDropdown();
    });

    if (this.widgetSettings) {
      this.widgetSettings.addEventListener('click', () => {
        triggerHaptic(15);
        this.closeModulesHubDropdown();
        this.openSettingsModal();
      });
    }

    if (this.widgetCycle) {
      this.widgetCycle.addEventListener('click', () => {
        triggerHaptic(20);
        this.closeModulesHubDropdown();
        this.openCycleModal();
      });
    }

    // Cycle Tracker Modal Listeners
    if (this.cycleCloseBtn) {
      this.cycleCloseBtn.addEventListener('click', () => this.closeCycleModal());
    }
    bindSafeBackdrop(this.cycleModalBackdrop, () => this.closeCycleModal(), () => this._cycleModalOpenedAt);

    if (this.btnCalendarCycleShortcut) {
      this.btnCalendarCycleShortcut.addEventListener('click', () => {
        triggerHaptic(20);
        this.closeCalendarModal();
        this.openCycleModal();
      });
    }

    if (this.btnOpenCycleFromSettings) {
      this.btnOpenCycleFromSettings.addEventListener('click', () => {
        triggerHaptic(20);
        this.closeSettingsModal();
        this.openCycleModal();
      });
    }

    // Modules Expand / Collapse Listeners
    if (this.btnExpandCycleModule) {
      this.btnExpandCycleModule.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleModuleCard('moduleCardCycle', 'cycleSubSettings', 'btnExpandCycleModule');
      });
    }
    if (this.moduleHeaderCycle) {
      this.moduleHeaderCycle.addEventListener('click', (e) => {
        if (e.target.closest('.toggle-switch, input, button')) return;
        this.toggleModuleCard('moduleCardCycle', 'cycleSubSettings', 'btnExpandCycleModule');
      });
    }

    if (this.btnExpandFinanceModule) {
      this.btnExpandFinanceModule.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleModuleCard('moduleCardFinance', 'financeSubSettings', 'btnExpandFinanceModule');
      });
    }
    if (this.moduleHeaderFinance) {
      this.moduleHeaderFinance.addEventListener('click', (e) => {
        if (e.target.closest('.toggle-switch, input, button')) return;
        this.toggleModuleCard('moduleCardFinance', 'financeSubSettings', 'btnExpandFinanceModule');
      });
    }

    if (this.moduleHeaderNutrition) {
      this.moduleHeaderNutrition.addEventListener('click', (e) => {
        if (e.target.closest('.toggle-switch, input, button')) return;
        this.toggleModuleCard('moduleCardNutrition', 'nutritionSubSettings', 'btnExpandNutritionModule');
      });
    }

    // Settings Category Expand / Collapse Listeners
    const setupSectionToggle = (headerId, btnId, sectionId, bodyId) => {
      const btn = document.getElementById(btnId);
      const header = document.getElementById(headerId);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleModuleCard(sectionId, bodyId, btnId);
        });
      }
      if (header) {
        header.addEventListener('click', (e) => {
          if (e.target.closest('.toggle-switch, input, button, select, label')) return;
          this.toggleModuleCard(sectionId, bodyId, btnId);
        });
      }
    };

    setupSectionToggle('fontSettingsHeader', 'btnExpandFontSettings', 'fontSettingsSection', 'fontSettingsBody');
    setupSectionToggle('notifSettingsHeader', 'btnExpandNotifSettings', 'notifSettingsSection', 'notifSettingsBody');
    setupSectionToggle('backupSettingsHeader', 'btnExpandBackupSettings', 'backupSettingsSection', 'backupSettingsBody');

    // Initialize Finance Tracker Event Listeners
    this.initFinanceTrackerListeners();

    // Initialize Joy Tracker Event Listeners
    this.initJoyTrackerListeners();

    // Initialize Nutrition & Macro Tracker Event Listeners
    this.initNutritionTrackerListeners();

    if (this.btnCycleStartToday) {
      this.btnCycleStartToday.addEventListener('click', () => {
        triggerHaptic([20, 40, 20]);
        if (this.cycleTracker) {
          const isPeriodActive = this.cycleTracker.isPeriodCurrentlyActive();
          if (isPeriodActive) {
            this.cycleTracker.recordTodayAsEnd();
            this.refreshCycleUI('cycle_toast_ended', '✨');
          } else {
            this.cycleTracker.recordTodayAsStart();
            this.refreshCycleUI('cycle_toast_started', '🍒');
          }
        }
      });
    }

    if (this.btnCycleOvulationToday) {
      this.btnCycleOvulationToday.addEventListener('click', () => {
        triggerHaptic([15, 30, 15]);
        if (this.cycleTracker) {
          this.cycleTracker.setOvulationDateForCurrentCycle();
          this.refreshCycleUI('cycle_toast_ovulation', '✨');
        }
      });
    }

    if (this.btnCycleAddManual) {
      this.btnCycleAddManual.addEventListener('click', () => {
        triggerHaptic(15);
        this.openCycleAddModal();
      });
    }

    // Add Cycle Modal Listeners
    [this.cycleAddCloseBtn, this.cycleAddCancelBtn].forEach(btn => {
      btn?.addEventListener('click', () => this.closeCycleAddModal());
    });
    bindSafeBackdrop(this.cycleAddModalBackdrop, () => this.closeCycleAddModal(), () => this._cycleAddModalOpenedAt);

    if (this.cycleAddSaveBtn) {
      this.cycleAddSaveBtn.addEventListener('click', () => this.saveCycleFromForm());
    }

    if (this.cycleAddDeleteBtn) {
      this.cycleAddDeleteBtn.addEventListener('click', () => {
        if (!this.editingCycleId || !this.cycleTracker) return;
        triggerHaptic(20);
        if (confirm(this.t('cycle_confirm_delete'))) {
          this.cycleTracker.deleteCycle(this.editingCycleId);
          this.editingCycleId = null;
          this.closeCycleAddModal();
          this.refreshCycleUI('cycle_toast_deleted', '🗑️');
        }
      });
    }

    if (this.cycleInputStartDate) {
      this.cycleInputStartDate.addEventListener('input', () => {
        const start = this.cycleInputStartDate.value;
        const end = this.cycleInputEndDate ? this.cycleInputEndDate.value : '';
        if (start && end && end < start) {
          const periodLen = this.cycleTracker ? (this.cycleTracker.getSettings().periodLength || 5) : 5;
          if (this.cycleInputEndDate) {
            this.cycleInputEndDate.value = window.Plan4UCycleTracker ? Plan4UCycleTracker.addDays(start, periodLen - 1) : start;
          }
        }
        this.updateCycleFormDurationBadge();
      });
    }

    if (this.cycleInputEndDate) {
      this.cycleInputEndDate.addEventListener('input', () => {
        this.updateCycleFormDurationBadge();
      });
    }

    if (this.weekDaysTrack) {
      this.weekDaysTrack.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSubstrateDrawer();
      });
    } else if (this.weekDaysBar) {
      this.weekDaysBar.addEventListener('click', (e) => {
        // If clicking on Add Habit button or habit input row, do not toggle drawer
        if (e.target.closest('#btnAddHabit') || e.target.closest('#habitAddSlot') || e.target.closest('#habitAddRow')) {
          return;
        }
        this.toggleSubstrateDrawer();
      });
    }

    // Auto-collapse habit tracker drawer on outside click/tap or focus change (tasks, stickers, tabs, etc.)
    const handleOutsideHabits = (e) => {
      const container = document.getElementById('tabsSubstrateContainer');
      if (!container || !container.classList.contains('is-expanded')) {
        return;
      }
      // Do not collapse substrate drawer if habit modal or stepper popover is open
      const habitModal = document.getElementById('habitModalBackdrop');
      if (habitModal && habitModal.classList.contains('open')) {
        return;
      }
      const stepperModal = document.getElementById('habitStepperBackdrop');
      if (stepperModal && stepperModal.classList.contains('open')) {
        return;
      }
      // Ignore if drawer was just opened in this exact event tick (< 150ms)
      if (this._substrateDrawerOpenedAt && (Date.now() - this._substrateDrawerOpenedAt < 150)) {
        return;
      }

      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      const isInsideHabits = target.closest('#weekDaysBar')
        || target.closest('#substrateTray')
        || target.closest('#habitModalBackdrop')
        || target.closest('#habitStepperBackdrop')
        || target.closest('#confirmModalBackdrop');

      if (isInsideHabits) return;

      // If user clicked the Stickers button, let its handler open stickers and collapse habits
      if (target.closest('#fabStickersBtn') || target.closest('.fab-stickers-wrapper')) {
        return;
      }

      // Defer collapse to next frame so the clicked button or element
      // (e.g. Settings gear, Trophy, Date, Tab, Task Checkbox) executes its action
      // first without any layout reflow cancelling the click event.
      requestAnimationFrame(() => {
        this.collapseSubstrateDrawer(true);
      });
    };

    // For focusin, only handle when focus shifts via keyboard navigation (not when clicking buttons)
    // to prevent premature layout collapse before mouseup, which moves the button away and cancels the click event!
    const handleOutsideFocus = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;
      if (target.closest('button, .fab-stickers-btn, .fab-button, .widget-circle, .folder-tab, [role="button"], [role="tab"]')) {
        return;
      }
      handleOutsideHabits(e);
    };

    const outsideEventOpts = { capture: true, passive: true };
    document.addEventListener('click', handleOutsideHabits, outsideEventOpts);
    document.addEventListener('focusin', handleOutsideFocus, outsideEventOpts);

    if (this.btnAddHabit) {
      this.btnAddHabit.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        this.openHabitModal('create');
      });
    }

    this.initHabitModalListeners();
    this.initHabitStepperListeners();
  }

  // Initialize habit modal event listeners
  initHabitModalListeners() {
    const backdrop = document.getElementById('habitModalBackdrop');
    const closeBtn = document.getElementById('habitModalCloseBtn');
    const cancelBtn = document.getElementById('habitModalCancelBtn');
    const form = document.getElementById('habitModalForm');
    const statsTab = document.getElementById('habitTabBtnStats');
    const settingsTab = document.getElementById('habitTabBtnSettings');
    const btnBool = document.getElementById('habitTypeBtnBoolean');
    const btnNum = document.getElementById('habitTypeBtnNumeric');
    const deleteBtn = document.getElementById('btnDeleteHabitFromModal');

    const handleClose = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      triggerHaptic(15);
      this.closeHabitModal();
    };

    closeBtn?.addEventListener('click', handleClose);
    cancelBtn?.addEventListener('click', handleClose);

    let startedOnBackdrop = false;
    if (backdrop) {
      backdrop.addEventListener('pointerdown', (e) => {
        startedOnBackdrop = (e.target === backdrop);
      });
      backdrop.addEventListener('click', (e) => {
        if (startedOnBackdrop && e.target === backdrop) {
          if (Date.now() - (this._habitModalOpenedAt || 0) < 350) return;
          handleClose(e);
        }
        startedOnBackdrop = false;
      });
    }

    // Safe action helper: prevents input blur from jumping viewport before button action completes
    const bindSafeModalAction = (btnEl, actionFn) => {
      if (!btnEl) return;
      btnEl.addEventListener('pointerdown', (e) => {
        e.preventDefault();
      });
      btnEl.addEventListener('click', (e) => {
        e.preventDefault();
        actionFn(e);
      });
    };

    // Tabs
    bindSafeModalAction(statsTab, () => {
      triggerHaptic(10);
      this.switchHabitModalTab('stats');
    });

    bindSafeModalAction(settingsTab, () => {
      triggerHaptic(10);
      this.switchHabitModalTab('settings');
    });

    // Type toggles (Reliable tap even when virtual keyboard is active!)
    bindSafeModalAction(btnBool, () => {
      triggerHaptic(10);
      this.setHabitFormType('boolean');
    });

    bindSafeModalAction(btnNum, () => {
      triggerHaptic(10);
      this.setHabitFormType('numeric');
    });

    // Unit chips
    document.querySelectorAll('#habitUnitChips .habit-unit-chip').forEach(chip => {
      chip.addEventListener('pointerdown', (e) => e.preventDefault());
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        triggerHaptic(10);
        document.querySelectorAll('#habitUnitChips .habit-unit-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const customUnitInput = document.getElementById('habitUnitCustomInput');
        if (customUnitInput) customUnitInput.value = '';
      });
    });

    // Custom unit input clears chip active
    const customUnitInput = document.getElementById('habitUnitCustomInput');
    customUnitInput?.addEventListener('input', () => {
      if (customUnitInput.value.trim()) {
        document.querySelectorAll('#habitUnitChips .habit-unit-chip').forEach(c => c.classList.remove('active'));
      }
    });

    // Schedule radio
    document.querySelectorAll('input[name="habitScheduleRadio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        triggerHaptic(10);
        this.updateHabitScheduleUI(radio.value);
      });
    });

    document.querySelectorAll('.habit-sched-option').forEach(opt => {
      opt.addEventListener('pointerdown', (e) => {
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          triggerHaptic(10);
          this.updateHabitScheduleUI(radio.value);
        }
      });
    });

    // Weekday buttons
    document.querySelectorAll('#habitWeekdaysPicker .habit-dow-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => e.preventDefault());
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerHaptic(10);
        btn.classList.toggle('active');
      });
    });

    // Habit reminder toggle and wheel picker
    this.initHabitTimeWheelPicker();
    const reminderToggle = document.getElementById('habitReminderToggle');
    const reminderTimeBox = document.getElementById('habitReminderTimeBox');

    reminderToggle?.addEventListener('change', async () => {
      triggerHaptic(10);
      if (reminderTimeBox) {
        reminderTimeBox.style.display = reminderToggle.checked ? 'block' : 'none';
        if (reminderToggle.checked) {
          const currentTime = document.getElementById('habitReminderTimeInput')?.value || '09:00';
          this.setHabitWheelTime(currentTime);
        }
      }
      if (reminderToggle.checked && !this.settings.notificationsEnabled) {
        await this.requestNotificationPermission();
      }
    });

    // Delete in edit modal
    deleteBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerHaptic(15);
      if (this.currentEditingHabitId) {
        this.deleteHabit(this.currentEditingHabitId);
      }
    });

    const submitBtn = document.getElementById('habitModalSubmitBtn');
    let isSubmittingHabit = false;
    const triggerSave = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isSubmittingHabit) return;
      isSubmittingHabit = true;
      setTimeout(() => { isSubmittingHabit = false; }, 500);

      this.saveHabitFromModal();
    };

    let submitPointerDown = false;
    let submitPointerY = 0;

    submitBtn?.addEventListener('pointerdown', (e) => {
      submitPointerDown = true;
      submitPointerY = e.clientY;
      try {
        if (submitBtn.setPointerCapture) {
          submitBtn.setPointerCapture(e.pointerId);
        }
      } catch (err) { }
    });

    submitBtn?.addEventListener('pointerup', (e) => {
      if (submitPointerDown) {
        submitPointerDown = false;
        try {
          if (submitBtn.releasePointerCapture) {
            submitBtn.releasePointerCapture(e.pointerId);
          }
        } catch (err) { }
        if (Math.abs(e.clientY - submitPointerY) < 25) {
          triggerSave(e);
        }
      }
    });

    submitBtn?.addEventListener('pointercancel', () => {
      submitPointerDown = false;
    });

    submitBtn?.addEventListener('click', triggerSave);

    // Form submit
    form?.addEventListener('submit', triggerSave);

    // Custom Habit Period Dropdown in Stats
    const periodWrap = document.getElementById('habitPeriodDropdownWrap');
    const periodBtn = document.getElementById('habitPeriodDropdownBtn');
    const periodMenu = document.getElementById('habitPeriodDropdownMenu');

    if (periodBtn && periodMenu) {
      periodBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(10);
        const isOpen = periodMenu.classList.contains('show');
        periodMenu.classList.toggle('show', !isOpen);
        periodBtn.classList.toggle('open', !isOpen);
        periodBtn.setAttribute('aria-expanded', String(!isOpen));
      });

      periodMenu.querySelectorAll('.habit-period-opt').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerHaptic(15);
          const chosenPeriod = opt.dataset.period;
          if (!chosenPeriod) return;

          this.currentHabitChartPeriod = chosenPeriod;
          try {
            localStorage.setItem('plan4u_habit_chart_period', chosenPeriod);
          } catch (err) { }

          this.updateHabitPeriodDropdownUI(chosenPeriod);

          periodMenu.classList.remove('show');
          periodBtn.classList.remove('open');
          periodBtn.setAttribute('aria-expanded', 'false');

          if (this.currentHabitInModal || this.currentEditingHabitId) {
            const h = this.currentHabitInModal || (this.habits || []).find(x => x.id === this.currentEditingHabitId);
            if (h) {
              const stats = this.currentHabitStats || this.calculateHabitStats(h);
              this.renderHabitChart(h, stats, chosenPeriod);
            }
          }
        });
      });

      // Close period menu on click outside
      document.addEventListener('click', (e) => {
        if (!periodWrap || !periodWrap.contains(e.target)) {
          periodMenu.classList.remove('show');
          periodBtn.classList.remove('open');
          periodBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  // Initialize Quick Stepper event listeners
  initHabitStepperListeners() {
    const backdrop = document.getElementById('habitStepperBackdrop');
    const closeBtn = document.getElementById('habitStepperCloseBtn');
    const doneBtn = document.getElementById('habitStepperDoneBtn');
    const minusBtn = document.getElementById('habitStepMinusBtn');
    const plusBtn = document.getElementById('habitStepPlusBtn');
    const inputEl = document.getElementById('habitStepInput');
    const quick1 = document.getElementById('habitQuickStep1Btn');
    const quick2 = document.getElementById('habitQuickStep2Btn');
    const quickComplete = document.getElementById('habitQuickCompleteBtn');
    const quickReset = document.getElementById('habitQuickResetBtn');

    const commitInput = () => {
      if (!this.currentStepperHabitId || !this.currentStepperDate || !inputEl) return;
      const str = (inputEl.value || '').trim();
      const rawVal = str === '' ? 0 : parseFloat(str);
      const val = isNaN(rawVal) ? 0 : Math.max(0, rawVal);
      this.setHabitStepperValue(val);
    };

    const handleSaveAndClose = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      commitInput();
      triggerHaptic(15);
      this.closeHabitStepper();
    };

    const handleCancelClose = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      triggerHaptic(15);
      this.closeHabitStepper();
    };

    closeBtn?.addEventListener('click', handleCancelClose);
    doneBtn?.addEventListener('click', handleSaveAndClose);

    let startedOnStepperBackdrop = false;
    if (backdrop) {
      backdrop.addEventListener('pointerdown', (e) => {
        startedOnStepperBackdrop = (e.target === backdrop);
      });
      backdrop.addEventListener('click', (e) => {
        if (startedOnStepperBackdrop && e.target === backdrop) {
          if (Date.now() - (this._stepperOpenedAt || 0) < 300) return;
          handleSaveAndClose(e);
        }
        startedOnStepperBackdrop = false;
      });
    }

    // Auto-clear 0 on focus so user can type their number immediately without backspacing
    inputEl?.addEventListener('focus', () => {
      const currentValStr = (inputEl.value || '').trim();
      if (currentValStr === '0' || currentValStr === '0.0' || currentValStr === '0.00' || parseFloat(currentValStr) === 0) {
        inputEl.value = '';
      } else {
        try { inputEl.select(); } catch (_) {}
      }
    });

    inputEl?.addEventListener('blur', () => {
      if ((inputEl.value || '').trim() === '' || isNaN(parseFloat(inputEl.value))) {
        const cur = getHabitCurrent();
        inputEl.value = cur.toString();
      }
    });

    // Live preview while typing
    inputEl?.addEventListener('input', () => {
      if (!this.currentStepperHabitId) return;
      const habit = (this.habits || []).find(h => h.id === this.currentStepperHabitId);
      const tgt = Number(habit?.target?.value) || 1;
      const str = (inputEl.value || '').trim();
      const rawVal = str === '' ? 0 : parseFloat(str);
      const val = isNaN(rawVal) ? 0 : Math.max(0, rawVal);

      const curValEl = document.getElementById('habitStepperCurrentVal');
      const progressFill = document.getElementById('habitStepperProgressFill');
      if (curValEl) curValEl.textContent = val;
      const pct = Math.min(Math.max((val / tgt) * 100, 0), 100);
      if (progressFill) progressFill.style.width = `${pct}%`;
    });

    inputEl?.addEventListener('change', () => {
      commitInput();
    });

    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveAndClose(e);
      }
    });

    const getHabitCurrent = () => {
      if (!this.currentStepperHabitId || !this.currentStepperDate) return 0;
      const habit = (this.habits || []).find(h => h.id === this.currentStepperHabitId);
      const hEntry = habit && habit.history && habit.history[this.currentStepperDate];
      if (typeof hEntry === 'object') return (hEntry.current !== undefined) ? Number(hEntry.current) : (hEntry.completed ? (Number(habit?.target?.value) || 1) : 0);
      if (hEntry) return Number(habit?.target?.value) || 1;
      return 0;
    };

    minusBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.currentStepperHabitId) return;
      const habit = (this.habits || []).find(h => h.id === this.currentStepperHabitId);
      const step = this.getHabitAutoStep(habit);
      const cur = getHabitCurrent();
      this.setHabitStepperValue(Math.max(0, cur - step));
    });

    plusBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.currentStepperHabitId) return;
      const habit = (this.habits || []).find(h => h.id === this.currentStepperHabitId);
      const step = this.getHabitAutoStep(habit);
      const cur = getHabitCurrent();
      this.setHabitStepperValue(cur + step);
    });

    quick1?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.currentStepperHabitId) return;
      const habit = (this.habits || []).find(h => h.id === this.currentStepperHabitId);
      const step = this.getHabitAutoStep(habit);
      const cur = getHabitCurrent();
      this.setHabitStepperValue(cur + step);
    });

    quick2?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.currentStepperHabitId) return;
      const habit = (this.habits || []).find(h => h.id === this.currentStepperHabitId);
      const step = this.getHabitAutoStep(habit);
      const cur = getHabitCurrent();
      this.setHabitStepperValue(cur + step * 2);
    });

    quickComplete?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.currentStepperHabitId) return;
      const habit = (this.habits || []).find(h => h.id === this.currentStepperHabitId);
      const tgt = Number(habit?.target?.value) || 1;
      this.setHabitStepperValue(tgt);
    });

    quickReset?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.setHabitStepperValue(0);
    });
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
      if (e.target.closest('#weekDaysBar')) return;
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

      // In Dark mode, tabs are pure monochrome grayscale (black to white range) without colored tints
      if (isDark) {
        tabBtn.style.backgroundColor = isActive ? '#141720' : '#1e2330';
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
          this.clearTextSelectionAndFocus();
          this.openEditTabModal(tab.id);
        }, 450);
      };

      const cancelPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      tabBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

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
        sheet.style.backgroundColor = '#141720';
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
    this.clearTextSelectionAndFocus();
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    this.currentEditingTabId = tabId;
    this.selectedTabColorId = tab.colorId || 'white';
    this.selectedPattern = tab.pattern || 'lines';
    this.selectedPatternSize = tab.patternSize || 32;

    if (this.editTabId) this.editTabId.value = tabId;
    if (this.editTabTitleInput) {
      this.editTabTitleInput.value = tab.title.replace('\n', ' ');
      this.editTabTitleInput.blur();
      try {
        this.editTabTitleInput.selectionStart = this.editTabTitleInput.selectionEnd = this.editTabTitleInput.value.length;
      } catch (e) { }
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

    this.clearTextSelectionAndFocus();
    if (this.editTabTitleInput) this.editTabTitleInput.blur();

    [40, 100, 200, 350].forEach(delay => {
      setTimeout(() => {
        if (this.editTabModalBackdrop && this.editTabModalBackdrop.classList.contains('open')) {
          if (document.activeElement === this.editTabTitleInput || (document.activeElement && document.activeElement.tagName === 'INPUT')) {
            document.activeElement.blur();
          }
          this.clearTextSelectionAndFocus();
        }
      }, delay);
    });
  }

  // Close Edit Tab Modal
  closeEditTabModal() {
    this.clearTextSelectionAndFocus();
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
    this.collapseSubstrateDrawer();
    if (this.currentTab === tabKey) return;
    this.currentTab = tabKey;
    if (tabKey === 'buy') {
      this.rolloverBuyTasks();
    }
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
      const stored = localStorage.getItem('plan4u_tab_sections') || 
                     localStorage.getItem('todo_notebook_tab_sections') ||
                     localStorage.getItem('plan4u_sections.json');
      if (stored) {
        this.tabSections = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load sections:', e);
    }

    if (!this.tabSections) {
      this.tabSections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    }

    this.recoverMissingTabSections();
  }

  // Automatic recovery of custom tab sections from tasks or backups
  recoverMissingTabSections() {
    if (!this.tabSections || typeof this.tabSections !== 'object') {
      this.tabSections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    }

    const tabs = this.tabs || [];
    let modified = false;

    tabs.forEach(tab => {
      const tabId = tab.id;
      if (DEFAULT_SECTIONS[tabId]) {
        if (!this.tabSections[tabId] || this.tabSections[tabId].length === 0) {
          this.tabSections[tabId] = JSON.parse(JSON.stringify(DEFAULT_SECTIONS[tabId]));
          modified = true;
        }
        return;
      }

      const existingSections = this.tabSections[tabId] || [];
      const tasksInTab = (this.tasks && this.tasks[tabId]) || [];

      // Collect all unique section IDs referenced by tasks
      const referencedSecIds = [];
      tasksInTab.forEach(t => {
        const sid = t.section || (typeof getTaskSection === 'function' ? getTaskSection(t) : null);
        if (sid && !referencedSecIds.includes(sid)) {
          referencedSecIds.push(sid);
        }
      });

      const existingSecIdSet = new Set(existingSections.map(s => s.id));
      const missingSecIds = referencedSecIds.filter(sid => !existingSecIdSet.has(sid));

      if (missingSecIds.length > 0) {
        const reconstructed = [...existingSections];
        missingSecIds.forEach((sid) => {
          let secName = '';
          const taskWithSec = tasksInTab.find(t => (t.section || (typeof getTaskSection === 'function' ? getTaskSection(t) : null)) === sid);
          if (taskWithSec && taskWithSec.sectionName) {
            secName = taskWithSec.sectionName;
          } else if (sid && !sid.startsWith('sec_') && sid !== 'main' && sid !== 'personal' && sid.length > 1) {
            secName = sid;
          } else {
            secName = `Блок ${reconstructed.length + 1}`;
          }

          reconstructed.push({
            id: sid,
            name: secName,
            icon: '📋'
          });
          existingSecIdSet.add(sid);
        });

        // Filter out unused dummy 'main' section if real sections were restored
        const hasTasksInMain = tasksInTab.some(t => (t.section || (typeof getTaskSection === 'function' ? getTaskSection(t) : null)) === 'main');
        this.tabSections[tabId] = reconstructed.filter(s => {
          if (s.id === 'main' && !hasTasksInMain && reconstructed.length > 1) {
            return false;
          }
          return true;
        });
        modified = true;
      } else if (!this.tabSections[tabId] || this.tabSections[tabId].length === 0) {
        this.tabSections[tabId] = [
          { id: 'sec_' + Date.now().toString(36), name: 'Планы', icon: '📋' }
        ];
        modified = true;
      }
    });

    if (modified) {
      this.saveSections();
    }
    return modified;
  }

  getTabSections(tabId) {
    if (!this.tabSections) this.initSections();
    if (!this.tabSections[tabId] || this.tabSections[tabId].length === 0) {
      if (DEFAULT_SECTIONS[tabId]) {
        this.tabSections[tabId] = JSON.parse(JSON.stringify(DEFAULT_SECTIONS[tabId]));
      } else {
        // Check if tasks in this tab reference any sections
        const tasksInTab = (this.tasks && this.tasks[tabId]) || [];
        const uniqueSecs = [];
        tasksInTab.forEach(t => {
          const sid = t.section || (typeof getTaskSection === 'function' ? getTaskSection(t) : null);
          if (sid && !uniqueSecs.includes(sid)) uniqueSecs.push(sid);
        });

        if (uniqueSecs.length > 0) {
          this.tabSections[tabId] = uniqueSecs.map((sid, idx) => ({
            id: sid,
            name: (sid && !sid.startsWith('sec_') && sid !== 'main' && sid !== 'personal' && sid.length > 1) ? sid : `Блок ${idx + 1}`,
            icon: '📋'
          }));
        } else {
          this.tabSections[tabId] = [
            { id: 'sec_' + Date.now().toString(36), name: 'Планы', icon: '📋' }
          ];
        }
      }
      this.saveSections();
    }
    return this.tabSections[tabId];
  }

  saveSections() {
    try {
      const json = JSON.stringify(this.tabSections);
      localStorage.setItem('plan4u_tab_sections', json);
      localStorage.setItem('todo_notebook_tab_sections', json);
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

    const dict = I18N[lang] || I18N.ru || {};

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

    // 3. Update title attributes with [data-i18n-title]
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key]) {
        el.setAttribute('title', dict[key]);
      }
    });

    // 3b. Update aria-label attributes with [data-i18n-aria]
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key]) {
        el.setAttribute('aria-label', dict[key]);
      }
    });

    // 4. Update circular badge text
    const badgeText = document.getElementById('langBadgeText');
    if (badgeText) {
      badgeText.textContent = dict.code || 'РУ';
    }

    // 5. Update active dropdown item in settings
    const dropdownMenu = document.getElementById('langDropdownMenu');
    if (dropdownMenu) {
      dropdownMenu.querySelectorAll('.lang-dropdown-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
      });
    }

    // 6. Update system tabs default titles if not customized
    if (this.tabs) {
      this.tabs.forEach(tab => {
        if (tab.id === 'todo' && !tab.customTitle) tab.title = dict.tab_todo;
        if (tab.id === 'buy' && !tab.customTitle) tab.title = dict.tab_buy;
        if (tab.id === 'watch' && !tab.customTitle) tab.title = dict.tab_watch;
      });
      this.saveTabs();
      this.renderTabs();
    }

    // 7. Update stickers drawer category tabs with translated names
    if (typeof this.renderStickersCategoryTabs === 'function') {
      this.renderStickersCategoryTabs();
    }

    // 8. Update pet companion modal UI
    if (this.petSystem && typeof this.petSystem.renderFullModal === 'function') {
      this.petSystem.renderFullModal();
    }

    // 9. Refresh date widget, achievements, and main notebook content
    if (typeof buildAchievementsCatalog === 'function') {
      ACHIEVEMENTS_LIST = buildAchievementsCatalog(lang);
    }
    this.updateDateWidget();
    this.render();
    if (typeof this.renderWeekDays === 'function') {
      this.renderWeekDays();
    }
    if (typeof this.renderHabits === 'function') {
      this.renderHabits();
    }
    if (this.calendarModalBackdrop && this.calendarModalBackdrop.classList.contains('open')) {
      this.renderCalendar();
    }
    if (this.achievementsModalBackdrop && this.achievementsModalBackdrop.classList.contains('open')) {
      this.renderAchievements();
    }
  }

  // Translation helper function with parameter interpolation
  t(key, params = {}) {
    const lang = this.settings?.lang || detectSystemLanguage();
    if (window.Plan4UI18n && typeof window.Plan4UI18n.t === 'function') {
      return window.Plan4UI18n.t(key, params, lang);
    }
    const dict = I18N[lang] || I18N.ru || {};
    let str = dict[key] || (I18N.ru && I18N.ru[key]) || key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(p => {
        str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
      });
    }
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
    // In Dark theme, completely remove accent color influence: pure grayscale monochrome from black to white
    if (isDark) {
      document.documentElement.style.setProperty('--primary-rgb', '226, 232, 240');
      document.documentElement.style.setProperty('--primary-magenta', '#f1f5f9');
      document.documentElement.style.setProperty('--primary-magenta-dark', '#cbd5e1');
      document.documentElement.style.setProperty('--btn-accent-text', '#0f172a');
      document.documentElement.style.setProperty('--btn-accent-border', '1px solid rgba(255, 255, 255, 0.2)');
      document.documentElement.style.setProperty('--accent-readable-text', '#ffffff');
      document.documentElement.style.setProperty('--accent-margin-line', 'rgba(255, 255, 255, 0.16)');
      document.documentElement.style.setProperty('--section-header-bg', '#20242e');
      document.documentElement.style.setProperty('--section-header-border', '#384050');
      document.documentElement.style.setProperty('--section-header-text', '#f1f5f9');
    } else {
      const accentObj = ACCENT_COLORS.find(c => c.id === this.settings.accentColorId) || ACCENT_COLORS[0];
      document.documentElement.style.setProperty('--primary-rgb', accentObj.rgb || '216, 58, 136');
      document.documentElement.style.setProperty('--primary-magenta', accentObj.color);
      document.documentElement.style.setProperty('--primary-magenta-dark', accentObj.dark);
      document.documentElement.style.setProperty('--btn-accent-text', accentObj.btnText || '#ffffff');
      document.documentElement.style.setProperty('--btn-accent-border', accentObj.btnBorder || 'none');
      document.documentElement.style.setProperty('--accent-readable-text', accentObj.readableText || accentObj.sectionText || accentObj.dark);
      document.documentElement.style.setProperty('--accent-margin-line', accentObj.marginLine);
      document.documentElement.style.setProperty('--section-header-bg', accentObj.sectionBg);
      document.documentElement.style.setProperty('--section-header-border', accentObj.sectionBorder);
      document.documentElement.style.setProperty('--section-header-text', accentObj.sectionText);
    }

    // Toggle disabled state on Accent Color settings section when in Dark mode
    const accentSec = document.getElementById('accentColorSection') || (this.accentColorPicker ? this.accentColorPicker.closest('.settings-section') : null);
    if (accentSec) {
      accentSec.classList.toggle('is-disabled', isDark);
    }

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
    this.updateSubstrateTrayHeight();
  }

  // Play subtle audio pop on task completion with cached AudioContext
  playCompletionSound() {
    if (!this.settings.soundEnabled) return;
    try {
      if (!this._audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this._audioCtx = new AudioContextClass();
        }
      }
      if (!this._audioCtx) return;
      if (this._audioCtx.state === 'suspended') {
        this._audioCtx.resume();
      }
      const ctx = this._audioCtx;
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

  // Play gentle triumphant chime arpeggio when all tasks for the day are closed
  playTriumphSound() {
    if (!this.settings?.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (major arpeggio)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.08;
        const dur = idx === notes.length - 1 ? 0.45 : 0.18;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    } catch (e) { }
  }

  // Micro-triumph: Confetti salute, haptic pulse, fanfare chime and toast when all today's tasks are done
  checkAllTasksCompletedTriumph() {
    if (this.currentTab !== 'todo') return;
    const todoTasks = (this.tasks['todo'] || []).filter(t => !t.isEmpty && (t.text && t.text.trim().length > 0));
    if (todoTasks.length === 0) return;
    const allDone = todoTasks.every(t => t.completed);
    if (!allDone) return;

    // Small delay (~280ms) so the checkbox animation and task gliding begin, then BOOM - confetti!
    setTimeout(() => {
      const currentTodo = (this.tasks['todo'] || []).filter(t => !t.isEmpty && (t.text && t.text.trim().length > 0));
      if (currentTodo.length === 0 || !currentTodo.every(t => t.completed)) return;

      if (typeof launchConfetti === 'function') {
        launchConfetti();
      }
      triggerHaptic([40, 60, 50, 80, 60, 100, 80, 160]);
      this.playTriumphSound();
      const toastMsg = this.t('toast_all_tasks_completed') || 'Все дела на сегодня закрыты! Отличная работа ✨';
      this.showToast(toastMsg, '✨');
    }, 280);
  }

  // Open Settings Modal
  openSettingsModal() {
    this.collapseAllModuleCards();
    this.collapseSubstrateDrawer(true);
    this.dismissActiveKeyboard();
    this.clearTextSelectionAndFocus();
    if (!this.settingsModalBackdrop) return;

    // Trigger instant hardware-composited slide-up animation immediately
    this._settingsModalOpenedAt = Date.now();
    this.settingsModalBackdrop.classList.add('open');
    this.settingsModalBackdrop.setAttribute('aria-hidden', 'false');
    if (typeof this.updateJoyDemoBadges === 'function') this.updateJoyDemoBadges();

    [40, 100, 200].forEach(delay => {
      setTimeout(() => {
        if (this.settingsModalBackdrop && this.settingsModalBackdrop.classList.contains('open')) {
          if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
            document.activeElement.blur();
          }
          this.clearTextSelectionAndFocus();
        }
      }, delay);
    });

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

    const langCircleBtn = document.getElementById('langCircleBadgeBtn');
    const langDropdown = document.getElementById('langDropdownMenu');
    const langBadgeText = document.getElementById('langBadgeText');

    // Bind event listeners and generate static swatches only once
    if (!this._settingsListenersBound) {
      this._settingsListenersBound = true;

      if (langDropdown) {
        langDropdown.querySelectorAll('.lang-dropdown-opt').forEach(opt => {
          opt.onclick = (e) => {
            e.stopPropagation();
            const selectedLang = opt.dataset.lang;
            this.applyLanguage(selectedLang);
            triggerHaptic(20);
            this.showToast(this.t('toast_lang_changed'), '🌐');
            if (langCircleBtn) langCircleBtn.classList.remove('open');
            if (langDropdown) langDropdown.classList.remove('show');
            const langWrapper = document.getElementById('langPickerWrapper');
            if (langWrapper) langWrapper.classList.remove('open');
            const langSection = document.getElementById('settingsLangSection') || document.querySelector('.settings-section-lang');
            if (langSection) langSection.classList.remove('dropdown-open');
          };
        });
      }

      if (langCircleBtn) {
        langCircleBtn.onclick = (e) => {
          e.stopPropagation();
          triggerHaptic(15);
          const isOpen = langDropdown && langDropdown.classList.contains('show');
          const willOpen = !isOpen;
          if (langCircleBtn) langCircleBtn.classList.toggle('open', willOpen);
          if (langDropdown) langDropdown.classList.toggle('show', willOpen);
          const langWrapper = document.getElementById('langPickerWrapper');
          if (langWrapper) langWrapper.classList.toggle('open', willOpen);
          const langSection = document.getElementById('settingsLangSection') || document.querySelector('.settings-section-lang');
          if (langSection) langSection.classList.toggle('dropdown-open', willOpen);
        };
      }

      // Close language dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#langPickerWrapper')) {
          if (langCircleBtn) langCircleBtn.classList.remove('open');
          if (langDropdown) langDropdown.classList.remove('show');
          const langWrapper = document.getElementById('langPickerWrapper');
          if (langWrapper) langWrapper.classList.remove('open');
          const langSection = document.getElementById('settingsLangSection') || document.querySelector('.settings-section-lang');
          if (langSection) langSection.classList.remove('dropdown-open');
        }
      });

      if (this.themeSelector) {
        this.themeSelector.querySelectorAll('.segmented-btn').forEach(btn => {
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

      if (this.accentColorPicker) {
        this.accentColorPicker.innerHTML = ACCENT_COLORS.map(c => `
          <button type="button" class="accent-swatch ${c.id === this.settings.accentColorId ? 'active' : ''}" 
                  data-accent-id="${c.id}" 
                  style="background-color: ${c.color};" 
                  title="${this.t('theme_accent_' + c.id) || c.name}">
          </button>
        `).join('');

        this.accentColorPicker.querySelectorAll('.accent-swatch').forEach(swatch => {
          swatch.onclick = () => {
            if (this.isDarkMode()) return;
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

      if (this.fontFamilySelect) {
        this.fontFamilySelect.onchange = (e) => {
          this.settings.fontFamily = e.target.value;
          this.saveSettings();
          this.applySettings();
          this.updateFontPreview();
          triggerHaptic(15);
        };
      }

      if (this.fontSizeRange && this.fontSizeVal) {
        this.fontSizeRange.oninput = (e) => {
          this.settings.fontSize = parseInt(e.target.value, 10);
          this.fontSizeVal.textContent = `${this.settings.fontSize} px`;
          this.saveSettings();
          this.applySettings();
          this.updateFontPreview();
        };
      }

      if (this.taskWeightRange && this.taskWeightVal) {
        this.taskWeightRange.min = '400';
        this.taskWeightRange.max = '600';
        this.taskWeightRange.step = '50';
        this.taskWeightRange.oninput = (e) => {
          this.settings.taskFontWeight = parseInt(e.target.value, 10);
          this.taskWeightVal.textContent = getRegularWeightLabel(this.settings.taskFontWeight);
          this.saveSettings();
          this.applySettings();
          this.updateFontPreview();
        };
      }

      if (this.priorityWeightRange && this.priorityWeightVal) {
        this.priorityWeightRange.oninput = (e) => {
          this.settings.priorityFontWeight = parseInt(e.target.value, 10);
          this.priorityWeightVal.textContent = getPrioWeightLabel(this.settings.priorityFontWeight);
          this.saveSettings();
          this.applySettings();
          this.updateFontPreview();
        };
      }

      if (this.toggleNotifications) {
        this.toggleNotifications.onchange = async (e) => {
          if (e.target.checked) {
            const granted = await this.requestNotificationPermission();
            if (!granted) {
              e.target.checked = false;
            } else {
              this.scheduleSmartDailyNotifications();
              this.scheduleAllHabitReminders();
            }
          } else {
            this.settings.notificationsEnabled = false;
            this.saveSettings();
            this.scheduleSmartDailyNotifications();
          }
        };
      }

      if (this.toggleMorningNotif) {
        this.toggleMorningNotif.onchange = (e) => {
          this.settings.morningNotifEnabled = e.target.checked;
          this.saveSettings();
          this.scheduleSmartDailyNotifications();
        };
      }

      if (this.morningNotifTime) {
        this.morningNotifTime.onchange = (e) => {
          this.settings.morningNotifTime = e.target.value || '09:00';
          this.saveSettings();
          this.scheduleSmartDailyNotifications();
        };
      }

      if (this.toggleEveningNotif) {
        this.toggleEveningNotif.onchange = (e) => {
          this.settings.eveningNotifEnabled = e.target.checked;
          this.saveSettings();
          this.scheduleSmartDailyNotifications();
        };
      }

      if (this.eveningNotifTime) {
        this.eveningNotifTime.onchange = (e) => {
          this.settings.eveningNotifTime = e.target.value || '21:00';
          this.saveSettings();
          this.scheduleSmartDailyNotifications();
        };
      }

      if (this.togglePetNotif) {
        this.togglePetNotif.onchange = (e) => {
          this.settings.petNotifEnabled = e.target.checked;
          this.saveSettings();
          this.scheduleSmartDailyNotifications();
        };
      }

      if (this.toggleHaptics) {
        this.toggleHaptics.onchange = (e) => {
          this.settings.hapticsEnabled = e.target.checked;
          this.saveSettings();
          if (e.target.checked) triggerHaptic(20);
        };
      }

      if (this.toggleSound) {
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

      if (this.cycleTracker) {
        if (this.toggleCycleTracker) {
          this.toggleCycleTracker.onchange = (e) => {
            const enabled = e.target.checked;
            this.cycleTracker.updateSettings({ enabled });
            this.updateCycleWidget();
            this.updateModulesHubState();
            this.renderCalendar();
            const lang = this.settings?.lang || 'ru';
            const isEn = lang === 'en';
            const isUk = lang === 'uk';
            const msg = enabled
              ? (this.t('cycle_enabled_toast') || (isEn ? "Women's calendar enabled! 🍒" : (isUk ? 'Жіночий календар увімкнено! 🍒' : 'Женский календарь включен! 🍒')))
              : (this.t('cycle_disabled_toast') || (isEn ? "Women's calendar disabled" : (isUk ? 'Жіночий календар вимкнено' : 'Женский календарь отключен')));
            this.showToast(msg, enabled ? '🍒' : null);
            if (enabled && this.moduleCardCycle && !this.moduleCardCycle.classList.contains('expanded')) {
              this.toggleModuleCard('moduleCardCycle', 'cycleSubSettings', 'btnExpandCycleModule');
            }
          };
        }

        if (this.toggleCycleIrregular) {
          this.toggleCycleIrregular.onchange = (e) => {
            this.cycleTracker.updateSettings({ isIrregular: e.target.checked });
            this.renderCalendar();
          };
        }

        if (this.cyclePeriodLengthRange) {
          this.cyclePeriodLengthRange.oninput = (e) => {
            const val = parseInt(e.target.value, 10) || 5;
            if (this.cyclePeriodLengthVal) {
              this.cyclePeriodLengthVal.textContent = `${val} дн.`;
            }
            this.cycleTracker.updateSettings({ periodLength: val });
            this.renderCalendar();
          };
        }

        if (this.cycleDefaultLengthRange) {
          this.cycleDefaultLengthRange.oninput = (e) => {
            const val = parseInt(e.target.value, 10) || 28;
            if (this.cycleDefaultLengthVal) {
              this.cycleDefaultLengthVal.textContent = `${val} дн.`;
            }
            this.cycleTracker.updateSettings({ defaultCycleLength: val });
            this.renderCycleModalContent();
            this.renderCalendar();
            this.updateCycleWidget();
          };
        }
      }

      if (this.importBackupFile) {
        this.importBackupFile.onchange = (e) => this.importBackup(e);
      }
      if (this.btnSaveToGoogleDrive) {
        this.btnSaveToGoogleDrive.onclick = () => this.saveToGoogleDriveDirect();
      }
      if (this.btnDownloadLocalBackup) {
        this.btnDownloadLocalBackup.onclick = () => this.downloadLocalBackup();
      }
    }

    // Fast synchronous value updates
    const currentLang = this.settings.lang || detectSystemLanguage();
    if (langBadgeText) {
      langBadgeText.textContent = (I18N[currentLang] || I18N.ru).code;
    }

    if (langDropdown) {
      langDropdown.querySelectorAll('.lang-dropdown-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === currentLang);
      });
    }

    if (this.themeSelector) {
      const currentTheme = this.settings.theme || 'light';
      this.themeSelector.querySelectorAll('.segmented-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
      });
    }

    if (this.accentColorPicker) {
      this.accentColorPicker.querySelectorAll('.accent-swatch').forEach(s => {
        s.classList.toggle('active', s.dataset.accentId === this.settings.accentColorId);
      });
    }

    if (this.fontFamilySelect) {
      this.fontFamilySelect.value = this.settings.fontFamily || "'PT Serif', Georgia, serif";
    }

    if (this.fontSizeRange && this.fontSizeVal) {
      this.fontSizeRange.value = this.settings.fontSize || 14;
      this.fontSizeVal.textContent = `${this.settings.fontSize || 14} px`;
    }

    if (this.taskWeightRange && this.taskWeightVal) {
      const currentTaskWeight = Math.min(600, Math.max(400, this.settings.taskFontWeight || 500));
      this.taskWeightRange.value = currentTaskWeight;
      this.taskWeightVal.textContent = getRegularWeightLabel(currentTaskWeight);
    }

    if (this.priorityWeightRange && this.priorityWeightVal) {
      const currentPrioWeight = this.settings.priorityFontWeight || 900;
      this.priorityWeightRange.value = currentPrioWeight;
      this.priorityWeightVal.textContent = getPrioWeightLabel(currentPrioWeight);
    }

    this.updateFontPreview();

    if (this.toggleNotifications) this.toggleNotifications.checked = !!this.settings.notificationsEnabled;
    if (this.toggleMorningNotif) this.toggleMorningNotif.checked = this.settings.morningNotifEnabled !== false;
    if (this.morningNotifTime) this.morningNotifTime.value = this.settings.morningNotifTime || '09:00';
    if (this.toggleEveningNotif) this.toggleEveningNotif.checked = this.settings.eveningNotifEnabled !== false;
    if (this.eveningNotifTime) this.eveningNotifTime.value = this.settings.eveningNotifTime || '21:00';
    if (this.togglePetNotif) this.togglePetNotif.checked = this.settings.petNotifEnabled !== false;
    if (this.toggleHaptics) this.toggleHaptics.checked = this.settings.hapticsEnabled !== false;
    if (this.toggleSound) this.toggleSound.checked = this.settings.soundEnabled !== false;

    if (this.cycleTracker) {
      const cSet = this.cycleTracker.getSettings();
      if (this.toggleCycleTracker) {
        this.toggleCycleTracker.checked = !!cSet.enabled;
      }
      if (this.toggleCycleIrregular) this.toggleCycleIrregular.checked = !!cSet.isIrregular;
      if (this.cyclePeriodLengthRange) {
        this.cyclePeriodLengthRange.value = cSet.periodLength || 5;
        if (this.cyclePeriodLengthVal) this.cyclePeriodLengthVal.textContent = `${cSet.periodLength || 5} дн.`;
      }
      if (this.cycleDefaultLengthRange) {
        this.cycleDefaultLengthRange.value = cSet.defaultCycleLength || 28;
        if (this.cycleDefaultLengthVal) this.cycleDefaultLengthVal.textContent = `${cSet.defaultCycleLength || 28} дн.`;
      }
    }

    if (this.financeTracker) {
      const fSet = this.financeTracker.getSettings();
      if (this.toggleFinanceTracker) {
        this.toggleFinanceTracker.checked = !!fSet.enabled;
      }
      if (this.toggleFinanceStamp) this.toggleFinanceStamp.checked = fSet.showArchiveStamp !== false;
      if (this.financeCurrencySelect) {
        const optVal = `${fSet.currency}|${fSet.currencySymbol || '₴'}`;
        for (let opt of this.financeCurrencySelect.options) {
          if (opt.value === optVal || opt.value.startsWith(fSet.currency)) {
            this.financeCurrencySelect.value = opt.value;
            break;
          }
        }
      }
      if (this.financeInitialBalanceInput) {
        this.financeInitialBalanceInput.value = fSet.initialBalance || '';
      }
    }

    if (this.nutritionTracker) {
      const nSet = this.nutritionTracker.getSettings();
      if (this.toggleNutritionTracker) {
        this.toggleNutritionTracker.checked = !!nSet.enabled;
      }
      if (this.toggleNutritionStamp) {
        this.toggleNutritionStamp.checked = nSet.showArchiveStamp !== false;
      }
      if (this.nutritionSettingCalories) this.nutritionSettingCalories.value = nSet.calorieTarget || 2000;
      if (this.nutritionSettingProtein) this.nutritionSettingProtein.value = nSet.proteinTarget || 80;
      if (this.nutritionSettingFat) this.nutritionSettingFat.value = nSet.fatTarget || 70;
      if (this.nutritionSettingCarbs) this.nutritionSettingCarbs.value = nSet.carbTarget || 250;
    }

    const last = localStorage.getItem('plan4u_last_gdrive_export');
    if (this.cloudLastSyncText && last) {
      this.cloudLastSyncText.innerHTML = `Сохранено на Диск: <b>${last}</b>`;
    }
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
    this.collapseAllModuleCards();
    const langCircleBtn = document.getElementById('langCircleBadgeBtn');
    const langDropdown = document.getElementById('langDropdownMenu');
    const langWrapper = document.getElementById('langPickerWrapper');
    const langSection = document.getElementById('settingsLangSection') || document.querySelector('.settings-section-lang');
    if (langCircleBtn) langCircleBtn.classList.remove('open');
    if (langDropdown) langDropdown.classList.remove('show');
    if (langWrapper) langWrapper.classList.remove('open');
    if (langSection) langSection.classList.remove('dropdown-open');
    this.clearTextSelectionAndFocus();
    if (this.settingsModalBackdrop) {
      this.settingsModalBackdrop.classList.remove('open');
      this.settingsModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // Comprehensive notification system setup: Android high-importance channel, foreground listeners, in-app ticker, and alarms
  async initNotificationSystem() {
    // 1. Android Notification Channel (Importance: High/5 to ensure heads-up banner on phone)
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
      try {
        const { LocalNotifications } = window.Capacitor.Plugins;
        await LocalNotifications.createChannel({
          id: 'plan4u_reminders',
          name: 'Plan4U Напоминания и Задачи',
          description: 'Напоминания о привычках, утреннем плане, вечернем обзоре и питомце',
          importance: 5, // IMPORTANCE_HIGH: heads-up notification with sound & popup
          visibility: 1, // VISIBILITY_PUBLIC
          sound: 'beep.wav',
          vibration: true,
          lights: true,
          lightColor: '#D83A88'
        }).catch(err => console.warn('Channel creation warn:', err));

        // 2. Foreground Capacitor notification listener: when notification fires while user is in the app
        if (!this._hasRegisteredNotifListeners) {
          this._hasRegisteredNotifListeners = true;
          LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log('Local notification received while in foreground:', notification);
            this.showInAppNotificationBanner({
              icon: '🔔',
              title: notification.title || 'Plan4U',
              body: notification.body || '',
              actionText: this.settings?.lang === 'en' ? 'Open' : (this.settings?.lang === 'uk' ? 'Переглянути' : 'Открыть'),
              onAction: () => {
                if (this.tabPlanner) this.tabPlanner.click();
              }
            });
          });

          LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
            console.log('Local notification action clicked:', action);
            if (this.tabPlanner) this.tabPlanner.click();
          });
        }
      } catch (err) {
        console.warn('Init notification channel/listeners error:', err);
      }
    }

    // 3. Start real-time in-app foreground reminder ticker (checks habit times, daily plan times, etc. every 15s)
    this.startInAppReminderTicker();

    // 4. Schedule background alarms & habit reminders
    await this.scheduleSmartDailyNotifications();
    await this.scheduleAllHabitReminders();
  }

  // Real-time foreground ticker checking for due reminders while the user actively uses the app
  startInAppReminderTicker() {
    if (this._inAppTickerInterval) clearInterval(this._inAppTickerInterval);
    this._inAppTriggeredToday = this._inAppTriggeredToday || new Set();

    // Check every 15 seconds
    this._inAppTickerInterval = setInterval(() => {
      this.checkInAppRemindersDue();
    }, 15000);

    // Initial check
    setTimeout(() => this.checkInAppRemindersDue(), 2000);
  }

  // Check habits and daily routine events against current time (HH:MM)
  checkInAppRemindersDue() {
    if (!this.settings || !this.settings.notificationsEnabled) return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const currentHHMM = `${h}:${m}`;

    // Reset tracked triggers on day change
    if (this._lastTickerDate && this._lastTickerDate !== todayStr) {
      this._inAppTriggeredToday.clear();
    }
    this._lastTickerDate = todayStr;

    const isUk = this.settings.lang === 'uk';
    const isEn = this.settings.lang === 'en';

    // 1. Check Habit Reminders
    if (Array.isArray(this.habits)) {
      for (const habit of this.habits) {
        if (!habit.reminderEnabled || !habit.reminderTime) continue;
        if (habit.reminderTime === currentHHMM) {
          const triggerKey = `${todayStr}_habit_${habit.id}_${currentHHMM}`;
          if (!this._inAppTriggeredToday.has(triggerKey)) {
            this._inAppTriggeredToday.add(triggerKey);

            const title = isEn ? 'Habit Reminder ⏰' : (isUk ? 'Нагадування про звичку ⏰' : 'Напоминание о привычке ⏰');
            const body = isEn
              ? `Time for "${habit.title}"! Keep your streak burning 🔥`
              : (isUk
                ? `Час для «${habit.title}»! Збережіть вогник серії 🔥`
                : `Пора выполнить: «${habit.title}»! Не дай огоньку погаснуть 🔥`);

            this.showInAppNotificationBanner({
              icon: habit.icon || '🔥',
              title,
              body,
              actionText: isEn ? 'Check' : (isUk ? 'Виконати' : 'Отметить'),
              onAction: () => {
                const habitTabBtn = document.querySelector('[data-subtab="habits"]');
                if (habitTabBtn) habitTabBtn.click();
              }
            });
            return; // Trigger one at a time
          }
        }
      }
    }

    // 2. Check Morning Briefing
    if (this.settings.morningNotifEnabled !== false) {
      const morningTime = this.settings.morningNotifTime || '09:00';
      if (morningTime === currentHHMM) {
        const morningKey = `${todayStr}_morning_${morningTime}`;
        if (!this._inAppTriggeredToday.has(morningKey)) {
          this._inAppTriggeredToday.add(morningKey);
          const title = isEn ? 'Morning Plan ☀️' : (isUk ? 'Ранковий план ☀️' : 'Утренний план ☀️');
          const body = isEn
            ? 'Good morning! Check today’s notebook tasks and have a productive day!'
            : (isUk
              ? 'Доброго ранку! Перегляньте заплановані справи в блокноті Plan4U!'
              : 'Доброе утро! Проверьте список дел на сегодня в блокноте Plan4U!');

          this.showInAppNotificationBanner({
            icon: '☀️',
            title,
            body,
            actionText: isEn ? 'Open' : (isUk ? 'Відкрити' : 'Открыть'),
            onAction: () => {
              if (this.tabPlanner) this.tabPlanner.click();
            }
          });
          return;
        }
      }
    }

    // 3. Check Evening Review
    if (this.settings.eveningNotifEnabled !== false) {
      const eveningTime = this.settings.eveningNotifTime || '21:00';
      if (eveningTime === currentHHMM) {
        const eveningKey = `${todayStr}_evening_${eveningTime}`;
        if (!this._inAppTriggeredToday.has(eveningKey)) {
          this._inAppTriggeredToday.add(eveningKey);
          const title = isEn ? 'Evening Review 🌙' : (isUk ? 'Вечірній огляд 🌙' : 'Вечерний обзор 🌙');
          const body = isEn
            ? 'Evening wrap-up: check off completed tasks and keep your streak!'
            : (isUk
              ? 'Вечірній огляд: перевірте виконані справи та збережіть серію!'
              : 'Вечерний обзор: проверьте выполненные дела и сохраните серию!');

          this.showInAppNotificationBanner({
            icon: '🌙',
            title,
            body,
            actionText: isEn ? 'Review' : (isUk ? 'Переглянути' : 'Проверить'),
            onAction: () => {
              if (this.tabPlanner) this.tabPlanner.click();
            }
          });
          return;
        }
      }
    }

    // 4. Check Pet Care
    if (this.settings.petNotifEnabled !== false && currentHHMM === '15:00') {
      const petKey = `${todayStr}_pet_1500`;
      if (!this._inAppTriggeredToday.has(petKey)) {
        this._inAppTriggeredToday.add(petKey);
        const title = isEn ? 'Maine Coon Pet 🐾' : (isUk ? 'Турбота про котика 🐾' : 'Забота о питомце 🐾');
        const body = isEn
          ? 'Your Maine Coon misses you! Treat him for today’s achievements 🐟'
          : (isUk
            ? 'Мейн-кун скучив! Зайдіть погладити котика та пригостити ласощами 🐟'
            : 'Мейн-кун скучает! Зайдите погладить котика и угостить вкусняшкой 🐟');

        this.showInAppNotificationBanner({
          icon: '🐾',
          title,
          body,
          actionText: isEn ? 'Pet cat' : (isUk ? 'До котика' : 'К котику'),
          onAction: () => {
            const petBtn = document.getElementById('widgetPet') || document.querySelector('.pet-widget');
            if (petBtn) petBtn.click();
          }
        });
      }
    }
  }

  // Display rich interactive in-app heads-up notification banner
  showInAppNotificationBanner({ icon = '🔔', title = 'Plan4U', body = '', actionText = null, onAction = null }) {
    const banner = document.getElementById('inAppNotifBanner');
    if (!banner) return;

    const iconBox = document.getElementById('inAppNotifIconBox');
    const titleEl = document.getElementById('inAppNotifTitle');
    const descEl = document.getElementById('inAppNotifDesc');
    const actionBtn = document.getElementById('btnInAppNotifAction');
    const closeBtn = document.getElementById('btnInAppNotifClose');

    if (iconBox) iconBox.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = body;

    if (actionBtn) {
      if (actionText) {
        actionBtn.textContent = actionText;
        actionBtn.style.display = 'inline-flex';
        actionBtn.onclick = (e) => {
          e.stopPropagation();
          banner.classList.remove('show');
          if (typeof onAction === 'function') onAction();
        };
      } else {
        actionBtn.style.display = 'none';
      }
    }

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        banner.classList.remove('show');
      };
    }

    banner.onclick = () => {
      banner.classList.remove('show');
      if (typeof onAction === 'function') onAction();
    };

    // Haptic vibration & melodic notification chime
    triggerHaptic([35, 50, 35]);
    this.playNotificationChime();

    // Animate banner into view
    banner.classList.add('show');

    clearTimeout(this._inAppNotifTimer);
    this._inAppNotifTimer = setTimeout(() => {
      banner.classList.remove('show');
    }, 7000);
  }

  // Melodic notification chime via Web Audio API
  playNotificationChime() {
    if (!this.settings?.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.1); // A5
      gain2.gain.setValueAtTime(0.28, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.45);
    } catch (e) { }
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
            every: 'day',
            allowWhileIdle: true
          },
          channelId: 'plan4u_reminders',
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
            every: 'day',
            allowWhileIdle: true
          },
          channelId: 'plan4u_reminders',
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
            every: 'day',
            allowWhileIdle: true
          },
          channelId: 'plan4u_reminders',
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

  // Get stable unique notification ID for a habit
  getHabitNotifId(habitId) {
    if (!habitId) return 20001;
    let hash = 0;
    const str = String(habitId);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 900000) + 20000;
  }

  // Schedule local notification for a specific habit
  async scheduleHabitNotification(habit) {
    if (!habit || !habit.id) return;
    const notifId = this.getHabitNotifId(habit.id);

    // Cancel existing notification first
    await this.cancelHabitNotification(habit.id);

    if (!habit.reminderEnabled || !habit.reminderTime) return;

    const [hStr, mStr] = String(habit.reminderTime).split(':');
    const hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);
    if (isNaN(hour) || isNaN(minute)) return;

    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
      try {
        const { LocalNotifications } = window.Capacitor.Plugins;
        const isEn = this.settings?.lang === 'en';
        const isUk = this.settings?.lang === 'uk';
        const title = isEn ? 'Plan4U — Habit Reminder ⏰' : (isUk ? 'Plan4U — Нагадування про звичку ⏰' : 'Plan4U — Напоминание о привычке ⏰');
        const body = isEn
          ? `Time to complete: "${habit.title}"! Keep your streak burning 🔥`
          : (isUk
            ? `Час виконати: «${habit.title}»! Збережіть серію 🔥`
            : `Пора выполнить: «${habit.title}»! Не дай огоньку погаснуть 🔥`);

        await LocalNotifications.schedule({
          notifications: [{
            id: notifId,
            title,
            body,
            schedule: {
              on: { hour, minute },
              every: 'day',
              allowWhileIdle: true
            },
            channelId: 'plan4u_reminders',
            sound: 'beep.wav',
            smallIcon: 'ic_launcher'
          }]
        });
      } catch (err) {
        console.warn('Error scheduling habit notification:', err);
      }
    }
  }

  // Cancel scheduled notification for a habit
  async cancelHabitNotification(habitId) {
    if (!habitId) return;
    const notifId = this.getHabitNotifId(habitId);
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
      try {
        await window.Capacitor.Plugins.LocalNotifications.cancel({
          notifications: [{ id: notifId }]
        }).catch(() => { });
      } catch (err) {
        console.warn('Error cancelling habit notification:', err);
      }
    }
  }

  // Schedule notifications for all habits that have reminders enabled
  async scheduleAllHabitReminders() {
    if (!this.habits || !Array.isArray(this.habits)) return;
    for (const habit of this.habits) {
      if (habit.reminderEnabled && habit.reminderTime) {
        await this.scheduleHabitNotification(habit);
      }
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

  // Send Test Notification: fires immediate in-app heads-up banner AND schedules native tray notification
  async sendTestNotification() {
    const isEn = this.settings.lang === 'en';
    const isUk = this.settings.lang === 'uk';
    const testTitle = 'Plan4U — Блокнот Задач';
    const testBody = isEn
      ? 'Reminder: you have unfinished tasks in Plan4U! Keep your streak burning 🔥'
      : (isUk
        ? 'Нагадування: у вас є незавершені справи в Plan4U! Збережіть серію 🔥'
        : 'Напоминание: у вас есть незавершенные дела в Plan4U! Не дай огоньку погаснуть 🔥');

    // 1. Immediate in-app heads-up banner (so user sees notification inside the app right now!)
    this.showInAppNotificationBanner({
      icon: '🔔',
      title: testTitle,
      body: testBody,
      actionText: isEn ? 'Open' : (isUk ? 'Відкрити' : 'Открыть'),
      onAction: () => {
        if (this.tabPlanner) this.tabPlanner.click();
      }
    });

    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
        const { LocalNotifications } = window.Capacitor.Plugins;
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 100000),
              title: testTitle,
              body: testBody,
              schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
              channelId: 'plan4u_reminders',
              sound: 'beep.wav',
              smallIcon: 'ic_launcher'
            }
          ]
        });
        this.showToast(isEn ? 'Test notification sent!' : (isUk ? 'Тестове сповіщення надіслано!' : 'Тестовое уведомление отправлено!'), '🔔');
        return;
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(testTitle, {
          body: testBody,
          icon: 'icon.svg'
        });
        this.showToast(isEn ? 'Test notification sent!' : (isUk ? 'Тестове сповіщення надіслано!' : 'Тестовое push-уведомление отправлено!'), '🔔');
        return;
      }
    } catch (e) {
      console.warn('Send notification error:', e);
    }
    this.showToast(isEn ? 'Please allow notification permission' : (isUk ? 'Будь ласка, дозвольте доступ до сповіщень' : 'Разрешите доступ к уведомлениям'), '🔔');
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
      appVersion: '0.3.13',
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
      habits: this.habits || [],
      cycleData: this.cycleTracker ? this.cycleTracker.data : (JSON.parse(localStorage.getItem('plan4u_cycle_data') || 'null')),
      financeData: this.financeTracker ? this.financeTracker.exportData() : (JSON.parse(localStorage.getItem('plan4u_finance_data') || 'null')),
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

    // 11b. Habits
    if (Array.isArray(data.habits)) {
      this.habits = data.habits;
      this.saveHabits();
    }

    // 11c. Cycle Tracker (Female calendar data & settings)
    if (data.cycleData && typeof data.cycleData === 'object') {
      try {
        localStorage.setItem('plan4u_cycle_data', JSON.stringify(data.cycleData));
        if (this.cycleTracker && typeof this.cycleTracker.loadData === 'function') {
          this.cycleTracker.data = this.cycleTracker.loadData();
          this.renderCycleModalContent?.();
          this.renderCalendar?.();
          this.updateCycleWidget?.();
        }
      } catch (e) {
        console.warn('Could not restore cycle tracker data:', e);
      }
    }

    // 11d. Finance Tracker (Income, expenses, categories, settings)
    if (data.financeData && typeof data.financeData === 'object') {
      try {
        if (this.financeTracker && typeof this.financeTracker.importData === 'function') {
          this.financeTracker.importData(data.financeData);
          this.updateFinanceWidget?.();
          this.updateFinanceArchiveStamp?.();
          this.renderFinanceModalContent?.();
        } else {
          localStorage.setItem('plan4u_finance_data', JSON.stringify(data.financeData));
        }
      } catch (e) {
        console.warn('Could not restore finance tracker data:', e);
      }
    }

    // 12. Apply visual state & update UI components
    this.currentTab = this.tabs.length > 0 ? this.tabs[0].id : 'todo';
    this.rolloverPastUncompletedTasks();
    if (this.dailyTasks && this.dailyTasks[targetDate]) {
      this.tasks.todo = this.dailyTasks[targetDate];
    }
    this.applySettings();
    this.updateDateWidget();
    this.updateTrophyWidgetAura();
    this.renderTabs();
    this.render();
    this.renderHabits();
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
      appVersion: '0.3.13',
      timestamp: new Date().toISOString(),
      tabs: this.tabs,
      sections: this.tabSections || {},
      tabSections: this.tabSections || {},
      tasks: this.tasks,
      dailyTasks: this.dailyTasks,
      dayHistory: this.dayHistory,
      habits: this.habits || [],
      achievements: this.achievementsData,
      history: this.history,
      settings: this.settings,
      streak: this.streakData,
      stickers: this.stickers || {},
      cycleData: this.cycleTracker ? this.cycleTracker.data : (JSON.parse(localStorage.getItem('plan4u_cycle_data') || 'null')),
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
    this._calendarModalOpenedAt = Date.now();
    this.calendarModalBackdrop.classList.add('open');
    this.calendarModalBackdrop.setAttribute('aria-hidden', 'false');

    this.tempSelectedDate = this.selectedDate || this.getTodayDateString();
    const [y, m, d] = this.tempSelectedDate.split('-').map(Number);
    this.displayedCalendarMonth = new Date(y, m - 1, 1);
    this.renderCalendar();
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
    this.updateCycleWidget();
    this.updateFinanceWidget();
    this.updateFinanceArchiveStamp();
    this.updateNutritionWidget?.();
    this.updateNutritionArchiveStamp?.();
    this.updateJoyUI();
    this.renderTabs();
    this.syncWithNativeWidget?.();
  }

  // Calculate habit completion status for an archived/current date in the calendar
  getHabitsDayStatus(dateStr) {
    const allHabits = (this.habits && Array.isArray(this.habits)) ? this.habits : [];
    if (allHabits.length === 0) {
      return { hasHabits: false, isCompleted: false, completedCount: 0, scheduledCount: 0 };
    }

    const todayStr = this.getTodayDateString();
    if (dateStr > todayStr) {
      return { hasHabits: false, isCompleted: false, completedCount: 0, scheduledCount: 0 };
    }

    // Determine earliest habit tracking date to avoid showing badges on ancient months
    let earliestDateStr = null;
    allHabits.forEach(h => {
      if (h.created) {
        const cd = new Date(h.created);
        if (!isNaN(cd.getTime())) {
          const cds = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}-${String(cd.getDate()).padStart(2, '0')}`;
          if (!earliestDateStr || cds < earliestDateStr) earliestDateStr = cds;
        }
      }
      if (h.history && typeof h.history === 'object') {
        Object.keys(h.history).forEach(ds => {
          if (/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
            if (!earliestDateStr || ds < earliestDateStr) earliestDateStr = ds;
          }
        });
      }
    });

    if (earliestDateStr && dateStr < earliestDateStr) {
      return { hasHabits: false, isCompleted: false, completedCount: 0, scheduledCount: 0 };
    }

    const [yVal, mVal, dVal] = dateStr.split('-').map(Number);
    const dayDateObj = new Date(yVal, mVal - 1, dVal);
    const dayDow = dayDateObj.getDay(); // 0 is Sun, 1 is Mon...

    let scheduledCount = 0;
    let completedCount = 0;

    allHabits.forEach(h => {
      // Determine when this habit was created / first tracked
      let hStartStr = null;
      if (h.created) {
        const cd = new Date(h.created);
        if (!isNaN(cd.getTime())) {
          hStartStr = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, '0')}-${String(cd.getDate()).padStart(2, '0')}`;
        }
      }
      if (h.history && typeof h.history === 'object') {
        const hDates = Object.keys(h.history).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
        if (hDates.length > 0 && (!hStartStr || hDates[0] < hStartStr)) {
          hStartStr = hDates[0];
        }
      }

      const hEntry = h.history && h.history[dateStr];
      if (hStartStr && dateStr < hStartStr && !hEntry) {
        return; // Skip: this habit did not exist on this date
      }

      let frac = 0;
      let isDone = false;
      if (h.type === 'numeric') {
        const cur = typeof hEntry === 'object' ? (hEntry.current || 0) : (hEntry ? (h.target?.value || 1) : 0);
        const tgt = (h.target && h.target.value) ? h.target.value : 1;
        frac = Math.min(Math.max(cur / tgt, 0), 1.0);
        isDone = frac >= 1.0;
      } else {
        isDone = typeof hEntry === 'object' ? !!hEntry.completed : !!hEntry;
        frac = isDone ? 1.0 : 0.0;
      }

      if (h.schedule?.type === 'weekdays') {
        const dows = h.schedule.daysOfWeek || [1, 2, 3, 4, 5];
        const isScheduled = dows.includes(dayDow);
        if (isScheduled) {
          scheduledCount++;
          if (isDone) completedCount++;
        } else if (isDone) {
          scheduledCount++;
          completedCount++;
        }
      } else if (h.schedule?.type === 'periodic') {
        if (isDone) {
          scheduledCount++;
          completedCount++;
        }
        // Floating periodic habit does not count as a missed mandatory habit on a day it was not performed
      } else {
        // Daily
        scheduledCount++;
        if (isDone) completedCount++;
      }
    });

    if (scheduledCount === 0) {
      return { hasHabits: false, isCompleted: false, completedCount, scheduledCount };
    }

    const isCompleted = completedCount >= scheduledCount;
    return { hasHabits: true, isCompleted, completedCount, scheduledCount };
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

    const isNutritionEnabled = !!(this.nutritionTracker && typeof this.nutritionTracker.isEnabled === 'function' && this.nutritionTracker.isEnabled());

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.textContent = pDay;

      const prevDate = new Date(currentYear, currentMonth - 1, pDay);
      const pDateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      const pStatus = this.getHabitsDayStatus(pDateStr);
      if (pStatus.hasHabits && pStatus.completedCount > 0) {
        const badge = document.createElement('span');
        badge.className = `calendar-habit-badge ${pStatus.isCompleted ? 'completed' : 'missed'}`;
        if (pStatus.isCompleted) {
          badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        }
        cell.appendChild(badge);
      }

      // Nutrition avocado on past archive days (only if food was actually logged)
      if (isNutritionEnabled) {
        const pStats = this.nutritionTracker.getStatsForDate(pDateStr);
        if (pStats && (pStats.entryCount > 0 || pStats.totalCalories > 0)) {
          const avo = document.createElement('span');
          avo.className = 'calendar-nutrition-avocado';
          avo.textContent = '🥑';
          avo.title = `Питание: ${pStats.totalCalories} ккал`;
          cell.appendChild(avo);
        }
      }

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

      // Joy gratitude note indicator
      if (this.joyTracker && this.joyTracker.hasEntry(dateStr)) {
        cell.classList.add('has-joy');
      }

      // Habit status badge (top-left circle: checkmark if completed, ring if pending today or partial past)
      const habitStatus = this.getHabitsDayStatus(dateStr);
      const showHabitBadge = isToday
        ? habitStatus.hasHabits
        : (habitStatus.hasHabits && habitStatus.completedCount > 0);

      if (showHabitBadge) {
        const hBadge = document.createElement('span');
        hBadge.className = `calendar-habit-badge ${habitStatus.isCompleted ? 'completed' : 'missed'}`;
        if (habitStatus.isCompleted) {
          hBadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          hBadge.title = window.Plan4UI18n
            ? Plan4UI18n.t('habit_cal_completed', { done: habitStatus.completedCount, total: habitStatus.scheduledCount }, lang)
            : `Привычки: ${habitStatus.completedCount} из ${habitStatus.scheduledCount} выполнено ✓`;
        } else {
          hBadge.title = window.Plan4UI18n
            ? Plan4UI18n.t('habit_cal_missed', { done: habitStatus.completedCount, total: habitStatus.scheduledCount }, lang)
            : `Привычки: ${habitStatus.completedCount} из ${habitStatus.scheduledCount} выполнено`;
        }
        cell.appendChild(hBadge);
      }

      // Nutrition avocado on days with logged food
      if (isNutritionEnabled) {
        const nStats = this.nutritionTracker.getStatsForDate(dateStr);
        if (nStats && (nStats.entryCount > 0 || nStats.totalCalories > 0)) {
          const avo = document.createElement('span');
          avo.className = 'calendar-nutrition-avocado';
          avo.textContent = '🥑';
          avo.title = `Питание: ${nStats.totalCalories} ккал`;
          cell.appendChild(avo);
        }
      }

      // Cycle status highlight (period, irregular window, ovulation)
      if (this.cycleTracker && this.cycleTracker.isEnabled()) {
        const cStatus = this.cycleTracker.getDayClassification(dateStr);
        if (cStatus.isPeriod) {
          cell.classList.add('is-period');
          const pDot = document.createElement('span');
          pDot.className = 'cycle-period-dot';
          pDot.title = 'Менструация';
          cell.appendChild(pDot);
        } else if (cStatus.isPredictedWindow) {
          cell.classList.add('is-cycle-window');
          cell.title = 'Окно ожидаемого начала цикла';
        }
        if (cStatus.isOvulation) {
          cell.classList.add('is-ovulation');
          const ovDot = document.createElement('span');
          ovDot.className = 'cycle-ovulation-dot';
          ovDot.title = 'Овуляция';
          cell.appendChild(ovDot);
        }
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

      const selectedHabitStatus = this.getHabitsDayStatus(this.tempSelectedDate);
      let habitInfoText = '';
      const isPastSelected = this.tempSelectedDate < todayStr;
      const shouldShowHabitInfo = isPastSelected
        ? (selectedHabitStatus.hasHabits && selectedHabitStatus.completedCount > 0)
        : selectedHabitStatus.hasHabits;

      if (shouldShowHabitInfo) {
        const habitsWord = window.Plan4UI18n ? Plan4UI18n.t('habit_cal_info_label', {}, lang) : 'Привычки';
        const habitDoneMark = selectedHabitStatus.isCompleted ? '✓' : '';
        habitInfoText = ` • ${habitsWord}: ${selectedHabitStatus.completedCount}/${selectedHabitStatus.scheduledCount} ${habitDoneMark}`;
      }

      const joyEntry = this.joyTracker ? this.joyTracker.getEntry(this.tempSelectedDate) : null;
      let joyInfoText = '';
      if (joyEntry && joyEntry.text) {
        const joyMoods = this.joyTracker.getMoods();
        const mObj = joyMoods.find(m => m.id === joyEntry.mood) || joyMoods[0];
        const joyWord = lang === 'en' ? 'Joy note' : (lang === 'uk' ? 'Запис радості' : 'Запись радости');
        joyInfoText = ` • ☀️ ${mObj.icon} ${joyWord}`;
      }

      let nutritionInfoText = '';
      if (isNutritionEnabled) {
        const nStats = this.nutritionTracker.getStatsForDate(this.tempSelectedDate);
        if (nStats && (nStats.entryCount > 0 || nStats.totalCalories > 0)) {
          nutritionInfoText = ` • 🥑 ${nStats.totalCalories} ккал`;
        }
      }

      if (this.calendarInfoStats) {
        if (selectedDayTasks.length > 0) {
          const tasksWord = lang === 'en' ? 'Tasks' : (lang === 'uk' ? 'Завдань на день' : 'Задач на день');
          const doneWord = lang === 'en' ? 'Completed' : (lang === 'uk' ? 'Виконано' : 'Выполнено');
          const histWord = lang === 'en' ? 'In history' : (lang === 'uk' ? 'В історії' : 'В истории');
          this.calendarInfoStats.textContent = `${tasksWord}: ${selectedDayTasks.length} • ${doneWord}: ${completedToday}${historyList.length > 0 ? ` • ${histWord}: ${historyList.length}` : ''}${habitInfoText}${joyInfoText}${nutritionInfoText}`;
        } else if (historyList.length > 0) {
          const histText = lang === 'en' ? `In history for this day: ${historyList.length} completed tasks` : (lang === 'uk' ? `В історії цього дня: ${historyList.length} виконаних справ` : `В истории этого дня: ${historyList.length} выполненных дел`);
          this.calendarInfoStats.textContent = `${histText}${habitInfoText}${joyInfoText}${nutritionInfoText}`;
        } else if (habitInfoText) {
          const habitsWord = window.Plan4UI18n ? Plan4UI18n.t('habit_cal_info_label', {}, lang) : 'Привычки';
          const habitsOnlyText = `${habitsWord}: ${selectedHabitStatus.completedCount}/${selectedHabitStatus.scheduledCount} ${selectedHabitStatus.isCompleted ? '✓' : ''}`;
          this.calendarInfoStats.textContent = `${habitsOnlyText}${joyInfoText}${nutritionInfoText}`;
        } else if (joyInfoText) {
          const joyWord = lang === 'en' ? 'Joy note saved on paper sticker' : (lang === 'uk' ? 'Запис радості збережено на стікері' : 'Запись радости сохранена на стикере');
          this.calendarInfoStats.textContent = `☀️ ${joyWord}!${nutritionInfoText}`;
        } else if (nutritionInfoText) {
          this.calendarInfoStats.textContent = nutritionInfoText.replace(/^ • /, '');
        } else {
          const emptyText = isTempToday
            ? (lang === 'en' ? 'Click "Open this day" to plan tasks' : (lang === 'uk' ? 'Натисніть «Відкрити цей день», щоб планувати справи' : 'Нажмите «Открыть этот день», чтобы планировать задачи'))
            : (lang === 'en' ? 'No tasks yet for this day. Open it to make a plan!' : (lang === 'uk' ? 'На цей день поки немає записів. Відкрийте його для планування!' : 'На этот день пока нет записей. Откройте его, чтобы составить план!'));
          this.calendarInfoStats.textContent = emptyText;
        }
      }
    }

    // Update Calendar Cycle Strip
    if (this.calendarCycleStrip) {
      if (this.cycleTracker && this.cycleTracker.isEnabled()) {
        const cDayStatus = this.cycleTracker.getStatusForDate(this.tempSelectedDate);
        this.calendarCycleStrip.style.display = 'flex';
        if (cDayStatus.hasData) {
          const phaseAdvice = this.cycleTracker.getPhaseAdvice(cDayStatus.phase, lang, cDayStatus.dayInCycle, cDayStatus);
          if (this.calendarCyclePill) {
            this.calendarCyclePill.textContent = `🍒 ${this.t('cycle_cal_day_badge', { day: cDayStatus.dayInCycle })}`;
          }
          if (this.calendarCycleDesc) {
            let desc = phaseAdvice.badge || phaseAdvice.title;
            if (cDayStatus.inWindow) {
              desc += ` • ${this.t('cycle_cal_window_badge')}`;
            }
            this.calendarCycleDesc.textContent = desc;
          }
        } else {
          if (this.calendarCyclePill) this.calendarCyclePill.textContent = '🍒 Цикл';
          if (this.calendarCycleDesc) this.calendarCycleDesc.textContent = 'Нажмите 🍒, чтобы начать отслеживание';
        }
      } else {
        this.calendarCycleStrip.style.display = 'none';
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
    let buyHistoryCount = 0;
    if (this.dayHistory && typeof this.dayHistory === 'object') {
      const recordedIds = new Set();
      Object.values(this.dayHistory).forEach(dayList => {
        if (Array.isArray(dayList)) {
          dayList.forEach(item => {
            if (item && (item.tabId === 'buy' || item.tabId === 'What to buy' || item.tabId === 'Що купити' || item.tabId === 'Что купить')) {
              recordedIds.add(String(item.id || item.text));
            }
          });
        }
      });
      buyHistoryCount = recordedIds.size;
    }
    const buyCompletedCount = Math.max(buyTasks.filter(t => t.completed).length, buyHistoryCount);

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

  // Update pulsating aura on Streak Widget if there are unclaimed/unviewed achievements
  updateTrophyWidgetAura() {
    if (!this.achievementsData) return;
    const hasUnclaimed = Object.keys(this.achievementsData.unlocked || {}).some(id => !this.achievementsData.viewed?.[id]);
    
    // Transfer pulsating golden aura and notification to widgetStreak (Серия)
    if (this.widgetStreak) {
      this.widgetStreak.classList.toggle('has-unclaimed', hasUnclaimed);
      if (hasUnclaimed) {
        this.widgetStreak.title = '🏆 У вас есть новые полученные достижения! Нажмите, чтобы открыть';
      } else {
        this.updateStreakWidget();
      }
    }
  }

  // Open Achievements Modal (Supports direct filter parameter, e.g. 'streaks')
  openAchievementsModal(defaultFilter = null) {
    this.collapseSubstrateDrawer(true);
    this.dismissActiveKeyboard();
    if (!this.achievementsModalBackdrop) return;

    if (defaultFilter && this.achievementsFilterTabs) {
      const targetBtn = this.achievementsFilterTabs.querySelector(`[data-filter="${defaultFilter}"]`);
      if (targetBtn) {
        this.achievementsFilterTabs.querySelectorAll('.achievement-tab-btn').forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        this.activeAchievementFilter = defaultFilter;
      }
    }

    this._achievementsModalOpenedAt = Date.now();
    this.achievementsModalBackdrop.classList.add('open');
    this.achievementsModalBackdrop.setAttribute('aria-hidden', 'false');

    this.renderAchievements();
    this.updateTrophyWidgetAura();
  }

  // Close Achievements Modal
  closeAchievementsModal() {
    if (this.achievementsModalBackdrop) {
      this.achievementsModalBackdrop.classList.remove('open');
      this.achievementsModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // Modules Hub Dropdown Controls
  toggleModulesHubDropdown() {
    if (!this.modulesHubDropdown) return;
    if (this.modulesHubDropdown.classList.contains('open')) {
      this.closeModulesHubDropdown();
    } else {
      this.openModulesHubDropdown();
    }
  }

  // Adaptive height calculation for modules hub dropdown based on active connected modules
  updateModulesHubHeight() {
    if (!this.modulesHubDropdown) return 52;
    const moduleCircles = Array.from(this.modulesHubDropdown.querySelectorAll('.widget-circle'));
    const visibleModules = moduleCircles.filter(btn => {
      if (!btn) return false;
      return btn.style.display !== 'none' && !btn.hasAttribute('hidden') && !btn.classList.contains('hidden');
    });

    const count = visibleModules.length;
    if (count === 0) {
      this.modulesHubDropdown.classList.add('is-empty');
      this.modulesHubDropdown.style.setProperty('--modules-hub-height', '52px');
      return 52;
    }

    this.modulesHubDropdown.classList.remove('is-empty');

    // Sunken plaque sizing:
    // Plaque starts 3px above trigger circle (top: -4.8px)
    // Padding-top: 62px (3px top clearance + 52px trigger circle + 7px gap to first module)
    // Each module circle: 52px height
    // Gap between module circles: 7px
    // Bottom clearance: 3px
    // Borders: 3.6px
    const targetHeight = Math.round(62 + (count * 52) + ((count - 1) * 7) + 3 + 3.6);
    this.modulesHubDropdown.style.setProperty('--modules-hub-height', `${targetHeight}px`);
    return targetHeight;
  }

  hasActiveModules() {
    const cycleEnabled = !!(this.cycleTracker && typeof this.cycleTracker.isEnabled === 'function' && this.cycleTracker.isEnabled());
    const financeEnabled = !!(this.financeTracker && typeof this.financeTracker.isEnabled === 'function' && this.financeTracker.isEnabled());
    const joyEnabled = !!(this.joyTracker && typeof this.joyTracker.isEnabled === 'function' && this.joyTracker.isEnabled());
    const nutritionEnabled = !!(this.nutritionTracker && typeof this.nutritionTracker.isEnabled === 'function' && this.nutritionTracker.isEnabled());
    return cycleEnabled || financeEnabled || joyEnabled || nutritionEnabled;
  }

  isModulesHubDisabled() {
    return !this.hasActiveModules();
  }

  updateModulesHubState() {
    if (!this.widgetModulesHub) return;
    const hasModules = this.hasActiveModules();

    const lang = this.settings?.lang || 'ru';
    const isEn = lang === 'en';
    const isUk = lang === 'uk';

    if (!hasModules) {
      this.widgetModulesHub.classList.add('is-disabled');
      this.widgetModulesHub.setAttribute('aria-disabled', 'true');
      const disabledTitle = this.t('tooltip_modules_disabled') || (isEn
        ? 'Modules (no active modules)'
        : (isUk ? 'Модулі (немає активних модулів)' : 'Модули (нет активных модулей)'));
      this.widgetModulesHub.title = disabledTitle;
      this.widgetModulesHub.setAttribute('aria-label', disabledTitle);
      if (this.modulesHubDropdown && (this.modulesHubDropdown.classList.contains('open') || this.modulesHubDropdown.classList.contains('is-open'))) {
        this.closeModulesHubDropdown();
      }
    } else {
      this.widgetModulesHub.classList.remove('is-disabled');
      this.widgetModulesHub.setAttribute('aria-disabled', 'false');
      const activeTitle = this.t('tooltip_modules') || (isEn ? 'Modules' : (isUk ? 'Модулі' : 'Модули'));
      this.widgetModulesHub.title = activeTitle;
      this.widgetModulesHub.setAttribute('aria-label', activeTitle);
    }
  }

  openModulesHubDropdown() {
    if (!this.modulesHubDropdown || this.isModulesHubDisabled()) return;
    this.collapseSubstrateDrawer(true);
    this.dismissActiveKeyboard();
    this._modulesHubOpenedAt = Date.now();
    clearTimeout(this._modulesHubCloseTimer);

    // Refresh badges and module states first, then compute adaptive height
    this.updateModulesHubBadges();
    this.updateModulesHubHeight();

    if (this.widgetModulesHubWrapper) {
      this.widgetModulesHubWrapper.classList.add('is-open');
    }
    this.modulesHubDropdown.classList.remove('is-closing');
    this.modulesHubDropdown.classList.add('open', 'is-open');
    this.modulesHubDropdown.setAttribute('aria-hidden', 'false');
    if (this.widgetModulesHub) {
      this.widgetModulesHub.classList.add('active');
      this.widgetModulesHub.setAttribute('aria-expanded', 'true');
    }
  }

  closeModulesHubDropdown() {
    if (this.modulesHubDropdown && (this.modulesHubDropdown.classList.contains('open') || this.modulesHubDropdown.classList.contains('is-open'))) {
      this.modulesHubDropdown.classList.remove('open', 'is-open');
      this.modulesHubDropdown.classList.add('is-closing');
      this.modulesHubDropdown.setAttribute('aria-hidden', 'true');
      clearTimeout(this._modulesHubCloseTimer);
      this._modulesHubCloseTimer = setTimeout(() => {
        if (this.modulesHubDropdown) {
          this.modulesHubDropdown.classList.remove('is-closing');
        }
        if (this.widgetModulesHubWrapper) {
          this.widgetModulesHubWrapper.classList.remove('is-open');
        }
      }, 400);
    }
    if (this.widgetModulesHub) {
      this.widgetModulesHub.classList.remove('active');
      this.widgetModulesHub.setAttribute('aria-expanded', 'false');
    }
  }

  // Backwards-compatible aliases
  openModulesHub() {
    this.openModulesHubDropdown();
  }

  closeModulesHub() {
    this.closeModulesHubDropdown();
  }

  // Update indicators/badges for Modules Hub
  updateModulesHubBadges() {
    // 1. Refresh finance widget ring & data
    this.updateFinanceWidget?.();

    // 2. Refresh cycle widget day
    this.updateCycleWidget?.();

    // 2.5. Refresh joy widget
    this.updateJoyWidget?.();

    // 2.6. Refresh nutrition widget
    this.updateNutritionWidget?.();

    // 3. Unclaimed achievements indicator on trigger button
    const hasUnclaimed = this.hasUnclaimedAchievements ? this.hasUnclaimedAchievements() : false;
    if (this.widgetModulesHubBadge) {
      this.widgetModulesHubBadge.style.display = (hasUnclaimed && this.hasActiveModules()) ? 'block' : 'none';
    }

    // 4. Update adaptive height for modules hub dropdown
    this.updateModulesHubHeight?.();

    // 5. Update active/disabled trigger state
    this.updateModulesHubState();
  }

  // Close all open modals simultaneously (for ESC key or reset)
  closeAllModals() {
    this.closeModulesHubDropdown?.();
    this.closeModulesHub?.();
    this.closeFinanceEntryModal?.();
    this.closeFinanceCategoryModal?.();
    this.closeFinanceDatePicker?.();
    this.closeFinanceModal?.();
    this.closeCycleModal?.();
    this.closeJoyModal?.();
    this.closeJoyJarModal?.();
    this.closeJoyStickerPicker?.();
    this.closeTaskModal();
    this.closeEditTabModal();
    this.closeNewTabModal();
    this.closeSettingsModal();
    this.closeCalendarModal();
    this.closeAchievementsModal?.();
    this.closeTrophyModal?.();
    this.closeStickerShopModal?.();
    this.closeDayHistoryModal?.();
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

    const isCompleting = !task.completed;
    task.completed = isCompleting;

    // Update in dailyTasks directly ONLY for todo tab
    const targetDate = this.selectedDate || todayStr;
    if (this.currentTab === 'todo' && this.dailyTasks && this.dailyTasks[targetDate]) {
      const dailyTask = this.dailyTasks[targetDate].find(t => String(t.id) === String(taskId));
      if (dailyTask) {
        dailyTask.completed = task.completed;
      }
    }

    if (isCompleting) {
      this.playCompletionSound();
      this.checkAllTasksCompletedTriumph();
      if (this.petSystem && !task.rewarded) {
        this.petSystem.onTaskCompleted(task);
        task.rewarded = true;
      }
      if ((task.isMaineQuest || task.isSecretQuest) && window.MaineQuests && typeof window.MaineQuests.onQuestCompleted === 'function') {
        window.MaineQuests.onQuestCompleted(task, this.petSystem, this);
      }
      if (this.currentTab === 'watch') {
        task.completedDate = new Date().toLocaleDateString('ru-RU');
      }
      if (this.currentTab === 'buy') {
        task.completedDate = todayStr;
        task.completedAt = Date.now();
      }

      // Record in day history
      const historyDate = (this.currentTab === 'todo') ? targetDate : todayStr;
      if (!this.dayHistory[historyDate]) {
        this.dayHistory[historyDate] = [];
      }
      const activeTab = this.tabs.find(t => t.id === this.currentTab);
      const tabTitle = activeTab ? activeTab.title : this.currentTab;

      const existingIdx = this.dayHistory[historyDate].findIndex(h => String(h.id) === String(task.id));
      const taskSection = task.section || getTaskSection(task) || 'personal';
      if (existingIdx === -1) {
        this.dayHistory[historyDate].push({
          id: task.id,
          tabId: this.currentTab,
          tabTitle: tabTitle,
          text: task.text,
          section: taskSection,
          period: task.period || '',
          place: task.place || taskSection,
          watchType: task.watchType || '',
          isMaineQuest: !!(task.isMaineQuest || task.isSecretQuest),
          questId: task.questId || null,
          completedAt: new Date().toISOString()
        });
      } else {
        if (!this.dayHistory[historyDate][existingIdx].section) {
          this.dayHistory[historyDate][existingIdx].section = taskSection;
        }
      }
    } else {
      if (this.currentTab === 'watch') {
        delete task.completedDate;
      }
      if (this.currentTab === 'buy') {
        delete task.completedDate;
        delete task.completedAt;
      }
      // Remove from history if unchecked
      const historyDate = (this.currentTab === 'todo') ? targetDate : todayStr;
      if (this.dayHistory[historyDate]) {
        this.dayHistory[historyDate] = this.dayHistory[historyDate].filter(h => String(h.id) !== String(task.id));
      }
    }

    // Synchronously flush changes to ensure instant persistence
    this.saveTasks();
    this.saveDayHistory();
    if (this.currentTab === 'todo') {
      this.saveDailyTasks();
    }

    if (isCompleting) {
      // PHASE 1: Animate checkbox and hand-drawn strike-through IN PLACE without moving the task
      const currentWrapper = this.contentContainer ? this.contentContainer.querySelector(`.task-row-wrapper[data-id="${taskId}"]`) : null;
      const currentRow = currentWrapper ? currentWrapper.querySelector('.task-row') : null;
      const titleSpan = currentRow ? currentRow.querySelector('.task-title-text') : null;

      let delayBeforeDescent = 480; // ms

      if (currentRow && titleSpan) {
        currentRow.classList.add('completed');
        if (currentWrapper) currentWrapper.classList.add('no-swipe');
        const checkbox = currentRow.querySelector('.task-checkbox');
        if (checkbox) checkbox.setAttribute('aria-checked', 'true');

        // Play authentic hand-drawn strike-through animation right here in place
        this.renderHandDrawnStrikeForElement(titleSpan, taskId, true);

        // Calculate accurate strike duration based on line count (280ms duration + 130ms per extra line)
        // Add 140ms natural pause so user clearly sees the crossed-out task before it descends
        const strikePaths = titleSpan.querySelectorAll('.hand-strike-path');
        const lineCount = Math.max(1, strikePaths.length);
        delayBeforeDescent = Math.round((lineCount - 1) * 130 + 320 + 140);
      }

      // Clear any previous completion timer for this task
      if (!this._pendingCompletionTimers) this._pendingCompletionTimers = {};
      if (this._pendingCompletionTimers[taskId]) {
        clearTimeout(this._pendingCompletionTimers[taskId]);
      }

      // PHASE 2: After strike-through completes, smoothly glide task down to the bottom of active tasks
      this._pendingCompletionTimers[taskId] = setTimeout(() => {
        delete this._pendingCompletionTimers[taskId];

        if (!this.contentContainer) return;
        const currentTabTasks = this.tasks[this.currentTab] || [];
        const stillInCurrentTab = currentTabTasks.some(t => String(t.id) === String(taskId));
        if (!stillInCurrentTab) return;

        // 1. Capture previous visual positions of all task items
        const oldPositions = new Map();
        const prevWrappers = this.contentContainer.querySelectorAll('.task-row-wrapper[data-id]');
        prevWrappers.forEach(el => {
          const id = el.dataset.id;
          if (id) {
            oldPositions.set(id, el.getBoundingClientRect().top);
          }
        });

        // 2. Re-render UI with tasks in new sorted order (completed task moves to bottom of section)
        this.render();
        this.renderTabs();
        this.applyHandDrawnStrikes();

        // 3. Ultra-smooth FLIP animation: hardware-accelerated glide downwards
        if (oldPositions.size > 0) {
          const newWrappers = this.contentContainer.querySelectorAll('.task-row-wrapper[data-id]');
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

          if (moves.length > 0) {
            // Apply initial inverted transforms
            moves.forEach(({ el, id, deltaY }) => {
              el.style.transform = `translate3d(0, ${deltaY}px, 0)`;
              el.style.transition = 'none';
              el.style.willChange = 'transform';
              el.style.zIndex = (String(id) === String(taskId)) ? '25' : '20';
              if (String(id) === String(taskId)) {
                el.classList.add('just-completed-gliding');
              }
            });

            // Force reflow so starting transform is committed to GPU
            void this.contentContainer.offsetHeight;

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                moves.forEach(({ el }) => {
                  // Silky smooth, gentle deceleration curve (0.65s)
                  el.style.transition = 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)';
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
                  setTimeout(cleanup, 750);
                });
              });
            });
          }
        }

        // Defer heavy visual/computational operations after descent starts
        setTimeout(() => {
          this.checkAchievements(true);
          this.updateWorkloadWidget();
        }, 150);
      }, delayBeforeDescent);

    } else {
      // Uncompleting: instant restoration with smooth upward glide
      if (this._pendingCompletionTimers && this._pendingCompletionTimers[taskId]) {
        clearTimeout(this._pendingCompletionTimers[taskId]);
        delete this._pendingCompletionTimers[taskId];
      }

      const oldPositions = new Map();
      const prevWrappers = this.contentContainer ? this.contentContainer.querySelectorAll('.task-row-wrapper[data-id]') : [];
      prevWrappers.forEach(el => {
        const id = el.dataset.id;
        if (id) {
          oldPositions.set(id, el.getBoundingClientRect().top);
        }
      });

      this.render();
      this.renderTabs();
      this.applyHandDrawnStrikes();

      if (oldPositions.size > 0 && this.contentContainer) {
        const newWrappers = this.contentContainer.querySelectorAll('.task-row-wrapper[data-id]');
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

        if (moves.length > 0) {
          moves.forEach(({ el, id, deltaY }) => {
            el.style.transform = `translate3d(0, ${deltaY}px, 0)`;
            el.style.transition = 'none';
            el.style.willChange = 'transform';
            el.style.zIndex = (String(id) === String(taskId)) ? '25' : '20';
          });

          void this.contentContainer.offsetHeight;

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              moves.forEach(({ el }) => {
                el.style.transition = 'transform 0.50s cubic-bezier(0.25, 1, 0.5, 1)';
                el.style.transform = 'translate3d(0, 0, 0)';

                const cleanup = () => {
                  el.style.transform = '';
                  el.style.transition = '';
                  el.style.willChange = '';
                  el.style.zIndex = '';
                  el.removeEventListener('transitionend', cleanup);
                };
                el.addEventListener('transitionend', cleanup, { once: true });
                setTimeout(cleanup, 600);
              });
            });
          });
        }
      }

      this.updateWorkloadWidget();
    }
  }

  // Delete Task
  deleteTask(taskId, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const todayStr = this.getTodayDateString();
    if (this.currentTab === 'todo' && this.selectedDate < todayStr) {
      return;
    }
    const currentTabTasks = this.tasks[this.currentTab] || [];
    const targetTask = currentTabTasks.find(t => String(t.id) === String(taskId));
    if (targetTask && (targetTask.isMaineQuest || targetTask.isSecretQuest)) {
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
  openTaskModal(defaultSection = null) {
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
    if (!this.taskModalBackdrop) return;
    this._taskModalOpenedAt = Date.now();
    this.taskModalBackdrop.classList.add('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'false');

    this.editingTaskId = null;
    this.tempPhotoData = null;
    this._activeSectionForNewTask = defaultSection || null;
    this.renderDynamicForm(this.currentTab);

    const sectionSelect = this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskSectionSelect') : null;
    if (sectionSelect && defaultSection) {
      sectionSelect.value = defaultSection;
    }

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Новая запись';
    const submitBtn = document.getElementById('modalSubmitBtn');
    if (submitBtn) submitBtn.textContent = 'Сохранить';
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
    if (!task || task.isMaineQuest || task.isSecretQuest) return;
    if (!this.taskModalBackdrop) return;

    this._taskModalOpenedAt = Date.now();
    this.taskModalBackdrop.classList.add('open');
    this.taskModalBackdrop.setAttribute('aria-hidden', 'false');

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

    // Populate section
    const sectionSelect = this.dynamicFormFields.querySelector('#taskSectionSelect');
    if (sectionSelect) {
      sectionSelect.value = task.section || getTaskSection(task) || 'personal';
    }
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
      const todoSections = this.getTabSections('todo');
      const sectionOptions = todoSections.map(s => {
        const title = (s.key && this.t(s.key)) ? this.t(s.key) : `${s.icon ? s.icon + ' ' : ''}${s.name}`;
        return `<option value="${s.id}">${this.escapeHtml(title)}</option>`;
      }).join('');

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
            <label for="taskSectionSelect">📁 ${this.settings.lang === 'en' ? 'Notebook section' : (this.settings.lang === 'uk' ? 'Розділ блокнота' : 'Раздел блокнота')}</label>
            <div style="margin-top: 5px;">
              <select id="taskSectionSelect" class="section-select-field">
                ${sectionOptions}
              </select>
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
      const tabSections = this.getTabSections(tabId);
      let sectionBlockHtml = '';
      if (tabSections && tabSections.length > 0) {
        const sectionOptions = tabSections.map(s => {
          const title = (s.key && this.t(s.key)) ? this.t(s.key) : `${s.icon ? s.icon + ' ' : ''}${s.name}`;
          return `<option value="${s.id}">${this.escapeHtml(title)}</option>`;
        }).join('');
        sectionBlockHtml = `
          <div class="form-section-card">
            <div class="form-group" style="margin-bottom: 0;">
              <label for="taskSectionSelect">📁 ${this.settings.lang === 'en' ? 'Notebook section' : (this.settings.lang === 'uk' ? 'Розділ блокнота' : 'Раздел блокнота')}</label>
              <div style="margin-top: 5px;">
                <select id="taskSectionSelect" class="section-select-field">
                  ${sectionOptions}
                </select>
              </div>
            </div>
          </div>
        `;
      }

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

        ${sectionBlockHtml}

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
      chip.addEventListener('pointerdown', (e) => e.preventDefault());
      chip.addEventListener('click', (e) => {
        e.preventDefault();
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
      opt.addEventListener('pointerdown', (e) => e.preventDefault());
      opt.addEventListener('click', (e) => {
        e.preventDefault();
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
      btnTriggerPhoto.addEventListener('pointerdown', (e) => e.preventDefault());
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
        const secSelect = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskSectionSelect') : null) || document.getElementById('taskSectionSelect');
        if (secSelect && secSelect.value) {
          task.section = secSelect.value;
        }
        if (targetTab === 'todo') {
          const timeInput = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskTimeInput') : null) || document.getElementById('taskTimeInput');
          task.time = timeInput ? (timeInput.value.trim() || null) : null;
          if (task.time) {
            this.scheduleTaskNotification(task);
          }
          const targetDate = this.selectedDate || todayStr;
          if (this.dailyTasks && this.dailyTasks[targetDate]) {
            const dTask = this.dailyTasks[targetDate].find(t => String(t.id) === String(task.id));
            if (dTask) {
              dTask.text = task.text;
              dTask.section = task.section;
              dTask.priority = task.priority;
              dTask.color = task.color;
              dTask.notes = task.notes;
              dTask.time = task.time;
            }
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

    const secSelect = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskSectionSelect') : null) || document.getElementById('taskSectionSelect');
    if (secSelect && secSelect.value) {
      newTask.section = secSelect.value;
    } else if (this._activeSectionForNewTask) {
      newTask.section = this._activeSectionForNewTask;
    } else if (targetTab === 'todo') {
      newTask.section = 'personal';
    } else {
      const curTabSecs = this.getTabSections(targetTab);
      newTask.section = (curTabSecs && curTabSecs[0]) ? curTabSecs[0].id : 'main';
    }

    if (targetTab === 'todo') {
      const timeInput = (this.dynamicFormFields ? this.dynamicFormFields.querySelector('#taskTimeInput') : null) || document.getElementById('taskTimeInput');
      newTask.time = timeInput ? (timeInput.value.trim() || null) : null;
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

    let pastDaysCount = 0;
    let ageIntensity = 0;
    if (isPastDay) {
      const [ty, tm, td] = todayStr.split('-').map(Number);
      const [sy, sm, sd] = this.selectedDate.split('-').map(Number);
      const todayDate = new Date(ty, tm - 1, td);
      const selDate = new Date(sy, sm - 1, sd);
      const diffMs = todayDate.getTime() - selDate.getTime();
      pastDaysCount = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      // Progressive curve: starts delicate at 1 day, reaches deep vintage by ~130-150 days
      ageIntensity = Math.min(1, Math.max(0.06, Math.pow(pastDaysCount / 140, 0.55)));
    }

    const appFrame = document.getElementById('appFrame') || document.body;
    if (appFrame) {
      appFrame.classList.toggle('is-past-day-mode', isPastDay);
    }
    document.body.classList.toggle('is-past-day-mode', isPastDay);

    if (sheetEl) {
      sheetEl.classList.toggle('is-aged-paper', isPastDay);
      if (isPastDay) {
        // Interpolate colors smoothly
        // Light mode aged background: from #ffffff to #ddbd88
        const rLight = Math.round(255 - ageIntensity * (255 - 221));
        const gLight = Math.round(255 - ageIntensity * (255 - 189));
        const bLight = Math.round(255 - ageIntensity * (255 - 136));
        const agedPaperBgLight = `rgb(${rLight}, ${gLight}, ${bLight})`;

        // Dark mode aged background: from #131620 to #2b221a
        const rDark = Math.round(19 + ageIntensity * (43 - 19));
        const gDark = Math.round(22 + ageIntensity * (34 - 22));
        const bDark = Math.round(32 - ageIntensity * (32 - 26));
        const agedPaperBgDark = `rgb(${rDark}, ${gDark}, ${bDark})`;

        // Margin line fading: from #f4a5c0 (fresh pink) to #a65e6d (faded antique cinnabar rose)
        const rMarg = Math.round(244 - ageIntensity * (244 - 166));
        const gMarg = Math.round(165 - ageIntensity * (165 - 94));
        const bMarg = Math.round(192 - ageIntensity * (192 - 109));
        const agedMargin = `rgb(${rMarg}, ${gMarg}, ${bMarg})`;

        // Notebook ruling line: from rgba(150, 130, 145, 0.32) to rgba(125, 90, 50, 0.38)
        const agedLine = `rgba(${Math.round(150 - ageIntensity * 25)}, ${Math.round(130 - ageIntensity * 40)}, ${Math.round(145 - ageIntensity * 95)}, ${(0.32 + ageIntensity * 0.08).toFixed(2)})`;
        const agedGrid = `rgba(${Math.round(150 - ageIntensity * 25)}, ${Math.round(130 - ageIntensity * 40)}, ${Math.round(145 - ageIntensity * 95)}, ${(0.25 + ageIntensity * 0.08).toFixed(2)})`;
        const agedDot = `rgba(${Math.round(120 - ageIntensity * 20)}, ${Math.round(105 - ageIntensity * 35)}, ${Math.round(125 - ageIntensity * 85)}, ${(0.42 + ageIntensity * 0.1).toFixed(2)})`;

        // Vintage ink color: from #1f2937 to #38271a
        const agedInk = `rgb(${Math.round(31 + ageIntensity * (56 - 31))}, ${Math.round(41 - ageIntensity * (41 - 39))}, ${Math.round(55 - ageIntensity * (55 - 26))})`;

        // Inset vignette shadow color
        const vignetteAlpha = (0.15 + ageIntensity * 0.32).toFixed(2);
        const agedVignette = `rgba(110, 68, 20, ${vignetteAlpha})`;

        sheetEl.style.setProperty('--archive-age-intensity', ageIntensity.toFixed(3));
        sheetEl.style.setProperty('--archive-past-days', pastDaysCount);
        sheetEl.style.setProperty('--aged-paper-bg', agedPaperBgLight);
        sheetEl.style.setProperty('--aged-paper-bg-dark', agedPaperBgDark);
        sheetEl.style.setProperty('--accent-margin-line', agedMargin);
        sheetEl.style.setProperty('--notebook-line-color', agedLine);
        sheetEl.style.setProperty('--notebook-grid-color', agedGrid);
        sheetEl.style.setProperty('--notebook-dot-color', agedDot);
        sheetEl.style.setProperty('--aged-ink-color', agedInk);
        sheetEl.style.setProperty('--aged-vignette-color', agedVignette);

        if (appFrame) {
          appFrame.style.setProperty('--archive-age-intensity', ageIntensity.toFixed(3));
          appFrame.style.setProperty('--archive-past-days', pastDaysCount);
        }
      } else {
        sheetEl.style.removeProperty('--archive-age-intensity');
        sheetEl.style.removeProperty('--archive-past-days');
        sheetEl.style.removeProperty('--aged-paper-bg');
        sheetEl.style.removeProperty('--aged-paper-bg-dark');
        sheetEl.style.removeProperty('--accent-margin-line');
        sheetEl.style.removeProperty('--notebook-line-color');
        sheetEl.style.removeProperty('--notebook-grid-color');
        sheetEl.style.removeProperty('--notebook-dot-color');
        sheetEl.style.removeProperty('--aged-ink-color');
        sheetEl.style.removeProperty('--aged-vignette-color');

        if (appFrame) {
          appFrame.style.removeProperty('--archive-age-intensity');
          appFrame.style.removeProperty('--archive-past-days');
        }
      }
    }

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

    // 3.1 Manage Joy FAB button visibility (hidden on past archive days or if Joy is disabled)
    this.updateJoyBottomFab?.();

    // 4. Manage Floating Return to Today & Day Navigation Bar (visible in past and future days)
    const returnWrapper = document.getElementById('pastDayReturnWrapper');
    if (returnWrapper) {
      returnWrapper.style.setProperty('display', isNotToday ? 'flex' : 'none', 'important');
      returnWrapper.classList.toggle('is-past-day', isPastDay);
      returnWrapper.classList.toggle('is-future-day', isFutureDay);

      const returnText = document.getElementById('pastDayReturnText');
      if (returnText) {
        const lang = this.settings?.lang || 'ru';
        returnText.textContent = lang === 'en' ? 'Back to Today' : (lang === 'uk' ? 'Повернутися до Сьогодні' : 'Вернуться в Сегодня');
      }

      const returnLabel = document.getElementById('pastDayReturnLabel');
      if (returnLabel) {
        if (isPastDay) {
          returnLabel.style.display = 'inline-flex';
          returnLabel.textContent = this.formatDaysAgoLabel(pastDaysCount);
        } else if (isFutureDay) {
          const [ty, tm, td] = todayStr.split('-').map(Number);
          const [sy, sm, sd] = this.selectedDate.split('-').map(Number);
          const diffDays = Math.max(1, Math.round((new Date(sy, sm - 1, sd) - new Date(ty, tm - 1, td)) / 86400000));
          returnLabel.style.display = 'inline-flex';
          returnLabel.textContent = this.formatFutureDaysLabel(diffDays);
        } else {
          returnLabel.style.display = 'none';
        }
      }

      const prevBtn = document.getElementById('pastDayNavPrev');
      const nextBtn = document.getElementById('pastDayNavNext');
      const lang = this.settings?.lang || 'ru';
      const prevTitle = lang === 'en' ? 'Day back' : (lang === 'uk' ? 'День тому' : 'День назад');
      const nextTitle = lang === 'en' ? 'Day forward' : (lang === 'uk' ? 'День вперед' : 'День вперёд');
      if (prevBtn) {
        prevBtn.title = prevTitle;
        prevBtn.setAttribute('aria-label', prevTitle);
      }
      if (nextBtn) {
        nextBtn.title = nextTitle;
        nextBtn.setAttribute('aria-label', nextTitle);
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
        const isEn = this.settings.lang === 'en';
        const isUk = this.settings.lang === 'uk';
        const totalPastTasks = currentTasks.filter(t => !t.isEmpty && t.text && t.text.trim().length > 0).length;
        if (totalPastTasks === 0) {
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

    // Render joy of the day paper note on sheet
    this.renderJoyOnSheet?.();

    this.updateWorkloadWidget();

    // Attach interactive archive banner day flipping events
    this.attachArchiveBannerEvents();

    // Apply authentic hand-drawn strikes to all completed tasks
    this.applyHandDrawnStrikes();
  }

  // Format past day relative time string for archive header and badges
  formatPastDayRelative(pastDaysCount) {
    const lang = this.settings?.lang || 'ru';
    const isEn = lang === 'en';
    const isUk = lang === 'uk';

    if (pastDaysCount <= 1) {
      return window.Plan4UI18n
        ? Plan4UI18n.t('archive_yesterday', {}, lang)
        : (isEn ? 'Yesterday (1 day ago)' : (isUk ? 'Вчора (1 день тому)' : 'Вчера (1 день назад)'));
    }

    if (pastDaysCount < 30) {
      return window.Plan4UI18n
        ? Plan4UI18n.t('archive_days_ago', { count: pastDaysCount }, lang)
        : (isEn ? `${pastDaysCount} days ago` : (isUk ? `${pastDaysCount} дн. тому` : `${pastDaysCount} дн. назад`));
    }

    const months = Math.max(1, Math.round(pastDaysCount / 30));
    return window.Plan4UI18n
      ? Plan4UI18n.t('archive_months_ago', { count: months }, lang)
      : (isEn ? `${months} mo. ago` : (isUk ? `${months} міс. тому` : `${months} мес. назад`));
  }

  // Navigate to a specific date safely, preserving current tab tasks
  navigateToDate(targetDateStr) {
    if (!targetDateStr || targetDateStr === this.selectedDate) return;
    const todayStr = this.getTodayDateString();

    // Save current tasks if we were on today or future before switching
    if (this.selectedDate >= todayStr && this.tasks && this.tasks.todo && this.dailyTasks) {
      this.dailyTasks[this.selectedDate] = this.tasks.todo;
      this.saveDailyTasks();
    }

    this.selectedDate = targetDateStr;
    this.tempSelectedDate = targetDateStr;
    this.syncSelectedDate();

    const formatted = this.formatDateTitle(this.selectedDate);
    if (this.selectedDate === todayStr) {
      const lang = this.settings?.lang || 'ru';
      const isEn = lang === 'en';
      const isUk = lang === 'uk';
      const msg = isEn ? 'Back to Today! ✨' : (isUk ? 'Сьогодні 📍' : 'Сегодня 📍');
      this.showToast(msg, '📅');
    } else {
      this.showToast(formatted, '📜');
    }
  }

  // Navigate by day offset (-1 day back / +1 day forward)
  navigateDayOffset(offset) {
    if (!offset) return;
    const todayStr = this.getTodayDateString();
    const curDateStr = this.selectedDate || todayStr;
    const [y, m, d] = curDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + offset);

    const nextDateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    if (offset > 0 && nextDateStr > todayStr) {
      this.navigateToDate(todayStr);
      return;
    }

    this.navigateToDate(nextDateStr);
  }

  // Format concise days ago label for the floating return bar
  formatDaysAgoLabel(pastDaysCount) {
    const lang = this.settings?.lang || 'ru';
    const isEn = lang === 'en';
    const isUk = lang === 'uk';

    if (pastDaysCount <= 1) {
      if (isEn) return 'Yesterday • 1 day ago';
      if (isUk) return 'Вчора • 1 день тому';
      return 'Вчера • 1 день назад';
    }

    if (isEn) {
      if (pastDaysCount < 30) {
        return `${pastDaysCount} days ago`;
      }
      const months = Math.max(1, Math.round(pastDaysCount / 30));
      return `${pastDaysCount} days ago (${months} mo.)`;
    }

    if (isUk) {
      const mod10 = pastDaysCount % 10;
      const mod100 = pastDaysCount % 100;
      let word = 'днів';
      if (mod10 === 1 && mod100 !== 11) {
        word = 'день';
      } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        word = 'дні';
      }
      if (pastDaysCount < 30) {
        return `${pastDaysCount} ${word} тому`;
      }
      const months = Math.max(1, Math.round(pastDaysCount / 30));
      return `${pastDaysCount} ${word} тому (${months} міс.)`;
    }

    // Russian default
    const mod10 = pastDaysCount % 10;
    const mod100 = pastDaysCount % 100;
    let word = 'дней';
    if (mod10 === 1 && mod100 !== 11) {
      word = 'день';
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      word = 'дня';
    }
    if (pastDaysCount < 30) {
      return `${pastDaysCount} ${word} назад`;
    }
    const months = Math.max(1, Math.round(pastDaysCount / 30));
    return `${pastDaysCount} ${word} назад (${months} мес.)`;
  }

  // Format concise future days label for the floating return bar
  formatFutureDaysLabel(futureDaysCount) {
    const lang = this.settings?.lang || 'ru';
    const isEn = lang === 'en';
    const isUk = lang === 'uk';

    if (futureDaysCount <= 1) {
      if (isEn) return 'Tomorrow • in 1 day';
      if (isUk) return 'Завтра • через 1 день';
      return 'Завтра • через 1 день';
    }

    if (isEn) {
      return `In ${futureDaysCount} days`;
    }

    if (isUk) {
      const mod10 = futureDaysCount % 10;
      const mod100 = futureDaysCount % 100;
      let word = 'днів';
      if (mod10 === 1 && mod100 !== 11) {
        word = 'день';
      } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        word = 'дні';
      }
      return `Через ${futureDaysCount} ${word}`;
    }

    // Russian default
    const mod10 = futureDaysCount % 10;
    const mod100 = futureDaysCount % 100;
    let word = 'дней';
    if (mod10 === 1 && mod100 !== 11) {
      word = 'день';
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      word = 'дня';
    }
    return `Через ${futureDaysCount} ${word}`;
  }

  // Legacy archive banner events hook (kept safe as no-op)
  attachArchiveBannerEvents() { }

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
    const isMaineQuest = !!(task.isMaineQuest || task.isSecretQuest);
    let cleanTitle = cleanTaskText(task.text);
    if (isMaineQuest && task.questId && window.MaineQuests && typeof window.MaineQuests.getQuestText === 'function') {
      const localized = window.MaineQuests.getQuestText(task.questId, this.settings?.lang);
      if (localized) cleanTitle = localized;
    }
    if (isMaineQuest) {
      cleanTitle = cleanTitle.replace(/(\s*🐾)+\s*$/gu, '').trim();
    }

    return `
      <div class="task-row-wrapper ${isImportant ? 'is-important-wrapper' : ''} ${isMaineQuest ? 'is-maine-quest-wrapper' : ''} ${isPastArchived ? 'is-past-archived-wrapper no-swipe' : ''} ${isBuyCompleted ? 'is-single-delete' : ''}" data-id="${task.id}">
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
        <!-- Right side actions on swipe left (Up, Down, Defer for Maine quests; all 5 for normal tasks) -->
        <div class="task-swipe-actions-right ${isMaineQuest ? 'swipe-maine-quest' : ''}">
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
          ${!isMaineQuest ? `
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
          </button>` : ''}
        </div>`) : ''}

        ${!isPastArchived ? `
        <!-- Left side complete indicator on swipe right -->
        <div class="task-swipe-check-bg">
          <span class="swipe-check-icon">✓</span>
          <span class="swipe-check-text">${swipeCheckLabel}</span>
        </div>` : ''}

        <!-- Sliding foreground task row -->
        <div class="task-row ${task.completed ? 'completed' : ''} ${isImportant ? 'task-row-important' : ''} ${isMaineQuest ? 'is-maine-quest' : ''} ${isPastArchived ? 'is-past-archived' : ''}" data-id="${task.id}" data-color="${taskColor}">
          <div class="task-checkbox-container">
            <div class="task-checkbox ${isPastArchived ? 'checkbox-archived' : ''}" role="checkbox" aria-checked="${task.completed}" title="${isPastArchived ? 'В архиве истории' : ''}"></div>
          </div>
          <div class="task-text ${priorityClass}" data-color="${taskColor}">
            <span class="task-title-text ${isImportant ? 'task-text-bold' : ''}">${this.escapeHtml(cleanTitle)}${isMaineQuest ? `<img src="assets/cat_step.png" class="maine-quest-cat-step" alt="🐾" />` : ''}</span>
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

  // Generate authentic hand-drawn Bezier curve path for notebook strikethrough (6 organic styles)
  getHandDrawnPath(x0, y0, w, h, seed) {
    const ym = y0 + h * 0.52;
    switch (seed % 6) {
      case 0:
        // 1. Bold Organic Arc: gentle sag in the middle, sweeping flick up at the end
        return `M ${(x0 - 4).toFixed(1)},${(ym + 0.5).toFixed(1)} C ${(x0 + w * 0.30).toFixed(1)},${(ym + 3.5).toFixed(1)} ${(x0 + w * 0.70).toFixed(1)},${(ym + 3.0).toFixed(1)} ${(x0 + w + 6).toFixed(1)},${(ym - 2.8).toFixed(1)}`;
      case 1:
        // 2. Dynamic Upward Slash: starts lower, sweeps diagonally up with confident flick
        return `M ${(x0 - 4).toFixed(1)},${(ym + 3.2).toFixed(1)} C ${(x0 + w * 0.32).toFixed(1)},${(ym + 1.0).toFixed(1)} ${(x0 + w * 0.68).toFixed(1)},${(ym - 1.8).toFixed(1)} ${(x0 + w + 7).toFixed(1)},${(ym - 4.5).toFixed(1)}`;
      case 2:
        // 3. Expressive S-Wave: climbs over initial letters, dips through the center, flicks at the end
        return `M ${(x0 - 3).toFixed(1)},${(ym - 2.6).toFixed(1)} C ${(x0 + w * 0.28).toFixed(1)},${(ym + 3.4).toFixed(1)} ${(x0 + w * 0.72).toFixed(1)},${(ym - 2.6).toFixed(1)} ${(x0 + w + 5).toFixed(1)},${(ym + 1.2).toFixed(1)}`;
      case 3:
        // 4. High Arch: arches up over vowel ascenders, then lands firmly at baseline
        return `M ${(x0 - 4).toFixed(1)},${(ym + 1.6).toFixed(1)} C ${(x0 + w * 0.35).toFixed(1)},${(ym - 3.6).toFixed(1)} ${(x0 + w * 0.70).toFixed(1)},${(ym - 1.5).toFixed(1)} ${(x0 + w + 6).toFixed(1)},${(ym + 2.2).toFixed(1)}`;
      case 4:
        // 5. Swift Careless Flick: quick horizontal stroke with a tiny downward hand drop at tail
        return `M ${(x0 - 4).toFixed(1)},${(ym - 1.0).toFixed(1)} C ${(x0 + w * 0.40).toFixed(1)},${(ym + 2.4).toFixed(1)} ${(x0 + w * 0.80).toFixed(1)},${(ym - 0.6).toFixed(1)} ${(x0 + w + 6).toFixed(1)},${(ym + 2.4).toFixed(1)}`;
      case 5:
      default:
        // 6. Subtle Sinuous Ripple: gentle micro double-wave mimicking natural hand movement
        return `M ${(x0 - 3).toFixed(1)},${(ym + 2.0).toFixed(1)} C ${(x0 + w * 0.24).toFixed(1)},${(ym - 2.5).toFixed(1)} ${(x0 + w * 0.62).toFixed(1)},${(ym + 2.2).toFixed(1)} ${(x0 + w + 6).toFixed(1)},${(ym - 1.8).toFixed(1)}`;
    }
  }

  // Secondary stroke for rare intentional double-crossing (~12-14% of tasks / 1-2 per day)
  getDoubleStrikePath(x0, y0, w, h, seed) {
    const ym = y0 + h * 0.52;
    if (seed % 2 === 0) {
      return `M ${(x0 - 2).toFixed(1)},${(ym - 3.0).toFixed(1)} C ${(x0 + w * 0.35).toFixed(1)},${(ym - 1.0).toFixed(1)} ${(x0 + w * 0.72).toFixed(1)},${(ym + 2.4).toFixed(1)} ${(x0 + w + 4).toFixed(1)},${(ym + 1.5).toFixed(1)}`;
    } else {
      return `M ${(x0 - 3).toFixed(1)},${(ym + 2.8).toFixed(1)} C ${(x0 + w * 0.38).toFixed(1)},${(ym - 2.2).toFixed(1)} ${(x0 + w * 0.65).toFixed(1)},${(ym + 0.6).toFixed(1)} ${(x0 + w + 5).toFixed(1)},${(ym - 3.4).toFixed(1)}`;
    }
  }

  // Render hand-drawn pen strike SVG overlay on task title element
  renderHandDrawnStrikeForElement(titleSpan, taskId, isAnimated = false) {
    if (!titleSpan) return;
    const titleRect = titleSpan.getBoundingClientRect();
    if (titleRect.width < 2 || titleRect.height < 2) return;

    titleSpan.classList.add('has-hand-strike');
    const row = titleSpan.closest('.task-row');
    if (row) row.classList.add('has-hand-strike');

    // Remove any previous SVG before measuring so SVG rect does not pollute getClientRects
    let svg = titleSpan.querySelector(':scope > .hand-strike-svg');
    if (svg) svg.remove();

    // Use DOM Range to measure text-only content
    let rawRects = [];
    try {
      const range = document.createRange();
      const textNodes = [];
      const walker = document.createTreeWalker(titleSpan, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent && node.textContent.trim().length > 0) {
          textNodes.push(node);
        }
      }
      if (textNodes.length > 0) {
        range.setStart(textNodes[0], 0);
        const lastNode = textNodes[textNodes.length - 1];
        range.setEnd(lastNode, lastNode.textContent.length);
        rawRects = Array.from(range.getClientRects()).filter(r => r.width > 3 && r.height > 3);
      }
    } catch (e) {
      rawRects = [];
    }
    if (!rawRects.length) {
      rawRects = Array.from(titleSpan.getClientRects()).filter(r => r.width > 3 && r.height > 3);
    }
    if (!rawRects.length) rawRects = [titleRect];

    // Cluster rects belonging to the same visual line (to prevent multiple strokes on 1 line)
    const lineRects = [];
    rawRects.sort((a, b) => a.top - b.top || a.left - b.left);
    rawRects.forEach(rect => {
      const lineThreshold = Math.max(8, (rect.height || 18) * 0.55);
      const existing = lineRects.find(m => Math.abs(m.top - rect.top) < lineThreshold);
      if (existing) {
        const left = Math.min(existing.left, rect.left);
        const right = Math.max(existing.right, rect.right);
        const top = Math.min(existing.top, rect.top);
        const bottom = Math.max(existing.bottom, rect.bottom);
        existing.left = left;
        existing.right = right;
        existing.top = top;
        existing.bottom = bottom;
        existing.width = right - left;
        existing.height = bottom - top;
      } else {
        lineRects.push({
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        });
      }
    });

    let hash = 0;
    const str = String(taskId || '0');
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const baseSeed = Math.abs(hash);

    // Rare intentional double strike: ~14% chance (roughly 1 in 7 tasks / 1-2 per day)
    const isDoubleStrike = (baseSeed % 7 === 0);

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'hand-strike-svg');
    svg.setAttribute('aria-hidden', 'true');
    titleSpan.appendChild(svg);

    const svgWidth = Math.ceil(titleRect.width + 10);
    const svgHeight = Math.ceil(titleRect.height);
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.style.width = `${svgWidth}px`;
    svg.style.height = `${svgHeight}px`;
    svg.style.left = '-4px';
    svg.style.top = '0px';

    lineRects.forEach((lineRect, i) => {
      const lx0 = Math.max(0, lineRect.left - titleRect.left + 4);
      const lw = Math.max(8, lineRect.width);
      const ly0 = lineRect.top - titleRect.top;
      const lh = lineRect.height || 20;
      const lineSeed = (baseSeed + i * 2) % 6;

      // Primary expressive hand-drawn stroke
      const d = this.getHandDrawnPath(lx0, ly0, lw, lh, lineSeed);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'hand-strike-path');
      path.setAttribute('d', d);
      svg.appendChild(path);

      if (isAnimated) {
        const pathLen = Math.ceil(path.getTotalLength() || (lw + 14));
        path.style.strokeDasharray = `${pathLen} ${pathLen}`;
        path.style.strokeDashoffset = `${pathLen}`;
        path.style.transition = 'none';

        const delayMs = i * 130;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            path.style.transition = `stroke-dashoffset 0.28s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms`;
            path.style.strokeDashoffset = '0';
          });
        });
      } else {
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
      }

      // Rare double strike (only on ~14% of tasks, 1-2 per day)
      if (isDoubleStrike) {
        const d2 = this.getDoubleStrikePath(lx0, ly0, lw, lh, lineSeed);
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path2.setAttribute('class', 'hand-strike-path double-stroke');
        path2.setAttribute('d', d2);
        svg.appendChild(path2);

        if (isAnimated) {
          const pathLen2 = Math.ceil(path2.getTotalLength() || (lw + 14));
          path2.style.strokeDasharray = `${pathLen2} ${pathLen2}`;
          path2.style.strokeDashoffset = `${pathLen2}`;
          path2.style.transition = 'none';

          const delayMs2 = i * 130 + 80;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              path2.style.transition = `stroke-dashoffset 0.24s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs2}ms`;
              path2.style.strokeDashoffset = '0';
            });
          });
        } else {
          path2.style.strokeDasharray = 'none';
          path2.style.strokeDashoffset = '0';
        }
      }
    });
  }

  // Apply hand-drawn pen strikes to all completed tasks in the current view
  applyHandDrawnStrikes(animatedTaskId = null) {
    if (!this.contentContainer) return;
    const completedRows = this.contentContainer.querySelectorAll('.task-row.completed');
    if (!completedRows.length) return;

    requestAnimationFrame(() => {
      completedRows.forEach(row => {
        const titleSpan = row.querySelector('.task-title-text');
        if (!titleSpan) return;
        const taskId = row.dataset.id;
        const isAnimated = (animatedTaskId !== null && String(taskId) === String(animatedTaskId));
        this.renderHandDrawnStrikeForElement(titleSpan, taskId, isAnimated);
      });
    });
  }

  // Attach touch and drag swipe gestures for each task row
  attachSwipeEvents() {
    const wrappers = this.contentContainer.querySelectorAll('.task-row-wrapper:not(.no-swipe)');
    let activeOpenWrapper = null;

    const snapOpen = (w) => {
      if (!w) return;
      const isSingle = w.classList.contains('is-single-delete');
      const isMaine = w.classList.contains('is-maine-quest-wrapper');
      const maxLeft = isSingle ? -58 : (isMaine ? -112 : -180);
      const r = w.querySelector('.task-row');
      const a = w.querySelector('.task-swipe-actions-right');
      if (r) {
        r.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)';
        r.style.transform = `translate3d(${maxLeft}px, 0, 0)`;
      }
      if (a) {
        a.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)';
        a.style.transform = 'translate3d(0px, 0, 0)';
      }
      setTimeout(() => {
        if (w.classList.contains('open') && !w.classList.contains('swiping')) {
          if (r) {
            r.style.transition = '';
            r.style.transform = '';
          }
          if (a) {
            a.style.transition = '';
            a.style.transform = '';
          }
        }
      }, 220);
    };

    const closeWrapper = (w, animated = true) => {
      if (!w) return;
      w.classList.remove('open', 'swiping');
      const r = w.querySelector('.task-row');
      const a = w.querySelector('.task-swipe-actions-right');
      const bg = w.querySelector('.task-swipe-check-bg');
      if (animated) {
        if (r) {
          r.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
          r.style.transform = '';
        }
        if (a) {
          a.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
          a.style.transform = '';
        }
        setTimeout(() => {
          if (!w.classList.contains('open') && !w.classList.contains('swiping')) {
            if (r) r.style.transition = '';
            if (a) a.style.transition = '';
          }
        }, 260);
      } else {
        if (r) {
          r.style.transform = '';
          r.style.transition = '';
        }
        if (a) {
          a.style.transform = '';
          a.style.transition = '';
        }
      }
      if (bg) bg.classList.remove('visible');
      if (activeOpenWrapper === w) activeOpenWrapper = null;
    };

    const closeAllSwipes = (animated = true) => {
      wrappers.forEach(w => {
        if (w.classList.contains('open') || w.classList.contains('swiping')) {
          closeWrapper(w, animated);
        }
      });
      activeOpenWrapper = null;
    };

    // Close open swipe on tap outside
    const outsideTapHandler = (e) => {
      if (activeOpenWrapper && !activeOpenWrapper.contains(e.target)) {
        closeAllSwipes(true);
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
      const isMaineQuest = wrapper.classList.contains('is-maine-quest-wrapper');
      const getActionsWidth = () => {
        if (actionsRight && actionsRight.offsetWidth > 0) return actionsRight.offsetWidth;
        return isSingleDelete ? 58 : (isMaineQuest ? 112 : 180);
      };
      const openThreshold = isSingleDelete ? -25 : (isMaineQuest ? -35 : -40);
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
          closeAllSwipes(true);
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

        const actionsBaseWidth = getActionsWidth();
        const maxLeftSwipe = -actionsBaseWidth;

        let translateX = dx;
        if (wrapper.classList.contains('open')) {
          translateX = maxLeftSwipe + dx;
          // Resistance at ends when open
          if (translateX > 0) {
            translateX = translateX * 0.2;
          } else if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.25;
          }
        } else {
          // Resistance at ends when closed
          if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.25;
          } else if (translateX > maxRightSwipe) {
            translateX = maxRightSwipe + (translateX - maxRightSwipe) * 0.25;
          }
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;

          if (wrapper.classList.contains('open')) {
            const actionsOffset = Math.max(0, actionsBaseWidth + translateX);
            if (actionsRight) actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
            if (checkBg) checkBg.classList.remove('visible');
          } else {
            if (translateX < 0) {
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

        const wasDragging = isDragging;
        isDragging = false;

        if (!wasDragging) {
          // If user tapped on the main task row while open, close the swipe
          if (wrapper.classList.contains('open') && (!target || !target.closest('.task-swipe-actions-right'))) {
            closeAllSwipes(true);
          }
          return;
        }

        const actionsBaseWidth = getActionsWidth();
        const maxLeftSwipe = -actionsBaseWidth;
        const dx = clientX - startX;

        if (wrapper.classList.contains('open')) {
          if (dx > 25) {
            // Swiped right -> smoothly close sub-menu!
            closeWrapper(wrapper, true);
            triggerHaptic(15);
          } else {
            // Did not swipe right enough -> snap back to fully open
            snapOpen(wrapper);
          }
        } else {
          if (dx < openThreshold) {
            // Swiped left enough -> open action menu
            closeAllSwipes(true);
            wrapper.classList.add('open');
            snapOpen(wrapper);
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

      // Pointer / Mouse events on task row
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

      // Native Touch events on task row (smooth & bulletproof on all mobile phones)
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

      // Action sub-menu right-swipe listeners
      if (actionsRight) {
        // Desktop / Mouse swipe right on actions sub-menu
        actionsRight.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          if (e.pointerType === 'touch') return; // Handled by touch events
          if (!wrapper.classList.contains('open')) return;

          const startX = e.clientX;
          const startY = e.clientY;
          let isDragging = false;

          const onPointerMove = (ev) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;

            if (!isDragging) {
              if (dx > 12 && dx > Math.abs(dy) * 1.2) {
                isDragging = true;
                wrapper.classList.add('swiping');
                if (row) row.style.transition = 'none';
                actionsRight.style.transition = 'none';
              }
            }

            if (isDragging) {
              const actionsBaseWidth = getActionsWidth();
              const maxLeftSwipe = -actionsBaseWidth;
              let translateX = maxLeftSwipe + dx;
              if (translateX > 0) translateX = translateX * 0.2;
              const actionsOffset = Math.max(0, actionsBaseWidth + translateX);

              if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;
              actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
            }
          };

          const onPointerUp = (ev) => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);

            if (!isDragging) {
              // It was just a click! Normal native click on button proceeds untouched.
              return;
            }

            // It was a drag/swipe! Block click on actions buttons
            const blockClick = (clickEv) => {
              clickEv.preventDefault();
              clickEv.stopPropagation();
              clickEv.stopImmediatePropagation();
            };
            actionsRight.addEventListener('click', blockClick, { capture: true, once: true });
            setTimeout(() => {
              actionsRight.removeEventListener('click', blockClick, { capture: true });
            }, 300);

            wrapper.classList.remove('swiping');
            const dx = ev.clientX - startX;
            if (dx > 30) {
              closeWrapper(wrapper, true);
              triggerHaptic(15);
            } else {
              snapOpen(wrapper);
            }
          };

          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUp);
          window.addEventListener('pointercancel', onPointerUp);
        });

        // Native Touch events on actions sub-menu (Mobile phones)
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouchDragging = false;
        let isTouchVertical = false;

        actionsRight.addEventListener('touchstart', (e) => {
          if (!wrapper.classList.contains('open')) return;
          const touch = e.touches[0];
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
          isTouchDragging = false;
          isTouchVertical = false;
        }, { passive: true });

        actionsRight.addEventListener('touchmove', (e) => {
          if (isTouchVertical) return;
          const touch = e.touches[0];
          const dx = touch.clientX - touchStartX;
          const dy = touch.clientY - touchStartY;

          if (!isTouchDragging) {
            if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
              isTouchVertical = true;
              return;
            }
            if (dx > 12 && dx > Math.abs(dy) * 1.2) {
              isTouchDragging = true;
              wrapper.classList.add('swiping');
              if (row) row.style.transition = 'none';
              actionsRight.style.transition = 'none';
            }
          }

          if (isTouchDragging) {
            if (e.cancelable) e.preventDefault();
            const actionsBaseWidth = getActionsWidth();
            const maxLeftSwipe = -actionsBaseWidth;
            let translateX = maxLeftSwipe + dx;
            if (translateX > 0) translateX = translateX * 0.2;
            const actionsOffset = Math.max(0, actionsBaseWidth + translateX);

            if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;
            actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
          }
        }, { passive: false });

        actionsRight.addEventListener('touchend', (e) => {
          if (!isTouchDragging) {
            // It was a tap! Let standard touch click happen untouched!
            return;
          }

          // It was a swipe! Block the synthetic click
          const blockClick = (clickEv) => {
            clickEv.preventDefault();
            clickEv.stopPropagation();
            clickEv.stopImmediatePropagation();
          };
          actionsRight.addEventListener('click', blockClick, { capture: true, once: true });
          setTimeout(() => {
            actionsRight.removeEventListener('click', blockClick, { capture: true });
          }, 300);

          wrapper.classList.remove('swiping');
          const touch = e.changedTouches[0];
          const endX = touch ? touch.clientX : touchStartX;
          const dx = endX - touchStartX;

          if (dx > 30) {
            closeWrapper(wrapper, true);
            triggerHaptic(15);
          } else {
            snapOpen(wrapper);
          }
          isTouchDragging = false;
        }, { passive: true });

        actionsRight.addEventListener('touchcancel', () => {
          if (isTouchDragging) {
            wrapper.classList.remove('swiping');
            snapOpen(wrapper);
            isTouchDragging = false;
          }
        }, { passive: true });
      }
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

    this.updateWeekDaysProgress();
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
    if (typeId?.startsWith('food_')) return { id: typeId, img: `./assets/stickers/food/${typeId}.webp` };
    if (typeId?.startsWith('sweet_')) return { id: typeId, img: `./assets/stickers/sweets/${typeId}.webp` };
    if (typeId?.startsWith('reptile_')) return { id: typeId, img: `./assets/stickers/reptiles/${typeId}.webp` };
    if (typeId?.startsWith('sport_')) return { id: typeId, img: `./assets/stickers/sport/${typeId}.webp` };
    if (typeId?.startsWith('paper_')) return { id: typeId, img: `./assets/stickers/paper/${typeId}.png` };
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
      const handleOpenStickers = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        triggerHaptic(20);
        this.collapseSubstrateDrawer(true);
        this.openStickersDrawer();
      };

      this.fabStickersBtn.addEventListener('click', handleOpenStickers);
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

    // 3. Category Buttons in Drawer (with smooth drag, wheel scroll & Long-Press Reorder)
    this.initStickersCategoryTabs();
  }

  loadStickerCategoryOrder() {
    try {
      const saved = localStorage.getItem('plan4u_sticker_tabs_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const knownIds = DEFAULT_STICKER_CATEGORIES.map(c => c.id);
          const ordered = parsed.filter(id => knownIds.includes(id));
          knownIds.forEach(id => {
            if (!ordered.includes(id)) ordered.push(id);
          });
          return ordered;
        }
      }
    } catch (e) { }
    return DEFAULT_STICKER_CATEGORIES.map(c => c.id);
  }

  saveStickerCategoryOrder(order) {
    try {
      if (Array.isArray(order)) {
        localStorage.setItem('plan4u_sticker_tabs_order', JSON.stringify(order));
        if (window.Plan4UStorage) {
          Plan4UStorage.saveFile('sticker_tabs_order.json', order);
        }
      }
    } catch (e) { }
  }

  initStickersCategoryTabs() {
    const bar = this.stickersCategoriesBar || document.getElementById('stickersCategoriesBar');
    if (!bar) return;

    this.renderStickersCategoryTabs();

    // Horizontal Wheel Scroll
    bar.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        bar.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  renderStickersCategoryTabs() {
    const bar = this.stickersCategoriesBar || document.getElementById('stickersCategoriesBar');
    if (!bar) return;

    const order = this.loadStickerCategoryOrder();
    if (!this.activeStickerCategory) {
      this.activeStickerCategory = order[0] || 'fall';
    }

    bar.innerHTML = order.map(catId => {
      const def = DEFAULT_STICKER_CATEGORIES.find(c => c.id === catId);
      if (!def) return '';
      const isActive = (catId === this.activeStickerCategory);
      const label = this.t(def.key || `cat_${def.id}`) || `${def.icon} ${def.fallback || def.name}`;
      return `<button type="button" class="sticker-cat-btn${isActive ? ' active' : ''}" data-category="${def.id}" data-i18n="${def.key || `cat_${def.id}`}">${label}</button>`;
    }).join('');

    this.attachStickerCategoryInteractions();
  }

  attachStickerCategoryInteractions() {
    const bar = this.stickersCategoriesBar || document.getElementById('stickersCategoriesBar');
    if (!bar) return;

    const buttons = Array.from(bar.querySelectorAll('.sticker-cat-btn'));

    buttons.forEach(btn => {
      let holdTimer = null;
      let isReordering = false;
      let startX = 0;
      let startY = 0;
      let initialBarScroll = 0;
      let hasScrolled = false;
      let autoScrollAnim = null;

      const stopAutoScroll = () => {
        if (autoScrollAnim) {
          cancelAnimationFrame(autoScrollAnim);
          autoScrollAnim = null;
        }
      };

      const checkAutoScroll = (clientX) => {
        const barRect = bar.getBoundingClientRect();
        const edgeZone = 40;
        const maxScroll = bar.scrollWidth - bar.clientWidth;

        stopAutoScroll();

        if (clientX < barRect.left + edgeZone && bar.scrollLeft > 0) {
          const speed = Math.max(3, (barRect.left + edgeZone - clientX) * 0.25);
          const step = () => {
            if (!isReordering) return;
            bar.scrollLeft = Math.max(0, bar.scrollLeft - speed);
            autoScrollAnim = requestAnimationFrame(step);
          };
          autoScrollAnim = requestAnimationFrame(step);
        } else if (clientX > barRect.right - edgeZone && bar.scrollLeft < maxScroll) {
          const speed = Math.max(3, (clientX - (barRect.right - edgeZone)) * 0.25);
          const step = () => {
            if (!isReordering) return;
            bar.scrollLeft = Math.min(maxScroll, bar.scrollLeft + speed);
            autoScrollAnim = requestAnimationFrame(step);
          };
          autoScrollAnim = requestAnimationFrame(step);
        }
      };

      const startHold = (clientX, clientY) => {
        clearTimeout(holdTimer);
        stopAutoScroll();
        startX = clientX;
        startY = clientY;
        initialBarScroll = bar.scrollLeft;
        hasScrolled = false;
        isReordering = false;

        holdTimer = setTimeout(() => {
          isReordering = true;
          triggerHaptic([35, 50]);
          btn.classList.add('is-reordering');
          bar.classList.add('is-reordering');
        }, 260);
      };

      const handleMove = (clientX, clientY) => {
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (!isReordering) {
          if (Math.hypot(dx, dy) > 8) {
            clearTimeout(holdTimer);
            holdTimer = null;
            hasScrolled = true;
          }
          return;
        }

        // In reordering mode: swap adjacent tabs when crossing their center
        checkAutoScroll(clientX);

        const siblings = Array.from(bar.querySelectorAll('.sticker-cat-btn'));
        const currentIndex = siblings.indexOf(btn);

        // Check if moving to the right
        if (currentIndex < siblings.length - 1) {
          const nextBtn = siblings[currentIndex + 1];
          const nextRect = nextBtn.getBoundingClientRect();
          const nextMid = nextRect.left + nextRect.width / 2;
          if (clientX > nextMid) {
            nextBtn.after(btn);
            triggerHaptic(15);
            return;
          }
        }

        // Check if moving to the left
        if (currentIndex > 0) {
          const prevBtn = siblings[currentIndex - 1];
          const prevRect = prevBtn.getBoundingClientRect();
          const prevMid = prevRect.left + prevRect.width / 2;
          if (clientX < prevMid) {
            prevBtn.before(btn);
            triggerHaptic(15);
            return;
          }
        }
      };

      const endInteraction = (clientX, clientY) => {
        clearTimeout(holdTimer);
        holdTimer = null;
        stopAutoScroll();

        if (isReordering) {
          isReordering = false;
          btn.classList.remove('is-reordering');
          bar.classList.remove('is-reordering');

          // Read final DOM order and save
          const currentOrder = Array.from(bar.querySelectorAll('.sticker-cat-btn'))
            .map(b => b.dataset.category)
            .filter(Boolean);

          this.saveStickerCategoryOrder(currentOrder);
          triggerHaptic(20);

          this._justReorderedStickerTab = true;
          setTimeout(() => {
            this._justReorderedStickerTab = false;
          }, 320);
        }
      };

      // Touch events (Mobile)
      btn.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        startHold(touch.clientX, touch.clientY);
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        if (isReordering && e.cancelable) e.preventDefault();
        handleMove(touch.clientX, touch.clientY);
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
        endInteraction(touch ? touch.clientX : startX, touch ? touch.clientY : startY);
      }, { passive: true });

      btn.addEventListener('touchcancel', () => {
        endInteraction(startX, startY);
      }, { passive: true });

      // Mouse events (Desktop)
      btn.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        startHold(e.clientX, e.clientY);

        const onMouseMove = (ev) => {
          if (isReordering && ev.cancelable) ev.preventDefault();
          handleMove(ev.clientX, ev.clientY);
        };

        const onMouseUp = (ev) => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          endInteraction(ev.clientX, ev.clientY);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      // Regular click to select category
      btn.addEventListener('click', (e) => {
        if (this._justReorderedStickerTab || hasScrolled) return;
        const category = btn.dataset.category;
        if (category) {
          triggerHaptic(15);
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          this.renderStickersCatalog(category);
        }
      });
    });

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
    this.collapseSubstrateDrawer(true);
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
    this.renderStickersCategoryTabs();
    const order = this.loadStickerCategoryOrder();
    const catToOpen = (this.activeStickerCategory && order.includes(this.activeStickerCategory)) ? this.activeStickerCategory : (order[0] || 'fall');
    this.renderStickersCatalog(catToOpen);
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
        ? `<img src="${stk.img}" alt="" draggable="false" class="sticker-picker-img" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried='1';setTimeout(()=>{this.src='${stk.img}?v=0.1.2';},300);}" />`
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

  // =========================================================================
  //  CYCLE TRACKER & WOMEN'S HEALTH METHODS
  // =========================================================================

  refreshCycleUI(toastKey = null, toastIcon = '🍒') {
    this.renderCycleModalContent();
    this.renderCalendar();
    this.updateCycleWidget();
    if (toastKey) this.showToast(this.t(toastKey), toastIcon);
  }

  updateCycleWidget() {
    if (!this.widgetCycle) return;
    if (!this.cycleTracker || !this.cycleTracker.isEnabled()) {
      this.widgetCycle.style.display = 'none';
      this.updateModulesHubState?.();
      return;
    }

    this.widgetCycle.style.display = 'flex';
    const status = this.cycleTracker.getStatusForDate();
    if (status && status.hasData) {
      if (this.widgetCycleDay) {
        this.widgetCycleDay.textContent = `${status.dayInCycle}д`;
      }
      const phaseAdvice = this.cycleTracker.getPhaseAdvice(status.phase, this.settings.lang || 'ru', status.dayInCycle, status);
      this.widgetCycle.title = `${this.t('cycle_settings_title')}: День ${status.dayInCycle} (${phaseAdvice.title})`;
    } else {
      if (this.widgetCycleDay) {
        this.widgetCycleDay.textContent = '--';
      }
      this.widgetCycle.title = this.t('cycle_settings_title');
    }
    this.updateModulesHubState?.();
  }

  openCycleModal() {
    this.dismissActiveKeyboard();
    if (!this.cycleModalBackdrop) return;
    this._cycleModalOpenedAt = Date.now();
    this.cycleModalBackdrop.classList.add('open');
    this.cycleModalBackdrop.setAttribute('aria-hidden', 'false');

    this._currentModalAdvice = null; // Pick a fresh, warm, random living phrase each time the user opens the modal
    this.renderCycleModalContent();
  }

  closeCycleModal() {
    if (this.cycleModalBackdrop) {
      this.cycleModalBackdrop.classList.remove('open');
      this.cycleModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  renderCycleOrbitWheel(status, lang) {
    if (!this.cycleTracker) return;
    const orbitData = this.cycleTracker.getOrbitData(status ? status.curDateStr : null);

    // Update legend localized texts
    [
      [this.legendTextMenstrual, 'cycle_orbit_legend_menstrual'],
      [this.legendTextFollicular, 'cycle_orbit_legend_follicular'],
      [this.legendTextOvulation, 'cycle_orbit_legend_ovulation'],
      [this.legendTextLuteal, 'cycle_orbit_legend_luteal']
    ].forEach(([el, key]) => { if (el) el.textContent = this.t(key); });

    const C = 2 * Math.PI * 46; // Circumference ≈ 289.027

    if (orbitData && orbitData.hasData) {
      if (this.cycleOrbitDayNum) this.cycleOrbitDayNum.textContent = orbitData.currentDay;
      if (this.cycleOrbitDayLabel) this.cycleOrbitDayLabel.textContent = this.t('cycle_orbit_day_label');
      if (this.cycleOrbitTotalLabel) this.cycleOrbitTotalLabel.textContent = this.t('cycle_orbit_of_total', { total: orbitData.totalDays });

      // Rotate cherry arm around the center
      if (this.cycleOrbitPointerArm) {
        this.cycleOrbitPointerArm.style.transform = `rotate(${orbitData.pointerAngleDeg}deg)`;
      }

      // Draw 4 phase arcs with clean dasharrays and gaps
      let offsetProgress = 0;
      const arcEls = {
        menstrual: this.orbitArcMenstrual,
        follicular: this.orbitArcFollicular,
        ovulation: this.orbitArcOvulation,
        luteal: this.orbitArcLuteal
      };

      if (Array.isArray(orbitData.segments)) {
        orbitData.segments.forEach(seg => {
          const el = arcEls[seg.key];
          if (!el) return;
          const frac = seg.days / orbitData.totalDays;
          const arcLen = frac * C;
          const dash = Math.max(0.1, arcLen - 3.5);
          el.style.strokeDasharray = `${dash} ${C - dash}`;
          el.style.strokeDashoffset = `${-offsetProgress}`;
          offsetProgress += arcLen;
        });
      }
    } else {
      if (this.cycleOrbitDayNum) this.cycleOrbitDayNum.textContent = '--';
      if (this.cycleOrbitDayLabel) this.cycleOrbitDayLabel.textContent = this.t('cycle_orbit_day_label');
      if (this.cycleOrbitTotalLabel) this.cycleOrbitTotalLabel.textContent = '';
      if (this.cycleOrbitPointerArm) this.cycleOrbitPointerArm.style.transform = 'rotate(0deg)';

      [this.orbitArcMenstrual, this.orbitArcFollicular, this.orbitArcOvulation, this.orbitArcLuteal].forEach(el => {
        if (el) {
          el.style.strokeDasharray = '0 300';
          el.style.strokeDashoffset = '0';
        }
      });
    }
  }

  renderCycleModalContent() {
    if (!this.cycleTracker) return;
    const lang = this.settings.lang || 'ru';
    const status = this.cycleTracker.getStatusForDate();
    const prediction = this.cycleTracker.getPrediction();

    // 1. Cycle Orbit Wheel with Moving Cherry
    this.renderCycleOrbitWheel(status, lang);

    // 2. Status Card
    if (status && status.hasData) {
      if (this.cycleDayBadge) {
        this.cycleDayBadge.textContent = this.t('cycle_card_cur_day', { day: status.dayInCycle });
      }
      if (!this._currentModalAdvice || this._currentModalAdviceLang !== lang || this._currentModalAdviceDay !== status.dayInCycle) {
        this._currentModalAdvice = this.cycleTracker.getPhaseAdvice(status.phase, lang, status.dayInCycle, status);
        this._currentModalAdviceLang = lang;
        this._currentModalAdviceDay = status.dayInCycle;
      }
      const advice = this._currentModalAdvice;
      if (this.cyclePhasePill) {
        this.cyclePhasePill.textContent = advice.badge || advice.title;
      }
      if (this.cycleEnergyTag) {
        this.cycleEnergyTag.textContent = advice.energy;
      }
      if (this.cycleAdviceText) {
        this.cycleAdviceText.textContent = advice.taskTip;
      }
    } else {
      [
        [this.cycleDayBadge, 'cycle_card_empty_day'],
        [this.cyclePhasePill, 'cycle_card_empty_pill'],
        [this.cycleEnergyTag, 'cycle_card_empty_energy'],
        [this.cycleAdviceText, 'cycle_card_empty_advice']
      ].forEach(([el, key]) => { if (el) el.textContent = this.t(key); });
    }

    // Dynamic Action Button (Start Cycle vs End Period)
    const isPeriodActive = this.cycleTracker ? this.cycleTracker.isPeriodCurrentlyActive() : false;
    if (this.btnCycleStartToday) {
      const iconEl = this.btnCycleStartToday.querySelector('.cycle-action-icon');
      const textEl = this.btnCycleStartToday.querySelector('.cycle-action-text');
      if (isPeriodActive) {
        if (iconEl) iconEl.textContent = '✨';
        if (textEl) textEl.textContent = this.t('cycle_btn_end_today');
        this.btnCycleStartToday.classList.add('is-active-end');
      } else {
        if (iconEl) iconEl.textContent = '🩸';
        if (textEl) textEl.textContent = this.t('cycle_btn_start_today');
        this.btnCycleStartToday.classList.remove('is-active-end');
      }
    }

    // 2. Prediction Box
    if (this.cyclePredictionValue && this.cyclePredictionSub) {
      if (prediction) {
        if (status.inWindow) {
          this.cyclePredictionValue.textContent = this.t('cycle_card_in_window');
          this.cyclePredictionSub.textContent = `Ожидаемое окно: ${prediction.windowStart} – ${prediction.windowEnd}`;
        } else if (status.isOverdue) {
          this.cyclePredictionValue.textContent = this.t('cycle_card_overdue');
          this.cyclePredictionSub.textContent = `Ожидались: ${prediction.windowStart} – ${prediction.windowEnd}. Нажмите кнопку выше, если начался новый цикл.`;
        } else if (status.daysUntilWindow > 0) {
          this.cyclePredictionValue.textContent = this.t('cycle_card_expected_window', { start: prediction.windowStart, end: prediction.windowEnd });
          this.cyclePredictionSub.textContent = this.t('cycle_card_until_window', { days: status.daysUntilWindow });
        } else if (prediction.historyCount === 0) {
          this.cyclePredictionValue.textContent = this.t('cycle_card_expected_window', { start: prediction.windowStart, end: prediction.windowEnd });
          this.cyclePredictionSub.textContent = `Базовый цикл: ${prediction.defaultCycleLength || 28} дн. (окно: ${prediction.minLen}–${prediction.maxLen} дн.)`;
        } else {
          this.cyclePredictionValue.textContent = this.t('cycle_card_expected_window', { start: prediction.windowStart, end: prediction.windowEnd });
          this.cyclePredictionSub.textContent = `Медиана: ${prediction.medianLength} дн. (базовая: ${prediction.defaultCycleLength || 28} дн., разброс: ${prediction.minLen}–${prediction.maxLen} дн.)`;
        }
      } else {
        this.cyclePredictionValue.textContent = 'Ожидает первых данных';
        this.cyclePredictionSub.textContent = 'Добавьте хотя бы одну дату начала цикла';
      }
    }

    // 3. History List
    if (this.cycleHistoryList) {
      this.cycleHistoryList.innerHTML = '';
      const history = this.cycleTracker.getHistory();
      if (this.cycleHistoryCount) {
        this.cycleHistoryCount.textContent = `${history.length} записей`;
      }

      if (history.length === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.style.cssText = 'text-align: center; padding: 18px 10px; color: #94a3b8; font-size: 12.5px;';
        emptyEl.textContent = 'История пока пуста. Добавьте даты цикла кнопками выше ✨';
        this.cycleHistoryList.appendChild(emptyEl);
      } else {
        history.forEach((cycle, idx) => {
          const card = document.createElement('div');
          card.className = `cycle-history-card ${cycle.isOutlier ? 'is-outlier' : ''}`;
          card.onclick = (e) => {
            if (e.target.closest('.cycle-outlier-chip') || e.target.closest('.cycle-history-edit-btn')) return;
            triggerHaptic(15);
            this.openCycleAddModal(cycle);
          };

          const main = document.createElement('div');
          main.className = 'cycle-history-main';

          const datesEl = document.createElement('div');
          datesEl.className = 'cycle-history-dates';
          datesEl.textContent = `${cycle.startDate} – ${cycle.endDate || '...'}`;

          const metaEl = document.createElement('div');
          metaEl.className = 'cycle-history-meta';

          let lenText = '';
          const nextCycle = history[idx - 1]; // т.к. history отсортирована по убыванию (новейшие вверху)
          if (nextCycle) {
            const daysLen = window.Plan4UCycleTracker ? Plan4UCycleTracker.diffInDays(cycle.startDate, nextCycle.startDate) : 0;
            lenText = `Длина: ${daysLen} дн.`;
          } else if (idx === 0) {
            lenText = 'Текущий цикл';
          }

          metaEl.textContent = lenText;

          if (cycle.isOutlier) {
            const outTag = document.createElement('span');
            outTag.className = 'cycle-outlier-tag';
            outTag.textContent = this.t('cycle_outlier_badge');
            metaEl.appendChild(outTag);
          }

          if (cycle.ovulationDate) {
            const ovTag = document.createElement('span');
            ovTag.style.cssText = 'font-size: 10px; font-weight: 700; color: #7c3aed; background: rgba(124, 58, 237, 0.15); padding: 1px 6px; border-radius: 6px;';
            ovTag.textContent = `✨ Овуляция: ${cycle.ovulationDate}`;
            metaEl.appendChild(ovTag);
          }

          if (cycle.notes) {
            const notesEl = document.createElement('div');
            notesEl.style.cssText = 'font-size: 11px; color: #64748b; font-style: italic; margin-top: 2px;';
            notesEl.textContent = `«${cycle.notes}»`;
            main.appendChild(notesEl);
          }

          main.prepend(datesEl);
          main.appendChild(metaEl);

          const actions = document.createElement('div');
          actions.className = 'cycle-history-actions';

          // Если цикл был помечен как аномальный (болезнь/стресс), показываем деликатный чип
          if (cycle.isOutlier) {
            const outlierChip = document.createElement('button');
            outlierChip.type = 'button';
            outlierChip.className = 'cycle-outlier-chip';
            outlierChip.title = this.t('cycle_outlier_tooltip');
            outlierChip.textContent = this.t('cycle_outlier_chip');
            outlierChip.onclick = (e) => {
              e.stopPropagation();
              triggerHaptic(15);
              this.cycleTracker.toggleOutlier(cycle.id);
              this.refreshCycleUI('cycle_toast_outlier', '⚙️');
            };
            actions.appendChild(outlierChip);
          }

          // Аккуратная кнопка-иконка редактирования записи
          const editBtn = document.createElement('button');
          editBtn.type = 'button';
          editBtn.className = 'cycle-history-edit-btn';
          editBtn.title = this.t('cycle_history_edit_tooltip');
          editBtn.textContent = '✏️';
          editBtn.onclick = (e) => {
            e.stopPropagation();
            triggerHaptic(10);
            this.openCycleAddModal(cycle);
          };
          actions.appendChild(editBtn);

          card.appendChild(main);
          card.appendChild(actions);
          this.cycleHistoryList.appendChild(card);
        });
      }
    }
  }

  openCycleAddModal(cycleToEdit = null) {
    this.dismissActiveKeyboard();
    if (!this.cycleAddModalBackdrop) return;

    this._cycleAddModalOpenedAt = Date.now();
    this.cycleAddModalBackdrop.classList.add('open');
    this.cycleAddModalBackdrop.setAttribute('aria-hidden', 'false');

    if (cycleToEdit) {
      this.editingCycleId = cycleToEdit.id;
      if (this.cycleAddModalTitle) {
        this.cycleAddModalTitle.textContent = this.t('cycle_edit_modal_title');
      }
      if (this.cycleInputStartDate) this.cycleInputStartDate.value = cycleToEdit.startDate || '';
      if (this.cycleInputEndDate) this.cycleInputEndDate.value = cycleToEdit.endDate || '';
      if (this.cycleInputIsOutlier) this.cycleInputIsOutlier.checked = !!cycleToEdit.isOutlier;
      if (this.cycleInputNotes) this.cycleInputNotes.value = cycleToEdit.notes || '';
      if (this.cycleAddDeleteBtn) this.cycleAddDeleteBtn.style.display = 'flex';
    } else {
      this.editingCycleId = null;
      if (this.cycleAddModalTitle) {
        this.cycleAddModalTitle.textContent = this.t('cycle_add_modal_title');
      }
      const todayStr = this.getTodayDateString();
      if (this.cycleInputStartDate) this.cycleInputStartDate.value = todayStr;
      const periodLen = this.cycleTracker ? (this.cycleTracker.getSettings().periodLength || 5) : 5;
      if (this.cycleInputEndDate) {
        this.cycleInputEndDate.value = window.Plan4UCycleTracker ? Plan4UCycleTracker.addDays(todayStr, periodLen - 1) : todayStr;
      }
      if (this.cycleInputIsOutlier) this.cycleInputIsOutlier.checked = false;
      if (this.cycleInputNotes) this.cycleInputNotes.value = '';
      if (this.cycleAddDeleteBtn) this.cycleAddDeleteBtn.style.display = 'none';
    }

    this.updateCycleFormDurationBadge();
  }

  updateCycleFormDurationBadge() {
    if (!this.cycleFormDurationBadge) return;
    const startStr = this.cycleInputStartDate ? this.cycleInputStartDate.value : '';
    const endStr = this.cycleInputEndDate ? this.cycleInputEndDate.value : '';
    if (!startStr) {
      this.cycleFormDurationBadge.textContent = '📅 ' + this.t('cycle_duration_pick');
      this.cycleFormDurationBadge.classList.remove('is-error');
      return;
    }
    if (!endStr) {
      this.cycleFormDurationBadge.textContent = '✨ ' + this.t('cycle_duration_days', { days: 1 });
      this.cycleFormDurationBadge.classList.remove('is-error');
      return;
    }
    const diff = window.Plan4UCycleTracker ? Plan4UCycleTracker.diffInDays(startStr, endStr) : 0;
    if (diff < 0) {
      this.cycleFormDurationBadge.textContent = '⚠️ ' + this.t('cycle_duration_invalid');
      this.cycleFormDurationBadge.classList.add('is-error');
    } else {
      const days = diff + 1;
      this.cycleFormDurationBadge.textContent = '✨ ' + this.t('cycle_duration_days', { days });
      this.cycleFormDurationBadge.classList.remove('is-error');
    }
  }

  closeCycleAddModal() {
    this.editingCycleId = null;
    if (this.cycleAddModalBackdrop) {
      this.cycleAddModalBackdrop.classList.remove('open');
      this.cycleAddModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  saveCycleFromForm() {
    if (!this.cycleTracker) return;
    const startDate = this.cycleInputStartDate ? this.cycleInputStartDate.value : '';
    if (!startDate) {
      alert('Пожалуйста, выберите дату начала цикла');
      return;
    }
    const endDate = this.cycleInputEndDate ? this.cycleInputEndDate.value : null;
    if (endDate && endDate < startDate) {
      alert(this.t ? this.t('cycle_duration_invalid') : 'Дата окончания не может быть раньше даты начала цикла');
      triggerHaptic([30, 50, 30]);
      return;
    }
    const isOutlier = this.cycleInputIsOutlier ? !!this.cycleInputIsOutlier.checked : false;
    const notes = this.cycleInputNotes ? this.cycleInputNotes.value.trim() : '';

    if (this.editingCycleId) {
      this.cycleTracker.updateCycle(this.editingCycleId, {
        startDate,
        endDate: endDate || startDate,
        isOutlier,
        notes
      });
      this.showToast(this.t('cycle_toast_outlier'), '🍒');
    } else {
      this.cycleTracker.addCycle(startDate, endDate, isOutlier, null, notes);
      this.showToast(this.t('cycle_toast_started'), '🍒');
    }

    this.editingCycleId = null;
    triggerHaptic(20);
    this.closeCycleAddModal();
    this.refreshCycleUI();
  }

  /* ============================================================================
   * 💰 FINANCE TRACKER (ДОХОДЫ И РАСХОДЫ) METHODS
   * ============================================================================ */

  initFinanceTrackerListeners() {
    if (!this.financeTracker) return;

    // Top Header Widget click
    if (this.widgetFinance) {
      this.widgetFinance.addEventListener('click', () => {
        triggerHaptic(20);
        this.closeModulesHubDropdown();
        this.isFinanceArchiveMode = false;
        this.openFinanceModal();
      });
    }

    // Archive Day Paper Stamp click
    if (this.notebookFinanceStamp) {
      this.notebookFinanceStamp.addEventListener('click', () => {
        triggerHaptic(20);
        this.isFinanceArchiveMode = true;
        this.openFinanceModal('day', 'overview');
      });
    }

    // Main Modal Close & Safe Backdrop
    if (this.financeCloseBtn) {
      this.financeCloseBtn.addEventListener('click', () => this.closeFinanceModal());
    }
    this.bindSafeBackdrop(this.financeModalBackdrop, () => this.closeFinanceModal(), () => this._financeModalOpenedAt);

    // Add Category Button in Main Modal Header
    if (this.btnFinanceAddCategory) {
      this.btnFinanceAddCategory.addEventListener('click', () => {
        triggerHaptic(15);
        this.openFinanceCategoryModal();
      });
    }

    // Period selector pills (Сегодня / Неделя / Месяц / Все)
    if (this.financePeriodPills) {
      this.financePeriodPills.querySelectorAll('.finance-period-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          triggerHaptic(15);
          this.financePeriodPills.querySelectorAll('.finance-period-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.financeActivePeriod = pill.dataset.period || 'month';
          this.renderFinanceModalContent();
        });
      });
    }

    // View Tabs (Кольцо / История / Категории)
    if (this.financeViewTabs) {
      this.financeViewTabs.querySelectorAll('.finance-view-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          triggerHaptic(15);
          this.financeViewTabs.querySelectorAll('.finance-view-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.financeActiveTab = tab.dataset.tab || 'overview';
          
          if (this.financePaneOverview) {
            this.financePaneOverview.classList.toggle('active', this.financeActiveTab === 'overview');
            this.financePaneOverview.style.display = this.financeActiveTab === 'overview' ? 'flex' : 'none';
          }
          if (this.financePaneHistory) {
            this.financePaneHistory.classList.toggle('active', this.financeActiveTab === 'history');
            this.financePaneHistory.style.display = this.financeActiveTab === 'history' ? 'flex' : 'none';
          }
          if (this.financePaneCategories) {
            this.financePaneCategories.classList.toggle('active', this.financeActiveTab === 'categories');
            this.financePaneCategories.style.display = this.financeActiveTab === 'categories' ? 'flex' : 'none';
          }

          this.renderFinanceModalContent();
        });
      });
    }

    // 2 Big Round Action Buttons: [+] Income and [-] Expense
    if (this.btnFinanceQuickIncome) {
      this.btnFinanceQuickIncome.addEventListener('click', () => {
        triggerHaptic(25);
        this.openFinanceEntryModal('income');
      });
    }

    if (this.btnFinanceQuickExpense) {
      this.btnFinanceQuickExpense.addEventListener('click', () => {
        triggerHaptic(25);
        this.openFinanceEntryModal('expense');
      });
    }

    // Archive Day Informational Actions: "История" button -> opens day transactions in read-only mode
    if (this.btnFinanceArchiveHistory) {
      this.btnFinanceArchiveHistory.addEventListener('click', () => {
        triggerHaptic(15);
        this.financeActiveTab = 'history';
        if (this.financePaneOverview) {
          this.financePaneOverview.classList.remove('active');
          this.financePaneOverview.style.display = 'none';
        }
        if (this.financePaneHistory) {
          this.financePaneHistory.classList.add('active');
          this.financePaneHistory.style.display = 'flex';
        }
        this.renderFinanceModalContent();
      });
    }

    // Archive Day Back Button from History -> back to Ring overview
    if (this.btnFinanceArchiveBackToRing) {
      this.btnFinanceArchiveBackToRing.addEventListener('click', () => {
        triggerHaptic(15);
        this.financeActiveTab = 'overview';
        if (this.financePaneHistory) {
          this.financePaneHistory.classList.remove('active');
          this.financePaneHistory.style.display = 'none';
        }
        if (this.financePaneOverview) {
          this.financePaneOverview.classList.add('active');
          this.financePaneOverview.style.display = 'flex';
        }
        this.renderFinanceModalContent();
      });
    }

    // Quick Entry Modal Listeners
    if (this.financeEntryCloseBtn) {
      this.financeEntryCloseBtn.addEventListener('click', () => this.closeFinanceEntryModal());
    }
    if (this.btnFinanceEntryBack) {
      this.btnFinanceEntryBack.addEventListener('click', () => this.closeFinanceEntryModal());
    }
    if (this.btnFinanceEntrySave) {
      this.btnFinanceEntrySave.addEventListener('click', () => this.saveFinanceEntry());
    }
    if (this.btnFinanceEntryDelete) {
      this.btnFinanceEntryDelete.addEventListener('click', () => {
        if (!this.financeEditingTxId) return;
        const tx = this.financeTracker.getTransaction(this.financeEditingTxId);
        if (!tx) return;
        const cur = this.financeTracker.getCurrency();
        const isExpense = tx.type === 'expense';
        const sign = isExpense ? '-' : '+';
        const cat = this.financeTracker.getCategory(tx.categoryId);
        const catName = cat ? this.getFinanceCategoryName(cat) : (isExpense ? (this.t('finance_btn_expense') || 'Расход') : (this.t('finance_btn_income') || 'Доход'));
        triggerHaptic(20);
        const title = this.t('finance_delete_tx_title') || 'Удалить запись?';
        const msg = (this.t('finance_delete_tx_confirm') || `Удалить ${isExpense ? 'расход' : 'доход'} ${sign}${this.financeTracker.formatMoney(tx.amount)} ${cur} (${catName})?`)
          .replace('{catName}', catName)
          .replace('{amount}', this.financeTracker.formatMoney(tx.amount))
          .replace('{cur}', cur);
        const confirmBtnText = this.t('delete') || 'Удалить';
        const deletedToast = this.t('finance_toast_tx_deleted') || 'Запись удалена';
        this.showConfirmModal({
          title,
          message: msg,
          icon: '🗑️',
          confirmText: confirmBtnText,
          onConfirm: () => {
            this.financeTracker.deleteTransaction(tx.id);
            this.closeFinanceEntryModal();
            this.renderFinanceModalContent();
            this.updateFinanceWidget();
            this.updateFinanceArchiveStamp();
            this.syncWithNativeWidget?.();
            this.showToast(deletedToast, '🗑️');
          }
        });
      });
    }
    this.bindSafeBackdrop(this.financeEntryModalBackdrop, () => this.closeFinanceEntryModal(), () => this._financeEntryModalOpenedAt);

    // Finance Date Picker Listeners
    if (this.financeEntryDateBox) {
      this.financeEntryDateBox.addEventListener('click', () => {
        triggerHaptic(15);
        this.openFinanceDatePicker();
      });
    }
    if (this.financeEntryDateInput) {
      this.financeEntryDateInput.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        this.openFinanceDatePicker();
      });
    }

    if (this.financeDatePickerCloseBtn) {
      this.financeDatePickerCloseBtn.addEventListener('click', () => this.closeFinanceDatePicker());
    }

    if (this.financeDatePrevMonth) {
      this.financeDatePrevMonth.addEventListener('click', () => {
        triggerHaptic(10);
        if (!this.financePickerDisplayedMonth) return;
        let m = this.financePickerDisplayedMonth.month - 1;
        let y = this.financePickerDisplayedMonth.year;
        if (m < 0) { m = 11; y--; }
        this.financePickerDisplayedMonth = { year: y, month: m };
        this.renderFinanceDatePicker();
      });
    }

    if (this.financeDateNextMonth) {
      this.financeDateNextMonth.addEventListener('click', () => {
        triggerHaptic(10);
        if (!this.financePickerDisplayedMonth) return;
        let m = this.financePickerDisplayedMonth.month + 1;
        let y = this.financePickerDisplayedMonth.year;
        if (m > 11) { m = 0; y++; }
        this.financePickerDisplayedMonth = { year: y, month: m };
        this.renderFinanceDatePicker();
      });
    }

    if (this.btnFinanceDateToday) {
      this.btnFinanceDateToday.addEventListener('click', () => {
        triggerHaptic(15);
        const todayStr = this.getTodayDateString();
        this.confirmFinanceDatePicker(todayStr);
      });
    }

    if (this.btnFinanceDateConfirm) {
      this.btnFinanceDateConfirm.addEventListener('click', () => {
        triggerHaptic(15);
        this.confirmFinanceDatePicker(this.financePickerTempDate);
      });
    }

    this.bindSafeBackdrop(this.financeDatePickerModalBackdrop, () => this.closeFinanceDatePicker(), () => this._financeDatePickerOpenedAt);

    // Quick increment chips (+10, +20, +50, +100, +200, etc.)
    if (this.financeQuickChips) {
      this.financeQuickChips.querySelectorAll('.finance-chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          triggerHaptic(15);
          const add = parseFloat(btn.dataset.add) || 0;
          const current = parseFloat((this.financeEntryAmountInput.value || '').replace(',', '.')) || 0;
          const sum = Math.round((current + add) * 100) / 100;
          this.financeEntryAmountInput.value = sum.toString();
          this.dismissActiveKeyboard();
          if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
          }
        });
      });
    }

    if (this.financeEntryAmountInput) {
      this.financeEntryAmountInput.addEventListener('focus', () => {
        const valStr = (this.financeEntryAmountInput.value || '').trim();
        if (valStr === '0' || valStr === '0.0' || parseFloat(valStr) === 0) {
          this.financeEntryAmountInput.value = '';
        } else {
          try { this.financeEntryAmountInput.select(); } catch (_) {}
        }
      });
    }

    // Keyboard Enter listeners for quick submission
    if (this.financeEntryAmountInput) {
      this.financeEntryAmountInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.financeEntryNoteInput && !this.financeEntryNoteInput.value) {
            this.financeEntryNoteInput.focus();
          } else {
            this.saveFinanceEntry();
          }
        }
      });
    }
    if (this.financeEntryNoteInput) {
      this.financeEntryNoteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveFinanceEntry();
        }
      });
    }

    // Category Creator / Editor Modal Listeners
    if (this.financeCategoryCloseBtn) {
      this.financeCategoryCloseBtn.addEventListener('click', () => this.closeFinanceCategoryModal());
    }
    if (this.btnFinanceCategoryCancel) {
      this.btnFinanceCategoryCancel.addEventListener('click', () => this.closeFinanceCategoryModal());
    }
    if (this.btnFinanceCategorySave) {
      this.btnFinanceCategorySave.addEventListener('click', () => this.saveFinanceCategory());
    }
    if (this.financeCatNameInput) {
      this.financeCatNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveFinanceCategory();
        }
      });
    }
    if (this.btnFinanceCategoryDelete) {
      this.btnFinanceCategoryDelete.addEventListener('click', () => {
        if (!this.financeEditingCatId) return;
        const cat = this.financeTracker.getCategory(this.financeEditingCatId);
        if (!cat) return;
        const activeSameType = this.financeTracker.getCategories(cat.type, false);
        if (activeSameType.length <= 1) {
          triggerHaptic(20);
          this.showToast(this.t('finance_cannot_delete_last_cat') || 'Нельзя удалить последнюю категорию этого типа', '⚠️');
          return;
        }
        const catName = this.getFinanceCategoryName(cat);
        triggerHaptic(20);
        const title = this.t('finance_delete_cat_title') || 'Удалить категорию?';
        const msg = (this.t('finance_delete_cat_msg') || `Вы действительно хотите удалить категорию «${catName}»? Прошлые записи в истории сохранятся.`).replace('{catName}', catName);
        const confirmBtnText = this.t('delete') || 'Удалить';
        const deletedToast = (this.t('finance_toast_cat_deleted') || 'Категория удалена') + ` «${catName}»`;
        this.showConfirmModal({
          title,
          message: msg,
          icon: '🗑️',
          confirmText: confirmBtnText,
          onConfirm: () => {
            this.financeTracker.deleteCategory(cat.id);
            this.closeFinanceCategoryModal();
            this.renderFinanceModalContent();
            this.updateFinanceWidget();
            this.updateFinanceArchiveStamp();
            this.syncWithNativeWidget?.();
            this.showToast(deletedToast, '🗑️');
          }
        });
      });
    }
    this.bindSafeBackdrop(this.financeCategoryModalBackdrop, () => this.closeFinanceCategoryModal(), () => this._financeCatModalOpenedAt);

    // Category type buttons (Расход vs Доход)
    if (this.btnCatTypeExpense) {
      this.btnCatTypeExpense.addEventListener('click', () => {
        triggerHaptic(15);
        this.financeNewCatType = 'expense';
        this.btnCatTypeExpense.classList.add('active');
        if (this.btnCatTypeIncome) this.btnCatTypeIncome.classList.remove('active');
      });
    }
    if (this.btnCatTypeIncome) {
      this.btnCatTypeIncome.addEventListener('click', () => {
        triggerHaptic(15);
        this.financeNewCatType = 'income';
        this.btnCatTypeIncome.classList.add('active');
        if (this.btnCatTypeExpense) this.btnCatTypeExpense.classList.remove('active');
      });
    }

    // Settings Toggle Listeners
    if (this.toggleFinanceTracker) {
      this.toggleFinanceTracker.onchange = (e) => {
        const enabled = e.target.checked;
        this.financeTracker.updateSettings({ enabled });
        this.updateFinanceWidget();
        this.updateFinanceArchiveStamp();
        this.updateModulesHubState();
        const lang = this.settings?.lang || 'ru';
        const isEn = lang === 'en';
        const isUk = lang === 'uk';
        const msg = enabled
          ? (this.t('finance_enabled_toast') || (isEn ? 'Finance tracking enabled! 💰' : (isUk ? 'Облік фінансів увімкнено! 💰' : 'Учет финансов включен! 💰')))
          : (this.t('finance_disabled_toast') || (isEn ? 'Finance tracking disabled' : (isUk ? 'Облік фінансів вимкнено' : 'Учет финансов отключен')));
        this.showToast(msg, enabled ? '💰' : null);
        if (enabled && this.moduleCardFinance && !this.moduleCardFinance.classList.contains('expanded')) {
          this.toggleModuleCard('moduleCardFinance', 'financeSubSettings', 'btnExpandFinanceModule');
        }
      };
    }

    if (this.toggleFinanceStamp) {
      this.toggleFinanceStamp.onchange = (e) => {
        this.financeTracker.updateSettings({ showArchiveStamp: e.target.checked });
        this.updateFinanceArchiveStamp();
      };
    }

    if (this.financeCurrencySelect) {
      this.financeCurrencySelect.onchange = (e) => {
        const [curr, sym] = e.target.value.split('|');
        this.financeTracker.updateSettings({ currency: curr, currencySymbol: sym || curr });
        this.updateFinanceWidget();
        this.updateFinanceArchiveStamp();
        this.renderFinanceModalContent();
      };
    }

    if (this.financeInitialBalanceInput) {
      const updateBalance = (e) => {
        const val = parseFloat((e.target.value || '').replace(',', '.')) || 0;
        this.financeTracker.updateSettings({ initialBalance: val });
        this.renderFinanceModalContent();
        this.syncWithNativeWidget?.();
      };
      this.financeInitialBalanceInput.onchange = updateBalance;
      this.financeInitialBalanceInput.oninput = updateBalance;
    }

    if (this.btnOpenFinanceFromSettings) {
      this.btnOpenFinanceFromSettings.addEventListener('click', () => {
        triggerHaptic(20);
        this.closeSettingsModal();
        this.openFinanceModal();
      });
    }

  }

  // Toggle expand / collapse for settings module cards
  toggleModuleCard(cardId, subSettingsId, btnExpandId) {
    const card = document.getElementById(cardId);
    const body = document.getElementById(subSettingsId);
    const btn = document.getElementById(btnExpandId);
    if (!card || !body) return;

    const isExpanded = card.classList.toggle('expanded');
    body.style.display = isExpanded ? 'flex' : 'none';
    if (btn) {
      btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      const lang = this.settings?.lang || 'ru';
      const isEn = lang === 'en';
      const isUk = lang === 'uk';
      const title = isExpanded
        ? (isEn ? 'Collapse' : (isUk ? 'Згорнути' : 'Свернуть'))
        : (isEn ? 'Expand' : (isUk ? 'Розгорнути' : 'Развернуть'));
      btn.title = title;
      btn.setAttribute('aria-label', title);
    }
    triggerHaptic(15);
  }

  // Collapse all settings sections & module cards (e.g. on opening settings)
  collapseAllModuleCards() {
    const items = [
      { cardId: 'fontSettingsSection', subSettingsId: 'fontSettingsBody', btnExpandId: 'btnExpandFontSettings' },
      { cardId: 'notifSettingsSection', subSettingsId: 'notifSettingsBody', btnExpandId: 'btnExpandNotifSettings' },
      { cardId: 'backupSettingsSection', subSettingsId: 'backupSettingsBody', btnExpandId: 'btnExpandBackupSettings' },
      { cardId: 'moduleCardCycle', subSettingsId: 'cycleSubSettings', btnExpandId: 'btnExpandCycleModule' },
      { cardId: 'moduleCardFinance', subSettingsId: 'financeSubSettings', btnExpandId: 'btnExpandFinanceModule' },
      { cardId: 'moduleCardNutrition', subSettingsId: 'nutritionSubSettings', btnExpandId: 'btnExpandNutritionModule' }
    ];
    const lang = this.settings?.lang || 'ru';
    const isEn = lang === 'en';
    const isUk = lang === 'uk';
    const expandTitle = isEn ? 'Expand' : (isUk ? 'Розгорнути' : 'Развернуть');

    items.forEach(({ cardId, subSettingsId, btnExpandId }) => {
      const card = document.getElementById(cardId);
      const body = document.getElementById(subSettingsId);
      const btn = document.getElementById(btnExpandId);
      if (card) card.classList.remove('expanded');
      if (body) body.style.display = 'none';
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.title = expandTitle;
        btn.setAttribute('aria-label', expandTitle);
      }
    });
  }

  // Alias for semantic clarity
  collapseAllSettingsSections() {
    this.collapseAllModuleCards();
  }

  toggleSettingsSection(cardId, subSettingsId, btnExpandId) {
    this.toggleModuleCard(cardId, subSettingsId, btnExpandId);
  }

  getFinanceCategoryName(cat) {
    if (!cat) return this.t('finance_category_other') || 'Другое';
    if (cat.customName) return cat.customName;
    if (cat.isCustom && cat.name) return cat.name;
    if (!cat.id) return cat.name || '';
    const key = 'finance_category_' + cat.id.replace('cat_', '');
    const localized = this.t(key);
    if (localized && localized !== key) {
      return localized;
    }
    return cat.name || '';
  }

  updateFinanceWidget() {
    if (!this.widgetFinance) return;
    if (!this.financeTracker || !this.financeTracker.isEnabled()) {
      this.widgetFinance.style.display = 'none';
      this.updateModulesHubState?.();
      return;
    }

    this.widgetFinance.style.display = 'flex';
    const targetDate = this.selectedDate || this.getTodayDateString();
    const stats = this.financeTracker.getStatsForPeriod('month', targetDate);

    if (this.widgetFinanceSymbol) {
      this.widgetFinanceSymbol.textContent = this.financeTracker.getCurrencySymbol() || '₴';
    }

    if (this.widgetFinanceRing) {
      this.widgetFinanceRing.innerHTML = this.financeTracker.generateDonutSvg(stats.expenseBreakdown, {
        size: 52,
        strokeWidth: 4.8,
        isWidget: true
      });
    }

    const cur = this.financeTracker.getCurrency();
    const spentText = stats.totalExpense > 0 
      ? `-${this.financeTracker.formatMoney(stats.totalExpense)} ${cur}` 
      : `0 ${cur}`;
    this.widgetFinance.title = `${this.t('finance_title')}: ${spentText}`;
    this.updateModulesHubState?.();
  }

  updateFinanceArchiveStamp() {
    if (!this.notebookFinanceStamp) return;
    if (!this.financeTracker || !this.financeTracker.isEnabled() || this.financeTracker.getSettings().showArchiveStamp === false) {
      this.notebookFinanceStamp.style.display = 'none';
      return;
    }

    const todayStr = this.getTodayDateString();
    const isPastDay = this.selectedDate && this.selectedDate < todayStr;

    // Show stamp exclusively on archive past days
    if (!isPastDay) {
      this.notebookFinanceStamp.style.display = 'none';
      return;
    }

    const stats = this.financeTracker.getStatsForPeriod('day', this.selectedDate);
    // Show only if expenses or transactions occurred on that day, keeping empty days clean
    if (stats.transactionCount === 0 && stats.totalExpense === 0) {
      this.notebookFinanceStamp.style.display = 'none';
      return;
    }

    this.notebookFinanceStamp.innerHTML = this.financeTracker.generateArchiveStampSvg(stats, this.financeTracker.getCurrency());
    this.notebookFinanceStamp.style.display = 'block';
  }

  openFinanceModal(initialPeriod = null, initialTab = null) {
    this.dismissActiveKeyboard();
    if (!this.financeModalBackdrop) return;
    this._financeModalOpenedAt = Date.now();

    const sheet = this.financeModalBackdrop.querySelector('.finance-sheet');
    if (sheet) {
      sheet.classList.toggle('is-archive-mode', !!this.isFinanceArchiveMode);
    }

    if (this.isFinanceArchiveMode) {
      this.financeActivePeriod = initialPeriod || 'day';
      this.financeActiveTab = initialTab || 'overview';
    } else {
      this.financeActivePeriod = initialPeriod || 'month';
      this.financeActiveTab = initialTab || 'overview';
    }

    // Synchronize period pills
    if (this.financePeriodPills) {
      this.financePeriodPills.querySelectorAll('.finance-period-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.period === this.financeActivePeriod);
      });
    }

    // Synchronize view tabs
    if (this.financeViewTabs) {
      this.financeViewTabs.querySelectorAll('.finance-view-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === this.financeActiveTab);
      });
    }

    // Synchronize tab panes
    if (this.financePaneOverview) {
      this.financePaneOverview.classList.toggle('active', this.financeActiveTab === 'overview');
      this.financePaneOverview.style.display = this.financeActiveTab === 'overview' ? 'flex' : 'none';
    }
    if (this.financePaneHistory) {
      this.financePaneHistory.classList.toggle('active', this.financeActiveTab === 'history');
      this.financePaneHistory.style.display = this.financeActiveTab === 'history' ? 'flex' : 'none';
    }
    if (this.financePaneCategories) {
      this.financePaneCategories.classList.toggle('active', this.financeActiveTab === 'categories');
      this.financePaneCategories.style.display = this.financeActiveTab === 'categories' ? 'flex' : 'none';
    }

    this.financeModalBackdrop.classList.add('open');
    this.financeModalBackdrop.setAttribute('aria-hidden', 'false');

    this.renderFinanceModalContent();
  }

  closeFinanceModal() {
    if (this.financeModalBackdrop) {
      this.financeModalBackdrop.classList.remove('open');
      this.financeModalBackdrop.setAttribute('aria-hidden', 'true');
      const sheet = this.financeModalBackdrop.querySelector('.finance-sheet');
      if (sheet) sheet.classList.remove('is-archive-mode');
    }
    if (this.financeHeaderDate) {
      this.financeHeaderDate.textContent = '';
      this.financeHeaderDate.style.display = 'none';
    }
    this.financeActivePeriod = 'month';
    this.financeActiveTab = 'overview';
    this.isFinanceArchiveMode = false;
    this.financeActiveDonutCatId = null;
    this._clearFinanceDonutFocus?.();
  }

  renderFinanceModalContent() {
    if (!this.financeTracker) return;
    const cur = this.financeTracker.getCurrency();
    const sym = this.financeTracker.getCurrencySymbol();
    const targetDate = this.selectedDate || this.getTodayDateString();
    const todayStr = this.getTodayDateString();

    const sheet = this.financeModalBackdrop ? this.financeModalBackdrop.querySelector('.finance-sheet') : null;
    if (sheet) {
      sheet.classList.toggle('is-archive-mode', !!this.isFinanceArchiveMode);
    }

    // 1. Calculate and display Period Subtitle & Header Date
    if (this.financeHeaderDate) {
      if (this.isFinanceArchiveMode) {
        this.financeHeaderDate.textContent = targetDate;
        this.financeHeaderDate.style.display = 'inline-flex';
      } else {
        this.financeHeaderDate.textContent = '';
        this.financeHeaderDate.style.display = 'none';
      }
    }

    if (this.financePeriodSublabel) {
      let sublabel = '';
      if (this.isFinanceArchiveMode) {
        sublabel = targetDate;
      } else if (this.financeActivePeriod === 'day') {
        const isToday = targetDate === todayStr;
        const formatted = this.formatFriendlyDate ? this.formatFriendlyDate(targetDate) : targetDate;
        sublabel = isToday ? `Сегодня, ${formatted}` : formatted;
      } else if (this.financeActivePeriod === 'week') {
        const stats = this.financeTracker.getStatsForPeriod('week', targetDate);
        sublabel = `${stats.startDate} — ${stats.endDate}`;
      } else if (this.financeActivePeriod === 'month') {
        const [y, m] = targetDate.split('-');
        const monthNamesRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const mIdx = parseInt(m, 10) - 1;
        sublabel = `${monthNamesRu[mIdx] || m} ${y} г.`;
      } else {
        sublabel = this.t('finance_period_all_time') || 'За всё время';
      }
      this.financePeriodSublabel.textContent = sublabel;
    }

    // 2. Period Statistics & Overall Balance Card
    const bal = this.financeTracker.getBalance();
    const stats = this.financeTracker.getStatsForPeriod(this.isFinanceArchiveMode ? 'day' : this.financeActivePeriod, targetDate);

    if (this.financeBalanceTotal) {
      this.financeBalanceTotal.textContent = `${this.financeTracker.formatMoney(bal.currentBalance)} ${cur}`;
    }
    if (this.financeBalanceIncome) {
      this.financeBalanceIncome.textContent = `+${this.financeTracker.formatMoney(stats.totalIncome)} ${cur}`;
    }
    if (this.financeBalanceExpense) {
      this.financeBalanceExpense.textContent = `-${this.financeTracker.formatMoney(stats.totalExpense)} ${cur}`;
    }

    // 3. Tab 1: Overview (Donut Wheel + Categories Breakdown) - Always updated to keep sectors in sync!
    if (this.financeDonutCenterVal) {
      this.financeDonutCenterVal.textContent = this.financeTracker.formatMoney(stats.totalExpense);
    }
    if (this.financeDonutCenterSymbol) {
      this.financeDonutCenterSymbol.textContent = sym;
    }
    if (this.financeDonutCenterSub) {
      this.financeDonutCenterSub.textContent = (this.t('finance_expense_label') || 'расходы').toUpperCase();
    }

    if (this.financeDonutWrapper) {
      const oldSvg = this.financeDonutWrapper.querySelector('.finance-donut-svg');
      if (oldSvg) oldSvg.remove();
      const donutHtml = this.financeTracker.generateDonutSvg(stats.expenseBreakdown, {
        size: 220,
        strokeWidth: 16,
        showIcons: true
      });
      this.financeDonutWrapper.insertAdjacentHTML('afterbegin', donutHtml);

      const svg = this.financeDonutWrapper.querySelector('.finance-donut-svg');
      if (svg) {
        this.setupFinanceDonutInteractions(svg, cur, stats);
      }
    }

    if (this.financeOverviewBreakdown) {
      this.financeOverviewBreakdown.innerHTML = '';
    }

    // 4. Tab 2: History (Period-aware with full-width notebook rows & swipe-to-action)
    if (this.financeHistoryHeaderBar) {
      this.financeHistoryHeaderBar.style.display = this.isFinanceArchiveMode ? 'flex' : 'none';
      if (this.financeArchiveHistoryTitle) {
        this.financeArchiveHistoryTitle.textContent = `${targetDate}`;
      }
    }

    if (this.financeActiveTab === 'history' && this.financeHistoryList) {
      this.financeHistoryList.innerHTML = '';
      let txs = this.financeTracker.getTransactions({
        period: this.isFinanceArchiveMode ? 'day' : this.financeActivePeriod,
        refDate: targetDate
      });

      // Render category filter horizontal strip (icons only)
      this.renderFinanceCategoryFilterBar();

      // Apply category filter if active
      if (this.financeHistoryCategoryFilter) {
        txs = txs.filter(t => t && t.categoryId === this.financeHistoryCategoryFilter);
      }

      if (txs.length === 0) {
        if (this.financeHistoryCategoryFilter) {
          const filterCat = this.financeTracker.getCategory(this.financeHistoryCategoryFilter);
          const filterCatName = filterCat ? this.getFinanceCategoryName(filterCat) : '';
          this.financeHistoryList.innerHTML = `
            <div class="finance-history-empty-filter">
              <span style="font-size: 28px;">🔍</span>
              <div class="empty-text">Нет операций в категории «${this.escapeHtml(filterCatName)}» за этот период</div>
              <button type="button" class="btn-reset-cat-filter" id="btnResetFinanceCatFilter">Показать все операции</button>
            </div>
          `;
          const resetBtn = this.financeHistoryList.querySelector('#btnResetFinanceCatFilter');
          if (resetBtn) {
            resetBtn.addEventListener('click', () => {
              triggerHaptic(15);
              this.financeHistoryCategoryFilter = null;
              this.renderFinanceModalContent();
            });
          }
        } else {
          this.financeHistoryList.innerHTML = `
            <div style="text-align: center; color: #94a3b8; font-size: 13.5px; padding: 36px 16px; background: rgba(255,255,255,0.6); border: 1.5px dashed #e2e8f0; border-radius: 16px;">
              ${this.t('finance_no_history') || 'Нет записей за этот период'}
            </div>
          `;
        }
      } else {
        txs.forEach(t => {
          const rawCat = this.financeTracker.getCategory(t.categoryId);
          const catName = rawCat ? this.getFinanceCategoryName(rawCat) : (this.t('finance_category_other') || 'Другое');
          const iconIdx = rawCat ? rawCat.iconIndex : 0;
          const color = rawCat ? rawCat.color : '#94a3b8';
          const isIncome = t.type === 'income';

          const wrapper = document.createElement('div');
          wrapper.className = 'finance-history-row-wrapper' + (this.isFinanceArchiveMode ? ' read-only' : '');
          wrapper.dataset.id = t.id;

          if (this.isFinanceArchiveMode) {
            // Strictly read-only row: no swipe buttons, no edit modal
            wrapper.innerHTML = `
              <div class="finance-history-row">
                <div class="finance-history-icon-box" style="border-color: ${color}55">
                  <img src="assets/finance_icons/fin_icon_${iconIdx}.png" alt="${this.escapeHtml(catName)}">
                </div>
                <div class="finance-history-info">
                  <span class="finance-history-cat">${this.escapeHtml(catName)}</span>
                  ${t.note ? `<span class="finance-history-note" title="${this.escapeHtml(t.note)}">${this.escapeHtml(t.note)}</span>` : ''}
                  <span class="finance-history-date">${t.date}</span>
                </div>
                <div class="finance-history-amount-box">
                  <span class="finance-history-amount ${t.type}">
                    ${isIncome ? '+' : '-'}${this.financeTracker.formatMoney(t.amount)} ${cur}
                  </span>
                </div>
              </div>
            `;
          } else {
            wrapper.innerHTML = `
              <div class="finance-history-row">
                <div class="finance-history-icon-box" style="border-color: ${color}55">
                  <img src="assets/finance_icons/fin_icon_${iconIdx}.png" alt="${this.escapeHtml(catName)}">
                </div>
                <div class="finance-history-info">
                  <span class="finance-history-cat">${this.escapeHtml(catName)}</span>
                  ${t.note ? `<span class="finance-history-note" title="${this.escapeHtml(t.note)}">${this.escapeHtml(t.note)}</span>` : ''}
                  <span class="finance-history-date">${t.date}</span>
                </div>
                <div class="finance-history-amount-box">
                  <span class="finance-history-amount ${t.type}">
                    ${isIncome ? '+' : '-'}${this.financeTracker.formatMoney(t.amount)} ${cur}
                  </span>
                </div>
              </div>
              <div class="finance-swipe-actions-right">
                <button type="button" class="swipe-action-btn action-edit" data-action="edit" title="${this.t('finance_edit_tx_btn') || 'Редактировать'}" aria-label="Редактировать">
                  <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button type="button" class="swipe-action-btn action-delete" data-action="delete" title="${this.t('delete') || 'Удалить'}" aria-label="Удалить">
                  <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            `;

            const editBtn = wrapper.querySelector('.swipe-action-btn.action-edit');
            if (editBtn) {
              editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerHaptic(15);
                wrapper.classList.remove('open', 'swiping');
                const r = wrapper.querySelector('.finance-history-row');
                const a = wrapper.querySelector('.finance-swipe-actions-right');
                if (r) r.style.transform = '';
                if (a) a.style.transform = '';
                this.openFinanceEntryModal(t.type, t);
              });
            }

            const delBtn = wrapper.querySelector('.swipe-action-btn.action-delete');
            if (delBtn) {
              delBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerHaptic(20);
                const r = wrapper.querySelector('.finance-history-row');
                const a = wrapper.querySelector('.finance-swipe-actions-right');
                wrapper.classList.remove('open', 'swiping');
                if (r) { r.style.transform = ''; r.style.transition = ''; }
                if (a) { a.style.transform = ''; a.style.transition = ''; }

                const cur = this.financeTracker.getCurrency();
                const isExpense = t.type === 'expense';
                const sign = isExpense ? '-' : '+';
                const cat = this.financeTracker.getCategory(t.categoryId);
                const catName = cat ? this.getFinanceCategoryName(cat) : (isExpense ? (this.t('finance_btn_expense') || 'Расход') : (this.t('finance_btn_income') || 'Доход'));

                const title = this.t('finance_delete_tx_title') || 'Удалить запись?';
                const msg = (this.t('finance_delete_tx_confirm') || `Удалить ${isExpense ? 'расход' : 'доход'} ${sign}${this.financeTracker.formatMoney(t.amount)} ${cur} (${catName})?`)
                  .replace('{catName}', catName)
                  .replace('{amount}', this.financeTracker.formatMoney(t.amount))
                  .replace('{cur}', cur);
                const confirmBtnText = this.t('delete') || 'Удалить';
                const deletedToast = this.t('finance_toast_tx_deleted') || 'Запись удалена';

                this.showConfirmModal({
                  title,
                  message: msg,
                  icon: '🗑️',
                  confirmText: confirmBtnText,
                  onConfirm: () => {
                    this.financeTracker.deleteTransaction(t.id);
                    this.renderFinanceModalContent();
                    this.updateFinanceWidget();
                    this.updateFinanceArchiveStamp();
                    this.syncWithNativeWidget?.();
                    this.showToast(deletedToast, '🗑️');
                  }
                });
              });
            }
          }

          this.financeHistoryList.appendChild(wrapper);
        });

        if (!this.isFinanceArchiveMode) {
          this.attachFinanceSwipeEvents();
        }
      }
    }

    // 5. Tab 3: Categories List (with Swipe to Edit & Delete)
    if (this.financeActiveTab === 'categories' && this.financeCategoriesList) {
      this.financeCategoriesList.innerHTML = '';
      const cats = this.financeTracker.getCategories();
      cats.forEach(c => {
        const wrapper = document.createElement('div');
        wrapper.className = 'finance-cat-row-wrapper';
        wrapper.dataset.catId = c.id;
        const localizedName = this.getFinanceCategoryName(c);
        const isIncome = c.type === 'income';
        const expAmt = stats.expenseBreakdown?.find(i => i.categoryId === c.id)?.amount || 0;
        const incAmt = stats.incomeBreakdown?.find(i => i.categoryId === c.id)?.amount || 0;
        const amount = isIncome ? (incAmt || expAmt) : (expAmt || incAmt);
        const sign = amount > 0 ? (isIncome ? '+' : '-') : '';
        const formattedAmount = `${sign}${this.financeTracker.formatMoney(amount)} ${cur}`;

        wrapper.innerHTML = `
          <!-- Left-side action buttons (revealed on right swipe) -->
          <div class="finance-swipe-actions-left">
            <button type="button" class="swipe-action-btn action-edit" data-action="edit" title="${this.t('finance_edit_cat_btn') || 'Редактировать'}" aria-label="Редактировать">
              <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="swipe-action-btn action-delete" data-action="delete" title="${this.t('delete') || 'Удалить'}" aria-label="Удалить">
              <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>

          <!-- Sliding Foreground Category Item -->
          <div class="finance-cat-item">
            <div class="finance-cat-item-left">
              <span class="finance-cat-swatch" style="background: ${c.color}"></span>
              <img src="assets/finance_icons/fin_icon_${c.iconIndex}.png" class="finance-cat-icon-mini" alt="${this.escapeHtml(localizedName)}">
              <span class="finance-cat-item-name">${this.escapeHtml(localizedName)}</span>
            </div>
            <div class="finance-cat-item-right">
              <span class="finance-cat-item-amount ${c.type}${amount > 0 ? ' has-val' : ' zero'}">${formattedAmount}</span>
              <span class="finance-cat-item-badge ${c.type}">${c.type === 'income' ? this.t('finance_btn_income') : this.t('finance_btn_expense')}</span>
            </div>
          </div>

          <!-- Right-side action buttons (revealed on left swipe) -->
          <div class="finance-swipe-actions-right">
            <button type="button" class="swipe-action-btn action-edit" data-action="edit" title="${this.t('finance_edit_cat_btn') || 'Редактировать'}" aria-label="Редактировать">
              <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="swipe-action-btn action-delete" data-action="delete" title="${this.t('delete') || 'Удалить'}" aria-label="Удалить">
              <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        `;

        wrapper.querySelectorAll('.swipe-action-btn.action-edit').forEach(b => {
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic(15);
            wrapper.classList.remove('open-left', 'open-right', 'swiping');
            const row = wrapper.querySelector('.finance-cat-item');
            if (row) row.style.transform = '';
            this.openFinanceCategoryModal(c.id);
          });
        });

        wrapper.querySelectorAll('.swipe-action-btn.action-delete').forEach(b => {
          b.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerHaptic(20);
            wrapper.classList.remove('open-left', 'open-right', 'swiping');
            const row = wrapper.querySelector('.finance-cat-item');
            if (row) { row.style.transform = ''; row.style.transition = ''; }

            const cat = c;
            const activeSameType = this.financeTracker.getCategories(cat.type, false);
            if (activeSameType.length <= 1) {
              triggerHaptic(20);
              this.showToast(this.t('finance_cannot_delete_last_cat') || 'Нельзя удалить последнюю категорию этого типа', '⚠️');
              return;
            }

            const catName = this.getFinanceCategoryName(c);
            const title = this.t('finance_delete_cat_title') || 'Удалить категорию?';
            const msg = (this.t('finance_delete_cat_msg') || `Вы действительно хотите удалить категорию «${catName}»? Прошлые записи в истории сохранятся.`).replace('{catName}', catName);
            const confirmBtnText = this.t('delete') || 'Удалить';
            const deletedToast = (this.t('finance_toast_cat_deleted') || 'Категория удалена') + ` «${catName}»`;

            this.showConfirmModal({
              title,
              message: msg,
              icon: '🗑️',
              confirmText: confirmBtnText,
              onConfirm: () => {
                this.financeTracker.deleteCategory(c.id);
                this.renderFinanceModalContent();
                this.updateFinanceWidget();
                this.updateFinanceArchiveStamp();
                this.syncWithNativeWidget?.();
                this.showToast(deletedToast, '🗑️');
              }
            });
          });
        });

        this.financeCategoriesList.appendChild(wrapper);
      });

      this.attachFinanceCategorySwipeEvents();
    }
  }

  // Smooth mouse, wheel, and touch scrolling for horizontal category filter strip
  initFinanceCatFilterScroll() {
    const slider = this.financeCatFilterScroll;
    if (!slider || this._financeCatFilterScrollInitialized) return;
    this._financeCatFilterScrollInitialized = true;

    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasMoved = false;

    // Mouse drag-to-scroll
    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      isDown = true;
      hasMoved = false;
      this._financeCatFilterDragging = false;
      startX = e.pageX;
      scrollStart = slider.scrollLeft;
      slider.style.scrollBehavior = 'auto';
    };

    slider.addEventListener('mousedown', onMouseDown);

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) {
        hasMoved = true;
        this._financeCatFilterDragging = true;
        slider.classList.add('is-dragging');
      }
      if (hasMoved) {
        slider.scrollLeft = scrollStart - dx;
      }
    });

    const onMouseUp = () => {
      if (isDown) {
        isDown = false;
        slider.style.scrollBehavior = '';
        slider.classList.remove('is-dragging');
        if (hasMoved) {
          setTimeout(() => {
            this._financeCatFilterDragging = false;
          }, 80);
        } else {
          this._financeCatFilterDragging = false;
        }
      }
    };

    window.addEventListener('mouseup', onMouseUp);

    // Touch gesture tracking (prevents accidental category click when swiping on touch screen)
    slider.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      startX = e.touches[0].pageX;
      hasMoved = false;
      this._financeCatFilterDragging = false;
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const dx = e.touches[0].pageX - startX;
      if (Math.abs(dx) > 8) {
        hasMoved = true;
        this._financeCatFilterDragging = true;
      }
    }, { passive: true });

    slider.addEventListener('touchend', () => {
      if (hasMoved) {
        setTimeout(() => {
          this._financeCatFilterDragging = false;
        }, 100);
      } else {
        this._financeCatFilterDragging = false;
      }
    }, { passive: true });

    // Suppress category selection if user dragged/swiped the strip
    slider.addEventListener('click', (e) => {
      if (this._financeCatFilterDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Horizontal mouse wheel on desktop & trackpad
    slider.addEventListener('wheel', (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta !== 0) {
        slider.scrollLeft += delta;
        e.preventDefault();
      }
    }, { passive: false });
  }

  // Render Horizontal Category Filter Strip in History tab (Icons Only)
  renderFinanceCategoryFilterBar() {
    if (!this.financeCatFilterScroll) return;
    this.initFinanceCatFilterScroll();

    const prevScrollLeft = this.financeCatFilterScroll.scrollLeft;
    this.financeCatFilterScroll.innerHTML = '';

    const categories = this.financeTracker.getCategories() || [];

    // 1. "All" button
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'finance-cat-filter-btn filter-all' + (!this.financeHistoryCategoryFilter ? ' active' : '');
    allBtn.dataset.catId = 'all';
    allBtn.title = this.t('all') || 'Все';
    allBtn.setAttribute('aria-label', this.t('all') || 'Все');
    allBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
      </svg>
    `;
    allBtn.addEventListener('click', (e) => {
      if (this._financeCatFilterDragging) return;
      e.stopPropagation();
      triggerHaptic(15);
      if (this.financeHistoryCategoryFilter !== null) {
        this.financeHistoryCategoryFilter = null;
        this.renderFinanceModalContent();
      }
    });
    this.financeCatFilterScroll.appendChild(allBtn);

    // 2. Each category button (ONLY icon, no text)
    categories.forEach(cat => {
      const isSelected = this.financeHistoryCategoryFilter === cat.id;
      const catBtn = document.createElement('button');
      catBtn.type = 'button';
      catBtn.className = 'finance-cat-filter-btn' + (isSelected ? ' active' : '');
      catBtn.dataset.catId = String(cat.id);
      const catName = this.getFinanceCategoryName(cat);
      catBtn.title = catName;
      catBtn.setAttribute('aria-label', catName);
      catBtn.style.setProperty('--cat-border-color', cat.color);

      catBtn.innerHTML = `
        <img src="assets/finance_icons/fin_icon_${cat.iconIndex}.png" alt="${this.escapeHtml(catName)}">
      `;

      catBtn.addEventListener('click', (e) => {
        if (this._financeCatFilterDragging) return;
        e.stopPropagation();
        triggerHaptic(15);
        if (this.financeHistoryCategoryFilter === cat.id) {
          // Toggle off
          this.financeHistoryCategoryFilter = null;
        } else {
          this.financeHistoryCategoryFilter = cat.id;
          this._shouldCenterCatFilterId = cat.id;
        }
        this.renderFinanceModalContent();
      });

      this.financeCatFilterScroll.appendChild(catBtn);
    });

    // Center active button smoothly if selected, or preserve scroll position
    if (this._shouldCenterCatFilterId) {
      const targetId = this._shouldCenterCatFilterId;
      this._shouldCenterCatFilterId = null;
      const targetBtn = this.financeCatFilterScroll.querySelector(`.finance-cat-filter-btn[data-cat-id="${targetId}"]`);
      if (targetBtn) {
        targetBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    } else {
      this.financeCatFilterScroll.scrollLeft = prevScrollLeft;
    }
  }

  setupFinanceDonutInteractions(svg, cur, stats = null) {
    if (!svg) return;

    const sectors = Array.from(svg.querySelectorAll('.finance-donut-sector'));
    const iconGroups = Array.from(svg.querySelectorAll('.finance-donut-icon-group'));
    const defaultSub = (this.t('finance_expense_label') || 'расходы').toUpperCase();
    const totalExpense = (stats && typeof stats.totalExpense === 'number')
      ? stats.totalExpense
      : sectors.reduce((sum, s) => sum + (parseFloat(s.dataset.amount) || 0), 0);

    const updateCenter = (val, sub, color = null) => {
      if (this.financeDonutCenterVal) {
        this.financeDonutCenterVal.textContent = val;
      }
      if (this.financeDonutCenterSub) {
        this.financeDonutCenterSub.textContent = sub;
        this.financeDonutCenterSub.style.color = color || '';
      }
    };

    const updateSelectedBadge = (catId) => {
      if (!catId) {
        if (this.financeSelectedCategoryBadge) {
          this.financeSelectedCategoryBadge.classList.remove('visible');
        }
        updateCenter(this.financeTracker.formatMoney(totalExpense), defaultSub, '');
        return;
      }

      const cat = this.financeTracker.getCategory(catId);
      const targetEl = iconGroups.find(g => String(g.dataset.catId) === String(catId)) ||
                       sectors.find(s => String(s.dataset.catId) === String(catId));

      const catName = cat ? this.getFinanceCategoryName(cat) : (targetEl?.dataset?.name || '');
      const catColor = cat ? cat.color : (targetEl?.getAttribute?.('stroke') || '#3b82f6');
      const iconIdx = cat ? (cat.iconIndex ?? 0) : 0;
      const amt = targetEl?.dataset?.amount;
      const pct = targetEl?.dataset?.percent;

      if (this.financeSelectedCatName) {
        this.financeSelectedCatName.textContent = catName;
      }
      if (this.financeSelectedCatIcon) {
        this.financeSelectedCatIcon.src = `assets/finance_icons/fin_icon_${iconIdx}.png`;
        this.financeSelectedCatIcon.alt = catName;
      }
      if (this.financeSelectedCatIconWrap) {
        this.financeSelectedCatIconWrap.style.borderColor = catColor;
      }
      if (this.financeSelectedCategoryBadge) {
        this.financeSelectedCategoryBadge.classList.add('visible');
      }

      const statsItem = stats?.expenseBreakdown?.find(b => String(b.categoryId) === String(catId));
      const catAmount = statsItem ? statsItem.amount : ((amt !== undefined && amt !== null) ? parseFloat(amt) : 0);
      updateCenter(this.financeTracker.formatMoney(catAmount), (catName || defaultSub).toUpperCase(), catColor);
    };

    const setHighlight = (catId, shouldElevate = false) => {
      const targetId = catId ? String(catId) : null;

      sectors.forEach(sec => {
        if (targetId && String(sec.dataset.catId) === targetId) {
          sec.classList.add('is-focused');
        } else {
          sec.classList.remove('is-focused');
        }
      });

      iconGroups.forEach(grp => {
        if (targetId && String(grp.dataset.catId) === targetId) {
          grp.classList.add('is-focused');
          if (shouldElevate && grp.parentNode) {
            // Elevate active/hovered badge above all other badges in SVG paint order
            grp.parentNode.appendChild(grp);
          }
        } else {
          grp.classList.remove('is-focused');
        }
      });

      updateSelectedBadge(targetId);
    };

    const clearFocus = () => {
      this.financeActiveDonutCatId = null;
      setHighlight(null);
    };

    // Restore existing selection if valid
    if (this.financeActiveDonutCatId) {
      const exists = sectors.some(s => String(s.dataset.catId) === String(this.financeActiveDonutCatId));
      if (exists) {
        setHighlight(this.financeActiveDonutCatId, true);
      } else {
        this.financeActiveDonutCatId = null;
        setHighlight(null);
      }
    } else {
      setHighlight(null);
    }

    this._clearFinanceDonutFocus = clearFocus;

    if (!this._financeDonutDocClickBound) {
      this._financeDonutDocClickBound = true;
      document.addEventListener('pointerdown', (e) => {
        if (!this.financeActiveDonutCatId) return;
        if (e.target.closest && e.target.closest('.finance-donut-sector, .finance-donut-icon-group')) {
          return;
        }
        if (this._clearFinanceDonutFocus) {
          this._clearFinanceDonutFocus();
        }
      });
    }

    const interactiveElements = [...sectors, ...iconGroups];

    interactiveElements.forEach(el => {
      // Hover: mouse / stylus preview
      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        const catId = el.dataset.catId;
        if (catId) {
          setHighlight(catId, true);
        }
      });

      // Hover exit: return to normal or restore locked selection
      el.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'touch') return;
        if (this.financeActiveDonutCatId) {
          setHighlight(this.financeActiveDonutCatId, false);
        } else {
          setHighlight(null);
        }
      });

      // Click / Tap: toggle 2x scale, elevation and show toast
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        const catId = el.dataset.catId;
        if (!catId) return;

        // If clicking already focused category, return sizes to original
        if (this.financeActiveDonutCatId && String(this.financeActiveDonutCatId) === String(catId)) {
          clearFocus();
          return;
        }

        // Lock focus on this category
        this.financeActiveDonutCatId = catId;
        setHighlight(catId, true);

        const cat = this.financeTracker.getCategory(catId);
        const catName = cat ? this.getFinanceCategoryName(cat) : el.dataset.name;
        const amt = el.dataset.amount;
        const pct = el.dataset.percent;
        this.showToast(`${catName}: ${this.financeTracker.formatMoney(parseFloat(amt))} ${cur} (${pct}%)`, '📊');
      });
    });
  }

  // Attach touch and drag swipe gestures for finance history rows (revealing Edit & Delete buttons)
  attachFinanceSwipeEvents() {
    if (!this.financeHistoryList) return;
    const wrappers = this.financeHistoryList.querySelectorAll('.finance-history-row-wrapper');
    let activeOpenWrapper = null;

    const snapOpen = (w) => {
      if (!w) return;
      w.classList.add('open');
      activeOpenWrapper = w;
      const r = w.querySelector('.finance-history-row');
      const a = w.querySelector('.finance-swipe-actions-right');
      if (r) {
        r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        r.style.transform = 'translate3d(-92px, 0, 0)';
      }
      if (a) {
        a.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        a.style.transform = 'translate3d(0px, 0, 0)';
      }
      setTimeout(() => {
        if (w.classList.contains('open') && !w.classList.contains('swiping')) {
          if (r) { r.style.transition = ''; r.style.transform = ''; }
          if (a) { a.style.transition = ''; a.style.transform = ''; }
        }
      }, 240);
    };

    const closeWrapper = (w, animated = true) => {
      if (!w) return;
      const r = w.querySelector('.finance-history-row');
      const a = w.querySelector('.finance-swipe-actions-right');
      if (animated) {
        if (r) {
          r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          r.style.transform = 'translate3d(0, 0, 0)';
        }
        if (a) {
          a.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          a.style.transform = 'translate3d(100%, 0, 0)';
        }
        w.classList.remove('open', 'swiping');
        setTimeout(() => {
          if (!w.classList.contains('open') && !w.classList.contains('swiping')) {
            if (r) { r.style.transition = ''; r.style.transform = ''; }
            if (a) { a.style.transition = ''; a.style.transform = ''; }
          }
        }, 240);
      } else {
        w.classList.remove('open', 'swiping');
        if (r) { r.style.transform = ''; r.style.transition = ''; }
        if (a) { a.style.transform = ''; a.style.transition = ''; }
      }
      if (activeOpenWrapper === w) activeOpenWrapper = null;
    };

    const closeAllSwipes = (animated = true) => {
      wrappers.forEach(w => {
        if (w.classList.contains('open') || w.classList.contains('swiping')) {
          closeWrapper(w, animated);
        }
      });
      activeOpenWrapper = null;
    };

    // Close on outside tap
    const outsideTapHandler = (e) => {
      if (activeOpenWrapper && !activeOpenWrapper.contains(e.target)) {
        closeAllSwipes(true);
      }
    };
    if (this._financeSwipeOutsideHandler) {
      document.removeEventListener('pointerdown', this._financeSwipeOutsideHandler);
    }
    this._financeSwipeOutsideHandler = outsideTapHandler;
    document.addEventListener('pointerdown', this._financeSwipeOutsideHandler, { passive: true });

    wrappers.forEach(wrapper => {
      const row = wrapper.querySelector('.finance-history-row');
      const actionsRight = wrapper.querySelector('.finance-swipe-actions-right');
      if (!row) return;

      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let isHorizontal = null;
      let rafId = null;
      const actionsWidth = 92;
      const openThreshold = -30;

      const handleStart = (clientX, clientY, target) => {
        if (target && target.closest('.swipe-action-btn, button')) {
          return false;
        }
        if (activeOpenWrapper && activeOpenWrapper !== wrapper) {
          closeAllSwipes(true);
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
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            isHorizontal = Math.abs(dx) > Math.abs(dy);
          }
        }

        if (!isHorizontal) return;

        if (!isDragging) {
          isDragging = true;
          try { window.getSelection()?.removeAllRanges(); } catch (err) { }
        }

        if (e && e.cancelable) e.preventDefault();

        const maxLeftSwipe = -actionsWidth;
        let translateX = dx;
        if (wrapper.classList.contains('open')) {
          translateX = maxLeftSwipe + dx;
          if (translateX > 0) {
            translateX = translateX * 0.2;
          } else if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.2;
          }
        } else {
          if (translateX > 0) {
            translateX = translateX * 0.2;
          } else if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.25;
          }
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;
          if (wrapper.classList.contains('open')) {
            const actionsOffset = Math.max(0, actionsWidth + translateX);
            if (actionsRight) actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
          } else {
            if (translateX < 0) {
              const actionsOffset = Math.max(0, actionsWidth + translateX);
              if (actionsRight) actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
            } else {
              if (actionsRight) actionsRight.style.transform = 'translate3d(100%, 0, 0)';
            }
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

        const wasDragging = isDragging;
        isDragging = false;

        if (!wasDragging) {
          if (wrapper.classList.contains('open') && (!target || !target.closest('.finance-swipe-actions-right'))) {
            closeAllSwipes(true);
          }
          return;
        }

        const dx = clientX - startX;
        if (wrapper.classList.contains('open')) {
          if (dx > 25) {
            closeWrapper(wrapper, true);
            triggerHaptic(15);
          } else {
            snapOpen(wrapper);
          }
        } else {
          if (dx < openThreshold) {
            closeAllSwipes(true);
            snapOpen(wrapper);
            triggerHaptic(15);
          } else {
            closeWrapper(wrapper, true);
          }
        }
      };

      // Pointer events for desktop and mobile touch
      if (window.PointerEvent) {
        row.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (!handleStart(e.clientX, e.clientY, e.target)) return;

          const onPointerMove = (moveEvt) => handleMove(moveEvt.clientX, moveEvt.clientY, moveEvt);
          const onPointerUp = (upEvt) => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
            handleEnd(upEvt.clientX, upEvt.target);
          };

          document.addEventListener('pointermove', onPointerMove, { passive: false });
          document.addEventListener('pointerup', onPointerUp, { passive: true });
          document.addEventListener('pointercancel', onPointerUp, { passive: true });
        });
      } else {
        row.addEventListener('touchstart', (e) => {
          const touch = e.touches[0];
          if (!touch || !handleStart(touch.clientX, touch.clientY, e.target)) return;

          const onTouchMove = (moveEvt) => {
            const t = moveEvt.touches[0];
            if (t) handleMove(t.clientX, t.clientY, moveEvt);
          };
          const onTouchEnd = (endEvt) => {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchEnd);
            const t = endEvt.changedTouches[0];
            handleEnd(t ? t.clientX : 0, endEvt.target);
          };

          document.addEventListener('touchmove', onTouchMove, { passive: false });
          document.addEventListener('touchend', onTouchEnd, { passive: true });
          document.addEventListener('touchcancel', onTouchEnd, { passive: true });
        }, { passive: true });
      }
    });
  }

  // Attach touch and drag swipe gestures for finance category rows (revealing Edit & Delete buttons on swipe)
  attachFinanceCategorySwipeEvents() {
    if (!this.financeCategoriesList) return;
    const wrappers = this.financeCategoriesList.querySelectorAll('.finance-cat-row-wrapper');
    if (!wrappers.length) return;
    let activeOpenWrapper = null;
    const actionsWidth = 92;

    const snapOpenLeft = (w) => {
      if (!w) return;
      w.classList.remove('open-right');
      w.classList.add('open-left');
      activeOpenWrapper = w;
      const r = w.querySelector('.finance-cat-item');
      const l = w.querySelector('.finance-swipe-actions-left');
      const rt = w.querySelector('.finance-swipe-actions-right');
      if (r) {
        r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        r.style.transform = `translate3d(${actionsWidth}px, 0, 0)`;
      }
      if (l) {
        l.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        l.style.transform = 'translate3d(0px, 0, 0)';
      }
      if (rt) rt.style.transform = 'translate3d(100%, 0, 0)';
    };

    const snapOpenRight = (w) => {
      if (!w) return;
      w.classList.remove('open-left');
      w.classList.add('open-right');
      activeOpenWrapper = w;
      const r = w.querySelector('.finance-cat-item');
      const l = w.querySelector('.finance-swipe-actions-left');
      const rt = w.querySelector('.finance-swipe-actions-right');
      if (r) {
        r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        r.style.transform = `translate3d(-${actionsWidth}px, 0, 0)`;
      }
      if (rt) {
        rt.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        rt.style.transform = 'translate3d(0px, 0, 0)';
      }
      if (l) l.style.transform = 'translate3d(-100%, 0, 0)';
    };

    const closeWrapper = (w, animated = true) => {
      if (!w) return;
      const r = w.querySelector('.finance-cat-item');
      const l = w.querySelector('.finance-swipe-actions-left');
      const rt = w.querySelector('.finance-swipe-actions-right');
      if (animated) {
        if (r) {
          r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          r.style.transform = 'translate3d(0, 0, 0)';
        }
        if (l) {
          l.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          l.style.transform = 'translate3d(-100%, 0, 0)';
        }
        if (rt) {
          rt.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          rt.style.transform = 'translate3d(100%, 0, 0)';
        }
        w.classList.remove('open-left', 'open-right', 'swiping');
        setTimeout(() => {
          if (!w.classList.contains('open-left') && !w.classList.contains('open-right') && !w.classList.contains('swiping')) {
            if (r) { r.style.transition = ''; r.style.transform = ''; }
            if (l) { l.style.transition = ''; l.style.transform = ''; }
            if (rt) { rt.style.transition = ''; rt.style.transform = ''; }
          }
        }, 240);
      } else {
        w.classList.remove('open-left', 'open-right', 'swiping');
        if (r) { r.style.transform = ''; r.style.transition = ''; }
        if (l) { l.style.transform = ''; l.style.transition = ''; }
        if (rt) { rt.style.transform = ''; rt.style.transition = ''; }
      }
      if (activeOpenWrapper === w) activeOpenWrapper = null;
    };

    const closeAllSwipes = (animated = true) => {
      wrappers.forEach(w => {
        if (w.classList.contains('open-left') || w.classList.contains('open-right')) {
          closeWrapper(w, animated);
        }
      });
      activeOpenWrapper = null;
    };

    const outsideTapHandler = (e) => {
      if (activeOpenWrapper && !e.target.closest('.finance-cat-row-wrapper')) {
        closeAllSwipes(true);
      }
    };

    if (this._financeCatSwipeOutsideHandler) {
      document.removeEventListener('pointerdown', this._financeCatSwipeOutsideHandler);
    }
    this._financeCatSwipeOutsideHandler = outsideTapHandler;
    document.addEventListener('pointerdown', this._financeCatSwipeOutsideHandler, { passive: true });

    wrappers.forEach(wrapper => {
      const row = wrapper.querySelector('.finance-cat-item');
      const leftActions = wrapper.querySelector('.finance-swipe-actions-left');
      const rightActions = wrapper.querySelector('.finance-swipe-actions-right');
      if (!row) return;

      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let isHorizontal = null;
      let rafId = null;

      const handleStart = (clientX, clientY, target) => {
        if (target && target.closest('.swipe-action-btn, button')) return false;
        if (activeOpenWrapper && activeOpenWrapper !== wrapper) {
          closeAllSwipes(true);
        }
        startX = clientX;
        startY = clientY;
        isDragging = false;
        isHorizontal = null;
        wrapper.classList.add('swiping');
        if (row) row.style.transition = 'none';
        if (leftActions) leftActions.style.transition = 'none';
        if (rightActions) rightActions.style.transition = 'none';
        return true;
      };

      const handleMove = (clientX, clientY, e) => {
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (isHorizontal === null) {
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            isHorizontal = Math.abs(dx) > Math.abs(dy);
          }
        }
        if (!isHorizontal) return;

        if (!isDragging) {
          isDragging = true;
          try { window.getSelection()?.removeAllRanges(); } catch (err) { }
        }
        if (e && e.cancelable) e.preventDefault();

        let translateX = dx;
        if (wrapper.classList.contains('open-left')) {
          translateX = actionsWidth + dx;
        } else if (wrapper.classList.contains('open-right')) {
          translateX = -actionsWidth + dx;
        }

        if (translateX > actionsWidth) {
          translateX = actionsWidth + (translateX - actionsWidth) * 0.25;
        } else if (translateX < -actionsWidth) {
          translateX = -actionsWidth + (translateX + actionsWidth) * 0.25;
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;
          if (translateX > 0) {
            const leftOffset = Math.min(0, -actionsWidth + translateX);
            if (leftActions) leftActions.style.transform = `translate3d(${leftOffset}px, 0, 0)`;
            if (rightActions) rightActions.style.transform = 'translate3d(100%, 0, 0)';
          } else {
            const rightOffset = Math.max(0, actionsWidth + translateX);
            if (rightActions) rightActions.style.transform = `translate3d(${rightOffset}px, 0, 0)`;
            if (leftActions) leftActions.style.transform = 'translate3d(-100%, 0, 0)';
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
        if (leftActions) leftActions.style.transition = '';
        if (rightActions) rightActions.style.transition = '';

        const wasDragging = isDragging;
        isDragging = false;

        if (!wasDragging) {
          if (activeOpenWrapper && (!target || !target.closest('.swipe-action-btn'))) {
            closeAllSwipes(true);
          }
          return;
        }

        const dx = clientX - startX;
        if (wrapper.classList.contains('open-left')) {
          if (dx < -25) {
            closeWrapper(wrapper, true);
            triggerHaptic(15);
          } else {
            snapOpenLeft(wrapper);
          }
        } else if (wrapper.classList.contains('open-right')) {
          if (dx > 25) {
            closeWrapper(wrapper, true);
            triggerHaptic(15);
          } else {
            snapOpenRight(wrapper);
          }
        } else {
          if (dx > 25) {
            closeAllSwipes(true);
            snapOpenLeft(wrapper);
            triggerHaptic(15);
          } else if (dx < -25) {
            closeAllSwipes(true);
            snapOpenRight(wrapper);
            triggerHaptic(15);
          } else {
            closeWrapper(wrapper, true);
          }
        }
      };

      if (window.PointerEvent) {
        row.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (!handleStart(e.clientX, e.clientY, e.target)) return;
          const onPointerMove = (moveEvt) => handleMove(moveEvt.clientX, moveEvt.clientY, moveEvt);
          const onPointerUp = (upEvt) => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
            handleEnd(upEvt.clientX, upEvt.target);
          };
          document.addEventListener('pointermove', onPointerMove, { passive: false });
          document.addEventListener('pointerup', onPointerUp, { passive: true });
          document.addEventListener('pointercancel', onPointerUp, { passive: true });
        });
      } else {
        row.addEventListener('touchstart', (e) => {
          const touch = e.touches[0];
          if (!touch || !handleStart(touch.clientX, touch.clientY, e.target)) return;
          const onTouchMove = (moveEvt) => {
            const t = moveEvt.touches[0];
            if (t) handleMove(t.clientX, t.clientY, moveEvt);
          };
          const onTouchEnd = (endEvt) => {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchEnd);
            const t = endEvt.changedTouches[0];
            handleEnd(t ? t.clientX : 0, endEvt.target);
          };
          document.addEventListener('touchmove', onTouchMove, { passive: false });
          document.addEventListener('touchend', onTouchEnd, { passive: true });
          document.addEventListener('touchcancel', onTouchEnd, { passive: true });
        }, { passive: true });
      }
    });
  }

  openFinanceEntryModal(type = 'expense', txToEdit = null) {
    this.dismissActiveKeyboard();
    if (!this.financeEntryModalBackdrop) return;
    this.financeEntryType = type;
    this.financeEditingTxId = txToEdit ? txToEdit.id : null;
    this._financeEntryModalOpenedAt = Date.now();

    if (this.financeEntryModalTitle) {
      if (txToEdit) {
        this.financeEntryModalTitle.textContent = this.t('finance_entry_title_edit') || 'Редактировать запись';
      } else {
        this.financeEntryModalTitle.textContent = type === 'expense' 
          ? this.t('finance_entry_title_expense') 
          : this.t('finance_entry_title_income');
      }
    }

    if (this.financeEntryCurrencyBadge) {
      this.financeEntryCurrencyBadge.textContent = this.financeTracker.getCurrency();
    }

    if (this.financeEntryAmountInput) {
      this.financeEntryAmountInput.value = txToEdit ? txToEdit.amount : '';
    }

    if (this.financeEntryNoteInput) {
      this.financeEntryNoteInput.value = txToEdit ? (txToEdit.note || '') : '';
    }

    // Set date in date picker
    const targetDate = txToEdit ? txToEdit.date : (this.selectedDate || this.getTodayDateString());
    if (this.financeEntryDateInput) {
      this.financeEntryDateInput.value = targetDate;
    }

    if (this.btnFinanceEntryDelete) {
      this.btnFinanceEntryDelete.style.display = txToEdit ? 'flex' : 'none';
    }

    // Populate category cards
    const cats = this.financeTracker.getCategories(type);
    if (txToEdit && txToEdit.categoryId && !cats.some(c => c.id === txToEdit.categoryId)) {
      const deletedCat = this.financeTracker.getCategory(txToEdit.categoryId);
      if (deletedCat) cats.unshift(deletedCat);
    }
    const selectedCatId = txToEdit ? txToEdit.categoryId : (cats[0]?.id || null);
    this.financeSelectedCatId = selectedCatId;

    if (this.financeEntryCatsGrid) {
      this.financeEntryCatsGrid.innerHTML = '';
      const dotsContainer = document.getElementById('financeCatsDots');
      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        dotsContainer.style.display = 'none';
      }

      const PAGE_SIZE = 9; // 3 columns x 3 rows
      const totalPages = Math.ceil(cats.length / PAGE_SIZE) || 1;
      let selectedPageIndex = 0;

      for (let p = 0; p < totalPages; p++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'finance-entry-cats-page';
        pageDiv.dataset.page = p;

        const pageCats = cats.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE);
        pageCats.forEach((c) => {
          const isSelected = c.id === selectedCatId;
          if (isSelected) selectedPageIndex = p;
          const localizedName = this.getFinanceCategoryName(c);
          const card = document.createElement('div');
          card.className = `finance-cat-card ${isSelected ? 'selected' : ''}`;
          card.dataset.catId = c.id;
          card.style.setProperty('--cat-border-color', c.color);
          card.innerHTML = `
            <img src="assets/finance_icons/fin_icon_${c.iconIndex}.png" alt="${this.escapeHtml(localizedName)}">
            <span>${this.escapeHtml(localizedName)}</span>
          `;
          card.addEventListener('click', () => {
            triggerHaptic(15);
            this.financeEntryCatsGrid.querySelectorAll('.finance-cat-card').forEach(cd => cd.classList.remove('selected'));
            card.classList.add('selected');
            this.financeSelectedCatId = c.id;
          });
          pageDiv.appendChild(card);
        });

        this.financeEntryCatsGrid.appendChild(pageDiv);
      }

      if (totalPages > 1 && dotsContainer) {
        dotsContainer.style.display = 'flex';
        for (let p = 0; p < totalPages; p++) {
          const dot = document.createElement('span');
          dot.className = `finance-cat-dot ${p === selectedPageIndex ? 'active' : ''}`;
          dot.dataset.page = p;
          dot.addEventListener('click', () => {
            triggerHaptic(10);
            const targetX = p * this.financeEntryCatsGrid.clientWidth;
            this.financeEntryCatsGrid.scrollTo({ left: targetX, behavior: 'smooth' });
          });
          dotsContainer.appendChild(dot);
        }

        this.financeEntryCatsGrid.onscroll = () => {
          const w = this.financeEntryCatsGrid.clientWidth || 1;
          const curPage = Math.round(this.financeEntryCatsGrid.scrollLeft / w);
          dotsContainer.querySelectorAll('.finance-cat-dot').forEach((d, idx) => {
            d.classList.toggle('active', idx === curPage);
          });
        };

        if (selectedPageIndex > 0) {
          requestAnimationFrame(() => {
            this.financeEntryCatsGrid.scrollLeft = selectedPageIndex * this.financeEntryCatsGrid.clientWidth;
          });
        }
      } else {
        this.financeEntryCatsGrid.onscroll = null;
        this.financeEntryCatsGrid.scrollLeft = 0;
      }
    }

    this.financeEntryModalBackdrop.classList.add('open');
    this.financeEntryModalBackdrop.setAttribute('aria-hidden', 'false');
    this.dismissActiveKeyboard();
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  closeFinanceEntryModal() {
    this.closeFinanceDatePicker();
    this.financeEditingTxId = null;
    if (this.financeEntryModalBackdrop) {
      this.financeEntryModalBackdrop.classList.remove('open');
      this.financeEntryModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  saveFinanceEntry() {
    if (!this.financeTracker || !this.financeEntryAmountInput) return;
    const rawVal = (this.financeEntryAmountInput.value || '').replace(',', '.');
    const amt = parseFloat(rawVal);
    if (isNaN(amt) || amt <= 0) {
      this.showToast(this.t('finance_toast_invalid_amount') || 'Введите корректную сумму', '⚠️');
      this.financeEntryAmountInput.focus();
      return;
    }

    const note = this.financeEntryNoteInput ? this.financeEntryNoteInput.value.trim() : '';
    const dateStr = (this.financeEntryDateInput && this.financeEntryDateInput.value) 
      ? this.financeEntryDateInput.value 
      : (this.selectedDate || this.getTodayDateString());

    const cur = this.financeTracker.getCurrency();
    const sign = this.financeEntryType === 'expense' ? '-' : '+';
    const typeWord = this.financeEntryType === 'expense' 
      ? (this.t('finance_btn_expense') || 'Расход') 
      : (this.t('finance_btn_income') || 'Доход');

    if (this.financeEditingTxId) {
      this.financeTracker.updateTransaction(this.financeEditingTxId, {
        date: dateStr,
        amount: amt,
        categoryId: this.financeSelectedCatId,
        type: this.financeEntryType,
        note
      });
      triggerHaptic(20);
      this.showToast(this.t('finance_tx_updated') || 'Запись обновлена! ✨', '💰');
    } else {
      this.financeTracker.addTransaction({
        date: dateStr,
        amount: amt,
        categoryId: this.financeSelectedCatId,
        type: this.financeEntryType,
        note
      });
      triggerHaptic([20, 50, 20]);
      this.showToast(`${typeWord}: ${sign}${this.financeTracker.formatMoney(amt)} ${cur}`, '💰');
    }

    this.financeEditingTxId = null;
    this.closeFinanceEntryModal();
    this.updateFinanceWidget();
    this.updateFinanceArchiveStamp();
    this.renderFinanceModalContent();
    this.syncWithNativeWidget?.();
  }

  openFinanceDatePicker() {
    this.dismissActiveKeyboard();
    if (!this.financeDatePickerModalBackdrop) return;
    this._financeDatePickerOpenedAt = Date.now();

    let currentVal = (this.financeEntryDateInput && this.financeEntryDateInput.value) 
      ? this.financeEntryDateInput.value.trim() 
      : '';
    if (!currentVal || !/^\d{4}-\d{2}-\d{2}$/.test(currentVal)) {
      currentVal = this.selectedDate || this.getTodayDateString();
    }

    this.financePickerTempDate = currentVal;
    const parts = currentVal.split('-').map(Number);
    this.financePickerDisplayedMonth = {
      year: parts[0],
      month: parts[1] - 1
    };

    this.renderFinanceDatePicker();
    this.financeDatePickerModalBackdrop.classList.add('open');
    this.financeDatePickerModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeFinanceDatePicker() {
    if (this.financeDatePickerModalBackdrop) {
      this.financeDatePickerModalBackdrop.classList.remove('open');
      this.financeDatePickerModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  confirmFinanceDatePicker(dateStr = null) {
    const finalDate = dateStr || this.financePickerTempDate || this.getTodayDateString();
    if (this.financeEntryDateInput) {
      this.financeEntryDateInput.value = finalDate;
    }
    this.closeFinanceDatePicker();
  }

  renderFinanceDatePicker() {
    if (!this.financeDatePickerDaysGrid || !this.financePickerDisplayedMonth) return;

    const { year: currentYear, month: currentMonth } = this.financePickerDisplayedMonth;
    const lang = (window.Plan4UI18n && Plan4UI18n.currentLang) ? Plan4UI18n.currentLang : 'ru';
    const dict = (window.Plan4UI18n && Plan4UI18n.translations && Plan4UI18n.translations[lang])
      ? Plan4UI18n.translations[lang]
      : {};

    const monthNames = dict.monthsNominative || ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    if (this.financeDateMonthTitle) {
      this.financeDateMonthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Dynamic weekday names localization (Monday to Sunday)
    if (this.financeDatePickerModalBackdrop) {
      const weekdaysHeader = this.financeDatePickerModalBackdrop.querySelector('.calendar-weekdays');
      if (weekdaysHeader) {
        const daysShort = dict.weekdaysShort || ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        weekdaysHeader.innerHTML = daysShort.map(d => `<span>${this.escapeHtml(d)}</span>`).join('');
      }
    }

    this.financeDatePickerDaysGrid.innerHTML = '';

    const todayStr = this.getTodayDateString();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Monday is 0
    let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    // Previous month padding days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.textContent = pDay;

      const prevDate = new Date(currentYear, currentMonth - 1, pDay);
      const pDateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
      cell.onclick = () => {
        triggerHaptic(15);
        this.financePickerTempDate = pDateStr;
        this.financePickerDisplayedMonth = {
          year: prevDate.getFullYear(),
          month: prevDate.getMonth()
        };
        this.renderFinanceDatePicker();
      };
      this.financeDatePickerDaysGrid.appendChild(cell);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const cell = document.createElement('div');
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === this.financePickerTempDate;

      cell.className = `calendar-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
      cell.textContent = day;

      cell.onclick = () => {
        triggerHaptic(15);
        this.confirmFinanceDatePicker(dateStr);
      };

      this.financeDatePickerDaysGrid.appendChild(cell);
    }

    // Next month padding days to fill grid
    const totalRendered = startDayOfWeek + daysInMonth;
    const remaining = totalRendered % 7 === 0 ? 0 : 7 - (totalRendered % 7);
    for (let i = 1; i <= remaining; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.textContent = i;

      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const nDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cell.onclick = () => {
        triggerHaptic(15);
        this.financePickerTempDate = nDateStr;
        this.financePickerDisplayedMonth = {
          year: nextDate.getFullYear(),
          month: nextDate.getMonth()
        };
        this.renderFinanceDatePicker();
      };
      this.financeDatePickerDaysGrid.appendChild(cell);
    }
  }

  openFinanceCategoryModal(catId = null) {
    this.dismissActiveKeyboard();
    if (!this.financeCategoryModalBackdrop) return;
    this._financeCatModalOpenedAt = Date.now();

    this.financeEditingCatId = catId;
    const cat = catId ? this.financeTracker.getCategory(catId) : null;

    if (this.btnFinanceCategoryDelete) {
      this.btnFinanceCategoryDelete.style.display = catId ? 'flex' : 'none';
    }

    if (this.financeCategoryModalTitle) {
      this.financeCategoryModalTitle.textContent = cat 
        ? this.t('finance_edit_category_title') 
        : this.t('finance_new_category_title');
    }

    this.financeNewCatType = cat ? cat.type : 'expense';
    const hasTransactions = catId ? this.financeTracker.data.transactions.some(t => t.categoryId === catId) : false;
    const lockHint = this.t('finance_cat_type_locked_hint') || 'Тип нельзя изменить: по этой категории есть операции';

    if (this.btnCatTypeExpense) {
      this.btnCatTypeExpense.classList.toggle('active', this.financeNewCatType === 'expense');
      this.btnCatTypeExpense.disabled = hasTransactions;
      this.btnCatTypeExpense.classList.toggle('disabled', hasTransactions);
      if (hasTransactions) {
        this.btnCatTypeExpense.title = lockHint;
      } else {
        this.btnCatTypeExpense.removeAttribute('title');
      }
    }
    if (this.btnCatTypeIncome) {
      this.btnCatTypeIncome.classList.toggle('active', this.financeNewCatType === 'income');
      this.btnCatTypeIncome.disabled = hasTransactions;
      this.btnCatTypeIncome.classList.toggle('disabled', hasTransactions);
      if (hasTransactions) {
        this.btnCatTypeIncome.title = lockHint;
      } else {
        this.btnCatTypeIncome.removeAttribute('title');
      }
    }

    if (this.financeCatNameInput) {
      this.financeCatNameInput.value = cat ? this.getFinanceCategoryName(cat) : '';
    }

    this.financeNewCatColor = cat ? cat.color : '#22c55e';
    this.financeNewCatIcon = cat ? cat.iconIndex : 0;

    // 45 Rich & diverse colors palette (5 rows of 9 colors)
    const colors = [
      // Row 1: Almost white & light pastel tints
      '#f8fafc', '#f1f5f9', '#fef3c7', '#fce7f3', '#ede9fe', '#e0f2fe', '#ccfbf1', '#dcfce7', '#fef08a',
      // Row 2: Vibrant warm & fresh greens
      '#ef4444', '#f87171', '#f97316', '#fb923c', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
      // Row 3: Cool greens, cyans & ocean blues
      '#14b8a6', '#06b6d4', '#0ea5e9', '#38bdf8', '#3b82f6', '#2563eb', '#1d4ed8', '#4f46e5', '#6366f1',
      // Row 4: Purples, pinks, deep berry & wine reds
      '#8b5cf6', '#a855f7', '#c084fc', '#d946ef', '#ec4899', '#f43f5e', '#e11d48', '#9f1239', '#881337',
      // Row 5: Earthy browns, warm neutrals, slate & dark grays
      '#65a30d', '#b45309', '#7c2d12', '#573a24', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'
    ];

    if (this.financeColorPalette) {
      this.financeColorPalette.innerHTML = '';
      colors.forEach(clr => {
        const dot = document.createElement('div');
        dot.className = `finance-color-dot ${clr === this.financeNewCatColor ? 'selected' : ''}`;
        dot.style.background = clr;
        dot.addEventListener('click', () => {
          triggerHaptic(15);
          this.financeColorPalette.querySelectorAll('.finance-color-dot').forEach(d => d.classList.remove('selected'));
          dot.classList.add('selected');
          this.financeNewCatColor = clr;
        });
        this.financeColorPalette.appendChild(dot);
      });
    }

    // 98 Sticker icons grid (49 base icons + 49 new icons from Finance.jpg)
    if (this.financeIconPickerGrid) {
      this.financeIconPickerGrid.innerHTML = '';
      const totalFinanceIcons = 98;
      let selectedItemEl = null;
      for (let i = 0; i < totalFinanceIcons; i++) {
        const item = document.createElement('div');
        const isSelected = i === this.financeNewCatIcon;
        item.className = `finance-icon-pick-item ${isSelected ? 'selected' : ''}`;
        item.dataset.iconIdx = String(i);

        const img = document.createElement('img');
        img.src = `assets/finance_icons/fin_icon_${i}.png`;
        img.alt = `Icon ${i}`;
        img.onerror = function() {
          if (!this.dataset.retried) {
            this.dataset.retried = '1';
            setTimeout(() => {
              this.src = `assets/finance_icons/fin_icon_${i}.png?r=${Date.now()}`;
            }, 350);
          }
        };
        item.appendChild(img);

        if (isSelected) selectedItemEl = item;
        item.addEventListener('click', () => {
          triggerHaptic(15);
          this.financeIconPickerGrid.querySelectorAll('.finance-icon-pick-item').forEach(it => it.classList.remove('selected'));
          item.classList.add('selected');
          this.financeNewCatIcon = i;
        });
        this.financeIconPickerGrid.appendChild(item);
      }
      if (selectedItemEl) {
        setTimeout(() => {
          selectedItemEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }, 50);
      }
    }

    this.financeCategoryModalBackdrop.classList.add('open');
    this.financeCategoryModalBackdrop.setAttribute('aria-hidden', 'false');
    this.dismissActiveKeyboard();
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  closeFinanceCategoryModal() {
    if (this.financeCategoryModalBackdrop) {
      this.financeCategoryModalBackdrop.classList.remove('open');
      this.financeCategoryModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  saveFinanceCategory() {
    if (!this.financeTracker || !this.financeCatNameInput) return;
    const name = this.financeCatNameInput.value.trim();
    if (!name) {
      this.showToast(this.t('finance_toast_enter_cat_name') || 'Введите название категории', '⚠️');
      this.financeCatNameInput.focus();
      return;
    }

    if (this.financeEditingCatId) {
      this.financeTracker.updateCategory(this.financeEditingCatId, {
        name,
        customName: name,
        isCustom: true,
        type: this.financeNewCatType,
        color: this.financeNewCatColor,
        iconIndex: this.financeNewCatIcon
      });
      this.showToast(this.t('finance_toast_cat_updated') || 'Категория обновлена! ✨', '🎨');
    } else {
      this.financeTracker.addCategory({
        name,
        customName: name,
        isCustom: true,
        type: this.financeNewCatType,
        color: this.financeNewCatColor,
        iconIndex: this.financeNewCatIcon
      });
      this.showToast(this.t('finance_toast_cat_added') || 'Категория добавлена! 🏷️', '🎉');
    }

    triggerHaptic(20);
    this.closeFinanceCategoryModal();
    this.renderFinanceModalContent();
    this.updateFinanceWidget();
  }

  /* ============================================================================
   * 🥑 NUTRITION & MACRO TRACKER (ПОДСЧЁТ КАЛОРИЙ И БЖУ) METHODS
   * ============================================================================ */

  initNutritionTrackerListeners() {
    if (!this.nutritionTracker) return;
    this.applyMacroColors();

    // 1. Top Header Widget Click (inside modulesHubDropdown)
    if (this.widgetNutrition) {
      this.widgetNutrition.addEventListener('click', () => {
        triggerHaptic(20);
        this.closeModulesHubDropdown();
        this.isNutritionArchiveMode = false;
        this.openNutritionModal();
      });
    }

    // 2. Archive Paper Sheet Craft Stamp Click
    if (this.notebookNutritionStamp) {
      this.notebookNutritionStamp.addEventListener('click', () => {
        triggerHaptic(20);
        this.isNutritionArchiveMode = true;
        this.openNutritionModal(this.selectedDate);
      });
    }

    // 3. Main Modal Close & Safe Backdrop
    if (this.nutritionCloseBtn) {
      this.nutritionCloseBtn.addEventListener('click', () => this.closeNutritionModal());
    }
    this.bindSafeBackdrop(this.nutritionModalBackdrop, () => this.closeNutritionModal(), () => this._nutritionModalOpenedAt);

    // 4. Header Settings Gear or + Category Button Click
    if (this.btnNutritionAddCategory) {
      this.btnNutritionAddCategory.addEventListener('click', () => {
        triggerHaptic(15);
        this.openMealEditModal(null);
      });
    }
    if (this.btnNutritionSettings) {
      this.btnNutritionSettings.addEventListener('click', () => {
        triggerHaptic(15);
        this.openNutritionSettingsModal();
      });
    }
    if (this.btnNutritionStats) {
      this.btnNutritionStats.addEventListener('click', () => {
        triggerHaptic(15);
        this.openNutritionStatsModal();
      });
    }
    if (this.nutritionStatsCloseBtn) {
      this.nutritionStatsCloseBtn.addEventListener('click', () => {
        this.closeNutritionStatsModal();
      });
    }
    this.bindSafeBackdrop(this.nutritionStatsModalBackdrop, () => this.closeNutritionStatsModal(), () => this._nutritionStatsModalOpenedAt);
    if (this.btnNutritionTabCalendar && this.btnNutritionTabFrequency) {
      this.btnNutritionTabCalendar.addEventListener('click', () => {
        triggerHaptic(12);
        this.switchNutritionStatsTab('calendar');
      });
      this.btnNutritionTabFrequency.addEventListener('click', () => {
        triggerHaptic(12);
        this.switchNutritionStatsTab('frequency');
      });
    }

    // 5. Interactive Donut Center Click (Resets Meal Filter back to Total Daily Calories)
    if (this.nutritionDonutCenter) {
      this.nutritionDonutCenter.addEventListener('click', () => {
        if (this.nutritionSelectedMealFilterId) {
          triggerHaptic(15);
          this.nutritionSelectedMealFilterId = null;
          this.renderNutritionModalContent();
        }
      });
    }

    // 5.5. Interactive Hunger & Norm Balance Scale click / tap
    const hungerBox = this.nutritionHungerScaleBox || document.getElementById('nutritionHungerScaleBox');
    if (hungerBox) {
      hungerBox.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        this.showHungerScaleBubble();
      });
    }

    // 6. Clear Meal Filter Badge Button
    if (this.btnClearMealFilter) {
      this.btnClearMealFilter.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        this.nutritionSelectedMealFilterId = null;
        this.renderNutritionModalContent();
      });
    }

    // 6.5 Hunger & Norm Balance Scale Events (10-Step Cat Evolution & Color Submenu)
    this.setupHungerScaleInteractions();

    // 7. Bottom Action Button: Add Food [+]
    if (this.btnNutritionAddFood) {
      this.btnNutritionAddFood.addEventListener('click', () => {
        triggerHaptic(20);
        this.openAddFoodModal();
      });
    }

    // 8. Add Food Modal: Tab Switcher (Single Food vs Composite Dish)
    if (this.tabFoodSingle && this.tabFoodComposite) {
      this.tabFoodSingle.addEventListener('click', () => {
        triggerHaptic(15);
        this.tabFoodSingle.classList.add('active');
        this.tabFoodComposite.classList.remove('active');
        if (this.paneFoodSingle) this.paneFoodSingle.style.display = 'block';
        if (this.paneFoodComposite) this.paneFoodComposite.style.display = 'none';
      });

      this.tabFoodComposite.addEventListener('click', () => {
        triggerHaptic(15);
        this.tabFoodComposite.classList.add('active');
        this.tabFoodSingle.classList.remove('active');
        if (this.paneFoodComposite) this.paneFoodComposite.style.display = 'block';
        if (this.paneFoodSingle) this.paneFoodSingle.style.display = 'none';
        this.recalculateCompositeDish();
      });
    }

    if (this.singleFoodMealSelect) {
      this.singleFoodMealSelect.addEventListener('change', () => {
        const m = this.nutritionTracker?.getMeal(this.singleFoodMealSelect.value);
        if (m && this.singleMealPreviewIcon) {
          this.singleMealPreviewIcon.innerHTML = this.nutritionTracker.renderMealIcon(m.icon, m.name);
        }
      });
    }

    if (this.compositeMealSelect) {
      this.compositeMealSelect.addEventListener('change', () => {
        const m = this.nutritionTracker?.getMeal(this.compositeMealSelect.value);
        if (m && this.compositeMealPreviewIcon) {
          this.compositeMealPreviewIcon.innerHTML = this.nutritionTracker.renderMealIcon(m.icon, m.name);
        }
      });
    }

    if (this.nutritionAddFoodCloseBtn) {
      this.nutritionAddFoodCloseBtn.addEventListener('click', () => this.closeAddFoodModal());
    }
    this.bindSafeBackdrop(this.nutritionAddFoodModalBackdrop, () => this.closeAddFoodModal(), () => this._nutritionAddFoodOpenedAt);

    // 9. Single Food: Real-Time Inputs & Auto-Calculation
    const singleInputs = [this.singleFoodWeight, this.singleFoodKcal100, this.singleFoodProt100, this.singleFoodFat100, this.singleFoodCarb100];
    singleInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', () => this.recalculateSingleFoodPortion());
        input.addEventListener('focus', () => {
          try { input.select(); } catch (_) {}
        });
      }
    });

    // Quick increment chips for food serving weight (+1, +5, +10, +50, +100, Clear)
    if (this.foodQuickChips) {
      const preventFocusAndDismiss = (e) => {
        if (e) {
          try { e.preventDefault(); } catch (_) {}
        }
        if (this.singleFoodWeight && typeof this.singleFoodWeight.blur === 'function') {
          this.singleFoodWeight.blur();
        }
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        this.dismissActiveKeyboard();
      };

      let clearPressTimer = null;
      let clearLongPressed = false;

      this.foodQuickChips.querySelectorAll('.food-chip-btn').forEach(btn => {
        // Prevent gaining focus or triggering mobile on-screen keyboard
        btn.addEventListener('pointerdown', preventFocusAndDismiss);
        btn.addEventListener('mousedown', preventFocusAndDismiss);
        btn.addEventListener('touchstart', preventFocusAndDismiss, { passive: false });

        if (btn.dataset.action === 'clear') {
          btn.addEventListener('pointerdown', () => {
            clearLongPressed = false;
            clearPressTimer = setTimeout(() => {
              clearLongPressed = true;
              triggerHaptic(25);
              if (this.singleFoodWeight) {
                this.singleFoodWeight.value = '100';
              }
              this.recalculateSingleFoodPortion();
              preventFocusAndDismiss();
            }, 450);
          });

          const cancelClearTimer = () => {
            if (clearPressTimer) {
              clearTimeout(clearPressTimer);
              clearPressTimer = null;
            }
          };

          btn.addEventListener('pointerup', cancelClearTimer);
          btn.addEventListener('pointercancel', cancelClearTimer);
          btn.addEventListener('pointerleave', cancelClearTimer);
        }

        btn.addEventListener('click', (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          triggerHaptic(15);
          preventFocusAndDismiss();

          if (btn.dataset.action === 'clear') {
            if (clearLongPressed) {
              clearLongPressed = false;
              return;
            }
            if (this.singleFoodWeight) {
              this.singleFoodWeight.value = '0';
            }
          } else {
            const add = parseFloat(btn.dataset.add) || 0;
            const current = parseFloat((this.singleFoodWeight?.value || '0').replace(',', '.')) || 0;
            const sum = Math.max(0, Math.round((current + add) * 10) / 10);
            if (this.singleFoodWeight) {
              this.singleFoodWeight.value = sum.toString();
            }
          }

          this.recalculateSingleFoodPortion();
          preventFocusAndDismiss();
        });
      });
    }

    // 10. Single Food: Live Search Suggestions (with Open Food Facts + Local Cache)
    if (this.singleFoodName) {
      let searchTimer = null;
      this.singleFoodName.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        const q = (e.target.value || '').trim();
        if (q.length < 2) {
          if (this.singleFoodSuggestions) this.singleFoodSuggestions.style.display = 'none';
          return;
        }

        searchTimer = setTimeout(async () => {
          const results = await this.nutritionTracker.searchFood(q);
          if (!this.singleFoodSuggestions) return;
          if (results && results.length > 0) {
            const protColor = this.nutritionTracker?.getMacroColor('protein') || '#3b82f6';
            const fatColor = this.nutritionTracker?.getMacroColor('fat') || '#f59e0b';
            const carbColor = this.nutritionTracker?.getMacroColor('carbs') || '#10b981';
            const protRgb = this.hexToRgb(protColor) || { r: 59, g: 130, b: 246 };
            const fatRgb = this.hexToRgb(fatColor) || { r: 245, g: 158, b: 11 };
            const carbRgb = this.hexToRgb(carbColor) || { r: 16, g: 185, b: 129 };

            this.singleFoodSuggestions.innerHTML = results.map(item => {
              let badgeHtml = '';
              if (item.isComposite) {
                const count = item.ingredientsCount || (Array.isArray(item.ingredients) ? item.ingredients.length : 0);
                badgeHtml = `<span class="food-badge-recipe">❤️ Рецепт (${count})</span>`;
              } else if (item.isCustom || item.source === 'custom') {
                badgeHtml = `<span class="food-badge-custom">❤️ Моё блюдо</span>`;
              }
              return `
                <div class="food-suggestion-item" data-food-id="${escapeHtml(item.id)}">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <span><strong>${escapeHtml(item.name)}</strong>${badgeHtml}</span>
                  </div>
                  <div style="font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 3px;">
                    <span>${item.caloriesPer100g} ккал •</span>
                    <span class="food-macro-pill prot" style="color: ${protColor}; background: rgba(${protRgb.r}, ${protRgb.g}, ${protRgb.b}, 0.15);">Б:${item.proteinPer100g}</span>
                    <span class="food-macro-pill fat" style="color: ${fatColor}; background: rgba(${fatRgb.r}, ${fatRgb.g}, ${fatRgb.b}, 0.15);">Ж:${item.fatPer100g}</span>
                    <span class="food-macro-pill carb" style="color: ${carbColor}; background: rgba(${carbRgb.r}, ${carbRgb.g}, ${carbRgb.b}, 0.15);">У:${item.carbsPer100g}</span>
                  </div>
                </div>
              `;
            }).join('');

            this.singleFoodSuggestions.querySelectorAll('.food-suggestion-item').forEach((row, idx) => {
              row.addEventListener('click', () => {
                const selected = results[idx];
                if (selected) {
                  if (selected.isComposite) {
                    // Переключаемся на вкладку «Составное блюдо» и заполняем все ингредиенты
                    if (this.tabFoodComposite) this.tabFoodComposite.click();
                    this.populateCompositeRecipe(selected.recipe || selected);
                  } else {
                    this.applyScannedFoodToSingle(selected);
                    if (this.nutritionTracker && typeof this.nutritionTracker.saveCustomFood === 'function') {
                      this.nutritionTracker.saveCustomFood(selected);
                    }
                  }
                  if (this.singleFoodSuggestions) this.singleFoodSuggestions.style.display = 'none';
                }
              });
            });

            this.singleFoodSuggestions.style.display = 'block';
          } else {
            this.singleFoodSuggestions.style.display = 'none';
          }
        }, 300);
      });

      document.addEventListener('click', (e) => {
        if (this.singleFoodSuggestions && !this.singleFoodSuggestions.contains(e.target) && e.target !== this.singleFoodName) {
          this.singleFoodSuggestions.style.display = 'none';
        }
      });

      this.singleFoodName.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.singleFoodSuggestions) {
          this.singleFoodSuggestions.style.display = 'none';
        }
      });
    }

    // 11. Single Food: Barcode Scan Button
    if (this.btnScanBarcodeSingle) {
      this.btnScanBarcodeSingle.addEventListener('click', () => {
        triggerHaptic(20);
        this.startBarcodeScanner('single');
      });
    }

    // 12. Single Food: Save to Log
    if (this.btnSaveSingleFood) {
      this.btnSaveSingleFood.addEventListener('click', () => {
        const name = (this.singleFoodName?.value || '').trim();
        if (!name) {
          this.showToast('Введите название продукта', '⚠️');
          return;
        }

        const rawWeight = parseFloat((this.singleFoodWeight?.value || '').replace(',', '.'));
        if (isNaN(rawWeight) || rawWeight <= 0) {
          this.showToast('Укажите вес порции больше 0 г', '⚠️');
          return;
        }
        const weight = rawWeight;
        const c100 = Math.max(0, parseFloat(this.singleFoodKcal100?.value) || 0);
        const p100 = Math.max(0, parseFloat(this.singleFoodProt100?.value) || 0);
        const f100 = Math.max(0, parseFloat(this.singleFoodFat100?.value) || 0);
        const cb100 = Math.max(0, parseFloat(this.singleFoodCarb100?.value) || 0);

        const portionCal = Math.round((weight * c100) / 100);
        const portionProt = Math.round(((weight * p100) / 100) * 10) / 10;
        const portionFat = Math.round(((weight * f100) / 100) * 10) / 10;
        const portionCarb = Math.round(((weight * cb100) / 100) * 10) / 10;

        const mealId = this.singleFoodMealSelect?.value || this.nutritionSelectedMealFilterId || 'meal_breakfast';

        if (this.editingNutritionEntryId) {
          this.nutritionTracker.updateEntry(this.editingNutritionEntryId, {
            mealId,
            foodType: 'single',
            name,
            weightGrams: weight,
            calories: portionCal,
            protein: portionProt,
            fat: portionFat,
            carbs: portionCarb,
            per100g: { calories: c100, protein: p100, fat: f100, carbs: cb100 },
            barcode: this.singleFoodName?.dataset.scannedBarcode || ''
          });
          this.editingNutritionEntryId = null;
          triggerHaptic([20, 50, 20]);
          this.showToast(`Обновлено: ${name} (${portionCal} ккал)`, '✏️');
        } else {
          this.nutritionTracker.addEntry({
            date: this.currentNutritionDate,
            mealId,
            foodType: 'single',
            name,
            weightGrams: weight,
            calories: portionCal,
            protein: portionProt,
            fat: portionFat,
            carbs: portionCarb,
            per100g: { calories: c100, protein: p100, fat: f100, carbs: cb100 },
            barcode: this.singleFoodName?.dataset.scannedBarcode || ''
          });
          triggerHaptic([20, 50, 20]);
          this.showToast(`Добавлено: ${name} (${portionCal} ккал)`, '🥗');
        }

        // Автоматически сохраняем в базу своих блюд с пометкой ❤️ "Моё блюдо"
        if (this.nutritionTracker && typeof this.nutritionTracker.saveCustomFood === 'function') {
          this.nutritionTracker.saveCustomFood({
            name,
            barcode: this.singleFoodName?.dataset.scannedBarcode || '',
            caloriesPer100g: c100,
            proteinPer100g: p100,
            fatPer100g: f100,
            carbsPer100g: cb100,
            isCustom: true,
            source: 'custom'
          });
        }

        this.closeAddFoodModal();
        this.renderNutritionModalContent();
        this.updateNutritionWidget();
        this.updateNutritionArchiveStamp();
      });
    }

    // 13. Single Food: Save into Custom Foods Database
    if (this.btnSaveCustomFood) {
      this.btnSaveCustomFood.addEventListener('click', () => {
        const name = (this.singleFoodName?.value || '').trim();
        if (!name) {
          this.showToast('Введите название продукта', '⚠️');
          return;
        }

        this.nutritionTracker.saveCustomFood({
          name,
          barcode: this.singleFoodName?.dataset.scannedBarcode || '',
          caloriesPer100g: Math.max(0, parseFloat(this.singleFoodKcal100?.value) || 0),
          proteinPer100g: Math.max(0, parseFloat(this.singleFoodProt100?.value) || 0),
          fatPer100g: Math.max(0, parseFloat(this.singleFoodFat100?.value) || 0),
          carbsPer100g: Math.max(0, parseFloat(this.singleFoodCarb100?.value) || 0),
          isCustom: true,
          source: 'custom'
        });

        triggerHaptic(20);
        this.showToast(`Продукт сохранен в базу: ${name} ❤️`, '✨');
      });
    }

    // 13.1 Composite Dish: Live Search / Recipe Autocomplete
    if (this.compositeDishName) {
      let compDishSearchTimer = null;
      this.compositeDishName.addEventListener('input', (e) => {
        clearTimeout(compDishSearchTimer);
        const q = (e.target.value || '').trim();
        if (q.length < 1) {
          if (this.compositeDishSuggestions) this.compositeDishSuggestions.style.display = 'none';
          return;
        }

        compDishSearchTimer = setTimeout(async () => {
          const results = await this.nutritionTracker.searchFood(q);
          if (!this.compositeDishSuggestions) return;
          if (results && results.length > 0) {
            const protColor = this.nutritionTracker?.getMacroColor('protein') || '#3b82f6';
            const fatColor = this.nutritionTracker?.getMacroColor('fat') || '#f59e0b';
            const carbColor = this.nutritionTracker?.getMacroColor('carbs') || '#10b981';
            const protRgb = this.hexToRgb(protColor) || { r: 59, g: 130, b: 246 };
            const fatRgb = this.hexToRgb(fatColor) || { r: 245, g: 158, b: 11 };
            const carbRgb = this.hexToRgb(carbColor) || { r: 16, g: 185, b: 129 };

            this.compositeDishSuggestions.innerHTML = results.map(item => {
              let badgeHtml = '';
              if (item.isComposite) {
                const count = item.ingredientsCount || (Array.isArray(item.ingredients) ? item.ingredients.length : 0);
                badgeHtml = `<span class="food-badge-recipe">❤️ Рецепт (${count} ингред.)</span>`;
              } else if (item.isCustom || item.source === 'custom') {
                badgeHtml = `<span class="food-badge-custom">❤️ Моё блюдо</span>`;
              }
              return `
                <div class="food-suggestion-item" data-food-id="${escapeHtml(item.id)}">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <span><strong>${escapeHtml(item.name)}</strong>${badgeHtml}</span>
                  </div>
                  <div style="font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 3px;">
                    <span>${item.caloriesPer100g} ккал •</span>
                    <span class="food-macro-pill prot" style="color: ${protColor}; background: rgba(${protRgb.r}, ${protRgb.g}, ${protRgb.b}, 0.15);">Б:${item.proteinPer100g}</span>
                    <span class="food-macro-pill fat" style="color: ${fatColor}; background: rgba(${fatRgb.r}, ${fatRgb.g}, ${fatRgb.b}, 0.15);">Ж:${item.fatPer100g}</span>
                    <span class="food-macro-pill carb" style="color: ${carbColor}; background: rgba(${carbRgb.r}, ${carbRgb.g}, ${carbRgb.b}, 0.15);">У:${item.carbsPer100g}</span>
                  </div>
                </div>
              `;
            }).join('');

            this.compositeDishSuggestions.querySelectorAll('.food-suggestion-item').forEach((row, idx) => {
              row.addEventListener('click', () => {
                const selected = results[idx];
                if (selected) {
                  if (selected.isComposite) {
                    this.populateCompositeRecipe(selected.recipe || selected);
                  } else {
                    if (this.compositeDishName) this.compositeDishName.value = selected.name;
                  }
                  if (this.compositeDishSuggestions) this.compositeDishSuggestions.style.display = 'none';
                }
              });
            });

            this.compositeDishSuggestions.style.display = 'block';
          } else {
            this.compositeDishSuggestions.style.display = 'none';
          }
        }, 200);
      });

      document.addEventListener('click', (e) => {
        if (this.compositeDishSuggestions && !this.compositeDishSuggestions.contains(e.target) && e.target !== this.compositeDishName) {
          this.compositeDishSuggestions.style.display = 'none';
        }
      });

      this.compositeDishName.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.compositeDishSuggestions) {
          this.compositeDishSuggestions.style.display = 'none';
        }
      });
    }

    // 14. Composite Dish: Add Ingredient Button
    if (this.btnAddCompositeIngredient) {
      this.btnAddCompositeIngredient.addEventListener('click', () => {
        triggerHaptic(15);
        this.currentCompositeIngredients.push({
          name: '',
          rawWeight: 100,
          calories100g: 0,
          protein100g: 0,
          fat100g: 0,
          carbs100g: 0,
          isCollapsed: false // Новый ингредиент открыт для заполнения
        });
        this.renderCompositeIngredientsList();
        this.recalculateCompositeDish();

        // Фокусируем поле ввода нового ингредиента
        setTimeout(() => {
          const rows = this.compositeIngredientsList?.querySelectorAll('.composite-ingredient-row');
          const lastRow = rows ? rows[rows.length - 1] : null;
          const nameInput = lastRow?.querySelector('.comp-ing-name');
          if (nameInput) nameInput.focus();
        }, 60);
      });
    }

    // 15. Composite Dish: Cooking Yield Inputs (Готовый вес и Порция)
    if (this.compositeCookedWeight) {
      this.compositeCookedWeight.addEventListener('input', () => this.recalculateCompositeDish());
    }
    if (this.compositePortionEaten) {
      this.compositePortionEaten.addEventListener('input', () => this.recalculateCompositeDish());
    }

    // 16. Composite Dish: Save to Log
    if (this.btnSaveCompositeFood) {
      this.btnSaveCompositeFood.addEventListener('click', () => {
        const dishName = (this.compositeDishName?.value || '').trim() || 'Составное блюдо';
        const mealId = this.compositeMealSelect?.value || this.nutritionSelectedMealFilterId || 'meal_lunch';

        const calc = this.nutritionTracker.calculateCompositeDish(
          this.currentCompositeIngredients,
          parseFloat(this.compositeCookedWeight?.value) || 0,
          parseFloat(this.compositePortionEaten?.value) || 0
        );

        if (calc.ingredients.length === 0 || calc.rawTotalWeight <= 0) {
          this.showToast('Добавьте хотя бы один ингредиент с весом', '⚠️');
          return;
        }

        const portion = calc.portionNutrients;

        if (this.editingNutritionEntryId) {
          this.nutritionTracker.updateEntry(this.editingNutritionEntryId, {
            mealId,
            foodType: 'composite',
            name: dishName,
            weightGrams: portion.weightGrams,
            calories: portion.calories,
            protein: portion.protein,
            fat: portion.fat,
            carbs: portion.carbs,
            rawIngredients: calc.ingredients,
            cookedWeight: calc.cookedWeight,
            portionWeight: portion.weightGrams,
            per100g: calc.per100gCooked
          });
          this.editingNutritionEntryId = null;
          triggerHaptic([25, 50, 25]);
          this.showToast(`Обновлено: ${dishName} (${portion.calories} ккал)`, '✏️');
        } else {
          this.nutritionTracker.addEntry({
            date: this.currentNutritionDate,
            mealId,
            foodType: 'composite',
            name: dishName,
            weightGrams: portion.weightGrams,
            calories: portion.calories,
            protein: portion.protein,
            fat: portion.fat,
            carbs: portion.carbs,
            rawIngredients: calc.ingredients,
            cookedWeight: calc.cookedWeight,
            portionWeight: portion.weightGrams,
            per100g: calc.per100gCooked
          });
          triggerHaptic([25, 50, 25]);
          this.showToast(`Добавлено: ${dishName} (${portion.calories} ккал)`, '🍲');
        }

        // Автоматически сохраняем составное блюдо (рецепт) в базу данных
        if (this.nutritionTracker && typeof this.nutritionTracker.saveRecipe === 'function') {
          this.nutritionTracker.saveRecipe({
            id: this.compositeDishName?.dataset.activeRecipeId || null,
            name: dishName,
            ingredients: this.currentCompositeIngredients,
            cookedWeight: parseFloat(this.compositeCookedWeight?.value) || calc.cookedWeight,
            portionWeight: portion.weightGrams,
            caloriesPer100g: calc.per100gCooked.calories,
            proteinPer100g: calc.per100gCooked.protein,
            fatPer100g: calc.per100gCooked.fat,
            carbsPer100g: calc.per100gCooked.carbs
          });
        }

        this.closeAddFoodModal();
        this.renderNutritionModalContent();
        this.updateNutritionWidget();
        this.updateNutritionArchiveStamp();
      });
    }

    // 17. Barcode Scanner Viewfinder Controls
    if (this.btnScannerClose) {
      this.btnScannerClose.addEventListener('click', () => this.stopBarcodeScanner());
    }
    if (this.btnScannerManual) {
      this.btnScannerManual.addEventListener('click', () => {
        this.stopBarcodeScanner();
        this.promptManualBarcodeEntry();
      });
    }
    if (this.btnScannerTorch) {
      this.btnScannerTorch.addEventListener('click', async () => {
        if (!this.scannerMediaStream) return;
        const track = this.scannerMediaStream.getVideoTracks()[0];
        if (track && typeof track.applyConstraints === 'function') {
          try {
            this.scannerTorchActive = !this.scannerTorchActive;
            await track.applyConstraints({ advanced: [{ torch: this.scannerTorchActive }] });
            triggerHaptic(15);
          } catch (e) {}
        }
      });
    }

    // 18. Settings Card Listeners in "Модули" Tab
    if (this.toggleNutritionTracker) {
      this.toggleNutritionTracker.onchange = (e) => {
        const enabled = e.target.checked;
        this.nutritionTracker.updateSettings({ enabled });
        this.updateNutritionWidget();
        this.updateNutritionArchiveStamp();
        this.updateModulesHubState();

        const lang = this.settings?.lang || 'ru';
        const msg = enabled
          ? (lang === 'en' ? 'Nutrition tracker enabled! 🥑' : (lang === 'uk' ? 'Щоденник харчування увімкнено! 🥑' : 'Дневник питания включен! 🥑'))
          : (lang === 'en' ? 'Nutrition tracker disabled' : (lang === 'uk' ? 'Щоденник харчування вимкнено' : 'Дневник питания отключен'));
        this.showToast(msg, enabled ? '🥑' : null);

        if (enabled && this.moduleCardNutrition && !this.moduleCardNutrition.classList.contains('expanded')) {
          this.toggleModuleCard('moduleCardNutrition', 'nutritionSubSettings', 'btnExpandNutritionModule');
        }
      };
    }

    if (this.btnExpandNutritionModule) {
      this.btnExpandNutritionModule.addEventListener('click', () => {
        this.toggleModuleCard('moduleCardNutrition', 'nutritionSubSettings', 'btnExpandNutritionModule');
      });
    }

    if (this.toggleNutritionStamp) {
      this.toggleNutritionStamp.onchange = (e) => {
        this.nutritionTracker.updateSettings({ showArchiveStamp: e.target.checked });
        this.updateNutritionArchiveStamp();
      };
    }

    const targetInputs = [
      { el: this.nutritionSettingCalories, key: 'calorieTarget' },
      { el: this.nutritionSettingProtein, key: 'proteinTarget' },
      { el: this.nutritionSettingFat, key: 'fatTarget' },
      { el: this.nutritionSettingCarbs, key: 'carbTarget' }
    ];
    targetInputs.forEach(({ el, key }) => {
      if (el) {
        const updateTarget = (valStr) => {
          const val = Math.max(0, parseInt(valStr, 10) || 0);
          this.nutritionTracker.updateSettings({ [key]: val });
          this.updateNutritionWidget();
          this.renderNutritionModalContent();
        };
        el.oninput = (e) => updateTarget(e.target.value);
        el.onchange = (e) => updateTarget(e.target.value);
      }
    });

    // Stepper buttons (+ / -) for nutrition targets
    this.setupTargetSteppers();

    if (this.btnOpenNutritionFromSettings) {
      this.btnOpenNutritionFromSettings.addEventListener('click', () => {
        triggerHaptic(20);
        this.closeSettingsModal();
        this.openNutritionModal();
      });
    }

    // 19. Nutrition Settings Modal (Targets & Meals Editor)
    if (this.nutritionSettingsCloseBtn) {
      this.nutritionSettingsCloseBtn.addEventListener('click', () => this.closeNutritionSettingsModal());
    }
    this.bindSafeBackdrop(this.nutritionSettingsModalBackdrop, () => this.closeNutritionSettingsModal(), () => this._nutritionSettingsModalOpenedAt);

    if (this.btnAddNewMealSubmit) {
      this.btnAddNewMealSubmit.addEventListener('click', () => {
        const name = (this.newMealNameInput?.value || '').trim();
        if (!name) {
          this.showToast('Введите название приёма пищи', '⚠️');
          return;
        }
        const icon = (this.newMealIconInput?.value || '').trim() || '🥪';
        const color = this.newMealColorInput?.value || '#ec4899';

        this.nutritionTracker.addMeal({ name, icon, color });
        if (this.newMealNameInput) this.newMealNameInput.value = '';
        triggerHaptic(20);
        this.showToast(`Приём пищи добавлен: ${name}`, '✨');
        this.renderCustomMealsSettingsList();
        this.renderNutritionModalContent();
      });
    }

    if (this.btnSaveNutritionSettingsModal) {
      this.btnSaveNutritionSettingsModal.addEventListener('click', () => {
        if (this.modalSettingCalorieTarget) {
          const cal = Math.max(500, parseInt(this.modalSettingCalorieTarget?.value, 10) || 2000);
          const p = Math.max(10, parseInt(this.modalSettingProteinTarget?.value, 10) || 80);
          const f = Math.max(10, parseInt(this.modalSettingFatTarget?.value, 10) || 70);
          const c = Math.max(20, parseInt(this.modalSettingCarbTarget?.value, 10) || 250);

          this.nutritionTracker.updateSettings({
            calorieTarget: cal,
            proteinTarget: p,
            fatTarget: f,
            carbTarget: c
          });

          // Sync card inputs
          if (this.nutritionSettingCalories) this.nutritionSettingCalories.value = cal;
          if (this.nutritionSettingProtein) this.nutritionSettingProtein.value = p;
          if (this.nutritionSettingFat) this.nutritionSettingFat.value = f;
          if (this.nutritionSettingCarbs) this.nutritionSettingCarbs.value = c;
        }

        triggerHaptic(20);
        this.closeNutritionSettingsModal();
        this.renderNutritionModalContent();
        this.updateNutritionWidget();
      });
    }

    // Edit Meal Modal Events
    if (this.editMealModalCloseBtn) {
      this.editMealModalCloseBtn.addEventListener('click', () => this.closeMealEditModal());
    }
    if (this.btnCancelEditMeal) {
      this.btnCancelEditMeal.addEventListener('click', () => this.closeMealEditModal());
    }
    this.bindSafeBackdrop(this.editMealModalBackdrop, () => this.closeMealEditModal(), () => this._editMealModalOpenedAt);

    if (this.btnSaveEditMeal) {
      this.btnSaveEditMeal.addEventListener('click', () => this.saveMealEditModal());
    }

    if (this.btnDeleteEditMeal) {
      this.btnDeleteEditMeal.addEventListener('click', () => {
        const mealId = this.editMealIdInput?.value;
        if (!mealId || !this.nutritionTracker) return;
        const allMeals = this.nutritionTracker.getMeals();
        if (allMeals.length <= 1) {
          this.showToast(this.t('nutrition_cannot_delete_last_meal') || 'Нельзя удалить единственный приём пищи', '⚠️');
          return;
        }
        const meal = this.nutritionTracker.getMeal(mealId);
        const mealName = meal?.name || 'Приём пищи';
        this.showConfirmModal({
          title: this.t('nutrition_delete_meal_title') || 'Удалить приём пищи?',
          message: (this.t('nutrition_delete_meal_msg') || 'Вы действительно хотите удалить приём пищи «{name}»? Добавленные ранее записи сохранятся в истории.').replace('{name}', mealName),
          icon: '🗑️',
          confirmText: this.t('delete') || 'Удалить',
          onConfirm: () => {
            this.nutritionTracker.deleteMeal(mealId);
            triggerHaptic(20);
            this.showToast((this.t('nutrition_toast_meal_deleted') || 'Приём пищи удалён') + `: ${mealName}`, '🗑️');
            this.closeMealEditModal();
            this.renderCustomMealsSettingsList();
            this.renderNutritionModalContent();
            this.updateNutritionWidget();
          }
        });
      });
    }

    // Macro Color Picker Events (Long press on Ж, Б, У)
    if (this.macroColorCloseBtn) {
      this.macroColorCloseBtn.addEventListener('click', () => this.closeMacroColorPicker());
    }
    if (this.macroColorCancelBtn) {
      this.macroColorCancelBtn.addEventListener('click', () => this.closeMacroColorPicker());
    }
    if (this.macroColorApplyBtn) {
      this.macroColorApplyBtn.addEventListener('click', () => this.saveMacroColor());
    }
    if (this.btnResetMacroColor) {
      this.btnResetMacroColor.addEventListener('click', () => this.resetMacroColor());
    }
    if (this.macroCustomColorInput) {
      this.macroCustomColorInput.addEventListener('input', (e) => {
        const color = e.target.value;
        this.updateMacroColorPreview(color);
        if (this.macroColorPalette) {
          this.macroColorPalette.querySelectorAll('.macro-palette-swatch').forEach(swatch => {
            swatch.classList.toggle('active', swatch.dataset.color.toLowerCase() === color.toLowerCase());
          });
        }
      });
    }
    if (this.macroColorModalBackdrop) {
      this.macroColorModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.macroColorModalBackdrop) {
          this.closeMacroColorPicker();
        }
      });
    }
  }

  // --- Macro Color Synchronizer & Helpers ---
  hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    if (isNaN(num)) return null;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  applyMacroColors() {
    if (!this.nutritionTracker) return;
    const protColor = this.nutritionTracker.getMacroColor('protein') || '#3b82f6';
    const fatColor = this.nutritionTracker.getMacroColor('fat') || '#f59e0b';
    const carbColor = this.nutritionTracker.getMacroColor('carbs') || '#10b981';

    const protRgb = this.hexToRgb(protColor) || { r: 59, g: 130, b: 246 };
    const fatRgb = this.hexToRgb(fatColor) || { r: 245, g: 158, b: 11 };
    const carbRgb = this.hexToRgb(carbColor) || { r: 16, g: 185, b: 129 };

    const setPropsOn = (el) => {
      if (!el || !el.style) return;
      el.style.setProperty('--macro-color-prot', protColor);
      el.style.setProperty('--macro-color-prot-rgb', `${protRgb.r}, ${protRgb.g}, ${protRgb.b}`);
      el.style.setProperty('--macro-color-fat', fatColor);
      el.style.setProperty('--macro-color-fat-rgb', `${fatRgb.r}, ${fatRgb.g}, ${fatRgb.b}`);
      el.style.setProperty('--macro-color-carb', carbColor);
      el.style.setProperty('--macro-color-carb-rgb', `${carbRgb.r}, ${carbRgb.g}, ${carbRgb.b}`);
    };

    setPropsOn(document.documentElement);
    setPropsOn(document.body);
    setPropsOn(this.nutritionModalBackdrop);
    setPropsOn(this.nutritionAddFoodModalBackdrop);
    setPropsOn(this.singleFoodModalBackdrop);
    setPropsOn(this.compositeDishModalBackdrop);
    setPropsOn(this.nutritionSettingsModalBackdrop);
  }

  // --- Macro Color Picker Handlers ---
  adjustHexColor(hex, percent) {
    if (this.nutritionTracker && typeof this.nutritionTracker.adjustHexColor === 'function') {
      return this.nutritionTracker.adjustHexColor(hex, percent);
    }
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex || '#3b82f6';
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map(c => c + c).join('');
    const num = parseInt(cleanHex, 16);
    if (isNaN(num)) return hex;
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  openMacroColorPicker(macroKey) {
    if (!this.macroColorModalBackdrop || !this.nutritionTracker || this.isNutritionArchiveMode) return;
    this.activeEditingMacroKey = macroKey;

    const macroNames = {
      fat: { name: 'Жиры (Ж)', default: '#f59e0b' },
      protein: { name: 'Белки (Б)', default: '#3b82f6' },
      carbs: { name: 'Углеводы (У)', default: '#10b981' }
    };
    const info = macroNames[macroKey] || { name: 'Макронутриент', default: '#3b82f6' };
    if (this.macroColorTitle) {
      this.macroColorTitle.textContent = `Цвет: ${info.name}`;
    }

    const currentColor = this.nutritionTracker.getMacroColor(macroKey);
    this.tempEditingMacroColor = currentColor;

    this.renderMacroColorPalette();
    this.updateMacroColorPreview(this.tempEditingMacroColor);

    if (this.macroCustomColorInput) {
      this.macroCustomColorInput.value = this.tempEditingMacroColor;
    }

    this.macroColorModalBackdrop.classList.add('open');
    this.macroColorModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeMacroColorPicker() {
    if (this.macroColorModalBackdrop) {
      this.macroColorModalBackdrop.classList.remove('open');
      this.macroColorModalBackdrop.setAttribute('aria-hidden', 'true');
    }
    this.activeEditingMacroKey = null;
  }

  renderMacroColorPalette() {
    if (!this.macroColorPalette) return;
    const presets = [
      '#f59e0b', '#d97706', '#eab308', '#10b981', '#059669', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#2563eb', '#6366f1', '#8b5cf6', '#a855f7', '#d83a88', '#ec4899'
    ];
    const currentColor = (this.tempEditingMacroColor || '').toLowerCase();

    this.macroColorPalette.innerHTML = presets.map(color => {
      const isActive = color.toLowerCase() === currentColor;
      return `
        <button type="button" 
                class="macro-palette-swatch ${isActive ? 'active' : ''}" 
                data-color="${color}" 
                style="background-color: ${color};" 
                title="${color}"
                aria-label="Выбрать цвет ${color}">
        </button>
      `;
    }).join('');

    this.macroColorPalette.querySelectorAll('.macro-palette-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        const color = swatch.dataset.color;
        this.tempEditingMacroColor = color;
        if (this.macroCustomColorInput) {
          this.macroCustomColorInput.value = color;
        }
        this.macroColorPalette.querySelectorAll('.macro-palette-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.updateMacroColorPreview(color);
      });
    });
  }

  updateMacroColorPreview(color) {
    if (!color) return;
    this.tempEditingMacroColor = color;
    const lighter = this.adjustHexColor(color, 32);
    const deeper = this.adjustHexColor(color, -18);

    if (this.macroColorPreviewNormal) {
      this.macroColorPreviewNormal.style.background = `linear-gradient(180deg, ${lighter} 0%, ${color} 100%)`;
    }
    if (this.macroColorPreviewOver) {
      this.macroColorPreviewOver.style.background = `linear-gradient(180deg, #dc2626 0%, #ef4444 14%, ${color} 26%, ${deeper} 100%)`;
    }
  }

  saveMacroColor() {
    if (!this.activeEditingMacroKey || !this.tempEditingMacroColor) return;
    this.nutritionTracker.setMacroColor(this.activeEditingMacroKey, this.tempEditingMacroColor);
    this.applyMacroColors();
    triggerHaptic(20);
    this.closeMacroColorPicker();
    this.renderNutritionModalContent();
    if (typeof this.showToast === 'function') {
      this.showToast('Цвет шкалы сохранён ✨', '🎨');
    }
  }

  resetMacroColor() {
    if (!this.activeEditingMacroKey) return;
    const defaultColor = this.nutritionTracker.resetMacroColor(this.activeEditingMacroKey);
    this.tempEditingMacroColor = defaultColor;
    if (this.macroCustomColorInput) {
      this.macroCustomColorInput.value = defaultColor;
    }
    this.applyMacroColors();
    this.renderMacroColorPalette();
    this.updateMacroColorPreview(defaultColor);
    this.renderNutritionModalContent();
    triggerHaptic(15);
  }

  attachMacroBarLongPressEvents() {
    if (!this.nutritionMacroBarsContainer || this.isNutritionArchiveMode) return;
    const columns = this.nutritionMacroBarsContainer.querySelectorAll('.macro-bar-column');
    columns.forEach(col => {
      const macroKey = col.dataset.macro;
      if (!macroKey) return;

      let pressTimer = null;
      let startX = 0;
      let startY = 0;

      const startPress = (e) => {
        if (e.touches && e.touches.length > 0) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        } else {
          startX = e.clientX;
          startY = e.clientY;
        }
        col.classList.add('is-pressing');
        clearTimeout(pressTimer);
        pressTimer = setTimeout(() => {
          col.classList.remove('is-pressing');
          pressTimer = null;
          triggerHaptic(50);
          this.openMacroColorPicker(macroKey);
        }, 420);
      };

      const cancelPress = () => {
        col.classList.remove('is-pressing');
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };

      const movePress = (e) => {
        if (!pressTimer) return;
        const currentX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        const currentY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
        if (Math.abs(currentX - startX) > 10 || Math.abs(currentY - startY) > 10) {
          cancelPress();
        }
      };

      col.addEventListener('touchstart', startPress, { passive: true });
      col.addEventListener('touchmove', movePress, { passive: true });
      col.addEventListener('touchend', cancelPress, { passive: true });
      col.addEventListener('touchcancel', cancelPress, { passive: true });

      col.addEventListener('mousedown', (e) => {
        if (e.button === 0) startPress(e);
      });
      col.addEventListener('mousemove', movePress);
      col.addEventListener('mouseup', cancelPress);
      col.addEventListener('mouseleave', cancelPress);

      col.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cancelPress();
        triggerHaptic(50);
        this.openMacroColorPicker(macroKey);
      });
    });
  }

  // --- 10-Step Food Cat Evolution & Satiety Scale ---
  getFoodCatColor() {
    const saved = localStorage.getItem('todolercha_food_cat_color');
    const val = parseInt(saved, 10);
    return (val >= 1 && val <= 6) ? val : 1; // 1: Рыжий by default
  }

  setFoodCatColor(colorId) {
    const val = Math.max(1, Math.min(6, colorId || 1));
    localStorage.setItem('todolercha_food_cat_color', String(val));
    this.preloadFoodCatImages(val);
    const pos = (this._currentHungerScalePos != null) ? this._currentHungerScalePos : 50;
    this.renderHungerScaleAtPosition(pos);
    if (this._currentHungerScaleData) {
      this.showHungerScaleBubble(pos);
    }
  }

  getFoodCatUrl(colorId, step) {
    const c = Math.max(1, Math.min(6, colorId || 1));
    const s = String(Math.max(1, Math.min(10, step || 5))).padStart(2, '0');
    return `assets/food_cats/cat_c${c}_s${s}.webp`;
  }

  preloadFoodCatImages(colorId) {
    const c = Math.max(1, Math.min(6, colorId || 1));
    for (let s = 1; s <= 10; s++) {
      const img = new Image();
      img.src = this.getFoodCatUrl(c, s);
    }
  }

  openFoodCatColorPicker() {
    const bubble = this.hungerScaleBubble || document.getElementById('hungerScaleBubble');
    if (bubble) {
      bubble.classList.remove('is-visible');
      bubble.style.display = 'none';
    }

    const popup = this.hungerCatColorPopup || document.getElementById('hungerCatColorPopup');
    const list = this.hungerCatColorList || document.getElementById('hungerCatColorList');
    if (!popup || !list) return;

    const colors = [
      { id: 1, name: 'Рыжий' },
      { id: 2, name: 'Дымчатый' },
      { id: 3, name: 'Полосатый' },
      { id: 4, name: 'Белоснежный' },
      { id: 5, name: 'Черепаховый' },
      { id: 6, name: 'Черный' }
    ];

    const activeColor = this.getFoodCatColor();
    list.innerHTML = colors.map(c => `
      <button type="button" class="hunger-cat-color-card ${c.id === activeColor ? 'is-active' : ''}" data-cat-color="${c.id}" title="${c.name}">
        <div class="hunger-cat-card-img-wrap">
          <img src="${this.getFoodCatUrl(c.id, 5)}" class="hunger-cat-card-img" alt="${c.name}" draggable="false" />
          ${c.id === activeColor ? '<span class="hunger-cat-card-check">✓</span>' : ''}
        </div>
        <span class="hunger-cat-card-label">${c.name}</span>
      </button>
    `).join('');

    popup.style.display = 'block';
    requestAnimationFrame(() => {
      popup.classList.add('is-open');
    });

    list.querySelectorAll('.hunger-cat-color-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = parseInt(btn.dataset.catColor, 10);
        triggerHaptic(25);
        this.setFoodCatColor(cid);
        this.closeFoodCatColorPicker();
      });
    });
  }

  closeFoodCatColorPicker() {
    const popup = this.hungerCatColorPopup || document.getElementById('hungerCatColorPopup');
    if (!popup) return;
    popup.classList.remove('is-open');
    setTimeout(() => {
      if (!popup.classList.contains('is-open')) {
        popup.style.display = 'none';
      }
    }, 220);
  }

  setupHungerScaleInteractions() {
    const track = this.hungerScaleTrack || document.getElementById('hungerScaleTrack');
    const thumb = this.hungerScaleSlider || document.getElementById('hungerScaleSlider');
    const catBox = this.hungerScaleCatBox || document.getElementById('hungerScaleCatBox');
    const closeBtn = this.btnHungerCatColorClose || document.getElementById('btnHungerCatColorClose');
    const popup = this.hungerCatColorPopup || document.getElementById('hungerCatColorPopup');

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeFoodCatColorPicker();
      });
    }

    if (!this._foodCatDocClickListener) {
      this._foodCatDocClickListener = (e) => {
        const p = this.hungerCatColorPopup || document.getElementById('hungerCatColorPopup');
        const cBox = this.hungerScaleCatBox || document.getElementById('hungerScaleCatBox');
        if (p && p.classList.contains('is-open')) {
          if (!p.contains(e.target) && !cBox?.contains(e.target)) {
            this.closeFoodCatColorPicker();
          }
        }
      };
      document.addEventListener('click', this._foodCatDocClickListener);
    }

    if (!catBox || !track || this._hungerScaleInteractionsBound) return;
    this._hungerScaleInteractionsBound = true;

    // Preload active cat images
    this.preloadFoodCatImages(this.getFoodCatColor());

    let longPressTimer = null;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let trackRect = null;
    let revertTimeout = null;

    const cancelLongPress = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const getPosPercentFromClientX = (clientX) => {
      trackRect = track.getBoundingClientRect();
      if (!trackRect || trackRect.width <= 0) return 50;
      const relX = clientX - trackRect.left;
      const pct = (relX / trackRect.width) * 100;
      return Math.max(0, Math.min(100, pct));
    };

    const onPointerDown = (e) => {
      if (e.button != null && e.button !== 0) return;
      trackRect = track.getBoundingClientRect();
      startX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      startY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      isDragging = false;

      if (revertTimeout) {
        clearTimeout(revertTimeout);
        revertTimeout = null;
      }

      cancelLongPress();
      longPressTimer = setTimeout(() => {
        longPressTimer = null;
        triggerHaptic(50);
        this.openFoodCatColorPicker();
      }, 380);
    };

    const onPointerMove = (e) => {
      const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;

      if (longPressTimer) {
        const dx = Math.abs(clientX - startX);
        const dy = Math.abs(clientY - startY);
        if (dx > 8 || dy > 8) {
          cancelLongPress();
          isDragging = true;
          if (thumb) thumb.classList.add('is-dragging');
        }
      }

      if (isDragging) {
        const pct = getPosPercentFromClientX(clientX);
        this.renderHungerScaleAtPosition(pct);
        this.showHungerScaleBubble(pct);
      }
    };

    const onPointerUp = () => {
      cancelLongPress();
      if (isDragging) {
        isDragging = false;
        if (thumb) thumb.classList.remove('is-dragging');
        if (revertTimeout) clearTimeout(revertTimeout);
        revertTimeout = setTimeout(() => {
          if (this._actualHungerScaleTargetPos != null) {
            this.animateHungerScaleTo(this._actualHungerScaleTargetPos, 500);
          }
        }, 2200);
      }
    };

    catBox.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
    window.addEventListener('touchcancel', onPointerUp, { passive: true });

    catBox.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    catBox.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cancelLongPress();
      triggerHaptic(40);
      this.openFoodCatColorPicker();
    });

    catBox.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isDragging) {
        triggerHaptic(15);
        this.showHungerScaleBubble();
      }
    });

    track.addEventListener('click', (e) => {
      if (catBox.contains(e.target)) return;
      e.stopPropagation();
      triggerHaptic(15);
      const pct = getPosPercentFromClientX(e.clientX);
      this.animateHungerScaleTo(pct, 380);
      this.showHungerScaleBubble(pct);
      if (revertTimeout) clearTimeout(revertTimeout);
      revertTimeout = setTimeout(() => {
        if (this._actualHungerScaleTargetPos != null) {
          this.animateHungerScaleTo(this._actualHungerScaleTargetPos, 500);
        }
      }, 2400);
    });
  }

  renderHungerScaleAtPosition(posPercent) {
    const thumb = this.hungerScaleSlider || document.getElementById('hungerScaleSlider');
    const fill = this.hungerScaleFill || document.getElementById('hungerScaleFill');
    const catA = this.hungerScaleCatA || document.getElementById('hungerScaleCatA');
    const catB = this.hungerScaleCatB || document.getElementById('hungerScaleCatB');
    if (!thumb) return;

    const clampedPos = Math.max(0, Math.min(100, posPercent));
    this._currentHungerScalePos = clampedPos;

    thumb.style.left = `clamp(20px, ${clampedPos}%, calc(100% - 20px))`;
    if (fill) {
      fill.style.width = `${clampedPos}%`;
    }

    // Rounding to nearest step (1..10). Middle (50%) corresponds to norm (step 5 or 6)
    let nearestStep;
    if (clampedPos <= 0) {
      nearestStep = 1;
    } else if (clampedPos >= 100) {
      nearestStep = 10;
    } else if (Math.abs(clampedPos - 50) < 0.5) {
      const ratio = this._currentHungerScaleData?.ratio ?? 1.0;
      nearestStep = (ratio >= 1.0) ? 6 : 5;
    } else {
      nearestStep = Math.max(1, Math.min(10, Math.round(1 + (clampedPos / 100) * 9)));
    }

    const colorId = this.getFoodCatColor();
    const targetSrc = this.getFoodCatUrl(colorId, nearestStep);

    if (catA && catB) {
      const activeEl = (this._activeCatLayer === 'B') ? catB : catA;
      const needsUpdate = (this._currentCatStep !== nearestStep) ||
                          (this._currentCatColor !== colorId) ||
                          (activeEl.getAttribute('src') !== targetSrc);

      if (needsUpdate) {
        const isFirstInit = !this._activeCatLayer || !activeEl.getAttribute('src');
        this._currentCatStep = nearestStep;
        this._currentCatColor = colorId;

        if (isFirstInit) {
          catA.src = targetSrc;
          catA.style.opacity = '1';
          catA.style.zIndex = '2';
          catB.style.opacity = '0';
          catB.style.zIndex = '1';
          this._activeCatLayer = 'A';
        } else {
          const useA = (this._activeCatLayer !== 'A');
          const incoming = useA ? catA : catB;
          const outgoing = useA ? catB : catA;

          incoming.src = targetSrc;
          incoming.style.zIndex = '2';
          outgoing.style.zIndex = '1';
          outgoing.style.opacity = '1'; // Solid base underneath - never semi-transparent!
          incoming.style.opacity = '1';
          this._activeCatLayer = useA ? 'A' : 'B';

          if (this._catFadeTimer) clearTimeout(this._catFadeTimer);
          this._catFadeTimer = setTimeout(() => {
            outgoing.style.opacity = '0';
          }, 140);
        }
      } else {
        // Ensure active layer is always 100% solid and non-transparent
        if (this._activeCatLayer === 'B') {
          catB.style.opacity = '1';
          catA.style.opacity = '0';
        } else {
          catA.style.opacity = '1';
          catB.style.opacity = '0';
        }
      }
    }
  }

  animateHungerScaleTo(targetPercent, duration = 650) {
    if (this._hungerAnimRaf) {
      cancelAnimationFrame(this._hungerAnimRaf);
      this._hungerAnimRaf = null;
    }

    const startPos = (this._currentHungerScalePos != null) ? this._currentHungerScalePos : 50;
    const delta = targetPercent - startPos;
    if (Math.abs(delta) < 0.2) {
      this.renderHungerScaleAtPosition(targetPercent);
      return;
    }

    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(progress);
      const curPos = startPos + delta * eased;

      this.renderHungerScaleAtPosition(curPos);

      if (progress < 1) {
        this._hungerAnimRaf = requestAnimationFrame(tick);
      } else {
        this._hungerAnimRaf = null;
        this._currentHungerScalePos = targetPercent;
        this.renderHungerScaleAtPosition(targetPercent);
      }
    };

    this._hungerAnimRaf = requestAnimationFrame(tick);
  }

  updateHungerScale(stats) {
    this._lastNutritionStats = stats;
    const box = this.nutritionHungerScaleBox || document.getElementById('nutritionHungerScaleBox');
    const thumb = this.hungerScaleSlider || document.getElementById('hungerScaleSlider');
    if (!box || !thumb) return;

    const targetCal = Math.max(1, (stats?.targets?.calories) || 2000);
    const currentCal = Math.max(0, (stats?.totalCalories) || 0);
    const calRatio = currentCal / targetCal;

    // Macro analysis (Б, Ж, У)
    const pTarget = Math.max(1, (stats?.targets?.protein) || 80);
    const fTarget = Math.max(1, (stats?.targets?.fat) || 70);
    const cTarget = Math.max(1, (stats?.targets?.carbs) || 250);

    const pCur = Math.max(0, (stats?.totalProtein) || 0);
    const fCur = Math.max(0, (stats?.totalFat) || 0);
    const cCur = Math.max(0, (stats?.totalCarbs) || 0);

    const pRatio = pCur / pTarget;
    const fRatio = fCur / fTarget;
    const cRatio = cCur / cTarget;

    const macroList = [
      { key: 'protein', name: 'Белки', ratio: pRatio, current: pCur, target: pTarget },
      { key: 'fat', name: 'Жиры', ratio: fRatio, current: fCur, target: fTarget },
      { key: 'carbs', name: 'Углеводы', ratio: cRatio, current: cCur, target: cTarget }
    ];
    macroList.sort((a, b) => b.ratio - a.ratio);
    const maxMacro = macroList[0];

    // Option 1: Smart cat responsive to macro overflow
    // Base position is calRatio. If any macro overflows (>105%), the cat reacts to the excess!
    let effectiveRatio = calRatio;
    let isMacroOver = false;

    if (maxMacro && maxMacro.ratio > 1.05) {
      isMacroOver = true;
      if (calRatio >= 1.0) {
        effectiveRatio = Math.max(calRatio, 0.6 * calRatio + 0.4 * maxMacro.ratio);
      } else {
        // Calories not yet at 100%, but strong macro excess (e.g. fats 380%)
        effectiveRatio = Math.max(calRatio, 0.5 * calRatio + 0.5 * maxMacro.ratio);
      }
    }

    // Normal position: 0% at 0 kcal, 50% at 100% target (center notch), up to 100% at >=180% target
    let posPercent = 50;
    if (effectiveRatio <= 1.0) {
      posPercent = Math.min(50, Math.round(effectiveRatio * 50));
    } else {
      const overProgress = Math.min(1, (effectiveRatio - 1.0) / 0.8);
      posPercent = Math.round(50 + (overProgress * 50));
    }
    posPercent = Math.max(0, Math.min(100, posPercent));

    this._actualHungerScaleTargetPos = posPercent;

    // Smooth transition with crossfade through intermediate steps
    this.animateHungerScaleTo(posPercent, 650);

    // 10 Steps descriptions
    let stepIndex;
    if (posPercent <= 0) {
      stepIndex = 1;
    } else if (posPercent >= 100) {
      stepIndex = 10;
    } else if (Math.abs(posPercent - 50) < 0.5) {
      stepIndex = (effectiveRatio >= 1.0) ? 6 : 5;
    } else {
      stepIndex = Math.max(1, Math.min(10, Math.round(1 + (posPercent / 100) * 9)));
    }
    const stepTitles = [
      'Самый голодный кот 😿',
      'Очень голоден 🥺',
      'Проголодался 🐱',
      'Легкий аппетит 🙂',
      'Почти сыт (Перед нормой) 🐾',
      'Идеальная норма! Сыт и счастлив ✨',
      'Сытно перекусил 🥐',
      'Сыт с запасом 🍰',
      'Объелся 🍩',
      'Самый толстый кот 😺'
    ];
    const stepDescs = [
      'Организм требует подкрепления! Срочно поешьте.',
      'Животик урчит, пора запланировать приём пищи.',
      'Время подкрепиться, чтобы не терять энергию.',
      'Ещё немного калорий до дневной целевой нормы.',
      'Кот в отличной здоровой форме, цель почти достигнута!',
      'Целевая норма калорий выполнена! Баланс на 100%.',
      'Плотная еда, калории слегка выше дневной цели.',
      'Калории с заметным запасом. Дайте желудку отдых.',
      'Существенное превышение нормы на сегодня.',
      'Максимальное переедание! Настоящий пухлый колобок.'
    ];

    const diff = Math.max(0, Math.round(targetCal - currentCal));
    const over = Math.max(0, Math.round(currentCal - targetCal));

    let detail = stepDescs[stepIndex - 1];
    if (isMacroOver && maxMacro && maxMacro.ratio > 1.1) {
      const macroPct = Math.round(maxMacro.ratio * 100);
      if (calRatio <= 1.0) {
        detail += ` (Перебор: ${maxMacro.name} ${macroPct}% ⚠️)`;
      } else {
        detail += ` (+${over} ккал, ${maxMacro.name} ${macroPct}% ⚠️)`;
      }
    } else if (calRatio <= 1.0 && diff > 0) {
      detail += ` (Осталось ${diff} ккал до нормы)`;
    } else if (calRatio > 1.0 && over > 0) {
      detail += ` (+${over} ккал выше цели)`;
    }

    this._currentHungerScaleData = {
      ratio: effectiveRatio,
      effectiveRatio,
      calRatio,
      maxMacro,
      isMacroOver,
      currentCal,
      targetCal,
      stepIndex,
      title: `${stepTitles[stepIndex - 1]} [Ступень ${stepIndex}/10]`,
      desc: detail,
      posPercent
    };
  }

  showHungerScaleBubble(customPos = null) {
    const popup = this.hungerCatColorPopup || document.getElementById('hungerCatColorPopup');
    if (popup && popup.classList.contains('is-open')) return;

    const bubble = this.hungerScaleBubble || document.getElementById('hungerScaleBubble');
    if (!bubble) return;

    const data = this._currentHungerScaleData;
    if (!data) return;

    const activePos = customPos != null ? customPos : data.posPercent;
    let stepIndex;
    if (activePos <= 0) {
      stepIndex = 1;
    } else if (activePos >= 100) {
      stepIndex = 10;
    } else if (Math.abs(activePos - 50) < 0.5) {
      stepIndex = (data.ratio >= 1.0) ? 6 : 5;
    } else {
      stepIndex = Math.max(1, Math.min(10, Math.round(1 + (activePos / 100) * 9)));
    }

    const stepTitles = [
      'Самый голодный кот 😿',
      'Очень голоден 🥺',
      'Проголодался 🐱',
      'Легкий аппетит 🙂',
      'Почти сыт (Перед нормой) 🐾',
      'Идеальная норма! Сыт и счастлив ✨',
      'Сытно перекусил 🥐',
      'Сыт с запасом 🍰',
      'Объелся 🍩',
      'Самый толстый кот 😺'
    ];

    const iconEl = bubble.querySelector('.hunger-bubble-icon');
    const titleEl = bubble.querySelector('.hunger-bubble-title');
    const descEl = bubble.querySelector('.hunger-bubble-desc');

    const colorId = this.getFoodCatColor();
    const catSrc = this.getFoodCatUrl(colorId, stepIndex);

    if (iconEl) {
      iconEl.innerHTML = `<img src="${catSrc}" style="width:26px;height:26px;object-fit:contain;vertical-align:middle;" alt="Cat" draggable="false" />`;
    }
    if (titleEl) {
      const displayPct = customPos != null
        ? Math.round(customPos <= 50 ? customPos * 2 : 100 + (customPos - 50) * 1.6)
        : Math.round((data.effectiveRatio || data.ratio) * 100);
      titleEl.textContent = `${stepTitles[stepIndex - 1]} (${displayPct}%)`;
    }
    if (descEl) {
      descEl.textContent = data.desc;
    }

    bubble.style.left = `clamp(24px, ${activePos}%, calc(100% - 24px))`;
    bubble.classList.add('is-visible');

    clearTimeout(this._hungerBubbleTimeout);
    this._hungerBubbleTimeout = setTimeout(() => {
      bubble.classList.remove('is-visible');
    }, 3500);
  }

  // --- Modal Open / Close / Render ---
  openNutritionModal(date = null) {
    this.dismissActiveKeyboard();
    if (!this.nutritionModalBackdrop) return;
    this._nutritionModalOpenedAt = Date.now();

    this.currentNutritionDate = date || this.selectedDate || this.getTodayDateString();
    const todayStr = this.getTodayDateString();
    this.isNutritionArchiveMode = !!(this.currentNutritionDate && this.currentNutritionDate < todayStr);
    this.nutritionSelectedMealFilterId = null;

    const sheet = this.nutritionModalBackdrop.querySelector('.nutrition-sheet');
    if (sheet) {
      sheet.classList.toggle('is-archive-mode', !!this.isNutritionArchiveMode);
    }
    this.nutritionModalBackdrop.classList.toggle('is-archive-mode', !!this.isNutritionArchiveMode);

    if (this.nutritionHeaderDate) {
      this.nutritionHeaderDate.textContent = this.formatDateReadable(this.currentNutritionDate);
    }

    this.nutritionModalBackdrop.classList.add('open');
    this.nutritionModalBackdrop.setAttribute('aria-hidden', 'false');

    this.renderNutritionModalContent();
  }

  closeNutritionModal() {
    if (this.nutritionModalBackdrop) {
      this.nutritionModalBackdrop.classList.remove('open');
      this.nutritionModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  renderNutritionModalContent() {
    if (!this.nutritionTracker || !this.nutritionModalBackdrop) return;
    this.applyMacroColors();
    const protColor = this.nutritionTracker.getMacroColor('protein') || '#3b82f6';
    const fatColor = this.nutritionTracker.getMacroColor('fat') || '#f59e0b';
    const carbColor = this.nutritionTracker.getMacroColor('carbs') || '#10b981';
    const protRgb = this.hexToRgb(protColor) || { r: 59, g: 130, b: 246 };
    const fatRgb = this.hexToRgb(fatColor) || { r: 245, g: 158, b: 11 };
    const carbRgb = this.hexToRgb(carbColor) || { r: 16, g: 185, b: 129 };

    // Hide edit/add and test controls in archive mode
    if (this.btnNutritionAddCategory) {
      this.btnNutritionAddCategory.style.display = this.isNutritionArchiveMode ? 'none' : 'inline-flex';
    }
    if (this.btnNutritionStats) {
      this.btnNutritionStats.style.display = this.isNutritionArchiveMode ? 'none' : 'inline-flex';
    }
    const targetDate = this.currentNutritionDate || this.selectedDate || this.getTodayDateString();
    const stats = this.nutritionTracker.getStatsForDate(targetDate);

    // 1. Render Left SVG Donut
    if (this.nutritionDonutContainer) {
      this.nutritionDonutContainer.innerHTML = this.nutritionTracker.generateRingSvg(stats, {
        selectedMealId: this.nutritionSelectedMealFilterId
      });
    }

    // 2. Interactive Donut Center Display
    if (this.nutritionSelectedMealFilterId) {
      const meal = stats.allMealsWithStatus.find(m => m.mealId === this.nutritionSelectedMealFilterId);
      const mealCal = meal ? meal.calories : 0;
      const mealName = meal ? meal.name : 'Приём пищи';

      if (this.nutritionDonutCenterVal) this.nutritionDonutCenterVal.textContent = mealCal;
      if (this.nutritionDonutCenterTarget) this.nutritionDonutCenterTarget.textContent = 'ккал';
      if (this.nutritionDonutCenterSub) this.nutritionDonutCenterSub.textContent = mealName;

      if (this.nutritionSelectedMealBadge) {
        this.nutritionSelectedMealBadge.style.display = 'inline-flex';
        if (this.nutritionFilterIcon) this.nutritionFilterIcon.innerHTML = this.nutritionTracker.renderMealIcon(meal?.icon, meal?.name);
        if (this.nutritionFilterName) this.nutritionFilterName.textContent = `${mealName}: ${mealCal} ккал`;
      }
    } else {
      if (this.nutritionDonutCenterVal) this.nutritionDonutCenterVal.textContent = stats.totalCalories;
      if (this.nutritionDonutCenterTarget) this.nutritionDonutCenterTarget.textContent = `/ ${stats.targets.calories} ккал`;
      if (this.nutritionDonutCenterSub) this.nutritionDonutCenterSub.textContent = this.t('nutrition_all_day_calories') || 'за день';

      if (this.nutritionSelectedMealBadge) {
        this.nutritionSelectedMealBadge.style.display = 'none';
      }
    }

    // 3. Render 3 Vertical Bars (Б, Ж, У) with overflow line & warnings
    if (this.nutritionMacroBarsContainer) {
      this.nutritionMacroBarsContainer.innerHTML = this.nutritionTracker.generateMacroBarsHtml(stats);
      this.attachMacroBarLongPressEvents();
    }

    // 3.5. Update Interactive Hunger & Norm Balance Scale
    this.updateHungerScale(stats);

    // 4. Attach Click Events on Donut Sectors and Meal Badges
    if (this.nutritionDonutContainer) {
      this.nutritionDonutContainer.querySelectorAll('.nutrition-donut-sector, .nutrition-donut-icon-group').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const mealId = el.dataset.mealId;
          triggerHaptic(15);
          if (this.nutritionSelectedMealFilterId === mealId) {
            this.nutritionSelectedMealFilterId = null;
          } else {
            this.nutritionSelectedMealFilterId = mealId;
          }
          this.renderNutritionModalContent();
        });
      });
    }

    // 4.5. Render Horizontal Meals Filter Bar (Icons only, acts as filter)
    if (this.nutritionMealsFilterBar) {
      const allMeals = this.nutritionTracker.getMeals();
      this.nutritionMealsFilterBar.innerHTML = allMeals.map(meal => {
        const isSelected = meal.id === this.nutritionSelectedMealFilterId;
        return `
          <button type="button" 
                  class="meal-filter-item ${isSelected ? 'is-selected' : ''}" 
                  data-meal-id="${escapeHtml(meal.id)}" 
                  title="${escapeHtml(meal.name)}" 
                  aria-label="${escapeHtml(meal.name)}" 
                  aria-pressed="${isSelected}">
            ${this.nutritionTracker.renderMealIcon(meal.icon, meal.name, 'meal-filter-icon-img')}
          </button>
        `;
      }).join('');

      this.nutritionMealsFilterBar.querySelectorAll('.meal-filter-item').forEach(btn => {
        let pressTimer = null;
        let isLongPress = false;
        let startX = 0, startY = 0;

        const onPointerDown = (e) => {
          if (this.isNutritionArchiveMode) return;
          isLongPress = false;
          startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
          startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
          clearTimeout(pressTimer);
          pressTimer = setTimeout(() => {
            isLongPress = true;
            triggerHaptic(30);
            const mealId = btn.dataset.mealId;
            if (mealId) this.openMealEditModal(mealId);
          }, 500);
        };

        const onPointerMove = (e) => {
          const cx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
          const cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
          if (Math.abs(cx - startX) > 8 || Math.abs(cy - startY) > 8) {
            clearTimeout(pressTimer);
          }
        };

        const onPointerUp = () => {
          clearTimeout(pressTimer);
        };

        btn.addEventListener('pointerdown', onPointerDown, { passive: true });
        btn.addEventListener('pointermove', onPointerMove, { passive: true });
        btn.addEventListener('pointerup', onPointerUp, { passive: true });
        btn.addEventListener('pointercancel', onPointerUp, { passive: true });

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isLongPress) return;
          const mealId = btn.dataset.mealId;
          triggerHaptic(15);
          if (this.nutritionSelectedMealFilterId === mealId) {
            this.nutritionSelectedMealFilterId = null;
          } else {
            this.nutritionSelectedMealFilterId = mealId;
          }
          this.renderNutritionModalContent();
        });
      });

      if (!this.nutritionMealsFilterBar._wheelBound) {
        this.nutritionMealsFilterBar._wheelBound = true;
        this.nutritionMealsFilterBar.addEventListener('wheel', (e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            this.nutritionMealsFilterBar.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }, { passive: false });
      }

      if (this.nutritionSelectedMealFilterId) {
        const activeBtn = this.nutritionMealsFilterBar.querySelector('.meal-filter-item.is-selected');
        if (activeBtn) {
          activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }

    // 5. Render Daily Meals Breakdown List
    if (this.nutritionMealsList) {
      const isFiltered = !!this.nutritionSelectedMealFilterId;
      const mealsToDisplay = stats.allMealsWithStatus.filter(m => {
        if (isFiltered) return m.mealId === this.nutritionSelectedMealFilterId;
        return m.entries.length > 0 || !this.isNutritionArchiveMode;
      });

      if (stats.entryCount === 0 && !isFiltered) {
        this.nutritionMealsList.innerHTML = '';
        if (this.nutritionEmptyHint) this.nutritionEmptyHint.style.display = 'block';
      } else {
        if (this.nutritionEmptyHint) this.nutritionEmptyHint.style.display = 'none';

        this.nutritionMealsList.innerHTML = mealsToDisplay.map(meal => {
          const entriesHtml = meal.entries.length > 0 ? meal.entries.map(entry => `
            <div class="nutrition-food-row-wrapper" data-entry-id="${escapeHtml(entry.id)}" data-meal-id="${escapeHtml(meal.mealId)}" style="border-color: ${meal.color || 'var(--meal-accent, var(--primary-magenta, #d83a88))'};">
              ${!this.isNutritionArchiveMode ? `
                <div class="nutrition-swipe-actions-right">
                  <button type="button" class="swipe-action-btn action-edit" data-action="edit" data-entry-id="${escapeHtml(entry.id)}" title="Редактировать" aria-label="Редактировать">
                    <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button type="button" class="swipe-action-btn action-delete" data-action="delete" data-entry-id="${escapeHtml(entry.id)}" title="Удалить" aria-label="Удалить">
                    <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ` : ''}
              <div class="nutrition-food-entry-item">
                <div class="nutrition-food-info">
                  <div class="nutrition-food-name">${escapeHtml(entry.name)}</div>
                  <div class="nutrition-food-meta">
                    <span class="food-meta-weight">${entry.weightGrams} г</span>
                    <span class="food-meta-dot">•</span>
                    <span class="food-meta-kcal"><strong>${entry.calories} ккал</strong></span>
                    <span class="food-meta-dot">•</span>
                    <span class="food-meta-macros">
                      <span class="food-macro-pill prot" style="color: ${protColor}; background: rgba(${protRgb.r}, ${protRgb.g}, ${protRgb.b}, 0.15);">Б:${entry.protein}</span>
                      <span class="food-macro-pill fat" style="color: ${fatColor}; background: rgba(${fatRgb.r}, ${fatRgb.g}, ${fatRgb.b}, 0.15);">Ж:${entry.fat}</span>
                      <span class="food-macro-pill carb" style="color: ${carbColor}; background: rgba(${carbRgb.r}, ${carbRgb.g}, ${carbRgb.b}, 0.15);">У:${entry.carbs}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          `).join('') : `<div style="padding: 10px 14px; font-size: 12px; color: #94a3b8; font-style: italic; text-align: center;">Пока ничего не добавлено</div>`;

          const isSelectedMeal = meal.mealId === this.nutritionSelectedMealFilterId;
          return `
            <div class="nutrition-meal-group-card ${isSelectedMeal ? 'is-selected' : ''}" style="--meal-accent: ${meal.color || 'var(--primary-magenta, #d83a88)'};">
              <div class="nutrition-meal-group-header" data-meal-id="${escapeHtml(meal.mealId)}" style="cursor: pointer;" title="Нажмите для выделения сектора на кольце">
                <div class="nutrition-meal-group-title">
                  <span class="meal-group-icon">${this.nutritionTracker.renderMealIcon(meal.icon, meal.name)}</span>
                  <span>${escapeHtml(meal.name)}</span>
                </div>
                <div class="nutrition-meal-group-badge" style="color: ${meal.color || 'var(--primary-magenta, #d83a88)'};">
                  ${meal.calories} ккал
                </div>
              </div>
              <div class="nutrition-meal-group-entries">
                ${entriesHtml}
              </div>
            </div>
          `;
        }).join('');

        // Bind meal group headers to toggle donut sector selection
        this.nutritionMealsList.querySelectorAll('.nutrition-meal-group-header').forEach(header => {
          header.addEventListener('click', (e) => {
            e.stopPropagation();
            const mealId = header.dataset.mealId;
            triggerHaptic(15);
            if (this.nutritionSelectedMealFilterId === mealId) {
              this.nutritionSelectedMealFilterId = null;
            } else {
              this.nutritionSelectedMealFilterId = mealId;
            }
            this.renderNutritionModalContent();
          });
        });

        // Attach swipe gestures for revealing Edit & Delete buttons
        this.attachNutritionSwipeEvents();
      }
    }

    // 6. Archive Mode & Filter Display Adjustments for Add Food Button
    if (this.nutritionBottomBar) {
      const showAddFoodBtn = !this.isNutritionArchiveMode && !!this.nutritionSelectedMealFilterId;
      this.nutritionBottomBar.style.display = showAddFoodBtn ? 'flex' : 'none';
    }
    if (this.nutritionArchiveActions) {
      this.nutritionArchiveActions.style.display = this.isNutritionArchiveMode ? 'block' : 'none';
    }
  }

  // Attach touch and drag swipe gestures for nutrition food rows (revealing Edit & Delete buttons)
  attachNutritionSwipeEvents() {
    if (!this.nutritionMealsList || this.isNutritionArchiveMode) return;
    const wrappers = this.nutritionMealsList.querySelectorAll('.nutrition-food-row-wrapper');
    if (!wrappers.length) return;
    let activeOpenWrapper = null;

    const snapOpen = (w) => {
      if (!w) return;
      w.classList.add('open');
      activeOpenWrapper = w;
      const r = w.querySelector('.nutrition-food-entry-item');
      const a = w.querySelector('.nutrition-swipe-actions-right');
      if (r) {
        r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        r.style.transform = 'translate3d(-92px, 0, 0)';
      }
      if (a) {
        a.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        a.style.transform = 'translate3d(0px, 0, 0)';
      }
      setTimeout(() => {
        if (w.classList.contains('open') && !w.classList.contains('swiping')) {
          if (r) { r.style.transition = ''; r.style.transform = ''; }
          if (a) { a.style.transition = ''; a.style.transform = ''; }
        }
      }, 240);
    };

    const closeWrapper = (w, animated = true) => {
      if (!w) return;
      const r = w.querySelector('.nutrition-food-entry-item');
      const a = w.querySelector('.nutrition-swipe-actions-right');
      if (animated) {
        if (r) {
          r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          r.style.transform = 'translate3d(0, 0, 0)';
        }
        if (a) {
          a.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          a.style.transform = 'translate3d(100%, 0, 0)';
        }
        w.classList.remove('open', 'swiping');
        setTimeout(() => {
          if (!w.classList.contains('open') && !w.classList.contains('swiping')) {
            if (r) { r.style.transition = ''; r.style.transform = ''; }
            if (a) { a.style.transition = ''; a.style.transform = ''; }
          }
        }, 240);
      } else {
        w.classList.remove('open', 'swiping');
        if (r) { r.style.transform = ''; r.style.transition = ''; }
        if (a) { a.style.transform = ''; a.style.transition = ''; }
      }
      if (activeOpenWrapper === w) activeOpenWrapper = null;
    };

    const closeAllSwipes = (animated = true) => {
      wrappers.forEach(w => {
        if (w.classList.contains('open') || w.classList.contains('swiping')) {
          closeWrapper(w, animated);
        }
      });
      activeOpenWrapper = null;
    };

    // Close on outside tap
    const outsideTapHandler = (e) => {
      if (activeOpenWrapper && !activeOpenWrapper.contains(e.target)) {
        closeAllSwipes(true);
      }
    };
    if (this._nutritionSwipeOutsideHandler) {
      document.removeEventListener('pointerdown', this._nutritionSwipeOutsideHandler);
    }
    this._nutritionSwipeOutsideHandler = outsideTapHandler;
    document.addEventListener('pointerdown', this._nutritionSwipeOutsideHandler, { passive: true });

    // Handle button clicks in swipe panel
    wrappers.forEach(wrapper => {
      const actionsRight = wrapper.querySelector('.nutrition-swipe-actions-right');
      if (actionsRight) {
        actionsRight.querySelectorAll('.swipe-action-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const entryId = btn.dataset.entryId || wrapper.dataset.entryId;
            triggerHaptic(20);
            closeAllSwipes(false);

            if (action === 'edit') {
              this.openAddFoodModal(wrapper.dataset.mealId, entryId);
            } else if (action === 'delete') {
              if (entryId) {
                const entry = this.nutritionTracker?.getEntry ? this.nutritionTracker.getEntry(entryId) : null;
                const foodName = entry?.name ? ` «${entry.name}»` : '';
                const title = this.t('nutrition_delete_entry_title') || 'Удалить запись?';
                const message = (this.t('nutrition_delete_entry_confirm') || 'Удалить{foodName} из дневника питания?')
                  .replace('{foodName}', foodName);

                this.showConfirmModal({
                  title,
                  message,
                  icon: '🗑️',
                  confirmText: this.t('delete') || 'Удалить',
                  onConfirm: () => {
                    this.nutritionTracker.deleteEntry(entryId);
                    this.showToast(this.t('nutrition_toast_entry_deleted') || 'Запись удалена', '🗑️');
                    this.renderNutritionModalContent();
                    this.updateNutritionWidget();
                    this.updateNutritionArchiveStamp();
                  }
                });
              }
            }
          });
        });
      }

      const row = wrapper.querySelector('.nutrition-food-entry-item');
      if (!row) return;

      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let isHorizontal = null;
      let rafId = null;
      const actionsWidth = 92;
      const openThreshold = -30;

      const handleStart = (clientX, clientY, target) => {
        if (target && target.closest('.swipe-action-btn, button')) {
          return false;
        }
        if (activeOpenWrapper && activeOpenWrapper !== wrapper) {
          closeAllSwipes(true);
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
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            isHorizontal = Math.abs(dx) > Math.abs(dy);
          }
        }

        if (!isHorizontal) return;

        if (!isDragging) {
          isDragging = true;
          try { window.getSelection()?.removeAllRanges(); } catch (err) { }
        }

        if (e && e.cancelable) e.preventDefault();

        const maxLeftSwipe = -actionsWidth;
        let translateX = dx;
        if (wrapper.classList.contains('open')) {
          translateX = maxLeftSwipe + dx;
          if (translateX > 0) {
            translateX = translateX * 0.2;
          } else if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.2;
          }
        } else {
          if (translateX > 0) {
            translateX = translateX * 0.2;
          } else if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.25;
          }
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;
          if (wrapper.classList.contains('open')) {
            const actionsOffset = Math.max(0, actionsWidth + translateX);
            if (actionsRight) actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
          } else {
            if (translateX < 0) {
              const actionsOffset = Math.max(0, actionsWidth + translateX);
              if (actionsRight) actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
            } else {
              if (actionsRight) actionsRight.style.transform = 'translate3d(100%, 0, 0)';
            }
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

        const wasDragging = isDragging;
        isDragging = false;

        if (!wasDragging) {
          if (wrapper.classList.contains('open') && (!target || !target.closest('.nutrition-swipe-actions-right'))) {
            closeAllSwipes(true);
          }
          return;
        }

        const dx = clientX - startX;
        if (wrapper.classList.contains('open')) {
          if (dx > 25) {
            closeWrapper(wrapper, true);
            triggerHaptic(15);
          } else {
            snapOpen(wrapper);
          }
        } else {
          if (dx < openThreshold) {
            closeAllSwipes(true);
            snapOpen(wrapper);
            triggerHaptic(15);
          } else {
            closeWrapper(wrapper, true);
          }
        }
      };

      // Pointer events for desktop and mobile touch
      if (window.PointerEvent) {
        row.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (!handleStart(e.clientX, e.clientY, e.target)) return;

          const onPointerMove = (moveEvt) => handleMove(moveEvt.clientX, moveEvt.clientY, moveEvt);
          const onPointerUp = (upEvt) => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
            handleEnd(upEvt.clientX, upEvt.target);
          };

          document.addEventListener('pointermove', onPointerMove, { passive: false });
          document.addEventListener('pointerup', onPointerUp, { passive: true });
          document.addEventListener('pointercancel', onPointerUp, { passive: true });
        });
      } else {
        row.addEventListener('touchstart', (e) => {
          const touch = e.touches[0];
          if (!touch || !handleStart(touch.clientX, touch.clientY, e.target)) return;

          const onTouchMove = (moveEvt) => {
            const t = moveEvt.touches[0];
            if (t) handleMove(t.clientX, t.clientY, moveEvt);
          };
          const onTouchEnd = (endEvt) => {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchEnd);
            const t = endEvt.changedTouches[0];
            handleEnd(t ? t.clientX : 0, endEvt.target);
          };

          document.addEventListener('touchmove', onTouchMove, { passive: false });
          document.addEventListener('touchend', onTouchEnd, { passive: true });
          document.addEventListener('touchcancel', onTouchEnd, { passive: true });
        }, { passive: true });
      }
    });
  }

  setupTargetSteppers(container = document) {
    container.querySelectorAll('.btn-target-step[data-target]:not([data-stepper-bound])').forEach(btn => {
      btn.setAttribute('data-stepper-bound', 'true');
      let intervalId = null;
      let timeoutId = null;

      const performStep = () => {
        const targetId = btn.dataset.target;
        const step = parseFloat(btn.dataset.step) || 0;
        const min = parseFloat(btn.dataset.min) || 0;
        const max = parseFloat(btn.dataset.max) || 10000;
        const inp = document.getElementById(targetId);
        if (!inp) return;

        let curVal = parseFloat(String(inp.value).replace(',', '.')) || 0;
        let newVal = Math.max(min, Math.min(max, curVal + step));
        newVal = Math.round(newVal * 10) / 10;
        if (newVal !== curVal) {
          inp.value = newVal;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          triggerHaptic(10);
        }
      };

      const clearTimers = () => {
        if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
      };

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.dismissActiveKeyboard();
        performStep();
        clearTimers();
        timeoutId = setTimeout(() => {
          intervalId = setInterval(performStep, 90);
        }, 320);
      });

      btn.addEventListener('pointerup', clearTimers);
      btn.addEventListener('pointerleave', clearTimers);
      btn.addEventListener('pointercancel', clearTimers);
    });
  }

  // --- Add Food Modal & Calculations ---
  openAddFoodModal(prefillMealId = null, editEntryId = null) {
    this.dismissActiveKeyboard();
    if (!this.nutritionAddFoodModalBackdrop) return;
    this._nutritionAddFoodOpenedAt = Date.now();
    this.applyMacroColors();
    this.editingNutritionEntryId = editEntryId || null;
    this.setupTargetSteppers();

    const editEntry = editEntryId ? this.nutritionTracker.getEntry(editEntryId) : null;
    const meals = this.nutritionTracker.getMeals();
    const targetMealId = editEntry ? editEntry.mealId : (prefillMealId || this.nutritionSelectedMealFilterId || (meals[0] ? meals[0].id : 'meal_breakfast'));

    // Update modal title with group name
    const selectedMeal = meals.find(m => m.id === targetMealId) || meals[0];
    const titleEl = document.getElementById('nutritionAddFoodTitle');
    if (titleEl) {
      if (editEntry) {
        titleEl.textContent = selectedMeal ? `Редактировать • ${selectedMeal.name}` : 'Редактировать запись';
      } else if (selectedMeal) {
        titleEl.textContent = `${this.t('nutrition_btn_add_food') || 'Добавить еду'} • ${selectedMeal.name}`;
      } else {
        titleEl.textContent = this.t('nutrition_btn_add_food') || 'Добавить еду';
      }
    }

    const populateSelect = (selectEl, previewEl) => {
      if (!selectEl) return;
      selectEl.innerHTML = meals.map(m => `
        <option value="${escapeHtml(m.id)}" ${m.id === targetMealId ? 'selected' : ''}>${escapeHtml(m.name)}</option>
      `).join('');
      selectEl.value = targetMealId;
      if (previewEl && selectedMeal) {
        previewEl.innerHTML = this.nutritionTracker.renderMealIcon(selectedMeal.icon, selectedMeal.name);
      }
    };

    populateSelect(this.singleFoodMealSelect, this.singleMealPreviewIcon);
    populateSelect(this.compositeMealSelect, this.compositeMealPreviewIcon);

    if (editEntry) {
      if (editEntry.foodType === 'composite') {
        // Composite dish editing
        if (this.compositeDishName) {
          this.compositeDishName.value = editEntry.name || '';
          if (editEntry.recipeId) this.compositeDishName.dataset.activeRecipeId = editEntry.recipeId;
          else delete this.compositeDishName.dataset.activeRecipeId;
        }
        if (this.compositeDishSuggestions) this.compositeDishSuggestions.style.display = 'none';
        this.currentCompositeIngredients = (editEntry.rawIngredients && editEntry.rawIngredients.length > 0)
          ? editEntry.rawIngredients.map(ing => ({
              name: ing.name || '',
              rawWeight: ing.rawWeight || 100,
              calories100g: ing.calories100g ?? ing.caloriesPer100g ?? (ing.rawWeight ? Math.round(((ing.calories || 0) / ing.rawWeight) * 100) : 0),
              protein100g: ing.protein100g ?? ing.proteinPer100g ?? (ing.rawWeight ? Math.round((((ing.protein || 0) / ing.rawWeight) * 100) * 10) / 10 : 0),
              fat100g: ing.fat100g ?? ing.fatPer100g ?? (ing.rawWeight ? Math.round((((ing.fat || 0) / ing.rawWeight) * 100) * 10) / 10 : 0),
              carbs100g: ing.carbs100g ?? ing.carbsPer100g ?? (ing.rawWeight ? Math.round((((ing.carbs || 0) / ing.rawWeight) * 100) * 10) / 10 : 0),
              isCollapsed: true
            }))
          : [{
              name: editEntry.name || '',
              rawWeight: editEntry.weightGrams || 100,
              calories100g: Math.round(((editEntry.calories || 0) / (editEntry.weightGrams || 1)) * 100),
              protein100g: Math.round((((editEntry.protein || 0) / (editEntry.weightGrams || 1)) * 100) * 10) / 10,
              fat100g: Math.round((((editEntry.fat || 0) / (editEntry.weightGrams || 1)) * 100) * 10) / 10,
              carbs100g: Math.round((((editEntry.carbs || 0) / (editEntry.weightGrams || 1)) * 100) * 10) / 10,
              isCollapsed: true
            }];
        if (this.compositeCookedWeight) this.compositeCookedWeight.value = editEntry.cookedWeight || editEntry.weightGrams || '';
        if (this.compositePortionEaten) this.compositePortionEaten.value = editEntry.portionWeight || editEntry.weightGrams || '';

        this.renderCompositeIngredientsList();
        this.recalculateCompositeDish();

        if (this.tabFoodSingle && this.tabFoodComposite) {
          this.tabFoodSingle.classList.remove('active');
          this.tabFoodComposite.classList.add('active');
          if (this.paneFoodSingle) this.paneFoodSingle.style.display = 'none';
          if (this.paneFoodComposite) this.paneFoodComposite.style.display = 'block';
        }
      } else {
        // Single food editing
        if (this.singleFoodName) {
          this.singleFoodName.value = editEntry.name || '';
          if (editEntry.barcode) this.singleFoodName.dataset.scannedBarcode = editEntry.barcode;
          else delete this.singleFoodName.dataset.scannedBarcode;
        }
        const w = editEntry.weightGrams || 100;
        if (this.singleFoodWeight) this.singleFoodWeight.value = w;
        if (editEntry.per100g) {
          if (this.singleFoodKcal100) this.singleFoodKcal100.value = editEntry.per100g.calories || 0;
          if (this.singleFoodProt100) this.singleFoodProt100.value = editEntry.per100g.protein || 0;
          if (this.singleFoodFat100) this.singleFoodFat100.value = editEntry.per100g.fat || 0;
          if (this.singleFoodCarb100) this.singleFoodCarb100.value = editEntry.per100g.carbs || 0;
        } else {
          if (this.singleFoodKcal100) this.singleFoodKcal100.value = Math.round(((editEntry.calories || 0) / w) * 100);
          if (this.singleFoodProt100) this.singleFoodProt100.value = Math.round((((editEntry.protein || 0) / w) * 100) * 10) / 10;
          if (this.singleFoodFat100) this.singleFoodFat100.value = Math.round((((editEntry.fat || 0) / w) * 100) * 10) / 10;
          if (this.singleFoodCarb100) this.singleFoodCarb100.value = Math.round((((editEntry.carbs || 0) / w) * 100) * 10) / 10;
        }
        if (this.singleFoodSuggestions) this.singleFoodSuggestions.style.display = 'none';
        this.recalculateSingleFoodPortion();

        if (this.tabFoodSingle && this.tabFoodComposite) {
          this.tabFoodSingle.classList.add('active');
          this.tabFoodComposite.classList.remove('active');
          if (this.paneFoodSingle) this.paneFoodSingle.style.display = 'block';
          if (this.paneFoodComposite) this.paneFoodComposite.style.display = 'none';
        }
      }
    } else {
      // Reset single food fields
      if (this.singleFoodName) {
        this.singleFoodName.value = '';
        delete this.singleFoodName.dataset.scannedBarcode;
      }
      if (this.singleFoodWeight) this.singleFoodWeight.value = '100';
      if (this.singleFoodKcal100) this.singleFoodKcal100.value = '0';
      if (this.singleFoodProt100) this.singleFoodProt100.value = '0';
      if (this.singleFoodFat100) this.singleFoodFat100.value = '0';
      if (this.singleFoodCarb100) this.singleFoodCarb100.value = '0';
      if (this.singleFoodSuggestions) this.singleFoodSuggestions.style.display = 'none';

      this.recalculateSingleFoodPortion();

      // Reset composite fields
      if (this.compositeDishName) {
        this.compositeDishName.value = '';
        delete this.compositeDishName.dataset.activeRecipeId;
      }
      if (this.compositeDishSuggestions) {
        this.compositeDishSuggestions.style.display = 'none';
      }
      this.currentCompositeIngredients = [
        { name: '', rawWeight: 100, calories100g: 0, protein100g: 0, fat100g: 0, carbs100g: 0, isCollapsed: false }
      ];
      if (this.compositeCookedWeight) this.compositeCookedWeight.value = '';
      if (this.compositePortionEaten) this.compositePortionEaten.value = '';

      this.renderCompositeIngredientsList();
      this.recalculateCompositeDish();

      // Default to Single Food tab
      if (this.tabFoodSingle && this.tabFoodComposite) {
        this.tabFoodSingle.classList.add('active');
        this.tabFoodComposite.classList.remove('active');
        if (this.paneFoodSingle) this.paneFoodSingle.style.display = 'block';
        if (this.paneFoodComposite) this.paneFoodComposite.style.display = 'none';
      }
    }

    this.nutritionAddFoodModalBackdrop.classList.add('open');
    this.nutritionAddFoodModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeAddFoodModal() {
    this.editingNutritionEntryId = null;
    const titleEl = document.getElementById('nutritionAddFoodTitle');
    if (titleEl) {
      titleEl.textContent = this.t('nutrition_btn_add_food') || 'Добавить еду';
    }
    if (this.singleFoodSuggestions) {
      this.singleFoodSuggestions.style.display = 'none';
    }
    if (this.compositeDishSuggestions) {
      this.compositeDishSuggestions.style.display = 'none';
    }
    if (this.nutritionAddFoodModalBackdrop) {
      this.nutritionAddFoodModalBackdrop.classList.remove('open');
      this.nutritionAddFoodModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  recalculateSingleFoodPortion() {
    const rawW = parseFloat((this.singleFoodWeight?.value || '').replace(',', '.'));
    const w = isNaN(rawW) ? 0 : Math.max(0, rawW);
    const c100 = Math.max(0, parseFloat(this.singleFoodKcal100?.value) || 0);
    const p100 = Math.max(0, parseFloat(this.singleFoodProt100?.value) || 0);
    const f100 = Math.max(0, parseFloat(this.singleFoodFat100?.value) || 0);
    const cb100 = Math.max(0, parseFloat(this.singleFoodCarb100?.value) || 0);

    if (this.singleFoodSummaryWeight) this.singleFoodSummaryWeight.textContent = Math.round(w);
    if (this.singleFoodCalcKcal) this.singleFoodCalcKcal.textContent = Math.round((w * c100) / 100);
    if (this.singleFoodCalcProt) this.singleFoodCalcProt.textContent = Math.round(((w * p100) / 100) * 10) / 10;
    if (this.singleFoodCalcFat) this.singleFoodCalcFat.textContent = Math.round(((w * f100) / 100) * 10) / 10;
    if (this.singleFoodCalcCarb) this.singleFoodCalcCarb.textContent = Math.round(((w * cb100) / 100) * 10) / 10;
  }

  confirmDeleteIngredient(targetIdx) {
    const targetItem = this.currentCompositeIngredients[targetIdx];
    if (!targetItem) return;
    const nameLabel = targetItem.name ? `«${targetItem.name}»` : `Ингредиент ${targetIdx + 1}`;

    this.showConfirmModal({
      title: 'Удалить ингредиент?',
      message: `Вы действительно хотите удалить ${nameLabel} из составного блюда?`,
      icon: '🗑️',
      confirmText: 'Удалить',
      onConfirm: () => {
        if (this.currentCompositeIngredients.length <= 1) {
          this.showToast('Нужен хотя бы один ингредиент', 'ℹ️');
          return;
        }
        this.currentCompositeIngredients.splice(targetIdx, 1);
        this.renderCompositeIngredientsList();
        this.recalculateCompositeDish();
        triggerHaptic(20);
        this.showToast(`Ингредиент ${nameLabel} удален`, '🗑️');
      }
    });
  }

  populateCompositeRecipe(recipe) {
    if (!recipe) return;
    if (this.compositeDishName) {
      this.compositeDishName.value = recipe.name || '';
      this.compositeDishName.dataset.activeRecipeId = recipe.id || '';
    }

    if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      this.currentCompositeIngredients = recipe.ingredients.map(ing => ({
        name: ing.name || '',
        rawWeight: Number(ing.rawWeight) || 100,
        calories100g: Number(ing.calories100g) || 0,
        protein100g: Number(ing.protein100g) || 0,
        fat100g: Number(ing.fat100g) || 0,
        carbs100g: Number(ing.carbs100g) || 0,
        isCollapsed: true // При загрузке рецепта ингредиенты аккуратно свернуты
      }));
    }

    if (recipe.cookedWeight && this.compositeCookedWeight) {
      this.compositeCookedWeight.value = recipe.cookedWeight;
    }
    if (recipe.portionWeight && this.compositePortionEaten) {
      this.compositePortionEaten.value = recipe.portionWeight;
    }

    this.renderCompositeIngredientsList();
    this.recalculateCompositeDish();

    triggerHaptic([20, 50, 20]);
    this.showToast(`Загружен рецепт: «${recipe.name}» (${this.currentCompositeIngredients.length} ингред.) 🥧`, '✨');
  }

  renderCompositeIngredientsList() {
    if (!this.compositeIngredientsList) return;

    const protColor = this.nutritionTracker?.getMacroColor('protein') || '#3b82f6';
    const fatColor = this.nutritionTracker?.getMacroColor('fat') || '#f59e0b';
    const carbColor = this.nutritionTracker?.getMacroColor('carbs') || '#10b981';
    const protRgb = this.hexToRgb(protColor) || { r: 59, g: 130, b: 246 };
    const fatRgb = this.hexToRgb(fatColor) || { r: 245, g: 158, b: 11 };
    const carbRgb = this.hexToRgb(carbColor) || { r: 16, g: 185, b: 129 };

    this.compositeIngredientsList.innerHTML = this.currentCompositeIngredients.map((ing, idx) => {
      const isCollapsed = ing.isCollapsed !== false;
      const w = Math.max(0, Number(ing.rawWeight) || 0);
      const c100 = Number(ing.calories100g) || 0;
      const p100 = Number(ing.protein100g) || 0;
      const f100 = Number(ing.fat100g) || 0;
      const cb100 = Number(ing.carbs100g) || 0;

      const ingKcal = Math.round((w * c100) / 100);
      const ingProt = Math.round(((w * p100) / 100) * 10) / 10;
      const ingFat = Math.round(((w * f100) / 100) * 10) / 10;
      const ingCarb = Math.round(((w * cb100) / 100) * 10) / 10;

      return `
        <div class="composite-ingredient-row-wrapper" data-idx="${idx}">
          <!-- Swipe Action: Revealed on Swipe Left -->
          <div class="comp-ing-swipe-actions-right">
            <button type="button" class="comp-swipe-del-btn" data-idx="${idx}" title="Удалить ингредиент" aria-label="Удалить ингредиент">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Удалить</span>
            </button>
          </div>

          <!-- Main Card (Collapsible & Swipeable) -->
          <div class="composite-ingredient-row ${isCollapsed ? 'is-collapsed' : 'is-expanded'}" data-idx="${idx}">
            <!-- Minimalist Compact Header (Always Visible / Click to Toggle) -->
            <div class="comp-ing-compact-header" data-idx="${idx}" title="${isCollapsed ? 'Нажмите, чтобы развернуть' : 'Нажмите, чтобы свернуть'}">
              <div class="comp-ing-num-badge">${idx + 1}</div>
              <div class="comp-ing-compact-info">
                <div class="comp-ing-compact-title">${escapeHtml(ing.name || `Ингредиент ${idx + 1}`)}</div>
                <div class="comp-ing-compact-meta">
                  <span class="comp-meta-chip meta-weight">⚖️ ${w} г</span>
                  <span class="comp-meta-chip meta-kcal">🔥 ${ingKcal} ккал</span>
                  <span class="comp-meta-macros" style="display: inline-flex; align-items: center; gap: 3px;">
                    <span class="food-macro-pill prot" style="color: ${protColor}; background: rgba(${protRgb.r}, ${protRgb.g}, ${protRgb.b}, 0.15);">Б:${ingProt}</span>
                    <span class="food-macro-pill fat" style="color: ${fatColor}; background: rgba(${fatRgb.r}, ${fatRgb.g}, ${fatRgb.b}, 0.15);">Ж:${ingFat}</span>
                    <span class="food-macro-pill carb" style="color: ${carbColor}; background: rgba(${carbRgb.r}, ${carbRgb.g}, ${carbRgb.b}, 0.15);">У:${ingCarb}</span>
                  </span>
                </div>
              </div>
              <button type="button" class="comp-ing-toggle-btn" data-idx="${idx}" title="${isCollapsed ? 'Развернуть' : 'Свернуть'}" aria-label="Развернуть/Свернуть">
                <svg class="comp-chevron-icon ${isCollapsed ? '' : 'is-expanded'}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <!-- Expandable Body (Full Controls & Steppers) -->
            <div class="comp-ing-expandable-body" style="${isCollapsed ? 'display: none;' : 'display: flex;'}">
              <!-- Header: Index/Name + Barcode Scan + Delete -->
              <div class="comp-ing-header-row">
                <div class="comp-ing-name-wrap">
                  <input type="text" class="form-input comp-ing-name" placeholder="Ингредиент ${idx + 1}" value="${escapeHtml(ing.name || '')}" autocomplete="off">
                  <div class="food-search-suggestions comp-ing-suggestions" style="display: none;"></div>
                </div>
                <button type="button" class="btn-scan-barcode comp-ing-scan" title="Сканировать штрихкод">📷</button>
                <button type="button" class="comp-ing-del" title="Удалить ингредиент">✕</button>
              </div>

              <!-- Raw Weight Section -->
              <div class="comp-ing-weight-card">
                <div class="comp-card-top">
                  <span class="comp-card-label">⚖️ Сырой вес ингредиента</span>
                  <span class="comp-card-badge">г</span>
                </div>
                <div class="comp-weight-controls">
                  <div class="target-stepper-row comp-stepper-main">
                    <button type="button" class="btn-target-step btn-step-minus comp-step-btn" data-field="rawWeight" data-step="-1" aria-label="Уменьшить вес">−</button>
                    <input type="number" class="target-num-input comp-ing-raw-weight" placeholder="100" value="${ing.rawWeight ?? 100}" min="1" step="1" inputmode="decimal" onfocus="this.select()">
                    <button type="button" class="btn-target-step btn-step-plus comp-step-btn" data-field="rawWeight" data-step="1" aria-label="Увеличить вес">+</button>
                  </div>
                  <div class="food-quick-chips comp-weight-chips">
                    <button type="button" class="food-chip-btn comp-chip-add" data-add="1">+1</button>
                    <button type="button" class="food-chip-btn comp-chip-add" data-add="5">+5</button>
                    <button type="button" class="food-chip-btn comp-chip-add" data-add="10">+10</button>
                    <button type="button" class="food-chip-btn comp-chip-add" data-add="50">+50</button>
                  </div>
                </div>
              </div>

              <!-- Nutritional Values (Per 100g) -->
              <div class="comp-macros-wrapper">
                <div class="comp-macros-header-label">
                  <span>⚡ Пищевая ценность (на 100 г):</span>
                </div>
                <div class="nutrition-targets-grid comp-targets-grid">
                  <!-- Калории -->
                  <div class="nutrition-target-card target-card-kcal">
                    <div class="target-card-header">
                      <span class="target-card-label">🔥 Ккал</span>
                      <span class="target-card-badge">100г</span>
                    </div>
                    <div class="target-stepper-row">
                      <button type="button" class="btn-target-step btn-step-minus comp-step-btn" data-field="calories100g" data-step="-5" aria-label="Уменьшить калории">−</button>
                      <input type="number" class="target-num-input comp-ing-c100" placeholder="0" value="${ing.calories100g ?? 0}" min="0" step="1" inputmode="decimal">
                      <button type="button" class="btn-target-step btn-step-plus comp-step-btn" data-field="calories100g" data-step="5" aria-label="Увеличить калории">+</button>
                    </div>
                  </div>

                  <!-- Белки -->
                  <div class="nutrition-target-card target-card-prot">
                    <div class="target-card-header">
                      <span class="target-card-label">🥩 Белки</span>
                      <span class="target-card-badge">г</span>
                    </div>
                    <div class="target-stepper-row">
                      <button type="button" class="btn-target-step btn-step-minus comp-step-btn" data-field="protein100g" data-step="-1" aria-label="Уменьшить белки">−</button>
                      <input type="number" class="target-num-input comp-ing-prot" placeholder="0" value="${ing.protein100g ?? 0}" min="0" step="0.5" inputmode="decimal">
                      <button type="button" class="btn-target-step btn-step-plus comp-step-btn" data-field="protein100g" data-step="1" aria-label="Увеличить белки">+</button>
                    </div>
                  </div>

                  <!-- Жиры -->
                  <div class="nutrition-target-card target-card-fat">
                    <div class="target-card-header">
                      <span class="target-card-label">🥑 Жиры</span>
                      <span class="target-card-badge">г</span>
                    </div>
                    <div class="target-stepper-row">
                      <button type="button" class="btn-target-step btn-step-minus comp-step-btn" data-field="fat100g" data-step="-1" aria-label="Уменьшить жиры">−</button>
                      <input type="number" class="target-num-input comp-ing-fat" placeholder="0" value="${ing.fat100g ?? 0}" min="0" step="0.5" inputmode="decimal">
                      <button type="button" class="btn-target-step btn-step-plus comp-step-btn" data-field="fat100g" data-step="1" aria-label="Увеличить жиры">+</button>
                    </div>
                  </div>

                  <!-- Углеводы -->
                  <div class="nutrition-target-card target-card-carb">
                    <div class="target-card-header">
                      <span class="target-card-label">🍞 Углеводы</span>
                      <span class="target-card-badge">г</span>
                    </div>
                    <div class="target-stepper-row">
                      <button type="button" class="btn-target-step btn-step-minus comp-step-btn" data-field="carbs100g" data-step="-1" aria-label="Уменьшить углеводы">−</button>
                      <input type="number" class="target-num-input comp-ing-carb" placeholder="0" value="${ing.carbs100g ?? 0}" min="0" step="0.5" inputmode="decimal">
                      <button type="button" class="btn-target-step btn-step-plus comp-step-btn" data-field="carbs100g" data-step="1" aria-label="Увеличить углеводы">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Compact collapse button -->
              <button type="button" class="comp-ing-collapse-btn" data-idx="${idx}">
                <span>▲ Свернуть ингредиент</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind row inputs & interactions
    this.compositeIngredientsList.querySelectorAll('.composite-ingredient-row').forEach(row => {
      const idx = parseInt(row.dataset.idx, 10);
      const item = this.currentCompositeIngredients[idx];
      if (!item) return;

      const compactHeader = row.querySelector('.comp-ing-compact-header');
      const toggleBtn = row.querySelector('.comp-ing-toggle-btn');
      const collapseBtn = row.querySelector('.comp-ing-collapse-btn');
      const expandableBody = row.querySelector('.comp-ing-expandable-body');
      const chevronIcon = row.querySelector('.comp-chevron-icon');

      const toggleCollapse = (forceState) => {
        item.isCollapsed = forceState !== undefined ? forceState : !item.isCollapsed;
        if (item.isCollapsed) {
          row.classList.remove('is-expanded');
          row.classList.add('is-collapsed');
          if (expandableBody) expandableBody.style.display = 'none';
          if (chevronIcon) chevronIcon.classList.remove('is-expanded');
          if (compactHeader) compactHeader.setAttribute('title', 'Нажмите, чтобы развернуть');
          if (toggleBtn) {
            toggleBtn.setAttribute('title', 'Развернуть');
            toggleBtn.setAttribute('aria-label', 'Развернуть');
          }
        } else {
          row.classList.remove('is-collapsed');
          row.classList.add('is-expanded');
          if (expandableBody) expandableBody.style.display = 'flex';
          if (chevronIcon) chevronIcon.classList.add('is-expanded');
          if (compactHeader) compactHeader.setAttribute('title', 'Нажмите, чтобы свернуть');
          if (toggleBtn) {
            toggleBtn.setAttribute('title', 'Свернуть');
            toggleBtn.setAttribute('aria-label', 'Свернуть');
          }
        }
      };

      if (compactHeader) {
        compactHeader.addEventListener('click', (e) => {
          if (e.target.closest('.comp-ing-toggle-btn')) return;
          toggleCollapse();
        });
      }

      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleCollapse();
        });
      }

      if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
          toggleCollapse(true);
        });
      }

      const nameInput = row.querySelector('.comp-ing-name');
      const scanBtn = row.querySelector('.comp-ing-scan');
      const delBtn = row.querySelector('.comp-ing-del');
      const weightInput = row.querySelector('.comp-ing-raw-weight');
      const c100Input = row.querySelector('.comp-ing-c100');
      const protInput = row.querySelector('.comp-ing-prot');
      const fatInput = row.querySelector('.comp-ing-fat');
      const carbInput = row.querySelector('.comp-ing-carb');

      const updateCompactMeta = () => {
        const w = Math.max(0, Number(item.rawWeight) || 0);
        const c100 = Number(item.calories100g) || 0;
        const p100 = Number(item.protein100g) || 0;
        const f100 = Number(item.fat100g) || 0;
        const cb100 = Number(item.carbs100g) || 0;

        const ingKcal = Math.round((w * c100) / 100);
        const ingProt = Math.round(((w * p100) / 100) * 10) / 10;
        const ingFat = Math.round(((w * f100) / 100) * 10) / 10;
        const ingCarb = Math.round(((w * cb100) / 100) * 10) / 10;

        const titleEl = row.querySelector('.comp-ing-compact-title');
        const weightChip = row.querySelector('.comp-meta-chip.meta-weight');
        const kcalChip = row.querySelector('.comp-meta-chip.meta-kcal');
        const macrosEl = row.querySelector('.comp-meta-macros');

        if (titleEl) titleEl.textContent = item.name || `Ингредиент ${idx + 1}`;
        if (weightChip) weightChip.textContent = `⚖️ ${w} г`;
        if (kcalChip) kcalChip.textContent = `🔥 ${ingKcal} ккал`;
        if (macrosEl) {
          const protColor = this.nutritionTracker?.getMacroColor('protein') || '#3b82f6';
          const fatColor = this.nutritionTracker?.getMacroColor('fat') || '#f59e0b';
          const carbColor = this.nutritionTracker?.getMacroColor('carbs') || '#10b981';
          const protRgb = this.hexToRgb(protColor) || { r: 59, g: 130, b: 246 };
          const fatRgb = this.hexToRgb(fatColor) || { r: 245, g: 158, b: 11 };
          const carbRgb = this.hexToRgb(carbColor) || { r: 16, g: 185, b: 129 };
          macrosEl.innerHTML = `
            <span class="food-macro-pill prot" style="color: ${protColor}; background: rgba(${protRgb.r}, ${protRgb.g}, ${protRgb.b}, 0.15);">Б:${ingProt}</span>
            <span class="food-macro-pill fat" style="color: ${fatColor}; background: rgba(${fatRgb.r}, ${fatRgb.g}, ${fatRgb.b}, 0.15);">Ж:${ingFat}</span>
            <span class="food-macro-pill carb" style="color: ${carbColor}; background: rgba(${carbRgb.r}, ${carbRgb.g}, ${carbRgb.b}, 0.15);">У:${ingCarb}</span>
          `;
        }
      };

      // Select all text on focus for easy mobile editing
      row.querySelectorAll('input.target-num-input').forEach(input => {
        input.addEventListener('focus', () => input.select());
      });

      const suggestionsEl = row.querySelector('.comp-ing-suggestions');
      let compSearchTimer = null;
      if (nameInput) {
        nameInput.addEventListener('input', (e) => {
          const val = e.target.value;
          if (this.currentCompositeIngredients[idx]) {
            this.currentCompositeIngredients[idx].name = val;
          }
          updateCompactMeta();
          clearTimeout(compSearchTimer);
          const q = (val || '').trim();
          if (q.length < 2) {
            if (suggestionsEl) suggestionsEl.style.display = 'none';
            return;
          }
          compSearchTimer = setTimeout(async () => {
            const results = await this.nutritionTracker.searchFood(q);
            if (!suggestionsEl) return;
            if (results && results.length > 0) {
              const protColor = this.nutritionTracker?.getMacroColor('protein') || '#3b82f6';
              const fatColor = this.nutritionTracker?.getMacroColor('fat') || '#f59e0b';
              const carbColor = this.nutritionTracker?.getMacroColor('carbs') || '#10b981';
              const protRgb = this.hexToRgb(protColor) || { r: 59, g: 130, b: 246 };
              const fatRgb = this.hexToRgb(fatColor) || { r: 245, g: 158, b: 11 };
              const carbRgb = this.hexToRgb(carbColor) || { r: 16, g: 185, b: 129 };

              suggestionsEl.innerHTML = results.map(item => `
                <div class="food-suggestion-item" data-food-id="${escapeHtml(item.id)}">
                  <span><strong>${escapeHtml(item.name)}</strong></span>
                  <div style="font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 3px;">
                    <span>${item.caloriesPer100g} ккал •</span>
                    <span class="food-macro-pill prot" style="color: ${protColor}; background: rgba(${protRgb.r}, ${protRgb.g}, ${protRgb.b}, 0.15);">Б:${item.proteinPer100g}</span>
                    <span class="food-macro-pill fat" style="color: ${fatColor}; background: rgba(${fatRgb.r}, ${fatRgb.g}, ${fatRgb.b}, 0.15);">Ж:${item.fatPer100g}</span>
                    <span class="food-macro-pill carb" style="color: ${carbColor}; background: rgba(${carbRgb.r}, ${carbRgb.g}, ${carbRgb.b}, 0.15);">У:${item.carbsPer100g}</span>
                  </div>
                </div>
              `).join('');
              suggestionsEl.querySelectorAll('.food-suggestion-item').forEach((sRow, sIdx) => {
                sRow.addEventListener('click', () => {
                  const selected = results[sIdx];
                  if (selected) {
                    this.applyScannedFoodToComposite(selected, idx);
                    if (this.nutritionTracker && typeof this.nutritionTracker.saveCustomFood === 'function') {
                      this.nutritionTracker.saveCustomFood(selected);
                    }
                    if (suggestionsEl) suggestionsEl.style.display = 'none';
                  }
                });
              });
              suggestionsEl.style.display = 'block';
            } else {
              suggestionsEl.style.display = 'none';
            }
          }, 300);
        });

        nameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && suggestionsEl) {
            suggestionsEl.style.display = 'none';
          }
        });

        document.addEventListener('click', (e) => {
          if (suggestionsEl && !suggestionsEl.contains(e.target) && e.target !== nameInput) {
            suggestionsEl.style.display = 'none';
          }
        });
      }

      if (scanBtn) {
        scanBtn.addEventListener('click', () => {
          triggerHaptic(15);
          this.startBarcodeScanner('composite', idx);
        });
      }

      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerHaptic(15);
          this.confirmDeleteIngredient(idx);
        });
      }

      if (weightInput) {
        weightInput.addEventListener('input', (e) => {
          if (this.currentCompositeIngredients[idx]) {
            const val = parseFloat(String(e.target.value).replace(',', '.')) || 0;
            this.currentCompositeIngredients[idx].rawWeight = Math.max(0, val);
            updateCompactMeta();
            this.recalculateCompositeDish();
          }
        });
      }

      if (c100Input) {
        c100Input.addEventListener('input', (e) => {
          if (this.currentCompositeIngredients[idx]) {
            const val = parseFloat(String(e.target.value).replace(',', '.')) || 0;
            this.currentCompositeIngredients[idx].calories100g = Math.max(0, val);
            this.currentCompositeIngredients[idx]._autoKcal = false;
            updateCompactMeta();
            this.recalculateCompositeDish();
          }
        });
      }

      const handleMacroChange = () => {
        const cur = this.currentCompositeIngredients[idx];
        if (!cur) return;

        cur.protein100g = Math.max(0, parseFloat(String(protInput?.value || '0').replace(',', '.')) || 0);
        cur.fat100g = Math.max(0, parseFloat(String(fatInput?.value || '0').replace(',', '.')) || 0);
        cur.carbs100g = Math.max(0, parseFloat(String(carbInput?.value || '0').replace(',', '.')) || 0);

        // If calories are 0 or were auto-calculated, calculate from macros: 4 * P + 9 * F + 4 * C
        if (!cur.calories100g || cur._autoKcal) {
          const autoKcal = Math.round(cur.protein100g * 4 + cur.fat100g * 9 + cur.carbs100g * 4);
          if (autoKcal > 0) {
            cur.calories100g = autoKcal;
            cur._autoKcal = true;
            if (c100Input) c100Input.value = autoKcal;
          }
        }

        updateCompactMeta();
        this.recalculateCompositeDish();
      };

      if (protInput) protInput.addEventListener('input', handleMacroChange);
      if (fatInput) fatInput.addEventListener('input', handleMacroChange);
      if (carbInput) carbInput.addEventListener('input', handleMacroChange);

      // Bind row stepper buttons
      row.querySelectorAll('.comp-step-btn').forEach(btn => {
        let intervalId = null;
        let timeoutId = null;

        const performStep = () => {
          const field = btn.dataset.field;
          const step = parseFloat(btn.dataset.step) || 0;
          let targetInp = null;
          let isMacro = false;

          if (field === 'rawWeight') targetInp = weightInput;
          else if (field === 'calories100g') targetInp = c100Input;
          else if (field === 'protein100g') { targetInp = protInput; isMacro = true; }
          else if (field === 'fat100g') { targetInp = fatInput; isMacro = true; }
          else if (field === 'carbs100g') { targetInp = carbInput; isMacro = true; }

          if (!targetInp) return;

          let curVal = parseFloat(String(targetInp.value).replace(',', '.')) || 0;
          let newVal = Math.max(field === 'rawWeight' ? 1 : 0, Math.min(5000, curVal + step));
          newVal = Math.round(newVal * 10) / 10;
          if (newVal !== curVal) {
            targetInp.value = newVal;
            if (field === 'rawWeight' && this.currentCompositeIngredients[idx]) {
              this.currentCompositeIngredients[idx].rawWeight = newVal;
              updateCompactMeta();
              this.recalculateCompositeDish();
            } else if (field === 'calories100g' && this.currentCompositeIngredients[idx]) {
              this.currentCompositeIngredients[idx].calories100g = newVal;
              this.currentCompositeIngredients[idx]._autoKcal = false;
              updateCompactMeta();
              this.recalculateCompositeDish();
            } else if (isMacro) {
              handleMacroChange();
            }
            triggerHaptic(10);
          }
        };

        const clearTimers = () => {
          if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
          if (intervalId) { clearInterval(intervalId); intervalId = null; }
        };

        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.dismissActiveKeyboard();
          performStep();
          clearTimers();
          timeoutId = setTimeout(() => {
            intervalId = setInterval(performStep, 90);
          }, 320);
        });

        btn.addEventListener('pointerup', clearTimers);
        btn.addEventListener('pointerleave', clearTimers);
        btn.addEventListener('pointercancel', clearTimers);
      });

      // Bind weight quick chips
      row.querySelectorAll('.comp-chip-add').forEach(chip => {
        const handleChip = (e) => {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          this.dismissActiveKeyboard();
          triggerHaptic(15);
          const addGrams = parseInt(chip.dataset.add, 10) || 0;
          const curVal = parseFloat(weightInput?.value) || 0;
          const newVal = Math.min(5000, curVal + addGrams);
          if (weightInput) weightInput.value = newVal;
          if (this.currentCompositeIngredients[idx]) {
            this.currentCompositeIngredients[idx].rawWeight = newVal;
            updateCompactMeta();
            this.recalculateCompositeDish();
          }
        };
        chip.addEventListener('pointerdown', handleChip);
      });

      const clearChip = row.querySelector('.comp-chip-clear');
      if (clearChip && weightInput) {
        let clearPressTimer = null;
        let isLongPress = false;

        const onClearDown = (e) => {
          if (e) e.preventDefault();
          this.dismissActiveKeyboard();
          isLongPress = false;
          clearPressTimer = setTimeout(() => {
            isLongPress = true;
            weightInput.value = 100;
            if (this.currentCompositeIngredients[idx]) {
              this.currentCompositeIngredients[idx].rawWeight = 100;
              updateCompactMeta();
              this.recalculateCompositeDish();
            }
            triggerHaptic(30);
            this.showToast('Сброшено на 100 г', '⚖️');
          }, 450);
        };

        const onClearUp = (e) => {
          if (clearPressTimer) {
            clearTimeout(clearPressTimer);
            clearPressTimer = null;
          }
          if (!isLongPress) {
            triggerHaptic(15);
            weightInput.value = 0;
            if (this.currentCompositeIngredients[idx]) {
              this.currentCompositeIngredients[idx].rawWeight = 0;
              updateCompactMeta();
              this.recalculateCompositeDish();
            }
          }
        };

        clearChip.addEventListener('pointerdown', onClearDown);
        clearChip.addEventListener('pointerup', onClearUp);
        clearChip.addEventListener('pointercancel', () => {
          if (clearPressTimer) { clearTimeout(clearPressTimer); clearPressTimer = null; }
        });
      }
    });

    // Attach swipe gestures to all composite ingredient rows
    this.attachCompositeIngredientSwipeEvents();
  }

  // Attach touch and drag swipe gestures for composite ingredient rows (swipe left to reveal delete button)
  attachCompositeIngredientSwipeEvents() {
    if (!this.compositeIngredientsList) return;
    const wrappers = this.compositeIngredientsList.querySelectorAll('.composite-ingredient-row-wrapper');
    let activeOpenWrapper = null;

    const snapOpen = (w) => {
      if (!w) return;
      const r = w.querySelector('.composite-ingredient-row');
      if (r) {
        r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        r.style.transform = 'translate3d(-84px, 0, 0)';
      }
      setTimeout(() => {
        if (w.classList.contains('open') && !w.classList.contains('swiping')) {
          if (r) {
            r.style.transition = '';
            r.style.transform = '';
          }
        }
      }, 240);
    };

    const closeWrapper = (w, animated = true) => {
      if (!w) return;
      w.classList.remove('open', 'swiping');
      const r = w.querySelector('.composite-ingredient-row');
      if (animated) {
        if (r) {
          r.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
          r.style.transform = '';
        }
        setTimeout(() => {
          if (!w.classList.contains('open') && !w.classList.contains('swiping')) {
            if (r) r.style.transition = '';
          }
        }, 260);
      } else {
        if (r) {
          r.style.transform = '';
          r.style.transition = '';
        }
      }
      if (activeOpenWrapper === w) activeOpenWrapper = null;
    };

    const closeAllSwipes = (animated = true) => {
      wrappers.forEach(w => {
        if (w.classList.contains('open') || w.classList.contains('swiping')) {
          closeWrapper(w, animated);
        }
      });
      activeOpenWrapper = null;
    };

    // Close open swipe on tap outside
    const outsideTapHandler = (e) => {
      if (activeOpenWrapper && !activeOpenWrapper.contains(e.target)) {
        closeAllSwipes(true);
      }
    };
    if (this._compOutsideTapHandler) {
      document.removeEventListener('pointerdown', this._compOutsideTapHandler);
    }
    this._compOutsideTapHandler = outsideTapHandler;
    document.addEventListener('pointerdown', this._compOutsideTapHandler, { passive: true });

    wrappers.forEach(wrapper => {
      const idx = parseInt(wrapper.dataset.idx, 10);
      const row = wrapper.querySelector('.composite-ingredient-row');
      const delSwipeBtn = wrapper.querySelector('.comp-swipe-del-btn');

      if (delSwipeBtn && !delSwipeBtn._delBound) {
        delSwipeBtn._delBound = true;
        delSwipeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerHaptic(20);
          this.confirmDeleteIngredient(idx);
        });
      }

      if (!row || row._swipeBound) return;
      row._swipeBound = true;

      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let isHorizontal = null;
      let rafId = null;
      const actionsBaseWidth = 84;
      const openThreshold = -32;

      const handleStart = (clientX, clientY, target) => {
        if (target && target.closest('input, button, select, textarea, .food-search-suggestions, .comp-ing-toggle-btn')) {
          return false;
        }
        if (activeOpenWrapper && activeOpenWrapper !== wrapper) {
          closeAllSwipes(true);
        }
        startX = clientX;
        startY = clientY;
        isDragging = false;
        isHorizontal = null;
        wrapper.classList.add('swiping');
        if (row) row.style.transition = 'none';
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
          this.dismissActiveKeyboard();
        }

        if (e && e.cancelable) e.preventDefault();

        const maxLeftSwipe = -actionsBaseWidth;
        let translateX = dx;

        if (wrapper.classList.contains('open')) {
          translateX = maxLeftSwipe + dx;
          if (translateX > 0) {
            translateX = translateX * 0.2;
          } else if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.25;
          }
        } else {
          if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.25;
          } else if (translateX > 30) {
            translateX = 30 + (translateX - 30) * 0.2;
          }
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;
        });
      };

      const handleEnd = (clientX, target) => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        wrapper.classList.remove('swiping');
        if (row) row.style.transition = '';

        const wasDragging = isDragging;
        isDragging = false;

        if (!wasDragging) {
          if (wrapper.classList.contains('open') && (!target || !target.closest('.comp-ing-swipe-actions-right'))) {
            closeAllSwipes(true);
          }
          return;
        }

        const dx = clientX - startX;
        if (wrapper.classList.contains('open')) {
          if (dx > 20) {
            closeWrapper(wrapper, true);
            triggerHaptic(15);
          } else {
            snapOpen(wrapper);
          }
        } else {
          if (dx < openThreshold) {
            closeAllSwipes(true);
            wrapper.classList.add('open');
            snapOpen(wrapper);
            activeOpenWrapper = wrapper;
            triggerHaptic(15);
          } else {
            if (row) row.style.transform = '';
          }
        }
      };

      row.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (!handleStart(e.clientX, e.clientY, e.target)) return;

        const onPointerMove = (moveEv) => handleMove(moveEv.clientX, moveEv.clientY, moveEv);
        const onPointerUp = (upEv) => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);
          handleEnd(upEv.clientX, upEv.target);
        };

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      });
    });
  }

  recalculateCompositeDish() {
    const cookedW = parseFloat(String(this.compositeCookedWeight?.value || '0').replace(',', '.')) || 0;
    const portionW = parseFloat(String(this.compositePortionEaten?.value || '0').replace(',', '.')) || 0;

    const calc = this.nutritionTracker.calculateCompositeDish(
      this.currentCompositeIngredients,
      cookedW,
      portionW
    );

    if (this.compositeRawWeightTotal) this.compositeRawWeightTotal.textContent = Math.round(calc.rawTotalWeight);
    if (this.compositeRawKcalTotal) {
      const totalRawKcal = calc.ingredients.reduce((s, i) => s + (i.calories || 0), 0);
      this.compositeRawKcalTotal.textContent = Math.round(totalRawKcal);
    }
    if (this.compositeRawProtTotal) {
      const totalRawProt = calc.ingredients.reduce((s, i) => s + (i.protein || 0), 0);
      this.compositeRawProtTotal.textContent = Math.round(totalRawProt * 10) / 10;
    }
    if (this.compositeRawFatTotal) {
      const totalRawFat = calc.ingredients.reduce((s, i) => s + (i.fat || 0), 0);
      this.compositeRawFatTotal.textContent = Math.round(totalRawFat * 10) / 10;
    }
    if (this.compositeRawCarbTotal) {
      const totalRawCarb = calc.ingredients.reduce((s, i) => s + (i.carbs || 0), 0);
      this.compositeRawCarbTotal.textContent = Math.round(totalRawCarb * 10) / 10;
    }

    const p = calc.portionNutrients;
    if (this.compositeCalcKcal) this.compositeCalcKcal.textContent = p.calories;
    if (this.compositeCalcProt) this.compositeCalcProt.textContent = p.protein;
    if (this.compositeCalcFat) this.compositeCalcFat.textContent = p.fat;
    if (this.compositeCalcCarb) this.compositeCalcCarb.textContent = p.carbs;

    if (this.compositeSummaryWeight) {
      this.compositeSummaryWeight.textContent = Math.round(p.weightGrams);
    }
    const summaryWeightTag = document.getElementById('compositeSummaryWeightTag');
    if (summaryWeightTag) {
      summaryWeightTag.textContent = `${Math.round(p.weightGrams)} г`;
    }

    if (this.compositePer100gHint) {
      const p100 = calc.per100gCooked;
      const protColor = this.nutritionTracker?.getMacroColor('protein') || '#3b82f6';
      const fatColor = this.nutritionTracker?.getMacroColor('fat') || '#f59e0b';
      const carbColor = this.nutritionTracker?.getMacroColor('carbs') || '#10b981';
      this.compositePer100gHint.innerHTML = `(На 100 г готового блюда: ${p100.calories} ккал • <span style="color: ${protColor}; font-weight: 600;">Б: ${p100.protein}</span> • <span style="color: ${fatColor}; font-weight: 600;">Ж: ${p100.fat}</span> • <span style="color: ${carbColor}; font-weight: 600;">У: ${p100.carbs}</span>)`;
    }
  }

  // --- Camera Barcode Scanner & Open Food Facts ---
  async startBarcodeScanner(target = 'single', ingredientIndex = null) {
    this.dismissActiveKeyboard();
    if (!this.nutritionBarcodeScannerModalBackdrop) return;

    this.scannerTargetMode = target;
    this.scannerIngredientIndex = ingredientIndex;

    this.nutritionBarcodeScannerModalBackdrop.classList.add('open');
    this.nutritionBarcodeScannerModalBackdrop.setAttribute('aria-hidden', 'false');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      this.scannerMediaStream = stream;
      if (this.nutritionScannerVideo) {
        this.nutritionScannerVideo.srcObject = stream;
        await this.nutritionScannerVideo.play();
      }

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (typeof videoTrack.getCapabilities === 'function') ? videoTrack.getCapabilities() : {};
        if (capabilities.torch && this.btnScannerTorch) {
          this.btnScannerTorch.style.display = 'block';
          this.scannerTorchActive = false;
        } else if (this.btnScannerTorch) {
          this.btnScannerTorch.style.display = 'none';
        }
      }

      this.runBarcodeDetectionLoop();
    } catch (err) {
      console.warn('Barcode scanner camera error:', err);
      this.showToast(this.t('nutrition_scanner_permission_denied') || 'Доступ к камере заблокирован', '📷');
      this.stopBarcodeScanner();
      this.promptManualBarcodeEntry();
    }
  }

  runBarcodeDetectionLoop() {
    if ('BarcodeDetector' in window) {
      const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'];
      const detector = new window.BarcodeDetector({ formats });
      let isDetecting = false;

      this.scannerScanInterval = setInterval(async () => {
        if (isDetecting || !this.nutritionScannerVideo || this.nutritionScannerVideo.readyState < 2) return;
        isDetecting = true;
        try {
          const barcodes = await detector.detect(this.nutritionScannerVideo);
          if (barcodes && barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            if (code) {
              this.onBarcodeScanned(code);
            }
          }
        } catch (e) {
          // Skip frame error
        } finally {
          isDetecting = false;
        }
      }, 250);
      return;
    }

    // Fallback: camera preview is displayed; scanner remains active and user can use manual input or detector
    this.scannerScanInterval = setInterval(() => {
      if (!this.nutritionScannerVideo || this.nutritionScannerVideo.readyState < 2) return;
    }, 400);
  }

  stopBarcodeScanner() {
    if (this.scannerScanInterval) {
      clearInterval(this.scannerScanInterval);
      this.scannerScanInterval = null;
    }
    if (this.scannerMediaStream) {
      this.scannerMediaStream.getTracks().forEach(t => t.stop());
      this.scannerMediaStream = null;
    }
    if (this.nutritionScannerVideo) {
      this.nutritionScannerVideo.srcObject = null;
    }
    if (this.nutritionBarcodeScannerModalBackdrop) {
      this.nutritionBarcodeScannerModalBackdrop.classList.remove('open');
      this.nutritionBarcodeScannerModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  async onBarcodeScanned(barcode) {
    triggerHaptic([30, 50, 30]);
    this.stopBarcodeScanner();

    this.showToast('Поиск в Open Food Facts... 🔍');

    try {
      const food = await this.nutritionTracker.lookupBarcode(barcode);
      if (food) {
        this.showToast(`Найдено: ${food.name}`, '🥗');
        if (this.scannerTargetMode === 'composite' && this.scannerIngredientIndex != null) {
          this.applyScannedFoodToComposite(food, this.scannerIngredientIndex);
        } else {
          this.applyScannedFoodToSingle(food);
        }
      } else {
        this.showToast(this.t('nutrition_scanner_not_found') || 'Штрихкод не найден в базе. Введите данные вручную.', '⚠️');
        if (this.scannerTargetMode === 'single' && this.singleFoodName) {
          this.singleFoodName.value = `Продукт ${barcode}`;
          this.singleFoodName.dataset.scannedBarcode = barcode;
        }
      }
    } catch (e) {
      this.showToast('Ошибка сети при поиске штрихкода', '⚠️');
    }
  }

  applyScannedFoodToSingle(food) {
    if (!food) return;
    if (this.singleFoodName) {
      this.singleFoodName.value = food.name;
      this.singleFoodName.dataset.scannedBarcode = food.barcode || '';
    }
    if (this.singleFoodKcal100) this.singleFoodKcal100.value = food.caloriesPer100g || 0;
    if (this.singleFoodProt100) this.singleFoodProt100.value = food.proteinPer100g || 0;
    if (this.singleFoodFat100) this.singleFoodFat100.value = food.fatPer100g || 0;
    if (this.singleFoodCarb100) this.singleFoodCarb100.value = food.carbsPer100g || 0;

    this.recalculateSingleFoodPortion();
  }

  applyScannedFoodToComposite(food, idx) {
    if (!food || !this.currentCompositeIngredients[idx]) return;
    this.currentCompositeIngredients[idx].name = food.name;
    this.currentCompositeIngredients[idx].calories100g = food.caloriesPer100g || 0;
    this.currentCompositeIngredients[idx].protein100g = food.proteinPer100g || 0;
    this.currentCompositeIngredients[idx].fat100g = food.fatPer100g || 0;
    this.currentCompositeIngredients[idx].carbs100g = food.carbsPer100g || 0;
    this.currentCompositeIngredients[idx].isCollapsed = true; // Сворачиваем в минималистичный блок после сканирования / выбора

    this.renderCompositeIngredientsList();
    this.recalculateCompositeDish();
  }

  promptManualBarcodeEntry() {
    const promptText = this.t('nutrition_scanner_manual_prompt') || 'Введите цифры штрихкода (EAN-13 / UPC):';
    const code = prompt(promptText);
    if (code && code.trim()) {
      this.onBarcodeScanned(code.trim());
    }
  }

  // --- Nutrition Settings Modal ---
  openNutritionSettingsModal() {
    this.dismissActiveKeyboard();
    if (!this.nutritionSettingsModalBackdrop) return;
    this._nutritionSettingsModalOpenedAt = Date.now();

    const set = this.nutritionTracker.getSettings();
    if (this.modalSettingCalorieTarget) this.modalSettingCalorieTarget.value = set.calorieTarget || 2000;
    if (this.modalSettingProteinTarget) this.modalSettingProteinTarget.value = set.proteinTarget || 80;
    if (this.modalSettingFatTarget) this.modalSettingFatTarget.value = set.fatTarget || 70;
    if (this.modalSettingCarbTarget) this.modalSettingCarbTarget.value = set.carbTarget || 250;

    this.renderCategoryIconsPicker();
    this.renderCustomMealsSettingsList();

    this.nutritionSettingsModalBackdrop.classList.add('open');
    this.nutritionSettingsModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeNutritionSettingsModal() {
    if (this.nutritionSettingsModalBackdrop) {
      this.nutritionSettingsModalBackdrop.classList.remove('open');
      this.nutritionSettingsModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // --- Nutrition Statistics Modal (Calendar 4 weeks & Weekday Frequency) ---
  openNutritionStatsModal() {
    this.dismissActiveKeyboard();
    if (!this.nutritionStatsModalBackdrop || !this.nutritionTracker) return;
    this._nutritionStatsModalOpenedAt = Date.now();

    let savedTab = 'calendar';
    try {
      savedTab = localStorage.getItem('plan4u_nutrition_stats_tab') || 'calendar';
    } catch (e) {}
    this.switchNutritionStatsTab(savedTab, false);

    this.renderNutritionStatsModal();

    this.nutritionStatsModalBackdrop.classList.add('open');
    this.nutritionStatsModalBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeNutritionStatsModal() {
    if (this.nutritionStatsModalBackdrop) {
      this.nutritionStatsModalBackdrop.classList.remove('open');
      this.nutritionStatsModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  switchNutritionStatsTab(tabName, shouldSave = true) {
    const isCalendar = tabName === 'calendar';
    if (this.btnNutritionTabCalendar) {
      this.btnNutritionTabCalendar.classList.toggle('active', isCalendar);
      this.btnNutritionTabCalendar.setAttribute('aria-selected', isCalendar ? 'true' : 'false');
    }
    if (this.btnNutritionTabFrequency) {
      this.btnNutritionTabFrequency.classList.toggle('active', !isCalendar);
      this.btnNutritionTabFrequency.setAttribute('aria-selected', !isCalendar ? 'true' : 'false');
    }
    if (this.nutritionPaneCalendar) {
      this.nutritionPaneCalendar.style.display = isCalendar ? 'block' : 'none';
    }
    if (this.nutritionPaneFrequency) {
      this.nutritionPaneFrequency.style.display = !isCalendar ? 'block' : 'none';
    }
    if (shouldSave) {
      try {
        localStorage.setItem('plan4u_nutrition_stats_tab', tabName);
      } catch (e) {}
    }
  }

  renderNutritionStatsModal() {
    if (!this.nutritionTracker) return;
    const stats = this.nutritionTracker.calculateComplianceStats(4);

    // 1. Metric highlights
    const streakEl = document.getElementById('nutritionStatStreakVal');
    const rateEl = document.getElementById('nutritionStatRateVal');
    const avgEl = document.getElementById('nutritionStatAvgVal');

    const dayUnit = window.Plan4UI18n ? Plan4UI18n.t('habit_days_unit', {}, this.currentLang) : 'дн.';
    if (streakEl) streakEl.textContent = `${stats.currentStreak} ${dayUnit}`;
    if (rateEl) rateEl.textContent = `${stats.overallRate}%`;
    if (avgEl) avgEl.textContent = `${stats.avgCalories.toLocaleString()} ккал`;

    // 2. Tab 1: 4-week Calendar
    this.renderNutritionCalendarGrid(stats);

    // 3. Tab 2: Weekday Frequency
    this.renderNutritionFrequencyList(stats);
  }

  renderNutritionCalendarGrid(stats) {
    const grid = document.getElementById('nutritionCalendarGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const detailCard = document.getElementById('nutritionCalendarDetailCard');
    const detailDate = document.getElementById('nutritionDetailDate');
    const detailCal = document.getElementById('nutritionDetailCal');
    const detailBadge = document.getElementById('nutritionDetailBadge');

    const selectDay = (dayData, cellEl) => {
      grid.querySelectorAll('.nutrition-calendar-cell.is-selected').forEach(c => c.classList.remove('is-selected'));
      cellEl.classList.add('is-selected');

      if (detailCard && detailDate && detailCal && detailBadge) {
        detailCard.style.display = 'flex';
        detailDate.textContent = this.formatDateReadable ? this.formatDateReadable(dayData.dateStr) : dayData.dateStr;
        detailCal.textContent = `${dayData.actualCalories.toLocaleString()} / ${dayData.targetCalories.toLocaleString()} ккал (${dayData.percent}%)`;

        detailBadge.className = 'nutrition-detail-badge';
        if (dayData.isCompliant) {
          detailBadge.textContent = 'В норме 🥑';
          detailBadge.classList.add('is-compliant');
        } else if (dayData.isOver) {
          detailBadge.textContent = 'Превышение ⚠️';
          detailBadge.classList.add('is-over');
        } else if (dayData.hasEntries) {
          detailBadge.textContent = 'Недобор 📉';
          detailBadge.classList.add('is-under');
        } else {
          detailBadge.textContent = dayData.isFuture ? 'Будущий день' : 'Нет записей ○';
          detailBadge.classList.add('is-empty');
        }
      }
    };

    let todayCell = null;
    let todayData = null;

    stats.days.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'nutrition-calendar-cell';
      if (day.isCompliant) cell.classList.add('is-compliant');
      if (day.isToday) cell.classList.add('is-today');
      if (day.isFuture) cell.classList.add('is-future');

      let innerHtml = `<span class="cell-date">${day.dayNum}</span>`;
      if (day.isCompliant) {
        innerHtml += `<span class="cell-avocado" aria-label="В норме">🥑</span>`;
      }
      cell.innerHTML = innerHtml;

      if (!day.isFuture) {
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerHaptic(10);
          selectDay(day, cell);
        });
      }

      if (day.isToday) {
        todayCell = cell;
        todayData = day;
      }

      grid.appendChild(cell);
    });

    // Auto-select today or latest tracked past day
    if (todayCell && todayData) {
      selectDay(todayData, todayCell);
    } else if (stats.days.length > 0) {
      const lastPast = [...stats.days].filter(d => !d.isFuture).pop();
      if (lastPast) {
        const lastCell = grid.children[stats.days.indexOf(lastPast)];
        if (lastCell) selectDay(lastPast, lastCell);
      }
    }
  }

  renderNutritionFrequencyList(stats) {
    const list = document.getElementById('nutritionFrequencyList');
    if (!list) return;
    list.innerHTML = '';

    // Insight alerts
    const hardestAlert = document.getElementById('nutritionInsightHardest');
    const hardestTitle = document.getElementById('nutritionInsightHardestTitle');
    const hardestDesc = document.getElementById('nutritionInsightHardestDesc');

    const bestAlert = document.getElementById('nutritionInsightBest');
    const bestTitle = document.getElementById('nutritionInsightBestTitle');
    const bestDesc = document.getElementById('nutritionInsightBestDesc');

    if (stats.hardestDay && stats.hardestDay.totalDays > 0) {
      if (hardestAlert) hardestAlert.style.display = 'flex';
      if (hardestTitle) {
        hardestTitle.textContent = `Сложнее всего: ${stats.hardestDay.fullName}`;
      }
      if (hardestDesc) {
        const diffStr = stats.hardestDay.avgSurplus > 0 ? `+${stats.hardestDay.avgSurplus} ккал в ср.` : `${stats.hardestDay.avgCalories} ккал в ср.`;
        hardestDesc.textContent = `Норма соблюдена лишь в ${stats.hardestDay.rate}% случаев (${stats.hardestDay.compliantDays} из ${stats.hardestDay.totalDays} дн. • ${diffStr})`;
      }
    } else if (hardestAlert) {
      hardestAlert.style.display = 'none';
    }

    if (stats.bestDay && stats.bestDay.totalDays > 0 && stats.bestDay !== stats.hardestDay) {
      if (bestAlert) bestAlert.style.display = 'flex';
      if (bestTitle) {
        bestTitle.textContent = `Легче всего: ${stats.bestDay.fullName}`;
      }
      if (bestDesc) {
        bestDesc.textContent = `Успех ${stats.bestDay.rate}% (${stats.bestDay.compliantDays} из ${stats.bestDay.totalDays} дн. в норме)`;
      }
    } else if (bestAlert) {
      bestAlert.style.display = 'none';
    }

    // Weekday rows
    stats.weekdaysList.forEach(w => {
      const row = document.createElement('div');
      row.className = 'nutrition-freq-row';

      let fillClass = 'is-low';
      if (w.rate >= 75) fillClass = 'is-high';
      else if (w.rate >= 50) fillClass = 'is-medium';

      const surplusText = w.totalDays > 0 
        ? `${w.compliantDays}/${w.totalDays} дн.`
        : 'нет данных';

      row.innerHTML = `
        <div class="nutrition-freq-dow" title="${w.fullName}">${w.shortName}</div>
        <div class="nutrition-freq-bar-track">
          <div class="nutrition-freq-bar-fill ${fillClass}" style="width: ${w.rate}%;"></div>
        </div>
        <div class="nutrition-freq-rate">${w.totalDays > 0 ? w.rate + '%' : '—'}</div>
        <div class="nutrition-freq-details">${surplusText}</div>
      `;

      row.addEventListener('click', () => {
        triggerHaptic(10);
        if (this.showToast && w.totalDays > 0) {
          const sign = w.avgSurplus > 0 ? '+' : '';
          this.showToast(`${w.fullName}: ${w.compliantDays} из ${w.totalDays} дн. в норме (${w.rate}%). Ср. калории: ${w.avgCalories} (${sign}${w.avgSurplus} ккал)`, '📊');
        }
      });

      list.appendChild(row);
    });
  }

  renderCategoryIconsPicker() {
    if (!this.newMealIconPickerGrid || !this.nutritionTracker) return;
    const icons = this.nutritionTracker.getCategoryIcons();
    const currentSelected = this.newMealIconInput ? this.newMealIconInput.value : (icons[0] ? icons[0].src : '');

    this.newMealIconPickerGrid.innerHTML = icons.map(icon => {
      const isSel = icon.src === currentSelected;
      return `
        <div class="meal-icon-picker-item ${isSel ? 'is-selected' : ''}" data-icon-src="${escapeHtml(icon.src)}" title="${escapeHtml(icon.label)}" aria-label="${escapeHtml(icon.label)}">
          <span class="picker-item-badge">✓</span>
          <img src="${escapeHtml(icon.src)}" class="picker-item-img" alt="${escapeHtml(icon.label)}" loading="lazy">
        </div>
      `;
    }).join('');

    this.newMealIconPickerGrid.querySelectorAll('.meal-icon-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        triggerHaptic(15);
        const src = item.dataset.iconSrc;
        if (src) {
          if (this.newMealIconInput) this.newMealIconInput.value = src;
          if (this.newMealSelectedPreviewImg) this.newMealSelectedPreviewImg.src = src;
          this.newMealIconPickerGrid.querySelectorAll('.meal-icon-picker-item').forEach(el => el.classList.remove('is-selected'));
          item.classList.add('is-selected');
        }
      });
    });
  }

  renderCustomMealsSettingsList() {
    if (!this.customMealsList || !this.nutritionTracker) return;
    const meals = this.nutritionTracker.getMeals();
    const availableIcons = this.nutritionTracker.getCategoryIcons();

    this.customMealsList.innerHTML = meals.map(meal => `
      <div class="custom-meal-row-wrapper" data-meal-id="${escapeHtml(meal.id)}">
        <div class="custom-meal-swipe-actions-right">
          <button type="button" class="swipe-action-btn action-edit" data-action="edit" data-meal-id="${escapeHtml(meal.id)}" title="${this.t('nutrition_edit_meal_title') || 'Редактировать'}" aria-label="Редактировать">
            <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="swipe-action-btn action-delete" data-action="delete" data-meal-id="${escapeHtml(meal.id)}" title="${this.t('delete') || 'Удалить'}" aria-label="Удалить">
            <svg class="swipe-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        <div class="custom-meal-item">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <button type="button" class="meal-item-icon-btn btn-cycle-meal-icon" data-meal-id="${escapeHtml(meal.id)}" title="Нажмите, чтобы сменить картинку">
              ${this.nutritionTracker.renderMealIcon(meal.icon, meal.name)}
            </button>
            <span style="font-weight: 700; font-size: 14px;">${escapeHtml(meal.name)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 18px; height: 18px; border-radius: 50%; background: ${meal.color || 'var(--primary-magenta, #d83a88)'}; display: inline-block; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></span>
          </div>
        </div>
      </div>
    `).join('');

    // Click icon to cycle through images
    this.customMealsList.querySelectorAll('.btn-cycle-meal-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.mealId;
        const meal = this.nutritionTracker.getMeal(id);
        if (!meal) return;
        triggerHaptic(15);

        const currentIdx = availableIcons.findIndex(ic => ic.src === meal.icon);
        const nextIdx = (currentIdx + 1) % availableIcons.length;
        const nextIcon = availableIcons[nextIdx];

        this.nutritionTracker.updateMeal(id, { icon: nextIcon.src });
        this.showToast(`Картинка изменена: ${nextIcon.label}`, '✨');
        this.renderCustomMealsSettingsList();
        this.renderNutritionModalContent();
      });
    });

    // Attach swipe gesture and action buttons (Edit & Delete)
    this.attachCustomMealsSwipeEvents();
  }

  // Attach touch and drag swipe gestures for custom meals rows (revealing Edit & Delete buttons)
  attachCustomMealsSwipeEvents() {
    if (!this.customMealsList) return;
    const wrappers = this.customMealsList.querySelectorAll('.custom-meal-row-wrapper');
    if (!wrappers.length) return;
    let activeOpenWrapper = null;
    const actionsWidth = 92;
    const openThreshold = -30;

    const snapOpen = (w) => {
      if (!w) return;
      w.classList.add('open');
      activeOpenWrapper = w;
      const r = w.querySelector('.custom-meal-item');
      const a = w.querySelector('.custom-meal-swipe-actions-right');
      if (r) {
        r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        r.style.transform = 'translate3d(-92px, 0, 0)';
      }
      if (a) {
        a.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
        a.style.transform = 'translate3d(0px, 0, 0)';
      }
      setTimeout(() => {
        if (w.classList.contains('open') && !w.classList.contains('swiping')) {
          if (r) { r.style.transition = ''; r.style.transform = ''; }
          if (a) { a.style.transition = ''; a.style.transform = ''; }
        }
      }, 240);
    };

    const closeWrapper = (w, animated = true) => {
      if (!w) return;
      const r = w.querySelector('.custom-meal-item');
      const a = w.querySelector('.custom-meal-swipe-actions-right');
      if (animated) {
        if (r) {
          r.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          r.style.transform = 'translate3d(0, 0, 0)';
        }
        if (a) {
          a.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)';
          a.style.transform = 'translate3d(100%, 0, 0)';
        }
        w.classList.remove('open', 'swiping');
        setTimeout(() => {
          if (!w.classList.contains('open') && !w.classList.contains('swiping')) {
            if (r) { r.style.transition = ''; r.style.transform = ''; }
            if (a) { a.style.transition = ''; a.style.transform = ''; }
          }
        }, 240);
      } else {
        w.classList.remove('open', 'swiping');
        if (r) { r.style.transform = ''; r.style.transition = ''; }
        if (a) { a.style.transform = ''; a.style.transition = ''; }
      }
      if (activeOpenWrapper === w) activeOpenWrapper = null;
    };

    const closeAllSwipes = (animated = true) => {
      wrappers.forEach(w => {
        if (w.classList.contains('open') || w.classList.contains('swiping')) {
          closeWrapper(w, animated);
        }
      });
      activeOpenWrapper = null;
    };

    // Close on outside tap
    const outsideTapHandler = (e) => {
      if (activeOpenWrapper && !activeOpenWrapper.contains(e.target)) {
        closeAllSwipes(true);
      }
    };
    if (this._customMealsSwipeOutsideHandler) {
      document.removeEventListener('pointerdown', this._customMealsSwipeOutsideHandler);
    }
    this._customMealsSwipeOutsideHandler = outsideTapHandler;
    document.addEventListener('pointerdown', this._customMealsSwipeOutsideHandler, { passive: true });

    // Handle button clicks inside swipe panel
    wrappers.forEach(wrapper => {
      const actionsRight = wrapper.querySelector('.custom-meal-swipe-actions-right');
      if (actionsRight) {
        actionsRight.querySelectorAll('.swipe-action-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const mealId = btn.dataset.mealId || wrapper.dataset.mealId;
            const meal = this.nutritionTracker.getMeal(mealId);
            if (!meal) return;

            triggerHaptic(20);
            closeAllSwipes(false);

            if (action === 'edit') {
              this.openMealEditModal(mealId);
            } else if (action === 'delete') {
              const allMeals = this.nutritionTracker.getMeals();
              if (allMeals.length <= 1) {
                this.showToast(this.t('nutrition_cannot_delete_last_meal') || 'Нельзя удалить единственный приём пищи', '⚠️');
                return;
              }
              const mealName = meal.name || 'Приём пищи';
              const title = this.t('nutrition_delete_meal_title') || 'Удалить приём пищи?';
              const msg = (this.t('nutrition_delete_meal_msg') || 'Вы действительно хотите удалить приём пищи «{name}»? Добавленные ранее записи сохранятся в истории.').replace('{name}', mealName);
              const confirmBtnText = this.t('delete') || 'Удалить';

              this.showConfirmModal({
                title,
                message: msg,
                icon: '🗑️',
                confirmText: confirmBtnText,
                onConfirm: () => {
                  this.nutritionTracker.deleteMeal(mealId);
                  triggerHaptic(20);
                  const toastText = (this.t('nutrition_toast_meal_deleted') || 'Приём пищи удалён') + `: ${mealName}`;
                  this.showToast(toastText, '🗑️');
                  this.renderCustomMealsSettingsList();
                  this.renderNutritionModalContent();
                  this.updateNutritionWidget();
                }
              });
            }
          });
        });
      }

      // Touch / pointer gesture handling
      const row = wrapper.querySelector('.custom-meal-item');
      if (!row) return;

      let startX = 0;
      let startY = 0;
      let isDragging = false;
      let isHorizontal = null;
      let rafId = null;

      const handleStart = (clientX, clientY, target) => {
        if (target && target.closest('.swipe-action-btn, .btn-cycle-meal-icon')) {
          return false;
        }
        if (activeOpenWrapper && activeOpenWrapper !== wrapper) {
          closeAllSwipes(true);
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
          if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            isHorizontal = Math.abs(dx) > Math.abs(dy);
          }
        }

        if (!isHorizontal) return;

        if (!isDragging) {
          isDragging = true;
          try { window.getSelection()?.removeAllRanges(); } catch (err) { }
        }

        if (e && e.cancelable) e.preventDefault();

        const maxLeftSwipe = -actionsWidth;
        let translateX = dx;
        if (wrapper.classList.contains('open')) {
          translateX = maxLeftSwipe + dx;
          if (translateX > 0) {
            translateX = translateX * 0.2;
          } else if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.2;
          }
        } else {
          if (translateX > 0) {
            translateX = translateX * 0.2;
          } else if (translateX < maxLeftSwipe) {
            translateX = maxLeftSwipe + (translateX - maxLeftSwipe) * 0.25;
          }
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (row) row.style.transform = `translate3d(${translateX}px, 0, 0)`;
          if (actionsRight) {
            const actionsOffset = Math.max(0, actionsWidth + translateX);
            if (translateX < 0 || wrapper.classList.contains('open')) {
              actionsRight.style.transform = `translate3d(${actionsOffset}px, 0, 0)`;
            } else {
              actionsRight.style.transform = 'translate3d(100%, 0, 0)';
            }
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

        const wasDragging = isDragging;
        isDragging = false;

        if (!wasDragging) {
          if (wrapper.classList.contains('open') && (!target || !target.closest('.custom-meal-swipe-actions-right'))) {
            closeAllSwipes(true);
          }
          return;
        }

        const dx = clientX - startX;
        if (wrapper.classList.contains('open')) {
          if (dx > 25) {
            closeWrapper(wrapper, true);
            triggerHaptic(15);
          } else {
            snapOpen(wrapper);
          }
        } else {
          if (dx < openThreshold) {
            closeAllSwipes(true);
            snapOpen(wrapper);
            triggerHaptic(15);
          } else {
            closeWrapper(wrapper, true);
          }
        }
      };

      if (window.PointerEvent) {
        row.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (!handleStart(e.clientX, e.clientY, e.target)) return;

          const onPointerMove = (moveEvt) => handleMove(moveEvt.clientX, moveEvt.clientY, moveEvt);
          const onPointerUp = (upEvt) => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
            handleEnd(upEvt.clientX, upEvt.target);
          };

          document.addEventListener('pointermove', onPointerMove, { passive: false });
          document.addEventListener('pointerup', onPointerUp, { passive: true });
          document.addEventListener('pointercancel', onPointerUp, { passive: true });
        });
      } else {
        row.addEventListener('touchstart', (e) => {
          const touch = e.touches[0];
          if (!touch || !handleStart(touch.clientX, touch.clientY, e.target)) return;

          const onTouchMove = (moveEvt) => {
            const t = moveEvt.touches[0];
            if (t) handleMove(t.clientX, t.clientY, moveEvt);
          };
          const onTouchEnd = (endEvt) => {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchEnd);
            const t = endEvt.changedTouches[0];
            handleEnd(t ? t.clientX : 0, endEvt.target);
          };

          document.addEventListener('touchmove', onTouchMove, { passive: false });
          document.addEventListener('touchend', onTouchEnd, { passive: true });
          document.addEventListener('touchcancel', onTouchEnd, { passive: true });
        }, { passive: true });
      }
    });
  }

  // --- Meal Edit Modal (Name, Color & Food_Kategory Icon) ---
  openMealEditModal(mealId = null) {
    this.dismissActiveKeyboard();
    if (!this.editMealModalBackdrop || !this.nutritionTracker) return;
    this._editMealModalOpenedAt = Date.now();

    const meal = mealId ? this.nutritionTracker.getMeal(mealId) : null;
    const defaultIcon = 'assets/nutrition_icons/meal_icon_1.webp';
    const selectedIcon = meal ? meal.icon : defaultIcon;
    const initialColor = meal ? (meal.color || '#ef4444') : '#ef4444';

    if (this.editMealModalTitle) {
      this.editMealModalTitle.textContent = meal
        ? (this.t('nutrition_edit_meal_title') || 'Редактировать приём пищи')
        : (this.t('nutrition_add_meal_title') || 'Новая трапеза');
    }

    if (this.editMealIdInput) this.editMealIdInput.value = meal ? meal.id : '';
    if (this.editMealNameInput) this.editMealNameInput.value = meal ? meal.name : '';
    if (this.editMealColorInput) this.editMealColorInput.value = initialColor;
    if (this.editMealSelectedPreview) this.editMealSelectedPreview.style.borderColor = initialColor;
    if (this.editMealIconInput) this.editMealIconInput.value = selectedIcon;
    if (this.editMealSelectedPreviewImg) {
      this.editMealSelectedPreviewImg.src = selectedIcon;
      this.editMealSelectedPreviewImg.alt = meal ? meal.name : 'Иконка';
    }

    this.renderMealColorSwatches(initialColor);

    if (this.btnDeleteEditMeal) {
      this.btnDeleteEditMeal.style.display = meal ? 'flex' : 'none';
    }

    if (this.btnSaveEditMeal) {
      this.btnSaveEditMeal.textContent = meal
        ? (this.t('btn_save') || 'Сохранить')
        : (this.t('btn_add') || '+ Добавить');
    }

    // Populate icon picker grid
    if (this.editMealIconPickerGrid) {
      const icons = this.nutritionTracker.getCategoryIcons();
      this.editMealIconPickerGrid.innerHTML = icons.map(icon => {
        const isSel = icon.src === selectedIcon;
        return `
          <div class="meal-icon-picker-item ${isSel ? 'is-selected' : ''}" data-icon-src="${escapeHtml(icon.src)}" title="${escapeHtml(icon.label)}" aria-label="${escapeHtml(icon.label)}">
            <span class="picker-item-badge">✓</span>
            <img src="${escapeHtml(icon.src)}" class="picker-item-img" alt="${escapeHtml(icon.label)}" loading="lazy">
          </div>
        `;
      }).join('');

      this.editMealIconPickerGrid.querySelectorAll('.meal-icon-picker-item').forEach(item => {
        item.addEventListener('click', () => {
          triggerHaptic(15);
          const src = item.dataset.iconSrc;
          if (src) {
            if (this.editMealIconInput) this.editMealIconInput.value = src;
            if (this.editMealSelectedPreviewImg) this.editMealSelectedPreviewImg.src = src;
            this.editMealIconPickerGrid.querySelectorAll('.meal-icon-picker-item').forEach(el => el.classList.remove('is-selected'));
            item.classList.add('is-selected');
          }
        });
      });
    }

    this.editMealModalBackdrop.classList.add('open');
    this.editMealModalBackdrop.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      this.editMealNameInput?.focus();
    }, 120);
  }

  closeMealEditModal() {
    if (this.editMealModalBackdrop) {
      this.editMealModalBackdrop.classList.remove('open');
      this.editMealModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  saveMealEditModal() {
    if (!this.nutritionTracker) return;
    const mealId = this.editMealIdInput?.value;

    const name = (this.editMealNameInput?.value || '').trim();
    if (!name) {
      this.showToast(this.t('nutrition_enter_meal_name') || 'Введите название трапезы', '⚠️');
      return;
    }
    const color = this.editMealColorInput?.value || '#d83a88';
    const icon = (this.editMealIconInput?.value || '').trim() || 'assets/nutrition_icons/meal_icon_1.webp';

    if (mealId) {
      this.nutritionTracker.updateMeal(mealId, { name, color, icon });
      triggerHaptic(20);
      this.showToast(this.t('nutrition_toast_meal_updated') || 'Приём пищи обновлён ✨', '🥑');
    } else {
      const newMeal = this.nutritionTracker.addMeal({ name, color, icon });
      triggerHaptic(20);
      this.showToast((this.t('nutrition_toast_meal_added') || 'Трапеза добавлена ✨') + `: ${name}`, '✨');
    }

    this.closeMealEditModal();
    this.renderCustomMealsSettingsList();
    this.renderNutritionModalContent();
    this.updateNutritionWidget();
  }

  renderMealColorSwatches(activeColor) {
    if (!this.editMealColorsRow) return;
    const presets = [
      { hex: '#ef4444', label: 'Красный', darkText: false },
      { hex: '#f97316', label: 'Оранжевый', darkText: false },
      { hex: '#eab308', label: 'Жёлтый', darkText: true },
      { hex: '#22c55e', label: 'Зелёный', darkText: false },
      { hex: '#06b6d4', label: 'Голубой', darkText: false },
      { hex: '#2563eb', label: 'Синий', darkText: false },
      { hex: '#7c3aed', label: 'Фиолетовый', darkText: false },
      { hex: '#475569', label: 'Тёмно-серый', darkText: false },
      { hex: '#ebdcc9', label: 'Бежевый', darkText: true }
    ];

    let cur = (activeColor || '').toLowerCase();
    if (cur === '#1e293b') cur = '#475569';
    if (cur === '#f8fafc' || cur === '#ffffff') cur = '#ebdcc9';

    const matched = presets.some(p => p.hex.toLowerCase() === cur);
    const effectiveColor = matched ? cur : presets[0].hex.toLowerCase();

    if (this.editMealColorInput) this.editMealColorInput.value = matched ? cur : presets[0].hex;
    if (this.editMealSelectedPreview) {
      this.editMealSelectedPreview.style.borderColor = matched ? cur : presets[0].hex;
    }

    this.editMealColorsRow.innerHTML = presets.map(p => {
      const isSel = p.hex.toLowerCase() === effectiveColor;
      const isNearWhite = p.darkText;
      const checkColor = p.darkText ? '#0f172a' : '#ffffff';
      return `
        <button type="button" 
                class="meal-color-swatch-circle ${isSel ? 'is-selected' : ''} ${isNearWhite ? 'is-near-white' : ''}" 
                data-color="${p.hex}" 
                style="background-color: ${p.hex}; color: ${p.hex};" 
                title="${p.label}" 
                aria-label="${p.label}">
          <span class="swatch-check" style="color: ${checkColor};">✓</span>
        </button>
      `;
    }).join('');

    this.editMealColorsRow.querySelectorAll('.meal-color-swatch-circle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(15);
        const col = btn.dataset.color;
        if (this.editMealColorInput) this.editMealColorInput.value = col;
        if (this.editMealSelectedPreview) this.editMealSelectedPreview.style.borderColor = col;
        this.editMealColorsRow.querySelectorAll('.meal-color-swatch-circle').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
      });
    });
  }

  // --- Archive Stamp & Widget Updates ---
  updateNutritionWidget() {
    if (!this.widgetNutrition) return;
    if (!this.nutritionTracker || !this.nutritionTracker.isEnabled()) {
      this.widgetNutrition.style.display = 'none';
      this.updateModulesHubState?.();
      return;
    }

    this.widgetNutrition.style.display = 'flex';
    const targetDate = this.selectedDate || this.getTodayDateString();
    const stats = this.nutritionTracker.getStatsForDate(targetDate);

    if (this.widgetNutritionRing) {
      this.widgetNutritionRing.innerHTML = this.nutritionTracker.generateWidgetSvg(stats);
    }

    const titleText = `${this.t('nutrition_title')}: ${stats.totalCalories} / ${stats.targets.calories} ккал`;
    this.widgetNutrition.title = titleText;
    this.updateModulesHubState?.();
  }

  updateNutritionArchiveStamp() {
    if (!this.notebookNutritionStamp) return;
    if (!this.nutritionTracker || !this.nutritionTracker.isEnabled() || this.nutritionTracker.getSettings().showArchiveStamp === false) {
      this.notebookNutritionStamp.style.display = 'none';
      return;
    }

    const todayStr = this.getTodayDateString();
    const isPastDay = this.selectedDate && this.selectedDate < todayStr;

    // Show stamp exclusively on archive past days
    if (!isPastDay) {
      this.notebookNutritionStamp.style.display = 'none';
      return;
    }

    const stats = this.nutritionTracker.getStatsForDate(this.selectedDate);
    // Show only if food entries were made on that day
    if (stats.entryCount === 0 && stats.totalCalories === 0) {
      this.notebookNutritionStamp.style.display = 'none';
      return;
    }

    this.notebookNutritionStamp.innerHTML = this.nutritionTracker.generateArchiveStampSvg(stats);
    this.notebookNutritionStamp.style.display = 'block';
  }

  clearAllNutritionEntries() {
    if (!this.nutritionTracker) return;
    this.nutritionTracker.clearAllEntries();
    this.updateNutritionWidget();
    this.updateNutritionArchiveStamp();
    this.updateModulesHubState?.();
    this.renderNutritionModalContent();
    this.showToast('Все записи питания удалены!', '🧹');
  }

  /* ============================================================================
   * ☀️ JOY TRACKER (ЗАМЕТИТЬ РАДОСТЬ) METHODS
   * ============================================================================ */

  formatDateReadable(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length < 3) return dateStr;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m - 1, d);
      const lang = (this.currentLang || this.settings?.lang || 'ru') === 'en' ? 'en-US' : ((this.currentLang || this.settings?.lang) === 'uk' ? 'uk-UA' : 'ru-RU');
      return dt.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  confirmAction(msg, onConfirm) {
    if (typeof this.showConfirmModal === 'function') {
      this.showConfirmModal({
        title: this.t('delete') || 'Удаление',
        message: msg,
        icon: '🗑️',
        confirmText: this.t('delete') || 'Удалить',
        onConfirm: () => {
          this.closeConfirmModal();
          if (typeof onConfirm === 'function') onConfirm();
        }
      });
    } else if (window.confirm(msg)) {
      onConfirm();
    }
  }

  initJoyTrackerListeners() {
    if (!this.joyTracker) return;

    // Top Header Widget click
    if (this.widgetJoy) {
      this.widgetJoy.addEventListener('click', () => {
        triggerHaptic(20);
        this.closeModulesHubDropdown();
        const todayStr = this.getTodayDateString();
        const targetDate = this.selectedDate || todayStr;
        const hasEntry = this.joyTracker.hasEntry(targetDate);
        this.openJoyModal(targetDate, hasEntry);
      });
    }

    // Bottom Joy FAB Button click
    this.fabJoyBtn = document.getElementById('fabJoyBtn');
    this.fabJoyWrapper = document.getElementById('fabJoyWrapper');
    if (this.fabJoyBtn) {
      this.fabJoyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic(20);
        const todayStr = this.getTodayDateString();
        this.openJoyModal(todayStr);
      });
    }

    this.updateJoyBottomFab();

    // Settings Toggle
    if (this.toggleJoyTracker) {
      this.toggleJoyTracker.checked = this.joyTracker.isEnabled();
      this.toggleJoyTracker.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        this.joyTracker.setEnabled(enabled);
        this.updateModulesHubState();
        this.updateJoyUI();
        triggerHaptic(15);
        this.showToast(enabled ? (this.t('joy_toggle_enable') || 'Модуль радости включен! ☀️') : (this.t('joy_settings_title') || 'Модуль радости отключен'), '☀️');
      });
    }

    // Settings Expand
    if (this.btnExpandJoyModule) {
      this.btnExpandJoyModule.addEventListener('click', () => {
        if (!this.joySubSettings) return;
        const isExp = this.joySubSettings.style.display !== 'none';
        this.joySubSettings.style.display = isExp ? 'none' : 'block';
        this.btnExpandJoyModule.setAttribute('aria-expanded', isExp ? 'false' : 'true');
        this.btnExpandJoyModule.classList.toggle('expanded', !isExp);
        triggerHaptic(10);
      });
    }

    // Settings Reminder Time
    if (this.joyReminderTimeInput) {
      this.joyReminderTimeInput.value = this.joyTracker.getSettings().reminderTime || '21:00';
      this.joyReminderTimeInput.addEventListener('change', (e) => {
        this.joyTracker.updateSettings({ reminderTime: e.target.value });
      });
    }

    // Settings Show On Sheet
    if (this.toggleJoySheet) {
      this.toggleJoySheet.checked = this.joyTracker.getSettings().showOnSheet !== false;
      this.toggleJoySheet.addEventListener('change', (e) => {
        this.joyTracker.updateSettings({ showOnSheet: e.target.checked });
        this.renderJoyOnSheet();
      });
    }

    // Settings Open Joy Jar
    if (this.btnOpenJoyJarFromSettings) {
      this.btnOpenJoyJarFromSettings.addEventListener('click', () => {
        this.closeSettingsModal();
        this.openJoyJarModal();
      });
    }

    // Joy Modal Close & Safe Backdrop
    if (this.joyModalCloseBtn) {
      this.joyModalCloseBtn.addEventListener('click', () => this.closeJoyModal());
    }
    this.bindSafeBackdrop(this.joyModalBackdrop, () => this.closeJoyModal(), () => this._joyModalOpenedAt);

    // Joy Modal Open Jar button (🫙)
    this.btnJoyModalOpenJar = document.getElementById('btnJoyModalOpenJar');
    if (this.btnJoyModalOpenJar) {
      this.btnJoyModalOpenJar.addEventListener('click', () => {
        triggerHaptic(15);
        this.closeJoyModal();
        this.openJoyJarModal();
      });
    }

    // Mood Selector in Modal
    if (this.joyMoodSelector) {
      this.joyMoodSelector.addEventListener('click', (e) => {
        const chip = e.target.closest('.joy-mood-chip');
        if (!chip) return;
        triggerHaptic(15);
        this.joyMoodSelector.querySelectorAll('.joy-mood-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentJoySelectedMood = chip.dataset.mood || 'm_great';
      });
    }

    // Textarea character count & input
    if (this.joyTextInput) {
      this.joyTextInput.addEventListener('input', () => {
        if (this.joyCharCount) {
          this.joyCharCount.textContent = this.joyTextInput.value.length;
        }
      });
    }

    // Helper prompt button ("💡 Не знаю, что написать")
    if (this.btnJoyPromptHelp) {
      let lastPromptIdx = -1;
      this.btnJoyPromptHelp.addEventListener('click', () => {
        triggerHaptic(15);
        const keys = this.joyTracker.getPromptKeys();
        if (!keys.length) return;
        let nextIdx;
        if (keys.length > 1) {
          do {
            nextIdx = Math.floor(Math.random() * keys.length);
          } while (nextIdx === lastPromptIdx);
        } else {
          nextIdx = 0;
        }
        lastPromptIdx = nextIdx;
        const promptKey = keys[nextIdx];
        if (this.joyPromptBox && this.joyPromptText) {
          this.joyPromptBox.style.display = 'flex';
          this.joyPromptText.textContent = this.t(promptKey) || 'Что хорошего сегодня произошло?';
        }
      });
    }

    // Sticker preview button ("🎨 Сменить стикер") in Modal
    if (this.btnJoyChangeSticker) {
      this.btnJoyChangeSticker.addEventListener('click', () => {
        triggerHaptic(15);
        this.openJoyStickerPicker(null);
      });
    }

    // Remind later button
    if (this.btnJoyRemindLater) {
      this.btnJoyRemindLater.addEventListener('click', () => {
        triggerHaptic(15);
        const dateStr = this.currentJoyEditingDate || this.getTodayDateString();
        this.joyTracker.dismissToday(dateStr);
        this.closeJoyModal();
      });
    }

    // Save Joy button
    if (this.btnJoySave) {
      this.btnJoySave.addEventListener('click', () => {
        this.saveJoyModalEntry();
      });
    }

    // Joy Jar Modal Listeners
    if (this.joyJarCloseBtn) {
      this.joyJarCloseBtn.addEventListener('click', () => this.closeJoyJarModal());
    }
    this.bindSafeBackdrop(this.joyJarModalBackdrop, () => this.closeJoyJarModal(), () => this._joyJarOpenedAt);


    // Joy Jar Spotlight Close
    if (this.joySpotlightClose) {
      this.joySpotlightClose.addEventListener('click', () => {
        if (this.joySpotlightBox) this.joySpotlightBox.style.display = 'none';
      });
    }

    // Sticker Picker Close & Safe Backdrop
    if (this.joyStickerPickerCloseBtn) {
      this.joyStickerPickerCloseBtn.addEventListener('click', () => this.closeJoyStickerPicker());
    }
    this.bindSafeBackdrop(this.joyStickerPickerBackdrop, () => this.closeJoyStickerPicker(), () => this._joyStickerPickerOpenedAt);

    // Sticker Picker Grid selection delegation
    if (this.joyStickerPickerGrid) {
      this.joyStickerPickerGrid.addEventListener('click', (e) => {
        const item = e.target.closest('.joy-picker-sticker-item');
        if (!item) return;
        const stickerId = item.dataset.stickerId;
        if (!stickerId) return;
        triggerHaptic(20);

        if (this.joyPickerTargetDate) {
          // Changed directly from sheet (e.g. via long-press)
          this.joyTracker.updateSticker(this.joyPickerTargetDate, stickerId);
          this.renderJoyOnSheet();
          this.showToast(this.t('joy_change_sticker') + ' ✓', '🎨');
          this.closeJoyStickerPicker();
        } else {
          // Changed from modal form
          this.currentJoySelectedStickerId = stickerId;
          if (this.joyModalStickerThumb) {
            this.joyModalStickerThumb.src = this.joyTracker.getStickerImagePath(stickerId);
          }
          this.closeJoyStickerPicker();
        }
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        document.querySelectorAll('.notebook-joy-text').forEach(el => this.fitJoyStickerElement?.(el));
      }).catch(() => {});
    }
    window.addEventListener('resize', () => {
      document.querySelectorAll('.notebook-joy-text').forEach(el => this.fitJoyStickerElement?.(el));
    }, { passive: true });
  }

  getAdaptiveJoyFontSize(text) {
    if (!text) return 22;
    const str = String(text).trim();
    const len = str.length;
    if (len === 0) return 22;

    const lines = str.split(/\r?\n/);
    const lineCount = lines.length;
    const words = str.split(/\s+/);
    let maxWordLen = 0;
    for (const w of words) {
      if (w.length > maxWordLen) maxWordLen = w.length;
    }

    let size = 25;
    if (len <= 14) {
      size = 25;
    } else if (len <= 26) {
      size = 21.5;
    } else if (len <= 44) {
      size = 17.5;
    } else if (len <= 65) {
      size = 15.5;
    } else if (len <= 95) {
      size = 13.5;
    } else if (len <= 135) {
      size = 12;
    } else if (len <= 185) {
      size = 10.5;
    } else if (len <= 240) {
      size = 9.5;
    } else {
      size = 8.5;
    }

    if (lineCount >= 6 && size > 11) size = 11;
    else if (lineCount >= 5 && size > 13) size = 13;
    else if (lineCount >= 4 && size > 15) size = 15;
    else if (lineCount >= 3 && size > 17.5) size = 17.5;

    if (maxWordLen >= 14 && size > 12) size = 12;
    else if (maxWordLen >= 11 && size > 14.5) size = 14.5;
    else if (maxWordLen >= 9 && size > 17) size = 17;

    return Math.max(8.5, Math.min(26, size));
  }

  fitJoyStickerElement(el) {
    if (!el) return;
    if (el.clientHeight === 0 || el.clientWidth === 0) return;

    let currentSize = parseFloat(window.getComputedStyle(el).fontSize);
    if (!currentSize || isNaN(currentSize)) {
      const styleVal = el.style.fontSize || el.style.getPropertyValue('--joy-font-size');
      currentSize = parseFloat(styleVal) || 16;
    }

    const minSize = 8.5;
    let attempts = 0;
    while ((el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) && currentSize > minSize && attempts < 25) {
      currentSize -= 0.5;
      el.style.setProperty('--joy-font-size', `${currentSize}px`);
      el.style.fontSize = `${currentSize}px`;
      attempts++;
    }
  }

  updateJoyUI() {
    this.updateJoyWidget();
    this.renderJoyOnSheet();
    this.updateJoyBottomFab();
  }

  updateJoyBottomFab() {
    const isJoyEnabled = !!(this.joyTracker && this.joyTracker.isEnabled());
    const appFrame = document.querySelector('.app-frame');
    const todayStr = this.getTodayDateString();
    const isPastDay = !!(this.selectedDate && this.selectedDate < todayStr);
    const hasTodayEntry = !!(this.joyTracker && this.joyTracker.hasEntry(todayStr));
    const showFab = isJoyEnabled && this.currentTab === 'todo' && !isPastDay && !hasTodayEntry;

    if (!this.fabJoyWrapper) this.fabJoyWrapper = document.getElementById('fabJoyWrapper');
    if (!this.fabJoyBtn) this.fabJoyBtn = document.getElementById('fabJoyBtn');

    if (showFab) {
      document.body.classList.add('has-joy-fab');
      if (appFrame) appFrame.classList.add('has-joy-fab');
      if (this.fabJoyWrapper) this.fabJoyWrapper.style.setProperty('display', 'flex', 'important');

      if (this.fabJoyBtn) {
        this.fabJoyBtn.classList.remove('has-joy-today');
        this.fabJoyBtn.title = this.t('joy_empty_day_invite') || 'Заметить радость дня';
        this.fabJoyBtn.setAttribute('aria-label', this.fabJoyBtn.title);
      }
    } else {
      document.body.classList.remove('has-joy-fab');
      if (appFrame) appFrame.classList.remove('has-joy-fab');
      if (this.fabJoyWrapper) this.fabJoyWrapper.style.setProperty('display', 'none', 'important');
    }
  }

  updateJoyWidget() {
    if (!this.widgetJoy) return;
    if (!this.joyTracker || !this.joyTracker.isEnabled()) {
      this.widgetJoy.style.display = 'none';
      return;
    }
    this.widgetJoy.style.display = 'flex';

    const todayStr = this.getTodayDateString();
    const hasToday = this.joyTracker.hasEntry(todayStr);

    if (hasToday) {
      this.widgetJoy.classList.remove('needs-entry');
      this.widgetJoy.classList.add('has-entry');
      this.widgetJoy.title = `${this.t('tooltip_joy') || 'Заметить радость'}: ✓`;
    } else {
      this.widgetJoy.classList.remove('has-entry');
      this.widgetJoy.classList.add('needs-entry');
      this.widgetJoy.title = this.t('tooltip_joy') || 'Заметить радость';
    }
  }

  renderJoyOnSheet() {
    if (!this.notebookJoyWrapper) return;
    if (!this.joyTracker || !this.joyTracker.isEnabled() || this.joyTracker.getSettings().showOnSheet === false || this.currentTab !== 'todo') {
      this.notebookJoyWrapper.style.display = 'none';
      return;
    }

    const todayStr = this.getTodayDateString();
    const targetDate = this.selectedDate || todayStr;
    const entry = this.joyTracker.getEntry(targetDate);

    if (entry && entry.text) {
      this.notebookJoyWrapper.className = 'notebook-joy-wrapper is-placed-sticker';
      this.notebookJoyWrapper.style.display = 'block';

      const isPastDay = targetDate < todayStr;
      const defaultX = isPastDay ? 80 : 74;
      const defaultY = isPastDay ? 346 : 440;
      const defaultRot = -2;

      let curX = (typeof entry.x === 'number' && !isNaN(entry.x)) ? entry.x : defaultX;
      let curY = (typeof entry.y === 'number' && !isNaN(entry.y)) ? entry.y : defaultY;
      let curRot = (typeof entry.rotate === 'number' && !isNaN(entry.rotate)) ? entry.rotate : defaultRot;

      const updateStickerTransform = () => {
        this.notebookJoyWrapper.style.left = `${curX}%`;
        this.notebookJoyWrapper.style.top = `${curY}px`;
        this.notebookJoyWrapper.style.setProperty('--rot', `${curRot}deg`);
        this.notebookJoyWrapper.style.transform = `translate(-50%, -50%) rotate(${curRot}deg)`;
      };

      updateStickerTransform();
      const stickerImg = this.joyTracker.getStickerImagePath(entry.stickerId);
      const fontSize = this.getAdaptiveJoyFontSize(entry.text);

      this.notebookJoyWrapper.innerHTML = `
        <div class="notebook-joy-rotate-handle" id="btnJoyRotateHandle" title="Повернуть стикер (нажмите для +15° или потяните)" role="button" tabindex="0" aria-label="Повернуть стикер">
          <span>↻</span>
        </div>
        <div class="notebook-joy-card" id="notebookJoyCard" style="background-image: url('${stickerImg}');" role="button" tabindex="0" title="${isPastDay ? (this.t('joy_archive_readonly') || 'Записи в архиве доступны только для чтения 📖') : (this.t('tooltip_joy_sticker') || 'Заметить радость')}">
          <div class="notebook-joy-text" style="--joy-font-size: ${fontSize}px; font-size: ${fontSize}px;">${this.escapeHtml(entry.text)}</div>
        </div>
      `;

      const textEl = this.notebookJoyWrapper.querySelector('.notebook-joy-text');
      if (textEl) {
        this.fitJoyStickerElement(textEl);
        requestAnimationFrame(() => this.fitJoyStickerElement(textEl));
      }

      const rotateHandle = document.getElementById('btnJoyRotateHandle');
      if (rotateHandle) {
        let isRotating = false;
        let startAngle = 0;
        let initialRot = curRot;
        let startPointerX = 0, startPointerY = 0;
        let hasMoved = false;

        const onRotateMove = (clientX, clientY, e) => {
          if (!isRotating) return;
          if (e && e.cancelable) e.preventDefault();

          if (!hasMoved) {
            if (Math.hypot(clientX - startPointerX, clientY - startPointerY) > 4) {
              hasMoved = true;
            }
          }

          const rect = this.notebookJoyWrapper.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
          const deltaAngle = currentAngle - startAngle;
          let deg = Math.round(initialRot + deltaAngle);
          deg = ((deg % 360) + 360) % 360;
          curRot = deg;
          updateStickerTransform();
        };

        const onRotateEnd = () => {
          if (!isRotating) return;
          isRotating = false;
          window.removeEventListener('pointermove', onPtrMove);
          window.removeEventListener('pointerup', onPtrEnd);
          window.removeEventListener('pointercancel', onPtrEnd);
          window.removeEventListener('touchmove', onTchMove);
          window.removeEventListener('touchend', onTchEnd);
          window.removeEventListener('touchcancel', onTchEnd);

          if (!hasMoved) {
            // Short tap without dragging -> rotate by +15°
            curRot = Math.round((curRot + 15) % 360);
            updateStickerTransform();
            triggerHaptic(20);
          } else {
            triggerHaptic(15);
          }

          this.joyTracker.updatePosition(targetDate, curX, curY, curRot);
          clearTimeout(hideHandleTimer);
          hideHandleTimer = setTimeout(() => {
            this.notebookJoyWrapper?.classList.remove('has-moved');
          }, 2500);
        };

        const onPtrMove = (e) => onRotateMove(e.clientX, e.clientY, e);
        const onPtrEnd = () => onRotateEnd();
        const onTchMove = (e) => {
          if (e.touches && e.touches.length > 0) onRotateMove(e.touches[0].clientX, e.touches[0].clientY, e);
        };
        const onTchEnd = () => onRotateEnd();

        const startRotation = (clientX, clientY, isTouch, e) => {
          if (e) {
            e.stopPropagation();
            if (e.cancelable) e.preventDefault();
          }
          isRotating = true;
          hasMoved = false;
          startPointerX = clientX;
          startPointerY = clientY;
          initialRot = curRot;

          const rect = this.notebookJoyWrapper.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          startAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);

          if (isTouch) {
            window.addEventListener('touchmove', onTchMove, { passive: false });
            window.addEventListener('touchend', onTchEnd, { passive: true });
            window.addEventListener('touchcancel', onTchEnd, { passive: true });
          } else {
            window.addEventListener('pointermove', onPtrMove, { passive: false });
            window.addEventListener('pointerup', onPtrEnd);
            window.addEventListener('pointercancel', onPtrEnd);
          }
        };

        rotateHandle.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'touch') return;
          if (e.button !== undefined && e.button !== 0) return;
          startRotation(e.clientX, e.clientY, false, e);
        });

        rotateHandle.addEventListener('touchstart', (e) => {
          if (e.touches.length !== 1) return;
          startRotation(e.touches[0].clientX, e.touches[0].clientY, true, e);
        }, { passive: false });
      }

      const cardEl = document.getElementById('notebookJoyCard');
      if (cardEl) {
        let holdTimer = null;
        let startX = 0, startY = 0;
        let startStkX = curX, startStkY = curY;
        let isHoldReady = false;
        let isDragging = false;
        let hasMoved = false;
        let isTwoFingerRotating = false;
        let startTouchAngle = 0;
        let startStkRot = curRot;

        const cleanupDrag = () => {
          clearTimeout(holdTimer);
          holdTimer = null;
          isHoldReady = false;
          isDragging = false;
          isTwoFingerRotating = false;
          this.notebookJoyWrapper.classList.remove('is-dragging');
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerEnd);
          window.removeEventListener('pointercancel', onPointerEnd);
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onTouchEnd);
          window.removeEventListener('touchcancel', onTouchEnd);
        };

        const onMove = (clientX, clientY, e) => {
          const dx = clientX - startX;
          const dy = clientY - startY;

          if (Math.hypot(dx, dy) > 6) {
            hasMoved = true;
          }

          // Before 200ms hold: if user scrolls the sheet, abort drag
          if (!isHoldReady) {
            if (Math.hypot(dx, dy) > 10) {
              cleanupDrag();
            }
            return;
          }

          // Drag mode
          if (isDragging) {
            if (e && e.cancelable) e.preventDefault();
            const sheet = document.getElementById('notebookSheet');
            if (!sheet) return;
            const rect = sheet.getBoundingClientRect();
            const newX = Math.max(16, Math.min(84, startStkX + (dx / rect.width) * 100));
            const newY = Math.max(70, Math.min(rect.height - 70, startStkY + dy));

            curX = parseFloat(newX.toFixed(2));
            curY = Math.round(newY);
            updateStickerTransform();
          }
        };

        const onEnd = (clientX, clientY, e) => {
          const wasMoved = isDragging && hasMoved;
          cleanupDrag();

          if (wasMoved) {
            this.joyTracker.updatePosition(targetDate, curX, curY, curRot);
            triggerHaptic(15);
            // Show rotate handle for 2.5s right after moving so user can rotate
            this.notebookJoyWrapper.classList.add('has-moved');
            clearTimeout(hideHandleTimer);
            hideHandleTimer = setTimeout(() => {
              this.notebookJoyWrapper?.classList.remove('has-moved');
            }, 2500);
          } else {
            // Quick tap or hold without moving
            triggerHaptic(15);
            if (isPastDay) {
              this.showToast(this.t('joy_archive_readonly') || 'Записи в архиве доступны только для чтения 📖', '📖');
            } else {
              this.openJoyModal(targetDate, true);
            }
          }
        };

        const onPointerMove = (e) => onMove(e.clientX, e.clientY, e);
        const onPointerEnd = (e) => onEnd(e.clientX, e.clientY, e);

        const onTouchMove = (e) => {
          if (isTwoFingerRotating && e.touches.length >= 2) {
            if (e.cancelable) e.preventDefault();
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const currentAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
            const deltaAngle = currentAngle - startTouchAngle;
            let deg = Math.round(startStkRot + deltaAngle);
            deg = ((deg % 360) + 360) % 360;
            curRot = deg;
            updateStickerTransform();
            return;
          }
          if (e.touches && e.touches.length === 1) {
            onMove(e.touches[0].clientX, e.touches[0].clientY, e);
          }
        };

        const onTouchEnd = (e) => {
          if (isTwoFingerRotating) {
            if (e.touches.length < 2) {
              isTwoFingerRotating = false;
              this.joyTracker.updatePosition(targetDate, curX, curY, curRot);
              triggerHaptic(15);
            }
            return;
          }
          const t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
          onEnd(t ? t.clientX : 0, t ? t.clientY : 0, e);
        };

        const startCardInteraction = (clientX, clientY, isTouch, e) => {
          if (e && e.target && e.target.closest('#btnJoyRotateHandle, .notebook-joy-rotate-handle')) {
            return;
          }
          cleanupDrag();

          startX = clientX;
          startY = clientY;
          startStkX = curX;
          startStkY = curY;
          isHoldReady = false;
          isDragging = false;
          hasMoved = false;

          // 200ms hold timer to pick up the sticker
          holdTimer = setTimeout(() => {
            isHoldReady = true;
            isDragging = true;
            this.notebookJoyWrapper.classList.add('is-dragging');
            triggerHaptic([35, 45]);
          }, 200);

          if (isTouch) {
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd, { passive: true });
            window.addEventListener('touchcancel', onTouchEnd, { passive: true });
          } else {
            window.addEventListener('pointermove', onPointerMove, { passive: false });
            window.addEventListener('pointerup', onPointerEnd);
            window.addEventListener('pointercancel', onPointerEnd);
          }
        };

        cardEl.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'touch') return;
          if (e.button !== undefined && e.button !== 0) return;
          startCardInteraction(e.clientX, e.clientY, false, e);
        });

        cardEl.addEventListener('touchstart', (e) => {
          if (e.touches.length === 2) {
            cleanupDrag();
            isTwoFingerRotating = true;
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            startTouchAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
            startStkRot = curRot;
            triggerHaptic(20);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd, { passive: true });
            window.addEventListener('touchcancel', onTouchEnd, { passive: true });
            return;
          }
          if (e.touches.length === 1) {
            startCardInteraction(e.touches[0].clientX, e.touches[0].clientY, true, e);
          }
        }, { passive: false });

        // Mouse wheel rotation on PC/desktop
        cardEl.addEventListener('wheel', (e) => {
          e.preventDefault();
          const step = e.deltaY > 0 ? 5 : -5;
          curRot = Math.round(((curRot + step) % 360 + 360) % 360);
          updateStickerTransform();
          this.joyTracker.updatePosition(targetDate, curX, curY, curRot);
          triggerHaptic(10);
        }, { passive: false });
      }

      const pageSheet = document.getElementById('notebookSheet');
      if (pageSheet && !pageSheet._hasJoyDeselector) {
        pageSheet._hasJoyDeselector = true;
        const deselectJoy = (e) => {
          if (e.target.closest('.notebook-joy-wrapper, .notebook-joy-card, .notebook-joy-rotate-handle, .modal-backdrop')) {
            return;
          }
          const joyWrap = document.getElementById('notebookJoyWrapper');
          if (joyWrap) {
            joyWrap.classList.remove('has-moved');
          }
        };
        pageSheet.addEventListener('click', deselectJoy);
        pageSheet.addEventListener('touchend', deselectJoy);
      }
    } else {
      // No entry for target date: keep notebook sheet completely clean (action is now in the bottom circle button)
      this.notebookJoyWrapper.style.display = 'none';
      this.notebookJoyWrapper.innerHTML = '';
    }
  }

  openJoyModal(dateStr = null, isEdit = false) {
    this.dismissActiveKeyboard();
    if (!this.joyModalBackdrop) return;
    this._joyModalOpenedAt = Date.now();

    const todayStr = this.getTodayDateString();
    const targetDate = dateStr || this.selectedDate || todayStr;

    if (targetDate < todayStr) {
      triggerHaptic(15);
      this.showToast(this.t('joy_archive_readonly') || 'Записи в архиве доступны только для чтения 📖', '📖');
      return;
    }

    this.currentJoyEditingDate = targetDate;

    const existing = this.joyTracker ? this.joyTracker.getEntry(targetDate) : null;

    const isActuallyEdit = !!(isEdit || (existing && existing.text));

    if (this.joyModalTitle) {
      this.joyModalTitle.textContent = isActuallyEdit
        ? (this.t('joy_modal_edit_title') || 'За что я благодарен сегодня?')
        : (this.t('joy_modal_title') || 'За что я благодарен сегодня?');
    }

    if (existing && existing.text) {
      this.currentJoySelectedMood = existing.mood || 'm_great';
      this.currentJoySelectedStickerId = existing.stickerId || this.joyTracker.getRandomStickerId();
      if (this.joyTextInput) this.joyTextInput.value = existing.text || '';
    } else {
      this.currentJoySelectedMood = 'm_great';
      this.currentJoySelectedStickerId = this.joyTracker.getRandomStickerId();
      if (this.joyTextInput) this.joyTextInput.value = '';
    }

    if (this.joyCharCount && this.joyTextInput) {
      this.joyCharCount.textContent = this.joyTextInput.value.length;
    }

    // Reset prompt box
    if (this.joyPromptBox) this.joyPromptBox.style.display = 'none';

    // Update mood chips active state
    if (this.joyMoodSelector) {
      this.joyMoodSelector.querySelectorAll('.joy-mood-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.mood === this.currentJoySelectedMood);
      });
    }

    // Update sticker thumbnail preview
    if (this.joyModalStickerThumb) {
      this.joyModalStickerThumb.src = this.joyTracker.getStickerImagePath(this.currentJoySelectedStickerId);
    }

    this.joyModalBackdrop.classList.add('open', 'active');
    this.joyModalBackdrop.setAttribute('aria-hidden', 'false');

    if (this.joyTextInput) {
      this.joyTextInput.blur();
    }
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  closeJoyModal() {
    if (!this.joyModalBackdrop) return;
    this.joyModalBackdrop.classList.remove('open', 'active');
    this.joyModalBackdrop.setAttribute('aria-hidden', 'true');
    this.dismissActiveKeyboard();
  }

  saveJoyModalEntry() {
    if (!this.joyTracker) return;
    const text = (this.joyTextInput ? this.joyTextInput.value : '').trim().slice(0, 100);
    if (!text) {
      triggerHaptic([30, 40]);
      this.showToast(this.t('inline_input_placeholder') || 'Пожалуйста, запишите что-то хорошее', '✏️');
      if (this.joyTextInput) this.joyTextInput.focus();
      return;
    }

    const todayStr = this.getTodayDateString();
    const dateStr = this.currentJoyEditingDate || todayStr;
    if (dateStr < todayStr) {
      triggerHaptic(15);
      this.showToast(this.t('joy_archive_readonly') || 'Записи в архиве доступны только для чтения 📖', '📖');
      this.closeJoyModal();
      return;
    }

    this.joyTracker.saveEntry(dateStr, {
      text,
      mood: this.currentJoySelectedMood,
      stickerId: this.currentJoySelectedStickerId
    });

    // Companion Maine Coon Cat reaction & reward!
    if (this.petSystem) {
      this.petSystem.data.treats = (this.petSystem.data.treats || 0) + 1;
      this.petSystem.data.happiness = Math.min(100, (this.petSystem.data.happiness || 50) + 12);
      this.petSystem.data.xp = (this.petSystem.data.xp || 0) + 8;
      this.petSystem.checkLevelUp?.();
      this.petSystem.saveData(true);
      this.petSystem.renderMiniCompanion();
      this.petSystem.spawnFlyingTreat('🟤');
      this.petSystem.playPurr();
      const quote = this.t('joy_pet_speech_reward') || 'Мурр! Спасибо за радость дня! 🐾💖';
      this.petSystem.showMiniSpeech(quote);
    }

    this.showToast(this.t('joy_saved_toast') || 'Радость сохранена! Мейни мурлычет 🐾', '☀️');
    triggerHaptic([20, 50, 20]);
    this.closeJoyModal();
    this.updateJoyUI();
  }

  openJoyJarModal() {
    this.dismissActiveKeyboard();
    if (!this.joyJarModalBackdrop) return;
    this._joyJarOpenedAt = Date.now();

    if (typeof this.currentJoyJarIndex !== 'number') {
      this.currentJoyJarIndex = 0;
    }
    this.currentJoyJarBackdropIndex = Math.floor(Math.random() * 5);

    this.renderJoyJarContent();

    this.joyJarModalBackdrop.classList.add('open', 'active');
    this.joyJarModalBackdrop.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      this.joyJarDesk?.querySelectorAll('.notebook-joy-text').forEach(el => this.fitJoyStickerElement(el));
    });
  }

  closeJoyJarModal() {
    if (!this.joyJarModalBackdrop) return;
    this.joyJarModalBackdrop.classList.remove('open', 'active');
    this.joyJarModalBackdrop.setAttribute('aria-hidden', 'true');
  }

  renderJoyJarContent(animate = false) {
    if (!this.joyTracker) return;
    const all = this.joyTracker.getAllEntries();
    const stats = this.joyTracker.getStats();

    if (this.joyJarTotalBadge) {
      this.joyJarTotalBadge.textContent = stats.totalCount;
    }
    if (typeof this.updateJoyDemoBadges === 'function') this.updateJoyDemoBadges();

    if (!this.joyJarDesk) this.joyJarDesk = document.getElementById('joyJarDesk');
    if (!this.joyJarDesk) return;

    if (!all.length) {
      this.joyJarDesk.innerHTML = `
        <div class="joy-jar-empty-state">
          <div class="joy-jar-empty-icon">🫙✨</div>
          <div>${this.t('joy_no_entries') || 'В банке радости пока пусто. Запишите первый добрый момент!'}</div>
        </div>
      `;
      return;
    }

    if (typeof this.currentJoyJarIndex !== 'number' || isNaN(this.currentJoyJarIndex)) {
      this.currentJoyJarIndex = 0;
    }
    this.currentJoyJarIndex = Math.max(0, Math.min(this.currentJoyJarIndex, all.length - 1));

    if (typeof this.currentJoyJarBackdropIndex !== 'number' || isNaN(this.currentJoyJarBackdropIndex)) {
      this.currentJoyJarBackdropIndex = Math.floor(Math.random() * 5);
    }
    const backdropNum = String(this.currentJoyJarBackdropIndex).padStart(2, '0');
    const backdropImg = `./assets/stickers/paper/back_sticker_${backdropNum}.png?v=5`;

    const activeEntry = all[this.currentJoyJarIndex];
    const moods = this.joyTracker.getMoods();
    const moodObj = moods.find(m => m.id === activeEntry.mood) || moods[0];
    const activeStickerImg = this.joyTracker.getStickerImagePath(activeEntry.stickerId);
    const activeRot = (typeof activeEntry.rotate === 'number' && !isNaN(activeEntry.rotate)) ? activeEntry.rotate : -1.5;
    const fontSize = this.getAdaptiveJoyFontSize(activeEntry.text);

    const hasPrev = this.currentJoyJarIndex > 0;
    const hasNext = this.currentJoyJarIndex < all.length - 1;

    this.joyJarDesk.innerHTML = `
      <div class="joy-jar-desk-wrapper">
        <div class="joy-jar-top-meta">
          <div class="joy-jar-date-badge">
            <span class="joy-jar-mood-icon">${moodObj.icon}</span>
            <span class="joy-jar-date-text">${this.formatDateReadable(activeEntry.date)}</span>
          </div>
          <span class="joy-jar-count-badge">${this.currentJoyJarIndex + 1} из ${all.length}</span>
        </div>

        <div class="joy-jar-desk-stage" id="joyJarDeskStage" title="Нажмите, чтобы перелистнуть на следующий стикер">
          <div class="joy-jar-pile-backdrop" style="background-image: url('${backdropImg}');"></div>

          <div class="notebook-joy-card joy-jar-active-sticker ${animate ? 'animate-shuffle' : ''}" id="joyJarActiveSticker" style="background-image: url('${activeStickerImg}'); --rot: ${activeRot}deg; transform: translate(-50%, -50%) rotate(${activeRot}deg);" role="img" aria-label="${this.escapeHtml(activeEntry.text)}">
            <div class="notebook-joy-text" style="--joy-font-size: ${fontSize}px; font-size: ${fontSize}px;">${this.escapeHtml(activeEntry.text)}</div>
          </div>
        </div>

        <div class="joy-jar-nav-bar">
          <button type="button" class="joy-jar-nav-btn" id="btnJoyJarPrev" title="Предыдущий стикер" aria-label="Предыдущий стикер" ${!hasPrev ? 'disabled' : ''}>‹</button>
          <button type="button" class="joy-jar-shuffle-btn" id="btnJoyJarShuffle" title="Случайный стикер из стопки">
            <span>🎲</span>
            <span>Случайный</span>
          </button>
          <button type="button" class="joy-jar-nav-btn" id="btnJoyJarNext" title="Следующий стикер" aria-label="Следующий стикер" ${!hasNext ? 'disabled' : ''}>›</button>
        </div>
      </div>
    `;

    const textEl = this.joyJarDesk.querySelector('#joyJarActiveSticker .notebook-joy-text');
    if (textEl) {
      this.fitJoyStickerElement(textEl);
      requestAnimationFrame(() => this.fitJoyStickerElement(textEl));
    }

    const pickRandomBackdrop = () => {
      this.currentJoyJarBackdropIndex = (this.currentJoyJarBackdropIndex + 1 + Math.floor(Math.random() * 4)) % 5;
    };

    // Prev / Next / Shuffle events
    const btnPrev = this.joyJarDesk.querySelector('#btnJoyJarPrev');
    const btnNext = this.joyJarDesk.querySelector('#btnJoyJarNext');
    const btnShuffle = this.joyJarDesk.querySelector('#btnJoyJarShuffle');
    const activeStickerEl = this.joyJarDesk.querySelector('#joyJarActiveSticker');
    const deskStage = this.joyJarDesk.querySelector('#joyJarDeskStage');

    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentJoyJarIndex > 0) {
          triggerHaptic(15);
          this.currentJoyJarIndex--;
          pickRandomBackdrop();
          this.renderJoyJarContent(true);
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentJoyJarIndex < all.length - 1) {
          triggerHaptic(15);
          this.currentJoyJarIndex++;
          pickRandomBackdrop();
          this.renderJoyJarContent(true);
        }
      });
    }

    if (btnShuffle) {
      btnShuffle.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic([20, 30]);
        let randIdx = Math.floor(Math.random() * all.length);
        if (all.length > 1 && randIdx === this.currentJoyJarIndex) {
          randIdx = (randIdx + 1) % all.length;
        }
        this.currentJoyJarIndex = randIdx;
        pickRandomBackdrop();
        this.renderJoyJarContent(true);
      });
    }

    // Tap on active sticker -> cycle to next
    if (activeStickerEl) {
      activeStickerEl.addEventListener('click', () => {
        triggerHaptic(15);
        if (all.length > 1) {
          this.currentJoyJarIndex = (this.currentJoyJarIndex + 1) % all.length;
          pickRandomBackdrop();
          this.renderJoyJarContent(true);
        }
      });
    }

    // Touch swipe on stage (left -> next, right -> prev)
    if (deskStage) {
      let touchStartX = 0;
      deskStage.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });

      deskStage.addEventListener('touchend', (e) => {
        const touchEndX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : touchStartX;
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 40) {
          if (diffX < 0 && this.currentJoyJarIndex < all.length - 1) {
            triggerHaptic(15);
            this.currentJoyJarIndex++;
            pickRandomBackdrop();
            this.renderJoyJarContent(true);
          } else if (diffX > 0 && this.currentJoyJarIndex > 0) {
            triggerHaptic(15);
            this.currentJoyJarIndex--;
            pickRandomBackdrop();
            this.renderJoyJarContent(true);
          }
        }
      }, { passive: true });
    }

  }

  triggerJoySadMagic() {
    if (!this.joyTracker) return;
    const all = this.joyTracker.getAllEntries();
    if (!all.length) {
      this.showToast(this.t('joy_no_entries') || 'В банке пока нет записей. Добавьте первый момент!', '☀️');
      return;
    }

    triggerHaptic([30, 40, 50]);
    if (this.petSystem) {
      this.petSystem.playPurr();
      this.petSystem.showMiniSpeech('Мурр! Помнишь этот прекрасный день? 🐾💖');
    }

    let newIdx = Math.floor(Math.random() * all.length);
    if (all.length > 1 && newIdx === this.currentJoyJarIndex) {
      newIdx = (newIdx + 1) % all.length;
    }
    this.currentJoyJarIndex = newIdx;
    this.currentJoyJarBackdropIndex = (this.currentJoyJarBackdropIndex + 1 + Math.floor(Math.random() * 4)) % 5;
    this.renderJoyJarContent(true);

    this.showToast('Теплое воспоминание из стопки! 💫', '✨');
  }

  openJoyStickerPicker(targetDate = null) {
    this.dismissActiveKeyboard();
    if (!this.joyStickerPickerBackdrop || !this.joyTracker) return;
    this._joyStickerPickerOpenedAt = Date.now();
    this.joyPickerTargetDate = targetDate;

    const currentStickerId = targetDate
      ? (this.joyTracker.getEntry(targetDate)?.stickerId || 'paper_01')
      : this.currentJoySelectedStickerId;

    if (this.joyStickerPickerGrid) {
      this.joyStickerPickerGrid.innerHTML = this.joyTracker.getAllStickerIds().map(sid => {
        const isActive = sid === currentStickerId;
        return `
          <div class="joy-picker-sticker-item ${isActive ? 'active' : ''}" data-sticker-id="${sid}">
            <picture>
              <source srcset="./assets/stickers/paper/${sid}.webp?v=8" type="image/webp">
              <img src="./assets/stickers/paper/${sid}.png?v=8" alt="${sid}" loading="lazy" draggable="false" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='assets/stickers/paper/${sid}.png?v=8';}">
            </picture>
          </div>
        `;
      }).join('');
    }

    this.joyStickerPickerBackdrop.classList.add('open', 'active');
    this.joyStickerPickerBackdrop.setAttribute('aria-hidden', 'false');
  }

  closeJoyStickerPicker() {
    if (!this.joyStickerPickerBackdrop) return;
    this.joyStickerPickerBackdrop.classList.remove('open', 'active');
    this.joyStickerPickerBackdrop.setAttribute('aria-hidden', 'true');
    this.joyPickerTargetDate = null;
  }

  checkEveningJoyTrigger() {
    if (!this.joyTracker) return;
    const todayStr = this.getTodayDateString();
    if (this.joyTracker.shouldTriggerEveningPrompt(todayStr)) {
      setTimeout(() => {
        if (document.querySelector('.modal-backdrop.open, .modal-backdrop.active')) return;
        this.openJoyModal(todayStr);
      }, 1600);
    }
  }
}

/**
 * ============================================================================
 * MAINE COON COZY COMPANION (TAMAGOTCHI) SYSTEM
 * ============================================================================
 */
// MaineCoonPetSystem is modularized into pet_system.js
if (typeof MaineCoonPetSystem === 'undefined') {
  var MaineCoonPetSystem = window.MaineCoonPetSystem;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new NotebookApp();
  window.clearAllNutritionEntries = () => {
    if (window.app) return window.app.clearAllNutritionEntries();
  };
});



