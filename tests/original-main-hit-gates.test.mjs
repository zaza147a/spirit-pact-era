import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';

const narrowed=[
 ['assassin','magic-support'],['rogue','attack-magic'],['rogue','magic-defense'],
 ['priest','attack-magic'],['priest','magic-defense'],
 ['performer','attack-magic'],['performer','magic-defense']
];

test('seven signature strikes require a successful third-job main hit, not an arbitrary skill',async()=>{
 for(const [job,pair] of narrowed){
  const c=await runtime(),a=c.api,p=a.normalize(a.fresh('signature',job));
  Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
  const pet=c.makePet('fang');
  Object.assign(pet,{id:'signature-'+job+pair,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});
  p.pets=[pet];p.activePetId=pet.id;
  const foe={id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,def:100,atk:0,hit:0,flee:0,instanceId:'signature-foe'};
  a.setup(p,foe);p.hp=a.stat('hp');pet.hp=c.petStats(pet).hp;
  const key=job+'/'+pair;
  assert.equal(THIRD_FUSION_RULES[job][pair].events[0],'thirdHit_'+job,key);
  a.beginReport();
  a.emitEvent('skill');a.emitEvent('thirdWideHit_'+job);
  assert.equal(a.state().classBuffs.pact,undefined,key+' should ignore non-signature skills');
  assert.equal(foe.hp,1e9,key+' incorrectly did damage before the main hit');
  a.emitEvent('thirdHit_'+job);
  assert.ok(a.state().classBuffs.pact,key+' should trigger after signature contact');
  assert.ok(foe.hp<1e9||a.state().petEffects.bleedTicks>0||a.state().classBuffs.resonanceHaste?.until>1e6,key+' should apply its signature payload');
  const after=foe.hp;
  a.emitEvent('thirdHit_'+job);
  assert.equal(foe.hp,after,key+' should respect the shared resonance cooldown');
 }
});
