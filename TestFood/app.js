/**
 * Plan4U Food Scanner & Tester - Core App Logic
 * Optimized for high performance, smooth 60/120fps animations & offline resilience
 */

(function () {
  'use strict';

  // DOM Elements
  const dbCountEl = document.getElementById('dbCount');
  const btnStartScan = document.getElementById('btnStartScan');
  const btnSnapPhoto = document.getElementById('btnSnapPhoto');
  const fileInput = document.getElementById('fileInput');
  const manualInput = document.getElementById('manualBarcode');
  const btnClearManual = document.getElementById('btnClearManual');
  const btnManualSubmit = document.getElementById('btnManualSubmit');
  const resultContainer = document.getElementById('resultContainer');
  const historyListEl = document.getElementById('historyList');
  const btnClearHistory = document.getElementById('btnClearHistory');

  // Scanner Modal Elements
  const scannerModal = document.getElementById('scannerModal');
  const btnCloseScanner = document.getElementById('btnCloseScanner');
  const btnToggleTorch = document.getElementById('btnToggleTorch');
  const btnSwitchCam = document.getElementById('btnSwitchCam');

  let html5QrCode = null;
  let isScanning = false;
  let isTorchOn = false;
  let currentFacingMode = 'environment'; // Back camera by default
  let sharedAudioCtx = null;
  const HISTORY_STORAGE_KEY = 'plan4u_testfood_history';

  // 1. Initialize Database & UI
  function initApp() {
    updateDbStats();
    loadHistory();
    registerServiceWorker();

    // Event Listeners
    btnStartScan.addEventListener('click', openLiveScanner);
    btnCloseScanner.addEventListener('click', closeLiveScanner);
    btnToggleTorch.addEventListener('click', toggleTorch);
    btnSwitchCam.addEventListener('click', switchCamera);

    // Native Camera Snap
    btnSnapPhoto.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelected);

    // Manual Barcode Submit & Clear
    const submitManual = () => {
      const code = normalizeBarcode(manualInput.value);
      if (code) {
        handleBarcodeScanned(code);
        manualInput.blur();
      }
    };

    btnManualSubmit.addEventListener('click', submitManual);
    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitManual();
    });

    if (btnClearManual) {
      manualInput.addEventListener('input', () => {
        btnClearManual.style.display = manualInput.value.length > 0 ? 'flex' : 'none';
      });
      btnClearManual.addEventListener('click', () => {
        manualInput.value = '';
        btnClearManual.style.display = 'none';
        manualInput.focus();
      });
    }

    // Quick Test Chips
    document.querySelectorAll('.test-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const code = chip.getAttribute('data-code');
        if (code) handleBarcodeScanned(code);
      });
    });

    // Event delegation for dynamic result container buttons (CSP-friendly, zero inline onclick)
    resultContainer.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      const action = actionBtn.getAttribute('data-action');
      if (action === 'scan-next' || action === 'scan-again') {
        openLiveScanner();
      } else if (action === 'snap-photo') {
        fileInput.click();
      }
    });

    // Clear History
    btnClearHistory.addEventListener('click', clearHistory);
  }

  // Count items in local database
  function updateDbStats() {
    if (window.Plan4U_Food && typeof window.Plan4U_Food === 'object') {
      const count = Object.keys(window.Plan4U_Food).length;
      dbCountEl.textContent = `${count.toLocaleString('ru-RU')} в базе`;
    } else {
      dbCountEl.textContent = 'База не загружена';
    }
  }

  // Barcode normalizer (strips spaces, dashes, invisible characters)
  function normalizeBarcode(raw) {
    if (!raw) return '';
    return String(raw).replace(/[\s\-\u200B-\u200D\uFEFF]/g, '').trim();
  }

  // Clean and sanitize string values
  function cleanText(str, fallback = '') {
    if (!str || typeof str !== 'string') return fallback;
    const trimmed = str.trim();
    if (trimmed === 'undefinedundefined' || trimmed.toLowerCase() === 'без тм') return fallback;
    return trimmed || fallback;
  }

  // 2. Barcode Lookup Engine (Local Plan4U -> Fallback to Open Food Facts)
  async function lookupBarcode(rawCode) {
    const code = normalizeBarcode(rawCode);
    if (!code) return { found: false, barcode: code };

    // A. Local Search in Plan4U_Food (Instant O(1) in-memory lookup)
    if (window.Plan4U_Food && typeof window.Plan4U_Food === 'object') {
      const db = window.Plan4U_Food;
      // Deduplicated candidate keys to avoid redundant hash lookups
      const candidates = Array.from(new Set([
        code,
        code.replace(/^0+/, ''),
        code.length < 13 ? code.padStart(13, '0') : code,
        code.startsWith('MD') ? code.substring(2) : `MD${code}`
      ])).filter(Boolean);

      for (const cand of candidates) {
        if (db[cand]) {
          const it = db[cand];
          return {
            found: true,
            source: 'plan4u',
            sourceName: 'Plan4U Food (Локальная база)',
            sourceBadgeClass: 'badge-plan4u',
            sourceIcon: '🟢',
            barcode: it.barcode || cand,
            name: cleanText(it.name, 'Без названия'),
            brand: cleanText(it.brand, 'Не указан'),
            weight: cleanText(it.weight, 'Не указана'),
            cal: cleanNum(it.cal),
            p: cleanNum(it.p),
            f: cleanNum(it.f),
            c: cleanNum(it.c),
            image: it.image || null
          };
        }
      }
    }

    // B. Fallback: Search in Open Food Facts API (with 6s timeout)
    renderSearchingStatus(code);
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

    try {
      const offUrl = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`;
      const res = await fetch(offUrl, {
        headers: { 'Accept': 'application/json' },
        signal: controller?.signal
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        if (data.status === 1 && data.product) {
          const p = data.product;
          const nut = p.nutriments || {};
          const cal = cleanNum(nut['energy-kcal_100g'] || nut['energy-kcal'] || (nut.energy_100g ? nut.energy_100g / 4.184 : 0));
          const protein = cleanNum(nut.proteins_100g || nut.proteins);
          const fat = cleanNum(nut.fat_100g || nut.fat);
          const carbs = cleanNum(nut.carbohydrates_100g || nut.carbohydrates);

          const title = cleanText(p.product_name || p.product_name_uk || p.product_name_ru || p.product_name_en, 'Без названия');
          const brand = cleanText(p.brands, 'Не указан');
          const weight = cleanText(p.quantity, 'Не указана');
          const image = p.image_url || p.image_front_url || null;

          return {
            found: true,
            source: 'openfoodfacts',
            sourceName: 'Open Food Facts (Глобальная база)',
            sourceBadgeClass: 'badge-off',
            sourceIcon: '🔵',
            barcode: code,
            name: title,
            brand: brand,
            weight: weight,
            cal: cal,
            p: protein,
            f: fat,
            c: carbs,
            image: image
          };
        }
      }
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      console.warn('Open Food Facts API lookup note:', err.message || err);
    }

    // C. Not found anywhere
    return {
      found: false,
      barcode: code,
      sourceName: 'Не найден',
      sourceBadgeClass: 'badge-notfound',
      sourceIcon: '🔴'
    };
  }

  function cleanNum(val) {
    if (val == null) return 0;
    const n = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
    return isNaN(n) || n < 0 ? 0 : Math.round(n * 10) / 10;
  }

  // 3. Audio & Haptic Feedback (Singleton AudioContext with 0ms latency)
  function triggerScanFeedback() {
    // A. Haptic Vibration
    if ('vibrate' in navigator) {
      try { navigator.vibrate([40, 30, 40]); } catch (e) {}
    }

    // B. Clean Audio Beep Synthesizer using persistent AudioContext
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!sharedAudioCtx) {
          sharedAudioCtx = new AudioCtx();
        }
        if (sharedAudioCtx.state === 'suspended') {
          sharedAudioCtx.resume();
        }
        const osc = sharedAudioCtx.createOscillator();
        const gain = sharedAudioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, sharedAudioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, sharedAudioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, sharedAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, sharedAudioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(sharedAudioCtx.destination);
        osc.start();
        osc.stop(sharedAudioCtx.currentTime + 0.08);
      }
    } catch (e) {}
  }

  // 4. Handle Scanned Barcode Event
  async function handleBarcodeScanned(barcode) {
    const cleanCode = normalizeBarcode(barcode);
    if (!cleanCode) return;

    triggerScanFeedback();
    closeLiveScanner();

    // Render loading state with dynamic status tracker
    resultContainer.innerHTML = `
      <div class="result-card loading-card">
        <div class="loading-box">
          <div class="spinner"></div>
          <div class="loading-text-col">
            <span class="loading-main-text">Поиск штрихкода <strong>${escapeHtml(cleanCode)}</strong></span>
            <span id="searchStatusText" class="loading-sub-text">Проверка в локальной базе Plan4U...</span>
          </div>
        </div>
      </div>
    `;
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const result = await lookupBarcode(cleanCode);
    renderResult(result);
    saveToHistory(result);
  }

  function renderSearchingStatus(code) {
    const el = document.getElementById('searchStatusText');
    if (el) {
      el.textContent = `В личной базе не найден. Опрос Open Food Facts для ${code}...`;
      el.classList.add('status-off');
    }
  }

  // 5. Render Result Card
  function renderResult(res) {
    if (!res.found) {
      resultContainer.innerHTML = `
        <div class="result-card">
          <div class="result-header">
            <span class="badge-source badge-notfound">
              <span>🔴</span> Не найден
            </span>
            <span class="barcode-badge">${escapeHtml(res.barcode)}</span>
          </div>
          <div class="product-title" style="color: var(--text-muted); font-size: 1.05rem;">
            Товар со штрихкодом не найден ни в Plan4U Food, ни в Open Food Facts
          </div>
          <p style="font-size: 0.82rem; color: var(--text-dim); line-height: 1.45;">
            Штрихкод отсутствует в локальной базе и на серверах Open Food Facts. Вы можете ввести штрихкод заново или протестировать другой продукт.
          </p>
          <button class="btn-photo-snap" data-action="scan-again" type="button" style="margin-top: 4px;">
            📷 Сканировать другой продукт
          </button>
        </div>
      `;
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    resultContainer.innerHTML = `
      <div class="result-card">
        <div class="result-header">
          <span class="badge-source ${res.sourceBadgeClass}">
            <span>${res.sourceIcon}</span> ${res.sourceName}
          </span>
          <span class="barcode-badge">${escapeHtml(res.barcode)}</span>
        </div>

        <div class="product-title">${escapeHtml(res.name)}</div>

        <div class="meta-tags">
          <div class="meta-pill">
            <span>🏷️</span>
            <span>Бренд: <strong>${escapeHtml(res.brand)}</strong></span>
          </div>
          <div class="meta-pill">
            <span>⚖️</span>
            <span>Фасовка: <strong>${escapeHtml(res.weight)}</strong></span>
          </div>
        </div>

        <div class="nutrition-grid">
          <div class="nut-card nut-calories">
            <span class="nut-icon">🔥</span>
            <span class="nut-val">${res.cal}</span>
            <span class="nut-label">ккал</span>
          </div>
          <div class="nut-card nut-protein">
            <span class="nut-icon">🥩</span>
            <span class="nut-val">${res.p}</span>
            <span class="nut-label">белки</span>
          </div>
          <div class="nut-card nut-fat">
            <span class="nut-icon">🥑</span>
            <span class="nut-val">${res.f}</span>
            <span class="nut-label">жиры</span>
          </div>
          <div class="nut-card nut-carbs">
            <span class="nut-icon">🌾</span>
            <span class="nut-val">${res.c}</span>
            <span class="nut-label">углеводы</span>
          </div>
        </div>
        <div class="nut-per-100">Пищевая и энергетическая ценность на 100 грамм продукта</div>

        <button class="btn-scan-main" data-action="scan-next" type="button" style="padding: 14px; font-size: 0.95rem; margin-top: 4px;">
          📷 Сканировать следующий продукт
        </button>
      </div>
    `;
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 6. Camera Scanner Controller
  async function openLiveScanner() {
    scannerModal.classList.add('active');

    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode('reader');
    }

    const qrConfig = {
      fps: 20,
      qrbox: { width: 280, height: 180 },
      aspectRatio: 1.0,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true // Hardware acceleration on Chrome Android
      }
    };

    try {
      isScanning = true;
      await html5QrCode.start(
        { facingMode: currentFacingMode },
        qrConfig,
        (decodedText) => {
          if (decodedText) {
            handleBarcodeScanned(decodedText);
          }
        },
        () => {} // Ignore transient frame decode drops
      );
    } catch (err) {
      console.warn('Live camera stream unavailable (requires HTTPS or localhost):', err);
      closeLiveScanner();
      // Fast graceful fallback: open standard native camera photo
      fileInput.click();
    }
  }

  async function closeLiveScanner() {
    if (html5QrCode && isScanning) {
      try {
        await html5QrCode.stop();
      } catch (e) {}
      isScanning = false;
    }
    scannerModal.classList.remove('active');
    isTorchOn = false;
    btnToggleTorch.style.background = 'rgba(255,255,255,0.15)';
  }

  async function toggleTorch() {
    if (!html5QrCode || !isScanning) return;
    try {
      isTorchOn = !isTorchOn;
      await html5QrCode.applyVideoConstraints({
        advanced: [{ torch: isTorchOn }]
      });
      btnToggleTorch.style.background = isTorchOn ? 'var(--accent-amber)' : 'rgba(255,255,255,0.15)';
    } catch (e) {
      // Torch not supported on this camera
    }
  }

  async function switchCamera() {
    if (!html5QrCode || !isScanning) return;
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    await closeLiveScanner();
    openLiveScanner();
  }

  // Downscale high-resolution photo (12MP - 48MP) to max 1280px in memory
  // Prevents browser OOM freeze and speeds up barcode recognition by 5x-10x!
  async function downscaleImageFile(file, maxDimension = 1280) {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        return resolve(file);
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { width, height } = img;

        if (width <= maxDimension && height <= maxDimension) {
          return resolve(file);
        }

        const scale = Math.min(maxDimension / width, maxDimension / height);
        const targetWidth = Math.round(width * scale);
        const targetHeight = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.88);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  }

  // Native Camera Photo Snap Handler (Works 100% on HTTP & HTTPS on any phone!)
  async function handleFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode('reader');
    }

    resultContainer.innerHTML = `
      <div class="result-card loading-card">
        <div class="loading-box">
          <div class="spinner"></div>
          <div class="loading-text-col">
            <span class="loading-main-text">Обработка снимка...</span>
            <span class="loading-sub-text">Оптимизация кадра и поиск штрихкода</span>
          </div>
        </div>
      </div>
    `;
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      const processedFile = await downscaleImageFile(file, 1280);
      const decodedText = await html5QrCode.scanFile(processedFile, true);
      if (decodedText) {
        handleBarcodeScanned(decodedText);
      }
    } catch (err) {
      resultContainer.innerHTML = `
        <div class="result-card">
          <div class="result-header">
            <span class="badge-source badge-notfound">Не удалось распознать</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45;">
            Не удалось обнаружить четкий штрихкод на фотографии. Попробуйте сфотографировать ближе, при хорошем освещении, или введите цифры вручную.
          </p>
          <button class="btn-photo-snap" data-action="snap-photo" type="button" style="margin-top: 4px;">
            📸 Сфотографировать заново
          </button>
        </div>
      `;
    } finally {
      fileInput.value = '';
    }
  }

  // 7. History Management
  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      renderHistoryList(list);
    } catch (e) {
      renderHistoryList([]);
    }
  }

  function saveToHistory(item) {
    if (!item || !item.barcode) return;
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      let list = raw ? JSON.parse(raw) : [];
      // Remove duplicate of same barcode
      list = list.filter(i => i.barcode !== item.barcode);
      // Prepend newest
      list.unshift({
        barcode: item.barcode,
        name: item.name || 'Товар не найден',
        brand: item.brand || '',
        weight: item.weight || '',
        cal: item.cal || 0,
        p: item.p || 0,
        f: item.f || 0,
        c: item.c || 0,
        source: item.source || 'notfound',
        sourceName: item.sourceName || '',
        sourceBadgeClass: item.sourceBadgeClass || 'badge-notfound',
        sourceIcon: item.sourceIcon || '🔴',
        found: item.found,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      });
      // Limit to 25 items
      if (list.length > 25) list = list.slice(0, 25);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
      renderHistoryList(list);
    } catch (e) {}
  }

  function renderHistoryList(list) {
    if (!list || list.length === 0) {
      historyListEl.innerHTML = '<div class="empty-state">История сканирований пуста. Нажмите кнопку выше для проверки первого товара!</div>';
      return;
    }

    historyListEl.innerHTML = list.map((it, idx) => `
      <div class="history-item" data-idx="${idx}">
        <div class="history-info">
          <span class="history-name">${escapeHtml(it.name)}</span>
          <span class="history-sub">
            ${it.sourceIcon} ${escapeHtml(it.barcode)} • ${escapeHtml(it.brand || it.sourceName)}
          </span>
        </div>
        <div class="history-cal">
          ${it.cal > 0 ? `${it.cal} ккал` : ''}
        </div>
      </div>
    `).join('');

    // Clicking a history item restores its full view
    historyListEl.querySelectorAll('.history-item').forEach((row) => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-idx'), 10);
        if (list[idx]) renderResult(list[idx]);
      });
    });
  }

  function clearHistory() {
    if (confirm('Очистить историю сканирований?')) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      renderHistoryList([]);
    }
  }

  // 8. PWA Install Prompt handling
  let deferredPrompt = null;
  const pwaInstallBanner = document.getElementById('pwaInstallBanner');
  const btnPwaInstall = document.getElementById('btnPwaInstall');

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (!isStandalone) {
    if (isIos) {
      if (pwaInstallBanner) pwaInstallBanner.style.display = 'flex';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (pwaInstallBanner) pwaInstallBanner.style.display = 'flex';
    });
  }

  if (btnPwaInstall) {
    btnPwaInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (pwaInstallBanner) pwaInstallBanner.style.display = 'none';
        }
        deferredPrompt = null;
      } else if (isIos) {
        alert('Чтобы установить Food Scanner на iPhone:\n\n1. Нажмите иконку «Поделиться» (значок со стрелкой ⎋) внизу экрана в Safari.\n2. В списке выберите «На экран "Домой"» ➕.\n3. Нажмите «Добавить»!');
      } else {
        alert('Чтобы установить приложение:\n\nНажмите три точки меню в браузере и выберите «Установить приложение» или «Добавить на главный экран».');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    if (pwaInstallBanner) pwaInstallBanner.style.display = 'none';
    deferredPrompt = null;
  });

  // 9. Service Worker Registration
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('[SW] Registered successfully');
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          })
          .catch((err) => console.log('[SW] Registration note:', err.message));
      });
    }
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

