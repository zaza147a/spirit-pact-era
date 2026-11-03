import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {DUAL_FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {dualSpiritResonance,canTriggerDualSpirit} from '../dist/dual-fusion-resonance.js';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const begin=game.indexOf('function triggerDualSpiritResonance(');
const end=game.indexOf('\nfunction emitEvent(',begin);
assert.ok(begin>=0&&end>begin,'resonance combat trigger present');
const trigger=game.slice(begin,end);

function run(index,job,{positive=true,withoutSignature=false}={}){
 const key=DUAL_FUSION_TYPES[index];
 const pets=key.split('+').map((fusion,i)=>{
  const [main,sub]=fusion.split('-');
  return {id:String(i),nickname:String(i),hp:positive?100:1000,fusion:{main,sub}};
 });
 const target={instanceId:'target',hp:index===4&&positive?1e8:1e9,maxHp:1e9,def:!positive&&index===0?0:10,boss:positive};
 const events={heals:0,shields:0,messages:0};
 const enemies=index===5&&positive?[target,{instanceId:'other',hp:100}]:[target];
 const ctx={
  player:{job,thirdJob:true},enemy:target,enemies,
  timers:{dualSpiritAt:0},report:{dualPetDamage:{dualResonance:0}},
  activePetRoster:()=>pets,gameNow:()=>100000,
  dualSpiritResonance:(p,r)=>{
   const rule=dualSpiritResonance(p,r);
   return rule&&withoutSignature?{...rule,signature:null}:rule;
  },
  canTriggerDualSpirit,
  petStats:()=>({atk:100,matk:100,hp:1000}),stat:()=>100,
  companionRole:p=>p.fusion.main,
  effectsForPet:()=>({}),
  grantPetShield:value=>{events.shields++;return value},
  healPetParty:value=>{events.heals++;return value},
  monsterDefenseAgainst:()=>10,hitDamage:value=>value,
  dealDamage:value=>{ctx.enemy.hp-=value;return value},
  multiTargets:()=>[target],encounterLimit:()=>3,
  message:()=>{events.messages++},award:()=>{},
  selectEncounterTarget:()=>target
 };
 vm.runInNewContext(trigger+'\nthis.fire=triggerDualSpiritResonance',ctx);
 ctx.fire('thirdHit_'+job);
 return {heals:events.heals,shields:events.shields,expose:target.exposedPower||0,damage:ctx.report.dualPetDamage.dualResonance,messages:events.messages};
}
let verified=0;
for(const job of ['pactWarrior','spiritCommander']){
 for(let i=0;i<12;i++){
  const active=run(i,job);
  const baseline=run(i,job,{withoutSignature:true});
  assert.notDeepEqual(active,baseline,'signature should change a positive scenario: '+job+' '+i);
  const inactive=run(i,job,{positive:false});
  const without=run(i,job,{positive:false,withoutSignature:true});
  assert.deepEqual(inactive,without,'inactive signature must not grant a bonus: '+job+' '+i);
  verified++;
 }
}
console.log('Dual-resonance conditional signatures: '+verified+' positive/negative pairs passed.');
