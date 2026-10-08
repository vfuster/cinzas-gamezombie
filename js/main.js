/* ===========================================================
   ÁUDIO — trilha ambiente de suspense (sintetizada, sem arquivos)
=========================================================== */
let audioCtx = null, masterGain = null, musicOn = false, stingerTimeout = null;

function initAudio(){
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.0001;
  masterGain.connect(audioCtx.destination);

  const droneGain = audioCtx.createGain(); droneGain.gain.value = 0.5;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 380; filter.Q.value = 1.1;

  const freqs = [55, 55*1.5, 55*2.02];
  freqs.forEach((f,i)=>{
    const osc = audioCtx.createOscillator();
    osc.type = i===2 ? 'triangle' : 'sine';
    osc.frequency.value = f;
    osc.connect(droneGain);
    osc.start();
  });
  droneGain.connect(filter);
  filter.connect(masterGain);

  const lfo = audioCtx.createOscillator(); lfo.type='sine'; lfo.frequency.value=0.045;
  const lfoGain = audioCtx.createGain(); lfoGain.gain.value=170;
  lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
  lfo.start();

  scheduleStinger();
}

function scheduleStinger(){
  const delay = 13000 + Math.random()*15000;
  stingerTimeout = setTimeout(()=>{
    if(audioCtx && musicOn) playStinger();
    scheduleStinger();
  }, delay);
}

function playStinger(){
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator(); osc.type='sawtooth';
  osc.frequency.setValueAtTime(200 + Math.random()*90, t);
  osc.frequency.exponentialRampToValueAtTime(58, t+1.3);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.055, t+0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t+1.4);
  osc.connect(g); g.connect(masterGain);
  osc.start(t); osc.stop(t+1.5);
}

function toggleMusic(){
  if(!audioCtx){ initAudio(); }
  musicOn = !musicOn;
  const now = audioCtx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  if(musicOn){
    audioCtx.resume();
    masterGain.gain.linearRampToValueAtTime(0.12, now+1.5);
  } else {
    masterGain.gain.linearRampToValueAtTime(0.0001, now+0.6);
  }
  const btn = document.getElementById("musicBtn");
  btn.textContent = musicOn ? "♪ SOM: ON" : "♪ SOM: OFF";
  btn.classList.toggle("on", musicOn);
}
document.getElementById("musicBtn").onclick = toggleMusic;

/* ===========================================================
   ILUSTRAÇÕES — SVG vetorial original, estilo silhueta
=========================================================== */

/* Figura zumbi reutilizável: cabeça torta, olhos vazados, tronco
   rasgado, braços esticados para frente, pernas em passo desigual. */
function zombieFigure(tx, ty, scale, rot){
  return `<g transform="translate(${tx},${ty}) scale(${scale}) rotate(${rot||0} 30 40)">
    <circle cx="30" cy="11" r="10" fill="currentColor"/>
    <circle cx="26" cy="8" r="2.4" fill="#0d0f09"/>
    <circle cx="35" cy="10" r="1.8" fill="#0d0f09"/>
    <ellipse cx="30" cy="16" rx="3" ry="2" fill="#0d0f09"/>
    <rect x="26" y="19" width="8" height="6" fill="currentColor"/>
    <polygon points="18,25 42,25 46,60 34,54 29,64 24,54 14,58" fill="currentColor"/>
    <line x1="24" y1="32" x2="31" y2="44" stroke="#0d0f09" stroke-width="1.6"/>
    <path d="M20,29 L4,17" stroke="currentColor" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <path d="M40,31 L55,44" stroke="currentColor" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <rect x="22" y="60" width="8" height="32" fill="currentColor" transform="rotate(5 26 60)"/>
    <rect x="32" y="61" width="8" height="30" fill="currentColor" transform="rotate(-9 36 61)"/>
  </g>`;
}

