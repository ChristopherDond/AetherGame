'use strict';

import {
  TILE,
  COLS,
  ROWS,
  WW,
  WH,
  CVW,
  CVH,
  DAY_PERIOD,
  T,
  RES,
  ST,
  RSRCH
} from './constants.js';
import { lerpCol, rectOv, fhash, seeded } from './utils.js';
import { genWorld, spawnRes } from './worldgen.js';

let cv;
let cx;
let keys = {};
let W = {};
let P = {};
let cam = { x: 0, y: 0 };
let gt = 0;
let dc = 0;
let fr = 0;
let run = false;
let pau = false;
let lt = 0;
let bmode = null;
let bp = false;
let ip = false;
let rp = false;
let inputReady = false;
let ms = { x: 0, y: 0, wx: 0, wy: 0 };
let saveAcc = 0;
let touchControlReady = false;

const SAVE_KEY = 'aether_save_v1';

function resetResearch() {
  for (const r of RSRCH) {
    r.un = false;
  }
}

function exportResearch() {
  const unlocked = [];
  for (const r of RSRCH) {
    if (r.un) unlocked.push(r.id);
  }
  return unlocked;
}

function applyResearch(unlockedIds = []) {
  resetResearch();
  const set = new Set(unlockedIds);
  for (const r of RSRCH) {
    r.un = set.has(r.id);
  }
}

function normalizePlayer(player) {
  const base = {
    x: WW / 2,
    y: WH / 2,
    vx: 0,
    vy: 0,
    w: 20,
    h: 20,
    spd: 130,
    fc: 1,
    wa: 0,
    alive: true,
    st: 0,
    score: 0,
    inv: new Array(RES.length).fill(0),
    maxInv: 30,
    maxO2: 100,
    o2: 100,
    maxHealth: 100,
    health: 100,
    msm: 1,
    nhab: false,
    mt: null,
    mp: 0
  };
  const p = { ...base, ...(player || {}) };
  if (!Array.isArray(p.inv) || p.inv.length !== RES.length) {
    p.inv = new Array(RES.length).fill(0);
  }
  return p;
}

function saveGame() {
  try {
    if (!W.tiles || !P.inv) return;
    const payload = {
      version: 1,
      gt,
      dc,
      fr,
      world: {
        seed: W.seed || 0,
        tiles: Array.from(W.tiles || []),
        res: W.res || [],
        structs: W.structs || []
      },
      player: { ...P, mt: null, mp: 0 },
      research: exportResearch()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    refreshContinueButton();
  } catch (_err) {
    // Silent fail keeps gameplay uninterrupted when storage is blocked.
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    startGame(parsed);
  } catch (_err) {
    // Ignore invalid save payloads and keep menu available.
  }
}

function refreshContinueButton() {
  const btn = document.getElementById('btn-continue');
  if (!btn) return;
  btn.style.display = localStorage.getItem(SAVE_KEY) ? 'inline-block' : 'none';
}

function setKeyState(code, pressed) {
  keys[code] = pressed;
}

function closePanels() {
  cp('build');
  cp('inv');
  cp('res');
  bmode = null;
}

function initTouchControls() {
  if (touchControlReady) return;
  touchControlReady = true;
  const container = document.getElementById('touch-controls');
  if (!container) return;
  const buttons = container.querySelectorAll('[data-key]');
  for (const button of buttons) {
    const code = button.getAttribute('data-key');
    const hold = button.getAttribute('data-hold') === 'true';
    const press = () => {
      button.classList.add('active');
      if (code === 'KeyB') {
        if (run && !pau) op('build');
        return;
      }
      if (code === 'KeyI') {
        if (run && !pau) op('inv');
        return;
      }
      if (code === 'KeyR') {
        if (run && !pau) op('res');
        return;
      }
      if (code === 'KeyP') {
        if (run) togglePause();
        return;
      }
      setKeyState(code, true);
      if (!hold) {
        setTimeout(() => {
          setKeyState(code, false);
          button.classList.remove('active');
        }, 120);
      }
    };
    const release = () => {
      if (hold) setKeyState(code, false);
      button.classList.remove('active');
    };
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      button.setPointerCapture?.(e.pointerId);
      press();
    });
    button.addEventListener('pointerup', (e) => {
      e.preventDefault();
      release();
    });
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  }
  window.addEventListener('blur', () => {
    for (const key of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE']) {
      keys[key] = false;
    }
    for (const button of buttons) button.classList.remove('active');
  });
}

function placeStruct(tp, tx, ty) {
  const sd = ST[tp];
  for (const [k, v] of Object.entries(sd.cs)) P.inv[+k] -= v;
  W.structs.push({ type: tp, tx, ty, wx: tx * TILE, wy: ty * TILE, w: sd.w * TILE, h: sd.h * TILE, hp: 100 });
  for (let dy = 0; dy < sd.h; dy++) for (let dx = 0; dx < sd.w; dx++) W.tiles[(ty + dy) * COLS + (tx + dx)] = T.VOID;
  parts(tx * TILE + sd.w * TILE / 2, ty * TILE + sd.h * TILE / 2, sd.c, 16);
}

