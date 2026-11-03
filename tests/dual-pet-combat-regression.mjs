// Regression checks for the dual-pet feature branch. Run: node tests/dual-pet-combat-regression.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const game = readFileSync(new URL('../dist/game.js', import.meta.url), 'utf8');
const formation = readFileSync(new URL('../dist/dual-pet-formation.js', import.meta.url), 'utf8');
const loadFunction = (source, name, nextName) => {
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' missing');
  let end = source.indexOf('\nfunction ' + nextName + '(', start);
  if(end < 0)end = source.indexOf('\nasync function ' + nextName + '(', start);
  assert.ok(end > start, nextName + ' boundary missing');
  return source.slice(start, end);
};
const isSpiritJob = job => ['spiritist','pactWarrior','spiritCommander'].includes(job);
const rosterCode = formation.replace(/^import .*;\s*$/gm, '').replace(/\bexport /g, '');
const formationContext = {isSpiritJob};
vm.runInNewContext(rosterCode + '\nthis.api={activePetRoster,secondPetDamageFactor}', formationContext);
const {activePetRoster, secondPetDamageFactor} = formationContext.api;
const pets = [{id:'one',hp:100,sp:100,level:100,nickname:'A'},{id:'two',hp:100,sp:100,level:100,nickname:'B'}];
const player = job => ({job,level:210,hp:100,pets:structuredClone(pets),activePetId:'one',secondaryPetId:'two',petStances:{},tacticEffect:null,tacticReadyAt:0});
const tacticCode=loadFunction(game,'currentTactic','classTactic');
const tacticContext={player:player('spiritCommander'),offlineSimulation:false,gameNow:()=>1000,tacticActive:(p,now)=>p.tacticEffect?.until>now?p.tacticEffect:null};
vm.runInNewContext(tacticCode+'\nthis.active=currentTactic',tacticContext);
assert.equal(tacticContext.active(),null,'balance baseline must disable manual tactics');
tacticContext.player.tacticEffect={kind:'duet',until:2000};
assert.notEqual(tacticContext.active(),null,'active manual tactic would skew live DPS');
tacticContext.offlineSimulation=true;
assert.equal(tacticContext.active(),null,'offline combat must ignore manual tactics');
const combatCode = loadFunction(game,'combatPetFactor','pactAssimilationBonus');
for (const [job,petId,expected,overload] of [
  ['wizard','one',1,false],['spiritist','one',1,false],['spiritist','two',.5,false],
  ['spiritCommander','one',1,false],['spiritCommander','two',.7,false],
  ['spiritCommander','two',1,true],['pactWarrior','one',.5,false],
  ['pactWarrior','two',.35,false],['spiritist','unknown',0,false]
]) {
  const p=player(job);p.thirdJob=overload;
  const context={player:p,secondPetDamageFactor,classBuffs:{dualOverload:overload?{until:2000}:null},gameNow:()=>1000};
  vm.runInNewContext(combatCode+'\nthis.factor=combatPetFactor',context);
  assert.equal(context.factor(petId),expected,job+' '+petId+' id');
  if(petId!=='unknown')assert.equal(context.factor(p.pets.find(p=>p.id===petId)),expected,job+' '+petId+' object');
}
const selectCode=loadFunction(game,'autoUsePotions','autoBuyPotions');
const p=player('spiritist');
p.pets[1].hp=0;p.pets[1].reviveAt=500;
p.autoPotions={playerHp:true,playerSp:true,petHp:true,petSp:true};p.potionThresholds={petHp:45};
p.potionPriority={};p.bag=[{id:'red_small',qty:3}];p.mp=100;
const context={player:p,auto:true,offlineMetrics:null,dirty:false,isControlled:()=>false,
  stat:()=>100,activePetRoster,petStats:()=>({hp:100,sp:100}),gameNow:()=>400,
  PET_REVIVE_MS:1000,preferredPotion:()=>p.bag[0].qty?{id:'red_small'}:null,
  ITEMS:{red_small:{name:'red'}},potionRestore:()=>50,
  consumeStack:()=>{p.bag[0].qty--},message:()=>{}};
vm.runInNewContext(selectCode+'\nthis.use=autoUsePotions',context);
context.use();assert.equal(p.pets[1].hp,0,'cannot revive before cooldown');
context.gameNow=()=>501;context.use();assert.equal(p.pets[1].hp,50,'second pet revives after cooldown');
assert.equal(p.bag[0].qty,2,'exactly one potion consumed');

const spiritSource=readFileSync(new URL('../dist/spirit-job-rules.js',import.meta.url),'utf8')
  .replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,'');
const spiritContext={};
vm.runInNewContext(spiritSource+
  '\nthis.api={canonicalDualFusionKey,DUAL_FUSION_TYPES}',spiritContext);
const {canonicalDualFusionKey,DUAL_FUSION_TYPES}=spiritContext.api;
const resonanceSource=readFileSync(new URL('../dist/dual-fusion-resonance.js',import.meta.url),'utf8')
  .replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,'');
const resonanceContext={canonicalDualFusionKey,DUAL_FUSION_TYPES};
vm.runInNewContext(resonanceSource+
  '\nthis.api={dualSpiritResonance,canTriggerDualSpirit}',resonanceContext);
