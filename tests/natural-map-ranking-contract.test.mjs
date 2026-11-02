// Synthetic contract test ONLY, never a source of game DPS or player rankings.
// Executes the real ranking CLI with mocked telemetry and asserts 180 rows.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const fusions=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
test('actual map ranking CLI writes all 60+60+60 only from complete reconciled input',()=>{
 const dir=mkdtempSync(join(tmpdir(),'lingqi-rank-contract-'));
 try{
  mkdirSync(join(dir,'test-results'));
  const rows=[];
  for(const level of [200,210])for(const job of jobs)for(const fusion of fusions)for(const sigil of level===200?[0]:[4,8]){
   // Deliberately MOCK data: ensures rankings are not mistaken for measured DPS.
   const totalDamage=10000+(level-200)*100+jobs.indexOf(job)*500;
   rows.push({level,job,fusion,sigil,mode:'natural-spawn-map',weaponBuild:'mock',
    attributes:{STR:1,AGI:1,VIT:1,INT:1,DEX:1,LUK:1},
    ticks:4501,elapsedMs:90000,damageReconciled:true,
    ownerDamage:totalDamage*.6,petAttributedDamage:totalDamage*.4,totalDamage,
    bossTotalDamage:totalDamage*.2,mobTotalDamage:totalDamage*.8,
    bossOwnerDamage:totalDamage*.12,mobOwnerDamage:totalDamage*.48,
    bossPetDamage:totalDamage*.08,mobPetDamage:totalDamage*.32,
    mobEffectiveDps:Math.round(totalDamage*.8/90),
    bossEffectiveDps:Math.round(totalDamage*.2/25),
    bossOwnerDps:Math.round(totalDamage*.12/25),bossPetDps:Math.round(totalDamage*.08/25),
    bossSeconds:25,spawns:[{id:'world_200',boss:false},{id:'boss_worldroot',boss:true}],
    kills:[{id:'world_200',boss:false}],mobKills:1,killsPerMinute:1,
    bossEncounters:1,bossKills:0,bossCallSucceeded:true,bossCallAttempted:true,
    dead:false,playerHp:100,petHp:100,initialHp:100,initialPetHp:100,
    redUsed:0,blueUsed:0,enemyActions:10,playerActions:50,petCasts:[{id:'mock'}]
   });
  }
  const input=join(dir,'test-results','synthetic-input.json');
  writeFileSync(input,JSON.stringify({kind:'ACTUAL_NATURAL_RESPAWN_COMBATTICK',mode:'farm',rows,errors:[],httpFailures:[]}));
  const cli=fileURLToPath(new URL('./rank-natural-map-combat.mjs',import.meta.url));
  const proc=spawnSync(process.execPath,[cli,input],{cwd:dir,encoding:'utf8'});
  assert.equal(proc.status,0,proc.stderr||proc.stdout);
  const ranked=JSON.parse(readFileSync(join(dir,'test-results','actual-natural-map-120-ranked.json'),'utf8'));
  assert.equal(ranked.rows.length,180);
  for(const [level,sigil] of [[200,0],[210,4],[210,8]]){
   const subset=ranked.rows.filter(x=>x.level===level&&x.sigil===sigil);
   assert.equal(subset.length,60);
   assert.deepEqual(subset.map(x=>x.mapDpsRank),Array.from({length:60},(_,i)=>i+1));
   assert.deepEqual([...subset].sort((a,b)=>a.bossDpsRank-b.bossDpsRank).map(x=>x.bossDpsRank),Array.from({length:60},(_,i)=>i+1));
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});
