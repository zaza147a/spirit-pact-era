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

test('burn ticks are classified as resonance damage rather than direct pet damage',async()=>{
 const {a,c,foe}=await scenario('assassin','attack-magic');
 a.beginReport();a.emitEvent('crit');
 c.setTime(1001300);a.tickPetEffects(1001300);
 const metrics=a.state().report.metrics;
 assert.ok(metrics.resonanceDamage>0,'burn should credit resonanceDamage');
 assert.equal(metrics.petDamage,0,'burn should not inflate direct petDamage');
 assert.ok(foe.hp<1e9);
});
test('two-hit accumulation never leaks between active pets after swapping',async()=>{
 const {a,c,p,pet,foe}=await scenario('crusader','attack-defense');
 a.emitEvent('damageTaken');assert.equal(foe.hp,1e9);
 const other=c.makePet('fang');Object.assign(other,{id:'other',level:150,rarity:'mythic',ascended:true,evolution:4,fusion:{main:'attack',sub:'defense'}});other.hp=c.petStats(other).hp;p.pets.push(other);
 a.setPet('other');a.emitEvent('damageTaken');
 assert.equal(foe.hp,1e9,'other pet must begin its own two-hit counter');
 a.emitEvent('damageTaken');assert.ok(foe.hp<1e9);
});

test('performer song shield charges only after two buffs, then absorbs and retaliates once',async()=>{
 const {a,p,foe}=await scenario('performer','attack-defense');
 a.emitEvent('buff');assert.equal(p.shield,0,'one performance is not enough');
 a.emitEvent('buff');assert.ok(p.shield>0,'two performances accumulate a shield');
 const shield=p.shield;
 a.emitEvent('buff');assert.equal(p.shield,shield,'cooldown prevents immediate shield spam');
});

test('charged sound shield retaliates once after a real incoming owner hit',async()=>{
 const {a,c,p,foe}=await scenario('performer','attack-defense');
 a.beginReport();
 a.emitEvent('buff');a.emitEvent('buff');
 assert.ok(p.shield>0);
 foe.atk=1000;foe.hit=1e7;
 c.chooseMonsterTarget=()=> 'player';c.Math.random=()=>0;
 const before=foe.hp;
 a.enemyAttack();
 assert.ok(foe.hp<before,'shield should deal real retaliatory damage');
 assert.ok(a.state().report.metrics.resonanceDamage>0,'retaliation credited to resonance');
 const after=foe.hp;a.enemyAttack();assert.equal(foe.hp,after,'one charge must not retaliate twice');
});
