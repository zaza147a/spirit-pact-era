import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';

const input='docs/weapon-fusion-audit-sigil8-best-v6547.json';
const output='docs/weapon-boss-crowd-sigil8-v6547.json';
const source=JSON.parse(readFileSync(input));
if(source.completed!==138||source.conditions.sigil!==8)throw Error('Expected complete sigil-8 candidate inventory');
const existing=existsSync(output)?JSON.parse(readFileSync(output)):null;
const rows=existing?.conditions?.scenario==='bossCrowdTrial'&&existing?.conditions?.sigil===8?existing.rows:[];
const key=r=>`${r.job}/${r.weapon}/${r.offhand}/${r.pair}`;
const done=new Set(rows.map(key));
const tasks=source.rows.filter(r=>!done.has(key(r)));
let index=0;
function save(){writeFileSync(output,JSON.stringify({conditions:{level:210,gearLevel:200,petLevel:200,enhancement:'SSS',sigil:8,scenario:'bossCrowdTrial',targets:'201-region boss with four live regional normal monsters',seeds:[42,137,731],seconds:60,ranking:'victory rate, mean boss kill time (victories), then mean damage per actual combat second; source builds optimized for regional ordinary enemies, not reoptimized for boss crowd'},completed:rows.length,total:138,rows},null,2)+'\n');}
save();
await Promise.all(Array.from({length:4},async()=>{
 while(index<tasks.length){
  const task=tasks[index++];
  const value=await new Promise((resolve,reject)=>{
   const worker=new Worker(new URL('./optimized-dps-hypothesis-worker.mjs',import.meta.url));
   worker.once('error',reject);
   worker.once('message',async result=>{await worker.terminate();result.error?reject(Error(result.error)):resolve(result);});
   worker.postMessage({evaluation:true,job:task.job,pair:task.pair,cfg:task.cfg,forcedWeapon:{twoHandBonus:['twoStaff','spellFist'].includes(task.weapon)?1.10:1.15}});
  });
  const results=value.results;
  const wins=results.filter(r=>r.bossVictory);
  const mean=(items,fn)=>items.length?items.reduce((a,r)=>a+fn(r),0)/items.length:null;
  rows.push({...value,cardCandidate:task.cardCandidate,winCount:wins.length,winRate:wins.length/3,meanKillSeconds:mean(wins,r=>r.timeToKill),meanElapsed:mean(results,r=>r.elapsed),meanDps:mean(results,r=>r.damage/Math.max(.02,r.elapsed)),meanOwnerDps:mean(results,r=>r.ownerDamage/Math.max(.02,r.elapsed)),meanPetDps:mean(results,r=>r.petDamage/Math.max(.02,r.elapsed)),survivalRate:mean(results,r=>Number(r.alive)),meanPetDeaths:mean(results,r=>r.petDeaths)});
  save();
  console.log(`${rows.length}/138 ${task.job} ${task.weapon} ${task.pair} victories ${wins.length}/3 time ${mean(wins,r=>r.timeToKill)?.toFixed(2)??'-'}s`);
 }
}));
