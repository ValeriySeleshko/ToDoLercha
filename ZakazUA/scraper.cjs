/**
 * Zakaz.ua Food Database Scraper for Plan4U (Visual Edition)
 * 
 * Safely collects Ukrainian food products with EAN-13 barcodes and nutrition facts (calories, protein, fat, carbs)
 * across major Ukrainian supermarket chains (Novus, Metro, Auchan, Megamarket, Tavria V, EkoMarket).
 * 
 * Features:
 * - Rich interactive Terminal Dashboard (Progress bars, Live stats, ETA, Recent products feed)
 * - Window title bar updates (view progress even when minimized)
 * - Safe rate limiting (~25 products/sec, 1 request every ~2s with natural jitter)
 * - Anti-ban headers & exponential backoff on HTTP 429/5xx
 * - Checkpoint / Resume: remembers progress in progress.json so you can pause/continue anytime
 * - Intelligent deduplication: merges products across stores, keeping the richest nutrition data
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;
const DB_FILE = path.join(OUTPUT_DIR, 'ua_food_raw.json');
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'progress.json');

// Major Ukrainian retail chains on Zakaz.ua with huge food selections
const STORES = [
  { id: '482010105', chain: 'novus', name: 'NOVUS (Київ, SkyMall)' },
  { id: '48215610', chain: 'metro', name: 'METRO Cash & Carry (Київ)' },
  { id: '48246401', chain: 'auchan', name: 'Auchan (Київ, Почайна)' },
  { id: '482676003', chain: 'megamarket', name: 'MEGAMARKET (Київ, Поділ)' },
  { id: '482800030', chain: 'ekomarket', name: 'EkoMarket (Київ)' },
  { id: '482211004', chain: 'tavriav', name: 'Tavria V (Івано-Франківськ / Одеса)' },
  { id: '482776003', chain: 'ultramarket', name: 'Ultramarket (Київ)' },
  { id: '482867104', chain: 'torba', name: 'Torba (Чернівці / Рівне)' },
  { id: '482330018', chain: 'chudomarket', name: 'Chudo Market (Харків)' }
];

// Keywords in category IDs to SKIP (non-food categories)
const NON_FOOD_KEYWORDS = [
  'tobacco', 'cigarette', 'cigar', 'vape',
  'hygiene', 'care', 'cosmetics', 'shampoo', 'soap', 'body', 'face', 'hair', 'oral',
  'clean', 'detergent', 'chemical', 'wash', 'laundry', 'paper-towels',
  'household', 'home', 'living', 'textile', 'interior',
  'animal', 'pet', 'dog', 'cat', 'zoo',
  'kitchen', 'tableware', 'dishes', 'pan', 'knife',
  'stationery', 'office', 'school',
  'cloth', 'shoe', 'wear', 'socks',
  'hobby', 'garden', 'auto', 'car', 'electronic', 'hardware', 'tool',
  'toy', 'game'
];

// Configuration
const CONFIG = {
  perPage: 50,             // 50 items per page
  delayMs: 2000,           // 2000ms delay between page requests (~25 products / second)
  jitterMs: 300,           // Random +/- jitter to look natural
  maxRetries: 5,           // Retries on 429/network errors
  saveIntervalBatches: 2   // Save DB to disk every 2 batches
};

// ANSI Color Helpers
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[90m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bCyan: '\x1b[96m',
  bGreen: '\x1b[92m',
  bYellow: '\x1b[93m'
};

// Utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatDuration(sec) {
  if (!sec || isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const h = Math.floor(m / 60);
  if (h > 0) {
    const rm = m % 60;
    return `${h}ч ${rm < 10 ? '0' : ''}${rm}м`;
  }
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function makeProgressBar(percent, length = 24) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  const filled = Math.round((clamped / 100) * length);
  const empty = length - filled;
  return `${C.bGreen}${'█'.repeat(filled)}${C.dim}${'░'.repeat(empty)}${C.reset} ${clamped.toFixed(0)}%`;
}

function cleanNutrient(str) {
  if (!str) return 0;
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  const match = String(str).replace(',', '.').match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  return isNaN(val) ? 0 : Math.round(val * 10) / 10;
}

function normalizeBarcode(ean) {
  if (!ean) return null;
  const clean = String(ean).replace(/[^0-9]/g, '');
  if (clean.length === 14 && clean.startsWith('0')) {
    return clean.slice(1); // Standard 13-digit EAN-13
  }
  if (clean.length === 13 || clean.length === 12 || clean.length === 8) {
    return clean;
  }
  return null;
}

async function fetchJson(url, retries = 0) {
  const headers = {
    'Accept-Language': 'uk,ru;q=0.9,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://zakaz.ua/'
  };

  try {
    const res = await fetch(url, { headers });

    if (res.status === 429 || res.status === 503) {
      if (retries >= CONFIG.maxRetries) {
        throw new Error(`Server returned status ${res.status} after ${retries} retries`);
      }
      const waitTime = (retries + 1) * 15000;
      updateStatus(`Внимание! Статус ${res.status}. Пауза ${waitTime / 1000}с...`);
      await sleep(waitTime);
      return fetchJson(url, retries + 1);
    }

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    if (retries < CONFIG.maxRetries) {
      const waitTime = (retries + 1) * 5000;
      updateStatus(`Сбой сети: ${err.message}. Повтор через ${waitTime / 1000}с...`);
      await sleep(waitTime);
      return fetchJson(url, retries + 1);
    }
    throw err;
  }
}

// State & metrics
let database = {};
let progress = {
  currentStoreIdx: 0,
  currentCategoryIdx: 0,
  currentPage: 1,
  totalSaved: 0,
  completedStores: []
};

let startTime = Date.now();
let sessionAdded = 0;
let sessionEnriched = 0;
let recentProducts = [];
let currentStatusMessage = 'Готов к работе';
let lastPageResults = 0;
let lastPageTotal = 0;
let currentStoreName = '';
let currentCatName = '';
let currentCatIdx = 0;
let totalCatsInStore = 0;
let currentStoreNum = 1;

// Load existing database & progress
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    database = JSON.parse(raw);
  } catch (e) {
    database = {};
  }
}

if (fs.existsSync(PROGRESS_FILE)) {
  try {
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf8');
    progress = JSON.parse(raw);
  } catch (e) {}
}

function saveSnapshot() {
  fs.writeFileSync(DB_FILE, JSON.stringify(database), 'utf8');
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
}

function updateStatus(msg) {
  currentStatusMessage = msg;
  renderDashboard();
}

function setConsoleTitle(str) {
  try {
    process.stdout.write(`\x1b]0;${str}\x07`);
  } catch (e) {}
}

/**
 * Visual Dashboard Renderer
 */
