/* Cenas animadas das telas de situação (mesmo estilo da cena da tela inicial).
   Cada ícone de evento tem um tema (céu, clima, prédios) e props próprios. SVG gerado por código; animações em css/cenas.css. */

const W = 800, H = 260, G = 214; // largura, altura e linha do chão
let seed = 1;
const rnd = ()=> (seed = (seed * 16807) % 2147483647) / 2147483647;
const hash = s => [...s].reduce((a,c)=> (a * 31 + c.charCodeAt(0)) % 2147483646, 7) + 1;
const r2 = n => Math.round(n * 100) / 100;

/* ---------- personagens (mesma estrutura animada da tela inicial) ---------- */
function survivor(cx, gy, s = .55, extra = ""){
  return `<g transform="translate(${r2(cx - 250*s)} ${r2(gy - 290*s)}) scale(${s})"><g class="survivor" fill="#0a0907" ${extra}>
    <g class="sv-legs"><rect x="240" y="218" width="14" height="72"/><rect x="258" y="218" width="14" height="72"/></g>
    <g class="sv-body">
      <rect x="230" y="150" width="46" height="70"/><rect x="222" y="140" width="14" height="44" rx="3"/>
      <rect x="262" y="150" width="3" height="60" fill="#D13B35" opacity=".5"/>
      <g class="sv-head"><rect x="236" y="120" width="30" height="34" rx="4"/><rect x="236" y="120" width="30" height="5" fill="#A82E29" opacity=".55"/></g>
      <path class="sv-scarf" d="M240 150 q-14 6 -24 -2 q-8 -6 -20 2 q10 6 20 6 q12 2 24 6z" fill="#7a2420"/>
      <g class="sv-rifle"><rect x="276" y="116" width="6" height="90" transform="rotate(8 279 160)"/></g>
    </g></g></g>`;
}

function zombie(x, gy, s, lean, i, fill = "#080B08"){
  const dur = (3.2 + (i % 4) * .55).toFixed(2), del = (-(i * .7)).toFixed(2);
  return `<g transform="translate(${x} ${gy}) scale(${s})"><g class="zombie" style="--d:${dur}s;--dl:${del}s;--lean:${lean}deg" fill="${fill}">
    <g class="z-legs"><g class="zleg a"><rect x="-10" y="-30" width="8" height="30"/></g><g class="zleg b"><rect x="2" y="-30" width="8" height="30" transform="rotate(8 6 -30)"/></g></g>
    <g class="z-torso"><rect x="-12" y="-72" width="24" height="42"/>
      <g class="zarm a"><rect x="12" y="-70" width="7" height="34" transform="rotate(-30 12 -70)"/></g>
      <g class="zarm b"><rect x="-19" y="-70" width="7" height="34" transform="rotate(-48 -12 -70)"/></g>
      <g class="z-head"><rect x="-9" y="-92" width="18" height="20" rx="4" transform="rotate(${lean*2} 0 -82)"/></g>
    </g></g></g>`;
}

/* pessoa genérica parada (outro sobrevivente, vigia, estranho) */
function person(x, gy, s, fill = "#0a0907", gun = false){
  return `<g transform="translate(${x} ${gy}) scale(${s})" fill="${fill}">
    <rect x="-9" y="-40" width="7" height="40"/><rect x="2" y="-40" width="7" height="40"/>
    <rect x="-12" y="-82" width="24" height="46"/><rect x="-8" y="-100" width="16" height="19" rx="3"/>
    <rect x="-14" y="-104" width="28" height="4"/>${gun ? `<rect x="10" y="-76" width="30" height="4"/><rect x="10" y="-76" width="6" height="14"/>` : ""}
  </g>`;
}

