'use strict';

import { TILE, COLS, ROWS, WW, WH, T } from './constants.js';
import { noise2d, seededRng, setSeed } from './utils.js';

export function generateWorld() {
  const newSeed = Math.floor(Math.random() * 99999);
  setSeed(newSeed);
  const tiles = new Uint8Array(COLS * ROWS);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const n = noise2d(x / 10, y / 10, newSeed) + noise2d(x / 4, y / 4, newSeed) * 0.3;
    tiles[y * COLS + x] = n > 0.75 ? T.ROCK : n > 0.67 ? T.DEEP : n < 0.22 ? T.SAND : seededRng(x*71+y*37, newSeed) > 0.93 ? T.FLORA : T.GROUND;
  }
  // Clear spawn area
  const sx = Math.floor(COLS/2), sy = Math.floor(ROWS/2);
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    tiles[(sy+dy)*COLS+(sx+dx)] = T.GROUND;
  }
  return tiles;
}

export function spawnResources() {
  const res = [];
  const counts = [60, 55, 60, 50, 45];
  setSeed(Math.floor(Math.random() * 99999));

  for (let type = 0; type < 5; type++) {
    let placed = 0, att = 0;
    while (placed < counts[type] && att < 8000) {
      att++;
      const x = 2 + Math.floor(seededRng(att * type + placed * 19) * (COLS - 4));
      const y = 2 + Math.floor(seededRng(att * type * 3 + placed * 13) * (ROWS - 4));
      const t = worldTilesAt(y, x);
      if ((t === T.GROUND || t === T.SAND) && Math.hypot(x - COLS/2, y - ROWS/2) > 5) {
        res.push({
          x: x*TILE + TILE/2, y: y*TILE + TILE/2,
          type, amount: 3 + Math.floor(seededRng(att) * 6),
          maxAmount: 9, mineProgress: 0, id: res.length
        });
        placed++;
      }
    }
  }
  return res;
}

function worldTilesAt(y, x, tiles) {
  return tiles[y * COLS + x];
}

// Patch spawnResources to accept tiles parameter — fix the above inline
export function spawnResourcesWithTiles(tiles) {
  const res = [];
  const counts = [60, 55, 60, 50, 45];
  let s = Math.floor(Math.random() * 99999);

  function srng(v) {
    const n = ((s + v) * 1664525 + 1013904223) & 0xffffffff;
    return (n >>> 16) / 65536;
  }

  for (let type = 0; type < 5; type++) {
    let placed = 0, att = 0;
    while (placed < counts[type] && att < 8000) {
      att++;
      const x = 2 + Math.floor(srng(att * type + placed * 19) * (COLS - 4));
      const y = 2 + Math.floor(srng(att * type * 3 + placed * 13) * (ROWS - 4));
      const t = tiles[y * COLS + x];
      if ((t === T.GROUND || t === T.SAND) && Math.hypot(x - COLS/2, y - ROWS/2) > 5) {
        res.push({
          x: x*TILE + TILE/2, y: y*TILE + TILE/2,
          type, amount: 3 + Math.floor(srng(att) * 6),
          maxAmount: 9, mineProgress: 0, id: res.length
        });
        placed++;
      }
    }
  }
  return res;
}
