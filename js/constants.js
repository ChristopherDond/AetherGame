'use strict';

export const TILE = 40;
export const COLS = 80;
export const ROWS = 60;
export const WW = COLS * TILE;
export const WH = ROWS * TILE;
export const CVW = 900;
export const CVH = 600;
export const DAY_PERIOD = 200;

export const T = { VOID: 0, GROUND: 1, ROCK: 2, DEEP: 3, SAND: 4, FLORA: 5 };

export const RES = [
  { n: 'Crystal', c: '#00d4ff' },
  { n: 'Resina', c: '#ff9900' },
  { n: 'Composto', c: '#44ff88' },
  { n: 'Minerio', c: '#ff4488' },
  { n: 'Organico', c: '#99ff33' },
  { n: 'Gelo', c: '#88ddff' },
  { n: 'Gas', c: '#ccaa00' },
  { n: 'Artefato', c: '#ff00ff' },
  { n: 'Joia', c: '#ff69b4' },
  { n: 'Combustivel', c: '#8b4513' },
  { n: 'Platina', c: '#e5e4e2' },
  { n: 'Titanio', c: '#ccccdd' }
];

export const ST = [
  { n: 'Habitat', w: 2, h: 2, c: '#3399ff', cs: { 2: 6, 1: 4 }, d: 'Regenera O2 e HP' },
  { n: 'Painel Solar', w: 2, h: 1, c: '#ffdd00', cs: { 0: 3, 3: 2 }, d: 'Gera energia de dia' },
  { n: 'Deposito', w: 1, h: 1, c: '#88aaff', cs: { 1: 4 }, d: '+capacidade inv' },
  { n: 'Fabricador', w: 2, h: 2, c: '#ff8833', cs: { 3: 6, 0: 4 }, d: 'Craftar itens' },
  { n: 'Laboratorio', w: 2, h: 2, c: '#dd00dd', cs: { 7: 8, 0: 6 }, d: 'Desbloqueia pesq.' },
  { n: 'Fazenda', w: 2, h: 2, c: '#00aa00', cs: { 4: 5, 8: 3 }, d: 'Produz Organico' },
  { n: 'Ext. agua', w: 1, h: 1, c: '#0088ff', cs: { 0: 4, 2: 3 }, d: 'Produz Gelo' },
  { n: 'Turbina', w: 2, h: 2, c: '#888888', cs: { 10: 6, 0: 5 }, d: 'Energia de noite' },
  { n: 'Escudo', w: 1, h: 1, c: '#ff4444', cs: { 0: 8, 10: 5 }, d: 'Protecao clima' },
  { n: 'Torre luz', w: 1, h: 1, c: '#ffff00', cs: { 0: 3 }, d: 'Ilumina area' },
  { n: 'Aterrador', w: 2, h: 1, c: '#555555', cs: { 1: 6, 3: 4 }, d: 'Chao nivelado' },
  { n: 'Tanque O2', w: 1, h: 1, c: '#00ffff', cs: { 2: 4, 6: 3 }, d: 'Armazena O2' },
  { n: 'Ger. nuclear', w: 3, h: 3, c: '#00ff66', cs: { 7: 12, 10: 8, 11: 5 }, d: 'Energia infinita' },
  { n: 'Rampa', w: 3, h: 3, c: '#ffaa00', cs: { 10: 15, 11: 10, 0: 20 }, d: 'Escape final' },
  { n: 'Cam. pesq.', w: 2, h: 2, c: '#9900ff', cs: { 7: 10, 0: 8 }, d: 'Pesquisa avancada' }
];

export const RSRCH = [
  { id: 'dr1', nm: 'Broca Mk.I', cs: { 7: 2 }, b: { ms: 1.35 }, d: '+35% vel. mineracao' },
  { id: 'dr2', nm: 'Broca Mk.II', cs: { 7: 4, 10: 3 }, b: { ms: 1.75 }, rq: 'dr1', d: '+75% vel. mineracao' },
  { id: 'tk1', nm: 'Tanque Extra', cs: { 7: 3, 2: 4 }, b: { mo: 150 }, rq: 'dr1', d: '+50% cap. O2' },
  { id: 'st1', nm: 'Suit Reforcada', cs: { 7: 6, 11: 4 }, b: { mo: 200, mh: 150 }, rq: 'tk1', d: 'O2++ HP++' },
  { id: 'bt1', nm: 'Bateria Densa', cs: { 10: 4, 0: 6 }, b: {}, rq: 'dr2', d: '+eficiencia solar' }
];

export const RES_DATA = RES;
export const STRUCT_DATA = ST;
export const RESEARCH_DATA = RSRCH;
