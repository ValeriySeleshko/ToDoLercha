/**
 * Plan4U - Stickers & Notebook Decor Catalog
 * 
 * Manages sticker packs, categories, and definitions (11 packs, 500+ stickers).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const stickersModule = factory();
    root.Plan4UStickers = stickersModule;
    root.STICKERS_CATALOG = stickersModule.CATALOG;
    root.DEFAULT_STICKER_CATEGORIES = stickersModule.CATEGORIES;
    root.findStickerDef = stickersModule.findStickerDef;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STICKERS_CATALOG = {
    fall: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `fall_${num}`,
        img: `./assets/stickers/fall/fall_${num}.webp`
      };
    }),
    cats: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `cat_${num}`,
        img: `./assets/stickers/cats/cat_${num}.webp`
      };
    }).filter(s => s.id !== 'cat_19'),
    more_cats: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `more_cat_${num}`,
        img: `./assets/stickers/more_cats/more_cat_${num}.webp`
      };
    }),
    flora: Array.from({ length: 64 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `flora_${num}`,
        img: `./assets/stickers/flora/flora_${num}.webp`
      };
    }),
    fauna: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `fauna_${num}`,
        img: `./assets/stickers/fauna/fauna_${num}.webp`
      };
    }),
    ocean: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `ocean_${num}`,
        img: `./assets/stickers/ocean/ocean_${num}.webp`
      };
    }),
    pigs: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `pig_${num}`,
        img: `./assets/stickers/pigs/pig_${num}.webp`
      };
    }),
    food: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `food_${num}`,
        img: `./assets/stickers/food/food_${num}.webp`
      };
    }),
    sweets: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `sweet_${num}`,
        img: `./assets/stickers/sweets/sweet_${num}.webp`
      };
    }),
    reptiles: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `reptile_${num}`,
        img: `./assets/stickers/reptiles/reptile_${num}.webp`
      };
    }),
    sport: Array.from({ length: 49 }, (_, i) => {
      const num = String(i + 1).padStart(2, '0');
      return {
        id: `sport_${num}`,
        img: `./assets/stickers/sport/sport_${num}.webp`
      };
    })
  };

  const DEFAULT_STICKER_CATEGORIES = [
    { id: 'fall', key: 'cat_fall', icon: '🍂', fallback: 'Осень' },
    { id: 'cats', key: 'cat_cats', icon: '🐱', fallback: 'Коты' },
    { id: 'more_cats', key: 'cat_more_cats', icon: '🐾', fallback: 'Ещё коты' },
    { id: 'flora', key: 'cat_flora', icon: '🍄', fallback: 'Флора' },
    { id: 'fauna', key: 'cat_fauna', icon: '🐝', fallback: 'Фауна' },
    { id: 'ocean', key: 'cat_ocean', icon: '🌊', fallback: 'Океан' },
    { id: 'pigs', key: 'cat_pigs', icon: '🐹', fallback: 'Свини' },
    { id: 'food', key: 'cat_food', icon: '🍔', fallback: 'Еда' },
    { id: 'sweets', key: 'cat_sweets', icon: '🍰', fallback: 'Сладости' },
    { id: 'reptiles', key: 'cat_reptiles', icon: '🐸', fallback: 'Рептилии' },
    { id: 'sport', key: 'cat_sport', icon: '⚽', fallback: 'Спорт' }
  ];

  function findStickerDef(typeId) {
    if (!typeId) return null;
    for (const cat in STICKERS_CATALOG) {
      const found = STICKERS_CATALOG[cat].find(s => s.id === typeId);
      if (found) return found;
    }
    if (typeId?.startsWith('fall_')) return { id: typeId, img: `./assets/stickers/fall/${typeId}.webp` };
    if (typeId?.startsWith('more_cat_')) return { id: typeId, img: `./assets/stickers/more_cats/${typeId}.webp` };
    if (typeId?.startsWith('flora_')) return { id: typeId, img: `./assets/stickers/flora/${typeId}.webp` };
    if (typeId?.startsWith('fauna_')) return { id: typeId, img: `./assets/stickers/fauna/${typeId}.webp` };
    if (typeId?.startsWith('ocean_')) return { id: typeId, img: `./assets/stickers/ocean/${typeId}.webp` };
    if (typeId?.startsWith('pigs_') || typeId?.startsWith('pig_')) return { id: typeId, img: `./assets/stickers/pigs/${typeId}.webp` };
    if (typeId?.startsWith('cat_')) return { id: typeId, img: `./assets/stickers/cats/${typeId}.webp` };
    if (typeId?.startsWith('food_')) return { id: typeId, img: `./assets/stickers/food/${typeId}.webp` };
    if (typeId?.startsWith('sweet_')) return { id: typeId, img: `./assets/stickers/sweets/${typeId}.webp` };
    if (typeId?.startsWith('reptile_')) return { id: typeId, img: `./assets/stickers/reptiles/${typeId}.webp` };
    if (typeId?.startsWith('sport_')) return { id: typeId, img: `./assets/stickers/sport/${typeId}.webp` };
    if (typeId?.startsWith('paper_')) return { id: typeId, img: `./assets/stickers/paper/${typeId}.png` };
    return null;
  }

  return {
    CATALOG: STICKERS_CATALOG,
    CATEGORIES: DEFAULT_STICKER_CATEGORIES,
    findStickerDef
  };
}));
