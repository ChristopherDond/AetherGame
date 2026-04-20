'use strict';

import { TILE, COLS, ROWS, T } from './constants.js';
import { noise2d, seeded, setSeed } from './utils.js';

export function genWorld(seed = Math.floor(Math.random() * 99999)) {
  setSeed(seed);
  const tiles = new Uint8Array(COLS * ROWS);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const base = noise2d(x / 12, y / 12, seed) * 0.6 + noise2d(x / 5, y / 5, seed) * 0.4;
    const ridge = noise2d((x + 91) / 19, (y + 37) / 19, seed + 23) * 0.35;
    const basin = noise2d((x - 71) / 16, (y - 49) / 16, seed + 71) * 0.25;
    const n = base * 0.7 + ridge * 0.2 + basin * 0.1;
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

  for (let i = 0; i < 5; i++) {
    const cx = 8 + Math.floor(seeded(i * 97 + 13, seed) * (COLS - 16));
    const cy = 8 + Math.floor(seeded(i * 53 + 29, seed) * (ROWS - 16));
    const radius = 2 + Math.floor(seeded(i * 41 + 7, seed) * 4);
    const maxDistSq = (radius + 0.45) * (radius + 0.45);
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const tx = cx + dx;
      const ty = cy + dy;
      if (tx < 1 || ty < 1 || tx >= COLS - 1 || ty >= ROWS - 1) continue;
      const distSq = dx * dx + dy * dy;
      if (distSq > maxDistSq) continue;
      const idx = ty * COLS + tx;
      if (tiles[idx] === T.ROCK && seeded(tx * 31 + ty * 17, seed) > 0.45) {
        tiles[idx] = T.DEEP;
      }
    }
  }

  return { seed, tiles };
}

export function spawnRes(tiles, seed = Math.floor(Math.random() * 99999)) {
  const res = [];
  const centerX = COLS / 2;
  const centerY = ROWS / 2;
  const safeRadiusSq = 4 * 4;
  const configs = [
    { type: 0, clusters: 8, size: [3, 8], prefer: (t) => t === T.DEEP || t === T.ROCK || t === T.GROUND },
    { type: 1, clusters: 7, size: [2, 7], prefer: (t) => t === T.SAND || t === T.GROUND },
    { type: 2, clusters: 7, size: [3, 9], prefer: (t) => t === T.GROUND || t === T.FLORA },
    { type: 3, clusters: 6, size: [2, 8], prefer: (t) => t === T.ROCK || t === T.DEEP },
    { type: 4, clusters: 5, size: [2, 7], prefer: (t) => t === T.GROUND || t === T.SAND || t === T.FLORA }
  ];

  for (const cfg of configs) {
    for (let cluster = 0; cluster < cfg.clusters; cluster++) {
      const anchorX = 4 + Math.floor(seeded(cluster * 191 + cfg.type * 13, seed) * (COLS - 8));
      const anchorY = 4 + Math.floor(seeded(cluster * 157 + cfg.type * 29, seed) * (ROWS - 8));
      const radius = 2 + Math.floor(seeded(cluster * 97 + cfg.type * 41, seed) * 6);
      const nodes = cfg.size[0] + Math.floor(seeded(cluster * 61 + cfg.type * 17, seed) * (cfg.size[1] - cfg.size[0] + 1));
      for (let node = 0; node < nodes; node++) {
        const angle = seeded(node * 73 + cluster * 17 + cfg.type * 11, seed) * Math.PI * 2;
        const dist = seeded(node * 41 + cluster * 19 + cfg.type * 7, seed) * radius;
        const x = Math.max(2, Math.min(COLS - 3, Math.round(anchorX + Math.cos(angle) * dist)));
        const y = Math.max(2, Math.min(ROWS - 3, Math.round(anchorY + Math.sin(angle) * dist)));
        const t2 = tiles[y * COLS + x];
        if (!cfg.prefer(t2)) continue;
        const dx = x - centerX;
        const dy = y - centerY;
        if (dx * dx + dy * dy < safeRadiusSq) continue;
        res.push({
          x: x * TILE + TILE / 2 + (seeded(node * 19 + cluster, seed) - 0.5) * TILE * 0.25,
          y: y * TILE + TILE / 2 + (seeded(node * 23 + cluster, seed) - 0.5) * TILE * 0.25,
          type: cfg.type,
          amount: 3 + Math.floor(seeded(node * 29 + cluster * 7, seed) * 7),
          maxAmount: 10,
          mp: 0,
          id: res.length
        });
      }
    }
  }
  return res;
}

export const generateWorld = genWorld;
export const spawnResourcesWithTiles = spawnRes;
