import { toggleMusic, isMusicOn } from './audio.js';
import { sceneHTML } from './scenes.js';
import { getEpisodeNode, resolveCompanion } from './episodes.js';
import { buildHero, runBoot } from './hero.js';
import { state, newGame, FACTIONS, randInt, pick, rollEffects, applyEffects, checkDeath } from './state.js';
import { OPENING_EVENTS, AMBIENT_LINES, MILESTONES, pickEvent } from './events.js';
import { shareResult, copyText, downloadCard, whatsappUrl } from './share.js';
import { withRng, rngFor, dateKey, labelOf, codeOf, msUntilNext, getDay, recordRun, streak, parseResults, getPaste, setPaste } from './daily.js';
import { albumView, markEnding, totals } from './album.js';
import { fetchLeaderboard, submitToLeaderboard, loadRecord, saveRecord } from './storage.js';

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
}

const pad = n => String(n).padStart(2, "0");

/* Rótulo de local mostrado na barra superior e na cena, por ícone de evento. */
const PLACES = {
  title:"DESCONHECIDO", start:"DESCONHECIDO", mercado:"MERCADO ABANDONADO", floresta:"FLORESTA",
  abrigo_noturno:"ABRIGO NOTURNO", abrigo:"ABRIGO", radio:"SINAL DE RÁDIO", resgate:"PEDIDO DE AJUDA",
  estrada:"ESTRADA", rivais:"TERRITÓRIO RIVAL", zumbis:"ZONA INFECTADA", desconhecido:"DESCONHECIDO",
  escassez:"ESCASSEZ", ferido:"FERIDO", final:"DESTINO", death:"FIM DA LINHA", trade:"ENCONTRO NA ESTRADA",
  storm:"TEMPESTADE", loss:"PERDA"
};

function repChipsHTML(s){
  return Object.keys(FACTIONS).filter(f => s.rep[f] !== 0).map(f=>{
    const fac = FACTIONS[f]; const r = s.rep[f]; const sign = r>0 ? "+" : "";
    return `<span class="rep-chip" style="color:${fac.color}">${fac.short} ${sign}${r}</span>`;
  }).join("");
}

function renderLeaderboardHTML(list){
  const head = `<i class="rc"></i><h2 class="reg-title"><svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path d="M8 1.5a3 3 0 0 0-3 3V6H4v7h8V6h-1V4.5a3 3 0 0 0-3-3Zm0 1.4a1.6 1.6 0 0 1 1.6 1.6V6H6.4V4.5A1.6 1.6 0 0 1 8 2.9Z" fill="currentColor"/></svg>REGISTRO DE SOBREVIVENTES</h2>`;
  const foot = `<div class="reg-foot"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M1.5 3.5h5l1.2 1.5h6.8v7.5h-13z" fill="currentColor"/></svg>REGISTRO SALVO LOCALMENTE</div>`;
  let body;
  if(list === null) body = `<li class="reg-empty">REGISTRO INDISPONÍVEL NESTA SESSÃO.</li>`;
  else if(!list.length) body = `<li class="reg-empty">NENHUM SOBREVIVENTE REGISTRADO.</li>`;
  else body = list.slice(0,3).map((r,i)=>
    `<li><span class="n">#${pad(i+1)}</span><span>${escapeHtml(String(r.name).toUpperCase())}</span><span class="d">DIA ${pad(r.day)}</span></li>`
  ).join("");
  return `${head}<ol class="reg-list">${body}</ol>${foot}`;
}

async function fillRegistry(){
  const list = await fetchLeaderboard();
  const slot = document.getElementById("lbSlot");
  if(slot) slot.innerHTML = renderLeaderboardHTML(list);
}

/* ===========================================================
   RENDER
=========================================================== */
const statNames = {saude:"Saúde", comida:"Comida", municao:"Munição", moral:"Moral"};
const app = document.getElementById("app");
const tbDay = document.getElementById("tbDay");
const tbLocal = document.getElementById("tbLocal");
let typingTimer = null, dailyTimer = null;

/* No desafio do dia, os sorteios de cada dia de jogo usam uma semente da data (ver daily.js). */
const seeded = (slot, fn) => state && state.daily ? withRng(rngFor(state.daily, state.day, slot), fn) : fn();

