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
const canonicalFusionKey = pet => { const roles=pet?.fusion?[pet.fusion.main,pet.fusion.sub]:typeof pet?.fusionKey==='string'?pet.fusionKey.split('-'):[]; return roles.length===2?[...roles].sort().join('-'):null; };
const formationContext = {isSpiritJob,canonicalFusionKey};
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
  '\nthis.api={canonicalDualFusionKey,DUAL_FUSION_TYPES,FUSION_TYPES}',spiritContext);
const {canonicalDualFusionKey,DUAL_FUSION_TYPES}=spiritContext.api;
const resonanceSource=readFileSync(new URL('../dist/dual-fusion-resonance.js',import.meta.url),'utf8')
  .replace(/^import .*;\s*$/gm,'').replace(/\bexport /g,'');
const resonanceContext={canonicalDualFusionKey,DUAL_FUSION_TYPES,FUSION_TYPES:spiritContext.FUSION_TYPES};
vm.runInNewContext(resonanceSource+
  '\nthis.api={dualSpiritResonance,canTriggerDualSpirit}',resonanceContext);
const {dualSpiritResonance,canTriggerDualSpirit}=resonanceContext.api;
assert.equal(DUAL_FUSION_TYPES.length,15);
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
assert.equal(validated,30);


const triggerSource=loadFunction(game,'triggerDualSpiritResonance','emitEvent');
let liveTriggers=0;
for(const job of ['pactWarrior','spiritCommander']){
  for(const key of DUAL_FUSION_TYPES){
    const [a,b]=key.split('+');
    const companions=[fused(a,'first'),fused(b,'second')];
    companions[0].nickname='First';companions[1].nickname='Second';
    const index=DUAL_FUSION_TYPES.indexOf(key);
    const target={instanceId:'boss',hp:index===4?1e8:1e9,maxHp:1e9,def:10,boss:true};
    const clock={now:100000}, messages=[],effects={shields:0,heals:0};
    const runContext={
      player:{job,thirdJob:true,pets:companions,activePetId:'first',secondaryPetId:'second'},
      enemy:target,enemies:index===5?[target,{instanceId:'other',hp:100}]:[target],report:{dualPetDamage:{first:0,second:0,dualResonance:0}},
      timers:{dualSpiritAt:0},dualSpiritResonance,canTriggerDualSpirit,
      activePetRoster:()=>companions,gameNow:()=>clock.now,
      petStats:()=>({atk:100,matk:100,hp:1000}),stat:()=>100,
      companionRole:pet=>pet.fusion.main,grantPetShield:value=>{effects.shields++;return value},effectsForPet:()=>({}),
      healPetParty:value=>{effects.heals++;return value},monsterDefenseAgainst:()=>10,hitDamage:value=>value,
      dealDamage:value=>{target.hp-=value;return value},
      multiTargets:()=>[target],encounterLimit:()=>3,
      message:()=>messages.push(1),award:()=>{},selectEncounterTarget:()=>target
    };
    vm.runInNewContext(triggerSource+'\nthis.fire=triggerDualSpiritResonance',runContext);
    const rule=dualSpiritResonance(runContext.player,companions);
    const hpBefore=target.hp;
    runContext.fire('thirdHit_'+(job==='pactWarrior'?'spiritCommander':'pactWarrior'));
    assert.equal(messages.length,0,job+' '+key+' rejects the other route');
    runContext.fire('thirdHit_'+job);
    const delta=hpBefore-target.hp,credited=runContext.report.dualPetDamage.dualResonance;
    if(['pierce','burst','cleave'].includes(rule.trait)){
      assert.ok(delta>0&&credited>0,job+' '+key+' must deal and credit damage');
      assert.ok(Math.abs(delta-credited)<.001,job+' '+key+' damage credit matches real HP loss');
    }else{
      assert.equal(credited,0,job+' '+key+' support cannot fabricate DPS credit');
      assert.equal(delta,0,job+' '+key+' support should not inflict direct damage');
    }
    if(rule.trait==='guard')assert.ok(effects.shields>=1,job+' '+key+' shield');
    if(rule.trait==='heal')assert.ok(effects.heals>=1,job+' '+key+' heal');
    if(rule.trait==='focus')assert.ok(target.exposedUntil>clock.now&&target.exposedPower>0,job+' '+key+' expose');
    if(index<6)assert.ok(rule.signature,job+' '+key+' requires a unique conditional signature');
    if(index===0)assert.ok(target.exposedPower>=.025,'armor echo applies only after a defended target');
    if(index===1)assert.ok(effects.heals>=1,'rescue guard heals an injured companion');
    if(index===2)assert.ok(effects.shields>=1,'recovery chain wards an injured companion');
    if(index===3)assert.ok(target.exposedPower>=.03,'boss trace weakens a boss');
    if(index===4)assert.ok(target.exposedPower>=.08,'finisher focus strengthens exposed vulnerability');
    if(index===5)assert.ok(effects.shields>=1,'crowd ward shields during multiple enemies');
    if(index>=6&&index<12)assert.ok(rule.signature,job+' '+key+' defensive signature exists');
    if(index===6)assert.ok(effects.heals>=1,'fortress counter heals when both companions are injured');
    if(index===7)assert.ok(effects.shields>=1,'sacred relay wards a critical companion');
    if(index===8)assert.ok(target.exposedPower>=.02,'ward pierce exposes while a defensive fusion is present');
    if(index===9)assert.ok(effects.shields>=3,'shield cascade shields both companions in addition to base guard');
    if(index===10)assert.ok(effects.heals>=1,'last stand heals in critical danger');
    if(index===11)assert.ok(effects.shields>=1,'mutual renewal grants recovery ward');
    runContext.fire('thirdHit_'+job);
    assert.equal(messages.length,1,job+' '+key+' duplicate during cooldown');
    clock.now+=12000;
    runContext.fire('thirdHit_'+job);
    assert.equal(messages.length,2,job+' '+key+' ready after cooldown');
    liveTriggers++;
  }
}
assert.equal(liveTriggers,30);


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
    commanderTransferredPetStats:(pet,stats)=>stats,
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


