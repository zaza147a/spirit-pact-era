// Observational matrix. Uses actual combat ticks rather than formula-only DPS.
// Run: node scripts/audit-extreme-trials-high-floors.mjs > results.jsonl
import {runtime} from '../tests/runtime31-helper.mjs';
import {legacyOptimalPlayer} from '../tests/fixtures/legacy-optimal-player.mjs';
import {DAWN_BOSS,DAWN_MONSTERS} from '../dist/dawn-world.js';
import {extremeStage} from '../dist/extreme-trials.js';
import {readFileSync} from 'node:fs';

const legacy=['knight','crusader','wizard','sage','priest','monk','assassin','rogue','hunter','performer'];
const jobs=[...legacy,'pactWarrior','spiritCommander'];
const floors=[1,10,30,50,100];
const kinds=['atk','matk','hp','clear'];
const epoch=1000000;
function fixture(job){
 if(legacy.includes(job))return legacyOptimalPlayer(job);
 return structuredClone(JSON.parse(readFileSync(new URL(`../tests/fixtures/spirit-single-pet-optimal-210/${job}-210-sss-sigil8-optimal.json`,import.meta.url),'utf8')).player);
}
function foe(kind,floor,index=0){
 const stage=extremeStage(kind,floor),base=kind==='clear'?DAWN_MONSTERS[0]:DAWN_BOSS;
 const hp=kind==='clear'?Math.max(1,Math.round(base.hp*stage.hpMultiplier)):Number.MAX_SAFE_INTEGER;
 // Keep the existing registered species id in this isolated runtime; actual
 // game spawn registers a dedicated extreme id before starting combat.
 return {...base,id:base.id,
  extremeKind:kind,boss:kind!=='clear',hp,maxHp:hp,
  atk:kind==='atk'?Math.max(1,Math.round(DAWN_BOSS.atk*.2*stage.attackMultiplier)):0,
  matk:kind==='matk'?Math.max(1,Math.round((DAWN_BOSS.matk||DAWN_BOSS.atk)*.2*stage.attackMultiplier)):0,
  attackType:kind==='matk'?'magic':'physical',
  hit:(DAWN_BOSS.hit||250)+(floor-1)*15,
  aspd:kind==='hp'?1:kind==='clear'?base.aspd:DAWN_BOSS.aspd||160,
  lastAttack:epoch,appearedAt:epoch,xp:0,gold:0,drops:[],
  instanceId:`high-floor-${kind}-${floor}-${index}`};
}
async function run(job,kind,floor){
 const c=await runtime(),p=fixture(job),stage=extremeStage(kind,floor);
 p.location='dawnrift';p.offline={at:0,enabled:false};
 p.extremeRun={kind,floor,status:'active',startedAt:epoch,stageStartedAt:epoch,stageDamage:0,stageKills:0};
 const targets=Array.from({length:kind==='clear'?stage.simultaneous:1},(_,i)=>foe(kind,floor,i));
 c.api.setup(p,targets[0]);c.api.setEnemies(targets);c.api.setAutoForTest(true);
 const startGold=p.gold,startXp=p.xp;let deathAt=null,peakHit=0,stageDamage=0,stageKills=0;
 for(let ms=0;ms<stage.seconds*1000;ms+=100){
  c.setTime(epoch+ms);const hpBefore=p.hp;
  try{c.api.combatTick(epoch+ms);}catch(error){return {job,kind,floor,error:String(error),ms};}
  peakHit=Math.max(peakHit,Math.max(0,hpBefore-p.hp));
  stageDamage=p.extremeRun?.stageDamage||stageDamage;
  stageKills=p.extremeRun?.stageKills||stageKills;
  if(!p.extremeRun||p.hp<=0){deathAt=ms;break;}
 }
 const objectiveMet=kind==='hp'?stageDamage>=stage.requiredDamage:kind==='clear'?stageKills>=stage.requiredKills:deathAt===null;
 return {job,kind,floor,deathAt,objectiveMet,peakHit,hpRemaining:p.hp,stageDamage,stageKills,
  requiredDps:stage.requiredDps||null,requiredKills:stage.requiredKills||null,
  observedDps:Math.round(stageDamage/stage.seconds),goldDelta:p.gold-startGold,xpDelta:p.xp-startXp};
}
const rows=[];
for(const floor of floors){
 for(const job of jobs)for(const kind of kinds){
  const record=await run(job,kind,floor);rows.push(record);console.log(JSON.stringify(record));
 }
 console.log(JSON.stringify({checkpoint:floor,records:rows.length,errors:rows.filter(x=>x.error).length}));
}
console.log(JSON.stringify({summary:true,total:rows.length,errors:rows.filter(x=>x.error).length,
 zeroGoldLeak:rows.every(x=>x.goldDelta===0&&x.xpDelta===0),
 byFloor:floors.map(floor=>({floor,...Object.fromEntries(kinds.map(kind=>[kind,rows.filter(x=>x.floor===floor&&x.kind===kind&&x.objectiveMet).length]))}))}));
