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
  const r=group.find(x=>x.sigil===sigil);
  if(!r||r.mode!=='natural-spawn-map'||!r.damageReconciled||r.ticks<1)throw Error('Missing real battle '+[level,job,fusion,sigil].join('/'));
  if(r.ownerDamage+r.petAttributedDamage!==r.totalDamage)throw Error('Damage attribution mismatch');
  if(!r.spawns?.length||r.spawns.some(x=>typeof x.boss!=='boolean'))throw Error('Actual monster spawns missing');
  if(r.bossTotalDamage+r.mobTotalDamage!==r.totalDamage)throw Error('Mixed target damage total mismatch');
  if(r.bossOwnerDamage+r.mobOwnerDamage!==r.ownerDamage||r.bossPetDamage+r.mobPetDamage!==r.petAttributedDamage)throw Error('Mixed target owner/pet attribution mismatch');
  if(r.bossEncounters!==r.spawns.filter(x=>x.boss).length)throw Error('Boss summon telemetry mismatch');
  if(r.bossCallSucceeded&&!r.bossEncounters)throw Error('Claimed boss call without boss spawn');
  const sec=Math.max(.02,r.elapsedMs/1000);
  rows.push({level,job,fusion,sigil,weaponBuild:r.weaponBuild,attributes:r.attributes,
   measuredTotalDps:Math.round(r.totalDamage/sec),measuredOwnerDps:Math.round(r.ownerDamage/sec),
   measuredPetAttributedDps:Math.round(r.petAttributedDamage/sec),
   mobKills:r.mobKills,killsPerMinute:r.killsPerMinute,
   mobEffectiveDps:r.mobEffectiveDps,bossEffectiveDps:r.bossEffectiveDps,
   bossOwnerDps:r.bossOwnerDps,bossPetDps:r.bossPetDps,bossSeconds:r.bossSeconds,
   bossCalled:r.bossCallSucceeded,bossCallAttempted:r.bossCallAttempted,
   bossEncounters:r.bossEncounters,bossKills:r.bossKills,
   bossWinObserved:r.bossEncounters>0?r.bossKills>0:null,
   playerSurvived:!r.dead,playerHp:r.playerHp,petHp:r.petHp,
   initialHp:r.initialHp,initialPetHp:r.initialPetHp,
   redUsed:r.redUsed,blueUsed:r.blueUsed,enemyActions:r.enemyActions,
   playerActions:r.playerActions,petCasts:r.petCasts.length,elapsedMs:r.elapsedMs,
   spawns:r.spawns.length,diagnostic:'Four-slot natural respawn with a forced encounter roll at 15s; additional spontaneous bosses may occur. Owner/pet boss DPS separately measured after actual boss entry. Candidate build, not globally optimized.'});
 }
}
if(rows.length!==180)throw Error('Expected 60 level 200, 120 level 210 (IV/VIII)');
const rankings=rows.sort((a,b)=>a.level-b.level||a.sigil-b.sigil||b.measuredTotalDps-a.measuredTotalDps);
for(const level of [200,210])for(const sigil of level===200?[0]:[4,8]){
 let pos=0;for(const r of rankings.filter(x=>x.level===level&&x.sigil===sigil))r.mapDpsRank=++pos;
}
await mkdir('test-results',{recursive:true});
await writeFile('test-results/actual-natural-map-120-ranked.json',JSON.stringify({kind:'ACTUAL_NATURAL_MAP_DPS',source:file,rows:rankings},null,2));
for(const level of [200,210])for(const sigil of level===200?[0]:[4,8]){
 const bossRank=[...rankings].filter(r=>r.level===level&&r.sigil===sigil&&r.bossEffectiveDps!==null).sort((a,b)=>b.bossEffectiveDps-a.bossEffectiveDps);
 bossRank.forEach((r,i)=>r.bossDpsRank=i+1);
}
console.log('Natural map real-combat ranks:',rankings.length);