function fmtDelta(k,v){
  const sign = v > 0 ? "+" : "";
  return `${sign}${v} ${statNames[k].toUpperCase()}`;
}

/* Prepara o contêiner e a barra superior para uma tela. */
function setScreen(kind, place, opts = {}){
  clearInterval(typingTimer); clearInterval(dailyTimer);
  app.className = "screen" + (kind === "start" ? "" : " sit") + (opts.critical ? " crit" : "");
  tbDay.textContent = state && kind !== "start" ? pad(state.day) : "--";
  tbLocal.textContent = "LOCAL: " + (place || "DESCONHECIDO");
  window.scrollTo({ top:0 });
}

/* Texto digitado letra a letra; clique pula a animação. */
function typeText(el, text){
  clearInterval(typingTimer);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){ el.textContent = text; return; }
  let i = 0;
  const finish = ()=>{ clearInterval(typingTimer); el.textContent = text; };
  typingTimer = setInterval(()=>{
    i += 2;
    if(i >= text.length){ finish(); return; }
    el.innerHTML = escapeHtml(text.slice(0, i)) + `<span class="caret"></span>`;
  }, 16);
  el.onclick = finish;
}

function renderHUD(){
  if(!state) return "";
  const rows = ["saude","comida","municao","moral"].map(k=>`
    <div class="stat${state[k] < 25 ? " low" : ""}">
      <span class="lbl">${statNames[k]}</span>
      <div class="seg"><div class="f fill-${k}" style="width:${state[k]}%"></div></div>
      <span class="val">${state[k]}</span>
    </div>`).join("");
  const rep = repChipsHTML(state);
  return `<section class="status" aria-label="Status do sobrevivente">
    <div class="status-head">
      <span class="st-name">${escapeHtml(state.name.toUpperCase())}</span>
      <span class="st-day">DIA ${pad(state.day)}</span>
    </div>
    ${rows}
    ${state.companions.length ? `<div class="crew">${state.companions.map(n=>escapeHtml(n.toUpperCase())).join(", ")}</div>` : ""}
    ${rep ? `<div class="rep"><span class="lbl">REPUTAÇÃO</span>${rep}</div>` : ""}
  </section>`;
}

/* mood: "hit" (perdeu saúde) ou "good" (só ganhos) — anima a cena na tela de resultado. */
function viewportHTML(icon, mood = ""){
  return `<div class="viewport${mood ? " " + mood : ""}">
    ${sceneHTML(icon)}
    <span class="vp-tag">LOCAL: ${PLACES[icon] || "DESCONHECIDO"}</span>
    <span class="vp-rec">REC</span>
    <i class="vp-vc a"></i><i class="vp-vc b"></i>
  </div>`;
}

