import test from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
async function scenario(job,pair){
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('conditional',job));
 Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
 const pet=c.makePet('fang');Object.assign(pet,{id:'companion',rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});
 p.pets=[pet];p.activePetId=pet.id;
 const foe={id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,def:250,atk:0,hit:0,flee:0,instanceId:'mechanic'};
 a.setup(p,foe);p.hp=a.stat('hp');p.mp=a.stat('mp');pet.hp=c.petStats(pet).hp;pet.sp=c.petStats(pet).sp;
 return {c,a,p,pet,foe};
}
test('knight original shield-break actually applies and times armor break',async()=>{
 const {a,foe}=await scenario('knight','attack-defense');
 assert.equal(foe.exposedUntil,undefined);
 a.emitEvent('shieldBreak');assert.equal(foe.exposedPower,.18);assert.ok(foe.exposedUntil>1000000);
});
test('crusader siege counter requires two real hit events',async()=>{
 const {a,foe}=await scenario('crusader','attack-defense');
 a.emitEvent('damageTaken');assert.equal(foe.hp,1e9);
 a.emitEvent('damageTaken');assert.ok(foe.hp<1e9);
});
test('assassin fire adds three bounded damage ticks on crit event',async()=>{
 const {a}=await scenario('assassin','attack-magic');
 a.emitEvent('crit');assert.equal(a.state().petEffects.bleedTicks,3);assert.ok(a.state().petEffects.bleedPower>0);
});
test('low-health assassin riposte will not activate until critically injured',async()=>{
 const {a,p,foe}=await scenario('assassin','defense-support');
 a.emitEvent('damageTaken');assert.equal(foe.hp,1e9);assert.equal(a.state().classBuffs.pact,undefined);
 p.hp=Math.max(1,Math.floor(a.stat('hp')*.3));
 a.emitEvent('damageTaken');assert.ok(foe.hp<1e9);assert.ok(p.shield>0);
});
test('sage auto-guard chase requires an existing shield',async()=>{
 const {a,p,foe}=await scenario('sage','defense-support');
 a.emitEvent('autospell');assert.equal(foe.hp,1e9);
 p.shield=100;a.emitEvent('autospell');assert.ok(foe.hp<1e9);
});
