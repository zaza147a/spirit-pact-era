import assert from 'node:assert/strict';
import {SECOND_JOBS} from '../dist/jobs.js';
import {homecomingPlayer} from './fixtures/homecoming-player.mjs';
import {optimizeAffixes,selectBossCards,validateOwnerLoadout,attackAttribute} from './fixtures/twelve-job-loadout-policy.mjs';

assert.equal(Object.keys(SECOND_JOBS).length,12);
for(const job of Object.keys(SECOND_JOBS)){
 const p=homecomingPlayer(job,'attack-magic',{fourth:true});
 for(const weaponChoice of ['critDmg','aspdPct']){
  const candidate=structuredClone(p);
  for(const [slot,item] of Object.entries(candidate.gear)){
   if(!item)continue;
   candidate.gear[slot]=optimizeAffixes(item,{job,weaponChoice});
  }
  selectBossCards(candidate);
  validateOwnerLoadout(candidate);
 }
 assert.ok(['INT','STR','DEX'].includes(attackAttribute(job)));
 console.log(JSON.stringify({job,main:attackAttribute(job),gear:Object.keys(p.gear).filter(s=>p.gear[s]),bossCards:Object.values(p.sockets).filter(Boolean).length}));
}
