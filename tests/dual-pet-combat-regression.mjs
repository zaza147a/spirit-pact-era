// Regression checks for the dual-pet feature branch. Run: node tests/dual-pet-combat-regression.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const game = readFileSync(new URL('../dist/game.js', import.meta.url), 'utf8');
const formation = readFileSync(new URL('../dist/dual-pet-formation.js', import.meta.url), 'utf8');
const loadFunction = (source, name, nextName) => {
  const start = source.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' missing');
  const end = source.indexOf('\nfunction ' + nextName + '(', start);
  assert.ok(end > start, nextName + ' boundary missing');
  return source.slice(start, end);
};
const isSpiritJob = job => ['spiritist','pactWarrior','spiritCommander'].includes(job);
const rosterCode = formation.replace(/^import .*;\s*$/gm, '').replace(/\bexport /g, '');
const formationContext = {isSpiritJob};
vm.runInNewContext(rosterCode + '\nthis.api={activePetRoster,secondPetDamageFactor}', formationContext);
const {activePetRoster, secondPetDamageFactor} = formationContext.api;
const pets = [{id:'one',hp:100,sp:100,level:100,nickname:'A'},{id:'two',hp:100,sp:100,level:100,nickname:'B'}];
const player = job => ({job,level:210,hp:100,pets:structuredClone(pets),activePetId:'one',secondaryPetId:'two',petStances:{}});
const combatCode = loadFunction(game,'combatPetFactor','pactAssimilationBonus');
for (const [job,petId,expected,overload] of [
  ['wizard','one',1,false],['spiritist','one',1,false],['spiritist','two',.5,false],
  ['spiritCommander','one',1,false],['spiritCommander','two',.7,false],
  ['spiritCommander','two',1,true],['pactWarrior','one',.5,false],
  ['pactWarrior','two',.35,false],['spiritist','unknown',0,false]
]) {
  const p=player(job);
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
console.log('Dual-pet factor and revive/potion regression checks passed.');