function renderDashboard() {
  const totalUnique = Object.keys(database).length;
  
  // Calculate how many have nutrition facts
  let withNutrition = 0;
  for (const b in database) {
    const it = database[b];
    if (it.cal > 0 || it.p > 0 || it.f > 0 || it.c > 0) withNutrition++;
  }
  const nutPercent = totalUnique > 0 ? ((withNutrition / totalUnique) * 100).toFixed(0) : 0;

  const elapsedSec = Math.max(1, (Date.now() - startTime) / 1000);
  const speed = (sessionAdded / elapsedSec).toFixed(1); // products / sec

  // Overall store progress
  const storePercent = ((currentStoreNum - 1 + (totalCatsInStore > 0 ? currentCatIdx / totalCatsInStore : 0)) / STORES.length) * 100;
  const storeProgressBar = makeProgressBar(storePercent, 22);

  // Category page progress
  const totalPages = lastPageTotal > 0 ? Math.ceil(lastPageTotal / CONFIG.perPage) : 1;
  const catPercent = totalPages > 0 ? (progress.currentPage / totalPages) * 100 : 0;
  const catProgressBar = makeProgressBar(catPercent, 22);

  // Window title update
  setConsoleTitle(`[${totalUnique} товаров] ${currentStoreName.split(' ')[0]} - ${currentCatName}`);

  // Clear terminal screen smoothly
  console.clear();

  const lines = [
    `${C.cyan}╔════════════════════════════════════════════════════════════════════════════════════╗${C.reset}`,
    `${C.cyan}║${C.bold}${C.white}           ПАРСЕР БАЗЫ ПРОДУКТОВ ПИТАНИЯ УКРАИНЫ (ZAKAZ.UA SCRAPER)                ${C.reset}${C.cyan}║${C.reset}`,
    `${C.cyan}╚════════════════════════════════════════════════════════════════════════════════════╝${C.reset}`,
    '',
    ` ${C.bold}🏪 Магазин:${C.reset}    [${currentStoreNum}/${STORES.length}] ${C.bYellow}${currentStoreName || 'Инициализация...'}${C.reset}`,
    `    Общий ход:  ${storeProgressBar}`,
    '',
    ` ${C.bold}📂 Отдел:${C.reset}      [${currentCatIdx}/${totalCatsInStore}] ${C.bCyan}${currentCatName || 'Подготовка отделов...'}${C.reset}`,
    `    Страницы:   Стр. ${C.bold}${progress.currentPage}${C.reset} из ~${totalPages}  ${catProgressBar}`,
    '',
    `${C.dim}────────────────────────────────────────────────────────────────────────────────────${C.reset}`,
    ` ${C.bold}${C.magenta}📊 ПОКАЗАТЕЛИ СБОРА:${C.reset}`,
    `   • Всего товаров в базе:    ${C.bGreen}${C.bold}${totalUnique.toLocaleString()}${C.reset} шт.`,
    `   • С полным КБЖУ:           ${C.green}${withNutrition.toLocaleString()}${C.reset} шт. (${C.bold}${nutPercent}%${C.reset})`,
    `   • Добавлено в этой сессии: ${C.yellow}+${sessionAdded}${C.reset} (обогащено: ${sessionEnriched})`,
    `   • Скорость сбора:          ${C.cyan}${speed}${C.reset} товаров/сек (1 запрос раз в ~2с)`,
    `   • Время в работе:          ${C.white}${formatDuration(elapsedSec)}${C.reset}`,
    `${C.dim}────────────────────────────────────────────────────────────────────────────────────${C.reset}`,
    ` ${C.bold}${C.white}🛒 ПОСЛЕДНИЕ СКАЧАННЫЕ ТОВАРЫ:${C.reset}`
  ];

  if (recentProducts.length === 0) {
    lines.push(`   ${C.dim}(Ожидание первой пачки товаров...)${C.reset}`);
  } else {
    for (const p of recentProducts.slice(-4).reverse()) {
      const name = p.name.length > 40 ? p.name.slice(0, 39) + '…' : p.name.padEnd(40);
      const nut = `${C.dim}Ккал:${C.reset}${p.cal} ${C.dim}Б:${C.reset}${p.p} ${C.dim}Ж:${C.reset}${p.f} ${C.dim}У:${C.reset}${p.c}`;
      lines.push(`   ${C.green}✔${C.reset} ${C.bYellow}[${p.barcode}]${C.reset} ${C.white}${name}${C.reset} │ ${nut}`);
    }
  }

  lines.push(`${C.dim}────────────────────────────────────────────────────────────────────────────────────${C.reset}`);
  lines.push(` ${C.dim}Статус:${C.reset} ${C.bCyan}${currentStatusMessage}${C.reset}`);
  lines.push(` ${C.dim}Управление:${C.reset} Нажмите ${C.bold}Ctrl + C${C.reset} в любой момент для безопасной паузы.`);

  console.log(lines.join('\n'));
}

