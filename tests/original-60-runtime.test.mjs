import test from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {ORIGINAL_60_MECHANICS,ORIGINAL_SIX_KEYS} from '../dist/original-60-mechanics.js';
const foe=()=>({id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,atk:0,def:0,hit:0,flee:0,instanceId:'resonance-check'});
test('each of 60 original contracts ignores wrong event and activates on its intended event',async()=>{
 let covered=0;
 for(const job of Object.keys(SECOND_JOBS)){
  const c=await runtime(),a=c.api;
  for(const pair of ORIGINAL_SIX_KEYS){
   const p=a.normalize(a.fresh('mechanics',job));
   Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
   const q=c.makePet('fang');Object.assign(q,{id:job+pair,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});
   p.pets=[q];p.activePetId=q.id;a.setup(p,foe());p.hp=a.stat('hp');p.mp=a.stat('mp');q.hp=c.petStats(q).hp;q.sp=c.petStats(q).sp;
   const spec=ORIGINAL_60_MECHANICS[job+'/'+pair],actual=a.state().classBuffs;
   if(job==='assassin'&&pair==='defense-support')p.hp=Math.max(1,Math.floor(a.stat('hp')*.30));
   if(job==='sage'&&pair==='defense-support')p.shield=100;
   if(job==='hunter'&&pair==='attack-support')a.state().petEffects.blessingUntil=2e6;
   a.emitEvent('unrelated-never-trigger');assert.equal(actual.pact,undefined,job+'/'+pair);
   if(job==='knight'&&pair==='attack-defense'){
    a.emitEvent('shieldBreak');
    a.emitEvent('thirdHit_knight');
   }else for(let i=0;i<spec.threshold;i++)a.emitEvent(spec.event);
   assert.ok(a.pactFor({id:'thirdMain_'+job})&&Object.keys(a.pactFor({id:'thirdMain_'+job})).length,job+'/'+pair+' did not activate');
   const activated=a.state().classBuffs.pact;
   a.emitEvent(spec.event);
   assert.equal(a.state().classBuffs.pact,activated,'cooldown should prevent immediate retrigger '+job+'/'+pair);
   covered++;
  }
 }
 assert.equal(covered,60);
});
