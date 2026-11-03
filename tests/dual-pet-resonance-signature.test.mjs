import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {DUAL_FUSION_TYPES,FUSION_TYPES} from '../dist/spirit-job-rules.js';
const ORIGINAL_FUSION_KEYS=FUSION_TYPES.flatMap((a,i)=>FUSION_TYPES.slice(i).map(b=>[a,b].sort().join('+')));
import {DUAL_SPIRIT_RULES,dualSpiritResonance,canTriggerDualSpirit} from '../dist/dual-fusion-resonance.js';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const begin=game.indexOf('function triggerDualSpiritResonance(');
const end=game.indexOf('\nfunction emitEvent(',begin);
assert.ok(begin>=0&&end>begin,'resonance combat trigger present');
const trigger=game.slice(begin,end);

function run(sourceIndex,job,{positive=true,withoutSignature=false,withoutRoute=false}={}){
 const key=DUAL_FUSION_TYPES[sourceIndex];
 const sourceIndex=ORIGINAL_FUSION_KEYS.indexOf(key);
 assert.ok(sourceIndex>=0,'canonical fusion must exist in original signatures');
 const pets=key.split('+').map((fusion,i)=>{
  const [main,sub]=fusion.split('-');
  return {id:String(i),nickname:String(i),hp:positive?(sourceIndex===13?1000:100):(sourceIndex===13?100:1000),fusion:{main,sub}};
 });
 const target={instanceId:'target',hp:[3,4,7,18,20].includes(sourceIndex)&&positive?1e8:1e9,maxHp:1e9,def:!positive&&sourceIndex===0?0:10,boss:positive};
 const events={heals:0,shields:0,messages:0};
 const enemies=[5,11,14,19].includes(sourceIndex)&&positive?[target,{instanceId:'other',hp:100}]:[target];
 const ctx={
  player:{job,thirdJob:true,shield:positive&&sourceIndex===9?100:0},enemy:target,enemies,
  timers:{dualSpiritAt:0},report:{dualPetDamage:{dualResonance:0}},
  activePetRoster:()=>pets,gameNow:()=>100000,
  dualSpiritResonance:(p,r)=>{
   const rule=dualSpiritResonance(p,r);
   return rule?{...rule,signature:withoutSignature?null:rule.signature,routeEffect:withoutSignature||withoutRoute?null:rule.routeEffect}:rule;
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
 return {heals:events.heals,shields:events.shields,expose:target.exposedPower||0,damage:ctx.report.dualPetDamage.dualResonance,messages:events.messages,otherExpose:enemies[1]?.exposedPower||0};
}
assert.equal(new Set(Object.values(DUAL_SPIRIT_RULES).map(x=>x.signature)).size,DUAL_FUSION_TYPES.length,'each unordered pairing has a distinct signature');
let verified=0;
for(const job of ['pactWarrior','spiritCommander']){
 for(let i=0;i<DUAL_FUSION_TYPES.length;i++){
  const active=run(i,job);
  const baseline=run(i,job,{withoutSignature:true});
  assert.notDeepEqual(active,baseline,'signature should change a positive scenario: '+job+' '+i);
  const inactive=run(i,job,{positive:false});
  const without=run(i,job,{positive:false,withoutSignature:true});
  assert.deepEqual(inactive,without,'inactive signature must not grant a bonus: '+job+' '+i);
  verified++;
 }
}
// Each first-stage pairing has distinct per-route behavior, and it must
// remain conditional rather than grant a free benefit on every activation.
assert.equal(new Set(Object.values(DUAL_SPIRIT_RULES).map(x=>x.warriorRoute)).size,DUAL_FUSION_TYPES.length);
assert.equal(new Set(Object.values(DUAL_SPIRIT_RULES).map(x=>x.commanderRoute)).size,DUAL_FUSION_TYPES.length);
let routeChecks=0;
for(const job of ['pactWarrior','spiritCommander']){
 for(let i=0;i<DUAL_FUSION_TYPES.length;i++){
  const active=run(i,job);
  const noRoute=run(i,job,{withoutRoute:true});
  assert.notDeepEqual(active,noRoute,'route effect must change its positive scenario: '+job+' '+i);
  const inactive=run(i,job,{positive:false});
  const inactiveNoRoute=run(i,job,{positive:false,withoutRoute:true});
  assert.deepEqual(inactive,inactiveNoRoute,'route effect must be conditional: '+job+' '+i);
  routeChecks++;
 }
}
console.log('Dual-resonance route differences: '+routeChecks+' positive/negative pairs passed.');
console.log('Dual-resonance conditional signatures: '+verified+' positive/negative pairs passed.');
