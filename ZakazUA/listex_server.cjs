/**
 * Plan4U Food - Listex Visual Dashboard Server
 * 
 * Standalone lightweight HTTP server providing REST API for:
 * - Product search on Listex.info
 * - Instant database saving & enrichment into Plan4U_Food
 * - In-memory live search across 76,000+ items
 * - Triggering the full database compiler
 * - Serving the modern Glassmorphism Web GUI
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');
const { fetchProduct } = require('./listex_core.cjs');

const PORT = 3737;
const BASE_DIR = __dirname;
const GUI_DIR = path.join(BASE_DIR, 'listex_gui');

const FILE_PLAN4U_JSON = path.join(BASE_DIR, 'Plan4U_Food.json');
const FILE_PLAN4U_JS = path.join(BASE_DIR, 'Plan4U_Food.js');
const FILE_PLAN4U_CSV = path.join(BASE_DIR, 'Plan4U_Food.csv');
const FILE_LISTEX_RAW = path.join(BASE_DIR, 'listex_food_raw.json');

// In-memory cache for fast search
let plan4uDatabase = {};
let listexRawDatabase = {};

function loadDatabases() {
  try {
    if (fs.existsSync(FILE_PLAN4U_JSON)) {
      plan4uDatabase = JSON.parse(fs.readFileSync(FILE_PLAN4U_JSON, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading Plan4U_Food.json:', e.message);
  }

  try {
    if (fs.existsSync(FILE_LISTEX_RAW)) {
      listexRawDatabase = JSON.parse(fs.readFileSync(FILE_LISTEX_RAW, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading listex_food_raw.json:', e.message);
  }
}

// Initial load
loadDatabases();

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function saveItemToAllDatabases(item) {
  if (!item || !item.barcode) return;

  const code = item.barcode;

  // 1. Update Listex raw database
  listexRawDatabase[code] = {
    barcode: code,
    name: item.name,
    cal: item.cal || 0,
    p: item.p || 0,
    f: item.f || 0,
    c: item.c || 0,
    brand: item.brand || '',
    weight: item.weight || '',
    image: item.image || '',
    source: 'listex'
  };
  fs.writeFileSync(FILE_LISTEX_RAW, JSON.stringify(listexRawDatabase, null, 2), 'utf8');

  // 2. Update Plan4U_Food.json
  plan4uDatabase[code] = {
    barcode: code,
    name: item.name,
    cal: item.cal || 0,
    p: item.p || 0,
    f: item.f || 0,
    c: item.c || 0
  };
  if (item.brand) plan4uDatabase[code].brand = item.brand;
  if (item.weight) plan4uDatabase[code].weight = item.weight;

  const jsonContent = JSON.stringify(plan4uDatabase);
  fs.writeFileSync(FILE_PLAN4U_JSON, jsonContent, 'utf8');

  // 3. Update Plan4U_Food.js
  const jsContent = `/* Plan4U Clean Ukrainian Food Database - Generated ${new Date().toISOString()} */\nwindow.Plan4U_Food = ${jsonContent};\n`;
  fs.writeFileSync(FILE_PLAN4U_JS, jsContent, 'utf8');

  // 4. Update CSV
  try {
    const csvLine = [
      code,
      escapeCsv(item.name),
      item.cal || 0,
      item.p || 0,
      item.f || 0,
      item.c || 0,
      escapeCsv(item.brand || ''),
      escapeCsv(item.weight || '')
    ].join(',');
    fs.appendFileSync(FILE_PLAN4U_CSV, `\n${csvLine}`, 'utf8');
  } catch (err) {
    console.error('Error appending to CSV:', err.message);
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Routes ---

  // 1. GET /api/stats
  if (pathname === '/api/stats' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalDb: Object.keys(plan4uDatabase).length,
      listexCount: Object.keys(listexRawDatabase).length
    }));
    return;
  }

  // 2. GET /api/search?q=...
  if (pathname === '/api/search' && req.method === 'GET') {
    const q = parsedUrl.query.q;
    if (!q) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Параметр q обязателен' }));
      return;
    }

    try {
      const product = await fetchProduct(q);
      const existsInDb = !!plan4uDatabase[product.barcode];
      product.existsInDb = existsInDb;
      if (existsInDb) {
        product.existingData = plan4uDatabase[product.barcode];
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(product));
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3. POST /api/save
  if (pathname === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { item } = JSON.parse(body);
        if (!item || !item.barcode) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Неверные данные товара' }));
          return;
        }

        saveItemToAllDatabases(item);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, barcode: item.barcode }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 4. GET /api/db-search?q=...
  if (pathname === '/api/db-search' && req.method === 'GET') {
    const q = (parsedUrl.query.q || '').trim().toLowerCase();
    if (!q || q.length < 2) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ results: [] }));
      return;
    }

    const results = [];
    const isDigitsOnly = /^\d+$/.test(q);

    for (const code in plan4uDatabase) {
      const item = plan4uDatabase[code];
      if (isDigitsOnly && code.includes(q)) {
        results.push(item);
      } else if (!isDigitsOnly && item.name && item.name.toLowerCase().includes(q)) {
        results.push(item);
      }

      if (results.length >= 50) break;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ results }));
    return;
  }

  // 5. POST /api/rebuild
  if (pathname === '/api/rebuild' && req.method === 'POST') {
    exec('node build_plan4u_food.cjs', { cwd: BASE_DIR }, (err, stdout, stderr) => {
      loadDatabases();
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message, stderr }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        total: Object.keys(plan4uDatabase).length,
        log: stdout
      }));
    });
    return;
  }

  // --- Static Files Serving ---
  let filePath = path.join(GUI_DIR, pathname === '/' ? 'index.html' : pathname);
  const extname = path.extname(filePath);

  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404: Файл не найден');
      } else {
        res.writeHead(500);
        res.end(`Ошибка сервера: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  console.log(`\x1b[32m============================================================\x1b[0m`);
  console.log(`\x1b[1m\x1b[36m    PLAN4U FOOD × LISTEX: ВИЗУАЛЬНЫЙ СКРИПТ ЗАПУЩЕН        \x1b[0m`);
  console.log(`\x1b[32m============================================================\x1b[0m\n`);
  console.log(`  • Локальный веб-интерфейс: \x1b[1m\x1b[96m${localUrl}\x1b[0m`);
  console.log(`  • База Plan4U_Food:        \x1b[1m\x1b[92m${Object.keys(plan4uDatabase).length.toLocaleString('ru-RU')} товаров\x1b[0m`);
  console.log(`  • Кэш Listex.info:         \x1b[1m\x1b[93m${Object.keys(listexRawDatabase).length.toLocaleString('ru-RU')} товаров\x1b[0m`);
  console.log(`\n  \x1b[90mОткрываем браузер автоматически...\x1b[0m\n`);

  // Auto-open browser on Windows
  exec(`start ${localUrl}`);
});
