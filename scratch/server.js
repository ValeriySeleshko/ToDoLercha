const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save_result') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      fs.writeFileSync(path.join(__dirname, 'result.json'), body);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ ok: true }));
      console.log('RESULT_SAVED:', body);
    });
    return;
  }

  let reqUrl = decodeURIComponent(req.url.split('?')[0]);
  if (reqUrl === '/') reqUrl = '/scratch/find_sticker.html';
  
  if (reqUrl.startsWith('/user_upload/')) {
    const filename = reqUrl.replace('/user_upload/', '');
    const fullPath = path.join('C:\\Users\\valer\\.gemini\\antigravity-ide\\brain\\41f60bd7-28fd-4465-8655-5e0329314e27\\.user_uploaded', filename);
    if (fs.existsSync(fullPath)) {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' });
      return res.end(fs.readFileSync(fullPath));
    }
  }

  const localPath = path.join(__dirname, '..', reqUrl);
  if (fs.existsSync(localPath)) {
    const ext = path.extname(localPath);
    const ct = ext === '.webp' ? 'image/webp' : (ext === '.html' ? 'text/html' : 'application/octet-stream');
    res.writeHead(200, { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*' });
    return res.end(fs.readFileSync(localPath));
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(48921, () => {
  console.log('Server running on http://localhost:48921');
});
