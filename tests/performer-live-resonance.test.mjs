import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {runBuild} from '../scripts/balance-v24.mjs';

async function setup(pair){
 const c=await runtime(),a=c.api,p=runBuild('performer',pair.split('-')[0],{level:200,gearLevel:190,seconds:0,
  scenario:'regional',reborn:true,thirdJob:true,referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,fixture:true}).fixture;
 const foe={id:'world_191',map:'worldroot',level:191,hp:1e12,maxHp:1e12,def:0,mdef:0,atk:0,hit:0,flee:0,instanceId:'song-target'};
 a.setup(p,foe);p.hp=a.stat('hp');p.mp=a.stat('mp');p.pets[0].hp=c.petStats(p.pets[0]).hp;
 c.Math.random=()=>0;a.beginReport();return {c,a,p,foe};
}
test('one named song is one buff event; default third-stance cycle can accumulate the two-performance sound shield',async()=>{
 const {c,a,p}=await setup('attack-defense');
 p.resonance=0;a.playerAttack(true,'thirdStance_performer');assert.equal(p.shield,0,'one performance must not count as two buffs');
 assert.equal(p.resonance,20,'the generic alias must not add energy again for the same skill');
 c.setTime(1016001);a.playerAttack(true,'thirdStance_performer');
 assert.ok(p.shield>0,'default 16s stance cooldown must fit the sound shield accumulation window');
 const before=p.shield;a.playerAttack(true,'thirdStance_performer');assert.equal(p.shield,before);
});
test('healing melody triggers only on actual HP recovery, separates owner healing and prevents repeated same-action pulses',async()=>{
 const {c,a,p,foe}=await setup('defense-support');
 a.playerAttack(true,'thirdUtility_performer');
 assert.equal(a.state().report.metrics.resonanceDamage,0,'full party must not produce healing pulses');
 assert.equal(a.state().classBuffs.pact,undefined,'mana recovery is not effective healing');
 c.setTime(1008001);p.hp=Math.floor(a.stat('hp')*.5);const before=p.hp;
 a.playerAttack(true,'thirdUtility_performer');
 const m=a.state().report.metrics;
 assert.ok(p.hp>before);assert.equal(m.playerHeal,p.hp-before,'owner melody is owner healing');
 assert.equal(m.effectiveHeal,0,'owner melody cannot inflate companion healing');
 assert.ok(m.resonanceDamage>0,'actual healing must cause a pulse');
 const hp=foe.hp,healed=p.hp;a.playerAttack(true,'thirdUtility_performer');
 assert.equal(foe.hp,hp);assert.equal(p.hp,healed,'same action cannot heal or pulse twice');
});
test('healing melody does not leak into another ordered fusion',async()=>{
 const {a,p}=await setup('support-defense');p.hp=Math.floor(a.stat('hp')*.5);const before=p.hp;
 a.playerAttack(true,'thirdUtility_performer');assert.equal(p.hp,before,'reverse fusion keeps its own utility identity');
 assert.equal(a.state().report.metrics.playerHeal,0);
});

test('sound shield accumulation expires after twenty seconds instead of persisting indefinitely',async()=>{
 const {c,a,p}=await setup('attack-defense');
 a.playerAttack(true,'thirdStance_performer');
 c.setTime(1020001);a.playerAttack(true,'thirdStance_performer');
 assert.equal(p.shield,0,'expired first song cannot complete a shield');
 c.setTime(1036002);a.playerAttack(true,'thirdStance_performer');
 assert.ok(p.shield>0,'two new performances within the window must still work');
});

test('automatic rotation uses healing melody for a wounded party even when SP is full',async()=>{
 const {a,p}=await setup('defense-support');p.hp=Math.floor(a.stat('hp')*.5);p.mp=a.stat('mp');
 p.autoSkills.order=['thirdUtility_performer','thirdStance_performer','thirdMain_performer'];
 const before=p.hp;a.autoCastJobs();assert.ok(p.hp>before,'mana-kind utility must not be skipped when its melody can heal');
 assert.ok(a.state().report.metrics.resonanceDamage>0);
});
