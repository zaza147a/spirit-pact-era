// Same-build post-Dawn comparison. Manual only; no job multipliers or fake damage.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {runtime} from '../tests/runtime31-helper.mjs';
import {homecomingPlayer} from '../tests/fixtures/homecoming-player.mjs';
import {ALL_COMPARISON_JOBS} from '../tests/fixtures/spirit-vs-class-player.mjs';
import {DAWN_BOSS,DAWN_MONSTERS} from '../dist/dawn-world.js';
import {monsterRuntimeStats} from '../dist/combat-balance.js';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {HOMECOMING_ADVENTURES,adventureLocation,newHomecomingAdventure} from '../dist/homecoming-adventures.js';
const jobs=process.env.AUDIT_JOB?[process.env.AUDIT_JOB]:ALL_COMPARISON_JOBS.filter(j=>!['pactWarrior','spiritCommander'].includes(j));
const battles=process.env.AUDIT_SCOPE==='nonboss'?[['attack-defense','ambush'],['attack-defense','rear'],['defense-attack','patrol'],['support-attack','duel'],['defense-support','defend']]:[['attack-magic','breach'],['attack-defense','gate'],['magic-defense','release']];
const seeds=[93217,44021],epoch=1000000,limit=180000,stepMs=100;
const nativeRandom=Math.random,rows=[];
async function measure(base,routeId,step,seed,dawn){
 let random=seed;const rng=()=>((random=(Math.imul(random,1664525)+1013904223)>>>0)/4294967296);
 Math.random=rng;
 try{
  const c=await runtime(),a=c.api,p=structuredClone(base);
  c.Math.random=rng;c.rand=(lo,hi)=>Math.floor(rng()*(hi-lo+1))+lo;
  // Report identifiers must not alter combat rolls in one scenario only.
  const makeReport=c.newReport;c.newReport=(...args)=>{const before=random,r=makeReport(...args);random=before;return r;};
  const route=HOMECOMING_ROUTES.find(r=>r.id===routeId);
  p.location=dawn?'dawnrift':adventureLocation(route,HOMECOMING_ADVENTURES[routeId].nodes[step]);
  if(!dawn)p.homecoming={routes:{[routeId]:{phase:'active',adventure:{...newHomecomingAdventure(routeId),step}}},completedRoutes:{}};
  a.setup(a.normalize(p),null);const owner=a.state().player,pet=owner.pets[0];
  assert.ok(a.valid(owner),'invalid normalized save');assert.ok(a.stat('damageReduction')<=40);
  assert.ok(a.petStats(pet).damageReduction<=40);assert.equal(owner.dawnSigil,8);
  owner.hp=a.stat('hp');owner.mp=a.stat('mp');pet.hp=a.petStats(pet).hp;pet.sp=a.petStats(pet).sp;
  const maxHp=owner.hp;
  let foe;
  if(dawn){
   const units=[DAWN_BOSS,...DAWN_MONSTERS].map((m,i)=>({...m,...monsterRuntimeStats(m),hp:m.hp,maxHp:m.hp,lastAttack:epoch,appearedAt:epoch,instanceId:'dawn-reference-'+i,slotIndex:m.boss?null:i}));
   foe=units[0];a.setEnemies(units);
  }else {foe=a.addHomecomingEncounter(epoch);assert.ok(foe);}
  let elapsed=0,firstKill=null,minHp=maxHp,petDeaths=0,petAlive=true;
  const initialPotions=owner.bag.filter(x=>/^(red|blue)_/.test(x.id)).reduce((n,x)=>n+x.qty,0);
  for(elapsed=stepMs;elapsed<=limit;elapsed+=stepMs){
   c.setTime(epoch+elapsed);a.combatTick(epoch+elapsed);minHp=Math.min(minHp,owner.hp);
   if(petAlive&&pet.hp<=0)petDeaths++;petAlive=pet.hp>0;
   if(foe.hp<=0&&firstKill===null)firstKill=elapsed/1000;
   if(owner.hp<=0)break;
   if(dawn){if(elapsed>=60000&&firstKill!==null)break;}
   else if(foe.hp<=0)break;
  }
  const current=owner.homecoming?.routes?.[routeId];
  const advanced=!dawn&&(current?.phase!=='active'||current?.adventure?.step!==step);
  const pots=owner.bag.filter(x=>/^(red|blue)_/.test(x.id)).reduce((n,x)=>n+x.qty,0);
  return {outcome:owner.hp<=0?'death':firstKill===null?'timeout':dawn?'qualified':advanced?'win':'uncredited',seconds:Math.min(elapsed,limit)/1000,bossKillSeconds:firstKill,minHpPercent:Math.round(minHp/maxHp*10000)/100,petDeaths,potions:initialPotions-pots,kills:owner.kills-base.kills,enemyHpPercent:Math.round(foe.hp/foe.maxHp*10000)/100,ownerMaxHp:maxHp,ownerDamageReduction:a.stat('damageReduction'),enemyAttack:foe.atk,enemyMagicAttack:foe.matk};
 }finally{Math.random=nativeRandom;}
}
for(const job of jobs)for(const [routeId,step]of battles){
 const base=homecomingPlayer(job,routeId);
 const runs=[];
 for(const seed of seeds){const dawn=await measure(base,routeId,step,seed,true);const story=await measure(base,routeId,step,seed,false);runs.push({seed,dawn,story});}
 const qualified=runs.every(r=>r.dawn.outcome==='qualified');
 const row={job,routeId,step,qualified,runs};rows.push(row);
 console.log(JSON.stringify({job,routeId,qualified,dawn:runs.map(x=>[x.dawn.outcome,x.dawn.bossKillSeconds]),story:runs.map(x=>[x.story.outcome,x.story.bossKillSeconds])}));
}
const summary={builds:rows.length,qualifiedBuilds:rows.filter(r=>r.qualified).length,qualifiedStoryWins:rows.filter(r=>r.qualified).flatMap(r=>r.runs).filter(r=>r.story.outcome==='win').length};
mkdirSync('docs/homecoming-post-dawn',{recursive:true});
writeFileSync('docs/homecoming-post-dawn/'+(process.env.AUDIT_LABEL||process.env.AUDIT_JOB||'all')+'.json',JSON.stringify({summary,conditions:{jobs,seeds,level:210,gearLevel:200,gear:'mythic SSS, legal maximum affixes and role-scored boss cards',sigil:8,attributes:438,attributeCap:150,fourthSkill:false,stepMs,limitMs:limit,dawnQualification:'same-build mixed fight beginning with Dawn boss and three Dawn monsters, no death, boss defeated and at least 60 seconds survived; ordinary encounters replenish naturally',limitations:'Controlled synthetic builds, not global optimum or actual browser acceptance. Two seeds are a preliminary stability screen.'},rows},null,2)+'\n');
console.log(JSON.stringify(summary));