// Safe exit handling
let isTerminating = false;
function handleExit() {
  if (isTerminating) return;
  isTerminating = true;
  console.log('\n\n' + C.bYellow + '====================================================================' + C.reset);
  console.log(`[Пауза/Завершение] Сохраняем базу и текущий прогресс...`);
  saveSnapshot();
  const totalUnique = Object.keys(database).length;
  console.log(C.bGreen + `[УСПЕХ] В базе сохранено ${totalUnique.toLocaleString()} уникальных товаров.` + C.reset);
  console.log('Вы можете продолжить сбор в любой момент, просто запустив скрипт снова.');
  console.log(C.bYellow + '====================================================================\n' + C.reset);
  process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

async function main() {
  startTime = Date.now();
  renderDashboard();

  let batchCount = 0;

  for (let sIdx = progress.currentStoreIdx; sIdx < STORES.length; sIdx++) {
    const store = STORES[sIdx];
    progress.currentStoreIdx = sIdx;
    currentStoreNum = sIdx + 1;
    currentStoreName = store.name;

    updateStatus(`Подключаемся к магазину ${store.name}...`);

    // 1. Fetch categories for this store
    let categories = [];
    try {
      const allCats = await fetchJson(`https://stores-api.zakaz.ua/stores/${store.id}/categories/`);
      
      // Filter out non-food categories
      categories = (allCats || []).filter(c => {
        const idLower = (c.id || '').toLowerCase();
        const titleLower = (c.title || '').toLowerCase();
        for (const kw of NON_FOOD_KEYWORDS) {
          if (idLower.includes(kw) || titleLower.includes(kw)) return false;
        }
        return true;
      });

      totalCatsInStore = categories.length;
    } catch (e) {
      updateStatus(`Ошибка категорий ${store.name}: ${e.message}`);
      await sleep(3000);
      continue;
    }

    // 2. Iterate through food categories
    const startCatIdx = (sIdx === progress.currentStoreIdx) ? progress.currentCategoryIdx : 0;

    for (let cIdx = startCatIdx; cIdx < categories.length; cIdx++) {
      const cat = categories[cIdx];
      progress.currentCategoryIdx = cIdx;
      currentCatIdx = cIdx + 1;
      currentCatName = cat.title;

      const startPage = (sIdx === progress.currentStoreIdx && cIdx === progress.currentCategoryIdx) ? progress.currentPage : 1;

      let page = startPage;
      let hasMore = true;

      while (hasMore) {
        progress.currentPage = page;
        updateStatus(`Скачиваем страницу ${page} отдела "${cat.title}"...`);
        renderDashboard();

        const url = `https://stores-api.zakaz.ua/stores/${store.id}/categories/${encodeURIComponent(cat.id)}/products/?page=${page}&per_page=${CONFIG.perPage}`;
        
        try {
          const resData = await fetchJson(url);
          const results = resData.results || [];
          const totalCount = resData.count || 0;

          lastPageResults = results.length;
          lastPageTotal = totalCount;

          if (results.length === 0) {
            hasMore = false;
            break;
          }

          let addedInBatch = 0;
          let enrichedInBatch = 0;

          for (const item of results) {
            const barcode = normalizeBarcode(item.ean);
            if (!barcode) continue;

            const nf = item.nutrition_facts || {};
            const cal = cleanNutrient(nf.ingredient_energy);
            const p = cleanNutrient(nf.ingredient_protein);
            const f = cleanNutrient(nf.ingredient_fat);
            const c = cleanNutrient(nf.ingredient_carbohydrates);

            const title = (item.title || '').trim();
            if (!title) continue;

            let brand = '';
            if (item.producer) {
              if (typeof item.producer === 'string') brand = item.producer.trim();
              else if (typeof item.producer === 'object') brand = (item.producer.trademark || item.producer.name || '').trim();
            }

            // Check if we already have this product
            if (!database[barcode]) {
              database[barcode] = {
                name: title,
                cal: cal,
                p: p,
                f: f,
                c: c,
                brand: brand,
                weight: item.weight || null,
                unit: item.unit || 'g',
                chain: store.chain
              };
              addedInBatch++;
              sessionAdded++;
              recentProducts.push({ barcode, name: title, cal, p, f, c });
              if (recentProducts.length > 8) recentProducts.shift();
            } else {
              // Product exists: enrich if existing had zero nutrition and current has non-zero
              const existing = database[barcode];
              const existingHasNutrition = (existing.cal > 0 || existing.p > 0 || existing.f > 0 || existing.c > 0);
              const currentHasNutrition = (cal > 0 || p > 0 || f > 0 || c > 0);

              if (!existingHasNutrition && currentHasNutrition) {
                existing.cal = cal;
                existing.p = p;
                existing.f = f;
                existing.c = c;
                enrichedInBatch++;
                sessionEnriched++;
              }
            }
          }

          updateStatus(`Успешно обработано: +${addedInBatch} новых, ${enrichedInBatch} обновлено`);
          renderDashboard();

          // Next page check
          if (page * CONFIG.perPage >= totalCount || results.length < CONFIG.perPage) {
            hasMore = false;
          } else {
            page++;
          }

          batchCount++;
          if (batchCount % CONFIG.saveIntervalBatches === 0) {
            saveSnapshot();
          }

          // Gentle delay with natural jitter
          const jitter = (Math.random() * 2 - 1) * CONFIG.jitterMs;
          await sleep(Math.max(1200, CONFIG.delayMs + jitter));

        } catch (err) {
          updateStatus(`Ошибка на стр. ${page}: ${err.message}`);
          await sleep(3000);
          page++;
        }
      }

      // Reset page for next category
      progress.currentPage = 1;
      saveSnapshot();
    }

    // Finished store
    progress.completedStores.push(store.chain);
    progress.currentCategoryIdx = 0;
    progress.currentPage = 1;
    saveSnapshot();
  }

  saveSnapshot();
  renderDashboard();
  console.log('\n' + C.bGreen + '====================================================================');
  console.log(`[ПОЛНЫЙ УСПЕХ] Сбор завершен по всем супермаркетам Украины!`);
  console.log(`Всего уникальных продуктов в базе: ${Object.keys(database).length}`);
  console.log('Теперь запустите "Экспорт_В_Приложение.bat" для подготовки файлов.');
  console.log('====================================================================\n' + C.reset);
}

main().catch(err => {
  console.error('\n[Фатальная ошибка]', err);
  handleExit();
});
