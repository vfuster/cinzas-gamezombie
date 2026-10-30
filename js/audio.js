/* ===========================================================
   ÁUDIO — trilha de tensão (sintetizada, sem arquivos)
   Progressão em lá menor com bateria, baixo pulsante e arpejo,
   sobre um pad e um reverb gerado na hora. As notas são agendadas
   com antecedência (lookahead) para o ritmo não oscilar.
=========================================================== */
let audioCtx = null, masterGain = null, reverbSend = null, noiseBuf = null, musicOn = false;
let schedTimer = null, stingerTimeout = null;
let step = 0, nextStepTime = 0;

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

/* Progressão em lá menor (notas MIDI): Am – F – Dm – Em – Am – C – F – E */
const CHORDS = [
  { bass:33, notes:[57,60,64] },   // Am
  { bass:29, notes:[57,60,65] },   // F
  { bass:26, notes:[57,62,65] },   // Dm
  { bass:28, notes:[55,59,64] },   // Em
  { bass:33, notes:[57,60,64] },   // Am
  { bass:36, notes:[55,60,64] },   // C
  { bass:29, notes:[57,60,65] },   // F
  { bass:28, notes:[56,59,64] }    // E (tensão antes de voltar)
];

const BPM = 104;
const STEP = 60 / BPM / 4;          // semicolcheia
const STEPS_PER_CHORD = 32;         // 2 compassos por acorde
const INTRO_STEPS = 32;             // primeiro acorde sem bateria
const LOOKAHEAD = 0.12;             // segundos agendados à frente

/* Padrões de 16 passos (um compasso) */
const KICK  = [1,0,0,0, 0,0,0,0, 1,0,1,0, 0,0,0,0];
const SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1];
const HAT   = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,1];
const ARP   = [0,1,2,1, 0,2,1,2, 0,1,2,3, 2,1,0,1]; // índices nas notas do acorde (3 = oitava acima)

function makeReverb(){
  const len = audioCtx.sampleRate * 2.6;
  const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
  for(let c=0;c<2;c++){
    const d = buf.getChannelData(c);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.8);
  }
  const conv = audioCtx.createConvolver();
  conv.buffer = buf;
  return conv;
}

function initAudio(){
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.0001;
  const comp = audioCtx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 4;
  masterGain.connect(comp); comp.connect(audioCtx.destination);

  const reverb = makeReverb();
  const wet = audioCtx.createGain(); wet.gain.value = 0.5;
  reverb.connect(wet); wet.connect(masterGain);
  reverbSend = audioCtx.createGain(); reverbSend.gain.value = 1;
  reverbSend.connect(reverb);

  noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
}

/* Liga um nó ao mix seco e, opcionalmente, ao reverb */
function out(node, send = 0){
  node.connect(masterGain);
  if(send){ const s = audioCtx.createGain(); s.gain.value = send; node.connect(s); s.connect(reverbSend); }
}

/* ---------- instrumentos ---------- */
function pad(c, t){
  const dur = STEPS_PER_CHORD * STEP;
  c.notes.forEach(n=>{
    const osc = audioCtx.createOscillator(); osc.type = 'sawtooth';
    osc.frequency.value = mtof(n); osc.detune.value = (Math.random()-0.5) * 14;
    const f = audioCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.6);
    g.gain.setValueAtTime(0.035, t + dur - 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.3);
    osc.connect(f); f.connect(g); out(g, 0.8);
    osc.start(t); osc.stop(t + dur + 0.4);
  });
}

function bass(m, t, accent){
  const osc = audioCtx.createOscillator(); osc.type = 'sawtooth';
  osc.frequency.value = mtof(m);
  const f = audioCtx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6;
  f.frequency.setValueAtTime(accent ? 900 : 600, t);
  f.frequency.exponentialRampToValueAtTime(140, t + STEP * 1.8);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(accent ? 0.32 : 0.24, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + STEP * 1.9);
  osc.connect(f); f.connect(g); out(g);
  osc.start(t); osc.stop(t + STEP * 2);
}

function arp(m, t, vel){
  const osc = audioCtx.createOscillator(); osc.type = 'square';
  osc.frequency.value = mtof(m);
  const f = audioCtx.createBiquadFilter(); f.type = 'lowpass';
  f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.12);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.045 * vel, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(f); f.connect(g); out(g, 0.6);
  osc.start(t); osc.stop(t + 0.18);
}

function kick(t){
  const osc = audioCtx.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
  osc.connect(g); out(g);
  osc.start(t); osc.stop(t + 0.4);
}

function noiseHit(t, type, freq, peak, dur, send){
  const src = audioCtx.createBufferSource(); src.buffer = noiseBuf;
  const f = audioCtx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); out(g, send);
  src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
}

function snare(t){
  noiseHit(t, 'bandpass', 1800, 0.35, 0.18, 0.5);
  const osc = audioCtx.createOscillator(); osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, t); osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  osc.connect(g); out(g);
  osc.start(t); osc.stop(t + 0.12);
}

const hat = (t, open) => noiseHit(t, 'highpass', 7000, open ? 0.09 : 0.06, open ? 0.22 : 0.04, 0);

/* ---------- sequenciador ---------- */
function playStep(i, t){
  const c = CHORDS[Math.floor(i / STEPS_PER_CHORD) % CHORDS.length];
  const s = i % 16;
  const inChord = i % STEPS_PER_CHORD;
  const drums = i >= INTRO_STEPS;

  if(inChord === 0) pad(c, t);
  if(s % 2 === 0) bass(c.bass + (s === 6 || s === 14 ? 12 : 0), t, s === 0);
  const arpNotes = [...c.notes, c.notes[0] + 12];
  arp(arpNotes[ARP[s]] + 12, t, s % 4 === 0 ? 1 : 0.7);

  if(drums){
    if(KICK[s]) kick(t);
    if(SNARE[s]) (s === 15 ? noiseHit(t, 'bandpass', 2400, 0.12, 0.08, 0.3) : snare(t));
    if(HAT[s]) hat(t, s === 15);
    // virada no fim de cada ciclo de 2 acordes
    if(inChord >= 28 && Math.floor(i / STEPS_PER_CHORD) % 2 === 1) snare(t);
  }
}

function scheduler(){
  while(nextStepTime < audioCtx.currentTime + LOOKAHEAD){
    playStep(step, nextStepTime);
    step++;
    nextStepTime += STEP;
  }
}

/* Estrondo grave e raro, para quebrar a repetição */
function playStinger(){
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator(); osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140 + Math.random()*50, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 2.2);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 260;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
  osc.connect(filter); filter.connect(g); out(g, 1);
  osc.start(t); osc.stop(t + 2.5);
}

function scheduleStinger(){
  if(!musicOn) return;
  stingerTimeout = setTimeout(()=>{
    playStinger();
    scheduleStinger();
  }, 30000 + Math.random()*30000);
}

export function toggleMusic(){
  if(!audioCtx){ initAudio(); }
  musicOn = !musicOn;
  const now = audioCtx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  if(musicOn){
    audioCtx.resume();
    masterGain.gain.linearRampToValueAtTime(0.2, now + 1.2);
    step = 0; nextStepTime = now + 0.1;
    schedTimer = setInterval(scheduler, 25);
    scheduleStinger();
  } else {
    masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
    clearInterval(schedTimer); clearTimeout(stingerTimeout);
  }
  const btn = document.getElementById("musicBtn");
  btn.textContent = musicOn ? "♪ SOM: ON" : "♪ SOM: OFF";
  btn.classList.toggle("on", musicOn);
}

export function isMusicOn(){ return musicOn; }