const ICONS = {
  title: {tone:"danger", svg:`<svg viewBox="0 0 240 140">
    <circle cx="190" cy="26" r="12" fill="currentColor" opacity="0.35"/>
    <circle cx="196" cy="21" r="10" fill="#0d0f09" opacity="0.9"/>
    ${zombieFigure(70, 10, 1.9, -3)}
  </svg>`},
  start: {tone:"danger", svg:`<svg viewBox="0 0 240 140">
    <circle cx="190" cy="26" r="12" fill="currentColor" opacity="0.35"/>
    <circle cx="196" cy="21" r="10" fill="#0d0f09" opacity="0.9"/>
    ${zombieFigure(70, 10, 1.9, -3)}
  </svg>`},
  mercado: {tone:"dim", svg:`<svg viewBox="0 0 240 100">
    <rect x="120" y="60" width="90" height="40" fill="currentColor" opacity="0.55"/>
    <rect x="132" y="72" width="14" height="16" fill="#0d0f09"/>
    <rect x="152" y="72" width="14" height="16" fill="#0d0f09"/>
    <rect x="172" y="72" width="14" height="16" fill="#0d0f09"/>
    ${zombieFigure(20, 22, 1.15, 4)}
  </svg>`},
  floresta: {tone:"safe", svg:`<svg viewBox="0 0 240 100">
    <polygon points="20,92 34,38 48,92" fill="currentColor"/>
    <rect x="30" y="92" width="4" height="8" fill="currentColor"/>
    <polygon points="60,96 78,20 96,96" fill="currentColor"/>
    <rect x="74" y="96" width="4" height="8" fill="currentColor"/>
    <polygon points="105,90 118,44 131,90" fill="currentColor" opacity="0.8"/>
    <polygon points="150,96 170,26 190,96" fill="currentColor"/>
    <rect x="166" y="96" width="4" height="8" fill="currentColor"/>
    <polygon points="195,92 208,50 221,92" fill="currentColor" opacity="0.8"/>
  </svg>`},
  abrigo_noturno: {tone:"dim", svg:`<svg viewBox="0 0 240 100">
    <circle cx="180" cy="28" r="16" fill="currentColor"/>
    <circle cx="188" cy="22" r="14" fill="#0d0f09"/>
    <circle cx="40" cy="18" r="1.6" fill="currentColor"/>
    <circle cx="70" cy="10" r="1.3" fill="currentColor"/>
    <circle cx="110" cy="22" r="1.6" fill="currentColor"/>
    <circle cx="20" cy="35" r="1.3" fill="currentColor"/>
    <polygon points="20,100 60,60 100,100" fill="currentColor" opacity="0.9"/>
    <rect x="55" y="82" width="10" height="18" fill="#0d0f09"/>
  </svg>`},
  radio: {tone:"neutral", svg:`<svg viewBox="0 0 240 100">
    <line x1="120" y1="20" x2="90" y2="96" stroke="currentColor" stroke-width="3"/>
    <line x1="120" y1="20" x2="150" y2="96" stroke="currentColor" stroke-width="3"/>
    <line x1="100" y1="64" x2="140" y2="64" stroke="currentColor" stroke-width="2"/>
    <line x1="94" y1="82" x2="146" y2="82" stroke="currentColor" stroke-width="2"/>
    <path d="M132 18 A20 20 0 0 1 150 36" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M138 8 A34 34 0 0 1 164 34" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
  </svg>`},
  resgate: {tone:"danger", svg:`<svg viewBox="0 0 240 100">
    <rect x="40" y="22" width="140" height="10" fill="currentColor"/>
    <rect x="50" y="32" width="7" height="56" fill="currentColor"/>
    <rect x="163" y="32" width="7" height="56" fill="currentColor"/>
    <rect x="100" y="46" width="26" height="42" fill="currentColor" opacity="0.85"/>
    <path d="M126 55 C 150 55, 150 80, 140 85" stroke="currentColor" stroke-width="2.5" fill="none"/>
  </svg>`},
  estrada: {tone:"dim", svg:`<svg viewBox="0 0 240 100">
    <polygon points="95,98 145,98 128,26 112,26" fill="currentColor" opacity="0.14"/>
    <line x1="95" y1="98" x2="112" y2="26" stroke="currentColor" stroke-width="2"/>
    <line x1="145" y1="98" x2="128" y2="26" stroke="currentColor" stroke-width="2"/>
    <rect x="117" y="88" width="6" height="8" fill="currentColor"/>
    <rect x="118" y="70" width="4" height="7" fill="currentColor"/>
    <rect x="119" y="55" width="3" height="5" fill="currentColor" opacity="0.7"/>
    <rect x="40" y="80" width="34" height="14" rx="2" fill="currentColor" opacity="0.85"/>
    <circle cx="48" cy="96" r="4" fill="currentColor"/>
    <circle cx="66" cy="96" r="4" fill="currentColor"/>
  </svg>`},
  rivais: {tone:"danger", svg:`<svg viewBox="0 0 240 100">
    <circle cx="60" cy="38" r="10" fill="currentColor"/>
    <rect x="48" y="48" width="24" height="42" fill="currentColor"/>
    <circle cx="120" cy="26" r="11" fill="currentColor"/>
    <rect x="106" y="37" width="28" height="52" fill="currentColor"/>
    <line x1="134" y1="40" x2="156" y2="20" stroke="currentColor" stroke-width="3"/>
    <circle cx="180" cy="40" r="10" fill="currentColor"/>
    <rect x="168" y="50" width="24" height="40" fill="currentColor"/>
  </svg>`},
  zumbis: {tone:"danger", svg:`<svg viewBox="0 0 240 120">
    <g opacity="0.75">${zombieFigure(2, 26, 0.85, 8)}</g>
    <g opacity="0.95">${zombieFigure(42, 8, 1, -6)}</g>
    <g opacity="0.7">${zombieFigure(88, 30, 0.8, 10)}</g>
    ${zombieFigure(122, 4, 1.05, -8)}
    <g opacity="0.9">${zombieFigure(166, 18, 0.9, 5)}</g>
    <g opacity="0.65">${zombieFigure(202, 32, 0.75, -10)}</g>
  </svg>`},
  abrigo: {tone:"safe", svg:`<svg viewBox="0 0 240 100">
    <line x1="20" y1="30" x2="20" y2="90" stroke="currentColor" stroke-width="3"/>
    <line x1="44" y1="30" x2="44" y2="90" stroke="currentColor" stroke-width="3"/>
    <line x1="68" y1="30" x2="68" y2="90" stroke="currentColor" stroke-width="3"/>
    <line x1="92" y1="30" x2="92" y2="90" stroke="currentColor" stroke-width="3"/>
    <line x1="150" y1="30" x2="150" y2="90" stroke="currentColor" stroke-width="3"/>
    <line x1="174" y1="30" x2="174" y2="90" stroke="currentColor" stroke-width="3"/>
    <line x1="198" y1="30" x2="198" y2="90" stroke="currentColor" stroke-width="3"/>
    <line x1="220" y1="30" x2="220" y2="90" stroke="currentColor" stroke-width="3"/>
    <line x1="16" y1="34" x2="224" y2="34" stroke="currentColor" stroke-width="2"/>
    <polygon points="105,88 122,52 139,88" fill="currentColor" opacity="0.6"/>
  </svg>`},
  desconhecido: {tone:"neutral", svg:`<svg viewBox="0 0 240 100">
    <circle cx="90" cy="30" r="10" fill="currentColor"/>
    <rect x="78" y="40" width="24" height="48" fill="currentColor"/>
    <circle cx="145" cy="52" r="6.5" fill="currentColor" opacity="0.85"/>
    <polygon points="138,58 152,58 156,88 134,88" fill="currentColor" opacity="0.85"/>
  </svg>`},
  escassez: {tone:"neutral", svg:`<svg viewBox="0 0 240 100">
    <polygon points="80,92 120,40 160,92" fill="currentColor" opacity="0.75"/>
    <rect x="106" y="68" width="12" height="12" fill="#c9932b"/>
    <circle cx="112" cy="74" r="18" fill="#c9932b" opacity="0.12"/>
  </svg>`},
  ferido: {tone:"danger", svg:`<svg viewBox="0 0 240 100">
    <rect x="100" y="35" width="40" height="14" fill="currentColor" transform="rotate(45 120 42)"/>
    <rect x="100" y="35" width="40" height="14" fill="currentColor" transform="rotate(-45 120 42)"/>
    <path d="M150 60 C155 70, 150 78, 145 82 C140 78, 138 70, 145 62 Z" fill="currentColor" opacity="0.8"/>
    <path d="M170 68 C174 76, 170 82, 166 85 C162 82, 160 76, 166 70 Z" fill="currentColor" opacity="0.6"/>
  </svg>`},
  final: {tone:"neutral", svg:`<svg viewBox="0 0 240 100">
    <line x1="120" y1="90" x2="120" y2="10" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <line x1="120" y1="46" x2="70" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <line x1="120" y1="46" x2="170" y2="20" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <line x1="120" y1="46" x2="80" y2="60" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <line x1="120" y1="46" x2="160" y2="60" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    <circle cx="120" cy="46" r="14" fill="currentColor" opacity="0.85"/>
    <rect x="55" y="60" width="12" height="34" fill="currentColor"/>
    <rect x="173" y="60" width="12" height="34" fill="currentColor"/>
    <rect x="55" y="56" width="130" height="8" fill="currentColor"/>
  </svg>`},
  death: {tone:"danger", svg:`<svg viewBox="0 0 240 100">
    <circle cx="120" cy="48" r="34" fill="currentColor"/>
    <circle cx="107" cy="44" r="7" fill="#0d0f09"/>
    <circle cx="133" cy="44" r="7" fill="#0d0f09"/>
    <polygon points="120,54 114,64 126,64" fill="#0d0f09"/>
    <rect x="102" y="74" width="6" height="10" fill="currentColor"/>
    <rect x="114" y="76" width="6" height="12" fill="currentColor"/>
    <rect x="126" y="76" width="6" height="12" fill="currentColor"/>
    <rect x="138" y="74" width="6" height="10" fill="currentColor"/>
  </svg>`},
  trade: {tone:"neutral", svg:`<svg viewBox="0 0 240 100">
    <rect x="90" y="52" width="34" height="30" fill="currentColor"/>
    <line x1="90" y1="64" x2="124" y2="64" stroke="#0d0f09" stroke-width="2"/>
    <line x1="107" y1="52" x2="107" y2="82" stroke="#0d0f09" stroke-width="2"/>
    ${zombieFigure(140, 18, 0.85, -6)}
    <circle cx="45" cy="60" r="9" fill="currentColor" opacity="0.7"/>
    <rect x="35" y="69" width="20" height="26" fill="currentColor" opacity="0.7"/>
  </svg>`},
  storm: {tone:"dim", svg:`<svg viewBox="0 0 240 100">
    <ellipse cx="80" cy="26" rx="46" ry="16" fill="currentColor" opacity="0.6"/>
    <ellipse cx="140" cy="20" rx="38" ry="14" fill="currentColor" opacity="0.5"/>
    <polygon points="95,40 78,68 92,68 74,98 104,62 90,62" fill="currentColor"/>
    <line x1="40" y1="55" x2="34" y2="72" stroke="currentColor" stroke-width="2" opacity="0.5"/>
    <line x1="55" y1="60" x2="49" y2="78" stroke="currentColor" stroke-width="2" opacity="0.5"/>
    <line x1="180" y1="55" x2="174" y2="72" stroke="currentColor" stroke-width="2" opacity="0.5"/>
  </svg>`},
  loss: {tone:"danger", svg:`<svg viewBox="0 0 240 100">
    ${zombieFigure(30, 6, 1.1, 6)}
    <circle cx="175" cy="40" r="9" fill="currentColor" opacity="0.55"/>
    <rect x="165" y="49" width="20" height="30" fill="currentColor" opacity="0.55" transform="rotate(18 175 49)"/>
  </svg>`}
};

function renderIllustration(key){
  const icon = ICONS[key] || ICONS.title;
  return `<div class="illustration tone-${icon.tone}">${icon.svg}</div>`;
}

/* ===========================================================
   NOMES DE POSSÍVEIS COMPANHEIROS
=========================================================== */
const NAMES = ["Ronaldo","Marina","Téo","Iris","Batista","Carla","Nando","Duda","Wesley","Sol","Helena","Jorge"];

