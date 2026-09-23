// Plan4U Food - Listex GUI Client Application

let currentLoadedProduct = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchBtnText = document.getElementById('searchBtnText');
const searchBtnSpinner = document.getElementById('searchBtnSpinner');

const previewContainer = document.getElementById('previewContainer');
const productImage = document.getElementById('productImage');
const productBarcode = document.getElementById('productBarcode');
const productBrand = document.getElementById('productBrand');
const productWeight = document.getElementById('productWeight');
const productName = document.getElementById('productName');
const productCal = document.getElementById('productCal');
const productP = document.getElementById('productP');
const productF = document.getElementById('productF');
const productC = document.getElementById('productC');
const ratioP = document.getElementById('ratioP');
const ratioF = document.getElementById('ratioF');
const ratioC = document.getElementById('ratioC');
const dbPresenceNotice = document.getElementById('dbPresenceNotice');
const sourceLinkBtn = document.getElementById('sourceLinkBtn');
const saveProductBtn = document.getElementById('saveProductBtn');

const totalDbCount = document.getElementById('totalDbCount');
const listexCacheCount = document.getElementById('listexCacheCount');
const rebuildDbBtn = document.getElementById('rebuildDbBtn');
const toastContainer = document.getElementById('toastContainer');

// Toast Notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ'}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Fetch Stats
async function refreshStats() {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      if (data.totalDb) totalDbCount.textContent = Number(data.totalDb).toLocaleString('ru-RU');
      if (data.listexCount !== undefined) listexCacheCount.textContent = Number(data.listexCount).toLocaleString('ru-RU');
    }
  } catch (e) {
    console.error('Stats error:', e);
  }
}

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

    btn.classList.add('active');
    const tabId = `tab-${btn.dataset.tab}`;
    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.style.display = 'block';
  });
});

// Quick Sample Chips
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    searchInput.value = chip.dataset.query;
    performSearch();
  });
});

// Search execution
async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showToast('Введите штрихкод или ссылку', 'error');
    return;
  }

  searchBtn.disabled = true;
  searchBtnText.style.display = 'none';
  searchBtnSpinner.style.display = 'inline-block';

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || 'Товар не найден на Listex');
    }

    renderProductPreview(data);
    showToast(`Найдено: ${data.name.slice(0, 45)}...`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    searchBtn.disabled = false;
    searchBtnText.style.display = 'inline';
    searchBtnSpinner.style.display = 'none';
  }
}

