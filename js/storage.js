import { state } from './state.js';

/* ===========================================================
   QUADRO DE SOBREVIVENTES (compartilhado, via capability db)
=========================================================== */
let dbNS; // undefined = ainda não resolvido, null = indisponível

async function getDb(){
  if(dbNS !== undefined) return dbNS;
  try{
    if(window.claude && typeof window.claude.use === "function"){
      dbNS = await window.claude.use("db");
    } else {
      dbNS = null;
    }
  }catch(e){ dbNS = null; }
  return dbNS;
}


export async function fetchLeaderboard(){
  const db = await getDb();
  if(!db) return null;
  try{
    const snap = await db.collection("leaderboard").orderBy("day","desc").limit(30).get();
    let docs = snap.docs.map(d=>d.data()).filter(d=>d && d.name);
    docs.sort((a,b)=> (b.day||0) - (a.day||0));
    return docs.slice(0,6);
  }catch(e){ return null; }
}

export async function submitToLeaderboard(cause){
  const db = await getDb();
  if(!db) return;
  try{
    await db.collection("leaderboard").add({
      name: state.name,
      day: state.day,
      cause: cause || "",
      ts: Date.now()
    });
  }catch(e){ /* silencioso */ }
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
