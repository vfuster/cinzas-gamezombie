import { toggleMusic } from './audio.js';
import { loadRecord } from './storage.js';
import { renderStart } from './ui.js';

document.getElementById("musicBtn").onclick = toggleMusic;

(async function init(){
  const record = await loadRecord();
  renderStart(record);
})();
