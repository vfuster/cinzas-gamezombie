import { state } from './state.js';

/* ===========================================================
   QUADRO DE SOBREVIVENTES (local ao navegador, via IndexedDB)
=========================================================== */
const DB_NAME = "cinzas";
const STORE = "leaderboard";
let dbPromise = null;

function openDb(){
  if(dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject)=>{
    if(typeof indexedDB === "undefined"){ reject(new Error("sem IndexedDB")); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = ()=>{
      const store = req.result.createObjectStore(STORE, { keyPath:"id", autoIncrement:true });
      store.createIndex("day", "day");
    };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  }).catch(()=> null);
  return dbPromise;
}

export async function fetchLeaderboard(){
  const db = await openDb();
  if(!db) return null;
  return new Promise(resolve=>{
    const docs = [];
    // percorre o índice de dias do maior para o menor
    const req = db.transaction(STORE, "readonly").objectStore(STORE).index("day").openCursor(null, "prev");
    req.onsuccess = ()=>{
      const cur = req.result;
      if(cur && docs.length < 6){ docs.push(cur.value); cur.continue(); }
      else resolve(docs);
    };
    req.onerror = ()=> resolve(null);
  });
}

export async function submitToLeaderboard(cause){
  const db = await openDb();
  if(!db) return;
  return new Promise(resolve=>{
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add({
      name: state.name,
      day: state.day,
      cause: cause || "",
      ts: Date.now()
    });
    tx.oncomplete = tx.onerror = tx.onabort = ()=> resolve();
  });
}

/* ===========================================================
   RECORDE PESSOAL (local ao navegador de quem joga)
=========================================================== */
export async function loadRecord(){
  try{
    const raw = localStorage.getItem("cinzas:recorde");
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
export async function saveRecord(day, cause){
  try{
    const current = await loadRecord();
    if(!current || day > current.day){
      localStorage.setItem("cinzas:recorde", JSON.stringify({day, cause}));
    }
  }catch(e){ /* silencioso */ }
}
