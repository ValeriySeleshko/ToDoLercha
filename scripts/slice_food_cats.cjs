const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function sliceFoodCats() {
  const rootDir = process.cwd();
  const outDir = path.join(rootDir, 'assets', 'food_cats');
  const wwwOutDir = path.join(rootDir, 'www', 'assets', 'food_cats');

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(wwwOutDir)) fs.mkdirSync(wwwOutDir, { recursive: true });

  const colors = [
    { id: 1, name: 'Рыжий', file: 'FoodCat01.jpg' },
    { id: 2, name: 'Дымчатый', file: 'FoodCat02.jpg' },
    { id: 3, name: 'Полосатый', file: 'FoodCat03.jpg' },
    { id: 4, name: 'Белоснежный', file: 'FoodCat04.jpg' },
    { id: 5, name: 'Черепаховый', file: 'FoodCat05.jpg' },
    { id: 6, name: 'Черный', file: 'FoodCat06.jpg' }
  ];

  const row0Cols = [
    { step: 1, startX: 0, endX: 585 },
    { step: 2, startX: 585, endX: 1133 },
    { step: 3, startX: 1133, endX: 1679 },
    { step: 4, startX: 1679, endX: 2221 },
    { step: 5, startX: 2221, endX: 2816 }
  ];

  const row1Cols = [
    { step: 6, startX: 0, endX: 591 },
    { step: 7, startX: 591, endX: 1136 },
    { step: 8, startX: 1136, endX: 1678 },
    { step: 9, startX: 1678, endX: 2221 },
    { step: 10, startX: 2221, endX: 2816 }
  ];

  const manifest = [];

  for (const catColor of colors) {
    let inputPath = path.join(rootDir, 'design_raw', catColor.file);
    if (!fs.existsSync(inputPath)) {
      inputPath = path.join(rootDir, catColor.file);
    }
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      continue;
    }

    console.log(`Processing color ${catColor.id}: ${catColor.name} (${catColor.file})...`);
    const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const imgW = info.width;
    const imgH = info.height;

    const colorSteps = [];

    // Process all 10 steps
    for (let step = 1; step <= 10; step++) {
      let isRow0 = step <= 5;
      let colDef = isRow0 ? row0Cols[step - 1] : row1Cols[step - 6];
      let startY = isRow0 ? 0 : 750;
      let endY = isRow0 ? 750 : imgH;

      let startX = colDef.startX;
      let endX = colDef.endX;

      let cropW = endX - startX;
      let cropH = endY - startY;

      const cropBuf = Buffer.alloc(cropW * cropH * 4);
      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          const srcIdx = ((startY + y) * imgW + (startX + x)) * 4;
          const dstIdx = (y * cropW + x) * 4;
          cropBuf[dstIdx] = data[srcIdx];
          cropBuf[dstIdx + 1] = data[srcIdx + 1];
          cropBuf[dstIdx + 2] = data[srcIdx + 2];
          cropBuf[dstIdx + 3] = 255;
        }
      }

      // BFS flood fill from borders to make outer white background transparent
      const visited = new Uint8Array(cropW * cropH);
      const queue = [];

      const isBg = (x, y) => {
        const idx = (y * cropW + x) * 4;
        const r = cropBuf[idx];
        const g = cropBuf[idx + 1];
        const b = cropBuf[idx + 2];
        return r >= 238 && g >= 238 && b >= 238;
      };

      for (let x = 0; x < cropW; x++) {
        if (isBg(x, 0)) { visited[x] = 1; queue.push(x, 0); }
        if (isBg(x, cropH - 1)) { visited[(cropH - 1) * cropW + x] = 1; queue.push(x, cropH - 1); }
      }
      for (let y = 0; y < cropH; y++) {
        if (isBg(0, y)) { visited[y * cropW] = 1; queue.push(0, y); }
        if (isBg(cropW - 1, y)) { visited[y * cropW + (cropW - 1)] = 1; queue.push(cropW - 1, y); }
      }

      let qHead = 0;
      while (qHead < queue.length) {
        const qx = queue[qHead++];
        const qy = queue[qHead++];
        const dstIdx = (qy * cropW + qx) * 4;
        cropBuf[dstIdx + 3] = 0;

        const dx = [-1, 1, 0, 0];
        const dy = [0, 0, -1, 1];
        for (let i = 0; i < 4; i++) {
          const nx = qx + dx[i];
          const ny = qy + dy[i];
          if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
            const nPos = ny * cropW + nx;
            if (!visited[nPos] && isBg(nx, ny)) {
              visited[nPos] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }

      // Smooth anti-aliasing feather on outer sticker edge
      for (let y = 1; y < cropH - 1; y++) {
        for (let x = 1; x < cropW - 1; x++) {
          const idx = (y * cropW + x) * 4;
          if (cropBuf[idx + 3] > 0) {
            const r = cropBuf[idx];
            const g = cropBuf[idx + 1];
            const b = cropBuf[idx + 2];
            const lightness = (r + g + b) / 3;

            const hasTransparentNeighbor =
              cropBuf[((y - 1) * cropW + x) * 4 + 3] === 0 ||
              cropBuf[((y + 1) * cropW + x) * 4 + 3] === 0 ||
              cropBuf[(y * cropW + (x - 1)) * 4 + 3] === 0 ||
              cropBuf[(y * cropW + (x + 1)) * 4 + 3] === 0;

            if (hasTransparentNeighbor && lightness > 225) {
              const alpha = Math.max(0, Math.min(255, Math.round((255 - lightness) * 7.5)));
              cropBuf[idx + 3] = alpha;
            }
          }
        }
      }

      // Trim transparent boundaries
      let trimMinX = cropW, trimMaxX = 0, trimMinY = cropH, trimMaxY = 0;
      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          if (cropBuf[(y * cropW + x) * 4 + 3] > 15) {
            if (x < trimMinX) trimMinX = x;
            if (x > trimMaxX) trimMaxX = x;
            if (y < trimMinY) trimMinY = y;
            if (y > trimMaxY) trimMaxY = y;
          }
        }
      }

      const pad = 2;
      const finalMinX = Math.max(0, trimMinX - pad);
      const finalMaxX = Math.min(cropW - 1, trimMaxX + pad);
      const finalMinY = Math.max(0, trimMinY - pad);
      const finalMaxY = Math.min(cropH - 1, trimMaxY + pad);

      const finalW = finalMaxX - finalMinX + 1;
      const finalH = finalMaxY - finalMinY + 1;

      const trimmedBuf = Buffer.alloc(finalW * finalH * 4);
      for (let fy = 0; fy < finalH; fy++) {
        for (let fx = 0; fx < finalW; fx++) {
          const srcIdx = ((finalMinY + fy) * cropW + (finalMinX + fx)) * 4;
          const dstIdx = (fy * finalW + fx) * 4;
          trimmedBuf[dstIdx] = cropBuf[srcIdx];
          trimmedBuf[dstIdx + 1] = cropBuf[srcIdx + 1];
          trimmedBuf[dstIdx + 2] = cropBuf[srcIdx + 2];
          trimmedBuf[dstIdx + 3] = cropBuf[srcIdx + 3];
        }
      }

      const stepStr = String(step).padStart(2, '0');
      const filenameBase = `cat_c${catColor.id}_s${stepStr}`;
      const webpName = `${filenameBase}.webp`;
      const pngName = `${filenameBase}.png`;

      const outWebp = path.join(outDir, webpName);
      const outPng = path.join(outDir, pngName);
      const wwwWebp = path.join(wwwOutDir, webpName);
      const wwwPng = path.join(wwwOutDir, pngName);

      // We resize into 320x320 box (preserve aspect ratio, centered)
      const targetSize = 320;
      await sharp(trimmedBuf, { raw: { width: finalW, height: finalH, channels: 4 } })
        .resize(targetSize, targetSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 95, alphaQuality: 100, effort: 6 })
        .toFile(outWebp);

      await sharp(outWebp).png().toFile(outPng);

      fs.copyFileSync(outWebp, wwwWebp);
      fs.copyFileSync(outPng, wwwPng);

      colorSteps.push({
        step,
        webp: `assets/food_cats/${webpName}`,
        png: `assets/food_cats/${pngName}`
      });
    }

    manifest.push({
      id: catColor.id,
      name: catColor.name,
      file: catColor.file,
      preview: `assets/food_cats/cat_c${catColor.id}_s05.webp`,
      steps: colorSteps
    });

    console.log(`Finished color ${catColor.id}: ${catColor.name} (10 steps)`);
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(wwwOutDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('All 60 cat stickers successfully generated and synced to www/!');
}

sliceFoodCats().catch(console.error);
