import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spiritSinglePetProfile} from '../dist/spirit-single-pet-profiles.js';
import {createSpiritProcState,advanceSpiritProc} from '../dist/spirit-single-pet-procs.js';
import vm from 'node:vm';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const between=(start,end)=>game.slice(game.indexOf(start),game.indexOf(end,game.indexOf(start)));

test('commander inherited HP changes the actual companion max HP used by combat, healing and UI',()=>{
 const snippet=between('function petStats(pet){','function basePetStats(pet){');
 const pet={id:'pet-1'},player={job:'spiritCommander',activePetId:'pet-1',gear:{},attributes:{}};
 const context={player,basePetStats:()=>({hp:2000,def:100}),commanderTransferredPetStats:()=>({hp:3800}),Math};
 vm.runInNewContext(snippet+'\nthis.stats=petStats',context);
 assert.equal(context.stats(pet).hp,3800);
 assert.equal(context.stats(pet).def,100);
 assert.equal(context.stats({id:'benched'}).hp,2000);
 player.job='pactWarrior';
 assert.equal(context.stats(pet).hp,2000,'existing jobs and Pact do not inherit vitality');
 assert.match(game,/max:petStats\(pet\)\.hp/,'healing targets the effective maximum');
 assert.match(game,/petStats\(pet\)\.hp\*\.5/,'revival targets the effective maximum');
});

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