export async function renderStart(record){
  setScreen("start");
  app.innerHTML = `
    <section class="hero">
      <div class="boot" id="boot" aria-hidden="true"></div>
      <svg class="hero-art" id="heroArt" viewBox="0 0 800 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true"></svg>
      <div class="hero-fade"></div>
      <h1 class="logo">CINZAS</h1>
    </section>
    <div class="tagline"><span class="rule"></span><span class="tag-text">SOBREVIVA AO APOCALIPSE</span><span class="rule"></span></div>
    <p class="quote">“Não existe um destino.<br>Existe apenas o próximo dia.”</p>
    <label class="term-field" for="nameInput">
      <span class="term-prompt">&gt;</span>
      <span class="term-input-wrap">
        <input class="name-input" id="nameInput" placeholder="NOME DO SOBREVIVENTE" maxlength="20" autocomplete="off" spellcheck="false" aria-label="Nome do sobrevivente (opcional)">
        <span class="term-overlay" aria-hidden="true"><span class="term-mirror" id="nameMirror"></span><span class="term-cursor">_</span></span>
      </span>
    </label>
    <button class="continue-btn start-btn" id="beginBtn">▶ INICIAR SOBREVIVÊNCIA</button>
    <section class="daily-box" id="dailySlot" aria-label="Desafio do dia"></section>
    <button class="album-link" id="albumBtn" type="button">▤ ÁLBUM DE FINAIS · <span id="albumCount">--</span></button>
    ${record ? `<div class="record-line">SEU RECORDE: DIA ${pad(record.day)}${record.cause ? " — " + escapeHtml(record.cause.toUpperCase()) : ""}</div>` : ""}
    <section class="registry" id="lbSlot">${renderLeaderboardHTML([]).replace("NENHUM SOBREVIVENTE REGISTRADO.", "CARREGANDO…")}</section>
  `;
  buildHero();
  runBoot();
  const nameInputEl = document.getElementById("nameInput");
  const nameMirror = document.getElementById("nameMirror");
  const syncCursor = ()=>{ nameMirror.textContent = nameInputEl.value || nameInputEl.placeholder; };
  nameInputEl.addEventListener("input", syncCursor);
  syncCursor();
  const begin = daily => {
    if(!isMusicOn()){ toggleMusic(); }
    const nameVal = document.getElementById("nameInput").value.trim();
    if(daily){ withRng(rngFor(daily, 0), ()=> newGame(nameVal)); state.daily = daily; }
    else newGame(nameVal);
    seeded(0, ()=>{ state.currentEvent = pick(OPENING_EVENTS); });
    renderEventScene();
  };
  document.getElementById("beginBtn").onclick = ()=> begin(null);
  document.getElementById("albumBtn").onclick = ()=> renderAlbum(record);
  fillRegistry();
  fillDaily(begin);
  totals().then(t => { const el = document.getElementById("albumCount"); if(el) el.textContent = `${t.seen}/${t.total}`; });
}

/* Painel do desafio do dia: data, sequência, melhor resultado, contagem regressiva e ranking dos amigos. */
async function fillDaily(begin){
  const slot = document.getElementById("dailySlot");
  const key = dateKey(), label = labelOf(key);
  const [day, seq, paste] = await Promise.all([getDay(key), streak(key), getPaste(key)]);
  if(!slot.isConnected) return;
  slot.innerHTML = `
    <div class="dl-head"><span class="dl-title">// DESAFIO DO DIA</span><span class="dl-code">${codeOf(key)}</span></div>
    <div class="dl-main">
      <div class="dl-date">${label}</div>
      <div class="dl-stats">
        <div><b>${seq}</b><span>SEQUÊNCIA</span></div>
        <div><b>${day.best ? pad(day.best) : "--"}</b><span>MELHOR DO DIA</span></div>
        <div><b>${day.tries}</b><span>TENTATIVAS</span></div>
      </div>
    </div>
    <div class="dl-count" id="dlCount"></div>
    <button class="continue-btn start-btn" id="dailyBtn">▶ JOGAR DESAFIO DO DIA</button>
    <details class="dl-rank">
      <summary>RANKING DO DIA · AMIGOS</summary>
      <textarea id="dlPaste" placeholder="Cole aqui as mensagens de resultado dos seus amigos…" aria-label="Resultados dos amigos">${escapeHtml(paste)}</textarea>
      <div id="dlTable"></div>
    </details>`;

  const tick = ()=>{
    const el = document.getElementById("dlCount");
    if(!el){ clearInterval(dailyTimer); return; }
    const ms = msUntilNext();
    el.textContent = `NOVO DESAFIO EM ${pad(Math.floor(ms / 3.6e6))}:${pad(Math.floor(ms % 3.6e6 / 6e4))}:${pad(Math.floor(ms % 6e4 / 1e3))}`;
  };
  tick(); dailyTimer = setInterval(tick, 1000);

  const renderRank = ()=>{
    const text = document.getElementById("dlPaste").value;
    const me = day.best ? { name: day.name || "Você", day: day.best, me: true } : null;
    const rows = parseResults(text, label).filter(r => !me || r.name !== me.name);
    if(me) rows.push(me);
    rows.sort((a, b) => b.day - a.day);
    document.getElementById("dlTable").innerHTML = rows.length
      ? `<table class="dl-table"><tr><th>#</th><th>SOBREVIVENTE</th><th>DIA</th></tr>${rows.map((r, i) =>
          `<tr class="${r.me ? "me" : ""}${i === 0 ? " top" : ""}"><td>${pad(i + 1)}</td><td>${escapeHtml(r.name.toUpperCase())}${r.me ? " (VOCÊ)" : ""}</td><td>${pad(r.day)}</td></tr>`).join("")}</table>`
      : `<div class="dl-empty">SEM RESULTADOS PARA ${label} AINDA.</div>`;
  };
  renderRank();
  document.getElementById("dlPaste").oninput = e => { setPaste(key, e.target.value); renderRank(); };
  document.getElementById("dailyBtn").onclick = ()=> begin(key);
}

