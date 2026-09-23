/**
 * Listex.info Core Parser & API Client
 * 
 * Provides robust functions for searching products by barcode, fetching product pages,
 * and extracting standardized metadata for Plan4U_Food:
 * - Barcode (EAN-13 / GTIN)
 * - Ukrainian Name
 * - Brand / TM
 * - Net Weight
 * - Nutrition Facts per 100g (Calories, Protein, Fat, Carbs)
 * - Image URL
 */

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'uk-UA,uk;q=0.9,ru;q=0.8,en;q=0.7'
};

/**
 * Clean and parse float numbers from formatted strings (e.g. "53,9" -> 53.9)
 */
function cleanNumber(val) {
  if (val == null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val * 10) / 10;
  const match = String(val).replace(/&nbsp;/g, ' ').replace(',', '.').match(/\d+(?:\.\d+)?/);
  const num = match ? parseFloat(match[0]) : 0;
  return isNaN(num) || num < 0 ? 0 : Math.round(num * 10) / 10;
}

/**
 * Search Listex for a given barcode or search string.
 * Returns relative product path (e.g. "/uk/product/hlib-borodinskiy-klasichniy-formup-ua-4820077822765")
 */
async function searchProductUrl(query) {
  const trimmed = String(query).trim();
  if (!trimmed) return null;

  // If query is already a full Listex URL or path
  if (trimmed.includes('listex.info/product/') || trimmed.startsWith('/product/') || trimmed.startsWith('/uk/product/')) {
    const match = trimmed.match(/(?:\/uk)?\/product\/[a-zA-Z0-9_\-\.]+/);
    return match ? match[0] : trimmed;
  }

  // First try the search endpoint
  const searchUrl = `https://listex.info/uk/search/?q=${encodeURIComponent(trimmed)}&type=goods`;
  try {
    const res = await fetch(searchUrl, {
      headers: HEADERS,
      redirect: 'follow'
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Look for product links
    const regex = /href=["'](\/(?:uk\/)?product\/[^"']+)["']/g;
    let match;
    const links = [];
    while ((match = regex.exec(html)) !== null) {
      const link = match[1].split('#')[0];
      if (!links.includes(link)) links.push(link);
    }

    if (links.length > 0) {
      // Prioritize link that contains the barcode
      const exactMatch = links.find(l => l.includes(trimmed));
      return exactMatch || links[0];
    }
  } catch (err) {
    // Ignore and fallback to autocomplete API
  }

  // Fallback: autocomplete endpoint
  try {
    const autoUrl = `https://listex.info/search/getSearchResult?query=${encodeURIComponent(trimmed)}&type=goods`;
    const res = await fetch(autoUrl, {
      headers: { ...HEADERS, 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.suggestions && data.suggestions.length > 0) {
        const title = data.suggestions[0].value;
        if (title && title !== trimmed) {
          // Re-search with suggested title
          return await searchProductUrl(title);
        }
      }
    }
  } catch (err) {
    // Autocomplete failure
  }

  return null;
}

/**
 * Parses raw HTML string of a Listex product page
 */
function parseProductHtml(html, fallbackBarcode = '') {
  if (!html) return null;

  // 1. Barcode extraction
  let barcode = '';
  const barcodeMatches = [
    html.match(/class=["'][^"']*fa-barcode[^"']*["']\s*><\/i>\s*<strong>(\d+)<\/strong>/i),
    html.match(/"gtin13":\s*"(\d+)"/i),
    html.match(/Штрихкод[\s\S]*?<td>(\d+)<\/td>/i),
    html.match(/Штрих-код[\s\S]*?<td>(\d+)<\/td>/i),
    html.match(/product\/[a-z0-9_-]+-(\d{8,14})/i)
  ];
  for (const m of barcodeMatches) {
    if (m && m[1]) {
      barcode = m[1].trim();
      break;
    }
  }
  if (!barcode && fallbackBarcode && /^\d{7,14}$/.test(fallbackBarcode)) {
    barcode = fallbackBarcode;
  }

  // 2. Name extraction (Prefer Ukrainian title from attribute table)
  let name = '';
  const ukrMatches = [
    html.match(/Название\s*\(укр\.\)[\s\S]*?<td>([\s\S]*?)<\/td>/i),
    html.match(/Назва\s*\(укр\.\)[\s\S]*?<td>([\s\S]*?)<\/td>/i),
    html.match(/Краткое\s+название\s*\(укр\.\)[\s\S]*?<td>([\s\S]*?)<\/td>/i),
    html.match(/Коротка\s+назва\s*\(укр\.\)[\s\S]*?<td>([\s\S]*?)<\/td>/i)
  ];
  for (const m of ukrMatches) {
    if (m && m[1]) {
      const cleaned = m[1].replace(/<[^>]+>/g, '').trim();
      if (cleaned) {
        name = cleaned;
        break;
      }
    }
  }
  if (!name) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) name = h1Match[1].replace(/<[^>]+>/g, '').trim();
  }
  if (!name) {
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1].split(':')[0].replace(/\|.*$/, '').trim();
    }
  }

  // 3. Brand (TM)
  let brand = '';
  const brandMatches = [
    html.match(/<li>ТМ\s*<a[^>]*>([\s\S]*?)<\/a>/i),
    html.match(/Торговая\s+марка[\s\S]*?<td>([\s\S]*?)<\/td>/i),
    html.match(/Торгова\s+марка[\s\S]*?<td>([\s\S]*?)<\/td>/i),
    html.match(/"brand":\s*\{\s*"@type":\s*"Thing",\s*"name":\s*"([^"]+)"/i)
  ];
  for (const m of brandMatches) {
    if (m && m[1]) {
      const cleaned = m[1].replace(/<[^>]+>/g, '').trim();
      if (cleaned && cleaned.toLowerCase() !== 'без тм') {
        brand = cleaned;
        break;
      }
    }
  }

  // 4. Net weight
  let weight = '';
  const weightMatches = [
    html.match(/(?:Вага|Маса|Вес)\s+нетто,\s*г[\s\S]*?<td>([\s\S]*?)<\/td>/i),
    html.match(/(?:Вага|Маса|Вес)\s+нетто,\s*кг[\s\S]*?<td>([\s\S]*?)<\/td>/i)
  ];
  if (weightMatches[0] && weightMatches[0][1]) {
    const num = cleanNumber(weightMatches[0][1]);
    if (num > 0) weight = `${num}г`;
  } else if (weightMatches[1] && weightMatches[1][1]) {
    const num = cleanNumber(weightMatches[1][1]);
    if (num > 0) weight = `${num * 1000}г`;
  }


  // 5. Nutrition (per 100g)
  // Fat
  let f = 0;
  const fatMatch = html.match(/Жир[ыи],\s*г\/100г[\s\S]*?<td>([\s\S]*?)<\/td>/i);
  if (fatMatch) f = cleanNumber(fatMatch[1]);

  // Protein
  let p = 0;
  const proteinMatch = html.match(/Б[еі]лк[иі],\s*г\/100г[\s\S]*?<td>([\s\S]*?)<\/td>/i);
  if (proteinMatch) p = cleanNumber(proteinMatch[1]);

  // Carbs
  let c = 0;
  const carbsMatch = html.match(/(?:Вуглеводи|Углеводы),\s*г\/100г[\s\S]*?<td>([\s\S]*?)<\/td>/i);
  if (carbsMatch) c = cleanNumber(carbsMatch[1]);

  // Calories (kcal)
  let cal = 0;
  const calMatch = html.match(/Калор[иі]йн[іи]сть,\s*ккал\/100г[\s\S]*?<td>([\s\S]*?)<\/td>/i)
    || html.match(/ккал\/100г[\s\S]*?<td>([\s\S]*?)<\/td>/i);
  if (calMatch) cal = cleanNumber(calMatch[1]);

  // 6. Image
  let image = '';
  const imgMatches = [
    html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i),
    html.match(/class=["'][^"']*productSinglePhoto[^"']*["'][^>]*data-src=["']([^"']+)["']/i),
    html.match(/class=["'][^"']*productSinglePhoto[^"']*["'][^>]*src=["']([^"']+)["']/i)
  ];
  for (const m of imgMatches) {
    if (m && m[1] && !m[1].startsWith('data:image')) {
      image = m[1];
      break;
    }
  }

  // A valid food product must have at least a name and a barcode
  if (!name || !barcode) return null;

  const result = {
    barcode,
    name,
    cal,
    p,
    f,
    c
  };

  if (brand) result.brand = brand;
  if (weight) result.weight = weight;
  if (image) result.image = image;

  return result;
}

/**
 * Fetches product data directly from Listex by barcode or product URL.
 */
async function fetchProduct(query) {
  const queryStr = String(query).trim();
  if (!queryStr) throw new Error('Пустой запрос');

  let targetUrl = '';
  if (queryStr.startsWith('http://') || queryStr.startsWith('https://')) {
    targetUrl = queryStr;
  } else if (queryStr.startsWith('/')) {
    targetUrl = `https://listex.info${queryStr}`;
  } else {
    // Search by barcode or text
    const productPath = await searchProductUrl(queryStr);
    if (!productPath) {
      throw new Error(`Товар "${queryStr}" не найден на Listex.info`);
    }
    targetUrl = productPath.startsWith('http') ? productPath : `https://listex.info${productPath}`;
  }

  // Fetch the page
  const res = await fetch(targetUrl, {
    headers: HEADERS,
    redirect: 'follow'
  });

  if (!res.ok) {
    throw new Error(`Ошибка запроса (${res.status} ${res.statusText}) по адресу: ${targetUrl}`);
  }

  const html = await res.text();
  const parsed = parseProductHtml(html, /^\d+$/.test(queryStr) ? queryStr : '');

  if (!parsed) {
    throw new Error('Не удалось извлечь данные о товаре со страницы');
  }

  parsed.sourceUrl = targetUrl;
  return parsed;
}

module.exports = {
  fetchProduct,
  searchProductUrl,
  parseProductHtml,
  cleanNumber
};