function canPlace(tp, tx, ty) {
  const sd = ST[tp];
  if (tx < 1 || ty < 1 || tx + sd.w > COLS - 1 || ty + sd.h > ROWS - 1) return false;
  for (let dy = 0; dy < sd.h; dy++) for (let dx = 0; dx < sd.w; dx++) {
    const t2 = W.tiles[(ty + dy) * COLS + (tx + dx)];
    if (t2 === T.ROCK || t2 === T.DEEP || t2 === T.VOID) return false;
  }
  for (const s of W.structs) if (rectOv(tx * TILE, ty * TILE, sd.w * TILE, sd.h * TILE, s.wx, s.wy, s.w, s.h)) return false;
  return true;
}

function canAfford(tp) {
  for (const [k, v] of Object.entries(ST[tp].cs)) if (P.inv[+k] < v) return false;
  return true;
}

function parts(x, y, c, n = 6) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 30 + Math.random() * 90;
    const lf = 0.3 + Math.random() * 0.6;
    W.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, color: c, life: lf, ml: lf, sz: 2 + Math.random() * 3 });
  }
}

function hitTest(x, y, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  const x1 = Math.floor((x - hw) / TILE);
  const x2 = Math.floor((x + hw - 1) / TILE);
  const y1 = Math.floor((y - hh) / TILE);
  const y2 = Math.floor((y + hh - 1) / TILE);
  for (let ty = y1; ty <= y2; ty++) for (let tx = x1; tx <= x2; tx++) {
    if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return true;
    const t2 = W.tiles[ty * COLS + tx];
    if (t2 === T.ROCK || t2 === T.DEEP || t2 === T.VOID) return true;
  }
  return false;
}

function moveE(e, dt) {
  const nx = e.x + e.vx * dt;
  const ny = e.y + e.vy * dt;
  if (!hitTest(nx, e.y, e.w, e.h)) e.x = nx;
  if (!hitTest(e.x, ny, e.w, e.h)) e.y = ny;
}

function rStatus(r) {
  if (r.un) return 'done';
  if (r.rq && !RSRCH.find((x) => x.id === r.rq)?.un) return 'miss';
  for (const [k, v] of Object.entries(r.cs)) if (P.inv[+k] < v) return 'miss';
  return 'ok';
}

function unlockR(r) {
  if (rStatus(r) !== 'ok') return;
  for (const [k, v] of Object.entries(r.cs)) P.inv[+k] -= v;
  r.un = true;
  if (r.b.ms) P.msm = Math.min(P.msm * r.b.ms, 3);
  if (r.b.mo) {
    P.maxO2 = r.b.mo;
    P.o2 = Math.min(P.o2, r.b.mo);
  }
  if (r.b.mh) {
    P.maxHealth = r.b.mh;
    P.health = Math.min(P.health, r.b.mh);
  }
  parts(P.x, P.y, '#9900ff', 20);
}

function op(pn) {
  cp('build');
  cp('inv');
  cp('res');
  if (pn === 'build') {
    bp = true;
    rBuild();
  } else if (pn === 'inv') {
    ip = true;
    rInv();
  } else if (pn === 'res') {
    rp = true;
    rResPanel();
  }
  document.getElementById(`p-${pn}`).classList.add('open');
}

function cp(pn) {
  if (pn === 'build') bp = false;
  else if (pn === 'inv') ip = false;
  else if (pn === 'res') rp = false;
  document.getElementById(`p-${pn}`).classList.remove('open');
}

function rBuild() {
  let h = '';
  for (let i = 0; i < ST.length; i++) {
    const sd = ST[i];
    const af = canAfford(i);
    h += `<div class="bc${af ? '' : ' na'}" onclick="tryB(${i})"><div class="bcn" style="color:${sd.c}">${sd.n}</div><div class="bcd">${sd.d}</div><div class="bcc">${Object.entries(sd.cs).map(([k, v]) => `<span>${v} ${RES[+k].n}</span>`).join(' · ')}</div></div>`;
  }
  document.getElementById('bgrid').innerHTML = h;
}

function rInv() {
  const used = P.inv.reduce((a, b) => a + b, 0);
  let h = '<div class="il">';
  for (let i = 0; i < RES.length; i++) {
    if (P.inv[i] <= 0) continue;
    h += `<div class="ir"><div class="idot" style="background:${RES[i].c}"></div><div class="ilb">${RES[i].n}</div><div class="iv" style="color:${RES[i].c}">${P.inv[i]}</div></div>`;
  }
  if (!used) h += '<div style="color:#445;text-align:center;padding:20px;font-size:0.75rem">Vazio - mine com [E]</div>';
  h += `</div><div class="ifr">${used} / ${P.maxInv} slots · Score: ${P.score} · ${Math.floor(P.st)}s</div>`;
  document.getElementById('ibody').innerHTML = h;
}

