const fs = require('fs');

const appJs = fs.readFileSync('app.js', 'utf8');

const regex = /(?:open|show|toggle|close)([A-Z][a-zA-Z0-9]+(?:Modal|Sheet|Popup|Menu|Dropdown|Dialog|Picker|Lightbox))\s*\(/g;
const methods = new Set();
let m;
while ((m = regex.exec(appJs)) !== null) {
  methods.add(m[0].replace(/\s*\($/, ''));
}

console.log('Methods found:', Array.from(methods).sort());
