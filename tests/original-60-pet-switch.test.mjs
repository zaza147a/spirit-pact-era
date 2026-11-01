import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {ORIGINAL_SIX_KEYS} from '../dist/original-60-mechanics.js';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';

const foe=id=>({id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,def:100,atk:0,hit:0,flee:0,instanceId:id});
function prepare(c,p,pet,job,pair){
 pet.hp=c.petStats(pet).hp;pet.sp=c.petStats(pet).sp;
 if(job==='assassin'&&pair==='defense-support')p.hp=Math.floor(c.api.stat('hp')*.3);
 if(job==='sage'&&pair==='defense-support')p.shield=100;
 if(job==='hunter'&&pair==='attack-support')c.api.state().petEffects.blessingUntil=2e6;
 if(job==='knight'&&pair==='attack-defense')c.api.emitEvent('shieldBreak');
}
test('switching companions clears all 60 active pact windows without bypassing shared cooldown',async()=>{
 let checked=0;
 for(const job of Object.keys(SECOND_JOBS)){
  const c=await runtime(),a=c.api;
  for(const pair of ORIGINAL_SIX_KEYS){
   c.setTime(1e6);
   const rule=THIRD_FUSION_RULES[job][pair],label=job+'/'+pair;
   const p=a.normalize(a.fresh('switch-'+label,job));
   Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
   const make=id=>{const pet=c.makePet('fang');Object.assign(pet,{id,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});return pet;};
   const first=make(label+'-first'),second=make(label+'-second');
   p.pets=[first,second];p.activePetId=first.id;
   const target=foe(label);a.setup(p,target);a.setEnemies([target]);
   p.hp=a.stat('hp');p.mp=Math.floor(a.stat('mp')*.5);
   prepare(c,p,first,job,pair);
   for(let i=0;i<(rule.originalEvent.threshold||1);i++)a.emitEvent(rule.originalEvent.event);
   assert.ok(a.state().classBuffs.pact,label+' did not start with first pet');
   a.setPet(second.id);
   assert.equal(p.activePetId,second.id,label+' failed to switch pets');
   assert.equal(a.state().classBuffs.pact,undefined,label+' retained a prior pet pact');
   prepare(c,p,second,job,pair);
   for(let i=0;i<(rule.originalEvent.threshold||1);i++)a.emitEvent(rule.originalEvent.event);
   assert.equal(a.state().classBuffs.pact,undefined,label+' bypassed shared 4s cooldown with a new pet');
   c.setTime(1e6+rule.cooldown+1);
   prepare(c,p,second,job,pair);
   for(let i=0;i<(rule.originalEvent.threshold||1);i++)a.emitEvent(rule.originalEvent.event);
   assert.ok(a.state().classBuffs.pact,label+' did not recover after the shared cooldown');
   checked++;
  }
 }
 assert.equal(checked,60);
});