function rResPanel() {
  let h = '<div class="rl">';
  for (const r of RSRCH) {
    const st2 = rStatus(r);
    const cls = st2 === 'done' ? 'done' : st2 === 'ok' ? 'ready' : 'locked';
    const lb = st2 === 'done' ? '✓' : st2 === 'ok' ? 'APLICAR' : '???';
    const sl = st2 === 'done' ? 'done' : st2 === 'ok' ? 'ok' : 'miss';
    const oc2 = st2 === 'ok' ? `onclick="doR('${r.id}')"` : '';
    h += `<div class="rr ${cls}" ${oc2}><div class="ric">R</div><div class="ri"><div class="rn">${r.nm}</div><div class="rd">${r.d}</div><div class="rc">${Object.entries(r.cs).map(([k, v]) => `<span>${v} ${RES[+k].n}</span>`).join(' · ')}</div></div><div class="rs ${sl}">${lb}</div></div>`;
  }
  h += '</div>';
  document.getElementById('rbody').innerHTML = h;
}

function tryB(tp) {
  if (!canAfford(tp)) return;
  cp('build');
  bmode = tp;
}

function doR(id) {
  const r = RSRCH.find((x) => x.id === id);
  if (!r) return;
  unlockR(r);
  rResPanel();
}

function togglePause() {
  if (!run) return;
  pau = !pau;
  document.getElementById('s-pause').style.display = pau ? 'flex' : 'none';
  if (pau) saveGame();
  if (!pau) {
    lt = performance.now();
    requestAnimationFrame(loop);
  }
}

function startGame(savedState = null) {
  cv = document.getElementById('c');
  cx = cv.getContext('2d');
  cv.width = CVW;
  cv.height = CVH;

  if (savedState && savedState.world && savedState.player) {
    applyResearch(savedState.research || []);
    W = {
      seed: savedState.world.seed || 0,
      tiles: Uint8Array.from(savedState.world.tiles || []),
      res: savedState.world.res || [],
      structs: savedState.world.structs || [],
      parts: []
    };
    P = normalizePlayer(savedState.player);
    gt = typeof savedState.gt === 'number' ? savedState.gt : 0;
    dc = typeof savedState.dc === 'number' ? savedState.dc : 0;
    fr = typeof savedState.fr === 'number' ? savedState.fr : 0;
  } else {
    resetResearch();
    const worldData = genWorld();
    W = {
      seed: worldData.seed,
      tiles: worldData.tiles,
      res: [],
      structs: [],
      parts: []
    };
    W.res = spawnRes(W.tiles, seeded(999, W.seed) * 99999 | 0);
    P = normalizePlayer();
    gt = 0;
    dc = 0;
    fr = 0;
  }

  keys = {};
  bmode = null;
  bp = false;
  ip = false;
  rp = false;
  saveAcc = 0;
  cp('build');
  cp('inv');
  cp('res');

  setupInput();
  cam.x = Math.max(0, Math.min(WW - CVW, P.x - CVW / 2));
  cam.y = Math.max(0, Math.min(WH - CVH, P.y - CVH / 2));

  document.getElementById('s-title').style.display = 'none';
  document.getElementById('s-over').style.display = 'none';
  document.getElementById('s-pause').style.display = 'none';

  run = true;
  pau = false;
  lt = performance.now();
  requestAnimationFrame(loop);
}

function showTitle() {
  saveGame();
  run = false;
  pau = false;
  closePanels();
  document.getElementById('s-pause').style.display = 'none';
  document.getElementById('s-over').style.display = 'none';
  document.getElementById('s-title').style.display = 'flex';
  refreshContinueButton();
}

