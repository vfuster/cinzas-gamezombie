/* Álbum de finais: cada episódio tem finais (nós do ato 3). Quem chega a um, ele fica registrado (IndexedDB, via storage.js). */

import { EPISODES } from './episodes.js';
import { kvList, kvSet, kvClear } from './storage.js';

const seenSet = async ()=> new Set((await kvList("album:")).map(r => r.k.slice(6)));

/* Quantos caminhos (escolhas) levam a um nó, contando desde o início do episódio. */
function pathsTo(ep, target){
  const walk = id => {
    if(id === target) return 1;
    const n = ep.nodes[id];
    return n.choices.reduce((sum, c) => sum + (c.next ? walk(c.next) : 0), 0);
  };
  return walk(ep.start);
}

export async function albumView(){
  const seen = await seenSet();
  return EPISODES.map(ep => ({
    id: ep.id, name: ep.name,
    endings: Object.entries(ep.nodes).filter(([, n]) => n.act === 3).map(([id, n]) => ({
      key: `${ep.id}:${id}`, icon: n.icon, title: n.title, text: n.text,
      seen: seen.has(`${ep.id}:${id}`), paths: pathsTo(ep, id)
    }))
  }));
}

export async function totals(){
  const all = (await albumView()).flatMap(e => e.endings);
  return { seen: all.filter(e => e.seen).length, total: all.length };
}

/* Chamar quando o jogador chega a um final. `isNew` diz se é a primeira vez. */
export async function markEnding(key){
  const isNew = !(await seenSet()).has(key);
  if(isNew) await kvSet("album:" + key, Date.now());
  return { isNew, ...(await totals()) };
}

export async function revealAll(){ for(const e of await albumView()) for(const x of e.endings) await kvSet("album:" + x.key, Date.now()); }
export const resetAlbum = ()=> kvClear("album:");

/* Percorre um episódio ao acaso até o final; devolve a chave do final alcançado e o caminho. */
export function randomWalk(){
  const ep = EPISODES[Math.floor(Math.random() * EPISODES.length)];
  let id = ep.start; const path = [];
  while(true){
    const n = ep.nodes[id];
    if(n.act === 3) return { key: `${ep.id}:${id}`, ep: ep.name, title: n.title, path };
    const c = n.choices[Math.floor(Math.random() * n.choices.length)];
    path.push(n.title); id = c.next;
  }
}
