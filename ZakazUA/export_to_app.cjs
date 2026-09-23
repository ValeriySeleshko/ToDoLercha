/**
 * Export and Format Ukrainian Food Database for Plan4U App & Cloud
 * 
 * Takes `ua_food_raw.json` and produces:
 * 1. `ua_food_database.json`: Compact JSON file.
 * 2. `ua_food_database.js`: Direct JS script for embedding into APK (zero CORS, zero fetch delay).
 * 3. `ua_food_database.csv`: CSV file for direct 1-click import into Supabase / PostgreSQL.
 * 4. Optionally copies directly into Plan4U assets directory for APK build.
 */

const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, 'ua_food_raw.json');
const JSON_OUT = path.join(__dirname, 'ua_food_database.json');
const JS_OUT = path.join(__dirname, 'ua_food_database.js');
const CSV_OUT = path.join(__dirname, 'ua_food_database.csv');

// Target directory in Plan4U project
const PROJECT_ROOT = path.resolve(__dirname, '..');
const APP_DATA_DIR = path.join(PROJECT_ROOT, 'assets');
const WWW_DATA_DIR = path.join(PROJECT_ROOT, 'www', 'assets');

if (!fs.existsSync(RAW_FILE)) {
  console.error(`[Ошибка] Файл ${RAW_FILE} не найден. Сначала запустите скрейпер (Запустить_Скачивание.bat)!`);
  process.exit(1);
}

console.log('====================================================================');
console.log('        ЭКСПОРТ И ОПТИМИЗАЦИЯ БАЗЫ ПРОДУКТОВ ДЛЯ ПРИЛОЖЕНИЯ         ');
console.log('====================================================================');

console.log('Чтение сырого файла ua_food_raw.json...');
const raw = JSON.parse(fs.readFileSync(RAW_FILE, 'utf8'));
const barcodes = Object.keys(raw);
console.log(`Найдено записей: ${barcodes.length}`);

const optimized = {};
let validNutrientsCount = 0;
let csvRows = ['barcode,name,calories,protein,fat,carbs,brand,weight'];

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function getBrandName(brand) {
  if (!brand) return '';
  if (typeof brand === 'string') return brand.trim();
  if (typeof brand === 'object') return (brand.trademark || brand.name || '').trim();
  return '';
}

for (const code of barcodes) {
  const item = raw[code];
  if (!item || !item.name) continue;

  const cal = Number(item.cal) || 0;
  const p = Number(item.p) || 0;
  const f = Number(item.f) || 0;
  const c = Number(item.c) || 0;

  if (cal > 0 || p > 0 || f > 0 || c > 0) {
    validNutrientsCount++;
  }

  const brandName = getBrandName(item.brand);

  // Compact representation
  optimized[code] = {
    name: item.name.trim(),
    cal: cal,
    p: p,
    f: f,
    c: c
  };

  if (brandName && brandName.toLowerCase() !== 'без тм') optimized[code].brand = brandName;
  if (item.weight) optimized[code].weight = item.weight;

  // Add to CSV
  csvRows.push([
    code,
    escapeCsv(item.name.trim()),
    cal,
    p,
    f,
    c,
    escapeCsv(brandName),
    escapeCsv(item.weight || '')
  ].join(','));
}

// 1. Write optimized JSON
const jsonContent = JSON.stringify(optimized);
fs.writeFileSync(JSON_OUT, jsonContent, 'utf8');
const jsonSizeMb = (Buffer.byteLength(jsonContent, 'utf8') / 1024 / 1024).toFixed(2);
console.log(`\n[1/3] Создан JSON: ua_food_database.json (${Object.keys(optimized).length} товаров, размер: ${jsonSizeMb} MB)`);

// 2. Write direct JS format
const jsContent = `/* Plan4U Offline Ukrainian Food Database - Generated ${new Date().toISOString()} */\nwindow.UA_FOOD_DATABASE = ${jsonContent};\n`;
fs.writeFileSync(JS_OUT, jsContent, 'utf8');
const jsSizeMb = (Buffer.byteLength(jsContent, 'utf8') / 1024 / 1024).toFixed(2);
console.log(`[2/3] Создан JS: ua_food_database.js (размер: ${jsSizeMb} MB)`);

// 3. Write CSV for Cloud DB
fs.writeFileSync(CSV_OUT, csvRows.join('\n'), 'utf8');
const csvSizeMb = (Buffer.byteLength(csvRows.join('\n'), 'utf8') / 1024 / 1024).toFixed(2);
console.log(`[3/3] Создан CSV: ua_food_database.csv для импорта в облако (размер: ${csvSizeMb} MB)`);

// 4. Copy to Plan4U assets if target folders exist
try {
  if (!fs.existsSync(APP_DATA_DIR)) fs.mkdirSync(APP_DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(APP_DATA_DIR, 'ua_food_database.js'), jsContent, 'utf8');
  fs.writeFileSync(path.join(APP_DATA_DIR, 'ua_food_database.json'), jsonContent, 'utf8');

  if (fs.existsSync(WWW_DATA_DIR)) {
    fs.writeFileSync(path.join(WWW_DATA_DIR, 'ua_food_database.js'), jsContent, 'utf8');
    fs.writeFileSync(path.join(WWW_DATA_DIR, 'ua_food_database.json'), jsonContent, 'utf8');
  }
  console.log(`\n[Синхронизация] Файлы базы успешно скопированы в assets/ и www/assets/ проекта Plan4U!`);
} catch (e) {
  console.log(`[Предупреждение] Не удалось скопировать в assets: ${e.message}`);
}

console.log('\n====================================================================');
console.log('                     ИТОГОВАЯ СТАТИСТИКА                            ');
console.log('====================================================================');
console.log(`Всего уникальных штрихкодов: ${Object.keys(optimized).length}`);
console.log(`С заполненным КБЖУ:          ${validNutrientsCount}`);
console.log(`Файлы готовы для вшивки в APK и загрузки на облачный сервер!`);
console.log('====================================================================\n');
