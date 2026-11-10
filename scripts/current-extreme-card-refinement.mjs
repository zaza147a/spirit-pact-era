// Greedy one-slot boss-card sensitivity screen, using actual extreme trials.
// Not an exhaustive multi-card combination optimizer.
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {currentEndgamePlayer,WEAPON_VARIANTS} from '../tests/fixtures/current-210-endgame-player.mjs';
import {CARDS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';

const job=process.env.EXTREME_JOB;
assert.ok(WEAPON_VARIANTS[job]);
const modes=(process.env.EXTREME_MODES||'atk,matk,hp,clear').split(',');
assert.ok(modes.every(k=>['atk','matk','hp','clear'].includes(k)));
const first=JSON.parse(readFileSync(`docs/current-extreme-${job}-search-20261110.json`,'utf8'));
const defaultWeapon=currentEndgamePlayer(job).gear.rightHand.id;
const best=Object.fromEntries(modes.map(kind=>{
 const extra=JSON.parse(readFileSync(`docs/current-extreme-refine-${job}-${kind}-20261111.json`,'utf8'));
 const candidates=[first.best[kind],...extra.results];
 for(const weaponId of WEAPON_VARIANTS[job].filter(id=>id!==defaultWeapon)){
  const path=`docs/current-extreme-weapon-${job}-${weaponId.replaceAll('+','-')}-${kind}-20261111.json`;
  candidates.push(...JSON.parse(readFileSync(path,'utf8')).results);
 }
 return [kind,candidates.sort((a,b)=>b.highest-a.highest)[0]];
}));
const tasks=modes.flatMap(kind=>{
 const b=best[kind],p=currentEndgamePlayer(job,{fusion:b.fusion,weaponChoice:b.weaponChoice,attributeProfile:b.attributeProfile,weaponId:b.weaponId});
 return Object.entries(p.gear).filter(([,gear])=>!!gear).flatMap(([slot])=>Object.entries(CARDS)
  .filter(([id,c])=>c.boss&&id!==p.sockets[slot]&&cardAllowedInSlot(c,slot,job))
  .map(([cardId])=>({kind,slot,cardId})));
});
const concurrency=Math.max(1,Math.min(4,Number(process.env.EXTREME_CARD_CONCURRENCY||4)));
let cursor=0;
const filename=t=>`docs/current-extreme-card-${job}-${t.kind}-${t.slot}-${t.cardId}-20261111.json`;
function run(task){return new Promise((resolve,reject)=>{
 const b=best[task.kind];
 const proc=spawn(process.execPath,['scripts/current-extreme-candidate-search.mjs'],{
  env:{...process.env,EXTREME_JOB:job,EXTREME_WEAPON_ID:b.weaponId||'',
   EXTREME_FUSIONS:b.fusion,EXTREME_WEAPONS:b.weaponChoice,
   EXTREME_PROFILES:b.attributeProfile,EXTREME_MODES:task.kind,
   EXTREME_CARD_SLOT:task.slot,EXTREME_CARD_ID:task.cardId,
   EXTREME_CONCURRENCY:'1',EXTREME_OUTPUT:filename(task)},
  stdio:['ignore','pipe','pipe']});
 let error='';proc.stderr.on('data',chunk=>error+=chunk);
 proc.stdout.on('data',()=>{});
 proc.on('error',reject);
 proc.on('exit',code=>{
  if(code)return reject(Error(`${job}/${task.kind}/${task.slot}/${task.cardId}: ${error}`));
  try{
   const report=JSON.parse(readFileSync(filename(task),'utf8'));
   assert.equal(report.completed,1);
   const result=report.results[0];
   assert.ok(result.stopped==='first-failure'&&result.cardSlot===task.slot&&result.cardId===task.cardId);
   console.log(JSON.stringify({job,...task,highest:result.highest,baseline:b.highest}));
   resolve();
  }catch(e){reject(e);}
 });
});}
async function worker(){while(cursor<tasks.length)await run(tasks[cursor++]);}
await Promise.all(Array.from({length:Math.min(concurrency,tasks.length)},worker));
const winners=Object.fromEntries(modes.map(kind=>[kind,[best[kind],...tasks.filter(t=>t.kind===kind).map(t=>JSON.parse(readFileSync(filename(t),'utf8')).results[0])].sort((a,b)=>b.highest-a.highest)[0]]));
console.log(JSON.stringify({complete:true,job,tasks:tasks.length,winners}));
