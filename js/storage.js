import { state } from './state.js';

/* ===========================================================
   QUADRO DE SOBREVIVENTES (local ao navegador, via IndexedDB)
=========================================================== */
const DB_NAME = "cinzas";
const STORE = "leaderboard";
const KV = "kv";           // chave/valor: desafio do dia e álbum de finais
const DB_VERSION = 2;
let dbPromise = null;

function openDb(){
  if(dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject)=>{
    if(typeof indexedDB === "undefined"){ reject(new Error("sem IndexedDB")); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = ()=>{
      const db = req.result;
      if(!db.objectStoreNames.contains(STORE)){
        const store = db.createObjectStore(STORE, { keyPath:"id", autoIncrement:true });
        store.createIndex("day", "day");
      }
      if(!db.objectStoreNames.contains(KV)) db.createObjectStore(KV, { keyPath:"k" });
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

/* ===========================================================
   CHAVE/VALOR (desafio do dia e álbum). Sem IndexedDB, guarda só em memória.
=========================================================== */
const mem = new Map();
const range = prefix => IDBKeyRange.bound(prefix, prefix + "\uffff");
const run = (db, mode, fn) => new Promise(resolve=>{
  const tx = db.transaction(KV, mode);
  let out = null;
  try{ out = fn(tx.objectStore(KV)); }catch(e){ resolve(null); return; }
  tx.oncomplete = ()=> resolve(out && "result" in out ? out.result : null);
  tx.onerror = tx.onabort = ()=> resolve(null);
});

export async function kvGet(k){
  const db = await openDb();
  if(!db) return mem.has(k) ? mem.get(k) : null;
  const rec = await run(db, "readonly", st => st.get(k));
  return rec ? rec.v : null;
}
export async function kvSet(k, v){
  const db = await openDb();
  if(!db){ mem.set(k, v); return; }
  await run(db, "readwrite", st => st.put({ k, v }));
}
/* Todos os registros cujas chaves começam com `prefix`: [{k, v}] */
export async function kvList(prefix){
  const db = await openDb();
  if(!db) return [...mem].filter(([k]) => k.startsWith(prefix)).map(([k, v]) => ({ k, v }));
  return (await run(db, "readonly", st => st.getAll(range(prefix)))) || [];
}
export async function kvClear(prefix){
  const db = await openDb();
  if(!db){ [...mem.keys()].filter(k => k.startsWith(prefix)).forEach(k => mem.delete(k)); return; }
  await run(db, "readwrite", st => st.delete(range(prefix)));
}
