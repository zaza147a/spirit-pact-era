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
