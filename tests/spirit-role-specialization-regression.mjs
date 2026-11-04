// Isolated damage routing assertions: only new careers receive their new role bonuses.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {spiritTargetDamageFactor,spiritPetTargetFactor} from '../dist/spirit-target-damage.js';
const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const from=source.indexOf('function dealDamage('),to=source.indexOf('\nfunction targetEnemy(',from);
assert.ok(from>=0&&to>from,'production damage core found');
const snippet=source.slice(from,to);
function damage(job,level,boss,key,secondary=false){
 const player={job,level},enemy={hp:1000000,boss,dawn:false};
 const ctx={player,enemy,pendingPetCredit:0,offlineSimulation:true,offlineMetrics:null,
  report:null,activePet:()=>null,fusedPair:()=>false,isSpiritJob:()=>false,spiritTargetDamageFactor,
  jobZoneOutputFactor:()=>1,dawnArchonPreparationFactor:()=>1,
  gameNow:()=>0,currentTactic:()=>null,tacticDamageFactor:()=>1,
  record:()=>{},combatSamples:[],activePetRoster:()=>[],petEffects:{}};
 vm.runInNewContext(snippet+'\nthis.invoke=dealDamage',ctx);
 const actual=ctx.invoke(1000,key,secondary);
 assert.equal(enemy.hp,1000000-actual);
 return actual;
}
assert.equal(damage('pactWarrior',200,true,'playerDamage'),1120);
assert.equal(damage('pactWarrior',200,false,'playerDamage'),1120);
assert.equal(damage('pactWarrior',210,true,'playerDamage',true),700);
assert.equal(damage('pactWarrior',210,false,'playerDamage',true),700);
assert.equal(damage('pactWarrior',210,true,'petDamage'),1000);
assert.equal(damage('spiritCommander',210,false,'petDamage'),1000);
assert.equal(damage('spiritCommander',210,true,'petDamage'),1000);
assert.equal(damage('spiritCommander',200,false,'petDamage'),1000);
assert.equal(damage('spiritCommander',210,false,'playerDamage'),1000);
for(const job of ['crusader','knight','hunter','wizard','priest'])
 for(const key of ['playerDamage','petDamage'])
  assert.equal(damage(job,210,false,key),1000,'legacy output unchanged '+job+' '+key);
assert.equal(spiritPetTargetFactor('spiritCommander',1),.95);
assert.equal(spiritPetTargetFactor('spiritCommander',2),1);
assert.equal(spiritPetTargetFactor('spiritCommander',5),1);
assert.equal(spiritPetTargetFactor('pactWarrior',1),1);
assert.equal(spiritPetTargetFactor('crusader',1),1);
console.log(JSON.stringify({complete:true,assertions:24,pactPrimaryFactor:1.12,pactSecondaryFactor:.70,
 commanderMobAndBossFactor:1,commanderSingleTargetPetFactor:.95,monstersAndLegacyUnchanged:true}));
