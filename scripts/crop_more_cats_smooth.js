const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processMoreCats() {
  const srcImage = path.join(__dirname, '..', 'Sticker_Cats1.jpg');
  const outDir = path.join(__dirname, '..', 'assets', 'stickers', 'more_cats');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const { data, info } = await sharp(srcImage).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels; // 4 (RGBA)

  const rows = 7;
  const cols = 7;
  const minX = 30;
  const maxX = 2020;
  const minY = 30;
  const maxY = 2020;

  const cellW = (maxX - minX) / cols;
  const cellH = (maxY - minY) / rows;

  let id = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = minX + cellW * c + cellW / 2.0;
      const cy = minY + cellH * r + cellH / 2.0;

      const halfW = Math.floor(cellW * 0.52);
      const halfH = Math.floor(cellH * 0.52);

      const startX = Math.max(0, Math.floor(cx - halfW));
      const endX = Math.min(w - 1, Math.floor(cx + halfW));
      const startY = Math.max(0, Math.floor(cy - halfH));
      const endY = Math.min(h - 1, Math.floor(cy + halfH));

      const cropW = endX - startX + 1;
      const cropH = endY - startY + 1;

      // Extract crop buffer
      const cropBuf = Buffer.alloc(cropW * cropH * 4);

      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          const srcIdx = ((startY + y) * w + (startX + x)) * ch;
          const dstIdx = (y * cropW + x) * 4;
          cropBuf[dstIdx] = data[srcIdx];
          cropBuf[dstIdx + 1] = data[srcIdx + 1];
          cropBuf[dstIdx + 2] = data[srcIdx + 2];
          cropBuf[dstIdx + 3] = 255;
        }
      }

      // Flood-fill transparency from borders with smooth color distance threshold
      const visited = new Uint8Array(cropW * cropH);
      const queue = [];

      const isBg = (x, y) => {
        const idx = (y * cropW + x) * 4;
        const red = cropBuf[idx];
        const green = cropBuf[idx + 1];
        const blue = cropBuf[idx + 2];
        // Near-white or very light gray background
        return red >= 238 && green >= 238 && blue >= 238;
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
        cropBuf[dstIdx + 3] = 0; // Transparent

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

      // Smooth anti-aliased edge matte: soft falloff for pixels adjacent to transparent bg
      for (let y = 1; y < cropH - 1; y++) {
        for (let x = 1; x < cropW - 1; x++) {
          const idx = (y * cropW + x) * 4;
          if (cropBuf[idx + 3] > 0) {
            const red = cropBuf[idx];
            const green = cropBuf[idx + 1];
            const blue = cropBuf[idx + 2];
            const lightness = (red + green + blue) / 3;

            // If neighbor is transparent and pixel is very bright, feather alpha smoothly
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

      // Trim bounding box
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

      if (trimMaxX >= trimMinX && trimMaxY >= trimMinY) {
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

        const num = String(id).padStart(2, '0');
        const outName = 'more_cat_' + num + '.webp';
        const outPath = path.join(outDir, outName);

        await sharp(trimmedBuf, {
          raw: { width: finalW, height: finalH, channels: 4 }
        })
          .webp({ quality: 95, alphaQuality: 100, effort: 6 })
          .toFile(outPath);

        id++;
      }
    }
  }

  console.log('Successfully cropped and smoothed ' + (id - 1) + ' more_cats stickers!');
}

processMoreCats().catch(console.error);
