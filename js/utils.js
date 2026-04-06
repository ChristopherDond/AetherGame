'use strict';

export function lerpCol(a, b, t) {
  return [
    (a[0] + (b[0] - a[0]) * t) | 0,
    (a[1] + (b[1] - a[1]) * t) | 0,
    (a[2] + (b[2] - a[2]) * t) | 0
  ];
}

export function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function rectOv(ax, ay, aw, ah, bx, by, bw, bh) {
  return rectOverlap(ax, ay, aw, ah, bx, by, bw, bh);
}

export function fhash(a, b) {
  const n = ((a * 20803 + b * 19201 + 17701) & 0x7fffffff);
  return n / 0x7fffffff;
}

let seed = 42;
export function setSeed(s) {
  seed = (s >>> 0) || 42;
}

export function rng() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return ((seed >>> 16) & 0xffff) / 65536;
}

export function seeded(v, baseSeed = seed) {
  const n = (Math.imul((baseSeed + v) >>> 0, 1664525) + 1013904223) >>> 0;
  return ((n >>> 16) & 0xffff) / 65536;
}

export function seededRng(v, baseSeed = seed) {
  return seeded(v, baseSeed);
}

export function noise2d(x, y, baseSeed = seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = seeded(ix * 1000 + iy, baseSeed);
  const b = seeded((ix + 1) * 1000 + iy, baseSeed);
  const c = seeded(ix * 1000 + (iy + 1), baseSeed);
  const d = seeded((ix + 1) * 1000 + (iy + 1), baseSeed);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
