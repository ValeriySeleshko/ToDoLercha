const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function extractIcons() {
  const rootDir = process.cwd();
  let inputPath = path.join(rootDir, 'design_raw', 'Food_Kategory.jpg');
  if (!fs.existsSync(inputPath)) {
    inputPath = path.join(rootDir, 'Food_Kategory.jpg');
  }
  const outDir = path.join(rootDir, 'assets', 'nutrition_icons');
  const wwwOutDir = path.join(rootDir, 'www', 'assets', 'nutrition_icons');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  if (!fs.existsSync(wwwOutDir)) {
    fs.mkdirSync(wwwOutDir, { recursive: true });
  }

  const meta = await sharp(inputPath).metadata();
  const width = meta.width;
  const height = meta.height;
  const colSize = Math.floor(width / 3);
  const rowSize = Math.floor(height / 3);

  console.log(`Processing ${width}x${height} image into 3x3 grid (cell size ${colSize}x${rowSize})...`);

  // Titles/labels for the 9 icons
  const iconMetadata = [
    { id: 'cat_toast_egg', num: 1, label: 'Тост с яйцом', defaultCategory: 'Завтрак' },
    { id: 'cat_fruit_bowl', num: 2, label: 'Фруктовый боул', defaultCategory: 'Полдник' },
    { id: 'cat_salad', num: 3, label: 'Салат с авокадо', defaultCategory: 'Обед' },
    { id: 'cat_toast_banana', num: 4, label: 'Тост с бананом', defaultCategory: 'Перекус' },
    { id: 'cat_meat_plate', num: 5, label: 'Курица с гарниром', defaultCategory: 'Ужин' },
    { id: 'cat_tea_cookies', num: 6, label: 'Чай с печеньем', defaultCategory: 'Чай' },
    { id: 'cat_soup_bowl', num: 7, label: 'Суп / лапша', defaultCategory: 'Обед' },
    { id: 'cat_pie_dessert', num: 8, label: 'Пирог / десерт', defaultCategory: 'Десерт' },
    { id: 'cat_snack_nuts', num: 9, label: 'Вода, бананы и орехи', defaultCategory: 'Перекус' },
  ];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const item = iconMetadata[idx];
      const left = c * colSize;
      const top = r * rowSize;

      // Extract raw cell
      const cellBuffer = await sharp(inputPath)
        .extract({ left, top, width: colSize, height: rowSize })
        .toBuffer();

      // Trim outer white border
      const trimmed = await sharp(cellBuffer)
        .trim({ background: '#ffffff', threshold: 12 })
        .toBuffer({ resolveWithObject: true });

      // Clean outer white pixels to alpha
      const rawTrimmed = await sharp(trimmed.data)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = rawTrimmed;

      const w = info.width;
      const h = info.height;
      const visited = new Uint8Array(w * h);
      const queue = [];

      function isBgPixel(x, y) {
        const offset = (y * w + x) * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        return red >= 242 && green >= 242 && blue >= 242;
      }

      // Seed all 4 borders
      for (let x = 0; x < w; x++) {
        if (isBgPixel(x, 0)) { queue.push((0 * w + x)); visited[0 * w + x] = 1; }
        if (isBgPixel(x, h - 1)) { queue.push(((h - 1) * w + x)); visited[(h - 1) * w + x] = 1; }
      }
      for (let y = 0; y < h; y++) {
        if (isBgPixel(0, y)) { queue.push((y * w + 0)); visited[y * w + 0] = 1; }
        if (isBgPixel(w - 1, y)) { queue.push((y * w + (w - 1))); visited[y * w + (w - 1)] = 1; }
      }

      // BFS to find connected background
      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        const cx = curr % w;
        const cy = Math.floor(curr / w);

        const offset = curr * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const minVal = Math.min(red, green, blue);
        if (minVal >= 250) {
          data[offset + 3] = 0;
        } else {
          const factor = Math.max(0, (250 - minVal) / 8);
          data[offset + 3] = Math.round(255 * factor);
        }

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nIdx = ny * w + nx;
            if (!visited[nIdx] && isBgPixel(nx, ny)) {
              visited[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
      }

      const filenamePng = `meal_icon_${item.num}.png`;
      const filenameWebp = `meal_icon_${item.num}.webp`;
      const targetPathPng = path.join(outDir, filenamePng);
      const targetPathWebp = path.join(outDir, filenameWebp);
      const wwwPathPng = path.join(wwwOutDir, filenamePng);
      const wwwPathWebp = path.join(wwwOutDir, filenameWebp);

      await sharp(data, {
        raw: { width: w, height: h, channels: 4 }
      })
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 95 })
      .toFile(targetPathWebp);

      await sharp(targetPathWebp).png().toFile(targetPathPng);
      fs.copyFileSync(targetPathWebp, wwwPathWebp);
      fs.copyFileSync(targetPathPng, wwwPathPng);

      console.log(`Saved icon ${item.num}: ${item.label} -> ${filenameWebp}`);
    }
  }

  // Save manifest file
  const manifest = iconMetadata.map(item => ({
    id: item.id,
    num: item.num,
    label: item.label,
    defaultCategory: item.defaultCategory,
    src: `assets/nutrition_icons/meal_icon_${item.num}.webp`
  }));
  fs.writeFileSync(path.join(outDir, 'icons.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(wwwOutDir, 'icons.json'), JSON.stringify(manifest, null, 2));
  console.log('Done! All 9 icons generated with connected background transparency.');
}

extractIcons().catch(console.error);
