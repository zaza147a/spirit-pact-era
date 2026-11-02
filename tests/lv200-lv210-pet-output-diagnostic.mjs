// Source-driven pet direct-output diagnostic ONLY. Not game.js combatTick.
import {SECOND_JOBS} from '../dist/jobs.js';
import {DAWN_MONSTERS,DAWN_BOSS} from '../dist/dawn-world.js';
import {WORLD_MONSTERS} from '../dist/world-data.js';
import {MAP_BOSSES} from '../dist/map-bosses.js';
import {petStats} from '../dist/catalog.js';
import {rollPetGear} from '../dist/loot.js';
import {companionRole,fusionSkills,fusionKey} from '../dist/pet-fusion.js';
import {petOffensivePower,petSkillEffect,petDirectRoleMultiplier,fusionDirectOutputFactor} from '../dist/pet-effects.js';
import {monsterDefenseAgainst,aspdAttackIntervalMs,outgoingHitDamage,jobZoneOutputFactor,hitChance} from '../dist/combat-balance.js';
import {sigilBonus,dawnArchonPreparationFactor} from '../dist/dawn-sigil.js';

const PAIRS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const ORIGIN={attack:'fang',magic:'wisp',defense:'shell',support:'sprout'};
const GEAR_CHOICE=[['petHelm','petCirclet'],['petArmor','petRobe'],['petBoots','petGreaves']];
const DIRECT=new Set(['strike','magic','drain','bleed']);
const MAPS={
 200:{mobs:WORLD_MONSTERS.filter(m=>m.map==='worldroot'),boss:MAP_BOSSES.worldroot,sigil:0},
 210:{mobs:DAWN_MONSTERS,boss:DAWN_BOSS,sigil:8}
};
function gearPiece(id,rank){
 const g=rollPetGear(id,200,'mythic',()=>.5);
 if(rank)g.enhancement=rank;
 return g;
}
function petFor(fusion,rank,gears,reverse=false){
 const [a,b]=fusion.split('-');
 return {
  species:ORIGIN[a],rarity:'mythic',ascended:true,level:200,evolution:4,
  iv:{hp:0,atk:0,def:0,matk:0,sp:0,aspd:0},
  fusion:{main:reverse?b:a,sub:reverse?a:b,version:1},
  gear:Object.fromEntries(['head','body','shoes'].map((k,i)=>[k,gearPiece(gears[i],rank)]))
 };
}
function directDamage(skill,stats,role,pet,foe,job,stage){
 const direct=petDirectRoleMultiplier(role,stats.level)*fusionDirectOutputFactor(pet);
 const magical=skill?.kind==='magic'||(!skill&&['magic','support'].includes(role));
 const defense=monsterDefenseAgainst(foe,magical);
 const ignores=skill?.ignoreDef??stats.ignoreDef??0;
 const raw=skill?petSkillEffect(skill,stats,role).value:petOffensivePower(stats,role);
 const sigil=stage===210?sigilBonus({dawnSigil:8}).petDamage:1;
 const gate=stage===210&&foe.id==='dawn-archon'?dawnArchonPreparationFactor({dawnSigil:8}):1;
 const hit=outgoingHitDamage(raw,defense*(1-ignores/100));
 return hit*direct*jobZoneOutputFactor(job,stage)*sigil*gate;
}
function evaluate(pet,job,level,foe,three){
 const stats=petStats(pet),role=companionRole(pet);
 const normal=directDamage(null,stats,role,pet,foe,job,level);
 const speedMs=Math.max(80,aspdAttackIntervalMs(stats.aspd)/(1+(stats.aspdPct||0)/100));
 const accuracy=hitChance(stats.hit,foe.flee||0);
 const critPct=stats.crit/100,critFactor=1+critPct*((stats.critDmg||140)/100-1);
 const normalDps=normal*(1000/speedMs)*(accuracy+(1-accuracy)*critPct)*critFactor;
 const skills=three.map(skill=>{
  // One cast per cooldown average. DoT is a separate repeated-time approximation.
  const effect=directDamage(skill,stats,role,pet,foe,job,level);
  const ticks=skill.kind==='bleed'?skill.ticks||3:1;
  const splash=skill.splash||0;
  const dps=effect*ticks/(Math.max(850,skill.cooldown)/1000);
  return {id:skill.id,kind:skill.kind,dps, splash, cooldown:skill.cooldown};
 });
 const directSkills=skills.filter(skill=>DIRECT.has(skill.kind));
 return {normalDps,skillDps:directSkills.reduce((a,x)=>a+x.dps,0),allDps:normalDps+directSkills.reduce((a,x)=>a+x.dps,0),skills:skills.map(s=>s.id)};
}
function chooseThree(arr){
 const out=[];for(let a=0;a<arr.length;a++)for(let b=a+1;b<arr.length;b++)for(let c=b+1;c<arr.length;c++)out.push([arr[a],arr[b],arr[c]]);
 return out;
}
function gearVariants(){
 const out=[];
 for(const a of GEAR_CHOICE[0])for(const b of GEAR_CHOICE[1])for(const c of GEAR_CHOICE[2])out.push([a,b,c]);
 return out;
}
export function petProxyRanking(level,job,fusion){
 const targets=MAPS[level];
 let best=null;
 for(const gearSet of gearVariants()){
  const pet=petFor(fusion,level===210?'SSS':null,gearSet),skills=fusionSkills(pet);
  if(!skills||skills.length!==6)throw Error('Six skills required '+fusion);
  for(const chosen of chooseThree(skills)){
   const mobs=targets.mobs.map(foe=>evaluate(pet,job,level,foe,chosen));
   const boss=evaluate(pet,job,level,targets.boss,chosen);
   const averageMobDps=mobs.reduce((a,x)=>a+x.allDps,0)/mobs.length;
   // Diagnostic only. Keeps a declared, fixed mob-boss weight.
   const score=.6*averageMobDps+.4*boss.allDps;
   if(!best||score>best.score)best={
    score,petGear:gearSet,skills:chosen.map(s=>s.id),
    role:companionRole(pet),petPanel:petStats(pet),
    mobDpsProxy:Math.round(averageMobDps),bossDpsProxy:Math.round(boss.allDps),
    petNormalBossProxy:Math.round(boss.normalDps),petSkillBossProxy:Math.round(boss.skillDps),
    mobCount:mobs.length
   };
  }
 }
 return {level,job,fusion,...best};
}
const rows=[];
for(const level of [200,210])for(const job of Object.keys(SECOND_JOBS))for(const fusion of PAIRS)rows.push(petProxyRanking(level,job,fusion));
if(rows.length!==120)throw Error('Expected 120 outputs');
for(const row of rows)if(!Number.isFinite(row.score)||!Number.isFinite(row.bossDpsProxy)||!row.skills.length)throw Error('Invalid output: '+JSON.stringify(row));
if(process.argv[1]?.endsWith('lv200-lv210-pet-output-diagnostic.mjs'))
 process.stdout.write(JSON.stringify({kind:'PET_SOURCE_FORMULA_THROUGHPUT_PROXY_NOT_COMBAT_DPS',limits:'No global skill cast scheduler, SP, RNG, hit-by-hit owner resonance, survival, inventory rolls or full skill gameplay',rows},null,2)+'\n');
