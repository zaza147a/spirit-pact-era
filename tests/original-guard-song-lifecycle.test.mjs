import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
async function setup(job,pair){
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('lifecycle',job));
 Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
 const make=id=>{const q=c.makePet('fang');Object.assign(q,{id,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});q.hp=c.petStats(q).hp;return q;};
 p.pets=[make('first'),make('second')];p.activePetId='first';
 const foe={id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,atk:0,def:0,mdef:0,hit:0,flee:0,instanceId:'first-target'};
 a.setup(p,foe);p.hp=a.stat('hp');p.mp=a.stat('mp');a.beginReport();
 return {c,a,p,foe,damage:()=>a.state().report.metrics.resonanceDamage||0};
}
for(const job of ['crusader','hunter']){
 test(job+' guardian must protect first, then follow up only on a later real hit event',async()=>{
  const {a,c,damage}=await setup(job,'defense-support');
  a.emitEvent('thirdHit_'+job);assert.equal(damage(),0,'unprotected hit cannot snipe');
  a.emitEvent('shield');assert.equal(damage(),0,'creating the shield is not already the follow-up');
  assert.ok(a.state().petEffects.shield>0);a.emitEvent('thirdHit_'+job);assert.equal(damage(),0,'same-frame hit must wait for shared cooldown');
  c.setTime(1004000);a.emitEvent('thirdHit_'+job);assert.ok(damage()>0,'later hit must release the guarded follow-up');
  const used=damage();a.emitEvent('thirdHit_'+job);assert.equal(damage(),used);
  c.setTime(1008001);a.emitEvent('thirdHit_'+job);assert.equal(damage(),used,'one ward cannot release a second follow-up');
 });
 test(job+' guarded follow-up cannot outlive or survive consumption of its shield',async()=>{
  for(const mode of ['expired','absorbed']){
   const {a,c,p,damage}=await setup(job,'defense-support');a.emitEvent('shield');
   c.setTime(mode==='expired'?1006500:1004000);
   if(mode==='absorbed'){p.shield=0;a.state().petEffects.shield=0;}
   const before=damage();a.emitEvent('thirdHit_'+job);assert.equal(damage(),before,mode);
  }
 });
 test(job+' a new companion cannot inherit the previous guard follow-up',async()=>{
  const {a,c,damage}=await setup(job,'defense-support');a.emitEvent('shield');a.setPet('second');
  c.setTime(1004000);const before=damage();a.emitEvent('thirdHit_'+job);assert.equal(damage(),before);
 });
}
test('priest sanctuary judgement and protected retaliation are distinct terminal branches',async()=>{
 const attack=await setup('priest','defense-support');attack.a.emitEvent('skill');
 assert.ok(attack.damage()>0,'judgement must deal real damage');assert.equal(attack.a.state().petEffects.shield||0,0,'judgement is not also a defensive ward');
 const guard=await setup('priest','defense-support');guard.a.emitEvent('damageTaken');assert.equal(guard.damage(),0);
 guard.a.emitEvent('shield');assert.equal(guard.damage(),0,'shield branch must not deal judgement damage');
 assert.ok(guard.a.state().petEffects.shield>0);
 guard.c.setTime(1004000);guard.a.emitEvent('damageTaken');assert.ok(guard.damage()>0,'guarded incoming damage must retaliate');
 const used=guard.damage();guard.c.setTime(1008001);guard.a.emitEvent('damageTaken');assert.equal(guard.damage(),used,'retaliation consumes its own guard charge');
});
test('priest retaliation rejects expired, consumed and foreign-companion wards',async()=>{
 for(const mode of ['expired','absorbed','switched']){
  const {a,c,p,damage}=await setup('priest','defense-support');a.emitEvent('shield');
  if(mode==='absorbed'){p.shield=0;a.state().petEffects.shield=0;}
  if(mode==='switched')a.setPet('second');
  c.setTime(mode==='expired'?1006500:1004000);const before=damage();a.emitEvent('damageTaken');assert.equal(damage(),before,mode);
 }
});
test('wizard ward grants exactly two assisted hits while its actual protection remains',async()=>{
 const {a}=await setup('wizard','defense-support');a.emitEvent('shield');
 a.dealDamage(100,'playerDamage');const one=a.state().report.metrics.buffDamage;assert.ok(one>0);
 a.dealDamage(100,'playerDamage');const two=a.state().report.metrics.buffDamage;assert.ok(two>one);
 a.dealDamage(100,'playerDamage');assert.equal(a.state().report.metrics.buffDamage,two,'no third assisted hit');
});
test('wizard assisted hits stop at the ward boundary and when all protection is consumed',async()=>{
 for(const mode of ['expired','absorbed']){
  const {a,c,p}=await setup('wizard','defense-support');a.emitEvent('shield');
  if(mode==='expired')c.setTime(1006500);else {p.shield=0;a.state().petEffects.shield=0;}
  a.dealDamage(100,'playerDamage');assert.equal(a.state().report.metrics.buffDamage||0,0,mode);
  assert.equal(a.state().petEffects.markHits,0,mode+' must discard unusable mark charges');
 }
});
test('performer song starts delayed three-target rain; later song prolongs the same bounded chain',async()=>{
 const {a,c,foe,p,damage}=await setup('performer','magic-support');
 const others=Array.from({length:3},(_,i)=>({...foe,instanceId:'target-'+i}));a.setEnemies([foe,...others]);
 a.emitEvent('song');assert.equal(damage(),0,'an unbuffed song hit cannot create a rain');
 a.state().classBuffs.battleSong={until:1030000,power:.15};a.emitEvent('buff');
 assert.equal(damage(),0,'rain must be delayed rather than instant splash');
 const wave=a.state().petEffects.songRain;assert.ok(wave&&wave.remaining===3);
 c.setTime(1001999);a.tickPetEffects(1001999);assert.equal(damage(),0);
 c.setTime(1002000);const energy=p.resonance;a.tickPetEffects(1002000);
 for(const target of [foe,...others.slice(0,2)])assert.ok(target.hp<1e9);assert.equal(others[2].hp,1e9,'only three targets per pulse');
 const once=damage();a.tickPetEffects(1002000);assert.equal(damage(),once,'same-frame pulse must deduplicate');assert.equal(p.resonance,energy,'terminal rain cannot emit more resonance energy');
 c.setTime(1004000);a.tickPetEffects(1004000);a.emitEvent('song');
 assert.equal(a.state().petEffects.songRain,wave,'song must extend the existing chain');assert.ok(wave.issued>3&&wave.issued<=6);
 assert.ok(wave.until<=wave.hardUntil&&wave.hardUntil-wave.started<=12000);
 c.setTime(wave.hardUntil);const before=damage();a.tickPetEffects(wave.hardUntil);assert.equal(damage(),before,'rain cannot continue at or after the hard end');
});
test('song rain is cancelled when its source companion leaves or dies',async()=>{
 for(const mode of ['switched','dead']){
  const {a,c,p,damage}=await setup('performer','magic-support');a.emitEvent('buff');
  if(mode==='switched')a.setPet('second');else p.pets[0].hp=0;
  c.setTime(1002000);const before=damage();a.tickPetEffects(1002000);assert.equal(damage(),before,mode);
 }
});

