import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
const read=p=>JSON.parse(readFileSync(new URL('../docs/'+p,import.meta.url),'utf8'));
test('full 2400 five-boss audit preserves every legal triplet and every failure without hiding weak configurations',()=>{
 const d=read('five-boss-full-skill-matrix.json');
 assert.equal(d.count,2400);assert.equal(d.rows.length,2400);assert.equal(d.regressions.length,0);
 assert.ok(d.wins>=d.baselineWins);assert.equal(d.wins,d.rows.filter(r=>r.won).length);
 assert.equal(d.failed.length,d.rows.filter(r=>!r.won).length);
 for(const job of Object.keys(SECOND_JOBS))for(const pair of Object.keys(FUSION_PAIRS)){
  const a=d.rows.filter(r=>r.job===job&&r.pair===pair);assert.equal(a.length,20,job+'/'+pair);
  assert.equal(new Set(a.map(r=>r.choice.join(','))).size,20);
  assert.ok(a.some(r=>r.won),job+'/'+pair+' needs at least one usable configuration');
  for(const r of a){assert.equal(r.seed,731);assert.ok(r.sourceCommit?.length===40);assert.equal(r.choice.length,3);
   assert.equal(new Set(r.choice).size,3);assert.ok(r.choice.every(i=>i>=0&&i<6));
   assert.ok(Number.isFinite(r.seconds)&&r.seconds>=0&&r.seconds<=600);
   if(r.won){assert.equal(r.kills,5);assert.equal(r.alive,true);}
  }
 }
});
test('current affected routes preserve real farming progression and do not require injected sigil materials',()=>{
 const d=read('dawn-live-resonance-progression.json');assert.equal(d.completed,5);assert.equal(d.wins,5);assert.equal(d.rows.length,5);
 const expected=new Set(['priest/attack-support','performer/attack-defense','performer/attack-support','performer/magic-support','performer/defense-support']);
 for(const r of d.rows){assert.ok(expected.delete(r.job+'/'+r.pair));assert.equal(r.sigil,4);assert.equal(r.core,1);assert.equal(r.won,true);
  assert.ok(r.kills>=216);assert.ok(r.remainingHp>0&&r.remainingGold>=0);assert.equal(r.valid,true);
  for(const [id,n] of Object.entries(r.required)){assert.equal(n,72);assert.ok(r.farmMaterials[id]>=n);}
 }
 assert.equal(expected.size,0);
});
