const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimize() {
  const rootStickers = path.join(__dirname, '..', 'assets', 'stickers');

  // 1. Delete loose files in assets/stickers
  const looseFiles = fs.readdirSync(rootStickers).filter(f => f.startsWith('cat_') && f.endsWith('.png'));
  console.log('Deleting loose cat files:', looseFiles.length);
  looseFiles.forEach(f => fs.unlinkSync(path.join(rootStickers, f)));

  // 2. Delete more_cats directory
  const moreCatsDir = path.join(rootStickers, 'more_cats');
  if (fs.existsSync(moreCatsDir)) {
    fs.rmSync(moreCatsDir, { recursive: true, force: true });
    console.log('Deleted more_cats directory');
  }

  // 3. Convert remaining folders to webp
  const folders = ['cats', 'fauna', 'flora', 'ocean', 'pigs'];
  let convertedCount = 0;
  let oldBytes = 0;
  let newBytes = 0;

  for (const f of folders) {
    const dir = path.join(rootStickers, f);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(x => x.endsWith('.png'));
    for (const file of files) {
      const srcPath = path.join(dir, file);
      const destPath = path.join(dir, file.replace(/\.png$/, '.webp'));
      const stat = fs.statSync(srcPath);
      oldBytes += stat.size;

      await sharp(srcPath)
        .webp({ quality: 90, alphaQuality: 95, effort: 6 })
        .toFile(destPath);

      const newStat = fs.statSync(destPath);
      newBytes += newStat.size;
      fs.unlinkSync(srcPath); // remove old png
      convertedCount++;
    }
  }

  console.log('Converted ' + convertedCount + ' stickers to WebP.');
  console.log('Old size: ' + (oldBytes / 1024 / 1024).toFixed(2) + ' MB, New size: ' + (newBytes / 1024 / 1024).toFixed(2) + ' MB (Saved ' + ((1 - newBytes / oldBytes) * 100).toFixed(1) + '%)');
}

optimize().catch(console.error);