/* ---------- camadas comuns ---------- */
function skyline(base, minH, maxH, color, step, win, dens = .82){
  let out = "", x = -10;
  while(x < W){
    const w = Math.round(step[0] + rnd() * (step[1] - step[0]));
    const h = Math.round(minH + rnd() * (maxH - minH));
    const y = base - h;
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h + 60}" fill="${color}"/>`;
    if(rnd() > .55) out += `<rect x="${r2(x + w*.3)}" y="${y - 10}" width="4" height="10" fill="${color}"/>`;
    if(rnd() > .6) out += `<polygon points="${x},${y} ${x+w},${y} ${r2(x+w*.7)},${y-9}" fill="${color}"/>`;
    if(win){
      for(let wy = y + 9; wy < base - 6; wy += 13) for(let wx = x + 6; wx < x + w - 8; wx += 11){
        if(rnd() > dens) out += `<rect class="${rnd() > .7 ? "wflick" : ""}" x="${wx}" y="${wy}" width="4" height="6" fill="${rnd() > .5 ? "#C99B2E" : "#D13B35"}" opacity="${r2(.25 + rnd() * .4)}"/>`;
      }
    }
    x += w + Math.round(rnd() * 6);
  }
  return out;
}

function pines(base, n, hMin, hMax, color, opacity = 1){
  let out = "";
  for(let i = 0; i < n; i++){
    const x = Math.round(rnd() * W), h = hMin + rnd() * (hMax - hMin), w = h * .38;
    out += `<g class="sway" style="--dl:${r2(-rnd() * 6)}s" opacity="${opacity}"><polygon points="${r2(x - w)},${base} ${x},${r2(base - h)} ${r2(x + w)},${base}" fill="${color}"/>
      <polygon points="${r2(x - w*.8)},${r2(base - h*.35)} ${x},${r2(base - h*1.02)} ${r2(x + w*.8)},${r2(base - h*.35)}" fill="${color}"/></g>`;
  }
  return out;
}

/* clima: partículas com CSS (variáveis --x, --d, --dl, --dx) */
function weather(kind){
  let out = "";
  if(kind === "ash"){
    for(let i = 0; i < 34; i++) out += `<circle class="ash" cx="${Math.round(rnd() * W)}" cy="-6" r="${r2(.8 + rnd() * 1.6)}" fill="#c9c4a8" style="--d:${r2(6 + rnd() * 8)}s;--dl:${r2(-rnd() * 12)}s;--dx:${Math.round(-40 + rnd() * 90)}px"/>`;
  } else if(kind === "rain"){
    for(let i = 0; i < 70; i++){ const x = Math.round(rnd() * (W + 60)); out += `<line class="rain" x1="${x}" y1="-10" x2="${x - 5}" y2="6" stroke="#9aa6ac" stroke-width="1" style="--d:${r2(.45 + rnd() * .4)}s;--dl:${r2(-rnd())}s"/>`; }
  } else if(kind === "embers"){
    for(let i = 0; i < 22; i++) out += `<circle class="ember" cx="${Math.round(rnd() * W)}" cy="${H}" r="${r2(.8 + rnd() * 1.3)}" fill="${rnd() > .5 ? "#e8892d" : "#D13B35"}" style="--d:${r2(5 + rnd() * 6)}s;--dl:${r2(-rnd() * 10)}s;--dx:${Math.round(-30 + rnd() * 60)}px"/>`;
  } else if(kind === "fog"){
    for(let i = 0; i < 4; i++) out += `<rect class="fog" x="${-200 + i * 120}" y="${130 + i * 24}" width="${W + 400}" height="${34 + i * 6}" fill="url(#fogG)" style="--d:${26 + i * 9}s;--dl:${-i * 7}s"/>`;
  }
  return out;
}

function ground(color, dust = "#A82E29"){
  let out = `<rect y="${G}" width="${W}" height="${H - G}" fill="${color}"/>`;
  for(let i = 0; i < 60; i++) out += `<rect x="${Math.round(rnd() * W)}" y="${G + Math.round(rnd() * (H - G))}" width="${4 * (1 + Math.floor(rnd() * 3))}" height="2" fill="${dust}" opacity="${r2(.12 + rnd() * .3)}"/>`;
  return out;
}

