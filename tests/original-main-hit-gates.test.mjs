import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';

const narrowed=[
 ['knight','attack-support'],
 ['assassin','magic-support'],['rogue','attack-magic'],['rogue','magic-defense'],
 ['priest','attack-magic'],['priest','magic-defense'],
 ['performer','attack-magic'],['performer','magic-defense']
];

test('eight signature strikes require a successful third-job main hit, not an arbitrary skill',async()=>{
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
  assert.ok(foe.hp<1e9||a.state().petEffects.burnTicks>0||a.state().classBuffs.resonanceHaste?.until>1e6,key+' should apply its signature payload');
  const after=foe.hp;
  a.emitEvent('thirdHit_'+job);
  assert.equal(foe.hp,after,key+' should respect the shared resonance cooldown');
 }
});

test('five more original pacts require their named lance, ambush or star-rain hit',async()=>{
 const gated=[
  ['wizard','magic-support','thirdWideHit_wizard',1],
  ['assassin','attack-defense','thirdHit_assassin',1],
  ['assassin','attack-support','thirdHit_assassin',2],
  ['rogue','attack-defense','thirdHit_rogue',1],
  ['hunter','attack-defense','thirdHit_hunter',1]
 ];
 for(const [job,pair,event,needed] of gated){
  const c=await runtime(),a=c.api,p=a.normalize(a.fresh('staged-attack',job));
  Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
  const pet=c.makePet('fang');
  Object.assign(pet,{id:'staged-'+job+pair,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});
  p.pets=[pet];p.activePetId=pet.id;
  const foe={id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,def:100,atk:0,hit:0,flee:0,instanceId:'staged-foe'};
  a.setup(p,foe);p.hp=a.stat('hp');p.mp=Math.floor(a.stat('mp')*.5);pet.hp=c.petStats(pet).hp;
  assert.equal(THIRD_FUSION_RULES[job][pair].events[0],event,job+'/'+pair);
  a.beginReport();a.emitEvent('skill');a.emitEvent('thirdFinish_'+job);
  assert.equal(a.state().classBuffs.pact,undefined,job+'/'+pair+' wrongly triggered from unrelated skills');
  for(let n=1;n<=needed;n++){
   a.emitEvent(event);
   assert.equal(!!a.state().classBuffs.pact,n===needed,job+'/'+pair+' violated its staged hit threshold');
  }
  if(job==='wizard')assert.ok(p.mp>Math.floor(a.stat('mp')*.5),'star rain must restore SP after its wide hit');
  else if(pair==='attack-defense')assert.ok(foe.exposedUntil>1e6,job+'/'+pair+' should cause armor exposure');
  else assert.ok(a.state().petEffects.markHits>0,'two-hit blood chain must mark its execution target');
  const after=foe.hp;a.emitEvent(event);
  assert.equal(foe.hp,after,job+'/'+pair+' bypassed its cooldown');
 }
});

test('knight hunting rhythm requires both healthy HP and a landed dragon lance',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('healthy-lance','knight'));
 Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
 const pet=c.makePet('fang');
 Object.assign(pet,{id:'healthy-lance-pet',rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:'attack',sub:'support'}});
 p.pets=[pet];p.activePetId=pet.id;
 a.setup(p,{id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,def:100,atk:0,hit:0,flee:0,instanceId:'healthy-lance-foe'});
 pet.hp=c.petStats(pet).hp;a.beginReport();
 p.hp=Math.floor(a.stat('hp')*.5);
 a.emitEvent('thirdHit_knight');
 assert.equal(a.state().classBuffs.pact,undefined,'a landed lance at low HP must not trigger the chase');
 p.hp=a.stat('hp');
 a.emitEvent('skill');a.emitEvent('thirdWideHit_knight');
 assert.equal(a.state().classBuffs.pact,undefined,'generic and wide skills must not trigger the chase');
 a.emitEvent('thirdHit_knight');
 assert.ok(a.state().classBuffs.pact,'a healthy landed lance should activate the resonance');
 assert.ok(a.state().classBuffs.resonanceHaste?.until>1e6,'the chase grants real haste');
});
