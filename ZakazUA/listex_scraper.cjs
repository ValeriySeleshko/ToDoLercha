/**
 * Listex Catalog Crawler for Plan4U (Visual Terminal Edition)
 * 
 * Systematically browses food categories on Listex.info, gathers verified barcodes,
 * titles, weights, trademarks, and nutrition facts (calories, protein, fat, carbs),
 * and saves them into `listex_food_raw.json`.
 * 
 * Features:
 * - Interactive Terminal Dashboard (ANSI progress bars, speed, counters, live product feed)
 * - Safe rate limiting (~2-3 req/sec) to avoid rate limits
 * - Checkpoint / Resume: remembers page and category in `listex_progress.json`
 * - Strict Food Filter: only saves items with valid nutrition
 */

const fs = require('fs');
const path = require('path');
const { fetchProduct, parseProductHtml } = require('./listex_core.cjs');

const OUTPUT_DIR = __dirname;
const DB_FILE = path.join(OUTPUT_DIR, 'listex_food_raw.json');
const PROGRESS_FILE = path.join(OUTPUT_DIR, 'listex_progress.json');

// Food categories to crawl on Listex
const CATEGORIES = [
  { slug: 'bread', title: 'Хліб' },
  { slug: 'waffles', title: 'Вафлі' },
  { slug: 'baking', title: 'Випічка' },
  { slug: 'cookies', title: 'Печиво' },
  { slug: 'cake', title: 'Тістечка' },
  { slug: 'milk', title: 'Молоко' },
  { slug: 'cheese', title: 'Сири' },
  { slug: 'butter', title: 'Масло' },
  { slug: 'macaroni', title: 'Макарони' },
  { slug: 'cereals', title: 'Крупи та пластівці' },
  { slug: 'sausages', title: 'Ковбаси' },
  { slug: 'canned-meat', title: 'М\'ясні консерви' },
  { slug: 'fish', title: 'Риба' },
  { slug: 'chocolate', title: 'Шоколад' },
  { slug: 'tea', title: 'Чай' },
  { slug: 'coffee', title: 'Кава' }
];

const CONFIG = {
  delayMs: 400,
  saveIntervalItems: 10
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
  bCyan: '\x1b[96m',
  bGreen: '\x1b[92m',
  bYellow: '\x1b[93m',
  bRed: '\x1b[91m'
};

function makeProgressBar(current, total, length = 28) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const filled = Math.round((percent / 100) * length);
  const empty = length - filled;
  return `${C.bCyan}${'█'.repeat(filled)}${C.dim}${'░'.repeat(empty)}${C.reset} ${percent.toFixed(0)}%`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Database & Progress State
let database = {};
if (fs.existsSync(DB_FILE)) {
  try {
    database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    database = {};
  }
}

let progress = {
  currentCategoryIndex: 0,
  currentPage: 1
};
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch (e) {
    progress = { currentCategoryIndex: 0, currentPage: 1 };
  }
}

let sessionAdded = 0;
let skippedNoNutrition = 0;
const recentProducts = [];
const startTime = Date.now();

function saveSnapshot() {
  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf8');
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
}