test('priest protected counter comes from actual shield casting and later incoming HP damage',async()=>{
 const {a,c,p,foe,damage}=await setup('priest','defense-support');p.firstJobLevel=50;p.jobSkills.bless=10;
 c.chooseMonsterTarget=()=> 'player';c.Math.random=()=>0;
 a.playerAttack(true,'bless');assert.equal(damage(),0);assert.ok(a.state().petEffects.shield>0);
 c.setTime(1004000);foe.hit=1e9;foe.atk=a.stat('hp');
 for(let i=0;i<25&&p.hp>0&&damage()===0;i++){a.enemyAttack();foe.atk*=2;}
 assert.ok(p.hp>0);assert.ok(a.state().report.metrics.playerTaken>0);assert.ok(damage()>0,'actual guarded HP damage must produce counter');
});

for(const job of ['crusader','hunter'])test(job+' guarding is self-bound; only the currently landed target receives the later follow-up',async()=>{
 const {a,c,foe}=await setup(job,'defense-support');const other={...foe,instanceId:'new-landed-target'};
 a.emitEvent('shield');c.setTime(1004000);a.setEnemies([other,foe]);a.emitEvent('thirdHit_'+job);
 assert.ok(other.hp<1e9);assert.equal(foe.hp,1e9,'the prior target is not struck without a fresh hit');
});
test('sage guard-autospell rejects expired protection even between combat timer ticks',async()=>{
 const {a,c,damage}=await setup('sage','defense-support');a.grantPetShield(1000,true);
 c.setTime(1006500);a.emitEvent('autospell');assert.equal(damage(),0,'expired shield values cannot authorize an auto chase');
});
test('stable-health knight uses the65% gate and its haste ends exactly at its own boundary',async()=>{
 const {a,c,p,damage}=await setup('knight','attack-support');const max=a.stat('hp'),speed=a.stat('speed');
 p.hp=Math.ceil(max*.65)-1;a.emitEvent('thirdHit_knight');assert.equal(damage(),0);
 p.hp=Math.ceil(max*.65);a.emitEvent('thirdHit_knight');assert.ok(damage()>0);assert.ok(a.stat('speed')<speed);
 c.setTime(1003500);assert.equal(a.stat('speed'),speed);
});
