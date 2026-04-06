'use strict';

// ─── WORLD ──────────────────────────────────────────────────────────────────
export const TILE = 40;
export const COLS = 80;
export const ROWS = 60;
export const WW = COLS * TILE;
export const WH = ROWS * TILE;
export const CVW = 900;
export const CVH = 600;
export const DAY_PERIOD = 200; // seconds per full day/night cycle

// Tile types
export const T = { VOID:0, GROUND:1, ROCK:2, DEEP:3, SAND:4, FLORA:5 };

// Resource definitions
export const RES_DATA = [
  {name:'Crystal', color:'#00d4ff', glow:'#0055aa'},
  {name:'Resina',  color:'#ff9900', glow:'#993300'},
  {name:'Composto',color:'#44ff88', glow:'#008833'},
  {name:'Minério', color:'#ff4488', glow:'#880033'},
  {name:'Orgânico',color:'#99ff33', glow:'#336600'},
  {name:'Gelo',    color:'#88ddff', glow:'#0099ff'},
  {name:'Gás',     color:'#ccaa00', glow:'#ffff00'},
  {name:'Artefato',color:'#ff00ff', glow:'#ff00aa'},
  {name:'Joia',    color:'#ff69b4', glow:'#ff1493'},
  {name:'Combustível', color:'#8b4513', glow:'#a0522d'},
  {name:'Platina', color:'#e5e4e2', glow:'#ffffff'},
  {name:'Titânio', color:'#ccccdd', glow:'#aabbcc'},
];

// Structure definitions
export const STRUCT_DATA = [
  {name:'Habitat',      w:2,h:2,color:'#3399ff',cost:{2:6,1:4},         desc:'Regenera O² e HP'},
  {name:'Solar',        w:2,h:1,color:'#ffdd00',cost:{0:3,3:2},         desc:'Gera energia de dia'},
  {name:'Depósito',     w:1,h:1,color:'#8888aa',cost:{1:4},             desc:'+capacidade inv.'},
  {name:'Fabricador',   w:2,h:2,color:'#ff8833',cost:{3:6,0:4},         desc:'Craftar itens'},
  {name:'Laboratório',  w:2,h:2,color:'#dd00dd',cost:{7:8,0:6},         desc:'Desbloqueia pesq.'},
  {name:'Fazenda',      w:2,h:2,color:'#00aa00',cost:{4:5,8:3},         desc:'Produz Orgânico'},
  {name:'Extrator água',w:1,h:1,color:'#0088ff',cost:{0:4,2:3},         desc:'Produz Gelo'},
  {name:'Turbina',      w:2,h:2,color:'#888888',cost:{10:6,0:5},        desc:'Energia de noite'},
  {name:'Escudo',       w:1,h:1,color:'#ff4444',cost:{0:8,10:5},        desc:'Proteção clima'},
  {name:'Torre luz',    w:1,h:1,color:'#ffff00',cost:{0:3},             desc:'Ilumina a área'},
  {name:'Aterrador',    w:2,h:1,color:'#555555',cost:{1:6,3:4},         desc:'Chão nivelado'},
  {name:'Tanque O²',    w:1,h:1,color:'#00ffff',cost:{2:4,6:3},         desc:'Armazena O²'},
  {name:'Gerador nucl.',w:3,h:3,color:'#00ff66',cost:{7:12,10:8,11:5},  desc:'Energia infinita'},
  {name:'Rampa pouso',  w:3,h:3,color:'#ffaa00',cost:{10:15,11:10,0:20},desc:'Escape final'},
  {name:'Câmara pesq.', w:2,h:2,color:'#9900ff',cost:{7:10,0:8},        desc:'Pesquisa avançada'},
];

// Research definitions
export const RESEARCH_DATA = [
  {id:'broca1',   name:'Broca Mk.I',      cost:{7:2},    bonus:{mineSpeedMult:1.35},    desc:'Minerar 35% mais rápido'},
  {id:'broca2',   name:'Broca Mk.II',     cost:{7:4,10:3}, bonus:{mineSpeedMult:1.75},   desc:'Minerar 75% mais rápido', requires:'broca1'},
  {id:'tanque1',  name:'Tanque Portátil',  cost:{7:3,2:4},  bonus:{maxO2:150, o2ConsumptionMult:0.85}, desc:'+50% O², 15% menos consumo', requires:'broca1'},
  {id:'suit1',    name:'Suit Reforçada',   cost:{7:6,11:4}, bonus:{maxHealth:150, maxO2:200, o2ConsumptionMult:0.7}, desc:'HP++ O²++ e menos consumo', requires:'tanque1'},
  {id:'power1',   name:'Bateria Densa',    cost:{10:4,0:6}, bonus:{},                    desc:'+eficiência solar', requires:'broca2'},
];
