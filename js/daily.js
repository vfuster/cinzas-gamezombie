/* Desafio do dia: todo mundo joga a mesma rota no mesmo dia.
   Como funciona: cada dia de jogo (1, 2, 3...) sorteia com uma semente derivada da data, então o evento
   oferecido no dia N é o mesmo para todos — até a história se ramificar por escolhas ou companheiros.
   Os resultados dos amigos entram colando as mensagens de compartilhar (formato lido em parseResults). */

import { state, newGame, rollEffects, applyEffects, checkDeath, randInt, pick } from './state.js';
import { OPENING_EVENTS, pickEvent } from './events.js';
import { getEpisodeNode, resolveCompanion } from './episodes.js';
import { kvGet, kvSet, kvClear } from './storage.js';

const REAL_RANDOM = Math.random.bind(Math);
const pad = n => String(n).padStart(2, "0");

/* ---------- datas ---------- */
export function dateKey(d = new Date()){ return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
export function labelOf(key){ const [, m, d] = key.split("-"); return `${d}/${m}`; }
export function codeOf(key){ return "CZ-" + key.replaceAll("-", ""); }
export function prevKey(key){ const [y, m, d] = key.split("-").map(Number); return dateKey(new Date(y, m - 1, d - 1)); }
export function msUntilNext(now = new Date()){ return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now; }

/* ---------- sorteio com semente ---------- */
function hashStr(s){ let h = 2166136261; for(const ch of s){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a){
  return ()=>{ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
/* Um gerador por (data, dia de jogo, finalidade): o que acontece no dia N não depende do que foi sorteado antes. */
export const rngFor = (key, day, slot = 0) => mulberry32(hashStr(`${key}|${day}|${slot}`));

/* O jogo usa Math.random em vários módulos; trocamos só durante a chamada. */
export function withRng(rng, fn){
  const prev = Math.random; Math.random = rng;
  try{ return fn(); } finally{ Math.random = prev; }
}

/* ---------- partida simulada (mesmo fluxo da UI, sorteios presos à data) ---------- */
const evTitle = ev => typeof ev.title === "function" ? ev.title(state) : ev.title;

export function simulateRun(key, chooser = REAL_RANDOM){
  const log = [];
  withRng(rngFor(key, 0), ()=> newGame("Simulado"));
  let next = null, cause = "Ferimentos Fatais";

  for(let guard = 0; guard < 400; guard++){
    const day = state.day;
    let ev;
    withRng(rngFor(key, day, 0), ()=>{
      ev = (next && getEpisodeNode(next.ep, next.node)) || (day === 1 ? pick(OPENING_EVENTS) : pickEvent(state));
    });

    let choice, deathTitle = null;
    withRng(rngFor(key, day, 1), ()=>{
      const raw = typeof ev.choices === "function" ? ev.choices(state) : ev.choices;
      const choices = raw.filter(c => !c.condition || c.condition(state)).slice(0, 4);
      choice = choices[Math.floor(chooser() * choices.length)];
      let spec, nx, comp, remove = null;
      if(choice.resolve){
        const r = choice.resolve(state);
        spec = r.effects; nx = r.next || choice.next; comp = resolveCompanion(r, state);
        remove = r.removeCompanionAt ?? null; deathTitle = r.deathOverride?.title || null;
      } else {
        spec = choice.effects; nx = choice.next; comp = resolveCompanion(choice, state);
        deathTitle = choice.deathOverride?.title || null;
      }
      applyEffects(rollEffects(spec));
      if(comp && state.companions.length < 3) state.companions.push(comp);
      if(remove !== null && state.companions[remove] !== undefined) state.companions.splice(remove, 1);
      next = ev.episode && nx ? { ep: ev.episode, node: nx } : null;
    });
    log.push({ day, title: evTitle(ev), episode: ev.epName || null, act: ev.act || null, id: ev.id });

    const d1 = checkDeath();
    if(d1){ cause = deathTitle || (d1 === "comida" ? "Fome" : "Ferimentos Fatais"); break; }

    withRng(rngFor(key, day, 2), ()=>{
      const decay = { comida: -randInt(3, 7) };
      if(Math.random() * 100 < Math.min(6 + state.day, 40)) decay.saude = -randInt(1, 6);
      applyEffects(decay);
    });
    state.day += 1;
    const d2 = checkDeath();
    if(d2){ cause = d2 === "comida" ? "Fome" : "Ferimentos Fatais"; break; }
  }
  return { day: state.day, cause, log };
}

/* ---------- registro (IndexedDB, via storage.js) ---------- */
export async function getDay(key){ return (await kvGet("daily:" + key)) || { best: 0, tries: 0, name: "" }; }
export async function recordRun(key, day, name = ""){
  const cur = await getDay(key);
  const next = { best: Math.max(cur.best, day), tries: cur.tries + 1, name: name || cur.name };
  await kvSet("daily:" + key, next);
  return next;
}
export async function resetDaily(){ await kvClear("daily:"); await kvClear("paste:"); }
export async function getPaste(key){ return (await kvGet("paste:" + key)) || ""; }
export const setPaste = (key, text) => kvSet("paste:" + key, text);

/* Dias seguidos jogando, contando até hoje (ou até ontem, se hoje ainda não jogou). */
export async function streak(key){
  let k = (await getDay(key)).tries ? key : prevKey(key), n = 0;
  while((await getDay(k)).tries){ n++; k = prevKey(k); }
  return n;
}

/* Lê mensagens coladas ("Desafio CINZAS 30/10 · Nome · DIA 14") e devolve só as do dia pedido. */
export function parseResults(text, label){
  const best = new Map();
  for(const m of text.matchAll(/CINZAS (\d{2}\/\d{2}) · (.+?) · DIA (\d+)/g)){
    if(m[1] !== label) continue;
    const name = m[2].trim(), day = parseInt(m[3], 10);
    if(!best.has(name) || best.get(name) < day) best.set(name, day);
  }
  return [...best].map(([name, day]) => ({ name, day }));
}
