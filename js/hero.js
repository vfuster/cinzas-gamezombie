/* Cena animada da tela inicial (SVG gerado por código) e texto de boot do terminal. */
/* ---------- gerador determinístico (a cena não muda a cada reload) ---------- */
let seed = 7;
const rnd = ()=> (seed = (seed * 16807) % 2147483647) / 2147483647;

/* ---------- cena do herói: céu vermelho, lua, ruínas, sobrevivente e zumbis ---------- */
export function buildHero(){
  seed = 7; // cena idêntica a cada render
  const svg = document.getElementById("heroArt");
  const W = 800, H = 340;
  const px = 4; // "pixel" da arte
  let out = `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a0c0a"/><stop offset=".55" stop-color="#4a1511"/><stop offset="1" stop-color="#7a2420"/>
      </linearGradient>
      <radialGradient id="moonGlow"><stop offset="0" stop-color="#D13B35" stop-opacity=".55"/><stop offset="1" stop-color="#D13B35" stop-opacity="0"/></radialGradient>
      <filter id="rough"><feTurbulence baseFrequency=".9" numOctaves="1" seed="3"/><feDisplacementMap in="SourceGraphic" scale="3"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="560" cy="86" r="120" fill="url(#moonGlow)"/>
    <circle class="moon" cx="560" cy="86" r="42" fill="#D13B35"/>
    <circle cx="548" cy="76" r="9" fill="#A82E29" opacity=".7"/><circle cx="574" cy="98" r="6" fill="#A82E29" opacity=".7"/>
    <path class="cloud" d="M440 70 q60 -14 130 4 t110 -6 v14 q-60 10 -120 0 t-120 -2z" fill="#10140F" opacity=".75"/>`;

  /* camadas de prédios: de longe (clara/avermelhada) para perto (escura) */
  const layers = [
    { base:250, min:30, max:120, c:"#5a1a16", step:[22,40], win:false },
    { base:268, min:40, max:150, c:"#2a0f0d", step:[26,48], win:true },
    { base:290, min:30, max:100, c:"#12100c", step:[30,56], win:true }
  ];
  layers.forEach(L=>{
    let x = -10;
    while(x < W){
      const w = Math.round((L.step[0] + rnd()*(L.step[1]-L.step[0]))/px)*px;
      const h = Math.round((L.min + rnd()*(L.max-L.min))/px)*px;
      const y = L.base - h;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h + 60}" fill="${L.c}"/>`;
      if(rnd() > .55) out += `<rect x="${x + w*0.3}" y="${y - 12}" width="${px*2}" height="12" fill="${L.c}"/>`; // antena
      if(rnd() > .6) out += `<polygon points="${x},${y} ${x+w},${y} ${x+w*0.7},${y-10}" fill="${L.c}"/>`; // topo quebrado
      if(L.win){
        for(let wy = y + 10; wy < L.base - 6; wy += 14){
          for(let wx = x + 6; wx < x + w - 8; wx += 12){
            if(rnd() > .82) out += `<rect x="${wx}" y="${wy}" width="4" height="6" fill="${rnd()>.5?'#C99B2E':'#D13B35'}" opacity="${(.25 + rnd()*.4).toFixed(2)}"/>`;
          }
        }
      }
      x += w + Math.round(rnd()*6);
    }
  });

  /* chão com poeira vermelha */
  out += `<rect y="${H-52}" width="${W}" height="52" fill="#0b0a08"/>`;
  for(let i=0;i<90;i++){
    out += `<rect x="${Math.round(rnd()*W)}" y="${H - 52 + Math.round(rnd()*50)}" width="${px*(1+Math.floor(rnd()*3))}" height="${px/2}" fill="#A82E29" opacity="${(.15 + rnd()*.35).toFixed(2)}"/>`;
  }

  /* placa torta à esquerda */
  out += `<g fill="#0a0907"><rect x="64" y="150" width="6" height="150" transform="rotate(8 67 300)"/>
    <rect x="30" y="118" width="120" height="56" transform="rotate(14 90 146)"/></g>
    <g fill="none" stroke="#7E866C" stroke-width="1.5" opacity=".5" transform="rotate(14 90 146)"><rect x="38" y="126" width="104" height="40"/><path d="M50 140h60M50 150h40"/></g>`;

  /* sobrevivente de costas: partes separadas para poder animar */
  out += `<g class="survivor" fill="#0a0907">
    <g class="sv-legs"><rect x="240" y="218" width="14" height="72"/><rect x="258" y="218" width="14" height="72"/></g>
    <g class="sv-body">
      <rect x="230" y="150" width="46" height="70"/>
      <rect x="222" y="140" width="14" height="44" rx="3"/>
      <rect x="262" y="150" width="3" height="60" fill="#D13B35" opacity=".5"/>
      <g class="sv-head"><rect x="236" y="120" width="30" height="34" rx="4"/><rect x="236" y="120" width="30" height="5" fill="#A82E29" opacity=".55"/></g>
      <path class="sv-scarf" d="M240 150 q-14 6 -24 -2 q-8 -6 -20 2 q10 6 20 6 q12 2 24 6z" fill="#7a2420"/>
      <g class="sv-rifle"><rect x="276" y="116" width="6" height="90" transform="rotate(8 279 160)"/></g>
    </g>
  </g>`;

  /* zumbis em silhueta: cada um com ritmo próprio */
  const zombie = (x, s, lean, i)=>{
    const dur = (3.2 + (i % 4) * 0.55).toFixed(2), del = (-(i * 0.7)).toFixed(2);
    return `<g transform="translate(${x} ${H-52}) scale(${s})"><g class="zombie" style="--d:${dur}s;--dl:${del}s;--lean:${lean}deg" fill="#080B08">
      <g class="z-legs"><g class="zleg a"><rect x="-10" y="-30" width="8" height="30"/></g><g class="zleg b"><rect x="2" y="-30" width="8" height="30" transform="rotate(8 6 -30)"/></g></g>
      <g class="z-torso">
        <rect x="-12" y="-72" width="24" height="42"/>
        <g class="zarm a"><rect x="12" y="-70" width="7" height="34" transform="rotate(-30 12 -70)"/></g>
        <g class="zarm b"><rect x="-19" y="-70" width="7" height="34" transform="rotate(-48 -12 -70)"/></g>
        <g class="z-head"><rect x="-9" y="-92" width="18" height="20" rx="4" transform="rotate(${lean*2} 0 -82)"/></g>
      </g>
    </g></g>`;
  };
  [[380,.75,-4],[430,.9,3],[475,1.1,-3],[560,.85,5],[610,1.0,-5],[650,1.25,4],[700,.7,-3],[740,.8,4],[520,.65,2]].forEach((z,i)=>{ out += zombie(...z, i); });

  svg.innerHTML = out;
}

/* ---------- boot do terminal ---------- */
export function runBoot(){
  const box = document.getElementById("boot");
  const lines = ["INICIALIZANDO SISTEMA...", "CARREGANDO DADOS...", "BEM-VINDO, SOBREVIVENTE."];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  box.innerHTML = lines.map(()=>`<div class="ln"></div>`).join("") + `<span class="cur"></span>`;
  const els = box.querySelectorAll(".ln");
  if(reduce){ els.forEach((e,i)=> e.textContent = lines[i]); return; }
  let li = 0, ci = 0;
  (function tick(){
    if(li >= lines.length) return;
    els[li].textContent = lines[li].slice(0, ++ci);
    if(ci >= lines[li].length){ li++; ci = 0; setTimeout(tick, 380); }
    else setTimeout(tick, 32);
  })();
}

