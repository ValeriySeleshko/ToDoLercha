/**
 * Silpo Food Database Scraper for Plan4U (Visual Edition - Strict Food Only)
 * 
 * Safely collects STRICTLY food products with EAN barcodes and nutrition facts (calories, protein, fat, carbs)
 * directly from Silpo API (sf-ecom-api.silpo.ua).
 * 
 * Features:
 * - STRICT FOOD FILTER: excludes household goods, clothing, tights, pet food, hygiene, chemistry.
 * - STRICT KBJU FILTER: products without nutrition facts (0/0/0/0) are never saved.
 * - Rich interactive Terminal Dashboard (Progress bars, Live stats, ETA, Recent products feed)
 * - Safe rate limiting (~2-4 req/sec with natural jitter to prevent bans)
 * - Anti-ban headers & exponential backoff on HTTP 429/5xx
 * - Checkpoint / Resume: remembers progress in silpo_progress.json so you can pause/continue anytime
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;
const DB_FILE = path.join(OUTPUT_DIR, 'silpo_food_raw.json');
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'silpo_progress.json');

// Kyiv Flagship Branch (просп. Володимира Івасюка, 46 - максимальный ассортимент)
const BRANCH_ID = '1ed43e73-051b-6842-a111-a5ad042eb496';

// STRICT WHITELIST OF FOOD ROOT CATEGORIES IN SILPO
const FOOD_ROOT_SLUGS = new Set([
  'frukty-ovochi-4788',                           // Фрукти, овочі
  'm-iaso-4411',                                  // М'ясо
  'ryba-4430',                                    // Риба
  'kovbasni-vyroby-i-m-iasni-delikatesy-4731',    // Ковбаси і м'ясні делікатеси
  'syry-1468',                                    // Сири
  'khlib-ta-vypichka-5121',                       // Хліб та випічка
  'gotovi-stravy-i-kulinariia-4761',              // Готові страви і кулінарія
  'molochni-produkty-ta-iaitsia-234',             // Молочні продукти та яйця
  'vlasni-marky-5202',                            // Власні марки (Премія, Повна Чаша)
  'lavka-tradytsii-4487',                         // Лавка Традицій (крафтова фермерська їжа)
  'zdorove-kharchuvannia-4864',                   // Здорове харчування
  'bakaliia-i-konservy-4870',                     // Бакалія і консерви
  'sousy-i-spetsii-4938',                         // Соуси і спеції
  'solodoshchi-498',                              // Солодощі
  'sneky-ta-chypsy-5016',                         // Снеки та чипси
  'kava-chai-359',                                // Кава, чай
  'napoi-52',                                     // Напої
  'zamorozhena-produktsiia-264'                   // Заморожена продукція
]);

// Subcategories / keywords inside allowed trees to definitely SKIP
const NON_FOOD_KEYWORDS = [
  'dlia-domu', 'krasy', 'khimiia', 'pobutova', 'zootovary', 'tovary-dlia-tvaryn',
  'kosmetyka', 'gigiiena', 'odiag', 'kolgotky', 'shkarpetky', 'posud', 'dekor',
  'sviata', 'igrushki', 'kantseliariia', 'apteka', 'tyutiunovi', 'alkogol'
];

// Configuration
const CONFIG = {
  perPage: 50,             // 50 items per category page
  delayMs: 350,            // 350ms delay between detail requests (~2.8 products/sec, safe & fast)
  jitterMs: 100,           // Random +/- jitter to look natural
  maxRetries: 5,           // Retries on 429/network errors
  saveIntervalItems: 10    // Save DB to disk every 10 items
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
  return `${C.bYellow}${'█'.repeat(filled)}${C.dim}${'░'.repeat(empty)}${C.reset} ${clamped.toFixed(0)}%`;
}

function parseNutrient(val) {
  if (val == null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val * 10) / 10;
  const match = String(val).replace(',', '.').match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  return isNaN(num) ? 0 : Math.round(num * 10) / 10;
}

function normalizeBarcode(ean) {
  if (!ean) return null;
  const clean = String(ean).replace(/[^0-9]/g, '');
  if (clean.length === 14 && clean.startsWith('0')) {
    return clean.slice(1);
  }
  if (clean.length === 13 || clean.length === 12 || clean.length === 8) {
    return clean;
  }
  return null;
}

async function fetchJson(url, retries = 0) {
  const headers = {
    'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://silpo.ua/'
  };

  try {
    const res = await fetch(url, { headers });

    if (res.status === 429 || res.status === 503) {
      if (retries >= CONFIG.maxRetries) {
        throw new Error(`Server status ${res.status} after ${retries} retries`);
      }
      const waitTime = (retries + 1) * 15000;
      updateStatus(`Внимание! Защита от частых запросов (статус ${res.status}). Пауза ${waitTime / 1000}с...`);
      await sleep(waitTime);
      return fetchJson(url, retries + 1);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    if (retries < CONFIG.maxRetries) {
      const waitTime = (retries + 1) * 5000;
      updateStatus(`Сбой соединения: ${err.message}. Повтор через ${waitTime / 1000}с...`);
      await sleep(waitTime);
      return fetchJson(url, retries + 1);
    }
    throw err;
  }
}

// State & Metrics
let database = {};
let progress = {
  currentCategoryIdx: 0,
  currentOffset: 0,
  totalSaved: 0,
  completedCategories: []
};

let startTime = Date.now();
let sessionAdded = 0;
let sessionEnriched = 0;
let skippedNonFood = 0;
let recentProducts = [];
let currentStatusMessage = 'Готов к работе';
let currentCatName = '';
let currentCatIdx = 0;
let totalCats = 0;

// Load existing DB & purge zeroes if any slipped in
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    database = {};
    for (const k in raw) {
      // Keep strictly food with KBJU
      if (raw[k] && (raw[k].cal > 0 || raw[k].p > 0 || raw[k].f > 0 || raw[k].c > 0)) {
        database[k] = raw[k];
      }
    }
  } catch (e) {
    database = {};
  }
}

if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
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

function renderDashboard() {
  const totalUnique = Object.keys(database).length;
  let withNutrition = 0;
  for (const b in database) {
    const it = database[b];
    if (it && (it.cal > 0 || it.p > 0 || it.f > 0 || it.c > 0)) {
      withNutrition++;
    }
  }

  const percentNut = totalUnique > 0 ? Math.round((withNutrition / totalUnique) * 100) : 100;
  const elapsedSec = Math.max(1, (Date.now() - startTime) / 1000);
  const speed = (sessionAdded / elapsedSec).toFixed(1);

  const globalPercent = totalCats > 0 ? Math.min(100, Math.round((currentCatIdx / totalCats) * 100)) : 0;
  setConsoleTitle(`[${totalUnique} продуктов] Сільпо - ${currentCatName || 'Каталог'}`);

  let out = '\x1b[2J\x1b[H'; // Clear screen & reset cursor
  out += `${C.bYellow}🛒 СІЛЬПО: СБОР ТОЛЬКО ПРОДУКТОВ ПИТАНИЯ (Plan4U Strict Food Filter)${C.reset}\n`;
  out += `${C.dim}────────────────────────────────────────────────────────────────────────${C.reset}\n\n`;

  out += `  ${C.bold}Общий прогресс:${C.reset}  ${makeProgressBar(globalPercent, 28)}\n\n`;
  out += `  📁 ${C.bold}Отдел еды:${C.reset}     [${currentCatIdx}/${totalCats}] ${C.bCyan}${currentCatName || 'Подготовка...'}${C.reset}\n`;
  out += `\n`;

  out += `${C.bYellow}📊 ПОКАЗАТЕЛИ СБОРА СІЛЬПО (ТОЛЬКО ЕДА):${C.reset}\n`;
  out += `  • Чистых продуктов в базе:  ${C.bGreen}${totalUnique.toLocaleString('ru-RU')} шт.${C.reset} ${C.bGreen}(100% с КБЖУ)${C.reset}\n`;
  out += `  • Добавлено в этой сессии:  ${C.bCyan}+${sessionAdded}${C.reset} ${C.dim}(обогащено: ${sessionEnriched})${C.reset}\n`;
  out += `  • Отсеяно не-еды (нулей):   ${C.bYellow}${skippedNonFood}${C.reset}\n`;
  out += `  • Скорость сбора:           ${C.yellow}${speed} продуктов/сек${C.reset}\n`;
  out += `  • Время в работе:           ${C.white}${formatDuration(elapsedSec)}${C.reset}\n\n`;

  out += `${C.dim}────────────────────────────────────────────────────────────────────────${C.reset}\n`;
  out += `${C.bold}🥗 ПОСЛЕДНИЕ СКАЧАННЫЕ ПРОДУКТЫ ПИТАНИЯ:${C.reset}\n`;

  if (recentProducts.length === 0) {
    out += `  ${C.dim}(ожидание первых продуктов...)${C.reset}\n`;
  } else {
    for (const p of recentProducts.slice(-4)) {
      const name = p.name.length > 42 ? p.name.slice(0, 40) + '..' : p.name.padEnd(42);
      out += `  ${C.bGreen}✔${C.reset}[${C.dim}${p.barcode}${C.reset}] ${name} │ ${C.dim}Ккал:${C.reset}${C.bYellow}${p.cal}${C.reset} ${C.dim}Б:${C.reset}${p.p} ${C.dim}Ж:${C.reset}${p.f} ${C.dim}У:${C.reset}${p.c}\n`;
    }
  }

  out += `${C.dim}────────────────────────────────────────────────────────────────────────${C.reset}\n`;
  out += `Статус: ${C.cyan}${currentStatusMessage}${C.reset}\n`;
  out += `${C.dim}Управление: Нажмите Ctrl + C в любой момент для безопасной паузы.${C.reset}\n`;

  process.stdout.write(out);
}

// Graceful exit
let isExiting = false;
function handleExit() {
  if (isExiting) return;
  isExiting = true;
  saveSnapshot();
  console.log(`\n\n${C.bYellow}[ПАУЗА] Прогресс сохранен в silpo_progress.json! Всего чистых продуктов: ${Object.keys(database).length}.${C.reset}`);
  console.log(`Вы можете продолжить в любой момент, снова запустив "Скачать_Сильпо.bat".\n`);
  process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

async function main() {
  startTime = Date.now();
  renderDashboard();

  updateStatus('Подключение к API Сільпо, загрузка каталога категорий...');

  // 1. Fetch all categories
  let allCats = [];
  try {
    const catData = await fetchJson(`https://sf-ecom-api.silpo.ua/v1/uk/branches/${BRANCH_ID}/categories`);
    allCats = catData.items || catData || [];
  } catch (err) {
    console.error('Не удалось загрузить категории Сільпо:', err.message);
    process.exit(1);
  }

  // Build tree map to trace every category up to root
  const catMap = new Map(allCats.map(c => [c.id, c]));
  function getRootCategory(c) {
    let cur = c;
    while (cur.parentId && catMap.has(cur.parentId)) {
      cur = catMap.get(cur.parentId);
    }
    return cur;
  }

  const parentIds = new Set(allCats.map(c => c.parentId).filter(Boolean));

  // STRICT FILTER: Must be leaf + must descend from FOOD_ROOT_SLUGS + must not contain non-food keywords
  const foodLeaves = allCats.filter(c => {
    if (parentIds.has(c.id)) return false; // skip non-leaves
    const root = getRootCategory(c);
    if (!FOOD_ROOT_SLUGS.has(root.slug)) return false; // reject non-food root trees

    const slug = (c.slug || '').toLowerCase();
    const title = (c.title || '').toLowerCase();
    for (const kw of NON_FOOD_KEYWORDS) {
      if (slug.includes(kw) || title.includes(kw)) return false;
    }
    return true;
  });

  totalCats = foodLeaves.length;
  updateStatus(`Найдено ${totalCats} строго продуктовых отделов Сільпо (химия и одежда отсеяны).`);
  await sleep(1500);

  let processedItemsCounter = 0;

  for (let cIdx = progress.currentCategoryIdx; cIdx < foodLeaves.length; cIdx++) {
    const cat = foodLeaves[cIdx];
    progress.currentCategoryIdx = cIdx;
    currentCatIdx = cIdx + 1;
    currentCatName = cat.title;

    let offset = (cIdx === progress.currentCategoryIdx) ? (progress.currentOffset || 0) : 0;
    let hasMore = true;

    while (hasMore) {
      progress.currentOffset = offset;
      updateStatus(`Отдел "${cat.title}": получение списка продуктов (offset: ${offset})...`);
      renderDashboard();

      const listUrl = `https://sf-ecom-api.silpo.ua/v1/uk/branches/${BRANCH_ID}/products?category=${encodeURIComponent(cat.slug)}&limit=${CONFIG.perPage}&offset=${offset}`;

      let listData;
      try {
        listData = await fetchJson(listUrl);
      } catch (e) {
        updateStatus(`Ошибка отдела ${cat.title}: ${e.message}`);
        await sleep(3000);
        break;
      }

      const items = listData.items || [];
      if (items.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of items) {
        if (!item || !item.slug) continue;

        // Fetch product detail for barcodes and nutrition
        try {
          const detailUrl = `https://sf-ecom-api.silpo.ua/v1/uk/branches/${BRANCH_ID}/products/${encodeURIComponent(item.slug)}`;
          const p = await fetchJson(detailUrl);

          const barcodes = (p.barcodes || []).map(normalizeBarcode).filter(Boolean);
          if (barcodes.length === 0) continue;

          // Parse nutrition facts
          let cal = 0, protein = 0, fat = 0, carbs = 0;
          for (const g of (p.attributeGroups || [])) {
            for (const a of (g.attributes || [])) {
              const k = a.attribute?.key || '';
              const val = a.value?.title ?? a.value?.key;
              if (k === 'calorie') cal = parseNutrient(val);
              else if (k === 'proteins') protein = parseNutrient(val);
              else if (k === 'fats') fat = parseNutrient(val);
              else if (k === 'carbohydrates') carbs = parseNutrient(val);
            }
          }

          // STRICT CHECK: IF ALL 4 ARE ZERO -> SKIP! (It's non-food, tights, soap, or empty)
          const hasNutrition = (cal > 0 || protein > 0 || fat > 0 || carbs > 0);
          if (!hasNutrition) {
            skippedNonFood++;
            continue;
          }

          const title = (p.title || item.title || '').trim();
          const brand = p.brandTitle || '';
          const weight = p.displayRatio || '';

          let addedNow = 0;
          for (const code of barcodes) {
            if (!database[code]) {
              database[code] = {
                name: title,
                cal,
                p: protein,
                f: fat,
                c: carbs,
                brand,
                weight,
                source: 'silpo'
              };
              addedNow++;
              sessionAdded++;
            } else {
              // Enrich if existing had 0
              const ex = database[code];
              if ((ex.cal === 0 && ex.p === 0 && ex.f === 0 && ex.c === 0) && (cal > 0 || protein > 0 || fat > 0 || carbs > 0)) {
                ex.cal = cal;
                ex.p = protein;
                ex.f = fat;
                ex.c = carbs;
                sessionEnriched++;
              }
            }
          }

          if (addedNow > 0) {
            recentProducts.push({ barcode: barcodes[0], name: title, cal, p: protein, f: fat, c: carbs });
            if (recentProducts.length > 8) recentProducts.shift();
          }

          processedItemsCounter++;
          if (processedItemsCounter % CONFIG.saveIntervalItems === 0) {
            saveSnapshot();
          }

          renderDashboard();

          // Polite pause with natural jitter
          const jitter = (Math.random() * 2 - 1) * CONFIG.jitterMs;
          await sleep(Math.max(200, CONFIG.delayMs + jitter));

        } catch (detailErr) {
          // Skip single item failure and continue
        }
      }

      offset += items.length;
      if (items.length < CONFIG.perPage) {
        hasMore = false;
      }
    }

    progress.currentOffset = 0;
    saveSnapshot();
  }

  // Finish
  saveSnapshot();
  console.log('\n\n====================================================================');
  console.log('       [УСПЕХ] СБОР ЧИСТЫХ ПРОДУКТОВ СІЛЬПО ЗАВЕРШЕН!               ');
  console.log('====================================================================');
  console.log(`Всего уникальных продуктов в базе Сільпо: ${Object.keys(database).length} (100% с КБЖУ)`);
  console.log('Файл сохранен: ZakazUA/silpo_food_raw.json');
  console.log('Теперь можно объединить всё через "Подготовить_Базу_Plan4U_Food.bat"!');
  console.log('====================================================================\n');
}

main().catch(err => {
  console.error('\nКритическая ошибка:', err);
  saveSnapshot();
});
