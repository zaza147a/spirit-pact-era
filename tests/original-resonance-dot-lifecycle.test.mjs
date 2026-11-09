import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';
import {ORIGINAL_60_MECHANICS} from '../dist/original-60-mechanics.js';

for(const key of Object.keys(ORIGINAL_60_MECHANICS)){
 const [job,pair]=key.split('/'),rule=THIRD_FUSION_RULES[job][pair];
 if(![].concat(rule.originalEvent.payload).includes('elementBurn'))continue;
 test(key+' burn follows its victim for exactly three ticks, keeps bleed separate and ends on pet switch',async()=>{
  const c=await runtime(),a=c.api,p=a.normalize(a.fresh('burn-lifecycle',job));
  Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
  const pets=['first','second'].map(id=>{const pet=c.makePet('fang');Object.assign(pet,{id,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});pet.hp=c.petStats(pet).hp;return pet;});
  p.pets=pets;p.activePetId='first';
  const target={id:'world_151',level:151,hp:1e9,maxHp:1e9,def:0,atk:0,hit:0,flee:0,instanceId:'burn-victim'},other={...target,instanceId:'bleed-victim'};
  a.setup(p,target);a.setEnemies([target,other]);p.hp=a.stat('hp');
  const activate=()=>{for(let n=0;n<(rule.originalEvent.threshold||1);n++)a.emitEvent(rule.originalEvent.event);};
  activate();const fx=a.state().petEffects;assert.equal(fx.burnTicks,3);
  const targetBefore=target.hp,otherBefore=other.hp;
  a.setEnemies([other,target]);a.beginReport();
  Object.assign(fx,{bleedTicks:1,bleedPower:100,bleedNext:1001200,bleedTargetId:other.instanceId});
  c.setTime(1001199);a.tickPetEffects(1001199);assert.equal(target.hp,targetBefore);
  for(const at of [1001200,1002400,1003600]){c.setTime(at);a.tickPetEffects(at);a.tickPetEffects(at);}
  const metrics=a.state().report.metrics;
  assert.equal(fx.burnTicks,0);assert.equal(fx.bleedTicks,0);
  assert.ok(target.hp<targetBefore);assert.equal(metrics.resonanceDamage,targetBefore-target.hp,'burn credited once');
  assert.equal(metrics.petDamage,otherBefore-other.hp,'bleed keeps separate companion credit');
  const after=target.hp;c.setTime(1004800);a.tickPetEffects(1004800);assert.equal(target.hp,after,'no fourth tick');
  a.setEnemies([target,other]);activate();assert.equal(fx.burnTicks,3);
  a.setPet('second');const switched=target.hp;
  c.setTime(1006000);a.tickPetEffects(1006000);
  assert.equal(target.hp,switched,'old pet burn cannot survive switch');
  assert.equal(a.state().petEffects.burnTicks,0);
 });
}
