'use strict';

import { TILE, COLS, ROWS, T } from './constants.js';
import { noise2d, seeded, setSeed } from './utils.js';

export function genWorld(seed = Math.floor(Math.random() * 99999)) {
  setSeed(seed);
  const tiles = new Uint8Array(COLS * ROWS);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const n = noise2d(x / 10, y / 10, seed) * 0.7 + noise2d(x / 4, y / 4, seed) * 0.3;
    tiles[y * COLS + x] = n > 0.75
      ? T.ROCK
      : n > 0.67
        ? T.DEEP
        : n < 0.22
          ? T.SAND
          : seeded(x * 71 + y * 37, seed) > 0.93
            ? T.FLORA
            : T.GROUND;
  }
  const sx = Math.floor(COLS / 2);
  const sy = Math.floor(ROWS / 2);
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    tiles[(sy + dy) * COLS + (sx + dx)] = T.GROUND;
  }
  return { seed, tiles };
}

export function spawnRes(tiles, seed = Math.floor(Math.random() * 99999)) {
  const res = [];
  const cnt = [60, 55, 60, 50, 45];
  for (let type = 0; type < 5; type++) {
    let placed = 0;
    let at = 0;
    while (placed < cnt[type] && at < 8000) {
      at++;
      const x = 2 + Math.floor(seeded(at * type + placed * 19, seed) * (COLS - 4));
      const y = 2 + Math.floor(seeded(at * type * 3 + placed * 13, seed) * (ROWS - 4));
      const t2 = tiles[y * COLS + x];
      if ((t2 === T.GROUND || t2 === T.SAND) && Math.hypot(x - COLS / 2, y - ROWS / 2) > 5) {
        res.push({
          x: x * TILE + TILE / 2,
          y: y * TILE + TILE / 2,
          type,
          amount: 3 + Math.floor(seeded(at, seed) * 6),
          maxAmount: 9,
          mp: 0,
          id: res.length
        });
        placed++;
      }
    }
  }
  return res;
}

export const generateWorld = genWorld;
export const spawnResourcesWithTiles = spawnRes;