const stars = n => Array.from({length:n}, ()=> `<circle class="star" cx="${Math.round(rnd() * W)}" cy="${Math.round(rnd() * 110)}" r="${r2(.6 + rnd() * 1.1)}" fill="#e8e2c4" style="--dl:${r2(-rnd() * 5)}s"/>`).join("");

const flame = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <circle class="fire-glow" r="60" cy="-12" fill="url(#fireG)"/>
  <g class="flame"><polygon points="-12,0 -6,-22 -2,-10 2,-34 8,-12 12,0" fill="#D13B35"/></g>
  <g class="flame f2"><polygon points="-7,0 -2,-16 2,-8 5,-22 8,0" fill="#e8892d"/></g>
  <g class="flame f3"><polygon points="-3,0 0,-10 4,0" fill="#f3d27a"/></g>
</g>`;

const crosses = (xs, y, c = "#0a0907") => xs.map(x => `<g fill="${c}"><rect x="${x}" y="${y - 44}" width="5" height="44"/><rect x="${x - 10}" y="${y - 34}" width="25" height="5"/></g>`).join("");

const ecg = (y, color, flat = false) => {
  const beat = "h40 l8 -4 l8 4 h18 l6 -26 l8 54 l8 -28 h12";
  const d = flat ? "M0 0H800" : "M0 0 " + Array.from({length:8}, ()=> beat).join(" ");
  return `<g transform="translate(0 ${y})" opacity=".8"><path class="ecg${flat ? " flat" : ""}" d="${d}" fill="none" stroke="${color}" stroke-width="2"/></g>`;
};

/* ---------- temas ---------- */
const THEMES = {
  desconhecido: { sky:["#0d1110","#1b2420","#2c3a33"], orb:["moon",600,70,26,"#9aa68a"], far:"#1f2a25", mid:"#121a16", gnd:"#0a0d0b", dust:"#5f7a58", wx:"fog",
    props:()=> `<g class="lamp"><rect x="498" y="104" width="4" height="110" fill="#070907"/><rect x="486" y="100" width="28" height="6" fill="#070907"/>
        <polygon class="lamp-cone" points="492,106 508,106 540,214 460,214" fill="#C99B2E" opacity=".16"/></g>
      ${person(690, G - 4, .55, "#050605")}${survivor(300, G + 4)}` },
  mercado: { sky:["#1a1208","#3b2610","#62401a"], orb:["sun",640,64,32,"#C99B2E"], far:"#4a2f14", mid:"#24180c", gnd:"#0c0a07", dust:"#C99B2E", wx:"ash", win:true,
    props:()=> `<g>
        <rect x="400" y="96" width="290" height="${G - 96}" fill="#120e08"/><polygon points="392,96 698,96 690,84 400,84" fill="#1c150c"/>
        <g class="awning">${Array.from({length:9}, (_, i)=> `<polygon points="${410 + i*30},100 ${440 + i*30},100 ${446 + i*30},124 ${416 + i*30},124" fill="${i % 2 ? "#4a1511" : "#7a6a3a"}" opacity=".85"/>`).join("")}</g>
        <rect x="420" y="130" width="250" height="84" fill="#070605"/>
        <rect x="425" y="135" width="70" height="60" fill="#C99B2E" opacity=".1" class="wflick"/>
        <rect x="520" y="150" width="56" height="64" fill="#030302"/>
        <text x="545" y="78" text-anchor="middle" font-family="Bebas Neue, sans-serif" font-size="34" letter-spacing="4" fill="#C99B2E" class="neon"><tspan>MERC</tspan><tspan class="neon-off">A</tspan><tspan>DO</tspan></text>
        ${zombie(548, G - 2, .62, 4, 1, "#030302")}
      </g>
      <g fill="none" stroke="#0a0907" stroke-width="3"><path d="M330 ${G - 34}h40l-6 24h-30z"/><circle cx="342" cy="${G - 4}" r="4"/><circle cx="362" cy="${G - 4}" r="4"/></g>
      ${survivor(250, G + 4)}` },
  floresta: { sky:["#07100d","#0f2218","#1c3a2a"], orb:["moon",150,60,24,"#aab89a"], far:"#12261c", mid:"#0b1812", gnd:"#050a07", dust:"#4d7a52", wx:"fog",
    props:()=> `${pines(G - 18, 12, 70, 120, "#0d1e16", .8)}${pines(G + 2, 9, 110, 170, "#060d09")}
      ${Array.from({length:10}, ()=> `<circle class="fly" cx="${Math.round(rnd() * W)}" cy="${Math.round(120 + rnd() * 90)}" r="2" fill="#d8e07a" style="--d:${r2(3 + rnd() * 3)}s;--dl:${r2(-rnd() * 5)}s"/>`).join("")}
      ${survivor(300, G + 6)}` },
  abrigo_noturno: { sky:["#04060d","#0a1020","#16203a"], orb:["moon",620,60,24,"#c9c4a8"], far:"#101828", mid:"#080c16", gnd:"#05070b", dust:"#3a4a6a", wx:"embers", stars:60,
    props:()=> `<polygon points="470,${G} 560,112 650,${G}" fill="#0a0d14"/><polygon points="548,${G} 560,150 574,${G}" fill="#C99B2E" opacity=".35" class="wflick"/>
      ${flame(380, G - 2, 1.3)}${survivor(290, G + 4)}${person(445, G, .5, "#050608")}` },
  abrigo: { sky:["#0c0f0a","#1c2416","#33402a"], orb:["sun",130,70,26,"#C99B2E"], far:"#1d2918", mid:"#0f150c", gnd:"#070a05", dust:"#7a8a4a", wx:"ash",
    props:()=> `<polygon points="440,${G} 440,140 540,98 640,140 640,${G}" fill="#0a0d08"/><rect x="590" y="90" width="16" height="38" fill="#0a0d08"/>
      ${Array.from({length:4}, (_, i)=> `<circle class="smoke" cx="598" cy="88" r="${6 + i*2}" fill="#8a8f78" style="--d:${5 + i}s;--dl:${-i * 1.4}s"/>`).join("")}
      <rect class="wflick" x="470" y="160" width="26" height="28" fill="#C99B2E" opacity=".75"/><rect class="wflick" x="584" y="160" width="26" height="28" fill="#C99B2E" opacity=".6" style="--dl:-1.3s"/>
      <rect x="524" y="168" width="32" height="46" fill="#C99B2E" opacity=".32"/>
      <g stroke="#050705" stroke-width="3">${Array.from({length:7}, (_, i)=> `<path d="M${380 + i*12} ${G}v-26"/>`).join("")}</g>
      ${survivor(330, G + 4)}` },
  radio: { sky:["#080b10","#101a24","#1d2f3f"], orb:["moon",120,64,20,"#9aa6ac"], far:"#142230", mid:"#0b131b", gnd:"#05080b", dust:"#46565a", wx:"ash", stars:30,
    props:()=> `<g stroke="#050709" stroke-width="3" fill="none"><path d="M560 ${G}L580 40L600 ${G}"/><path d="M566 ${G - 40}h28M570 ${G - 80}h20M574 ${G - 120}h12M562 ${G - 20}L596 ${G - 70}M598 ${G - 20}L564 ${G - 70}M570 ${G - 90}L590 ${G - 140}"/></g>
      <circle class="beacon" cx="580" cy="40" r="5" fill="#D13B35"/>
      ${[0,1,2].map(i=> `<circle class="ring" cx="580" cy="42" r="14" fill="none" stroke="#9fc4cc" stroke-width="1.5" style="--dl:${-i * 1.1}s"/>`).join("")}
      <rect x="318" y="${G - 22}" width="30" height="18" fill="#050709"/><circle cx="326" cy="${G - 13}" r="4" fill="#46565a"/><rect class="eq" x="334" y="${G - 18}" width="10" height="3" fill="#7bd36a"/>
      ${survivor(270, G + 4)}` },
  resgate: { sky:["#120808","#2e1010","#5a1a16"], orb:["sun",660,120,34,"#D13B35"], far:"#3a1210", mid:"#1c0a09", gnd:"#0b0605", dust:"#D13B35", wx:"embers",
    props:()=> `<circle class="flare" cx="520" cy="62" r="46" fill="url(#fireG)"/><circle class="flare-core" cx="520" cy="62" r="5" fill="#ffd9a0"/>
      <path d="M520 66C514 110 528 150 518 ${G - 60}" stroke="#8a8f78" stroke-width="4" fill="none" opacity=".3" class="trail"/>
      <g class="wave-p">${person(640, G - 6, .6, "#050303")}<rect class="wave" x="636" y="${G - 92}" width="6" height="30" fill="#050303"/></g>
      ${survivor(280, G + 4)}` },
  estrada: { sky:["#0b0d10","#1d2227","#3a3f43"], orb:["sun",400,100,38,"#8a8f78"], far:"#2b3033", mid:"#14171a", gnd:"#0a0b0c", dust:"#5a5f58", wx:"ash",
    props:()=> `<polygon points="388,${G - 40} 412,${G - 40} 760,${H} 40,${H}" fill="#050607"/>
      <g stroke="#c9c4a8" stroke-width="3" opacity=".6">${[0,1,2,3,4].map(i=> `<line class="dash" x1="400" y1="${G - 36}" x2="400" y2="${H}" style="--dl:${-i * .5}s" transform="scale(1 1)"/>`).join("")}</g>
      <g fill="#050607"><rect x="130" y="${G - 40}" width="110" height="34" rx="4"/><polygon points="150,${G - 40} 170,${G - 64} 220,${G - 64} 232,${G - 40}"/><circle cx="160" cy="${G - 6}" r="12"/><circle cx="214" cy="${G - 6}" r="12"/></g>
      <g stroke="#050607" stroke-width="3"><path d="M560 ${G}V80M640 ${G}V92M560 90Q600 110 640 100"/></g>
      ${survivor(400, G + 22, .42)}` },
  rivais: { sky:["#120807","#2a100c","#4d1c14"], orb:["moon",110,60,22,"#D13B35"], far:"#2f1210", mid:"#180a08", gnd:"#090504", dust:"#A82E29", wx:"ash", win:true,
    props:()=> `<g fill="#050303"><rect x="620" y="80" width="10" height="${G - 80}"/><rect x="660" y="80" width="10" height="${G - 80}"/><rect x="606" y="64" width="78" height="22"/></g>
      <g class="sweep" style="transform-origin:645px 76px"><polygon points="645,76 340,150 340,220" fill="#f3d27a" opacity=".13"/></g>
      <circle cx="645" cy="75" r="5" fill="#f3d27a"/>
      <path d="M430 ${G}l14 -40l14 40l14 -40l14 40l14 -40l14 40" stroke="#050303" stroke-width="4" fill="none"/>
      ${person(540, G, .6, "#050303", true)}${person(590, G + 2, .55, "#050303", true)}${survivor(260, G + 4)}` },
  zumbis: { sky:["#140707","#3a0f0d","#6a1c18"], orb:["moon",150,70,30,"#D13B35"], far:"#4a1612", mid:"#240d0b", gnd:"#0a0605", dust:"#A82E29", wx:"fog", win:true,
    props:()=> `${[[430,.55,-4],[500,.7,3],[570,.85,-3],[640,1,5],[720,.75,-5],[470,.62,2]].map((z, i)=> zombie(z[0], G + 2 + (i % 3) * 4, z[1], z[2], i)).join("")}${survivor(250, G + 6)}` },
  escassez: { sky:["#17100a","#3a2512","#6b4220"], orb:["sun",620,100,40,"#e8892d"], far:"#4a2e16", mid:"#241608", gnd:"#0d0a06", dust:"#8a6a3a", wx:"ash",
    props:()=> `<g stroke="#050403" stroke-width="5" fill="none"><path d="M520 ${G}V120M520 150L486 118M520 134L556 104M486 118l-12 -16M556 104l16 -10"/></g>
      ${[0,1,2].map(i=> `<g class="vulture" style="--d:${14 + i*4}s;--dl:${-i*5}s"><path class="flap" d="M-14 0q7 -9 14 0q7 -9 14 0" stroke="#050403" stroke-width="3" fill="none"/></g>`).join("")}
      <g fill="#050403"><rect x="380" y="${G - 8}" width="10" height="8"/><rect x="410" y="${G - 6}" width="10" height="6" transform="rotate(20 415 ${G})"/></g>
      ${survivor(280, G + 4)}` },
  ferido: { sky:["#120606","#2a0c0b","#4a1512"], orb:["moon",640,70,26,"#A82E29"], far:"#32100e", mid:"#190807", gnd:"#090403", dust:"#D13B35", wx:"embers",
    props:()=> `${ecg(46, "#D13B35")}
      ${Array.from({length:8}, ()=> `<circle class="drop" cx="${Math.round(240 + rnd() * 80)}" cy="${Math.round(100 + rnd() * 20)}" r="2.5" fill="#D13B35" style="--d:${r2(2 + rnd() * 2)}s;--dl:${r2(-rnd() * 4)}s"/>`).join("")}
      <g transform="rotate(14 280 ${G}) translate(0 6)">${survivor(280, G)}</g>` },
  final: { sky:["#120b06","#4a2a10","#c9852a"], orb:["sun",400,G - 8,62,"#f3d27a"], far:"#4a2a12", mid:"#1c1008", gnd:"#0a0705", dust:"#C99B2E", wx:"ash", win:true,
    props:()=> `<g class="rays" style="transform-origin:400px ${G - 8}px">${Array.from({length:10}, (_, i)=> `<polygon points="400,${G - 8} ${r2(400 + Math.cos(i * .63 - 3.14) * 600)},${r2(G - 8 + Math.sin(i * .63 - 3.14) * 600)} ${r2(400 + Math.cos(i * .63 - 3.14 + .12) * 600)},${r2(G - 8 + Math.sin(i * .63 - 3.14 + .12) * 600)}" fill="#f3d27a" opacity=".07"/>`).join("")}</g>
      <g fill="#050403"><rect x="360" y="${G - 40}" width="80" height="40"/><polygon points="360,${G - 40} 400,${G - 70} 440,${G - 40}"/><rect class="wflick" x="376" y="${G - 28}" width="10" height="12" fill="#f3d27a"/><rect class="wflick" x="414" y="${G - 28}" width="10" height="12" fill="#f3d27a" style="--dl:-1.1s"/></g>
      ${survivor(250, G + 6)}` },
  death: { sky:["#080808","#141414","#222222"], orb:["moon",600,70,24,"#6a6a60"], far:"#1a1a1a", mid:"#0e0e0e", gnd:"#050505", dust:"#4a4a44", wx:"ash",
    props:()=> `${ecg(46, "#7E866C", true)}${crosses([470, 530, 600], G - 2)}
      ${zombie(700, G, .5, 4, 2, "#030303")}${zombie(160, G, .5, -4, 5, "#030303")}
      <g transform="translate(300 ${G - 4}) rotate(-90) translate(-250 -${G - 4})" opacity=".9">${survivor(250, G - 4, .5)}</g>` },
  trade: { sky:["#0f0b08","#2a1c10","#4e3418"], orb:["sun",130,76,28,"#C99B2E"], far:"#3a2812", mid:"#1c130a", gnd:"#0b0806", dust:"#C99B2E", wx:"ash",
    props:()=> `<g fill="#050403"><rect x="372" y="${G - 34}" width="52" height="34"/></g><path d="M372 ${G - 18}h52M398 ${G - 34}v34" stroke="#C99B2E" stroke-width="2" opacity=".5"/>
      <g class="lantern" style="transform-origin:398px 70px"><line x1="398" y1="70" x2="398" y2="120" stroke="#050403" stroke-width="2"/><circle cx="398" cy="130" r="48" fill="url(#fireG)" opacity=".7" class="fire-glow"/><rect x="391" y="120" width="14" height="18" fill="#f3d27a"/></g>
      ${person(500, G, .62, "#050403")}${survivor(290, G + 4)}` },
  storm: { sky:["#05070a","#0d131a","#1b2630"], orb:null, far:"#121c26", mid:"#090e14", gnd:"#05080b", dust:"#46565a", wx:"rain",
    props:()=> `<g fill="#0a1017">${[60,200,340,480,620,760].map((x, i)=> `<ellipse class="stormcloud" cx="${x}" cy="${40 + (i % 2) * 14}" rx="120" ry="34" style="--dl:${-i * 2}s"/>`).join("")}</g>
      <polygon class="bolt" points="470,50 440,120 462,120 426,196 492,104 468,104 496,50" fill="#e8f2ff"/>
      ${survivor(290, G + 4, .55, "")}` },
  loss: { sky:["#0b0b0c","#1e1818","#3a2b2a"], orb:["moon",620,70,24,"#8a7d72"], far:"#241a1a", mid:"#130e0e", gnd:"#070505", dust:"#7a5a56", wx:"ash",
    props:()=> `${crosses([420, 480, 560], G - 2)}
      <g class="bow">${survivor(300, G + 4)}</g>` }
};
THEMES.start = THEMES.title = THEMES.desconhecido;

function orb(o){
  if(!o) return "";
  const [kind, x, y, r, c] = o;
  return `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="url(#orbG)" style="color:${c}"/><circle class="moon" cx="${x}" cy="${y}" r="${r}" fill="${c}"/>${kind === "moon" ? `<circle cx="${x - r*.3}" cy="${y - r*.25}" r="${r*.22}" fill="#000" opacity=".18"/>` : ""}`;
}

export function buildScene(icon){
  const t = THEMES[icon] || THEMES.desconhecido;
  seed = hash(icon || "x");
  const [s1, s2, s3] = t.sky;
  const oc = t.orb ? t.orb[4] : "#fff";
  const body = `
    <defs>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset=".55" stop-color="${s2}"/><stop offset="1" stop-color="${s3}"/></linearGradient>
      <radialGradient id="orbG"><stop offset="0" stop-color="${oc}" stop-opacity=".5"/><stop offset="1" stop-color="${oc}" stop-opacity="0"/></radialGradient>
      <radialGradient id="fireG"><stop offset="0" stop-color="#e8892d" stop-opacity=".6"/><stop offset="1" stop-color="#e8892d" stop-opacity="0"/></radialGradient>
      <linearGradient id="fogG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c4a8" stop-opacity="0"/><stop offset=".5" stop-color="#c9c4a8" stop-opacity=".13"/><stop offset="1" stop-color="#c9c4a8" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#skyG)"/>
    ${t.stars ? stars(t.stars) : ""}
    ${orb(t.orb)}
    <path class="cloud" d="M300 54 q60 -14 130 4 t110 -6 v14 q-60 10 -120 0 t-120 -2z" fill="#000" opacity=".4"/>
    <g class="par p1">${skyline(G - 6, 30, 110, t.far, [22, 42], false)}</g>
    <g class="par p2">${skyline(G + 2, 34, 130, t.mid, [26, 52], t.win)}</g>
    ${ground(t.gnd, t.dust)}
    ${t.props()}
    ${weather(t.wx)}
    ${icon === "storm" ? `<rect class="flash" width="${W}" height="${H}" fill="#cfe4ff"/>` : ""}`;
  return body;
}

export function sceneHTML(icon){
  return `<svg class="hero-art scene-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${buildScene(icon)}</svg>`;
}
