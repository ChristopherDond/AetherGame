'use strict';

// Lerp between two RGB colors
export function lerpCol(a, b, t) {
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t].map(Math.floor);
}

export function rectOverlap(ax,ay,aw,ah,bx,by,bw,bh) {
  return ax<bx+bw && ax+aw>bx && ay<by+bh && ay+ah>by;
}

// Simple seeded PRNG
let seed = 42;
export function setSeed(s) { seed = s; }

function next() {
  seed = ((seed + 1664525) * 1013904223) & 0xffffffff;
  return seed >>> 16;
}

export function rng(n) { return (next() % 65536) / 65536; }

export function seededRng(n) {
  const s = ((seed + n) * 1664525 + 1013904223) & 0xffffffff;
  return (s >>> 16) / 65536;
}

// Deterministic noise for tile generation (uses seededRng, not global rng)
export function noise2d(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const a = seededRng(ix*1000+iy, s);
  const b = seededRng((ix+1)*1000+iy, s);
  const c = seededRng(ix*1000+(iy+1), s);
  const d = seededRng((ix+1)*1000+(iy+1), s);
  const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy);
  return a + (b-a)*ux + (c-a)*uy + (a-b-c+d)*ux*uy;
}