function renderDashboard(currentCategory, page, pageItemsCount) {
  process.stdout.write('\x1b[2J\x1b[H'); // Clear console

  const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const rate = (sessionAdded / elapsedSec).toFixed(1);
  const totalInDb = Object.keys(database).length;

  console.log(`${C.bCyan}====================================================================${C.reset}`);
  console.log(`${C.bold}       PLAN4U_FOOD: СБОРЩИК БАЗЫ КБЖУ С LISTEX.INFO                 ${C.reset}`);
  console.log(`${C.bCyan}====================================================================${C.reset}`);

  const catProg = makeProgressBar(progress.currentCategoryIndex + 1, CATEGORIES.length);
  console.log(` Раздел:       ${C.bold}${currentCategory.title}${C.reset} [${progress.currentCategoryIndex + 1}/${CATEGORIES.length}] ${catProg}`);
  console.log(` Страница:     ${C.bYellow}Стр. ${page}${C.reset} (найдено ссылок: ${pageItemsCount})`);
  console.log(` Скорость:     ${C.bGreen}${rate} прод/сек${C.reset} | Прошло времени: ${elapsedSec}с`);
  console.log(` База Listex:  ${C.bold}${totalInDb.toLocaleString('ru-RU')} товаров${C.reset} (в этой сессии: +${sessionAdded})`);
  console.log(` Отсеяно:      ${C.dim}${skippedNoNutrition} (без КБЖУ)${C.reset}`);
  console.log(`${C.dim}────────────────────────────────────────────────────────────────────${C.reset}`);
  console.log(`${C.bold} Лента последних добавленных товаров:${C.reset}`);

  if (recentProducts.length === 0) {
    console.log(`  ${C.dim}Ожидание первых продуктов...${C.reset}`);
  } else {
    for (const p of recentProducts.slice(-6).reverse()) {
      const name = (p.name || '').slice(0, 36).padEnd(36);
      const kbju = `К:${String(p.cal).padStart(3)} Б:${String(p.p).padStart(4)} Ж:${String(p.f).padStart(4)} У:${String(p.c).padStart(4)}`;
      console.log(`  ${C.bGreen}✔${C.reset} ${C.dim}${p.barcode}${C.reset} | ${C.bold}${name}${C.reset} | ${C.cyan}${kbju}${C.reset}`);
    }
  }

  console.log(`${C.dim}────────────────────────────────────────────────────────────────────${C.reset}`);
  console.log(` ${C.dim}Нажмите Ctrl+C для безопасной остановки (прогресс сохранится)${C.reset}\n`);
}

async function scrapeCategory(catIndex) {
  const cat = CATEGORIES[catIndex];
  let page = progress.currentPage || 1;
  let hasMore = true;

  while (hasMore) {
    // Avoid Listex redirect loop on ?page=1
    const pageUrl = page === 1 
      ? `https://listex.info/uk/${cat.slug}/` 
      : `https://listex.info/uk/${cat.slug}/?page=${page}`;

    let html = '';
    try {
      const res = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'uk-UA,uk;q=0.9'
        }
      });
      if (!res.ok) {
        if (res.status === 404) break;
        await sleep(3000);
        break;
      }
      html = await res.text();
    } catch (e) {
      await sleep(2000);
      break;
    }

    // Extract product links
    const regex = /href=["'](\/(?:uk\/)?product\/[^"']+)["']/g;
    const links = new Set();
    let m;
    while ((m = regex.exec(html)) !== null) {
      const clean = m[1].split('#')[0];
      if (!clean.includes('/passport/')) {
        links.add(clean);
      }
    }

    const productUrls = Array.from(links);
    renderDashboard(cat, page, productUrls.length);

    if (productUrls.length === 0) {
      hasMore = false;
      break;
    }

    for (const relUrl of productUrls) {
      try {
        const fullUrl = `https://listex.info${relUrl}`;
        const item = await fetchProduct(fullUrl);

        // Strict nutrition check
        const hasNutrition = (item.cal > 0 || item.p > 0 || item.f > 0 || item.c > 0);
        if (!hasNutrition) {
          skippedNoNutrition++;
          continue;
        }

        if (!database[item.barcode]) {
          database[item.barcode] = item;
          sessionAdded++;
          recentProducts.push(item);
        }

        renderDashboard(cat, page, productUrls.length);
        await sleep(CONFIG.delayMs);
      } catch (err) {
        // Skip failed individual item
      }
    }

    page++;
    progress.currentPage = page;
    saveSnapshot();
  }

  progress.currentPage = 1;
  saveSnapshot();
}

async function main() {
  process.on('SIGINT', () => {
    saveSnapshot();
    console.log(`\n\n${C.bYellow}Сбор остановлен. Прогресс сохранен в ${PROGRESS_FILE}!${C.reset}\n`);
    process.exit(0);
  });

  for (let i = progress.currentCategoryIndex; i < CATEGORIES.length; i++) {
    progress.currentCategoryIndex = i;
    saveSnapshot();
    await scrapeCategory(i);
  }

  saveSnapshot();
  console.log(`\n\n${C.bGreen}Все категории успешно обработаны!${C.reset}\n`);
}

main().catch(err => {
  saveSnapshot();
  console.error('Ошибка краулера:', err);
});
