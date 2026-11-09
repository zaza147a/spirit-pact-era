import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fusionDirectOutputFactor} from '../dist/pet-effects.js';

const read=name=>JSON.parse(readFileSync(new URL('../docs/'+name,import.meta.url),'utf8'));
test('defense-support limited direct-output tuning improves trials without turning prior boss wins into losses',()=>{
 assert.equal(fusionDirectOutputFactor({fusion:{main:'defense',sub:'support'}}),1.35);
 assert.equal(fusionDirectOutputFactor({fusion:{main:'support',sub:'defense'}}),1);
 const old=read('five-boss-skill-combos.json'),current=read('five-boss-skill-combos-tuned.json');
 assert.equal(old.count,360);assert.equal(current.count,360);
 assert.ok(current.wins>old.wins,'five-boss build performance did not improve');
 const key=r=>[r.job,r.pair,r.choice.join(','),r.seed].join('|');
 const prior=new Map(old.rows.map(r=>[key(r),r]));
 for(const row of current.rows){
  const previous=prior.get(key(row));assert.ok(previous);
  assert.ok(!previous.won||row.won,'formerly passing five-boss build regressed: '+key(row));
 }
 const last=read('prepared-dawn-boss-batch-recheck.json'),tuned=read('prepared-dawn-boss-tuned-boundary.json');
 const oldBoss=new Map(last.rows.filter(r=>/sigil-0|sss-only/.test(r.stage)).map(r=>[[r.stage,r.job,r.pair,r.seed].join('|'),r]));
 let checked=0;
 for(const row of tuned.rows){
  const previous=oldBoss.get([row.stage,row.job,row.pair,row.seed].join('|'));
  assert.ok(previous,'missing prior 210 boss configuration');
  assert.ok(!previous.won||row.won,'210 boss regressed for '+row.stage+'/'+row.job+'/'+row.pair);
  checked++;
 }
 assert.equal(checked,720);
 assert.equal(tuned.summary.find(r=>r.dawnSigil===4).wins,360);
 const map=read('map-class-pcb-201-defense-support-tuned.json');
 assert.equal(map.count,360);assert.equal(map.summary[0].alive,360);
 assert.ok(map.summary[0].bestBuildJobGap<.25,'best tested job efficiency gap exceeded 25%');
});