async function renderAlbum(record){
  setScreen("scene", "ÁLBUM DE FINAIS");
  tbDay.textContent = "--";
  const [view, t] = await Promise.all([albumView(), totals()]);
  app.innerHTML = `
    <section class="scene">
      <div class="scene-body">
        <div class="alb-head"><h2 class="alb-title">ÁLBUM DE FINAIS</h2><span class="alb-label">${t.seen} DE ${t.total} DESCOBERTOS</span></div>
        <div class="alb-prog"><div style="width:${t.total ? 100 * t.seen / t.total : 0}%"></div></div>
        <p class="ambient">Cada episódio tem finais diferentes. Escolhas diferentes levam a desfechos diferentes.</p>
        ${view.map(ep => `
          <div class="alb-ep">${ep.name}<span>${ep.endings.filter(e => e.seen).length}/${ep.endings.length}</span></div>
          <div class="alb-ends">${ep.endings.map(e => `
            <div class="alb-card${e.seen ? "" : " lock"}">
              <div class="viewport">${sceneHTML(e.icon)}${e.seen ? "" : `<span class="alb-lockmark">???</span>`}<i class="vp-vc a"></i><i class="vp-vc b"></i></div>
              <div class="alb-body">
                <h3>${e.seen ? e.title : "FINAL BLOQUEADO"}</h3>
                <p>${e.seen ? e.text : "Existe um desfecho aqui que você ainda não viu."}</p>
                <div class="alb-hint">${e.seen ? "✓ DESCOBERTO" : `${e.paths} CAMINHOS LEVAM A ESTE FINAL`}</div>
              </div>
            </div>`).join("")}</div>`).join("")}
        <button class="continue-btn start-btn" id="albBack">◀ VOLTAR</button>
      </div>
    </section>`;
  document.getElementById("albBack").onclick = ()=> renderStart(record);
}

function renderEventScene(){
  const ev = state.currentEvent;
  let title, text, choices;
  seeded(3, ()=>{
    title = typeof ev.title === "function" ? ev.title(state) : ev.title;
    text = typeof ev.text === "function" ? ev.text(state) : ev.text;
    const rawChoices = typeof ev.choices === "function" ? ev.choices(state) : ev.choices;
    choices = rawChoices.filter(c => !c.condition || c.condition(state)).slice(0, 4); // no máximo A–D
  });
  if(ev.episode && ev.act === 3) state.endingPromise = markEnding(`${ev.episode}:${ev.nodeId}`);
  const critical = state.saude < 25 || state.comida < 25;
  const ambient = Math.random() < 0.4 ? `<div class="ambient">${pick(AMBIENT_LINES)}</div>` : "";

  const letters = ["A","B","C","D"];
  const choicesHTML = choices.map((c,i)=>`
    <button class="opt" data-idx="${i}" style="animation-delay:${0.4 + 0.15*i}s"><span class="k">[${letters[i]}]</span><span>${c.label}</span></button>
  `).join("");

  setScreen("scene", PLACES[ev.icon], { critical });
  app.innerHTML = `
    <div class="crit-alert">⚠ CONDIÇÃO CRÍTICA — SAÚDE OU COMIDA ABAIXO DE 25</div>
    ${renderHUD()}
    <section class="scene">
      ${viewportHTML(ev.icon)}
      <div class="scene-body">
        <div class="scene-kicker">// SITUAÇÃO</div>
        <h2 class="scene-h">${title}</h2>
        <div class="scene-p" id="sceneText"></div>
        ${ambient}
        <div class="options">${choicesHTML}</div>
      </div>
    </section>
  `;
  typeText(document.getElementById("sceneText"), text);

  choices.forEach((c,i)=>{
    document.querySelector(`.opt[data-idx="${i}"]`).onclick = ()=> handleChoice(c);
  });
}

