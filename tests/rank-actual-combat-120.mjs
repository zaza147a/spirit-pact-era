// Converts ONLY actual Chromium combatTick results into 120 ranked scenarios.
// No theory-derived DPS is accepted here. Requires 100% source-map coverage.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const file=process.argv[2]||'test-results/lv200-lv210-full-actual-combat.json';
const raw=JSON.parse(await readFile(file,'utf8'));
if(raw.kind!=='ACTUAL_GAME_COMBATTICK_RUNTIME'||raw.mode!=='full')throw Error('Not verified full runtime evidence');
if(raw.errors?.length)throw Error('Browser runtime errors '+JSON.stringify(raw.errors.slice(0,3)));
const stages=[200,210],jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const fusions=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const ranks=[];
for(const level of stages)for(const job of jobs)for(const fusion of fusions){
 const source=raw.rows.filter(r=>r.level===level&&r.job===job&&r.fusion===fusion);
 if(!source.length)throw Error('Missing '+[level,job,fusion].join('/'));
 const options=new Map();
 for(const r of source){
  if(!r.damageReconciled||r.ownerDamage+r.petAttributedDamage!==r.totalDamage||!Number.isFinite(r.elapsedMs)||r.elapsedMs<0)throw Error('Invalid hit evidence');
  const key=JSON.stringify([r.weaponBuild,r.attributes,r.sigil,r.allocationIndex]);
  if(!options.has(key))options.set(key,[]);
  options.get(key).push(r);
 }
 let best=null;
 for(const [key,records] of options){
  const mobCount=level===200?10:3;
  const mobs=records.filter(r=>r.target!=='boss'),boss=records.find(r=>r.target==='boss');
  if(mobs.length!==mobCount||!boss||new Set(mobs.map(r=>r.target)).size!==mobCount)throw Error('Incomplete target group '+key);
  const meanMobDps=mobs.reduce((n,r)=>n+r.totalDamage/Math.max(.02,r.elapsedMs/1000),0)/mobCount;
  const bossDps=boss.totalDamage/Math.max(.02,boss.elapsedMs/1000);
  const completed=mobs.filter(r=>r.kill).length,success=boss.kill;
  const normalizedMob=mobs.reduce((n,r)=>n+r.totalDamage/Math.max(1,r.enemyHp),0)/mobCount;
  const normalizedBoss=boss.totalDamage/Math.max(1,boss.enemyHp);
  // Rank using measured effective DPS. Progress/survival are separately reported,
  // not silently substituted for the requested DPS metric.
  const weightedHealthProgress=.6*normalizedMob+.4*normalizedBoss;
  const weightedEffectiveDps=.6*meanMobDps+.4*bossDps;
  const candidate={key,records,meanMobDps,bossDps,completed,success,weightedHealthProgress,weightedEffectiveDps};
  if(!best||candidate.weightedEffectiveDps>best.weightedEffectiveDps||candidate.weightedEffectiveDps===best.weightedEffectiveDps&&Number(candidate.success)>Number(best.success))best=candidate;
 }
 if(!best)throw Error('No loadout '+[level,job,fusion].join('/'));
 const selected=best.records,boss=selected.find(r=>r.target==='boss'),mobs=selected.filter(r=>r.target!=='boss');
 ranks.push({level,job,fusion,weaponBuild:boss.weaponBuild,attributes:boss.attributes,sigil:boss.sigil,
  combatBuildsTested:options.size,weightedEffectiveDps:Math.round(best.weightedEffectiveDps),meanMobEffectiveDps:Math.round(best.meanMobDps),bossEffectiveDps:Math.round(best.bossDps),
  bossOwnerDps:Math.round(boss.ownerDamage/Math.max(.02,boss.elapsedMs/1000)),
  bossPetAttributedDps:Math.round(boss.petAttributedDamage/Math.max(.02,boss.elapsedMs/1000)),
  bossKill:boss.kill,bossDeath:boss.dead,bossElapsedMs:boss.elapsedMs,
  mobKills:best.completed,mobTargets:mobs.length,progressScore:Number(best.weightedHealthProgress.toFixed(5)),
  definition:'REAL_COMBAT_TICK_BENCHMARK; tested equipment seeds and candidate stat builds only; not globally optimized'});
}
if(ranks.length!==120)throw Error('Expected 120 complete ranked rows');
const ranked=ranks.sort((a,b)=>a.level-b.level||b.weightedEffectiveDps-a.weightedEffectiveDps||b.bossEffectiveDps-a.bossEffectiveDps);
for(const level of stages){let i=0;for(const r of ranked.filter(r=>r.level===level))r.stageDpsRank=++i;}
for(const level of stages){const byBoss=[...ranked].filter(r=>r.level===level).sort((a,b)=>b.bossEffectiveDps-a.bossEffectiveDps);byBoss.forEach((r,i)=>r.bossDpsRank=i+1);}
for(const level of stages){const viable=[...ranked].filter(r=>r.level===level).sort((a,b)=>Number(b.bossKill&&!b.bossDeath)-Number(a.bossKill&&!a.bossDeath)||b.progressScore-a.progressScore);viable.forEach((r,i)=>r.viabilityRank=i+1);}
await mkdir('test-results',{recursive:true});
const path='test-results/actual-combat-120-ranked.json';
await writeFile(path,JSON.stringify({kind:'RANKED_FROM_ACTUAL_GAME_COMBATTICK',sourceFile:file,levels:[200,210],rows:ranked},null,2));
console.log('Verified actual battle rankings:',ranked.length,'output:',path);