// Render Preview Card
function renderProductPreview(item) {
  currentLoadedProduct = item;

  productName.textContent = item.name;
  productBarcode.textContent = `EAN: ${item.barcode}`;

  if (item.brand) {
    productBrand.textContent = `ТМ: ${item.brand}`;
    productBrand.style.display = 'inline-block';
  } else {
    productBrand.style.display = 'none';
  }

  if (item.weight) {
    productWeight.textContent = `Масса: ${item.weight}`;
    productWeight.style.display = 'inline-block';
  } else {
    productWeight.style.display = 'none';
  }

  productCal.textContent = item.cal ?? 0;
  productP.textContent = item.p ?? 0;
  productF.textContent = item.f ?? 0;
  productC.textContent = item.c ?? 0;

  // Macro ratio calculations
  const totalMacros = (item.p || 0) + (item.f || 0) + (item.c || 0);
  if (totalMacros > 0) {
    ratioP.style.width = `${((item.p || 0) / totalMacros) * 100}%`;
    ratioF.style.width = `${((item.f || 0) / totalMacros) * 100}%`;
    ratioC.style.width = `${((item.c || 0) / totalMacros) * 100}%`;
  } else {
    ratioP.style.width = '33.3%';
    ratioF.style.width = '33.3%';
    ratioC.style.width = '33.3%';
  }

  if (item.image) {
    productImage.src = item.image;
    productImage.style.display = 'block';
  } else {
    productImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23475569" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
  }

  sourceLinkBtn.href = item.sourceUrl || `https://listex.info/uk/search/?q=${item.barcode}`;

  // Database Presence Status
  if (item.existsInDb) {
    dbPresenceNotice.className = 'db-presence-notice exists';
    dbPresenceNotice.innerHTML = `<span>✔</span> Товар уже есть в базе Plan4U (${item.dbSource || 'база'})`;
    saveProductBtn.textContent = '🔄 Обновить КБЖУ в базе';
  } else {
    dbPresenceNotice.className = 'db-presence-notice new';
    dbPresenceNotice.innerHTML = `<span>★</span> Новый товар — готов к добавлению в Plan4U`;
    saveProductBtn.textContent = '✔ Добавить в базу Plan4U';
  }

  previewContainer.style.display = 'block';
  previewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Save Single Product
saveProductBtn.addEventListener('click', async () => {
  if (!currentLoadedProduct) return;

  saveProductBtn.disabled = true;
  saveProductBtn.innerHTML = '<span class="spinner"></span> Сохранение...';

  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: currentLoadedProduct })
    });
    const result = await res.json();

    if (!res.ok || result.error) {
      throw new Error(result.error || 'Ошибка при сохранении');
    }

    showToast(`Товар ${currentLoadedProduct.barcode} успешно сохранён в Plan4U!`, 'success');
    currentLoadedProduct.existsInDb = true;
    dbPresenceNotice.className = 'db-presence-notice exists';
    dbPresenceNotice.innerHTML = `<span>✔</span> Товар сохранён в базе Plan4U!`;
    saveProductBtn.textContent = '✔ Сохранено';

    refreshStats();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saveProductBtn.disabled = false;
  }
});

// Search button & Enter key
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});

// Rebuild Database Button
rebuildDbBtn.addEventListener('click', async () => {
  if (!confirm('Пересобрать базу Plan4U_Food.json, js и csv из всех источников (Zakaz, Silpo, ATB, Listex)?')) return;

  rebuildDbBtn.disabled = true;
  rebuildDbBtn.innerHTML = '<span class="spinner"></span> Компиляция...';

  try {
    const res = await fetch('/api/rebuild', { method: 'POST' });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Ошибка компиляции');

    showToast(`База успешно скомпилирована! Всего: ${data.total} товаров`, 'success');
    refreshStats();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    rebuildDbBtn.disabled = false;
    rebuildDbBtn.innerHTML = '⚡ Скомпилировать базу';
  }
});

// --- Tab 2: Batch Import Logic ---
const batchTextarea = document.getElementById('batchTextarea');
const startBatchBtn = document.getElementById('startBatchBtn');
const clearBatchBtn = document.getElementById('clearBatchBtn');
const batchSummaryStats = document.getElementById('batchSummaryStats');
const batchProgressContainer = document.getElementById('batchProgressContainer');
const batchProgressText = document.getElementById('batchProgressText');
const batchProgressPercent = document.getElementById('batchProgressPercent');
const batchProgressBar = document.getElementById('batchProgressBar');
const batchTableWrapper = document.getElementById('batchTableWrapper');
const batchTableBody = document.getElementById('batchTableBody');

clearBatchBtn.addEventListener('click', () => {
  batchTextarea.value = '';
  batchSummaryStats.textContent = '';
  batchTableBody.innerHTML = '';
  batchTableWrapper.style.display = 'none';
  batchProgressContainer.style.display = 'none';
});

