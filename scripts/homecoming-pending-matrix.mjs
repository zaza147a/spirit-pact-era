// Manual pending-validation batch; current core, real 201 spawns and controlled legal candidates.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {runtime} from '../tests/runtime31-helper.mjs';
import {homecomingPlayer} from '../tests/fixtures/homecoming-player.mjs';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from '../tests/fixtures/legacy-optimal-player.mjs';
import {FUSION_SKILLS} from '../dist/pet-fusion.js';
import {affixRange,SPECIAL_AFFIXES} from '../dist/loot.js';
import {DAWN_BOSS,DAWN_MONSTERS} from '../dist/dawn-world.js';
import {monsterRuntimeStats} from '../dist/combat-balance.js';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {HOMECOMING_ADVENTURES as A,adventureLocation,newHomecomingAdventure} from '../dist/homecoming-adventures.js';
const mode=process.argv[2]||'ranking',out='docs/homecoming-pending-matrix';mkdirSync(out,{recursive:true});
const pairs=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'],seeds=[77171,18287,65003],jobs=process.env.AUDIT_JOB?[process.env.AUDIT_JOB]:LEGACY_OPTIMAL_BUILD_NAMES;
const nativeRandom=Math.random,rows=[],screens=[];
async function run(base,{seed=77171,seconds=240,routeId=null,step=null,screen=false}={}){
 let random=seed;const rng=()=>((random=(Math.imul(random,1664525)+1013904223)>>>0)/4294967296);Math.random=rng;
 try{
 const c=await runtime({captureDamage:true}),a=c.api,p=structuredClone(base);c.Math.random=rng;c.rand=(lo,hi)=>Math.floor(rng()*(hi-lo+1))+lo;
 const original=c.newReport;c.newReport=(...args)=>{const before=random,r=original(...args);random=before;return r;};
 p.location=routeId?adventureLocation(HOMECOMING_ROUTES.find(r=>r.id===routeId),A[routeId].nodes[step]):'dawnrift';
 if(routeId)p.homecoming={routes:{[routeId]:{phase:'active',adventure:{...newHomecomingAdventure(routeId),step}}},completedRoutes:{}};
 a.setup(a.normalize(p),null);const owner=a.state().player,pet=owner.pets[0];assert.ok(a.valid(owner));assert.ok(a.stat('damageReduction')<=40&&a.petStats(pet).damageReduction<=40);owner.hp=a.stat('hp');owner.mp=a.stat('mp');pet.hp=a.petStats(pet).hp;pet.sp=a.petStats(pet).sp;const hp=owner.hp;let minHp=hp,petDeaths=0,alive=true,firstBoss=null,foe;
 if(routeId)foe=a.addHomecomingEncounter(1000000);else{const es=[DAWN_BOSS,...DAWN_MONSTERS].map((m,i)=>({...m,...monsterRuntimeStats(m),hp:m.hp,maxHp:m.hp,lastAttack:1000000,appearedAt:1000000,instanceId:'initial-'+i,slotIndex:m.boss?null:i}));foe=es[0];a.setEnemies(es);}
 const initialKills=owner.kills,pots=()=>owner.bag.filter(x=>/^(red|blue)_/.test(x.id)).reduce((n,x)=>n+x.qty,0),initialPots=pots();let elapsed=0;
 for(elapsed=100;elapsed<=seconds*1000;elapsed+=100){c.setTime(1000000+elapsed);a.combatTick(1000000+elapsed);minHp=Math.min(minHp,owner.hp);if(alive&&pet.hp<=0)petDeaths++;alive=pet.hp>0;if(foe.hp<=0&&firstBoss===null)firstBoss=elapsed/1000;if(owner.hp<=0||routeId&&foe.hp<=0)break;}
 const time=Math.min(elapsed,seconds*1000)/1000,total=c.damageEvents.reduce((n,x)=>n+x.applied,0),ownerDamage=c.damageEvents.filter(x=>x.key==='playerDamage').reduce((n,x)=>n+x.applied,0),q=owner.homecoming?.routes?.[routeId];
 return {outcome:owner.hp<=0?'death':routeId?foe.hp>0?'timeout':q?.phase!=='active'||q?.adventure?.step!==step?'win':'uncredited':firstBoss===null?'no-boss-kill':'survived',seconds:time,firstBoss,qualified:!routeId&&owner.hp>0&&time>=60&&firstBoss!==null,kills:owner.kills-initialKills,totalDamage:total,dps:total/time,windowDps:total/seconds,ownerDirectDps:ownerDamage/time,minHpPercent:Math.round(minHp/hp*10000)/100,petDeaths,potions:initialPots-pots(),fourthCasts:a.fourthState(pet).casts,ownerDamageReduction:a.stat('damageReduction')};
 }finally{Math.random=nativeRandom;}
}
const save=()=>writeFileSync(out+'/'+mode+(process.env.AUDIT_JOB?'-'+process.env.AUDIT_JOB:'')+'.json',JSON.stringify({sourceSha:process.env.AUDIT_SOURCE_SHA,mode,conditions:{jobs,pairs,seeds,screenSeconds:20,rankingSeconds:240,stepMs:100,scope:'candidate optimum user-supplied owner builds; all 20 three-skill subsets screened in ascending slot order, not all permutations or globally exhaustive equipment/attribute search; real Dawn boss + three monsters then natural replacements; no inflated enemy HP/ATK',difficulty:'three legal affix investment levels, same-build Dawn qualification before homecoming; failures recorded without auto-rebalance'},screens,rows},null,2));
for(const job of jobs){
 if(mode==='ranking')for(const pair of pairs){
  const p=legacyOptimalPlayer(job),template=homecomingPlayer(job,pair);p.pets=template.pets;p.activePetId=p.pets[0].id;p.autoRevive=false;p.autoEscapeBoss=false;p.dawnSigil=8;p.homecoming={routes:Object.fromEntries(HOMECOMING_ROUTES.map(r=>[r.id,{phase:'claimed',adventure:newHomecomingAdventure(r.id)}]))};
  let best=null;const list=FUSION_SKILLS[pair];for(let x=0;x<6;x++)for(let y=x+1;y<6;y++)for(let z=y+1;z<6;z++){p.pets[0].equippedSkills=[x,y,z].map(i=>list[i].id);const r=await run(p,{seed:1007,seconds:20,screen:true});const row={job,pair,skills:[...p.pets[0].equippedSkills],...r};screens.push(row);if(!best||row.seconds>best.seconds||row.seconds===best.seconds&&row.totalDamage>best.totalDamage)best=row;}
  p.pets[0].equippedSkills=best.skills;for(const seed of seeds)rows.push({job,pair,seed,skills:best.skills,...await run(p,{seed})});save();console.log(JSON.stringify({mode,job,pair,done:rows.length}));
 }else for(const investment of [0,.5,1])for(const [routeId,step]of [['attack-magic','breach'],['attack-defense','ambush'],['attack-defense','rear'],['attack-defense','gate'],['defense-attack','patrol'],['support-attack','duel'],['magic-defense','release'],['defense-support','defend']]){
  const p=homecomingPlayer(job,routeId);for(const [isPet,gear]of [[false,p.gear],[true,p.pets[0].gear]])for(const g of Object.values(gear).filter(Boolean))for(const k of Object.keys(g.affixes||{})){const [lo,hi]=affixRange(k,g.tier,g.rarity,g.id),mult=isPet&&!SPECIAL_AFFIXES.has(k)&&!['atk','matk'].includes(k)?10/3:1;g.affixes[k]=Math.round((lo+(hi-lo)*investment)*mult);}
  for(const seed of seeds){const dawn=await run(p,{seed,seconds:90}),story=await run(p,{seed,seconds:180,routeId,step});rows.push({job,investment,routeId,step,seed,dawn,story});}save();console.log(JSON.stringify({mode,job,investment,routeId,step,done:rows.length}));
 }
}
save();console.log('COMPLETE '+mode+' '+rows.length);
