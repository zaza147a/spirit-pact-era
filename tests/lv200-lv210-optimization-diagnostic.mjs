// Diagnostic optimizer, not final game DPS.
// Run: node tests/lv200-lv210-optimization-diagnostic.mjs > /tmp/lingqi-120.json
import {SECOND_JOBS,parentJob} from '../dist/jobs.js';
import {GEAR_BASE,affixRange,primaryAffix} from '../dist/loot.js';
import {attributeCap} from '../dist/adventure-progression.js';
import {allocationBudget,allocationDamageMultiplier} from '../dist/growth-v5.js';
import {THIRD_MAIN_CURVES} from '../dist/third-jobs.js';
import {companionResonance} from '../dist/fusion-resonance.js';
import {fusionSkills,companionRole} from '../dist/pet-fusion.js';
import {ENHANCEMENT_POWER} from '../dist/sky-trials.js';
import {aspdAttackIntervalMs,outgoingHitDamage,jobZoneOutputFactor} from '../dist/combat-balance.js';
import {LOADOUTS,FUSIONS,STAGES} from './lv200-lv210-120-scenario-matrix.test.mjs';

// This model is deliberately separated from full game.js: it measures ONLY
// main-skill weapon sensitivity under deliberately simplified character stats.
// No real player/pet stats, inventory roll distributions, cooldowns, cast times,
// attack targeting, crit, hit, buffs, pet direct hits, SP regen or resonance events.
const SHARED_ASSUMPTIONS={
 bossDefense:6500,otherBaseAttack:3000,baseAspd:193,
 skillRank:10,criticalMultiplier:1,roll:1,basePrimaryGearTier:11,
 weaponMultiplier:1,offhandMultiplier:1,enemyAliveForFullWindow:true
};
const PET_SPECIES={attack:'fang',magic:'wisp',defense:'shell',support:'sprout'};
const MID=([a,b])=>(a+b)/2;
const STATS=['STR','AGI','VIT','INT','DEX','LUK'];
const ranged=new Set(['hunter','performer']);
// Exhaustively enumerate the *distribution of a budget between main stat and LUK*
// on a 5-point grid with a capped secondary DEX/AGI reserve. This is a transparent
// diagnostic search subset, NOT the global game optimum.
function* allocations(cap,budget,main){
 for(const agility of [1,30,60,90,cap])for(const dexterity of [1,30,60,90,cap]){
  for(let primary=1;primary<=cap;primary+=5)for(let luck=1;luck<=cap;luck+=5){
   const out=Object.fromEntries(STATS.map(k=>[k,1]));
   out[main]=Math.max(out[main],primary);
   out.AGI=Math.max(out.AGI,agility);
   out.DEX=Math.max(out.DEX,dexterity);
   out.LUK=Math.max(out.LUK,luck);
   const sum=STATS.reduce((acc,k)=>acc+out[k]-1,0);
   if(sum<=budget)yield {stats:out,spent:sum};
  }
 }
}
function buildScore(stage,job,weaponBuild,allocation){
 const [weapon,offhand]=weaponBuild.split('+'),base=GEAR_BASE[weapon],key=primaryAffix(weapon);
 const tier=11,quality='mythic',rank=stage.rank,enhance=rank?ENHANCEMENT_POWER[rank]:1;
 const mainAttack=MID(affixRange(key,tier,quality))*enhance,offAttack=offhand==='offDagger'?MID(affixRange('atk',tier,quality))*enhance:0;
 const primary=key==='matk'?'INT':ranged.has(job)?'DEX':'STR';
 const statValue=allocation.stats[primary];
 const damageMul=allocationDamageMultiplier(job,key==='matk',allocation.stats,ranged.has(job));
 const basePower=(SHARED_ASSUMPTIONS.otherBaseAttack+mainAttack+offAttack)*damageMul*(1+statValue*.002);
 const aspd=Math.min(193,SHARED_ASSUMPTIONS.baseAspd-(base.hands===2?3:0)+Math.floor((allocation.stats.AGI-1)/40));
 const speed=1000/aspdAttackIntervalMs(aspd);
 const skill=THIRD_MAIN_CURVES[job][5]*1.4*(1+.08*(SHARED_ASSUMPTIONS.skillRank-1));
 const hit=outgoingHitDamage(basePower*skill,SHARED_ASSUMPTIONS.bossDefense);
 return {score:Math.round(hit*speed*jobZoneOutputFactor(job,stage.level)),attack:Math.round(basePower),speed:+speed.toFixed(3),hit};
}
function bestFor(stage,job){
 const cap=attributeCap({level:stage.level,reborn:true}),budget=allocationBudget(stage.level,true);
 let best=null,combinations=0;
 for(const build of LOADOUTS[job]){
  const main=primaryAffix(build.split('+')[0])==='matk'?'INT':ranged.has(job)?'DEX':'STR';
  for(const allocation of allocations(cap,budget,main)){
   combinations++;
   const metric=buildScore(stage,job,build,allocation);
   if(!best||metric.score>best.proxyScore)best={weaponBuild:build,allocation:allocation.stats,spentPoints:allocation.spent,proxyScore:metric.score,attackProxy:metric.attack,attacksPerSecondProxy:metric.speed};
  }
 }
 return {...best,searchCombinations:combinations,cap,budget};
}
const out=[];
for(const stage of STAGES)for(const job of Object.keys(SECOND_JOBS)){
 const optimized=bestFor(stage,job);
 for(const fusion of FUSIONS){
  const [main,sub]=fusion.split('-');
  const pet={species:PET_SPECIES[main],fusion:{main,sub},rarity:'mythic',level:200,ascended:true};
  const player={job,level:stage.level,thirdJob:true,reborn:true};
  const resonance=companionResonance(player,pet);
  if(!resonance)throw Error('Missing resonance '+stage.scenario+' / '+job+' / '+fusion);
  out.push({scenario:stage.scenario,level:stage.level,rank:stage.rank||'none',job,fusion,
   ...optimized,resonance:resonance.name,resonanceMain:resonance.perSkill?.['thirdMain_'+job]||null,
   availablePetSkills:fusionSkills(pet).length,
   DISCLAIMER:'MAIN-SKILL ATTACK-CYCLE PROXY ONLY; NOT ACTUAL DPS OR PET DPS'});
 }
}
if(out.length!==120)throw Error('Expected 120 scenarios, got '+out.length);
process.stdout.write(JSON.stringify({kind:'DIAGNOSTIC_ONLY_NOT_GAME_DPS',assumptions:SHARED_ASSUMPTIONS,rows:out},null,2)+'\n');
