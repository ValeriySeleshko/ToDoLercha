/**
 * Plan4U_Food - Visual Database Compiler & Optimizer
 * 
 * Takes all raw gathered data:
 * 1. `ua_food_raw.json` (Zakaz.ua: Novus, Metro, Auchan, Megamarket, Tavria, etc.)
 * 2. `silpo_food_raw.json` (Сільпо: Премія, Повна Чаша, кулінарія)
 * 3. `atb_food_raw.json` (АТБ: Своя Лінія, Розумний Вибір, De Luxe)
 * 
 * Filters:
 * - STRICT PURGE: eliminates all non-food items where all 4 nutrients are ZERO (cal == 0, p == 0, f == 0, c == 0).
 *   (Detergents, pet food, hygiene, chemistry, empty records are excluded).
 * 
 * Outputs:
 * - `Plan4U_Food.json` (Clean compact JSON)
 * - `Plan4U_Food.js` (Direct embed for offline app / APK: window.Plan4U_Food)
 * - `Plan4U_Food.csv` (1-click import into Supabase / PostgreSQL)
 * - Automatically copies into Plan4U `assets/` and `www/assets/`
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ZAKAZ_DIR = __dirname;

const RAW_ZAKAZ = path.join(ZAKAZ_DIR, 'ua_food_raw.json');
const RAW_SILPO = path.join(ZAKAZ_DIR, 'silpo_food_raw.json');
const RAW_ATB = path.join(ZAKAZ_DIR, 'atb_food_raw.json');
const RAW_LISTEX = path.join(ZAKAZ_DIR, 'listex_food_raw.json');

const OUT_JSON = path.join(ZAKAZ_DIR, 'Plan4U_Food.json');
const OUT_JS = path.join(ZAKAZ_DIR, 'Plan4U_Food.js');
const OUT_CSV = path.join(ZAKAZ_DIR, 'Plan4U_Food.csv');

const APP_ASSETS = path.join(ROOT_DIR, 'assets');
const WWW_ASSETS = path.join(ROOT_DIR, 'www', 'assets');

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

function makeProgressBar(current, total, length = 32) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const filled = Math.round((percent / 100) * length);
  const empty = length - filled;
  return `${C.bGreen}${'█'.repeat(filled)}${C.dim}${'░'.repeat(empty)}${C.reset} ${percent.toFixed(1)}%`;
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function cleanNumber(val) {
  if (val == null) return 0;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
  return isNaN(num) || num < 0 ? 0 : Math.round(num * 10) / 10;
}

function cleanBrand(brand) {
  if (!brand) return '';
  if (typeof brand === 'string') {
    const t = brand.trim();
    return t.toLowerCase() === 'без тм' ? '' : t;
  }
  if (typeof brand === 'object') {
    const t = (brand.trademark || brand.name || '').trim();
    return t.toLowerCase() === 'без тм' ? '' : t;
  }
  return '';
}

function countNutrients(it) {
  if (!it) return 0;
  let count = 0;
  if (cleanNumber(it.cal) > 0) count++;
  if (cleanNumber(it.p) > 0) count++;
  if (cleanNumber(it.f) > 0) count++;
  if (cleanNumber(it.c) > 0) count++;
  return count;
}

function mergeIntoPool(pool, code, incomingItem, stats) {
  if (!pool[code]) {
    pool[code] = incomingItem;
    stats.added++;
    return;
  }

  // Duplicate barcode detected: perform Smart Merge & Enrichment
  stats.duplicates++;
  const existing = pool[code];
  const exScore = countNutrients(existing);
  const inScore = countNutrients(incomingItem);

  if (inScore > exScore) {
    // Incoming has more complete nutrition data -> update nutrition
    existing.cal = incomingItem.cal;
    existing.p = incomingItem.p;
    existing.f = incomingItem.f;
    existing.c = incomingItem.c;
    if (incomingItem.name && incomingItem.name.length > (existing.name || '').length) {
      existing.name = incomingItem.name;
    }
    stats.enriched++;
  }

  // Fill in missing metadata
  if (!existing.brand && incomingItem.brand) existing.brand = incomingItem.brand;
  if (!existing.weight && incomingItem.weight) existing.weight = incomingItem.weight;
}

async function main() {
  process.stdout.write('\x1b[2J\x1b[H'); // Clear console

  console.log(`${C.bGreen}====================================================================${C.reset}`);
  console.log(`${C.bold}       PLAN4U_FOOD: ФИНАЛЬНАЯ КОМПИЛЯЦИЯ И ОЧИСТКА БАЗЫ КБЖУ        ${C.reset}`);
  console.log(`${C.bGreen}====================================================================${C.reset}\n`);

  // 1. Loading raw sources
  const pool = {};
  const stats = {
    zakaz:  { total: 0, duplicates: 0, enriched: 0, added: 0 },
    silpo:  { total: 0, duplicates: 0, enriched: 0, added: 0 },
    atb:    { total: 0, duplicates: 0, enriched: 0, added: 0 },
    listex: { total: 0, duplicates: 0, enriched: 0, added: 0 }
  };

  if (fs.existsSync(RAW_ZAKAZ)) {
    try {
      const data = JSON.parse(fs.readFileSync(RAW_ZAKAZ, 'utf8'));
      for (const k in data) {
        stats.zakaz.total++;
        mergeIntoPool(pool, k, data[k], stats.zakaz);
      }
      console.log(` ${C.bGreen}✔${C.reset} Загружена база супермаркетов Украины (Zakaz.ua): ${C.bold}${stats.zakaz.total.toLocaleString('ru-RU')} товаров${C.reset}`);
    } catch (e) {
      console.log(` ${C.bRed}✖${C.reset} Ошибка чтения ua_food_raw.json: ${e.message}`);
    }
  } else {
    console.log(` ${C.yellow}ℹ${C.reset} База Zakaz.ua не найдена (пропуск)`);
  }

  if (fs.existsSync(RAW_SILPO)) {
    try {
      const data = JSON.parse(fs.readFileSync(RAW_SILPO, 'utf8'));
      for (const k in data) {
        stats.silpo.total++;
        mergeIntoPool(pool, k, data[k], stats.silpo);
      }
      const dupInfo = stats.silpo.duplicates > 0 ? ` ${C.dim}(совпадений: ${stats.silpo.duplicates}, обогащено КБЖУ: ${stats.silpo.enriched})${C.reset}` : '';
      console.log(` ${C.bGreen}✔${C.reset} Загружена база Сільпо (Премія, Повна Чаша): ${C.bold}${stats.silpo.total.toLocaleString('ru-RU')} товаров${C.reset}${dupInfo}`);
    } catch (e) {
      console.log(` ${C.bRed}✖${C.reset} Ошибка чтения silpo_food_raw.json: ${e.message}`);
    }
  } else {
    console.log(` ${C.dim}ℹ База Сільпо пока не собрана (silpo_food_raw.json не найден - пропуск)${C.reset}`);
  }

  if (fs.existsSync(RAW_ATB)) {
    try {
      const data = JSON.parse(fs.readFileSync(RAW_ATB, 'utf8'));
      for (const k in data) {
        stats.atb.total++;
        mergeIntoPool(pool, k, data[k], stats.atb);
      }
      const dupInfo = stats.atb.duplicates > 0 ? ` ${C.dim}(совпадений: ${stats.atb.duplicates}, обогащено КБЖУ: ${stats.atb.enriched})${C.reset}` : '';
      console.log(` ${C.bGreen}✔${C.reset} Загружена база АТБ (Своя Лінія, Розумний Вибір): ${C.bold}${stats.atb.total.toLocaleString('ru-RU')} товаров${C.reset}${dupInfo}`);
    } catch (e) {
      console.log(` ${C.bRed}✖${C.reset} Ошибка чтения atb_food_raw.json: ${e.message}`);
    }
  } else {
    console.log(` ${C.dim}ℹ База АТБ СТМ пока не собрана (atb_food_raw.json не найден - пропуск)${C.reset}`);
  }

  if (fs.existsSync(RAW_LISTEX)) {
    try {
      const data = JSON.parse(fs.readFileSync(RAW_LISTEX, 'utf8'));
      for (const k in data) {
        stats.listex.total++;
        mergeIntoPool(pool, k, data[k], stats.listex);
      }
      const dupInfo = stats.listex.duplicates > 0 ? ` ${C.dim}(совпадений: ${stats.listex.duplicates}, обогащено КБЖУ: ${stats.listex.enriched})${C.reset}` : '';
      console.log(` ${C.bGreen}✔${C.reset} Загружена база Listex.info: ${C.bold}${stats.listex.total.toLocaleString('ru-RU')} товаров${C.reset}${dupInfo}`);
    } catch (e) {
      console.log(` ${C.bRed}✖${C.reset} Ошибка чтения listex_food_raw.json: ${e.message}`);
    }
  } else {
    console.log(` ${C.dim}ℹ База Listex.info пока не создана (listex_food_raw.json не найден - пропуск)${C.reset}`);
  }

  const allBarcodes = Object.keys(pool);
  const totalRaw = allBarcodes.length;

  if (totalRaw === 0) {
    console.log(`\n${C.bRed}[ОШИБКА] Нет исходных данных для обработки! Сначала запустите сбор продуктов.${C.reset}`);
    process.exit(1);
  }

  console.log(`\nВсего сырых уникальных штрихкодов в обработке: ${C.bold}${totalRaw.toLocaleString('ru-RU')}${C.reset}`);
  console.log(`${C.dim}────────────────────────────────────────────────────────────────────${C.reset}\n`);

  console.log(`${C.bold}Фильтрация не-продуктов питания и стандартизация структуры...${C.reset}`);

  const finalDatabase = {};
  let droppedZeroNutrition = 0;
  let validFoodCount = 0;

  let csvRows = ['barcode,name,calories,protein,fat,carbs,brand,weight'];

  const step = Math.max(1, Math.floor(totalRaw / 50));

  for (let i = 0; i < totalRaw; i++) {
    const code = allBarcodes[i];
    const item = pool[code];
    if (!item || !item.name) continue;

    const cal = cleanNumber(item.cal);
    const p = cleanNumber(item.p);
    const f = cleanNumber(item.f);
    const c = cleanNumber(item.c);

    // CRITICAL FILTER: Must NOT be 0 across all 4 nutrients!
    // Non-food items (chemistry, shampoo, laundry detergent, empty items) have 0, 0, 0, 0
    if (cal === 0 && p === 0 && f === 0 && c === 0) {
      droppedZeroNutrition++;
      continue;
    }

    const name = item.name.trim();
    const brand = cleanBrand(item.brand);
    const weight = item.weight ? String(item.weight).trim() : '';

    // Standardized clean record
    finalDatabase[code] = {
      barcode: code,
      name: name,
      cal: cal,
      p: p,
      f: f,
      c: c
    };

    if (brand) finalDatabase[code].brand = brand;
    if (weight) finalDatabase[code].weight = weight;

    // Add to CSV
    csvRows.push([
      code,
      escapeCsv(name),
      cal,
      p,
      f,
      c,
      escapeCsv(brand),
      escapeCsv(weight)
    ].join(','));

    validFoodCount++;

    // Update terminal progress bar
    if (i % step === 0 || i === totalRaw - 1) {
      process.stdout.write(`\r  ${makeProgressBar(i + 1, totalRaw)}  ${C.dim}[Очищено: ${validFoodCount.toLocaleString('ru-RU')} | Отсеяно нулей: ${droppedZeroNutrition.toLocaleString('ru-RU')}]${C.reset}`);
    }
  }

  process.stdout.write('\n\n');

  // 1. Write Plan4U_Food.json
  const jsonContent = JSON.stringify(finalDatabase);
  fs.writeFileSync(OUT_JSON, jsonContent, 'utf8');
  const jsonSizeMb = (Buffer.byteLength(jsonContent, 'utf8') / 1024 / 1024).toFixed(2);
  console.log(` [1/3] ${C.bGreen}✔${C.reset} Создан компактный JSON: ${C.bold}Plan4U_Food.json${C.reset} (${jsonSizeMb} MB)`);

  // 2. Write Plan4U_Food.js
  const jsContent = `/* Plan4U Clean Ukrainian Food Database - Generated ${new Date().toISOString()} */\nwindow.Plan4U_Food = ${jsonContent};\n`;
  fs.writeFileSync(OUT_JS, jsContent, 'utf8');
  const jsSizeMb = (Buffer.byteLength(jsContent, 'utf8') / 1024 / 1024).toFixed(2);
  console.log(` [2/3] ${C.bGreen}✔${C.reset} Создан оффлайн JS-модуль: ${C.bold}Plan4U_Food.js${C.reset} (${jsSizeMb} MB)`);

  // 3. Write Plan4U_Food.csv
  const csvContent = csvRows.join('\n');
  fs.writeFileSync(OUT_CSV, csvContent, 'utf8');
  const csvSizeMb = (Buffer.byteLength(csvContent, 'utf8') / 1024 / 1024).toFixed(2);
  console.log(` [3/3] ${C.bGreen}✔${C.reset} Создана CSV-таблица:    ${C.bold}Plan4U_Food.csv${C.reset} (${csvSizeMb} MB)`);

  // 4. (Disabled) Copy to App directories - working separately in ZakazUA/ for now
  /*
  try {
    if (!fs.existsSync(APP_ASSETS)) fs.mkdirSync(APP_ASSETS, { recursive: true });
    fs.writeFileSync(path.join(APP_ASSETS, 'Plan4U_Food.js'), jsContent, 'utf8');
    fs.writeFileSync(path.join(APP_ASSETS, 'Plan4U_Food.json'), jsonContent, 'utf8');

    if (fs.existsSync(WWW_ASSETS)) {
      fs.writeFileSync(path.join(WWW_ASSETS, 'Plan4U_Food.js'), jsContent, 'utf8');
      fs.writeFileSync(path.join(WWW_ASSETS, 'Plan4U_Food.json'), jsonContent, 'utf8');
    }
    console.log(`\n ${C.bGreen}✔${C.reset} Файлы базы успешно скопированы в ${C.bold}assets/${C.reset} и ${C.bold}www/assets/${C.reset} проекта!`);
  } catch (err) {
    console.log(` [Предупреждение] Не удалось скопировать в assets: ${err.message}`);
  }
  */

  // Final Summary
  console.log(`\n${C.bGreen}====================================================================${C.reset}`);
  console.log(`${C.bold}                ИТОГОВЫЙ ОТЧЕТ БАЗЫ "PLAN4U_FOOD"                   ${C.reset}`);
  console.log(`${C.bGreen}====================================================================${C.reset}`);
  console.log(`  • Всего сырых позиций в базах:          ${totalRaw.toLocaleString('ru-RU')} шт.`);
  console.log(`  • Отсеяно не-продуктов питания (нулей):  ${C.bRed}-${droppedZeroNutrition.toLocaleString('ru-RU')} шт.${C.reset} (бытовая химия, салфетки и т.д.)`);
  console.log(`  • ${C.bold}Чистых продуктов питания с КБЖУ:${C.reset}       ${C.bGreen}${validFoodCount.toLocaleString('ru-RU')} шт.${C.reset} (100% с КБЖУ!)`);
  console.log(`  • Структура каждого продукта:           ${C.bCyan}[штрихкод, название, К, Б, Ж, У]${C.reset}`);
  console.log(`  • Файлы полностью готовы для оффлайн APK и облака Supabase!`);
  console.log(`${C.bGreen}====================================================================${C.reset}\n`);
}

main().catch(err => {
  console.error('\nОшибка компиляции базы:', err);
});
