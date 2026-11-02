// Real normal-map battle rankings only: natural enemy spawn / replacement / random bosses.
// Never infer a boss kill if a boss did not actually appear in the run.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const file=process.argv[2]||'test-results/lv200-lv210-farm-actual-combat.json';
const raw=JSON.parse(await readFile(file,'utf8'));
if(raw.kind!=='ACTUAL_NATURAL_RESPAWN_COMBATTICK'||raw.mode!=='farm'||raw.errors.length||raw.httpFailures.length)throw Error('No validated natural-map combat evidence');
const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const fusions=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const rows=[];
for(const level of [200,210])for(const fusion of fusions)for(const job of jobs){
 const group=raw.rows.filter(x=>x.level===level&&x.job===job&&x.fusion===fusion);
 const sigils=level===200?[0]:[4,8];
 for(const sigil of sigils){
  const candidates=group.filter(x=>x.sigil===sigil);
  if(candidates.length!==2||new Set(candidates.map(x=>x.profile)).size!==2||!candidates.some(x=>x.profile==='damage')||!candidates.some(x=>x.profile==='survival'))throw Error('Missing damage/survival candidate '+[level,job,fusion,sigil].join('/'));
  for(const c of candidates){
   if(c.mode!=='natural-spawn-map'||!c.damageReconciled||c.ticks<1)throw Error('Incomplete actual combat '+[level,job,fusion,sigil,c.profile].join('/'));
   if(c.ownerDamage+c.petAttributedDamage!==c.totalDamage)throw Error('Owner/pet damage attribution mismatch');
   if(!c.spawns?.length||c.spawns.some(x=>typeof x.boss!=='boolean'))throw Error('Monster spawning telemetry missing');
   if(c.bossTotalDamage+c.mobTotalDamage!==c.totalDamage)throw Error('Boss/mob target damage mismatch');
   if(c.bossOwnerDamage+c.mobOwnerDamage!==c.ownerDamage||c.bossPetDamage+c.mobPetDamage!==c.petAttributedDamage)throw Error('Boss/mob owner attribution mismatch');
   if(c.bossEncounters!==c.spawns.filter(x=>x.boss).length)throw Error('Boss encounter counts mismatch');
   if(c.bossCallSucceeded&&!c.bossEncounters)throw Error('Boss call succeeded without a boss spawning');
  }
  const dps=c=>c.totalDamage/Math.max(.02,c.elapsedMs/1000);
  const r=[...candidates].sort((a,b)=>dps(b)-dps(a))[0];
  const survivor=[...candidates].sort((a,b)=>Number(b.bossKills>0)-Number(a.bossKills>0)||b.elapsedMs-a.elapsedMs)[0];
  const bossWinner=[...candidates].filter(c=>c.bossEffectiveDps!==null).sort((a,b)=>b.bossEffectiveDps-a.bossEffectiveDps)[0]||null;
  const sec=Math.max(.02,r.elapsedMs/1000);
  rows.push({level,job,fusion,sigil,weaponBuild:r.weaponBuild,attributes:r.attributes,selectedDamageProfile:r.profile,
   measuredTotalDps:Math.round(r.totalDamage/sec),measuredOwnerDps:Math.round(r.ownerDamage/sec),
   measuredPetAttributedDps:Math.round(r.petAttributedDamage/sec),
   mobKills:r.mobKills,killsPerMinute:r.killsPerMinute,mobEffectiveDps:r.mobEffectiveDps,
   mapSelectedBossDps:r.bossEffectiveDps,
   bossEffectiveDps:bossWinner?.bossEffectiveDps??null,
   bossOwnerDps:bossWinner?.bossOwnerDps??null,
   bossPetDps:bossWinner?.bossPetDps??null,
   bossSeconds:bossWinner?.bossSeconds??0,bossBuildProfile:bossWinner?.profile??null,
   bossCalled:r.bossCallSucceeded,bossCallAttempted:r.bossCallAttempted,
   bossEncounters:r.bossEncounters,bossKills:r.bossKills,
   bossWinObserved:r.bossEncounters>0?r.bossKills>0:null,
   playerSurvived:!r.dead,playerHp:r.playerHp,petHp:r.petHp,
   initialHp:r.initialHp,initialPetHp:r.initialPetHp,
   redUsed:r.redUsed,blueUsed:r.blueUsed,enemyActions:r.enemyActions,
   playerActions:r.playerActions,petCasts:r.petCasts.length,elapsedMs:r.elapsedMs,spawns:r.spawns.length,
   battleWindowCertified:r.elapsedMs>=15000&&r.bossEncounters>0,
   bossBattleCertified:!!bossWinner&&bossWinner.bossSeconds>0&&bossWinner.bossEncounters>0,
   bestCandidateReachedBoss:candidates.some(c=>c.bossEncounters>0),
   survivalVsDpsDurationRatio:Number((survivor.elapsedMs/Math.max(20,r.elapsedMs)).toFixed(3)),
   survivalBuildProfile:survivor.profile,survivalDurationMs:survivor.elapsedMs,
   survivalBossCalled:survivor.bossCallAttempted,survivalBossEncounters:survivor.bossEncounters,
   survivalBossKills:survivor.bossKills,survivalPlayerHp:survivor.playerHp,
   survivalInitialHp:survivor.initialHp,
   candidates:candidates.map(c=>({profile:c.profile,dps:Math.round(dps(c)),durationMs:c.elapsedMs,
    hp:c.initialHp,playerSurvived:!c.dead,bossEncountered:c.bossEncounters>0,bossKills:c.bossKills,
    bossDps:c.bossEffectiveDps,attributes:c.attributes})),
   diagnostic:'Two actual candidate builds: highest measured map DPS and longest-surviving boss-capable build ranked separately; not globally optimized. Four-slot respawn + forced 15s boss encounter roll.'});
 }
}
if(rows.length!==180)throw Error('Expected 60 level 200, 120 level 210 (IV/VIII)');
const rankings=rows.sort((a,b)=>a.level-b.level||a.sigil-b.sigil||b.measuredTotalDps-a.measuredTotalDps);
for(const level of [200,210])for(const sigil of level===200?[0]:[4,8]){
 let pos=0;for(const r of rankings.filter(x=>x.level===level&&x.sigil===sigil))r.mapDpsRank=++pos;
}
for(const level of [200,210])for(const sigil of level===200?[0]:[4,8]){
 const bossRank=[...rankings].filter(r=>r.level===level&&r.sigil===sigil&&r.bossEffectiveDps!==null).sort((a,b)=>b.bossEffectiveDps-a.bossEffectiveDps);
 bossRank.forEach((r,i)=>r.bossDpsRank=i+1);
}
await mkdir('test-results',{recursive:true});
await writeFile('test-results/actual-natural-map-120-ranked.json',JSON.stringify({kind:'ACTUAL_NATURAL_MAP_DPS',source:file,rows:rankings},null,2));
console.log('Natural map real-combat ranks:',rankings.length);