const {dualSpiritResonance,canTriggerDualSpirit}=resonanceContext.api;
assert.equal(DUAL_FUSION_TYPES.length,21);
const fused=(key,id)=>{
  const [main,sub]=key.split('-');
  return {id,hp:100,fusion:{main,sub}};
};
let validated=0;
for(const job of ['pactWarrior','spiritCommander']){
  for(const key of DUAL_FUSION_TYPES){
    const [first,second]=key.split('+');
    const roster=[fused(first,'first'),fused(second,'second')];
    const state={job,thirdJob:true};
    const rule=dualSpiritResonance(state,roster);
    assert.equal(rule?.key,key);
    assert.equal(dualSpiritResonance(state,[...roster].reverse())?.key,key);
    assert.ok(canTriggerDualSpirit(rule,'thirdHit_'+job,100000,0,'target'));
    assert.ok(!canTriggerDualSpirit(rule,'pet',100000,0,'target'));
    assert.ok(!canTriggerDualSpirit(rule,'thirdHit_'+job,100001,100000,'target'));
    assert.ok(canTriggerDualSpirit(rule,'thirdHit_'+job,100000+rule.cooldownMs,100000,'target'));
    assert.equal(dualSpiritResonance(state,[roster[0],{...roster[1],hp:0}]),null);
    assert.equal(dualSpiritResonance(state,[roster[0]]),null);
    assert.equal(dualSpiritResonance({...state,thirdJob:false},roster),null);
    validated++;
  }
}
assert.equal(validated,42);


const triggerSource=loadFunction(game,'triggerDualSpiritResonance','emitEvent');
let liveTriggers=0;
for(const job of ['pactWarrior','spiritCommander']){
  for(const key of DUAL_FUSION_TYPES){
    const [a,b]=key.split('+');
    const companions=[fused(a,'first'),fused(b,'second')];
    companions[0].nickname='First';companions[1].nickname='Second';
    const target={instanceId:'boss',hp:1e9,def:10};
    const clock={now:100000}, messages=[];
    const runContext={
      player:{job,thirdJob:true,pets:companions,activePetId:'first',secondaryPetId:'second'},
      enemy:target,enemies:[target],report:{dualPetDamage:{first:0,second:0,dualResonance:0}},
      timers:{dualSpiritAt:0},dualSpiritResonance,canTriggerDualSpirit,
      activePetRoster:()=>companions,gameNow:()=>clock.now,
      petStats:()=>({atk:100,matk:100,hp:1000}),stat:()=>100,
      companionRole:pet=>pet.fusion.main,grantPetShield:value=>value,effectsForPet:()=>({}),
      healPetParty:value=>value,monsterDefenseAgainst:()=>10,hitDamage:value=>value,
      dealDamage:value=>{target.hp-=value;return value},
      multiTargets:()=>[target],encounterLimit:()=>3,
      message:()=>messages.push(1),award:()=>{},selectEncounterTarget:()=>target
    };
    vm.runInNewContext(triggerSource+'\nthis.fire=triggerDualSpiritResonance',runContext);
    runContext.fire('thirdHit_'+job);
    runContext.fire('thirdHit_'+job);
    assert.equal(messages.length,1,job+' '+key+' duplicate during cooldown');
    clock.now+=12000;
    runContext.fire('thirdHit_'+job);
    assert.equal(messages.length,2,job+' '+key+' ready after cooldown');
    liveTriggers++;
  }
}
assert.equal(liveTriggers,42);


const tickSource=loadFunction(game,'combatTick','simulateOffline');
function runDualTick(firstHp,secondHp,offline=false){
  const state=player('spiritCommander');
  state.pets[0].hp=firstHp;state.pets[1].hp=secondHp;
  state.autoUltimate=false;state.resonance=0;
  const foe={hp:9999,aspd:100,lastAttack:0},actions=[];
  const tickContext={
    player:state,enemy:foe,enemies:[foe],auto:true,offlineSimulation:offline,
    inCombatTick:false,petShield:0,petEffects:{shield:0},
    timers:{regen:100000,potions:100000,ultimate:100000},casting:null,
    activePetRoster,secondPetDamageFactor,
    combatPetFactor:id=>secondPetDamageFactor(state,id),
    petStats:()=>({sp:100}),clearStatSnapshots:()=>{},
    tickTrialControl:()=>{},tickEncounters:()=>{},chooseAttackTarget:()=>{},
    autoCapturePet:()=>{},tickPetEffects:()=>{},autoUsePotions:()=>{},
    enemyAttack:()=>{},aspdAttackIntervalMs:()=>100,
    selectEncounterTarget:()=>foe,
    petAutoAbility:pet=>actions.push('ability:'+pet.id),
    petAttack:pet=>actions.push('attack:'+pet.id),
    autoCastJobs:()=>{},playerAttack:()=>{},ultimate:()=>{},
    isTown:()=>false,$:()=>({style:{display:'none'}}),render:()=>{}
  };
  vm.runInNewContext(tickSource+'\nthis.tick=combatTick',tickContext);
  tickContext.tick(100000);
  return actions.join(',');
}
assert.equal(runDualTick(100,100),'ability:one,attack:one,ability:two,attack:two');
assert.equal(runDualTick(0,100),'ability:two,attack:two');
assert.equal(runDualTick(100,0),'ability:one,attack:one');
assert.equal(runDualTick(100,100,true),'ability:one,attack:one,ability:two,attack:two');

console.log('Dual-pet factors, potions, tactics, combat ticks and 42 resonances passed.');