test('pact six-fusion assimilation retains separate physical and magical scales',()=>{
 const assimilation=between('function pactAssimilationBonus(','function commanderTransferredPetStats(');
 assert.match(assimilation,/spiritSinglePetProfile\(player,activePet\(\)\)\?\.fusion/);
 assert.match(assimilation,/'magic-defense':\{atk:3\.20,matk:20\.0\}/);
 assert.match(assimilation,/'magic-support':\{atk:3\.20,matk:20\.0\}/);
 assert.match(assimilation,/'defense-support':\{atk:20\.0,matk:1\.65\}/);
 assert.match(assimilation,/def:\.42,mdef:\.42,hp:\.28/);
 const warrior={job:'pactWarrior',thirdJob:true};
 assert.equal(spiritSinglePetProfile(warrior,{fusion:{main:'magic',sub:'defense'}}).kind,'magic');
 assert.equal(spiritSinglePetProfile(warrior,{fusion:{main:'magic',sub:'support'}}).kind,'magic');
 assert.equal(spiritSinglePetProfile(warrior,{fusion:{main:'attack',sub:'magic'}}).kind,'hybrid');
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

test('commander spellblade attunement applies only to pure-magic fusion pets',()=>{
 const inherited=between('function commanderTransferredPetStats(','function setPetStance(');
 assert.match(inherited,/spiritSinglePetProfile\(player,pet\)\?\.kind==='magic'/);
 assert.match(inherited,/Math\.round\(inherited\.atk\*\.55\)/);
 assert.match(inherited,/synced\.matk\+=magicAttunement/);
 const commander={job:'spiritCommander',thirdJob:true};
 assert.equal(spiritSinglePetProfile(commander,{fusion:{main:'magic',sub:'defense'}}).kind,'magic');
 assert.equal(spiritSinglePetProfile(commander,{fusion:{main:'magic',sub:'support'}}).kind,'magic');
 assert.equal(spiritSinglePetProfile(commander,{fusion:{main:'attack',sub:'magic'}}).kind,'hybrid');
 assert.equal(spiritSinglePetProfile(commander,{fusion:{main:'defense',sub:'support'}}).kind,'hybrid');
});

test('commander attack-defense converts bounded inherited defense into active offense',()=>{
 const inherited=between('function commanderTransferredPetStats(','function setPetStance(');
 assert.match(inherited,/fusion==='attack-defense'/);
 assert.match(inherited,/Math\.min\(\(inherited\.def\+inherited\.mdef\)\*\.18,170000\)/);
 assert.match(inherited,/synced\.atk\+=bulwarkPower/);
 assert.doesNotMatch(inherited,/bulwarkCounter|bulwarkRetaliation/);
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

test('commander defense-support uses proactive defense and healing damage, not retaliation',()=>{
 const petAttack=between('function petAttack(','function absorbDamageWithMana(');
 const inherited=between('function commanderTransferredPetStats(','function setPetStance(');
 const profile=spiritSinglePetProfile({job:'spiritCommander',thirdJob:true},{fusion:{main:'defense',sub:'support'}});
 assert.equal(profile.trigger,'petHit');
 assert.equal(profile.effect,'guardianVerdict');
 assert.match(inherited,/guardTempo=18/);
 assert.match(petAttack,/timers\.guardianVerdictAt/);
 assert.match(petAttack,/healingPower:effective\+\(healing-effective\)\*\.25/);
 assert.match(petAttack,/multiTargets\(enemies,selected,3/);
 assert.doesNotMatch(petAttack,/spiritGuardianWave|spiritGuardianTempoUntil/);
});

test('both pact and commander share linked defeat, while legacy jobs are untouched',()=>{
 const snippet=between('function resolveSpiritPairDefeat(','function enemyAttack(');
 const create=(job,ownerHp,petHp,trial=false)=>{
  const pet={id:'a',hp:petHp},player={job,hp:ownerHp,autoRevive:true,trialRun:trial?{map:'trial'}:null};
  const calls=[];
  const context={player,activePet:()=>pet,gameNow:()=>10000,PET_REVIVE_MS:3000,PLAYER_REVIVE_MS:10000,offlineMetrics:null,
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

test('offline linked defeats distinguish boss attacks from ordinary mobs',()=>{
 const defeat=between('function resolveSpiritPairDefeat(','function enemyAttack(');
 const player={job:'spiritCommander',hp:100,trialRun:null,autoRevive:true};
 const pet={hp:0,reviveAt:100};
 const metrics={};
 const ctx={player,enemy:{id:'dawn-archon',boss:true},offlineMetrics:metrics,activePet:()=>pet,
  gameNow:()=>1000,PET_REVIVE_MS:3000,PLAYER_REVIVE_MS:10000,
  stat:()=>100,petStats:()=>({hp:100}),commanderTransferredPetStats:()=>({hp:100}),
  stopAutoFusion:()=>{},endReport:()=>{},message:()=>{},save:()=>{}};
 vm.runInNewContext(defeat+'\nthis.defeat=resolveSpiritPairDefeat',ctx);
 assert.equal(ctx.defeat(),true);
 assert.equal(metrics.spiritDefeats.boss,1);
 assert.equal(metrics.spiritDefeats.mob,0);
});

test('reviving a linked pair restores both sides, including an unexpired pet timer',()=>{
 const snippet=between('function revive(mode=','function useItem(');
 const pet={id:'pet',hp:0,sp:0,reviveAt:25000},player={job:'spiritCommander',hp:0,mp:0,gold:100,trialDefeated:false,pets:[pet],activePetId:'pet',location:'field',manualPaused:false};
 const context={player,activePet:()=>pet,gameNow:()=>11000,deathRemaining:()=>0,reviveCost:()=>10,
  stat:key=>key==='hp'?2000:500,petStats:()=>({hp:4000,sp:100}),isSpiritJob:()=>true,
  $:()=>({style:{}}),auto:false,timers:{},toast:()=>{},homeTown:()=> 'village',message:()=>{},spawn:()=>{},save:()=>{}};
 vm.runInNewContext(snippet+'\nthis.revive=revive',context);
 context.revive('place');
 assert.equal(player.hp,1000);
 assert.equal(pet.hp,2000);
 assert.equal(pet.reviveAt,undefined);
 player.hp=0;pet.hp=0;pet.reviveAt=25000;
 context.revive('town');
 assert.equal(player.hp,2000);
 assert.equal(player.mp,500);
 assert.equal(pet.hp,4000);
 assert.equal(pet.sp,100);
});

test('insufficient gold auto-revive returns the linked pair home alive',()=>{
 const snippet=between('function autoRevivePlayer(','function showCaptureReward(');
 const pet={id:'pet',hp:0,sp:0,reviveAt:8000},player={job:'spiritCommander',hp:0,mp:0,gold:0,pets:[pet],location:'field',autoRevive:true,reviveAt:8000};
 const context={player,gameNow:()=>15000,PLAYER_REVIVE_MS:10000,auto:true,offlineMetrics:null,
  reviveCost:()=>100,stat:key=>key==='hp'?1000:300,petStats:()=>({hp:2000,sp:200}),isSpiritJob:()=>true,activePet:()=>pet,
  timers:{},spawn:()=>{},message:()=>{},homeTown:()=> 'village',offlineSimulation:true,save:()=>{}};
 vm.runInNewContext(snippet+'\nthis.autoRevive=autoRevivePlayer',context);
 assert.equal(context.autoRevive(),true);
 assert.equal(player.location,'village');
 assert.equal(player.hp,1000);
 assert.equal(pet.hp,2000);
 assert.equal(pet.reviveAt,undefined);
});
