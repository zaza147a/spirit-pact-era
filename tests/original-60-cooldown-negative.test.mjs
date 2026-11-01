import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {ORIGINAL_SIX_KEYS} from '../dist/original-60-mechanics.js';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';

const foe=id=>({id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,def:100,atk:0,hit:0,flee:0,instanceId:id});

test('all 60 original contracts reject unrelated events and duplicate immediate procs',async()=>{
 let checked=0;
 for(const job of Object.keys(SECOND_JOBS)){
  const c=await runtime(),a=c.api;
  for(const pair of ORIGINAL_SIX_KEYS){
   const rule=THIRD_FUSION_RULES[job][pair],label=job+'/'+pair;
   c.setTime(1e6);
   const p=a.normalize(a.fresh('cooldown-'+pair,job));
   Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
   const pet=c.makePet('fang');
   Object.assign(pet,{id:label,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});
   p.pets=[pet];p.activePetId=pet.id;
   const primary=foe(label);a.setup(p,primary);a.setEnemies([primary]);
   p.hp=a.stat('hp');p.mp=Math.floor(a.stat('mp')*.5);pet.hp=c.petStats(pet).hp;pet.sp=c.petStats(pet).sp;
   if(label==='assassin/defense-support')p.hp=Math.floor(a.stat('hp')*.3);
   if(label==='sage/defense-support')p.shield=100;
   if(label==='hunter/attack-support')a.state().petEffects.blessingUntil=2e6;
   if(label==='knight/attack-defense')a.emitEvent('shieldBreak');
   a.beginReport();
   const before=primary.hp;
   a.emitEvent('event-never-emitted-by-game');
   assert.equal(primary.hp,before,label+' responded to unrelated event');
   assert.equal(a.state().classBuffs.pact,undefined,label+' opened pact on unrelated event');
   for(let i=0;i<(rule.originalEvent.threshold||1);i++)a.emitEvent(rule.originalEvent.event);
   const active=a.state().classBuffs.pact;
   assert.ok(active,label+' failed to open pact');
   const activeUntil=active.until;
   const hp=primary.hp,metric=a.state().report.metrics.resonanceDamage,mp=p.mp;
   for(let i=0;i<(rule.originalEvent.threshold||1);i++)a.emitEvent(rule.originalEvent.event);
   assert.equal(primary.hp,hp,label+' dealt repeated same-tick damage');
   assert.equal(a.state().report.metrics.resonanceDamage,metric,label+' attributed repeated same-tick damage');
   assert.equal(p.mp,mp,label+' granted repeated same-tick mana');
   assert.equal(a.state().classBuffs.pact.until,activeUntil,label+' refreshed pact without waiting for cooldown');
   c.setTime(1e6+rule.cooldown-1);
   for(let i=0;i<(rule.originalEvent.threshold||1);i++)a.emitEvent(rule.originalEvent.event);
   assert.equal(a.state().classBuffs.pact.until,activeUntil,label+' refreshed pact one millisecond before cooldown');
   c.setTime(1e6+rule.cooldown+1);
   if(label==='knight/attack-defense')a.emitEvent('shieldBreak');
   for(let i=0;i<(rule.originalEvent.threshold||1);i++)a.emitEvent(rule.originalEvent.event);
   assert.ok(a.state().classBuffs.pact.until>activeUntil,label+' did not reactivate after cooldown');
   checked++;
  }
 }
 assert.equal(checked,60);
});
