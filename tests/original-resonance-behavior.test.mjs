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
test('knight original shield-break arms its follow-up lance before applying timed armor break',async()=>{
 const {a,foe}=await scenario('knight','attack-defense');
 assert.equal(foe.exposedUntil,undefined);
 a.emitEvent('shieldBreak');assert.equal(foe.exposedUntil,undefined);
 a.emitEvent('thirdHit_knight');assert.equal(foe.exposedPower,.18);assert.ok(foe.exposedUntil>1000000);
});
test('wizard magic-defense stores a spell in its ward before one delayed cannon',async()=>{
 const {a,c,foe}=await scenario('wizard','magic-defense');
 a.emitEvent('skill');
 assert.ok(a.state().petEffects.shield>0,'first spell must build a ward');
 assert.equal(foe.hp,1e9,'charging the ward is not an instant magic cannon');
 a.emitEvent('skill');
 assert.equal(foe.hp,1e9,'same tick cannot release a duplicate cannon');
 c.setTime(1004001);
 a.emitEvent('skill');
 const charged=foe.hp;
 assert.ok(charged<1e9,'the next spell releases the stored magic');
 a.emitEvent('skill');
 assert.equal(foe.hp,charged,'stored magic can discharge only once');
});
test('wizard ward charge expires and cannot be stolen by swapping fused companions',async()=>{
 const {a,c,p,foe}=await scenario('wizard','magic-defense');
 a.emitEvent('skill');
 const another=c.makePet('fang');
 Object.assign(another,{id:'new-wizard-ward',rarity:'mythic',ascended:true,
  level:150,evolution:4,fusion:{main:'magic',sub:'defense'}});
 another.hp=c.petStats(another).hp;p.pets.push(another);
 a.setPet('new-wizard-ward');c.setTime(1004001);a.emitEvent('skill');
 assert.equal(foe.hp,1e9,'a different pet cannot release the old ward spell');
 const {a:b,c:d,foe:expired}=await scenario('wizard','magic-defense');
 b.emitEvent('skill');d.setTime(1010001);b.emitEvent('skill');
 assert.equal(expired.hp,1e9,'an expired ward must not release delayed damage');
});
test('priest surplus healing becomes a bounded three-target star rain, never duplicate damage',async()=>{
 const {a,p,foe}=await scenario('priest','magic-support');
 p.firstJobLevel=50;p.jobSkills.heal=10;p.hp=a.stat('hp');
 const other={...foe,instanceId:'priest-other',hp:1e9,maxHp:1e9};
 const third={...foe,instanceId:'priest-third',hp:1e9,maxHp:1e9};
 const fourth={...foe,instanceId:'priest-fourth',hp:1e9,maxHp:1e9};
 a.setEnemies([foe,other,third,fourth]);a.beginReport();
 a.playerAttack(true,'heal');
 for(const target of [foe,other,third])assert.ok(target.hp<1e9,`${target.instanceId} missed the rain`);
 assert.equal(fourth.hp,1e9,'rain is limited to three distinct enemies');
 assert.ok(a.state().report.metrics.resonanceDamage>0,'star rain must be recorded as resonance damage');
 assert.equal(a.state().report.metrics.playerHeal,0,'surplus is not free effective healing');
});
test('crusader siege counter requires two real hit events',async()=>{
 const {a,foe}=await scenario('crusader','attack-defense');
 a.emitEvent('damageTaken');assert.equal(foe.hp,1e9);
 a.emitEvent('damageTaken');assert.ok(foe.hp<1e9);
});
test('two-stage resonance accumulation expires after eight seconds without leaking delayed damage',async()=>{
 const {a,c,foe}=await scenario('crusader','attack-defense');
 a.emitEvent('damageTaken');assert.equal(foe.hp,1e9);
 c.setTime(1008001);a.emitEvent('damageTaken');
 assert.equal(foe.hp,1e9,'stale first stage must not combine with an eight-second-late hit');
 c.setTime(1008200);a.emitEvent('damageTaken');
 assert.ok(foe.hp<1e9,'two fresh hits within the window must activate exactly once');
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
test('resonance burn remains on the originally struck enemy after target switching',async()=>{
 const {a,c,foe}=await scenario('assassin','attack-magic');
 const other={...foe,instanceId:'other',hp:1e9,maxHp:1e9};
 a.setEnemies([foe,other]);a.beginReport();a.emitEvent('crit');
 a.setEnemies([other,foe]);
 c.setTime(1001300);a.tickPetEffects(1001300);
 assert.ok(foe.hp<1e9,'burn must damage its original target');
 assert.equal(other.hp,1e9,'switching target must not redirect an existing burn');
});
test('resonance burn continues against its live target even if selected enemy has already died',async()=>{
 const {a,c,foe}=await scenario('assassin','attack-magic');
 a.beginReport();a.emitEvent('crit');
 const dead={...foe,instanceId:'already-dead',hp:0,maxHp:1e9};
 a.setEnemies([dead,foe]);
 c.setTime(1001300);a.tickPetEffects(1001300);
 assert.ok(foe.hp<1e9,'a dead selected enemy must not cancel a different target’s live burn');
 assert.equal(dead.hp,0,'a dead enemy cannot be damaged a second time');
 assert.ok(a.state().report.metrics.resonanceDamage>0);
});
test('original fire burn replaces old pet bleed without inheriting its leech, power or slow tick',async()=>{
 const {a,c,p,foe}=await scenario('assassin','attack-magic');
 const effects=a.state().petEffects;
 Object.assign(effects,{bleedTicks:7,bleedPower:900000,bleedInterval:9000,bleedLeech:1,bleedSource:'petDamage',bleedTargetId:'stale'});
 a.beginReport();p.hp=Math.floor(a.stat('hp')*.5);
 a.emitEvent('crit');
 assert.equal(effects.bleedTicks,3);
 assert.equal(effects.bleedInterval,1200);
 assert.equal(effects.bleedLeech,0);
 assert.equal(effects.bleedSource,'resonanceDamage');
 assert.ok(effects.bleedPower<900000,'old pet skill damage cannot become resonance damage');
 const hp=p.hp;c.setTime(1001300);a.tickPetEffects(1001300);
 assert.equal(p.hp,hp,'resonance fire is not an inherited lifesteal skill');
 assert.ok(a.state().report.metrics.resonanceDamage>0);
 assert.equal(a.state().report.metrics.petDamage,0);
 assert.ok(foe.hp<1e9);
});
test('pet bleed taking over fire burn credits its own damage to the pet, not resonance',async()=>{
 const {a,c,pet,foe}=await scenario('assassin','attack-magic');
 a.beginReport();a.emitEvent('crit');
 assert.equal(a.state().petEffects.bleedSource,'resonanceDamage');
 pet.equippedSkills=['fusion_attack-magic_4'];c.setTime(1001000);
 a.petAutoAbility(pet,c.petStats(pet),1001000);
 assert.equal(a.state().petEffects.bleedSource,undefined,'new pet bleed must discard old resonance attribution');
 c.setTime(1003200);a.tickPetEffects(1003200);
 assert.ok(a.state().report.metrics.petDamage>0);
 assert.equal(a.state().report.metrics.resonanceDamage,0);
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

test('original stacked resonance strike belongs to its own pet and expires after inactivity',async()=>{
 const {a,c,p,foe}=await scenario('knight','attack-magic');
 const hit=()=>{const before=foe.hp;a.emitEvent('thirdHit_knight');a.emitEvent('thirdHit_knight');return before-foe.hp;};
 const first=hit();assert.ok(first>0);
 c.setTime(1004001);const stacked=hit();
 assert.ok(stacked>first,'a continuing eight-second combo increases its own strike');
 const other=c.makePet('fang');Object.assign(other,{id:'fresh-stack',level:150,rarity:'mythic',ascended:true,evolution:4,fusion:{main:'attack',sub:'magic'}});
 other.hp=c.petStats(other).hp;p.pets.push(other);a.setPet('fresh-stack');
 c.setTime(1008002);const separate=hit();
 assert.ok(Math.abs(separate-first)<first*.01,'new companion must not inherit another pet’s stack');
 c.setTime(1020000);const expired=hit();
 assert.equal(expired,separate,'an inactive combo must restart from its own base damage');
});

test('swapping fused companions cannot bypass the shared combat resonance cooldown',async()=>{
 const {a,c,p,foe}=await scenario('knight','defense-support');
 a.beginReport();a.emitEvent('damageTaken');
 const first=foe.hp;assert.ok(first<1e9);
 const other=c.makePet('fang');Object.assign(other,{id:'second',level:150,rarity:'mythic',ascended:true,evolution:4,fusion:{main:'defense',sub:'support'}});
 other.hp=c.petStats(other).hp;p.pets.push(other);
 a.setPet('second');a.emitEvent('damageTaken');
 assert.equal(foe.hp,first,'changing companion must not grant a second immediate hit');
 c.setTime(1004001);a.emitEvent('damageTaken');
 assert.ok(foe.hp<first,'next hit is allowed after the original cooldown');
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

test('falcon-song volley requires a song buff and adds real resonance damage',async()=>{
 const {a,c,foe}=await scenario('hunter','attack-support');
 a.beginReport();a.emitEvent('falcon');
 assert.equal(foe.hp,1e9,'falcon alone cannot trigger the song collaboration');
 a.state().petEffects.blessingUntil=2e6;
 a.emitEvent('falcon');assert.ok(foe.hp<1e9);
 assert.ok(a.state().report.metrics.resonanceDamage>0);
 const hp=foe.hp;a.emitEvent('falcon');assert.equal(foe.hp,hp,'cannot volley again during cooldown');
});
test('sage auto-spell chain includes the primary target and restores missing mana',async()=>{
 const {a,p,foe}=await scenario('sage','magic-support');
 a.beginReport();p.mp=Math.floor(a.stat('mp')*.5);
 const before=p.mp;a.emitEvent('autospell');
 assert.ok(foe.hp<1e9);
 assert.ok(p.mp>before,'auto-star-rain replenishes mana when damage lands');
 assert.ok(a.state().report.metrics.resonanceDamage>0);
});

test('wizard stores incoming hits as delayed magic and releases once on successful third hit',async()=>{
 const {a,foe}=await scenario('wizard','attack-defense');
 a.beginReport();a.emitEvent('damageTaken');a.emitEvent('damageTaken');
 assert.equal(foe.hp,1e9,'incoming hits must store rather than directly discharge');
 a.emitEvent('thirdHit_wizard');assert.ok(foe.hp<1e9);
 const after=foe.hp;a.emitEvent('thirdHit_wizard');
 assert.equal(foe.hp,after,'a stored spell cannot discharge twice');
 assert.ok(a.state().report.metrics.resonanceDamage>0);
});

test('royal guard block triggers its stored magic cannon from a real incoming monster hit',async()=>{
 const {a,c,foe}=await scenario('crusader','magic-defense');
 a.beginReport();foe.atk=500;foe.hit=1e7;
 c.chooseMonsterTarget=()=> 'player';c.Math.random=()=>0;
 const hp=foe.hp;
 a.enemyAttack();
 assert.ok(foe.hp<hp,'a real shield block must trigger the configured magic cannon');
 assert.ok(a.state().report.metrics.resonanceDamage>0);
 const after=foe.hp;
 a.enemyAttack();
 assert.equal(foe.hp,after,'immediate second block must not bypass the resonance cooldown');
});

test('rogue sanctuary chase triggers from a real dodge, never from a hit',async()=>{
 const {a,c,foe}=await scenario('rogue','defense-support');
 a.beginReport();foe.atk=500;foe.hit=1;
 c.chooseMonsterTarget=()=> 'player';c.Math.random=()=>1;
 const health=a.state().player.hp,initial=foe.hp;
 a.enemyAttack();
 assert.equal(a.state().player.hp,health,'the triggering attack must actually miss the owner');
 assert.ok(foe.hp<initial,'a successful dodge must create a sanctuary counterattack');
 assert.ok(a.state().report.metrics.resonanceDamage>0);
});

test('knight armor break needs a real monster-shattered shield before lance contact',async()=>{
 const {a,c,p,foe}=await scenario('knight','attack-defense');
 foe.atk=100;foe.hit=1e7;
 c.chooseMonsterTarget=()=> 'player';c.Math.random=()=>0;
 p.shield=1;
 a.enemyAttack();
 assert.equal(p.shield,0,'incoming damage must actually consume the shield');
 assert.equal(foe.exposedUntil,undefined,'shield break arms the lance but is not the armor break itself');
 a.emitEvent('thirdHit_knight');
 assert.ok(foe.exposedUntil>1e6,'the subsequent lance should shatter enemy armor');
});

test('assassin attack-defense stab must expose first, then execute on a later same-target hit',async()=>{
 const {a,c,foe}=await scenario('assassin','attack-defense');
 a.beginReport();a.emitEvent('thirdHit_assassin');
 assert.equal(foe.hp,1e9,'the first stab must not instantly execute');
 assert.ok(foe.exposedUntil>1e6,'the first stab must expose armor');
 a.emitEvent('thirdHit_assassin');assert.equal(foe.hp,1e9,'same-tick duplicate must be blocked');
 c.setTime(1004001);a.emitEvent('thirdHit_assassin');
 assert.ok(foe.hp<1e9,'a later valid hit executes the stored weakness');
 assert.ok(a.state().report.metrics.resonanceDamage>0);
 const after=foe.hp;a.emitEvent('thirdHit_assassin');
 assert.equal(foe.hp,after,'stored execution cannot deal damage twice');
});

test('assassin stored execution cannot be redirected to another monster or used after expiry',async()=>{
 const {a,c,foe}=await scenario('assassin','attack-defense');
 const other={...foe,instanceId:'other-stab-target',hp:1e9,maxHp:1e9};
 a.setEnemies([foe,other]);a.emitEvent('thirdHit_assassin');
 c.setTime(1004001);a.setEnemies([other,foe]);a.emitEvent('thirdHit_assassin');
 assert.equal(other.hp,1e9,'switching targets starts a fresh exposure, not an immediate execute');
 c.setTime(1008002);a.setEnemies([foe,other]);a.emitEvent('thirdHit_assassin');
 assert.ok(foe.hp<1e9,'the original target may be executed while its own weakness is still fresh');
 const {a:b,c:d,foe:stale}=await scenario('assassin','attack-defense');
 b.emitEvent('thirdHit_assassin');d.setTime(1009000);b.emitEvent('thirdHit_assassin');
 assert.equal(stale.hp,1e9,'an expired exposure cannot be consumed for free execution');
 assert.ok(stale.exposedUntil>1009000,'a fresh stab should instead rearm the exposure');
});

test('wizard stored retaliatory spell is charged by real owner damage and spent once on its hit',async()=>{
 const {a,c,foe}=await scenario('wizard','attack-defense');
 foe.atk=100;foe.hit=1e7;
 c.chooseMonsterTarget=()=> 'player';c.Math.random=()=>0;
 a.beginReport();
 const hp=foe.hp;
 a.enemyAttack();
 assert.equal(foe.hp,hp,'being hit stores magic instead of dealing premature magic damage');
 c.setTime(1001000);a.enemyAttack();
 assert.equal(foe.hp,hp,'two incoming hits charge magic without premature damage');
 a.emitEvent('thirdHit_wizard');
 assert.ok(foe.hp<hp,'a later offensive hit releases stored damage');
 const after=foe.hp;a.emitEvent('thirdHit_wizard');
 assert.equal(foe.hp,after,'the stored damage is consumed after one hit');
});
