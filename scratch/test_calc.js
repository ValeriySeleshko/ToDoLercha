const fs = require('fs');
const cp = require('child_process');

const html = `<!DOCTYPE html>
<html>
<head>
<style>
#test1 { width: calc((100% * 2 / 7) + 15.5px); }
#test2 { width: calc(28.5714% + 15.5px); }
</style>
</head>
<body>
<div style="width: 350px;">
  <div id="test1">test1</div>
  <div id="test2">test2</div>
</div>
<div id="out"></div>
<script>
const t1 = getComputedStyle(document.getElementById('test1')).width;
const t2 = getComputedStyle(document.getElementById('test2')).width;
document.getElementById('out').textContent = 'T1:' + t1 + '|T2:' + t2;
</script>
</body>
</html>`;

fs.writeFileSync('scratch/calc_test.html', html);

try {
  const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const out = cp.execFileSync(chrome, ['--headless', '--disable-gpu', '--dump-dom', 'file:///' + __dirname.replace(/\\/g, '/') + '/scratch/calc_test.html']).toString();
  const match = out.match(/<div id="out">(.*?)<\/div>/);
  console.log('Result:', match ? match[1] : 'not found');
} catch (e) {
  console.error(e.message);
}