function loop(now) {
  if (!run) return;
  if (pau) {
    lt = now;
    return;
  }
  const dt = Math.min((now - lt) / 1000, 0.05);
  lt = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function setupInput() {
  if (inputReady) return;
  inputReady = true;
  initTouchControls();
  window.addEventListener('beforeunload', () => {
    if (run && P.alive) saveGame();
  });
  window.addEventListener('keydown', (e) => {
    if (!run) return;
    keys[e.code] = true;
    if (e.code === 'Escape') {
      cp('build');
      cp('inv');
      cp('res');
      bmode = null;
      e.preventDefault();
    }
    if (e.code === 'KeyP') {
      togglePause();
      return;
    }
    if (pau) return;
    if (e.code === 'KeyB') {
      op('build');
      e.preventDefault();
      return;
    }
    if (e.code === 'KeyI') {
      op('inv');
      e.preventDefault();
      return;
    }
    if (e.code === 'KeyR') {
      op('res');
      e.preventDefault();
      return;
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
  cv.addEventListener('mousemove', (e) => {
    const r2 = cv.getBoundingClientRect();
    ms.x = e.clientX - r2.left;
    ms.y = e.clientY - r2.top;
    ms.wx = ms.x + cam.x;
    ms.wy = ms.y + cam.y;
  });
  cv.addEventListener('click', () => {
    if (bmode !== null && P.alive) {
      const tx = Math.floor(ms.wx / TILE);
      const ty = Math.floor(ms.wy / TILE);
      if (canPlace(bmode, tx, ty) && canAfford(bmode)) placeStruct(bmode, tx, ty);
      bmode = null;
    }
  });
  cv.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (!t) return;
    const r2 = cv.getBoundingClientRect();
    ms.x = t.clientX - r2.left;
    ms.y = t.clientY - r2.top;
    ms.wx = ms.x + cam.x;
    ms.wy = ms.y + cam.y;
  }, { passive: true });
}

function update(dt) {
  gt += dt;
  fr++;
  saveAcc += dt;
  if (saveAcc >= 10) {
    saveGame();
    saveAcc = 0;
  }
  dc = (gt % DAY_PERIOD) / DAY_PERIOD;
  if (!bp && !ip && !rp) updatePlayer(dt);
  for (const p of W.parts) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.88;
    p.vy *= 0.88;
    p.life -= dt;
  }
  W.parts = W.parts.filter((p) => p.life > 0);
  const tx = P.x - CVW / 2;
  const ty2 = P.y - CVH / 2;
  cam.x += (tx - cam.x) * 0.08;
  cam.y += (ty2 - cam.y) * 0.08;
  cam.x = Math.max(0, Math.min(WW - CVW, cam.x));
  cam.y = Math.max(0, Math.min(WH - CVH, cam.y));
  ms.wx = ms.x + cam.x;
  ms.wy = ms.y + cam.y;
}

function updatePlayer(dt) {
  if (!P.alive) return;
  P.st += dt;
  P.score = Math.floor(P.st);
  let dx = 0;
  let dy = 0;
  if (keys.KeyA || keys.ArrowLeft) dx -= 1;
  if (keys.KeyD || keys.ArrowRight) dx += 1;
  if (keys.KeyW || keys.ArrowUp) dy -= 1;
  if (keys.KeyS || keys.ArrowDown) dy += 1;
  if (dx || dy) {
    const l2 = Math.hypot(dx, dy);
    P.vx = (dx / l2) * P.spd;
    P.vy = (dy / l2) * P.spd;
    if (dx) P.fc = dx > 0 ? 1 : -1;
    P.wa += dt * 8;
  } else {
    P.vx *= 0.7;
    P.vy *= 0.7;
  }
  moveE(P, dt);
  P.x = Math.max(20, Math.min(WW - 20, P.x));
  P.y = Math.max(20, Math.min(WH - 20, P.y));

  P.nhab = false;
  for (const s of W.structs) {
    if (s.type === 0 && Math.hypot(P.x - (s.wx + s.w / 2), P.y - (s.wy + s.h / 2)) < 170) {
      P.nhab = true;
      break;
    }
  }
  if (P.nhab) {
    P.o2 = Math.min(P.maxO2, P.o2 + 25 * dt);
    P.health = Math.min(P.maxHealth, P.health + 8 * dt);
  } else {
    P.o2 -= 2.5 * dt;
    if (P.o2 <= 0) {
      P.o2 = 0;
      P.health -= 12 * dt;
    }
  }

  if (keys.KeyE && !bmode) doMine(dt);
  else {
    P.mt = null;
    P.mp = 0;
  }

  if (P.health <= 0) {
    P.alive = false;
    const rsn = P.o2 <= 0 ? 'Morte por asfixia - O2 esgotado' : 'Morte por exposicao planetaria';
    setTimeout(() => {
      document.getElementById('death-reason').textContent = `${rsn} · ${Math.floor(P.st)}s sobrevividos`;
      document.getElementById('s-over').style.display = 'flex';
    }, 1200);
  }
}

function doMine(dt) {
  let nr = null;
  let nd = 75;
  for (const r of W.res) {
    if (r.amount <= 0) continue;
    const d = Math.hypot(P.x - r.x, P.y - r.y);
    if (d < nd) {
      nr = r;
      nd = d;
    }
  }
  if (!nr) {
    P.mt = null;
    P.mp = 0;
    return;
  }
  if (P.mt !== nr) {
    P.mt = nr;
    P.mp = 0;
  }
  P.mp += (dt / 1.4) * P.msm;
  if (fr % 5 === 0) parts(nr.x, nr.y, RES[nr.type].c, 2);
  if (P.mp >= 1) {
    P.mp = 0;
    if (P.inv.reduce((a, b) => a + b, 0) < P.maxInv) {
      P.inv[nr.type]++;
      nr.amount--;
      parts(nr.x, nr.y, RES[nr.type].c, 10);
    }
  }
}

function render() {
  const night = Math.max(0, Math.sin(dc * Math.PI * 2 - Math.PI) * 0.9 + 0.2);
  const bg2 = lerpCol([14, 6, 28], [4, 1, 10], Math.min(1, night * 1.4));
  cx.fillStyle = `rgb(${bg2[0]},${bg2[1]},${bg2[2]})`;
  cx.fillRect(0, 0, CVW, CVH);
  if (night > 0.1) {
    cx.fillStyle = `rgba(0,0,12,${night * 0.45})`;
    cx.fillRect(0, 0, CVW, CVH);
  }

  cx.save();
  cx.translate(-cam.x, -cam.y);
  rTiles();
  rStructs();
  rRes();
  rParts();
  rPlayer();
  if (bmode !== null) rGhost();
  cx.restore();
  rHUD();
}

function rTiles() {
  const sx2 = Math.max(0, Math.floor(cam.x / TILE));
  const sy2 = Math.max(0, Math.floor(cam.y / TILE));
  const ex2 = Math.min(COLS - 1, sx2 + Math.ceil(CVW / TILE) + 1);
  const ey2 = Math.min(ROWS - 1, sy2 + Math.ceil(CVH / TILE) + 1);
  for (let y = sy2; y <= ey2; y++) for (let x = sx2; x <= ex2; x++) {
    const t2 = W.tiles[y * COLS + x];
    const px = x * TILE;
    const py = y * TILE;
    if (t2 === T.GROUND) drawG(px, py, x, y);
    else if (t2 === T.ROCK) drawR(px, py, x, y, false);
    else if (t2 === T.DEEP) drawR(px, py, x, y, true);
    else if (t2 === T.SAND) drawS(px, py, x, y);
    else if (t2 === T.FLORA) drawF(px, py, x, y);
    else if (t2 === T.VOID) {
      cx.fillStyle = '#060011';
      cx.fillRect(px, py, TILE, TILE);
    }
  }
}

function drawG(px, py, tx, ty) {
  const v = fhash(tx, ty) * 0.18;
  cx.fillStyle = `rgb(${(18 + v * 27) | 0},${(9 + v * 15) | 0},${(32 + v * 36) | 0})`;
  cx.fillRect(px, py, TILE, TILE);
  cx.strokeStyle = 'rgba(55,25,75,0.25)';
  cx.lineWidth = 0.5;
  cx.strokeRect(px, py, TILE, TILE);
  if (fhash(tx * 3, ty) > 0.82) {
    cx.fillStyle = `rgba(80,40,110,${fhash(tx, ty) * 0.4 + 0.1})`;
    cx.beginPath();
    cx.arc(px + fhash(tx * 7, ty) * TILE, py + fhash(tx, ty * 7) * TILE, 1.5, 0, Math.PI * 2);
    cx.fill();
  }
}

function drawR(px, py, tx, ty, deep) {
  cx.fillStyle = deep ? '#07001a' : '#110828';
  cx.fillRect(px, py, TILE, TILE);
  cx.fillStyle = deep ? '#0d0030' : '#1a0e40';
  [[8, 8], [24, 6], [4, 22], [26, 20], [14, 14]].forEach(([ox, oy]) => {
    if (fhash(tx * ox, ty * oy) > 0.55) cx.fillRect(px + ox, py + oy, fhash(tx, oy) * 10 + 4, fhash(ty, ox) * 8 + 3);
  });
  if (deep) {
    cx.strokeStyle = 'rgba(90,0,180,0.35)';
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(px + fhash(tx, ty) * TILE, py);
    cx.lineTo(px + fhash(tx + 1, ty) * TILE, py + TILE);
    cx.stroke();
  }
}

function drawS(px, py, tx, ty) {
  cx.fillStyle = `rgb(${(58 + fhash(tx * 3, ty * 7) * 36) | 0},${(28 + fhash(tx, ty) * 20) | 0},${(18 + fhash(tx, ty) * 14) | 0})`;
  cx.fillRect(px, py, TILE, TILE);
}

function drawF(px, py, tx, ty) {
  drawG(px, py, tx, ty);
  const ph = fr * 0.035 + fhash(tx * 9, ty) * 6.28;
  const sw = Math.sin(ph) * 2.5;
  const h = 10 + fhash(tx * 7, ty * 3) * 14;
  const hue = fhash(tx + 100, ty * 3) > 0.5 ? '#00ff88' : '#ff44aa';
  cx.strokeStyle = hue;
  cx.lineWidth = 2;
  cx.shadowColor = hue;
  cx.shadowBlur = 8;
  cx.beginPath();
  cx.moveTo(px + TILE / 2, py + TILE - 4);
  cx.bezierCurveTo(px + TILE / 2 + sw, py + TILE - h * 0.5, px + TILE / 2 + sw * 2, py + TILE - h * 0.8, px + TILE / 2 + sw * 3, py + TILE - h);
  cx.stroke();
  cx.shadowBlur = 0;
  cx.fillStyle = hue;
  cx.shadowColor = hue;
  cx.shadowBlur = 10;
  cx.beginPath();
  cx.arc(px + TILE / 2 + sw * 3, py + TILE - h, 3.5, 0, Math.PI * 2);
  cx.fill();
  cx.shadowBlur = 0;
}

function rRes() {
  for (const r of W.res) {
    if (r.amount <= 0) continue;
    if (r.x - cam.x < -50 || r.x - cam.x > CVW + 50 || r.y - cam.y < -50 || r.y - cam.y > CVH + 50) continue;
    const rd = RES[r.type];
    const pulse = Math.sin(fr * 0.05 + r.id) * 0.3 + 0.7;
    const sz = (0.7 + (r.amount / r.maxAmount) * 0.6) * 9;
    cx.save();
    cx.shadowColor = rd.c;
    cx.shadowBlur = 14 * pulse;
    for (let i = 0; i < r.amount; i++) {
      const a = (i / r.amount) * Math.PI * 2;
      drawCrystal(r.x + Math.cos(a) * sz * 0.8, r.y + Math.sin(a) * sz * 0.8, sz * 0.55, rd.c, a + fr * 0.015);
    }
    drawCrystal(r.x, r.y, sz, rd.c, fr * 0.022 * (r.type % 2 ? 1 : -1));
    if (P.mt === r && P.mp > 0) {
      cx.fillStyle = 'rgba(0,0,0,0.55)';
      cx.fillRect(r.x - 19, r.y - 24, 38, 5);
      cx.fillStyle = rd.c;
      cx.fillRect(r.x - 19, r.y - 24, 38 * P.mp, 5);
    }
    cx.restore();
  }
}

function drawCrystal(x, y, s, col, angle) {
  cx.save();
  cx.translate(x, y);
  cx.rotate(angle);
  cx.fillStyle = col;
  cx.beginPath();
  cx.moveTo(0, -s * 1.5);
  cx.lineTo(s * 0.48, 0);
  cx.lineTo(0, s * 0.7);
  cx.lineTo(-s * 0.48, 0);
  cx.closePath();
  cx.fill();
  cx.fillStyle = 'rgba(255,255,255,0.25)';
  cx.beginPath();
  cx.moveTo(0, -s * 1.5);
  cx.lineTo(s * 0.14, -s * 0.25);
  cx.lineTo(0, -s * 0.15);
  cx.closePath();
  cx.fill();
  cx.restore();
}

function rStructs() {
  for (const s of W.structs) {
    const rx = s.wx - cam.x;
    const ry = s.wy - cam.y;
    if (rx + s.w < 0 || rx > CVW || ry + s.h < 0 || ry > CVH) continue;
    cx.save();
    if (s.type === 0) {
      cx.fillStyle = '#08122a';
      cx.fillRect(s.wx + 4, s.wy + s.h / 2, s.w - 8, s.h / 2 - 4);
      cx.fillStyle = '#162a52';
      cx.beginPath();
      cx.ellipse(s.wx + s.w / 2, s.wy + s.h / 2, s.w / 2 - 3, s.h / 2, 0, Math.PI, 0, true);
      cx.fill();
      cx.fillStyle = 'rgba(80,170,255,0.10)';
      cx.beginPath();
      cx.ellipse(s.wx + s.w / 2, s.wy + s.h / 2, s.w / 2 - 6, s.h / 2 - 3, 0, Math.PI, 0, true);
      cx.fill();
      const pl2 = Math.sin(fr * 0.04) * 0.18 + 0.82;
      const gr = cx.createRadialGradient(s.wx + s.w / 2, s.wy + s.h / 2, 0, s.wx + s.w / 2, s.wy + s.h / 2, 170);
      gr.addColorStop(0, `rgba(40,140,255,${0.07 * pl2})`);
      gr.addColorStop(1, 'rgba(40,140,255,0)');
      cx.fillStyle = gr;
      cx.beginPath();
      cx.arc(s.wx + s.w / 2, s.wy + s.h / 2, 170, 0, Math.PI * 2);
      cx.fill();
      cx.fillStyle = '#2277ee';
      cx.shadowColor = '#3388ff';
      cx.shadowBlur = 10;
      cx.fillRect(s.wx + 6, s.wy + s.h / 2 - 2, s.w - 12, 4);
      cx.shadowBlur = 0;
      cx.fillStyle = '#88ccff';
      cx.shadowColor = '#88ccff';
      cx.shadowBlur = 12;
      cx.beginPath();
      cx.arc(s.wx + s.w / 2, s.wy + s.h / 3, 6, 0, Math.PI * 2);
      cx.fill();
      cx.shadowBlur = 0;
    } else if (s.type === 1) {
      cx.fillStyle = '#181820';
      cx.fillRect(s.wx + 3, s.wy + 3, s.w - 6, s.h - 6);
      const br = Math.max(0, Math.sin((dc - 0.25) * Math.PI * 2) * 0.7 + 0.3) * (dc < 0.5 ? 1 : 0.1);
      for (let r2 = 0; r2 < 2; r2++) for (let c2 = 0; c2 < 3;) {
        const B = (br * 220) | 0;
        cx.fillStyle = `rgb(${(B * 0.35) | 0},${(B * 0.28) | 0},${B})`;
        cx.fillRect(s.wx + 5 + c2 * ((s.w - 10) / 3), s.wy + 4 + r2 * ((s.h - 8) / 2), (s.w - 10) / 3 - 2, (s.h - 8) / 2 - 2);
        c2++;
      }
      cx.strokeStyle = '#ffee88';
      cx.lineWidth = 1;
      cx.shadowColor = '#ffee88';
      cx.shadowBlur = br * 10;
      cx.strokeRect(s.wx + 3, s.wy + 3, s.w - 6, s.h - 6);
      cx.shadowBlur = 0;
    } else {
      const sd = ST[s.type];
      cx.fillStyle = '#141424';
      cx.fillRect(s.wx + 3, s.wy + 3, s.w - 6, s.h - 6);
      cx.strokeStyle = sd.c;
      cx.lineWidth = 2;
      cx.shadowColor = sd.c;
      cx.shadowBlur = 8;
      cx.strokeRect(s.wx + 3, s.wy + 3, s.w - 6, s.h - 6);
      cx.shadowBlur = 0;
      cx.fillStyle = sd.c;
      cx.font = 'bold 10px Courier New';
      cx.textAlign = 'center';
      cx.fillText(sd.n.toUpperCase(), s.wx + s.w / 2, s.wy + s.h / 2 + 4);
    }
    cx.restore();
  }
}

function rPlayer() {
  if (!P.alive) return;
  const lg = Math.sin(P.wa) * 5;
  cx.save();
  cx.translate(P.x, P.y);
  if (P.fc === -1) cx.scale(-1, 1);
  cx.shadowColor = '#88aaff';
  cx.shadowBlur = 12;
  if (Math.abs(P.vx) + Math.abs(P.vy) > 20) {
    cx.fillStyle = 'rgba(100,150,255,0.3)';
    cx.beginPath();
    cx.arc(7, 5, 6, 0, Math.PI * 2);
    cx.fill();
  }
  cx.fillStyle = '#4a5580';
  cx.fillRect(-8, 8, 6, 10 + lg);
  cx.fillRect(2, 8, 6, 10 - lg);
  cx.fillStyle = '#c8962c';
  cx.fillRect(-9, -8, 18, 18);
  cx.fillStyle = '#aa7c1e';
  cx.fillRect(-7, -4, 6, 8);
  cx.fillRect(4, -4, 6, 8);
  cx.fillStyle = '#7a7a8c';
  cx.fillRect(7, -7, 6, 14);
  cx.fillStyle = '#5588cc';
  cx.fillRect(8, -5, 4, 4);
  cx.fillStyle = '#c8962c';
  cx.beginPath();
  cx.arc(0, -12, 10, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = '#aa7c1e';
  cx.fillRect(-7, -14, 14, 4);
  const ok = P.o2 / P.maxO2 > 0.3;
  cx.fillStyle = ok ? '#22ccee' : '#ff3300';
  cx.shadowColor = ok ? '#22ccee' : '#ff3300';
  cx.shadowBlur = 14;
  cx.beginPath();
  cx.arc(2, -13, 6.5, -0.35, Math.PI + 0.35);
  cx.fill();
  cx.fillStyle = 'rgba(255,255,255,0.3)';
  cx.beginPath();
  cx.arc(-1, -15, 2.5, 0, Math.PI * 2);
  cx.fill();
  cx.fillStyle = '#b88820';
  cx.shadowBlur = 0;
  const sw2 = Math.sin(P.wa + Math.PI) * 5;
  cx.fillRect(-15, -5 + sw2, 7, 13);
  cx.fillRect(8, -5 - sw2, 7, 13);
  cx.restore();
}

function rParts() {
  for (const p of W.parts) {
    const t2 = p.life / p.ml;
    cx.save();
    cx.globalAlpha = t2;
    cx.fillStyle = p.color;
    cx.shadowColor = p.color;
    cx.shadowBlur = 7;
    cx.beginPath();
    cx.arc(p.x, p.y, p.sz * t2, 0, Math.PI * 2);
    cx.fill();
    cx.restore();
  }
}

function rGhost() {
  const tx = Math.floor(ms.wx / TILE);
  const ty = Math.floor(ms.wy / TILE);
  const ok = canPlace(bmode, tx, ty) && canAfford(bmode);
  const sd = ST[bmode];
  cx.save();
  cx.globalAlpha = 0.52;
  cx.fillStyle = ok ? `${sd.c}44` : '#ff000033';
  cx.strokeStyle = ok ? sd.c : '#ff4444';
  cx.lineWidth = 2;
  cx.fillRect(tx * TILE, ty * TILE, sd.w * TILE, sd.h * TILE);
  cx.strokeRect(tx * TILE, ty * TILE, sd.w * TILE, sd.h * TILE);
  cx.restore();
}

function rHUD() {
  cx.fillStyle = 'rgba(2,0,10,0.78)';
  cx.fillRect(0, 0, CVW, 50);
  bar2(16, 12, 190, 14, P.o2 / P.maxO2, '#0088cc', '#00ccff', 'O2');
  bar2(222, 12, 190, 14, P.health / P.maxHealth, '#880022', '#ff2244', 'HP');

  const dn = dc < 0.5;
  cx.save();
  cx.shadowColor = dn ? '#ffdd44' : '#6677ff';
  cx.shadowBlur = 14;
  cx.fillStyle = dn ? '#ffdd44' : '#8899ff';
  cx.beginPath();
  cx.arc(CVW / 2 + Math.cos(dc * Math.PI * 2 - Math.PI / 2) * 15, 24 + Math.sin(dc * Math.PI * 2 - Math.PI / 2) * 8, dn ? 5 : 4, 0, Math.PI * 2);
  cx.fill();
  cx.restore();
  cx.fillStyle = '#404660';
  cx.font = '9px Courier New';
  cx.textAlign = 'center';
  cx.fillText(dn ? 'DIA' : 'NOITE', CVW / 2, 44);
  cx.strokeStyle = 'rgba(60,60,100,0.4)';
  cx.lineWidth = 1.2;
  cx.beginPath();
  cx.arc(CVW / 2, 24, 15, 0, Math.PI * 2);
  cx.stroke();

  cx.textAlign = 'right';
  cx.fillStyle = '#303050';
  cx.font = '10px Courier New';
  cx.fillText(`${Math.floor(P.st)}s`, CVW - 14, 18);
  cx.fillText(`Score ${P.score}`, CVW - 14, 32);
  cx.fillText(`Inv: ${P.inv.reduce((a, b) => a + b, 0)}`, CVW - 14, 46);

  cx.fillStyle = 'rgba(2,0,10,0.78)';
  cx.fillRect(0, CVH - 30, CVW, 30);
  cx.fillStyle = '#304050';
  cx.font = '10px Courier New';
  cx.textAlign = 'center';
  cx.fillText('[ B ] Construir  ·  [ I ] Inventario  ·  [ R ] Pesquisa  ·  [ E ] Minerar', CVW / 2, CVH - 10);

  if (bmode !== null) {
    cx.fillStyle = 'rgba(2,0,10,0.92)';
    cx.fillRect(60, 50, CVW - 120, 34);
    cx.strokeStyle = '#334499';
    cx.lineWidth = 1;
    cx.strokeRect(60, 50, CVW - 120, 34);
    const sd = ST[bmode];
    cx.fillStyle = sd.c;
    cx.shadowColor = sd.c;
    cx.shadowBlur = 10;
    cx.font = 'bold 11px Courier New';
    cx.textAlign = 'center';
    const ct = Object.entries(sd.cs).map(([k, v]) => `${v} ${RES[+k].n}`).join(' + ');
    cx.fillText(`${sd.n.toUpperCase()} - CLIQUE PARA POSICIONAR  |  ESC CANCELAR  |  Custo: ${ct}`, CVW / 2, 72);
    cx.shadowBlur = 0;
  }

  const cr = W.res ? W.res.find((r) => r.amount > 0 && Math.hypot(P.x - r.x, P.y - r.y) < 75) : null;
  if (cr && !bmode) {
    const rd = RES[cr.type];
    cx.fillStyle = rd.c;
    cx.shadowColor = rd.c;
    cx.shadowBlur = 10;
    cx.font = '11px Courier New';
    cx.textAlign = 'center';
    cx.fillText(`[ E ] Minerar ${rd.n} (x${cr.amount})`, CVW / 2, CVH - 46);
    cx.shadowBlur = 0;
  }

  if (P.o2 < 20 && P.alive && Math.sin(fr * 0.22) > 0) {
    cx.fillStyle = 'rgba(255,40,0,0.12)';
    cx.fillRect(0, 0, CVW, CVH);
    cx.fillStyle = '#ff3300';
    cx.shadowColor = '#ff3300';
    cx.shadowBlur = 22;
    cx.font = 'bold 14px Courier New';
    cx.textAlign = 'center';
    cx.fillText('OXIGENIO CRITICO - VOLTE AO HABITAT', CVW / 2, CVH / 2 - 30);
    cx.shadowBlur = 0;
  }

  rMini();
}

function bar2(x, y, w, h, pct, bg, fg, lb) {
  cx.fillStyle = 'rgba(10,5,20,0.7)';
  cx.fillRect(x, y, w, h);
  cx.fillStyle = bg;
  cx.fillRect(x + 1, y + 1, (w - 2) * Math.max(0, pct), h - 2);
  cx.strokeStyle = fg;
  cx.lineWidth = 1;
  cx.shadowColor = pct < 0.25 ? fg : 'transparent';
  cx.shadowBlur = pct < 0.25 ? 8 : 0;
  cx.strokeRect(x, y, w, h);
  cx.shadowBlur = 0;
  cx.fillStyle = '#5a5a7a';
  cx.font = '8px Courier New';
  cx.textAlign = 'left';
  cx.fillText(lb, x + 4, y + h + 9);
}

function rMini() {
  const mx = CVW - 108;
  const my = 54;
  const mw = 100;
  const mh = 80;
  const sx = mw / COLS;
  const sy = mh / ROWS;
  cx.fillStyle = 'rgba(0,0,12,0.85)';
  cx.fillRect(mx, my, mw, mh);
  cx.strokeStyle = '#223355';
  cx.lineWidth = 1;
  cx.strokeRect(mx, my, mw, mh);
  for (const r of W.res) {
    if (r.amount <= 0) continue;
    cx.fillStyle = `${RES[r.type].c}88`;
    cx.fillRect(mx + (r.x / TILE) * sx - 1, my + (r.y / TILE) * sy - 1, 1.5, 1.5);
  }
  for (const s of W.structs) {
    cx.fillStyle = ST[s.type].c;
    cx.fillRect(mx + s.tx * sx, my + s.ty * sy, (s.w / TILE) * sx + 1, (s.h / TILE) * sy + 1);
  }
  const px = mx + (P.x / TILE) * sx;
  const py = my + (P.y / TILE) * sy;
  cx.fillStyle = '#fff';
  cx.shadowColor = '#fff';
  cx.shadowBlur = 5;
  cx.beginPath();
  cx.arc(px, py, 2, 0, Math.PI * 2);
  cx.fill();
  cx.shadowBlur = 0;
}

function installGlobalHandlers() {
  window.startGame = startGame;
  window.loadGame = loadGame;
  window.saveGame = saveGame;
  window.showTitle = showTitle;
  window.togglePause = togglePause;
  window.cp = cp;
  window.tryB = tryB;
  window.doR = doR;
}

installGlobalHandlers();
refreshContinueButton();