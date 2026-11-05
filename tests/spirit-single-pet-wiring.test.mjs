import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spiritSinglePetProfile} from '../dist/spirit-single-pet-profiles.js';
import {createSpiritProcState,advanceSpiritProc} from '../dist/spirit-single-pet-procs.js';
import vm from 'node:vm';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const between=(start,end)=>game.slice(game.indexOf(start),game.indexOf(end,game.indexOf(start)));

test('owner main attacks use the pact pet profile and its damage channel',()=>{
 const playerAttack=between('function playerAttack(','function autoCastJobs(');
 assert.match(playerAttack,/spiritMainProfile\(chosen\)/);
 assert.match(playerAttack,/spiritAttackIsMagic\(spiritMorph/);
 assert.match(playerAttack,/offensiveSource\(spiritMorph\?/);
 assert.match(playerAttack,/action=spiritMorph\?\.name/);
 const p=spiritSinglePetProfile({job:'pactWarrior',thirdJob:false},{role:'magic'});
 assert.equal(p.source,'owner');
 assert.equal(p.kind,'magic');
});

test('commander pet attacks apply the one fused pet profile without extra pet lanes',()=>{
 const petAttack=between('function petAttack(','function absorbDamageWithMana(');
 assert.match(petAttack,/spiritSinglePetProfile\(player,pet\)/);
 assert.match(petAttack,/attackSource=morph\?/);
 assert.match(petAttack,/hitDamage\(attackSource,/);
 const p=spiritSinglePetProfile({job:'spiritCommander',thirdJob:true},{fusion:{main:'magic',sub:'support'}});
 assert.equal(p.source,'pet');
 assert.equal(p.fusion,'magic-support');
});

test('real damage hook grants one bounded bonus to the correct owner or pet lane',()=>{
 const snippet=between('function spiritAttackProcBonus(','function pactAssimilationBonus(');
 const pet={id:'a',species:'fang',hp:100};
 const make=job=>{
  const context={player:{job,thirdJob:false,hp:100},enemy:{id:'mob',instanceId:'mob-1'},
   activePet:()=>pet,stat:()=>100,petStats:()=>({hp:100}),
   spiritSinglePetProfile,createSpiritProcState,advanceSpiritProc,
   spiritProcState:createSpiritProcState(),gameNow:()=>10000,
   bossHitMeta:{magical:false,skillId:'main'}};
  vm.runInNewContext(snippet+'\nthis.proc=spiritAttackProcBonus',context);
  return context;
 };
 const pact=make('pactWarrior');
 assert.equal(pact.proc('petDamage'),0);
 assert.equal(pact.proc('playerDamage'),0);
 assert.equal(pact.proc('playerDamage'),0);
 assert.equal(pact.proc('playerDamage'),12);
 assert.equal(pact.proc('playerDamage',true),0,'secondary target must not duplicate a proc');
 const commander=make('spiritCommander');
 assert.equal(commander.proc('playerDamage'),0);
 assert.equal(commander.proc('petDamage'),0);
 assert.equal(commander.proc('petDamage'),13);
 commander.player.thirdJob=true;
 assert.equal(commander.proc('petDamage'),0,'third jobs require a fused companion');
});

test('pact warrior cannot leak companion damage through direct skill, counter or resonance calls',()=>{
 const petDamage=between('function dealPetDamage(','function playerAttack(');
 assert.match(petDamage,/if\(player\?\.job==='pactWarrior'\)return 0/);
 const ctx={player:{job:'pactWarrior'}};
 // The early return must occur before any combat service is accessed.
 vm.runInNewContext(petDamage+'\nthis.damage=dealPetDamage',ctx);
 assert.equal(ctx.damage(99999,'petDamage',{id:'pet'}),0);
 assert.equal(ctx.damage(99999,'resonanceDamage',{id:'pet'}),0);
});

test('incoming real damage hooks schedule a single reactive owner or pet bonus',()=>{
 const snippet=between('function spiritReactiveEvent(','function pactAssimilationBonus(');
 const pet={id:'pet',species:'shell',hp:90},player={job:'pactWarrior',thirdJob:false,hp:90};
 const context={player,enemy:{id:'mob'},activePet:()=>pet,
  spiritSinglePetProfile,advanceSpiritProc,createSpiritProcState,
  spiritProcState:createSpiritProcState(),spiritReactiveCharge:null,
  stat:()=>100,petStats:()=>({hp:100}),gameNow:()=>10000,
  grantPlayerShield:()=>{},effectsForPet:()=>({shield:0}),bossHitMeta:{magical:false}};
 vm.runInNewContext(snippet+'\nthis.event=spiritReactiveEvent;this.hit=spiritAttackProcBonus',context);
 assert.equal(context.event('petDamaged'),null);
 assert.equal(context.event('ownerDamaged')?.effect,'retaliation');
 assert.equal(context.hit('petDamage'),0);
 assert.equal(context.hit('playerDamage'),10);
 assert.equal(context.hit('playerDamage'),0,'reactive charge is consumed once');
 context.player.job='spiritCommander';
 context.spiritProcState=createSpiritProcState();
 assert.equal(context.event('petDamaged')?.effect,'guardCounter');
 assert.equal(context.hit('playerDamage'),0);
 assert.equal(context.hit('petDamage'),10);
});

test('both pact and commander share linked defeat, while legacy jobs are untouched',()=>{
 const snippet=between('function resolveSpiritPairDefeat(','function enemyAttack(');
 const create=(job,ownerHp,petHp,trial=false)=>{
  const pet={id:'a',hp:petHp},player={job,hp:ownerHp,autoRevive:true,trialRun:trial?{map:'trial'}:null};
  const calls=[];
  const context={player,activePet:()=>pet,gameNow:()=>10000,PET_REVIVE_MS:3000,PLAYER_REVIVE_MS:10000,
   exitTrial:()=>calls.push('trial'),stopAutoFusion:()=>calls.push('stop'),endReport:()=>calls.push('report'),
   message:()=>calls.push('message'),save:()=>calls.push('save'),showReviveDialog:()=>calls.push('dialog')};
  vm.runInNewContext(snippet+'\nthis.defeat=resolveSpiritPairDefeat',context);
  return {context,player,pet,calls};
 };
 const pact=create('pactWarrior',0,100);
 assert.equal(pact.context.defeat(),true);
 assert.equal(pact.pet.hp,0);
 assert.ok(pact.player.reviveAt>10000);
 const commander=create('spiritCommander',100,0);
 assert.equal(commander.context.defeat(),true);
 assert.equal(commander.player.hp,0);
 assert.ok(commander.calls.includes('report'));
 const trial=create('spiritCommander',100,0,true);
 assert.equal(trial.context.defeat(),true);
 assert.deepEqual(trial.calls,['trial']);
 const knight=create('knight',0,100);
 assert.equal(knight.context.defeat(),false);
 assert.equal(knight.pet.hp,100);
});
