import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const lo=src.indexOf('function combatTick(now=gameNow())');
const hi=src.indexOf('async function simulateOffline(',lo);
assert.ok(lo>0&&hi>lo,'actual combatTick must be extractable');
const actualCombatTick=src.slice(lo,hi);
function runTick({enemyHp=1000,playerHp=100,petHp=100,monsterReady=true}={}){
 const events=[],foe={id:'boss_worldroot',hp:enemyHp,aspd:150,lastAttack:monsterReady?0:Infinity},
 companion={id:'pet1',hp:petHp,sp:100,level:200};
 const make=new Function('events','foe','companion','playerHp',`
  let player={hp:playerHp,mp:100,shield:0,resonance:0,autoUltimate:false,pets:[companion]},
   enemy=foe,enemies=[foe],timers={petShieldExpires:Infinity,playerShieldExpires:Infinity,regen:0,potions:0},
   casting=null,inCombatTick=false,offlineSimulation=true,dirty=false,
   petShield=0,petEffects={shieldExpires:Infinity,shield:0},auto=true;
  const gameNow=()=>10000,clearStatSnapshots=()=>events.push('snapshot'),
   exitTrial=()=>events.push('trialExit'),autoRevivePlayer=()=>events.push('autoRevive'),
   showReviveDialog=()=>events.push('reviveDialog'),$=()=>({style:{display:'none'}}),
   tickTrialControl=()=>events.push('trialControl'),tickEncounters=()=>events.push('encounter'),
   chooseAttackTarget=()=>events.push('target'),autoCapturePet=()=>events.push('capture'),
   activePet=()=>companion,petStats=()=>({sp:100}),stat=()=>200,
   passiveBonus=()=>0,cardBonus=()=>0,autoUsePotions=()=>events.push('potion'),
   tickPetEffects=()=>events.push('petEffect'),aspdAttackIntervalMs=()=>140,
   enemyAttack=()=>events.push('enemyAttack'),
   selectEncounterTarget=()=>foe,
   petAutoAbility=()=>events.push('petAbility'),
   petAttack=()=>events.push('petAttack'),
   autoCastJobs=()=>events.push('autoCastJobs'),
   playerAttack=()=>events.push('playerAttack'),
   ultimate=()=>events.push('ultimate'),
   ULTIMATE_COST=100,ULTIMATE_COOLDOWN=10000;
  ${actualCombatTick}
  return {tick:combatTick,events,player,foe};
 `);
 const instance=make(events,foe,companion,playerHp);
 instance.tick(10000);
 return instance;
}
test('run ACTUAL combatTick control-flow: encounter, monster, pet, skills, attack',()=>{
 const {events}=runTick();
 const sequence=['trialControl','encounter','target','capture','potion','petEffect','enemyAttack','petAbility','petAttack','autoCastJobs','playerAttack'];
 for(const event of sequence)assert.ok(events.includes(event),'missing '+event);
 const ordered=sequence.map(x=>events.indexOf(x));
 assert.deepEqual(ordered,[...ordered].sort((a,b)=>a-b));
});
test('ACTUAL combatTick does not attack when hero is dead',()=>{
 const {events}=runTick({playerHp:0});
 assert.ok(!events.includes('playerAttack'));
 assert.ok(!events.includes('petAttack'));
});
test('ACTUAL combatTick stops at dead target',()=>{
 const {events}=runTick({enemyHp:0});
 assert.ok(!events.includes('enemyAttack'));
 assert.ok(!events.includes('petAbility'));
 assert.ok(!events.includes('playerAttack'));
});
test('ACTUAL combatTick does not use dead pet abilities',()=>{
 const {events}=runTick({petHp:0});
 assert.ok(!events.includes('petAbility'));
});
