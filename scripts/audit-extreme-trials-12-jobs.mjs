// Four-mode observational audit using actual game combat on legal Lv210 SSS/sigil8 saves.
// Run: node scripts/audit-extreme-trials-12-jobs.mjs
import {runtime} from '../tests/runtime31-helper.mjs';
import {legacyOptimalPlayer} from '../tests/fixtures/legacy-optimal-player.mjs';
import {DAWN_BOSS,DAWN_MONSTERS} from '../dist/dawn-world.js';
import {readFileSync} from 'node:fs';

const legacy=['knight','crusader','wizard','sage','priest','monk','assassin','rogue','hunter','performer'];
const originals=[...legacy,...['pactWarrior','spiritCommander']];
const epoch=1e6;
function fixture(job){
 if(legacy.includes(job))return legacyOptimalPlayer(job);
 const filename=`../tests/fixtures/spirit-single-pet-optimal-210/${job}-210-sss-sigil8-optimal.json`;
 const saved=JSON.parse(readFileSync(new URL(filename,import.meta.url),'utf8'));
 return structuredClone(saved.player);
}
function storage(){const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,v)=>data.set(key,v),removeItem:key=>data.delete(key)};}
async function audit(job,kind){
 const c=await runtime(),p=fixture(job);
 c.localStorage=storage();p.location='dawnrift';p.offline={at:0,enabled:false};
 p.extremeRun={kind,floor:1,status:'active',startedAt:epoch,stageStartedAt:epoch,stageDamage:0,stageKills:0};
 const stageHp=kind==='clear'?Math.round(DAWN_MONSTERS[0].hp):Number.MAX_SAFE_INTEGER;
 const base=kind==='clear'?DAWN_MONSTERS[0]:DAWN_BOSS;
 const baseFoe={...base,id:base.id,name:'極限實戰目標',extremeKind:kind,
  boss:kind!=='clear',hp:stageHp,maxHp:stageHp,
  atk:kind==='atk'?Math.round(DAWN_BOSS.atk*.2):0,
  matk:kind==='matk'?Math.round((DAWN_BOSS.matk||DAWN_BOSS.atk)*.2):0,
  attackType:kind==='matk'?'magic':'physical',aspd:160,hit:100000,lastAttack:epoch,appearedAt:epoch,
  xp:0,gold:0,drops:[],instanceId:`audit-${kind}`};
 c.api.setup(p,baseFoe);c.api.setAutoForTest(true);
 const startGold=p.gold,startXp=p.xp;
 let maxHit=0,deathAt=null;
 const duration=kind==='atk'||kind==='matk'?20000:30000;
 for(let ms=0;ms<duration;ms+=100){
  c.setTime(epoch+ms);const before=p.hp;
  try{c.api.combatTick(epoch+ms);}catch(error){return {job,kind,error:String(error),ms};}
  maxHit=Math.max(maxHit,Math.max(0,before-p.hp));
  if(p.hp<=0||!p.extremeRun){deathAt=ms;break;}
 }
 return {job,kind,deathAt,alive:deathAt===null,maxHit,
  stageDamage:p.extremeRun?.stageDamage||0,stageKills:p.extremeRun?.stageKills||0,
  averageDps:Math.round((p.extremeRun?.stageDamage||0)/(duration/1000)),
  hpRemaining:p.hp,coinsEarned:p.extremeCoins||0,goldDelta:p.gold-startGold,xpDelta:p.xp-startXp};
}
const rows=[];
for(const job of originals)for(const kind of ['atk','matk','hp','clear']){
 const row=await audit(job,kind);rows.push(row);console.log(JSON.stringify(row));
}
console.log(JSON.stringify({summary:true,count:rows.length,failed:rows.filter(row=>row.error).length,
  survival:rows.filter(row=>['atk','matk'].includes(row.kind)&&row.alive).length,
  hpDps:rows.filter(row=>row.kind==='hp').map(row=>({job:row.job,dps:row.averageDps})),
  clearKills:rows.filter(row=>row.kind==='clear').map(row=>({job:row.job,kills:row.stageKills}))}));
