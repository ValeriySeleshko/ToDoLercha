/**
 * Lightweight Zero-Dependency Local Dev Server for TestFood PWA
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');
const { pipeline } = require('stream');
const { exec } = require('child_process');

const PORT = 8080;
const ROOT_DIR = path.resolve(__dirname);

// Prevent server crash on client disconnect / connection resets (ECONNRESET, EPIPE)
process.on('uncaughtException', (err) => {
  if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE' || err.code === 'ECANCELED')) {
    return;
  }
  console.error('[Server UncaughtException]', err);
});

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8'
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt']);

function getLocalIp() {
  const ifaces = os.networkInterfaces();
  for (const dev in ifaces) {
    for (const details of ifaces[dev]) {
      if (details.family === 'IPv4' && !details.internal && details.address.startsWith('192.168.')) {
        return details.address;
      }
    }
  }
  for (const dev in ifaces) {
    for (const details of ifaces[dev]) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

const server = http.createServer((req, res) => {
  // Safe URL decoding preventing URIError crash on malformed percent escapes
  let reqPath = '/index.html';
  try {
    const rawPath = req.url.split('?')[0];
    reqPath = decodeURIComponent(rawPath);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request: Malformed URI');
    return;
  }

  // Security check: strictly stay inside ROOT_DIR
  const filePath = path.normalize(path.join(ROOT_DIR, reqPath));
  const rel = path.relative(ROOT_DIR, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const etag = `W/"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;

    // HTTP 304 Not Modified support (Instant 0ms repeat requests)
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      res.writeHead(304, {
        'ETag': etag,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      res.end();
      return;
    }

    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'ETag': etag,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'Vary': 'Accept-Encoding'
    };

    // Check if client supports Gzip and file is compressible text/code
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const shouldGzip = COMPRESSIBLE_EXTS.has(ext) && acceptEncoding.includes('gzip') && stats.size > 512;

    if (shouldGzip) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      const rawStream = fs.createReadStream(filePath);
      const gzipStream = zlib.createGzip({ level: 6 });
      pipeline(rawStream, gzipStream, res, () => {});
    } else {
      headers['Content-Length'] = stats.size;
      res.writeHead(200, headers);
      const rawStream = fs.createReadStream(filePath);
      pipeline(rawStream, res, () => {});
    }
  });
});

let currentPort = PORT;
let killedOld = false;

function tryKillProcessOnPort(port) {
  try {
    const { execSync } = require('child_process');
    const out = execSync('netstat -ano').toString();
    const lines = out.split(/\r?\n/);
    let killed = false;
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[0].toUpperCase() === 'TCP') {
        const localAddr = parts[1];
        const state = parts[3];
        const pid = parts[4];
        if (localAddr.endsWith(':' + port) && state.toUpperCase() === 'LISTENING') {
          if (pid && pid !== '0' && pid != process.pid) {
            execSync(`taskkill /F /PID ${pid}`);
            killed = true;
          }
        }
      }
    }
    return killed;
  } catch (e) {
    return false;
  }
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    if (!killedOld && process.platform === 'win32') {
      killedOld = true;
      console.log(`\x1b[33m[!] Порт ${currentPort} уже занят. Завершаем предыдущий процесс...\x1b[0m`);
      const killed = tryKillProcessOnPort(currentPort);
      if (killed) {
        console.log(`\x1b[32m[✓] Предыдущий процесс освобожден. Запуск сервера...\x1b[0m`);
        setTimeout(() => {
          server.listen(currentPort, '0.0.0.0');
        }, 800);
        return;
      }
    }

    currentPort++;
    console.log(`\x1b[33m[!] Порт занят. Переключаемся на порт ${currentPort}...\x1b[0m`);
    server.listen(currentPort, '0.0.0.0');
  } else {
    console.error('Ошибка сервера:', err);
    process.exit(1);
  }
});

server.on('listening', () => {
  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr ? addr.port : currentPort;

  console.clear();
  console.log('\x1b[32m====================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m        📱 PLAN4U FOOD SCANNER: ВЕБ-ПРИЛОЖЕНИЕ ДЛЯ ТЕЛЕФОНА        \x1b[0m');
  console.log('\x1b[32m====================================================================\x1b[0m\n');
  console.log(`  🌐 \x1b[1mДля открытия на компьютере:\x1b[0m`);
  console.log(`     \x1b[33mhttp://localhost:${actualPort}\x1b[0m\n`);
  console.log(`  📲 \x1b[1mДЛЯ ОТКРЫТИЯ НА ТЕЛЕФОНЕ (в одной Wi-Fi сети):\x1b[0m`);
  console.log(`     \x1b[1m\x1b[92mhttp://${localIp}:${actualPort}\x1b[0m\n`);
  console.log('\x1b[90m────────────────────────────────────────────────────────────────────\x1b[0m');
  console.log(`  ⭐ \x1b[1mКак поставить на телефон как приложение:\x1b[0m`);
  console.log(`     1. Откройте в браузере телефона: \x1b[92mhttp://${localIp}:${actualPort}\x1b[0m`);
  console.log(`     2. Нажмите меню браузера (три точки в Chrome или "Поделиться" в Safari)`);
  console.log(`     3. Выберите \x1b[1m«Установить приложение»\x1b[0m или \x1b[1m«На экран "Домой"»\x1b[0m`);
  console.log(`     4. Приложение появится на главном экране телефона с иконкой!`);
  console.log('\x1b[90m────────────────────────────────────────────────────────────────────\x1b[0m');
  console.log(`  ⚡ База продуктов (77 000+ товаров) работает \x1b[1mавтономно с Gzip-ускорением\x1b[0m!`);
  console.log(`  [Нажмите Ctrl + C для остановки сервера]\n`);

  exec(`start http://localhost:${actualPort}`);
});

server.listen(PORT, '0.0.0.0');

