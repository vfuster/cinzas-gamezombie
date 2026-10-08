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

export function toggleMusic(){
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

export function isMusicOn(){ return musicOn; }
