/* ===========================================================
   ÁUDIO — trilha ambiente de suspense (sintetizada, sem arquivos)
   Pad harmônico em progressão lenta + notas esparsas de melodia,
   tudo passando por um reverb gerado na hora.
=========================================================== */
let audioCtx = null, masterGain = null, reverbSend = null, musicOn = false;
let chordTimeout = null, noteTimeout = null, stingerTimeout = null, chordIdx = 0;

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

/* Progressão em lá menor (notas MIDI): Am – F – Dm – Em/G – Am – C – F – E */
const CHORDS = [
  { bass:33, notes:[57,60,64] },   // Am
  { bass:29, notes:[57,60,65] },   // F
  { bass:26, notes:[57,62,65] },   // Dm
  { bass:31, notes:[55,59,64] },   // Em
  { bass:33, notes:[57,60,64] },   // Am
  { bass:36, notes:[55,60,64] },   // C
  { bass:29, notes:[57,60,65] },   // F
  { bass:28, notes:[56,59,64] }    // E (tensão antes de voltar)
];
/* Escala para a melodia: lá menor natural, uma oitava e meia */
const SCALE = [69,72,74,76,79,81,84];
const CHORD_LEN = 9;      // segundos por acorde

function makeReverb(){
  const len = audioCtx.sampleRate * 3.5;
  const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
  for(let c=0;c<2;c++){
    const d = buf.getChannelData(c);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.6);
  }
  const conv = audioCtx.createConvolver();
  conv.buffer = buf;
  return conv;
}

function initAudio(){
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.0001;
  masterGain.connect(audioCtx.destination);

  const reverb = makeReverb();
  const wet = audioCtx.createGain(); wet.gain.value = 0.7;
  reverb.connect(wet); wet.connect(masterGain);
  reverbSend = audioCtx.createGain(); reverbSend.gain.value = 1;
  reverbSend.connect(reverb);
}

/* Uma voz com envelope lento, enviada ao mix seco e ao reverb */
function voice(freq, type, t, dur, peak, attack, cutoff){
  const osc = audioCtx.createOscillator(); osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = (Math.random()-0.5) * 14;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = cutoff; filter.Q.value = 0.7;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + dur - attack);
  g.gain.linearRampToValueAtTime(0.0001, t + dur + attack);
  osc.connect(filter); filter.connect(g);
  g.connect(masterGain); g.connect(reverbSend);
  osc.start(t); osc.stop(t + dur + attack + 0.1);
}

function playChord(){
  const c = CHORDS[chordIdx % CHORDS.length];
  chordIdx++;
  const t = audioCtx.currentTime + 0.05;
  const dur = CHORD_LEN + 2;               // sobrepõe o próximo acorde
  voice(mtof(c.bass), 'sine', t, dur, 0.5, 3, 300);
  voice(mtof(c.bass + 12), 'triangle', t, dur, 0.12, 3, 500);
  c.notes.forEach(n=>{
    voice(mtof(n), 'sawtooth', t, dur, 0.05, 3.5, 700);
    voice(mtof(n), 'triangle', t, dur, 0.10, 3.5, 900);
  });
}

function scheduleChords(){
  if(!musicOn) return;
  playChord();
  chordTimeout = setTimeout(scheduleChords, CHORD_LEN * 1000);
}

/* Nota solta, suave, com decaimento longo (tipo sino abafado) */
function playNote(){
  const t = audioCtx.currentTime + 0.05;
  const m = SCALE[Math.floor(Math.random()*SCALE.length)];
  const osc = audioCtx.createOscillator(); osc.type = 'sine';
  osc.frequency.value = mtof(m);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
  osc.connect(g); g.connect(masterGain); g.connect(reverbSend);
  osc.start(t); osc.stop(t + 4.6);
}

function scheduleNotes(){
  if(!musicOn) return;
  noteTimeout = setTimeout(()=>{
    if(Math.random() < 0.75) playNote();
    scheduleNotes();
  }, 2500 + Math.random()*5500);
}

/* Estrondo grave e raro, para quebrar a calma */
function playStinger(){
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator(); osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140 + Math.random()*50, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 2.2);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 260;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
  osc.connect(filter); filter.connect(g);
  g.connect(masterGain); g.connect(reverbSend);
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
    masterGain.gain.linearRampToValueAtTime(0.14, now+2);
    scheduleChords(); scheduleNotes(); scheduleStinger();
  } else {
    masterGain.gain.linearRampToValueAtTime(0.0001, now+0.8);
    clearTimeout(chordTimeout); clearTimeout(noteTimeout); clearTimeout(stingerTimeout);
  }
  const btn = document.getElementById("musicBtn");
  btn.textContent = musicOn ? "♪ SOM: ON" : "♪ SOM: OFF";
  btn.classList.toggle("on", musicOn);
}

export function isMusicOn(){ return musicOn; }