function handleChoice(choice){
  let effectsSpec, consequenceText, deathOverride, addCompanionName, removeCompanionAt, next, deltas;

  seeded(1, ()=>{
  if(choice.resolve){
    const r = choice.resolve(state);
    effectsSpec = r.effects; consequenceText = r.text; deathOverride = r.deathOverride || null;
    addCompanionName = resolveCompanion(r, state);
    removeCompanionAt = r.removeCompanionAt !== undefined ? r.removeCompanionAt : null;
    next = r.next || choice.next || null;
  } else {
    effectsSpec = choice.effects; consequenceText = choice.consequence; deathOverride = choice.deathOverride || null;
    addCompanionName = resolveCompanion(choice, state);
    removeCompanionAt = null;
    next = choice.next || null;
  }

  deltas = applyEffects(rollEffects(effectsSpec));

  if(addCompanionName && state.companions.length < 3) state.companions.push(addCompanionName);
  if(removeCompanionAt !== null && state.companions[removeCompanionAt] !== undefined) state.companions.splice(removeCompanionAt, 1);
  });

  const deathType = checkDeath();
  const ev = state.currentEvent;
  const curTitle = typeof ev.title === "function" ? ev.title(state) : ev.title;

  state.nextNode = ev.episode && next ? { ep: ev.episode, node: next } : null;
  const episodeEnd = ev.episode && !next ? ev.epName : null;

  state.pending = { text: consequenceText, deltas, deathType, deathOverride, sceneIcon: ev.icon, sceneTitle: curTitle, episodeEnd, hasNext: !!state.nextNode };
  renderConsequence();
}

