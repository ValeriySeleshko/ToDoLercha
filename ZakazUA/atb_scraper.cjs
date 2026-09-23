/**
 * ATB Private Labels Food Database Scraper for Plan4U (Visual Edition)
 * 
 * Collects products for ATB's private labels:
 * - «Своя Лінія»
 * - «Розумний Вибір»
 * - «De Luxe F&G Selected»
 * 
 * Features:
 * - Rich interactive Terminal Dashboard (Progress bars, Live stats, ETA, Recent products feed)
 * - Window title bar updates
 * - Safe rate limiting (~1 req / 1.5s with natural jitter to prevent bans)
 * - Multi-query category sweep across the Ukrainian food registry
 * - Checkpoint / Resume: remembers progress in atb_progress.json so you can pause/continue anytime
 * - Intelligent deduplication: stores EAN barcodes with verified КБЖУ
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = __dirname;
const DB_FILE = path.join(OUTPUT_DIR, 'atb_food_raw.json');
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'atb_progress.json');

// Brands to target
const ATB_BRANDS = [
  'Своя Лінія',
  'Розумний Вибір',
  'De Luxe F&G Selected'
];

// Food categories to combine with ATB brands for deep coverage
const FOOD_CATEGORIES = [
  'крупа', 'рис', 'гречка', 'вівсянка', 'макарони', 'спагеті', 'борошно', 'цукор',
  'олія', 'масло', 'молоко', 'кефір', 'сметана', 'сир', 'йогурт', 'сирок', 'ряжанка', 'згущене',
  'ковбаса', 'сосиски', 'сардельки', 'шинка', 'паштет', 'курятина', 'фарш',
  'консерви', 'тунець', 'сардина', 'шпроти', 'кукурудза', 'горошок', 'квасоля', 'томати', 'оливки',
  'печиво', 'вафлі', 'пряники', 'сухарі', 'шоколад', 'цукерки', 'халва', 'зефір', 'батончик',
  'чай', 'кава', 'какао', 'сік', 'лимонад', 'морс', 'морозиво',
  'пельмені', 'вареники', 'заморозка', 'суміш', 'хліб', 'лаваш',
  'горіхи', 'арахіс', 'насіння', 'чіпси', 'сухарики', 'снеки', 'попкорн',
  'соус', 'кетчуп', 'майонез', 'гірчиця', 'спеції', 'приправи'
];

// Generate full query list
const QUERIES = [
  // 1. Direct brand queries (Ukrainian, Russian, Latin variants)
  'Своя Лінія', 'Своя Линия', 'Svoya Liniya', 'Svoya Liniia',
  'Розумний Вибір', 'Разумный выбор', 'Rozumnyi Vybir', 'Rozumnyy Vybir',
  'De Luxe F&G Selected', 'De Luxe ATB', 'М\'ясна лавка АТБ', 'Спецзамовлення Чернігівське'
];

// 2. Add brand + category combinations
for (const brand of ATB_BRANDS) {
  for (const cat of FOOD_CATEGORIES) {
    QUERIES.push(`${cat} ${brand}`);
  }
}

// Configuration
const CONFIG = {
  delayMs: 1400,           // 1400ms delay between queries (polite & safe)
  jitterMs: 300,           // Random +/- jitter to look natural
  maxRetries: 5,           // Retries on 429/network errors
  saveIntervalBatches: 2   // Save DB to disk every 2 queries
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
  bBlue: '\x1b[94m',
  bCyan: '\x1b[96m',
  bGreen: '\x1b[92m',
  bYellow: '\x1b[93m',
  bRed: '\x1b[91m'
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
  return `${C.bBlue}${'█'.repeat(filled)}${C.dim}${'░'.repeat(empty)}${C.reset} ${clamped.toFixed(0)}%`;
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
    'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
    'User-Agent': 'Plan4U-App/1.0 (contact@plan4u.app)',
    'Accept': 'application/json'
  };

  try {
    const res = await fetch(url, { headers });

    if (res.status === 429 || res.status === 503) {
      if (retries >= CONFIG.maxRetries) {
        throw new Error(`Server status ${res.status} after ${retries} retries`);
      }
      const waitTime = (retries + 1) * 10000;
      updateStatus(`Внимание! Статус ${res.status}. Пауза ${waitTime / 1000}с...`);
      await sleep(waitTime);
      return fetchJson(url, retries + 1);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    if (retries < CONFIG.maxRetries) {
      const waitTime = (retries + 1) * 4000;
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
  currentQueryIdx: 0,
  totalSaved: 0
};

let startTime = Date.now();
let sessionAdded = 0;
let sessionEnriched = 0;
let recentProducts = [];
let currentStatusMessage = 'Готов к работе';
let currentQueryText = '';
let currentQueryNum = 0;
const totalQueries = QUERIES.length;

// Load existing DB & progress
if (fs.existsSync(DB_FILE)) {
  try {
    database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
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

  const percentNut = totalUnique > 0 ? Math.round((withNutrition / totalUnique) * 100) : 0;
  const elapsedSec = Math.max(1, (Date.now() - startTime) / 1000);
  const speed = (sessionAdded / elapsedSec).toFixed(1);

  const globalPercent = totalQueries > 0 ? Math.min(100, Math.round((currentQueryNum / totalQueries) * 100)) : 0;
  setConsoleTitle(`[${totalUnique} товаров] АТБ СТМ - ${currentQueryText || 'Поиск'}`);

  let out = '\x1b[2J\x1b[H'; // Clear screen & reset cursor
  out += `${C.bBlue}🏬 АТБ-МАРКЕТ: СБОР СОБСТВЕННЫХ МАРОК «СВОЯ ЛІНІЯ» И «РОЗУМНИЙ ВИБІР»${C.reset}\n`;
  out += `${C.dim}────────────────────────────────────────────────────────────────────────${C.reset}\n\n`;

  out += `  ${C.bold}Общий прогресс:${C.reset}  ${makeProgressBar(globalPercent, 28)}\n\n`;
  out += `  🔍 ${C.bold}Запрос:${C.reset}        [${currentQueryNum}/${totalQueries}] ${C.bCyan}${currentQueryText || 'Подготовка...'}${C.reset}\n`;
  out += `\n`;

  out += `${C.bBlue}📊 ПОКАЗАТЕЛИ СБОРА АТБ СТМ:${C.reset}\n`;
  out += `  • Всего товаров в базе:    ${C.bGreen}${totalUnique.toLocaleString('ru-RU')} шт.${C.reset}\n`;
  out += `  • С полным КБЖУ:           ${C.bGreen}${withNutrition.toLocaleString('ru-RU')} шт.${C.reset} ${C.dim}(${percentNut}%)${C.reset}\n`;
  out += `  • Добавлено в этой сессии: ${C.bCyan}+${sessionAdded}${C.reset} ${C.dim}(обогащено: ${sessionEnriched})${C.reset}\n`;
  out += `  • Скорость сбора:          ${C.yellow}${speed} товаров/сек${C.reset}\n`;
  out += `  • Время в работе:          ${C.white}${formatDuration(elapsedSec)}${C.reset}\n\n`;

  out += `${C.dim}────────────────────────────────────────────────────────────────────────${C.reset}\n`;
  out += `${C.bold}🛒 ПОСЛЕДНИЕ СКАЧАННЫЕ ТОВАРЫ АТБ СТМ:${C.reset}\n`;

  if (recentProducts.length === 0) {
    out += `  ${C.dim}(ожидание первых товаров...)${C.reset}\n`;
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
  console.log(`\n\n${C.bBlue}[ПАУЗА] Прогресс сохранен в atb_progress.json! Всего товаров: ${Object.keys(database).length}.${C.reset}`);
  console.log(`Вы можете продолжить в любой момент, снова запустив "Скачать_АТБ_СТМ.bat".\n`);
  process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

function isAtbPrivateLabel(item) {
  const brand = Array.isArray(item.brands) ? item.brands.join(' ') : (item.brands || '');
  const name = item.product_name_ru || item.product_name || '';
  const text = (brand + ' ' + name).toLowerCase();

  const keywords = [
    'своя лінія', 'своя линия', 'svoya liniya', 'svoya liniia',
    'розумний вибір', 'разумный выбор', 'rozumnyi vybir', 'rozumnyy vybir',
    'de luxe', 'м\'ясна лавка', 'спецзамовлення'
  ];

  return keywords.some(kw => text.includes(kw));
}

async function main() {
  startTime = Date.now();
  renderDashboard();

  let batchCount = 0;

  for (let qIdx = progress.currentQueryIdx; qIdx < QUERIES.length; qIdx++) {
    const q = QUERIES[qIdx];
    progress.currentQueryIdx = qIdx;
    currentQueryNum = qIdx + 1;
    currentQueryText = q;

    updateStatus(`Выполняется поиск по реестру: "${q}"...`);
    renderDashboard();

    const url = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}&page_size=100`;

    try {
      const data = await fetchJson(url);
      const hits = data.hits || [];

      let addedInBatch = 0;
      let enrichedInBatch = 0;

      for (const h of hits) {
        const barcode = normalizeBarcode(h.code);
        if (!barcode) continue;

        // Verify that this product belongs to ATB's private labels
        if (!isAtbPrivateLabel(h)) continue;

        const nut = h.nutriments || {};
        let cal = Math.round(Number(nut['energy-kcal_100g'] ?? nut['energy-kcal_value'] ?? (nut['energy_100g'] ? nut['energy_100g'] / 4.184 : 0)) || 0);
        let p = Math.round((Number(nut['proteins_100g'] ?? nut['proteins_value'] ?? 0)) * 10) / 10;
        let f = Math.round((Number(nut['fat_100g'] ?? nut['fat_value'] ?? 0)) * 10) / 10;
        let c = Math.round((Number(nut['carbohydrates_100g'] ?? nut['carbohydrates_value'] ?? 0)) * 10) / 10;

        const title = (h.product_name_ru || h.product_name || `Товар АТБ ${barcode}`).trim();
        const brandStr = Array.isArray(h.brands) ? h.brands.join(', ') : (h.brands || 'АТБ');
        const weight = h.quantity || '';

        if (!database[barcode]) {
          database[barcode] = {
            name: title,
            cal,
            p,
            f,
            c,
            brand: brandStr,
            weight,
            source: 'atb_private_label'
          };
          addedInBatch++;
          sessionAdded++;
          recentProducts.push({ barcode, name: title, cal, p, f, c });
          if (recentProducts.length > 8) recentProducts.shift();
        } else {
          // Enrich if existing was 0
          const ex = database[barcode];
          if ((ex.cal === 0 && ex.p === 0 && ex.f === 0 && ex.c === 0) && (cal > 0 || p > 0 || f > 0 || c > 0)) {
            ex.cal = cal;
            ex.p = p;
            ex.f = f;
            ex.c = c;
            enrichedInBatch++;
            sessionEnriched++;
          }
        }
      }

      updateStatus(`Запрос "${q}" завершен (+${addedInBatch} новых, ${enrichedInBatch} обогащено)`);
      renderDashboard();

      batchCount++;
      if (batchCount % CONFIG.saveIntervalBatches === 0) {
        saveSnapshot();
      }

      // Safe pause with natural jitter
      const jitter = (Math.random() * 2 - 1) * CONFIG.jitterMs;
      await sleep(Math.max(800, CONFIG.delayMs + jitter));

    } catch (err) {
      updateStatus(`Ошибка по запросу "${q}": ${err.message}`);
      await sleep(3000);
    }
  }

  saveSnapshot();
  console.log('\n\n====================================================================');
  console.log('         [УСПЕХ] СБОР СОБСТВЕННЫХ МАРОК АТБ ЗАВЕРШЕН!               ');
  console.log('====================================================================');
  console.log(`Всего уникальных штрихкодов АТБ СТМ: ${Object.keys(database).length}`);
  console.log('Файл сохранен: ZakazUA/atb_food_raw.json');
  console.log('Теперь можно объединить всё через "Подготовить_Базу_Plan4U_Food.bat"!');
  console.log('====================================================================\n');
}

main().catch(err => {
  console.error('\nКритическая ошибка:', err);
  saveSnapshot();
});
