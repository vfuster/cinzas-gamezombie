/* Estado do jogo, regras de atributos e facções. */

/* ===========================================================
   NOMES DE POSSÍVEIS COMPANHEIROS
=========================================================== */
export const NAMES = ["Ronaldo","Marina","Téo","Iris","Batista","Carla","Nando","Duda","Wesley","Sol","Helena","Jorge"];

/* ===========================================================
   FACÇÕES — grupos recorrentes com reputação e identidade visual
=========================================================== */
export const FACTIONS = {
  comerciantes: { name:"Comerciantes", short:"COM", color:"#c9932b" },
  andarilhos:   { name:"Andarilhos",   short:"AND", color:"#c23c34" },
  refugio:      { name:"Refúgio",      short:"REF", color:"#7c8f3f" },
  milicia:      { name:"Milícia",      short:"MIL", color:"#6e7686" }
};

export function adjustRep(s, faction, amount){
  s.rep[faction] = Math.max(-30, Math.min(30, s.rep[faction] + amount));
}

/* ===========================================================
   ESTADO
=========================================================== */
export let state = null;

export function newGame(name){ state = freshState(name); return state; }

export function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
export function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

export function freshState(name){
  return {
    name: name || "o sobrevivente",
    day: 1,
    saude: randInt(74, 86),
    comida: randInt(48, 62),
    municao: randInt(14, 26),
    moral: randInt(58, 72),
    companions: [],       // nomes dos companheiros atuais
    rep: { comerciantes:0, andarilhos:0, refugio:0, milicia:0 },
    usedRecent: [],        // ids de eventos usados recentemente (evita repetição imediata)
    currentEvent: null,
    pending: null
  };
}

export function clamp(v){ return Math.max(0, Math.min(100, v)); }

export function group(s){ return s.companions.length ? "vocês" : "você"; }
export function companionsPhrase(s){
  if(!s.companions.length) return "";
  if(s.companions.length===1) return s.companions[0];
  return s.companions.slice(0,-1).join(", ") + " e " + s.companions[s.companions.length-1];
}
export function pickCompanionName(s){
  const free = NAMES.filter(n=>!s.companions.includes(n));
  return free.length ? pick(free) : "um estranho";
}

/* Rola valores: número fixo fica como está; [min,max] sorteia. */
export function rollEffects(spec){
  if(!spec) return {};
  const out = {};
  ["saude","comida","municao","moral"].forEach(k=>{
    if(spec[k] !== undefined){
      out[k] = Array.isArray(spec[k]) ? randInt(spec[k][0], spec[k][1]) : spec[k];
    }
  });
  return out;
}

export function applyEffects(effects){
  const deltas = [];
  ["saude","comida","municao","moral"].forEach(k=>{
    if(effects && effects[k]){
      state[k] = clamp(state[k] + effects[k]);
      deltas.push({k, v:effects[k]});
    }
  });
  return deltas;
}

export function checkDeath(){
  if(state.saude <= 0) return "saude";
  if(state.comida <= 0) return "comida";
  return null;
}