startBatchBtn.addEventListener('click', async () => {
  const text = batchTextarea.value.trim();
  if (!text) {
    showToast('Вставьте хотя бы один штрихкод', 'error');
    return;
  }

  // Parse queries by comma, space, or newline
  const queries = text.split(/[\r\n,;\t]+/).map(s => s.trim()).filter(Boolean);
  if (queries.length === 0) return;

  startBatchBtn.disabled = true;
  batchProgressContainer.style.display = 'block';
  batchTableWrapper.style.display = 'block';
  batchTableBody.innerHTML = '';

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const percent = Math.round(((i + 1) / queries.length) * 100);
    batchProgressText.textContent = `Обработка: ${i + 1} из ${queries.length} (${q})`;
    batchProgressPercent.textContent = `${percent}%`;
    batchProgressBar.style.width = `${percent}%`;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><code>${q}</code></td>
      <td colspan="3"><span class="spinner"></span> Поиск на Listex...</td>
      <td><span style="color: var(--text-dim);">Загрузка...</span></td>
    `;
    batchTableBody.prepend(row);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const item = await res.json();

      if (!res.ok || item.error) {
        throw new Error(item.error || 'Не найдено');
      }

      // Automatically save to Plan4U if valid food
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item })
      });

      row.innerHTML = `
        <td><strong><code>${item.barcode}</code></strong></td>
        <td>${item.name}</td>
        <td>${item.brand || '—'}</td>
        <td><span style="color: #f59e0b;">${item.cal}</span> / <span style="color: #ef4444;">${item.p}</span> / <span style="color: #10b981;">${item.f}</span> / <span style="color: #06b6d4;">${item.c}</span></td>
        <td><span style="color: var(--accent-green);">✔ Сохранён</span></td>
      `;
      successCount++;
    } catch (err) {
      row.innerHTML = `
        <td><code>${q}</code></td>
        <td colspan="3" style="color: var(--text-dim);">${err.message}</td>
        <td><span style="color: var(--accent-red);">✖ Ошибка</span></td>
      `;
      failCount++;
    }

    // Polite pause
    await new Promise(r => setTimeout(r, 400));
  }

  startBatchBtn.disabled = false;
  batchProgressText.textContent = `Готово! Обработано ${queries.length} шт.`;
  batchSummaryStats.textContent = `Успешно добавлено: ${successCount}, Ошибок: ${failCount}`;
  showToast(`Пакетный сбор завершён. Добавлено: ${successCount}`, 'success');
  refreshStats();
});

// --- Tab 3: Database Inspector Logic ---
const inspectorSearchInput = document.getElementById('inspectorSearchInput');
const inspectorTableBody = document.getElementById('inspectorTableBody');
let inspectorDebounceTimer = null;

inspectorSearchInput.addEventListener('input', () => {
  clearTimeout(inspectorDebounceTimer);
  inspectorDebounceTimer = setTimeout(runInspectorSearch, 300);
});

async function runInspectorSearch() {
  const q = inspectorSearchInput.value.trim();
  if (q.length < 2) {
    inspectorTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-dim); padding: 30px;">
          Введите минимум 2 символа для поиска
        </td>
      </tr>
    `;
    return;
  }

  inspectorTableBody.innerHTML = `
    <tr>
      <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">
        <span class="spinner"></span> Поиск среди 76 000+ товаров...
      </td>
    </tr>
  `;

  try {
    const res = await fetch(`/api/db-search?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      inspectorTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-dim); padding: 30px;">
            По запросу "${q}" ничего не найдено в базе Plan4U
          </td>
        </tr>
      `;
      return;
    }

    inspectorTableBody.innerHTML = data.results.map(it => `
      <tr>
        <td><code>${it.barcode}</code></td>
        <td><strong>${it.name}</strong></td>
        <td>${it.brand || '—'}</td>
        <td>${it.weight || '—'}</td>
        <td style="color: #f59e0b; font-weight: 600;">${it.cal}</td>
        <td style="color: #ef4444;">${it.p}</td>
        <td style="color: #10b981;">${it.f}</td>
        <td style="color: #06b6d4;">${it.c}</td>
      </tr>
    `).join('');
  } catch (err) {
    inspectorTableBody.innerHTML = `
      <tr><td colspan="8" style="color: var(--accent-red); text-align: center;">Ошибка поиска: ${err.message}</td></tr>
    `;
  }
}

// Initial bootstrap
refreshStats();