function renderConsequence(){
  const p = state.pending;
  const chips = p.deltas.length ? `<div class="deltas2">${
    p.deltas.map(d=>`<span class="delta ${d.v>0?'up':'down'}">${fmtDelta(d.k,d.v)}</span>`).join("")
  }</div>` : "";

  const lostHealth = p.deltas.some(d => d.k === "saude" && d.v < 0);
  const mood = lostHealth ? "hit" : (p.deltas.length && p.deltas.every(d => d.v > 0) ? "good" : "");

  setScreen("scene", PLACES[p.sceneIcon]);
  app.innerHTML = `
    ${renderHUD()}
    <section class="scene">
      ${viewportHTML(p.sceneIcon, mood)}
      <div class="scene-body">
        <div class="scene-kicker">// RESULTADO</div>
        <h2 class="scene-h">${p.sceneTitle}</h2>
        <div class="result">
          <div class="result-h">RELATÓRIO</div>
          ${p.text ? `<div class="result-p">${p.text}</div>` : ""}
          ${chips}
        </div>
        ${p.episodeEnd ? `<div class="ep-end">// FIM DO EPISÓDIO — ${p.episodeEnd}</div><div id="endingSlot"></div>` : ""}
        ${p.hasNext ? `<div class="ep-next">▸ A SITUAÇÃO CONTINUA NO PRÓXIMO DIA</div>` : ""}
        <button class="continue-btn start-btn" id="nextBtn">▶ CONTINUAR</button>
      </div>
    </section>
  `;

  if(p.episodeEnd && state.endingPromise){
    state.endingPromise.then(r => {
      const slot = document.getElementById("endingSlot");
      if(!slot || !r) return;
      slot.innerHTML = r.isNew
        ? `<div class="ending-banner">★ NOVO FINAL DESCOBERTO: ${p.sceneTitle.toUpperCase()}<small>${r.seen} DE ${r.total} NO ÁLBUM DE FINAIS</small></div>`
        : `<div class="ending-banner old">FINAL JÁ CONHECIDO: ${p.sceneTitle.toUpperCase()}<small>TENTE ESCOLHAS DIFERENTES PARA ACHAR OS QUE FALTAM (${r.seen}/${r.total})</small></div>`;
    });
  }

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
  let decayDeltas;
  seeded(2, ()=>{
    const decayEffects = { comida: -randInt(3,7) };
    if(Math.random()*100 < Math.min(6 + state.day, 40)){ decayEffects.saude = -randInt(1,6); }
    decayDeltas = applyEffects(decayEffects);
  });

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
  setScreen("scene", "PASSAGEM DE TEMPO");
  app.innerHTML = `
    ${renderHUD()}
    <section class="scene">
      ${viewportHTML("abrigo_noturno").replace(/LOCAL: [^<]*/, "LOCAL: PASSAGEM DE TEMPO")}
      <div class="scene-body">
        <div class="scene-kicker">// PASSAGEM DE TEMPO</div>
        <div class="scene-p" style="min-height:0">${text}</div>
        <button class="continue-btn start-btn" id="nextBtn">▶ CONTINUAR</button>
      </div>
    </section>
  `;
  document.getElementById("nextBtn").onclick = ()=> drawNextEvent();
}

/* Se há um episódio em andamento, o próximo ato vem antes de qualquer sorteio. */
function drawNextEvent(){
  const nn = state.nextNode;
  state.nextNode = null;
  seeded(0, ()=>{ state.currentEvent = (nn && getEpisodeNode(nn.ep, nn.node)) || pickEvent(state); });
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

  const dailyKey = state.daily;
  const dailyDay = dailyKey ? await recordRun(dailyKey, state.day, state.name) : null;
  const shareData = { name: state.name, day: state.day, cause: c.title, daily: dailyKey ? labelOf(dailyKey) : undefined };

  setScreen("scene", PLACES.death);
  app.innerHTML = `
    ${renderHUD()}
    <section class="scene">
      ${viewportHTML("death")}
      <div class="scene-body end-body">
        <div class="end-badge">FIM DE JOGO · DIA ${pad(state.day)}</div>
        <h2 class="scene-h">${c.title}</h2>
        <div class="scene-p" style="min-height:0">${c.text}</div>
        <div class="record-line">RECORDE SALVO: DIA ${pad(record ? record.day : state.day)}</div>
        ${dailyDay ? `<div class="daily-line">// DESAFIO DO DIA ${labelOf(dailyKey)} · MELHOR HOJE: DIA ${pad(dailyDay.best)} · ${dailyDay.tries} ${dailyDay.tries === 1 ? "TENTATIVA" : "TENTATIVAS"}</div>` : ""}
        <button class="continue-btn start-btn" id="shareBtn">↗ COMPARTILHAR RESULTADO</button>
        <div class="share-alt">
          <a id="waBtn" href="${whatsappUrl(shareData)}" target="_blank" rel="noopener">WHATSAPP</a>
          <button id="copyBtn" type="button">COPIAR TEXTO</button>
          <button id="dlBtn" type="button">BAIXAR IMAGEM</button>
        </div>
        <div class="share-status" id="shareStatus" role="status"></div>
        <button class="continue-btn start-btn" id="restartBtn">▶ TENTAR NOVAMENTE</button>
      </div>
    </section>
    <section class="registry" id="lbSlot">${renderLeaderboardHTML([]).replace("NENHUM SOBREVIVENTE REGISTRADO.", "CARREGANDO…")}</section>
  `;
  let statusTimer;
  const say = t => {
    const el = document.getElementById("shareStatus");
    el.textContent = t; clearTimeout(statusTimer); statusTimer = setTimeout(()=> el.textContent = "", 3500);
  };
  document.getElementById("shareBtn").onclick = async ()=>{
    const r = await shareResult(shareData);
    say({ shared:"COMPARTILHADO.", cancelled:"", copied:"TEXTO COPIADO — COLE NA CONVERSA.", failed:"NÃO FOI POSSÍVEL COMPARTILHAR NESTE NAVEGADOR." }[r]);
  };
  document.getElementById("copyBtn").onclick = async ()=> say(await copyText(shareData) ? "TEXTO COPIADO." : "NÃO FOI POSSÍVEL COPIAR.");
  document.getElementById("dlBtn").onclick = ()=> downloadCard(shareData).then(()=> say("IMAGEM BAIXADA."));
  document.getElementById("restartBtn").onclick = ()=> renderStart(record);
  fillRegistry();
}
