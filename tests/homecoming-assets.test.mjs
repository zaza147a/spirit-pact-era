import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {HOMECOMING_ADVENTURES} from '../dist/homecoming-adventures.js';
import {HOMECOMING_OPPONENTS,HOMECOMING_ENCOUNTERS,homecomingOpponent} from '../dist/homecoming-encounters.js';
import {HOMECOMING_SCENE_ART,renderHomecomingArt} from '../dist/homecoming-art.js';
import {DAWN_BOSS,DAWN_MONSTERS} from '../dist/dawn-world.js';
function checkWebp(src){const file=new URL('../dist/'+src,import.meta.url),buf=readFileSync(file);assert.equal(buf.toString('ascii',0,4),'RIFF');assert.equal(buf.toString('ascii',8,12),'WEBP');assert.ok(statSync(file).size>2000);assert.ok(statSync(file).size<550000);}
test('twelve unique scene images exist and every route renders the correct scene',()=>{
 assert.equal(new Set(Object.values(HOMECOMING_SCENE_ART).map(a=>a.src)).size,12);
 for(const r of HOMECOMING_ROUTES){const art=HOMECOMING_SCENE_ART[r.id];checkWebp(art.src);assert.ok(renderHomecomingArt(r.id,'').includes(art.src));}
 assert.equal(renderHomecomingArt('unknown',''), '');
});
test('every combat node maps to a real opponent, peaceful nodes do not add battles',()=>{
 let nodes=0;
 for(const r of HOMECOMING_ROUTES)for(const [id,n] of Object.entries(HOMECOMING_ADVENTURES[r.id].nodes)){
 const foe=homecomingOpponent(r.id,id);assert.equal(!!foe,!!n.combat,r.id+':'+id);
 if(foe){nodes++;assert.equal(foe.boss,n.location==='boss');assert.ok(renderHomecomingArt(r.id,id).includes(foe.artPath));}
 }
 assert.equal(nodes,8);assert.equal(Object.keys(HOMECOMING_OPPONENTS).length,7);
 for(const [r,nodes] of Object.entries(HOMECOMING_ENCOUNTERS))for(const id of Object.keys(nodes))assert.ok(HOMECOMING_ADVENTURES[r].nodes[id].combat);
});
test('sprites use real alpha, sane draft stats and do not inherit Dawn loot flags',()=>{
 for(const foe of Object.values(HOMECOMING_OPPONENTS)){
 checkWebp(foe.artPath);const b=readFileSync(new URL('../dist/'+foe.artPath,import.meta.url));
 assert.equal(b.toString('ascii',12,16),'VP8X');assert.ok(b[20]&16,'missing alpha feature');
 for(const stat of ['hp','atk','def'])assert.ok(Number.isFinite(foe[stat])&&foe[stat]>0);
 assert.equal(foe.dawn,false);assert.equal(foe.capture,false);assert.equal(foe.xp,0);assert.equal(foe.gold,0);assert.deepEqual(foe.drops,[]);assert.equal(foe.junkId,null);
 }
 assert.equal(HOMECOMING_OPPONENTS.master.nonlethal,true);
});
test('post-Dawn opponents exceed the corresponding Dawn monster stat budget',()=>{
 for(const foe of Object.values(HOMECOMING_OPPONENTS)){
  const reference=foe.boss?DAWN_BOSS:DAWN_MONSTERS[2];
  for(const stat of ['hp','atk','def'])assert.ok(foe[stat]>reference[stat],foe.name+' '+stat+' must exceed Dawn');
 }
});
