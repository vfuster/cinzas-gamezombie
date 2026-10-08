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

export function renderIllustration(key){
  const icon = ICONS[key] || ICONS.title;
  return `<div class="illustration tone-${icon.tone}">${icon.svg}</div>`;
}