/* Cor de identificação estável por nome (hash simples -> matiz). */
function nameColor(name){
  let hash = 0;
  for(let i=0;i<name.length;i++){ hash = (hash*31 + name.charCodeAt(i)) % 360; }
  return `hsl(${hash},55%,45%)`;
}
function avatarHTML(name){
  return `<span class="avatar" style="background:${nameColor(name)}">${escapeHtml(name.charAt(0).toUpperCase())}</span>`;
}

/* ===========================================================
   FACÇÕES — grupos recorrentes com reputação e identidade visual
=========================================================== */
const FACTIONS = {
  comerciantes: { name:"Comerciantes", short:"COM", color:"#c9932b" },
  andarilhos:   { name:"Andarilhos",   short:"AND", color:"#c23c34" },
  refugio:      { name:"Refúgio",      short:"REF", color:"#7c8f3f" },
  milicia:      { name:"Milícia",      short:"MIL", color:"#6e7686" }
};

function adjustRep(s, faction, amount){
  s.rep[faction] = Math.max(-30, Math.min(30, s.rep[faction] + amount));
}

function repRowHTML(s){
  const chips = Object.keys(FACTIONS).filter(f => s.rep[f] !== 0).map(f=>{
    const fac = FACTIONS[f]; const r = s.rep[f]; const sign = r>0 ? "+" : "";
    return `<span class="rep-chip" style="border-color:${fac.color}; color:${fac.color}">${fac.short} ${sign}${r}</span>`;
  }).join("");
  return chips ? `<div class="rep-row">${chips}</div>` : "";
}

/* ===========================================================
   AMBIENTAÇÃO — linhas de clima/hora sorteadas, texto puro
=========================================================== */
const AMBIENT_LINES = [
  "O céu está cinza há dias, sem sol de verdade.",
  "Um vento seco levanta poeira nas ruas vazias.",
  "Chove fino, do tipo que não parece que vai parar.",
  "O silêncio da noite anterior ainda pesa no ar.",
  "Longe, um som que pode ser trovão — ou não.",
  "O cheiro de fumaça nunca sai de vez.",
  "A lua cheia ilumina mais do que deveria.",
  "Um frio incomum para a época do ano corta o ar.",
  "Passarinhos ainda cantam em algum lugar, como se nada tivesse mudado.",
  "O rádio só pega estática nessa parte da cidade.",
  "Uma névoa baixa cobre a rua inteira pela manhã.",
  "O calor do meio-dia faz tudo parecer mais lento."
];

/* ===========================================================
   ABERTURAS ALEATÓRIAS — cada partida começa em um lugar diferente
=========================================================== */
const OPENING_EVENTS = [
  { id:"open_casa", icon:"start",
    title:"Dia 1 — O Despertar",
    text:()=>`Você acorda em casa com sirenes distantes. A energia caiu de madrugada. No rádio a pilha, só estática — e um aviso repetido: "Não saia de casa." Mas a água encanada parou e a comida não dura mais que um ou dois dias.`,
    choices:[
      { label:"Arriscar o mercado do bairro, mais perto.", icon:"mercado", effects:{comida:[10,20], saude:[-15,-3]}, consequence:"Voltar com as mãos cheias custou caro, mas você tem o que precisa por enquanto." },
      { label:"Seguir para a mata, mais longe dos outros.", icon:"floresta", effects:{municao:[5,12], comida:[0,8], saude:[-5,2]}, consequence:"A cabana de um caçador rendeu mais do que você esperava." }
    ]
  },
  { id:"open_escritorio", icon:"start",
    title:"Dia 1 — O Despertar",
    text:()=>`Você acorda debaixo da própria mesa, no 12º andar do escritório. Os elevadores estão parados e o prédio inteiro em silêncio. Lá embaixo, sirenes. No bolso, só a garrafa de água que sobrou da última reunião.`,
    choices:[
      { label:"Descer pelas escadas de emergência até o mercado da esquina.", icon:"mercado", effects:{comida:[8,18], saude:[-12,-2]}, consequence:"Doze andares depois, você sai com os braços cheios e as pernas tremendo." },
      { label:"Sair pelos fundos do prédio, rumo ao parque e à mata da cidade.", icon:"floresta", effects:{municao:[4,10], moral:[2,8]}, consequence:"O verde depois de tanto concreto quase parece um alívio." }
    ]
  },
  { id:"open_rodovia", icon:"start",
    title:"Dia 1 — O Despertar",
    text:()=>`Você acorda com a buzina presa de um carro na pista ao lado. O engarrafamento está parado há horas, cercado de veículos vazios e um cheiro de fumaça vindo de algum lugar longe demais para ver.`,
    choices:[
      { label:"Caminhar até o posto de conveniência mais próximo.", icon:"resgate", effects:{comida:[6,14], municao:[2,8]}, consequence:"A loja já foi revirada, mas sobrou mais do que parecia à primeira vista." },
      { label:"Cortar caminho pelo matagal que corre paralelo à pista.", icon:"floresta", effects:{saude:[-8,0], moral:[3,9]}, consequence:"Longe do metal quente e dos carros parados, você respira pela primeira vez em horas." }
    ]
  },
  { id:"open_vizinho", icon:"start",
    title:"Dia 1 — O Despertar",
    text:()=>`Você acorda na sala de um vizinho que mal conhecia — foi até lá ontem à noite, assustado com o barulho, e acabou dormindo no sofá. A casa está vazia agora; um bilhete na mesa diz apenas "fui buscar ajuda".`,
    choices:[
      { label:"Ir atrás de comida no mercado antes que alguém chegue primeiro.", icon:"mercado", effects:{comida:[12,22], saude:[-10,-2]}, consequence:"Você não é o único com essa ideia — mas chega antes dos outros." },
      { label:"Sair pela mata nos fundos, longe de olhos que você não conhece.", icon:"floresta", effects:{municao:[6,12], moral:[-2,4]}, consequence:"Ninguém te vê partir. É melhor assim, você pensa, sem ter certeza." }
    ]
  }
];

/* ===========================================================
   ESTADO
=========================================================== */
let state = null;

