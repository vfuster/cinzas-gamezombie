import { toggleMusic, isMusicOn } from './audio.js';
import { renderIllustration } from './illustrations.js';
import { state, newGame, FACTIONS, randInt, pick, rollEffects, applyEffects, checkDeath } from './state.js';
import { OPENING_EVENTS, AMBIENT_LINES, MILESTONES, pickEvent } from './events.js';
import { fetchLeaderboard, submitToLeaderboard, loadRecord, saveRecord } from './storage.js';

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
}

/* Cor de identificação estável por nome (hash simples -> matiz). */
function nameColor(name){
  let hash = 0;
  for(let i=0;i<name.length;i++){ hash = (hash*31 + name.charCodeAt(i)) % 360; }
  return `hsl(${hash},55%,45%)`;
}
function avatarHTML(name){
  return `<span class="avatar" style="background:${nameColor(name)}">${escapeHtml(name.charAt(0).toUpperCase())}</span>`;
}

function repRowHTML(s){
  const chips = Object.keys(FACTIONS).filter(f => s.rep[f] !== 0).map(f=>{
    const fac = FACTIONS[f]; const r = s.rep[f]; const sign = r>0 ? "+" : "";
    return `<span class="rep-chip" style="border-color:${fac.color}; color:${fac.color}">${fac.short} ${sign}${r}</span>`;
  }).join("");
  return chips ? `<div class="rep-row">${chips}</div>` : "";
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
   RENDER
=========================================================== */
const statNames = {saude:"Saúde", comida:"Comida", municao:"Munição", moral:"Moral"};
const app = document.getElementById("app");
const brandDay = document.getElementById("brandDay");

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

export async function renderStart(record){
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
    if(!isMusicOn()){ toggleMusic(); }
    const nameVal = document.getElementById("nameInput").value.trim();
    newGame(nameVal);
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
