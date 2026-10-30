/* Compartilhamento do resultado: texto + imagem (cartão gerado em canvas).
   Ordem de tentativa: Web Share com imagem → Web Share só texto → copiar texto. */

const W = 1080, H = 1350, GROUND = 900;

let seed = 11;
const rnd = ()=> (seed = (seed * 16807) % 2147483647) / 2147483647;

const SITE_URL = ()=> location.origin + location.pathname.replace(/[^/]*$/, "");

/* `daily` ("30/10") marca o resultado como do desafio do dia; o formato é lido por js/daily.js. */
export function buildShareText({ name, day, cause, daily }, withUrl = true){
  if(daily){
    const causa = cause ? ` — derrubado por ${cause}.` : ".";
    return `☠ Desafio CINZAS ${daily} · ${name || "Sobrevivente"} · DIA ${day}${causa} Consegue passar?` + (withUrl ? ` ${SITE_URL()}` : "");
  }
  const dias = day === 1 ? "1 dia" : `${day} dias`;
  const causa = cause ? ` Fui derrubado por: ${cause}.` : "";
  return `☠ Sobrevivi ${dias} em CINZAS.${causa} Consegue durar mais que eu?` + (withUrl ? ` ${SITE_URL()}` : "");
}

/* Cartão 1080×1350 no mesmo clima da tela inicial: céu vermelho, ruínas e zumbis. */
export async function drawShareCard({ name, day, cause, daily }){
  await Promise.all([
    document.fonts.load("100px 'Bebas Neue'"),
    document.fonts.load("600 30px 'IBM Plex Mono'")
  ]).catch(()=>{});

  seed = 11;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const spaced = (px)=>{ if("letterSpacing" in ctx) ctx.letterSpacing = px + "px"; };

  // céu
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, "#1a0c0a"); sky.addColorStop(.55, "#4a1511"); sky.addColorStop(1, "#7a2420");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // lua
  const glow = ctx.createRadialGradient(800, 260, 10, 800, 260, 300);
  glow.addColorStop(0, "rgba(209,59,53,.55)"); glow.addColorStop(1, "rgba(209,59,53,0)");
  ctx.fillStyle = glow; ctx.fillRect(400, 0, 680, 600);
  ctx.fillStyle = "#D13B35"; ctx.beginPath(); ctx.arc(800, 260, 90, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(168,46,41,.7)";
  ctx.beginPath(); ctx.arc(772, 238, 18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(826, 286, 12, 0, Math.PI * 2); ctx.fill();

  // prédios em 3 camadas (longe → perto)
  [{ base:GROUND - 20, min:80, max:300, c:"#5a1a16", w:[50,90] },
   { base:GROUND - 4,  min:100, max:360, c:"#2a0f0d", w:[60,110], win:true },
   { base:GROUND + 20, min:70, max:230, c:"#12100c", w:[70,130], win:true }].forEach(L=>{
    let x = -20;
    while(x < W){
      const w = Math.round(L.w[0] + rnd() * (L.w[1] - L.w[0]));
      const h = Math.round(L.min + rnd() * (L.max - L.min));
      const y = L.base - h;
      ctx.fillStyle = L.c; ctx.fillRect(x, y, w, h + 80);
      if(rnd() > .55) ctx.fillRect(x + w * .3, y - 22, 8, 22);
      if(L.win){
        for(let wy = y + 20; wy < L.base - 10; wy += 30)
          for(let wx = x + 12; wx < x + w - 16; wx += 24)
            if(rnd() > .84){ ctx.fillStyle = rnd() > .5 ? "rgba(201,155,46,.45)" : "rgba(209,59,53,.45)"; ctx.fillRect(wx, wy, 8, 12); }
      }
      x += w + Math.round(rnd() * 10);
    }
  });

  // chão
  ctx.fillStyle = "#0b0a08"; ctx.fillRect(0, GROUND, W, H - GROUND);
  for(let i = 0; i < 90; i++){
    ctx.fillStyle = `rgba(168,46,41,${(.1 + rnd() * .25).toFixed(2)})`;
    ctx.fillRect(rnd() * W, GROUND + rnd() * 120, 8 * (1 + Math.floor(rnd() * 3)), 3);
  }

  // silhuetas: sobrevivente de costas e zumbis
  ctx.fillStyle = "#050504";
  const zombie = (x, s)=>{
    ctx.save(); ctx.translate(x, GROUND + 10); ctx.scale(s, s);
    ctx.fillRect(-10, -40, 8, 40); ctx.fillRect(3, -40, 8, 40);
    ctx.fillRect(-13, -92, 26, 54); ctx.fillRect(-9, -116, 18, 22);
    ctx.save(); ctx.translate(13, -88); ctx.rotate(-.6); ctx.fillRect(0, 0, 8, 44); ctx.restore();
    ctx.save(); ctx.translate(-13, -88); ctx.rotate(.85); ctx.fillRect(-8, 0, 8, 44); ctx.restore();
    ctx.restore();
  };
  [[640,1.5],[740,1.9],[860,1.3],[960,2.1],[560,1.1]].forEach(z => zombie(...z));
  ctx.save(); ctx.translate(250, GROUND + 14); ctx.scale(2.3, 2.3);
  ctx.fillRect(-14, -78, 12, 78); ctx.fillRect(2, -78, 12, 78);
  ctx.fillRect(-22, -160, 44, 86); ctx.fillRect(-14, -194, 28, 34);
  ctx.fillStyle = "#7a2420"; ctx.fillRect(-18, -150, 36, 8);
  ctx.fillStyle = "#050504"; ctx.save(); ctx.translate(26, -190); ctx.rotate(.14); ctx.fillRect(0, 0, 6, 120); ctx.restore();
  ctx.restore();

  // título e número grande
  ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#C9C4A8";
  ctx.font = "600 30px 'IBM Plex Mono', monospace"; spaced(8);
  ctx.fillText("> CINZAS", 70, 100);
  ctx.fillStyle = "#858875"; ctx.font = "500 24px 'IBM Plex Mono', monospace"; spaced(4);
  ctx.fillText(daily ? `DESAFIO DO DIA · ${daily}` : "RELATÓRIO DE SOBREVIVÊNCIA", 70, 142);

  ctx.fillStyle = "#C9C4A8"; ctx.font = "120px 'Bebas Neue', sans-serif"; spaced(10);
  ctx.fillText("SOBREVIVI", 70, 520);
  ctx.fillStyle = "#D13B35"; ctx.shadowColor = "rgba(209,59,53,.55)"; ctx.shadowBlur = 40;
  ctx.font = "420px 'Bebas Neue', sans-serif"; spaced(6);
  ctx.fillText(String(day).padStart(2, "0"), 62, 880);
  ctx.shadowBlur = 0;
  const numW = ctx.measureText(String(day).padStart(2, "0")).width; // ainda com a fonte de 420px
  ctx.fillStyle = "#C9C4A8"; ctx.font = "120px 'Bebas Neue', sans-serif"; spaced(10);
  ctx.fillText(day === 1 ? "DIA" : "DIAS", 62 + numW + 24, 880);

  // rodapé: nome, causa e chamada
  ctx.fillStyle = "#C9C4A8"; ctx.font = "600 44px 'IBM Plex Mono', monospace"; spaced(6);
  ctx.fillText(String(name || "SOBREVIVENTE").toUpperCase().slice(0, 22), 70, 1050);
  if(cause){
    ctx.fillStyle = "#D13B35"; ctx.font = "500 30px 'IBM Plex Mono', monospace"; spaced(4);
    ctx.fillText("CAUSA: " + cause.toUpperCase(), 70, 1104);
  }
  ctx.fillStyle = "#C99B2E"; ctx.font = "600 34px 'IBM Plex Mono', monospace"; spaced(8);
  ctx.fillText("CONSEGUE DURAR MAIS?", 70, 1230);
  ctx.fillStyle = "#858875"; ctx.font = "500 24px 'IBM Plex Mono', monospace"; spaced(3);
  ctx.fillText(SITE_URL().replace(/^https?:\/\//, "").slice(0, 48), 70, 1290);

  // scanlines + vinheta
  ctx.fillStyle = "rgba(0,0,0,.18)";
  for(let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  const vig = ctx.createRadialGradient(W / 2, H / 2, 380, W / 2, H / 2, 900);
  vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,.6)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(201,196,168,.35)"; ctx.lineWidth = 2; ctx.strokeRect(24, 24, W - 48, H - 48);

  return c;
}

const toBlob = canvas => new Promise(res => canvas.toBlob(res, "image/png"));

export async function downloadCard(data){
  const blob = await toBlob(await drawShareCard(data));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `cinzas-dia-${data.day}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(a.href), 2000);
}

export async function copyText(data){
  try{ await navigator.clipboard.writeText(buildShareText(data)); return true; }catch{ return false; }
}

export function whatsappUrl(data){
  return "https://wa.me/?text=" + encodeURIComponent(buildShareText(data));
}

/* Retorna "shared", "cancelled", "copied" ou "failed". */
export async function shareResult(data){
  const title = "CINZAS";
  const isAbort = e => e && e.name === "AbortError";

  if(navigator.canShare){
    try{
      const file = new File([await toBlob(await drawShareCard(data))], `cinzas-dia-${data.day}.png`, { type:"image/png" });
      if(navigator.canShare({ files:[file] })){
        await navigator.share({ files:[file], title, text:buildShareText(data) });
        return "shared";
      }
    }catch(e){ if(isAbort(e)) return "cancelled"; }
  }
  if(navigator.share){
    try{ await navigator.share({ title, text:buildShareText(data, false), url:SITE_URL() }); return "shared"; }
    catch(e){ if(isAbort(e)) return "cancelled"; }
  }
  return (await copyText(data)) ? "copied" : "failed";
}