const commanderTransferCode=loadFunction(game,'commanderTransferredPetStats','setPetStance');
for(const job of ['pactWarrior','spiritCommander']){
 const commander=player(job),input={atk:1000,matk:1000,def:500,mdef:500};
 const ctx={player:commander,activePetRoster:()=>commander.pets,stat:key=>({atk:200,matk:400,def:100,mdef:80})[key]||0};
 vm.runInNewContext(commanderTransferCode+'\nthis.transfer=commanderTransferredPetStats',ctx);
 const result=ctx.transfer(commander.pets[0],input);
 if(job==='spiritCommander'){
  assert.equal(result.atk,1060);
  assert.equal(result.matk,1120);
  assert.equal(result.def,535);
  assert.equal(result.mdef,528);
  // Only legal different fusion types can now form a dual roster.
  commander.pets[0].fusion={main:'attack',sub:'magic'};
  commander.pets[1].fusion={main:'defense',sub:'support'};
  assert.equal(ctx.transfer(commander.pets[0],input).def,535,'mixed pairs preserve the existing defensive transfer');
  assert.equal(input.atk,1000,'cached petStats must not be mutated');
  commander.pets[0].hp=0;
  assert.equal(ctx.transfer(commander.pets[0],input),input,'dead pet receives no transfer');
 }else assert.equal(result,input,'other professions do not transfer commander bonuses');
}

const attackSource=loadFunction(game,'petAttack','enemyAttack');
function countPetAttacks(step){
  const party=player('spiritCommander'),foe={hp:1e12,flee:0};
  const clock={now:0},counter={one:0,two:0},timers={pet:0,petById:{}};
  const attackContext={
    player:party,enemy:foe,timers,classBuffs:{},report:null,
    SPECIES:{fang:{skill:'attack'}},gameNow:()=>clock.now,
    activePet:()=>party.pets[0],combatPetFactor:id=>secondPetDamageFactor(party,id),
    chooseAttackTarget:()=>{},petStats:()=>({aspd:193,aspdPct:0,crit:0,hit:999,ignoreDef:0}),
    commanderTransferredPetStats:(pet,stats)=>stats,
    aspdAttackIntervalMs:aspd=>Math.max(140,Math.round((200-Math.min(193,Math.max(100,aspd)))*20)),
    companionRole:()=> 'attack',hitChance:()=>1,petOffensivePower:()=>100,
    monsterDefenseAgainst:()=>0,hitDamage:damage=>damage,
    dealPetDamage:(damage,key,pet)=>{counter[pet.id]++;return damage},
    message:()=>{},damageText:()=>'',classBuffPower:()=>0,
    emitEvent:()=>{},award:()=>{},render:()=>{}
  };
  party.pets[0].species='fang';party.pets[1].species='fang';
  vm.runInNewContext(attackSource+'\nthis.attack=petAttack',attackContext);
  for(clock.now=step;clock.now<=60000;clock.now+=step)
    for(const pet of party.pets)attackContext.attack(pet,secondPetDamageFactor(party,pet.id));
  return counter;
}
for(const step of [20,100]){
  const count=countPetAttacks(step);
  assert.equal(count.one,428,'first pet ASPD 193, '+step+'ms ticks');
  assert.equal(count.two,428,'second pet ASPD 193, '+step+'ms ticks');
}

console.log('Dual-pet factors, potions, tactics, combat ticks, ASPD cadence and 30 resonances passed.');