function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function freshState(name){
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

function clamp(v){ return Math.max(0, Math.min(100, v)); }

function group(s){ return s.companions.length ? "vocês" : "você"; }
function companionsPhrase(s){
  if(!s.companions.length) return "";
  if(s.companions.length===1) return s.companions[0];
  return s.companions.slice(0,-1).join(", ") + " e " + s.companions[s.companions.length-1];
}
function pickCompanionName(s){
  const free = NAMES.filter(n=>!s.companions.includes(n));
  return free.length ? pick(free) : "um estranho";
}

/* Rola valores: número fixo fica como está; [min,max] sorteia. */
function rollEffects(spec){
  if(!spec) return {};
  const out = {};
  ["saude","comida","municao","moral"].forEach(k=>{
    if(spec[k] !== undefined){
      out[k] = Array.isArray(spec[k]) ? randInt(spec[k][0], spec[k][1]) : spec[k];
    }
  });
  return out;
}

function applyEffects(effects){
  const deltas = [];
  ["saude","comida","municao","moral"].forEach(k=>{
    if(effects && effects[k]){
      state[k] = clamp(state[k] + effects[k]);
      deltas.push({k, v:effects[k]});
    }
  });
  return deltas;
}

function checkDeath(){
  if(state.saude <= 0) return "saude";
  if(state.comida <= 0) return "comida";
  return null;
}

/* ===========================================================
   BANCO DE SITUAÇÕES — sorteado a cada dia, sem fim fixo
=========================================================== */
const EVENTS = [

  /* ---------- BUSCA (lugares) ---------- */
  { id:"farmacia", category:"scavenge", icon:"resgate",
    text:()=>`Uma farmácia de bairro ainda tem a persiana meio aberta.`, title:()=>"A Farmácia",
    choices:[
      { label:"Entrar e pegar o que sobrou no balcão.", effects:{saude:[8,16]}, consequence:"Analgésicos, gaze, um antibiótico vencido mas ainda útil." },
      { label:"Vasculhar o estoque nos fundos — mais demorado, mais arriscado.", effects:{saude:[16,26], comida:[-2,0]}, consequence:"O estoque interno tinha muito mais, mas o barulho lá fora nunca parou de te preocupar." }
    ]
  },
  { id:"postogas", category:"scavenge", icon:"resgate",
    text:()=>`Um posto de gasolina abandonado, a loja de conveniência com a porta emperrada.`, title:()=>"Posto Abandonado",
    choices:[
      { label:"Forçar a porta e entrar.", effects:{comida:[10,18], municao:[0,6], saude:[-6,0]}, consequence:"A porta cede com um estrondo que ecoa longe demais para o seu gosto." },
      { label:"Só pegar o que está visível lá fora.", effects:{comida:[3,8]}, consequence:"Pouco, mas seguro. Você não arrisca o pescoço por uma prateleira." }
    ]
  },
  { id:"fazenda", category:"scavenge", icon:"floresta",
    text:()=>`Uma fazenda isolada no fim da estrada, o galinheiro ainda de pé.`, title:()=>"A Fazenda",
    choices:[
      { label:"Entrar no celeiro em busca de mantimentos.", effects:{comida:[14,24], saude:[-8,0]}, consequence:"Grãos, conservas, uma faca enferrujada mas afiada. Vale o risco do cheiro estranho lá dentro." },
      { label:"Só tirar água limpa do poço.", effects:{saude:[4,10]}, consequence:"Nada de extraordinário, mas água limpa nunca é pouco." }
    ]
  },
  { id:"shopping", category:"scavenge", icon:"mercado",
    text:()=>`Um shopping às escuras, vitrines estilhaçadas refletindo o pouco de luz que entra.`, title:()=>"O Shopping",
    choices:[
      { label:"Ir até a loja de artigos esportivos.", effects:{municao:[6,14], saude:[-10,-2]}, consequence:"Facas de caça e alguns cartuchos perdidos. Cada passo ecoa mais do que deveria." },
      { label:"Passar pela loja de departamento, mais silenciosa.", effects:{comida:[4,10], moral:[2,6]}, consequence:"Roupas secas e um pouco de comida enlatada. Pequenos confortos ainda existem." }
    ]
  },
  { id:"escola", category:"scavenge", icon:"mercado",
    text:()=>`Uma escola vazia, cadeiras viradas, a cantina ainda trancada.`, title:()=>"A Escola",
    choices:[
      { label:"Arrombar a cantina.", effects:{comida:[12,20], saude:[-6,0]}, consequence:"Merenda escolar nunca foi tão bem-vinda." },
      { label:"Só dormir numa sala de aula tranquila.", effects:{saude:[6,12], moral:[3,7]}, consequence:"Os desenhos na parede te lembram de um mundo que já não existe mais assim." }
    ]
  },
  { id:"hospital", category:"scavenge", icon:"resgate",
    text:()=>`Um hospital abandonado. O gerador falhou há dias; o cheiro é ruim mesmo do lado de fora.`, title:()=>"O Hospital",
    choices:[
      { label:"Entrar até a farmácia interna, mais fundo no prédio.", effects:{saude:[18,28], moral:[-6,0]}, consequence:"O que você encontra lá dentro vale a pena — mas vai te assombrar por um tempo." },
      { label:"Passar longe. Não vale o risco.", effects:{moral:[1,4]}, consequence:"Você segue andando. Alguns lugares não merecem ser revistados." }
    ]
  },
  { id:"trem", category:"scavenge", icon:"estrada",
    text:()=>`Um trem de carga parado nos trilhos há dias, vagões enferrujando ao sol.`, title:()=>"O Trem Parado",
    choices:[
      { label:"Abrir os vagões de carga.", effects:{comida:[8,16], municao:[4,10], saude:[-8,-1]}, consequence:"Os trincos cedem com esforço, mas a carga ainda estava intacta lá dentro." },
      { label:"Só descansar num vagão de passageiros.", effects:{saude:[8,14]}, consequence:"Os bancos empoeirados ainda servem para um sono decente." }
    ]
  },
  { id:"biblioteca", category:"scavenge", icon:"radio",
    text:()=>`Uma biblioteca pública, silenciosa como um túmulo, fileiras e fileiras de livros intocados.`, title:()=>"A Biblioteca",
    choices:[
      { label:"Procurar um manual de sobrevivência na seção de referência.", effects:{moral:[6,12], municao:[0,4]}, consequence:"Página por página, você aprende coisas que devia ter aprendido há muito tempo." },
      { label:"Só ler um pouco à luz de vela, sem pressa.", effects:{moral:[8,16], comida:[-3,-1]}, consequence:"Por uma hora, o mundo lá fora quase não existe." }
    ]
  },

  /* ---------- PESSOAS ---------- */
  { id:"comerciante", category:"people", icon:"trade",
    text:(s)=> s.rep.comerciantes >= 12
      ? `O mesmo comerciante de sempre reconhece vocês de longe e já abre um sorriso. "Voltaram", ele diz, arrumando a barraca.`
      : `Um homem monta uma pequena barraca de trocas na beira da estrada, vigiando os arredores.`,
    title:()=>"O Comerciante",
    choices:(s)=>{
      const bonus = s.rep.comerciantes >= 12 ? 4 : 0;
      const list = [
        { label:"Trocar munição por comida.", resolve:(s)=>{ adjustRep(s,"comerciantes",randInt(2,5)); return {effects:{municao:[-8,-4], comida:[10+bonus,18+bonus]}, text: bonus ? "A confiança de outras vezes rende um preço melhor." : "Um bom negócio, ou pelo menos você espera que sim."}; } },
        { label:"Trocar comida por remédio.", resolve:(s)=>{ adjustRep(s,"comerciantes",randInt(2,5)); return {effects:{comida:[-10,-5], saude:[10+bonus,18+bonus]}, text:"Ele nem pergunta de onde veio a comida. Melhor assim."}; } },
        { label:"Não confiar. Seguir andando.", effects:{moral:[-2,2]}, consequence:"Talvez fosse honesto. Talvez não. Você nunca vai saber." }
      ];
      if(s.rep.comerciantes >= 15){
        list.push({ label:"Pedir fiado — ele confia em você agora.", resolve:(s)=>{ adjustRep(s,"comerciantes",-3); return {effects:{comida:[6,12]}, text:"\"Da próxima vez a gente acerta\", ele diz, empurrando um saco de mantimentos."}; } });
      }
      return list;
    }
  },
  { id:"fanatico", category:"people", icon:"desconhecido",
    text:()=>`Uma mulher grita escrituras para ninguém numa esquina vazia, dizendo que o fim é castigo merecido.`, title:()=>"A Pregadora",
    choices:[
      { label:"Ouvi-la em silêncio e seguir em paz.", effects:{moral:[2,6]}, consequence:"Não muda nada, mas por um instante você não se sente tão sozinho quanto ela." },
      { label:"Ignorá-la e apressar o passo.", effects:{}, consequence:"A voz dela ainda ecoa duas ruas depois." },
      { label:"Tentar acalmá-la e trazê-la com você.", condition:(s)=>s.companions.length<3,
        resolve:(s)=>{ const name = pickCompanionName(s); return {effects:{moral:[10,18], comida:[-8,-3]}, text:`Depois de muita conversa, ela aceita seguir com você. Diz se chamar ${name}.`, addCompanionName:name}; } }
    ]
  },
  { id:"sobrevivente_ferido", category:"people", icon:"resgate",
    text:()=>`Um homem ferido está encurralado, cercado por infectados lentos, gritando por ajuda.`, title:()=>"Alguém Precisa de Ajuda",
    condition:(s)=>s.companions.length<3,
    choices:[
      { label:"Arriscar-se para salvá-lo.",
        resolve:(s)=>{ const name = pickCompanionName(s); return {effects:{municao:[-10,-4], saude:[-14,-4], moral:[10,18]}, text:`Vocês conseguem tirá-lo de lá vivo. Ele se apresenta, ainda trêmulo: ${name}.`, addCompanionName:name}; } },
      { label:"Recuar. É arriscado demais para um estranho.", effects:{moral:[-24,-16]}, consequence:"Você ouve os gritos diminuírem enquanto se afasta. Isso vai ficar com você." }
    ]
  },
  { id:"grupo_rival", category:"threat", icon:"rivais",
    text:(s)=> s.rep.andarilhos <= -15
      ? `São eles de novo — o mesmo grupo de Andarilhos de antes. Dessa vez não vêm para negociar; vêm de arma em punho, reconhecendo vocês.`
      : `Um grupo armado bloqueia a passagem adiante, exigindo parte dos seus suprimentos "em troca de segurança".`,
    title:()=>"Passagem Cobrada",
    choices:(s)=>{
      if(s.rep.andarilhos <= -15){
        return [
          { label:"Enfrentar. Não há mais o que negociar.",
            resolve:(s)=>{
              if(s.municao >= 15) return {effects:{municao:[-16,-12], saude:[-20,-12], moral:[-10,-4]}, text:"O confronto é feio, mas vocês saem de pé."};
              return {effects:{municao:[-999,0], saude:[-45,-35], moral:[-12,-6]}, text:"Sem munição, o corpo a corpo é brutal.",
                deathOverride:{title:"Emboscada na Estrada", text:`Os Andarilhos não esqueceram ${s.name}. Dessa vez não houve negociação possível.`}};
            }},
          { label:"Fugir por um caminho mais longo e arriscado.", effects:{comida:[-10,-4], saude:[-12,-6]}, consequence:"Vocês correm mais do que andam, mas escapam." }
        ];
      }
      return [
        { label:"Negociar e ceder parte dos suprimentos.", resolve:(s)=>{ adjustRep(s,"andarilhos",randInt(3,7)); return {effects:{comida:[-16,-10], municao:[-10,-4], moral:[2,6]}, text:"Dói entregar o que custou tanto a conseguir, mas ninguém sangra hoje."}; } },
        { label:"Recusar e desviar por um caminho mais longo.", effects:{comida:[-6,-2], saude:[-8,-2]}, consequence:"O desvio consome horas e energia, mas vocês passam longe deles." },
        { label:"Enfrentar. A passagem é sua.",
          resolve:(s)=>{
            adjustRep(s,"andarilhos",randInt(-25,-15));
            if(s.municao >= 15) return {effects:{municao:[-16,-12], saude:[-18,-10], moral:[-14,-6]}, text:"O confronto é rápido e brutal. Vocês vencem — mas isso muda alguma coisa em você. Os sobreviventes vão lembrar do seu rosto."};
            return {effects:{municao:[-999,0], saude:[-40,-30], moral:[-16,-8]}, text:"Sem munição suficiente, a briga vira corpo a corpo.",
              deathOverride:{title:"Emboscada na Estrada", text:`${s.name} não teve munição suficiente para vencer o confronto. A estrada ficou mais um corpo entre tantos outros.`}};
          }}
      ];
    }
  },
  { id:"crianca_perdida", category:"people", icon:"desconhecido",
    text:(s)=>`Uma criança sozinha observa ${group(s)} de longe. "Meus pais não voltaram", ela diz, sem se aproximar muito.`, title:()=>"Uma Criança Sozinha",
    condition:(s)=>s.companions.length<3,
    choices:[
      { label:"Deixá-la seguir com vocês.",
        resolve:(s)=>{ const name = pickCompanionName(s); return {effects:{moral:[16,24], comida:[-10,-5]}, text:`Ela não solta sua mão pelo resto do dia. Diz se chamar ${name}.`, addCompanionName:name}; } },
      { label:"Dar o que puder e seguir sem ela.", effects:{comida:[-6,-2], moral:[-6,-2]}, consequence:"Você a deixa com o pouco que tem. Não é abandono, você repete para si — mas dói do mesmo jeito." },
      { label:"Dizer que não pode ajudar e seguir andando.", effects:{moral:[-26,-18]}, consequence:"Ela fica parada, olhando vocês se afastarem. Ninguém fala nada pelo resto do dia." }
    ]
  },
  { id:"soldado", category:"people", icon:"rivais",
    text:(s)=> s.rep.milicia >= 12
      ? `Um posto de bloqueio da Milícia — os mesmos de antes. Reconhecem vocês e abaixam as armas primeiro.`
      : `Um soldado sem farda aponta a arma, trêmulo. "Eu só quero ir pra casa", ele diz.`,
    title:()=>"O Desertor",
    choices:(s)=>{
      const list = [
        { label:"Baixar as mãos e deixá-lo em paz.", resolve:(s)=>{ adjustRep(s,"milicia",randInt(2,5)); return {effects:{moral:[3,7]}, text:"Ele abaixa a arma também. Vocês seguem em direções opostas, aliviados."}; } },
        { label:"Tentar convencê-lo a seguir com vocês.", condition:(s)=>s.companions.length<3,
          resolve:(s)=>{ adjustRep(s,"milicia",randInt(3,7)); const name = pickCompanionName(s); return {effects:{municao:[4,10], moral:[6,12]}, text:`Depois de hesitar, ele concorda. Se apresenta como ${name} — e ainda tem munição sobrando.`, addCompanionName:name}; } },
        { label:"Atacar primeiro, sem arriscar.", resolve:(s)=>{ adjustRep(s,"milicia",randInt(-20,-10)); return {effects:{municao:[-8,-4], saude:[-14,-6], moral:[-18,-10]}, text:"Vocês vencem. Isso não parece uma vitória."}; } }
      ];
      if(s.rep.milicia >= 15){
        list.push({ label:"Pedir informações sobre a região.", resolve:(s)=>{ adjustRep(s,"milicia",-2); return {effects:{municao:[3,8], moral:[2,5]}, text:"Eles dividem munição e apontam um caminho mais seguro no mapa."}; } });
      }
      return list;
    }
  },
  { id:"idoso", category:"people", icon:"desconhecido",
    text:()=>`Um senhor sentado na calçada se recusa a sair de casa, mesmo com tudo em ruínas ao redor.`, title:()=>"O Senhor da Esquina",
    choices:[
      { label:"Ajudá-lo a se mudar para um lugar mais seguro.", effects:{moral:[8,14], comida:[-6,-2]}, consequence:"Leva o dia inteiro, mas ele agradece com os olhos molhados." },
      { label:"Deixar mantimentos com ele e seguir.", effects:{comida:[-4,-1], moral:[2,5]}, consequence:"Não é muito, mas é o que dá para fazer sem se atrasar." },
      { label:"Seguir sem olhar para trás.", effects:{moral:[-4,-1]}, consequence:"Você não tem tempo, você repete para si mesmo, andando mais rápido do que precisava." }
    ]
  },

  /* ---------- AMEAÇAS ---------- */
  { id:"horda", category:"threat", icon:"zumbis",
    text:()=>`Um bando de infectados bloqueia a única passagem segura à vista.`, title:()=>"O Bando",
    choices:[
      { label:"Enfrentar com a munição que sobrou.",
        resolve:(s)=>{
          if(s.municao >= 15) return {effects:{municao:[-16,-12], saude:[-12,-6], moral:[4,10]}, text:"Vocês abrem caminho no tiro. Funciona — mas por pouco."};
          return {effects:{municao:[-999,0], saude:[-35,-25], moral:[-8,-2]}, text:"A munição não é suficiente.",
            deathOverride:{title:"Cercado", text:`O bando era grande demais e a munição, pouca demais. ${s.name} não conseguiu abrir caminho a tempo.`}};
        }},
      { label:"Fazer barulho longe dali para desviá-lo.", effects:{comida:[-14,-8], saude:[-6,-2], moral:[2,6]}, consequence:"O desvio funciona, mas custa horas e o pouco que restava de comida." },
      { label:"Esperar escondidos até anoitecer.", effects:{comida:[-18,-12], saude:[2,6]}, consequence:"Vocês esperam em silêncio absoluto. O bando se dispersa com a escuridão." }
    ]
  },
  { id:"perseguidor", category:"threat", icon:"zumbis",
    text:()=>`Um único infectado rasteja atrás de vocês há quarteirões, sem nunca cansar.`, title:()=>"O Perseguidor",
    choices:[
      { label:"Eliminá-lo com um tiro certeiro.", effects:{municao:[-3,-1]}, consequence:"Um estampido, e o silêncio volta. Vale a bala." },
      { label:"Despistar por becos e ruas cruzadas.", effects:{saude:[-6,-2], comida:[-4,-1]}, consequence:"Vocês o perdem de vista depois de um bom tempo correndo." }
    ]
  },
  { id:"tempestade", category:"threat", icon:"storm",
    text:()=>`Uma tempestade forte se forma no horizonte, relâmpagos cortando um céu cor de chumbo.`, title:()=>"A Tempestade",
    choices:[
      { label:"Procurar abrigo imediato.", effects:{saude:[2,6], comida:[-6,-2]}, consequence:"Vocês se enfiam num vão qualquer bem a tempo. A chuva cai com força lá fora." },
      { label:"Seguir andando na chuva.", effects:{saude:[-14,-6]}, consequence:"Vocês chegam encharcados e trêmulos, mas chegam." }
    ]
  },
  { id:"predio", category:"threat", icon:"estrada",
    text:()=>`O prédio ao lado começa a ranger e rachar, uma nuvem de poeira subindo entre os escombros.`, title:()=>"Estrutura Instável",
    choices:[
      { label:"Correr para longe, sem olhar para trás.", effects:{saude:[-6,-2]}, consequence:"O estrondo vem segundos depois. Vocês sentem a poeira nas costas." },
      { label:"Tentar salvar os suprimentos lá dentro primeiro.", effects:{comida:[10,18], municao:[4,10], saude:[-20,-10]}, consequence:"Vocês saem com os braços cheios e os pulmões ardendo de poeira." }
    ]
  },
  { id:"armadilha", category:"threat", icon:"rivais",
    text:()=>`Uma armadilha de arame e latas dispara um alarme quando vocês passam por uma viela estreita.`, title:()=>"Armadilha",
    choices:[
      { label:"Recuar devagar, sem fazer barulho.", effects:{comida:[-4,-1]}, consequence:"Vocês recuam a tempo. Quem montou aquilo nunca aparece." },
      { label:"Correr antes que algo apareça.", effects:{saude:[-10,-4]}, consequence:"Vocês passam pela viela correndo, o coração na garganta." }
    ]
  },

  /* ---------- ABRIGO / DESCANSO ---------- */
  { id:"abrigo_estranhos", category:"rest", icon:"abrigo",
    text:(s)=> s.rep.refugio >= 10
      ? `O mesmo abrigo de outras vezes. Alguém já abre o portão de longe: "Voltaram! Entrem, tem lugar."`
      : `Um abrigo cercado por grades aparece na estrada. Sobreviventes lá dentro acenam — mas alguém do lado de fora avisa que "essa gente rouba tudo que você tiver".`,
    title:()=>"O Abrigo",
    choices:[
      { label:"Confiar e entrar.",
        resolve:(s)=>{
          if(s.rep.refugio >= 10 || s.moral >= 50){
            adjustRep(s,"refugio",randInt(3,7));
            return {effects:{comida:[16,24], municao:[6,12], moral:[6,12]}, text:"Eles dividem o que têm sem pedir nada em troca. Ainda existe gente assim."};
          }
          adjustRep(s,"refugio",randInt(-6,-2));
          return {effects:{comida:[-14,-6], moral:[-14,-6]}, text:"Alguém revista a mochila de vocês durante a noite. Acordam com menos do que entraram."};
        }},
      { label:"Recusar e acampar longe, isolados.", effects:{saude:[6,12], comida:[-10,-4], moral:[-6,-2]}, consequence:"Vocês descansam de verdade, mas a solidão pesa mais a cada dia." },
      { label:"Observar de longe antes de decidir.", effects:{comida:[-6,-2]}, consequence:"Nada de bom ou ruim acontece. Vocês só perdem tempo — e comida." }
    ]
  },
  { id:"igreja", category:"rest", icon:"abrigo",
    text:()=>`Uma igreja de portas abertas, velas ainda acesas no altar, ninguém à vista.`, title:()=>"A Igreja Vazia",
    choices:[
      { label:"Descansar ali por uma noite.", effects:{saude:[8,14], moral:[3,7]}, consequence:"O silêncio ali dentro é diferente do resto da cidade. Quase reconfortante." },
      { label:"Seguir andando, desconfiado de lugares tão convidativos.", effects:{}, consequence:"Talvez fosse só isso mesmo. Você nunca vai saber." }
    ]
  },
  { id:"bunker", category:"rest", icon:"abrigo_noturno",
    text:()=>`Um bunker de quintal, escada de metal descendo no escuro.`, title:()=>"O Bunker",
    choices:[
      { label:"Descer e passar a noite trancados lá dentro.", effects:{saude:[12,20], moral:[-5,-1]}, consequence:"Seguro como poucos lugares, mas o ar parado deixa todos inquietos." },
      { label:"Só verificar por fora e seguir.", effects:{}, consequence:"Melhor não se trancar em buracos que você não conhece." }
    ]
  },

  /* ---------- DILEMAS ---------- */
  { id:"racionar", category:"dilemma", icon:"escassez", condition:(s)=>s.companions.length>0,
    text:(s)=>`A comida está acabando e há mais de uma boca para alimentar.`, title:()=>"Racionar",
    choices:[
      { label:"Dividir igualmente, mesmo sendo pouco.", effects:{comida:[-14,-8], moral:[6,10]}, consequence:"Ninguém reclama. Ninguém come o suficiente, mas ninguém reclama." },
      { label:"Comer menos você mesmo.", effects:{saude:[-10,-4], moral:[8,14]}, consequence:"Seu estômago dói mais que o de todo mundo. Você não conta isso a ninguém." },
      { label:"Dar menos a eles, sem avisar.", effects:{moral:[-16,-8], saude:[2,6]}, consequence:"Ninguém percebe. Você percebe." }
    ]
  },
  { id:"eutanasia", category:"dilemma", icon:"ferido",
    text:()=>`Um estranho mordido, já febril, implora para não virar um deles.`, title:()=>"Um Pedido",
    choices:[
      { label:"Conceder o pedido dele.", effects:{moral:[-6,2]}, consequence:"Você faz o que ele pediu. Não sente nada parecido com alívio." },
      { label:"Recusar e seguir andando.", effects:{moral:[-10,-4]}, consequence:"Você o deixa lá, sozinho com o que está por vir. A escolha te persegue de qualquer jeito." }
    ]
  },
  { id:"roubo_adormecido", category:"dilemma", icon:"escassez",
    text:()=>`Um acampamento estranho dorme perto dali, mantimentos à vista, ninguém de guarda.`, title:()=>"Tentação",
    choices:[
      { label:"Roubar o que der.", effects:{comida:[16,26], moral:[-18,-10]}, consequence:"Funciona. Vocês comem por dias. Ninguém dorme direito depois disso." },
      { label:"Seguir com fome. Não vale a consciência.", effects:{comida:[-8,-3], moral:[6,10]}, consequence:"O estômago vazio dói, mas você ainda reconhece quem é." }
    ]
  },

  /* ---------- PERDA DE COMPANHEIROS ---------- */
  { id:"mordida_companheiro", category:"loss", icon:"loss", condition:(s)=>s.companions.length>0,
    text:(s)=>{ const n = s.companions[randInt(0,s.companions.length-1)]; return `Durante a noite, um som seco de mordida. ${n} foi arranhado por um infectado fazendo guarda — e não conta a ninguém, você percebe pelo jeito que esconde o braço.`; },
    title:()=>"A Mordida",
    choices:[
      { label:"Afastá-lo agora, por segurança.",
        resolve:(s)=>{ const idx = randInt(0,s.companions.length-1); const n = s.companions[idx]; return {effects:{moral:[-24,-14]}, text:`${n} entende, mas a decisão dói nos dois. Fica para trás, sozinho.`, removeCompanionAt:idx}; } },
      { label:"Ficar e cuidar dele, arriscando contágio.", effects:{saude:[-14,-6], moral:[14,22]}, consequence:"Você limpa o ferimento e reza para não ser a próxima. Ele agradece sem palavras." }
    ]
  },
  { id:"discordancia", category:"loss", icon:"loss", condition:(s)=>s.companions.length>0,
    text:(s)=>{ const n = s.companions[randInt(0,s.companions.length-1)]; return `${n} discorda do jeito que você tem liderado o grupo. A tensão vem crescendo há dias.`; },
    title:()=>"Atrito",
    choices:[
      { label:"Deixá-lo ir em paz, se é isso que quer.",
        resolve:(s)=>{ const idx = randInt(0,s.companions.length-1); const n = s.companions[idx]; return {effects:{moral:[-10,-4]}, text:`${n} pega as próprias coisas e parte sozinho pela manhã.`, removeCompanionAt:idx}; } },
      { label:"Insistir para que fique. A discussão fica feia.", effects:{moral:[-6,-2], saude:[-4,0]}, consequence:"Ele fica. O clima entre vocês, não tanto." }
    ]
  },

  /* ---------- FERIMENTOS (sem companheiro) ---------- */
  { id:"ferimento_solo", category:"threat", icon:"ferido", condition:(s)=>s.companions.length===0,
    text:()=>`Escalando uma cerca de arame farpado no escuro, você se machuca fundo na perna. O corte não para de sangrar.`, title:()=>"O Ferimento",
    choices:[
      { label:"Cauterizar o ferimento você mesmo.", effects:{saude:[-12,-6], moral:[2,6]}, consequence:"Dói mais do que quase tudo até agora. Mas fecha." },
      { label:"Usar comida como troca por um curativo improvisado.", effects:{saude:[-4,0], comida:[-10,-6]}, consequence:"Não é o ideal, mas segura o sangramento." }
    ]
  }
];

/* ===========================================================
   MARCOS — texto de passagem de tempo, sem alterar mecânica
=========================================================== */
const MILESTONES = {
  7:  s=>`Uma semana inteira desde que tudo começou. ${s.name}${companionsPhrase(s) ? " e " + companionsPhrase(s) : ""} ainda ${group(s)==="vocês"?"estão":"está"} de pé.`,
  14: s=>`Duas semanas. O mundo antigo já parece distante — quase inventado.`,
  21: s=>`Três semanas vivo neste mundo novo. Poucos duram tanto.`,
  30: s=>`Um mês. Ao longe, por um instante, ${s.name} jura ver um helicóptero cruzando o céu. Ele não desce. Segue em frente.`,
  45: s=>`Seis semanas. A rotina de sobreviver virou quase um ofício.`,
  60: s=>`Dois meses. ${s.name} já não se lembra direito do som da própria voz antes de tudo isso.`,
  80: s=>`Quase três meses. Muito poucos chegam até aqui.`,
  100:s=>`Cem dias. Um número que ${s.name} nunca imaginou precisar contar.`
};

/* ===========================================================
   SORTEIO DE EVENTOS
=========================================================== */
function categoryWeights(s){
  const day = s.day;
  return {
    scavenge: 5,
    people: 4,
    threat: day < 4 ? 2 : (day < 10 ? 4 : 6),
    rest: 3,
    dilemma: s.companions.length > 0 ? 3 : 1,
    loss: s.companions.length > 0 ? Math.min(1 + Math.floor(day/10), 3) : 0
  };
}

function eventsInCategory(cat, s, allowRecent){
  return EVENTS.filter(e =>
    e.category === cat &&
    (!e.condition || e.condition(s)) &&
    (allowRecent || !s.usedRecent.includes(e.id))
  );
}

function pickEvent(s){
  const weights = categoryWeights(s);
  const cats = Object.keys(weights).filter(c => weights[c] > 0 && eventsInCategory(c, s, true).length > 0);
  const total = cats.reduce((sum,c)=>sum+weights[c],0);
  let r = Math.random() * total;
  let chosenCat = cats[0];
  for(const c of cats){ if(r < weights[c]){ chosenCat = c; break; } r -= weights[c]; }

  let pool = eventsInCategory(chosenCat, s, false);
  if(!pool.length) pool = eventsInCategory(chosenCat, s, true);
  if(!pool.length) pool = EVENTS.filter(e => !e.condition || e.condition(s));

  const ev = pick(pool);
  s.usedRecent.push(ev.id);
  if(s.usedRecent.length > 8) s.usedRecent.shift();
  return ev;
}

/* ===========================================================
   QUADRO DE SOBREVIVENTES (compartilhado, via capability db)
=========================================================== */
let dbNS; // undefined = ainda não resolvido, null = indisponível

async function getDb(){
  if(dbNS !== undefined) return dbNS;
  try{
    if(window.claude && typeof window.claude.use === "function"){
      dbNS = await window.claude.use("db");
    } else {
      dbNS = null;
    }
  }catch(e){ dbNS = null; }
  return dbNS;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
}

async function fetchLeaderboard(){
  const db = await getDb();
  if(!db) return null;
  try{
    const snap = await db.collection("leaderboard").orderBy("day","desc").limit(30).get();
    let docs = snap.docs.map(d=>d.data()).filter(d=>d && d.name);
    docs.sort((a,b)=> (b.day||0) - (a.day||0));
    return docs.slice(0,6);
  }catch(e){ return null; }
}

async function submitToLeaderboard(cause){
  const db = await getDb();
  if(!db) return;
  try{
    await db.collection("leaderboard").add({
      name: state.name,
      day: state.day,
      cause: cause || "",
      ts: Date.now()
    });
  }catch(e){ /* silencioso */ }
}

function renderLeaderboardHTML(list){
  if(list === null){
    return `<div class="leaderboard"><div class="lb-title">QUADRO DE SOBREVIVENTES</div><div class="lb-empty">Indisponível nesta sessão.</div></div>`;
  }
  if(!list.length){
    return `<div class="leaderboard"><div class="lb-title">QUADRO DE SOBREVIVENTES</div><div class="lb-empty">Ninguém registrou uma tentativa ainda. Seja o primeiro.</div></div>`;
  }
  const rows = list.map((r,i)=>{
    return `<div class="lb-row"><span class="lb-rank">${i+1}</span><span class="lb-name">${escapeHtml(r.name)}</span><span class="lb-status">Dia ${r.day}</span></div>`;
  }).join("");
  return `<div class="leaderboard"><div class="lb-title">QUADRO DE SOBREVIVENTES</div>${rows}<div class="lb-note">Visível para todos que abrirem este jogo.</div></div>`;
}

/* ===========================================================
   RECORDE PESSOAL (local ao navegador de quem joga)
=========================================================== */
async function loadRecord(){
  try{
    const raw = localStorage.getItem("cinzas:recorde");
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
async function saveRecord(day, cause){
  try{
    const current = await loadRecord();
    if(!current || day > current.day){
      localStorage.setItem("cinzas:recorde", JSON.stringify({day, cause}));
    }
  }catch(e){ /* silencioso */ }
}

/* ===========================================================
   RENDER
=========================================================== */
const statNames = {saude:"Saúde", comida:"Comida", municao:"Munição", moral:"Moral"};
const app = document.getElementById("app");
const brandDay = document.getElementById("brandDay");

function fmtDelta(k,v){
  const sign = v > 0 ? "+" : "";
  return `${sign}${v} ${statNames[k]}`;
}

function fmtDelta(k,v){
  const sign = v > 0 ? "+" : "";
  return `${sign}${v} ${statNames[k]}`;
}

function renderHUD(){
  if(!state) { brandDay.textContent = ""; return ""; }
  brandDay.textContent = `DIA ${state.day}`;
  const rows = ["saude","comida","municao","moral"].map(k=>{
    return `<div class="stat-row">
      <div class="stat-name">${statNames[k]}</div>
      <div class="stat-bar"><div class="stat-fill fill-${k}" style="width:${state[k]}%"></div></div>
      <div class="stat-val">${state[k]}</div>
    </div>`;
  }).join("");
  const companionsHTML = state.companions.map(n=>`${avatarHTML(n)}${escapeHtml(n)}`).join(", ");
  return `<div class="hud">
    <div class="hud-top">
      <div class="day-label">DIA ${state.day}</div>
      <div class="name-label">${escapeHtml(state.name)}${state.companions.length ? " · " + companionsHTML : ""}</div>
    </div>
    ${rows}
    ${repRowHTML(state)}
  </div>`;
}

async function renderStart(record){
  app.innerHTML = `
    <div class="panel center-panel">
      ${renderIllustration("title")}
      <div class="big-title">CINZAS</div>
      <div class="sub-title">SOBREVIVA AO APOCALIPSE</div>
      <p>Sem fim marcado. Cada partida começa em um lugar diferente, com situações sorteadas — mercados, estradas, gente boa e gente perigosa. Você sobrevive até não conseguir mais. Veja quem dura mais tempo.</p>
      <input class="name-input" id="nameInput" placeholder="Nome do sobrevivente (opcional)" maxlength="20">
      <div>
        <button class="continue-btn" id="beginBtn" style="max-width:280px;">COMEÇAR</button>
      </div>
      ${record ? `<div class="record">Seu recorde: sobreviveu até o Dia ${record.day}${record.cause ? " — " + escapeHtml(record.cause) : ""}</div>` : ""}
      <div id="lbSlot"><div class="leaderboard"><div class="lb-title">QUADRO DE SOBREVIVENTES</div><div class="lb-empty">Carregando…</div></div></div>
    </div>
  `;
  document.getElementById("beginBtn").onclick = ()=>{
    if(!musicOn){ toggleMusic(); }
    const nameVal = document.getElementById("nameInput").value.trim();
    state = freshState(nameVal);
    state.currentEvent = pick(OPENING_EVENTS);
    renderEventScene();
  };
  const list = await fetchLeaderboard();
  const slot = document.getElementById("lbSlot");
  if(slot) slot.innerHTML = renderLeaderboardHTML(list);
}

function renderEventScene(){
  const ev = state.currentEvent;
  const title = typeof ev.title === "function" ? ev.title(state) : ev.title;
  const text = typeof ev.text === "function" ? ev.text(state) : ev.text;
  const rawChoices = typeof ev.choices === "function" ? ev.choices(state) : ev.choices;
  const choices = rawChoices.filter(c => !c.condition || c.condition(state));
  const critical = (state.saude < 25 || state.comida < 25) ? " critical" : "";
  const ambient = Math.random() < 0.4 ? `<div class="ambient-line">${pick(AMBIENT_LINES)}</div>` : "";

  const letters = ["A","B","C","D"];
  const choicesHTML = choices.map((c,i)=>`
    <button class="choice-btn" data-idx="${i}"><span class="k">${letters[i]}.</span>${c.label}</button>
  `).join("");

  app.innerHTML = `
    ${renderHUD()}
    <div class="panel${critical}">
      ${renderIllustration(ev.icon)}
      ${ambient}
      <h2 class="scene-title">${title}</h2>
      <div class="scene-text">${text}</div>
      ${state.companions.map(n=>`<div class="companion-tag">${avatarHTML(n)}${escapeHtml(n)} está com você</div>`).join("")}
      <div class="choices">${choicesHTML}</div>
    </div>
  `;

  choices.forEach((c,i)=>{
    document.querySelector(`.choice-btn[data-idx="${i}"]`).onclick = ()=> handleChoice(c);
  });
}

function handleChoice(choice){
  let effectsSpec, consequenceText, deathOverride, addCompanionName, removeCompanionAt;

  if(choice.resolve){
    const r = choice.resolve(state);
    effectsSpec = r.effects; consequenceText = r.text; deathOverride = r.deathOverride || null;
    addCompanionName = r.addCompanionName || null;
    removeCompanionAt = r.removeCompanionAt !== undefined ? r.removeCompanionAt : null;
  } else {
    effectsSpec = choice.effects; consequenceText = choice.consequence; deathOverride = choice.deathOverride || null;
    addCompanionName = choice.addCompanionName || null;
    removeCompanionAt = null;
  }

  const rolled = rollEffects(effectsSpec);
  const deltas = applyEffects(rolled);

  if(addCompanionName && state.companions.length < 3) state.companions.push(addCompanionName);
  if(removeCompanionAt !== null && state.companions[removeCompanionAt] !== undefined) state.companions.splice(removeCompanionAt, 1);

  const deathType = checkDeath();
  const ev = state.currentEvent;
  const curTitle = typeof ev.title === "function" ? ev.title(state) : ev.title;

  state.pending = { text: consequenceText, deltas, deathType, deathOverride, sceneIcon: ev.icon, sceneTitle: curTitle };
  renderConsequence();
}

function renderConsequence(){
  const p = state.pending;
  const chips = p.deltas.length ? `<div class="deltas">${
    p.deltas.map(d=>`<span class="chip ${d.v>0?'up':'down'}">${fmtDelta(d.k,d.v)}</span>`).join("")
  }</div>` : "";

  app.innerHTML = `
    ${renderHUD()}
    <div class="panel">
      ${renderIllustration(p.sceneIcon)}
      <h2 class="scene-title">${p.sceneTitle}</h2>
      <div class="consequence">
        ${p.text ? `<div class="consequence-text">${p.text}</div>` : ""}
        ${chips}
      </div>
      <button class="continue-btn" id="nextBtn">CONTINUAR</button>
    </div>
  `;

  document.getElementById("nextBtn").onclick = async ()=>{
    if(p.deathType){
      await renderDeath(p.deathType, p.deathOverride);
      return;
    }
    advanceDay();
  };
}

/* Aplica o desgaste diário (fome, cansaço) e avança para o próximo
   evento — ou para um marco, ou para a morte, o que vier primeiro. */
function advanceDay(){
  state.pending = null;
  const decayEffects = { comida: -randInt(3,7) };
  if(Math.random()*100 < Math.min(6 + state.day, 40)){ decayEffects.saude = -randInt(1,6); }
  const decayDeltas = applyEffects(decayEffects);

  state.day += 1;

  const deathType = checkDeath();
  if(deathType){
    state.pending = { text:null, deltas:decayDeltas, deathType, deathOverride:null, sceneIcon:"death", sceneTitle:"" };
    renderDeath(deathType, null);
    return;
  }

  if(MILESTONES[state.day]){
    renderMilestone(MILESTONES[state.day](state));
    return;
  }

  drawNextEvent();
}

function renderMilestone(text){
  app.innerHTML = `
    ${renderHUD()}
    <div class="panel center-panel">
      ${renderIllustration("abrigo_noturno")}
      <div class="end-badge mid">PASSAGEM DE TEMPO</div>
      <p>${text}</p>
      <button class="continue-btn" id="nextBtn" style="max-width:280px;">CONTINUAR</button>
    </div>
  `;
  document.getElementById("nextBtn").onclick = ()=> drawNextEvent();
}

function drawNextEvent(){
  state.currentEvent = pickEvent(state);
  renderEventScene();
}

async function renderDeath(type, override){
  const causes = {
    saude: { title:"Ferimentos Fatais", text:`O corpo de ${state.name} não aguentou mais um golpe. Em algum lugar da estrada, tudo parou.` },
    comida: { title:"Fome", text:`Não foram os infectados que venceram ${state.name}. Foi o corpo, cedendo aos poucos, dia após dia sem comida suficiente.` }
  };
  const c = override || causes[type];
  await saveRecord(state.day, c.title);
  const record = await loadRecord();
  await submitToLeaderboard(c.title);

  app.innerHTML = `
    ${renderHUD()}
    <div class="panel center-panel">
      ${renderIllustration("death")}
      <div class="end-badge">FIM DE JOGO · DIA ${state.day}</div>
      <div class="big-title" style="font-size:38px;">${c.title}</div>
      <p>${c.text}</p>
      <div class="record">Recorde salvo: Dia ${record.day}</div>
      <button class="continue-btn" id="restartBtn" style="max-width:280px; margin-top:18px;">TENTAR NOVAMENTE</button>
      <div id="lbSlot"><div class="leaderboard"><div class="lb-title">QUADRO DE SOBREVIVENTES</div><div class="lb-empty">Carregando…</div></div></div>
    </div>
  `;
  document.getElementById("restartBtn").onclick = ()=> renderStart(record);
  const list = await fetchLeaderboard();
  const slot = document.getElementById("lbSlot");
  if(slot) slot.innerHTML = renderLeaderboardHTML(list);
}

/* ===========================================================
   INIT
=========================================================== */
(async function init(){
  const record = await loadRecord();
  renderStart(record);
})();
